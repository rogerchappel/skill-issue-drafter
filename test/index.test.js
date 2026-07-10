import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { normalizeInput, buildIssueDraft } from '../src/index.js';
import { renderIssueMarkdown } from '../src/markdown.js';

const execFileAsync = promisify(execFile);

test('builds a ready draft from structured findings', () => {
  const draft = buildIssueDraft(normalizeInput({ repo: 'a/b', findings: [{ title: 'Missing check', severity: 'high', owner: 'ci', evidence: 'No test command.' }] }));
  assert.equal(draft.ready, true);
  assert.equal(draft.owner, 'ci');
  assert.equal(draft.summary.high, 1);
});

test('normalizes unknown severity to medium', () => {
  const draft = buildIssueDraft(normalizeInput({ findings: [{ title: 'x', severity: 'urgent', evidence: 'e' }] }));
  assert.equal(draft.grouped.medium.length, 1);
});

test('markdown states dry-run safety boundary', () => {
  const draft = buildIssueDraft(normalizeInput({ repo: 'a/b', findings: [{ title: 'x', evidence: 'e' }] }));
  assert.match(renderIssueMarkdown(draft), /No external issue was created/);
});

test('cli prints help and version', async () => {
  const help = await execFileAsync('node', ['bin/skill-issue-drafter.js', '--help']);
  const version = await execFileAsync('node', ['bin/skill-issue-drafter.js', '--version']);

  assert.match(help.stdout, /skill-issue-drafter 0\.1\.0/u);
  assert.match(help.stdout, /--version/u);
  assert.equal(version.stdout, '0.1.0\n');
});
