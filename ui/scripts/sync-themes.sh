#!/bin/sh
# Refresh src/dev/host-themes.css from a Kiro Crew checkout's dashboard theme
# blocks, so the dev harness renders with the real app themes.
# Usage: scripts/sync-themes.sh [/path/to/KiroCrew] [git-ref]
set -eu
repo=${1:-${KIROCREW_REPO:?pass the KiroCrew checkout path, or set KIROCREW_REPO}}
ref=${2:-origin/main}
here=$(cd "$(dirname "$0")/.." && pwd)
css=$(git -C "$repo" show "$ref:website/src/index.css")
start=$(printf '%s\n' "$css" | grep -n '^:root,\[data-theme="dark"\]' | head -1 | cut -d: -f1)
end=$(printf '%s\n' "$css" | awk '/^\[data-theme="highcontrast-light"\]/{f=1} f&&/^}/{print NR; exit}')
sha=$(git -C "$repo" rev-parse --short "$ref")
{
  echo "/* Kiro Crew dashboard theme tokens, copied verbatim from website/src/index.css"
  echo "   lines $start-$end at KiroCrew $ref $sha. Dev harness only: the installed"
  echo "   app gets these from the host. Refresh with scripts/sync-themes.sh. */"
  printf '%s\n' "$css" | sed -n "${start},${end}p"
} > "$here/src/dev/host-themes.css"
echo "wrote $here/src/dev/host-themes.css ($start-$end @ $sha)"
