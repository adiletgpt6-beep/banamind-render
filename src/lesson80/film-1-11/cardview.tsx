// Карточка-напоминание: содержимое (единицы 300 × 200) и крупный план сверху.
// Листик и надпись «Проверить» / «росток» проявляются только до кончика
// карандаша (штрих листика — по длине пути, строки — по ширине, clipPath);
// до начала работы карточка чистая. Крупный план — вид сверху на стол перед
// Билалом: его правая рука с зелёным карандашом (рукав зелёной рубашки),
// левая придерживает карточку; рядом — стопка чистых карточек.
import { fontFamily } from "../../fonts";
import { box } from "../core/shots";
import { castById } from "./cast";
import { CARD_FONT, CARD_INK, CARD_LAYOUT, CARD_UNITS, cardReveal, cardTip, LEAF_LENGTHS, LEAF_PATHS } from "./card";
import type { Choreo } from "./choreo";

export const ReminderCardContent: React.FC<{ readonly progress: number; readonly uid: string }> = ({ progress, uid }) => {
  const r = cardReveal(progress);
  const lines = [r.line1, r.line2];
  return (
    <>
      <rect x={0} y={0} width={CARD_UNITS.w} height={CARD_UNITS.h} rx={8} fill="#FFFDF6" stroke="#D8D0BE" strokeWidth={2} />
      <rect x={8} y={8} width={CARD_UNITS.w - 16} height={CARD_UNITS.h - 16} rx={5} fill="none" stroke="#EEE7D7" strokeWidth={1.5} />
      {/* листик: контур одним штрихом и прожилка */}
      {[r.leaf, r.rib].map((k, i) =>
        k > 0 ? (
          <path
            key={i}
            d={LEAF_PATHS[i]}
            fill="none"
            stroke={CARD_INK}
            strokeWidth={i === 0 ? 5 : 3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${k * LEAF_LENGTHS[i]} ${LEAF_LENGTHS[i] + 10}`}
          />
        ) : null,
      )}
      {/* лёгкая заливка листика после контура (несколько штрихов карандаша) */}
      {r.rib >= 1 ? <path d={LEAF_PATHS[0]} fill="#7FB86A" opacity={0.28} stroke="none" /> : null}
      {CARD_LAYOUT.map((l, i) =>
        lines[i] > 0.5 ? (
          <g key={i}>
            <clipPath id={`${uid}-line${i}`}>
              <rect x={l.x - 3} y={l.y - CARD_FONT} width={lines[i] + 4} height={CARD_FONT * 1.45} />
            </clipPath>
            <text x={l.x} y={l.y} fontFamily={fontFamily} fontSize={CARD_FONT} fontWeight={700} fill={CARD_INK} textLength={l.len} lengthAdjust="spacingAndGlyphs" clipPath={`url(#${uid}-line${i})`}>
              {l.text}
            </text>
          </g>
        ) : null,
      )}
    </>
  );
};

const GREEN_PENCIL = { body: "#3E8E52", edge: "#2C6B3C", wood: "#E8D2A6", lead: "#2E6B3C", cap: "#E2E2DC" } as const;

export const CardView: React.FC<{ readonly f: number; readonly ch: Choreo; readonly finished?: boolean }> = ({ f, ch, finished = false }) => {
  const prog = finished ? 1 : ch.progress(f);
  const pen = ch.pencil(f);
  const showHand = !finished && pen.inHand;
  const k = 3.7;
  const sx = 960 - (CARD_UNITS.w * k) / 2;
  const sy = 540 - (CARD_UNITS.h * k) / 2 - 40;
  const tip = cardTip(prog);
  const tipX = sx + tip.x * k;
  const tipY = sy + tip.y * k;
  const lift = 18 * pen.lift;
  const bilal = castById("bilal").look;
  const sleeve = bilal.topColor;
  const sleeveShade = bilal.topShade;
  const skin = bilal.skin;
  const skinShade = bilal.skinShade;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: "#8F6A47" })}>
      <svg width={1920} height={1080}>
        <rect x={0} y={0} width={1920} height={1080} fill="#A97C52" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M 0 ${50 + i * 90} Q 960 ${30 + i * 90 + (i % 3) * 18} 1920 ${60 + i * 90}`} stroke="#6E4C31" strokeOpacity={0.15} strokeWidth={3} fill="none" />
        ))}
        {/* стопка чистых карточек справа — та же обстановка, что на столе */}
        <g transform="translate(1440 140) rotate(4) scale(1.15)">
          <rect x={6} y={6} width={300} height={200} rx={8} fill="#F3EEE2" stroke="#D8D0BE" strokeWidth={2} />
          <rect x={0} y={0} width={300} height={200} rx={8} fill="#FFFDF6" stroke="#D8D0BE" strokeWidth={2} />
        </g>
        <g transform={`translate(${sx} ${sy}) rotate(-1.5) scale(${k})`} style={{ filter: "drop-shadow(0 6px 6px rgba(0,0,0,0.22))" }}>
          <ReminderCardContent progress={prog} uid="cardview" />
        </g>
        {/* левая рука Билала придерживает карточку слева */}
        {!finished ? (
          <g transform={`translate(${sx - 40} ${sy + CARD_UNITS.h * k * 0.62}) rotate(-62)`}>
            <rect x={-72} y={40} width={144} height={300} rx={46} fill={sleeve} />
            <rect x={-72} y={40} width={36} height={300} rx={18} fill={sleeveShade} opacity={0.35} />
            <ellipse cx={0} cy={0} rx={60} ry={72} fill={skin} stroke={skinShade} strokeWidth={2} />
            <ellipse cx={-30} cy={-58} rx={15} ry={38} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(-12 -30 -58)" />
            <ellipse cx={-4} cy={-70} rx={15} ry={42} fill={skin} stroke={skinShade} strokeWidth={2} />
            <ellipse cx={22} cy={-64} rx={14} ry={38} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(10 22 -64)" />
          </g>
        ) : null}
        {showHand ? (
          // правая рука Билала держит карандаш у кончика: корпус карандаша
          // уходит вниз-вправо к ладони, рукав — ещё ниже справа
          <g transform={`translate(${tipX} ${tipY - lift}) rotate(-34)`}>
            <rect x={-70} y={250} width={140} height={300} rx={46} fill={sleeve} />
            <rect x={34} y={250} width={36} height={300} rx={18} fill={sleeveShade} opacity={0.35} />
            <rect x={-9} y={24} width={18} height={232} fill={GREEN_PENCIL.body} stroke={GREEN_PENCIL.edge} strokeWidth={2} />
            <rect x={-9} y={252} width={18} height={12} fill={GREEN_PENCIL.cap} />
            <path d="M -9 24 L 0 -2 L 9 24 Z" fill={GREEN_PENCIL.wood} />
            <path d="M -3 8 L 0 -2 L 3 8 Z" fill={GREEN_PENCIL.lead} />
            {/* ладонь и пальцы, обхватывающие карандаш */}
            <ellipse cx={34} cy={190} rx={66} ry={82} fill={skin} stroke={skinShade} strokeWidth={2} />
            <ellipse cx={-16} cy={96} rx={17} ry={44} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(12 -16 96)" />
            <ellipse cx={20} cy={84} rx={18} ry={42} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(-10 20 84)" />
            <ellipse cx={52} cy={110} rx={16} ry={36} fill={skin} stroke={skinShade} strokeWidth={2} transform="rotate(-24 52 110)" />
            <rect x={-60} y={238} width={128} height={26} rx={10} fill={skin} />
          </g>
        ) : null}
        {!showHand && (finished || prog >= 1) ? (
          <g transform={`translate(${sx + CARD_UNITS.w * k + 90} ${sy + 160}) rotate(-72)`}>
            <rect x={-9} y={-252} width={18} height={228} fill={GREEN_PENCIL.body} stroke={GREEN_PENCIL.edge} strokeWidth={2} />
            <path d="M -9 -24 L 0 2 L 9 -24 Z" fill={GREEN_PENCIL.wood} />
            <path d="M -3 -8 L 0 2 L 3 -8 Z" fill={GREEN_PENCIL.lead} />
            <rect x={-9} y={-262} width={18} height={12} fill={GREEN_PENCIL.cap} />
          </g>
        ) : null}
      </svg>
    </div>
  );
};
