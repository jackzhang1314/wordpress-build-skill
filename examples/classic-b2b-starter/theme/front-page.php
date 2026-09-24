<?php get_header(); ?>
<main id="main" class="shell">
<?php while (have_posts()) : the_post(); ?>
	<?php get_template_part('parts/hero'); ?>
<?php endwhile; ?>
<?php
Starter\Theme\component_stat_strip(['items' => [
	['value' => Starter\Theme\get_setting('stat_1_value'), 'label' => Starter\Theme\get_setting('stat_1_label')],
	['value' => Starter\Theme\get_setting('stat_2_value'), 'label' => Starter\Theme\get_setting('stat_2_label')],
	['value' => Starter\Theme\get_setting('stat_3_value'), 'label' => Starter\Theme\get_setting('stat_3_label')],
]]);
?>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Applications',
		'title' => 'Browse by application',
		'link' => ['url' => get_post_type_archive_link('starter_product') ?: home_url('/products/'), 'label' => 'All products →'],
	]); ?>
	<?php Starter\Theme\term_cards('product_collection'); ?>
</section>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Catalogue',
		'title' => 'Featured products',
		'link' => ['url' => get_post_type_archive_link('starter_product'), 'label' => 'View all →'],
	]); ?>
	<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_product']]); ?>
</section>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Sectors',
		'title' => 'Industry solutions',
		'link' => ['url' => get_post_type_archive_link('starter_industry') ?: home_url('/industries/'), 'label' => 'All solutions →'],
	]); ?>
	<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_industry']]); ?>
</section>
<section class="section">
	<?php Starter\Theme\component_section_heading([
		'eyebrow' => 'Knowledge',
		'title' => 'Buyer guides',
		'link' => ['url' => get_post_type_archive_link('starter_guide') ?: home_url('/guides/'), 'label' => 'All guides →'],
	]); ?>
	<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_guide']]); ?>
</section>
<?php Starter\Theme\component_cta_band([
	'title' => Starter\Theme\get_setting('cta_title', 'Planning a lighting project?'),
	'text' => Starter\Theme\get_setting('cta_text', 'Send drawings or a schedule — itemised pricing in three working days.'),
	'button' => ['url' => Starter\Theme\contact_url(), 'label' => 'Send specifications'],
]); ?>
</main>
<?php get_footer(); ?>
