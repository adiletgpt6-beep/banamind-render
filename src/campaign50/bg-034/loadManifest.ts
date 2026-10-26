import { getStaticFiles, staticFile } from "remotion";
import { requireBg34Manifest } from "./manifestGuard";
import { BG34_VIDEO } from "./script";
import { estimateBg34Manifest, type Bg34Manifest } from "./timing";

// Финальный рендер (BG34_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg34Manifest = async (
  requireVoice: boolean,
): Promise<Bg34Manifest> => {
  const path = `${BG34_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG034 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg34Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG034 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg34Manifest();
  }
  if (!res.ok)
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg34Manifest(
        raw,
        files.length ? new Set(files.map((f) => f.name)) : undefined,
      );
    } catch {
      return estimateBg34Manifest();
    }
  }
  return requireBg34Manifest(
    raw,
    files.length ? new Set(files.map((f) => f.name)) : undefined,
  );
};
