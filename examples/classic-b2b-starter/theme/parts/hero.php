<?php
/**
 * Homepage hero.
 *
 * @package b2b-starter
 */
?>
<section class="hero">
<div>
<p class="eyebrow"><?php bloginfo('description'); ?></p>
<h1><?php the_title(); ?></h1>
<div class="prose"><?php the_content(); ?></div>
<div class="hero-actions"><a class="button" href="<?php echo esc_url(Starter\Theme\contact_url()); ?>">Request a quotation</a> <a class="ghost-button" href="<?php echo esc_url(get_post_type_archive_link('starter_product') ?: home_url('/products/')); ?>">Browse the catalogue</a></div>
</div>
<div class="hero-photo"><?php echo Starter\Theme\media_placeholder('hero', 'Homepage hero', '', '1600 × 1000 · 16:10'); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in component ?></div>
</section>
