<?php
/**
 * NOVALUX B2B seed. Invoked by harness as:
 * wp eval-file seed.php <staged-media-map> <staged-site-data>
 */

if (!defined('ABSPATH')) {
    exit('CLI only');
}

function novalux_upsert(string $post_type, string $slug, array $payload): int {
    $existing = get_page_by_path($slug, OBJECT, [$post_type]);
    $fields = [
        'post_type' => $post_type,
        'post_status' => $payload['status'] ?? 'publish',
        'post_name' => $slug,
        'post_title' => $payload['title'],
        'post_content' => $payload['content'] ?? '',
        'post_excerpt' => $payload['excerpt'] ?? '',
    ];
    $post_id = $existing instanceof WP_Post
        ? wp_update_post(array_merge($fields, ['ID' => $existing->ID]), true)
        : wp_insert_post($fields, true);
    if (is_wp_error($post_id)) {
        throw new RuntimeException("Seed post {$slug} failed: " . $post_id->get_error_message());
    }
    return (int) $post_id;
}

function novalux_delete_by_slug(string $slug, array $types): void {
    $found = get_page_by_path($slug, OBJECT, $types);
    if ($found instanceof WP_Post) {
        wp_delete_post($found->ID, true);
    }
}

function novalux_thumbnail(int $post_id, array $map, string $key, string $alt): void {
    if ($key === '' || !isset($map[$key])) {
        return;
    }
    $attachment_id = (int) $map[$key];
    set_post_thumbnail($post_id, $attachment_id);
    if ($alt !== '') {
        update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt);
    }
}

function novalux_specs(array $rows): array {
    $output = [];
    foreach ($rows as $row) {
        $output[] = [
            'field_nova_spec_label' => (string) ($row['label'] ?? ''),
            'field_nova_spec_value' => (string) ($row['value'] ?? ''),
        ];
    }
    return $output;
}

function novalux_rebuild_menu(array $items): void {
    // Fresh acceptance site: remove every nav item, including orphans with empty object_id.
    $all_items = get_posts(['post_type' => 'nav_menu_item', 'numberposts' => -1, 'fields' => 'ids']);
    foreach ($all_items as $item_id) {
        wp_delete_post((int) $item_id, true);
    }

    $menu = wp_get_nav_menu_object('Primary');
    $menu_id = $menu ? (int) $menu->term_id : (int) wp_create_nav_menu('Primary');
    if (is_wp_error($menu_id) || $menu_id <= 0) {
        throw new RuntimeException('Seed menu failed');
    }

    foreach ($items as $item) {
        $args = [
            'menu-item-title' => $item['label'],
            'menu-item-status' => 'publish',
            'menu-item-menu-item-parent' => 0,
        ];
        if (!empty($item['object_id'])) {
            $args['menu-item-type'] = 'post_type';
            $args['menu-item-object'] = 'page';
            $args['menu-item-object-id'] = (int) $item['object_id'];
        } else {
            $args['menu-item-type'] = 'custom';
            $args['menu-item-object'] = 'custom';
            $args['menu-item-url'] = (string) $item['url'];
        }
        $created = wp_update_nav_menu_item($menu_id, 0, $args);
        if (is_wp_error($created)) {
            throw new RuntimeException('Seed menu item failed: ' . $created->get_error_message());
        }
    }

    $locations = get_nav_menu_locations();
    $locations['primary'] = $menu_id;
    set_theme_mod('nav_menu_locations', $locations);
}

/* ---------- Load staged inputs ---------- */

$media_map_file = isset($args[0]) ? $args[0] : '';
$data_file = isset($args[1]) ? $args[1] : '';
if ($media_map_file === '' || !file_exists($media_map_file)) {
    throw new RuntimeException('Media map argument is required');
}
if ($data_file === '' || !file_exists($data_file)) {
    throw new RuntimeException('Site data argument is required');
}
$media_map = json_decode((string) file_get_contents($media_map_file), true);
$data = json_decode((string) file_get_contents($data_file), true);
if (!is_array($media_map) || !is_array($data)) {
    throw new RuntimeException('Seed inputs are invalid');
}

/* ---------- Remove v1 acceptance content ---------- */

novalux_delete_by_slug('modular-surface-system', ['cleanroom_product']);
novalux_delete_by_slug('cleanroom-site-handover-checklist', ['post']);
novalux_delete_by_slug('request-a-quote', ['page']);
$legacy_term = term_exists('precision-surfaces', 'product_collection');
if (is_array($legacy_term)) {
    wp_delete_term((int) reset($legacy_term), 'product_collection');
}
$legacy_media = get_posts(['post_type' => 'attachment', 'title' => 'modular-surface-system', 'numberposts' => 1]);
foreach ($legacy_media as $attachment) {
    wp_delete_attachment((int) $attachment->ID, true);
}

/* ---------- Product categories ---------- */

$term_ids = [];
foreach ($data['terms'] ?? [] as $row) {
    $existing = term_exists($row['slug'], 'product_collection');
    if (is_array($existing)) {
        $term_id = (int) reset($existing);
        wp_update_term($term_id, 'product_collection', ['name' => $row['name'], 'description' => $row['description']]);
    } else {
        $created = wp_insert_term($row['name'], 'product_collection', ['slug' => $row['slug'], 'description' => $row['description']]);
        if (is_wp_error($created)) {
            throw new RuntimeException('Seed term failed: ' . $created->get_error_message());
        }
        $term_id = (int) $created['term_id'];
    }
    $term_ids[$row['slug']] = $term_id;
}

/* ---------- Products ---------- */

$product_ids = [];
foreach ($data['products'] ?? [] as $product) {
    $product_id = novalux_upsert('cleanroom_product', $product['slug'], $product);
    $product_ids[] = $product_id;
    $assigned = array_values(array_intersect_key($term_ids, array_flip($product['terms'] ?? [])));
    if ($assigned) {
        wp_set_object_terms($product_id, $assigned, 'product_collection', false);
    }
    novalux_thumbnail($product_id, $media_map, $product['image_key'] ?? '', $product['image_alt'] ?? '');
    if (function_exists('update_field')) {
        $acf = $product['acf'] ?? [];
        foreach (['wattage', 'efficacy', 'ip_rating', 'warranty'] as $scalar) {
            if (isset($acf[$scalar])) {
                update_field($scalar, (string) $acf[$scalar], $product_id);
            }
        }
        if (isset($acf['specs'])) {
            // Free ACF has no repeater field: store rows as "Label | Value" lines in a textarea.
            foreach (array_keys(get_post_meta($product_id)) as $meta_key) {
                if (preg_match('/^specs(_\d+_)?/', $meta_key) || $meta_key === 'field_nova_spec_table') { delete_post_meta($product_id, $meta_key); }
            }
            $lines = implode("\n", array_map(
                static fn (array $row): string => trim((string) ($row['label'] ?? '')) . ' | ' . trim((string) ($row['value'] ?? '')),
                is_array($acf['specs']) ? $acf['specs'] : []
            ));
            if (function_exists('update_field')) {
                update_field('field_nova_spec_table', $lines, $product_id);
            } else {
                update_post_meta($product_id, 'spec_table', $lines);
            }
        }
    }
}

/* ---------- Industries ---------- */

$industry_ids = [];
foreach ($data['industries'] ?? [] as $industry) {
    $industry_id = novalux_upsert('cleanroom_industry', $industry['slug'], $industry);
    $industry_ids[] = $industry_id;
    novalux_thumbnail($industry_id, $media_map, $industry['image_key'] ?? '', $industry['image_alt'] ?? '');
    if (function_exists('update_field')) {
        update_field('field_nova_industry_challenge', (string) ($industry['acf']['challenge'] ?? ''), $industry_id);
        update_field('field_nova_industry_outcome', (string) ($industry['acf']['outcome'] ?? ''), $industry_id);
    }
}

/* ---------- Guides and news ---------- */

$guide_ids = [];
foreach ($data['guides'] ?? [] as $guide) {
    $guide_id = novalux_upsert('cleanroom_guide', $guide['slug'], $guide);
    $guide_ids[] = $guide_id;
    novalux_thumbnail($guide_id, $media_map, $guide['image_key'] ?? '', $guide['image_alt'] ?? '');
}

$news_ids = [];
foreach ($data['news'] ?? [] as $news) {
    $news_ids[] = novalux_upsert('post', $news['slug'], $news);
}

/* ---------- Pages ---------- */

$page_ids = [];
foreach ($data['pages'] ?? [] as $key => $page) {
    $page = array_merge($page, ['status' => 'publish']);
    $page_ids[$key] = novalux_upsert('page', $page['slug'], $page);
}
update_option('show_on_front', 'page');
update_option('page_on_front', $page_ids['home']);

/* ---------- Navigation ---------- */

novalux_rebuild_menu([
    ['label' => 'Home', 'object_id' => $page_ids['home']],
    ['label' => 'Products', 'url' => (string) get_post_type_archive_link('cleanroom_product')],
    ['label' => 'Industries', 'url' => (string) get_post_type_archive_link('cleanroom_industry')],
    ['label' => 'Knowledge', 'url' => (string) get_post_type_archive_link('cleanroom_guide')],
    ['label' => 'About', 'object_id' => $page_ids['about']],
    ['label' => 'Contact', 'object_id' => $page_ids['contact']],
]);

flush_rewrite_rules();
wp_cache_flush();

echo wp_json_encode([
    'result' => 'ok',
    'products' => count($product_ids),
    'categories' => count($term_ids),
    'industries' => count($industry_ids),
    'guides' => count($guide_ids),
    'news' => count($news_ids),
    'pages' => count($page_ids),
]) . "\n";
