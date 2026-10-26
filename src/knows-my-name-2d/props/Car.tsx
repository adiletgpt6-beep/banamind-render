// Е. Семейная машина — обычный белый седан (без «такси»-раскраски и надписей).
// Вид сбоку; dir = -1 — нос вправо (по умолчанию): при правостороннем
// движении к тротуару и зрителю обращена правая, пассажирская сторона.
// Задняя дверь вращается вокруг шарнира у своего переднего края (x = 30):
// проекция панели сужается, дальний край чуть приближается (крупнее).
// Слои: "back" — салон за стёклами и проёмом (сиденья), между back и body
// рисуются пассажиры; "body" — кузов (проём задней двери вырезан, когда
// она открыта); "door" — открытая задняя дверь поверх всего.
// Единицы машины: длина 1000, (0, 0) — земля под серединой, вверх — минус.
import { box } from "../kit";

const WHITE0 = "#F7F8FA";
const SHADE0 = "#DCE1E8";
const GLASS = "#2E3A4E";

export const CAR = {
  hinge: 30,
  rearDoor: [
    [30, -52],
    [252, -52],
    [264, -172],
    [214, -292],
    [30, -298],
  ] as const,
  rearWin: [
    [48, -186],
    [244, -186],
    [206, -280],
    [48, -284],
  ] as const,
  handle: { x: 214, y: -166 }, // наружная ручка задней двери
  rearSeat: { x: 140, y: -112 }, // точка таза пассажира сзади
  wheels: [-330, 322] as const,
} as const;

const poly = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ") + " Z";

// Проекция точки двери при открытии на угол a (градусы).
const doorPt = (x: number, y: number, a: number): [number, number] => {
  const r = (a * Math.PI) / 180;
  const d = x - CAR.hinge;
  const near = Math.sin(r) * (d / 222); // 0…1 — насколько край приблизился
  const cy = -175;
  return [CAR.hinge + d * Math.cos(r), cy + (y - cy) * (1 + 0.16 * near) + 14 * near];
};

const BODY =
  "M -500 -64 Q -506 -146 -470 -158 L -260 -186 Q -200 -270 -130 -304 Q -100 -316 -40 -316 L 190 -314 Q 236 -312 262 -270 L 330 -192 L 468 -178 Q 504 -170 502 -120 L 500 -64 Q 498 -46 470 -44 L -476 -44 Q -500 -46 -500 -64 Z";
const FRONT_WIN = poly([
  [-196, -186],
  [12, -186],
  [12, -286],
  [-112, -292],
]);

export const CarSide: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly s: number; // px на единицу
  readonly layer: "back" | "body" | "door";
  readonly open?: number; // угол задней двери, градусы (0 — закрыта)
  readonly wheel?: number; // поворот колёс, градусы
  readonly bounce?: number; // покачивание кузова, единицы
  readonly dir?: 1 | -1; // 1 — нос влево, −1 — нос вправо
  // Цвет кузова (по умолчанию белый); семья №30 ездит на серо-синей машине.
  readonly paint?: { readonly body: string; readonly shade: string; readonly line: string };
}> = ({ x, y, s, layer, open = 0, wheel = 0, bounce = 0, dir = -1, paint }) => {
  const WHITE = paint?.body ?? WHITE0;
  const SHADE = paint?.shade ?? SHADE0;
  const LINE = paint?.line ?? "#B8C0CB";
  const id = `car-${Math.round(x)}-${Math.round(y)}`;
  const tr = `translate(${x} ${y}) scale(${s * dir} ${s})`;
  if (layer === "back") {
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`${tr} translate(0 ${bounce})`}>
          {/* салон: тёмная обивка, дальние окна, задний диван, спинки */}
          <path d="M -250 -186 Q -200 -268 -130 -300 L 190 -300 Q 230 -298 252 -262 L 300 -190 L 300 -52 L -250 -52 Z" fill="#3B414D" />
          <path d="M -170 -280 L 170 -284 Q 214 -280 236 -248 L 250 -200 L -210 -200 Z" fill="#9FB3C7" opacity={0.55} />
          <rect x={56} y={-250} width={170} height={170} rx={34} fill="#59606E" />
          <rect x={40} y={-122} width={210} height={60} rx={22} fill="#646C7A" />
          <rect x={-120} y={-262} width={60} height={56} rx={18} fill="#4F5664" />
          <rect x={-150} y={-214} width={110} height={160} rx={26} fill="#4F5664" />
        </g>
      </svg>
    );
  }
  if (layer === "door") {
    if (open <= 0.5) return null;
    const pts = CAR.rearDoor.map(([px, py]) => doorPt(px, py, open));
    const win = CAR.rearWin.map(([px, py]) => doorPt(px, py, open));
    const h = doorPt(CAR.handle.x, CAR.handle.y, open);
    return (
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <g transform={`${tr} translate(0 ${bounce})`}>
          <path d={poly(pts)} fill={WHITE} stroke={LINE} strokeWidth={3} strokeLinejoin="round" />
          <path d={poly(win)} fill={GLASS} opacity={0.82} />
          <rect x={h[0] - 18 * Math.cos((open * Math.PI) / 180)} y={h[1] - 5} width={Math.max(6, 36 * Math.cos((open * Math.PI) / 180))} height={10} rx={5} fill="#AEB6C2" />
        </g>
      </svg>
    );
  }
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <defs>
        <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={-600} y={-400} width={1200} height={500}>
          <rect x={-600} y={-400} width={1200} height={500} fill="#FFFFFF" />
          {/* стёкла — сквозь них виден салон */}
          <path d={FRONT_WIN} fill="#000000" />
          <path d={poly(CAR.rearWin)} fill="#000000" />
          <path d="M 222 -284 L 250 -270 L 316 -194 L 262 -194 Z" fill="#000000" />
          {open > 0.5 ? <path d={poly(CAR.rearDoor)} fill="#000000" /> : null}
        </mask>
      </defs>
      <g transform={tr}>
        <ellipse cx={0} cy={-4} rx={520} ry={18} fill="rgba(20,25,40,0.22)" />
        <g transform={`translate(0 ${bounce})`}>
          <path d={BODY} fill={WHITE} stroke={LINE} strokeWidth={3} mask={`url(#${id}-m)`} />
          {/* тонировка стёкол поверх салона */}
          <path d={FRONT_WIN} fill={GLASS} opacity={0.32} />
          {open <= 0.5 ? <path d={poly(CAR.rearWin)} fill={GLASS} opacity={0.32} /> : null}
          <path d="M 222 -284 L 250 -270 L 316 -194 L 262 -194 Z" fill={GLASS} opacity={0.5} />
          {/* швы дверей, ручки, молдинг */}
          <path d="M -214 -52 L -214 -186" stroke="#C9D0DA" strokeWidth={3} />
          <path d="M 30 -52 L 30 -298" stroke="#C9D0DA" strokeWidth={3} />
          {open <= 0.5 ? <path d="M 252 -52 L 264 -172 L 214 -292" stroke="#C9D0DA" strokeWidth={3} fill="none" /> : null}
          <rect x={-40} y={-171} width={36} height={10} rx={5} fill="#AEB6C2" />
          {open <= 0.5 ? <rect x={CAR.handle.x - 18} y={CAR.handle.y - 5} width={36} height={10} rx={5} fill="#AEB6C2" /> : null}
          <path d="M -470 -112 L 498 -112" stroke={SHADE} strokeWidth={6} mask={`url(#${id}-m)`} />
          <rect x={-498} y={-150} width={34} height={22} rx={8} fill="#FFE7A8" />
          <rect x={478} y={-156} width={22} height={26} rx={6} fill="#E25B4E" />
          <path d="M -24 -186 l -26 -12 l 0 22 z" fill="#C9D0DA" />
        </g>
        {CAR.wheels.map((wx) => (
          <g key={wx} transform={`translate(${wx} -62) rotate(${wheel})`}>
            <circle r={64} fill="#23262E" />
            <circle r={36} fill="#C3C9D2" />
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x={-5} y={-34} width={10} height={30} rx={4} fill="#9AA2AE" transform={`rotate(${a})`} />
            ))}
            <circle r={9} fill="#7D858F" />
          </g>
        ))}
      </g>
    </svg>
  );
};

// Мировая точка на машине (для кисти на ручке и посадки).
export const carPt = (x: number, y: number, s: number, ux: number, uy: number, dir: 1 | -1 = -1) => ({ x: x + dir * ux * s, y: y + uy * s });
// Точка ручки открывающейся двери (мир) при угле a.
export const doorHandleAt = (x: number, y: number, s: number, a: number, dir: 1 | -1 = -1) => {
  const [ux, uy] = doorPt(CAR.handle.x, CAR.handle.y, a);
  return { x: x + dir * ux * s, y: y + uy * s };
};
