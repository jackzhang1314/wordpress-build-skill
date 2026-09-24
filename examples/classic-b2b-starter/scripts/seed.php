<?php
/**
 * B2B Starter seed. Invoked by harness as:
 * wp eval-file seed.php <staged-media-map> <staged-site-data>
 */

if (!defined('ABSPATH')) {
    exit('CLI only');
}

function starter_upsert(string $post_type, string $slug, array $payload): int {
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

function starter_delete_by_slug(string $slug, array $types): void {
    $found = get_page_by_path($slug, OBJECT, $types);
    if ($found instanceof WP_Post) {
        wp_delete_post($found->ID, true);
    }
}

function starter_thumbnail(int $post_id, array $map, string $key, string $alt): void {
    if ($key === '' || !isset($map[$key])) {
        return;
    }
    $attachment_id = (int) $map[$key];
    set_post_thumbnail($post_id, $attachment_id);
    if ($alt !== '') {
        update_post_meta($attachment_id, '_wp_attachment_image_alt', $alt);
    }
}

function starter_delete_legacy_post_meta(): void {
    global $wpdb;
    $keys = [
        'category_intro', '_category_intro',
        'category_features', '_category_features',
        'category_applications', '_category_applications',
        'category_faq', '_category_faq',
        'category_cta_title', '_category_cta_title',
        'category_cta_text', '_category_cta_text',
        'category_cta_button', '_category_cta_button',
        'product_applications', '_product_applications',
        'product_documents', '_product_documents',
        'field_starter_industry_challenge',
        'field_starter_industry_outcome',
    ];
    $placeholders = implode(',', array_fill(0, count($keys), '%s'));
    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->postmeta} WHERE meta_key IN ({$placeholders})", $keys));
}

function starter_rebuild_nav_enabled(): bool {
    global $args;
    $enabled = isset($args[2]) ? $args[2] : 'true';
    return trim((string) $enabled) !== 'false';
}

function starter_specs(array $rows): array {
    $output = [];
    foreach ($rows as $row) {
        $output[] = [
            'field_starter_spec_label' => (string) ($row['label'] ?? ''),
            'field_starter_spec_value' => (string) ($row['value'] ?? ''),
        ];
    }
    return $output;
}

function starter_add_menu_item(array $item, int $menu_id, int $parent_id = 0): int {
    $args = [
        'menu-item-title' => $item['label'],
        'menu-item-status' => 'publish',
        'menu-item-parent-id' => $parent_id,
    ];

    if (!empty($item['term_id'])) {
        $args['menu-item-type'] = 'taxonomy';
        $args['menu-item-object'] = $item['taxonomy'] ?? 'product_collection';
        $args['menu-item-object-id'] = (int) $item['term_id'];
        $args['menu-item-url'] = (string) get_term_link((int) $item['term_id'], $args['menu-item-object']);
    } elseif (!empty($item['object_id'])) {
        $args['menu-item-type'] = 'post_type';
        $args['menu-item-object'] = 'page';
        $args['menu-item-object-id'] = (int) $item['object_id'];
        $args['menu-item-url'] = (string) get_permalink((int) $item['object_id']);
    } else {
        $args['menu-item-type'] = 'custom';
        $args['menu-item-object'] = 'custom';
        $args['menu-item-url'] = (string) $item['url'];
    }

    $created = wp_update_nav_menu_item($menu_id, 0, $args);
    if (is_wp_error($created)) {
        throw new RuntimeException('Seed menu item failed: ' . $created->get_error_message());
    }
    $item_id = (int) $created;

    foreach ($item['children'] ?? [] as $child) {
        starter_add_menu_item($child, $menu_id, $item_id);
    }

    return $item_id;
}

function starter_rebuild_menu(array $items): void {
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
        starter_add_menu_item($item, $menu_id);
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

starter_delete_legacy_post_meta();
starter_delete_by_slug('modular-surface-system', ['starter_product']);
starter_delete_by_slug('starter-site-handover-checklist', ['post']);
starter_delete_by_slug('request-a-quote', ['page']);
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
    if (function_exists('update_field') && !empty($row['acf'])) {
        foreach ($row['acf'] as $field_name => $field_value) {
            // ACF requires the qualified term object id; a bare numeric term id is treated as a post id.
            update_field($field_name, (string) $field_value, 'product_collection_' . $term_id);
        }
    }
    $term_ids[$row['slug']] = $term_id;
}

/* ---------- Products ---------- */

$product_ids = [];
foreach ($data['products'] ?? [] as $product) {
    $product_id = starter_upsert('starter_product', $product['slug'], $product);
    $product_ids[] = $product_id;
    $assigned = array_values(array_intersect_key($term_ids, array_flip($product['terms'] ?? [])));
    if ($assigned) {
        wp_set_object_terms($product_id, $assigned, 'product_collection', false);
    }
    starter_thumbnail($product_id, $media_map, $product['image_key'] ?? '', $product['image_alt'] ?? '');
    if (function_exists('update_field')) {
        $acf = $product['acf'] ?? [];
        // Remove v1 lighting-specific scalar fields so admin sees one generic contract.
        foreach (['wattage', 'efficacy', 'ip_rating', 'field_starter_wattage', 'field_starter_efficacy', 'field_starter_ip'] as $legacy) {
            delete_post_meta($product_id, $legacy);
        }
        foreach (['quick_specs', 'at_a_glance', 'product_highlights', 'spec_table', 'product_faq', 'product_shipping_terms', 'product_details_title', 'warranty', 'lead_time', 'moq', 'customization_note', 'product_cta_note', 'product_cta_label', 'product_trust_points'] as $field_name) {
            if (isset($acf[$field_name])) {
                $value = $acf[$field_name];
                if (is_array($value)) {
                    $is_rows = isset($value[0]) && is_array($value[0]);
                    $value = implode("\n", array_map(
                        static fn ($row) => $is_rows
                            ? trim((string) ($row['label'] ?? '')) . ' | ' . trim((string) ($row['value'] ?? ''))
                            : trim((string) $row),
                        $value
                    ));
                }
                update_field($field_name, $value, $product_id);
            }
        }
        update_field('related_products', [], $product_id);
    }
}

/* ---------- Industries ---------- */

$industry_ids = [];
foreach ($data['industries'] ?? [] as $industry) {
    $industry_id = starter_upsert('starter_industry', $industry['slug'], $industry);
    $industry_ids[] = $industry_id;
    starter_thumbnail($industry_id, $media_map, $industry['image_key'] ?? '', $industry['image_alt'] ?? '');
    if (function_exists('update_field')) {
        update_field('challenge', (string) ($industry['acf']['challenge'] ?? ''), $industry_id);
        update_field('outcome', (string) ($industry['acf']['outcome'] ?? ''), $industry_id);
    }
}

/* ---------- Guides and news ---------- */

$guide_ids = [];
foreach ($data['guides'] ?? [] as $guide) {
    $guide_id = starter_upsert('starter_guide', $guide['slug'], $guide);
    $guide_ids[] = $guide_id;
    starter_thumbnail($guide_id, $media_map, $guide['image_key'] ?? '', $guide['image_alt'] ?? '');
}

$news_ids = [];
foreach ($data['news'] ?? [] as $news) {
    $news_ids[] = starter_upsert('post', $news['slug'], $news);
}

/* ---------- Pages ---------- */

$page_ids = [];
$page_templates = [
    'about' => 'page-templates/about.php',
    'contact' => 'page-templates/contact.php',
];
foreach ($data['pages'] ?? [] as $key => $page) {
    $page = array_merge($page, ['status' => 'publish']);
    $page_ids[$key] = starter_upsert('page', $page['slug'], $page);
    if (isset($page_templates[$key])) {
        update_post_meta($page_ids[$key], '_wp_page_template', $page_templates[$key]);
    }
}
update_option('show_on_front', 'page');
update_option('page_on_front', $page_ids['home']);

/* ---------- Editable global options ---------- */

if (function_exists('update_field') && !empty($data['global_options'])) {
    foreach ($data['global_options'] as $option_name => $option_value) {
        update_field($option_name, (string) $option_value, 'option');
    }
}

/* ---------- Navigation ---------- */

$product_children = array_values(array_map(
    static fn (string $slug, int $term_id): array => [
        'label' => get_term($term_id, 'product_collection')->name,
        'term_id' => $term_id,
        'taxonomy' => 'product_collection',
    ],
    array_keys($term_ids),
    array_values($term_ids)
));
$industry_children = array_values(array_map(
    static fn (int $post_id): array => [
        'label' => get_the_title($post_id),
        'url' => get_permalink($post_id),
    ],
    $industry_ids
));
$guide_children = array_values(array_map(
    static fn (int $post_id): array => [
        'label' => get_the_title($post_id),
        'url' => get_permalink($post_id),
    ],
    $guide_ids
));

if (starter_rebuild_nav_enabled()) {
starter_rebuild_menu([
    ['label' => 'Home', 'object_id' => $page_ids['home']],
    [
        'label' => 'Products',
        'url' => (string) get_post_type_archive_link('starter_product'),
        'children' => $product_children,
    ],
    [
        'label' => 'Industries',
        'url' => (string) get_post_type_archive_link('starter_industry'),
        'children' => $industry_children,
    ],
    [
        'label' => 'Knowledge',
        'url' => (string) get_post_type_archive_link('starter_guide'),
        'children' => $guide_children,
    ],
    ['label' => 'About', 'object_id' => $page_ids['about']],
    ['label' => 'Contact', 'object_id' => $page_ids['contact']],
]);
}

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
