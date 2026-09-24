<?php
/**
 * News article: featured media, metadata, article navigation, related and CTA.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'News',
		'title' => get_the_title(),
		'description' => get_the_excerpt(),
	]); ?>
	<div class="article-meta">
		<time datetime="<?php echo esc_attr((string) get_the_date('c')); ?>"><?php echo esc_html((string) get_the_date()); ?></time>
		<?php $categories = get_the_category_list(', '); if ($categories) : ?><span><?php echo wp_kses_post($categories); ?></span><?php endif; ?>
	</div>
	<?php if (has_post_thumbnail()) the_post_thumbnail('wide', ['class' => 'article-photo', 'loading' => 'eager']); ?>
	<article class="prose article"><?php the_content(); ?></article>
	<?php $prev = get_previous_post(); $next = get_next_post(); ?>
	<?php if ($prev || $next) : ?>
	<nav class="guide-nav" aria-label="More news">
		<?php if ($prev) : ?><a class="prev" href="<?php echo esc_url(get_permalink($prev)); ?>"><span class="guide-nav-label">Previous</span><span class="guide-nav-title"><?php echo esc_html(get_the_title($prev)); ?></span></a><?php endif; ?>
		<?php if ($next) : ?><a class="next" href="<?php echo esc_url(get_permalink($next)); ?>"><span class="guide-nav-label">Next</span><span class="guide-nav-title"><?php echo esc_html(get_the_title($next)); ?></span></a><?php endif; ?>
	</nav>
	<?php endif; ?>
	<?php Starter\Theme\component_cta_band([
		'title' => 'Have a question about this update?',
		'text' => 'Contact the team for project or product information.',
		'button' => ['url' => Starter\Theme\contact_url(), 'label' => 'Contact us'],
	]); ?>
<?php endwhile; ?></main>
<?php get_footer(); ?>
