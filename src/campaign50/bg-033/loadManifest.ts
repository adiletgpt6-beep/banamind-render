import { getStaticFiles, staticFile } from "remotion";
import { requireBg33Manifest } from "./manifestGuard";
import { BG33_VIDEO } from "./script";
import { estimateBg33Manifest, type Bg33Manifest } from "./timing";

// Финальный рендер (BG33_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg33Manifest = async (
  requireVoice: boolean,
): Promise<Bg33Manifest> => {
  const path = `${BG33_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG033 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg33Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG033 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg33Manifest();
  }
  if (!res.ok)
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg33Manifest(
        raw,
        files.length ? new Set(files.map((f) => f.name)) : undefined,
      );
    } catch {
      return estimateBg33Manifest();
    }
  }
  return requireBg33Manifest(
    raw,
    files.length ? new Set(files.map((f) => f.name)) : undefined,
  );
};
