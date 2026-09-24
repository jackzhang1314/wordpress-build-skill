<?php
/**
 * Template Name: About page
 * Template Post Type: page
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post();
	$data = Starter\Theme\about_data();
	Starter\Theme\component_page_head([
		'eyebrow' => 'About',
		'title' => get_the_title(),
	]);
	?>
	<?php Starter\Theme\component_stat_strip(['items' => $data['stats']]); ?>
	<article class="prose article"><?php the_content(); ?></article>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Capabilities', 'title' => 'How we support buyers']); ?>
		<?php Starter\Theme\component_feature_grid(['rows' => $data['capabilities'], 'class' => 'grid cap-grid']); ?>
	</section>
	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Next step'], $data['cta']));
endwhile; ?></main>
<?php get_footer(); ?>
