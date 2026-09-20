<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Free-HTML products archive (D mode).
 *
 * @package terralift-ui
 */

$categories = get_terms(
	array(
		'taxonomy'   => 'oct_product_category',
		'hide_empty' => true,
	)
);
$categories = is_array( $categories ) ? $categories : array();
?>
<?php ob_start(); ?>

<main id="tl-main" class="tl-fx tl-fx-cat">
	<section class="tl-fx-hero tl-fx-cat-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow">Equipment catalogue</p>
				<h1 class="tl-fx-title">Find the right machine for the job</h1>
				<p class="tl-fx-lead">Compact excavators, loaders and skid steers prepared for export — each listing carries a full specification sheet, FOB price basis and real lead time.</p>
				<p class="tl-fx-cat-count"><?php echo esc_html( sprintf( _n( '%d model in this category', '%d models in this category', (int) $GLOBALS['wp_query']->found_posts, 'terralift-ui' ), (int) $GLOBALS['wp_query']->found_posts ) ); ?></p>
			</div>
		</div>
	</section>

	<?php if ( $categories ) : ?>
		<nav class="tl-fx-cat-rail" aria-label="Product categories">
			<a class="tl-fx-cat-rail-link is-active" href="<?php echo esc_url( get_post_type_archive_link( 'oct_product' ) ); ?>">All machines</a>
			<?php foreach ( $categories as $cat ) : ?>
				<a class="tl-fx-cat-rail-link" href="<?php echo esc_url( tl_term_url( $cat ) ); ?>"><?php echo esc_html( $cat->name ); ?></a>
			<?php endforeach; ?>
		</nav>
	<?php endif; ?>

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
				<nav class="tl-fx-cat-pagination" aria-label="Catalogue pagination">
					<?php previous_posts_link( '← Newer' ); ?>
					<?php next_posts_link( 'Older →' ); ?>
				</nav>
			<?php endif; ?>
		<?php else : ?>
			<div class="tl-fx-cat-empty">
				<h2 class="tl-fx-cat-card-title">Catalogue is being prepared</h2>
				<p class="tl-fx-lead">New stock is being photographed and verified. Contact us for the current availability list.</p>
			</div>
		<?php endif; ?>
	</section>

	<section class="tl-fx-cta">
		<div class="tl-fx-cta-inner">
			<h2 class="tl-fx-cta-title">Need help choosing a model?</h2>
			<p class="tl-fx-cta-sub">Tell us your application and budget — our engineers recommend the right configuration, free of charge.</p>
			<a class="tl-fx-btn tl-fx-btn--dark" href="<?php echo esc_url( tl_page_url( 'terralift-contact' ) ); ?>">Talk to an engineer</a>
		</div>
	</section>
</main>

<?php tl_render_document( (string) ob_get_clean() ); ?>
