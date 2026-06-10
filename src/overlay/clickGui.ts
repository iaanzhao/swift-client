import type { ClientSettings, McVersion, PerfPreset, Runtime, ViaTarget } from "../types";
import { recommendedClient, viaRequiresPlugins } from "../via";
import { VERSIONS } from "../versions";
import { MODULES } from "./modules";

const VERSION_OPTIONS: Array<{ value: McVersion; label: string }> = [
  { value: "1.12", label: "1.12.2" },
  { value: "1.8", label: "1.8.8" },
  { value: "1.5", label: "1.5.2" },
];

const VIA_OPTIONS: Array<{ value: ViaTarget; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "1.8", label: "1.8.x" },
  { value: "1.12", label: "1.12.x" },
  { value: "1.16", label: "1.16+" },
  { value: "1.18", label: "1.18+" },
  { value: "1.20", label: "1.20+" },
  { value: "1.21", label: "1.21+" },
];

function applyViaSideEffects(next: ClientSettings): ClientSettings {
  const rec = recommendedClient(next.viaTarget);
  if (rec && next.viaTarget !== "auto" && rec !== next.version) {
    next = { ...next, version: rec };
  }
  if (viaRequiresPlugins(next.viaTarget)) {
    next = { ...next, viaBlocks: true, version: "1.12" };
  }
  if (next.viaTarget === "1.18" || next.viaTarget === "1.20" || next.viaTarget === "1.21") {
    next = { ...next, y0Mode: true, viaBlocks: true, version: "1.12", runtime: "wasm" };
  }
  if (next.y0Mode) {
    next = { ...next, viaBlocks: true, version: "1.12", runtime: "wasm" };
  }
  if (next.viaBlocks && next.version !== "1.12") {
    next = { ...next, version: "1.12" };
  }
  if (!next.viaBlocks) {
    next = { ...next, y0Mode: false };
  }
  if (next.version !== "1.12") {
    next = { ...next, viaBlocks: false, y0Mode: false };
  }
  return next;
}

export class ClickGui {
  private el: HTMLElement;
  private visible = false;
  private onChange: (s: ClientSettings) => void;
  private onRelaunch: () => void;

  constructor(
    private getSettings: () => ClientSettings,
    onChange: (s: ClientSettings) => void,
    onRelaunch: () => void,
  ) {
    this.onChange = onChange;
    this.onRelaunch = onRelaunch;
    this.el = document.createElement("div");
    this.el.id = "swift-clickgui";
    this.el.className = "hidden";
    document.body.appendChild(this.el);
    this.render();

    window.addEventListener("keydown", (e) => {
      if (e.code === "ShiftRight" || (e.code === "ShiftLeft" && e.ctrlKey)) {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle(): void {
    this.visible = !this.visible;
    this.el.classList.toggle("hidden", !this.visible);
    if (this.visible) this.render();
  }

  private patch(partial: Partial<ClientSettings>): void {
    let next = applyViaSideEffects({ ...this.getSettings(), ...partial });
    this.onChange(next);
    this.render();
  }

  private render(): void {
    const s = this.getSettings();
    this.el.style.setProperty("--accent", s.accentColor);
    const showTuff = VERSIONS[s.version].viaBlocksCapable;

    const byCat = new Map<string, typeof MODULES>();
    for (const m of MODULES) {
      const list = byCat.get(m.category) ?? [];
      list.push(m);
      byCat.set(m.category, list);
    }

    this.el.innerHTML = `
      <div class="cg-header">
        <span class="cg-title">Swift Client</span>
        <button type="button" class="cg-close" aria-label="Close">×</button>
      </div>
      <div class="cg-search-wrap">
        <input type="search" class="cg-search" placeholder="Search modules…" />
      </div>
      <div class="cg-body">
        <section class="cg-category cg-wide">
          <h3>Client</h3>
          <p class="cg-note">Turbo + WASM by default. Relaunch to apply client setting changes.</p>
          <div class="cg-settings-grid">
            <label>Minecraft version
              <select class="cg-version">${VERSION_OPTIONS.map(
                (o) => `<option value="${o.value}" ${s.version === o.value ? "selected" : ""}>${o.label}</option>`,
              ).join("")}</select>
            </label>
            <label>Server version (Via)
              <select class="cg-via">${VIA_OPTIONS.map(
                (o) => `<option value="${o.value}" ${s.viaTarget === o.value ? "selected" : ""}>${o.label}</option>`,
              ).join("")}</select>
            </label>
            <label>Runtime
              <select class="cg-runtime">
                <option value="auto" ${s.runtime === "auto" ? "selected" : ""}>Auto (WASM fastest)</option>
                <option value="wasm" ${s.runtime === "wasm" ? "selected" : ""}>WASM-GC</option>
                <option value="js" ${s.runtime === "js" ? "selected" : ""}>JavaScript</option>
              </select>
            </label>
            <label>Performance
              <select class="cg-perf">
                <option value="turbo" ${s.perfPreset === "turbo" ? "selected" : ""}>Turbo — max FPS</option>
                <option value="balanced" ${s.perfPreset === "balanced" ? "selected" : ""}>Balanced</option>
                <option value="quality" ${s.perfPreset === "quality" ? "selected" : ""}>Quality</option>
              </select>
            </label>
            ${
              showTuff
                ? `
            <label class="cg-check"><input type="checkbox" class="cg-y0" ${s.y0Mode ? "checked" : ""} /> Y0 mode (below Y=0)</label>
            <label class="cg-check"><input type="checkbox" class="cg-viablocks" ${s.viaBlocks ? "checked" : ""} /> ViaBlocks (Tuff engine)</label>`
                : ""
            }
          </div>
          <button type="button" class="cg-relaunch">Relaunch game</button>
        </section>
        ${[...byCat.entries()]
          .map(
            ([cat, mods]) => `
          <section class="cg-category">
            <h3>${cat}</h3>
            ${mods
              .map((m) => {
                const on = s.modules[m.id as keyof typeof s.modules] ?? false;
                return `
              <label class="cg-module" data-name="${m.name.toLowerCase()}">
                <input type="checkbox" data-id="${m.id}" ${on ? "checked" : ""} />
                <span class="cg-mod-name">${m.name}</span>
                <span class="cg-mod-desc">${m.description}</span>
              </label>`;
              })
              .join("")}
          </section>`,
          )
          .join("")}
      </div>
      <div class="cg-footer">
        <label>Accent <input type="color" class="cg-accent" value="${s.accentColor}" /></label>
        <label>Zoom key <input type="text" class="cg-zoomkey" maxlength="1" value="${s.zoomKey}" /></label>
        <label>Zoom level <input type="range" class="cg-zoomlvl" min="1.5" max="4" step="0.5" value="${s.zoomLevel}" /></label>
      </div>
    `;

    this.el.querySelector(".cg-close")?.addEventListener("click", () => this.toggle());
    this.el.querySelector(".cg-relaunch")?.addEventListener("click", () => this.onRelaunch());

    this.el.querySelector(".cg-version")?.addEventListener("change", (e) => {
      this.patch({ version: (e.target as HTMLSelectElement).value as McVersion });
    });
    this.el.querySelector(".cg-via")?.addEventListener("change", (e) => {
      this.patch({ viaTarget: (e.target as HTMLSelectElement).value as ViaTarget });
    });
    this.el.querySelector(".cg-runtime")?.addEventListener("change", (e) => {
      this.patch({ runtime: (e.target as HTMLSelectElement).value as Runtime });
    });
    this.el.querySelector(".cg-perf")?.addEventListener("change", (e) => {
      this.patch({ perfPreset: (e.target as HTMLSelectElement).value as PerfPreset });
    });
    this.el.querySelector(".cg-y0")?.addEventListener("change", (e) => {
      this.patch({ y0Mode: (e.target as HTMLInputElement).checked });
    });
    this.el.querySelector(".cg-viablocks")?.addEventListener("change", (e) => {
      this.patch({ viaBlocks: (e.target as HTMLInputElement).checked });
    });

    const search = this.el.querySelector(".cg-search") as HTMLInputElement;
    search?.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      this.el.querySelectorAll<HTMLElement>(".cg-module").forEach((row) => {
        row.style.display = row.dataset.name?.includes(q) ? "" : "none";
      });
    });

    this.el.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-id]').forEach((cb) => {
      cb.addEventListener("change", () => {
        const next = { ...this.getSettings() };
        next.modules = { ...next.modules, [cb.dataset.id!]: cb.checked };
        this.onChange(next);
      });
    });

    this.el.querySelector(".cg-accent")?.addEventListener("input", (e) => {
      const next = { ...this.getSettings(), accentColor: (e.target as HTMLInputElement).value };
      this.onChange(next);
      this.el.style.setProperty("--accent", next.accentColor);
    });

    this.el.querySelector(".cg-zoomkey")?.addEventListener("input", (e) => {
      const v = (e.target as HTMLInputElement).value.slice(-1).toLowerCase();
      (e.target as HTMLInputElement).value = v;
      this.onChange({ ...this.getSettings(), zoomKey: v || "c" });
    });

    this.el.querySelector(".cg-zoomlvl")?.addEventListener("input", (e) => {
      this.onChange({
        ...this.getSettings(),
        zoomLevel: parseFloat((e.target as HTMLInputElement).value),
      });
    });
  }

  destroy(): void {
    this.el.remove();
  }
}
