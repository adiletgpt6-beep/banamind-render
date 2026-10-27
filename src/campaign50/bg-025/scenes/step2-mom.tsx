// Шаг 2, короткая врезка: средний план мамы в светлой комнате у окна с
// видом на Ала-Тоо. Она держит развёрнутую ленту (карта 2/6 лицом к себе)
// и задумчиво смотрит вниз — почему маршрут ещё не собран. Рот закрыт
// (говорит диктор), лёгкий наклон головы, взгляд скользит по карте.
import { Mountains, Poplar } from "../art";
import { box, Shot, Svg, type Cam } from "../kit";
import { Actor, type PoseIn } from "../rig/Actor";
import { clamp, easeInOut, lerp } from "../rig/motion";
import { C } from "../theme";

// Мама в мире врезки: ступни (MX, MY), рост 1000.
const MX = 500;
const MY = 1530;
const PLACE = { x: MX, y: MY, h: 1000 } as const;
const placeFn = () => PLACE;

// Лента в руках: верхняя (дальняя от камеры) кромка уже, ближняя шире —
// лист лежит почти горизонтально, печатью вверх, к маме. Пальцы — под
// листом (их закрывает бумага), большие пальцы — сверху на кромках.
const RIB_NEAR = { y: 936, x0: 370, x1: 630 } as const;
const RIB_FAR = { y: 860, x0: 414, x1: 586 } as const;
const SKIN_C = "#E6B590";
const SKIN_S = "#C99470";

// Большой палец сверху на кромке листа (x, y — основание, dir ±1 — к центру).
const Thumb: React.FC<{ readonly x: number; readonly y: number; readonly dir: 1 | -1 }> = ({ x, y, dir }) => (
  <g transform={`translate(${x} ${y}) rotate(${dir * -62})`}>
    <rect x={-6.5} y={-4} width={13} height={27} rx={6.5} fill={SKIN_C} stroke={SKIN_S} strokeWidth={1.6} />
    <path d="M -3.5 15 Q 0 19 3.5 15" fill="none" stroke={SKIN_S} strokeWidth={1.2} opacity={0.7} />
  </g>
);

const RibbonInHands: React.FC<{ readonly f: number }> = ({ f }) => {
  const sway = Math.sin(f / 24) * 1.5;
  const n = RIB_NEAR;
  const r = RIB_FAR;
  // точка на листе: u 0…1 слева направо, v 0…1 от ближней кромки к дальней
  const P = (u: number, v: number) => {
    const y = lerp(n.y, r.y, v) + sway * (1 - v);
    const x0 = lerp(n.x0, r.x0, v);
    const x1 = lerp(n.x1, r.x1, v);
    return { x: lerp(x0, x1, u), y };
  };
  const quad = (u0: number, v0: number, u1: number, v1: number) => {
    const a = P(u0, v0);
    const b = P(u1, v0);
    const c = P(u1, v1);
    const d = P(u0, v1);
    return `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c.x} ${c.y} L ${d.x} ${d.y} Z`;
  };
  const dot = (u: number, v: number, rr: number, fill: string, key: string) => {
    const p = P(u, v);
    const sy = lerp(1, 0.75, v) * 0.42;
    return <ellipse key={key} cx={p.x} cy={p.y} rx={rr} ry={rr * sy * 2} fill={fill} />;
  };
  // та же карта, что на панели 2/6 (обращена к зрителю, чтобы узнавалась):
  // горы у дальней кромки, ползунок — у ближней
  const school = { u: 0.58, v: 0.58 };
  const homes = [
    { u: 0.49, v: 0.67, lit: true },
    { u: 0.74, v: 0.65, lit: true },
    { u: 0.48, v: 0.34, lit: true },
    { u: 0.2, v: 0.68, lit: false },
    { u: 0.87, v: 0.72, lit: false },
    { u: 0.26, v: 0.34, lit: false },
    { u: 0.81, v: 0.34, lit: false },
  ];
  const sp = P(school.u, school.v);
  return (
    <g>
      {/* сложенные листы свисают с ближней кромки */}
      {[0, 1, 2].map((k) => (
        <path key={k} d={`M ${n.x0 + 6 + k * 4} ${n.y + 4 + k * 9} L ${n.x1 - 6 - k * 4} ${n.y + 4 + k * 9} L ${n.x1 - 8 - k * 4} ${n.y + 14 + k * 9} L ${n.x0 + 8 + k * 4} ${n.y + 14 + k * 9} Z`} fill={k % 2 ? C.paperShade : C.paperWarm} opacity={0.95} />
      ))}
      {/* панель 1 продолжается к маме (за дальней кромкой, круче) */}
      <path d={`M ${r.x0} ${r.y} L ${r.x1} ${r.y} L ${r.x1 - 10} ${r.y - 30} L ${r.x0 + 10} ${r.y - 30} Z`} fill={C.paperWarm} />
      {/* лист панели 2 */}
      <path d={quad(0, 0, 1, 1)} fill={C.paper} stroke={C.paperFold} strokeWidth={2} />
      <path d={quad(0.04, 0.14, 0.96, 0.95)} fill="#E9EEF5" />
      <path d={quad(0.04, 0.02, 0.96, 0.12)} fill="#FFFFFF" stroke="#E2E7F0" strokeWidth={1} />
      {/* улицы и проспект */}
      {[0.2, 0.4, 0.6, 0.8].map((u) => {
        const a = P(u, 0.14);
        const b = P(u, 0.84);
        return <line key={u} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFFFFF" strokeWidth={2.5} />;
      })}
      {(() => {
        const a = P(0.04, 0.42);
        const b = P(0.96, 0.42);
        return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#FFFFFF" strokeWidth={5} />;
      })()}
      {/* хребет у верхнего (дальнего) края карты */}
      <path d={quad(0.04, 0.84, 0.96, 0.95)} fill={C.mountainFar} />
      {/* пунктир совпавших меток к школе */}
      {homes
        .filter((h) => h.lit)
        .map((h, i) => {
          const p = P(h.u, h.v);
          return <line key={i} x1={p.x} y1={p.y} x2={sp.x} y2={sp.y} stroke={C.yellowDeep} strokeWidth={2.4} strokeDasharray="5 4" />;
        })}
      {homes.map((h, i) => dot(h.u, h.v, 7, h.lit ? C.yellow : "#B7C1D2", `h${i}`))}
      {dot(school.u, school.v, 9, C.navy, "s")}
      {/* жёлтый язычок номера */}
      {(() => {
        const p = P(0.9, 0.96);
        return <rect x={p.x - 12} y={p.y - 3} width={24} height={7} rx={3} fill={C.yellow} />;
      })()}
    </g>
  );
};

// Интерьер: светлая стена, окно с Ала-Тоо и тополем, подоконник.
const Room: React.FC<{ readonly f: number }> = ({ f }) => (
  <>
    <div style={box({ left: -400, top: -200, width: 1900, height: 2400, background: `linear-gradient(180deg, ${C.wall} 0%, #F7F9FC 60%, ${C.wall} 100%)` })} />
    <Svg>
      {/* окно справа */}
      <g transform="translate(640 380)">
        <rect x={0} y={0} width={360} height={470} rx={10} fill="#FFFFFF" />
        <rect x={14} y={14} width={332} height={442} rx={6} fill={C.sky} />
        <Mountains w={332} h={120} x={14} y={330} far />
        <rect x={14} y={330} width={332} height={126} fill="#E4EEDC" />
        <Poplar x={250} y={440} h={230} sway={Math.sin(f / 40) * 1.2} />
        <Poplar x={300} y={446} h={180} sway={Math.sin(f / 36 + 1) * 1.2} />
        <rect x={172} y={14} width={14} height={442} fill="#FFFFFF" />
        <rect x={14} y={232} width={332} height={12} fill="#FFFFFF" />
        <rect x={-14} y={462} width={388} height={24} rx={6} fill="#E6EBF3" />
      </g>
      {/* комнатное растение в углу за мамой */}
      <g transform="translate(300 1010)" opacity={0.9}>
        <path d="M -34 0 L 34 0 L 26 -64 L -26 -64 Z" fill="#E9DCC6" />
        {[-38, -20, -4, 12, 30].map((a, i) => (
          <path key={i} d={`M 0 -60 Q ${a * 1.6} ${-150 - i * 14} ${a * 2.4} ${-230 - (i % 2) * 40}`} fill="none" stroke={i % 2 ? C.poplar : C.poplarDark} strokeWidth={9} strokeLinecap="round" transform={`rotate(${Math.sin(f / 50 + i) * 1.2} 0 -60)`} />
        ))}
      </g>
      {/* мягкий свет из окна */}
      <ellipse cx={700} cy={720} rx={360} ry={420} fill="#FFFFFF" opacity={0.35} />
    </Svg>
  </>
);

export const Step2Mom: React.FC<{ readonly f: number; readonly t: number; readonly dur: number; readonly opacity: number }> = ({ f, t, dur, opacity }) => {
  if (opacity <= 0.001) return null;
  // медленный наезд на лицо и руки
  const p = clamp(t / Math.max(1, dur));
  const cam: Cam = { x: lerp(530, 522, easeInOut(p)), y: lerp(797, 793, easeInOut(p)), zoom: lerp(2.0, 2.08, p) };
  const pose = (tt: number): PoseIn => {
    const q = clamp((tt - (f - t)) / Math.max(1, dur));
    const tilt = easeInOut(clamp((q - 0.1) / 0.45));
    const scan = Math.sin(q * Math.PI * 1.3 - 0.9);
    return {
      // задумчиво, взгляд вниз на карту (веки чуть опущены)
      expr: { browIn: 2.5 + 1.5 * tilt, browOut: 1, lid: 0.3, smile: 0.1 },
      lookY: 1,
      lookX: 0.14 * scan,
      nod: 8 + 3 * tilt,
      headTilt: 5 * tilt,
      armL: { target: { x: 414, y: 912 }, shape: "relax", elbow: "hang", wrist: -50 },
      armR: { target: { x: 586, y: 912 }, shape: "relax", elbow: "hang", wrist: 50 },
    };
  };
  return (
    <div style={box({ inset: 0, opacity })}>
      <Shot f={f} cam={cam} bg={C.wall}>
        <Room f={f} />
        <Actor uid="apa-s2" look="apa" f={f} place={placeFn} pose={pose} seed={5} blinks={[f - t + Math.round(dur * 0.55)]} />
        <Svg>
          <RibbonInHands f={f} />
          <Thumb x={RIB_NEAR.x0 + 30} y={RIB_NEAR.y - 22} dir={1} />
          <Thumb x={RIB_NEAR.x1 - 30} y={RIB_NEAR.y - 22} dir={-1} />
        </Svg>
      </Shot>
    </div>
  );
};
