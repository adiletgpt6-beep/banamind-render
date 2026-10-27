// Главы YouTube по фактическому тайм-лайну озвучки: начало первой сцены каждой части.
// node scripts/bm039/chapters.mjs → «0:00 Название» построчно
import { CHAPTERS } from "./chapters-data.mjs";
import { SCENES, timeline } from "./lib.mjs";



const tl = timeline();
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const out = [];
let prev = null;
tl.scenes.forEach((ts, i) => {
  const part = SCENES[i].part;
  if (part !== prev) out.push(`${mmss(i === 0 ? 0 : ts.from)} ${CHAPTERS[part]}`);
  prev = part;
});
console.log(out.join("\n"));
