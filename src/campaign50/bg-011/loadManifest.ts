import { getStaticFiles, staticFile } from "remotion";
import { requireBg11Manifest } from "./manifestGuard";
import { BG11_VIDEO } from "./script";
import { estimateBg11Manifest, type Bg11Manifest } from "./timing";

// Финальный рендер (BG11_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg11Manifest = async (requireVoice: boolean): Promise<Bg11Manifest> => {
  const path = `${BG11_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG011 не создана. Рендер без голосов запрещён.");
    return estimateBg11Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG011 не создана. Рендер без голосов запрещён.");
    return estimateBg11Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg11Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg11Manifest();
    }
  }
  return requireBg11Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
