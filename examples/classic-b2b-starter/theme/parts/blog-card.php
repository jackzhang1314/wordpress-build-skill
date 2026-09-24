<?php
/**
 * Editorial post card for blog archives and related article sections.
 *
 * @package b2b-starter
 */

$props = $args ?? [];
$featured = (bool) ($props['featured'] ?? false);
$category = Starter\Theme\blog_primary_category();
$reading_time = Starter\Theme\blog_reading_time();
$author_name = get_the_author() ?: get_bloginfo('name');
$author_id = (int) get_the_author_meta('ID');
$modified = Starter\Theme\blog_modified_is_visible();
?>
<article class="blog-card<?= $featured ? ' is-featured' : ''; ?>">
	<a class="blog-media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
		<?php Starter\Theme\card_media('post'); ?>
	</a>
	<div class="blog-body">
		<div class="blog-meta">
			<?php if ($category instanceof WP_Term) : ?>
				<a class="blog-chip" href="<?php echo esc_url((string) get_category_link($category)); ?>"><?php echo esc_html($category->name); ?></a>
			<?php endif; ?>
			<time datetime="<?php echo esc_attr((string) get_the_date('c')); ?>"><?php echo esc_html((string) get_the_date()); ?></time>
			<span><?php echo esc_html($reading_time); ?> min read</span>
		</div>
		<<?php echo $featured ? 'h2' : 'h3'; ?> class="blog-title">
			<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
		</<?php echo $featured ? 'h2' : 'h3'; ?>>
		<p class="blog-excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), $featured ? 34 : 22)); ?></p>
		<div class="blog-byline">
			<?php if ($author_id) : ?><?php echo get_avatar($author_id, 28, '', $author_name, ['class' => 'blog-avatar']); ?><?php endif; ?>
			<span>By <?php echo esc_html($author_name); ?></span>
		</div>
		<span class="more">Read article</span>
	</div>
</article>
