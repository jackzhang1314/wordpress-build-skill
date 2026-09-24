<?php
/**
 * Single industry solution: media, challenge, body, recommended, outcome, CTA.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); $industry = Starter\Theme\industry_data(); ?>
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
	<?php Starter\Theme\component_callout(['title' => 'The challenge', 'text' => $industry['challenge']]); ?>
	<article class="prose article"><?php the_content(); ?></article>
	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Recommended',
			'title' => 'Products for this application',
			'link' => ['url' => get_post_type_archive_link('starter_product'), 'label' => 'All products'],
		]); ?>
		<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_product'], 'title_tag' => 'h3']); ?>
	</section>
	<?php Starter\Theme\component_callout(['title' => 'Outcome', 'text' => $industry['outcome'], 'variant' => 'ok']); ?>
	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Discuss'], $industry['cta'])); ?>
<?php endwhile; ?></main>
<?php get_footer(); ?>
