<?php
/**
 * Plugin Name: Octopus Trade Site
 * Description: Native product/case content models and controlled site setup for the Octopus browser Agent.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 * Text Domain: octopus-site
 */
if (!defined('ABSPATH')) { exit; }

function octopus_site_fields(string $type): array {
    return $type === 'oct_product'
        ? ['oct_model' => 'Model', 'oct_material' => 'Material', 'oct_moq' => 'Minimum order', 'oct_lead_time' => 'Lead time']
        : ['oct_industry' => 'Industry', 'oct_outcome' => 'Outcome'];
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
        foreach (octopus_site_fields($type) as $key => $label) {
            register_post_meta($type, $key, [
                'type' => 'string', 'single' => true, 'default' => '', 'description' => $label,
                'show_in_rest' => ['schema' => ['type' => 'string', 'maxLength' => 2000]],
                'sanitize_callback' => 'sanitize_text_field',
                'auth_callback' => static fn($allowed, $meta_key, $post_id): bool => current_user_can('edit_post', (int) $post_id),
            ]);
        }
    }
    register_taxonomy('oct_product_category', ['oct_product'], ['label' => 'Product categories', 'public' => true, 'hierarchical' => true, 'show_in_rest' => true]);
    register_taxonomy('oct_case_industry', ['oct_case'], ['label' => 'Case industries', 'public' => true, 'hierarchical' => true, 'show_in_rest' => true]);
}
add_action('init', 'octopus_site_register');
register_activation_hook(__FILE__, static function (): void { octopus_site_register(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, static function (): void { flush_rewrite_rules(); });

// The same post-meta values are edited by ACF when available; never maintain a second data copy.
add_action('acf/init', static function (): void {
    foreach (['oct_product', 'oct_case'] as $type) {
        $fields = [];
        foreach (octopus_site_fields($type) as $key => $label) {
            $fields[] = ['key' => 'field_octopus_' . $key, 'name' => $key, 'label' => $label, 'type' => 'text', 'maxlength' => 2000];
        }
        acf_add_local_field_group(['key' => 'group_octopus_' . $type, 'title' => 'Trade details', 'fields' => $fields,
            'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => $type]]], 'show_in_rest' => 1]);
    }
});
// ACF is optional: a native editor form makes every supplied field editable without a paid plugin.
add_action('add_meta_boxes', static function (): void {
    if (function_exists('acf_add_local_field_group')) { return; }
    foreach (['oct_product', 'oct_case'] as $type) {
        add_meta_box('octopus-details', 'Trade details', static function (WP_Post $post): void {
            wp_nonce_field('octopus_details', 'octopus_details_nonce');
            foreach (octopus_site_fields($post->post_type) as $key => $label) {
                echo '<p><label>' . esc_html($label) . '<br><input style="width:100%" maxlength="2000" name="' . esc_attr($key) . '" value="' . esc_attr((string) get_post_meta($post->ID, $key, true)) . '"></label></p>';
            }
        }, $type);
    }
});
add_action('save_post', static function (int $id, WP_Post $post): void {
    if (!in_array($post->post_type, ['oct_product', 'oct_case'], true) || wp_is_post_revision($id) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)) { return; }
    if (!isset($_POST['octopus_details_nonce']) || !is_string($_POST['octopus_details_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['octopus_details_nonce'])), 'octopus_details') || !current_user_can('edit_post', $id)) { return; }
    foreach (octopus_site_fields($post->post_type) as $key => $label) {
        if (isset($_POST[$key]) && is_string($_POST[$key])) { update_post_meta($id, $key, sanitize_text_field(wp_unslash($_POST[$key]))); }
    }
}, 10, 2);

function octopus_site_status(): array {
    $state = ['siteTitle' => get_option('blogname'), 'description' => get_option('blogdescription'),
        'homePage' => (int) get_option('page_on_front'), 'postsPage' => (int) get_option('page_for_posts'),
        'showOnFront' => get_option('show_on_front'), 'theme' => get_stylesheet()];
    return ['version' => '0.1.0', 'modelVersion' => 1, 'state' => $state,
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
