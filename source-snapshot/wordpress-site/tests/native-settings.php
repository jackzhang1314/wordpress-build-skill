<?php
require '/wordpress/wp-load.php';
wp_set_current_user(1);
$native_results = [];
function native_check(bool $ok, string $name): void {
    global $native_results;
    $native_results[] = ['name'=>$name,'passed'=>$ok];
    if (!$ok) { throw new RuntimeException($name); }
}
function native_request(string $method, string $path, array $params = []): WP_REST_Response {
    $request = new WP_REST_Request($method, $path);
    foreach ($params as $key=>$value) { $request->set_param($key,$value); }
    return rest_do_request($request);
}
try {
    $native_theme = get_stylesheet();
    native_check(!post_type_exists('oct_product'), 'No companion plugin');
    $native_before = native_request('GET','/wp/v2/settings');
    native_check($native_before->get_status() === 200, 'Read native settings');
    $native_options = native_request('OPTIONS','/wp/v2/settings')->get_data();
    foreach (['title','description','show_on_front','page_on_front','page_for_posts'] as $native_field) {
        native_check(isset($native_options['schema']['properties'][$native_field]), 'Schema exposes '.$native_field);
    }
    $native_home = wp_insert_post(['post_title'=>'Native home test','post_type'=>'page','post_status'=>'publish']);
    $native_posts = wp_insert_post(['post_title'=>'Native blog test','post_type'=>'page','post_status'=>'publish']);
    $native_body = ['title'=>'Native settings fixture','description'=>'Isolated acceptance','show_on_front'=>'page','page_on_front'=>$native_home,'page_for_posts'=>$native_posts];
    native_check(native_request('POST','/wp/v2/settings',$native_body)->get_status() === 200, 'Write native settings');
    $native_after = native_request('GET','/wp/v2/settings')->get_data();
    foreach ($native_body as $native_field=>$native_value) { native_check($native_after[$native_field] === $native_value, 'Readback '.$native_field); }
    native_check(get_stylesheet() === $native_theme, 'Theme unchanged');
    native_check($native_after['url'] === $native_before->get_data()['url'], 'Site URL unchanged');
    $native_collections = [];
    foreach (['navigation','templates','template-parts'] as $native_base) {
        $native_response = native_request('GET','/wp/v2/'.$native_base,['context'=>'edit']);
        native_check($native_response->get_status() === 200, 'Read '.$native_base);
        $native_collections[$native_base] = ['count'=>count($native_response->get_data()),'ids'=>array_column($native_response->get_data(),'id')];
    }
    wp_set_current_user(0);
    native_check(native_request('POST','/wp/v2/settings',['title'=>'Unauthorized'])->get_status() === 401, 'Anonymous write denied');
    file_put_contents('/artifacts/native-settings-result.json',wp_json_encode(['wordpress'=>get_bloginfo('version'),'theme'=>$native_theme,'results'=>$native_results,'collections'=>$native_collections],JSON_PRETTY_PRINT));
} catch (Throwable $error) {
    file_put_contents('/artifacts/native-settings-result.json',wp_json_encode(['results'=>$native_results,'error'=>$error->getMessage()],JSON_PRETTY_PRINT));
    throw $error;
}
