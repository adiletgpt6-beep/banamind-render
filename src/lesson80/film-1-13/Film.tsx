// Мини-фильм 80-1-13 «А Аллах видел?»: шкала из манифеста озвучки →
// хореография и монтажный план → один непрерывный стейдж (состояние любого
// кадра определяется номером кадра). Звук — FilmAudio, субтитры — по prop
// (в серии по умолчанию выключены; SRT собирается отдельно).
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { SceneContext, TimelineContext } from "../core/context";
import type { Manifest } from "../core/timing";
import { FPS } from "../core/video";
import { RigStyleContext } from "../rig/style";
import type { Choreo } from "./choreo";
import { FilmAudio } from "./FilmAudio";
import { FILM } from "./script";
import { buildShots, shotAt, type ShotSpec } from "./shots";
import { RoomShot, TopView, useChoreo } from "./stage";
import { Subtitles } from "./Subtitles";
import { buildTimeline, type L80Timeline } from "./timeline";

// уточнённый рисунок лиц (как в 80-1-12)
const REFINED = { refined: true } as const;

export type FilmProps = { readonly manifest: Manifest; readonly subtitles?: boolean };

export const Film: React.FC<FilmProps> = ({ manifest, subtitles = false }) => {
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  const ch = useChoreo(tl);
  const shots = useMemo(() => buildShots(tl), [tl]);
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: 0, len: tl.durationInFrames }}>
        <RigStyleContext.Provider value={REFINED}>
          <AbsoluteFill style={{ backgroundColor: "#F1E7D6" }}>
            <Sequence name="Фильм" durationInFrames={tl.durationInFrames}>
              <Stage tl={tl} ch={ch} shots={shots} />
            </Sequence>
            {subtitles ? <Subtitles tl={tl} /> : null}
            <FilmAudio tl={tl} ch={ch} />
          </AbsoluteFill>
        </RigStyleContext.Provider>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};

const Stage: React.FC<{ readonly tl: L80Timeline; readonly ch: Choreo; readonly shots: readonly ShotSpec[] }> = ({ tl, ch, shots }) => {
  const f = useCurrentFrame();
  const shot = shotAt(shots, f);
  const prev = shots[shots.indexOf(shot) - 1];
  const dissolve = shot.dissolve && prev && f - shot.from < shot.dissolve ? 1 - (f - shot.from) / shot.dissolve : 0;
  const render = (s: ShotSpec, frame: number) => {
    if (s.kind === "top") {
      const t = typeof s.top === "function" ? s.top(frame) : s.top!;
      return <TopView f={frame} ch={ch} cam={t} />;
    }
    const cam = typeof s.cam === "function" ? s.cam(frame) : s.cam!;
    return <RoomShot f={frame} ch={ch} cam={cam} />;
  };
  // мягкий уход изображения в самом конце (после последней паузы общего плана)
  const fadeOut = f > tl.durationInFrames - 14 ? (tl.durationInFrames - f) / 14 : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(1, fadeOut)) }}>
      {render(shot, f)}
      {dissolve > 0 ? <AbsoluteFill style={{ opacity: dissolve }}>{render(prev, f)}</AbsoluteFill> : null}
      <Title f={f} />
    </AbsoluteFill>
  );
};

// Небольшое название поверх вводного общего плана (2–3 с, как в серии); не
// закрывает ни полку, ни книжку.
const Title: React.FC<{ readonly f: number }> = ({ f }) => {
  const a = f < 10 ? 0 : f < 26 ? (f - 10) / 16 : f < 82 ? 1 : f < 100 ? 1 - (f - 82) / 18 : 0;
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 860, top: 486, opacity: a, pointerEvents: "none", fontFamily }}>
      <div style={{ fontSize: 58, fontWeight: 800, color: "#2A2F45", textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}>{FILM.title}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "#5B6078", marginTop: 6 }}>Урок 1 «Аллах — наш Создатель»</div>
    </div>
  );
};

export const filmDuration = (m: Manifest) => buildTimeline(m).durationInFrames;
export { FPS };
