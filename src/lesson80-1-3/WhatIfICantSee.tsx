// Композиция Lesson80-1-3-WhatIfICantSee: lesson-80, ролик 80-1-3.
// Урок 1 «Аллах — наш Создатель» · мини-фильм 3 «А если я не вижу?»
// 1920×1080, 30 к/с. Планы: знакомая учебная комната (окно, столик у окна,
// низкий столик, 25 учеников и учитель), два коротких воспоминания об опыте
// и краткий возврат к яблоне из второго фильма. Музыки нет: речь, тихая
// комната, воздух у окна, бумага вертушки, вдох и выдох Юсуфа.
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, dist } from "../lesson01/rig/geom";
import { BloomView } from "../lesson80-1-2/sets/nature";
import { buildDirection, camAt, type Direction, prevShot, type Shot, shotAt, smoothRoomState, WIN_HUB } from "./direction";
import { type OverlayTimes, Overlays } from "./overlays";
import { type A3Lang, a3Edition } from "./edition";
import type { A3Line } from "./script";
import { buildTimeline, type Manifest, type Timeline } from "./timeline";
import { RoomWorld } from "./world";

// lang — языковая версия: ru (по умолчанию) или ky.
export type WhatIfICantSeeProps = { manifest: Manifest | null; subtitles: boolean; lang?: A3Lang };

const RoomView: React.FC<{ T: Timeline; D: Direction; t: number; cam: { cx: number; cy: number; w: number }; quiet?: boolean }> = ({ T, D, t, cam, quiet }) => {
  const h = (cam.w * 9) / 16;
  const s0 = smoothRoomState(T, D, t);
  // в воспоминании звучит голос учителя — речь героев воспоминания не видна
  // (рот закрыт), но округлённые губы выдоха Юсуфа остаются
  const s = quiet ? { ...s0, chars: s0.chars.map((c) => (c.face.mouthRound > 0.5 ? c : { ...c, face: { ...c.face, mouthOpen: 0 } })) } : s0;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox={`${cam.cx - cam.w / 2} ${cam.cy - h / 2} ${cam.w} ${h}`}>
        <RoomWorld s={s} />
      </svg>
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot; T: Timeline; D: Direction; t: number }> = ({ shot, T, D, t }) => {
  if (shot.set === "orchard") {
    // краткий узнаваемый возврат к яблоне второго фильма (спелые яблоки среди листьев)
    return (
      <AbsoluteFill>
        <BloomView fx={{ t, stage: 4, showB: false }} cam={camAt(shot, t)} />
      </AbsoluteFill>
    );
  }
  if (shot.set === "memory" && shot.mem) {
    // воспоминание: тот же опыт в тех же положениях, мягкая тёплая дымка
    const tm = shot.mem.at + (t - shot.from);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ filter: "saturate(0.78) sepia(0.14) brightness(1.04)" }}>
          <RoomView T={T} D={D} t={tm} cam={camAt(shot, shot.from)} quiet />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(255,250,238,0) 52%, rgba(255,248,232,0.55) 100%)" }} />
      </AbsoluteFill>
    );
  }
  return <RoomView T={T} D={D} t={t} cam={camAt(shot, t)} />;
};

// ---------- Звук ----------
const SFX = "audio/lesson80-1-3/sfx";
const SFX1 = "audio/lesson01/sfx";
const A3Audio: React.FC<{ T: Timeline; D: Direction; voiceDir: string }> = ({ T, D, voiceDir }) => {
  const fps = T.fps;
  const f = (sec: number) => Math.round(sec * fps);
  const total = T.frames;
  // близость камеры к окну (воздух у окна слышнее, у детей тише); сглажено
  // по ±0,3 с, чтобы склейки не дёргали громкость
  const near = (sec: number) => {
    let acc = 0;
    for (const d of [-0.3, -0.15, 0, 0.15, 0.3]) {
      const tt = Math.max(0, sec + d);
      const sh = shotAt(D, tt);
      const c = sh.set === "room" ? camAt(sh, tt) : { cx: 0, cy: 0, w: 4000 };
      acc += clamp(1 - dist({ x: c.cx, y: c.cy }, WIN_HUB) / 1500) * clamp(1.4 - c.w / 3800);
    }
    return acc / 5;
  };
  const edge = (fr: number) => interpolate(fr, [0, 24, total - 45, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const one = (at: number, src: string, v: number, key: string, len = 1.4) => (
    <Sequence key={key} from={Math.max(0, f(at))} durationInFrames={f(len)}>
      <Audio src={staticFile(src)} volume={v} />
    </Sequence>
  );
  const S = D.sfx;
  return (
    <>
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX1}/roomtone.wav`)} loop loopVolumeCurveBehavior="extend" volume={(fr) => 0.72 * edge(fr)} />
      </Sequence>
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX}/window-air.wav`)} loop loopVolumeCurveBehavior="extend" volume={(fr) => edge(fr) * (0.13 + 0.6 * near(fr / fps))} />
      </Sequence>
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX}/curtain.wav`)} loop loopVolumeCurveBehavior="extend" volume={(fr) => edge(fr) * 0.3 * near(fr / fps)} />
      </Sequence>
      {/* шуршание бумажных лепестков — только пока ротор вращается */}
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX}/rotor.wav`)} loop loopVolumeCurveBehavior="extend" volume={(fr) => edge(fr) * 1.0 * clamp(Math.abs(D.omegaAt(fr / fps)) / 480) * (0.35 + 0.65 * Math.max(near(fr / fps), fr / fps > D.A.present0 && fr / fps < D.A.back1 ? 1 : 0))} />
      </Sequence>
      {/* вдох и выдох Юсуфа (без речи) */}
      {one(S.inhale - 0.05, `${SFX}/inhale.wav`, 1.3, "inh", 1)}
      {one(S.exhale - 0.03, `${SFX}/exhale.wav`, 1.6, "exh", 2)}
      {/* касания предметов, одежда */}
      {one(S.standLift, `${SFX}/stand-pick.wav`, 0.35, "sp1")}
      {one(S.standPlace - 0.02, `${SFX}/stand-place.wav`, 0.5, "spl1")}
      {one(S.stickOut, `${SFX}/stick-in.wav`, 0.25, "so")}
      {one(S.stickIn, `${SFX}/stick-in.wav`, 0.45, "si")}
      {one(S.standLiftLow, `${SFX}/stand-pick.wav`, 0.35, "sp2")}
      {one(S.standPlaceWin - 0.02, `${SFX}/stand-place.wav`, 0.4, "spl2")}
      {one(S.clothDown, `${SFX}/cloth-1.wav`, 0.35, "c1")}
      {one(S.clothUp, `${SFX}/cloth-2.wav`, 0.35, "c2")}
      {/* шаги — едва слышно, по моментам опоры */}
      {D.walks.flatMap((w, wi) =>
        stepTimes(w.plan)
          .filter((st) => st >= w.from && st < Math.min(w.to, T.total))
          .map((st, i) => one(st, `${SFX}/step-${((i + wi) % 4) + 1}.wav`, 0.32, `st${wi}-${i}`, 0.6)),
      )}
      {/* голоса */}
      {Object.values(T.seg)
        .filter((s) => s.m.file)
        .map((s) => (
          <Sequence key={s.m.segId} from={f(s.fileStart)} durationInFrames={Math.ceil(s.m.durationSec * fps) + 2}>
            <Audio src={staticFile(`${voiceDir}/${s.m.file}`)} volume={1} />
          </Sequence>
        ))}
    </>
  );
};

// Моменты постановки стоп (касание пяткой) из плана проходки.
const stepTimes = (plan: Direction["walks"][number]["plan"]): number[] => [...plan.falls.L, ...plan.falls.R].filter((f) => f.kind !== "start" || f.land > plan.t0).map((f) => f.land).sort((a, b) => a - b);

// Субтитры (по желанию): точно утверждённые тексты; длинные реплики делятся
// на две части по предложениям (по таймингам слов). Ответ после паузы
// появляется только вместе с ответом.
export const subtitleCues = (T: Timeline, lines: readonly A3Line[]) => {
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  const cues: { a: number; z: number; text: string }[] = [];
  segs.forEach((s, i) => {
    const text = lines.find((l) => l.id === s.line)?.text ?? "";
    const next = segs[i + 1];
    const end = Math.min(s.end + 0.6, next ? next.start - 0.05 : s.end + 0.6);
    const words = text.split(" ");
    // слова манифеста — только с буквами (отдельное «—» в них не входит), как в SRT
    const lettered = words.map((w, i) => ({ w, i })).filter(({ w }) => /\p{L}/u.test(w));
    const mw = s.m.words.filter((w) => /\p{L}/u.test(w.text));
    if (text.length > 84 && mw.length === lettered.length) {
      // граница — конец предложения ближе к середине
      let best = -1;
      let bestScore = Infinity;
      for (let k = 1; k < words.length - 1; k++) {
        if (!/[.:?!]$/.test(words[k - 1])) continue;
        const score = Math.abs(words.slice(0, k).join(" ").length - text.length / 2);
        if (score < bestScore) {
          bestScore = score;
          best = k;
        }
      }
      if (best > 0) {
        const k = lettered.findIndex(({ i }) => i >= best);
        const cut = s.fileStart + mw[k].start - 0.05;
        cues.push({ a: s.start - 0.05, z: cut, text: words.slice(0, best).join(" ") });
        cues.push({ a: cut, z: end, text: words.slice(best).join(" ") });
        return;
      }
    }
    cues.push({ a: s.start - 0.05, z: end, text });
  });
  return cues;
};

export const WhatIfICantSee: React.FC<WhatIfICantSeeProps> = ({ manifest, subtitles, lang }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ed = a3Edition(lang);
  const T = useMemo(() => buildTimeline(manifest, fps, ed.lines), [manifest, fps, ed]);
  const D = useMemo(() => buildDirection(T, ed.anchors), [T, ed]);
  const cues = useMemo(() => subtitleCues(T, ed.lines), [T, ed]);
  const t = frame / fps;
  const shot = shotAt(D, t);
  const prev = prevShot(D, shot);
  const fadeU = shot.fade ? clamp((t - shot.from) / shot.fade) : 1;
  const o: OverlayTimes = {
    titleIn: 0.7,
    titleOut: T.hold.notice.start - 0.8, // название гаснет до склейки на Юсуфа
    finalIn: T.seg[D.n(42)].end + 0.85, // после склейки на общий план
  };
  const sub = subtitles ? (cues.find((c) => t >= c.a && t <= c.z)?.text ?? null) : null;
  // в воспоминание и обратно — короткий уход в светлый тон (без наложения
  // двух лиц); остальные переходы — короткое растворение или прямая склейка
  const dip = shot.set === "memory" || shot.set === "orchard" || shot.tag === "dip";
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      {dip && fadeU < 1 ? (
        <>
          {prev && fadeU < 0.5 ? <ShotView shot={prev} T={T} D={D} t={t} /> : <ShotView shot={shot} T={T} D={D} t={t} />}
          <AbsoluteFill style={{ background: "#FFF8EC", opacity: 0.88 * (1 - Math.abs(fadeU - 0.5) * 2) }} />
        </>
      ) : (
        <>
          {prev && fadeU < 1 ? <ShotView shot={prev} T={T} D={D} t={t} /> : null}
          <AbsoluteFill style={{ opacity: fadeU }}>
            <ShotView shot={shot} T={T} D={D} t={t} />
          </AbsoluteFill>
        </>
      )}
      <Overlays t={t} o={o} finalAt={{ left: 150, top: 120 }} subtitle={sub} texts={ed.text} />
      <A3Audio T={T} D={D} voiceDir={ed.voiceDir} />
    </AbsoluteFill>
  );
};
