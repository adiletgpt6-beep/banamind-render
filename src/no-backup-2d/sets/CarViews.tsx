// Машина мамы изнутри: вид через открытую заднюю правую дверь
// (пристёгивание ремня) и вид через лобовое стекло (мама за рулём,
// дочка сзади пристёгнута). Ориентиры — CAR_SIDE, WHEEL (общие с Drive.tsx).
import { box } from "../shots";
import type { Vec } from "../rig/motion";

// Задний ряд сбоку, через правую заднюю дверь: машина едет вправо, спинка
// слева, подушка с бустером посередине, передний край подушки — у колен.
export const CAR_SIDE = {
  cushionTop: 1312,
  cushionFront: 592, // передний край подушки (x)
  cushionBack: 360,
  boosterTop: 1272,
  floorY: 1560,
} as const;

// Верхнее (D-кольцо на стойке) и нижнее крепления ремня.
export const CAR_SIDE_RING = { x: 312, y: 822 } as const;
export const CAR_SIDE_LAP = { x: 330, y: 1336 } as const;

export const RearSeatSide: React.FC = () => {
  const c = CAR_SIDE;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: "#353B47" })} />
      {/* окно противоположной двери: двор */}
      <div style={box({ left: 150, top: 440, width: 720, height: 330, borderRadius: "70px 50px 12px 12px", background: "linear-gradient(180deg, #CFE3F2, #EADFCB)", overflow: "hidden" })}>
        <div style={box({ left: 40, top: 120, width: 260, height: 300, backgroundColor: "#E6D6C4" })} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={box({ left: 70 + i * 70, top: 150, width: 40, height: 50, backgroundColor: "#B9CFE0" })} />
        ))}
        <div style={box({ left: 400, top: 80, width: 170, height: 300, borderRadius: "85px 85px 0 0", backgroundColor: "#86B06A" })} />
      </div>
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {/* спинка заднего сиденья с подголовником (наклонена назад) */}
        <path d={`M 214 840 Q 224 770 304 770 L 364 772 Q 414 780 416 840 L 450 ${c.cushionTop + 10} L 232 ${c.cushionTop + 10} Z`} fill="#565E6C" />
        <path d={`M 300 830 L 376 832 L 408 ${c.cushionTop - 10} L 326 ${c.cushionTop - 10} Z`} fill="#5F6776" />
        <rect x={254} y={650} width={140} height={110} rx={36} fill="#4C5361" />
        <rect x={300} y={754} width={12} height={24} fill="#2A2E36" />
        {/* подушка: верх и передняя грань */}
        <path d={`M ${c.cushionBack - 120} ${c.cushionTop} L ${c.cushionFront} ${c.cushionTop} Q ${c.cushionFront + 26} ${c.cushionTop + 6} ${c.cushionFront + 22} ${c.cushionTop + 40} L ${c.cushionFront + 8} ${c.cushionTop + 130} L ${c.cushionBack - 120} ${c.cushionTop + 130} Z`} fill="#4C5361" />
        <path d={`M ${c.cushionBack - 120} ${c.cushionTop} L ${c.cushionFront} ${c.cushionTop} Q ${c.cushionFront + 26} ${c.cushionTop + 6} ${c.cushionFront + 22} ${c.cushionTop + 30} L ${c.cushionBack - 120} ${c.cushionTop + 30} Z`} fill="#5A6270" />
        {/* пол и спинка переднего сиденья */}
        <rect x={0} y={c.floorY} width={1080} height={400} fill="#2A2F38" />
        <path d={`M 880 700 Q 990 690 1010 780 L 1040 ${c.floorY} L 900 ${c.floorY} L 860 800 Z`} fill="#4C5361" />
        {/* стойка с верхним креплением ремня и нижнее крепление у двери */}
        <rect x={CAR_SIDE_RING.x - 30} y={560} width={60} height={300} rx={20} fill="#40464F" />
        <rect x={CAR_SIDE_RING.x - 18} y={CAR_SIDE_RING.y - 20} width={36} height={40} rx={8} fill="#2A2E36" />
        <rect x={CAR_SIDE_LAP.x - 22} y={CAR_SIDE_LAP.y - 8} width={44} height={26} rx={8} fill="#2A2E36" />
      </svg>
    </div>
  );
};

// Детское кресло-бустер на подушке (под тазом ребёнка).
export const Booster: React.FC<{ x: number }> = ({ x }) => {
  const c = CAR_SIDE;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <path d={`M ${x - 110} ${c.boosterTop - 26} Q ${x - 112} ${c.boosterTop} ${x - 96} ${c.cushionTop + 6} L ${x + 92} ${c.cushionTop + 6} Q ${x + 106} ${c.boosterTop + 6} ${x + 94} ${c.boosterTop} Z`} fill="#1F3F70" />
      <rect x={x - 100} y={c.boosterTop - 4} width={190} height={14} rx={7} fill="#2D5390" />
    </svg>
  );
};

// Передний план: проём двери и край открытой двери (серебристый кузов).
export const RearDoorFrame: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: -40, top: 0, width: 1160, height: 360, background: "linear-gradient(180deg, #C9CED6, #AEB4BE)" })} />
    <div style={box({ left: -40, top: 330, width: 1160, height: 40, backgroundColor: "#8C929C" })} />
    <div style={box({ left: -40, top: 1680, width: 1160, height: 300, background: "linear-gradient(180deg, #AEB4BE, #959BA6)" })} />
    <div style={box({ left: -40, top: 360, width: 70, height: 1340, backgroundColor: "#A7ADB7" })} />
  </div>
);

// Вид спереди через лобовое стекло: задний ряд.
export const CabinBack: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #8FA9C2, #C9D6E0)" })} />
    <div style={box({ left: 100, top: 560, width: 880, height: 560, borderRadius: "80px 80px 20px 20px", backgroundColor: "#3B414D" })} />
    <div style={box({ left: 150, top: 600, width: 780, height: 210, borderRadius: "60px 60px 10px 10px", background: "linear-gradient(180deg, #D6E4EE, #EADFCB)" })} />
    <div style={box({ left: 120, top: 860, width: 840, height: 440, borderRadius: 50, backgroundColor: "#565E6C" })} />
    {/* верхнее крепление ремня у правой задней двери (слева в кадре) */}
    <div style={box({ left: 222, top: 812, width: 38, height: 34, borderRadius: 8, backgroundColor: "#2A2E36" })} />
    <div style={box({ left: 0, top: 1300, width: 1080, height: 620, backgroundColor: "#2F343E" })} />
  </div>
);

// Спинки передних сидений: пассажирское (слева в кадре) скрывает ноги
// дочки — видны голова, плечи и ремень; между сиденьями — консоль.
export const FrontSeats: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: 440, top: 1170, width: 220, height: 360, borderRadius: 30, backgroundColor: "#3A3F4A" })} />
    <div style={box({ left: 30, top: 1000, width: 450, height: 520, borderRadius: "90px 90px 30px 30px", backgroundColor: "#4C5361" })} />
    <div style={box({ left: 140, top: 905, width: 180, height: 110, borderRadius: 40, backgroundColor: "#454B58" })} />
    <div style={box({ left: 640, top: 900, width: 380, height: 600, borderRadius: "90px 90px 30px 30px", backgroundColor: "#4C5361" })} />
    <div style={box({ left: 735, top: 830, width: 200, height: 100, borderRadius: 40, backgroundColor: "#454B58" })} />
  </div>
);

// Руль: центр и радиус обода (мировые px кадра в салоне).
export const WHEEL = { x: 790, y: 1340, r: 168, rim: 30 } as const;
// Точка обода под углом a (градусы от «3 часов», против часовой) при
// повороте руля rot (градусы по часовой, как в SVG).
export const rimPoint = (a: number, rot: number): Vec => {
  const r = ((a - rot) * Math.PI) / 180;
  return { x: WHEEL.x + WHEEL.r * Math.cos(r), y: WHEEL.y - WHEEL.r * Math.sin(r) };
};

// Передний план кабины: приборная панель, руль, пальцы на ободе (grips),
// рамка стекла, отражения. pass — движение отражений (едем).
export const CabinFront: React.FC<{ pass: number; wheel?: number; grips?: readonly { at: number; skin: string }[] }> = ({ pass, wheel = 0, grips = [] }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: -40, top: 1440, width: 1160, height: 520, borderRadius: "80px 80px 0 0", background: "linear-gradient(180deg, #2B2F38, #1E2128)" })} />
    <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
      <rect x={WHEEL.x - 34} y={WHEEL.y} width={68} height={160} fill="#1A1C22" />
      <g transform={`rotate(${wheel} ${WHEEL.x} ${WHEEL.y})`}>
        <circle cx={WHEEL.x} cy={WHEEL.y} r={WHEEL.r} fill="none" stroke="#1A1C22" strokeWidth={WHEEL.rim} />
        <path d={`M ${WHEEL.x - WHEEL.r} ${WHEEL.y} L ${WHEEL.x + WHEEL.r} ${WHEEL.y} M ${WHEEL.x} ${WHEEL.y} L ${WHEEL.x} ${WHEEL.y + WHEEL.r}`} stroke="#1A1C22" strokeWidth={24} />
        <circle cx={WHEEL.x} cy={WHEEL.y} r={50} fill="#262A33" />
      </g>
      {/* пальцы обхватывают обод спереди: кисть и руль — одна конструкция */}
      {grips.map((g, i) => {
        const p = rimPoint(g.at, wheel);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${-(g.at - wheel)})`}>
            {[-1, 0, 1].map((n) => (
              <rect key={n} x={-WHEEL.rim * 0.62} y={n * 13 - 6} width={WHEEL.rim * 1.24} height={12} rx={6} fill={g.skin} stroke="rgba(120,70,50,0.25)" strokeWidth={1.5} />
            ))}
          </g>
        );
      })}
    </svg>
    <div style={box({ left: 0, top: 0, width: 1080, height: 1440, overflow: "hidden" })}>
      {[0, 1, 2, 3].map((i) => {
        const x = ((pass * 9 + i * 420) % 1680) - 300;
        return <div key={i} style={box({ left: 1080 - x, top: -200, width: 120 + i * 30, height: 1800, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)", transform: "rotate(18deg)" })} />;
      })}
    </div>
    <div style={box({ left: -60, top: 300, width: 1200, height: 1180, borderRadius: "120px 120px 40px 40px", border: "70px solid #B9BEC6", boxSizing: "border-box" })} />
    <div style={box({ left: -60, top: 0, width: 1200, height: 340, backgroundColor: "#B9BEC6" })} />
    <div style={box({ left: 470, top: 340, width: 140, height: 50, borderRadius: 12, backgroundColor: "#2B2F38" })} />
  </div>
);
