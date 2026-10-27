// Анимированные схемы фильма BM-005, часть «Стратегия»: Брехт и сигара, стрела
// Ротшильдов, матч Фишер — Спасский, урок Сертория, Фуше, Наполеон у камина,
// чайная мельница судьи. Все времена привязаны к репликам через at(c, n).
import type React from "react";
import { C, FONT, SERIF } from "../theme";
import { Board, Chess, Crown, Figure, Ribbon, Year } from "./court";
import { Bubble, Fly, OL } from "./draw";
import { Arrow, Check, Cross, Panel, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ───────────── общие мелочи ─────────────

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
// появиться в a, исчезнуть в b
const show = (t: number, a: number, b = 1e9, d = 0.6) => ramp(t, a, d) * (1 - ramp(t, b, d));
const textW = (s: string, size: number) => Math.max(...s.split("\n").map((l) => l.length)) * size * 0.56;

// «пружинка» вокруг точки (для любых групп)
const PopAt: React.FC<{ k: number; x: number; y: number; children: React.ReactNode }> = ({ k, x, y, children }) =>
  k <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k}) translate(${-x} ${-y})`} opacity={clamp01(k * 1.5)}>
      {children}
    </g>
  );

// подпись с белым ореолом — читается на любом фоне
const Lbl: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; k?: number; font?: string; weight?: number }> = ({ x, y, text, size = 32, color = C.ink, k = 1, font = FONT, weight = 900 }) =>
  k <= 0.001 ? null : (
    <text x={x} y={y} textAnchor="middle" fontFamily={font} fontWeight={weight} fontSize={size} fill={color} stroke="#fff" strokeWidth={size * 0.24} strokeLinejoin="round" paintOrder="stroke" opacity={clamp01(k * 1.5)}>
      {text}
    </text>
  );

// пузырь речи с текстом (x, y — центр)
const Say: React.FC<{ x: number; y: number; text: string; k: number; size?: number; tail?: [number, number]; fill?: string; color?: string; font?: string }> = ({ x, y, text, k, size = 36, tail, fill = "#fff", color = C.ink, font = FONT }) => {
  if (k <= 0.001) return null;
  const lines = text.split("\n");
  const w = textW(text, size) + size * 1.5;
  const h = lines.length * size * 1.2 + size * 0.9;
  return (
    <PopAt k={k} x={x} y={y}>
      <Bubble x={x - w / 2} y={y - h / 2} w={w} h={h} tail={tail} fill={fill} />
      {lines.map((l, i) => (
        <text key={i} x={x} y={y - h / 2 + size * 1.2 + i * size * 1.2 - size * 0.1} textAnchor="middle" fontFamily={font} fontWeight={900} fontSize={size} fill={color}>
          {l}
        </text>
      ))}
    </PopAt>
  );
};

// карточка-вывод с иконкой ✓ / ✗
const Card: React.FC<{ x: number; y: number; text: string; k: number; size?: number; icon?: "check" | "cross"; fill?: string; color?: string; stroke?: string }> = ({ x, y, text, k, size = 38, icon, fill = C.white, color = C.ink, stroke }) => {
  if (k <= 0.001) return null;
  const lines = text.split("\n");
  const iw = icon ? size * 1.5 : 0;
  const w = textW(text, size) + size * 1.4 + iw;
  const h = lines.length * size * 1.2 + size * 0.8;
  const tx = x + iw / 2;
  return (
    <PopAt k={k} x={x} y={y}>
      <Panel x={x - w / 2} y={y - h / 2} w={w} h={h} r={Math.min(30, h / 2)} fill={fill} stroke={stroke} />
      {lines.map((l, i) => (
        <text key={i} x={tx} y={y - (lines.length - 1) * size * 0.6 + i * size * 1.2 + size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color}>
          {l}
        </text>
      ))}
      {icon === "check" && <Check x={x - w / 2 + size * 1.05} y={y} s={size * 0.75} k={clamp01(k * 1.5 - 0.3)} />}
      {icon === "cross" && <Cross x={x - w / 2 + size * 1.05} y={y} s={size * 0.8} k={clamp01(k * 1.5 - 0.3)} />}
    </PopAt>
  );
};

// рамка-сцена: стена, пол, всё содержимое обрезано по скруглённому краю
const Stage: React.FC<{ id: string; x: number; y: number; w: number; h: number; wall: string; floor: string; floorY: number; k?: number; children?: React.ReactNode }> = ({ id, x, y, w, h, wall, floor, floorY, k = 1, children }) =>
  k <= 0.001 ? null : (
    <g opacity={clamp01(k)}>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} rx={34} />
        </clipPath>
      </defs>
      <rect x={x + 8} y={y + 12} width={w} height={h} rx={34} fill="#24324a" opacity={0.1} />
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={wall} />
        <rect x={x} y={floorY} width={w} height={y + h - floorY} fill={floor} />
        <rect x={x} y={floorY} width={w} height={8} fill="#000" opacity={0.08} />
        {children}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={34} fill="none" stroke={OL} strokeWidth={5} />
    </g>
  );

// дымок (сигара, трубы корабля)
const Smoke: React.FC<{ x: number; y: number; t: number; s?: number; color?: string }> = ({ x, y, t, s = 1, color = "#d4dbe5" }) => (
  <g>
    {[0, 1, 2, 3].map((i) => {
      const ph = (t * 0.45 + i / 4) % 1;
      return <circle key={i} cx={x + (Math.sin(ph * 6 + i) * 8 + ph * 14) * s} cy={y - ph * 90 * s} r={(5 + ph * 14) * s} fill={color} opacity={(1 - ph) * 0.6} />;
    })}
  </g>
);

const Cigar: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g transform="rotate(-25)">
      <rect x={-6} y={-6} width={46} height={12} rx={5} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
      <rect x={6} y={-6} width={8} height={12} fill={C.velvet} />
      <circle cx={40} cy={0} r={5} fill="#ff8a3b" opacity={0.7 + 0.3 * Math.sin(t * 5)} />
    </g>
    <Smoke x={37} y={-22} t={t} s={0.8} />
  </g>
);

// красные «зигзаги» гнева
const Anger: React.FC<{ x: number; y: number; t: number; k: number; s?: number }> = ({ x, y, t, k, s = 1 }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={clamp01(k)}>
      {[-50, -15, 20, 55].map((a, i) => {
        const j = Math.sin(t * 14 + i * 2) * 4;
        return (
          <g key={i} transform={`rotate(${a}) translate(0 ${-95 - j})`}>
            <path d="M -14 0 L -4 -14 L 4 0 L 14 -14" fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );

const Sweat: React.FC<{ x: number; y: number; t: number; k?: number }> = ({ x, y, t, k = 1 }) =>
  k <= 0.01 ? null : (
    <g opacity={clamp01(k)}>
      {[0, 1].map((i) => {
        const ph = (t * 0.9 + i * 0.5) % 1;
        return <path key={i} transform={`translate(${x + i * 18} ${y + ph * 26})`} d="M 0 -12 Q 9 0 0 8 Q -9 0 0 -12 Z" fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={2.5} opacity={1 - ph} />;
      })}
    </g>
  );

const QMark: React.FC<{ x: number; y: number; k: number; t: number; size?: number; color?: string }> = ({ x, y, k, t, size = 64, color = C.velvet }) =>
  k <= 0.01 ? null : (
    <PopAt k={k} x={x} y={y}>
      <g transform={`translate(0 ${wob(t, x, 4)})`}>
        <Lbl x={x} y={y} text="?" size={size} color={color} />
      </g>
    </PopAt>
  );

// мишень
const Target: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 100 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M ${-r * 0.5} ${r * 0.7} L ${-r * 0.8} ${r * 1.5} M ${r * 0.5} ${r * 0.7} L ${r * 0.8} ${r * 1.5}`} stroke="#8a5a2b" strokeWidth={r * 0.1} strokeLinecap="round" />
    {[1, 0.8, 0.6, 0.4, 0.2].map((f, i) => (
      <circle key={i} r={r * f} fill={i % 2 ? "#fff" : C.red} stroke={OL} strokeWidth={i === 0 ? 5 : 3} />
    ))}
  </g>
);

// стрела (летит вправо)
const ArrowShaft: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={-110} y1={0} x2={10} y2={0} stroke="#8a5a2b" strokeWidth={8} strokeLinecap="round" />
    <path d="M 30 0 L 4 -14 L 8 0 L 4 14 Z" fill="#9aa5b5" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -110 0 L -128 -16 L -96 -16 L -84 0 L -96 16 L -128 16 Z" fill={C.velvet} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
  </g>
);

const gearPath = (r: number, teeth: number) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const st = (Math.PI * 2) / teeth;
    const p = (ang: number, rr: number) => `${(Math.cos(ang) * rr).toFixed(1)} ${(Math.sin(ang) * rr).toFixed(1)}`;
    pts.push(p(a, r), p(a + st * 0.12, r + 12), p(a + st * 0.42, r + 12), p(a + st * 0.54, r));
  }
  return `M ${pts.join(" L ")} Z`;
};
const Gear: React.FC<{ x: number; y: number; r: number; teeth: number; rot: number; color: string }> = ({ x, y, r, teeth, rot, color }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={gearPath(r, teeth)} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle r={r * 0.32} fill="#fff" stroke={OL} strokeWidth={4} />
  </g>
);

// ───────────── g24b · Брехт и сигара ─────────────

const Steamer: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 2) * 3}) rotate(${Math.sin(t * 1.6) * 2}) scale(${s})`}>
    <Smoke x={10} y={-92} t={t} s={1.1} color="#e6ebf2" />
    <rect x={-4} y={-92} width={28} height={44} fill={C.velvet} stroke={OL} strokeWidth={4} />
    <rect x={-4} y={-92} width={28} height={10} fill="#24324a" />
    <rect x={-60} y={-52} width={110} height={30} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
    {[-44, -22, 0, 22].map((cx) => (
      <circle key={cx} cx={cx} cy={-37} r={6} fill={C.sky} stroke={OL} strokeWidth={2} />
    ))}
    <path d="M -100 -22 L 100 -22 L 78 18 L -82 18 Z" fill="#2f4a7a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -94 -12 L 94 -12" stroke="#fff" strokeWidth={4} opacity={0.7} />
  </g>
);

const Suitcase: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -16 -62 L -16 -74 Q -16 -80 -10 -80 L 10 -80 Q 16 -80 16 -74 L 16 -62" fill="none" stroke={OL} strokeWidth={6} />
    <rect x={-50} y={-62} width={100} height={62} rx={10} fill="#a8733c" stroke={OL} strokeWidth={4} />
    <path d="M -50 -40 L 50 -40" stroke={OL} strokeWidth={3} />
    <rect x={-36} y={-30} width={22} height={16} rx={3} fill={C.yellow} stroke={OL} strokeWidth={2} />
    <circle cx={24} cy={-22} r={9} fill={C.sky} stroke={OL} strokeWidth={2} />
  </g>
);

const Lamp: React.FC<{ x: number; t: number; seed: number }> = ({ x, t, seed }) => (
  <g transform={`translate(${x} 100) rotate(${Math.sin(t * 1.3 + seed) * 3})`}>
    <line x1={0} y1={0} x2={0} y2={70} stroke={OL} strokeWidth={4} />
    <path d="M -36 104 Q -30 70 0 70 Q 30 70 36 104 Z" fill="#2f6f5a" stroke={OL} strokeWidth={4} />
    <ellipse cx={0} cy={106} rx={18} ry={7} fill="#fff3b0" />
    <circle cx={0} cy={116} r={40} fill="#fff3b0" opacity={0.25 + 0.05 * Math.sin(t * 3 + seed)} />
  </g>
);

export const Brecht: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const enter = at(c, 1.4);
  const ready = enter + 2.2;
  const bubbleAt = at(c, 2.08);
  const leaveAt = at(c, 2.42);
  const outroAt = at(c, 2.7);
  const fadeArgue = 1 - ramp(t, at(c, 2.62), 0.8);
  // Брехт и переводчик входят справа, в конце уходят к кораблю
  const inK = outCubic((t - enter) / 2.2);
  const outK = ramp(t, leaveAt, 2.4);
  const bx = lerp(1290, 820, inK) + outK * 520;
  const walking = (t > enter && t < ready) || (t > leaveAt && t < leaveAt + 2.4) ? 1 : 0;
  const pleased = t > ready + 0.6;
  const members = [
    { x: 490, role: "modern" as const, body: "#7b8796", d: 0.15 },
    { x: 710, role: "boss" as const, body: undefined, d: 0.22 },
    { x: 930, role: "modern" as const, body: "#8a7b6a", d: 0.29 },
  ];
  const insetK = pop(t, leaveAt);
  return (
    <g>
      <Stage id="brecht-hall" x={60} y={100} w={1280} h={770} wall="#eee3cc" floor="#c39463" floorY={640}>
        {/* стеновые панели */}
        {[140, 360, 580, 800, 1020, 1240].map((px) => (
          <rect key={px} x={px - 80} y={430} width={160} height={190} rx={10} fill="#e2d3b4" stroke="#cdb994" strokeWidth={3} />
        ))}
        {[180, 380, 580, 780, 980, 1180].map((px) => (
          <path key={px} d={`M ${px} 660 L ${px - 60} 870`} stroke="#a77a4c" strokeWidth={3} opacity={0.5} />
        ))}
        <Lamp x={330} t={t} seed={0} />
        <Lamp x={1090} t={t} seed={2} />
        {/* печать на стене */}
        <g transform={`translate(710 185)`}>
          <circle r={58} fill={C.goldLight} stroke={OL} strokeWidth={5} />
          <circle r={42} fill="none" stroke={C.goldDeep} strokeWidth={4} />
          <path d="M 0 -26 L 8 -8 L 27 -8 L 12 4 L 17 23 L 0 12 L -17 23 L -12 4 L -27 -8 L -8 -8 Z" fill={C.goldDeep} />
        </g>
        {/* комиссия за столом */}
        {members.map((m, i) => {
          const k = pop(t, at(c, m.d));
          if (k <= 0.01) return null;
          const chair = m.role === "boss";
          return (
            <g key={i} opacity={clamp01(k * 1.5)} transform={`translate(0 ${(1 - clamp01(k)) * 40})`}>
              <Figure
                x={m.x}
                y={490}
                s={0.78}
                t={t}
                role={m.role}
                body={m.body}
                mood={chair ? (pleased ? "happy" : "neutral") : pleased ? "neutral" : "sly"}
                arms={chair ? [10, 100] : [10, 10]}
                look={chair && t > enter ? 0.8 : 0}
                talk={chair && t > bubbleAt && t < bubbleAt + 2.4 ? 1 : 0}
                hold={chair ? <Cigar t={t} /> : undefined}
              />
            </g>
          );
        })}
        <rect x={360} y={390} width={700} height={22} rx={6} fill="#9a6b3a" stroke={OL} strokeWidth={4} />
        <rect x={372} y={410} width={676} height={92} fill="#7a5530" stroke={OL} strokeWidth={4} />
        <rect x={588} y={428} width={244} height={56} rx={8} fill="#f6ead0" stroke={OL} strokeWidth={3} />
        <text x={710} y={467} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={32} fill={C.ink}>
          КОМИССИЯ
        </text>
        {/* «спорят» — другие вызванные */}
        <g opacity={fadeArgue * clamp01(pop(t, L1 + 0.4) * 1.5)}>
          {[150, 270, 390].map((x, i) => {
            const shake = Math.sin(t * 9 + i * 1.7) * 14;
            return <Figure key={x} x={x} y={800} s={0.88} t={t} role="modern" body={["#b35a4a", "#5a7a9a", "#7a6a9a"][i]} mood="angry" arms={[140 + shake, 150 - shake]} look={1} talk={0.8} />;
          })}
          <Anger x={270} y={640} t={t} k={ramp(t, L1 + 1)} s={1.1} />
          <Tag x={270} y={548} text="спорят" color={C.coral} textColor="#fff" size={34} />
        </g>
        {/* Брехт и переводчик */}
        {t > enter && (
          <g opacity={1 - ramp(t, leaveAt + 1.6, 0.8)}>
            <Figure x={bx + 175} y={800} s={0.86} t={t} role="modern" body="#6a8caf" mood="neutral" arms={[10, 14]} look={-1} walk={walking} talk={t > ready && t < bubbleAt - 0.5 ? 0.6 * (Math.sin(t * 1.3) > 0 ? 1 : 0) : 0} />
            <Figure x={bx} y={800} s={0.9} t={t} role="modern" body="#59606b" mood={t > leaveAt ? "sly" : "happy"} arms={[10, 70]} look={-1} walk={walking} bow={t > ready && t < leaveAt ? 0.18 * ramp(t, ready, 0.8) : 0} hold={<Cigar t={t} />} />
            {t > leaveAt - 0.6 && <Suitcase x={bx - 70} y={800} s={0.9 * clamp01(pop(t, leaveAt - 0.6))} />}
            <Lbl x={bx} y={548} text="Брехт" size={34} k={ramp(t, enter + 1.2)} />
            <Lbl x={bx + 175} y={560} text="переводчик" size={28} color={C.inkSoft} k={ramp(t, enter + 1.6)} />
          </g>
        )}
        {/* «на следующий день» — окно с кораблём */}
        {insetK > 0.01 && (
          <PopAt k={insetK} x={1180} y={265}>
            <rect x={1040} y={150} width={280} height={230} rx={18} fill="#bfe6fb" stroke={OL} strokeWidth={5} />
            <defs>
              <clipPath id="brecht-sea">
                <rect x={1040} y={150} width={280} height={230} rx={18} />
              </clipPath>
            </defs>
            <g clipPath="url(#brecht-sea)">
              <circle cx={1270} cy={200} r={26} fill={C.yellow} />
              <rect x={1040} y={300} width={280} height={90} fill="#3d8fd0" />
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${1020 + ((t * 30 + i * 90) % 280)} ${320 + i * 18} q 15 -8 30 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} />
              ))}
              <Steamer x={lerp(1110, 1260, ramp(t, leaveAt, 9))} y={308} t={t} s={0.62 - 0.12 * ramp(t, leaveAt, 9)} />
            </g>
          </PopAt>
        )}
        <Lbl x={1180} y={420} text="на следующий день" size={30} k={ramp(t, leaveAt + 0.4)} />
        <g opacity={show(t, at(c, 0.82), leaveAt - 0.5)}>
          <Tag x={1180} y={270} text="ищет коммунистов" size={30} color="#fff" />
        </g>
      </Stage>
      <Year x={190} y={170} text="1947" k={pop(t, at(c, 0.45))} />
      <Say x={470} y={178} text={"Образцовый\nсвидетель!"} size={36} k={pop(t, bubbleAt)} tail={[680, 292]} />
      <Card x={700} y={775} text="уступить снаружи ≠ сдаться внутри" size={38} k={pop(t, outroAt)} fill={C.goldLight} />
    </g>
  );
};

// ───────────── g25 · Ротшильды: одна стрела ─────────────

const CITIES = [
  { name: "Лондон", x: 300, y: 300, dx: 0 },
  { name: "Париж", x: 395, y: 480, dx: 0 },
  { name: "Франкфурт", x: 600, y: 395, dx: 0 },
  { name: "Вена", x: 850, y: 460, dx: 0 },
  { name: "Неаполь", x: 760, y: 715, dx: 0 },
];
const ROUTES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 4],
];
const BRO = ["#c98a0b", "#2f6f8f", "#6d4bc4", "#3fb67c", "#c23b4e"];

const Envelope: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-30} y={-20} width={60} height={40} rx={5} fill="#fff" stroke={OL} strokeWidth={3} />
    <path d="M -30 -20 L 0 4 L 30 -20" fill="none" stroke={OL} strokeWidth={3} />
    <circle cx={0} cy={4} r={6} fill={C.velvet} />
  </g>
);

export const Rothschild: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const L2 = at(c, 2);
  const L3 = at(c, 3);
  // фаза 1: стрела и две мишени
  const p1 = 1 - ramp(t, L1 - 0.3, 0.8);
  const shot = at(c, 0.55);
  const fly = clamp01((t - shot) / 1.1);
  const ax = lerp(250, 1420, fly);
  // фаза 2: карта
  const mapK = ramp(t, L1, 0.8) * (1 - 0.82 * ramp(t, L3, 0.8));
  const cityAt = [0.7, 0.76, 0.82, 0.88, 0.94].map((f) => at(c, 1 + f));
  const broAt = at(c, 1.36);
  // фаза 3: фокус
  const focK = ramp(t, L3 + 0.2, 0.7);
  const hitAt = L3 + 1.4;
  const hit = clamp01((t - hitAt) / 0.7);
  return (
    <g>
      {/* ── мишени ── */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          <PopAt k={pop(t, at(c, 0.1))} x={230} y={480}>
            <g transform={`translate(230 480) rotate(${wob(t, 1, 1.5)})`}>
              <path d="M -10 -170 Q 90 0 -10 170" fill="none" stroke="#8a5a2b" strokeWidth={14} strokeLinecap="round" />
              <path d={`M -10 -170 L ${t < shot ? -40 : -10} 0 L -10 170`} fill="none" stroke={OL} strokeWidth={3} />
            </g>
          </PopAt>
          <PopAt k={pop(t, at(c, 0.25))} x={820} y={300}>
            <g transform={`translate(0 ${wob(t, 2, 3)})`}>
              <Target x={820} y={300} r={105} />
            </g>
          </PopAt>
          <PopAt k={pop(t, at(c, 0.35))} x={820} y={620}>
            <g transform={`translate(0 ${wob(t, 3, 3)})`}>
              <Target x={820} y={620} r={105} />
            </g>
          </PopAt>
          {t > at(c, 0.3) && fly < 1 && <ArrowShaft x={t < shot ? 210 : ax} y={480 + (t < shot ? 0 : Math.sin(fly * 9) * 6)} s={1.1} />}
          {fly > 0 && <path d={`M 260 480 L ${Math.min(ax, 1330)} 480`} stroke={C.inkSoft} strokeWidth={4} strokeDasharray="12 14" opacity={0.5} />}
          {fly >= 1 && <Cross x={820} y={460} s={90} k={ramp(t, shot + 1.2, 0.5)} />}
          <Ribbon x={700} y={800} text="Двух целей одной стрелой не поразишь" size={32} k={pop(t, at(c, 0.75))} color={C.greenDeep} />
        </g>
      )}
      {/* ── карта Европы ── */}
      {mapK > 0.01 && (
        <g opacity={mapK}>
          <defs>
            <clipPath id="roth-map">
              <rect x={80} y={110} width={1000} height={720} rx={34} />
            </clipPath>
          </defs>
          <rect x={88} y={122} width={1000} height={720} rx={34} fill="#24324a" opacity={0.1} />
          <g clipPath="url(#roth-map)">
            <rect x={80} y={110} width={1000} height={720} fill="#cfeaf8" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M ${100 + ((t * 12 + i * 211) % 260)} ${600 + (i % 3) * 60} q 14 -8 28 0 t 28 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.8} />
            ))}
            <path
              d="M 330 600 Q 280 540 330 470 L 400 420 Q 460 340 560 330 Q 640 270 760 290 Q 900 250 1100 290 L 1100 610 Q 990 640 930 600 Q 880 575 840 610 Q 790 600 760 630 Q 810 690 840 770 L 805 800 Q 740 720 700 660 Q 650 615 600 640 Q 540 660 500 620 Q 450 690 390 720 Q 300 760 260 700 Q 250 640 330 600 Z"
              fill="#e9f4d6"
              stroke={OL}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <path d="M 300 190 Q 345 150 360 215 Q 400 270 365 360 Q 320 400 280 365 Q 255 300 290 250 Q 270 215 300 190 Z" fill="#e9f4d6" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            {/* курьерские линии */}
            {ROUTES.map(([a, b], i) => {
              const k = ramp(t, L2 + 0.3 + i * 0.35, 0.8);
              if (k <= 0) return null;
              const A = CITIES[a];
              const B = CITIES[b];
              const ph = (t * 0.35 + i * 0.27) % 1;
              const back = Math.floor(t * 0.35 + i * 0.27) % 2 === 1;
              const f = back ? 1 - ph : ph;
              return (
                <g key={i}>
                  <line x1={A.x} y1={A.y} x2={lerp(A.x, B.x, k)} y2={lerp(A.y, B.y, k)} stroke={C.velvet} strokeWidth={6} strokeDasharray="14 10" strokeDashoffset={-t * 30} strokeLinecap="round" />
                  {k >= 1 && <Envelope x={lerp(A.x, B.x, f)} y={lerp(A.y, B.y, f)} s={0.6} rot={wob(t, i, 4)} />}
                </g>
              );
            })}
            {/* города */}
            {CITIES.map((ct, i) => {
              const k = pop(t, cityAt[i]);
              return (
                <g key={ct.name}>
                  {k > 0.01 && (
                    <PopAt k={k} x={ct.x} y={ct.y}>
                      <circle cx={ct.x} cy={ct.y} r={16 + Math.sin(t * 3 + i) * 2} fill={C.gold} opacity={0.35} />
                      <circle cx={ct.x} cy={ct.y} r={11} fill={C.velvet} stroke={OL} strokeWidth={4} />
                      <Lbl x={ct.x} y={ct.y - 26} text={ct.name} size={32} />
                    </PopAt>
                  )}
                </g>
              );
            })}
            {/* братья: появляются вместе во Франкфурте и разъезжаются */}
            {CITIES.map((ct, i) => {
              const k = pop(t, broAt + i * 0.15);
              if (k <= 0.01) return null;
              const go = outCubic((t - cityAt[i]) / 1.0);
              const home = CITIES[2];
              const sx = home.x - 120 + i * 60;
              const fx = lerp(sx, ct.x + 42, go);
              const fy = lerp(home.y + 150, ct.y + 92, go);
              return <Figure key={i} x={fx} y={fy} s={0.36 * clamp01(k)} t={t} role="merchant" body={BRO[i]} mood="happy" walk={go > 0 && go < 1 ? 1 : 0} />;
            })}
            <Lbl x={460} y={180} text="5 братьев — 5 столиц" size={36} k={ramp(t, broAt + 0.6) * (1 - ramp(t, L2 + 0.2))} />
          </g>
          <rect x={80} y={110} width={1000} height={720} rx={34} fill="none" stroke={OL} strokeWidth={5} />
          {/* шифр и часовой механизм — колонка справа */}
          <PopAt k={pop(t, at(c, 2.38))} x={1215} y={300}>
            <g transform={`translate(0 ${wob(t, 5, 4)})`}>
              <rect x={1115} y={190} width={200} height={170} rx={16} fill="#fbf0d4" stroke={OL} strokeWidth={4} />
              {["Ж7 ФЪ ЛР", "Ω3 ДЮ Ѣ9", "ЗЯ 4Ш ЦЖ"].map((l, i) => (
                <text key={i} x={1215} y={240 + i * 40} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={28} fill={C.inkSoft}>
                  {l}
                </text>
              ))}
              <circle cx={1300} cy={350} r={20} fill={C.velvet} stroke={OL} strokeWidth={3} />
            </g>
            <Lbl x={1215} y={405} text="шифр" size={34} />
          </PopAt>
          <PopAt k={pop(t, at(c, 2.62))} x={1215} y={590}>
            <Gear x={1170} y={560} r={56} teeth={10} rot={t * 40} color={C.gold} />
            <Gear x={1268} y={615} r={38} teeth={7} rot={-t * 40 * (56 / 38) + 12} color={C.sky} />
            <Gear x={1250} y={500} r={28} teeth={6} rot={-t * 40 * (56 / 28) + 8} color={C.coral} />
            <Lbl x={1215} y={720} text="часовой" size={32} />
            <Lbl x={1215} y={758} text="механизм" size={32} />
          </PopAt>
        </g>
      )}
      {/* ── фокус: одна цель ── */}
      {focK > 0.01 && (
        <g opacity={focK}>
          <path d={`M 530 100 L 690 100 L 820 640 L 400 640 Z`} fill="#fff7cf" opacity={0.55 + 0.08 * Math.sin(t * 2)} />
          <PopAt k={pop(t, L3 + 0.3)} x={610} y={460}>
            <Target x={610} y={460} r={150} />
          </PopAt>
          {t > L3 + 0.8 && <ArrowShaft x={lerp(130, 585, outCubic(hit))} y={460} s={1.3} />}
          {hit >= 1 && <circle cx={610} cy={460} r={30 + 80 * ramp(t, hitAt + 0.7, 0.6)} fill="none" stroke={C.gold} strokeWidth={8} opacity={1 - ramp(t, hitAt + 0.7, 0.6)} />}
          <Card x={610} y={760} text="все силы — в одну цель" size={40} icon="check" k={pop(t, hitAt + 0.5)} />
        </g>
      )}
    </g>
  );
};

// ───────────── g25b · Фишер — Спасский ─────────────

const BX = 1220;
const BY = 612;
const BW = 520;
const boardPt = (r: number, col: number) => {
  const n = 8;
  const h = BW * 0.42;
  const yy = BY - h + (h * (r + 0.5)) / n;
  const shrink = 0.72 + 0.28 * ((r + 0.5) / n);
  const xx = BX + ((col + 0.5) / n - 0.5) * BW * shrink;
  return { x: xx, y: yy + 6, s: 0.24 + 0.09 * (r / n) };
};

const Chair: React.FC<{ x: number; y: number; s?: number; flip?: boolean; xray?: boolean }> = ({ x, y, s = 1, flip, xray }) => {
  const st = xray ? "#bfe8ff" : OL;
  const f1 = xray ? "none" : "#3a4a6a";
  const f2 = xray ? "none" : "#2c3a56";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M -50 -300 Q -54 -200 -46 -150 L 46 -150 Q 54 -200 50 -300 Q 0 -316 -50 -300 Z" fill={f1} stroke={st} strokeWidth={5} />
      <rect x={-64} y={-160} width={128} height={30} rx={12} fill={f2} stroke={st} strokeWidth={5} />
      <path d="M 0 -130 L 0 -40 M -50 0 L 0 -40 L 50 0 M -60 0 L 60 0" stroke={st} strokeWidth={8} strokeLinecap="round" fill="none" />
    </g>
  );
};

const WeatherSun: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k)}>
      <g transform={`rotate(${t * 20})`}>
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d="M -9 -64 L 0 -88 L 9 -64 Z" fill={C.yellowDeep} transform={`rotate(${i * 36})`} />
        ))}
      </g>
      <circle r={56} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={5} />
      <circle cx={-18} cy={-8} r={5} fill={OL} />
      <circle cx={18} cy={-8} r={5} fill={OL} />
      <path d="M -18 14 Q 0 30 18 14" stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );

const Cloud: React.FC<{ x: number; y: number; t: number; k: number; rain?: boolean; s?: number }> = ({ x, y, t, k, rain = true, s = 1 }) =>
  k <= 0.01 ? null : (
    <g transform={`translate(${x} ${y}) scale(${k * s})`} opacity={clamp01(k)}>
      {rain &&
        [-40, -10, 20, 50].map((dx, i) => {
          const ph = (t * 1.6 + i * 0.27) % 1;
          return <line key={i} x1={dx - ph * 8} y1={30 + ph * 70} x2={dx - ph * 8 - 5} y2={44 + ph * 70} stroke={C.skyDeep} strokeWidth={5} strokeLinecap="round" opacity={1 - ph} />;
        })}
      <path d="M -80 30 Q -100 -10 -60 -20 Q -50 -60 -6 -54 Q 20 -80 54 -50 Q 96 -50 90 -6 Q 106 30 70 34 Z" fill="#8f9bb0" stroke={OL} strokeWidth={4} />
      <path d="M -20 -2 L -6 -10 M 20 -2 L 6 -10" stroke={OL} strokeWidth={4} strokeLinecap="round" />
      <path d="M -12 16 Q 0 6 12 16" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );

// шахматные фигуры на доске: [ряд, столбец, вид, тёмная]
const PIECES: [number, number, "king" | "queen" | "pawn" | "knight" | "rook", boolean][] = [
  [0, 4, "king", true],
  [0, 0, "rook", true],
  [1, 2, "pawn", true],
  [1, 5, "pawn", true],
  [2, 3, "queen", true],
  [7, 4, "king", false],
  [7, 7, "rook", false],
  [6, 1, "pawn", false],
  [6, 6, "pawn", false],
];

export const ChessMatch: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const L3 = at(c, 3);
  const chessK = 1 - ramp(t, L3 - 0.2, 0.9);
  const bossK = ramp(t, L3 + 0.4, 0.8);
  const gripes = ["призы?", "свет!", "камеры!", "стулья!"];
  const gripeAt = [0.78, 0.84, 0.9, 0.95].map((f) => at(c, f));
  const gripeOff = L1 + 2.2;
  const scoreAt = at(c, 1.3);
  const crazyAt = at(c, 1.48);
  const xrayAt = at(c, 2.32);
  const resignAt = at(c, 2.82);
  const fall = ramp(t, resignAt, 0.9);
  const worried = t > crazyAt + 1.5;
  // «странные» ходы: белый конь и ферзь по петлям
  const hop = (r0: number, c0: number, r1: number, c1: number, start: number, loop: number) => {
    const k = clamp01((t - start) / 1.6);
    const e = outCubic(k);
    const A = boardPt(r0, c0);
    const B = boardPt(r1, c1);
    const x = lerp(A.x, B.x, e) + Math.sin(e * Math.PI * 2) * loop;
    const y = lerp(A.y, B.y, e) - Math.sin(e * Math.PI) * 170 - Math.sin(e * Math.PI * 2) * loop * 0.3;
    return { x, y, s: lerp(A.s, B.s, e), k };
  };
  const knight = hop(7, 1, 3, 6, crazyAt, 90);
  const queen = hop(7, 3, 4, 0, crazyAt + 1.8, -110);
  const knight2 = hop(3, 6, 5, 2, crazyAt + 3.6, 70);
  const kn = t > crazyAt + 3.6 ? knight2 : knight;
  // начальник: то солнце, то туча
  const cyc = (t - L3) / 2.4;
  const sunny = Math.floor(cyc) % 2 === 0;
  const swap = ramp((cyc % 1) * 2.4, 0, 0.35);
  return (
    <g>
      {chessK > 0.01 && (
        <g opacity={chessK}>
          <ellipse cx={BX} cy={805} rx={640} ry={46} fill="#b5e3c8" opacity={0.7} />
          <Chair x={790} y={800} s={0.9} />
          <Chair x={1660} y={800} s={0.9} flip />
          {/* стол и доска */}
          <rect x={BX - 30} y={620} width={60} height={180} fill="#7a5530" stroke={OL} strokeWidth={4} />
          <rect x={BX - 140} y={784} width={280} height={18} rx={8} fill="#7a5530" stroke={OL} strokeWidth={4} />
          <Board x={BX} y={BY} w={BW} k={1} />
          {PIECES.map(([r, col, kind, dark], i) => {
            const P = boardPt(r, col);
            const isKing = kind === "king" && dark;
            return <Chess key={i} x={P.x} y={P.y} s={P.s} kind={kind} dark={dark} rot={isKing ? fall * 82 : 0} />;
          })}
          {/* «неожиданные» ходы со следом */}
          {t > crazyAt - 0.2 && (
            <g>
              {kn.k > 0 && kn.k < 1 && <circle cx={kn.x} cy={kn.y} r={30} fill={C.yellow} opacity={0.35} />}
              <Chess x={kn.x} y={kn.y} s={kn.s} kind="knight" />
              {queen.k > 0 && queen.k < 1 && <circle cx={queen.x} cy={queen.y} r={30} fill={C.yellow} opacity={0.35} />}
              <Chess x={queen.x} y={queen.y} s={queen.s} kind="queen" />
            </g>
          )}
          {t <= crazyAt - 0.2 && (
            <g>
              <Chess x={boardPt(7, 1).x} y={boardPt(7, 1).y} s={boardPt(7, 1).s} kind="knight" />
              <Chess x={boardPt(7, 3).x} y={boardPt(7, 3).y} s={boardPt(7, 3).s} kind="queen" />
            </g>
          )}
          {/* игроки */}
          <Figure x={830} y={800} s={0.95} t={t} role="modern" body="#3d4a66" mood={t < gripeOff ? "angry" : t > resignAt ? "happy" : "sly"} arms={t < gripeOff ? [20, 60 + Math.sin(t * 4) * 20] : t > resignAt + 0.6 ? [150, 150] : [12, 30]} look={1} talk={t > gripeAt[0] - 0.5 && t < gripeOff ? 1 : 0} />
          <Figure x={1620} y={800} s={0.95} t={t} role="modern" body="#7a5a44" mood={t > resignAt ? "sad" : worried ? "worried" : "neutral"} arms={t > xrayAt && t < resignAt ? [10, 120] : [12, 12]} look={-1} bow={t > resignAt ? 0.25 * ramp(t, resignAt, 0.8) : 0} flip />
          <Lbl x={830} y={515} text="Фишер" size={34} />
          <Lbl x={1620} y={515} text="Спасский" size={34} />
          {worried && t < xrayAt && <QMark x={1745} y={440} k={pop(t, crazyAt + 1.5)} t={t} />}
          <Sweat x={1655} y={590} t={t} k={worried && t < resignAt ? 1 : 0} />
          {/* претензии Фишера */}
          {gripes.map((g, i) => {
            const pos = [
              [700, 410],
              [930, 335],
              [690, 265],
              [880, 205],
            ][i];
            return <Say key={g} x={pos[0]} y={pos[1]} text={g} size={36} k={pop(t, gripeAt[i]) * (1 - ramp(t, gripeOff, 0.5))} tail={i === 0 ? [800, 500] : undefined} />;
          })}
          <Year x={BX} y={150} text="Рейкьявик · 1972" k={pop(t, at(c, 0.25))} />
          {/* кубок чемпионата */}
          <PopAt k={pop(t, at(c, 0.42)) * (1 - ramp(t, scoreAt - 0.6, 0.5))} x={1660} y={250}>
            <g transform={`translate(1660 ${250 + wob(t, 4, 4)})`}>
              <circle cx={0} cy={-30} r={90} fill={C.goldLight} opacity={0.35 + 0.1 * Math.sin(t * 2)} />
              <path d="M -50 -100 L 50 -100 Q 50 -10 0 0 Q -50 -10 -50 -100 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
              <path d="M -50 -84 Q -90 -84 -80 -50 Q -70 -26 -40 -30 M 50 -84 Q 90 -84 80 -50 Q 70 -26 40 -30" fill="none" stroke={OL} strokeWidth={6} />
              <rect x={-10} y={0} width={20} height={30} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
              <rect x={-40} y={30} width={80} height={22} rx={6} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
              <path d="M -26 -86 L -20 -40" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
            </g>
            <Lbl x={1660} y={340} text="матч за титул" size={32} />
          </PopAt>
          {/* счёт */}
          <PopAt k={pop(t, scoreAt) * (1 - ramp(t, xrayAt - 0.6, 0.6))} x={1660} y={250}>
            <rect x={1520} y={180} width={280} height={140} rx={20} fill={C.night} stroke={OL} strokeWidth={5} />
            <Txt x={1660} y={282} size={84} weight={900} color={C.goldLight}>
              0 : 2
            </Txt>
            <Lbl x={1660} y={360} text="счёт" size={30} color={C.inkSoft} />
          </PopAt>
          <g opacity={show(t, crazyAt + 0.3, resignAt - 0.4)}>
            <Tag x={BX} y={268} text="неожиданные ходы" size={34} color={C.yellow} />
          </g>
          {/* рентген кресла */}
          <PopAt k={pop(t, xrayAt) * (1 - ramp(t, resignAt - 0.3, 0.6))} x={1650} y={300}>
            <rect x={1470} y={150} width={360} height={300} rx={22} fill="#123056" stroke={OL} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={1470} x2={1830} y1={170 + i * 64} y2={170 + i * 64} stroke="#4f86c6" strokeWidth={2} opacity={0.4} />
            ))}
            <rect x={1470} y={150 + ((t * 120) % 300)} width={360} height={10} fill="#bfe8ff" opacity={0.35} />
            <Chair x={1650} y={400} s={0.7} xray />
            <g transform="translate(1608 272) rotate(180)">
              <Fly x={0} y={0} s={0.42} t={0} />
            </g>
            <g transform="translate(1694 282) rotate(160)">
              <Fly x={0} y={0} s={0.42} t={0} />
            </g>
            <Txt x={1650} y={432} size={30} weight={900} color="#fff">
              рентген: 2 мухи
            </Txt>
          </PopAt>
        </g>
      )}
      {/* начальник: то хвалит, то унижает */}
      {bossK > 0.01 && (
        <g opacity={bossK}>
          <rect x={640} y={150} width={1180} height={650} rx={34} fill="#fff" opacity={0.55} />
          <rect x={760} y={640} width={300} height={24} rx={8} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
          <rect x={780} y={662} width={20} height={130} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
          <rect x={1020} y={662} width={20} height={130} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
          <Figure x={900} y={790} s={1.12} t={t} role="boss" mood={sunny ? "happy" : "angry"} arms={sunny ? [12, 120] : [12, 95 + Math.sin(t * 8) * 10]} look={1} talk={0.7} />
          <Figure x={1380} y={790} s={1.0} t={t} role="modern" mood={sunny ? "happy" : "sad"} arms={[12, 12]} look={-1} flip bow={sunny ? 0 : 0.12} />
          <WeatherSun x={1400} y={340} t={t} k={sunny ? clamp01(swap * 1.2) : 1 - clamp01(swap * 1.5)} />
          <Cloud x={1400} y={330} t={t} k={!sunny ? clamp01(swap * 1.2) : 1 - clamp01(swap * 1.5)} />
          <Lbl x={1610} y={350} text={sunny ? "хвалит" : "унижает"} size={38} color={sunny ? C.greenDeep : C.red} k={ramp((cyc % 1) * 2.4, 0.2, 0.3)} />
          <Lbl x={900} y={430} text="начальник" size={32} color={C.inkSoft} />
          {/* лупа — «распознавать» */}
          <g opacity={ramp(t, at(c, 3.6))} transform={`translate(${900 + Math.sin(t * 1.2) * 10} ${535 + Math.cos(t * 1.5) * 8})`}>
            <circle r={62} fill="#dff3ff" fillOpacity={0.18} stroke={OL} strokeWidth={8} />
            <line x1={44} y1={44} x2={100} y2={100} stroke={OL} strokeWidth={16} strokeLinecap="round" />
          </g>
          <Card x={1000} y={200} text="распознавать, а не копировать" size={40} k={pop(t, at(c, 3.62))} fill={C.goldLight} />
        </g>
      )}
      {chessK > 0.01 && <Card x={BX} y={268} text="2 сентября: Спасский сдался" size={34} k={pop(t, resignAt) * chessK} fill={C.goldLight} />}
    </g>
  );
};

// ───────────── g26 · хвост коня ─────────────

const Horse: React.FC<{ x: number; y: number; s?: number; t: number; flip?: boolean; old?: boolean; strands?: number; pull?: number }> = ({ x, y, s = 1, t, flip, old, strands = 1, pull = 0 }) => {
  const body = old ? "#bfae96" : "#9a5a2e";
  const dark = old ? "#94836b" : "#6e3a18";
  const mane = old ? "#ece4d4" : "#2e1a0c";
  const br = Math.sin(t * 2.2 + x) * 2;
  const drop = old ? 60 : 0;
  const N = old ? 8 : 20;
  const vis = Math.round(N * clamp01(strands));
  const legW = old ? 18 : 26;
  const swish = Math.sin(t * 1.7 + x) * 6 * (1 - pull);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={180} ry={14} fill="#000" opacity={0.1} />
      {/* хвост */}
      {Array.from({ length: vis }).map((_, i) => {
        const f = N > 1 ? i / (N - 1) : 0;
        const hx = -140 - f * (old ? 30 : 80) + swish;
        const hy = -24 + Math.sin(f * Math.PI) * 14;
        const sx2 = -352;
        const sy2 = -246 + (f - 0.5) * 24;
        const ex = lerp(hx, sx2, pull);
        const ey = lerp(hy, sy2, pull);
        const cx = lerp(-175 - f * (old ? 15 : 45), -250, pull);
        const cy = lerp(-150, -228, pull);
        return <path key={i} d={`M -128 -200 Q ${cx} ${cy} ${ex} ${ey}`} stroke={i % 2 ? mane : dark} strokeWidth={old ? 5 : 7} fill="none" strokeLinecap="round" />;
      })}
      {/* ноги */}
      {[-96, -64, 76, 104].map((lx, i) => (
        <g key={i}>
          <path d={`M ${lx} -160 L ${lx + (i % 2 ? 4 : -4)} -12`} stroke={i % 2 ? body : dark} strokeWidth={legW} strokeLinecap="round" />
          <rect x={lx - legW / 2 - 2 + (i % 2 ? 4 : -4)} y={-16} width={legW + 4} height={16} rx={4} fill="#3b2a10" />
        </g>
      ))}
      {/* туловище */}
      <ellipse cx={0} cy={-190 + br * 0.3} rx={old ? 128 : 145} ry={old ? 52 : 68} fill={body} stroke={OL} strokeWidth={5} />
      {old && [-30, 0, 30].map((rx) => <path key={rx} d={`M ${rx} -215 Q ${rx + 10} -190 ${rx} -165`} stroke={dark} strokeWidth={4} fill="none" />)}
      {!old && <ellipse cx={-40} cy={-210} rx={60} ry={20} fill="#fff" opacity={0.15} />}
      {/* шея и голова */}
      <path d={`M 80 -235 Q 130 ${-300 + drop * 0.6} 165 ${-320 + drop} L 205 ${-290 + drop} Q 160 ${-250 + drop * 0.5} 130 -165 Z`} fill={body} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <g transform={`translate(195 ${-300 + drop}) rotate(${old ? 55 : 32})`}>
        <ellipse cx={30} cy={0} rx={62} ry={30} fill={body} stroke={OL} strokeWidth={5} />
        <ellipse cx={74} cy={4} rx={18} ry={20} fill={dark} opacity={0.5} />
        <circle cx={80} cy={-4} r={4} fill={OL} />
        <path d="M -8 -26 L -2 -56 L 16 -28 Z" fill={body} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={20} cy={-10} r={old ? 4 : 6} fill={OL} />
        {old && <path d="M 12 -16 L 30 -14" stroke={OL} strokeWidth={4} strokeLinecap="round" />}
      </g>
      {/* грива */}
      {Array.from({ length: old ? 4 : 7 }).map((_, i) => {
        const f = i / (old ? 3 : 6);
        const mx = lerp(90, 175, f);
        const my = lerp(-240, -322 + drop, f);
        return <path key={i} d={`M ${mx} ${my} q ${-26 + Math.sin(t * 2 + i) * 4} 6 ${-34} ${old ? 30 : 40}`} stroke={mane} strokeWidth={old ? 7 : 11} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

const Swords: React.FC<{ x: number; y: number; k: number; broken: number }> = ({ x, y, k, broken }) =>
  k <= 0.01 ? null : (
    <PopAt k={k} x={x} y={y}>
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${x + d * broken * 30} ${y + broken * 30}) rotate(${d * (40 + broken * 40)})`}>
          <rect x={-8} y={-110} width={16} height={130} rx={6} fill="#dfe6ef" stroke={OL} strokeWidth={4} />
          <rect x={-30} y={20} width={60} height={14} rx={6} fill={C.goldDeep} stroke={OL} strokeWidth={3} />
          <rect x={-7} y={34} width={14} height={36} rx={5} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
        </g>
      ))}
    </PopAt>
  );

export const HorseTail: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const L2 = at(c, 2);
  // фаза 1: поспешная битва
  const p1 = 1 - ramp(t, L1 - 0.2, 0.8);
  const rushAt = at(c, 0.42);
  const lostAt = at(c, 0.68);
  const rush = outCubic((t - rushAt) / 2.2);
  // фаза 2: кони
  const horsesK = ramp(t, at(c, 0.9), 0.9);
  const pullAt = at(c, 1.05);
  const pluckAt = at(c, 1.5);
  const pluckEnd = L2 + 1.5;
  const plucked = clamp01((t - pluckAt) / (pluckEnd - pluckAt));
  const pull = t > pullAt ? 0.75 + 0.25 * Math.abs(Math.sin((t - pullAt) * 2.4)) : 0;
  // кони: кляча (вправо) и могучий конь (влево)
  const NX = 1060;
  const NS = 0.82;
  const HX = 1565;
  const HS = 0.92;
  const manX = NX - 330 * NS - 112;
  const skinnyX = HX + 175 * HS + 92;
  const hairs = Array.from({ length: 16 }).map((_, i) => pluckAt + 0.3 + i * ((pluckEnd - pluckAt - 0.3) / 16));
  // фаза 3: солнце и луна — смена дней
  const skyK = ramp(t, L2, 0.8);
  const dayPh = ((t - L2) / 4) % 1;
  return (
    <g>
      {/* холмы */}
      <path d="M 0 800 Q 400 720 900 760 Q 1250 800 1560 700 Q 1760 680 1920 730 L 1920 1080 L 0 1080 Z" fill="#a8dfb8" opacity={0.6} />
      {/* небо: солнце и луна */}
      {skyK > 0.01 && (
        <g opacity={skyK}>
          {[0, 1].map((i) => {
            const ph = (dayPh + i * 0.5) % 1;
            const ax = lerp(640, 1800, ph);
            const ay = 250 - Math.sin(ph * Math.PI) * 130;
            return i === 0 ? (
              <g key={i} transform={`translate(${ax} ${ay})`}>
                <circle r={60} fill={C.yellow} opacity={0.3} />
                <circle r={40} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={5} />
              </g>
            ) : (
              <g key={i} transform={`translate(${ax} ${ay})`}>
                <path d="M 12 -40 A 42 42 0 1 0 12 40 A 30 42 0 0 1 12 -40 Z" fill="#fff3c4" stroke={C.goldDeep} strokeWidth={4} />
              </g>
            );
          })}
          <path d="M 640 250 Q 1220 -10 1800 250" fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="6 14" opacity={0.7} />
        </g>
      )}
      {/* ── фаза 1 ── */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          {[0, 1, 2].map((i) => (
            <Figure key={i} x={1240 + i * 120 + rush * 330} y={790 - i * 6} s={0.82} t={t} role="soldier" body="#c23b4e" mood={t > lostAt ? "sad" : "angry"} arms={t > lostAt ? [10, 10] : [20, 150]} look={1} walk={rush > 0 && rush < 1 ? 1 : 0} />
          ))}
          <Swords x={1720} y={380} k={pop(t, rushAt + 0.6)} broken={ramp(t, lostAt, 0.8)} />
          <g opacity={ramp(t, rushAt + 0.4)}>
            <Tag x={1520} y={200} text="поспешная битва" size={36} color={C.coral} textColor="#fff" />
          </g>
          <Cross x={1720} y={370} s={110} k={ramp(t, lostAt + 0.4, 0.5)} />
        </g>
      )}
      {/* Серторий */}
      <g opacity={1 - ramp(t, L1 - 0.2, 0.8)}>
        <Figure x={820} y={790} s={1.05} t={t} role="soldier" body="#7a3a8a" mood={t > lostAt ? "worried" : "neutral"} arms={t > rushAt && t < lostAt ? [12, 110] : [12, 30]} look={1} talk={0} />
        <Lbl x={820} y={490} text="Серторий" size={38} k={ramp(t, at(c, 0.2))} />
      </g>
      {/* ── фаза 2: кляча и могучий конь ── */}
      {horsesK > 0.01 && (
        <g opacity={horsesK}>
          <Horse x={NX} y={790} s={NS} t={t} old pull={pull} />
          <g transform={`rotate(${t > pullAt ? -10 - Math.abs(Math.sin((t - pullAt) * 2.4)) * 6 : 0} ${manX} 790)`}>
            <Figure x={manX} y={790} s={1.12} t={t} role="peasant" body="#b35a4a" mood={t > pullAt ? "angry" : "proud"} arms={[25, 82]} look={1} />
          </g>
          <Sweat x={manX + 40} y={530} t={t} k={t > pullAt + 0.5 ? 1 : 0} />
          <Lbl x={manX + 20} y={470} text="силач" size={32} color={C.inkSoft} k={ramp(t, pullAt - 0.3)} />
          <Horse x={HX} y={790} s={HS} t={t} flip strands={1 - plucked * 0.82} />
          <Figure x={skinnyX} y={790} s={0.8} t={t} role="peasant" body="#8aa0b8" mood={t > pluckAt ? "sly" : "neutral"} arms={[15, t > pluckAt ? 72 + Math.sin(t * 6) * 6 : 20]} look={-1} flip />
          <Lbl x={skinnyX} y={545} text="щуплый" size={32} color={C.inkSoft} k={ramp(t, pluckAt - 0.3)} />
          {/* вырванные волоски улетают */}
          {hairs.map((h, i) => {
            const ph = (t - h) / 1.8;
            if (ph <= 0 || ph >= 1) return null;
            const ox = HX + 178 * HS;
            const oy = 790 - 120 * HS;
            const hx = ox + ph * (60 + (i % 3) * 30);
            const hy = oy - ph * (180 + (i % 4) * 30) + ph * ph * 60;
            return <path key={i} d="M 0 0 q 14 -10 30 -4 q 14 6 26 -4" transform={`translate(${hx} ${hy}) rotate(${ph * 260 + i * 40})`} stroke="#2e1a0c" strokeWidth={4} fill="none" strokeLinecap="round" opacity={1 - ph} />;
          })}
          <Card x={830} y={360} text="рывком" size={38} icon="cross" k={pop(t, at(c, 1.42)) * (1 - ramp(t, L2 - 0.2))} />
          <Card x={1590} y={360} text="по волоску" size={38} icon="check" k={pop(t, at(c, 1.9)) * (1 - ramp(t, L2 - 0.2))} />
        </g>
      )}
      <Ribbon x={1220} y={410} text="Время — друг терпеливых" size={40} k={pop(t, at(c, 2.25))} color={C.greenDeep} />
    </g>
  );
};

// ───────────── g27 · Фуше ─────────────

const Emblem: React.FC<{ kind: number; s?: number }> = ({ kind, s = 1 }) => {
  if (kind === 0)
    // фригийский колпак
    return (
      <g transform={`scale(${s})`}>
        <path d="M -40 26 Q -46 -20 -10 -38 Q 30 -50 44 -14 Q 30 -26 22 -10 Q 34 6 40 26 Z" fill={C.red} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <rect x={-44} y={20} width={88} height={14} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />
        <circle cx={-18} cy={8} r={9} fill="#2f5fb0" stroke="#fff" strokeWidth={4} />
      </g>
    );
  if (kind === 1)
    // трёхцветная кокарда
    return (
      <g transform={`scale(${s})`}>
        <circle r={40} fill={C.red} stroke={OL} strokeWidth={4} />
        <circle r={27} fill="#fff" />
        <circle r={14} fill="#2f5fb0" />
      </g>
    );
  if (kind === 2)
    // двууголка
    return (
      <g transform={`scale(${s})`}>
        <path d="M -54 14 Q 0 -60 54 14 Q 0 0 -54 14 Z" fill="#1f2a3a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={0} cy={-14} r={8} fill={C.red} stroke="#fff" strokeWidth={3} />
      </g>
    );
  return <Crown x={0} y={8} s={0.5 * s} />;
};
const REGIMES = [
  { name: "Революция", color: C.red },
  { name: "Робеспьер", color: "#2f5fb0" },
  { name: "Наполеон", color: "#2e5c3a" },
  { name: "Король", color: C.purple },
];

const Armchair: React.FC<{ x: number; y: number; part: "back" | "front" }> = ({ x, y, part }) =>
  part === "back" ? (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -110 -120 L -110 -330 Q -110 -380 0 -385 Q 110 -380 110 -330 L 110 -120 Z" fill={C.velvet} stroke={OL} strokeWidth={5} />
      {[-50, 0, 50].map((bx) => (
        <circle key={bx} cx={bx} cy={-300} r={6} fill={C.velvetDeep} />
      ))}
    </g>
  ) : (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-130} y={-128} width={260} height={70} rx={20} fill={C.velvet} stroke={OL} strokeWidth={5} />
      <rect x={-150} y={-210} width={50} height={150} rx={22} fill={C.velvetDeep} stroke={OL} strokeWidth={5} />
      <rect x={100} y={-210} width={50} height={150} rx={22} fill={C.velvetDeep} stroke={OL} strokeWidth={5} />
      <rect x={-130} y={-60} width={20} height={60} fill="#7a5530" stroke={OL} strokeWidth={3} />
      <rect x={110} y={-60} width={20} height={60} fill="#7a5530" stroke={OL} strokeWidth={3} />
    </g>
  );

export const Fouche: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const L2 = at(c, 2);
  // фаза 1: смена режимов
  const p1 = 1 - ramp(t, L1 - 0.3, 0.7);
  const regAt = [0.32, 0.43, 0.51, 0.64].map((f) => at(c, f));
  let cur = -1;
  regAt.forEach((a, i) => {
    if (t > a) cur = i;
  });
  const pos = [-160, -120, -60, -20].map((d) => {
    const a = (d * Math.PI) / 180;
    return { x: 700 + Math.cos(a) * 400, y: 560 + Math.sin(a) * 330 };
  });
  const turn = cur >= 0 ? ramp(t, regAt[cur], 0.7) : 0;
  const prevC = cur > 0 ? REGIMES[cur - 1].color : "#2f6f8f";
  const fColor = cur >= 0 ? (turn < 0.5 ? prevC : REGIMES[cur].color) : "#2f6f8f";
  // фаза 2: кресло, окно, лестница
  const roomK = ramp(t, L1 - 0.2, 0.7) * (1 - ramp(t, L2 - 0.3, 0.7));
  const coupAt = at(c, 1.05);
  const policeAt = at(c, 1.55);
  const riseAt = policeAt + 0.6;
  const toWin = outCubic((t - riseAt) / 1.6);
  const climb = ramp(t, riseAt + 1.7, 1.2);
  const gone = t > riseAt + 2.9;
  const doorAt = riseAt + 3.0;
  const cops = outCubic((t - doorAt - 0.4) / 2.0);
  const surprised = t > doorAt + 2.4;
  const sitting = t < riseAt + 0.3;
  const peek = Math.sin(t * 1.1) > 0.85;
  const fx = sitting ? 470 : lerp(470, 790, toWin);
  // фаза 3: весы
  const scaleK = ramp(t, L2, 0.8);
  const tilt = 9 * ramp(t, at(c, 2.75), 1.2) + Math.sin(t * 1.4) * 1.2;
  const SC = 845;
  const lp = { x: SC - 300 * Math.cos((tilt * Math.PI) / 180), y: 300 + 300 * Math.sin((tilt * Math.PI) / 180) };
  const rp = { x: SC + 300 * Math.cos((tilt * Math.PI) / 180), y: 300 - 300 * Math.sin((tilt * Math.PI) / 180) };
  return (
    <g>
      {/* ── фаза 1 ── */}
      {p1 > 0.01 && (
        <g opacity={p1}>
          <ellipse cx={700} cy={560} rx={400} ry={330} fill="none" stroke={C.inkSoft} strokeWidth={4} strokeDasharray="10 16" strokeDashoffset={-t * 20} opacity={0.35 * ramp(t, regAt[0])} />
          {REGIMES.map((r, i) => {
            const k = pop(t, regAt[i]);
            if (k <= 0.01) return null;
            const P = pos[i];
            const active = i === cur;
            return (
              <PopAt key={r.name} k={k} x={P.x} y={P.y}>
                <g transform={`translate(${P.x} ${P.y + wob(t, i, 3)})`}>
                  {active && <circle r={86} fill={C.goldLight} opacity={0.6 + 0.15 * Math.sin(t * 3)} />}
                  <circle r={70} fill="#fff" stroke={active ? C.goldDeep : OL} strokeWidth={active ? 7 : 4} />
                  <Emblem kind={i} s={1.05} />
                </g>
                <Lbl x={P.x} y={P.y + 112} text={r.name} size={32} color={active ? r.color : C.inkSoft} />
              </PopAt>
            );
          })}
          {cur >= 0 && <Arrow x1={700} y1={470} x2={lerp(700, pos[cur].x, 0.72)} y2={lerp(470, pos[cur].y, 0.72)} k={turn} color={C.goldDeep} w={9} bend={0.1} />}
          <Figure x={700} y={800} s={1.02} t={t} role="minister" body={fColor} mood={cur >= 0 ? "sly" : "neutral"} arms={[12, cur >= 0 ? 60 : 14]} look={cur >= 0 ? (pos[cur].x > 700 ? 1 : -1) : 0} />
          <Lbl x={575} y={610} text="Фуше" size={38} k={ramp(t, at(c, 0.12))} />
          <Card x={700} y={160} text="мастер момента" size={38} k={pop(t, at(c, 0.86))} fill={C.goldLight} />
        </g>
      )}
      {/* ── фаза 2: комната ── */}
      <Stage id="fouche-room" x={60} y={100} w={1280} h={770} wall="#e9e0f2" floor="#c9a77a" floorY={700} k={roomK}>
        {[200, 500, 800, 1100].map((px) => (
          <rect key={px} x={px - 100} y={150} width={200} height={500} rx={12} fill="none" stroke="#d3c6e3" strokeWidth={4} />
        ))}
        {/* окно и лестница */}
        <rect x={680} y={230} width={240} height={300} rx={10} fill="#a8dcf7" stroke={OL} strokeWidth={5} />
        <circle cx={860} cy={290} r={26} fill="#fff" opacity={0.7} />
        <path d="M 730 540 L 740 330 M 870 540 L 860 330" stroke="#8a5a2b" strokeWidth={10} strokeLinecap="round" />
        {[360, 400, 440, 480, 520].map((ry) => (
          <line key={ry} x1={735} x2={866} y1={ry} y2={ry} stroke="#8a5a2b" strokeWidth={7} />
        ))}
        <rect x={672} y={526} width={256} height={18} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
        <path d="M 680 230 L 800 230 L 800 380 L 680 230 Z" fill="none" />
        <rect x={676} y={226} width={248} height={308} rx={10} fill="none" stroke={OL} strokeWidth={5} />
        <line x1={800} y1={230} x2={800} y2={530} stroke={OL} strokeWidth={5} />
        <path d={`M 660 220 Q ${640 + Math.sin(t * 2) * 10} 380 670 545 L 690 545 L 690 220 Z`} fill={C.purpleLight} stroke={OL} strokeWidth={3} />
        {/* дверь */}
        <rect x={1100} y={420} width={180} height={300} fill="#5b3a1a" stroke={OL} strokeWidth={5} />
        <g transform={`translate(1100 420) scale(${1 - 0.8 * ramp(t, doorAt, 0.6)} 1)`}>
          <rect x={0} y={0} width={180} height={300} fill="#a8733c" stroke={OL} strokeWidth={5} />
          <rect x={20} y={20} width={140} height={110} rx={6} fill="none" stroke={OL} strokeWidth={3} />
          <rect x={20} y={160} width={140} height={120} rx={6} fill="none" stroke={OL} strokeWidth={3} />
          <circle cx={150} cy={150} r={8} fill={C.gold} stroke={OL} strokeWidth={2} />
        </g>
        {/* кресло и Фуше */}
        <Armchair x={470} y={790} part="back" />
        {!gone && (
          <g opacity={1 - climb}>
            <g transform={climb > 0 ? `translate(${(800 - fx) * 0} ${-climb * 230}) ` : undefined}>
              <Figure x={fx} y={sitting ? 730 : 790 - toWin * 260 * ramp(t, riseAt + 1.0, 0.7)} s={sitting ? 0.92 : 0.92 - 0.2 * toWin} t={t} role="minister" body="#2e5c3a" mood={sitting ? (peek ? "sly" : "sleep") : "sly"} arms={sitting ? [8, 8] : [100, 140]} look={sitting ? 0 : 1} walk={!sitting && toWin < 1 ? 1 : 0} />
            </g>
          </g>
        )}
        <Armchair x={470} y={790} part="front" />
        {sitting && t > L1 && (
          <g>
            {[0, 1, 2].map((i) => {
              const ph = (t * 0.5 + i / 3) % 1;
              return <Lbl key={i} x={540 + ph * 60 + i * 10} y={470 - ph * 110} text="z" size={30 + i * 10} color={C.purple} k={Math.sin(ph * Math.PI)} />;
            })}
          </g>
        )}
        {/* полицейские */}
        {t > doorAt + 0.3 &&
          [0, 1].map((i) => (
            <Figure key={i} x={lerp(1190, 640 + i * 190, cops)} y={790} s={0.9} t={t} role="soldier" body="#2a3f7a" mood={surprised ? "shock" : "angry"} arms={surprised ? [130, 130] : [12, 40]} look={-1} walk={cops < 1 ? 1 : 0} flip />
          ))}
        {surprised && (
          <g>
            <QMark x={640} y={480} k={pop(t, doorAt + 2.4)} t={t} />
            <QMark x={830} y={470} k={pop(t, doorAt + 2.6)} t={t} />
          </g>
        )}
      </Stage>
      {roomK > 0.01 && (
        <g opacity={roomK}>
          <Card x={300} y={180} text="1799 · переворот" size={36} k={pop(t, coupAt)} fill="#fff" />
          <Card x={300} y={270} text="остался министром" size={32} icon="check" k={pop(t, coupAt + 2.2)} fill="#fff" />
          <Year x={1190} y={180} text="1815" k={pop(t, policeAt)} />
        </g>
      )}
      {/* ── фаза 3: весы ── */}
      {scaleK > 0.01 && (
        <g opacity={scaleK}>
          <Figure x={190} y={800} s={0.82} t={t} role="minister" body="#9aa3b2" mood="sly" arms={[12, 12]} look={1} />
          <Card x={200} y={500} text="приспособленец" size={28} k={pop(t, at(c, 2.3))} fill="#e6e9ef" color={C.inkSoft} />
          <rect x={SC - 15} y={300} width={30} height={500} fill="#c98a0b" stroke={OL} strokeWidth={4} />
          <path d={`M ${SC - 120} 800 L ${SC + 120} 800 L ${SC + 80} 770 L ${SC - 80} 770 Z`} fill={C.goldDeep} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          <line x1={lp.x} y1={lp.y} x2={rp.x} y2={rp.y} stroke={C.goldDeep} strokeWidth={16} strokeLinecap="round" />
          <circle cx={SC} cy={300} r={16} fill={C.gold} stroke={OL} strokeWidth={4} />
          {[lp, rp].map((P, i) => (
            <g key={i}>
              <path d={`M ${P.x} ${P.y} L ${P.x - 110} ${P.y + 200} M ${P.x} ${P.y} L ${P.x + 110} ${P.y + 200}`} stroke={OL} strokeWidth={3} />
              <path d={`M ${P.x - 140} ${P.y + 200} L ${P.x + 140} ${P.y + 200} Q ${P.x + 120} ${P.y + 250} ${P.x} ${P.y + 250} Q ${P.x - 120} ${P.y + 250} ${P.x - 140} ${P.y + 200} Z`} fill={C.gold} stroke={OL} strokeWidth={4} />
            </g>
          ))}
          <Card x={lp.x} y={lp.y + 150} text="умение ждать" size={36} icon="check" k={pop(t, at(c, 2.55))} fill="#e3f7ea" />
          <Card x={rp.x} y={rp.y + 150} text={"служить\nкому угодно"} size={34} icon="cross" k={pop(t, at(c, 2.82))} fill="#fde5e5" />
        </g>
      )}
    </g>
  );
};

// ───────────── g28 · Наполеон у камина ─────────────

const Fire: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[
      [-40, 0.8, C.red],
      [36, 0.85, C.red],
      [0, 1.15, "#ff8a3b"],
      [-16, 0.7, C.yellow],
      [18, 0.65, C.yellow],
    ].map(([dx, hh, col], i) => {
      const h = 110 * Number(hh) * (1 + 0.12 * Math.sin(t * 7 + i * 1.9));
      const sw = Math.sin(t * 5 + i) * 8;
      const d = Number(dx);
      return <path key={i} d={`M ${d - 30} 0 Q ${d - 34} ${-h * 0.5} ${d + sw} ${-h} Q ${d + 34} ${-h * 0.5} ${d + 30} 0 Z`} fill={String(col)} opacity={0.92} />;
    })}
    <rect x={-80} y={-6} width={160} height={20} rx={8} fill="#6b4a1e" stroke={OL} strokeWidth={3} />
  </g>
);

const Goblet: React.FC<{ broken: number }> = ({ broken }) =>
  broken <= 0 ? (
    <g transform="translate(0 -6)">
      <path d="M -16 -50 L 16 -50 Q 18 -20 0 -14 Q -18 -20 -16 -50 Z" fill="#dff3ff" stroke={OL} strokeWidth={3} />
      <path d="M -14 -38 L 14 -38 Q 14 -22 0 -18 Q -14 -22 -14 -38 Z" fill={C.velvet} opacity={0.85} />
      <path d="M 0 -14 L 0 6 M -12 8 L 12 8" stroke={OL} strokeWidth={4} strokeLinecap="round" />
    </g>
  ) : (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = -Math.PI / 2 + (i - 2.5) * 0.5;
        const d = broken * 90;
        return <path key={i} transform={`translate(${Math.cos(a) * d} ${-40 + Math.sin(a) * d + broken * broken * 60}) rotate(${broken * 300 + i * 60})`} d="M -13 -10 L 13 -13 L 6 13 Z" fill="#dff3ff" stroke={OL} strokeWidth={3} opacity={1 - broken * broken} />;
      })}
    </g>
  );

export const Fireplace: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const L2 = at(c, 2);
  const plotAt = at(c, 0.72);
  const yell = t > L1;
  const breakAt = at(c, 1.7);
  const broken = ramp(t, breakAt, 1.6);
  const back = ramp(t, at(c, 1.3), 1.2);
  const sayAt = at(c, 2.03);
  const leaveAt = at(c, 2.36);
  const walk = clamp01((t - leaveAt) / 3.5);
  const tx = lerp(1460, 1960, walk);
  const crackAt = at(c, 2.8);
  const crack = ramp(t, crackAt, 1.0);
  const shaken = t > at(c, 2.5);
  return (
    <g>
      <Stage id="fire-hall" x={580} y={100} w={1280} h={770} wall="#f2e4c8" floor="#b98a5a" floorY={720}>
        {[700, 980, 1260, 1540].map((px) => (
          <rect key={px} x={px - 22} y={100} width={44} height={620} fill="#e8d5ae" stroke="#d4bd8f" strokeWidth={3} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M ${580 + i * 120} 720 L ${520 + i * 120} 870`} stroke="#9c6f42" strokeWidth={3} opacity={0.5} />
        ))}
        {/* камин */}
        <g>
          <rect x={1560} y={470} width={320} height={260} fill="#d9cbb5" stroke={OL} strokeWidth={5} />
          <rect x={1540} y={450} width={360} height={36} rx={6} fill="#efe4d0" stroke={OL} strokeWidth={5} />
          <path d="M 1610 730 L 1610 580 Q 1720 520 1830 580 L 1830 730 Z" fill="#3a2a22" stroke={OL} strokeWidth={5} />
          <circle cx={1720} cy={690} r={80} fill="#ffb347" opacity={0.18 + 0.06 * Math.sin(t * 5)} />
          <Fire x={1720} y={720} t={t} s={0.9} />
          {/* подсвечник на камине */}
          <rect x={1600} y={410} width={14} height={40} fill="#fff" stroke={OL} strokeWidth={3} />
          <path d={`M 1607 410 q ${-6 + Math.sin(t * 6) * 2} -12 0 -22 q 6 10 0 22 Z`} fill={C.yellow} />
        </g>
        {/* портрет императора */}
        <g transform={`rotate(${shaken ? 3 * crack + Math.sin(t * 1.5) * 0.5 : 0} 1180 150)`}>
          <rect x={1070} y={150} width={220} height={260} rx={8} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
          <rect x={1090} y={170} width={180} height={220} fill="#cfe0ee" />
          <path d="M 1120 390 Q 1130 300 1180 296 Q 1230 300 1240 390 Z" fill="#2e5c3a" stroke={OL} strokeWidth={3} />
          <circle cx={1180} cy={262} r={30} fill="#f2c79b" stroke={OL} strokeWidth={3} />
          <path d="M 1130 240 Q 1180 196 1230 240 Q 1180 228 1130 240 Z" fill="#1f2a3a" stroke={OL} strokeWidth={3} />
          {crack > 0 && <path d="M 1150 170 L 1170 230 L 1150 270 L 1190 330 L 1172 390" fill="none" stroke={OL} strokeWidth={5} strokeDasharray={300} strokeDashoffset={300 * (1 - crack)} strokeLinejoin="round" />}
        </g>
        {/* министры */}
        {[0, 1, 2].map((i) => (
          <Figure key={i} x={1080 + i * 120 + back * 30} y={720 - back * 30} s={0.74 - back * 0.06} t={t} role="courtier" body={["#3fb67c", "#6cc5f0", "#c98a0b"][i]} mood={yell ? "worried" : shaken ? "shock" : "neutral"} arms={yell ? [30, 30] : [12, 12]} look={-1} walk={back > 0 && back < 1 ? 0.6 : 0} />
        ))}
        {/* Наполеон */}
        <Figure x={860} y={800} s={1.02} t={t} role="general" mood={shaken ? "shock" : yell ? "angry" : "worried"} arms={yell && broken < 1 ? [140 + Math.sin(t * 9) * 12, 130] : shaken ? [12, 30] : [12, 12]} look={1} talk={yell && t < L2 ? 1 : 0} hold={yell ? <Goblet broken={broken} /> : undefined} />
        <Anger x={860} y={590} t={t} k={yell && t < L2 + 0.5 ? ramp(t, L1, 0.4) : 0} s={1.1} />
        {/* Талейран */}
        <g opacity={1 - ramp(t, leaveAt + 2.6, 0.9)}>
          <Figure x={tx} y={800} s={0.98} t={t} role="minister" body="#5a4a8a" mood={t > sayAt ? "sly" : "neutral"} arms={[12, 12]} look={walk > 0 ? 1 : -1} walk={walk > 0 && walk < 1 ? 0.8 : 0} />
        </g>
      </Stage>
      <Lbl x={860} y={476} text="Наполеон" size={36} k={ramp(t, at(c, 0.4)) * (1 - ramp(t, plotAt - 0.3))} />
      <Lbl x={1460} y={486} text="Талейран" size={36} k={ramp(t, at(c, 0.6)) * (1 - ramp(t, leaveAt))} />
      <Year x={720} y={170} text="1809" k={pop(t, at(c, 0.42))} />
      <Say x={930} y={400} text="заговор?" size={38} k={pop(t, plotAt) * (1 - ramp(t, L1 - 0.2, 0.4))} tail={[880, 500]} />
      <Card x={1460} y={410} text="спокоен" size={34} k={pop(t, at(c, 1.82)) * (1 - ramp(t, sayAt - 0.4))} fill="#e3f2ff" />
      <Say x={1500} y={390} text={"…так дурно\nвоспитан"} size={34} font={SERIF} k={pop(t, sayAt) * (1 - ramp(t, leaveAt + 0.4))} tail={[1490, 520]} />
      <Ribbon x={1180} y={448} text="Начало конца" size={40} k={pop(t, crackAt + 0.5)} />
    </g>
  );
};

// ───────────── g29 · чайная мельница судьи ─────────────

const TeaMillIcon: React.FC<{ x: number; y: number; t: number; spin: number; s?: number }> = ({ x, y, t, spin, s = 1 }) => {
  const a = t * 2.6 * spin;
  const hx = Math.cos(a) * 44;
  const hy = Math.sin(a) * 9;
  const front = Math.sin(a) > 0;
  const handle = (
    <g>
      <line x1={hx} y1={-98 + hy} x2={hx} y2={-150 + hy} stroke="#7a5530" strokeWidth={10} strokeLinecap="round" />
      <circle cx={hx} cy={-152 + hy} r={9} fill="#a8733c" stroke={OL} strokeWidth={3} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={96} ry={18} fill="#8a6a3a" stroke={OL} strokeWidth={4} />
      <rect x={-66} y={-54} width={132} height={52} rx={10} fill="#9aa1a8" stroke={OL} strokeWidth={4} />
      <path d="M 66 -24 L 98 -12 L 98 -2 L 66 -10 Z" fill="#9aa1a8" stroke={OL} strokeWidth={3} />
      {!front && handle}
      <rect x={-58} y={-100} width={116} height={48} rx={10} fill="#b8bfc6" stroke={OL} strokeWidth={4} />
      <path d={`M -58 -76 L 58 -76`} stroke="#8a9198" strokeWidth={3} />
      <circle cx={0} cy={-100} r={10} fill="#7a8188" stroke={OL} strokeWidth={3} />
      {front && handle}
    </g>
  );
};

const TeaBowl: React.FC<{ x: number; y: number; s?: number; lumpy?: boolean; fill?: number; t?: number }> = ({ x, y, s = 1, lumpy, fill = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {fill > 0 &&
      (lumpy ? (
        <g>
          <path d={`M -54 -16 Q -40 ${-40 * fill} -20 ${-30 * fill} Q -6 ${-56 * fill} 12 ${-34 * fill} Q 30 ${-48 * fill} 54 -16 Z`} fill="#6fa83c" stroke={OL} strokeWidth={3} />
          {[
            [-30, -34],
            [8, -46],
            [34, -30],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy * fill + Math.sin(t * 2 + i) * 1} r={9} fill="#4f8a2a" stroke={OL} strokeWidth={2} />
          ))}
        </g>
      ) : (
        <path d={`M -54 -16 Q 0 ${-16 - 44 * fill} 54 -16 Z`} fill="#8fcf5a" stroke={OL} strokeWidth={3} />
      ))}
    <path d="M -64 -18 L 64 -18 Q 60 30 0 34 Q -60 30 -64 -18 Z" fill="#3a3550" stroke={OL} strokeWidth={4} />
    <path d="M -54 0 Q 0 14 54 0" stroke={C.velvet} strokeWidth={5} fill="none" />
  </g>
);

export const TeaMill: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L1 = at(c, 1);
  const L2 = at(c, 2);
  const hallK = 1 - ramp(t, L2 - 0.2, 0.8);
  const fearAt = at(c, 0.3);
  const screenAt = at(c, 0.6);
  const millAt = at(c, 0.74);
  const grind = t > millAt + 0.5;
  const unevenAt = at(c, 1.15);
  const uneven = t > unevenAt && t < unevenAt + 4.5;
  const screenK = outCubic((t - screenAt) / 1.0);
  const pondK = ramp(t, L2, 0.8);
  const muddy = ramp(t, at(c, 2.2), 2.0);
  return (
    <g>
      <Stage id="tea-hall" x={60} y={100} w={1280} h={770} wall="#f4e8cf" floor="#d9cf9a" floorY={700} k={hallK}>
        {/* балки и столбы */}
        <rect x={60} y={100} width={1280} height={36} fill="#6b4a2b" />
        {[110, 1290].map((px) => (
          <rect key={px} x={px - 18} y={100} width={36} height={600} fill="#7a5530" stroke={OL} strokeWidth={3} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={60 + i * 190} y={700} width={190} height={180} fill="none" stroke="#b8ad78" strokeWidth={4} />
        ))}
        {/* свиток-какэмоно на стене */}
        <rect x={1150} y={170} width={90} height={230} fill="#fffaf0" stroke={OL} strokeWidth={3} />
        <path d="M 1195 200 L 1195 370" stroke={C.ink} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        <path d="M 1180 250 L 1210 250 M 1176 320 L 1214 320" stroke={C.ink} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
        {/* просители */}
        {[200, 330].map((x, i) => (
          <Figure key={x} x={x} y={790} s={0.86} t={t} role="peasant" body={i ? "#7a8a5a" : "#9c7a4a"} mood={t > fearAt && t < L1 ? "worried" : "neutral"} bow={t > fearAt ? 0.3 : 0.1} arms={[30, 30]} look={1} />
        ))}
        <Sweat x={250} y={540} t={t} k={t > fearAt && t < L1 ? 1 : 0} />
        {/* судья за низким столиком */}
        <Figure x={900} y={790} s={0.94} t={t} role="modern" body="#3b3f6b" mood={t < screenAt ? "angry" : uneven ? "worried" : "neutral"} arms={[18, grind ? 72 + Math.sin(t * 2.6) * 8 : 20]} look={1} />
        {/* шапка-эбоси */}
        <path d={`M ${900 - 30} ${790 - 0.94 * 268 + Math.sin(t * 2.6 + 9) * 2} Q ${900 - 30} ${790 - 0.94 * 312} ${900 + 2} ${790 - 0.94 * 318} Q ${900 + 32} ${790 - 0.94 * 306} ${900 + 30} ${790 - 0.94 * 268 + Math.sin(t * 2.6 + 9) * 2} Z`} fill="#1f2230" stroke={OL} strokeWidth={4} />
        <rect x={830} y={688} width={420} height={22} rx={6} fill="#7a3a22" stroke={OL} strokeWidth={4} />
        <rect x={850} y={708} width={380} height={50} fill="#5b2a18" stroke={OL} strokeWidth={4} />
        {t > millAt && (
          <PopAt k={pop(t, millAt)} x={1060} y={690}>
            <TeaMillIcon x={1060} y={690} t={t} spin={grind ? (uneven ? 0.45 + 0.55 * Math.abs(Math.sin(t * 3)) : 1) : 0} s={0.9} />
            {/* порошок сыплется */}
            {grind &&
              Array.from({ length: 6 }).map((_, i) => {
                const ph = (t * 1.3 + i / 6) % 1;
                const r = uneven ? (i % 2 ? 7 : 3) : 3;
                return <circle key={i} cx={1150 + Math.sin(i * 3) * (uneven ? 5 : 1.5)} cy={683 + ph * 26} r={r} fill="#6fa83c" opacity={1 - ph * 0.5} />;
              })}
            <TeaBowl x={1160} y={700} s={0.55} lumpy={uneven} fill={clamp01((t - millAt - 0.5) / 6)} t={t} />
          </PopAt>
        )}
        {/* бумажная ширма */}
        {screenK > 0.01 && (
          <g transform={`translate(0 ${(1 - screenK) * 420})`}>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect x={440 + i * 110} y={330} width={110} height={390} fill="#fffaf0" opacity={0.96} stroke="#6b4a2b" strokeWidth={6} />
                {[1, 2, 3, 4, 5].map((j) => (
                  <line key={j} x1={440 + i * 110} x2={550 + i * 110} y1={330 + j * 65} y2={330 + j * 65} stroke="#8a6a44" strokeWidth={3} />
                ))}
                <line x1={495 + i * 110} x2={495 + i * 110} y1={330} y2={720} stroke="#8a6a44" strokeWidth={3} />
              </g>
            ))}
          </g>
        )}
      </Stage>
      {hallK > 0.01 && (
        <g opacity={hallK}>
          <Lbl x={900} y={455} text="судья Итакура" size={34} k={ramp(t, at(c, 0.12))} />
          <Cloud x={960} y={430} t={t} k={pop(t, fearAt) * (1 - ramp(t, screenAt, 0.5))} rain={false} s={0.7} />
          <g opacity={show(t, fearAt + 0.3, L1)}>
            <Tag x={265} y={505} text="боятся резкости" size={30} color={C.coral} textColor="#fff" />
          </g>
          {/* две чаши: ровно / неровно */}
          <PopAt k={pop(t, L1 + 0.4)} x={700} y={240}>
            <rect x={590} y={150} width={220} height={210} rx={22} fill="#fff" stroke={C.green} strokeWidth={6} />
            <TeaBowl x={700} y={240} s={0.95} fill={1} />
            <Lbl x={700} y={322} text="ровно" size={32} color={C.greenDeep} />
            <Lbl x={700} y={352} text="спокоен" size={26} color={C.inkSoft} weight={800} />
          </PopAt>
          <PopAt k={pop(t, unevenAt)} x={960} y={240}>
            <rect x={850} y={150} width={220} height={210} rx={22} fill="#fff" stroke={C.red} strokeWidth={6} />
            <TeaBowl x={960} y={240} s={0.95} lumpy fill={1} t={t} />
            <Lbl x={960} y={322} text="неровно" size={32} color={C.red} />
            <Lbl x={960} y={352} text="раздражён" size={26} color={C.inkSoft} weight={800} />
          </PopAt>
          <Ribbon x={365} y={212} text="Гнев — признак бессилия" size={34} k={pop(t, at(c, 1.62))} color={C.purple} />
        </g>
      )}
      {/* ── «мутит воду» ── */}
      {pondK > 0.01 && (
        <g opacity={pondK}>
          <ellipse cx={500} cy={760} rx={470} ry={150} fill="#b6e2a4" opacity={0.75} />
          {[200, 240, 790, 830, 860].map((rx, i) => (
            <g key={rx} transform={`translate(${rx} ${i < 2 ? 690 : 700}) rotate(${Math.sin(t * 1.5 + i) * 4})`}>
              <path d="M 0 0 L 0 -90" stroke={C.greenDeep} strokeWidth={6} strokeLinecap="round" />
              <rect x={-7} y={-100} width={14} height={40} rx={7} fill="#8a5a2b" />
            </g>
          ))}
          <ellipse cx={520} cy={700} rx={330} ry={95} fill={`rgb(${Math.round(lerp(120, 160, muddy))}, ${Math.round(lerp(200, 150, muddy))}, ${Math.round(lerp(235, 110, muddy))})`} stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={400 + i * 85 + Math.sin(t * 0.9 + i) * 18} cy={690 + (i % 2) * 26 + Math.cos(t * 1.1 + i) * 6} rx={70 + 30 * muddy} ry={22 + 6 * muddy} fill="#7a5a32" opacity={0.35 * muddy} />
          ))}
          {/* рыбак */}
          <Figure x={170} y={720} s={0.95} t={t} role="merchant" mood="sly" arms={[20, 115]} look={1} />
          <line x1={170 + 105 * 0.95} y1={720 - 205 * 0.95} x2={560} y2={330} stroke="#7a5530" strokeWidth={7} strokeLinecap="round" />
          <path d={`M 560 330 Q ${575 + Math.sin(t * 2) * 8} 500 ${560 + Math.sin(t * 2) * 10} 690`} stroke={OL} strokeWidth={2.5} fill="none" />
          <circle cx={560 + Math.sin(t * 2) * 10} cy={690 + Math.sin(t * 3) * 3} r={9} fill={C.red} stroke={OL} strokeWidth={3} />
          <g opacity={ramp(t, at(c, 2.3))}>
            <Tag x={520} y={250} text="мутит воду" size={38} color={C.coral} textColor="#fff" />
          </g>
          {/* вопрос себе */}
          <PopAt k={pop(t, at(c, 2.55))} x={1080} y={430}>
            <g transform={`translate(0 ${wob(t, 7, 4)})`}>
              <Panel x={860} y={250} w={440} h={360} fill="#fff" stroke={C.purple} />
              <circle cx={1080} cy={350} r={58} fill={C.purpleLight} stroke={OL} strokeWidth={4} />
              <Txt x={1080} y={378} size={80} weight={900} color={C.purpleDeep}>
                ?
              </Txt>
              <Txt x={1080} y={480} size={38} weight={900}>
                {"Кому выгодно,\nчтобы я сорвался?"}
              </Txt>
            </g>
          </PopAt>
        </g>
      )}
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const STRATEGY_VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  brecht: Brecht,
  rothschild: Rothschild,
  chessMatch: ChessMatch,
  horseTail: HorseTail,
  fouche: Fouche,
  fireplace: Fireplace,
  teaMill: TeaMill,
};
