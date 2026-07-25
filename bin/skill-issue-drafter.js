#!/usr/bin/env node
import fs from 'node:fs';
import { loadFindings, buildIssueDraft } from '../src/index.js';
import { renderIssueMarkdown } from '../src/markdown.js';

const VERSION = '0.1.0';
const args = process.argv.slice(2);
const usage = `skill-issue-drafter ${VERSION}

Usage: skill-issue-drafter <findings.json> [--out issue.md]
       skill-issue-drafter --help
       skill-issue-drafter --version`;

function usageError(message) {
  console.error(`${message}\n\n${usage}`);
  process.exit(2);
}

if (args.includes('--help')) {
  console.log(usage);
  process.exit(0);
}
if (args.length === 1 && (args[0] === '--version' || args[0] === '-v')) {
  console.log(VERSION);
  process.exit(0);
}
if (args.length === 0) {
  console.log(usage);
  process.exit(1);
}

let inputPath;
let outPath;
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === '--out') {
    if (index + 1 >= args.length || args[index + 1].startsWith('-')) {
      usageError('--out requires a file path.');
    }
    outPath = args[index + 1];
    index += 1;
  } else if (argument.startsWith('-')) {
    usageError(`Unknown option: ${argument}`);
  } else if (!inputPath) {
    inputPath = argument;
  } else {
    usageError(`Unexpected argument: ${argument}`);
  }
}
if (!inputPath) usageError('A findings JSON file is required.');

const markdown = renderIssueMarkdown(buildIssueDraft(loadFindings(inputPath)));
if (outPath) fs.writeFileSync(outPath, markdown + '\n');
else console.log(markdown);
process.exit(0);
