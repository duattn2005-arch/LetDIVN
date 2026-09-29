<?php
// Tình nguyện viên → Sửa form đăng ký: the "Register to Volunteer" form made on
// itself (assets/js/volunteer-edit.js over the form that assets/js/volunteer.js
// draws): its texts, photo and roles; the order of its parts and fields, which
// are shown, which must be filled in, fields of one's own; its colours, font,
// corners and header background. What is left empty takes the website's own.

defined('ABSPATH') || exit;

const LDV_FORM_OPTION = 'ldv_form';

/** The form's texts: key => [label in the admin, default]. */
function ldv_form_texts(): array
{
    return [
        'title' => ['Tiêu đề', 'Register to Volunteer'],
        'subtitle' => ['Dòng dưới tiêu đề', 'Be part of a cleaner, greener and more beautiful Vietnam!'],
        'join_title' => ['Mục "Tham gia với tư cách"', 'Join as'],
        'join_individual' => ['Cá nhân', 'Individual'],
        'join_group' => ['Nhóm', 'Group'],
        'join_organization' => ['Tổ chức', 'Organization'],
        'project_title' => ['Mục "Dự án / chiến dịch"', 'Project or campaign'],
        'project_placeholder' => ['Ô dự án, khi chưa chọn', 'Select a project or campaign'],
        'role_title' => ['Mục "Vai trò"', 'Preferred role'],
        'info_title' => ['Mục "Thông tin cá nhân"', 'Personal information'],
        'name_label' => ['Họ tên', 'Full name'],
        'name_placeholder' => ['Họ tên, chữ mờ', 'Enter your full name'],
        'contact_label' => ['Họ tên (nhóm / tổ chức)', 'Contact person'],
        'contact_placeholder' => ['Họ tên (nhóm / tổ chức), chữ mờ', 'Enter the contact person’s full name'],
        'phone_label' => ['Điện thoại', 'Phone number'],
        'phone_placeholder' => ['Điện thoại, chữ mờ', 'Enter your phone number (optional)'],
        'email_label' => ['Email', 'Email address'],
        'email_placeholder' => ['Email, chữ mờ', 'Enter your email address'],
        'birth_label' => ['Ngày sinh', 'Date of birth'],
        'group_label' => ['Tên nhóm', 'Group name'],
        'group_placeholder' => ['Tên nhóm, chữ mờ', 'Enter your group name'],
        'organization_label' => ['Tên tổ chức', 'Organization name'],
        'organization_placeholder' => ['Tên tổ chức, chữ mờ', 'Enter your company or organization name'],
        'address_label' => ['Địa chỉ', 'Address'],
        'address_placeholder' => ['Địa chỉ, chữ mờ', 'Enter your address'],
        'people_title' => ['Mục "Số người tham gia"', 'Number of participants'],
        'select_placeholder' => ['Danh sách chọn tự thêm, khi chưa chọn', 'Select an option'],
        'button' => ['Nút gửi', 'Register to Volunteer'],
        'done_title' => ['Tiêu đề khi gửi xong', 'Registration successful!'],
        'done_text' => ['Lời cảm ơn khi gửi xong ({name} là tên người đăng ký)', 'Thank you, {name}! Your registration has been recorded. We\'ll be in touch soon.'],
        'done_button' => ['Nút đóng, khi gửi xong', 'Done'],
        'send_error' => ['Báo lỗi khi không gửi được', 'Sorry, your registration could not be sent. Please try again in a moment.'],
    ];
}

/** The texts not seen on the form as it opens: edited in fields under it. */
const LDV_FORM_OTHER_TEXTS = ['project_placeholder', 'select_placeholder', 'done_title', 'done_text', 'done_button', 'send_error'];

const LDV_DEFAULT_ROLES = "Clean-up\nMedia\nLeader\nLogistics";

/** The form's parts => the column they start in. */
const LDV_PARTS = ['join' => 'left', 'project' => 'left', 'role' => 'left', 'info' => 'right', 'people' => 'right'];

/** The form's own fields of "Personal information"; name and email are always asked for. */
const LDV_BUILTIN_FIELDS = ['name', 'phone', 'email', 'birth', 'address'];

/** Fonts to choose from: name => [label, CSS font-family] ('' = the system's). Google Fonts, with Vietnamese. */
const LDV_FONTS = [
    '' => ['Mặc định', ''],
    'Be Vietnam Pro' => ['Be Vietnam Pro', "'Be Vietnam Pro', sans-serif"],
    'Poppins' => ['Poppins', "'Poppins', sans-serif"],
    'Montserrat' => ['Montserrat', "'Montserrat', sans-serif"],
    'Roboto' => ['Roboto', "'Roboto', sans-serif"],
    'Nunito' => ['Nunito', "'Nunito', sans-serif"],
    'Inter' => ['Inter', "'Inter', sans-serif"],
    'Lora' => ['Lora (có chân)', "'Lora', serif"],
];

function ldv_font_url(string $font): string
{
    return $font === '' ? '' : 'https://fonts.googleapis.com/css2?family=' . str_replace(' ', '+', $font) . ':wght@400;500;700&display=swap';
}

function ldv_default_fields(): array
{
    return [
        ['key' => 'name', 'required' => true, 'wide' => false, 'off' => false],
        ['key' => 'phone', 'required' => false, 'wide' => false, 'off' => false],
        ['key' => 'email', 'required' => true, 'wide' => false, 'off' => false],
        ['key' => 'birth', 'required' => true, 'wide' => false, 'off' => false],
        ['key' => 'address', 'required' => true, 'wide' => true, 'off' => false],
    ];
}

/** The fields as saved, made sure of: known keys once each, the form's own always there. */
function ldv_clean_fields($list): array
{
    if (!is_array($list) || !$list) {
        return ldv_default_fields();
    }
    $out = [];
    $seen = [];
    foreach ($list as $f) {
        $key = is_array($f) ? (string) ($f['key'] ?? '') : '';
        $own = in_array($key, LDV_BUILTIN_FIELDS, true);
        if (isset($seen[$key]) || (!$own && !preg_match('/^c\d{1,6}$/', $key))) {
            continue;
        }
        $seen[$key] = true;
        $item = ['key' => $key, 'required' => !empty($f['required']), 'wide' => !empty($f['wide']), 'off' => !empty($f['off'])];
        if ($key === 'name' || $key === 'email') {
            $item['required'] = true;
            $item['off'] = false;
        }
        if (!$own) {
            $options = array_map(fn($o) => sanitize_text_field((string) $o), is_array($f['options'] ?? null) ? $f['options'] : []);
            $item += [
                'type' => in_array($f['type'] ?? '', ['text', 'select', 'check'], true) ? $f['type'] : 'text',
                'label' => sanitize_text_field((string) ($f['label'] ?? '')) ?: 'New field',
                'placeholder' => sanitize_text_field((string) ($f['placeholder'] ?? '')),
                'options' => array_slice(array_values(array_filter($options, 'strlen')), 0, 50),
            ];
        }
        $out[] = $item;
    }
    foreach (ldv_default_fields() as $d) {
        if (!isset($seen[$d['key']])) {
            $out[] = $d;
        }
    }
    return array_slice($out, 0, 40);
}

/** The parts in each column, each once; "off": left out ("info" never is). */
function ldv_clean_layout($layout): array
{
    $layout = is_array($layout) ? $layout : [];
    $out = ['left' => [], 'right' => [], 'off' => []];
    $seen = [];
    foreach (['left', 'right'] as $col) {
        foreach ((array) ($layout[$col] ?? []) as $part) {
            if (is_string($part) && isset(LDV_PARTS[$part]) && !isset($seen[$part])) {
                $out[$col][] = $part;
                $seen[$part] = true;
            }
        }
    }
    foreach (LDV_PARTS as $part => $col) {
        if (!isset($seen[$part])) {
            $out[$col][] = $part;
        }
    }
    $out['off'] = array_values(array_diff(array_intersect(array_keys(LDV_PARTS), (array) ($layout['off'] ?? [])), ['info']));
    return $out;
}

function ldv_clean_style($style): array
{
    $style = is_array($style) ? $style : [];
    $hex = fn($v) => is_string($v) && preg_match('/^#[0-9a-fA-F]{6}$/', $v) ? strtolower($v) : '';
    return [
        'primary' => $hex($style['primary'] ?? '') ?: '#e8197c',
        'text' => $hex($style['text'] ?? '') ?: '#0f1f4b',
        'head' => $hex($style['head'] ?? ''), // '' = the sky and greenery
        'head_image' => esc_url_raw((string) ($style['head_image'] ?? '')),
        'font' => is_string($style['font'] ?? null) && array_key_exists($style['font'], LDV_FONTS) ? $style['font'] : '',
        'radius' => isset($style['radius']) && is_numeric($style['radius']) ? max(0, min(40, (int) $style['radius'])) : 26,
    ];
}

/** The form as set: texts, roles, photo, layout, fields, style. */
function ldv_form(): array
{
    $saved = (array) get_option(LDV_FORM_OPTION, []);
    $text = [];
    foreach (ldv_form_texts() as $key => $field) {
        $text[$key] = trim((string) ($saved['text'][$key] ?? '')) ?: $field[1];
    }
    $roles = array_values(array_unique(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', (string) ($saved['roles'] ?? ''))))));
    return [
        'text' => $text,
        'roles' => $roles ?: explode("\n", LDV_DEFAULT_ROLES),
        'photo' => (string) ($saved['photo'] ?? '') ?: LDM_URL . 'assets/images/volunteer.jpg',
        'layout' => ldv_clean_layout($saved['layout'] ?? null),
        'fields' => ldv_clean_fields($saved['fields'] ?? null),
        'style' => ldv_clean_style($saved['style'] ?? null),
    ];
}

/** What assets/js/volunteer.js is given of it (window.LDIVN_VOLUNTEER). */
function ldv_form_js(array $form): array
{
    $s = $form['style'];
    return [
        'photo' => $form['photo'],
        'text' => $form['text'],
        'roles' => $form['roles'],
        'layout' => $form['layout'],
        'fields' => $form['fields'],
        'style' => [
            'primary' => $s['primary'],
            'text' => $s['text'],
            'head' => $s['head'],
            'headImage' => $s['head_image'],
            'fontFamily' => LDV_FONTS[$s['font']][1],
            'radius' => $s['radius'],
        ],
    ];
}

/** The fields of one's own, as set (key => field). */
function ldv_custom_fields(): array
{
    $out = [];
    foreach (ldv_form()['fields'] as $f) {
        if (!in_array($f['key'], LDV_BUILTIN_FIELDS, true)) {
            $out[$f['key']] = $f;
        }
    }
    return $out;
}

add_action('admin_menu', function () {
    add_submenu_page('edit.php?post_type=' . LDV_TYPE, 'Sửa form đăng ký', 'Sửa form đăng ký', 'manage_options', 'ldv-form', 'ldv_form_page');
});

add_action('admin_init', function () {
    register_setting('ldv_form', LDV_FORM_OPTION, [
        'type' => 'array',
        'sanitize_callback' => function ($in) {
            $in = is_array($in) ? $in : [];
            $text = [];
            foreach (ldv_form_texts() as $key => $field) {
                if (isset($in['text'][$key])) {
                    $text[$key] = sanitize_text_field((string) $in['text'][$key]);
                }
            }
            $json = fn($k) => isset($in[$k]) && is_string($in[$k]) ? json_decode($in[$k], true) : null;
            return [
                'text' => $text,
                'roles' => sanitize_textarea_field((string) ($in['roles'] ?? '')),
                'photo' => esc_url_raw(trim((string) ($in['photo'] ?? ''))),
                'layout' => ldv_clean_layout($json('layout')),
                'fields' => ldv_clean_fields($json('fields')),
                'style' => ldv_clean_style($in['style'] ?? null),
            ];
        },
    ]);
});

// The page draws the form itself (assets/js/volunteer.js, edit mode) and edits it in place (volunteer-edit.js).
add_action('admin_enqueue_scripts', function () {
    if (($_GET['page'] ?? '') !== 'ldv-form') {
        return;
    }
    $form = ldv_form();
    wp_enqueue_media();
    wp_enqueue_style('ldv-edit-form', LDM_URL . 'assets/css/volunteer.css', [], LDM_VERSION);
    if ($form['style']['font'] !== '') {
        wp_enqueue_style('ldv-font', ldv_font_url($form['style']['font']), [], null);
    }
    wp_enqueue_script('ldv-edit-form', LDM_URL . 'assets/js/volunteer.js', [], LDM_VERSION, true);
    wp_add_inline_script('ldv-edit-form', 'window.LDIVN_VOLUNTEER = ' . wp_json_encode([
        'edit' => true,
        'api' => add_query_arg('ldv_api', '1', home_url('/')),
        'ajax' => admin_url('admin-ajax.php'),
        'logo' => LDM_URL . 'assets/images/logo-icon-light.png',
    ] + ldv_form_js($form)) . ';', 'before');
    wp_enqueue_script('ldv-edit', LDM_URL . 'assets/js/volunteer-edit.js', ['ldv-edit-form', 'jquery-ui-sortable'], LDM_VERSION, true);
    $fonts = [];
    foreach (LDV_FONTS as $key => $font) {
        $fonts[$key] = ['family' => $font[1], 'url' => ldv_font_url($key)];
    }
    wp_add_inline_script('ldv-edit', 'window.LDV_EDIT = ' . wp_json_encode(['fonts' => $fonts]) . ';', 'before');
});

add_action('admin_post_ldv_form_reset', function () {
    if (!current_user_can('manage_options')) {
        wp_die('Bạn không có quyền làm việc này.');
    }
    check_admin_referer('ldv_form_reset');
    delete_option(LDV_FORM_OPTION);
    wp_safe_redirect(admin_url('edit.php?post_type=' . LDV_TYPE . '&page=ldv-form&ldv_reset=1'));
    exit;
});

function ldv_form_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $saved = (array) get_option(LDV_FORM_OPTION, []);
    $form = ldv_form();
    $style = $form['style'];
    $texts = ldv_form_texts();
    $opt = fn($name) => esc_attr(LDV_FORM_OPTION . $name);
    ?>
    <div class="wrap">
        <h1>Sửa form đăng ký tình nguyện viên</h1>
        <?php settings_errors(); ?>
        <?php if (!empty($_GET['ldv_reset'])) : ?>
            <div class="notice notice-success is-dismissible"><p>Form đã về như mặc định.</p></div>
        <?php endif; ?>
        <p class="ldv-edit-hint">
            <strong>Sửa ngay trên form:</strong> bấm vào chữ để gõ (cả chữ mờ trong ô) · bấm ảnh tròn để đổi ảnh ·
            rê chuột vào một mục hay một ô để <strong>kéo ⠿</strong> đổi chỗ, <strong>ẩn</strong>, đặt <strong>bắt buộc</strong>, <strong>rộng</strong> cả hàng.
            Bấm biểu tượng Group / Organization để sửa phần đăng ký theo nhóm. Màu, font, bo góc ở khung bên phải.
            Dự án trong form lấy từ các điểm ở <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . LDM_TYPE)); ?>">Bản đồ dọn rác</a>.
            <a href="<?php echo esc_url(ldv_page_url()); ?>" target="_blank" rel="noopener">Xem form trên web ↗</a>
        </p>

        <div class="ldv-edit-wrap">
            <div class="ldv-edit-box"><div data-ldv-form=""></div></div>

            <aside class="ldv-edit-panel">
                <h2>Thiết kế</h2>
                <label class="ldv-edit-row">Màu chính <input type="color" form="ldv-edit-save" name="<?php echo $opt('[style][primary]'); ?>" value="<?php echo esc_attr($style['primary']); ?>" data-style="primary"></label>
                <label class="ldv-edit-row">Màu chữ <input type="color" form="ldv-edit-save" name="<?php echo $opt('[style][text]'); ?>" value="<?php echo esc_attr($style['text']); ?>" data-style="text"></label>
                <div class="ldv-edit-row">Nền đầu form
                    <span>
                        <input type="color" value="<?php echo esc_attr($style['head'] ?: '#e3f0fa'); ?>" data-style="head" title="Chọn màu nền">
                        <button type="button" class="button button-small" data-head="image">Ảnh…</button>
                        <button type="button" class="button-link" data-head="reset" title="Trời xanh, cây lá như ban đầu">Mặc định</button>
                    </span>
                </div>
                <input type="hidden" form="ldv-edit-save" name="<?php echo $opt('[style][head]'); ?>" value="<?php echo esc_attr($style['head']); ?>">
                <input type="hidden" form="ldv-edit-save" name="<?php echo $opt('[style][head_image]'); ?>" value="<?php echo esc_attr($style['head_image']); ?>">
                <label class="ldv-edit-row">Font chữ
                    <select form="ldv-edit-save" name="<?php echo $opt('[style][font]'); ?>" data-style="font">
                        <?php foreach (LDV_FONTS as $key => $font) : ?>
                            <option value="<?php echo esc_attr($key); ?>" <?php selected($style['font'], $key); ?>><?php echo esc_html($font[0]); ?></option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label class="ldv-edit-row">Bo góc <input type="range" min="0" max="40" form="ldv-edit-save" name="<?php echo $opt('[style][radius]'); ?>" value="<?php echo (int) $style['radius']; ?>" data-style="radius"></label>

                <h2>Thêm ô</h2>
                <p class="ldv-edit-adds">
                    <button type="button" class="button" data-add="text">+ Ô chữ</button>
                    <button type="button" class="button" data-add="select">+ Danh sách chọn</button>
                    <button type="button" class="button" data-add="check">+ Ô tích</button>
                </p>
                <p class="description">Ô mới hiện ở cuối "Personal information"; kéo ⠿ để đổi chỗ. Câu trả lời có trong danh sách đăng ký và file Excel.</p>

                <p><button type="submit" form="ldv-edit-save" class="button button-primary button-large">Lưu form</button></p>
            </aside>
        </div>

        <form method="post" action="options.php" id="ldv-edit-save" class="ldv-edit-save">
            <?php settings_fields('ldv_form'); ?>
            <?php foreach ($texts as $key => $field) : ?>
                <?php if (!in_array($key, LDV_FORM_OTHER_TEXTS, true)) : ?>
                    <input type="hidden" name="<?php echo $opt('[text][' . $key . ']'); ?>" value="<?php echo esc_attr($saved['text'][$key] ?? ''); ?>">
                <?php endif; ?>
            <?php endforeach; ?>
            <textarea name="<?php echo $opt('[roles]'); ?>" hidden><?php echo esc_textarea($saved['roles'] ?? ''); ?></textarea>
            <input type="hidden" name="<?php echo $opt('[photo]'); ?>" value="<?php echo esc_attr($saved['photo'] ?? ''); ?>">
            <input type="hidden" name="<?php echo $opt('[fields]'); ?>" value="<?php echo esc_attr(wp_json_encode($form['fields'])); ?>">
            <input type="hidden" name="<?php echo $opt('[layout]'); ?>" value="<?php echo esc_attr(wp_json_encode($form['layout'])); ?>">

            <h2>Các chữ khác</h2>
            <table class="form-table" role="presentation">
                <?php foreach (LDV_FORM_OTHER_TEXTS as $key) : ?>
                    <tr>
                        <th scope="row"><label for="ldv-t-<?php echo esc_attr($key); ?>"><?php echo esc_html($texts[$key][0]); ?></label></th>
                        <td><input id="ldv-t-<?php echo esc_attr($key); ?>" name="<?php echo $opt('[text][' . $key . ']'); ?>" value="<?php echo esc_attr($saved['text'][$key] ?? ''); ?>" placeholder="<?php echo esc_attr($texts[$key][1]); ?>" class="large-text"></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php submit_button('Lưu form'); ?>
        </form>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" onsubmit="return confirm('Đưa mọi chữ, ảnh, ô, thứ tự và màu của form về như mặc định?');">
            <input type="hidden" name="action" value="ldv_form_reset">
            <?php wp_nonce_field('ldv_form_reset'); ?>
            <?php submit_button('Khôi phục form mặc định', 'delete small', 'submit', false); ?>
        </form>
    </div>
    <style>
        .ldv-edit-hint { max-width: 1260px; font-size: 14px; }
        .ldv-edit-wrap { display: flex; align-items: flex-start; gap: 24px; margin: 16px 0 8px; }
        .ldv-edit-box { flex: 1 1 auto; min-width: 0; max-width: 1000px; }
        .ldv-edit-panel { position: sticky; top: 48px; flex: 0 0 260px; padding: 4px 16px 12px; border: 1px solid #dcdcde; border-radius: 8px; background: #fff; }
        .ldv-edit-panel h2 { margin: 12px 0 8px; font-size: 14px; }
        .ldv-edit-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 8px 0; }
        .ldv-edit-row input[type="color"] { width: 44px; height: 28px; padding: 0 2px; }
        .ldv-edit-row input[type="range"] { width: 120px; }
        .ldv-edit-adds { display: flex; flex-wrap: wrap; gap: 6px; }
        @media (max-width: 1100px) { .ldv-edit-wrap { flex-direction: column-reverse; } .ldv-edit-panel { position: static; } }

        /* On the form: what can be typed into, dragged, switched. */
        .ldv-edit-box [contenteditable] { border-radius: 4px; outline: 1px dashed transparent; outline-offset: 3px; cursor: text; transition: outline-color 0.15s; }
        .ldv-edit-box [contenteditable]:hover { outline-color: rgba(232, 25, 124, 0.6); }
        .ldv-edit-box [contenteditable]:focus { outline: 2px solid #e8197c; }
        .ldv-edit-box .ldv-edit-ph { color: #9ca3af !important; }
        .ldv-edit-box .ldv-edit-ph:focus { color: var(--ldv-navy) !important; }
        .ldv-edit-box .ldv-photo { pointer-events: auto; cursor: pointer; }
        .ldv-edit-box .ldv-photo::after { content: "Đổi ảnh"; position: absolute; left: 50%; bottom: -4px; transform: translateX(-50%); padding: 2px 10px; border-radius: 999px; background: #0f1f4b; color: #fff; font-size: 12px; white-space: nowrap; opacity: 0; transition: opacity 0.15s; }
        .ldv-edit-box .ldv-photo:hover::after { opacity: 1; }
        .ldv-edit-box section, .ldv-edit-box .ldv-cell { position: relative; }
        .ldv-edit-box [data-off] { opacity: 0.4; }
        .ldv-edit-box [data-off]::after { content: "Đang ẩn"; position: absolute; right: 0; top: 0; z-index: 3; padding: 0 6px; border-radius: 4px; background: #64748b; color: #fff; font-size: 11px; line-height: 16px; }
        .ldv-edit-box .ldv-birth-box[data-off] { position: relative; }
        .ldv-edit-bar { position: absolute; top: -6px; right: 0; z-index: 5; display: none; gap: 2px; padding: 2px; border-radius: 6px; background: #0f1f4b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
        section:hover > .ldv-edit-bar, .ldv-cell:hover > .ldv-edit-bar { display: flex; }
        .ldv-cell:hover > .ldv-edit-bar { top: -10px; }
        .ldv-edit-bar button, .ldv-edit-bar span { display: inline-flex; align-items: center; height: 22px; margin: 0; padding: 0 7px; border: 0; border-radius: 4px; background: transparent; color: #fff; font: 600 11px/1 -apple-system, "Segoe UI", sans-serif; cursor: pointer; }
        .ldv-edit-bar button:hover { background: rgba(255, 255, 255, 0.15); }
        .ldv-edit-bar .is-on { background: #e8197c; }
        .ldv-edit-bar .ldv-edit-grip { cursor: grab; font-size: 14px; }
        .ldv-edit-slot { min-height: 60px; border: 2px dashed #e8197c; border-radius: 12px; background: rgba(232, 25, 124, 0.05); }
        .ldv-edit-box .ldv-role { position: relative; }
        .ldv-edit-box .ldv-edit-del { display: none; position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; background: #0f1f4b; color: #fff; font-size: 14px; line-height: 20px; cursor: pointer; }
        .ldv-edit-box .ldv-role:hover .ldv-edit-del { display: block; }
        .ldv-edit-box .ldv-edit-add { min-height: 64px; border: 2px dashed #cfd6e4; border-radius: 14px; background: transparent; color: #64748b; font-size: 24px; cursor: pointer; }
        .ldv-edit-box .ldv-edit-add:hover { border-color: #e8197c; color: #e8197c; }
        .ldv-edit-box .ldv-edit-opts { display: block; width: 100%; margin-top: 6px; font-size: 13px; }
        .ldv-edit-box .ldv-submit { cursor: default; }
    </style>
    <?php
}
