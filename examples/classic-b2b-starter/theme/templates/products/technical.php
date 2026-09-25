<?php
/**
 * Product layout: technical datasheet presentation.
 *
 * @package b2b-starter
 */

$context = get_query_var('product_template_context');
$product = $context['product'] ?? Starter\Theme\product_data();
$factory = $context['factory'] ?? Starter\Theme\factory_profile_data();
?>
<main id="main" class="shell">	<?php Starter\Theme\breadcrumbs(); ?>
	<section class="product-hero" aria-label="Technical product">
		<?php Starter\Theme\component_product_gallery(['images' => $product['gallery'], 'title' => $product['title']]); ?>
		<?php Starter\Theme\component_product_hero_summary([
			'category' => $product['category'], 'title' => $product['title'], 'description' => $product['excerpt'],
			'value_chips' => $product['key_attributes'], 'cta' => $product['cta'],
		]); ?>
	</section>
	<?php Starter\Theme\component_factory_strip(['proof' => $factory['proof'], 'certifications' => $factory['certifications'], 'markets' => $factory['markets']]); ?>
	<?php if ($product['specifications']) : ?>
	<section class="section" aria-label="Technical data">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Datasheet', 'title' => 'Technical specifications']); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $product['specifications']]); ?>
	</section>
	<?php endif; ?>
	<?php if ($product['details']['has_content']) { ob_start(); the_content(); Starter\Theme\component_rich_description(['title' => $product['details']['title'], 'content' => ob_get_clean()]); } ?>
	<?php if ($product['faq']) : ?>
	<section class="section"><h2 class="screen-reader-text">Technical FAQ</h2><?php Starter\Theme\component_faq(['rows' => $product['faq']]); ?></section>
	<?php endif; ?>
	<?php Starter\Theme\component_cta_band([
		'title' => 'Request technical documents',
		'text' => 'Request datasheets, drawings, certifications or project-specific data.',
		'button' => ['url' => $product['cta']['url'], 'label' => 'Request documents'],
	]); ?>

</main>
<?php get_footer(); ?>
