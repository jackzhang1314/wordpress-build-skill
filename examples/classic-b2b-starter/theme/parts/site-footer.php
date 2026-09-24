<?php
/**
 * Global footer.
 *
 * @package harness-cleanroom
 */
?>
<footer class="site-footer shell">
<div><p class="footer-brand"><?php bloginfo('name'); ?></p><p><?php echo esc_html(Cleanroom\Theme\get_setting('footer_about', get_bloginfo('description'))); ?></p></div>
<div><strong><?php esc_html_e('Contact', 'harness-cleanroom'); ?></strong><p>
<a href="mailto:<?php echo esc_attr(Cleanroom\Theme\get_setting('contact_email', 'sales@yourcompany.com')); ?>"><?php echo esc_html(Cleanroom\Theme\get_setting('contact_email', 'sales@yourcompany.com')); ?></a><br>
<?php if (Cleanroom\Theme\get_setting('contact_phone')) echo esc_html(Cleanroom\Theme\get_setting('contact_phone')) . '<br>'; ?>
<?php echo esc_html(Cleanroom\Theme\get_setting('contact_hours', 'Mon–Fri, 9:00–18:00 (GMT+8)')); ?></p></div>
<div><strong><?php esc_html_e('Explore', 'harness-cleanroom'); ?></strong><p>
<a href="<?php echo esc_url(get_post_type_archive_link('cleanroom_product') ?: home_url('/products/')); ?>"><?php esc_html_e('Products', 'harness-cleanroom'); ?></a><br>
<a href="<?php echo esc_url(get_post_type_archive_link('cleanroom_industry') ?: home_url('/industries/')); ?>"><?php esc_html_e('Industries', 'harness-cleanroom'); ?></a><br>
<a href="<?php echo esc_url(home_url('/about/')); ?>"><?php esc_html_e('About', 'harness-cleanroom'); ?></a><br>
<a href="<?php echo esc_url(home_url('/contact/')); ?>"><?php esc_html_e('Contact', 'harness-cleanroom'); ?></a></p></div>
<?php $linkedin = Cleanroom\Theme\get_setting('social_linkedin'); $youtube = Cleanroom\Theme\get_setting('social_youtube'); ?>
<?php if ($linkedin || $youtube) : ?><div><strong><?php esc_html_e('Follow', 'harness-cleanroom'); ?></strong><p>
<?php if ($linkedin) : ?><a href="<?php echo esc_url($linkedin); ?>" target="_blank" rel="noopener">LinkedIn</a><br><?php endif; ?>
<?php if ($youtube) : ?><a href="<?php echo esc_url($youtube); ?>" target="_blank" rel="noopener">YouTube</a><?php endif; ?>
</p></div><?php endif; ?>
</footer>
<div class="copyright"><div class="shell">© <?php echo esc_html((string) date_i18n('Y')); ?> <?php bloginfo('name'); ?></div></div>
