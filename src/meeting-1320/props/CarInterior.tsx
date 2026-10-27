// Крупные планы посадки (сцена 5): заднее сиденье через открытую заднюю
// правую дверь и защёлка ремня. Кадр 1080×1920, свои координаты.
//
// BeltClose — сын сидит на заднем сиденье (рюкзак снят и лежит рядом),
// повернулся к отцу (отец снаружи, слева за кадром). Рука отца (рукав
// тёмно-синего пиджака, светло-голубая манжета) держит язычок ремня и
// ведёт его от стойки у двери через ПЛЕЧО и грудь сына к замку у его
// левого бедра (никогда через шею). Ремень — непрерывная лента: верхняя
// ветвь от точки крепления на стойке через плечо к язычку, нижняя
// (поясная) — от нижнего крепления у двери к язычку.
// BuckleClose — язычок входит в замок, короткий «щёлк», кисть отпускает.
import { Actor } from "../rig/Actor";
import { clamp, easeInOut, lerp, smoothstep, type Vec } from "../rig/motion";
import { box } from "../kit";
import { CloseHand } from "./CloseHand";
import { M13_HANDS } from "./hands";
import { mix } from "../sets/Office31";
import { C } from "../theme";

const BELT = "#3B404B";
const BELT_EDGE = "#565C69";
const BELT_W = 50;

// Геометрия плана BeltClose (координаты кадра).
// Сын (рост 1560 px в этом плане): таз ≈ y 1390, плечи ≈ y 960, центр
// головы ≈ y 775; правое плечо (ближе к двери) — слева в кадре.
export const BELT_SHOT = {
  son: { x: 560, y: 2020, h: 1560 }, // place сына (ступни ниже кадра)
  seat: 640, // высота сиденья над ступнями (px)
  anchor: { x: 250, y: 812 }, // верхнее крепление на стойке у двери (за плечом)
  shoulder: { x: 452, y: 962 }, // через правое плечо — между шеей и рукой
  lowAnchor: { x: 252, y: 1446 }, // нижнее крепление у порога
  park: { x: 262, y: 1176 }, // язычок висит у стойки до начала
  buckle: { x: 724, y: 1420 }, // замок у левого бедра сына
} as const;

const lerpV = (a: Vec, b: Vec, t: number): Vec => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

// Положение язычка (кончик) при протягивании t 0…1: дуга по груди к замку.
export const tongueAt = (t: number): Vec => {
  const B = BELT_SHOT;
  const e = easeInOut(clamp(t));
  const mid = { x: 540, y: 1188 };
  // квадратичная кривая park → mid → buckle (чуть выше прямой — над коленями)
  const a = lerpV(B.park, mid, e);
  const b = lerpV(mid, B.buckle, e);
  return lerpV(a, b, e);
};

// Лента ремня по ломаной (сглаженные углы): обводка, заливка, строчка.
const Band: React.FC<{ readonly pts: readonly Vec[]; readonly w?: number }> = ({ pts, w = BELT_W }) => {
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    if (i < pts.length - 1) {
      const n = pts[i + 1];
      const a = lerpV(pts[i - 1], p, 0.82);
      const b = lerpV(p, n, 0.18);
      return `${acc} L ${a.x} ${a.y} Q ${p.x} ${p.y} ${b.x} ${b.y}`;
    }
    return `${acc} L ${p.x} ${p.y}`;
  }, "");
  return (
    <g>
      <path d={d} stroke="#20232A" strokeWidth={w + 6} fill="none" strokeLinejoin="round" strokeLinecap="butt" />
      <path d={d} stroke={BELT} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="butt" />
      <path d={d} stroke={BELT_EDGE} strokeWidth={w * 0.62} fill="none" strokeLinejoin="round" strokeDasharray="10 9" opacity={0.6} />
    </g>
  );
};

// Язычок ремня (металл) в точке p, направление ang (градусы).
const Tongue: React.FC<{ readonly p: Vec; readonly ang: number; readonly k?: number }> = ({ p, ang, k = 1 }) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${ang}) scale(${k})`}>
    <rect x={-46} y={-30} width={54} height={60} rx={10} fill="#2A2E36" />
    <path d="M 4 -24 L 70 -18 Q 78 0 70 18 L 4 24 Z" fill="#D5DBE2" stroke="#7D8794" strokeWidth={3} />
    <rect x={26} y={-8} width={30} height={16} rx={6} fill="#9AA4B0" />
  </g>
);

// Замок ремня с красной кнопкой; x, y — устье (куда входит язычок).
const Buckle: React.FC<{ readonly x: number; readonly y: number; readonly ang?: number; readonly k?: number; readonly flash?: number }> = ({ x, y, ang = 30, k = 1, flash = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${k})`}>
    <rect x={8} y={-40} width={150} height={80} rx={18} fill="#22252C" stroke="#111318" strokeWidth={3} />
    <rect x={36} y={-24} width={58} height={48} rx={10} fill="#C9463E" stroke="#8E2D27" strokeWidth={3} />
    <rect x={150} y={-22} width={70} height={44} fill="#2A2E36" />
    {flash > 0 ? (
      <g opacity={flash}>
        {[-50, -10, 30].map((a) => (
          <line key={a} x1={0} y1={0} x2={-60 * Math.cos((a * Math.PI) / 180) - 10} y2={-60 * Math.sin((a * Math.PI) / 180) - 40} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" transform="translate(-6 -10)" />
        ))}
      </g>
    ) : null}
  </g>
);

const angleOf = (a: Vec, b: Vec) => (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

// Фон салона за открытой дверью: потолок, стойки, дальнее окно (двор),
// спинка и подушка дивана, рюкзак рядом.
const Interior: React.FC = () => (
  <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
    {/* дальнее окно: светлый двор, размытые деревья */}
    <rect x={0} y={0} width={1080} height={1920} fill="#3A404C" />
    <rect x={420} y={250} width={680} height={560} rx={60} fill="#CFE2EF" />
    <circle cx={700} cy={560} r={140} fill={C.tree} opacity={0.55} />
    <circle cx={900} cy={500} r={170} fill={C.treeDeep} opacity={0.45} />
    <rect x={420} y={250} width={680} height={560} rx={60} fill="none" stroke="#2C313B" strokeWidth={30} />
    {/* потолок */}
    <path d="M 0 0 L 1080 0 L 1080 230 Q 540 300 0 250 Z" fill="#8E949F" />
    {/* спинка дивана и подголовник */}
    <path d="M 120 880 Q 140 800 300 790 L 980 800 Q 1080 810 1080 900 L 1080 1500 L 120 1500 Z" fill="#59606E" />
    <rect x={410} y={600} width={300} height={200} rx={60} fill="#626A79" />
    <rect x={540} y={790} width={14} height={30} fill="#9AA0AA" />
    <path d="M 840 880 L 840 1480" stroke="#4E5562" strokeWidth={6} opacity={0.6} />
    {/* подушка дивана */}
    <path d="M 60 1480 Q 540 1440 1080 1470 L 1080 1920 L 60 1920 Z" fill="#646C7A" />
    {/* рюкзак сына (снят, лежит рядом на сиденье) */}
    <g>
      <rect x={880} y={1180} width={230} height={330} rx={60} fill="#E9783A" stroke={mix("#E9783A", "#000000", 0.4)} strokeWidth={5} />
      <rect x={910} y={1330} width={170} height={140} rx={30} fill={mix("#E9783A", "#000000", 0.12)} stroke={mix("#E9783A", "#000000", 0.4)} strokeWidth={4} />
      <path d="M 920 1190 Q 990 1110 1060 1190" stroke="#2A3F6B" strokeWidth={18} fill="none" />
    </g>
  </svg>
);

// Проём двери (передний план): стойки и порог, светлое снаружи по краю.
const DoorFrame: React.FC = () => (
  <svg width={1080} height={1920} style={box({ left: 0, top: 0, pointerEvents: "none" })}>
    {/* задняя стойка (у края кадра слева) и порог */}
    <path d="M 0 0 L 200 0 L 214 520 Q 220 900 196 1520 L 0 1600 Z" fill="#5F7084" stroke="#334152" strokeWidth={6} />
    <path d="M 186 520 L 196 1500" stroke="#4D5D70" strokeWidth={14} />
    <path d="M 0 1600 L 196 1520 L 1080 1600 L 1080 1920 L 0 1920 Z" fill="#2B3039" />
    <path d="M 196 1520 L 1080 1600" stroke="#5F7084" strokeWidth={22} />
    {/* крепление ремня на стойке */}
    <rect x={BELT_SHOT.anchor.x - 30} y={BELT_SHOT.anchor.y - 40} width={60} height={86} rx={16} fill="#2A2E36" stroke="#111318" strokeWidth={3} />
    <rect x={BELT_SHOT.lowAnchor.x - 26} y={BELT_SHOT.lowAnchor.y - 22} width={52} height={44} rx={10} fill="#2A2E36" />
  </svg>
);

export const BeltClose: React.FC<{
  readonly f: number;
  readonly pull: number; // 0…1 — язычок от стойки к замку
  readonly click: number; // 0…1 — язычок вошёл в замок
  readonly release: number; // 0…1 — кисть отпускает и уходит
  readonly look?: number; // сын смотрит на отца (−) или вниз на ремень (+)
  readonly smile?: number;
}> = ({ f, pull, click, release, look = 0, smile = 1 }) => {
  const B = BELT_SHOT;
  const t = clamp(pull);
  const T = click > 0 ? lerpV(tongueAt(1), { x: B.buckle.x - 6, y: B.buckle.y - 4 }, clamp(click)) : tongueAt(t);
  // верхняя ветвь ложится на плечо, когда язычок уходит от стойки
  const over = smoothstep(t / 0.35);
  const P = lerpV(lerpV(B.anchor, T, 0.45), B.shoulder, over);
  const chest = lerpV(B.shoulder, T, 0.5);
  const upper = over > 0.5 ? [B.anchor, P, chest, T] : [B.anchor, P, T];
  const lower = [B.lowAnchor, lerpV(B.lowAnchor, T, 0.5), T];
  const ang = angleOf(over > 0.5 ? chest : P, T);
  const hand = M13_HANDS.director;
  const away = easeInOut(clamp(release));
  const handAt = { x: T.x - 26 - away * 560, y: T.y + 16 + away * 120 };
  const S = B.son;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" })}>
      <Interior />
      <Actor
        uid="belt-son"
        look="m13Son"
        f={f}
        place={() => ({ x: S.x, y: S.y, h: S.h })}
        face={() => lerp(-0.32, 0.1, clamp(look))}
        pose={() => ({
          sit: 1,
          seat: B.seat,
          packOff: true,
          expr: smile > 0.5 ? "smile" : "softSmile",
          lookY: lerp(0, 0.55, clamp(look)),
          lookX: -0.2 * (1 - clamp(look)),
          armL: { target: { x: S.x - 62, y: 1452 }, elbow: "hang", shape: "relax" },
          armR: { target: { x: S.x + 70, y: 1462 }, elbow: "hang", shape: "relax" },
        })}
        seed={5}
      />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <Buckle x={B.buckle.x} y={B.buckle.y} ang={28} flash={click > 0.5 && click < 1 ? 1 - Math.abs(click - 0.75) * 4 : 0} />
        <Band pts={lower} />
        <Band pts={upper} />
        <Tongue p={T} ang={ang} />
      </svg>
      <DoorFrame />
      {release < 1 ? (
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
          <CloseHand {...hand} x={handAt.x} y={handAt.y} angle={-90 + 0.35 * ang} size={104} shape={away > 0.3 ? "open" : "pinch"} mirror armLen={7} />
        </svg>
      ) : null}
    </div>
  );
};

// Экстремально крупно: язычок входит в замок, «щёлк», кисть отпускает.
export const BuckleClose: React.FC<{ readonly insert: number; readonly release: number }> = ({ insert, release }) => {
  const e = easeInOut(clamp(insert));
  const clickFlash = insert > 0.85 && insert < 1.2 ? 1 - Math.abs(insert - 1) * 5 : 0;
  const away = easeInOut(clamp(release));
  const bx = 600;
  const by = 1040;
  const tip = { x: lerp(210, bx - 10, e), y: lerp(860, by - 4, e) };
  const hand = M13_HANDS.director;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", backgroundColor: "#646C7A" })}>
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {/* ткань сиденья и брюки сына (серые) */}
        <rect x={0} y={0} width={1080} height={1920} fill="#5E6674" />
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1={0} y1={i * 150} x2={1080} y2={i * 150 + 80} stroke="#6A7280" strokeWidth={6} opacity={0.5} />
        ))}
        <path d="M 640 0 Q 900 500 1080 700 L 1080 0 Z" fill="#59606F" stroke="#454B57" strokeWidth={6} />
        <path d="M 0 1300 Q 400 1180 1080 1320 L 1080 1920 L 0 1920 Z" fill="#59606F" stroke="#454B57" strokeWidth={6} />
        {/* ремень к язычку */}
        <Band pts={[{ x: -100, y: 420 }, { x: tip.x - 120, y: tip.y - 70 }, tip]} w={120} />
        <Buckle x={bx} y={by} ang={20} k={2.4} flash={clickFlash} />
        <Tongue p={tip} ang={20} k={2.4} />
      </svg>
      {release < 1 ? (
        <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
          <CloseHand {...hand} x={tip.x - 150 - away * 500} y={tip.y + 40 + away * 300} angle={-75} size={330} shape={away > 0.25 ? "open" : "pinch"} mirror armLen={4} />
        </svg>
      ) : null}
    </div>
  );
};
