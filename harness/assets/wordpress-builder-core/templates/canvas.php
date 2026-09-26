<?php
/**
 * Template Name: WordPress Builder Canvas
 * Template Post Type: page, builder_project, builder_service
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

$wbcSubtitle = wordpress_builder_core_field('wbc_subtitle', get_the_ID());
$wbcSummary = wordpress_builder_core_field('wbc_summary', get_the_ID());
$wbcCtaLabel = wordpress_builder_core_field('wbc_cta_label', get_the_ID());
$wbcCtaUrl = wordpress_builder_core_field('wbc_cta_url', get_the_ID());
?>
<main class="wordpress-builder-template wordpress-builder-canvas">
    <?php
    while (have_posts()) :
        the_post();
        ?>
        <article <?php post_class('wordpress-builder-template__article'); ?>>
            <header class="wordpress-builder-template__hero">
                <?php if ($wbcSubtitle): ?>
                    <p class="wordpress-builder-template__subtitle"><?php echo esc_html($wbcSubtitle); ?></p>
                <?php endif; ?>
                <h1 class="wordpress-builder-template__title"><?php the_title(); ?></h1>
                <?php if ($wbcSummary): ?>
                    <div class="wordpress-builder-template__summary"><?php echo wp_kses_post($wbcSummary); ?></div>
                <?php endif; ?>
                <?php if ($wbcCtaLabel && $wbcCtaUrl): ?>
                    <p class="wordpress-builder-template__actions">
                        <a class="wordpress-builder-template__cta" href="<?php echo esc_url($wbcCtaUrl); ?>">
                            <?php echo esc_html($wbcCtaLabel); ?>
                        </a>
                    </p>
                <?php endif; ?>
            </header>
            <div class="wordpress-builder-template__content">
                <?php the_content(); ?>
            </div>
        </article>
        <?php
    endwhile;
    ?>
</main>
<?php
get_footer();
