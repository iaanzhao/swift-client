#!/usr/bin/env bash
# Print newest Tuff Client release tag and asset URLs (tab-separated lines):
#   TAG
#   WASM_ZIP_URL
#   JS_ZIP_URL   (empty if not published for that tag)
set -euo pipefail

python3 << 'PY'
import json
import urllib.request

releases = json.load(
    urllib.request.urlopen(
        "https://api.github.com/repos/TuffNetwork/Tuff-Client-Builds/releases?per_page=40"
    )
)

for release in releases:
    assets = {a["name"]: a["browser_download_url"] for a in release.get("assets", [])}
    wasm = assets.get("WASM.zip")
    if not wasm:
        continue
    print(release["tag_name"])
    print(wasm)
    print(assets.get("JS.zip", ""))
    break
else:
    raise SystemExit("No Tuff Client release with WASM.zip found")
PY
