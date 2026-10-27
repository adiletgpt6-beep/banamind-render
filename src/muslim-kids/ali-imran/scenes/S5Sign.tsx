// Сцена 5: что такое знамение — капля → росток → дерево из частиц →
// камера поднимается к небу (переход в звёздную ночь сцены 6).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp01, ease, lerp, range } from "../../lib/math";
import { Grid, Header, Reveal } from "../../lib/ui";
import { FONT, MK } from "../../theme";
import { usePlan } from "../choreo";
import { useCues } from "../timeline";

const GROUND = 1420;

// цвет неба при подъёме камеры: белый → голубой → глубокий синий → ночь
const skyAt = (k: number) => {
  const stops: [number, [number, number, number]][] = [
    [0, [255, 255, 255]],
    [0.35, [214, 233, 255]],
    [0.65, [40, 70, 140]],
    [1, [8, 9, 13]],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (k <= stops[i][0]) {
      const [k0, a] = stops[i - 1];
      const [k1, b] = stops[i];
      const t = (k - k0) / (k1 - k0);
      return `rgb(${a.map((v, j) => Math.round(lerp(v, b[j], t))).join(",")})`;
    }
  }
  return MK.black;
};

export const S5Back: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const plan = usePlan();
  const s5 = c.scene("s5");
  const abs = s5.from + f;
  const up = plan.rise(abs);
  const k = up / 1500;
  const curtain = ease.inOutCubic(range(f, 0, 18));
  const impact = plan.impact - s5.from;
  return (
    <AbsoluteFill style={{ backgroundColor: MK.black }}>
      <AbsoluteFill
        style={{
          height: 1920 * curtain,
          background: `linear-gradient(180deg, ${skyAt(Math.min(1, k * 1.25))} 0%, ${skyAt(Math.max(0, k * 1.1 - 0.12))} 100%)`,
        }}
      >
        <Grid dark={k > 0.55} opacity={1 - range(k, 0.1, 0.4)} />
      </AbsoluteFill>
      {/* земля и почва уходят вниз при подъёме камеры */}
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          transform: `translateY(${up}px)`,
          opacity: curtain,
        }}
      >
        <line
          x1={90}
          y1={GROUND}
          x2={990}
          y2={GROUND}
          stroke={MK.black}
          strokeWidth={3}
          strokeLinecap="round"
        />
        {Array.from({ length: 6 * 30 }, (_, i) => {
          const row = Math.floor(i / 30);
          const col = i % 30;
          return (
            <circle
              key={i}
              cx={105 + col * 30 + (row % 2) * 15}
              cy={GROUND + 26 + row * 26}
              r={3}
              fill={MK.black}
              opacity={0.16 - row * 0.022}
            />
          );
        })}
        {/* круги на воде после удара капли */}
        {[0, 9, 18].map((d) => {
          const t = clamp01((f - impact - d) / 40);
          if (t <= 0 || t >= 1) return null;
          return (
            <ellipse
              key={d}
              cx={540}
              cy={GROUND}
              rx={30 + t * 260}
              ry={6 + t * 34}
              fill="none"
              stroke={MK.blue}
              strokeWidth={3 * (1 - t) + 0.5}
              opacity={(1 - t) * 0.8}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// росток: стебель растёт, два листа раскрываются; позже его сменяет дерево
const Sprout: React.FC<{ g: number; fade: number }> = ({ g, fade }) => {
  const h = 150 * ease.outCubic(clamp01(g / 0.6));
  const leaf = ease.outBack(clamp01((g - 0.45) / 0.55));
  const top = GROUND - h;
  const leafPath = (dir: 1 | -1) =>
    `M 540 ${top + 30} C ${540 + dir * 40} ${top - 10}, ${540 + dir * 90} ${top + 5}, ${540 + dir * 100} ${top + 25} C ${540 + dir * 70} ${top + 50}, ${540 + dir * 30} ${top + 50}, 540 ${top + 30} Z`;
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", opacity: fade }}
    >
      <path
        d={`M 540 ${GROUND} C 536 ${GROUND - h * 0.4}, 546 ${GROUND - h * 0.7}, 540 ${top}`}
        stroke={MK.black}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <g
        transform={`translate(540 ${top + 30}) scale(${leaf}) translate(-540 ${-(top + 30)})`}
      >
        <path d={leafPath(-1)} fill={MK.blue} />
        <path d={leafPath(1)} fill={MK.sky} />
      </g>
    </svg>
  );
};

export const S5Front: React.FC = () => {
  const f = useCurrentFrame();
  const c = useCues();
  const plan = usePlan();
  const s5 = c.scene("s5");
  const L = (x: number) => c.local("s5", x);
  const impact = plan.impact - s5.from;
  const treeAt = plan.treeAt - s5.from;
  const riseAt = plan.riseFrom - s5.from;
  const up = plan.rise(s5.from + f);
  const sproutG = clamp01((f - impact - 10) / 40);
  const sproutFade = 1 - range(f, treeAt + 20, treeAt + 44);
  const words: [string, number][] = [
    ["остановиться", L(c.word("s5b", "остановиться") - 3)],
    ["посмотреть вокруг", L(c.word("s5b", "посмотреть") - 3)],
    ["задуматься об Аллахе", L(c.word("s5b", "задуматься") - 3)],
  ];
  const out = riseAt + 30;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${up}px)`,
        }}
      >
        {sproutG > 0 ? <Sprout g={sproutG} fade={sproutFade} /> : null}
      </div>
      <Header
        parts={["Что такое ", { t: "знамение", c: MK.blue }, "?"]}
        at={L(c.word("s5a", 0)) - 4}
        out={out}
        color={MK.black}
      />
      <AbsoluteFill style={{ top: 330, height: "auto", alignItems: "center" }}>
        {words.map(([w, at], i) => (
          <div
            key={w}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: i ? 14 : 0,
            }}
          >
            <div
              style={{
                fontFamily: FONT.body,
                fontWeight: 800,
                fontSize: 28,
                width: 50,
                height: 50,
                lineHeight: "50px",
                textAlign: "center",
                borderRadius: 25,
                color: MK.white,
                background: i === 2 ? MK.blue : MK.black,
                opacity:
                  ease.outCubic(range(f, at, at + 12)) *
                  (1 - range(f, out, out + 14)),
                transform: `scale(${0.4 + 0.6 * ease.outBack(range(f, at, at + 14))})`,
              }}
            >
              {i + 1}
            </div>
            <Reveal
              parts={[{ t: w, c: i === 2 ? MK.blue : MK.black }]}
              at={at + 2}
              out={out}
              stagger={2}
              style={{
                fontFamily: FONT.display,
                fontWeight: 700,
                fontSize: 50,
                letterSpacing: -0.5,
              }}
            />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
