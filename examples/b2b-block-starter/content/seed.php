<?php
if(!defined('ABSPATH'))require '/wordpress/wp-load.php';
if(!defined('NEW_SITE_REFERENCE_LAB') || !in_array(home_url(),['http://127.0.0.1:9464','http://127.0.0.1:9466','http://127.0.0.1:9468'],true))throw new RuntimeException('Isolated Hongda preview only');
if(get_option('hd_seeded') || get_posts(['post_type'=>'hd_product','numberposts'=>1]))throw new RuntimeException('Fresh database required');
wp_set_current_user(1);
// Only remove the pristine installer defaults in this guarded, new database.
foreach(['post'=>'hello-world','page'=>'sample-page'] as $type=>$slug){foreach(get_posts(['post_type'=>$type,'name'=>$slug,'post_status'=>'publish','numberposts'=>1]) as $default)wp_trash_post($default->ID);}
$data=json_decode(file_get_contents('/source/content/reference.json'),true,512,JSON_THROW_ON_ERROR);
$log=[];
function hd_insert(string $type,string $slug,string $title,string $content='',string $excerpt='',int $parent=0): int {
    $id=wp_insert_post(['post_type'=>$type,'post_status'=>'publish','post_name'=>$slug,'post_title'=>$title,'post_content'=>$content,'post_excerpt'=>$excerpt,'post_parent'=>$parent],true);
    if(is_wp_error($id))throw new RuntimeException($id->get_error_message());
    return (int)$id;
}
function hd_p(string $text): string { return '<!-- wp:paragraph --><p>'.esc_html($text).'</p><!-- /wp:paragraph -->'; }
function hd_h(string $text): string { return '<!-- wp:heading --><h2 class="wp-block-heading">'.esc_html($text).'</h2><!-- /wp:heading -->'; }
function hd_rows(array $rows): string { return implode("\n",array_map(static fn($r)=>implode(' | ',$r),$rows)); }
function hd_sections(array $items): string { $s='';foreach($items as $item){if(isset($item['h']))$s.=hd_h($item['h']);if(isset($item['p']))$s.=hd_p($item['p']);}return $s; }
update_option('blogname','HONGDA Machinery');update_option('blogdescription','Compact equipment for your next job');update_option('blog_public','0');update_option('posts_per_page',12);update_option('WPLANG','');
global $wp_rewrite;$wp_rewrite->set_permalink_structure('/journal/%postname%/');
require_once ABSPATH.'wp-admin/includes/file.php';require_once ABSPATH.'wp-admin/includes/media.php';require_once ABSPATH.'wp-admin/includes/image.php';
$media=[];
foreach(glob('/source/content/media/*.jpg') as $file){
    $key=basename($file,'.jpg');$tmp=wp_tempnam(basename($file));copy($file,$tmp);
    $id=media_handle_sideload(['name'=>basename($file),'tmp_name'=>$tmp],0,'Illustrative equipment photography — not a HONGDA product photograph');
    if(is_wp_error($id))throw new RuntimeException($id->get_error_message());
    update_post_meta($id,'_wp_attachment_image_alt','Illustrative compact equipment photograph');
    $media[$key]=$id;
}
$home=hd_insert('page','home','Your next job. The right machine.',hd_p('Explore compact excavators, loaders and application-led equipment choices. Compare the details that matter, then tell us about your operating conditions and delivery requirements.').hd_p('This design preview brings the equipment range, industry applications and inquiry journey together. Company credentials and model specifications remain subject to confirmation.'));
update_option('show_on_front','page');update_option('page_on_front',$home);set_post_thumbnail($home,$media['heroMiniExcavator']);
update_field('field_hd_eyebrow','COMPACT EQUIPMENT · GLOBAL APPLICATIONS',$home);update_field('field_hd_lead','Excavators, wheel loaders, backhoes and skid steers — find the equipment for your site, farm or fleet.',$home);
$terms=[];
foreach($data['categories'] as $c){$r=wp_insert_term($c['label'],'hd_category',['slug'=>$c['slug'],'description'=>$c['desc']]);if(is_wp_error($r))throw new RuntimeException($r->get_error_message());$terms[$c['slug']]=(int)$r['term_id'];}
$products=[];
foreach($data['products'] as $p){
    $body=hd_h('Equipment highlights');foreach($p['bullets']??[] as $item)$body.=hd_p($item);
    $body.=hd_p('Preview specification from the reference website. Confirm the final configuration and technical data before ordering.');
    $id=hd_insert('hd_product',$p['slug'],$p['name'],$body,$p['blurb']);
    update_field('field_hd_model',$p['model'],$id);update_field('field_hd_weight',$p['ton'],$id);
    foreach(['specifications'=>'specs','working_range'=>'range','dimensions'=>'size'] as $field=>$key)update_field('field_hd_'.$field,hd_rows($p[$key]??[]),$id);
    wp_set_object_terms($id,[$terms[$p['category']]],'hd_category');if(isset($media[$p['category']]))set_post_thumbnail($id,$media[$p['category']]);$products[$p['slug']]=$id;
}
$solutions=[];
foreach($data['industries'] as $p){
    $body=hd_h('Typical working conditions');foreach($p['scenarios']??[] as $row)$body.=hd_p($row['text'].' — '.$row['machine']);
    $body.=hd_h('Equipment considerations');foreach($p['recommended']??[] as $row)$body.=hd_h($row['label']).hd_p($row['text']);
    if(isset($p['faq']))$body.=hd_h($p['faq']['q']).hd_p($p['faq']['a']);
    $id=hd_insert('hd_solution',$p['slug'],$p['name'],$body,$p['intro']);
    $related=[];foreach($p['recommended']??[] as $row)if(isset($terms[$row['type']]))$related[]=$terms[$row['type']];update_field('field_hd_recommended',array_values(array_unique($related)),$id);$solutions[$p['slug']]=$id;
}
$story=hd_insert('page','our-story','The people behind your next machine.',hd_h('Equipment, applications and long-term support.').hd_p('A machine purchase starts with the application and continues through configuration, delivery and service. Explore the company, production and support topics below.').hd_p('This is a design preview. Factory, team, certification and company-history evidence will be added after verification.'));
update_post_meta($story,'_wp_page_template','page-about.php');
$storyPages=[];foreach($data['stories'] as $p){$storyPages[]=hd_insert('page',$p['slug'],$p['hero'],hd_p($p['intro']).hd_sections($p['sections']??[]),$p['short']??'',$story);}
$journal=hd_insert('page','blog','Equipment journal');update_option('page_for_posts',$journal);
$posts=[];foreach($data['posts'] as $p)$posts[]=hd_insert('post',$p['slug'],$p['title'],hd_sections($p['body']),$p['excerpt']);
require '/source/content/form.php';
$contact=hd_insert('page','contact-us','Contact us','<!-- wp:shortcode -->[fluentform id="'.(int)$form->id.'"]<!-- /wp:shortcode -->');update_post_meta($contact,'_wp_page_template','page-contact.php');
$topics=[];foreach($data['contactTopics'] as $p){$body=hd_p($p['intro']).hd_sections($p['points']??[]);foreach($p['faqs']??[] as $faq)$body.=hd_h($faq['q']).hd_p($faq['a']);$topics[]=hd_insert('page',$p['slug'],$p['hero'],$body,$p['short']??'',$contact);}
$menu=wp_create_nav_menu('Primary');if(is_wp_error($menu))throw new RuntimeException($menu->get_error_message());
foreach([['Equipment','hd_product'],['Industry','hd_solution']] as [$label,$type])wp_update_nav_menu_item($menu,0,['menu-item-title'=>$label,'menu-item-type'=>'post_type_archive','menu-item-object'=>$type,'menu-item-status'=>'publish']);
foreach([[$journal,'Journal'],[$story,'Our story'],[$contact,'Contact']] as [$id,$label])wp_update_nav_menu_item($menu,0,['menu-item-title'=>$label,'menu-item-object'=>'page','menu-item-object-id'=>$id,'menu-item-type'=>'post_type','menu-item-status'=>'publish']);
set_theme_mod('nav_menu_locations',['primary'=>$menu]);set_theme_mod('contact_page',$contact);set_theme_mod('about_page',$story);
$credits=hd_p('These photographs illustrate equipment categories and layouts. They show third-party machines, not HONGDA products. Display crops are used; photographs remain under the licences below.');
foreach(json_decode(file_get_contents('/source/content/media-manifest.json'),true) as $item){
    $v=$item['value']??[];$c=$v['credit']??null;if(!$c)continue;
    $credits.=hd_h($v['key']).hd_p(wp_strip_all_tags($c['artist']));
    $credits.='<!-- wp:paragraph --><p><a href="'.esc_url($c['filePage']).'">Original photograph</a> · <a href="'.esc_url($c['licenseUrl']).'">'.esc_html($c['license']).'</a></p><!-- /wp:paragraph -->';
}
$creditsId=hd_insert('page','image-credits','Image credits',$credits);set_theme_mod('credits_page',$creditsId);
flush_rewrite_rules();update_option('hd_seeded',true);
$application=WP_Application_Passwords::create_new_application_password(1,['name'=>'HONGDA local acceptance']);if(is_wp_error($application))throw new RuntimeException($application->get_error_message());
file_put_contents('/artifacts/connection.json',wp_json_encode(['site'=>home_url(),'username'=>'admin','password'=>$application[0]]));
file_put_contents('/artifacts/site.json',wp_json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'acf'=>ACF_VERSION,'fluentform'=>FLUENTFORM_VERSION,'theme'=>get_stylesheet(),'isBlockTheme'=>wp_is_block_theme(),'products'=>$products,'categories'=>$terms,'solutions'=>$solutions,'posts'=>$posts,'storyPages'=>$storyPages,'contactTopics'=>$topics,'pages'=>['home'=>$home,'about'=>$story,'journal'=>$journal,'contact'=>$contact],'credits'=>$creditsId,'media'=>$media,'form'=>(int)$form->id,'scope'=>'local-design-preview','mailMode'=>'local-capture'],JSON_PRETTY_PRINT));
