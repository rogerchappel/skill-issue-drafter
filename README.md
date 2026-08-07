# skill-issue-drafter

Dry-run GitHub issue draft generator for agent findings. It turns structured review output into a consistent Markdown issue body with evidence, reproduction, proposed fix, and verification sections.

## Quickstart

```bash
npm install -g skill-issue-drafter
skill-issue-drafter --help
skill-issue-drafter --version
skill-issue-drafter examples/findings.json
skill-issue-drafter examples/findings.json --out issue.md
```

For local development:

```bash
npm install
npm run smoke
node bin/skill-issue-drafter.js examples/findings.json
```

## Input shape

The input must be a JSON object with a non-empty string `repo` and a `findings` array. Every finding must be an object with non-empty string `title` and `evidence` fields. `defaultOwner`, `severity`, `owner`, `file`, `reproduction`, `proposedFix`, and `verification` are optional non-empty strings. Missing optional text uses the draft defaults; an unknown non-empty `severity` string is normalized to `medium`.

```json
{
  "repo": "owner/project",
  "defaultOwner": "maintainer",
  "findings": [
    { "title": "Missing check", "evidence": "The CI workflow does not run tests.", "severity": "high" }
  ]
}
```

Missing or wrongly typed top-level fields, non-object finding entries, missing required finding fields, and malformed optional fields are data errors. The CLI writes a concise `Invalid findings data: ...` message to stderr, produces no draft, and exits with status `3`. Invalid JSON is reported the same way. Status `2` remains reserved for command-line usage errors.

## Command-line options

`--out <file>` writes the generated Markdown to a file instead of stdout. Options that are not listed by `--help`, and `--out` without a file path, are usage errors.

If the input file cannot be read or the output file cannot be written, the CLI prints a concise path-specific diagnostic without a stack trace and exits with status `4`.

## Safety

The CLI never creates GitHub issues. It writes Markdown locally or to stdout so an agent can ask for approval before any external action.

## Limitations

- One consolidated issue draft in the initial release.
- JSON input only.
- No GitHub API calls or tracker writes.
