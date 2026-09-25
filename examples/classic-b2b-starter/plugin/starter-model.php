<?php
/**
 * Plugin Name: b2b-starter Content Model
 * Description: Full B2B information architecture: products, industries, guides and RFQ capture.
 * Version: 2.9.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields
 */
namespace Starter\Model;

defined('ABSPATH') || exit;

function content_labels(string $singular, string $plural, string $menu_name = ''): array {
    $menu_name = $menu_name ?: $plural;
    return [
        'name' => _x($plural, 'Post type general name', 'b2b-starter'),
        'singular_name' => _x($singular, 'Post type singular name', 'b2b-starter'),
        'menu_name' => _x($menu_name, 'Admin menu name', 'b2b-starter'),
        'all_items' => sprintf(__('All %s', 'b2b-starter'), $plural),
        'add_new' => __('Add new', 'b2b-starter'),
        'add_new_item' => sprintf(__('Add new %s', 'b2b-starter'), $singular),
        'edit_item' => sprintf(__('Edit %s', 'b2b-starter'), $singular),
        'new_item' => sprintf(__('New %s', 'b2b-starter'), $singular),
        'view_item' => sprintf(__('View %s', 'b2b-starter'), $singular),
        'view_items' => sprintf(__('View %s', 'b2b-starter'), $plural),
        'search_items' => sprintf(__('Search %s', 'b2b-starter'), $plural),
        'not_found' => sprintf(__('No %s found', 'b2b-starter'), strtolower($plural)),
        'not_found_in_trash' => sprintf(__('No %s found in trash', 'b2b-starter'), strtolower($plural)),
    ];
}

function register_model(): void {
    register_post_type('starter_product', [
        'labels' => content_labels('Product', 'Products'),
        'public' => true, 'publicly_queryable' => true, 'show_ui' => true, 'show_in_nav_menus' => true,
        'show_in_rest' => true, 'rest_base' => 'products', 'has_archive' => 'products',
        'rewrite' => ['slug' => 'products', 'with_front' => false], 'menu_icon' => 'dashicons-lightbulb',
        'menu_position' => 20, 'map_meta_cap' => true, 'capability_type' => 'post',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);

    register_taxonomy('product_collection', ['starter_product'], [
        'labels' => [
            'name' => _x('Product Categories', 'Taxonomy general name', 'b2b-starter'),
            'singular_name' => _x('Product Category', 'Taxonomy singular name', 'b2b-starter'),
            'menu_name' => _x('Categories', 'Admin menu name', 'b2b-starter'),
            'all_items' => __('All product categories', 'b2b-starter'),
            'edit_item' => __('Edit product category', 'b2b-starter'),
            'view_item' => __('View product category', 'b2b-starter'),
            'add_new_item' => __('Add new product category', 'b2b-starter'),
            'search_items' => __('Search product categories', 'b2b-starter'),
        ],
        'public' => true, 'publicly_queryable' => true, 'show_ui' => true, 'show_in_nav_menus' => true,
        'show_in_rest' => true, 'rest_base' => 'product-categories', 'hierarchical' => true,
        'show_admin_column' => true, 'rewrite' => ['slug' => 'product-category', 'with_front' => false],
        'map_meta_cap' => true,
    ]);

    register_post_type('starter_industry', [
        'labels' => content_labels('Industry solution', 'Industry Solutions', 'Industry'),
        'public' => true, 'publicly_queryable' => true, 'show_ui' => true, 'show_in_nav_menus' => true,
        'show_in_rest' => true, 'rest_base' => 'industries', 'has_archive' => 'industries',
        'rewrite' => ['slug' => 'industries', 'with_front' => false], 'menu_icon' => 'dashicons-building',
        'menu_position' => 23, 'map_meta_cap' => true, 'capability_type' => 'post',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);

    register_post_type('starter_guide', [
        'labels' => content_labels('Knowledge guide', 'Knowledge Guides', 'Guides'),
        'public' => true, 'publicly_queryable' => true, 'show_ui' => true, 'show_in_nav_menus' => true,
        'show_in_rest' => true, 'rest_base' => 'guides', 'has_archive' => 'guides',
        'rewrite' => ['slug' => 'guides', 'with_front' => false], 'menu_icon' => 'dashicons-book',
        'menu_position' => 25, 'map_meta_cap' => true, 'capability_type' => 'post',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);
}
add_action('init', __NAMESPACE__ . '\\register_model');

/** Give structured content types a locked native-editor skeleton. */
function register_editor_templates(): void {
    $product_template = [
        ['core/heading', ['level' => 2, 'content' => 'Product overview']],
        ['core/paragraph', ['content' => 'Explain the buyer problem, application and principal benefit.']],
        ['core/heading', ['level' => 2, 'content' => 'Key features']],
        ['core/list', ['values' => '<li>Feature one</li><li>Feature two</li><li>Feature three</li>']],
        ['core/heading', ['level' => 2, 'content' => 'Technical details']],
        ['core/paragraph', ['content' => 'Describe materials, options, compatibility and operating constraints.']],
    ];
    $guide_template = [
        ['core/heading', ['level' => 2, 'content' => 'Who this guide is for']],
        ['core/paragraph', ['content' => 'Define the buyer role, application and intended outcome.']],
        ['core/heading', ['level' => 2, 'content' => 'Selection criteria']],
        ['core/list', ['values' => '<li>Criterion one</li><li>Criterion two</li><li>Criterion three</li>']],
        ['core/heading', ['level' => 2, 'content' => 'Next step']],
        ['core/paragraph', ['content' => 'Explain what the buyer should send for an accurate response.']],
    ];

    foreach (['starter_product', 'starter_guide'] as $type) {
        $object = get_post_type_object($type);
        if (!$object) continue;
        $object->template = $type === 'starter_product' ? $product_template : $guide_template;
        $object->template_lock = 'all';
    }
}
add_action('init', __NAMESPACE__ . '\\register_editor_templates', 20);

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
        $defaults = [
            'key' => $key, 'name' => $name, 'label' => $label, 'type' => $type, 'show_in_rest' => true,
        ];
        if ($type !== 'tab' && empty($args['instructions'])) {
            $args['instructions'] = 'Shown on the website when this field is completed.';
        }
        return array_merge($defaults, $args);
    };
    $tab = static function (string $key, string $name, string $label) use ($field): array {
        return $field($key, $name, $label, 'tab', ['placement' => 'top', 'endpoint' => 0, 'show_in_rest' => false, 'instructions' => '']);
    };
    $rows_help = static function (string $format): array {
        return ['instructions' => $format . ' One item per line. Empty lines are ignored.'];
    };

    acf_add_local_field_group([
        'key' => 'group_starter_product', 'title' => 'Product content', 'show_in_rest' => true,
        'label_placement' => 'top', 'instruction_placement' => 'label',
        'fields' => [
            $tab('field_p_tab_gallery', 'tab_product_gallery', 'Gallery'),
            $field('field_p_gallery_1', 'product_gallery_1', 'Gallery image 1', 'image', [
                'return_format' => 'array', 'preview_size' => 'medium', 'library' => 'all',
                'instructions' => 'The featured image is also used as the first gallery image when this slot is empty.',
            ]),
            $field('field_p_gallery_2', 'product_gallery_2', 'Gallery image 2', 'image', ['return_format' => 'array', 'preview_size' => 'medium']),
            $field('field_p_gallery_3', 'product_gallery_3', 'Gallery image 3', 'image', ['return_format' => 'array', 'preview_size' => 'medium']),
            $field('field_p_gallery_4', 'product_gallery_4', 'Gallery image 4', 'image', ['return_format' => 'array', 'preview_size' => 'medium']),
            $field('field_p_gallery_5', 'product_gallery_5', 'Gallery image 5', 'image', ['return_format' => 'array', 'preview_size' => 'medium']),
            $tab('field_p_tab_specs', 'tab_product_specs', 'Specifications & proof'),
            $field('field_p_quick_specs', 'quick_specs', 'Quick specifications', 'textarea', array_merge(['rows' => 6], $rows_help('Use Label | Value.'))),
            $tab('field_p_tab_details', 'tab_product_details', 'Details & related'),
            $field('field_p_faq', 'product_faq', 'Product FAQ', 'textarea', array_merge(['rows' => 8], $rows_help('Use Question | Answer.'))),
            $field('field_p_details_title', 'product_details_title', 'Product details title', 'text', ['instructions' => 'Optional heading for the bottom rich-text section. Leave empty to use “Product details”.']),
            $field('field_p_spec_table', 'spec_table', 'Full specifications', 'textarea', array_merge(['rows' => 10], $rows_help('Use Label | Value.'))),
            $field('field_p_template', 'product_template', 'Product layout', 'select', [
                'choices' => [
                    'standard' => 'Standard catalogue layout',
                    'technical' => 'Technical datasheet layout',
                    'project' => 'Application / project layout',
                    'compact' => 'Compact RFQ layout',
                ],
                'default_value' => 'standard',
                'instructions' => 'Controls the single-product front-end layout. Leave on Standard unless the product needs a special presentation.',
            ]),
            $field('field_p_cta_label', 'product_cta_label', 'Product CTA button label', 'text', ['instructions' => 'Shown on the product and final CTA button. Leave empty to use “Request pricing”.']),
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
        'label_placement' => 'top', 'instruction_placement' => 'label',
        'fields' => [
            $tab('field_tc_tab_hero', 'tab_category_hero', 'Hero & facts'),
            $field('field_tc_template', 'category_template', 'Category layout', 'select', [
                'choices' => [
                    'standard' => 'Full commercial landing page',
                    'catalogue' => 'Catalogue-first layout',
                    'conversion' => 'Conversion-first layout',
                    'editorial' => 'Editorial / SEO-first layout',
                ],
                'default_value' => 'standard',
                'instructions' => 'Choose how this product category should present content.',
            ]),
            $field('field_tc_overline', 'category_overline', 'Hero eyebrow', 'text'),
            $field('field_tc_intro', 'category_intro', 'Hero introduction', 'textarea', ['rows' => 5, 'instructions' => 'Explain what belongs in this range and which buyers it serves.']),
            $field('field_tc_hero_image', 'category_hero_image', 'Hero image', 'image', ['return_format' => 'array', 'preview_size' => 'medium']),
            $field('field_tc_key_facts', 'category_key_facts', 'Key facts', 'textarea', array_merge(['rows' => 6], $rows_help('Use Label | Value.'))),
            $tab('field_tc_tab_selection', 'tab_category_selection', 'Selection & specifications'),
            $field('field_tc_features', 'category_features', 'Range benefits', 'textarea', array_merge(['rows' => 8], $rows_help('Use Title | Description.'))),
            $field('field_tc_selection_guide', 'category_selection_guide', 'Selection guide', 'textarea', array_merge(['rows' => 10], $rows_help('Use Step | Buying guidance.'))),
            $field('field_tc_specifications', 'category_specifications', 'Category specifications', 'textarea', array_merge(['rows' => 10], $rows_help('Use Label | Value or range.'))),
            $tab('field_tc_tab_applications', 'tab_category_applications', 'Applications'),
            $field('field_tc_applications', 'category_applications', 'Typical applications', 'textarea', array_merge(['rows' => 6], $rows_help('Enter an application.'))),
            $field('field_tc_use_cases', 'category_use_cases', 'Use cases', 'textarea', array_merge(['rows' => 10], $rows_help('Use Title | Description.'))),
            $tab('field_tc_tab_trust', 'tab_category_trust', 'Factory, standards & RFQ'),
            $field('field_tc_standards', 'category_standards', 'Standards & compliance', 'textarea', array_merge(['rows' => 6], $rows_help('Enter a standard, certification or compliance note.'))),
            $field('field_tc_process', 'category_process', 'RFQ process', 'textarea', array_merge(['rows' => 8], $rows_help('Use Step | Description.'))),
            $field('field_tc_checklist', 'category_checklist', 'RFQ checklist', 'textarea', array_merge(['rows' => 6], $rows_help('Enter information buyers should send.'))),
            $tab('field_tc_tab_resources', 'tab_category_resources', 'Resources & FAQ'),
            $field('field_tc_resources', 'category_resources', 'Resources & downloads', 'textarea', array_merge(['rows' => 6], $rows_help('Use Label | URL.'))),
            $field('field_tc_faq', 'category_faq', 'Category FAQ', 'textarea', array_merge(['rows' => 8], $rows_help('Use Question | Answer.'))),
            $field('field_tc_long_description', 'category_long_description', 'Long category description', 'wysiwyg', [
                'media_upload' => 1, 'teeny' => 0, 'textarea_rows' => 16,
                'instructions' => 'Rich editorial content for search intent, technical context, applications and buying guidance.',
            ]),
            $tab('field_tc_tab_editorial', 'tab_category_editorial', 'Editorial & CTA'),
            $field('field_tc_cta_title', 'category_cta_title', 'CTA title', 'text'),
            $field('field_tc_cta_text', 'category_cta_text', 'CTA text', 'textarea', ['rows' => 3]),
            $field('field_tc_cta_button', 'category_cta_button', 'CTA button label', 'text'),
        ],
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'product_collection']]],
    ]);

    acf_add_local_field_group([
        'key' => 'group_home_content', 'title' => 'Homepage content & sections', 'show_in_rest' => true,
        'label_placement' => 'top', 'instruction_placement' => 'label',
        'fields' => [
            $tab('field_home_tab_hero', 'tab_home_hero', 'Hero'),
            $field('field_home_template', 'home_template', 'Homepage layout', 'select', [
                'choices' => [
                    'corporate' => 'Corporate / manufacturer',
                    'product-led' => 'Product-led catalogue',
                    'conversion' => 'Conversion / RFQ first',
                    'industrial' => 'Industrial capability first',
                ],
                'default_value' => 'corporate',
                'instructions' => 'Select the homepage presentation style. This controls section order and emphasis.',
            ]),
            $field('field_home_overline', 'home_overline', 'Hero eyebrow', 'text'),
            $field('field_home_description', 'home_description', 'Hero description', 'textarea', ['rows' => 4]),
            $tab('field_home_tab_sections', 'tab_home_sections', 'Sections'),
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
            $tab('field_home_tab_cta', 'tab_home_cta', 'CTA'),
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
            $field('field_f_stats', 'factory_stats', 'Factory facts', 'textarea', array_merge(['rows' => 6], $rows_help('One fact per line. Use Value | Label (for example: 3 lines | Automated SMT, assembly and burn-in).'))),
            $field('field_f_caps', 'factory_capabilities', 'Capabilities', 'textarea', array_merge(['rows' => 8], $rows_help('Use Title | Description.'))),
            $field('field_f_certifications', 'factory_certifications', 'Certifications & standards', 'textarea', array_merge(['rows' => 6], $rows_help('Use Name | Note.'))),
            $field('field_f_process', 'factory_process', 'Manufacturing process', 'textarea', array_merge(['rows' => 8], $rows_help('Use Step | Description.'))),
            $field('field_f_quality_tests', 'factory_quality_tests', 'Quality tests', 'textarea', array_merge(['rows' => 6], $rows_help('Enter a quality-control step.'))),
            $field('field_f_markets', 'factory_markets', 'Export markets', 'text'),
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
