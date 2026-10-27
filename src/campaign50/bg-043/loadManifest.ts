import { getStaticFiles, staticFile } from "remotion";
import { requireBg43Manifest } from "./manifestGuard";
import { BG43_VIDEO } from "./script";
import { estimateBg43Manifest, type Bg43Manifest } from "./timing";

// Финальный рендер (BG43_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg43Manifest = async (requireVoice: boolean): Promise<Bg43Manifest> => {
  const path = `${BG43_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG043 не создана. Рендер без голосов запрещён.");
    return estimateBg43Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG043 не создана. Рендер без голосов запрещён.");
    return estimateBg43Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg43Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg43Manifest();
    }
  }
  return requireBg43Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
