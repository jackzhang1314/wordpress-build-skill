<?php
if (!defined('ABSPATH')) exit('CLI only');
$media_file = isset($args[0]) ? $args[0] : '';
if (!$media_file || !file_exists($media_file)) WP_CLI::error('Media map file is required as argument 1.');
$media = json_decode(file_get_contents($media_file), true);
if (!is_array($media)) WP_CLI::error('Invalid media map.');
$GLOBALS['irontrack_media'] = $media;
$data_file = dirname(__DIR__, 2) . '/current/site-data.json';
foreach ([dirname(__FILE__) . '/../content/site-data.json', '/tmp/irontrack-seed/site-data.json', '/tmp/irontrack-site-data.json'] as $candidate) if (file_exists($candidate)) { $data_file = $candidate; break; }
$data = json_decode(file_get_contents($data_file), true);
if (!is_array($data)) WP_CLI::error('Invalid site data.');

WP_CLI::log('Updating core settings...');
update_option('blogname', 'IRONTRACK PARTS');
update_option('blogdescription', 'Excavator undercarriage and wear parts manufacturer');
update_option('timezone_string', 'Asia/Shanghai');
update_option('start_of_week', 1);
update_option('date_format', 'F j, Y');
update_option('permalink_structure', '/%postname%/');
update_option('default_comment_status', 'closed');
update_option('default_ping_status', 'closed');
update_option('thumbnail_crop', 1);

function irontrack_term($taxonomy, $item) {
    $item['name'] = html_entity_decode((string)$item['name'], ENT_QUOTES, 'UTF-8');
    $existing = get_term_by('slug', $item['slug'], $taxonomy);
    if ($existing) {
        wp_update_term($existing->term_id, $taxonomy, ['name'=>$item['name'],'description'=>$item['description']]);
        return $existing->term_id;
    }
    $result = wp_insert_term($item['name'], $taxonomy, ['slug'=>$item['slug'],'description'=>$item['description']]);
    if (is_wp_error($result)) WP_CLI::error('Term insert failed: ' . $result->get_error_message());
    return (int)$result['term_id'];
}
function irontrack_media_id($key) { global $irontrack_media; return isset($irontrack_media[$key]) ? (int)$irontrack_media[$key] : 0; }
function irontrack_upsert_page($key, $page) {
    $existing = get_page_by_path($page['slug'], OBJECT, 'page');
    $payload = ['post_title'=>$page['title'],'post_name'=>$page['slug'],'post_status'=>'publish','post_type'=>'page','post_content'=>''];
    if ($existing) { $payload['ID']=$existing->ID; $page_id=wp_update_post($payload, true); }
    else $page_id=wp_insert_post($payload, true);
    if (is_wp_error($page_id)) WP_CLI::error('Page insert failed: ' . $page_id->get_error_message());
    if (!empty($page['template'])) update_post_meta($page_id, '_wp_page_template', $page['template']);
    update_post_meta($page_id, 'rank_math_title', $page['title'] . ' | IRONTRACK PARTS');
    return (int)$page_id;
}

WP_CLI::log('Creating component families and brands...');
$categories = []; $brands = [];
foreach ($data['terms'] as $item) {
    $taxonomy = $item['taxonomy']; $term_id = irontrack_term($taxonomy, $item);
    if ($taxonomy === 'it_category') { $categories[$item['name']] = $term_id; $image_id = irontrack_media_id($item['image_key']); if ($image_id) update_term_meta($term_id, 'family_image', wp_get_attachment_url($image_id)); }
    else $brands[$item['name']] = $term_id;
}

WP_CLI::log('Creating pages...');
$page_ids = [];
foreach ($data['pages'] as $key => $page) $page_ids[$key] = irontrack_upsert_page($key, $page);
$front_id = $page_ids['products']; // placeholder to avoid undefined if privacy omitted
$front_id = get_option('page_on_front') ?: 0;
if (!$front_id) {
    $front = get_page_by_path('home', OBJECT, 'page');
    if (!$front) {
        $front_id = wp_insert_post(['post_title'=>'Home','post_name'=>'home','post_status'=>'publish','post_type'=>'page','post_content'=>''], true);
        if (is_wp_error($front_id)) WP_CLI::error($front_id->get_error_message());
    } else $front_id = $front->ID;
}
update_post_meta($front_id, '_wp_page_template', 'default');
update_post_meta($front_id, 'rank_math_title', 'Excavator Undercarriage & Wear Parts Manufacturer | IRONTRACK PARTS');
update_post_meta($front_id, 'rank_math_description', 'IRONTRACK PARTS manufactures excavator track chains, rollers, sprockets, bucket teeth, hydraulic and engine replacement parts with controlled quality and export packing.');
update_post_meta($front_id, 'page_kicker', 'Excavator parts manufacturer & exporter');
update_post_meta($front_id, 'page_hero', 'Undercarriage and wear parts engineered for downtime reduction');
update_post_meta($front_id, 'page_lead', 'Controlled heat treatment, material traceability and inspection reporting for Komatsu, Caterpillar, Hitachi, Volvo, Doosan and Hyundai fleets.');
if ($hero_id = irontrack_media_id('factory-1')) update_post_meta($front_id, 'hero_image', $hero_id);
update_field('home_statement', '<p>IRONTRACK PARTS supports distributors, rental fleets and mining contractors with repeatable quality, stable lead times and mixed-container export packing.</p>', $front_id);
update_field('home_stats', [['number'=>'12+','label'=>'Years in excavator components'],['number'=>'50+','label'=>'Export markets served'],['number'=>'2,400+','label'=>'Active references supported'],['number'=>'98.4%','label'=>'Orders accepted on first inspection']], $front_id);
update_field('families_heading', 'Core component families', $front_id);
update_field('families_intro', 'Buy by component family, equipment brand or reference number. Every product page contains fitment, material and export data.', $front_id);
update_field('quality_heading', 'Manufacturing you can audit', $front_id);
update_field('quality_intro', 'Our Ningbo factory combines forged bodies, induction hardening and CNC finishing with batch-level inspection. You receive material certificates, hardness reports and packing photographs before shipment.', $front_id);
update_field('quality_cards', [
    ['title'=>'Material control','text'=>'Alloy steel batches are checked for composition and traceability before forging or casting.'],
    ['title'=>'Heat treatment','text'=>'Quenching and induction hardening are controlled against hardness windows, not visual appearance.'],
    ['title'=>'Machining & assembly','text'=>'Dimensional gauges, seal leak tests and torque checks protect field fitment.'],
    ['title'=>'Export readiness','text'=>'Rust prevention, crating, photos and batch labels are standardized across orders.'],
], $front_id);
update_field('guides_heading', 'Parts buying guides', $front_id);
update_option('show_on_front', 'page'); update_option('page_on_front', $front_id);

// About page.
$about_id = $page_ids['about'];
update_post_meta($about_id, 'page_kicker', 'Factory & export team'); update_post_meta($about_id, 'page_hero', 'A specialist excavator parts manufacturer, not a general trading desk'); update_post_meta($about_id, 'page_lead', 'IRONTRACK combines forging, machining, heat treatment and export service under one procurement interface for distributors and fleet owners.');
$hero_about = irontrack_media_id('factory-1'); if ($hero_about) update_post_meta($about_id, 'hero_image', $hero_about);
wp_update_post(['ID'=>$about_id,'post_content'=>"<p>IRONTRACK PARTS was established to solve a recurring B2B problem: buyers could find low prices, but could not easily obtain material evidence, dimensional accountability or predictable export packing. We built a focused factory system around excavator undercarriage, ground engaging and hydraulic components.</p>\n<p>Our engineering desk supports OEM number matching, drawings, samples and batch inspection. Our export desk consolidates mixed models into labeled pallets and provides photographs before container loading.</p>\n<p>We work with dealers, rental companies, mining contractors and maintenance workshops that need stable replacement supply rather than one-off transactions.</p>"]);
update_field('values', [
    ['title'=>'Fitment first','text'=>'We confirm pitch, width, bolt-hole pitch, seal type and serial options before a quotation is released.'],
    ['title'=>'Evidence over adjectives','text'=>'Material certificates, hardness ranges, leak tests and packing photos are part of the sales process.'],
    ['title'=>'Repeatable quality','text'=>'Production batches are archived so a reorder follows the same measured specification, not a vague description.'],
    ['title'=>'Transparent lead time','text'=>'We quote production plus sea transit realistically and flag capacity constraints before deposit.'],
], $about_id);
$factory_id = irontrack_media_id('workshop-4'); if ($factory_id) update_field('factory_image', $factory_id, $about_id);
update_field('factory_caption', 'Digital caliper inspection of a forged component before export approval.', $about_id);

// Quality page.
$quality_id = $page_ids['quality'];
update_post_meta($quality_id, 'page_kicker', 'Quality & testing'); update_post_meta($quality_id, 'page_hero', 'Batch-level evidence from material to packing'); update_post_meta($quality_id, 'page_lead', 'Our quality system is designed for repeat B2B orders: measurable hardness, dimensional checks, leak tests, packing photos and traceable batches.');
$hero_quality = irontrack_media_id('workshop-4'); if ($hero_quality) update_post_meta($quality_id, 'hero_image', $hero_quality);
$factory_detail = irontrack_media_id('workshop-4'); if ($factory_detail) update_post_meta($quality_id, 'factory_detail_image', $factory_detail);
wp_update_post(['ID'=>$quality_id,'post_content'=>"<p>Every quotation can include the inspection evidence needed for your purchasing standard. We do not expect buyers to judge induction hardening from a photograph alone.</p>"]);
update_field('quality_intro', "<p>Production follows a documented route: incoming material check, forging or casting, heat treatment, machining, assembly, pressure or leak testing, final dimensional sampling, rust protection and export packing.</p>", $quality_id);
update_field('controls', [
    ['title'=>'Incoming material control','text'=>'Chemical composition and mill certificates are reviewed for each alloy-steel batch. Nonconforming material is quarantined before cutting.'],
    ['title'=>'Dimensional control','text'=>'Pitch, bore, bolt-hole pitch, flange height and shoe width are checked with calipers, gauges and location fixtures.'],
    ['title'=>'Heat-treatment control','text'=>'Surface and core hardness are sampled at defined intervals; furnace records and part numbers are retained for traceability.'],
    ['title'=>'Seal & hydraulic tests','text'=>'Rollers and idlers are pressure tested for oil retention. Hydraulic pumps receive function, leakage and control-response records.'],
    ['title'=>'Final inspection & packing','text'=>'Rust preventive oil, end caps, foam fixation and moisture barriers are applied according to part family.'],
    ['title'=>'Batch traceability','text'=>'Order, heat-treatment batch, inspection result and pallet label are linked for future warranty review.'],
], $quality_id);
update_field('documents', [
    ['title'=>'Material certificate','text'=>'Shows alloy grade, heat number and supplier certificate reference.'],
    ['title'=>'Hardness report','text'=>'Surface/core ranges for chains, rollers, sprockets, shoes or GET.'],
    ['title'=>'Dimensional report','text'=>'Pitch, width, bore, bolt-hole pitch and critical tolerances.'],
    ['title'=>'Leak/function test record','text'=>'Roller/idler leak test or hydraulic pump test data with tested range.'],
    ['title'=>'Packing evidence','text'=>'Photos after final packing and container loading.'],
    ['title'=>'Commercial set','text'=>'Invoice, packing list, HS codes and batch-linked pallet list.'],
], $quality_id);

// Contact page.
$contact_id = $page_ids['contact'];
update_post_meta($contact_id, 'page_kicker', 'RFQ desk'); update_post_meta($contact_id, 'page_hero', 'Send a machine model, part number or failed component'); update_post_meta($contact_id, 'page_lead', 'Tell us the quantity, destination port and target date. Our export team replies with price, packing and lead time—normally within one business day.');
$hero_contact = irontrack_media_id('factory-1'); if ($hero_contact) update_post_meta($contact_id, 'hero_image', $hero_contact);
wp_update_post(['ID'=>$contact_id,'post_content'=>"<p>Use the RFQ form below for the fastest response. Include the exact part number, machine serial prefix or a clear photograph of the worn component.</p>"]);

// Privacy page.
$privacy_id = $page_ids['privacy'];
wp_update_post(['ID'=>$privacy_id,'post_content'=>"<p>IRONTRACK PARTS collects only the business contact and technical information submitted through the RFQ form. We use it to prepare quotations, arrange samples, support warranty cases and manage your order.</p><p>We do not sell RFQ data. Records are retained for commercial traceability and can be corrected on written request.</p>"]);

WP_CLI::log('Creating products...');
foreach ($data['parts'] as $part) {
    $existing = get_page_by_path($part['slug'], OBJECT, 'it_part');
    $payload = ['post_title'=>$part['title'],'post_name'=>$part['slug'],'post_status'=>'publish','post_type'=>'it_part','post_excerpt'=>$part['excerpt'],'post_content'=>"<p>Request current production lead time, export packing and quantity pricing. Our team confirms fitment against the machine model and serial prefix before release.</p>"];
    $post_id = $existing ? wp_update_post(['ID'=>$existing->ID] + $payload, true) : wp_insert_post($payload, true);
    if (is_wp_error($post_id)) WP_CLI::error('Part insert failed: ' . $post_id->get_error_message());
    wp_set_object_terms($post_id, [$categories[$part['category']]], 'it_category', false);
    $brand_ids = []; foreach ($part['brands'] as $brand) $brand_ids[] = $brands[$brand];
    wp_set_object_terms($post_id, $brand_ids, 'it_brand', false);
    update_field('summary', $part['summary'], $post_id);
    update_field('oem_numbers', $part['oem'], $post_id);
    update_field('fitment', $part['fitment'], $post_id);
    update_field('specs', array_map(function($row){ return ['label'=>$row[0],'value'=>$row[1]]; }, $part['specs']), $post_id);
    update_field('quality_points', $part['quality'], $post_id);
    update_field('packaging', $part['packaging'], $post_id);
    update_field('lead_time', '15–25 days after deposit and drawing confirmation', $post_id);
    update_field('moq', 'Negotiable; mixed models can be consolidated', $post_id);
    update_field('warranty', '12 months against manufacturing defects under normal working conditions', $post_id);
    update_field('cta_note', 'Send your machine model and part number for a same-week quotation.', $post_id);
    if ($image_id = irontrack_media_id($part['image_key'])) { update_field('primary_image', $image_id, $post_id); set_post_thumbnail($post_id, $image_id); }
    $gallery_keys = ['workshop-4','parts-group']; $gallery = [];
    foreach ($gallery_keys as $gk) if ($gid=irontrack_media_id($gk)) $gallery[] = $gid;
    update_field('gallery', $gallery, $post_id);
    update_post_meta($post_id, 'rank_math_title', $part['title'] . ' | ' . $part['category'] . ' Supplier | IRONTRACK');
    update_post_meta($post_id, 'rank_math_description', $part['excerpt']);
    update_post_meta($post_id, 'rank_math_robots', ['index'=>'index','follow'=>'follow']);
}

WP_CLI::log('Creating guides...');
foreach ($data['guides'] as $index => $guide) {
    $existing = get_page_by_path($guide['slug'], OBJECT, 'it_guide');
    $payload = ['post_title'=>$guide['title'],'post_name'=>$guide['slug'],'post_status'=>'publish','post_type'=>'it_guide','post_excerpt'=>$guide['excerpt'],'post_content'=>$guide['content'],'post_date'=>gmdate('Y-m-d H:i:s', strtotime('-' . ($index+1) . ' days'))];
    $post_id = $existing ? wp_update_post(['ID'=>$existing->ID] + $payload, true) : wp_insert_post($payload, true);
    if (is_wp_error($post_id)) WP_CLI::error('Guide insert failed: ' . $post_id->get_error_message());
    update_field('reading_time', $guide['reading_time'], $post_id);
    update_field('takeaways', [['text'=>'Match five dimensions before price discussion.'],['text'=>'Ask for material and hardness evidence, not generic claims.'],['text'=>'Use packing and batch labels to simplify warranty review.']], $post_id);
    if ($image_id = irontrack_media_id($guide['image_key'])) set_post_thumbnail($post_id, $image_id);
    update_post_meta($post_id, 'rank_math_title', $guide['title'] . ' | IRONTRACK PARTS');
    update_post_meta($post_id, 'rank_math_description', $guide['excerpt']);
    update_post_meta($post_id, 'rank_math_robots', ['index'=>'index','follow'=>'follow']);
}

WP_CLI::log('Creating navigation...');
$menu_name = 'Primary'; $menu = wp_get_nav_menu_object($menu_name);
if (!$menu) $menu_id = wp_create_nav_menu($menu_name); else $menu_id = $menu->term_id;
foreach (get_posts(['post_type'=>'nav_menu_item','numberposts'=>-1,'post_status'=>'any']) as $orphan) wp_delete_post($orphan->ID, true);
$nav_pages = ['products'=>'Products','parts'=>'Parts','guides'=>'Guides','quality'=>'Quality','about'=>'About','contact'=>'Contact'];
foreach ($nav_pages as $key => $label) {
    if (in_array($key, ['parts','guides'], true)) {
        $type = $key === 'parts' ? 'it_part' : 'it_guide';
        $url = get_post_type_archive_link($type);
        if (!$url) continue;
        wp_update_nav_menu_item($menu_id, 0, ['menu-item-title'=>$label,'menu-item-url'=>$url,'menu-item-status'=>'publish','menu-item-type'=>'custom']);
    } else {
        wp_update_nav_menu_item($menu_id, 0, ['menu-item-title'=>$label,'menu-item-object-id'=>$page_ids[$key],'menu-item-object'=>'page','menu-item-status'=>'publish','menu-item-type'=>'post_type']);
    }
}
$locations = get_theme_mod('nav_menu_locations', []); $locations['primary']=$menu_id; set_theme_mod('nav_menu_locations', $locations);

WP_CLI::success('IRONTRACK content seeded successfully.');
