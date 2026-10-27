import { getStaticFiles, staticFile } from "remotion";
import { requireBg44Manifest } from "./manifestGuard";
import { BG44_VIDEO } from "./script";
import { estimateBg44Manifest, type Bg44Manifest } from "./timing";

// Финальный рендер (BG44_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg44Manifest = async (requireVoice: boolean): Promise<Bg44Manifest> => {
  const path = `${BG44_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG044 не создана. Рендер без голосов запрещён.");
    return estimateBg44Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG044 не создана. Рендер без голосов запрещён.");
    return estimateBg44Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg44Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg44Manifest();
    }
  }
  return requireBg44Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
