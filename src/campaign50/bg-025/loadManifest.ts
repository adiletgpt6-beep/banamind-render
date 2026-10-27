import { getStaticFiles, staticFile } from "remotion";
import { requireBg25Manifest } from "./manifestGuard";
import { BG25_VIDEO } from "./script";
import { estimateBg25Manifest, type Bg25Manifest } from "./timing";

// Финальный рендер (BG25_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg25Manifest = async (requireVoice: boolean): Promise<Bg25Manifest> => {
  const path = `${BG25_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG025 не создана. Рендер без голосов запрещён.");
    return estimateBg25Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG025 не создана. Рендер без голосов запрещён.");
    return estimateBg25Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg25Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg25Manifest();
    }
  }
  return requireBg25Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
