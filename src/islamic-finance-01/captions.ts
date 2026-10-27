// Caption chunking (no JSX) — shared by the Captions component, the SRT
// exporter and the tests. One chunk = what is on screen at a time: at most
// 5 short words, never more than 28 characters, cut at clause boundaries
// (commas, dashes, sentence ends) and never ending on a function word.
import type { If01Manifest } from "./narration.ts";
import { IF01_LINES } from "./script.ts";

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
const MAX_WORDS = 5;
const MAX_CHARS = 28;
const FUNCTION_WORDS = new Set(["a", "an", "the", "of", "to", "for", "in", "and", "or", "it", "is"]);

export type ChunkWord = { text: string; start: number; end: number; key: boolean; money: boolean; clauseEnd: boolean };
export type Chunk = { readonly words: readonly ChunkWord[]; readonly from: number; readonly to: number };

// Lines whose words are already the on-screen headline are not captioned twice.
const SKIP = new Set(["l6"]);

export const buildChunks = (m: If01Manifest, skip: ReadonlySet<string> = SKIP): Chunk[] => {
  const out: Chunk[] = [];
  for (const line of m.lines) {
    if (skip.has(line.id)) continue;
    const spec = IF01_LINES.find((l) => l.id === line.id);
    const emph = new Set((spec?.emphasis ?? []).map(clean));
    // clause ends come from the written script (a lone "—" closes the clause before it)
    const tokens = (spec?.text ?? line.text).split(/\s+/).filter(Boolean);
    const clauseEnds: boolean[] = [];
    for (const t of tokens) {
      if (!/[A-Za-z0-9]/.test(t)) {
        if (clauseEnds.length) clauseEnds[clauseEnds.length - 1] = true;
        continue;
      }
      clauseEnds.push(/[,.?!;:—]$/.test(t));
    }
    const words: ChunkWord[] = [];
    for (const w of line.words) {
      const raw = w.text.trim();
      if (!/[A-Za-z0-9]/.test(raw)) continue;
      const text = raw.replace(/—/g, "").trim();
      words.push({ text, start: w.start, end: w.end, key: emph.has(clean(raw)), money: /\d|twenty|thousand|dollars/i.test(raw), clauseEnd: clauseEnds[words.length] ?? /[,.?!;:—]$/.test(raw) });
    }
    let cur: ChunkWord[] = [];
    const flush = () => {
      if (!cur.length) return;
      out.push({ words: cur, from: cur[0].start, to: cur[cur.length - 1].end });
      cur = [];
    };
    for (const w of words) {
      const chars = cur.reduce((a, x) => a + x.text.length + 1, 0) + w.text.length;
      const last = cur[cur.length - 1];
      if (cur.length && (last.clauseEnd || cur.length >= MAX_WORDS || chars > MAX_CHARS)) {
        // do not leave "a", "of", "to"… dangling at the end of a chunk, and
        // keep an amount ("twenty-two thousand") together
        let carry: ChunkWord[] = [];
        if (!last.clauseEnd && cur.length > 1) {
          let k = cur.length;
          while (k > 1 && (FUNCTION_WORDS.has(clean(cur[k - 1].text)) || (w.money && cur[k - 1].money))) k--;
          carry = cur.splice(k);
        }
        flush();
        cur = carry;
      }
      cur.push(w);
    }
    flush();
  }
  // a chunk stays until the next one starts (max 0.6 s after its last word)
  return out.map((c, i) => ({ ...c, to: Math.min(c.to + 0.6, out[i + 1] ? out[i + 1].from - 0.04 : c.to + 0.6) }));
};
