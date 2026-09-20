<?php
/**
 * TerraLift UI pattern library.
 *
 * Registered native block patterns. All styling hooks come from theme.json
 * presets; patterns carry semantic classNames so front-end CSS stays class
 * based instead of structure guessing.
 *
 * @package terralift-ui
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'init', function () {
	register_block_pattern_category(
		'terralift-sections',
		array( 'label' => __( 'TerraLift sections', 'terralift-ui' ) )
	);
	register_block_pattern_category(
		'terralift-lists',
		array( 'label' => __( 'TerraLift catalogues', 'terralift-ui' ) )
	);

	$patterns = array(
		'hero-industrial' => array(
			'title'       => 'Hero — Industrial enquiry',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Dark full-width hero with eyebrow, display heading, CTAs and spec stat tiles.',
			'content'     => <<<'HTML'
<!-- wp:group {"align":"full","className":"tl-hero","style":{"color":{"gradient":"var:preset|gradient|panel","text":"#FFFFFF"},"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained","contentSize":"1240px"}} -->
<div class="wp-block-group alignfull tl-hero has-background" style="background:var(--wp--preset--gradient--panel);color:#FFFFFF;padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center">
<!-- wp:column {"verticalAlignment":"center","width":"56%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:56%">
<!-- wp:paragraph {"className":"tl-eyebrow","style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":".72rem","fontWeight":"500","letterSpacing":".22em","textTransform":"uppercase"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="tl-eyebrow has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:.72rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase">Compact machinery export desk</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":1,"className":"tl-hero-title","style":{"typography":{"fontSize":"clamp(2.6rem, 5.4vw, 4.4rem)","fontWeight":"800","lineHeight":".95","letterSpacing":"-.035em","textTransform":"uppercase"}}} -->
<h1 class="wp-block-heading tl-hero-title" style="font-size:clamp(2.6rem, 5.4vw, 4.4rem);font-weight:800;line-height:.95;letter-spacing:-.035em;text-transform:uppercase">Compact machinery sourced around your project</h1>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|large","lineHeight":"1.55"},"color":{"text":"rgba(255,255,255,.74)"},"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
<p style="color:rgba(255,255,255,.74);font-size:var(--wp--preset--font-size--large);line-height:1.55;margin-top:var(--wp--preset--spacing--40)">Tell us the working width, tonnage and site conditions. Use this demonstration to explore model profiles and enquiry structure.</p>
<!-- /wp:paragraph -->
<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/terralift-contact/">Start an enquiry</a></div>
<!-- /wp:button -->
<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/terralift-equipment/">Browse equipment</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
</div>
<!-- /wp:column -->
<!-- wp:column {"verticalAlignment":"center","width":"38%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:38%">
<!-- wp:group {"className":"tl-hero-stats","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"grid","minimumColumnWidth":"46%"}} -->
<div class="wp-block-group tl-hero-stats">
<!-- wp:group {"className":"tl-stat","style":{"border":{"width":"1px","color":"rgba(255,255,255,.14)","radius":"var:preset|custom|radius|sm"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
<div class="wp-block-group tl-stat has-border-color" style="border-color:rgba(255,255,255,.14);border-width:1px;border-radius:var(--wp--custom--radius--sm);padding:var(--wp--preset--spacing--40)">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.6rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.6rem;font-weight:700;line-height:1">0.8–8.0 t</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".82rem"},"color":{"text":"rgba(255,255,255,.66)"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
<p style="color:rgba(255,255,255,.66);font-size:.82rem;margin-top:var(--wp--preset--spacing--20)">Operating weight range</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:group {"className":"tl-stat","style":{"border":{"width":"1px","color":"rgba(255,255,255,.14)","radius":"var:preset|custom|radius|sm"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
<div class="wp-block-group tl-stat has-border-color" style="border-color:rgba(255,255,255,.14);border-width:1px;border-radius:var(--wp--custom--radius--sm);padding:var(--wp--preset--spacing--40)">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.6rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.6rem;font-weight:700;line-height:1">Enquiry</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".82rem"},"color":{"text":"rgba(255,255,255,.66)"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
<p style="color:rgba(255,255,255,.66);font-size:.82rem;margin-top:var(--wp--preset--spacing--20)">Share your requirements</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:group {"className":"tl-stat","style":{"border":{"width":"1px","color":"rgba(255,255,255,.14)","radius":"var:preset|custom|radius|sm"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
<div class="wp-block-group tl-stat has-border-color" style="border-color:rgba(255,255,255,.14);border-width:1px;border-radius:var(--wp--custom--radius--sm);padding:var(--wp--preset--spacing--40)">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.6rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.6rem;font-weight:700;line-height:1">Review</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".82rem"},"color":{"text":"rgba(255,255,255,.66)"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
<p style="color:rgba(255,255,255,.66);font-size:.82rem;margin-top:var(--wp--preset--spacing--20)">Confirm destination requirements</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:group {"className":"tl-stat","style":{"border":{"width":"1px","color":"rgba(255,255,255,.14)","radius":"var:preset|custom|radius|sm"},"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"}}}} -->
<div class="wp-block-group tl-stat has-border-color" style="border-color:rgba(255,255,255,.14);border-width:1px;border-radius:var(--wp--custom--radius--sm);padding:var(--wp--preset--spacing--40)">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.6rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.6rem;font-weight:700;line-height:1">Compare</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".82rem"},"color":{"text":"rgba(255,255,255,.66)"},"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
<p style="color:rgba(255,255,255,.66);font-size:.82rem;margin-top:var(--wp--preset--spacing--20)">Example model profiles</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</div>
<!-- /wp:group -->
HTML,
		),

		'section-intro' => array(
			'title'       => 'Section — Intro with eyebrow',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Eyebrow, display heading and lead paragraph for opening a section.',
			'content'     => <<<'HTML'
<!-- wp:group {"className":"tl-intro","style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
<div class="wp-block-group tl-intro">
<!-- wp:paragraph {"className":"tl-eyebrow","style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":".72rem","fontWeight":"500","letterSpacing":".22em","textTransform":"uppercase"},"color":{"text":"var:preset|color|signal"}}} -->
<p class="tl-eyebrow has-text-color" style="color:var(--wp--preset--color--signal);font-family:var(--wp--preset--font-family--mono);font-size:.72rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase">Section label</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(1.9rem, 3.4vw, 2.8rem)","fontWeight":"800","lineHeight":"1","letterSpacing":"-.025em"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.9rem, 3.4vw, 2.8rem);font-weight:800;line-height:1;letter-spacing:-.025em">Section heading states the buyer decision</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|large","lineHeight":"1.6"},"color":{"text":"var:preset|color|steel"},"spacing":{"maxWidth":"62ch"}}} -->
<p style="color:var(--wp--preset--color--steel);font-size:var(--wp--preset--font-size--large);line-height:1.6;max-width:62ch">Two sentences that frame the trade-off the buyer is actually weighing.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
HTML,
		),

		'product-grid' => array(
			'title'       => 'Catalogue — Product grid',
			'categories'  => array( 'terralift-lists' ),
			'description' => 'Query loop of oct_product records as catalogue cards with 4:3 imagery.',
			'content'     => <<<'HTML'
<!-- wp:group {"className":"tl-product-grid","style":{"spacing":{"blockGap":"var:preset|spacing|50"}}} -->
<div class="wp-block-group tl-product-grid">
<!-- wp:query {"queryId":0,"query":{"perPage":6,"pages":1,"offset":0,"postType":"oct_product","order":"asc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query">
<!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
<!-- wp:group {"className":"tl-card","style":{"border":{"width":"1px","color":"var:preset|color|line","radius":"var:preset|custom|radius|sm"},"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
<div class="wp-block-group tl-card has-border-color" style="border-color:var(--wp--preset--color--line);border-width:1px;border-radius:var(--wp--custom--radius--sm)">
<!-- wp:post-featured-image {"isLink":true,"aspectRatio":"4/3","style":{"border":{"radius":{"topLeft":"var:preset|custom|radius|sm","topRight":"var:preset|custom|radius|sm"}}}} /-->
<!-- wp:group {"className":"tl-card-body","style":{"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|20"}}} -->
<div class="wp-block-group tl-card-body">
<!-- wp:post-title {"isLink":true,"style":{"typography":{"fontSize":"1.15rem","fontWeight":"750","lineHeight":"1.2","letterSpacing":"-.015em"}}} /-->
<!-- wp:post-excerpt {"excerptLength":22,"style":{"typography":{"fontSize":".9rem","lineHeight":"1.6"}}} /-->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:group -->
<!-- /wp:post-template -->
</div>
<!-- /wp:query -->
</div>
<!-- /wp:group -->
HTML,
		),

		'case-grid' => array(
			'title'       => 'Catalogue — Case grid',
			'categories'  => array( 'terralift-lists' ),
			'description' => 'Query loop of oct_case records as project cards with 16:10 imagery.',
			'content'     => <<<'HTML'
<!-- wp:group {"className":"tl-case-grid","style":{"spacing":{"blockGap":"var:preset|spacing|50"}}} -->
<div class="wp-block-group tl-case-grid">
<!-- wp:query {"queryId":0,"query":{"perPage":3,"pages":1,"offset":0,"postType":"oct_case","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query">
<!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
<!-- wp:group {"className":"tl-card","style":{"border":{"width":"1px","color":"var:preset|color|line","radius":"var:preset|custom|radius|sm"},"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
<div class="wp-block-group tl-card has-border-color" style="border-color:var(--wp--preset--color--line);border-width:1px;border-radius:var(--wp--custom--radius--sm)">
<!-- wp:post-featured-image {"isLink":true,"aspectRatio":"16/10","style":{"border":{"radius":{"topLeft":"var:preset|custom|radius|sm","topRight":"var:preset|custom|radius|sm"}}}} /-->
<!-- wp:group {"className":"tl-card-body","style":{"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|20"}}} -->
<div class="wp-block-group tl-card-body">
<!-- wp:post-title {"isLink":true,"style":{"typography":{"fontSize":"1.15rem","fontWeight":"750","lineHeight":"1.2","letterSpacing":"-.015em"}}} /-->
<!-- wp:post-excerpt {"excerptLength":24,"style":{"typography":{"fontSize":".9rem","lineHeight":"1.6"}}} /-->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:group -->
<!-- /wp:post-template -->
</div>
<!-- /wp:query -->
</div>
<!-- /wp:group -->
HTML,
		),

		'spec-table' => array(
			'title'       => 'Product — Spec table',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Two-column specification table with mono values.',
			'content'     => <<<'HTML'
<!-- wp:group {"className":"tl-spec","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
<div class="wp-block-group tl-spec">
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(1.7rem, 3vw, 2.3rem)","fontWeight":"800","lineHeight":"1","letterSpacing":"-.025em"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.7rem, 3vw, 2.3rem);font-weight:800;line-height:1;letter-spacing:-.025em">Key specification</h2>
<!-- /wp:heading -->
<!-- wp:table {"className":"tl-spec-table is-style-stripes"} -->
<figure class="wp-block-table tl-spec-table is-style-stripes"><table><thead><tr><th>Item</th><th>Value</th></tr></thead><tbody><tr><td>Operating weight</td><td>0.8 t</td></tr><tr><td>Engine</td><td>10.3 kW diesel</td></tr><tr><td>Digging depth</td><td>1 650 mm</td></tr><tr><td>Working width</td><td>780 mm</td></tr></tbody></table></figure>
<!-- /wp:table -->
</div>
<!-- /wp:group -->
HTML,
		),

		'process-steps' => array(
			'title'       => 'Section — Process steps',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Four numbered buying-process steps in a dark band.',
			'content'     => <<<'HTML'
<!-- wp:group {"align":"full","className":"tl-process","style":{"color":{"background":"var:preset|color|ink","text":"#FFFFFF"},"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained","contentSize":"1240px"}} -->
<div class="wp-block-group alignfull tl-process has-background" style="color:#FFFFFF;background-color:var(--wp--preset--color--ink);padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
<!-- wp:paragraph {"className":"tl-eyebrow","style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":".72rem","fontWeight":"500","letterSpacing":".22em","textTransform":"uppercase"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="tl-eyebrow has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:.72rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase">How sourcing works</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(1.9rem, 3.4vw, 2.8rem)","fontWeight":"800","lineHeight":"1","letterSpacing":"-.025em"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.9rem, 3.4vw, 2.8rem);font-weight:800;line-height:1;letter-spacing:-.025em">Four steps from enquiry to loading</h2>
<!-- /wp:heading -->
<!-- wp:columns {"style":{"spacing":{"margin":{"top":"var:preset|spacing|60"},"blockGap":"var:preset|spacing|50"}}} -->
<div class="wp-block-columns" style="margin-top:var(--wp--preset--spacing--60)">
<!-- wp:column {"className":"tl-step"} -->
<div class="wp-block-column tl-step">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"2rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|signal"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--signal);font-family:var(--wp--preset--font-family--mono);font-size:2rem;font-weight:700;line-height:1">01</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"700"}}} -->
<h3 class="wp-block-heading" style="font-size:1.1rem;font-weight:700">Send site conditions</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".92rem","lineHeight":"1.6"},"color":{"text":"rgba(255,255,255,.72)"}}} -->
<p style="color:rgba(255,255,255,.72);font-size:.92rem;line-height:1.6">Working width, tonnage, attachments, destination port.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-step"} -->
<div class="wp-block-column tl-step">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"2rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|signal"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--signal);font-family:var(--wp--preset--font-family--mono);font-size:2rem;font-weight:700;line-height:1">02</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"700"}}} -->
<h3 class="wp-block-heading" style="font-size:1.1rem;font-weight:700">Match and compare</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".92rem","lineHeight":"1.6"},"color":{"text":"rgba(255,255,255,.72)"}}} -->
<p style="color:rgba(255,255,255,.72);font-size:.92rem;line-height:1.6">Compare example candidates and the information needed for a real quotation.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-step"} -->
<div class="wp-block-column tl-step">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"2rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|signal"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--signal);font-family:var(--wp--preset--font-family--mono);font-size:2rem;font-weight:700;line-height:1">03</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"700"}}} -->
<h3 class="wp-block-heading" style="font-size:1.1rem;font-weight:700">Inspect or video-verify</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".92rem","lineHeight":"1.6"},"color":{"text":"rgba(255,255,255,.72)"}}} -->
<p style="color:rgba(255,255,255,.72);font-size:.92rem;line-height:1.6">Live walkaround or third-party inspection before payment.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-step"} -->
<div class="wp-block-column tl-step">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"2rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|signal"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--signal);font-family:var(--wp--preset--font-family--mono);font-size:2rem;font-weight:700;line-height:1">04</p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.1rem","fontWeight":"700"}}} -->
<h3 class="wp-block-heading" style="font-size:1.1rem;font-weight:700">Ship and support</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".92rem","lineHeight":"1.6"},"color":{"text":"rgba(255,255,255,.72)"}}} -->
<p style="color:rgba(255,255,255,.72);font-size:.92rem;line-height:1.6">RO-RO or container loading with export documents handled.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</div>
<!-- /wp:group -->
HTML,
		),

		'faq-list' => array(
			'title'       => 'Section — FAQ accordion',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Native details accordions for buyer questions.',
			'content'     => <<<'HTML'
<!-- wp:group {"className":"tl-faq","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
<div class="wp-block-group tl-faq">
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(1.7rem, 3vw, 2.3rem)","fontWeight":"800","lineHeight":"1","letterSpacing":"-.025em"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.7rem, 3vw, 2.3rem);font-weight:800;line-height:1;letter-spacing:-.025em">Buyer questions</h2>
<!-- /wp:heading -->
<!-- wp:details -->
<details class="wp-block-details"><summary>Can I inspect the machine before payment?</summary>
<!-- wp:paragraph -->
<p>Yes. Book a live video walkaround or appoint a third-party inspection company; we coordinate access.</p>
<!-- /wp:paragraph -->
</details>
<!-- /wp:details -->
<!-- wp:details -->
<details class="wp-block-details"><summary>Which markets do you ship to?</summary>
<!-- wp:paragraph -->
<p>RO-RO and container shipments leave from major Chinese ports; documents are prepared per destination requirements.</p>
<!-- /wp:paragraph -->
</details>
<!-- /wp:details -->
<!-- wp:details -->
<details class="wp-block-details"><summary>Do machines meet CE or EPA rules?</summary>
<!-- wp:paragraph -->
<p>This demonstration does not represent certification. Obtain model-specific documentation from the supplier before purchasing.</p>
<!-- /wp:paragraph -->
</details>
<!-- /wp:details -->
</div>
<!-- /wp:group -->
HTML,
		),

		'cta-band' => array(
			'title'       => 'Section — CTA band',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Signal-coloured conversion band with heading and button.',
			'content'     => <<<'HTML'
<!-- wp:group {"align":"full","className":"tl-cta","style":{"color":{"background":"var:preset|color|signal","text":"#FFFFFF"},"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"1240px"}} -->
<div class="wp-block-group alignfull tl-cta has-background" style="color:#FFFFFF;background-color:var(--wp--preset--color--signal);padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
<!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center">
<!-- wp:column {"verticalAlignment":"center","width":"62%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:62%">
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(1.6rem, 2.8vw, 2.2rem)","fontWeight":"800","lineHeight":"1.05","letterSpacing":"-.02em"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.6rem, 2.8vw, 2.2rem);font-weight:800;line-height:1.05;letter-spacing:-.02em">Send the working width and tonnage today</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|medium"},"color":{"text":"rgba(255,255,255,.86)"}}} -->
<p style="color:rgba(255,255,255,.86);font-size:var(--wp--preset--font-size--medium)">Build an enquiry around your application, equipment size and destination.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"verticalAlignment":"center","width":"34%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:34%">
<!-- wp:buttons {"className":"tl-cta-button"} -->
<div class="wp-block-buttons tl-cta-button">
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/terralift-contact/" style="border-radius:var(--wp--custom--radius--xs);background-color:var(--wp--preset--color--ink);color:#FFFFFF">Start an enquiry</a></div>
<!-- /wp:button -->
<!-- /wp:buttons -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</div>
</div>
<!-- /wp:group -->
HTML,
		),

		'trust-bar' => array(
			'title'       => 'Section — Trust stat bar',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Dark band of four proof points.',
			'content'     => <<<'HTML'
<!-- wp:group {"align":"full","className":"tl-trust","style":{"color":{"background":"var:preset|color|ink","text":"#FFFFFF"},"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"1240px"}} -->
<div class="wp-block-group alignfull tl-trust has-background" style="color:#FFFFFF;background-color:var(--wp--preset--color--ink);padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
<!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|50"}}} -->
<div class="wp-block-columns">
<!-- wp:column {"className":"tl-trust-item"} -->
<div class="wp-block-column tl-trust-item">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.4rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.4rem;font-weight:700;line-height:1">Verified</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".85rem"},"color":{"text":"rgba(255,255,255,.7)"}}} -->
<p style="color:rgba(255,255,255,.7);font-size:.85rem">Spec sheet matched to chassis number</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-trust-item"} -->
<div class="wp-block-column tl-trust-item">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.4rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.4rem;font-weight:700;line-height:1">Enquiry</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".85rem"},"color":{"text":"rgba(255,255,255,.7)"}}} -->
<p style="color:rgba(255,255,255,.7);font-size:.85rem">Shortlist turnaround</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-trust-item"} -->
<div class="wp-block-column tl-trust-item">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.4rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.4rem;font-weight:700;line-height:1">30 +</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".85rem"},"color":{"text":"rgba(255,255,255,.7)"}}} -->
<p style="color:rgba(255,255,255,.7);font-size:.85rem">Destination markets served</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-trust-item"} -->
<div class="wp-block-column tl-trust-item">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":"1.4rem","fontWeight":"700","lineHeight":"1"},"color":{"text":"var:preset|color|safety"}}} -->
<p class="has-text-color" style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:1.4rem;font-weight:700;line-height:1">T/T / LC</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".85rem"},"color":{"text":"rgba(255,255,255,.7)"}}} -->
<p style="color:rgba(255,255,255,.7);font-size:.85rem">Export payment structures</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</div>
<!-- /wp:group -->
HTML,
		),

		'feature-split' => array(
			'title'       => 'Section — Feature split',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Two-column comparison or value split.',
			'content'     => <<<'HTML'
<!-- wp:columns {"className":"tl-split","style":{"spacing":{"blockGap":"var:preset|spacing|60"}}} -->
<div class="wp-block-columns tl-split">
<!-- wp:column {"className":"tl-split-col"} -->
<div class="wp-block-column tl-split-col">
<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.3rem","fontWeight":"750"}}} -->
<h3 class="wp-block-heading" style="font-size:1.3rem;font-weight:750">Buy on specification</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"color":{"text":"var:preset|color|steel"}}} -->
<p style="color:var(--wp--preset--color--steel)">Working width, dig depth and lift capacity are confirmed per unit — not averaged across a brochure range.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-split-col"} -->
<div class="wp-block-column tl-split-col">
<!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"1.3rem","fontWeight":"750"}}} -->
<h3 class="wp-block-heading" style="font-size:1.3rem;font-weight:750">Buy on evidence</h3>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"color":{"text":"var:preset|color|steel"}}} -->
<p style="color:var(--wp--preset--color--steel)">Photos, hour readings and video walkarounds travel with every candidate machine.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
HTML,
		),

		'contact-rfq' => array(
			'title'       => 'Section — Contact RFQ panel',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Dark contact panel with channels and CTA.',
			'content'     => <<<'HTML'
<!-- wp:group {"align":"full","className":"tl-rfq","style":{"color":{"gradient":"var:preset|gradient|panel-soft","text":"#FFFFFF"},"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained","contentSize":"1240px"}} -->
<div class="wp-block-group alignfull tl-rfq has-background" style="background:var(--wp--preset--gradient--panel-soft);color:#FFFFFF;padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">
<!-- wp:columns {"style":{"spacing":{"blockGap":"var:preset|spacing|60"}}} -->
<div class="wp-block-columns">
<!-- wp:column -->
<div class="wp-block-column">
<!-- wp:heading {"level":2,"style":{"typography":{"fontSize":"clamp(1.8rem, 3.2vw, 2.6rem)","fontWeight":"800","lineHeight":"1","letterSpacing":"-.025em"}}} -->
<h2 class="wp-block-heading" style="font-size:clamp(1.8rem, 3.2vw, 2.6rem);font-weight:800;line-height:1;letter-spacing:-.025em">Request a sourced shortlist</h2>
<!-- /wp:heading -->
<!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,.74)"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
<p style="color:rgba(255,255,255,.74);margin-top:var(--wp--preset--spacing--30)">Include working width, tonnage, attachments and destination port. A named contact replies within 72 hours.</p>
<!-- /wp:paragraph -->
<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="mailto:sales@example.com">Email the enquiry desk</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
</div>
<!-- /wp:column -->
<!-- wp:column {"className":"tl-rfq-channels"} -->
<div class="wp-block-column tl-rfq-channels">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":".78rem","letterSpacing":".14em","textTransform":"uppercase"},"color":{"text":"var:preset|color|safety"}}} -->
<p style="color:var(--wp--preset--color--safety);font-family:var(--wp--preset--font-family--mono);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase">Channel</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,.82)"}}} -->
<p style="color:rgba(255,255,255,.82)">sales@example.com</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"rgba(255,255,255,.82)"}}} -->
<p style="color:rgba(255,255,255,.82)">+86 000 0000 0000 — demo only</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":".82rem"},"color":{"text":"rgba(255,255,255,.55)"}}} -->
<p style="color:rgba(255,255,255,.55);font-size:.82rem">Replies within one business day, timezone CST (UTC+8).</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
</div>
<!-- /wp:columns -->
</div>
<!-- /wp:group -->
HTML,
		),

		'logo-strip' => array(
			'title'       => 'Section — Markets strip',
			'categories'  => array( 'terralift-sections' ),
			'description' => 'Compact row of served market labels.',
			'content'     => <<<'HTML'
<!-- wp:group {"className":"tl-logos"} -->
<div class="wp-block-group tl-logos">
<!-- wp:paragraph {"style":{"typography":{"fontFamily":"var:preset|font-family|mono","fontSize":".72rem","letterSpacing":".22em","textTransform":"uppercase"},"color":{"text":"var:preset|color|steel"}}} -->
<p style="color:var(--wp--preset--color--steel);font-family:var(--wp--preset--font-family--mono);font-size:.72rem;letter-spacing:.22em;text-transform:uppercase">Sourcing corridors</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"fontFamily":"var:preset|font-family|mono","fontSize":".95rem","fontWeight":"500"},"className":"tl-logos-row"} -->
<p class="tl-logos-row" style="font-family:var(--wp--preset--font-family--mono);font-size:.95rem;font-weight:500">Europe · Middle East · Southeast Asia · Africa · Latin America</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
HTML,
		),
	);

	foreach ( $patterns as $slug => $pattern ) {
		$pattern['content'] = str_replace( '__SLUG__', $slug, $pattern['content'] );
		register_block_pattern(
			'terralift-ui/' . $slug,
			$pattern
		);
	}
} );
