# Swift Client

A fast, Tuff-inspired Eaglercraft browser client with WASM-first runtime, performance presets, ClickGUI modules, and a clean launcher.

## Supported versions

| Version | Runtime | Notes |
|---------|---------|-------|
| **1.8.8** | WASM-GC + JS fallback | Most stable, best for PvP |
| **1.12.2** | WASM-GC only | Heavier; use Chrome/Edge for best FPS |

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
