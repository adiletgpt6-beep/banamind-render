// Улица для сцен с машиной (S10): небо, горы Ала-Тоо, дома и тополя на
// дальней стороне, дорога, ближний тротуар. Слои сдвигаются с разной
// скоростью (shift — пройденный машиной путь, px мира): горы почти стоят,
// дома и деревья плывут, разметка и плитка — быстрее всего.
import { C } from "../theme";
import { roughEllipse, Svg } from "../kit";

export const STREET = {
  horizon: 720,
  farWalk: 1000,
  roadTop: 1030,
  lane: 1132,
  curb: 1252,
  walkTop: 1262,
} as const;

const wrap = (x: number, period: number) => ((x % period) + period) % period;

const Mountains: React.FC<{ readonly shift: number; readonly ink: number }> = ({ shift, ink }) => {
  const P = 1500;
  const o = wrap(shift * 0.06, P);
  const ridge = (x0: number) => {
    const pts: [number, number][] = [
      [x0 - 100, STREET.horizon],
      [x0 + 80, 600],
      [x0 + 230, 530],
      [x0 + 360, 610],
      [x0 + 520, 470],
      [x0 + 700, 580],
      [x0 + 860, 520],
      [x0 + 1030, 620],
      [x0 + 1200, 500],
      [x0 + 1400, 640],
      [x0 + 1600, STREET.horizon],
    ];
    return `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`;
  };
  const snow = (x0: number) =>
    [
      [230, 530],
      [520, 470],
      [860, 520],
      [1200, 500],
    ].map(([px, py]) => `M ${x0 + px - 46} ${py + 34} L ${x0 + px} ${py} L ${x0 + px + 50} ${py + 38} L ${x0 + px + 20} ${py + 30} L ${x0 + px} ${py + 44} L ${x0 + px - 18} ${py + 30} Z`);
  return (
    <g>
      {[-P, 0, P].map((k) => {
        const x0 = -300 + k + o;
        return (
          <g key={k}>
            <path d={ridge(x0)} fill={C.mountain} stroke={C.ink} strokeWidth={ink * 0.5} strokeLinejoin="round" />
            {snow(x0).map((d, i) => (
              <path key={i} d={d} fill="#FBFDFE" stroke={C.ink} strokeWidth={ink * 0.4} strokeLinejoin="round" />
            ))}
          </g>
        );
      })}
    </g>
  );
};

const FarSide: React.FC<{ readonly shift: number; readonly ink: number }> = ({ shift, ink }) => {
  const P = 1200;
  const o = wrap(shift * 0.45, P);
  const items = (x0: number) => (
    <g key={x0}>
      {/* невысокие дома */}
      {[
        [40, 300, 230, "#EAD7B8"],
        [560, 260, 190, "#E5DCCB"],
        [880, 240, 250, "#EBD3BE"],
      ].map(([x, w, h, col]) => (
        <g key={x as number}>
          <rect x={x0 + (x as number)} y={STREET.farWalk - (h as number)} width={w as number} height={h as number} fill={col as string} stroke={C.ink} strokeWidth={ink * 0.6} />
          {Array.from({ length: Math.floor((w as number) / 60) }, (_, i) =>
            Array.from({ length: Math.floor((h as number) / 70) }, (_, j) => (
              <rect key={`${i}-${j}`} x={x0 + (x as number) + 18 + i * 60} y={STREET.farWalk - (h as number) + 20 + j * 70} width={30} height={36} fill={C.glass} stroke={C.ink} strokeWidth={ink * 0.35} />
            )),
          )}
        </g>
      ))}
      {/* тополя и круглые деревья */}
      {[380, 470, 760, 1140].map((x, i) => (
        <g key={x}>
          <rect x={x0 + x - 6} y={STREET.farWalk - 60} width={12} height={60} fill={C.woodDark} stroke={C.ink} strokeWidth={ink * 0.4} />
          {i % 2 === 0 ? (
            <path d={roughEllipse(x0 + x, STREET.farWalk - 190, 34, 140, 500 + i, 3)} fill={C.tree} stroke={C.ink} strokeWidth={ink * 0.6} />
          ) : (
            <path d={roughEllipse(x0 + x, STREET.farWalk - 120, 76, 70, 520 + i, 3)} fill={C.treeDark} stroke={C.ink} strokeWidth={ink * 0.6} />
          )}
        </g>
      ))}
    </g>
  );
  return <g>{[-P, 0, P].map((k) => items(-200 + k + o))}</g>;
};

export const StreetBack: React.FC<{ readonly ink: number; readonly uid: string; readonly shift?: number }> = ({ ink, uid, shift = 0 }) => {
  const lane = wrap(shift, 240);
  const tiles = wrap(shift, 180);
  return (
    <Svg>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9DFEA" />
          <stop offset="1" stopColor="#EEF4F1" />
        </linearGradient>
      </defs>
      <rect x={-800} y={-600} width={2700} height={STREET.horizon + 620} fill={`url(#${uid}-sky)`} />
      <Mountains shift={shift} ink={ink} />
      <rect x={-800} y={STREET.horizon} width={2700} height={STREET.farWalk - STREET.horizon} fill="#E4EADF" />
      <FarSide shift={shift} ink={ink} />
      {/* дальний тротуар, дорога, разметка */}
      <rect x={-800} y={STREET.farWalk} width={2700} height={STREET.roadTop - STREET.farWalk} fill="#DDD6C6" stroke={C.ink} strokeWidth={ink * 0.5} />
      <rect x={-800} y={STREET.roadTop} width={2700} height={STREET.curb - STREET.roadTop} fill={C.road} />
      {Array.from({ length: 14 }, (_, i) => -800 + i * 240 + lane).map((x) => (
        <rect key={x} x={x} y={STREET.lane - 5} width={120} height={10} rx={4} fill="#F4F1EA" />
      ))}
      {/* бордюр и ближний тротуар */}
      <rect x={-800} y={STREET.curb} width={2700} height={STREET.walkTop - STREET.curb} fill="#BDB6A8" stroke={C.ink} strokeWidth={ink * 0.6} />
      <rect x={-800} y={STREET.walkTop} width={2700} height={1200} fill="#E6DFCF" />
      {Array.from({ length: 20 }, (_, i) => -800 + i * 180 + tiles).map((x) => (
        <path key={x} d={`M ${x} ${STREET.walkTop} L ${x - 140} ${STREET.walkTop + 700}`} stroke="#D3CAB6" strokeWidth={ink * 0.6} />
      ))}
      {[1360, 1560, 1820].map((y) => (
        <path key={y} d={`M -800 ${y} L 1900 ${y}`} stroke="#D3CAB6" strokeWidth={ink * 0.6} />
      ))}
    </Svg>
  );
};
