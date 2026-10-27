import { getStaticFiles, staticFile } from "remotion";
import { requireBg36Manifest } from "./manifestGuard";
import { BG36_VIDEO } from "./script";
import { estimateBg36Manifest, type Bg36Manifest } from "./timing";

// Финальный рендер (requireVoice) требует полной актуальной озвучки;
// для превью без озвучки — оценочные тайминги по тексту.
export const loadBg36Manifest = async (
  requireVoice: boolean,
): Promise<Bg36Manifest> => {
  const path = `${BG36_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const names = files.length ? new Set(files.map((f) => f.name)) : undefined;
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  const none = (): Bg36Manifest => {
    if (requireVoice)
      throw new Error("Озвучка BalaGoBG036 не создана. Рендер без голоса запрещён.");
    return estimateBg36Manifest();
  };
  if (missing) return none();
  const res = await fetch(staticFile(path));
  if (res.status === 404) return none();
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg36Manifest(raw, names);
    } catch {
      return estimateBg36Manifest();
    }
  }
  return requireBg36Manifest(raw, names);
};
