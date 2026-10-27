// «Две линзы» — главная метафора фильма BM-019 (не предмет из романа).
// Линза = круглая оправа с двумя прозрачными слоями: верхний «Что я решил»
// (тонированный цвет линзы) и нижний «Что я знаю» (светлый). Слои могут
// разъезжаться (уверенность обгоняет факты) и совпадать (проверено).
// Карточки: решения — цветные, факты — белые с галочкой; неверное решение
// зачёркивается и уступает место исправленному.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Check, clamp01, ramp } from "./kit";
import { OL } from "./draw";

export type LensWho = "liz" | "darcy";
export const LENS_COLOR: Record<LensWho, { main: string; soft: string; name: string }> = {
  liz: { main: C.rose, soft: C.roseSoft, name: "Элизабет" },
  darcy: { main: C.teal, soft: C.tealSoft, name: "Дарси" },
};

// Карточка в линзе. kind: decided — цветная, known — белая с галочкой, fixed — исправленная (зелёная рамка).
export const LensCard: React.FC<{
  x: number; y: number; text: string; kind: "decided" | "known" | "fixed"; who: LensWho; k: number; cross?: number; flag?: number; w?: number; size?: number;
}> = ({ x, y, text, kind, who, k, cross = 0, flag = 0, w: w0, size = 36 }) => {
  if (k <= 0.001) return null;
  const col = LENS_COLOR[who];
  const w = w0 ?? Math.max(260, text.length * size * 0.56 + 90);
  const h = size * 1.9;
  const fill = kind === "decided" ? col.main : C.white;
  const tc = kind === "decided" ? C.white : C.ink;
  const stroke = kind === "fixed" ? C.green : OL;
  const s = 0.7 + 0.3 * k;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 24}) scale(${s})`} opacity={clamp01(k * 1.4) * (1 - cross * 0.45)}>
      <rect x={-w / 2 + 5} y={-h / 2 + 7} width={w} height={h} rx={18} fill="#000" opacity={0.14} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={fill} stroke={stroke} strokeWidth={kind === "fixed" ? 7 : 4} />
      {kind !== "decided" && <Check x={-w / 2 + 40} y={0} s={24} k={kind === "fixed" ? 1 : k} color={C.green} />}
      <text x={kind === "decided" ? 0 : 22} y={size * 0.36} fontFamily={FONT} fontWeight={900} fontSize={size} fill={tc} textAnchor="middle">
        {text}
      </text>
      {cross > 0 && (
        <line x1={-w / 2 + 14} y1={0} x2={-w / 2 + 14 + (w - 28) * clamp01(cross)} y2={0} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
      )}
      {flag > 0 && (
        <g transform={`translate(${w / 2 + 60} ${-4}) rotate(8) scale(${flag * 0.85})`}>
          <rect x={-110} y={-24} width={220} height={44} rx={10} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <text x={0} y={10} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink} textAnchor="middle">
            не проверено
          </text>
        </g>
      )}
    </g>
  );
};

// Оправа линзы с двумя слоями. sep — разъезд слоёв (0 — совпадают), k — появление.
export const LensFrame: React.FC<{
  x: number; y: number; r: number; who: LensWho; k: number; sep?: number; t: number; labels?: number; ok?: number; children?: React.ReactNode; name?: boolean;
}> = ({ x, y, r, who, k, sep = 0, t, labels = 1, ok = 0, children, name = true }) => {
  if (k <= 0.001) return null;
  const col = LENS_COLOR[who];
  const dx = sep * r * 0.16;
  const dy = sep * r * 0.1;
  const glint = (t * 0.25) % 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 1.5)}>
      {/* ручка */}
      <rect x={r * 0.62} y={r * 0.62} width={r * 0.22} height={r * 0.62} rx={r * 0.08} fill={C.goldDeep} stroke={OL} strokeWidth={5} transform={`rotate(-45 ${r * 0.73} ${r * 0.62})`} />
      <circle r={r + 6} fill="#000" opacity={0.12} cx={6} cy={10} />
      {/* слой «что я знаю» — светлый */}
      <circle cx={dx} cy={dy} r={r} fill={C.cream} opacity={0.92} />
      {/* слой «что я решил» — тонированный */}
      <circle cx={-dx} cy={-dy} r={r} fill={col.soft} opacity={0.55} stroke={col.main} strokeWidth={3} strokeDasharray="14 10" />
      <g>{children}</g>
      {/* блик */}
      <path d={`M ${-r * 0.7} ${-r * 0.35} A ${r * 0.8} ${r * 0.8} 0 0 1 ${-r * 0.2} ${-r * 0.78}`} stroke="#fff" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.35 + 0.25 * Math.sin(glint * Math.PI * 2)} />
      {/* оправа */}
      <circle r={r} fill="none" stroke={OL} strokeWidth={r * 0.11 + 8} />
      <circle r={r} fill="none" stroke={col.main} strokeWidth={r * 0.11} />
      <circle r={r - r * 0.055} fill="none" stroke={C.gold} strokeWidth={4} />
      {ok > 0 && <circle r={r + r * 0.09} fill="none" stroke={C.green} strokeWidth={10} opacity={ok} strokeDasharray={`${ok * 2 * Math.PI * r * 1.09} 9999`} transform="rotate(-90)" />}
      {name && (
        <g transform={`translate(0 ${-r - r * 0.2})`}>
          <rect x={-130} y={-30} width={260} height={56} rx={28} fill={col.main} stroke={OL} strokeWidth={4} />
          <text y={12} fontFamily={HEAVY} fontWeight={900} fontSize={32} fill={C.white} textAnchor="middle">
            {col.name}
          </text>
        </g>
      )}
      {labels > 0 && (
        <g opacity={labels}>
          <g transform={`translate(${-r * 0.98} ${-r * 0.55}) rotate(-28)`}>
            <rect x={-118} y={-24} width={236} height={46} rx={12} fill={col.main} stroke={OL} strokeWidth={3} />
            <text y={9} fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff" textAnchor="middle">
              Что я решил
            </text>
          </g>
          <g transform={`translate(${r * 0.98} ${r * 0.5}) rotate(-28)`}>
            <rect x={-118} y={-24} width={236} height={46} rx={12} fill={C.white} stroke={OL} strokeWidth={3} />
            <text y={9} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink} textAnchor="middle">
              Что я знаю
            </text>
          </g>
        </g>
      )}
    </g>
  );
};

// Содержимое линзы: решения сверху, факты снизу; разметка по числу карточек.
export const LensCards: React.FC<{
  who: LensWho; r: number; t: number;
  decided: string[]; known: string[]; fixed?: string[];
  dAt: number[]; kAt: number[]; fAt?: number[]; crossAt?: (number | undefined)[]; flagAt?: (number | undefined)[]; size?: number;
}> = ({ who, r, t, decided, known, fixed = [], dAt, kAt, fAt = [], crossAt = [], flagAt = [], size = 34 }) => {
  const rowsD = decided.length;
  const w = r * 1.45;
  return (
    <g>
      {decided.map((d, i) => {
        const y = -r * 0.42 + (i - (rowsD - 1) / 2) * size * 2.15;
        const cAt = crossAt[i];
        const cross = cAt === undefined ? 0 : ramp(t, cAt, 0.5);
        const fx = fixed[i];
        const fk = fx && fAt[i] !== undefined ? ramp(t, fAt[i]!, 0.6) : 0;
        return (
          <g key={`d${i}`}>
            <LensCard x={0} y={y - fk * 10} text={d} kind="decided" who={who} k={ramp(t, dAt[i] ?? 0, 0.55) * (1 - fk)} cross={cross} flag={flagAt[i] === undefined ? 0 : ramp(t, flagAt[i]!, 0.4)} w={w} size={size} />
            {fx && <LensCard x={0} y={y} text={fx} kind="fixed" who={who} k={fk} w={w} size={size} />}
          </g>
        );
      })}
      {known.map((d, i) => (
        <LensCard key={`k${i}`} x={0} y={r * 0.34 + (i - (known.length - 1) / 2) * size * 2.15} text={d} kind="known" who={who} k={ramp(t, kAt[i] ?? 0, 0.55)} w={w} size={size} />
      ))}
    </g>
  );
};
