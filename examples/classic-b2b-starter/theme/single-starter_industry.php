<?php
/**
 * Single industry solution: media, challenge, body, recommended, outcome, CTA.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'Industry solution',
		'title' => get_the_title(),
		'description' => get_the_excerpt(),
	]); ?>
	<?php if (has_post_thumbnail()) {
		the_post_thumbnail('large', ['class' => 'industry-photo', 'loading' => 'eager']);
	} else {
		echo Starter\Theme\media_placeholder('industry', get_the_title(), 'industry-photo'); // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in component
	} ?>
	<?php Starter\Theme\component_callout(['title' => 'The challenge', 'text' => Starter\Theme\field_text('challenge')]); ?>
	<article class="prose article"><?php the_content(); ?></article>
	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Recommended',
			'title' => 'Luminaires for this application',
			'link' => ['url' => get_post_type_archive_link('starter_product'), 'label' => 'All products'],
		]); ?>
		<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_product'], 'title_tag' => 'h3']); ?>
	</section>
	<?php Starter\Theme\component_callout([
		'title' => 'Project outcome',
		'text' => Starter\Theme\field_text('outcome'),
		'variant' => 'ok',
	]); ?>
	<?php Starter\Theme\component_cta_band([
		'eyebrow' => 'Discuss',
		'title' => 'Planning a similar project?',
		'text' => 'Share your layout and mounting heights — we return a layout and quotation.',
		'button' => ['url' => Starter\Theme\contact_url(get_the_title()), 'label' => 'Discuss this application'],
	]); ?>
<?php endwhile; ?></main>
<?php get_footer(); ?>
