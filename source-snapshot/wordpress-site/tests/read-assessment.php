<?php
require '/wordpress/wp-load.php';
wp_set_current_user(1);
$result=[];
foreach (['/wp/v2/users/me?context=edit&_fields=id,capabilities','/wp/v2/types?context=edit','/wp/v2/pages','/wp/v2/posts'] as $path) {
 $parts=parse_url($path);$request=new WP_REST_Request(in_array($path,['/wp/v2/pages','/wp/v2/posts'],true)?'OPTIONS':'GET',$parts['path']);
 if(isset($parts['query'])){parse_str($parts['query'],$params);foreach($params as $key=>$value){$request->set_param($key,$value);}}
 $response=rest_do_request($request);$data=$response->get_data();
 if(str_contains($path,'users/me')){$data=['id'=>$data['id'],'capabilities'=>$data['capabilities']??null];}
 $result[$path]=['status'=>$response->get_status(),'data'=>$data];
}
file_put_contents('/artifacts/detection-fixture.json',wp_json_encode(['wordpress'=>get_bloginfo('version'),'responses'=>$result],JSON_PRETTY_PRINT));
