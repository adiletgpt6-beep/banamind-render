// Деление реплики на части субтитра (без React — проверяется тестами).
// Часть — не больше двух строк по MAX_CHARS символов; длинное предложение
// делится сбалансированно, лучше по запятой, двоеточию или тире, и никогда
// не сразу после союза («же», «жана»…), чтобы он не висел в конце части.
export const MAX_CHARS = 30; // символов в строке при размере 52 px и ширине 860 px
export const CHUNK_MAX = MAX_CHARS * 2 - 4;
const CONJ = /^(же|жана|бирок|анан)$/i;

// Деление текста на части ≤ 2 строк: по предложениям, затем по словам.
export const subChunks = (text: string): string[] => {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  const out: string[] = [];
  // длинное предложение делится на сбалансированные части (лучше — по
  // запятой или тире), без «висящих» одиночных слов
  const push = (s: string) => {
    if (s.length <= CHUNK_MAX) {
      out.push(s);
      return;
    }
    const words = s.split(" ");
    let best = 1;
    let bestScore = Infinity;
    for (let i = 1; i < words.length; i++) {
      const left = words.slice(0, i).join(" ");
      const right = words.slice(i).join(" ");
      const score = Math.abs(left.length - right.length) - (/[,—:]$/.test(words[i - 1]) ? 24 : 0) + (CONJ.test(words[i - 1]) ? 40 : 0) + (right.length > CHUNK_MAX || left.length > CHUNK_MAX ? 100 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    }
    push(words.slice(0, best).join(" "));
    push(words.slice(best).join(" "));
  };
  let cur = "";
  for (const s of sentences) {
    const next = cur ? `${cur} ${s}` : s;
    if (next.length <= MAX_CHARS * 2 - 6) cur = next;
    else {
      if (cur) push(cur);
      cur = s;
    }
  }
  if (cur) push(cur);
  return out;
};

// Слово озвучки, с которого начинается каждая часть субтитра. Текст
// субтитра и озвучки может различаться (BalaGo → «Балаго», WhatsApp →
// «Ватсап», номер цифрами → словами), поэтому начало части ищется по её
// первому слову в словах озвучки, а не по порядковому номеру.
const SPOKEN_ALIAS: Record<string, string> = { balago: "балаго", whatsapp: "ватсап" };
export const norm = (w: string) => {
  const s = w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return SPOKEN_ALIAS[s] ?? s;
};
export const chunkStarts = (parts: readonly string[], spoken: readonly string[]): number[] => {
  const sp = spoken.map(norm);
  const out: number[] = [];
  let wi = 0; // запасной вариант — счёт слов субтитра
  let from = 0;
  for (const p of parts) {
    const pw = p.split(/\s+/).filter(Boolean);
    const at = sp.indexOf(norm(pw[0] ?? ""), from);
    const start = at >= 0 ? at : Math.max(from, wi);
    out.push(start);
    from = start + 1;
    wi += pw.length;
  }
  return out;
};

