// Голова героя: лицо с поворотом (черты смещаются к стороне взгляда), глаза
// с веками, морганием и бликами, подвижные брови, рот по фактической речи,
// румянец, причёска. Выразительные реакции: wide — глаза широко раскрыты
// (удивление), laugh — смеющиеся глаза-дуги. Центр лица — (0, 0).
// Основа — проверенный риг BG-012; причёски и реакции — свои для BG-048.
import type { Viseme } from "../context";
import { INK, type Look } from "./looks";

export type Face = {
  readonly turn: number; // −1…1, поворот головы (влево/вправо)
  readonly lookX: number; // −1…1
  readonly lookY: number; // −1…1
  readonly blink: number; // 0…1
  readonly lid: number; // 0…1 — опущенные веки (мягкий взгляд)
  readonly raise: number; // −1…1 — брови вверх/вниз
  readonly worry: number; // 0…1 — внутренние концы бровей вверх
  readonly smile: number; // −1…1
  readonly wide: number; // 0…1 — удивление: глаза шире, зрачки меньше
  readonly laugh: number; // 0…1 — смех: глаза-дуги
  readonly mouth: Viseme;
};

export const NEUTRAL_FACE: Face = {
  turn: 0,
  lookX: 0,
  lookY: 0,
  blink: 0,
  lid: 0,
  raise: 0,
  worry: 0,
  smile: 0.15,
  wide: 0,
  laugh: 0,
  mouth: { open: 0, round: 0, wide: 0, talking: false },
};

const f1 = (n: number) => n.toFixed(1);

const HairBack: React.FC<{ look: Look; turn: number }> = ({ look, turn }) => {
  const { headRx: rx, headRy: ry } = look.build;
  const sx = -turn * rx * 0.1;
  if (look.id === "mom") {
    // собранные волосы: объём за головой и пучок на затылке
    return (
      <>
        <circle cx={sx - turn * rx * 0.25} cy={-ry * 1.08} r={rx * 0.5} fill={look.hair} />
        <ellipse cx={sx} cy={-ry * 0.32} rx={rx * 1.06} ry={ry * 0.98} fill={look.hair} />
      </>
    );
  }
  if (look.id === "girl") {
    // два хвостика с белыми бантами по бокам
    return (
      <>
        <ellipse cx={sx} cy={-ry * 0.3} rx={rx * 1.04} ry={ry * 0.98} fill={look.hair} />
        {([-1, 1] as const).map((s) => {
          const bx = sx + s * rx * 1.08;
          const by = -ry * 0.05;
          return (
            <g key={s}>
              <path
                d={`M ${f1(bx)} ${f1(by)} C ${f1(bx + s * rx * 0.55)} ${f1(by + ry * 0.2)} ${f1(bx + s * rx * 0.5)} ${f1(by + ry * 0.95)} ${f1(bx + s * rx * 0.15)} ${f1(by + ry * 1.1)} C ${f1(bx + s * rx * 0.25)} ${f1(by + ry * 0.7)} ${f1(bx - s * rx * 0.05)} ${f1(by + ry * 0.35)} ${f1(bx - s * rx * 0.12)} ${f1(by + ry * 0.1)} Z`}
                fill={look.hair}
              />
              {/* бант */}
              <g transform={`translate(${f1(bx + s * rx * 0.02)} ${f1(by - ry * 0.02)})`}>
                <path d={`M 0 0 C ${f1(-rx * 0.5)} ${f1(-ry * 0.42)} ${f1(-rx * 0.62)} ${f1(ry * 0.3)} 0 0 Z`} fill="#FFFFFF" stroke="#D9DEEA" strokeWidth={3} />
                <path d={`M 0 0 C ${f1(rx * 0.5)} ${f1(-ry * 0.42)} ${f1(rx * 0.62)} ${f1(ry * 0.3)} 0 0 Z`} fill="#FFFFFF" stroke="#D9DEEA" strokeWidth={3} />
                <circle cx={0} cy={0} r={rx * 0.1} fill="#F2F4FA" stroke="#D9DEEA" strokeWidth={3} />
              </g>
            </g>
          );
        })}
      </>
    );
  }
  return <ellipse cx={sx} cy={-ry * 0.3} rx={rx * 1.04} ry={ry * 0.98} fill={look.hair} />;
};

const HairFront: React.FC<{ look: Look; turn: number }> = ({ look, turn }) => {
  const { headRx: rx, headRy: ry } = look.build;
  const sx = turn * rx * 0.1;
  const P = (x: number, y: number) => `${f1(x * rx + sx)} ${f1(y * ry)}`;
  if (look.id === "mom") {
    // гладко зачёсанные назад волосы с пробором и жёлтой заколкой
    return (
      <>
        <path
          d={`M ${P(-1.06, 0.18)} C ${P(-1.18, -1.42)} ${P(1.18, -1.42)} ${P(1.06, 0.18)} C ${P(0.98, -0.25)} ${P(0.78, -0.56)} ${P(0.3, -0.62)} C ${P(0.05, -0.64)} ${P(-0.12, -0.7)} ${P(-0.22, -0.82)} C ${P(-0.45, -0.62)} ${P(-0.85, -0.42)} ${P(-1.04, 0.18)} Z`}
          fill={look.hair}
        />
        <path d={`M ${P(-0.05, -0.96)} C ${P(0.28, -1.04)} ${P(0.62, -0.92)} ${P(0.84, -0.66)}`} stroke={look.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
        <rect x={rx * 0.55 + sx} y={-ry * 0.98} width={rx * 0.42} height={ry * 0.13} rx={ry * 0.06} fill="#F7C531" transform={`rotate(28 ${f1(rx * 0.76 + sx)} ${f1(-ry * 0.92)})`} />
      </>
    );
  }
  if (look.id === "dad") {
    // короткая стрижка, аккуратная линия роста волос
    return (
      <>
        <path
          d={`M ${P(-1.02, 0.05)} C ${P(-1.1, -1.08)} ${P(-0.2, -1.3)} ${P(0.3, -1.2)} C ${P(0.9, -1.12)} ${P(1.1, -0.75)} ${P(1.02, 0.05)} L ${P(0.9, -0.2)} C ${P(0.82, -0.5)} ${P(0.5, -0.6)} ${P(0.1, -0.6)} C ${P(-0.4, -0.62)} ${P(-0.8, -0.5)} ${P(-0.9, -0.2)} Z`}
          fill={look.hair}
        />
        <path d={`M ${P(-0.25, -0.98)} C ${P(0.1, -1.07)} ${P(0.45, -1.02)} ${P(0.68, -0.86)}`} stroke={look.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
      </>
    );
  }
  // дочь: ровная чёлка и пробор посередине
  return (
    <>
      <path
        d={`M ${P(-1.05, 0.1)} C ${P(-1.16, -1.25)} ${P(1.16, -1.25)} ${P(1.05, 0.1)} C ${P(0.98, -0.2)} ${P(0.86, -0.4)} ${P(0.62, -0.42)} C ${P(0.3, -0.44)} ${P(0.12, -0.36)} ${P(0, -0.4)} C ${P(-0.12, -0.36)} ${P(-0.3, -0.44)} ${P(-0.62, -0.42)} C ${P(-0.86, -0.4)} ${P(-0.98, -0.2)} ${P(-1.05, 0.1)} Z`}
        fill={look.hair}
      />
      <path d={`M ${P(0, -1.0)} L ${P(0, -0.5)}`} stroke={look.hairHi} strokeWidth={4} strokeLinecap="round" />
      <path d={`M ${P(-0.55, -0.88)} C ${P(-0.3, -1.0)} ${P(0.3, -1.0)} ${P(0.55, -0.88)}`} stroke={look.hairHi} strokeWidth={5} fill="none" strokeLinecap="round" />
    </>
  );
};

export const Head: React.FC<{ readonly uid: string; readonly look: Look; readonly face: Face; readonly accessory?: React.ReactNode }> = ({ uid, look, face, accessory }) => {
  const { headRx: rx, headRy: ry } = look.build;
  const child = look.child;
  const turn = Math.max(-1, Math.min(1, face.turn));
  const at = Math.abs(turn);
  const fx = turn * rx * 0.3;
  const chinX = turn * rx * 0.2;
  const faceD = `M ${f1(-rx)} ${f1(-ry * 0.1)} C ${f1(-rx)} ${f1(-ry * 1.28)} ${f1(rx)} ${f1(-ry * 1.28)} ${f1(rx)} ${f1(-ry * 0.1)} C ${f1(rx)} ${f1(ry * (child ? 0.62 : 0.5))} ${f1(chinX + rx * 0.52)} ${f1(ry * 0.98)} ${f1(chinX)} ${f1(ry)} C ${f1(chinX - rx * 0.52)} ${f1(ry * 0.98)} ${f1(-rx)} ${f1(ry * (child ? 0.62 : 0.5))} ${f1(-rx)} ${f1(-ry * 0.1)} Z`;

  const wide = Math.max(0, Math.min(1, face.wide));
  const laugh = Math.max(0, Math.min(1, face.laugh));
  const eyeY = ry * (child ? 0.1 : 0.04);
  const ew = rx * (child ? 0.25 : 0.23) * (1 + 0.12 * wide);
  const eh = ew * (child ? 1.0 : 0.8) * (1 + 0.22 * wide);
  const gap = rx * (child ? 0.44 : 0.42) * (1 - 0.12 * at);
  const L = Math.min(1, Math.max(face.lid * 0.55 * (1 - wide), face.blink));
  const squint = Math.max(0, face.smile - 0.55) * 0.9; // щёки подпирают глаза при улыбке
  const lw = child ? 4.5 : 5;

  const eyes = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const w = ew * (1 - 0.32 * far);
    const ex = fx + side * gap * (1 - 0.22 * far);
    const id = `${uid}-e${side}`;
    if (laugh > 0.5) {
      // смеющиеся глаза — дуги вверх
      return (
        <path
          key={side}
          d={`M ${f1(ex - w)} ${f1(eyeY + eh * 0.3)} Q ${f1(ex)} ${f1(eyeY - eh * 0.75)} ${f1(ex + w)} ${f1(eyeY + eh * 0.3)}`}
          stroke={INK}
          strokeWidth={lw + 0.5}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    if (L >= 0.82) {
      return (
        <path
          key={side}
          d={`M ${f1(ex - w)} ${f1(eyeY + eh * 0.05)} Q ${f1(ex)} ${f1(eyeY + eh * 0.55)} ${f1(ex + w)} ${f1(eyeY + eh * 0.05)}`}
          stroke={INK}
          strokeWidth={lw}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    const ir = eh * (child ? 0.8 : 0.76) * (1 - 0.3 * wide);
    const ix = ex + face.lookX * w * 0.42;
    const iy = eyeY + face.lookY * eh * 0.32 + L * eh * 0.15;
    const lidY = eyeY - eh + 2 * eh * L;
    const lowY = eyeY + eh - 2 * eh * squint * 0.45;
    return (
      <g key={side}>
        <defs>
          <clipPath id={id}>
            <ellipse cx={ex} cy={eyeY} rx={w} ry={eh} />
          </clipPath>
        </defs>
        <ellipse cx={ex} cy={eyeY} rx={w} ry={eh} fill="#FFFFFF" />
        <g clipPath={`url(#${id})`}>
          <circle cx={ix} cy={iy} r={ir} fill={look.iris} />
          <circle cx={ix} cy={iy} r={ir * 0.52} fill="#160E10" />
          <circle cx={ix - ir * 0.32} cy={iy - ir * 0.36} r={ir * 0.3} fill="#FFFFFF" />
          <circle cx={ix + ir * 0.3} cy={iy + ir * 0.3} r={ir * 0.12} fill="#FFFFFF" opacity={0.8} />
          {/* верхнее веко */}
          <rect x={ex - w - 2} y={eyeY - eh - 2} width={w * 2 + 4} height={Math.max(0, lidY - (eyeY - eh) + 2)} fill={look.skin} />
          {/* нижнее веко при улыбке */}
          {squint > 0.01 ? <rect x={ex - w - 2} y={lowY} width={w * 2 + 4} height={eh * 2} fill={look.skin} /> : null}
        </g>
        {/* линия ресниц по краю века */}
        {L < 0.12 ? (
          <path d={`M ${f1(ex - w)} ${f1(eyeY)} A ${f1(w)} ${f1(eh)} 0 0 1 ${f1(ex + w)} ${f1(eyeY)}`} stroke={INK} strokeWidth={lw} fill="none" strokeLinecap="round" />
        ) : (
          <path
            d={`M ${f1(ex - w * Math.sqrt(Math.max(0, 1 - ((lidY - eyeY) / eh) ** 2)) - 1)} ${f1(lidY)} Q ${f1(ex)} ${f1(lidY - 3)} ${f1(ex + w * Math.sqrt(Math.max(0, 1 - ((lidY - eyeY) / eh) ** 2)) + 1)} ${f1(lidY)}`}
            stroke={INK}
            strokeWidth={lw}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* ресницы у мамы и дочки */}
        {look.id !== "dad" && L < 0.5 ? (
          <path d={`M ${f1(ex + side * w * 0.9)} ${f1(eyeY - eh * 0.45)} l ${f1(side * 9)} ${f1(-7)}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        ) : null}
      </g>
    );
  });

  const brows = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const w = ew * (1 - 0.32 * far);
    const ex = fx + side * gap * (1 - 0.22 * far);
    const by = eyeY - eh - (child ? 16 : 15) - face.raise * 9 - wide * 8;
    const ix = ex - side * w * 0.85;
    const ox = ex + side * w * 1.05;
    const iy = by - face.worry * 10;
    const oy = by + face.worry * 3 + 3;
    const thick = look.id === "dad" ? 9 : child ? 7 : 6;
    return (
      <path
        key={side}
        d={`M ${f1(ix)} ${f1(iy)} Q ${f1((ix + ox) / 2)} ${f1(Math.min(iy, oy) - 6 + face.worry * 3)} ${f1(ox)} ${f1(oy)}`}
        stroke={look.brow}
        strokeWidth={thick}
        fill="none"
        strokeLinecap="round"
      />
    );
  });

  // рот: при смехе — открытая улыбка
  const m0 = face.mouth;
  const m = laugh > 0.05 && !m0.talking ? { ...m0, open: Math.max(m0.open, 0.55 * laugh), wide: Math.max(m0.wide, 0.6 * laugh) } : m0;
  const smile = Math.max(face.smile, laugh * 0.9);
  const mx = fx + turn * rx * 0.06;
  const my = ry * (child ? 0.6 : 0.58);
  const mw = rx * 0.28 * (1 - 0.35 * m.round + 0.1 * m.wide) * (1 + 0.15 * Math.max(0, smile));
  const oh = m.open * rx * (child ? 0.34 : 0.28) * (1 + 0.25 * m.round);
  const lift = smile * rx * 0.1;
  const sag = smile * rx * 0.12;
  let mouthEl: React.ReactNode;
  if (oh < 2.5) {
    mouthEl = (
      <path
        d={`M ${f1(mx - mw)} ${f1(my - lift)} Q ${f1(mx)} ${f1(my + sag)} ${f1(mx + mw)} ${f1(my - lift)}`}
        stroke={INK}
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
      />
    );
  } else {
    const top = my - lift * 0.4 - oh * 0.2;
    const d = `M ${f1(mx - mw)} ${f1(my - lift)} Q ${f1(mx)} ${f1(top - 2)} ${f1(mx + mw)} ${f1(my - lift)} Q ${f1(mx)} ${f1(my + oh + sag * 0.6)} ${f1(mx - mw)} ${f1(my - lift)} Z`;
    const cid = `${uid}-mouth`;
    mouthEl = (
      <g>
        <defs>
          <clipPath id={cid}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill="#5B2531" />
        <g clipPath={`url(#${cid})`}>
          <ellipse cx={mx} cy={my + oh * 0.9 + sag * 0.5} rx={mw * 0.7} ry={oh * 0.45} fill="#E27D7F" />
          {!child ? <rect x={mx - mw} y={top - 6} width={mw * 2} height={Math.min(7, oh * 0.3) + 6} fill="#FFFFFF" /> : null}
        </g>
        <path d={d} stroke={INK} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
      </g>
    );
  }

  const earX = rx * 0.97;
  return (
    <g>
      <HairBack look={look} turn={turn} />
      {([-1, 1] as const).map((side) => {
        const ex = side * earX - turn * rx * 0.24;
        const hide = side * turn < -0.55;
        if (hide) return null;
        return (
          <g key={side}>
            <ellipse cx={ex} cy={ry * 0.14} rx={rx * 0.16} ry={ry * 0.22} fill={look.skin} />
            <ellipse cx={ex + side * 2} cy={ry * 0.15} rx={rx * 0.07} ry={ry * 0.12} fill={look.skinShade} />
            {look.id === "mom" ? <circle cx={ex} cy={ry * 0.38} r={4.5} fill="#E8C066" /> : null}
          </g>
        );
      })}
      <path d={faceD} fill={look.skin} />
      {/* мягкая тень у подбородка */}
      <ellipse cx={chinX} cy={ry * 0.96} rx={rx * 0.42} ry={ry * 0.06} fill={look.skinShade} opacity={0.35} />
      {([-1, 1] as const).map((side) => (
        <ellipse
          key={side}
          cx={fx + side * gap * 1.22}
          cy={ry * 0.42}
          rx={rx * 0.19}
          ry={rx * 0.11}
          fill={look.blush}
          opacity={0.28 + 0.12 * Math.max(0, smile)}
        />
      ))}
      {eyes}
      {brows}
      <path
        d={`M ${f1(fx + turn * 6 - (child ? 4 : 6))} ${f1(ry * 0.34)} Q ${f1(fx + turn * 6)} ${f1(ry * 0.34 + (child ? 6 : 8))} ${f1(fx + turn * 6 + (child ? 4 : 6))} ${f1(ry * 0.34)}`}
        stroke={look.skinShade}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      {mouthEl}
      <HairFront look={look} turn={turn} />
      {accessory}
    </g>
  );
};
