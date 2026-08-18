#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARTDIR="$ROOT/.ci/v3.0.0"
ZIP="$ROOT/.ci/v3.0.0-assets.zip"
cat "$PARTDIR"/assets.zip.b64.* | base64 -d > "$ZIP"
echo "Decoded v3.0.0 bundle: $(stat -c%s "$ZIP") bytes"
unzip -t "$ZIP"
rm -rf "$ROOT/app/src/main/assets/www"
mkdir -p "$ROOT/app/src/main/assets/www/photos"
unzip -q -o "$ZIP" -d "$ROOT/app/src/main/assets/www"
# Real workout photos from free-to-use Pexels / Unsplash pages. Pack them into the APK for offline use.
curl -L --fail --retry 3 -o "$ROOT/app/src/main/assets/www/photos/squat.jpg" "https://images.pexels.com/photos/8846119/pexels-photo-8846119.jpeg?auto=compress&cs=tinysrgb&w=1200"
curl -L --fail --retry 3 -o "$ROOT/app/src/main/assets/www/photos/pushup.jpg" "https://images.pexels.com/photos/7900682/pexels-photo-7900682.jpeg?auto=compress&cs=tinysrgb&w=1200"
curl -L --fail --retry 3 -o "$ROOT/app/src/main/assets/www/photos/plank.jpg" "https://images.unsplash.com/photo-1767611097425-87ceea79a3f0?auto=format&fit=crop&w=1200&q=80"
curl -L --fail --retry 3 -o "$ROOT/app/src/main/assets/www/photos/lunge.jpg" "https://images.pexels.com/photos/6516232/pexels-photo-6516232.jpeg?auto=compress&cs=tinysrgb&w=1200"
curl -L --fail --retry 3 -o "$ROOT/app/src/main/assets/www/photos/stretch.jpg" "https://images.pexels.com/photos/6496120/pexels-photo-6496120.jpeg?auto=compress&cs=tinysrgb&w=1200"
curl -L --fail --retry 3 -o "$ROOT/app/src/main/assets/www/photos/chair.jpg" "https://images.pexels.com/photos/11674389/pexels-photo-11674389.jpeg?auto=compress&cs=tinysrgb&w=1200"
cat > "$ROOT/app/src/main/assets/www/PHOTO_CREDITS.txt" <<'CREDITS'
TAYYIBAT LIFE v3.0.0 workout photo credits
squat.jpg — MART PRODUCTION / Pexels — https://www.pexels.com/photo/a-woman-doing-squats-at-home-8846119/
pushup.jpg — Ron Lach / Pexels — https://www.pexels.com/photo/woman-exercising-at-home-7900682/
plank.jpg — Margaret Young / Unsplash — https://unsplash.com/photos/mgC52hk8TeU
lunge.jpg — Polina Tankilevitch / Pexels — https://www.pexels.com/photo/woman-watching-online-workout-video-6516232/
stretch.jpg — Gustavo Fring / Pexels — https://www.pexels.com/photo/a-woman-in-active-wear-stretching-6496120/
chair.jpg — Centre for Ageing Better / Pexels — https://www.pexels.com/photo/seniors-exercising-11674389/
Photos are used under the respective Pexels / Unsplash free-use licenses. Attribution is retained in-app.
CREDITS
node --check "$ROOT/app/src/main/assets/www/app.js"
node --check "$ROOT/app/src/main/assets/www/data.js"
node --check "$ROOT/app/src/main/assets/www/workouts.js"
test -s "$ROOT/app/src/main/assets/www/photos/squat.jpg"
test -s "$ROOT/app/src/main/assets/www/photos/plank.jpg"
echo "v3.0.0 frontend and real workout photos materialized and verified."