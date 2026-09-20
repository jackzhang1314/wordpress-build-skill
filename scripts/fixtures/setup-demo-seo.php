<?php
require '/wordpress/wp-load.php';
if (home_url() !== 'http://127.0.0.1:9462') { throw new RuntimeException('Lab fixture only'); }
require_once ABSPATH . 'wp-admin/includes/plugin.php';
$result = activate_plugin('autodescription/autodescription.php');
if (is_wp_error($result)) { throw new RuntimeException($result->get_error_message()); }
// Preserve the local noindex setting. Metadata uses this installed adapter's keys.
update_option('blog_public', '0');
$home = (int) get_option('page_on_front');
update_post_meta($home, '_genesis_title', 'Compact machinery catalogue — TerraLift demo');
update_post_meta($home, '_genesis_description', 'Explore illustrative compact excavator, loader and skid steer profiles. Compare example specifications and try a local demonstration enquiry.');
$contact = get_page_by_path('terralift-contact');
update_post_meta($contact->ID, '_genesis_title', 'Equipment enquiry — TerraLift demo');
update_post_meta($contact->ID, '_genesis_description', 'Try the demonstration equipment enquiry form. Test enquiries are recorded locally; no real quotation or external email is sent.');
file_put_contents('/artifacts/seo-setup.json', wp_json_encode(['plugin'=>'autodescription','version'=>'5.1.4','noindex'=>(string) get_option('blog_public') === '0']));
