// AudioSyncSystem, шаг 1: русская дикторская озвучка (ElevenLabs).
//
// Каждая сцена озвучивается отдельным запросом /with-timestamps — так
// реплику можно точно поставить на начало сцены, а по посимвольным
// таймингам получить время каждого слова (надписи «ДЕНЬ»/«НОЧЬ», цитата).
//
// Выбор голоса: голоса аккаунта с русским акцентом/языком (мужские),
// затем preferredVoices из voice.json. Первая реплика каждым кандидатом →
// распознавание речи (faster-whisper small, локально) → доля ошибочных символов
// (CER). Берётся кандидат с наименьшим CER. Затем по `takes` дублей на
// сцену, лучший дубль по CER.
//
// Обработка: обрезка тишины по краям, громкость −16 LUFS, пик ≤ −1.5 дБTP.
// Результат: public/audio/voice/<id>.mp3 + public/audio/voice/manifest.json.
// Уже готовые файлы (совпадает хеш текста/голоса) не синтезируются заново.
//
// Нужна переменная ELEVENLABS_API_KEY. Необязательно: MK_VOICE_ID.
// Запуск: node scripts/generate-voice.mjs
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const CFG = JSON.parse(readFileSync(join(ROOT, "voice.json"), "utf8"));
const OUT = join(ROOT, "public/audio/voice");
const MANIFEST = join(OUT, "manifest.json");
const TMP = join(tmpdir(), "mk-geometry-voice");
const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) throw new Error("Нет ELEVENLABS_API_KEY — озвучка невозможна.");
mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const old = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : null;

async function api(path, init = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(API + path, {
      ...init,
      headers: { "xi-api-key": key, ...(init.headers ?? {}) },
    });
    if (res.ok) return res;
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 3000 * attempt));
      continue;
    }
    const err = new Error(`${path}: HTTP ${res.status} ${body.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
}

const norm = (s) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я]+/g, "");

function cer(ref, hyp) {
  const a = norm(ref);
  const b = norm(hyp);
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length] / Math.max(1, a.length);
}

async function tts(voiceId, text, seed, modelId) {
  const res = await api(`/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_192`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: modelId,
      language_code: CFG.language,
      seed,
      voice_settings: CFG.voiceSettings,
      apply_text_normalization: "auto",
    }),
  });
  const json = await res.json();
  return {
    audio: Buffer.from(json.audio_base64, "base64"),
    alignment: json.normalized_alignment ?? json.alignment,
  };
}

// Speech-to-Text ElevenLabs ключу недоступен — локально faster-whisper.
// Файлы распознаются пачкой (модель грузится один раз).
function sttMany(files) {
  const out = execFileSync("python3", [join(ROOT, "scripts/asr_ru.py"), ...files], { maxBuffer: 1 << 24 });
  return JSON.parse(out.toString().trim().split("\n").pop());
}

const ff = (args) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
const probeDur = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// Начало/конец речи по порогу −45 дБ (silencedetect).
function speechBounds(file) {
  let out = "";
  try {
    out = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${file}" -af silencedetect=n=-45dB:d=0.12 -f null - 2>&1`]).toString();
  } catch (e) {
    out = String(e.stdout ?? "");
  }
  const dur = probeDur(file);
  const starts = [...out.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const ends = [...out.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  let head = 0;
  if (starts.length && starts[0] < 0.05 && ends.length) head = ends[0];
  let tail = dur;
  const lastStart = starts[starts.length - 1];
  if (lastStart !== undefined && (ends.length < starts.length || ends[ends.length - 1] >= dur - 0.05)) tail = lastStart;
  return { head: Math.max(0, head - 0.06), tail: Math.min(dur, tail + 0.18), dur };
}

function words(alignment, offset) {
  const chars = alignment.characters;
  const st = alignment.character_start_times_seconds;
  const en = alignment.character_end_times_seconds;
  const list = [];
  let cur = null;
  for (let i = 0; i < chars.length; i++) {
    const isWord = /[\p{L}\p{N}-]/u.test(chars[i]) && chars[i] !== "—";
    if (isWord) {
      if (!cur) cur = { w: "", s: st[i], e: en[i] };
      cur.w += chars[i];
      cur.e = en[i];
    } else if (cur) {
      list.push(cur);
      cur = null;
    }
  }
  if (cur) list.push(cur);
  return list.map((x) => ({ w: x.w, s: +(x.s - offset).toFixed(3), e: +(x.e - offset).toFixed(3) }));
}

async function candidates() {
  if (process.env.MK_VOICE_ID) return [{ name: "MK_VOICE_ID", id: process.env.MK_VOICE_ID.trim() }];
  const list = [];
  try {
    const res = await api("/v1/voices");
    const { voices } = await res.json();
    console.log("Голоса аккаунта:");
    for (const v of voices) {
      const l = v.labels ?? {};
      console.log(`  ${v.name} ${v.voice_id} ${v.category} ${JSON.stringify(l)}`);
      const ru = /russian|ru\b/i.test(`${l.accent ?? ""} ${l.language ?? ""} ${v.name}`);
      if (ru && /male/i.test(l.gender ?? "") && !/female/i.test(l.gender ?? "")) list.push({ name: v.name, id: v.voice_id });
    }
  } catch (e) {
    console.warn("Список голосов недоступен:", e.message);
  }
  return [...list.slice(0, 2), ...CFG.preferredVoices];
}

const sha = (o) => createHash("sha1").update(JSON.stringify(o)).digest("hex").slice(0, 12);

async function main() {
  let modelId = CFG.modelId;
  let voice = old?.voice;
  const reuse = (clip) =>
    old && voice && old.voice?.id === voice.id &&
    old.clips.find((c) => c.id === clip.id && c.hash === sha({ t: clip.text, v: voice.id, m: old.modelId, s: CFG.voiceSettings })) &&
    existsSync(join(OUT, `${clip.id}.mp3`));

  if (old && CFG.clips.every((c) => reuse(c))) {
    console.log("Озвучка актуальна — повторный синтез не нужен.");
    return;
  }
  if (!voice || process.env.MK_VOICE_ID) {
    const probe = CFG.clips[0].text;
    const probes = [];
    for (const c of await candidates()) {
      try {
        const r = await tts(c.id, probe, CFG.seed, modelId).catch(async (e) => {
          if (e.status === 400 || e.status === 422) {
            modelId = CFG.fallbackModelId;
            return tts(c.id, probe, CFG.seed, modelId);
          }
          throw e;
        });
        const f = join(TMP, `probe-${c.id}.mp3`);
        writeFileSync(f, r.audio);
        probes.push({ ...c, f });
      } catch (e) {
        console.warn(`Кандидат ${c.name} недоступен: ${e.message}`);
      }
    }
    const heardAll = sttMany(probes.map((p) => p.f));
    let best = null;
    for (const c of probes) {
      const score = cer(probe, heardAll[c.f]);
      console.log(`Кандидат ${c.name}: CER ${(score * 100).toFixed(1)}% — «${heardAll[c.f]}»`);
      if (!best || score < best.score - 0.005) best = { ...c, score };
    }
    if (!best) throw new Error("Ни один голос не доступен.");
    voice = { name: best.name, id: best.id };
  }
  console.log(`Голос: ${voice.name} (${voice.id}), модель ${modelId}`);

  const clips = [];
  for (const clip of CFG.clips) {
    const hash = sha({ t: clip.text, v: voice.id, m: modelId, s: CFG.voiceSettings });
    const prev = old?.clips.find((c) => c.id === clip.id && c.hash === hash);
    if (prev && existsSync(join(OUT, `${clip.id}.mp3`))) {
      clips.push({ ...prev, start: clip.start, text: clip.text });
      continue;
    }
    const takes = [];
    for (let t = 0; t < CFG.takes; t++) {
      const r = await tts(voice.id, clip.text, CFG.seed + t * 17, modelId);
      const raw = join(TMP, `${clip.id}-${t}.mp3`);
      writeFileSync(raw, r.audio);
      takes.push({ raw, alignment: r.alignment });
    }
    const heard = sttMany(takes.map((t) => t.raw));
    let best = null;
    takes.forEach((t, i) => {
      const score = cer(clip.text, heard[t.raw]);
      console.log(`  ${clip.id} дубль ${i + 1}: CER ${(score * 100).toFixed(1)}% — «${heard[t.raw]}»`);
      if (!best || score < best.score) best = { ...t, score, heard: heard[t.raw] };
    });
    const b = speechBounds(best.raw);
    const out = join(OUT, `${clip.id}.mp3`);
    ff(["-i", best.raw, "-ss", b.head.toFixed(3), "-to", b.tail.toFixed(3),
      "-af", "afade=t=in:d=0.02,loudnorm=I=-16:TP=-1.5:LRA=9,aresample=48000",
      "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", out]);
    const duration = probeDur(out);
    clips.push({
      id: clip.id, text: clip.text, start: clip.start, hash, duration: +duration.toFixed(3),
      cer: +best.score.toFixed(4), heard: best.heard, words: words(best.alignment, b.head),
    });
    console.log(`  → ${clip.id}.mp3 ${duration.toFixed(2)} с`);
  }
  // Проверка: реплики не перекрываются и помещаются в 60 с.
  for (let i = 0; i < clips.length; i++) {
    const end = clips[i].start + clips[i].duration;
    const next = clips[i + 1]?.start ?? 59.2;
    console.log(`${clips[i].id}: ${clips[i].start.toFixed(2)}–${end.toFixed(2)} с (запас ${(next - end).toFixed(2)} с)`);
  }
  writeFileSync(MANIFEST, JSON.stringify({ voice, modelId, generatedAt: new Date().toISOString(), clips }, null, 2) + "\n");
  console.log("manifest.json записан.");
}

await main();
