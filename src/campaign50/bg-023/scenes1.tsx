import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { fontFamily } from "../../fonts";
import { Brand, Paper, SceneIn, Title, Underline, wordAt, type SceneProps } from "./frame";
import { Check, Chip, ClockIcon, HouseIcon, Piece, PinIcon, SchoolIcon, type Edges } from "./parts";
import { C, PIECE, clamp, ease, lerp, pop } from "./theme";

// Сетка 2×2: 1-2 сверху, 3-4 снизу. Край каждого пазла дополняет соседа.
export const EDGES: readonly Edges[] = [
  [0, 1, 1, 0],
  [0, 0, 1, -1],
  [-1, 1, 0, 0],
  [-1, 0, 0, -1],
];
export const TIMES = ["7:30", "7:35", "7:30", "8:40"] as const;

const PieceLabel: React.FC<{ readonly n: number; readonly time?: string; readonly size: number }> = ({ n, time, size }) => (
  <>
    <HouseIcon size={size * 0.42} />
    <div style={{ fontWeight: 900, fontSize: size * 0.15, color: C.navy, marginTop: 2 }}>Үй {n}</div>
    {time && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: size * 0.12, color: C.navy }}>
        <ClockIcon size={size * 0.12} /> {time}
      </div>
    )}
  </>
);

// ---------- 1. Хук: пазлы пытаются сойтись ----------
export const HookScene: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const S = 250;
  const gx = 290;
  const gy = 760;
  const homes = [
    { x: gx, y: gy, from: [-420, -260, -30], at: 0.25 },
    { x: gx + S, y: gy, from: [520, -320, 25], at: 0.55 },
    { x: gx, y: gy + S, from: [-460, 380, 20], at: 0.85 },
  ];
  // «почти сошлись»: небольшие зазоры и наклоны — маршрут ещё не собран
  const near = [
    [-16, -14, -4],
    [16, -10, 3],
    [-12, 16, 2],
  ];
  const t4 = f / 30;
  // четвёртый пазл-вопрос: парит, пробует подойти к пазу и возвращается
  const tryIn = interpolate(t4, [2.4, 3.3, 4.1, 5.0], [0, 1, 1, 0.15], { ...clamp });
  const qx = lerp(700, gx + S + 26, tryIn * 0.82) + Math.sin(t4 * 2.2) * 10;
  const qy = lerp(470, gy + S + 30, tryIn * 0.82) + Math.cos(t4 * 2.6) * 12;
  const qr = lerp(16, 7, tryIn) + Math.sin(t4 * 3) * 5;
  const q = pop(f, 1.2);
  const ul = ease(f, 0.6, 1.3);
  return (
    <SceneIn>
      <Paper />
      <Brand />
      <Title
        top={370}
        size={78}
        text={
          <>
            Эмне үчүн
            <br />
            чакан топ?
            <Underline t={ul} width={420} />
          </>
        }
      />
      {homes.map((h, i) => {
        const p = pop(f, h.at, 13);
        const [dx, dy, dr] = h.from;
        const [nx, ny, nr] = near[i];
        return (
          <Piece key={i} x={h.x + lerp(dx, nx, p)} y={h.y + lerp(dy, ny, p) + Math.sin(t4 * 1.6 + i) * 3} size={S} color={PIECE[i]} edges={EDGES[i]} rot={lerp(dr, nr, p)} opacity={interpolate(p, [0, 0.2], [0, 1], clamp)}>
            <PieceLabel n={i + 1} size={S} />
          </Piece>
        );
      })}
      <Piece x={qx} y={qy} size={S} color={PIECE[3]} edges={EDGES[3]} rot={qr} scale={0.6 + 0.4 * q} opacity={q} lift={10}>
        <div style={{ fontWeight: 900, fontSize: 130, color: C.navy, lineHeight: 1 }}>?</div>
      </Piece>
    </SceneIn>
  );
};

// ---------- 2. Карта: дома, школа, время ----------
const MAP = { x: 70, y: 330, w: 900, h: 820 } as const;
const SCHOOL = { x: 440, y: 250 } as const;
const HOMES = [
  { x: 190, y: 520 },
  { x: 380, y: 640 },
  { x: 640, y: 540 },
  { x: 720, y: 690 },
] as const;
const ROUTES = [
  `M ${HOMES[0].x} ${HOMES[0].y} C 190 420, 300 360, ${SCHOOL.x - 30} ${SCHOOL.y + 70}`,
  `M ${HOMES[1].x} ${HOMES[1].y} C 400 520, 430 440, ${SCHOOL.x} ${SCHOOL.y + 80}`,
  `M ${HOMES[2].x} ${HOMES[2].y} C 640 430, 560 370, ${SCHOOL.x + 35} ${SCHOOL.y + 70}`,
];
const AWAY = `M ${HOMES[3].x} ${HOMES[3].y} C 800 740, 860 770, 905 780`;

const MapBase: React.FC = () => (
  <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", left: 0, top: 0 }}>
    <rect width={MAP.w} height={MAP.h} rx={44} fill="#EDF3FA" />
    {/* кварталы */}
    {[0, 1, 2, 3].map((r) =>
      [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={30 + c * 220} y={290 + r * 132} width={190} height={110} rx={18} fill={C.block} />),
    )}
    {/* парк */}
    <ellipse cx={540} cy={760} rx={110} ry={44} fill={C.park} />
    <circle cx={505} cy={754} r={12} fill="#9ED9B8" />
    <circle cx={570} cy={768} r={15} fill="#9ED9B8" />
    {/* горы Ала-Тоо на горизонте */}
    <path d="M 0 170 L 110 70 L 190 130 L 300 40 L 400 120 L 520 30 L 640 125 L 760 55 L 900 150 L 900 210 L 0 210 Z" fill={C.mountain} />
    <path d="M 270 66 L 300 40 L 330 66 L 312 60 L 300 70 Z M 490 56 L 520 30 L 552 58 L 532 52 L 520 62 Z M 735 78 L 760 55 L 786 78 Z" fill="#fff" />
    <rect x={0} y={200} width={MAP.w} height={22} fill="#fff" />
  </svg>
);

export const MapScene: React.FC<SceneProps> = ({ cue }) => {
  const f = useCurrentFrame();
  const n = 17;
  const tAddr = wordAt(cue, 9, n);
  const tSchool = wordAt(cue, 10, n);
  const tTime = wordAt(cue, 13, n);
  const card = ease(f, 0, 0.6);
  return (
    <SceneIn>
      <Paper />
      <Brand />
      <div style={{ position: "absolute", left: MAP.x, top: MAP.y, width: MAP.w, height: MAP.h, transform: `translateY(${(1 - card) * 40}px)`, opacity: card, borderRadius: 44, boxShadow: `0 24px 60px ${C.shadow}` }}>
        <MapBase />
        <div style={{ position: "absolute", left: 28, top: 26 }}>
          <Chip size={30}>
            <PinIcon size={30} /> Бишкек
          </Chip>
        </div>
        <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {ROUTES.map((d, i) => {
            const t = ease(f, 3.0 + i * 0.5, 4.6 + i * 0.5);
            const ev = evolvePath(t, d);
            return <path key={i} d={d} fill="none" stroke={PIECE[i]} strokeWidth={12} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} opacity={0.95} />;
          })}
          {(() => {
            const t = ease(f, 4.8, 6.2);
            const ev = evolvePath(t, AWAY);
            return <path d={AWAY} fill="none" stroke={C.coral} strokeWidth={10} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} opacity={0.8} />;
          })()}
        </svg>
        {/* школа */}
        {(() => {
          const p = pop(f, 0.4);
          return (
            <div style={{ position: "absolute", left: SCHOOL.x - 75, top: SCHOOL.y - 80, transform: `scale(${p})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <SchoolIcon size={150} />
              <Chip size={28} bg={C.navy} color="#fff" style={{ marginTop: -4 }}>
                МЕКТЕП
              </Chip>
            </div>
          );
        })()}
        {/* дома */}
        {HOMES.map((h, i) => {
          const p = pop(f, 0.9 + i * 0.35);
          const tag = pop(f, 2.0 + i * 0.3);
          return (
            <div key={i} style={{ position: "absolute", left: h.x - 60, top: h.y - 60, width: 120, transform: `scale(${p})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, background: PIECE[i], border: `5px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 24px ${C.shadow}` }}>
                <HouseIcon size={78} />
              </div>
              <div style={{ transform: `scale(${tag})`, marginTop: 8 }}>
                <Chip size={28}>
                  <ClockIcon size={28} /> {TIMES[i]}
                </Chip>
              </div>
            </div>
          );
        })}
        {/* четвёртый дом: в другую сторону, нейтрально */}
        <div style={{ position: "absolute", left: 545, top: 806, opacity: ease(f, 6.0, 6.6) }}>
          <Chip size={26} bg="#fff" color={C.navySoft}>
            башка мектепке • 8:40
          </Chip>
        </div>
      </div>
      {/* критерии совпадения */}
      <Criteria at={[tAddr, tSchool, tTime]} />
    </SceneIn>
  );
};

export const Criteria: React.FC<{ readonly at: readonly number[]; readonly top?: number }> = ({ at, top = 1200 }) => {
  const f = useCurrentFrame();
  const items = [
    { icon: <PinIcon size={34} />, label: "Дарек" },
    { icon: <SchoolIcon size={38} />, label: "Мектеп" },
    { icon: <ClockIcon size={34} />, label: "Убакыт" },
  ];
  return (
    <div style={{ position: "absolute", left: 90, width: 840, top, display: "flex", justifyContent: "space-between" }}>
      {items.map((it, i) => {
        const p = pop(f, at[i] - 0.15);
        const ck = ease(f, at[i] + 0.15, at[i] + 0.6);
        return (
          <div key={i} style={{ transform: `scale(${0.7 + 0.3 * p})`, opacity: p }}>
            <Chip size={34}>
              {it.icon} {it.label} <Check size={36} t={ck} />
            </Chip>
          </div>
        );
      })}
    </div>
  );
};

// ---------- 3. Совпавшие пазлы соединяются, форма предварительной группы ----------
/** Моменты защёлкивания трёх пазлов (с от начала сцены) — для анимации и звука. */
export const groupSnapTimes = (cue: SceneProps["cue"]): number[] => {
  const t = wordAt(cue, 2, 9); // «каттам»
  return [0, 1, 2].map((i) => t + i * 0.35);
};
export const GroupScene: React.FC<SceneProps> = ({ cue, dur }) => {
  const f = useCurrentFrame();
  const S = 230;
  const gx = 310;
  const gy = 640;
  const tSnap = groupSnapTimes(cue)[0];
  const total = dur / 30;
  const toForm = ease(f, Math.max(tSnap + 2.6, total * 0.52), Math.max(tSnap + 3.4, total * 0.52 + 0.8));
  const base = [
    [gx, gy],
    [gx + S, gy],
    [gx, gy + S],
  ];
  const apart = [
    [-40, -30, -6],
    [44, -24, 5],
    [-36, 40, 4],
  ];
  // соединённая группа уменьшается и уходит наверх, освобождая место форме
  const gs = lerp(1, 0.55, toForm);
  const shiftY = lerp(0, -300, toForm);
  const glow = ease(f, tSnap + 1.4, tSnap + 2.0) * (1 - toForm);
  const coral = ease(f, tSnap + 0.2, tSnap + 1.4);
  const form = pop(f, Math.max(tSnap + 2.9, total * 0.52 + 0.3), 16);
  return (
    <SceneIn>
      <Paper />
      <Brand />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${shiftY}px) scale(${gs})`, transformOrigin: `${gx + S}px ${gy + S}px` }}>
        <div
          style={{
            position: "absolute",
            left: gx - 40,
            top: gy - 40,
            width: S * 2 + 80,
            height: S * 2 + 80,
            borderRadius: 60,
            border: `8px solid ${C.yellow}`,
            opacity: glow,
            boxShadow: `0 0 50px rgba(255,201,14,${0.6 * glow})`,
          }}
        />
        {base.map(([x, y], i) => {
          const snap = pop(f, tSnap + i * 0.35, 12);
          const [ax, ay, ar] = apart[i];
          const appear = ease(f, 0.05 * i, 0.4 + 0.05 * i);
          return (
            <Piece key={i} x={x + ax * (1 - snap)} y={y + ay * (1 - snap)} size={S} color={PIECE[i]} edges={EDGES[i]} rot={ar * (1 - snap)} opacity={appear} lift={8 * (1 - snap)}>
              <PieceLabel n={i + 1} time={TIMES[i]} size={S} />
            </Piece>
          );
        })}
      </div>
      {/* четвёртый: спокойно отходит к другому маршруту, без запрещающих знаков */}
      <Piece x={lerp(gx + S + 40, 700, coral)} y={lerp(gy + S + 50, 1110, coral) + lerp(0, -260, toForm)} size={S} color={PIECE[3]} edges={EDGES[3]} rot={lerp(5, 8, coral)} scale={lerp(1, 0.62, coral)} opacity={lerp(1, 0.9, coral) * (1 - toForm)}>
        <PieceLabel n={4} time={TIMES[3]} size={S} />
      </Piece>
      <div style={{ position: "absolute", left: 560, top: 1290, opacity: coral * (1 - toForm) }}>
        <Chip size={28} color={C.navySoft}>
          башка каттамга
        </Chip>
      </div>
      <div style={{ position: "absolute", left: 90, top: 1150, opacity: glow }}>
        <Chip size={36} bg={C.yellow}>
          Чакан топ • 3 бала
        </Chip>
      </div>
      {/* форма предварительного подбора */}
      <div
        style={{
          position: "absolute",
          left: 90,
          width: 840,
          top: 820,
          padding: "36px 44px",
          borderRadius: 40,
          background: "#fff",
          boxShadow: `0 24px 60px ${C.shadow}`,
          fontFamily,
          color: C.navy,
          opacity: form,
          transform: `translateY(${(1 - form) * 80}px)`,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 48 }}>Топ алдын ала түзүлөт</div>
        <div style={{ height: 8, width: 160, background: C.yellow, borderRadius: 4, margin: "14px 0 22px" }} />
        {[
          [<PinIcon key="p" size={40} />, "Үйдүн дареги"],
          [<SchoolIcon key="s" size={44} />, "Мектеп"],
          [<ClockIcon key="c" size={40} />, "Убакыт"],
        ].map(([icon, label], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 800, padding: "10px 0" }}>
            {icon}
            <span style={{ flex: 1 }}>{label}</span>
            <Check size={44} t={ease(f, Math.max(tSnap + 3.3, total * 0.52 + 0.7) + i * 0.3, Math.max(tSnap + 3.7, total * 0.52 + 1.1) + i * 0.3)} />
          </div>
        ))}
        <div style={{ marginTop: 16, fontSize: 30, fontWeight: 700, color: C.navySoft }}>Ылайыктуу топту издөө 2 жумага чейин созулушу мүмкүн</div>
      </div>
    </SceneIn>
  );
};

