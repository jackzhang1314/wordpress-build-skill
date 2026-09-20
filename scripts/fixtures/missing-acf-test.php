<?php
// Do not mutate active plugins in the source fixture; this filter affects only this request.
require '/wordpress/wp-includes/plugin.php';
add_filter('option_active_plugins', static fn($plugins) => array_values(array_filter($plugins, static fn($p) => $p !== 'advanced-custom-fields/acf.php')));
require '/wordpress/wp-load.php';
if (!defined('TERRALIFT_REGRESSION') || function_exists('get_field')) { throw new RuntimeException('Invalid missing-ACF fixture'); }
if (tl_field('absent', false, 'fallback') !== 'fallback') { throw new RuntimeException('Fallback failed'); }
$product = get_posts(['post_type'=>'oct_product', 'numberposts'=>1])[0];
query_posts(['p'=>$product->ID,'post_type'=>'oct_product']);
ob_start(); include get_theme_file_path('single-oct_product.php'); $html = ob_get_clean();
if (!str_contains($html, '<main') || !str_contains($html, 'Request a quote')) { throw new RuntimeException('Product failed without ACF'); }
$templates = ['page-home-v1.php','page-contact-v1.php','page-cases-v1.php','page-landing-v1.php','archive-oct_product.php','taxonomy-oct_product_category.php','single-oct_case.php'];
foreach ($templates as $file) {
    wp_reset_query();
    if ($file === 'single-oct_case.php') {
        $case = get_posts(['post_type'=>'oct_case','numberposts'=>1])[0];
        query_posts(['p'=>$case->ID,'post_type'=>'oct_case']);
    } elseif ($file === 'taxonomy-oct_product_category.php') {
        $term = get_terms(['taxonomy'=>'oct_product_category','hide_empty'=>true])[0];
        query_posts(['taxonomy'=>'oct_product_category','term'=>$term->slug]);
    } elseif ($file === 'archive-oct_product.php') {
        query_posts(['post_type'=>'oct_product']);
    } else {
        query_posts(['page_id'=>(int)get_option('page_on_front')]);
    }
    ob_start(); include get_theme_file_path($file); $output = ob_get_clean();
    if (!str_contains($output, '<main')) { throw new RuntimeException('Missing main without ACF: '.$file); }
}
file_put_contents('/artifacts/missing-acf.json', wp_json_encode(['pass'=>true,'templatesChecked'=>8,'getFieldAvailable'=>function_exists('get_field')]));
