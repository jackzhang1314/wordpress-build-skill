<?php
/**
 * Reusable presentation components.
 *
 * Templates compose pages from these functions. A component owns markup;
 * CSS owns appearance; content comes in through typed props.
 *
 * @package b2b-starter
 */

namespace Starter\Theme;

defined('ABSPATH') || exit;

/** Inner page heading with optional eyebrow, description and breadcrumbs. */
function component_page_head(array $props = []): void {
	$eyebrow = (string) ($props['eyebrow'] ?? '');
	$title = (string) ($props['title'] ?? '');
	$description = (string) ($props['description'] ?? '');
	$show_breadcrumbs = (bool) ($props['breadcrumbs'] ?? true);

	echo '<header class="page-head">';
	if ($show_breadcrumbs) breadcrumbs();
	if ($eyebrow !== '') echo '<p class="eyebrow">' . esc_html($eyebrow) . '</p>';
	if ($title !== '') echo '<h1>' . esc_html($title) . '</h1>';
	if ($description !== '') echo '<p>' . esc_html($description) . '</p>';
	echo '</header>';
}

/** Standard section heading, optionally with a right-aligned archive link. */
function component_section_heading(array $props = []): void {
	$eyebrow = (string) ($props['eyebrow'] ?? '');
	$title = (string) ($props['title'] ?? '');
	$description = (string) ($props['description'] ?? '');
	$link = $props['link'] ?? [];

	echo '<div class="section-heading"><div>';
	if ($eyebrow !== '') echo '<p class="eyebrow">' . esc_html($eyebrow) . '</p>';
	if ($title !== '') echo '<h2>' . esc_html($title) . '</h2>';
	if ($description !== '') echo '<p>' . esc_html($description) . '</p>';
	echo '</div>';
	if (!empty($link['url']) && !empty($link['label'])) {
		printf('<a class="more" href="%s">%s</a>', esc_url((string) $link['url']), esc_html((string) $link['label']));
	}
	echo '</div>';
}

/** Card grid from an explicit WP_Query args array. */
function component_card_grid(array $props = []): void {
	$query_args = (array) ($props['query_args'] ?? []);
	$query_args['post_type'] = $query_args['post_type'] ?? 'post';
	$query_args['posts_per_page'] = $query_args['posts_per_page'] ?? 3;
	$title_tag = ($props['title_tag'] ?? 'h2') === 'h3' ? 'h3' : 'h2';
	$use_main_query = (bool) ($props['main_query'] ?? false);
	$pagination = (bool) ($props['pagination'] ?? false);

	$query = $use_main_query ? $GLOBALS['wp_query'] : new \WP_Query($query_args);
	echo '<div class="grid archive-grid">';
	if ($query->have_posts()) {
		while ($query->have_posts()) : $query->the_post();
			get_template_part('parts/card', null, ['title_tag' => $title_tag]);
		endwhile;
	} else {
		echo '<p class="empty-state">' . esc_html(($props['empty_text'] ?? 'No items yet.')) . '</p>';
	}
	echo '</div>';
	if (!$use_main_query) wp_reset_postdata();
	if ($pagination && $use_main_query) {
		the_posts_pagination(['prev_text' => '←', 'next_text' => '→']);
	}
}

/** Grid of label/value feature cards. */
function component_feature_grid(array $props = []): void {
	$rows = (array) ($props['rows'] ?? []);
	if (!$rows) return;
	echo '<div class="' . esc_attr($props['class'] ?? 'term-grid') . '">';
	foreach ($rows as $row) {
		$label = (string) ($row['label'] ?? '');
		$value = (string) ($row['value'] ?? '');
		if ($label === '' && $value === '') continue;
		printf(
			'<div class="term-card"><h3>%s</h3><p>%s</p></div>',
			esc_html($label),
			esc_html($value)
		);
	}
	echo '</div>';
}

/** Accessible compact list of applications or highlights. */
function component_pill_list(array $props = []): void {
	$items = array_values(array_filter(array_map('trim', (array) ($props['items'] ?? []))));
	if (!$items) return;
	echo '<ul class="app-list">';
	foreach ($items as $item) echo '<li>' . esc_html($item) . '</li>';
	echo '</ul>';
}

/** Collapsible FAQ rows. */
function component_faq(array $props = []): void {
	$rows = (array) ($props['rows'] ?? []);
	if (!$rows) return;
	echo '<div class="faq">';
	foreach ($rows as $row) {
		printf(
			'<details class="faq-item"><summary>%s</summary><p>%s</p></details>',
			esc_html((string) ($row['label'] ?? '')),
			esc_html((string) ($row['value'] ?? ''))
		);
	}
	echo '</div>';
}

/** Highlight callout; variant may be info or ok. */
function component_callout(array $props = []): void {
	$title = (string) ($props['title'] ?? '');
	$text = (string) ($props['text'] ?? '');
	$variant = ($props['variant'] ?? 'info') === 'ok' ? ' callout--ok' : '';
	if ($title === '' && $text === '') return;
	printf('<section class="callout%s"><h2>%s</h2><p>%s</p></section>', esc_attr($variant), esc_html($title), esc_html($text));
}

/** Label/value specification table. */
function component_spec_table(array $props = []): void {
	$rows = array_values(array_filter((array) ($props['rows'] ?? []), static fn ($row): bool => trim((string) ($row['label'] ?? '')) !== ''));
	if (!$rows) return;
	echo '<table class="spec-table"><tbody>';
	foreach ($rows as $row) {
		printf('<tr><th scope="row">%s</th><td>%s</td></tr>', esc_html((string) $row['label']), esc_html((string) ($row['value'] ?? '')));
	}
	echo '</tbody></table>';
}

/** Compact definition list of key specs. Fields map: field_name => label. */
function component_quick_specs(array $props = []): void {
	$rows = array_values(array_filter((array) ($props['rows'] ?? []), static fn ($row): bool => trim((string) ($row['label'] ?? '')) !== ''));
	if (!$rows) return;
	echo '<dl class="quick-specs">';
	foreach ($rows as $row) {
		printf('<div><dt>%s</dt><dd>%s</dd></div>', esc_html($row['label']), esc_html($row['value']));
	}
	echo '</dl>';
}

/** Checklist rendered from plain lines; hidden when empty. */
function component_check_list(array $props = []): void {
	$items = array_values(array_filter(array_map('trim', (array) ($props['items'] ?? []))));
	if (!$items) return;
	echo '<ul class="check-list">';
	foreach ($items as $item) echo '<li>' . esc_html($item) . '</li>';
	echo '</ul>';
}

/** Small trust/reassurance strip of short claims. */
function component_trust_strip(array $props = []): void {
	$items = array_values(array_filter(array_map('trim', (array) ($props['items'] ?? []))));
	if (!$items) return;
	echo '<p class="trust-strip">';
	foreach ($items as $item) echo '<span>' . esc_html($item) . '</span>';
	echo '</p>';
}

/** Linked taxonomy chips for the current post. */
function component_term_chips(array $props = []): void {
	$taxonomy = (string) ($props['taxonomy'] ?? 'product_collection');
	$post_id = (int) ($props['post_id'] ?? get_the_ID());
	$terms = get_the_terms($post_id, $taxonomy);
	if (!is_array($terms) || !$terms) return;
	echo '<div class="product-meta">';
	foreach ($terms as $term) {
		$url = get_term_link($term);
		if (!is_wp_error($url)) {
			printf('<a class="card-chip" href="%s">%s</a>', esc_url((string) $url), esc_html($term->name));
		}
	}
	echo '</div>';
}

/** Direct-link cards used by 404 and other recovery layouts. */
function component_link_cards(array $props = []): void {
	$links = (array) ($props['links'] ?? []);
	if (!$links) return;
	echo '<div class="term-grid error-grid">';
	foreach ($links as $link) {
		printf(
			'<a class="term-card" href="%s"><h2>%s</h2><p>%s</p></a>',
			esc_url((string) ($link['url'] ?? '')),
			esc_html((string) ($link['label'] ?? '')),
			esc_html((string) ($link['description'] ?? ''))
		);
	}
	echo '</div>';
}

/** Related products from the current product's terms, with catalogue fallback. */
function component_related_products(array $props = []): void {
	$post_id = (int) ($props['post_id'] ?? get_the_ID());
	$manual_ids = array_values(array_filter(array_map('intval', (array) ($props['related_ids'] ?? []))));
	$terms = get_the_terms($post_id, 'product_collection');
	$ids = get_posts([
		'post_type' => 'starter_product',
		'posts_per_page' => 3,
		'post__not_in' => [$post_id],
		'fields' => 'ids',
		'orderby' => $manual_ids ? 'none' : 'rand',
		'post__in' => $manual_ids,
		'tax_query' => is_array($terms) && $terms && !is_wp_error($terms) ? [[
			'taxonomy' => 'product_collection',
			'field' => 'term_id',
			'terms' => wp_list_pluck($terms, 'term_id'),
		]] : [],
	]);
	if (!$manual_ids && count($ids) < 3) {
		$ids = array_merge($ids, get_posts([
			'post_type' => 'starter_product',
			'posts_per_page' => 3 - count($ids),
			'post__not_in' => array_merge([$post_id], $ids),
			'fields' => 'ids',
			'orderby' => 'rand',
		]));
	}
	if (!$ids) return;
	component_section_heading([
		'eyebrow' => 'Also consider',
		'title' => 'Related products',
		'link' => ['url' => get_post_type_archive_link('starter_product'), 'label' => 'View all'],
	]);
	echo '<div class="grid">';
	$query = new \WP_Query(['post_type' => 'starter_product', 'post__in' => $ids, 'orderby' => 'post__in', 'posts_per_page' => 3]);
	while ($query->have_posts()) : $query->the_post();
		get_template_part('parts/card', null, ['title_tag' => 'h3']);
	endwhile;
	wp_reset_postdata();
	echo '</div>';
}

/** Full-width conversion band used at the end of catalogue and article pages. */
function component_cta_band(array $props = []): void {
	$button = $props['button'] ?? [];
	echo '<section class="cta-band"><div class="cta-layout">';
	component_section_heading([
		'eyebrow' => (string) ($props['eyebrow'] ?? 'Start here'),
		'title' => (string) ($props['title'] ?? ''),
		'description' => (string) ($props['text'] ?? ''),
	]);
	if (!empty($button['url']) && !empty($button['label'])) {
		printf('<a class="button" href="%s">%s</a>', esc_url((string) $button['url']), esc_html((string) $button['label']));
	}
	echo '</div></section>';
}

/** Three-column social-proof strip; empty items are omitted. */
function component_stat_strip(array $props = []): void {
	$items = array_values(array_filter((array) ($props['items'] ?? []), static fn ($item): bool => trim((string) ($item['value'] ?? '')) !== ''));
	if (!$items) return;
	echo '<section class="stats" aria-label="Key facts">';
	foreach ($items as $item) {
		echo '<div><b>' . esc_html((string) $item['value']) . '</b><span>' . esc_html((string) ($item['label'] ?? '')) . '</span></div>';
	}
	echo '</section>';
}

/** Product gallery with accessible thumbnail switching and a neutral empty state. */
function component_product_gallery(array $props = []): void {
	$images = array_values(array_filter((array) ($props['images'] ?? []), static fn ($image): bool => trim((string) ($image['url'] ?? '')) !== ''));
	$title = (string) ($props['title'] ?? get_the_title());
	echo '<figure class="product-gallery' . (count($images) > 1 ? ' has-many' : '') . '">';
	if ($images) {
		$first = $images[0];
		printf(
			'<div class="gallery-main"><img id="product-gallery-main" src="%s" alt="%s" loading="eager" decoding="async"></div>',
			esc_url((string) $first['url']),
			esc_attr((string) ($first['alt'] !== '' ? $first['alt'] : $title))
		);
		if ((string) ($first['caption'] ?? '') !== '') {
			printf('<figcaption class="gallery-caption">%s</figcaption>', esc_html((string) $first['caption']));
		}
		if (count($images) > 1) {
			echo '<div class="gallery-thumbs" role="group" aria-label="Product image selector">';
			foreach ($images as $index => $image) {
				printf(
					'<button type="button" class="gallery-thumb%1$s" data-src="%2$s" data-alt="%3$s" data-caption="%4$s" aria-current="%5$s"><img src="%2$s" alt="" loading="lazy" decoding="async"></button>',
					0 === $index ? ' is-active' : '',
					esc_url((string) $image['url']),
					esc_attr((string) ($image['alt'] !== '' ? $image['alt'] : $title)),
					esc_attr((string) ($image['caption'] ?? '')),
					0 === $index ? 'true' : 'false'
				);
			}
			echo '</div>';
		}
	} else {
		echo '<div class="gallery-main">' . media_placeholder('product', $title) . '</div>';
	}
	echo '</figure>';
}

/** Compact product hero summary: identity and conversion only. */
function component_product_hero_summary(array $props = []): void {
	$category = (array) ($props['category'] ?? []);
	$title = (string) ($props['title'] ?? get_the_title());
	$description = (string) ($props['description'] ?? '');
	$chips = (array) ($props['value_chips'] ?? []);
	$cta = (array) ($props['cta'] ?? []);
	echo '<div class="product-summary">';
	if (!empty($category['url'])) {
		printf('<a class="card-chip product-category" href="%s">%s</a>', esc_url((string) $category['url']), esc_html((string) $category['name']));
	} elseif (!empty($category['name'])) {
		printf('<span class="card-chip product-category">%s</span>', esc_html((string) $category['name']));
	}
	printf('<h1>%s</h1>', esc_html($title));
	if ($description !== '') echo '<div class="prose product-intro"><p>' . esc_html($description) . '</p></div>';
	if ($chips) {
		echo '<ul class="product-value-chips">';
		foreach ($chips as $chip) {
			printf('<li><span>%s</span><strong>%s</strong></li>', esc_html((string) ($chip['label'] ?? '')), esc_html((string) ($chip['value'] ?? '')));
		}
		echo '</ul>';
	}
	if (!empty($cta['url'])) {
		echo '<div class="hero-conversion">';
		printf('<a class="button button-large" href="%s">%s</a>', esc_url((string) $cta['url']), esc_html((string) ($cta['label'] ?? 'Request pricing')));
		if (!empty($cta['note'])) printf('<p class="conversion-note">%s</p>', esc_html((string) $cta['note']));
		echo '</div>';
	}
	echo '</div>';
}

/** Compact label/value grid for four to six key product attributes. */
function component_attribute_grid(array $props = []): void {
	$rows = array_values(array_filter((array) ($props['rows'] ?? []), static fn ($row): bool => trim((string) ($row['label'] ?? '')) !== ''));
	if (!$rows) return;
	echo '<dl class="attribute-grid">';
	foreach ($rows as $row) printf('<div><dt>%s</dt><dd>%s</dd></div>', esc_html((string) $row['label']), esc_html((string) ($row['value'] ?? '')));
	echo '</dl>';
}

/** Commercial facts strip; each named value is hidden when empty. */
function component_fact_strip(array $props = []): void {
	$rows = array_values(array_filter((array) ($props['rows'] ?? []), static fn ($row): bool => trim((string) ($row['value'] ?? '')) !== ''));
	if (!$rows) return;
	echo '<dl class="fact-strip">';
	foreach ($rows as $row) printf('<div><dt>%s</dt><dd>%s</dd></div>', esc_html((string) $row['label']), esc_html((string) $row['value']));
	echo '</dl>';
}

/** Named document cards; an optional second line segment becomes a link. */
function component_document_list(array $props = []): void {
	$documents = array_values(array_filter((array) ($props['documents'] ?? []), static fn ($row): bool => trim((string) ($row['label'] ?? '')) !== ''));
	if (!$documents) return;
	echo '<div class="document-card-grid">';
	foreach ($documents as $document) {
		$label = (string) $document['label'];
		echo '<div class="document-card">';
		if (!empty($document['is_link'])) {
			printf('<a href="%s">%s<span aria-hidden="true">→</span></a>', esc_url((string) $document['url']), esc_html($label));
		} else {
			printf('<p>%s</p>', esc_html($label));
		}
		echo '</div>';
	}
	echo '</div>';
}

/** Constrained wrapper for WordPress main editor content. */
function component_rich_description(array $props = []): void {
	$content = trim((string) ($props['content'] ?? ''));
	if ($content === '') return;
	echo '<section class="product-details">';
	component_section_heading([
		'eyebrow' => (string) ($props['eyebrow'] ?? 'Details'),
		'title' => (string) ($props['title'] ?? 'Product details'),
	]);
	echo '<article class="prose rich-description">' . $content . '</article>'; // phpcs:ignore WordPress.Security.EscapeOutput -- editor content is trusted and already filtered by the_content().
	echo '</section>';
}
