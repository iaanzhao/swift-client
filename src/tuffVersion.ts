import { assetUrl } from "./assetUrl";

export interface TuffVersionInfo {
  tag: string;
  wasmUrl?: string;
  hasIntegratedServer: boolean;
}

let cached: TuffVersionInfo | null | undefined;

export async function loadTuffVersion(): Promise<TuffVersionInfo | null> {
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(assetUrl("tuff-version.json"), { cache: "no-cache" });
    if (!res.ok) {
      cached = null;
      return null;
    }
    const data = (await res.json()) as TuffVersionInfo;
    cached = {
      tag: data.tag,
      wasmUrl: data.wasmUrl,
      hasIntegratedServer: data.hasIntegratedServer === true,
    };
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function tuffVersionLabel(info: TuffVersionInfo | null): string {
  if (!info?.tag) return "Tuff engine";
  return `Tuff Client ${info.tag}`;
}
