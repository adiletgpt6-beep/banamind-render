import { getStaticFiles, staticFile } from "remotion";
import { requireBg49Manifest } from "./manifestGuard";
import { BG49_VIDEO } from "./script";
import { estimateBg49Manifest, type Bg49Manifest } from "./timing";

// Финальный рендер (requireVoice) требует полной актуальной озвучки; в Studio
// и для локальных кадров без озвучки — оценочные тайминги.
export const loadBg49Manifest = async (
  requireVoice: boolean,
): Promise<Bg49Manifest> => {
  const path = `${BG49_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG049 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg49Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG049 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg49Manifest();
  }
  if (!res.ok)
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  const names = files.length ? new Set(files.map((f) => f.name)) : undefined;
  if (!requireVoice) {
    try {
      return requireBg49Manifest(raw, names);
    } catch {
      return estimateBg49Manifest();
    }
  }
  return requireBg49Manifest(raw, names);
};
