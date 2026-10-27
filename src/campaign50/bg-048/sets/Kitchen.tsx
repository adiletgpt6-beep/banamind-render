// Кухня BG-048 в мировых координатах (x 0…1600, y −250…2700): тёплая
// стена с плиткой, окно с утренним видом Бишкека (снежный хребет Ала-Тоо,
// тополя, пастельные 5–9-этажки), подоконник с цветами, холодильник с
// детскими рисунками и магнитом «Бишкек», верхние шкафчики, часы ≈ 08:00,
// обычный деревянный стол и стулья. Еды, напитков и посуды в кадре нет.
import { fontFamily } from "../fonts";
import { NAVY, WALL, WALL_SHADE, WOOD, WOOD_DARK, YELLOW } from "../palette";
import { B48_TEXT } from "../script";

export const WORLD = { minX: 0, maxX: 1600, minY: -250, maxY: 2700 } as const;
export const WINDOW = { x: 1060, y: 380, w: 440, h: 600 } as const;
export const MAGNET = { x: 230, y: 900 } as const;
// постер «Бишкек» на стене над столом — целиком в кадре во всех планах кухни
export const POSTER = { x: 440, y: 578, w: 210, h: 160 } as const;
export const FRIDGE = { x: 60, y: 700, w: 340, h: 1200 } as const;

const f1 = (n: number) => n.toFixed(1);

const BishkekView: React.FC<{ readonly t: number }> = ({ t }) => {
  const { x, y, w, h } = WINDOW;
  const cloud = (cx: number, cy: number, s: number) => (
    <g transform={`translate(${f1(cx)} ${cy}) scale(${s})`} opacity={0.95}>
      <ellipse cx={0} cy={0} rx={60} ry={24} fill="#FFFFFF" />
      <ellipse cx={-34} cy={6} rx={36} ry={18} fill="#FFFFFF" />
      <ellipse cx={30} cy={-10} rx={40} ry={26} fill="#FFFFFF" />
    </g>
  );
  const drift = (t * 6) % (w + 260);
  return (
    <g>
      <defs>
        <clipPath id="bg48-kitchen-window">
          <rect x={x + 18} y={y + 18} width={w - 36} height={h - 36} rx={6} />
        </clipPath>
        <linearGradient id="bg48-kitchen-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FD3F5" />
          <stop offset="1" stopColor="#E6F4FB" />
        </linearGradient>
      </defs>
      <g clipPath="url(#bg48-kitchen-window)">
        <rect x={x} y={y} width={w} height={h} fill="url(#bg48-kitchen-sky)" />
        {cloud(x - 100 + drift, y + 90, 0.8)}
        {cloud(x + 120 + ((drift + 180) % (w + 260)) - 100, y + 150, 0.55)}
        {/* Ала-Тоо: снежные вершины */}
        <path d={`M ${x} ${y + 330} L ${x + 60} ${y + 250} L ${x + 120} ${y + 290} L ${x + 200} ${y + 200} L ${x + 270} ${y + 270} L ${x + 330} ${y + 215} L ${x + 400} ${y + 285} L ${x + w} ${y + 240} L ${x + w} ${y + 380} L ${x} ${y + 380} Z`} fill="#A9B8D6" />
        <path d={`M ${x + 170} ${y + 233} L ${x + 200} ${y + 200} L ${x + 232} ${y + 236} L ${x + 216} ${y + 232} L ${x + 200} ${y + 245} L ${x + 186} ${y + 230} Z`} fill="#FFFFFF" />
        <path d={`M ${x + 308} ${y + 240} L ${x + 330} ${y + 215} L ${x + 356} ${y + 245} L ${x + 340} ${y + 240} L ${x + 330} ${y + 250} Z`} fill="#FFFFFF" />
        <path d={`M ${x + 40} ${y + 275} L ${x + 60} ${y + 250} L ${x + 82} ${y + 276} L ${x + 66} ${y + 272} Z`} fill="#FFFFFF" />
        <path d={`M ${x} ${y + 360} L ${x + 90} ${y + 320} L ${x + 180} ${y + 345} L ${x + 300} ${y + 310} L ${x + w} ${y + 340} L ${x + w} ${y + 420} L ${x} ${y + 420} Z`} fill="#C3CFE6" />
        {/* дома: пастельные 5–9-этажки */}
        {[
          { dx: 10, w: 110, h: 170, c: "#F6E1C3" },
          { dx: 130, w: 90, h: 220, c: "#E9EEF7" },
          { dx: 235, w: 120, h: 150, c: "#F3D7C6" },
          { dx: 300, w: 80, h: 250, c: "#DDE7F2" },
        ].map((b, i) => (
          <g key={i}>
            <rect x={x + b.dx} y={y + h - 40 - b.h} width={b.w} height={b.h} fill={b.c} />
            {Array.from({ length: Math.floor(b.h / 34) }, (_, r) =>
              Array.from({ length: Math.floor(b.w / 28) }, (_, cI) => (
                <rect key={`${r}-${cI}`} x={x + b.dx + 10 + cI * 28} y={y + h - 40 - b.h + 12 + r * 34} width={14} height={18} rx={2} fill={(r + cI + i) % 4 === 0 ? "#FFE7A3" : "#9FB3CF"} opacity={0.85} />
              )),
            )}
          </g>
        ))}
        {/* тополя качаются */}
        {[60, 210, 380].map((px, i) => {
          const sw = 3 * Math.sin(t * 1.1 + i * 1.7);
          return (
            <g key={px} transform={`rotate(${f1(sw)} ${x + px} ${y + h - 30})`}>
              <rect x={x + px - 5} y={y + h - 90} width={10} height={60} fill="#7A5A3A" />
              <ellipse cx={x + px} cy={y + h - 170} rx={30} ry={110} fill={i % 2 ? "#6DB36B" : "#5CA45E"} />
              <ellipse cx={x + px - 8} cy={y + h - 190} rx={12} ry={70} fill="#7FC57A" opacity={0.7} />
            </g>
          );
        })}
        <rect x={x} y={y + h - 40} width={w} height={40} fill="#8BC77E" />
      </g>
      {/* рама и подоконник */}
      <rect x={x} y={y} width={w} height={h} rx={14} fill="none" stroke="#FFFFFF" strokeWidth={22} />
      <rect x={x + w / 2 - 6} y={y + 10} width={12} height={h - 20} fill="#FFFFFF" />
      <rect x={x + 10} y={y + h * 0.42} width={w - 20} height={10} fill="#FFFFFF" />
      <rect x={x - 30} y={y + h - 4} width={w + 60} height={34} rx={8} fill="#F4F1EA" />
      {/* шторы */}
      <path d={`M ${x - 70} ${y - 50} L ${x + 50} ${y - 50} Q ${x + 30} ${y + 260} ${x + 60} ${y + h + 40} L ${x - 70} ${y + h + 40} Z`} fill={YELLOW} opacity={0.95} />
      <path d={`M ${x + w + 70} ${y - 50} L ${x + w - 50} ${y - 50} Q ${x + w - 30} ${y + 260} ${x + w - 60} ${y + h + 40} L ${x + w + 70} ${y + h + 40} Z`} fill={YELLOW} opacity={0.95} />
      <rect x={x - 100} y={y - 64} width={w + 200} height={16} rx={8} fill={WOOD_DARK} />
      {/* цветы на подоконнике */}
      {[x + 70, x + w - 80].map((px, i) => (
        <g key={px}>
          <path d={`M ${px - 32} ${y + h - 6} L ${px + 32} ${y + h - 6} L ${px + 24} ${y + h - 70} L ${px - 24} ${y + h - 70} Z`} fill={i ? "#E97C5B" : "#59A7E0"} transform={`translate(0 0)`} />
          {[-1, 0, 1].map((k) => (
            <ellipse key={k} cx={px + k * 22} cy={y + h - 100 - (k === 0 ? 20 : 0)} rx={16} ry={38} fill="#4E9F55" transform={`rotate(${k * 25} ${px + k * 22} ${y + h - 80})`} />
          ))}
        </g>
      ))}
    </g>
  );
};

export const KitchenBack: React.FC<{ readonly t: number; readonly morning?: number }> = ({ t }) => {
  const mins = 0 + (t * 0.5) % 60;
  const mA = (mins / 60) * 360;
  const hA = 240 + (mins / 60) * 30;
  return (
    <g>
      {/* стена */}
      <rect x={-300} y={-500} width={2200} height={2420} fill={WALL} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          {Array.from({ length: 9 }, (_, j) => (
            <circle key={j} cx={-200 + i * 180 + (j % 2) * 90} cy={-160 + j * 120} r={6} fill={WALL_SHADE} opacity={0.7} />
          ))}
        </g>
      ))}
      {/* светлая плитка — фартук */}
      <rect x={-300} y={1180} width={2200} height={300} fill="#FFFFFF" opacity={0.75} />
      {Array.from({ length: 24 }, (_, i) => (
        <line key={i} x1={-300 + i * 92} y1={1180} x2={-300 + i * 92} y2={1480} stroke={WALL_SHADE} strokeWidth={3} />
      ))}
      {[1255, 1330, 1405].map((yy) => (
        <line key={yy} x1={-300} y1={yy} x2={1900} y2={yy} stroke={WALL_SHADE} strokeWidth={3} />
      ))}
      <rect x={-300} y={1480} width={2200} height={420} fill={WALL} />
      {/* пол */}
      <rect x={-300} y={1900} width={2200} height={1000} fill="#E7C9A0" />
      {Array.from({ length: 14 }, (_, i) => (
        <line key={i} x1={-300 + i * 170} y1={1900} x2={-300 + i * 170 - 60} y2={2900} stroke="#D7B78C" strokeWidth={4} />
      ))}
      <rect x={-300} y={1890} width={2200} height={18} fill="#D9BC92" />
      {/* верхние шкафчики */}
      <g>
        <rect x={430} y={200} width={570} height={320} rx={16} fill="#FFFDF8" stroke="#E7DCCB" strokeWidth={6} />
        <line x1={715} y1={210} x2={715} y2={510} stroke="#E7DCCB" strokeWidth={6} />
        <rect x={680} y={330} width={14} height={60} rx={7} fill={YELLOW} />
        <rect x={736} y={330} width={14} height={60} rx={7} fill={YELLOW} />
        <rect x={420} y={508} width={590} height={20} rx={8} fill={WOOD} />
      </g>
      {/* часы ≈ 08:00 */}
      <g>
        <circle cx={1250} cy={250} r={74} fill="#FFFFFF" stroke={NAVY} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={1250 + Math.sin(a) * 56} y1={250 - Math.cos(a) * 56} x2={1250 + Math.sin(a) * 64} y2={250 - Math.cos(a) * 64} stroke={NAVY} strokeWidth={i % 3 === 0 ? 6 : 3} strokeLinecap="round" />;
        })}
        <line x1={1250} y1={250} x2={1250 + Math.sin((hA * Math.PI) / 180) * 34} y2={250 - Math.cos((hA * Math.PI) / 180) * 34} stroke={NAVY} strokeWidth={8} strokeLinecap="round" />
        <line x1={1250} y1={250} x2={1250 + Math.sin((mA * Math.PI) / 180) * 52} y2={250 - Math.cos((mA * Math.PI) / 180) * 52} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
        <circle cx={1250} cy={250} r={7} fill={YELLOW} />
      </g>
      <BishkekView t={t} />
      {/* постер «Бишкек» с силуэтом Ала-Тоо */}
      <g transform={`rotate(-1.5 ${POSTER.x + POSTER.w / 2} ${POSTER.y + POSTER.h / 2})`}>
        <rect x={POSTER.x + 6} y={POSTER.y + 8} width={POSTER.w} height={POSTER.h} rx={10} fill="#000000" opacity={0.1} />
        <rect x={POSTER.x} y={POSTER.y} width={POSTER.w} height={POSTER.h} rx={10} fill="#FFFFFF" stroke={WOOD} strokeWidth={8} />
        <rect x={POSTER.x + 14} y={POSTER.y + 14} width={POSTER.w - 28} height={78} rx={4} fill="#BFE3FF" />
        <path d={`M ${POSTER.x + 14} ${POSTER.y + 92} L ${POSTER.x + 50} ${POSTER.y + 50} L ${POSTER.x + 74} ${POSTER.y + 70} L ${POSTER.x + 110} ${POSTER.y + 36} L ${POSTER.x + 146} ${POSTER.y + 66} L ${POSTER.x + 170} ${POSTER.y + 48} L ${POSTER.x + POSTER.w - 14} ${POSTER.y + 80} L ${POSTER.x + POSTER.w - 14} ${POSTER.y + 92} Z`} fill="#8FA3C8" />
        <path d={`M ${POSTER.x + 100} ${POSTER.y + 46} L ${POSTER.x + 110} ${POSTER.y + 36} L ${POSTER.x + 121} ${POSTER.y + 47} Z`} fill="#FFFFFF" />
        <path d={`M ${POSTER.x + 42} ${POSTER.y + 60} L ${POSTER.x + 50} ${POSTER.y + 50} L ${POSTER.x + 58} ${POSTER.y + 57} Z`} fill="#FFFFFF" />
        <text x={POSTER.x + POSTER.w / 2} y={POSTER.y + 138} textAnchor="middle" fontFamily={fontFamily} fontWeight={1000} fontSize={40} fill={NAVY}>
          {B48_TEXT.magnet}
        </text>
      </g>
      {/* холодильник */}
      <g>
        <rect x={FRIDGE.x} y={FRIDGE.y} width={FRIDGE.w} height={FRIDGE.h} rx={30} fill="#FFFFFF" stroke="#DCE2EC" strokeWidth={6} />
        <line x1={FRIDGE.x + 6} y1={FRIDGE.y + 420} x2={FRIDGE.x + FRIDGE.w - 6} y2={FRIDGE.y + 420} stroke="#DCE2EC" strokeWidth={6} />
        <rect x={FRIDGE.x + FRIDGE.w - 44} y={FRIDGE.y + 150} width={16} height={180} rx={8} fill="#C9D1DE" />
        <rect x={FRIDGE.x + FRIDGE.w - 44} y={FRIDGE.y + 480} width={16} height={240} rx={8} fill="#C9D1DE" />
        {/* детские рисунки на магнитах */}
        <g transform="rotate(-4 160 1040)">
          <rect x={95} y={980} width={150} height={120} fill="#FFFFFF" stroke="#E2E6EE" strokeWidth={3} />
          <circle cx={130} cy={1012} r={16} fill="#FFD449" />
          <path d="M 170 1085 L 170 1045 L 200 1020 L 230 1045 L 230 1085 Z" fill="#F08A6B" />
          <rect x={192} y={1060} width={16} height={25} fill="#FFFFFF" />
          <circle cx={170} cy={976} r={9} fill="#59C3FF" />
        </g>
        <g transform="rotate(5 300 1200)">
          <rect x={235} y={1140} width={130} height={110} fill="#FFFFFF" stroke="#E2E6EE" strokeWidth={3} />
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={265 + k * 35} cy={1205} r={14} fill={["#F08A6B", "#7FB8F0", "#FFD449"][k]} />
          ))}
          <path d="M 255 1235 Q 300 1215 345 1235" stroke="#4E9F55" strokeWidth={5} fill="none" />
          <circle cx={300} cy={1136} r={9} fill="#FF8FC7" />
        </g>
        {/* магниты-кружочки */}
        <circle cx={MAGNET.x - 60} cy={MAGNET.y} r={16} fill={YELLOW} />
        <circle cx={MAGNET.x + 10} cy={MAGNET.y + 20} r={13} fill="#59C3FF" />
      </g>
    </g>
  );
};

export const KitchenTable: React.FC = () => (
  <g>
    <ellipse cx={800} cy={1905} rx={600} ry={34} fill="#000000" opacity={0.1} />
    {[300, 1300].map((x) => (
      <rect key={x} x={x - 18} y={1380} width={36} height={520} rx={10} fill={WOOD_DARK} />
    ))}
    {[420, 1180].map((x) => (
      <rect key={x} x={x - 14} y={1380} width={28} height={480} rx={10} fill="#946235" opacity={0.8} />
    ))}
    <rect x={260} y={1350} width={1080} height={52} rx={10} fill={WOOD_DARK} />
    <path d="M 270 1300 L 1330 1300 L 1345 1352 L 255 1352 Z" fill={WOOD} />
    <path d="M 290 1308 L 1310 1308" stroke="#DDA877" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
    {/* скатерть до пола почти: под столом не видно «пустоты» */}
    <path
      d={`M 248 1346 L 1352 1346 L 1352 1640 ${Array.from({ length: 22 }, (_, i) => `Q ${1352 - i * 50.2 - 25} 1672 ${1352 - (i + 1) * 50.2} 1640`).join(" ")} Z`}
      fill="#FFFDF7"
      stroke="#E9DFC9"
      strokeWidth={4}
    />
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={300 + i * 108} y={1346} width={44} height={290} fill={YELLOW} opacity={0.28} />
    ))}
    <rect x={248} y={1346} width={1104} height={18} fill="#F1E6CF" />
  </g>
);

export const KitchenChair: React.FC<{ readonly x: number; readonly y?: number }> = ({ x, y = 1050 }) => (
  <g>
    <rect x={x - 112} y={y} width={224} height={40} rx={18} fill={WOOD} />
    <rect x={x - 100} y={y + 30} width={18} height={330} rx={8} fill={WOOD_DARK} />
    <rect x={x + 82} y={y + 30} width={18} height={330} rx={8} fill={WOOD_DARK} />
    <rect x={x - 84} y={y + 70} width={168} height={14} rx={7} fill={WOOD} opacity={0.9} />
    <rect x={x - 84} y={y + 120} width={168} height={14} rx={7} fill={WOOD} opacity={0.9} />
    <rect x={x - 110} y={y + 560} width={20} height={300} rx={8} fill={WOOD_DARK} />
    <rect x={x + 90} y={y + 560} width={20} height={300} rx={8} fill={WOOD_DARK} />
  </g>
);
