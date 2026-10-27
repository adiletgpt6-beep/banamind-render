// Сцена 7: мальчик на холме смотрит на звёзды и показывает на небо;
// вопрос зрителю и логотип MUSLIM KIDS (месяц собирается из звёзд).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp01, ease, range } from "../../lib/math";
import { Reveal } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { VIDEO } from "../script";
import { useCues } from "../timeline";

const INK = "#040508";

export const S7Back: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, ${MK.black} 0%, #0b1530 62%, #1d3a78 86%, #2a4f96 100%)`,
    }}
  />
);

// силуэт ребёнка со спины: голова запрокинута к небу, правая рука показывает вверх
const Boy: React.FC<{ point: number; breathe: number }> = ({
  point,
  breathe,
}) => {
  // рука поднимается: локоть и кисть интерполируются от опущенной к поднятой
  const ex = 470 + 30 * point;
  const ey = 1360 - 120 * point;
  const hx = 474 + 62 * point;
  const hy = 1420 - 262 * point;
  const b = breathe;
  return (
    <g fill={INK} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
      <path
        strokeWidth={0}
        d={`M 372 ${1302 + b} C 372 ${1289 + b} 390 ${1284 + b} 416 ${1284 + b} C 442 ${1284 + b} 460 ${1289 + b} 462 ${1303 + b}
          L 456 1420 C 456 1430 452 1436 450 1440 L 452 1546 Q 453 1557 442 1557 L 425 1557 Q 418 1557 418 1548
          L 416 1452 L 414 1452 L 412 1548 Q 412 1557 404 1557 L 387 1557 Q 377 1557 378 1546 L 380 1440
          C 376 1434 374 1428 374 1420 Z`}
      />
      <path
        d={`M 378 ${1306 + b} Q 360 1360 362 1414`}
        fill="none"
        strokeWidth={21}
      />
      <path
        d={`M 456 ${1306 + b} Q ${ex} ${ey} ${hx} ${hy}`}
        fill="none"
        strokeWidth={20}
      />
      <circle cx={hx} cy={hy} r={12} strokeWidth={0} />
      <rect
        x={405}
        y={1258 + b}
        width={24}
        height={34}
        rx={9}
        strokeWidth={0}
      />
      <ellipse
        cx={421}
        cy={1244 + b}
        rx={33}
        ry={36}
        transform={`rotate(-14 421 ${1244 + b})`}
        strokeWidth={0}
      />
      {/* тюбетейка */}
      <path
        d={`M 388 ${1236 + b} Q 390 ${1204 + b} 420 ${1204 + b} Q 450 ${1206 + b} 455 ${1226 + b} Q 422 ${1222 + b} 388 ${1236 + b} Z`}
        strokeWidth={3}
      />
    </g>
  );
};

export const S7Front: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const L = (x: number) => c.local("s7", x);
  const look = L(c.word("s7b", "небо") - 10);
  const ask = L(c.word("s7c", 0) - 4);
  const logo = L(c.line("s7c").speechTo + 8);
  const point = ease.inOutCubic(range(f, look - 14, look + 12));
  const enter = ease.outCubic(range(f, 0, 26));
  // падающая звезда — на словах «посмотри на небо»
  const sh = clamp01((f - look - 6) / 20);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="mk-shoot" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <filter id="mk-rim">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="6"
              floodColor={MK.sky}
              floodOpacity="0.45"
            />
          </filter>
        </defs>
        {sh > 0 && sh < 1 ? (
          <line
            x1={930 - 330 * ease.outCubic(sh) + 160}
            y1={300 + 200 * ease.outCubic(sh) - 97}
            x2={930 - 330 * ease.outCubic(sh)}
            y2={300 + 200 * ease.outCubic(sh)}
            stroke="url(#mk-shoot)"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={Math.sin(sh * Math.PI)}
          />
        ) : null}
        <g
          transform={`translate(0 ${(1 - enter) * 300})`}
          filter="url(#mk-rim)"
        >
          <path
            d="M -20 1600 Q 300 1520 560 1560 T 1100 1530 L 1100 1940 L -20 1940 Z"
            fill={INK}
          />
          <Boy point={point} breathe={Math.sin(f * 0.08) * 1.5} />
        </g>
      </svg>
      <AbsoluteFill style={{ top: 300, height: "auto" }}>
        <Reveal
          parts={["А теперь твоя очередь"]}
          at={L(c.word("s7a", 0) - 4)}
          out={ask - 8}
          stagger={3}
          style={{
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 46,
            color: MK.sky,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 330, height: "auto" }}>
        <Reveal
          parts={["ЧТО УДИВЛЯЕТ"]}
          at={ask}
          by="char"
          stagger={1.4}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 84,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        />
        <Reveal
          parts={[{ t: "ТЕБЯ?", c: MK.sky }]}
          at={ask + 16}
          by="char"
          stagger={2}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 84,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 980, height: "auto", alignItems: "center" }}>
        <Reveal
          parts={["MUSLIM KIDS"]}
          at={logo + 22}
          by="char"
          stagger={1.5}
          style={{
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 80,
            letterSpacing: 4,
          }}
        />
        <Reveal
          parts={[VIDEO.title]}
          at={logo + 40}
          color={MK.sky}
          style={{
            fontFamily: FONT.body,
            fontWeight: 500,
            fontSize: 36,
            marginTop: 14,
            letterSpacing: 1,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
