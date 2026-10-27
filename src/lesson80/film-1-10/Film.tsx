// Мини-фильм 80-1-10 «Наш общий плакат»: шкала из манифеста озвучки → план
// реквизита и лодочки → хореография → монтажный план; три вида: комната (с
// камерой), стол сверху и крупный план лодочки. Состояние любого кадра
// определяется номером кадра. Звук — FilmAudio, субтитры — по prop.
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import { SceneContext, TimelineContext } from "../core/context";
import type { Manifest } from "../core/timing";
import { BoatCloseView, CLOSE } from "./BoatCloseView";
import { BOAT_LENGTH_MM } from "./boatModel";
import { CardFace } from "./drawings";
import { CARD_MM, CARD_UNITS, cellCenter, DESK, POSTER_ON_DESK, posterToDesk } from "./layout";
import { buildBoatPlan, type BoatPlan } from "./boatPlan";
import { buildChoreo, type Choreo } from "./choreo";
import { DESK_CAMS, DeskView } from "./DeskView";
import { FilmAudio } from "./FilmAudio";
import { buildPlan, type Plan } from "./plan";
import { FILM, FILM_TITLE_CARD } from "./script";
import { buildShots, shotAt, type ShotSpec } from "./shots";
import { RoomShot } from "./stage";
import { Subtitles } from "./Subtitles";
import { buildTimeline, type L80Timeline } from "./timeline";

export type FilmProps = { readonly manifest: Manifest; readonly subtitles?: boolean };

export type FilmModel = { readonly tl: L80Timeline; readonly pl: Plan; readonly bp: BoatPlan; readonly ch: Choreo; readonly shots: readonly ShotSpec[] };

export const buildFilm = (manifest: Manifest): FilmModel => {
  const tl = buildTimeline(manifest);
  const pl = buildPlan(tl);
  const bp = buildBoatPlan(tl);
  const ch = buildChoreo(pl, bp);
  const shots = buildShots(tl, pl, (f) => ch.teacher.place(f).x);
  return { tl, pl, bp, ch, shots };
};

export const Film: React.FC<FilmProps> = ({ manifest, subtitles = false }) => {
  const model = useMemo(() => buildFilm(manifest), [manifest]);
  const { tl } = model;
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: 0, len: tl.durationInFrames }}>
        <AbsoluteFill style={{ backgroundColor: "#F1E7D6" }}>
          <Sequence name="Фильм" durationInFrames={tl.durationInFrames}>
            <Stage model={model} />
          </Sequence>
          {subtitles ? <Subtitles tl={tl} /> : null}
          <FilmAudio tl={tl} pl={model.pl} bp={model.bp} />
        </AbsoluteFill>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};

// Карточка дерева — передний план крупного плана лодочки (сцены 5–6). Она
// лежит на листе на 100–170 мм ближе к камере, чем лодочка у дерева
// (DESK.boatByTree), а крупный план снят с высоты стола, поэтому карточка
// видна сильно сокращённой полосой под лодочкой (масштаб — как у лодочки:
// CLOSE.boatW на её длину; глубина — как от края листа до лодочки).
const TreeCardForeground: React.FC = () => {
  const pxPerMm = CLOSE.boatW / BOAT_LENGTH_MM;
  const depthPx = (CLOSE.boatY - CLOSE.sheetEdgeY) / (DESK.boatByTree.y - POSTER_ON_DESK.v0); // px экрана на мм глубины
  const card = posterToDesk(cellCenter(2, 2)); // карточка дерева, мм стола
  const near = card.y + CARD_MM.h / 2 - DESK.boatByTree.y;
  const far = card.y - CARD_MM.h / 2 - DESK.boatByTree.y;
  const w = CARD_MM.w * pxPerMm * 1.06;
  const x = CLOSE.boatX + (card.x - DESK.boatByTree.x) * pxPerMm;
  const y0 = CLOSE.boatY + far * depthPx;
  const h = (near - far) * depthPx;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <rect x={x - w / 2 + 6} y={y0 + 5} width={w} height={h} rx={4} fill="#6B5233" opacity={0.12} />
      <g transform={`translate(${(x - w / 2).toFixed(1)} ${y0.toFixed(1)}) scale(${(w / CARD_UNITS.w).toFixed(4)} ${(h / CARD_UNITS.h).toFixed(4)})`}>
        <CardFace kind="tree" progress={1} uid="boatfg-tree" />
      </g>
    </svg>
  );
};

const renderShot = (s: ShotSpec, f: number, model: FilmModel) => {
  const { pl, bp, ch } = model;
  if (s.kind === "desk") return <DeskView f={f} plan={pl} boat={bp} cam={DESK_CAMS[s.desk ?? "poster"]} uid={`desk-${s.from}`} />;
  if (s.kind === "boat") return <BoatCloseView f={f} plan={bp} foreground={<TreeCardForeground />} />;
  const cam = typeof s.cam === "function" ? s.cam(f) : s.cam!;
  return <RoomShot f={f} pl={pl} bp={bp} ch={ch} cam={cam} />;
};

const Stage: React.FC<{ readonly model: FilmModel }> = ({ model }) => {
  const f = useCurrentFrame();
  const { shots, tl } = model;
  const shot = shotAt(shots, f);
  const prev = shots[shots.indexOf(shot) - 1];
  const dissolve = shot.dissolve && prev && f - shot.from < shot.dissolve ? 1 - (f - shot.from) / shot.dissolve : 0;
  // сжатие времени при наплыве: входящий план показывает уже готовое
  // состояние, уходящий — застывший последний кадр
  const inFrame = shot.freezeFrom !== undefined ? Math.max(f, shot.freezeFrom) : f;
  const fadeOut = f > tl.durationInFrames - 12 ? (tl.durationInFrames - f) / 12 : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(1, fadeOut)) }}>
      {renderShot(shot, inFrame, model)}
      {dissolve > 0 && prev ? <AbsoluteFill style={{ opacity: dissolve }}>{renderShot(prev, Math.min(f, prev.to - 1), model)}</AbsoluteFill> : null}
      <Title f={f} />
    </AbsoluteFill>
  );
};

// Небольшое название поверх вводного общего плана (как в предыдущих мини-фильмах).
const Title: React.FC<{ readonly f: number }> = ({ f }) => {
  const a = f < 18 ? 0 : f < 36 ? (f - 18) / 18 : f < 112 ? 1 : f < 132 ? 1 - (f - 112) / 20 : 0;
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 72, bottom: 72, opacity: a, pointerEvents: "none", fontFamily }}>
      <div style={{ fontSize: 58, fontWeight: 800, color: "#2A2F45", textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}>{FILM_TITLE_CARD.title}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "#5B6078", marginTop: 6 }}>{FILM_TITLE_CARD.sub}</div>
    </div>
  );
};

export const filmDuration = (m: Manifest) => buildTimeline(m).durationInFrames;
export { FILM };
