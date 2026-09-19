<?php
/**
 * Field group for page-landing-v1.php — hero eyebrow/intro + CTA switch.
 */

if ( ! function_exists( 'acf_add_local_field_group' ) ) {
	return;
}

acf_add_local_field_group(
	array(
		'key'          => 'group_page_landing_v1',
		'title'        => 'Landing page v1',
		'fields'       => array(
			array(
				'key'           => 'field_landing_v1_hero_eyebrow',
				'label'         => 'Hero eyebrow',
				'name'          => 'hero_eyebrow',
				'type'          => 'text',
				'default_value' => 'TerraLift Machinery',
			),
			array(
				'key'           => 'field_landing_v1_hero_intro',
				'label'         => 'Hero intro',
				'name'          => 'hero_intro',
				'type'          => 'textarea',
				'rows'          => 2,
			),
			array(
				'key'           => 'field_landing_v1_hide_cta',
				'label'         => 'Hide bottom CTA band',
				'name'          => 'hide_cta',
				'type'          => 'true_false',
				'default_value' => 0,
				'message'       => 'Enable for pages that already end with a conversion path.',
			),
		),
		'location'     => array(
			array(
				array(
					'param'    => 'page_template',
					'operator' => '==',
					'value'    => 'page-landing-v1.php',
				),
			),
		),
		'show_in_rest' => 1,
	)
);
