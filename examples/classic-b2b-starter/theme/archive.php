<?php
/**
 * Generic archive fallback.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<h1><?php echo esc_html(wp_strip_all_tags((string) get_the_archive_title())); ?></h1>
		<?php the_archive_description('<p>', '</p>'); ?>
	</header>
	<?php if (have_posts()) : ?>
		<div class="grid archive-grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
		<?php the_posts_pagination(['prev_text' => '←', 'next_text' => '→']);
	endif; ?>
</main>
<?php get_footer(); ?>
