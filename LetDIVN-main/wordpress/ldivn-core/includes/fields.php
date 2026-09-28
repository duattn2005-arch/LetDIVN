<?php
// Edit boxes (Secure Custom Fields) built from the Decap schema, and the
// conversion between what SCF stores and the JSON shape the site reads — the
// same shape as Decap's content/*.json files, so the site's code is unchanged.

defined('ABSPATH') || exit;

function ldivn_field_key(string $path): string
{
    return 'field_ldivn_' . substr(md5($path), 0, 16);
}

function ldivn_choices(array $options): array
{
    $choices = [];
    foreach ($options as $o) {
        if (is_array($o)) {
            $choices[(string) $o['value']] = $o['label'];
        } else {
            $choices[(string) $o] = (string) $o;
        }
    }
    return $choices;
}

/** One Decap field as an SCF field, or null when WordPress edits it elsewhere (or not at all). */
function ldivn_acf_field(array $f, string $path): ?array
{
    $path .= '/' . $f['name'];
    $base = [
        'key' => ldivn_field_key($path),
        'name' => $f['name'],
        'label' => $f['label'],
        'instructions' => $f['hint'] ?? '',
    ];
    switch ($f['widget']) {
        case 'hidden':
            return null;
        case 'string':
            return $base + ['type' => 'text'];
        case 'text':
            return $base + ['type' => 'textarea', 'rows' => 4, 'new_lines' => ''];
        case 'markdown':
            return $base + ['type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'full', 'media_upload' => 1];
        case 'number':
            return $base + [
                'type' => 'number',
                'step' => ($f['value_type'] ?? '') === 'float' ? 'any' : 1,
                'min' => $f['min'] ?? '',
                'max' => $f['max'] ?? '',
                'default_value' => $f['default'] ?? '',
            ];
        case 'boolean':
            return $base + ['type' => 'true_false', 'ui' => 1, 'default_value' => empty($f['default']) ? 0 : 1];
        case 'select':
            return $base + [
                'type' => 'select',
                'choices' => ldivn_choices($f['options']),
                'allow_null' => 1,
                'default_value' => $f['default'] ?? '',
                'return_format' => 'value',
            ];
        case 'datetime':
            return $base + ['type' => 'date_picker', 'display_format' => 'd/m/Y', 'return_format' => 'Y-m-d', 'first_day' => 1];
        case 'image':
            return $base + ['type' => 'image', 'return_format' => 'id', 'preview_size' => 'medium', 'library' => 'all'];
        case 'file':
            return $base + ['type' => 'file', 'return_format' => 'id', 'library' => 'all'];
        case 'relation':
            return $base + ['type' => 'relationship', 'post_type' => ['post'], 'filters' => ['search'], 'return_format' => 'id'];
        case 'object':
            return $base + ['type' => 'group', 'layout' => 'block', 'sub_fields' => ldivn_acf_fields($f['fields'], $path)];
        case 'list':
            if (isset($f['field']) && $f['field']['widget'] === 'image') {
                return $base + ['type' => 'gallery', 'return_format' => 'id', 'preview_size' => 'medium', 'insert' => 'append', 'library' => 'all'];
            }
            if (isset($f['field'])) {
                return $base + [
                    'type' => 'repeater',
                    'layout' => 'table',
                    'button_label' => 'Thêm ' . ($f['label_singular'] ?? 'dòng'),
                    'sub_fields' => [ldivn_acf_field($f['field'], $path)],
                ];
            }
            if (isset($f['fields'])) {
                $subs = ldivn_acf_fields($f['fields'], $path);
                return $base + [
                    'type' => 'repeater',
                    'layout' => 'block',
                    'collapsed' => $subs[0]['key'] ?? '',
                    'button_label' => 'Thêm ' . ($f['label_singular'] ?? 'mục'),
                    'sub_fields' => $subs,
                ];
            }
            return null;
    }
    return $base + ['type' => 'text'];
}

function ldivn_acf_fields(array $fields, string $path, array $skip = []): array
{
    $out = [];
    foreach ($fields as $f) {
        if (in_array($f['name'], $skip, true)) {
            continue;
        }
        $field = ldivn_acf_field($f, $path);
        if ($field) {
            $out[] = $field;
        }
    }
    return $out;
}

/** Fields of news stored by WordPress itself (title, date, image, excerpt, body, categories, tags, status, Yoast SEO). */
const LDIVN_NEWS_NATIVE = ['title', 'category', 'date', 'image', 'summary', 'contentBlocks', 'status', 'tags', 'seoKeyphrase', 'seoTitle', 'seoDescription'];

/** A page-content file ("whoWeAre", ...) is one group field named after the file. */
function ldivn_page_file_field(array $file): array
{
    return [
        'key' => ldivn_field_key('pages/' . $file['name']),
        'name' => $file['name'],
        'label' => '',
        'type' => 'group',
        'layout' => 'block',
        'sub_fields' => ldivn_acf_fields($file['fields'], 'pages/' . $file['name']),
    ];
}

/** Registers the edit boxes. Page boxes need the pages to exist, so the importer calls this again after creating them. */
function ldivn_register_field_groups(): void
{
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    foreach (LDIVN_TYPES as $collection => $type) {
        $c = ldivn_collection($collection);
        acf_add_local_field_group([
            'key' => 'group_ldivn_' . $collection,
            'title' => 'Thông tin ' . ($c['label_singular'] ?? ''),
            'fields' => ldivn_acf_fields($c['fields'], $collection, [$c['identifier_field'], 'order']),
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => $type]]],
            'position' => 'acf_after_title',
            'style' => 'seamless',
        ]);
    }

    acf_add_local_field_group([
        'key' => 'group_ldivn_news',
        'title' => 'Thông tin thêm của bài viết',
        'fields' => ldivn_acf_fields(ldivn_collection('news')['fields'], 'news', LDIVN_NEWS_NATIVE),
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'post']]],
        'position' => 'normal',
    ]);

    $order = 0;
    foreach (ldivn_collection('pages')['files'] as $file) {
        $page = LDIVN_PAGE_FILES[$file['name']] ?? null;
        // The Cleanup Map page shows its own content (see ldivn_managed_page_ids).
        if ($page === 'cleanup-map' || ($page && !ldivn_page_id($page))) {
            continue;
        }
        acf_add_local_field_group([
            'key' => 'group_ldivn_page_' . $file['name'],
            'title' => $file['label'],
            'fields' => [ldivn_page_file_field($file)],
            'location' => $page
                ? [[['param' => 'page', 'operator' => '==', 'value' => (string) ldivn_page_id($page)]]]
                : [[['param' => 'options_page', 'operator' => '==', 'value' => LDIVN_OPTIONS_PAGE]]],
            'menu_order' => $order++,
        ]);
    }

    $projectIds = ldivn_project_pages();
    if ($projectIds) {
        acf_add_local_field_group([
            'key' => 'group_ldivn_project',
            'title' => 'Nội dung trang dự án',
            // The page title is the project's title.
            'fields' => ldivn_acf_fields(ldivn_collection('projects')['files'][0]['fields'], 'projects', ['title']),
            'location' => array_map(fn($id) => [['param' => 'page', 'operator' => '==', 'value' => (string) $id]], array_values($projectIds)),
            'position' => 'acf_after_title',
        ]);
    }

    acf_add_local_field_group([
        'key' => 'group_ldivn_sheets',
        'title' => 'Google Sheets (danh sách đăng ký tình nguyện viên)',
        'fields' => [
            [
                'key' => ldivn_field_key('settings/sheets_default_id'),
                'name' => 'sheets_default_id',
                'label' => 'Google Sheet chung',
                'type' => 'text',
                'instructions' => 'Link hoặc ID của Google Sheet nhận đăng ký, khi sự kiện không có Sheet riêng.',
                'default_value' => '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw',
            ],
            [
                'key' => ldivn_field_key('settings/sheets_credentials'),
                'name' => 'sheets_credentials',
                'label' => 'Khóa service account (JSON)',
                'type' => 'textarea',
                'rows' => 4,
                'instructions' => 'Nội dung file credentials.json của service account Google có quyền sửa Sheet. Để trống thì không ghi lên Google Sheets (đăng ký vẫn lưu ở mục Đăng ký tình nguyện viên).',
            ],
        ],
        'location' => [[['param' => 'options_page', 'operator' => '==', 'value' => LDIVN_OPTIONS_PAGE]]],
        'menu_order' => 100,
    ]);
}
add_action('acf/init', 'ldivn_register_field_groups');

// --- SCF value -> Decap JSON value -------------------------------------------------------

function ldivn_media_url($v): string
{
    if (is_numeric($v) && (int) $v > 0) {
        return (string) wp_get_attachment_url((int) $v);
    }
    if (is_array($v)) {
        return (string) ($v['url'] ?? '');
    }
    return is_string($v) ? $v : '';
}

function ldivn_value_out(array $f, $v)
{
    switch ($f['widget']) {
        case 'image':
        case 'file':
            return ldivn_media_url($v);
        case 'boolean':
            return (bool) $v;
        case 'number':
            if ($v === null || $v === '' || $v === false) {
                return null;
            }
            return ($f['value_type'] ?? '') === 'float' ? (float) $v : (int) $v;
        case 'relation':
            return array_values(array_filter(array_map(fn($id) => get_post_field('post_name', $id), is_array($v) ? $v : [])));
        case 'object':
            return ldivn_doc_out($f['fields'], is_array($v) ? $v : []);
        case 'list':
            $rows = is_array($v) ? $v : [];
            if (isset($f['field']) && $f['field']['widget'] === 'image') {
                return array_values(array_filter(array_map('ldivn_media_url', $rows)));
            }
            if (isset($f['field'])) {
                return array_map(fn($row) => ldivn_value_out($f['field'], is_array($row) ? ($row[$f['field']['name']] ?? '') : $row), $rows);
            }
            if (isset($f['fields'])) {
                return array_map(fn($row) => ldivn_doc_out($f['fields'], is_array($row) ? $row : []), $rows);
            }
            return [];
    }
    return $v === null || $v === false ? '' : (string) $v;
}

function ldivn_doc_out(array $fields, array $values): array
{
    $doc = [];
    foreach ($fields as $f) {
        if ($f['widget'] !== 'hidden') {
            $doc[$f['name']] = ldivn_value_out($f, $values[$f['name']] ?? null);
        }
    }
    return $doc;
}

// --- Decap JSON value -> SCF value (import) -------------------------------------------

/**
 * @param callable $media image/file path or URL -> attachment id (0 if missing)
 * @param callable $post  news slug -> post id (0 if missing)
 */
function ldivn_value_in(array $f, $v, callable $media, callable $post)
{
    switch ($f['widget']) {
        case 'image':
        case 'file':
            return is_string($v) && $v !== '' ? ($media($v) ?: '') : '';
        case 'boolean':
            return $v ? 1 : 0;
        case 'number':
            return $v === null || $v === '' ? '' : $v;
        case 'datetime':
            return is_string($v) && $v !== '' ? str_replace('-', '', substr($v, 0, 10)) : '';
        case 'relation':
            return array_values(array_filter(array_map($post, is_array($v) ? $v : [])));
        case 'object':
            return ldivn_doc_in($f['fields'], is_array($v) ? $v : [], $media, $post);
        case 'list':
            $rows = is_array($v) ? $v : [];
            if (isset($f['field']) && $f['field']['widget'] === 'image') {
                return array_values(array_filter(array_map(fn($x) => is_string($x) && $x !== '' ? $media($x) : 0, $rows)));
            }
            if (isset($f['field'])) {
                return array_map(fn($x) => [$f['field']['name'] => ldivn_value_in($f['field'], $x, $media, $post)], $rows);
            }
            if (isset($f['fields'])) {
                return array_map(fn($row) => ldivn_doc_in($f['fields'], is_array($row) ? $row : [], $media, $post), $rows);
            }
            return [];
    }
    return $v === null ? '' : (is_scalar($v) ? (string) $v : '');
}

function ldivn_doc_in(array $fields, array $doc, callable $media, callable $post, array $skip = []): array
{
    $values = [];
    foreach ($fields as $f) {
        if ($f['widget'] === 'hidden' || in_array($f['name'], $skip, true)) {
            continue;
        }
        if ($f['widget'] === 'list' && !isset($f['field']) && !isset($f['fields'])) {
            continue;
        }
        $values[$f['name']] = ldivn_value_in($f, $doc[$f['name']] ?? null, $media, $post);
    }
    return $values;
}
