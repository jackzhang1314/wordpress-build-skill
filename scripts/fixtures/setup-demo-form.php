<?php
// Run only by a local Playground blueprint, after a database backup.
require '/wordpress/wp-load.php';
if (home_url() !== 'http://127.0.0.1:9462') { throw new RuntimeException('Lab fixture only'); }
require_once ABSPATH . 'wp-admin/includes/plugin.php';
wp_set_current_user(get_user_by('login', 'admin')->ID);
$result = activate_plugin('fluentform/fluentform.php');
if (is_wp_error($result)) { throw new RuntimeException($result->get_error_message()); }
if (get_option('terralift_demo_form_id')) { echo 'Form already configured'; return; }
$form = (new \FluentForm\App\Services\Form\FormService())->store(['predefined' => 'blank_form']);
$definition = json_decode($form->form_fields, true);
$elements = require WP_PLUGIN_DIR . '/fluentform/app/Services/FormBuilder/DefaultElements.php';
$definition['fields'] = [];
foreach ([['input_text','name','Your name',true],['input_email','email','Email address',true],['input_text','product','Product reference',false],['textarea','description','Application, quantity and destination',true]] as [$type,$name,$label,$required]) {
    $field = $elements['general'][$type];
    $field['attributes']['name'] = $name;
    $field['attributes']['placeholder'] = '';
    $field['settings']['label'] = $label;
    $field['settings']['validation_rules']['required']['value'] = $required;
    $field['uniqElKey'] = 'terralift_' . $name;
    if ($name === 'product') { $field['attributes']['value'] = '{get.product}'; }
    $definition['fields'][] = $field;
}
$definition['submitButton']['settings']['button_ui']['text'] = 'Send demo enquiry';
$form->title = 'TerraLift demonstration enquiry';
$form->form_fields = wp_json_encode($definition);
$form->save();
$settings = \FluentForm\App\Models\Form::getFormsDefaultSettings();
$settings['confirmation']['messageToShow'] = 'Your demo enquiry has been recorded locally. No external email was sent.';
\FluentForm\App\Models\FormMeta::persist($form->id, 'formSettings', $settings);
$notification = \FluentForm\App\Models\FormMeta::retrieve('notifications', $form->id);
$notification['enabled'] = true;
$notification['sendTo']['email'] = 'demo-recipient@example.com';
$notification['subject'] = 'TerraLift demo enquiry';
\FluentForm\App\Models\FormMeta::persist($form->id, 'notifications', $notification);
$contact = get_page_by_path('terralift-contact');
update_field('field_contact_v1_form_id', (int) $form->id, $contact->ID);
update_option('terralift_demo_form_id', (int) $form->id);
file_put_contents('/artifacts/demo-form.json', wp_json_encode(['id' => (int) $form->id, 'version' => FLUENTFORM_VERSION, 'mailMode' => 'local-capture']));
echo 'Configured form ' . (int) $form->id;
