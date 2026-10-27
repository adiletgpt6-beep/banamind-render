// Звук «Переговоры в третьем "Б"»: голоса по шкале фактической речи (C01 —
// один и тот же файл в сценах 1 и 9), своя музыка по настроению сцен
// (scripts/t3b-music.mjs — без бочки и щелчков) и немногие тихие эффекты,
// у каждого из которых есть видимое действие: альбом открывается, лист
// вынимают, щелчок ремня, мягкая дверь, сигнал завершения звонка, крышка
// ноутбука, одно касание «отправить», карандаш по бумаге, тихий салон.
// Шагов нет ни в одном пути звука.
// Музыка: под речью заметно ниже голоса (под голосом дочки — сильнее),
// во время звонка тише; в последние 2,5 с плавно затихает к последнему
// кадру. После завершения звонка голоса конференции больше не звучат,
// музыка не обрывается.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { sceneTools } from "./plan";
import { T3B_VIDEO, type T3bSceneId } from "./script";
import type { T3bTimeline } from "./timing";
import { approvedPlan, callPlan } from "./scenes/callPlan";
import { parkedPlan } from "./scenes/Parked";
import { daughterPlan } from "./scenes/Daughter";
import { drivePlan } from "./scenes/Drive";
import { searchPlan } from "./scenes/Search";
import { signPlan } from "./scenes/Sign";

const FPS = T3B_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = "audio/third-b-meeting-2d";

const MOOD: Record<T3bSceneId, string> = {
  hook: "t3b-curious",
  studio: "t3b-work",
  calendar: "t3b-work",
  dad: "t3b-work",
  parked: "t3b-work",
  daughter: "t3b-work",
  present: "t3b-call",
  drawing: "t3b-call",
  joke: "t3b-call",
  approved: "t3b-call",
  question: "t3b-quiet",
  drive: "t3b-road",
  search: "t3b-focus",
  sign: "t3b-end",
  contact: "t3b-end",
};
const MOOD_GAIN: Record<string, number> = { "t3b-curious": 1, "t3b-work": 0.95, "t3b-call": 0.75, "t3b-quiet": 0.7, "t3b-road": 1, "t3b-focus": 0.85, "t3b-end": 1 };

export type T3bSfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const T3B_SFX_FILES = ["paper", "photo", "belt", "car-door", "call-end", "laptop-close", "tap", "pencil", "car-cabin"] as const;

// Эффекты по действиям (кадр ролика).
export const t3bSfx = (tl: T3bTimeline): T3bSfx[] => {
  const at = (id: T3bSceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const sfx = (n: string) => `${DIR}/sfx/${n}.mp3`;
  const c = callPlan(tl);
  const pk = parkedPlan(tl);
  const dg = daughterPlan(tl);
  const A = sceneTools(tl, "approved");
  const ap = approvedPlan(c.endCall - A.start, A.from("M05"), A.to("M05"));
  const dv = drivePlan(sceneTools(tl, "drive").len);
  const S = sceneTools(tl, "search");
  const sp = searchPlan({ to: S.to, from: S.from, word: S.word, len: S.len });
  const G = sceneTools(tl, "sign");
  const gp = signPlan({ from: G.from, to: G.to, len: G.len });
  const drive = tl.scenes.find((s) => s.id === "drive")!;
  return [
    { frame: at("parked", pk.fClose[1] - 2), src: sfx("car-door"), volume: 0.32 },
    { frame: at("daughter", dg.door[1] - 2), src: sfx("car-door"), volume: 0.3 },
    { frame: at("daughter", dg.belt[1] - 1), src: sfx("belt"), volume: 0.45 },
    { frame: c.d.open[0] + 4, src: sfx("paper"), volume: 0.4 },
    { frame: c.d.take - 2, src: sfx("photo"), volume: 0.35 },
    { frame: at("approved", ap.ended), src: sfx("call-end"), volume: 0.3 },
    { frame: at("approved", ap.close[1] - 1), src: sfx("laptop-close"), volume: 0.45 },
    { frame: at("drive", dv.rClose[1] - 2), src: sfx("car-door"), volume: 0.3 },
    { frame: at("drive", dv.belt[1] - 1), src: sfx("belt"), volume: 0.4 },
    { frame: at("drive", dv.go), src: sfx("car-cabin"), volume: 0.12, dur: (drive.to - drive.from - dv.go) / FPS },
    { frame: at("search", sp.send), src: sfx("tap"), volume: 0.45 },
    { frame: at("sign", gp.title[0]), src: sfx("pencil"), volume: 0.35, dur: (gp.title[1] - gp.title[0]) / FPS },
    { frame: at("sign", gp.credit[0]), src: sfx("pencil"), volume: 0.35, dur: (gp.credit[1] - gp.credit[0]) / FPS },
  ];
};

export const T3bAudio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  const spans = useMemo(() => tl.cues.map((c) => ({ a: Math.round(c.from * FPS), b: Math.round(c.to * FPS), kid: c.role === "daughter" })), [tl]);
  const music = useMemo(() => {
    const out: { src: string; from: number; to: number }[] = [];
    for (const sc of tl.scenes) {
      const src = MOOD[sc.id];
      const last = out[out.length - 1];
      if (last && last.src === src) last.to = sc.to;
      else out.push({ src, from: sc.from, to: sc.to });
    }
    return out;
  }, [tl]);
  const sfx = useMemo(() => t3bSfx(tl), [tl]);
  const BASE = 0.3;
  const duck = (f: number) => {
    let v = BASE;
    for (const s of spans) {
      const low = s.kid ? 0.05 : 0.08;
      v = Math.min(v, interpolate(f, [s.a - 10, s.a, s.b, s.b + 18], [BASE, low, low, BASE], clamp));
    }
    return v * interpolate(f, [0, 10, total - 75, total - 1], [0, 1, 1, 0], clamp);
  };
  const XF = 30;
  return (
    <>
      {music.map((m, i) => {
        const a = Math.max(0, m.from - (i > 0 ? XF / 2 : 0));
        const b = Math.min(total, m.to + (i < music.length - 1 ? XF / 2 : 0));
        const g = MOOD_GAIN[m.src] ?? 1;
        return (
          <Sequence key={`${m.src}-${i}`} name={`Музыка: ${m.src}`} from={a} durationInFrames={b - a}>
            <Audio
              src={staticFile(`${DIR}/music/${m.src}.mp3`)}
              trimBefore={Math.round((m.from / FPS) % 150) * FPS}
              volume={(f) => duck(f + a) * g * interpolate(f + a, [a, a + XF, b - XF, b], [i === 0 ? 1 : 0, 1, 1, i === music.length - 1 ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.frame} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={dur ? (f) => x.volume * interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], clamp) : x.volume} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${T3B_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
