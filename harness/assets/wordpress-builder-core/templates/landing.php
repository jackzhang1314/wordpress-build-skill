<?php
/**
 * Template Name: WordPress Builder Landing
 * Template Post Type: page, builder_project, builder_service
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="wordpress-builder-template wordpress-builder-landing">
    <?php
    while (have_posts()) :
        the_post();
        $subtitle = function_exists('get_field') ? get_field('wbc_subtitle') : '';
        $summary = function_exists('get_field') ? get_field('wbc_summary') : '';
        $ctaLabel = function_exists('get_field') ? get_field('wbc_cta_label') : '';
        $ctaUrl = function_exists('get_field') ? get_field('wbc_cta_url') : '';
        ?>
        <article <?php post_class(); ?>>
            <header class="wordpress-builder-template__hero">
                <?php if ($subtitle): ?>
                    <p class="wordpress-builder-template__subtitle"><?php echo esc_html($subtitle); ?></p>
                <?php endif; ?>
                <h1 class="wordpress-builder-template__title"><?php the_title(); ?></h1>
                <?php if ($summary): ?>
                    <div class="wordpress-builder-template__summary"><?php echo wp_kses_post($summary); ?></div>
                <?php endif; ?>
                <?php if ($ctaLabel && $ctaUrl): ?>
                    <p class="wordpress-builder-template__actions">
                        <a class="wordpress-builder-template__cta" href="<?php echo esc_url($ctaUrl); ?>"><?php echo esc_html($ctaLabel); ?></a>
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
