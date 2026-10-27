// Правая рука мамы с ручкой — вид сверху для макропланов на листе.
// (x, y) — острие ручки в мировых px. Ручка уходит вверх-вправо, кисть
// лежит справа от острия, предплечье — вниз-вправо за край кадра.
// tilt — поворот всей руки (градусы), s — масштаб, lift 0…1 — перо
// приподнято над бумагой. Рукав — бирюзовый кардиган мамы.
import { box } from "../context";
import { C } from "./theme";

const SK = C.skin;
const SH = C.skinShade;

// «Капсула» с контуром: палец или запястье.
const Cap: React.FC<{ readonly a: readonly [number, number]; readonly b: readonly [number, number]; readonly w: number; readonly fill?: string }> = ({ a, b, w, fill = SK }) => (
  <>
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={SH} strokeWidth={w + 5} strokeLinecap="round" />
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={fill} strokeWidth={w} strokeLinecap="round" />
  </>
);

export const PenHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly tilt?: number;
  readonly s?: number;
  readonly lift?: number;
  readonly opacity?: number;
}> = ({ x, y, tilt = 0, s = 1, lift = 0, opacity = 1 }) => {
  const up = lift * 10;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity, pointerEvents: "none" })}>
      <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
        {/* тень руки и ручки на бумаге (смещена вправо-вниз) */}
        <g transform={`translate(${18 + up} ${22 + up})`} opacity={0.15} fill="#3A2A1A">
          <ellipse cx={118} cy={-34} rx={92} ry={70} transform="rotate(28 118 -34)" />
          <line x1={200} y1={20} x2={480} y2={360} stroke="#3A2A1A" strokeWidth={170} strokeLinecap="round" />
          <line x1={0} y1={0} x2={150} y2={-232} stroke="#3A2A1A" strokeWidth={18} strokeLinecap="round" />
        </g>
        <g transform={`translate(0 ${-up})`}>
          {/* предплечье в рукаве кардигана */}
          <line x1={215} y1={30} x2={520} y2={400} stroke={C.tealDark} strokeWidth={172} strokeLinecap="round" />
          <line x1={215} y1={30} x2={520} y2={400} stroke={C.teal} strokeWidth={160} strokeLinecap="round" />
          <line x1={250} y1={30} x2={540} y2={380} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={40} strokeLinecap="round" />
          {/* манжета блузки */}
          <line x1={200} y1={14} x2={232} y2={52} stroke="#F5EADB" strokeWidth={150} strokeLinecap="butt" />
          {/* запястье */}
          <Cap a={[150, -12]} b={[196, 30]} w={108} />
          {/* подогнутые безымянный и мизинец (снизу кисти) */}
          <Cap a={[92, 14]} b={[70, 24]} w={36} />
          <Cap a={[126, 30]} b={[104, 40]} w={32} />
          {/* тыльная сторона кисти */}
          <ellipse cx={120} cy={-28} rx={86} ry={66} transform="rotate(30 120 -28)" fill={SH} />
          <ellipse cx={119} cy={-29} rx={83} ry={63} transform="rotate(30 119 -29)" fill={SK} />
          {/* блик и костяшки */}
          <ellipse cx={136} cy={-52} rx={44} ry={20} transform="rotate(30 136 -52)" fill="#FFFFFF" opacity={0.14} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${62 + i * 20} ${-70 + i * 26} q 9 -3 14 4`} stroke={SH} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.75} />
          ))}
          {/* средний палец — под ручкой у острия */}
          <Cap a={[78, -4]} b={[30, -2]} w={34} />
          {/* большой палец — слева от ручки */}
          <Cap a={[72, -84]} b={[16, -60]} w={34} />
          <ellipse cx={14} cy={-60} rx={9} ry={11} fill="#F3CDB0" opacity={0.9} />
          {/* ручка: корпус, клип, наконечник */}
          <g>
            <line x1={14} y1={-21} x2={156} y2={-239} stroke="#0C1838" strokeWidth={22} strokeLinecap="round" />
            <line x1={14} y1={-21} x2={156} y2={-239} stroke={C.navy} strokeWidth={18} strokeLinecap="round" />
            <line x1={10} y1={-24} x2={150} y2={-240} stroke="#3354A8" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
            <line x1={124} y1={-176} x2={150} y2={-218} stroke={C.yellow} strokeWidth={7} strokeLinecap="round" />
            <path d="M 2 -1 L 20 -26 L 8 -30 Z" fill="#C8D0DC" />
            <path d="M 0 0 L 5 -7 L 2 -8 Z" fill={C.ink} />
          </g>
          {/* указательный палец — сверху на ручке */}
          <Cap a={[92, -72]} b={[30, -36]} w={32} />
          <ellipse cx={30} cy={-36} rx={10} ry={9} fill="#F3CDB0" opacity={0.9} />
          {/* часы на запястье */}
          <line x1={160} y1={-48} x2={226} y2={30} stroke="#2A2A34" strokeWidth={24} />
          <rect x={174} y={-28} width={40} height={40} rx={11} fill="#E6C15A" stroke="#2A2A34" strokeWidth={4} transform="rotate(40 194 -8)" />
        </g>
      </g>
    </svg>
  );
};
