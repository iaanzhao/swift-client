import type { McVersion, Runtime } from "./types";
import { VERSIONS } from "./versions";

export async function detectWasmGc(): Promise<boolean> {
  if (typeof WebAssembly === "undefined") return false;
  try {
    const bytes = new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 127, 3, 2, 1, 0, 7, 8, 1,
      4, 116, 101, 115, 116, 0, 0, 10, 6, 1, 4, 0, 65, 0, 11,
    ]);
    await WebAssembly.compile(bytes);
    return true;
  } catch {
    return false;
  }
}

export async function resolveRuntime(
  pref: Runtime,
  version: McVersion,
): Promise<"wasm" | "js"> {
  if (VERSIONS[version].wasmOnly) return "wasm";
  if (pref === "wasm") return "wasm";
  if (pref === "js") return "js";
  return (await detectWasmGc()) ? "wasm" : "js";
}

export function runtimeLabel(rt: "wasm" | "js", version?: McVersion): string {
  const ver = version ? ` · ${VERSIONS[version].label}` : "";
  return rt === "wasm" ? `WASM-GC (fast)${ver}` : `JavaScript (compat)${ver}`;
}
