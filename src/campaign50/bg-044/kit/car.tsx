// Белая легковая машина (вид сбоку, смотрит вправо) с жёлтой полосой —
// акцентом цветов бренда (без наклеек с названием), салон виден через
// стёкла: водитель держит руль ОБЕИМИ руками, дети на заднем сиденье —
// каждый пристёгнут трёхточечным ремнём (Kid pose "sitBelted").
//   <Car x={540} y={1200} scale={0.6} f={f} spin={distance} passengers={["boy","girl","boy2"]} />
// (x, y) — точка на земле под серединой машины. Размер при scale 1:
// длина ≈ 1390 px, высота ≈ 480 px. spin — пройденный путь (px), колёса
// вращаются ровно по нему. doorOpen 0…1 — задняя дверь открыта к зрителю.
// <BeltCloseup progress> — крупный план: язычок ремня защёлкивается в замке.
import { clamp } from "../anim";
import { C } from "../palette";
import { Driver, Kid, type KidLook } from "./people";

export const CAR = { length: 1390, height: 480, wheelR: 98, wheelX: [-420, 430] as const, rearSeat: { x: -330, y: -206 }, driverSeat: { x: 110, y: -178 } } as const;

const BODY =
  "M -660 -72 L -688 -96 L -690 -176 Q -692 -276 -636 -298 L -560 -312 C -500 -442 -440 -472 -356 -480 L 150 -480 C 246 -478 300 -440 382 -330 L 424 -302 C 560 -292 660 -272 690 -222 L 702 -122 Q 700 -80 662 -72 Z";
// окна: заднее боковое (за стойкой C), задней двери, передней двери
const WIN_REAR_Q = "M -548 -296 C -500 -410 -470 -440 -430 -452 L -430 -296 Z";
const WIN_REAR = "M -412 -296 L -412 -456 L -96 -462 L -96 -296 Z";
const WIN_FRONT = "M -74 -296 L -74 -462 L 140 -462 C 230 -458 282 -420 352 -310 L 352 -296 Z";
const REAR_DOOR = { x0: -440, x1: -88, top: -470, bottom: -78 } as const;

const Wheel: React.FC<{ readonly cx: number; readonly spin: number }> = ({ cx, spin }) => {
  const r = CAR.wheelR;
  const ang = (spin / (2 * Math.PI * r)) * 360;
  return (
    <g transform={`translate(${cx} ${-r})`}>
      <circle r={r + 20} fill="#4A5470" />
      <circle r={r} fill="#2A3048" />
      <circle r={r * 0.58} fill="#DDE3EC" />
      <g transform={`rotate(${ang})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <rect key={a} x={-7} y={-r * 0.55} width={14} height={r * 0.5} rx={5} fill="#AEB8C8" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={r * 0.16} fill="#8D98AB" />
    </g>
  );
};

export type CarProps = {
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
  readonly f: number;
  readonly spin?: number;
  readonly flip?: boolean;
  readonly passengers?: readonly KidLook[]; // ближний — первый
  readonly driver?: boolean;
  readonly doorOpen?: number;
  readonly bounce?: number; // 0…1 лёгкое покачивание кузова при езде
  readonly kidMouth?: number;
};

export const Car: React.FC<CarProps> = ({ x, y, scale = 1, f, spin = 0, flip, passengers = [], driver = true, doorOpen = 0, bounce = 0, kidMouth = 0 }) => {
  const d = clamp(doorOpen);
  const by = Math.sin(f * 0.7) * 3 * bounce;
  const rs = CAR.rearSeat;
  const ds = CAR.driverSeat;
  // дальние дети — чуть дальше и меньше (глубина салона)
  const kids = passengers.slice(0, 3).map((look, i) => ({ look, i })).reverse();
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      {/* тень */}
      <ellipse cx={0} cy={4} rx={690} ry={26} fill="#14285A" opacity={0.13} />
      <g transform={`translate(0 ${by})`}>
        {/* салон: тёмный фон за стёклами, сиденья */}
        <path d={`${WIN_REAR_Q} ${WIN_REAR} ${WIN_FRONT}`} fill="#7D8AA3" />
        <rect x={-560} y={-470} width={940} height={36} fill="#6E7A92" />
        {/* спинка заднего сиденья с подголовниками */}
        <rect x={rs.x - 96} y={rs.y - 250} width={80} height={262} rx={30} fill="#5E6A84" />
        <rect x={rs.x - 92} y={rs.y - 300} width={64} height={52} rx={18} fill="#5E6A84" />
        {/* переднее кресло водителя */}
        <rect x={ds.x - 92} y={ds.y - 236} width={78} height={250} rx={30} fill="#5E6A84" />
        <rect x={ds.x - 86} y={ds.y - 292} width={62} height={52} rx={18} fill="#5E6A84" />
        {/* открытая дверь: проём виден за детьми */}
        {d > 0 ? <Doorway d={d} /> : null}
        {/* дети на заднем сиденье (дальние — раньше) */}
        {kids.map(({ look, i }) => (
          <Kid
            key={look + i}
            x={rs.x + i * 34}
            y={rs.y - i * 6}
            scale={1.16 - i * 0.08}
            f={f + i * 17}
            look={look}
            pose="sitBelted"
            seat={false}
            backpack={false}
            mouth={i === 0 ? kidMouth : 0}
            opacity={i === 0 ? 1 : 0.96}
          />
        ))}
        {driver ? <Driver x={ds.x} y={ds.y} scale={0.94} f={f} /> : null}
        {/* кузов: низ дверей, стойки, крыша (поверх салона) */}
        <path
          d={`${BODY} ${WIN_REAR_Q} ${WIN_REAR} ${WIN_FRONT}`}
          fillRule="evenodd"
          fill="#FFFFFF"
          stroke="#22335C"
          strokeWidth={5}
          strokeLinejoin="round"
        />
        {/* стёкла: лёгкий голубой тон и блики — салон виден */}
        <path d={`${WIN_REAR_Q} ${WIN_REAR} ${WIN_FRONT}`} fill="#CFE6FA" opacity={0.28} />
        <path d="M -380 -456 L -330 -456 L -420 -300 L -470 -300 Z M -20 -462 L 40 -462 L -40 -300 L -100 -300 Z" fill="#FFFFFF" opacity={0.28} />
        {/* стойки */}
        <rect x={-96} y={-470} width={22} height={176} fill="#FFFFFF" stroke="#22335C" strokeWidth={4} />
        <rect x={-432} y={-462} width={20} height={168} fill="#FFFFFF" stroke="#22335C" strokeWidth={4} />
        {/* жёлтая полоса бренда */}
        <path d="M -688 -206 L 696 -206 L 698 -180 L -690 -180 Z" fill={C.yellow} />
        <path d="M -688 -174 L 698 -174 L 699 -166 L -690 -166 Z" fill={C.yellowDeep} opacity={0.8} />
        {/* линии дверей, ручки */}
        <path d="M -440 -296 L -440 -78 M -88 -296 L -88 -78 M 352 -296 L 380 -120" stroke="#9AA6BA" strokeWidth={4} fill="none" />
        <rect x={-170} y={-246} width={58} height={14} rx={7} fill="#C9D1DD" />
        <rect x={250} y={-246} width={58} height={14} rx={7} fill="#C9D1DD" />
        {/* фары и фонари */}
        <path d="M 640 -258 Q 690 -250 694 -214 L 650 -214 Z" fill="#FFF3B0" stroke="#22335C" strokeWidth={4} />
        <rect x={-692} y={-262} width={26} height={56} rx={8} fill="#E8735A" stroke="#22335C" strokeWidth={4} />
        {/* бамперы */}
        <rect x={560} y={-120} width={146} height={34} rx={14} fill="#E3E8EF" stroke="#22335C" strokeWidth={4} />
        <rect x={-698} y={-122} width={130} height={34} rx={14} fill="#E3E8EF" stroke="#22335C" strokeWidth={4} />
        {/* открытая задняя дверь: створка к зрителю */}
        {d > 0 ? <OpenDoor d={d} /> : null}
      </g>
      <Wheel cx={CAR.wheelX[0]} spin={spin} />
      <Wheel cx={CAR.wheelX[1]} spin={spin} />
    </g>
  );
};

// Проём открытой задней двери (рисуется ДО пассажиров — дети видны).
const Doorway: React.FC<{ readonly d: number }> = ({ d }) => {
  const { x0, x1, bottom } = REAR_DOOR;
  return (
    <g opacity={d}>
      <path d={`M ${x0} ${-296} L ${x1} ${-296} L ${x1} ${bottom} L ${x0} ${bottom} Z`} fill="#6C7891" />
      <rect x={x0 + 40} y={-250} width={230} height={70} rx={20} fill="#5E6A84" />
    </g>
  );
};

// Задняя дверь, открытая к зрителю: створка поворачивается вокруг петель
// на переднем крае (x1) — видимая ширина уменьшается, край приближается.
const OpenDoor: React.FC<{ readonly d: number }> = ({ d }) => {
  const { x0, x1, top, bottom } = REAR_DOOR;
  const th = d * 1.15;
  const w = (x1 - x0) * Math.cos(th);
  const grow = 1 + 0.22 * Math.sin(th);
  const fx = x1 - w; // свободный край
  const ty = top - (grow - 1) * 60;
  const bt = bottom + (grow - 1) * 70;
  return (
    <g>
      <path
        d={`M ${x1} ${top + 10} L ${fx} ${ty} L ${fx} ${bt} L ${x1} ${bottom} Z`}
        fill="#FFFFFF"
        stroke="#22335C"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d={`M ${x1} ${-206} L ${fx} ${-206 - (grow - 1) * 30} L ${fx} ${-180 - (grow - 1) * 26} L ${x1} ${-180} Z`} fill={C.yellow} />
      <path d={`M ${x1 - 8} ${top + 26} L ${fx + 10} ${ty + 18} L ${fx + 10} ${-300 - (grow - 1) * 40} L ${x1 - 8} ${-300} Z`} fill="#CFE6FA" opacity={0.7} />
    </g>
  );
};

// Крупный план ремня: плечо и бок ребёнка (белая рубашка, синий жилет),
// лента ремня по диагонали; язычок входит в замок, progress 1 — щёлк.
export const BeltCloseup: React.FC<{ readonly progress: number; readonly f: number }> = ({ progress, f }) => {
  const p = clamp(progress);
  const tx = 330 + 330 * p; // язычок: от плеча к замку
  const ty = 720 + 430 * p;
  const clicked = p >= 0.999;
  // мягкое «дыхание» ткани ремня после щелчка
  const breathe = clicked ? Math.sin(f * 0.25) * 2 : 0;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#E9EEF5" />
      {/* сиденье */}
      <rect x={-40} y={380} width={1160} height={1300} rx={80} fill="#7D8AA3" />
      <rect x={-40} y={1260} width={1160} height={500} rx={60} fill="#6E7A92" />
      {/* туловище ребёнка */}
      <path d="M 120 1700 C 140 1100 200 760 330 600 C 420 520 640 520 760 600 C 900 700 960 1100 960 1700 Z" fill="#FFFFFF" stroke="#22335C" strokeWidth={6} />
      <path d="M 250 1700 C 270 1180 320 860 420 700 L 540 980 L 660 700 C 760 860 820 1180 840 1700 Z" fill={C.kidVest} />
      <path d="M 420 700 L 540 980 L 660 700" fill="none" stroke="#FFFFFF" strokeWidth={10} />
      {/* лента от плеча (верх-лево) к замку (низ-право) */}
      <path d={`M 250 520 L ${tx} ${ty}`} stroke="#3E4659" strokeWidth={92} strokeLinecap="round" />
      <path d={`M 250 520 L ${tx} ${ty + breathe}`} stroke="#535C71" strokeWidth={70} strokeLinecap="round" />
      {/* поясная часть — когда пристёгнут */}
      {p > 0.6 ? <path d={`M 120 1330 L ${tx} ${ty}`} stroke="#3E4659" strokeWidth={84} strokeLinecap="round" opacity={clamp((p - 0.6) / 0.3)} /> : null}
      {/* замок */}
      <g transform="translate(700 1180) rotate(-28)">
        <rect x={-70} y={-40} width={190} height={110} rx={26} fill="#2A3048" />
        <rect x={60} y={-14} width={44} height={56} rx={10} fill={C.coral} />
        <rect x={-90} y={-12} width={40} height={56} rx={8} fill="#1C2236" />
      </g>
      {/* язычок */}
      <g transform={`translate(${tx} ${ty}) rotate(-28)`}>
        <rect x={-70} y={-34} width={120} height={70} rx={14} fill="#D4DAE4" stroke="#22335C" strokeWidth={5} />
        <rect x={-46} y={-12} width={60} height={24} rx={8} fill="#9AA6BA" />
      </g>
      {clicked ? (
        <g transform="translate(690 1170)">
          <circle r={130} fill="none" stroke={C.yellow} strokeWidth={14} opacity={0.9} />
          <circle r={180} fill="none" stroke={C.yellow} strokeWidth={6} opacity={0.5} />
        </g>
      ) : null}
    </g>
  );
};
