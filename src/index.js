import fs from 'node:fs';

export function loadFindings(filePath) {
  return normalizeInput(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

export class InputValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputValidationError';
  }
}

export function normalizeInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new InputValidationError('input must be a JSON object');
  requireNonEmptyString(input.repo, 'repo');
  if (!Array.isArray(input.findings)) throw new InputValidationError('findings must be an array');
  if (input.findings.length === 0) throw new InputValidationError('findings must contain at least one item');
  if (input.defaultOwner !== undefined) requireNonEmptyString(input.defaultOwner, 'defaultOwner');

  return {
    repo: input.repo.trim(),
    defaultOwner: input.defaultOwner?.trim() ?? 'maintainer',
    findings: input.findings.map((item, index) => normalizeFinding(item, index)),
  };
}

export function buildIssueDraft(input) {
  const findings = input.findings;
  const grouped = groupBySeverity(findings);
  return {
    repo: input.repo,
    title: makeTitle(findings),
    owner: dominantOwner(findings, input.defaultOwner),
    grouped,
    summary: summarize(findings),
    ready: findings.length > 0 && findings.every((item) => item.title && item.evidence),
  };
}

function normalizeFinding(item, index) {
  const path = `findings[${index}]`;
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw new InputValidationError(`${path} must be an object`);
  requireNonEmptyString(item.title, `${path}.title`);
  requireNonEmptyString(item.evidence, `${path}.evidence`);
  for (const field of ['severity', 'owner', 'file', 'reproduction', 'proposedFix', 'verification']) {
    if (item[field] !== undefined) requireNonEmptyString(item[field], `${path}.${field}`);
  }

  const severity = item.severity?.trim();
  return {
    title: item.title.trim(),
    severity: ['critical', 'high', 'medium', 'low'].includes(severity) ? severity : 'medium',
    owner: item.owner?.trim(),
    file: item.file?.trim(),
    evidence: item.evidence.trim(),
    reproduction: item.reproduction?.trim() ?? 'Not provided.',
    proposedFix: item.proposedFix?.trim() ?? 'Decide owner and patch scope.',
    verification: item.verification?.trim() ?? 'Add or run a focused regression check.',
  };
}

function requireNonEmptyString(value, path) {
  if (typeof value !== 'string' || value.trim() === '') throw new InputValidationError(`${path} must be a non-empty string`);
}

function groupBySeverity(findings) {
  return findings.reduce((acc, item) => {
    (acc[item.severity] ??= []).push(item);
    return acc;
  }, { critical: [], high: [], medium: [], low: [] });
}

function dominantOwner(findings, fallback) {
  const counts = new Map();
  for (const item of findings) if (item.owner) counts.set(item.owner, (counts.get(item.owner) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? fallback;
}

function makeTitle(findings) {
  if (findings.length === 0) return 'Follow-up: review agent findings';
  const top = findings.find((item) => item.severity === 'critical') ?? findings.find((item) => item.severity === 'high') ?? findings[0];
  return `Follow-up: ${top.title}`;
}

function summarize(findings) {
  return { total: findings.length, critical: findings.filter((item) => item.severity === 'critical').length, high: findings.filter((item) => item.severity === 'high').length };
}
