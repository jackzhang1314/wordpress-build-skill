<?php
/**
 * Single news post.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<header class="page-head">
		<?php Starter\Theme\breadcrumbs(); ?>
		<p class="eyebrow">News</p>
		<h1><?php the_title(); ?></h1>
		<p><time datetime="<?php echo esc_attr((string) get_the_date('c')); ?>"><?php echo esc_html((string) get_the_date()); ?></time></p>
	</header>
	<article class="prose article"><?php the_content(); ?></article>
<?php endwhile; ?></main>
<?php get_footer(); ?>
