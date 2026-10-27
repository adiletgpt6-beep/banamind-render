// Сцена 5: честные шаги до старта (появляются вместе со словами диктора).
//   1. Каттамга ылайык топ түзүлөт — 3–4 бала, издөө 2 жумага чейин
//      (дети-аватары собираются в одну группу на одном маршруте);
//   2. Биринчи толук сыноо сапары — акысыз: ҮЙ → МЕКТЕП → ҮЙ, 0 сом;
//   3. Улантуу чечими — сизде: две равные кнопки, выбор не делается за
//      родителя. Поездка не показывается выполненной.
import { fontFamily } from "../../../fonts";
import { ArrowText, easeInOut, easeOut, Figure, lerp, LOOKS, NAVY, NAVY_SOFT, popScale, prog, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";

const T = BG3_TEXT.steps;
const KIDS = ["#E8505B", "#3C79B8", "#7CC48B", "#F2A900"];

const Card: React.FC<{ readonly t: number; readonly at: number; readonly n: number; readonly title: string; readonly top: number; readonly children: React.ReactNode }> = ({
  t,
  at,
  n,
  title,
  top,
  children,
}) => {
  const a = easeOut(prog(t, at, 0.45));
  const badge = popScale(prog(t, at + 0.05, 0.45));
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        width: 870,
        top,
        height: 316,
        borderRadius: 38,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 14px 40px rgba(20,40,75,0.14)",
        opacity: a,
        transform: `translateY(${(1 - a) * 50}px)`,
        padding: "30px 34px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>
        <div style={{ width: 78, height: 78, flexShrink: 0, borderRadius: 39, backgroundColor: YELLOW, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 1000, color: NAVY, transform: `scale(${badge})` }}>
          {n}
        </div>
        <div style={{ fontSize: 46, fontWeight: 1000, color: NAVY, lineHeight: 1.12, paddingTop: 8 }}>{title}</div>
      </div>
      <div style={{ marginTop: 18, marginLeft: 100 }}>{children}</div>
    </div>
  );
};

export const Steps: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const s = b.steps;
  const inS = easeOut(prog(t, s.from - 0.2, 0.4));
  const gather = easeInOut(prog(t, s.s1 + 0.3, 1.0));
  const zero = popScale(prog(t, s.s2 + 0.6, 0.45));
  const choice = easeOut(prog(t, s.s3 + 0.4, 0.4));
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F6F8FC", fontFamily, opacity: inS, overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -200, top: -160, width: 600, height: 600, borderRadius: 300, backgroundColor: YELLOW_SOFT }} />
      <div style={{ position: "absolute", left: 64, top: 230, fontSize: 62, fontWeight: 1000, color: NAVY, opacity: inS }}>{T.title}</div>
      <Card t={t} at={s.s1} n={1} title={T.s1} top={350}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <svg width={300} height={110} viewBox="0 0 300 110">
            <rect x={6} y={26} width={288} height={70} rx={35} fill="none" stroke={YELLOW} strokeWidth={5} strokeDasharray="12 9" opacity={gather} />
            {KIDS.map((c, i) => {
              const sx = [10, 290, 30, 270][i];
              const sy = [-30, -30, 140, 140][i];
              const ex = 60 + i * 60;
              const x = lerp(sx, ex, gather);
              const y = lerp(sy, 61, gather);
              return (
                <g key={i} transform={`translate(${x} ${y})`} opacity={i === 3 ? 0.55 + 0.45 * gather : 1}>
                  <circle r={26} fill={c} />
                  <circle cy={-4} r={11} fill="#F3D3BC" />
                  <path d="M -16 18 Q 0 4 16 18" fill="#F3D3BC" />
                </g>
              );
            })}
          </svg>
          <div style={{ fontSize: 32, fontWeight: 900, color: NAVY_SOFT, lineHeight: 1.2 }}>{T.s1note}</div>
        </div>
      </Card>
      <Card t={t} at={s.s2} n={2} title={T.s2} top={700}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ padding: "10px 24px", borderRadius: 26, backgroundColor: "#F1F4F9", fontSize: 36, fontWeight: 1000, color: NAVY }}>
            <ArrowText text={T.s2note} size={36} />
          </div>
          <div style={{ padding: "10px 26px", borderRadius: 26, backgroundColor: YELLOW, fontSize: 44, fontWeight: 1000, color: NAVY, transform: `scale(${zero})` }}>0 сом</div>
        </div>
      </Card>
      <Card t={t} at={s.s3} n={3} title={T.s3} top={1050}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: choice }}>
          <svg width={110} height={110} viewBox="-120 -700 240 240" style={{ flexShrink: 0 }}>
            <Figure look={LOOKS.mom} t={t} blinkSeed={4} legs={false} mouth="smile" lookX={0.5} />
          </svg>
          <div style={{ padding: "16px 30px", borderRadius: 26, border: `4px solid ${NAVY}`, fontSize: 36, fontWeight: 1000, color: NAVY }}>{T.s3yes}</div>
          <div style={{ padding: "16px 26px", borderRadius: 26, border: `4px solid ${NAVY_SOFT}`, fontSize: 36, fontWeight: 1000, color: NAVY_SOFT }}>{T.s3think}</div>
        </div>
      </Card>
    </div>
  );
};
