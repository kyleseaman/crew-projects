#!/bin/sh
# Package the app for another gateway: a tarball holding exactly the runtime
# layout the gateway installs (app.json, assets, README, the built UI bundle).
#
#   scripts/package.sh      -> release/project-hub-<version>.tar.gz
#
# Rebuilds and tests first, and refuses if the rebuilt bundle differs from the
# committed ui/dist (a stale bundle is the one thing a copy cannot detect).
# On the other machine:
#   tar -xzf project-hub-<version>.tar.gz
#   kirocrew app install "$PWD/project-hub"
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

if [ -n "$(git status --porcelain -- app.json assets README.md ui/src ui/vite.config.ts)" ]; then
  echo "package: commit your changes first (app.json, assets, README.md, ui/src)" >&2
  exit 1
fi

(cd ui && npm test && npm run build)

if ! git diff --quiet -- ui/dist; then
  echo "package: ui/dist is stale; commit the rebuilt bundle, then re-run" >&2
  exit 1
fi

version=$(node -p "require('./app.json').version")
mkdir -p release
out="release/project-hub-$version.tar.gz"
git archive --format=tar.gz --prefix=project-hub/ -o "$out" HEAD -- app.json assets README.md ui/dist
echo "wrote $root/$out"
tar -tzf "$out"
