// Реквизит фильма 80-1-10 в мире комнаты (px): столик, лист и карточки на
// нём, пенал с карандашами, маркер, закрытая папка «Наши вопросы», две
// текстовые карточки учителя лицом вниз, полоски крепления, Коран на
// подставке на отдельной тумбе, прежний рисунок Земли на стене, планшеты
// учеников для рисования, плакат в руках и на доске. Положения — layout.ts,
// состояние по кадру — plan.ts.
import { fontFamily } from "../../fonts";
import { box } from "../core/shots";
import { CardBack, CardFace, OldEarthSheet } from "./drawings";
import { CARD_MM, CARD_UNITS, DESK, DESK_FS, MM, POSTER, QURAN_CABINET, QURAN_ON_STAND, OLD_EARTH_PIN, TABLE, type Vec } from "./layout";
import { PosterContent, TextCardFace, type PosterView } from "./poster";
import type { DrawingKind } from "./roster";
import { textCardSize } from "./posterText";
import { TRAY_PENCILS } from "./deskHands";

const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";
const svgAbs = { position: "absolute", left: 0, top: 0, overflow: "visible" } as const;

// Столик (тот же, что в 80-1-7 и 80-1-8).
export const Table: React.FC = () => {
  const t = TABLE;
  const w = t.x2 - t.x1;
  return (
    <div style={box({ left: t.x1, top: t.top, width: w, height: t.h + t.legH })}>
      <div style={box({ left: 22, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
      <div style={box({ left: w - 48, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
      <div style={box({ left: 0, top: 0, width: w, height: t.h, borderRadius: 10, background: `linear-gradient(180deg, #B08358, ${WOOD})`, boxShadow: "0 8px 14px rgba(60,40,20,0.22)" })} />
      <div style={box({ left: 0, top: 0, width: w, height: 14, borderRadius: "10px 10px 0 0", backgroundColor: "#C19468" })} />
    </div>
  );
};

// Плоский предмет на столе (вид комнаты): прямоугольник w × h мм в своих
// единицах (units), сжатый по глубине стола. center — мир (px).
export const FlatOnTable: React.FC<{
  readonly center: Vec;
  readonly wMm: number;
  readonly hMm: number;
  readonly units: { readonly w: number; readonly h: number };
  readonly rot?: number;
  readonly squash?: number; // 1 — лежит (сжатие стола), 0 — стоит вертикально
  readonly shadow?: boolean;
  readonly children: React.ReactNode;
}> = ({ center, wMm, hMm, units, rot = 0, squash = 1, shadow = true, children }) => {
  const w = wMm * MM;
  const k = DESK_FS + (1 - DESK_FS) * (1 - squash);
  const h = hMm * MM * k;
  return (
    <div style={box({ left: center.x - w / 2, top: center.y - h / 2, width: w, height: h, transform: `rotate(${rot * squash * 0.25}deg)`, transformOrigin: "50% 50%" })}>
      <svg width={w} height={h} viewBox={`0 0 ${units.w} ${units.h}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible", filter: shadow ? "drop-shadow(0 1px 1px rgba(0,0,0,0.16))" : undefined }}>
        {children}
      </svg>
    </div>
  );
};

// Детская карточка в комнате: на столе (squash 1) или в руке (squash 0).
export const CardProp: React.FC<{
  readonly center: Vec;
  readonly kind: DrawingKind;
  readonly progress?: number;
  readonly boat?: number;
  readonly caption?: number;
  readonly back?: boolean;
  readonly squash?: number;
  readonly rot?: number;
  readonly scale?: number;
  readonly uid: string;
}> = ({ center, kind, progress = 1, boat = 0, caption = 0, back = false, squash = 1, rot = 0, scale = 1, uid }) => (
  <FlatOnTable center={center} wMm={CARD_MM.w * scale} hMm={CARD_MM.h * scale} units={CARD_UNITS} rot={rot} squash={squash}>
    {back ? <CardBack uid={uid} /> : <CardFace kind={kind} progress={progress} boat={boat} caption={caption} uid={uid} />}
  </FlatOnTable>
);

// Большой лист на столе / в руках / на доске. lift 0 — лежит (сжат), 1 — вертикально.
// spread 0…1 — лист разворачивают из рулона (в начале фильма).
export const PosterProp: React.FC<{ readonly center: Vec; readonly v: PosterView; readonly lift?: number; readonly spread?: number; readonly tilt?: number; readonly uid: string }> = ({ center, v, lift = 0, spread = 1, tilt = 0, uid }) => {
  const w = POSTER.w * MM;
  const k = DESK_FS + (1 - DESK_FS) * lift;
  const h = POSTER.h * MM * k;
  if (spread < 1) {
    // рулон раскатывается от учителя влево: развёрнутая часть — справа, рулон — у её левого края
    const shown = Math.max(0.06, spread);
    const rollR = 7 + 9 * (1 - spread);
    const x0 = w * (1 - shown);
    return (
      <div style={box({ left: center.x - w / 2, top: center.y - h / 2, width: w, height: h })}>
        <svg width={w + 30} height={h + 30} style={{ position: "absolute", left: 0, top: -rollR, overflow: "visible" }}>
          <rect x={x0} y={rollR} width={w * shown} height={h} rx={2} fill="#FBF8EF" stroke="#DCD3C0" strokeWidth={1} />
          <ellipse cx={x0} cy={rollR + h / 2} rx={rollR * 0.8} ry={h / 2 + rollR * 0.35} fill="#F3EEE1" stroke="#D3C9B3" strokeWidth={1} />
          <ellipse cx={x0} cy={rollR + h / 2} rx={rollR * 0.45} ry={h / 2} fill="none" stroke="#E2D9C5" strokeWidth={0.8} />
        </svg>
      </div>
    );
  }
  // Лежащий лист: заголовок — у края к камере комнаты, сетка — у детей
  // (как posterToDesk и вид сверху), поэтому в плане комнаты он перевёрнут по
  // глубине. Когда учитель поднимает лист (lift → 1), лист поворачивается
  // лицом к классу: заголовок сверху.
  const flip = -Math.cos(Math.PI * clamp01(lift));
  return (
    <div style={box({ left: center.x - w / 2, top: center.y - h / 2, width: w, height: h, transform: `rotate(${tilt}deg) scaleY(${flip.toFixed(4)})`, transformOrigin: "50% 50%" })}>
      <svg width={w} height={h} viewBox={`0 0 ${POSTER.w} ${POSTER.h}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))" }}>
        <PosterContent v={v} uid={uid} upsideDownText={flip < 0} />
      </svg>
    </div>
  );
};

// Текстовая карточка учителя в комнате (back — лицом вниз).
export const TextCardProp: React.FC<{ readonly which: "one" | "two"; readonly center: Vec; readonly back: boolean; readonly squash?: number; readonly rot?: number }> = ({ which, center, back, squash = 1, rot = 0 }) => {
  const s = textCardSize(which);
  return (
    <FlatOnTable center={center} wMm={s.w} hMm={s.h} units={{ w: s.w, h: s.h }} rot={rot} squash={squash}>
      <g transform={`translate(${s.w / 2} ${s.h / 2})`}>
        <TextCardFace which={which} back={back} />
      </g>
    </FlatOnTable>
  );
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Цветные карандаши: пенал с карандашами и отдельный карандаш (мир, px).
// Те же карандаши, что в пенале на виде сверху (deskHands.ts, TRAY_PENCILS).
export const PENCIL_COLORS = TRAY_PENCILS.map((p) => p.color);
export const PencilTray: React.FC<{ readonly center: Vec; readonly missing: readonly string[] }> = ({ center, missing }) => {
  const w = DESK.pencilTray.w * MM;
  return (
    <svg width={1} height={1} style={{ ...svgAbs, left: center.x, top: center.y }}>
      <rect x={-w / 2} y={-5} width={w} height={8} rx={2} fill="#3F6FA8" stroke="#2F5590" strokeWidth={0.8} />
      {PENCIL_COLORS.map((c, i) =>
        missing.includes(c) ? null : <rect key={c} x={-w / 2 + 4 + i * ((w - 8) / PENCIL_COLORS.length)} y={-7} width={(w - 8) / PENCIL_COLORS.length - 1.2} height={4} rx={1} fill={c} />,
      )}
    </svg>
  );
};

// Карандаш в мире: кончик в tip, angle — направление корпуса от кончика (градусы, 0 — вверх).
export const PencilProp: React.FC<{ readonly tip: Vec; readonly angle: number; readonly color: string; readonly len?: number }> = ({ tip, angle, color, len = 46 }) => (
  <svg width={1} height={1} style={{ ...svgAbs, left: tip.x, top: tip.y }}>
    <g transform={`rotate(${angle})`}>
      <rect x={-2.6} y={-len} width={5.2} height={len - 6} fill={color} stroke="rgba(0,0,0,0.18)" strokeWidth={0.6} />
      <path d="M -2.6 -6 L 0 0.5 L 2.6 -6 Z" fill="#E6CFA3" />
      <path d="M -1 -2 L 0 0.5 L 1 -2 Z" fill={color} />
    </g>
  </svg>
);

// Маркер учителя (колпачок снят — capOff).
export const MarkerProp: React.FC<{ readonly tip: Vec; readonly angle: number; readonly capOff: boolean }> = ({ tip, angle, capOff }) => (
  <svg width={1} height={1} style={{ ...svgAbs, left: tip.x, top: tip.y }}>
    <g transform={`rotate(${angle})`}>
      <rect x={-4} y={-44} width={8} height={36} rx={3} fill="#2C4A84" />
      <rect x={-4} y={-30} width={8} height={10} fill="#F3F1EA" opacity={0.85} />
      <path d="M -3 -8 L -1.4 0 L 1.4 0 L 3 -8 Z" fill="#23365E" />
      {capOff ? null : <rect x={-4.6} y={-12} width={9.2} height={14} rx={3} fill="#2C4A84" />}
    </g>
  </svg>
);

// Закрытая папка «Наши вопросы» (вид сверху, мм 236 × 318): обложка с табличкой.
export const FOLDER_UNITS = { w: 236, h: 318 } as const;
export const ClosedFolderFace: React.FC = () => (
  <g>
    <rect x={0} y={0} width={236} height={318} rx={8} fill="#C9A87C" stroke="#A9895F" strokeWidth={3} />
    <rect x={8} y={8} width={220} height={302} rx={6} fill="none" stroke="#B9976A" strokeWidth={1.5} />
    <rect x={8} y={4} width={220} height={12} rx={4} fill="#D9BC92" opacity={0.7} />
    <rect x={34} y={104} width={168} height={110} rx={10} fill="#FBF6EA" stroke="#A9895F" strokeWidth={2} />
    <text x={118} y={150} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill="#4B3A2A">
      Наши
    </text>
    <text x={118} y={192} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fontWeight={800} fill="#4B3A2A">
      вопросы
    </text>
  </g>
);
export const ClosedFolderProp: React.FC<{ readonly center: Vec }> = ({ center }) => (
  <FlatOnTable center={center} wMm={DESK.folder.w} hMm={DESK.folder.h} units={FOLDER_UNITS} rot={DESK.folder.rot}>
    <ClosedFolderFace />
  </FlatOnTable>
);

// Подставка с нарезанными полосками крепления (у учителя).
export const TapeHolderProp: React.FC<{ readonly center: Vec }> = ({ center }) => (
  <FlatOnTable center={center} wMm={DESK.tapeHolder.w} hMm={DESK.tapeHolder.h} units={{ w: 96, h: 150 }}>
    <rect x={0} y={0} width={96} height={150} rx={6} fill="#EDE6D6" stroke="#CFC3A8" strokeWidth={2} />
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={14} y={14 + i * 22} width={68} height={12} rx={2} fill="#F3E6BC" stroke="#DCCB93" strokeWidth={1} />
    ))}
  </FlatOnTable>
);

// Закрытый Коран на подставке — на отдельной тумбе у правой стены (без букв).
export const QuranCorner: React.FC = () => {
  const c = QURAN_CABINET;
  const q = QURAN_ON_STAND;
  const w = q.w;
  const h = w * 0.72;
  return (
    <>
      <div style={box({ left: c.x, top: c.y, width: c.w, height: 1000 - c.y, borderRadius: 6, background: "linear-gradient(180deg, #9A7050, #7E5A3C)", boxShadow: "0 6px 10px rgba(60,40,20,0.2)" })} />
      <div style={box({ left: c.x - 6, top: c.y - 8, width: c.w + 12, height: 12, borderRadius: 4, backgroundColor: "#A97E58" })} />
      <div style={box({ left: c.x + 12, top: c.y + 30, width: c.w - 24, height: 1000 - c.y - 48, borderRadius: 4, border: "2px solid rgba(60,40,20,0.25)" })} />
      <svg width={1} height={1} style={{ ...svgAbs, left: q.x, top: c.y - 8 }}>
        {/* подставка (рехал) */}
        <path d={`M ${-w * 0.5} 0 L ${w * 0.42} ${-w * 0.66} L ${w * 0.48} ${-w * 0.6} L ${-w * 0.42} 4 Z`} fill="#8A6240" stroke="#6E4C31" strokeWidth={1.2} />
        <path d={`M ${w * 0.5} 0 L ${-w * 0.42} ${-w * 0.66} L ${-w * 0.48} ${-w * 0.6} L ${w * 0.42} 4 Z`} fill="#9A7050" stroke="#6E4C31" strokeWidth={1.2} />
        {/* книга обложкой к зрителю: геометрическая рамка, без надписей */}
        <g transform={`translate(0 ${-w * 0.34})`}>
          <rect x={-w / 2 + 3} y={-h / 2 + 2} width={w - 6} height={h} rx={w * 0.04} fill="#F2E8D2" />
          <rect x={-w / 2} y={-h / 2 - 3} width={w} height={h} rx={w * 0.04} fill="#2F6B4F" stroke="#245140" strokeWidth={1.5} />
          <rect x={-w / 2 + w * 0.1} y={-h / 2 - 3 + h * 0.12} width={w * 0.8} height={h * 0.76} rx={w * 0.04} fill="none" stroke="#C9A961" strokeWidth={1.6} opacity={0.9} />
          <path d={`M 0 ${-h / 2 - 3 + h * 0.3} L ${w * 0.12} ${-h / 2 - 3 + h * 0.5} L 0 ${-h / 2 - 3 + h * 0.7} L ${-w * 0.12} ${-h / 2 - 3 + h * 0.5} Z`} fill="none" stroke="#C9A961" strokeWidth={1.4} opacity={0.9} />
          <rect x={-w / 2 + w * 0.08} y={-h / 2 - 3} width={4} height={h} fill="#245140" opacity={0.7} />
        </g>
      </svg>
    </>
  );
};

// Прежний рисунок Земли (из 80-1-7) приколот к стене между полкой и окном.
export const OldEarthOnWall: React.FC = () => {
  const p = OLD_EARTH_PIN;
  const h = (p.w * 220) / 300;
  return (
    <div style={box({ left: p.x - p.w / 2, top: p.y - h / 2, width: p.w, height: h, transform: `rotate(${p.rot}deg)` })}>
      <svg width={p.w} height={h} viewBox="0 0 300 220" style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))" }}>
        <OldEarthSheet uid="old-earth-wall" />
        <rect x={130} y={-6} width={40} height={16} rx={2} fill="#F3E6BC" stroke="#DCCB93" strokeWidth={1} opacity={0.9} transform="rotate(-4 150 2)" />
      </svg>
    </div>
  );
};

// Светильник отставлен на подоконник и выключен (как в 80-1-8).
export const LampAside: React.FC<{ readonly baseX: number; readonly baseY: number }> = ({ baseX, baseY }) => {
  const hx = baseX - 62;
  const hy = baseY - 150;
  return (
    <svg width={1} height={1} style={svgAbs}>
      <ellipse cx={baseX} cy={baseY + 6} rx={40} ry={11} fill="#000" opacity={0.16} />
      <ellipse cx={baseX} cy={baseY} rx={38} ry={10} fill="#3C4350" />
      <ellipse cx={baseX} cy={baseY - 5} rx={38} ry={10} fill="#596274" />
      <path d={`M ${baseX} ${baseY - 7} L ${baseX} ${hy + 36} Q ${baseX} ${hy + 8} ${hx + 32} ${hy + 4}`} stroke="#4A5160" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={`M ${hx + 38} ${hy - 19} L ${hx - 30} ${hy - 38} L ${hx - 30} ${hy + 38} L ${hx + 38} ${hy + 19} Z`} fill="#55607A" />
      <path d={`M ${hx + 38} ${hy - 19} L ${hx - 30} ${hy - 38} L ${hx - 30} ${hy - 26} L ${hx + 38} ${hy - 10} Z`} fill="#6B778F" />
      <ellipse cx={hx - 30} cy={hy} rx={9} ry={38} fill="#2E3440" />
      <ellipse cx={hx - 30} cy={hy} rx={5} ry={26} fill="#1F242C" />
      <rect x={baseX + 12} y={baseY - 19} width={12} height={10} rx={3} fill="#8A8F99" />
    </svg>
  );
};

// Планшет ученика для рисования (светлая дощечка на скрещённых ногах) с
// карточкой. center — середина дощечки (мир), w — ширина (px), tilt — наклон
// (градусы), cardOn — карточка лежит на дощечке.
export const LapBoard: React.FC<{
  readonly center: Vec;
  readonly w: number;
  readonly kind: DrawingKind;
  readonly progress: number;
  readonly cardOn: boolean;
  readonly tilt?: number;
  readonly uid: string;
}> = ({ center, w, kind, progress, cardOn, tilt = 0, uid }) => {
  const h = w * 0.22;
  const cw = w * 0.66;
  const ch = cw * (CARD_MM.h / CARD_MM.w) * 0.34;
  return (
    <div style={box({ left: center.x - w / 2, top: center.y - h / 2, width: w, height: h, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, borderRadius: 3, background: "linear-gradient(180deg, #E2C79E, #CDAE80)", boxShadow: "0 2px 3px rgba(60,40,20,0.25)" })} />
      {cardOn ? (
        <svg width={cw} height={ch} viewBox={`0 0 ${CARD_UNITS.w} ${CARD_UNITS.h}`} preserveAspectRatio="none" style={{ position: "absolute", left: (w - cw) / 2, top: (h - ch) / 2 - 1, display: "block" }}>
          <CardFace kind={kind} progress={progress} uid={uid} />
        </svg>
      ) : null}
    </div>
  );
};
