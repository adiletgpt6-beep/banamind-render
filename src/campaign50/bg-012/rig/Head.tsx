// Голова героя крупным планом: лицо с поворотом (черты смещаются к стороне
// взгляда), глаза с веками, морганием и бликами, подвижные брови, рот по
// фактической речи, румянец, причёска. Центр лица — (0, 0).
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
  mouth: { open: 0, round: 0, wide: 0, talking: false },
};

const f1 = (n: number) => n.toFixed(1);

const HairBack: React.FC<{ look: Look; turn: number }> = ({ look, turn }) => {
  const { headRx: rx, headRy: ry } = look.build;
  const sx = -turn * rx * 0.1;
  if (look.id === "mom") {
    // каре до подбородка, лежит за лицом
    return (
      <path
        d={`M ${f1(-rx * 1.14 + sx)} ${f1(ry * 0.62)} C ${f1(-rx * 1.36 + sx)} ${f1(-ry * 1.5)} ${f1(rx * 1.36 + sx)} ${f1(-ry * 1.5)} ${f1(rx * 1.14 + sx)} ${f1(ry * 0.62)} Q ${f1(rx * 1.05 + sx)} ${f1(ry * 0.92)} ${f1(rx * 0.72 + sx)} ${f1(ry * 0.86)} L ${f1(-rx * 0.72 + sx)} ${f1(ry * 0.86)} Q ${f1(-rx * 1.05 + sx)} ${f1(ry * 0.92)} ${f1(-rx * 1.14 + sx)} ${f1(ry * 0.62)} Z`}
        fill={look.hair}
      />
    );
  }
  return <ellipse cx={sx} cy={-ry * 0.3} rx={rx * 1.04} ry={ry * 0.98} fill={look.hair} />;
};

const HairFront: React.FC<{ look: Look; turn: number }> = ({ look, turn }) => {
  const { headRx: rx, headRy: ry } = look.build;
  const sx = turn * rx * 0.1;
  const P = (x: number, y: number) => `${f1(x * rx + sx)} ${f1(y * ry)}`;
  if (look.id === "mom") {
    // пробор слева, прядь мягко уходит вправо по лбу
    return (
      <>
        <path
          d={`M ${P(-1.08, 0.3)} C ${P(-1.2, -1.45)} ${P(1.2, -1.45)} ${P(1.08, 0.3)} C ${P(0.98, -0.1)} ${P(0.8, -0.42)} ${P(0.36, -0.46)} C ${P(0.02, -0.5)} ${P(-0.2, -0.58)} ${P(-0.3, -0.7)} C ${P(-0.55, -0.5)} ${P(-0.86, -0.3)} ${P(-1.06, 0.3)} Z`}
          fill={look.hair}
        />
        <path d={`M ${P(-0.1, -0.86)} C ${P(0.25, -0.94)} ${P(0.6, -0.84)} ${P(0.8, -0.6)}`} stroke={look.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
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
  // сын: взъерошенная чёлка и вихор
  return (
    <>
      <path
        d={`M ${P(-1.05, 0.12)} C ${P(-1.18, -1.1)} ${P(-0.5, -1.4)} ${P(0.05, -1.36)} L ${P(0.12, -1.55)} L ${P(0.3, -1.32)} C ${P(0.85, -1.26)} ${P(1.18, -0.9)} ${P(1.05, 0.12)} L ${P(0.92, -0.2)} L ${P(0.74, -0.34)} L ${P(0.66, -0.2)} L ${P(0.42, -0.46)} L ${P(0.28, -0.3)} L ${P(0.04, -0.5)} L ${P(-0.12, -0.32)} L ${P(-0.36, -0.52)} L ${P(-0.5, -0.32)} L ${P(-0.74, -0.46)} L ${P(-0.88, -0.18)} Z`}
        fill={look.hair}
        strokeLinejoin="round"
        stroke={look.hair}
        strokeWidth={6}
      />
      <path d={`M ${P(-0.4, -1.0)} C ${P(0, -1.22)} ${P(0.42, -1.14)} ${P(0.7, -0.92)}`} stroke={look.hairHi} strokeWidth={6} fill="none" strokeLinecap="round" />
    </>
  );
};

export const Head: React.FC<{ readonly uid: string; readonly look: Look; readonly face: Face }> = ({ uid, look, face }) => {
  const { headRx: rx, headRy: ry } = look.build;
  const child = look.child;
  const turn = Math.max(-1, Math.min(1, face.turn));
  const at = Math.abs(turn);
  const fx = turn * rx * 0.3;
  const chinX = turn * rx * 0.2;
  const faceD = `M ${f1(-rx)} ${f1(-ry * 0.1)} C ${f1(-rx)} ${f1(-ry * 1.28)} ${f1(rx)} ${f1(-ry * 1.28)} ${f1(rx)} ${f1(-ry * 0.1)} C ${f1(rx)} ${f1(ry * (child ? 0.62 : 0.5))} ${f1(chinX + rx * 0.52)} ${f1(ry * 0.98)} ${f1(chinX)} ${f1(ry)} C ${f1(chinX - rx * 0.52)} ${f1(ry * 0.98)} ${f1(-rx)} ${f1(ry * (child ? 0.62 : 0.5))} ${f1(-rx)} ${f1(-ry * 0.1)} Z`;

  const eyeY = ry * (child ? 0.1 : 0.04);
  const ew = rx * (child ? 0.25 : 0.23);
  const eh = ew * (child ? 1.0 : 0.8);
  const gap = rx * (child ? 0.44 : 0.42) * (1 - 0.12 * at);
  const L = Math.min(1, Math.max(face.lid * 0.55, face.blink));
  const squint = Math.max(0, face.smile - 0.55) * 0.9; // щёки подпирают глаза при улыбке
  const lw = child ? 4.5 : 5;

  const eyes = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const w = ew * (1 - 0.32 * far);
    const ex = fx + side * gap * (1 - 0.22 * far);
    const id = `${uid}-e${side}`;
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
    const ir = eh * (child ? 0.8 : 0.76);
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
      </g>
    );
  });

  const brows = ([-1, 1] as const).map((side) => {
    const far = Math.max(0, side * turn);
    const w = ew * (1 - 0.32 * far);
    const ex = fx + side * gap * (1 - 0.22 * far);
    const by = eyeY - eh - (child ? 16 : 15) - face.raise * 9;
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

  // рот
  const m = face.mouth;
  const mx = fx + turn * rx * 0.06;
  const my = ry * (child ? 0.6 : 0.58);
  const mw = rx * 0.28 * (1 - 0.35 * m.round + 0.1 * m.wide) * (1 + 0.15 * Math.max(0, face.smile));
  const oh = m.open * rx * (child ? 0.34 : 0.28) * (1 + 0.25 * m.round);
  const lift = face.smile * rx * 0.1;
  const sag = face.smile * rx * 0.12;
  let mouthEl: React.ReactNode;
  if (oh < 2.5) {
    mouthEl = (
      <path
        d={`M ${f1(mx - mw)} ${f1(my - lift)} Q ${f1(mx)} ${f1(my + sag)} ${f1(mx + mw)} ${f1(my - lift)}`}
        stroke={INK}
        strokeWidth={child ? 4.5 : 4.5}
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
      {/* мягкая тень под причёской и у подбородка */}
      <ellipse cx={chinX} cy={ry * 0.96} rx={rx * 0.42} ry={ry * 0.06} fill={look.skinShade} opacity={0.35} />
      {([-1, 1] as const).map((side) => (
        <ellipse
          key={side}
          cx={fx + side * gap * 1.22}
          cy={ry * 0.42}
          rx={rx * 0.19}
          ry={rx * 0.11}
          fill={look.blush}
          opacity={0.28 + 0.12 * Math.max(0, face.smile)}
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
    </g>
  );
};
