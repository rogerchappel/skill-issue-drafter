#!/usr/bin/env node
import fs from 'node:fs';
import { loadFindings, buildIssueDraft } from '../src/index.js';
import { renderIssueMarkdown } from '../src/markdown.js';

const VERSION = '0.1.0';
const args = process.argv.slice(2);
const inputPath = args[0];
const outIndex = args.indexOf('--out');
const outPath = outIndex >= 0 ? args[outIndex + 1] : undefined;
if (!inputPath || args.includes('--help')) {
  console.log(`skill-issue-drafter ${VERSION}

Usage: skill-issue-drafter <findings.json> [--out issue.md]
       skill-issue-drafter --version`);
  process.exit(inputPath ? 0 : 1);
}
if (inputPath === '--version' || inputPath === '-v') {
  console.log(VERSION);
  process.exit(0);
}
const markdown = renderIssueMarkdown(buildIssueDraft(loadFindings(inputPath)));
if (outPath) fs.writeFileSync(outPath, markdown + '\n');
else console.log(markdown);
process.exit(0);
