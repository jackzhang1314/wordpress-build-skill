<?php
/**
 * Global topbar and primary navigation.
 *
 * @package b2b-starter
 */

$topbar = Starter\Theme\get_setting('topbar_text', 'Factory-direct LED luminaires · CE / SAA / ETL documentation pack');
?>
<?php if ($topbar) : ?><div class="topbar"><div class="shell"><span><?php echo esc_html($topbar); ?></span><a href="<?php echo esc_url(Starter\Theme\contact_url()); ?>"><?php echo esc_html(Starter\Theme\get_setting('contact_email', 'sales@yourcompany.com')); ?></a></div></div><?php endif; ?>
<header class="site-header"><div class="shell">
<a class="brand" href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a>
<button class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
<nav class="primary-nav" aria-label="Primary"><?php wp_nav_menu(['theme_location' => 'primary', 'container' => false, 'fallback_cb' => 'wp_page_menu', 'depth' => 1]); ?></nav>
</div></header>
<script>
document.querySelector('.nav-toggle')?.addEventListener('click',function(){
  var open=this.getAttribute('aria-expanded')==='true';
  this.setAttribute('aria-expanded',open?'false':'true');
  this.closest('.site-header').querySelector('nav').classList.toggle('open',!open);
});
</script>
