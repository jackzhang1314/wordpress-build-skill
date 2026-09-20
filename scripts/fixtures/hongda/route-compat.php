<?php
// Local Playground CGI compatibility only. Never distribute with the site.
// CLI 3.1.52 supplies PHP_SELF=/requested/route/ while executing index.php.
// WordPress class-wp.php consequently treats unmatched requests as a request
// for the executing script and clears its 404 error. Preserve REQUEST_URI.
if (defined('NEW_SITE_REFERENCE_LAB') && ($_SERVER['SCRIPT_NAME'] ?? '') === '/index.php') {
    $_SERVER['PHP_SELF'] = '/index.php';
}
