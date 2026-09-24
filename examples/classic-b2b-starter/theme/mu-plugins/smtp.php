<?php
/**
 * Plugin Name: Starter SMTP (Must-Use)
 * Description: Routes all WordPress email through your SMTP provider.
 *              Set the constants in wp-config.php before going live.
 *
 * SETUP:
 *  1. Add the constants below to wp-config.php (above "/* That's all..." * /).
 *  2. Copy this file into wp-content/mu-plugins/ on your server.
 *  3. Test with any form submission — the test email should arrive.
 *
 * SECURITY: never commit real credentials to Git. Use wp-config.php which
 * is typically outside version control.
 */

defined('ABSPATH') || exit;

add_action('phpmailer_init', function ($phpmailer): void {
    // Read from wp-config.php constants. Do not put real values in this file.
    $host     = defined('SMTP_HOST')     ? SMTP_HOST     : '';
    $port     = defined('SMTP_PORT')     ? SMTP_PORT     : 465;
    $secure   = defined('SMTP_SECURE')   ? SMTP_SECURE   : 'ssl';
    $username = defined('SMTP_USERNAME') ? SMTP_USERNAME : '';
    $password = defined('SMTP_PASSWORD') ? SMTP_PASSWORD : '';
    $from     = defined('SMTP_FROM')     ? SMTP_FROM     : $username;
    $fromName = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : get_bloginfo('name');

    // Skip if constants are not set yet (prevents silent send failures).
    if ($host === '' || $username === '' || $password === '') {
        return;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host       = $host;
    $phpmailer->Port       = (int) $port;
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = $username;
    $phpmailer->Password   = $password;
    $phpmailer->SMTPSecure = $secure;
    $phpmailer->From       = $from;
    $phpmailer->FromName   = $fromName;
});
