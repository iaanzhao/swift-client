import type { ClientSettings, McVersion } from "./types";
import { assetUrl } from "./assetUrl";

export type EngineKind = "eaglerX" | "eagler15" | "tuff";

export interface VersionInfo {
  id: McVersion;
  label: string;
  tagline: string;
  engine: EngineKind;
  wasmOnly?: boolean;
  jsOnly?: boolean;
  viaBlocksCapable?: boolean;
}

export const VERSIONS: Record<McVersion, VersionInfo> = {
  "1.5": {
    id: "1.5",
    label: "1.5.2",
    tagline: "Legacy · needs EaglerXRewind on server",
    engine: "eagler15",
    jsOnly: true,
  },
  "1.8": {
    id: "1.8",
    label: "1.8.8",
    tagline: "Most stable · best for PvP & Via 1.8 servers",
    engine: "eaglerX",
  },
  "1.12": {
    id: "1.12",
    label: "1.12.2",
    tagline: "World of Color · enable ViaBlocks for newer blocks",
    engine: "eaglerX",
    wasmOnly: true,
    viaBlocksCapable: true,
  },
};

export function usesViaBlocks(settings: ClientSettings): boolean {
  return settings.viaBlocks && settings.version === "1.12";
}

export function tuffWasmAssetsPath(): string {
  return assetUrl("game/tuff/wasm/assets.epw");
}

export function tuffWasmLoaderPath(): string {
  return assetUrl("game/tuff/wasm/bootstrap.js");
}

export function wasmAssetsPath(version: McVersion, viaBlocks = false): string {
  if (viaBlocks && version === "1.12") return tuffWasmAssetsPath();
  return assetUrl(`game/${version}/wasm/assets.epw`);
}

export function wasmLoaderPath(version: McVersion, viaBlocks = false): string {
  if (viaBlocks && version === "1.12") return tuffWasmLoaderPath();
  return assetUrl(`game/${version}/wasm/bootstrap.js`);
}

export function jsAssetsPath(version: McVersion): string {
  return assetUrl(`game/${version}/js/assets.epk`);
}

export function jsLoaderPath(version: McVersion): string {
  return assetUrl(`game/${version}/js/classes.js`);
}

export function jsLocalesPath(version: McVersion): string {
  return assetUrl(`game/${version}/js/lang/`);
}

export function jsWebrtcPath(version: McVersion): string {
  return assetUrl(`game/${version}/js/eagswebrtc.js`);
}

export function worldsDb(version: McVersion, viaBlocks = false): string {
  if (viaBlocks && version === "1.12") return "swift_worlds_tuff";
  if (version === "1.5") return "swift_worlds_15";
  return version === "1.8" ? "swift_worlds_18" : "swift_worlds_112";
}

export function storageNamespace(version: McVersion, viaBlocks = false): string {
  if (viaBlocks && version === "1.12") return "_swiftClient_tuff";
  if (version === "1.5") return "_swiftClient_15";
  return version === "1.8" ? "_swiftClient_18" : "_swiftClient_112";
}
