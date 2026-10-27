import { getStaticFiles, staticFile } from "remotion";
import { requireBg45Manifest } from "./manifestGuard";
import { BG45_VIDEO } from "./script";
import { estimateBg45Manifest, type Bg45Manifest } from "./timing";

// Финальный рендер (BG45_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg45Manifest = async (requireVoice: boolean): Promise<Bg45Manifest> => {
  const path = `${BG45_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG045 не создана. Рендер без голосов запрещён.");
    return estimateBg45Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG045 не создана. Рендер без голосов запрещён.");
    return estimateBg45Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg45Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg45Manifest();
    }
  }
  return requireBg45Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
