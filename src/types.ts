export type Runtime = "wasm" | "js" | "auto";

export type McVersion = "1.8" | "1.12";

export type PerfPreset = "turbo" | "balanced" | "quality";

export interface ServerEntry {
  addr: string;
  name: string;
}

export interface ClientSettings {
  version: McVersion;
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
    main?: () => void | Promise<void>;
    __swiftClient?: {
      settings: ClientSettings;
      overlay: { toggleClickGui: () => void };
    };
  }
}

export {};
