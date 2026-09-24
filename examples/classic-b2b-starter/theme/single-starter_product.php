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
			<dl class="quick-specs">
			<?php foreach ([
				'wattage' => 'Wattage',
				'efficacy' => 'Efficacy',
				'ip_rating' => 'IP rating',
				'warranty' => 'Warranty',
			] as $key => $label) : $value = Starter\Theme\field_text($key); ?>
				<?php if ($value !== '') : ?>
				<div><dt><?php echo esc_html($label); ?></dt><dd><?php echo esc_html($value); ?></dd></div>
				<?php endif; ?>
			<?php endforeach; ?>
			</dl>
			<?php $highlights = Starter\Theme\field_lines('product_highlights'); ?>
			<?php if ($highlights) : ?>
			<ul class="check-list"><?php foreach ($highlights as $highlight) : ?><li><?php echo esc_html($highlight); ?></li><?php endforeach; ?></ul>
			<?php endif; ?>
			<?php $terms = get_the_terms(get_the_ID(), 'product_collection'); ?>
			<?php if (is_array($terms) && $terms) : ?>
				<div class="product-meta"><?php foreach ($terms as $term) : $url = get_term_link($term); ?>
					<?php if (!is_wp_error($url)) : ?>
					<a class="card-chip" href="<?php echo esc_url($url); ?>"><?php echo esc_html($term->name); ?></a>
					<?php endif; ?>
				<?php endforeach; ?></div>
			<?php endif; ?>
			<div class="cta-card">
				<p>Volume pricing, documentation and certification pack available on request.</p>
				<a class="button" href="<?php echo esc_url(Starter\Theme\contact_url(get_the_title())); ?>">Request pricing for this model</a>
			</div>
			<p class="trust-strip">
				<span>Long-life warranty</span>
				<span>Certification documents</span>
				<span>Factory-direct pricing</span>
			</p>
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
