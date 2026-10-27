// Жёлтая игрушечная машинка — одна и та же в обоих опытах и в классе:
// одинаковые размер, цвет и форма. Вид сбоку, нос вправо. (0, 0) — точка
// касания дороги под серединой машины; длина len. Колёса стоят на дороге:
// tilt — наклон по дорожке (градусы), колёса вращаются по пройденному пути.
import { C } from "../theme";

export const TOYCAR = { len: 100, height: 46 } as const;

export const ToyCar: React.FC<{ readonly x: number; readonly y: number; readonly len: number; readonly tilt?: number; readonly roll?: number }> = ({ x, y, len, tilt = 0, roll = 0 }) => {
  const k = len / 100;
  const r = 11; // радиус колеса (единицы машинки)
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${k})`}>
      {/* кузов */}
      <path d="M -48 -12 Q -50 -26 -40 -27 L -26 -28 Q -18 -44 -2 -45 L 16 -45 Q 28 -44 34 -30 L 44 -28 Q 51 -26 50 -14 L 50 -11 Q 50 -8 46 -8 L -45 -8 Q -48 -8 -48 -12 Z" fill={C.yellow} stroke={C.yellowDeep} strokeWidth={2.4} strokeLinejoin="round" />
      {/* окна */}
      <path d="M -20 -29 Q -14 -40 -3 -40 L 5 -40 L 5 -29 Z" fill="#CFE3F5" />
      <path d="M 10 -40 L 15 -40 Q 25 -39 29 -29 L 10 -29 Z" fill="#CFE3F5" />
      {/* фара и полоска */}
      <rect x={43} y={-24} width={6} height={5} rx={2} fill="#FFF6D2" />
      <rect x={-44} y={-20} width={86} height={3} rx={1.5} fill={C.yellowDeep} opacity={0.6} />
      {/* колёса */}
      {[-29, 29].map((cx) => (
        <g key={cx} transform={`translate(${cx} ${-r}) rotate(${(roll / (r * k)) * (180 / Math.PI)})`}>
          <circle r={r} fill={C.ink} />
          <circle r={4.6} fill="#9AA0AA" />
          <rect x={-1.2} y={-r + 1.5} width={2.4} height={4} fill="#5E636C" />
        </g>
      ))}
    </g>
  );
};
