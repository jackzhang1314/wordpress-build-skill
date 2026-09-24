<?php
/**
 * Template Name: Contact / RFQ
 * Template Post Type: page
 *
 * @package b2b-starter
 */

get_header(); ?>
<main id="main" class="shell"><?php while (have_posts()) : the_post();
	$data = Starter\Theme\contact_data();
	Starter\Theme\component_page_head([
		'eyebrow' => 'Contact',
		'title' => get_the_title(),
		'description' => $data['intro'],
	]);
	?>
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
		<div class="form-panel">
			<h2 class="form-panel-title"><?php echo esc_html($data['form_title']); ?></h2>
			<p class="form-panel-note"><?php echo esc_html($data['form_note']); ?></p>
			<?php the_content(); ?>
		</div>
	</div>
<?php endwhile; ?></main>
<?php get_footer(); ?>
