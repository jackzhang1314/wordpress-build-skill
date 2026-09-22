<article class="card">
<a href="<?php the_permalink(); ?>"><?php if (has_post_thumbnail()) { the_post_thumbnail('medium_large'); } ?><h2><?php the_title(); ?></h2></a>
<?php the_excerpt(); ?>
</article>
