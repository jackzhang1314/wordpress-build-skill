<?php
/**
 * Controlled template registry and renderers.
 *
 * @package b2b-starter
 */

namespace Starter\Theme;

defined('ABSPATH') || exit;

function product_templates(): array {
    return [
        'standard' => 'Standard catalogue layout',
        'technical' => 'Technical datasheet layout',
        'project' => 'Application / project layout',
        'compact' => 'Compact RFQ layout',
    ];
}

function category_templates(): array {
    return [
        'standard' => 'Full commercial landing page',
        'catalogue' => 'Catalogue-first layout',
        'conversion' => 'Conversion-first layout',
        'editorial' => 'Editorial / SEO-first layout',
    ];
}

function home_templates(): array {
    return [
        'corporate' => 'Corporate / manufacturer',
        'product-led' => 'Product-led catalogue',
        'conversion' => 'Conversion / RFQ first',
        'industrial' => 'Industrial capability first',
    ];
}

function normalize_template_choice($value, array $allowed, string $default): string {
    $value = sanitize_key((string) $value);
    return isset($allowed[$value]) ? $value : $default;
}

function product_template_value($post = 0): string {
    $meta = (string) get_post_meta((int) get_post_field('ID', $post), '_wp_page_template', true);
    $basename = basename((string) $meta, '.php');
    $basename = str_replace('product-', '', $basename);
    return normalize_template_choice(field_text('product_template', (int) get_post_field('ID', $post)) ?: $basename, product_templates(), 'standard');
}

function category_template_value($term = null): string {
    $term = $term instanceof \WP_Term ? $term : get_queried_object();
    $term_id = $term instanceof \WP_Term ? (int) $term->term_id : 0;
    $value = field_text('category_template', $term_id ? 'product_collection_' . $term_id : null);
    return normalize_template_choice($value, category_templates(), 'standard');
}

function home_template_value($post = 0): string {
    $value = field_text('home_template', $post ?: false);
    return normalize_template_choice($value, home_templates(), 'corporate');
}

function render_product_single(string $template = 'standard'): void {
    $allowed = product_templates();
    $template = normalize_template_choice($template, $allowed, 'standard');
    get_header();
    while (have_posts()) : the_post();
        set_query_var('product_template_context', [
            'product' => product_data(),
            'factory' => factory_profile_data(),
        ]);
        get_template_part('templates/products/' . $template);
    endwhile;
    get_footer();
}

function render_category_archive(string $template = 'standard'): void {
    $allowed = category_templates();
    $template = normalize_template_choice($template, $allowed, 'standard');
    get_header();
    set_query_var('category_template_context', [
        'category' => product_category_data(),
        'factory' => factory_profile_data(),
    ]);
    get_template_part('templates/categories/' . $template);
    get_footer();
}

function render_home_layout(string $template = 'corporate'): void {
    $allowed = home_templates();
    $template = normalize_template_choice($template, $allowed, 'corporate');
    get_header();
    while (have_posts()) : the_post();
        set_query_var('home_template_context', [
            'home' => homepage_data(),
            'factory' => factory_profile_data(),
        ]);
        get_template_part('templates/home/' . str_replace('-', '-', $template));
    endwhile;
    get_footer();
}
