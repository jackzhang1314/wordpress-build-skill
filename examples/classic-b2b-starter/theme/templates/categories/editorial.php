<?php
/**
 * Product category partial: editorial / SEO-first layout.
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
		'image' => $category['hero_image'], 'facts' => $category['key_facts'], 'cta' => $category['cta'], 'all_url' => '#guide',
	]); ?>
	<section id="guide" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Buying guide', 'title' => 'Complete category guide']); ?>
		<?php Starter\Theme\component_category_editorial(['content' => $category['long_description']]); ?>
	</section>
	<section id="products" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Products', 'title' => 'Products in this category']); ?>
		<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
	</section>
	<?php if ($category['faq']) : ?>
	<section id="faq" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'FAQ', 'title' => 'Frequently asked questions']); ?>
		<?php Starter\Theme\component_faq(['rows' => $category['faq']]); ?>
	</section>
	<?php endif; ?>
	<?php Starter\Theme\component_factory_capability([
		'intro' => $factory['intro'], 'capabilities' => $factory['capabilities'], 'process' => $factory['process'],
		'quality_tests' => $factory['quality_tests'], 'certifications' => $factory['certifications'],
	]); ?>
	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Start here'], $category['cta'])); ?>
</main>
