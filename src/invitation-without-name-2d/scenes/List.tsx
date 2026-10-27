// Сцена 12. Он хочет подготовиться. Сверху: Эмир пишет список карандашом
// (две стадии — время сжато монтажом, слова не появляются за секунду):
// «Кагаз», «Оюнчук машина», затем «Карандаш» и последняя галочка. Рядом —
// готовый сложенный мост и машинка; руки папы складывают книги-опоры в
// коробку. Без новой речи.
import { AbsoluteFill } from "remotion";
import { clamp, easeInOut, keys, keysV, anticipate } from "../rig/motion";
import { box, Paper, useScene } from "../kit";
import { C, F } from "../theme";
import { IW2_TEXT } from "../script";
import { CloseHand, SKIN, WritingHand } from "../props/CloseHand";
import { ToyCar } from "../props/ToyCar";

const SHEET = { x: 120, y: 760, w: 560, h: 720 } as const;
const ROW = (i: number) => SHEET.y + 190 + i * 140;
const FS = 64;
const WIDTH = (s: string) => s.length * FS * 0.6;

// Прогресс строк: стадия 1 (0…66) — две строки; стадия 2 (с 72) — третья
// строка и галочки.
const STAGE2 = 72;
// Интервалы письма (кадры сцены) — для звука карандаша.
export const LIST_PENCIL = [[4, 64], [STAGE2 + 4, STAGE2 + 58]] as const;
const rowProgress = (f: number, i: number) => {
  if (f >= STAGE2) return i < 2 ? 1 : clamp((f - STAGE2 - 4) / 30);
  return [clamp((f - 4) / 22), clamp((f - 30) / 34), 0][i];
};

export const ListScene: React.FC = () => {
  const { f } = useScene("list");
  const fade = f >= STAGE2 ? 1 - clamp((f - STAGE2) / 6) : 0;
  const rows = IW2_TEXT.list;
  // текущая строка и кончик карандаша — у края написанного
  const cur = f < STAGE2 ? (f < 30 ? 0 : 1) : 2;
  const prog = rowProgress(f, cur);
  const ticks = f >= STAGE2 + 40 ? [0, 1, 2].map((i) => clamp((f - STAGE2 - 40 - i * 6) / 6)) : [0, 0, 0];
  const tickTip = f >= STAGE2 + 40 ? Math.min(2, Math.floor((f - STAGE2 - 40) / 6)) : -1;
  const tip =
    tickTip >= 0
      ? { x: SHEET.x + 50, y: ROW(tickTip) - 10 }
      : { x: SHEET.x + 110 + WIDTH(rows[cur]) * easeInOut(prog), y: ROW(cur) - 16 + Math.sin(f * 1.7) * 6 };
  const box1 = keysV(f, [[STAGE2, { x: 980, y: 1700 }], [STAGE2 + 16, { x: 850, y: 1420 }], [STAGE2 + 34, { x: 870, y: 1560 }], [STAGE2 + 50, { x: 1100, y: 1800 }]], anticipate);
  return (
    <AbsoluteFill>
      <Paper color="#D9B27F" dots="rgba(23,23,23,0.04)" />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {/* готовый мост сверху: жёлоб с линиями сгиба, машинка рядом */}
        <g transform="translate(560 430) rotate(-4)">
          <rect x={-300} y={-70} width={600} height={140} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={3} />
          <rect x={-300} y={-70} width={600} height={34} fill="#ECE7DB" />
          <rect x={-300} y={36} width={600} height={34} fill="#ECE7DB" />
          <line x1={-296} y1={-36} x2={296} y2={-36} stroke={C.blue} strokeWidth={3} strokeDasharray="14 10" opacity={0.5} />
          <line x1={-296} y1={36} x2={296} y2={36} stroke={C.blue} strokeWidth={3} strokeDasharray="14 10" opacity={0.5} />
        </g>
        <ToyCar x={300} y={640} len={170} />
        {/* коробка для материалов */}
        <g transform="translate(860 1480)">
          <rect x={-170} y={-190} width={340} height={380} fill="#C79E6C" stroke="#A97F4E" strokeWidth={6} />
          <rect x={-150} y={-170} width={300} height={340} fill="#B88D5C" />
          {f >= STAGE2 + 16 ? <rect x={-110} y={-120} width={220} height={150} fill={C.navy} /> : null}
          {f >= STAGE2 + 16 ? <rect x={-100} y={-80} width={200} height={130} fill={C.coral} /> : null}
        </g>
        {f >= STAGE2 && f < STAGE2 + 52 ? <CloseHand x={box1.x} y={box1.y} angle={150} size={220} {...SKIN.azamat} shape="grip" armLen={5} /> : null}
        {/* лист списка */}
        <rect x={SHEET.x + 8} y={SHEET.y + 12} width={SHEET.w} height={SHEET.h} fill="rgba(23,23,23,0.12)" />
        <rect x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} fill={C.sheet} stroke={C.sheetEdge} strokeWidth={3} />
        {rows.map((r, i) => {
          const pr = rowProgress(f, i);
          return (
            <g key={r}>
              <defs>
                <clipPath id={`l12-${i}`}>
                  <rect x={SHEET.x + 100} y={ROW(i) - 80} width={WIDTH(r) * easeInOut(pr) + 10} height={110} />
                </clipPath>
              </defs>
              <text x={SHEET.x + 110} y={ROW(i)} fontFamily={F.text} fontWeight={500} fontSize={FS} fill={C.pencil} clipPath={`url(#l12-${i})`} transform={`rotate(${[-1, 0.6, -0.8][i]} ${SHEET.x + 110} ${ROW(i)})`}>
                {r}
              </text>
              <rect x={SHEET.x + 34} y={ROW(i) - 46} width={44} height={44} fill="none" stroke={C.navy} strokeWidth={4} />
              {ticks[i] > 0 ? <path d={`M ${SHEET.x + 40} ${ROW(i) - 26} l 12 14 l ${24 * ticks[i]} ${-30 * ticks[i]}`} stroke={C.coral} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
            </g>
          );
        })}
        <WritingHand tip={tip} size={200} skin={SKIN.emir} angle={150} lift={f > STAGE2 + 60 ? keys(f, [[STAGE2 + 60, 0], [STAGE2 + 70, 30]]) : 0} />
      </svg>
      {/* смена стадии: короткое затемнение листом */}
      <div style={box({ inset: 0, backgroundColor: C.paperWarm, opacity: fade * 0.9 })} />
    </AbsoluteFill>
  );
};
