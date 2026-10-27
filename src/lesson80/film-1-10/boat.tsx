// Бумажная лодочка Амира: один рисунок модели boatModel.ts на всех планах.
//   • BoatDefs / BoatShadow / BoatBack / BoatHull / BoatFlap — слои модели в
//     локальных единицах (их собирает крупный план BoatCloseView, вставляя
//     руки между слоями);
//   • PaperBoat — вид сбоку в мире комнаты (px), тот же рисунок, детали
//     упрощаются на малом размере;
//   • PaperBoatTop — та же лодочка строго сверху (для плана стола).
// Всё — чистые функции пропсов, без случайностей и анимаций CSS.
import { useId } from "react";
import {
  BOAT_COLORS as C,
  BOAT_CONTACT,
  BOAT_GEOM as G,
  CORNER,
  HINGE,
  HINGE_MID,
  HULL_CUT,
  TOP_GEOM,
  boatScale,
  boatTransform,
  creasePoint,
  flapCorner,
  flapDarkness,
  flapShadowTip,
  flapTurn,
  polyPath,
  topFlapPolygon,
  type Vec,
} from "./boatModel";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const mixHex = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const u = clamp01(t);
  return `rgb(${pa.map((x, i) => Math.round(x + (pb[i] - x) * u)).join(",")})`;
};
const lerpV = (p: Vec, q: Vec, t: number): Vec => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
// детерминированный шум (как hash01 в rig/motion)
const h01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Подробный рисунок — от ≈ 1 px на единицу (крупный план); в комнате (≈ 0.3) — упрощённый.
const isDetailed = (s: number) => s >= 0.9;
// Толщина линии в px экрана → локальные единицы.
const px = (s: number, p: number) => p / s;

const bandFull: readonly Vec[] = [G.deckL, G.deckR, G.bandR, G.bandL];
const bandCut: readonly Vec[] = [HINGE.a, G.deckR, G.bandR, G.bandL, HINGE.b];
const hullFull: readonly Vec[] = [G.deckL, G.deckR, G.botR, G.botL];
const rimPts: readonly Vec[] = [G.deckL, G.deckR, G.farR, G.farL];
const sailPts: readonly Vec[] = [G.sailTop, G.sailR, G.sailL];
// Под отогнувшимся уголком — следующий слой бумаги (внутренний слой борта
// и нос дальнего борта): весь треугольник a–P–b, в тени. Силуэт носа
// остаётся целым — уголок читается как отогнутый, а не оторванный.
const innerReveal: readonly Vec[] = [HINGE.a, CORNER, HINGE.b];
// На малом размере (комната) раскрытый уголок рисуется чуть крупнее
// (вершина дальше от сгиба), чтобы читался и на общем плане.
const ROOM_FLAP_GAIN = 1.5;
const displayCorner = (open: number, det: boolean): Vec => {
  const p = flapCorner(open);
  if (det) return p;
  const k = 1 + (ROOM_FLAP_GAIN - 1) * clamp01(flapTurn(open) / 0.3);
  return lerpV(HINGE_MID, p, k);
};
// Цвет уголка по непрерывной «темноте» (одна шкала для лица и изнанки).
const flapFill = (d: number, det: boolean) => (det ? mixHex("#FDFCF9", "#C9C2B3", d) : mixHex("#F7F4EE", "#A39985", d));

// ---------- Определения: градиенты, фактура бумаги, размытия ----------
export const BoatDefs: React.FC<{ readonly uid: string; readonly s: number }> = ({ uid, s }) => {
  const det = isDetailed(s);
  const fibres = det
    ? Array.from({ length: 34 }, (_, i) => {
        const x = h01(i * 3.1 + 1) * 40;
        const y = h01(i * 5.7 + 2) * 40;
        const a = h01(i * 7.3 + 3) * Math.PI;
        const l = 1.2 + h01(i * 1.9 + 4) * 3.2;
        const dark = h01(i * 2.3 + 5) > 0.45;
        return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * l} y2={y + Math.sin(a) * l} stroke={dark ? "rgba(120,110,90,0.10)" : "rgba(255,255,255,0.55)"} strokeWidth={0.32} strokeLinecap="round" />;
      })
    : null;
  return (
    <defs>
      <linearGradient id={`${uid}-hull`} x1="0" y1="-6" x2="0" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FDFCF9" />
        <stop offset="0.55" stopColor={C.paper} />
        <stop offset="1" stopColor="#ECE8DE" />
      </linearGradient>
      <linearGradient id={`${uid}-hullx`} x1="-118" y1="0" x2="118" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.35" />
        <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="1" stopColor="#8C8270" stopOpacity="0.07" />
      </linearGradient>
      <linearGradient id={`${uid}-rim`} x1="0" y1="-22" x2="0" y2="-6" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#EEEAE0" />
        <stop offset="1" stopColor="#D9D3C5" />
      </linearGradient>
      <linearGradient id={`${uid}-sail`} x1="-44" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.5" stopColor={C.paper} />
        <stop offset="0.5" stopColor="#F1EEE6" />
        <stop offset="1" stopColor="#E9E5DA" />
      </linearGradient>
      <linearGradient id={`${uid}-reveal`} x1={HINGE_MID.x} y1={HINGE_MID.y} x2={CORNER.x} y2={CORNER.y} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#B4AA95" />
        <stop offset="1" stopColor="#CFC8B7" />
      </linearGradient>
      <radialGradient id={`${uid}-contact`} cx="0" cy="0" r="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor="#28233C" stopOpacity="0.3" />
        <stop offset="1" stopColor="#28233C" stopOpacity="0" />
      </radialGradient>
      {det ? (
        <>
          <pattern id={`${uid}-tex`} width={40} height={40} patternUnits="userSpaceOnUse">
            {fibres}
          </pattern>
          <filter id={`${uid}-soft`} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation={px(s, 7)} />
          </filter>
          <filter id={`${uid}-soft2`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={px(s, 2.2)} />
          </filter>
        </>
      ) : null}
    </defs>
  );
};

// ---------- Тень на столе (рисуется без подъёма и наклона) ----------
// lift — мм; тень остаётся на столе, при подъёме бледнеет и расплывается.
export const BoatShadow: React.FC<{ readonly uid: string; readonly s: number; readonly lift?: number }> = ({ uid, s, lift = 0 }) => {
  const det = isDetailed(s);
  const k = clamp01(lift / 14);
  if (!det) {
    return (
      <g opacity={1 - k * 0.55}>
        <path d={G.paths.shadow} fill={C.shadow} transform={`translate(0 ${-2 + k * 2})`} />
        <ellipse cx={2} cy={40} rx={78 + k * 10} ry={4} fill="rgba(40,35,60,0.18)" />
      </g>
    );
  }
  return (
    <g>
      {/* мягкое пятно под корпусом (свет сверху-слева — тень чуть вправо) */}
      <ellipse cx={8 + k * 4} cy={43} rx={92 + k * 18} ry={9 + k * 4} fill="rgba(40,35,60,0.22)" opacity={1 - k * 0.6} filter={`url(#${uid}-soft)`} />
      {/* плотная линия контакта днища */}
      <path d="M-70 40 Q 0 44.5 72 40 Q 0 42 -70 40 Z" fill="rgba(40,35,60,0.35)" opacity={1 - k} filter={`url(#${uid}-soft2)`} />
    </g>
  );
};

// ---------- Дальний борт и парус ----------
export const BoatBack: React.FC<{ readonly uid: string; readonly s: number }> = ({ uid, s }) => {
  const det = isDetailed(s);
  const lw = px(s, det ? 1.6 : 1);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* внутренний (дальний) борт */}
      <path d={polyPath(rimPts)} fill={`url(#${uid}-rim)`} stroke={C.line} strokeWidth={lw} />
      {det ? (
        <>
          {/* кромка дальнего борта — тонкий светлый край бумаги */}
          <line x1={G.farL.x + 2} y1={G.farL.y + 0.9} x2={G.farR.x - 2} y2={G.farR.y + 0.9} stroke={C.edge} strokeWidth={px(s, 1.4)} opacity={0.9} />
          {/* внутренний сгиб дальней полосы */}
          <path d={`M${G.farL.x - 26} -11 L${G.farR.x + 28} -11`} stroke={C.line} strokeWidth={px(s, 1)} opacity={0.45} />
          {/* тень паруса на дальнем борту */}
          <path d="M-10 -6 L52 -6 L50 -14 L4 -12 Z" fill="#5A5040" opacity={0.07} />
        </>
      ) : null}
      {/* парус */}
      <path d={polyPath(sailPts)} fill={det ? `url(#${uid}-sail)` : C.paper} stroke={C.line} strokeWidth={lw} />
      {det ? <path d={polyPath(sailPts)} fill={`url(#${uid}-tex)`} /> : null}
      <line x1={G.sailCrease[0].x} y1={G.sailCrease[0].y} x2={G.sailCrease[1].x} y2={G.sailCrease[1].y} stroke={C.line} strokeWidth={px(s, det ? 1.3 : 0.8)} opacity={det ? 0.85 : 0.7} />
      {det ? <line x1={0.7} y1={-60} x2={0.7} y2={-11} stroke={C.edge} strokeWidth={px(s, 1)} opacity={0.7} /> : null}
    </g>
  );
};

// ---------- Ближний борт (с вырезом при раскрытом уголке) ----------
export const BoatHull: React.FC<{ readonly uid: string; readonly s: number; readonly open: number }> = ({ uid, s, open }) => {
  const det = isDetailed(s);
  const lw = px(s, det ? 1.6 : 1);
  const cut = open > 0.001;
  const hull = cut ? HULL_CUT : hullFull;
  const band = cut ? bandCut : bandFull;
  const reveal = clamp01(flapTurn(open) / 0.25);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* под раскрывшимся уголком — следующий слой бумаги, в тени; кромки носа целы */}
      {cut ? (
        <g>
          <path d={polyPath(innerReveal)} fill={det ? `url(#${uid}-reveal)` : "#A99E89"} />
          {det ? <path d={polyPath(innerReveal)} fill={`url(#${uid}-tex)`} opacity={0.6} /> : null}
          <path d={`M${HINGE.a.x} ${HINGE.a.y} L${CORNER.x} ${CORNER.y} L${HINGE.b.x} ${HINGE.b.y}`} fill="none" stroke={det ? C.line : "#A9A190"} strokeWidth={lw} opacity={0.6 + 0.4 * reveal} />
          {/* тонкая светлая кромка внутреннего слоя у носа */}
          {det ? <path d={`M${CORNER.x + 2.2} ${CORNER.y + 0.9} L${HINGE.b.x - 0.4} ${HINGE.b.y - 1.6}`} fill="none" stroke={C.edge} strokeWidth={px(s, 1.1)} opacity={0.55 * reveal} /> : null}
        </g>
      ) : null}
      <path d={polyPath(hull)} fill={det ? `url(#${uid}-hull)` : C.paper} stroke={C.line} strokeWidth={lw} />
      {det ? (
        <>
          <path d={polyPath(hull)} fill={`url(#${uid}-hullx)`} />
          <path d={polyPath(hull)} fill={`url(#${uid}-tex)`} />
          {/* двойная полоса борта: верхний слой чуть светлее, под кромкой — волосяная тень */}
          <path d={polyPath(band)} fill="#FFFFFF" opacity={0.45} />
          <line x1={G.bandL.x + 0.6} y1={G.bandY + 1.1} x2={G.bandR.x - 0.6} y2={G.bandY + 1.1} stroke="#6A5E48" strokeWidth={px(s, 2.4)} opacity={0.08} />
          <line x1={G.bandL.x} y1={G.bandY} x2={G.bandR.x} y2={G.bandY} stroke={C.line} strokeWidth={px(s, 1.3)} />
          {/* сгиб днища и центральный сгиб — едва заметны */}
          <line x1={G.keelL.x} y1={G.keelY} x2={G.keelR.x} y2={G.keelY} stroke={C.line} strokeWidth={px(s, 1)} opacity={0.45} />
          <line x1={G.centerFold[0].x} y1={G.bandY + 2} x2={G.centerFold[1].x} y2={G.centerFold[1].y} stroke={C.line} strokeWidth={px(s, 1)} opacity={0.32} />
          {/* носы: стопка слоёв — вторая тонкая кромка */}
          <path d={`M${G.bandL.x + 3.2} ${G.bandY + 2} L${G.botL.x + 3.2} ${G.botL.y - 1.5}`} stroke={C.line} strokeWidth={px(s, 1)} opacity={0.5} />
          <path d={`M${G.bandR.x - 3.2} ${G.bandY + 2} L${G.botR.x - 3.2} ${G.botR.y - 1.5}`} stroke={C.line} strokeWidth={px(s, 1)} opacity={0.5} />
          {/* верхняя кромка ближнего борта — светлый край бумаги */}
          <line x1={cut ? HINGE.a.x + 1 : G.deckL.x + 4} y1={G.deckL.y + 0.8} x2={G.deckR.x - 4} y2={G.deckR.y + 0.8} stroke={C.edge} strokeWidth={px(s, 1.6)} />
          {/* днище чуть темнее у стола */}
          <line x1={G.botL.x + 1} y1={G.botL.y - 0.6} x2={G.botR.x - 1} y2={G.botR.y - 0.6} stroke="#B7B0A0" strokeWidth={px(s, 1.4)} opacity={0.6} />
        </>
      ) : (
        <line x1={G.bandL.x} y1={G.bandY} x2={G.bandR.x} y2={G.bandY} stroke={C.line} strokeWidth={lw * 0.8} opacity={0.8} />
      )}
    </g>
  );
};

// ---------- Уголок и его сгиб ----------
// open — 0…1 (раскрытие), pressed — 0…1 (доля сгиба от b к a, прижатая пальцем).
export const BoatFlap: React.FC<{ readonly uid: string; readonly s: number; readonly open: number; readonly pressed?: number }> = ({ uid, s, open, pressed = 0 }) => {
  const det = isDetailed(s);
  const lw = px(s, det ? 1.6 : 1);
  const t = flapTurn(open);
  const tip = displayCorner(open, det);
  const flap: readonly Vec[] = [HINGE.a, tip, HINGE.b];
  const turned = open > 0.001;
  // одна непрерывная шкала темноты: лицо темнеет к ребру, изнанка светлеет до SHADE
  const dk = flapDarkness(open);
  const bw = clamp01((t - 0.42) / 0.16); // 0 — лицо, 1 — изнанка (плавно через ребро)
  const shown = clamp01(t / 0.12); // тень и кромки проявляются с первых градусов поворота
  const pr = clamp01(pressed);
  const pEnd = creasePoint(pr);
  const freeEdge = `M${HINGE.a.x} ${HINGE.a.y} L${tip.x.toFixed(2)} ${tip.y.toFixed(2)} L${HINGE.b.x} ${HINGE.b.y}`;
  // тень уголка падает вправо-вниз (свет слева сверху) на борт рядом со сгибом
  const shadowTip = flapShadowTip(open);
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {turned ? (
        <>
          {det ? (
            <path d={polyPath([HINGE.a, shadowTip, HINGE.b])} fill="#3C3424" opacity={0.26 * shown} filter={`url(#${uid}-soft2)`} />
          ) : (
            <path d={polyPath([HINGE.a, shadowTip, HINGE.b])} fill="#5A4E3A" opacity={0.3 * shown} />
          )}
          {det ? (
            <>
              <linearGradient id={`${uid}-flapface`} x1={HINGE_MID.x} y1={HINGE_MID.y} x2={tip.x} y2={tip.y} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={flapFill(Math.min(1, dk + 0.1 * shown), true)} />
                <stop offset="1" stopColor={flapFill(dk * 0.8, true)} />
              </linearGradient>
              <path d={polyPath(flap)} fill={`url(#${uid}-flapface)`} />
              <path d={polyPath(flap)} fill={`url(#${uid}-tex)`} opacity={1 - dk * 0.6} />
              {/* свободные кромки: тёмный контур и светлый тонкий край бумаги (плавно усиливаются к изнанке) */}
              <path d={freeEdge} fill="none" stroke={mixHex("#C9C4B8", "#B2AB9B", bw)} strokeWidth={lw} />
              <path d={freeEdge} fill="none" stroke={C.edge} strokeWidth={px(s, 1.2 + 0.6 * bw)} opacity={0.6 + 0.4 * bw} transform={`translate(${px(s, 0.9)} ${px(s, 0.9)})`} />
            </>
          ) : (
            <>
              <path d={polyPath(flap)} fill={flapFill(dk, false)} />
              <path d={freeEdge} fill="none" stroke="#A9A190" strokeWidth={px(s, 1.3)} />
            </>
          )}
          {/* сгиб — ребро, на котором держится уголок */}
          <line x1={HINGE.a.x} y1={HINGE.a.y} x2={HINGE.b.x} y2={HINGE.b.y} stroke={det ? "#ADA594" : "#9F9684"} strokeWidth={det ? lw : px(s, 1.2)} />
        </>
      ) : (
        // старый сгиб виден всегда, даже когда уголок сложен
        <line x1={HINGE.a.x + 0.4} y1={HINGE.a.y + 0.6} x2={HINGE.b.x + 0.4} y2={HINGE.b.y - 0.2} stroke={C.line} strokeWidth={px(s, det ? 1.3 : 0.8)} opacity={det ? 0.7 : 0.55} />
      )}
      {/* прижатый пальцем сгиб: чуть чётче линия и узкий блик рядом */}
      {pr > 0.001 && !turned ? (
        <g opacity={det ? 1 : 0.8}>
          <line x1={HINGE.b.x} y1={HINGE.b.y} x2={pEnd.x} y2={pEnd.y} stroke="#B3AC9C" strokeWidth={px(s, det ? 1.7 : 1)} />
          {det ? <line x1={HINGE.b.x + 1.1} y1={HINGE.b.y + 0.6} x2={pEnd.x + 1.1} y2={pEnd.y + 0.6} stroke={C.edge} strokeWidth={px(s, 1.3)} opacity={0.95} /> : null}
          {det ? <line x1={HINGE.b.x - 0.9} y1={HINGE.b.y - 0.9} x2={pEnd.x - 0.9} y2={pEnd.y - 0.9} stroke="#8C8270" strokeWidth={px(s, 1)} opacity={0.12} /> : null}
        </g>
      ) : null}
    </g>
  );
};

// ---------- Лодочка в комнате (вид сбоку, мир px) ----------
export const PaperBoat: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number; // ширина в px мира (по умолчанию 72)
  readonly open?: number;
  readonly pressed?: number;
  readonly lift?: number; // мм над столом (как plan.lift)
  readonly tilt?: number; // градусы (SVG, + по часовой)
  readonly pivot?: Vec; // ось наклона, локальные ед. (plan.pivot); по умолчанию — центр контакта
  readonly shadow?: boolean;
}> = ({ x, y, w = 72, open = 0, pressed = 0, lift = 0, tilt = 0, pivot, shadow = true }) => {
  const uid = `pb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const s = boatScale(w);
  const place = { x: 0, y: 0, w, lift, tilt, pivot: pivot ?? BOAT_CONTACT };
  return (
    // x/y — и как CSS (в HTML), и как атрибуты (если вложено в другой <svg>)
    <svg x={x} y={y} width={1} height={1} overflow="visible" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <BoatDefs uid={uid} s={s} />
      {shadow ? (
        <g transform={boatTransform({ x: 0, y: 0, w })}>
          <BoatShadow uid={uid} s={s} lift={lift} />
        </g>
      ) : null}
      <g transform={boatTransform(place)}>
        <BoatBack uid={uid} s={s} />
        <BoatHull uid={uid} s={s} open={open} />
        <BoatFlap uid={uid} s={s} open={open} pressed={pressed} />
      </g>
    </svg>
  );
};

// ---------- Та же лодочка строго сверху ----------
// x, y — центр (px того вида), w — длина (px), rot — градусы. Свет — слева
// сверху: тень на столе вправо-вниз. Сверху видны: острый корпус с кромками
// обоих бортов, две глубокие «лодочки»-колодцы по сторонам паруса и сам парус —
// острый гребень посередине (одна грань на свету, другая в тени).
const TOP_SAIL_W = 7; // полуширина основания паруса сверху (ед.)
const topNearWell = "M-102 -1.2 L-63 -22.6 L63 -22.6 L102 -1.2 L44 -1.2 L-44 -1.2 Z";
const topFarWell = "M-102 1.2 L-63 22.6 L63 22.6 L102 1.2 L44 1.2 L-44 1.2 Z";
// контур корпуса сверху: острые носы, борта чуть выгнуты посередине
const topHull = "M-118 0 L-64 -27 Q0 -30.5 64 -27 L118 0 L64 27 Q0 30.5 -64 27 Z";
export const PaperBoatTop: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly rot?: number; readonly open?: number }> = ({ x, y, w, rot = 0, open = 0 }) => {
  const uid = `pbt${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const s = boatScale(w);
  const lw = px(s, Math.max(0.8, Math.min(1.5, s * 1.3)));
  const o = clamp01(open);
  const flap = topFlapPolygon(o);
  const T = TOP_GEOM;
  const half = T.sailHalfLen;
  const sw = TOP_SAIL_W;
  return (
    <svg x={x} y={y} width={1} height={1} overflow="visible" style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${uid}-wn`} x1="0" y1="-22" x2="0" y2="-1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ECE8DF" />
          <stop offset="1" stopColor="#CBC3B2" />
        </linearGradient>
        <linearGradient id={`${uid}-wf`} x1="0" y1="22" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E2DDD1" />
          <stop offset="1" stopColor="#C3BBA8" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rot}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
        {/* тень на столе — в сторону от света */}
        <path d={topHull} fill="rgba(40,35,60,0.13)" transform="translate(6 8)" />
        <path d={topHull} fill="rgba(40,35,60,0.10)" transform="translate(3 4)" />
        {/* кромки бортов (двойная полоса бумаги сверху) */}
        <path d={topHull} fill={C.paper} stroke={C.line} strokeWidth={lw} />
        {/* колодцы по обе стороны паруса: ближний на свету, дальний в тени */}
        <path d={topNearWell} fill={`url(#${uid}-wn)`} stroke={C.line} strokeWidth={lw * 0.7} />
        <path d={topFarWell} fill={`url(#${uid}-wf)`} stroke={C.line} strokeWidth={lw * 0.7} />
        {/* сгиб дна, уходящий к носам */}
        <path d={`M-104 0 L${-half} 0 M${half} 0 L104 0`} stroke="#B3AB99" strokeWidth={lw * 0.8} />
        {/* тень паруса на дальнем колодце (свет слева сверху) */}
        <path d={`M${-half} 1 L20 21 L${half} 1 Z`} fill="#3C3424" opacity={0.2} />
        {/* тонкий сгиб двойной полосы вдоль кромок */}
        <path d="M-108 -1.5 L-64 -24.6 L64 -24.6 L108 -1.5 M-108 1.5 L-64 24.6 L64 24.6 L108 1.5" fill="none" stroke={C.line} strokeWidth={lw * 0.55} opacity={0.55} />
        {/* парус — острый гребень: ближняя грань на свету, дальняя в тени */}
        <path d={`M${-half} 0 L0 ${-sw} L${half} 0 Z`} fill={C.paper} stroke={C.line} strokeWidth={lw * 0.8} />
        <path d={`M${-half} 0 L0 ${sw} L${half} 0 Z`} fill="#D3CCBC" stroke={C.line} strokeWidth={lw * 0.8} />
        <line x1={-half} y1={0} x2={half} y2={0} stroke="#9F9684" strokeWidth={lw * 0.9} />

        {/* уголок у левого носа на ближнем борту */}
        {o > 0.01 ? (
          <>
            <path d={polyPath([T.hingeA, T.cornerClosed, T.hingeB])} fill="#C6BEAC" />
            <path d={polyPath([T.hingeA, { x: flap[1].x + 3, y: flap[1].y + 4 }, T.hingeB])} fill="#3C3424" opacity={0.18 * o} />
            <path d={polyPath(flap)} fill={mixHex("#F4F1EA", "#D6CFC0", o)} stroke="#A9A190" strokeWidth={lw} />
          </>
        ) : null}
        <line x1={T.hingeA.x} y1={T.hingeA.y} x2={T.hingeB.x} y2={T.hingeB.y} stroke={o > 0.01 ? "#A9A190" : C.line} strokeWidth={lw * 0.9} opacity={o > 0.01 ? 1 : 0.6} />
      </g>
    </svg>
  );
};
