<?php
namespace Hongda\Model;
defined('ABSPATH') || exit;
function rfq_form(): string {
    if (!empty($GLOBALS['b2b_rfq_rendered'])) return '<a class="text-link rfq-trigger" href="'.esc_url(enquiry()).'">Request a quote →</a>';
    $GLOBALS['b2b_rfq_rendered']=true;
    $form_id=absint(get_option('hd_enquiry_form_id'));
    if (!$form_id || !shortcode_exists('fluentform')) return '<p>Our enquiry form is temporarily unavailable. Please try again shortly.</p>';
    return '<div class="rfq-form-home"><div class="rfq-form-host"><p class="rfq-context" aria-live="polite"></p>'.do_shortcode('[fluentform id="'.$form_id.'"]').'<p class="form-note">Use this form for equipment enquiries. Do not include payment details or sensitive documents.</p></div></div>';
}
add_action('wp_footer',static function(): void {
    echo '<dialog id="rfq-dialog" aria-labelledby="rfq-dialog-title"><button type="button" class="dialog-close" aria-label="Close enquiry form">×</button><p class="eyebrow">LET’S SPECIFY YOUR MACHINE</p><h2 id="rfq-dialog-title">Request a quote</h2><p>Tell us about your application and destination. Start with the model if you have one in mind.</p><div class="rfq-modal-slot">';
    if (empty($GLOBALS['b2b_rfq_rendered'])) echo rfq_form();
    echo '</div></dialog>';
},8);
