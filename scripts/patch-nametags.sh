#!/usr/bin/env bash
# Patch Eaglercraft classes.js so canRenderName respects window.__swiftNametags.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

patch_file() {
  local file="$1"
  local label="$2"
  local old="$3"
  local new="$4"

  if [[ ! -f "$file" ]]; then
    echo "==> Skipping $label nametag patch (classes.js not found)"
    return 0
  fi

  if grep -qF "$new" "$file"; then
    echo "==> $label nametag patch already applied"
    return 0
  fi

  if ! grep -qF "$old" "$file"; then
    echo "==> WARN: $label classes.js changed upstream; nametag patch not applied"
    return 0
  fi

  python3 -c "
import pathlib
p = pathlib.Path('$file')
p.write_text(p.read_text().replace('''$old''', '''$new''', 1))
"
  echo "==> Applied $label nametag patch"
}

# Shared hook snippet (injected at start of canRenderName)
# 1.8 — F0F, CZ = EntityPlayer, R$ = EntityArmorStand, a.gG.bH2 = local player
SWIFT_HOOK_18='if($z){if(!$z.entityNametags){return 0;}if(!$z.armorStandNametags&&b instanceof R$){return 0;}if(!$z.playerNametags&&b instanceof CZ&&b!==a.gG.bH2){return 0;}}'
SWIFT_HOOK_18_V1='if($z){if(!$z.entityNametags){return 0;}if(!$z.playerNametags&&b instanceof CZ&&b!==a.gG.bH2){return 0;}}'

# 1.12 — F0v, Cb = EntityPlayer, HB = EntityArmorStand, a.i_.a1X = local player
SWIFT_HOOK_112='if($z){if(!$z.entityNametags){return 0;}if(!$z.armorStandNametags&&b instanceof HB){return 0;}if(!$z.playerNametags&&b instanceof Cb&&b!==a.i_.a1X){return 0;}}'
SWIFT_HOOK_112_V1='if($z){if(!$z.entityNametags){return 0;}if(!$z.playerNametags&&b instanceof Cb&&b!==a.i_.a1X){return 0;}}'

# Tuff — DJr, Ca = EntityPlayer, Ik = EntityArmorStand, a.i_.a1X = local player
SWIFT_HOOK_TUFF='if($z){if(!$z.entityNametags){return 0;}if(!$z.armorStandNametags&&b instanceof Ik){return 0;}if(!$z.playerNametags&&b instanceof Ca&&b!==a.i_.a1X){return 0;}}'
SWIFT_HOOK_TUFF_V1='if($z){if(!$z.entityNametags){return 0;}if(!$z.playerNametags&&b instanceof Ca&&b!==a.i_.a1X){return 0;}}'

# Upgrade v1 → v2 (armor stand toggle)
patch_file "$ROOT/public/game/1.8/js/classes.js" "1.8 armor stand" "$SWIFT_HOOK_18_V1" "$SWIFT_HOOK_18"
patch_file "$ROOT/public/game/1.12/js/classes.js" "1.12 armor stand" "$SWIFT_HOOK_112_V1" "$SWIFT_HOOK_112"
patch_file "$ROOT/public/game/tuff/js/classes.js" "Tuff armor stand" "$SWIFT_HOOK_TUFF_V1" "$SWIFT_HOOK_TUFF"

# Fresh install — inject hook before original canRenderName body
patch_file \
  "$ROOT/public/game/1.8/js/classes.js" \
  "1.8" \
  'function F0F(a,b){var c,d,e,f,g,$p,$z;$p=0;if(FU()){var $T=DL();$p=$T.l();g=$T.l();f=$T.l();e=$T.l();d=$T.l();c=$T.l();b=$T.l();a=$T.l();}_:while(true){switch($p){case 0:$p=1;case 1:Db();' \
  "function F0F(a,b){var c,d,e,f,g,\$p,\$z;\$p=0;if(FU()){var \$T=DL();\$p=\$T.l();g=\$T.l();f=\$T.l();e=\$T.l();d=\$T.l();c=\$T.l();b=\$T.l();a=\$T.l();}_:while(true){switch(\$p){case 0:\$p=1;case 1:\$z=typeof window!==\"undefined\"&&window.__swiftNametags;${SWIFT_HOOK_18}Db();"

patch_file \
  "$ROOT/public/game/1.12/js/classes.js" \
  "1.12" \
  'function F0v(a,b){var c,d,e,f,g,h,$p,$z;$p=0;if(FX()){var $T=Ds();$p=$T.l();h=$T.l();g=$T.l();f=$T.l();e=$T.l();d=$T.l();c=$T.l();b=$T.l();a=$T.l();}_:while(true){switch($p){case 0:$p=1;case 1:$z=E32();' \
  "function F0v(a,b){var c,d,e,f,g,h,\$p,\$z;\$p=0;if(FX()){var \$T=Ds();\$p=\$T.l();h=\$T.l();g=\$T.l();f=\$T.l();e=\$T.l();d=\$T.l();c=\$T.l();b=\$T.l();a=\$T.l();}_:while(true){switch(\$p){case 0:\$p=1;case 1:\$z=typeof window!==\"undefined\"&&window.__swiftNametags;${SWIFT_HOOK_112}\$z=E32();"

patch_file \
  "$ROOT/public/game/tuff/js/classes.js" \
  "Tuff" \
  'function DJr(a,b){var c,$p,$z;$p=0;if(Gt()){var $T=DI();$p=$T.l();c=$T.l();b=$T.l();a=$T.l();}_:while(true){switch($p){case 0:$p=1;case 1:$z=b.dNZ();' \
  "function DJr(a,b){var c,\$p,\$z;\$p=0;if(Gt()){var \$T=DI();\$p=\$T.l();c=\$T.l();b=\$T.l();a=\$T.l();}_:while(true){switch(\$p){case 0:\$p=1;case 1:\$z=typeof window!==\"undefined\"&&window.__swiftNametags;${SWIFT_HOOK_TUFF}\$z=b.dNZ();"
