# Swift Client

A fast, Tuff-inspired Eaglercraft browser client with WASM-first runtime, performance presets, ClickGUI modules, and a clean launcher.

## Supported versions

| Version | Runtime | Notes |
|---------|---------|-------|
| **1.5.2** | JavaScript only | Legacy; server needs EaglerXRewind |
| **1.8.8** | WASM-GC + JS fallback | Most stable, best for PvP & native 1.8 servers |
| **1.12.2** | WASM-GC only | Best for Via-connected 1.16–1.21 servers |

## ViaVersion support

Use the **Server version (Via)** dropdown to pick what Minecraft version your server runs. Swift Client will:

- Recommend the right Eaglercraft client (1.8 / 1.12)
- Show whether the server needs **EaglerXServer + ViaVersion + ViaBackwards + ViaRewind**

Via translation happens on the **server**, not in the browser client. Your server owner must install those plugins for 1.16+ backends.

## Y0 mode (below Y=0)

Vanilla Eaglercraft hardcodes world height to **Y 0–255** and cannot render deepslate caves, trial chambers, or any blocks below bedrock. Swift Client solves this by loading the [Tuff Client](https://github.com/TuffNetwork/Tuff-Client-Builds) WASM engine — a patched Eaglercraft build with extended vertical rendering.

1. Select **1.12.2** (or a **1.18+** Via server target — Y0 turns on automatically).
2. Enable **Y0 mode** in the launcher.
3. Install **[TuffX](https://github.com/TuffNetwork/TuffX-Plugin)** on your server (1.18+ backend + ViaVersion + ViaBackwards).

Without TuffX on the server, the client still loads but blocks below Y=0 will not sync correctly.

## ViaBlocks (Tuff engine)

Enable **ViaBlocks** when playing on 1.12.2 with 1.16–1.21 servers. This uses the same Tuff engine and adds:

- Newer block textures (deepslate, copper, etc.)
- WAILA, minimap, and Tuff's built-in ClickGUI

Y0 mode implies ViaBlocks. Server requirements: **TuffX + ViaVersion + ViaBackwards** on a 1.18+ backend for full support.

## Features

- **Version picker** — switch between 1.8.8 and 1.12.2 from the launcher
- **WASM-GC auto-detect** — ~50% faster than JS when your browser supports it
- **Turbo performance preset** — tuned `eaglercraftXOpts` for max FPS
- **ClickGUI** — press Right Shift in-game to toggle modules
- **HUD modules** — FPS, CPS, keystrokes, zoom, clock
- **Server bookmarks** — quick connect from the launcher

## Quick start

```bash
cd swift-client
npm install
npm run setup    # downloads Eaglercraft assets (~55 MB total)
npm run dev
```

Open http://localhost:5173, pick a version, and click **Play**.

### 1.12 singleplayer

WASM 1.12.2 runs singleplayer in a background worker that loads `classes.js`. Swift Client sets `window.eaglercraftXClientScriptURL` automatically. If you still see a mob spawner crash when creating a world, re-run `npm run setup` (applies a spawner tile-entity patch).

For the most reliable singleplayer experience, use **1.8.8** — its integrated server is more mature.

## GitHub Pages

Push to `master` or `main` and GitHub Actions deploys automatically.

1. Create a repo on GitHub (e.g. `swift-client`)
2. Enable **Pages → Source: GitHub Actions** in repo Settings
3. Push this project:

```bash
git remote add origin https://github.com/YOUR_USER/swift-client.git
git push -u origin master
```

Live URL: `https://YOUR_USER.github.io/swift-client/`

The deploy workflow downloads game assets during CI (~55 MB) so they are not stored in git.

## Notes

- Game assets are downloaded from [3kh0/eaglercraft-builds](https://github.com/3kh0/eaglercraft-builds) (1.8) and [alexander-datskov/1.12-eaglercraftx](https://github.com/alexander-datskov/1.12-eaglercraftx) (1.12) and are not included in this repo.
- 1.12.2 requires WASM-GC (Chrome 119+, Edge 119+, Firefox 120+).
- Worlds and settings are stored separately per version.
- Not affiliated with Mojang or lax1dude.
