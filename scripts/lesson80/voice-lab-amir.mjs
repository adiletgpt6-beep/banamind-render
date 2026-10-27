// Подбор ровного голоса Амира (8 лет): выше Билала (~185 Гц), ниже Юсуфа (~300 Гц).
// Голоса × подача (без тега / [curious] / [cheerful]) на трёх репликах Амира.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const key = process.env.ELEVENLABS_API_KEY?.trim();
const OUT = "out/lesson80-voice-lab";
mkdirSync(OUT, { recursive: true });
const VOICES = { Charlotte: "XB0fDUnXU5powFXDhCwa", Laura: "FGY2WhTYpPnrIDTdsKH5", "KG-daughter": "AeboPz5CtE7qRUVvW93b", Aria: "9BWtsMINqrJLrRacOk9x", Jessica: "cgSgspJ2msm6clMCkdW9" };
const TAGS = { none: "", curious: "[curious] ", cheerful: "[cheerful] " };
const LINES = ["Давай посчитаем!", "Наверное, мы ещё многого не замечаем.", "Спасибо!", "Ты помог мне получить воду."];
const items = [];
for (const [vn, id] of Object.entries(VOICES)) {
  for (const [tn, tag] of Object.entries(TAGS)) {
    for (let i = 0; i < LINES.length; i++) {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}?output_format=mp3_44100_128`, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({ text: tag + LINES[i], model_id: "eleven_v3", language_code: "ru", seed: 320, voice_settings: { stability: 0.5, similarity_boost: 0.8 } }),
      });
      if (!res.ok) {
        console.warn(`✗ ${vn} ${tn} ${i}: ${res.status}`);
        continue;
      }
      const path = join(OUT, `amir__${vn}__${tn}__${i}.mp3`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      items.push({ path, text: LINES[i] });
    }
  }
}
writeFileSync(join(OUT, "score-in.json"), JSON.stringify(items));
console.log(`Образцов: ${items.length}`);
