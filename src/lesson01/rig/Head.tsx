// Голова: 2.5D-поворот. Черты лица лежат на условной сфере и смещаются при
// повороте (глаза, нос, рот, уши), силуэт челюсти и подбородка следует за
// поворотом, борода повторяет линию челюсти. Масштаб головы не меняется.
import React from "react";
import { clamp, rad } from "./geom";
import { headMetrics } from "./headMetrics";
import { type Look, OUTLINE, OUTLINE_W } from "./looks";
import type { Face } from "./pose";

type Props = {
  look: Look;
  yaw: number;
  pitch: number;
  face: Face;
  uid: string;
};

const f = (n: number) => n.toFixed(2);

export const Head: React.FC<Props> = ({ look, yaw, pitch, face, uid }) => {
  const b = look.body;
  const { R, chinY, eyeY: eyeY0, noseY: noseY0, mouthY: mouthY0 } = headMetrics(look);
  const c = b.child;
  const yawA = yaw * 52;
  const py = pitch * R * 0.22;
  const eyeY = eyeY0 + py;
  const noseY = noseY0 + py * 1.1;
  const mouthY = mouthY0 + py * 1.15;
  const S = R * 0.94;
  const proj = (th: number) => S * Math.sin(rad(th + yawA));
  const vis = (th: number) => Math.cos(rad(th + yawA));
  const shape = look.faceShape;
  const chinX = Math.sin(rad(yawA)) * R * 0.3;
  const cw = R * (0.5 - 0.06 * shape + 0.08 * c);
  const jawY = chinY * (0.5 + 0.04 * shape);

  // Силуэт головы: череп + щёки + подбородок.
  const yr = Math.max(0, yaw);
  const yl = Math.max(0, -yaw);
  const rightJawX = R * (1 - 0.08 * yr + 0.02 * yl);
  const leftJawX = -R * (1 - 0.08 * yl + 0.02 * yr);
  const headPath = [
    `M ${f(-R)} 0`,
    `A ${f(R)} ${f(R)} 0 0 1 ${f(R)} 0`,
    `C ${f(rightJawX)} ${f(jawY)} ${f(chinX + cw * (1 - 0.35 * yr + 0.2 * yl))} ${f(chinY)} ${f(chinX)} ${f(chinY)}`,
    `C ${f(chinX - cw * (1 - 0.35 * yl + 0.2 * yr))} ${f(chinY)} ${f(leftJawX)} ${f(jawY)} ${f(-R)} 0`,
    "Z",
  ].join(" ");

  // ----- Уши -----
  const ear = (side: -1 | 1) => {
    const th = side * 98;
    const v = vis(th);
    const front = Math.abs(th + yawA) < 84;
    const x = proj(th) * 1.02;
    const w = R * 0.2 * look.earSize * (0.5 + 0.5 * Math.max(0, Math.cos(rad(Math.min(90, Math.abs(th + yawA))))));
    const h = R * 0.34 * look.earSize;
    const y = eyeY + R * 0.18;
    if (v < -0.55) return null;
    const out = side * (front ? -1 : 1);
    return {
      front,
      el: (
        <g key={`ear${side}`}>
          <ellipse cx={f(x + out * w * 0.25)} cy={f(y)} rx={f(w)} ry={f(h / 2)} fill={look.skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} />
          <path
            d={`M ${f(x + out * w * 0.2)} ${f(y - h * 0.25)} q ${f(out * w * 0.5)} ${f(h * 0.2)} 0 ${f(h * 0.45)}`}
            fill="none"
            stroke={look.skinShade}
            strokeWidth={OUTLINE_W * 0.9}
            strokeLinecap="round"
          />
        </g>
      ),
    };
  };
  const ears = look.hairStyle === "covered" ? [] : [ear(-1), ear(1)].filter(Boolean) as { front: boolean; el: React.ReactNode }[];

  // ----- Волосы -----
  const hairline = eyeY - R * (0.62 - 0.12 * c);
  const hairShift = Math.sin(rad(yawA)) * R * 0.28;
  const o = R * 0.06;
  const hx = (y: number) => Math.sqrt(Math.max(0, (R + o) * (R + o) - y * y));
  const sideY = eyeY - R * 0.05;
  const hairBack = (() => {
    if (look.hairStyle === "covered" || look.hairStyle === "buzz") return null;
    const extra = look.hairStyle === "curly" ? R * 0.14 : look.hairStyle === "wavy" ? R * 0.08 : R * 0.04;
    return <circle cx={f(-hairShift * 0.25)} cy={f(-R * 0.02)} r={f(R + extra)} fill={look.hair} stroke={OUTLINE} strokeWidth={OUTLINE_W} />;
  })();

  const fringe = (): string => {
    // линия роста волос от правого виска к левому через лоб
    const xr = hx(sideY);
    const st = look.hairStyle;
    const n = st === "spiky" ? 7 : st === "fringe" ? 6 : st === "curly" ? 8 : 4;
    const pts: string[] = [];
    const left = -xr * 0.98;
    const right = xr * 0.98;
    const temple = (side: number) => side * R * 0.78 + hairShift * 0.4;
    pts.push(`L ${f(right)} ${f(sideY)}`);
    pts.push(`Q ${f(temple(1) + R * 0.08)} ${f(sideY)} ${f(temple(1))} ${f(hairline + R * 0.12)}`);
    for (let i = 0; i < n; i++) {
      const x0 = temple(1) - ((temple(1) - temple(-1)) * i) / n;
      const x1 = temple(1) - ((temple(1) - temple(-1)) * (i + 1)) / n;
      const mid = (x0 + x1) / 2;
      const dip =
        st === "fringe"
          ? R * 0.16
          : st === "spiky"
            ? R * 0.14
            : st === "curly"
              ? R * 0.08
              : st === "sidepart"
                ? i === 0
                  ? R * 0.1
                  : R * 0.02
                : st === "wavy"
                  ? R * 0.1
                  : R * 0.06;
      const yBase = hairline + (st === "sidepart" ? (i / n) * R * 0.08 : 0);
      if (st === "spiky") pts.push(`L ${f(mid)} ${f(yBase + dip)} L ${f(x1)} ${f(yBase)}`);
      else pts.push(`Q ${f(mid)} ${f(yBase + dip * 1.6)} ${f(x1)} ${f(yBase)}`);
    }
    pts.push(`Q ${f(temple(-1) - R * 0.08)} ${f(sideY)} ${f(left)} ${f(sideY)}`);
    return pts.join(" ");
  };
  const hairFront = (() => {
    if (look.hairStyle === "covered") return null;
    if (look.kufi) return null; // виски и бакенбарды — часть бороды
    const xr = hx(sideY);
    const d = `M ${f(-xr)} ${f(sideY)} A ${f(R + o)} ${f(R + o)} 0 1 1 ${f(xr)} ${f(sideY)} ${fringe()} Z`;
    const buzz = look.hairStyle === "buzz";
    return (
      <g>
        <path d={d} fill={look.hair} stroke={buzz ? "none" : OUTLINE} strokeWidth={OUTLINE_W} strokeLinejoin="round" opacity={buzz ? 0.85 : 1} />
        {look.hairStyle === "sidepart" ? (
          <path
            d={`M ${f(-R * 0.35 + hairShift)} ${f(-R * 1.0)} Q ${f(-R * 0.3 + hairShift)} ${f(-R * 0.6)} ${f(-R * 0.42 + hairShift)} ${f(hairline + R * 0.05)}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={OUTLINE_W * 0.8}
            opacity={0.55}
          />
        ) : null}
        {/* мягкий блик */}
        <path
          d={`M ${f(-R * 0.5 + hairShift * 0.5)} ${f(-R * 0.82)} Q ${f(-R * 0.1 + hairShift * 0.5)} ${f(-R * 1.02)} ${f(R * 0.3 + hairShift * 0.5)} ${f(-R * 0.86)}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.14}
          strokeWidth={R * 0.09}
          strokeLinecap="round"
        />
      </g>
    );
  })();

  // ----- Тюбетейка -----
  const kufi = look.kufi
    ? (() => {
        const base = -R * 0.36;
        const dome = `M ${f(-R * 1.03)} ${f(base)} C ${f(-R * 1.0)} ${f(-R * 1.24)} ${f(R * 1.0)} ${f(-R * 1.24)} ${f(R * 1.03)} ${f(base)} Q 0 ${f(base - R * 0.12)} ${f(-R * 1.03)} ${f(base)} Z`;
        const id = `${uid}-kufi`;
        return (
          <g>
            <clipPath id={id}>
              <path d={dome} />
            </clipPath>
            <path d={dome} fill={look.kufi} />
            <g clipPath={`url(#${id})`}>
              {/* вышитая полоса по краю */}
              <path d={`M ${f(-R * 1.1)} ${f(base - R * 0.08)} Q 0 ${f(base - R * 0.24)} ${f(R * 1.1)} ${f(base - R * 0.08)}`} fill="none" stroke="#e4e1d6" strokeWidth={R * 0.2} />
              {Array.from({ length: 11 }, (_, k) => {
                const u = -1 + (k / 10) * 2 + Math.sin(rad(yawA)) * 0.18;
                const yy = base - R * 0.13 - (1 - u * u) * R * 0.08;
                return <path key={k} d={`M ${f(u * R - R * 0.05)} ${f(yy)} l ${f(R * 0.05)} ${f(-R * 0.05)} l ${f(R * 0.05)} ${f(R * 0.05)} l ${f(-R * 0.05)} ${f(R * 0.05)} Z`} fill="#cfcabd" />;
              })}
              {/* тонкий узор купола */}
              <path d={`M ${f(-R * 0.6 + hairShift * 0.3)} ${f(-R * 0.55)} Q ${f(hairShift * 0.3)} ${f(-R * 0.82)} ${f(R * 0.6 + hairShift * 0.3)} ${f(-R * 0.55)}`} fill="none" stroke="#e7e4da" strokeWidth={R * 0.03} />
              <path d={`M ${f(-R * 0.6)} ${f(-R * 0.62)} Q 0 ${f(-R * 1.25)} ${f(R * 0.6)} ${f(-R * 0.62)}`} fill="#f1efe7" opacity={0.6} />
            </g>
            <path d={dome} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinejoin="round" />
          </g>
        );
      })()
    : null;

  // ----- Платок (мама) -----
  const scarfBack = look.scarf ? (
    <path
      d={`M ${f(-R * 1.18)} ${f(-R * 0.1)} C ${f(-R * 1.25)} ${f(-R * 1.4)} ${f(R * 1.25)} ${f(-R * 1.4)} ${f(R * 1.18)} ${f(-R * 0.1)} C ${f(R * 1.22)} ${f(chinY * 0.9)} ${f(R * 0.9)} ${f(chinY + R * 0.5)} 0 ${f(chinY + R * 0.55)} C ${f(-R * 0.9)} ${f(chinY + R * 0.5)} ${f(-R * 1.22)} ${f(chinY * 0.9)} ${f(-R * 1.18)} ${f(-R * 0.1)} Z`}
      fill={look.scarf}
      stroke={OUTLINE}
      strokeWidth={OUTLINE_W}
    />
  ) : null;
  const scarfFront = look.scarf ? (
    <path
      d={`M ${f(-R * 1.0 + hairShift * 0.2)} ${f(eyeY + R * 0.3)} C ${f(-R * 0.95)} ${f(-R * 0.75)} ${f(R * 0.95)} ${f(-R * 0.75)} ${f(R * 1.0 + hairShift * 0.2)} ${f(eyeY + R * 0.3)} L ${f(R * 1.18)} ${f(-R * 0.1)} C ${f(R * 1.2)} ${f(-R * 1.3)} ${f(-R * 1.2)} ${f(-R * 1.3)} ${f(-R * 1.18)} ${f(-R * 0.1)} Z`}
      fill={look.scarf}
      stroke={OUTLINE}
      strokeWidth={OUTLINE_W}
      strokeLinejoin="round"
    />
  ) : null;

  // ----- Борода -----
  // Область бороды — часть головы ниже «линии бороды» (виски → скулы →
  // уголки рта → под нижней губой), обрезанная по силуэту головы, который
  // чуть продлён у подбородка. Поэтому борода всегда прилегает к лицу.
  const pc = (th: number) => S * Math.sin(rad(clamp(th + yawA, -90, 90)));
  const beardClipPath = [
    `M ${f(-R * 1.01)} ${f(-R * 0.4)}`,
    `L ${f(R * 1.01)} ${f(-R * 0.4)}`,
    `C ${f(rightJawX * 1.015)} ${f(jawY)} ${f(chinX + cw * 1.08 * (1 - 0.35 * yr + 0.2 * yl))} ${f(chinY + R * 0.09)} ${f(chinX)} ${f(chinY + R * 0.09)}`,
    `C ${f(chinX - cw * 1.08 * (1 - 0.35 * yl + 0.2 * yr))} ${f(chinY + R * 0.09)} ${f(leftJawX * 1.015)} ${f(jawY)} ${f(-R * 1.01)} ${f(-R * 0.4)}`,
    "Z",
  ].join(" ");
  const beard = look.beard
    ? (() => {
        const top = -R * 0.3;
        const cy = eyeY + R * 0.32;
        const mwB = R * 0.24 * (0.65 + 0.35 * Math.cos(rad(yawA)));
        const mx = Math.sin(rad(yawA)) * S * 0.86;
        const poly = [
          `M ${f(pc(-102))} ${f(top)}`,
          `L ${f(pc(-84))} ${f(top)}`,
          `L ${f(pc(-80))} ${f(cy)}`,
          `Q ${f(pc(-60))} ${f(noseY + R * 0.18)} ${f(Math.min(pc(-30), mx - mwB * 1.2))} ${f(mouthY + R * 0.02)}`,
          `Q ${f(mx)} ${f(mouthY + R * 0.3)} ${f(Math.max(pc(30), mx + mwB * 1.2))} ${f(mouthY + R * 0.02)}`,
          `Q ${f(pc(60))} ${f(noseY + R * 0.18)} ${f(pc(80))} ${f(cy)}`,
          `L ${f(pc(84))} ${f(top)}`,
          `L ${f(pc(102))} ${f(top)}`,
          `L ${f(R * 1.6)} ${f(top)} L ${f(R * 1.6)} ${f(chinY + R)} L ${f(-R * 1.6)} ${f(chinY + R)} L ${f(-R * 1.6)} ${f(top)} Z`,
        ].join(" ");
        const idC = `${uid}-bclip`;
        const idP = `${uid}-bpoly`;
        const mw = R * 0.3 * (0.65 + 0.35 * Math.cos(rad(yawA)));
        const must = `M ${f(mx - mw * 1.02)} ${f(mouthY - R * 0.03)} Q ${f(mx - mw * 0.55)} ${f(mouthY - R * 0.17)} ${f(mx)} ${f(mouthY - R * 0.12)} Q ${f(mx + mw * 0.55)} ${f(mouthY - R * 0.17)} ${f(mx + mw * 1.02)} ${f(mouthY - R * 0.03)} Q ${f(mx + mw * 0.5)} ${f(mouthY - R * 0.07)} ${f(mx)} ${f(mouthY - R * 0.05)} Q ${f(mx - mw * 0.5)} ${f(mouthY - R * 0.07)} ${f(mx - mw * 1.02)} ${f(mouthY - R * 0.03)} Z`;
        return {
          main: (
            <g>
              <clipPath id={idC}>
                <path d={beardClipPath} />
              </clipPath>
              <clipPath id={idP}>
                <path d={poly} />
              </clipPath>
              <g clipPath={`url(#${idC})`}>
                <path d={poly} fill={look.beard} />
              </g>
              <g clipPath={`url(#${idP})`}>
                <path d={beardClipPath} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} />
              </g>
            </g>
          ),
          must: <path d={must} fill={look.beard} />,
          sideburns: null,
        };
      })()
    : null;

  // ----- Глаза -----
  const ew = R * (0.29 + 0.07 * c);
  const ehBase = ew * (0.6 + 0.38 * c);
  const eyeOpen = clamp(face.eyeOpen, 0.4, 1.3);
  const eye = (side: -1 | 1) => {
    const th = side * (26 + 2 * c);
    const v = vis(th);
    if (v < 0.25) return null;
    const x = proj(th);
    const w = ew * Math.pow(v, 0.7);
    const eh = ehBase * eyeOpen * (1 - face.smile * 0.18);
    const top = eyeY - eh / 2;
    const bot = eyeY + eh / 2 - face.smile * eh * 0.08;
    const outer = side; // внешний уголок
    const almond = `M ${f(x - w / 2)} ${f(eyeY + (outer < 0 ? -eh * 0.06 : 0))} C ${f(x - w * 0.42)} ${f(top - eh * 0.15)} ${f(x + w * 0.42)} ${f(top - eh * 0.15)} ${f(x + w / 2)} ${f(eyeY + (outer > 0 ? -eh * 0.06 : 0))} C ${f(x + w * 0.4)} ${f(bot + eh * 0.12)} ${f(x - w * 0.4)} ${f(bot + eh * 0.12)} ${f(x - w / 2)} ${f(eyeY + (outer < 0 ? -eh * 0.06 : 0))} Z`;
    const id = `${uid}-eye${side}`;
    const ir = Math.min(w * 0.42, eh * 0.5) * (1 + 0.15 * c);
    const gx = x + face.gaze.x * w * 0.24 + Math.sin(rad(yawA)) * w * 0.12;
    const gy = eyeY + face.gaze.y * eh * 0.26 + eh * 0.04;
    // взгляд вниз — веки опускаются
    const lid = Math.max(clamp(face.blink), clamp((face.gaze.y - 0.45) * 0.7));
    const lidY = top - eh * 0.2 + (bot - top + eh * 0.35) * lid;
    return (
      <g key={`eye${side}`}>
        <clipPath id={id}>
          <path d={almond} />
        </clipPath>
        <path d={almond} fill="#fbfaf7" />
        <g clipPath={`url(#${id})`}>
          <circle cx={f(gx)} cy={f(gy)} r={f(ir)} fill={look.iris} />
          <circle cx={f(gx)} cy={f(gy)} r={f(ir * 0.52)} fill="#1a1110" />
          <circle cx={f(gx + ir * 0.35)} cy={f(gy - ir * 0.38)} r={f(ir * 0.26)} fill="#ffffff" opacity={0.95} />
          <circle cx={f(gx - ir * 0.3)} cy={f(gy + ir * 0.35)} r={f(ir * 0.11)} fill="#ffffff" opacity={0.7} />
          {lid > 0.01 ? <rect x={f(x - w)} y={f(top - eh)} width={f(w * 2)} height={f(Math.max(0, lidY - (top - eh)))} fill={look.skin} /> : null}
        </g>
        {lid > 0.85 ? (
          <path d={`M ${f(x - w / 2)} ${f(eyeY)} Q ${f(x)} ${f(eyeY + eh * 0.32)} ${f(x + w / 2)} ${f(eyeY)}`} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W * 1.3} strokeLinecap="round" />
        ) : (
          <>
            {/* верхнее веко — плотная линия ресниц */}
            <path
              d={`M ${f(x - w / 2 - w * 0.03)} ${f(eyeY + (outer < 0 ? -eh * 0.04 : 0))} C ${f(x - w * 0.42)} ${f(Math.max(top - eh * 0.15, lidY - eh * 0.15))} ${f(x + w * 0.42)} ${f(Math.max(top - eh * 0.15, lidY - eh * 0.15))} ${f(x + w / 2 + w * 0.03)} ${f(eyeY + (outer > 0 ? -eh * 0.04 : 0))}`}
              fill="none"
              stroke={OUTLINE}
              strokeWidth={OUTLINE_W * 1.5}
              strokeLinecap="round"
            />
            <path
              d={`M ${f(x - w * 0.36)} ${f(bot + eh * 0.04)} Q ${f(x)} ${f(bot + eh * 0.16)} ${f(x + w * 0.36)} ${f(bot + eh * 0.04)}`}
              fill="none"
              stroke={look.skinShade}
              strokeWidth={OUTLINE_W * 0.7}
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    );
  };

  // ----- Брови -----
  const brow = (side: -1 | 1) => {
    const th = side * 27;
    const v = vis(th);
    if (v < 0.2) return null;
    const x = proj(th);
    const w = ew * 1.12 * Math.pow(v, 0.7);
    const raise = side < 0 ? face.browL : face.browR;
    const by = eyeY - ehBase * (0.95 + 0.1 * c) - raise * R * 0.1 - (face.eyeOpen - 1) * R * 0.1;
    const inner = -side; // внутренний конец — к переносице
    const innerY = by - face.browIn * R * 0.08;
    const outerY = by + R * 0.02 + face.browIn * R * 0.02;
    const xi = x + (inner * w) / 2;
    const xo = x - (inner * w) / 2;
    return (
      <path
        key={`brow${side}`}
        d={`M ${f(xi)} ${f(innerY)} Q ${f(x)} ${f(Math.min(innerY, outerY) - R * 0.06)} ${f(xo)} ${f(outerY)}`}
        fill="none"
        stroke={look.brow}
        strokeWidth={R * 0.075 * look.browThick}
        strokeLinecap="round"
      />
    );
  };

  // ----- Нос -----
  const nx = Math.sin(rad(yawA)) * S * 1.0;
  const ns = R * 0.11 * look.noseSize * (1 - 0.3 * c);
  const nose =
    c > 0.5 ? (
      <path d={`M ${f(nx - ns * 0.7)} ${f(noseY)} Q ${f(nx)} ${f(noseY + ns * 0.8)} ${f(nx + ns * 0.7)} ${f(noseY)}`} fill="none" stroke={look.skinShade} strokeWidth={OUTLINE_W * 1.2} strokeLinecap="round" />
    ) : (
      <g>
        <path
          d={`M ${f(nx * 0.85)} ${f(eyeY + R * 0.28)} Q ${f(nx + Math.sign(yaw || 1) * ns * 0.4)} ${f(noseY - ns * 1.2)} ${f(nx + Math.sign(yaw || 1) * ns * 0.9)} ${f(noseY - ns * 0.1)}`}
          fill="none"
          stroke={look.skinShade}
          strokeWidth={OUTLINE_W}
          strokeLinecap="round"
          opacity={Math.min(1, Math.abs(yaw) * 3)}
        />
        <path d={`M ${f(nx - ns)} ${f(noseY)} Q ${f(nx)} ${f(noseY + ns * 0.9)} ${f(nx + ns)} ${f(noseY)}`} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinecap="round" />
      </g>
    );

  // ----- Рот -----
  const mx = Math.sin(rad(yawA)) * S * 0.86;
  const mwBase = R * (0.34 + 0.06 * c) * (0.62 + 0.38 * Math.cos(rad(yawA)));
  const open = clamp(face.mouthOpen);
  const mw = mwBase * (0.75 + 0.35 * face.mouthWide - 0.3 * face.mouthRound + 0.15 * face.smile);
  const mh = R * 0.32 * open * (1 + 0.25 * face.mouthRound);
  const sm = face.smile * R * 0.09;
  const mouth =
    open < 0.06 ? (
      <path
        d={`M ${f(mx - mw / 2)} ${f(mouthY - sm * 0.6)} Q ${f(mx)} ${f(mouthY + sm * 1.4)} ${f(mx + mw / 2)} ${f(mouthY - sm * 0.6)}`}
        fill="none"
        stroke={OUTLINE}
        strokeWidth={OUTLINE_W * 1.15}
        strokeLinecap="round"
      />
    ) : (
      (() => {
        const id = `${uid}-mouth`;
        const top = mouthY - mh * 0.3 - sm * 0.4;
        const bot = mouthY + mh * 0.7 + sm * 0.4;
        const d = `M ${f(mx - mw / 2)} ${f(mouthY - sm * 0.5)} Q ${f(mx)} ${f(top - mh * 0.15)} ${f(mx + mw / 2)} ${f(mouthY - sm * 0.5)} Q ${f(mx + mw * 0.42)} ${f(bot)} ${f(mx)} ${f(bot)} Q ${f(mx - mw * 0.42)} ${f(bot)} ${f(mx - mw / 2)} ${f(mouthY - sm * 0.5)} Z`;
        return (
          <g>
            <clipPath id={id}>
              <path d={d} />
            </clipPath>
            <path d={d} fill="#6b2b2b" />
            <g clipPath={`url(#${id})`}>
              <rect x={f(mx - mw / 2)} y={f(top - mh * 0.2)} width={f(mw)} height={f(mh * 0.28 * (1 - face.mouthRound * 0.6))} fill="#f7f3ec" />
              <ellipse cx={f(mx)} cy={f(bot + mh * 0.05)} rx={f(mw * 0.3)} ry={f(mh * 0.35)} fill="#c76a63" />
            </g>
            <path d={d} fill="none" stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinejoin="round" />
          </g>
        );
      })()
    );

  // ----- Щёки -----
  const cheeks = [-1, 1].map((side) => {
    const th = side * 44;
    const v = vis(th);
    if (v < 0.3) return null;
    return (
      <ellipse
        key={`ch${side}`}
        cx={f(proj(th))}
        cy={f(noseY + R * 0.05)}
        rx={f(R * 0.16 * v)}
        ry={f(R * 0.09)}
        fill="#e8826f"
        opacity={0.12 + 0.12 * c + face.smile * 0.06}
      />
    );
  });

  // тень под подбородком на шее рисует тело; здесь — лёгкая тень у линии волос
  return (
    <g>
      {scarfBack}
      {hairBack}
      {ears.filter((e) => !e.front).map((e) => e.el)}
      <path d={headPath} fill={look.skin} stroke={OUTLINE} strokeWidth={OUTLINE_W} strokeLinejoin="round" />
      {beard?.sideburns}
      {beard?.main}
      {ears.filter((e) => e.front).map((e) => e.el)}
      <clipPath id={`${uid}-face`}>
        <path d={headPath} />
      </clipPath>
      <g clipPath={`url(#${uid}-face)`}>{cheeks}</g>
      {eye(-1)}
      {eye(1)}
      {nose}
      {beard?.must}
      {mouth}
      {hairFront}
      {kufi}
      {scarfFront}
      {brow(-1)}
      {brow(1)}
    </g>
  );
};
