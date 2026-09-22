// A fresh SQLite/WordPress installation, not a copy of the demo database.
import { mkdtemp, mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

await mkdir('.lab', { recursive: true });
const run = await mkdtemp(resolve('.lab/new-site-'));
const artifacts = join(run, 'artifacts');
await mkdir(artifacts);
const acf = resolve(process.env.WP_TEST_ACF_PATH ?? '.lab/wordpress/wp-content/plugins/advanced-custom-fields');
await access(join(acf, 'acf.php'));
const theme = join(run, 'theme');
await mkdir(theme);
await writeFile(join(theme, 'style.css'), '/*\nTheme Name: Fresh Site Integration\nVersion: 1.0\n*/');
await writeFile(join(theme, 'functions.php'), "<?php add_action('after_setup_theme', static function () { add_theme_support('title-tag'); });");
await writeFile(join(theme, 'index.php'), '<?php get_header(); ?><main><?php while (have_posts()) { the_post(); ?><h1><?php the_title(); ?></h1><?php the_content(); echo esc_html(get_field("proof_material")); } ?></main><?php get_footer(); ?>');
await writeFile(join(theme, 'header.php'), '<!doctype html><html <?php language_attributes(); ?>><head><?php wp_head(); ?></head><body <?php body_class(); ?>><?php wp_body_open(); ?>');
await writeFile(join(theme, 'footer.php'), '<?php wp_footer(); ?></body></html>');
const plugin = `<?php
/**
 * Plugin Name: Fresh Site Model Test
 */
add_action('init', static function () { register_post_type('proof_product', ['public'=>true,'show_in_rest'=>true,'supports'=>['title','editor','custom-fields']]); });
add_action('acf/init', static function () { acf_add_local_field_group(['key'=>'group_proof','title'=>'Proof','fields'=>[['key'=>'field_proof_material','name'=>'proof_material','label'=>'Material','type'=>'text']], 'location'=>[[['param'=>'post_type','operator'=>'==','value'=>'proof_product']]],'show_in_rest'=>true]); });
`;
const verify = `<?php
require '/wordpress/wp-load.php';
$checks=[];
$checks['fresh_site_has_no_demo_products']=count(get_posts(['post_type'=>'proof_product']))===0 && !post_type_exists('oct_product');
$checks['classic_theme']=!wp_is_block_theme() && get_stylesheet()==='fresh-proof';
$checks['acf_available']=function_exists('update_field');
$id=wp_insert_post(['post_type'=>'proof_product','post_status'=>'publish','post_title'=>'New product','post_content'=>'Verified initial content'],true);
if(is_wp_error($id)) throw new RuntimeException($id->get_error_message());
update_field('field_proof_material','Steel',$id);
$checks['acf_write_read']=get_field('proof_material',$id)==='Steel';
update_field('field_proof_material','Aluminium',$id);
$checks['acf_revision']=get_field('proof_material',$id)==='Aluminium';
$checks['body_preserved']=get_post_field('post_content',$id)==='Verified initial content';
wp_set_current_user(1);
$response=rest_do_request(new WP_REST_Request('GET','/wp/v2/proof_product/'.$id));
$checks['rest_model_available']=$response->get_status()===200;
query_posts(['p'=>$id,'post_type'=>'proof_product']); ob_start(); include get_index_template(); $html=ob_get_clean(); wp_reset_query();
$checks['template_renders']=str_contains($html,'New product') && str_contains($html,'Verified initial content') && str_contains($html,'Aluminium') && substr_count(strtolower($html),'<!doctype html>')===1;
file_put_contents('/artifacts/new-site.json',json_encode(['wordpress'=>get_bloginfo('version'),'php'=>PHP_VERSION,'acf'=>ACF_VERSION,'checks'=>$checks],JSON_PRETTY_PRINT));
if(in_array(false,$checks,true)) throw new RuntimeException('Fresh site integration failed');
`;
const blueprint = {
  preferredVersions: { wp: '7.1.1', php: '8.3' },
  steps: [
    { step: 'mkdir', path: '/wordpress/wp-content/plugins/fresh-model' },
    { step: 'writeFile', path: '/wordpress/wp-content/plugins/fresh-model/fresh-model.php', data: plugin },
    { step: 'activatePlugin', pluginPath: 'advanced-custom-fields/acf.php' },
    { step: 'activatePlugin', pluginPath: 'fresh-model/fresh-model.php' },
    { step: 'activateTheme', themeFolderName: 'fresh-proof' },
    { step: 'runPHP', code: verify },
  ],
};
await writeFile(join(run, 'blueprint.json'), JSON.stringify(blueprint));
execFileSync(process.execPath, ['--experimental-wasm-jspi', 'node_modules/.bin/wp-playground-cli', 'run-blueprint', '--wp=7.1.1', '--php=8.3', '--mount-dir', acf, '/wordpress/wp-content/plugins/advanced-custom-fields', '--mount-dir', theme, '/wordpress/wp-content/themes/fresh-proof', '--mount-dir', artifacts, '/artifacts', '--blueprint=' + join(run, 'blueprint.json')], { stdio: 'inherit', timeout: 180000 });
const evidence = JSON.parse(await readFile(join(artifacts, 'new-site.json'), 'utf8'));
if (evidence.wordpress !== '7.1.1' || !evidence.php.startsWith('8.3.') || !Object.values(evidence.checks).every(Boolean)) throw new Error('Fresh environment version or check mismatch: ' + JSON.stringify(evidence));
console.log('PASS fresh WordPress site:', JSON.stringify(evidence));
console.log('Evidence:', artifacts);
