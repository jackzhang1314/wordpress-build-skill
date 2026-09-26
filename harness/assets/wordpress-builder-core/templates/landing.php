<?php
/**
 * Template Name: WordPress Builder Landing
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
$wbcBenefits = wordpress_builder_core_lines(wordpress_builder_core_field('wbc_benefits', get_the_ID()));
$wbcSpecifications = wordpress_builder_core_lines(wordpress_builder_core_field('wbc_specifications', get_the_ID()));
$wbcFaq = wordpress_builder_core_lines(wordpress_builder_core_field('wbc_faq', get_the_ID()));
$wbcSecondaryCtaLabel = wordpress_builder_core_field('wbc_secondary_cta_label', get_the_ID()) ?: $wbcCtaLabel;
$wbcSecondaryCtaUrl = wordpress_builder_core_field('wbc_secondary_cta_url', get_the_ID()) ?: $wbcCtaUrl;
$wbcFormShortcode = wordpress_builder_core_field('wbc_form_shortcode', get_the_ID());
$wbcFormValid = preg_match('/^\\[fluentform\\s+id=[\\\'"]?([0-9]+)[\\\'"]?\\]$/', $wbcFormShortcode, $wbcFormMatches) === 1;
?>
<main class="wordpress-builder-template wordpress-builder-landing">
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

            <?php if ($wbcBenefits): ?>
                <section class="wordpress-builder-template__section" aria-labelledby="wbc-benefits">
                    <h2 id="wbc-benefits" class="wordpress-builder-template__section-title">Buyer Benefits</h2>
                    <ul class="wordpress-builder-template__benefit-list">
                        <?php foreach ($wbcBenefits as $benefit): ?>
                            <?php
                            [$benefitTitle, $benefitDetail] = wordpress_builder_core_line_parts($benefit);
                            ?>
                            <li class="wordpress-builder-template__benefit">
                                <p class="wordpress-builder-template__benefit-title"><?php echo esc_html($benefitTitle); ?></p>
                                <?php if ($benefitDetail): ?>
                                    <p class="wordpress-builder-template__benefit-detail"><?php echo esc_html($benefitDetail); ?></p>
                                <?php endif; ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </section>
            <?php endif; ?>

            <?php if ($wbcSpecifications): ?>
                <section class="wordpress-builder-template__section" aria-labelledby="wbc-specifications">
                    <h2 id="wbc-specifications" class="wordpress-builder-template__section-title">Specifications</h2>
                    <div class="wordpress-builder-template__table-wrap">
                        <table class="wordpress-builder-template__table">
                            <caption class="screen-reader-text">Technical specifications</caption>
                            <tbody>
                                <?php foreach ($wbcSpecifications as $specification): ?>
                                    <?php [$label, $value] = wordpress_builder_core_line_parts($specification, '—'); ?>
                                    <tr>
                                        <th scope="row"><?php echo esc_html($label); ?></th>
                                        <td><?php echo esc_html($value); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </section>
            <?php endif; ?>

            <?php if ($wbcFaq): ?>
                <section class="wordpress-builder-template__section" aria-labelledby="wbc-faq">
                    <h2 id="wbc-faq" class="wordpress-builder-template__section-title">Questions and Answers</h2>
                    <div class="wordpress-builder-template__faq-list">
                        <?php foreach ($wbcFaq as $faq): ?>
                            <?php [$question, $answer] = wordpress_builder_core_line_parts($faq, 'Contact the team for details.'); ?>
                            <details class="wordpress-builder-template__faq">
                                <summary class="wordpress-builder-template__question"><?php echo esc_html($question); ?></summary>
                                <p class="wordpress-builder-template__answer"><?php echo esc_html($answer); ?></p>
                            </details>
                        <?php endforeach; ?>
                    </div>
                </section>
            <?php endif; ?>

            <?php if ($wbcFormValid): ?>
                <section id="rfq" class="wordpress-builder-template__form" aria-labelledby="wbc-rfq">
                    <h2 id="wbc-rfq" class="wordpress-builder-template__section-title">Send your enquiry</h2>
                    <p class="wordpress-builder-template__form-intro">Include the machine model, target specification, working condition, inspection requirement, destination port, and required delivery window.</p>
                    <?php echo do_shortcode('[fluentform id="' . (int) $wbcFormMatches[1] . '"]'); ?>
                </section>
            <?php endif; ?>

            <?php if ($wbcSecondaryCtaLabel && $wbcSecondaryCtaUrl): ?>
                <footer class="wordpress-builder-template__cta-band">
                    <h2 class="wordpress-builder-template__cta-heading"><?php echo esc_html($wbcSecondaryCtaLabel); ?></h2>
                    <p class="wordpress-builder-template__cta-copy">Send your requirements and receive a matched quotation.</p>
                    <p class="wordpress-builder-template__actions">
                        <a class="wordpress-builder-template__cta wordpress-builder-template__cta--secondary" href="<?php echo esc_url($wbcSecondaryCtaUrl); ?>">
                            <?php echo esc_html($wbcSecondaryCtaLabel); ?>
                        </a>
                    </p>
                </footer>
            <?php endif; ?>
        </article>
        <?php
    endwhile;
    ?>
</main>
<?php
get_footer();
