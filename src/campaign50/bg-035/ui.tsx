// Общие элементы ролика BG-035: появление элементов, надписи-плашки,
// кинетические подписи, метка «Шарттуу мисал», логотип, белая легковая
// машина (вид сбоку), иконки дома и школы, стрелки маршрута.
import type React from "react";
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { easeOut } from "../../two-schedules-2d/rig/motion";
import { box } from "../../two-schedules-2d/shots";
import { C } from "./palette";
import { BG35_TEXT, BG35_VIDEO } from "./script";

export { box };

// Появление элемента: прозрачность и подъём снизу.
export const rise = (
  f: number,
  at: number,
  d = 12,
  dist = 26,
): React.CSSProperties => {
  const a = easeOut((f - at) / d);
  return { opacity: a, translate: `0 ${(1 - a) * dist}px` };
};

// Пружинистое появление (масштаб 0 → 1 с лёгким перелётом), 0…1.
export const pop = (f: number, at: number, d = 12) => {
  const x = Math.max(0, Math.min(1, (f - at) / d));
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
};

// Метка «Шарттуу мисал: топ түзүлгөндөн кийин» — сюжетные кадры поездки
// показаны как условный будущий пример, а не как уже доступная услуга.
// Видна всё время условной сцены (правило сценария 35-BG-035.md).
export const ExampleTag: React.FC<{
  readonly f: number;
  readonly at?: number;
  readonly top?: number;
}> = ({ f, at = 2, top = 262 }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 150,
      top,
      display: "flex",
      justifyContent: "center",
      fontFamily,
      ...rise(f, at, 8),
    }}
  >
    <div
      style={{
        padding: "11px 26px",
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.95)",
        border: `3px solid ${C.yellow}`,
        color: C.navy,
        fontSize: 38,
        whiteSpace: "nowrap",
        fontWeight: 800,
        boxShadow: "0 8px 20px rgba(20,40,90,0.12)",
      }}
    >
      {BG35_TEXT.full.example}
    </div>
  </div>
);

// Кинетическая подпись: короткая крупная фраза, цифры выделены жёлтым
// (или мятным для бонуса). Появляется подъёмом, уходит прозрачностью.
export const Caption: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly out?: number;
  readonly text: string;
  readonly top: number;
  readonly size?: number;
  readonly color?: string;
  readonly accent?: string;
  readonly plate?: boolean;
  readonly align?: "center" | "left";
}> = ({
  f,
  at,
  out,
  text,
  top,
  size = 56,
  color = C.navy,
  accent = C.yellowDeep,
  plate = false,
  align = "center",
}) => {
  const a = easeOut((f - at) / 10) * (out === undefined ? 1 : 1 - easeOut((f - out) / 8));
  if (a <= 0) return null;
  const parts = text.split(/(\+?\d+)/);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 150,
        top,
        display: "flex",
        justifyContent: align === "center" ? "center" : "flex-start",
        opacity: a,
        translate: `0 ${(1 - easeOut((f - at) / 10)) * 24}px`,
        fontFamily,
      }}
    >
      <div
        style={{
          padding: plate ? "12px 28px" : 0,
          borderRadius: 26,
          backgroundColor: plate ? "rgba(255,255,255,0.94)" : undefined,
          boxShadow: plate ? "0 10px 26px rgba(20,40,90,0.14)" : undefined,
          color,
          fontSize: size,
          fontWeight: 900,
          lineHeight: 1.15,
          textAlign: align,
          letterSpacing: -0.5,
        }}
      >
        {parts.map((p, i) =>
          /^\+?\d+$/.test(p) ? (
            <span key={i} style={{ color: accent }}>
              {p}
            </span>
          ) : (
            <Txt key={i}>{p}</Txt>
          ),
        )}
      </div>
    </div>
  );
};

// Логотип BalaGo (общий файл public/assets/logo.png, только чтение).
// Логотип круглый, а у файла белые углы — поэтому он обрезается по кругу,
// тень рисуется у круга (без белой квадратной подложки).
export const Logo: React.FC<{
  readonly x: number; // центр
  readonly y: number;
  readonly size: number;
  readonly opacity?: number;
  readonly scale?: number;
}> = ({ x, y, size, opacity = 1, scale = 1 }) => (
  <div
    style={box({
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      opacity,
      transform: `scale(${scale})`,
      borderRadius: "50%",
      overflow: "hidden",
      boxShadow: "0 10px 26px rgba(20,40,90,0.2)",
    })}
  >
    <Img
      src={staticFile(BG35_VIDEO.logo)}
      style={{ width: "102%", height: "102%", margin: "-1%", display: "block" }}
    />
  </div>
);

// Белая легковая машина (вид сбоку, нос вправо). Серый контур, чтобы
// кузов читался на светлом фоне. door — задняя дверь открыта (0…1);
// kid — в заднем окне видна голова ребёнка; wheel — угол колёс.
export const WhiteCar: React.FC<{
  readonly x: number;
  readonly y: number; // низ колёс
  readonly s?: number;
  readonly door?: number;
  readonly kid?: boolean;
  readonly wheel?: number;
  readonly children?: React.ReactNode; // кто садится (между салоном и дверью)
}> = ({ x, y, s = 1, door = 0, kid, wheel = 0, children }) => {
  const body =
    "M -250 -46 Q -254 -96 -214 -104 L -150 -112 Q -112 -176 -30 -180 L 70 -178 Q 136 -172 176 -114 L 226 -104 Q 256 -96 254 -52 L 252 -24 L -248 -24 Z";
  // проём задней двери (в координатах машины)
  const D = { x0: -112, x1: 18, top: -168, bottom: -30 };
  return (
    <div style={box({ left: x, top: y, width: 1, height: 1 })}>
      <svg
        width={560 * s}
        height={210 * s}
        viewBox="-280 -200 560 210"
        style={box({ left: -280 * s, top: -200 * s, overflow: "visible" })}
      >
        <ellipse cx={0} cy={2} rx={250} ry={14} fill="rgba(20,25,40,0.2)" />
        <path
          d={body}
          fill={C.car}
          stroke="#AEB6C2"
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {/* окна: заднее и переднее */}
        <path
          d="M -128 -114 Q -96 -162 -34 -166 L 6 -166 L 6 -114 Z"
          fill="#A9C8E2"
        />
        <path
          d="M 22 -114 L 22 -166 L 66 -164 Q 118 -158 152 -114 Z"
          fill="#A9C8E2"
        />
        {/* водитель — силуэт за передним стеклом */}
        <circle cx={78} cy={-134} r={19} fill="#3A2E2A" />
        <path d="M 54 -114 Q 78 -128 104 -114 Z" fill="#4C5361" />
        {kid ? (
          <g>
            <circle cx={-46} cy={-130} r={17} fill="#E3B08A" />
            <path
              d="M -64 -134 Q -48 -156 -28 -134 Q -44 -146 -64 -134 Z"
              fill="#3B2B24"
            />
            {/* ремень безопасности по диагонали */}
            <path
              d="M -62 -114 L -34 -138"
              stroke="#2A2E36"
              strokeWidth={6}
              strokeLinecap="round"
            />
          </g>
        ) : null}
        {/* проём задней двери (тёмный салон), виден при открытой двери */}
        {door > 0 ? (
          <rect
            x={D.x0}
            y={D.top + 52}
            width={D.x1 - D.x0}
            height={D.bottom - D.top - 52}
            rx={8}
            fill="#3B414D"
            opacity={Math.min(1, door * 2)}
          />
        ) : null}
        <path
          d="M -250 -58 L 254 -58"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={4}
        />
        <rect x={238} y={-86} width={14} height={18} rx={4} fill="#FFE7A8" />
        <rect x={-252} y={-86} width={10} height={18} rx={4} fill="#E25B4E" />
        {[-160, 160].map((wx) => (
          <g key={wx} transform={`translate(${wx} -24) rotate(${wheel})`}>
            <circle r={38} fill="#23262E" />
            <circle r={20} fill="#C9CED6" />
            <rect x={-3} y={-20} width={6} height={40} fill="#8C929C" />
            <rect x={-20} y={-3} width={40} height={6} fill="#8C929C" />
          </g>
        ))}
      </svg>
      {/* кто садится/выходит: перед салоном, за дверью */}
      {children}
      <svg
        width={560 * s}
        height={210 * s}
        viewBox="-280 -200 560 210"
        style={box({ left: -280 * s, top: -200 * s, overflow: "visible" })}
      >
        {/* задняя дверь: закрыта — линии стыка; открыта — створка отходит назад */}
        {door <= 0 ? (
          <g stroke="rgba(60,70,90,0.35)" strokeWidth={3} fill="none">
            <path d={`M ${D.x1} -114 L ${D.x1} -28`} />
            <path d={`M ${D.x0 - 6} -110 L ${D.x0} -28`} />
            <rect
              x={-30}
              y={-92}
              width={24}
              height={6}
              rx={3}
              fill="rgba(0,0,0,0.25)"
              stroke="none"
            />
          </g>
        ) : (
          <g
            transform={`translate(${D.x0} 0) scale(${1 - 0.72 * door} 1) translate(${-D.x0 - (D.x1 - D.x0) * door * 1.05} 0)`}
          >
            <path
              d={`M ${D.x0} -116 L ${D.x1} -116 L ${D.x1} -28 L ${D.x0} -28 Z`}
              fill="#F0F2F5"
              stroke="#AEB6C2"
              strokeWidth={5}
            />
            <path
              d={`M ${D.x0 + 8} -162 Q ${D.x0 + 30} -170 ${D.x1 - 8} -168 L ${D.x1 - 8} -118 L ${D.x0 + 8} -118 Z`}
              fill="#BFD6EA"
              stroke="#AEB6C2"
              strokeWidth={4}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

// Стрелки → и ↔ рисуются SVG (в шрифте Nunito их нет): текст маршрута
// «ҮЙ → МЕКТЕП → ҮЙ» выглядит одним шрифтом без подстановок.
const ArrowGlyph: React.FC<{ readonly both?: boolean }> = ({ both }) => (
  <svg
    viewBox="0 0 40 20"
    style={{
      width: "1.05em",
      height: "0.6em",
      margin: "0 0.22em",
      verticalAlign: "0.06em",
      overflow: "visible",
    }}
  >
    <path
      d={
        both
          ? "M 6 10 L 34 10 M 26 3 L 34 10 L 26 17 M 14 3 L 6 10 L 14 17"
          : "M 3 10 L 34 10 M 25 2 L 35 10 L 25 18"
      }
      fill="none"
      stroke="currentColor"
      strokeWidth={4.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Txt: React.FC<{ readonly children: string }> = ({ children }) => {
  const parts = children.split(/\s*(→|↔)\s*/);
  return (
    <>
      {parts.map((p, i) =>
        p === "→" ? (
          <ArrowGlyph key={i} />
        ) : p === "↔" ? (
          <ArrowGlyph key={i} both />
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

// Галочка (SVG).
export const Check: React.FC<{
  readonly size: number;
  readonly color?: string;
}> = ({ size, color = "#FFFFFF" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <path
      d="M 4 10.5 L 8.5 15 L 16 5.5"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Иконки: дом и школа (SVG, без эмодзи).
export const HomeIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M 6 19 L 20 7 L 34 19"
      fill="none"
      stroke={C.navy}
      strokeWidth={3.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 10 17 L 10 33 L 30 33 L 30 17"
      fill={C.yellowSoft}
      stroke={C.navy}
      strokeWidth={3.2}
      strokeLinejoin="round"
    />
    <rect x={17} y={23} width={7} height={10} rx={1.5} fill={C.navy} />
  </svg>
);
export const SchoolIcon: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path
      d="M 5 16 L 20 8 L 35 16"
      fill="none"
      stroke={C.navy}
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x={8}
      y={16}
      width={24}
      height={17}
      fill="#FFFFFF"
      stroke={C.navy}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    <rect x={12} y={20} width={4} height={4} fill={C.navy} />
    <rect x={24} y={20} width={4} height={4} fill={C.navy} />
    <rect
      x={17.5}
      y={25}
      width={5}
      height={8}
      fill={C.yellow}
      stroke={C.navy}
      strokeWidth={1.6}
    />
    <circle
      cx={20}
      cy={13}
      r={2.4}
      fill={C.yellow}
      stroke={C.navy}
      strokeWidth={1.4}
    />
  </svg>
);

// План [from, to): плавно проявляется поверх предыдущего за fade кадров и
// остаётся ещё fade кадров после to (пока следующий план проявляется).
export const Cut: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly fade?: number;
  readonly children: React.ReactNode;
}> = ({ f, from, to, fade = 8, children }) => {
  if (f < from || f >= to + fade) return null;
  const a = from === 0 ? 1 : Math.min(1, (f - from) / fade);
  return (
    <div
      style={{ position: "absolute", inset: 0, opacity: a, overflow: "hidden" }}
    >
      {children}
    </div>
  );
};
