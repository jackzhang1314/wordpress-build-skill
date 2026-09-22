<?php
require '/wordpress/wp-load.php';
if (!defined('NEW_SITE_REFERENCE_LAB') || home_url() !== 'http://127.0.0.1:9463') { throw new RuntimeException('Isolated reference lab only'); }
wp_set_current_user(1);
if (get_option('new_site_reference_seeded')) { throw new RuntimeException('Use a fresh database, not an existing site'); }
if (post_type_exists('oct_product') || get_posts(['post_type' => 'site_product', 'numberposts' => 1])) { throw new RuntimeException('Unexpected business data'); }
update_option('blogname', 'Fieldwork');
update_option('blogdescription', 'Material library · demonstration site');
update_option('blog_public', '0');
global $wp_rewrite;
$wp_rewrite->set_permalink_structure('/%postname%/');
update_option('posts_per_page', 2);
function create_page(string $slug, string $title, string $body): int {
    $id = wp_insert_post(['post_type'=>'page', 'post_status'=>'publish', 'post_name'=>$slug, 'post_title'=>$title, 'post_content'=>$body], true);
    if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
    return $id;
}
$home = create_page('home', 'Materials for considered spaces.', '<!-- wp:paragraph --><p>A fictional material library for exploring products, comparing finishes and discussing a project. Every product on this site is demonstration content.</p><!-- /wp:paragraph -->');
$about = create_page('about', 'A library built around useful details.', '<!-- wp:paragraph --><p>Fieldwork is a fictional business used to verify this website architecture. Product specifications are editable examples, not manufacturer claims.</p><!-- /wp:paragraph -->');
$journal = create_page('journal', 'Journal', '');
$form = (new \FluentForm\App\Services\Form\FormService())->store(['predefined' => 'blank_form']);
$definition = json_decode($form->form_fields, true);
$elements = require WP_PLUGIN_DIR . '/fluentform/app/Services/FormBuilder/DefaultElements.php';
$definition['fields'] = [];
foreach ([['input_text','name','Your name',true],['input_email','email','Email address',true],['input_text','product','Product reference',false],['textarea','description','Your project',true]] as [$type,$name,$label,$required]) {
    $field = $elements['general'][$type];
    $field['attributes']['name'] = $name;
    $field['attributes']['placeholder'] = '';
    $field['settings']['label'] = $label;
    $field['settings']['validation_rules']['required']['value'] = $required;
    $field['uniqElKey'] = 'reference_' . $name;
    if ($name === 'product') { $field['attributes']['value'] = '{get.product}'; }
    $definition['fields'][] = $field;
}
$definition['submitButton']['settings']['button_ui']['text'] = 'Send demo enquiry';
$form->title = 'Reference site enquiry';
$form->form_fields = wp_json_encode($definition);
$form->save();
$settings = \FluentForm\App\Models\Form::getFormsDefaultSettings();
$settings['confirmation']['messageToShow'] = 'Your demo enquiry has been recorded locally. No external email was sent.';
\FluentForm\App\Models\FormMeta::persist($form->id, 'formSettings', $settings);
$notification = \FluentForm\App\Models\FormMeta::retrieve('notifications', $form->id);
$notification['enabled'] = true;
$notification['sendTo']['email'] = 'reference@example.test';
$notification['subject'] = 'Reference site enquiry';
\FluentForm\App\Models\FormMeta::persist($form->id, 'notifications', $notification);
$contact = create_page('contact', 'Tell us what you are working on.', '<!-- wp:paragraph --><p>Use this local demonstration form to test an enquiry. Messages remain in this test environment.</p><!-- /wp:paragraph --><!-- wp:shortcode -->[fluentform id="' . (int) $form->id . '"]<!-- /wp:shortcode -->');
update_option('show_on_front', 'page'); update_option('page_on_front', $home); update_option('page_for_posts', $journal);
$term = wp_insert_term('Surface studies', 'product_collection', ['slug' => 'surface-studies']);
if (is_wp_error($term)) { throw new RuntimeException($term->get_error_message()); }
update_field('field_site_collection_intro', 'Sample finishes for comparing texture and tone.', 'product_collection_' . $term['term_id']);
$ids = [];
foreach (['Linen panel', 'Clay panel', 'Moss panel'] as $name) {
    $id = wp_insert_post(['post_type'=>'site_product','post_status'=>'publish','post_title'=>$name,'post_excerpt'=>'A demonstration sample from the Fieldwork material library.','post_content'=>'<!-- wp:paragraph --><p>Use the editor to describe this sample and its intended application.</p><!-- /wp:paragraph -->'], true);
    if (is_wp_error($id)) { throw new RuntimeException($id->get_error_message()); }
    update_field('field_site_material', 'Demonstration composite', $id); update_field('field_site_finish', 'Matte', $id);
    wp_set_object_terms($id, [(int) $term['term_id']], 'product_collection');
    $ids[] = $id;
}
$articles = [];
foreach (['Choosing a surface', 'Working with samples', 'Notes on finish'] as $name) {
    $articles[] = wp_insert_post(['post_type'=>'post','post_status'=>'publish','post_title'=>$name,'post_content'=>'<!-- wp:paragraph --><p>Demonstration editorial content, editable with native WordPress blocks.</p><!-- /wp:paragraph -->']);
}
$menu = wp_create_nav_menu('Primary');
if (is_wp_error($menu)) { throw new RuntimeException($menu->get_error_message()); }
wp_update_nav_menu_item($menu, 0, ['menu-item-title'=>'Products','menu-item-status'=>'publish','menu-item-type'=>'post_type_archive','menu-item-object'=>'site_product']);
foreach ([[$about, 'About'], [$journal, 'Journal'], [$contact, 'Contact']] as [$page_id, $label]) {
    wp_update_nav_menu_item($menu, 0, ['menu-item-title'=>$label,'menu-item-object'=>'page','menu-item-object-id'=>$page_id,'menu-item-status'=>'publish','menu-item-type'=>'post_type']);
}
set_theme_mod('contact_page', $contact);
set_theme_mod('nav_menu_locations', ['primary' => $menu]);
flush_rewrite_rules();
update_option('new_site_reference_seeded', true);
$application = WP_Application_Passwords::create_new_application_password(1, ['name'=>'Isolated reference test']);
if (is_wp_error($application)) { throw new RuntimeException($application->get_error_message()); }
file_put_contents('/artifacts/connection.json', wp_json_encode(['site'=>home_url(),'username'=>'admin','password'=>$application[0]]));
file_put_contents('/artifacts/site.json', wp_json_encode([
    'wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'acf'=>ACF_VERSION,'fluentform'=>FLUENTFORM_VERSION,
    'theme'=>get_stylesheet(),'isBlockTheme'=>wp_is_block_theme(),
    'products'=>$ids,'collection'=>(int)$term['term_id'],'articles'=>$articles,'form'=>(int)$form->id,
    'pages'=>['home'=>$home,'about'=>$about,'journal'=>$journal,'contact'=>$contact],
    'mailMode'=>'local-capture','scope'=>'isolated-fictional-reference',
], JSON_PRETTY_PRINT));
