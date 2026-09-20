<?php
if (!defined('ABSPATH')) { exit; }
require_once get_theme_file_path( 'patterns.php' );

add_action('after_setup_theme', function () {
    load_theme_textdomain('terralift-ui', get_theme_file_path('languages'));
    add_theme_support('title-tag');
    add_theme_support('automatic-feed-links');
    add_theme_support('post-thumbnails');
    add_theme_support('editor-styles');
    add_editor_style('style.css');
});

/**
 * ACF-safe field read: falls back to default when ACF is inactive so free
 * templates never fatal (audit P1-02). Mirrors get_field signature subset.
 */
function tl_field(string $key, $post_id = false, string $default = '', bool $format = true) {
    if (!function_exists('get_field')) {
        return $default;
    }
    $value = get_field($key, $post_id, $format);
    return ($value === null || $value === '') ? $default : $value;
}

/**
 * Portable internal page URL resolved from the page slug at runtime
 * (audit P1-04): no hardcoded environment paths in templates.
 */
function tl_page_url(string $slug): string {
    static $cache = [];
    if (!isset($cache[$slug])) {
        $page = get_page_by_path($slug);
        $cache[$slug] = $page ? get_permalink($page) : home_url('/' . $slug . '/');
    }
    return (string) $cache[$slug];
}

// Search must cover products and cases, not just posts (audit P1-11).
add_action('pre_get_posts', function ($query) {
    if (is_admin() || !$query instanceof WP_Query || !$query->is_main_query() || !$query->is_search()) {
        return;
    }
    $query->set('post_type', ['post', 'page', 'oct_product', 'oct_case']);
});

add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('terralift-ui', get_stylesheet_uri(), [], wp_get_theme()->get('Version'));
});

// Page-level ACF field groups live beside their templates: one file per group in acf/,
// named after the page template it serves (page-contact-v1.php pairs page-contact-v1 template).
// Requires ACF; CPT field groups stay centralized in the octopus-site plugin.
add_action('after_setup_theme', function () {
    $dir = get_theme_file_path('acf');
    if (!is_dir($dir)) {
        return;
    }
    foreach (glob($dir . '/*.php') ?: [] as $file) {
        require_once $file;
    }
});



/** PHP pages render their content before this shell, like template-canvas.php.
 * Never render a part twice: block rendering can enqueue modules or run filters.
 */
function tl_render_document(string $content): void {
    ob_start();
    block_template_part('header');
    $header = (string) ob_get_clean();
    ob_start();
    block_template_part('footer');
    $footer = (string) ob_get_clean();
    ?>
    <!DOCTYPE html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta charset="<?php bloginfo('charset'); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <?php wp_head(); ?>
    </head>
    <body <?php body_class(); ?>>
    <?php wp_body_open(); ?>
    <a class="skip-link screen-reader-text" href="#tl-main">Skip to content</a>
    <div class="wp-site-blocks">
        <?php echo $header, $content, $footer; // Already rendered/escaped by templates and WordPress. ?>
    </div>
    <?php wp_footer(); ?>
    </body>
    </html>
    <?php
}

function tl_term_url(WP_Term $term): string {
    $url = get_term_link($term);
    return is_wp_error($url) ? (string) get_post_type_archive_link('oct_product') : $url;
}

/** Preserve explicitly configured external enquiry channels; add context locally. */
function tl_enquiry_url(int $product_id, string $configured = ''): string {
    $contact = tl_page_url('terralift-contact');
    if ($configured === '' || $configured === '/contact/' || $configured === '/terralift-contact/') {
        $configured = $contact;
    }
    if (str_starts_with($configured, '/') && !str_starts_with($configured, '//')) {
        $configured = home_url($configured);
    }
    if (untrailingslashit($configured) === untrailingslashit($contact)) {
        return add_query_arg('product', $product_id, $contact);
    }
    return $configured;
}

/** Normalize theme block links without writing over editor-owned block content. */
add_filter('render_block', static function (string $html): string {
    if (!class_exists('WP_HTML_Tag_Processor')) { return $html; }
    $tags = new WP_HTML_Tag_Processor($html);
    while ($tags->next_tag('a')) {
        $href = $tags->get_attribute('href');
        if (!is_string($href) || !str_starts_with($href, '/') || str_starts_with($href, '//')) { continue; }
        if ($href === '/terralift-equipment/' || $href === '/products/') {
            $url = get_post_type_archive_link('oct_product');
        } elseif ($href === '/contact/' || $href === '/terralift-contact/') {
            $url = tl_page_url('terralift-contact');
        } else {
            $url = home_url($href);
        }
        $tags->set_attribute('href', $url);
    }
    return $tags->get_updated_html();
}, 20);

// The previous catalogue page remains in the CMS; its public URL is an alias.
add_action('template_redirect', static function (): void {
    if (is_page('terralift-equipment') && !is_preview()) {
        $archive = get_post_type_archive_link('oct_product');
        if ($archive) { wp_safe_redirect($archive, 301); exit; }
    }
});
