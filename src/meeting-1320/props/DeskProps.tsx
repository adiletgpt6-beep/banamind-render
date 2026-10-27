// Стол директора сверху (сцена 4b): ноутбук, бумаги с ручкой, телефон,
// кружка — и ключи от машины (простой брелок без логотипа). KeysPickup —
// рука директора (CloseHand: синий рукав пиджака, голубая манжета)
// входит в кадр снизу справа, берёт ключи и поднимает их: после захвата
// ключи движутся вместе с пальцами.
//
// Кадр — полный 1080×1920 (мир = кадр; камера { x: 540, y: 960, zoom: 1 }
// или лёгкий наезд). Всё — от параметров 0…1, без своего времени.
import { box } from "../kit";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { C } from "../theme";
import { CloseHand, type CloseShape } from "./CloseHand";

// Цвета руки директора (кожа, тень, рукав пиджака, манжета рубашки).
export const DIRECTOR_HAND = { skin: "#DCAA84", shade: "#B9845F", sleeve: "#2C3B5E", cuff: "#BFD6EE" } as const;

// Раскладка стола (px кадра).
export const DESK_TOP = {
  keys: { x: 610, y: 1170, angle: -24 }, // центр брелока, поворот связки
  laptop: { x: 560, y: 610, w: 600 }, // центр клавиатурной части
  papers: { x: 220, y: 1010 },
  phone: { x: 930, y: 860 },
  cup: { x: 150, y: 330 },
  edge: 1820, // ближний край стола (дальше — колени/пол в тени)
} as const;

const ink = (h: string, k = 0.66) => {
  const n = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) * k);
  return `#${n.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
};

// ---------- Ключи (вид сверху) ----------
// (x, y) — центр брелока; angle — поворот связки (градусы); k — масштаб;
// swing — покачивание ключа на кольце (градусы); shadow 0…1 — тень на
// столе (лежат — 1; в руке — дальше и мягче, shadowOff — смещение).
export const CarKeys: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly k?: number; readonly swing?: number; readonly shadow?: number; readonly shadowOff?: number }> = ({ x, y, angle = 0, k = 1, swing = 0, shadow = 1, shadowOff = 0 }) => {
  const fob = "#2E333B";
  const metal = "#C7CCD3";
  const body = (sh: boolean) => {
    const f = sh ? "rgba(25,30,45,1)" : undefined;
    return (
      <g>
        {/* кольцо */}
        <circle cx={0} cy={-118} r={36} fill="none" stroke={f ?? metal} strokeWidth={8} />
        {!sh ? <circle cx={0} cy={-118} r={36} fill="none" stroke="#8E959F" strokeWidth={2} /> : null}
        {/* маленький ключ на кольце */}
        <g transform={`rotate(${38 + swing} 0 -118)`}>
          <rect x={-6} y={-118 + 30} width={12} height={92} rx={4} fill={f ?? "#D8B76A"} stroke={f ?? ink("#D8B76A", 0.7)} strokeWidth={2.5} />
          <circle cx={0} cy={-118 + 36} r={16} fill={f ?? "#D8B76A"} stroke={f ?? ink("#D8B76A", 0.7)} strokeWidth={2.5} />
          <circle cx={0} cy={-118 + 36} r={5} fill={f ?? "#8E7A4A"} />
          {!sh ? <path d={`M 6 ${-118 + 64} l 6 0 l 0 8 l -6 0 M 6 ${-118 + 80} l 8 0 l 0 6 l -8 0`} stroke={ink("#D8B76A", 0.7)} strokeWidth={2} fill="none" /> : null}
        </g>
        {/* кожаная бирка */}
        <g transform={`rotate(${-42 - swing * 0.6} 0 -118)`}>
          <rect x={-14} y={-118 + 26} width={28} height={70} rx={12} fill={f ?? "#6B4B3A"} stroke={f ?? ink("#6B4B3A", 0.7)} strokeWidth={2.5} />
          {!sh ? <rect x={-8} y={-118 + 34} width={16} height={54} rx={7} fill="none" stroke="#8C6A55" strokeWidth={2} strokeDasharray="4 3" /> : null}
        </g>
        {/* звено к брелоку */}
        <rect x={-10} y={-92} width={20} height={26} rx={8} fill={f ?? metal} stroke={f ?? "#8E959F"} strokeWidth={2} />
        {/* брелок: графит, три кнопки (без логотипа) */}
        <rect x={-46} y={-72} width={92} height={146} rx={40} fill={f ?? fob} stroke={f ?? "#15181D"} strokeWidth={3} />
        {!sh ? (
          <>
            <rect x={-38} y={-64} width={34} height={128} rx={17} fill="#FFFFFF" opacity={0.08} />
            {[-30, 6, 42].map((cy, i) => (
              <g key={cy}>
                <circle cx={0} cy={cy} r={15} fill="#3D434D" stroke="#20242B" strokeWidth={2} />
                {i === 0 ? <path d="M -6 -28 l 0 -5 a 6 6 0 0 1 12 0 l 0 5 M -8 -28 l 16 0 l 0 10 l -16 0 Z" stroke="#AEB5BF" strokeWidth={2} fill="none" /> : null}
                {i === 1 ? <path d="M -6 8 l 0 -5 a 6 6 0 0 1 12 0 M -8 8 l 16 0 l 0 10 l -16 0 Z" stroke="#AEB5BF" strokeWidth={2} fill="none" /> : null}
                {i === 2 ? <circle cx={0} cy={42} r={5} fill="#AEB5BF" /> : null}
              </g>
            ))}
          </>
        ) : null}
        {/* выкидное лезвие ключа */}
        <path d="M -9 72 L 9 72 L 9 196 L 2 212 L -9 204 Z" fill={f ?? metal} stroke={f ?? "#8E959F"} strokeWidth={2.5} strokeLinejoin="round" />
        {!sh ? <path d="M -2 84 L -2 196" stroke="#9AA1AB" strokeWidth={3} /> : null}
      </g>
    );
  };
  return (
    <g>
      {shadow > 0 ? (
        <g transform={`translate(${x + 8 + shadowOff} ${y + 12 + shadowOff * 1.3}) rotate(${angle}) scale(${k})`} opacity={0.22 * shadow} style={{ filter: `blur(${3 + shadowOff * 0.25}px)` }}>
          {body(true)}
        </g>
      ) : null}
      <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${k})`}>{body(false)}</g>
    </g>
  );
};

// ---------- Стол сверху ----------
export const DeskTopDown: React.FC<{ readonly evening?: number; readonly children?: React.ReactNode }> = ({ evening = 0, children }) => {
  const e = clamp(evening);
  const wood = e > 0 ? "#DFC39E" : "#E3CCAA";
  const L = DESK_TOP.laptop;
  const lw = L.w;
  const lh = L.w * 0.62;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" })}>
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <defs>
          <linearGradient id="dtd-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={ink(wood, 0.94)} />
            <stop offset="0.5" stopColor={wood} />
            <stop offset="1" stopColor={ink(wood, 0.96)} />
          </linearGradient>
          <linearGradient id="dtd-edge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4A5264" />
            <stop offset="1" stopColor="#5E6678" />
          </linearGradient>
          <radialGradient id="dtd-light" cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.22} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={DESK_TOP.edge} fill="url(#dtd-wood)" />
        {/* волокна дерева */}
        {Array.from({ length: 22 }).map((_, i) => {
          const y = 40 + i * 76;
          return <path key={i} d={`M -20 ${y} C 260 ${y + 10 * Math.sin(i * 1.7)} 620 ${y - 14 * Math.cos(i * 1.3)} 1100 ${y + 6 * Math.sin(i)}`} stroke={ink(wood, 0.86)} strokeWidth={2} fill="none" opacity={0.45} />;
        })}
        <rect x={0} y={0} width={1080} height={DESK_TOP.edge} fill="url(#dtd-light)" />
        {/* ближний край стола и тень под ним */}
        <rect x={0} y={DESK_TOP.edge} width={1080} height={18} fill={ink(wood, 0.78)} />
        <rect x={0} y={DESK_TOP.edge + 18} width={1080} height={400} fill="url(#dtd-edge)" />
        {/* ноутбук сверху: крышка откинута (видна торцом), клавиатура */}
        <g>
          <rect x={L.x - lw / 2 + 14} y={L.y - lh / 2 + 18} width={lw} height={lh} rx={26} fill="rgba(30,40,60,0.22)" style={{ filter: "blur(8px)" }} />
          <rect x={L.x - lw / 2} y={L.y - lh / 2} width={lw} height={lh} rx={26} fill="#C3C8D0" stroke="#6E7682" strokeWidth={3} />
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 13 }).map((__, c) => <rect key={`${r}-${c}`} x={L.x - lw / 2 + 34 + c * ((lw - 68) / 13)} y={L.y - lh / 2 + 40 + r * 40} width={(lw - 68) / 13 - 7} height={31} rx={6} fill="#5B616C" />),
          )}
          <rect x={L.x - lw * 0.17} y={L.y + lh / 2 - 118} width={lw * 0.34} height={92} rx={12} fill="#AEB4BE" stroke="#8E959F" strokeWidth={2} />
          <path d={`M ${L.x - lw / 2 + 8} ${L.y - lh / 2} L ${L.x + lw / 2 - 8} ${L.y - lh / 2} L ${L.x + lw / 2 - 20} ${L.y - lh / 2 - 74} L ${L.x - lw / 2 + 20} ${L.y - lh / 2 - 74} Z`} fill="#9CA3AE" stroke="#6E7682" strokeWidth={3} strokeLinejoin="round" />
          <rect x={L.x - lw / 2 + 24} y={L.y - lh / 2 - 74} width={lw - 48} height={10} rx={5} fill="#D3D7DE" />
        </g>
        {/* бумаги и ручка */}
        <g transform={`translate(${DESK_TOP.papers.x} ${DESK_TOP.papers.y}) rotate(-9)`}>
          <rect x={-150} y={-200} width={300} height={410} rx={6} fill="rgba(30,40,60,0.16)" transform="translate(10 12)" style={{ filter: "blur(5px)" }} />
          <rect x={-150} y={-200} width={300} height={410} rx={6} fill="#FBFAF6" stroke="#CFC8BA" strokeWidth={3} />
          <rect x={-130} y={-180} width={300} height={410} rx={6} fill="#FFFFFF" stroke="#CFC8BA" strokeWidth={3} transform="rotate(6)" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={-90} y={-130 + i * 46} width={[200, 170, 210, 150, 190, 120, 160][i]} height={12} rx={6} fill={C.navy} opacity={0.32} transform="rotate(6)" />
          ))}
          <g transform="translate(40 120) rotate(-30)">
            <rect x={-120} y={-9} width={240} height={18} rx={9} fill={C.navy} stroke={ink("#172A46", 0.7)} strokeWidth={2} />
            <path d="M 120 -8 L 146 0 L 120 8 Z" fill="#C7CCD3" />
            <rect x={-90} y={-12} width={50} height={6} rx={3} fill="#C7CCD3" />
          </g>
        </g>
        {/* телефон (экраном вниз — без уведомлений) */}
        <g transform={`translate(${DESK_TOP.phone.x} ${DESK_TOP.phone.y}) rotate(14)`}>
          <rect x={-74} y={-150} width={148} height={300} rx={30} fill="rgba(30,40,60,0.22)" transform="translate(8 12)" style={{ filter: "blur(5px)" }} />
          <rect x={-74} y={-150} width={148} height={300} rx={30} fill="#3A4150" stroke="#20252F" strokeWidth={3} />
          <rect x={-46} y={-124} width={52} height={62} rx={16} fill="#2A303B" stroke="#555D6B" strokeWidth={2} />
          <circle cx={-32} cy={-108} r={10} fill="#1A1E26" />
          <circle cx={-12} cy={-86} r={10} fill="#1A1E26" />
        </g>
        {/* кружка с кофе */}
        <g transform={`translate(${DESK_TOP.cup.x} ${DESK_TOP.cup.y})`}>
          <circle cx={10} cy={14} r={92} fill="rgba(30,40,60,0.18)" style={{ filter: "blur(6px)" }} />
          <path d="M 70 -20 q 60 0 60 24 q 0 24 -60 24" stroke="#E9EDF2" strokeWidth={18} fill="none" />
          <circle cx={0} cy={0} r={86} fill="#FFFFFF" stroke="#C9D0D8" strokeWidth={4} />
          <circle cx={0} cy={0} r={68} fill="#7A4B32" />
          <ellipse cx={-18} cy={-20} rx={26} ry={12} fill="#9A6646" opacity={0.6} />
        </g>
      </svg>
      {children}
      {e > 0 ? <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: `rgba(255,176,96,${0.14 * e})` })} /> : null}
    </div>
  );
};

// ---------- Рука берёт ключи ----------
// reach 0…1 — кисть входит снизу справа к ключам (раскрытая); grip 0…1 —
// пальцы сводятся и сжимаются (касание при grip ≈ 0,35 — звук
// keys-pickup); lift 0…1 — кисть с ключами поднимается к камере (крупнее,
// тень уходит и размывается, ключ покачивается); exit 0…1 — уносит из
// кадра вниз вправо. Ключи до захвата лежат в DESK_TOP.keys.
export const KEYS_GRIP_TOUCH = 0.35;
export const KeysPickup: React.FC<{ readonly reach: number; readonly grip: number; readonly lift?: number; readonly exit?: number; readonly hand?: { readonly skin: string; readonly shade: string; readonly sleeve: string; readonly cuff?: string } }> = ({ reach, grip, lift = 0, exit = 0, hand = DIRECTOR_HAND }) => {
  const K = DESK_TOP.keys;
  const L = 300; // длина кисти
  const ang = 148; // кисть смотрит вверх-влево (из-за правого нижнего угла)
  const rad = (ang * Math.PI) / 180;
  // точка захвата в координатах кисти (центр кулака)
  const G = { x: 0, y: 0.6 * L };
  const rot = (p: { x: number; y: number }) => ({ x: p.x * Math.cos(rad) - p.y * Math.sin(rad), y: p.x * Math.sin(rad) + p.y * Math.cos(rad) });
  const g = rot(G);
  const wristAt = { x: K.x - g.x, y: K.y - g.y };
  const r = easeInOut(clamp(reach));
  const from = { x: wristAt.x + 520, y: wristAt.y + 760 };
  const li = easeInOut(clamp(lift));
  const ex = easeInOut(clamp(exit));
  const held = grip >= KEYS_GRIP_TOUCH + 0.1;
  const wrist = {
    x: lerp(from.x, wristAt.x, r) + 30 * li + 600 * ex,
    y: lerp(from.y, wristAt.y, r) - 70 * li + 900 * ex,
  };
  const zoom = 1 + 0.16 * li + 0.08 * ex; // ближе к камере
  const shape: CloseShape = grip < 0.2 ? "open" : grip < 0.55 ? "pinch" : "grip";
  // ключи: лежат — на месте; взяты — в кулаке, у центра кисти
  const keyPos = held ? { x: wrist.x + g.x * zoom, y: wrist.y + g.y * zoom } : { x: K.x, y: K.y };
  const swing = held ? 14 * Math.sin(li * 7.5) * (1 - li * 0.6) + 10 * li : 0;
  const keyAng = held ? lerp(K.angle, ang - 180 + 8, easeOut(clamp((grip - 0.45) / 0.4))) : K.angle;
  const handShadow = 0.2 * (1 - 0.5 * li);
  return (
    <svg width={1080} height={1920} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* тень кисти на столе */}
      {r > 0 ? <ellipse cx={wrist.x + g.x * 0.6 + 30 + 60 * li} cy={wrist.y + g.y * 0.6 + 40 + 80 * li} rx={150} ry={110} fill={`rgba(25,30,45,${handShadow})`} transform={`rotate(${ang - 90} ${wrist.x + g.x * 0.6 + 30 + 60 * li} ${wrist.y + g.y * 0.6 + 40 + 80 * li})`} style={{ filter: `blur(${14 + 18 * li}px)` }} /> : null}
      <CarKeys x={keyPos.x} y={keyPos.y} angle={keyAng} k={held ? zoom : 1} swing={swing} shadow={held ? 1 - 0.4 * li : 1} shadowOff={held ? 40 * li + 20 : 0} />
      {r > 0 ? (
        <g transform={`translate(${wrist.x} ${wrist.y}) scale(${zoom}) translate(${-wrist.x} ${-wrist.y})`}>
          <CloseHand x={wrist.x} y={wrist.y} angle={ang} size={L} skin={hand.skin} shade={hand.shade} sleeve={hand.sleeve} cuff={hand.cuff} shape={shape} armLen={3.4} />
        </g>
      ) : null}
    </svg>
  );
};

// Один параметр u 0…1 → фазы KeysPickup (тянется 0–0,4, берёт 0,4–0,55,
// поднимает 0,55–0,85, уносит 0,85–1). Касание — u = KEYS_TOUCH_U.
export const keysPickupAt = (u: number) => ({
  reach: clamp(u / 0.4),
  grip: clamp((u - 0.38) / 0.17),
  lift: clamp((u - 0.55) / 0.3),
  exit: clamp((u - 0.85) / 0.15),
});
export const KEYS_TOUCH_U = 0.38 + KEYS_GRIP_TOUCH * 0.17;
