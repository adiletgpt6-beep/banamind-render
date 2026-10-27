// Контекст для audio:review ролика №12 (BalaGoTwoSchedules2D).
//
// Для каждой реплики сохраняет:
//   plan_at   — плановое время из script.ts (только порядок/выбор реплик);
//   placement — где композиция реально ставит файл голоса: тот же расчёт,
//               что в Ts2Audio (buildTs2Cues по манифесту + округление до
//               кадра), и проверка самого файла (есть, SHA-256, длительность
//               по ffprobe совпадает с манифестом).
// Текст реплик нужен только для ЛОКАЛЬНОГО сравнения: анализатор не
// передаёт его аудиомодели.
//
//   node scripts/audio-review-two-schedules-context.mjs [out/audio-review/two-schedules-2d.context.json]
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { TS2_LINES, TS2_VIDEO } from "../src/two-schedules-2d/script.ts";
import { buildTs2Cues } from "../src/two-schedules-2d/timing.ts";
import { requireTs2Manifest } from "../src/two-schedules-2d/manifestGuard.ts";

const out = process.argv[2] ?? "out/audio-review/two-schedules-2d.context.json";
const voiceDir = join("public", TS2_VIDEO.voiceDir);
const manifestPath = join(voiceDir, "manifest.json");
const manifestRaw = readFileSync(manifestPath, "utf8");
const manifest = requireTs2Manifest(JSON.parse(manifestRaw));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const fps = TS2_VIDEO.fps;
const frame = (sec) => Math.round(sec * fps) / fps; // как s() в Ts2Audio

const probeDuration = (path) => {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
    {
      encoding: "utf8",
    },
  );
  return r.status === 0 ? Number(r.stdout.trim()) : null;
};

let gitRev = null;
try {
  gitRev = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
} catch {
  gitRev = null;
}

const cues = buildTs2Cues(manifest);
const problems = [];
const lines = TS2_LINES.map((l) => {
  const c = cues.find((x) => x.id === l.id);
  const ml = manifest.lines.find((x) => x.id === l.id);
  const base = {
    id: l.id,
    role: l.role,
    text: l.spoken ?? l.text,
    plan_at: l.at,
  };
  if (!c?.file || !ml) {
    problems.push(`${l.id}: нет файла голоса в манифесте`);
    return { ...base, placement: null };
  }
  const path = join(voiceDir, c.file);
  if (!existsSync(path)) {
    problems.push(`${l.id}: нет файла ${path}`);
    return { ...base, placement: null };
  }
  const probed = probeDuration(path);
  const durationOk =
    probed !== null && Math.abs(probed - ml.durationSec) <= 0.06;
  if (!durationOk)
    problems.push(
      `${l.id}: длительность файла ${probed} с ≠ манифест ${ml.durationSec} с`,
    );
  const fileFrom = frame(c.audioFrom);
  const r = (x) => Number(x.toFixed(3));
  return {
    ...base,
    placement: durationOk
      ? {
          file: path,
          file_sha256: sha(readFileSync(path)),
          file_from: r(fileFrom),
          file_to: r(fileFrom + probed),
          speech_from: r(fileFrom + ml.speechStart),
          speech_to: r(fileFrom + ml.speechEnd),
          checks: [
            "файл существует",
            "SHA-256 записан",
            "длительность ffprobe = манифест ±0,06 с",
          ],
        }
      : null,
  };
});

const context = {
  kind: "project_placement",
  video: "BalaGoTwoSchedules2D",
  placement_basis:
    "Размещение файла голоса в композиции: buildTs2Cues(manifest) и округление до кадра, как в Ts2Audio. " +
    "file_from/file_to — где звучит файл; speech_from/speech_to — окно речи внутри файла по таймингам манифеста. " +
    "plan_at — плановое время сценария, не проверенная привязка.",
  manifest: { path: manifestPath, sha256: sha(manifestRaw) },
  git_rev: gitRev,
  caveat:
    "Совпадение отрендеренного MP4 с этим манифестом не проверяется автоматически: MP4 нужно рендерить из того же состояния репозитория.",
  problems,
  lines,
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(context, null, 2));
console.log(
  `Контекст: ${out} (${lines.length} реплик, с проверенным размещением: ${lines.filter((l) => l.placement).length})`,
);
if (problems.length) {
  console.log(`Проблемы:\n- ${problems.join("\n- ")}`);
  process.exitCode = 1;
}
