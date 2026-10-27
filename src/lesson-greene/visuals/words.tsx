// Анимированные схемы фильма BM-005, часть «Слова и репутация»:
// Кориолан, «Я подумаю», слова-птицы, нос Давида, пустой город, персик Ми Цуся,
// слухи и репутация, нищий с кирпичами. Все времена — от реплик через at(c, n).
import type React from "react";
import { interpolateColors } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { CoinStack, Crown, Figure, Ribbon, Scroll, Year } from "./court";
import { Bubble, OL, Person, Tree } from "./draw";
import { Arrow, Check, Cross, Panel, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ───────────── общие мелочи ─────────────

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// элемент виден в окне [a, b): плавно появляется и плавно уходит
const win = (t: number, a: number, b: number, d = 0.6) => ramp(t, a, d) * (1 - ramp(t, b, d));
const outK = (t: number, b?: number) => (b === undefined ? 1 : 1 - ramp(t, b, 0.45));

// ярлык, который появляется «пружинкой» и уходит
const TagAt: React.FC<{
  t: number;
  at: number;
  out?: number;
  x: number;
  y: number;
  text: string;
  color?: string;
  size?: number;
  textColor?: string;
}> = ({ t, at: a, out, x, y, ...rest }) => {
  const k = pop(t, a) * outK(t, out);
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.5)}>
      <Tag x={0} y={0} {...rest} />
    </g>
  );
};

// «сцена-окно»: скруглённая рамка с небом, всё внутри обрезается
const Stage: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  top: string;
  bottom: string;
  k?: number;
  children?: React.ReactNode;
}> = ({ id, x, y, w, h, top, bottom, k = 1, children }) => {
  if (k <= 0.002) return null;
  const s = 0.97 + 0.03 * clamp01(k);
  return (
    <g opacity={clamp01(k)} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-x - w / 2} ${-y - h / 2})`}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={x} y={y} width={w} height={h} rx={34} />
        </clipPath>
        <linearGradient id={`${id}-sky`} x1={0} y1={0} x2={0} y2={1}>
          <stop offset={0} stopColor={top} />
          <stop offset={1} stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={x + 6} y={y + 10} width={w} height={h} rx={34} fill="#24324a" opacity={0.1} />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-sky)`} />
        {children}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={34} fill="none" stroke={OL} strokeWidth={5} />
    </g>
  );
};

// реплика-пузырь с «пружинкой»; хвостик вниз к говорящему
const Say: React.FC<{
  t: number;
  at: number;
  out?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tail?: [number, number];
  text: string;
  size?: number;
  color?: string;
  fill?: string;
  serif?: boolean;
}> = ({ t, at: a, out, x, y, w, h, tail, text, size = 40, color = C.ink, fill = "#fff", serif }) => {
  const k = pop(t, a) * outK(t, out);
  if (k <= 0.01) return null;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const lines = text.split("\n");
  const y0 = cy - ((lines.length - 1) * size * 1.18) / 2 + size * 0.35;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * k}) translate(${-cx} ${-cy})`} opacity={clamp01(k * 1.5)}>
      <Bubble x={x} y={y} w={w} h={h} tail={tail} fill={fill} />
      {lines.map((l, i) => (
        <text key={i} x={cx} y={y0 + i * size * 1.18} textAnchor="middle" fontFamily={serif ? SERIF : FONT} fontWeight={serif ? 700 : 900} fontSize={size} fill={color}>
          {l}
        </text>
      ))}
    </g>
  );
};

// тёмная табличка с золотой надписью (исторические подписи)
const Plaque: React.FC<{
  x: number;
  y: number;
  text: string;
  k: number;
  size?: number;
  color?: string;
  bg?: string;
}> = ({ x, y, text, k, size = 44, color = C.goldLight, bg = C.night }) => {
  if (k <= 0.01) return null;
  const w = text.length * size * 0.6 + 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.75 + 0.25 * clamp01(k)})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2 + 5} y={-size * 0.95 + 8} width={w} height={size * 1.7} rx={14} fill="#000" opacity={0.12} />
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.7} rx={14} fill={bg} stroke={C.gold} strokeWidth={4} />
      <text x={0} y={size * 0.25} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={size} fill={color}>
        {text}
      </text>
    </g>
  );
};

// штамп поверх картинки
const Stamp: React.FC<{
  x: number;
  y: number;
  text: string;
  k: number;
  size?: number;
  rot?: number;
  color?: string;
}> = ({ x, y, text, k, size = 46, rot = -10, color = C.red }) => {
  if (k <= 0.01) return null;
  const w = text.length * size * 0.66 + 50;
  const s = 1 + 0.6 * (1 - clamp01(k));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={clamp01(k * 1.6)}>
      <rect x={-w / 2} y={-size * 0.9} width={w} height={size * 1.6} rx={12} fill="#fff" opacity={0.85} stroke={color} strokeWidth={7} />
      <text x={0} y={size * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

const Cloud: React.FC<{
  x: number;
  y: number;
  s?: number;
  color?: string;
  opacity?: number;
}> = ({ x, y, s = 1, color = "#fff", opacity = 0.85 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={80} ry={30} fill={color} />
    <circle cx={-30} cy={-14} r={30} fill={color} />
    <circle cx={18} cy={-24} r={38} fill={color} />
  </g>
);

// облака, плывущие по небу сцены (бесконечно, по кругу)
const Clouds: React.FC<{
  t: number;
  x0: number;
  x1: number;
  ys: number[];
  color?: string;
}> = ({ t, x0, x1, ys, color }) => (
  <g>
    {ys.map((y, i) => {
      const span = x1 - x0 + 300;
      const x = x0 - 150 + ((i * 397 + t * (14 + i * 5)) % span);
      return <Cloud key={i} x={x} y={y} s={0.7 + (i % 3) * 0.2} color={color} />;
    })}
  </g>
);

// слеза/капля пота, падающая циклично
const Tear: React.FC<{
  x: number;
  y: number;
  t: number;
  seed?: number;
  k?: number;
}> = ({ x, y, t, seed = 0, k = 1 }) => {
  if (k <= 0.01) return null;
  const p = (t * 1.1 + seed * 0.37) % 1;
  return <path transform={`translate(${x} ${y + p * 34}) scale(0.9)`} d="M 0 -9 Q 7 0 6 4 Q 4 9 0 9 Q -4 9 -6 4 Q -7 0 0 -9 Z" fill="#9ad8ff" stroke={C.skyDeep} strokeWidth={2} opacity={k * (1 - p)} />;
};

// голова фигуры (центр лица) в абсолютных координатах
const headOf = (x: number, y: number, s: number) => ({ x, y: y - 228 * s });

// ═════════════ g10 · Кориолан ═════════════

const RomanCape: React.FC<{
  x: number;
  y: number;
  s: number;
  t: number;
  color?: string;
}> = ({ x, y, s, t, color = C.velvet }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d={`M -34 -182 Q -76 -100 ${-70 + Math.sin(t * 1.8) * 4} -20 L ${70 + Math.sin(t * 1.8 + 1) * 4} -20 Q 76 -100 34 -182 Z`} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
);

const Laurel: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((d) => (
      <g key={d}>
        <path d={`M ${d * 6} 40 Q ${d * 62} 20 ${d * 54} -40`} stroke={C.greenDeep} strokeWidth={6} fill="none" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = i / 4;
          const px = d * (10 + 52 * Math.sin(a * 1.9));
          const py = 34 - a * 74;
          return <ellipse key={i} cx={px} cy={py} rx={9} ry={18} fill={C.green} stroke={OL} strokeWidth={3} transform={`rotate(${d * (60 - a * 50)} ${px} ${py})`} />;
        })}
      </g>
    ))}
  </g>
);

const Temple: React.FC<{
  x: number;
  y: number;
  s?: number;
  color?: string;
}> = ({ x, y, s = 1, color = "#f4ecdd" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -380 -330 L 0 -440 L 380 -330 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -300 -345 L 0 -420 L 300 -345 Z" fill="#fff" opacity={0.5} />
    <rect x={-390} y={-334} width={780} height={34} fill={color} stroke={OL} strokeWidth={5} />
    {Array.from({ length: 8 }).map((_, i) => {
      const cx = -315 + i * 90;
      return (
        <g key={i}>
          <rect x={cx - 24} y={-300} width={48} height={280} fill={color} stroke={OL} strokeWidth={4} />
          <path d={`M ${cx - 8} -290 L ${cx - 8} -30 M ${cx + 8} -290 L ${cx + 8} -30`} stroke={C.stoneDeep} strokeWidth={3} opacity={0.5} />
          <rect x={cx - 32} y={-312} width={64} height={14} rx={4} fill={color} stroke={OL} strokeWidth={4} />
        </g>
      );
    })}
    <rect x={-410} y={-22} width={820} height={22} fill={color} stroke={OL} strokeWidth={4} />
    <rect x={-440} y={0} width={880} height={24} fill={color} stroke={OL} strokeWidth={4} />
  </g>
);

const Urn: React.FC<{ x: number; y: number; t: number; k: number }> = ({ x, y, t, k }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2].map((i) => {
      const p = (t * 0.9 + i / 3) % 1;
      return k > 0.2 ? <rect key={i} x={-14 + (i - 1) * 6} y={-150 + p * 110} width={28} height={36} rx={4} fill={C.red} stroke={OL} strokeWidth={3} opacity={(1 - p * p) * k} transform={`rotate(${(i - 1) * 12} 0 ${-130 + p * 110})`} /> : null;
    })}
    <path d="M -50 -40 L 50 -40 L 42 50 Q 0 64 -42 50 Z" fill="#c98a5b" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-60} y={-52} width={120} height={20} rx={6} fill="#a8693f" stroke={OL} strokeWidth={4} />
    <rect x={-22} y={-48} width={44} height={8} rx={3} fill={OL} />
    <path d="M -36 0 L 36 0 M -34 22 L 34 22" stroke="#a8693f" strokeWidth={5} />
  </g>
);

const Coriolanus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const b3 = at(c, 3);
  const forumK = 1 - ramp(t, b3, 0.9);
  const gateK = ramp(t, b3 + 0.3, 0.9);
  // Кориолан
  const cx = 400;
  const cy = 790;
  const cs = 1.15;
  const show = pop(t, at(c, 0.12));
  const scarsK = ramp(t, at(c, 1.25), 0.6) * (1 - ramp(t, b2, 0.6));
  const armsUp = ramp(t, at(c, 1.15), 0.8) * (1 - ramp(t, b2, 0.8));
  const boast = t > at(c, 2.2) && t < b3;
  const cArms: [number, number] = boast ? [20 + Math.sin(t * 3) * 6, 120 + Math.sin(t * 4) * 18] : [lerp(12, 150, armsUp), lerp(12, 150, armsUp)];
  const crowdMood = t < b1 + 0.6 ? "neutral" : t < at(c, 2.35) ? "sad" : "angry";
  const cryK = win(t, at(c, 1.3), at(c, 2.2));
  const crowd: [number, number, number, "peasant" | "merchant" | "lady" | "scholar" | "modern"][] = [
    [840, 640, 0.78, "merchant"],
    [975, 650, 0.78, "lady"],
    [1110, 640, 0.78, "peasant"],
    [1240, 655, 0.78, "scholar"],
    [900, 795, 0.92, "peasant"],
    [1045, 805, 0.92, "lady"],
    [1195, 795, 0.92, "merchant"],
  ];
  const crowdK = pop(t, at(c, 0.4));
  const patK = pop(t, at(c, 2.05));
  return (
    <g>
      <Stage id="w10a" x={80} y={110} w={1240} h={720} top="#d7ecff" bottom="#fff4e2" k={forumK}>
        <Clouds t={t} x0={80} x1={1320} ys={[170, 250, 200]} />
        <Temple x={700} y={600} s={0.95} />
        <rect x={80} y={700} width={1240} height={140} fill="#eadcc3" />
        <path d="M 80 700 L 1320 700" stroke={OL} strokeWidth={4} opacity={0.4} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path key={i} d={`M ${80 + i * 210} 700 L ${20 + i * 230} 840`} stroke={C.stoneDeep} strokeWidth={3} opacity={0.35} />
        ))}
        {/* толпа */}
        {crowdK > 0.01 &&
          crowd.map(([x, y, s, role], i) => {
            const h = headOf(x, y, s);
            return (
              <g key={i} opacity={clamp01(crowdK * 1.4)}>
                <Figure x={x} y={y} s={s} t={t + i} role={role} mood={crowdMood} look={-0.8} arms={crowdMood === "angry" ? [30, 40 + (i % 2) * 30] : crowdMood === "sad" ? [40, 40] : [12, 12]} />
                <Tear x={h.x - 13 * s} y={h.y + 6} t={t} seed={i} k={cryK} />
                <Tear x={h.x + 13 * s} y={h.y + 6} t={t} seed={i + 0.5} k={cryK} />
              </g>
            );
          })}
        {/* знать */}
        {patK > 0.01 && (
          <g opacity={clamp01(patK * 1.4)}>
            <Figure x={lerp(120, 200, patK)} y={792} s={1.0} t={t} role="minister" body="#f4efe6" mood="sly" look={0.8} arms={[12, 30]} />
            <Figure x={610} y={792} s={1.0} t={t + 2} role="minister" body="#efe6f7" mood="sly" look={0.6} arms={[24, 60 + Math.sin(t * 3) * 10]} talk={boast ? 0.8 : 0} />
          </g>
        )}
        {/* Кориолан */}
        {show > 0.01 && (
          <g opacity={clamp01(show * 1.5)}>
            <RomanCape x={cx} y={cy} s={cs} t={t} />
            <Figure x={cx} y={cy} s={cs} t={t} role="soldier" body="#d9ad55" mood={boast ? "proud" : t > at(c, 1.1) ? "happy" : "neutral"} arms={cArms} talk={boast ? 1 : 0} look={0.5} />
            {scarsK > 0.01 && (
              <g transform={`translate(${cx} ${cy}) scale(${cs})`} opacity={scarsK} stroke="#e0727a" strokeWidth={5} strokeLinecap="round">
                <path d="M -18 -158 L -4 -146" />
                <path d="M 8 -128 L 22 -116" />
                <path d="M -16 -104 L -2 -96" />
              </g>
            )}
          </g>
        )}
        <TagAt t={t} at={at(c, 0.05)} out={b1} x={330} y={180} text="Закон 4: говори меньше" size={38} color={C.yellow} />
        <Year x={900} y={180} text="17 лет войн за Рим" k={pop(t, at(c, 0.65)) * (1 - ramp(t, b1, 0.5))} />
        {/* «Победа казалась решённой» */}
        {(() => {
          const k = pop(t, at(c, 1.6)) * (1 - ramp(t, at(c, 2.15), 0.5));
          if (k <= 0.01) return null;
          return (
            <g transform={`translate(${cx} ${330 + wob(t, 1, 5)}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.4)}>
              <circle r={78} fill={C.goldLight} opacity={0.6} />
              <Laurel x={0} y={0} s={1} />
              <Check x={0} y={4} s={46} k={ramp(t, at(c, 1.7), 0.5)} />
            </g>
          );
        })()}
        <TagAt t={t} at={at(c, 1.3)} out={b2} x={620} y={520} text="шрамы" size={34} color="#ffd9dc" textColor={C.velvetDeep} />
        {/* хвастовство и насмешки */}
        <Say t={t} at={at(c, 2.2)} out={b3} x={150} y={250} w={330} h={84} tail={[410, 410]} text="хвастовство" size={40} fill="#fff3d6" />
        <Say t={t} at={at(c, 2.4)} out={b3} x={490} y={170} w={290} h={84} tail={[600, 470]} text="насмешки" size={40} fill="#fff3d6" />
        {/* урна голосования */}
        {(() => {
          const k = pop(t, at(c, 2.6));
          if (k <= 0.01) return null;
          return (
            <g transform={`translate(1150 260) scale(${0.7 + 0.3 * k}) translate(-1150 -260)`} opacity={clamp01(k * 1.5)}>
              <Panel x={1000} y={135} w={300} h={255} r={28} />
              <Txt x={1150} y={180} size={30} color={C.inkSoft}>
                голосование
              </Txt>
              <Urn x={1085} y={322} t={t} k={k} />
              <text x={1215} y={312} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.red} transform={`rotate(-10 1215 312)`}>
                ПРОТИВ
              </text>
            </g>
          );
        })()}
      </Stage>
      <Stage id="w10b" x={80} y={110} w={1240} h={720} top="#cfe3f7" bottom="#fbeedd" k={gateK}>
        <Clouds t={t} x0={80} x1={1320} ys={[160, 230]} color="#ffffff" />
        <path d="M 80 560 Q 300 470 520 540 Q 760 600 1000 520 Q 1200 470 1320 520 L 1320 840 L 80 840 Z" fill="#cfe0c4" />
        <rect x={80} y={700} width={1240} height={140} fill="#d9e8c6" />
        {/* дорога из города */}
        <path d="M 830 800 Q 520 770 60 770 L 60 840 L 1010 840 L 1010 800 Z" fill="#ead9b4" />
        <path d="M 820 812 Q 520 790 60 792" stroke="#d8c194" strokeWidth={4} fill="none" strokeDasharray="20 16" />
        {/* стена Рима */}
        <rect x={560} y={380} width={800} height={420} fill={C.stone} stroke={OL} strokeWidth={5} />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={566 + i * 90} y={350} width={46} height={34} fill={C.stone} stroke={OL} strokeWidth={4} />
        ))}
        {[460, 540, 620, 700].map((yy, i) => (
          <path key={i} d={`M 560 ${yy} L 1360 ${yy}`} stroke={C.stoneDeep} strokeWidth={3} opacity={0.5} />
        ))}
        <path d="M 820 800 L 820 600 Q 920 500 1020 600 L 1020 800 Z" fill="#7c6447" stroke={OL} strokeWidth={5} />
        <text x={920} y={470} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={50} fill={C.ink} opacity={0.8}>
          РИМ
        </text>
        {(() => {
          const close = ramp(t, at(c, 3.35), 2.2);
          const w = lerp(16, 100, close);
          return (
            <g>
              <rect x={820} y={560} width={w} height={240} fill="#9a6a3a" stroke={OL} strokeWidth={4} />
              <rect x={1020 - w} y={560} width={w} height={240} fill="#9a6a3a" stroke={OL} strokeWidth={4} />
              {close > 0.98 && <path d="M 920 560 L 920 800" stroke={OL} strokeWidth={4} />}
              {close > 0.98 && <rect x={872} y={660} width={96} height={18} rx={6} fill={C.goldDeep} stroke={OL} strokeWidth={3} />}
            </g>
          );
        })()}
        {(() => {
          const k = ramp(t, b3 + 0.4, 9);
          const x = lerp(920, 230, k);
          const y = lerp(800, 822, k);
          const s = lerp(0.82, 0.95, k);
          return (
            <g>
              <RomanCape x={x} y={y} s={s} t={t} color="#a8344a" />
              <Figure x={x} y={y} s={s} t={t} role="soldier" body="#c7a35a" mood="sad" look={-1} walk={k < 0.99 ? 1 : 0} arms={[8, 8]} />
            </g>
          );
        })()}
        <Plaque x={700} y={215} text="ИЗГНАНИЕ" k={pop(t, at(c, 3.3))} size={54} />
        <TagAt t={t} at={at(c, 3.75)} x={700} y={310} text="погубил собственный язык" size={36} color="#ffd9dc" textColor={C.velvetDeep} />
      </Stage>
    </g>
  );
};

// ═════════════ g11 · «Я подумаю» ═════════════

const Curtain: React.FC<{
  x: number;
  y: number;
  h: number;
  w?: number;
  flip?: boolean;
  t: number;
}> = ({ x, y, h, w = 110, flip, t }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <path d={`M 0 0 L ${w} 0 Q ${w * 0.6 + Math.sin(t) * 4} ${h * 0.5} ${w * 0.8} ${h} L 0 ${h} Z`} fill={C.velvet} stroke={OL} strokeWidth={4} />
    {[0.3, 0.55].map((f, i) => (
      <path key={i} d={`M ${w * f} 10 Q ${w * f * 0.8} ${h * 0.5} ${w * f * 1.1} ${h - 10}`} stroke={C.velvetDeep} strokeWidth={5} fill="none" opacity={0.6} />
    ))}
  </g>
);

const ThinkKing: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const roomK = 1 - ramp(t, b2, 0.9);
  const officeK = ramp(t, b2 + 0.3, 0.9);
  const leave = ramp(t, at(c, 1.12), 3.5);
  const kingX = lerp(1000, 620, leave);
  const nervous = t > b1;
  const chatter = t > at(c, 1.6);
  const coins = Math.round(1 + 7 * ramp(t, at(c, 2.74), 1.6));
  return (
    <g>
      <Stage id="w11a" x={600} y={110} w={1240} h={720} top="#efe8ff" bottom="#e2d6fa" k={roomK}>
        {[760, 1220, 1680].map((x, i) => (
          <g key={i}>
            <path d={`M ${x - 70} 560 L ${x - 70} 260 Q ${x} 190 ${x + 70} 260 L ${x + 70} 560 Z`} fill="#fff8de" stroke={OL} strokeWidth={4} opacity={0.9} />
            <path d={`M ${x} 210 L ${x} 560 M ${x - 70} 390 L ${x + 70} 390`} stroke={OL} strokeWidth={3} opacity={0.35} />
            <ellipse cx={x} cy={380} rx={90} ry={160} fill="#fff6c8" opacity={0.18 + 0.06 * Math.sin(t * 1.3 + i)} />
          </g>
        ))}
        <rect x={600} y={680} width={1240} height={160} fill="#ead8b5" />
        <path d="M 900 680 L 1100 680 L 1260 840 L 740 840 Z" fill={C.velvet} opacity={0.85} />
        <Curtain x={600} y={110} h={600} t={t} />
        <Curtain x={1840} y={110} h={600} t={t + 1} flip />
        <rect x={600} y={110} width={1240} height={40} fill={C.velvetDeep} />
        {/* трон и король */}
        <g transform={`translate(1000 ${700}) scale(0.85)`}>
          <path d="M -90 0 L -90 -230 Q -90 -300 0 -320 Q 90 -300 90 -230 L 90 0 Z" fill={C.goldDeep} stroke={OL} strokeWidth={5} />
          <path d="M -64 -110 L -64 -230 Q -64 -280 0 -292 Q 64 -280 64 -230 L 64 -110 Z" fill={C.velvet} stroke={OL} strokeWidth={4} />
          <circle cx={0} cy={-322} r={14} fill={C.gold} stroke={OL} strokeWidth={4} />
          <rect x={-110} y={-112} width={220} height={40} rx={10} fill={C.gold} stroke={OL} strokeWidth={5} />
          <rect x={-100} y={-74} width={30} height={74} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
          <rect x={70} y={-74} width={30} height={74} fill={C.goldDeep} stroke={OL} strokeWidth={4} />
        </g>
        <Figure x={kingX} y={745} s={0.95} t={t} role="king" mood={nervous ? "neutral" : "sly"} look={leave > 0.02 ? -1 : 0.6} walk={leave > 0.02 && leave < 0.98 ? 1 : 0} opacity={1 - ramp(t, at(c, 1.12) + 2.6, 0.9)} arms={[10, 10]} />
        {/* придворные со свитками */}
        {[
          [1420, 0],
          [1650, 1],
        ].map(([x, i]) => {
          const h = headOf(x, 785, 1);
          const talking = t < b1 ? (Math.sin(t * 1.4 + i * Math.PI) > 0 ? 0.9 : 0) : chatter ? 1 : 0;
          return (
            <g key={i}>
              <Figure
                x={x}
                y={785}
                s={1}
                t={t + i}
                role={i ? "lady" : "courtier"}
                flip
                mood={nervous ? "worried" : "talk"}
                look={0.5}
                talk={talking}
                arms={[16, 70 + Math.sin(t * 2 + i) * 8]}
                hold={
                  <g transform="scale(0.5)">
                    <Scroll x={0} y={-10} w={60} h={70} open={1} />
                  </g>
                }
              />
              {nervous && <Tear x={h.x + 30} y={h.y - 24} t={t} seed={i} k={ramp(t, b1, 0.6)} />}
              {nervous && <Tear x={h.x - 34} y={h.y - 10} t={t + 0.4} seed={i + 0.3} k={ramp(t, b1, 0.6)} />}
              {(() => {
                const k = pop(t, at(c, 1.15) + i * 0.3) * (1 - ramp(t, at(c, 1.6), 0.5));
                return k > 0.01 ? (
                  <g transform={`translate(${x} ${430 + wob(t, i, 6)}) scale(${k})`}>
                    <Txt x={0} y={0} size={80} weight={900} color={C.purple}>
                      ?
                    </Txt>
                  </g>
                ) : null;
              })()}
              {chatter && <Say t={t} at={at(c, 1.6) + i * 0.4} x={x - 80} y={360 + i * 30} w={140} h={60} tail={[x - 10, 470]} text="бла-бла" size={28} />}
            </g>
          );
        })}
        <TagAt t={t} at={at(c, 0.2)} out={b1} x={1530} y={420} text="готовят просьбу" size={34} color="#fff3d6" />
        <Say t={t} at={at(c, 0.78)} out={at(c, 1.1)} x={730} y={220} w={360} h={96} tail={[990, 420]} text="Я подумаю" size={52} serif />
        <TagAt t={t} at={at(c, 1.55)} x={1220} y={200} text="в тишине говорят больше" size={42} color={C.yellow} />
      </Stage>
      <Stage id="w11b" x={600} y={110} w={1240} h={720} top="#fff3df" bottom="#ffe6c4" k={officeK}>
        <rect x={1180} y={180} width={300} height={220} rx={14} fill="#bfe6ff" stroke={OL} strokeWidth={5} />
        <path d="M 1180 360 Q 1260 300 1330 340 Q 1400 290 1480 330 L 1480 400 L 1180 400 Z" fill="#e8c890" />
        <Clouds t={t} x0={1180} x1={1480} ys={[240]} />
        <path d="M 1330 400 L 1330 180 M 1180 290 L 1480 290" stroke={OL} strokeWidth={4} />
        <rect x={600} y={700} width={1240} height={140} fill="#d9b98c" />
        {/* продюсер за столом */}
        <Figure x={1530} y={700} s={1} t={t} role="boss" mood={t > at(c, 2.6) ? "shock" : "neutral"} look={-0.8} arms={[20, 40]} talk={win(t, at(c, 2.3), at(c, 2.5)) > 0.5 ? 1 : 0} />
        <rect x={1260} y={640} width={520} height={30} rx={8} fill="#a8733c" stroke={OL} strokeWidth={5} />
        <rect x={1290} y={670} width={460} height={170} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
        {/* хлопушка и растение */}
        <g transform="translate(1690 640) rotate(-4)">
          <rect x={-60} y={-60} width={120} height={60} rx={6} fill={C.ink} stroke={OL} strokeWidth={4} />
          <g transform={`rotate(${-12 + Math.sin(t * 1.2) * 3} -60 -60)`}>
            <rect x={-60} y={-80} width={124} height={20} rx={4} fill="#fff" stroke={OL} strokeWidth={4} />
            {[-40, -10, 20, 50].map((d) => (
              <path key={d} d={`M ${d} -80 L ${d + 14} -60`} stroke={C.ink} strokeWidth={8} />
            ))}
          </g>
          <path d="M -44 -36 L 44 -36 M -44 -18 L 20 -18" stroke="#fff" strokeWidth={5} opacity={0.6} />
        </g>
        <g transform="translate(690 800)">
          <path d="M -34 0 L -26 -60 L 26 -60 L 34 0 Z" fill="#c98a5b" stroke={OL} strokeWidth={4} />
          {[-40, -15, 15, 40].map((a, i) => (
            <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 50} cy={-110} rx={16} ry={50} fill={C.green} stroke={OL} strokeWidth={3} transform={`rotate(${a + Math.sin(t + i) * 3} 0 -60)`} />
          ))}
        </g>
        <CoinStack x={1360} y={630} n={officeK > 0.5 && t > at(c, 2.74) ? coins : 0} r={44} />
        {/* сценарист */}
        <Figure x={900} y={792} s={1.05} t={t} role="modern" mood={t > at(c, 2.75) ? "sly" : "neutral"} look={1} arms={[12, t > at(c, 2.55) ? 40 : 12]} talk={win(t, at(c, 2.55), at(c, 2.68)) > 0.5 ? 1 : 0} />
        <Year x={760} y={180} text="1944" k={pop(t, b2 + 0.4)} />
        <Say t={t} at={at(c, 2.3)} out={at(c, 2.72)} x={1300} y={200} w={520} h={84} tail={[1500, 400]} text="Сколько вам предложили?" size={34} />
        <Say t={t} at={at(c, 2.55)} x={660} y={300} w={380} h={92} tail={[890, 480]} text="Недостаточно" size={50} serif fill="#fff8e1" />
        <Plaque x={1130} y={205} text="15 000 $" k={pop(t, at(c, 2.82))} size={52} color={C.goldLight} />
      </Stage>
    </g>
  );
};

// ═════════════ g12 · слова-птицы ═════════════

const Bird: React.FC<{
  x: number;
  y: number;
  s?: number;
  t: number;
  color?: string;
  spiky?: boolean;
  rot?: number;
}> = ({ x, y, s = 1, t, color = C.sky, spiky, rot = 0 }) => {
  const flap = Math.sin(t * 16) * 22;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M -6 -4 Q -26 ${-30 - flap} -46 ${-18 - flap}`} stroke={OL} strokeWidth={4} fill={color} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={30} ry={18} fill={color} stroke={OL} strokeWidth={4} />
      {spiky && [-18, -6, 6, 18].map((d, i) => <path key={i} d={`M ${d - 6} -14 L ${d} -30 L ${d + 6} -14 Z`} fill={color} stroke={OL} strokeWidth={3} strokeLinejoin="round" />)}
      <path d="M 28 -4 L 42 0 L 28 6 Z" fill={C.yellowDeep} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={16} cy={-5} r={4} fill={OL} />
      {spiky && <path d="M 10 -13 L 22 -9" stroke={OL} strokeWidth={4} strokeLinecap="round" />}
      <path d="M -28 0 L -44 -6 L -40 8 Z" fill={color} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M -6 2 Q -22 ${22 + flap * 0.4} -36 ${14 + flap * 0.4}`} stroke={OL} strokeWidth={4} fill={color} strokeLinejoin="round" />
    </g>
  );
};

const StopSign: React.FC<{ x: number; y: number; k: number; r?: number }> = ({ x, y, k, r = 76 }) => {
  if (k <= 0.01) return null;
  const pts = Array.from({ length: 8 })
    .map((_, i) => {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      return `${Math.cos(a) * r},${Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * k}) rotate(${(1 - k) * -30})`} opacity={clamp01(k * 1.5)}>
      <polygon points={pts} fill={C.red} stroke="#fff" strokeWidth={8} />
      <polygon points={pts} fill="none" stroke={OL} strokeWidth={4} transform="scale(1.08)" />
      <text x={0} y={r * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.56} fill="#fff">
        СТОП
      </text>
    </g>
  );
};

const WordsBirds: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const talkEnd = at(c, 0.58);
  const mouth = { x: 245, y: 548 };
  const spawns: number[] = [];
  for (let s = at(c, 0.03); s < talkEnd - 0.3; s += 0.6) spawns.push(s);
  const sarc = at(c, 0.46);
  const pauseK = pop(t, at(c, 0.64));
  const papers = Math.round(6 * ramp(t, at(c, 1.3), at(c, 1.75) - at(c, 1.3)));
  const panelB = ramp(t, b1, 0.8);
  return (
    <g>
      <g transform={`translate(${320 * (1 - ramp(t, b1 - 0.3, 1))} 0)`}>
        <Stage id="w12a" x={80} y={140} w={600} h={660} top="#dff0ff" bottom="#f4faff" k={ramp(t, 0, 0.6)}>
          <Clouds t={t} x0={80} x1={680} ys={[300, 420]} />
          <rect x={80} y={760} width={600} height={60} fill="#cfe2f5" />
          <Txt x={380} y={210} size={40} weight={900}>
            Сказанного не вернуть
          </Txt>
          <Figure x={210} y={765} s={1.05} t={t} role="modern" mood={t > talkEnd ? "sly" : "talk"} look={1} talk={t < talkEnd ? 1 : 0} arms={[12, t < talkEnd ? 50 : 14]} />
          {spawns.map((s, i) => {
            const u = (t - s) / 3.4;
            if (u <= 0 || u > 1.2 || Math.abs(s - sarc) < 0.45) return null;
            return <Bird key={i} x={mouth.x + u * 520} y={mouth.y - u * 320 + Math.sin(u * 9 + i) * 16} s={0.4 + Math.min(u, 0.25) * 2.4} t={t + i} color={i % 2 ? C.sky : "#9fd7ff"} rot={-14} />;
          })}
          {(() => {
            const u = (t - sarc) / 6;
            if (u <= 0) return null;
            const p = 1 - Math.pow(1 - Math.min(u * 1.6, 1), 2);
            const away = ramp(t, at(c, 0.93), 2.5);
            const x = mouth.x + p * 290 + away * 420 + Math.sin(t * 1.3) * 10;
            const y = mouth.y - 40 - p * 240 - away * 120 + Math.sin(t * 2.4) * 8;
            return (
              <g>
                <Bird x={x} y={y} s={0.5 + Math.min(u * 6, 1) * 0.9} t={t} color={C.red} spiky rot={-8} />
                {u > 0.2 && (
                  <g opacity={clamp01((u - 0.2) * 5)}>
                    <Tag x={x} y={y + 74} text="сарказм" size={32} color="#ffd9dc" textColor={C.velvetDeep} />
                  </g>
                )}
              </g>
            );
          })()}
          {/* стрелка назад — не работает */}
          {(() => {
            const k = ramp(t, at(c, 0.52), 0.7);
            if (k <= 0) return null;
            return (
              <g opacity={k}>
                <path d="M 610 470 Q 450 420 300 520" stroke={C.inkSoft} strokeWidth={8} strokeDasharray="14 12" fill="none" strokeLinecap="round" />
                <path d="M 300 520 L 312 492 M 300 520 L 330 524" stroke={C.inkSoft} strokeWidth={8} strokeLinecap="round" />
                <Cross x={455} y={455} s={64} k={ramp(t, at(c, 0.55), 0.6)} />
              </g>
            );
          })()}
          {pauseK > 0.01 && (
            <g transform={`translate(500 585) scale(${0.6 + 0.4 * pauseK})`} opacity={clamp01(pauseK * 1.5)}>
              <circle r={58 + Math.sin(t * 2) * 3} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <rect x={-22} y={-26} width={14} height={52} rx={5} fill={OL} />
              <rect x={8} y={-26} width={14} height={52} rx={5} fill={OL} />
              <Txt x={0} y={108} size={34} weight={900}>
                {"пауза\nперед ответом"}
              </Txt>
            </g>
          )}
        </Stage>
      </g>
      <Stage id="w12b" x={720} y={140} w={600} h={660} top="#eef0f6" bottom="#e3e8f2" k={panelB}>
        <Txt x={1020} y={210} size={40} weight={900}>
          Молчанием давят
        </Txt>
        <rect x={720} y={760} width={600} height={60} fill="#d4dbe8" />
        <Figure x={850} y={705} s={0.95} t={t} role="boss" mood="sly" look={1} arms={[30, 30]} />
        <Figure x={1195} y={705} s={0.95} t={t} role="modern" body="#f2a65a" flip mood="worried" look={1} talk={win(t, at(c, 1.3), at(c, 1.8)) > 0.5 ? 1 : 0} arms={[14, 40 + Math.sin(t * 5) * 14]} />
        <rect x={740} y={640} width={560} height={28} rx={8} fill="#a8733c" stroke={OL} strokeWidth={5} />
        <rect x={760} y={668} width={520} height={140} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
        {Array.from({ length: papers }).map((_, i) => (
          <rect key={i} x={970 + Math.sin(i * 2.3) * 8} y={624 - i * 14} width={110} height={14} rx={3} fill="#fff" stroke={OL} strokeWidth={3} />
        ))}
        {papers > 0 && <Tag x={1025} y={560 - papers * 14} text="уступки" size={32} color="#fff3d6" />}
        <Say t={t} at={at(c, 1.15)} x={770} y={330} w={150} h={70} tail={[840, 450]} text="…" size={50} />
        <StopSign x={1180} y={320} k={pop(t, at(c, 1.82))} r={70} />
      </Stage>
    </g>
  );
};

// ═════════════ g13 · нос Давида и Хрущёв ═════════════

const MARBLE = "#f3f5f8";
const MARBLE_S = "#d5dbe4";
const MARBLE_OL = "#8a93a3";

// стилизованная статуя юноши в тунике (без натурализма)
const Statue: React.FC<{
  x: number;
  y: number;
  s?: number;
  t: number;
  glow?: number;
}> = ({ x, y, s = 1, t, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0 && <circle cx={0} cy={-440} r={70} fill={C.goldLight} opacity={0.5 * glow} />}
    <g fill={MARBLE} stroke={MARBLE_OL} strokeWidth={4} strokeLinejoin="round">
      <path d="M -40 -190 L -46 0 L -14 0 L -12 -190 Z" />
      <path d="M 12 -190 L 18 0 L 50 0 L 40 -190 Z" />
      {/* туника */}
      <path d="M -40 -382 Q -60 -300 -64 -180 Q 0 -166 66 -180 Q 60 -300 40 -382 Q 0 -394 -40 -382 Z" />
      <path d="M -40 -382 L 40 -300" stroke={MARBLE_S} strokeWidth={10} fill="none" />
      <path d="M -40 -250 Q 0 -240 40 -250" stroke={MARBLE_S} strokeWidth={6} fill="none" />
      {/* руки: левая поднята к плечу с пращой, правая вдоль тела */}
      <path d="M -40 -372 Q -78 -330 -66 -300 Q -54 -330 -40 -360" />
      <path d="M -66 -302 Q -60 -350 -40 -398" fill="none" strokeWidth={14} stroke={MARBLE} />
      <path d="M 40 -372 Q 70 -300 66 -222 L 50 -222 Q 50 -300 36 -350 Z" />
      <circle cx={-40} cy={-398} r={12} />
      <circle cx={58} cy={-216} r={13} />
      <path d="M -40 -398 Q -10 -330 50 -230" fill="none" stroke="#b9a37c" strokeWidth={4} />
      <rect x={-12} y={-410} width={24} height={30} />
      <circle cx={0} cy={-446} r={44} />
    </g>
    {/* кудри */}
    {[-36, -18, 0, 18, 36, -42, 42].map((d, i) => (
      <circle key={i} cx={d} cy={i > 4 ? -460 : -482 + Math.abs(d) * 0.3} r={14} fill={MARBLE} stroke={MARBLE_OL} strokeWidth={3} />
    ))}
    <path d="M -16 -452 L -6 -452 M 6 -452 L 16 -452" stroke={MARBLE_OL} strokeWidth={4} strokeLinecap="round" />
    <path d="M 0 -448 L 7 -428 L -2 -426" stroke={MARBLE_OL} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M -8 -414 Q 0 -410 8 -414" stroke={MARBLE_OL} strokeWidth={3} fill="none" strokeLinecap="round" />
    <ellipse cx={-24} cy={-300} rx={8} ry={50} fill="#fff" opacity={0.5 + 0.1 * Math.sin(t)} />
  </g>
);

const Duomo: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#f2d3bd" stroke={OL} strokeWidth={4} opacity={0.75}>
    <rect x={-200} y={-120} width={400} height={120} />
    <rect x={-110} y={-190} width={220} height={70} />
    <path d="M -100 -190 Q -100 -330 0 -350 Q 100 -330 100 -190 Z" fill="#e59f7d" />
    <rect x={-16} y={-384} width={32} height={36} fill="#fff1e3" />
    <rect x={250} y={-340} width={60} height={340} />
    <path d="M 0 -350 L 0 -330 M -50 -330 Q -60 -260 -70 -190 M 50 -330 Q 60 -260 70 -190" stroke="#c97a5a" fill="none" />
  </g>
);

const MiniFace: React.FC<{
  x: number;
  y: number;
  mood: "angry" | "happy" | "sad";
  color?: string;
  s?: number;
}> = ({ x, y, mood, color = "#f2c79b", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={44} fill={color} stroke={OL} strokeWidth={5} />
    <circle cx={-15} cy={-6} r={5} fill={OL} />
    <circle cx={15} cy={-6} r={5} fill={OL} />
    {mood === "angry" && <path d="M -26 -24 L -8 -16 M 26 -24 L 8 -16" stroke={OL} strokeWidth={5} strokeLinecap="round" />}
    <path d={mood === "happy" ? "M -16 14 Q 0 28 16 14" : mood === "sad" ? "M -16 22 Q 0 10 16 22" : "M -14 20 L 14 20"} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

const DavidNose: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b2 = at(c, 2);
  const b3 = at(c, 3);
  const b4 = at(c, 4);
  const aK = 1 - ramp(t, b3, 0.8);
  const bK = win(t, b3 + 0.2, b4, 0.8);
  const cK = ramp(t, b4 + 0.2, 0.9);
  // Микеланджело: земля → лестница → помост
  const climb1 = ramp(t, at(c, 2.06), 1.6);
  const climb2 = ramp(t, at(c, 2.06) + 1.6, 2.4);
  const mx = climb2 > 0 ? lerp(1525, 1445, climb2) : lerp(1680, 1525, climb1);
  const my = lerp(792, 402, climb2);
  const ms = lerp(0.9, 0.7, climb2);
  const tapping = t > at(c, 2.36) && t < at(c, 2.78);
  const tapArm = tapping ? 101 + Math.sin(t * 16) * 6 : climb2 > 0.99 ? 70 : 14;
  const dustOn = win(t, at(c, 2.38), at(c, 2.8), 0.3);
  const freeze = at(c, 4.62);
  const hallT = t < freeze ? t : freeze;
  return (
    <g>
      <Stage id="w13a" x={600} y={110} w={1240} h={720} top="#ffeedd" bottom="#fff8ef" k={aK}>
        <Clouds t={t} x0={600} x1={1840} ys={[180, 260]} />
        <Duomo x={800} y={700} s={0.9} />
        <rect x={600} y={700} width={1240} height={140} fill="#e9dcc7" />
        {/* пьедестал и статуя */}
        <rect x={1195} y={690} width={210} height={110} rx={6} fill="#e3d9c8" stroke={OL} strokeWidth={5} />
        <Statue x={1300} y={692} s={0.95} t={t} glow={win(t, at(c, 2.75), b3, 0.5)} />
        {/* леса */}
        <g stroke="#9a6a3a" strokeWidth={12} strokeLinecap="round">
          <path d="M 1150 810 L 1150 300 M 1480 810 L 1480 300" />
          <path d="M 1150 560 L 1480 560 M 1150 420 L 1480 420" strokeWidth={8} opacity={0.8} />
          <path d="M 1150 560 L 1480 420" strokeWidth={6} opacity={0.6} />
        </g>
        <rect x={1360} y={402} width={140} height={18} rx={4} fill="#c08a52" stroke={OL} strokeWidth={4} />
        <g stroke="#7a5530" strokeWidth={7} strokeLinecap="round">
          <path d="M 1505 800 L 1505 410 M 1545 800 L 1545 410" />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M 1505 ${770 - i * 44} L 1545 ${770 - i * 44}`} strokeWidth={5} />
          ))}
        </g>
        {/* нос — под лупой */}
        {(() => {
          const k = win(t, at(c, 1.35), at(c, 2.35), 0.5);
          return k > 0.01 ? <circle cx={1302} cy={268} r={34 + Math.sin(t * 4) * 3} fill="none" stroke={C.red} strokeWidth={6} strokeDasharray="12 8" opacity={k} /> : null;
        })()}
        {/* пыль */}
        {dustOn > 0.01 &&
          Array.from({ length: 16 }).map((_, i) => {
            const p = (t * 1.2 + i / 16) % 1;
            return <circle key={i} cx={1316 + Math.sin(i * 2.1) * 16 + p * Math.sin(i) * 30} cy={276 + p * 220} r={4 + (i % 3) * 2} fill="#d9d2c2" stroke="#9a917f" strokeWidth={2} opacity={dustOn * (1 - p)} />;
          })}
        {/* Микеланджело */}
        <Figure
          x={mx}
          y={my}
          s={ms}
          t={t}
          role="artist"
          flip
          mood={t > at(c, 2.78) ? "sly" : t > at(c, 1.55) ? "worried" : "happy"}
          look={0.6}
          walk={(climb1 > 0.01 && climb1 < 0.99) || (climb2 > 0.01 && climb2 < 0.99) ? 1 : 0}
          arms={[16, tapArm]}
          hold={
            climb2 > 0.99 ? (
              <g>
                <rect x={-4} y={-6} width={46} height={12} rx={3} fill="#9aa4b2" stroke={OL} strokeWidth={3} />
                <rect x={-14} y={-8} width={16} height={16} rx={4} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
              </g>
            ) : undefined
          }
        />
        {/* Содерини */}
        <Figure
          x={880}
          y={792}
          s={1}
          t={t}
          role="minister"
          mood={t > at(c, 2.78) ? "happy" : t > at(c, 1.2) ? "proud" : "neutral"}
          look={-0.8}
          flip
          arms={[t > at(c, 1.25) && t < b2 ? 120 : 12, 14]}
          talk={win(t, at(c, 1.25), at(c, 1.45)) > 0.5 || win(t, at(c, 2.78), at(c, 2.9)) > 0.5 ? 1 : 0}
        />
        <TagAt t={t} at={at(c, 0.05)} out={at(c, 1.2)} x={980} y={180} text="Закон 9: действия, а не доводы" size={36} color={C.yellow} />
        <Year x={1600} y={180} text="Флоренция, 1502" k={pop(t, at(c, 0.4))} />
        <Say t={t} at={at(c, 1.25)} out={at(c, 2.3)} x={680} y={210} w={380} h={92} tail={[870, 478]} text="Нос великоват" size={46} />
        <Say t={t} at={at(c, 2.78)} x={660} y={210} w={420} h={92} tail={[870, 478]} text="Теперь лучше!" size={46} fill="#e6f8ee" />
      </Stage>
      {/* две колонки: спор и показ */}
      {bK > 0.01 && (
        <g opacity={bK}>
          {(() => {
            const k1 = pop(t, at(c, 3.02));
            const k2 = pop(t, at(c, 3.5));
            const r1 = pop(t, at(c, 3.25));
            const r2 = pop(t, at(c, 3.75));
            return (
              <g>
                {k1 > 0.01 && (
                  <g transform={`translate(930 450) scale(${0.7 + 0.3 * k1}) translate(-930 -450)`} opacity={clamp01(k1 * 1.5)}>
                    <Panel x={650} y={170} w={560} h={560} />
                    <Txt x={930} y={250} size={56} weight={900}>
                      спор
                    </Txt>
                    <MiniFace x={850} y={360} mood="angry" s={1.0} />
                    <MiniFace x={1010} y={360} mood="angry" color="#e7b48a" s={1.0} />
                    <path d={`M 922 ${320 + wob(t, 1, 4)} L 908 352 L 936 352 L 920 392`} stroke={C.red} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <Arrow x1={930} y1={440} x2={930} y2={520} k={ramp(t, at(c, 3.15), 0.5)} color={C.inkSoft} w={9} />
                    {r1 > 0.01 && (
                      <g opacity={clamp01(r1 * 1.5)}>
                        <Cloud x={930} y={600} s={1.0} color="#9aa4b6" opacity={1} />
                        <Txt x={930} y={690} size={52} weight={900} color={C.red}>
                          обида
                        </Txt>
                      </g>
                    )}
                  </g>
                )}
                {k2 > 0.01 && (
                  <g transform={`translate(1530 450) scale(${0.7 + 0.3 * k2}) translate(-1530 -450)`} opacity={clamp01(k2 * 1.5)}>
                    <Panel x={1250} y={170} w={560} h={560} />
                    <Txt x={1530} y={250} size={56} weight={900}>
                      показать
                    </Txt>
                    <g transform={`translate(1530 362)`}>
                      <path d="M -70 0 Q 0 -54 70 0 Q 0 54 -70 0 Z" fill="#fff" stroke={OL} strokeWidth={5} />
                      <circle cx={Math.sin(t * 1.5) * 8} r={22} fill={C.skyDeep} stroke={OL} strokeWidth={4} />
                      <circle cx={Math.sin(t * 1.5) * 8 + 6} cy={-6} r={6} fill="#fff" />
                    </g>
                    <Arrow x1={1530} y1={440} x2={1530} y2={520} k={ramp(t, at(c, 3.65), 0.5)} color={C.inkSoft} w={9} />
                    {r2 > 0.01 && (
                      <g opacity={clamp01(r2 * 1.5)}>
                        <circle cx={1530} cy={590} r={46} fill="#d8f5e6" stroke={C.green} strokeWidth={5} />
                        <Check x={1530} y={592} s={36} k={r2} />
                        <Txt x={1530} y={690} size={52} weight={900} color={C.greenDeep}>
                          согласие
                        </Txt>
                      </g>
                    )}
                  </g>
                )}
              </g>
            );
          })()}
        </g>
      )}
      {/* Хрущёв и зал */}
      <Stage id="w13c" x={600} y={110} w={1240} h={720} top="#f6efe4" bottom="#efe2cf" k={cK}>
        <rect x={600} y={110} width={1240} height={60} fill={C.velvetDeep} opacity={0.85} />
        {[640, 1720].map((x, i) => (
          <rect key={i} x={x} y={110} width={80} height={600} fill={C.velvet} stroke={OL} strokeWidth={4} />
        ))}
        <rect x={600} y={620} width={1240} height={220} fill="#dccab0" />
        <Figure
          x={1220}
          y={640}
          s={1.2}
          t={t}
          role="modern"
          body="#5d6b7e"
          mood={t > at(c, 4.8) ? "sly" : t > at(c, 4.52) ? "angry" : "neutral"}
          look={-0.4}
          arms={[14, t > at(c, 4.52) && t < at(c, 4.78) ? 120 : 20]}
          talk={win(t, b4, at(c, 4.25)) > 0.5 || win(t, at(c, 4.52), at(c, 4.6)) > 0.5 || win(t, at(c, 4.8), at(c, 4.95)) > 0.5 ? 1 : 0}
        />
        <g transform="translate(1220 720) scale(1.15) translate(-1220 -720)">
          <path d="M 1110 560 L 1330 560 L 1310 720 L 1130 720 Z" fill="#b5893f" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <rect x={1100} y={548} width={240} height={22} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
          <text x={1220} y={640} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={36} fill="#fff6dc">
            Хрущёв
          </text>
        </g>
        {t > at(c, 4.52) && t < at(c, 4.8) && (
          <g stroke={C.red} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8}>
            <path d={`M 1140 ${300 + wob(t, 2, 3)} l -20 -14 l 10 -6 l -22 -14`} />
            <path d={`M 1300 ${300 + wob(t, 3, 3)} l 20 -14 l -10 -6 l 22 -14`} />
          </g>
        )}
        {/* зал */}
        {[0, 1, 2].map((row) =>
          Array.from({ length: 11 - row }).map((_, i) => {
            const x = 650 + row * 50 + i * 115 + (row % 2) * 20;
            const y = 715 + row * 50;
            const bob = Math.sin(hallT * 2.2 + i * 1.3 + row) * 3;
            const asker = row === 1 && i === 2;
            const hl = asker ? win(t, at(c, 4.25), at(c, 4.55), 0.4) : 0;
            return (
              <g key={`${row}-${i}`} transform={`translate(${x} ${y + bob})`}>
                <path d="M -46 70 Q -46 22 0 22 Q 46 22 46 70 Z" fill={hl > 0.1 ? "#7d6fb3" : "#56637d"} />
                <circle cx={0} cy={-6} r={26} fill={hl > 0.1 ? "#9d8fd3" : "#6b7894"} />
              </g>
            );
          }),
        )}
        <Say t={t} at={at(c, 4.26)} out={at(c, 4.52)} x={640} y={420} w={500} h={120} tail={[900, 735]} text={"Почему вы его\nне остановили?"} size={38} />
        <Say t={t} at={at(c, 4.53)} out={at(c, 4.78)} x={1340} y={150} w={440} h={96} tail={[1290, 320]} text="Кто это сказал?" size={46} fill="#ffe3e3" />
        <TagAt t={t} at={at(c, 4.65)} x={900} y={560} text="зал замер" size={40} color="#fff" />
        <Say t={t} at={at(c, 4.8)} x={1300} y={150} w={520} h={96} tail={[1290, 320]} text="Теперь понимаете?" size={44} fill="#fff8e1" />
      </Stage>
    </g>
  );
};

// ═════════════ g14 · пустой город ═════════════

const Lute: React.FC<{ rot?: number }> = ({ rot = 0 }) => (
  <g transform={`rotate(${rot})`}>
    <rect x={-6} y={-90} width={12} height={70} rx={4} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
    <rect x={-10} y={-104} width={20} height={18} rx={4} fill="#6b4a1e" stroke={OL} strokeWidth={3} />
    <ellipse cx={0} cy={0} rx={30} ry={38} fill="#d59a4f" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-4} r={9} fill={OL} />
    <path d="M -4 -90 L -4 30 M 4 -90 L 4 30" stroke="#fff6dc" strokeWidth={1.5} />
  </g>
);

const Pagoda: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-110} width={120} height={110} fill="#e8d2a8" stroke={OL} strokeWidth={4} />
    <rect x={-20} y={-70} width={40} height={70} fill={C.velvetDeep} stroke={OL} strokeWidth={3} />
    <path d="M -110 -100 Q -60 -120 0 -150 Q 60 -120 110 -100 Q 60 -112 0 -112 Q -60 -112 -110 -100 Z" fill={C.velvet} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-44} y={-190} width={88} height={56} fill="#e8d2a8" stroke={OL} strokeWidth={4} />
    <path d="M -86 -180 Q -44 -196 0 -226 Q 44 -196 86 -180 Q 44 -192 0 -192 Q -44 -192 -86 -180 Z" fill={C.velvet} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 -226 L 0 -250" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-254} r={6} fill={C.gold} stroke={OL} strokeWidth={2} />
  </g>
);

const EmptyCity: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const approach = ramp(t, b1, 4.5);
  const retreat = ramp(t, at(c, 3.58), 5);
  const armyK = ramp(t, b1, 0.8) * (1 - ramp(t, at(c, 3.58) + 3.5, 1.5));
  const armyDx = lerp(-280, 0, approach) - retreat * 420;
  const hide = ramp(t, at(c, 2.2), 1.2);
  const genK = pop(t, at(c, 2.45));
  const music = t > at(c, 2.75);
  return (
    <Stage id="w14" x={80} y={110} w={1240} h={720} top="#ffe6cf" bottom="#fff7ea">
      <circle cx={260} cy={250} r={60} fill="#fff1b8" opacity={0.9} />
      <Clouds t={t} x0={80} x1={1320} ys={[180, 240]} />
      <path d="M 80 470 L 220 360 L 330 430 L 470 330 L 620 440 L 760 380 L 900 450 L 1320 400 L 1320 600 L 80 600 Z" fill="#c9d4e6" />
      <path d="M 80 520 L 260 450 L 420 500 L 600 440 L 820 510 L 1320 470 L 1320 620 L 80 620 Z" fill="#b6c5db" />
      <rect x={80} y={560} width={1240} height={280} fill="#e9dcb3" />
      <path d="M 80 560 Q 600 545 1320 565" stroke="#d6c38f" strokeWidth={6} fill="none" />
      {/* войско на горизонте */}
      {armyK > 0.01 && (
        <g opacity={armyK} transform={`translate(${armyDx} 0)`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <ellipse key={i} cx={110 + i * 64 + Math.sin(t * 0.8 + i) * 14} cy={500 + (i % 2) * 22} rx={100} ry={50} fill="#e2c38f" opacity={0.6} />
          ))}
          {[
            [530, 0.26, 30],
            [565, 0.32, 36],
            [605, 0.38, 42],
            [650, 0.44, 48],
          ].map(([y, s, gap], row) =>
            Array.from({ length: Math.floor(400 / gap) }).map((_, i) => {
              const x = 100 + i * gap + (row % 2) * gap * 0.5;
              const bob = Math.abs(Math.sin(t * 6 + i + row)) * 3 * (1 - (approach > 0.99 && retreat < 0.01 ? 1 : 0));
              const dir = retreat > 0.01 ? -1 : 1;
              return (
                <g key={`${row}-${i}`} transform={`translate(${x} ${y - bob}) scale(${dir * s} ${s})`}>
                  <rect x={-18} y={-60} width={36} height={58} rx={10} fill="#7a4b8f" stroke={OL} strokeWidth={6} />
                  <circle cx={0} cy={-80} r={18} fill="#f2c79b" stroke={OL} strokeWidth={6} />
                  <path d="M -22 -92 L 22 -92 L 0 -112 Z" fill="#4a2f6f" stroke={OL} strokeWidth={5} />
                  {i % 4 === 1 && (
                    <g>
                      <path d="M 26 -40 L 26 -170" stroke={OL} strokeWidth={6} />
                      <path d={`M 26 -170 L ${76 + Math.sin(t * 4 + i) * 6} -158 L 26 -140 Z`} fill={i % 8 === 1 ? C.velvet : C.gold} stroke={OL} strokeWidth={4} />
                    </g>
                  )}
                </g>
              );
            }),
          )}
        </g>
      )}
      {/* солдаты на стене (до приказа) */}
      {[640, 710, 1000, 1070, 1140].map((x, i) => (
        <g key={i} transform={`translate(${x} ${490 + hide * 70})`} opacity={(1 - hide) * ramp(t, at(c, 0.5), 0.8)}>
          <rect x={-16} y={-56} width={32} height={50} rx={10} fill="#3d6bd6" stroke={OL} strokeWidth={4} />
          <circle cx={0} cy={-74} r={17} fill="#f2c79b" stroke={OL} strokeWidth={4} />
          <path d="M -20 -84 L 20 -84 L 0 -104 Z" fill="#2a4aa0" stroke={OL} strokeWidth={4} />
          <path d="M 22 -20 L 22 -120" stroke="#8a5a2b" strokeWidth={5} />
          <path d="M 16 -120 L 22 -134 L 28 -120 Z" fill="#b8c4d6" stroke={OL} strokeWidth={3} />
        </g>
      ))}
      {/* стена */}
      <Pagoda x={1250} y={470} s={0.9} />
      <rect x={560} y={470} width={800} height={340} fill="#d9c7a3" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={562 + i * 50} y={448} width={30} height={26} fill="#d9c7a3" stroke={OL} strokeWidth={4} />
      ))}
      {[540, 610, 680, 750].map((yy, r) => (
        <g key={r}>
          <path d={`M 560 ${yy} L 1360 ${yy}`} stroke="#b9a47c" strokeWidth={3} />
          {Array.from({ length: 9 }).map((_, i) => (
            <path key={i} d={`M ${590 + i * 90 + (r % 2) * 45} ${yy} L ${590 + i * 90 + (r % 2) * 45} ${yy + 70}`} stroke="#b9a47c" strokeWidth={3} />
          ))}
        </g>
      ))}
      {/* открытые ворота */}
      <path d="M 830 810 L 830 640 Q 910 570 990 640 L 990 810 Z" fill="#6b5232" stroke={OL} strokeWidth={5} />
      <path d="M 845 810 L 845 660 Q 910 600 975 660 L 975 810 Z" fill="#8c7b5d" opacity={0.6} />
      <path d="M 830 640 L 772 660 L 772 820 L 830 810 Z" fill="#9a6a3a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 990 640 L 1048 660 L 1048 820 L 990 810 Z" fill="#9a6a3a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      {/* приспущенные флаги */}
      {[640, 1110].map((x, i) => (
        <g key={i}>
          <path d={`M ${x} 448 L ${x} 300`} stroke={OL} strokeWidth={6} />
          <circle cx={x} cy={296} r={7} fill={C.gold} stroke={OL} strokeWidth={3} />
          <path
            d={`M ${x} 372 Q ${x + 30} ${384 + Math.sin(t * 1.5 + i) * 4} ${x + 60} ${400 + Math.sin(t * 1.5 + i) * 5} L ${x + 50} ${436 + Math.sin(t * 1.5 + i) * 5} Q ${x + 24} 420 ${x} 410 Z`}
            fill={i ? C.gold : C.velvet}
            stroke={OL}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </g>
      ))}
      {/* полководец с лютней */}
      {genK > 0.01 && (
        <g opacity={clamp01(genK * 1.4)}>
          <Figure x={910} y={472} s={0.72} t={t} role="scholar" body="#8d8a7a" mood="sleep" look={0} arms={[50, 40 + (music ? Math.sin(t * 9) * 8 : 0)]} />
          <path d="M 870 286 Q 870 252 910 250 Q 950 252 950 286 Z" fill="#2b2b3a" stroke={OL} strokeWidth={3} />
          <path d="M 862 288 L 958 288" stroke="#2b2b3a" strokeWidth={8} strokeLinecap="round" />
          <g transform="translate(918 405)">
            <Lute rot={-62} />
          </g>
          {/* курильница */}
          <g transform="translate(1010 470)">
            <path d="M -20 0 L -14 -24 L 14 -24 L 20 0 Z" fill={C.goldDeep} stroke={OL} strokeWidth={4} />
            {[0, 1, 2].map((i) => {
              const p = (t * 0.35 + i / 3) % 1;
              return <path key={i} d={`M 0 ${-26 - p * 120} q ${10 + Math.sin(t * 2 + i) * 8} -14 0 -28 q -10 -14 0 -28`} stroke="#c9cfdb" strokeWidth={6} fill="none" strokeLinecap="round" opacity={(1 - p) * 0.9} />;
            })}
          </g>
          {music &&
            [0, 1, 2, 3].map((i) => {
              const p = (t * 0.4 + i / 4) % 1;
              return (
                <text key={i} x={850 - p * 60 + Math.sin(t * 2 + i) * 14} y={320 - p * 150} fontSize={44} fontFamily={FONT} fontWeight={900} fill={C.purple} opacity={(1 - p) * clamp01(p * 5)} textAnchor="middle">
                  {i % 2 ? "♪" : "♫"}
                </text>
              );
            })}
        </g>
      )}
      <TagAt t={t} at={at(c, 0.05)} out={b1} x={330} y={180} text="Закон 5: репутация" size={38} color={C.yellow} />
      <TagAt t={t} at={at(c, 0.75)} out={at(c, 2.3)} x={900} y={250} text="сотня солдат" size={36} color="#fff" />
      <Plaque x={300} y={330} text="150 000" k={pop(t, at(c, 1.5)) * (1 - ramp(t, at(c, 3.58) + 2.5, 1))} size={60} />
      <TagAt t={t} at={at(c, 3.35)} out={at(c, 3.58) + 2.5} x={300} y={430} text="ловушка?" size={36} color="#fff" />
      <Ribbon x={760} y={200} text="спасла репутация" k={pop(t, at(c, 3.78))} size={46} />
    </Stage>
  );
};

// ═════════════ g15 · персик Ми Цуся ═════════════

const Peach: React.FC<{ s?: number; bite?: boolean }> = ({ s = 1, bite = true }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0 -26 Q 30 -30 30 0 Q 28 28 0 30 Q -28 28 -30 0 Q -30 -30 0 -26 Z" fill="#ffad7a" stroke={OL} strokeWidth={4} />
    <path d="M 0 -26 Q -6 0 0 28" stroke="#f08a5a" strokeWidth={3} fill="none" />
    {bite && <circle cx={26} cy={-14} r={11} fill="#fff7d6" stroke={OL} strokeWidth={3} />}
    <path d="M 0 -26 Q 6 -42 22 -40 Q 12 -28 0 -26 Z" fill={C.green} stroke={OL} strokeWidth={3} />
  </g>
);

const Cart: React.FC<{ x: number; y: number; t: number; moving: boolean }> = ({ x, y, t, moving }) => {
  const wr = moving ? t * 220 : 0;
  const leg = moving ? Math.sin(t * 9) * 14 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* лошадь */}
      <g transform="translate(150 -10)">
        <path d={`M -40 0 L ${-44 + leg} 50 M -20 0 L ${-18 - leg} 50 M 30 0 L ${32 + leg} 50 M 46 0 L ${44 - leg} 50`} stroke={OL} strokeWidth={8} strokeLinecap="round" />
        <ellipse cx={0} cy={-10} rx={60} ry={30} fill="#c98d5a" stroke={OL} strokeWidth={4} />
        <path d="M 40 -24 Q 60 -70 84 -70 L 96 -50 Q 76 -46 62 -10 Z" fill="#c98d5a" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <circle cx={82} cy={-60} r={3.5} fill={OL} />
        <path d="M 52 -50 Q 40 -40 46 -20" stroke="#6b4a1e" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M -60 -16 Q -82 ${-4 + Math.sin(t * 3) * 6} -78 20`} stroke="#6b4a1e" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <path d="M 40 -20 L 110 -20" stroke={OL} strokeWidth={6} />
      {/* повозка */}
      <path d="M -70 -110 Q 0 -150 70 -110 L 70 -100 L -70 -100 Z" fill={C.gold} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -60 -100 L -60 -40 M 60 -100 L 60 -40" stroke={OL} strokeWidth={5} />
      <rect x={-80} y={-44} width={160} height={36} rx={8} fill={C.velvet} stroke={OL} strokeWidth={4} />
      <g transform={`translate(0 0) rotate(${wr})`}>
        <circle r={36} fill="#fff1d6" stroke={OL} strokeWidth={5} />
        {[0, 60, 120].map((a) => (
          <path key={a} d="M -34 0 L 34 0" stroke={OL} strokeWidth={4} transform={`rotate(${a})`} />
        ))}
        <circle r={7} fill={OL} />
      </g>
    </g>
  );
};

const PeachScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bad = ramp(t, at(c, 2.25), 1.2);
  const goodCol = (k: number) => interpolateColors(bad, [0, 1], [k > 0.5 ? C.green : "#ffffff", C.red]);
  const frame1 = ramp(t, at(c, 1.1), 0.6);
  const frame2 = ramp(t, at(c, 1.5), 0.6);
  const drive = ramp(t, at(c, 0.15), 6);
  const card2 = pop(t, at(c, 1.45));
  const cloudK = ramp(t, at(c, 2.05), 1.4);
  return (
    <g>
      {/* карточка 1: карета к больной матери (сначала по центру, потом уступает место второй) */}
      <g transform={`translate(${320 * (1 - ramp(t, at(c, 1.3), 1))} 0)`}>
        <Stage id="w15a" x={620} y={200} w={580} h={520} top="#e3f3ff" bottom="#f7fcff" k={pop(t, at(c, 0.05))}>
          <Clouds t={t} x0={620} x1={1200} ys={[270]} />
          <rect x={620} y={600} width={580} height={130} fill="#d9e9c3" />
          <path d="M 620 640 L 1200 640" stroke="#c2b38c" strokeWidth={30} />
          {/* дом матери */}
          <g transform="translate(1110 620)">
            <rect x={-70} y={-140} width={140} height={140} fill="#fff1d6" stroke={OL} strokeWidth={4} />
            <path d="M -96 -136 Q 0 -200 96 -136 Q 0 -160 -96 -136 Z" fill={C.velvetDeep} stroke={OL} strokeWidth={4} />
            <rect x={-46} y={-110} width={92} height={70} rx={6} fill="#ffe9b0" stroke={OL} strokeWidth={4} />
            <circle cx={-6} cy={-80} r={16} fill="#f5d2b0" stroke={OL} strokeWidth={3} />
            <path d="M -22 -88 Q -6 -104 10 -88" stroke="#ddd" strokeWidth={8} fill="none" />
            <path d={drive > 0.95 ? "M -12 -74 Q -6 -69 0 -74" : "M -12 -71 Q -6 -76 0 -71"} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
            <rect x={-42} y={-62} width={84} height={20} rx={6} fill={C.purpleLight} stroke={OL} strokeWidth={3} />
          </g>
          <Cart x={lerp(590, 770, drive)} y={640} t={t} moving={drive > 0.01 && drive < 0.99} />
          <Figure x={lerp(590, 770, drive)} y={600} s={0.42} t={t} role="courtier" body="#2fa5a0" mood="worried" look={1} arms={[50, 50]} />
          <TagAt t={t} at={at(c, 0.2)} out={at(c, 1.1)} x={760} y={260} text="Ми Цуся" size={32} color={C.yellow} />
          <TagAt t={t} at={at(c, 0.8)} out={at(c, 1.1)} x={910} y={700} text="по закону — суровая кара" size={28} color="#fff" textColor={C.inkSoft} />
          {/* ярлык-реакция правителя */}
          {(() => {
            const k = pop(t, at(c, 1.15)) * (1 - ramp(t, at(c, 2.2), 0.5));
            if (k <= 0.01) return null;
            return (
              <g transform={`translate(910 290) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.5)}>
                <rect x={-265} y={-46} width={530} height={88} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
                <Crown x={-218} y={8} s={0.38} />
                <Txt x={36} y={14} size={38} weight={900} color={C.greenDeep}>
                  Какой хороший сын!
                </Txt>
              </g>
            );
          })()}
          <rect x={620} y={200} width={580} height={520} fill={C.red} opacity={0.12 * bad} />
        </Stage>
        {frame1 > 0.01 && <rect x={614} y={194} width={592} height={532} rx={38} fill="none" stroke={goodCol(frame1)} strokeWidth={12 * Math.max(frame1, bad)} opacity={Math.max(frame1, bad)} />}
        <Stamp x={910} y={470} text="ПРЕСТУПЛЕНИЕ" k={pop(t, at(c, 2.45))} size={44} rot={-12} />
      </g>
      {/* карточка 2: персик */}
      {card2 > 0.01 && (
        <g>
          <Stage id="w15b" x={1260} y={200} w={580} h={520} top="#fff3e0" bottom="#fffaf2" k={card2}>
            <Tree x={1560} y={640} s={0.75} t={t} fruits={7} />
            <rect x={1260} y={630} width={580} height={100} fill="#d9e9c3" />
            <Figure x={1400} y={680} s={0.72} t={t} role="king" mood={bad > 0.5 ? "angry" : t > at(c, 1.7) ? "happy" : "neutral"} look={1} arms={[12, bad > 0.5 ? 12 : 50]} />
            <Figure x={1690} y={680} s={0.72} t={t} role="courtier" body="#2fa5a0" flip mood="happy" look={1} arms={[12, t < at(c, 1.95) ? 82 : 20]} hold={t < at(c, 1.95) ? <Peach s={0.8} /> : undefined} />
            {t >= at(c, 1.95) && (
              <g transform={`translate(1468 ${520 + wob(t, 2, 3)})`}>
                <Peach s={0.6} />
              </g>
            )}
            {(() => {
              const k = ramp(t, at(c, 1.75), 0.6) * (1 - bad);
              if (k <= 0.01) return null;
              const p = (t * 0.5) % 1;
              return (
                <g opacity={k * (1 - p)}>
                  <path transform={`translate(1560 ${500 - p * 70}) scale(1.2)`} d="M 0 18 C -40 -10 -30 -40 -12 -40 C -4 -40 0 -32 0 -28 C 0 -32 4 -40 12 -40 C 30 -40 40 -10 0 18 Z" fill={C.red} stroke={OL} strokeWidth={3} />
                </g>
              );
            })()}
            <Say t={t} at={at(c, 1.72)} out={at(c, 2.2)} x={1290} y={240} w={460} h={86} tail={[1410, 460]} text="Как он меня любит!" size={38} color={C.greenDeep} />
            <rect x={1260} y={200} width={580} height={520} fill={C.red} opacity={0.12 * bad} />
          </Stage>
          {frame2 > 0.01 && <rect x={1254} y={194} width={592} height={532} rx={38} fill="none" stroke={goodCol(frame2)} strokeWidth={12 * Math.max(frame2, bad)} opacity={Math.max(frame2, bad)} />}
          <Stamp x={1550} y={470} text="ПРЕСТУПЛЕНИЕ" k={pop(t, at(c, 2.55))} size={44} rot={-8} />
        </g>
      )}
      {/* тучи сплетен */}
      {cloudK > 0.01 &&
        [760, 1000, 1240, 1480, 1720].map((x, i) => (
          <g key={i} transform={`translate(${x + Math.sin(t * 0.8 + i) * 14} ${lerp(40, 175, cloudK)})`} opacity={cloudK}>
            <Cloud x={0} y={0} s={1.15} color="#8e97a8" opacity={0.95} />
            {i % 2 === 0 && (
              <Txt x={0} y={4} size={28} weight={900} color="#fff">
                шу-шу
              </Txt>
            )}
          </g>
        ))}
      <TagAt t={t} at={at(c, 2.7)} x={1230} y={790} text="изменилась только репутация" size={38} color={C.yellow} />
    </g>
  );
};

// ═════════════ g16 · репутация и слухи ═════════════

const Shield: React.FC<{
  x: number;
  y: number;
  s?: number;
  crack?: number;
}> = ({ x, y, s = 1, crack = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -190 Q 90 -150 150 -160 Q 160 40 0 190 Q -160 40 -150 -160 Q -90 -150 0 -190 Z" fill={C.skyDeep} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 0 -160 Q 74 -128 122 -134 Q 128 30 0 156 Q -128 30 -122 -134 Q -74 -128 0 -160 Z" fill={C.sky} stroke={C.gold} strokeWidth={8} />
    <path d="M -60 -100 Q -80 -20 -40 60" stroke="#fff" strokeWidth={12} fill="none" opacity={0.5} strokeLinecap="round" />
    <Crown x={0} y={10} s={0.8} />
    {crack > 0.01 && <path d="M 56 -70 L 30 -30 L 50 0 L 20 40" stroke={OL} strokeWidth={5} fill="none" strokeDasharray={160} strokeDashoffset={160 * (1 - crack)} strokeLinecap="round" />}
  </g>
);

const ArrowShaft: React.FC<{
  x: number;
  y: number;
  rot: number;
  s?: number;
  q?: boolean;
}> = ({ x, y, rot, s = 1, q }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -110 0 L 0 0" stroke="#8a5a2b" strokeWidth={7} strokeLinecap="round" />
    <path d="M 0 0 L -22 -12 L -22 12 Z" fill="#9aa4b2" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -110 0 L -128 -14 M -110 0 L -128 14 M -98 0 L -116 -14 M -98 0 L -116 14" stroke={C.velvet} strokeWidth={5} strokeLinecap="round" />
    {q && (
      <g transform="translate(-70 -34) rotate(0)">
        <rect x={-24} y={-24} width={48} height={42} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.red}>
          ?
        </text>
      </g>
    )}
  </g>
);

const Envelope: React.FC<{
  x: number;
  y: number;
  rot?: number;
  s?: number;
}> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-40} y={-26} width={80} height={52} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
    <path d="M -40 -26 L 0 6 L 40 -26" stroke={OL} strokeWidth={4} fill="none" strokeLinejoin="round" />
    <circle cx={0} cy={8} r={13} fill={C.velvet} stroke={OL} strokeWidth={3} />
    <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">
      ?
    </text>
  </g>
);

const EyeIcon: React.FC<{ x: number; y: number; look: number; t: number }> = ({ x, y, look, t }) => (
  <g transform={`translate(${x} ${y + wob(t, x, 4)})`}>
    <path d="M -40 0 Q 0 -30 40 0 Q 0 30 -40 0 Z" fill="#fff" stroke={OL} strokeWidth={4} />
    <circle cx={look * 14} cy={0} r={12} fill={C.purple} />
    <path d="M -36 -18 L 30 -26" stroke={OL} strokeWidth={5} strokeLinecap="round" />
  </g>
);

const Rumors: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b0 = at(c, 0);
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const aK = 1 - ramp(t, b1, 0.8);
  const bK = win(t, b1 + 0.2, b2, 0.8);
  const cK = ramp(t, b2 + 0.2, 0.8);
  const doubtAt = at(c, 0.78);
  // кисть-чародей перекрашивает поступок
  const ph = Math.max(0, (t - b0 - 1) / 2.6);
  const cyc = Math.floor(ph);
  const wipe = clamp01((ph - cyc) * 1.6);
  const oldCol = cyc % 2 === 0 ? "#d6f5e3" : "#ffd9dc";
  const newCol = cyc % 2 === 0 ? "#ffd9dc" : "#d6f5e3";
  const showGood = wipe < 0.5 ? cyc % 2 === 0 : cyc % 2 === 1;
  const letters = 9;
  const signFall = ramp(t, at(c, 1.78), 1.2);
  return (
    <g>
      {aK > 0.01 && (
        <g opacity={aK}>
          <Shield x={330} y={450} s={1.05} crack={ramp(t, doubtAt + 0.5, 0.6)} />
          <Ribbon x={330} y={720} text="репутация" size={42} />
          {[0, 1, 2].map((i) => {
            const p = ((t - b0) / 2.2 + i / 3) % 1;
            if (t > doubtAt || t < b0 + 0.6) return null;
            // полёт к щиту и отскок
            const hit = 0.55;
            const x = p < hit ? lerp(680, 470, p / hit) : lerp(470, 600, (p - hit) / (1 - hit));
            const y = p < hit ? lerp(170 + i * 50, 360 + i * 60, p / hit) : lerp(360 + i * 60, 150 + i * 40, (p - hit) / (1 - hit));
            const rot = p < hit ? 135 - i * 6 : 240 + (p - hit) * 200;
            return <ArrowShaft key={i} x={x} y={y} rot={rot} s={0.9} />;
          })}
          {(() => {
            const k = ramp(t, doubtAt, 0.5);
            if (k <= 0) return null;
            return (
              <g>
                <ArrowShaft x={lerp(700, 400, k)} y={lerp(160, 380, k)} rot={143} s={0.95} q />
                <Tag x={560} y={600} text="сомнение" size={34} color="#ffd9dc" textColor={C.velvetDeep} />
              </g>
            );
          })()}
          {/* карточка «один поступок — разные цвета» */}
          <Panel x={700} y={150} w={600} h={500} />
          <Txt x={1000} y={215} size={38} weight={900}>
            один и тот же поступок
          </Txt>
          <defs>
            <clipPath id="w16-card">
              <rect x={730} y={245} width={540} height={380} rx={24} />
            </clipPath>
          </defs>
          <g clipPath="url(#w16-card)">
            <rect x={730} y={245} width={540} height={380} fill={oldCol} />
            <rect x={730} y={245} width={540 * wipe} height={380} fill={newCol} />
            <Person x={890} y={540} s={1.1} color={C.violet} t={t} arms={0.6} />
            <Person x={1110} y={540} s={1.1} color={C.coral} t={t + 1} arms={0.2} />
            <g transform={`translate(1000 ${440 + wob(t, 1, 4)})`}>
              <rect x={-36} y={-30} width={72} height={60} rx={6} fill={C.gold} stroke={OL} strokeWidth={4} />
              <path d="M 0 -30 L 0 30 M -36 0 L 36 0" stroke={C.velvet} strokeWidth={8} />
            </g>
            <Txt x={1000} y={330} size={42} weight={900} color={showGood ? C.greenDeep : C.red}>
              {showGood ? "щедрость!" : "подкуп!"}
            </Txt>
          </g>
          {ph > 0 && (
            <g transform={`translate(${730 + 540 * wipe} ${420}) rotate(25)`}>
              <rect x={-8} y={-10} width={16} height={190} rx={6} fill={C.night} stroke={OL} strokeWidth={3} />
              <path d="M 0 -60 L 12 -24 L 50 -24 L 20 0 L 30 36 L 0 14 L -30 36 L -20 0 L -50 -24 L -12 -24 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            </g>
          )}
          <TagAt t={t} at={at(c, 0.3)} x={1000} y={700} text="сила чародея" size={36} color={C.purpleLight} />
        </g>
      )}
      {bK > 0.01 && (
        <g opacity={bK}>
          {/* опровержение выглядит подозрительно */}
          <Figure x={300} y={790} s={1.05} t={t} role="modern" mood="worried" look={0} arms={[120, 120]} talk={win(t, b1, at(c, 1.3)) > 0.5 ? 1 : 0} />
          <Say t={t} at={at(c, 1.05)} x={110} y={230} w={380} h={90} tail={[290, 470]} text="Это неправда!" size={44} />
          {[
            [140, 420, 1],
            [470, 420, -1],
            [500, 600, -1],
            [110, 610, 1],
          ].map(([x, y, l], i) => (pop(t, at(c, 1.2) + i * 0.4) > 0.01 ? <EyeIcon key={i} x={x} y={y} look={l} t={t} /> : null))}
          {/* Барнум и газета */}
          <g transform={`translate(1090 ${360 + wob(t, 2, 3)}) rotate(-3)`}>
            <rect x={-220} y={-170} width={440} height={330} rx={10} fill="#fbfaf5" stroke={OL} strokeWidth={5} />
            <text x={0} y={-112} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={50} fill={C.ink}>
              ГАЗЕТА
            </text>
            <path d="M -200 -90 L 200 -90" stroke={OL} strokeWidth={4} />
            {Array.from({ length: 6 }).map((_, i) => (
              <path key={i} d={`M -190 ${-60 + i * 34} L ${i % 3 === 2 ? 60 : 190} ${-60 + i * 34}`} stroke="#c3c9d4" strokeWidth={10} strokeLinecap="round" />
            ))}
          </g>
          {Array.from({ length: letters }).map((_, i) => {
            const s0 = at(c, 1.42) + i * 0.55;
            const p = clamp01((t - s0) / 1.1);
            if (p <= 0) return null;
            const x = lerp(830, 960 + (i % 3) * 110, p);
            const y = lerp(630, 330 + Math.floor(i / 3) * 70, p) - Math.sin(p * Math.PI) * 120;
            return <Envelope key={i} x={x} y={y} rot={lerp(-20, i % 2 ? 8 : -8, p)} s={0.85} />;
          })}
          <Figure x={760} y={792} s={0.9} t={t} role="merchant" mood="sly" look={1} arms={[14, 100 + Math.sin(t * 5) * 20]} />
          <TagAt t={t} at={at(c, 1.45)} x={740} y={500} text="Барнум" size={34} color={C.yellow} />
          {/* музей конкурента */}
          <g transform="translate(1110 800)">
            <rect x={-130} y={-170} width={260} height={170} fill={interpolateColors(signFall, [0, 1], ["#fff1d6", "#d9d9d9"])} stroke={OL} strokeWidth={5} />
            <path d="M -150 -170 L 0 -230 L 150 -170 Z" fill={interpolateColors(signFall, [0, 1], [C.coral, "#b9b9b9"])} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
            <rect x={-30} y={-90} width={60} height={90} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
            <g transform={`translate(${-100 + signFall * 20} -140) rotate(${signFall * 24} 0 0) translate(0 ${signFall * signFall * 90})`}>
              <rect x={0} y={-24} width={200} height={48} rx={8} fill={C.night} stroke={OL} strokeWidth={4} />
              <text x={100} y={12} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={32} fill={C.goldLight}>
                МУЗЕЙ
              </text>
            </g>
          </g>
        </g>
      )}
      {cK > 0.01 && (
        <g opacity={cK}>
          <TagAt t={t} at={at(c, 2.05)} x={700} y={160} text="Наш вывод" size={42} color={C.yellow} />
          {(() => {
            const k1 = pop(t, at(c, 2.3));
            const k2 = pop(t, at(c, 2.62));
            return (
              <g>
                {k1 > 0.01 && (
                  <g transform={`translate(390 460) scale(${0.7 + 0.3 * k1}) translate(-390 -460)`} opacity={clamp01(k1 * 1.4)}>
                    <Panel x={120} y={230} w={540} h={470} />
                    <Shield x={390} y={400} s={0.55} />
                    <circle cx={470} cy={470} r={40} fill="#d8f5e6" stroke={C.green} strokeWidth={5} />
                    <Check x={470} y={472} s={30} k={ramp(t, at(c, 2.38), 0.5)} />
                    <Txt x={390} y={590} size={48} weight={900}>
                      {"беречь\nпоступками"}
                    </Txt>
                  </g>
                )}
                {k2 > 0.01 && (
                  <g transform={`translate(1010 460) scale(${0.7 + 0.3 * k2}) translate(-1010 -460)`} opacity={clamp01(k2 * 1.4)}>
                    <Panel x={740} y={230} w={540} h={470} />
                    <Bubble x={900} y={290} w={180} h={110} fill="#fff3d6" />
                    <text x={990} y={366} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.red}>
                      ?
                    </text>
                    <g transform={`translate(${1070 + Math.sin(t * 1.6) * 16} ${420 + Math.cos(t * 1.6) * 8})`}>
                      <circle r={50} fill="#e6f4ff" opacity={0.7} stroke={OL} strokeWidth={8} />
                      <path d="M 36 36 L 84 84" stroke={OL} strokeWidth={16} strokeLinecap="round" />
                    </g>
                    <Txt x={1010} y={590} size={48} weight={900}>
                      {"кому выгоден\nслух?"}
                    </Txt>
                  </g>
                )}
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};

// ═════════════ g16b · нищий с кирпичами и Мата Хари ═════════════

const Brick: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-26} y={-16} width={52} height={26} rx={4} fill="#c0573e" stroke={OL} strokeWidth={4} />
    <path d="M -26 -16 L -18 -24 L 34 -24 L 26 -16 M 26 10 L 34 2 L 34 -24" fill="#d97a5e" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
  </g>
);

const ThoughtCloud: React.FC<{
  x: number;
  y: number;
  k: number;
  grey: number;
  children?: React.ReactNode;
  tail: [number, number];
  t: number;
  seed: number;
}> = ({ x, y, k, grey, children, tail, t, seed }) => {
  if (k <= 0.01) return null;
  const col = interpolateColors(grey, [0, 1], ["#ffffff", "#c7ccd6"]);
  const yy = y + wob(t, seed, 5);
  return (
    <g opacity={clamp01(k * 1.5)}>
      {[0.35, 0.65].map((f, i) => (
        <circle key={i} cx={lerp(x, tail[0], f)} cy={lerp(yy + 40, tail[1], f)} r={12 - i * 4} fill={col} stroke={OL} strokeWidth={3} />
      ))}
      <g transform={`translate(${x} ${yy}) scale(${0.6 + 0.4 * k})`}>
        <path d="M -90 20 Q -110 -20 -70 -36 Q -60 -76 -14 -66 Q 20 -96 56 -64 Q 104 -66 96 -20 Q 120 20 80 40 Q 50 70 0 54 Q -50 70 -90 20 Z" fill={col} stroke={OL} strokeWidth={4} />
        {children}
      </g>
    </g>
  );
};

const Bricks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b1 = at(c, 1);
  const b2 = at(c, 2);
  const streetK = 1 - ramp(t, b2, 0.9);
  const stageK = ramp(t, b2 + 0.3, 0.9);
  const cx = 1060;
  const cy = 735;
  const rx = 320;
  const ry = 58;
  const th = t * 0.42 + 1.2;
  const spots = [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2 + Math.PI / 2);
  const norm = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const carried = Math.floor(norm(th - Math.PI / 2) / ((Math.PI * 2) / 5));
  const nFollow = Math.round(7 * ramp(t, at(c, 0.6), Math.max(1, at(c, 1.35) - at(c, 0.6))));
  const queue = Math.round(6 * ramp(t, b1, 4));
  const pos = (a: number) => ({
    x: cx + rx * Math.cos(a),
    y: cy + ry * Math.sin(a),
  });
  type Ent = { y: number; node: React.ReactNode };
  const ents: Ent[] = [];
  const bp = pos(th);
  const dir = -Math.sin(th);
  ents.push({
    y: bp.y,
    node: <Figure key="beggar" x={bp.x} y={bp.y} s={0.68} t={t} role="peasant" body="#8f7650" mood="neutral" look={dir > 0 ? 1 : -1} walk={1} arms={[60, 60]} hold={<Brick x={-36} y={-10} s={0.9} />} />,
  });
  const colors = [C.coral, C.violet, C.green, C.skyDeep, C.gold, "#ff9ec0", "#3fb6a8"];
  for (let j = 0; j < nFollow; j++) {
    const p = pos(th - 0.45 * (j + 1));
    ents.push({
      y: p.y,
      node: <Person key={`f${j}`} x={p.x} y={p.y - 30} s={0.5} color={colors[j % colors.length]} hat={j % 2 === 0} t={t + j} />,
    });
  }
  ents.sort((a, b) => a.y - b.y);
  const sing = (i: number) => pop(t, at(c, 2.32) + i * 0.09);
  const grey = ramp(t, at(c, 2.72), 0.8);
  return (
    <g>
      <Stage id="w16b-a" x={600} y={110} w={1240} h={720} top="#dcefff" bottom="#f4faff" k={streetK}>
        <Clouds t={t} x0={600} x1={1840} ys={[170, 230]} />
        {/* дома */}
        {[
          [600, 300, "#ffd9b0"],
          [760, 250, "#cfe8c8"],
          [920, 320, "#d9ccfb"],
          [1080, 270, "#ffe39a"],
          [1240, 310, "#ffc9c9"],
        ].map(([x, top, col], i) => (
          <g key={i}>
            <rect x={x as number} y={top as number} width={160} height={640 - (top as number)} fill={col as string} stroke={OL} strokeWidth={4} />
            {[0, 1].map((r) => [0, 1].map((cc) => <rect key={`${r}${cc}`} x={(x as number) + 28 + cc * 64} y={(top as number) + 40 + r * 110} width={40} height={60} rx={6} fill="#bfe6ff" stroke={OL} strokeWidth={3} />))}
          </g>
        ))}
        {/* Музей Барнума */}
        <g>
          <rect x={1420} y={300} width={440} height={340} fill="#fff1d6" stroke={OL} strokeWidth={5} />
          <path d="M 1400 300 L 1640 200 L 1880 300 Z" fill={C.velvet} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          {[1450, 1520, 1760, 1830].map((x, i) => (
            <rect key={i} x={x - 14} y={410} width={28} height={230} fill="#f4ecdd" stroke={OL} strokeWidth={4} />
          ))}
          <rect x={1450} y={320} width={360} height={70} rx={10} fill={C.night} stroke={C.gold} strokeWidth={4} />
          <text x={1630} y={366} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={34} fill={C.goldLight}>
            Музей Барнума
          </text>
          <path d="M 1580 640 L 1580 520 Q 1630 470 1680 520 L 1680 640 Z" fill="#8a5a2b" stroke={OL} strokeWidth={5} />
          <ellipse cx={1630} cy={570} rx={80} ry={90} fill={C.goldLight} opacity={0.25 + 0.12 * Math.sin(t * 2)} />
          {[1460, 1800].map((x, i) => (
            <path key={i} d={`M ${x} 300 L ${x} 230 M ${x} 230 L ${x + 44 + Math.sin(t * 3 + i) * 5} 242 L ${x} 256`} stroke={OL} strokeWidth={4} fill={i ? C.gold : C.sky} />
          ))}
        </g>
        <rect x={600} y={640} width={1240} height={200} fill="#e6dccb" />
        <path d="M 600 640 L 1840 640" stroke={OL} strokeWidth={4} opacity={0.4} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#c9bba3" strokeWidth={5} strokeDasharray="16 12" />
        {spots.map((a, i) => (i === carried ? null : <Brick key={i} x={pos(a).x} y={pos(a).y} s={1} />))}
        {/* очередь у входа */}
        {Array.from({ length: queue }).map((_, i) => (
          <Person key={i} x={1700 - i * 46} y={690 - (i % 2) * 8} s={0.44} color={colors[(i + 3) % colors.length]} hat={i % 2 === 1} t={t + i * 0.7} />
        ))}
        {ents.map((e) => e.node)}
        <Arrow x1={1400} y1={700} x2={1560} y2={620} k={ramp(t, at(c, 0.85), 0.8)} color={C.goldDeep} w={8} bend={-0.2} />
        {/* полицейский */}
        {(() => {
          const k = pop(t, at(c, 1.72));
          if (k <= 0.01) return null;
          const whistle = Math.sin(t * 8) > 0;
          return (
            <g opacity={clamp01(k * 1.5)}>
              <Figure x={1500} y={800} s={0.88} t={t} role="soldier" body="#2a3f75" mood="angry" look={-1} flip arms={[10, 150]} />
              <g transform="translate(1470 560)">
                <rect x={-14} y={-8} width={34} height={16} rx={6} fill="#c9d2df" stroke={OL} strokeWidth={3} />
                {whistle && <path d="M -24 -14 L -44 -26 M -26 0 L -50 0 M -24 14 L -44 26" stroke={C.red} strokeWidth={5} strokeLinecap="round" />}
              </g>
            </g>
          );
        })()}
        <TagAt t={t} at={at(c, 0.35)} out={at(c, 1.35)} x={880} y={190} text="5 кирпичей — ни слова" size={36} color="#fff" />
        <Plaque x={900} y={200} text="≈ 1000 посетителей" k={pop(t, at(c, 1.42))} size={44} />
        <TagAt t={t} at={at(c, 1.8)} x={1500} y={460} text="полиция: толпы!" size={34} color="#ffd9dc" textColor={C.velvetDeep} />
      </Stage>
      <Stage id="w16b-b" x={600} y={110} w={1240} h={720} top="#8676c4" bottom="#b3a6e0" k={stageK}>
        <path d="M 1100 110 L 1340 110 L 1520 760 L 920 760 Z" fill="#fff7cf" opacity={0.22 + 0.04 * Math.sin(t * 2)} />
        <rect x={600} y={700} width={1240} height={140} fill="#b98a55" />
        <path d="M 600 700 L 1840 700" stroke={OL} strokeWidth={4} />
        <ellipse cx={1220} cy={780} rx={240} ry={34} fill="#fff7cf" opacity={0.45} />
        <Curtain x={600} y={110} h={640} w={170} t={t} />
        <Curtain x={1840} y={110} h={640} w={170} t={t + 1} flip />
        <path d="M 600 110 L 1840 110 L 1840 170 Q 1220 220 600 170 Z" fill={C.velvetDeep} stroke={OL} strokeWidth={4} />
        {/* танцовщица */}
        {(() => {
          const a = Math.sin(t * 2.2);
          const x = 1220 + Math.sin(t * 1.1) * 20;
          return (
            <g>
              <path d={`M ${x - 40} 470 Q ${x - 140} ${560 + a * 30} ${x - 120 + a * 20} 700 Q ${x} 640 ${x + 120 - a * 20} 700 Q ${x + 140} ${560 - a * 30} ${x + 40} 470 Z`} fill="#f3eeff" opacity={0.55} stroke="#ffffff" strokeWidth={3} />
              <Figure x={x} y={780} s={1.1} t={t} role="lady" body="#2fb5a8" mood={grey > 0.5 ? "worried" : "happy"} look={a * 0.6} arms={[120 + a * 30, 140 - a * 30]} />
            </g>
          );
        })()}
        <TagAt t={t} at={at(c, 2.08)} out={at(c, 2.72)} x={1220} y={180} text="внимание любой ценой опасно" size={36} color={C.yellow} />
        <ThoughtCloud x={870} y={300} k={sing(0)} grey={grey} tail={[1150, 400]} t={t} seed={1}>
          <Crown x={0} y={10} s={0.5} />
        </ThoughtCloud>
        <ThoughtCloud x={1580} y={300} k={sing(1)} grey={grey} tail={[1290, 400]} t={t} seed={2}>
          <path d="M 0 -40 L 12 -12 L 42 -12 L 18 6 L 28 36 L 0 18 L -28 36 L -18 6 L -42 -12 L -12 -12 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        </ThoughtCloud>
        <ThoughtCloud x={830} y={520} k={sing(2)} grey={grey} tail={[1120, 500]} t={t} seed={3}>
          <path d="M 0 -40 L 34 -6 L 0 40 L -34 -6 Z" fill="#9ad8ff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        </ThoughtCloud>
        <ThoughtCloud x={1610} y={520} k={sing(3)} grey={grey} tail={[1320, 500]} t={t} seed={4}>
          <path d="M -4 36 Q 0 0 -6 -26" stroke="#8a5a2b" strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d="M -6 -26 Q -40 -40 -50 -10 M -6 -26 Q 30 -50 46 -16 M -6 -26 Q -20 -60 10 -60" stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" />
        </ThoughtCloud>
        <TagAt t={t} at={at(c, 2.3)} x={1220} y={360} text="Мата Хари" size={34} color="#fff" />
        <Stamp x={1220} y={250} text="шпионка?" k={pop(t, at(c, 2.78))} size={52} rot={-6} />
      </Stage>
    </g>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WORDS_VISUALS: Record<string, React.FC<VisualProps<any>>> = {
  coriolanus: Coriolanus,
  thinkKing: ThinkKing,
  wordsBirds: WordsBirds,
  davidNose: DavidNose,
  emptyCity: EmptyCity,
  peach: PeachScene,
  rumors: Rumors,
  bricks: Bricks,
};
