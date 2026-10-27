// FINANCE HORSE rig — SVG half-body character, front view, drawn from
// design.ts proportions. Every part is a separate group with an anatomical
// pivot (ears at their base, head at the neck, arms at the shoulder/elbow,
// eyelids inside the eye) so the character never comes apart when it moves.
import type { CSSProperties } from "react";
import { HORSE, RIG } from "./design";
import type { Mouth } from "./lipsync";
import type { Pose } from "./pose";

const d2r = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// ---------------------------------------------------------------- arm
const Arm: React.FC<{
  readonly side: "L" | "R";
  readonly shoulder: number;
  readonly elbow: number;
  readonly hoof: number;
  readonly open: number;
  readonly breath: number;
}> = ({ side, shoulder, elbow, hoof, open, breath }) => {
  const s = side === "L" ? RIG.shoulderL : RIG.shoulderR;
  const sign = side === "L" ? 1 : -1;
  const sx = s.x;
  const sy = s.y - breath * 3;
  const upperAngle = 90 + sign * shoulder; // degrees, SVG orientation
  const foreAngle = upperAngle + sign * elbow; // bend brings the forearm up/outward
  const ex = sx + Math.cos(d2r(upperAngle)) * RIG.upperArm;
  const ey = sy + Math.sin(d2r(upperAngle)) * RIG.upperArm;
  const hx = ex + Math.cos(d2r(foreAngle)) * RIG.foreArm;
  const hy = ey + Math.sin(d2r(foreAngle)) * RIG.foreArm;
  const cuffX = ex + Math.cos(d2r(foreAngle)) * (RIG.foreArm - 26);
  const cuffY = ey + Math.sin(d2r(foreAngle)) * (RIG.foreArm - 26);
  const hoofAngle = foreAngle + 90 + sign * hoof * -1;
  const spread = 1 + 0.25 * open;
  return (
    <g>
      {/* sleeve: upper arm + forearm with a soft edge so it reads against the blazer */}
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={HORSE.blazerLine} strokeWidth="74" strokeLinecap="round" opacity="0.22" />
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={HORSE.blazer} strokeWidth="66" strokeLinecap="round" />
      <line x1={ex} y1={ey} x2={cuffX} y2={cuffY} stroke={HORSE.blazerLine} strokeWidth="68" strokeLinecap="round" opacity="0.22" />
      <line x1={ex} y1={ey} x2={cuffX} y2={cuffY} stroke={HORSE.blazer} strokeWidth="62" strokeLinecap="round" />
      <circle cx={ex} cy={ey} r="30" fill={HORSE.blazer} />
      {/* shirt cuff */}
      <line x1={cuffX - Math.cos(d2r(foreAngle)) * 10} y1={cuffY - Math.sin(d2r(foreAngle)) * 10} x2={cuffX} y2={cuffY} stroke={HORSE.shirt} strokeWidth="60" strokeLinecap="butt" />
      {/* hoof: fur wrist + dark hoof, pivot at the wrist */}
      <g style={{ transform: `translate(${hx}px, ${hy}px) rotate(${hoofAngle}deg)`, transformOrigin: "0 0" }}>
        <ellipse cx="0" cy="-14" rx={28 * spread} ry="22" fill={HORSE.fur} />
        <path d={`M ${-30 * spread} -6 Q ${-32 * spread} 30 ${-14 * spread} 38 L ${14 * spread} 38 Q ${32 * spread} 30 ${30 * spread} -6 Z`} fill={HORSE.hoof} />
        <path d={`M ${-30 * spread} -6 Q 0 4 ${30 * spread} -6`} stroke={HORSE.furShade} strokeWidth="4" fill="none" />
        {open > 0.3 ? <path d={`M 0 8 L 0 ${30 * open}`} stroke={HORSE.outline} strokeWidth="3" opacity={0.5 * open} strokeLinecap="round" /> : null}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- eye
const Eye: React.FC<{ readonly cx: number; readonly cy: number; readonly lookX: number; readonly lookY: number; readonly blink: number; readonly smile: number; readonly id: string }> = ({ cx, cy, lookX, lookY, blink, smile, id }) => {
  const rx = RIG.eyeRx;
  const ry = RIG.eyeRy;
  const close = clamp01(blink);
  const widen = Math.max(0, -blink);
  const lidY = cy - ry + close * ry * 2.05 - widen * 8;
  const lower = cy + ry - smile * 9; // smiling raises the lower lid
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={HORSE.eyeWhite} />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx={cx + lookX * 10} cy={cy + lookY * 8 + 2} r="17" fill={HORSE.iris} />
        <circle cx={cx + lookX * 10} cy={cy + lookY * 8 + 2} r="9" fill={HORSE.pupil} />
        <circle cx={cx + lookX * 10 - 6} cy={cy + lookY * 8 - 5} r="4.5" fill="#FFFFFF" opacity="0.9" />
        {/* upper lid */}
        <rect x={cx - rx - 4} y={lidY - ry * 2.2} width={rx * 2 + 8} height={ry * 2.2} fill={HORSE.lid} />
        {/* lower lid (squint on smile) */}
        <rect x={cx - rx - 4} y={lower} width={rx * 2 + 8} height={ry} fill={HORSE.lid} />
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={HORSE.outline} strokeWidth="3" opacity="0.55" />
      {/* lash line follows the lid */}
      <path d={`M ${cx - rx} ${lidY + 2} Q ${cx} ${lidY - 6} ${cx + rx} ${lidY + 2}`} stroke={HORSE.outline} strokeWidth="4" fill="none" strokeLinecap="round" opacity={0.75} />
    </g>
  );
};

// ---------------------------------------------------------------- mouth
const MouthShape: React.FC<{ readonly m: Mouth; readonly smile: number; readonly x: number; readonly y: number }> = ({ m, smile, x, y }) => {
  const halfW = Math.max(24, RIG.mouth.width * 0.5 * (0.78 + 0.32 * m.wide) * (1 - 0.42 * m.round));
  const h = m.open * RIG.mouth.maxOpen * (1 + 0.25 * m.round);
  const cornerY = y - smile * 9 + m.press * 1;
  if (h < 2.5) {
    // closed: a clean lip line, corners lifted by the smile
    return (
      <g>
        <path d={`M ${x - halfW} ${cornerY} Q ${x} ${y + 7 + smile * 7} ${x + halfW} ${cornerY}`} stroke={HORSE.lip} strokeWidth={4 + m.press * 2} fill="none" strokeLinecap="round" />
        <path d={`M ${x - halfW * 0.7} ${y + 12 + smile * 5} Q ${x} ${y + 17 + smile * 7} ${x + halfW * 0.7} ${y + 12 + smile * 5}`} stroke={HORSE.muzzleShade} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
      </g>
    );
  }
  const top = y - h * 0.32;
  const bottom = y + h * 0.72;
  const path = `M ${x - halfW} ${cornerY} Q ${x} ${top - 4} ${x + halfW} ${cornerY} Q ${x + halfW * 0.9} ${bottom} ${x} ${bottom + 4} Q ${x - halfW * 0.9} ${bottom} ${x - halfW} ${cornerY} Z`;
  const teethH = Math.min(12, h * 0.38) * clamp01(m.teeth);
  const tongueR = clamp01(m.tongue);
  return (
    <g>
      <defs>
        <clipPath id="horse-mouth-clip">
          <path d={path} />
        </clipPath>
      </defs>
      <path d={path} fill={HORSE.mouthInside} />
      <g clipPath="url(#horse-mouth-clip)">
        {teethH > 0.5 ? <rect x={x - halfW} y={top - 6} width={halfW * 2} height={teethH + 6} fill={HORSE.teeth} /> : null}
        {tongueR > 0.05 ? <ellipse cx={x} cy={bottom + 2} rx={halfW * 0.55} ry={h * 0.28 * tongueR + 2} fill={HORSE.tongue} /> : null}
      </g>
      <path d={path} fill="none" stroke={HORSE.lip} strokeWidth="4" strokeLinejoin="round" />
    </g>
  );
};

// ---------------------------------------------------------------- rig
export const HorseRig: React.FC<{ readonly pose: Pose; readonly mouth: Mouth; readonly width?: number; readonly style?: CSSProperties; readonly shadow?: boolean }> = ({ pose, mouth, width = RIG.width, style, shadow = true }) => {
  const turn = Math.max(-1, Math.min(1, pose.headTurn));
  const nod = pose.headNod;
  const breath = pose.breath;
  const fx = turn * 20; // feature parallax
  const mx = turn * 34; // muzzle parallax
  const fy = nod * 0.55;
  const jaw = mouth.open * 9;
  const muzzleCx = RIG.muzzle.cx + mx;
  const muzzleCy = RIG.muzzle.cy + fy + 2;
  return (
    <svg width={width} viewBox={`0 0 ${RIG.width} ${RIG.height}`} style={{ overflow: "visible", ...style }} fill="none">
      {shadow ? <ellipse cx="300" cy="905" rx="250" ry="16" fill="#151820" opacity="0.10" /> : null}
      {/* ---------------- body (breathing: shoulders rise, chest expands) */}
      <g style={{ transform: `translate(${pose.shift}px, 0) rotate(${pose.lean}deg) scaleY(${1 + breath * 0.012})`, transformOrigin: "300px 900px" }}>
        {/* neck (behind collar) */}
        <path d="M 236 470 L 364 470 L 372 640 L 228 640 Z" fill={HORSE.fur} />
        <path d="M 236 470 L 364 470 L 372 640 L 228 640 Z" fill={HORSE.furShade} opacity="0.35" style={{ clipPath: "inset(0 0 0 62%)" }} />
        {/* blazer body */}
        <path d="M 72 660 Q 90 600 170 596 L 250 596 L 300 790 L 350 596 L 430 596 Q 510 600 528 660 L 540 900 L 60 900 Z" fill={HORSE.blazer} />
        <path d="M 72 660 Q 90 600 170 596 L 250 596 L 300 790 L 300 900 L 60 900 Z" fill={HORSE.blazerLight} opacity="0.35" />
        {/* shirt */}
        <path d="M 232 596 L 368 596 L 300 800 Z" fill={HORSE.shirt} />
        <path d="M 300 596 L 368 596 L 300 800 Z" fill={HORSE.shirtShade} opacity="0.7" />
        {/* collar */}
        <path d="M 236 586 L 300 640 L 364 586 L 356 610 L 300 668 L 244 610 Z" fill={HORSE.shirt} stroke={HORSE.shirtShade} strokeWidth="2" />
        {/* tie */}
        <path d="M 284 612 L 316 612 L 306 632 L 326 760 Q 300 790 274 760 L 294 632 Z" fill={HORSE.tie} />
        <path d="M 300 632 L 326 760 Q 300 790 300 786 Z" fill={HORSE.tieDark} opacity="0.5" />
        <path d="M 284 612 L 316 612 L 306 632 L 294 632 Z" fill={HORSE.tieDark} />
        {/* gold tie bar */}
        <rect x="282" y="706" width="36" height="8" rx="3" fill={HORSE.gold} />
        {/* lapels */}
        <path d="M 250 596 L 300 790 L 232 680 L 212 600 Z" fill={HORSE.blazerLight} />
        <path d="M 350 596 L 300 790 L 368 680 L 388 600 Z" fill={HORSE.blazerLight} />
        <path d="M 212 600 L 232 680 L 300 790" stroke={HORSE.blazerLine} strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M 388 600 L 368 680 L 300 790" stroke={HORSE.blazerLine} strokeWidth="3" fill="none" opacity="0.6" />
        {/* pocket square */}
        <path d="M 430 640 L 470 640 L 466 652 L 434 652 Z" fill={HORSE.shirt} opacity="0.95" />
        {/* arms */}
        <Arm side="L" shoulder={pose.armLShoulder} elbow={pose.armLElbow} hoof={pose.armLHoof} open={pose.armLOpen} breath={breath} />
        <Arm side="R" shoulder={pose.armRShoulder} elbow={pose.armRElbow} hoof={pose.armRHoof} open={pose.armROpen} breath={breath} />
      </g>

      {/* ---------------- head (pivot at the neck) */}
      <g style={{ transform: `translate(${pose.shift * 0.6 + turn * 6}px, ${nod * 0.9 - breath * 2}px) rotate(${pose.headTilt}deg)`, transformOrigin: `${RIG.neck.x}px ${RIG.neck.y}px` }}>
        {/* mane behind the head */}
        <path d={`M ${250 - turn * 8} 150 Q 200 60 300 70 Q 420 60 400 170 Q 440 230 420 330 Q 430 420 405 470 Q 380 440 392 330 Q 360 250 330 200 Q 300 160 250 150 Z`} fill={HORSE.mane} />
        {/* ears (pivot at base) */}
        <g style={{ transform: `translate(${RIG.earL.x - turn * 10}px, ${RIG.earL.y}px) rotate(${-pose.earL - 8}deg)`, transformOrigin: "0 0" }}>
          <path d="M -26 10 Q -40 -70 -2 -112 Q 36 -70 26 12 Z" fill={HORSE.fur} stroke={HORSE.outline} strokeWidth="3" strokeLinejoin="round" />
          <path d="M -12 2 Q -18 -56 -2 -84 Q 16 -56 12 2 Z" fill={HORSE.innerEar} />
        </g>
        <g style={{ transform: `translate(${RIG.earR.x - turn * 10}px, ${RIG.earR.y}px) rotate(${pose.earR + 8}deg)`, transformOrigin: "0 0" }}>
          <path d="M -26 10 Q -36 -70 2 -112 Q 40 -70 26 12 Z" fill={HORSE.fur} stroke={HORSE.outline} strokeWidth="3" strokeLinejoin="round" />
          <path d="M -12 2 Q -16 -56 2 -84 Q 18 -56 12 2 Z" fill={HORSE.innerEar} />
        </g>
        {/* head */}
        <g style={{ transform: `translate(${turn * 4}px, 0)` }}>
          <path d="M 300 118 Q 420 118 436 250 Q 446 340 420 430 Q 400 540 300 566 Q 200 540 180 430 Q 154 340 164 250 Q 180 118 300 118 Z" fill={HORSE.fur} stroke={HORSE.outline} strokeWidth="3.5" />
          {/* cheek shading */}
          <path d="M 420 300 Q 446 360 418 440 Q 400 520 330 556 Q 404 500 404 420 Q 418 350 420 300 Z" fill={HORSE.furShade} opacity="0.4" />
          <path d="M 180 300 Q 154 360 182 440 Q 200 520 270 556 Q 196 500 196 420 Q 182 350 180 300 Z" fill={HORSE.furLight} opacity="0.35" />
        </g>
        {/* muzzle (jaw drops with the mouth) */}
        <g style={{ transform: `translate(${muzzleCx}px, ${muzzleCy}px)` }}>
          <ellipse cx="0" cy={jaw * 0.5} rx={RIG.muzzle.rx} ry={RIG.muzzle.ry + jaw * 0.6} fill={HORSE.muzzle} stroke={HORSE.outline} strokeWidth="3" opacity="1" />
          <ellipse cx="-14" cy={-30 + jaw * 0.2} rx="86" ry="60" fill="#FFFFFF" opacity="0.14" />
          {/* nostrils */}
          <ellipse cx="-44" cy="-36" rx="10" ry="14" fill={HORSE.nostril} style={{ transform: "rotate(18deg)", transformOrigin: "-44px -36px" }} />
          <ellipse cx="44" cy="-36" rx="10" ry="14" fill={HORSE.nostril} style={{ transform: "rotate(-18deg)", transformOrigin: "44px -36px" }} />
          <MouthShape m={mouth} smile={pose.smile} x={0} y={RIG.mouth.y - RIG.muzzle.cy + jaw * 0.9} />
        </g>
        {/* eyes & brows */}
        <g style={{ transform: `translate(${fx}px, ${fy}px)` }}>
          <Eye id="horse-eye-l" cx={RIG.eyeL.x} cy={RIG.eyeL.y} lookX={pose.lookX} lookY={pose.lookY} blink={pose.blink} smile={pose.smile} />
          <Eye id="horse-eye-r" cx={RIG.eyeR.x} cy={RIG.eyeR.y} lookX={pose.lookX} lookY={pose.lookY} blink={pose.blink} smile={pose.smile} />
          <path
            d="M 196 214 Q 230 196 262 206"
            stroke={HORSE.brow}
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
            style={{ transform: `translate(0, ${-pose.browL * 16}px) rotate(${-pose.browTiltL}deg)`, transformOrigin: "200px 214px" }}
          />
          <path
            d="M 404 214 Q 370 196 338 206"
            stroke={HORSE.brow}
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
            style={{ transform: `translate(0, ${-pose.browR * 16}px) rotate(${pose.browTiltR}deg)`, transformOrigin: "400px 214px" }}
          />
        </g>
        {/* forelock in front of the forehead */}
        <path d={`M ${262 + turn * 3} 128 Q 230 150 250 206 Q 262 170 284 150 Q 290 180 316 190 Q 306 150 330 136 Q 300 112 262 128 Z`} fill={HORSE.mane} />
        <path d={`M ${262 + turn * 3} 128 Q 240 146 252 190 Q 262 160 282 148 Z`} fill={HORSE.maneLight} opacity="0.6" />
      </g>
    </svg>
  );
};
