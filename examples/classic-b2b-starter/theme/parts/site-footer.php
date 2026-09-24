<?php
/**
 * Global footer.
 *
 * @package b2b-starter
 */
?>
<footer class="site-footer shell">
<div><p class="footer-brand"><?php bloginfo('name'); ?></p><p><?php echo esc_html(Starter\Theme\get_setting('footer_about', get_bloginfo('description'))); ?></p></div>
<div><strong><?php esc_html_e('Contact', 'b2b-starter'); ?></strong><p>
<a href="mailto:<?php echo esc_attr(Starter\Theme\get_setting('contact_email', 'sales@yourcompany.com')); ?>"><?php echo esc_html(Starter\Theme\get_setting('contact_email', 'sales@yourcompany.com')); ?></a><br>
<?php if (Starter\Theme\get_setting('contact_phone')) echo esc_html(Starter\Theme\get_setting('contact_phone')) . '<br>'; ?>
<?php echo esc_html(Starter\Theme\get_setting('contact_hours', 'Mon–Fri, 9:00–18:00 (GMT+8)')); ?></p></div>
<div><strong><?php esc_html_e('Explore', 'b2b-starter'); ?></strong><p>
<a href="<?php echo esc_url(get_post_type_archive_link('starter_product') ?: home_url('/products/')); ?>"><?php esc_html_e('Products', 'b2b-starter'); ?></a><br>
<a href="<?php echo esc_url(get_post_type_archive_link('starter_industry') ?: home_url('/industries/')); ?>"><?php esc_html_e('Industries', 'b2b-starter'); ?></a><br>
<a href="<?php echo esc_url(home_url('/about/')); ?>"><?php esc_html_e('About', 'b2b-starter'); ?></a><br>
<a href="<?php echo esc_url(home_url('/contact/')); ?>"><?php esc_html_e('Contact', 'b2b-starter'); ?></a></p></div>
<?php $linkedin = Starter\Theme\get_setting('social_linkedin'); $youtube = Starter\Theme\get_setting('social_youtube'); ?>
<?php if ($linkedin || $youtube) : ?><div><strong><?php esc_html_e('Follow', 'b2b-starter'); ?></strong><p>
<?php if ($linkedin) : ?><a href="<?php echo esc_url($linkedin); ?>" target="_blank" rel="noopener">LinkedIn</a><br><?php endif; ?>
<?php if ($youtube) : ?><a href="<?php echo esc_url($youtube); ?>" target="_blank" rel="noopener">YouTube</a><?php endif; ?>
</p></div><?php endif; ?>
</footer>
<div class="copyright"><div class="shell">© <?php echo esc_html((string) date_i18n('Y')); ?> <?php bloginfo('name'); ?></div></div>
