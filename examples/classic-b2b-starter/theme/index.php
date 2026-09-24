<?php
/**
 * News archive / blog home.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'Company',
		'title' => 'News & updates',
		'description' => Starter\Theme\field_option('news_archive_description') ?: 'Production, certifications and exhibition notes from the team.',
	]); ?>
	<?php Starter\Theme\component_card_grid(['main_query' => true, 'pagination' => true]); ?>
</main>
<?php get_footer(); ?>
