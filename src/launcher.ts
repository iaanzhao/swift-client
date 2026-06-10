import { hasTuffAssets, hasVersionAssets, launchGame } from "./loader";
import { resolveRuntime, runtimeLabel } from "./runtime";
import { loadSettings, saveSettings } from "./storage";
import type { ClientSettings, McVersion, PerfPreset, Runtime, ViaTarget } from "./types";
import { ClickGui } from "./overlay/clickGui";
import { OverlayHud } from "./overlay/hud";
import { recommendedClient, viaHint, viaRequiresPlugins } from "./via";
import { usesViaBlocks, VERSIONS } from "./versions";

let settings = loadSettings();
let hud: OverlayHud | null = null;
let clickGui: ClickGui | null = null;

function $(sel: string): HTMLElement {
  return document.querySelector(sel)!;
}

function updatePlayButton(): void {
  const btn = $("#play-btn");
  const suffix = usesViaBlocks(settings) ? " + ViaBlocks" : "";
  btn.textContent = `Play Minecraft ${VERSIONS[settings.version].label}${suffix}`;
}

function updateVersionHint(): void {
  const hint = $("#version-hint");
  hint.textContent = VERSIONS[settings.version].tagline;

  const viaEl = $("#via-hint");
  viaEl.textContent = viaHint(settings.viaTarget, settings.version);

  const form = $("#launcher-form") as HTMLFormElement;
  const runtimeSelect = form.elements.namedItem("runtime") as HTMLSelectElement;
  const wasmOption = runtimeSelect.querySelector('option[value="wasm"]') as HTMLOptionElement;
  const jsOption = runtimeSelect.querySelector('option[value="js"]') as HTMLOptionElement;
  const autoOption = runtimeSelect.querySelector('option[value="auto"]') as HTMLOptionElement;
  const info = VERSIONS[settings.version];
  const viaBlocksOn = usesViaBlocks(settings);
  const viaBlocksRow = $("#viablocks-row");
  const viaBlocksHint = $("#viablocks-hint");
  const viaBlocksInput = form.elements.namedItem("viaBlocks") as HTMLInputElement;

  if (info.viaBlocksCapable) {
    viaBlocksRow.classList.remove("hidden");
    viaBlocksInput.checked = settings.viaBlocks;
    viaBlocksHint.textContent = viaBlocksOn
      ? "Using Tuff engine — install TuffX on server for Y0 & full ViaBlocks."
      : "Renders newer blocks on 1.16+ servers (requires TuffX + Via plugins).";
  } else {
    viaBlocksRow.classList.add("hidden");
    viaBlocksHint.textContent = "";
    if (settings.viaBlocks) {
      settings.viaBlocks = false;
      saveSettings(settings);
    }
  }

  if (viaBlocksOn) {
    autoOption.disabled = true;
    wasmOption.disabled = false;
    jsOption.disabled = true;
    settings.runtime = "wasm";
    runtimeSelect.value = "wasm";
    saveSettings(settings);
  } else if (info.jsOnly) {
    autoOption.disabled = true;
    wasmOption.disabled = true;
    jsOption.disabled = false;
    settings.runtime = "js";
    runtimeSelect.value = "js";
    saveSettings(settings);
  } else if (info.wasmOnly) {
    autoOption.disabled = false;
    wasmOption.disabled = false;
    jsOption.disabled = true;
    if (settings.runtime === "js") {
      settings.runtime = "auto";
      saveSettings(settings);
    }
    runtimeSelect.value = settings.runtime;
  } else {
    autoOption.disabled = false;
    wasmOption.disabled = false;
    jsOption.disabled = false;
  }
}

function applyViaRecommendation(): void {
  const rec = recommendedClient(settings.viaTarget);
  if (!rec || settings.viaTarget === "auto") return;
  if (rec !== settings.version) {
    settings.version = rec;
  }
  if (viaRequiresPlugins(settings.viaTarget)) {
    settings.viaBlocks = true;
  }
  saveSettings(settings);
}

function updateForm(): void {
  const form = $("#launcher-form") as HTMLFormElement;
  (form.elements.namedItem("version") as HTMLSelectElement).value = settings.version;
  (form.elements.namedItem("viaTarget") as HTMLSelectElement).value = settings.viaTarget;
  (form.elements.namedItem("viaBlocks") as HTMLInputElement).checked = settings.viaBlocks;
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
        <strong>${escapeHtml(s.name)}${s.via ? ' <span class="via-tag">Via</span>' : ""}</strong>
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
    const { runtime, version, viaBlocks } = await launchGame(settings);
    const mode = viaBlocks ? "ViaBlocks · Tuff ClickGUI" : "Right Shift = ClickGUI";
    status.textContent = `${VERSIONS[version].label} · ${runtimeLabel(runtime)} · ${mode}`;

    if (!viaBlocks) {
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
    }

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
    settings.viaTarget = (form.elements.namedItem("viaTarget") as HTMLSelectElement)
      .value as ViaTarget;
    settings.viaBlocks = (form.elements.namedItem("viaBlocks") as HTMLInputElement).checked;
    if (settings.viaBlocks && settings.version !== "1.12") {
      settings.version = "1.12";
    }
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
      if (settings.version !== "1.12") {
        settings.viaBlocks = false;
      }
      saveSettings(settings);
      updateForm();
      refreshRuntimeBadge();
    },
  );

  (form.elements.namedItem("viaBlocks") as HTMLInputElement).addEventListener(
    "change",
    () => {
      settings.viaBlocks = (form.elements.namedItem("viaBlocks") as HTMLInputElement).checked;
      if (settings.viaBlocks) {
        settings.version = "1.12";
      }
      saveSettings(settings);
      updateForm();
      refreshRuntimeBadge();
    },
  );

  (form.elements.namedItem("viaTarget") as HTMLSelectElement).addEventListener(
    "change",
    () => {
      settings.viaTarget = (form.elements.namedItem("viaTarget") as HTMLSelectElement)
        .value as ViaTarget;
      applyViaRecommendation();
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
    const checks: Array<[McVersion, string]> = [
      ["1.5", "1.5.2"],
      ["1.8", "1.8.8"],
      ["1.12", "1.12.2"],
    ];
    const missing: string[] = [];
    for (const [v, label] of checks) {
      if (!(await hasVersionAssets(v))) missing.push(label);
    }
    if (!(await hasTuffAssets())) missing.push("ViaBlocks (Tuff)");
    if (missing.length) {
      alert(
        `Missing game files: ${missing.join(", ")}\n\nRun in terminal:\n  cd swift-client\n  npm run setup\n\nThen refresh this page.`,
      );
    } else {
      alert("All game files are installed (including ViaBlocks). You're good to play!");
    }
  });
}
