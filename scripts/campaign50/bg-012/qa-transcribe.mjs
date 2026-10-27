// Дополнительная автоматическая проверка звука готового MP4 BG-012:
// распознавание всей дорожки (OpenAI gpt-4o-transcribe, язык ky) и поиск
// обязательных слов: Бишкек, профиль/шилтеме, WhatsApp, номер, «сиз».
// Не заменяет прослушивание носителем языка.
//   node scripts/campaign50/bg-012/qa-transcribe.mjs out/balago-bg-012.mp4
// Нужен доступ к api.openai.com (OPENAI_API_KEY или прокси с ключом).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const file = process.argv[2];
const mp3 = join(tmpdir(), "bg012-qa.mp3");
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", file, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", mp3]);
const fd = new FormData();
fd.append("file", new Blob([readFileSync(mp3)], { type: "audio/mpeg" }), "bg012.mp3");
fd.append("model", "gpt-4o-transcribe");
fd.append("language", "ky");
const headers = process.env.OPENAI_API_KEY ? { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } : {};
const res = await fetch("https://api.openai.com/v1/audio/transcriptions", { method: "POST", headers, body: fd });
if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
const text = (await res.json()).text;
console.log(text);
const low = text.toLowerCase();
const checks = [
  ["Бишкек", /бишкек/],
  ["профилдеги шилтеме", /профил|шилтеме/],
  ["WhatsApp", /ватсап|whatsapp|вотсап|уотсап/],
  ["номер 0998 08 38 28", /0998|998|тогуз жүз токсон сегиз/],
  ["«сиз» сына", /сиз/],
  ["BalaGo менен жолго чыгалы", /жолго чыгалы/],
];
let bad = 0;
for (const [name, re] of checks) {
  const ok = re.test(low);
  if (!ok) bad++;
  console.log(`${ok ? "✓" : "✗"} ${name}`);
}
process.exit(bad ? 1 : 0);
