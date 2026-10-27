// Выравнивание слов титров по реальному звуку локальной озвучки.
// 1) Распознавание (zipformer-ru) даёт слова с моментами начала в аудио.
// 2) Произнесённые слова (текст произношения) сопоставляются с распознанными
//    динамическим программированием по сходству букв; несопоставленные получают
//    время между соседними опорами (по числу букв) — только внутри коротких промежутков.
// 3) Слова титров ↔ слова произношения: совпадающие слова — один к одному,
//    число в титрах получает время всей группы числительных.
const letters = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
const lev = (a, b) => {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let p = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] === b[j - 1] ? 0 : 1));
      p = t;
    }
  }
  return d[b.length];
};
const sim = (a, b) => (a.length + b.length ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0);

export const asrWords = (asr) => {
  const out = [];
  asr.tokens.forEach((tok, i) => {
    const t = asr.timestamps[i];
    if (tok.startsWith(" ") || tok.startsWith("▁") || !out.length) out.push({ w: tok.replace(/^[ ▁]/, ""), start: t });
    else out[out.length - 1].w += tok;
  });
  return out.map((x) => ({ ...x, w: letters(x.w) })).filter((x) => x.w);
};

// глобальное выравнивание последовательностей слов (Нидлман — Вунш)
const alignWords = (a, b) => {
  const n = a.length;
  const m = b.length;
  const S = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const B = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  const gap = -0.4;
  for (let i = 1; i <= n; i++) (S[i][0] = i * gap), (B[i][0] = 1);
  for (let j = 1; j <= m; j++) (S[0][j] = j * gap), (B[0][j] = 2);
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const s = sim(a[i - 1], b[j - 1]);
      const d = S[i - 1][j - 1] + (s >= 0.5 ? s : s - 1);
      const u = S[i - 1][j] + gap;
      const l = S[i][j - 1] + gap;
      if (d >= u && d >= l) (S[i][j] = d), (B[i][j] = 0);
      else if (u >= l) (S[i][j] = u), (B[i][j] = 1);
      else (S[i][j] = l), (B[i][j] = 2);
    }
  const map = new Array(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && B[i][j] === 0) {
      if (sim(a[i - 1], b[j - 1]) >= 0.5) map[i - 1] = j - 1;
      i--;
      j--;
    } else if (i > 0 && (j === 0 || B[i][j] === 1)) i--;
    else j--;
  }
  return map;
};

// время каждого произнесённого слова: начало по распознаванию, конец — начало следующего
// (с поправкой на паузу по громкости), речь — от первого до последнего слова
export const spokenTimes = (spoken, asr, speechStart, speechEnd, env) => {
  const toks = spoken.split(/\s+/).filter(Boolean);
  const keys = toks.map(letters);
  const aw = asrWords(asr);
  const map = alignWords(keys.map((k) => k || "·"), aw.map((x) => x.w));
  const starts = toks.map((_, i) => (map[i] >= 0 ? aw[map[i]].start : null));
  if (starts[0] === null) starts[0] = speechStart;
  // интерполяция пропусков по числу букв между опорами
  for (let i = 0; i < toks.length; i++) {
    if (starts[i] !== null) continue;
    let j = i;
    while (j < toks.length && starts[j] === null) j++;
    const a = starts[i - 1];
    const b = j < toks.length ? starts[j] : speechEnd;
    const w = (k) => 1 + keys[k].length;
    const total = Array.from({ length: j - i + 1 }, (_, k) => w(i - 1 + k)).reduce((x, y) => x + y, 0);
    let acc = w(i - 1);
    for (let k = i; k < j; k++) {
      starts[k] = a + ((b - a) * acc) / total;
      acc += w(k);
    }
  }
  // монотонность
  for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1] + 0.02);
  const voiced = (t) => (env[Math.floor(t * 30)] ?? 0) > 0.08;
  return toks.map((t, i) => {
    const next = i + 1 < toks.length ? starts[i + 1] : speechEnd;
    let end = Math.max(starts[i] + 0.06, next - 0.02);
    // пауза после слова (конец фразы): конец — последний звучащий кадр
    let e = end;
    while (e > starts[i] + 0.12 && !voiced(e)) e -= 1 / 30;
    end = Math.min(end, e + 0.05);
    return { text: t, start: +starts[i].toFixed(3), end: +end.toFixed(3), matched: map[i] >= 0 };
  });
};

// слова титров ← слова произношения
export const textWords = (text, spokenWords) => {
  const tt = text.split(/\s+/).filter(Boolean);
  const sw = spokenWords;
  const key = (s) => letters(s);
  const isAnchor = (s) => /\p{L}/u.test(s) && !/\d/.test(s);
  const out = new Array(tt.length).fill(null);
  let p = 0;
  let pending = [];
  const flush = (to) => {
    if (!pending.length) return;
    const grp = sw.slice(p, to);
    if (!grp.length) {
      const prev = sw[Math.max(0, p - 1)];
      for (const k of pending) out[k] = { text: tt[k], start: prev.end, end: prev.end };
    } else {
      // несколько чисел подряд: деление группы по запятым, иначе поровну
      const parts = [];
      let cur = [];
      grp.forEach((w) => {
        cur.push(w);
        if (/,$/.test(w.text)) (parts.push(cur), (cur = []));
      });
      if (cur.length) parts.push(cur);
      const chunks = parts.length === pending.length ? parts : pending.map((_, i) => grp.slice(Math.floor((i * grp.length) / pending.length), Math.floor(((i + 1) * grp.length) / pending.length)));
      pending.forEach((k, i) => {
        const c = chunks[i].length ? chunks[i] : [grp[grp.length - 1]];
        out[k] = { text: tt[k], start: c[0].start, end: c[c.length - 1].end };
      });
    }
    pending = [];
  };
  for (let i = 0; i < tt.length; i++) {
    const k = key(tt[i]);
    if (!k) {
      const prev = out[i - 1] ?? sw[Math.max(0, p - 1)];
      out[i] = { text: tt[i], start: prev?.end ?? 0, end: prev?.end ?? 0 };
      continue;
    }
    if (!isAnchor(tt[i])) {
      pending.push(i);
      continue;
    }
    let j = p;
    while (j < sw.length && key(sw[j].text) !== k) j++;
    if (j >= sw.length) {
      // форма слова в произношении другая («миллиона» → «миллионов»): слово идёт вместе с числом
      pending.push(i);
      continue;
    }
    flush(j);
    out[i] = { text: tt[i], start: sw[j].start, end: sw[j].end };
    p = j + 1;
  }
  flush(sw.length);
  // знаки без букв («—») и формы слов, ушедшие в группу числа, — не раньше предыдущего слова
  for (let i = 1; i < out.length; i++) {
    if (!letters(tt[i])) out[i] = { ...out[i], start: out[i - 1].end, end: out[i - 1].end };
    if (out[i].start < out[i - 1].start) out[i] = { ...out[i], start: out[i - 1].start, end: Math.max(out[i].end, out[i - 1].start) };
  }
  return out;
};
