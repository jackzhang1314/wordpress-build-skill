<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Template Name: Home v1 (free HTML)
 * Description: Paired with acf/page-home-v1.php. Category showcase, featured
 * machines and case teasers are queried live; hero and stats come from ACF.
 *
 * @package terralift-ui
 */

$pid        = get_the_ID();
$g          = static fn( string $key, string $default = '' ): string => trim( (string) get_field( $key, $pid ) ) ?: $default;
$eyebrow    = $g( 'hero_eyebrow', 'Compact machinery · factory direct export' );
$hero_title = $g( 'hero_title', get_bloginfo( 'name' ) );
$hero_intro = $g( 'hero_intro', 'Mini excavators, loaders and skid steers built for distributors and rental fleets — verified spec sheets, stable lead times, export-grade packaging.' );
$hero_img_raw = tl_field( 'hero_image', $pid, '', false ); // raw attachment ID
$hero_alt     = $hero_img_raw ? (string) get_post_meta( (int) $hero_img_raw, '_wp_attachment_image_alt', true ) : '';
$hero_img     = $hero_img_raw ? (string) wp_get_attachment_image_url( (int) $hero_img_raw, 'large' ) : '';
$cta_text   = $g( 'cta_text', 'Browse the catalogue' );
$cta_url    = $g( 'cta_url', '/products/' );

$stats = array(
	array( $g( 'stat_1_value' ), $g( 'stat_1_label', 'machines shipped' ) ),
	array( $g( 'stat_2_value' ), $g( 'stat_2_label', 'export markets' ) ),
	array( $g( 'stat_3_value' ), $g( 'stat_3_label', 'avg. lead time' ) ),
	array( $g( 'stat_4_value' ), $g( 'stat_4_label', 'warranty' ) ),
);
$stats = array_filter( $stats, static fn( array $s ): bool => '' !== $s[0] );

$categories = get_terms(
	array(
		'taxonomy'   => 'oct_product_category',
		'hide_empty' => true,
	)
);
$categories = is_array( $categories ) ? $categories : array();

// One grouped query for category representative products (avoids N+1).
$cat_products = array();
$cat_ids      = wp_list_pluck( $categories, 'term_id' );
if ( $cat_ids ) {
	$cat_product_posts = get_posts(
		array(
			'post_type'      => 'oct_product',
			'posts_per_page' => 100,
			'orderby'        => 'date',
			'order'          => 'ASC',
			'no_found_rows'  => true,
			'tax_query'      => array(
				array(
					'taxonomy' => 'oct_product_category',
					'field'    => 'term_id',
					'terms'    => $cat_ids,
				),
			),
		)
	);
	foreach ( $cat_product_posts as $product ) {
		$product_terms = get_the_terms( $product, 'oct_product_category' );
		if ( ! is_array( $product_terms ) ) {
			continue;
		}
		foreach ( $product_terms as $product_term ) {
			$cat_products[ $product_term->term_id ] ??= $product;
		}
	}
}

$featured = new WP_Query(
	array(
		'post_type'      => 'oct_product',
		'posts_per_page' => 3,
		'orderby'        => 'date',
		'order'          => 'ASC',
		'no_found_rows'  => true,
	)
);

$cases = new WP_Query(
	array(
		'post_type'      => 'oct_case',
		'posts_per_page' => 2,
		'no_found_rows'  => true,
	)
);
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

<main id="tl-main" class="tl-fx tl-fx-home">
	<!-- Hero -->
	<section class="tl-fx-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
				<h1 class="tl-fx-title"><?php echo esc_html( $hero_title ); ?></h1>
				<p class="tl-fx-lead"><?php echo esc_html( $hero_intro ); ?></p>
				<div class="tl-fx-actions">
					<a class="tl-fx-btn" href="<?php echo esc_url( $cta_url ); ?>"><?php echo esc_html( $cta_text ); ?></a>
					<a class="tl-fx-btn tl-fx-btn--ghost" href="/terralift-contact/">Talk to an engineer</a>
				</div>
			</div>
			<figure class="tl-fx-hero-media">
				<?php if ( $hero_img ) : ?>
					<img class="tl-fx-hero-img" src="<?php echo esc_url( $hero_img ); ?>" alt="<?php echo esc_attr( $hero_alt ?: $hero_title ); ?>" />
				<?php elseif ( has_post_thumbnail( $pid ) ) : ?>
					<?php echo get_the_post_thumbnail( $pid, 'large', array( 'class' => 'tl-fx-hero-img' ) ); ?>
				<?php endif; ?>
				<figcaption class="tl-fx-hero-badge">
					<span>CE · EPA</span>
					<span>Factory direct</span>
				</figcaption>
			</figure>
		</div>
		<?php if ( $stats ) : ?>
			<div class="tl-fx-home-stats">
				<?php foreach ( $stats as [ $value, $label ] ) : ?>
					<div class="tl-fx-home-stat">
						<p class="tl-fx-home-stat-value"><?php echo esc_html( $value ); ?></p>
						<p class="tl-fx-home-stat-label"><?php echo esc_html( $label ); ?></p>
					</div>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</section>

	<!-- Category showcase -->
	<?php if ( $categories ) : ?>
		<section class="tl-fx-home-section">
			<div class="tl-fx-home-section-head">
				<p class="tl-eyebrow tl-fx-eyebrow">Catalogue</p>
				<h2 class="tl-fx-home-heading">Shop by machine class</h2>
			</div>
			<div class="tl-fx-cat-grid tl-fx-home-cats">
				<?php foreach ( $categories as $cat ) : ?>
					<?php $cat_post = $cat_products[ $cat->term_id ] ?? null; ?>
					<a class="tl-fx-cat-card" href="<?php echo esc_url( (string) get_term_link( $cat ) ); ?>">
						<figure class="tl-fx-cat-card-media">
							<?php if ( $cat_post && has_post_thumbnail( $cat_post ) ) : ?>
								<?php echo get_the_post_thumbnail( $cat_post, 'medium_large', array( 'class' => 'tl-fx-cat-card-img', 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
							<?php else : ?>
								<div class="tl-fx-media-placeholder">Photo coming soon</div>
							<?php endif; ?>
							<span class="tl-fx-cat-card-badge"><?php echo esc_html( sprintf( _n( '%d model', '%d models', (int) $cat->count, 'terralift-ui' ), (int) $cat->count ) ); ?></span>
						</figure>
						<div class="tl-fx-cat-card-body">
							<h3 class="tl-fx-cat-card-title"><?php echo esc_html( $cat->name ); ?></h3>
							<p class="tl-fx-cat-card-excerpt"><?php echo esc_html( wp_trim_words( wp_strip_all_tags( term_description( $cat ) ) ?: 'Verified export machines with full specification sheets.', 14 ) ); ?></p>
							<span class="tl-fx-cat-card-link">Browse category →</span>
						</div>
					</a>
				<?php endforeach; ?>
			</div>
		</section>
	<?php endif; ?>

	<!-- Featured machines -->
	<?php if ( $featured->have_posts() ) : ?>
		<section class="tl-fx-home-section tl-fx-home-section--alt">
			<div class="tl-fx-home-section-head">
				<p class="tl-eyebrow tl-fx-eyebrow">In stock</p>
				<h2 class="tl-fx-home-heading">Ready to ship</h2>
			</div>
			<div class="tl-fx-cat-grid">
				<?php
				while ( $featured->have_posts() ) :
					$featured->the_post();
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
							<h3 class="tl-fx-cat-card-title"><?php the_title(); ?></h3>
							<p class="tl-fx-cat-card-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 16 ) ); ?></p>
							<span class="tl-fx-cat-card-link">View specs →</span>
						</div>
					</a>
					<?php
				endwhile;
				wp_reset_postdata();
				?>
			</div>
			<div class="tl-fx-home-more">
				<a class="tl-fx-btn tl-fx-btn--dark" href="/products/">View all machines</a>
			</div>
		</section>
	<?php endif; ?>

	<!-- Case teasers -->
	<?php if ( $cases->have_posts() ) : ?>
		<section class="tl-fx-home-section">
			<div class="tl-fx-home-section-head">
				<p class="tl-eyebrow tl-fx-eyebrow">Applications</p>
				<h2 class="tl-fx-home-heading">Proven in the field</h2>
			</div>
			<div class="tl-fx-home-cases">
				<?php
				while ( $cases->have_posts() ) :
					$cases->the_post();
					$industry = trim( (string) get_field( 'oct_industry' ) );
					?>
					<a class="tl-fx-home-case" href="<?php the_permalink(); ?>">
						<figure class="tl-fx-home-case-media">
							<?php if ( has_post_thumbnail() ) : ?>
								<?php the_post_thumbnail( 'medium_large', array( 'class' => 'tl-fx-home-case-img', 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
							<?php endif; ?>
						</figure>
						<div class="tl-fx-home-case-body">
							<?php if ( $industry ) : ?>
								<p class="tl-fx-home-case-industry"><?php echo esc_html( $industry ); ?></p>
							<?php endif; ?>
							<h3 class="tl-fx-cat-card-title"><?php the_title(); ?></h3>
							<span class="tl-fx-cat-card-link">Read the case →</span>
						</div>
					</a>
					<?php
				endwhile;
				wp_reset_postdata();
				?>
			</div>
		</section>
	<?php endif; ?>

	<!-- CTA -->
	<section class="tl-fx-cta">
		<div class="tl-fx-cta-inner">
			<h2 class="tl-fx-cta-title">Get your quotation this week</h2>
			<p class="tl-fx-cta-sub">Send target specs and destination port — configuration advice, FOB pricing and lead time in one reply.</p>
			<a class="tl-fx-btn tl-fx-btn--dark" href="/terralift-contact/">Request a quote</a>
		</div>
	</section>
</main>

<?php block_template_part( 'footer' ); ?>
<?php wp_footer(); ?>
</body>
</html>
