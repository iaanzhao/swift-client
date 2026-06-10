import type { ClientSettings } from "../types";

export class OverlayHud {
  private root: HTMLElement;
  private fpsEl: HTMLElement;
  private cpsEl: HTMLElement;
  private coordsEl: HTMLElement;
  private clockEl: HTMLElement;
  private keysEl: HTMLElement;
  private zoomActive = false;
  private zoomScale = 2;
  private zoomKey = "c";

  private frames = 0;
  private lastFps = performance.now();
  private fps = 0;

  private leftClicks: number[] = [];
  private rightClicks: number[] = [];

  private pressed = new Set<string>();
  private screenName = "";
  private raf = 0;

  constructor(private getSettings: () => ClientSettings) {
    this.root = document.createElement("div");
    this.root.id = "swift-overlay";
    this.root.innerHTML = `
      <div class="hud-tl"></div>
      <div class="hud-bl"></div>
    `;

    const tl = this.root.querySelector(".hud-tl")!;
    const bl = this.root.querySelector(".hud-bl")!;

    this.fpsEl = this.badge("FPS —");
    this.cpsEl = this.badge("CPS —");
    this.coordsEl = this.badge("XYZ —");
    this.clockEl = this.badge("");
    this.keysEl = document.createElement("div");
    this.keysEl.className = "keystrokes";

    tl.append(this.fpsEl, this.cpsEl, this.coordsEl, this.clockEl);
    bl.append(this.keysEl);

    document.body.appendChild(this.root);
    this.bindInput();
    this.loop();
  }

  private badge(text: string): HTMLElement {
    const el = document.createElement("div");
    el.className = "hud-badge hidden";
    el.textContent = text;
    return el;
  }

  setScreen(name: string): void {
    this.screenName = name;
  }

  applySettings(): void {
    const s = this.getSettings();
    this.zoomKey = s.zoomKey.toLowerCase();
    this.zoomScale = s.zoomLevel;
    this.root.style.setProperty("--accent", s.accentColor);

    this.toggle(this.fpsEl, s.modules.fps);
    this.toggle(this.cpsEl, s.modules.cps);
    this.toggle(this.coordsEl, s.modules.coords);
    this.toggle(this.clockEl, s.modules.clock);
    this.toggle(this.keysEl, s.modules.keystrokes);
  }

  private toggle(el: HTMLElement, on: boolean): void {
    el.classList.toggle("hidden", !on);
  }

  private bindInput(): void {
    window.addEventListener("mousedown", (e) => {
      const t = performance.now();
      if (e.button === 0) this.leftClicks.push(t);
      if (e.button === 2) this.rightClicks.push(t);
    });

    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      this.pressed.add(e.code);
      const key = e.key.toLowerCase();
      const s = this.getSettings();
      if (s.modules.zoom && key === this.zoomKey) {
        this.setZoom(true);
      }
    });

    window.addEventListener("keyup", (e) => {
      this.pressed.delete(e.code);
      const key = e.key.toLowerCase();
      if (key === this.zoomKey) this.setZoom(false);
    });

    window.addEventListener("blur", () => {
      this.pressed.clear();
      this.setZoom(false);
    });
  }

  private setZoom(on: boolean): void {
    if (this.zoomActive === on) return;
    this.zoomActive = on;
    const frame = document.getElementById("game_frame");
    if (!frame) return;
    frame.style.transform = on ? `scale(${this.zoomScale})` : "";
    frame.style.transformOrigin = "center center";
  }

  private cps(clicks: number[]): number {
    const now = performance.now();
    while (clicks.length && clicks[0] < now - 1000) clicks.shift();
    return clicks.length;
  }

  private loop = (): void => {
    const s = this.getSettings();
    this.frames++;
    const now = performance.now();
    if (now - this.lastFps >= 500) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastFps));
      this.frames = 0;
      this.lastFps = now;

      if (s.modules.fps) this.fpsEl.textContent = `FPS ${this.fps}`;
      if (s.modules.cps) {
        this.cpsEl.textContent = `CPS L${this.cps(this.leftClicks)} R${this.cps(this.rightClicks)}`;
      }
      if (s.modules.clock) {
        this.clockEl.textContent = new Date().toLocaleTimeString();
      }
      if (s.modules.coords) {
        const ingame = /guiingame|ingame/i.test(this.screenName);
        this.coordsEl.textContent = ingame ? "In world" : "—";
      }
      if (s.modules.keystrokes) this.renderKeys();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private renderKeys(): void {
    const map = [
      ["KeyW", "W"],
      ["KeyA", "A"],
      ["KeyS", "S"],
      ["KeyD", "D"],
      ["Space", "SP"],
      ["ShiftLeft", "SH"],
    ];
    this.keysEl.innerHTML = map
      .map(
        ([code, label]) =>
          `<span class="key ${this.pressed.has(code) ? "down" : ""}">${label}</span>`,
      )
      .join("");
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.root.remove();
  }
}
