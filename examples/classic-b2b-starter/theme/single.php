<?php
/**
 * News article: readable typography, byline, TOC, schema and related context.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post();
	$reading_time = Starter\Theme\blog_reading_time();
	$article = Starter\Theme\blog_article_content();
	$modified_visible = Starter\Theme\blog_modified_is_visible();
	$thumbnail_id = (int) get_post_thumbnail_id();
	$thumbnail_caption = $thumbnail_id ? (string) wp_get_attachment_caption($thumbnail_id) : '';
	$author_name = get_the_author() ?: get_bloginfo('name');
	$author_id = (int) get_the_author_meta('ID');
	$author_url = $author_id ? (string) get_author_posts_url($author_id) : '';
	$author_bio = get_the_author_meta('description');
	$tags = get_the_tag_list('<div class="article-tags"><span>Topics</span>', '', '</div>');
?>
	<article <?php post_class('single-article'); ?>>
		<header class="article-header">
			<?php Starter\Theme\breadcrumbs(); ?>
			<div class="article-kicker-row">
				<a class="article-kicker" href="<?php echo esc_url((string) (get_post_type_archive_link('post') ?: home_url('/'))); ?>">News</a>
				<?php $categories = get_the_category(); ?>
				<?php foreach ($categories as $category) : ?>
					<a class="article-category" href="<?php echo esc_url((string) get_category_link($category)); ?>"><?php echo esc_html($category->name); ?></a>
				<?php endforeach; ?>
			</div>
			<h1><?php the_title(); ?></h1>
			<?php if (has_excerpt()) : ?><p class="article-leader"><?php echo esc_html(get_the_excerpt()); ?></p><?php endif; ?>
			<div class="article-byline">
				<?php echo get_avatar($author_id, 44, '', $author_name, ['class' => 'article-avatar']); ?>
				<div>
					<span class="byline-label">Written by</span>
					<?php if ($author_url) : ?><a href="<?php echo esc_url($author_url); ?>"><?php echo esc_html($author_name); ?></a><?php else : ?><span><?php echo esc_html($author_name); ?></span><?php endif; ?>
				</div>
				<div class="article-dates">
					<span>Published <time datetime="<?php echo esc_attr((string) get_the_date('c')); ?>"><?php echo esc_html((string) get_the_date()); ?></time></span>
					<?php if ($modified_visible) : ?>
						<span>Updated <time datetime="<?php echo esc_attr((string) get_the_modified_date('c')); ?>"><?php echo esc_html((string) get_the_modified_date()); ?></time></span>
					<?php endif; ?>
					<span><?php echo esc_html($reading_time); ?> min read</span>
				</div>
			</div>
		</header>

		<?php if (has_post_thumbnail()) : ?>
			<figure class="article-figure">
				<?php the_post_thumbnail('wide', ['class' => 'article-photo', 'loading' => 'eager']); ?>
				<?php if ($thumbnail_caption) : ?><figcaption><?php echo esc_html($thumbnail_caption); ?></figcaption><?php endif; ?>
			</figure>
		<?php endif; ?>

		<div class="article-layout<?= count($article['items']) >= 3 ? ' has-toc' : ''; ?>">
			<?php if (count($article['items']) >= 3) : ?>
				<aside class="article-toc" aria-label="Table of contents">
					<h2>On this page</h2>
					<ol>
						<?php foreach ($article['items'] as $item) : ?>
							<li class="toc-level-<?= esc_attr((string) $item['level']); ?>">
								<a href="#<?php echo esc_attr($item['id']); ?>"><?php echo esc_html($item['text']); ?></a>
							</li>
						<?php endforeach; ?>
					</ol>
				</aside>
			<?php endif; ?>
			<div class="article-body prose">
				<?php echo $article['content']; // phpcs:ignore WordPress.Security.EscapeOutput -- filtered WordPress post content. ?>
			</div>
		</div>

		<?php if ($tags) : echo wp_kses_post($tags); endif; ?>

		<aside class="author-box">
			<?php echo get_avatar($author_id, 64, '', $author_name, ['class' => 'author-avatar']); ?>
			<div>
				<p class="author-label">Written by <?php echo esc_html($author_name); ?></p>
				<p class="author-bio">
					<?php echo esc_html($author_bio ?: 'Published by ' . get_bloginfo('name') . ' to share production, export and product updates with project buyers.'); ?>
				</p>
			</div>
		</aside>
	</article>

	<?php
	$prev = get_previous_post();
	$next = get_next_post();
	$related = Starter\Theme\blog_related_posts(get_the_ID(), 3);
	?>
	<?php if ($prev || $next) : ?>
	<nav class="guide-nav" aria-label="More news">
		<?php if ($prev) : ?><a class="prev" href="<?php echo esc_url(get_permalink($prev)); ?>"><span class="guide-nav-label">Previous</span><span class="guide-nav-title"><?php echo esc_html(get_the_title($prev)); ?></span></a><?php endif; ?>
		<?php if ($next) : ?><a class="next" href="<?php echo esc_url(get_permalink($next)); ?>"><span class="guide-nav-label">Next</span><span class="guide-nav-title"><?php echo esc_html(get_the_title($next)); ?></span></a><?php endif; ?>
	</nav>
	<?php endif; ?>

	<?php if ($related) : ?>
	<section class="section related-posts">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Keep reading', 'title' => 'Related updates']); ?>
		<?php Starter\Theme\component_related_blog_cards(['posts' => $related]); ?>
	</section>
	<?php endif; ?>

	<?php
	$image = get_the_post_thumbnail_url(get_the_ID(), 'large');
	$schema = [
		'@context' => 'https://schema.org',
		'@type' => 'BlogPosting',
		'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => (string) get_permalink()],
		'headline' => wp_html_excerpt(wp_strip_all_tags((string) get_the_title()), 110, '…'),
		'description' => wp_strip_all_tags((string) get_the_excerpt()),
		'datePublished' => (string) get_the_date('c'),
		'dateModified' => (string) get_the_modified_date('c'),
		'inLanguage' => (string) get_bloginfo('language'),
		'isAccessibleForFree' => true,
		'author' => [
			'@type' => $author_name === (string) get_bloginfo('name') ? 'Organization' : 'Person',
			'name' => (string) $author_name,
			'url' => $author_url ?: home_url('/'),
		],
		'publisher' => [
			'@type' => 'Organization',
			'name' => (string) get_bloginfo('name'),
			'logo' => ['@type' => 'ImageObject', 'url' => Starter\Theme\blog_publisher_logo_url()],
		],
	];
	if ($image) $schema['image'] = $image;
	?>
	<script type="application/ld+json"><?php echo wp_json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?></script>

	<?php Starter\Theme\component_cta_band([
		'title' => 'Have a question about this update?',
		'text' => 'Contact the team for project, product or export information.',
		'button' => ['url' => Starter\Theme\contact_url(), 'label' => 'Contact us'],
	]); ?>
<?php endwhile; ?></main>
<?php get_footer(); ?>
