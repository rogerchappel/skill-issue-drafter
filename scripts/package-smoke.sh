#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
smoke_dir=$(mktemp -d "${TMPDIR:-/tmp}/skill-issue-drafter-package-smoke.XXXXXX")
trap 'rm -rf "$smoke_dir"' EXIT

package_name=$(cd "$repo_root" && npm pack --silent --pack-destination "$smoke_dir")
npm install --global --prefix "$smoke_dir/prefix" "$smoke_dir/$package_name"

installed_cli="$smoke_dir/prefix/bin/skill-issue-drafter"
expected_version=$(node -p "require('$repo_root/package.json').version")
findings_file="$smoke_dir/findings.json"
output_file="$smoke_dir/issue.md"

cat >"$findings_file" <<'JSON'
{
  "repo": "rogerchappel/example-skill",
  "findings": [
    {
      "title": "Document the verification command",
      "evidence": "The contributor guide omits the package smoke test."
    }
  ]
}
JSON

"$installed_cli" --help >/dev/null
test "$("$installed_cli" --version)" = "$expected_version"
stdout_markdown=$(cd "$smoke_dir" && "$installed_cli" findings.json)
grep -Fq '# Follow-up: Document the verification command' <<<"$stdout_markdown"
grep -Fq 'Repository: rogerchappel/example-skill' <<<"$stdout_markdown"

(cd "$smoke_dir" && "$installed_cli" findings.json --out issue.md)
test -s "$output_file"
grep -Fq '# Follow-up: Document the verification command' "$output_file"
grep -Fq 'Repository: rogerchappel/example-skill' "$output_file"

echo "Installed package smoke test passed for skill-issue-drafter $expected_version."
