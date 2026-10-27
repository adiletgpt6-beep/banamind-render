// Реквизит и обстановка фильма 80-1-12 в комнате серии (px мира, одни и те
// же координаты во всех планах): дверь, общий плакат на доске (из 80-1-10),
// полочка с Кораном, столик с ростком и карточкой «Проверить росток» под
// окном (как в конце 80-1-11), низкий стол с видимой столешницей; на столе —
// деревянная картинка, пустая коробка, книга Амира, стопка учебных книг,
// бумажная лодочка (из 80-1-5); книга Билала; занятия 22 учеников.
import { fontFamily } from "../../fonts";
import { box } from "../core/shots";
import { PaperBoat } from "../film-1-7/set";
import type { BgItem, BookInfo, BoxInfo } from "./choreo";
import { AMIR_BOOK, BILAL_BOOK_W, BOAT, BOOKS, CARD_SPOT, CUP, DOOR, JUG, PLANT_TABLE, POSTER, POT, QURAN_SHELF, SAUCER, TABLE, TRAY } from "./layout";
import { BOX, planeToRoom, TABLE_PLANE } from "./puzzle";
import { TEXTS } from "./script";

const WOOD = "#8A6240";
const WOOD_DARK = "#6E4C31";
const svgAbs = { position: "absolute", left: 0, top: 0, overflow: "visible" } as const;

// ---------- дверь (закрыта) ----------
export const Door: React.FC = () => {
  const d = DOOR;
  const h = d.bottom - d.top;
  return (
    <div style={box({ left: d.x - 16, top: d.top - 16, width: d.w + 32, height: h + 16 })}>
      <div style={box({ left: 0, top: 0, width: d.w + 32, height: h + 16, backgroundColor: "#E8DCC6", borderRadius: "8px 8px 0 0", boxShadow: "inset 0 0 0 4px #D6C6AA" })} />
      <div style={box({ left: 16, top: 16, width: d.w, height: h, background: "linear-gradient(90deg, #A47A52, #B88C61 60%, #A47A52)", borderRadius: "3px 3px 0 0" })} />
      <div style={box({ left: 40, top: 54, width: d.w - 48, height: h * 0.36, border: "4px solid rgba(110,76,49,0.35)", borderRadius: 4, boxSizing: "border-box" })} />
      <div style={box({ left: 40, top: 70 + h * 0.4, width: d.w - 48, height: h * 0.42, border: "4px solid rgba(110,76,49,0.35)", borderRadius: 4, boxSizing: "border-box" })} />
      <div style={box({ left: d.w - 18, top: h * 0.52, width: 26, height: 10, borderRadius: 5, backgroundColor: "#D9C08A", boxShadow: "0 2px 3px rgba(0,0,0,0.2)" })} />
    </div>
  );
};

// ---------- полочка с Кораном (закрытая книга на подставке, без букв) ----------
export const QuranShelf: React.FC = () => {
  const s = QURAN_SHELF;
  return (
    <svg width={1} height={1} style={svgAbs}>
      <rect x={s.x - s.w / 2} y={s.y} width={s.w} height={12} rx={3} fill={WOOD} />
      <path d={`M ${s.x - s.w / 2 + 12} ${s.y + 12} l 10 18 M ${s.x + s.w / 2 - 12} ${s.y + 12} l -10 18`} stroke={WOOD_DARK} strokeWidth={5} strokeLinecap="round" />
      {/* подставка */}
      <path d={`M ${s.x - 34} ${s.y} L ${s.x + 30} ${s.y - 46} M ${s.x + 34} ${s.y} L ${s.x - 30} ${s.y - 46}`} stroke="#7A5530" strokeWidth={6} strokeLinecap="round" />
      {/* книга */}
      <path d={`M ${s.x - 42} ${s.y - 30} L ${s.x} ${s.y - 16} L ${s.x + 42} ${s.y - 30} L ${s.x + 42} ${s.y - 84} L ${s.x} ${s.y - 70} L ${s.x - 42} ${s.y - 84} Z`} fill="#2F6B4F" stroke="#24543D" strokeWidth={2} />
      <path d={`M ${s.x - 34} ${s.y - 36} L ${s.x - 6} ${s.y - 26} L ${s.x - 6} ${s.y - 66} L ${s.x - 34} ${s.y - 76} Z`} fill="none" stroke="#D9B65C" strokeWidth={2} />
      <path d={`M ${s.x + 34} ${s.y - 36} L ${s.x + 6} ${s.y - 26} L ${s.x + 6} ${s.y - 66} L ${s.x + 34} ${s.y - 76} Z`} fill="none" stroke="#D9B65C" strokeWidth={2} />
      <path d={`M ${s.x - 20} ${s.y - 52} l 6 -6 l 6 6 l -6 6 Z M ${s.x + 20} ${s.y - 52} l -6 -6 l -6 6 l 6 6 Z`} fill="#D9B65C" />
    </svg>
  );
};

// ---------- общий плакат (работа детей из 80-1-10) ----------
// Большой лист на доске: название, 25 детских рисунков-карточек (у каждого
// ребёнка своя: яблоко Юсуфа, дерево Амира с дорисованной лодочкой, новая
// Земля Билала и 22 рисунка природы) и две карточки-подписи. Нарисовано
// от руки: рисунки чуть повёрнуты, у карточек разная бумага.
type Doodle = "apple" | "tree" | "earth" | "flower" | "sun" | "cloud" | "fish" | "bird" | "mountain" | "leaf" | "moon" | "rainbow" | "butterfly" | "mushroom" | "river" | "star" | "grass";
const DOODLES: readonly Doodle[] = ["apple", "tree", "earth", "flower", "sun", "fish", "mountain", "bird", "leaf", "cloud", "rainbow", "flower", "moon", "butterfly", "mushroom", "river", "star", "grass", "sun", "fish", "tree", "flower", "leaf", "bird", "mountain"];
const PAPERS = ["#FFFDF6", "#FDF6E6", "#F4F8FB", "#FBF3F3", "#F6FAF0"] as const;
const DoodleArt: React.FC<{ kind: Doodle; i: number }> = ({ kind, i }) => {
  const s = { strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "apple":
      return (
        <g>
          <circle cx={30} cy={30} r={13} fill="#E5654F" stroke="#B9473A" {...s} />
          <path d="M 30 17 q 1 -6 4 -8" stroke="#6E4A33" fill="none" {...s} />
          <path d="M 32 13 q 8 -4 10 2 q -6 3 -10 -2" fill="#5DB04A" />
        </g>
      );
    case "tree":
      return (
        <g>
          <rect x={27} y={30} width={7} height={18} fill="#8A5B3C" />
          <circle cx={30} cy={24} r={13} fill="#5EAA4F" />
          {i === 1 ? <path d="M 40 44 L 54 44 L 51 48 L 43 48 Z M 45 44 L 47 38 L 49 44" fill="#FFFFFF" stroke="#8A8F99" strokeWidth={1} /> : null}
        </g>
      );
    case "earth":
      return (
        <g>
          <circle cx={30} cy={28} r={15} fill="#6FA3D8" stroke="#3F6E9E" {...s} />
          <path d="M 20 22 q 6 -4 9 2 q -2 6 -8 4 Z M 33 30 q 6 -2 8 4 q -4 6 -9 2 Z" fill="#7FBF66" />
        </g>
      );
    case "flower":
      return (
        <g>
          <path d="M 30 48 L 30 30" stroke="#5E9443" {...s} />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={30 + 7 * Math.cos((a * Math.PI) / 180)} cy={24 + 7 * Math.sin((a * Math.PI) / 180)} r={5} fill={i % 2 ? "#F2A0B6" : "#F7D35C"} />
          ))}
          <circle cx={30} cy={24} r={4} fill="#E59A3A" />
        </g>
      );
    case "sun":
      return (
        <g stroke="#E8B53A" {...s}>
          <circle cx={30} cy={28} r={9} fill="#F7D35C" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d={`M ${30 + 13 * Math.cos((a * Math.PI) / 180)} ${28 + 13 * Math.sin((a * Math.PI) / 180)} l ${5 * Math.cos((a * Math.PI) / 180)} ${5 * Math.sin((a * Math.PI) / 180)}`} />
          ))}
        </g>
      );
    case "cloud":
      return (
        <g>
          <path d="M 16 32 q 0 -10 10 -8 q 4 -8 12 -2 q 8 0 6 10 Z" fill="#DDE9F2" stroke="#9FB6CE" {...s} />
          <path d="M 22 38 l -2 6 M 30 38 l -2 6 M 38 38 l -2 6" stroke="#6FA3D8" {...s} />
        </g>
      );
    case "fish":
      return (
        <g>
          <path d="M 16 28 q 12 -12 26 0 q -14 12 -26 0 Z" fill="#F2A65A" stroke="#C9783A" {...s} />
          <path d="M 42 28 l 8 -6 l 0 12 Z" fill="#F2A65A" stroke="#C9783A" {...s} />
          <circle cx={22} cy={26} r={1.6} fill="#1E1B26" />
        </g>
      );
    case "bird":
      return (
        <g>
          <path d="M 14 30 q 8 -8 16 0 q 8 -8 16 0" stroke="#4A5163" fill="none" {...s} />
          <path d="M 22 40 q 5 -5 10 0 q 5 -5 10 0" stroke="#4A5163" fill="none" {...s} />
        </g>
      );
    case "mountain":
      return (
        <g>
          <path d="M 10 46 L 26 18 L 36 34 L 42 26 L 52 46 Z" fill="#9FB6CE" stroke="#6D7FA3" {...s} />
          <path d="M 22 25 L 26 18 L 30 25 Z" fill="#FFFFFF" />
        </g>
      );
    case "leaf":
      return <path d="M 18 42 C 16 26 30 14 44 14 C 46 30 34 42 18 42 Z M 18 42 L 40 18" fill="#6FAF58" stroke="#3F7A33" {...s} />;
    case "moon":
      return (
        <g>
          <path d="M 34 14 a 14 14 0 1 0 8 26 a 11 11 0 1 1 -8 -26 Z" fill="#F7E08A" stroke="#D9B65C" {...s} />
          <circle cx={18} cy={18} r={1.8} fill="#D9B65C" />
          <circle cx={46} cy={44} r={1.8} fill="#D9B65C" />
        </g>
      );
    case "rainbow":
      return (
        <g fill="none" {...s} strokeWidth={3}>
          <path d="M 12 44 a 18 18 0 0 1 36 0" stroke="#E5654F" />
          <path d="M 16 44 a 14 14 0 0 1 28 0" stroke="#F7D35C" />
          <path d="M 20 44 a 10 10 0 0 1 20 0" stroke="#6FAF58" />
          <path d="M 24 44 a 6 6 0 0 1 12 0" stroke="#6FA3D8" />
        </g>
      );
    case "butterfly":
      return (
        <g>
          <ellipse cx={22} cy={26} rx={8} ry={10} fill="#C9A0D8" stroke="#8D6FA8" {...s} />
          <ellipse cx={38} cy={26} rx={8} ry={10} fill="#C9A0D8" stroke="#8D6FA8" {...s} />
          <path d="M 30 18 L 30 40" stroke="#4A5163" {...s} />
        </g>
      );
    case "mushroom":
      return (
        <g>
          <rect x={26} y={30} width={8} height={14} rx={3} fill="#F2E6CC" stroke="#B9A57A" {...s} />
          <path d="M 14 32 q 16 -22 32 0 Z" fill="#E5654F" stroke="#B9473A" {...s} />
          <circle cx={24} cy={26} r={2} fill="#FFFFFF" />
          <circle cx={34} cy={24} r={2} fill="#FFFFFF" />
        </g>
      );
    case "river":
      return <path d="M 10 22 q 10 -6 20 0 t 20 0 M 10 34 q 10 -6 20 0 t 20 0" stroke="#6FA3D8" fill="none" {...s} strokeWidth={3} />;
    case "star":
      return <path d="M 30 14 L 34 26 L 46 26 L 36 33 L 40 45 L 30 37 L 20 45 L 24 33 L 14 26 L 26 26 Z" fill="#F7D35C" stroke="#D9B65C" {...s} />;
    default:
      return <path d="M 12 44 q 4 -14 6 0 q 4 -16 8 0 q 4 -14 8 0 q 4 -16 8 0 q 4 -12 6 0" stroke="#5E9443" fill="none" {...s} />;
  }
};

export const Poster: React.FC = () => {
  const P = POSTER;
  const cols = 9;
  const cw = 60;
  const ch = 52;
  const gx = (P.w - 40 - cols * cw) / (cols - 1);
  return (
    <svg width={P.w + 20} height={P.h + 20} style={{ position: "absolute", left: P.x - 10, top: P.y - 10, overflow: "visible" }}>
      <g transform="translate(10 10)">
        <rect x={4} y={6} width={P.w} height={P.h} fill="#000" opacity={0.18} rx={4} />
        <rect x={0} y={0} width={P.w} height={P.h} fill="#FBF6EA" rx={4} />
        {/* скотч по углам */}
        {[
          [-8, -6, -20],
          [P.w - 46, -6, 18],
          [-8, P.h - 14, 16],
          [P.w - 46, P.h - 12, -14],
        ].map(([x, y, a], i) => (
          <rect key={i} x={x} y={y} width={54} height={18} fill="#F3EAD2" opacity={0.85} transform={`rotate(${a} ${x + 27} ${y + 9})`} />
        ))}
        <text x={P.w / 2} y={50} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#2E6B3C">
          {TEXTS.poster}
        </text>
        <path d={`M ${P.w * 0.18} 64 q ${P.w * 0.32} 8 ${P.w * 0.64} 0`} stroke="#E8B53A" strokeWidth={4} fill="none" strokeLinecap="round" />
        {DOODLES.map((k, i) => {
          const row = i < 9 ? 0 : i < 17 ? 1 : 2;
          const col = row === 0 ? i : row === 1 ? i - 9 : i - 17;
          const off = row === 0 ? 0 : (cw + gx) / 2;
          const x = 20 + off + col * (cw + gx);
          const y = 82 + row * (ch + 12);
          const a = ((i * 37) % 9) - 4;
          return (
            <g key={i} transform={`rotate(${a} ${x + cw / 2} ${y + ch / 2})`}>
              <rect x={x} y={y} width={cw} height={ch} fill={PAPERS[i % PAPERS.length]} stroke="#E2D6BC" strokeWidth={1.5} rx={2} />
              <g transform={`translate(${x} ${y - 2}) scale(1 0.92)`}>
                <DoodleArt kind={k} i={i} />
              </g>
            </g>
          );
        })}
        {/* карточки-подписи */}
        <g transform={`rotate(-2 120 ${P.h - 40})`}>
          <rect x={30} y={P.h - 66} width={190} height={44} fill="#EAF4E6" stroke="#B9D3B0" strokeWidth={1.5} rx={3} />
          <text x={125} y={P.h - 37} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={22} fill="#2E6B3C">
            Аллах Един
          </text>
        </g>
        <g transform={`rotate(2 ${P.w - 128} ${P.h - 40})`}>
          <rect x={P.w - 236} y={P.h - 66} width={214} height={44} fill="#EEF3FA" stroke="#BCCBE0" strokeWidth={1.5} rx={3} />
          <text x={P.w - 129} y={P.h - 38} textAnchor="middle" fontFamily={fontFamily} fontWeight={700} fontSize={18} fill="#2F4A7A">
            У Аллаха нет начала
          </text>
        </g>
        {/* подпись под рисунком лодочки (из 80-1-10) — между карточками */}
        <text x={P.w / 2 - 6} y={P.h - 38} textAnchor="middle" fontFamily={fontFamily} fontWeight={600} fontSize={13} fill="#6D6A60" transform={`rotate(-1 ${P.w / 2} ${P.h - 42})`}>
          Лодочку сложил Амир
        </text>
      </g>
    </svg>
  );
};

// Росток в горшке — рисунок и цвета прошлых фильмов, но горшок, как настоящий,
// шире у края, чем у дна (в крупных планах, срезанный краем кадра, он не
// читается перевёрнутым).
const PotSprout: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <path d="M -34 0 L 34 0 L 43 -78 L -43 -78 Z" fill="#B9775A" />
    <path d="M -34 0 L -20 0 L -27 -78 L -43 -78 Z" fill="#000" opacity={0.07} />
    <rect x={-49} y={-90} width={98} height={16} rx={4} fill="#C9865F" />
    <path d="M -32 -92 L 32 -92 L 32 -98 L -32 -98 Z" fill="#6B4A36" />
    <path d="M 0 -96 C -4 -140 -4 -170 0 -200" stroke="#4F8A3C" strokeWidth={6} fill="none" strokeLinecap="round" />
    <ellipse cx={-22} cy={-150} rx={26} ry={13} fill="#6FAF58" transform="rotate(-30 -22 -150)" />
    <ellipse cx={24} cy={-176} rx={28} ry={14} fill="#7FBF66" transform="rotate(25 24 -176)" />
    <ellipse cx={-14} cy={-196} rx={20} ry={10} fill="#8DC774" transform="rotate(-20 -14 -196)" />
  </svg>
);

// ---------- столик с ростком под окном ----------
export const PlantCorner: React.FC = () => {
  const t = PLANT_TABLE;
  const w = t.x2 - t.x1;
  const cardW = CARD_SPOT.w;
  const cardH = cardW * (200 / 300);
  return (
    <>
      <div style={box({ left: t.x1, top: t.top, width: w, height: t.floorY - t.top })}>
        {/* ножки стоят на полу у стены, перед краем ковра; под ними тень */}
        {[29, w - 29].map((cx) => (
          <div key={cx} style={box({ left: cx - 20, top: t.floorY - t.top - 4, width: 40, height: 8, borderRadius: "50%", backgroundColor: "rgba(70,45,25,0.28)" })} />
        ))}
        <div style={box({ left: 20, top: 14, width: 18, height: t.floorY - t.top - 14, backgroundColor: WOOD_DARK, borderRadius: "3px 3px 2px 2px" })} />
        <div style={box({ left: w - 38, top: 14, width: 18, height: t.floorY - t.top - 14, backgroundColor: WOOD_DARK, borderRadius: "3px 3px 2px 2px" })} />
        {/* нижняя полка со стопкой книг и корзинкой — на крупных планах, где
            столешница за кадром, видно, что это столик, а не два столба */}
        <div style={box({ left: 26, top: t.floorY - t.top - 58, width: w - 52, height: 10, borderRadius: 3, background: `linear-gradient(180deg, #B98A5C, ${WOOD})`, boxShadow: "0 5px 8px rgba(60,40,20,0.2)" })} />
        <div style={box({ left: 60, top: t.floorY - t.top - 67, width: 70, height: 9, borderRadius: 2, backgroundColor: "#4E7A6A" })} />
        <div style={box({ left: 66, top: t.floorY - t.top - 76, width: 60, height: 9, borderRadius: 2, backgroundColor: "#B8604F" })} />
        <div style={box({ left: w - 150, top: t.floorY - t.top - 84, width: 76, height: 26, borderRadius: "4px 4px 8px 8px", backgroundColor: "#C9A46A", backgroundImage: "repeating-linear-gradient(90deg, rgba(120,80,40,0.25) 0 3px, transparent 3px 9px)" })} />
        <div style={box({ left: 0, top: -6, width: w, height: 22, borderRadius: 5, background: `linear-gradient(180deg, #C19468, ${WOOD})`, boxShadow: "0 6px 10px rgba(60,40,20,0.2)" })} />
      </div>
      <svg width={1} height={1} style={svgAbs}>
        {/* поддон и горшок с ростком (тот же рисунок, что в прошлых фильмах) */}
        <ellipse cx={SAUCER.x} cy={SAUCER.y - 4} rx={SAUCER.halfW} ry={9} fill="#A86A4F" />
        <ellipse cx={SAUCER.x} cy={SAUCER.y - 7} rx={SAUCER.halfW - 6} ry={6} fill="#C38466" />
      </svg>
      <PotSprout x={POT.x} y={POT.base} />
      <svg width={1} height={1} style={svgAbs}>
        {/* карточка «Проверить росток», прислонена к стене */}
        <g transform={`translate(${CARD_SPOT.x - cardW / 2} ${CARD_SPOT.y - cardH}) skewX(-4)`}>
          <rect x={2} y={3} width={cardW} height={cardH} fill="#000" opacity={0.12} rx={2} />
          <rect x={0} y={0} width={cardW} height={cardH} fill="#FFFDF6" stroke="#D9D2C2" strokeWidth={1.2} rx={2} />
          <g transform={`scale(${cardW / 300})`}>
            <path d="M 50 172 C 52 158 55 144 58 132 C 18 116 28 60 78 40 C 110 64 98 120 58 132" fill="#DCEFD3" stroke="#2E6B3C" strokeWidth={6} strokeLinejoin="round" />
            <path d="M 58 132 Q 66 96 72 56" stroke="#2E6B3C" strokeWidth={4} fill="none" />
            <text x={116} y={94} fontFamily={fontFamily} fontWeight={700} fontSize={40} fill="#2E6B3C">
              Проверить
            </text>
            <text x={116} y={154} fontFamily={fontFamily} fontWeight={700} fontSize={40} fill="#2E6B3C">
              росток
            </text>
          </g>
        </g>
        {/* поднос с кувшином и пустой чашкой */}
        <rect x={TRAY.x - TRAY.w / 2} y={TRAY.y - 8} width={TRAY.w} height={8} rx={3} fill="#B98A55" />
        <path d={`M ${JUG.x - 20} ${JUG.y} Q ${JUG.x - 24} ${JUG.y - 40} ${JUG.x - 12} ${JUG.y - 56} L ${JUG.x - 10} ${JUG.y - 66} L ${JUG.x + 10} ${JUG.y - 66} L ${JUG.x + 12} ${JUG.y - 56} Q ${JUG.x + 24} ${JUG.y - 40} ${JUG.x + 20} ${JUG.y} Z`} fill="#EEF3FA" stroke="#9FB6CE" strokeWidth={2} />
        <path d={`M ${JUG.x + 16} ${JUG.y - 50} q 18 6 6 26`} stroke="#9FB6CE" strokeWidth={4} fill="none" />
        <path d={`M ${JUG.x - 14} ${JUG.y - 30} q 14 6 28 0`} stroke="#6FA3D8" strokeWidth={3} fill="none" />
        <path d={`M ${CUP.x - 14} ${CUP.y - 26} L ${CUP.x + 14} ${CUP.y - 26} L ${CUP.x + 11} ${CUP.y} L ${CUP.x - 11} ${CUP.y} Z`} fill="#F7F3EE" stroke="#C9C3B6" strokeWidth={2} />
      </svg>
    </>
  );
};

// ---------- низкий стол ----------
// Передний торец столешницы (как в прошлых фильмах) и видимая верхняя
// плоскость — полоса над ним (камера чуть выше уровня столешницы).
const SURF = TABLE_PLANE.fs * TABLE_PLANE.depth;
export const PuzzleTable: React.FC = () => {
  const t = TABLE;
  const w = t.x2 - t.x1;
  return (
    <>
      <svg width={1} height={1} style={svgAbs}>
        <defs>
          <linearGradient id="l8112-tabletop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B48A5E" />
            <stop offset="1" stopColor="#CDA273" />
          </linearGradient>
        </defs>
        <path d={`M ${t.x1 + 10} ${t.top - SURF} L ${t.x2 - 10} ${t.top - SURF} L ${t.x2} ${t.top} L ${t.x1} ${t.top} Z`} fill="url(#l8112-tabletop)" />
        {[0.22, 0.47, 0.71].map((k, i) => (
          <path key={i} d={`M ${t.x1 + 30} ${t.top - SURF * (1 - k)} Q ${t.x1 + w * 0.4} ${t.top - SURF * (1 - k) - 2} ${t.x2 - 40} ${t.top - SURF * (1 - k) + 1}`} stroke="#9C7448" strokeWidth={1.4} opacity={0.35} fill="none" />
        ))}
      </svg>
      <div style={box({ left: t.x1, top: t.top, width: w, height: t.h + t.legH })}>
        <div style={box({ left: 22, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
        <div style={box({ left: w - 48, top: t.h - 8, width: 26, height: t.legH + 8, backgroundColor: WOOD_DARK, borderRadius: 5 })} />
        <div style={box({ left: 0, top: 0, width: w, height: t.h, borderRadius: "4px 4px 10px 10px", background: `linear-gradient(180deg, #A97C52, ${WOOD})`, boxShadow: "0 8px 14px rgba(60,40,20,0.22)" })} />
        <div style={box({ left: 0, top: 0, width: w, height: 8, borderRadius: "4px 4px 0 0", backgroundColor: "#D2A877" })} />
      </div>
    </>
  );
};

// ---------- предметы на столе (вид из комнаты) ----------
const ROOM = (u: number, w: number, z = 0) => planeToRoom(TABLE.top, u, w, z);
const FS = TABLE_PLANE.fs;

// Пустая коробка от деталей: открытая, светлый картон, на передней стенке —
// маленькая картинка с деревом (та же, что на деталях).
export const RoomBox: React.FC<{ readonly b: BoxInfo }> = ({ b }) => {
  const hw = BOX.w / 2;
  const front = ROOM(b.u, b.w - BOX.d / 2, b.z);
  const back = ROOM(b.u, b.w + BOX.d / 2, b.z);
  const H = BOX.h;
  const lift = b.z;
  return (
    <svg width={1} height={1} style={svgAbs}>
      {lift > 0.5 ? <ellipse cx={b.u} cy={ROOM(b.u, b.w).y + lift + 2} rx={hw * 0.9} ry={6} fill="#3A2614" opacity={Math.max(0.06, 0.2 - lift * 0.003)} /> : null}
      {/* дальняя стенка изнутри и дно */}
      <path d={`M ${b.u - hw + 3} ${back.y - H} L ${b.u + hw - 3} ${back.y - H} L ${b.u + hw - 3} ${back.y - 2} L ${b.u - hw + 3} ${back.y - 2} Z`} fill="#C99E66" />
      <path d={`M ${b.u - hw + 4} ${back.y - 2} L ${b.u + hw - 4} ${back.y - 2} L ${b.u + hw - 4} ${front.y - H + 3} L ${b.u - hw + 4} ${front.y - H + 3} Z`} fill="#B98F5B" />
      {/* передняя стенка */}
      <rect x={b.u - hw} y={front.y - H} width={BOX.w} height={H} fill="#E2BE86" stroke="#B98F5B" strokeWidth={1.5} rx={2} />
      <rect x={b.u - hw} y={front.y - H} width={BOX.w} height={4} fill="#EED3A6" />
      {/* наклейка: дерево и ветка */}
      <g transform={`translate(${b.u - 20} ${front.y - H + 7})`}>
        <rect width={40} height={17} rx={2} fill="#D9EEF2" stroke="#9FB6CE" strokeWidth={0.8} />
        <rect y={12} width={40} height={5} fill="#86BC60" />
        <rect x={8} y={6} width={3} height={8} fill="#8A5B3C" />
        <circle cx={9.5} cy={6} r={5} fill="#58A44C" />
        <path d="M 11 8 L 34 6" stroke="#7A4E31" strokeWidth={1.4} />
        <circle cx={30} cy={4.6} r={2} fill="#8A5B3C" />
      </g>
    </svg>
  );
};

// Стопка учебных книг (две книги, лежат) и бумажная лодочка.
export const BooksAndBoat: React.FC = () => {
  const b = ROOM(BOOKS.u, BOOKS.w);
  const boat = ROOM(BOAT.u, BOAT.w);
  return (
    <>
      <svg width={1} height={1} style={svgAbs}>
        <ellipse cx={b.x} cy={b.y + 2} rx={42} ry={6} fill="#3A2614" opacity={0.14} />
        <rect x={b.x - 38} y={b.y - 9} width={76} height={9} rx={2} fill="#3F5E8C" />
        <rect x={b.x - 36} y={b.y - 7} width={72} height={3} fill="#F4EFE4" />
        <rect x={b.x - 34} y={b.y - 18} width={68} height={9} rx={2} fill="#C85A4A" />
        <rect x={b.x - 32} y={b.y - 16} width={64} height={3} fill="#F4EFE4" />
        <rect x={b.x - 34} y={b.y - 20} width={68} height={3} rx={1.5} fill="#DE7A69" />
      </svg>
      <PaperBoat x={boat.x} y={boat.y - 12} />
    </>
  );
};

// Книга Амира на столе: раскрыта (читает) → закрыта перед тем, как он
// придвигается к Юсуфу.
export const AmirBook: React.FC<{ readonly open: number; readonly u: number }> = ({ open, u }) => {
  const c = ROOM(u, AMIR_BOOK.w);
  const pw = 34 * (0.4 + 0.6 * open);
  return (
    <svg width={1} height={1} style={svgAbs}>
      <ellipse cx={c.x} cy={c.y + 2} rx={40} ry={5} fill="#3A2614" opacity={0.12} />
      <rect x={c.x - 36} y={c.y - 5} width={72} height={6} rx={2} fill="#5E7A6B" />
      {open > 0.02 ? (
        <>
          <path d={`M ${c.x} ${c.y - 4} L ${c.x - pw} ${c.y - 6} L ${c.x - pw - 1} ${c.y - 14} L ${c.x} ${c.y - 12} Z`} fill="#FBF8F1" stroke="#D9D2C4" strokeWidth={1} />
          <path d={`M ${c.x} ${c.y - 4} L ${c.x + 34 * open} ${c.y - 6 - 18 * (1 - open)} L ${c.x + 35 * open} ${c.y - 14 - 18 * (1 - open)} L ${c.x} ${c.y - 12} Z`} fill="#FBF8F1" stroke="#D9D2C4" strokeWidth={1} />
          <path d={`M ${c.x - pw + 6} ${c.y - 10} l ${pw - 12} 1 M ${c.x + 6} ${c.y - 10} l ${Math.max(0, 34 * open - 12)} -1`} stroke="#B9B2A4" strokeWidth={1} />
        </>
      ) : (
        <rect x={c.x - 34} y={c.y - 10} width={68} height={6} rx={2} fill="#6D8B7A" />
      )}
    </svg>
  );
};

// ---------- книга Билала ----------
export const BilalBookView: React.FC<{ readonly b: BookInfo }> = ({ b }) => {
  const w = BILAL_BOOK_W;
  if (b.where === "floor") {
    return (
      <svg width={1} height={1} style={svgAbs}>
        <ellipse cx={b.pos.x} cy={b.pos.y + 2} rx={34} ry={5} fill="#3A2614" opacity={0.14} />
        <rect x={b.pos.x - 30} y={b.pos.y - 7} width={60} height={8} rx={2} fill="#2F6B4F" />
        <rect x={b.pos.x - 28} y={b.pos.y - 5} width={56} height={2} fill="#F4EFE4" />
      </svg>
    );
  }
  // в руках: раскрытая книга обращена страницами к Билалу — камере видна обложка
  const o = b.open;
  const half = (w / 2) * (0.5 + 0.5 * o);
  return (
    <svg width={1} height={1} style={svgAbs}>
      <path d={`M ${b.pos.x} ${b.pos.y - 26} L ${b.pos.x - half} ${b.pos.y - 26 + 6 * o} L ${b.pos.x - half} ${b.pos.y + 14 + 6 * o} L ${b.pos.x} ${b.pos.y + 14} Z`} fill="#2F6B4F" stroke="#24543D" strokeWidth={1.4} />
      <path d={`M ${b.pos.x} ${b.pos.y - 26} L ${b.pos.x + half} ${b.pos.y - 26 + 6 * o} L ${b.pos.x + half} ${b.pos.y + 14 + 6 * o} L ${b.pos.x} ${b.pos.y + 14} Z`} fill="#357A5A" stroke="#24543D" strokeWidth={1.4} />
      {o > 0.3 ? <path d={`M ${b.pos.x - half + 2} ${b.pos.y - 27 + 6 * o} L ${b.pos.x} ${b.pos.y - 30} L ${b.pos.x + half - 2} ${b.pos.y - 27 + 6 * o}`} stroke="#F4EFE4" strokeWidth={3} fill="none" /> : null}
      {b.flip > 0.02 ? <path d={`M ${b.pos.x} ${b.pos.y - 30} q ${half * 0.5 * (1 - b.flip)} ${-14 * b.flip} ${half * (1 - 2 * b.flip)} ${-4 * b.flip}`} stroke="#FBF8F1" strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
    </svg>
  );
};

// ---------- занятия учеников ----------
export const BgItemView: React.FC<{ readonly it: BgItem; readonly h: number }> = ({ it, h }) => {
  if (it.kind === "none") return null;
  const p = it.pos;
  if (it.kind === "book") {
    const half = it.w / 2;
    const top = p.y - it.w * 0.42;
    const bot = p.y + it.w * 0.28;
    return (
      <svg width={1} height={1} style={svgAbs}>
        <path d={`M ${p.x} ${top} L ${p.x - half} ${top + 4} L ${p.x - half} ${bot + 4} L ${p.x} ${bot} Z`} fill={it.color} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        <path d={`M ${p.x} ${top} L ${p.x + half} ${top + 4} L ${p.x + half} ${bot + 4} L ${p.x} ${bot} Z`} fill={it.color} stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
        <path d={`M ${p.x} ${top} L ${p.x + half} ${top + 4} L ${p.x + half} ${bot + 4} L ${p.x} ${bot} Z`} fill="#000" opacity={0.08} />
        <path d={`M ${p.x - half + 1} ${top + 3} L ${p.x} ${top - 2} L ${p.x + half - 1} ${top + 3}`} stroke="#F4EFE4" strokeWidth={2.4} fill="none" />
        {it.flip > 0.02 ? <path d={`M ${p.x} ${top - 2} q ${half * 0.4} ${-10 * it.flip} ${half * (1 - 2 * it.flip)} ${-3 * it.flip}`} stroke="#FBF8F1" strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
      </svg>
    );
  }
  if (it.kind === "notebook") {
    const w = it.w;
    const d = w * 0.22;
    return (
      <svg width={1} height={1} style={svgAbs}>
        <ellipse cx={p.x} cy={p.y + 3} rx={w * 0.56} ry={d * 0.5} fill="#3A2614" opacity={0.1} />
        <path d={`M ${p.x - w / 2 + 4} ${p.y - d} L ${p.x + w / 2 - 4} ${p.y - d} L ${p.x + w / 2} ${p.y} L ${p.x - w / 2} ${p.y} Z`} fill="#FBF8F1" stroke="#D9D2C4" strokeWidth={1} />
        <path d={`M ${p.x} ${p.y - d} L ${p.x} ${p.y}`} stroke="#D9D2C4" strokeWidth={1} />
        <path d={`M ${p.x - w * 0.36} ${p.y - d * 0.5} q ${w * 0.1} ${-d * 0.4} ${w * 0.2} 0`} stroke={it.color} strokeWidth={2} fill="none" />
        <rect x={p.x - w / 2} y={p.y} width={w} height={2.5} fill={it.color} />
        {it.pencil ? <path d={`M ${it.pencil.x} ${it.pencil.y} L ${it.pencil.x + h * 0.03} ${it.pencil.y - h * 0.05}`} stroke="#F2C53D" strokeWidth={3} strokeLinecap="round" /> : null}
      </svg>
    );
  }
  // учебные карточки: одна в руке (обращена к ребёнку — виден оборот с узором), две на ковре
  const cw = it.w;
  return (
    <svg width={1} height={1} style={svgAbs}>
      <rect x={p.x - cw / 2} y={p.y - cw * 0.7} width={cw} height={cw * 0.72} rx={2} fill={it.color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
      <rect x={p.x - cw / 2 + 3} y={p.y - cw * 0.7 + 3} width={cw - 6} height={cw * 0.72 - 6} rx={1.5} fill="none" stroke="#FFFFFF" strokeWidth={1.2} opacity={0.7} />
      <rect x={p.x + h * 0.12} y={p.y + h * 0.19} width={cw * 0.9} height={cw * 0.2} rx={1.5} fill="#F4EFE4" transform={`rotate(-6 ${p.x + h * 0.12} ${p.y + h * 0.19})`} />
      <rect x={p.x + h * 0.15} y={p.y + h * 0.2} width={cw * 0.9} height={cw * 0.2} rx={1.5} fill={it.color} opacity={0.8} transform={`rotate(4 ${p.x + h * 0.15} ${p.y + h * 0.2})`} />
    </svg>
  );
};

export { FS as TABLE_FS };
