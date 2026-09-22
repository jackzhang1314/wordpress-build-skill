<?php
namespace Hongda\Model;
defined('ABSPATH') || exit;
// Rank Math is the sole metadata owner. Business rules extend its public hooks.
add_filter('rank_math/frontend/robots',static function(array $robots): array {
    if (is_search() || ((is_post_type_archive('hd_product') || is_tax('hd_category')) && isset($_GET['max_weight']))) {
        $robots['index']='noindex';
    }
    return $robots;
});
add_filter('rank_math/frontend/description',static function(string $description): string {
    if ($description === '' && is_post_type_archive(['hd_product','hd_solution'])) {
        return (string) get_queried_object()->description;
    }
    return $description;
});
// The block-template canvas prints its own title using Rank Math's title filter.
// Avoid a second title from Rank Math's head action.
add_action('wp_head',static function(): void {
    if (false !== has_action('wp_head','_block_template_render_title_tag')) {
        remove_action('rank_math/head','_wp_render_title_tag',1);
    }
},0);
