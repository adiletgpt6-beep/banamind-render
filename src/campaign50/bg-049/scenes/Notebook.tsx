// Сцена 2 (≈6–19 с): жёлтая линия ложится краем настоящего блокнота.
// Мама вслух формулирует вопрос и сама записывает: «Күн сайын мектеп
// жолу»; сверху — неделя, где одна и та же задача повторяется каждый день.
// Решение не отмахиваться: линия обводит запись, мама кивает, появляется
// стикер «Алдын ала уюштуруу».
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import {
  appear,
  blink,
  breathe,
  clamp,
  easeInOut,
  easeOut,
  lerp,
} from "../anim";
import { useMouth, useScene, useTimeline } from "../context";
import { MOM_DESK, NOTE } from "../layout";
import { C, STROKE } from "../palette";
import { WritingHand } from "../parts/hands";
import { Mom } from "../parts/Mom";
import { Chip, HouseIcon, Paper, SchoolIcon } from "../parts/ui";
import { BG49_TEXT, BG49_VIDEO } from "../script";
import { cueOf, wordTime } from "../timing";

const FPS = BG49_VIDEO.fps;

// Общее состояние сцены (кадр, ручка, решение) — для сцены и переднего плана.
const useNotebook = () => {
  const f = useCurrentFrame();
  const { from, frames } = useScene();
  const tl = useTimeline();
  const t = BG49_TEXT.notebook;
  const cue = cueOf(tl, "m01");
  const lf = (sec: number) => Math.round(sec * FPS) - from;
  const speakFrom = lf(cue.from);
  const speakTo = lf(cue.to);
  const writeFrom = speakFrom + 12;
  const writeTo = Math.max(writeFrom + 60, speakTo - 6);
  const decide = Math.min(speakTo + 15, frames - 72);
  const capAt = Math.max(lf(wordTime(tl, "m01", 3)), 20);
  const p = easeInOut((f - writeFrom) / (writeTo - writeFrom));
  const writing = f >= writeFrom && f <= writeTo;
  const mouth = useMouth("mother");
  // камера: стол поднимается снизу (продолжение отъезда из сцены 1)
  const desk = easeOut(f / 18);
  const deskY = (1 - desk) * 260;
  // кивок решения
  const nod = Math.sin(clamp((f - decide) / 18) * Math.PI) * 5;
  const lookDown = writing
    ? 1
    : f > writeTo
      ? 1 - appear(f, writeTo + 4, 12) * 0.6
      : appear(f, writeFrom - 10, 10);
  const tipX = NOTE.textX + p * NOTE.textW;
  const tipY =
    NOTE.textY -
    6 +
    (writing ? Math.sin(f * 1.9) * 7 + Math.sin(f * 0.7) * 3 : 0);
  const tap =
    f > decide + 8 && f < decide + 30
      ? Math.abs(Math.sin((f - decide) * 0.45)) * 6
      : 0;
  const pen =
    f < writeFrom
      ? { x: NOTE.textX - 10, y: NOTE.textY + 30 }
      : f > writeTo
        ? {
            x: lerp(tipX, tipX + 40, appear(f, writeTo, 12)),
            y: NOTE.textY + 34 * appear(f, writeTo, 12),
          }
        : { x: tipX, y: tipY };
  const days = t.days;
  const loopK = Math.floor(Math.max(0, f - capAt) / 8);
  return {
    f,
    t,
    writeFrom,
    writeTo,
    decide,
    capAt,
    p,
    mouth,
    deskY,
    nod,
    lookDown,
    tap,
    pen,
    days,
    loopK,
  };
};

export const NotebookScene: React.FC = () => {
  const { f, t, decide, capAt, p, mouth, deskY, nod, lookDown, days, loopK } =
    useNotebook();
  return (
    <>
      <Paper />
      {/* неделя: одна и та же задача каждый день */}
      <Chip x={540} y={262} f={f} at={capAt} tone="navy" size={42}>
        {t.caption}
      </Chip>
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 360,
          width: 760,
          display: "flex",
          gap: 14,
        }}
      >
        {days.map((d, i) => {
          const k = appear(f, capAt + 6 + i * 3, 10);
          const active = f >= capAt + 10 && loopK % 6 === i && f < decide;
          const done = f >= decide + 10;
          return (
            <div
              key={d}
              style={{
                width: 140,
                height: 112,
                borderRadius: 24,
                border: `${STROKE}px solid ${C.navy}`,
                backgroundColor: active || done ? C.yellowSoft : "#FFFFFF",
                boxShadow: active
                  ? `0 0 0 6px ${C.yellow}`
                  : "0 8px 18px rgba(20,40,90,0.08)",
                opacity: k,
                transform: `translateY(${(1 - k) * 24}px) scale(${active ? 1.05 : 1})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                fontFamily,
                color: C.navy,
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>
                {d}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {/* полный день: үй → мектеп → үй */}
                <HouseIcon size={30} />
                <svg width={14} height={14} viewBox="0 0 20 20">
                  <path
                    d="M 2 10 L 16 10 M 11 5 L 16 10 L 11 15"
                    fill="none"
                    stroke={C.navy}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <SchoolIcon size={30} />
                <svg width={14} height={14} viewBox="0 0 20 20">
                  <path
                    d="M 2 10 L 16 10 M 11 5 L 16 10 L 11 15"
                    fill="none"
                    stroke={C.navy}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <HouseIcon size={30} />
              </div>
            </div>
          );
        })}
      </div>
      <Mom
        uid="desk"
        x={MOM_DESK.x}
        y={MOM_DESK.y + deskY * 0.15}
        s={MOM_DESK.s}
        tilt={lerp(-3, 4, lookDown) + nod + breathe(f, 120, 0.8)}
        look={[lerp(0.15, -0.05, lookDown), lerp(-0.25, 0.95, lookDown)]}
        brow={f > decide ? 0.3 : 0.65}
        smile={f > decide ? 0.15 + 0.55 * appear(f, decide, 14) : 0.1}
        mouth={mouth}
        eyes={lookDown > 0.8 ? Math.max(0.55, blink(f, 15)) : blink(f, 15)}
        lean={breathe(f, 140, 2)}
      />
      {/* стол и блокнот */}
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <g transform={`translate(0 ${deskY})`}>
          <rect x={-20} y={1036} width={1120} height={900} fill={C.wood} />
          <rect x={-20} y={1036} width={1120} height={14} fill={C.woodShade} />
          <path
            d={`M ${NOTE.left} ${NOTE.top} L ${NOTE.right} ${NOTE.top} L ${NOTE.bottomRight} ${NOTE.bottom} L ${NOTE.bottomLeft} ${NOTE.bottom} Z`}
            fill="rgba(20,40,90,0.12)"
            transform="translate(10 12)"
          />
          <path
            d={`M ${NOTE.left} ${NOTE.top} L ${NOTE.right} ${NOTE.top} L ${NOTE.bottomRight} ${NOTE.bottom} L ${NOTE.bottomLeft} ${NOTE.bottom} Z`}
            fill="#FFFFFF"
            stroke={C.navy}
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          {NOTE.rules.map((ry) => {
            const u = (ry - NOTE.top) / (NOTE.bottom - NOTE.top);
            return (
              <path
                key={ry}
                d={`M ${lerp(NOTE.left, NOTE.bottomLeft, u) + 22} ${ry} L ${lerp(NOTE.right, NOTE.bottomRight, u) - 22} ${ry}`}
                stroke={C.rule}
                strokeWidth={3}
              />
            );
          })}
          <path
            d={`M ${NOTE.left + 64} ${NOTE.top + 8} L ${NOTE.bottomLeft + 70} ${NOTE.bottom - 6}`}
            stroke="#F4C9BD"
            strokeWidth={3}
          />
        </g>
      </svg>
      {/* рукописная строка: проявляется вслед за ручкой */}
      <div
        style={{
          position: "absolute",
          left: NOTE.textX,
          top: NOTE.textY - 62 + deskY,
          width: NOTE.textW + 60,
          height: 90,
          clipPath: `inset(0 ${100 - clamp(p * 1.04) * 100}% 0 0)`,
          fontFamily,
          fontSize: 50,
          fontWeight: 700,
          color: "#1E3570",
          transform: "skewX(-9deg)",
          whiteSpace: "nowrap",
          letterSpacing: 0.5,
        }}
      >
        {t.note}
      </div>
      {/* решение: стикер на листе */}
      <div
        style={{
          position: "absolute",
          left: 440,
          top: 1236 + deskY,
          opacity: appear(f, decide + 24, 10),
          transform: `rotate(-4deg) scale(${0.8 + 0.2 * appear(f, decide + 24, 12)})`,
          padding: "12px 24px",
          backgroundColor: C.yellow,
          borderRadius: 14,
          boxShadow: "0 10px 20px rgba(20,40,90,0.18)",
          fontFamily,
          fontSize: 36,
          fontWeight: 900,
          color: C.navy,
          whiteSpace: "nowrap",
        }}
      >
        {t.plan} ✓
      </div>
    </>
  );
};

// Передний план (над жёлтой линией): пишущая рука мамы.
export const NotebookFront: React.FC = () => {
  const { pen, tap, deskY } = useNotebook();
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <g transform={`translate(0 ${deskY})`}>
        {/* левая рука мамы спокойно лежит на листе (над краем-линией,
            в стороне от рукописной строки) */}
        <path
          d="M 310 985 Q 200 1100 180 1290"
          fill="none"
          stroke={C.navy}
          strokeWidth={86}
          strokeLinecap="round"
        />
        <path
          d="M 310 985 Q 200 1100 180 1290"
          fill="none"
          stroke={C.cardigan}
          strokeWidth={77}
          strokeLinecap="round"
        />
        <ellipse
          cx={186}
          cy={1316}
          rx={44}
          ry={32}
          transform="rotate(20 186 1316)"
          fill={C.skin}
          stroke={C.navy}
          strokeWidth={STROKE}
        />
        <path
          d="M 206 1332 l 24 12 M 212 1318 l 26 8"
          stroke={C.skinShade}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <WritingHand x={pen.x} y={pen.y} sx={760} sy={975} press={tap} />
      </g>
    </svg>
  );
};
