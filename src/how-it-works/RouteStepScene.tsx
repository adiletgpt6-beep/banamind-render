import {
  evolvePath,
  getLength,
  getPointAtLength,
  getTangentAtLength,
} from "@remotion/paths";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ASSETS,
  COLORS,
  HOW_TEXT,
  PHOTO_CROP,
  SAFE,
  type SceneId,
} from "../config";
import { fontFamily } from "../fonts";
import { CarTopView } from "../components/CarTopView";
import { Photo } from "../components/Photo";
import { easeInOut, fadeUp, progress } from "../components/anim";
import { Arrow, Pin } from "../scenes/RouteScene";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { Caption, StepTitle } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Карта 900×500: дом слева внизу, школа справа вверху.
const MAP_W = 900;
const MAP_H = 500;
const HOME = { x: 150, y: 380 };
const SCHOOL = { x: 750, y: 130 };
const TO_SCHOOL = `M ${HOME.x} ${HOME.y} C 330 390, 380 250, 470 250 S 640 130, ${SCHOOL.x} ${SCHOOL.y}`;
const TO_HOME = `M ${SCHOOL.x} ${SCHOOL.y} C 640 130, 560 250, 470 250 S 330 390, ${HOME.x} ${HOME.y}`;

const BLOCKS = [
  [30, 30, 220, 110],
  [290, 40, 200, 90],
  [40, 180, 150, 120],
  [560, 210, 140, 110],
  [740, 240, 130, 100],
  [250, 420, 220, 50],
  [560, 380, 300, 80],
] as const;

// Шевроны вдоль пути — направление движения читается сразу.
const Chevrons: React.FC<{
  readonly path: string;
  readonly opacity: number;
}> = ({ path, opacity }) => {
  const len = getLength(path);
  return (
    <>
      {[0.3, 0.5, 0.7].map((t) => {
        const p = getPointAtLength(path, len * t);
        const tg = getTangentAtLength(path, len * t);
        if (!p || !tg) return null;
        const a = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
        return (
          <path
            key={t}
            d="M -10 -14 L 8 0 L -10 14"
            fill="none"
            stroke={COLORS.navy}
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
            transform={`translate(${p.x} ${p.y}) rotate(${a})`}
          />
        );
      })}
    </>
  );
};

export type RouteStepProps = {
  readonly sceneId: SceneId;
  readonly segment: string;
  readonly n: number;
  readonly direction: "toSchool" | "toHome";
  // Слова озвучки: машина трогается на startWord и приезжает к endWord.
  readonly startWord: string;
  readonly endWord: string;
};

// Шаги 2 и 3: маршрут ҮЙ → МЕКТЕП или МЕКТЕП → ҮЙ и настоящее фото.
export const RouteStepScene: React.FC<RouteStepProps> = ({
  sceneId,
  segment,
  n,
  direction,
  startWord,
  endWord,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const timeline = useTimeline();
  const toSchool = direction === "toSchool";
  const text = toSchool ? HOW_TEXT.toSchool : HOW_TEXT.toHome;
  const path = toSchool ? TO_SCHOOL : TO_HOME;
  const len = getLength(path);

  const stepAt = Math.max(0, segmentCue(timeline, sceneId, segment) - 4);
  const moveStart = Math.max(
    stepAt + 8,
    wordCue(timeline, sceneId, startWord, stepAt + 30),
  );
  const moveEnd = Math.min(
    durationInFrames - 12,
    Math.max(
      moveStart + 30,
      wordCue(timeline, sceneId, endWord, moveStart + 60) + 14,
    ),
  );
  const p = progress(frame, moveStart, moveEnd, easeInOut);
  const at = Math.min(len - 0.01, Math.max(0.01, p * len));
  const point = getPointAtLength(path, at) ?? (toSchool ? HOME : SCHOOL);
  const tangent = getTangentAtLength(path, at) ?? { x: 1, y: 0 };
  const angle = (Math.atan2(tangent.y, tangent.x) * 180) / Math.PI + 90;
  const trail = evolvePath(p, path);
  const arrived = frame >= moveEnd;
  // Пункт назначения виден всегда и «пульсирует», когда машина приехала.
  const arrivalPulse =
    1 +
    0.25 *
      Math.sin(
        Math.PI * interpolate(frame, [moveEnd, moveEnd + 12], [0, 1], clamp),
      );
  const from = toSchool ? HOW_TEXT.route.home : HOW_TEXT.route.school;
  const to = toSchool ? HOW_TEXT.route.school : HOW_TEXT.route.home;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <StepTitle
        n={n}
        title={text.title}
        style={{
          position: "absolute",
          top: SAFE.top + 10,
          left: SAFE.left - 10,
          right: SAFE.left - 10,
          ...fadeUp(frame, 0, 12, 30),
        }}
      />
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 150,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          ...fadeUp(frame, stepAt + 6, 12, 24),
        }}
      >
        <Caption>{text.caption}</Caption>
      </div>

      {/* Карта маршрута */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 270,
          left: (1080 - MAP_W) / 2,
          width: MAP_W,
          height: MAP_H,
          borderRadius: 48,
          overflow: "hidden",
          backgroundColor: COLORS.sky,
          boxShadow: `0 26px 64px ${COLORS.shadow}`,
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        }}
      >
        <svg
          width={MAP_W}
          height={MAP_H}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          style={{ position: "absolute", inset: 0 }}
        >
          {BLOCKS.map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={16}
              fill={COLORS.block}
            />
          ))}
          <path
            d={path}
            fill="none"
            stroke={COLORS.white}
            strokeWidth={40}
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke={COLORS.yellow}
            strokeWidth={20}
            strokeLinecap="round"
            strokeDasharray={trail.strokeDasharray}
            strokeDashoffset={trail.strokeDashoffset}
          />
          <Chevrons
            path={path}
            opacity={interpolate(frame, [6, 16], [0, 0.55], clamp)}
          />
        </svg>

        {/* Направление словами: «ҮЙ → МЕКТЕП» / «МЕКТЕП → ҮЙ» */}
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 22px",
            borderRadius: 999,
            backgroundColor: COLORS.white,
            boxShadow: `0 8px 20px ${COLORS.shadow}`,
            fontSize: 40,
            fontWeight: 900,
          }}
        >
          {from}
          <Arrow color={COLORS.yellow} />
          {to}
        </div>

        <Pin
          x={HOME.x}
          y={HOME.y}
          label={HOW_TEXT.route.home}
          color={COLORS.navy}
          icon="home"
          labelSide="right"
          scale={toSchool ? 1 : arrivalPulse}
        />
        <Pin
          x={SCHOOL.x}
          y={SCHOOL.y}
          label={HOW_TEXT.route.school}
          color={COLORS.yellow}
          icon="school"
          labelSide="left"
          scale={toSchool ? arrivalPulse : 1}
        />
        {/* Пункт назначения подсвечивается, когда машина приехала */}
        <div
          style={{
            position: "absolute",
            left: (toSchool ? SCHOOL.x : HOME.x) - 75,
            top: (toSchool ? SCHOOL.y : HOME.y) - 75,
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: `8px solid ${COLORS.yellow}`,
            boxSizing: "border-box",
            opacity: arrived
              ? interpolate(frame, [moveEnd, moveEnd + 18], [1, 0], clamp)
              : 0,
            scale: interpolate(
              frame,
              [moveEnd, moveEnd + 18],
              [0.6, 1.3],
              clamp,
            ),
          }}
        />

        <div
          style={{
            position: "absolute",
            left: point.x - 25,
            top: point.y - 45,
            width: 50,
            height: 90,
            rotate: `${angle}deg`,
          }}
        >
          <CarTopView size={90} />
        </div>
      </div>

      {/* Настоящее фото: машина (с водителем) или салон */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 800,
          left: (1080 - 900) / 2,
          width: 900,
          height: 420,
          ...fadeUp(frame, stepAt + 10, 16, 40),
        }}
      >
        <Photo
          src={toSchool ? ASSETS.carExterior : ASSETS.carInterior}
          crop={toSchool ? PHOTO_CROP.carExterior : PHOTO_CROP.carInterior}
          width={900}
          height={420}
          zoomStart={0}
          zoomEnd={durationInFrames}
          style={{ left: 0, top: 0 }}
        />
        {toSchool ? (
          <div
            style={{
              position: "absolute",
              right: -10,
              bottom: -26,
              width: 190,
              height: 190,
              borderRadius: "50%",
              overflow: "hidden",
              border: `8px solid ${COLORS.yellow}`,
              boxShadow: `0 14px 34px ${COLORS.shadow}`,
              backgroundColor: COLORS.white,
            }}
          >
            <Img
              src={staticFile(ASSETS.portrait)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "50% 30%",
              }}
            />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
