// Ноутбук папы. Во фронтальном плане зритель видит наружную крышку (без
// изображения экрана); шарнир — у ближнего к зрителю края основания, экран
// повернут к папе. Закрытие: крышка поворачивается вокруг шарнира на
// клавиатуру (проекция крышки сжимается до тонкой пластины).
// Отдельный план со стороны папы — LaptopScreen (экран, клавиатура, тачпад).
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

// План со стороны мамы (через плечо): экран в рамке с веб-камерой в
// верхней рамке (смотрит на маму), клавиатура и тачпад в перспективе.
// children — содержимое экрана в мире SCREEN (1280 × 800).
export const LAPTOP_VIEW = { bezel: 26, keysH: 0.42 } as const;
export const LaptopScreenView: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly children: React.ReactNode; readonly camOn?: boolean }> = ({ x, y, w, children, camOn = true }) => {
  const sh = w * 0.625;
  const bz = LAPTOP_VIEW.bezel;
  const k = (w - 2 * bz) / 1280;
  const baseH = w * LAPTOP_VIEW.keysH;
  return (
    <div style={box({ left: 0, top: 0 })}>
      {/* крышка с экраном */}
      <div style={box({ left: x - w / 2, top: y - sh, width: w, height: sh, borderRadius: 22, backgroundColor: "#22262E" })} />
      <div style={box({ left: x - w / 2 + bz, top: y - sh + bz + 8, width: w - 2 * bz, height: 800 * k, overflow: "hidden", borderRadius: 6 })}>
        <div style={box({ left: 0, top: 0, width: 1280, height: 800, transform: `scale(${k})`, transformOrigin: "0 0" })}>{children}</div>
      </div>
      {/* веб-камера в верхней рамке, зелёный огонёк — камера включена */}
      <div style={box({ left: x - 9, top: y - sh + 9, width: 18, height: 18, borderRadius: 9, backgroundColor: "#0D0F13", border: "3px solid #3A3F4A", boxSizing: "border-box" })} />
      {camOn ? <div style={box({ left: x + 16, top: y - sh + 14, width: 8, height: 8, borderRadius: 4, backgroundColor: "#5FD38A" })} /> : null}
      {/* основание: клавиатура и тачпад (вид сверху-сзади, через плечо) */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2 + 50} ${y + baseH} L ${x - w / 2 - 50} ${y + baseH} Z`} fill="#BFC4CC" />
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 12 }).map((__, c) => {
            const t = (r + 0.5) / 5.5;
            const left = x - w / 2 - 50 * t + 26;
            const width = w + 100 * t - 52;
            return <rect key={`${r}-${c}`} x={left + (c * width) / 12 + 3} y={y + 16 + r * (baseH * 0.13)} width={width / 12 - 7} height={baseH * 0.1} rx={5} fill="#555B66" />;
          }),
        )}
        <rect x={x - w * 0.15} y={y + baseH * 0.6} width={w * 0.3} height={baseH * 0.3} rx={12} fill="#A9AFB9" />
      </svg>
    </div>
  );
};

export const TOUCHPAD = (x: number, y: number, w: number) => ({ x, y: y + w * LAPTOP_VIEW.keysH * 0.75 });
