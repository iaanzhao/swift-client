import type { McVersion } from "./types";
import { assetUrl } from "./assetUrl";

export interface VersionInfo {
  id: McVersion;
  label: string;
  tagline: string;
  wasmOnly?: boolean;
}

export const VERSIONS: Record<McVersion, VersionInfo> = {
  "1.8": {
    id: "1.8",
    label: "1.8.8",
    tagline: "Most stable · best for PvP servers",
  },
  "1.12": {
    id: "1.12",
    label: "1.12.2",
    tagline: "World of Color · concrete & terracotta",
    wasmOnly: true,
  },
};

export function wasmAssetsPath(version: McVersion): string {
  return assetUrl(`game/${version}/wasm/assets.epw`);
}

export function wasmLoaderPath(version: McVersion): string {
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

export function worldsDb(version: McVersion): string {
  return version === "1.8" ? "swift_worlds_18" : "swift_worlds_112";
}

export function storageNamespace(version: McVersion): string {
  return version === "1.8" ? "_swiftClient_18" : "_swiftClient_112";
}
