<?php
/**
 * Single product: compact conversion hero followed by structured proof and rich details.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); $product = Starter\Theme\product_data(); ?>
	<?php Starter\Theme\breadcrumbs(); ?>

	<section class="product-hero" aria-label="Product hero">
		<?php Starter\Theme\component_product_gallery([
			'images' => $product['gallery'],
			'title' => $product['title'],
		]); ?>
		<?php Starter\Theme\component_product_hero_summary([
			'category' => $product['category'],
			'title' => $product['title'],
			'description' => $product['excerpt'],
			'value_chips' => $product['value_chips'],
			'cta' => $product['cta'],
		]); ?>
	</section>

	<?php if ($product['key_attributes']) : ?>
	<section class="section" aria-label="Product key attributes">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Key attributes',
			'title' => 'Essential product data',
		]); ?>
		<?php Starter\Theme\component_attribute_grid(['rows' => $product['key_attributes']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['at_a_glance']) : ?>
	<section class="section" aria-label="Product at a glance">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'At a glance',
			'title' => 'Why buyers shortlist it',
		]); ?>
		<?php Starter\Theme\component_check_list(['items' => $product['at_a_glance']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['commercial_facts'] || $product['customization']) : ?>
	<section class="section" aria-label="Product commercial terms">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Commercial terms',
			'title' => 'Buying & delivery',
		]); ?>
		<?php Starter\Theme\component_fact_strip(['rows' => $product['commercial_facts']]); ?>
		<?php if ($product['customization']) : ?>
			<?php Starter\Theme\component_callout(['title' => 'Customization', 'text' => $product['customization']]); ?>
		<?php endif; ?>
	</section>
	<?php endif; ?>

	<?php if ($product['specifications']) : ?>
	<section class="section" aria-label="Product specifications">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Data',
			'title' => 'Full specifications',
		]); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $product['specifications']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['applications']) : ?>
	<section class="section" aria-label="Product applications">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Use cases',
			'title' => 'Typical applications',
		]); ?>
		<?php Starter\Theme\component_pill_list(['items' => $product['applications']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['documents']) : ?>
	<section class="section" aria-label="Product documents">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Resources',
			'title' => 'Documents & downloads',
		]); ?>
		<?php Starter\Theme\component_document_list(['documents' => $product['documents']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['faq']) : ?>
	<section class="section" aria-label="Product FAQ">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'FAQ',
			'title' => 'Product questions',
		]); ?>
		<?php Starter\Theme\component_faq(['rows' => $product['faq']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['details']['has_content']) :
		ob_start();
		the_content();
		Starter\Theme\component_rich_description([
			'title' => $product['details']['title'],
			'content' => ob_get_clean(),
		]);
	endif; ?>

	<section class="section"><?php Starter\Theme\component_related_products([
		'post_id' => get_the_ID(),
		'related_ids' => $product['related_ids'],
	]); ?></section>

	<?php Starter\Theme\component_cta_band([
		'title' => 'Request pricing for ' . $product['title'],
		'text' => 'Send specifications, drawings or a short project brief.',
		'button' => ['url' => $product['cta']['url'], 'label' => $product['cta']['label']],
	]); ?>
<?php endwhile; ?></main>
<?php get_footer(); ?>
