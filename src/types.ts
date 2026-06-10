export type Runtime = "wasm" | "js" | "auto";

export type McVersion = "1.5" | "1.8" | "1.12";

export type ViaTarget = "auto" | "1.8" | "1.12" | "1.16" | "1.18" | "1.20" | "1.21";

export type PerfPreset = "turbo" | "balanced" | "quality";

export interface ServerEntry {
  addr: string;
  name: string;
  via?: boolean;
}

export interface ClientSettings {
  version: McVersion;
  viaTarget: ViaTarget;
  viaBlocks: boolean;
  runtime: Runtime;
  perfPreset: PerfPreset;
  username: string;
  joinServer: string;
  servers: ServerEntry[];
  accentColor: string;
  modules: Record<string, boolean>;
  zoomKey: string;
  zoomLevel: number;
}

export interface EaglercraftXOpts {
  demoMode: boolean;
  container: string;
  assetsURI: string;
  localesURI?: string;
  worldsDB: string;
  resourcePacksDB?: string;
  localStorageNamespace?: string;
  servers: ServerEntry[];
  relays: Array<{ addr: string; comment: string; primary: boolean }>;
  joinServer?: string;
  enforceVSync?: boolean;
  deobfStackTraces?: boolean;
  eaglerNoDelay?: boolean;
  allowFNAWSkins?: boolean;
  checkGLErrors?: boolean;
  checkShaderGLErrors?: boolean;
  keepAliveHack?: boolean;
  ramdiskMode?: boolean;
  singleThreadMode?: boolean;
  html5CursorSupport?: boolean;
  allowVoiceClient?: boolean;
  hooks?: {
    screenChanged?: (
      screenName: string,
      scaledWidth: number,
      scaledHeight: number,
      realWidth: number,
      realHeight: number,
      scaleFactor: number,
    ) => void;
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    eaglercraftXOpts?: EaglercraftXOpts;
    eaglercraftOpts?: unknown;
    main?: () => void | Promise<void>;
    __swiftClient?: {
      settings: ClientSettings;
      overlay: { toggleClickGui: () => void };
    };
  }
}

export {};
