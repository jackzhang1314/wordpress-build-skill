<?php
/**
 * Product category partial: catalogue-first layout.
 *
 * @package b2b-starter
 */

$context = get_query_var('category_template_context');
$category = $context['category'] ?? Starter\Theme\product_category_data();
$factory = $context['factory'] ?? Starter\Theme\factory_profile_data();
?>
<main id="main" class="shell">
	<?php Starter\Theme\breadcrumbs(); ?>
	<?php Starter\Theme\component_category_hero([
		'name' => $category['name'], 'overline' => $category['overline'], 'intro' => $category['intro'],
		'image' => $category['hero_image'], 'facts' => $category['key_facts'], 'cta' => $category['cta'], 'all_url' => '#products',
	]); ?>
	<?php Starter\Theme\component_factory_strip(['proof' => $factory['proof'], 'certifications' => $factory['certifications'], 'markets' => $factory['markets']]); ?>
	<section id="products" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Catalogue', 'title' => 'All products in this range']); ?>
		<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
	</section>
	<?php if ($category['selection_guide']) : ?>
	<section id="selection-guide" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Selection', 'title' => 'Choose the right configuration']); ?>
		<?php Starter\Theme\component_feature_grid(['rows' => $category['selection_guide'], 'class' => 'selection-grid']); ?>
	</section>
	<?php endif; ?>
	<?php if ($category['specifications']) : ?>
	<section id="specifications" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Data', 'title' => 'Category specifications']); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $category['specifications']]); ?>
	</section>
	<?php endif; ?>
	<?php if ($category['faq']) : ?>
	<section id="faq" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'FAQ', 'title' => 'Category buying questions']); ?>
		<?php Starter\Theme\component_faq(['rows' => $category['faq']]); ?>
	</section>
	<?php endif; ?>
	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Start here'], $category['cta'])); ?>
</main>
