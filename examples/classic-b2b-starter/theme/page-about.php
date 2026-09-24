<?php
/**
 * About page: intro, company facts, body, quality pillars, CTA.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">About Your Company</p>
		<h1><?php the_title(); ?></h1>
		<p><?php echo esc_html(wp_trim_words(wp_strip_all_tags(preg_replace('/<[^>]+>/', ' ', (string) get_the_content())), 30, '')); ?></p>
	</header>
	<section class="stats" aria-label="Company facts">
		<?php $factory = Cleanroom\Theme\factory_defaults();
		foreach (Cleanroom\Theme\field_rows('factory_stats', 'option', $factory['stats']) as $row) : ?>
		<div class="stat"><b><?php echo esc_html($row['label']); ?></b><span><?php echo esc_html($row['value']); ?></span></div>
		<?php endforeach; ?>
	</section>
	<article class="prose article"><?php the_content(); ?></article>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Capabilities</p><h2>What the factory delivers</h2></div></div>
		<div class="grid cap-grid"><?php
		foreach (Cleanroom\Theme\field_rows('factory_capabilities', 'option', $factory['capabilities']) as $row) : ?>
			<div class="term-card"><h3><?php echo esc_html($row['label']); ?></h3><p><?php echo esc_html($row['value']); ?></p></div>
		<?php endforeach; ?></div>
	</section>
	<section class="cta-band">
		<div class="section-heading"><div><p class="eyebrow">Next step</p><h2>See the quality yourself</h2><p>Request a sample or visit our production line.</p></div><a class="button" href="<?php echo esc_url(Cleanroom\Theme\contact_url()); ?>">Contact export team</a></div>
	</section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
