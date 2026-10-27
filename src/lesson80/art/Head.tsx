// Голова персонажа 80-1-14. Всё лицо — одна группа: глаза, брови, рот,
// борода и тюбетейка учителя движутся вместе с головой и не «плывут».
// Поворот головы передаётся смещением черт лица (classic 2D 3/4).
import React from "react";
import type { HairStyle } from "../cast";

export type MouthState = {
  readonly open: number; // 0 — закрыт … 1 — широко открыт
  readonly round: number; // о/у
  readonly wide: number; // и/е
  readonly smile: number; // 0 … 1
};

export const MOUTH_REST: MouthState = { open: 0, round: 0, wide: 0, smile: 0.35 };

export type HeadProps = {
  readonly w: number;
  readonly h: number;
  readonly skin: string;
  readonly hair: string;
  readonly hairStyle: HairStyle | "adult";
  readonly turn: number; // −1 … 1
  readonly gazeX: number; // −1 … 1 (влево/вправо от лица)
  readonly gazeY: number; // −1 … 1 (вверх/вниз)
  readonly blink: number; // 0 … 1
  readonly brow: number; // −1 (задумчиво) … 1 (удивлённо)
  readonly mouth: MouthState;
  readonly adult?: boolean;
  readonly beard?: string;
  readonly cap?: string;
  readonly uid: string;
};

const LINE = "#5A3B2A";

const shade = (hex: string, k: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
export { shade };

const Eye: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  sx: number;
  gx: number;
  gy: number;
  blink: number;
  skin: string;
  adult?: boolean;
}> = ({ cx, cy, rx, ry, sx, gx, gy, blink, skin, adult }) => {
  const open = Math.max(0, 1 - blink);
  if (open < 0.18) {
    return (
      <path
        d={`M ${cx - rx * sx} ${cy + ry * 0.1} Q ${cx} ${cy + ry * 0.45} ${cx + rx * sx} ${cy + ry * 0.1}`}
        stroke={LINE}
        strokeWidth={rx * 0.28}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  const ir = rx * (adult ? 0.62 : 0.72);
  const ix = cx + gx * rx * 0.38 * sx;
  const iy = cy + gy * ry * 0.3;
  const id = `eye-${cx.toFixed(1)}-${cy.toFixed(1)}`;
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx * sx} ry={ry * open} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx * sx} ry={ry * open} fill="#FFFDF9" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={ix} cy={iy} rx={ir * sx} ry={ir} fill="#4A2E1E" />
        <ellipse cx={ix} cy={iy} rx={ir * 0.55 * sx} ry={ir * 0.55} fill="#1C120C" />
        <circle cx={ix + ir * 0.35 * sx} cy={iy - ir * 0.38} r={ir * 0.28} fill="#FFFFFF" />
        <circle cx={ix - ir * 0.3 * sx} cy={iy + ir * 0.35} r={ir * 0.12} fill="#FFFFFF" opacity={0.7} />
        {/* верхнее веко — мягкая тень */}
        <ellipse cx={cx} cy={cy - ry * open * 1.05} rx={rx * sx * 1.1} ry={ry * 0.35} fill={skin} opacity={0.35} />
      </g>
      <path
        d={`M ${cx - rx * sx * 1.05} ${cy - ry * open * 0.2} Q ${cx} ${cy - ry * open * 1.32} ${cx + rx * sx * 1.05} ${cy - ry * open * 0.2}`}
        stroke={LINE}
        strokeWidth={rx * (adult ? 0.2 : 0.22)}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
};

const Mouth: React.FC<{ x: number; y: number; w: number; m: MouthState; adult?: boolean; beard?: string }> = ({ x, y, w, m, adult, beard }) => {
  const open = Math.max(0, Math.min(1, m.open));
  const mw = w * (adult ? 0.2 : 0.17) * (1 + 0.35 * m.wide - 0.4 * m.round * open);
  if (open < 0.07) {
    const s = m.smile * w * 0.045;
    return (
      <path
        d={`M ${x - mw * 0.55} ${y - s * 0.4} Q ${x} ${y + s * 1.2 + w * 0.006} ${x + mw * 0.55} ${y - s * 0.4}`}
        stroke={beard ? "#3B2418" : "#8A4A3A"}
        strokeWidth={w * 0.022}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  const mh = w * (0.025 + 0.13 * open) * (1 + 0.25 * m.round);
  const top = y - mh * 0.28;
  const bot = y + mh * 0.72;
  const hw = mw * 0.5;
  const lift = m.smile * w * 0.02;
  const d = `M ${x - hw} ${top + lift * 0.2}
    Q ${x} ${top - mh * 0.12} ${x + hw} ${top + lift * 0.2}
    Q ${x + hw * 1.02} ${bot - mh * 0.15} ${x} ${bot}
    Q ${x - hw * 1.02} ${bot - mh * 0.15} ${x - hw} ${top + lift * 0.2} Z`;
  return (
    <g>
      <path d={d} fill="#6B2A26" stroke="#5A2A22" strokeWidth={w * 0.012} />
      {open > 0.3 ? <ellipse cx={x} cy={bot - mh * 0.2} rx={hw * 0.55} ry={mh * 0.22} fill="#C9645C" /> : null}
      {open > 0.35 && m.round < 0.5 ? <rect x={x - hw * 0.62} y={top} width={hw * 1.24} height={mh * 0.16} rx={mh * 0.06} fill="#FBF7F0" /> : null}
    </g>
  );
};

const hairShapes = (style: HairStyle | "adult", w: number, h: number, t: number) => {
  // голова: эллипс (0,0) w/2 × h/2; t — смещение по повороту
  const hw = w / 2;
  const hh = h / 2;
  const ox = t * w * 0.06;
  const crown = `M ${-hw * 1.02} ${hh * 0.05}
    C ${-hw * 1.08} ${-hh * 0.9} ${-hw * 0.5} ${-hh * 1.12} ${ox} ${-hh * 1.1}
    C ${hw * 0.5} ${-hh * 1.12} ${hw * 1.08} ${-hh * 0.9} ${hw * 1.02} ${hh * 0.05}`;
  switch (style) {
    case "buzz":
      return {
        back: "",
        front: `${crown} C ${hw * 0.9} ${-hh * 0.45} ${hw * 0.45} ${-hh * 0.62} ${ox} ${-hh * 0.62} C ${-hw * 0.45} ${-hh * 0.62} ${-hw * 0.9} ${-hh * 0.45} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 0.85,
      };
    case "crop":
      return {
        back: "",
        front: `${crown} C ${hw * 0.95} ${-hh * 0.35} ${hw * 0.6} ${-hh * 0.42} ${hw * 0.3 + ox} ${-hh * 0.4} L ${ox - hw * 0.1} ${-hh * 0.5} C ${-hw * 0.5} ${-hh * 0.42} ${-hw * 0.95} ${-hh * 0.35} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 1,
      };
    case "spiky":
      return {
        back: "",
        front: `M ${-hw * 1.02} ${hh * 0.0} C ${-hw * 1.1} ${-hh * 0.8} ${-hw * 0.7} ${-hh * 1.05} ${-hw * 0.55} ${-hh * 1.12}
          L ${-hw * 0.35} ${-hh * 1.02} L ${-hw * 0.15 + ox} ${-hh * 1.2} L ${hw * 0.05 + ox} ${-hh * 1.05} L ${hw * 0.3 + ox} ${-hh * 1.18}
          L ${hw * 0.45} ${-hh * 1.0} C ${hw * 0.9} ${-hh * 0.98} ${hw * 1.1} ${-hh * 0.7} ${hw * 1.02} ${hh * 0.0}
          C ${hw * 0.9} ${-hh * 0.4} ${hw * 0.5} ${-hh * 0.48} ${ox} ${-hh * 0.5} C ${-hw * 0.5} ${-hh * 0.48} ${-hw * 0.9} ${-hh * 0.4} ${-hw * 1.02} ${hh * 0.0} Z`,
        opacity: 1,
      };
    case "side":
      return {
        back: "",
        front: `${crown} C ${hw * 0.95} ${-hh * 0.3} ${hw * 0.7} ${-hh * 0.5} ${hw * 0.4 + ox} ${-hh * 0.55}
          C ${hw * 0.0 + ox} ${-hh * 0.5} ${-hw * 0.45} ${-hh * 0.25} ${-hw * 0.7} ${-hh * 0.25} C ${-hw * 0.9} ${-hh * 0.2} ${-hw * 1.0} ${-hh * 0.05} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 1,
      };
    case "wavy":
      return {
        back: "",
        front: `${crown} C ${hw * 1.0} ${-hh * 0.35} ${hw * 0.75} ${-hh * 0.3} ${hw * 0.55 + ox} ${-hh * 0.42}
          Q ${hw * 0.3 + ox} ${-hh * 0.25} ${hw * 0.1 + ox} ${-hh * 0.45} Q ${-hw * 0.15 + ox} ${-hh * 0.28} ${-hw * 0.35 + ox} ${-hh * 0.45}
          Q ${-hw * 0.6} ${-hh * 0.28} ${-hw * 0.8} ${-hh * 0.38} C ${-hw * 0.95} ${-hh * 0.2} ${-hw * 1.0} ${-hh * 0.05} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 1,
      };
    case "curly":
      return {
        back: `M ${-hw * 1.12} ${hh * 0.1} C ${-hw * 1.3} ${-hh * 1.0} ${-hw * 0.5} ${-hh * 1.32} ${ox} ${-hh * 1.28} C ${hw * 0.5} ${-hh * 1.32} ${hw * 1.3} ${-hh * 1.0} ${hw * 1.12} ${hh * 0.1} Z`,
        front: `${crown} Q ${hw * 0.8} ${-hh * 0.3} ${hw * 0.6} ${-hh * 0.5} Q ${hw * 0.4} ${-hh * 0.3} ${hw * 0.2 + ox} ${-hh * 0.52} Q ${ox} ${-hh * 0.32} ${-hw * 0.2 + ox} ${-hh * 0.52} Q ${-hw * 0.4} ${-hh * 0.3} ${-hw * 0.6} ${-hh * 0.5} Q ${-hw * 0.8} ${-hh * 0.3} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 1,
      };
    case "adult":
      return {
        back: "",
        front: `${crown} C ${hw * 0.95} ${-hh * 0.45} ${hw * 0.6} ${-hh * 0.6} ${ox} ${-hh * 0.62} C ${-hw * 0.6} ${-hh * 0.6} ${-hw * 0.95} ${-hh * 0.45} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 1,
      };
    case "short":
    default:
      return {
        back: "",
        front: `${crown} C ${hw * 0.95} ${-hh * 0.4} ${hw * 0.55} ${-hh * 0.5} ${hw * 0.15 + ox} ${-hh * 0.48}
          Q ${-hw * 0.2 + ox} ${-hh * 0.6} ${-hw * 0.55} ${-hh * 0.42} C ${-hw * 0.9} ${-hh * 0.35} ${-hw * 1.0} ${-hh * 0.1} ${-hw * 1.02} ${hh * 0.05} Z`,
        opacity: 1,
      };
  }
};

export const Head: React.FC<HeadProps> = (p) => {
  const { w, h, skin, hair, turn, adult } = p;
  const hw = w / 2;
  const hh = h / 2;
  const fx = turn * w * 0.16;
  const eyeY = adult ? -h * 0.02 : h * 0.07;
  const eyeSep = w * (adult ? 0.2 : 0.215);
  const erx = w * (adult ? 0.068 : 0.088);
  const ery = w * (adult ? 0.058 : 0.098);
  // ближний/дальний глаз: дальний чуть уже
  const sL = 1 - Math.max(0, turn) * 0.35;
  const sR = 1 - Math.max(0, -turn) * 0.35;
  const hairS = hairShapes(p.hairStyle, w, h, turn);
  const browY = eyeY - ery * 1.75 - p.brow * ery * 0.45;
  const browTilt = p.brow < 0 ? -p.brow * ery * 0.35 : 0;
  const mouthY = adult ? h * 0.27 : h * 0.31;
  const earY = adult ? h * 0.02 : h * 0.08;
  const earR = w * (adult ? 0.085 : 0.1);
  const clip = `face-${p.uid}`;
  return (
    <g>
      <clipPath id={clip}>
        <ellipse cx={0} cy={0} rx={hw} ry={hh} />
      </clipPath>
      {hairS.back ? <path d={hairS.back} fill={hair} /> : null}
      {/* уши: ближнее видно сильнее */}
      <ellipse cx={-hw * 0.98 + Math.max(0, turn) * w * 0.08} cy={earY} rx={earR * (1 - Math.max(0, turn) * 0.5)} ry={earR * 1.25} fill={shade(skin, 0.95)} />
      <ellipse cx={hw * 0.98 - Math.max(0, -turn) * w * 0.08} cy={earY} rx={earR * (1 - Math.max(0, -turn) * 0.5)} ry={earR * 1.25} fill={shade(skin, 0.95)} />
      {/* лицо */}
      <ellipse cx={0} cy={0} rx={hw} ry={hh} fill={skin} />
      {/* мягкая форма: тень на стороне, дальней от окна (свет слева) */}
      <g clipPath={`url(#${clip})`}>
        <ellipse cx={hw * 0.75} cy={hh * 0.25} rx={hw * 0.55} ry={hh * 1.0} fill={shade(skin, 0.88)} opacity={0.45} />
        <ellipse cx={-hw * 0.3} cy={-hh * 0.35} rx={hw * 0.5} ry={hh * 0.35} fill="#FFFFFF" opacity={0.12} />
      </g>
      {/* борода учителя: часть головы, закреплена на челюсти */}
      {p.beard ? (
        <g>
          <path
            d={`M ${-hw * 0.98} ${-h * 0.02}
              C ${-hw * 0.98} ${h * 0.35} ${-hw * 0.6} ${h * 0.62} ${fx * 0.6} ${h * 0.66}
              C ${hw * 0.6} ${h * 0.62} ${hw * 0.98} ${h * 0.35} ${hw * 0.98} ${-h * 0.02}
              C ${hw * 0.88} ${h * 0.12} ${hw * 0.6} ${h * 0.16} ${fx + w * 0.18} ${mouthY - h * 0.06}
              Q ${fx} ${mouthY - h * 0.1} ${fx - w * 0.18} ${mouthY - h * 0.06}
              C ${-hw * 0.6} ${h * 0.16} ${-hw * 0.88} ${h * 0.12} ${-hw * 0.98} ${-h * 0.02} Z`}
            fill={p.beard}
          />
          <path
            d={`M ${fx - w * 0.13} ${mouthY + h * 0.065} Q ${fx} ${mouthY + h * 0.11} ${fx + w * 0.13} ${mouthY + h * 0.065} Q ${fx} ${mouthY + h * 0.2} ${fx - w * 0.13} ${mouthY + h * 0.065} Z`}
            fill={shade(skin, 0.86)}
            opacity={0.55}
          />
        </g>
      ) : null}
      {/* волосы */}
      <path d={hairS.front} fill={hair} opacity={hairS.opacity} />
      {/* тюбетейка учителя */}
      {p.cap ? (
        <g>
          <path
            d={`M ${-hw * 0.9} ${-hh * 0.5} C ${-hw * 0.92} ${-hh * 1.18} ${hw * 0.92} ${-hh * 1.18} ${hw * 0.9} ${-hh * 0.5} Q ${0} ${-hh * 0.62} ${-hw * 0.9} ${-hh * 0.5} Z`}
            fill={p.cap}
          />
          <path d={`M ${-hw * 0.9} ${-hh * 0.5} Q ${0} ${-hh * 0.62} ${hw * 0.9} ${-hh * 0.5}`} stroke="#D9D3C4" strokeWidth={w * 0.025} fill="none" />
          <path
            d={`M ${-hw * 0.6} ${-hh * 0.66} Q ${-hw * 0.3} ${-hh * 0.76} ${0} ${-hh * 0.68} Q ${hw * 0.3} ${-hh * 0.76} ${hw * 0.6} ${-hh * 0.66}`}
            stroke="#E3DDCF"
            strokeWidth={w * 0.012}
            fill="none"
          />
          <ellipse cx={hw * 0.35} cy={-hh * 0.95} rx={hw * 0.25} ry={hh * 0.08} fill="#FFFFFF" opacity={0.7} />
        </g>
      ) : null}
      {/* щёки */}
      {!adult ? (
        <>
          <ellipse cx={fx - w * 0.29} cy={h * 0.22} rx={w * 0.075} ry={w * 0.045} fill="#F08C7E" opacity={0.28} />
          <ellipse cx={fx + w * 0.29} cy={h * 0.22} rx={w * 0.075} ry={w * 0.045} fill="#F08C7E" opacity={0.28} />
        </>
      ) : null}
      {/* брови */}
      <path
        d={`M ${fx - eyeSep - erx * sL} ${browY + browTilt * 0.2} Q ${fx - eyeSep} ${browY - ery * 0.35} ${fx - eyeSep + erx * sL} ${browY + browTilt}`}
        stroke={adult ? p.hair : shade(p.hair, 1.1)}
        strokeWidth={w * (adult ? 0.032 : 0.03)}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${fx + eyeSep - erx * sR} ${browY + browTilt} Q ${fx + eyeSep} ${browY - ery * 0.35} ${fx + eyeSep + erx * sR} ${browY + browTilt * 0.2}`}
        stroke={adult ? p.hair : shade(p.hair, 1.1)}
        strokeWidth={w * (adult ? 0.032 : 0.03)}
        fill="none"
        strokeLinecap="round"
      />
      <Eye cx={fx - eyeSep * sL} cy={eyeY} rx={erx} ry={ery} sx={sL} gx={p.gazeX} gy={p.gazeY} blink={p.blink} skin={skin} adult={adult} />
      <Eye cx={fx + eyeSep * sR} cy={eyeY} rx={erx} ry={ery} sx={sR} gx={p.gazeX} gy={p.gazeY} blink={p.blink} skin={skin} adult={adult} />
      {/* нос */}
      <path
        d={`M ${fx * 1.25 - w * 0.02} ${adult ? h * 0.08 : h * 0.17} Q ${fx * 1.25 + w * 0.045} ${adult ? h * 0.15 : h * 0.215} ${fx * 1.25 - w * 0.015} ${adult ? h * 0.17 : h * 0.235}`}
        stroke={shade(skin, 0.72)}
        strokeWidth={w * 0.022}
        fill="none"
        strokeLinecap="round"
      />
      {p.beard ? (
        <path
          d={`M ${fx - w * 0.17} ${mouthY - h * 0.035} Q ${fx - w * 0.08} ${mouthY - h * 0.085} ${fx} ${mouthY - h * 0.055} Q ${fx + w * 0.08} ${mouthY - h * 0.085} ${fx + w * 0.17} ${mouthY - h * 0.035} Q ${fx} ${mouthY - h * 0.02} ${fx - w * 0.17} ${mouthY - h * 0.035} Z`}
          fill={p.beard}
        />
      ) : null}
      <Mouth x={fx} y={mouthY} w={w} m={p.mouth} adult={adult} beard={p.beard} />
    </g>
  );
};
