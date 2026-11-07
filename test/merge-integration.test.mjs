import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import vm from 'node:vm';

test('complete Apps Script backend loads with menu and trigger handlers available', () => {
  const context = vm.createContext({});
  for (const file of fs.readdirSync('src').filter(file => file.endsWith('.gs'))) {
    vm.runInContext(fs.readFileSync(`src/${file}`, 'utf8'), context, { filename: file });
  }
  for (const name of ['RUN_ME_FIRST', 'runMeFirst', 'openSidebar', 'getSetting',
    'logEvent', 'handleOnEdit', 'scanInboxForLeads', 'scanInboxForSignals',
    'reconcileSentMail', 'integrityCheck', 'uiIngestUrl', 'uiApplySelected',
    'uiDraftOutreachSelected', 'uiDraftFollowupSelected']) {
    assert.equal(typeof context[name], 'function', `${name} must be deployed`);
  }
  assert.equal(context.JOBOS_DEFAULT_SETTINGS.ENABLE_AUTO_SEND, 'false');
  const schema = JSON.parse(fs.readFileSync('packages/shared/schemas/SETTINGS.schema.json', 'utf8'));
  for (const key of schema.required) {
    assert.equal(typeof context.JOBOS_DEFAULT_SETTINGS[key], 'string', `${key} must have a default`);
  }
  assert.equal(JSON.parse(fs.readFileSync('src/appsscript.json', 'utf8')).runtimeVersion, 'V8');
});

test('dashboard counts all open tasks while limiting the priority list', () => {
  const tasks = Array.from({ length: 12 }, (_, i) => ({ status: 'open', due_date: String(i) }));
  tasks.push({ status: 'done' });
  const context = vm.createContext({
    getSheetOrThrow_: name => name,
    readAllRowsByMap_: name => name === 'TASKS' ? tasks : [],
    isTruthy_: Boolean,
  });
  vm.runInContext(fs.readFileSync('src/ui.gs', 'utf8'), context);
  const data = context.uiGetDashboardData();
  assert.equal(data.kpis.tasks_open, 12);
  assert.equal(data.priority_tasks.length, 10);
});

test('clasp selection preserves local configuration unless explicitly forced', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'jobos-clasp-'));
  const script = path.resolve('scripts/clasp-use.mjs');
  const source = JSON.stringify({ scriptId: 'test-source', rootDir: 'src' });
  const local = JSON.stringify({ scriptId: 'test-local', rootDir: 'src' });
  const dest = path.join(cwd, '.clasp.json');
  try {
    fs.writeFileSync(path.join(cwd, '.clasp-alyssa.json'), source);
    const run = (target, force = '') => spawnSync(process.execPath, [script, target], {
      cwd, env: { ...process.env, FORCE: force }, encoding: 'utf8',
    });
    assert.equal(run('alyssa').status, 0);
    assert.equal(fs.readFileSync(dest, 'utf8'), source);
    fs.writeFileSync(dest, local);
    assert.equal(run('alyssa').status, 0);
    assert.equal(fs.readFileSync(dest, 'utf8'), local);
    assert.equal(run('unknown', '1').status, 1);
    assert.equal(fs.readFileSync(dest, 'utf8'), local);
    assert.equal(run('alyssa', '1').status, 0);
    assert.equal(fs.readFileSync(dest, 'utf8'), source);
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
