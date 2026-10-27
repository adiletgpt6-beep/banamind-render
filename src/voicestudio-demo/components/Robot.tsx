import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";

export type RobotMood = "happy" | "star" | "heart" | "focus";

type Props = {
  size: number;
  /** Громкость речи 0..1 — двигает «рот»-эквалайзер и свечение антенны. */
  level?: number;
  mood?: RobotMood;
  /** Угол правой руки (градусы); 0 — опущена. */
  wave?: number;
  /** Угол левой руки (градусы); положительный — вперёд/в сторону. */
  point?: number;
  id?: string;
  style?: React.CSSProperties;
};

// Оригинальный робот-помощник «Войси», нарисован специально для ролика.
export const Robot: React.FC<Props> = ({
  size,
  level = 0,
  mood = "happy",
  wave = 0,
  point = 0,
  id = "r",
  style,
}) => {
  const frame = useCurrentFrame();
  const float = Math.sin(frame / 14) * 6;
  // Моргание: короткое закрытие глаз раз в ~3.3 с.
  const blinkPhase = (frame + 37) % 100;
  const blink = blinkPhase < 4 ? 0.12 : 1;
  const bars = [0.55, 0.85, 1, 0.85, 0.55].map((k, i) => {
    const jitter = 0.65 + 0.35 * Math.sin(frame * 0.9 + i * 1.7);
    return 3 + 16 * Math.min(1, level * 1.3) * k * jitter;
  });
  const glow = 0.5 + Math.min(1, level) * 0.5;

  const eye = (cx: number) => {
    if (mood === "star") {
      const pts = Array.from({ length: 10 }, (_, k) => {
        const r = k % 2 === 0 ? 15 : 6.5;
        const a = (Math.PI / 5) * k - Math.PI / 2;
        return `${cx + r * Math.cos(a)},${102 + r * Math.sin(a)}`;
      }).join(" ");
      return <polygon points={pts} fill="#FFD84D" />;
    }
    if (mood === "heart") {
      return (
        <path
          d={`M ${cx} 114 C ${cx - 22} 100, ${cx - 12} 84, ${cx} 95 C ${cx + 12} 84, ${cx + 22} 100, ${cx} 114 Z`}
          fill="#FF5C8A"
        />
      );
    }
    return (
      <rect
        x={cx - 11}
        y={102 - 15 * blink}
        width={22}
        height={30 * blink}
        rx={11 * Math.min(1, blink + 0.3)}
        fill={`url(#${id}-eye)`}
      />
    );
  };

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 240 300"
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={`${id}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3E9F6" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#24366E" />
          <stop offset="1" stopColor={C.navy} />
        </linearGradient>
        <linearGradient id={`${id}-eye`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DF0FF" />
          <stop offset="1" stopColor={C.cyan} />
        </linearGradient>
        <linearGradient id={`${id}-ear`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A08BFF" />
          <stop offset="1" stopColor={C.violet} />
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.orange2} />
          <stop offset="1" stopColor={C.pink} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={C.orange2} stopOpacity="0.9" />
          <stop offset="1" stopColor={C.orange2} stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="292" rx={58 - float} ry="8" fill="rgba(14,27,61,0.12)" />

      <g transform={`translate(0 ${float})`}>
        {/* Антенна */}
        <line x1="120" y1="42" x2="120" y2="20" stroke="#C9D2E6" strokeWidth="6" strokeLinecap="round" />
        <circle cx="120" cy="14" r={22 * glow} fill={`url(#${id}-glow)`} />
        <circle cx="120" cy="14" r="10" fill={C.orange} />
        <circle cx="116.5" cy="10.5" r="3" fill="#FFFFFF" opacity="0.8" />

        {/* Левая рука (указывает) */}
        <g transform={`rotate(${point} 78 200)`}>
          <rect x="54" y="194" width="22" height="62" rx="11" fill={`url(#${id}-head)`} stroke="#D3DBEC" strokeWidth="2" />
          <circle cx="65" cy="258" r="12" fill={C.violet} />
        </g>
        {/* Правая рука (машет) */}
        <g transform={`rotate(${-wave} 162 200)`}>
          <rect x="164" y="194" width="22" height="62" rx="11" fill={`url(#${id}-head)`} stroke="#D3DBEC" strokeWidth="2" />
          <circle cx="175" cy="258" r="12" fill={C.violet} />
        </g>

        {/* Тело */}
        <rect x="104" y="174" width="32" height="16" rx="6" fill="#D3DBEC" />
        <rect x="72" y="184" width="96" height="80" rx="36" fill={`url(#${id}-head)`} stroke="#D3DBEC" strokeWidth="2" />
        <circle cx="120" cy="223" r="17" fill={`url(#${id}-core)`} />
        <path
          d={`M 108 223 Q 112 ${223 - 8 * glow} 116 223 T 124 223 T 132 223`}
          stroke="#FFFFFF"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Уши */}
        <circle cx="28" cy="110" r="17" fill={`url(#${id}-ear)`} />
        <circle cx="212" cy="110" r="17" fill={`url(#${id}-ear)`} />
        <circle cx="24" cy="105" r="5" fill="#FFFFFF" opacity="0.55" />

        {/* Голова */}
        <rect x="30" y="40" width="180" height="140" rx="62" fill={`url(#${id}-head)`} stroke="#D3DBEC" strokeWidth="2" />
        <rect x="50" y="64" width="140" height="94" rx="44" fill={`url(#${id}-visor)`} />
        <path d="M 66 78 Q 90 68 116 70" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="6" fill="none" strokeLinecap="round" />
        {eye(90)}
        {eye(150)}
        {/* Рот-эквалайзер */}
        {bars.map((h, i) => (
          <rect key={i} x={104 + i * 7} y={140 - h / 2} width="4" height={h} rx="2" fill={C.cyan} opacity={0.95} />
        ))}
        <circle cx="64" cy="146" r="7" fill={C.pink} opacity="0.35" />
        <circle cx="176" cy="146" r="7" fill={C.pink} opacity="0.35" />
      </g>
    </svg>
  );
};
