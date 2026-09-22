<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Free-HTML product category archive template (D mode).
 *
 * @package terralift-ui
 */

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

<?php

$term        = get_queried_object();
$term_name   = $term instanceof WP_Term ? $term->name : '';
$term_desc   = $term instanceof WP_Term ? term_description( $term ) : '';
$term_count  = $term instanceof WP_Term ? (int) $term->count : 0;

// Sibling categories for a sub-nav rail.
$siblings    = $term instanceof WP_Term ? get_terms(
	array(
		'taxonomy'   => 'oct_product_category',
		'hide_empty' => true,
	)
) : array();
$siblings    = is_array( $siblings ) ? $siblings : array();
?>

<main id="tl-main" class="tl-fx tl-fx-cat">
	<!-- Category hero -->
	<section class="tl-fx-hero tl-fx-cat-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow">Product category</p>
				<h1 class="tl-fx-title"><?php echo esc_html( $term_name ); ?></h1>
				<?php if ( $term_desc ) : ?>
					<p class="tl-fx-lead"><?php echo esc_html( wp_strip_all_tags( $term_desc ) ); ?></p>
				<?php else : ?>
					<p class="tl-fx-lead">Browse verified export machines in this category, complete with specification sheets and factory-direct lead times.</p>
				<?php endif; ?>
				<p class="tl-fx-cat-count"><?php echo esc_html( sprintf( _n( '%d machine in stock', '%d machines in stock', $term_count, 'terralift-ui' ), $term_count ) ); ?></p>
			</div>
		</div>
	</section>

	<!-- Category rail -->
	<?php if ( $siblings ) : ?>
		<nav class="tl-fx-cat-rail" aria-label="Product categories">
			<?php foreach ( $siblings as $sib ) : ?>
				<a
					class="tl-fx-cat-rail-link<?php echo $sib->term_id === ( $term->term_id ?? 0 ) ? ' is-active' : ''; ?>"
					href="<?php echo esc_url( (string) get_term_link( $sib ) ); ?>"
					<?php echo $sib->term_id === ( $term->term_id ?? 0 ) ? 'aria-current="page"' : ''; ?>
				><?php echo esc_html( $sib->name ); ?></a>
			<?php endforeach; ?>
		</nav>
	<?php endif; ?>

	<!-- Product grid -->
	<section class="tl-fx-cat-grid-wrap">
		<?php if ( have_posts() ) : ?>
			<div class="tl-fx-cat-grid">
				<?php
				while ( have_posts() ) :
					the_post();
					$model = trim( (string) tl_field( 'oct_model' ) );
					?>
					<a class="tl-fx-cat-card" href="<?php the_permalink(); ?>">
						<figure class="tl-fx-cat-card-media">
							<?php if ( has_post_thumbnail() ) : ?>
								<?php the_post_thumbnail( 'medium_large', array( 'class' => 'tl-fx-cat-card-img', 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
							<?php else : ?>
								<div class="tl-fx-media-placeholder">Photo coming soon</div>
							<?php endif; ?>
							<?php if ( $model ) : ?>
								<span class="tl-fx-cat-card-badge"><?php echo esc_html( $model ); ?></span>
							<?php endif; ?>
						</figure>
						<div class="tl-fx-cat-card-body">
							<h2 class="tl-fx-cat-card-title"><?php the_title(); ?></h2>
							<p class="tl-fx-cat-card-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
							<span class="tl-fx-cat-card-link">View specs →</span>
						</div>
					</a>
					<?php
				endwhile;
				?>
			</div>

			<?php if ( get_next_posts_link() || get_previous_posts_link() ) : ?>
				<nav class="tl-fx-cat-pagination" aria-label="Category pagination">
					<?php previous_posts_link( '← Newer' ); ?>
					<?php next_posts_link( 'Older →' ); ?>
				</nav>
			<?php endif; ?>
		<?php else : ?>
			<div class="tl-fx-cat-empty">
				<h2 class="tl-fx-cat-card-title">Products are being loaded</h2>
				<p class="tl-fx-lead">New stock for this category is being photographed and verified. Contact us for the current availability list.</p>
			</div>
		<?php endif; ?>
	</section>

	<!-- CTA -->
	<section class="tl-fx-cta">
		<div class="tl-fx-cta-inner">
			<h2 class="tl-fx-cta-title">Not sure which model fits your job site?</h2>
			<p class="tl-fx-cta-sub">Tell us your application and budget — our engineers recommend the right configuration, free of charge.</p>
			<a class="tl-fx-btn tl-fx-btn--dark" href="/contact/">Talk to an engineer</a>
		</div>
	</section>
</main>

<?php
block_template_part( 'footer' );
wp_footer();
?>
</body>
</html>
