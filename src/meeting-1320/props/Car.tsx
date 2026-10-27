// Семейная машина №31 — обычный компактный седан серо-синего цвета, без
// надписей, логотипов и «такси»-раскраски. Вид сбоку.
// Единицы машины: длина 1000 (≈ 4,4 м), (0, 0) — земля под серединой,
// вверх — минус; нос — при x = −500. dir = −1 — нос ВПРАВО (по умолчанию),
// dir = 1 — нос влево. Масштаб к персонажам — CAR_SCALE (scenes/common.ts).
// Кыргызстан — левый руль: при носе вправо зрителю обращён правый,
// пассажирский бок (к тротуару); при носе влево — левый, водительский.
// Двери вращаются вокруг шарнира у своего переднего края: проекция панели
// сужается, дальний край приближается (чуть крупнее и ниже).
// Слои: "back" — салон за стёклами и проёмами (обивка, сиденья, руль);
// между back и body рисуются пассажиры; "body" — кузов (проёмы открытых
// дверей вырезаны); "door" — открытые двери поверх всего.
import { box } from "../kit";
import { mix } from "../sets/Office31";

export type CarPaint = { readonly body: string; readonly shade: string; readonly line: string };
// серо-синий седан семьи
export const FAMILY_CAR: CarPaint = { body: "#5F7084", shade: "#4D5D70", line: "#334152" };

export const CAR = {
  frontHinge: -214, // передний край передней двери (шарнир)
  bPillar: 30, // стойка B: задний край передней двери = шарнир задней
  frontDoor: [
    [-214, -52],
    [26, -52],
    [26, -298],
    [-112, -294],
    [-200, -190],
    [-214, -150],
  ] as const,
  frontWin: [
    [-190, -194],
    [12, -194],
    [12, -286],
    [-108, -290],
  ] as const,
  rearDoor: [
    [34, -52],
    [252, -52],
    [264, -172],
    [214, -292],
    [34, -298],
  ] as const,
  rearWin: [
    [48, -194],
    [244, -194],
    [206, -284],
    [48, -288],
  ] as const,
  frontHandle: { x: -30, y: -176 },
  rearHandle: { x: 214, y: -170 },
  // точки посадки (пол салона под ступнями; сиденье — высота над полом)
  floorY: -64,
  seatUp: 34, // подушка сиденья над полом, единицы
  frontSeatX: -78, // таз водителя/пассажира спереди
  rearSeatX: 150, // таз пассажира сзади
  wheels: [-330, 322] as const,
  wheelR: 64,
} as const;

const poly = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ") + " Z";

// Точка двери при открытии на угол a (градусы): x — вокруг шарнира hx,
// ширина двери w (единицы).
const doorPt = (x: number, y: number, a: number, hx: number, w: number): [number, number] => {
  const r = (a * Math.PI) / 180;
  const d = x - hx;
  const near = Math.sin(r) * (Math.abs(d) / w);
  const cy = -175;
  return [hx + d * Math.cos(r), cy + (y - cy) * (1 + 0.16 * near) + 16 * near];
};
const FRONT_W = CAR.bPillar - CAR.frontHinge;
const REAR_W = 218;

const BODY =
  "M -500 -70 Q -508 -140 -478 -156 Q -420 -170 -262 -192 Q -200 -270 -128 -308 Q -100 -318 -40 -318 L 168 -316 Q 210 -314 238 -280 L 312 -198 L 466 -186 Q 504 -178 502 -128 L 500 -70 Q 498 -46 470 -44 L -476 -44 Q -500 -48 -500 -70 Z";
// задняя форточка за задней дверью
const QUARTER = "M 224 -282 L 252 -268 L 300 -202 L 262 -202 Z";

export const carPt = (x: number, y: number, s: number, ux: number, uy: number, dir: 1 | -1 = -1) => ({ x: x + dir * ux * s, y: y + uy * s });
// Мировая точка ручки двери при угле a.
export const doorHandleAt = (x: number, y: number, s: number, a: number, dir: 1 | -1 = -1, which: "front" | "rear" = "rear") => {
  const h = which === "front" ? CAR.frontHandle : CAR.rearHandle;
  const [ux, uy] = which === "front" ? doorPt(h.x, h.y, a, CAR.frontHinge, FRONT_W) : doorPt(h.x, h.y, a, CAR.bPillar + 4, REAR_W);
  return { x: x + dir * ux * s, y: y + uy * s };
};
// Где поставить сидящего (place для Actor): ступни на полу салона.
export const carSeatPlace = (x: number, y: number, s: number, which: "front" | "rear", dir: 1 | -1 = -1, bounce = 0) => ({
  x: x + dir * (which === "front" ? CAR.frontSeatX : CAR.rearSeatX) * s,
  y: y + (CAR.floorY + bounce) * s,
  seat: CAR.seatUp * s,
});

export const CarSide: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s: number; // px на единицу
  readonly layer: "back" | "body" | "door";
  readonly open?: number; // угол задней двери, градусы (0 — закрыта)
  readonly frontOpen?: number; // угол передней двери, градусы
  readonly wheel?: number; // поворот колёс, градусы
  readonly bounce?: number; // покачивание кузова, единицы
  readonly dir?: 1 | -1;
  readonly paint?: CarPaint;
  readonly lights?: number; // 0…1 — фары горят
  readonly shadow?: boolean;
}> = ({ x, y, s, layer, open = 0, frontOpen = 0, wheel = 0, bounce = 0, dir = -1, paint = FAMILY_CAR, lights = 0, shadow = true }) => {
  const BODYC = paint.body;
  const SHADE = paint.shade;
  const LINE = paint.line;
  const LW = 3 / Math.max(0.2, s); // контур ≈ 3 px мира, как у персонажей
  const id = `car-${Math.round(x)}-${Math.round(y)}-${dir}`;
  const tr = `translate(${x} ${y}) scale(${s * dir} ${s})`;
  const GLASS = "#2B3646";
  if (layer === "back") {
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`${tr} translate(0 ${bounce})`}>
          {/* салон: тёмная обивка, дальние стёкла (светлые — небо за ними) */}
          <path d="M -252 -186 Q -200 -268 -128 -304 L 168 -304 Q 206 -302 232 -272 L 300 -196 L 300 -52 L -252 -52 Z" fill="#363C48" />
          <path d="M -180 -284 L 160 -292 Q 200 -290 222 -262 L 262 -206 L -214 -206 Z" fill="#AFC3D6" opacity={0.5} />
          <path d="M 12 -300 L 34 -300 L 34 -196 L 12 -196 Z" fill="#2C313B" />
          {/* руль (у водителя; виден ребром) */}
          <ellipse cx={-176} cy={-206} rx={10} ry={36} fill="#22262E" transform="rotate(-22 -176 -206)" />
          {/* передние кресла: подушки и спинки */}
          <path d="M -150 -118 L -20 -118 Q -6 -118 -6 -104 L -6 -92 L -150 -92 Z" fill="#4C5361" />
          <path d="M -24 -112 L 8 -258 Q 14 -276 32 -270 Q 44 -266 42 -248 L 18 -112 Z" fill="#555D6C" />
          <rect x={6} y={-300} width={46} height={40} rx={14} fill="#555D6C" transform="rotate(10 29 -280)" />
          {/* задний диван */}
          <path d="M 70 -118 L 236 -118 Q 250 -118 250 -104 L 250 -92 L 70 -92 Z" fill="#4C5361" />
          <path d="M 226 -112 L 246 -236 Q 252 -258 272 -252 Q 286 -246 282 -226 L 262 -112 Z" fill="#555D6C" />
          {/* пол и порог */}
          <rect x={-252} y={-92} width={552} height={40} fill="#2A2F38" />
        </g>
      </svg>
    );
  }
  if (layer === "door") {
    const doors: React.ReactNode[] = [];
    const drawDoor = (pts: readonly (readonly [number, number])[], win: readonly (readonly [number, number])[], hx: number, w: number, a: number, h: { x: number; y: number }, key: string) => {
      const P = pts.map(([px, py]) => doorPt(px, py, a, hx, w));
      const W = win.map(([px, py]) => doorPt(px, py, a, hx, w));
      const H = doorPt(h.x, h.y, a, hx, w);
      const c = Math.cos((a * Math.PI) / 180);
      // внутренняя сторона двери видна, когда она открыта сильнее 60°
      const inner = a > 62;
      doors.push(
        <g key={key}>
          <path d={poly(P)} fill={inner ? mix(BODYC, "#2E333D", 0.62) : BODYC} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" />
          <path d={poly(W)} fill={GLASS} opacity={0.78} stroke={LINE} strokeWidth={LW * 0.6} />
          {inner ? null : <rect x={H[0] - 18 * c} y={H[1] - 5} width={Math.max(6, 36 * c)} height={10} rx={5} fill="#C7CED8" stroke={LINE} strokeWidth={LW * 0.4} />}
        </g>,
      );
    };
    if (frontOpen > 0.5) drawDoor(CAR.frontDoor, CAR.frontWin, CAR.frontHinge, FRONT_W, frontOpen, CAR.frontHandle, "front");
    if (open > 0.5) drawDoor(CAR.rearDoor, CAR.rearWin, CAR.bPillar + 4, REAR_W, open, CAR.rearHandle, "rear");
    if (!doors.length) return null;
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`${tr} translate(0 ${bounce})`}>{doors}</g>
      </svg>
    );
  }
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <defs>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-620} y={-420} width={1240} height={520}>
          <rect x={-620} y={-420} width={1240} height={520} fill="#FFFFFF" />
          {/* стёкла — сквозь них виден салон */}
          <path d={poly(CAR.frontWin)} fill="#000000" />
          <path d={poly(CAR.rearWin)} fill="#000000" />
          <path d={QUARTER} fill="#000000" />
          {frontOpen > 0.5 ? <path d={poly(CAR.frontDoor)} fill="#000000" /> : null}
          {open > 0.5 ? <path d={poly(CAR.rearDoor)} fill="#000000" /> : null}
        </mask>
        <linearGradient id={`${id}-g`} x1="0" y1="-320" x2="0" y2="-44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={mix(BODYC, "#FFFFFF", 0.16)} />
          <stop offset="0.45" stopColor={BODYC} />
          <stop offset="1" stopColor={SHADE} />
        </linearGradient>
      </defs>
      <g transform={tr}>
        {shadow ? <ellipse cx={0} cy={-2} rx={540} ry={22} fill="rgba(20,25,40,0.25)" /> : null}
        <g transform={`translate(0 ${bounce})`}>
          <path d={BODY} fill={`url(#${id}-g)`} stroke={LINE} strokeWidth={LW} strokeLinejoin="round" mask={`url(#${id}-m)`} />
          {/* тонировка стёкол поверх салона и блик */}
          <path d={poly(CAR.frontWin)} fill={GLASS} opacity={frontOpen > 0.5 ? 0 : 0.28} stroke={LINE} strokeWidth={LW * 0.6} />
          {open <= 0.5 ? <path d={poly(CAR.rearWin)} fill={GLASS} opacity={0.28} stroke={LINE} strokeWidth={LW * 0.6} /> : null}
          <path d={QUARTER} fill={GLASS} opacity={0.5} stroke={LINE} strokeWidth={LW * 0.6} />
          <path d="M -160 -282 L -120 -282 L -176 -204 L -200 -204 Z" fill="#FFFFFF" opacity={frontOpen > 0.5 ? 0 : 0.16} />
          {/* швы дверей, ручки, молдинг */}
          {frontOpen <= 0.5 ? <path d="M -214 -52 L -214 -150 L -200 -190" stroke={LINE} strokeWidth={LW * 0.8} fill="none" opacity={0.7} /> : null}
          <path d="M 30 -52 L 30 -300" stroke={LINE} strokeWidth={LW * 0.8} opacity={0.7} />
          {open <= 0.5 ? <path d="M 252 -52 L 264 -172 L 214 -292" stroke={LINE} strokeWidth={LW * 0.8} fill="none" opacity={0.7} /> : null}
          {frontOpen <= 0.5 ? <rect x={CAR.frontHandle.x - 18} y={CAR.frontHandle.y - 5} width={36} height={10} rx={5} fill="#C7CED8" stroke={LINE} strokeWidth={LW * 0.4} /> : null}
          {open <= 0.5 ? <rect x={CAR.rearHandle.x - 18} y={CAR.rearHandle.y - 5} width={36} height={10} rx={5} fill="#C7CED8" stroke={LINE} strokeWidth={LW * 0.4} /> : null}
          <path d="M -470 -118 L 498 -118" stroke={mix(SHADE, "#FFFFFF", 0.18)} strokeWidth={5} mask={`url(#${id}-m)`} />
          <path d="M -470 -96 L 498 -96" stroke={SHADE} strokeWidth={4} opacity={0.7} mask={`url(#${id}-m)`} />
          {/* зеркало, фары, фонарь, бамперы */}
          <path d="M -216 -196 l -30 -10 q -8 0 -8 8 l 0 14 q 0 6 8 6 l 30 0 z" fill={BODYC} stroke={LINE} strokeWidth={LW * 0.6} />
          <path d="M -500 -150 Q -496 -164 -470 -168 L -440 -170 L -444 -140 L -498 -134 Z" fill={lights > 0 ? "#FFF6D0" : "#E8EEF4"} stroke={LINE} strokeWidth={LW * 0.5} />
          {lights > 0 ? <ellipse cx={-520} cy={-150} rx={50} ry={22} fill="#FFF3C0" opacity={0.45 * lights} /> : null}
          <path d="M 500 -160 L 470 -168 L 462 -140 L 500 -134 Z" fill="#D6564B" stroke={LINE} strokeWidth={LW * 0.5} />
          <rect x={-504} y={-84} width={70} height={28} rx={10} fill={SHADE} />
          <rect x={436} y={-84} width={68} height={28} rx={10} fill={SHADE} />
        </g>
        {CAR.wheels.map((wx) => (
          <g key={wx} transform={`translate(${wx} -62)`}>
            <circle r={CAR.wheelR + 6} fill="#1C1F25" />
            <circle r={CAR.wheelR} fill="#272B33" stroke="#15171C" strokeWidth={LW * 0.6} />
            <g transform={`rotate(${wheel})`}>
              <circle r={38} fill="#BFC6CF" stroke="#7F8792" strokeWidth={LW * 0.5} />
              {[0, 72, 144, 216, 288].map((a) => (
                <rect key={a} x={-6} y={-36} width={12} height={30} rx={5} fill="#8E97A3" transform={`rotate(${a})`} />
              ))}
              <circle r={10} fill="#6F7782" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
};
