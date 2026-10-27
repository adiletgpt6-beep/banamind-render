import { getStaticFiles, staticFile } from "remotion";
import { BG23_LINES, BG23_VIDEO, type Bg23Manifest } from "./script";

// Финальный рендер без полной озвучки запрещён. Для локальных черновых
// кадров без голоса передайте input props {"allowSilent": true}.
export const loadBg23Manifest = async (allowSilent: boolean): Promise<Bg23Manifest | null> => {
  const path = `${BG23_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const fail = (msg: string) => {
    if (allowSilent) return null;
    throw new Error(`BalaGoBG023: ${msg}. Рендер без голоса запрещён.`);
  };
  if (files.length > 0 && !files.some((f) => f.name === path)) return fail("озвучка не создана");
  const res = await fetch(staticFile(path));
  if (!res.ok) return fail(`manifest.json недоступен (HTTP ${res.status})`);
  const m = (await res.json()) as Bg23Manifest;
  const names = new Set(files.map((f) => f.name));
  for (const l of BG23_LINES) {
    const got = m.lines.find((x) => x.id === l.id);
    if (!got) return fail(`нет реплики ${l.id}`);
    if (names.size && !names.has(`${BG23_VIDEO.voiceDir}/${got.file}`)) return fail(`нет файла ${got.file}`);
  }
  return m;
};
