<?php
/**
 * Page controllers. Templates ask for data here; views never query the database.
 *
 * @package b2b-starter
 */

namespace Starter\Theme;

defined('ABSPATH') || exit;

function text(string $name, $source = null, string $fallback = ''): string {
    $value = field_text($name, $source);
    return trim($value) !== '' ? $value : $fallback;
}

function rows(string $name, $source = null, array $fallback = []): array {
    $raw = field_text($name, $source);
    if (trim($raw) === '') {
        return $fallback;
    }
    return lines_rows($raw);
}

function lines(string $name, $source = null, array $fallback = []): array {
    $raw = field_text($name, $source);
    if (trim($raw) === '') {
        return $fallback;
    }
    return array_values(array_filter(array_map('trim', preg_split('/\\r?\\n/', $raw) ?: []), static fn ($line) => $line !== ''));
}

function global_text(string $name, string $fallback = ''): string {
    $value = field_option($name);
    return trim($value) !== '' ? $value : $fallback;
}

function enabled(string $name): bool {
    $value = function_exists('get_field') ? get_field($name) : null;
    return $value === null ? true : (bool) $value;
}

function factory_profile_data(): array {
    $proof = value_rows(field_text('factory_stats', 'option'));
    $capabilities = field_rows('factory_capabilities', 'option');
    $certifications = lines('factory_certifications', 'option');
    $process = rows('factory_process', 'option');
    $quality_tests = lines('factory_quality_tests', 'option');
    $markets = global_text('factory_markets');

    return [
        'intro' => global_text('factory_intro'),
        'proof' => $proof,
        'capabilities' => $capabilities,
        'certifications' => $certifications,
        'process' => $process,
        'quality_tests' => $quality_tests,
        'markets' => $markets,
        'has_core_proof' => (bool) ($proof || $capabilities || $certifications || $markets),
        'has_manufacturing' => (bool) ($capabilities || $process || $quality_tests),
    ];
}

function homepage_data(): array {
    $factory = factory_defaults();
    $stats = [];
    foreach ([1, 2, 3] as $index) {
        $stats[] = [
            'value' => get_setting("stat_{$index}_value"),
            'label' => get_setting("stat_{$index}_label"),
        ];
    }
    if (!array_filter($stats, static fn (array $item): bool => trim((string) $item['value']) !== '')) {
            $stats = value_rows(field_text('factory_stats', 'option'));
    }

    return [
        'overline' => text('home_overline', false, 'Export-ready manufacturer'),
        'description' => text('home_description', false),
        'stats' => array_slice($stats, 0, 4),
        'sections' => [
            'applications' => [
                'enabled' => enabled('show_applications'),
                'title' => text('applications_title', false, 'Browse by application'),
                'count' => max(1, min(12, (int) (get_field('applications_count') ?: 12))),
            ],
            'products' => [
                'enabled' => enabled('show_featured_products'),
                'title' => text('featured_products_title', false, 'Featured products'),
                'count' => max(1, min(12, (int) (get_field('featured_products_count') ?: 6))),
            ],
            'industries' => [
                'enabled' => enabled('show_industries'),
                'title' => text('industries_title', false, 'Industry solutions'),
                'count' => max(1, min(12, (int) (get_field('industries_count') ?: 3))),
            ],
            'guides' => [
                'enabled' => enabled('show_guides'),
                'title' => text('guides_title', false, 'Buyer guides'),
                'count' => max(1, min(12, (int) (get_field('guides_count') ?: 3))),
            ],
        ],
        'cta' => [
            'title' => text('home_cta_title', false, get_setting('cta_title', 'Tell us about your project')),
            'description' => text('home_cta_text', false, get_setting('cta_text', 'Send specifications or a short brief and receive an itemised response.')),
            'button_label' => text('home_cta_button', false, 'Request a quote'),
            'url' => contact_url(),
        ],
    ];
}

function about_data(): array {
    $factory = factory_defaults();
    return [
        'stats' => array_map(
            static fn (array $row): array => ['value' => $row['label'], 'label' => $row['value']],
            field_rows('factory_stats', 'option', $factory['stats'])
        ),
        'capabilities' => field_rows('factory_capabilities', 'option', $factory['capabilities']),
        'cta' => [
            'title' => global_text('about_cta_title', 'Discuss your requirements'),
            'description' => global_text('about_cta_text', 'Share your target market, quantity and timeline.'),
            'button_label' => global_text('about_cta_button', 'Contact our team'),
            'url' => contact_url(),
        ],
    ];
}

function contact_data(): array {
    return [
        'intro' => text('contact_intro', null, 'Send project details and receive a direct response from the responsible team.'),
        'checklist' => lines('contact_checklist', null, [
            'Product type and application',
            'Quantity and delivery window',
            'Target market or certification requirement',
            'Drawings, schedule or a short project brief',
        ]),
        'form_title' => text('form_title', null, 'Request for quotation'),
        'form_note' => text('form_note', null, 'Attachments and detailed specifications are welcome.'),
        'response_promise' => global_text('response_promise', 'Every enquiry receives a human reply within one working day.'),
    ];
}

function product_gallery_images(int $post_id): array {
    $images = [];
    $featured_id = (int) get_post_thumbnail_id($post_id);
    if ($featured_id > 0) {
        $images[] = normalize_product_image(['id' => $featured_id]);
    }
    $slots = function_exists('get_field') ? [
        get_field('product_gallery_1', $post_id),
        get_field('product_gallery_2', $post_id),
        get_field('product_gallery_3', $post_id),
        get_field('product_gallery_4', $post_id),
        get_field('product_gallery_5', $post_id),
    ] : [];

    foreach ($slots as $image) {
        if (is_numeric($image)) {
            $image = ['id' => (int) $image];
        }
        if (!is_array($image) || empty($image)) {
            continue;
        }
        $images[] = normalize_product_image($image);
    }

    $unique = [];
    foreach ($images as $image) {
        $key = (string) ($image['id'] > 0 ? 'id-' . $image['id'] : 'url-' . $image['url']);
        if (trim((string) $image['url']) === '' || isset($unique[$key])) {
            continue;
        }
        $unique[$key] = $image;
    }
    return array_values($unique);
}

function normalize_product_image(array $image): array {
    $id = (int) ($image['ID'] ?? $image['id'] ?? 0);
    $url = (string) ($image['url'] ?? '');
    $alt = (string) ($image['alt'] ?? '');
    $caption = (string) ($image['caption'] ?? '');

    if ($id > 0) {
        $url = $url !== '' ? $url : (string) wp_get_attachment_image_url($id, 'large');
        $alt = $alt !== '' ? $alt : (string) get_post_meta($id, '_wp_attachment_image_alt', true);
        $attachment = get_post($id);
        if ($attachment instanceof \WP_Post) {
            $caption = $caption !== '' ? $caption : (string) $attachment->post_excerpt;
        }
    }

    return [
        'id' => $id,
        'url' => $url,
        'alt' => $alt,
        'caption' => $caption,
    ];
}

function product_data(): array {
    $post_id = (int) get_the_ID();
    $quick_specs = rows('quick_specs', $post_id);

    $terms = get_the_terms($post_id, 'product_collection');
    $primary_term = is_array($terms) && isset($terms[0]) && !is_wp_error($terms[0]) ? $terms[0] : null;
    $category = [];
    if ($primary_term) {
        $term_url = get_term_link($primary_term);
        if (!is_wp_error($term_url)) {
            $category = ['name' => (string) $primary_term->name, 'url' => (string) $term_url];
        }
    }

    $related = get_field('related_products', $post_id);

    $content = (string) get_post_field('post_content', $post_id);
    return [
        'gallery' => product_gallery_images($post_id),
        'title' => (string) get_the_title(),
        'category' => $category,
        'excerpt' => (string) get_the_excerpt(),
        'value_chips' => array_slice($quick_specs, 0, 3),
        'cta' => [
            'label' => text('product_cta_label', $post_id, 'Request pricing'),
            'note' => global_text('response_promise', 'Every enquiry receives a human reply within one working day.'),
            'url' => contact_url((string) get_the_title()),
        ],
        'specifications' => field_rows('spec_table', $post_id),
        'faq' => rows('product_faq', $post_id),
        'details' => [
            'title' => text('product_details_title', $post_id, 'Product details'),
            'has_content' => trim($content) !== '',
        ],
        'related_ids' => is_array($related) ? array_values(array_filter(array_map('intval', $related))) : [],
    ];
}

function product_category_data($term = null): array {
    $term = $term instanceof \WP_Term ? $term : get_queried_object();
    if (!$term instanceof \WP_Term) return [];

    $term_id = (int) $term->term_id;
    $object_id = 'product_collection_' . $term_id;
    $parse_resources = static function (array $items): array {
        $rows = [];
        foreach ($items as $item) {
            $parts = array_map('trim', explode('|', (string) $item, 2));
            $label = $parts[0] ?? '';
            $url = $parts[1] ?? '';
            if ($label === '') continue;
            $rows[] = [
                'label' => $label,
                'url' => $url,
                'is_link' => $url !== '' && (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')),
            ];
        }
        return $rows;
    };

    $hero_image = function_exists('get_field') ? get_field('category_hero_image', $object_id) : null;
    if (is_numeric($hero_image)) $hero_image = ['id' => (int) $hero_image];
    $hero_image = is_array($hero_image) ? normalize_product_image($hero_image) : [];

    $related_terms = get_terms([
        'taxonomy' => 'product_collection',
        'hide_empty' => false,
        'exclude' => [$term_id],
        'number' => 6,
    ]);
    $related_categories = [];
    if (is_array($related_terms)) {
        foreach ($related_terms as $related_term) {
            $url = get_term_link($related_term);
            if (is_wp_error($url)) continue;
            $related_categories[] = [
                'name' => (string) $related_term->name,
                'url' => (string) $url,
                'description' => wp_trim_words(wp_strip_all_tags((string) $related_term->description), 18, '…'),
            ];
        }
    }

    return [
        'name' => (string) $term->name,
        'slug' => (string) $term->slug,
        'overline' => text('category_overline', $object_id, 'Product range'),
        'intro' => text('category_intro', $object_id, wp_strip_all_tags((string) term_description($term))),
        'hero_image' => $hero_image,
        'key_facts' => rows('category_key_facts', $object_id),
        'features' => rows('category_features', $object_id),
        'selection_guide' => rows('category_selection_guide', $object_id),
        'specifications' => rows('category_specifications', $object_id),
        'applications' => lines('category_applications', $object_id),
        'use_cases' => rows('category_use_cases', $object_id),
        'standards' => lines('category_standards', $object_id),
        'process' => rows('category_process', $object_id),
        'checklist' => lines('category_checklist', $object_id),
        'resources' => $parse_resources(lines('category_resources', $object_id)),
        'faq' => rows('category_faq', $object_id),
        'long_description' => (string) (function_exists('get_field') ? get_field('category_long_description', $object_id) : ''),
        'related_categories' => $related_categories,
        'cta' => [
            'title' => text('category_cta_title', $object_id, 'Request a quotation'),
            'description' => text('category_cta_text', $object_id, 'Send your requirement and receive a project-specific response.'),
            'button_label' => text('category_cta_button', $object_id, 'Contact us'),
            'url' => contact_url($term->name),
        ],
    ];
}

function industry_data(): array {
    $post_id = (int) get_the_ID();
    return [
        'challenge' => text('challenge', $post_id),
        'outcome' => text('outcome', $post_id),
        'cta' => [
            'title' => text('industry_cta_title', $post_id, 'Planning a similar project?'),
            'description' => text('industry_cta_text', $post_id, 'Share your requirements for a tailored recommendation.'),
            'button_label' => text('industry_cta_button', $post_id, 'Discuss this application'),
            'url' => contact_url(get_the_title()),
        ],
    ];
}

function archive_data(string $key, string $fallback): array {
    return ['description' => global_text($key . '_archive_description', $fallback)];
}
