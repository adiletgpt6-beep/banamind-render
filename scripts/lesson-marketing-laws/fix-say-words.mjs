// Пересчёт слов титров для реплик с ln.say из сохранённых побуквенных таймингов
// (manifest.json → chars), без повторного синтеза: node scripts/lesson-marketing-laws/fix-say-words.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { SCENES } from "../../src/lesson-marketing-laws/script.ts";
import { mapSayWords, sayWordsFromChars } from "./say-words.mjs";

const P = "public/lesson-marketing-laws/voice/manifest.json";
const m = JSON.parse(readFileSync(P, "utf8"));
const byId = new Map(SCENES.flatMap((s) => s.lines).map((l) => [l.id, l]));
let n = 0;
for (const v of m.lines) {
  const ln = byId.get(v.id);
  if (!ln?.say || !v.chars?.length) continue;
  v.words = mapSayWords(ln.text, sayWordsFromChars(ln.say, v.chars));
  n++;
}
writeFileSync(P, JSON.stringify(m));
console.log(`✓ слова пересчитаны для ${n} реплик с особым произношением`);
