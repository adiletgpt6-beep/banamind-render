import { getStaticFiles, staticFile } from "remotion";
import { requireBg26Manifest } from "./manifestGuard";
import { BG26_VIDEO } from "./script";
import { estimateBg26Manifest, type Bg26Manifest } from "./timing";

// Финальный рендер (BG26_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg26Manifest = async (requireVoice: boolean): Promise<Bg26Manifest> => {
  const path = `${BG26_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG026 не создана. Рендер без голосов запрещён.");
    return estimateBg26Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG026 не создана. Рендер без голосов запрещён.");
    return estimateBg26Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg26Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg26Manifest();
    }
  }
  return requireBg26Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
