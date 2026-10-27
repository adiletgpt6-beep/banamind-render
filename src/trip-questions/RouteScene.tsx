import { evolvePath } from "@remotion/paths";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, TQ_TEXT } from "../config";
import { fontFamily } from "../fonts";
import { easeInOut, easeOut, pop } from "../components/anim";
import { MorningIcon } from "../morning-rush/icons";
import { DotGrid, Marker } from "../founder-story/paper";
import { useTimeline } from "../TimelineContext";
import { segmentCue, wordCue } from "../timeline";
import { BigCard, ClockFace, MiniRow, PinIcon, useCardOpen } from "./parts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = TQ_TEXT.route;

// Карта внутри карточки (координаты относительно карты 730×380).
const MAP = { x: 40, y: 200, w: 730, h: 380 };
const HOME = { x: 120, y: 250 };
const SCHOOL = { x: 610, y: 250 };
const TO_SCHOOL = `M ${HOME.x} ${HOME.y} C 260 90, 470 90, ${SCHOOL.x} ${SCHOOL.y}`;
const TO_HOME = `M ${SCHOOL.x} ${SCHOOL.y + 20} C 470 360, 260 360, ${HOME.x} ${HOME.y + 20}`;

// 16–29 с: «2. Кайдан? Кайда? Качан?» — карточка раскрывается в карту.
// Дорога соединяет дом и школу, по словам появляются метка адреса,
// школа и часы (без цифр — это не расписание), затем рисуется обратный
// путь. Снизу: «Үй → Мектеп → Үй» и «Дарек • Мектеп • Убакыт».
export const RouteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeline = useTimeline();
  const { ready } = useCardOpen(frame, 1);

  const forwardAt = ready + 4;
  const forward = interpolate(frame, [forwardAt, forwardAt + 26], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const a2 = segmentCue(timeline, "tqRoute", "a2");
  const chipAt = T.chips.map((c, i) =>
    Math.max(
      forwardAt + 20 + i * 12,
      wordCue(timeline, "tqRoute", c.word, a2 + 20 + i * 30) - 4,
    ),
  );
  const backAt = Math.max(
    chipAt[1] + 10,
    wordCue(timeline, "tqRoute", "кайтуу", chipAt[1] + 30) - 4,
  );
  const back = interpolate(frame, [backAt, backAt + 26], [0, 1], {
    ...clamp,
    easing: easeInOut,
  });
  const marks = chipAt.map((at) =>
    interpolate(frame, [at + 2, at + 12], [0, 1], {
      ...clamp,
      easing: easeOut,
    }),
  );
  const fwd = evolvePath(forward, TO_SCHOOL);
  const ret = evolvePath(back, TO_HOME);
  // минутная стрелка «идёт» — время ещё обсуждается
  const minute = (frame - chipAt[2]) * 3;

  return (
    <AbsoluteFill style={{ fontFamily, color: COLORS.navy }}>
      <DotGrid />
      <MiniRow active={1} hide={[1]} />
      <BigCard frame={frame} index={1}>
        <div
          style={{
            position: "absolute",
            left: MAP.x,
            top: MAP.y,
            width: MAP.w,
            height: MAP.h,
            borderRadius: 30,
            backgroundColor: COLORS.sky,
            overflow: "hidden",
          }}
        >
          <svg
            width={MAP.w}
            height={MAP.h}
            viewBox={`0 0 ${MAP.w} ${MAP.h}`}
            style={{ position: "absolute", inset: 0 }}
          >
            <path
              d={TO_SCHOOL}
              fill="none"
              stroke={COLORS.white}
              strokeWidth={34}
              strokeLinecap="round"
            />
            <path
              d={TO_SCHOOL}
              fill="none"
              stroke={COLORS.navy}
              strokeWidth={16}
              strokeLinecap="round"
              strokeDasharray={fwd.strokeDasharray}
              strokeDashoffset={fwd.strokeDashoffset}
            />
            <path
              d={TO_HOME}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={ret.strokeDasharray}
              strokeDashoffset={ret.strokeDashoffset}
            />
          </svg>
          {/* дом и школа */}
          {[
            { p: HOME, kind: "home" as const, at: ready },
            {
              p: SCHOOL,
              kind: "school" as const,
              at: Math.max(ready + 6, chipAt[1] - 2),
            },
          ].map(({ p, kind, at }) => (
            <div
              key={kind}
              style={{
                position: "absolute",
                left: p.x - 62,
                top: p.y - 62,
                width: 124,
                height: 124,
                borderRadius: "50%",
                backgroundColor:
                  kind === "school" ? COLORS.yellow : COLORS.white,
                border: `6px solid ${COLORS.navy}`,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scale: `${interpolate(pop(frame, fps, at), [0, 1], [0.5, 1])}`,
                opacity: interpolate(frame, [at, at + 5], [0, 1], clamp),
              }}
            >
              <MorningIcon kind={kind} size={70} />
            </div>
          ))}
          {/* метка адреса над домом */}
          <div
            style={{
              position: "absolute",
              left: HOME.x - 30,
              top: HOME.y - 150,
              scale: `${pop(frame, fps, chipAt[0])}`,
              transformOrigin: "50% 100%",
            }}
          >
            <PinIcon size={60} />
          </div>
          {/* часы над дорогой */}
          <div
            style={{
              position: "absolute",
              left: (HOME.x + SCHOOL.x) / 2 - 50,
              top: 40,
              scale: `${pop(frame, fps, chipAt[2])}`,
            }}
          >
            <ClockFace
              size={100}
              hour={240}
              minute={minute}
              ring={COLORS.yellow}
            />
          </div>
        </div>

        {/* «Үй → Мектеп → Үй» */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 620,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
            fontSize: 66,
            fontWeight: 900,
          }}
        >
          {T.path.map((w, i) => {
            const at =
              i === 0 ? ready + 4 : i === 1 ? forwardAt + 22 : backAt + 20;
            const o = interpolate(frame, [at, at + 8], [0, 1], clamp);
            return (
              <span
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  opacity: o,
                }}
              >
                {i > 0 ? (
                  <svg width="60" height="44" viewBox="0 0 60 44">
                    <path
                      d="M4 22 H52 M36 6 L54 22 L36 38"
                      fill="none"
                      stroke={i === 2 ? COLORS.yellow : COLORS.navy}
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
                {w}
              </span>
            );
          })}
        </div>

        {/* «Дарек • Мектеп • Убакыт» */}
        <div
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: 790,
            textAlign: "center",
            fontSize: 50,
            fontWeight: 900,
          }}
        >
          {T.chips.map((c, i) => (
            <span
              key={c.text}
              style={{
                opacity: interpolate(
                  frame,
                  [chipAt[i], chipAt[i] + 6],
                  [0, 1],
                  clamp,
                ),
              }}
            >
              {i > 0 ? <span style={{ color: COLORS.yellow }}> • </span> : null}
              <Marker progress={marks[i]}>{c.text}</Marker>
            </span>
          ))}
        </div>
      </BigCard>
    </AbsoluteFill>
  );
};
