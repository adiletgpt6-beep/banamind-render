// Улица Бишкека для бокового сопровождения машины (сцены 4e, 5g, 7a):
// машина едет по кадру, фон уходит в сторону со своей скоростью у каждого
// слоя — дальний хребет Ала-Тоо и город (почти неподвижны), средние дома
// и башня «Бизнес-борбор», ряд деревьев бульвара, тротуар с фонарями и
// оградой, дорога с разметкой, размытый передний план (газон и кусты).
// Всё в координатах кадра 1080×1920; scroll — сдвиг (px) переднего плана:
// при движении машины вправо scroll растёт, фон уходит влево.
//
// YardTurnTop — вид сверху (как иллюстрированная схема): улица, ограда
// двора с открытыми воротами, деревья; машина едет вправо и поворачивает
// во двор. Школьного входа в этом плане нет.
import { box } from "../kit";
import { clamp, easeInOut, hash01, lerp } from "../rig/motion";
import { M13_TEXT } from "../script";
import { C, F } from "../theme";
import { CityView, ink, mix } from "./Office31";
import { YardTree } from "./SchoolYard";
import { FAMILY_CAR } from "../props/Car";

// Машина и улица — выше полосы субтитров (y 1390–1580): дорога у y 1290,
// ниже — газон и кусты переднего плана.
export const STREET = {
  road: 1290, // линия касания колёс (ближняя полоса)
  roadTop: 1100,
  curb: 1080,
  walk: 1002, // дальний край тротуара
  mid: 930, // основание средних домов
  trees: 1008,
} as const;

const Svg: React.FC<{ readonly children: React.ReactNode; readonly blur?: number; readonly x?: number }> = ({ children, blur = 0, x = 0 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", filter: blur ? `blur(${blur}px)` : undefined, transform: `translateX(${x}px)` })}>
    {children}
  </svg>
);

const LINE = "#56606E";

// Средний дом (детерминированно по номеру).
const House: React.FC<{ readonly x: number; readonly i: number; readonly evening: number }> = ({ x, i, evening }) => {
  const w = 300 + 180 * hash01(i * 3.7);
  const h = 320 + 330 * hash01(i * 5.1 + 2);
  const cols = ["#E9DCC8", "#D6DEE7", "#E7D1C3", "#CFD9CF", "#E3E1DA"];
  const c = mix(cols[Math.floor(hash01(i * 9.3) * cols.length)], "#F3C9A0", 0.25 * evening);
  const y0 = STREET.mid - h;
  const nx = Math.max(2, Math.floor(w / 80));
  const ny = Math.max(3, Math.floor(h / 90));
  return (
    <g>
      <rect x={x} y={y0} width={w} height={h} fill={c} stroke={ink(c, 0.7)} strokeWidth={3} />
      <rect x={x - 8} y={y0 - 14} width={w + 16} height={16} fill={ink(c, 0.82)} />
      {Array.from({ length: ny }).map((_, r) =>
        Array.from({ length: nx }).map((__, q) => (
          <rect key={`${r}-${q}`} x={x + 24 + q * ((w - 48) / nx)} y={y0 + 30 + r * ((h - 50) / ny)} width={(w - 48) / nx - 22} height={(h - 50) / ny - 30} fill={mix("#B9D2E6", "#F6D7A9", evening * 0.5)} stroke="#FFFFFF" strokeWidth={4} />
        )),
      )}
    </g>
  );
};

// Башня бизнес-центра: стекло, вертикальные ламели, вывеска «Бизнес-борбор».
const BCTower: React.FC<{ readonly x: number }> = ({ x }) => {
  const w = 420;
  const h = 800;
  const y0 = STREET.mid - h;
  return (
    <g>
      <rect x={x} y={y0} width={w} height={h} fill="#8FB3CF" stroke="#4E6A82" strokeWidth={4} />
      {Array.from({ length: 12 }).map((_, r) => (
        <rect key={`r${r}`} x={x} y={y0 + 120 + r * 76} width={w} height={6} fill="#D6E6F2" opacity={0.8} />
      ))}
      {Array.from({ length: 7 }).map((_, q) => (
        <rect key={`q${q}`} x={x + 30 + q * 60} y={y0 + 110} width={8} height={h - 230} fill="#6F91AD" opacity={0.7} />
      ))}
      <path d={`M ${x + 40} ${y0 + 130} L ${x + 180} ${y0 + 130} L ${x + 60} ${y0 + 600} L ${x + 40} ${y0 + 600} Z`} fill="#FFFFFF" opacity={0.22} />
      {/* вывеска */}
      <rect x={x + 20} y={y0 + 24} width={w - 40} height={76} rx={14} fill={C.navy} stroke="#0E1B2E" strokeWidth={3} />
      {/* вход и козырёк */}
      <rect x={x + 120} y={STREET.mid - 150} width={180} height={150} fill="#3E5266" />
      <rect x={x + 90} y={STREET.mid - 170} width={240} height={24} fill="#2F3D4E" />
    </g>
  );
};

export const CityStreet: React.FC<{
  readonly scroll: number; // сдвиг переднего плана, px
  readonly bcX?: number; // мировая X башни (в координатах среднего слоя)
  readonly evening?: number;
  readonly car?: React.ReactNode; // машина и всё, что едет по дороге
}> = ({ scroll, bcX = 900, evening = 0, car }) => {
  const e = clamp(evening);
  const far = -scroll * 0.06;
  const mid = -scroll * 0.42;
  const tr = -scroll * 0.72;
  const near = -scroll;
  const fg = -scroll * 1.25;
  // какие дома/деревья видны (по сдвигу)
  const range = (off: number, step: number) => {
    const a = Math.floor((-off - 600) / step);
    const b = Math.ceil((-off + 1700) / step);
    return Array.from({ length: Math.max(0, b - a + 1) }).map((_, k) => a + k);
  };
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" })}>
      {/* дальний план: небо, Ала-Тоо, город */}
      <div style={box({ left: 0, top: 0, transform: `translateX(${far}px)` })}>
        <CityView id="street-far" x0={-400} x1={1600} y0={0} y1={940} base={760} k={1.5} evening={e} />
      </div>
      {/* средние дома и башня бизнес-центра */}
      <Svg x={mid}>
        {range(mid, 560).map((i) => {
          const x = i * 560;
          if (Math.abs(x + 230 - bcX) < 520) return null;
          return <House key={i} x={x} i={Math.abs(i) + 3} evening={e} />;
        })}
        <BCTower x={bcX} />
      </Svg>
      <div
        style={box({
          left: bcX + 20 + mid,
          top: STREET.mid - 800 + 24,
          width: 380,
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 50,
          color: "#FFFFFF",
          letterSpacing: -0.5,
          whiteSpace: "nowrap",
        })}
      >
        {M13_TEXT.office.building}
      </div>
      {/* деревья бульвара */}
      <Svg x={tr}>
        <rect x={-tr - 200} y={STREET.mid - 10} width={1600} height={STREET.trees - STREET.mid + 20} fill={mix("#B9C99E", "#C9B88E", e * 0.4)} />
        {range(tr, 330).map((i) => (
          <YardTree key={i} x={i * 330 + 90 * hash01(i * 1.3)} y={STREET.trees} k={0.86 + 0.2 * hash01(i * 2.9)} seed={Math.abs(i) * 3 + 1} tall={hash01(i * 7.7) > 0.6} />
        ))}
      </Svg>
      {/* тротуар, ограда, фонари; дорога */}
      <Svg x={near}>
        <rect x={-near - 200} y={STREET.walk} width={1600} height={STREET.curb - STREET.walk} fill={C.sidewalk} />
        {range(near, 120).map((i) => (
          <line key={`t${i}`} x1={i * 120} y1={STREET.walk} x2={i * 120 - 30} y2={STREET.curb} stroke="#C4BEB3" strokeWidth={3} />
        ))}
        <rect x={-near - 200} y={STREET.curb} width={1600} height={20} fill="#B8B2A7" stroke="#8E887E" strokeWidth={2} />
        <rect x={-near - 200} y={STREET.curb + 20} width={1600} height={420} fill={C.asphalt} />
        <rect x={-near - 200} y={STREET.curb + 20} width={1600} height={26} fill="#7E8693" opacity={0.6} />
        {range(near, 260).map((i) => (
          <rect key={`d${i}`} x={i * 260} y={STREET.road + 110} width={150} height={14} rx={6} fill="#F4F2EC" opacity={0.85} />
        ))}
        {range(near, 700).map((i) => {
          const x = i * 700 + 200;
          return (
            <g key={`l${i}`}>
              <rect x={x - 6} y={STREET.walk - 520} width={12} height={520} fill="#5C6470" stroke={LINE} strokeWidth={2} />
              <path d={`M ${x} ${STREET.walk - 516} q 0 -26 40 -26 l 30 0`} stroke="#5C6470" strokeWidth={10} fill="none" />
              <rect x={x + 56} y={STREET.walk - 552} width={46} height={18} rx={8} fill="#E9EEF3" stroke={LINE} strokeWidth={2} />
            </g>
          );
        })}
        {/* низкая ограда тротуара */}
        <rect x={-near - 200} y={STREET.walk - 64} width={1600} height={8} fill="#6C7480" />
        {range(near, 90).map((i) => (
          <rect key={`f${i}`} x={i * 90} y={STREET.walk - 64} width={8} height={64} fill="#6C7480" />
        ))}
      </Svg>
      {car}
      {/* передний план: газон и кусты (размыты) */}
      <Svg x={fg} blur={5}>
        <rect x={-fg - 300} y={STREET.road + 150} width={1800} height={700} fill={mix(C.tree, "#C9B88E", 0.15)} />
        {range(fg, 420).map((i) => (
          <g key={`b${i}`}>
            {[0, 1, 2].map((j) => (
              <circle key={j} cx={i * 420 + j * 80} cy={STREET.road + 210 - (j % 2) * 50} r={110} fill={j % 2 ? C.treeDeep : C.tree} />
            ))}
          </g>
        ))}
      </Svg>
    </div>
  );
};

// ---------- Вид сверху: поворот во двор ----------
// Машина сверху (нос вправо при angle = 0), x, y — центр, L — длина.
export const CarTop: React.FC<{ readonly x: number; readonly y: number; readonly L: number; readonly angle: number }> = ({ x, y, L, angle }) => {
  const W = L * 0.42;
  const P = FAMILY_CAR;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-L / 2 + 6} y={-W / 2 + 10} width={L} height={W} rx={W * 0.34} fill="rgba(20,25,40,0.25)" />
      <rect x={-L / 2} y={-W / 2} width={L} height={W} rx={W * 0.32} fill={P.body} stroke={P.line} strokeWidth={4} />
      {/* лобовое и заднее стекло, крыша */}
      <path d={`M ${L * 0.16} ${-W * 0.4} Q ${L * 0.3} 0 ${L * 0.16} ${W * 0.4} L ${L * 0.02} ${W * 0.36} L ${L * 0.02} ${-W * 0.36} Z`} fill="#2B3646" />
      <path d={`M ${-L * 0.22} ${-W * 0.38} Q ${-L * 0.32} 0 ${-L * 0.22} ${W * 0.38} L ${-L * 0.12} ${W * 0.36} L ${-L * 0.12} ${-W * 0.36} Z`} fill="#2B3646" />
      <rect x={-L * 0.12} y={-W * 0.36} width={L * 0.14} height={W * 0.72} rx={8} fill={mix(P.body, "#FFFFFF", 0.12)} />
      <rect x={L * 0.42} y={-W * 0.42} width={L * 0.05} height={W * 0.16} rx={4} fill="#FFF3C8" />
      <rect x={L * 0.42} y={W * 0.26} width={L * 0.05} height={W * 0.16} rx={4} fill="#FFF3C8" />
      <rect x={-L * 0.49} y={-W * 0.42} width={L * 0.04} height={W * 0.14} rx={4} fill="#D6564B" />
      <rect x={-L * 0.49} y={W * 0.28} width={L * 0.04} height={W * 0.14} rx={4} fill="#D6564B" />
    </g>
  );
};

// Траектория сверху: по улице вправо, затем дуга в ворота (вниз — во двор).
export const YARD_TOP = { roadY: 560, gateX: 700, gateY: 860, yardY: 1180 } as const;
export const yardTurnAt = (u: number) => {
  // u 0…1: 0…0.55 — по улице, 0.55…1 — поворот и въезд
  const G = YARD_TOP;
  const R = 300;
  if (u < 0.55) {
    const t = u / 0.55;
    return { x: lerp(-300, G.gateX - R, t), y: G.roadY, angle: 0 };
  }
  const t = easeInOut((u - 0.55) / 0.45);
  const a = Math.min(1, t * 1.25) * (Math.PI / 2);
  const cx = G.gateX - R;
  const cy = G.roadY + R;
  const arcX = cx + R * Math.sin(a);
  const arcY = cy - R * Math.cos(a);
  const tail = Math.max(0, t * 1.25 - 1) / 0.25;
  return { x: arcX, y: arcY + tail * (G.yardY - (G.roadY + R)), angle: (a * 180) / Math.PI };
};

export const YardTurnTop: React.FC<{ readonly u: number; readonly gate?: number }> = ({ u, gate = 1 }) => {
  const G = YARD_TOP;
  const p = yardTurnAt(clamp(u));
  const gx = G.gateX;
  const g = clamp(gate);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", backgroundColor: "#CFD8C4" })}>
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        {/* квартал над улицей: газон и деревья */}
        <rect x={0} y={0} width={1080} height={G.roadY - 200} fill="#C3D3B4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={`tt${i}`} cx={80 + i * 190} cy={G.roadY - 280} r={78} fill={i % 2 ? C.treeDeep : C.tree} stroke={ink(C.tree, 0.7)} strokeWidth={3} />
        ))}
        <rect x={0} y={G.roadY - 200} width={1080} height={60} fill={C.sidewalk} />
        {/* улица */}
        <rect x={0} y={G.roadY - 140} width={1080} height={300} fill={C.asphalt} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={`m${i}`} x={i * 160} y={G.roadY - 2} width={90} height={10} rx={4} fill="#F4F2EC" opacity={0.8} />
        ))}
        <rect x={0} y={G.roadY + 160} width={1080} height={50} fill={C.sidewalk} />
        {/* двор школы: ограда с воротами, дорожка, деревья, газон */}
        <rect x={0} y={G.roadY + 210} width={1080} height={1920} fill="#C9D9B8" />
        <rect x={gx - 130} y={G.roadY + 160} width={260} height={1200} fill={C.sidewalk} />
        <rect x={0} y={G.gateY - 6} width={gx - 150} height={12} fill="#5C6470" />
        <rect x={gx + 150} y={G.gateY - 6} width={1080} height={12} fill="#5C6470" />
        {/* створки ворот (открыты внутрь двора) */}
        {[-1, 1].map((sd) => (
          <rect key={sd} x={gx + sd * 150 - (sd < 0 ? 0 : 12)} y={G.gateY} width={12} height={150 * g} fill="#5C6470" transform={`rotate(${sd * 8 * (1 - g)} ${gx + sd * 150} ${G.gateY})`} />
        ))}
        {[
          [160, 1260],
          [330, 1520],
          [920, 1250],
          [860, 1560],
          [140, 1700],
          [980, 1780],
        ].map(([x, y], i) => (
          <circle key={`yt${i}`} cx={x} cy={y} r={92} fill={i % 2 ? C.treeDeep : C.tree} stroke={ink(C.tree, 0.7)} strokeWidth={3} />
        ))}
        <CarTop x={p.x} y={p.y} L={330} angle={p.angle} />
      </svg>
    </div>
  );
};
