<?php
require_once get_theme_file_path( 'patterns.php' );

add_action('after_setup_theme', function () {
    load_theme_textdomain('terralift-ui', get_theme_file_path('languages'));
    add_theme_support('title-tag');
    add_theme_support('automatic-feed-links');
    add_theme_support('post-thumbnails');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
});

/**
 * ACF-safe field read: falls back to default when ACF is inactive so free
 * templates never fatal (audit P1-02). Mirrors get_field signature subset.
 */
function tl_field(string $key, $post_id = false, string $default = '', bool $format = true) {
    if (!function_exists('get_field')) {
        return $default;
    }
    $value = get_field($key, $post_id, $format);
    return ($value === null || $value === '') ? $default : $value;
}

/**
 * Portable internal page URL resolved from the page slug at runtime
 * (audit P1-04): no hardcoded environment paths in templates.
 */
function tl_page_url(string $slug): string {
    static $cache = [];
    if (!isset($cache[$slug])) {
        $page = get_page_by_path($slug);
        $cache[$slug] = $page ? get_permalink($page) : home_url('/' . $slug . '/');
    }
    return (string) $cache[$slug];
}

// Search must cover products and cases, not just posts (audit P1-11).
add_action('pre_get_posts', function ($query) {
    if (is_admin() || !$query instanceof WP_Query || !$query->is_main_query() || !$query->is_search()) {
        return;
    }
    $query->set('post_type', ['post', 'page', 'oct_product', 'oct_case']);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('terralift-ui', get_stylesheet_uri(), [], wp_get_theme()->get('Version'));
});

// Page-level ACF field groups live beside their templates: one file per group in acf/,
// named after the page template it serves (page-contact-v1.php pairs page-contact-v1 template).
// Requires ACF; CPT field groups stay centralized in the octopus-site plugin.
add_action('after_setup_theme', function () {
    $dir = get_theme_file_path('acf');
    if (!is_dir($dir)) {
        return;
    }
    foreach (glob($dir . '/*.php') ?: [] as $file) {
        require_once $file;
    }
});
