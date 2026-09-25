<?php
/**
 * Product category partial: conversion-first layout.
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
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Products', 'title' => 'Shortlist this range']); ?>
		<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
	</section>
	<section id="rfq-process" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'RFQ', 'title' => 'How to get a quotation']); ?>
		<?php Starter\Theme\component_process_steps(['rows' => $category['process'] ?: [
			['label' => 'Send requirement', 'value' => 'Share application, quantity and target delivery.'],
			['label' => 'Review options', 'value' => 'We confirm suitable configurations and documentation.'],
			['label' => 'Receive quotation', 'value' => 'You receive itemised pricing and lead time.'],
		]]); ?>
	</section>
	<?php Starter\Theme\component_factory_capability([
		'intro' => $factory['intro'], 'capabilities' => $factory['capabilities'], 'process' => $factory['process'],
		'quality_tests' => $factory['quality_tests'], 'certifications' => $factory['certifications'],
	]); ?>
	<?php if ($category['applications']) : ?>
	<section id="applications" class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Applications', 'title' => 'Where this range is used']); ?>
		<?php Starter\Theme\component_pill_list(['items' => $category['applications']]); ?>
	</section>
	<?php endif; ?>
	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Start here'], $category['cta'])); ?>
</main>
