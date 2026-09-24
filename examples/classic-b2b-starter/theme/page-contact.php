<?php
/**
 * Contact / RFQ: guidance aside + Fluent Forms panel (form id 3).
 *
 * @package harness-cleanroom
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<header class="page-head">
		<?php Cleanroom\Theme\breadcrumbs(); ?>
		<p class="eyebrow">Contact</p>
		<h1><?php the_title(); ?></h1>
		<p>Tell us the application, quantity and target certifications — itemised pricing in three working days.</p>
	</header>
	<div class="contact-layout">
		<aside class="contact-aside prose">
			<section>
				<h2>What helps us quote faster</h2>
				<ul class="contact-check">
					<li>Application and mounting height</li>
					<li>Quantity and delivery window</li>
					<li>Target market (EU / AU / NA) for certification</li>
					<li>Existing drawings or a lighting schedule, if any</li>
				</ul>
			</section>
			<section>
				<h2>Direct lines</h2>
				<p><strong>Email</strong><br><a href="mailto:sales@yourcompany.example">sales@yourcompany.example</a></p>
				<p><strong>Working hours</strong><br>Mon–Fri, 9:00–18:00 (GMT+8)</p>
				<p><strong>Response</strong><br>Every enquiry receives a human reply within one working day.</p>
			</section>
		</aside>
		<div class="form-panel">
			<h2 class="form-panel-title">Request for quotation</h2>
			<p class="form-panel-note">Attachments are welcome — drawings, schedules or a simple description.</p>
			<?php the_content(); ?>
		</div>
	</div>
<?php endwhile; ?></main>
<?php get_footer(); ?>
