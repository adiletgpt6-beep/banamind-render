// Ведущий канала — лошадка в тёмно-синем костюме, белой рубашке и зелёном
// галстуке. Персонаж собран из отдельных векторных частей:
//   голова (череп, светлая морда, ноздри, рот), глаза с веками и бликами,
//   брови, уши, чёлка и грива, шея, торс-пиджак, две руки из двух сегментов.
// Руки — ломаные линии плечо → локоть → копыто; поэтому при любой позе
// они остаются соединёнными с телом. Голова вращается вокруг шеи.
// Все параметры — числа, вычисленные из номера кадра (без случайности).
import React from "react";
import { C } from "../theme";

export type ArmPose = {
  /** отклонение плеча от вертикали вниз, градусы; + наружу, − к груди */
  shoulder: number;
  /** абсолютный угол предплечья, градусы (та же шкала) */
  fore: number;
};

export type HorseState = {
  armL: ArmPose; // рука с левой стороны экрана
  armR: ArmPose;
  headTilt: number; // градусы
  headTurn: number; // −1…1: взгляд/черты смещаются влево/вправо
  headNod: number; // px вниз
  brow: number; // −1 хмурится … +1 поднята
  browAsym: number; // 0…1 одна бровь выше (вопрос)
  blink: number; // 0 открыт … 1 закрыт
  gazeX: number; // −1…1
  gazeY: number;
  mouthOpen: number; // 0…1
  mouthRound: number; // 0…1 (о/у)
  smile: number; // −1…1
  earL: number; // градусы
  earR: number;
  breathe: number; // 0…1
};

const BROWN = "#8B5A34";
const BROWN_DARK = "#6E4426";
const MUZZLE = "#EDCFA6";
const MANE = "#3A2416";
const HOOF = "#3B2B22";

const rad = (d: number) => (d * Math.PI) / 180;

const SH_L = { x: 205, y: 668 };
const SH_R = { x: 495, y: 668 };
const UPPER = 118;
const FORE = 112;

const armPoints = (sh: { x: number; y: number }, side: -1 | 1, p: ArmPose) => {
  const e = { x: sh.x + side * Math.sin(rad(p.shoulder)) * UPPER, y: sh.y + Math.cos(rad(p.shoulder)) * UPPER };
  const h = { x: e.x + side * Math.sin(rad(p.fore)) * FORE, y: e.y + Math.cos(rad(p.fore)) * FORE };
  return { e, h };
};

const Arm: React.FC<{ side: -1 | 1; pose: ArmPose }> = ({ side, pose }) => {
  const sh = side < 0 ? SH_L : SH_R;
  const { e, h } = armPoints(sh, side, pose);
  // направление предплечья — для поворота манжеты и копыта
  const ang = (Math.atan2(h.y - e.y, h.x - e.x) * 180) / Math.PI;
  return (
    <g>
      <path
        d={`M ${sh.x} ${sh.y} L ${e.x} ${e.y} L ${h.x} ${h.y}`}
        stroke={C.suitDark}
        strokeWidth={64}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={`M ${sh.x} ${sh.y} L ${e.x} ${e.y} L ${h.x} ${h.y}`}
        stroke={C.suitArm}
        strokeWidth={56}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <g transform={`translate(${h.x} ${h.y}) rotate(${ang - 90})`}>
        {/* белая манжета */}
        <rect x={-29} y={-4} width={58} height={20} rx={8} fill={C.shirt} stroke="#D7DCE6" strokeWidth={2} />
        {/* копыто-ладонь */}
        <g transform="translate(0 10) scale(1.3) translate(0 -10)">
          <path d="M -24 12 C -26 40 -16 52 0 52 C 16 52 26 40 24 12 Z" fill={BROWN} />
          <path d="M -21 36 C -19 50 -10 56 0 56 C 10 56 19 50 21 36 C 12 41 -12 41 -21 36 Z" fill={HOOF} />
        </g>
      </g>
    </g>
  );
};

const Eye: React.FC<{ cx: number; cy: number; s: HorseState; id: string; flip: 1 | -1 }> = ({ cx, cy, s, id, flip }) => {
  const rx = 31;
  const ry = 37;
  const px = cx + s.gazeX * 10 + s.headTurn * 6;
  const py = cy + s.gazeY * 9 + 4;
  // верхнее веко опускается до нижнего края глаза
  const lidY = cy - ry - 4 + (2 * ry + 1) * Math.min(1, s.blink);
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 4} fill={BROWN_DARK} opacity={0.35} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={px} cy={py} rx={19} ry={22} fill="#2A1A12" />
        <ellipse cx={px} cy={py} rx={10} ry={12} fill="#120A06" />
        <circle cx={px - 7 * flip} cy={py - 9} r={6.5} fill="#FFFFFF" />
        <circle cx={px + 6 * flip} cy={py + 8} r={2.6} fill="#FFFFFF" opacity={0.85} />
        <rect x={cx - rx - 2} y={cy - ry - 10} width={2 * rx + 4} height={lidY - (cy - ry - 10)} fill={BROWN} />
        <path
          d={`M ${cx - rx - 2} ${lidY} Q ${cx} ${lidY + 6} ${cx + rx + 2} ${lidY}`}
          stroke={MANE}
          strokeWidth={4}
          fill="none"
        />
      </g>
    </g>
  );
};

const Ear: React.FC<{ x: number; y: number; angle: number; side: -1 | 1 }> = ({ x, y, angle, side }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M -26 10 C -30 -40 -12 -78 4 -92 C 18 -70 30 -36 26 10 Z" fill={BROWN} />
    <path d="M -14 4 C -16 -30 -6 -58 4 -72 C 12 -54 18 -28 15 4 Z" fill="#D9A27E" />
    <path d="M -26 10 C -30 -40 -12 -78 4 -92" stroke={BROWN_DARK} strokeWidth={3} fill="none" opacity={side ? 0.4 : 0} />
  </g>
);

const Mouth: React.FC<{ s: HorseState; cx: number; y: number }> = ({ s, cx, y }) => {
  const open = Math.max(0, Math.min(1, s.mouthOpen));
  const w = 62 - s.mouthRound * 22 + open * 10;
  const h = open * 50;
  const corner = -s.smile * 7;
  if (h < 4) {
    return (
      <path
        d={`M ${cx - w / 2} ${y + corner} Q ${cx} ${y + 9 + s.smile * 7} ${cx + w / 2} ${y + corner}`}
        stroke="#5A2E22"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const d = `M ${cx - w / 2} ${y + corner} Q ${cx} ${y - 3} ${cx + w / 2} ${y + corner} Q ${cx + w / 2 - 2} ${y + h} ${cx} ${y + h + 4} Q ${cx - w / 2 + 2} ${y + h} ${cx - w / 2} ${y + corner} Z`;
  return (
    <g>
      <clipPath id="horse-mouth">
        <path d={d} />
      </clipPath>
      <path d={d} fill="#4A1C1A" />
      <g clipPath="url(#horse-mouth)">
        <rect x={cx - w / 2} y={y - 4} width={w} height={8} fill="#FFFFFF" />
        <ellipse cx={cx} cy={y + h + 6} rx={w * 0.38} ry={h * 0.45 + 2} fill="#D96F6A" />
      </g>
      <path d={d} fill="none" stroke="#5A2E22" strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};

/** Персонаж во viewBox 700×1000; низ пиджака — нижний край. */
export const Horse: React.FC<{ s: HorseState; width: number }> = ({ s, width }) => {
  const t = s.headTurn;
  const breathe = 1 + s.breathe * 0.012;
  return (
    <svg viewBox="0 0 700 1000" width={width} height={(width * 1000) / 700} style={{ overflow: "visible", display: "block" }}>
      <g transform={`translate(350 1000) scale(1 ${breathe}) translate(-350 -1000)`}>
        {/* грива за шеей */}
        <path d="M 292 470 C 262 520 266 590 280 640 L 420 640 C 434 590 438 520 408 470 Z" fill={MANE} />
        {/* шея */}
        <path d="M 300 470 C 296 540 298 600 302 650 L 398 650 C 402 600 404 540 400 470 Z" fill={BROWN} />
        <path d="M 330 520 C 334 570 336 610 338 650 L 362 650 C 364 610 366 570 370 520 Z" fill={BROWN_DARK} opacity={0.25} />

        {/* пиджак */}
        <path
          d="M 172 720 C 172 662 214 632 272 618 L 428 618 C 486 632 528 662 528 720 L 552 1000 L 148 1000 Z"
          fill={C.suit}
        />
        {/* рубашка и галстук */}
        <path d="M 296 618 L 404 618 L 350 830 Z" fill={C.shirt} />
        <path d="M 338 650 L 362 650 L 374 800 L 350 830 L 326 800 Z" fill={C.green} />
        <path d="M 334 628 L 366 628 L 362 654 L 338 654 Z" fill={C.greenDark} />
        <path d="M 296 606 L 336 630 L 318 664 Z" fill={C.shirt} stroke="#D7DCE6" strokeWidth={3} strokeLinejoin="round" />
        <path d="M 404 606 L 364 630 L 382 664 Z" fill={C.shirt} stroke="#D7DCE6" strokeWidth={3} strokeLinejoin="round" />
        {/* лацканы */}
        <path d="M 290 620 L 350 842 L 318 760 L 300 700 L 258 650 Z" fill={C.lapel} />
        <path d="M 410 620 L 350 842 L 382 760 L 400 700 L 442 650 Z" fill={C.lapel} />
        <circle cx={350} cy={880} r={8} fill={C.suitDark} />
        <circle cx={350} cy={940} r={8} fill={C.suitDark} />
        <path d="M 432 760 L 482 754" stroke={C.suitDark} strokeWidth={5} strokeLinecap="round" />

        {/* голова: поворот вокруг шеи */}
        <g transform={`translate(${t * 10} ${s.headNod}) rotate(${s.headTilt} 350 560)`}>
          <Ear x={286 + t * 6} y={236} angle={-22 + s.earL} side={-1} />
          <Ear x={414 + t * 6} y={236} angle={22 + s.earR} side={1} />
          <path
            d="M 232 335 C 232 252 286 208 350 208 C 414 208 468 252 468 335 C 468 395 448 425 444 470 L 256 470 C 252 425 232 395 232 335 Z"
            fill={BROWN}
          />
          {/* светлая проточина и морда */}
          <path
            d={`M ${342 + t * 14} 262 C ${334 + t * 14} 320 ${322 + t * 12} 380 ${300 + t * 10} 430 L ${400 + t * 10} 430 C ${378 + t * 12} 380 ${366 + t * 14} 320 ${358 + t * 14} 262 Z`}
            fill={MUZZLE}
            opacity={0.95}
          />
          <ellipse cx={350 + t * 12} cy={482} rx={104} ry={76} fill={MUZZLE} />
          <ellipse cx={318 + t * 14} cy={468} rx={11} ry={15} fill="#5A3A2A" transform={`rotate(-14 ${318 + t * 14} 468)`} />
          <ellipse cx={382 + t * 14} cy={468} rx={11} ry={15} fill="#5A3A2A" transform={`rotate(14 ${382 + t * 14} 468)`} />
          <Mouth s={s} cx={350 + t * 13} y={516} />
          {/* щёки-румянец */}
          <ellipse cx={262 + t * 8} cy={418} rx={22} ry={12} fill="#E39C82" opacity={0.35} />
          <ellipse cx={438 + t * 8} cy={418} rx={22} ry={12} fill="#E39C82" opacity={0.35} />
          {/* глаза */}
          <Eye cx={293 + t * 12} cy={338} s={s} id="horse-eye-l" flip={1} />
          <Eye cx={407 + t * 12} cy={338} s={s} id="horse-eye-r" flip={-1} />
          {/* брови */}
          <g transform={`translate(${t * 12} ${-s.brow * 12})`}>
            <path
              d="M 262 282 Q 290 268 318 280"
              stroke={MANE}
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(${s.brow < 0 ? -s.brow * 10 : 0} 290 278)`}
            />
            <path
              d="M 382 280 Q 410 268 438 282"
              stroke={MANE}
              strokeWidth={9}
              strokeLinecap="round"
              fill="none"
              transform={`translate(0 ${-s.browAsym * 12}) rotate(${s.brow < 0 ? s.brow * 10 : 0} 410 278)`}
            />
          </g>
          {/* чёлка */}
          <path
            d={`M 300 226 C 312 196 352 188 376 200 C 398 210 404 232 396 252 C 384 240 370 238 362 250 C 356 270 338 286 ${326 + t * 8} 292 C 330 270 320 252 306 250 C 296 244 294 236 300 226 Z`}
            fill={MANE}
          />
        </g>

        {/* руки поверх пиджака */}
        <Arm side={-1} pose={s.armL} />
        <Arm side={1} pose={s.armR} />
      </g>
    </svg>
  );
};
