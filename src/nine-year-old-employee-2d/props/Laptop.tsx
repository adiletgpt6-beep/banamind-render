// Ноутбук папы. Во фронтальном плане зритель видит наружную крышку (без
// изображения экрана); шарнир — у ближнего к зрителю края основания, экран
// повернут к папе. Закрытие: крышка поворачивается вокруг шарнира на
// клавиатуру (проекция крышки сжимается до тонкой пластины).
// Отдельный план со стороны папы — LaptopScreen (экран, клавиатура, тачпад).
import { C } from "../theme";
import { box } from "../kit";
import { clamp } from "../rig/motion";

// x, y — середина шарнира (мир), w — ширина; open: 1 — открыт (≈ 105°), 0 — закрыт.
export const laptopLidTop = (x: number, y: number, w: number, open: number) => {
  const H = w * 0.64;
  const a = clamp(open);
  // видимая высота крышки: вертикальная проекция + небольшой взгляд сверху
  const ph = H * Math.sin((a * 105 * Math.PI) / 180) * 0.92 + 4;
  return { x, y: y - ph };
};

export const LaptopFront: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly open: number }> = ({ x, y, w, open }) => {
  const top = laptopLidTop(x, y, w, open);
  const ph = y - top.y;
  const baseH = w * 0.045;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* основание: передний торец и верхняя плоскость (видна, когда крышка закрыта) */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 - w * 0.03} ${y + baseH} L ${x - w / 2 + w * 0.03} ${y + baseH} Z`} fill="#8E949E" />
      {/* крышка: наружная сторона (матовая, без экрана) */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 - w * 0.02 * (1 - open)} ${top.y} L ${x - w / 2 + w * 0.02 * (1 - open)} ${top.y} Z`} fill="#B7BCC5" stroke="#8E949E" strokeWidth={3} />
      {ph > 20 ? <rect x={x - w * 0.04} y={top.y + ph * 0.42} width={w * 0.08} height={Math.max(2, ph * 0.12)} rx={4} fill="#A3A9B3" /> : null}
      {/* шарнир */}
      <rect x={x - w * 0.36} y={y - 5} width={w * 0.72} height={10} rx={5} fill="#7D838D" />
    </svg>
  );
};

// План со стороны папы: экран с рабочими строками (без читаемого текста),
// клавиатура и тачпад. typed — сколько строк уже набрано (0…n), done — 0…1
// галочка «готово».
export const LaptopScreen: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly typed: number; readonly done: number }> = ({ x, y, w, typed, done }) => {
  const sh = w * 0.6;
  const rows = [0.62, 0.48, 0.7, 0.4, 0.56];
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      {/* крышка с экраном */}
      <rect x={x - w / 2} y={y - sh} width={w} height={sh} rx={18} fill="#2B2F38" />
      <rect x={x - w / 2 + 16} y={y - sh + 16} width={w - 32} height={sh - 32} rx={8} fill="#F7F4EC" />
      <rect x={x - w / 2 + 16} y={y - sh + 16} width={w - 32} height={44} fill={C.blue} />
      {rows.map((r, i) => {
        const k = clamp(typed - i);
        return k > 0 ? <rect key={i} x={x - w / 2 + 50} y={y - sh + 92 + i * 52} width={(w - 120) * r * k} height={22} rx={11} fill={i === rows.length - 1 ? C.orange : "#3A3F4A"} opacity={0.85} /> : null;
      })}
      {done > 0 ? (
        <g opacity={done}>
          <circle cx={x + w / 2 - 90} cy={y - 90} r={40} fill="#3FAE6A" />
          <path d={`M ${x + w / 2 - 110} ${y - 90} l 14 14 l 26 -28`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
      {/* основание: клавиатура и тачпад (вид сверху-спереди) */}
      <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 + 40} ${y + w * 0.42} L ${x - w / 2 - 40} ${y + w * 0.42} Z`} fill="#C3C8D0" />
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 12 }).map((__, c) => (
          <rect key={`${r}-${c}`} x={x - w / 2 + 24 + c * ((w - 48) / 12) - r * 6 + 2} y={y + 18 + r * 34} width={(w - 48) / 12 - 6} height={26} rx={5} fill="#5B616C" />
        )),
      )}
      <rect x={x - w * 0.16} y={y + 18 + 4 * 34 + 10} width={w * 0.32} height={w * 0.12} rx={10} fill="#AEB4BE" />
    </svg>
  );
};
