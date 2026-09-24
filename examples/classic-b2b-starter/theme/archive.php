<?php
/**
 * Generic archive fallback.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Starter\Theme\component_page_head([
		'title' => wp_strip_all_tags((string) get_the_archive_title()),
		'description' => get_the_archive_description(),
	]); ?>
	<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
</main>
<?php get_footer(); ?>
