// Общие композиции «Лаборатории гипотез»: центр сцены в стороне от ведущего, заголовок-плакат,
// ряд карточек, цепочка шагов со стрелками, карточка-цитата, простые значки. Всё зависит только
// от времени сцены, появление — по репликам (beat).
import React from "react";
import { C, DISPLAY, HEAVY } from "../theme";
import { Card, OL, Pill } from "./draw";
import { Arrow, Txt, at, clamp01, pop, ramp, wob, type VisualCtx } from "./kit";

export type P = { host?: string; [k: string]: unknown };

// центр сцены — в стороне от ведущего
export const cxOf = (p: { host?: unknown }) => (p.host === "right" ? 800 : p.host === "left" ? 1120 : p.host === "corner" ? 1040 : 960);

// заголовок-плакат вверху сцены: въезжает сверху, подчёркивание рисуется
export const Header: React.FC<{ x: number; y?: number; text: string; t: number; at?: number; color?: string; size?: number; under?: string }> = ({ x, y = 170, text, t, at: a = 0.1, color = OL, size = 64, under = C.cyan }) => {
  const k = ramp(t, a, 0.6);
  if (k <= 0) return null;
  const w = Math.min(1250, text.length * size * 0.6);
  return (
    <g opacity={k} transform={`translate(0 ${(1 - k) * -30})`}>
      <text x={x} y={y} textAnchor="middle" fontFamily={DISPLAY} fontSize={size} fill={color}>
        {text}
      </text>
      <rect x={x - (w / 2) * ramp(t, a + 0.3, 0.6)} y={y + 18} width={w * ramp(t, a + 0.3, 0.6)} height={8} rx={4} fill={under} />
    </g>
  );
};

// значки (простые формы, обводка OL)
export type IconName =
  | "star" | "heart" | "people" | "person" | "phone" | "chart" | "check" | "cross" | "gear" | "flask" | "door" | "eye" | "money" | "truck"
  | "shoe" | "mail" | "clock" | "warn" | "bulb" | "question" | "lock" | "book" | "rocket" | "car" | "box" | "bread" | "cart" | "film" | "chat" | "law" | "shield" | "megaphone" | "loop" | "flag";

export const Icon: React.FC<{ name: IconName; x: number; y: number; s?: number; color?: string }> = ({ name, x, y, s = 1, color = C.cyan }) => {
  const sw = 5;
  const g = (children: React.ReactNode) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OL} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
      {children}
    </g>
  );
  switch (name) {
    case "star":
      return g(<path d="M 0 -40 L 12 -12 L 40 -10 L 18 8 L 26 38 L 0 22 L -26 38 L -18 8 L -40 -10 L -12 -12 Z" fill={color} />);
    case "heart":
      return g(<path d="M 0 34 C -40 6 -44 -24 -22 -34 C -10 -40 0 -30 0 -22 C 0 -30 10 -40 22 -34 C 44 -24 40 6 0 34 Z" fill={color} />);
    case "person":
      return g(
        <>
          <circle cy={-20} r={16} fill={color} />
          <path d="M -26 34 Q -26 2 0 2 Q 26 2 26 34 Z" fill={color} />
        </>,
      );
    case "people":
      return g(
        <>
          <circle cx={-18} cy={-18} r={13} fill={C.goldLight} />
          <path d="M -40 30 Q -40 0 -18 0 Q 4 0 4 30 Z" fill={C.goldLight} />
          <circle cx={16} cy={-14} r={15} fill={color} />
          <path d="M -10 36 Q -10 4 16 4 Q 42 4 42 36 Z" fill={color} />
        </>,
      );
    case "phone":
      return g(
        <>
          <rect x={-22} y={-40} width={44} height={80} rx={9} fill={color} />
          <rect x={-14} y={-28} width={28} height={50} rx={3} fill="#fff" strokeWidth={3} />
        </>,
      );
    case "chart":
      return g(
        <>
          <rect x={-40} y={-36} width={80} height={72} rx={8} fill="#fff" />
          <polyline points="-28,20 -10,2 6,10 28,-20" fill="none" stroke={color} strokeWidth={8} />
        </>,
      );
    case "check":
      return g(
        <>
          <circle r={36} fill={C.tealLight} />
          <path d="M -16 0 L -4 14 L 18 -14" fill="none" stroke={C.tealDeep} strokeWidth={9} />
        </>,
      );
    case "cross":
      return g(
        <>
          <circle r={36} fill={C.coralLight} />
          <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={C.coralDeep} strokeWidth={9} />
        </>,
      );
    case "gear":
      return g(
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={-7} y={-40} width={14} height={18} rx={3} fill={color} transform={`rotate(${i * 45})`} />
          ))}
          <circle r={28} fill={color} />
          <circle r={10} fill="#fff" />
        </>,
      );
    case "flask":
      return g(
        <>
          <path d="M -10 -38 L 10 -38 L 10 -12 L 32 26 Q 35 34 27 34 L -27 34 Q -35 34 -32 26 L -10 -12 Z" fill={C.cyanLight} />
          <path d="M -24 14 L 24 14 L 30 26 Q 31 31 26 31 L -26 31 Q -31 31 -30 26 Z" fill={color} strokeWidth={0} />
        </>,
      );
    case "door":
      return g(
        <>
          <rect x={-28} y={-42} width={56} height={84} rx={6} fill={color} />
          <circle cx={14} cy={2} r={5} fill={OL} />
        </>,
      );
    case "eye":
      return g(
        <>
          <path d="M -42 0 Q 0 -36 42 0 Q 0 36 -42 0 Z" fill="#fff" />
          <circle r={14} fill={color} />
          <circle r={5} fill={OL} />
        </>,
      );
    case "money":
      return g(
        <>
          <rect x={-42} y={-24} width={84} height={48} rx={8} fill={C.mintLight} />
          <circle r={14} fill={C.mint} />
        </>,
      );
    case "truck":
      return g(
        <>
          <rect x={-44} y={-24} width={56} height={40} rx={5} fill={color} />
          <path d="M 12 -12 L 32 -12 L 44 4 L 44 16 L 12 16 Z" fill="#fff" />
          <circle cx={-26} cy={20} r={10} fill={OL} />
          <circle cx={28} cy={20} r={10} fill={OL} />
        </>,
      );
    case "shoe":
      return g(<path d="M -40 10 L -36 -20 L -14 -20 Q -6 -2 18 0 Q 40 2 42 14 L 42 22 L -40 22 Z" fill={color} />);
    case "mail":
      return g(
        <>
          <rect x={-40} y={-26} width={80} height={52} rx={6} fill="#fff" />
          <path d="M -40 -26 L 0 6 L 40 -26" fill="none" />
        </>,
      );
    case "clock":
      return g(
        <>
          <circle r={36} fill="#fff" />
          <path d="M 0 -22 L 0 0 L 16 10" fill="none" stroke={color} strokeWidth={7} />
        </>,
      );
    case "warn":
      return g(
        <>
          <path d="M 0 -40 L 40 34 L -40 34 Z" fill={C.yellow} />
          <path d="M 0 -14 L 0 10" strokeWidth={8} />
          <circle cy={22} r={4} fill={OL} />
        </>,
      );
    case "bulb":
      return g(
        <>
          <path d="M -24 -6 A 26 26 0 1 1 24 -6 Q 20 8 12 16 L 12 26 L -12 26 L -12 16 Q -20 8 -24 -6 Z" fill={color} />
          <rect x={-10} y={30} width={20} height={8} rx={3} fill={OL} />
        </>,
      );
    case "question":
      return g(
        <>
          <circle r={36} fill={color} />
          <text y={20} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={58} fill={OL} stroke="none">
            ?
          </text>
        </>,
      );
    case "lock":
      return g(
        <>
          <path d="M -16 -6 L -16 -22 A 16 16 0 0 1 16 -22 L 16 -6" fill="none" />
          <rect x={-28} y={-8} width={56} height={44} rx={8} fill={color} />
        </>,
      );
    case "book":
      return g(
        <>
          <path d="M 0 -26 Q -20 -38 -42 -30 L -42 30 Q -20 22 0 34 Q 20 22 42 30 L 42 -30 Q 20 -38 0 -26 Z" fill="#fff" />
          <path d="M 0 -26 L 0 34" />
        </>,
      );
    case "rocket":
      return g(
        <>
          <path d="M 0 -46 Q 22 -20 18 22 L -18 22 Q -22 -20 0 -46 Z" fill="#fff" />
          <circle cy={-10} r={8} fill={color} />
          <path d="M -18 6 L -32 30 L -16 24 Z M 18 6 L 32 30 L 16 24 Z" fill={C.coral} />
        </>,
      );
    case "car":
      return g(
        <>
          <path d="M -46 14 L -40 -8 Q -34 -18 -20 -18 L 16 -18 Q 28 -18 34 -6 L 46 2 L 46 14 Z" fill={color} />
          <circle cx={-24} cy={18} r={10} fill={OL} />
          <circle cx={26} cy={18} r={10} fill={OL} />
        </>,
      );
    case "box":
      return g(
        <>
          <rect x={-34} y={-30} width={68} height={60} rx={6} fill={C.kraft} />
          <path d="M -34 -12 L 34 -12" />
        </>,
      );
    case "bread":
      return g(
        <>
          <path d="M -44 10 Q -46 -24 0 -26 Q 46 -24 44 10 L 44 22 L -44 22 Z" fill="#e7a95b" />
          <path d="M -20 -14 L -12 4 M 0 -16 L 6 4 M 20 -14 L 24 4" />
        </>,
      );
    case "cart":
      return g(
        <>
          <path d="M -44 -26 L -32 -26 L -22 16 L 30 16 L 40 -14 L -28 -14" fill={color} />
          <circle cx={-16} cy={28} r={7} fill={OL} />
          <circle cx={24} cy={28} r={7} fill={OL} />
        </>,
      );
    case "film":
      return g(
        <>
          <rect x={-42} y={-30} width={84} height={60} rx={8} fill={color} />
          <path d="M -10 -14 L 14 0 L -10 14 Z" fill="#fff" />
        </>,
      );
    case "chat":
      return g(<path d="M -40 -26 Q -40 -34 -32 -34 L 32 -34 Q 40 -34 40 -26 L 40 8 Q 40 16 32 16 L -6 16 L -24 32 L -20 16 L -32 16 Q -40 16 -40 8 Z" fill={color} />);
    case "law":
      return g(
        <>
          <path d="M 0 -38 L 0 30 M -28 30 L 28 30 M -36 -22 L 36 -22" />
          <path d="M -36 -22 L -46 6 L -26 6 Z M 36 -22 L 26 6 L 46 6 Z" fill={color} />
        </>,
      );
    case "shield":
      return g(<path d="M 0 -40 L 34 -26 Q 34 18 0 40 Q -34 18 -34 -26 Z" fill={color} />);
    case "megaphone":
      return g(
        <>
          <path d="M -36 -10 L 20 -32 L 20 32 L -36 10 Z" fill={color} />
          <rect x={-44} y={-12} width={12} height={24} rx={4} fill="#fff" />
        </>,
      );
    case "loop":
      return g(
        <>
          <path d="M -30 -10 A 30 30 0 1 1 -10 28" fill="none" stroke={color} strokeWidth={10} />
          <path d="M -44 -18 L -30 -6 L -18 -22" fill="none" stroke={color} strokeWidth={8} />
        </>,
      );
    case "flag":
      return g(
        <>
          <path d="M -24 40 L -24 -40" />
          <path d="M -24 -38 L 30 -26 L -24 -10 Z" fill={color} />
        </>,
      );
    default:
      return null;
  }
};

// карточка со значком и подписью; k — появление (0…1), mark — галочка/крестик поверх
export const IconCard: React.FC<{ x: number; y: number; w?: number; h?: number; icon: IconName; label: string; k: number; color?: string; fill?: string; size?: number; mark?: "check" | "cross"; markK?: number; dim?: boolean }> = ({
  x,
  y,
  w = 300,
  h = 280,
  icon,
  label,
  k,
  color = C.cyan,
  fill = "#fff",
  size = 34,
  mark,
  markK = 0,
  dim,
}) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 40}) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.4) * (dim ? 0.45 : 1)}>
      <Card x={0} y={0} w={w} h={h} fill={fill}>
        <Icon name={icon} x={0} y={-h * 0.16} s={1.25} color={color} />
        <Txt x={0} y={h * 0.32 - (label.split("\n").length - 1) * size * 0.55} size={size} w={w - 36}>
          {label}
        </Txt>
      </Card>
      {mark && markK > 0 && <Icon name={mark} x={w / 2 - 20} y={-h / 2 + 20} s={0.9 * clamp01(markK * 1.3)} />}
    </g>
  );
};

// цепочка шагов слева направо со стрелками; шаг i появляется в момент times[i]
export const Chain: React.FC<{ cx: number; y: number; items: { icon: IconName; label: string; color?: string }[]; times: number[]; t: number; gap?: number; w?: number; h?: number; size?: number; active?: number }> = ({
  cx,
  y,
  items,
  times,
  t,
  gap = 300,
  w = 240,
  h = 230,
  size = 30,
  active = -1,
}) => {
  const n = items.length;
  const x0 = cx - ((n - 1) * gap) / 2;
  return (
    <g>
      {items.map((it, i) => {
        const k = pop(t, times[i] ?? 0);
        const x = x0 + i * gap;
        return (
          <g key={i}>
            {i > 0 && <Arrow x1={x - gap + w / 2 + 8} y1={y} x2={x - w / 2 - 12} y2={y} k={ramp(t, times[i] - 0.25, 0.4)} color={C.inkSoft} w={8} />}
            {active === i && k > 0 && <rect x={x - w / 2 - 14} y={y - h / 2 - 14} width={w + 28} height={h + 28} rx={34} fill="none" stroke={C.yellow} strokeWidth={10} opacity={0.6 + 0.4 * Math.sin(t * 4)} />}
            <IconCard x={x} y={y} w={w} h={h} icon={it.icon} label={it.label} k={k} color={it.color ?? C.cyan} size={size} />
          </g>
        );
      })}
    </g>
  );
};

// карточка-цитата/тезис книги: кавычки, текст, подпись
export const QuoteCard: React.FC<{ x: number; y: number; w?: number; h?: number; text: string; by?: string; k: number; size?: number; fill?: string; accent?: string }> = ({ x, y, w = 1000, h = 300, text, by, k, size = 48, fill = "#fff", accent = C.cyan }) => {
  if (k <= 0) return null;
  const lines = text.split("\n").length;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * k})`} opacity={clamp01(k * 1.4)}>
      <Card x={0} y={0} w={w} h={h} fill={fill}>
        <rect x={-w / 2} y={-h / 2} width={18} height={h} rx={9} fill={accent} />
        <text x={-w / 2 + 50} y={-h / 2 + 96} fontFamily={HEAVY} fontWeight={900} fontSize={120} fill={accent} opacity={0.35}>
          «
        </text>
        <Txt x={20} y={size * 0.35 - (lines - 1) * size * 0.6 - (by ? 18 : 0)} size={size} w={w - 160}>
          {text}
        </Txt>
        {by && (
          <Txt x={w / 2 - 40} y={h / 2 - 34} size={28} color={C.inkSoft} anchor="end" weight={700}>
            {by}
          </Txt>
        )}
      </Card>
    </g>
  );
};

// ярлык «исторический пример из книги» / «учебный пример BanaMind»
export const Badge: React.FC<{ x: number; y: number; kind: "history" | "study" | "author"; t: number; at?: number }> = ({ x, y, kind, t, at: a = 0.2 }) => {
  const k = pop(t, a);
  if (k <= 0) return null;
  const text = kind === "history" ? "исторический пример из книги" : kind === "study" ? "учебный пример BanaMind" : "мнение автора";
  const fill = kind === "history" ? C.goldLight : kind === "study" ? C.violetLight : C.skyLight;
  const color = kind === "history" ? C.goldDeep : kind === "study" ? C.violetDeep : C.skyDeep;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) rotate(${-2 + wob(t, 3, 0.6)})`}>
      <Pill x={0} y={0} text={text} fill={fill} color={color} stroke={color} size={28} />
    </g>
  );
};

// время появления i-го элемента списка внутри реплики line: равномерно по её речи
export const spread = (c: VisualCtx, line: number, i: number, n: number, from = 0.05, to = 0.85) => at(c, line + from + ((to - from) * i) / Math.max(1, n - 1));
