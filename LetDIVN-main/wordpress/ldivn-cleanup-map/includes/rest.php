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
});

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
