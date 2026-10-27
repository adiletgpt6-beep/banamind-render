// Подбор голоса сына (Бектур, ≈ 9 лет) для BalaGoNineYearOldEmployee2D.
//
// Прежний KG-son (Oxj8oi9pAu19zqQOffmM) не берётся автоматически: он создан
// из описания молодой женщины, профиль голоса и прослушивание дают взрослую
// женщину. Детские и «мальчишеские» описания Voice Design сервис блокирует
// (раунды №20) — такие запросы не повторяются и фильтр не обходится.
// Здесь пробуются только описания ВЗРОСЛЫХ голосов, которыми в анимации
// обычно озвучивают мальчиков (низкий простой альт без «женской» мягкости),
// и ремикс KG-son в сторону более низкого, простого и энергичного тембра.
//
// Этап 1 (нет son-pick.json): Voice Design / Remix → превью читают реплики
//   S01–S04 → MP3 + оценка scripts/ny2d_asr.py (CER, F0, профиль) →
//   voice-samples/nine-year-old-employee-2d/son-probe/report.json.
//   Превью затем слушаются (слепое прослушивание, docs/nine-year-old-son-voice.md).
// Этап 2 (son-pick.json с generatedVoiceId выбранного превью): создаётся
//   голос аккаунта, его voice_id записывается в report.json (picked).
// Повторно не запускается при той же конфигурации (хэш).
// Нужен ELEVENLABS_API_KEY (секрет GitHub). Ключ не печатается.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голоса сына пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
const OUT = "voice-samples/nine-year-old-employee-2d/son-probe";
mkdirSync(OUT, { recursive: true });
const REPORT = join(OUT, "report.json");
const PICK = join(OUT, "son-pick.json");
const readJson = (p, d) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : d);
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");

// Текст проб — реплики сына из сценария (S01–S04).
const TEXT =
  "Жок. Болгону эртерээк кетким келет. Досторум дүйшөмбүдө кеме жасай башташкан. Кечээ капитандын бөлмөсүн бүтүрүшүптүр. Мен да жардам бергим келген. Кечээ бейджимди көрсөтүп, жардамчымсың дедиң. Мен бул жерде болсом, сен кубанасың деп ойлогом. Мен да жардам берем!";
const STUDIO = "Clear close-mic studio recording, no background noise, natural conversational pace, not theatrical.";
const KG = "A native speaker of the Kyrgyz language with an authentic Kyrgyz accent.";
const DESIGNS = [
  { id: "a1", description: `A young Kyrgyz woman with a low, slightly husky alto voice. ${KG} Short, plain sentences; earnest, simple and a little shy; no breathiness, no sultry or soft feminine tone. ${STUDIO}` },
  { id: "a2", description: `A Kyrgyz voice actress with a light, slightly raspy mezzo voice who voices lively cartoon characters. ${KG} Plain, direct and energetic delivery, simple everyday words, no singing quality. ${STUDIO}` },
  { id: "a3", description: `A sporty young Kyrgyz woman with a clear, slightly nasal, low-medium voice. ${KG} Matter-of-fact and lively, quick simple speech, not soft, not flirty, not motherly. ${STUDIO}` },
];
const REMIX = {
  base: { name: "KG-son", voiceId: "Oxj8oi9pAu19zqQOffmM" },
  description: "Make the voice lower and a bit rougher, plainer and more energetic; less soft, less mature and less feminine. Keep the native Kyrgyz accent and clear diction.",
};

const pick = readJson(PICK, null);
const config = { v: 1, TEXT, DESIGNS, REMIX, pick: pick?.generatedVoiceId ?? null };
const hash = createHash("sha1").update(JSON.stringify(config)).digest("hex").slice(0, 16);
const prev = readJson(REPORT, null);
if (prev?.hash === hash && prev.done) {
  console.log("= пробы голоса сына уже сделаны (report.json)");
  process.exit(0);
}

const call = async (method, path, body) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "xi-api-key": apiKey, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path.split("?")[0]}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
};

// Этап 2: выбранное превью → голос аккаунта.
if (pick?.generatedVoiceId && prev?.previews?.length) {
  const p = prev.previews.find((x) => x.generatedVoiceId === pick.generatedVoiceId);
  if (!p) throw new Error("son-pick.json: превью не найдено в report.json");
  if (prev.picked?.generatedVoiceId !== pick.generatedVoiceId) {
    const r = await call("POST", "/v1/text-to-voice", { voice_name: `KG-boy ${p.file.replace(".mp3", "")}`, voice_description: p.description, generated_voice_id: p.generatedVoiceId });
    prev.picked = { generatedVoiceId: p.generatedVoiceId, voiceId: r.voice_id, name: `KG-boy ${p.file.replace(".mp3", "")}`, file: p.file, reason: pick.reason ?? "" };
    console.log(`✓ голос сына создан: ${r.voice_id} (${p.file})`);
  }
  prev.hash = hash;
  prev.done = true;
  writeJson(REPORT, prev);
  process.exit(0);
}

// Этап 1: превью.
const report = { hash, done: false, text: TEXT, previews: [], errors: [] };
const keep = (id, description, data, source) => {
  for (const [i, p] of (data.previews ?? []).entries()) {
    const file = `${id}-${i + 1}.mp3`;
    writeFileSync(join(OUT, file), Buffer.from(p.audio_base_64, "base64"));
    report.previews.push({ file, design: id, source, description, generatedVoiceId: p.generated_voice_id });
  }
  console.log(`✓ ${id}: ${(data.previews ?? []).length} превью`);
};
for (const d of DESIGNS) {
  try {
    keep(d.id, d.description, await call("POST", "/v1/text-to-voice/design", { voice_description: d.description, model_id: "eleven_ttv_v3", text: TEXT, auto_generate_text: false }), "design");
  } catch (e) {
    report.errors.push({ id: d.id, error: e.message });
    console.warn(`  ⚠ ${d.id}: ${e.message}`);
  }
}
try {
  keep("remix", REMIX.description, await call("POST", `/v1/text-to-voice/${REMIX.base.voiceId}/remix`, { voice_description: REMIX.description, text: TEXT, auto_generate_text: false }), "remix");
} catch (e) {
  report.errors.push({ id: "remix", error: e.message });
  console.warn(`  ⚠ remix: ${e.message}`);
}
// оценка: CER (MMS), F0, профиль — технический замер, не прослушивание
if (report.previews.length) {
  const inp = join(OUT, "score-in.json");
  const out = join(OUT, "score-out.json");
  writeJson(inp, report.previews.map((p) => ({ path: join(OUT, p.file), text: TEXT })));
  try {
    execFileSync("python3", ["scripts/ny2d_asr.py", "--score", inp, out], { stdio: "inherit" });
    const m = new Map(JSON.parse(readFileSync(out, "utf8")).map((r) => [r.path, r]));
    for (const p of report.previews) {
      const r = m.get(join(OUT, p.file));
      Object.assign(p, { cer: r?.cer ?? null, f0: r?.f0 ?? null, profile: r?.profile ?? null, heard: r?.heard ?? null });
    }
  } catch (e) {
    console.warn(`  ⚠ оценка недоступна: ${e.message.split("\n")[0]}`);
  }
}
report.done = true;
writeJson(REPORT, report);
for (const p of report.previews) console.log(`  ${p.file}: CER ${p.cer}, F0 ${p.f0}, ${JSON.stringify(p.profile)}`);
