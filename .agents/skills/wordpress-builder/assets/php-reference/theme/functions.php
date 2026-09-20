<?php
namespace NewSite\Theme;
defined('ABSPATH') || exit;
add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
    register_nav_menus(['primary' => __('Primary navigation', 'new-site')]);
});
add_action('wp_enqueue_scripts', static function (): void {
    wp_enqueue_style('new-site', get_stylesheet_uri(), [], wp_get_theme()->get('Version'));
});
function field_text(string $name, $object = false): string {
    $value = function_exists('get_field') ? get_field($name, $object) : '';
    return is_string($value) ? $value : '';
}
function contact_url(): string {
    $id = (int) get_theme_mod('contact_page', 0);
    $page = $id > 0 ? get_post($id) : null;
    return $page instanceof \WP_Post && $page->post_type === 'page' && $page->post_status === 'publish' ? get_permalink($page) : '';
}

add_action('customize_register', static function (\WP_Customize_Manager $manager): void {
    $manager->add_section('site_reference_links', ['title' => __('Site links', 'new-site')]);
    $manager->add_setting('contact_page', ['default' => 0, 'sanitize_callback' => 'absint', 'capability' => 'edit_theme_options']);
    $manager->add_control('contact_page', ['type' => 'dropdown-pages', 'section' => 'site_reference_links', 'label' => __('Enquiry page', 'new-site')]);
});
