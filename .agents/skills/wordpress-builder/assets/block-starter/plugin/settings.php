<?php
namespace Hongda\Model;
defined('ABSPATH') || exit;
add_action('admin_init', static function (): void {
    foreach (['contact_page'=>'Enquiry page','about_page'=>'About page','credits_page'=>'Image credits'] as $key=>$label) {
        register_setting('b2b_destinations','b2b_'.$key,['type'=>'integer','sanitize_callback'=>'absint','default'=>0]);
    }
});
add_action('admin_menu', static function (): void {
    add_options_page('B2B destinations','B2B destinations','manage_options','b2b-destinations',static function (): void {
        if (!current_user_can('manage_options')) return;
        echo '<div class="wrap"><h1>B2B destinations</h1><form method="post" action="options.php">';
        settings_fields('b2b_destinations');
        foreach (['contact_page'=>'Enquiry page','about_page'=>'About page','credits_page'=>'Image credits'] as $key=>$label) {
            echo '<p><label for="b2b_'.esc_attr($key).'">'.esc_html($label).'</label> ';
            wp_dropdown_pages(['name'=>'b2b_'.$key,'id'=>'b2b_'.$key,'selected'=>(int)get_option('b2b_'.$key),'show_option_none'=>'Select page','option_none_value'=>0]);
            echo '</p>';
        }
        submit_button();echo '</form></div>';
    });
});
