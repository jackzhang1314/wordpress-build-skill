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
	$factory = Starter\Theme\factory_profile_data();
	?>
	<header class="about-hero">
		<p class="eyebrow">About</p>
		<h1><?php the_title(); ?></h1>
		<?php if (has_excerpt()) : ?><p class="about-leader"><?php echo esc_html(get_the_excerpt()); ?></p><?php endif; ?>
	</header>

	<?php Starter\Theme\component_stat_strip(['items' => $data['stats']]); ?>

	<article class="about-story prose"><?php the_content(); ?></article>

	<?php Starter\Theme\component_factory_capability([
		'eyebrow' => 'Manufacturing',
		'title' => 'Factory, production and quality control',
		'intro' => $factory['intro'],
		'capabilities' => $factory['capabilities'],
		'process' => $factory['process'],
		'quality_tests' => $factory['quality_tests'],
		'certifications' => $factory['certifications'],
	]); ?>

	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Knowledge',
			'title' => 'Technical guidance for buyers',
			'link' => ['url' => get_post_type_archive_link('starter_guide') ?: home_url('/guides/'), 'label' => 'All guides →'],
		]); ?>
		<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_guide', 'posts_per_page' => 3], 'title_tag' => 'h3']); ?>
	</section>

	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Next step'], $data['cta']));
endwhile; ?></main>
<?php get_footer(); ?>
