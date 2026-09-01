# Examples

## Create a local draft

```bash
node bin/skill-issue-drafter.js examples/findings.json --out issue.md
```

## Agent handoff

Attach the generated Markdown to a pull request comment, release readiness report, or human approval request.

Input strings may contain incidental leading or trailing whitespace. The CLI
trims repository, title, severity, owner, file, evidence, reproduction,
proposed-fix, and verification values before it groups or renders findings.
