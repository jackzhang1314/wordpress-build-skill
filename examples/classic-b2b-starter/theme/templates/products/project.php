<?php
/**
 * Product layout: application and project presentation.
 *
 * @package b2b-starter
 */

$context = get_query_var('product_template_context');
$product = $context['product'] ?? Starter\Theme\product_data();
$factory = $context['factory'] ?? Starter\Theme\factory_profile_data();
?>
<main id="main" class="shell">	<?php Starter\Theme\breadcrumbs(); ?>
	<section class="product-hero" aria-label="Application product">
		<?php Starter\Theme\component_product_gallery(['images' => $product['gallery'], 'title' => $product['title']]); ?>
		<?php Starter\Theme\component_product_hero_summary([
			'category' => $product['category'], 'title' => $product['title'], 'description' => $product['excerpt'],
			'value_chips' => $product['value_chips'], 'cta' => $product['cta'],
		]); ?>
	</section>
	<?php if ($product['details']['has_content']) { ob_start(); the_content(); Starter\Theme\component_rich_description(['title' => 'Project application', 'content' => ob_get_clean()]); } ?>
	<section class="section"><?php Starter\Theme\component_related_products(['post_id' => get_the_ID(), 'related_ids' => $product['related_ids']]); ?></section>
	<?php Starter\Theme\component_factory_capability([
		'intro' => $factory['intro'], 'capabilities' => $factory['capabilities'], 'process' => $factory['process'],
		'quality_tests' => $factory['quality_tests'], 'certifications' => $factory['certifications'],
	]); ?>
	<?php Starter\Theme\component_cta_band([
		'title' => 'Start a project enquiry',
		'text' => 'Send drawings, target specification and delivery window.',
		'button' => ['url' => $product['cta']['url'], 'label' => 'Start project RFQ'],
	]); ?>

</main>
<?php get_footer(); ?>
