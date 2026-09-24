<?php
/**
 * Single product: media, summary, structured specs, documents and related.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); $product = Starter\Theme\product_data(); ?>
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
			<?php Starter\Theme\component_quick_specs(['rows' => $product['quick_specs']]); ?>
			<?php Starter\Theme\component_check_list(['items' => $product['highlights']]); ?>
			<?php Starter\Theme\component_term_chips(['taxonomy' => 'product_collection']); ?>
			<?php if (array_filter($product['meta'])) : ?>
				<div class="product-facts">
					<?php foreach ($product['meta'] as $label => $value) : if (trim((string) $value) === '') continue; ?>
						<span><strong><?php echo esc_html(ucwords(str_replace('_', ' ', $label))); ?></strong> <?php echo esc_html((string) $value); ?></span>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
			<div class="cta-card">
				<p><?php echo esc_html($product['cta_note']); ?></p>
				<a class="button" href="<?php echo esc_url(Starter\Theme\contact_url(get_the_title())); ?>"><?php echo esc_html($product['cta_label']); ?></a>
			</div>
			<?php Starter\Theme\component_trust_strip(['items' => $product['trust_points']]); ?>
			<a class="back-link" href="<?php echo esc_url(get_post_type_archive_link('starter_product')); ?>">Back to catalogue</a>
		</div>
	</div>

	<?php if ($product['specifications']) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Data', 'title' => 'Full specifications']); ?>
		<?php Starter\Theme\component_spec_table(['rows' => $product['specifications']]); ?>
	</section>
	<?php endif; ?>

	<?php if ($product['applications']) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Use cases', 'title' => 'Typical applications']); ?>
		<?php Starter\Theme\component_pill_list(['items' => $product['applications']]); ?>
	</section>
	<?php endif; ?>

	<section class="prose section"><?php the_content(); ?></section>

	<?php if ($product['customization']) : ?>
		<?php Starter\Theme\component_callout(['title' => 'Customization', 'text' => $product['customization']]); ?>
	<?php endif; ?>

	<?php if ($product['documents']) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Resources', 'title' => 'Documents & downloads']); ?>
		<ul class="document-list"><?php foreach ($product['documents'] as $document) : ?><li><?php echo esc_html($document); ?></li><?php endforeach; ?></ul>
	</section>
	<?php endif; ?>

	<section class="section"><?php Starter\Theme\component_related_products([
		'post_id' => get_the_ID(),
		'related_ids' => $product['related_ids'],
	]); ?></section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
