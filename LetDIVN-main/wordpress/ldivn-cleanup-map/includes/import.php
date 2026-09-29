<?php
// Bản đồ dọn rác → Cài đặt → "Chuyển sự kiện về website này": the events of the
// website the map reads (its /api/events) become spots here, with their photos.
// The map then stops reading that website and sending sign-ups to it.

defined('ABSPATH') || exit;

add_action('admin_post_ldm_import_events', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Bạn không có quyền làm việc này.');
    }
    check_admin_referer('ldm_import_events');
    $result = ldm_import_site_events();
    wp_safe_redirect(add_query_arg(
        $result === null ? ['ldm_import' => 'error'] : ['ldm_import' => 'done'] + $result,
        admin_url('edit.php?post_type=' . LDM_TYPE . '&page=ldivn-map-settings')
    ));
    exit;
});

/**
 * Copies the website's events here. Events copied before are left alone, so it
 * can run again. Returns the counts (added, kept, no_photo), or null when the
 * website can't be read.
 */
function ldm_import_site_events(): ?array
{
    $s = ldm_settings();
    $site = $s['site_url'];
    $res = wp_remote_get($site . '/api/events', ['timeout' => 20, 'headers' => ['Accept' => 'application/json']]);
    $events = !is_wp_error($res) && wp_remote_retrieve_response_code($res) === 200
        ? json_decode(wp_remote_retrieve_body($res), true)
        : null;
    if (!is_array($events)) {
        return null;
    }

    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $count = ['added' => 0, 'kept' => 0, 'no_photo' => 0];
    foreach ($events as $e) {
        if (!is_array($e) || empty($e['id']) || empty($e['title'])) {
            continue;
        }
        $source = (string) $e['id'];
        if (get_posts(['post_type' => LDM_TYPE, 'post_status' => 'any', 'meta_key' => '_ldm_source', 'meta_value' => $source, 'fields' => 'ids', 'numberposts' => 1])) {
            $count['kept']++;
            continue;
        }

        $title = sanitize_text_field((string) $e['title']);
        $at = is_array($e['coordinates'] ?? null) ? $e['coordinates'] : [];
        $meta = [
            'date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($e['date'] ?? '')) ? (string) $e['date'] : '',
            'time' => sanitize_text_field((string) ($e['time'] ?? '')),
            'location' => sanitize_text_field((string) ($e['location'] ?? '')),
            'city' => sanitize_text_field((string) ($e['city'] ?? '')),
            'lat' => is_numeric($at['lat'] ?? null) ? (string) round((float) $at['lat'], 6) : '',
            'lng' => is_numeric($at['lng'] ?? null) ? (string) round((float) $at['lng'], 6) : '',
            'status' => ($e['status'] ?? '') === 'Pending' ? 'Pending' : 'Upcoming',
            'registered' => (string) absint($e['registeredCount'] ?? 0),
        ];
        $meta_input = ['_ldm_source' => $source];
        foreach ($meta as $k => $v) {
            if ($v !== '') {
                $meta_input['_ldm_' . $k] = $v;
            }
        }
        $id = wp_insert_post([
            'post_type' => LDM_TYPE,
            'post_status' => 'publish',
            'post_title' => wp_slash($title),
            'meta_input' => wp_slash($meta_input),
        ], true);
        if (is_wp_error($id) || !$id) {
            continue;
        }
        $count['added']++;

        $image = (string) ($e['image'] ?? '');
        if ($image !== '') {
            $url = strpos($image, '/') === 0 && strpos($image, '//') !== 0 ? $site . $image : $image;
            if (!ldm_import_photo($url, $id, $title)) {
                $count['no_photo']++;
            }
        }
    }

    // Everything is here now: no more reading that website nor sending sign-ups to it.
    update_option(LDM_OPTION, array_merge($s, ['site_events' => 0, 'vol_forward' => 0]));
    return $count;
}

/**
 * The event photo into the media library, as the spot's image. Photo links
 * without a file name (Unsplash...) are named after the event.
 */
function ldm_import_photo(string $url, int $post_id, string $title): bool
{
    $tmp = download_url($url, 30);
    if (is_wp_error($tmp)) {
        return false;
    }
    $path = (string) wp_parse_url($url, PHP_URL_PATH);
    $ext = preg_match('/\.(jpe?g|png|gif|webp)$/i', $path, $m) ? strtolower($m[1]) : 'jpg';
    $photo = media_handle_sideload(['name' => sanitize_title($title) . '.' . $ext, 'tmp_name' => $tmp], $post_id, $title);
    if (is_wp_error($photo)) {
        @unlink($tmp);
        return false;
    }
    return (bool) set_post_thumbnail($post_id, $photo);
}
