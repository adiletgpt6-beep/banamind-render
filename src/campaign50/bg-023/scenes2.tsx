import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { evolvePath, getPointAtLength, getTangentAtLength, getLength } from "@remotion/paths";
import { fontFamily } from "../../fonts";
import { CarTopView } from "../../components/CarTopView";
import { Brand, Paper, SceneIn, Title, wordAt, type SceneProps } from "./frame";
import { Check, Chip, HouseIcon, KIDS, Kid, Piece, SchoolIcon } from "./parts";
import { EDGES } from "./scenes1";
import { C, PIECE, clamp, ease, lerp, pop } from "./theme";

// ---------- Условный салон: вид через лобовое стекло на задний ряд ----------
const CarFront: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 90, top: 560, width: 840, height: 640 }}>
    <svg width={840} height={640} viewBox="0 0 840 640" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* тень */}
      <ellipse cx={420} cy={620} rx={400} ry={26} fill={C.shadow} />
      {/* колёса */}
      <rect x={70} y={540} width={110} height={80} rx={22} fill={C.navy} />
      <rect x={660} y={540} width={110} height={80} rx={22} fill={C.navy} />
      {/* зеркала */}
      <rect x={-6} y={318} width={78} height={46} rx={16} fill="#fff" stroke={C.navy} strokeWidth={6} />
      <rect x={768} y={318} width={78} height={46} rx={16} fill="#fff" stroke={C.navy} strokeWidth={6} />
      {/* кузов (белый) */}
      <path d="M 150 60 Q 160 20 210 18 L 630 18 Q 680 20 690 60 L 760 330 Q 800 350 806 400 L 806 560 Q 806 590 776 590 L 64 590 Q 34 590 34 560 L 34 400 Q 40 350 80 330 Z" fill="#fff" stroke={C.navy} strokeWidth={7} strokeLinejoin="round" />
      {/* стекло: салон за ним */}
      <path d="M 190 62 L 650 62 L 718 340 L 122 340 Z" fill="#DCEBFA" stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
      {/* фары и решётка */}
      <rect x={70} y={410} width={150} height={56} rx={26} fill={C.yellowSoft} stroke={C.navy} strokeWidth={5} />
      <rect x={620} y={410} width={150} height={56} rx={26} fill={C.yellowSoft} stroke={C.navy} strokeWidth={5} />
      <rect x={300} y={430} width={240} height={40} rx={18} fill="#EEF3FA" stroke={C.navy} strokeWidth={5} />
      <rect x={330} y={500} width={180} height={44} rx={10} fill="#fff" stroke={C.navy} strokeWidth={4} />
    </svg>
    {/* салон внутри стекла */}
    <div style={{ position: "absolute", left: 0, top: 0, width: 840, height: 640, clipPath: "polygon(193px 65px, 647px 65px, 715px 337px, 125px 337px)" }}>{children}</div>
  </div>
);

/** Начала протягивания ремней (с от начала сцены); щелчок — через 0,5 с. */
export const seatBeltTimes = (cue: SceneProps["cue"]): number[] => {
  const t = wordAt(cue, 4, 11); // «орундарга»
  return [t - 0.6, t - 0.1, t + 0.4].map((x) => Math.max(2.2, x));
};

const SEAT_X = [228, 335, 442] as const; // левые края детей (ширина 170) внутри CarFront

export const SeatsScene: React.FC<SceneProps> = ({ cue }) => {
  const f = useCurrentFrame();
  const n = 11;
  const tCond = wordAt(cue, 7, n); // «жүзүндөгү»
  const sit = [0.7, 1.15, 1.6];
  const belts = seatBeltTimes(cue);
  const counter = belts.filter((b) => f / 30 > b + 0.5).length;
  const note = pop(f, Math.max(tCond, belts[2] + 1.2), 16);
  return (
    <SceneIn>
      <Paper />
      <Brand />
      <div style={{ position: "absolute", left: 90, top: 352 }}>
        <Chip size={28} bg={C.yellowSoft}>
          Шарттуу мисал
        </Chip>
      </div>
      <Title top={420} size={56} text={<>Ар бир балага — өз орду жана өз куру</>} />
      <CarFront>
        {/* задний диван */}
        <div style={{ position: "absolute", left: 160, top: 150, width: 520, height: 200, borderRadius: 40, background: "#9DB3D6" }} />
        {SEAT_X.map((x, i) => (
          <div key={`h${i}`} style={{ position: "absolute", left: x + 40, top: 92, width: 90, height: 70, borderRadius: 22, background: "#8AA2C9" }} />
        ))}
        {KIDS.map((k, i) => {
          const p = pop(f, sit[i], 15);
          const belt = ease(f, belts[i], belts[i] + 0.5);
          const blink = Math.floor(f + i * 37) % 110 < 4;
          return (
            <div key={i} style={{ position: "absolute", left: SEAT_X[i] + (i === 1 ? 0 : 0), top: 112 + (1 - p) * 220, opacity: interpolate(p, [0, 0.3], [0, 1], clamp), transform: `scale(0.92)`, transformOrigin: "50% 100%" }}>
              <Kid look={k} belt={belt} blink={blink} smile={0.6 + 0.4 * belt} />
            </div>
          );
        })}
      </CarFront>
      {/* учёт мест */}
      <div style={{ position: "absolute", left: 90, width: 840, top: 1225, display: "flex", gap: 18, justifyContent: "center" }}>
        {["Орун", "Кур", "Бала"].map((label, i) => (
          <Chip key={label} size={34} bg={counter === 3 ? C.yellow : "#fff"}>
            {label}: {i === 2 ? counter : 3} {counter === 3 && <Check size={34} t={1} />}
          </Chip>
        ))}
      </div>
      {/* 4-орун — только если в этой машине есть ещё одно безопасное место */}
      <div style={{ position: "absolute", left: 90, width: 840, top: 1314, display: "flex", justifyContent: "center", opacity: note, transform: `translateY(${(1 - note) * 20}px)` }}>
        <Chip size={28} color={C.navySoft}>
          4-бала — унаада дагы бир коопсуз орун болсо гана
        </Chip>
      </div>
    </SceneIn>
  );
};

// ---------- Полная поездка: ҮЙ → МЕКТЕП → ҮЙ, бесплатная проба, выбор родителей ----------
const HOME = { x: 230, y: 1010 } as const;
const SCHOOL = { x: 810, y: 1010 } as const;
const TO_SCHOOL = `M ${HOME.x + 40} ${HOME.y - 60} C 340 720, 700 720, ${SCHOOL.x - 30} ${SCHOOL.y - 70}`;
const TO_HOME = `M ${SCHOOL.x - 30} ${SCHOOL.y + 60} C 700 1300, 340 1300, ${HOME.x + 40} ${HOME.y + 60}`;

const carAt = (d: string, t: number) => {
  const L = getLength(d);
  const p = getPointAtLength(d, Math.max(0.01, Math.min(L - 0.01, L * t)));
  const g = getTangentAtLength(d, Math.max(0.01, Math.min(L - 0.01, L * t)));
  return { x: p?.x ?? 0, y: p?.y ?? 0, a: (Math.atan2(g?.y ?? 0, g?.x ?? 1) * 180) / Math.PI + 90 };
};

export const TrialScene: React.FC<SceneProps> = ({ cue, dur }) => {
  const f = useCurrentFrame();
  const n = 14;
  const tFree = wordAt(cue, 8, n); // «акысыз»
  const tParent = wordAt(cue, 10, n); // «Улантууну»
  const total = dur / 30;
  const merge = ease(f, 0.1, 1.0);
  const draw1 = ease(f, 0.6, 1.6);
  const draw2 = ease(f, 1.2, 2.2);
  const go1 = ease(f, 1.8, 4.2);
  const go2 = ease(f, 4.8, 7.2);
  const car = go2 > 0 ? carAt(TO_HOME, go2) : carAt(TO_SCHOOL, go1);
  const badge = pop(f, Math.min(tFree - 0.4, total - 3), 15);
  const decide = pop(f, tParent - 0.1, 16);
  const dim = ease(f, tParent - 0.1, tParent + 0.4);
  const S = 120;
  return (
    <SceneIn>
      <Paper />
      <Brand />
      <Title top={360} size={54} text={<>1 толук сапар</>} />
      <div style={{ position: "absolute", left: 90, top: 432 }}>
        <Chip size={40} bg={C.navy} color="#fff">
          ҮЙ → МЕКТЕП → ҮЙ
        </Chip>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.2 * dim }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="bg23route" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={PIECE[0]} />
              <stop offset="0.5" stopColor={PIECE[1]} />
              <stop offset="1" stopColor={PIECE[2]} />
            </linearGradient>
          </defs>
          {[TO_SCHOOL, TO_HOME].map((d, i) => {
            const ev = evolvePath(i === 0 ? draw1 : draw2, d);
            return <path key={i} d={d} fill="none" stroke="url(#bg23route)" strokeWidth={16} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 430, top: 724, opacity: draw1 }}>
          <Chip size={28}>Эртең менен</Chip>
        </div>
        <div style={{ position: "absolute", left: 390, top: 1290, opacity: draw2 }}>
          <Chip size={28}>Сабактан кийин</Chip>
        </div>
        {/* дом: в него «вливаются» три соединённых пазла */}
        <div style={{ position: "absolute", left: HOME.x - 80, top: HOME.y - 80, width: 160, height: 160, borderRadius: 80, background: "#fff", border: `6px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 14px 30px ${C.shadow}` }}>
          <HouseIcon size={104} />
        </div>
        {[0, 1, 2].map((i) => {
          const off = [
            [0, 0],
            [S, 0],
            [0, S],
          ][i];
          return (
            <Piece key={i} x={lerp(HOME.x - S + off[0], HOME.x - S / 2, merge)} y={lerp(HOME.y - S + off[1], HOME.y - S / 2, merge)} size={S} color={PIECE[i]} edges={EDGES[i]} scale={lerp(1, 0.2, merge)} opacity={1 - merge} />
          );
        })}
        <div style={{ position: "absolute", left: SCHOOL.x - 80, top: SCHOOL.y - 80, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <SchoolIcon size={150} />
        </div>
        <div style={{ position: "absolute", left: car.x - 40, top: car.y - 70, transform: `rotate(${car.a}deg)`, opacity: interpolate(f, [52, 60], [0, 1], clamp) }}>
          <CarTopView size={140} />
        </div>
      </div>
      {/* бесплатная проба — только после формирования группы */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 840,
          top: 540,
          padding: "22px 34px",
          borderRadius: 34,
          background: C.yellow,
          border: `5px solid ${C.navy}`,
          fontFamily,
          color: C.navy,
          opacity: badge,
          transform: `scale(${0.9 + 0.1 * badge})`,
          boxShadow: `0 18px 40px ${C.shadow}`,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.1 }}>
          Биринчи толук сыноо сапары — <span style={{ fontSize: 48 }}>АКЫСЫЗ</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 30, marginTop: 6 }}>топ даяр болгондон кийин гана</div>
      </div>
      {/* решение родителей */}
      <div
        style={{
          position: "absolute",
          left: 300,
          width: 460,
          top: 885,
          padding: "26px 24px",
          borderRadius: 40,
          background: "#fff",
          boxShadow: `0 26px 60px ${C.shadow}`,
          fontFamily,
          color: C.navy,
          opacity: decide,
          transform: `translateY(${(1 - decide) * 60}px)`,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 38, lineHeight: 1.15 }}>Улантуу —<br />ата-эненин чечими</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20 }}>
          <div style={{ padding: "12px 22px", borderRadius: 26, background: C.yellow, border: `4px solid ${C.navy}`, fontWeight: 900, fontSize: 30 }}>Улантабыз</div>
          <div style={{ padding: "12px 22px", borderRadius: 26, background: "#fff", border: `4px solid ${C.navy}`, fontWeight: 900, fontSize: 30 }}>Ойлонобуз</div>
        </div>
      </div>
    </SceneIn>
  );
};
