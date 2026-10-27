// Звук №27: голоса (по шкале фактической речи), своя музыка по настроению
// сцен (scripts/ch2d-music.mjs — без бочки и щелчков) и немногие тихие
// эффекты, у каждого из которых есть видимое действие: фигура встаёт на
// доску, шелест листа расписания, одно мягкое нажатие «Жөнөтүү», тихий
// салон машины. Шагов, писка уведомлений и пружинных звуков нет.
// Музыка: под речью заметно ниже голоса (особенно под голосом дочки), в
// разговоре у доски — тише всего, в последние 2,5 с плавно затихает.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { CH2_VIDEO, type Ch2SceneId } from "./script";
import type { Ch2Timeline } from "./timing";
import { hookPlan } from "./scenes/Hook";
import { clubPlan } from "./scenes/Club";
import { offerPlan } from "./scenes/Offer";
import { routinePlan } from "./scenes/Routine";
import { timePlan } from "./scenes/Time";
import { lightPlan } from "./scenes/Light";
import { heardPlan } from "./scenes/Heard";
import { calendarsPlan } from "./scenes/Calendars";
import { searchPlan } from "./scenes/Search";
import { coachPlan } from "./scenes/Coach";

const FPS = CH2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = "audio/chess-tournament-2d";

// Музыка по сценам: дорожка → сцены.
const MOOD: Record<Ch2SceneId, string> = {
  hook: "ch2d-curious",
  club: "ch2d-warm",
  offer: "ch2d-warm",
  routine: "ch2d-office",
  time: "ch2d-office",
  message: "ch2d-quiet",
  dinner: "ch2d-quiet",
  light: "ch2d-quiet",
  reason: "ch2d-quiet",
  heard: "ch2d-quiet",
  calendars: "ch2d-focus",
  search: "ch2d-focus",
  coach: "ch2d-focus",
  move: "ch2d-end",
  contact: "ch2d-end",
};
const MOOD_GAIN: Record<string, number> = { "ch2d-quiet": 0.7, "ch2d-curious": 1, "ch2d-office": 0.9, "ch2d-warm": 1, "ch2d-focus": 0.85, "ch2d-end": 1 };

export type Ch2Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const CH2_SFX_FILES = ["paper", "piece", "tap", "car-cabin"] as const;

// Эффекты по действиям (кадр ролика).
export const ch2Sfx = (tl: Ch2Timeline): Ch2Sfx[] => {
  const at = (id: Ch2SceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const sfx = (n: string) => `${DIR}/sfx/${n}.mp3`;
  const piece = (id: Ch2SceneId, f: number): Ch2Sfx => ({ frame: at(id, f) - 1, src: sfx("piece"), volume: 0.35 });
  const paper = (id: Ch2SceneId, f: number): Ch2Sfx => ({ frame: at(id, f), src: sfx("paper"), volume: 0.3 });
  const H = hookPlan(tl);
  const CL = clubPlan(tl);
  const O = offerPlan(tl);
  const R = routinePlan(tl);
  const T = timePlan(tl);
  const L = lightPlan(tl);
  const HD = heardPlan(tl);
  const CA = calendarsPlan(tl);
  const S = searchPlan(tl);
  const CO = coachPlan(tl);
  return [
    piece("hook", H.set),
    piece("club", CL.release),
    paper("offer", O.put[1] - 6),
    paper("offer", O.lift),
    { frame: at("routine", R.cut[3]), src: sfx("car-cabin"), volume: 0.1, dur: (R.cut[4] - R.cut[3]) / FPS },
    paper("time", T.fold[0]),
    piece("light", L.set),
    paper("heard", HD.lift[0]),
    paper("calendars", CA.place[1] - 6),
    { frame: at("search", S.send), src: sfx("tap"), volume: 0.35 },
    piece("coach", CO.q.release),
    piece("coach", CO.r.release),
  ];
};

export const Ch2Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  // интервалы речи (кадры) для приглушения музыки; под голосом сына — сильнее
  const spans = useMemo(() => tl.cues.map((c) => ({ a: Math.round(c.from * FPS), b: Math.round(c.to * FPS), child: c.role === "daughter" })), [tl]);
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
  const sfx = useMemo(() => ch2Sfx(tl), [tl]);
  const BASE = 0.32;
  const duck = (f: number) => {
    let v = BASE;
    for (const s of spans) {
      const low = s.child ? 0.06 : 0.085;
      v = Math.min(v, interpolate(f, [s.a - 10, s.a, s.b, s.b + 18], [BASE, low, low, BASE], clamp));
    }
    return v * interpolate(f, [0, 12, total - 75, total - 1], [0, 1, 1, 0], clamp);
  };
  const XF = 30; // перекрёстное затухание 1 с
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
              trimBefore={(i * 17 * FPS) % (120 * FPS)}
              volume={(f) => duck(f + a) * g * interpolate(f + a, [a, a + XF, b - XF, b], [i === 0 ? 1 : 0, 1, 1, i === music.length - 1 ? 1 : 0], clamp)}
            />
          </Sequence>
        );
      })}
      {sfx.map((x, i) => {
        const dur = x.dur ? Math.round(x.dur * FPS) : undefined;
        return (
          <Sequence key={`sfx-${i}`} name={`Эффект: ${x.src.split("/").pop()}`} from={x.frame} durationInFrames={dur} premountFor={FPS}>
            <Audio src={staticFile(x.src)} volume={dur ? (f) => x.volume * interpolate(f, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp) : x.volume} />
          </Sequence>
        );
      })}
      {tl.cues.map((c) =>
        c.file ? (
          <Sequence key={c.id} name={`Голос: ${c.id} (${c.role})`} from={Math.round(c.audioFrom * FPS)} durationInFrames={Math.ceil(c.durationSec * FPS) + 2} premountFor={FPS}>
            <Audio src={staticFile(`${CH2_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
