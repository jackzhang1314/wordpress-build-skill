<?php
if (!defined('ABSPATH')) { exit; }
add_action('wp_enqueue_scripts', static function (): void {
    wp_enqueue_style('octopus-trade', get_stylesheet_uri(), [], '0.1.0');
});
add_action('after_setup_theme', static function (): void {
    add_theme_support('editor-styles');
    add_editor_style('style.css');
});
// Apply the same brand token to both the site and the block editor.
add_filter('wp_theme_json_data_theme', static function (WP_Theme_JSON_Data $data): WP_Theme_JSON_Data {
    $color = sanitize_hex_color(get_option('octopus_brand_color', '#165D47')) ?: '#165D47';
    return $data->update_with(['version' => 3, 'settings' => ['color' => ['palette' => [
        ['slug' => 'accent', 'name' => 'Brand', 'color' => $color],
        ['slug' => 'ink', 'name' => 'Ink', 'color' => '#182B24'],
        ['slug' => 'muted', 'name' => 'Muted', 'color' => '#52665C'],
        ['slug' => 'base', 'name' => 'Base', 'color' => '#FFFFFF'],
        ['slug' => 'surface', 'name' => 'Surface', 'color' => '#F2F5F0'],
    ]]]]);
});
