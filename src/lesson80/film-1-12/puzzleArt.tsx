// Рисунок деревянной картинки и деталей. Общий рисунок (дерево, ветка,
// зелёные листья, птица на ветке) рисуется в единицах картинки 300 × 200;
// каждая деталь — отдельный объект: свой контур (piecePath), свой участок
// рисунка (обрезка контуром по месту детали в картинке), торец дерева и
// тень. Одни и те же детали рисуются в комнате (сжатая плоскость стола,
// вид с другой стороны) и сверху — разной проекцией одной модели.
import { homeCenter, piecePath, PIECE_THICK, S, TABLE_PLANE, type PieceDef, type PiecePose } from "./puzzle";

const WOOD_FACE = "#E9CC9C";
const WOOD_SIDE = "#B98A55";
const WOOD_SIDE_DARK = "#9C7042";

// ---------- общий рисунок ----------
export const PictureArt: React.FC<{ readonly uid: string }> = ({ uid }) => (
  <g>
    <defs>
      <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A9D6EE" />
        <stop offset="0.62" stopColor="#D9EEF2" />
        <stop offset="1" stopColor="#EEF6EA" />
      </linearGradient>
      <linearGradient id={`${uid}-grass`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9CCB6E" />
        <stop offset="1" stopColor="#6FA74E" />
      </linearGradient>
      <linearGradient id={`${uid}-trunk`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7A4E31" />
        <stop offset="0.55" stopColor="#9A6844" />
        <stop offset="1" stopColor="#6E4529" />
      </linearGradient>
    </defs>
    <rect x={-40} y={-40} width={380} height={280} fill={`url(#${uid}-sky)`} />
    {/* облака */}
    <g fill="#FFFFFF" opacity={0.92}>
      <ellipse cx={168} cy={26} rx={20} ry={9} />
      <ellipse cx={184} cy={21} rx={14} ry={10} />
      <ellipse cx={198} cy={27} rx={15} ry={8} />
      <ellipse cx={262} cy={18} rx={16} ry={7} />
      <ellipse cx={276} cy={14} rx={11} ry={8} />
    </g>
    {/* дальние холмы */}
    <path d="M -40 150 Q 40 118 120 136 Q 200 152 260 126 Q 300 116 340 130 L 340 240 L -40 240 Z" fill="#C3DDA6" />
    {/* трава */}
    <path d="M -40 156 Q 60 146 150 152 Q 240 158 340 148 L 340 240 L -40 240 Z" fill={`url(#${uid}-grass)`} />
    <g stroke="#5E9443" strokeWidth={2} strokeLinecap="round" fill="none">
      {[14, 34, 126, 140, 172, 204, 222, 286].map((x, i) => (
        <path key={i} d={`M ${x} ${186 - (i % 3) * 6} q 2 -8 6 -11 M ${x + 4} ${188 - (i % 3) * 6} q 0 -7 -3 -11`} />
      ))}
    </g>
    {/* цветок (нижний ряд, середина) */}
    <g>
      <path d="M 158 186 q 2 -14 0 -24" stroke="#5E9443" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <path d="M 158 176 q 8 -2 10 -9 q -8 0 -10 9" fill="#6FA74E" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={158 + 6 * Math.cos((a * Math.PI) / 180)} cy={160 + 6 * Math.sin((a * Math.PI) / 180)} rx={5} ry={3.6} transform={`rotate(${a} ${158 + 6 * Math.cos((a * Math.PI) / 180)} ${160 + 6 * Math.sin((a * Math.PI) / 180)})`} fill="#FFFFFF" />
      ))}
      <circle cx={158} cy={160} r={3.6} fill="#F2C53D" />
    </g>
    {/* куст (нижний ряд, справа) */}
    <g>
      <ellipse cx={252} cy={170} rx={26} ry={16} fill="#5E9A47" />
      <ellipse cx={238} cy={164} rx={14} ry={12} fill="#6FAF58" />
      <ellipse cx={262} cy={160} rx={15} ry={12} fill="#7FBF66" />
      <circle cx={244} cy={166} r={2.6} fill="#E8826F" />
      <circle cx={262} cy={170} r={2.6} fill="#E8826F" />
      <circle cx={252} cy={158} r={2.2} fill="#E8826F" />
    </g>
    {/* ствол с корнями */}
    <path d="M 66 196 Q 74 176 74 150 L 76 92 Q 77 74 82 64 L 96 64 Q 98 80 96 96 L 95 150 Q 96 178 108 196 Z" fill={`url(#${uid}-trunk)`} />
    <path d="M 82 120 q 4 6 2 14 M 88 100 q -3 6 0 12" stroke="#5F3B23" strokeWidth={1.6} fill="none" strokeLinecap="round" opacity={0.7} />
    {/* ветка: от ствола вправо через среднюю деталь к птице */}
    <path d="M 92 84 C 120 80 150 78 176 76 C 206 73 238 70 284 62" stroke="#7A4E31" strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d="M 92 82 C 120 78 150 76 176 74 C 206 71 238 68 284 60" stroke="#A47149" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
    {/* маленькая боковая веточка на средней детали */}
    <path d="M 160 78 Q 166 84 173 86" stroke="#7A4E31" strokeWidth={3.4} fill="none" strokeLinecap="round" />
    {/* крона */}
    <g>
      <circle cx={44} cy={58} r={26} fill="#4F9A45" />
      <circle cx={62} cy={36} r={30} fill="#5EAA4F" />
      <circle cx={92} cy={44} r={22} fill="#56A14B" />
      <circle cx={30} cy={34} r={20} fill="#63B054" />
      <circle cx={74} cy={62} r={18} fill="#4C9442" />
      <circle cx={56} cy={28} r={12} fill="#7CC468" opacity={0.8} />
      <circle cx={84} cy={34} r={8} fill="#86CC71" opacity={0.7} />
      <circle cx={38} cy={50} r={5} fill="#E5654F" />
      <circle cx={70} cy={50} r={5} fill="#E5654F" />
      <circle cx={52} cy={70} r={4.6} fill="#E5654F" />
    </g>
    {/* зелёный листик на средней детали — главный ориентир */}
    <g>
      <path d="M 150 77 q 1 -6 4 -10" stroke="#3F7A33" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <path d="M 154 67 C 150 56 158 44 172 40 C 176 52 168 64 154 67 Z" fill="#5DB04A" stroke="#3F7A33" strokeWidth={1.6} />
      <path d="M 154 67 Q 162 56 171 42" stroke="#3F7A33" strokeWidth={1.2} fill="none" />
      {/* листок на боковой веточке — целиком внутри детали, в стороне от стыков */}
      <path d="M 172 86 C 177 81 187 82 191 89 C 184 94 176 93 172 86 Z" fill="#6BBA55" stroke="#3F7A33" strokeWidth={1.4} />
      <path d="M 122 79 C 116 88 118 98 126 102 C 130 94 128 84 122 79 Z" fill="#5DB04A" stroke="#3F7A33" strokeWidth={1.3} />
    </g>
    {/* листья на конце ветки */}
    <g>
      <path d="M 222 70 C 222 60 230 54 238 54 C 238 63 232 69 222 70 Z" fill="#6BBA55" stroke="#3F7A33" strokeWidth={1.3} />
      <path d="M 270 64 C 276 72 276 80 270 86 C 264 80 264 70 270 64 Z" fill="#5DB04A" stroke="#3F7A33" strokeWidth={1.3} />
      <path d="M 284 62 C 292 56 298 56 302 58 C 298 64 290 66 284 62 Z" fill="#6BBA55" stroke="#3F7A33" strokeWidth={1.2} />
    </g>
    {/* птица на ветке: смотрит к дереву */}
    <g>
      <path d="M 262 52 L 280 42 L 278 50 L 264 58 Z" fill="#6E4A33" />
      <ellipse cx={252} cy={55} rx={16} ry={11.5} fill="#8A5B3C" />
      <path d="M 238 56 C 240 66 254 70 262 62 C 256 64 246 62 238 56 Z" fill="#F2A65A" />
      <ellipse cx={246} cy={58} rx={9} ry={7} fill="#F2A65A" />
      <circle cx={239} cy={46} r={9} fill="#8A5B3C" />
      <circle cx={238} cy={48} r={5} fill="#F7C08A" opacity={0.85} />
      <path d="M 230 45 L 222 47.5 L 230 49.5 Z" fill="#E59A3A" />
      <circle cx={236.5} cy={44.5} r={1.9} fill="#1E1B26" />
      <circle cx={236} cy={43.9} r={0.6} fill="#FFFFFF" />
      <path d="M 250 50 Q 258 52 262 58 Q 254 60 248 56 Z" fill="#6E4A33" />
      <path d="M 246 65 l -1 4 M 252 66 l 0 4" stroke="#6E4A33" strokeWidth={1.4} strokeLinecap="round" />
    </g>
  </g>
);

// ---------- деталь ----------
// Лицевая сторона детали в её локальных единицах (центр 0, 0): участок
// рисунка, обрезанный контуром, тонкая фаска и линия края.
export const PieceFace: React.FC<{ readonly p: PieceDef; readonly uid: string; readonly detail?: boolean }> = ({ p, uid, detail = true }) => {
  const c = homeCenter(p);
  const d = piecePath(p);
  const id = `${uid}-clip-${p.id}`;
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={WOOD_FACE} />
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(${-c.x} ${-c.y})`}>{detail ? <PictureArt uid={`${uid}-${p.id}`} /> : <PictureSimple />}</g>
        {/* фаска: светлая кромка сверху-слева, тень снизу-справа */}
        <path d={d} fill="none" stroke="#FFF6E2" strokeWidth={5} opacity={0.35} transform="translate(-1.2 -1.2)" />
        <path d={d} fill="none" stroke="#5C3F22" strokeWidth={5} opacity={0.16} transform="translate(1.4 1.4)" />
      </g>
      <path d={d} fill="none" stroke="#7A5530" strokeWidth={1.6} opacity={0.75} />
    </g>
  );
};

// Упрощённый рисунок для мелкого масштаба (вид из комнаты): те же цвета и
// пятна — небо, трава, крона, ствол, ветка, листья, птица.
const PictureSimple: React.FC = () => (
  <g>
    <rect x={-40} y={-40} width={380} height={280} fill="#C4E3EF" />
    <rect x={-40} y={150} width={380} height={90} fill="#86BC60" />
    <path d="M 66 196 L 76 92 L 96 64 L 96 150 L 108 196 Z" fill="#8A5B3C" />
    <path d="M 92 84 C 150 78 220 70 284 62" stroke="#7A4E31" strokeWidth={8} fill="none" />
    <circle cx={60} cy={44} r={36} fill="#58A44C" />
    <path d="M 154 67 C 150 56 158 44 172 40 C 176 52 168 64 154 67 Z" fill="#5DB04A" />
    <ellipse cx={250} cy={168} rx={26} ry={16} fill="#5E9A47" />
    <ellipse cx={250} cy={55} rx={16} ry={11} fill="#8A5B3C" />
    <ellipse cx={244} cy={58} rx={9} ry={7} fill="#F2A65A" />
  </g>
);

// Торец и тень детали (в локальных единицах): торец — тот же контур,
// сдвинутый вниз на толщину дерева.
export const PieceSide: React.FC<{ readonly p: PieceDef }> = ({ p }) => {
  const d = piecePath(p);
  return (
    <g>
      <path d={d} fill={WOOD_SIDE} stroke={WOOD_SIDE_DARK} strokeWidth={2} />
    </g>
  );
};

// ---------- деталь в комнате ----------
// Плоскость стола видна с другой стороны (поворот на 180°) и сжата по
// глубине: scale(−S, −S·fs) после поворота θ. Торец — ниже лицевой стороны.
// part: "side" / "face" — для двух проходов по лежащим деталям (сначала все
// торцы, потом все лица): иначе торец ближней детали ложится на выступ
// дальней внутри паза и в собранной картинке видны коричневые «капсулы».
export const RoomPiece: React.FC<{ readonly p: PieceDef; readonly pose: PiecePose; readonly tableTop: number; readonly uid: string; readonly part?: "side" | "face" | "all" }> = ({ p, pose, tableTop, uid, part = "all" }) => {
  const x = pose.u;
  const y = tableTop - TABLE_PLANE.fs * pose.w - pose.z;
  const tf = `scale(${-S} ${-S * TABLE_PLANE.fs}) rotate(${pose.theta})`;
  return (
    <g>
      {part !== "face" && pose.z > 0.5 ? <ellipse cx={x} cy={tableTop - TABLE_PLANE.fs * pose.w + 1} rx={18 - Math.min(8, pose.z * 0.12)} ry={3.2} fill="#3A2614" opacity={Math.max(0.05, 0.22 - pose.z * 0.003)} /> : null}
      {part !== "face" ? (
        <g transform={`translate(${x} ${y + PIECE_THICK})`}>
          <g transform={tf}>
            <PieceSide p={p} />
          </g>
        </g>
      ) : null}
      {part !== "side" ? (
        <g transform={`translate(${x} ${y})`}>
          <g transform={tf}>
            <PieceFace p={p} uid={uid} detail={false} />
          </g>
        </g>
      ) : null}
    </g>
  );
};

// ---------- деталь сверху ----------
// k — пикселей кадра на px мира; (X, Y) — центр детали в кадре. Поднятая
// деталь чуть крупнее (ближе к камере), тень отходит от неё вверх-вправо
// (свет от окна — сзади слева в этом виде). part: "under" — тень и торец,
// "face" — лицевая сторона; детали, лежащие вплотную, рисуются в два прохода
// (сначала все торцы, потом все лица), чтобы торец соседа не ложился на рисунок.
export const TopPiece: React.FC<{ readonly p: PieceDef; readonly pose: PiecePose; readonly X: number; readonly Y: number; readonly k: number; readonly uid: string; readonly part?: "under" | "face" | "all" }> = ({ p, pose, X, Y, k, uid, part = "all" }) => {
  const lift = Math.max(0, pose.z);
  const grow = 1 + lift * 0.0035;
  const sc = k * S * grow;
  const thick = PIECE_THICK * k * 0.55;
  const sh = 4 + lift * k * 0.12;
  return (
    <g>
      {part !== "face" ? (
        <>
          {/* тень на столе */}
          <g transform={`translate(${X + sh * 0.7} ${Y - sh * 0.35}) rotate(${pose.theta}) scale(${k * S})`} opacity={Math.max(0.12, 0.32 - lift * 0.004)} style={{ filter: `blur(${2 + lift * 0.12}px)` }}>
            <path d={piecePath(p)} fill="#3A2614" />
          </g>
          {/* торец (видно немного снизу) */}
          <g transform={`translate(${X + thick * 0.35} ${Y + thick}) rotate(${pose.theta}) scale(${sc})`}>
            <PieceSide p={p} />
          </g>
        </>
      ) : null}
      {part !== "under" ? (
        <g transform={`translate(${X} ${Y}) rotate(${pose.theta}) scale(${sc})`}>
          <PieceFace p={p} uid={uid} />
        </g>
      ) : null}
    </g>
  );
};
