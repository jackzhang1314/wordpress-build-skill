<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Template Name: Landing v1 (free HTML)
 * Description: Dark hero + page content + CTA band. Upgrades secondary pages
 * (company, industries, FAQ, support…) while keeping their block content.
 *
 * @package terralift-ui
 */

$pid      = get_the_ID();
$g        = static fn( string $key, string $default = '' ): string => trim( (string) get_field( $key, $pid ) ) ?: $default;
$eyebrow  = $g( 'hero_eyebrow', 'TerraLift Machinery' );
$hero_t   = get_the_title();
$hero_sub = $g( 'hero_intro' );
$cta_on   = get_field( 'hide_cta', $pid );
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#tl-main">Skip to content</a>
<?php block_template_part( 'header' ); ?>

<main id="tl-main" class="tl-fx">
	<section class="tl-fx-hero tl-fx-cat-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
				<h1 class="tl-fx-title"><?php echo esc_html( $hero_t ); ?></h1>
				<?php if ( $hero_sub ) : ?>
					<p class="tl-fx-lead"><?php echo esc_html( $hero_sub ); ?></p>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<?php if ( trim( (string) get_the_content() ) ) : ?>
		<section class="tl-fx-body">
			<div class="tl-fx-body-inner">
				<?php the_content(); ?>
			</div>
		</section>
	<?php endif; ?>

	<?php if ( ! $cta_on ) : ?>
		<section class="tl-fx-cta">
			<div class="tl-fx-cta-inner">
				<h2 class="tl-fx-cta-title">Questions about this?</h2>
				<p class="tl-fx-cta-sub">Our export desk answers within one business day — specs, pricing, lead times, compliance.</p>
				<a class="tl-fx-btn tl-fx-btn--dark" href="/terralift-contact/">Contact us</a>
			</div>
		</section>
	<?php endif; ?>
</main>

<?php
block_template_part( 'footer' );
wp_footer();
?>
</body>
</html>
