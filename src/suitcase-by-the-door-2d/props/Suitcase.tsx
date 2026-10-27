// Чемодан мамы — один и тот же во всех сценах: серо-синий жёсткий корпус
// с продольными рёбрами, два колеса на одном торце, телескопическая ручка
// на другом, боковая ручка для переноски, молния по периметру.
//
//  • SuitcaseTop — вид сверху (предметные планы S01, S08, S12): чемодан
//    лежит горизонтально на столе, крышка стоит вертикально у дальнего
//    края (сверху виден её торец). Крышка поворачивается вокруг шарнира
//    (lid: 0 — стоит, 1 — закрыта): проекция на основание = h·sin(угол),
//    видна внешняя сторона с рёбрами. Крышка не растворяется.
//  • SuitcaseFront — вид спереди чуть сверху (средние планы): раскрытый
//    (крышка стоит у дальнего края), закрытый лёжа или стоящий на колёсах
//    (upright).
import { C } from "../theme";
import { roughRect } from "../kit";
import { clamp, lerp } from "../rig/motion";

type Common = { readonly ink: number; readonly seed?: number };

// Вещи внутри основания (вид сверху): сложенный свитер и рубашка.
const Clothes: React.FC<{ x: number; y: number; w: number; h: number; ink: number }> = ({ x, y, w, h, ink }) => (
  <g>
    <rect x={x + w * 0.04} y={y + h * 0.1} width={w * 0.44} height={h * 0.8} rx={10} fill="#C98B6B" stroke={C.ink} strokeWidth={ink * 0.7} />
    <path d={`M ${x + w * 0.04} ${y + h * 0.45} L ${x + w * 0.48} ${y + h * 0.45}`} stroke={C.ink} strokeWidth={ink * 0.5} opacity={0.5} />
    <rect x={x + w * 0.52} y={y + h * 0.14} width={w * 0.44} height={h * 0.74} rx={10} fill="#E7E2D6" stroke={C.ink} strokeWidth={ink * 0.7} />
    <path d={`M ${x + w * 0.74} ${y + h * 0.14} L ${x + w * 0.7} ${y + h * 0.3} L ${x + w * 0.78} ${y + h * 0.3} Z`} fill="#CFC8B8" stroke={C.ink} strokeWidth={ink * 0.5} />
  </g>
);

// Молния: пунктир вдоль края.
const Zip: React.FC<{ d: string; ink: number }> = ({ d, ink }) => (
  <path d={d} fill="none" stroke={C.suitcaseShade} strokeWidth={ink * 1.4} strokeDasharray={`${ink * 1.2} ${ink * 1.1}`} opacity={0.9} />
);

export const SuitcaseTop: React.FC<
  Common & {
    readonly x: number; // левый край
    readonly hinge: number; // y шарнира (дальний край основания)
    readonly w: number;
    readonly h: number; // глубина основания (вид сверху)
    readonly lid: number; // 0 — крышка стоит вертикально (раскрыт), 1 — закрыта
    readonly clothes?: boolean;
    readonly children?: React.ReactNode; // предметы в основании (рисуются над вещами)
    readonly zipT?: number; // 0…1 молния закрыта (только при lid = 1)
  }
> = ({ x, hinge, w, h, lid, ink, seed = 7, clothes = true, children, zipT = 0 }) => {
  const r = 26;
  const baseY = hinge;
  const phi = clamp(lid) * (Math.PI / 2); // 0 — вертикально, π/2 — закрыта
  const T = 30; // толщина крышки (видна сверху, пока она стоит)
  const cover = h * Math.sin(phi); // проекция крышки на основание
  const edge = T * Math.cos(phi); // торец крышки над шарниром
  const pad = 16;
  return (
    <g>
      {/* тень на столе */}
      <rect x={x + 12} y={baseY + 12} width={w} height={h} rx={r} fill={C.shadow} />
      {/* колёса на левом торце, телескопическая ручка на правом */}
      {[0.22, 0.78].map((k) => (
        <rect key={k} x={x - 22} y={baseY + h * k - 16} width={30} height={32} rx={10} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.8} />
      ))}
      <rect x={x + w - 8} y={baseY + h * 0.3} width={22} height={h * 0.4} rx={8} fill={C.suitcaseShade} stroke={C.ink} strokeWidth={ink * 0.8} />
      {/* боковая ручка у ближнего края */}
      <path d={`M ${x + w * 0.38} ${baseY + h - 4} Q ${x + w * 0.5} ${baseY + h + 34} ${x + w * 0.62} ${baseY + h - 4}`} fill="none" stroke="#2E3446" strokeWidth={ink * 4} strokeLinecap="round" />
      {/* основание: корпус и подкладка */}
      <path d={roughRect(x, baseY, w, h, r, seed, ink * 0.6)} fill={C.suitcase} stroke={C.ink} strokeWidth={ink} />
      <rect x={x + pad} y={baseY + pad} width={w - pad * 2} height={h - pad * 2} rx={r * 0.6} fill={C.suitcaseInside} stroke={C.ink} strokeWidth={ink * 0.7} />
      <Zip d={`M ${x + 8} ${baseY + r} L ${x + 8} ${baseY + h - r} Q ${x + 8} ${baseY + h - 8} ${x + r} ${baseY + h - 8} L ${x + w - r} ${baseY + h - 8} Q ${x + w - 8} ${baseY + h - 8} ${x + w - 8} ${baseY + h - r} L ${x + w - 8} ${baseY + r}`} ink={ink} />
      {clothes ? <Clothes x={x + pad + 10} y={baseY + pad + 8} w={w - pad * 2 - 20} h={h - pad * 2 - 16} ink={ink} /> : null}
      {/* ремни-стяжки расстёгнуты, лежат по бокам */}
      <rect x={x + pad + 2} y={baseY + h * 0.45} width={46} height={18} rx={5} fill="#5D6E86" stroke={C.ink} strokeWidth={ink * 0.6} />
      <rect x={x + w - pad - 48} y={baseY + h * 0.45} width={46} height={18} rx={5} fill="#5D6E86" stroke={C.ink} strokeWidth={ink * 0.6} />
      {children}
      {/* крышка: стоит у дальнего края (виден торец), закрываясь — ложится
          на основание внешней стороной вверх */}
      {cover > 1 ? (
        <g>
          <path d={roughRect(x, baseY, w, cover, Math.min(r, cover / 2), seed + 5, ink * 0.6)} fill={C.suitcaseLight} stroke={C.ink} strokeWidth={ink} />
          {cover > 40
            ? [0.25, 0.5, 0.75].map((k) => (
                <path key={k} d={`M ${x + w * k} ${baseY + cover * 0.1} L ${x + w * k} ${baseY + cover * 0.9}`} stroke={C.suitcaseShade} strokeWidth={ink * 1.2} opacity={0.7} />
              ))
            : null}
          {lid >= 0.999 ? (
            <>
              <Zip d={`M ${x + 12} ${baseY + h - 9} L ${x + w - 12} ${baseY + h - 9}`} ink={ink} />
              <rect x={lerp(x + w - 46, x + 22, zipT)} y={baseY + h - 20} width={26} height={22} rx={5} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.7} />
            </>
          ) : null}
        </g>
      ) : null}
      {edge > 0.5 ? (
        <g>
          <path d={roughRect(x, baseY - edge, w, edge + 6, 10, seed + 3, ink * 0.4)} fill={C.suitcase} stroke={C.ink} strokeWidth={ink} />
          <path d={`M ${x + 14} ${baseY - edge * 0.45} L ${x + w - 14} ${baseY - edge * 0.45}`} stroke={C.suitcaseInside} strokeWidth={ink * 1.2} />
        </g>
      ) : null}
    </g>
  );
};

// Вид спереди чуть сверху. Стол/пол задаёт сцена; (x, y) — левый нижний
// угол корпуса на поверхности.
export const SuitcaseFront: React.FC<
  Common & {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly mode: "open" | "closed" | "upright";
    readonly handle?: number; // 0…1 выдвинутая телескопическая ручка (upright)
    readonly children?: React.ReactNode; // содержимое раскрытого основания
  }
> = ({ x, y, w, mode, ink, seed = 11, handle = 0, children }) => {
  if (mode === "upright") {
    const H = w * 1.45;
    const d = w * 0.34; // толщина (видна справа)
    return (
      <g>
        <ellipse cx={x + w / 2 + d * 0.3} cy={y + 2} rx={w * 0.62} ry={12} fill={C.shadow} />
        {/* телескопическая ручка */}
        {handle > 0.01 ? (
          <g>
            <rect x={x + w * 0.3} y={y - H - w * 0.9 * handle} width={10} height={w * 0.9 * handle + 20} fill="#7A8698" stroke={C.ink} strokeWidth={ink * 0.7} />
            <rect x={x + w * 0.7 - 10} y={y - H - w * 0.9 * handle} width={10} height={w * 0.9 * handle + 20} fill="#7A8698" stroke={C.ink} strokeWidth={ink * 0.7} />
            <rect x={x + w * 0.26} y={y - H - w * 0.9 * handle - 18} width={w * 0.48} height={22} rx={10} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.8} />
          </g>
        ) : (
          <rect x={x + w * 0.28} y={y - H - 14} width={w * 0.44} height={18} rx={8} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.8} />
        )}
        {/* боковая грань */}
        <path d={`M ${x + w} ${y - H + 18} L ${x + w + d} ${y - H + 4} L ${x + w + d} ${y - 18} L ${x + w} ${y - 6} Z`} fill={C.suitcaseShade} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
        {/* лицевая сторона с рёбрами */}
        <path d={roughRect(x, y - H, w, H - 8, 22, seed, ink * 0.6)} fill={C.suitcase} stroke={C.ink} strokeWidth={ink} />
        {[0.28, 0.5, 0.72].map((k) => (
          <path key={k} d={`M ${x + w * k} ${y - H + 24} L ${x + w * k} ${y - 30}`} stroke={C.suitcaseShade} strokeWidth={ink * 1.3} opacity={0.75} />
        ))}
        <rect x={x + 10} y={y - H + 12} width={w * 0.18} height={H * 0.7} rx={8} fill="#FFFFFF" opacity={0.12} />
        {/* колёса */}
        {[0.16, 0.84].map((k) => (
          <g key={k}>
            <rect x={x + w * k - 12} y={y - 14} width={24} height={14} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.6} />
            <circle cx={x + w * k} cy={y + 2} r={12} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.8} />
          </g>
        ))}
      </g>
    );
  }
  const T = w * 0.24; // толщина половины
  const depth = w * 0.16; // видимая глубина верхней плоскости
  if (mode === "closed") {
    return (
      <g>
        <ellipse cx={x + w / 2} cy={y + 4} rx={w * 0.56} ry={10} fill={C.shadow} />
        <path d={`M ${x + 10} ${y - T * 1.6} L ${x + 40} ${y - T * 1.6 - depth} L ${x + w + 10} ${y - T * 1.6 - depth} L ${x + w - 20} ${y - T * 1.6} Z`} fill={C.suitcaseLight} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
        <path d={roughRect(x, y - T * 1.6, w, T * 1.6, 14, seed, ink * 0.6)} fill={C.suitcase} stroke={C.ink} strokeWidth={ink} />
        <path d={`M ${x + 8} ${y - T * 0.8} L ${x + w - 8} ${y - T * 0.8}`} stroke={C.suitcaseShade} strokeWidth={ink * 1.3} strokeDasharray={`${ink * 1.2} ${ink}`} />
        <path d={`M ${x + w * 0.4} ${y - T * 1.6 - depth * 0.5} Q ${x + w * 0.52} ${y - T * 1.6 - depth * 0.5 - 22} ${x + w * 0.64} ${y - T * 1.6 - depth * 0.5}`} fill="none" stroke="#2E3446" strokeWidth={ink * 3.4} strokeLinecap="round" />
        {[0.12, 0.88].map((k) => (
          <circle key={k} cx={x + w * k} cy={y - 2} r={9} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.7} />
        ))}
      </g>
    );
  }
  // раскрыт: основание лежит, крышка стоит у дальнего края (чуть
  // откинута назад) и показывает подкладку с сетчатым карманом
  const lidH = w * 0.62;
  const topY = y - T - depth; // дальний край основания (шарнир)
  return (
    <g>
      <ellipse cx={x + w / 2} cy={y + 4} rx={w * 0.56} ry={10} fill={C.shadow} />
      {/* крышка: корпус, подкладка, молния по краю и X-стяжки с пряжкой */}
      <path d={`M ${x + 26} ${topY + 2} Q ${x + 30} ${topY - lidH - 6} ${x + 70} ${topY - lidH} L ${x + w - 24} ${topY - lidH} Q ${x + w + 8} ${topY - lidH - 4} ${x + w + 6} ${topY - lidH + 30} L ${x + w - 12} ${topY + 2} Z`} fill={C.suitcase} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${x + 46} ${topY - 6} L ${x + 54} ${topY - lidH + 18} L ${x + w - 12} ${topY - lidH + 18} L ${x + w - 26} ${topY - 6} Z`} fill={C.suitcaseInside} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={`M ${x + 40} ${topY - 2} L ${x + 47} ${topY - lidH + 10} L ${x + w - 6} ${topY - lidH + 10}`} fill="none" stroke={C.suitcaseShade} strokeWidth={ink * 1.2} strokeDasharray={`${ink * 1.1} ${ink}`} />
      <path d={`M ${x + 60} ${topY - lidH + 26} L ${x + w - 34} ${topY - 14} M ${x + w - 22} ${topY - lidH + 26} L ${x + 58} ${topY - 14}`} stroke="#5D6E86" strokeWidth={ink * 3.4} strokeLinecap="round" />
      <rect x={x + w / 2 - 16} y={topY - lidH / 2 - 14} width={32} height={26} rx={6} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.7} />
      {/* основание: подкладка с вещами (вид сверху под углом) */}
      <path d={`M ${x} ${y - T} L ${x + 30} ${topY} L ${x + w - 14} ${topY} L ${x + w} ${y - T} Z`} fill={C.suitcase} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${x + 16} ${y - T - 4} L ${x + 38} ${topY + 6} L ${x + w - 22} ${topY + 6} L ${x + w - 14} ${y - T - 4} Z`} fill={C.suitcaseInside} stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={`M ${x + 34} ${y - T - 8} L ${x + 46} ${topY + 10} L ${x + w * 0.48} ${topY + 10} L ${x + w * 0.46} ${y - T - 8} Z`} fill="#C98B6B" stroke={C.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
      <path d={`M ${x + w * 0.52} ${y - T - 8} L ${x + w * 0.53} ${topY + 10} L ${x + w - 30} ${topY + 10} L ${x + w - 26} ${y - T - 8} Z`} fill="#E7E2D6" stroke={C.ink} strokeWidth={ink * 0.7} strokeLinejoin="round" />
      {/* вещи чуть выше края */}
      <path d={`M ${x + 40} ${y - T - 6} Q ${x + w * 0.25} ${y - T - 26} ${x + w * 0.46} ${y - T - 8}`} fill="#C98B6B" stroke={C.ink} strokeWidth={ink * 0.7} />
      {children}
      {/* передняя стенка основания и рукав свитера, свисающий через край */}
      <path d={roughRect(x, y - T, w, T, 10, seed, ink * 0.6)} fill={C.suitcaseLight} stroke={C.ink} strokeWidth={ink} />
      <path d={`M ${x + 10} ${y - T + 9} L ${x + w - 10} ${y - T + 9}`} stroke={C.suitcaseShade} strokeWidth={ink * 1.1} strokeDasharray={`${ink * 1.2} ${ink}`} />
      <path d={`M ${x + w * 0.2} ${y - T - 4} q 6 ${T * 0.6} -2 ${T * 0.9} q -4 10 10 10 q 12 -4 12 -14 q 0 -${T * 0.5} -2 -${T * 0.95} Z`} fill="#C98B6B" stroke={C.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d={`M ${x + w * 0.4} ${y - T * 0.45} Q ${x + w * 0.5} ${y - T * 0.45 + 20} ${x + w * 0.6} ${y - T * 0.45}`} fill="none" stroke="#2E3446" strokeWidth={ink * 3.2} strokeLinecap="round" />
      {[-12, w - 12].map((dx) => (
        <rect key={dx} x={x + dx} y={y - T * 0.8} width={24} height={T * 0.55} rx={8} fill="#2E3446" stroke={C.ink} strokeWidth={ink * 0.7} />
      ))}
    </g>
  );
};
