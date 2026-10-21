<?php
// Sample spots around Hanoi, to see the map with several spots in one city:
// with the Hoan Kiem Lake one, Hanoi has 5. Ordinary spots in the list
// ("Điểm mẫu" in its Ghim column), except that their popup has no Register
// button and the sign-up form doesn't offer them.
// Added once after this version is installed; Cài đặt removes or re-adds them.

defined('ABSPATH') || exit;

/** [title, date, place, lat, lng] */
const LDM_SAMPLES = [
    ['West Lake Shore Cleanup – Hanoi', '2026-10-11', 'Thanh Nien Road, Tay Ho, Ha Noi', 21.0465, 105.8378],
    ['Red River Bank Cleanup – Hanoi', '2026-10-25', 'Long Bien Bridge, Long Bien, Ha Noi', 21.0436, 105.8622],
    ['To Lich River Cleanup – Hanoi', '2026-11-08', 'Khuong Dinh, Thanh Xuan, Ha Noi', 20.9935, 105.8148],
    ['Yen So Park Cleanup – Hanoi', '2026-11-22', 'Yen So Park, Hoang Mai, Ha Noi', 20.9688, 105.8604],
];

function ldm_sample_ids(): array
{
    return get_posts([
        'post_type' => LDM_TYPE,
        'post_status' => 'any',
        'numberposts' => -1,
        'fields' => 'ids',
        'meta_key' => '_ldm_sample',
        'meta_value' => '1',
        'no_found_rows' => true,
    ]);
}

function ldm_add_samples(): void
{
    if (ldm_sample_ids()) {
        return;
    }
    foreach (LDM_SAMPLES as [$title, $date, $place, $lat, $lng]) {
        wp_insert_post([
            'post_type' => LDM_TYPE,
            'post_status' => 'publish',
            'post_title' => wp_slash($title),
            'meta_input' => wp_slash([
                '_ldm_sample' => '1',
                '_ldm_date' => $date,
                '_ldm_time' => '07:30 - 10:30',
                '_ldm_location' => $place,
                '_ldm_city' => 'Ha Noi',
                '_ldm_lat' => (string) $lat,
                '_ldm_lng' => (string) $lng,
                '_ldm_status' => 'Upcoming',
            ]),
        ]);
    }
}

// On the first request after the update, whoever makes it: the map shows them at once.
add_action('wp_loaded', function () {
    if (get_option('ldm_samples') === false) {
        add_option('ldm_samples', 1, '', false);
        ldm_add_samples();
    }
});

add_action('admin_post_ldm_samples', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Bạn không có quyền làm việc này.');
    }
    check_admin_referer('ldm_samples');
    if (($_POST['do'] ?? '') === 'remove') {
        foreach (ldm_sample_ids() as $id) {
            wp_delete_post($id, true);
        }
    } else {
        ldm_add_samples();
    }
    wp_safe_redirect(admin_url('edit.php?post_type=' . LDM_TYPE . '&page=ldivn-map-settings'));
    exit;
});

/** The box in Cài đặt. */
function ldm_samples_box(): void
{
    $count = count(ldm_sample_ids());
    ?>
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="notice notice-info inline" style="margin:16px 0;padding:12px 16px">
        <input type="hidden" name="action" value="ldm_samples">
        <input type="hidden" name="do" value="<?php echo $count ? 'remove' : 'add'; ?>">
        <?php wp_nonce_field('ldm_samples'); ?>
        <p style="margin:0 0 10px"><strong>Điểm mẫu ở Hà Nội:</strong>
            <?php if ($count) : ?>
                đang có <?php echo (int) $count; ?> điểm mẫu (Tây Hồ, sông Hồng, sông Tô Lịch, công viên Yên Sở) để xem bản đồ khi một thành phố có nhiều điểm. Khách xem được nhưng không đăng ký vào được. Xem xong thì xoá.
            <?php else : ?>
                chưa có. Thêm 4 điểm mẫu quanh Hà Nội để xem bản đồ khi một thành phố có nhiều điểm.
            <?php endif; ?>
        </p>
        <?php submit_button($count ? 'Xoá các điểm mẫu' : 'Thêm 4 điểm mẫu', $count ? 'delete' : 'secondary', 'submit', false); ?>
    </form>
    <?php
}
