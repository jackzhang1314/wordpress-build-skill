<?php get_header(); ?>
<main id="main" class="shell">
<?php while (have_posts()) : the_post(); ?>
<section class="hero"><p class="eyebrow"><?php bloginfo('description'); ?></p><h1><?php the_title(); ?></h1><div class="prose"><?php the_content(); ?></div></section>
<?php endwhile; ?>
<?php if (post_type_exists('site_product')) : ?>
<section class="section"><div class="section-heading"><h2>Explore the collection</h2><a href="<?php echo esc_url(get_post_type_archive_link('site_product')); ?>">All products →</a></div>
<div class="grid"><?php $products = new WP_Query(['post_type' => 'site_product', 'posts_per_page' => 3]); while ($products->have_posts()) : $products->the_post(); get_template_part('parts/card'); endwhile; wp_reset_postdata(); ?></div></section>
<?php endif; ?>
</main><?php get_footer(); ?>
