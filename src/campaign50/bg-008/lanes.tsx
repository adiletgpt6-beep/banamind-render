// Две параллельные дорожки событий (как дорожки монтажа): «Жумуш» и
// «Мектеп жолу» на одной шкале времени 16:00–17:40. Бегунок (playhead)
// показывает, где сейчас героиня; красная полоса — время, когда рабочий
// звонок ложится на дорогу к школе; красный значок — пропущенный звонок.
import { fontFamily } from "../../fonts";
import { clamp, easeOut, lerp } from "./rig/motion";
import { MissedGlyph, NAVY, pop, RED } from "./screens";
import { box } from "./shots";

export type LaneBlock = {
  readonly from: number; // минуты от 16:00
  readonly to: number;
  readonly label: string;
  readonly color: string;
  readonly ink?: string;
  readonly at?: number; // кадр появления
  readonly pulse?: number; // 0…1 — пульсирует (звонит)
  readonly dim?: number; // 0…1 — приглушён
};

export type Lane = {
  readonly label: string;
  readonly color: string;
  readonly blocks: readonly LaneBlock[];
  readonly badge?: React.ReactNode; // значок перед названием
};

const X0 = 70;
const X1 = 1010;
const SPAN = 100; // минут на шкале
export const laneX = (min: number) => X0 + ((X1 - X0) * min) / SPAN;
const clock = (min: number) => {
  const m = Math.round(min);
  return `${16 + Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
};

export const Lanes: React.FC<{
  readonly f: number;
  readonly lanes: readonly Lane[];
  readonly intro: number; // 0…1
  readonly playhead?: number; // минуты от 16:00
  readonly clash?: { readonly from: number; readonly to: number; readonly v: number };
  readonly missed?: { readonly at: number; readonly v: number };
  readonly gap?: number; // доп. расстояние между дорожками (расхождение), px
  readonly top?: number;
  readonly ruler?: boolean;
}> = ({ f, lanes, intro, playhead, clash, missed, gap = 0, top = 0, ruler = true }) => {
  const laneY = (i: number) => top + 110 + i * (190 + gap);
  const laneH = 104;
  const blink = 0.65 + 0.35 * Math.sin(f / 3.2);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, fontFamily, pointerEvents: "none" })}>
      {/* шкала времени */}
      <div style={box({ left: 0, top: top + 20, width: 1080, height: 50, opacity: ruler ? intro : 0 })}>
        {[0, 20, 40, 60, 80, 100].map((m) => (
          <div key={m} style={box({ left: laneX(m) - 60, top: 0, width: 120, textAlign: "center", fontSize: 30, fontWeight: 800, color: "#7A879E" })}>{clock(m)}</div>
        ))}
      </div>
      {lanes.map((ln, i) => {
        const y = laneY(i);
        const a = easeOut((intro - i * 0.15) / 0.85);
        return (
          <div key={ln.label} style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: clamp(a * 1.3), transform: `translateX(${(1 - a) * (i ? 80 : -80)}px)` })}>
            <div style={box({ left: X0, top: y - 50, display: "flex", alignItems: "center", gap: 12, fontSize: 36, fontWeight: 900, color: ln.color })}>
              {ln.badge}
              {ln.label}
            </div>
            <div style={box({ left: X0 - 10, top: y - 6, width: X1 - X0 + 20, height: laneH + 12, borderRadius: 26, backgroundColor: "#EEF2F8" })} />
            {ln.blocks.map((b) => {
              const u = b.at === undefined ? 1 : pop(clamp((f - b.at) / 10));
              const pulse = b.pulse ?? 0;
              const x0 = laneX(b.from);
              const w = laneX(b.to) - x0 - 6;
              return (
                <div
                  key={b.label}
                  style={box({
                    left: x0 + 3,
                    top: y,
                    width: w,
                    height: laneH,
                    borderRadius: 20,
                    backgroundColor: b.color,
                    color: b.ink ?? "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    fontSize: 30,
                    fontWeight: 900,
                    lineHeight: 1.05,
                    padding: "0 8px",
                    boxSizing: "border-box",
                    opacity: clamp(u * 1.4) * lerp(1, 0.35, b.dim ?? 0),
                    transform: `scale(${lerp(0.6, 1, u) * (1 + 0.05 * pulse * Math.abs(Math.sin(f / 2.2)))})`,
                    boxShadow: pulse > 0 ? `0 0 0 ${8 * pulse}px rgba(122,92,201,0.25)` : "none",
                  })}
                >
                  {b.label}
                </div>
              );
            })}
          </div>
        );
      })}
      {/* пересечение: звонок ложится на дорогу */}
      {clash && clash.v > 0.01 ? (
        <div style={box({ left: laneX(clash.from), top: laneY(0) - 14, width: laneX(clash.to) - laneX(clash.from), height: laneY(lanes.length - 1) - laneY(0) + laneH + 28, borderRadius: 24, border: `6px dashed rgba(226,67,58,${clash.v * blink})`, backgroundColor: `rgba(226,67,58,${0.1 * clash.v})`, boxSizing: "border-box" })} />
      ) : null}
      {/* пропущенный звонок на дорожке «Жумуш» */}
      {missed && missed.v > 0.01 ? (
        <div style={box({ left: laneX(missed.at) - 50, top: laneY(0) - 62, width: 100, height: 100, borderRadius: 50, backgroundColor: "#FFFFFF", border: `5px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(missed.v)})`, boxShadow: "0 8px 18px rgba(226,67,58,0.35)" })}>
          <MissedGlyph size={60} />
        </div>
      ) : null}
      {/* бегунок */}
      {playhead !== undefined ? (
        <div style={box({ left: laneX(playhead) - 3, top: top + 70, width: 6, height: laneY(lanes.length - 1) - top - 70 + laneH + 20, backgroundColor: NAVY, opacity: intro, borderRadius: 3 })}>
          <div style={box({ left: -58, top: -46, width: 122, padding: "4px 0", borderRadius: 20, backgroundColor: NAVY, color: "#FFFFFF", textAlign: "center", fontSize: 30, fontWeight: 900 })}>{clock(playhead)}</div>
        </div>
      ) : null}
    </div>
  );
};
