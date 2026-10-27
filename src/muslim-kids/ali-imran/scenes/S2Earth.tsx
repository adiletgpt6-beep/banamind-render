// Сцена 2: Земля из частиц вращается; Солнце слева — освещена ровно половина.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { project, type Proj } from "../../lib/earth";
import { ease, range } from "../../lib/math";
import { Grid, Header } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { usePlan } from "../choreo";
import { useCues } from "../timeline";

const pr: Proj = { x: 0, y: 0, z: 0, lit: 0 };
const D = Math.PI / 180;

export const S2Back: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const plan = usePlan();
  const s2 = c.scene("s2");
  const abs = s2.from + f;
  const v = plan.earthView(abs);
  // белая «дневная» половина сцены 1 уходит вверх
  const retract = 1 - ease.inOutCubic(range(f, 0, 18));
  const sunIn = ease.outCubic(range(f, 6, 40));
  const raysIn = range(f, 30, 60);
  const fade = 1 - range(f, s2.dur - 12, s2.dur);
  const rows = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((k) => k * 52);
  return (
    <AbsoluteFill style={{ backgroundColor: MK.black }}>
      <Grid dark />
      <AbsoluteFill
        style={{ height: 960 * retract, backgroundColor: MK.white }}
      />
      {/* Солнце за левым краем: мягкое свечение */}
      <AbsoluteFill
        style={{
          opacity: sunIn * fade,
          background: `radial-gradient(circle at -120px ${v.cy}px, rgba(255,255,255,0.95) 0px, rgba(143,197,255,0.55) 150px, rgba(40,120,255,0.18) 330px, rgba(40,120,255,0) 560px)`,
        }}
      />
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", opacity: fade }}
      >
        <defs>
          <marker
            id="mk-arr"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={MK.sky} />
          </marker>
        </defs>
        {/* лучи солнечного света — параллельно, слева направо, до освещённого края */}
        {rows.map((dy, i) => {
          if (Math.abs(dy) > v.R * 0.95) return null;
          const xEnd = v.cx - Math.sqrt(v.R * v.R - dy * dy) - 14;
          const x0 = 150;
          const len =
            (xEnd - x0) * ease.outCubic(range(f, 30 + i * 2, 58 + i * 2));
          if (len < 4) return null;
          return (
            <line
              key={dy}
              x1={x0}
              y1={v.cy + dy}
              x2={x0 + len}
              y2={v.cy + dy}
              stroke={MK.sky}
              strokeOpacity={0.55 * raysIn}
              strokeWidth={2}
              strokeDasharray="10 14"
              strokeDashoffset={-f * 2.2}
              markerEnd="url(#mk-arr)"
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: v.cy - v.R - 70,
          opacity: raysIn * fade,
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 3,
          color: MK.sky,
        }}
      >
        СВЕТ СОЛНЦА →
      </div>
    </AbsoluteFill>
  );
};

export const S2Front: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const plan = usePlan();
  const s2 = c.scene("s2");
  const abs = s2.from + f;
  const v = plan.earthView(abs);
  const L = (x: number) => c.local("s2", x);
  const dayAt = L(c.word("s2b", "день") - 4);
  const nightAt = L(c.word("s2b", "ночь") - 4);
  const spinWord = L(c.word("s2a", "вращается") - 6);
  const fade = 1 - range(f, s2.dur - 12, s2.dur);
  const axisIn = ease.outCubic(range(f, 40, 64));

  // ось вращения (наклон 23,4°)
  project(Math.PI / 2, 0, v, pr);
  const nx = pr.x - v.cx;
  const ny = pr.y - v.cy;
  const ax = 1.28 * axisIn;
  // стрелка вращения: эллипс вокруг оси над северным полюсом,
  // ближняя дуга идёт слева направо (с запада на восток)
  const arc: string[] = [];
  const ux = nx / v.R; // единичный вектор оси на экране (к северу)
  const uy = ny / v.R;
  const cx = v.cx + ux * v.R * 1.14;
  const cy = v.cy + uy * v.R * 1.14;
  for (let a = 160; a >= 20; a -= 5) {
    const t = a * D;
    const right = Math.cos(t) * v.R * 0.34; // вдоль перпендикуляра к оси
    const near = Math.sin(t) * v.R * 0.1; // ближняя сторона — ниже по оси
    arc.push(
      `${(cx - uy * right - ux * near).toFixed(1)},${(cy + ux * right - uy * near).toFixed(1)}`,
    );
  }
  const arcIn = ease.outCubic(range(f, spinWord, spinWord + 24));

  // маркер «ты здесь»: точка на суше, к слову «ночь» уходит за терминатор
  const lon = 0.18 - plan.spinAt(c.word("s2b", "ночь") + 12);
  project(42 * D, lon, v, pr);
  const mk = {
    x: pr.x,
    y: pr.y,
    vis: range(pr.z, 0.05, 0.25) * range(f, 50, 70),
  };

  const label = (
    text: string,
    at: number,
    x: number,
    y: number,
    tx: number,
    ty: number,
    color: string,
  ) => {
    const p = ease.outCubic(range(f, at, at + 16));
    const line = ease.outCubic(range(f, at + 4, at + 22));
    return (
      <>
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          <line
            x1={x}
            y1={y}
            x2={x + (tx - x) * line}
            y2={y + (ty - y) * line}
            stroke={color}
            strokeWidth={2}
            strokeOpacity={0.8 * p}
          />
          <circle cx={tx} cy={ty} r={7 * line} fill={color} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: x - 200,
            width: 400,
            top: y - (y < ty ? 96 : -14),
            textAlign: "center",
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 72,
            color,
            opacity: p,
            transform: `translateY(${(1 - p) * 30}px)`,
            filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
          }}
        >
          {text}
        </div>
      </>
    );
  };

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Header
        parts={["Смотри: Земля ", { t: "вращается", c: MK.sky }]}
        at={L(c.word("s2a", 0)) - 4}
        out={undefined}
      />
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <defs>
          <marker
            id="mk-rot"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={MK.white} />
          </marker>
        </defs>
        <line
          x1={v.cx - nx * ax}
          y1={v.cy - ny * ax}
          x2={v.cx + nx * ax}
          y2={v.cy + ny * ax}
          stroke={MK.white}
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeDasharray="6 10"
        />
        <polyline
          points={arc.join(" ")}
          fill="none"
          stroke={MK.white}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={1200}
          strokeDashoffset={1200 * (1 - arcIn)}
          markerEnd={arcIn > 0.95 ? "url(#mk-rot)" : undefined}
          opacity={arcIn}
        />
        {mk.vis > 0.01 ? (
          <g opacity={mk.vis}>
            <circle
              cx={mk.x}
              cy={mk.y}
              r={15 + Math.sin(f * 0.15) * 2}
              fill="none"
              stroke={MK.sky}
              strokeWidth={3}
            />
            <circle cx={mk.x} cy={mk.y} r={5} fill={MK.white} />
          </g>
        ) : null}
      </svg>
      {mk.vis > 0.01 ? (
        <div
          style={{
            position: "absolute",
            left: mk.x + 24,
            top: mk.y - 52,
            opacity: mk.vis,
            fontFamily: FONT.body,
            fontWeight: 600,
            fontSize: 28,
            color: MK.white,
            textShadow: "0 2px 10px rgba(8,9,13,0.9)",
          }}
        >
          ты здесь
        </div>
      ) : null}
      {label(
        "ДЕНЬ",
        dayAt,
        250,
        560,
        v.cx - v.R * 0.55,
        v.cy - v.R * 0.45,
        MK.white,
      )}
      {label(
        "НОЧЬ",
        nightAt,
        830,
        1440,
        v.cx + v.R * 0.55,
        v.cy + v.R * 0.5,
        MK.sky,
      )}
    </AbsoluteFill>
  );
};
