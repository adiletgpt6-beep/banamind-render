// Подбор русского голоса ведущего: несколько кандидатов (носители русского из
// библиотеки ElevenLabs + Eric для сравнения) синтезируют одну и ту же фразу;
// затем scripts/finance/voice_probe_ru.py оценивает разборчивость Whisper.
// Результат — voice-samples/finance-ru/ (образцы и probe.json), выбор голоса
// фиксируется в src/finance/episode/script.ru.ts (VOICE_RU).
// Запуск: ELEVENLABS_API_KEY=… node scripts/finance/voice_probe_ru.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) throw new Error("ELEVENLABS_API_KEY не задан");
const OUT = "voice-samples/finance-ru";
mkdirSync(OUT, { recursive: true });
const TEXT =
  "Вы зарабатываете деньги каждый месяц. Почему же кажется, что каждый раз вы начинаете с нуля? Алекс получает на руки четыре тысячи долларов, а тратит три тысячи двести.";
const H = { "xi-api-key": key, "Content-Type": "application/json" };

const candidates = [{ name: "Eric (premade)", voiceId: "cjVigY5qzO86Huf0OWal", source: "premade" }];
const res = await fetch(`${API}/v1/shared-voices?page_size=40&language=ru&gender=male&sort=usage_character_count_1y`, { headers: H });
const listing = res.ok ? await res.json() : { voices: [], error: `${res.status} ${(await res.text()).slice(0, 200)}` };
console.log(`shared-voices: ${res.status}; найдено ${listing.voices?.length ?? 0}`);
const pick = (listing.voices ?? [])
  .filter((v) => /narrat|inform|educat|conversation|advert/i.test(`${v.use_case} ${v.descriptive} ${v.description}`) && !/old|child|kid/i.test(`${v.age}`))
  .slice(0, 6);
for (const v of pick) {
  console.log(`• ${v.name} [${v.voice_id}] ${v.accent ?? ""} ${v.age ?? ""} ${v.use_case ?? ""} ${v.descriptive ?? ""}`);
  // общий голос нужно добавить в библиотеку аккаунта, чтобы синтезировать им
  const add = await fetch(`${API}/v1/voices/add/${v.public_owner_id}/${v.voice_id}`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ new_name: `finance-ru ${v.name}`.slice(0, 40) }),
  });
  const added = add.ok ? await add.json() : null;
  console.log(`  add: ${add.status} ${added ? "" : (await add.text()).slice(0, 160)}`);
  candidates.push({ name: v.name, voiceId: added?.voice_id ?? v.voice_id, source: "shared", meta: { accent: v.accent, age: v.age, use_case: v.use_case, descriptive: v.descriptive, description: v.description?.slice(0, 200) } });
}
const results = [];
for (const c of candidates) {
  for (const model of ["eleven_multilingual_v2", "eleven_v3"]) {
    const body = { text: TEXT, model_id: model, seed: 7, voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.1 }, ...(model === "eleven_v3" ? { language_code: "ru" } : {}) };
    const r = await fetch(`${API}/v1/text-to-speech/${c.voiceId}?output_format=mp3_44100_128`, { method: "POST", headers: H, body: JSON.stringify(body) });
    const file = `${c.voiceId}-${model}.mp3`;
    if (!r.ok) {
      console.log(`✗ ${c.name} ${model}: ${r.status} ${(await r.text()).slice(0, 160)}`);
      continue;
    }
    writeFileSync(join(OUT, file), Buffer.from(await r.arrayBuffer()));
    results.push({ ...c, model, file });
    console.log(`✓ ${c.name} ${model}`);
  }
}
writeFileSync(join(OUT, "probe.json"), JSON.stringify({ text: TEXT, listingError: listing.error ?? null, results }, null, 1) + "\n");
