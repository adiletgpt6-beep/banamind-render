// Рабочая папка выступления — охристо-жёлтая, с тёмным корешком слева,
// белой наклейкой и резинкой на углу. Одна и та же во всех сценах: при
// первом сомнении (S01), в окончательной упаковке (S08), на кафедре (S10),
// дома (S15). Отличается от серо-синего чемодана и бирюзового рюкзака.
//  • FolderTop — лежит, вид сверху (cx, cy — центр; rot — поворот, °).
//    open: 0 — закрыта, 1 — раскрыта (обложка поворачивается вокруг
//    корешка; внутри — нейтральные рабочие схемы, без конкретной профессии).
//  • FolderFlat — лежит на столе, вид спереди чуть сверху.
//  • FolderHeld — в руке вертикально (вид спереди), (cx, cy) — центр.
import { C } from "../theme";
import { roughRect } from "../kit";
import { clamp } from "../rig/motion";

// Внутренние листы: простая схема проекта (блоки и стрелки) и столбики.
const Pages: React.FC<{ x: number; y: number; w: number; h: number; ink: number; side: "left" | "right" }> = ({ x, y, w, h, ink, side }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={6} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.8} />
    {side === "left" ? (
      <g>
        {/* три блока со стрелками */}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={x + w * 0.12} y={y + h * (0.12 + k * 0.28)} width={w * 0.34} height={h * 0.16} rx={6} fill={k === 1 ? C.yellowSoft : "#DCE6EE"} stroke={C.ink} strokeWidth={ink * 0.6} />
        ))}
        {[0, 1].map((k) => (
          <path key={k} d={`M ${x + w * 0.29} ${y + h * (0.28 + k * 0.28)} L ${x + w * 0.29} ${y + h * (0.4 + k * 0.28)}`} stroke={C.ink} strokeWidth={ink * 0.7} />
        ))}
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M ${x + w * 0.56} ${y + h * (0.18 + k * 0.18)} L ${x + w * (0.82 - (k % 2) * 0.12)} ${y + h * (0.18 + k * 0.18)}`} stroke={C.inkSoft} strokeWidth={ink * 0.8} opacity={0.6} strokeLinecap="round" />
        ))}
      </g>
    ) : (
      <g>
        {/* столбики и линия тренда */}
        {[0.35, 0.55, 0.45, 0.75].map((v, k) => (
          <rect key={k} x={x + w * (0.14 + k * 0.19)} y={y + h * (0.62 - v * 0.45)} width={w * 0.12} height={h * v * 0.45} fill={k === 3 ? C.yellow : C.green} stroke={C.ink} strokeWidth={ink * 0.6} />
        ))}
        <path d={`M ${x + w * 0.1} ${y + h * 0.64} L ${x + w * 0.9} ${y + h * 0.64}`} stroke={C.ink} strokeWidth={ink * 0.7} />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${x + w * 0.12} ${y + h * (0.74 + k * 0.08)} L ${x + w * (0.86 - k * 0.14)} ${y + h * (0.74 + k * 0.08)}`} stroke={C.inkSoft} strokeWidth={ink * 0.8} opacity={0.55} strokeLinecap="round" />
        ))}
      </g>
    )}
  </g>
);

export const FolderTop: React.FC<{
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly rot?: number;
  readonly open?: number;
  readonly ink: number;
  readonly seed?: number;
  readonly shadow?: number; // 0…1 высота над поверхностью (тень смещается)
}> = ({ cx, cy, w, h, rot = 0, open = 0, ink, seed = 21, shadow = 0 }) => {
  const x = -w / 2;
  const y = -h / 2;
  const o = clamp(open);
  const ang = o * Math.PI;
  const cw = w * Math.cos(ang); // проекция обложки (от корешка)
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <rect x={x + 6 + shadow * 26} y={y + 8 + shadow * 30} width={w} height={h} rx={10} fill={C.shadow} opacity={0.9 - shadow * 0.4} />
      {o > 0.01 ? (
        <g>
          {/* правая половина: задняя обложка и листы */}
          <path d={roughRect(x, y, w, h, 10, seed + 1, ink * 0.5)} fill={C.folderInside} stroke={C.ink} strokeWidth={ink} />
          <Pages x={x + 14} y={y + 14} w={w - 28} h={h - 28} ink={ink} side="right" />
        </g>
      ) : null}
      {o > 0.5 ? (
        <g>
          {/* левая половина: внутренняя сторона обложки и лист */}
          <path d={roughRect(x + cw, y, -cw, h, 10, seed + 2, ink * 0.5)} fill={C.folderInside} stroke={C.ink} strokeWidth={ink} />
          {-cw > w * 0.4 ? <Pages x={x + cw + 14} y={y + 14} w={-cw - 28} h={h - 28} ink={ink} side="left" /> : null}
        </g>
      ) : (
        <g>
          {/* обложка (сверху) */}
          <path d={roughRect(x, y, Math.max(2, cw), h, 10, seed, ink * 0.5)} fill={C.folder} stroke={C.ink} strokeWidth={ink} />
          {cw > w * 0.3 ? (
            <g>
              <rect x={x} y={y} width={Math.min(26, cw)} height={h} rx={8} fill={C.folderShade} stroke={C.ink} strokeWidth={ink * 0.7} />
              <rect x={x + cw * 0.36} y={y + h * 0.18} width={cw * 0.46} height={h * 0.14} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.6} />
              <path d={`M ${x + cw * 0.42} ${y + h * 0.25} L ${x + cw * 0.74} ${y + h * 0.25}`} stroke={C.inkSoft} strokeWidth={ink * 0.7} opacity={0.6} />
              {/* резинка на углу */}
              <path d={`M ${x + cw - 30} ${y} L ${x + cw} ${y + 30} M ${x + cw - 30} ${y + h} L ${x + cw} ${y + h - 30}`} stroke="#3B3F55" strokeWidth={ink * 1.6} strokeLinecap="round" />
            </g>
          ) : null}
        </g>
      )}
    </g>
  );
};

// Лежит на столе, вид спереди чуть сверху: (x, y) — передний левый угол.
export const FolderFlat: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly depth?: number; readonly ink: number }> = ({ x, y, w, depth = 0.22, ink }) => {
  const d = w * depth;
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + d * 0.5} ${y - d} L ${x + w + d * 0.5} ${y - d} L ${x + w} ${y} Z`} fill={C.folder} stroke={C.ink} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + 8} L ${x} ${y + 8} Z`} fill={C.folderShade} stroke={C.ink} strokeWidth={ink * 0.8} />
      <path d={`M ${x + w * 0.35 + d * 0.25} ${y - d * 0.55} L ${x + w * 0.7 + d * 0.25} ${y - d * 0.55}`} stroke={C.paper} strokeWidth={ink * 2.2} strokeLinecap="round" />
    </g>
  );
};

// В руке вертикально, вид спереди (корешок слева).
export const FolderHeld: React.FC<{ readonly cx: number; readonly cy: number; readonly w: number; readonly h: number; readonly rot?: number; readonly ink: number }> = ({ cx, cy, w, h, rot = 0, ink }) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <path d={roughRect(-w / 2, -h / 2, w, h, 8, 31, ink * 0.5)} fill={C.folder} stroke={C.ink} strokeWidth={ink} />
    <rect x={-w / 2} y={-h / 2} width={w * 0.12} height={h} rx={6} fill={C.folderShade} stroke={C.ink} strokeWidth={ink * 0.7} />
    <rect x={-w * 0.12} y={-h * 0.32} width={w * 0.44} height={h * 0.14} rx={4} fill={C.paper} stroke={C.ink} strokeWidth={ink * 0.6} />
  </g>
);
