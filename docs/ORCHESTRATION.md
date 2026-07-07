# Orchestration

1. Agent collects repo or skill-run findings as JSON.
2. Agent runs `skill-issue-drafter findings.json --out issue.md`.
3. Agent reviews the generated Markdown and attaches it to a PR or handoff.
4. A human decides whether to create external issues.

The drafter is a dry-run formatter. It performs no network writes.
