// Звук №29: голоса (по шкале фактической речи), своя музыка по настроению
// сцен (scripts/te2d-music.mjs — без бочки и щелчков) и немногие тихие
// эффекты, у каждого из которых есть видимое действие: клапан конверта,
// шелест записки и пачки конвертов, перо по бумаге (только пока пишет),
// одно мягкое нажатие «Жөнөтүү». Шагов, писка уведомлений и пружинных
// звуков нет. Музыка под речью заметно ниже голоса (под детским голосом —
// сильнее), в сценах записки и ответа сына — тише всего, в последние
// 2,5 с плавно затихает.
import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { interpolate, Sequence, staticFile } from "remotion";
import { useTimeline } from "./context";
import { TE2_VIDEO, type Te2SceneId } from "./script";
import type { Te2Timeline } from "./timing";
import { notePlan } from "./scenes/Note";
import { heardPlan } from "./scenes/Heard";
import { boxPlan } from "./scenes/Box";
import { formPlan } from "./scenes/Form";
import { memoryPlan } from "./scenes/Memory";

const FPS = TE2_VIDEO.fps;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DIR = "audio/twenty-five-envelopes-2d";

// Музыка по сценам: дорожка → сцены.
const MOOD: Record<Te2SceneId, string> = {
  names: "te2d-curious",
  memory: "te2d-curious",
  office: "te2d-office",
  days: "te2d-office",
  dinner: "te2d-office",
  note: "te2d-quiet",
  heard: "te2d-quiet",
  sit: "te2d-quiet",
  people: "te2d-warm",
  calendars: "te2d-focus",
  search: "te2d-focus",
  form: "te2d-focus",
  box: "te2d-end",
  promise: "te2d-end",
  contact: "te2d-end",
};
const MOOD_GAIN: Record<string, number> = { "te2d-quiet": 0.7, "te2d-curious": 1, "te2d-office": 0.9, "te2d-warm": 1, "te2d-focus": 0.85, "te2d-end": 0.95 };

export type Te2Sfx = { readonly frame: number; readonly src: string; readonly volume: number; readonly dur?: number };
export const TE2_SFX_FILES = ["paper", "envelope", "pen", "tap"] as const;

// Эффекты по действиям (кадр ролика): тихий шелест бумаги, ручка, одно
// нажатие «Жөнөтүү». Заполняются планами сцен.
export const te2Sfx = (tl: Te2Timeline): Te2Sfx[] => {
  const at = (id: Te2SceneId, f: number) => tl.scenes.find((s) => s.id === id)!.from + f;
  const sfx = (n: string) => `${DIR}/sfx/${n}.mp3`;
  const paper = (id: Te2SceneId, f: number, v = 0.22): Te2Sfx => ({ frame: at(id, f), src: sfx("paper"), volume: v });
  const env = (id: Te2SceneId, f: number, v = 0.22): Te2Sfx => ({ frame: at(id, f), src: sfx("envelope"), volume: v });
  const N = notePlan(tl);
  const H = heardPlan(tl);
  const B = boxPlan(tl);
  const F = formPlan(tl);
  const M = memoryPlan(tl);
  return [
    env("memory", M.lift),
    // записка выходит из «Эмир», возвращается; рисунок из «Бекзат»
    env("note", N.flap[0]),
    paper("note", N.pull[0], 0.24),
    paper("note", N.bIn[0], 0.2),
    env("note", N.k.flap[0]),
    paper("note", N.k.pull[0], 0.24),
    paper("heard", H.back[0], 0.2),
    // пачка конвертов ложится в коробку, записка достаётся
    paper("box", B.drop[1] - 4, 0.26),
    env("box", B.held.flap[0]),
    paper("box", B.held.pull[0], 0.24),
    // ручка: только пока перо касается бумаги
    { frame: at("box", B.write1), src: sfx("pen"), volume: 0.3, dur: (B.write1End - B.write1 - 6) / FPS },
    { frame: at("box", B.write2), src: sfx("pen"), volume: 0.3, dur: (B.write2End - B.write2 - 4) / FPS },
    // одно мягкое нажатие «Жөнөтүү»
    { frame: at("form", F.send), src: sfx("tap"), volume: 0.3 },
  ];
};

export const Te2Audio: React.FC = () => {
  const tl = useTimeline();
  const total = tl.frames;
  // интервалы речи (кадры) для приглушения музыки; под голосом сына — сильнее
  const spans = useMemo(() => tl.cues.map((c) => ({ a: Math.round(c.from * FPS), b: Math.round(c.to * FPS), child: c.role === "son" })), [tl]);
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
  const sfx = useMemo(() => te2Sfx(tl), [tl]);
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
            <Audio src={staticFile(`${TE2_VIDEO.voiceDir}/${c.file}`)} />
          </Sequence>
        ) : null,
      )}
    </>
  );
};
