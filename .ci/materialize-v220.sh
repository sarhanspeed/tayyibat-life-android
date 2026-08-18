#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARTDIR="$ROOT/.ci/v2.2.0"
ZIP="$ROOT/.ci/v2.2.0-assets.zip"
cat "$PARTDIR"/assets.zip.b64.* | base64 -d > "$ZIP"
echo "e160014d520b03cebb184c6d0bf74cbe777d4f759b893235bea514ea20cf7e37  $ZIP" | sha256sum -c -
rm -rf "$ROOT/app/src/main/assets/www"
mkdir -p "$ROOT/app/src/main/assets/www"
unzip -q -o "$ZIP" -d "$ROOT/app/src/main/assets/www"
node --check "$ROOT/app/src/main/assets/www/app.js"
node --check "$ROOT/app/src/main/assets/www/foods.js"
node --check "$ROOT/app/src/main/assets/www/workouts.js"
echo "v2.2.0 frontend materialized and verified."
