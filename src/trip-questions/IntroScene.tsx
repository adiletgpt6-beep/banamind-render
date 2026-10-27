import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, SAFE, TQ_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut, pop } from "../components/anim";
import { Backpack, MorningIcon } from "../morning-rush/icons";
import { DotGrid, Marker, PAPER_SHADOW, drop } from "../founder-story/paper";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { ENTER, MiniFace, NumberBadge, lerpRect, miniRect } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = TQ_TEXT.intro;
const ROAD_Y = SAFE.top + 650;
const HOUSE_X = 180;
const SCHOOL_X = 860;
const CARD_X = [440, 570, 700];
const CARD = { w: 120, h: 160 };

// 0–6 с: рюкзак в центре, дом и школа, три закрытые карточки на дороге.
// Линия маршрута от дома останавливается перед карточками —
// «сначала нужно ответить на вопросы».
export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const timeline = useTimeline();

  const threeAt = Math.max(30, segmentCue(timeline, "tqIntro", "three") - 4);
  const cardsAt = Math.max(24, threeAt - 18);
  const roadAt = cardsAt + 12;
  const markAt = Math.max(
    threeAt + 6,
    wordCue(timeline, "tqIntro", "үч", threeAt + 14),
  );
  const marker = interpolate(frame, [markAt, markAt + 10], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  // дорога от дома до первой карточки — и остановка
  const roadEnd = CARD_X[0] - CARD.w / 2 - 20;
  const road = interpolate(frame, [roadAt, roadAt + 24], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const roadX = HOUSE_X + 70 + (roadEnd - HOUSE_X - 70) * road;
  // лёгкое «покачивание» закрытых карточек, когда линия упёрлась в них
  const nudge = interpolate(
    frame,
    [roadAt + 24, roadAt + 30, roadAt + 38],
    [0, 1, 0],
    clamp,
  );
  const [subA, subB] = T.subtitle.split(" — ");
  // Конец сцены: карточки поднимаются в ряд памятки, остальное уходит —
  // следующая сцена начинается с того же ряда (без пустых кадров).
  const endAt = durationInFrames - ENTER;
  const fly = interpolate(frame, [endAt - 22, endAt], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const subDrop = drop(frame, threeAt, 0, 40);
  const restOpacity = interpolate(
    frame,
    [endAt - 22, endAt - 8],
    [1, 0],
    clamp,
  );

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <AbsoluteFill style={{ opacity: restOpacity }}>
        {/* заголовок — с первого кадра */}
        <div
          style={{
            position: "absolute",
            top: SAFE.top + 10,
            left: SAFE.left,
            right: SAFE.left,
            textAlign: "center",
            fontSize: 112,
            fontWeight: 900,
            scale: `${interpolate(frame, [0, 10], [0.96, 1], { ...clamp, easing: easeOut })}`,
          }}
        >
          {T.title}
        </div>

        {/* рюкзак в центре */}
        <div
          style={{
            position: "absolute",
            left: 540 - 140,
            top: SAFE.top + 200,
            filter: "drop-shadow(0 22px 36px rgba(20, 40, 90, 0.22))",
            scale: `${interpolate(pop(frame, fps, 0), [0, 1], [0.7, 1])}`,
          }}
        >
          <Backpack size={280} />
        </div>

        {/* дорога: от дома — до карточек */}
        <svg
          width={1080}
          height={60}
          viewBox="0 0 1080 60"
          style={{ position: "absolute", left: 0, top: ROAD_Y - 30 }}
        >
          <line
            x1={HOUSE_X + 70}
            y1={30}
            x2={SCHOOL_X - 70}
            y2={30}
            stroke={COLORS.block}
            strokeWidth={14}
            strokeDasharray="4 22"
            strokeLinecap="round"
          />
          {road > 0 ? (
            <line
              x1={HOUSE_X + 70}
              y1={30}
              x2={roadX}
              y2={30}
              stroke={COLORS.navy}
              strokeWidth={16}
              strokeLinecap="round"
            />
          ) : null}
        </svg>

        {/* дом и школа */}
        {[
          { x: HOUSE_X, kind: "home" as const, at: 8 },
          { x: SCHOOL_X, kind: "school" as const, at: 14 },
        ].map((p) => (
          <div
            key={p.kind}
            style={{
              position: "absolute",
              left: p.x - 75,
              top: ROAD_Y - 75,
              width: 150,
              height: 150,
              borderRadius: "50%",
              backgroundColor:
                p.kind === "school" ? COLORS.yellow : COLORS.white,
              border: `7px solid ${COLORS.navy}`,
              boxSizing: "border-box",
              boxShadow: PAPER_SHADOW,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: `${interpolate(pop(frame, fps, p.at), [0, 1], [0.5, 1])}`,
              opacity: interpolate(frame, [p.at, p.at + 5], [0, 1], clamp),
            }}
          >
            <MorningIcon kind={p.kind} size={84} />
          </div>
        ))}
      </AbsoluteFill>

      {/* три закрытые карточки */}
      {CARD_X.map((x, i) => {
        const r = lerpRect(
          { x: x - CARD.w / 2, y: ROAD_Y - CARD.h / 2, w: CARD.w, h: CARD.h },
          miniRect(i),
          fly,
        );
        const d = drop(frame, cardsAt + i * 5, [-4, 2, -2][i], 50);
        return (
          <div
            key={x}
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              boxSizing: "border-box",
              borderRadius: 18 + 2 * fly,
              backgroundColor: COLORS.yellow,
              border: `5px solid ${fly > 0.5 ? COLORS.yellow : COLORS.white}`,
              boxShadow: PAPER_SHADOW,
              ...d,
              rotate: fly > 0 ? `${[-4, 2, -2][i] * (1 - fly)}deg` : d.rotate,
              marginLeft: i === 0 ? nudge * 8 : 0,
            }}
          >
            {fly < 0.5 ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <NumberBadge n={i + 1} size={70} inverted />
                <div style={{ fontSize: 46, fontWeight: 900 }}>?</div>
              </div>
            ) : (
              <MiniFace index={i} closed />
            )}
          </div>
        );
      })}

      {/* «Адегенде — үч суроо» */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top + 860,
          left: SAFE.left,
          right: SAFE.left,
          textAlign: "center",
          fontSize: 84,
          fontWeight: 900,
          lineHeight: 1.1,
          ...subDrop,
          opacity: Number(subDrop.opacity ?? 1) * restOpacity,
        }}
      >
        {subA} —{" "}
        {subB.split(" ").map((w, i) => (
          <span key={i}>
            {w === T.highlight ? (
              <Marker progress={marker}>{w}</Marker>
            ) : (
              w
            )}{" "}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
