<?php
// Tình nguyện viên → Sửa form đăng ký: the texts, the photo and the role
// choices of the "Register to Volunteer" form (assets/js/volunteer.js draws it
// with them), edited on the form itself (assets/js/volunteer-edit.js). What is
// left empty takes the website's own text.

defined('ABSPATH') || exit;

const LDV_FORM_OPTION = 'ldv_form';

/** The form's texts, in its order: key => [label in the admin, default]; a key without a default starts a new part. */
function ldv_form_texts(): array
{
    return [
        '_head' => ['Đầu form'],
        'title' => ['Tiêu đề', 'Register to Volunteer'],
        'subtitle' => ['Dòng dưới tiêu đề', 'Be part of a cleaner, greener and more beautiful Vietnam!'],
        '_choices' => ['Cột trái'],
        'join_title' => ['Mục "Tham gia với tư cách"', 'Join as'],
        'join_individual' => ['· Cá nhân', 'Individual'],
        'join_group' => ['· Nhóm', 'Group'],
        'join_organization' => ['· Tổ chức', 'Organization'],
        'project_title' => ['Mục "Dự án / chiến dịch"', 'Project or campaign'],
        'project_placeholder' => ['· Chữ khi chưa chọn', 'Select a project or campaign'],
        'role_title' => ['Mục "Vai trò"', 'Preferred role'],
        '_info' => ['Cột phải'],
        'info_title' => ['Mục "Thông tin cá nhân"', 'Personal information'],
        'name_label' => ['Họ tên', 'Full name'],
        'name_placeholder' => ['· Chữ mờ trong ô', 'Enter your full name'],
        'contact_label' => ['Họ tên, khi đăng ký theo nhóm / tổ chức', 'Contact person'],
        'contact_placeholder' => ['· Chữ mờ trong ô', 'Enter the contact person’s full name'],
        'phone_label' => ['Điện thoại', 'Phone number'],
        'phone_placeholder' => ['· Chữ mờ trong ô', 'Enter your phone number (optional)'],
        'email_label' => ['Email', 'Email address'],
        'email_placeholder' => ['· Chữ mờ trong ô', 'Enter your email address'],
        'birth_label' => ['Ngày sinh (cá nhân)', 'Date of birth'],
        'group_label' => ['Tên nhóm (thay ô ngày sinh)', 'Group name'],
        'group_placeholder' => ['· Chữ mờ trong ô', 'Enter your group name'],
        'organization_label' => ['Tên tổ chức (thay ô ngày sinh)', 'Organization name'],
        'organization_placeholder' => ['· Chữ mờ trong ô', 'Enter your company or organization name'],
        'address_label' => ['Địa chỉ', 'Address'],
        'address_placeholder' => ['· Chữ mờ trong ô', 'Enter your address'],
        'people_title' => ['Mục "Số người tham gia"', 'Number of participants'],
        '_done' => ['Gửi đi'],
        'button' => ['Nút gửi', 'Register to Volunteer'],
        'done_title' => ['Tiêu đề khi gửi xong', 'Registration successful!'],
        'done_text' => ['Lời cảm ơn ({name} là tên người đăng ký)', 'Thank you, {name}! Your registration has been recorded. We\'ll be in touch soon.'],
        'done_button' => ['Nút đóng', 'Done'],
        'send_error' => ['Báo lỗi khi không gửi được', 'Sorry, your registration could not be sent. Please try again in a moment.'],
    ];
}

const LDV_DEFAULT_ROLES = "Clean-up\nMedia\nLeader\nLogistics";

/** The form as set: ['text' => key => text, 'roles' => [...], 'photo' => url]. */
function ldv_form(): array
{
    $saved = (array) get_option(LDV_FORM_OPTION, []);
    $text = [];
    foreach (ldv_form_texts() as $key => $field) {
        if (isset($field[1])) {
            $text[$key] = trim((string) ($saved['text'][$key] ?? '')) ?: $field[1];
        }
    }
    $roles = array_values(array_unique(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', (string) ($saved['roles'] ?? ''))))));
    return [
        'text' => $text,
        'roles' => $roles ?: explode("\n", LDV_DEFAULT_ROLES),
        'photo' => (string) ($saved['photo'] ?? '') ?: LDM_URL . 'assets/images/volunteer.jpg',
    ];
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
                if (isset($field[1], $in['text'][$key])) {
                    $text[$key] = sanitize_text_field((string) $in['text'][$key]);
                }
            }
            return [
                'text' => $text,
                'roles' => sanitize_textarea_field((string) ($in['roles'] ?? '')),
                'photo' => esc_url_raw(trim((string) ($in['photo'] ?? ''))),
            ];
        },
    ]);
});

/** The texts not seen on the form as it opens: edited in fields under it. */
const LDV_FORM_OTHER_TEXTS = ['project_placeholder', 'done_title', 'done_text', 'done_button', 'send_error'];

// The page draws the form itself (assets/js/volunteer.js, edit mode) and edits it in place (volunteer-edit.js).
add_action('admin_enqueue_scripts', function () {
    if (($_GET['page'] ?? '') !== 'ldv-form') {
        return;
    }
    $form = ldv_form();
    wp_enqueue_media();
    wp_enqueue_style('ldv-edit-form', LDM_URL . 'assets/css/volunteer.css', [], LDM_VERSION);
    wp_enqueue_script('ldv-edit-form', LDM_URL . 'assets/js/volunteer.js', [], LDM_VERSION, true);
    wp_add_inline_script('ldv-edit-form', 'window.LDIVN_VOLUNTEER = ' . wp_json_encode([
        'edit' => true,
        'api' => add_query_arg('ldv_api', '1', home_url('/')),
        'ajax' => admin_url('admin-ajax.php'),
        'logo' => LDM_URL . 'assets/images/logo-icon-light.png',
        'photo' => $form['photo'],
        'text' => $form['text'],
        'roles' => $form['roles'],
    ]) . ';', 'before');
    wp_enqueue_script('ldv-edit', LDM_URL . 'assets/js/volunteer-edit.js', ['ldv-edit-form'], LDM_VERSION, true);
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
    $texts = ldv_form_texts();
    $name = fn($key) => esc_attr(LDV_FORM_OPTION . '[text][' . $key . ']');
    ?>
    <div class="wrap">
        <h1>Sửa form đăng ký tình nguyện viên</h1>
        <?php settings_errors(); ?>
        <?php if (!empty($_GET['ldv_reset'])) : ?>
            <div class="notice notice-success is-dismissible"><p>Form đã về như mặc định.</p></div>
        <?php endif; ?>
        <p style="max-width:1000px;font-size:14px">
            <strong>Bấm vào chữ bất kỳ trên form để sửa ngay tại chỗ</strong>: tiêu đề, tên các mục, tên ô, chữ mờ trong ô, chữ trên nút.
            Bấm vào <strong>ảnh tròn</strong> để đổi ảnh. Vai trò: rê chuột vào để thấy nút <strong>×</strong> xoá, nút <strong>+</strong> để thêm.
            Chọn <em>Group</em> / <em>Organization</em> trên form (bấm vào biểu tượng) để sửa chữ khi đăng ký theo nhóm, tổ chức.
            Xoá trắng một chữ thì dùng lại chữ mặc định. Sửa xong bấm <strong>Lưu form</strong> ở dưới.<br>
            Danh sách <strong>dự án / chiến dịch</strong> lấy từ các điểm chưa diễn ra ở menu <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . LDM_TYPE)); ?>">Bản đồ dọn rác</a>.
            <a href="<?php echo esc_url(ldv_page_url()); ?>" target="_blank" rel="noopener">Xem form trên web ↗</a>
        </p>

        <div class="ldv-edit-box"><div data-ldv-form=""></div></div>

        <form method="post" action="options.php" class="ldv-edit-save">
            <?php settings_fields('ldv_form'); ?>
            <?php foreach ($texts as $key => $field) : ?>
                <?php if (isset($field[1]) && !in_array($key, LDV_FORM_OTHER_TEXTS, true)) : ?>
                    <input type="hidden" name="<?php echo $name($key); ?>" value="<?php echo esc_attr($saved['text'][$key] ?? ''); ?>">
                <?php endif; ?>
            <?php endforeach; ?>
            <textarea name="<?php echo esc_attr(LDV_FORM_OPTION . '[roles]'); ?>" hidden><?php echo esc_textarea($saved['roles'] ?? ''); ?></textarea>
            <input type="hidden" name="<?php echo esc_attr(LDV_FORM_OPTION . '[photo]'); ?>" value="<?php echo esc_attr($saved['photo'] ?? ''); ?>">

            <h2>Các chữ khác</h2>
            <table class="form-table" role="presentation">
                <?php foreach (LDV_FORM_OTHER_TEXTS as $key) : ?>
                    <tr>
                        <th scope="row"><label for="ldv-t-<?php echo esc_attr($key); ?>"><?php echo esc_html($texts[$key][0]); ?></label></th>
                        <td><input id="ldv-t-<?php echo esc_attr($key); ?>" name="<?php echo $name($key); ?>" value="<?php echo esc_attr($saved['text'][$key] ?? ''); ?>" placeholder="<?php echo esc_attr($texts[$key][1]); ?>" class="large-text"></td>
                    </tr>
                <?php endforeach; ?>
            </table>
            <?php submit_button('Lưu form'); ?>
        </form>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" onsubmit="return confirm('Đưa mọi chữ, ảnh và vai trò của form về như mặc định?');">
            <input type="hidden" name="action" value="ldv_form_reset">
            <?php wp_nonce_field('ldv_form_reset'); ?>
            <?php submit_button('Khôi phục form mặc định', 'delete small', 'submit', false); ?>
        </form>
    </div>
    <style>
        .ldv-edit-box { max-width: 1000px; margin: 16px 0 8px; }
        .ldv-edit-box [contenteditable] { border-radius: 4px; outline: 1px dashed transparent; outline-offset: 3px; cursor: text; transition: outline-color 0.15s; }
        .ldv-edit-box [contenteditable]:hover { outline-color: rgba(232, 25, 124, 0.6); }
        .ldv-edit-box [contenteditable]:focus { outline: 2px solid #e8197c; }
        .ldv-edit-box .ldv-edit-ph { color: #9ca3af !important; }
        .ldv-edit-box .ldv-edit-ph:focus { color: #0f1f4b !important; }
        .ldv-edit-box .ldv-photo { pointer-events: auto; cursor: pointer; }
        .ldv-edit-box .ldv-photo::after { content: "Đổi ảnh"; position: absolute; left: 50%; bottom: -4px; transform: translateX(-50%); padding: 2px 10px; border-radius: 999px; background: #0f1f4b; color: #fff; font-size: 12px; white-space: nowrap; opacity: 0; transition: opacity 0.15s; }
        .ldv-edit-box .ldv-photo:hover::after { opacity: 1; }
        .ldv-edit-box .ldv-role { position: relative; }
        .ldv-edit-box .ldv-edit-del { display: none; position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; padding: 0; border: 0; border-radius: 50%; background: #0f1f4b; color: #fff; font-size: 14px; line-height: 20px; cursor: pointer; }
        .ldv-edit-box .ldv-role:hover .ldv-edit-del { display: block; }
        .ldv-edit-box .ldv-edit-add { min-height: 64px; border: 2px dashed #cfd6e4; border-radius: 14px; background: transparent; color: #64748b; font-size: 24px; cursor: pointer; }
        .ldv-edit-box .ldv-edit-add:hover { border-color: #e8197c; color: #e8197c; }
        .ldv-edit-box .ldv-submit { cursor: default; }
    </style>
    <?php
}

