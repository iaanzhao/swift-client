import { buildEagler15Opts } from "./opts15";
import { buildEaglerOpts } from "./opts";
import { resolveRuntime } from "./runtime";
import type { ClientSettings, McVersion } from "./types";
import {
  jsAssetsPath,
  jsLoaderPath,
  jsWebrtcPath,
  tuffWasmAssetsPath,
  usesViaBlocks,
  VERSIONS,
  wasmAssetsPath,
  wasmLoaderPath,
} from "./versions";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function assetExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

async function hasTuffAssets(): Promise<boolean> {
  const [loader, assets] = await Promise.all([
    assetExists(wasmLoaderPath("1.12", true)),
    assetExists(tuffWasmAssetsPath()),
  ]);
  return loader && assets;
}

async function hasVersionAssets(
  version: McVersion,
  viaBlocks = false,
): Promise<boolean> {
  const info = VERSIONS[version];
  if (info.engine === "eagler15") {
    const [loader, assets] = await Promise.all([
      assetExists(jsLoaderPath(version)),
      assetExists(jsAssetsPath(version)),
    ]);
    return loader && assets;
  }
  if (viaBlocks && version === "1.12") {
    return hasTuffAssets();
  }
  const wasmOk = await assetExists(wasmAssetsPath(version));
  const jsOk = await assetExists(jsLoaderPath(version));
  return wasmOk || jsOk;
}

async function launchEagler15(settings: ClientSettings): Promise<void> {
  const version: McVersion = "1.5";
  const loader = jsLoaderPath(version);
  const assets = jsAssetsPath(version);

  if (!(await assetExists(loader)) || !(await assetExists(assets))) {
    throw new Error(
      `Minecraft ${VERSIONS[version].label} files missing. Run \`npm run setup\` to download assets.`,
    );
  }

  await loadScript(jsWebrtcPath(version));
  window.eaglercraftOpts = buildEagler15Opts(settings);
  await loadScript(loader);

  if (typeof window.main !== "function") {
    throw new Error("Eaglercraft 1.5 bootstrap did not initialize.");
  }

  await window.main();
}

async function launchEaglerX(
  settings: ClientSettings,
): Promise<"wasm" | "js"> {
  const version = settings.version;
  const viaBlocks = usesViaBlocks(settings);
  let runtime = await resolveRuntime(settings.runtime, version);

  if (viaBlocks) {
    runtime = "wasm";
    if (!(await hasTuffAssets())) {
      throw new Error(
        "ViaBlocks (Tuff engine) files missing. Run `npm run setup` to download them.",
      );
    }
  }

  const wasmOk = await assetExists(wasmAssetsPath(version, viaBlocks));
  const jsOk =
    !viaBlocks &&
    version === "1.8" &&
    (await assetExists(jsLoaderPath(version))) &&
    (await assetExists(jsAssetsPath(version)));

  if (!viaBlocks && !wasmOk && !jsOk) {
    throw new Error(
      `Minecraft ${VERSIONS[version].label} files missing. Run \`npm run setup\` to download assets.`,
    );
  }

  if (!viaBlocks) {
    if (runtime === "wasm" && !wasmOk) runtime = "js";
    if (runtime === "js" && !jsOk) runtime = "wasm";
  }

  window.eaglercraftXOpts = buildEaglerOpts(settings, runtime);

  // WASM singleplayer runs an integrated server worker from classes.js.
  delete window.eaglercraftXClientScriptURL;
  delete window.eaglercraftXClientScriptElement;
  if (runtime === "wasm" && !viaBlocks && (version === "1.12" || version === "1.8")) {
    window.eaglercraftXClientScriptURL = jsLoaderPath(version);
  }

  const script =
    runtime === "wasm"
      ? wasmLoaderPath(version, viaBlocks)
      : jsLoaderPath(version);
  await loadScript(script);

  if (typeof window.main !== "function") {
    throw new Error("Eaglercraft bootstrap did not initialize.");
  }

  await window.main();
  return runtime;
}

export async function launchGame(
  settings: ClientSettings,
): Promise<{ runtime: "wasm" | "js"; version: McVersion; viaBlocks: boolean }> {
  const version = settings.version;

  if (VERSIONS[version].engine === "eagler15") {
    await launchEagler15(settings);
    return { runtime: "js", version, viaBlocks: false };
  }

  const runtime = await launchEaglerX(settings);
  return { runtime, version, viaBlocks: usesViaBlocks(settings) };
}

export { hasTuffAssets, hasVersionAssets };
