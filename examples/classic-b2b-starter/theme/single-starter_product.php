<?php
/**
 * Single product: minimal conversion hero with proof, details and RFQ.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); $product = Starter\Theme\product_data(); $factory = Starter\Theme\factory_profile_data(); ?>
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

	<?php Starter\Theme\component_factory_strip(['proof' => $factory['proof'], 'certifications' => $factory['certifications'], 'markets' => $factory['markets']]); ?>

	<?php if ($product['specifications']) : ?>
	<section class="section" aria-label="Product specifications">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Data',
			'title' => 'Full specifications',
		]); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $product['specifications']]); ?>
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
