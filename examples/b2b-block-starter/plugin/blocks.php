<?php
namespace Hongda\Model;
defined('ABSPATH') || exit;
add_action('init',static function(){
    wp_register_script('b2b-site-blocks',plugins_url('assets/editor.js',__FILE__),['wp-blocks','wp-element','wp-block-editor','wp-server-side-render'],'1.0',true);
    foreach(glob(__DIR__.'/blocks/*/block.json') as $metadata)register_block_type(dirname($metadata),['render_callback'=>__NAMESPACE__.'\\render_business_block']);
});
function render_business_block(array $attributes,string $content,\WP_Block $block): string {
    $id=(int)($block->context['postId']??get_queried_object_id());$kind=substr($block->name,9);ob_start();
    echo '<div '.get_block_wrapper_attributes().'>';
    if($kind==='breadcrumbs'){
        echo '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="'.esc_url(home_url('/')).'">Home</a><span aria-hidden="true">/</span>';
        if(is_singular('hd_product'))echo '<a href="'.esc_url(get_post_type_archive_link('hd_product')).'">Equipment</a><span aria-hidden="true">/</span><span>'.esc_html(field('model',$id)).'</span>';
        elseif(is_tax('hd_category'))echo '<a href="'.esc_url(get_post_type_archive_link('hd_product')).'">Equipment</a><span aria-hidden="true">/</span><span>'.esc_html(single_term_title('',false)).'</span>';
        else echo '<span>'.esc_html(is_singular()?get_the_title($id):(is_post_type_archive('hd_product')?'Equipment':(is_post_type_archive('hd_solution')?'Applications':(is_home()?'Buying guides':'Explore')))).'</span>';
        echo '</nav>';
    } elseif($kind==='product-facts'){
        echo '<div class="product-facts"><div><small>MODEL</small><strong>'.esc_html(field('model',$id)).'</strong></div><div><small>WEIGHT CLASS</small><strong>'.esc_html(field('weight',$id)).'<span> t</span></strong></div></div>';
    } elseif($kind==='application-links'){
        echo '<div class="application-links">';$items=get_posts(['post_type'=>'hd_solution','numberposts'=>5,'orderby'=>'title','order'=>'ASC']);foreach($items as $item)echo '<a href="'.esc_url(get_permalink($item)).'"><span>'.esc_html($item->post_title).'</span><span aria-hidden="true">↗</span></a>';echo '</div>';
    } elseif($kind==='related-products'){
        $args=['post_type'=>'hd_product','posts_per_page'=>3,'post__not_in'=>is_singular('hd_product')?[$id]:[]];
        $terms=is_singular('hd_product')?wp_get_post_terms($id,'hd_category',['fields'=>'ids']):get_field('recommended_families',$id);
        if(is_array($terms)&&$terms)$args['tax_query']=[['taxonomy'=>'hd_category','terms'=>$terms]];
        $q=new \WP_Query($args);product_grid($q);
    } elseif($kind==='specifications'){
        $key=in_array($attributes['field']??'', ['specifications','working_range','dimensions'],true)?$attributes['field']:'specifications';
        echo '<dl class="specs">';foreach(preg_split('/\r\n|\r|\n/',field($key,$id))?:[] as $line){$row=explode('|',$line,2);if(count($row)===2)echo '<div><dt>'.esc_html(trim($row[0])).'</dt><dd>'.esc_html(trim($row[1])).'</dd></div>';}echo '</dl>';
    } elseif($kind==='product-cta') {
        echo '<a class="button rfq-trigger" data-inquiry-product="'.absint($id).'" data-inquiry-model="'.esc_attr(field('model',$id)).'" href="'.esc_url(enquiry($id)).'">Request a quote <span aria-hidden="true">↗</span></a>';
    } elseif($kind==='home-families') {
        echo '<div class="family-grid">';foreach(families() as $term){$q=new \WP_Query(['post_type'=>'hd_product','posts_per_page'=>1,'tax_query'=>[['taxonomy'=>'hd_category','terms'=>$term->term_id]]]);echo '<a class="family-card" href="'.esc_url(term_url($term)).'">';if($q->posts)media($q->posts[0]->ID);echo '<div><small>'.esc_html($term->count).' MODELS</small><h3>'.esc_html($term->name).'</h3></div></a>';}echo '</div>';
    } elseif($kind==='category-controls') {
        echo '<aside><h2>Equipment families</h2>';if(is_post_type_archive('hd_product'))echo '<p>'.esc_html(get_post_type_object('hd_product')->description).'</p>';foreach(families() as $term)echo '<p><a href="'.esc_url(term_url($term)).'">'.esc_html($term->name).'</a></p>';
        $weight=isset($_GET['max_weight'])&&is_scalar($_GET['max_weight'])?(string)wp_unslash($_GET['max_weight']):'';
        echo '<form method="get" action="'.esc_url(is_tax('hd_category')?term_url(get_queried_object()):get_post_type_archive_link('hd_product')).'"><label for="max_weight">Maximum operating weight</label><select name="max_weight" id="max_weight"><option value="">Any weight</option>';foreach([1,2,3,6,12] as $w)echo '<option value="'.esc_attr($w).'" '.selected($weight,(string)$w,false).'>Up to '.esc_html($w).' t</option>';echo '</select><button class="button" type="submit">Apply filter</button></form></aside>';
    } elseif($kind==='enquiry-form') {
        echo rfq_form();
    }
    echo '</div>';return ob_get_clean();
}
