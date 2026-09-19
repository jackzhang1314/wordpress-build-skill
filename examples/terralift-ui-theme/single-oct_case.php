<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Free-HTML case study detail template (D mode).
 *
 * @package terralift-ui
 */

while ( have_posts() ) :
	the_post();

	$f         = static fn( string $key ): string => trim( (string) get_field( $key ) );
	$industry  = $f( 'oct_industry' );
	$outcome   = $f( 'oct_outcome' );
	$cta_text  = 'Request a similar setup';
	$cta_url   = tl_page_url( 'terralift-contact' );
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
	<section class="tl-fx-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow"><?php echo esc_html( $industry ?: 'Application case' ); ?></p>
				<h1 class="tl-fx-title"><?php the_title(); ?></h1>
				<?php if ( $outcome ) : ?>
					<p class="tl-fx-lead"><?php echo esc_html( $outcome ); ?></p>
				<?php endif; ?>
				<div class="tl-fx-actions">
					<a class="tl-fx-btn" href="<?php echo esc_url( $cta_url ); ?>"><?php echo esc_html( $cta_text ); ?></a>
					<a class="tl-fx-btn tl-fx-btn--ghost" href="/terralift-case-studies/">All cases</a>
				</div>
			</div>
			<figure class="tl-fx-hero-media">
				<?php if ( has_post_thumbnail() ) : ?>
					<?php the_post_thumbnail( 'large', array( 'class' => 'tl-fx-hero-img' ) ); ?>
				<?php endif; ?>
				<figcaption class="tl-fx-hero-badge">
					<span>Field verified</span>
					<span><?php echo esc_html( get_the_date() ); ?></span>
				</figcaption>
			</figure>
		</div>
	</section>

	<?php if ( trim( (string) get_the_content() ) ) : ?>
		<section class="tl-fx-body">
			<div class="tl-fx-body-inner">
				<?php the_content(); ?>
			</div>
		</section>
	<?php endif; ?>

	<section class="tl-fx-cta">
		<div class="tl-fx-cta-inner">
			<h2 class="tl-fx-cta-title">Planning a similar project?</h2>
			<p class="tl-fx-cta-sub">We size the machine, attachments and transport plan for your job site — free configuration advice.</p>
			<a class="tl-fx-btn tl-fx-btn--dark" href="<?php echo esc_url( $cta_url ); ?>">Talk to an engineer</a>
		</div>
	</section>
</main>

<?php endwhile; ?>

<?php
block_template_part( 'footer' );
wp_footer();
?>
</body>
</html>
