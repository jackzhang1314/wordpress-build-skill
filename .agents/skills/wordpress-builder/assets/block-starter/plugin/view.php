<?php
namespace Hongda\Model;
defined('ABSPATH') || exit;
function field(string $name, $id=false): string { $v=function_exists('get_field')?get_field($name,$id):''; return is_scalar($v)?(string)$v:''; }
function destination(string $key): string { $p=get_post((int)get_option('b2b_'.$key,0)); return $p instanceof \WP_Post && $p->post_type==='page' && $p->post_status==='publish'?get_permalink($p):home_url('/'); }
function enquiry(int $id=0): string { return $id?add_query_arg('product_id',$id,destination('contact_page')):destination('contact_page'); }
function families(): array { $t=get_terms(['taxonomy'=>'hd_category','hide_empty'=>false]); return is_wp_error($t)?[]:$t; }
function term_url(\WP_Term $t): string { $u=get_term_link($t); return is_wp_error($u)?home_url('/'):$u; }
function media(int $id, bool $hero=false): void {
    if(has_post_thumbnail($id)){echo get_the_post_thumbnail($id,'large',['loading'=>$hero?'eager':'lazy','fetchpriority'=>$hero?'high':'auto']);echo '<span class="image-note">Illustrative photograph</span>';return;}
    echo '<div class="media-placeholder"><span>'.esc_html(get_bloginfo('name')).'</span><small>Equipment image coming soon</small></div>';
}
function specs(string $name): void {
    $lines=preg_split('/\r\n|\r|\n/',field($name))?:[];
    echo '<dl class="specs">';
    foreach($lines as $line){ $row=explode('|',$line,2); if(count($row)!==2)continue; echo '<div><dt>'.esc_html(trim($row[0])).'</dt><dd>'.esc_html(trim($row[1])).'</dd></div>'; }
    echo '</dl>';
}
function card(): void { ?>
<article class="machine-card"><a class="machine-photo" href="<?php the_permalink(); ?>"><?php media(get_the_ID()); ?></a><div class="machine-info"><span class="eyebrow"><?php echo esc_html(field('model')); ?></span><h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3><p><?php echo esc_html(wp_trim_words(get_the_excerpt(),19)); ?></p><a class="text-link" href="<?php the_permalink(); ?>">View machine <span aria-hidden="true">↗</span></a></div></article>
<?php }
function product_grid(\WP_Query $q): void { echo '<div class="machine-grid">';while($q->have_posts()){$q->the_post();card();}echo '</div>';wp_reset_postdata(); }
function cta(): void { ?><section class="cta"><div class="wrap cta-inner"><div><span class="eyebrow">LET’S FIND YOUR MACHINE</span><h2>Tell us about your next job.</h2><p>Share your application, quantity and destination. Start with the right questions.</p></div><a class="button light" href="<?php echo esc_url(enquiry()); ?>">Discuss your requirements ↗</a></div></section><?php }
