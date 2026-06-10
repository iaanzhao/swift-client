import type { ClientSettings } from "./types";

export interface SwiftNametagState {
  entityNametags: boolean;
  playerNametags: boolean;
  armorStandNametags: boolean;
}

declare global {
  interface Window {
    __swiftNametags?: SwiftNametagState;
  }
}

export function applyNametagSettings(settings: ClientSettings): void {
  window.__swiftNametags = {
    entityNametags: settings.modules.nametags !== false,
    playerNametags: settings.modules.playerNametags !== false,
    armorStandNametags: settings.modules.armorStandNametags !== false,
  };
}
