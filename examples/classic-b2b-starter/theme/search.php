<?php
/**
 * Search results.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">Search</p>
		<h1>Results for “<?php echo esc_html((string) get_search_query()); ?>”</h1>
		<p><?php echo esc_html(sprintf(_n('%d result found', '%d results found', (int) $GLOBALS['wp_query']->found_posts), (int) $GLOBALS['wp_query']->found_posts)); ?></p>
	</header>
	<?php if (have_posts()) : ?>
		<div class="grid archive-grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
		<?php the_posts_pagination(['prev_text' => '←', 'next_text' => '→']);
	else : ?>
		<div class="no-results">
			<p>No results. Try a product type, an application or a certification name.</p>
			<?php get_search_form(); ?>
		</div>
	<?php endif; ?>
</main>
<?php get_footer(); ?>
