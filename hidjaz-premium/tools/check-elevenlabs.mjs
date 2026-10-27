// Проверка доступа к ElevenLabs без вывода ключа: тариф/остаток символов,
// модели и наличие готовых кыргызских голосов проекта. Результат — JSON без секретов.
// node hidjaz-premium/tools/check-elevenlabs.mjs <out.json>
import { writeFileSync } from "node:fs";

const key = process.env.ELEVENLABS_API_KEY?.trim();
const out = process.argv[2] ?? "elevenlabs-check.json";
const API = "https://api.elevenlabs.io";
const VOICES = {
  "KG-teacher": "EBOfpUWl9G5ltD2PkFgy",
  "KG-mother": "5Xx0r0RX4XWEq5vEdv8p",
  "KG-husband": "NVEGeFqcDqc5o29VoAQm",
  "KG-daughter": "AeboPz5CtE7qRUVvW93b",
};
const res = { checkedAt: new Date().toISOString(), keyPresent: Boolean(key) };
if (key) {
  const get = async (p) => {
    const r = await fetch(API + p, { headers: { "xi-api-key": key } });
    return { status: r.status, body: r.ok ? await r.json() : (await r.text()).slice(0, 200) };
  };
  const sub = await get("/v1/user/subscription");
  res.subscription = sub.status === 200
    ? { status: 200, tier: sub.body.tier, characterCount: sub.body.character_count, characterLimit: sub.body.character_limit, nextReset: sub.body.next_character_count_reset_unix }
    : { status: sub.status, error: sub.body };
  const models = await get("/v1/models");
  res.models = models.status === 200 ? models.body.map((m) => ({ id: m.model_id, ky: (m.languages ?? []).some((l) => l.language_id === "ky") })) : { status: models.status };
  res.voices = {};
  for (const [name, id] of Object.entries(VOICES)) {
    const v = await get(`/v1/voices/${id}`);
    res.voices[name] = v.status === 200 ? { id, ok: true, labels: v.body.labels, category: v.body.category } : { id, ok: false, status: v.status };
  }
}
writeFileSync(out, JSON.stringify(res, null, 2) + "\n");
console.log(JSON.stringify(res, null, 2));
