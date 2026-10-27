// Простые декорации мини-историй (чистый вектор, приглушённые тона, чтобы герои
// и реплики читались первыми): офис, магазин, улица, дом, больница, парк, банкет,
// цех, почта, ферма, мастерская. Не реконструкция реальных мест из книги.
import React from "react";
import { C } from "../theme";
import { OL } from "./draw";

export type SettingName = "office" | "shop" | "street" | "home" | "hospital" | "park" | "banquet" | "factory" | "post" | "farm" | "workshop" | "airfield" | "plain";

const Floor: React.FC<{ cx: number; floor: number; w: number; color?: string }> = ({ cx, floor, w, color = "rgba(255,240,220,0.28)" }) => (
  <g>
    <rect x={cx - w / 2} y={floor - 6} width={w} height={150} rx={30} fill={color} />
    <line x1={cx - w / 2 + 30} y1={floor - 6} x2={cx + w / 2 - 30} y2={floor - 6} stroke="#fff" strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" />
  </g>
);

const Win: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 200, h = 160 }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill="#ffe9c4" stroke={OL} strokeOpacity={0.5} strokeWidth={4} />
    <line x1={x} y1={y - h / 2} x2={x} y2={y + h / 2} stroke={OL} strokeOpacity={0.4} strokeWidth={4} />
    <line x1={x - w / 2} y1={y} x2={x + w / 2} y2={y} stroke={OL} strokeOpacity={0.4} strokeWidth={4} />
  </g>
);

export const Setting: React.FC<{ name: SettingName; cx: number; floor: number; w: number; t?: number }> = ({ name, cx, floor, w }) => {
  const soft = { stroke: OL, strokeOpacity: 0.45, strokeWidth: 4 };
  switch (name) {
    case "office":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} />
          <Win x={cx} y={floor - 560} w={260} h={190} />
          <rect x={cx - 150} y={floor - 170} width={300} height={22} rx={8} fill={C.woodLight} {...soft} />
          <rect x={cx - 130} y={floor - 148} width={22} height={148} fill={C.woodDark} opacity={0.7} />
          <rect x={cx + 108} y={floor - 148} width={22} height={148} fill={C.woodDark} opacity={0.7} />
        </g>
      );
    case "shop":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} />
          <rect x={cx - 200} y={floor - 600} width={400} height={70} rx={16} fill="#ffcf8a" {...soft} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M ${cx - 200 + i * 80} ${floor - 530} q 40 50 80 0`} fill={i % 2 ? "#ff9f6e" : "#fff1d6"} {...soft} />
          ))}
          <rect x={cx - 170} y={floor - 210} width={340} height={210} rx={12} fill="#e8b98a" {...soft} />
          <rect x={cx - 190} y={floor - 230} width={380} height={30} rx={10} fill={C.woodLight} {...soft} />
        </g>
      );
    case "street":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} color="rgba(200,190,220,0.3)" />
          <rect x={cx - 12} y={floor - 560} width={24} height={560} fill="#4a4060" opacity={0.6} />
          <circle cx={cx} cy={floor - 570} r={34} fill="#ffe08a" {...soft} />
          <rect x={cx - w / 2 + 40} y={floor - 420} width={180} height={420} rx={10} fill="rgba(255,255,255,0.14)" />
          <rect x={cx + w / 2 - 220} y={floor - 480} width={180} height={480} rx={10} fill="rgba(255,255,255,0.12)" />
        </g>
      );
    case "home":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} />
          <Win x={cx - 40} y={floor - 560} w={220} h={180} />
          <rect x={cx + 120} y={floor - 380} width={18} height={380} fill={C.woodDark} opacity={0.6} />
          <path d={`M ${cx + 80} ${floor - 380} L ${cx + 178} ${floor - 380} L ${cx + 158} ${floor - 450} L ${cx + 100} ${floor - 450} Z`} fill="#ffd27a" {...soft} />
          <rect x={cx - 190} y={floor - 130} width={240} height={110} rx={30} fill="#c98a8a" {...soft} />
        </g>
      );
    case "hospital":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} color="rgba(220,240,255,0.3)" />
          <Win x={cx} y={floor - 580} w={240} h={170} />
          <rect x={cx - 170} y={floor - 170} width={340} height={70} rx={18} fill="#ffffff" {...soft} />
          <rect x={cx - 180} y={floor - 230} width={70} height={130} rx={18} fill="#dfe9f5" {...soft} />
          <rect x={cx - 160} y={floor - 100} width={14} height={100} fill="#8a96b0" />
          <rect x={cx + 146} y={floor - 100} width={14} height={100} fill="#8a96b0" />
        </g>
      );
    case "park":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} color="rgba(160,220,150,0.3)" />
          <rect x={cx - 14} y={floor - 380} width={28} height={380} fill={C.woodDark} opacity={0.7} />
          <circle cx={cx} cy={floor - 440} r={150} fill="#6fbf73" {...soft} />
          <circle cx={cx - 90} cy={floor - 390} r={90} fill="#5aae62" {...soft} />
          <circle cx={cx + 100} cy={floor - 380} r={90} fill="#7ccf80" {...soft} />
        </g>
      );
    case "banquet":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} />
          <rect x={cx - 260} y={floor - 190} width={520} height={30} rx={10} fill="#fff7ea" {...soft} />
          <path d={`M ${cx - 260} ${floor - 160} L ${cx - 240} ${floor - 40} L ${cx + 240} ${floor - 40} L ${cx + 260} ${floor - 160} Z`} fill="#fff1dc" {...soft} />
          {[-160, -50, 60, 170].map((dx, i) => (
            <g key={i}>
              <ellipse cx={cx + dx} cy={floor - 196} rx={34} ry={10} fill="#fff" {...soft} />
              <rect x={cx + dx + 30} y={floor - 250} width={10} height={50} rx={4} fill="#ffd27a" opacity={0.9} />
            </g>
          ))}
        </g>
      );
    case "factory":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} color="rgba(210,200,190,0.3)" />
          {[-1, 0, 1].map((i) => (
            <rect key={i} x={cx + i * 260 - 20} y={floor - 640} width={40} height={640} fill="#7a6a7a" opacity={0.5} />
          ))}
          <rect x={cx - 360} y={floor - 660} width={720} height={36} fill="#7a6a7a" opacity={0.6} />
          <path d={`M ${cx - 300} ${floor - 600} L ${cx - 300} ${floor - 520}`} stroke={C.yellow} strokeWidth={8} />
        </g>
      );
    case "post":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} />
          <rect x={cx - 220} y={floor - 640} width={440} height={420} rx={18} fill="#c9d7ef" {...soft} />
          <rect x={cx - 150} y={floor - 560} width={300} height={200} rx={14} fill="#ffefcf" {...soft} />
          <rect x={cx - 240} y={floor - 230} width={480} height={230} rx={12} fill="#b98a6a" {...soft} />
          <text x={cx} y={floor - 590} fontFamily="Nunito" fontWeight={900} fontSize={34} fill={OL} textAnchor="middle" opacity={0.7}>
            ПОЧТА
          </text>
        </g>
      );
    case "farm":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} color="rgba(190,220,140,0.3)" />
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={cx - 400 + i * 100} y={floor - 160} width={20} height={160} fill={C.woodLight} {...soft} />
          ))}
          <rect x={cx - 410} y={floor - 130} width={820} height={18} fill={C.wood} {...soft} />
          <rect x={cx - 410} y={floor - 70} width={820} height={18} fill={C.wood} {...soft} />
        </g>
      );
    case "plain":
      return <Floor cx={cx} floor={floor} w={w} />;
    case "airfield":
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} color="rgba(200,200,210,0.3)" />
          <path d={`M ${cx - w / 2 + 40} ${floor + 30} L ${cx + w / 2 - 40} ${floor + 30}`} stroke="#fff" strokeWidth={8} strokeDasharray="60 40" opacity={0.6} />
        </g>
      );
    case "workshop":
    default:
      return (
        <g opacity={0.9}>
          <Floor cx={cx} floor={floor} w={w} />
          <rect x={cx - 220} y={floor - 600} width={440} height={30} rx={10} fill={C.woodLight} {...soft} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={cx - 190 + i * 110} y={floor - 570} width={14} height={60 + (i % 2) * 30} fill={C.woodDark} opacity={0.7} />
          ))}
        </g>
      );
  }
};
