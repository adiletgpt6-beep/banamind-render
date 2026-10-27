// Надписи поверх точек: заголовки, подписи-чипы, цитаты с указанием книги,
// пометки «миф / модель Платона», списки, стрелки, сравнения.
// Время появления — абсолютные секунды фильма (рассчитаны по озвучке).
import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { C, DOT, FONT, FPS, SERIF } from "../theme";

export type OverlayAbs = { from: number; to: number; kind: string; [key: string]: unknown };

const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const s = (o: OverlayAbs, k: string, d = "") => (typeof o[k] === "string" ? (o[k] as string) : d);
const n = (o: OverlayAbs, k: string, d: number) => (typeof o[k] === "number" ? (o[k] as number) : d);

const life = (o: OverlayAbs, t: number) => {
  const inK = interpolate(t, [o.from, o.from + 0.5], [0, 1], { ...clamp, easing: ease });
  const outK = interpolate(t, [o.to - 0.35, o.to], [1, 0], { ...clamp, easing: ease });
  return Math.min(inK, outK);
};

const Chip: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const sp = spring({ frame: Math.round((t - o.from) * FPS), fps: FPS, config: { damping: 13, stiffness: 150 } });
  const size = n(o, "size", 38);
  const color = s(o, "color", DOT.gold);
  const text = s(o, "text");
  const w = text.length * size * 0.58 + size * 1.9;
  const x = n(o, "x", 960);
  const y = n(o, "y", 200);
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * sp})`} opacity={k}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.65} rx={size * 0.82} fill="rgba(12,16,40,0.78)" stroke={color} strokeWidth={3} />
      <circle cx={-w / 2 + size * 0.75} cy={-size * 0.13} r={size * 0.22} fill={color} />
      <text x={size * 0.3} y={size * 0.2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.text}>
        {text}
      </text>
    </g>
  );
};

// крупная кинетическая надпись: буквы въезжают снизу с запаздыванием
const Title: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const text = s(o, "text");
  const size = n(o, "size", 96);
  const x = n(o, "x", 960);
  const y = n(o, "y", 220);
  const color = s(o, "color", C.text);
  const letters = [...text];
  const sub = s(o, "sub");
  return (
    <g opacity={k}>
      <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={size * 0.02}>
        {letters.map((ch, i) => {
          const a = o.from + i * 0.025;
          const p = interpolate(t, [a, a + 0.45], [0, 1], { ...clamp, easing: ease });
          return (
            <tspan key={i} dy={0} opacity={p} style={{ fontVariantLigatures: "none" }}>
              {ch}
            </tspan>
          );
        })}
      </text>
      <rect x={x - (letters.length * size * 0.29) * interpolate(t, [o.from + 0.2, o.from + 0.9], [0, 1], { ...clamp, easing: ease })} y={y + size * 0.22} width={letters.length * size * 0.58 * interpolate(t, [o.from + 0.2, o.from + 0.9], [0, 1], { ...clamp, easing: ease })} height={6} rx={3} fill={DOT.gold} />
      {sub && (
        <text x={x} y={y + size * 0.22 + 58} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size * 0.38} fill={C.soft} opacity={interpolate(t, [o.from + 0.5, o.from + 1], [0, 1], clamp)}>
          {sub}
        </text>
      )}
    </g>
  );
};

// цитата из перевода (короткая) + точная ссылка на книгу
const Quote: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const x = n(o, "x", 960);
  const y = n(o, "y", 260);
  const lines = s(o, "text").split("\n");
  const size = n(o, "size", 44);
  // ширина: не уже самой длинной строки и подписи источника
  const w = Math.min(1500, Math.max(n(o, "w", 900), Math.max(...lines.map((l) => l.length)) * size * 0.53 + 90, s(o, "ref").length * 14 + 70));
  const h = lines.length * size * 1.3 + 110;
  return (
    <g opacity={k} transform={`translate(${x} ${y + (1 - k) * 24})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill="rgba(10,14,36,0.82)" stroke="rgba(255,210,63,0.55)" strokeWidth={3} />
      <rect x={-w / 2 + 14} y={-h / 2 + 18} width={6} height={h - 36} rx={3} fill={DOT.gold} opacity={0.8} />
      {lines.map((l, i) => (
        <text key={i} x={0} y={-h / 2 + 70 + i * size * 1.3} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={size} fill={C.text}>
          {l}
        </text>
      ))}
      <text x={0} y={h / 2 - 28} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={C.soft}>
        {s(o, "ref")}
      </text>
    </g>
  );
};

// пометка о статусе мысли: «миф в диалоге», «модель Платона», «спорно»
const Badge: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const text = s(o, "text");
  const color = s(o, "color", DOT.violet);
  const size = 28;
  const w = text.length * size * 0.56 + 70;
  const x = n(o, "x", 1880 - w);
  const y = n(o, "y", 66);
  return (
    <g opacity={k} transform={`translate(${x + (1 - k) * 30} ${y})`}>
      <rect x={0} y={-30} width={w} height={48} rx={24} fill={color} opacity={0.22} />
      <rect x={0} y={-30} width={w} height={48} rx={24} fill="none" stroke={color} strokeWidth={2.5} />
      <text x={w / 2} y={3} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.text}>
        {text}
      </text>
    </g>
  );
};

// список пунктов: появляются по одному
const List: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const items = (o.items as string[]) ?? [];
  const colors = (o.colors as string[]) ?? [DOT.gold, DOT.coral, DOT.sky, DOT.mint, DOT.violet];
  const x = n(o, "x", 1100);
  const y = n(o, "y", 260);
  const size = n(o, "size", 44);
  const step = n(o, "step", 0.5);
  const times = (o.times as number[] | undefined) ?? items.map((_, i) => o.from + i * step);
  return (
    <g opacity={k}>
      {items.map((it, i) => {
        const p = interpolate(t, [times[i], times[i] + 0.45], [0, 1], { ...clamp, easing: ease });
        return (
          <g key={i} opacity={p} transform={`translate(${x + (1 - p) * 40} ${y + i * size * 1.75})`}>
            <circle cx={0} cy={-size * 0.32} r={size * 0.3} fill={colors[i % colors.length]} />
            <text x={size * 0.75} y={0} fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.text}>
              {it}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const Arrow: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const draw = interpolate(t, [o.from, o.from + 0.6], [0, 1], { ...clamp, easing: ease });
  const [x1, y1, x2, y2] = [n(o, "x1", 0), n(o, "y1", 0), n(o, "x2", 0), n(o, "y2", 0)];
  const color = s(o, "color", DOT.gold);
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = 26;
  return (
    <g opacity={k}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={9} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
      {draw > 0.95 && (
        <path d={`M ${x2} ${y2} L ${x2 - hs * Math.cos(ang - 0.5)} ${y2 - hs * Math.sin(ang - 0.5)} M ${x2} ${y2} L ${x2 - hs * Math.cos(ang + 0.5)} ${y2 - hs * Math.sin(ang + 0.5)}`} stroke={color} strokeWidth={9} strokeLinecap="round" />
      )}
    </g>
  );
};

// карточка начала части: «Книга IV» + тема
const Chapter: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const sp = spring({ frame: Math.round((t - o.from) * FPS), fps: FPS, config: { damping: 15 } });
  const x = n(o, "x", 960);
  const y = n(o, "y", 170);
  return (
    <g opacity={k} transform={`translate(${x} ${y})`}>
      <text x={0} y={-36} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={DOT.gold} letterSpacing={6} opacity={sp}>
        {s(o, "num").toUpperCase()}
      </text>
      <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={C.text} transform={`scale(${0.9 + 0.1 * sp})`}>
        {s(o, "text")}
      </text>
    </g>
  );
};

// две колонки «против»: тезис слева, тезис справа
const Versus: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const y = n(o, "y", 200);
  const pR = interpolate(t, [o.from + 0.6, o.from + 1.1], [0, 1], { ...clamp, easing: ease });
  return (
    <g opacity={k}>
      <text x={n(o, "lx", 560)} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={n(o, "size", 52)} fill={s(o, "lc", DOT.sky)}>
        {s(o, "left")}
      </text>
      <text x={960} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.soft} opacity={pR}>
        {s(o, "mid", "или")}
      </text>
      <text x={n(o, "rx", 1360)} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={n(o, "size", 52)} fill={s(o, "rc", DOT.coral)} opacity={pR}>
        {s(o, "right")}
      </text>
    </g>
  );
};

// зачёркнутое слово (опровергнутое определение)
const Struck: React.FC<{ o: OverlayAbs; t: number }> = ({ o, t }) => {
  const k = life(o, t);
  const strikeAt = n(o, "strike", o.from + 1.2);
  const d = interpolate(t, [strikeAt, strikeAt + 0.4], [0, 1], { ...clamp, easing: ease });
  const text = s(o, "text");
  const size = n(o, "size", 46);
  const x = n(o, "x", 960);
  const y = n(o, "y", 200);
  const w = text.length * size * 0.56;
  return (
    <g opacity={k}>
      <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={size} fill={C.text} opacity={1 - 0.45 * d}>
        {text}
      </text>
      <line x1={x - w / 2} y1={y - size * 0.3} x2={x - w / 2 + w * d} y2={y - size * 0.3} stroke={DOT.red} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

const KINDS: Record<string, React.FC<{ o: OverlayAbs; t: number }>> = {
  chip: Chip,
  title: Title,
  quote: Quote,
  badge: Badge,
  list: List,
  arrow: Arrow,
  chapter: Chapter,
  versus: Versus,
  struck: Struck,
};

export const Overlays: React.FC<{ list: OverlayAbs[]; t: number }> = ({ list, t }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {list
      .filter((o) => t >= o.from - 0.05 && t <= o.to + 0.05)
      .map((o, i) => {
        const K = KINDS[o.kind];
        if (!K) throw new Error(`Нет надписи ${o.kind}`);
        return <K key={`${o.kind}-${o.from}-${i}`} o={o} t={t} />;
      })}
  </svg>
);
