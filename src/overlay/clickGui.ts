import type { ClientSettings } from "../types";
import { MODULES } from "./modules";

export class ClickGui {
  private el: HTMLElement;
  private visible = false;
  private onChange: (s: ClientSettings) => void;

  constructor(
    private getSettings: () => ClientSettings,
    onChange: (s: ClientSettings) => void,
  ) {
    this.onChange = onChange;
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

  private render(): void {
    const s = this.getSettings();
    this.el.style.setProperty("--accent", s.accentColor);

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
