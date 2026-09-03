#!/usr/bin/env bash
set -euo pipefail
npm run release:check
test -s /tmp/skill-issue-drafter.md
