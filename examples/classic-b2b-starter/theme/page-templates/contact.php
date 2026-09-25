<?php
/**
 * Template Name: Contact / RFQ
 * Template Post Type: page
 * Template Editor Pattern: contact-rfq-body
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post();
	$data = Starter\Theme\contact_data();
	$factory = Starter\Theme\factory_profile_data();
	Starter\Theme\component_page_head([
		'eyebrow' => 'Contact',
		'title' => get_the_title(),
		'description' => $data['intro'],
	]);
	?>
	<section class="contact-paths">
		<div class="contact-path">
			<h2>Request a quotation</h2>
			<p>Send specifications, quantities and delivery requirements.</p>
			<a href="#rfq-form" class="more">Start RFQ</a>
		</div>
		<div class="contact-path">
			<h2>OEM / ODM project</h2>
			<p>Share drawings, target market and configuration requirements.</p>
			<a href="#rfq-form" class="more">Discuss project</a>
		</div>
		<div class="contact-path">
			<h2>Audit or factory visit</h2>
			<p>Arrange production, QC and packaging information for your review.</p>
			<a href="mailto:<?php echo esc_attr(Starter\Theme\get_setting('contact_email', 'sales@yourcompany.com')); ?>" class="more">Send request</a>
		</div>
	</section>

	<div class="contact-layout">
		<aside class="contact-aside prose">
			<section>
				<h2>What helps us respond faster</h2>
				<ul class="contact-check"><?php foreach ($data['checklist'] as $item) : ?><li><?php echo esc_html($item); ?></li><?php endforeach; ?></ul>
			</section>
			<section>
				<h2>Direct lines</h2>
				<?php $email = Starter\Theme\get_setting('contact_email', 'sales@yourcompany.com'); $hours = Starter\Theme\get_setting('contact_hours', 'Mon–Fri, 9:00–18:00 (GMT+8)'); ?>
				<p><strong>Email</strong><br><a href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a></p>
				<?php $phone = Starter\Theme\get_setting('contact_phone'); ?>
				<?php if ($phone) : ?><p><strong>Phone</strong><br><?php echo esc_html($phone); ?></p><?php endif; ?>
				<p><strong>Working hours</strong><br><?php echo esc_html($hours); ?></p>
				<p><strong>Response</strong><br><?php echo esc_html($data['response_promise']); ?></p>
			</section>
		</aside>
		<div class="form-panel" id="rfq-form">
			<h2 class="form-panel-title"><?php echo esc_html($data['form_title']); ?></h2>
			<p class="form-panel-note"><?php echo esc_html($data['form_note']); ?></p>
			<?php the_content(); ?>
		</div>
	</div>

	<?php if ($data['response_promise'] || $factory['has_core_proof']) : ?>
	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'After you send',
			'title' => 'What happens next',
		]); ?>
		<?php Starter\Theme\component_process_steps(['rows' => [
			['label' => 'Review', 'value' => 'We check the application, specification and market requirements.'],
			['label' => 'Clarify', 'value' => 'We ask for drawings or missing commercial details if needed.'],
			['label' => 'Proposal', 'value' => 'You receive suitable configurations and itemised pricing.'],
			['label' => 'Support', 'value' => 'Documentation, samples or production planning can follow.'],
		]]); ?>
		<?php Starter\Theme\component_factory_strip([
			'proof' => $factory['proof'],
			'certifications' => $factory['certifications'],
			'markets' => $factory['markets'],
		]); ?>
	</section>
	<?php endif; ?>

	<section class="section">
		<?php Starter\Theme\component_section_heading([
			'eyebrow' => 'Before contacting',
			'title' => 'Helpful buying information',
			'link' => ['url' => get_post_type_archive_link('starter_guide') ?: home_url('/guides/'), 'label' => 'All guides →'],
		]); ?>
		<?php Starter\Theme\component_card_grid(['query_args' => ['post_type' => 'starter_guide', 'posts_per_page' => 3], 'title_tag' => 'h3']); ?>
	</section>
<?php endwhile; ?></main>
<?php get_footer(); ?>
