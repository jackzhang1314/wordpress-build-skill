<?php
/**
 * Plugin Name: Octopus Trade Site
 * Description: Native product/case content models with mandatory ACF field groups for the Octopus browser Agent.
 * Version: 0.3.0
 * Requires at least: 6.6
 * Requires Plugins: advanced-custom-fields
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 * Text Domain: octopus-site
 */
if (!defined('ABSPATH')) { exit; }

function octopus_site_fields(string $type): array {
    return $type === 'oct_product'
        ? [
            'oct_model' => ['Model', 'text'],
            'oct_material' => ['Configuration / material', 'text'],
            'oct_moq' => ['Minimum order', 'text'],
            'oct_lead_time' => ['Lead time', 'text'],
            'oct_spec_weight' => ['Operating weight', 'text'],
            'oct_spec_engine' => ['Engine / power', 'text'],
            'oct_spec_dig_depth' => ['Max digging depth', 'text'],
            'oct_spec_width' => ['Transport width', 'text'],
            'oct_highlight_1' => ['Highlight 1', 'text'],
            'oct_highlight_2' => ['Highlight 2', 'text'],
            'oct_highlight_3' => ['Highlight 3', 'text'],
            'oct_gallery_image' => ['Detail image', 'image'],
            'oct_gallery_alt' => ['Detail image alt text', 'text'],
            'oct_cta_text' => ['Enquiry button text', 'text'],
            'oct_cta_url' => ['Enquiry button URL', 'url'],
        ]
        : [
            'oct_industry' => ['Industry', 'text'],
            'oct_outcome' => ['Outcome', 'text'],
        ];
}
function octopus_site_register(): void {
    foreach (['oct_product' => 'Products', 'oct_case' => 'Case studies'] as $type => $label) {
        if (post_type_exists($type)) { continue; }
        register_post_type($type, [
            'label' => $label, 'public' => true, 'show_in_rest' => true,
            'rest_base' => $type, 'has_archive' => true, 'rewrite' => ['slug' => $type === 'oct_product' ? 'products' : 'cases'],
            'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
            'template' => [['core/paragraph', ['placeholder' => 'Describe verified facts and applications.']]],
        ]);
    }
    register_taxonomy('oct_product_category', ['oct_product'], ['label' => 'Product categories', 'public' => true, 'hierarchical' => true, 'show_in_rest' => true, 'rewrite' => ['slug' => 'product-category']]);
    register_taxonomy('oct_case_industry', ['oct_case'], ['label' => 'Case industries', 'public' => true, 'hierarchical' => true, 'show_in_rest' => true]);
}
add_action('init', 'octopus_site_register');
register_activation_hook(__FILE__, static function (): void { octopus_site_register(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, static function (): void { flush_rewrite_rules(); });

// ACF is the required field editor and binding source. Field definitions remain in code, not only in the database.
add_action('acf/init', static function (): void {
    foreach (['oct_product', 'oct_case'] as $type) {
        $fields = [];
        foreach (octopus_site_fields($type) as $key => [$label, $field_type]) {
            $field = [
                'key' => 'field_octopus_' . $key,
                'name' => $key,
                'label' => $label,
                'type' => $field_type,
                'allow_in_bindings' => true,
                'maxlength' => 2000,
            ];
            if ($field_type === 'image') {
                $field['return_format'] = 'url';
                unset($field['maxlength']);
            }
            $fields[] = $field;
        }
        acf_add_local_field_group(['key' => 'group_octopus_' . $type, 'title' => 'Trade details', 'fields' => $fields,
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => $type]]], 'show_in_rest' => 1]);
    }
});

function octopus_site_status(): array {
    $state = ['siteTitle' => get_option('blogname'), 'description' => get_option('blogdescription'),
        'homePage' => (int) get_option('page_on_front'), 'postsPage' => (int) get_option('page_for_posts'),
        'showOnFront' => get_option('show_on_front'), 'theme' => get_stylesheet()];
    return ['version' => '0.3.0', 'modelVersion' => 2, 'state' => $state,
        'revision' => hash('sha256', wp_json_encode($state)),
        'acfAvailable' => function_exists('acf_add_local_field_group'),
        'canConfigure' => current_user_can('manage_options'),
        'models' => ['oct_product' => octopus_site_fields('oct_product'), 'oct_case' => octopus_site_fields('oct_case')]];
}
function octopus_site_configure(WP_REST_Request $request) {
    $input = $request->get_json_params();
    if (!is_array($input)) { return new WP_Error('octopus_input', 'JSON object required.', ['status' => 400]); }
    foreach (array_keys($input) as $key) {
        if (!in_array($key, ['expectedRevision', 'siteTitle', 'description', 'homePage', 'postsPage'], true)) { return new WP_Error('octopus_field', 'Unsupported field.', ['status' => 400]); }
    }
    $before = octopus_site_status();
    if (($input['expectedRevision'] ?? '') !== $before['revision']) { return new WP_Error('octopus_conflict', 'Site changed. Read again.', ['status' => 409]); }
    foreach (['homePage', 'postsPage'] as $field) {
        if (!isset($input[$field])) { continue; }
        $page = get_post($input[$field]);
        if (!$page || $page->post_type !== 'page' || $page->post_status !== 'publish') { return new WP_Error('octopus_page', 'Select a published page.', ['status' => 400]); }
    }
    $home = $input['homePage'] ?? $before['state']['homePage']; $posts = $input['postsPage'] ?? $before['state']['postsPage'];
    if ($home && $home === $posts) { return new WP_Error('octopus_page', 'Home and posts pages must differ.', ['status' => 400]); }
    foreach (['siteTitle' => 'blogname', 'description' => 'blogdescription', 'homePage' => 'page_on_front', 'postsPage' => 'page_for_posts'] as $key => $option) {
        if (array_key_exists($key, $input)) { update_option($option, $input[$key]); }
    }
    if (isset($input['homePage'])) { update_option('show_on_front', 'page'); }
    return rest_ensure_response(octopus_site_status());
}
add_action('rest_api_init', static function (): void {
    register_rest_route('octopus/v1', '/site', [
        ['methods' => 'GET', 'permission_callback' => static fn(): bool => current_user_can('edit_posts'), 'callback' => 'octopus_site_status'],
        ['methods' => 'POST', 'permission_callback' => static fn(): bool => current_user_can('manage_options'), 'callback' => 'octopus_site_configure', 'args' => [
            'expectedRevision' => ['type' => 'string', 'required' => true, 'pattern' => '^[a-f0-9]{64}$'],
            'siteTitle' => ['type' => 'string', 'minLength' => 1, 'maxLength' => 200, 'sanitize_callback' => 'sanitize_text_field'],
            'description' => ['type' => 'string', 'maxLength' => 500, 'sanitize_callback' => 'sanitize_text_field'],
            'homePage' => ['type' => 'integer', 'minimum' => 1], 'postsPage' => ['type' => 'integer', 'minimum' => 1],
        ]],
    ]);
});

// Public presentation fields for product categories. Business schema stays in the plugin.
add_action('acf/init', static function (): void {
    acf_add_local_field_group([
        'key' => 'group_octopus_product_category',
        'title' => 'Category presentation',
        'show_in_rest' => 1,
        'fields' => [
            ['key' => 'field_octopus_category_intro', 'name' => 'oct_category_intro', 'label' => 'Category introduction', 'type' => 'textarea', 'rows' => 3],
            ['key' => 'field_octopus_category_image', 'name' => 'oct_category_image', 'label' => 'Category image', 'type' => 'image', 'return_format' => 'id'],
        ],
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'oct_product_category']]],
    ]);
});
