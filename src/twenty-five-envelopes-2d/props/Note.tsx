// Записка из конверта «Эмир» — ОДИН лист во всех планах: тот же размер,
// линейки, почерк (Caveat) и положение строк. В финале к двум строкам
// благодарности дописывается третья — там, где проходит кончик ручки.
//
// Почерк: буквы слегка «гуляют» (детерминированный наклон и смещение по
// номеру буквы), поэтому строка выглядит рукописной и одинаково в первом
// и финальном крупном плане. Ширины букв измеряются в браузере
// (canvas.measureText) — по ним кончик ручки стоит у последней видимой
// буквы.
import { NOTE } from "../script";
import { C, F } from "../theme";
import { clamp, hash01 } from "../rig/motion";

// Размеры листа в собственных координатах (px), строки — по линейкам.
export const NOTE_W = 960;
export const NOTE_H = 620;
export const NOTE_LINE = { x0: 56, y0: 150, step: 128, size: 52 } as const;

const cache = new Map<string, number[]>();
let ctx: CanvasRenderingContext2D | null = null;
// Ширины префиксов строки: adv[i] — x после i-й буквы.
export const advances = (text: string, size: number = NOTE_LINE.size): number[] => {
  const key = `${size}|${text}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return [...text].map((_, i) => (i + 1) * size * 0.42);
  ctx = ctx ?? document.createElement("canvas").getContext("2d");
  if (!ctx) return [...text].map((_, i) => (i + 1) * size * 0.42);
  ctx.font = `600 ${size}px "${F.hand}"`;
  const out = [...text].map((_, i) => ctx!.measureText([...text].slice(0, i + 1).join("")).width);
  cache.set(key, out);
  return out;
};

// Строка почерком: chars — сколько букв уже видно (дробная часть — буква
// проявляется слева направо под пером).
export const HandLine: React.FC<{ readonly text: string; readonly x: number; readonly y: number; readonly size?: number; readonly seed?: number; readonly chars?: number }> = ({
  text,
  x,
  y,
  size = NOTE_LINE.size as number,
  seed = 1,
  chars = Infinity,
}) => {
  const adv = advances(text, size);
  const letters = [...text];
  return (
    <>
      {letters.map((ch, i) => {
        const k = clamp(chars - i);
        if (k <= 0) return null;
        const x0 = i ? adv[i - 1] : 0;
        const w = adv[i] - x0;
        const rot = (hash01(seed * 31 + i * 7.13) - 0.5) * 6;
        const dy = (hash01(seed * 17 + i * 3.71) - 0.5) * size * 0.06 - (i / Math.max(1, letters.length)) * size * 0.05;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + x0,
              top: y - size * 0.82 + dy,
              width: w + 2,
              height: size * 1.25,
              overflow: "hidden",
              clipPath: k < 1 ? `inset(0 ${(1 - k) * 100}% 0 0)` : undefined,
            }}
          >
            <span style={{ display: "inline-block", fontFamily: F.hand, fontWeight: 600, fontSize: size, lineHeight: 1.25, color: C.pencil, transform: `rotate(${rot}deg)`, transformOrigin: "50% 80%", whiteSpace: "pre" }}>{ch}</span>
          </div>
        );
      })}
    </>
  );
};

// Точка кончика пера для строки и числа видимых букв (координаты листа).
export const penTipAt = (text: string, x: number, y: number, chars: number, size: number = NOTE_LINE.size) => {
  const adv = advances(text, size);
  const n = adv.length;
  const i = Math.max(0, Math.min(n - 1, Math.floor(chars)));
  const x0 = i ? adv[i - 1] : 0;
  const w = adv[i] - x0;
  const fr = clamp(chars - i);
  // перо ходит вверх-вниз внутри буквы (штрихи), а не только вправо
  const wob = Math.sin(chars * Math.PI * 2.6) * size * 0.16;
  return { x: x + x0 + w * fr, y: y - size * 0.22 + wob, done: chars >= n };
};

// Лист записки. added — сколько букв третьей строки видно (0 — нет строки).
export const NoteSheet: React.FC<{ readonly added?: number; readonly fold?: number; readonly children?: React.ReactNode }> = ({ added = 0, fold = 0, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: NOTE_W, height: NOTE_H, backgroundColor: C.noteSheet, borderRadius: 10, boxShadow: "0 10px 26px rgba(40,28,14,0.22)", overflow: "hidden" }}>
    {/* лёгкая фактура бумаги: неподвижная, не мерцает */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(120,100,70,0.05) 1px, transparent 1.5px)", backgroundSize: "9px 9px" }} />
    {[0, 1, 2, 3].map((k) => (
      <div key={k} style={{ position: "absolute", left: 40, right: 40, top: NOTE_LINE.y0 + k * NOTE_LINE.step + 14, height: 3, backgroundColor: C.noteRule }} />
    ))}
    <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 3, backgroundColor: "rgba(224,138,120,0.45)" }} />
    {/* линия сгиба: записка была сложена пополам в конверте */}
    <div style={{ position: "absolute", left: 0, right: 0, top: NOTE_H / 2 - 1, height: 2, backgroundColor: "rgba(150,130,100,0.18)", opacity: 1 - fold }} />
    <HandLine text={NOTE.lines[0]} x={NOTE_LINE.x0} y={NOTE_LINE.y0} seed={3} />
    <HandLine text={NOTE.lines[1]} x={NOTE_LINE.x0} y={NOTE_LINE.y0 + NOTE_LINE.step} seed={5} />
    {added > 0 ? <HandLine text={NOTE.added} x={NOTE_LINE.x0} y={NOTE_LINE.y0 + NOTE_LINE.step * 2 + 40} seed={7} chars={added} /> : null}
    {children}
  </div>
);
export const ADDED_LINE = { x: NOTE_LINE.x0, y: NOTE_LINE.y0 + NOTE_LINE.step * 2 + 40 } as const;

// Ручка: тёмно-синий корпус с жёлтым колпачком на заднем конце. tip —
// кончик (контакт с листом), angle — наклон (градусы от вертикали).
export const Pen: React.FC<{ readonly x: number; readonly y: number; readonly angle?: number; readonly len?: number; readonly lift?: number }> = ({ x, y, angle = 32, len = 300, lift = 0 }) => (
  <g transform={`translate(${x} ${y - lift}) rotate(${angle})`}>
    {lift > 2 ? <ellipse cx={0} cy={lift} rx={10} ry={4} fill="rgba(40,28,14,0.18)" transform={`rotate(${-angle} 0 ${lift})`} /> : null}
    <path d={`M 0 0 L -7 -26 L 7 -26 Z`} fill="#C9B79A" />
    <path d={`M -1.5 -2 L 0 0 L 1.5 -2 Z`} fill={C.pencil} />
    <rect x={-11} y={-len} width={22} height={len - 24} rx={10} fill={C.navy} />
    <rect x={-12} y={-len} width={24} height={64} rx={11} fill={C.yellow} />
    <rect x={6} y={-len + 20} width={5} height={110} rx={2.5} fill={C.yellowDeep} />
  </g>
);

// Детский рисунок Аяна из конверта «Бекзат»: он и Эмир на школьной
// площадке (горка, мяч, школа с флажком). Намеренно простые формы, цвета
// одежды узнаются: Аян — жёлтый, хохолок; Эмир — зелёный, очки.
export const DRAW_W = 960;
export const DRAW_H = 683;
export const KidDrawing: React.FC = () => {
  const crayon = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const kid = (x: number, body: string, glasses: boolean, tuft: boolean, label: string) => (
    <g>
      <circle cx={x} cy={300} r={46} fill="#F2C9A4" stroke="#8A5A3C" strokeWidth={5} />
      <path d={`M ${x - 44} ${290} Q ${x} ${236} ${x + 44} ${290}`} fill={glasses ? "#6B4A3A" : "#2A1F1C"} stroke={glasses ? "#6B4A3A" : "#2A1F1C"} strokeWidth={6} />
      {tuft ? <path d={`M ${x + 2} 262 q 10 -34 34 -26 q -18 6 -12 30`} fill="#2A1F1C" stroke="#2A1F1C" strokeWidth={5} {...crayon} /> : null}
      <circle cx={x - 16} cy={300} r={5} fill="#1E2235" />
      <circle cx={x + 16} cy={300} r={5} fill="#1E2235" />
      {glasses ? (
        <g fill="none" stroke="#2E3D5C" strokeWidth={4}>
          <circle cx={x - 16} cy={300} r={14} />
          <circle cx={x + 16} cy={300} r={14} />
          <line x1={x - 2} y1={298} x2={x + 2} y2={298} />
        </g>
      ) : null}
      <path d={`M ${x - 16} ${322} Q ${x} ${336} ${x + 16} ${322}`} stroke="#B5655F" strokeWidth={5} fill="none" {...crayon} />
      <path d={`M ${x - 48} 352 L ${x + 48} 352 L ${x + 56} 470 L ${x - 56} 470 Z`} fill={body} stroke="#5A4630" strokeWidth={4} {...crayon} />
      <path d={`M ${x - 26} 470 L ${x - 34} 550 M ${x + 26} 470 L ${x + 34} 550`} stroke="#2F3B5C" strokeWidth={16} {...crayon} />
      <text x={x} y={600} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={44} fill={C.pencil}>
        {label}
      </text>
    </g>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: DRAW_W, height: DRAW_H, backgroundColor: "#FFFFFF", borderRadius: 10, boxShadow: "0 10px 26px rgba(40,28,14,0.22)", overflow: "hidden" }}>
      <svg width={DRAW_W} height={DRAW_H} viewBox="0 0 900 640" style={{ position: "absolute", left: 0, top: 0 }}>
        {/* небо штриховкой, солнце, трава */}
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M ${-20 + i * 110} 30 l 130 70`} stroke="#9FD0F0" strokeWidth={22} opacity={0.55} strokeLinecap="round" />
        ))}
        <circle cx={790} cy={90} r={52} fill={C.yellow} stroke="#E8A70E" strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const a = (i * Math.PI) / 4;
          return <line key={i} x1={790 + Math.cos(a) * 66} y1={90 + Math.sin(a) * 66} x2={790 + Math.cos(a) * 92} y2={90 + Math.sin(a) * 92} stroke="#E8A70E" strokeWidth={6} strokeLinecap="round" />;
        })}
        <path d="M 0 520 Q 200 500 450 525 T 900 515 L 900 640 L 0 640 Z" fill="#8CCB6E" />
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M ${20 + i * 64} 560 l 8 -26 l 8 26`} stroke="#5FA347" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {/* школа с флажком */}
        <rect x={40} y={210} width={190} height={310} fill="#F3B7A8" stroke="#8A5A3C" strokeWidth={5} />
        <path d="M 30 214 L 135 140 L 240 214 Z" fill="#E08A78" stroke="#8A5A3C" strokeWidth={5} strokeLinejoin="round" />
        {[0, 1].map((r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={70 + c * 80} y={250 + r * 90} width={50} height={50} fill="#BFE3F7" stroke="#8A5A3C" strokeWidth={4} />))}
        <rect x={108} y={430} width={54} height={90} fill="#8A5A3C" />
        <line x1={135} y1={140} x2={135} y2={80} stroke="#5A4630" strokeWidth={5} />
        <path d="M 135 80 L 180 94 L 135 108 Z" fill={C.coral} />
        <text x={135} y={200} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={34} fill="#8A5A3C">
          Мектеп
        </text>
        {/* горка */}
        <path d="M 720 520 L 720 330 L 760 330 L 760 520" stroke="#5B8DD6" strokeWidth={10} fill="none" {...crayon} />
        <path d="M 760 335 Q 820 420 880 515" stroke="#E08A78" strokeWidth={22} fill="none" {...crayon} />
        {[360, 400, 440, 480].map((y) => <line key={y} x1={720} y1={y} x2={760} y2={y} stroke="#5B8DD6" strokeWidth={6} />)}
        {/* мяч */}
        <circle cx={460} cy={505} r={30} fill="#FFFFFF" stroke="#E08A78" strokeWidth={6} />
        <path d="M 432 500 Q 460 486 488 500" stroke="#E08A78" strokeWidth={5} fill="none" />
        {/* двое мальчиков держатся за руки */}
        {kid(370, C.yellow, false, true, "Мен")}
        {kid(560, "#4FA36B", true, false, "Эмир")}
        <path d="M 418 390 Q 465 410 512 390" stroke="#F2C9A4" strokeWidth={14} fill="none" {...crayon} />
      </svg>
    </div>
  );
};
