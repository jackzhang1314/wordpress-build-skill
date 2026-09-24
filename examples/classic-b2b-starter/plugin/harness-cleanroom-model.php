<?php
/**
 * Plugin Name: harness-cleanroom Content Model
 * Description: Full B2B information architecture: products, industries, guides and RFQ capture.
 * Version: 2.0.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields
 */
namespace Cleanroom\Model;

defined('ABSPATH') || exit;

function register_model(): void {
    register_post_type('cleanroom_product', [
        'labels' => ['name' => __('Products', 'harness-cleanroom'), 'singular_name' => __('Product', 'harness-cleanroom')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'products',
        'rewrite' => ['slug' => 'products'], 'menu_icon' => 'dashicons-lightbulb',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);

    register_taxonomy('product_collection', ['cleanroom_product'], [
        'labels' => ['name' => __('Product Categories', 'harness-cleanroom'), 'singular_name' => __('Product Category', 'harness-cleanroom')],
        'public' => true, 'hierarchical' => true, 'show_in_rest' => true,
        'show_admin_column' => true, 'rewrite' => ['slug' => 'product-category'],
    ]);

    register_post_type('cleanroom_industry', [
        'labels' => ['name' => __('Industry Solutions', 'harness-cleanroom'), 'singular_name' => __('Industry Solution', 'harness-cleanroom')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'industries',
        'rewrite' => ['slug' => 'industries'], 'menu_icon' => 'dashicons-building',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);

    register_post_type('cleanroom_guide', [
        'labels' => ['name' => __('Knowledge Guides', 'harness-cleanroom'), 'singular_name' => __('Knowledge Guide', 'harness-cleanroom')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'guides',
        'rewrite' => ['slug' => 'guides'], 'menu_icon' => 'dashicons-book',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);


}
add_action('init', __NAMESPACE__ . '\\register_model');

register_activation_hook(__FILE__, static function (): void { register_model(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, static function (): void {
    foreach (['cleanroom_product', 'cleanroom_industry', 'cleanroom_guide'] as $type) unregister_post_type($type);
    unregister_taxonomy('product_collection');
    flush_rewrite_rules();
});

add_action('init', static function (): void {
    // RFQ form embed. Maps the stable placeholder shortcode to the Fluent Form
    // instance so editors never need to know internal form IDs.
    add_shortcode('cleanroom_rfq_form', static function (array $atts = []): string {
        $atts = shortcode_atts(['id' => '3'], $atts, 'cleanroom_rfq_form');
        $form_id = (string) $atts['id'];
        if (!shortcode_exists('fluentform')) {
            return '<p>' . esc_html__('Install Fluent Forms to enable the quotation form.', 'harness-cleanroom') . '</p>';
        }
        return do_shortcode('[fluentform id="' . esc_attr($form_id) . '"]');
    });
});

add_action('acf/init', static function (): void {
    if (!function_exists('acf_add_local_field_group')) return;

    acf_add_local_field_group([
        'key' => 'group_cleanroom_product', 'title' => 'Product specifications', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_nova_wattage', 'name' => 'wattage', 'label' => 'Wattage range', 'type' => 'text'],
            ['key' => 'field_nova_efficacy', 'name' => 'efficacy', 'label' => 'Luminous efficacy', 'type' => 'text'],
            ['key' => 'field_nova_ip', 'name' => 'ip_rating', 'label' => 'IP rating', 'type' => 'text'],
            ['key' => 'field_nova_warranty', 'name' => 'warranty', 'label' => 'Warranty', 'type' => 'text'],
            ['key' => 'field_nova_spec_table', 'name' => 'spec_table', 'label' => 'Specification table', 'type' => 'textarea',
             'rows' => 8, 'instructions' => 'One row per line as: Label | Value'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'cleanroom_product']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_cleanroom_industry', 'title' => 'Industry details', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_nova_industry_challenge', 'name' => 'challenge', 'label' => 'Lighting challenge', 'type' => 'textarea'],
            ['key' => 'field_nova_industry_outcome', 'name' => 'outcome', 'label' => 'Project outcome', 'type' => 'textarea'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'cleanroom_industry']]],
    ]);

    // Rich category content (free ACF term meta; textarea line formats — no repeaters).
    acf_add_local_field_group([
        'key' => 'group_collection_content', 'title' => 'Category content', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_tc_intro', 'name' => 'category_intro', 'label' => 'Intro paragraph', 'type' => 'textarea', 'rows' => 4,
             'instructions' => 'Shown under the category description on the category page. Leave empty to use the built-in default.'],
            ['key' => 'field_tc_features', 'name' => 'category_features', 'label' => 'Category highlights', 'type' => 'textarea', 'rows' => 8,
             'instructions' => 'One per line: Feature | Short description. Empty lines are ignored.'],
            ['key' => 'field_tc_applications', 'name' => 'category_applications', 'label' => 'Typical applications', 'type' => 'textarea', 'rows' => 6,
             'instructions' => 'One per line. Leave empty to use the built-in default.'],
            ['key' => 'field_tc_faq', 'name' => 'category_faq', 'label' => 'Category FAQ', 'type' => 'textarea', 'rows' => 8,
             'instructions' => 'One per line: Question | Answer. Leave empty to use the built-in default.'],
        ],
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'product_collection']]],
    ]);

    // Product page selling points.
    acf_add_local_field_group([
        'key' => 'group_product_highlights', 'title' => 'Product highlights', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_p_highlights', 'name' => 'product_highlights', 'label' => 'Key selling points', 'type' => 'textarea', 'rows' => 6,
             'instructions' => 'One per line. Rendered as a checklist next to the specifications. Leave empty to hide.'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'cleanroom_product']]],
    ]);

    // Site-wide factory profile (editable under one options screen).
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page([
            'page_title' => 'Factory profile', 'menu_title' => 'Factory profile', 'menu_slug' => 'factory-profile',
            'capability' => 'edit_pages', 'icon_url' => 'dashicons-building', 'position' => 21, 'show_in_rest' => true,
        ]);
    }
    acf_add_local_field_group([
        'key' => 'group_factory_profile', 'title' => 'Factory profile', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_f_intro', 'name' => 'factory_intro', 'label' => 'Factory introduction', 'type' => 'textarea', 'rows' => 4,
             'instructions' => 'Shown on the home and about pages. Leave empty to use the built-in default.'],
            ['key' => 'field_f_stats', 'name' => 'factory_stats', 'label' => 'Factory facts', 'type' => 'textarea', 'rows' => 6,
             'instructions' => 'One per line: Value | Label. Leave empty to use the built-in default.'],
            ['key' => 'field_f_caps', 'name' => 'factory_capabilities', 'label' => 'Capabilities', 'type' => 'textarea', 'rows' => 8,
             'instructions' => 'One per line: Title | Description. Leave empty to use the built-in default.'],
        ],
        'location' => [[['param' => 'options_page', 'operator' => '==', 'value' => 'factory-profile']]],
    ]);
});
