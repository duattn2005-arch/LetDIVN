<?php
// The site's JSON API at /api/* (a rewrite to the REST namespace ldivn/v1,
// see routing.php) — the same routes and responses as the Node server's
// server/apiRouter.ts.

defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    $ns = 'ldivn/v1';
    $read = [
        '/content' => fn() => (object) ldivn_cached('content', 'ldivn_get_page_content'),
        '/events' => fn() => ldivn_cached('events', 'ldivn_get_events'),
        '/news' => fn() => ldivn_cached('news', 'ldivn_get_news'),
        '/partners' => fn() => ldivn_cached('partners', 'ldivn_get_partners'),
        '/team' => fn() => ldivn_cached('team', 'ldivn_get_team'),
        '/videos' => fn() => ldivn_cached('videos', 'ldivn_get_videos'),
        '/what-we-do' => fn() => ldivn_cached('what-we-do', fn() => ldivn_get_image_text_list('what-we-do')),
        '/who-we-are-sections' => fn() => ldivn_cached('who-we-are', fn() => ldivn_get_image_text_list('who-we-are')),
        '/media-coverage' => fn() => ldivn_cached('media-coverage', 'ldivn_get_media_coverage'),
        '/project-pages' => fn() => (object) ldivn_cached('project-pages', 'ldivn_get_project_pages'),
        '/stats' => fn() => ldivn_cached('stats', 'ldivn_get_stats'),
    ];
    foreach ($read as $route => $callback) {
        register_rest_route($ns, $route, [
            'methods' => 'GET',
            'callback' => fn() => rest_ensure_response($callback()),
            'permission_callback' => '__return_true',
        ]);
    }

    register_rest_route($ns, '/volunteers', [
        'methods' => 'POST',
        'callback' => 'ldivn_api_add_volunteer',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route($ns, '/contacts', [
        'methods' => 'POST',
        'callback' => 'ldivn_api_add_contact',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route($ns, '/sheets/append', [
        'methods' => 'POST',
        'callback' => 'ldivn_api_sheets_append',
        'permission_callback' => '__return_true',
    ]);
    foreach (['search', 'reverse', 'photon'] as $kind) {
        register_rest_route($ns, "/geocode/$kind", [
            'methods' => 'GET',
            'callback' => fn(WP_REST_Request $req) => ldivn_api_geocode($kind, $req),
            'permission_callback' => '__return_true',
        ]);
    }
});

// --- Forms ------------------------------------------------------------------------------

/** Form data as stored: strings trimmed and capped, lists of strings, numbers kept. */
function ldivn_clean_form(array $data): array
{
    $out = [];
    foreach (array_slice($data, 0, 40, true) as $key => $value) {
        $key = preg_replace('/[^A-Za-z0-9_]/', '', (string) $key);
        if ($key === '') {
            continue;
        }
        if (is_array($value)) {
            $out[$key] = array_values(array_map(fn($v) => mb_substr(sanitize_text_field((string) $v), 0, 200), array_filter($value, 'is_scalar')));
        } elseif (is_int($value) || is_float($value)) {
            $out[$key] = $value;
        } elseif (is_bool($value)) {
            $out[$key] = $value;
        } elseif (is_scalar($value)) {
            $out[$key] = mb_substr(sanitize_textarea_field((string) $value), 0, 5000);
        }
    }
    return $out;
}

function ldivn_api_add_volunteer(WP_REST_Request $req)
{
    $data = ldivn_clean_form((array) $req->get_json_params());
    $data['registeredAt'] = gmdate('Y-m-d\TH:i:s.v\Z');
    $id = wp_insert_post([
        'post_type' => 'ldivn_volunteer',
        'post_status' => 'private',
        'post_title' => ($data['fullName'] ?? '') ?: '(không tên)',
    ], true);
    if (is_wp_error($id)) {
        return new WP_Error('ldivn_save_failed', 'Không lưu được đăng ký', ['status' => 500]);
    }
    update_post_meta($id, 'ldivn_data', wp_slash(wp_json_encode($data, JSON_UNESCAPED_UNICODE)));
    update_post_meta($id, 'event_id', (string) ($data['eventId'] ?? ''));
    return ['id' => 'vol-' . $id];
}

function ldivn_api_add_contact(WP_REST_Request $req)
{
    $data = ldivn_clean_form((array) $req->get_json_params());
    $data['status'] = 'Unread';
    $data['createdAt'] = gmdate('Y-m-d\TH:i:s.v\Z');
    $id = wp_insert_post([
        'post_type' => 'ldivn_contact',
        'post_status' => 'private',
        'post_title' => trim(($data['name'] ?? '') . (isset($data['subject']) && $data['subject'] !== '' ? ' – ' . $data['subject'] : '')) ?: '(không tên)',
    ], true);
    if (is_wp_error($id)) {
        return new WP_Error('ldivn_save_failed', 'Không lưu được tin nhắn', ['status' => 500]);
    }
    update_post_meta($id, 'ldivn_data', wp_slash(wp_json_encode($data, JSON_UNESCAPED_UNICODE)));
    return ['id' => 'msg-' . $id];
}

// --- Google Sheets: a volunteer sign-up as a new row ------------------------------------------

function ldivn_sheet_id(string $urlOrId): string
{
    if (preg_match('~/spreadsheets/d/([a-zA-Z0-9-_]+)~', $urlOrId, $m)) {
        return $m[1];
    }
    $urlOrId = trim($urlOrId);
    return $urlOrId !== '' && !str_contains($urlOrId, '/') && strlen($urlOrId) >= 20 ? $urlOrId : '';
}

function ldivn_google_token(): string
{
    $cached = get_transient('ldivn_google_token');
    if ($cached) {
        return $cached;
    }
    $creds = json_decode((string) get_field('sheets_credentials', 'option'), true);
    if (empty($creds['client_email']) || empty($creds['private_key'])) {
        throw new RuntimeException('Chưa nhập khóa service account Google (Thông tin chung → Google Sheets).');
    }
    $b64 = fn($s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    $now = time();
    $input = $b64(wp_json_encode(['alg' => 'RS256', 'typ' => 'JWT'])) . '.' . $b64(wp_json_encode([
        'iss' => $creds['client_email'],
        'scope' => 'https://www.googleapis.com/auth/spreadsheets',
        'aud' => 'https://oauth2.googleapis.com/token',
        'exp' => $now + 3600,
        'iat' => $now,
    ]));
    if (!openssl_sign($input, $signature, $creds['private_key'], 'sha256WithRSAEncryption')) {
        throw new RuntimeException('Khóa service account không hợp lệ.');
    }
    $res = wp_remote_post('https://oauth2.googleapis.com/token', [
        'timeout' => 15,
        'body' => ['grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $input . '.' . $b64($signature)],
    ]);
    $data = json_decode(wp_remote_retrieve_body($res), true);
    if (empty($data['access_token'])) {
        throw new RuntimeException($data['error_description'] ?? 'Không lấy được token Google');
    }
    set_transient('ldivn_google_token', $data['access_token'], max(60, (int) ($data['expires_in'] ?? 3600) - 120));
    return $data['access_token'];
}

function ldivn_api_sheets_append(WP_REST_Request $req)
{
    $p = (array) $req->get_json_params();
    $sheet = ldivn_sheet_id((string) ($p['spreadsheetId'] ?? ''))
        ?: ldivn_sheet_id((string) get_field('sheets_default_id', 'option'))
        ?: '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';

    // 10 columns A -> J: ID, THỜI GIAN, HỌ VÀ TÊN, SĐT, EMAIL, ĐỊA CHỈ, TUỔI, DỰ ÁN, KỸ NĂNG, TRẠNG THÁI
    $row = isset($p['rowValues']) && is_array($p['rowValues'])
        ? array_map(fn($v) => mb_substr(sanitize_text_field((string) $v), 0, 500), array_slice($p['rowValues'], 0, 20))
        : null;
    if (!$row) {
        return new WP_REST_Response(['error' => 'Missing rowValues or volunteer data'], 400);
    }

    try {
        $token = ldivn_google_token();
        $title = get_transient('ldivn_sheet_title_' . $sheet);
        if (!$title) {
            $meta = json_decode(wp_remote_retrieve_body(wp_remote_get(
                "https://sheets.googleapis.com/v4/spreadsheets/$sheet?fields=sheets.properties.title",
                ['timeout' => 15, 'headers' => ['Authorization' => "Bearer $token"]]
            )), true);
            $title = $meta['sheets'][0]['properties']['title'] ?? 'Trang tính1';
            set_transient('ldivn_sheet_title_' . $sheet, $title, DAY_IN_SECONDS);
        }
        $res = wp_remote_post(
            "https://sheets.googleapis.com/v4/spreadsheets/$sheet/values/" . rawurlencode($title) . '!A1:append?valueInputOption=USER_ENTERED',
            [
                'timeout' => 15,
                'headers' => ['Authorization' => "Bearer $token", 'Content-Type' => 'application/json'],
                'body' => wp_json_encode(['values' => [$row]]),
            ]
        );
        $code = wp_remote_retrieve_response_code($res);
        return new WP_REST_Response(json_decode(wp_remote_retrieve_body($res), true), $code >= 200 && $code < 300 ? 200 : 400);
    } catch (Throwable $e) {
        return new WP_REST_Response(['error' => $e->getMessage()], 500);
    }
}

// --- Map search: Nominatim / Photon through this server (cached 10 minutes) ---------------------

function ldivn_api_geocode(string $kind, WP_REST_Request $req)
{
    $q = trim((string) $req->get_param('q'));
    if ($kind === 'search') {
        if ($q === '') {
            return new WP_REST_Response(['error' => 'Missing q'], 400);
        }
        $params = ['q' => $q, 'countrycodes' => 'vn', 'format' => 'json', 'addressdetails' => '1', 'polygon_geojson' => '1', 'limit' => (string) ($req->get_param('limit') ?: '1')];
        if ($req->get_param('viewbox')) {
            $params['viewbox'] = (string) $req->get_param('viewbox');
            $params['bounded'] = '1';
        }
        $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query($params);
    } elseif ($kind === 'reverse') {
        $lat = (string) $req->get_param('lat');
        $lon = (string) $req->get_param('lon');
        if ($lat === '' || $lon === '') {
            return new WP_REST_Response(['error' => 'Missing lat/lon'], 400);
        }
        $url = 'https://nominatim.openstreetmap.org/reverse?' . http_build_query(['lat' => $lat, 'lon' => $lon, 'format' => 'json', 'zoom' => (string) ($req->get_param('zoom') ?: '18'), 'addressdetails' => '1']);
    } else {
        if ($q === '') {
            return new WP_REST_Response(['error' => 'Missing q'], 400);
        }
        $url = 'https://photon.komoot.io/api/?' . http_build_query(['q' => $q, 'limit' => (string) ($req->get_param('limit') ?: '6'), 'bbox' => '102.0,8.0,110.0,24.0', 'lang' => 'en']);
    }

    $key = 'ldivn_geo_' . md5($url);
    $cached = get_transient($key);
    if ($cached !== false) {
        return new WP_REST_Response($cached);
    }
    $res = wp_remote_get($url, [
        'timeout' => 15,
        'headers' => ['User-Agent' => 'LetsDoItVietnam/1.0 (' . home_url('/') . ')', 'Accept-Language' => 'en'],
    ]);
    if (is_wp_error($res) || wp_remote_retrieve_response_code($res) !== 200) {
        return new WP_REST_Response(['error' => ($kind === 'photon' ? 'Photon' : 'Nominatim') . ' upstream error'], 502);
    }
    $data = json_decode(wp_remote_retrieve_body($res), true);
    set_transient($key, $data, 10 * MINUTE_IN_SECONDS);
    return new WP_REST_Response($data);
}
