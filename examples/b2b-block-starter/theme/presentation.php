<?php
namespace Hongda\Theme;
add_action('acf/init',static function(){acf_add_local_field_group(['key'=>'group_b2b_category','title'=>'Category presentation','show_in_rest'=>true,'fields'=>[['key'=>'field_b2b_category_layout','name'=>'category_layout','label'=>'Category layout','type'=>'select','choices'=>['catalogue'=>'Catalogue','editorial'=>'Introduction first'],'default_value'=>'catalogue']],'location'=>[[['param'=>'taxonomy','operator'=>'==','value'=>'hd_category']]]]);});
add_filter('taxonomy_template_hierarchy', static function($templates){if(is_tax('hd_category')&&field('category_layout',get_queried_object())==='editorial')array_unshift($templates,'taxonomy-hd_category-editorial.php');return $templates;});
// Honor declared post types and user-created Site Editor templates. Exclude
// undeclared hierarchy files that WP 7.1 otherwise exposes as custom choices.
function product_template_available(\WP_Block_Template $template): bool {
    if (isset($template->post_types)) return in_array('hd_product', $template->post_types, true);
    return $template->source === 'custom' && !$template->has_theme_file && $template->is_custom;
}
add_filter('get_block_templates',static function($templates,$query,$type){
    if($type==='wp_template'&&($query['post_type']??'')==='hd_product')return array_values(array_filter($templates,__NAMESPACE__.'\\product_template_available'));
    return $templates;
},10,3);
