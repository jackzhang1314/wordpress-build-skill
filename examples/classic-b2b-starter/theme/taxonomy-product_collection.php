<?php
/**
 * Product category: hero, highlights, catalogue, applications,
 * related industries, FAQ — every block editable via ACF term fields.
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php $term = get_queried_object();
$slug = (string) ($term->slug ?? '');
$defaults = Cleanroom\Theme\category_defaults($slug);
$intro = Cleanroom\Theme\field_text('category_intro', $term);
if (trim($intro) === '') $intro = $defaults['intro'];
$features = Cleanroom\Theme\field_rows('category_features', $term, $defaults['features']);
$applications = Cleanroom\Theme\field_lines('category_applications', $term, $defaults['applications']);
$faq = Cleanroom\Theme\field_rows('category_faq', $term, $defaults['faq']);
?>
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">Product category</p>
		<h1><?php single_term_title(); ?></h1>
		<p><?php echo esc_html($term->description ?? ''); ?></p>
		<?php if ($intro !== '') : ?><p class="lead-intro"><?php echo esc_html($intro); ?></p><?php endif; ?>
	</header>

	<?php if ($features) : ?>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Why this category</p><h2>What defines these luminaires</h2></div></div>
		<div class="term-grid"><?php foreach ($features as $feature) : ?>
			<div class="term-card"><h3><?php echo esc_html($feature['label']); ?></h3><p><?php echo esc_html($feature['value']); ?></p></div>
		<?php endforeach; ?></div>
	</section>
	<?php endif; ?>

	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Catalogue</p><h2>Luminaires in this category</h2></div><a class="more" href="<?php echo esc_url(get_post_type_archive_link('cleanroom_product')); ?>">All products</a></div>
		<div class="grid"><?php while (have_posts()) : the_post(); get_template_part('parts/card'); endwhile; ?></div>
		<?php the_posts_pagination(['prev_text' => '←', 'next_text' => '→']); ?>
	</section>

	<?php if ($applications) : ?>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Applications</p><h2>Typical applications</h2></div></div>
		<ul class="app-list"><?php foreach ($applications as $application) : ?><li><?php echo esc_html($application); ?></li><?php endforeach; ?></ul>
	</section>
	<?php endif; ?>

	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">Sectors</p><h2>Solutions using this category</h2></div><a class="more" href="<?php echo esc_url(get_post_type_archive_link('cleanroom_industry')); ?>">All solutions</a></div>
		<div class="grid"><?php $industries = new WP_Query(['post_type' => 'cleanroom_industry', 'posts_per_page' => 3]); while ($industries->have_posts()) : $industries->the_post(); get_template_part('parts/card', null, ['title_tag' => 'h3']); endwhile; wp_reset_postdata(); ?></div>
	</section>

	<?php if ($faq) : ?>
	<section class="section">
		<div class="section-heading"><div><p class="eyebrow">FAQ</p><h2>Common buyer questions</h2></div></div>
		<div class="faq"><?php foreach ($faq as $item) : ?>
			<details class="faq-item"><summary><?php echo esc_html($item['label']); ?></summary><p><?php echo esc_html($item['value']); ?></p></details>
		<?php endforeach; ?></div>
	</section>
	<?php endif; ?>

	<section class="cta-band">
		<div class="section-heading"><div><p class="eyebrow">Start here</p><h2>Specifying <?php echo esc_html(strtolower(trim((string) single_term_title('', false)))); ?> for a project?</h2><p>Send the layout or mounting heights — we return a photometric layout and itemised pricing in three working days.</p></div><a class="button" href="<?php echo esc_url(Cleanroom\Theme\contact_url(single_term_title('', false))); ?>">Request a quotation</a></div>
	</section>
</main>
<?php get_footer(); ?>
