<?php
/**
 * Plugin Name: b2b-starter Content Model
 * Description: Full B2B information architecture: products, industries, guides and RFQ capture.
 * Version: 2.2.0
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
function ensure_rfq_form_settings(int $form_id): void {
    global $wpdb;
    $meta_table = $wpdb->prefix . 'fluentform_form_meta';
    $exists = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM {$meta_table} WHERE form_id = %d AND meta_key = 'formSettings'",
        $form_id
    ));
    if ($exists) {
        return;
    }
    $settings = [
        'formExtraClasses' => [],
        'confirmation' => [
            'type' => 'samePage',
            'message' => 'Thank you! We will reply within one working day.',
        ],
    ];
    $wpdb->insert($meta_table, [
        'form_id' => $form_id,
        'meta_key' => 'formSettings',
        'value' => wp_json_encode($settings),
    ]);
}

function ensure_rfq_form(): int {
    global $wpdb;
    $forms_table = $wpdb->prefix . 'fluentform_forms';
    if ($wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $forms_table)) !== $forms_table) {
        return 0;
    }

    $form_id = (int) get_option('starter_rfq_form_id');
    if ($form_id && (int) $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$forms_table} WHERE ID = %d", $form_id))) {
        ensure_rfq_form_settings($form_id);
        return $form_id;
    }

    // Recover safely if the option was removed but the form still exists.
    $form_id = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT ID FROM {$forms_table} WHERE title = %s AND status = 'published' ORDER BY ID LIMIT 1",
        'Request for quotation'
    ));
    if ($form_id) {
        update_option('starter_rfq_form_id', $form_id);
        ensure_rfq_form_settings($form_id);
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
        $field('input_text', 'full_name', 'Full name', true),
        $field('input_email', 'email', 'Work email', true, 'email'),
        $field('input_text', 'company', 'Company'),
        $field('input_text', 'country', 'Country / region'),
        $field('input_text', 'product', 'Product or project type'),
        $field('textarea', 'message', 'Requirements', true, 'textarea'),
        [
            'element' => 'custom_html',
            'attributes' => ['name' => 'gdpr_note', 'type' => '', 'class' => '', 'placeholder' => ''],
            'settings' => [
                'label' => '',
                'admin_field_label' => '',
                'validation_rules' => [],
                'conditional_logic' => [],
                'html' => '<p>By submitting this form you agree to be contacted about your enquiry.</p>',
            ],
            'editor_options' => ['title' => '', 'icon_class' => 'ff-edit-text'],
        ],
    ];

    // Fluent Forms' installer-created forms have a known renderable row/meta
    // shape. Copy that shape rather than inventing a bare form row.
    $source = $wpdb->get_row(
        "SELECT * FROM {$forms_table} WHERE status = 'published' ORDER BY CASE WHEN title = 'Contact Form Demo' THEN 0 ELSE 1 END, id ASC LIMIT 1"
    );
    $form_fields = ['fields' => $fields];
    if ($source && !empty($source->form_fields)) {
        $source_fields = json_decode((string) $source->form_fields, true);
        if (!empty($source_fields['submitButton'])) {
            $form_fields['submitButton'] = $source_fields['submitButton'];
        }
    }

    $inserted = $wpdb->insert($forms_table, [
        'title' => 'Request for quotation',
        'status' => 'published',
        'form_fields' => wp_json_encode($form_fields),
        'appearance_settings' => $source->appearance_settings ?? wp_json_encode(['css' => '']),
        'has_payment' => 0,
        'type' => $source->type ?? 'form',
        'conditions' => $source->conditions ?? wp_json_encode([]),
        'created_by' => get_current_user_id() ?: 1,
    ]);
    if (!$inserted) {
        return 0;
    }

    $form_id = (int) $wpdb->insert_id;
    if ($source) {
        $source_settings = $wpdb->get_var($wpdb->prepare(
            "SELECT value FROM {$wpdb->prefix}fluentform_form_meta WHERE form_id = %d AND meta_key = 'formSettings'",
            $source->id
        ));
        if ($source_settings) {
            $wpdb->insert($wpdb->prefix . 'fluentform_form_meta', [
                'form_id' => $form_id,
                'meta_key' => 'formSettings',
                'value' => $source_settings,
            ]);
        }
    }
    $wpdb->insert($wpdb->prefix . 'fluentform_form_meta', [
        'form_id' => $form_id,
        'meta_key' => 'notifications',
        'value' => wp_json_encode([[
            'name' => 'Admin notification',
            'sendTo' => ['type' => 'email', 'email' => get_option('admin_email')],
            'subject' => 'New quotation request — {inputs.full_name}',
            'body' => '<p>{all_data}</p>',
            'isEnabled' => true,
        ]]),
    ]);
    update_option('starter_rfq_form_id', $form_id);
    ensure_rfq_form_settings($form_id);
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

    $field = static function (string $key, string $name, string $label, string $type, array $args = []): array {
        return array_merge([
            'key' => $key, 'name' => $name, 'label' => $label, 'type' => $type, 'show_in_rest' => true,
        ], $args);
    };
    $rows_help = static function (string $format): array {
        return ['instructions' => $format . ' One item per line. Empty lines are ignored.'];
    };

    acf_add_local_field_group([
        'key' => 'group_starter_product', 'title' => 'Product content', 'show_in_rest' => true,
        'fields' => [
            $field('field_p_quick_specs', 'quick_specs', 'Quick specifications', 'textarea', array_merge(['rows' => 6], $rows_help('Use Label | Value.'))),
            $field('field_p_highlights', 'product_highlights', 'Key selling points', 'textarea', array_merge(['rows' => 6], $rows_help('Enter a short claim.'))),
            $field('field_p_spec_table', 'spec_table', 'Full specifications', 'textarea', array_merge(['rows' => 10], $rows_help('Use Label | Value.'))),
            $field('field_p_applications', 'product_applications', 'Typical applications', 'textarea', array_merge(['rows' => 6], $rows_help('Enter an application.'))),
            $field('field_p_documents', 'product_documents', 'Documents & downloads', 'textarea', array_merge(['rows' => 6], $rows_help('Enter a document name or URL.'))),
            $field('field_p_warranty', 'warranty', 'Warranty', 'text'),
            $field('field_p_lead_time', 'lead_time', 'Lead time', 'text'),
            $field('field_p_moq', 'moq', 'MOQ', 'text'),
            $field('field_p_customization', 'customization_note', 'Customization note', 'textarea', ['rows' => 4]),
            $field('field_p_cta_note', 'product_cta_note', 'Product CTA note', 'textarea', ['rows' => 3]),
            $field('field_p_cta_label', 'product_cta_label', 'Product CTA button label', 'text'),
            $field('field_p_trust_points', 'product_trust_points', 'Trust points', 'textarea', array_merge(['rows' => 4], $rows_help('Enter a short claim.'))),
            $field('field_p_related', 'related_products', 'Related products', 'post_object', [
                'post_type' => ['starter_product'], 'multiple' => 1, 'return_format' => 'id', 'instructions' => 'Leave empty to show automatic related products.',
            ]),
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'starter_product']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_starter_industry', 'title' => 'Industry details', 'show_in_rest' => true,
        'fields' => [
            $field('field_i_challenge', 'challenge', 'Customer challenge', 'textarea', ['rows' => 5]),
            $field('field_i_outcome', 'outcome', 'Outcome', 'textarea', ['rows' => 5]),
            $field('field_i_cta_title', 'industry_cta_title', 'CTA title', 'text'),
            $field('field_i_cta_text', 'industry_cta_text', 'CTA text', 'textarea', ['rows' => 3]),
            $field('field_i_cta_button', 'industry_cta_button', 'CTA button label', 'text'),
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'starter_industry']]],
    ]);

    // Rich category content uses term meta; textarea line formats keep the starter on ACF Free.
    acf_add_local_field_group([
        'key' => 'group_collection_content', 'title' => 'Category content', 'show_in_rest' => true,
        'fields' => [
            $field('field_tc_intro', 'category_intro', 'Intro paragraph', 'textarea', ['rows' => 4]),
            $field('field_tc_features', 'category_features', 'Category highlights', 'textarea', array_merge(['rows' => 8], $rows_help('Use Title | Description.'))),
            $field('field_tc_applications', 'category_applications', 'Typical applications', 'textarea', array_merge(['rows' => 6], $rows_help('Enter an application.'))),
            $field('field_tc_faq', 'category_faq', 'Category FAQ', 'textarea', array_merge(['rows' => 8], $rows_help('Use Question | Answer.'))),
            $field('field_tc_cta_title', 'category_cta_title', 'CTA title', 'text'),
            $field('field_tc_cta_text', 'category_cta_text', 'CTA text', 'textarea', ['rows' => 3]),
            $field('field_tc_cta_button', 'category_cta_button', 'CTA button label', 'text'),
        ],
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'product_collection']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_home_content', 'title' => 'Homepage content & sections', 'show_in_rest' => true,
        'fields' => [
            $field('field_home_overline', 'home_overline', 'Hero eyebrow', 'text'),
            $field('field_home_description', 'home_description', 'Hero description', 'textarea', ['rows' => 4]),
            $field('field_home_show_apps', 'show_applications', 'Show applications', 'true_false', ['default_value' => 1]),
            $field('field_home_apps_title', 'applications_title', 'Applications title', 'text'),
            $field('field_home_apps_count', 'applications_count', 'Applications count', 'number', ['default_value' => 12, 'min' => 1, 'max' => 12]),
            $field('field_home_show_products', 'show_featured_products', 'Show featured products', 'true_false', ['default_value' => 1]),
            $field('field_home_products_title', 'featured_products_title', 'Products title', 'text'),
            $field('field_home_products_count', 'featured_products_count', 'Products count', 'number', ['default_value' => 6, 'min' => 1, 'max' => 12]),
            $field('field_home_show_industries', 'show_industries', 'Show industries', 'true_false', ['default_value' => 1]),
            $field('field_home_industries_title', 'industries_title', 'Industries title', 'text'),
            $field('field_home_industries_count', 'industries_count', 'Industries count', 'number', ['default_value' => 3, 'min' => 1, 'max' => 12]),
            $field('field_home_show_guides', 'show_guides', 'Show guides', 'true_false', ['default_value' => 1]),
            $field('field_home_guides_title', 'guides_title', 'Guides title', 'text'),
            $field('field_home_guides_count', 'guides_count', 'Guides count', 'number', ['default_value' => 3, 'min' => 1, 'max' => 12]),
            $field('field_home_cta_title', 'home_cta_title', 'Homepage CTA title', 'text'),
            $field('field_home_cta_text', 'home_cta_text', 'Homepage CTA text', 'textarea', ['rows' => 3]),
            $field('field_home_cta_button', 'home_cta_button', 'Homepage CTA button', 'text'),
        ],
        'location' => [[['param' => 'page_type', 'operator' => '==', 'value' => 'front_page']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_landing_content', 'title' => 'Landing page content', 'show_in_rest' => true,
        'fields' => [
            $field('field_landing_overline', 'landing_overline', 'Eyebrow', 'text'),
            $field('field_landing_description', 'landing_description', 'Intro description', 'textarea', ['rows' => 4]),
            $field('field_landing_features', 'landing_features', 'Feature rows', 'textarea', array_merge(['rows' => 8], $rows_help('Use Title | Description.'))),
            $field('field_landing_cta_title', 'landing_cta_title', 'CTA title', 'text'),
            $field('field_landing_cta_text', 'landing_cta_text', 'CTA text', 'textarea', ['rows' => 3]),
            $field('field_landing_cta_button', 'landing_cta_button', 'CTA button label', 'text'),
        ],
        'location' => [[['param' => 'page_template', 'operator' => '==', 'value' => 'page-templates/landing.php']]],
    ]);

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
            $field('field_f_intro', 'factory_intro', 'Factory introduction', 'textarea', ['rows' => 4, 'instructions' => 'Shown where the design requests a company proof block.']),
            $field('field_f_stats', 'factory_stats', 'Factory facts', 'textarea', array_merge(['rows' => 6], $rows_help('Use Value | Label.'))),
            $field('field_f_caps', 'factory_capabilities', 'Capabilities', 'textarea', array_merge(['rows' => 8], $rows_help('Use Title | Description.'))),
        ],
        'location' => [[['param' => 'options_page', 'operator' => '==', 'value' => 'factory-profile']]],
    ]);

    // Copy for archives, system routes and global conversion promises.
    acf_add_local_field_group([
        'key' => 'group_site_copy', 'title' => 'Site copy & conversion', 'show_in_rest' => true,
        'fields' => [
            $field('field_product_archive_description', 'product_archive_description', 'Product archive introduction', 'textarea', ['rows' => 3]),
            $field('field_industry_archive_description', 'industry_archive_description', 'Industry archive introduction', 'textarea', ['rows' => 3]),
            $field('field_guide_archive_description', 'guide_archive_description', 'Guide archive introduction', 'textarea', ['rows' => 3]),
            $field('field_news_archive_description', 'news_archive_description', 'News archive introduction', 'textarea', ['rows' => 3]),
            $field('field_not_found_description', 'not_found_description', '404 introduction', 'textarea', ['rows' => 3]),
            $field('field_response_promise', 'response_promise', 'Response promise', 'text'),
            $field('field_about_cta_title', 'about_cta_title', 'About CTA title', 'text'),
            $field('field_about_cta_text', 'about_cta_text', 'About CTA text', 'textarea', ['rows' => 3]),
            $field('field_about_cta_button', 'about_cta_button', 'About CTA button label', 'text'),
        ],
        'location' => [[['param' => 'options_page', 'operator' => '==', 'value' => 'site-copy']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_contact_content', 'title' => 'Contact page content', 'show_in_rest' => true,
        'fields' => [
            $field('field_contact_intro', 'contact_intro', 'Contact introduction', 'textarea', ['rows' => 3]),
            $field('field_contact_checklist', 'contact_checklist', 'What helps us respond faster', 'textarea', array_merge(['rows' => 6], $rows_help('Enter a checklist item.'))),
            $field('field_form_title', 'form_title', 'Form panel title', 'text'),
            $field('field_form_note', 'form_note', 'Form panel note', 'textarea', ['rows' => 3]),
        ],
        'location' => [[['param' => 'page_template', 'operator' => '==', 'value' => 'page-templates/contact.php']]],
    ]);
});
