<?php
/**
 * Hero accepts normalized props from the page controller.
 *
 * @package b2b-starter
 */

$props = $args ?? [];
$eyebrow = (string) ($props['eyebrow'] ?? '');
$title = (string) ($props['title'] ?? get_the_title());
$description = (string) ($props['description'] ?? get_the_excerpt());
$primary = (string) ($props['primary_label'] ?? 'Request a quotation');
$secondary = (string) ($props['secondary_label'] ?? 'Browse the catalogue');
$media_kind = (string) ($props['media_kind'] ?? 'hero');
$media_label = (string) ($props['media_label'] ?? 'Hero media');
?>
<section class="hero">
<div>
<?php if ($eyebrow !== '') : ?><p class="eyebrow"><?php echo esc_html($eyebrow); ?></p><?php endif; ?>
<h1><?php echo esc_html($title); ?></h1>
<?php if ($description !== '') : ?><div class="prose"><?php echo wp_kses_post(wpautop($description)); ?></div><?php endif; ?>
<div class="hero-actions">
	<a class="button" href="<?php echo esc_url(Starter\Theme\contact_url()); ?>"><?php echo esc_html($primary); ?></a>
	<a class="ghost-button" href="<?php echo esc_url(get_post_type_archive_link('starter_product') ?: home_url('/products/')); ?>"><?php echo esc_html($secondary); ?></a>
</div>
</div>
<div class="hero-photo"><?php
if (has_post_thumbnail()) {
	the_post_thumbnail('large', ['loading' => 'eager']);
} else {
	echo Starter\Theme\media_placeholder($media_kind, $media_label, '', '1600 × 1000 · 16:10'); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in component
}
?></div>
</section>
