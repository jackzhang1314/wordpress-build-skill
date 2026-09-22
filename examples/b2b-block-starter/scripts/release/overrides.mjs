// Read-only WordPress inventory. No content, credentials or customer names in output.
export const overrideInventoryPhp = `
function harness_template_overrides($changed) {
 $theme=get_stylesheet();$items=[];
 foreach(get_posts(['post_type'=>['wp_template','wp_template_part','wp_global_styles'],'post_status'=>'publish','numberposts'=>-1,'tax_query'=>[['taxonomy'=>'wp_theme','field'=>'name','terms'=>$theme]]]) as $post){
  $path=$post->post_type==='wp_global_styles'?'theme.json':($post->post_type==='wp_template'?'templates/':'parts/').$post->post_name.'.html';
  $items[]=['id'=>$post->ID,'type'=>$post->post_type,'path'=>$path,'contentHash'=>hash('sha256',$post->post_content),'changedFileConflict'=>in_array($path,$changed,true)];
 }
 return ['theme'=>$theme,'scope'=>'active-theme-published-overrides','overrides'=>$items,'blocked'=>count(array_filter($items,static fn($item)=>$item['changedFileConflict']))>0];
}
`;
export const OVERRIDE_PATH_PATTERN=/^(theme\.json|(?:templates|parts)\/[a-zA-Z0-9_-]+\.html)$/;
export function validateChangedPaths(paths) {
 if(!Array.isArray(paths)||!paths.every(p=>typeof p==='string'&&OVERRIDE_PATH_PATTERN.test(p)))throw new Error('Expected theme-relative theme.json, templates/SLUG.html or parts/SLUG.html paths');
 return [...new Set(paths)];
}
