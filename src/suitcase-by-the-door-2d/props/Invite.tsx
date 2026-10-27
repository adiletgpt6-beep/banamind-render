// Приглашение маме выступить на встрече коллег (без названия города и
// конференции) и всё, что лежит с ним в папке. Вид сверху, надписи —
// настоящим текстом (Nunito с ү, ө, ң), размеры — от ширины листа.
//  • InviteSheet — лист «ЧАКЫРУУ» (альбомный): крупный заголовок, строка
//    «Кесиптештер жолугушуусу», роль «Баяндамачы» со значком кафедры,
//    плашка «3 күн» и маленький рисунок зала со сценой. hiLine / hiRole —
//    0…1 мягкое жёлтое выделение строки / роли (маркер слева направо).
//    back — обратная сторона (при перелистывании): чистая бумага, текст
//    едва просвечивает зеркально.
//  • HallSketch — эскиз зала карандашом на листе в клетку: маленькая
//    сцена с кафедрой и ряды кресел полукругом.
//  • TripDayCard — карточка дня поездки (1-күн Жол / 2-күн Сөз сүйлөө /
//    3-күн Талкуу) с иконкой; lift — 0…1 карточка приподнята над столом.
//  • DayIcon — иконка дня: дорога и чемодан / кафедра и микрофон / люди
//    за столом; line — цвет линий для схемы (без заливок).
import { C } from "../theme";
import { FONT, roughPath, roughRect } from "../kit";
import { clamp } from "../rig/motion";
import { SD2_TEXT } from "../script";

const T = SD2_TEXT.invite;
export const INVITE_RATIO = 0.69; // h / w
export const CARD_RATIO = 1.18; // h / w карточки дня

// ---------- иконки ----------
// Единичный квадрат −50…50, масштаб s/100. Цветная или линейная (line).
export const DayIcon: React.FC<{ readonly i: number; readonly x: number; readonly y: number; readonly s: number; readonly ink: number; readonly line?: string; readonly draw?: number }> = ({ i, x, y, s, ink, line, draw = 1 }) => {
  const k = s / 100;
  const w = ink / k;
  const st = line ?? C.ink;
  const fill = (c: string) => (line ? "none" : c);
  const o = clamp(draw);
  const common = { stroke: st, strokeWidth: w, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  let body: React.ReactNode = null;
  if (i === 0) {
    // дорога уходит вдаль, впереди — маленький чемодан
    body = (
      <g>
        <path d="M -44 42 L -9 -34 L 9 -34 L 30 42 Z" fill={fill(C.road)} {...common} />
        {[30, 10, -10, -26].map((yy, j) => (
          <path key={j} d={`M ${-3 + yy * -0.06} ${yy + 6} L ${-2 + yy * -0.06} ${yy - 2}`} stroke={line ?? C.paper} strokeWidth={w * (1.2 - j * 0.2)} strokeLinecap="round" />
        ))}
        <path d="M 22 4 Q 30 -6 38 4" fill="none" {...common} />
        <rect x={14} y={4} width={32} height={36} rx={6} fill={fill(C.suitcase)} {...common} />
        <path d="M 22 14 L 38 14" stroke={line ?? C.suitcaseLight} strokeWidth={w * 0.8} strokeLinecap="round" />
      </g>
    );
  } else if (i === 1) {
    // кафедра с микрофоном
    body = (
      <g>
        <path d="M -30 -4 L 26 -4 L 18 42 L -22 42 Z" fill={fill(C.woodLight)} {...common} />
        <path d="M -36 -12 L 32 -12 L 26 -2 L -30 -2 Z" fill={fill(C.wood)} {...common} />
        <path d="M 8 -12 Q 10 -28 -2 -36" fill="none" {...common} />
        <ellipse cx={-6} cy={-38} rx={8} ry={6} transform="rotate(-30 -6 -38)" fill={fill(C.ink)} {...common} />
        <path d="M 16 -40 Q 24 -34 22 -24 M 24 -46 Q 36 -36 32 -20" fill="none" stroke={st} strokeWidth={w * 0.8} strokeLinecap="round" opacity={0.8} />
        <rect x={-10} y={10} width={16} height={10} rx={3} fill={fill(C.yellow)} {...common} strokeWidth={w * 0.7} />
      </g>
    );
  } else {
    // трое за столом
    const person = (px: number, py: number, col: string, key: string) => (
      <g key={key}>
        <path d={`M ${px - 15} ${py + 22} Q ${px - 15} ${py + 4} ${px} ${py + 4} Q ${px + 15} ${py + 4} ${px + 15} ${py + 22} Z`} fill={fill(col)} {...common} />
        <circle cx={px} cy={py - 6} r={9} fill={fill("#E6B590")} {...common} />
      </g>
    );
    body = (
      <g>
        {person(-28, -6, "#8FA58A", "a")}
        {person(0, -18, C.lanyard, "b")}
        {person(28, -6, "#C98B6B", "c")}
        <ellipse cx={0} cy={24} rx={44} ry={15} fill={fill(C.woodLight)} {...common} />
        <rect x={-10} y={18} width={16} height={10} rx={2} fill={fill(C.paper)} {...common} strokeWidth={w * 0.6} transform="rotate(-8 -2 23)" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={o}>
      {body}
    </g>
  );
};

// ---------- маленький рисунок зала (на приглашении) ----------
const HallMini: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly ink: number }> = ({ x, y, w, h, ink }) => {
  const cx = x + w / 2;
  return (
    <g>
      <path d={roughRect(x, y, w, h, 8, 77, ink * 0.4)} fill="#EEF3F5" stroke={C.ink} strokeWidth={ink * 0.7} />
      {/* сцена */}
      <path d={`M ${x + w * 0.16} ${y + h * 0.1} L ${x + w * 0.84} ${y + h * 0.1} L ${x + w * 0.84} ${y + h * 0.3} Q ${cx} ${y + h * 0.42} ${x + w * 0.16} ${y + h * 0.3} Z`} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink * 0.6} strokeLinejoin="round" />
      <rect x={cx - w * 0.04} y={y + h * 0.15} width={w * 0.08} height={h * 0.1} rx={2} fill={C.wood} stroke={C.ink} strokeWidth={ink * 0.5} />
      {/* ряды полукругом */}
      {[0, 1, 2].map((r) => {
        const ry = y + h * (0.55 + r * 0.15);
        const n = 6 + r;
        return Array.from({ length: n }, (_, j) => {
          const u = (j + 0.5) / n - 0.5;
          const sx = cx + u * w * (0.62 + r * 0.1);
          const sy = ry - Math.cos(u * Math.PI) * h * 0.05;
          return <rect key={`${r}-${j}`} x={sx - w * 0.028} y={sy - h * 0.045} width={w * 0.056} height={h * 0.08} rx={2} fill={C.green} stroke={C.ink} strokeWidth={ink * 0.4} />;
        });
      })}
    </g>
  );
};

// Содержимое лицевой стороны в координатах листа (0…w, 0…h).
const InviteFace: React.FC<{ readonly w: number; readonly h: number; readonly ink: number; readonly hiLine: number; readonly hiRole: number }> = ({ w, h, ink, hiLine, hiRole }) => {
  const u = w / 580;
  const left = 42 * u;
  const lineW = 386 * u;
  const roleW = 236 * u;
  return (
    <g>
      {/* уголок-орнамент */}
      <path d={`M ${w - 70 * u} ${14 * u} L ${w - 14 * u} ${14 * u} L ${w - 14 * u} ${70 * u}`} fill="none" stroke={C.folderShade} strokeWidth={ink * 0.9} strokeLinecap="round" />
      <path d={`M ${14 * u} ${h - 70 * u} L ${14 * u} ${h - 14 * u} L ${70 * u} ${h - 14 * u}`} fill="none" stroke={C.folderShade} strokeWidth={ink * 0.9} strokeLinecap="round" />
      <text x={left} y={96 * u} fontFamily={FONT} fontWeight={900} fontSize={68 * u} letterSpacing={3 * u} fill={C.ink}>
        {T.title}
      </text>
      <path d={`M ${left} ${118 * u} L ${left + 150 * u} ${118 * u}`} stroke={C.yellowDeep} strokeWidth={6 * u} strokeLinecap="round" />
      {/* маркер под строкой */}
      {hiLine > 0 ? <rect x={left - 8 * u} y={152 * u} width={(lineW + 16 * u) * clamp(hiLine)} height={30 * u} rx={8 * u} fill={C.yellowSoft} /> : null}
      <text x={left} y={176 * u} fontFamily={FONT} fontWeight={800} fontSize={30 * u} fill={C.inkSoft}>
        {T.line}
      </text>
      {/* роль: значок кафедры и «Баяндамачы» */}
      {hiRole > 0 ? <rect x={left - 8 * u} y={220 * u} width={(roleW + 70 * u) * clamp(hiRole)} height={50 * u} rx={12 * u} fill={C.yellowSoft} /> : null}
      <DayIcon i={1} x={left + 22 * u} y={246 * u} s={44 * u} ink={ink * 0.8} />
      <text x={left + 56 * u} y={258 * u} fontFamily={FONT} fontWeight={900} fontSize={36 * u} fill={C.ink}>
        {T.role}
      </text>
      {/* плашка «3 күн» */}
      <path d={roughRect(left, 300 * u, 120 * u, 50 * u, 12 * u, 83, ink * 0.3)} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.7} />
      <rect x={left + 14 * u} y={312 * u} width={26 * u} height={26 * u} rx={4 * u} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.6} />
      <rect x={left + 14 * u} y={312 * u} width={26 * u} height={8 * u} rx={3 * u} fill={C.yellow} stroke={C.ink} strokeWidth={ink * 0.6} />
      <text x={left + 50 * u} y={335 * u} fontFamily={FONT} fontWeight={900} fontSize={24 * u} fill={C.ink}>
        {T.days}
      </text>
      <HallMini x={w - 210 * u} y={h - 184 * u} w={168 * u} h={150 * u} ink={ink} />
    </g>
  );
};

// Лист приглашения: x, y — левый верхний угол; w — ширина (h = 0,69·w).
export const InviteSheet: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly ink: number;
  readonly hiLine?: number;
  readonly hiRole?: number;
  readonly back?: boolean;
  readonly seed?: number;
}> = ({ x, y, w, ink, hiLine = 0, hiRole = 0, back = false, seed = 71 }) => {
  const h = w * INVITE_RATIO;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={roughRect(0, 0, w, h, 8, seed, ink * 0.45)} fill={back ? "#FBF6EA" : C.paper} stroke={C.ink} strokeWidth={ink} />
      {back ? (
        <g opacity={0.07}>
          <InviteFace w={w} h={h} ink={ink} hiLine={0} hiRole={0} />
        </g>
      ) : (
        <InviteFace w={w} h={h} ink={ink} hiLine={hiLine} hiRole={hiRole} />
      )}
    </g>
  );
};

// ---------- эскиз зала (лист под приглашением) ----------
export const HallSketch: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly ink: number; readonly uid: string }> = ({ x, y, w, h, ink, uid }) => {
  const cx = x + w / 2;
  const pencil = C.inkSoft;
  const step = w / 22;
  return (
    <g>
      <path d={roughRect(x, y, w, h, 6, 91, ink * 0.4)} fill="#FDFBF3" stroke={C.ink} strokeWidth={ink} />
      <clipPath id={`${uid}-grid`}>
        <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} />
      </clipPath>
      <g clipPath={`url(#${uid}-grid)`} opacity={0.5}>
        {Array.from({ length: 24 }, (_, i) => (
          <line key={`v${i}`} x1={x + i * step} y1={y} x2={x + i * step} y2={y + h} stroke="#B9CFE0" strokeWidth={1.2} />
        ))}
        {Array.from({ length: Math.ceil(h / step) + 1 }, (_, i) => (
          <line key={`h${i}`} x1={x} y1={y + i * step} x2={x + w} y2={y + i * step} stroke="#B9CFE0" strokeWidth={1.2} />
        ))}
      </g>
      {/* контур зала */}
      <path d={roughPath([[x + w * 0.1, y + h * 0.1], [x + w * 0.9, y + h * 0.1], [x + w * 0.94, y + h * 0.9], [x + w * 0.06, y + h * 0.9]], 93, 2.4, true)} fill="none" stroke={pencil} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      {/* сцена с кафедрой */}
      <path d={`M ${x + w * 0.26} ${y + h * 0.1} L ${x + w * 0.26} ${y + h * 0.24} Q ${cx} ${y + h * 0.36} ${x + w * 0.74} ${y + h * 0.24} L ${x + w * 0.74} ${y + h * 0.1}`} fill="rgba(245,198,66,0.35)" stroke={pencil} strokeWidth={ink * 0.8} />
      <rect x={cx - w * 0.03} y={y + h * 0.15} width={w * 0.06} height={h * 0.06} rx={3} fill="none" stroke={pencil} strokeWidth={ink * 0.7} />
      <circle cx={cx} cy={y + h * 0.125} r={w * 0.012} fill={pencil} />
      {/* ряды */}
      {/* ряды кресел полукругом, проход посередине */}
      {[0, 1, 2, 3, 4].map((r) => {
        const yy = y + h * (0.44 + r * 0.095);
        const n = 4 + Math.floor(r / 2);
        const span = w * (0.25 + r * 0.03);
        return Array.from({ length: n * 2 }, (_, j) => {
          const side = j < n ? -1 : 1;
          const k = j % n;
          const u = (k + 0.5) / n; // 0…1 от прохода к краю
          const sx = cx + side * (w * 0.05 + u * span);
          const sy = yy - u * u * h * 0.05;
          const sw = w * 0.034;
          return <rect key={`${r}-${j}`} x={sx - sw / 2} y={sy - h * 0.03} width={sw} height={h * 0.05} rx={sw * 0.3} fill={r === 0 && k < 2 ? "rgba(245,198,66,0.45)" : "none"} stroke={pencil} strokeWidth={ink * 0.6} transform={`rotate(${side * u * 14} ${sx} ${sy})`} />;
        });
      })}
      {/* стрелка-вход внизу */}
      <path d={`M ${x + w * 0.84} ${y + h * 0.84} L ${x + w * 0.84} ${y + h * 0.74} M ${x + w * 0.81} ${y + h * 0.77} L ${x + w * 0.84} ${y + h * 0.74} L ${x + w * 0.87} ${y + h * 0.77}`} fill="none" stroke={pencil} strokeWidth={ink * 0.7} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

// ---------- карточка дня поездки ----------
// (cx, cy) — центр; w — ширина (h = 1,18·w); i — день 0…2.
export const TripDayCard: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly i: number;
  readonly ink: number;
  readonly lift?: number;
  readonly rot?: number;
  readonly opacity?: number;
}> = ({ cx, cy, w, i, ink, lift = 0, rot = 0, opacity = 1 }) => {
  const h = w * CARD_RATIO;
  const d = SD2_TEXT.tripDays[i];
  const s = 1 + lift * 0.07;
  const x = -w / 2;
  const y = -h / 2;
  const u = w / 220;
  return (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity}>
      {/* тень: при подъёме смещается и светлеет */}
      <rect x={x + 6 + lift * 18} y={y + 9 + lift * 24} width={w} height={h} rx={12 * u} fill={C.shadow} opacity={1 - lift * 0.45} />
      <g transform={`rotate(${rot}) scale(${s})`}>
        <path d={roughRect(x, y, w, h, 12 * u, 101 + i * 7, ink * 0.45)} fill={C.paper} stroke={C.ink} strokeWidth={ink} />
        {/* номер дня */}
        <path d={roughRect(x + 16 * u, y + 16 * u, 92 * u, 38 * u, 10 * u, 111 + i, ink * 0.3)} fill={C.yellowSoft} stroke={C.ink} strokeWidth={ink * 0.6} />
        <text x={x + 62 * u} y={y + 44 * u} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24 * u} fill={C.ink}>
          {d.day}
        </text>
        <DayIcon i={i} x={0} y={y + h * 0.5} s={104 * u} ink={ink * 0.8} />
        <text x={0} y={y + h - 26 * u} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={(i === 1 ? 30 : 34) * u} fill={C.ink}>
          {d.label}
        </text>
      </g>
    </g>
  );
};
