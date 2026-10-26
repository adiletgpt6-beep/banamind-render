import { getStaticFiles, staticFile } from "remotion";
import { BG18_LINES, BG18_VIDEO } from "./script";
import { estimateBg18Manifest, type Bg18Manifest } from "./timing";

// Финальный рендер требует полной озвучки: без неё — ошибка. Черновые
// кадры (BG18_DRAFT=1 → inputProps.draft) собираются по оценке таймингов.
export const loadBg18Manifest = async (draft: boolean): Promise<Bg18Manifest> => {
  const path = `${BG18_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  const res = missing ? null : await fetch(staticFile(path));
  if (!res || res.status === 404) {
    if (draft) return estimateBg18Manifest();
    throw new Error("Озвучка BalaGoBG018 не создана. Рендер без голосов запрещён.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const m = (await res.json()) as Bg18Manifest & { partial?: boolean };
  const names = new Set(files.map((f) => f.name));
  const absent = BG18_LINES.filter((l) => {
    const ml = m.lines.find((x) => x.id === l.id);
    return !ml?.file || (names.size > 0 && !names.has(`${BG18_VIDEO.voiceDir}/${ml.file}`));
  });
  if ((absent.length || m.partial) && !draft) throw new Error(`Нет озвучки реплик: ${absent.map((l) => l.id).join(", ") || "manifest partial"}.`);
  return m;
};
