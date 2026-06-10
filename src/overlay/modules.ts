import type { ClientSettings } from "../types";

export interface ModuleDef {
  id: keyof ClientSettings["modules"] | string;
  name: string;
  category: "Render" | "HUD" | "Utility" | "Combat";
  description: string;
}

export const MODULES: ModuleDef[] = [
  { id: "fps", name: "FPS Display", category: "HUD", description: "Show frames per second" },
  { id: "cps", name: "CPS Counter", category: "Combat", description: "Left/right clicks per second" },
  { id: "keystrokes", name: "Keystrokes", category: "HUD", description: "WASD + mouse overlay" },
  { id: "zoom", name: "Zoom", category: "Render", description: "Hold key to zoom in" },
  { id: "coords", name: "Coordinates", category: "HUD", description: "XYZ position (when in-game)" },
  { id: "clock", name: "Clock", category: "Utility", description: "Real-time clock" },
];
