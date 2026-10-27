// Ноутбук директора — одна и та же модель во всех планах, геометрия
// согласована:
//   • LaptopFront — вид СПЕРЕДИ (сидящий за ноутбуком — за ним, лицом к
//     зрителю): видна только наружная крышка (матовое серебро, без
//     логотипа и изображения экрана) и передний торец основания;
//   • LaptopUser — вид СО СТОРОНЫ ПОЛЬЗОВАТЕЛЯ (из-за его спины/плеча):
//     экран с содержимым (children — DOM, обычно календарь) и клавиатура
//     в перспективе (ближний край шире);
//   • LaptopScreen — старый план №30 (экран со штрихами) — совместимость.
// Шарнир — общая точка (x, y): середина линии сгиба, w — ширина корпуса.
// Закрытие (open 1 → 0): крышка поворачивается вокруг шарнира на
// клавиатуру (проекция крышки сжимается до тонкой пластины).
import type React from "react";
import { C } from "../theme";
import { box } from "../kit";
import { clamp } from "../rig/motion";

const SILVER = "#C3C8D0";
const SILVER_D = "#9CA3AE";
const LINE = "#6E7682"; // контур — тёмный оттенок серебра
const SCREEN_K = 0.64; // высота экрана / ширина

// x, y — середина шарнира (мир), w — ширина; open: 1 — открыт (≈ 105°), 0 — закрыт.
export const laptopLidTop = (x: number, y: number, w: number, open: number) => {
  const H = w * SCREEN_K;
  const a = clamp(open);
  // видимая высота крышки: вертикальная проекция + небольшой взгляд сверху
  const ph = H * Math.sin((a * 105 * Math.PI) / 180) * 0.92 + 4;
  return { x, y: y - ph };
};

export const LaptopFront: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly open: number }> = ({ x, y, w, open }) => {
  const top = laptopLidTop(x, y, w, open);
  const ph = y - top.y;
  const baseH = w * 0.045;
  const sw = Math.max(1.2, w * 0.011);
  const id = `lf${Math.round(x)}_${Math.round(y)}`;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D3D7DE" />
          <stop offset="1" stopColor={SILVER_D} />
        </linearGradient>
      </defs>
      {/* контактная тень на столе */}
      <ellipse cx={x} cy={y + baseH} rx={w * 0.56} ry={baseH * 0.9} fill="rgba(30,40,60,0.18)" />
      {/* основание: передний торец */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 - w * 0.03} ${y + baseH} L ${x - w / 2 + w * 0.03} ${y + baseH} Z`} fill={SILVER_D} stroke={LINE} strokeWidth={sw} strokeLinejoin="round" />
      {/* крышка: наружная сторона (матовая, без логотипа) */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 - w * 0.02 * (1 - open)} ${top.y} L ${x - w / 2 + w * 0.02 * (1 - open)} ${top.y} Z`} fill={`url(#${id})`} stroke={LINE} strokeWidth={sw} strokeLinejoin="round" />
      {ph > 20 ? <path d={`M ${x - w * 0.42} ${top.y + ph * 0.08} L ${x + w * 0.1} ${top.y + ph * 0.08}`} stroke="#FFFFFF" strokeWidth={sw * 1.4} opacity={0.45} strokeLinecap="round" /> : null}
      {/* шарнир */}
      <rect x={x - w * 0.36} y={y - w * 0.012} width={w * 0.72} height={w * 0.024} rx={w * 0.012} fill="#7D838D" />
    </svg>
  );
};

// Вид со стороны пользователя: экран (children — DOM-содержимое шириной
// contentW номинальных px, масштабируется под экран) над шарниром,
// клавиатура ниже — к зрителю (deck 0…1 — сколько клавиатуры видно).
// Экран слегка откинут: верхний край на 3 % уже.
export const laptopScreenRect = (x: number, y: number, w: number) => {
  const sh = w * SCREEN_K;
  const b = w * 0.035; // рамка
  return { x: x - w / 2 + b, y: y - sh + b, w: w - 2 * b, h: sh - 2 * b * 1.4 };
};
export const LaptopUser: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly contentW?: number; readonly glow?: number; readonly deck?: number; readonly children?: React.ReactNode }> = ({ x, y, w, contentW = 1000, glow = 0, deck = 1, children }) => {
  const sh = w * SCREEN_K;
  const sr = laptopScreenRect(x, y, w);
  const sw = Math.max(1.2, w * 0.008);
  const dh = w * 0.42 * clamp(deck);
  const k = sr.w / contentW;
  return (
    <div style={box({ left: 0, top: 0 })}>
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        {/* свечение экрана на столе */}
        {glow > 0 ? <ellipse cx={x} cy={y + dh * 0.4} rx={w * 0.7} ry={dh * 0.6 + 10} fill="#DCE8FF" opacity={0.35 * glow} /> : null}
        {/* клавиатура: ближний край шире */}
        <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 + w * 0.06} ${y + dh} L ${x - w / 2 - w * 0.06} ${y + dh} Z`} fill={SILVER} stroke={LINE} strokeWidth={sw} strokeLinejoin="round" />
        {dh > 20
          ? Array.from({ length: 4 }).map((_, r) => {
              const v0 = 0.1 + r * 0.17;
              const yy = y + dh * v0;
              const half = w / 2 + w * 0.06 * v0 - w * 0.07;
              return Array.from({ length: 12 }).map((__, c) => {
                const cw = (2 * half) / 12;
                return <rect key={`${r}-${c}`} x={x - half + c * cw + cw * 0.08} y={yy} width={cw * 0.84} height={dh * 0.13} rx={cw * 0.15} fill="#5B616C" />;
              });
            })
          : null}
        {dh > 20 ? <rect x={x - w * 0.17} y={y + dh * 0.8} width={w * 0.34} height={dh * 0.16} rx={w * 0.02} fill="#AEB4BE" /> : null}
        {/* крышка с экраном */}
        <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 - w * 0.015} ${y - sh} L ${x - w / 2 + w * 0.015} ${y - sh} Z`} fill="#24272E" stroke="#15171C" strokeWidth={sw} strokeLinejoin="round" />
        <rect x={sr.x} y={sr.y} width={sr.w} height={sr.h} rx={w * 0.01} fill="#EEF2F7" />
        <circle cx={x} cy={y - sh + w * 0.018} r={w * 0.006} fill="#3A3F4A" />
        <rect x={x - w * 0.36} y={y - w * 0.01} width={w * 0.72} height={w * 0.02} rx={w * 0.01} fill="#7D838D" />
      </svg>
      <div style={box({ left: sr.x, top: sr.y, width: sr.w, height: sr.h, overflow: "hidden", borderRadius: w * 0.01 })}>
        <div style={box({ left: 0, top: 0, width: contentW, height: sr.h / k, transform: `scale(${k})`, transformOrigin: "0 0" })}>{children}</div>
        <div style={box({ left: 0, top: 0, width: sr.w, height: sr.h, background: "linear-gradient(120deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%)" })} />
      </div>
    </div>
  );
};

// План со стороны папы (№30): экран с рабочими строками (без читаемого
// текста), клавиатура и тачпад. typed — сколько строк уже набрано (0…n),
// done — 0…1 галочка «готово».
export const LaptopScreen: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly typed: number; readonly done: number }> = ({ x, y, w, typed, done }) => {
  const sh = w * 0.6;
  const rows = [0.62, 0.48, 0.7, 0.4, 0.56];
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* крышка с экраном */}
      <rect x={x - w / 2} y={y - sh} width={w} height={sh} rx={18} fill="#2B2F38" />
      <rect x={x - w / 2 + 16} y={y - sh + 16} width={w - 32} height={sh - 32} rx={8} fill="#F7F4EC" />
      <rect x={x - w / 2 + 16} y={y - sh + 16} width={w - 32} height={44} fill={C.blue} />
      {rows.map((r, i) => {
        const k = clamp(typed - i);
        return k > 0 ? <rect key={i} x={x - w / 2 + 50} y={y - sh + 92 + i * 52} width={(w - 120) * r * k} height={22} rx={11} fill={i === rows.length - 1 ? C.orange : "#3A3F4A"} opacity={0.85} /> : null;
      })}
      {done > 0 ? (
        <g opacity={done}>
          <circle cx={x + w / 2 - 90} cy={y - 90} r={40} fill="#3FAE6A" />
          <path d={`M ${x + w / 2 - 110} ${y - 90} l 14 14 l 26 -28`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {/* основание: клавиатура и тачпад (вид сверху-спереди) */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 + 40} ${y + w * 0.42} L ${x - w / 2 - 40} ${y + w * 0.42} Z`} fill="#C3C8D0" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 12 }).map((__, c) => (
          <rect key={`${r}-${c}`} x={x - w / 2 + 24 + c * ((w - 48) / 12) - r * 6 + 2} y={y + 18 + r * 34} width={(w - 48) / 12 - 6} height={26} rx={5} fill="#5B616C" />
        )),
      )}
      <rect x={x - w * 0.16} y={y + 18 + 4 * 34 + 10} width={w * 0.32} height={w * 0.12} rx={10} fill="#AEB4BE" />
    </svg>
  );
};
