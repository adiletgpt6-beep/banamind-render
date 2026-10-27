import { getStaticFiles, staticFile } from "remotion";
import { requireBg30Manifest } from "./manifestGuard";
import { BG30_VIDEO } from "./script";
import { estimateBg30Manifest, type Bg30Manifest } from "./timing";

// Финальный рендер (BG30_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg30Manifest = async (requireVoice: boolean): Promise<Bg30Manifest> => {
  const path = `${BG30_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG030 не создана. Рендер без голосов запрещён.");
    return estimateBg30Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG030 не создана. Рендер без голосов запрещён.");
    return estimateBg30Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg30Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg30Manifest();
    }
  }
  return requireBg30Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
