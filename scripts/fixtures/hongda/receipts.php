<?php
// Read-only acceptance evidence in this isolated lab; never installed in production.
if (!defined('NEW_SITE_REFERENCE_LAB')) { return; }
add_action('rest_api_init', static function (): void {
    register_rest_route('hongda-lab/v1', '/receipts', [
        'methods'=>'GET',
        'permission_callback'=>static fn(): bool => current_user_can('manage_options'),
        'callback'=>static function (): array {
            global $wpdb;
            $form=(int)get_option('hd_enquiry_form_id');
            $rows=$wpdb->get_results($wpdb->prepare("SELECT id, form_id, response FROM {$wpdb->prefix}fluentform_submissions WHERE form_id = %d ORDER BY id DESC",$form),ARRAY_A);
            return array_map(static function (array $r): array { $data=json_decode($r['response'],true);return ['id'=>(int)$r['id'],'form'=>(int)$r['form_id'],'productId'=>$data['product_id']??null]; },$rows);
        },
    ]);
});
