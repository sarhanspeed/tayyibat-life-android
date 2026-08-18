#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/.ci/v3.1.0"
WWW="$ROOT/app/src/main/assets/www"

# Keep the verified v3.0 base (including the licensed offline workout photos),
# then layer the v3.1 Tayyibat Intelligence module on top.
bash "$ROOT/.ci/materialize-v300.sh"

cat "$SRC"/tayyibat-v310.js.b64.* | tr -d '\r\n' | base64 -d > "$WWW/tayyibat-v310.js"
test -s "$WWW/tayyibat-v310.js"

python3 - <<'PY'
from pathlib import Path
p = Path('app/src/main/assets/www/index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('TAYYIBAT LIFE • V3.0', 'TAYYIBAT LIFE • V3.1')
if 'tayyibat-v310.js' not in s:
    s = s.replace('</body>', '  <script src="tayyibat-v310.js"></script>\n</body>')
p.write_text(s, encoding='utf-8')
PY

node --check "$WWW/tayyibat-v310.js"
grep -q 'TAYYIBAT LIFE • V3.1' "$WWW/index.html"
grep -q 'tayyibat-v310.js' "$WWW/index.html"
test -s "$WWW/photos/squat.jpg"
test -s "$WWW/photos/plank.jpg"
echo "v3.1.0 Tayyibat Intelligence overlay materialized and verified."
