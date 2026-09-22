<?php
// Isolated Docker acceptance only. Never include in customer theme/plugin ZIPs.
defined('ABSPATH') || exit;
if (!defined('NEW_SITE_REFERENCE_LAB')) return;
add_filter('wp_is_application_passwords_available', '__return_true');
add_action('phpmailer_init', static function($mailer) {
    $mailer->isSMTP();
    $mailer->Host = 'mail';
    $mailer->Port = 1025;
    $mailer->SMTPAuth = false;
    $mailer->SMTPAutoTLS = false;
    $mailer->From = 'wordpress@example.test';
    $mailer->FromName = 'HONGDA local acceptance';
});
