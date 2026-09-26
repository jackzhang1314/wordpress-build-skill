<?php
/**
 * Template Name: WordPress Builder Canvas
 * Template Post Type: page, builder_project, builder_service
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="wordpress-builder-template wordpress-builder-canvas">
    <?php
    while (have_posts()) :
        the_post();
        ?>
        <article <?php post_class(); ?>>
            <header class="wordpress-builder-template__header">
                <?php if (function_exists('get_field') && get_field('wbc_subtitle')): ?>
                    <p class="wordpress-builder-template__subtitle"><?php echo esc_html(get_field('wbc_subtitle')); ?></p>
                <?php endif; ?>
                <h1 class="wordpress-builder-template__title"><?php the_title(); ?></h1>
                <?php if (function_exists('get_field') && get_field('wbc_summary')): ?>
                    <div class="wordpress-builder-template__summary"><?php echo wp_kses_post(get_field('wbc_summary')); ?></div>
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
