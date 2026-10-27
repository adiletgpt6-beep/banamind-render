// Часть «Два „я“» и итоги: ощущающее и вспоминающее «я», пик — конец, холодная вода,
// жизнь как история, иллюзия фокусировки, памятка «когда думать медленно», финал BanaMind.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, S1, S2 } from "../theme";
import { SystemOne, SystemTwo, Dot } from "./chars";
import { Bubble, OL, Person, Sun } from "./draw";
import { Arrow, Check, Cross, Panel, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ───────────── общие помощники ─────────────
const Head: React.FC<{ x: number; y: number; size?: number; color?: string; children: string }> = ({ x, y, size = 48, color = C.ink, children }) => (
  <text x={x} y={y} fontFamily="Rubik" fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
    {children}
  </text>
);
const fade = (t: number, a: number, b = Infinity, d = 0.45) => ramp(t, a, d) * (b === Infinity ? 1 : 1 - ramp(t, b - d, d));

const FEEL = { main: "#ff7a6b", deep: "#d9483b" };
const TELL = { main: "#8e6cf0", deep: "#6244c4" };
const BRAND_INK = "#1d2333";
const BRAND_YELLOW = "#ffd23f";

const Star: React.FC<{ x: number; y: number; r: number; on: number }> = ({ x, y, r, on }) => {
  const pts = Array.from({ length: 10 })
    .map((_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
    })
    .join(" ");
  return (
    <g>
      <polygon points={pts} fill="#fff" stroke={OL} strokeWidth={3} strokeLinejoin="round" opacity={0.7} />
      {on > 0 && <polygon points={pts} fill={C.yellowDeep} stroke={OL} strokeWidth={3} strokeLinejoin="round" opacity={clamp01(on)} />}
    </g>
  );
};

// Персонаж «я»: ощущающее (коралловое, шагает по «сейчас») или вспоминающее (фиолетовый рассказчик с книгой).
const Self: React.FC<{ x: number; y: number; s?: number; t: number; kind: "feel" | "tell"; walk?: number; talk?: number; book?: boolean; dim?: number }> = ({
  x,
  y,
  s = 1,
  t,
  kind,
  walk = 0,
  talk = 0,
  book = true,
  dim = 0,
}) => {
  const col = kind === "feel" ? FEEL : TELL;
  const step = Math.sin(t * 7) * walk;
  const bob = kind === "feel" ? Math.abs(Math.sin(t * 7)) * 6 * walk : Math.sin(t * 1.4) * 3;
  const blink = (t * 0.8 + (kind === "feel" ? 0 : 1.3)) % 3.6 < 0.12 ? 0.15 : 1;
  const mo = talk > 0 ? (0.5 + 0.5 * Math.sin(t * 16)) * talk : 0;
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${s})`} opacity={1 - dim * 0.55}>
      <ellipse cx={0} cy={bob / s + 4} rx={70} ry={12} fill="#000" opacity={0.08} />
      {/* ноги */}
      <path d={`M -24 -30 L ${-26 - step * 14} 0 M 24 -30 L ${26 + step * 14} 0`} stroke={OL} strokeWidth={11} strokeLinecap="round" />
      <ellipse cx={-28 - step * 14} cy={2} rx={20} ry={10} fill="#2b2b2b" />
      <ellipse cx={28 + step * 14} cy={2} rx={20} ry={10} fill="#2b2b2b" />
      {/* тело-капля */}
      <path d="M 0 -230 C 70 -230 80 -150 78 -90 C 76 -40 50 -24 0 -24 C -50 -24 -76 -40 -78 -90 C -80 -150 -70 -230 0 -230 Z" fill={col.main} stroke={OL} strokeWidth={6} />
      <ellipse cx={-34} cy={-180} rx={14} ry={22} fill="#fff" opacity={0.25} />
      {kind === "feel" ? (
        // сердечко-«ощущение» на груди
        <path transform="translate(0 -62) scale(0.7)" d="M 0 18 C -40 -10 -30 -40 -12 -40 C -4 -40 0 -32 0 -28 C 0 -32 4 -40 12 -40 C 30 -40 40 -10 0 18 Z" fill="#fff" stroke={OL} strokeWidth={4} />
      ) : (
        // шарф рассказчика
        <path d="M -60 -120 Q 0 -100 60 -120 L 58 -100 Q 0 -80 -58 -100 Z M 30 -104 L 40 -60 L 22 -62 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      )}
      {/* глаза */}
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d * 26} -170)`}>
          <ellipse rx={15} ry={Math.max(2, 17 * blink)} fill="#fff" stroke={OL} strokeWidth={4} />
          {blink > 0.5 && <circle cx={kind === "feel" ? 3 : -2} cy={kind === "tell" ? -4 : 0} r={7} fill={OL} />}
        </g>
      ))}
      {mo > 0.1 ? (
        <ellipse cx={0} cy={-136} rx={14} ry={5 + mo * 9} fill="#7a2e1e" stroke={OL} strokeWidth={4} />
      ) : (
        <path d="M -16 -138 Q 0 -124 16 -138" stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
      )}
      {kind === "tell" && book && (
        // раскрытая книга воспоминаний с кадрами плёнки
        <g transform="translate(0 -64)">
          <path d="M -80 -30 L 0 -20 L 80 -30 L 80 30 L 0 40 L -80 30 Z" fill="#fffdf4" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 0 -20 L 0 40" stroke={OL} strokeWidth={3} />
          {[-58, -26, 18, 50].map((fx, i) => (
            <rect key={i} x={fx - 12} y={-12} width={26} height={24} rx={3} fill={[C.sky, C.coral, C.green, C.yellow][i]} stroke={OL} strokeWidth={2} />
          ))}
        </g>
      )}
    </g>
  );
};

const Reel: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 46, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#4a5874" stroke={OL} strokeWidth={4} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={Math.cos((i * 2 * Math.PI) / 5) * r * 0.55} cy={Math.sin((i * 2 * Math.PI) / 5) * r * 0.55} r={r * 0.2} fill="#fffaf0" />
    ))}
    <circle r={r * 0.14} fill="#fffaf0" />
  </g>
);

const Wheel: React.FC<{ x: number; y: number; r?: number; rot?: number }> = ({ x, y, r = 70, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="none" stroke={OL} strokeWidth={22} />
    <circle r={r} fill="none" stroke="#5b6478" strokeWidth={14} />
    {[90, 210, 330].map((a) => (
      <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * r} y2={Math.sin((a * Math.PI) / 180) * r} stroke="#5b6478" strokeWidth={14} strokeLinecap="round" />
    ))}
    <circle r={r * 0.28} fill={C.yellow} stroke={OL} strokeWidth={4} />
  </g>
);

// ───────────── k35: Два «я» ─────────────
export const TwoSelves: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const L = pop(t, 0.2);
  const R = pop(t, at(c, 1));
  const decide = ramp(t, at(c, 2), 0.8);
  const shift = (t * 90) % 90;
  return (
    <g>
      {/* ощущающее «я» */}
      {L > 0.01 && (
        <g transform={`translate(360 470) scale(${0.85 + 0.15 * L})`} opacity={clamp01(L * 1.5) * (1 - decide * 0.45)}>
          <Panel x={-300} y={-360} w={600} h={680} fill="#fffdf7" />
          <Txt x={0} y={-290} size={44} color={FEEL.deep}>
            Ощущающее «я»
          </Txt>
          <Bubble x={-210} y={-250} w={420} h={84} tail={[-30, -150]} />
          <Txt x={0} y={-196} size={36}>
            Как мне сейчас?
          </Txt>
          <Self x={0} y={150} s={1.15} t={t} kind="feel" walk={1 - decide} talk={t < at(c, 1) ? 0.6 : 0} dim={decide} />
          {/* движущаяся лента времени */}
          <clipPath id="tsClip">
            <rect x={-270} y={150} width={540} height={110} />
          </clipPath>
          <g clipPath="url(#tsClip)">
            <line x1={-270} y1={190} x2={270} y2={190} stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" />
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1={-300 + i * 90 - shift * (1 - decide)} y1={174} x2={-300 + i * 90 - shift * (1 - decide)} y2={206} stroke={C.inkSoft} strokeWidth={6} />
            ))}
          </g>
          <path d="M 0 160 L -16 136 L 16 136 Z" fill={FEEL.deep} />
          <Tag x={0} y={262} text="сейчас" color={FEEL.main} textColor="#fff" size={34} />
        </g>
      )}
      {/* вспоминающее «я» */}
      {R > 0.01 && (
        <g transform={`translate(1000 470) scale(${0.85 + 0.15 * R})`} opacity={clamp01(R * 1.5)}>
          <Panel x={-300} y={-360} w={600} h={680} fill="#fffdf7" stroke={decide > 0 ? TELL.main : undefined} />
          <Txt x={0} y={-290} size={44} color={TELL.deep}>
            Вспоминающее «я»
          </Txt>
          <g opacity={1 - decide}>
            <Bubble x={-230} y={-250} w={460} h={84} tail={[40, -150]} />
            <Txt x={0} y={-196} size={36}>
              Как было в целом?
            </Txt>
          </g>
          <Self x={-30} y={190} s={1.15} t={t} kind="tell" talk={t > at(c, 1) && t < at(c, 2) ? 0.6 : 0} book={decide < 0.5} />
          <g opacity={1 - decide}>
            <Reel x={200} y={40} rot={t * 40} />
            <path d="M 160 60 Q 130 110 80 110" fill="none" stroke="#4a5874" strokeWidth={12} strokeDasharray="10 8" />
            <Tag x={0} y={262} text="рассказчик" color={TELL.main} textColor="#fff" size={34} />
          </g>
          {decide > 0 && (
            <g opacity={decide}>
              <Wheel x={-30} y={120} r={74 * (0.6 + 0.4 * decide)} rot={wob(t, 1, 8)} />
              <Arrow x1={110} y1={40} x2={230} y2={-40} k={ramp(t, at(c, 2.3), 0.6)} color={TELL.deep} w={9} />
              {ramp(t, at(c, 2.45), 0.5) > 0 && (
                <g opacity={ramp(t, at(c, 2.45), 0.5)}>
                  <Tag x={170} y={-90} text="будущее" color={C.yellow} size={32} />
                </g>
              )}
              <Tag x={0} y={262} text="решает рассказчик" color={TELL.deep} textColor="#fff" size={36} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ───────────── k36: Пик и конец ─────────────
const PX = 48; // пикселей на минуту
const PY = 20; // пикселей на балл боли
const X0 = 660;
const PAIN_A = [1, 3, 4, 6, 8, 6, 7, 6, 7];
const PAIN_B = [1, 3, 4, 6, 8, 7, 7, 6, 6, 5, 6, 5, 4, 5, 4, 3, 4, 3, 3, 2, 2, 2, 1, 1, 1];

const curvePts = (data: number[], base: number, upto: number) => {
  const pts: [number, number][] = [];
  const m = Math.min(upto, data.length - 1);
  for (let i = 0; i <= Math.floor(m); i++) pts.push([X0 + i * PX, base - data[i] * PY]);
  if (m > Math.floor(m) && Math.floor(m) + 1 < data.length) {
    const i = Math.floor(m);
    const f = m - i;
    pts.push([X0 + m * PX, base - (data[i] + (data[i + 1] - data[i]) * f) * PY]);
  }
  return pts;
};

const PainChart: React.FC<{ data: number[]; base: number; upto: number; area: number; title: string; color: string; endTag: string; peakK: number; endK: number }> = ({
  data,
  base,
  upto,
  area,
  title,
  color,
  endTag,
  peakK,
  endK,
}) => {
  const pts = curvePts(data, base, upto);
  const last = pts[pts.length - 1];
  const n = data.length - 1;
  const pk = data.indexOf(Math.max(...data));
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const full = curvePts(data, base, n);
  const areaD = `M ${X0} ${base} ${full.map((p) => `L ${p[0]} ${p[1]}`).join(" ")} L ${X0 + n * PX} ${base} Z`;
  return (
    <g>
      {/* оси */}
      <line x1={X0} y1={base} x2={X0 + 24 * PX + 20} y2={base} stroke={C.inkSoft} strokeWidth={4} opacity={0.5} />
      <line x1={X0} y1={base} x2={X0} y2={base - 10 * PY - 10} stroke={C.inkSoft} strokeWidth={4} opacity={0.5} />
      {Array.from({ length: 25 }).map((_, i) => (
        <line key={i} x1={X0 + i * PX} y1={base} x2={X0 + i * PX} y2={base + 8} stroke={C.inkSoft} strokeWidth={3} opacity={0.4} />
      ))}
      <Txt x={X0 - 14} y={base - 10 * PY + 10} size={26} anchor="end" color={C.inkSoft} weight={700}>
        10
      </Txt>
      <Txt x={X0 - 14} y={base + 8} size={26} anchor="end" color={C.inkSoft} weight={700}>
        0
      </Txt>
      {area > 0 && <path d={areaD} fill={color} opacity={0.35 * area} />}
      {pts.length > 1 && <path d={line} fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />}
      {pts.length > 0 && <circle cx={last[0]} cy={last[1]} r={9} fill={color} stroke={OL} strokeWidth={3} />}
      <Txt x={X0} y={base + 50} size={34} anchor="start">
        {title}
      </Txt>
      {peakK > 0 && (
        <g opacity={clamp01(peakK)}>
          <circle cx={X0 + pk * PX} cy={base - data[pk] * PY} r={14} fill="#fff" stroke={C.red} strokeWidth={6} />
          <Txt x={X0 + pk * PX} y={base - data[pk] * PY - 48} size={32} color={C.red}>
            пик 8
          </Txt>
        </g>
      )}
      {endK > 0 && (
        <g opacity={clamp01(endK)}>
          <circle cx={X0 + n * PX} cy={base - data[n] * PY} r={14} fill="#fff" stroke={C.skyDeep} strokeWidth={6} />
          <Txt x={X0 + n * PX + (n < 20 ? 30 : 0)} y={base - data[n] * PY + (n < 20 ? 12 : -56)} size={32} color={C.skyDeep} anchor={n < 20 ? "start" : "end"}>
            {endTag}
          </Txt>
        </g>
      )}
    </g>
  );
};

const Finder: React.FC<{ x: number; y: number; k: number; s?: number }> = ({ x, y, k, s = 34 }) => {
  if (k <= 0) return null;
  const z = s * (1.6 - 0.6 * clamp01(k));
  const d = s * 0.5;
  return (
    <g stroke={C.violet} strokeWidth={6} fill="none" strokeLinecap="round" opacity={clamp01(k * 1.5)}>
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([a, b], i) => (
        <path key={i} d={`M ${x + a * z} ${y + b * z - b * d} L ${x + a * z} ${y + b * z} L ${x + a * z - a * d} ${y + b * z}`} />
      ))}
    </g>
  );
};

const Camera: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-50} y={-30} width={100} height={66} rx={12} fill={C.violet} stroke={OL} strokeWidth={4} />
    <rect x={-22} y={-44} width={44} height={18} rx={5} fill={C.violet} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={4} r={22} fill="#fff" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={4} r={11} fill={C.ink} />
  </g>
);

export const PeakEnd: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const yA = 370;
  const yB = 680;
  const draw = ramp(t, at(c, 0.3), at(c, 1.6) - at(c, 0.3));
  const upto = draw * 24;
  const area = ramp(t, at(c, 2), 0.8) * (1 - 0.6 * ramp(t, at(c, 3), 0.6));
  const peakK = ramp(t, at(c, 1.25), 0.4);
  const endK = ramp(t, at(c, 1.55), 0.4);
  const fk = ramp(t, at(c, 2.35), 0.6);
  const mem = pop(t, at(c, 2.5));
  const pe = pop(t, at(c, 3.45));
  const clock = pop(t, at(c, 3.1));
  return (
    <g>
      <g opacity={ramp(t, 0.1, 0.5) * (1 - ramp(t, at(c, 2.4), 0.3))}>
        <Txt x={1840} y={150} size={30} anchor="end" color={C.inkSoft} weight={700}>
          боль каждую минуту
        </Txt>
      </g>
      <PainChart data={PAIN_A} base={yA} upto={upto} area={area} title="Пациент А · 8 мин" color={C.coral} endTag="конец 7" peakK={peakK} endK={endK} />
      <PainChart data={PAIN_B} base={yB} upto={upto} area={area} title="Пациент Б · 24 мин" color={C.skyDeep} endTag="конец 1" peakK={peakK} endK={endK} />
      {area > 0 && (
        <g opacity={ramp(t, at(c, 2.1), 0.5) * (1 - ramp(t, at(c, 3), 0.5))}>
          <Tag x={1380} y={652} text="страдал дольше" color="#fff" size={30} />
        </g>
      )}
      {/* камера памяти выбирает только пик и конец */}
      <Finder x={X0 + 4 * PX} y={yA - 8 * PY} k={fk} />
      <Finder x={X0 + 8 * PX} y={yA - 7 * PY} k={fk} />
      <Finder x={X0 + 4 * PX} y={yB - 8 * PY} k={fk} />
      <Finder x={X0 + 24 * PX} y={yB - 1 * PY} k={fk} />
      {mem > 0.01 && (
        <g transform={`translate(1550 260) scale(${0.85 + 0.15 * mem})`} opacity={clamp01(mem * 1.5)}>
          <Panel x={-320} y={-150} w={640} h={290} fill="#fffdf7" stroke={C.violet} r={30} />
          <Camera x={-250} y={-92} s={0.7} />
          <Txt x={-195} y={-80} size={36} anchor="start" color={C.violet}>
            в памяти осталось
          </Txt>
          <Txt x={-290} y={-6} size={32} anchor="start">
            А: пик 8 + конец 7
          </Txt>
          <rect x={60} y={-34} width={230 * clamp01(mem)} height={36} rx={18} fill={C.coral} stroke={OL} strokeWidth={3} />
          <Txt x={-290} y={64} size={32} anchor="start">
            Б: пик 8 + конец 1
          </Txt>
          <rect x={60} y={36} width={140 * clamp01(mem)} height={36} rx={18} fill={C.skyDeep} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={124} size={32} color={C.red}>
            хуже помнит А
          </Txt>
        </g>
      )}
      {pe > 0.01 && (
        <g transform={`translate(860 820) scale(${pe})`}>
          <Tag x={0} y={0} text="пик — конец" color={C.yellow} size={46} />
        </g>
      )}
      {clock > 0.01 && (
        <g opacity={clamp01(clock * 1.5)}>
          <g transform="translate(1180 806)">
            <circle r={38} fill="#fff" stroke={OL} strokeWidth={5} />
            <line x1={0} y1={0} x2={0} y2={-24} stroke={OL} strokeWidth={6} strokeLinecap="round" />
            <line x1={0} y1={0} x2={18} y2={8} stroke={OL} strokeWidth={6} strokeLinecap="round" />
          </g>
          <Cross x={1180} y={806} s={70} k={ramp(t, at(c, 3.2), 0.5)} />
          <Txt x={1240} y={818} size={32} anchor="start">
            длительность почти не учитывается
          </Txt>
        </g>
      )}
    </g>
  );
};

// ───────────── k37: Холодная вода ─────────────
const Tank: React.FC<{ x: number; y: number; t: number; warm?: boolean; dip: number }> = ({ x, y, t, warm, dip }) => {
  const id = warm ? "tankW" : "tankC";
  const sway = wob(t, warm ? 2 : 0, 3);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb8ec" />
          <stop offset="1" stopColor={warm ? "#a9dcf3" : "#2f8fd0"} />
        </linearGradient>
      </defs>
      {/* вода */}
      <rect x={-190} y={60} width={380} height={240} rx={18} fill={`url(#${id})`} opacity={0.9} />
      {warm && <ellipse cx={0} cy={250} rx={150} ry={40} fill="#ffb27a" opacity={0.28} />}
      <path d={`M -190 ${62 + sway} Q -95 ${50 - sway} 0 ${62 + sway} T 190 ${62 + sway}`} fill="none" stroke="#fff" strokeWidth={5} opacity={0.7} />
      {/* рука (входит сверху справа, обрезана над баком) */}
      <clipPath id={`${id}arm`}>
        <rect x={-200} y={-120} width={480} height={430} />
      </clipPath>
      <g clipPath={`url(#${id}arm)`}>
        <g transform={`translate(${30 - dip * 30} ${-90 + dip * 90}) rotate(20 0 130)`}>
          <rect x={-32} y={-120} width={64} height={250} rx={30} fill="#f2c79b" stroke={OL} strokeWidth={4} />
          <rect x={-44} y={-150} width={88} height={90} rx={18} fill={C.violet} stroke={OL} strokeWidth={4} />
          {[-22, -7, 8, 23].map((fx) => (
            <rect key={fx} x={fx - 8} y={110} width={16} height={52} rx={8} fill="#f2c79b" stroke={OL} strokeWidth={3} />
          ))}
        </g>
      </g>
      {/* стекло поверх руки */}
      <rect x={-190} y={60} width={380} height={240} rx={18} fill={warm ? "#9fd6f0" : "#4aa8e0"} opacity={0.5} />
      <rect x={-200} y={-10} width={400} height={320} rx={24} fill="none" stroke={OL} strokeWidth={6} />
      <path d="M -170 20 L -170 270" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
      {/* термометр */}
      <g transform="translate(250 40)">
        <rect x={-16} y={0} width={32} height={210} rx={16} fill="#fff" stroke={OL} strokeWidth={4} />
        <rect x={-7} y={warm ? 120 : 140} width={14} height={warm ? 110 : 90} rx={7} fill={warm ? "#ff9a6b" : C.skyDeep} />
        <circle cx={0} cy={236} r={26} fill={warm ? "#ff9a6b" : C.skyDeep} stroke={OL} strokeWidth={4} />
      </g>
    </g>
  );
};

export const ColdHand: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const xL = 360;
  const xR = 960;
  const A = pop(t, 0.2);
  const B = pop(t, at(c, 0.45));
  const dipA = ramp(t, 0.5, 0.8);
  const dipB = ramp(t, at(c, 0.5), 0.8);
  const q = fade(t, at(c, 1), at(c, 2));
  const win = ramp(t, at(c, 2), 0.6);
  const move = ramp(t, at(c, 2.2), 1);
  const dots = fade(t, at(c, 2.05), at(c, 3));
  const tyr = pop(t, at(c, 3));
  return (
    <g>
      {A > 0.01 && (
        <g opacity={clamp01(A * 1.5) * (1 - win * 0.4)}>
          <Tag x={xL - 110} y={195} text="Вариант 1" color="#fff" size={34} />
          <Tank x={xL} y={250} t={t} dip={dipA} />
          <Txt x={xL} y={630} size={40}>
            60 с, 14 °C
          </Txt>
          <rect x={xL - 180} y={654} width={240} height={30} rx={15} fill={C.skyDeep} stroke={OL} strokeWidth={3} />
        </g>
      )}
      {B > 0.01 && (
        <g opacity={clamp01(B * 1.5)}>
          <g opacity={1 - win}>
            <Tag x={xR - 110} y={195} text="Вариант 2" color="#fff" size={34} />
          </g>
          {win > 0 && (
            <g transform={`translate(${xR - 140} 195) scale(${0.8 + 0.2 * win})`} opacity={win}>
              <Tag x={0} y={0} text="≈ 80% выбрали" color={C.green} textColor="#fff" size={36} />
            </g>
          )}
          <Tank x={xR} y={250} t={t} warm dip={dipB} />
          <Txt x={xR} y={630} size={36}>
            60 с + 30 с, чуть теплее
          </Txt>
          <rect x={xR - 180} y={654} width={240} height={30} rx={15} fill={C.skyDeep} stroke={OL} strokeWidth={3} />
          <rect x={xR + 60} y={654} width={120} height={30} rx={15} fill="#a9dcf3" stroke={OL} strokeWidth={3} />
          {win > 0 && <Check x={xR + 140} y={420} s={70} k={ramp(t, at(c, 2.1), 0.5)} />}
        </g>
      )}
      {/* вопрос: какой повторить */}
      {q > 0 && (
        <g transform={`translate(688 ${420 + wob(t, 0, 6)})`} opacity={q}>
          <circle r={52} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={26} size={76} weight={900}>
            ?
          </Txt>
        </g>
      )}
      {/* ≈ 80% выбирают длинный */}
      {dots > 0 &&
        Array.from({ length: 10 }).map((_, i) => {
          const sx = 660 + (i - 4.5) * 52;
          const toRight = i >= 2;
          const ex = toRight ? xR + (i - 2 - 3.5) * 50 : xL + (i - 0.5) * 50;
          const x = interpolate(move, [0, 1], [sx, ex]);
          return (
            <g key={i} opacity={dots}>
              <Dot x={x} y={790} r={22} color={toRight ? C.green : C.inkSoft} k={pop(t, at(c, 2.05) + i * 0.05)} />
            </g>
          );
        })}
      {tyr > 0.01 && (
        <g transform={`translate(660 790) scale(${0.85 + 0.15 * tyr})`} opacity={clamp01(tyr * 1.5)}>
          <rect x={-420} y={-50} width={840} height={96} rx={48} fill={TELL.deep} />
          {/* корона над рассказчиком */}
          <path d="M -380 14 L -380 -22 L -362 -4 L -346 -30 L -330 -4 L -312 -22 L -312 14 Z" fill={C.yellow} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
          <Txt x={30} y={14} size={42} color="#fff">
            тирания вспоминающего «я»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ───────────── k38: Жизнь как история ─────────────
const Note: React.FC<{ x: number; y: number; s?: number; color?: string; o?: number }> = ({ x, y, s = 1, color = TELL.deep, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M 8 -40 L 8 6" stroke={color} strokeWidth={6} />
    <path d="M 8 -40 Q 26 -30 30 -14" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={-2} cy={8} rx={13} ry={10} fill={color} transform="rotate(-20 -2 8)" />
  </g>
);

const Photo: React.FC<{ x: number; y: number; rot: number; o: number; i: number }> = ({ x, y, rot, o, i }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <rect x={-110} y={-90} width={220} height={190} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
    <rect x={-94} y={-74} width={188} height={130} fill={["#9ad8ff", "#ffd9a8", "#bdeccf"][i]} />
    <path d="M -94 56 L -40 -10 L 0 30 L 40 -20 L 94 56 Z" fill={["#3fb67c", "#e0a060", "#2f8fd0"][i]} />
    <circle cx={50} cy={-40} r={16} fill={C.yellow} />
  </g>
);

export const LifeStory: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ph0 = fade(t, 0.1, at(c, 1));
  const ph1 = fade(t, at(c, 1), at(c, 2));
  const ph2 = fade(t, at(c, 2), at(c, 3));
  const ph3 = fade(t, at(c, 3));
  const scratchAt = at(c, 0.62);
  const scratched = t > scratchAt;
  const spin = scratched ? scratchAt * 120 + wob(t, 0, 3) : t * 120;
  const film = pop(t, at(c, 0.3));
  const crossK = ramp(t, at(c, 0.72), 0.6);
  const lived = pop(t, at(c, 0.85));
  return (
    <g>
      {ph0 > 0 && (
        <g opacity={ph0}>
          <Tag x={940} y={180} text="40 минут музыки" color={C.yellow} size={40} />
          {/* проигрыватель */}
          <g transform="translate(940 500)">
            <rect x={-250} y={-180} width={500} height={330} rx={30} fill="#c98b4a" stroke={OL} strokeWidth={5} />
            <rect x={-230} y={-160} width={460} height={290} rx={22} fill="#b5793d" opacity={0.6} />
            <g transform={`translate(-30 -15) rotate(${spin})`}>
              <circle r={140} fill="#23262f" stroke={OL} strokeWidth={4} />
              {[118, 98, 78].map((r) => (
                <circle key={r} r={r} fill="none" stroke="#3b3f4c" strokeWidth={3} />
              ))}
              <circle r={44} fill={C.coral} stroke={OL} strokeWidth={3} />
              <rect x={-4} y={-38} width={8} height={22} fill="#fff" opacity={0.7} />
              <circle r={7} fill="#fffaf0" />
            </g>
            {/* тонарм */}
            <g transform={`translate(180 -130) rotate(${scratched ? 26 + wob(t, 1, 2) : 22})`}>
              <circle r={22} fill="#cbd5e1" stroke={OL} strokeWidth={4} />
              <path d="M 0 0 L -20 170 L -60 210" fill="none" stroke="#cbd5e1" strokeWidth={14} strokeLinecap="round" />
              <path d="M 0 0 L -20 170 L -60 210" fill="none" stroke={OL} strokeWidth={4} strokeLinecap="round" opacity={0.4} />
            </g>
            {/* царапина */}
            {scratched && (
              <path
                d="M -110 60 L -80 30 L -60 70 L -30 34 L -10 76 L 20 40"
                fill="none"
                stroke={C.red}
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={ramp(t, scratchAt, 0.25)}
              />
            )}
          </g>
          {/* летящие ноты (пока музыка играет) */}
          {!scratched &&
            Array.from({ length: 6 }).map((_, i) => {
              const ph = (t * 0.45 + i / 6) % 1;
              return <Note key={i} x={1000 + Math.sin(ph * 6 + i) * 30 + ph * 260} y={290 - ph * 80 + Math.cos(ph * 5 + i) * 14} s={0.9 + (i % 2) * 0.3} color={[TELL.deep, C.coral, C.skyDeep][i % 3]} o={Math.sin(ph * Math.PI)} />;
            })}
          {/* плёнка-воспоминание и прожитые ноты */}
          {film > 0.01 && (
            <g transform={`translate(1560 330) scale(${film})`}>
              <Txt x={0} y={-110} size={34} color={TELL.deep}>
                воспоминание
              </Txt>
              <rect x={-170} y={-70} width={340} height={130} rx={10} fill="#4a5874" stroke={OL} strokeWidth={4} />
              {[-110, 0, 110].map((fx, i) => (
                <rect key={fx} x={fx - 46} y={-46} width={92} height={82} rx={6} fill={["#ffe1a8", "#c9e2fb", "#ffd0c8"][i]} />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <g key={i}>
                  <rect x={-160 + i * 42} y={-64} width={18} height={10} rx={2} fill="#fffaf0" />
                  <rect x={-160 + i * 42} y={44} width={18} height={10} rx={2} fill="#fffaf0" />
                </g>
              ))}
              <Cross x={0} y={-6} s={150} k={crossK} />
            </g>
          )}
          {lived > 0.01 && (
            <g transform={`translate(1560 620) scale(${lived})`}>
              <Panel x={-200} y={-90} w={400} h={180} fill="#fffdf7" r={28} />
              {[-150, -90, -30, 30].map((nx, i) => (
                <Note key={nx} x={nx} y={-12 + wob(t, i, 5)} s={1} color={[TELL.deep, C.coral, C.skyDeep, C.green][i]} />
              ))}
              <Check x={140} y={-14} s={46} k={ramp(t, at(c, 0.9), 0.5)} />
              <Txt x={0} y={64} size={32}>
                прожито
              </Txt>
            </g>
          )}
        </g>
      )}
      {ph1 > 0 && (
        <g opacity={ph1}>
          <Head x={1220} y={170} size={44}>
            Счастливая жизнь Джен
          </Head>
          {[
            { y: 300, lab: "30 лет", w: 300, tail: 0, stars: 4, at: 1.2 },
            { y: 460, lab: "60 лет", w: 600, tail: 0, stars: 4, at: 1.4 },
            { y: 620, lab: "60 + 5 лет", w: 600, tail: 50, stars: 3, at: 1.7 },
          ].map((r, ri) => {
            const k = ramp(t, at(c, r.at), 0.7);
            const show = pop(t, at(c, r.at));
            if (show <= 0.01) return null;
            const tailK = ramp(t, at(c, r.at) + 0.5, 0.6);
            const drop = ri === 2 ? ramp(t, at(c, r.at) + 1, 0.5) : 0;
            return (
              <g key={ri} opacity={clamp01(show * 1.5)}>
                <Txt x={640} y={r.y + 14} size={36} anchor="start">
                  {r.lab}
                </Txt>
                <rect x={860} y={r.y - 28} width={r.w * k} height={56} rx={16} fill={C.yellow} stroke={OL} strokeWidth={4} />
                {r.tail > 0 && tailK > 0 && <rect x={860 + r.w + 6} y={r.y - 22} width={r.tail * tailK} height={44} rx={12} fill="#e6dccb" stroke={OL} strokeWidth={3} strokeDasharray="8 6" />}
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} x={1590 + si * 58} y={r.y} r={25} on={si < r.stars ? k : si === 3 && ri === 2 ? 1 - drop : 0} />
                ))}
              </g>
            );
          })}
          {ramp(t, at(c, 1.55), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 1.55), 0.5)}>
              <Txt x={1706} y={400} size={60} weight={900} color={C.greenDeep}>
                =
              </Txt>
            </g>
          )}
          {ramp(t, at(c, 1.9), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 1.9), 0.5)}>
              <Txt x={1706} y={700} size={32} color={C.red}>
                оценка падает
              </Txt>
            </g>
          )}
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2}>
          <Camera x={820} y={420} s={2} />
          {[0, 1, 2].map((i) => {
            const dis = ramp(t, at(c, 2.45) + i * 0.15, 0.8);
            return <Photo key={i} x={1120 + i * 210} y={420 - (i % 2) * 30 - dis * 40} rot={-8 + i * 8} o={1 - dis * 0.88} i={i} />;
          })}
          {ramp(t, at(c, 2.5), 0.4) > 0 && (
            <g opacity={ramp(t, at(c, 2.5), 0.4)}>
              <Txt x={1330} y={600} size={32} color={C.inkSoft}>
                фото исчезли, память стёрлась
              </Txt>
            </g>
          )}
          {pop(t, at(c, 2.65)) > 0.01 && (
            <g transform={`translate(1220 ${740 + wob(t, 0, 4)}) scale(${pop(t, at(c, 2.65))})`}>
              <Bubble x={-370} y={-60} w={740} h={110} tail={[-260, -110]} fill={C.yellow} />
              <Txt x={0} y={14} size={48}>
                Куда бы вы поехали?
              </Txt>
            </g>
          )}
        </g>
      )}
      {ph3 > 0 && (
        <g opacity={ph3}>
          <Txt x={1220} y={180} size={44}>
            Ради кого мы живём?
          </Txt>
          {(() => {
            const ang = Math.sin(t * 1.1) * 6;
            const rad = (ang * Math.PI) / 180;
            const dx = Math.cos(rad) * 330;
            const dy = Math.sin(rad) * 330;
            const cx = 1220;
            const cy = 330;
            return (
              <g>
                <path d={`M ${cx - 80} 820 L ${cx + 80} 820 L ${cx + 20} 790 L ${cx - 20} 790 Z`} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
                <rect x={cx - 14} y={cy} width={28} height={470} fill="#a87038" stroke={OL} strokeWidth={4} />
                <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke={OL} strokeWidth={14} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
                {[-1, 1].map((sd) => {
                  const px = cx + sd * dx;
                  const py = cy + sd * dy;
                  return (
                    <g key={sd}>
                      <path d={`M ${px} ${py} L ${px - 110} ${py + 250} M ${px} ${py} L ${px + 110} ${py + 250}`} stroke={OL} strokeWidth={4} />
                      <Self x={px} y={py + 244} s={0.8} t={t} kind={sd < 0 ? "feel" : "tell"} />
                      <path d={`M ${px - 150} ${py + 250} L ${px + 150} ${py + 250} Q ${px + 120} ${py + 300} ${px} ${py + 300} Q ${px - 120} ${py + 300} ${px - 150} ${py + 250} Z`} fill="#cbd5e1" stroke={OL} strokeWidth={4} />
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};

// ───────────── k39: Благополучие и иллюзия фокусировки ─────────────
const DayIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0)
    return (
      <g transform="translate(0 6)">
        <path d="M -60 10 L -48 -18 Q -42 -30 -28 -30 L 28 -30 Q 42 -30 48 -18 L 60 10 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
        <rect x={-66} y={6} width={132} height={30} rx={10} fill={C.coral} stroke={OL} strokeWidth={4} />
        <circle cx={-36} cy={38} r={14} fill={OL} />
        <circle cx={36} cy={38} r={14} fill={OL} />
      </g>
    );
  if (i === 1)
    return (
      <g>
        <rect x={-56} y={-40} width={112} height={72} rx={8} fill={C.skyDeep} stroke={OL} strokeWidth={4} />
        <rect x={-46} y={-30} width={92} height={52} rx={4} fill="#cfe1fb" />
        <path d="M -74 34 L 74 34 L 64 48 L -64 48 Z" fill="#cbd5e1" stroke={OL} strokeWidth={4} />
      </g>
    );
  if (i === 2)
    return (
      <g>
        <path d="M -60 -4 L 60 -4 Q 56 46 0 46 Q -56 46 -60 -4 Z" fill="#fff" stroke={OL} strokeWidth={4} />
        <path d="M -30 -14 Q -20 -40 -30 -56 M 0 -14 Q 10 -40 0 -56 M 30 -14 Q 40 -40 30 -56" stroke={C.inkSoft} strokeWidth={4} fill="none" opacity={0.5} />
      </g>
    );
  if (i === 3)
    return (
      <g>
        <Person x={-32} y={56} s={0.55} color={C.green} t={t} />
        <Person x={32} y={56} s={0.55} color={C.violet} t={t + 1} />
      </g>
    );
  return (
    <g>
      <path d="M -56 -6 L 0 -50 L 56 -6 Z" fill={C.coral} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-44} y={-8} width={88} height={56} fill="#fff1d6" stroke={OL} strokeWidth={4} />
      <rect x={-12} y={14} width={24} height={34} fill="#8a5a2b" />
    </g>
  );
};

const Magnifier: React.FC<{ x: number; y: number; r: number; children?: React.ReactNode }> = ({ x, y, r, children }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={r * 0.72} y1={r * 0.72} x2={r * 1.45} y2={r * 1.45} stroke="#6b4a1e" strokeWidth={r * 0.2} strokeLinecap="round" />
    <circle r={r} fill="#eaf6ff" />
    <clipPath id={`mag${Math.round(r)}`}>
      <circle r={r} />
    </clipPath>
    <g clipPath={`url(#mag${Math.round(r)})`}>{children}</g>
    <circle r={r} fill="none" stroke={OL} strokeWidth={r * 0.08} />
    <path d={`M ${-r * 0.6} ${-r * 0.3} A ${r * 0.7} ${r * 0.7} 0 0 1 ${-r * 0.2} ${-r * 0.68}`} stroke="#fff" strokeWidth={r * 0.08} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

const Palm: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -8 0 Q 0 -80 18 -170 L 32 -168 Q 16 -80 12 0 Z" fill="#a87038" stroke={OL} strokeWidth={4} />
    <g transform={`translate(25 -170) rotate(${wob(t, 3, 4)})`}>
      {[-150, -110, -60, -20, 20].map((a) => (
        <path key={a} d="M 0 0 Q 50 -30 100 10 Q 50 -10 0 0 Z" fill={C.green} stroke={OL} strokeWidth={4} transform={`rotate(${a + 90})`} />
      ))}
    </g>
  </g>
);

export const Focusing: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ph0 = fade(t, 0.1, at(c, 1));
  const ph1 = fade(t, at(c, 1), at(c, 2));
  const ph2 = fade(t, at(c, 2), at(c, 3));
  const ph3 = fade(t, at(c, 3));
  const moods = [0.25, 0.5, 0.65, 0.95, 0.75];
  const labels = ["дорога", "работа", "обед", "друзья", "дом"];
  const chart = pop(t, at(c, 1.42));
  const curves = ramp(t, at(c, 1.5), at(c, 1.75) - at(c, 1.5));
  return (
    <g>
      {ph0 > 0 && (
        <g opacity={ph0}>
          <Tag x={690} y={150} text="Как прошёл ваш день?" color={C.yellow} size={40} />
          <rect x={90} y={210} width={1200} height={270} rx={18} fill="#4a5874" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 22 }).map((_, i) => (
            <g key={i}>
              <rect x={108 + i * 54} y={220} width={24} height={14} rx={3} fill="#fffaf0" />
              <rect x={108 + i * 54} y={456} width={24} height={14} rx={3} fill="#fffaf0" />
            </g>
          ))}
          {labels.map((lab, i) => {
            const k = pop(t, 0.3 + i * 0.35);
            const fx = 210 + i * 240;
            const mk = ramp(t, at(c, 0.3) + i * 0.3, 0.6);
            return (
              <g key={i}>
                {k > 0.01 && (
                  <g transform={`translate(${fx} 345) scale(${k})`}>
                    <rect x={-105} y={-100} width={210} height={200} rx={12} fill="#fffdf7" />
                    <g transform="translate(0 -22)">
                      <DayIcon i={i} t={t} />
                    </g>
                    <Txt x={0} y={84} size={30}>
                      {lab}
                    </Txt>
                  </g>
                )}
                {/* полоска настроения */}
                <rect x={fx - 40} y={530} width={80} height={170} rx={14} fill="#fff" opacity={0.6} />
                {mk > 0 && (
                  <rect
                    x={fx - 40}
                    y={700 - 170 * moods[i] * mk}
                    width={80}
                    height={170 * moods[i] * mk}
                    rx={14}
                    fill={interpolate(moods[i], [0.25, 0.95], [0, 1]) < 0.4 ? C.coral : moods[i] > 0.8 ? C.green : C.yellow}
                    stroke={OL}
                    strokeWidth={4}
                  />
                )}
              </g>
            );
          })}
          {ramp(t, at(c, 0.3), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 0.3), 0.5)}>
              <g transform="translate(118 615) rotate(-90)">
                <Txt x={0} y={10} size={30} color={C.inkSoft}>
                  настроение
                </Txt>
              </g>
            </g>
          )}
          {pop(t, at(c, 0.7)) > 0.01 && (
            <g transform={`translate(690 780) scale(${pop(t, at(c, 0.7))})`}>
              <Tag x={-200} y={0} text="чем заняты" color="#fff" size={36} />
              <Tag x={200} y={0} text="и с кем" color="#fff" size={36} />
            </g>
          )}
        </g>
      )}
      {ph1 > 0 && (
        <g opacity={ph1}>
          <Txt x={330} y={170} size={36}>
            неприятное время
          </Txt>
          {[
            { x: 210, v: 29, lab: "дорога\nна работу", col: C.coral },
            { x: 450, v: 12, lab: "общение\nс друзьями", col: C.green },
          ].map((b, i) => {
            const k = ramp(t, at(c, 1.05) + i * 0.4, 0.8);
            const h = b.v * 12 * k;
            return (
              <g key={i}>
                <rect x={b.x - 70} y={600 - 360} width={140} height={360} rx={18} fill="#fff" opacity={0.55} />
                <rect x={b.x - 70} y={600 - h} width={140} height={Math.max(h, 0)} rx={18} fill={b.col} stroke={OL} strokeWidth={4} />
                {k > 0.5 && (
                  <Txt x={b.x} y={600 - h - 18} size={48} weight={900}>
                    {`${b.v}%`}
                  </Txt>
                )}
                <Txt x={b.x} y={644} size={30}>
                  {b.lab}
                </Txt>
              </g>
            );
          })}
          {chart > 0.01 && (
            <g opacity={clamp01(chart * 1.5)}>
              <Panel x={640} y={130} w={700} h={540} fill="#fffdf7" r={30} />
              <line x1={720} y1={560} x2={1300} y2={560} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
              <line x1={720} y1={560} x2={720} y2={200} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
              <Txt x={1300} y={610} size={32} anchor="end">
                доход →
              </Txt>
              {(() => {
                const N = 40;
                const mood = Array.from({ length: N + 1 }).map((_, i) => {
                  const u = i / N;
                  return [720 + u * 560, 540 - 230 * (1 - Math.exp(-u * 6))] as [number, number];
                });
                const life = Array.from({ length: N + 1 }).map((_, i) => {
                  const u = i / N;
                  return [720 + u * 560, 540 - 300 * Math.log(1 + u * 9) / Math.log(10)] as [number, number];
                });
                const cut = Math.max(1, Math.round(curves * N));
                const d = (p: [number, number][]) => p.slice(0, cut + 1).map((q, i) => `${i ? "L" : "M"} ${q[0]} ${q[1]}`).join(" ");
                return (
                  <g>
                    <path d={d(life)} fill="none" stroke={C.violet} strokeWidth={9} strokeLinecap="round" />
                    <path d={d(mood)} fill="none" stroke={C.green} strokeWidth={9} strokeLinecap="round" />
                    {curves > 0.9 && (
                      <g opacity={ramp(curves, 0.9, 0.1)}>
                        <Txt x={1040} y={222} size={32} color={C.violet} anchor="middle">
                          оценка жизни
                        </Txt>
                        <Txt x={1190} y={362} size={32} color={C.greenDeep} anchor="middle">
                          настроение
                        </Txt>
                      </g>
                    )}
                  </g>
                );
              })()}
              {ramp(t, at(c, 1.85), 0.5) > 0 && (
                <g opacity={ramp(t, at(c, 1.85), 0.5)}>
                  <circle cx={730} cy={634} r={18} fill={C.inkSoft} />
                  <Txt x={730} y={644} size={26} color="#fff">
                    !
                  </Txt>
                  <Txt x={760} y={645} size={30} anchor="start" color={C.inkSoft} weight={700}>
                    вывод позже уточнялся
                  </Txt>
                </g>
              )}
            </g>
          )}
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2}>
          {(() => {
            const mk = ramp(t, at(c, 2.15), 0.9);
            const r = 120 + 110 * mk;
            return (
              <g>
                <Magnifier x={360} y={390} r={r}>
                  <rect x={-r} y={-r} width={2 * r} height={2 * r} fill="#bfe6ff" />
                  <rect x={-r} y={r * 0.35} width={2 * r} height={r} fill="#ffe2a0" />
                  <Sun x={-r * 0.35} y={-r * 0.35} r={r * 0.22} t={t} />
                  <Palm x={r * 0.35} y={r * 0.6} s={r / 260} t={t} />
                </Magnifier>
                <Txt x={360} y={700} size={38}>
                  Калифорния
                </Txt>
              </g>
            );
          })()}
          {pop(t, at(c, 2.1)) > 0.01 && (
            <g transform={`translate(800 470) scale(${pop(t, at(c, 2.1))})`}>
              <circle r={70} fill="#e3eaf2" stroke={OL} strokeWidth={4} />
              <path d="M -40 10 Q -40 -18 -14 -18 Q -6 -36 14 -30 Q 38 -30 40 -6 Q 52 10 36 14 L -36 14 Q -50 14 -40 10 Z" fill="#fff" stroke={OL} strokeWidth={3} />
              <path d="M -50 40 L 50 40" stroke={C.yellowDeep} strokeWidth={8} strokeLinecap="round" />
              <Txt x={0} y={124} size={30}>
                Средний Запад
              </Txt>
            </g>
          )}
          {pop(t, at(c, 2.55)) > 0.01 && (
            <g opacity={clamp01(pop(t, at(c, 2.55)) * 1.5)}>
              <Txt x={1135} y={200} size={34}>
                довольны жизнью
              </Txt>
              {[
                { x: 1030, lab: "Калифорния" },
                { x: 1240, lab: "Ср. Запад" },
              ].map((b, i) => {
                const k = ramp(t, at(c, 2.6) + i * 0.15, 0.8);
                const h = 320 * k;
                return (
                  <g key={i}>
                    <rect x={b.x - 60} y={600 - 320} width={120} height={320} rx={16} fill="#fff" opacity={0.55} />
                    <rect x={b.x - 60} y={600 - h} width={120} height={h} rx={16} fill={C.green} stroke={OL} strokeWidth={4} />
                    <Txt x={b.x} y={644} size={30}>
                      {b.lab}
                    </Txt>
                  </g>
                );
              })}
              {ramp(t, at(c, 2.85), 0.4) > 0 && (
                <g opacity={ramp(t, at(c, 2.85), 0.4)}>
                  <Txt x={1135} y={455} size={60} weight={900} color={C.ink}>
                    =
                  </Txt>
                </g>
              )}
            </g>
          )}
        </g>
      )}
      {ph3 > 0 && (
        <g transform={`translate(700 ${430 + wob(t, 0, 3)}) scale(${0.85 + 0.15 * pop(t, at(c, 3))})`} opacity={ph3}>
          <Panel x={-560} y={-220} w={1120} h={430} fill="#fffdf7" stroke={C.violet} r={40} />
          <Txt x={0} y={-90} size={54}>
            {"Ничто не важно настолько,\nнасколько кажется,\nкогда вы об этом думаете"}
          </Txt>
          <Txt x={0} y={160} size={32} color={C.inkSoft} weight={700}>
            — Даниэль Канеман
          </Txt>
          <g transform="translate(-450 110) scale(0.45)">
            <Magnifier x={0} y={0} r={110}>
              <rect x={-110} y={-110} width={220} height={220} fill="#fff3d6" />
            </Magnifier>
          </g>
        </g>
      )}
    </g>
  );
};

// ───────────── k40: Памятка ─────────────
const ItemIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0)
    return (
      <g>
        <circle r={34} fill={C.yellow} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={16} size={44} weight={900}>
          ?
        </Txt>
      </g>
    );
  if (i === 1)
    return (
      <g>
        {Array.from({ length: 10 }).map((_, k) => (
          <Dot key={k} x={-40 + (k % 5) * 20} y={-8 + Math.floor(k / 5) * 34} r={9} color={k < 2 ? C.coral : C.inkSoft} />
        ))}
      </g>
    );
  if (i === 2)
    return (
      <g>
        <circle cx={-18} cy={0} r={18} fill="#cfe1fb" stroke={OL} strokeWidth={4} />
        <circle cx={18} cy={0} r={18} fill="#cfe1fb" stroke={OL} strokeWidth={4} />
        <rect x={-6} y={-6} width={12} height={10} fill={OL} />
      </g>
    );
  if (i === 3)
    return (
      <g>
        <path d="M -36 -12 L 30 -12" stroke={C.green} strokeWidth={8} strokeLinecap="round" />
        <path d="M 18 -26 L 34 -12 L 18 2" stroke={C.green} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 36 16 L -30 16" stroke={C.red} strokeWidth={8} strokeLinecap="round" />
        <path d="M -18 2 L -34 16 L -18 30" stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  return (
    <g transform={`rotate(${wob(t, 4, 3)})`}>
      <path d="M -24 34 L -24 -34" stroke={OL} strokeWidth={6} strokeLinecap="round" />
      <path d="M -24 -34 L 30 -22 L -24 -6 Z" fill={C.red} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 6 20 L 34 20 M 14 6 L 26 34" stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

const StopSign: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 62 }) => {
  const pts = Array.from({ length: 8 })
    .map((_, i) => {
      const a = Math.PI / 8 + (i * Math.PI) / 4;
      return `${Math.cos(a) * r},${Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={pts} fill={C.red} stroke="#fff" strokeWidth={6} />
      <polygon points={pts} fill="none" stroke={OL} strokeWidth={3} transform="scale(1.06)" />
      <text x={0} y={r * 0.22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.56} fill="#fff">
        СТОП
      </text>
    </g>
  );
};

export const Checklist: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const board = pop(t, 0.2);
  const stop = pop(t, at(c, 0.82));
  const items = [
    { text: "На какой вопрос я отвечаю?", at: 1.05 },
    { text: "Базовая частота", at: 1.55 },
    { text: "Взгляд извне", at: 2.05 },
    { text: "Перескажите иначе", at: 2.55 },
    { text: "Премортем", at: 3.05 },
  ];
  return (
    <g>
      {board > 0.01 && (
        <g transform={`translate(1220 450) scale(${0.82 + 0.08 * board})`} opacity={clamp01(board * 1.5)}>
          <Panel x={-610} y={-390} w={1220} h={780} fill="#fffdf7" r={40} />
          <rect x={-610} y={-390} width={1220} height={130} rx={40} fill={S2.main} />
          <rect x={-610} y={-300} width={1220} height={40} fill={S2.main} />
          <circle cx={0} cy={-392} r={16} fill={C.red} stroke={OL} strokeWidth={4} />
          <text x={-560} y={-305} fontFamily="Rubik" fontWeight={900} fontSize={56} fill="#fff">
            Когда думать медленно
          </text>
          {items.map((it, i) => {
            const k = pop(t, at(c, it.at));
            if (k <= 0.01) return null;
            const y = -190 + i * 124;
            return (
              <g key={i} transform={`translate(${(1 - k) * 60} 0)`} opacity={clamp01(k * 1.5)}>
                <circle cx={-530} cy={y} r={38} fill={i === 0 ? C.yellow : S2.light} stroke={OL} strokeWidth={4} />
                <Txt x={-530} y={y + 16} size={44} weight={900}>
                  {`${i + 1}`}
                </Txt>
                <Txt x={-470} y={y + 16} size={48} anchor="start">
                  {it.text}
                </Txt>
                <g transform={`translate(${440} ${y})`}>
                  <ItemIcon i={i} t={t} />
                </g>
                <Check x={545} y={y} s={40} k={ramp(t, at(c, it.at) + 0.4, 0.5)} />
                {i < 4 && <line x1={-560} y1={y + 62} x2={570} y2={y + 62} stroke={C.inkSoft} strokeWidth={2} opacity={0.2} />}
              </g>
            );
          })}
          {/* до первого пункта — короткая подсказка */}
          {t < at(c, 1) && ramp(t, at(c, 0.3), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 0.3), 0.5) * (1 - ramp(t, at(c, 1) - 0.3, 0.3))}>
              <Txt x={0} y={-60} size={50} color={C.inkSoft}>
                ставки высоки +
              </Txt>
              <Txt x={0} y={20} size={50} color={C.inkSoft}>
                ответ пришёл слишком легко
              </Txt>
            </g>
          )}
        </g>
      )}
      {stop > 0.01 && (
        <g transform={`translate(1720 ${100 + 0}) scale(${stop}) rotate(${wob(t, 2, 3)})`}>
          <StopSign x={0} y={0} r={72} />
        </g>
      )}
    </g>
  );
};

// ───────────── k41: Финал ─────────────
const WaveArm: React.FC<{ x: number; y: number; t: number; side: 1 | -1; color: string; k: number }> = ({ x, y, t, side, color, k }) => {
  if (k <= 0) return null;
  const a = (32 + Math.sin(t * 7) * 20) * side;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} opacity={clamp01(k * 2)}>
      <line x1={0} y1={0} x2={0} y2={-90} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <circle cx={0} cy={-100} r={22} fill={color} stroke={OL} strokeWidth={4} />
    </g>
  );
};

export const Finale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const chars = pop(t, 0.2);
  const p0 = fade(t, 0.3, at(c, 1));
  // общий язык: сначала по бокам, к финалу собираются слева
  const words = [
    { w: "якорь", x: 340, y: 300, fx: 250, fy: 330, at: 1.4 },
    { w: "рамка", x: 1580, y: 300, fx: 560, fy: 330, at: 1.48 },
    { w: "взгляд извне", x: 520, y: 470, fx: 330, fy: 450, at: 1.56 },
    { w: "ореол", x: 1400, y: 470, fx: 620, fy: 450, at: 1.64 },
  ];
  const brand = pop(t, at(c, 2));
  const gather = ramp(t, at(c, 2), 0.9);
  const bubble = fade(t, at(c, 1.72), at(c, 2));
  const wave = ramp(t, at(c, 2), 0.4);
  const bookK = pop(t, at(c, 2.3));
  return (
    <g>
      {/* персонажи систем по бокам */}
      {chars > 0.01 && (
        <g opacity={clamp01(chars * 1.5)}>
          <SystemOne x={330} y={820} s={0.85} t={t} mood="happy" />
          <WaveArm x={330 + 78} y={820 - 110} t={t} side={1} color={S1.main} k={wave} />
          <SystemTwo x={1590} y={820} s={0.85} t={t} mood={wave > 0 ? "happy" : "think"} />
          <WaveArm x={1590 - 72} y={820 - 150} t={t + 0.6} side={-1} color={S2.main} k={wave} />
        </g>
      )}
      {/* интуиция почти та же — но видны опасные места */}
      {p0 > 0 && (
        <g transform={`translate(420 330) scale(${0.85 + 0.15 * pop(t, 0.3)})`} opacity={p0}>
          <Panel x={-320} y={-130} w={640} h={250} fill="#fffdf7" r={34} />
          <Txt x={-280} y={-36} size={38} anchor="start">
            интуиция — почти та же
          </Txt>
          {ramp(t, at(c, 0.5), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 0.5), 0.5)}>
              <path d="M -280 76 L -250 26 L -220 76 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
              <Txt x={-250} y={70} size={28} weight={900}>
                !
              </Txt>
              <Txt x={-200} y={72} size={38} anchor="start">
                замечать ловушки
              </Txt>
              <Check x={250} y={56} s={44} k={ramp(t, at(c, 0.65), 0.5)} />
            </g>
          )}
        </g>
      )}
      {/* общий язык */}
      {t > at(c, 1.3) && (
        <g opacity={ramp(t, at(c, 1.3), 0.5)}>
          <g opacity={(1 - clamp01(brand * 2)) * (1 - bubble)}>
            <Head x={960} y={175} size={44}>
              общий язык
            </Head>
          </g>
          {words.map((wd, i) => {
            const k = pop(t, at(c, wd.at));
            if (k <= 0.01) return null;
            const x = interpolate(gather, [0, 1], [wd.x, wd.fx]) + wob(t, i + 3, 6);
            const y = interpolate(gather, [0, 1], [wd.y, wd.fy]) + wob(t, i, 7);
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${k * (1 - 0.1 * gather)})`}>
                <Tag x={0} y={0} text={wd.w} color={i % 2 ? S2.light : S1.light} size={44} />
              </g>
            );
          })}
        </g>
      )}
      {bubble > 0 && (
        <g opacity={bubble} transform={`translate(960 ${170 + wob(t, 0, 3)})`}>
          <Bubble x={-380} y={-56} w={760} h={100} fill={C.yellow} />
          <Txt x={0} y={12} size={40}>
            Стоп, давайте подумаем медленно
          </Txt>
        </g>
      )}
      {/* фирменный знак */}
      {brand > 0.01 && (
        <g transform={`translate(960 150) scale(${0.8 + 0.2 * brand})`} opacity={clamp01(brand * 1.5)}>
          <rect x={-270} y={-62} width={540} height={124} rx={62} fill={BRAND_INK} />
          <text x={0} y={32} textAnchor="middle" fontFamily="Rubik" fontWeight={900} fontSize={92}>
            <tspan fill="#fff">Bana</tspan>
            <tspan fill={BRAND_YELLOW}>Mind</tspan>
          </text>
          <Txt x={0} y={112} size={38} color={BRAND_INK}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
      {bookK > 0.01 && (
        <g transform={`translate(1530 ${380 + wob(t, 2, 3)}) scale(${bookK})`}>
          <Panel x={-310} y={-100} w={620} h={200} fill="#fffdf7" r={30} />
          <g transform="translate(-230 0)">
            <rect x={-48} y={-66} width={96} height={132} rx={8} fill={S2.main} stroke={OL} strokeWidth={4} />
            <rect x={-48} y={-66} width={14} height={132} fill="#000" opacity={0.15} />
            <rect x={-26} y={-44} width={60} height={34} rx={5} fill={S1.main} />
            <path d="M -24 16 L 30 16 M -24 34 L 18 34" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          </g>
          <Txt x={-150} y={-30} size={34} anchor="start">
            {"«Думай медленно…\nрешай быстро»"}
          </Txt>
          <Txt x={-150} y={68} size={30} anchor="start" color={C.inkSoft} weight={700}>
            — Даниэль Канеман
          </Txt>
        </g>
      )}
    </g>
  );
};
