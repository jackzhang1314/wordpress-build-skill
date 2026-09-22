<?php
/**
 * Plugin Name: New Site Content Model
 * Description: Reference product model; replace field definitions to match the project brief.
 * Version: 1.0.0
 * Requires at least: 7.0
 * Requires PHP: 8.1
 * Requires Plugins: advanced-custom-fields
 */
namespace NewSite\Model;
defined('ABSPATH') || exit;
function register_model(): void {
    register_post_type('site_product', [
        'labels' => ['name' => __('Products', 'new-site'), 'singular_name' => __('Product', 'new-site')],
        'public' => true, 'show_in_rest' => true, 'has_archive' => 'products',
        'rewrite' => ['slug' => 'products'], 'menu_icon' => 'dashicons-products',
        'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'custom-fields'],
    ]);
    register_taxonomy('product_collection', ['site_product'], [
        'label' => __('Collections', 'new-site'), 'public' => true, 'hierarchical' => true,
        'show_in_rest' => true, 'rewrite' => ['slug' => 'collections'],
    ]);
}
add_action('init', __NAMESPACE__ . '\\register_model');
register_activation_hook(__FILE__, static function (): void { register_model(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, static function (): void { unregister_post_type('site_product'); unregister_taxonomy('product_collection'); flush_rewrite_rules(); });
add_action('acf/init', static function (): void {
    acf_add_local_field_group([
        'key' => 'group_site_product', 'title' => 'Product details', 'show_in_rest' => true,
        'fields' => [
            ['key' => 'field_site_material', 'name' => 'material', 'label' => 'Material', 'type' => 'text'],
            ['key' => 'field_site_finish', 'name' => 'finish', 'label' => 'Finish', 'type' => 'text'],
        ],
        'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'site_product']]],
    ]);
    acf_add_local_field_group([
        'key' => 'group_site_collection', 'title' => 'Collection details', 'show_in_rest' => true,
        'fields' => [['key' => 'field_site_collection_intro', 'name' => 'collection_intro', 'label' => 'Introduction', 'type' => 'textarea']],
        'location' => [[['param' => 'taxonomy', 'operator' => '==', 'value' => 'product_collection']]],
    ]);
});
// No content seeding, form engine, deletion, or theme dependency in the model plugin.
