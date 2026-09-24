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

	$query = $use_main_query ? $GLOBALS['wp_query'] : new WP_Query($query_args);
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
	$terms = get_the_terms($post_id, 'product_collection');
	$ids = get_posts([
		'post_type' => 'starter_product',
		'posts_per_page' => 3,
		'post__not_in' => [$post_id],
		'fields' => 'ids',
		'orderby' => 'rand',
		'tax_query' => is_array($terms) && $terms && !is_wp_error($terms) ? [[
			'taxonomy' => 'product_collection',
			'field' => 'term_id',
			'terms' => wp_list_pluck($terms, 'term_id'),
		]] : [],
	]);
	if (count($ids) < 3) {
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
	$query = new WP_Query(['post_type' => 'starter_product', 'post__in' => $ids, 'orderby' => 'post__in', 'posts_per_page' => 3]);
	while ($query->have_posts()) : $query->the_post();
		get_template_part('parts/card', null, ['title_tag' => 'h3']);
	endwhile;
	wp_reset_postdata();
	echo '</div>';
}

/** Full-width conversion band used at the end of catalogue and article pages. */
function component_cta_band(array $props = []): void {
	echo '<section class="cta-band">';
	component_section_heading([
		'eyebrow' => (string) ($props['eyebrow'] ?? 'Start here'),
		'title' => (string) ($props['title'] ?? ''),
		'description' => (string) ($props['text'] ?? ''),
		'link' => $props['button'] ?? [],
	]);
	echo '</section>';
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
