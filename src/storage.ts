import type { ClientSettings, McVersion, ViaTarget } from "./types";

const KEY = "swift-client-settings";

const DEFAULTS: ClientSettings = {
  version: "1.8",
  viaTarget: "auto",
  viaBlocks: false,
  runtime: "auto",
  perfPreset: "turbo",
  username: "",
  joinServer: "",
  servers: [
    { name: "Hyper Network", addr: "wss://hyper-network.net/", via: true },
    { name: "Local Test", addr: "ws://localhost:8081/" },
  ],
  accentColor: "#6ee7b7",
  modules: {
    fps: true,
    cps: true,
    keystrokes: false,
    zoom: true,
    coords: false,
    clock: false,
  },
  zoomKey: "c",
  zoomLevel: 2,
};

function parseVersion(v: unknown): McVersion {
  if (v === "1.12" || v === "1.5") return v;
  return "1.8";
}

function parseViaTarget(v: unknown): ViaTarget {
  const allowed: ViaTarget[] = ["auto", "1.8", "1.12", "1.16", "1.18", "1.20", "1.21"];
  return allowed.includes(v as ViaTarget) ? (v as ViaTarget) : "auto";
}

export function loadSettings(): ClientSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ClientSettings>;
    return {
      ...DEFAULTS,
      ...parsed,
      version: parseVersion(parsed.version),
      viaTarget: parseViaTarget(parsed.viaTarget),
      viaBlocks: parsed.viaBlocks === true,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: ClientSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
