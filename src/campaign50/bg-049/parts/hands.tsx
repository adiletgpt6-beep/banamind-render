// Руки мамы крупным планом (контур + мягкая заливка): пишет ручкой, ведёт
// мышь, держит телефон и сама нажимает «отправить». Рукав всегда тянется
// к плечу/за край кадра, поэтому рука не «висит» в воздухе.
import { C, STROKE } from "../palette";

const st = {
  stroke: C.navy,
  strokeWidth: STROKE,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const Sleeve: React.FC<{ readonly d: string; readonly w?: number }> = ({
  d,
  w = 78,
}) => (
  <>
    <path
      d={d}
      fill="none"
      stroke={C.navy}
      strokeWidth={w + 9}
      strokeLinecap="round"
    />
    <path
      d={d}
      fill="none"
      stroke={C.cardigan}
      strokeWidth={w}
      strokeLinecap="round"
    />
  </>
);

// Пишущая рука: кончик ручки в (x, y); рукав к точке (sx, sy).
export const WritingHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly sx: number;
  readonly sy: number;
  readonly press?: number;
}> = ({ x, y, sx, sy, press = 0 }) => {
  const wx = x + 96;
  const wy = y - 62;
  return (
    <g>
      <Sleeve
        d={`M ${sx} ${sy} Q ${(sx + wx) / 2 + 40} ${(sy + wy) / 2 + 30} ${wx + 18} ${wy - 6}`}
      />
      <ellipse
        cx={wx + 8}
        cy={wy - 2}
        rx={30}
        ry={40}
        transform={`rotate(-58 ${wx + 8} ${wy - 2})`}
        fill="#FFFFFF"
        {...st}
      />
      <g transform={`translate(${x} ${y + press})`}>
        {/* ручка */}
        <path
          d="M 2 -3 L 12 -17"
          stroke="#8A93A8"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <path
          d="M 12 -17 L 80 -112"
          stroke={C.navy}
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d="M 66 -92 L 84 -118"
          stroke={C.yellow}
          strokeWidth={18}
          strokeLinecap="round"
        />
        {/* кисть */}
        <ellipse
          cx={62}
          cy={-50}
          rx={48}
          ry={36}
          transform="rotate(-30 62 -50)"
          fill={C.skin}
          {...st}
        />
        <ellipse
          cx={30}
          cy={-30}
          rx={24}
          ry={15}
          transform="rotate(-50 30 -30)"
          fill={C.skin}
          {...st}
        />
        <path
          d="M 54 -66 Q 40 -60 34 -46"
          fill="none"
          stroke={C.skinShade}
          strokeWidth={3}
        />
        <path
          d="M 40 -78 L 26 -52"
          stroke={C.navy}
          strokeWidth={22}
          strokeLinecap="round"
        />
        <path
          d="M 40 -78 L 26 -52"
          stroke={C.skin}
          strokeWidth={14}
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

// Рука на мыши (вид сверху): коврик, мышь видна целиком, ладонь на её
// корпусе, указательный и средний пальцы на кнопках, большой — сбоку.
// Рукав уходит за нижний правый край кадра.
export const MouseHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly click?: number;
  readonly s?: number;
}> = ({ x, y, click = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
    <rect
      x={x - 150}
      y={y - 150}
      width={300}
      height={290}
      rx={40}
      fill="#E4ECF6"
      stroke={C.soft}
      strokeWidth={3}
      transform={`rotate(-6 ${x} ${y})`}
    />
    <g transform={`translate(${x} ${y}) rotate(-8)`}>
      <Sleeve d="M 40 130 Q 100 230 170 360" w={96} />
      <ellipse
        cx={30}
        cy={118}
        rx={44}
        ry={30}
        transform="rotate(40 30 118)"
        fill="#FFFFFF"
        {...st}
      />
      <rect
        x={-58}
        y={-96}
        width={116}
        height={176}
        rx={58}
        fill="#FFFFFF"
        {...st}
      />
      <path
        d="M 0 -96 L 0 -30 M -58 -30 Q 0 -18 58 -30"
        fill="none"
        stroke={C.navy}
        strokeWidth={3}
      />
      <rect
        x={-7}
        y={-74}
        width={14}
        height={26}
        rx={7}
        fill={C.yellowSoft}
        stroke={C.navy}
        strokeWidth={2.5}
      />
      {/* ладонь на корпусе мыши */}
      <path
        d="M -50 28 C -54 -6 -30 -26 0 -26 C 34 -26 56 -4 52 30 C 48 66 22 92 -2 92 C -28 92 -48 64 -50 28 Z"
        fill={C.skin}
        {...st}
      />
      {/* пальцы на кнопках */}
      {[-24, 4].map((fx, i) => (
        <g key={fx} transform={`translate(0 ${i === 0 ? click * 4 : 0})`}>
          <path
            d={`M ${fx} -14 L ${fx} -50`}
            stroke={C.navy}
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d={`M ${fx} -14 L ${fx} -50`}
            stroke={C.skin}
            strokeWidth={18}
            strokeLinecap="round"
          />
        </g>
      ))}
      <path
        d="M 30 -10 L 38 -46"
        stroke={C.navy}
        strokeWidth={24}
        strokeLinecap="round"
      />
      <path
        d="M 30 -10 L 38 -46"
        stroke={C.skin}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <path
        d="M -46 40 L -68 6"
        stroke={C.navy}
        strokeWidth={26}
        strokeLinecap="round"
      />
      <path
        d="M -46 40 L -68 6"
        stroke={C.skin}
        strokeWidth={18}
        strokeLinecap="round"
      />
    </g>
  </g>
);

// Рука держит телефон справа снизу: ладонь у нижнего правого угла (пальцы
// выходят слева — PhoneFingers), большой палец (сужается к кончику, с
// ногтем) тянется к кнопке (tx, ty) и нажимает её.
export const PhoneHand: React.FC<{
  readonly right: number;
  readonly bottom: number;
  readonly tx: number;
  readonly ty: number;
  readonly press?: number;
}> = ({ right, bottom, tx, ty, press = 0 }) => {
  const B: [number, number] = [right + 18, bottom - 44];
  const T: [number, number] = [tx, ty + press * 4];
  const len = Math.hypot(T[0] - B[0], T[1] - B[1]) || 1;
  const d: [number, number] = [(T[0] - B[0]) / len, (T[1] - B[1]) / len];
  const n: [number, number] = [-d[1], d[0]];
  const p = (o: [number, number], k: number, m = 0): string =>
    `${(o[0] + n[0] * k + d[0] * m).toFixed(1)} ${(o[1] + n[1] * k + d[1] * m).toFixed(1)}`;
  const thumb = `M ${p(B, 32)} L ${p(T, 19)} C ${p(T, 19, 26)} ${p(T, -19, 26)} ${p(T, -19)} L ${p(B, -32)} Z`;
  return (
    <g>
      <Sleeve
        d={`M ${right + 92} ${bottom + 60} Q ${right + 160} ${bottom + 220} ${right + 230} ${bottom + 440}`}
        w={112}
      />
      <ellipse
        cx={right + 84}
        cy={bottom + 44}
        rx={56}
        ry={40}
        transform={`rotate(58 ${right + 84} ${bottom + 44})`}
        fill="#FFFFFF"
        {...st}
      />
      {/* большой палец: основание спрятано под ладонью (без «шва») */}
      <path d={thumb} fill={C.skin} {...st} />
      {/* ладонь у нижнего правого угла */}
      <ellipse
        cx={right + 46}
        cy={bottom - 20}
        rx={66}
        ry={98}
        transform={`rotate(-18 ${right + 46} ${bottom - 20})`}
        fill={C.skin}
        {...st}
      />
      <path
        d={`M ${right + 10} ${bottom - 96} Q ${right + 40} ${bottom - 70} ${right + 52} ${bottom - 30}`}
        fill="none"
        stroke={C.skinShade}
        strokeWidth={3.5}
      />
      <ellipse
        cx={T[0] + d[0] * 10}
        cy={T[1] + d[1] * 10}
        rx={11}
        ry={8}
        transform={`rotate(${(Math.atan2(d[1], d[0]) * 180) / Math.PI} ${T[0] + d[0] * 10} ${T[1] + d[1] * 10})`}
        fill="#F7DCCB"
        stroke={C.skinShade}
        strokeWidth={2.5}
      />
    </g>
  );
};

// Пальцы правой руки обхватывают телефон сзади и выходят с ЛЕВОГО края:
// рисуются ПОД корпусом, видны только закруглённые кончики.
export const PhoneFingers: React.FC<{
  readonly left: number;
  readonly bottom: number;
}> = ({ left, bottom }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={left - 26}
        y={bottom - 330 + i * 50}
        width={66}
        height={46}
        rx={23}
        fill={C.skin}
        {...st}
      />
    ))}
  </g>
);
