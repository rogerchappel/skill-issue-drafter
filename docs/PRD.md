# PRD: skill-issue-drafter

## Goal
Turn structured agent findings into high-quality Markdown issue drafts without creating issues automatically.

## Users
- Agents performing repo review or release readiness checks.
- Maintainers who want consistent follow-up issues.
- Connector builders testing issue creation flows safely.

## MVP
Read JSON findings, group them by severity and owner, and emit a Markdown draft with reproduction, evidence, proposed fix, and verification sections.

## Non-goals
- Creating GitHub issues.
- Reading private project trackers.
- Replacing maintainer prioritization.
