<?php
/**
 * 404: search + primary destinations.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">404</p>
		<h1>Page not found</h1>
		<p>The page may have moved. Search the site or start from one of these:</p>
		<div style="margin-top:24px"><?php get_search_form(); ?></div>
	</header>
	<div class="term-grid error-grid"><?php foreach ([
		['Product catalogue', '/products/'],
		['Industry solutions', '/industries/'],
		['Knowledge guides', '/guides/'],
		['Contact us', '/contact/'],
	] as $link) : ?>
		<a class="term-card" href="<?php echo esc_url(home_url($link[1])); ?>">
			<h2><?php echo esc_html($link[0]); ?></h2>
			<p><?php echo esc_html($link[1]); ?></p>
		</a>
	<?php endforeach; ?></div>
</main>
<?php get_footer(); ?>
