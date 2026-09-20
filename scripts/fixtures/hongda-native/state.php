<?php
// Invoked through WP-CLI in a dedicated acceptance instance.
global $wpdb;
$state=[];
foreach(['posts','postmeta','terms','term_taxonomy','term_relationships','fluentform_submissions'] as $table) {
    $rows=$wpdb->get_results('SELECT * FROM `'.$wpdb->prefix.$table.'`',ARRAY_A);
    if($wpdb->last_error)throw new RuntimeException($wpdb->last_error);
    $rows=array_map(static fn($r)=>str_replace(['http://127.0.0.1:9468','http://127.0.0.1:9469'],'LOCAL_SITE',wp_json_encode($r,JSON_UNESCAPED_SLASHES)),$rows);
    sort($rows,SORT_STRING);$state[$table]=['rows'=>count($rows),'sha256'=>hash('sha256',implode("\n",$rows))];
}
$values=[];
foreach(['home','siteurl','permalink_structure','show_on_front','page_on_front','page_for_posts','theme_mods_site-reference','active_plugins'] as $key)$values[$key]=get_option($key);
$state['configuration']=hash('sha256',str_replace(['http://127.0.0.1:9468','http://127.0.0.1:9469'],'LOCAL_SITE',wp_json_encode($values,JSON_UNESCAPED_SLASHES)));
$uploads=[];$base=wp_upload_dir()['basedir'];
$iterator=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base,FilesystemIterator::SKIP_DOTS));
foreach($iterator as $file)if($file->isFile())$uploads[substr($file->getPathname(),strlen($base)+1)]=hash_file('sha256',$file->getPathname());
ksort($uploads);$state['uploads']=$uploads;
echo wp_json_encode($state);
