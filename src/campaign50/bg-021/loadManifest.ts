import { staticFile } from "remotion";
import { BG021_VIDEO } from "./script";
import type { Bg021Manifest } from "./timing";

// Озвучка BG-021 (public/audio/campaign50/bg-021/manifest.json) или null,
// если её ещё нет (тогда шкала строится по оценке, без голоса).
export const loadBg021Manifest = async (): Promise<Bg021Manifest | null> => {
  const res = await fetch(staticFile(`${BG021_VIDEO.voiceDir}/manifest.json`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку BG-021: HTTP ${res.status}.`);
  return (await res.json()) as Bg021Manifest;
};
