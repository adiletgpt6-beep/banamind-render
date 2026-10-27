import { getStaticFiles, staticFile } from "remotion";
import { requireBg46Manifest } from "./manifestGuard";
import { BG46_VIDEO } from "./script";
import { estimateBg46Manifest, type Bg46Manifest } from "./timing";

// Финальный рендер (BG46_REQUIRE_VOICE=1 или нет Studio) требует полной
// актуальной озвучки; в Studio без озвучки — оценочные тайминги.
export const loadBg46Manifest = async (requireVoice: boolean): Promise<Bg46Manifest> => {
  const path = `${BG46_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  if (missing) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG046 не создана. Рендер без голосов запрещён.");
    return estimateBg46Manifest();
  }
  const res = await fetch(staticFile(path));
  if (res.status === 404) {
    if (requireVoice) throw new Error("Озвучка BalaGoBG046 не создана. Рендер без голосов запрещён.");
    return estimateBg46Manifest();
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const raw = await res.json();
  if (!requireVoice) {
    try {
      return requireBg46Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
    } catch {
      return estimateBg46Manifest();
    }
  }
  return requireBg46Manifest(raw, files.length ? new Set(files.map((f) => f.name)) : undefined);
};
