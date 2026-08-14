# Changelog

## Unreleased

- Install the packed CLI in a disposable prefix during release checks and verify
  its `--help` and `--version` entry points.
- Document the working GitHub installation command while the package remains
  unpublished on npm.
- Reject unknown command-line options and missing `--out` file paths with usage diagnostics.
- Validate every supplied optional finding field as a non-empty string.
- Report input and output filesystem failures with concise diagnostics and exit status `4`.

## 0.1.0

- Initial release candidate for dry-run GitHub issue draft generation.
- Includes CLI smoke coverage and package dry-run checks.
