import { getStaticFiles, staticFile } from "remotion";
import { requireBg10Manifest } from "./manifestGuard";
import { BG10_VIDEO } from "./script";
import { estimateBg10Manifest, type Bg10Manifest } from "./timing";

// Финальный рендер (BG10_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg10Manifest = async (requireVoice: boolean): Promise<Bg10Manifest> => {
  const path = `${BG10_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG010 не создана. Рендер без голосов запрещён.");
    return estimateBg10Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG010 не создана. Рендер без голосов запрещён.");
    return estimateBg10Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg10Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg10Manifest();
    }
  }
  return requireBg10Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
