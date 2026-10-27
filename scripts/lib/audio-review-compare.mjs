// Локальное сравнение независимой расшифровки аудиомодели со сценарием.
//
// Сценарий НИКОГДА не передаётся модели: модель распознаёт речь только по
// звуку, а сопоставление с ожидаемыми репликами делает этот код уже после
// ответа. Исходная расшифровка модели сохраняется без исправлений.
//
// Нормализация — только регистр, пробелы и пунктуация. Кыргызские у/ү, о/ө,
// н/ң, ы/и НЕ приравниваются, окончания и отрицания не стираются.
// Расхождение означает «сценарий ≠ распознавание», а не доказанную ошибку
// озвучки: модель может ослышаться.

// Метка неразборчивого места в расшифровке модели.
export const UNCLEAR_TOKEN = "<неразборчиво>";

// Пары букв, которые легко спутать на слух и в распознавании, но которые
// различают слова в кыргызском. Для классификации расхождения, не для равенства.
const KG_PAIRS = [
  ["у", "ү"],
  ["о", "ө"],
  ["н", "ң"],
  ["ы", "и"],
];
// Грубый признак отрицания: «эмес», «жок» или глагольный суффикс -ба/-бе…
// перед окончанием (бүтпөдү, барбайм). Только для пометки «проверить».
const NEGATION_WORD = /^(эмес\p{L}*|жок)$/u;
const NEGATION_SUFFIX =
  /^\p{L}{2,}(ба|бе|бо|бө|па|пе|по|пө|ма|ме|мо|мө)(й|ймын|йм|йт|ган|ген|гон|гөн|ды|ди|ду|дү|сың|сиң|сыз|сиз)$/u;
const isNegation = (w) => NEGATION_WORD.test(w) || NEGATION_SUFFIX.test(w);

export const normalizeText = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/\[\s*неразборчиво\s*\]/giu, ` ${UNCLEAR_TOKEN} `)
    .replace(/[^\p{L}\p{N}<>\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export const tokenize = (text) =>
  normalizeText(text)
    .split(" ")
    .filter(Boolean)
    .map((t) =>
      t.includes("неразборчиво") && t.startsWith("<") ? UNCLEAR_TOKEN : t,
    );

const lev = (a, b) => {
  const A = [...a];
  const B = [...b];
  let prev = Array.from({ length: B.length + 1 }, (_, j) => j);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++)
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1),
      );
    prev = cur;
  }
  return prev[B.length];
};

// 0 — одинаковые слова, 1 — совсем разные.
export const wordDistance = (a, b) => {
  if (a === b) return 0;
  if (a === UNCLEAR_TOKEN || b === UNCLEAR_TOKEN) return 1;
  return lev(a, b) / Math.max([...a].length, [...b].length, 1);
};

// Отличаются ли слова только кыргызскими парами букв (у/ү, о/ө, н/ң, ы/и).
export const differsOnlyByKyrgyzLetters = (a, b) => {
  const A = [...a];
  const B = [...b];
  if (A.length !== B.length || a === b) return false;
  return A.every(
    (ch, i) =>
      ch === B[i] ||
      KG_PAIRS.some(
        ([x, y]) => (ch === x && B[i] === y) || (ch === y && B[i] === x),
      ),
  );
};

const GAP = 0.75;

// Выравнивание двух последовательностей слов (Нидлман — Вунш).
// exp/heard: [{tok, ...meta}]. Возвращает операции eq/sub/del/ins.
export const alignTokens = (exp, heard) => {
  const n = exp.length;
  const m = heard.length;
  const D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const P = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1)); // 1 diag, 2 up(del), 3 left(ins)
  for (let i = 1; i <= n; i++) ((D[i][0] = i * GAP), (P[i][0] = 2));
  for (let j = 1; j <= m; j++) ((D[0][j] = j * GAP), (P[0][j] = 3));
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      const diag =
        D[i - 1][j - 1] + wordDistance(exp[i - 1].tok, heard[j - 1].tok);
      const up = D[i - 1][j] + GAP;
      const left = D[i][j - 1] + GAP;
      if (diag <= up && diag <= left) ((D[i][j] = diag), (P[i][j] = 1));
      else if (up <= left) ((D[i][j] = up), (P[i][j] = 2));
      else ((D[i][j] = left), (P[i][j] = 3));
    }
  const ops = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const p = P[i][j];
    if (p === 1) {
      const e = exp[i - 1];
      const h = heard[j - 1];
      ops.push({ op: e.tok === h.tok ? "eq" : "sub", e, h });
      (i--, j--);
    } else if (p === 2) {
      ops.push({ op: "del", e: exp[i - 1], h: null });
      i--;
    } else {
      ops.push({ op: "ins", e: null, h: heard[j - 1] });
      j--;
    }
  }
  return ops.reverse();
};

// Классификация одного участка расхождения.
export const classifyDiff = (expWords, heardWords) => {
  if (!heardWords.length) return "missing_in_recognition";
  if (!expWords.length) return "extra_in_recognition";
  if (heardWords.includes(UNCLEAR_TOKEN)) return "unclear_in_recognition";
  const neg = (ws) => ws.some(isNegation);
  if (neg(expWords) !== neg(heardWords)) return "possible_negation_difference";
  if (
    expWords.length === heardWords.length &&
    expWords.every(
      (w, k) =>
        w === heardWords[k] || differsOnlyByKyrgyzLetters(w, heardWords[k]),
    )
  )
    return "kyrgyz_letters";
  if (expWords.length === 1 && heardWords.length === 1) {
    const a = [...expWords[0]];
    const b = [...heardWords[0]];
    let p = 0;
    while (p < a.length && p < b.length && a[p] === b[p]) p++;
    // Окончание — только если различие целиком в последних ≤ 3 буквах.
    if (p >= 3 && a.length - p <= 3 && b.length - p <= 3) return "word_ending";
  }
  return "different_words";
};

export const DIFF_KIND_RU = {
  missing_in_recognition:
    "в распознавании нет этих слов (не доказывает их отсутствие в звуке)",
  extra_in_recognition: "в распознавании лишние слова",
  unclear_in_recognition: "модель пометила место неразборчивым",
  possible_negation_difference:
    "возможное расхождение в отрицании — проверить обязательно",
  kyrgyz_letters:
    "различие кыргызских букв (у/ү, о/ө, н/ң, ы/и) — слова считаются разными",
  word_ending: "другое окончание",
  different_words: "другие слова",
};

// Сравнение реплик сценария с независимой расшифровкой одного фрагмента.
// lines: [{id, role, text, boundary(bool), boundary_reason}] в ожидаемом порядке.
// heard: [{index, text, certainty}] — расшифровка модели в её порядке.
// Нормализация пробелов: слово, разнесённое пробелом («эки де»), склеивается,
// если слитное написание есть на другой стороне («экиде»). Буквы не меняются.
export const joinSplitWords = (tokens, otherSet) => {
  const out = [];
  const joined = [];
  for (let i = 0; i < tokens.length; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (b && !otherSet.has(a) && otherSet.has(a + b)) {
      out.push(a + b);
      joined.push(`${a} ${b} → ${a + b}`);
      i++;
    } else out.push(a);
  }
  return { tokens: out, joined };
};

export const compareLines = (lines, heard) => {
  const rawExp = lines.map((l) => tokenize(l.text));
  const rawHeard = heard.map((h) => tokenize(h.text));
  const expSet = new Set(rawExp.flat());
  const heardSet = new Set(rawHeard.flat());
  const spacing = [];
  const exp = [];
  rawExp.forEach((toks, li) => {
    const j = joinSplitWords(toks, heardSet);
    spacing.push(...j.joined.map((x) => `сценарий: ${x}`));
    j.tokens.forEach((tok, k) => exp.push({ tok, line: li, k }));
  });
  const hs = [];
  rawHeard.forEach((toks, hi) => {
    const j = joinSplitWords(toks, expSet);
    spacing.push(...j.joined.map((x) => `распознавание: ${x}`));
    j.tokens.forEach((tok, k) => hs.push({ tok, seg: heard[hi].index, k }));
  });
  const ops = alignTokens(exp, hs);

  // Лишние слова распознавания относим к соседней реплике, если она делит с
  // ними фрагмент речи модели; иначе — неоднозначно.
  const perLine = lines.map(() => ({ ops: [], ambiguousExtra: false }));
  const unassigned = [];
  ops.forEach((o, idx) => {
    if (o.op !== "ins") return void perLine[o.e.line].ops.push(o);
    const prev = ops
      .slice(0, idx)
      .reverse()
      .find((x) => x.e);
    const next = ops.slice(idx + 1).find((x) => x.e);
    const shares = (x) => x && x.h && x.h.seg === o.h.seg;
    const target = shares(prev) ? prev : shares(next) ? next : (prev ?? next);
    if (!target) return void unassigned.push(o.h);
    perLine[target.e.line].ops.push(o);
    if (!shares(prev) && !shares(next))
      perLine[target.e.line].ambiguousExtra = true;
  });
  // Упорядочим операции внутри реплики по исходному порядку выравнивания.
  for (const pl of perLine)
    pl.ops.sort((a, b) => ops.indexOf(a) - ops.indexOf(b));

  const certaintyOf = new Map(
    heard.map((h) => [h.index, String(h.certainty ?? "").toLowerCase()]),
  );

  return {
    lines: lines.map((l, li) => {
      const lo = perLine[li].ops;
      const expected = lo.filter((o) => o.e).map((o) => o.e.tok);
      const heardToks = lo.filter((o) => o.h).map((o) => o.h.tok);
      const segs = [...new Set(lo.filter((o) => o.h).map((o) => o.h.seg))];
      const eq = lo.filter((o) => o.op === "eq").length;
      const sub = lo.filter((o) => o.op === "sub").length;
      const del = lo.filter((o) => o.op === "del").length;
      const ins = lo.filter((o) => o.op === "ins").length;
      // Участки расхождения: подряд идущие неравные операции.
      const diffs = [];
      let cur = null;
      for (const o of lo) {
        if (o.op === "eq") {
          if (cur) (diffs.push(cur), (cur = null));
          continue;
        }
        cur ??= { expected: [], heard: [] };
        if (o.e) cur.expected.push(o.e.tok);
        if (o.h) cur.heard.push(o.h.tok);
      }
      if (cur) diffs.push(cur);
      const diffOut = diffs.map((d) => {
        const kind = classifyDiff(d.expected, d.heard);
        return {
          expected: d.expected.join(" "),
          heard: d.heard.join(" "),
          kind,
          kind_ru: DIFF_KIND_RU[kind],
        };
      });

      const reasons = [];
      if (l.boundary)
        reasons.push(
          l.boundary_reason ?? "реплика на краю проверенного фрагмента",
        );
      if (!heardToks.length)
        reasons.push(
          "модель не разобрала соответствующих слов — это не доказывает, что реплики нет в звуке",
        );
      if (heardToks.includes(UNCLEAR_TOKEN))
        reasons.push("модель пометила часть речи неразборчивой");
      if (segs.some((s) => certaintyOf.get(s) === "low"))
        reasons.push("модель не уверена в распознавании (certainty low)");
      const wer = expected.length ? (sub + del + ins) / expected.length : 1;
      if (heardToks.length && wer > 0.6)
        reasons.push(
          "сопоставление слов неоднозначно (совпало меньше половины)",
        );
      if (perLine[li].ambiguousExtra)
        reasons.push("лишние слова на стыке реплик — привязка неоднозначна");

      let status;
      if (reasons.length) status = "unclear";
      else if (sub + del + ins === 0) status = "match";
      else if (eq / Math.max(expected.length, 1) >= 0.5) status = "partial";
      else status = "mismatch";

      return {
        id: l.id ?? null,
        role: l.role ?? null,
        expected_text: l.text,
        heard_text_aligned: heardToks.join(" "),
        heard_segments: segs,
        status,
        needs_human_check: status !== "match",
        reasons,
        diffs: diffOut,
        word_stats: {
          expected: expected.length,
          equal: eq,
          substituted: sub,
          missing_in_recognition: del,
          extra_in_recognition: ins,
        },
      };
    }),
    unassigned_heard: unassigned.map((h) => ({ segment: h.seg, word: h.tok })),
    spacing_normalized: spacing,
  };
};
