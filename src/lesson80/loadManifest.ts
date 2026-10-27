import { staticFile } from "remotion";
import { L80_VIDEO } from "./script";
import { estimateManifest, type L80Manifest } from "./timeline";

// Озвучка из public/audio/lesson80-1-14/manifest.json. Пока её нет, Studio и
// контрольные кадры строятся по оценочной длительности (estimated: true);
// финальный рендер проверяет наличие озвучки (scripts/lesson80/verify.mjs).
export const loadL80Manifest = async (): Promise<L80Manifest> => {
  const res = await fetch(staticFile(`${L80_VIDEO.voiceDir}/manifest.json`));
  if (!res.ok) return estimateManifest();
  return (await res.json()) as L80Manifest;
};
