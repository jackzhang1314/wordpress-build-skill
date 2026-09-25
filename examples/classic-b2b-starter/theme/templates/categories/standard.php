<?php
/**
 * Product category partial: standard commercial landing page.
 *
 * @package b2b-starter
 */
$context = get_query_var('category_template_context');
$category = $context['category'] ?? Starter\Theme\product_category_data();
$factory = $context['factory'] ?? Starter\Theme\factory_profile_data(); ?>

	<?php Starter\Theme\breadcrumbs(); ?>
	<?php Starter\Theme\component_category_hero([
		'name' => $category['name'],
		'overline' => $category['overline'],
		'intro' => $category['intro'],
		'image' => $category['hero_image'],
		'facts' => $category['key_facts'],
		'cta' => $category['cta'],
		'all_url' => '#selection-guide',
	]); ?>

	<?php Starter\Theme\component_factory_strip(['proof' => $factory['proof'], 'certifications' => $factory['certifications'], 'markets' => $factory['markets']]); ?>

	<?php Starter\Theme\component_anchor_nav(['links' => [
		['label' => 'Products', 'url' => '#products'],
		['label' => 'Selection', 'url' => '#selection-guide'],
		['label' => 'Specifications', 'url' => '#specifications'],
		['label' => 'Applications', 'url' => '#applications'],
		['label' => 'Standards', 'url' => '#standards'],
		['label' => 'FAQ', 'url' => '#faq'],
	]]); ?>

	<section id="products" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Products',
			'title' => 'Browse this range',
			'description' => 'Compare representative models, then request engineering or commercial support.',
		]); ?>
		<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
	</section>

	<?php if ($category['selection_guide']) : ?>
	<section id="selection-guide" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Selection guide',
			'title' => 'How to choose the right configuration',
			'description' => 'Use these criteria to narrow the range before requesting a quotation.',
		]); ?>
		<?php Starter\Theme\component_feature_grid(['rows' => $category['selection_guide'], 'class' => 'selection-grid']); ?>
	</section>
	<?php endif; ?>

	<?php if ($category['features']) : ?>
	<section id="benefits" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Range benefits',
			'title' => 'Why buyers specify this category',
		]); ?>
		<?php Starter\Theme\component_feature_grid(['rows' => $category['features']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($category['specifications']) : ?>
	<section id="specifications" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Technical data',
			'title' => 'Category specifications',
			'description' => 'Typical ranges and options. Final data is confirmed on the selected product.',
		]); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $category['specifications']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($category['applications'] || $category['use_cases']) : ?>
	<section id="applications" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Applications',
			'title' => 'Where this range is used',
		]); ?>
		<?php if ($category['applications']) Starter\Theme\component_pill_list(['items' => $category['applications']]); ?>
		<?php if ($category['use_cases']) Starter\Theme\component_feature_grid(['rows' => $category['use_cases'], 'class' => 'use-case-grid']); ?>
	</section>
	<?php endif; ?>

	<?php Starter\Theme\component_factory_capability([
		'eyebrow' => 'Factory support',
		'title' => 'Manufacturing capability for this range',
		'intro' => $factory['intro'],
		'capabilities' => $factory['capabilities'],
		'process' => $factory['process'],
		'quality_tests' => $factory['quality_tests'],
		'certifications' => $factory['certifications'],
	]); ?>

	<?php if ($category['standards'] || $category['process'] || $category['checklist']) : ?>
	<section id="standards" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Compliance & procurement',
			'title' => 'Standards, process and RFQ checklist',
		]); ?>
		<?php if ($category['standards']) Starter\Theme\component_pill_list(['items' => $category['standards']]); ?>
		<?php if ($category['process']) Starter\Theme\component_process_steps(['rows' => $category['process']]); ?>
		<?php if ($category['checklist']) : ?>
			<div class="checklist-panel">
				<h3>Send this with your enquiry</h3>
				<?php Starter\Theme\component_check_list(['items' => $category['checklist']]); ?>
			</div>
		<?php endif; ?>
	</section>
	<?php endif; ?>

	<?php if ($category['related_categories']) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Related categories',
			'title' => 'Compare adjacent ranges',
		]); ?>
		<?php Starter\Theme\component_related_category_tiles(['terms' => $category['related_categories']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($category['resources']) : ?>
	<section id="resources" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Resources',
			'title' => 'Technical documents & downloads',
		]); ?>
		<?php Starter\Theme\component_resource_list(['resources' => $category['resources']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($category['faq']) : ?>
	<section id="faq" class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'FAQ',
			'title' => 'Category buying questions',
		]); ?>
		<?php Starter\Theme\component_faq(['rows' => $category['faq']]); ?>
	</section>
	<?php endif; ?>

	<?php Starter\Theme\component_category_editorial([
		'title' => 'Complete category guide',
		'content' => $category['long_description'],
	]); ?>

	<?php Starter\Theme\component_cta_band(array_merge(['eyebrow' => 'Start here'], $category['cta'])); ?>

	<?php
	$collection_items = [];
	foreach (($GLOBALS['wp_query']->posts ?? []) as $index => $post) {
		$collection_items[] = [
			'@type' => 'ListItem',
			'position' => $index + 1,
			'url' => get_permalink($post),
			'name' => get_the_title($post),
		];
	}
	$schema = [
		'@context' => 'https://schema.org',
		'@type' => 'ItemList',
		'name' => $category['name'],
		'description' => $category['intro'],
		'itemListElement' => $collection_items,
	];
	if ($category['faq']) {
		$schema['mainEntity'] = array_map(static fn (array $row): array => [
			'@type' => 'Question',
			'name' => $row['label'],
			'acceptedAnswer' => ['@type' => 'Answer', 'text' => $row['value']],
		], $category['faq']);
	}
	?>
	<script type="application/ld+json"><?php echo wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?></script>

