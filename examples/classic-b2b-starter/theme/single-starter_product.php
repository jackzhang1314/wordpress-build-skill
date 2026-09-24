<?php
/**
 * Single product: media, summary, key specs, specification table, related.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Starter\Theme\breadcrumbs(); ?>
	<div class="product-layout">
		<div class="product-photo"><?php
			if (has_post_thumbnail()) {
				the_post_thumbnail('large', ['loading' => 'eager']);
			} else {
				echo Starter\Theme\media_placeholder('product', get_the_title());
			}
		?></div>
		<div class="product-summary">
			<p class="eyebrow">Product</p>
			<h1><?php the_title(); ?></h1>
			<div class="prose"><p><?php echo esc_html(get_the_excerpt()); ?></p></div>
			<?php Starter\Theme\component_quick_specs(['fields' => [
				'wattage' => 'Wattage',
				'efficacy' => 'Efficacy',
				'ip_rating' => 'IP rating',
				'warranty' => 'Warranty',
			]]); ?>
			<?php Starter\Theme\component_check_list(['items' => Starter\Theme\field_lines('product_highlights')]); ?>
			<?php Starter\Theme\component_term_chips(['taxonomy' => 'product_collection']); ?>
			<div class="cta-card">
				<p>Volume pricing, documentation and certification pack available on request.</p>
				<a class="button" href="<?php echo esc_url(Starter\Theme\contact_url(get_the_title())); ?>">Request pricing for this model</a>
			</div>
			<?php Starter\Theme\component_trust_strip(['items' => [
				'Long-life warranty',
				'Certification documents',
				'Factory-direct pricing',
			]]); ?>
			<a class="back-link" href="<?php echo esc_url(get_post_type_archive_link('starter_product')); ?>">Back to catalogue</a>
		</div>
	</div>

	<?php $specs = Starter\Theme\spec_rows(); ?>
	<?php if ($specs) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Data', 'title' => 'Full specifications']); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $specs]); ?>
	</section>
	<?php endif; ?>

	<section class="prose section"><?php the_content(); ?></section>
	<section class="section"><?php Starter\Theme\component_related_products(['post_id' => get_the_ID()]); ?></section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
