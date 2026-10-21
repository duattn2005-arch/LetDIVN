<?php
// /volunteer/ as a page of its own (includes/volunteer.php): the site's header and
// footer, the "Register to Volunteer" form between them (assets/css/volunteer.css).

defined('ABSPATH') || exit;

get_header();
?>
<main class="ldv-page">
    <div class="ldv-page-in">
        <?php echo do_shortcode('[ldivn_volunteer_form]'); ?>
    </div>
</main>
<?php
get_footer();
