import { assetUrl } from "./assetUrl";
import { launchGame } from "./loader";
import { applyNametagSettings } from "./nametags";
import { runtimeLabel } from "./runtime";
import { loadSettings, saveSettings } from "./storage";
import type { ClientSettings } from "./types";
import { ClickGui } from "./overlay/clickGui";
import { OverlayHud } from "./overlay/hud";
import { VERSIONS } from "./versions";

let settings = loadSettings();
let hud: OverlayHud | null = null;
let clickGui: ClickGui | null = null;

function $(sel: string): HTMLElement {
  return document.querySelector(sel)!;
}

function applySettings(next: ClientSettings): void {
  settings = next;
  saveSettings(settings);
  applyNametagSettings(settings);
  hud?.applySettings();
  document.documentElement.style.setProperty("--accent", next.accentColor);
}

function relaunch(): void {
  saveSettings(settings);
  location.reload();
}

async function startGame(): Promise<void> {
  const status = $("#launch-status");
  status.classList.remove("hidden", "error");
  status.textContent = `Loading Minecraft ${VERSIONS[settings.version].label}…`;

  try {
    const { runtime, version } = await launchGame(settings);
    status.textContent = `${VERSIONS[version].label} · ${runtimeLabel(runtime)} · Right Shift = menu`;

    hud = new OverlayHud(() => settings);
    hud.applySettings();

    clickGui = new ClickGui(() => settings, applySettings, relaunch);

    window.__swiftClient = {
      settings,
      overlay: { toggleClickGui: () => clickGui?.toggle() },
    };

    setTimeout(() => {
      status.classList.add("hidden");
      $("#home-title").classList.add("hidden");
    }, 3500);
  } catch (err) {
    status.classList.remove("hidden");
    status.textContent =
      err instanceof Error ? err.message : "Failed to launch game.";
    status.classList.add("error");
    status.style.pointerEvents = "auto";
    status.innerHTML = `${status.textContent} <button type="button" id="retry-launch" style="margin-left:8px;cursor:pointer">Retry</button>`;
    $("#retry-launch")?.addEventListener("click", () => location.reload());
  }
}

export function initLauncher(): void {
  applyNametagSettings(settings);
  document.documentElement.style.setProperty("--accent", settings.accentColor);
  document.documentElement.style.setProperty(
    "--bg-image",
    `url("${assetUrl("assets/background.jpg")}")`,
  );
  startGame();
}
