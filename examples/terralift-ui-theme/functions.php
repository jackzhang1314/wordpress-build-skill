<?php
require_once get_theme_file_path( 'patterns.php' );

add_action('after_setup_theme', function () {
    add_theme_support('editor-styles');
    add_editor_style('style.css');
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
