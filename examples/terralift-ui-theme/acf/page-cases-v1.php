<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'acf_add_local_field_group' ) ) {
	return;
}

acf_add_local_field_group(
	array(
		'key'          => 'group_page_cases_v1',
		'title'        => 'Cases page v1',
		'fields'       => array(
			array(
				'key'           => 'field_cases_v1_hero_eyebrow',
				'label'         => 'Hero eyebrow',
				'name'          => 'hero_eyebrow',
				'type'          => 'text',
				'default_value' => 'Application cases',
			),
			array(
				'key'           => 'field_cases_v1_hero_title',
				'label'         => 'Hero title',
				'name'          => 'hero_title',
				'type'          => 'text',
				'default_value' => 'Proven in the field',
			),
			array(
				'key'           => 'field_cases_v1_hero_intro',
				'label'         => 'Hero intro',
				'name'          => 'hero_intro',
				'type'          => 'textarea',
				'rows'          => 3,
				'default_value' => 'How TerraLift machines perform on real job sites — construction, agriculture and municipal work.',
			),
		),
		'location'     => array(
			array(
				array(
					'param'    => 'page_template',
					'operator' => '==',
					'value'    => 'page-cases-v1.php',
				),
			),
		),
		'show_in_rest' => 1,
	)
);
