// Мини-фильм 80-1-11 «А если я ошибусь?»: шкала из манифеста озвучки →
// хореография и монтажный план → один непрерывный стейдж (состояние любого
// кадра определяется номером кадра). Звук — FilmAudio, субтитры — встроенные
// (prop subtitles) и отдельный SRT (scripts/lesson80-1-11-srt.mjs).
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { SceneContext, TimelineContext } from "../core/context";
import type { Manifest } from "../core/timing";
import { FPS } from "../core/video";
import { FilmAudio } from "./FilmAudio";
import { FILM } from "./script";
import { buildShots, shotAt, type ShotSpec } from "./shots";
import { CardView, RoomShot, useChoreo } from "./stage";
import { Subtitles } from "./Subtitles";
import { buildTimeline, type L80Timeline } from "./timeline";

// diag — диагностические подписи ID персонажей (только для проверки состава).
export type FilmProps = { readonly manifest: Manifest; readonly subtitles?: boolean; readonly diag?: boolean };

export const Film: React.FC<FilmProps> = ({ manifest, subtitles = true, diag = false }) => {
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  const ch = useChoreo(tl);
  const shots = useMemo(() => buildShots(tl, ch), [tl, ch]);
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: 0, len: tl.durationInFrames }}>
        <AbsoluteFill style={{ backgroundColor: "#F1E7D6" }}>
          <Sequence name="Фильм" durationInFrames={tl.durationInFrames}>
            <Stage tl={tl} shots={shots} diag={diag} />
          </Sequence>
          {subtitles ? <Subtitles tl={tl} /> : null}
          <FilmAudio tl={tl} ch={ch} />
        </AbsoluteFill>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};

const Stage: React.FC<{ readonly tl: L80Timeline; readonly shots: readonly ShotSpec[]; readonly diag: boolean }> = ({ tl, shots, diag }) => {
  const f = useCurrentFrame();
  const ch = useChoreo(tl);
  const shot = shotAt(shots, f);
  const prev = shots[shots.indexOf(shot) - 1];
  const dissolve = shot.dissolve && prev && f - shot.from < shot.dissolve ? 1 - (f - shot.from) / shot.dissolve : 0;
  const render = (s: ShotSpec, frame: number) => {
    if (s.kind === "card") return <CardView f={frame} ch={ch} finished={s.cardFinished} />;
    const cam = typeof s.cam === "function" ? s.cam(frame) : s.cam!;
    return <RoomShot f={frame} tl={tl} ch={ch} cam={cam} diag={diag} />;
  };
  // мягкое затухание изображения в самом конце (после удержания общего плана)
  const fadeOut = f > tl.durationInFrames - 12 ? (tl.durationInFrames - f) / 12 : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(1, fadeOut)) }}>
      {render(shot, f)}
      {dissolve > 0 ? <AbsoluteFill style={{ opacity: dissolve }}>{render(prev, f)}</AbsoluteFill> : null}
      {shot.title && !diag ? <Title f={f} /> : null}
    </AbsoluteFill>
  );
};

// Небольшая вступительная надпись поверх первого общего плана — над стеной
// по центру, не перекрывает дверь и вход Амира; появляется и исчезает плавно.
const Title: React.FC<{ readonly f: number }> = ({ f }) => {
  const a = f < 10 ? 0 : f < 28 ? (f - 10) / 18 : f < 132 ? 1 : f < 156 ? 1 - (f - 132) / 24 : 0;
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", justifyContent: "center", opacity: a, pointerEvents: "none", fontFamily }}>
      <div style={{ padding: "8px 26px 10px", borderRadius: 16, backgroundColor: "rgba(255,250,240,0.82)", textAlign: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 800, color: "#2A2F45" }}>{FILM.title}</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "#5B6078", marginTop: 2 }}>
          {FILM.lesson} · мини-фильм {FILM.number} · {FILM.productionId}
        </div>
      </div>
    </div>
  );
};

export const filmDuration = (m: Manifest) => buildTimeline(m).durationInFrames;
export { FPS };
