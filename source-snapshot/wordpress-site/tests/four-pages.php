<?php
// Developer-only fixture. No credentials, companion plugin or theme installation.
require '/wordpress/wp-load.php';
wp_set_current_user(1);
$initial_theme = get_stylesheet();
$four_pages = json_decode(file_get_contents('/artifacts/pages.json'), true, 512, JSON_THROW_ON_ERROR);
$results = [];
$saved = [];
function four_check(bool $ok, string $name): void {
    global $results;
    $results[] = ['name' => $name, 'passed' => $ok];
    if (!$ok) { throw new RuntimeException($name); }
}
function four_request(string $method, string $path, array $params): WP_REST_Response {
    $request = new WP_REST_Request($method, $path);
    foreach ($params as $key => $value) { $request->set_param($key, $value); }
    return rest_do_request($request);
}
try {
    four_check(!post_type_exists('oct_product'), 'No companion content plugin');
    foreach ($four_pages as $four_page) {
        $response = four_request('POST', '/wp/v2/pages', ['title'=>$four_page['title'], 'slug'=>'fixture-'.$four_page['key'], 'status'=>'draft', 'content'=>$four_page['content']]);
        four_check($response->get_status() === 201, $four_page['key'].' created');
        $data = $response->get_data();
        $read = four_request('GET', '/wp/v2/pages/'.$data['id'], ['context'=>'edit'])->get_data();
        four_check($read['status'] === 'draft' && $read['content']['raw'] === $four_page['content'], $four_page['key'].' draft readback');
        four_check(has_blocks($read['content']['raw']), $four_page['key'].' native blocks');
        $saved[$four_page['key']] = ['id'=>$data['id'], 'url'=>$data['link'], 'content'=>$read['content']['raw'], 'modified'=>$read['modified_gmt']];
    }
    foreach ($saved as $key => &$item) {
        // Internal links come from returned URLs, never guessed slugs or preview nonces.
        $links = '';
        foreach ($saved as $other => $target) {
            if ($other === $key) { continue; }
            $links .= '<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="'.esc_url($target['url']).'">'.esc_html($other).'</a></div><!-- /wp:button --></div><!-- /wp:buttons -->';
        }
        $content = $item['content']."\n\n".$links;
        $updated = four_request('POST', '/wp/v2/pages/'.$item['id'], ['content'=>$content, 'status'=>'draft']);
        four_check($updated->get_status() === 200, $key.' links updated');
        $read = four_request('GET', '/wp/v2/pages/'.$item['id'], ['context'=>'edit'])->get_data();
        four_check($read['content']['raw'] === $content && $read['status'] === 'draft', $key.' linked draft readback');
        $item['content'] = $content;
        $item['rendered'] = do_blocks($content);
        $item['preview'] = get_preview_post_link($item['id']);
        $item['edit'] = admin_url('post.php?post='.$item['id'].'&action=edit');
    }
    unset($item);
    four_check(get_stylesheet() === $initial_theme, 'Existing theme retained');
    wp_set_current_user(0);
    foreach ($saved as $key=>$item) {
        four_check(four_request('GET', '/wp/v2/pages/'.$item['id'], ['context'=>'view'])->get_status() >= 400, $key.' draft not public');
    }
    file_put_contents('/artifacts/four-pages-result.json', wp_json_encode(['wordpress'=>get_bloginfo('version'), 'theme'=>$initial_theme, 'results'=>$results, 'pages'=>$saved], JSON_PRETTY_PRINT));
} catch (Throwable $error) {
    file_put_contents('/artifacts/four-pages-result.json', wp_json_encode(['results'=>$results,'error'=>$error->getMessage()], JSON_PRETTY_PRINT));
    throw $error;
}
