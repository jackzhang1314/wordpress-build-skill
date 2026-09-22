<?php
// Run only on the disposable release preparation database, never the source site.
if (!defined('RELEASE_PREP') || !RELEASE_PREP || DB_NAME !== 'prep') throw new RuntimeException('Not the isolated preparation database');
global $wpdb;
$keep = ['posts','postmeta','terms','term_taxonomy','term_relationships','termmeta','options','fluentform_forms','fluentform_form_meta'];
$empty = ['users','usermeta','comments','commentmeta','links','actionscheduler_actions','actionscheduler_claims','actionscheduler_groups','actionscheduler_logs','ff_scheduled_actions','fluentform_entry_details','fluentform_form_analytics','fluentform_logs','fluentform_submission_meta','fluentform_submissions','rank_math_404_logs','rank_math_internal_links','rank_math_internal_meta','rank_math_redirections','rank_math_redirections_cache'];
foreach ($wpdb->get_col('SHOW TABLES') as $table) {
    $suffix = substr($table, strlen($wpdb->prefix));
    if ($table !== $wpdb->prefix . $suffix || !in_array($suffix, array_merge($keep,$empty),true)) throw new RuntimeException('Unreviewed database table');
    if (in_array($suffix,$empty,true)) $wpdb->query("TRUNCATE TABLE `$table`");
}
$core = json_decode(file_get_contents('/tools/core-options.json'),true);
$custom = ['acf_version','acf_first_activated_version','hd_enquiry_form_id','b2b_contact_page','b2b_about_page','b2b_credits_page','b2b_design_revision','theme_mods_b2b-equipment','rank_math_modules','rank-math-options-general','rank-math-options-titles','rank-math-options-sitemap','rank_math_version','rank_math_db_version','rank_math_mode','rank_math_registration_skip'];
foreach ($wpdb->get_col("SELECT option_name FROM {$wpdb->options}") as $name) {
    if (!in_array($name,array_merge($core,$custom),true) || preg_match('/transient|cron|mailserver|recently|auto_update|new_admin_email/',$name)) delete_option($name);
}
update_option('admin_email','configure-before-release@example.invalid');
update_option('blog_public',0); update_option('users_can_register',0);
update_option('active_plugins',[]);
foreach ($wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_status IN ('trash','auto-draft') OR post_type='revision'") as $id) wp_delete_post((int)$id,true);
$wpdb->query("UPDATE {$wpdb->posts} SET post_author=0,post_password=''");
$wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key IN ('_edit_lock','_edit_last')");
$form = (int)get_option('hd_enquiry_form_id');
if (!$form) throw new RuntimeException('Missing enquiry form');
$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->prefix}fluentform_forms WHERE id<>%d",$form));
$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->prefix}fluentform_form_meta WHERE form_id<>%d",$form));
$wpdb->query("UPDATE {$wpdb->prefix}fluentform_forms SET created_by=0");
$allowedMeta=['formSettings','template_name','notifications','_primary_email_field','step_data_persistency_status'];
foreach ($wpdb->get_results("SELECT * FROM {$wpdb->prefix}fluentform_form_meta") as $row) {
    if (!in_array($row->meta_key,$allowedMeta,true)) throw new RuntimeException('Unreviewed form integration');
    if ($row->meta_key==='notifications') {
        $value=['name'=>'Enquiry notification','sendTo'=>['type'=>'email','email'=>'{wp.admin_email}'],'fromName'=>'','fromEmail'=>'','replyTo'=>'{inputs.email}','bcc'=>'','subject'=>'New equipment enquiry','message'=>'{all_data}','enabled'=>false];
        $wpdb->update($wpdb->prefix.'fluentform_form_meta',['value'=>wp_json_encode($value)],['id'=>$row->id]);
    }
    if ($row->meta_key==='formSettings') {
        $value=json_decode($row->value,true);$value['confirmation']['messageToShow']='Thank you. Your enquiry has been received.';
        $wpdb->update($wpdb->prefix.'fluentform_form_meta',['value'=>wp_json_encode($value)],['id'=>$row->id]);
    }
}
wp_cache_flush();
echo wp_json_encode(['users'=>(int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->users}"),'enquiries'=>(int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}fluentform_submissions"),'form'=>$form,'public'=>(int)get_option('blog_public')]);
