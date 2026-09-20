<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Template Name: Cases v1 (free HTML)
 * Description: Case studies landing page with live oct_case query. Paired with
 * no page-level fields yet — hero copy falls back to sensible defaults.
 *
 * @package terralift-ui
 */

$pid       = get_the_ID();
$g         = static fn( string $key, string $default = '' ): string => trim( (string) tl_field( $key, $pid ) ) ?: $default;
$eyebrow   = $g( 'hero_eyebrow', 'Application cases' );
$hero_t    = $g( 'hero_title', 'Proven in the field' );
$hero_sub  = $g( 'hero_intro', 'How TerraLift machines perform on real job sites — construction, agriculture and municipal work.' );

$paged = max( 1, (int) get_query_var( 'paged' ) );
$cases = new WP_Query(
	array(
		'post_type'      => 'oct_case',
		'posts_per_page' => 9,
		'paged'          => $paged,
	)
);
?>
<?php ob_start(); ?>

<main id="tl-main" class="tl-fx tl-fx-cat">
	<section class="tl-fx-hero tl-fx-cat-hero">
		<div class="tl-fx-hero-inner">
			<div class="tl-fx-hero-copy">
				<p class="tl-eyebrow tl-fx-eyebrow"><?php echo esc_html( $eyebrow ); ?></p>
				<h1 class="tl-fx-title"><?php echo esc_html( $hero_t ); ?></h1>
				<p class="tl-fx-lead"><?php echo esc_html( $hero_sub ); ?></p>
				<p class="tl-fx-cat-count"><?php echo esc_html( sprintf( _n( '%d published case', '%d published cases', (int) $cases->found_posts, 'terralift-ui' ), (int) $cases->found_posts ) ); ?></p>
			</div>
		</div>
	</section>

	<section class="tl-fx-cat-grid-wrap">
		<?php if ( $cases->have_posts() ) : ?>
			<div class="tl-fx-cat-grid">
				<?php
				while ( $cases->have_posts() ) :
					$cases->the_post();
					$industry = trim( (string) tl_field( 'oct_industry' ) );
					?>
					<a class="tl-fx-cat-card" href="<?php the_permalink(); ?>">
						<figure class="tl-fx-cat-card-media">
							<?php if ( has_post_thumbnail() ) : ?>
								<?php the_post_thumbnail( 'medium_large', array( 'class' => 'tl-fx-cat-card-img', 'loading' => 'lazy', 'decoding' => 'async' ) ); ?>
							<?php else : ?>
								<div class="tl-fx-media-placeholder">Photo coming soon</div>
							<?php endif; ?>
							<?php if ( $industry ) : ?>
								<span class="tl-fx-cat-card-badge"><?php echo esc_html( $industry ); ?></span>
							<?php endif; ?>
						</figure>
						<div class="tl-fx-cat-card-body">
							<h2 class="tl-fx-cat-card-title"><?php the_title(); ?></h2>
							<p class="tl-fx-cat-card-excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 18 ) ); ?></p>
							<span class="tl-fx-cat-card-link">Read the case →</span>
						</div>
					</a>
					<?php
				endwhile;
				wp_reset_postdata();
				?>
			</div>
			<?php
			$case_links = paginate_links(
				array(
					'total'     => (int) $cases->max_num_pages,
					'current'   => $paged,
					'prev_text' => '← Newer',
					'next_text' => 'Older →',
					'type'      => 'plain',
				)
			);
			if ( $case_links && (int) $cases->max_num_pages > 1 ) :
				?>
				<nav class="tl-fx-cat-pagination" aria-label="Cases pagination">
					<?php echo wp_kses_post( $case_links ); ?>
				</nav>
			<?php endif; ?>
		<?php else : ?>
			<div class="tl-fx-cat-empty">
				<h2 class="tl-fx-cat-card-title">Cases are being written</h2>
				<p class="tl-fx-lead">Application profiles are being documented with customer permission. Ask us for references in your market.</p>
			</div>
		<?php endif; ?>
	</section>

	<section class="tl-fx-cta">
		<div class="tl-fx-cta-inner">
			<h2 class="tl-fx-cta-title">Your application could be next</h2>
			<p class="tl-fx-cta-sub">Send the job site conditions — we recommend machine, attachments and transport plan in one reply.</p>
			<a class="tl-fx-btn tl-fx-btn--dark" href="<?php echo esc_url( tl_page_url( 'terralift-contact' ) ); ?>">Request a quote</a>
		</div>
	</section>
</main>

<?php tl_render_document( (string) ob_get_clean() ); ?>
