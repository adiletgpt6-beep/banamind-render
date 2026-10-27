// Подбор голосов для Lesson80_1_14 (запуск в CI: нужен ELEVENLABS_API_KEY).
//
// Синтезирует контрольные русские фразы каждой роли разными голосами
// аккаунта и (если доступно) превью Voice Design, складывает образцы в
// out/lesson80-voice-lab/ и пишет lab.json: какие голоса есть в аккаунте,
// и какой файл каким голосом и текстом сделан. Разборчивость и высоту тона
// затем меряет scripts/lesson80/asr.py. Голоса в аккаунте НЕ создаются.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const API = "https://api.elevenlabs.io";
const key = process.env.ELEVENLABS_API_KEY?.trim();
if (!key) throw new Error("ELEVENLABS_API_KEY не задан");
const OUT = "out/lesson80-voice-lab";
mkdirSync(OUT, { recursive: true });
const H = { "xi-api-key": key, "Content-Type": "application/json" };

const list = await (await fetch(`${API}/v1/voices`, { headers: H })).json();
const voices = (list.voices ?? []).map((v) => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels, description: v.description }));
console.log(`Голосов в аккаунте: ${voices.length}`);
for (const v of voices) console.log(`  ${v.id} ${v.name} [${v.category}] ${JSON.stringify(v.labels)}`);

const TEXT = {
  teacher: "[calm] Да. В Коране говорится: если считать милости Аллаха, всех их не пересчитать.",
  child: "[curious] Вода такая обычная. А без неё хочется пить.",
  hamd: "[happy] Альхамдулилля́х — Хвала́ Алла́ху!",
};
const plain = (t) => t.replace(/\[[^\]]+\]\s*/g, "").normalize("NFD").replace(/́/g, "").normalize("NFC");

// Листинг голосов ключу недоступен — ID берутся из проекта (TS2_VOICES и
// голоса стандартной библиотеки, уже использованные в роликах).
const KNOWN = {
  "KG-husband": "NVEGeFqcDqc5o29VoAQm", "KG-son": "Oxj8oi9pAu19zqQOffmM", "KG-daughter": "AeboPz5CtE7qRUVvW93b",
  "KG-mother": "5Xx0r0RX4XWEq5vEdv8p", "KG-teacher": "EBOfpUWl9G5ltD2PkFgy",
  George: "JBFqnCBsd6RMkjVDRZzb", Daniel: "onwK4e9ZLuTAKqWW03F9", Brian: "nPczCjzI2devNBz1zQrb", Eric: "cjVigY5qzO86Huf0OWal",
  Chris: "iP95p4xoKVk53GoZ742B", Roger: "CwhRBWXzGAHq8TQ4Fs17", Bill: "pqHfZKP75CyOlxIrRRzK", Liam: "TX3LPaxmHKxFdv7VOQHJ",
  Will: "bIHbv24MWmeRgasZH58o", Callum: "N2lVS1w4EtoT3dr4eOWO", Charlie: "IKne3meq5aSn9XLyUdCD", River: "SAz9YHcvj6GT2YYXdXww",
  Lily: "pFZP5JQG7iQjIQuC4Bp3", Alice: "Xb7hH8MSUJpSbSDYk0k2", Jessica: "cgSgspJ2msm6clMCkdW9", Laura: "FGY2WhTYpPnrIDTdsKH5",
  Matilda: "XrExE9yKIg1WjnStdHDv", Charlotte: "XB0fDUnXU5powFXDhCwa", Aria: "9BWtsMINqrJLrRacOk9x", Sarah: "EXAVITQu4vr4xnSDxMaL",
};
const want = {
  teacher: ["KG-husband", "George", "Daniel", "Brian", "Eric", "Chris", "Roger", "Liam", "Will", "Callum", "Charlie"],
  child: ["KG-son", "KG-daughter", "KG-mother", "KG-teacher", "Lily", "Alice", "Jessica", "Laura", "Matilda", "Charlotte", "Aria", "Sarah", "River", "Will", "Liam", "Callum"],
};
const byName = new Map(Object.entries(KNOWN).map(([name, id]) => [name, { id, name }]));

const items = [];
const synth = async (voiceId, name, kind, text, model = "eleven_v3") => {
  const file = join(OUT, `${kind}__${name.replace(/[^\w-]+/g, "_")}__${model}.mp3`);
  const res = await fetch(`${API}/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      text: model === "eleven_v3" ? text : plain(text),
      model_id: model,
      language_code: "ru",
      seed: 140,
      voice_settings: { stability: 0.5, similarity_boost: 0.8 },
    }),
  });
  if (!res.ok) {
    console.warn(`✗ ${name} ${kind} ${model}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    return;
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  items.push({ path: file, text: plain(text), voiceId, name, kind, model });
  console.log(`✓ ${file}`);
};

for (const n of want.teacher) {
  const v = byName.get(n);
  if (v) await synth(v.id, n, "teacher", TEXT.teacher);
}
for (const n of want.child) {
  const v = byName.get(n);
  if (!v) continue;
  await synth(v.id, n, "child", TEXT.child);
  await synth(v.id, n, "hamd", TEXT.hamd);
  await synth(v.id, n, "child", TEXT.child, "eleven_multilingual_v2");
}

// Voice Design: только превью (голос в аккаунте не сохраняется).
const DESIGN = {
  yusuf: "A small 4-year-old boy speaking natural Russian. Soft, simple, curious and warm child voice, clear diction, no lisp, not squeaky, calm indoor recording.",
  amir: "An 8-year-old boy speaking natural Russian. Lively but collected child voice, friendly, clear diction, calm indoor recording.",
  bilal: "An 11-year-old boy speaking natural Russian. Slightly more mature child voice, calm and thoughtful, clear diction, not an adult announcer, calm indoor recording.",
  teacher: "A calm, kind Russian-speaking male teacher, about 32 years old. Warm, confident and gentle voice, clear Russian diction, unhurried, calm indoor recording.",
};
const designText = {
  yusuf: "Вода такая обычная. А без неё хочется пить. Альхамдулиллях! А сколько всего Аллах нам дал? Я подам чистый стакан. Спасибо, Мухаммад!",
  amir: "Давай посчитаем! Наверное, мы ещё многого не замечаем. Можно мне тоже воды? Ты помог мне получить воду. И замечать, за что благодарен.",
  bilal: "Я буду записывать. Люди, которые о нас заботятся. Уже семь примеров. Мы записали несколько примеров. Все дары на листе не перечислены.",
  teacher: "Мы часто привыкаем к тому, что нам помогает. Назовите один дар, который вы замечаете сейчас. Как вы считаете: можем ли мы перечислить все дары Аллаха?",
};
const designs = [];
for (const [role, description] of Object.entries(DESIGN).filter(([r]) => r === "teacher")) {
  for (const [ep, body] of [
    ["/v1/text-to-voice/design", { voice_description: description, model_id: "eleven_ttv_v3", text: designText[role], guidance_scale: 5, seed: 7 }],
    ["/v1/text-to-voice/create-previews", { voice_description: description, text: designText[role] }],
  ]) {
    const res = await fetch(`${API}${ep}`, { method: "POST", headers: H, body: JSON.stringify(body) });
    if (!res.ok) {
      console.warn(`✗ design ${role} ${ep}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      continue;
    }
    const data = await res.json();
    (data.previews ?? []).forEach((p, i) => {
      const file = join(OUT, `design__${role}__${ep.includes("design") ? "v3" : "v2"}_${i}.mp3`);
      writeFileSync(file, Buffer.from(p.audio_base_64, "base64"));
      items.push({ path: file, text: data.text ?? designText[role], name: `design-${role}-${i}`, kind: `design-${role}`, generatedVoiceId: p.generated_voice_id, endpoint: ep });
      designs.push({ role, endpoint: ep, i, generatedVoiceId: p.generated_voice_id, file });
      console.log(`✓ ${file}`);
    });
    break;
  }
}

writeFileSync(join(OUT, "lab.json"), JSON.stringify({ voices, items, designs }, null, 2));
writeFileSync(join(OUT, "score-in.json"), JSON.stringify(items.map(({ path, text }) => ({ path, text }))));
console.log(`Образцов: ${items.length}`);
