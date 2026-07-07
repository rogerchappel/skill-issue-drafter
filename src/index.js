import fs from 'node:fs';

export function loadFindings(filePath) {
  return normalizeInput(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}

export function normalizeInput(input) {
  return { repo: input.repo ?? 'unknown/repo', defaultOwner: input.defaultOwner ?? 'maintainer', findings: Array.isArray(input.findings) ? input.findings.map(normalizeFinding) : [] };
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

function normalizeFinding(item) {
  return {
    title: item.title ?? '',
    severity: ['critical', 'high', 'medium', 'low'].includes(item.severity) ? item.severity : 'medium',
    owner: item.owner ?? undefined,
    file: item.file ?? undefined,
    evidence: item.evidence ?? '',
    reproduction: item.reproduction ?? 'Not provided.',
    proposedFix: item.proposedFix ?? 'Decide owner and patch scope.',
    verification: item.verification ?? 'Add or run a focused regression check.',
  };
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
