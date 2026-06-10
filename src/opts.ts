import type { ClientSettings, EaglercraftXOpts, McVersion } from "./types";
import {
  jsAssetsPath,
  jsLocalesPath,
  storageNamespace,
  usesViaBlocks,
  wasmAssetsPath,
  worldsDb,
} from "./versions";

function perfOpts(preset: ClientSettings["perfPreset"]): Partial<EaglercraftXOpts> {
  switch (preset) {
    case "turbo":
      return {
        enforceVSync: true,
        deobfStackTraces: false,
        eaglerNoDelay: true,
        allowFNAWSkins: false,
        checkGLErrors: false,
        checkShaderGLErrors: false,
        keepAliveHack: true,
        html5CursorSupport: true,
      };
    case "quality":
      return {
        enforceVSync: true,
        deobfStackTraces: true,
        eaglerNoDelay: false,
        allowFNAWSkins: true,
        checkGLErrors: false,
        html5CursorSupport: true,
      };
    default:
      return {
        enforceVSync: true,
        deobfStackTraces: false,
        eaglerNoDelay: false,
        allowFNAWSkins: true,
        html5CursorSupport: true,
      };
  }
}

export function buildEaglerOpts(
  settings: ClientSettings,
  runtime: "wasm" | "js",
): EaglercraftXOpts {
  const version: McVersion = settings.version;
  const viaBlocks = usesViaBlocks(settings);
  const relayId = Math.floor(Math.random() * 3);
  const base: EaglercraftXOpts = {
    demoMode: false,
    container: "game_frame",
    assetsURI:
      runtime === "wasm"
        ? wasmAssetsPath(version, viaBlocks)
        : jsAssetsPath(version),
    localesURI: runtime === "js" && version === "1.8" ? jsLocalesPath(version) : undefined,
    worldsDB: worldsDb(version, viaBlocks),
    resourcePacksDB: `${worldsDb(version, viaBlocks)}_packs`,
    localStorageNamespace: storageNamespace(version, viaBlocks),
    servers: [],
    relays: [
      { addr: "wss://relay.deev.is/", comment: "lax1dude relay #1", primary: relayId === 0 },
      { addr: "wss://relay.lax1dude.net/", comment: "lax1dude relay #2", primary: relayId === 1 },
      {
        addr: "wss://relay.shhnowisnottheti.me/",
        comment: "ayunami relay #1",
        primary: relayId === 2,
      },
    ],
    allowVoiceClient: true,
    ...perfOpts(settings.perfPreset),
  };

  return base;
}
