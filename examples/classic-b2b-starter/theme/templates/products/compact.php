<?php
/**
 * Product layout: compact RFQ presentation.
 *
 * @package b2b-starter
 */

$context = get_query_var('product_template_context');
$product = $context['product'] ?? Starter\Theme\product_data();
$factory = $context['factory'] ?? Starter\Theme\factory_profile_data();
?>
<main id="main" class="shell">	<?php Starter\Theme\breadcrumbs(); ?>
	<section class="product-hero" aria-label="Compact product">
		<?php Starter\Theme\component_product_gallery(['images' => $product['gallery'], 'title' => $product['title']]); ?>
		<?php Starter\Theme\component_product_hero_summary([
			'category' => $product['category'], 'title' => $product['title'], 'description' => $product['excerpt'],
			'value_chips' => array_slice($product['value_chips'], 0, 2), 'cta' => $product['cta'],
		]); ?>
	</section>
	<?php if ($product['specifications']) Starter\Theme\component_spec_table(['rows' => array_slice($product['specifications'], 0, 6)]); ?>
	<?php if ($product['details']['has_content']) { ob_start(); the_content(); Starter\Theme\component_rich_description(['title' => $product['details']['title'], 'content' => ob_get_clean()]); } ?>
	<?php Starter\Theme\component_cta_band([
		'title' => 'Request a quotation',
		'text' => 'A concise product enquiry is enough to start.',
		'button' => ['url' => $product['cta']['url'], 'label' => 'Request pricing'],
	]); ?>

</main>
<?php get_footer(); ?>
