import { getStaticFiles, staticFile } from "remotion";
import { requireBg22Manifest } from "./manifestGuard";
import { BG22_VIDEO } from "./script";
import { estimateBg22Manifest, type Bg22Manifest } from "./timing";

// Финальный рендер (BG22_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg22Manifest = async (
  requireVoice: boolean,
): Promise<Bg22Manifest> => {
  const path = `${BG22_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG022 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg22Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG022 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg22Manifest();
  }
  if (!res.ok)
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg22Manifest(
        raw,
        files.length ? new Set(files.map((f) => f.name)) : undefined,
      );
    } catch {
      return estimateBg22Manifest();
    }
  }
  return requireBg22Manifest(
    raw,
    files.length ? new Set(files.map((f) => f.name)) : undefined,
  );
};
