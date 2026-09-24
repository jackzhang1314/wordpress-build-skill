<?php
/**
 * About page: intro, company facts, body, capabilities and CTA.
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post();
	$factory = Starter\Theme\factory_defaults();
	$intro = wp_trim_words(wp_strip_all_tags(preg_replace('/<[^>]+>/', ' ', (string) get_the_content())), 30, '');
	Starter\Theme\component_page_head([
		'eyebrow' => 'About Your Company',
		'title' => get_the_title(),
		'description' => $intro,
	]);
	?>
	<section class="stats" aria-label="Company facts">
		<?php foreach (Starter\Theme\field_rows('factory_stats', 'option', $factory['stats']) as $row) : ?>
		<div class="stat"><b><?php echo esc_html($row['label']); ?></b><span><?php echo esc_html($row['value']); ?></span></div>
		<?php endforeach; ?>
	</section>
	<article class="prose article"><?php the_content(); ?></article>
	<section class="section">
		<?php Starter\Theme\component_section_heading(['eyebrow' => 'Capabilities', 'title' => 'What the factory delivers']); ?>
		<?php Starter\Theme\component_feature_grid([
			'rows' => Starter\Theme\field_rows('factory_capabilities', 'option', $factory['capabilities']),
			'class' => 'grid cap-grid',
		]); ?>
	</section>
	<?php Starter\Theme\component_cta_band([
		'eyebrow' => 'Next step',
		'title' => 'See the quality yourself',
		'text' => 'Request a sample or visit our production line.',
		'button' => ['url' => Starter\Theme\contact_url(), 'label' => 'Contact export team'],
	]);
endwhile; ?></main>
<?php get_footer(); ?>
