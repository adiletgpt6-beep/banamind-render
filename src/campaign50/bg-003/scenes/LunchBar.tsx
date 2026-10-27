// «Ожившая шкала обеденного перерыва»: карточка вверху кадра (сцены 1–2).
// Жёлтая полоса 12:30 → 13:30 съедается тёмными сегментами дороги
// (Мектепке → Үйгө → Кеңсеге) синхронно с таймлапсом; часы и песочные часы
// идут вместе; «N мүн. калды» убывает до 0 → «Тыныгуу бүттү».
import { fontFamily } from "../../../fonts";
import { clamp01, easeOut, Hourglass, keys, NAVY, NAVY_SOFT, prog, RED_SOFT, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";

const T = BG3_TEXT;

// минуты обеда, прошедшие к моменту t (0…60)
export const lunchMinutes = (t: number, b: Bg3Beats) => {
  const d = b.drive;
  return keys(t, [
    [d.exit, 0],
    [d.go1, 3],
    [d.atSchool, 20],
    [d.go2, 25],
    [d.atHome, 40],
    [d.go3, 44],
    [d.atOffice, 60],
  ]);
};

export const clockText = (min: number) => {
  const total = 12 * 60 + 30 + Math.floor(min);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

// сегменты дороги (минуты от 12:30)
const LEGS = [
  { from: 0, to: 25, label: T.legs[0], color: NAVY },
  { from: 25, to: 44, label: T.legs[1], color: "#2E4677" },
  { from: 44, to: 60, label: T.legs[2], color: NAVY },
] as const;

export const LunchBar: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const appear = easeOut(prog(t, b.hook.toBar + 0.35, 0.45));
  const leave = easeOut(prog(t, b.drive.to - 0.35, 0.4));
  if (appear <= 0 || leave >= 1) return null;
  const min = lunchMinutes(t, b);
  const left = Math.max(0, Math.round(60 - min));
  const over = prog(t, b.drive.over, 0.3);
  const W = 860;
  const pulse = over > 0 ? 0.5 + 0.5 * Math.sin((t - b.drive.over) * 9) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 210,
        width: 940,
        padding: "22px 40px 26px",
        boxSizing: "border-box",
        borderRadius: 36,
        backgroundColor: "rgba(255,255,255,0.97)",
        boxShadow: "0 14px 40px rgba(20,40,75,0.18)",
        opacity: appear * (1 - leave),
        transform: `translateY(${(1 - appear) * -40 - leave * 60}px)`,
        fontFamily,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Hourglass size={54} sand={min / 60} t={t} />
        <div style={{ fontSize: 46, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>{T.lunch}</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: NAVY_SOFT, marginTop: 6 }}>• {T.hour}</div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            fontSize: 58,
            fontWeight: 1000,
            color: over > 0 ? RED_SOFT : NAVY,
            fontVariantNumeric: "tabular-nums",
            padding: "2px 18px",
            borderRadius: 18,
            backgroundColor: over > 0 ? "#FDECEE" : YELLOW_SOFT,
          }}
        >
          {clockText(min)}
        </div>
      </div>
      {/* шкала */}
      <div style={{ position: "relative", marginTop: 20, width: W, height: 70, borderRadius: 35, backgroundColor: YELLOW, overflow: "hidden", outline: over > 0 ? `${4 + 4 * pulse}px solid ${RED_SOFT}` : undefined }}>
        {LEGS.map((l, i) => {
          const done = clamp01((min - l.from) / (l.to - l.from));
          if (done <= 0) return null;
          const x = (l.from / 60) * W;
          const w = ((l.to - l.from) / 60) * W * done;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 0,
                width: w + 1,
                height: 70,
                backgroundColor: l.color,
                color: "#FFFFFF",
                fontSize: 32,
                fontWeight: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <span style={{ opacity: done > 0.7 ? 1 : 0 }}>{l.label}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", marginTop: 10, fontSize: 32, fontWeight: 900, color: NAVY_SOFT }}>
        <span>{T.from}</span>
        <div style={{ flex: 1, textAlign: "center", color: over > 0 ? RED_SOFT : NAVY, fontWeight: 1000 }}>
          {over > 0 ? T.over : `${left} ${T.minLeft}`}
        </div>
        <span>{T.to}</span>
      </div>
      <div style={{ position: "absolute", right: 40, top: -22, padding: "6px 16px", borderRadius: 14, backgroundColor: "#EEF2F8", fontSize: 24, fontWeight: 900, color: NAVY_SOFT }}>
        {T.example}
      </div>
    </div>
  );
};
