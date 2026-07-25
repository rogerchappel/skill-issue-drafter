import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

test('cli writes a draft to the requested output path', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'skill-issue-drafter-'));
  const outputPath = join(directory, 'issue.md');

  const result = await execFileAsync('node', ['bin/skill-issue-drafter.js', 'examples/findings.json', '--out', outputPath]);

  assert.equal(result.stdout, '');
  assert.match(await readFile(outputPath, 'utf8'), /No external issue was created/u);
});

test('cli rejects --out without a value', async () => {
  await assert.rejects(
    execFileAsync('node', ['bin/skill-issue-drafter.js', 'examples/findings.json', '--out']),
    (error) => {
      assert.equal(error.code, 2);
      assert.match(error.stderr, /--out requires a file path/u);
      assert.match(error.stderr, /Usage:/u);
      assert.equal(error.stdout, '');
      return true;
    },
  );
});

test('cli rejects unknown options', async () => {
  await assert.rejects(
    execFileAsync('node', ['bin/skill-issue-drafter.js', 'examples/findings.json', '--bogus']),
    (error) => {
      assert.equal(error.code, 2);
      assert.match(error.stderr, /Unknown option: --bogus/u);
      assert.match(error.stderr, /Usage:/u);
      assert.equal(error.stdout, '');
      return true;
    },
  );
});
