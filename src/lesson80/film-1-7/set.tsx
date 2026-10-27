// Реквизит фильма 80-1-7 в комнате 80-1-6: низкий столик у окна (шире, чем
// раньше: на нём глобус, лампа и рисунки), направленный светильник, два
// рисунка дома и чистый лист, бумажная лодочка Юсуфа из 80-1-5, занавеска на
// окне. Координаты — мир комнаты (px), одни и те же во всех планах.
import { box } from "../core/shots";
import { ROOM } from "../sets/Classroom";
import { GlobeView } from "./globe/GlobeView";
import { HouseSheet } from "./drawings";

import { BOAT, CURTAIN, GLOBE, LAMP, SHEETS, TABLE } from "./layout";
export { BOAT, CURTAIN, GLOBE, LAMP, SHEETS, TABLE };

const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";

export type SetState = {
  readonly phi: number;
  readonly lamp: number; // 0…1 (включена один раз)
  readonly curtain: number; // 0 — открыта, 1 — прикрыта
  readonly globeOnTable: number; // 0…1 — подставка уже стоит на столе (сцена 2)
  readonly globeLift: number; // px: подставка в руках над столом (до установки)
  readonly sheetsOnTable: boolean; // рисунки лежат на столе
  readonly blankOnTable: boolean; // чистый лист ещё на столе
  readonly f: number;
};

// Задняя часть реквизита: занавеска (на стене у окна) — рисуется сразу после фона.
export const CurtainLayer: React.FC<{ readonly curtain: number }> = ({ curtain }) => {
  const w = ROOM.window;
  const rodY = w.y - 44;
  const span = w.w * CURTAIN.closedFrac;
  const width = 90 + span * curtain;
  const folds = Math.max(3, Math.round(width / 38));
  return (
    <div style={box({ left: w.x - 60, top: rodY, width: w.w + 120, height: w.h + 110 })}>
      {/* карниз */}
      <div style={box({ left: 0, top: 0, width: w.w + 120, height: 10, borderRadius: 5, backgroundColor: "#9A7A58" })} />
      <div style={box({ left: -6, top: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#8A6A48" })} />
      <div style={box({ left: w.w + 108, top: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: "#8A6A48" })} />
      {/* ткань: мягкие складки, ширина растёт при прикрывании */}
      <svg width={width + 20} height={w.h + 100} style={{ position: "absolute", left: 2, top: 6, overflow: "visible" }}>
        <defs>
          <linearGradient id="l817-curtain" x1="0" x2="1">
            {Array.from({ length: folds * 2 + 1 }, (_, i) => (
              <stop key={i} offset={i / (folds * 2)} stopColor={i % 2 ? "#CFA98B" : "#E4C3A6"} />
            ))}
          </linearGradient>
        </defs>
        <path d={`M 0 0 L ${width} 0 L ${width + 8} ${w.h + 86} Q ${width / 2} ${w.h + 96} -4 ${w.h + 86} Z`} fill="url(#l817-curtain)" />
        <path d={`M 0 0 L ${width} 0`} stroke="#B78B6B" strokeWidth={6} />
      </svg>
    </div>
  );
};

// Столик и всё на нём (без персонажей). Порядок: стол → рисунки → лодочка →
// глобус → лампа (ближе к камере, справа).
export const TableSet: React.FC<{ readonly s: SetState; readonly uid?: string }> = ({ s, uid = "set" }) => {
  const t = TABLE;
  const w = t.x2 - t.x1;
  const lift = s.globeLift;
  return (
    <>
      <div style={box({ left: t.x1, top: t.top, width: w, height: t.h + t.legH })}>
        <div style={box({ left: 22, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
        <div style={box({ left: w - 48, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
        <div style={box({ left: 0, top: 0, width: w, height: t.h, borderRadius: 10, background: `linear-gradient(180deg, #B08358, ${WOOD})`, boxShadow: "0 8px 14px rgba(60,40,20,0.22)" })} />
        <div style={box({ left: 0, top: 0, width: w, height: 14, borderRadius: "10px 10px 0 0", backgroundColor: "#C19468" })} />
      </div>
      {s.sheetsOnTable ? (
        <>
          <HouseSheet kind="day" x={SHEETS.day.x} y={SHEETS.day.y} w={150} rot={SHEETS.day.rot} flat />
          <HouseSheet kind="night" x={SHEETS.night.x} y={SHEETS.night.y} w={150} rot={SHEETS.night.rot} flat />
        </>
      ) : null}
      {s.blankOnTable ? <HouseSheet kind="blank" x={SHEETS.blank.x} y={SHEETS.blank.y} w={150} rot={SHEETS.blank.rot} flat /> : null}
      <PaperBoat x={BOAT.x} y={BOAT.y} />
      {s.globeOnTable > 0 ? (
        <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* тень подставки на столе появляется при контакте */}
          <ellipse cx={GLOBE.cx} cy={t.top + 16} rx={GLOBE.r * 0.7} ry={GLOBE.r * 0.16} fill="#000" opacity={0.16 * s.globeOnTable} />
          <GlobeView uid={`${uid}-globe`} cx={GLOBE.cx} cy={GLOBE.cy - lift} r={GLOBE.r} phi={s.phi} view="side" lamp={s.lamp} />
        </svg>
      ) : null}
      <Lamp on={s.lamp} />
    </>
  );
};

// Направленный светильник: тяжёлое основание, короткая стойка, голова-колпак
// смотрит влево на глобус. Включён — тёплое свечение внутри колпака и мягкий
// конус к шару; положение и яркость после включения не меняются.
export const Lamp: React.FC<{ readonly on: number }> = ({ on }) => {
  const b = LAMP;
  const hx = b.headX;
  const hy = b.headY;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* конус света к глобусу (едва заметный, не меняет лампу) */}
      {on > 0 ? (
        <path d={`M ${hx - 30} ${hy - 26} L ${GLOBE.cx - GLOBE.r * 0.2} ${GLOBE.cy - GLOBE.r * 1.15} L ${GLOBE.cx - GLOBE.r * 0.2} ${GLOBE.cy + GLOBE.r * 1.15} L ${hx - 30} ${hy + 26} Z`} fill="#FFE9B5" opacity={0.09 * on} />
      ) : null}
      <ellipse cx={b.baseX} cy={b.baseY + 8} rx={46} ry={13} fill="#000" opacity={0.18} />
      <ellipse cx={b.baseX} cy={b.baseY} rx={44} ry={12} fill="#3C4350" />
      <ellipse cx={b.baseX} cy={b.baseY - 6} rx={44} ry={12} fill="#596274" />
      <path d={`M ${b.baseX} ${b.baseY - 8} L ${b.baseX} ${hy + 40} Q ${b.baseX} ${hy + 10} ${hx + 36} ${hy + 4}`} stroke="#4A5160" strokeWidth={9} fill="none" strokeLinecap="round" />
      {/* колпак: усечённый конус, открытый влево */}
      <path d={`M ${hx + 44} ${hy - 22} L ${hx - 34} ${hy - 44} L ${hx - 34} ${hy + 44} L ${hx + 44} ${hy + 22} Z`} fill="#55607A" />
      <path d={`M ${hx + 44} ${hy - 22} L ${hx - 34} ${hy - 44} L ${hx - 34} ${hy - 30} L ${hx + 44} ${hy - 12} Z`} fill="#6B778F" />
      <ellipse cx={hx - 34} cy={hy} rx={10} ry={44} fill={on > 0 ? "#FFF2C8" : "#2E3440"} />
      <ellipse cx={hx - 34} cy={hy} rx={6} ry={30} fill={on > 0 ? "#FFFBEA" : "#1F242C"} />
      {/* выключатель на основании */}
      <rect x={b.baseX + 14} y={b.baseY - 22} width={14} height={12} rx={3} fill={on > 0 ? "#D9534F" : "#8A8F99"} />
    </svg>
  );
};

// Бумажная лодочка Юсуфа (из 80-1-5) — лежит рядом с бумагой.
export const PaperBoat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <path d="M -34 0 L 34 0 L 22 12 L -22 12 Z" fill="#EEE9DC" stroke="#CFC7B6" strokeWidth={1.5} />
    <path d="M -14 0 L 0 -22 L 14 0 Z" fill="#FFFFFF" stroke="#CFC7B6" strokeWidth={1.5} />
    <path d="M -14 0 L 0 -10 L 14 0" fill="#F4F0E6" stroke="#CFC7B6" strokeWidth={1} />
  </svg>
);
