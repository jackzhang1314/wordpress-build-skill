import {shellQuote} from './ssh.mjs';
import {backupProject} from './ops.mjs';

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function argValue(args, name, fallback = undefined) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : fallback;
}

const FORM_PHP = `<?php
if (!defined('ABSPATH')) exit('CLI only');
global $wpdb;
$forms = $wpdb->prefix . 'fluentform_forms';
$meta = $wpdb->prefix . 'fluentform_form_meta';
$title = 'Builder equipment RFQ';
$existingId = (int) $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$forms} WHERE title=%s AND status='published' ORDER BY ID LIMIT 1", $title));
$action = 'existing';
if (!$existingId) {
    $field = static function (string $element, string $name, string $label, bool $required = false, string $type = 'text'): array {
        return [
            'element' => $element,
            'attributes' => ['type' => $type, 'name' => $name, 'class' => '', 'placeholder' => ''],
            'settings' => [
                'label' => $label,
                'admin_field_label' => $label,
                'validation_rules' => $required ? ['required' => ['value' => true, 'message' => 'This field is required.']] : [],
                'conditional_logic' => [],
            ],
            'editor_options' => ['title' => $label, 'icon_class' => 'ff-edit-text'],
        ];
    };
    $fields = [
        $field('input_text', 'full_name', 'Full name', true),
        $field('input_email', 'email', 'Work email', true, 'email'),
        $field('input_text', 'company', 'Company'),
        $field('input_text', 'country_region', 'Country / region'),
        $field('input_text', 'machine_model', 'Equipment model and specification', true),
        $field('textarea', 'requirements', 'Working condition and requirements', true, 'textarea'),
    ];
    $sourceFields = json_decode((string) $wpdb->get_var("SELECT form_fields FROM {$forms} WHERE status='published' ORDER BY ID LIMIT 1"), true);
    $formFields = ['fields' => $fields];
    if (!empty($sourceFields['submitButton'])) $formFields['submitButton'] = $sourceFields['submitButton'];
    $inserted = $wpdb->insert($forms, [
        'title' => $title,
        'status' => 'published',
        'form_fields' => wp_json_encode($formFields),
        'appearance_settings' => wp_json_encode(['css' => '']),
        'has_payment' => 0,
        'type' => 'form',
        'conditions' => wp_json_encode([]),
        'created_by' => get_current_user_id() ?: 1,
    ]);
    if (!$inserted) { fwrite(STDERR, 'form-insert-failed'); exit(1); }
    $existingId = (int) $wpdb->insert_id;
    $action = 'created';
}
$requiredMeta = [
    'formSettings' => wp_json_encode([
        'confirmation' => [
            'redirectTo' => 'samePage',
            'messageToShow' => 'Thank you. A technical buyer will respond with the next questions or a quotation.',
            'customPage' => null,
            'samePageFormBehavior' => 'hide_form',
            'customUrl' => null,
        ],
    ]),
    'notifications' => wp_json_encode([[
        'name' => 'Technical buyer notification',
        'sendTo' => ['type' => 'email', 'email' => get_option('admin_email')],
        'subject' => 'Builder equipment RFQ — {inputs.machine_model}',
        'body' => '<p>{all_data}</p>',
        'isEnabled' => true,
    ]]),
];
$metaActions = [];
foreach ($requiredMeta as $key => $value) {
    $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$meta} WHERE form_id=%d AND meta_key=%s", $existingId, $key));
    if ($exists) continue;
    $wpdb->insert($meta, ['form_id' => $existingId, 'meta_key' => $key, 'value' => $value]);
    $metaActions[] = 'created:' . $key;
}
echo wp_json_encode([
    'id' => $existingId,
    'title' => $title,
    'action' => $action,
    'metaActions' => $metaActions,
    'shortcode' => '[fluentform id="' . $existingId . '"]',
]);
`;

function stageAndRun(ssh, files) {
  const dir = `/tmp/wordpress-builder-form-${Date.now()}`;
  ssh.run(`mkdir -p ${shellQuote(dir)}`);
  for (const file of files) {
    ssh.run(`cat > ${shellQuote(`${dir}/${file.name}`)}`, {input: Buffer.from(file.content, 'utf8')});
  }
  const output = ssh.wp(['eval-file', `${dir}/form.php`]);
  return safeJson(output.slice(output.indexOf('{')), null);
}

export async function installBuilderForm(site, args = [], logger = () => {}) {
  if (!site?.ssh) throw new Error('SSH configuration is required to install the Builder RFQ form');
  const backup = args.includes('--skip-backup')
    ? undefined
    : backupProject(site.root, site.project, site.ssh, logger);

  const plugins = safeJson(site.ssh.wp(['plugin', 'list', '--format=json']), []);
  const fluent = Array.isArray(plugins) ? plugins.find(plugin => plugin.name === 'fluentform') : undefined;
  if (!fluent) {
    site.ssh.wp(['plugin', 'install', 'fluentform', '--activate']);
  } else if (fluent.status !== 'active') {
    site.ssh.wp(['plugin', 'activate', 'fluentform']);
  }

  const result = stageAndRun(site.ssh, [{name: 'form.php', content: FORM_PHP}]);
  if (!result?.id || !result?.shortcode) throw new Error('Builder RFQ form installation failed');
  logger(`  OK  Builder RFQ form ${result.action}: id ${result.id}`);
  logger(`      Shortcode: ${result.shortcode}`);
  return {...result, backup: backup?.manifest, fluentFormsInstalled: !fluent};
}
