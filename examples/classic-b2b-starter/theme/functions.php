<?php
namespace Starter\Theme;
defined('ABSPATH') || exit;

require_once get_theme_file_path('inc/components.php');
require_once get_theme_file_path('inc/page-data.php');
require_once get_theme_file_path('inc/blog.php');

add_action('after_setup_theme', static function (): void {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
    add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
    register_nav_menus(['primary' => __('Primary navigation', 'b2b-starter')]);
});

add_action('wp_enqueue_scripts', static function (): void {
    $ver = wp_get_theme()->get('Version');
    wp_enqueue_style('starter', get_stylesheet_uri(), [], $ver);
    wp_enqueue_script('starter-nav', get_theme_file_uri('assets/js/nav.js'), [], $ver, ['in_footer' => true]);
});

add_action('wp_head', static function (): void {
    $font = get_theme_file_uri('assets/fonts/InterVariable.woff2');
    echo '<link rel="preload" href="' . esc_url($font) . '" as="font" type="font/woff2" crossorigin>' . "\n";
    echo '<meta name="theme-color" content="#ffffff">' . "\n";
    $icon = get_theme_file_uri('assets/favicon.svg');
    echo '<link rel="icon" href="' . esc_url($icon) . '" type="image/svg+xml">' . "\n";
}, 1);

/* Highlight the matching section (Products / Industries / Knowledge) on
   single posts, terms and archives even though the menu only lists the
   archive pages. */
add_filter('nav_menu_css_class', static function (array $classes, $item): array {
    $map = [
        'starter_product' => 'products',
        'starter_industry' => 'industries',
        'starter_guide' => 'guides',
    ];
    $type = '';
    if (is_singular(array_keys($map))) {
        $type = get_post_type();
    } elseif (is_post_type_archive(array_keys($map))) {
        $type = get_query_var('post_type');
    } elseif (is_tax('product_collection')) {
        $type = 'starter_product';
    }
    if ($type === '' || !isset($map[$type])) return $classes;
    $candidates = [trailingslashit((string) get_post_type_archive_link($type))];
    if (is_singular($type)) {
        $terms = get_the_terms(get_the_ID(), 'product_collection');
        if (is_array($terms) && $terms) {
            foreach ($terms as $term) {
                $link = get_term_link($term);
                if (!is_wp_error($link)) $candidates[] = trailingslashit((string) $link);
            }
        }
    }
    if (in_array(trailingslashit((string) ($item->url ?? '')), $candidates, true)) {
        $classes[] = 'current-menu-item';
        $classes[] = 'current-menu-ancestor';
    }
    return $classes;
}, 10, 2);

function field_text(string $name, $object = false): string {
    $value = function_exists('get_field') ? get_field($name, $object) : '';
    return is_string($value) ? $value : '';
}

function field_option(string $name): string {
    $value = function_exists('get_field') ? get_field($name, 'option') : '';
    return is_string($value) ? $value : '';
}

/** Parse plain lines from an ACF option field (with built-in fallback). */
function field_lines_option(string $name, string $fallback = ''): array {
    $raw = field_option($name);
    if (trim($raw) === '') $raw = $fallback;
    return array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) $raw) ?: []), static fn ($line) => $line !== ''));
}

/** Parse "Label | Value" lines from a field (with built-in fallback). */
function field_rows(string $name, $source = null, string $fallback = ''): array {
    $raw = field_text($name, $source);
    if (trim($raw) === '') $raw = $fallback;
    return lines_rows($raw);
}

/** Parse plain lines from a field (with built-in fallback). */
function field_lines(string $name, $source = null, string $fallback = ''): array {
    $raw = field_text($name, $source);
    if (trim($raw) === '') $raw = $fallback;
    return array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) $raw) ?: []), static fn ($line) => $line !== ''));
}

function lines_rows(string $raw): array {
    if (trim($raw) === '') return [];
    $rows = [];
    foreach (preg_split('/\r?\n/', $raw) as $line) {
        if (trim($line) === '') continue;
        $parts = array_map('trim', explode('|', $line, 2));
        if (count($parts) === 2 && $parts[0] !== '') {
            $rows[] = ['label' => $parts[0], 'value' => $parts[1]];
        }
    }
    return $rows;
}

/** Generic starter fallbacks; business copy belongs in editable fields. */
function category_defaults(string $slug): array {
    return [
        'intro' => '',
        'features' => '',
        'applications' => '',
        'faq' => '',
    ];
}

/** Starter ships no business claims; ACF seed and admin content own those. */
function factory_defaults(): array {
    return ['intro' => '', 'stats' => '', 'capabilities' => ''];
}

/** First sentences of raw content, heading-safe (tags become spaces). */
function trimmed_intro(int $words = 26): string {
    $text = preg_replace('/<[^>]+>/', ' ', (string) get_the_content());
    $text = preg_replace('/\s+/', ' ', trim((string) $text));
    return wp_trim_words($text, $words, '…');
}

/** Breadcrumb trail for inner pages. */
function breadcrumbs(): void {
    $trail = [['label' => 'Home', 'url' => home_url('/')]];
    $current = '';

    if (is_singular('starter_product')) {
        $trail[] = ['label' => 'Products', 'url' => get_post_type_archive_link('starter_product')];
        $terms = get_the_terms(get_the_ID(), 'product_collection');
        if (is_array($terms) && $terms && !is_wp_error($terms[0])) {
            $trail[] = ['label' => $terms[0]->name, 'url' => get_term_link($terms[0])];
        }
        $current = get_the_title();
    } elseif (is_singular('starter_industry')) {
        $trail[] = ['label' => 'Industries', 'url' => get_post_type_archive_link('starter_industry')];
        $current = get_the_title();
    } elseif (is_singular('starter_guide')) {
        $trail[] = ['label' => 'Knowledge', 'url' => get_post_type_archive_link('starter_guide')];
        $current = get_the_title();
    } elseif (is_singular()) {
        $current = get_the_title();
    } elseif (is_post_type_archive('starter_product')) {
        $current = 'Product catalogue';
    } elseif (is_post_type_archive('starter_industry')) {
        $current = 'Industry solutions';
    } elseif (is_post_type_archive('starter_guide')) {
        $current = 'Knowledge guides';
    } elseif (is_tax()) {
        $trail[] = ['label' => 'Products', 'url' => get_post_type_archive_link('starter_product')];
        $current = single_term_title('', false);
    } elseif (is_search()) {
        $current = 'Search results';
    } elseif (is_404()) {
        $current = 'Page not found';
    } else {
        $current = wp_strip_all_tags(get_the_archive_title());
    }

    $html = '<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>';
    foreach ($trail as $crumb) {
        $html .= '<li><a href="' . esc_url($crumb['url']) . '">' . esc_html($crumb['label']) . '</a></li>';
    }
    $html .= '<li aria-current="page">' . esc_html((string) $current) . '</li></ol></nav>';
    echo $html; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped above
}

/** Neutral aspect-ratio placeholder for the starter template. */
function media_placeholder(string $kind = 'product', string $label = '', string $class = '', string $dimension = ''): string {
    $dimensions = [
        'hero' => '1600 × 1000 · 16:10',
        'product' => '1200 × 900 · 4:3',
        'industry' => '1600 × 1000 · 16:10',
        'guide' => '1200 × 900 · 4:3',
        'page' => '1200 × 900 · 4:3',
        'category' => '1400 × 1050 · 4:3',
    ];
    $dimension = $dimension !== '' ? $dimension : ($dimensions[$kind] ?? $dimensions['product']);
    $screen_reader = $label !== '' ? '<span class="screen-reader-text">' . esc_html($label) . '</span>' : '';
    $aria = $label !== '' ? ' role="img" aria-label="' . esc_attr($label) . ' image placeholder"' : ' aria-hidden="true"';
    $cls = trim('media-fallback ' . $class);
    return '<span class="' . esc_attr($cls) . '"' . $aria . '><span class="media-frame" aria-hidden="true"></span><span class="media-label">' . esc_html($dimension) . '</span>' . $screen_reader . '</span>';
}

/** Featured image or styled placeholder for a post. */
function card_media(string $kind = 'product'): void {
    if (has_post_thumbnail()) {
        the_post_thumbnail('medium_large', ['class' => 'card-img']);
    } else {
        echo media_placeholder($kind);
    }
}

function spec_rows($source = null): array {
    return field_rows('spec_table', $source);
}

function contact_url(string $product = ''): string {
    $url = home_url('/contact/');
    return $product === '' ? $url : add_query_arg('product', $product, $url);
}

/**
 * Get a Customizer setting with fallback.
 */
function get_setting(string $key, string $fallback = ''): string {
    $val = get_theme_mod($key, '');
    return $val !== '' ? $val : $fallback;
}

function term_cards(string $taxonomy): void {
    $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);
    if (is_wp_error($terms) || !$terms) return;
    echo '<div class="grid term-grid">';
    foreach ($terms as $term) {
        $url = get_term_link($term);
        if (is_wp_error($url)) continue;
        $icons = ['industrial' => 'factory', 'outdoor' => 'sun', 'commercial-indoor' => 'building', 'food-grade' => 'shield'];
        $slug = isset($icons[$term->slug]) ? $icons[$term->slug] : 'factory';
        printf(
            '<a class="term-card" href="%1$s"><span class="term-icon term-icon-%4$s" aria-hidden="true">%3$s</span><h3>%2$s</h3><p>%5$s</p></a>',
            esc_url($url),
            esc_html($term->name),
            term_icon_svg($slug),
            esc_attr($slug),
            esc_html(wp_trim_words($term->description, 18))
        );
    }
    echo '</div>';
}

function term_icon_svg(string $name): string {
    $paths = [
        'factory' => '<path d="M3 21V9l6 4V9l6 4V9l6 4v8z"/><path d="M17 9V3h3v8"/><path d="M7 17h2M12 17h2M17 17h2"/>',
        'sun' => '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2 2M17.5 17.5l2 2M19.5 4.5l-2 2M6.5 17.5l-2 2"/>',
        'building' => '<rect x="4" y="3" width="12" height="18" rx="1"/><path d="M16 9h4v12h-4"/><path d="M8 7h2M12 7h2M8 11h2M12 11h2M8 15h2M12 15h2"/>',
        'shield' => '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
    ];
    $path = $paths[$name] ?? $paths['factory'];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' . $path . '</svg>';
}
add_action('widgets_init', function () {
    register_sidebar(['name' => __('Sidebar', 'b2b-starter'), 'id' => 'sidebar-1', 'before_widget' => '<section class="widget">', 'after_widget' => '</section>', 'before_title' => '<h2 class="widget-title">', 'after_title' => '</h2>']);
});

/**
 * Customizer: site-wide editable settings.
 * All values accessible via Starter\Theme\get_setting( $key ).
 */
add_action('customize_register', function ($wp_customize) {
    $wp_customize->add_section('contact_info', [
        'title'    => __('Contact & Brand Info', 'b2b-starter'),
        'priority' => 30,
    ]);
    $fields = [
        'contact_email'    => ['label' => __('Contact Email', 'b2b-starter'), 'default' => 'sales@yourcompany.com', 'type' => 'text'],
        'contact_phone'    => ['label' => __('Phone', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'contact_hours'    => ['label' => __('Working Hours', 'b2b-starter'), 'default' => 'Mon–Fri, 9:00–18:00 (GMT+8)', 'type' => 'text'],
        'topbar_text'      => ['label' => __('Topbar Text', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'footer_about'     => ['label' => __('Footer About Text', 'b2b-starter'), 'default' => '', 'type' => 'textarea'],
        'social_linkedin'  => ['label' => __('LinkedIn URL', 'b2b-starter'), 'default' => '', 'type' => 'url'],
        'social_youtube'   => ['label' => __('YouTube URL', 'b2b-starter'), 'default' => '', 'type' => 'url'],
        'stat_1_value'     => ['label' => __('Stat 1 Value', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'stat_1_label'     => ['label' => __('Stat 1 Label', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'stat_2_value'     => ['label' => __('Stat 2 Value', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'stat_2_label'     => ['label' => __('Stat 2 Label', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'stat_3_value'     => ['label' => __('Stat 3 Value', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'stat_3_label'     => ['label' => __('Stat 3 Label', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'cta_title'        => ['label' => __('CTA Title', 'b2b-starter'), 'default' => '', 'type' => 'text'],
        'cta_text'         => ['label' => __('CTA Text', 'b2b-starter'), 'default' => '', 'type' => 'textarea'],
    ];
    foreach ($fields as $key => $args) {
        $wp_customize->add_setting($key, [
            'default'           => $args['default'],
            'sanitize_callback' => $args['type'] === 'textarea' ? 'wp_kses_post' : 'sanitize_text_field',
        ]);
        $wp_customize->add_control($key, [
            'label'   => $args['label'],
            'section' => 'contact_info',
            'type'    => $args['type'] === 'textarea' ? 'textarea' : 'text',
        ]);
    }
});
