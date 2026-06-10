#!/usr/bin/env bash
# Fix 1.12 singleplayer crash: BlockMobSpawner.createNewTileEntity returned a null
# cached singleton when the integrated server worker could not init tile entities.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLASSES="$ROOT/public/game/1.12/js/classes.js"

if [[ ! -f "$CLASSES" ]]; then
  echo "==> Skipping 1.12 spawner patch (classes.js not found; run npm run setup first)"
  exit 0
fi

OLD='function Fyy(a,b,c,d){var $p,$z;$p=0;if(FX()){var $T=Ds();$p=$T.l();d=$T.l();c=$T.l();b=$T.l();a=$T.l();}_:while(true){switch($p){case 0:$p=1;case 1:Bz();if(B()){break _;}return HW2;default:FT();}}Ds().s(a,b,c,d,$p);}'
NEW='function Fyy(a,b,c,d){var e,$p,$z;$p=0;if(FX()){var $T=Ds();$p=$T.l();e=$T.l();d=$T.l();c=$T.l();b=$T.l();a=$T.l();}_:while(true){switch($p){case 0:$p=1;case 1:Bz();if(B()){break _;}$p=2;case 2:$z=B_M(C(1206));if(B()){break _;}e=$z;return e;default:FT();}}Ds().s(a,b,c,d,e,$p);}'

if grep -qF "$NEW" "$CLASSES"; then
  echo "==> 1.12 spawner patch already applied"
  exit 0
fi

if ! grep -qF "$OLD" "$CLASSES"; then
  echo "==> WARN: 1.12 classes.js changed upstream; spawner patch not applied"
  exit 0
fi

python3 -c "
import pathlib
p = pathlib.Path('$CLASSES')
text = p.read_text()
text = text.replace('''$OLD''', '''$NEW''')
p.write_text(text)
"
echo "==> Applied 1.12 mob spawner singleplayer fix"
