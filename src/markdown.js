export function renderIssueMarkdown(draft) {
  const lines = [`# ${draft.title}`, '', `Repository: ${draft.repo}`, `Suggested owner: ${draft.owner}`, '', '## Summary', '', `Total findings: ${draft.summary.total}`, `Critical: ${draft.summary.critical}`, `High: ${draft.summary.high}`, '', '## Findings'];
  for (const severity of ['critical', 'high', 'medium', 'low']) {
    const items = draft.grouped[severity] ?? [];
    if (items.length === 0) continue;
    lines.push('', `### ${severity.toUpperCase()}`);
    for (const item of items) {
      lines.push('', `#### ${item.title || 'Untitled finding'}`);
      if (item.file) lines.push(`Affected file: \`${item.file}\``);
      if (item.owner) lines.push(`Owner: ${item.owner}`);
      lines.push('', '**Evidence**', item.evidence || 'Missing evidence.', '', '**Reproduction**', item.reproduction, '', '**Proposed fix**', item.proposedFix, '', '**Verification**', item.verification);
    }
  }
  lines.push('', '## Safety', '', 'This draft was generated locally. No external issue was created.');
  return lines.join('\n');
}
