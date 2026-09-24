<?php
/**
 * News archive / blog home.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">Company</p>
		<h1>News &amp; updates</h1>
		<p>Production, certifications and exhibition notes from the team.</p>
	</header>
	<?php if (have_posts()) : ?>
		<div class="grid archive-grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
		<?php the_posts_pagination(['prev_text' => '←', 'next_text' => '→']);
	endif; ?>
</main>
<?php get_footer(); ?>
