<?php
namespace Hongda\Theme;
defined('ABSPATH') || exit;
require __DIR__ . '/inc/view.php';
add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag'); add_theme_support('post-thumbnails'); add_theme_support('responsive-embeds'); add_theme_support('editor-styles'); add_editor_style(['style.css','editor.css']);
    add_theme_support('html5',['search-form','gallery','caption','style','script']);
    register_nav_menus(['primary'=>'Primary navigation','footer'=>'Footer navigation']);
});
add_action('wp_enqueue_scripts', static function (): void { wp_enqueue_style('hongda',get_stylesheet_uri(),[],filemtime(get_stylesheet_directory().'/style.css')); wp_enqueue_script('b2b-site-ui',get_theme_file_uri('assets/site.js'),[],filemtime(get_stylesheet_directory().'/assets/site.js'),true); });
add_action('acf/init', static function (): void {
    acf_add_local_field_group(['key'=>'group_hd_home','title'=>'Homepage introduction','fields'=>[
        ['key'=>'field_hd_eyebrow','name'=>'home_eyebrow','label'=>'Eyebrow','type'=>'text'],
        ['key'=>'field_hd_lead','name'=>'home_lead','label'=>'Introduction','type'=>'textarea'],
    ],'location'=>[[['param'=>'page_type','operator'=>'==','value'=>'front_page']]]]);
});
add_action('pre_get_posts',static function(\WP_Query $q): void {
    if(is_admin() || !$q->is_main_query()) return;
    if($q->is_post_type_archive('hd_product') || $q->is_tax('hd_category')){
        $q->set('posts_per_page',9); $q->set('orderby','title'); $q->set('order','ASC');
        $raw=isset($_GET['max_weight'])&&is_scalar($_GET['max_weight'])?wp_unslash((string)$_GET['max_weight']):'';
        if(in_array($raw,['1','2','3','6','12'],true)) $q->set('meta_query',[['key'=>'weight','value'=>(float)$raw,'compare'=>'<=','type'=>'DECIMAL(10,2)']]);
    }
    if($q->is_search()) $q->set('post_type',['hd_product','hd_solution','page','post']);
});

require __DIR__.'/presentation.php';
