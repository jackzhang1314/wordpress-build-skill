import {execFileSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import {projectFile} from './config.mjs';

function walk(root, extensions = []) {
  const output = [];
  if (!existsSync(root)) return output;
  for (const entry of readdirSync(root, {withFileTypes: true})) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) output.push(...walk(path, extensions));
    else if (!extensions.length || extensions.some(ext => entry.name.endsWith(ext))) output.push(path);
  }
  return output;
}

export function headingReport(html, source = 'input') {
  const headings = [...html.matchAll(/<h([1-6])(?:\s[^>]*)?>/gi)].map(match => Number(match[1]));
  let previous = 0;
  const violations = [];
  for (const [index, level] of headings.entries()) {
    if (previous && level > previous + 1) violations.push({source, index, level, previousLevel: previous});
    previous = level;
  }
  return {headings: headings.length, h1: headings.filter(level => level === 1).length, skips: violations.length, violations};
}

export function checkTemplateHeadings(themePath, pluginPath = '') {
  const files = [...walk(themePath, ['.php', '.html']), ...walk(pluginPath, ['.php'])];
  const checks = files.map(file => {
    const report = headingReport(readFileSync(file, 'utf8'), relative(process.cwd(), file));
    return {file, ...report, pass: report.skips === 0};
  });
  return {name: 'heading-hierarchy', pass: checks.every(item => item.pass), checks};
}

export function checkStructure(projectRoot, project) {
  const checks = [];
  const themeDir = projectFile(projectRoot, project.paths.theme);
  const pluginDir = projectFile(projectRoot, project.paths.plugin);
  const requiredTheme = ['style.css', 'functions.php', 'index.php'];
  for (const file of requiredTheme) {
    checks.push({name: `theme/${file}`, pass: existsSync(join(themeDir, file))});
  }
  const style = existsSync(join(themeDir, 'style.css')) ? readFileSync(join(themeDir, 'style.css'), 'utf8') : '';
  checks.push({name: 'theme/style-header', pass: /Theme Name:/.test(style) && /Version:/.test(style)});
  checks.push({name: 'theme/block-free', pass: !existsSync(join(themeDir, 'theme.json')) && !existsSync(join(themeDir, 'templates/index.html'))});
  checks.push({name: 'plugin/main', pass: existsSync(join(pluginDir, project.pluginMain))});
  const pluginMain = join(pluginDir, project.pluginMain);
  if (existsSync(pluginMain)) {
    const php = readFileSync(pluginMain, 'utf8');
    checks.push({name: 'plugin/header', pass: /Plugin Name:/.test(php) && /Version:/.test(php)});
    checks.push({name: 'plugin/abspath-guard', pass: /defined\(\s*'ABSPATH'\s*\)/.test(php)});
  }
  return {name: 'structure', pass: checks.every(item => item.pass), checks};
}

export function checkContent(projectRoot, project) {
  const path = projectFile(projectRoot, project.seed.data);
  if (!existsSync(path)) return {name: 'content-data', pass: true, checks: [{name: 'content-data', pass: true, detail: 'absent'}]};
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    const required = ['terms', 'pages'];
    const missing = required.filter(key => !(key in data));
    // Raw "<" that is not an HTML tag gets swallowed by WordPress text helpers
    // (e.g. an excerpt "UGR<19 panel" renders as "UGR"). Flag it before shipping.
    const strayTags = [];
    const walk = (value, trail) => {
      if (typeof value === 'string') {
        for (const match of value.matchAll(/<(?![a-zA-Z/!])/g)) {
          strayTags.push({path: trail, sample: value.slice(Math.max(0, match.index - 20), match.index + 30).trim()});
          if (strayTags.length >= 10) return;
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${trail}[${index}]`));
      } else if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) walk(item, trail ? `${trail}.${key}` : key);
      }
    };
    walk(data, '');
    if (strayTags.length >= 10) strayTags.push({path: '…', sample: 'further findings truncated'});
    const mediaMap = join(projectRoot, 'content/media-map.json');
    let missingMedia = [];
    if (existsSync(mediaMap)) {
      const map = JSON.parse(readFileSync(mediaMap, 'utf8'));
      const used = JSON.stringify(data).match(/"image_key"\s*:\s*"([^"]+)"/g) ?? [];
      missingMedia = [...new Set(used.map(value => value.match(/"([^"]+)"$/)[1]))].filter(key => !(key in map));
    }
    return {
      name: 'content-data',
      pass: missing.length === 0 && missingMedia.length === 0 && strayTags.length === 0,
      checks: [{name: 'content-data', pass: missing.length === 0 && missingMedia.length === 0 && strayTags.length === 0,
        missingKeys: missing, missingMedia, strayAngleBrackets: strayTags}],
    };
  } catch (error) {
    return {name: 'content-data', pass: false, checks: [{name: 'content-data', pass: false, detail: error.message}]};
  }
}

export function checkSecrets(projectRoot, project) {
  const paths = [projectFile(projectRoot, project.paths.theme), projectFile(projectRoot, project.paths.plugin), projectFile(projectRoot, project.paths.content)];
  const findings = [];
  const patterns = [
    [/BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY/, 'private key'],
    [/(?:password|api[_-]?key|app[_-]?password)\s*[:=]\s*['"][^'"$\s]{8,}/i, 'literal credential'],
  ];
  for (const root of paths) {
    for (const file of walk(root, ['.php', '.js', '.css', '.json', '.env'])) {
      const text = readFileSync(file, 'utf8');
      for (const [pattern, label] of patterns) {
        if (pattern.test(text)) findings.push({file: relative(projectRoot, file), label});
      }
    }
  }
  return {name: 'secret-scan', pass: findings.length === 0, checks: findings};
}

export async function checkPhpSyntax(files, {phpBin = 'php'} = {}) {
  const dockerImage = phpBin?.startsWith('docker:') ? phpBin.slice(7) : undefined;
  const command = dockerImage ? 'docker' : phpBin;
  const baseArgs = dockerImage ? ['run', '--rm', '--interactive', dockerImage, 'php', '-l'] : ['-l'];
  const checks = files.map(file => {
    try {
      const args = dockerImage ? baseArgs : [file];
      const options = {encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe']};
      if (dockerImage) options.input = readFileSync(file);
      else options.maxBuffer = 1024 * 1024;
      execFileSync(command, args, options);
      return {file, pass: true};
    } catch (error) {
      return {file, pass: false, detail: error.stderr || error.stdout || error.message};
    }
  });
  return {name: 'php-syntax', pass: checks.every(item => item.pass), checks};
}

export async function auditProject(projectRoot, project, options = {}) {
  const gates = [checkStructure(projectRoot, project), checkTemplateHeadings(
    projectFile(projectRoot, project.paths.theme),
    projectFile(projectRoot, project.paths.plugin),
  ), checkContent(projectRoot, project), checkSecrets(projectRoot, project)];

  const phpBin = options.phpBin;
  const phpFiles = [
    ...walk(projectFile(projectRoot, project.paths.theme), ['.php']),
    ...walk(projectFile(projectRoot, project.paths.plugin), ['.php']),
  ].slice(0, options.phpFileLimit ?? 200);
  if (phpFiles.length && phpBin) gates.push(await checkPhpSyntax(phpFiles, {phpBin}));

  return {pass: gates.every(gate => gate.pass), gates};
}
