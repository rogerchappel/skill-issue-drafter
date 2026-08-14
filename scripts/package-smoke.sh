#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
smoke_dir=$(mktemp -d "${TMPDIR:-/tmp}/skill-issue-drafter-package-smoke.XXXXXX")
trap 'rm -rf "$smoke_dir"' EXIT

package_name=$(cd "$repo_root" && npm pack --silent --pack-destination "$smoke_dir")
npm install --global --prefix "$smoke_dir/prefix" "$smoke_dir/$package_name"

installed_cli="$smoke_dir/prefix/bin/skill-issue-drafter"
expected_version=$(node -p "require('$repo_root/package.json').version")

"$installed_cli" --help >/dev/null
test "$("$installed_cli" --version)" = "$expected_version"

echo "Installed package smoke test passed for skill-issue-drafter $expected_version."
