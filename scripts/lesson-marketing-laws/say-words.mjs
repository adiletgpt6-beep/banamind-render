// Тайминги слов титров для реплик с особым произношением (ln.say).
// слова титров по словам произношения (ln.say): совпадающие слова получают свои
// точные тайминги, а заменённые фрагменты (латиница → кириллица) — общий
// промежуток соответствующих произнесённых слов, по доле букв.
const normTok = (w) => w.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
export const mapSayWords = (text, sayWords) => {
  const a = text.split(/\s+/).filter(Boolean);
  const b = sayWords.filter((w) => normTok(w.text));
  const n = a.length;
  const m = b.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--) L[i][j] = normTok(a[i]) && normTok(a[i]) === normTok(b[j].text) ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const pairs = [];
  for (let i = 0, j = 0; i < n && j < m; ) {
    if (normTok(a[i]) && normTok(a[i]) === normTok(b[j].text)) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else j++;
  }
  pairs.push([n, m]);
  const out = new Array(n);
  let pi = 0;
  let pj = 0;
  for (const [i, j] of pairs) {
    if (i > pi) {
      const start = pj < m ? (j > pj ? b[pj].start : pj > 0 ? b[pj - 1].end : b[0].start) : b[m - 1].end;
      const end = j > pj ? b[j - 1].end : j < m ? b[j].start : b[m - 1].end;
      const w = a.slice(pi, i).map((t) => 1 + normTok(t).length);
      const tot = w.reduce((x, y) => x + y, 0);
      let acc = 0;
      for (let k = pi; k < i; k++) {
        out[k] = { text: a[k], start: +(start + ((end - start) * acc) / tot).toFixed(3), end: +(start + ((end - start) * (acc + w[k - pi])) / tot).toFixed(3) };
        acc += w[k - pi];
      }
    }
    if (i < n) out[i] = { text: a[i], start: b[j].start, end: b[j].end };
    pi = i + 1;
    pj = j + 1;
  }
  // знаки без букв (тире) — нулевой длины в конце предыдущего слова; время только растёт
  let last = b.length ? b[0].start : 0;
  return out.map((w) => {
    const start = normTok(w.text) ? Math.max(w.start, last) : last;
    const end = normTok(w.text) ? Math.max(w.end, start) : start;
    last = normTok(w.text) ? start : last;
    return { text: w.text, start: +start.toFixed(3), end: +end.toFixed(3) };
  });
};

// слова произношения по побуквенным таймингам (буквы ln.say по порядку)
export const sayWordsFromChars = (say, chars) => {
  let k = 0;
  return say.split(/\s+/).filter(Boolean).map((t) => {
    const n = [...t].filter((ch) => /\p{L}/u.test(ch)).length;
    if (!n || k >= chars.length) return { text: t, start: chars[Math.max(0, k - 1)]?.end ?? 0, end: chars[Math.max(0, k - 1)]?.end ?? 0 };
    const w = { text: t, start: chars[k].start, end: chars[Math.min(chars.length - 1, k + n - 1)].end };
    k += n;
    return w;
  });
};

