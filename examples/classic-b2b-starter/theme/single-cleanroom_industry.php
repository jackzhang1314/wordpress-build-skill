<?php
/**
 * Single industry solution: photo, challenge, body, recommended, outcome, CTA.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">Industry solution</p>
		<h1><?php the_title(); ?></h1>
		<p><?php echo esc_html(get_the_excerpt()); ?></p>
	</header>
	<?php if (has_post_thumbnail()) {
		the_post_thumbnail('large', ['class' => 'industry-photo', 'loading' => 'eager']);
	} else {
		echo Cleanroom\Theme\media_placeholder('industry', get_the_title(), 'industry-photo'); // phpcs:ignore WordPress.Security.EscapeOutput -- safe internal HTML
	} ?>
	<?php $challenge = Cleanroom\Theme\field_text('challenge'); if ($challenge !== '') : ?>
	<section class="callout">
		<h2>The challenge</h2>
		<p><?php echo esc_html($challenge); ?></p>
	</section>
	<?php endif; ?>
	<article class="prose article"><?php the_content(); ?></article>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Recommended</p><h2>Luminaires for this application</h2></div><a class="more" href="<?php echo esc_url(get_post_type_archive_link('cleanroom_product')); ?>">All products</a></div>
		<div class="grid"><?php $related = new WP_Query(['post_type' => 'cleanroom_product', 'posts_per_page' => 3]); while ($related->have_posts()) : $related->the_post(); get_template_part('parts/card', null, ['title_tag' => 'h3']); endwhile; wp_reset_postdata(); ?></div>
	</section>
	<?php $outcome = Cleanroom\Theme\field_text('outcome'); if ($outcome !== '') : ?>
	<section class="callout callout--ok">
		<h2>Project outcome</h2>
		<p><?php echo esc_html($outcome); ?></p>
	</section>
	<?php endif; ?>
	<section class="cta-band">
		<div class="section-heading"><div><p class="eyebrow">Discuss</p><h2>Planning a similar project?</h2><p>Share your layout and mounting heights — we return a layout and quotation.</p></div><a class="button" href="<?php echo esc_url(Cleanroom\Theme\contact_url(get_the_title())); ?>">Discuss this application</a></div>
	</section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
