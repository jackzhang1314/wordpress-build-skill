<?php
/**
 * Field group for page-home-v1.php. Category showcase, featured machines and
 * case teasers are queried live — only hero and stats are editable fields.
 */

if ( ! function_exists( 'acf_add_local_field_group' ) ) {
	return;
}

$fields = array(
	array(
		'key'           => 'field_home_v1_hero_eyebrow',
		'label'         => 'Hero eyebrow',
		'name'          => 'hero_eyebrow',
		'type'          => 'text',
		'default_value' => 'Compact machinery · factory direct export',
	),
	array(
		'key'           => 'field_home_v1_hero_title',
		'label'         => 'Hero title',
		'name'          => 'hero_title',
		'type'          => 'text',
		'default_value' => 'TerraLift Machinery',
	),
	array(
		'key'           => 'field_home_v1_hero_intro',
		'label'         => 'Hero intro',
		'name'          => 'hero_intro',
		'type'          => 'textarea',
		'rows'          => 3,
		'default_value' => 'Mini excavators, loaders and skid steers built for distributors and rental fleets — verified spec sheets, stable lead times, export-grade packaging.',
	),
	array(
		'key'           => 'field_home_v1_hero_image',
		'label'         => 'Hero image',
		'name'          => 'hero_image',
		'type'          => 'image',
		'return_format' => 'url',
		'allow_in_bindings' => true,
	),
	array(
		'key'           => 'field_home_v1_cta_text',
		'label'         => 'Hero CTA text',
		'name'          => 'cta_text',
		'type'          => 'text',
		'default_value' => 'Browse the catalogue',
	),
	array(
		'key'           => 'field_home_v1_cta_url',
		'label'         => 'Hero CTA URL',
		'name'          => 'cta_url',
		'type'          => 'url',
		'default_value' => '/products/',
	),
);

for ( $i = 1; $i <= 4; $i++ ) {
	$fields[] = array(
		'key'   => "field_home_v1_stat_{$i}_value",
		'label' => "Stat {$i} value",
		'name'  => "stat_{$i}_value",
		'type'  => 'text',
	);
	$fields[] = array(
		'key'   => "field_home_v1_stat_{$i}_label",
		'label' => "Stat {$i} label",
		'name'  => "stat_{$i}_label",
		'type'  => 'text',
	);
}

acf_add_local_field_group(
	array(
		'key'          => 'group_page_home_v1',
		'title'        => 'Home page v1',
		'fields'       => $fields,
		'location'     => array(
			array(
				array(
					'param'    => 'page_template',
					'operator' => '==',
					'value'    => 'page-home-v1.php',
				),
			),
		),
		'show_in_rest' => 1,
	)
);
