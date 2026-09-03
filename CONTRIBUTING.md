# Contributing

Thanks for helping improve `skill-issue-drafter`.

## Development

```sh
npm run release:check
```

Keep the workflow dry-run first. The CLI should draft issue text locally and must not create GitHub issues or perform tracker writes without an explicit future command and approval flow.

## Pull requests

- Include a short description of the issue-drafting behavior or readiness change.
- Add or update tests for parser, markdown, or CLI changes.
- Update the README when input shape or command usage changes.
