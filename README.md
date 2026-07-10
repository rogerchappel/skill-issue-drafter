# skill-issue-drafter

Dry-run GitHub issue draft generator for agent findings. It turns structured review output into a consistent Markdown issue body with evidence, reproduction, proposed fix, and verification sections.

## Quickstart

```bash
npm install -g skill-issue-drafter
skill-issue-drafter --help
skill-issue-drafter --version
skill-issue-drafter examples/findings.json
```

For local development:

```bash
npm install
npm run smoke
node bin/skill-issue-drafter.js examples/findings.json
```

## Input shape

The input JSON includes `repo`, optional `defaultOwner`, and a `findings` array. Each finding can include `title`, `severity`, `owner`, `file`, `evidence`, `reproduction`, `proposedFix`, and `verification`.

## Safety

The CLI never creates GitHub issues. It writes Markdown locally or to stdout so an agent can ask for approval before any external action.

## Limitations

- One consolidated issue draft in the initial release.
- JSON input only.
- No GitHub API calls or tracker writes.
