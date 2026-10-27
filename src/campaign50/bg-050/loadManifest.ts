import { getStaticFiles, staticFile } from "remotion";
import { requireBg50Manifest } from "./manifestGuard";
import { BG50_VIDEO } from "./script";
import { estimateBg50Manifest, type Bg50Manifest } from "./timing";

// Финальный рендер (BG50_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg50Manifest = async (requireVoice: boolean): Promise<Bg50Manifest> => {
  const path = `${BG50_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG050 не создана. Рендер без голосов запрещён.");
    return estimateBg50Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG050 не создана. Рендер без голосов запрещён.");
    return estimateBg50Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg50Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg50Manifest();
    }
  }
  return requireBg50Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
