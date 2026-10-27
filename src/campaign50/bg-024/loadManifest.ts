import { getStaticFiles, staticFile } from "remotion";
import { requireBg24Manifest } from "./manifestGuard";
import { BG24_VIDEO } from "./script";
import { estimateBg24Manifest, type Bg24Manifest } from "./timing";

// Финальный рендер (BG24_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg24Manifest = async (requireVoice: boolean): Promise<Bg24Manifest> => {
  const path = `${BG24_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG024 не создана. Рендер без голосов запрещён.");
    return estimateBg24Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG024 не создана. Рендер без голосов запрещён.");
    return estimateBg24Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg24Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg24Manifest();
    }
  }
  return requireBg24Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
