import { interpolateColors } from "remotion";
import { INK } from "./props";

// Общие декорации из «Бир таң»: небо с горами, улица, светофор.

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
