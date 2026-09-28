<?php
// The content the site reads, built from WordPress in exactly the shape the
// Node server served it (a port of server/cmsContent.ts), so the site's code
// doesn't change.

defined('ABSPATH') || exit;

function ldivn_str($v): string
{
    return is_string($v) ? $v : ($v === null || is_array($v) ? '' : (is_bool($v) ? ($v ? 'true' : '') : (string) $v));
}

function ldivn_num($v, $fallback = 0)
{
    return is_numeric($v) ? $v + 0 : $fallback;
}

function ldivn_text(string $s): string
{
    return html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function ldivn_youtube_id(string $url): string
{
    $url = trim($url);
    if (preg_match('~(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([a-zA-Z0-9_-]{11})~', $url, $m)) {
        return $m[1];
    }
    return preg_match('/^[\w-]{11}$/', $url) ? $url : '';
}

/** Drops null values, like JSON.stringify drops undefined. */
function ldivn_compact(array $a): array
{
    return array_filter($a, fn($v) => $v !== null);
}

// --- Lists ------------------------------------------------------------------------------

/** A list entry as its Decap JSON doc: the SCF fields plus title/name, order, id and slug. */
function ldivn_entry_doc(string $collection, WP_Post $p): array
{
    $c = ldivn_collection($collection);
    $doc = ldivn_doc_out($c['fields'], get_fields($p->ID) ?: []);
    $doc[$c['identifier_field']] = ldivn_text($p->post_title);
    $doc['order'] = (int) $p->menu_order;
    $doc['id'] = get_post_meta($p->ID, '_ldivn_id', true) ?: LDIVN_ID_PREFIX[$collection] . '-' . $p->ID;
    $doc['_post'] = $p;
    return $doc;
}

/** Published entries of a list, in the site's order ("Thứ tự", then address). */
function ldivn_entries(string $collection): array
{
    $posts = get_posts([
        'post_type' => LDIVN_TYPES[$collection],
        'post_status' => 'publish',
        'numberposts' => -1,
        'orderby' => ['menu_order' => 'ASC', 'name' => 'ASC'],
        'suppress_filters' => true,
    ]);
    return array_map(fn($p) => ldivn_entry_doc($collection, $p), $posts);
}

function ldivn_list(string $collection, callable $map): array
{
    return array_map(function ($doc) use ($map) {
        return ldivn_compact($map($doc)) + ['id' => ldivn_str($doc['id']), 'slug' => $doc['_post']->post_name];
    }, ldivn_entries($collection));
}

function ldivn_get_videos(): array
{
    $videos = ldivn_list('videos', function ($doc) {
        $id = ldivn_youtube_id(ldivn_str($doc['youtube'] ?? ''));
        $added = get_post_meta($doc['_post']->ID, '_ldivn_added_at', true);
        return [
            'youtubeId' => $id,
            'title' => ldivn_str($doc['title']),
            'thumbnailUrl' => $id ? "https://img.youtube.com/vi/$id/hqdefault.jpg" : '',
            'addedAt' => $added ?: get_post_time('c', true, $doc['_post']),
        ];
    });
    return array_values(array_filter($videos, fn($v) => $v['youtubeId'] !== ''));
}

function ldivn_get_partners(): array
{
    return ldivn_list('partners', fn($doc) => [
        'name' => ldivn_str($doc['name']),
        'tier' => ldivn_str($doc['tier'] ?? '') ?: 'Community',
        'logo' => ldivn_str($doc['logo'] ?? ''),
        'website' => ldivn_str($doc['website'] ?? ''),
        'type' => ldivn_str($doc['type'] ?? ''),
        'description' => ldivn_str($doc['description'] ?? ''),
        'joinedYear' => ldivn_num($doc['joinedYear'] ?? null, (int) gmdate('Y')),
        'scale' => isset($doc['scale']) && $doc['scale'] !== null && $doc['scale'] !== '' ? ldivn_num($doc['scale'], 100) : null,
    ]);
}

function ldivn_get_team(): array
{
    return ldivn_list('team', fn($doc) => [
        'name' => ldivn_str($doc['name']),
        'role' => ldivn_str($doc['role'] ?? ''),
        'department' => ldivn_str($doc['department'] ?? ''),
        'avatar' => ldivn_str($doc['avatar'] ?? ''),
        'bio' => ldivn_str($doc['bio'] ?? ''),
        'linkedin' => ldivn_str($doc['linkedin'] ?? '') ?: null,
        'facebook' => ldivn_str($doc['facebook'] ?? '') ?: null,
        'email' => ldivn_str($doc['email'] ?? '') ?: null,
    ]);
}

function ldivn_get_image_text_list(string $collection): array
{
    return ldivn_list($collection, fn($doc) => [
        'title' => ldivn_str($doc['title']),
        'desc' => ldivn_str($doc['desc'] ?? ''),
        'image' => ldivn_str($doc['image'] ?? ''),
        'layout' => ($doc['layout'] ?? '') === 'image-right' ? 'image-right' : 'image-left',
        'order' => (int) $doc['order'],
    ]);
}

function ldivn_get_media_coverage(): array
{
    return ldivn_list('media-coverage', fn($doc) => [
        'title' => ldivn_str($doc['title']),
        'articleCount' => ldivn_num($doc['articleCount'] ?? null),
        'segmentCount' => ldivn_num($doc['segmentCount'] ?? null),
        'image' => ldivn_str($doc['image'] ?? ''),
        'pdfUrl' => ldivn_str($doc['pdfUrl'] ?? ''),
        'order' => (int) $doc['order'],
    ]);
}

// --- News ---------------------------------------------------------------------------------

/**
 * The article body as the site's content blocks: each photo on its own line
 * is an image block (shown full width), each plain paragraph a text block,
 * and anything formatted (headings, lists, bold, links) an html block —
 * consecutive formatted elements together, or a <div class="ldivn-html">
 * (an html block brought over from the old site) as it is.
 */
function ldivn_content_blocks(string $raw): array
{
    // The classic editor saves paragraphs as blank lines (wpautop adds the <p>s);
    // articles brought over from the old site already have them.
    $html = trim(do_shortcode(preg_match('/<p[\s>]/i', $raw) ? $raw : wpautop($raw)));
    if ($html === '') {
        return [];
    }
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8"><body>' . $html . '</body>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    $body = $dom->getElementsByTagName('body')->item(0);

    $blocks = [];
    $mergeHtml = false;
    foreach (iterator_to_array($body->childNodes) as $node) {
        if ($node->nodeType === XML_TEXT_NODE) {
            if (trim($node->textContent) !== '') {
                $blocks[] = ['type' => 'text', 'value' => trim($node->textContent)];
                $mergeHtml = false;
            }
            continue;
        }
        if ($node->nodeType !== XML_ELEMENT_NODE) {
            continue;
        }
        $inner = '';
        foreach ($node->childNodes as $child) {
            $inner .= $dom->saveHTML($child);
        }
        if ($node->nodeName === 'div' && preg_match('/\bldivn-html\b/', $node->getAttribute('class'))) {
            $blocks[] = ['type' => 'html', 'value' => trim($inner)];
            $mergeHtml = false;
            continue;
        }
        $images = $node->nodeName === 'img' ? [$node] : iterator_to_array($node->getElementsByTagName('img'));
        if (count($images) > 0 && trim($node->textContent) === '' && in_array($node->nodeName, ['img', 'p', 'figure', 'div', 'a'], true)) {
            foreach ($images as $img) {
                $blocks[] = ['type' => 'image', 'value' => $img->getAttribute('src')];
            }
            $mergeHtml = false;
            continue;
        }
        if ($node->nodeName === 'p' && !preg_match('/<(?!br\b)[a-z]/i', $inner)) {
            $text = preg_replace('~<br\s*/?>[ \t]*\n?~i', "\n", $inner);
            $blocks[] = ['type' => 'text', 'value' => ldivn_text(strip_tags($text))];
            $mergeHtml = false;
            continue;
        }
        if ($mergeHtml) {
            $blocks[count($blocks) - 1]['value'] .= "\n" . $dom->saveHTML($node);
        } else {
            $blocks[] = ['type' => 'html', 'value' => $dom->saveHTML($node)];
            $mergeHtml = true;
        }
    }
    return $blocks;
}

function ldivn_html_to_text(string $html): string
{
    $s = preg_replace('~<br\s*/?>~i', "\n", $html);
    $s = preg_replace('~</(p|div|h[1-6]|li|blockquote)>~i', "\n\n", $s);
    $s = ldivn_text(strip_tags($s));
    return trim(preg_replace("/\n{3,}/", "\n\n", $s));
}

/** Yoast's own title/description for a post, unless it is a template (%%title%%). */
function ldivn_yoast_meta(int $id, string $key): ?string
{
    $v = (string) get_post_meta($id, $key, true);
    return $v !== '' && !str_contains($v, '%%') ? $v : null;
}

function ldivn_news_item(WP_Post $p): array
{
    $blocks = ldivn_content_blocks($p->post_content);
    $cats = get_the_category($p->ID);
    $fields = get_fields($p->ID) ?: [];
    $tags = wp_get_post_tags($p->ID, ['fields' => 'names']);
    return ldivn_compact([
        'id' => get_post_meta($p->ID, '_ldivn_id', true) ?: 'post-' . $p->ID,
        'slug' => $p->post_name,
        'title' => ldivn_text($p->post_title),
        'category' => $cats ? ldivn_text($cats[0]->name) : 'News',
        'summary' => $p->post_excerpt,
        'content' => implode("\n\n", array_map(
            fn($b) => $b['type'] === 'html' ? ldivn_html_to_text($b['value']) : $b['value'],
            array_values(array_filter($blocks, fn($b) => $b['type'] !== 'image'))
        )),
        'contentBlocks' => $blocks,
        'author' => ldivn_str($fields['author'] ?? ''),
        'date' => mysql2date('Y-m-d', $p->post_date),
        'image' => (string) get_the_post_thumbnail_url($p, 'full'),
        'source' => ldivn_str($fields['source'] ?? '') ?: null,
        'sourceUrl' => ldivn_str($fields['sourceUrl'] ?? '') ?: null,
        'views' => 0,
        'featured' => !empty($fields['featured']),
        'status' => 'Published',
        'tags' => $tags ?: null,
        'seoTitle' => ldivn_yoast_meta($p->ID, '_yoast_wpseo_title'),
        'seoDescription' => ldivn_yoast_meta($p->ID, '_yoast_wpseo_metadesc'),
    ]);
}

function ldivn_get_news(): array
{
    $posts = get_posts([
        'post_type' => 'post',
        'post_status' => 'publish',
        'numberposts' => -1,
        'orderby' => 'date',
        'order' => 'DESC',
        'suppress_filters' => true,
    ]);
    return array_map('ldivn_news_item', $posts);
}

// --- Project story pages -------------------------------------------------------------------

function ldivn_get_project_pages(): array
{
    $fields = ldivn_collection('projects')['files'][0]['fields'];
    $strList = fn($v) => array_values(array_filter(array_map('ldivn_str', is_array($v) ? $v : []), fn($s) => trim($s) !== ''));
    $aspect = fn($v) => in_array($v, ['3/2', '4/3', '7/2', 'square'], true) ? $v : null;

    $pages = [];
    foreach (ldivn_project_pages() as $id) {
        $post = get_post($id);
        if (!$post || $post->post_status !== 'publish') {
            continue;
        }
        $doc = ldivn_doc_out($fields, get_fields($id) ?: []);
        $category = (string) get_post_meta($id, 'ldivn_category', true);
        if ($category === '') {
            continue;
        }
        $sections = array_map(fn($s) => ldivn_compact([
            'heading' => ldivn_str($s['heading'] ?? '') ?: null,
            'headingAsTitle' => !empty($s['headingAsTitle']) ? true : null,
            'paragraphs' => $strList($s['paragraphs'] ?? []),
            'bulletList' => !empty($s['bulletList']),
            'textAlign' => in_array($s['textAlign'] ?? '', ['left', 'center', 'justify'], true) ? $s['textAlign'] : null,
            'image' => ldivn_str($s['image'] ?? '') ?: null,
            'gallery' => $strList($s['gallery'] ?? []),
            'galleryAspect' => $aspect($s['galleryAspect'] ?? ''),
            'columns' => array_map(fn($c) => ldivn_compact([
                'heading' => ldivn_str($c['heading'] ?? '') ?: null,
                'paragraphs' => $strList($c['paragraphs'] ?? []),
            ]), $s['columns'] ?? []),
            'subBlocks' => array_map(fn($b) => ldivn_compact([
                'title' => ldivn_str($b['title'] ?? ''),
                'text' => ldivn_str($b['text'] ?? ''),
                'gallery' => $strList($b['gallery'] ?? []),
                'galleryAspect' => $aspect($b['galleryAspect'] ?? ''),
            ]), $s['subBlocks'] ?? []),
            'closingParagraphs' => $strList($s['closingParagraphs'] ?? []),
            'closingBulletsLabel' => ldivn_str($s['closingBulletsLabel'] ?? '') ?: null,
            'closingBullets' => $strList($s['closingBullets'] ?? []),
            'band' => in_array($s['band'] ?? '', ['gray', 'white'], true) ? $s['band'] : null,
            'personListItem' => ldivn_str($s['personListItem'] ?? '') ?: null,
        ]), $doc['sections'] ?? []);

        $pages[$category] = ldivn_compact([
            'category' => $category,
            'hero' => ldivn_str($doc['hero'] ?? ''),
            'heroPosition' => ldivn_str($doc['heroPosition'] ?? '') ?: null,
            'kicker' => ldivn_str($doc['kicker'] ?? '') ?: null,
            'title' => ldivn_text($post->post_title),
            'titleColor' => ldivn_str($doc['titleColor'] ?? '') ?: null,
            'sections' => $sections,
        ]);
    }
    return $pages;
}

// --- Page text and images --------------------------------------------------------------------

/**
 * Every EditableText / EditableImage value as { contentKey: value }, e.g.
 * "whoWeAre.heroTitle". Image lists come back as a JSON array string; empty
 * fields are left out so the page falls back to the text built into the code.
 */
function ldivn_get_page_content(): array
{
    $out = [];
    $walk = function (string $key, $value) use (&$walk, &$out) {
        if (is_array($value) && array_is_list($value)) {
            $list = array_values(array_filter(array_map('ldivn_str', $value), fn($s) => $s !== ''));
            if ($list) {
                $out[$key] = wp_json_encode($list, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            }
        } elseif (is_array($value)) {
            foreach ($value as $name => $child) {
                $walk("$key.$name", $child);
            }
        } elseif (trim(ldivn_str($value)) !== '') {
            $out[$key] = ldivn_str($value);
        }
    };

    foreach ((array) get_option('ldivn_legacy_content', []) as $key => $value) {
        $out[$key] = $value;
    }
    foreach (ldivn_collection('pages')['files'] as $file) {
        $page = LDIVN_PAGE_FILES[$file['name']] ?? null;
        $target = $page ? ldivn_page_id($page) : 'option';
        if (!$target) {
            continue;
        }
        $values = get_field($file['name'], $target);
        $walk($file['name'], ldivn_doc_out($file['fields'], is_array($values) ? $values : []));
    }
    return $out;
}

function ldivn_get_stats(): array
{
    $partners = count(ldivn_get_partners());
    $volunteers = (int) wp_count_posts('ldivn_volunteer')->private;
    $trashKg = 5200;
    return [
        'totalTrashKg' => $trashKg,
        'totalTrashTons' => round($trashKg / 1000, 1),
        'totalVolunteers' => $volunteers + 5400,
        'totalEvents' => 100,
        'totalProvinces' => 63,
        'totalPartners' => $partners > 0 ? $partners : 24,
        'totalNews' => count(ldivn_get_news()),
        'upcomingEventsCount' => 0,
    ];
}
