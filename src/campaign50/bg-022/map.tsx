// Карта Бишкека (условная схема): сетка улиц, парк, арык, горы Ала-Тоо
// на юге (сверху кадра). ҮЙ — в левом нижнем углу петли, МЕКТЕП — в
// правом верхнем. Одна непрерывная ярко-жёлтая линия: утром ҮЙ → МЕКТЕП
// (нижняя и правая стороны), после уроков МЕКТЕП → ҮЙ (верхняя и левая) —
// вместе замкнутая петля. Машина (вид сверху, белая) едет по линии и сама
// её «рисует». Конкретных адресов и расстояний на схеме нет.
import {
  evolvePath,
  getLength,
  getPointAtLength,
  getTangentAtLength,
} from "@remotion/paths";
import type React from "react";
import { fontFamily } from "../../fonts";
import { CarTopView } from "../../components/CarTopView";
import { C } from "./palette";
import { BG22_TEXT } from "./script";
import { Check, HomeIcon, SchoolIcon } from "./ui";

export const HOME = { x: 230, y: 1230 } as const;
export const SCHOOL = { x: 850, y: 640 } as const;
const R = 110;
// утро: ҮЙ → вправо → вверх → МЕКТЕП
export const PATH_AM = `M ${HOME.x} ${HOME.y} L ${SCHOOL.x - R} ${HOME.y} Q ${SCHOOL.x} ${HOME.y} ${SCHOOL.x} ${HOME.y - R} L ${SCHOOL.x} ${SCHOOL.y}`;
// после уроков: МЕКТЕП → влево → вниз → ҮЙ
export const PATH_PM = `M ${SCHOOL.x} ${SCHOOL.y} L ${HOME.x + R} ${SCHOOL.y} Q ${HOME.x} ${SCHOOL.y} ${HOME.x} ${SCHOOL.y + R} L ${HOME.x} ${HOME.y}`;
const LEN_AM = getLength(PATH_AM);
const LEN_PM = getLength(PATH_PM);

// Положение и поворот машины на линии (u — доля пути 0…1).
export const carOn = (which: "am" | "pm", u: number) => {
  const path = which === "am" ? PATH_AM : PATH_PM;
  const len = which === "am" ? LEN_AM : LEN_PM;
  const l = Math.max(0.01, Math.min(len - 0.01, u * len));
  const p = getPointAtLength(path, l) ?? { x: 0, y: 0 };
  const tg = getTangentAtLength(path, l) ?? { x: 1, y: 0 };
  return {
    x: p.x,
    y: p.y,
    angle: (Math.atan2(tg.y, tg.x) * 180) / Math.PI + 90,
  };
};

// Улицы: сетка (как в центре Бишкека), чуть разной ширины.
const STREETS_H = [420, 640, 860, 1040, 1230, 1420];
const STREETS_V = [90, 230, 430, 640, 850, 1000];

export const BishkekMap: React.FC<{
  readonly glow?: number;
  readonly dim?: number;
}> = ({ glow = 0, dim = 0 }) => (
  <svg
    width={1080}
    height={1920}
    style={{ position: "absolute", left: 0, top: 0 }}
  >
    <rect x={0} y={0} width={1080} height={1920} fill={C.map} />
    {/* горы Ала-Тоо на юге */}
    <path
      d="M 0 330 L 120 220 L 210 280 L 330 170 L 450 260 L 560 150 L 700 250 L 820 180 L 950 270 L 1080 200 L 1080 360 L 0 360 Z"
      fill="#C9D6E6"
    />
    <path
      d="M 290 205 L 330 170 L 372 205 Z M 520 185 L 560 150 L 602 185 Z M 780 210 L 820 180 L 858 210 Z"
      fill="#FFFFFF"
    />
    <rect x={0} y={350} width={1080} height={1570} fill={C.map} />
    {/* кварталы */}
    {STREETS_H.slice(0, -1).map((y, i) =>
      STREETS_V.slice(0, -1).map((x, j) => (
        <rect
          key={`${i}-${j}`}
          x={x + 22}
          y={y + 22}
          width={STREETS_V[j + 1] - x - 44}
          height={STREETS_H[i + 1] - y - 44}
          rx={14}
          fill={(i + j) % 4 === 1 ? C.park : "#ECE7DC"}
        />
      )),
    )}
    {/* улицы */}
    {STREETS_H.map((y) => (
      <rect
        key={`h${y}`}
        x={0}
        y={y - 16}
        width={1080}
        height={32}
        fill={C.road}
      />
    ))}
    {STREETS_V.map((x) => (
      <rect
        key={`v${x}`}
        x={x - 16}
        y={360}
        width={32}
        height={1560}
        fill={C.road}
      />
    ))}
    {/* арык вдоль одной улицы */}
    <path d="M 0 1046 L 1080 1046" stroke="#9CC3DA" strokeWidth={6} />
    {/* мелкие дома-кубики */}
    {[
      [140, 470],
      [520, 500],
      [700, 760],
      [320, 930],
      [540, 1120],
      [960, 960],
      [130, 1310],
      [720, 1310],
      [960, 520],
    ].map(([x, y], i) => (
      <g key={i}>
        <rect
          x={x - 26}
          y={y - 18}
          width={52}
          height={36}
          rx={6}
          fill="#DCD4C6"
        />
        <rect
          x={x - 26}
          y={y - 18}
          width={52}
          height={10}
          rx={4}
          fill="#CBC1B1"
        />
      </g>
    ))}
    <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={dim} />
    {glow > 0 ? (
      <rect
        x={0}
        y={0}
        width={1080}
        height={1920}
        fill={C.yellowSoft}
        opacity={0.35 * glow}
      />
    ) : null}
  </svg>
);

// Жёлтая линия: am/pm — доля нарисованного пути (0…1).
export const RouteLine: React.FC<{
  readonly am: number;
  readonly pm: number;
  readonly width?: number;
  readonly pulse?: number;
}> = ({ am, pm, width = 26, pulse = 0 }) => {
  const a = evolvePath(Math.max(0, Math.min(1, am)), PATH_AM);
  const p = evolvePath(Math.max(0, Math.min(1, pm)), PATH_PM);
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      {pulse > 0 ? (
        <g
          opacity={pulse * 0.5}
          fill="none"
          stroke={C.yellow}
          strokeWidth={width + 40 * pulse}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={PATH_AM} />
          <path d={PATH_PM} />
        </g>
      ) : null}
      {/* подложка под линией — читается на светлой карте */}
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={width + 12}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {am > 0 ? (
          <path
            d={PATH_AM}
            strokeDasharray={a.strokeDasharray}
            strokeDashoffset={a.strokeDashoffset}
          />
        ) : null}
        {pm > 0 ? (
          <path
            d={PATH_PM}
            strokeDasharray={p.strokeDasharray}
            strokeDashoffset={p.strokeDashoffset}
          />
        ) : null}
      </g>
      <g
        fill="none"
        stroke={C.yellow}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {am > 0 ? (
          <path
            d={PATH_AM}
            strokeDasharray={a.strokeDasharray}
            strokeDashoffset={a.strokeDashoffset}
          />
        ) : null}
        {pm > 0 ? (
          <path
            d={PATH_PM}
            strokeDasharray={p.strokeDasharray}
            strokeDashoffset={p.strokeDashoffset}
          />
        ) : null}
      </g>
    </svg>
  );
};

// Метка-пин: ҮЙ или МЕКТЕП. pop — появление (0…1), check — галочка прибытия.
export const Pin: React.FC<{
  readonly kind: "home" | "school";
  readonly pop: number;
  readonly check?: number;
  readonly label?: boolean;
}> = ({ kind, pop, check = 0, label = true }) => {
  const at = kind === "home" ? HOME : SCHOOL;
  const text = kind === "home" ? BG22_TEXT.home : BG22_TEXT.school;
  const s = 0.4 + 0.6 * pop;
  // подпись — снаружи петли
  const lx = kind === "home" ? at.x - 10 : at.x + 10;
  const ly = kind === "home" ? at.y + 74 : at.y - 76;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity: Math.min(1, pop * 1.5),
        fontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: at.x - 56,
          top: at.y - 56,
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: "#FFFFFF",
          border: `8px solid ${C.navy}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${s})`,
          boxShadow: "0 10px 24px rgba(20,40,90,0.25)",
        }}
      >
        {kind === "home" ? <HomeIcon size={70} /> : <SchoolIcon size={72} />}
      </div>
      {check > 0 ? (
        <div
          style={{
            position: "absolute",
            left: at.x + 26,
            top: at.y - 70,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${check})`,
            boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
          }}
        >
          <Check size={36} />
        </div>
      ) : null}
      {label ? (
        <div
          style={{
            position: "absolute",
            left: lx - 160,
            top: ly - 28,
            width: 320,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${s})`,
          }}
        >
          <div
            style={{
              padding: "6px 22px",
              borderRadius: 999,
              backgroundColor: C.navy,
              color: "#FFFFFF",
              fontSize: 36,
              fontWeight: 900,
            }}
          >
            {text}
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Белая машина на карте (вид сверху) — едет по жёлтой линии.
export const MapCar: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly size?: number;
}> = ({ x, y, angle, size = 110 }) => (
  <div
    style={{
      position: "absolute",
      left: x - size * 0.28,
      top: y - size / 2,
      width: size * 0.56,
      height: size,
      transform: `rotate(${angle}deg)`,
      transformOrigin: "50% 50%",
    }}
  >
    <CarTopView size={size} />
  </div>
);

// Метка «Бишкек» на карте.
export const CityTag: React.FC<{ readonly opacity: number }> = ({
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      right: 170,
      top: 1290,
      opacity,
      fontFamily,
      padding: "8px 22px",
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
      border: "3px solid #DCE3EE",
      color: C.navy,
      fontSize: 32,
      fontWeight: 900,
    }}
  >
    {BG22_TEXT.city}
  </div>
);
