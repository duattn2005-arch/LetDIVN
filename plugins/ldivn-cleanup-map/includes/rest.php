<?php
// Map search through this site: Nominatim (places, with their outlines) and
// Photon (fast suggestions), with the site named in the request as Nominatim
// asks, and answers cached a day.

defined('ABSPATH') || exit;

add_action('rest_api_init', function () {
    foreach (['search', 'reverse', 'photon'] as $kind) {
        register_rest_route('ldivn-map/v1', "/geocode/$kind", [
            'methods' => 'GET',
            'callback' => fn(WP_REST_Request $req) => ldm_geocode($kind, $req),
            'permission_callback' => '__return_true',
        ]);
    }
    // A spot's Google Maps link (assets/js/admin.js): where it points, a short link opened first.
    register_rest_route('ldivn-map/v1', '/gmaps', [
        'methods' => 'GET',
        'callback' => 'ldm_gmaps_answer',
        'permission_callback' => fn() => current_user_can('edit_posts'),
    ]);
});

/** A Google address, and only one (maps.app.goo.gl, goo.gl/maps, google.com/maps...). */
function ldm_is_google(string $url): bool
{
    $host = strtolower((string) wp_parse_url($url, PHP_URL_HOST));
    return (bool) preg_match('/(^|\.)(goo\.gl|google\.[a-z]{2,3}(\.[a-z]{2})?|g\.co)$/', $host);
}

/**
 * The place a Google Maps link shows: [lat, lng] or null. In order, the place's
 * own pin (!3d…!4d…), a q= / query= / ll= / destination= / center= of
 * coordinates, the view's centre (@lat,lng), then /search/ or /place/ lat,lng.
 */
function ldm_gmaps_coords(string $url): ?array
{
    $url = rawurldecode($url);
    $num = '(-?\d{1,3}(?:\.\d+)?)';
    $patterns = [
        '/!3d' . $num . '!4d' . $num . '/',
        '/[?&](?:q|query|ll|sll|destination|daddr|center)=(?:loc:)?' . $num . ',\s*\+?' . $num . '/',
        '/@' . $num . ',' . $num . '/',
        '~/(?:search|place|dir)/' . $num . ',\s*\+?' . $num . '~',
    ];
    foreach ($patterns as $p) {
        if (preg_match($p, $url, $m) && abs((float) $m[1]) <= 90 && abs((float) $m[2]) <= 180) {
            return [(float) $m[1], (float) $m[2]];
        }
    }
    return null;
}

/** The name of the place in a Google Maps link (/place/<name>/ or q=<name>), for a search when it has no coordinates. */
function ldm_gmaps_name(string $url): string
{
    if (preg_match('~/place/([^/@?]+)~', $url, $m) || preg_match('/[?&](?:q|query)=([^&]+)/', $url, $m)) {
        return trim(str_replace('+', ' ', rawurldecode($m[1])));
    }
    return '';
}

function ldm_gmaps_answer(WP_REST_Request $req)
{
    $url = esc_url_raw(trim((string) $req->get_param('url')));
    if ($url === '' || !ldm_is_google($url)) {
        return new WP_REST_Response(['error' => 'Not a Google Maps link'], 400);
    }
    // A short link leads, redirect by redirect, to the full one (within Google only).
    for ($i = 0; $i < 6 && !ldm_gmaps_coords($url); $i++) {
        $res = wp_remote_get($url, [
            'timeout' => 10,
            'redirection' => 0,
            'headers' => ['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept-Language' => 'en'],
        ]);
        if (is_wp_error($res)) {
            break;
        }
        $next = (string) wp_remote_retrieve_header($res, 'location');
        if ($next === '') {
            // The page itself may still tell where it is.
            if (preg_match('/https:\/\/www\.google\.[a-z.]+\/maps\/[^"\'\s<>\\\\]+@-?\d+\.\d+,-?\d+\.\d+[^"\'\s<>\\\\]*/', (string) wp_remote_retrieve_body($res), $m)) {
                $url = html_entity_decode($m[0]);
            }
            break;
        }
        $next = strpos($next, '/') === 0 ? 'https://' . wp_parse_url($url, PHP_URL_HOST) . $next : $next;
        if (!ldm_is_google($next)) {
            break;
        }
        $url = $next;
    }
    $at = ldm_gmaps_coords($url);
    return new WP_REST_Response([
        'url' => $url,
        'lat' => $at ? $at[0] : null,
        'lng' => $at ? $at[1] : null,
        'name' => ldm_gmaps_name($url),
    ]);
}

function ldm_geocode(string $kind, WP_REST_Request $req)
{
    $q = trim(sanitize_text_field((string) $req->get_param('q')));
    $limit = (string) min(10, max(1, absint($req->get_param('limit') ?: ($kind === 'photon' ? 6 : 1))));

    if ($kind === 'search') {
        if ($q === '') {
            return new WP_REST_Response(['error' => 'Missing q'], 400);
        }
        $params = [
            'q' => $q,
            'countrycodes' => 'vn',
            'format' => 'json',
            'addressdetails' => '1',
            'polygon_geojson' => '1',
            'accept-language' => 'en',
            'limit' => $limit,
        ];
        $viewbox = (string) $req->get_param('viewbox');
        if (preg_match('/^-?[\d.]+,-?[\d.]+,-?[\d.]+,-?[\d.]+$/', $viewbox)) {
            $params['viewbox'] = $viewbox;
            $params['bounded'] = '1';
        }
        $url = 'https://nominatim.openstreetmap.org/search?' . http_build_query($params);
    } elseif ($kind === 'reverse') {
        $lat = $req->get_param('lat');
        $lon = $req->get_param('lon');
        if (!is_numeric($lat) || !is_numeric($lon)) {
            return new WP_REST_Response(['error' => 'Missing lat/lon'], 400);
        }
        $url = 'https://nominatim.openstreetmap.org/reverse?' . http_build_query([
            'lat' => round((float) $lat, 6),
            'lon' => round((float) $lon, 6),
            'format' => 'json',
            'zoom' => (string) min(18, max(3, absint($req->get_param('zoom') ?: 18))),
            'addressdetails' => '1',
            'accept-language' => 'en',
        ]);
    } else {
        if ($q === '') {
            return new WP_REST_Response(['error' => 'Missing q'], 400);
        }
        $url = 'https://photon.komoot.io/api/?' . http_build_query(['q' => $q, 'limit' => $limit, 'bbox' => '102.0,8.0,110.0,24.0', 'lang' => 'en']);
    }

    $key = 'ldm_geo_' . md5($url);
    $cached = get_transient($key);
    if ($cached !== false) {
        return new WP_REST_Response($cached);
    }
    $res = wp_remote_get($url, [
        'timeout' => 12,
        'headers' => [
            'User-Agent' => 'LDIVN-Cleanup-Map/' . LDM_VERSION . ' (' . home_url('/') . ')',
            'Accept-Language' => 'en',
        ],
    ]);
    if (is_wp_error($res) || wp_remote_retrieve_response_code($res) !== 200) {
        return new WP_REST_Response(['error' => ($kind === 'photon' ? 'Photon' : 'Nominatim') . ' upstream error'], 502);
    }
    $data = json_decode(wp_remote_retrieve_body($res), true);
    if ($data === null) {
        return new WP_REST_Response(['error' => 'Bad upstream answer'], 502);
    }
    set_transient($key, $data, DAY_IN_SECONDS);
    return new WP_REST_Response($data);
}
