import { hasVersionAssets, launchGame } from "./loader";
import { resolveRuntime, runtimeLabel } from "./runtime";
import { loadSettings, saveSettings } from "./storage";
import type { ClientSettings, McVersion, PerfPreset, Runtime } from "./types";
import { ClickGui } from "./overlay/clickGui";
import { OverlayHud } from "./overlay/hud";
import { VERSIONS } from "./versions";

let settings = loadSettings();
let hud: OverlayHud | null = null;
let clickGui: ClickGui | null = null;

function $(sel: string): HTMLElement {
  return document.querySelector(sel)!;
}

function updatePlayButton(): void {
  const btn = $("#play-btn");
  btn.textContent = `Play Minecraft ${VERSIONS[settings.version].label}`;
}

function updateVersionHint(): void {
  const hint = $("#version-hint");
  hint.textContent = VERSIONS[settings.version].tagline;

  const form = $("#launcher-form") as HTMLFormElement;
  const runtimeSelect = form.elements.namedItem("runtime") as HTMLSelectElement;
  const jsOption = runtimeSelect.querySelector('option[value="js"]') as HTMLOptionElement;
  if (VERSIONS[settings.version].wasmOnly) {
    jsOption.disabled = true;
    if (settings.runtime === "js") {
      settings.runtime = "auto";
      saveSettings(settings);
    }
    runtimeSelect.value = settings.runtime;
  } else {
    jsOption.disabled = false;
  }
}

function updateForm(): void {
  const form = $("#launcher-form") as HTMLFormElement;
  (form.elements.namedItem("version") as HTMLSelectElement).value = settings.version;
  (form.elements.namedItem("runtime") as HTMLSelectElement).value = settings.runtime;
  (form.elements.namedItem("perf") as HTMLSelectElement).value = settings.perfPreset;
  (form.elements.namedItem("joinServer") as HTMLInputElement).value = settings.joinServer;

  updatePlayButton();
  updateVersionHint();

  const list = $("#server-list");
  list.innerHTML = settings.servers
    .map(
      (s, i) => `
    <li>
      <button type="button" class="server-pick" data-idx="${i}">
        <strong>${escapeHtml(s.name)}</strong>
        <span>${escapeHtml(s.addr)}</span>
      </button>
      <button type="button" class="server-del" data-idx="${i}" title="Remove">×</button>
    </li>`,
    )
    .join("");

  list.querySelectorAll(".server-pick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt((btn as HTMLElement).dataset.idx!, 10);
      settings.joinServer = settings.servers[idx].addr;
      saveSettings(settings);
      updateForm();
    });
  });

  list.querySelectorAll(".server-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt((btn as HTMLElement).dataset.idx!, 10);
      settings.servers.splice(idx, 1);
      saveSettings(settings);
      updateForm();
    });
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function refreshRuntimeBadge(): Promise<void> {
  const rt = await resolveRuntime(settings.runtime, settings.version);
  const badge = $("#runtime-badge");
  badge.textContent = runtimeLabel(rt, settings.version);
  badge.className = `badge badge-${rt}`;
}

async function startGame(): Promise<void> {
  const launcher = $("#launcher");
  const game = $("#game-shell");
  const status = $("#launch-status");

  launcher.classList.add("hidden");
  game.classList.remove("hidden");
  status.classList.remove("hidden", "error");
  status.textContent = `Loading Minecraft ${VERSIONS[settings.version].label}…`;

  try {
    const { runtime, version } = await launchGame(settings);
    status.textContent = `${VERSIONS[version].label} · ${runtimeLabel(runtime)} · Right Shift = ClickGUI`;

    hud = new OverlayHud(() => settings);
    hud.applySettings();

    clickGui = new ClickGui(
      () => settings,
      (next) => {
        settings = next;
        saveSettings(settings);
        hud?.applySettings();
        document.documentElement.style.setProperty("--accent", next.accentColor);
      },
    );

    window.__swiftClient = {
      settings,
      overlay: { toggleClickGui: () => clickGui?.toggle() },
    };

    setTimeout(() => status.classList.add("hidden"), 4000);
  } catch (err) {
    launcher.classList.remove("hidden");
    game.classList.add("hidden");
    status.classList.remove("hidden");
    status.textContent =
      err instanceof Error ? err.message : "Failed to launch game.";
    status.classList.add("error");
  }
}

export function initLauncher(): void {
  document.documentElement.style.setProperty("--accent", settings.accentColor);
  updateForm();
  refreshRuntimeBadge();

  const form = $("#launcher-form") as HTMLFormElement;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    settings.version = (form.elements.namedItem("version") as HTMLSelectElement)
      .value as McVersion;
    settings.runtime = (form.elements.namedItem("runtime") as HTMLSelectElement)
      .value as Runtime;
    settings.perfPreset = (form.elements.namedItem("perf") as HTMLSelectElement)
      .value as PerfPreset;
    settings.joinServer = (
      form.elements.namedItem("joinServer") as HTMLInputElement
    ).value.trim();
    saveSettings(settings);
    startGame();
  });

  (form.elements.namedItem("version") as HTMLSelectElement).addEventListener(
    "change",
    () => {
      settings.version = (form.elements.namedItem("version") as HTMLSelectElement)
        .value as McVersion;
      saveSettings(settings);
      updateForm();
      refreshRuntimeBadge();
    },
  );

  (form.elements.namedItem("runtime") as HTMLSelectElement).addEventListener(
    "change",
    () => {
      settings.runtime = (form.elements.namedItem("runtime") as HTMLSelectElement)
        .value as Runtime;
      saveSettings(settings);
      refreshRuntimeBadge();
    },
  );

  $("#add-server")?.addEventListener("click", () => {
    const name = ($("#srv-name") as HTMLInputElement).value.trim();
    const addr = ($("#srv-addr") as HTMLInputElement).value.trim();
    if (!name || !addr) return;
    settings.servers.push({ name, addr });
    saveSettings(settings);
    ($("#srv-name") as HTMLInputElement).value = "";
    ($("#srv-addr") as HTMLInputElement).value = "";
    updateForm();
  });

  $("#setup-hint")?.addEventListener("click", async () => {
    const ok18 = await hasVersionAssets("1.8");
    const ok112 = await hasVersionAssets("1.12");
    if (!ok18 || !ok112) {
      const missing = [!ok18 && "1.8.8", !ok112 && "1.12.2"].filter(Boolean).join(", ");
      alert(
        `Missing game files: ${missing}\n\nRun in terminal:\n  cd swift-client\n  npm run setup\n\nThen refresh this page.`,
      );
    } else {
      alert("All game files are installed. You're good to play!");
    }
  });
}
