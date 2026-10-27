// Кисть и предмет в ней. Кисть рисуется в своей системе: (0, 0) —
// запястье, +y — вдоль кисти (от локтя к пальцам), side зеркалит большой
// палец. Предмет держится между ладонью и пальцами: сначала ладонь, потом
// предмет, затем пальцы поверх — пальцы «обхватывают» его.
// Контур кисти — тёмный оттенок кожи толщиной line (как у всего рига).
// №31: ключи от машины (простой брелок без логотипа), планшет, детский
// рисунок А4; facing — лицевой стороной к зрителю ("camera") или к герою.
import { ToyCarArt } from "../props/ToyCar";
import { lineOf } from "./looks";
import type { HandShape, ItemKind } from "./pose";

type HandProps = {
  readonly x: number;
  readonly y: number;
  readonly angle: number; // градусы: направление кисти (0 — вниз)
  readonly side: -1 | 1;
  readonly len: number;
  readonly skin: string;
  readonly shade: string;
  readonly shape: HandShape;
  readonly item: ItemKind;
  readonly itemColor?: string;
  readonly flat: number;
  readonly itemTilt: number;
  readonly glow: number;
  readonly shake: number;
  readonly part: "back" | "front";
  readonly facing?: "camera" | "self";
  readonly line?: number;
};

const INK = "#1E2235";

// Чуть темнее цвета (карман рюкзака).
const shade = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.82);
  return `#${((1 << 24) | (f((n >> 16) & 255) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1)}`;
};

// Телефон в руке: экраном к зрителю, почти вертикально (itemTilt), или
// плашмя (flat → 1) — как лежит на столе.
// caseColor — чехол (рабочий телефон отца и телефон сына различаются).
const PhoneShape: React.FC<{ w: number; h: number; flat: number; glow: number; caseColor?: string; line?: number }> = ({ w, h, flat, glow, caseColor = INK, line = 2.5 }) => {
  const W = w * (1 + 0.95 * flat);
  const H = h * (1 - 0.68 * flat);
  const edge = lineOf(caseColor);
  // glow < 0 — телефон повернут экраном от зрителя: виден только чехол
  if (glow < 0) {
    return (
      <g>
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={Math.min(W, H) * 0.18} fill={caseColor} stroke={edge} strokeWidth={line} />
        <rect x={-W / 2 + W * 0.14} y={-H / 2 + H * 0.06} width={W * 0.32} height={W * 0.32} rx={W * 0.09} fill="rgba(0,0,0,0.28)" />
        <circle cx={-W / 2 + W * 0.3} cy={-H / 2 + H * 0.06 + W * 0.16} r={W * 0.07} fill="rgba(255,255,255,0.35)" />
        <rect x={W * 0.18} y={-H / 2 + H * 0.12} width={W * 0.14} height={H * 0.76} rx={W * 0.07} fill="#FFFFFF" opacity={0.1} />
      </g>
    );
  }
  const scr = glow > 0 ? `rgba(${Math.round(150 + 90 * glow)}, ${Math.round(190 + 50 * glow)}, ${Math.round(230 + 20 * glow)}, 1)` : "#2C3B5C";
  return (
    <g>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={Math.min(W, H) * 0.18} fill={caseColor} stroke={edge} strokeWidth={line} />
      <rect x={-W / 2 + 3} y={-H / 2 + 3 + 2 * (1 - flat)} width={W - 6} height={H - 6 - 4 * (1 - flat)} rx={Math.min(W, H) * 0.12} fill={scr} />
      {glow > 0.2 && flat < 0.5 ? (
        <g opacity={glow}>
          <rect x={-W / 2 + 7} y={-H / 2 + 12} width={W * 0.55} height={4} rx={2} fill="#FFFFFF" opacity={0.85} />
          <rect x={-W / 2 + 7} y={-H / 2 + 22} width={W * 0.7} height={4} rx={2} fill="#FFFFFF" opacity={0.6} />
        </g>
      ) : null}
      {/* блик стекла */}
      <path d={`M ${W * 0.12} ${-H / 2 + 5} L ${W / 2 - 4} ${-H / 2 + 5} L ${W / 2 - 4} ${-H * 0.05} Z`} fill="#FFFFFF" opacity={0.12} />
    </g>
  );
};

// Ключи от машины: чёрная головка с двумя кнопками и металлическое
// лезвие на кольце, рядом — простой кожаный брелок без логотипа.
// (0, 0) — точка хвата (головка ключа между пальцами); всё висит вниз.
const CarKeys: React.FC<{ L: number; line: number }> = ({ L, line }) => (
  <g>
    {/* брелок на кольце: висит с наклоном */}
    <g transform={`rotate(${-16} 0 ${L * 0.38})`}>
      <path d={`M 0 ${L * 0.38} L 0 ${L * 0.5}`} stroke="#9AA1AE" strokeWidth={line * 0.9} />
      <rect x={-L * 0.16} y={L * 0.5} width={L * 0.32} height={L * 0.5} rx={L * 0.12} fill="#7A5240" stroke={lineOf("#7A5240")} strokeWidth={line * 0.8} />
      <rect x={-L * 0.1} y={L * 0.56} width={L * 0.2} height={L * 0.38} rx={L * 0.07} fill="none" stroke="#B88C72" strokeWidth={line * 0.45} strokeDasharray={`${line * 0.9} ${line * 0.7}`} />
    </g>
    {/* кольцо */}
    <circle cx={0} cy={L * 0.3} r={L * 0.13} fill="none" stroke="#B9BEC8" strokeWidth={line * 0.9} />
    {/* ключ: головка и лезвие, висит под небольшим углом */}
    <g transform={`rotate(${14} 0 ${L * 0.3})`}>
      <rect x={-L * 0.035} y={L * 0.56} width={L * 0.12} height={L * 0.42} rx={L * 0.03} fill="#C9CED6" stroke={lineOf("#C9CED6")} strokeWidth={line * 0.6} />
      <rect x={-L * 0.17} y={L * 0.3} width={L * 0.38} height={L * 0.32} rx={L * 0.12} fill="#2A2D36" stroke={lineOf("#2A2D36")} strokeWidth={line * 0.8} />
      <circle cx={-L * 0.04} cy={L * 0.4} r={L * 0.045} fill="#4E5463" />
      <circle cx={L * 0.09} cy={L * 0.4} r={L * 0.045} fill="#4E5463" />
      <rect x={-L * 0.12} y={L * 0.33} width={L * 0.1} height={L * 0.04} rx={L * 0.02} fill="#FFFFFF" opacity={0.25} />
    </g>
  </g>
);

// Планшет помощницы (≈ 2,2 × 3 кисти): "camera" — экран к зрителю
// (светлый календарь недели, строка 13:20 подсвечена жёлтым), "self" —
// экраном к ней: виден светлый корпус с камерой, без логотипа.
const Tablet: React.FC<{ L: number; line: number; facing: "camera" | "self" }> = ({ L, line, facing }) => {
  const tw = L * 2.2;
  const th = L * 3.0;
  const r = L * 0.2;
  if (facing === "self") {
    return (
      <g>
        <rect x={-tw / 2} y={-th / 2} width={tw} height={th} rx={r} fill="#C9CFD9" stroke={lineOf("#C9CFD9")} strokeWidth={line} />
        <rect x={-tw / 2 + L * 0.12} y={-th / 2 + L * 0.12} width={tw - L * 0.24} height={th - L * 0.24} rx={r * 0.8} fill="#D6DBE3" />
        <circle cx={-tw / 2 + L * 0.3} cy={-th / 2 + L * 0.3} r={L * 0.09} fill="#3A3F4C" />
        <rect x={tw * 0.12} y={-th / 2 + L * 0.2} width={tw * 0.16} height={th * 0.8} rx={tw * 0.08} fill="#FFFFFF" opacity={0.2} />
      </g>
    );
  }
  const x0 = -tw / 2 + L * 0.13;
  const y0 = -th / 2 + L * 0.13;
  const sw = tw - L * 0.26;
  const sh = th - L * 0.26;
  const rows = [0.32, 0.47, 0.62, 0.77];
  return (
    <g>
      <rect x={-tw / 2} y={-th / 2} width={tw} height={th} rx={r} fill="#262B38" stroke={lineOf("#262B38")} strokeWidth={line} />
      <rect x={x0} y={y0} width={sw} height={sh} rx={r * 0.6} fill="#F3F6FB" />
      <rect x={x0} y={y0} width={sw} height={sh * 0.16} rx={r * 0.6} fill="#2E9686" />
      <rect x={x0 + sw * 0.1} y={y0 + sh * 0.05} width={sw * 0.45} height={sh * 0.05} rx={sh * 0.025} fill="#FFFFFF" opacity={0.85} />
      {rows.map((k, i) => (
        <g key={k}>
          <rect x={x0 + sw * 0.08} y={y0 + sh * k} width={sw * 0.84} height={sh * 0.1} rx={sh * 0.03} fill={i === 2 ? "#FFD43B" : "#DCE4F0"} />
          <rect x={x0 + sw * 0.14} y={y0 + sh * (k + 0.035)} width={sw * (i === 2 ? 0.3 : 0.5)} height={sh * 0.03} rx={sh * 0.015} fill={i === 2 ? "#172A46" : "#9AA8BF"} />
        </g>
      ))}
      <path d={`M ${x0 + sw * 0.55} ${y0} L ${x0 + sw} ${y0} L ${x0 + sw} ${y0 + sh * 0.4} Z`} fill="#FFFFFF" opacity={0.14} />
    </g>
  );
};

// Детский рисунок сына (А4, маленький масштаб): магнит-подкова и
// скрепки, солнце в углу, строчка-«подпись» волной. Без мелкого текста —
// крупный вариант с надписью рисует props/Drawing.tsx. "self" — оборот листа.
const KidDrawing: React.FC<{ L: number; line: number; facing: "camera" | "self" }> = ({ L, line, facing }) => {
  const dw = L * 3.4;
  const dh = L * 4.6;
  const paper = (
    <rect x={-dw / 2} y={-dh / 2} width={dw} height={dh} rx={L * 0.06} fill="#FFFEF8" stroke="#BDB5A6" strokeWidth={line * 0.8} />
  );
  // магнит: дуга вверх, концы вниз (серые полюса)
  const mx = -dw * 0.04;
  const my = -dh * 0.06;
  const r = dw * 0.24;
  const mw = r * 0.55;
  const magnet = (
    <g>
      <path d={`M ${mx - r} ${my + r * 0.9} L ${mx - r} ${my} A ${r} ${r} 0 0 1 ${mx + r} ${my} L ${mx + r} ${my + r * 0.9}`} stroke="#E2574C" strokeWidth={mw} fill="none" strokeLinejoin="round" />
      <path d={`M ${mx - r} ${my + r * 0.62} L ${mx - r} ${my + r * 1.05} M ${mx + r} ${my + r * 0.62} L ${mx + r} ${my + r * 1.05}`} stroke="#8E96A3" strokeWidth={mw} fill="none" />
      <path d={`M ${mx - r - mw / 2} ${my + r * 0.9} L ${mx - r - mw / 2} ${my} A ${r + mw / 2} ${r + mw / 2} 0 0 1 ${mx + r + mw / 2} ${my} L ${mx + r + mw / 2} ${my + r * 1.05}`} stroke="#B53A33" strokeWidth={line * 0.7} fill="none" opacity={0.8} />
    </g>
  );
  // скрепка — вытянутая петля, нарисованная фломастером
  const clip = (x: number, y: number, a: number, k: number) => (
    <g key={k} transform={`rotate(${a} ${x} ${y})`}>
      <rect x={x - dw * 0.035} y={y} width={dw * 0.07} height={dh * 0.09} rx={dw * 0.035} fill="none" stroke="#2F6FD6" strokeWidth={line * 0.9} />
    </g>
  );
  const tipY = my + r * 1.1;
  return (
    <g>
      {paper}
      {facing === "self" ? (
        <g opacity={0.1} transform={`scale(-1 1)`}>
          {magnet}
        </g>
      ) : (
        <g>
          {/* строчка-подпись наверху (волна вместо мелких букв) */}
          <path d={`M ${-dw * 0.32} ${-dh * 0.38} q ${dw * 0.06} ${-dh * 0.03} ${dw * 0.12} 0 t ${dw * 0.12} 0 t ${dw * 0.12} 0 t ${dw * 0.12} 0`} stroke="#2F6FD6" strokeWidth={line * 1.1} fill="none" strokeLinecap="round" />
          <circle cx={dw * 0.33} cy={-dh * 0.38} r={dw * 0.07} fill="#FFD43B" stroke="#F2B705" strokeWidth={line * 0.6} />
          {magnet}
          {clip(mx - r, tipY, 6, 1)}
          {clip(mx - r + dw * 0.01, tipY + dh * 0.085, -8, 2)}
          {clip(mx + r, tipY, -10, 3)}
          {clip(-dw * 0.25, dh * 0.33, 70, 4)}
          {clip(dw * 0.12, dh * 0.35, 100, 5)}
          {/* «сила притяжения» — короткие штрихи у полюсов */}
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${mx + sd * (r + mw)} ${tipY - dh * 0.02} l ${sd * dw * 0.06} ${dh * 0.02} M ${mx + sd * (r + mw)} ${tipY + dh * 0.04} l ${sd * dw * 0.06} 0`} stroke="#F08A24" strokeWidth={line * 0.8} strokeLinecap="round" />
          ))}
          <path d={`M ${-dw * 0.4} ${dh * 0.42} q ${dw * 0.2} ${-dh * 0.02} ${dw * 0.4} 0 t ${dw * 0.4} 0`} stroke="#3E9C5A" strokeWidth={line} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

export const Hand: React.FC<HandProps> = (p) => {
  const L = p.len;
  const W = L * 0.62;
  const s = p.side;
  const grip = { x: 0, y: L * 0.5 };
  const ln = p.line ?? 3;
  // предмет — в мировой ориентации (телефон, ключи висят вниз)
  const itemEl = (() => {
    switch (p.item) {
      case "phone": {
        const pw = L * 0.82;
        const ph = L * 1.62;
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${p.shake} 0)`}>
            <PhoneShape w={pw} h={ph} flat={p.flat} glow={p.glow} caseColor={p.itemColor} line={ln * 0.8} />
          </g>
        );
      }
      case "keys":
        // ключи от машины: головка зажата пальцами, брелок висит вниз
        return (
          <g transform={`rotate(${-p.angle}) translate(0 ${-L * 0.42})`}>
            <CarKeys L={L * 1.35} line={ln} />
          </g>
        );
      case "tablet":
        // планшет: кисть держит нижний боковой край, корпус — к середине тела
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${-s * L * 0.55} ${-L * 0.95})`}>
            <Tablet L={L} line={ln} facing={p.facing ?? "self"} />
          </g>
        );
      case "drawing":
        // рисунок А4: кисть держит боковой край на середине, лист — к
        // середине тела (вторую руку сцена ставит к другому краю)
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${-s * L * 1.45} ${-L * 0.25})`}>
            <KidDrawing L={L} line={ln} facing={p.facing ?? "camera"} />
          </g>
        );
      case "handbag":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <path d={`M ${-L * 0.35} ${L * 0.5} Q ${-L * 0.35} ${-L * 0.1} 0 ${-L * 0.1} Q ${L * 0.35} ${-L * 0.1} ${L * 0.35} ${L * 0.5}`} stroke="#5E3F31" strokeWidth={6} fill="none" />
            <rect x={-L * 1.1} y={L * 0.45} width={L * 2.2} height={L * 1.6} rx={L * 0.3} fill="#8A5A44" />
            <rect x={-L * 1.1} y={L * 0.45} width={L * 2.2} height={L * 0.4} rx={L * 0.2} fill="#7A4E3B" />
          </g>
        );
      case "notebook":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.75} y={-L * 0.95} width={L * 1.5} height={L * 1.9} rx={4} fill="#3E7CC0" />
            <rect x={-L * 0.6} y={-L * 0.8} width={L * 1.2} height={L * 0.5} rx={3} fill="#FFFFFF" opacity={0.85} />
          </g>
        );
      case "pencilcase":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.95} y={-L * 0.35} width={L * 1.9} height={L * 0.7} rx={L * 0.3} fill="#E5677A" />
            <rect x={-L * 0.95} y={-L * 0.06} width={L * 1.9} height={L * 0.1} fill="#C24E62" />
          </g>
        );
      case "backpack": {
        // рюкзак висит на петле под кистью (вертикально в мире)
        const c = p.itemColor ?? "#3E9C6B";
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <path d={`M ${-L * 0.3} ${L * 0.15} Q 0 ${-L * 0.35} ${L * 0.3} ${L * 0.15}`} stroke="#14285A" strokeWidth={7} fill="none" />
            <rect x={-L * 1.25} y={L * 0.1} width={L * 2.5} height={L * 3.1} rx={L * 0.7} fill={c} />
            <rect x={-L * 0.85} y={L * 1.8} width={L * 1.7} height={L * 1.05} rx={L * 0.3} fill={shade(c)} />
            <rect x={-L * 0.5} y={L * 0.3} width={L * 1.0} height={L * 0.22} rx={L * 0.1} fill="#FFFFFF" opacity={0.25} />
          </g>
        );
      }
      case "plate":
        // тарелка с обедом: держится горизонтально (вид чуть сверху)
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${-s * L * 0.15} ${-L * 0.1})`}>
            <ellipse cx={0} cy={L * 0.12} rx={L * 1.55} ry={L * 0.42} fill="#D5DCE6" />
            <ellipse cx={0} cy={0} rx={L * 1.55} ry={L * 0.42} fill="#FFFFFF" />
            <ellipse cx={0} cy={0} rx={L * 1.05} ry={L * 0.27} fill="#F1F3F6" />
            <ellipse cx={-L * 0.25} cy={-L * 0.04} rx={L * 0.62} ry={L * 0.18} fill="#E7C27A" />
            <ellipse cx={L * 0.45} cy={0} rx={L * 0.34} ry={L * 0.13} fill="#C9643E" />
            <circle cx={-L * 0.4} cy={-L * 0.1} r={L * 0.08} fill="#7FAF63" />
          </g>
        );
      case "spoon":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.06} y={-L * 0.2} width={L * 0.12} height={L * 1.0} rx={L * 0.06} fill="#C9CFD8" transform={`rotate(${s * 50})`} />
            <ellipse cx={s * L * 0.62} cy={-L * 0.55} rx={L * 0.2} ry={L * 0.13} fill="#DDE2EA" />
          </g>
        );
      case "toycar":
        // машинка в мировой ориентации, колёса вниз; держится за крышу
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            {/* та же машинка, что лежит на комоде/столе (74 px у мальчика):
                кисть держит её за крышу, опора колёс — на L·1,29 ниже хвата */}
            <ToyCarArt x={0} y={L * 1.29} len={L * 2.8} dir={-1} />
          </g>
        );
      case "pen":
        // тёмная ручка: кончик (y = L·0,7 в повёрнутой системе) — точка письма
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt - 24})`}>
            <rect x={-L * 0.06} y={-L * 1.25} width={L * 0.12} height={L * 1.62} rx={L * 0.05} fill="#1E2A44" />
            <rect x={-L * 0.075} y={-L * 1.25} width={L * 0.15} height={L * 0.3} rx={L * 0.05} fill="#2E3D5E" />
            <path d={`M ${-L * 0.06} ${L * 0.37} L 0 ${L * 0.7} L ${L * 0.06} ${L * 0.37} Z`} fill="#C9CED6" />
          </g>
        );
      case "pencil":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt - 24})`}>
            <rect x={-L * 0.065} y={-L * 1.25} width={L * 0.13} height={L * 1.6} rx={2} fill={p.itemColor ?? "#E5677A"} />
            <rect x={-L * 0.065} y={-L * 1.4} width={L * 0.13} height={L * 0.16} rx={2} fill="#F4C8D0" />
            <path d={`M ${-L * 0.065} ${L * 0.35} L 0 ${L * 0.7} L ${L * 0.065} ${L * 0.35} Z`} fill="#D8B88D" />
            <path d={`M ${-L * 0.023} ${L * 0.58} L 0 ${L * 0.7} L ${L * 0.023} ${L * 0.58} Z`} fill="#313B4E" />
          </g>
        );
      case "teapot":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <path d={`M ${-s * L * 0.2} ${-L * 0.1} Q ${-s * L * 0.2} ${-L * 0.55} ${-s * L * 0.7} ${-L * 0.4}`} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
            <ellipse cx={-s * L * 0.9} cy={L * 0.45} rx={L * 0.95} ry={L * 0.75} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={3} />
            <path d={`M ${-s * L * 1.7} ${L * 0.45} Q ${-s * L * 0.9} ${L * 0.15} ${-s * L * 0.1} ${L * 0.45}`} stroke="#2F62A8" strokeWidth={6} fill="none" />
            <path d={`M ${-s * L * 1.8} ${L * 0.4} Q ${-s * L * 2.3} ${L * 0.2} ${-s * L * 2.35} ${-L * 0.1}`} stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" />
            <ellipse cx={-s * L * 0.9} cy={-L * 0.25} rx={L * 0.3} ry={L * 0.1} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
            <circle cx={-s * L * 0.9} cy={-L * 0.36} r={L * 0.1} fill="#2F62A8" />
          </g>
        );
      case "card":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.9} y={-L * 1.25} width={L * 1.8} height={L * 2.3} rx={6} fill={p.itemColor ?? "#FFFFFF"} stroke="#D5DCE6" strokeWidth={2} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-L * 0.65} y={-L * 0.95 + k * L * 0.55} width={L * (k === 2 ? 0.8 : 1.3)} height={L * 0.16} rx={4} fill="#9AA6BC" />
            ))}
          </g>
        );
      case "gymbag": {
        // спортивный мешок на шнурке (висит под кистью)
        const c = p.itemColor ?? "#3FA7A0";
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <path d={`M ${-L * 0.25} ${L * 0.1} L ${-L * 0.7} ${L * 0.9} M ${L * 0.25} ${L * 0.1} L ${L * 0.7} ${L * 0.9}`} stroke="#E9E6E0" strokeWidth={4} />
            <path d={`M ${-L * 0.85} ${L * 0.85} Q 0 ${L * 0.6} ${L * 0.85} ${L * 0.85} L ${L * 1.0} ${L * 2.6} Q 0 ${L * 2.9} ${-L * 1.0} ${L * 2.6} Z`} fill={c} />
            <path d={`M ${-L * 0.4} ${L * 1.7} L ${L * 0.4} ${L * 1.7}`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
          </g>
        );
      }
      case "craft":
        // сложенная бумажная поделка: домик-оригами с окошком и солнцем
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(0 ${-L * 0.4})`}>
            <path d={`M ${-L * 1.1} ${-L * 0.1} L 0 ${-L * 1.1} L ${L * 1.1} ${-L * 0.1} Z`} fill="#E8806B" />
            <rect x={-L * 0.9} y={-L * 0.1} width={L * 1.8} height={L * 1.2} rx={4} fill="#FFD33D" />
            <rect x={-L * 0.3} y={L * 0.25} width={L * 0.6} height={L * 0.5} rx={3} fill="#4FD1C5" />
            <circle cx={L * 0.75} cy={-L * 0.95} r={L * 0.22} fill="#FFF3B0" />
          </g>
        );
      case "note":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(0 ${-L * 0.3})`}>
            <rect x={-L * 0.6} y={-L * 0.8} width={L * 1.2} height={L * 1.5} rx={3} fill="#FFFDF6" stroke="#D5DCE6" strokeWidth={2} />
            {[0, 1, 2].map((k) => (
              <rect key={k} x={-L * 0.42} y={-L * 0.55 + k * L * 0.36} width={L * (k === 2 ? 0.5 : 0.84)} height={L * 0.1} rx={3} fill="#7C8BA3" />
            ))}
          </g>
        );
      case "laptopbag":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <path d={`M ${-L * 0.4} ${L * 0.5} Q 0 ${-L * 0.2} ${L * 0.4} ${L * 0.5}`} stroke="#1E2230" strokeWidth={7} fill="none" />
            <rect x={-L * 1.5} y={L * 0.45} width={L * 3.0} height={L * 2.1} rx={L * 0.25} fill="#2B3142" />
            <rect x={-L * 1.5} y={L * 0.45} width={L * 3.0} height={L * 0.36} rx={L * 0.2} fill="#363D52" />
            <rect x={-L * 0.4} y={L * 1.2} width={L * 0.8} height={L * 0.14} rx={4} fill="#FFD33D" opacity={0.8} />
          </g>
        );
      // детский календарь: держится за верхний край (пальцы у кромки листа)
      case "knife":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.09} y={-L * 0.25} width={L * 0.18} height={L * 0.55} rx={L * 0.06} fill="#3A3F4A" transform={`rotate(${s * 70})`} />
            <path d={`M 0 0 L ${s * L * 1.25} ${L * 0.16} L ${s * L * 1.2} ${L * 0.34} L 0 ${L * 0.16} Z`} fill="#D9DEE6" stroke="#AEB5C0" strokeWidth={2} transform={`translate(${s * L * 0.18} ${L * 0.02})`} />
          </g>
        );
      case "fork":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            <rect x={-L * 0.05} y={-L * 0.3} width={L * 0.1} height={L * 1.0} rx={L * 0.05} fill="#C9CFD8" transform={`rotate(${s * 50})`} />
            <g transform={`rotate(${s * 50})`}>
              {[-1, 0, 1].map((k) => (
                <rect key={k} x={k * L * 0.07 - L * 0.025} y={-L * 0.62} width={L * 0.05} height={L * 0.34} rx={L * 0.02} fill="#DDE2EA" />
              ))}
            </g>
          </g>
        );
      // миска с салатом: держится горизонтально
      case "bowl":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${-s * L * 0.2} ${-L * 0.05})`}>
            <path d={`M ${-L * 1.3} ${-L * 0.1} Q ${-L * 1.2} ${L * 0.9} 0 ${L * 0.9} Q ${L * 1.2} ${L * 0.9} ${L * 1.3} ${-L * 0.1} Z`} fill={p.itemColor ?? "#FFFFFF"} stroke="#D5DCE6" strokeWidth={3} />
            <ellipse cx={0} cy={-L * 0.1} rx={L * 1.3} ry={L * 0.3} fill="#F2F4F7" />
            <circle cx={-L * 0.5} cy={-L * 0.2} r={L * 0.2} fill="#7FAF63" />
            <circle cx={L * 0.1} cy={-L * 0.26} r={L * 0.18} fill="#E2574C" />
            <circle cx={L * 0.6} cy={-L * 0.18} r={L * 0.2} fill="#9CC86E" />
          </g>
        );
      // круглый магнит
      case "magnet":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <circle cx={0} cy={L * 0.55} r={L * 0.32} fill={p.itemColor ?? "#F26A21"} stroke="#B9531A" strokeWidth={3} />
          </g>
        );
      // стопка чистых листов
      case "sheets":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(${-s * L * 0.3} ${L * 0.9})`}>
            {[2, 1, 0].map((k) => (
              <rect key={k} x={-L * 1.0 + k * 3} y={-L * 1.3 + k * 3} width={L * 2.0} height={L * 2.6} rx={3} fill={k ? "#F4F1EA" : "#FFFFFF"} stroke="#CFC8BA" strokeWidth={2} />
            ))}
          </g>
        );
      // картонная опора мачты (треугольная косынка)
      case "brace":
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt}) translate(0 ${L * 0.5})`}>
            <path d={`M ${-L * 0.9} ${L * 0.9} L ${L * 0.9} ${L * 0.9} L ${-L * 0.9} ${-L * 0.9} Z`} fill="#BE9362" stroke="#8E6740" strokeWidth={3} strokeLinejoin="round" />
            <path d={`M ${-L * 0.6} ${L * 0.62} L ${L * 0.3} ${L * 0.62}`} stroke="#9E7548" strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      case "cup":
        return (
          <g transform={`rotate(${-p.angle})`}>
            <rect x={-L * 0.45} y={-L * 0.55} width={L * 0.9} height={L * 1.0} rx={8} fill="#FFFFFF" stroke="#D5DCE6" strokeWidth={2} />
            <path d={`M ${s * L * 0.45} ${-L * 0.35} q ${s * L * 0.35} 0 ${s * L * 0.3} ${L * 0.35} q 0 ${L * 0.25} ${-s * L * 0.3} ${L * 0.25}`} fill="none" stroke="#D5DCE6" strokeWidth={5} />
          </g>
        );
      default:
        return null;
    }
  })();

  const skinStroke = { stroke: lineOf(p.skin), strokeWidth: ln * 0.8 };
  // ладонь (за предметом)
  const palm = <rect x={-W / 2} y={-2} width={W} height={L * 0.66} rx={W * 0.42} fill={p.skin} {...skinStroke} />;
  // пальцы (перед предметом)
  const fingers = (() => {
    switch (p.shape) {
      case "open":
      case "wave":
        return (
          <g>
            {[-1.5, -0.5, 0.5, 1.5].map((k) => (
              <rect key={k} x={k * W * 0.22 - W * 0.1} y={L * 0.5} width={W * 0.2} height={L * (0.46 - Math.abs(k) * 0.05)} rx={W * 0.1} fill={p.skin} {...skinStroke} transform={`rotate(${k * 5} ${k * W * 0.22} ${L * 0.52})`} />
            ))}
            <rect x={s * W * 0.42 - W * 0.1} y={L * 0.18} width={W * 0.2} height={L * 0.38} rx={W * 0.1} fill={p.skin} {...skinStroke} transform={`rotate(${-s * 38} ${s * W * 0.4} ${L * 0.25})`} />
          </g>
        );
      case "point":
        return (
          <g>
            <rect x={-W / 2} y={L * 0.4} width={W} height={L * 0.36} rx={W * 0.35} fill={p.skin} {...skinStroke} />
            <rect x={s * W * 0.2 - W * 0.1} y={L * 0.6} width={W * 0.2} height={L * 0.55} rx={W * 0.1} fill={p.skin} {...skinStroke} />
          </g>
        );
      case "fist":
      case "pinch":
        return (
          <g>
            <rect x={-W / 2 - 1} y={L * 0.32} width={W + 2} height={L * 0.38} rx={W * 0.32} fill={p.skin} {...skinStroke} />
            {[-1, 0, 1].map((k) => (
              <line key={k} x1={k * W * 0.22} y1={L * 0.36} x2={k * W * 0.22} y2={L * 0.48} stroke={p.shade} strokeWidth={1.5} strokeLinecap="round" />
            ))}
            <rect x={s * W * 0.18 - W * 0.12} y={L * 0.24} width={W * 0.24} height={L * 0.3} rx={W * 0.12} fill={p.skin} {...skinStroke} transform={`rotate(${s * 30} ${s * W * 0.18} ${L * 0.3})`} />
          </g>
        );
      case "phone":
        // кончики пальцев на краю телефона и большой палец у экрана
        return (
          <g transform={`rotate(${-p.angle + p.itemTilt})`}>
            {[-0.25, 0.05, 0.35].map((k) => (
              <ellipse key={k} cx={-s * L * 0.42 * (1 + 0.9 * p.flat)} cy={k * L * (1 - 0.6 * p.flat)} rx={L * 0.1} ry={L * 0.08} fill={p.skin} {...skinStroke} />
            ))}
            <ellipse cx={s * L * 0.34 * (1 + 0.6 * p.flat)} cy={L * 0.38 * (1 - 0.7 * p.flat)} rx={L * 0.12} ry={L * 0.2} fill={p.skin} {...skinStroke} transform={`rotate(${-s * 25} ${s * L * 0.34} ${L * 0.38})`} />
          </g>
        );
      default:
        // расслабленная кисть: пальцы слегка согнуты
        return (
          <g>
            <path d={`M ${-W / 2} ${L * 0.45} Q ${-W * 0.55} ${L * 0.95} ${0} ${L * 0.98} Q ${W * 0.55} ${L * 0.95} ${W / 2} ${L * 0.45} Z`} fill={p.skin} {...skinStroke} />
            <rect x={s * W * 0.38 - W * 0.1} y={L * 0.2} width={W * 0.2} height={L * 0.36} rx={W * 0.1} fill={p.skin} {...skinStroke} transform={`rotate(${-s * 18} ${s * W * 0.38} ${L * 0.25})`} />
          </g>
        );
    }
  })();
  if (p.part === "back") {
    return (
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
        {palm}
        <g transform={`translate(${grip.x} ${grip.y})`}>{itemEl}</g>
      </g>
    );
  }
  // планшет и рисунок держат за край: ладонь и пальцы за листом/корпусом,
  // спереди виден только большой палец на краю
  if (p.item === "tablet" || p.item === "drawing") {
    const tab = p.item === "tablet";
    return (
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
        <g transform={`translate(${grip.x} ${grip.y}) rotate(${-p.angle + p.itemTilt})`}>
          <ellipse
            cx={s * L * (tab ? 0.2 : 0.06)}
            cy={tab ? L * 0.26 : 0}
            rx={L * (tab ? 0.3 : 0.15)}
            ry={L * (tab ? 0.14 : 0.27)}
            fill={p.skin}
            {...skinStroke}
            transform={tab ? `rotate(${-s * 28} ${s * L * 0.2} ${L * 0.26})` : undefined}
          />
        </g>
      </g>
    );
  }
  return (
    <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
      {p.item === "phone" ? <g transform={`translate(${grip.x} ${grip.y})`}>{fingers}</g> : fingers}
    </g>
  );
};
