// Сцена 1 (0–≈6 с): телефон с условной заявкой в руке родителя. Над ним
// вопрос «Каттам эртең эле башталабы?». Палец нажимает крупную жёлтую
// кнопку «Эртең эле?» — мгновенного подтверждения нет: кнопка
// раскрывается в три детали пазла (дарек, мектеп, убакыт), а над
// незавершённой картой встаёт большой вопросительный знак. Камера
// приближается к деталям — они переходят в следующую сцену.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { appear, clamp, easeInOut, easeOut, lerp } from "../anim";
import { useLine, useScene } from "../context";
import { C } from "../palette";
import { Backdrop, Hand, Icon, Piece, type PieceKind } from "../parts";
import { BG24_TEXT } from "../script";

export const HOOK = { tap: 62, burst: 74 } as const;

const PHONE = { x: 260, y: 420, w: 560, h: 920 } as const;
const KINDS: PieceKind[] = ["home", "school", "time"];

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n01 = useLine("n01");
  const t = BG24_TEXT.hook;
  const rise = easeOut(f / 16);
  // наезд камеры к деталям пазла в конце сцены
  const push = easeInOut((f - (frames - 34)) / 34);
  const phoneOut = easeInOut((f - (HOOK.burst + 10)) / 26);
  // рука: входит, нажимает, уходит
  const handIn = easeInOut((f - 24) / 30);
  const press = clamp(1 - Math.abs(f - HOOK.tap) / 5);
  const handOut = easeInOut((f - (HOOK.tap + 8)) / 22);
  const btn = { x: 540, y: PHONE.y + PHONE.h - 150 };
  const handX = lerp(860, btn.x + 40, handIn) + handOut * 260;
  const handY = lerp(1700, btn.y + 10, handIn) + handOut * 560;
  const burst = easeOut((f - HOOK.burst) / 20);
  const q = appear(f, HOOK.burst + 12, 16);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy }}>
      <Backdrop tone="warm" drift={f} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + push * 0.22})`, transformOrigin: "50% 40%" }}>
        {/* вопрос родителя */}
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 150,
            top: 262,
            textAlign: "center",
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.08,
            opacity: appear(f, Math.max(4, n01.from - 4), 12) * (1 - push),
            translate: `0 ${(1 - appear(f, Math.max(4, n01.from - 4), 12)) * 20}px`,
          }}
        >
          {t.question}
        </div>
        {/* телефон с условной заявкой */}
        <div
          style={{
            position: "absolute",
            left: PHONE.x,
            top: PHONE.y + (1 - rise) * 500 + phoneOut * 260,
            width: PHONE.w,
            height: PHONE.h,
            borderRadius: 64,
            backgroundColor: C.navy,
            padding: 18,
            boxSizing: "border-box",
            boxShadow: "0 30px 60px rgba(20,40,90,0.22)",
            opacity: 1 - phoneOut,
            transform: `scale(${1 - phoneOut * 0.12})`,
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: 48, backgroundColor: "#FFFFFF", overflow: "hidden", position: "relative" }}>
            <div style={{ height: 120, backgroundColor: C.yellow, display: "flex", alignItems: "center", padding: "0 34px", gap: 16 }}>
              <div style={{ fontSize: 44, fontWeight: 900 }}>BalaGo</div>
              <div style={{ marginLeft: "auto", fontSize: 32, fontWeight: 800, opacity: 0.8 }}>{t.app}</div>
            </div>
            <div style={{ padding: "30px 30px 0", display: "flex", flexDirection: "column", gap: 20 }}>
              {t.fields.map((fl, i) => (
                <div
                  key={fl.k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "18px 20px",
                    borderRadius: 24,
                    backgroundColor: "#F4F7FC",
                    border: `3px solid ${C.line}`,
                    opacity: appear(f, 10 + i * 6, 10),
                  }}
                >
                  <Icon kind={KINDS[i]} s={46} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.muted }}>{fl.k}</div>
                    <div style={{ fontSize: 32, fontWeight: 900 }}>{fl.v}</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 34, color: C.green, fontWeight: 900 }}>✓</div>
                </div>
              ))}
            </div>
            {/* кнопка: нажатие → вместо подтверждения детали пазла */}
            <div
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                bottom: 70,
                height: 136,
                borderRadius: 40,
                backgroundColor: C.yellow,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 58,
                fontWeight: 900,
                boxShadow: "0 12px 0 #E0A800",
                transform: `scale(${1 - press * 0.05}) translateY(${press * 8}px)`,
                opacity: 1 - burst,
              }}
            >
              {t.button}
            </div>
            <div
              style={{
                position: "absolute",
                left: 40,
                right: 40,
                bottom: 100,
                textAlign: "center",
                fontSize: 36,
                fontWeight: 800,
                color: C.muted,
                opacity: burst,
              }}
            >
              {t.pending}
            </div>
          </div>
        </div>
        {/* незавершённая карта и вопросительный знак */}
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: q }}>
          <g transform={`translate(540 640) scale(${0.7 + 0.3 * q})`}>
            <rect x={-300} y={-190} width={600} height={380} rx={40} fill="#FFFFFF" stroke={C.line} strokeWidth={6} />
            <path d="M -260 60 Q -120 -40 0 30 T 260 -40" fill="none" stroke={C.line} strokeWidth={22} strokeLinecap="round" />
            <path d="M -260 60 Q -120 -40 0 30" fill="none" stroke={C.yellow} strokeWidth={14} strokeLinecap="round" strokeDasharray="22 22" />
            <text x={0} y={70} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={300} fill={C.navy}>
              ?
            </text>
          </g>
        </svg>
        {KINDS.map((k, i) => {
          const fromX = 540 - 125;
          const fromY = btn.y - 75;
          const toX = 120 + i * 285;
          const toY = 920 + (i === 1 ? -30 : 0);
          return (
            <Piece
              key={k}
              kind={k}
              label={BG24_TEXT.puzzle.kinds[i]}
              x={lerp(fromX, toX, burst)}
              y={lerp(fromY, toY, burst) - Math.sin(burst * Math.PI) * 90}
              rotate={lerp(0, (i - 1) * 7, burst) + Math.sin((f + i * 20) / 18) * 2 * burst}
              scale={0.4 + 0.6 * burst}
              opacity={burst}
              fill={i === 1 ? C.yellowSoft : "#FFFFFF"}
            />
          );
        })}
      </div>
      <Hand x={handX} y={handY} press={press} opacity={clamp(handIn * 3) * (1 - handOut)} />
    </div>
  );
};
