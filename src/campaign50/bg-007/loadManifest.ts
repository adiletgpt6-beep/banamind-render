import { getStaticFiles, staticFile } from "remotion";
import { requireBg7Manifest } from "./manifestGuard";
import { BG7_VIDEO } from "./script";
import { estimateBg7Manifest, type Bg7Manifest } from "./timing";

// Финальный рендер (BG7_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg7Manifest = async (requireVoice: boolean): Promise<Bg7Manifest> => {
  const path = `${BG7_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG007 не создана. Рендер без голосов запрещён.");
    return estimateBg7Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG007 не создана. Рендер без голосов запрещён.");
    return estimateBg7Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg7Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg7Manifest();
    }
  }
  return requireBg7Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
