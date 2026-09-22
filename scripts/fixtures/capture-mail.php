<?php
// Installed only into the local fixture's mu-plugins, never the distributable theme.
if (!defined('ABSPATH')) { exit; }
add_filter('pre_wp_mail', static function ($result, array $message) {
    if (home_url() !== 'http://127.0.0.1:9462') { return $result; }
    file_put_contents('/artifacts/mail-capture.jsonl', wp_json_encode(['capturedAt' => gmdate('c'), 'to' => $message['to'], 'subject' => $message['subject'], 'bodySha256' => hash('sha256', $message['message'])]) . "\n", FILE_APPEND | LOCK_EX);
    return true;
}, 10, 2);
