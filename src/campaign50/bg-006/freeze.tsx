// Драматургия стоп-кадра: изображение замирает, цвет уходит, короткая
// вспышка и «щелчок», жёлтое кольцо выделяет причину, надпись — вывод
// героини. Замороженный кадр сцена передаёт сама (рисует мир в кадре from).
import { fontFamily } from "../../fonts";
import { COLORS } from "../../config";
import { clamp, easeOut } from "./rig/motion";
import { box } from "./shots";

export const frozenAt = (f: number, from: number, to: number) => (f >= from && f < to ? from : f);

export const Freeze: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly ring?: { x: number; y: number; r: number };
  readonly label: string;
  readonly labelY?: number;
  readonly children: React.ReactNode;
}> = ({ f, from, to, ring, label, labelY = 300, children }) => {
  const on = f >= from && f < to;
  const t = f - from;
  const sat = on ? 1 - 0.75 * easeOut(t / 6) : 1;
  const zoom = on ? 1 + 0.035 * easeOut(t / 10) : 1;
  const flash = on ? Math.max(0, 1 - t / 5) * 0.55 : 0;
  const out = on ? clamp((to - f) / 6) : 0;
  const ringA = on ? easeOut((t - 4) / 8) * out : 0;
  const labelA = on ? easeOut((t - 8) / 8) * out : 0;
  return (
    <div style={box({ inset: 0, overflow: "hidden" })}>
      <div style={box({ inset: 0, filter: `saturate(${sat}) contrast(${on ? 1.06 : 1})`, scale: `${zoom}` })}>{children}</div>
      {on ? (
        <>
          <div style={box({ inset: 0, boxShadow: "inset 0 0 220px rgba(10,20,40,0.55)" })} />
          <div style={box({ inset: 0, backgroundColor: "#FFFFFF", opacity: flash })} />
          {ring ? (
            <div style={box({ left: ring.x - ring.r, top: ring.y - ring.r, width: ring.r * 2, height: ring.r * 2, borderRadius: "50%", border: `12px solid ${COLORS.yellow}`, boxSizing: "border-box", opacity: ringA, scale: `${1.25 - 0.25 * ringA}`, boxShadow: "0 0 0 9999px rgba(10,20,40,0.28)" })} />
          ) : null}
          <div style={box({ left: 60, right: 60, top: labelY, display: "flex", justifyContent: "center", opacity: labelA, translate: `0 ${(1 - labelA) * 20}px` })}>
            <div style={{ padding: "18px 34px", borderRadius: 20, backgroundColor: COLORS.yellow, color: COLORS.navy, fontFamily, fontSize: 54, fontWeight: 900, textAlign: "center", lineHeight: 1.15, boxShadow: "0 14px 34px rgba(10,20,40,0.35)" }}>{label}</div>
          </div>
        </>
      ) : null}
    </div>
  );
};
