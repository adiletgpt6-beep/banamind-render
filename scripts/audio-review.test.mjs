// Офлайн-тесты анализатора звука: аргументы, покрытие времени, независимость
// прослушивания от сценария, локальное сравнение, время, кэш и частичные
// отказы. Сеть и платный API не используются — транспорт подменяется.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  ArgError,
  cacheKey,
  callWithRetry,
  classifyFailure,
  collectIssues,
  coverageGaps,
  extractWav,
  finalStatus,
  makeTransport,
  modelTime,
  parseArgs,
  parseModelText,
  planChunks,
  redact,
  runReview,
  sha256,
} from "./lib/audio-review.mjs";
import {
  compareLines,
  differsOnlyByKyrgyzLetters,
  normalizeText,
} from "./lib/audio-review-compare.mjs";

const tmp = () => mkdtempSync(join(tmpdir(), "audio-review-"));

// Синтетический стерео-WAV нужной длины (тон с плавающей частотой — у
// каждого фрагмента свои байты), без сети.
const makeWav = (dir, seconds) => {
  const p = join(dir, `tone-${seconds}.wav`);
  execFileSync("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-f",
    "lavfi",
    "-i",
    `aevalsrc=0.3*sin(2*PI*(300+10*t)*t):s=48000:d=${seconds}`,
    "-ac",
    "2",
    "-c:a",
    "pcm_s16le",
    p,
  ]);
  return p;
};

// SHA-256 фрагментов, как их вырежет движок, — чтобы фальшивый транспорт
// узнавал фрагмент по аудио, а не по тексту задания.
const chunkShas = (dir, input, start, end) =>
  planChunks(start, end).map((c) => {
    const p = join(dir, `ref-${c.index}.wav`);
    extractWav(input, p, c.start, c.duration);
    return sha256(readFileSync(p));
  });

const reply = ({
  heard = [],
  issues = [],
  scores = { intelligibility: 4 },
} = {}) =>
  JSON.stringify({
    heard_transcript: heard,
    scores,
    score_notes: {},
    issues,
    uncertain_segments: [],
    summary: "тест",
  });

const okResponse = (text, bytes, finish = "stop") => ({
  status: 200,
  bytesSent: bytes,
  payloadBytes: bytes,
  text: JSON.stringify({
    model: "gpt-audio-1.5",
    choices: [{ message: { content: text }, finish_reason: finish }],
    usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
  }),
});

// Фальшивый транспорт: определяет фрагмент по SHA-256 его WAV.
const fakeTransport = (shas, handler) => {
  const calls = [];
  const fn = async ({ body }) => {
    const audio = body.messages[0].content.find((c) => c.type === "input_audio")
      .input_audio.data;
    const idx = shas ? shas.indexOf(sha256(Buffer.from(audio, "base64"))) : 0;
    const bytes = Buffer.byteLength(JSON.stringify(body));
    calls.push({ idx, body });
    return handler({ idx, bytes, call: calls.length });
  };
  fn.calls = calls;
  return fn;
};
const noSleep = async () => {};
const quiet = () => {};

const writeJson = (dir, name, data) => {
  const p = join(dir, name);
  writeFileSync(p, JSON.stringify(data));
  return p;
};

// ── аргументы ──
test("аргументы: обязателен --input, числа и режимы проверяются", () => {
  assert.throws(() => parseArgs([]), ArgError);
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--start", "abc"]),
    /--start/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--start", "-1"]),
    /--start/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--duration", "0"]),
    /--duration/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--duration"]),
    /нет значения/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--auth", "token"]),
    /claude_proxy/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--model", "gpt-4o-mini"]),
    /аудиомодель/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--chunk", "5", "--overlap", "5"]),
    /--overlap/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--bogus"]),
    /неизвестный/,
  );
  assert.throws(
    () => parseArgs(["--input", "a.mp4", "--max-attempts", "50"]),
    /не больше 5/,
  );
});

test("аргументы: значения по умолчанию, --x=y и режим из окружения", () => {
  const o = parseArgs(
    ["--input=a.mp4", "--start", "3.5", "--duration=12", "--dry-run"],
    { AUDIO_QA_AUTH_MODE: "claude_proxy" },
  );
  assert.equal(o.input, "a.mp4");
  assert.equal(o.start, 3.5);
  assert.equal(o.duration, 12);
  assert.equal(o.dryRun, true);
  assert.equal(o.auth, "claude_proxy");
  assert.equal(o.model, "gpt-audio-1.5");
  assert.equal(parseArgs(["--input", "a.mp4"]).auth, "key");
});

test("режим claude_proxy не требует ключа, режим key требует OPENAI_API_KEY", () => {
  assert.equal(typeof makeTransport("claude_proxy", {}), "function");
  assert.throws(() => makeTransport("key", {}), /OPENAI_API_KEY/);
  assert.equal(
    typeof makeTransport("key", { OPENAI_API_KEY: "x" }),
    "function",
  );
});

// ── покрытие времени ──
test("нарезка: ≤ 20 с, перекрытие ≈ 2 с, без пропусков, края точные", () => {
  for (const [s, e] of [
    [0, 12],
    [0, 20],
    [0, 21],
    [5, 50],
    [0, 120],
    [3.3, 40.6],
    [0, 0.4],
  ]) {
    const ch = planChunks(s, e);
    assert.deepEqual(coverageGaps(ch, s, e), [], `${s}–${e}`);
    assert.equal(ch[0].start, s);
    assert.equal(ch.at(-1).end, Number(e.toFixed(3)));
    for (const c of ch) assert.ok(c.duration <= 20 + 1e-6);
    for (let i = 1; i < ch.length; i++)
      assert.ok(Math.abs(ch[i - 1].end - ch[i].start - 2) < 0.01);
  }
  assert.equal(planChunks(0, 120).length, 7);
  assert.equal(planChunks(0, 12).length, 1);
});

test("проверка покрытия находит пропуск", () => {
  assert.deepEqual(
    coverageGaps(
      [
        { start: 0, end: 10 },
        { start: 11, end: 20 },
      ],
      0,
      21,
    ),
    [
      { start: 10, end: 11 },
      { start: 20, end: 21 },
    ],
  );
});

// ── разбор ответа ──
test("разбор: JSON в markdown, нормализация полей, null в оценках допустим", () => {
  const r = parseModelText(
    "Вот:\n```json\n" +
      JSON.stringify({
        heard_transcript: [{ text: "Салам", certainty: "HIGH" }],
        scores: { intelligibility: 4, sfx_naturalness: null },
        score_notes: { sfx_naturalness: "эффектов не слышно" },
        issues: [
          {
            t_start: "1,5",
            category: "pace",
            confidence: "HIGH",
            severity: "huge",
            heard_segment: 7,
          },
        ],
      }) +
      "\n```",
  );
  assert.equal(r.ok, true);
  assert.equal(r.data.issues[0].t_start, 1.5);
  assert.equal(r.data.issues[0].confidence, "high");
  assert.equal(r.data.issues[0].severity, "minor");
  assert.equal(
    r.data.issues[0].heard_segment,
    null,
    "несуществующий фрагмент речи не принимается",
  );
  assert.equal(r.data.scores.sfx_naturalness, null);
  assert.equal(r.data.scores.pace, null, "непереданная оценка — null, не 5");
  assert.equal(r.data.score_notes.sfx_naturalness, "эффектов не слышно");
  assert.equal(r.data.heard_transcript[0].certainty, "high");
});

test("разбор: пустой ответ, мусор и JSON без нужных массивов — видимые ошибки", () => {
  assert.match(parseModelText("").error, /пустой/);
  assert.match(parseModelText("Звук хороший").error, /нет JSON/);
  assert.match(parseModelText("{ issues: [ }").error, /не разбирается/);
  assert.match(parseModelText('{"summary":"ok"}').error, /issues/);
  assert.match(parseModelText('{"issues":[]}').error, /heard_transcript/);
});

// ── 1. независимость прослушивания от сценария ──
test("сценарий (уникальные реплики, роли, таймкоды) не попадает в API body даже при --context", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const UNIQUE = [
    "Зымыраган кызгылт айдын жарыгы 7731",
    "Тоолуу көлдө сүзгөн ак куу 4410",
  ];
  const ctx = writeJson(dir, "ctx.json", {
    lines: [
      {
        id: "zz-line-unique-1",
        role: "role-unique-captain",
        text: UNIQUE[0],
        plan_at: 3.217,
      },
      {
        id: "zz-line-unique-2",
        role: "role-unique-pilot",
        text: UNIQUE[1],
        plan_at: 7.913,
        placement: {
          file: "voice-unique-xyz.mp3",
          file_from: 7.9,
          file_to: 10.4,
        },
      },
    ],
  });
  const withCtx = fakeTransport(null, ({ bytes }) =>
    okResponse(reply(), bytes),
  );
  await runReview(
    {
      ...parseArgs(["--input", input, "--context", ctx, "--no-cache"]),
      out: join(dir, "a"),
    },
    { transport: withCtx, log: quiet },
  );
  const noCtx = fakeTransport(null, ({ bytes }) => okResponse(reply(), bytes));
  await runReview(
    { ...parseArgs(["--input", input, "--no-cache"]), out: join(dir, "b") },
    { transport: noCtx, log: quiet },
  );

  const sent = JSON.stringify(withCtx.calls[0].body);
  for (const needle of [
    ...UNIQUE,
    "Зымыраган",
    "zz-line-unique",
    "role-unique",
    "voice-unique",
    "3.217",
    "7.913",
    "7.9",
    "сценар",
    "ОЖИДАЕМ",
  ])
    assert.ok(!sent.includes(needle), `в запросе найдено «${needle}»`);
  // Запрос с --context и без него идентичен.
  assert.deepEqual(withCtx.calls[0].body, noCtx.calls[0].body);
});

test("смена только --context пересчитывает сравнение без нового платного прослушивания", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const out = join(dir, "out");
  const heard = [
    {
      t_start: 1,
      t_end: 3,
      text: "Бүгүн балдарды качан алып келесиң?",
      certainty: "high",
    },
  ];
  const ctxA = writeJson(dir, "a.json", {
    lines: [
      { id: "f01", text: "Бүгүн балдарды качан алып келесиң?", plan_at: 3 },
    ],
  });
  const ctxB = writeJson(dir, "b.json", {
    lines: [
      { id: "f01", text: "Бүгүн балдарды качан алып кетесиң?", plan_at: 3 },
    ],
  });

  const t1 = fakeTransport(null, ({ bytes }) =>
    okResponse(reply({ heard }), bytes),
  );
  const r1 = await runReview(
    { ...parseArgs(["--input", input, "--context", ctxA]), out },
    { transport: t1, log: quiet },
  );
  assert.equal(t1.calls.length, 1);
  assert.equal(r1.script_comparison.per_chunk[0].lines[0].status, "match");

  const t2 = fakeTransport(null, () =>
    assert.fail("повторное платное прослушивание"),
  );
  const r2 = await runReview(
    { ...parseArgs(["--input", input, "--context", ctxB]), out },
    { transport: t2, log: quiet },
  );
  assert.equal(t2.calls.length, 0);
  assert.equal(r2.chunks[0].from_cache, true);
  assert.equal(
    r2.chunks[0].cache_key,
    r1.chunks[0].cache_key,
    "ключ кэша не зависит от сценария",
  );
  assert.equal(r2.audio_input_sent, false);
  assert.equal(
    r2.api_success,
    false,
    "api_success — только по ответу в этом запуске",
  );
  assert.equal(r2.status, "complete");
  const l = r2.script_comparison.per_chunk[0].lines[0];
  assert.equal(l.status, "partial");
  assert.deepEqual(
    l.diffs.map((d) => [d.expected, d.heard]),
    [["кетесиң", "келесиң"]],
  );
  // Исходная расшифровка не исправлена по сценарию.
  assert.equal(
    r2.model_assessment.per_chunk[0].heard_transcript[0].text,
    heard[0].text,
  );
});

test("старые записи кэша (v1, со сценарием в запросе) не используются", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const out = join(dir, "out");
  const t0 = fakeTransport(null, ({ bytes }) => okResponse(reply(), bytes));
  const r0 = await runReview(
    { ...parseArgs(["--input", input]), out },
    { transport: t0, log: quiet },
  );
  const cacheFile = join(
    dir,
    ".audio-review-cache",
    `${r0.chunks[0].cache_key}.json`,
  );
  const e = JSON.parse(readFileSync(cacheFile, "utf8"));
  writeFileSync(
    cacheFile,
    JSON.stringify({
      ...e,
      cache_format: 1,
      prompt_version: "audio-review-v1",
    }),
  );
  const t1 = fakeTransport(null, ({ bytes }) => okResponse(reply(), bytes));
  await runReview(
    { ...parseArgs(["--input", input]), out },
    { transport: t1, log: quiet },
  );
  assert.equal(t1.calls.length, 1);
});

// ── локальное сравнение ──
test("сравнение: разделённая и объединённая реплики сопоставляются по словам", () => {
  const lines = [
    { id: "a", text: "Апа, бүгүн сүрөт тарттык. Кечинде сага көрсөтөм." },
    { id: "b", text: "Көрсөтөсүң. Азыр үйгө барып тамактаналы." },
  ];
  // a разделена на две части, конец a и b объединены моделью в одну.
  const heard = [
    { index: 0, text: "Апа, бүгүн сүрөт тарттык.", certainty: "high" },
    { index: 1, text: "Кечинде сага көрсөтөм. Көрсөтөсүң.", certainty: "high" },
    { index: 2, text: "Азыр үйгө барып тамактаналы", certainty: "high" },
  ];
  const r = compareLines(lines, heard);
  assert.equal(r.lines[0].status, "match");
  assert.deepEqual(r.lines[0].heard_segments, [0, 1]);
  assert.equal(r.lines[1].status, "match");
  assert.deepEqual(r.lines[1].heard_segments, [1, 2]);
});

test("сравнение: у/ү, о/ө, н/ң, ы/и не приравниваются", () => {
  assert.notEqual(normalizeText("Уулубузду"), normalizeText("Уулубүздү"));
  assert.equal(normalizeText("  Бүгүн,   БАЛДАРДЫ! "), "бүгүн балдарды");
  assert.ok(differsOnlyByKyrgyzLetters("кызыбызды", "кизибизди"));
  assert.ok(differsOnlyByKyrgyzLetters("он", "өң"));
  const r = compareLines(
    [{ id: "m", text: "Уулубузду он экиде" }],
    [{ index: 0, text: "Уулубүздү өн экиде", certainty: "high" }],
  );
  assert.notEqual(r.lines[0].status, "match");
  assert.ok(r.lines[0].diffs.every((d) => d.kind === "kyrgyz_letters"));
});

test("сравнение: «иштеп алам» / «иште болом» — явное содержательное расхождение", () => {
  const r = compareLines(
    [
      {
        id: "m01",
        text: "Уулубузду он экиде, кызыбызды экиде. Ортодо иштеп алам.",
      },
    ],
    [
      {
        index: 0,
        text: "Уулубузду он экиде, кызыбызды экиде.",
        certainty: "high",
      },
      { index: 1, text: "Ортодо иште болом.", certainty: "high" },
    ],
  );
  const l = r.lines[0];
  assert.notEqual(l.status, "match");
  assert.equal(l.needs_human_check, true);
  const d = l.diffs.find((x) => x.expected === "иштеп алам");
  assert.ok(d, JSON.stringify(l.diffs));
  assert.equal(d.heard, "иште болом");
  assert.equal(d.kind, "different_words");
});

test("сравнение: окончания и отрицание не стираются", () => {
  const r = compareLines(
    [{ id: "m08", text: "Жок, кызым. Сен күнөөлүү эмессиң." }],
    [{ index: 0, text: "Кызым. Сен күнөөлүүсүң.", certainty: "high" }],
  );
  const l = r.lines[0];
  assert.notEqual(l.status, "match");
  assert.ok(
    l.diffs.some((d) => d.kind === "possible_negation_difference"),
    JSON.stringify(l.diffs),
  );
});

test("сравнение: слово, разнесённое пробелом, склеивается без изменения букв", () => {
  const r = compareLines(
    [{ id: "m", text: "он экиде, кызыбызды экиде" }],
    [{ index: 0, text: "он эки де, кызыбызды эки де", certainty: "high" }],
  );
  assert.equal(r.lines[0].status, "match");
  assert.equal(r.spacing_normalized.length, 2);
  const r2 = compareLines(
    [{ id: "m", text: "экиде" }],
    [{ index: 0, text: "өки де", certainty: "high" }],
  );
  assert.notEqual(r2.lines[0].status, "match", "склейка не приравнивает буквы");
});

test("сравнение: «другое окончание» — только когда различие в конце слова", () => {
  const end = compareLines(
    [{ id: "a", text: "келесиң" }],
    [{ index: 0, text: "келесин", certainty: "high" }],
  );
  assert.equal(end.lines[0].diffs[0].kind, "kyrgyz_letters");
  const end2 = compareLines(
    [{ id: "a", text: "тарттык" }],
    [{ index: 0, text: "тарттым", certainty: "high" }],
  );
  assert.equal(end2.lines[0].diffs[0].kind, "word_ending");
  const mid = compareLines(
    [{ id: "a", text: "уулубузду" }],
    [{ index: 0, text: "уулуузду", certainty: "high" }],
  );
  assert.equal(mid.lines[0].diffs[0].kind, "different_words");
});

test("свод: реплики вне выбранного диапазона не идут в ручную проверку", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const ctx = writeJson(dir, "ctx.json", {
    lines: [
      {
        id: "in",
        text: "Бүгүн балдарды качан алып келесиң",
        placement: { file_from: 3, file_to: 5 },
      },
      {
        id: "out",
        text: "Маршрутубуз боюнча сүйлөшүп көрөлү",
        placement: { file_from: 107, file_to: 109 },
      },
    ],
  });
  const heard = [
    { text: "Бүгүн балдарды качан алып келесиң", certainty: "high" },
  ];
  const t = fakeTransport(null, ({ bytes }) =>
    okResponse(reply({ heard }), bytes),
  );
  const r = await runReview(
    { ...parseArgs(["--input", input, "--context", ctx]), out: join(dir, "o") },
    { transport: t, log: quiet },
  );
  const byId = Object.fromEntries(
    r.script_comparison.lines.map((l) => [l.id, l]),
  );
  assert.equal(byId.in.status, "match");
  assert.equal(byId.out.status, "outside_range");
  assert.ok(!r.manual_check.some((m) => /реплика out/.test(m.what)));
});

test("сравнение: неразобранная реплика — unclear, а не «пропущена»", () => {
  const r = compareLines(
    [
      { id: "a", text: "Бир аздан кийин." },
      { id: "b", text: "Сен жей бер." },
    ],
    [{ index: 0, text: "Бир аздан кийин", certainty: "high" }],
  );
  assert.equal(r.lines[0].status, "match");
  assert.equal(r.lines[1].status, "unclear");
  assert.match(r.lines[1].reasons.join(), /не доказывает/);
  const r2 = compareLines(
    [{ id: "a", text: "Бир аздан кийин" }],
    [{ index: 0, text: "Бир [неразборчиво] кийин", certainty: "medium" }],
  );
  assert.equal(r2.lines[0].status, "unclear");
  const r3 = compareLines(
    [
      {
        id: "a",
        text: "Бир аздан кийин",
        boundary: true,
        boundary_reason: "реплика выходит за проверенный фрагмент",
      },
    ],
    [{ index: 0, text: "Бир аздан кийин", certainty: "high" }],
  );
  assert.equal(r3.lines[0].status, "unclear");
});

// ── 2. время ──
test("время модели: отрицательное, перевёрнутое и за фрагментом — невалидно, без обрезания", () => {
  const chunk = { index: 0, start: 40, end: 58, duration: 18 };
  for (const [a, b, why] of [
    [-2, 1, /отрицательное/],
    [5, 3, /раньше/],
    [17, 25, /пределами/],
    [null, null, /не указала/],
  ]) {
    const t = modelTime(chunk, a, b);
    assert.equal(t.valid, false);
    assert.match(t.invalid_reason, why);
    assert.equal(t.source_start, null);
    assert.equal(t.source_end, null);
  }
  const ok = modelTime(chunk, 3, 4.5);
  assert.equal(ok.valid, true);
  assert.equal(ok.source_start, 43);
  assert.equal(
    ok.verified,
    false,
    "время модели не становится проверенным после прибавления chunk.start",
  );
});

const analyzedChunk = (chunk, issues, heard = []) => ({
  chunk,
  status: "analyzed",
  parsed: { ok: true, data: { issues, heard_transcript: heard } },
  comparison: null,
});
const issue = (o) => ({
  t_end: o.t_start,
  heard_segment: null,
  confidence: "medium",
  severity: "minor",
  observation: "",
  likely_cause: "",
  fix: "",
  ...o,
});

test("замечания: две разные проблемы одной категории не склеиваются, край не удаляется", () => {
  const range = { start: 0, end: 38 };
  const [c0, c1] = planChunks(0, 38);
  const res = [
    analyzedChunk(c0, [
      issue({
        t_start: 5,
        category: "sfx_repetitive",
        observation: "шаги одинаковые",
      }),
      issue({
        t_start: 5.6,
        category: "sfx_repetitive",
        observation: "ключи звенят одинаково",
      }),
      issue({
        t_start: c0.duration - 0.2,
        category: "cut_phrase",
        observation: "фраза оборвана",
      }),
      issue({
        t_start: -3,
        t_end: -1,
        category: "noise",
        observation: "щелчок",
      }),
    ]),
    analyzedChunk(c1, [
      issue({
        t_start: 1.0,
        category: "cut_phrase",
        observation: "начало фразы",
      }),
    ]),
  ];
  const all = collectIssues(res, range);
  assert.equal(all.length, 5, "ни одно замечание не удалено и не склеено");
  assert.equal(all.filter((i) => i.category === "sfx_repetitive").length, 2);
  const edge = all.find((i) => i.observation === "фраза оборвана");
  assert.equal(edge.possible_boundary_artifact, true);
  // Перекрытие: возможный дубль только помечен.
  assert.ok(edge.possible_duplicates.length === 1);
  assert.equal(
    all.find((i) => i.observation === "начало фразы").chunk_index,
    1,
  );
  // Невалидное время — замечание остаётся, привязка — фрагмент.
  const neg = all.find((i) => i.category === "noise");
  assert.equal(neg.time.model_estimate.valid, false);
  assert.equal(neg.time.display_basis, "fragment");
  assert.deepEqual(
    [neg.time.fragment.start, neg.time.fragment.end],
    [c0.start, c0.end],
  );
  assert.match(
    neg.time.verified_narrower_note,
    /более узкой проверенной привязки нет/,
  );
});

test("привязка: проверенное размещение файла — только через сопоставленную реплику", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const heard = [
    {
      t_start: 0.1,
      t_end: 1.1,
      text: "Бүгүн балдарды качан алып келесиң?",
      certainty: "high",
    },
    { t_start: 2, t_end: 4, text: "Ортодо иштеп алам", certainty: "high" },
  ];
  const issues = [
    {
      heard_segment: 0,
      t_start: 0.5,
      t_end: 0.9,
      category: "word_ending",
      observation: "окончание",
      confidence: "medium",
      severity: "minor",
    },
    {
      heard_segment: null,
      t_start: 8,
      t_end: 9,
      category: "sfx_unnatural",
      observation: "щелчок",
      confidence: "low",
      severity: "minor",
    },
    {
      heard_segment: 1,
      t_start: 2.5,
      category: "pace",
      observation: "быстро",
      confidence: "low",
      severity: "minor",
    },
  ];
  const ctx = writeJson(dir, "ctx.json", {
    lines: [
      {
        id: "f01",
        text: "Бүгүн балдарды качан алып келесиң?",
        plan_at: 3.1,
        placement: {
          file: "f01.mp3",
          file_from: 3.1,
          file_to: 5.0,
          speech_from: 3.1,
          speech_to: 4.8,
        },
      },
      { id: "m01", text: "Ортодо иштеп алам.", plan_at: 6.2 },
    ],
  });
  const t = fakeTransport(null, ({ bytes }) =>
    okResponse(reply({ heard, issues }), bytes),
  );
  const r = await runReview(
    { ...parseArgs(["--input", input, "--context", ctx]), out: join(dir, "o") },
    { transport: t, log: quiet },
  );
  const [a, b, c] = r.model_assessment.issues;
  assert.equal(a.time.display_basis, "project_audio_placement");
  assert.deepEqual(
    [a.time.verified_narrower.start, a.time.verified_narrower.end],
    [3.1, 5],
  );
  assert.equal(
    a.time.model_estimate.source_start,
    0.5,
    "время модели сохранено отдельно",
  );
  assert.equal(b.time.display_basis, "fragment");
  assert.equal(b.time.verified_narrower, null);
  assert.equal(
    c.time.display_basis,
    "fragment",
    "плановое время сценария не считается проверенной привязкой",
  );
  assert.match(c.time.verified_narrower_note, /плановое время/);
  const md = readFileSync(join(dir, "o", "audio-review.md"), "utf8");
  assert.match(md, /Более узкая проверенная привязка/);
  assert.match(md, /не проверено/);
});

// ── 3. честные статусы ──
test("усечённый ответ (finish_reason: length) не complete и не кэшируется", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const out = join(dir, "out");
  const t1 = fakeTransport(null, ({ bytes }) =>
    okResponse(reply({ heard: [{ text: "Салам" }] }), bytes, "length"),
  );
  const r1 = await runReview(
    { ...parseArgs(["--input", input, "--auth", "claude_proxy"]), out },
    { transport: t1, log: quiet },
  );
  assert.equal(r1.status, "failed");
  assert.equal(r1.chunks[0].status, "truncated");
  assert.equal(r1.chunks[0].finish_reason, "length");
  assert.match(r1.chunks[0].incomplete_reason, /max_completion_tokens/);
  assert.ok(
    r1.chunks[0].partial_result,
    "частично разобранное сохранено для чтения",
  );
  assert.equal(r1.usage_this_run.total_tokens, 120, "usage учтён");
  assert.equal(r1.model_assessment.per_chunk.length, 0);
  const t2 = fakeTransport(null, ({ bytes }) => okResponse(reply(), bytes));
  await runReview(
    { ...parseArgs(["--input", input, "--auth", "claude_proxy"]), out },
    { transport: t2, log: quiet },
  );
  assert.equal(t2.calls.length, 1, "усечённый ответ не попал в кэш");
});

test("частичный отказ: partial, непроверенный диапазон виден, кэш экономит повтор", async () => {
  const dir = tmp();
  const input = makeWav(dir, 45);
  const out = join(dir, "out");
  const shas = chunkShas(dir, input, 0, 45);
  const opts = {
    ...parseArgs(["--input", input, "--auth", "claude_proxy"]),
    out,
  };
  const t1 = fakeTransport(shas, ({ idx, bytes }) =>
    idx === 1
      ? { status: 500, text: "oops", bytesSent: bytes, payloadBytes: bytes }
      : okResponse(
          reply({ issues: [issue({ t_start: 3, category: "pace" })] }),
          bytes,
        ),
  );
  const r1 = await runReview(opts, {
    transport: t1,
    log: quiet,
    sleep: noSleep,
  });
  assert.equal(r1.status, "partial");
  assert.equal(r1.audio_input_sent, true);
  assert.equal(r1.api_success, true);
  assert.deepEqual(
    r1.chunks.map((c) => c.status),
    ["analyzed", "api_error", "analyzed"],
  );
  assert.equal(
    r1.chunks[1].attempts.length,
    3,
    "временная ошибка повторена ограниченно",
  );
  assert.equal(r1.unchecked_ranges.length, 1);
  assert.equal(r1.coverage.chunks_analyzed, 2);
  const md = readFileSync(join(out, "audio-review.md"), "utf8");
  assert.match(md, /Не проверено моделью/);
  assert.match(md, /не оценка качества/);
  assert.doesNotMatch(md, /не назвала проблем/);
  assert.doesNotMatch(
    readFileSync(join(out, "raw", "chunk-01.request.json"), "utf8"),
    /UklGR/,
  );

  const t2 = fakeTransport(shas, ({ bytes }) => okResponse(reply(), bytes));
  const r2 = await runReview(opts, {
    transport: t2,
    log: quiet,
    sleep: noSleep,
  });
  assert.equal(t2.calls.length, 1);
  assert.equal(t2.calls[0].idx, 1);
  assert.equal(r2.status, "complete");
  assert.deepEqual(
    r2.chunks.map((c) => c.from_cache),
    [true, false, true],
  );
});

test("нехватка средств: failed, остальные фрагменты не отправляются", async () => {
  const dir = tmp();
  const input = makeWav(dir, 45);
  const out = join(dir, "out");
  const t = fakeTransport(null, ({ bytes }) => ({
    status: 429,
    text: JSON.stringify({
      error: {
        code: "insufficient_quota",
        message: "You exceeded your current quota",
      },
    }),
    bytesSent: bytes,
    payloadBytes: bytes,
  }));
  const r = await runReview(
    { ...parseArgs(["--input", input, "--auth", "claude_proxy"]), out },
    { transport: t, log: quiet, sleep: noSleep },
  );
  assert.equal(r.status, "failed");
  assert.equal(t.calls.length, 1);
  assert.equal(r.fatal_error.kind, "insufficient_quota");
  assert.deepEqual(
    r.chunks.map((c) => c.status),
    ["api_error", "skipped", "skipped"],
  );
  const md = readFileSync(join(out, "audio-review.md"), "utf8");
  assert.match(md, /Препятствие/);
  const cache = join(dir, ".audio-review-cache");
  assert.ok(
    !existsSync(cache) || readdirSync(cache).length === 0,
    "ошибки не кэшируются",
  );
});

test("пустой ответ и неразбираемый JSON не считаются проверкой", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  const out = join(dir, "out");
  const r1 = await runReview(
    { ...parseArgs(["--input", input, "--auth", "claude_proxy"]), out },
    {
      transport: fakeTransport(null, ({ bytes }) => okResponse("", bytes)),
      log: quiet,
    },
  );
  assert.equal(r1.status, "failed");
  assert.equal(r1.chunks[0].status, "empty_response");
  assert.equal(r1.api_success, false);
  const r2 = await runReview(
    { ...parseArgs(["--input", input, "--auth", "claude_proxy"]), out },
    {
      transport: fakeTransport(null, ({ bytes }) =>
        okResponse("Звук в целом хороший.", bytes),
      ),
      log: quiet,
    },
  );
  assert.equal(r2.chunks[0].status, "parse_error");
  assert.equal(r2.chunks[0].raw_text, "Звук в целом хороший.");
});

test("dry-run: измерения, ориентиры громкости и нарезка без обращений к API", async () => {
  const dir = tmp();
  const input = makeWav(dir, 45);
  const t = fakeTransport(null, () => assert.fail("API вызван в dry-run"));
  const r = await runReview(
    { ...parseArgs(["--input", input, "--dry-run"]), out: join(dir, "out") },
    { transport: t, log: quiet },
  );
  assert.equal(r.status, "dry_run");
  assert.equal(r.audio_input_sent, false);
  assert.equal(r.chunks.length, 3);
  assert.ok(Number.isFinite(r.measurements.range.integrated_lufs));
  assert.ok(Array.isArray(r.measurements.loudness_landmarks.marks));
  assert.match(r.measurements.loudness_landmarks.note, /не определяют текст/);
  assert.equal(r.chunks[0].wav_duration_sec, r.chunks[0].duration);
});

test("диапазон за концом файла отклоняется, длинный — обрезается до конца", async () => {
  const dir = tmp();
  const input = makeWav(dir, 12);
  await assert.rejects(
    runReview(
      {
        ...parseArgs(["--input", input, "--start", "30", "--dry-run"]),
        out: join(dir, "a"),
      },
      { log: quiet },
    ),
    /за пределами/,
  );
  const r = await runReview(
    {
      ...parseArgs([
        "--input",
        input,
        "--start",
        "4",
        "--duration",
        "60",
        "--dry-run",
      ]),
      out: join(dir, "b"),
    },
    { log: quiet },
  );
  assert.equal(r.range.end, 12);
  assert.equal(r.range.clamped_to_file_end, true);
});

// ── ошибки и повторы ──
test("классификация отказов: квота, 401/403, модель — без повторов", () => {
  const q = classifyFailure({
    status: 429,
    body: JSON.stringify({ error: { code: "insufficient_quota" } }),
  });
  assert.equal(q.kind, "insufficient_quota");
  assert.equal(q.retryable, false);
  const credits = classifyFailure({
    status: 429,
    body: JSON.stringify({
      error: {
        message: "You have no credits remaining.",
        type: "insufficient_quota",
        code: "credit_balance_exhausted",
      },
    }),
  });
  assert.equal(credits.kind, "insufficient_quota");
  assert.equal(classifyFailure({ status: 401, body: "{}" }).fatal, true);
  assert.equal(
    classifyFailure({ status: 403, body: "denied" }).kind,
    "forbidden",
  );
  assert.equal(
    classifyFailure({
      status: 404,
      body: JSON.stringify({ error: { code: "model_not_found" } }),
    }).kind,
    "model_unavailable",
  );
  assert.equal(
    classifyFailure({
      status: 429,
      body: JSON.stringify({ error: { code: "rate_limit_exceeded" } }),
    }).retryable,
    true,
  );
  assert.equal(classifyFailure({ status: 503, body: "" }).retryable, true);
  assert.equal(classifyFailure({ timedOut: true }).retryable, true);
  assert.equal(classifyFailure({ status: 400, body: "{}" }).retryable, false);
});

test("повторы ограничены и не применяются к нехватке средств", async () => {
  let n = 0;
  const flaky = async () =>
    ++n < 3
      ? { status: 500, text: "", bytesSent: 10, payloadBytes: 10 }
      : { status: 200, text: "{}", bytesSent: 10, payloadBytes: 10 };
  assert.equal(
    (
      await callWithRetry({
        transport: flaky,
        body: {},
        timeoutSec: 1,
        maxAttempts: 3,
        sleep: noSleep,
      })
    ).attempts.length,
    3,
  );
  let m = 0;
  const broke = async () => (
    m++,
    {
      status: 429,
      text: JSON.stringify({ error: { code: "insufficient_quota" } }),
      bytesSent: 10,
      payloadBytes: 10,
    }
  );
  assert.equal(
    (
      await callWithRetry({
        transport: broke,
        body: {},
        timeoutSec: 1,
        maxAttempts: 3,
        sleep: noSleep,
      })
    ).ok,
    false,
  );
  assert.equal(m, 1);
});

test("ключи и заголовки авторизации вычищаются из сообщений", () => {
  const s = redact(
    "Incorrect API key provided: sk-proj-abcdef123456. Authorization: Bearer abcdefghijkl",
  );
  assert.doesNotMatch(s, /abcdef123456|abcdefghijkl/);
});

test("ключ кэша зависит от аудио, модели, задания и параметров запроса", () => {
  const base = {
    audioSha: "a",
    model: "gpt-audio-1.5",
    prompt: "p",
    params: { max_completion_tokens: 100 },
  };
  const k = cacheKey(base);
  assert.equal(k, cacheKey({ ...base }));
  for (const d of [
    { audioSha: "b" },
    { model: "gpt-audio-2" },
    { prompt: "q" },
    { params: { max_completion_tokens: 200 } },
  ])
    assert.notEqual(k, cacheKey({ ...base, ...d }));
});

test("итоговый статус по фактическим результатам", () => {
  const c = (s) => ({ status: s });
  assert.equal(
    finalStatus({ dryRun: true, chunkResults: [c("analyzed")] }),
    "dry_run",
  );
  assert.equal(
    finalStatus({
      dryRun: false,
      chunkResults: [c("analyzed"), c("analyzed")],
    }),
    "complete",
  );
  assert.equal(
    finalStatus({
      dryRun: false,
      chunkResults: [c("analyzed"), c("truncated")],
    }),
    "partial",
  );
  assert.equal(
    finalStatus({
      dryRun: false,
      chunkResults: [c("parse_error"), c("empty_response")],
    }),
    "failed",
  );
});
