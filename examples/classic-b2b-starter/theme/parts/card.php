<?php
/**
 * Universal content card. $args: title_tag (h2|h3), kind (product|industry|guide|post).
 *
 * @package b2b-starter
 */

$kind = $args['kind'] ?? (string) get_post_type();
$kind = str_contains($kind, 'product') ? 'product' : (str_contains($kind, 'industry') ? 'industry' : (str_contains($kind, 'guide') ? 'guide' : 'post'));
$title_tag = ($args['title_tag'] ?? 'h2') === 'h3' ? 'h3' : 'h2';

$chip = '';
if ($kind === 'product') {
    $terms = get_the_terms(get_the_ID(), 'product_collection');
    if (is_array($terms) && $terms && !is_wp_error($terms[0])) {
        $chip = $terms[0]->name;
    }
} elseif ($kind === 'industry') {
    $chip = 'Solution';
} elseif ($kind === 'guide') {
    $chip = esc_html(get_the_date());
}
?>
<article class="card">
	<a class="card-media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true"><?php Starter\Theme\card_media($kind); ?></a>
	<div class="card-body">
		<?php if ($chip !== '') : ?><span class="card-chip"><?php echo esc_html($chip); ?></span><?php endif; ?>
		<<?php echo esc_html($title_tag); ?> class="card-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></<?php echo esc_html($title_tag); ?>>
		<p class="excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 22)); ?></p>
		<span class="more"><?php echo esc_html($kind === 'product' ? 'View product' : ($kind === 'industry' ? 'View solution' : 'Read guide')); ?></span>
	</div>
</article>
