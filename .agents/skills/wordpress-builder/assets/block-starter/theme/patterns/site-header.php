<?php
/**
 * Title: Equipment navigation
 * Slug: b2b-equipment/site-header
 * Categories: header
 * Inserter: no
 */
defined('ABSPATH') || exit;
?>
<!-- wp:group {"className":"header-shell","layout":{"type":"default"}} --><div class="wp-block-group header-shell">
<!-- wp:group {"className":"utility-bar","layout":{"type":"default"}} --><div class="wp-block-group utility-bar"><!-- wp:paragraph --><p>EXCAVATORS &amp; LOADERS · EQUIPMENT FOR YOUR NEXT PROJECT</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Illustrative catalogue preview</p><!-- /wp:paragraph --></div><!-- /wp:group -->
<!-- wp:group {"className":"site-header container","layout":{"type":"default"}} --><div class="wp-block-group site-header container">
<!-- wp:site-title {"level":0} /-->
<!-- wp:navigation {"overlayMenu":"mobile","ariaLabel":"Main navigation"} -->
<!-- wp:navigation-submenu <?php echo wp_json_encode(['label'=>'Products','url'=>get_post_type_archive_link('hd_product'),'kind'=>'custom']); ?> -->
<!-- wp:navigation-link <?php echo wp_json_encode(['label'=>'All equipment','url'=>get_post_type_archive_link('hd_product'),'kind'=>'custom']); ?> /-->
<?php $terms=get_terms(['taxonomy'=>'hd_category','hide_empty'=>false]);if(!is_wp_error($terms))foreach($terms as $term): $url=get_term_link($term);if(is_wp_error($url))continue; ?>
<!-- wp:navigation-link <?php echo wp_json_encode(['label'=>$term->name,'url'=>$url,'kind'=>'custom']); ?> /-->
<?php endforeach; ?>
<!-- /wp:navigation-submenu -->
<?php foreach(['Applications'=>get_post_type_archive_link('hd_solution'),'Buying guides'=>get_permalink((int)get_option('page_for_posts')),'About'=>\Hongda\Model\destination('about_page'),'Contact'=>\Hongda\Model\destination('contact_page')] as $label=>$url): ?>
<!-- wp:navigation-link <?php echo wp_json_encode(['label'=>$label,'url'=>$url,'kind'=>'custom']); ?> /-->
<?php endforeach; ?>
<!-- /wp:navigation -->
<!-- wp:buttons {"className":"header-quote"} --><div class="wp-block-buttons header-quote"><!-- wp:button {"className":"rfq-trigger"} --><div class="wp-block-button rfq-trigger"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url(\Hongda\Model\enquiry()); ?>">Request a quote ↗</a></div><!-- /wp:button --></div><!-- /wp:buttons -->
</div><!-- /wp:group --></div><!-- /wp:group -->
