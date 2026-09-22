<?php
/* Template Name: Company story */
namespace Hongda\Theme;
get_header();while(have_posts()):the_post(); ?>
<section class="page-intro dark"><div class="wrap"><span class="eyebrow">OUR STORY</span><h1><?php the_title(); ?></h1><p class="lead">Equipment choices are also choices about the people, processes and support behind them.</p></div></section>
<section class="section wrap story-split"><div><span class="eyebrow">GET TO KNOW HONGDA</span><h2>From the first question<br>to the next job.</h2><a class="button" href="<?php echo esc_url(enquiry()); ?>">Start a conversation ↗</a></div><div class="prose"><?php the_content(); ?></div></section>
<section class="section pale"><div class="wrap"><span class="eyebrow">LOOK CLOSER</span><h2>Explore the company.</h2><div class="industry-grid light-grid"><?php foreach(get_pages(['parent'=>get_the_ID(),'sort_column'=>'menu_order,post_title']) as $p): ?><a href="<?php echo esc_url(get_permalink($p)); ?>"><h3><?php echo esc_html($p->post_title); ?> ↗</h3><p><?php echo esc_html($p->post_excerpt); ?></p></a><?php endforeach; ?></div></div></section>
<?php endwhile;cta();get_footer(); ?>
