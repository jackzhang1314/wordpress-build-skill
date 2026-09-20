<?php get_header(); ?>
<main id="main" class="shell section"><?php while (have_posts()) : the_post(); ?>
<div class="product-layout"><div><?php if (has_post_thumbnail()) { the_post_thumbnail('large', ['loading' => 'eager']); } ?></div><div>
<p class="eyebrow">Product details</p><h1><?php the_title(); ?></h1><?php the_excerpt(); ?>
<dl><?php foreach (['material' => 'Material', 'finish' => 'Finish'] as $key => $label) : $value = NewSite\Theme\field_text($key); if ($value !== '') : ?><div><dt><?php echo esc_html($label); ?></dt><dd><?php echo esc_html($value); ?></dd></div><?php endif; endforeach; ?></dl>
<?php $terms = get_the_terms(get_the_ID(), 'product_collection'); if (is_array($terms)) : ?><p>Collection: <?php foreach ($terms as $term) : $url = get_term_link($term); if (!is_wp_error($url)) : ?><a href="<?php echo esc_url($url); ?>"><?php echo esc_html($term->name); ?></a> <?php endif; endforeach; ?></p><?php endif; ?>
<?php $contact = NewSite\Theme\contact_url(); if ($contact !== '') : ?><a class="button" href="<?php echo esc_url(add_query_arg('product', get_the_title(), $contact)); ?>">Discuss this product</a><?php endif; ?>
</div></div><section class="prose section"><?php the_content(); ?></section>
<?php endwhile; ?></main><?php get_footer(); ?>
