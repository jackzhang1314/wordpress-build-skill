<?php
/**
 * Industry solutions archive.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Cleanroom\Theme\component_page_head(['eyebrow' => 'Sectors', 'title' => 'Industry solutions', 'description' => 'Lighting packages matched to operating hours, mounting heights and compliance needs of each sector.']); ?>
	<div class="grid archive-grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
</main>
<?php get_footer(); ?>
