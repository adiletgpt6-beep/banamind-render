import { getStaticFiles, staticFile } from "remotion";
import { requireBg35Manifest } from "./manifestGuard";
import { BG35_VIDEO } from "./script";
import { estimateBg35Manifest, type Bg35Manifest } from "./timing";

// Финальный рендер (BG35_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg35Manifest = async (
  requireVoice: boolean,
): Promise<Bg35Manifest> => {
  const path = `${BG35_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG035 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg35Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice)
      throw new Error(
        "Озвучка BalaGoBG035 не создана. Рендер без голосов запрещён.",
      );
    return estimateBg35Manifest();
  }
  if (!res.ok)
    throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg35Manifest(
        raw,
        files.length ? new Set(files.map((f) => f.name)) : undefined,
      );
    } catch {
      return estimateBg35Manifest();
    }
  }
  return requireBg35Manifest(
    raw,
    files.length ? new Set(files.map((f) => f.name)) : undefined,
  );
};
