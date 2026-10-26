// Учебная комната мечети: светлая, уютная, реалистичная. Мир — px, одни и
// те же координаты во всех планах. Задняя стена: слева доска, в центре
// полки с книгами, справа большое окно с подоконником и ростком — за окном
// дерево с гнездом (вид из окна — тот же мир дерева в меньшем масштабе).
// Пол (низ стены) — y = ROOM.floorY; на ковре сидят ученики; низкий
// учебный стол — справа впереди, рядом с главными мальчиками.
import { box } from "../core/shots";
import { TreeWorld } from "./Tree";
import type { BirdPose } from "../bird/birdPose";

import { depth, ROOM, windowOrigin } from "./roomLayout";
export { depth, ROOM, windowOrigin };

const WALL = "#F1E7D6";
const WALL_SHADE = "#E6D9C4";
const FLOOR = "#D9C5A6";
const CARPET = "#9E4A3C";
const CARPET2 = "#B8604F";
const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";

// Задний план: стены, доска, полки, окно с деревом, подоконник, росток.
// softLight — мягкое пятно света от окна без жёстких краёв (80-1-9 и далее);
// без флага рисуется прежний прямоугольный градиент (80-1-6…80-1-8 не меняются).
export const RoomBack: React.FC<{ readonly pose: BirdPose; readonly placed: number; readonly f: number; readonly grassOnGround: boolean; readonly boardIllustration?: number; readonly softLight?: boolean }> = ({ pose, placed, f, grassOnGround, boardIllustration = 0, softLight = false }) => {
  const w = ROOM.window;
  const o = windowOrigin();
  return (
    <div style={box({ left: 0, top: 0, width: ROOM.w, height: ROOM.h })}>
      {/* стена с мягким градиентом света от окна */}
      <div style={box({ left: -400, top: -300, width: ROOM.w + 800, height: ROOM.floorY + 300, background: `linear-gradient(90deg, ${WALL_SHADE} 0%, ${WALL} 55%, #F6EEDF 100%)` })} />
      {/* плинтус и пол */}
      <div style={box({ left: -400, top: ROOM.floorY - 16, width: ROOM.w + 800, height: 18, backgroundColor: "#CDB998" })} />
      <div style={box({ left: -400, top: ROOM.floorY, width: ROOM.w + 800, height: ROOM.h - ROOM.floorY + 300, background: `linear-gradient(180deg, ${FLOOR}, #CDB38F)` })} />
      {/* большой ковёр с орнаментом */}
      <div style={box({ left: 120, top: ROOM.floorY + 10, width: ROOM.w - 240, height: 420, borderRadius: 6, backgroundColor: CARPET })} />
      <div style={box({ left: 170, top: ROOM.floorY + 40, width: ROOM.w - 340, height: 360, borderRadius: 4, border: `10px solid ${CARPET2}`, boxSizing: "border-box", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 60px, transparent 60px 120px)" })} />
      <div style={box({ left: 220, top: ROOM.floorY + 90, width: ROOM.w - 440, height: 260, border: "4px solid rgba(255,240,220,0.35)", boxSizing: "border-box" })} />
      {/* доска (слева) */}
      <div style={box({ left: ROOM.board.x - 14, top: ROOM.board.y - 14, width: ROOM.board.w + 28, height: ROOM.board.h + 28, borderRadius: 8, backgroundColor: WOOD })} />
      <div style={box({ left: ROOM.board.x, top: ROOM.board.y, width: ROOM.board.w, height: ROOM.board.h, backgroundColor: "#2F4F43", borderRadius: 3 })} />
      <div style={box({ left: ROOM.board.x - 14, top: ROOM.board.y + ROOM.board.h + 14, width: ROOM.board.w + 28, height: 22, backgroundColor: WOOD_DARK, borderRadius: 4 })} />
      <BoardIllustration k={boardIllustration} />
      {/* полки с книгами */}
      <Shelf />
      {/* окно: рама, стекло с видом на дерево, подоконник */}
      <div style={box({ left: w.x - 22, top: w.y - 22, width: w.w + 44, height: w.h + 44, borderRadius: 10, backgroundColor: "#FBF7F0", boxShadow: "0 8px 20px rgba(80,60,30,0.15)" })} />
      <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 4, backgroundColor: "#DCE9EF" })}>
        <svg width={w.w} height={w.h} viewBox={`0 0 ${w.w} ${w.h}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <g transform={`translate(${o.x - w.x} ${o.y - w.y}) scale(${o.k})`}>
            <TreeWorld pose={pose} placed={placed} f={f} grassOnGround={grassOnGround} window />
          </g>
          {/* лёгкий блик стекла */}
          <path d={`M 0 ${w.h * 0.1} L ${w.w * 0.35} 0 L ${w.w * 0.5} 0 L 0 ${w.h * 0.32} Z`} fill="#FFFFFF" opacity={0.12} />
        </svg>
      </div>
      {/* переплёт окна */}
      <div style={box({ left: w.x + w.w / 2 - 9, top: w.y, width: 18, height: w.h, backgroundColor: "#FBF7F0" })} />
      <div style={box({ left: w.x, top: w.y + w.h * 0.42 - 8, width: w.w, height: 16, backgroundColor: "#FBF7F0" })} />
      {/* подоконник */}
      <div style={box({ left: w.x - 40, top: w.y + w.h + 22, width: w.w + 80, height: w.sill, backgroundColor: "#F4EEE2", borderRadius: 4, boxShadow: "0 6px 10px rgba(80,60,30,0.18)" })} />
      {/* росток в горшке у окна — постоянный, тот же, что в прошлых фильмах */}
      <Sprout x={ROOM.plant.x} y={w.y + w.h + 22} />
      {/* тёплое пятно света от окна на стене и полу */}
      {softLight ? (
        <div style={box({ left: w.x - 420, top: w.y - 60, width: w.w + 840, height: ROOM.floorY - w.y + 560, background: "radial-gradient(ellipse 50% 50% at 50% 46%, rgba(255,242,212,0.26), rgba(255,242,212,0.12) 55%, rgba(255,242,212,0) 100%)", pointerEvents: "none" })} />
      ) : (
        <div style={box({ left: w.x - 120, top: w.y + 40, width: w.w + 240, height: ROOM.floorY - w.y + 200, background: "linear-gradient(180deg, rgba(255,245,220,0.0), rgba(255,240,205,0.18) 60%, rgba(255,240,205,0.28))", pointerEvents: "none" })} />
      )}
    </div>
  );
};

const Shelf: React.FC = () => {
  const s = ROOM.shelf;
  const books = [
    ["#2F6B4F", 40], ["#8E3B46", 34], ["#3F5E8C", 46], ["#B98A4A", 30], ["#5E7A6B", 38], ["#7A4E3B", 44], ["#2B4270", 36], ["#C85A4A", 32],
  ] as const;
  return (
    <div style={box({ left: s.x, top: s.y, width: s.w, height: s.h })}>
      {[0, 1, 2].map((row) => (
        <div key={row}>
          <div style={box({ left: -10, top: row * 130 + 110, width: s.w + 20, height: 16, backgroundColor: WOOD, borderRadius: 3, boxShadow: "0 4px 6px rgba(60,40,20,0.2)" })} />
          {books.slice(row === 1 ? 2 : 0, row === 2 ? 6 : 8).map(([c, bw], i) => (
            <div key={i} style={box({ left: 14 + i * 48 + (row % 2) * 10, top: row * 130 + 110 - 80 - (i % 3) * 6, width: bw, height: 80 + (i % 3) * 6, backgroundColor: c, borderRadius: 3, boxShadow: "inset -4px 0 0 rgba(0,0,0,0.12)" })} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Росток в горшке на подоконнике.
export const Sprout: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <path d="M -44 0 L 44 0 L 36 -78 L -36 -78 Z" fill="#B9775A" transform="translate(0 0)" />
    <rect x={-48} y={-90} width={96} height={16} rx={4} fill="#C9865F" />
    <path d="M -30 -92 L 30 -92 L 30 -98 L -30 -98 Z" fill="#6B4A36" />
    <path d="M 0 -96 C -4 -140 -4 -170 0 -200" stroke="#4F8A3C" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={-22} cy={-150} rx={26} ry={13} fill="#6FAF58" transform="rotate(-30 -22 -150)" />
    <ellipse cx={24} cy={-176} rx={28} ry={14} fill="#7FBF66" transform="rotate(25 24 -176)" />
    <ellipse cx={-14} cy={-196} rx={20} ry={10} fill="#8DC774" transform="rotate(-20 -14 -196)" />
  </svg>
);

// Учебная иллюстрация на доске: маленькие рисунки яйца и птенца — очевидно
// картинки мелом, не событие за окном. k — появление 0…1.
const BoardIllustration: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0) return null;
  const b = ROOM.board;
  return (
    <svg width={b.w} height={b.h} style={{ position: "absolute", left: b.x, top: b.y, opacity: Math.min(1, k) }}>
      <g stroke="#F3F1E6" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray={k < 1 ? `${k * 900} 900` : undefined}>
        {/* гнездо-схема */}
        <path d="M 150 250 Q 230 330 310 250" />
        <path d="M 160 250 Q 230 300 300 250" />
        <path d="M 130 240 L 330 240" />
        {/* яйцо */}
        <ellipse cx={215} cy={214} rx={26} ry={34} />
        <ellipse cx={262} cy={220} rx={24} ry={32} />
        {/* птенец */}
        <circle cx={500} cy={200} r={34} />
        <ellipse cx={520} cy={262} rx={52} ry={40} />
        <path d="M 530 198 L 556 206 L 530 214" />
        <circle cx={492} cy={192} r={4} fill="#F3F1E6" />
        <path d="M 470 300 L 470 318 M 530 300 L 530 318" />
      </g>
      <text x={150} y={330 + 50} fill="#F3F1E6" fontSize={34} fontFamily="Nunito" opacity={0.9}>яйца</text>
      <text x={470} y={330 + 50} fill="#F3F1E6" fontSize={34} fontFamily="Nunito" opacity={0.9}>птенец</text>
    </svg>
  );
};

// Низкий учебный стол (крышка; ножки) — рисуется перед сидящими позади него.
export const LowTable: React.FC = () => {
  const t = ROOM.table;
  return (
    <div style={box({ left: t.x - t.w / 2, top: t.top, width: t.w, height: t.h + t.legH })}>
      <div style={box({ left: 16, top: t.h - 8, width: 22, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 4 })} />
      <div style={box({ left: t.w - 38, top: t.h - 8, width: 22, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 4 })} />
      <div style={box({ left: 0, top: 0, width: t.w, height: t.h, borderRadius: 8, background: `linear-gradient(180deg, #A97A52, ${WOOD})`, boxShadow: "0 6px 10px rgba(60,40,20,0.2)" })} />
      {/* несколько листов бумаги и книга на столе */}
      <div style={box({ left: 40, top: -6, width: 120, height: 26, backgroundColor: "#F7F4EC", borderRadius: 2, transform: "rotate(-6deg)", boxShadow: "0 2px 3px rgba(0,0,0,0.12)" })} />
      <div style={box({ left: 60, top: -2, width: 120, height: 26, backgroundColor: "#FFFFFF", borderRadius: 2, transform: "rotate(3deg)" })} />
      <div style={box({ left: 200, top: -10, width: 70, height: 24, backgroundColor: "#2F6B4F", borderRadius: 3 })} />
    </div>
  );
};
