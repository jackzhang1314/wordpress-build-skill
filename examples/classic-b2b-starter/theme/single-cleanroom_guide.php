<?php
/**
 * Single guide: article column, prev/next navigation and CTA.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">Knowledge</p>
		<h1><?php the_title(); ?></h1>
		<p><?php echo esc_html(Cleanroom\Theme\trimmed_intro()); ?></p>
	</header>
	<article class="prose article"><?php the_content(); ?></article>
	<?php
	$prev = get_previous_post();
	$next = get_next_post();
	?>
	<?php if ($prev || $next) : ?>
	<nav class="guide-nav" aria-label="More guides"><?php
		if ($prev) {
			printf('<a class="prev" href="%s"><span class="guide-nav-label">Previous guide</span><span class="guide-nav-title">%s</span></a>', esc_url(get_permalink($prev)), esc_html(get_the_title($prev)));
		}
		if ($next) {
			printf('<a class="next" href="%s"><span class="guide-nav-label">Next guide</span><span class="guide-nav-title">%s</span></a>', esc_url(get_permalink($next)), esc_html(get_the_title($next)));
		}
		?></nav>
	<?php endif; ?>
	<section class="cta-band">
		<div class="section-heading"><div><p class="eyebrow">Next step</p><h2>Specifying a project?</h2><p>Send drawings or a schedule — itemised pricing in three working days.</p></div><a class="button" href="<?php echo esc_url(Cleanroom\Theme\contact_url()); ?>">Contact our team</a></div>
	</section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
