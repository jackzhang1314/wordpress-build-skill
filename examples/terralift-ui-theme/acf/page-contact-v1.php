<?php
/**
 * Field group for page-contact-v1.php. Edit per page in WP admin or via REST `acf` object.
 * Pairs 1:1 with the template file name (fusion item #2, docs/15).
 */

if ( ! function_exists( 'acf_add_local_field_group' ) ) {
	return;
}

acf_add_local_field_group(
	array(
		'key'          => 'group_page_contact_v1',
		'title'        => 'Contact page v1',
		'fields'       => array(
			array(
				'key'           => 'field_contact_v1_hero_title',
				'label'         => 'Hero title',
				'name'          => 'hero_title',
				'type'          => 'text',
				'default_value' => 'Get a factory-direct quotation',
			),
			array(
				'key'           => 'field_contact_v1_hero_intro',
				'label'         => 'Hero intro',
				'name'          => 'hero_intro',
				'type'          => 'textarea',
				'rows'          => 3,
				'default_value' => 'Tell us the model, quantity and destination port — our export desk replies within one business day.',
			),
			array(
				'key'           => 'field_contact_v1_email',
				'label'         => 'Email',
				'name'          => 'email',
				'type'          => 'email',
				'default_value' => 'sales@example.com',
			),
			array(
				'key'           => 'field_contact_v1_phone',
				'label'         => 'Phone',
				'name'          => 'phone',
				'type'          => 'text',
				'default_value' => '+86 000 0000 0000',
			),
			array(
				'key'           => 'field_contact_v1_whatsapp',
				'label'         => 'WhatsApp',
				'name'          => 'whatsapp',
				'type'          => 'text',
			),
			array(
				'key'           => 'field_contact_v1_address',
				'label'         => 'Address',
				'name'          => 'address',
				'type'          => 'text',
				'default_value' => 'Demo Industrial Park, China',
			),
			array(
				'key'           => 'field_contact_v1_hours',
				'label'         => 'Business hours',
				'name'          => 'hours',
				'type'          => 'text',
				'default_value' => 'Mon–Sat, 8:30–18:00 (GMT+8)',
			),
			array(
				'key'           => 'field_contact_v1_form_title',
				'label'         => 'Form panel title',
				'name'          => 'form_title',
				'type'          => 'text',
				'default_value' => 'Request a quote',
			),
			array(
				'key'           => 'field_contact_v1_form_id',
				'label'         => 'Fluent Forms form ID',
				'name'          => 'form_id',
				'type'          => 'number',
				'default_value' => 1,
				'instructions'  => 'Used only when Fluent Forms is active.',
			),
		),
		'location'     => array(
			array(
				array(
					'param'    => 'page_template',
					'operator' => '==',
					'value'    => 'page-contact-v1.php',
				),
			),
		),
		'show_in_rest' => 1,
	)
);
