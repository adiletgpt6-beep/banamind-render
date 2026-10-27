import { getStaticFiles, staticFile } from "remotion";
import { NB2_LINES, NB2_VIDEO } from "./script";
import { estimateNb2Manifest, type Nb2Manifest } from "./timing";

// Silent estimates are permitted only in the visibly labelled draft mode.
export const loadNb2Manifest = async (preview = false): Promise<Nb2Manifest> => {
  const path = `${NB2_VIDEO.voiceDir}/manifest.json`;
  const files = getStaticFiles();
  const missing = files.length > 0 && !files.some((f) => f.name === path);
  const res = missing ? null : await fetch(staticFile(path));
  if (!res || res.status === 404) {
    if (preview) return estimateNb2Manifest();
    throw new Error("Не создана полная озвучка BalaGoNoBackup2D.");
  }
  if (!res.ok) throw new Error(`Не удалось загрузить озвучку: HTTP ${res.status}.`);
  const data = await res.json() as Nb2Manifest & { partial?: boolean };
  if (data.version !== 1 || data.kind !== "nb2d") throw new Error("Неизвестный формат manifest.json.");
  const valid = data.lines.filter(ml => NB2_LINES.some(l => l.id === ml.id && ml.text === l.text && Boolean(ml.file)));
  const absent = NB2_LINES.filter(l => !valid.some(ml => ml.id === l.id));
  if (!preview && (data.partial || absent.length)) throw new Error(`Нет актуальной озвучки: ${absent.map(l => l.id).join(", ")}`);
  return { ...data, estimated: preview && absent.length > 0, lines: valid };
};
