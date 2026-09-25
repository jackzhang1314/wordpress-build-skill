<?php
/**
 * Template Name: Landing page
 * Template Post Type: page
 * Template Editor Pattern: product-standard-body
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post();
	Starter\Theme\component_page_head([
		'eyebrow' => Starter\Theme\text('landing_overline'),
		'title' => get_the_title(),
		'description' => Starter\Theme\text('landing_description'),
	]);
	?>
	<?php Starter\Theme\component_feature_grid(['rows' => Starter\Theme\rows('landing_features')]); ?>
	<article class="prose article"><?php the_content(); ?></article>
	<?php Starter\Theme\component_cta_band([
		'title' => Starter\Theme\text('landing_cta_title', 'Request a quote'),
		'text' => Starter\Theme\text('landing_cta_text'),
		'button' => ['url' => Starter\Theme\contact_url(), 'label' => Starter\Theme\text('landing_cta_button', 'Contact us')],
	]);
endwhile; ?></main>
<?php get_footer(); ?>
