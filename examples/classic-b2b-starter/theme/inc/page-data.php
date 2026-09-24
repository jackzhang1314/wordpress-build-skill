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
    return field_lines($name);
}

function global_text(string $name, string $fallback = ''): string {
    $value = field_option($name);
    return trim($value) !== '' ? $value : $fallback;
}

function enabled(string $name): bool {
    $value = function_exists('get_field') ? get_field($name) : null;
    return $value === null ? true : (bool) $value;
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
        $stats = array_map(
            static fn (array $row): array => ['value' => $row['label'], 'label' => $row['value']],
            field_rows('factory_stats', 'option', $factory['stats'])
        );
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
    if (!$quick_specs && trim((string) field_text('warranty', $post_id)) !== '') {
        $quick_specs = [['label' => 'Warranty', 'value' => field_text('warranty', $post_id)]];
    }

    $at_a_glance = lines('at_a_glance', $post_id);
    if (!$at_a_glance) {
        $at_a_glance = lines('product_highlights', $post_id);
    }
    if (!$at_a_glance) {
        $at_a_glance = lines('product_trust_points', $post_id);
    }

    $documents = [];
    foreach (lines('product_documents', $post_id) as $document) {
        $parts = array_map('trim', explode('|', (string) $document, 2));
        $label = $parts[0] ?? '';
        $url = $parts[1] ?? '';
        $documents[] = [
            'label' => $label,
            'url' => $url,
            'is_link' => $url !== '' && (str_starts_with($url, 'http://') || str_starts_with($url, 'https://') || str_starts_with($url, '/')),
        ];
    }

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
    $commercial_facts = [
        ['label' => 'Warranty', 'value' => text('warranty', $post_id)],
        ['label' => 'MOQ', 'value' => text('moq', $post_id)],
        ['label' => 'Lead time', 'value' => text('lead_time', $post_id)],
        ['label' => 'Trade terms', 'value' => text('product_shipping_terms', $post_id)],
    ];

    $content = (string) get_the_content();
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
        'key_attributes' => $quick_specs,
        'at_a_glance' => array_slice($at_a_glance, 0, 4),
        'commercial_facts' => $commercial_facts,
        'customization' => text('customization_note', $post_id),
        'specifications' => field_rows('spec_table', $post_id),
        'applications' => lines('product_applications', $post_id),
        'documents' => $documents,
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
    return [
        'intro' => text('category_intro', $term_id, wp_strip_all_tags((string) term_description($term))),
        'features' => rows('category_features', $term_id),
        'applications' => lines('category_applications', $term_id),
        'faq' => rows('category_faq', $term_id),
        'cta' => [
            'title' => text('category_cta_title', $term_id, 'Request a quotation'),
            'description' => text('category_cta_text', $term_id, 'Send your requirement and receive a project-specific response.'),
            'button_label' => text('category_cta_button', $term_id, 'Contact us'),
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
