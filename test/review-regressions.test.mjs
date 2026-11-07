import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function load(files, globals = {}) {
  const context = vm.createContext(globals);
  for (const file of files) vm.runInContext(fs.readFileSync(`src/${file}.gs`, 'utf8'), context);
  return context;
}

test('all sidebar sheet responses serialize nested dates', () => {
  const row = { job_id: 'j1', status: 'open', created_at: new Date('2026-01-02T00:00:00Z') };
  const context = load(['ui'], {
    getSheetOrThrow_: name => name, readAllRowsByMap_: () => [row],
    findRowById_: () => 2, readRowByMap: () => row,
    isTruthy_: Boolean, getTasksByFilters_: () => [row],
  });
  const expected = '2026-01-02T00:00:00.000Z';
  assert.equal(context.uiGetDashboardData().recent_logs[0].created_at, expected);
  assert.equal(context.uiGetJobs({})[0].created_at, expected);
  assert.equal(context.uiGetJobDetail('j1').job.created_at, expected);
  assert.equal(context.uiGetJobDetail('j1').tasks[0].created_at, expected);
  assert.equal(context.uiGetTasks({})[0].created_at, expected);
});

test('duplicate lead emails preserve applied and archived job statuses', () => {
  for (const status of ['applied', 'archived', 'new']) {
    const job = { status };
    const message = { isUnread: () => true, getId: () => 'm1',
      getBody: () => 'https://example.com/job', getPlainBody: () => 'job', markRead() {} };
    const context = load(['leads'], {
      LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
      getAllSettings: () => ({ GMAIL_LABEL_PREFIX: 'JOBOS' }),
      GmailApp: { getUserLabelByName: () => ({ getThreads: () => [{ getMessages: () => [message], removeLabel() {} }] }) },
      getSheetOrThrow_: name => name, findRowById_: sheet => sheet === 'LEADS' ? -1 : 2,
      ingestJobFromUrl_: () => ({ job_id: 'j1', created: status === 'new' }),
      updateRowByMap: (sheet, row, patch) => Object.assign(job, patch),
      appendRowByMap() {}, generateId_: () => 'lead1',
      logEvent: (level, action, j, t, details) => { assert.notEqual(level, 'ERROR', JSON.stringify(details)); },
    });
    context.scanInboxForLeads();
    assert.equal(job.status, status === 'new' ? 'lead' : status);
    assert.equal(job.lead_email_message_id, 'm1');
  }
});

test('sent or deleted outreach drafts are replaced and saved to job and task', () => {
  let created = 0;
  const job = { job_id: 'j1', outreach_draft_id: 'gone' };
  let taskDraft;
  const context = load(['tasks'], {
    getSheetOrThrow_: name => name, findRowById_: () => 2,
    readRowByMap: () => job, aiDraftOutreach: () => ({ subject: 'Hello', body: 'Text' }),
    getSignatureBlock_: () => '', getSetting: () => '', formatDate_: () => '',
    GmailApp: { getDraft: () => { throw new Error('Draft not found'); }, getDrafts: () => [],
      createDraft: () => { created++; return { getId: () => 'replacement' }; } },
    updateRowByMap: (s, r, patch) => Object.assign(job, patch), logEvent() {},
  });
  context.findLatestTaskRowForJob_ = () => -1;
  context.createTaskForJob_ = () => 't2';
  context.updateTaskDraft_ = (id, draft) => { taskDraft = [id, draft]; };
  assert.equal(context.createOutreachDraftForJob('j1'), 'replacement');
  assert.equal(created, 1);
  assert.equal(job.outreach_draft_id, 'replacement');
  assert.deepEqual(taskDraft, ['t2', 'replacement']);
});

test('draft lookup errors do not create duplicates when the draft still exists', () => {
  const context = load(['tasks'], {
    GmailApp: { getDraft: () => { throw new Error('Transient failure'); },
      getDrafts: () => [{ getId: () => 'existing' }] },
  });
  assert.throws(() => context.findSavedDraft_('existing'), /Transient failure/);
});

test('reconciliation remembers every sent message and ignores inbound quotes and drafts', () => {
  const ledger = [];
  const job = {};
  const task = {};
  let jobWrites = 0;
  const headers = ['type', 'message_id'];
  const interactions = {
    getLastRow: () => ledger.length + 1, getLastColumn: () => headers.length,
    getRange: () => ({ getValues: () => ledger.map(row => headers.map(key => row[key])) }),
  };
  const tasks = { getLastRow: () => task.sent_message_id ? 2 : 1,
    getRange: () => ({ getValues: () => [[task.sent_message_id]] }) };
  const message = (id, from, date, draft = false) => ({
    getId: () => id, getFrom: () => from, isDraft: () => draft,
    getDate: () => new Date(date), getBody: () => '[[JOBOS job_id=j1 task_id=t1 action=outreach]]',
    getPlainBody: () => '',
  });
  const messages = [
    message('m1', 'Me <me@example.com>', '2026-01-01T12:00:00Z'),
    message('inbound', 'recruiter@example.com', '2026-01-02T12:00:00Z'),
    message('m2', 'alias@example.com', '2026-01-03T12:00:00Z'),
    message('draft', 'me@example.com', '2026-01-04T12:00:00Z', true),
  ];
  const context = load(['reconciliation'], {
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
    getAllSettings: () => ({ GMAIL_LABEL_PREFIX: 'JOBOS' }),
    GmailApp: { getUserLabelByName: () => ({}), getAliases: () => ['alias@example.com'],
      search: () => [{ getMessages: () => messages, getId: () => 'thread1', addLabel() {} }] },
    Session: { getEffectiveUser: () => ({ getEmail: () => 'me@example.com' }) },
    getSheetOrThrow_: name => name === 'TASKS' ? tasks : name === 'INTERACTIONS' ? interactions : job,
    getHeaderMap: sheet => sheet === tasks ? { sent_message_id: 1 } : { type: 1, message_id: 2 },
    findRowById_: () => 2, readRowByMap: () => job,
    updateRowByMap: (sheet, row, patch) => { Object.assign(sheet === tasks ? task : job, patch); if (sheet === job) jobWrites++; },
    appendRowByMap: (sheet, row) => ledger.push(row), generateId_: () => 'interaction',
    formatDate_: date => date.toISOString().slice(0, 10), getNumberSetting: () => 3,
    logEvent: (level, action, j, t, details) => { assert.notEqual(level, 'ERROR', JSON.stringify(details)); },
  });
  context.reconcileSentMail();
  assert.deepEqual(ledger.map(row => row.message_id), ['m1', 'm2']);
  assert.equal(job.next_follow_up_date, '2026-01-06');
  assert.equal(jobWrites, 2);
  context.reconcileSentMail();
  assert.equal(ledger.length, 2);
  assert.equal(jobWrites, 2);
  assert.equal(job.next_follow_up_date, '2026-01-06');
});
