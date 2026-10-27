import { getStaticFiles, staticFile } from "remotion";
import { requireBg14Manifest } from "./manifestGuard";
import { BG14_VIDEO } from "./script";
import { estimateBg14Manifest, type Bg14Manifest } from "./timing";

// Финальный рендер (BG14_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg14Manifest = async (requireVoice: boolean): Promise<Bg14Manifest> => {
  const path = `${BG14_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG014 не создана. Рендер без голосов запрещён.");
    return estimateBg14Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG014 не создана. Рендер без голосов запрещён.");
    return estimateBg14Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg14Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg14Manifest();
    }
  }
  return requireBg14Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
