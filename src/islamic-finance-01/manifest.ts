// Loads the narration manifest (public/audio/islamic-finance-01/manifest.json)
// inside Remotion; falls back to estimated timings while the voice is missing.
import { getStaticFiles, staticFile } from "remotion";
import { IF01_VIDEO } from "./script";
import { estimateIf01Manifest, type If01Manifest } from "./narration";

export * from "./narration";

export const loadIf01Manifest = async (): Promise<If01Manifest> => {
  const path = `${IF01_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  if (files.length > 0 && !files.some((f) => f.name === path)) return estimateIf01Manifest();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return estimateIf01Manifest();
  if (!res.ok) throw new Error(`Could not load narration manifest: HTTP ${res.status}`);
  const data = (await res.json()) as If01Manifest;
  if (data.version !== 1 || !Array.isArray(data.lines)) {
    throw new Error("Unexpected narration manifest. Re-run: npm run audio:voice:if01");
  }
  return data;
};

