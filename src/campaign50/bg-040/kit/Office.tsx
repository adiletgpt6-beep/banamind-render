// Офис в Бишкеке (мировые px): стена до y = 1500, окно с видом на горы
// Ала-Тоо и панельные дома, большие настенные часы (секундная стрелка
// идёт тактами), полка с папками, принтер на тумбе, растение.
// Стол: столешница y 1236…1300, передняя панель ниже (закрывает ноги).
// Мама сидит за столом: x = 430, ступни y = 1560.
import { Mountains, PhoneFlat } from "../../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Sky, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { fontFamily } from "../../../fonts";
import { box } from "../context";
import { BG40_TEXT } from "../script";
import { BigClock } from "./Clock";
import { C } from "./theme";

export const OFFICE = {
  wallY: 1500,
  window: { x: 40, y: 330, w: 450, h: 640 },
  clock: { x: 850, y: 470, r: 118 },
  shelf: { x: 650, y: 760, w: 420 },
  cabinet: { x: 820, y: 1060, w: 300 },
  printer: { x: 830, y: 1060 }, // низ принтера на тумбе (левый край)
  deskTop: 1236,
  deskFront: 1430,
  mom: { x: 430, y: 1560, h: 760 },
  laptop: { x: 735, y: 1262 }, // шарнир крышки на столе
  phone: { x: 236, y: 1318 },
  papers: { x: 120, y: 1372 },
} as const;

// Вид из окна: небо, горы Ала-Тоо, панельные дома, тополя (Бишкек).
export const CityView: React.FC<{ readonly w: number; readonly h: number }> = ({ w, h }) => (
  <div style={box({ left: 0, top: 0, width: w, height: h, overflow: "hidden" })}>
    <Sky w={w} h={h} />
    <Mountains x={-80} y={h * 0.16} w={w + 160} h={h * 0.36} />
    <PanelHouse x={-40} y={h + 60} w={w * 0.56} floors={4} color="#E7DCCB" seed={4} />
    <PanelHouse x={w * 0.52} y={h + 110} w={w * 0.6} floors={5} color="#DCE3E8" seed={7} />
    <Tree x={w * 0.47} y={h + 40} s={0.8} kind="poplar" />
    <Tree x={w * 0.92} y={h + 70} s={0.7} kind="poplar" tone={1} />
  </div>
);

// Папки на полке.
const Binders: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <>
    {["#3A6EA5", C.yellow, "#E85D75", "#3E9C6B", "#7A6BC4", "#3A6EA5"].map((c, k) => (
      <div
        key={k}
        style={box({
          left: x + k * 44 + (k > 3 ? 18 : 0),
          top: y - (k % 2 ? 128 : 140),
          width: 36,
          height: k % 2 ? 128 : 140,
          borderRadius: 4,
          backgroundColor: c,
          rotate: k === 5 ? "-14deg" : "0deg",
          transformOrigin: "0 100%",
          boxShadow: "inset -6px 0 0 rgba(0,0,0,0.12)",
        })}
      >
        <div style={box({ left: 8, top: 26, width: 20, height: 34, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.75)" })} />
      </div>
    ))}
  </>
);

// Принтер (вид спереди): корпус, панель с индикатором, лоток выдачи.
// feed 0…1 — сколько листа уже вышло; led — индикатор горит; s — масштаб;
// (x, y) — левый нижний угол корпуса.
export const Printer: React.FC<{ readonly x: number; readonly y: number; readonly s?: number; readonly feed?: number; readonly led?: number; readonly sheet?: React.ReactNode }> = ({ x, y, s = 1, feed = 0, led = 0, sheet }) => {
  const W = 250;
  const H = 120;
  return (
    <div style={box({ left: x, top: y - H * s, width: W * s, height: H * s })}>
      <div style={box({ left: 0, top: 0, width: W, height: H, scale: `${s}`, transformOrigin: "0 0" })}>
        {/* лоток подачи с бумагой сзади */}
        <div style={box({ left: 40, top: -40, width: 170, height: 52, borderRadius: "8px 8px 0 0", backgroundColor: "#D2D8E2" })} />
        <div style={box({ left: 52, top: -32, width: 146, height: 40, backgroundColor: "#FFFFFF", boxShadow: "0 -3px 0 #F1F3F7" })} />
        {/* корпус */}
        <div style={box({ left: 0, top: 6, width: W, height: H - 6, borderRadius: 18, background: "linear-gradient(180deg, #F7F8FB 0%, #DDE2EA 100%)", boxShadow: "0 10px 20px rgba(20,30,60,0.18)" })} />
        <div style={box({ left: 0, top: 6, width: W, height: 22, borderRadius: "18px 18px 4px 4px", backgroundColor: "#EEF1F6" })} />
        {/* панель */}
        <div style={box({ left: 150, top: 36, width: 76, height: 30, borderRadius: 8, backgroundColor: "#2B3550" })} />
        <div style={box({ left: 158, top: 44, width: 40, height: 14, borderRadius: 3, backgroundColor: led > 0 ? "#9FE0B5" : "#4A5878" })} />
        <div style={box({ left: 206, top: 45, width: 12, height: 12, borderRadius: 6, backgroundColor: led > 0 ? C.green : "#54617E", boxShadow: led > 0 ? `0 0 ${10 * led}px ${C.green}` : "none" })} />
        {/* щель выдачи */}
        <div style={box({ left: 26, top: 74, width: 196, height: 16, borderRadius: 8, backgroundColor: "#2B3550" })} />
        {/* выходящий лист */}
        {feed > 0 ? (
          <div style={box({ left: 34, top: 80, width: 180, height: 170 * feed, overflow: "hidden" })}>
            <div style={box({ left: 0, bottom: 0, width: 180, height: 170, backgroundColor: C.paper, borderRadius: "0 0 4px 4px", boxShadow: "0 6px 10px rgba(20,30,60,0.15)" })}>{sheet}</div>
          </div>
        ) : null}
        <div style={box({ left: 20, top: 88, width: 208, height: 12, borderRadius: 6, backgroundColor: "#C3CAD6" })} />
      </div>
    </div>
  );
};

// Стена, окно, часы, полка, тумба с принтером, растение.
// minutes — время на часах; sec — угол секундной стрелки.
export const OfficeBack: React.FC<{ readonly minutes: number; readonly sec: number; readonly feed?: number; readonly led?: number; readonly clockGlow?: number }> = ({
  minutes,
  sec,
  feed = 0,
  led = 0,
  clockGlow = 0,
}) => {
  const w = OFFICE.window;
  const cab = OFFICE.cabinet;
  return (
    <div style={box({ left: -300, top: -200, width: 1700, height: 2400 })}>
      <div style={box({ left: 0, top: 0, width: 1700, height: 200 + OFFICE.wallY, background: `linear-gradient(180deg, #F4F7FB 0%, ${C.wall} 60%, ${C.wallLow} 100%)` })} />
      {/* плинтус и пол */}
      <div style={box({ left: 0, top: 200 + OFFICE.wallY, width: 1700, height: 700, backgroundColor: "#CDB79A" })} />
      <div style={box({ left: 0, top: 200 + OFFICE.wallY - 14, width: 1700, height: 16, backgroundColor: "#D6DEE8" })} />
      <div style={box({ left: 300, top: 200, width: 1080, height: OFFICE.wallY })}>
        {/* окно */}
        <div style={box({ left: w.x - 18, top: w.y - 18, width: w.w + 36, height: w.h + 36, borderRadius: 12, backgroundColor: "#FFFFFF", boxShadow: "0 10px 30px rgba(20,40,90,0.10)" })} />
        <div style={box({ left: w.x, top: w.y, width: w.w, height: w.h, overflow: "hidden", borderRadius: 4 })}>
          <CityView w={w.w} h={w.h} />
          {/* жалюзи, поднятые наверх */}
          <div style={box({ left: 0, top: 0, width: w.w, height: 64, backgroundImage: "repeating-linear-gradient(180deg, #F3F5F8 0 9px, #D9DFE7 9px 12px)" })} />
        </div>
        <div style={box({ left: w.x + w.w / 2 - 7, top: w.y, width: 14, height: w.h, backgroundColor: "#FFFFFF" })} />
        <div style={box({ left: w.x - 34, top: w.y + w.h + 16, width: w.w + 68, height: 24, borderRadius: 6, backgroundColor: "#FFFFFF" })} />
        {/* настенные часы */}
        <BigClock x={OFFICE.clock.x} y={OFFICE.clock.y} r={OFFICE.clock.r} minutes={minutes} sec={sec} glow={clockGlow} />
        {/* полка с папками */}
        <div style={box({ left: OFFICE.shelf.x, top: OFFICE.shelf.y, width: OFFICE.shelf.w, height: 20, borderRadius: 6, backgroundColor: "#C79E74", boxShadow: "0 8px 14px rgba(20,30,60,0.12)" })} />
        <Binders x={OFFICE.shelf.x + 40} y={OFFICE.shelf.y} />
        <div style={box({ left: OFFICE.shelf.x + 330, top: OFFICE.shelf.y - 96, width: 80, height: 96, borderRadius: "40px 40px 10px 10px", backgroundColor: "#7FAF63" })} />
        <div style={box({ left: OFFICE.shelf.x + 340, top: OFFICE.shelf.y - 40, width: 60, height: 40, borderRadius: 8, backgroundColor: "#F3E6D3" })} />
        {/* тумба и принтер */}
        <div style={box({ left: cab.x, top: cab.y, width: cab.w, height: OFFICE.wallY - cab.y, borderRadius: 10, backgroundColor: "#E9DCC8", boxShadow: "inset 0 -10px 0 rgba(0,0,0,0.05)" })} />
        {[0, 1].map((i) => (
          <div key={i} style={box({ left: cab.x + 20, top: cab.y + 40 + i * 190, width: cab.w - 40, height: 160, borderRadius: 8, border: "4px solid #D9C8AE", boxSizing: "border-box" })}>
            <div style={box({ left: (cab.w - 40) / 2 - 30, top: 18, width: 60, height: 10, borderRadius: 5, backgroundColor: "#B8A285" })} />
          </div>
        ))}
        <Printer x={OFFICE.printer.x} y={OFFICE.printer.y} feed={feed} led={led} />
        {/* растение в углу у окна */}
        <div style={box({ left: -10, top: 1080, width: 170, height: 420 })}>
          <svg width={170} height={420} viewBox="0 0 170 420" style={box({ left: 0, top: 0 })}>
            {[
              [85, 300, -38, 150],
              [85, 300, -8, 190],
              [85, 300, 22, 170],
              [85, 300, 48, 130],
              [85, 300, -62, 110],
            ].map(([x0, y0, a, l], i) => {
              const r = (a * Math.PI) / 180;
              const x1 = x0 + Math.sin(r) * l;
              const y1 = y0 - Math.cos(r) * l;
              return (
                <g key={i}>
                  <path d={`M ${x0} ${y0} Q ${(x0 + x1) / 2 + 10} ${(y0 + y1) / 2} ${x1} ${y1}`} stroke="#4E8A4A" strokeWidth={6} fill="none" />
                  <ellipse cx={x1} cy={y1} rx={34} ry={56} fill={i % 2 ? "#6FA85E" : "#5E9A55"} transform={`rotate(${a} ${x1} ${y1})`} />
                </g>
              );
            })}
            <path d="M 40 300 L 130 300 L 118 410 L 52 410 Z" fill="#E7D3B6" />
            <rect x={34} y={292} width={102} height={18} rx={6} fill="#D9C2A0" />
          </svg>
        </div>
        {/* табличка-постер на стене: город */}
        <div style={box({ left: 560, top: 340, width: 150, height: 190, borderRadius: 8, backgroundColor: "#FFFFFF", boxShadow: "0 8px 18px rgba(20,40,90,0.12)", overflow: "hidden" })}>
          <div style={box({ left: 10, top: 10, width: 130, height: 130, borderRadius: 4, overflow: "hidden" })}>
            <svg width={130} height={130} viewBox="0 0 130 130">
              <rect width={130} height={130} fill="#DCEBF7" />
              <path d="M 0 90 L 25 60 L 45 75 L 70 40 L 95 70 L 115 55 L 130 65 L 130 130 L 0 130 Z" fill="#9DB2CC" />
              <path d="M 62 51 L 70 40 L 78 52 L 71 50 Z" fill="#FFFFFF" />
              <rect x={0} y={100} width={130} height={30} fill="#BFD3A8" />
            </svg>
          </div>
          <div style={box({ left: 0, right: 0, top: 146, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 26, color: C.navy })}>{BG40_TEXT.flow.city}</div>
        </div>
      </div>
    </div>
  );
};

// Столешница (вид спереди-сверху) и передняя панель.
export const Desk: React.FC = () => (
  <>
    <div style={box({ left: -300, top: OFFICE.deskTop, width: 1700, height: OFFICE.deskFront - OFFICE.deskTop, background: "linear-gradient(180deg, #DCBF98 0%, #E6CBA6 40%, #EBD3B0 100%)" })} />
    <div style={box({ left: -300, top: OFFICE.deskTop, width: 1700, height: OFFICE.deskFront - OFFICE.deskTop, backgroundImage: `repeating-linear-gradient(97deg, ${C.woodGrain} 0 2px, transparent 2px 140px)` })} />
    <div style={box({ left: -300, top: OFFICE.deskTop, width: 1700, height: 10, background: "linear-gradient(180deg, rgba(60,40,20,0.14), rgba(60,40,20,0))" })} />
    <div style={box({ left: -300, top: OFFICE.deskFront, width: 1700, height: 22, backgroundColor: "#C9A57D" })} />
    <div style={box({ left: -300, top: OFFICE.deskFront + 22, width: 1700, height: 900, background: "linear-gradient(180deg, #F2F4F8 0%, #E3E8EF 100%)" })} />
    <div style={box({ left: -300, top: OFFICE.deskFront + 22, width: 1700, height: 20, background: "linear-gradient(180deg, rgba(20,30,60,0.10), rgba(20,30,60,0))" })} />
  </>
);

// Бумаги и подставка для ручек на столе (слева от мамы).
export const DeskProps: React.FC<{ readonly phoneGlow?: number; readonly phoneShake?: number; readonly phone?: boolean }> = ({ phoneGlow = 0, phoneShake = 0, phone = true }) => (
  <>
    <div style={box({ left: OFFICE.papers.x - 40, top: OFFICE.papers.y - 6, width: 170, height: 34, borderRadius: 4, backgroundColor: "#FFFFFF", rotate: "-4deg", boxShadow: "0 3px 6px rgba(20,30,60,0.12)" })} />
    <div style={box({ left: OFFICE.papers.x - 30, top: OFFICE.papers.y - 14, width: 160, height: 30, borderRadius: 4, backgroundColor: "#FBF6EA", rotate: "3deg", boxShadow: "0 3px 6px rgba(20,30,60,0.12)" })} />
    <div style={box({ left: 1000, top: OFFICE.deskTop - 70, width: 56, height: 84, borderRadius: "8px 8px 10px 10px", backgroundColor: "#3A6EA5" })} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={box({ left: 1008 + i * 14, top: OFFICE.deskTop - 112 + i * 8, width: 8, height: 60, borderRadius: 4, backgroundColor: [C.navy, C.yellow, C.coral][i], rotate: `${(i - 1) * 8}deg` })} />
    ))}
    {/* листы и ручка на переднем крае стола */}
    <div style={box({ left: 300, top: 1338, width: 250, height: 74, borderRadius: 4, backgroundColor: "#FFFFFF", rotate: "-4deg", boxShadow: "0 4px 8px rgba(20,30,60,0.14)" })}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 24, top: 14 + i * 18, width: [180, 150, 120][i], height: 6, borderRadius: 3, backgroundColor: "rgba(20,40,90,0.22)" })} />
      ))}
    </div>
    <div style={box({ left: 470, top: 1392, width: 120, height: 11, borderRadius: 6, backgroundColor: C.navy, rotate: "10deg" })} />
    {/* тумба с ящиками под столом слева */}
    <div style={box({ left: -40, top: OFFICE.deskFront + 40, width: 260, height: 600, borderRadius: 10, backgroundColor: "#E4E8EF" })}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={box({ left: 18, top: 18 + i * 150, width: 224, height: 132, borderRadius: 8, border: "4px solid #D3D9E3", boxSizing: "border-box" })}>
          <div style={box({ left: 82, top: 18, width: 60, height: 10, borderRadius: 5, backgroundColor: "#B9C2D0" })} />
        </div>
      ))}
    </div>
    {phone ? <PhoneFlat x={OFFICE.phone.x} y={OFFICE.phone.y} glow={phoneGlow} shake={phoneShake} scale={1.3} /> : null}
  </>
);
