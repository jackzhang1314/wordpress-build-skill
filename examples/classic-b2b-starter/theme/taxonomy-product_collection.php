<?php
/**
 * Product category: highlights, catalogue, applications,
 * related industries, FAQ. Every block is ACF-editable.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php
$term = get_queried_object();
$slug = (string) ($term->slug ?? '');
$defaults = Starter\Theme\category_defaults($slug);
$intro = Starter\Theme\field_text('category_intro', $term);
if (trim($intro) === '') $intro = $defaults['intro'];
$term_description = (string) ($term->description ?? '');
$page_description = trim($intro) !== '' ? $intro : $term_description;
$features = Starter\Theme\field_rows('category_features', $term, $defaults['features']);
$applications = Starter\Theme\field_lines('category_applications', $term, $defaults['applications']);
$faq = Starter\Theme\field_rows('category_faq', $term, $defaults['faq']);

Starter\Theme\component_page_head([
	'eyebrow' => 'Product category',
	'title' => (string) single_term_title('', false),
	'description' => $page_description,
]);
?>
	<?php if ($features) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Why this category', 'title' => 'What defines these luminaires']); ?>
		<?php Starter\Theme\component_feature_grid(['rows' => $features]); ?>
	</section>
	<?php endif; ?>

	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Catalogue',
			'title' => 'Luminaires in this category',
			'link' => ['url' => get_post_type_archive_link('starter_product'), 'label' => 'All products'],
		]); ?>
		<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
	</section>

	<?php if ($applications) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Applications', 'title' => 'Typical applications']); ?>
		<?php Starter\Theme\component_pill_list(['items' => $applications]); ?>
	</section>
	<?php endif; ?>

	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Sectors',
			'title' => 'Solutions using this category',
			'link' => ['url' => get_post_type_archive_link('starter_industry'), 'label' => 'All solutions'],
		]); ?>
		<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_industry'], 'title_tag' => 'h3']); ?>
	</section>

	<?php if ($faq) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'FAQ', 'title' => 'Common buyer questions']); ?>
		<?php Starter\Theme\component_faq(['rows' => $faq]); ?>
	</section>
	<?php endif; ?>

	<?php Starter\Theme\component_cta_band([
		'title' => 'Specifying ' . strtolower(trim((string) single_term_title('', false))) . ' for a project?',
		'text' => 'Send the layout or mounting heights — we return a photometric layout and itemised pricing in three working days.',
		'button' => ['url' => Starter\Theme\contact_url(single_term_title('', false)), 'label' => 'Request a quotation'],
	]); ?>
</main>
<?php get_footer(); ?>
