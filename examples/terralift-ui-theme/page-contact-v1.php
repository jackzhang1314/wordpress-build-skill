<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Template Name: Contact v1 (free HTML)
 * Description: Paired with acf/page-contact-v1.php. Forms go through Fluent Forms
 * shortcode when present; graceful CTA fallback otherwise.
 *
 * @package terralift-ui
 */

$pid          = get_the_ID();
$g            = static fn( string $key, string $default = '' ): string => trim( (string) get_field( $key, $pid ) ) ?: $default;
$hero_title   = $g( 'hero_title', 'Get a factory-direct quotation' );
$hero_intro   = $g( 'hero_intro', 'Tell us the model, quantity and destination port — our export desk replies within one business day.' );
$email        = $g( 'email', 'sales@example.com' );
$phone        = $g( 'phone', '+86 000 0000 0000' );
$whatsapp     = $g( 'whatsapp' );
$address      = $g( 'address', 'Demo Industrial Park, China' );
$hours        = $g( 'hours', 'Mon–Sat, 8:30–18:00 (GMT+8)' );
$form_title   = $g( 'form_title', 'Request a quote' );
$form_id      = (int) ( get_field( 'form_id', $pid ) ?: 1 );
$has_ff       = shortcode_exists( 'fluentform' );
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

<main id="tl-main" class="tl-fx tl-fx-contact">
	<section class="tl-fx-hero tl-fx-cat-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow">Contact export desk</p>
				<h1 class="tl-fx-title"><?php echo esc_html( $hero_title ); ?></h1>
				<p class="tl-fx-lead"><?php echo esc_html( $hero_intro ); ?></p>
			</div>
		</div>
	</section>

	<section class="tl-fx-contact-body">
		<div class="tl-fx-contact-grid">
			<div class="tl-fx-contact-channels">
				<h2 class="tl-fx-contact-heading">Direct channels</h2>
				<ul class="tl-fx-contact-list">
					<li><strong>Email</strong><a href="<?php echo esc_url( 'mailto:' . $email ); ?>"><?php echo esc_html( $email ); ?></a></li>
					<li><strong>Phone</strong><a href="<?php echo esc_url( 'tel:' . preg_replace( '/\s+/', '', $phone ) ); ?>"><?php echo esc_html( $phone ); ?></a></li>
					<?php if ( $whatsapp ) : ?>
						<?php $wa_digits = preg_replace( '/\D+/', '', $whatsapp ); ?>
						<li><strong>WhatsApp</strong><a href="<?php echo esc_url( 'https://wa.me/' . $wa_digits ); ?>"><?php echo esc_html( $whatsapp ); ?></a></li>
					<?php endif; ?>
					<li><strong>Address</strong><span><?php echo esc_html( $address ); ?></span></li>
					<li><strong>Hours</strong><span><?php echo esc_html( $hours ); ?></span></li>
				</ul>
			</div>

			<div class="tl-fx-contact-form-panel">
				<h2 class="tl-fx-contact-heading"><?php echo esc_html( $form_title ); ?></h2>
				<?php if ( $has_ff ) : ?>
					<div class="tl-fx-contact-form">
						<?php echo do_shortcode( '[fluentform id="' . absint( $form_id ) . '"]' ); ?>
					</div>
				<?php else : ?>
					<p class="tl-fx-contact-fallback-note">Our quotation form is being set up. Email us directly and we reply within one business day.</p>
					<a class="tl-fx-btn" href="mailto:<?php echo esc_attr( $email ); ?>?subject=Quotation%20request">Email the export desk</a>
				<?php endif; ?>
			</div>
		</div>
	</section>
</main>

<?php block_template_part( 'footer' ); ?>
<?php wp_footer(); ?>
</body>
</html>
