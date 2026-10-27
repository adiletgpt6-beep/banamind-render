import { getStaticFiles, staticFile } from "remotion";
import { requireBg29Manifest } from "./manifestGuard";
import { BG29_VIDEO } from "./script";
import { estimateBg29Manifest, type Bg29Manifest } from "./timing";

// Финальный рендер (BG29_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg29Manifest = async (requireVoice: boolean): Promise<Bg29Manifest> => {
  const path = `${BG29_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG029 не создана. Рендер без голосов запрещён.");
    return estimateBg29Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG029 не создана. Рендер без голосов запрещён.");
    return estimateBg29Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg29Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg29Manifest();
    }
  }
  return requireBg29Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
