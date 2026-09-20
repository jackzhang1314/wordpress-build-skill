<?php
// Local new-site fixture configuration, not a legacy SEO data importer.
defined('ABSPATH') || exit;
if (!defined('NEW_SITE_REFERENCE_LAB') || !in_array(home_url(),['http://127.0.0.1:9490','http://127.0.0.1:9491'],true)) throw new RuntimeException('Dedicated starter preview required');
if (!defined('RANK_MATH_VERSION')) throw new RuntimeException('Rank Math Free must be active');
// Same supported choice as Skip account connection in the setup screen.
update_option('rank_math_registration_skip',true);
$modules=['sitemap','rich-snippet','acf','redirections','404-monitor'];
update_option('rank_math_modules',$modules);
\RankMath\Installer::create_tables($modules);
update_option('rank_math_mode','advanced');
$titles=get_option('rank-math-options-titles',[]);
$titles=array_merge($titles,[
 'knowledgegraph_type'=>'company','knowledgegraph_name'=>get_bloginfo('name'),'website_name'=>get_bloginfo('name'),
 'local_business_type'=>'Organization','author_custom_robots'=>'on','author_robots'=>['noindex'],
 'disable_author_archives'=>'off','noindex_search'=>'on','noindex_archive_subpages'=>'off',
 'pt_hd_product_default_rich_snippet'=>'off','pt_hd_solution_default_rich_snippet'=>'off','pt_page_default_rich_snippet'=>'off',
 'pt_post_default_rich_snippet'=>'article',
]);
foreach(['post','page','hd_product','hd_solution'] as $type){
 $titles['pt_'.$type.'_add_meta_box']='on';
 $titles['pt_'.$type.'_description']='%excerpt%';
 $titles['pt_'.$type.'_custom_robots']='on';
 $titles['pt_'.$type.'_robots']=['index'];
}
$titles['tax_hd_category_add_meta_box']='on';
$titles['tax_hd_category_description']='%term_description%';
$titles['tax_hd_category_custom_robots']='on';
$titles['tax_hd_category_robots']=['index'];
update_option('rank-math-options-titles',$titles);
$sitemap=get_option('rank-math-options-sitemap',[]);
foreach(['post','page','hd_product','hd_solution'] as $type)$sitemap['pt_'.$type.'_sitemap']='on';
$sitemap['tax_hd_category_sitemap']='on';$sitemap['pt_attachment_sitemap']='off';$sitemap['authors_sitemap']='off';
update_option('rank-math-options-sitemap',$sitemap);
update_option('blog_public','0');
echo wp_json_encode(['seo'=>'Rank Math Free','version'=>RANK_MATH_VERSION,'modules'=>$modules,'previewNoindex'=>true]);
