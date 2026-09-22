<?php
/**
 * Title: Equipment footer
 * Slug: b2b-equipment/site-footer
 * Categories: footer
 * Inserter: no
 */
?>
<!-- wp:group {"className":"site-footer","layout":{"type":"default"}} --><div class="wp-block-group site-footer"><!-- wp:group {"className":"container footer-grid","layout":{"type":"default"}} --><div class="wp-block-group container footer-grid">
<!-- wp:group {"layout":{"type":"default"}} --><div class="wp-block-group"><!-- wp:site-title {"level":0} /--><!-- wp:paragraph --><p>Excavators and loaders.<br>Start with the work. Specify the machine.</p><!-- /wp:paragraph --></div><!-- /wp:group -->
<!-- wp:group {"layout":{"type":"default"}} --><div class="wp-block-group"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">Explore</h3><!-- /wp:heading -->
<?php foreach(['Equipment'=>get_post_type_archive_link('hd_product'),'Applications'=>get_post_type_archive_link('hd_solution'),'Buying guides'=>get_permalink((int)get_option('page_for_posts'))] as $label=>$url): ?>
<!-- wp:paragraph --><p><a href="<?php echo esc_url($url); ?>"><?php echo esc_html($label); ?></a></p><!-- /wp:paragraph --><?php endforeach; ?>
</div><!-- /wp:group --><!-- wp:group {"layout":{"type":"default"}} --><div class="wp-block-group"><!-- wp:heading {"level":3} --><h3 class="wp-block-heading">Your next project</h3><!-- /wp:heading --><!-- wp:paragraph --><p><a href="<?php echo esc_url(\Hongda\Model\destination('about_page')); ?>">About HONGDA</a></p><!-- /wp:paragraph --><!-- wp:paragraph --><p><a class="rfq-trigger" href="<?php echo esc_url(\Hongda\Model\enquiry()); ?>">Request a quote ↗</a></p><!-- /wp:paragraph --><!-- wp:paragraph --><p><a href="<?php echo esc_url(\Hongda\Model\enquiry()); ?>">Contact &amp; enquiry</a></p><!-- /wp:paragraph --></div><!-- /wp:group -->
</div><!-- /wp:group --><!-- wp:group {"className":"container footer-bottom","layout":{"type":"default"}} --><div class="wp-block-group container footer-bottom"><!-- wp:paragraph --><p>Design preview. Specifications are illustrative and require confirmation.</p><!-- /wp:paragraph --><!-- wp:paragraph --><p><a href="<?php echo esc_url(\Hongda\Model\destination('credits_page')); ?>">Image credits</a></p><!-- /wp:paragraph --></div><!-- /wp:group --></div><!-- /wp:group -->
