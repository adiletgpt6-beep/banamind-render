// Быстрый предпросмотр кадров BalaGoBG033 без полной сборки ролика.
// Создаёт временную точку входа в out/dev-bg-033/ (не в Git), которая
// импортирует только нужный модуль, — ошибка в другой сцене не мешает.
//
//   node scripts/campaign50/bg-033/preview.mjs --scene trial --frames 0,120,300
//   node scripts/campaign50/bg-033/preview.mjs --scene hook --every 15
//   node scripts/campaign50/bg-033/preview.mjs --module art/Mom.tsx --export MomSheet --duration 90 --frames 0,45
//   node scripts/campaign50/bg-033/preview.mjs --full --frames 0,600   (вся композиция)
// Флаги: --scale 0.5 (по умолчанию), --voice (шкала по manifest.json озвучки),
//        --out <папка> (по умолчанию out/preview-bg-033/<имя>), --sheet (лист).
// Браузер: REMOTION_BROWSER или /opt/pw-browsers (если есть), иначе Remotion.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { BG33_VIDEO } from "../../../src/campaign50/bg-033/script.ts";
import { buildBg33Timeline, estimateBg33Manifest } from "../../../src/campaign50/bg-033/timing.ts";

const argv = process.argv.slice(2);
const opt = (name, def = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length && !argv[i + 1].startsWith("--") ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);

const ROOT = resolve(".");
const SRC = join(ROOT, "src/campaign50/bg-033");
const DEV = join(ROOT, "out/dev-bg-033");
mkdirSync(DEV, { recursive: true });

const mf = join(ROOT, "public", BG33_VIDEO.voiceDir, "manifest.json");
const useVoice = flag("voice") && existsSync(mf);
const manifest = useVoice ? JSON.parse(readFileSync(mf, "utf8")) : estimateBg33Manifest();
const tl = buildBg33Timeline(manifest);

const scene = opt("scene");
const mod = opt("module");
const full = flag("full");
let name;
let entry;
let compId = "Preview";
let duration;
const rel = (p) => relative(DEV, p).split("\\").join("/");

if (full) {
  name = "full";
  entry = join(SRC, "index.ts");
  compId = BG33_VIDEO.id;
  duration = tl.frames;
} else if (scene) {
  const sc = tl.scenes.find((s) => s.id === scene);
  if (!sc) throw new Error(`Нет сцены ${scene}: ${tl.scenes.map((s) => s.id).join(", ")}`);
  const file = { hook: "Hook", rule: "Rule", wait: "Wait", trial: "Trial", choice: "Choice", cta: "Cta" }[scene];
  name = `scene-${scene}`;
  duration = sc.frames;
  entry = join(DEV, `${name}.tsx`);
  writeFileSync(
    entry,
    `// @ts-nocheck — временная точка входа предпросмотра (out/, не в Git)
import { AbsoluteFill, Composition, registerRoot, Sequence } from "remotion";
import "${rel(join(ROOT, "src/fonts"))}";
import { SceneContext, TimelineContext } from "${rel(join(SRC, "context"))}";
import { Subtitles } from "${rel(join(SRC, "Subtitles"))}";
import { ${file}Scene as S } from "${rel(join(SRC, "scenes", file))}";
const TL = ${JSON.stringify(tl)};
const SC = TL.scenes.find((s) => s.id === "${scene}");
const P = () => (
  <TimelineContext.Provider value={TL}>
    <AbsoluteFill style={{ backgroundColor: "#FFFDF7" }}>
      <SceneContext.Provider value={{ from: SC.from, frames: SC.frames }}>
        <AbsoluteFill style={{ overflow: "hidden" }}><S /></AbsoluteFill>
      </SceneContext.Provider>
      <Sequence from={-SC.from}><Subtitles /></Sequence>
    </AbsoluteFill>
  </TimelineContext.Provider>
);
registerRoot(() => <Composition id="Preview" component={P} width={1080} height={1920} fps={30} durationInFrames={${duration}} />);
`,
  );
} else if (mod) {
  const exp = opt("export");
  if (!exp) throw new Error("Нужен --export <ИмяКомпонента>");
  duration = Number(opt("duration", "90"));
  name = `module-${exp}`;
  entry = join(DEV, `${name}.tsx`);
  const modPath = resolve(SRC, mod).replace(/\.tsx?$/, "");
  writeFileSync(
    entry,
    `// @ts-nocheck — временная точка входа предпросмотра (out/, не в Git)
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import "${rel(join(ROOT, "src/fonts"))}";
import { ${exp} as M } from "${rel(modPath)}";
const P = () => <AbsoluteFill style={{ backgroundColor: "#FFFDF7" }}><M /></AbsoluteFill>;
registerRoot(() => <Composition id="Preview" component={P} width={1080} height={1920} fps={30} durationInFrames={${duration}} />);
`,
  );
} else {
  throw new Error("Укажите --scene <id>, --module <путь> --export <имя> или --full");
}

let frames = [];
const fl = opt("frames");
const every = opt("every");
if (fl) frames = fl.split(",").map((x) => Number(x.trim())).filter((x) => Number.isFinite(x));
else if (every) for (let f = 0; f < duration; f += Number(every)) frames.push(f);
else frames = [0, Math.round(duration * 0.25), Math.round(duration * 0.5), Math.round(duration * 0.75), duration - 1];
frames = frames.map((f) => Math.max(0, Math.min(duration - 1, Math.round(f))));

const outDir = resolve(opt("out", join("out/preview-bg-033", name)));
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const sys = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable = process.env.REMOTION_BROWSER || (existsSync(sys) ? sys : null);
const serveUrl = await bundle({ entryPoint: entry, outDir: join(DEV, `bundle-${name}`) });
const inputProps = full ? { requireVoice: false, manifest } : {};
const composition = await selectComposition({ serveUrl, id: compId, inputProps, browserExecutable });
const scale = Number(opt("scale", "0.5"));
console.log(`${name}: ${duration} кадров (${(duration / 30).toFixed(2)} с), шкала: ${useVoice ? "озвучка" : "оценка"}`);
for (const frame of frames) {
  const output = join(outDir, `f${String(frame).padStart(5, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, inputProps, browserExecutable, scale });
  console.log(`→ ${frame} → ${output}`);
}
if (flag("sheet") || frames.length > 1) {
  const pngs = readdirSync(outDir).filter((f) => /^f\d+\.png$/.test(f)).sort();
  const cols = Math.min(6, pngs.length);
  const rows = Math.ceil(pngs.length / cols);
  const sheet = join(outDir, "sheet.png");
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-pattern_type", "glob", "-i", join(outDir, "f*.png"),
    "-vf", `scale=270:-1,tile=${cols}x${rows}:padding=6:color=0x999999`,
    "-frames:v", "1", sheet,
  ]);
  console.log(`Лист: ${sheet} (${pngs.length} кадров: ${frames.join(", ")})`);
}
