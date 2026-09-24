<?php
/**
 * Product category archive with editable structured category content.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell">
<?php $category = Starter\Theme\product_category_data(); ?>
	<?php Starter\Theme\component_page_head([
		'title' => wp_strip_all_tags((string) single_term_title('', false)),
		'description' => $category['intro'] ?? '',
	]); ?>
	<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>

	<?php if (!empty($category['features'])) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Benefits', 'title' => 'Why buyers choose this range']); ?>
		<?php Starter\Theme\component_feature_grid(['rows' => $category['features']]); ?>
	</section>
	<?php endif; ?>

	<?php if (!empty($category['applications'])) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Applications', 'title' => 'Typical applications']); ?>
		<?php Starter\Theme\component_pill_list(['items' => $category['applications']]); ?>
	</section>
	<?php endif; ?>

	<?php if (!empty($category['faq'])) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'FAQ', 'title' => 'Common buyer questions']); ?>
		<?php Starter\Theme\component_faq(['rows' => $category['faq']]); ?>
	</section>
	<?php endif; ?>

	<?php if (!empty($category['cta'])) : ?>
		<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Start here'], $category['cta'])); ?>
	<?php endif; ?>
</main>
<?php get_footer(); ?>
