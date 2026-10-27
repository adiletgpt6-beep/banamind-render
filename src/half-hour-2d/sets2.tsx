import { interpolateColors } from "remotion";
import { COLORS } from "../config";
import { fontFamily } from "../fonts";
import { ClockFace, INK } from "./props";
import { Skyline } from "./sets";

// Декорации 2D-версии «Жумуштан жарым саатка» (мир 1080 × 1920).

const abs = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// ---------- Офис ----------
export const OfficeRoom: React.FC<{ readonly clockMinutes: number; readonly late?: number }> = ({
  clockMinutes,
  late = 0,
}) => (
  <div style={abs({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={abs({ inset: 0, backgroundColor: "#E8ECF2" })} />
    <div style={abs({ left: 0, top: 1060, width: 1080, height: 400, backgroundColor: "#DDE3EB" })} />
    {/* окно с видом на город и горы */}
    <div
      style={abs({
        left: 70,
        top: 250,
        width: 560,
        height: 560,
        borderRadius: 16,
        border: "16px solid #FFFFFF",
        overflow: "hidden",
        boxShadow: "0 18px 40px rgba(20,40,90,0.10)",
      })}
    >
      <Skyline width={528} height={528} light={1} sunY={120 + late * 60} />
      <div style={abs({ left: 256, top: 0, width: 16, height: 528, backgroundColor: "#FFFFFF" })} />
    </div>
    {/* часы */}
    <div style={abs({ left: 770, top: 270 })}>
      <ClockFace size={210} minutes={clockMinutes} />
    </div>
    {/* доска с задачами */}
    <div style={abs({ left: 720, top: 540, width: 300, height: 260, borderRadius: 14, backgroundColor: "#FFFFFF", boxShadow: "0 10px 24px rgba(20,40,90,0.08)" })}>
      {["#FFE08A", "#CFE3F5", "#F7C6B8", "#D5EBD0", "#FFE08A", "#CFE3F5"].map((c, i) => (
        <div
          key={i}
          style={abs({ left: 22 + (i % 3) * 92, top: 24 + Math.floor(i / 3) * 112, width: 74, height: 86, borderRadius: 6, backgroundColor: c })}
        />
      ))}
    </div>
    {/* полка с папками */}
    <div style={abs({ left: 720, top: 940, width: 300, height: 16, backgroundColor: "#B9C3D1" })} />
    {["#4F8FCB", "#E07A5F", "#7FB77E", "#FFC90E", "#4F8FCB"].map((c, i) => (
      <div key={i} style={abs({ left: 736 + i * 54, top: 846, width: 42, height: 94, borderRadius: 6, backgroundColor: c })} />
    ))}
    {/* растение */}
    <svg width={160} height={260} viewBox="0 0 160 260" style={abs({ left: 40, top: 1180 })}>
      <path d="M 80 170 C 20 140, 10 60, 46 16 C 60 70, 74 110, 80 170 Z" fill="#7FB77E" />
      <path d="M 80 170 C 140 130, 150 60, 120 10 C 100 70, 86 110, 80 170 Z" fill="#6AA56B" />
      <path d="M 80 170 C 60 120, 70 70, 84 40 C 92 90, 88 130, 80 170 Z" fill="#8CC48A" />
      <path d="M 40 166 L 120 166 L 110 258 L 50 258 Z" fill="#E07A5F" />
    </svg>
    <div style={abs({ left: 0, top: 1440, width: 1080, height: 480, backgroundColor: "#C9D1DC" })} />
    <div style={abs({ left: 0, top: 1432, width: 1080, height: 14, backgroundColor: "#FFFFFF" })} />
  </div>
);

// Рабочий стол спереди: столешница, монитор (screen — содержимое экрана
// 300 × 190), клавиатура, кружка. Передняя панель закрывает ноги.
export const WorkDesk: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly screen?: React.ReactNode;
  readonly monitorX?: number;
  readonly children?: React.ReactNode; // предметы на столешнице
}> = ({ x, y, w = 820, screen, monitorX = 470, children }) => (
  <div style={abs({ left: x, top: y })}>
    {/* монитор */}
    <div style={abs({ left: monitorX, top: -270, width: 330, height: 222, borderRadius: 16, backgroundColor: INK })}>
      <div style={abs({ left: 14, top: 14, width: 302, height: 192, borderRadius: 8, backgroundColor: "#F4F7FB", overflow: "hidden" })}>
        {screen}
      </div>
    </div>
    <div style={abs({ left: monitorX + 150, top: -50, width: 30, height: 50, backgroundColor: INK })} />
    <div style={abs({ left: monitorX + 110, top: -10, width: 110, height: 14, borderRadius: 7, backgroundColor: INK })} />
    {/* столешница */}
    <div style={abs({ left: 0, top: 0, width: w, height: 40, borderRadius: 14, backgroundColor: "#F1F3F7", boxShadow: "0 10px 20px rgba(20,40,90,0.12)" })} />
    <div style={abs({ left: 30, top: 40, width: w - 60, height: 900, backgroundColor: "#D3DAE4" })} />
    <div style={abs({ left: 30, top: 40, width: w - 60, height: 18, backgroundColor: "#C3CCD8" })} />
    {children}
  </div>
);

// Экран монитора: таблица отчёта; progress 0…1 — сколько строк заполнено.
export const ReportScreen: React.FC<{ readonly progress: number; readonly title: string; readonly highlight?: number }> = ({
  progress,
  title,
  highlight = -1,
}) => {
  const rows = 6;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: INK }}>
      <div style={abs({ left: 0, top: 0, right: 0, height: 34, backgroundColor: "#14285A", color: "#FFFFFF", fontSize: 17, fontWeight: 800, padding: "6px 12px", boxSizing: "border-box" })}>
        {title}
      </div>
      {Array.from({ length: rows }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, progress * rows - i));
        return (
          <div key={i} style={abs({ left: 12, top: 46 + i * 24, width: 278, height: 16, borderRadius: 4, backgroundColor: i === highlight ? "#FFF4C2" : "#E6EBF2" })}>
            <div style={abs({ left: 0, top: 0, width: 278 * fill * 0.86, height: 16, borderRadius: 4, backgroundColor: i % 2 ? "#9DB7D8" : "#BFD0E6" })} />
          </div>
        );
      })}
    </div>
  );
};

// Телефон, лежащий на столе (вид спереди-сверху). Вибрирует только он сам.
export const DeskPhone: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly lit?: number;
  readonly shake?: number;
}> = ({ x, y, lit = 0, shake = 0 }) => (
  <div style={abs({ left: x + shake, top: y, width: 120, height: 34 })}>
    <div style={abs({ left: 0, top: 0, width: 120, height: 30, borderRadius: 10, backgroundColor: INK })} />
    <div style={abs({ left: 8, top: 4, width: 104, height: 18, borderRadius: 6, backgroundColor: interpolateColors(lit, [0, 1], ["#2C3A58", "#CFE3F5"]) })} />
    {shake !== 0 ? (
      <svg width={180} height={60} viewBox="0 0 180 60" style={abs({ left: -30, top: -16 })}>
        {[-1, 1].map((s) => (
          <g key={s} stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55}>
            <path d={`M ${90 + s * 76} 16 L ${90 + s * 84} 24`} />
            <path d={`M ${90 + s * 78} 32 L ${90 + s * 88} 32`} />
            <path d={`M ${90 + s * 76} 48 L ${90 + s * 84} 40`} />
          </g>
        ))}
      </svg>
    ) : null}
  </div>
);

// Сумка, лежащая на столешнице (та же, что у мамы в руке и на плече).
export const BagOnDesk: React.FC<{ readonly x: number; readonly y: number; readonly k?: number }> = ({ x, y, k = 1 }) => (
  <svg width={110 * k} height={124 * k} viewBox="-55 -36 110 124" style={abs({ left: x - 55 * k, top: y - 36 * k })}>
    <path d="M -26 6 Q -26 -30 0 -30 Q 26 -30 26 6" fill="none" stroke="#6B4A3A" strokeWidth={8} />
    <rect x={-52} y={4} width={104} height={82} rx={16} fill="#8A5E48" />
    <rect x={-52} y={4} width={104} height={22} rx={10} fill="#7A513D" />
  </svg>
);

// ---------- Школа ----------
export const SchoolYard: React.FC<{
  readonly doorOpen?: number;
  readonly bell?: number;
  readonly label: string;
  readonly afternoon?: number; // 0…1 — тени длиннее
  readonly inDoor?: React.ReactNode;
}> = ({ doorOpen = 0, bell = 0, label, afternoon = 0, inDoor }) => (
  <div style={abs({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={abs({ inset: 0, background: interpolateColors(afternoon, [0, 1], ["#CFE6F8", "#F3DDBD"]) })} />
    <div style={abs({ left: 0, top: 0, width: 1080, height: 520 })}>
      <Skyline width={1080} height={520} light={1} evening={afternoon * 0.25} sunY={160 + afternoon * 80} />
    </div>
    {/* здание */}
    <div style={abs({ left: -20, top: 360, width: 1120, height: 1060, backgroundColor: "#F3E3C9" })} />
    <div style={abs({ left: -20, top: 340, width: 1120, height: 44, backgroundColor: "#D96C55" })} />
    {[0, 1].map((r) =>
      [0, 3].map((k) => (
        <div
          key={`${r}-${k}`}
          style={abs({ left: 60 + k * 250, top: 470 + r * 240, width: 180, height: 160, borderRadius: 10, backgroundColor: "#CFE3F5", border: "10px solid #FFFFFF", boxSizing: "border-box" })}
        />
      )),
    )}
    <div style={abs({ left: 330, top: 410, width: 420, height: 104, borderRadius: 20, backgroundColor: INK, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 62, display: "flex", alignItems: "center", justifyContent: "center" })}>
      {label}
    </div>
    <svg width={110} height={110} viewBox="0 0 120 120" style={abs({ left: 800, top: 540, rotate: `${Math.sin(bell * 60) * 12 * bell}deg` })}>
      <path d="M 60 14 C 30 14, 26 44, 26 64 L 16 84 L 104 84 L 94 64 C 94 44, 90 14, 60 14 Z" fill={COLORS.yellow} stroke={INK} strokeWidth={6} />
      <circle cx={60} cy={96} r={12} fill={INK} />
    </svg>
    {/* вход: проём, персонаж внутри, створки поверх */}
    <div style={abs({ left: 380, top: 600, width: 320, height: 760, overflow: "hidden", borderRadius: "40px 40px 0 0" })}>
      <div style={abs({ inset: 0, backgroundColor: "#3A4664" })} />
      <div style={abs({ left: -380, top: -600, width: 1080, height: 1920 })}>{inDoor}</div>
      <div style={abs({ left: 0, top: 0, width: 160 * (1 - doorOpen) + 4, height: 760, backgroundColor: "#8A6047", borderRight: "6px solid #6E4B37" })} />
      <div style={abs({ right: 0, top: 0, width: 160 * (1 - doorOpen) + 4, height: 760, backgroundColor: "#8A6047", borderLeft: "6px solid #6E4B37" })} />
    </div>
    <div style={abs({ left: 360, top: 580, width: 360, height: 30, borderRadius: 10, backgroundColor: "#FFFFFF" })} />
    {/* двор */}
    <div style={abs({ left: -20, top: 1360, width: 1120, height: 560, backgroundColor: "#DCD6CC" })} />
    <div style={abs({ left: 330, top: 1360, width: 420, height: 30, backgroundColor: "#EDE8E0" })} />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={abs({ left: -20, top: 1460 + i * 80, width: 1120, height: 3, backgroundColor: "rgba(120,110,90,0.10)" })} />
    ))}
  </div>
);

// Скамейка во дворе (вид спереди): спинка за сидящими, сиденье — уровень посадки.
export const BenchBack: React.FC<{ readonly x: number; readonly y: number; readonly w: number }> = ({ x, y, w }) => (
  <div style={abs({ left: x, top: y })}>
    {[0, 1].map((i) => (
      <div key={i} style={abs({ left: 0, top: i * 46, width: w, height: 34, borderRadius: 10, backgroundColor: "#B98A5E" })} />
    ))}
    <div style={abs({ left: 0, top: 112, width: w, height: 40, borderRadius: 10, backgroundColor: "#A77A50" })} />
    <div style={abs({ left: 30, top: 150, width: 22, height: 150, backgroundColor: "#4A5262" })} />
    <div style={abs({ left: w - 52, top: 150, width: 22, height: 150, backgroundColor: "#4A5262" })} />
  </div>
);

// Дерево (крона и ствол).
export const Tree: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={300 * s} height={460 * s} viewBox="0 0 300 460" style={abs({ left: x - 150 * s, top: y - 460 * s })}>
    <rect x={136} y={250} width={28} height={210} fill="#8A6A4E" />
    <circle cx={150} cy={170} r={120} fill="#86BE84" />
    <circle cx={86} cy={220} r={80} fill="#7AB078" />
    <circle cx={216} cy={220} r={80} fill="#7AB078" />
    <circle cx={150} cy={100} r={70} fill="#93C891" />
  </svg>
);

// ---------- Квартира вечером ----------
export const LivingRoom: React.FC<{ readonly lamp?: number }> = ({ lamp = 1 }) => (
  <div style={abs({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={abs({ inset: 0, backgroundColor: "#F3E4CF" })} />
    <div style={abs({ left: 0, top: 1240, width: 1080, height: 680, backgroundColor: "#D9B993" })} />
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={abs({ left: 0, top: 1290 + i * 100, width: 1080, height: 4, backgroundColor: "rgba(150,110,70,0.12)" })} />
    ))}
    {/* окно: вечерний город */}
    <div style={abs({ left: 120, top: 280, width: 440, height: 520, borderRadius: 18, border: "18px solid #FFFFFF", overflow: "hidden", boxShadow: "0 18px 40px rgba(20,40,90,0.12)" })}>
      <Skyline width={404} height={484} light={1} evening={1} sunY={420} />
      <div style={abs({ left: 193, top: 0, width: 18, height: 484, backgroundColor: "#FFFFFF" })} />
    </div>
    {/* картина */}
    <div style={abs({ left: 660, top: 330, width: 260, height: 190, borderRadius: 10, border: "12px solid #B07A50", backgroundColor: "#CFE3F5", overflow: "hidden" })}>
      <svg width={236} height={166} viewBox="0 0 236 166">
        <path d="M 0 130 L 60 60 L 110 110 L 160 40 L 236 120 L 236 166 L 0 166 Z" fill="#9FB6CE" />
        <path d="M 160 40 L 176 58 L 150 60 Z M 60 60 L 72 74 L 50 74 Z" fill="#FFFFFF" />
      </svg>
    </div>
    {/* торшер */}
    <div style={abs({ left: 930, top: 620, width: 0, height: 0 })}>
      <div style={abs({ left: -160, top: -60, width: 320, height: 520, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(255,214,140,${0.55 * lamp}), rgba(255,214,140,0))` })} />
      <div style={abs({ left: -60, top: 0, width: 120, height: 100, borderRadius: "16px 16px 30px 30px", backgroundColor: "#FFE7B3" })} />
      <div style={abs({ left: -5, top: 100, width: 10, height: 520, backgroundColor: "#8A6A4E" })} />
    </div>
    {/* спинка дивана */}
    <div style={abs({ left: 60, top: 1010, width: 860, height: 340, borderRadius: "60px 60px 20px 20px", backgroundColor: "#4F6D9A" })} />
    <div style={abs({ left: 30, top: 1170, width: 110, height: 260, borderRadius: 50, backgroundColor: "#45608A" })} />
    <div style={abs({ left: 840, top: 1170, width: 110, height: 260, borderRadius: 50, backgroundColor: "#45608A" })} />
    <div style={abs({ left: 150, top: 1090, width: 150, height: 120, borderRadius: 30, backgroundColor: "#FFC90E", rotate: "-8deg" })} />
  </div>
);

// Сиденье дивана — перед спинкой, за ногами сидящих.
export const SofaSeat: React.FC = () => (
  <div style={abs({ left: 110, top: 1340, width: 760, height: 110, borderRadius: 30, backgroundColor: "#5A7AA8" })} />
);

// ---------- Улица у офиса ----------
export const OfficeFacade: React.FC<{ readonly doorOpen?: number }> = ({ doorOpen = 0 }) => (
  <div style={abs({ left: 0, top: 0, width: 1080, height: 1920, backgroundColor: "#EAF5FD" })}>
    <div style={abs({ left: 0, top: 0, width: 1080, height: 1420 })}>
      <Skyline width={1080} height={1420} light={1} sunY={180} />
    </div>
    <div style={abs({ left: 80, top: 260, width: 920, height: 1150, backgroundColor: "#DCE6F2" })} />
    {Array.from({ length: 4 }).map((_, r) =>
      Array.from({ length: 4 }).map((__, c) => (
        <div key={`${r}-${c}`} style={abs({ left: 130 + c * 220, top: 310 + r * 170, width: 160, height: 120, borderRadius: 8, backgroundColor: "#A9C6E4" })} />
      )),
    )}
    <div style={abs({ left: 340, top: 1000, width: 400, height: 410, backgroundColor: "#7E9CC0" })} />
    <div style={abs({ left: 352, top: 1012, width: 186 - doorOpen * 120, height: 398, backgroundColor: "#B9D3EE", opacity: 0.9 })} />
    <div style={abs({ left: 542 + doorOpen * 120, top: 1012, width: 186 - doorOpen * 120, height: 398, backgroundColor: "#B9D3EE", opacity: 0.9 })} />
    <div style={abs({ left: 0, top: 1410, width: 1080, height: 510, backgroundColor: "#E7E2DA" })} />
    <div style={abs({ left: 0, top: 1700, width: 1080, height: 220, backgroundColor: "#6E7685" })} />
    <div style={abs({ left: 0, top: 1700, width: 1080, height: 12, backgroundColor: "#D5D9E0" })} />
  </div>
);
