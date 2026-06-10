import type { ClientSettings } from "./types";

const KEY = "swift-client-settings";

const DEFAULTS: ClientSettings = {
  version: "1.8",
  runtime: "auto",
  perfPreset: "turbo",
  username: "",
  joinServer: "",
  servers: [
    { name: "Hyper Network", addr: "wss://hyper-network.net/" },
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

export function loadSettings(): ClientSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<ClientSettings>;
    return {
      ...DEFAULTS,
      ...parsed,
      version: parsed.version === "1.12" ? "1.12" : "1.8",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: ClientSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
