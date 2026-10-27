import { getStaticFiles, staticFile } from "remotion";
import { BG42_LINES, BG42_VIDEO } from "./script";
import { estimateManifest, type Manifest } from "./timeline";

// Финальный рендер без полной озвучки запрещён. Для локальных черновых
// кадров без голоса передайте input props {"allowEstimate": true} — тогда
// шкала строится по оценке длительности текста.
export const loadBg42Manifest = async (allowEstimate: boolean): Promise<Manifest> => {
  const path = `${BG42_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const fail = (msg: string): Manifest => {
    if (allowEstimate) return estimateManifest();
    throw new Error(`BalaGoBG042: ${msg}. Рендер без голоса запрещён.`);
  };
  if (files.length > 0 && !files.some((f) => f.name === path)) return fail("озвучка не создана");
  const res = await fetch(staticFile(path));
  if (!res.ok) return fail(`manifest.json недоступен (HTTP ${res.status})`);
  const m = (await res.json()) as Manifest & { readonly partial?: boolean };
  if (m.partial) return fail("озвучка создана не полностью");
  const names = new Set(files.map((f) => f.name));
  for (const l of BG42_LINES) {
    const got = m.lines.find((x) => x.id === l.id);
    if (!got || !got.file) return fail(`нет реплики ${l.id}`);
    if (names.size && !names.has(`${BG42_VIDEO.voiceDir}/${got.file}`)) return fail(`нет файла ${got.file}`);
  }
  return { lines: m.lines };
};
