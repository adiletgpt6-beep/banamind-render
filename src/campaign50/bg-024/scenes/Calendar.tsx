// Сцена 3 (≈18–31 с): «Баштапкы топ издөө: 2 жумага чейин». Детали
// пазла складываются в календарь из 14 маленьких клеток. Над клетками —
// скобка «…чейин» (верхняя граница, а не дата старта); по клеткам мягко
// ходит лупа поиска, подсветка не заполняет все 14 дней и не ставит флажок
// на 14-й день. На словах «Бул — … убада эмес» плашка «Эртең — старт»
// зачёркивается, появляется честная подпись.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, easeInOut, easeOut } from "../anim";
import { useLine, useWordAt } from "../context";
import { C } from "../palette";
import { Backdrop, Pill } from "../parts";
import { BG24_TEXT } from "../script";

const CELL = 96;
const GAP = 14;
const GX = 162;
const GY = 700;

export const CalendarScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG24_TEXT.calendar;
  const n03 = useLine("n03");
  const promise = useWordAt("n03", 9); // «Бул»
  const range = useWordAt("n03", 4); // «эки жумага чейин»
  const cells = Array.from({ length: t.days }, (_, i) => i);
  const pos = (i: number) => ({ x: GX + (i % 7) * (CELL + GAP), y: GY + Math.floor(i / 7) * (CELL + GAP) });
  // лупа: мягко ходит по клеткам туда-обратно (поиск, без «дня старта»)
  const span = Math.max(60, n03.to - 20);
  const p = (f % span) / span;
  const sweep = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
  const lensX = GX + 40 + sweep * (6 * (CELL + GAP));
  const lensY = GY + 50 + Math.sin(f / 14) * 55 + 55;
  const bracket = easeInOut((f - range + 2) / 18);
  const strike = easeInOut((f - promise - 6) / 14);
  const note = appear(f, promise + 10, 14);
  const sub = appear(f, promise + 34, 14);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <Backdrop tone="warm" drift={-f * 0.4} />
      <div style={{ position: "absolute", left: 90, right: 150, top: 290, textAlign: "center", opacity: appear(f, 0, 10) }}>
        <div style={{ fontSize: 46, fontWeight: 800, color: C.ink }}>{t.title}</div>
        <div style={{ marginTop: 10, fontSize: 92, fontWeight: 900, lineHeight: 1, opacity: 0.25 + 0.75 * appear(f, range - 4, 10) }}>{t.range}</div>
      </div>
      {/* скобка «до» над всеми 14 клетками */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d={`M ${GX} ${GY - 24} V ${GY - 44} H ${GX + 7 * CELL + 6 * GAP} V ${GY - 24}`}
          fill="none"
          stroke={C.navy}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${1000 * bracket} 2000`}
        />
      </svg>
      {cells.map((i) => {
        const { x, y } = pos(i);
        const a = easeOut((f - 4 - i * 2) / 10);
        // подсветка идёт мягкой волной вместе с лупой, не накапливаясь
        const near = Math.max(0, 1 - Math.abs(x + CELL / 2 - lensX) / 170) * (Math.floor(i / 7) === 0 ? 1 : 0.7);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y + (1 - a) * 40,
              width: CELL,
              height: CELL,
              borderRadius: 20,
              border: `4px solid ${near > 0.3 ? C.yellow : C.line}`,
              backgroundColor: `rgba(255,201,14,${0.12 + near * 0.35})`,
              opacity: a,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              padding: "8px 10px",
              boxSizing: "border-box",
              fontSize: 26,
              fontWeight: 800,
              color: C.muted,
            }}
          >
            {i + 1}
          </div>
        );
      })}
      {/* лупа поиска */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: appear(f, 14, 10) }}>
        <g transform={`translate(${lensX} ${lensY}) rotate(-12)`}>
          <circle r={50} fill="rgba(255,255,255,0.35)" stroke={C.navy} strokeWidth={10} />
          <path d="M 36 36 L 80 80" stroke={C.navy} strokeWidth={18} strokeLinecap="round" />
        </g>
      </svg>
      {/* «эртең — старт» зачёркивается */}
      <div style={{ position: "absolute", left: 0, right: 150, top: 980, display: "flex", justifyContent: "center", opacity: appear(f, promise - 4, 10) * (1 - 0.45 * strike) }}>
        <div style={{ position: "relative" }}>
          <Pill bg="#FFFFFF" color={C.navy} size={44} style={{ border: `4px solid ${C.line}` }}>
            Эртең — старт?
          </Pill>
          <div style={{ position: "absolute", left: -10, top: "50%", height: 8, width: `${108 * strike}%`, backgroundColor: C.coral, borderRadius: 4, transform: "rotate(-4deg)" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 150, top: 1100, textAlign: "center", opacity: note, translate: `0 ${(1 - note) * 16}px` }}>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.12 }}>{t.note}</div>
        <div style={{ marginTop: 14, fontSize: 36, fontWeight: 800, color: C.ink, opacity: sub, lineHeight: 1.2 }}>{t.sub}</div>
      </div>
    </div>
  );
};
