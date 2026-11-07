import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function load(files, globals = {}) {
  const context = vm.createContext({ ...globals });
  for (const file of files) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  }
  return context;
}

test('normalizeJobUrl_ validates URLs and removes only tracking parameters', () => {
  const context = load(['src/util.gs']);
  assert.equal(context.normalizeJobUrl_('not a url'), '');
  assert.equal(
    context.normalizeJobUrl_('HTTPS://Jobs.Example.com/roles/123/?utm_source=x&gh_jid=42#apply'),
    'https://jobs.example.com/roles/123?gh_jid=42',
  );
  assert.notEqual(
    context.normalizeJobUrl_('https://example.com/job?id=1'),
    context.normalizeJobUrl_('https://example.com/job?id=2'),
  );
});

test('findRowById_ handles an empty data sheet without requesting a zero-height range', () => {
  let rangeCalled = false;
  const sheet = {
    getLastColumn: () => 1,
    getRange: (...args) => {
      if (args[0] === 1) return { getValues: () => [['job_id']] };
      rangeCalled = true;
      throw new Error('data range should not be requested');
    },
    getLastRow: () => 1,
  };
  const context = load(['src/util.gs']);
  assert.equal(context.findRowById_(sheet, 'job_id', 'missing'), -1);
  assert.equal(rangeCalled, false);
});

test('AI-disabled extraction retains pasted text and always requests human review', () => {
  const context = load(['src/ai.gs'], {
    coerceString_: (value) => String(value ?? ''),
    getBooleanSetting: () => false,
  });
  const result = context.aiExtractJobFromUrl('https://example.com/job', null, 'A pasted description');
  assert.equal(result.job_description, 'A pasted description');
  assert.equal(result.needs_review, true);
});

test('sidebar uses an evaluated template and generated deployable includes', () => {
  const ui = fs.readFileSync('src/ui.gs', 'utf8');
  const html = fs.readFileSync('src/web/sidebar.html', 'utf8');
  const browserJs = fs.readFileSync('src/web/sidebar.js', 'utf8');
  const deployedJs = fs.readFileSync('src/web/sidebar-js.html', 'utf8');
  const browserCss = fs.readFileSync('src/web/sidebar.css', 'utf8');
  const deployedCss = fs.readFileSync('src/web/sidebar-css.html', 'utf8');
  assert.match(ui, /createTemplateFromFile\("web\/sidebar"\)\.evaluate\(\)/);
  assert.match(html, /include_\('web\/sidebar-js'\)/);
  assert.equal(deployedJs, browserJs);
  assert.equal(deployedCss, browserCss);
  assert.doesNotMatch(browserJs, /\.innerHTML\s*=/);
});

test('URL fetch configuration does not claim an unsupported timeout option', () => {
  const intake = fs.readFileSync('src/intake.gs', 'utf8');
  const research = fs.readFileSync('src/research.gs', 'utf8');
  assert.doesNotMatch(intake + research, /\btimeout\s*:/);
  assert.match(intake, /followRedirects:\s*true/);
  assert.match(intake, /User-Agent/);
});

test('tracking tokens round-trip and email HTML is escaped', () => {
  const context = load(['src/tasks.gs', 'src/reconciliation.gs']);
  const token = context.buildTrackingToken_('job-1', 'task-2', 'outreach');
  const parsed = context.parseTrackingToken_(token);
  assert.equal(parsed.job_id, 'job-1');
  assert.equal(parsed.task_id, 'task-2');
  assert.equal(parsed.action, 'outreach');
  assert.equal(context.escapeHtml_('<b>unsafe & text</b>'), '&lt;b&gt;unsafe &amp; text&lt;/b&gt;');
});
