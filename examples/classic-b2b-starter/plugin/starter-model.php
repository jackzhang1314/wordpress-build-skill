<?php
/**
 * Plugin Name: b2b-starter Content Model
 * Description: Full B2B information architecture: products, industries, guides and RFQ capture.
 * Version: 2.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields
 */
namespace Starter\Model;

defined('ABSPATH') || exit;

function register_model(): void {
    register_post_type('starter_product', [
        'labels' => ['name' => __('Products', 'b2b-starter'), 'singular_name' => __('Product', 'b2b-starter')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'products',
        'rewrite' => ['slug' => 'products'], 'menu_icon' => 'dashicons-lightbulb',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);

    register_taxonomy('product_collection', ['starter_product'], [
        'labels' => ['name' => __('Product Categories', 'b2b-starter'), 'singular_name' => __('Product Category', 'b2b-starter')],
        'public' => true, 'hierarchical' => true, 'show_in_rest' => true,
        'show_admin_column' => true, 'rewrite' => ['slug' => 'product-category'],
    ]);

    register_post_type('starter_industry', [
        'labels' => ['name' => __('Industry Solutions', 'b2b-starter'), 'singular_name' => __('Industry Solution', 'b2b-starter')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'industries',
        'rewrite' => ['slug' => 'industries'], 'menu_icon' => 'dashicons-building',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);

    register_post_type('starter_guide', [
        'labels' => ['name' => __('Knowledge Guides', 'b2b-starter'), 'singular_name' => __('Knowledge Guide', 'b2b-starter')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'guides',
        'rewrite' => ['slug' => 'guides'], 'menu_icon' => 'dashicons-book',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);


}
add_action('init', __NAMESPACE__ . '\\register_model');

register_activation_hook(__FILE__, static function (): void { register_model(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, static function (): void {
    foreach (['starter_product', 'starter_industry', 'starter_guide'] as $type) unregister_post_type($type);
    unregister_taxonomy('product_collection');
    flush_rewrite_rules();
});

/** Create the sample RFQ form once when Fluent Forms is available. */
function ensure_rfq_form(): int {
    global $wpdb;
    $forms_table = $wpdb->prefix . 'fluentform_forms';
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $forms_table)) !== $forms_table) {
        return 0;
    }

    $form_id = (int) get_option('starter_rfq_form_id');
    if ($form_id && (int) $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$forms_table} WHERE ID = %d", $form_id))) {
        return $form_id;
    }

    // Recover safely if the option was removed but the form still exists.
    $form_id = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$forms_table} WHERE title = %s AND status = 'published' ORDER BY ID LIMIT 1",
        'Request for quotation'
    ));
    if ($form_id) {
        update_option('starter_rfq_form_id', $form_id);
        return $form_id;
    }

    $field = static function (string $element, string $name, string $label, bool $required = false, string $type = 'text'): array {
        return [
            'element' => $element,
            'attributes' => ['name' => $name, 'type' => $type, 'class' => '', 'placeholder' => ''],
            'settings' => [
                'label' => $label,
                'admin_field_label' => $label,
                'validation_rules' => $required ? ['required' => ['value' => true, 'message' => 'This field is required.']] : [],
                'conditional_logic' => [],
            ],
            'editor_options' => ['title' => $label, 'icon_class' => 'ff-edit-text'],
        ];
    };
    $fields = [
        $field('input_name', 'name', 'Name', true, 'name'),
        $field('input_email', 'email', 'Work email', true, 'email'),
        $field('input_text', 'company', 'Company'),
        $field('input_text', 'country', 'Country / region'),
        $field('input_text', 'product', 'Product or project type'),
        $field('textarea', 'requirements', 'Requirements', true, 'textarea'),
        [
            'element' => 'input_checkbox',
            'attributes' => ['name' => 'consent', 'type' => 'checkbox', 'value' => ['Default' => []]],
            'settings' => [
                'label' => 'I agree to be contacted about this enquiry',
                'choices' => [['label' => 'Yes', 'value' => 'yes']],
                'validation_rules' => ['required' => ['value' => true, 'message' => 'Required.']],
            ],
        ],
    ];

    $inserted = $wpdb->insert($forms_table, [
        'title' => 'Request for quotation',
        'status' => 'published',
        'form_fields' => wp_json_encode($fields),
        'appearance_settings' => wp_json_encode(['css' => '']),
        'has_payment' => 0,
        'type' => 'form',
        'conditions' => wp_json_encode([]),
        'created_by' => get_current_user_id() ?: 1,
    ]);
    if (!$inserted) {
        return 0;
    }

    $form_id = (int) $wpdb->insert_id;
    $wpdb->insert($wpdb->prefix . 'fluentform_form_meta', [
        'form_id' => $form_id,
        'meta_key' => 'notifications',
        'value' => wp_json_encode([[
            'name' => 'Admin notification',
            'sendTo' => ['type' => 'email', 'email' => get_option('admin_email')],
            'subject' => 'New quotation request — {inputs.name}',
            'body' => '<p>{all_data}</p>',
            'isEnabled' => true,
        ]]),
    ]);
    update_option('starter_rfq_form_id', $form_id);
    return $form_id;
}

add_action('init', static function (): void {
    // RFQ form embed. Maps the stable placeholder shortcode to the Fluent Form
    // instance so editors never need to know internal form IDs.
    add_shortcode('starter_rfq_form', static function (array $atts = []): string {
        if (!shortcode_exists('fluentform')) {
            return '<p>' . esc_html__('Install Fluent Forms to enable the quotation form.', 'b2b-starter') . '</p>';
        }
        $atts = shortcode_atts(['id' => ''], $atts, 'starter_rfq_form');
        $form_id = (string) ($atts['id'] !== '' ? $atts['id'] : ensure_rfq_form());
        if ($form_id === '0') {
            return '<p>' . esc_html__('The quotation form is not ready yet. Please try again shortly.', 'b2b-starter') . '</p>';
        }
        return do_shortcode('[fluentform id="' . esc_attr($form_id) . '"]');
    });
});

add_action('acf/init', static function (): void {
    if (!function_exists('acf_add_local_field_group')) return;

    acf_add_local_field_group([
        'key' => 'group_starter_product', 'title' => 'Product specifications', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_starter_wattage', 'name' => 'wattage', 'label' => 'Wattage range', 'type' => 'text'],
            ['key' => 'field_starter_efficacy', 'name' => 'efficacy', 'label' => 'Luminous efficacy', 'type' => 'text'],
            ['key' => 'field_starter_ip', 'name' => 'ip_rating', 'label' => 'IP rating', 'type' => 'text'],
            ['key' => 'field_starter_warranty', 'name' => 'warranty', 'label' => 'Warranty', 'type' => 'text'],
            ['key' => 'field_starter_spec_table', 'name' => 'spec_table', 'label' => 'Specification table', 'type' => 'textarea',
             'rows' => 8, 'instructions' => 'One row per line as: Label | Value'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'starter_product']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_starter_industry', 'title' => 'Industry details', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_starter_industry_challenge', 'name' => 'challenge', 'label' => 'Lighting challenge', 'type' => 'textarea'],
            ['key' => 'field_starter_industry_outcome', 'name' => 'outcome', 'label' => 'Project outcome', 'type' => 'textarea'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'starter_industry']]],
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
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'starter_product']]],
    ]);

    // Site-wide factory profile (editable under one options screen).
    if (function_exists('acf_add_options_page')) {
        acf_add_options_page([
            'page_title' => 'Factory profile', 'menu_title' => 'Factory profile', 'menu_slug' => 'factory-profile',
            'capability' => 'edit_pages', 'icon_url' => 'dashicons-building', 'position' => 21, 'show_in_rest' => true,
        ]);
        acf_add_options_page([
            'page_title' => 'Site copy', 'menu_title' => 'Site copy', 'menu_slug' => 'site-copy',
            'capability' => 'edit_pages', 'icon_url' => 'dashicons-editor-textcolor', 'position' => 22, 'show_in_rest' => true,
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

    // Copy for routes that do not own a normal editable page object.
    acf_add_local_field_group([
        'key' => 'group_site_copy', 'title' => 'Archive and system copy', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_product_archive_description', 'name' => 'product_archive_description', 'label' => 'Product archive introduction', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Shown under the Product catalogue title. Leave empty to use the built-in default.'],
            ['key' => 'field_industry_archive_description', 'name' => 'industry_archive_description', 'label' => 'Industry archive introduction', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Shown under the Industry solutions title. Leave empty to use the built-in default.'],
            ['key' => 'field_guide_archive_description', 'name' => 'guide_archive_description', 'label' => 'Guide archive introduction', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Shown under the Knowledge guides title. Leave empty to use the built-in default.'],
            ['key' => 'field_news_archive_description', 'name' => 'news_archive_description', 'label' => 'News archive introduction', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Shown under News & updates. Leave empty to use the built-in default.'],
            ['key' => 'field_not_found_description', 'name' => 'not_found_description', 'label' => '404 introduction', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Shown on the page-not-found screen. Leave empty to use the built-in default.'],
        ],
        'location' => [[['param' => 'options_page', 'operator' => '==', 'value' => 'site-copy']]],
    ]);

    // Contact page supports both structured guidance and the embedded form.
    acf_add_local_field_group([
        'key' => 'group_contact_content', 'title' => 'Contact page content', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_contact_intro', 'name' => 'contact_intro', 'label' => 'Contact introduction', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Shown under the page title. Leave empty to use the page excerpt or built-in default.'],
            ['key' => 'field_contact_checklist', 'name' => 'contact_checklist', 'label' => 'What helps us quote faster', 'type' => 'textarea', 'rows' => 6,
             'instructions' => 'One checklist item per line. Leave empty to use the built-in default.'],
            ['key' => 'field_form_title', 'name' => 'form_title', 'label' => 'Form panel title', 'type' => 'text',
             'instructions' => 'Leave empty to use “Request for quotation”.'],
            ['key' => 'field_form_note', 'name' => 'form_note', 'label' => 'Form panel note', 'type' => 'textarea', 'rows' => 3,
             'instructions' => 'Short reassurance above the form. Leave empty to use the built-in default.'],
        ],
        'location' => [[['param' => 'page_template', 'operator' => '==', 'value' => 'page-contact.php']]],
    ]);
});
