<?php
// Bản đồ dọn rác → Cài đặt: the map's texts, default links, local team pins.

defined('ABSPATH') || exit;

add_action('admin_menu', function () {
    add_submenu_page(
        'edit.php?post_type=' . LDM_TYPE,
        'Cài đặt bản đồ',
        'Cài đặt',
        'manage_options',
        'ldivn-map-settings',
        'ldm_settings_page'
    );
});

add_action('admin_init', function () {
    register_setting('ldm_settings', LDM_OPTION, [
        'type' => 'array',
        'sanitize_callback' => 'ldm_sanitize_settings',
        'default' => ldm_defaults(),
    ]);
});

function ldm_sanitize_settings($in): array
{
    $in = is_array($in) ? $in : [];
    $d = ldm_defaults();
    $text = fn($k) => isset($in[$k]) ? sanitize_text_field((string) $in[$k]) : '';
    $pattern = function ($k) use ($in) {
        $raw = isset($in[$k]) ? trim((string) $in[$k]) : '';
        // esc_url_raw would strip the braces of {id}, {slug}, {title}: set them aside meanwhile.
        $tokens = ['{id}' => '__LDMID__', '{slug}' => '__LDMSLUG__', '{title}' => '__LDMTITLE__'];
        return $raw === '' ? '' : strtr(esc_url_raw(strtr($raw, $tokens)), array_flip($tokens));
    };
    return [
        'title' => $text('title') ?: $d['title'],
        'subtitle' => $text('subtitle'),
        'height' => preg_replace('/[^0-9a-zA-Z%.()+\-\s]/', '', $text('height')) ?: $d['height'],
        'details_url' => $pattern('details_url'),
        'register_url' => $pattern('register_url'),
        'teams' => isset($in['teams']) ? sanitize_textarea_field((string) $in['teams']) : $d['teams'],
        'scheme' => ($in['scheme'] ?? '') === 'old' ? 'old' : 'new',
        'show_past' => empty($in['show_past']) ? 0 : 1,
        'click_pin' => empty($in['click_pin']) ? 0 : 1,
        'core_events' => empty($in['core_events']) ? 0 : 1,
        'site_events' => empty($in['site_events']) ? 0 : 1,
        'site_url' => untrailingslashit(esc_url_raw(trim((string) ($in['site_url'] ?? '')))) ?: $d['site_url'],
        'vol_on_map' => empty($in['vol_on_map']) ? 0 : 1,
        'vol_everywhere' => empty($in['vol_everywhere']) ? 0 : 1,
        'vol_forward' => empty($in['vol_forward']) ? 0 : 1,
        'vol_email' => implode(', ', array_filter(array_map('sanitize_email', explode(',', (string) ($in['vol_email'] ?? ''))))),
        'bubble' => empty($in['bubble']) ? 0 : 1,
        'bubble_open' => empty($in['bubble_open']) ? 0 : 1,
        'latest' => empty($in['latest']) ? 0 : 1,
    ];
}

// New settings: fetch the website's events afresh.
add_action('update_option_' . LDM_OPTION, function ($old, $new) {
    foreach ([$old['site_url'] ?? '', $new['site_url'] ?? ''] as $site) {
        delete_transient('ldm_site_events_' . md5((string) $site));
    }
}, 10, 2);

function ldm_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $s = ldm_settings();
    $name = fn($k) => esc_attr(LDM_OPTION . "[$k]");
    $teams_count = count(ldm_teams());
    ?>
    <div class="wrap">
        <h1>Cài đặt bản đồ dọn rác</h1>

        <div class="notice notice-info inline" style="margin:16px 0;padding:12px 16px">
            <p style="margin:0 0 8px"><strong>Chèn bản đồ vào trang:</strong> thêm khối <em>Shortcode</em> (hoặc dán vào trình soạn thảo) nội dung sau:</p>
            <p style="margin:0 0 8px"><code style="font-size:14px;padding:4px 8px">[ldivn_cleanup_map]</code></p>
            <p style="margin:0">Tuỳ chọn: <code>fullwidth="yes"</code> (tràn hết chiều ngang màn hình), <code>height="700px"</code>, <code>year="2026"</code>, <code>scheme="old"</code> (mở sẵn 63 tỉnh cũ), <code>title="..."</code>, <code>subtitle="..."</code>.<br>
                Ví dụ: <code>[ldivn_cleanup_map fullwidth="yes" height="calc(100vh - 80px)"]</code></p>
        </div>

        <?php ldm_samples_box(); ?>

        <?php
        $import = isset($_GET['ldm_import']) ? sanitize_key(wp_unslash($_GET['ldm_import'])) : '';
        if ($import === 'done') {
            $n = fn($k) => isset($_GET[$k]) ? absint($_GET[$k]) : 0;
            printf(
                '<div class="notice notice-success"><p>Đã chuyển xong: thêm %d điểm dọn rác%s%s. Bản đồ giờ chỉ dùng các điểm trên website này, đăng ký chỉ lưu ở đây.</p></div>',
                $n('added'),
                $n('kept') ? sprintf(', %d điểm đã có từ trước', $n('kept')) : '',
                $n('no_photo') ? sprintf(', %d điểm không tải được ảnh (chọn lại ở "Ảnh sự kiện")', $n('no_photo')) : ''
            );
        } elseif ($import === 'error') {
            printf('<div class="notice notice-error"><p>Không đọc được sự kiện của %s. Thử lại sau ít phút.</p></div>', esc_html($s['site_url']));
        }
        ?>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="notice notice-warning inline" style="margin:16px 0;padding:12px 16px">
            <input type="hidden" name="action" value="ldm_import_events">
            <?php wp_nonce_field('ldm_import_events'); ?>
            <p style="margin:0 0 8px"><strong>Chuyển sự kiện về website này</strong> (khi không dùng <?php echo esc_html($s['site_url']); ?> nữa)</p>
            <p style="margin:0 0 10px">Chép các sự kiện của <?php echo esc_html($s['site_url']); ?> thành điểm dọn rác ở đây, kèm ảnh. Sau đó bản đồ chỉ dùng các điểm ở đây, đăng ký chỉ lưu ở đây (bỏ chọn "Hiện các sự kiện của website" và "Gửi về website"). Bấm lại lần nữa cũng không bị chép trùng.</p>
            <?php submit_button('Chuyển sự kiện về đây', 'secondary', 'submit', false); ?>
        </form>

        <form method="post" action="options.php">
            <?php settings_fields('ldm_settings'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="ldm-site">Sự kiện từ website</label></th>
                    <td>
                        <label><input type="checkbox" name="<?php echo $name('site_events'); ?>" value="1" <?php checked($s['site_events'], 1); ?>> Hiện các sự kiện của website</label>
                        <input id="ldm-site" name="<?php echo $name('site_url'); ?>" value="<?php echo esc_attr($s['site_url']); ?>" class="regular-text" style="margin-left:8px">
                        <p class="description">Bản đồ hiện đúng các sự kiện đang có trên website này (cập nhật 10 phút/lần). Nút <strong>Details</strong> mở trang chiến dịch trên website; nút <strong>Register</strong> xem mục "Đăng ký tình nguyện viên" ở dưới.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-title">Tiêu đề</label></th>
                    <td><input id="ldm-title" name="<?php echo $name('title'); ?>" value="<?php echo esc_attr($s['title']); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-subtitle">Dòng mô tả</label></th>
                    <td><input id="ldm-subtitle" name="<?php echo $name('subtitle'); ?>" value="<?php echo esc_attr($s['subtitle']); ?>" class="large-text"></td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-height">Chiều cao</label></th>
                    <td>
                        <input id="ldm-height" name="<?php echo $name('height'); ?>" value="<?php echo esc_attr($s['height']); ?>" class="regular-text">
                        <p class="description">Ví dụ <code>calc(100vh - 80px)</code> (cao bằng màn hình trừ thanh menu 80px) hoặc <code>700px</code>. Tối thiểu 560px.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-register">Link nút "Register" mặc định</label></th>
                    <td>
                        <input id="ldm-register" name="<?php echo $name('register_url'); ?>" value="<?php echo esc_attr($s['register_url']); ?>" class="large-text" placeholder="https://letsdoitvietnam.org/volunteer/?event={id}">
                        <p class="description">Cho các điểm thêm ở menu "Bản đồ dọn rác" mà không có link riêng. Có thể chèn <code>{id}</code>, <code>{slug}</code>, <code>{title}</code>. Để trống thì không hiện nút.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-details">Link nút "Details" mặc định</label></th>
                    <td>
                        <input id="ldm-details" name="<?php echo $name('details_url'); ?>" value="<?php echo esc_attr($s['details_url']); ?>" class="large-text" placeholder="https://letsdoitvietnam.org/campaigns/{slug}">
                        <p class="description">Như trên.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-teams">Ghim nhóm địa phương</label></th>
                    <td>
                        <textarea id="ldm-teams" name="<?php echo $name('teams'); ?>" rows="10" class="large-text code"><?php echo esc_textarea($s['teams']); ?></textarea>
                        <p class="description">Các tỉnh/thành có nhóm Let's Do It luôn được ghim (hiện đang đọc được <?php echo (int) $teams_count; ?> ghim). Mỗi dòng: <code>Tên | vĩ độ | kinh độ | tên gọi khác</code>.<br>
                            Sự kiện đã ghim vị trí có ghim riêng ở đúng chỗ đó (nhiều điểm gần nhau gộp thành một ghim có số, bấm vào thì phóng to ra từng điểm); sự kiện chưa ghim vị trí ở tỉnh có nhóm thì làm ghim của nhóm nhảy lên.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Danh sách tỉnh mở sẵn</th>
                    <td>
                        <label><input type="radio" name="<?php echo $name('scheme'); ?>" value="new" <?php checked($s['scheme'], 'new'); ?>> Mới (34 tỉnh, từ 1/7/2025)</label><br>
                        <label><input type="radio" name="<?php echo $name('scheme'); ?>" value="old" <?php checked($s['scheme'], 'old'); ?>> Cũ (63 tỉnh)</label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Tuỳ chọn</th>
                    <td>
                        <label><input type="checkbox" name="<?php echo $name('show_past'); ?>" value="1" <?php checked($s['show_past'], 1); ?>> Vẫn hiện sự kiện đã qua (mặc định: qua ngày là tự ẩn)</label><br>
                        <label><input type="checkbox" name="<?php echo $name('click_pin'); ?>" value="1" <?php checked($s['click_pin'], 1); ?>> Bấm lên bản đồ thì ghim điểm mới và hiện địa chỉ</label><br>
                        <label><input type="checkbox" name="<?php echo $name('core_events'); ?>" value="1" <?php checked($s['core_events'], 1); ?>> Lấy thêm sự kiện từ plugin "Let's Do It Vietnam – Core"</label>
                        <span class="description">(<?php echo function_exists('ldivn_get_events') ? 'đang bật' : 'không cài trên web này — bỏ qua'; ?>)</span><br>
                        <label><input type="checkbox" name="<?php echo $name('bubble'); ?>" value="1" <?php checked($s['bubble'], 1); ?>> Hiện bong bóng liên hệ ở góc dưới bên phải mọi trang (Facebook, Instagram, hotline, email)</label><br>
                        <label><input type="checkbox" name="<?php echo $name('bubble_open'); ?>" value="1" <?php checked($s['bubble_open'], 1); ?>> Khung liên hệ tự mở ra mỗi khi vào một trang</label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Bài viết mới nhất</th>
                    <td>
                        <label><input type="checkbox" name="<?php echo $name('latest'); ?>" value="1" <?php checked($s['latest'], 1); ?>> Chạy chữ 5 bài viết (Posts) mới nhất trên đầu mọi trang, tự cập nhật khi đăng bài mới</label>
                    </td>
                </tr>
            </table>

            <h2>Đăng ký tình nguyện viên</h2>
            <div class="notice notice-info inline" style="margin:16px 0;padding:12px 16px">
                <p style="margin:0 0 8px"><strong>Mở form "Register to Volunteer":</strong></p>
                <ul style="margin:0 0 0 18px;list-style:disc">
                    <li>Nút <strong>Register</strong> trên bản đồ (bật ở dưới).</li>
                    <li>Bất kỳ link nào tới <code>#volunteer</code>, ví dụ một mục menu: Giao diện → Menu → Liên kết tự tạo, URL <code>#volunteer</code>, tên "Volunteer".</li>
                    <li>Nút: <code>[ldivn_volunteer_button]</code> (đổi chữ: <code>text="..."</code>).</li>
                    <li>Form nằm luôn trên trang: <code>[ldivn_volunteer_form]</code>.</li>
                </ul>
                <p style="margin:8px 0 0">Các đăng ký xem ở menu <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . LDV_TYPE)); ?>"><strong>Tình nguyện viên</strong></a> (có nút tải về Excel).</p>
            </div>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Mở form</th>
                    <td>
                        <label><input type="checkbox" name="<?php echo $name('vol_on_map'); ?>" value="1" <?php checked($s['vol_on_map'], 1); ?>> Nút Register trên bản đồ mở form ngay trên web này (bỏ chọn: mở form của website ở trên)</label><br>
                        <label><input type="checkbox" name="<?php echo $name('vol_everywhere'); ?>" value="1" <?php checked($s['vol_everywhere'], 1); ?>> Link <code>#volunteer</code> mở form ở mọi trang (bỏ chọn: chỉ ở trang có bản đồ hoặc shortcode của form)</label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Gửi về website</th>
                    <td>
                        <label><input type="checkbox" name="<?php echo $name('vol_forward'); ?>" value="1" <?php checked($s['vol_forward'], 1); ?>> Gửi mỗi đăng ký về website <code><?php echo esc_html($s['site_url']); ?></code></label>
                        <p class="description">Như form trên website: đăng ký được cộng vào số người của sự kiện và ghi thêm một dòng vào Google Sheet đăng ký. Đăng ký vẫn luôn được lưu ở đây.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="ldm-vol-email">Email báo có đăng ký mới</label></th>
                    <td>
                        <input id="ldm-vol-email" name="<?php echo $name('vol_email'); ?>" value="<?php echo esc_attr($s['vol_email']); ?>" class="regular-text" placeholder="<?php echo esc_attr(get_option('admin_email')); ?>">
                        <p class="description">Để trống thì không gửi. Nhiều email thì cách nhau bằng dấu phẩy.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Lưu cài đặt'); ?>
        </form>
    </div>
    <?php
}
