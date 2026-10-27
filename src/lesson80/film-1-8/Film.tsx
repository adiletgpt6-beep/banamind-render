// Мини-фильм 80-1-8 «А кто создал Аллаха?»: шкала из манифеста озвучки →
// хореография и монтажный план → один непрерывный стейдж (состояние любого
// кадра определяется номером кадра). Звук — FilmAudio, субтитры — по prop.
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { SceneContext, TimelineContext } from "../core/context";
import type { Manifest } from "../core/timing";
import { FPS } from "../core/video";
import { FilmAudio } from "./FilmAudio";
import { FILM } from "./script";
import { buildShots, shotAt, type ShotSpec } from "./shots";
import { Caption, CardView, RoomShot, useChoreo } from "./stage";
import { Subtitles } from "./Subtitles";
import { buildTimeline, type L80Timeline } from "./timeline";

export type FilmProps = { readonly manifest: Manifest; readonly subtitles?: boolean };

export const Film: React.FC<FilmProps> = ({ manifest, subtitles = false }) => {
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  const ch = useChoreo(tl);
  const shots = useMemo(() => buildShots(tl, ch), [tl, ch]);
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: 0, len: tl.durationInFrames }}>
        <AbsoluteFill style={{ backgroundColor: "#F1E7D6" }}>
          <Sequence name="Фильм" durationInFrames={tl.durationInFrames}>
            <Stage tl={tl} shots={shots} />
          </Sequence>
          {subtitles ? <Subtitles tl={tl} /> : null}
          <FilmAudio tl={tl} ch={ch} />
        </AbsoluteFill>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};

const Stage: React.FC<{ readonly tl: L80Timeline; readonly shots: readonly ShotSpec[] }> = ({ tl, shots }) => {
  const f = useCurrentFrame();
  const ch = useChoreo(tl);
  const shot = shotAt(shots, f);
  const prev = shots[shots.indexOf(shot) - 1];
  const dissolve = shot.dissolve && prev && f - shot.from < shot.dissolve ? 1 - (f - shot.from) / shot.dissolve : 0;
  const render = (s: ShotSpec, frame: number) => {
    if (s.kind === "card") return <CardView f={frame} ch={ch} finished={s.cardFinished} />;
    const cam = typeof s.cam === "function" ? s.cam(frame) : s.cam!;
    return <RoomShot f={frame} tl={tl} ch={ch} cam={cam} overlay={s.caption ? <Caption text={s.caption} /> : null} />;
  };
  // мягкий уход изображения в самом конце (после последней реплики)
  const fadeOut = f > tl.durationInFrames - 14 ? (tl.durationInFrames - f) / 14 : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(1, fadeOut)) }}>
      {render(shot, f)}
      {dissolve > 0 ? <AbsoluteFill style={{ opacity: dissolve }}>{render(prev, f)}</AbsoluteFill> : null}
      <Title f={f} />
    </AbsoluteFill>
  );
};

// Небольшой заголовок поверх вводного кадра (как в предыдущих мини-фильмах).
const Title: React.FC<{ readonly f: number }> = ({ f }) => {
  const a = f < 18 ? 0 : f < 36 ? (f - 18) / 18 : f < 140 ? 1 : f < 162 ? 1 - (f - 140) / 22 : 0;
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 72, bottom: 72, opacity: a, pointerEvents: "none", fontFamily }}>
      <div style={{ fontSize: 58, fontWeight: 800, color: "#2A2F45", textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}>{FILM.title}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "#5B6078", marginTop: 6 }}>Урок 1 «Аллах — наш Создатель» · мини-фильм 8 · {FILM.productionId}</div>
    </div>
  );
};

export const filmDuration = (m: Manifest) => buildTimeline(m).durationInFrames;
export { FPS };
