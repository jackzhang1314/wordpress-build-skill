<?php
/**
 * Plugin Name: Hongda Equipment Model
 * Description: Portable equipment and industry content model. Requires ACF for field editing.
 * Version: 1.0.0
 * License: GPL-2.0-or-later
 */
namespace Hongda\Model;
defined('ABSPATH') || exit;
function register_model(): void {
    register_post_type('hd_product', ['labels'=>['name'=>'Equipment','singular_name'=>'Machine'], 'public'=>true,'show_in_rest'=>true,'has_archive'=>'equipment','rewrite'=>['slug'=>'equipment/model','with_front'=>false], 'menu_icon'=>'dashicons-admin-tools','supports'=>['title','editor','excerpt','thumbnail','revisions']]);
    register_taxonomy('hd_category', ['hd_product'], ['labels'=>['name'=>'Equipment families','singular_name'=>'Equipment family'],'public'=>true,'hierarchical'=>true,'show_in_rest'=>true,'rewrite'=>['slug'=>'equipment/family','with_front'=>false]]);
    register_post_type('hd_solution', ['labels'=>['name'=>'Industries','singular_name'=>'Industry solution'],'public'=>true,'show_in_rest'=>true,'has_archive'=>'industry','rewrite'=>['slug'=>'industry','with_front'=>false],'menu_icon'=>'dashicons-building','supports'=>['title','editor','excerpt','thumbnail','revisions']]);
}
add_action('init', __NAMESPACE__ . '\\register_model');
register_activation_hook(__FILE__, static function (): void { register_model(); flush_rewrite_rules(); });
register_deactivation_hook(__FILE__, static function (): void { flush_rewrite_rules(); });
add_action('acf/init', static function (): void {
    $fields=[];
    foreach ([['model','Model','text'],['weight','Operating weight (tonnes)','number'],['specifications','Technical specifications','textarea'],['working_range','Working range','textarea'],['dimensions','Dimensions','textarea']] as [$name,$label,$type]) {
        $fields[]=['key'=>'field_hd_'.$name,'name'=>$name,'label'=>$label,'type'=>$type,'instructions'=>$type==='textarea'?'One specification per line: Label | Value':'','min'=>0,'step'=>'any'];
    }
    acf_add_local_field_group(['key'=>'group_hd_product','title'=>'Machine specifications','show_in_rest'=>true,'fields'=>$fields,'location'=>[[['param'=>'post_type','operator'=>'==','value'=>'hd_product']]]]);
    acf_add_local_field_group(['key'=>'group_hd_solution','title'=>'Equipment selection','show_in_rest'=>true,'fields'=>[['key'=>'field_hd_recommended','name'=>'recommended_families','label'=>'Recommended equipment families','type'=>'taxonomy','taxonomy'=>'hd_category','field_type'=>'multi_select','return_format'=>'id','allow_null'=>1]],'location'=>[[['param'=>'post_type','operator'=>'==','value'=>'hd_solution']]]]);
});
// Only accept a published product as enquiry context. The stable ID is supplied
// by the product CTA; arbitrary product titles from a query string are not trusted.
function enquiry_product(): ?\WP_Post {
    $raw=isset($_GET['product_id']) && is_scalar($_GET['product_id']) ? wp_unslash((string) $_GET['product_id']) : '';
    $post=get_post(absint($raw));
    return $post instanceof \WP_Post && $post->post_type==='hd_product' && $post->post_status==='publish' ? $post : null;
}
add_filter('fluentform/validation_errors',static function(array $errors,array $data,$form): array {
    if((int)$form->id!==(int)get_option('hd_enquiry_form_id'))return $errors;
    $raw=$data['product_id']??'';
    if($raw==='')return $errors;
    $p=is_scalar($raw)?get_post(absint($raw)):null;
    if(!$p instanceof \WP_Post || $p->post_type!=='hd_product' || $p->post_status!=='publish')$errors['product_id']=['Choose a valid published machine, or leave the reference empty.'];
    return $errors;
},10,3);
add_filter('fluentform/insert_response_data',static function(array $data,$formId): array {
    if((int)$formId!==(int)get_option('hd_enquiry_form_id'))return $data;
    $raw=$data['product_id']??'';$id=is_scalar($raw)?absint($raw):0;$p=$id?get_post($id):null;
    $data['product_id']=$p instanceof \WP_Post && $p->post_type==='hd_product' && $p->post_status==='publish'?(string)$id:'';
    return $data;
},10,2);
