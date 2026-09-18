<?php
require_once get_theme_file_path( 'patterns.php' );

add_action('after_setup_theme', function () {
    add_theme_support('editor-styles');
    add_editor_style('style.css');
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('terralift-ui', get_stylesheet_uri(), [], wp_get_theme()->get('Version'));
});
