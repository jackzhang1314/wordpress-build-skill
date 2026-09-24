<?php
/**
 * Generic page.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Cleanroom\Theme\component_page_head(['title' => get_the_title()]); ?>
	<article class="prose article"><?php
		if (has_post_thumbnail()) {
			the_post_thumbnail('large', ['class' => 'page-photo']);
		}
		the_content();
	?></article>
<?php endwhile; ?></main>
<?php get_footer(); ?>
