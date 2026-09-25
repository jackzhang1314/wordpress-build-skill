<?php
/**
 * Template Name: Resource center
 * Template Post Type: page
 * Template Editor Pattern: product-standard-body
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'Resources', 'title' => get_the_title(), 'description' => get_the_excerpt(),
	]); ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Knowledge', 'title' => 'Technical guides']); ?>
		<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_guide', 'posts_per_page' => 6]]); ?>
	</section>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'News', 'title' => 'Company updates']); ?>
		<?php Starter\Theme\component_blog_archive(); ?>
	</section>
	<?php Starter\Theme\component_cta_band([
		'title' => 'Need a document?', 'text' => 'Request datasheets, drawings, certification packs or project evidence.',
		'button' => ['url' => Starter\Theme\contact_url(), 'label' => 'Request resources'],
	]); ?>
<?php endwhile; ?></main>
<?php get_footer(); ?>
