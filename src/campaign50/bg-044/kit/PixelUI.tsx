// Игровой интерфейс BG-044 (пиксельные «ступенчатые» углы, контур бренда):
//   PixelPanel  — панель: рамка, заливка, тень со сдвигом;
//   PixelButton — кнопка с 3D-кромкой: pressed (вдавлена), disabled (серая),
//                 pulse 0…1 (мягкое «дыхание», без мигания);
//   PixelCursor — пиксельная рука-курсор (pressed — палец нажат);
//   PixelPopup  — окно сообщения: иконка + текст, пружинит по t 0…1;
//   PixelSlots  — N ячеек группы: заполненные — со спрайтом, пустые — пунктир.
// Координаты — пиксели кадра (absolute), x/y — левый верхний угол.
import { clamp, pop } from "../anim";
import { C } from "../palette";
import { steppedClip } from "./GameWorld";
import { pixelTextWidth } from "./pixelFont";
import { PixelText } from "./PixelText";
import { Sprite, spriteSize, type SpriteRows } from "./Sprite";
import { CURSOR, CURSOR_PRESSED } from "./sprites";

export const PixelPanel: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly fill?: string;
  readonly border?: string;
  readonly step?: number;
  readonly shadow?: number; // сдвиг тени, px
  readonly opacity?: number;
  readonly style?: React.CSSProperties;
  readonly children?: React.ReactNode;
}> = ({ x, y, w, h, fill = C.white, border = C.navy, step = 6, shadow = 10, opacity = 1, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity, ...style }}>
    {shadow ? <div style={{ position: "absolute", left: shadow, top: shadow, width: w, height: h, backgroundColor: "rgba(20,40,90,0.2)", clipPath: steppedClip(step) }} /> : null}
    <div style={{ position: "absolute", inset: 0, backgroundColor: border, clipPath: steppedClip(step) }} />
    <div style={{ position: "absolute", inset: step, backgroundColor: fill, clipPath: steppedClip(Math.max(2, step - 2)) }} />
    <div style={{ position: "absolute", inset: step }}>{children}</div>
  </div>
);

export const PixelButton: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly label: string;
  readonly px?: number;
  readonly pressed?: number; // 0…1
  readonly disabled?: number; // 0…1 — переход в серый
  readonly pulse?: number; // 0…1
  readonly fill?: string;
  readonly edge?: string;
  readonly color?: string;
  readonly opacity?: number;
  readonly rotate?: number;
}> = ({ x, y, w, h, label, px, pressed = 0, disabled = 0, pulse = 0, fill = C.yellow, edge = C.yellowDeep, color = C.navy, opacity = 1, rotate = 0 }) => {
  const depth = 14;
  const p = clamp(pressed);
  const d = clamp(disabled);
  const body = d > 0.5 ? "#DCE3EE" : fill;
  const bodyEdge = d > 0.5 ? "#B8C3D4" : edge;
  const txt = d > 0.5 ? C.muted : color;
  const tpx = px ?? Math.max(4, Math.min(9, Math.floor((w - 60) / Math.max(1, pixelTextWidth(label)))));
  const s = 1 + 0.035 * pulse * (1 - d);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h + depth, opacity, transform: `rotate(${rotate}deg) scale(${s})`, transformOrigin: "50% 60%" }}>
      <div style={{ position: "absolute", left: 10, top: 14, width: w, height: h + depth, backgroundColor: "rgba(20,40,90,0.18)", clipPath: steppedClip(7) }} />
      <div style={{ position: "absolute", left: 0, top: depth * p, width: w, height: h + depth * (1 - p), backgroundColor: C.navy, clipPath: steppedClip(7) }} />
      <div style={{ position: "absolute", left: 7, top: depth * p + 7, width: w - 14, height: h + depth * (1 - p) - 14, backgroundColor: bodyEdge, clipPath: steppedClip(4) }} />
      <div style={{ position: "absolute", left: 7, top: depth * p + 7, width: w - 14, height: h - 14, backgroundColor: body, clipPath: steppedClip(4) }} />
      {/* блик */}
      <div style={{ position: "absolute", left: 20, top: depth * p + 16, width: w - 40, height: 8, backgroundColor: "rgba(255,255,255,0.55)" }} />
      <PixelText text={label} px={tpx} x={w / 2} y={depth * p + h / 2 - 3.5 * tpx} align="center" color={txt} />
    </div>
  );
};

export const PixelCursor: React.FC<{ readonly x: number; readonly y: number; readonly px?: number; readonly pressed?: boolean; readonly opacity?: number }> = ({
  x,
  y,
  px = 9,
  pressed = false,
  opacity = 1,
}) => {
  // (x, y) — кончик указательного пальца
  const rows = pressed ? CURSOR_PRESSED : CURSOR;
  const tipCol = rows[0].indexOf("K") >= 0 ? rows[0].indexOf("K") + 1 : 3;
  return <Sprite rows={rows} px={px} x={x - tipCol * px} y={y} opacity={opacity} style={{ zIndex: 45 }} />;
};

export const PixelPopup: React.FC<{
  readonly cx: number; // центр по x
  readonly y: number;
  readonly w: number;
  readonly t: number; // 0…1 появление
  readonly text: string;
  readonly px?: number;
  readonly icon?: SpriteRows;
  readonly iconPx?: number;
  readonly fill?: string;
  readonly border?: string;
  readonly color?: string;
}> = ({ cx, y, w, t, text, px = 7, icon, iconPx = 8, fill = C.white, border = C.navy, color = C.navy }) => {
  if (t <= 0) return null;
  const k = pop(clamp(t));
  const words = text.split(" ");
  // перенос пиксельного текста по ширине
  const lines: string[] = [];
  const iconW = icon ? spriteSize(icon, iconPx).width + 26 : 0;
  const maxW = w - 70 - iconW;
  for (const wd of words) {
    const cur = lines[lines.length - 1];
    if (cur && pixelTextWidth(`${cur} ${wd}`) * px <= maxW) lines[lines.length - 1] = `${cur} ${wd}`;
    else lines.push(wd);
  }
  const lineH = 10 * px;
  const h = Math.max(lines.length * lineH + 50, icon ? spriteSize(icon, iconPx).height + 50 : 0);
  return (
    <div style={{ position: "absolute", left: cx - w / 2, top: y, width: w, height: h, transform: `scale(${0.4 + 0.6 * k})`, transformOrigin: "50% 100%", opacity: clamp(t * 5), zIndex: 44 }}>
      <PixelPanel x={0} y={0} w={w} h={h} fill={fill} border={border} step={7} shadow={12}>
        {icon ? <Sprite rows={icon} px={iconPx} x={22} y={(h - 14 - spriteSize(icon, iconPx).height) / 2} /> : null}
        {lines.map((ln, i) => (
          <PixelText key={i} text={ln} px={px} x={22 + iconW + maxW / 2} y={(h - 14 - lines.length * lineH) / 2 + i * lineH + 2 * px} align="center" color={color} />
        ))}
      </PixelPanel>
    </div>
  );
};

export const PixelSlots: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly slots: number;
  readonly size?: number;
  readonly gap?: number;
  readonly filled: readonly (SpriteRows | null)[];
  readonly fillT?: readonly number[]; // появление каждой заполненной ячейки 0…1
  readonly tokenPx?: number;
}> = ({ x, y, slots, size = 120, gap = 22, filled, fillT = [], tokenPx = 9 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: slots * size + (slots - 1) * gap, height: size }}>
    {Array.from({ length: slots }, (_, i) => {
      const tok = filled[i] ?? null;
      const t = tok ? clamp(fillT[i] ?? 1) : 0;
      const left = i * (size + gap);
      return (
        <div key={i} style={{ position: "absolute", left, top: 0, width: size, height: size }}>
          {/* пустая ячейка — пунктир */}
          <div style={{ position: "absolute", inset: 0, border: `5px dashed ${C.muted}`, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.55)" }} />
          {tok && t > 0 ? (
            <div style={{ position: "absolute", inset: 0, transform: `scale(${0.3 + 0.7 * pop(t)})`, opacity: clamp(t * 4) }}>
              <PixelPanel x={0} y={0} w={size} h={size} fill={C.yellowSoft} border={C.navy} step={5} shadow={0} />
              <Sprite rows={tok} px={tokenPx} x={(size - spriteSize(tok, tokenPx).width) / 2} y={(size - spriteSize(tok, tokenPx).height) / 2} />
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);
