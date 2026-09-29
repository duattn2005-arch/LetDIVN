<?php
// Tình nguyện viên → Sửa form đăng ký: the texts, the photo and the role
// choices of the "Register to Volunteer" form (assets/js/volunteer.js draws it
// with them). What is left empty takes the website's own text.

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

add_action('admin_enqueue_scripts', function ($hook) {
    if (($_GET['page'] ?? '') === 'ldv-form') {
        wp_enqueue_media();
    }
});

function ldv_form_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    $saved = (array) get_option(LDV_FORM_OPTION, []);
    $form = ldv_form();
    $name = fn($key) => esc_attr(LDV_FORM_OPTION . '[text][' . $key . ']');
    ?>
    <div class="wrap">
        <h1>Sửa form đăng ký tình nguyện viên</h1>
        <p>Chữ, ảnh và các vai trò của form "Register to Volunteer". Ô nào để trống thì dùng chữ mặc định (chữ mờ trong ô).
            Danh sách <strong>dự án / chiến dịch</strong> trong form lấy từ các điểm ở menu <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . LDM_TYPE)); ?>">Bản đồ dọn rác</a> chưa diễn ra.
            <a href="<?php echo esc_url(ldv_page_url()); ?>" target="_blank" rel="noopener">Xem form ↗</a></p>

        <form method="post" action="options.php">
            <?php settings_fields('ldv_form'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Ảnh tròn ở góc phải</th>
                    <td>
                        <img src="<?php echo esc_url($form['photo']); ?>" alt="" class="ldv-photo-preview" style="width:96px;height:96px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:12px">
                        <input type="hidden" name="<?php echo esc_attr(LDV_FORM_OPTION . '[photo]'); ?>" value="<?php echo esc_attr($saved['photo'] ?? ''); ?>" class="ldv-photo-input">
                        <button type="button" class="button ldv-photo-pick">Chọn ảnh</button>
                        <button type="button" class="button-link ldv-photo-reset" style="margin-left:8px">Dùng ảnh mặc định</button>
                    </td>
                </tr>
                <?php foreach (ldv_form_texts() as $key => $field) : ?>
                    <?php if (!isset($field[1])) : ?>
                        <tr><th colspan="2"><h2 style="margin:12px 0 0"><?php echo esc_html($field[0]); ?></h2></th></tr>
                        <?php continue; ?>
                    <?php endif; ?>
                    <tr>
                        <th scope="row"><label for="ldv-t-<?php echo esc_attr($key); ?>"><?php echo esc_html($field[0]); ?></label></th>
                        <td><input id="ldv-t-<?php echo esc_attr($key); ?>" name="<?php echo $name($key); ?>" value="<?php echo esc_attr($saved['text'][$key] ?? ''); ?>" placeholder="<?php echo esc_attr($field[1]); ?>" class="large-text"></td>
                    </tr>
                    <?php if ($key === 'role_title') : ?>
                        <tr>
                            <th scope="row"><label for="ldv-roles">· Các vai trò</label></th>
                            <td>
                                <textarea id="ldv-roles" name="<?php echo esc_attr(LDV_FORM_OPTION . '[roles]'); ?>" rows="5" class="regular-text" placeholder="<?php echo esc_attr(LDV_DEFAULT_ROLES); ?>"><?php echo esc_textarea($saved['roles'] ?? ''); ?></textarea>
                                <p class="description">Mỗi dòng một vai trò (nên 2–6). Vai trò đầu tiên được chọn sẵn.</p>
                            </td>
                        </tr>
                    <?php endif; ?>
                <?php endforeach; ?>
            </table>
            <?php submit_button('Lưu form'); ?>
        </form>
    </div>
    <script>
    (function () {
      var input = document.querySelector('.ldv-photo-input');
      var img = document.querySelector('.ldv-photo-preview');
      var fallback = <?php echo wp_json_encode(LDM_URL . 'assets/images/volunteer.jpg'); ?>;
      var frame;
      document.querySelector('.ldv-photo-pick').addEventListener('click', function () {
        frame = frame || wp.media({ title: 'Chọn ảnh cho form', library: { type: 'image' }, multiple: false });
        frame.off('select').on('select', function () {
          var file = frame.state().get('selection').first().toJSON();
          var url = (file.sizes && file.sizes.medium_large ? file.sizes.medium_large.url : file.url);
          input.value = url;
          img.src = url;
        });
        frame.open();
      });
      document.querySelector('.ldv-photo-reset').addEventListener('click', function () {
        input.value = '';
        img.src = fallback;
      });
    })();
    </script>
    <?php
}
