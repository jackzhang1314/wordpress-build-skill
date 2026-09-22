<?php
/**
 * Plugin Name: SMTP Notification Sender (Must-Use)
 * Description: Routes all WordPress email through the owner's business SMTP.
 * Placeholders marked REPLACE_* must be filled before first deploy.
 */
add_action('phpmailer_init', function ($phpmailer) {
    $phpmailer->isSMTP();
    $phpmailer->Host       = 'REPLACE_SMTP_HOST';       // e.g. smtp.hostinger.com
    $phpmailer->Port       = 465;
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = 'REPLACE_SMTP_USER';       // e.g. notify@yourdomain.com
    $phpmailer->Password   = 'REPLACE_SMTP_PASS';       // mailbox password
    $phpmailer->SMTPSecure = 'ssl';
    $phpmailer->From       = 'REPLACE_SMTP_USER';
    $phpmailer->FromName   = get_bloginfo('name');
});
