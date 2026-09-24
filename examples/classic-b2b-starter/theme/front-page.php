<?php
/**
 * Static front page controller view. All structured values come from page-data.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell">
<?php while (have_posts()) : the_post(); $home = Starter\Theme\homepage_data(); ?>
	<?php get_template_part('parts/hero', null, [
		'eyebrow' => $home['overline'],
		'description' => $home['description'] ?: get_the_excerpt(),
		'primary_label' => $home['cta']['button_label'],
	]); ?>
<?php endwhile; ?>
<?php Starter\Theme\component_stat_strip(['items' => $home['stats']]); ?>
<?php if ($home['sections']['applications']['enabled']) : ?>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Applications',
		'title' => $home['sections']['applications']['title'],
		'link' => ['url' => get_post_type_archive_link('starter_product') ?: home_url('/products/'), 'label' => 'All products →'],
	]); ?>
	<?php Starter\Theme\term_cards('product_collection'); ?>
</section>
<?php endif; ?>
<?php if ($home['sections']['products']['enabled']) : ?>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Catalogue',
		'title' => $home['sections']['products']['title'],
		'link' => ['url' => get_post_type_archive_link('starter_product'), 'label' => 'View all →'],
	]); ?>
	<?php Starter\Theme\component_card_grid(['query_args' => [
		'post_type' => 'starter_product',
		'posts_per_page' => $home['sections']['products']['count'],
	]]); ?>
</section>
<?php endif; ?>
<?php if ($home['sections']['industries']['enabled']) : ?>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Sectors',
		'title' => $home['sections']['industries']['title'],
		'link' => ['url' => get_post_type_archive_link('starter_industry') ?: home_url('/industries/'), 'label' => 'All solutions →'],
	]); ?>
	<?php Starter\Theme\component_card_grid(['query_args' => [
		'post_type' => 'starter_industry',
		'posts_per_page' => $home['sections']['industries']['count'],
	]]); ?>
</section>
<?php endif; ?>
<?php if ($home['sections']['guides']['enabled']) : ?>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Knowledge',
		'title' => $home['sections']['guides']['title'],
		'link' => ['url' => get_post_type_archive_link('starter_guide') ?: home_url('/guides/'), 'label' => 'All guides →'],
	]); ?>
	<?php Starter\Theme\component_card_grid(['query_args' => [
		'post_type' => 'starter_guide',
		'posts_per_page' => $home['sections']['guides']['count'],
	]]); ?>
</section>
<?php endif; ?>
<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Start here'], $home['cta'])); ?>
</main>
<?php get_footer(); ?>
