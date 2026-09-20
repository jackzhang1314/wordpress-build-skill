<?php
// This file is mounted into the disposable lab only; never distributed as site code.
defined('ABSPATH') || exit;
if (!defined('NEW_SITE_REFERENCE_LAB')) { return; }
add_filter('wp_is_application_passwords_available', '__return_true');
add_filter('pre_wp_mail', static function ($result, array $message) {
    file_put_contents('/artifacts/mail.jsonl', wp_json_encode(['to'=>$message['to'],'subject'=>$message['subject'],'bodySha256'=>hash('sha256',$message['message'])]) . "\n", FILE_APPEND | LOCK_EX);
    return true;
}, 10, 2);
