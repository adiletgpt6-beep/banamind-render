// Пробы голосов ролика BalaGoNoBackup до основной озвучки:
//  1) мама, папа, дочка — по одной фразе каждым кандидатом;
//  2) бабушка — Voice Design (тёплый голос пожилой женщины; если сервис
//     разрешает) и запасные стандартные голоса;
//  3) все пробы собираются в один небольшой файл probes.mp4 с подписью
//     голоса на экране (для прослушивания).
// Результат: voice-samples/no-backup/ (сохраняется в Git). Повторно не
// запускается, если тексты и кандидаты не изменились. Ключ не печатается.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { NB_PROBES, NB_TTS, NB_VOICES } from "../src/no-backup/script.ts";
import { ffmpeg } from "./lib/audio.mjs";

const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
const OUT = "voice-samples/no-backup";
const reportPath = join(OUT, "report.json");
const cfgHash = createHash("sha1")
  .update(JSON.stringify({ NB_PROBES, NB_TTS, v: { m: NB_VOICES.mother, f: NB_VOICES.father, d: NB_VOICES.daughter, g: NB_VOICES.grandma }, r: 1 }))
  .digest("hex")
  .slice(0, 16);
if (existsSync(reportPath) && JSON.parse(readFileSync(reportPath, "utf8")).cfgHash === cfgHash) {
  console.log("= пробы уже есть, повторно не создаются");
  process.exit(0);
}
if (!apiKey) {
  console.log("ELEVENLABS_API_KEY не задан — пробы голосов пропущены.");
  process.exit(0);
}
const API = process.env.ELEVENLABS_API_BASE?.trim() || "https://api.elevenlabs.io";
mkdirSync(OUT, { recursive: true });

const api = async (path, init = {}) => {
  const res = await fetch(`${API}${path}`, { ...init, headers: { "xi-api-key": apiKey, ...(init.headers ?? {}) } });
  const text = res.ok ? null : (await res.text()).slice(0, 400);
  return { res, text };
};
const report = { cfgHash, design: null, samples: [] };

// 1. Voice Design: бабушка
{
  const { res, text } = await api("/v1/text-to-voice/design", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voice_description: NB_PROBES.grandmaDesign,
      text: NB_PROBES.grandmaDesignText,
      model_id: "eleven_ttv_v3",
      loudness: 0.5,
      guidance_scale: 5,
      seed: 21,
    }),
  });
  if (res.ok) {
    const prev = (await res.json()).previews ?? [];
    report.design = { ok: true, previews: prev.length };
    const p = prev[0];
    if (p) {
      const c = await api("/v1/text-to-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice_name: "BalaGo grandma", voice_description: NB_PROBES.grandmaDesign, generated_voice_id: p.generated_voice_id }),
      });
      if (c.res.ok) {
        const v = await c.res.json();
        report.design.voice = { name: "Designed grandma", voiceId: v.voice_id };
      } else report.design.createError = `${c.res.status} ${c.text}`;
    }
    console.log(`Voice Design: превью ${prev.length}, голос ${report.design.voice ? "создан" : "не сохранён"}`);
  } else {
    report.design = { ok: false, error: `${res.status} ${text}` };
    console.log("Voice Design недоступен:", res.status);
  }
}

// 2. Пробы
const synth = async (role, label, voice, text) => {
  const file = `${role}-${voice.name.replace(/\s+/g, "")}.mp3`;
  const { res, text: err } = await api(`/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: NB_TTS.modelId, language_code: NB_TTS.languageCode, seed: NB_TTS.seed, voice_settings: NB_TTS.voiceSettings }),
  });
  if (!res.ok) {
    report.samples.push({ role, voice: voice.name, voiceId: voice.voiceId, text, error: `${res.status} ${err}` });
    console.log(`  ✗ ${role} ${voice.name}: ${res.status}`);
    return;
  }
  writeFileSync(join(OUT, file), Buffer.from(await res.arrayBuffer()));
  report.samples.push({ role, label, voice: voice.name, voiceId: voice.voiceId, text, file });
  console.log(`  ✓ ${file}`);
};
const roles = [
  ["mother", "Мама", NB_PROBES.mother],
  ["father", "Папа", NB_PROBES.father],
  ["daughter", "Дочка", NB_PROBES.daughter],
  ["grandma", "Бабушка", NB_PROBES.grandma],
];
for (const [role, label, text] of roles) {
  const list = [...(role === "grandma" && report.design?.voice ? [report.design.voice] : []), ...NB_VOICES[role].candidates];
  for (const v of list) await synth(role, label, v, text);
}

// 3. Один файл с подписями: синий экран «Роль — голос» + звук пробы.
const font = "public/fonts/Nunito-Variable.ttf";
const parts = [];
for (const [i, s] of report.samples.filter((x) => x.file).entries()) {
  const seg = join(OUT, `.seg${i}.mp4`);
  const label = `${i + 1}. ${s.label} — ${s.voice}`.replace(/:/g, "\\:");
  ffmpeg([
    "-f", "lavfi", "-i", "color=c=0x14285A:s=720x400:r=25",
    "-i", join(OUT, s.file),
    "-af", "apad=pad_dur=0.7",
    "-vf", `drawtext=fontfile=${font}:text='${label}':fontcolor=white:fontsize=46:x=(w-tw)/2:y=(h-th)/2-30,drawtext=fontfile=${font}:text='${s.voiceId}':fontcolor=0xFFC90E:fontsize=24:x=(w-tw)/2:y=h/2+50`,
    "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "1", seg,
  ]);
  parts.push(seg);
}
if (parts.length) {
  const list = join(OUT, ".concat.txt");
  writeFileSync(list, parts.map((p) => `file '${p.split("/").pop()}'`).join("\n") + "\n");
  ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", join(OUT, "probes.mp4")]);
  for (const p of [...parts, list]) rmSync(p, { force: true });
  report.file = "probes.mp4";
}
writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(`+ ${reportPath}`);
