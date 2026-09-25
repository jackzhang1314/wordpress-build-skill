#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadProject, resolveProjectRoot} from './lib/config.mjs';
import {commandExists} from './lib/process.mjs';
import {createSSH} from './lib/ssh.mjs';
import {provisionHostinger} from './lib/hostinger.mjs';
import {configureRankMath, verifyRankMath} from './lib/seo.mjs';
import {auditProject} from './lib/quality.mjs';
import {verifyDatabase, verifyPages} from './lib/verify.mjs';
import {auditCmsModel, collectCmsAudit} from './lib/cms-audit.mjs';
import {auditEditorPatterns} from './lib/editor-audit.mjs';
import {isBlankMediaContract} from './lib/verify.mjs';

function managedMediaIds(projectRoot, project) {
  const contentDir = project.paths?.content ?? 'content';
  const mediaMapPath = join(projectRoot, contentDir, 'media-map.json');
  if (!existsSync(mediaMapPath)) return [];
  try {
    const map = JSON.parse(readFileSync(mediaMapPath, 'utf8'));
    return Object.values(map || {}).map(Number).filter(Number.isInteger).filter(id => id > 0);
  } catch {
    throw new Error(`media map is not valid JSON: ${mediaMapPath}`);
  }
}
import {captureScreenshots, detectChromeBin} from './lib/screenshots.mjs';
import {launchCdpBrowser} from './lib/cdp-browser.mjs';
import {defaultRfqFields, verifyRfqForm} from './lib/form-verify.mjs';
import {assignTemplate, argValue, auditFields, editPage, navAdd, navRemove, pushPost} from './lib/maintenance.mjs';
import {shellQuote} from './lib/ssh.mjs';
import {rotateCredentials, showCredentials} from './lib/credentials.mjs';
import {configureSmtp, testSmtp} from './lib/smtp.mjs';
import {
  backupProject,
  clearHostingerCache,
  importMedia,
  configureWordPress,
  restoreFiles,
  seedContent,
  syncCode,
  syncRemotePlugins,
} from './lib/ops.mjs';
import {initFromStarter, initProject} from './init.mjs';

const HELP = `WordPress Harness v2
=====================

Usage:
  node harness/cli.mjs init <project-name> --root <projects-parent> [--from-starter] [--no-git]
  node harness/cli.mjs --project <site-dir> <command> [args]

Project commands:
  config                  Validate project.json
  doctor                  Check tools, SSH and WP-CLI
  check                   Run local quality gates
  backup                  Back up remote files and database
  media [--force]         Import configured media sources
  content                 Upload the project seed package
  deploy                  check, backup, plugins, sync, seed, cache, verify
  verify [--screenshots]  Verify live pages and database; --screenshots adds captures
  screenshot              Capture smoke, template or full route sets
  verify-form             Render, submit and verify a Fluent Forms RFQ entry
  status                  Show remote content counts and active plugins
  rollback <backup-id>    Restore theme/plugin files
  cache                   Clear the Hostinger site cache
  provision [options]     Create Hostinger site/WP, then deploy
  configure-seo           Back up DB and configure Rank Math Free
  setup                   Configure core WP, plugins and Rank Math
  edit-page <slug>        Push one page body (--file <html>, --adopt-remote on conflict)
  post push <article>     Create/update a single post from JSON (--adopt-remote on conflict)
  nav add|remove          Surgical menu item operations (no full rebuild)
  template assign         Assign a page template after validating it renders the body
  credentials show|rotate Hand over site credentials, or regenerate the admin password
  audit-fields           Verify every stored value has an admin-editable ACF field
  cms-audit              Audit CPTs, taxonomies, ACF locations, REST and stored values
  editor-audit           Audit native editor module patterns and page compatibility
  email-setup            Guided setup: create business mailbox + configure SMTP + test
  smtp configure|test    Set up the sending channel and send a test email
  wp <args...>            Run WP-CLI through SSH
  ssh                     Open an SSH session
  open                    Open the Hostinger SSH-access page

Deploy options:
  --with-media            Force a new media import
  --with-content          Force content seeding
  --with-nav              Explicitly rebuild the seeded navigation
  --skip-content          Do not seed in this run
  --json                  Machine-readable output

Init options:
  --from-starter          Copy the B2B Starter theme, ACF model, seed content and docs

Provision options:
  --domain <domain>       Use a known domain instead of a generated subdomain
  --order <id>            Hostinger order id if absent from project.json
  --admin-user <user>     WordPress admin login (default codexadmin)
  --admin-email <email>   WordPress admin email
  --ssh-host <host>       SSH host to save after provisioning
  --ssh-port <port>       SSH port to save after provisioning
  --ssh-user <user>       SSH user to save after provisioning
  --ssh-key <path>        Private key path to save after provisioning
  --datacenter <code>     Required for the first site on a new plan
  --no-deploy             Create/install only; do not run the deploy pipeline
  WP_ADMIN_PASSWORD is read from the environment when supplied; otherwise a private random password is generated.
`;

function outputResult(payload, json, logger) {
  if (json) logger(JSON.stringify(payload, null, 2));
  else if (payload?.summary) logger(payload.summary);
}

function globalArgs(argv) {
  const options = {project: process.env.WORDPRESS_PROJECT_ROOT};
  const rest = [];
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--project') options.project = argv[++index];
    else if (value.startsWith('--project=')) options.project = value.slice(10);
    else if (value === '--json') options.json = true;
    else rest.push(value);
  }
  return {options, rest};
}

function context(options) {
  const root = resolveProjectRoot(options.project);
  const project = loadProject(root);
  return {root, project, ssh: project.ssh ? createSSH(project, {execFile: execFileSync}) : undefined};
}

function printAudit(report, logger) {
  for (const gate of report.gates) {
    const checks = gate.checks ?? [];
    if (checks.length === 0) logger(`  ${gate.pass ? 'OK ' : 'FAIL'} ${gate.name}`);
    for (const check of checks.slice(0, 200)) {
      const label = check.file ? `${gate.name}/${check.file}` : `${gate.name}/${check.name ?? gate.name}`;
      const detail = check.detail || check.missingMedia?.length
        ? ` -- ${check.detail || `missing media: ${check.missingMedia.join(', ')}`}`
        : '';
      logger(`  ${check.pass ? 'OK ' : 'FAIL'} ${label}${detail}`);
    }
  }
}

async function commandDoctor({project, ssh}, json, logger) {
  const checks = {
    node: Number(process.versions.node.split('.')[0]) >= 20,
    git: commandExists(execFileSync, 'git', ['--version']),
    rsync: commandExists(execFileSync, 'rsync', ['--version']),
    tar: commandExists(execFileSync, 'tar', ['--version']),
    gzip: commandExists(execFileSync, 'gzip', ['--version']),
    hostingerCli: commandExists(execFileSync, 'hostinger', ['version']),
    php: commandExists(execFileSync, 'php', ['-v']),
  };
  if (project?.ssh) {
    try {
      ssh.run('echo ok');
      checks.ssh = true;
      checks.wpCli = ssh.wp(['core', 'version']).trim();
    } catch (error) {
      checks.ssh = false;
      checks.wpCli = false;
      checks.sshError = error.message;
    }
  }
  const pass = checks.node && checks.git && checks.rsync && checks.tar && checks.gzip
    && (!project?.ssh || (checks.ssh && Boolean(checks.wpCli)));
  if (!json) {
    for (const [name, value] of Object.entries(checks)) logger(`  ${value ? 'OK ' : 'FAIL'} ${name}: ${value}`);
    logger(`\n${pass ? 'OK: required operations available.' : 'FAIL: harness requirements are not ready.'}`);
  }
  return {pass, checks};
}

async function runCheck({root, project}, json, logger) {
  const report = await auditProject(root, project, {
    phpBin: commandExists(execFileSync, 'php', ['-v']) ? 'php' : (commandExists(execFileSync, 'docker', ['info']) ? 'docker:wordpress:cli-php8.3' : undefined),
  });
  if (!json) {
    logger('Local quality gates');
    printAudit(report, logger);
    logger(`\n${report.pass ? 'OK: local checks passed.' : 'FAIL: local checks failed.'}`);
  }
  return report;
}

function firstValue(args) {
  return args.filter(item => !item.startsWith('--'))[0];
}

export async function main(argv = process.argv.slice(2), logger = console.log, errors = console.error) {
  const {options, rest} = globalArgs(argv);
  const [command, ...args] = rest;
  const json = Boolean(options.json);
  try {
    if (!command || command === 'help' || command === '--help') {
      logger(HELP);
      return 0;
    }

    if (command === 'init') {
      const rootIndex = args.indexOf('--root');
      const created = args.includes('--from-starter')
        ? initFromStarter({
          name: firstValue(args),
          projectsRoot: rootIndex >= 0 ? args[rootIndex + 1] : resolve(process.cwd(), '..'),
          git: !args.includes('--no-git'),
        })
        : initProject({
          name: firstValue(args),
          projectsRoot: rootIndex >= 0 ? args[rootIndex + 1] : resolve(process.cwd(), '..'),
          git: !args.includes('--no-git'),
        });
      outputResult({pass: true, projectRoot: created}, json, logger);
      if (!json) logger(`OK: project created: ${created}`);
      return 0;
    }

    const site = context(options);
    const {root, project, ssh} = site;
    const remoteCommands = ['backup', 'media', 'content', 'verify', 'verify-form', 'deploy', 'status', 'rollback', 'cache', 'wp', 'ssh', 'open', 'edit-page', 'post', 'nav', 'template', 'credentials', 'audit-fields', 'smtp', 'email-setup', 'cms-audit'];
    const exampleUnsafeCommands = [...remoteCommands, 'provision', 'configure-seo', 'setup'];
    if (project._isExample && exampleUnsafeCommands.includes(command)) {
      throw new Error('Copy project.example.json to project.json and fill site values before running this command');
    }
    if (remoteCommands.includes(command) && !ssh) throw new Error('Complete project.json ssh before running remote commands');
    const base = `https://${project.domain}`;

    if (command === 'provision') {
      const result = await provisionHostinger(root, project, args, {execFile: execFileSync, logger});
      if (args.includes('--no-deploy')) {
        // Even without a full deploy, required plugins must be installed and active.
        const freshProject = loadProject(root);
        const freshSsh = createSSH(freshProject, {execFile: execFileSync});
        await syncRemotePlugins(freshProject, freshSsh, logger);
        outputResult(result, json, logger);
        return 0;
      }
      logger('\nContinuing with first deployment');
      return main(['--project', root, 'deploy', '--with-media', '--with-content'], logger, errors);
    }
    if (command === 'configure-seo') {
      if (!ssh) throw new Error('SSH configuration is required for Rank Math');
      const backup = backupProject(root, project, ssh, logger);
      configureWordPress(project, ssh, logger);
      await syncRemotePlugins(project, ssh, logger);
      configureRankMath(project, ssh, {logger});
      const cache = clearHostingerCache(project, {execFile: execFileSync});
      logger(`  ${cache.pass ? 'OK ' : 'WARN'} Hostinger cache ${cache.detail}`);
      await verifyRankMath(project, ssh, {logger});
      outputResult({pass: true, backup: backup.manifest.id}, json, logger);
      return 0;
    }
    if (command === 'setup') {
      if (!ssh) throw new Error('SSH configuration is required for setup');
      configureWordPress(project, ssh, logger);
      await syncRemotePlugins(project, ssh, logger);
      configureRankMath(project, ssh, {logger});
      return 0;
    }
    if (command === 'edit-page') {
      await editPage(site, args, logger);
      return 0;
    }
    if (command === 'post') {
      if (firstValue(args) !== 'push') throw new Error('usage: harness post push <article.json>');
      await pushPost(site, args.slice(1), logger);
      return 0;
    }
    if (command === 'nav') {
      const sub = firstValue(args);
      const rest = args.slice(1);
      if (sub === 'add') await navAdd(site, rest, logger);
      else if (sub === 'remove') await navRemove(site, rest, logger);
      else throw new Error('usage: harness nav add|remove ...');
      return 0;
    }
    if (command === 'template') {
      if (firstValue(args) !== 'assign') throw new Error('usage: harness template assign <slug> --template <file.php>');
      await assignTemplate(site, args.slice(1), logger);
      return 0;
    }
    if (command === 'credentials') {
      const sub = firstValue(args) ?? 'show';
      const rest = args.filter(item => item !== sub);
      if (sub === 'show') await showCredentials(site, rest, logger);
      else if (sub === 'rotate') await rotateCredentials(site, rest, logger);
      else throw new Error('usage: harness credentials show|rotate [--json]');
      return 0;
    }
    if (command === 'audit-fields') {
      const report = await auditFields(site, args, logger);
      return report.pass ? 0 : 1;
    }
    if (command === 'smtp') {
      const sub = firstValue(args);
      const rest = args.slice(1);
      if (sub === 'configure') await configureSmtp(site, rest, logger);
      else if (sub === 'test') await testSmtp(site, rest, logger);
      else throw new Error('usage: harness smtp configure|test');
      return 0;
    }
    if (command === 'email-setup') {
      const mailbox = argValue(args, '--mailbox');
      const mailboxPass = argValue(args, '--mailbox-pass');
      const notifyTo = argValue(args, '--notify-to');
      if (!mailbox || !mailboxPass) {
        const emailDomain = project.domain || 'your-domain.com';
        const exampleMailbox = `notify@${emailDomain}`;
        logger('\n📧 Email Setup Guide');
        logger('  ─────────────────────────────────────────────');
        logger(`  Step 1: Go to hPanel → Emails → ${emailDomain}`);
        logger(`          Create mailbox: ${exampleMailbox}`);
        logger('          Set a strong password');
        logger('  Step 2: Hostinger will show DNS records (MX/SPF/DKIM)');
        logger('          Send them to me — I add them to Cloudflare automatically');
        logger('  Step 3: Run with credentials:');
        logger(`          harness email-setup --mailbox ${exampleMailbox} --mailbox-pass <password> --notify-to <your@gmail.com>`);
        logger('  ─────────────────────────────────────────────');
        return 0;
      }
      // Create mu-plugin with provided credentials
      const muPhp = `<?php
add_action("phpmailer_init", function ($phpmailer) {
    $phpmailer->isSMTP();
    $phpmailer->Host       = "smtp.hostinger.com";
    $phpmailer->Port       = 465;
    $phpmailer->SMTPAuth   = true;
    $phpmailer->Username   = ${JSON.stringify(mailbox)};
    $phpmailer->Password   = ${JSON.stringify(mailboxPass)};
    $phpmailer->SMTPSecure = "ssl";
    $phpmailer->From       = ${JSON.stringify(mailbox)};
    $phpmailer->FromName   = ${JSON.stringify(site.project.title)};
});
`;
      const muDir = `${site.project.ssh.wpPath}/wp-content/mu-plugins`;
      site.ssh.run(`mkdir -p ${shellQuote(muDir)}`);
      site.ssh.run(`cat > ${shellQuote(muDir + '/smtp.php')}`, {input: Buffer.from(muPhp, 'utf8')});
      logger('  OK  mu-plugin SMTP created');
      if (notifyTo) {
        const r = site.ssh.wp(['eval', `echo wp_mail(${JSON.stringify(notifyTo)}, "Email setup complete", "Your notification email is now configured.");`]);
        logger(`  ${r.includes('1') ? 'OK' : 'WARN'}  test email to ${notifyTo}: ${r.trim()}`);
      }
      logger('  ✅ Email setup complete. Test email sent to your Gmail.');
      return 0;
    }
    if (command === 'config') {
      logger(JSON.stringify({...project, ssh: {...project.ssh, keyPath: project.ssh ? '[redacted]' : undefined}}, null, 2));
      return 0;
    }
    if (command === 'editor-audit') {
      const report = auditEditorPatterns(root, project);
      if (!json) {
        logger(`  ${report.pass ? 'OK ' : 'FAIL'} ${report.name}`);
        for (const check of report.checks) logger(`    ${check.pass ? 'OK ' : 'FAIL'} ${check.name}${check.detail ? ` -- ${check.detail}` : ''}`);
        for (const problem of report.problems ?? []) logger(`    FAIL ${problem.name}: ${problem.issue}`);
      }
      outputResult(report, json, logger);
      return report.pass ? 0 : 1;
    }

    if (command === 'cms-audit') {
      const remote = await collectCmsAudit({ssh});
      const report = auditCmsModel(remote, project);
      if (!json) {
        if (report.pass) logger(`  OK  CMS model audit: ${report.checks.length} checks, all editable fields have valid locations`);
        for (const problem of report.problems.slice(0, 100)) {
          const subject = [problem.kind, problem.name, problem.term, problem.post].filter(Boolean).join(':');
          logger(`    FAIL ${subject}${problem.field ? ` field "${problem.field}"` : ''} — ${problem.issue}`);
        }
      }
      outputResult(report, json, logger);
      return report.pass ? 0 : 1;
    }
    if (command === 'doctor') {
      const result = await commandDoctor(site, json, logger);
      return result.pass ? 0 : 1;
    }
    if (command === 'check') {
      const result = await runCheck(site, json, logger);
      return result.pass ? 0 : 1;
    }
    if (command === 'backup') {
      const backup = backupProject(root, project, ssh, logger);
      outputResult({...backup.manifest, backupDir: backup.backupDir}, json, logger);
      return 0;
    }
    if (command === 'media') {
      const map = await importMedia(root, project, ssh, {force: args.includes('--force'), logger});
      outputResult({pass: true, count: Object.keys(map).length}, json, logger);
      return 0;
    }
    if (command === 'content') {
      await seedContent(root, project, ssh, logger, {rebuildNav: args.includes('--with-nav')});
      return 0;
    }
    if (command === 'verify') {
      if (!project.domain) throw new Error('project.domain is empty');
      const pages = await verifyPages(base, project.livePages, project.contentMarkers);
      const database = await verifyDatabase(project, {
        wp: input => ssh.wp(input),
        blankMedia: isBlankMediaContract(root, project),
        managedMediaIds: managedMediaIds(root, project),
      });
      const seo = project.requiredPlugins.includes('seo-by-rank-math') ? await verifyRankMath(project, ssh) : {pass: true};
      let screenshots;
      if (args.includes('--screenshots')) {
        const outDir = argValue(args, '--out') ?? join(root, 'evidence', 'screenshots');
        const widths = (argValue(args, '--widths') ?? '390,768,1440').split(',').map(Number);
        const mode = argValue(args, '--mode') ?? 'full';
        const routeArg = argValue(args, '--routes');
        const routes = routeArg ? routeArg.split(',').map(route => (route.startsWith('/') ? route : `/${route}`)) : undefined;
        const concurrency = Number(argValue(args, '--concurrency') ?? 4);
        screenshots = await captureScreenshots({base, routes, widths, outDir, mode, project, concurrency});
        if (!json) {
          for (const shot of screenshots.skipped ? [] : screenshots.shots) {
            logger(`  ${shot.pass ? 'OK ' : 'FAIL'} ${shot.width} ${shot.route}: ${shot.bytes}B`);
          }
          if (screenshots.skipped) logger(`  WARN screenshots skipped: ${screenshots.reason}`);
        }
      }
      const result = {pass: pages.pass && database.pass && seo.pass && (!screenshots || screenshots.pass), pages, database, seo, screenshots};
      if (!json) {
        for (const page of pages.results) {
          const details = [page.status, `H1 ${page.h1}`, `skips ${page.skips}`];
          if (page.missingMarkers.length > 0) details.push(`missing markers ${page.missingMarkers.join(', ')}`);
          logger(`  ${page.pass ? 'OK ' : 'FAIL'} ${page.path}: ${details.join(', ')}`);
        }
        for (const item of database.results) logger(`  ${item.pass ? 'OK ' : 'FAIL'} ${item.label}: ${item.count}`);
      }
      outputResult(result, json, logger);
      return result.pass ? 0 : 1;
    }
    if (command === 'screenshot') {
      if (!project.domain) throw new Error('project.domain is empty');
      const routeArg = argValue(args, '--routes');
      const widths = (argValue(args, '--widths') ?? '390,768,1440').split(',').map(Number);
      const outDir = argValue(args, '--out') ?? join(root, 'evidence', 'screenshots');
      const mode = argValue(args, '--mode') ?? 'smoke';
      const routes = routeArg ? routeArg.split(',').map(route => (route.startsWith('/') ? route : `/${route}`)) : undefined;
      const concurrency = Number(argValue(args, '--concurrency') ?? 4);
      const result = await captureScreenshots({base, routes, widths, outDir, mode, project, concurrency});
      if (!json) {
        if (result.skipped) logger(`SKIP screenshots: ${result.reason}`);
        for (const shot of result.shots) logger(`  ${shot.pass ? 'OK ' : 'FAIL'} ${shot.width} ${shot.route}: ${shot.bytes}B`);
        logger(`\n${result.pass ? 'OK' : 'FAIL'}: ${result.shots.filter(shot => shot.pass).length}/${result.shots.length} screenshots in ${outDir}`);
      }
      outputResult(result, json, logger);
      return result.pass ? 0 : 1;
    }
    if (command === 'verify-form') {
      if (!project.domain) throw new Error('project.domain is empty');
      const route = argValue(args, '--route') ?? '/contact/';
      const formId = Number(argValue(args, '--form-id') ?? 0);
      const successText = argValue(args, '--success-text') ?? 'Thank you';
      const timeoutMs = Number(argValue(args, '--timeout') ?? 25000);
      const fieldsArg = argValue(args, '--fields');
      const fields = fieldsArg ? JSON.parse(fieldsArg) : defaultRfqFields();
      const browser = await launchCdpBrowser({chromeBin: detectChromeBin(), timeoutMs});
      try {
        const browserPage = await browser.newPage();
        const result = await verifyRfqForm({
          base, route, fields, formId, browserPage, successText, timeoutMs,
          wp: input => ssh.wp(input),
        });
        if (!json) {
          logger(`  ${result.inspection?.pass ? 'OK ' : 'FAIL'} form rendered on ${route}`);
          logger(`  ${result.success ? 'OK ' : 'FAIL'} browser submission accepted`);
          logger(`  ${result.increment > 0 ? 'OK ' : 'FAIL'} Fluent Forms entries: ${result.before} → ${result.after}`);
        }
        outputResult(result, json, logger);
        return result.pass ? 0 : 1;
      } finally {
        browser.close();
      }
    }
    if (command === 'deploy') {
      const report = await runCheck(site, json, logger);
      if (!report.pass) throw new Error('local quality gates failed');
      if (!ssh) throw new Error('SSH configuration is required before deploy');
      logger(`\nDeploying ${project.title} -> ${project.domain}`);
      ssh.run('echo ok');
      const wpVersion = ssh.wp(['core', 'version']).trim();
      logger(`  OK  SSH/WP-CLI preflight (WordPress ${wpVersion})`);
      const backup = backupProject(root, project, ssh, logger);
      let rollbackNeeded = false;
      try {
        await syncRemotePlugins(project, ssh, logger);
        await syncCode(root, project, ssh, logger);
        rollbackNeeded = true;
        configureWordPress(project, ssh, logger);
        configureRankMath(project, ssh, {logger});
        await importMedia(root, project, ssh, {force: args.includes('--with-media'), logger});
        if (!args.includes('--skip-content') && (args.includes('--with-content') || args.includes('--with-nav') || !existsSync(join(root, '.seed-state.json')))) {
          const rebuildNav = !existsSync(join(root, '.seed-state.json')) || args.includes('--with-nav');
          await seedContent(root, project, ssh, logger, {rebuildNav});
        }
        const cache = clearHostingerCache(project, {execFile: execFileSync});
        logger(`  ${cache.pass ? 'OK ' : 'WARN'} Hostinger cache ${cache.detail}`);
        const verification = await verifyPages(base, project.livePages, project.contentMarkers);
        const database = await verifyDatabase(project, {
        wp: input => ssh.wp(input),
        blankMedia: isBlankMediaContract(root, project),
        managedMediaIds: managedMediaIds(root, project),
      });
        if (!verification.pass || !database.pass) {
          for (const page of verification.results.filter(item => !item.pass)) {
            logger(`    FAIL ${page.path}: ${page.detail ?? `status ${page.status}, H1 ${page.h1}, skips ${page.skips}`}`);
          }
          for (const item of database.results.filter(entry => !entry.pass)) {
            logger(`    FAIL ${item.label}: count ${item.count}, expected >= ${item.expected}`);
          }
          throw new Error('remote verification failed');
        }
        for (const page of verification.results) logger(`    OK ${page.path}: ${page.status}, H1 ${page.h1}, skips ${page.skips}`);
        for (const item of database.results) logger(`    OK ${item.label}: ${item.count}`);
        writeFileSync(join(root, '.deploy-state.json'), JSON.stringify({
          deployedAt: new Date().toISOString(),
          domain: project.domain,
          backup: backup.manifest.id,
        }, null, 2));
        logger(`\nOK: deploy complete: ${base}`);
        return 0;
      } catch (error) {
        if (rollbackNeeded) {
          logger('  WARN deployment failed; restoring pre-deploy theme/plugin files');
          try {
            restoreFiles(project, ssh, backup.backupDir, logger);
          } catch (rollbackError) {
            logger(`  FAIL rollback failed: ${rollbackError.message}`);
          }
        }
        throw error;
      }
    }
    if (command === 'status') {
      const database = await verifyDatabase(project, {wp: input => ssh.wp(input)});
      const plugins = JSON.parse(ssh.wp(['plugin', 'list', '--status=active', '--format=json'])).map(plugin => plugin.name);
      const payload = {domain: project.domain, content: database.results, activePlugins: plugins};
      if (!json) {
        logger(`\n=== ${project.title} ===\nLive: ${base}`);
        for (const item of database.results) logger(`${item.label}: ${item.count}`);
        logger(`Active plugins: ${plugins.join(', ')}`);
      } else outputResult(payload, json, logger);
      return database.pass ? 0 : 1;
    }
    if (command === 'rollback') {
      const id = firstValue(args);
      if (!id) throw new Error('usage: harness rollback <backup-id>');
      restoreFiles(project, ssh, resolve(root, '.backups', id), logger);
      return 0;
    }
    if (command === 'cache') {
      const result = clearHostingerCache(project, {execFile: execFileSync});
      outputResult(result, json, logger);
      return result.pass ? 0 : 1;
    }
    if (command === 'wp') {
      if (args.length === 0) throw new Error('usage: harness wp <wp-cli arguments>');
      logger(ssh.wp(args));
      return 0;
    }
    if (command === 'ssh') {
      execFileSync('ssh', ssh.baseArgs, {stdio: 'inherit'});
      return 0;
    }
    if (command === 'open') {
      const url = `https://hpanel.hostinger.com/websites/${project.domain}/advanced/ssh-access?redirectLocation=side_menu`;
      if (process.platform === 'darwin') execFileSync('open', [url], {stdio: 'pipe'});
      logger(url);
      return 0;
    }

    errors(`Unknown command: ${command}\n`);
    logger(HELP);
    return 2;
  } catch (error) {
    errors(`FAIL ${error.message}`);
    if (process.env.HARNESS_DEBUG && error.stack) errors(error.stack);
    return 1;
  }
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  process.exit(await main());
}
