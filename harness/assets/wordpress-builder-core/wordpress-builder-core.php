<?php
/**
 * Plugin Name: WordPress Builder Core
 * Description: Theme-independent CPT, taxonomy, ACF and page-template adapter used by WordPress Builder.
 * Version: 1.1.0
 * Requires PHP: 7.4
 * Text Domain: wordpress-builder-core
 */

if (!defined('ABSPATH')) {
    exit;
}

define('WORDPRESS_BUILDER_CORE_VERSION', '1.1.0');
define('WORDPRESS_BUILDER_CORE_PATH', plugin_dir_path(__FILE__));

function wordpress_builder_core_post_types() {
    $defaults = [
        'builder_project' => [
            'labels' => ['name' => 'Builder Projects', 'singular_name' => 'Builder Project'],
            'menu_icon' => 'dashicons-portfolio',
            'has_archive' => true,
            'rewrite' => ['slug' => 'builder-projects'],
        ],
        'builder_service' => [
            'labels' => ['name' => 'Builder Services', 'singular_name' => 'Builder Service'],
            'menu_icon' => 'dashicons-hammer',
            'has_archive' => false,
            'rewrite' => ['slug' => 'builder-services'],
        ],
    ];

    /**
     * Projects may add or replace Builder-managed content types.
     * Each definition must contain label, singular_label, public, has_archive, rewrite and supports.
     */
    return apply_filters('wordpress_builder_core_post_types', $defaults);
}

function wordpress_builder_core_taxonomies() {
    $defaults = [
        'builder_category' => [
            'labels' => ['name' => 'Builder Categories', 'singular_name' => 'Builder Category'],
            'object_type' => ['builder_project'],
            'rewrite' => ['slug' => 'builder-categories'],
        ],
    ];

    return apply_filters('wordpress_builder_core_taxonomies', $defaults);
}

function wordpress_builder_core_register_content_types() {
    foreach (wordpress_builder_core_post_types() as $slug => $config) {
        $labels = [
            'name' => $config['label'] ?? $slug,
            'singular_name' => $config['singular_label'] ?? $config['label'] ?? $slug,
        ];

        register_post_type($slug, [
            'labels' => array_merge($labels, $config['labels'] ?? []),
            'public' => $config['public'] ?? true,
            'publicly_queryable' => $config['publicly_queryable'] ?? true,
            'show_ui' => $config['show_ui'] ?? true,
            'show_in_rest' => $config['show_in_rest'] ?? true,
            'has_archive' => $config['has_archive'] ?? false,
            'menu_icon' => $config['menu_icon'] ?? 'dashicons-admin-post',
            'supports' => $config['supports'] ?? ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'],
            'rewrite' => $config['rewrite'] ?? ['slug' => $slug],
        ]);
    }

    foreach (wordpress_builder_core_taxonomies() as $slug => $config) {
        $objectType = $config['object_type'] ?? ['builder_project'];
        $labels = [
            'name' => $config['label'] ?? $slug,
            'singular_name' => $config['singular_label'] ?? $config['label'] ?? $slug,
        ];

        register_taxonomy($slug, $objectType, [
            'labels' => array_merge($labels, $config['labels'] ?? []),
            'public' => $config['public'] ?? true,
            'publicly_queryable' => $config['publicly_queryable'] ?? true,
            'show_ui' => $config['show_ui'] ?? true,
            'show_in_rest' => $config['show_in_rest'] ?? true,
            'hierarchical' => $config['hierarchical'] ?? true,
            'show_admin_column' => $config['show_admin_column'] ?? true,
            'rewrite' => $config['rewrite'] ?? ['slug' => $slug],
        ]);
    }
}
add_action('init', 'wordpress_builder_core_register_content_types', 5);

function wordpress_builder_core_register_acf_fields() {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key' => 'group_wbc_content',
        'title' => 'WordPress Builder Content',
        'fields' => [
            [
                'key' => 'field_wbc_subtitle',
                'label' => 'Subtitle',
                'name' => 'wbc_subtitle',
                'type' => 'text',
                'instructions' => 'Optional secondary heading shown above the H1 in Builder templates.',
                'show_in_rest' => 1,
                'required' => 0,
            ],
            [
                'key' => 'field_wbc_summary',
                'label' => 'Summary',
                'name' => 'wbc_summary',
                'type' => 'textarea',
                'instructions' => 'Short buyer-facing summary used in the landing hero.',
                'show_in_rest' => 1,
                'required' => 0,
                'rows' => 3,
            ],
            [
                'key' => 'field_wbc_cta_label',
                'label' => 'CTA Label',
                'name' => 'wbc_cta_label',
                'type' => 'text',
                'instructions' => 'Primary action label, for example "Request a quote".',
                'show_in_rest' => 1,
                'required' => 0,
            ],
            [
                'key' => 'field_wbc_cta_url',
                'label' => 'CTA URL',
                'name' => 'wbc_cta_url',
                'type' => 'url',
                'instructions' => 'Full URL opened by the primary call-to-action button.',
                'show_in_rest' => 1,
                'required' => 0,
            ],
            [
                'key' => 'field_wbc_benefits',
                'label' => 'Buyer Benefits',
                'name' => 'wbc_benefits',
                'type' => 'textarea',
                'instructions' => 'One benefit per line. Optional format: Benefit | Supporting detail.',
                'show_in_rest' => 1,
                'required' => 0,
                'rows' => 6,
            ],
            [
                'key' => 'field_wbc_specifications',
                'label' => 'Specifications',
                'name' => 'wbc_specifications',
                'type' => 'textarea',
                'instructions' => 'One row per line using: Label | Value.',
                'show_in_rest' => 1,
                'required' => 0,
                'rows' => 8,
            ],
            [
                'key' => 'field_wbc_faq',
                'label' => 'FAQ',
                'name' => 'wbc_faq',
                'type' => 'textarea',
                'instructions' => 'One question per line using: Question | Answer.',
                'show_in_rest' => 1,
                'required' => 0,
                'rows' => 8,
            ],
            [
                'key' => 'field_wbc_secondary_cta_label',
                'label' => 'Secondary CTA Label',
                'name' => 'wbc_secondary_cta_label',
                'type' => 'text',
                'instructions' => 'Optional bottom action label; falls back to the primary CTA label.',
                'show_in_rest' => 1,
                'required' => 0,
            ],
            [
                'key' => 'field_wbc_secondary_cta_url',
                'label' => 'Secondary CTA URL',
                'name' => 'wbc_secondary_cta_url',
                'type' => 'url',
                'instructions' => 'Full URL for the bottom action; falls back to the primary CTA URL.',
                'show_in_rest' => 1,
                'required' => 0,
            ],
        ],
        'location' => [
            [
                ['param' => 'post_type', 'operator' => '==', 'value' => 'builder_project'],
            ],
            [
                ['param' => 'post_type', 'operator' => '==', 'value' => 'builder_service'],
            ],
            [
                ['param' => 'post_type', 'operator' => '==', 'value' => 'page'],
            ],
        ],
        'position' => 'normal',
        'style' => 'default',
        'active' => true,
        'show_in_rest' => 1,
    ]);
}
add_action('init', 'wordpress_builder_core_register_acf_fields', 20);

function wordpress_builder_core_field($name, $postId = null) {
    $value = function_exists('get_field') ? get_field($name, $postId) : get_post_meta($postId, $name, true);
    return $value === false || $value === '' ? '' : (string) $value;
}

function wordpress_builder_core_lines($value) {
    $lines = preg_split('/\R/u', (string) $value);
    if (!is_array($lines)) {
        return [];
    }
    return array_values(array_filter(array_map('trim', $lines), static function ($line) {
        return $line !== '';
    }));
}

function wordpress_builder_core_line_parts($line, $fallback = '') {
    $parts = array_map('trim', explode('|', (string) $line, 2));
    return [$parts[0] ?? '', $parts[1] ?? $fallback];
}

function wordpress_builder_core_enqueue_assets() {
    if (!is_singular(wordpress_builder_core_template_post_types())) {
        return;
    }

    $currentPost = get_queried_object();
    if (!$currentPost instanceof WP_Post || !str_starts_with((string) get_page_template_slug($currentPost), 'builder-templates/')) {
        return;
    }

    wp_enqueue_style(
        'wordpress-builder-core',
        plugins_url('assets/css/wordpress-builder-core.css', __FILE__),
        [],
        WORDPRESS_BUILDER_CORE_VERSION
    );
}
add_action('wp_enqueue_scripts', 'wordpress_builder_core_enqueue_assets');

function wordpress_builder_core_template_post_types() {
    return apply_filters('wordpress_builder_core_template_post_types', ['page', 'builder_project', 'builder_service']);
}

function wordpress_builder_core_templates($templates, $theme = null, $post = null, $postType = 'page') {
    if (!in_array($postType, wordpress_builder_core_template_post_types(), true)) {
        return $templates;
    }

    return array_merge([
        'builder-templates/canvas.php' => 'WordPress Builder Canvas',
        'builder-templates/landing.php' => 'WordPress Builder Landing',
    ], $templates);
}
add_filter('theme_templates', 'wordpress_builder_core_templates', 10, 4);

function wordpress_builder_core_template_path($slug) {
    return WORDPRESS_BUILDER_CORE_PATH . 'templates/' . basename($slug);
}

function wordpress_builder_core_template_include($template) {
    global $post;

    $supportedTypes = wordpress_builder_core_template_post_types();
    if (!$post instanceof WP_Post || !in_array($post->post_type, $supportedTypes, true)) {
        return $template;
    }

    $slug = (string) get_page_template_slug($post);

    if (!str_starts_with($slug, 'builder-templates/')) {
        return $template;
    }

    $path = wordpress_builder_core_template_path($slug);

    return file_exists($path) ? $path : $template;
}
add_filter('template_include', 'wordpress_builder_core_template_include', 20);
