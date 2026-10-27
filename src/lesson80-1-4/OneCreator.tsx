// Композиция Lesson80-1-4-OneCreator: lesson-80, мини-фильм 80-1-4
// «Урок 1. Аллах — наш Создатель. Мини-фильм 4: Один Создатель».
// 1920×1080, 16:9, 30 к/с. Все планы — окно камеры на одну и ту же комнату
// (тот же мир, что в предыдущих фильмах): крупные планы ростка, полива,
// карточек, окна, неба и гор за окном, Корана на подставке — это ракурсы
// одной географии, а не новые декорации.
import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../lesson01/rig/geom";
import { buildDirection, camAt, captionTimes, type Direction, prevShot, type Shot, shotAt, smoothRoomState } from "./direction";
import { Overlays } from "./overlays";
import { type A4Lang, a4Pack } from "./lang";
import { buildTimeline, type Manifest, type Timeline } from "./timeline";
import { RoomWorld } from "./world";

// lang — языковая версия (по умолчанию русская): реплики, надписи, озвучка
export type OneCreatorProps = { manifest: Manifest | null; subtitles: boolean; lang?: A4Lang };

const ShotView: React.FC<{ shot: Shot; T: Timeline; D: Direction; t: number }> = ({ shot, T, D, t }) => {
  const c = camAt(shot, t);
  const h = (c.w * 9) / 16;
  const s = smoothRoomState(T, D, t);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox={`${c.cx - c.w / 2} ${c.cy - h / 2} ${c.w} ${h}`}>
        <RoomWorld s={s} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- Звук: голоса, тихая комната, предметы. Музыки нет. ----------
const SFX1 = "audio/lesson01/sfx";
const A4Audio: React.FC<{ T: Timeline; D: Direction }> = ({ T, D }) => {
  // шумы — рядом с озвучкой версии (у каждой своя длина струи полива)
  const VOICE = a4Pack(T.lang).video.voiceDir;
  const SFX = `${VOICE}/sfx`;
  const fps = T.fps;
  const f = (sec: number) => Math.round(sec * fps);
  const total = T.frames;
  const one = (at: number, src: string, v: number, key: string, len = 1.2) => (
    <Sequence key={key} from={Math.max(0, f(at))} durationInFrames={f(len)}>
      <Audio src={staticFile(src)} volume={v} />
    </Sequence>
  );
  // pour.wav: 0,22 с тишины (струя летит от носика до земли) + струя POUR_FLOW
  // (по умолчанию 4,69 с — длина струи в кадре) + 0,35 с хвоста; файл сам
  // нарастает и затихает, громкость постоянна
  const pourDur = Math.max(0.4, D.sfx.pour.stop - D.sfx.pour.start + 0.57);
  return (
    <>
      <Sequence durationInFrames={total}>
        <Audio src={staticFile(`${SFX1}/roomtone.wav`)} loop volume={(fr) => interpolate(fr, [0, 20, total - 45, total], [0, 0.9, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
      {/* полив: тонкая струйка в землю, затем последние капли */}
      <Sequence from={f(D.sfx.pour.start)} durationInFrames={f(pourDur)}>
        <Audio src={staticFile(`${SFX}/pour.wav`)} volume={0.85} />
      </Sequence>
      {/* последние капли — каждая своим файлом в момент касания земли (касание в файле на 0,020 с) */}
      {D.sfx.drips.map((at, i) => one(at - 0.02, `${SFX}/drip-${Math.min(i, 1) + 1}.wav`, 0.85, `drip${i}`, 0.35))}
      {one(D.sfx.soilTouch, `${SFX}/soil-touch.wav`, 0.6, "soil", 0.5)}
      {one(D.sfx.canLift, `${SFX}/can-lift.wav`, 0.45, "lift1", 0.7)}
      {one(D.sfx.canLift2, `${SFX}/can-lift.wav`, 0.38, "lift2", 0.7)}
      {/* моменты касаний внутри файлов — public/audio/lesson80-1-4/sfx/meta.json */}
      {D.sfx.canPlace.map((at, i) => one(at - 0.03, `${SFX}/can-place.wav`, 0.55, `cp${i}`, 0.8))}
      {/* карточки: разные дубли, чтобы один и тот же звук не повторялся ровным ритмом */}
      {D.sfx.cardPick.map((at, i) => one(at, `${SFX}/card-pick-${(i % 3) + 1}.wav`, 0.75, `pk${i}`, 0.5))}
      {D.sfx.cardPlace.map((at, i) => one(at - 0.06, `${SFX}/card-place-${(i % 3) + 1}.wav`, 0.85, `pl${i}`, 0.5))}
      {D.sfx.cardsGather.map((at, i) => one(at, `${SFX}/card-out-${(i % 3) + 1}.wav`, 0.55, `gp${i}`, 0.5))}
      {D.sfx.cardsOnStack.map((at, i) => one(at - 0.02, `${SFX}/card-on-stack-${((i + 1) % 3) + 1}.wav`, 0.45, `gs${i}`, 0.35))}
      {one(D.sfx.traySlide.to, `${SFX}/tray-slide.wav`, 0.4, "tray1", 1.3)}
      {one(D.sfx.traySlide.back, `${SFX}/tray-slide-back.wav`, 0.4, "tray2", 1.5)}
      {D.sfx.cloth.map((c, i) => one(c.at, `${SFX}/cloth-${c.kind}.wav`, 0.25, `cl${i}`, 1.0))}
      {/* голоса */}
      {Object.values(T.seg)
        .filter((s) => s.m.file)
        .map((s) => (
          <Sequence key={s.m.segId} from={f(s.fileStart)} durationInFrames={Math.ceil(s.m.durationSec * fps) + 2}>
            <Audio src={staticFile(`${VOICE}/${s.m.file}`)} volume={1} />
          </Sequence>
        ))}
    </>
  );
};

export const subtitleAt = (T: Timeline, t: number): string | null => {
  const segs = Object.values(T.seg).sort((a, b) => a.start - b.start);
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    const next = segs[i + 1];
    const end = Math.min(s.end + 0.6, next ? next.start - 0.05 : s.end + 0.6);
    if (t >= s.start - 0.05 && t <= end) return a4Pack(T.lang).lines.find((l) => l.id === s.line)?.text ?? null;
  }
  return null;
};

export const OneCreator: React.FC<OneCreatorProps> = ({ manifest, subtitles, lang = "ru" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = useMemo(() => buildTimeline(manifest, fps, lang), [manifest, fps, lang]);
  const D = useMemo(() => buildDirection(T), [T]);
  const t = frame / fps;
  const shot = shotAt(D, t);
  const prev = prevShot(D, shot);
  const fadeU = shot.fade ? clamp((t - shot.from) / shot.fade) : 1;
  const o = captionTimes(T, D);
  const sub = subtitles ? subtitleAt(T, t) : null;
  // мягкое затухание изображения в самом конце
  const endFade = clamp((t - (T.total - 0.9)) / 0.9);
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      {prev && fadeU < 1 ? <ShotView shot={prev} T={T} D={D} t={t} /> : null}
      <AbsoluteFill style={{ opacity: fadeU }}>
        <ShotView shot={shot} T={T} D={D} t={t} />
      </AbsoluteFill>
      <Overlays t={t} o={o} subtitle={sub} text={a4Pack(lang).text} />
      {endFade > 0 ? <AbsoluteFill style={{ background: "#F6F1E8", opacity: endFade }} /> : null}
      <A4Audio T={T} D={D} />
    </AbsoluteFill>
  );
};
