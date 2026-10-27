// Две машины фильма:
//   • ChildDrawing — рисунок сына (7–8 лет): белая машина обведена синим
//     карандашом, неровные линии, крупные колёса, солнце, трава, дорога;
//   • Polo — аккуратная 2D-иллюстрация белого Volkswagen Polo Sedan 2010
//     (вид сбоку): короткий капот, высокий короткий багажник, чёрная
//     решётка, без «такси»-раскраски и надписей. Образ услуги, не
//     документальная поездка.
import { clamp } from "../rig/motion";

const CRAYON = "#3D6CC4";

// Неровная линия: точки + небольшое детерминированное дрожание.
const wob = (pts: readonly (readonly [number, number])[], amp = 2.2, seed = 1, close = false) => {
  const j = (i: number, k: number) => Math.sin(i * 12.9898 + seed * 78.233 + k * 3.1) * amp;
  const p = pts.map(([x, y], i) => [x + j(i, 1), y + j(i, 2)] as const);
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    d += ` Q ${(x0 + x1) / 2 + j(i, 3)} ${(y0 + y1) / 2 + j(i, 4)} ${x1} ${y1}`;
  }
  return close ? `${d} Z` : d;
};

const circlePts = (cx: number, cy: number, r: number, n = 14, turns = 1.08) =>
  Array.from({ length: Math.round(n * turns) + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - 0.4;
    return [cx + Math.cos(a) * r * (1 + 0.04 * Math.sin(i * 2.3)), cy + Math.sin(a) * r * (1 + 0.04 * Math.cos(i * 1.7))] as const;
  });

// Рисунок сына в системе листа 500×360 (без рамки svg) — для руки и крупных планов.
export const ChildDrawingArt: React.FC<{ readonly back?: boolean; readonly fade?: number }> = ({ back = false, fade = 1 }) => (
  <>
    <rect x={0} y={0} width={500} height={360} rx={6} fill={back ? "#F3F0E8" : "#FFFDF7"} />
    <g opacity={back ? 0.13 : fade} transform={back ? "translate(500 0) scale(-1 1)" : undefined}>
      {/* небо: солнце с лучами, облако */}
      <path d={wob(circlePts(430, 62, 30), 1.5, 3)} fill="#FFD34D" stroke="#F2A93B" strokeWidth={5} strokeLinecap="round" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <path key={i} d={wob([[430 + Math.cos(a) * 42, 62 + Math.sin(a) * 42], [430 + Math.cos(a) * 60, 62 + Math.sin(a) * 60]], 1.2, i + 5)} stroke="#F2A93B" strokeWidth={5} strokeLinecap="round" fill="none" />;
      })}
      <path d={wob([[70, 70], [88, 50], [118, 52], [134, 40], [164, 50], [172, 72], [70, 74]], 2, 9, true)} fill="#EEF4FB" stroke="#9DBBE0" strokeWidth={4} strokeLinejoin="round" />
      {/* трава */}
      <path d={wob([[10, 300], [120, 296], [250, 302], [380, 296], [490, 300]], 2.5, 11)} stroke="#6DB36A" strokeWidth={10} strokeLinecap="round" fill="none" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={wob([[22 + i * 40, 300], [28 + i * 40, 284]], 1.2, 30 + i)} stroke="#6DB36A" strokeWidth={5} strokeLinecap="round" fill="none" />
      ))}
      {/* кузов: белая машина, обводка синим карандашом */}
      <path d={wob([[70, 250], [66, 196], [110, 186], [150, 132], [300, 126], [352, 182], [430, 192], [440, 250], [70, 250]], 2.6, 2, true)} fill="#FFFFFF" stroke={CRAYON} strokeWidth={7} strokeLinejoin="round" />
      <path d={wob([[160, 182], [178, 146], [228, 142], [228, 182]], 2, 4, true)} fill="#BFE0F7" stroke={CRAYON} strokeWidth={5} strokeLinejoin="round" />
      <path d={wob([[244, 182], [244, 142], [290, 142], [330, 182]], 2, 6, true)} fill="#BFE0F7" stroke={CRAYON} strokeWidth={5} strokeLinejoin="round" />
      <path d={wob([[236, 190], [238, 246]], 1.5, 7)} stroke={CRAYON} strokeWidth={4} fill="none" />
      <path d={wob([[256, 204], [276, 204]], 1, 8)} stroke={CRAYON} strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d={wob(circlePts(420, 210, 9, 8), 1, 12)} fill="#FFE27A" stroke="#E0A12E" strokeWidth={4} />
      {/* колёса — крупные */}
      {[132, 362].map((x, i) => (
        <g key={x}>
          <path d={wob(circlePts(x, 252, 36, 14, 1.15), 2, 20 + i)} fill="#2B2F3A" stroke="#1B1E26" strokeWidth={5} />
          <path d={wob(circlePts(x, 252, 13, 8), 1.2, 25 + i)} fill="#C9CFD8" stroke="#8B93A1" strokeWidth={3} />
        </g>
      ))}
      {/* человечек в окне машет рукой */}
      <circle cx={200} cy={162} r={11} fill="#F2C59E" stroke="#C98F62" strokeWidth={3} />
      <path d={wob([[186, 182], [200, 172], [214, 182]], 1, 31)} stroke="#E0A73A" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  </>
);

// Рисунок на листе (вид спереди листа). w — ширина листа, px.
// back — обратная сторона (видна насквозь бледным зеркальным рисунком);
// morph 0…1 — рисунок растворяется (переход к иллюстрации Polo в финале).
export const ChildDrawing: React.FC<{ readonly w: number; readonly back?: boolean; readonly morph?: number }> = ({ w, back = false, morph = 0 }) => (
  <svg width={w} height={w * 0.72} viewBox="0 0 500 360" style={{ display: "block", overflow: "visible" }}>
    <ChildDrawingArt back={back} fade={1 - clamp(morph)} />
  </svg>
);

// Белый Volkswagen Polo Sedan 2010, вид сбоку (капот справа). w — ширина, px.
export const Polo: React.FC<{ readonly w: number; readonly wheel?: number; readonly shadow?: boolean }> = ({ w, wheel = 0, shadow = true }) => {
  const h = w * 0.36;
  const BODY = "#FFFFFF";
  const SHADE = "#E3E8EF";
  const LINE = "#B9C3D0";
  const GLASS = "#2E3B52";
  const TRIM = "#232A36";
  return (
    <svg width={w} height={h} viewBox="0 0 1000 360" style={{ display: "block", overflow: "visible" }}>
      {shadow ? <ellipse cx={510} cy={318} rx={450} ry={20} fill="rgba(20,36,59,0.18)" /> : null}
      {/* кузов: багажник слева, капот справа */}
      <path
        d="M 96 236 Q 92 196 104 178 L 118 160 Q 160 150 262 148 Q 300 116 352 84 Q 380 64 420 58 L 560 56 Q 604 58 640 82 L 706 132 Q 812 142 900 160 Q 944 170 956 196 Q 962 214 960 236 L 958 268 Q 956 280 940 282 L 820 284 A 76 76 0 0 0 672 284 L 330 284 A 76 76 0 0 0 182 284 L 112 282 Q 98 280 97 266 Z"
        fill={BODY}
        stroke={LINE}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      {/* нижняя тень кузова и пороги */}
      <path d="M 104 236 L 956 236 L 958 268 Q 956 280 940 282 L 820 284 A 76 76 0 0 0 672 284 L 330 284 A 76 76 0 0 0 182 284 L 112 282 Q 98 280 97 266 Z" fill={SHADE} />
      <path d="M 330 278 L 672 278 L 670 292 L 332 292 Z" fill={TRIM} opacity={0.85} />
      {/* линия боковины */}
      <path d="M 112 180 Q 500 168 930 182" stroke={LINE} strokeWidth={3} fill="none" />
      {/* стёкла: заднее боковое, задняя дверь, передняя дверь */}
      <path d="M 300 146 Q 330 112 366 92 L 382 92 L 382 146 Z" fill={GLASS} />
      <path d="M 396 146 L 396 84 Q 412 72 436 70 L 520 68 L 520 146 Z" fill={GLASS} />
      <path d="M 534 146 L 534 68 L 562 68 Q 598 72 626 92 L 680 138 L 680 146 Z" fill={GLASS} />
      <path d="M 382 92 L 396 84 L 396 146 L 382 146 Z" fill={TRIM} />
      <path d="M 520 68 L 534 68 L 534 146 L 520 146 Z" fill={TRIM} />
      {/* блики на стёклах */}
      <path d="M 410 140 L 446 76 L 462 76 L 426 140 Z" fill="#FFFFFF" opacity={0.12} />
      <path d="M 560 140 L 590 78 L 604 82 L 576 140 Z" fill="#FFFFFF" opacity={0.12} />
      {/* двери и ручки */}
      <path d="M 384 150 L 384 276" stroke={LINE} strokeWidth={3} />
      <path d="M 527 150 L 527 276" stroke={LINE} strokeWidth={3} />
      <path d="M 692 140 Q 704 210 688 270" stroke={LINE} strokeWidth={3} fill="none" />
      <rect x={430} y={176} width={40} height={10} rx={5} fill={LINE} />
      <rect x={572} y={176} width={40} height={10} rx={5} fill={LINE} />
      {/* зеркало */}
      <path d="M 664 130 Q 676 110 700 112 L 704 132 Q 690 138 664 136 Z" fill={BODY} stroke={LINE} strokeWidth={3} />
      {/* фара, решётка, противотуманка, бампер */}
      <path d="M 880 168 Q 930 172 950 192 L 948 204 Q 908 200 872 186 Z" fill="#D9E6F2" stroke={LINE} strokeWidth={3} />
      <path d="M 920 210 L 958 212 L 958 226 L 922 226 Z" fill={TRIM} />
      <circle cx={942} cy={252} r={8} fill="#D9E6F2" stroke={LINE} strokeWidth={2} />
      {/* задний фонарь и линия крышки багажника */}
      <path d="M 106 176 L 150 168 L 152 196 L 104 202 Z" fill="#D9534F" opacity={0.9} />
      <path d="M 118 160 Q 190 150 262 148" stroke={LINE} strokeWidth={3} fill="none" />
      {/* колёса: шина, диск с пятью спицами */}
      {[256, 746].map((x) => (
        <g key={x} transform={`translate(${x} 284)`}>
          <circle r={66} fill="#1F242E" />
          <circle r={44} fill="#C9D0DA" />
          <g transform={`rotate(${wheel})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <rect key={a} x={-6} y={-42} width={12} height={34} rx={5} fill="#8E98A8" transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r={12} fill="#8E98A8" />
        </g>
      ))}
    </svg>
  );
};
