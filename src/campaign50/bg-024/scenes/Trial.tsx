// Сцена 5 (≈43–55 с): «Топ түзүлгөндөн кийин» — полная пробная поездка
// одним кругом: утром ҮЙ → МЕКТЕП, после уроков МЕКТЕП → ҮЙ. Белая
// легковая машина, дети на заднем сиденье пристёгнуты. Плашка
// «Биринчи толук сыноо сапары — акысыз», затем карточка «Улантуу
// чечими — сизде»: рука родителя спокойно зависает над выбором, решение
// не навязывается.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, lerp } from "../anim";
import { useWordAt } from "../context";
import { C } from "../palette";
import { Backdrop, Car, Hand, Icon, Pill } from "../parts";
import { BG24_TEXT } from "../script";

const ROADS = [
  { y: 640, from: 250, to: 790, dir: 1 as const, a: 8, b: 92 },
  { y: 900, from: 790, to: 250, dir: -1 as const, a: 100, b: 184 },
];

export const TrialScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG24_TEXT.trial;
  const badgeAt = useWordAt("n05", 2); // «биринчи»
  const choiceAt = useWordAt("n05", 8); // «Кызматты»
  const badge = appear(f, badgeAt - 4, 14);
  const choice = appear(f, choiceAt - 4, 14);
  const handIn = easeInOut((f - choiceAt - 10) / 30);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <Backdrop tone="warm" drift={f * 0.3} />
      <div style={{ position: "absolute", left: 0, right: 150, top: 268, display: "flex", justifyContent: "center", paddingLeft: 75, opacity: appear(f, 0, 10) }}>
        <Pill size={36} bg="#FFFFFF" color={C.navy} style={{ border: `4px solid ${C.line}` }}>
          ⏳ {t.after}
        </Pill>
      </div>
      <div style={{ position: "absolute", left: 60, right: 120, top: 372, textAlign: "center", fontSize: 76, fontWeight: 900, letterSpacing: 1, opacity: appear(f, 4, 12) }}>
        {t.route.join(" → ")}
      </div>
      {ROADS.map((r, i) => {
        const p = easeInOut((f - r.a) / (r.b - r.a));
        const x = lerp(r.from, r.to, p);
        const shown = appear(f, i === 0 ? 2 : r.a - 16, 10);
        const done = clamp((f - r.b) / 8);
        const roll = (f - r.a) * 9 * r.dir;
        return (
          <div key={i} style={{ opacity: shown }}>
            <div style={{ position: "absolute", left: 110, top: r.y + 78, fontSize: 34, fontWeight: 900, color: C.ink }}>
              {i === 0 ? "☀️" : "🌤️"} {i === 0 ? t.am : t.pm}
            </div>
            <div style={{ position: "absolute", left: 200, top: r.y + 6, width: 640, height: 22, borderRadius: 11, backgroundColor: "#DCE3EE" }} />
            <div
              style={{
                position: "absolute",
                left: r.dir === 1 ? 200 : 200 + 640 * (1 - p),
                top: r.y + 6,
                width: 640 * p,
                height: 22,
                borderRadius: 11,
                backgroundColor: C.yellow,
              }}
            />
            {[
              { x: 160, kind: "home" as const },
              { x: 880, kind: "school" as const },
            ].map((n) => (
              <div
                key={n.kind}
                style={{
                  position: "absolute",
                  left: n.x - 46,
                  top: r.y - 30,
                  width: 92,
                  height: 92,
                  borderRadius: 26,
                  backgroundColor: n.kind === "school" ? C.navy : C.yellow,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon kind={n.kind} s={56} color={n.kind === "school" ? "#FFFFFF" : C.navy} />
              </div>
            ))}
            {f >= r.a - 16 ? <Car x={x} y={r.y + 4} s={0.62} dir={r.dir} roll={roll} bounce={Math.sin(f / 3) * 1.2 * (p > 0 && p < 1 ? 1 : 0)} /> : null}
            <div style={{ position: "absolute", right: 150, top: r.y + 74, opacity: done }}>
              <Pill size={30} bg={C.green}>
                ✓
              </Pill>
            </div>
          </div>
        );
      })}
      {/* бесплатная полная пробная поездка */}
      <div style={{ position: "absolute", left: 0, right: 150, paddingLeft: 75, top: 1036, display: "flex", justifyContent: "center", opacity: badge, transform: `scale(${0.9 + 0.1 * badge})` }}>
        <Pill size={42} bg={C.yellow} color={C.navy} style={{ whiteSpace: "normal", textAlign: "center", justifyContent: "center", maxWidth: 820 }}>
          🎁 {t.badge}
        </Pill>
      </div>
      {/* решение — за родителем */}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 180,
          top: 1170,
          padding: "22px 26px",
          borderRadius: 32,
          backgroundColor: "#FFFFFF",
          border: `4px solid ${C.line}`,
          opacity: choice,
          translate: `0 ${(1 - choice) * 20}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 900 }}>{t.choice}</div>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ padding: "12px 30px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 34, fontWeight: 900 }}>{t.yes}</div>
          <div style={{ padding: "12px 30px", borderRadius: 999, backgroundColor: "#F1F4F9", fontSize: 34, fontWeight: 900, border: `3px solid ${C.line}` }}>{t.no}</div>
        </div>
      </div>
      <Hand x={lerp(900, 640, handIn) + Math.sin(f / 16) * 6} y={lerp(1760, 1330, handIn)} opacity={clamp(handIn * 3)} />
    </div>
  );
};
