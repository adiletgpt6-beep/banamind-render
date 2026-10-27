// Светлый стол с раскройным ковриком (вид сверху): тонкая сетка 40 px,
// жирные линии каждые 200 px, деления по краю — «измерительный» мир
// бумажной ленты. Несколько спокойных предметов по краям (карандаш,
// скрепки), никакой еды и напитков. Рисуется в координатах мира.
import type React from "react";
import { C } from "../palette";
import { box } from "./World";

const W0 = -1400;
const H0 = -1600;
const W = 3880;
const H = 5120;

export const Desk: React.FC<{ readonly props?: boolean }> = ({ props = true }) => (
  <div style={box({ left: W0, top: H0, width: W, height: H })}>
    <div style={box({ left: 0, top: 0, width: W, height: H, backgroundColor: C.desk })} />
    <div
      style={box({
        left: 0,
        top: 0,
        width: W,
        height: H,
        backgroundImage: `repeating-linear-gradient(0deg, ${C.deskGridBold} 0 2px, transparent 2px 200px), repeating-linear-gradient(90deg, ${C.deskGridBold} 0 2px, transparent 2px 200px), repeating-linear-gradient(0deg, ${C.deskGrid} 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, ${C.deskGrid} 0 1px, transparent 1px 40px)`,
        backgroundPosition: `${-W0}px ${-H0}px`,
      })}
    />
    {props ? (
      <div style={box({ left: -W0, top: -H0, width: 1080, height: 1920 })}>
        <Pencil x={880} y={1690} rot={-22} />
        <Clip x={90} y={215} rot={18} />
        <Clip x={138} y={252} rot={-8} />
      </div>
    ) : null}
  </div>
);

// Жёлтый карандаш (вид сверху), длина ≈ 300 px.
export const Pencil: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number }> = ({ x, y, rot = 0 }) => (
  <svg
    width={340}
    height={60}
    viewBox="-170 -30 340 60"
    style={box({ left: x - 170, top: y - 30, transform: `rotate(${rot}deg)`, overflow: "visible" })}
  >
    <rect x={-150} y={-9} width={300} height={22} rx={4} fill="rgba(40,48,70,0.14)" transform="translate(6 8)" />
    <rect x={-120} y={-11} width={250} height={22} fill={C.yellow} />
    <rect x={-120} y={-11} width={250} height={7} fill="#FFDA4D" />
    <rect x={-120} y={4} width={250} height={7} fill={C.yellowDeep} />
    <rect x={-150} y={-11} width={30} height={22} rx={4} fill="#F2A5A5" />
    <rect x={-124} y={-11} width={14} height={22} fill="#C9CCD3" />
    <path d="M 130 -11 L 168 0 L 130 11 Z" fill="#F1D3A8" />
    <path d="M 156 -3.5 L 168 0 L 156 3.5 Z" fill="#3A3F4D" />
  </svg>
);

// Скрепка.
export const Clip: React.FC<{ readonly x: number; readonly y: number; readonly rot?: number }> = ({ x, y, rot = 0 }) => (
  <svg width={70} height={24} viewBox="-35 -12 70 24" style={box({ left: x - 35, top: y - 12, transform: `rotate(${rot}deg)` })}>
    <path
      d="M -26 4 L 22 4 A 7 7 0 0 0 22 -10 L -24 -10 A 5 5 0 0 0 -24 0 L 16 0"
      fill="none"
      stroke="#9AA3B2"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </svg>
);
