<?php
/**
 * Product catalogue archive.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell">
	<?php Cleanroom\Theme\component_page_head(['eyebrow' => 'Catalogue', 'title' => 'Product catalogue', 'description' => 'Certified industrial and commercial LED luminaires for distributors, contractors and project tenders.']); ?>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Applications</p><h2>Browse by application</h2></div></div>
		<?php Cleanroom\Theme\term_cards('product_collection'); ?>
	</section>
	<div class="grid archive-grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
	<?php the_posts_pagination(['prev_text' => '←', 'next_text' => '→']); ?>
</main>
<?php get_footer(); ?>
