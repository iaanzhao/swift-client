import { assetUrl } from "./assetUrl";
import type { ClientSettings } from "./types";

export interface Eaglercraft15Opts {
  container: string;
  assetsURI: string;
  serverWorkerURI: string;
  worldsFolder: string;
  servers: Array<{ serverName: string; serverAddress: string; hideAddress: boolean }>;
  relays: Array<{ addr: string; name: string; primary: boolean }>;
  joinServer?: string;
  mainMenu: { splashes: string[]; eaglerLogo: boolean };
}

export function buildEagler15Opts(settings: ClientSettings): Eaglercraft15Opts {
  const relayId = Math.floor(Math.random() * 3);
  const base = `${assetUrl("game/1.5/js")}/`;

  const opts: Eaglercraft15Opts = {
    container: "game_frame",
    assetsURI: `${base}assets.epk`,
    serverWorkerURI: `${base}worker_bootstrap.js`,
    worldsFolder: "swift_worlds_15",
    servers: settings.servers.map((s) => ({
      serverName: s.name,
      serverAddress: s.addr,
      hideAddress: false,
    })),
    relays: [
      { addr: "wss://relay.deev.is/", name: "lax1dude relay #1", primary: relayId === 0 },
      { addr: "wss://relay.lax1dude.net/", name: "lax1dude relay #2", primary: relayId === 1 },
      {
        addr: "wss://relay.shhnowisnottheti.me/",
        name: "ayunami relay #1",
        primary: relayId === 2,
      },
    ],
    mainMenu: {
      splashes: ["Swift Client!", "Via Rewind ready", "You Eagler!"],
      eaglerLogo: false,
    },
  };

  if (settings.joinServer.trim()) {
    opts.joinServer = settings.joinServer.trim();
  }

  return opts;
}
