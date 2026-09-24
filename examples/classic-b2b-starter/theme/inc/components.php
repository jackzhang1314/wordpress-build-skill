<?php
/**
 * Reusable presentation components.
 *
 * Templates compose pages from these functions. A component owns markup;
 * CSS owns appearance; content comes in through typed props.
 *
 * @package harness-cleanroom
 */

namespace Cleanroom\Theme;

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
