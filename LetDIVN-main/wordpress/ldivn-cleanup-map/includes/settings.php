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
    ];
}

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

        <form method="post" action="options.php">
            <?php settings_fields('ldm_settings'); ?>
            <table class="form-table" role="presentation">
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
                        <p class="description">Dùng cho điểm không có link riêng. Có thể chèn <code>{id}</code>, <code>{slug}</code>, <code>{title}</code>. Để trống thì không hiện nút.</p>
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
                            Sự kiện ở tỉnh có nhóm sẽ làm ghim đó nhảy lên; sự kiện ở nơi khác có ghim riêng.</p>
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
                        <span class="description">(<?php echo function_exists('ldivn_get_events') ? 'đang bật' : 'không cài trên web này — bỏ qua'; ?>)</span>
                    </td>
                </tr>
            </table>
            <?php submit_button('Lưu cài đặt'); ?>
        </form>
    </div>
    <?php
}
