import { getStaticFiles, staticFile } from "remotion";
import { requireBg31Manifest } from "./manifestGuard";
import { BG31_VIDEO } from "./script";
import { estimateBg31Manifest, type Bg31Manifest } from "./timing";

// Финальный рендер (requireVoice) требует полной актуальной озвучки;
// в Studio и для черновых кадров без озвучки — оценочные тайминги.
export const loadBg31Manifest = async (requireVoice: boolean): Promise<Bg31Manifest> => {
  const path = `${BG31_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG031 не создана. Рендер без голосов запрещён.");
    return estimateBg31Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG031 не создана. Рендер без голосов запрещён.");
    return estimateBg31Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  const names = files.length ? new Set(files.map((f) => f.name)) : undefined;
  if (!requireVoice) {
    try {
      return requireBg31Manifest(raw, names);
    } catch {
      return estimateBg31Manifest();
    }
  }
  return requireBg31Manifest(raw, names);
};
