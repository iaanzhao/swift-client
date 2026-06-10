#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASE18="https://raw.githubusercontent.com/3kh0/eaglercraft-builds/main"
BASE112="https://raw.githubusercontent.com/alexander-datskov/1.12-eaglercraftx/main"

mkdir -p "$ROOT/public/game/1.5/js"
mkdir -p "$ROOT/public/game/1.8/wasm" "$ROOT/public/game/1.8/js"
mkdir -p "$ROOT/public/game/1.12/wasm" "$ROOT/public/game/1.12/js"
mkdir -p "$ROOT/public/game/tuff/wasm"

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

echo "==> Downloading Tuff Client ViaBlocks engine (~23 MB)..."
TUFF_ZIP="$ROOT/public/game/tuff-wasm.zip"
curl -fL --progress-bar -o "$TUFF_ZIP" \
  "https://github.com/TuffNetwork/Tuff-Client-Builds/releases/download/1.1UT15/WASM.zip"
unzip -o -q "$TUFF_ZIP" -d "$ROOT/public/game/tuff/wasm"
rm -f "$TUFF_ZIP"

echo "==> Done. Run: npm run dev"
