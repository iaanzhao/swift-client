#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE18="https://raw.githubusercontent.com/3kh0/eaglercraft-builds/main"
BASE112="https://raw.githubusercontent.com/alexander-datskov/1.12-eaglercraftx/main"

mkdir -p "$ROOT/public/game/1.5/js"
mkdir -p "$ROOT/public/game/1.8/wasm" "$ROOT/public/game/1.8/js"
mkdir -p "$ROOT/public/game/1.12/wasm" "$ROOT/public/game/1.12/js"
mkdir -p "$ROOT/public/game/tuff/wasm" "$ROOT/public/game/tuff/js"

# Migrate legacy layout if present
if [[ -d "$ROOT/public/game/wasm" && ! -f "$ROOT/public/game/1.8/wasm/assets.epw" ]]; then
  echo "==> Migrating legacy 1.8 assets..."
  mv "$ROOT/public/game/wasm" "$ROOT/public/game/1.8/wasm"
  mv "$ROOT/public/game/js" "$ROOT/public/game/1.8/js"
fi

echo "==> Downloading Eaglercraft 1.5.2 JS (~12 MB)..."
curl -fL --progress-bar -o "$ROOT/public/game/1.5/js/assets.epk" \
  "$BASE18/Eaglercraft_1.5_Web/assets.epk"
curl -fL --progress-bar -o "$ROOT/public/game/1.5/js/classes.js" \
  "$BASE18/Eaglercraft_1.5_Web/classes.js"
curl -fL -o "$ROOT/public/game/1.5/js/eagswebrtc.js" \
  "$BASE18/Eaglercraft_1.5_Web/eagswebrtc.js"
curl -fL -o "$ROOT/public/game/1.5/js/worker_bootstrap.js" \
  "$BASE18/Eaglercraft_1.5_Web/worker_bootstrap.js"

echo "==> Downloading EaglercraftX 1.8.8 WASM-GC (~12 MB)..."
curl -fL --progress-bar -o "$ROOT/public/game/1.8/wasm/assets.epw" \
  "$BASE18/EaglercraftX_1.8_WASM-GC_Web/assets.epw"
curl -fL -o "$ROOT/public/game/1.8/wasm/bootstrap.js" \
  "$BASE18/EaglercraftX_1.8_WASM-GC_Web/bootstrap.js"

echo "==> Downloading EaglercraftX 1.8.8 JS fallback (~30 MB)..."
curl -fL --progress-bar -o "$ROOT/public/game/1.8/js/assets.epk" \
  "$BASE18/EaglercraftX_1.8_Web/assets.epk"
curl -fL --progress-bar -o "$ROOT/public/game/1.8/js/classes.js" \
  "$BASE18/EaglercraftX_1.8_Web/classes.js"

echo "==> Downloading Eaglercraft 1.12.2 WASM-GC (~16 MB)..."
curl -fL --progress-bar -o "$ROOT/public/game/1.12/wasm/assets.epw" \
  "$BASE112/assets.epw"
curl -fL -o "$ROOT/public/game/1.12/wasm/bootstrap.js" \
  "$BASE112/bootstrap.js"

echo "==> Downloading Eaglercraft 1.12.2 JS classes (required for WASM singleplayer)..."
curl -fL --progress-bar -o "$ROOT/public/game/1.12/js/classes.js" \
  "$BASE112/classes.js"
bash "$ROOT/scripts/patch-112-spawner.sh"
bash "$ROOT/scripts/patch-nametags.sh"

echo "==> Resolving newest Tuff Client release..."
TUFF_RESOLVE="$(bash "$ROOT/scripts/resolve-tuff-release.sh")"
TUFF_TAG="$(echo "$TUFF_RESOLVE" | sed -n '1p')"
TUFF_WASM_URL="$(echo "$TUFF_RESOLVE" | sed -n '2p')"
TUFF_JS_URL="$(echo "$TUFF_RESOLVE" | sed -n '3p')"
echo "==> Tuff Client $TUFF_TAG"

echo "==> Downloading Tuff Client WASM engine..."
TUFF_ZIP="$ROOT/public/game/tuff-wasm.zip"
curl -fL --progress-bar -o "$TUFF_ZIP" "$TUFF_WASM_URL"
unzip -o -q "$TUFF_ZIP" -d "$ROOT/public/game/tuff/wasm"
rm -f "$TUFF_ZIP"

if [[ -n "$TUFF_JS_URL" ]]; then
  echo "==> Downloading Tuff Client integrated server (classes.js)..."
  TUFF_JS_ZIP="$ROOT/public/game/tuff-js.zip"
  curl -fL --progress-bar -o "$TUFF_JS_ZIP" "$TUFF_JS_URL"
  unzip -o -q -j "$TUFF_JS_ZIP" "classes.js" -d "$ROOT/public/game/tuff/js"
  rm -f "$TUFF_JS_ZIP"
else
  echo "==> WARN: No JS.zip for $TUFF_TAG — ViaBlocks singleplayer may be limited"
  rm -f "$ROOT/public/game/tuff/js/classes.js"
fi

python3 -c "
import json, pathlib
path = pathlib.Path('$ROOT/public/tuff-version.json')
path.write_text(json.dumps({
    'tag': '$TUFF_TAG',
    'wasmUrl': '$TUFF_WASM_URL',
    'hasIntegratedServer': bool('$TUFF_JS_URL'),
}, indent=2) + '\n')
"
echo "==> Done. Run: npm run dev"
