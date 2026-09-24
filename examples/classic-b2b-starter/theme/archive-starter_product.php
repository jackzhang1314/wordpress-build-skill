<?php
/**
 * Product catalogue archive.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'Catalogue',
		'title' => 'Product catalogue',
		'description' => Starter\Theme\field_option('product_archive_description') ?: 'Certified industrial and commercial LED luminaires for distributors, contractors and project tenders.',
	]); ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Applications', 'title' => 'Browse by application']); ?>
		<?php Starter\Theme\term_cards('product_collection'); ?>
	</section>
	<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
</main>
<?php get_footer(); ?>
