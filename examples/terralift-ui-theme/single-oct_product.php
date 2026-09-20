<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Free-HTML product detail template (D mode).
 *
 * Data: ACF fields via tl_field(). Layout: free HTML/CSS using theme tokens.
 * Shell: full document skeleton with wp_head()/wp_footer() and block template
 * parts. get_header() does NOT resolve parts/*.html in block themes; calling it
 * falls back to wp-includes/theme-compat/header.php and breaks the design.
 *
 * @package terralift-ui
 */

?>
<?php ob_start(); ?>

<?php

while ( have_posts() ) :
	the_post();

	$f = static fn( string $key ): string => trim( (string) tl_field( $key ) );
	$model       = $f( 'oct_model' );
	$material    = $f( 'oct_material' );
	$moq         = $f( 'oct_moq' );
	$lead_time   = $f( 'oct_lead_time' );
	$weight      = $f( 'oct_spec_weight' );
	$engine      = $f( 'oct_spec_engine' );
	$dig_depth   = $f( 'oct_spec_dig_depth' );
	$width       = $f( 'oct_spec_width' );
	$gallery_img = $f( 'oct_gallery_image' );
	$gallery_alt = $f( 'oct_gallery_alt' ) ?: get_the_title();
	$cta_text    = $f( 'oct_cta_text' ) ?: 'Request a quote';
	$cta_url     = tl_enquiry_url( get_the_ID(), $f( 'oct_cta_url' ) );

	$specs = array_values(
		array_filter(
			array(
				array( 'Operating weight', $weight ),
				array( 'Engine / power', $engine ),
				array( 'Max digging depth', $dig_depth ),
				array( 'Transport width', $width ),
			),
			static fn( array $s ): bool => '' !== $s[1]
		)
	);

	$highlights = array_values(
		array_filter( array( $f( 'oct_highlight_1' ), $f( 'oct_highlight_2' ), $f( 'oct_highlight_3' ) ) )
	);
	?>

	<main id="tl-main" class="tl-fx">
        <p class="tl-demo-notice">Demonstration model. Images and specifications are illustrative; availability and certification are not represented.</p>
		<!-- Hero -->
		<section class="tl-fx-hero">
			<div class="tl-fx-hero-inner">
				<div class="tl-fx-hero-copy">
					<?php if ( $model ) : ?>
						<p class="tl-eyebrow tl-fx-eyebrow"><?php echo esc_html( $model ); ?></p>
					<?php endif; ?>
					<h1 class="tl-fx-title"><?php the_title(); ?></h1>
					<?php if ( $material ) : ?>
						<p class="tl-fx-lead"><?php echo esc_html( $material ); ?></p>
					<?php endif; ?>
					<?php if ( $moq || $lead_time ) : ?>
						<ul class="tl-fx-chips">
							<?php if ( $moq ) : ?>
								<li><strong>MOQ</strong><?php echo esc_html( $moq ); ?></li>
							<?php endif; ?>
							<?php if ( $lead_time ) : ?>
								<li><strong>Lead time</strong><?php echo esc_html( $lead_time ); ?></li>
							<?php endif; ?>
						</ul>
					<?php endif; ?>
					<div class="tl-fx-actions">
						<a class="tl-fx-btn" href="<?php echo esc_url( $cta_url ); ?>"><?php echo esc_html( $cta_text ); ?></a>
						<a class="tl-fx-btn tl-fx-btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'oct_product' ) ); ?>">View all machines</a>
					</div>
				</div>
				<figure class="tl-fx-hero-media">
					<?php if ( has_post_thumbnail() ) : ?>
						<?php the_post_thumbnail( 'large', array( 'class' => 'tl-fx-hero-img' ) ); ?>
					<?php endif; ?>
					<figcaption class="tl-fx-hero-badge">
						<span>Illustrative model</span>
						<span>Demo specifications</span>
					</figcaption>
				</figure>
			</div>
		</section>

		<!-- Spec band -->
		<?php if ( $specs ) : ?>
			<section class="tl-fx-specs">
				<div class="tl-fx-specs-inner">
					<?php foreach ( $specs as $spec ) : ?>
						<div class="tl-fx-spec">
							<p class="tl-fx-spec-label"><?php echo esc_html( $spec[0] ); ?></p>
							<p class="tl-fx-spec-value"><?php echo esc_html( $spec[1] ); ?></p>
						</div>
					<?php endforeach; ?>
				</div>
			</section>
		<?php endif; ?>

		<!-- Highlights -->
		<?php if ( $highlights ) : ?>
			<section class="tl-fx-highlights">
				<div class="tl-fx-highlights-inner">
					<?php foreach ( $highlights as $i => $text ) : ?>
						<article class="tl-fx-highlight">
							<p class="tl-fx-highlight-text"><?php echo esc_html( $text ); ?></p>
						</article>
					<?php endforeach; ?>
				</div>
			</section>
		<?php endif; ?>

		<!-- Gallery image -->
		<?php if ( $gallery_img ) : ?>
			<section class="tl-fx-gallery">
				<img src="<?php echo esc_url( $gallery_img ); ?>" alt="<?php echo esc_attr( $gallery_alt ); ?>" loading="lazy" />
			</section>
		<?php endif; ?>

		<!-- Long description -->
		<?php if ( trim( (string) get_the_content() ) ) : ?>
			<section class="tl-fx-body">
				<div class="tl-fx-body-inner">
					<?php the_content(); ?>
				</div>
			</section>
		<?php endif; ?>

		<!-- CTA -->
		<section class="tl-fx-cta">
			<div class="tl-fx-cta-inner">
				<h2 class="tl-fx-cta-title">Ready to source this machine?</h2>
				<p class="tl-fx-cta-sub">Include your target specifications, quantity and destination in your enquiry.</p>
				<a class="tl-fx-btn tl-fx-btn--dark" href="<?php echo esc_url( $cta_url ); ?>"><?php echo esc_html( $cta_text ); ?></a>
			</div>
		</section>
	</main>

<?php endwhile; ?>

<?php tl_render_document( (string) ob_get_clean() ); ?>
