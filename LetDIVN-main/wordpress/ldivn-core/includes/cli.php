<?php
// wp ldivn import: brings the site's content (the Decap JSON files in
// content/, their images in public/) into WordPress. Safe to run again: it
// updates what it created before, so it also syncs the latest content at
// switch-over time.

defined('ABSPATH') || exit;

class LDIVN_Importer
{
    private string $src;
    private string $live;
    private array $mediaCache = [];

    public function __construct(string $src, string $live)
    {
        $this->src = rtrim(str_replace('\\', '/', $src), '/');
        $this->live = rtrim($live, '/');
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        // Keep the original photos as they are (no "-scaled" copies), and only
        // the small sizes the admin shows.
        add_filter('big_image_size_threshold', '__return_false');
        add_filter('intermediate_image_sizes_advanced', fn($sizes) => array_intersect_key($sizes, array_flip(['thumbnail', 'medium'])));
        add_filter('upload_mimes', fn($m) => $m + ['svg' => 'image/svg+xml']);
        add_filter('wp_check_filetype_and_ext', function ($data, $file, $filename) {
            if (str_ends_with(strtolower($filename), '.svg')) {
                return ['ext' => 'svg', 'type' => 'image/svg+xml', 'proper_filename' => false];
            }
            return $data;
        }, 10, 3);
    }

    public function run(): void
    {
        if (!is_dir($this->src . '/content')) {
            WP_CLI::error("Không thấy {$this->src}/content");
        }
        $this->settings();
        $this->pages();
        ldivn_register_field_groups();
        $this->news();
        $this->pageContent();
        $this->projects();
        foreach (array_keys(LDIVN_TYPES) as $collection) {
            $this->entries($collection);
        }
        if ($this->live) {
            $this->liveData();
        }
        $this->seo();
        flush_rewrite_rules();
        ldivn_flush_cache();
        WP_CLI::success('Đã nhập xong.');
    }

    private function json(string $file): ?array
    {
        if (!is_file($file)) {
            return null;
        }
        $data = json_decode(file_get_contents($file), true);
        return is_array($data) ? $this->nfc($data) : null;
    }

    /** Some texts have their Vietnamese accents as separate combining marks, which the editor shows apart ("biể n"). */
    private function nfc($value)
    {
        if (is_array($value)) {
            return array_map([$this, 'nfc'], $value);
        }
        return is_string($value) && class_exists('Normalizer') ? (Normalizer::normalize($value, Normalizer::FORM_C) ?: $value) : $value;
    }

    // --- Media --------------------------------------------------------------------

    /** Image/file path (/images/...) or URL -> attachment id, importing it once. */
    public function media(string $path): int
    {
        $path = trim($path);
        if ($path === '') {
            return 0;
        }
        if (isset($this->mediaCache[$path])) {
            return $this->mediaCache[$path];
        }
        $existing = get_posts(['post_type' => 'attachment', 'post_status' => 'inherit', 'meta_key' => '_ldivn_src', 'meta_value' => $path, 'fields' => 'ids', 'numberposts' => 1]);
        if ($existing) {
            return $this->mediaCache[$path] = (int) $existing[0];
        }

        $urlPath = (string) parse_url($path, PHP_URL_PATH);
        $dir = basename(dirname($urlPath));
        $name = ($dir !== '' && !in_array($dir, ['images', 'uploads', '.', '/'], true) && !preg_match('/^\d+$/', $dir) ? $dir . '-' : '') . basename($urlPath);
        if (str_starts_with($path, '/')) {
            $file = $this->src . '/public' . rawurldecode($urlPath);
            if (!is_file($file)) {
                WP_CLI::warning("Thiếu file $path");
                return $this->mediaCache[$path] = 0;
            }
            $tmp = wp_tempnam($name);
            copy($file, $tmp);
        } elseif (preg_match('~^https?://~', $path)) {
            $tmp = download_url($path, 120);
            if (is_wp_error($tmp)) {
                WP_CLI::warning("Không tải được $path: " . $tmp->get_error_message());
                return $this->mediaCache[$path] = 0;
            }
        } else {
            return 0;
        }
        // Addresses without a file extension (e.g. Unsplash photos): name the file by its real type.
        if (!preg_match('/\.(jpe?g|png|gif|webp|avif|svg|pdf)$/i', $name)) {
            $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp', 'image/avif' => 'avif'][wp_get_image_mime($tmp) ?: ''] ?? '';
            $name = sanitize_title(basename($urlPath)) . ($ext ? ".$ext" : '');
        }
        $id = media_handle_sideload(['name' => sanitize_file_name(rawurldecode($name)), 'tmp_name' => $tmp], 0);
        if (is_wp_error($id)) {
            @unlink($tmp);
            WP_CLI::warning("Không nhập được $path: " . $id->get_error_message());
            return $this->mediaCache[$path] = 0;
        }
        update_post_meta($id, '_ldivn_src', $path);
        return $this->mediaCache[$path] = (int) $id;
    }

    private function postBySlug(string $slug): int
    {
        $found = get_posts(['post_type' => 'post', 'name' => $slug, 'post_status' => 'any', 'fields' => 'ids', 'numberposts' => 1]);
        return $found ? (int) $found[0] : 0;
    }

    private function existing(string $type, string $slug): int
    {
        $found = get_posts(['post_type' => $type, 'name' => $slug, 'post_status' => 'any', 'fields' => 'ids', 'numberposts' => 1, 'suppress_filters' => true]);
        return $found ? (int) $found[0] : 0;
    }

    private function updateFields(string $path, array $values, $target): void
    {
        foreach ($values as $name => $value) {
            update_field(ldivn_field_key("$path/$name"), $value, $target);
        }
    }

    // --- Site settings ------------------------------------------------------------

    private function settings(): void
    {
        update_option('blogname', 'Lets Do It Vietnam');
        update_option('blogdescription', 'People for Clean Planet');
        update_option('timezone_string', 'Asia/Ho_Chi_Minh');
        update_option('date_format', 'd/m/Y');
        update_option('time_format', 'H:i');
        update_option('start_of_week', 1);
        update_option('default_comment_status', 'closed');
        update_option('default_ping_status', 'closed');
        global $wp_rewrite;
        $wp_rewrite->set_permalink_structure('/news/%postname%/');

        // WordPress's sample content.
        foreach ([['post', 'hello-world'], ['page', 'sample-page'], ['page', 'privacy-policy']] as [$type, $slug]) {
            $id = $this->existing($type, $slug);
            if ($id && !get_post_meta($id, '_ldivn_imported', true)) {
                wp_delete_post($id, true);
            }
        }

        // News categories; "Uncategorized" becomes "News", the default.
        $default = (int) get_option('default_category');
        $term = get_term($default, 'category');
        if ($term && $term->slug === 'uncategorized') {
            wp_update_term($default, 'category', ['name' => 'News', 'slug' => 'news']);
        }
        foreach (['News', 'Media On Us', 'Press Release', 'Impact Story'] as $name) {
            if (!term_exists($name, 'category')) {
                wp_insert_term($name, 'category');
            }
        }
        WP_CLI::log('Cài đặt chung: xong');
    }

    // --- Pages --------------------------------------------------------------------

    private function ensurePage(string $key, string $title, string $slug): int
    {
        $ids = get_option('ldivn_pages', []);
        $id = (int) ($ids[$key] ?? 0);
        if (!$id || !get_post($id)) {
            $page = get_page_by_path($slug);
            $id = $page ? $page->ID : (int) wp_insert_post([
                'post_type' => 'page',
                'post_status' => 'publish',
                'post_title' => $title,
                'post_name' => $slug,
                'comment_status' => 'closed',
            ]);
            update_post_meta($id, '_ldivn_imported', 1);
            $ids[$key] = $id;
            update_option('ldivn_pages', $ids);
        }
        return $id;
    }

    private function pages(): void
    {
        foreach (LDIVN_PAGES as $key => $page) {
            $this->ensurePage($key, $page['title'], $page['slug']);
        }
        foreach (ldivn_collection('projects')['files'] as $file) {
            $doc = $this->json("{$this->src}/content/project-pages/{$file['name']}.json") ?? [];
            $this->ensurePage('project:' . $file['name'], $doc['title'] ?? $file['name'], $file['name']);
        }
        update_option('show_on_front', 'page');
        update_option('page_on_front', ldivn_page_id('home'));
        update_option('page_for_posts', 0);
        WP_CLI::log('Các trang: xong');
    }

    private function pageContent(): void
    {
        $media = fn($p) => $this->media($p);
        $post = fn($s) => $this->postBySlug((string) $s);
        foreach (ldivn_collection('pages')['files'] as $file) {
            $doc = $this->json("{$this->src}/content/page-content/{$file['name']}.json");
            if ($doc === null) {
                continue;
            }
            $page = LDIVN_PAGE_FILES[$file['name']] ?? null;
            $target = $page ? ldivn_page_id($page) : 'option';
            update_field(ldivn_field_key('pages/' . $file['name']), ldivn_doc_in($file['fields'], $doc, $media, $post), $target);
        }
        WP_CLI::log('Chữ & ảnh các trang: xong');
    }

    private function projects(): void
    {
        $media = fn($p) => $this->media($p);
        $post = fn($s) => $this->postBySlug((string) $s);
        foreach (ldivn_collection('projects')['files'] as $file) {
            $doc = $this->json("{$this->src}/content/project-pages/{$file['name']}.json");
            if ($doc === null) {
                continue;
            }
            $id = ldivn_page_id('project:' . $file['name']);
            wp_update_post(['ID' => $id, 'post_title' => $doc['title'] ?? $file['name']]);
            update_post_meta($id, 'ldivn_category', $doc['category'] ?? '');
            $this->updateFields('projects', ldivn_doc_in($file['fields'], $doc, $media, $post, ['title']), $id);
        }
        WP_CLI::log('Trang dự án: xong');
    }

    // --- News ----------------------------------------------------------------------

    private function blocksToHtml(array $blocks): string
    {
        $parts = [];
        foreach ($blocks as $b) {
            $value = (string) ($b['value'] ?? '');
            if ($value === '') {
                continue;
            }
            if (($b['type'] ?? '') === 'image') {
                $id = $this->media($value);
                $meta = $id ? wp_get_attachment_metadata($id) : [];
                $parts[] = sprintf(
                    '<img class="alignnone size-full%s" src="%s" alt="" width="%d" height="%d" />',
                    $id ? " wp-image-$id" : '',
                    esc_url($id ? wp_get_attachment_url($id) : $value),
                    (int) ($meta['width'] ?? 0),
                    (int) ($meta['height'] ?? 0)
                );
            } elseif (($b['type'] ?? '') === 'html') {
                // Kept together as one block (see ldivn_content_blocks()).
                $parts[] = '<div class="ldivn-html">' . $value . '</div>';
            } else {
                // One paragraph per text block, its line breaks as <br />, so the
                // blocks come back exactly as they were.
                $parts[] = '<p>' . str_replace("\n", "<br />\n", htmlspecialchars($value, ENT_NOQUOTES, 'UTF-8')) . '</p>';
            }
        }
        return implode("\n\n", $parts);
    }

    private function news(): void
    {
        $fields = ldivn_collection('news')['fields'];
        $media = fn($p) => $this->media($p);
        $post = fn($s) => $this->postBySlug((string) $s);
        $files = glob("{$this->src}/content/news/*.json");
        $slugs = [];
        foreach ($files as $i => $file) {
            $slug = basename($file, '.json');
            $slugs[] = $slug;
            $d = $this->json($file);
            if (!$d) {
                continue;
            }
            $category = get_term_by('name', $d['category'] ?? 'News', 'category') ?: get_term_by('slug', 'news', 'category');
            $id = wp_insert_post([
                'ID' => $this->postBySlug($slug),
                'post_type' => 'post',
                'post_name' => $slug,
                'post_title' => (string) ($d['title'] ?? $slug),
                'post_excerpt' => (string) ($d['summary'] ?? ''),
                'post_content' => $this->blocksToHtml($d['contentBlocks'] ?? []),
                'post_status' => ($d['status'] ?? '') === 'Pending' ? 'pending' : 'publish',
                'post_date' => (preg_match('/^\d{4}-\d{2}-\d{2}/', $d['date'] ?? '') ? substr($d['date'], 0, 10) : gmdate('Y-m-d')) . ' 08:00:00',
                'edit_date' => true,
                'post_category' => $category ? [$category->term_id] : [],
                'tags_input' => array_values(array_filter(array_map('strval', (array) ($d['tags'] ?? [])))),
                'comment_status' => 'closed',
            ], true);
            if (is_wp_error($id)) {
                WP_CLI::warning("Bài $slug: " . $id->get_error_message());
                continue;
            }
            update_post_meta($id, '_ldivn_imported', 1);
            update_post_meta($id, '_ldivn_id', ($d['id'] ?? '') ?: "news-$slug");
            $thumb = $this->media((string) ($d['image'] ?? ''));
            $thumb ? set_post_thumbnail($id, $thumb) : delete_post_thumbnail($id);
            $this->updateFields('news', ldivn_doc_in($fields, $d, $media, $post, LDIVN_NEWS_NATIVE), $id);
            foreach (['seoTitle' => '_yoast_wpseo_title', 'seoDescription' => '_yoast_wpseo_metadesc', 'seoKeyphrase' => '_yoast_wpseo_focuskw'] as $from => $key) {
                ($d[$from] ?? '') !== '' ? update_post_meta($id, $key, $d[$from]) : delete_post_meta($id, $key);
            }
            WP_CLI::log(sprintf('Tin tức %d/%d: %s', $i + 1, count($files), $slug));
        }
        $this->removeGone('post', $slugs);
    }

    // --- Lists -----------------------------------------------------------------------

    private function entries(string $collection): void
    {
        $c = ldivn_collection($collection);
        $type = LDIVN_TYPES[$collection];
        $media = fn($p) => $this->media($p);
        $post = fn($s) => $this->postBySlug((string) $s);
        $slugs = [];
        foreach (glob("{$this->src}/content/$collection/*.json") ?: [] as $file) {
            $slug = basename($file, '.json');
            $slugs[] = $slug;
            $d = $this->json($file);
            if (!$d) {
                continue;
            }
            $postarr = [
                'ID' => $this->existing($type, $slug),
                'post_type' => $type,
                'post_status' => 'publish',
                'post_name' => $slug,
                'post_title' => (string) ($d[$c['identifier_field']] ?? $slug),
                'menu_order' => (int) ($d['order'] ?? 0),
            ];
            if ($collection === 'videos' && !empty($d['addedAt']) && strtotime($d['addedAt'])) {
                $postarr['post_date'] = wp_date('Y-m-d H:i:s', strtotime($d['addedAt']));
                $postarr['edit_date'] = true;
            }
            $id = wp_insert_post($postarr, true);
            if (is_wp_error($id)) {
                WP_CLI::warning("$collection/$slug: " . $id->get_error_message());
                continue;
            }
            update_post_meta($id, '_ldivn_imported', 1);
            update_post_meta($id, '_ldivn_id', ($d['id'] ?? '') ?: LDIVN_ID_PREFIX[$collection] . "-$slug");
            if ($collection === 'videos' && !empty($d['addedAt'])) {
                update_post_meta($id, '_ldivn_added_at', $d['addedAt']);
            }
            $this->updateFields($collection, ldivn_doc_in($c['fields'], $d, $media, $post, [$c['identifier_field'], 'order']), $id);
        }
        $this->removeGone($type, $slugs);
        WP_CLI::log(sprintf('%s: %d mục', $c['label'], count($slugs)));
    }

    /** Entries imported earlier whose file was since deleted in Decap go to the trash. */
    private function removeGone(string $type, array $slugs): void
    {
        foreach (get_posts(['post_type' => $type, 'post_status' => 'any', 'numberposts' => -1, 'meta_key' => '_ldivn_imported', 'meta_value' => '1']) as $p) {
            if (!in_array($p->post_name, $slugs, true)) {
                wp_trash_post($p->ID);
                WP_CLI::log("Bỏ vào thùng rác: $type/{$p->post_name}");
            }
        }
    }

    // --- Data only the live site has ------------------------------------------------------

    private function liveJson(string $path)
    {
        $res = wp_remote_get($this->live . $path, ['timeout' => 30]);
        if (is_wp_error($res) || wp_remote_retrieve_response_code($res) !== 200) {
            WP_CLI::warning("Không đọc được {$this->live}$path");
            return null;
        }
        return json_decode(wp_remote_retrieve_body($res), true);
    }

    private function liveData(): void
    {
        // Sign-up counts of the events (volunteers who signed up on the old site).
        foreach ((array) $this->liveJson('/api/events') as $event) {
            $found = get_posts(['post_type' => 'ldivn_event', 'post_status' => 'any', 'meta_key' => '_ldivn_id', 'meta_value' => $event['id'] ?? '', 'fields' => 'ids', 'numberposts' => 1]);
            if ($found) {
                update_post_meta($found[0], '_ldivn_registered_base', (int) ($event['registeredCount'] ?? 0));
            }
        }
        // Image crop positions set with the old on-page editor.
        $legacy = [];
        foreach ((array) $this->liveJson('/api/content') as $key => $value) {
            if (str_ends_with($key, '__position')) {
                $legacy[$key] = $value;
            }
        }
        update_option('ldivn_legacy_content', $legacy);
        WP_CLI::log('Dữ liệu từ website đang chạy: xong');
    }

    /** Volunteers and contact messages exported from the old site's database (JSON: {volunteers: [...], contacts: [...]}). */
    public function submissions(string $file): void
    {
        $data = $this->json($file) ?? [];
        foreach (['volunteers' => 'ldivn_volunteer', 'contacts' => 'ldivn_contact'] as $key => $type) {
            $n = 0;
            foreach ($data[$key] ?? [] as $row) {
                $oldId = (string) ($row['id'] ?? '');
                if ($oldId === '' || get_posts(['post_type' => $type, 'post_status' => 'any', 'meta_key' => '_ldivn_id', 'meta_value' => $oldId, 'fields' => 'ids', 'numberposts' => 1])) {
                    continue;
                }
                $when = strtotime($row['registeredAt'] ?? $row['createdAt'] ?? '') ?: time();
                $id = wp_insert_post([
                    'post_type' => $type,
                    'post_status' => 'private',
                    'post_title' => (string) ($row['fullName'] ?? $row['name'] ?? '(không tên)'),
                    'post_date' => wp_date('Y-m-d H:i:s', $when),
                ]);
                update_post_meta($id, '_ldivn_id', $oldId);
                update_post_meta($id, '_ldivn_migrated', 1);
                update_post_meta($id, 'ldivn_data', wp_slash(wp_json_encode($row, JSON_UNESCAPED_UNICODE)));
                update_post_meta($id, 'event_id', (string) ($row['eventId'] ?? ''));
                $n++;
            }
            WP_CLI::log("$key: thêm $n");
        }
        ldivn_flush_cache();
    }

    // --- SEO (Yoast) and site icon -----------------------------------------------------------

    private function seo(): void
    {
        $icon = $this->media('/favicon-192.png');
        if ($icon) {
            update_option('site_icon', $icon);
        }
        $logo = $this->media('/logo.png');
        $description = "Let's Do It Vietnam is the World Cleanup Day movement in Vietnam, bringing volunteers, partners and communities together for a clean planet.";
        $home = ldivn_page_id('home');
        update_post_meta($home, '_yoast_wpseo_title', '%%sitename%% %%sep%% %%sitedesc%%');
        update_post_meta($home, '_yoast_wpseo_metadesc', $description);

        if (class_exists('WPSEO_Options')) {
            $settings = [
                'separator' => 'sc-ndash',
                'website_name' => 'Lets Do It Vietnam',
                'alternate_website_name' => "Let's Do It! Vietnam",
                'company_or_person' => 'company',
                'company_name' => 'Lets Do It Vietnam',
                'company_logo' => $logo ? wp_get_attachment_url($logo) : '',
                'company_logo_id' => $logo,
                'og_default_image' => $logo ? wp_get_attachment_url($logo) : '',
                'og_default_image_id' => $logo,
                'disable-author' => true,
                'disable-date' => true,
                'disable-attachment' => true,
                'metadesc-home-wpseo' => $description,
                'open_graph_frontpage_desc' => $description,
            ];
            foreach ($settings as $key => $value) {
                WPSEO_Options::set($key, $value);
            }
            WPSEO_Options::set('facebook_site', 'https://www.facebook.com/LetsDoItVietNam');
            WPSEO_Options::set('other_social_urls', ['https://www.instagram.com/letsdoitvietnam/', 'https://letsdoitvietnam.org/']);
        }
        WP_CLI::log('SEO & biểu tượng: xong');
    }
}

/**
 * Nội dung của website Let's Do It Vietnam.
 */
class LDIVN_CLI
{
    /**
     * Nhập nội dung từ thư mục LetDIVN-main (content/ và public/).
     *
     * ## OPTIONS
     *
     * --src=<dir>
     * : Thư mục LetDIVN-main của repo.
     *
     * [--live=<url>]
     * : Website đang chạy, để lấy số người đã đăng ký từng sự kiện.
     *
     * [--submissions=<file>]
     * : File JSON {volunteers, contacts} xuất từ database của website cũ.
     */
    public function import($args, $assoc): void
    {
        $importer = new LDIVN_Importer($assoc['src'], $assoc['live'] ?? '');
        $importer->run();
        if (!empty($assoc['submissions'])) {
            $importer->submissions($assoc['submissions']);
        }
    }
}

WP_CLI::add_command('ldivn', 'LDIVN_CLI');
