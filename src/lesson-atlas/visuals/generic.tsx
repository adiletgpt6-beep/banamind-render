// Общие анимированные схемы фильма: спор двух сторон (debate), весы «плюсы/минусы»
// (scales) и сетка карточек со значками (cards). Тексты приходят из сценария.
import React from "react";
import { interpolate } from "remotion";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Icon, OL, zoneX } from "./draw";
import { Panel, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type Item = { side: "l" | "r" | "c"; text: string; b: number };

const Card: React.FC<{ x: number; y: number; w: number; text: string; color: string; k: number; t: number; seed: number; h?: number; size?: number }> = ({ x, y, w, text, color, k, t, seed, h = 84, size = 32 }) => {
  if (k <= 0.001) return null;
  const dx = (1 - k) * (x < 960 ? -80 : 80);
  return (
    <g transform={`translate(${x + dx} ${y + wob(t, seed, 1.5)})`} opacity={clamp01(k * 1.5)}>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={22} fill="#000" opacity={0.08} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={C.white} stroke={color} strokeWidth={5} />
      <rect x={-w / 2} y={-h / 2} width={16} height={h} rx={8} fill={color} />
      <text x={-w / 2 + 34} y={size * 0.36} fontFamily={FONTS.heavy} fontWeight={800} fontSize={size} fill={C.ink}>
        {text}
      </text>
    </g>
  );
};

export const Debate: React.FC<VisualProps<{ left: string; right: string; leftColor: string; rightColor: string; items: Item[]; host: string }>> = (c) => {
  const { t, p } = c;
  const head = pop(t, 0.15);
  const cx = zoneX(p.host) + (p.host === "corner" ? 40 : 0);
  const colW = p.host === "corner" ? 700 : 560;
  const lx = cx - colW / 2 - 20;
  const rx = cx + colW / 2 + 20;
  const ls = p.items.filter((i) => i.side === "l");
  const rs = p.items.filter((i) => i.side === "r");
  const cs = p.items.filter((i) => i.side === "c");
  const vs = pop(t, 0.4);
  const size = p.host === "corner" ? 30 : 26;
  return (
    <g>
      {/* заголовки сторон */}
      {[
        { x: lx, label: p.left, color: p.leftColor },
        { x: rx, label: p.right, color: p.rightColor },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x} 190) scale(${head})`}>
          <rect x={-colW / 2} y={-46} width={colW} height={92} rx={46} fill={h.color} stroke={OL} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={44} fill={C.white}>
            {h.label}
          </text>
        </g>
      ))}
      <g transform={`translate(${cx} 190) scale(${vs}) rotate(${wob(t, 3, 4)})`}>
        <circle r={46} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <text y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={40} fill={C.ink}>
          VS
        </text>
      </g>
      {ls.map((it, i) => (
        <Card key={`l${i}`} x={lx} y={310 + i * 108} w={colW} text={it.text} color={p.leftColor} k={pop(t, at(c, it.b))} t={t} seed={i} size={size} />
      ))}
      {rs.map((it, i) => (
        <Card key={`r${i}`} x={rx} y={310 + i * 108} w={colW} text={it.text} color={p.rightColor} k={pop(t, at(c, it.b))} t={t} seed={i + 5} size={size} />
      ))}
      {cs.map((it, i) => {
        const k = pop(t, at(c, it.b));
        if (k <= 0.001) return null;
        return (
          <g key={`c${i}`} transform={`translate(${cx} ${790 + i * 90}) scale(${k})`}>
            <rect x={-560} y={-44} width={1120} height={88} rx={44} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={38} fill={C.ink}>
              {it.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Scales: React.FC<VisualProps<{ title: string; plus: string[]; minus: string[]; host: string }>> = (c) => {
  const { t, p, dur } = c;
  const cx = zoneX(p.host);
  const k = pop(t, 0.1);
  // чаши: плюсы появляются в первой реплике, минусы — во второй половине
  const plusK = p.plus.map((_, i) => ramp(t, 0.6 + i * 0.7, 0.5));
  const minusK = p.minus.map((_, i) => ramp(t, Math.min(dur - 2, at(c, 1)) + i * 0.7, 0.5));
  const wP = plusK.reduce((a, b) => a + b, 0);
  const wM = minusK.reduce((a, b) => a + b, 0);
  const tilt = interpolate(wM - wP, [-3, 3], [-9, 9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) + Math.sin(t * 1.6) * 0.8;
  const arm = 360;
  return (
    <g transform={`translate(${cx} 0)`}>
      <g transform={`translate(0 140) scale(${k})`}>
        <rect x={-380} y={-44} width={760} height={88} rx={44} fill={C.ink} />
        <text y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={42} fill={C.yellow}>
          {p.title}
        </text>
      </g>
      <g opacity={k}>
        <path d="M -70 860 L 70 860 L 20 820 L 20 300 L -20 300 L -20 820 Z" fill={C.steelDark} stroke={OL} strokeWidth={5} />
        <g transform={`translate(0 300) rotate(${tilt})`}>
          <rect x={-arm} y={-10} width={arm * 2} height={20} rx={10} fill={C.steel} stroke={OL} strokeWidth={5} />
          <circle r={24} fill={C.yellow} stroke={OL} strokeWidth={5} />
          {[
            { side: -1, items: p.plus, ks: plusK, color: C.green, sign: "+" },
            { side: 1, items: p.minus, ks: minusK, color: C.coral, sign: "−" },
          ].map((pan) => (
            <g key={pan.side} transform={`translate(${pan.side * arm} 0) rotate(${-tilt})`}>
              <path d="M -150 230 L 0 0 L 150 230" fill="none" stroke={OL} strokeWidth={4} />
              <path d="M -190 230 L 190 230 Q 170 300 0 300 Q -170 300 -190 230 Z" fill={pan.color} stroke={OL} strokeWidth={5} />
              <text y={290} textAnchor="middle" fontFamily={FONTS.display} fontSize={44} fill={C.white}>
                {pan.sign}
              </text>
              {pan.items.map((txt, i) => {
                const kk = pan.ks[i];
                if (kk <= 0.001) return null;
                const y = 190 - i * 74 - (1 - kk) * 120;
                return (
                  <g key={i} transform={`translate(0 ${y})`} opacity={clamp01(kk * 1.5)}>
                    <rect x={-200} y={-30} width={400} height={60} rx={16} fill={C.white} stroke={pan.color} strokeWidth={4} />
                    <text y={11} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.ink}>
                      {txt}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      </g>
    </g>
  );
};

type CardItem = { icon: string; title: string; sub?: string; b: number };

export const Cards: React.FC<VisualProps<{ items: CardItem[]; cols: number; footer?: string; footerAt?: number; host: string }>> = (c) => {
  const { t, p } = c;
  const cx = zoneX(p.host) + (p.host === "corner" ? 60 : 0);
  const cols = p.cols;
  const rows = Math.ceil(p.items.length / cols);
  const cw = cols >= 4 ? 330 : 420;
  const ch = rows > 1 ? 280 : 360;
  const gx = 30;
  const top = rows > 1 ? 170 : 260;
  return (
    <g>
      {p.items.map((it, i) => {
        const r = Math.floor(i / cols);
        const inRow = Math.min(cols, p.items.length - r * cols);
        const col = i % cols;
        const x = cx - ((inRow - 1) * (cw + gx)) / 2 + col * (cw + gx);
        const y = top + r * (ch + 30) + ch / 2;
        const k = pop(t, at(c, it.b));
        if (k <= 0.001) return null;
        const active = t >= at(c, it.b) && (i + 1 >= p.items.length || t < at(c, p.items[i + 1].b));
        return (
          <g key={i} transform={`translate(${x} ${y + wob(t, i, 2)}) scale(${(0.6 + 0.4 * k) * (active ? 1.04 : 1)})`} opacity={clamp01(k * 1.4)}>
            <Panel x={-cw / 2} y={-ch / 2} w={cw} h={ch} fill={active ? "#fffbe8" : C.white} stroke={active ? C.yellowDeep : undefined} r={30} />
            <Icon name={it.icon} x={0} y={-ch / 2 + (rows > 1 ? 78 : 100)} s={rows > 1 ? 0.8 : 1.05} t={t} />
            {it.title.length > 18
              ? it.title
                  .replace(/^(.{8,18}?)\s/, "$1\n")
                  .split("\n")
                  .map((l, j) => (
                    <text key={j} x={0} y={ch / 2 - (it.sub ? 124 : 96) + j * 38} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
                      {l}
                    </text>
                  ))
              : (
                <text x={0} y={ch / 2 - (it.sub ? 96 : 70)} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={36} fill={C.ink}>
                  {it.title}
                </text>
              )}
            {it.sub && (
              <text x={0} y={ch / 2 - 44} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill={C.inkSoft}>
                {it.sub}
              </text>
            )}
          </g>
        );
      })}
      {p.footer && (
        <g transform={`translate(${cx} ${top + rows * (ch + 30) + 10}) scale(${pop(t, at(c, p.footerAt ?? 99))})`}>
          <rect x={-460} y={-40} width={920} height={80} rx={40} fill={C.ink} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={34} fill={C.yellow}>
            {p.footer}
          </text>
        </g>
      )}
    </g>
  );
};
