<?php get_header(); ?>
<main id="main" class="shell">
<?php while (have_posts()) : the_post(); ?>
	<?php get_template_part('parts/hero'); ?>
<?php endwhile; ?>
<?php
Cleanroom\Theme\component_stat_strip(['items' => [
	['value' => Cleanroom\Theme\get_setting('stat_1_value'), 'label' => Cleanroom\Theme\get_setting('stat_1_label')],
	['value' => Cleanroom\Theme\get_setting('stat_2_value'), 'label' => Cleanroom\Theme\get_setting('stat_2_label')],
	['value' => Cleanroom\Theme\get_setting('stat_3_value'), 'label' => Cleanroom\Theme\get_setting('stat_3_label')],
]]);
?>
<section class="section">
	<?php Cleanroom\Theme\component_section_heading([
		'eyebrow' => 'Applications',
		'title' => 'Browse by application',
		'link' => ['url' => get_post_type_archive_link('cleanroom_product') ?: home_url('/products/'), 'label' => 'All products →'],
	]); ?>
	<?php Cleanroom\Theme\term_cards('product_collection'); ?>
</section>
<section class="section">
	<?php Cleanroom\Theme\component_section_heading([
		'eyebrow' => 'Catalogue',
		'title' => 'Featured products',
		'link' => ['url' => get_post_type_archive_link('cleanroom_product'), 'label' => 'View all →'],
	]); ?>
	<div class="grid">
		<?php $featured = new WP_Query(['post_type' => 'cleanroom_product', 'posts_per_page' => 3]); ?>
		<?php while ($featured->have_posts()) : $featured->the_post(); get_template_part('parts/card'); endwhile; wp_reset_postdata(); ?>
	</div>
</section>
<section class="section">
	<?php Cleanroom\Theme\component_section_heading([
		'eyebrow' => 'Sectors',
		'title' => 'Industry solutions',
		'link' => ['url' => get_post_type_archive_link('cleanroom_industry') ?: home_url('/industries/'), 'label' => 'All solutions →'],
	]); ?>
	<div class="grid">
		<?php $industries = new WP_Query(['post_type' => 'cleanroom_industry', 'posts_per_page' => 3]); ?>
		<?php while ($industries->have_posts()) : $industries->the_post(); get_template_part('parts/card'); endwhile; wp_reset_postdata(); ?>
	</div>
</section>
<section class="section">
	<?php Cleanroom\Theme\component_section_heading([
		'eyebrow' => 'Knowledge',
		'title' => 'Buyer guides',
		'link' => ['url' => get_post_type_archive_link('cleanroom_guide') ?: home_url('/guides/'), 'label' => 'All guides →'],
	]); ?>
	<div class="grid">
		<?php $guides = new WP_Query(['post_type' => 'cleanroom_guide', 'posts_per_page' => 3]); ?>
		<?php while ($guides->have_posts()) : $guides->the_post(); get_template_part('parts/card'); endwhile; wp_reset_postdata(); ?>
	</div>
</section>
<?php Cleanroom\Theme\component_cta_band([
	'title' => Cleanroom\Theme\get_setting('cta_title', 'Planning a lighting project?'),
	'text' => Cleanroom\Theme\get_setting('cta_text', 'Send drawings or a schedule — itemised pricing in three working days.'),
	'button' => ['url' => Cleanroom\Theme\contact_url(), 'label' => 'Send specifications'],
]); ?>
</main>
<?php get_footer(); ?>
