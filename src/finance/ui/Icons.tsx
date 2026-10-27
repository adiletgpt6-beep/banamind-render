// Простые плоские иконки выпуска (собственная отрисовка, без чужих ассетов).
import React from "react";
import { C } from "../theme";

export type IconName =
  | "home"
  | "cart"
  | "car"
  | "bolt"
  | "phone"
  | "heart"
  | "gift"
  | "wallet"
  | "briefcase"
  | "tools"
  | "store"
  | "building"
  | "book"
  | "clock"
  | "shield"
  | "target"
  | "coin"
  | "bill"
  | "chart"
  | "laptop"
  | "plane"
  | "umbrella"
  | "key"
  | "check"
  | "x"
  | "bell"
  | "pen"
  | "people"
  | "seed"
  | "tax"
  | "question"
  | "bike"
  | "person"
  | "lock"
  | "drop";

export const Icon: React.FC<{ name: IconName; size?: number; color?: string; bg?: string }> = ({
  name,
  size = 96,
  color = C.navy,
  bg,
}) => {
  const sw = 7;
  const common = { stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const g = (() => {
    switch (name) {
      case "home":
        return (
          <>
            <path d="M 18 50 L 50 22 L 82 50" {...common} />
            <path d="M 28 44 L 28 80 L 72 80 L 72 44" {...common} />
            <rect x={43} y={58} width={14} height={22} fill={color} />
          </>
        );
      case "cart":
        return (
          <>
            <path d="M 14 22 L 26 22 L 34 62 L 76 62 L 84 34 L 30 34" {...common} />
            <circle cx={38} cy={76} r={6} fill={color} />
            <circle cx={70} cy={76} r={6} fill={color} />
          </>
        );
      case "car":
        return (
          <>
            <path d="M 16 62 L 16 50 L 28 32 L 72 32 L 84 50 L 84 62 Z" {...common} />
            <path d="M 30 48 L 70 48" {...common} />
            <circle cx={30} cy={66} r={8} fill={color} />
            <circle cx={70} cy={66} r={8} fill={color} />
          </>
        );
      case "bolt":
        return <path d="M 56 12 L 26 56 L 48 56 L 42 88 L 74 42 L 52 42 Z" fill={color} />;
      case "phone":
        return (
          <>
            <rect x={30} y={12} width={40} height={76} rx={9} {...common} />
            <circle cx={50} cy={76} r={4} fill={color} />
          </>
        );
      case "heart":
        return <path d="M 50 82 C 18 60 12 42 22 28 C 32 16 46 20 50 32 C 54 20 68 16 78 28 C 88 42 82 60 50 82 Z" fill={color} />;
      case "gift":
        return (
          <>
            <rect x={18} y={40} width={64} height={42} rx={4} {...common} />
            <path d="M 14 40 L 86 40 M 50 40 L 50 82" {...common} />
            <path d="M 50 38 C 40 20 26 26 34 38 M 50 38 C 60 20 74 26 66 38" {...common} />
          </>
        );
      case "wallet":
        return (
          <>
            <rect x={14} y={28} width={72} height={52} rx={10} {...common} />
            <path d="M 62 46 L 86 46 L 86 62 L 62 62 Z" fill={color} />
            <path d="M 22 28 L 66 14 L 72 28" {...common} />
          </>
        );
      case "briefcase":
        return (
          <>
            <rect x={14} y={32} width={72} height={48} rx={8} {...common} />
            <path d="M 38 32 L 38 22 L 62 22 L 62 32 M 14 52 L 86 52" {...common} />
          </>
        );
      case "tools":
        return (
          <>
            <path d="M 24 76 L 60 40" {...common} strokeWidth={10} />
            <path d="M 56 26 C 62 14 80 14 84 26 L 72 30 L 70 40 L 80 44 C 74 56 60 56 56 46" fill={color} />
          </>
        );
      case "store":
        return (
          <>
            <path d="M 14 36 L 22 18 L 78 18 L 86 36 Z" fill={color} />
            <path d="M 20 40 L 20 82 L 80 82 L 80 40" {...common} />
            <rect x={42} y={56} width={16} height={26} fill={color} />
          </>
        );
      case "building":
        return (
          <>
            <rect x={24} y={14} width={52} height={70} rx={4} {...common} />
            {[30, 46, 62].map((y) => (
              <path key={y} d={`M 36 ${y} L 44 ${y} M 56 ${y} L 64 ${y}`} {...common} />
            ))}
          </>
        );
      case "book":
        return (
          <>
            <path d="M 50 26 C 40 18 24 18 14 22 L 14 78 C 24 74 40 74 50 82 C 60 74 76 74 86 78 L 86 22 C 76 18 60 18 50 26 Z" {...common} />
            <path d="M 50 26 L 50 82" {...common} />
          </>
        );
      case "clock":
        return (
          <>
            <circle cx={50} cy={50} r={34} {...common} />
            <path d="M 50 30 L 50 50 L 64 60" {...common} />
          </>
        );
      case "shield":
        return (
          <>
            <path d="M 50 12 L 82 24 C 82 54 70 74 50 86 C 30 74 18 54 18 24 Z" fill={color} />
            <path d="M 36 50 L 46 60 L 66 38" stroke={C.white} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );
      case "target":
        return (
          <>
            <circle cx={50} cy={50} r={34} {...common} />
            <circle cx={50} cy={50} r={20} {...common} />
            <circle cx={50} cy={50} r={7} fill={color} />
          </>
        );
      case "coin":
        return (
          <>
            <circle cx={50} cy={50} r={34} fill={color} />
            <text x={50} y={64} textAnchor="middle" fontSize={42} fontWeight={900} fill={C.white} fontFamily="Nunito">
              $
            </text>
          </>
        );
      case "bill":
        return (
          <>
            <rect x={10} y={28} width={80} height={44} rx={6} fill={color} />
            <circle cx={50} cy={50} r={12} fill="none" stroke={C.white} strokeWidth={5} />
          </>
        );
      case "chart":
        return (
          <>
            <path d="M 16 82 L 84 82" {...common} />
            <rect x={22} y={56} width={14} height={22} fill={color} />
            <rect x={43} y={40} width={14} height={38} fill={color} />
            <rect x={64} y={22} width={14} height={56} fill={color} />
          </>
        );
      case "laptop":
        return (
          <>
            <rect x={22} y={22} width={56} height={40} rx={4} {...common} />
            <path d="M 10 74 L 90 74" {...common} strokeWidth={9} />
          </>
        );
      case "plane":
        return <path d="M 12 54 L 88 24 L 70 84 L 52 62 L 40 76 L 40 58 L 76 32 L 34 54 Z" fill={color} />;
      case "umbrella":
        return (
          <>
            <path d="M 12 50 C 16 22 84 22 88 50 Z" fill={color} />
            <path d="M 50 50 L 50 78 C 50 86 38 86 38 78" {...common} />
          </>
        );
      case "key":
        return (
          <>
            <circle cx={32} cy={50} r={16} {...common} />
            <path d="M 48 50 L 86 50 M 74 50 L 74 62 M 84 50 L 84 60" {...common} />
          </>
        );
      case "check":
        return <path d="M 18 52 L 40 74 L 82 28" {...common} strokeWidth={11} />;
      case "x":
        return <path d="M 24 24 L 76 76 M 76 24 L 24 76" {...common} strokeWidth={11} />;
      case "bell":
        return (
          <>
            <path d="M 26 70 C 30 60 28 40 34 32 C 42 20 58 20 66 32 C 72 40 70 60 74 70 Z" fill={color} />
            <circle cx={50} cy={80} r={7} fill={color} />
          </>
        );
      case "pen":
        return (
          <>
            <path d="M 22 78 L 28 60 L 66 22 L 78 34 L 40 72 Z" fill={color} />
          </>
        );
      case "people":
        return (
          <>
            <circle cx={36} cy={36} r={12} fill={color} />
            <circle cx={66} cy={40} r={10} fill={color} />
            <path d="M 14 80 C 14 60 58 60 58 80 Z" fill={color} />
            <path d="M 52 80 C 54 64 86 64 86 80 Z" fill={color} />
          </>
        );
      case "seed":
        return (
          <>
            <path d="M 50 84 L 50 46" {...common} />
            <path d="M 50 52 C 30 52 20 38 22 24 C 38 24 50 34 50 52 Z" fill={color} />
            <path d="M 50 46 C 66 46 78 36 78 22 C 62 22 50 30 50 46 Z" fill={color} />
          </>
        );
      case "tax":
        return (
          <>
            <path d="M 24 12 L 64 12 L 78 26 L 78 88 L 24 88 Z" {...common} />
            <path d="M 36 40 L 66 40 M 36 56 L 66 56 M 36 72 L 54 72" {...common} />
          </>
        );
      case "bike":
        return (
          <>
            <circle cx={26} cy={64} r={16} {...common} />
            <circle cx={74} cy={64} r={16} {...common} />
            <path d="M 26 64 L 42 36 L 62 36 L 74 64 M 42 36 L 52 64 L 62 36 M 36 26 L 48 26 M 62 36 L 60 24 L 70 24" {...common} />
          </>
        );
      case "person":
        return (
          <>
            <circle cx={50} cy={34} r={16} fill={color} />
            <path d="M 18 86 C 18 58 82 58 82 86 Z" fill={color} />
          </>
        );
      case "lock":
        return (
          <>
            <rect x={22} y={44} width={56} height={42} rx={8} fill={color} />
            <path d="M 34 44 L 34 32 C 34 14 66 14 66 32 L 66 44" {...common} />
          </>
        );
      case "drop":
        return <path d="M 50 12 C 64 34 76 48 76 62 C 76 78 64 88 50 88 C 36 88 24 78 24 62 C 24 48 36 34 50 12 Z" fill={color} />;
      case "question":
        return (
          <>
            <path d="M 34 34 C 34 16 66 16 66 34 C 66 48 50 48 50 62" {...common} strokeWidth={10} />
            <circle cx={50} cy={80} r={6} fill={color} />
          </>
        );
    }
  })();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }}>
      {bg ? <circle cx={50} cy={50} r={50} fill={bg} /> : null}
      <g transform={bg ? "translate(18 18) scale(0.64)" : undefined}>{g}</g>
    </svg>
  );
};
