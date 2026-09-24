<?php
/**
 * Knowledge guides archive.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Cleanroom\Theme\component_page_head(['eyebrow' => 'Knowledge', 'title' => 'Knowledge guides', 'description' => 'Practical specification, installation and certification notes for project buyers.']); ?>
	<div class="grid archive-grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
</main>
<?php get_footer(); ?>
