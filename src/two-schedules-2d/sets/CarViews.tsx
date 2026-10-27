// Машина мамы изнутри: вид через открытую заднюю дверь (пристёгивание
// ремня) и вид через лобовое стекло (мама за рулём, дочка сзади пристёгнута).
import { box } from "../shots";

// Задний ряд через открытую дверь: обивка, сиденье, окно, проём двери.
export const RearSeatBack: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: "#3B414D" })} />
    {/* окно на противоположной стороне: двор */}
    <div style={box({ left: 90, top: 470, width: 700, height: 330, borderRadius: "60px 40px 10px 10px", background: "linear-gradient(180deg, #CFE3F2, #EADFCB)", overflow: "hidden" })}>
      <div style={box({ left: 60, top: 120, width: 240, height: 300, backgroundColor: "#E6D6C4" })} />
      <div style={box({ left: 360, top: 90, width: 180, height: 300, borderRadius: "90px 90px 0 0", backgroundColor: "#86B06A" })} />
    </div>
    {/* спинка и подушка сиденья */}
    <div style={box({ left: 60, top: 780, width: 860, height: 560, borderRadius: "70px 70px 20px 20px", backgroundColor: "#565E6C" })} />
    <div style={box({ left: 120, top: 830, width: 300, height: 480, borderRadius: 50, backgroundColor: "#5F6776" })} />
    <div style={box({ left: 520, top: 830, width: 340, height: 480, borderRadius: 50, backgroundColor: "#5F6776" })} />
    <div style={box({ left: 40, top: 1300, width: 920, height: 140, borderRadius: 40, backgroundColor: "#4C5361" })} />
    <div style={box({ left: 0, top: 1440, width: 1080, height: 480, backgroundColor: "#2F343E" })} />
    {/* крепление ремня у плеча и замок у бедра */}
    <div style={box({ left: 262, top: 800, width: 52, height: 30, borderRadius: 10, backgroundColor: "#2A2E36" })} />
    <div style={box({ left: 598, top: 1268, width: 36, height: 50, borderRadius: 8, backgroundColor: "#22252C" })} />
    <div style={box({ left: 604, top: 1276, width: 24, height: 10, borderRadius: 4, backgroundColor: "#E2433A" })} />
  </div>
);

// Передний план: проём двери и край открытой двери (серебристый кузов).
export const RearDoorFrame: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: -40, top: 0, width: 1160, height: 360, background: "linear-gradient(180deg, #C9CED6, #AEB4BE)" })} />
    <div style={box({ left: -40, top: 330, width: 1160, height: 40, backgroundColor: "#8C929C" })} />
    <div style={box({ left: -40, top: 1560, width: 1160, height: 400, background: "linear-gradient(180deg, #AEB4BE, #959BA6)" })} />
    <div style={box({ left: -40, top: 360, width: 70, height: 1220, backgroundColor: "#A7ADB7" })} />
  </div>
);

// Вид спереди через лобовое стекло. sway — лёгкое покачивание машины,
// pass — движение отражений (едем), wheel — поворот руля (градусы).
export const CabinBack: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, background: "linear-gradient(180deg, #8FA9C2, #C9D6E0)" })} />
    {/* салон: задние окна, задний ряд */}
    <div style={box({ left: 120, top: 520, width: 840, height: 560, borderRadius: "80px 80px 20px 20px", backgroundColor: "#3B414D" })} />
    <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", background: "linear-gradient(180deg, #D6E4EE, #EADFCB)" })} />
    <div style={box({ left: 140, top: 880, width: 800, height: 420, borderRadius: 50, backgroundColor: "#565E6C" })} />
    <div style={box({ left: 0, top: 1300, width: 1080, height: 620, backgroundColor: "#2F343E" })} />
  </div>
);

// Спинки передних сидений (перед дочкой, за мамой).
export const FrontSeats: React.FC = () => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: 60, top: 930, width: 330, height: 560, borderRadius: "90px 90px 30px 30px", backgroundColor: "#4C5361" })} />
    <div style={box({ left: 120, top: 860, width: 210, height: 110, borderRadius: 40, backgroundColor: "#454B58" })} />
    <div style={box({ left: 660, top: 930, width: 360, height: 560, borderRadius: "90px 90px 30px 30px", backgroundColor: "#4C5361" })} />
    <div style={box({ left: 735, top: 860, width: 210, height: 110, borderRadius: 40, backgroundColor: "#454B58" })} />
  </div>
);

// Передний план кабины: руль, приборная панель, рамка стекла, отражения.
export const CabinFront: React.FC<{ pass: number; wheel?: number }> = ({ pass, wheel = 0 }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    {/* приборная панель */}
    <div style={box({ left: -40, top: 1420, width: 1160, height: 520, borderRadius: "80px 80px 0 0", background: "linear-gradient(180deg, #2B2F38, #1E2128)" })} />
    {/* руль водителя (справа в кадре: левый руль, вид спереди) */}
    <svg width={460} height={460} viewBox="-230 -230 460 460" style={box({ left: 590, top: 1110 })}>
      <g transform={`rotate(${wheel})`}>
        <circle r={190} fill="none" stroke="#1A1C22" strokeWidth={34} />
        <rect x={-170} y={-14} width={340} height={28} rx={10} fill="#1A1C22" />
        <circle r={56} fill="#262A33" />
      </g>
    </svg>
    {/* отражения в стекле: полосы проплывают — машина едет */}
    <div style={box({ left: 0, top: 0, width: 1080, height: 1420, overflow: "hidden" })}>
      {[0, 1, 2, 3].map((i) => {
        const x = ((pass * 9 + i * 420) % 1680) - 300;
        return <div key={i} style={box({ left: 1080 - x, top: -200, width: 120 + i * 30, height: 1800, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)", transform: "rotate(18deg)" })} />;
      })}
    </div>
    {/* рамка лобового стекла */}
    <div style={box({ left: -60, top: 300, width: 1200, height: 1160, borderRadius: "120px 120px 40px 40px", border: "70px solid #B9BEC6", boxSizing: "border-box" })} />
    <div style={box({ left: -60, top: 0, width: 1200, height: 340, backgroundColor: "#B9BEC6" })} />
    <div style={box({ left: 470, top: 340, width: 140, height: 50, borderRadius: 12, backgroundColor: "#2B2F38" })} />
  </div>
);
