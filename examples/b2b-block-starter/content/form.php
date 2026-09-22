<?php
$form = (new \FluentForm\App\Services\Form\FormService())->store(['predefined' => 'blank_form']);
$definition = json_decode($form->form_fields, true);
$elements = require WP_PLUGIN_DIR . '/fluentform/app/Services/FormBuilder/DefaultElements.php';
$definition['fields'] = [];
foreach ([['input_text','name','Your name',true],['input_email','email','Email address',true],['input_text','country','Destination country',true],['textarea','description','Your project',true]] as [$type,$name,$label,$required]) {
    $field = $elements['general'][$type];
    $field['attributes']['name'] = $name;
    $field['attributes']['placeholder'] = '';
    $field['settings']['label'] = $label;
    $field['settings']['validation_rules']['required']['value'] = $required;
    $field['uniqElKey'] = 'reference_' . $name;
    $definition['fields'][] = $field;
}
$hidden=$elements['advanced']['input_hidden'];
$hidden['attributes']['name']='product_id';$hidden['attributes']['value']='{get.product_id}';
$hidden['settings']['admin_field_label']='Product ID';$hidden['uniqElKey']='hongda_product_context';
$definition['fields'][]=$hidden;
$definition['submitButton']['settings']['button_ui']['text'] = 'Send inquiry';
$form->title = 'HONGDA preview inquiry';
$form->form_fields = wp_json_encode($definition);
$form->save();
$settings = \FluentForm\App\Models\Form::getFormsDefaultSettings();
$settings['confirmation']['messageToShow'] = 'Your demo enquiry has been recorded locally. No external email was sent.';
\FluentForm\App\Models\FormMeta::persist($form->id, 'formSettings', $settings);
$notification = \FluentForm\App\Models\FormMeta::retrieve('notifications', $form->id);
$notification['enabled'] = true;
$notification['sendTo']['email'] = 'reference@example.test';
$notification['subject'] = 'HONGDA preview inquiry';
\FluentForm\App\Models\FormMeta::persist($form->id, 'notifications', $notification);
update_option('hd_enquiry_form_id', (int)$form->id);
