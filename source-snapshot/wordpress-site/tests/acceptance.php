<?php
require '/wordpress/wp-load.php';
wp_set_current_user(1);
$results = [];
function check_site(bool $ok, string $name): void {
    global $results; $results[] = ['name' => $name, 'passed' => $ok];
    if (!$ok) { throw new RuntimeException($name); }
}
function site_request(string $method, string $path, array $body = []): WP_REST_Response {
    $request = new WP_REST_Request($method, $path);
    if ($method === 'POST') { $request->set_header('content-type', 'application/json'); $request->set_body(wp_json_encode($body)); }
    return rest_do_request($request);
}
try {
    check_site(post_type_exists('oct_product') && post_type_exists('oct_case'), 'CPTs registered');
    $site = site_request('GET', '/octopus/v1/site'); check_site($site->get_status() === 200, 'Site discovery');
    $initial = $site->get_data();
    $response = site_request('POST', '/wp/v2/oct_product', ['title' => 'Valve fixture', 'status' => 'publish', 'meta' => ['oct_model' => 'MV-1', 'oct_material' => 'Steel']]);
    check_site($response->get_status() === 201, 'Create product with native meta'); $id = $response->get_data()['id'];
    if (function_exists('acf_add_local_field_group')) {
        $acf_response = site_request('POST', '/wp/v2/oct_product/' . $id, ['acf' => ['oct_model' => 'ACF-1']]);
        check_site($acf_response->get_status() === 200 && get_post_meta($id, 'oct_model', true) === 'ACF-1', 'ACF REST shares native field');
        update_field('field_octopus_oct_model', 'MV-1', $id);
        check_site(get_post_meta($id, 'oct_model', true) === 'MV-1', 'ACF field update reaches native meta');
    }
    $GLOBALS['post'] = get_post($id); setup_postdata($GLOBALS['post']);
    $markup = '<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"core/post-meta","args":{"key":"oct_model"}}}}} --><p></p><!-- /wp:paragraph -->';
    check_site(str_contains(do_blocks($markup), 'MV-1'), 'Core binding renders field');
    update_post_meta($id, 'oct_model', 'MV-2');
    check_site(str_contains(do_blocks($markup), 'MV-2') && !str_contains(do_blocks($markup), 'MV-1'), 'Field edit changes rendering');
    $page = wp_insert_post(['post_title' => 'Home fixture', 'post_type' => 'page', 'post_status' => 'publish']);
    $response = site_request('POST', '/octopus/v1/site', ['expectedRevision' => $initial['revision'], 'siteTitle' => 'Fixture Trade', 'homePage' => $page]);
    check_site($response->get_status() === 200, 'Configure site using existing theme');
    check_site(get_stylesheet() === $initial['state']['theme'], 'Existing theme unchanged');
    check_site(site_request('POST', '/octopus/v1/site', ['expectedRevision' => $response->get_data()['revision'], 'activateTheme' => true])->get_status() === 400, 'Theme activation field rejected');
    check_site(get_option('page_on_front') == $page && get_option('show_on_front') === 'page', 'Home selection saved');
    $state = $response->get_data();
    check_site(site_request('POST', '/octopus/v1/site', ['expectedRevision' => $initial['revision'], 'siteTitle' => 'Bad'])->get_status() === 409, 'Stale revision rejected');
    check_site(site_request('POST', '/octopus/v1/site', ['expectedRevision' => $state['revision'], 'brandColor' => 'url(evil)'])->get_status() === 400, 'CSS injection rejected');
    $draft = wp_insert_post(['post_title' => 'Draft', 'post_type' => 'page', 'post_status' => 'draft']);
    check_site(site_request('POST', '/octopus/v1/site', ['expectedRevision' => $state['revision'], 'homePage' => $draft])->get_status() === 400, 'Draft home rejected');
    check_site(site_request('POST', '/octopus/v1/site', ['expectedRevision' => $state['revision'], 'siteurl' => 'https://evil.test'])->get_status() === 400, 'Unknown settings rejected');
    $editor = wp_insert_user(['user_login' => 'fixture_editor', 'user_pass' => wp_generate_password(), 'role' => 'editor']);
    wp_set_current_user($editor);
    check_site(site_request('GET', '/octopus/v1/site')->get_status() === 200, 'Editor discovery allowed');
    check_site(site_request('POST', '/octopus/v1/site', ['expectedRevision' => $state['revision'], 'siteTitle' => 'Bad'])->get_status() === 403, 'Editor cannot configure site');
    wp_set_current_user(0);check_site(site_request('GET', '/octopus/v1/site')->get_status() === 401, 'Anonymous discovery rejected');
    wp_set_current_user(1);
    check_site(get_post_meta($id, 'oct_model', true) === 'MV-2' && post_type_exists('oct_product'), 'Business data remains available');
    file_put_contents('/artifacts/results.json', wp_json_encode(['wordpress' => get_bloginfo('version'), 'php' => PHP_VERSION, 'acf' => defined('ACF_VERSION') ? ACF_VERSION : null, 'results' => $results], JSON_PRETTY_PRINT));
} catch (Throwable $error) {
    file_put_contents('/artifacts/results.json', wp_json_encode(['results' => $results, 'error' => $error->getMessage()], JSON_PRETTY_PRINT));
    throw $error;
}
