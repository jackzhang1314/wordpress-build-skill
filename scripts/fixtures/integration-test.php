<?php
require '/wordpress/wp-load.php';
if (!defined('TERRALIFT_REGRESSION')) { throw new RuntimeException('Isolated regression flag required'); }
$checks = [];
function verify_case(string $name, bool $passed): void {
    global $checks;
    $checks[$name] = $passed;
    if (!$passed) { throw new RuntimeException('FAILED: ' . $name); }
}
$root = get_theme_file_path();
foreach (glob($root . '/*.php') as $file) { token_get_all(file_get_contents($file), TOKEN_PARSE); }
verify_case('theme PHP syntax', true);
verify_case('business types registered', post_type_exists('oct_product') && taxonomy_exists('oct_product_category'));
$product = get_posts(['post_type' => 'oct_product', 'numberposts' => 1])[0];
update_field('oct_spec_weight', 'QA 123 kg', $product->ID);
verify_case('ACF product update readback', get_field('oct_spec_weight', $product->ID) === 'QA 123 kg');
query_posts(['p' => $product->ID, 'post_type' => 'oct_product']);
$template = get_single_template();
verify_case('specific PHP wins over generic block index', basename($template) === 'single-oct_product.php');
ob_start(); include $template; $html = ob_get_clean();
verify_case('field change renders in actual product template', str_contains($html, 'QA 123 kg'));
verify_case('one document shell', substr_count(strtolower($html), '<!doctype html>') === 1);
verify_case('navigation import map exists', str_contains($html, 'type="importmap"'));
verify_case('product enquiry has context', str_contains($html, 'product=' . $product->ID));
wp_reset_query();
$term = get_terms(['taxonomy' => 'oct_product_category', 'hide_empty' => true])[0];
update_field('field_octopus_category_intro', 'QA category introduction', $term);
verify_case('category ACF is editable', get_field('oct_category_intro', $term) === 'QA category introduction');
query_posts(['taxonomy' => 'oct_product_category', 'term' => $term->slug]);
ob_start(); include $root . '/taxonomy-oct_product_category.php'; $category = ob_get_clean();
verify_case('category field renders', str_contains($category, 'QA category introduction'));
wp_reset_query();
$page_id = wp_insert_post(['post_type' => 'post', 'post_status' => 'publish', 'post_title' => 'Isolated article QA', 'post_content' => '<!-- wp:paragraph --><p>QA article content</p><!-- /wp:paragraph -->'], true);
verify_case('article creation', !is_wp_error($page_id));
verify_case('article block content remains editable', str_contains(apply_filters('the_content', get_post_field('post_content', $page_id)), 'QA article content'));
verify_case('non-product block single preserved', file_exists($root . '/templates/single.html'));
$definition = acf_get_field('field_home_v1_hero_image');
verify_case('page image field schema loaded', is_array($definition) && $definition['type'] === 'image');
$home = (int) get_option('page_on_front');
update_field('field_home_v1_hero_image', get_post_thumbnail_id($product), $home);
verify_case('page image edit readback', (int) get_field('hero_image', $home, false) === get_post_thumbnail_id($product));
file_put_contents('/artifacts/integration.json', wp_json_encode(['checks' => $checks, 'wp' => get_bloginfo('version'), 'php' => PHP_VERSION], JSON_PRETTY_PRINT));
