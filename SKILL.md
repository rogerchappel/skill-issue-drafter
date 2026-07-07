# skill-issue-drafter

Use this skill when an agent has structured findings and needs a consistent issue draft for human review.

## Inputs
A JSON file with `repo`, `findings`, and optional `defaultOwner`.

## Side effects
Read-only by default. The CLI reads local findings and writes Markdown to stdout or a local output path. It does not contact GitHub.

## Approval
No approval is needed for local drafting. Explicit approval is required before any future connector writes issues.

## Validation
Run `npm test`, `npm run check`, and `npm run smoke`.
