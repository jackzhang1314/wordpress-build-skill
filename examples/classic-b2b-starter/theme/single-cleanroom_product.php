<?php
/**
 * Single product: gallery, sticky summary with key specs, spec table, related.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Cleanroom\Theme\breadcrumbs(); ?>
	<div class="product-layout">
		<div class="product-photo"><?php
			if (has_post_thumbnail()) {
				the_post_thumbnail('large', ['loading' => 'eager']);
			} else {
				echo Cleanroom\Theme\media_placeholder('product', get_the_title());
			}
		?></div>
		<div class="product-summary">
			<p class="eyebrow">Product</p>
			<h1><?php the_title(); ?></h1>
			<div class="prose"><p><?php echo esc_html(get_the_excerpt()); ?></p></div>
			<dl class="quick-specs">
			<?php foreach (['wattage' => 'Wattage', 'efficacy' => 'Efficacy', 'ip_rating' => 'IP rating', 'warranty' => 'Warranty'] as $key => $label) : $value = Cleanroom\Theme\field_text($key); if ($value !== '') : ?>
				<div><dt><?php echo esc_html($label); ?></dt><dd><?php echo esc_html($value); ?></dd></div>
			<?php endif; endforeach; ?>
			</dl>
			<?php $highlights = Cleanroom\Theme\field_lines('product_highlights'); if ($highlights) : ?>
			<ul class="check-list"><?php foreach ($highlights as $highlight) : ?><li><?php echo esc_html($highlight); ?></li><?php endforeach; ?></ul>
			<?php endif; ?>
			<?php $terms = get_the_terms(get_the_ID(), 'product_collection'); if (is_array($terms) && $terms) : ?>
				<div class="product-meta"><?php foreach ($terms as $term) : $url = get_term_link($term); if (!is_wp_error($url)) : ?>
					<a class="card-chip" href="<?php echo esc_url($url); ?>"><?php echo esc_html($term->name); ?></a>
				<?php endif; endforeach; ?></div>
			<?php endif; ?>
			<div class="cta-card">
				<p>Volume pricing, DIM/IES files and certification pack available on request.</p>
				<a class="button" href="<?php echo esc_url(Cleanroom\Theme\contact_url(get_the_title())); ?>">Request pricing for this model</a>
			</div>
			<p class="trust-strip">
				<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>5-year warranty</span>
				<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>CE / SAA / ETL docs</span>
				<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>Factory-direct pricing</span>
			</p>
			<a class="back-link" href="<?php echo esc_url(get_post_type_archive_link('cleanroom_product')); ?>">Back to catalogue</a>
		</div>
	</div>

	<?php $specs = Cleanroom\Theme\spec_rows(); if ($specs) : ?>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Data</p><h2>Full specifications</h2></div></div>
		<table class="spec-table"><tbody>
		<?php foreach ($specs as $row) : ?>
			<tr><th scope="row"><?php echo esc_html($row['label']); ?></th><td><?php echo esc_html($row['value']); ?></td></tr>
		<?php endforeach; ?>
		</tbody></table>
	</section>
	<?php endif; ?>

	<section class="prose section"><?php the_content(); ?></section>

	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Also consider</p><h2>Related products</h2></div><a class="more" href="<?php echo esc_url(get_post_type_archive_link('cleanroom_product')); ?>">View all</a></div>
		<div class="grid"><?php
		$related_terms = get_the_terms(get_the_ID(), 'product_collection');
		$related_ids = get_posts([
			'post_type' => 'cleanroom_product',
			'posts_per_page' => 3,
			'post__not_in' => [get_the_ID()],
			'fields' => 'ids',
			'orderby' => 'rand',
			'tax_query' => is_array($related_terms) && $related_terms && !is_wp_error($related_terms) ? [[
				'taxonomy' => 'product_collection',
				'field' => 'term_id',
				'terms' => wp_list_pluck($related_terms, 'term_id'),
			]] : [],
		]);
		if (count($related_ids) < 3) {
			$related_ids = array_merge($related_ids, get_posts([
				'post_type' => 'cleanroom_product',
				'posts_per_page' => 3 - count($related_ids),
				'post__not_in' => array_merge([get_the_ID()], $related_ids),
				'fields' => 'ids',
				'orderby' => 'rand',
			]));
		}
		if ($related_ids) : $related = new WP_Query(['post_type' => 'cleanroom_product', 'post__in' => $related_ids, 'orderby' => 'post__in', 'posts_per_page' => 3]);
		while ($related->have_posts()) : $related->the_post(); get_template_part('parts/card', null, ['title_tag' => 'h3']); endwhile; wp_reset_postdata();
		endif;
		?></div>
	</section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
