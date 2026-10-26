// Пробы голосов Lesson80_1_5: для каждой роли — короткая реплика каждым
// кандидатом; замеряются высота голоса (медиана F0), длительность, пик.
// Результат — voice-samples/lesson-80-1-5/<provider>/<role>-<voice>.mp3 и
// report.json. Запуск: node scripts/l815-voice-lab.mjs [openai|local]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { L815_ELEVEN_VOICES, L815_OPENAI_VOICES } from "../src/lesson-80-1-5/voices.ts";
import { ProviderUnavailable, synthLine, voiceKey } from "./lib/l815-tts.mjs";

const provider = process.argv[2] ?? "local";
const OUT = join("voice-samples", "lesson-80-1-5", provider);
mkdirSync(OUT, { recursive: true });

const PROBES = {
  teacher: { id: "probe-teacher", role: "teacher", text: "Ребята, из чего Амир сделал лодочку? Верно. Ты изменил форму листа." },
  yusuf: { id: "probe-yusuf", role: "yusuf", text: "Подожди… Ты говорил, что всё создал Аллах. А лодочку сделал Амир!" },
  amir: { id: "probe-amir", role: "amir", text: "Я сам её сложил. Смотри, даже складки видны." },
  bilal: { id: "probe-bilal", role: "bilal", text: "Получается, надо понять, что сделал Амир, а откуда взялась бумага." },
};

const RH = (voice) => ({ provider: "rhvoice", voice });
const candidates =
  provider === "openai"
    ? Object.fromEntries(
        Object.entries(L815_OPENAI_VOICES).map(([role, v]) => [
          role,
          (role === "teacher" ? ["onyx", "ash", "echo", "cedar", "verse"] : ["coral", "sage", "shimmer", "nova", "fable", "alloy", "ballad"]).map((voice) => ({ ...v, voice })),
        ]),
      )
    : provider === "elevenlabs"
      ? Object.fromEntries(
          Object.entries(L815_ELEVEN_VOICES).map(([role, v]) => [role, Object.values(L815_ELEVEN_VOICES).map((o) => ({ ...v, name: o.name, voiceId: o.voiceId }))]),
        )
      : {
        teacher: ["aleksandr-hq", "aleksandr", "pavel", "yuriy", "mikhail", "vitaliy", "evgeniy-rus"].map(RH),
        yusuf: [{ provider: "piper", model: "ru-irinia-medium" }, ...["arina", "anna", "elena", "tatiana", "victoria", "irina"].map(RH)],
        amir: [{ provider: "piper", model: "ru-irinia-medium" }, ...["arina", "anna", "elena", "tatiana", "victoria", "irina"].map(RH)],
        bilal: ["artemiy", "evgeniy-rus", "yuriy", "vitaliy", "pavel"].map(RH),
      };

const report = [];
for (const [role, list] of Object.entries(candidates)) {
  for (const v of list) {
    const key = voiceKey(v).replace(/[:/]/g, "-");
    const out = join(OUT, `${role}-${key}.mp3`);
    try {
      const r = await synthLine(PROBES[role], v, out, `-${key}`);
      const speech = r.speechEnd - r.speechStart;
      report.push({ role, voice: voiceKey(v), file: out, f0: r.f0, speechSec: Number(speech.toFixed(2)), charsPerSec: Number(([...PROBES[role].text].filter((c) => /\p{L}/u.test(c)).length / speech).toFixed(1)), peakDb: r.peakDb });
      console.log(`✓ ${role} ${voiceKey(v)}: F0 ${r.f0} Гц, речь ${speech.toFixed(2)} с, пик ${r.peakDb} дБFS`);
    } catch (e) {
      const msg = e instanceof ProviderUnavailable ? `недоступен: ${e.message}` : e.message;
      console.warn(`✗ ${role} ${voiceKey(v)}: ${msg}`);
      report.push({ role, voice: voiceKey(v), error: msg });
    }
  }
}
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Отчёт: ${join(OUT, "report.json")}`);
