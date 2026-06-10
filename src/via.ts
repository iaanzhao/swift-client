import type { McVersion, ViaTarget } from "./types";

export interface ViaTargetInfo {
  id: ViaTarget;
  label: string;
  note: string;
}

export const VIA_TARGETS: ViaTargetInfo[] = [
  { id: "auto", label: "Auto", note: "Use the client version you picked above." },
  { id: "1.8", label: "1.8.x server", note: "Native — no Via plugins required on the server." },
  { id: "1.12", label: "1.12.x server", note: "Use the 1.12.2 client for best compatibility." },
  { id: "1.16", label: "1.16+ server", note: "Server needs EaglerXServer + ViaVersion + ViaBackwards + ViaRewind." },
  { id: "1.18", label: "1.18+ server", note: "Server needs EaglerXServer + ViaVersion + ViaBackwards + ViaRewind." },
  { id: "1.20", label: "1.20+ server", note: "Server needs EaglerXServer + ViaVersion + ViaBackwards + ViaRewind." },
  { id: "1.21", label: "1.21+ server", note: "Server needs EaglerXServer + ViaVersion + ViaBackwards + ViaRewind." },
];

export function recommendedClient(via: ViaTarget): McVersion | null {
  switch (via) {
    case "1.8":
      return "1.8";
    case "1.12":
      return "1.12";
    case "1.16":
    case "1.18":
    case "1.20":
    case "1.21":
      return "1.12";
    default:
      return null;
  }
}

export function viaRequiresPlugins(via: ViaTarget): boolean {
  // exported for launcher
  return via === "1.16" || via === "1.18" || via === "1.20" || via === "1.21";
}

export function viaHint(via: ViaTarget, client: McVersion): string {
  const info = VIA_TARGETS.find((t) => t.id === via);
  if (!info) return "";

  if (via === "auto") {
    return info.note;
  }

  const rec = recommendedClient(via);
  const parts = [info.note];

  if (rec && rec !== client) {
    parts.push(`Recommended client: ${rec === "1.8" ? "1.8.8" : rec === "1.12" ? "1.12.2" : "1.5.2"}.`);
  }

  if (viaRequiresPlugins(via)) {
    parts.push("Your server owner must install the Via suite on the backend.");
    parts.push("Enable ViaBlocks below for newer block textures (Tuff engine).");
  }

  return parts.join(" ");
}
