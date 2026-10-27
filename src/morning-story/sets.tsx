import { interpolateColors } from "remotion";
import { COLORS } from "../config";
import { fontFamily } from "../fonts";
import { ClockFace, INK } from "./props";

// Декорации истории (плоская векторная графика 1080×1920 и шире).

// Бишкек за окном: небо, снежные вершины Ала-Тоо, панельные дома.
// light: 0 — рассвет, 1 — светлое утро; evening — тёплый вечер.
export const Skyline: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly light: number;
  readonly sunY?: number;
  readonly evening?: number;
  readonly parallax?: number; // сдвиг дальних слоёв (px)
}> = ({ width, height, light, sunY, evening = 0, parallax = 0 }) => {
  const skyTop = interpolateColors(
    evening > 0 ? evening : light,
    [0, 1],
    evening > 0 ? ["#BFE0F7", "#F6B98A"] : ["#F7C59F", "#BFE0F7"],
  );
  const skyBottom = interpolateColors(
    evening > 0 ? evening : light,
    [0, 1],
    evening > 0 ? ["#EAF5FD", "#FFE2B8"] : ["#FFE7C7", "#EAF5FD"],
  );
  // id градиента уникален для набора цветов (иначе одинаковые по размеру
  // небеса в одном кадре берут чужой градиент)
  const id = `sky-${width}-${height}-${Math.round(light * 100)}-${Math.round(evening * 100)}`;
  const sy = sunY ?? height * 0.55;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id})`} />
      <circle cx={width * 0.7} cy={sy} r={height * 0.09} fill="#FFE08A" opacity={0.95} />
      {/* горы */}
      <g transform={`translate(${parallax * 0.3} 0)`}>
        <path
          d={`M ${-100} ${height * 0.62} L ${width * 0.12} ${height * 0.36} L ${width * 0.26} ${height * 0.52} L ${width * 0.42} ${height * 0.3} L ${width * 0.6} ${height * 0.5} L ${width * 0.78} ${height * 0.34} L ${width + 100} ${height * 0.58} L ${width + 100} ${height} L -100 ${height} Z`}
          fill="#B9C9DD"
        />
        <path
          d={`M ${width * 0.42} ${height * 0.3} L ${width * 0.48} ${height * 0.37} L ${width * 0.45} ${height * 0.38} L ${width * 0.4} ${height * 0.34} L ${width * 0.36} ${height * 0.37} Z M ${width * 0.78} ${height * 0.34} L ${width * 0.83} ${height * 0.39} L ${width * 0.76} ${height * 0.38} Z M ${width * 0.12} ${height * 0.36} L ${width * 0.16} ${height * 0.41} L ${width * 0.09} ${height * 0.4} Z`}
          fill="#FFFFFF"
        />
      </g>
      {/* дома */}
      <g transform={`translate(${parallax * 0.6} 0)`}>
        {Array.from({ length: 9 }).map((_, i) => {
          const w = width * 0.16;
          const x = -40 + i * width * 0.14;
          const h = height * (0.28 + ((i * 37) % 5) * 0.04);
          return (
            <g key={i}>
              <rect x={x} y={height - h} width={w} height={h} fill={i % 2 ? "#D7E1EE" : "#C9D6E6"} />
              {Array.from({ length: Math.floor(h / 40) }).map((__, r) => (
                <g key={r}>
                  {[0.2, 0.5, 0.8].map((fx) => (
                    <rect
                      key={fx}
                      x={x + w * fx - 6}
                      y={height - h + 16 + r * 40}
                      width={12}
                      height={16}
                      fill={(r + i) % 3 === 0 ? "#FFE9A8" : "#EEF3F9"}
                    />
                  ))}
                </g>
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// Квартира: стена, окно, зеркало, стол, дверь, часы, пол.
export const Apartment: React.FC<{
  readonly light: number;
  readonly clockMinutes: number;
  readonly evening?: number;
}> = ({ light, clockMinutes, evening = 0 }) => {
  const wall = interpolateColors(light, [0, 1], ["#EFE2D0", "#F7EFE3"]);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: wall }} />
      {/* окно */}
      <div
        style={{
          position: "absolute",
          left: 360,
          top: 300,
          width: 420,
          height: 560,
          borderRadius: 18,
          border: "18px solid #FFFFFF",
          boxShadow: "0 18px 40px rgba(20,40,90,0.12)",
          overflow: "hidden",
          backgroundColor: "#BFE0F7",
        }}
      >
        <Skyline width={420} height={560} light={light} evening={evening} sunY={interpolateNum(light, 470, 150)} />
        <div style={{ position: "absolute", left: 201, top: 0, width: 18, height: 560, backgroundColor: "#FFFFFF" }} />
        <div style={{ position: "absolute", left: 0, top: 262, width: 420, height: 18, backgroundColor: "#FFFFFF" }} />
      </div>
      {/* подоконник и растение */}
      <div style={{ position: "absolute", left: 330, top: 870, width: 480, height: 26, borderRadius: 10, backgroundColor: "#FFFFFF", boxShadow: "0 8px 18px rgba(20,40,90,0.10)" }} />
      <svg width={120} height={140} viewBox="0 0 120 140" style={{ position: "absolute", left: 680, top: 740 }}>
        <path d="M 60 90 C 20 70, 18 30, 40 10 C 50 40, 58 60, 60 90 Z" fill="#7FB77E" />
        <path d="M 60 90 C 96 64, 104 30, 88 6 C 74 36, 64 60, 60 90 Z" fill="#6AA56B" />
        <path d="M 30 88 L 90 88 L 82 136 L 38 136 Z" fill="#E07A5F" />
      </svg>
      {/* зеркало */}
      <div style={{ position: "absolute", left: 60, top: 470, width: 210, height: 520, borderRadius: 105, border: "14px solid #D9B98C", background: "linear-gradient(160deg, #EAF4FB 0%, #CFE3F2 60%, #E4EEF6 100%)", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 120, top: 540, width: 30, height: 200, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.7)", rotate: "18deg" }} />
      {/* часы */}
      <div style={{ position: "absolute", left: 845, top: 380 }}>
        <ClockFace size={170} minutes={clockMinutes} />
      </div>
      {/* дверь */}
      <div style={{ position: "absolute", left: 930, top: 820, width: 230, height: 640, borderRadius: "16px 16px 0 0", backgroundColor: "#C8A27A", border: "14px solid #FFFFFF", boxSizing: "border-box" }} />
      {/* пол */}
      <div style={{ position: "absolute", left: 0, top: 1420, width: 1080, height: 500, backgroundColor: "#E4CCAA" }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: 1460 + i * 70, width: 1080, height: 4, backgroundColor: "rgba(150,110,70,0.12)" }} />
      ))}
      <div style={{ position: "absolute", left: 0, top: 1404, width: 1080, height: 22, backgroundColor: "#FFFFFF" }} />
    </div>
  );
};

const interpolateNum = (t: number, a: number, b: number) => a + (b - a) * t;

// Стол на переднем плане (перекрывает ноги сидящих за ним).
// Стол с закрытой передней стенкой (комод-стол): за ним стоит ребёнок.
export const Table: React.FC<{ x: number; y: number; w: number; h?: number }> = ({ x, y, w, h = 340 }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <div style={{ position: "absolute", left: 14, top: 24, width: w - 28, height: h - 24, backgroundColor: "#C8956A", borderRadius: "0 0 10px 10px" }} />
    <div style={{ position: "absolute", left: 40, top: 70, width: (w - 100) / 2, height: 90, borderRadius: 10, backgroundColor: "#D3A57C" }} />
    <div style={{ position: "absolute", left: 60 + (w - 100) / 2, top: 70, width: (w - 100) / 2, height: 90, borderRadius: 10, backgroundColor: "#D3A57C" }} />
    <div style={{ position: "absolute", left: w / 4 - 20, top: 108, width: 40, height: 12, borderRadius: 6, backgroundColor: "#9A6844" }} />
    <div style={{ position: "absolute", left: (3 * w) / 4 - 20, top: 108, width: 40, height: 12, borderRadius: 6, backgroundColor: "#9A6844" }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: 30, borderRadius: 12, backgroundColor: "#B07A50" }} />
  </div>
);

// Улица: дорога с полосами, тротуар, деревья, дома. offset — движение
// камеры вдоль улицы (параллакс: дальние слои медленнее).
export const Street: React.FC<{
  readonly width: number;
  readonly offset: number;
  readonly roadY: number;
  readonly light?: number;
  readonly busy?: number;
}> = ({ width, offset, roadY, light = 1 }) => {
  const tile = 1400;
  const ox = ((offset * 0.5) % tile) - tile;
  const tx = ((offset % 600) + 600) % 600;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width, height: 1920, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width, height: roadY - 150 }}>
        <Skyline width={width} height={roadY - 150} light={light} parallax={-offset * 0.15} />
      </div>
      {/* ближние дома */}
      <div style={{ position: "absolute", left: 0, top: roadY - 620, width, height: 480, overflow: "hidden" }}>
        {[0, 1, 2].map((rep) => (
          <svg key={rep} width={tile} height={480} viewBox={`0 0 ${tile} 480`} style={{ position: "absolute", left: ox + rep * tile, top: 0 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const x = i * 280;
              const h = 300 + ((i * 53) % 4) * 40;
              const c = ["#F2D7B6", "#E9EEF5", "#F5E6CF", "#DCE8F5", "#F0DCC4"][i];
              return (
                <g key={i}>
                  <rect x={x} y={480 - h} width={260} height={h} fill={c} />
                  {Array.from({ length: Math.floor(h / 70) }).map((_, r) =>
                    [0, 1, 2].map((k) => (
                      <rect key={`${r}-${k}`} x={x + 30 + k * 76} y={480 - h + 30 + r * 70} width={46} height={40} rx={4} fill="#CFE3F5" />
                    )),
                  )}
                </g>
              );
            })}
          </svg>
        ))}
      </div>
      {/* деревья и тротуар */}
      <div style={{ position: "absolute", left: 0, top: roadY - 150, width, height: 150, backgroundColor: "#E7E2DA" }} />
      {Array.from({ length: 6 }).map((_, i) => {
        const x = ((i * 380 + offset * 0.9) % 2280 + 2280) % 2280 - 300;
        return (
          <svg key={i} width={200} height={300} viewBox="0 0 200 300" style={{ position: "absolute", left: x, top: roadY - 400 }}>
            <rect x={92} y={170} width={16} height={110} fill="#8A6A4E" />
            <circle cx={100} cy={120} r={80} fill="#86BE84" />
            <circle cx={60} cy={150} r={50} fill="#7AB078" />
            <circle cx={140} cy={150} r={50} fill="#7AB078" />
          </svg>
        );
      })}
      {/* дорога */}
      <div style={{ position: "absolute", left: 0, top: roadY, width, height: 1920 - roadY, backgroundColor: "#6E7685" }} />
      <div style={{ position: "absolute", left: 0, top: roadY, width, height: 14, backgroundColor: "#D5D9E0" }} />
      {[0, 1].map((lane) => (
        <div key={lane} style={{ position: "absolute", left: -600 + tx, top: roadY + 210 + lane * 260, width: width + 1200, height: 10, backgroundImage: "repeating-linear-gradient(90deg, #F2F2F2 0 80px, transparent 80px 160px)" }} />
      ))}
    </div>
  );
};

// Светофор.
export const TrafficLight: React.FC<{ state: "red" | "yellow" | "green"; size: number }> = ({ state, size }) => (
  <svg width={size} height={size * 2.6} viewBox="0 0 100 260">
    <rect x={44} y={150} width={12} height={110} fill="#4A5262" />
    <rect x={14} y={0} width={72} height={170} rx={20} fill={INK} />
    {(["red", "yellow", "green"] as const).map((c, i) => (
      <circle
        key={c}
        cx={50}
        cy={32 + i * 52}
        r={20}
        fill={
          state === c
            ? { red: "#F0644B", yellow: "#FFC90E", green: "#4CC27A" }[c]
            : "#3A4664"
        }
      />
    ))}
  </svg>
);

// Подъезд жилого дома (для сцены, где приезжает такси).
export const Entrance: React.FC<{ x: number; roadY: number }> = ({ x, roadY }) => (
  <div style={{ position: "absolute", left: x, top: roadY - 560 }}>
    <div style={{ width: 360, height: 420, backgroundColor: "#F5E6CF" }} />
    <div style={{ position: "absolute", left: 110, top: 160, width: 140, height: 260, borderRadius: "70px 70px 0 0", backgroundColor: "#7B5A44" }} />
    <div style={{ position: "absolute", left: 80, top: 130, width: 200, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" }} />
  </div>
);

// Школа: фасад, вывеска «Мектеп», вход с дверью (doorOpen 0…1), звонок.
export const School: React.FC<{
  readonly doorOpen: number;
  readonly bell: number; // 0…1 — дрожание звонка
  readonly label: string;
  readonly children?: React.ReactNode; // персонаж в дверном проёме (за дверью)
}> = ({ doorOpen, bell, label, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#BFE0F7, #EAF5FD 55%)" }} />
    <div style={{ position: "absolute", left: -20, top: 420, width: 1120, height: 1000, backgroundColor: "#F3E3C9" }} />
    <div style={{ position: "absolute", left: -20, top: 400, width: 1120, height: 40, backgroundColor: "#D96C55" }} />
    {/* окна */}
    {[0, 1].map((r) =>
      [0, 1, 2, 3].map((k) =>
        k === 1 || k === 2 ? null : (
          <div key={`${r}-${k}`} style={{ position: "absolute", left: 60 + k * 250, top: 520 + r * 240, width: 180, height: 160, borderRadius: 10, backgroundColor: "#CFE3F5", border: "10px solid #FFFFFF", boxSizing: "border-box" }} />
        ),
      ),
    )}
    {/* вывеска */}
    <div style={{ position: "absolute", left: 330, top: 470, width: 420, height: 110, borderRadius: 20, backgroundColor: INK, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {label}
    </div>
    {/* звонок */}
    <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: "absolute", left: 790, top: 600, rotate: `${Math.sin(bell * 60) * 12 * bell}deg` }}>
      <path d="M 60 14 C 30 14, 26 44, 26 64 L 16 84 L 104 84 L 94 64 C 94 44, 90 14, 60 14 Z" fill={COLORS.yellow} stroke={INK} strokeWidth={6} />
      <circle cx={60} cy={96} r={12} fill={INK} />
    </svg>
    {/* дверной проём: тёмный проём, персонаж внутри, створка поверх */}
    <div style={{ position: "absolute", left: 380, top: 680, width: 320, height: 740, overflow: "hidden", borderRadius: "40px 40px 0 0" }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#3A4664" }} />
      <div style={{ position: "absolute", left: -380, top: -680, width: 1080, height: 1920 }}>{children}</div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 160 * (1 - doorOpen) + 4, height: 740, backgroundColor: "#8A6047", borderRight: "6px solid #6E4B37" }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 160 * (1 - doorOpen) + 4, height: 740, backgroundColor: "#8A6047", borderLeft: "6px solid #6E4B37" }} />
    </div>
    <div style={{ position: "absolute", left: 360, top: 660, width: 360, height: 30, borderRadius: 10, backgroundColor: "#FFFFFF" }} />
    {/* ступени и двор */}
    <div style={{ position: "absolute", left: -20, top: 1420, width: 1120, height: 500, backgroundColor: "#DCD6CC" }} />
    <div style={{ position: "absolute", left: 330, top: 1420, width: 420, height: 34, backgroundColor: "#EDE8E0" }} />
  </div>
);

// Офис: стена, окно с городом, часы, стол и монитор.
export const Office: React.FC<{
  readonly clockMinutes: number;
  readonly light?: number;
  readonly brand?: number; // 0…1 — сдвиг к фирменной палитре
}> = ({ clockMinutes, brand = 0 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
    <div style={{ position: "absolute", inset: 0, backgroundColor: interpolateColors(brand, [0, 1], ["#E6EAF0", "#F6F8FB"]) }} />
    <div style={{ position: "absolute", left: 120, top: 330, width: 560, height: 520, borderRadius: 16, border: "16px solid #FFFFFF", overflow: "hidden", boxShadow: "0 18px 40px rgba(20,40,90,0.10)" }}>
      <Skyline width={560} height={520} light={1} sunY={110} />
    </div>
    <div style={{ position: "absolute", left: 790, top: 360 }}>
      <ClockFace size={190} minutes={clockMinutes} />
    </div>
    {/* полка с папками */}
    <div style={{ position: "absolute", left: 760, top: 640, width: 260, height: 18, backgroundColor: "#B9C3D1" }} />
    {["#4F8FCB", "#E07A5F", "#7FB77E", "#FFC90E"].map((c, i) => (
      <div key={c} style={{ position: "absolute", left: 780 + i * 52, top: 540, width: 40, height: 100, borderRadius: 6, backgroundColor: c }} />
    ))}
    <div style={{ position: "absolute", left: 0, top: 1440, width: 1080, height: 480, backgroundColor: "#C9D1DC" }} />
  </div>
);

// Рабочий стол (передний план): столешница и монитор.
export const Desk: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <div style={{ position: "absolute", left: 470, top: -250, width: 300, height: 200, borderRadius: 16, backgroundColor: INK }} />
    <div style={{ position: "absolute", left: 484, top: -236, width: 272, height: 172, borderRadius: 8, backgroundColor: "#DCE8F5" }} />
    <div style={{ position: "absolute", left: 605, top: -52, width: 30, height: 52, backgroundColor: INK }} />
    <div style={{ width: 900, height: 36, borderRadius: 14, backgroundColor: "#E9EDF2", boxShadow: "0 10px 20px rgba(20,40,90,0.12)" }} />
    <div style={{ position: "absolute", left: 30, top: 36, width: 840, height: 600, backgroundColor: "#D7DEE7" }} />
  </div>
);
