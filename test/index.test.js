import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeInput, buildIssueDraft, InputValidationError } from '../src/index.js';
import { renderIssueMarkdown } from '../src/markdown.js';

const execFileAsync = promisify(execFile);

test('builds a ready draft from structured findings', () => {
  const draft = buildIssueDraft(normalizeInput({ repo: 'a/b', findings: [{ title: 'Missing check', severity: 'high', owner: 'ci', evidence: 'No test command.' }] }));
  assert.equal(draft.ready, true);
  assert.equal(draft.owner, 'ci');
  assert.equal(draft.summary.high, 1);
});

test('normalizes unknown severity to medium', () => {
  const draft = buildIssueDraft(normalizeInput({ repo: 'a/b', findings: [{ title: 'x', severity: 'urgent', evidence: 'e' }] }));
  assert.equal(draft.grouped.medium.length, 1);
});

test('rejects missing findings and malformed finding entries', () => {
  assert.throws(() => normalizeInput({ repo: 'a/b' }), (error) => error instanceof InputValidationError && error.message === 'findings must be an array');
  assert.throws(() => normalizeInput({ repo: 'a/b', findings: [null] }), /findings\[0\] must be an object/u);
});

test('rejects missing required repository and evidence fields', () => {
  assert.throws(() => normalizeInput({ findings: [] }), /repo must be a non-empty string/u);
  assert.throws(() => normalizeInput({ repo: 'a/b', findings: [{ title: 'x' }] }), /findings\[0\]\.evidence must be a non-empty string/u);
  assert.throws(() => normalizeInput({ repo: 'a/b', findings: [{ evidence: 'e' }] }), /findings\[0\]\.title must be a non-empty string/u);
});

test('rejects malformed optional text fields with field-specific errors', () => {
  const fields = ['severity', 'owner', 'file', 'reproduction', 'proposedFix', 'verification'];
  for (const field of fields) {
    assert.throws(
      () => normalizeInput({ repo: 'a/b', findings: [{ title: 'x', evidence: 'e', [field]: {} }] }),
      new RegExp(`findings\\[0\\]\\.${field} must be a non-empty string`, 'u'),
    );
  }

  assert.throws(
    () => normalizeInput({ repo: 'a/b', findings: [{ title: 'x', evidence: 'e', owner: '   ' }] }),
    /findings\[0\]\.owner must be a non-empty string/u,
  );
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

test('cli reports malformed findings as a stable data error without a stack trace', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'skill-issue-drafter-'));
  const inputPath = join(directory, 'invalid.json');
  await writeFile(inputPath, '{"repo":"a/b","findings":[null]}');

  await assert.rejects(execFileAsync('node', ['bin/skill-issue-drafter.js', inputPath]), (error) => {
    assert.equal(error.code, 3);
    assert.equal(error.stdout, '');
    assert.match(error.stderr, /Invalid findings data: findings\[0\] must be an object/u);
    assert.doesNotMatch(error.stderr, /\n\s+at /u);
    return true;
  });
});

test('cli reports input read failures without a stack trace', async () => {
  const missingPath = join(tmpdir(), 'skill-issue-drafter-missing-input.json');

  await assert.rejects(execFileAsync('node', ['bin/skill-issue-drafter.js', missingPath]), (error) => {
    assert.equal(error.code, 4);
    assert.equal(error.stdout, '');
    assert.equal(error.stderr, `Could not read findings file: ${missingPath}\n`);
    assert.doesNotMatch(error.stderr, /ENOENT|\n\s+at /u);
    return true;
  });
});

test('cli reports output write failures without a stack trace', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'skill-issue-drafter-'));
  const outputPath = join(directory, 'missing', 'issue.md');

  await assert.rejects(
    execFileAsync('node', ['bin/skill-issue-drafter.js', 'examples/findings.json', '--out', outputPath]),
    (error) => {
      assert.equal(error.code, 4);
      assert.equal(error.stdout, '');
      assert.equal(error.stderr, `Could not write output file: ${outputPath}\n`);
      assert.doesNotMatch(error.stderr, /ENOENT|\n\s+at /u);
      return true;
    },
  );
});
