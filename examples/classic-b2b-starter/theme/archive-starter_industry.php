<?php
/**
 * Industry solutions archive.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'Sectors',
		'title' => 'Industry solutions',
		'description' => 'Lighting packages matched to operating hours, mounting heights and compliance needs of each sector.',
	]); ?>
	<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
</main>
<?php get_footer(); ?>
