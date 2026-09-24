<?php
/**
 * Contact / RFQ: guidance aside + Fluent Forms panel (form id 3).
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post(); ?>
	<?php Starter\Theme\component_page_head([
		'eyebrow' => 'Contact',
		'title' => get_the_title(),
		'description' => Starter\Theme\field_text('contact_intro') ?: 'Tell us the application, quantity and target certifications — itemised pricing in three working days.',
	]); ?>
	<div class="contact-layout">
		<aside class="contact-aside prose">
			<section>
				<h2>What helps us quote faster</h2>
				<?php $checklist = Starter\Theme\field_lines('contact_checklist', null, implode("\n", [
					'Application and mounting height',
					'Quantity and delivery window',
					'Target market (EU / AU / NA) for certification',
					'Existing drawings or a lighting schedule, if any',
				])); ?>
				<ul class="contact-check"><?php foreach ($checklist as $item) : ?><li><?php echo esc_html($item); ?></li><?php endforeach; ?></ul>
			</section>
			<section>
				<h2>Direct lines</h2>
				<?php $email = Starter\Theme\get_setting('contact_email', 'sales@yourcompany.com'); $hours = Starter\Theme\get_setting('contact_hours', 'Mon–Fri, 9:00–18:00 (GMT+8)'); ?>
				<p><strong>Email</strong><br><a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></p>
				<?php $phone = Starter\Theme\get_setting('contact_phone'); ?>
				<?php if ($phone) : ?><p><strong>Phone</strong><br><?php echo esc_html($phone); ?></p><?php endif; ?>
				<p><strong>Working hours</strong><br><?php echo esc_html($hours); ?></p>
				<p><strong>Response</strong><br>Every enquiry receives a human reply within one working day.</p>
			</section>
		</aside>
		<div class="form-panel">
			<h2 class="form-panel-title"><?php echo esc_html(Starter\Theme\field_text('form_title') ?: 'Request for quotation'); ?></h2>
			<p class="form-panel-note"><?php echo esc_html(Starter\Theme\field_text('form_note') ?: 'Attachments are welcome — drawings, schedules or a simple description.'); ?></p>
			<?php the_content(); ?>
		</div>
	</div>
<?php endwhile; ?></main>
<?php get_footer(); ?>
