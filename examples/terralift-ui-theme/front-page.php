<?php
/**
 * Site front page. Delegates to the Home v1 free template (page-home-v1.php):
 * get_front_page_template() only honours front-page.php and ignores the
 * per-page custom template, so the delegation keeps one source of truth.
 *
 * @package terralift-ui
 */

require get_theme_file_path( 'page-home-v1.php' );
