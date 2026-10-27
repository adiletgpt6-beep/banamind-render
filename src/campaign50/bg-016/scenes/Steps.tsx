// Сцена 5: шаги «Арыз → ылайыктуу топ → акысыз биринчи толук сапар →
// чечим» — карточки появляются вместе со словами диктора. В углу маленькое
// окно с воображаемым спокойным утром («Баланын кыялы») постепенно гаснет:
// мечта не выдаётся за уже запущенную услугу.
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../../fonts";
import { cueOf, FPS, sceneSpan, useScene } from "../context";
import { PAL } from "../Kitchen";
import { clamp, easeInOut } from "../../../two-schedules-2d/rig/motion";
import { wordTime } from "../timeline";
import { pop, RouteText } from "../ui";
import { DreamKitchen } from "./Morning";

const Icon: React.FC<{ readonly kind: "form" | "group" | "free" | "check" }> = ({ kind }) => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <circle cx={55} cy={55} r={52} fill={kind === "free" ? PAL.yellow : "#EEF4FB"} />
    {kind === "form" ? (
      <g>
        <rect x={32} y={24} width={46} height={60} rx={8} fill="#FFFFFF" stroke={PAL.navy} strokeWidth={4} />
        {[40, 52, 64].map((y) => (
          <rect key={y} x={40} y={y} width={30} height={5} rx={2.5} fill="#9AA6C2" />
        ))}
      </g>
    ) : null}
    {kind === "group" ? (
      <g>
        {[
          [36, 46, "#E5677A"],
          [55, 40, "#3E6FB0"],
          [74, 46, "#3E9C6B"],
          [55, 66, "#F2A541"],
        ].map(([x, y, c], i) => (
          <g key={i} opacity={i === 3 ? 0.55 : 1}>
            <circle cx={x as number} cy={(y as number) - 8} r={9} fill={c as string} />
            <path d={`M${(x as number) - 13} ${(y as number) + 14} Q ${x} ${(y as number) - 4} ${(x as number) + 13} ${(y as number) + 14} Z`} fill={c as string} />
          </g>
        ))}
      </g>
    ) : null}
    {kind === "free" ? (
      <text x={55} y={68} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={36} fill={PAL.navy}>
        0 с
      </text>
    ) : null}
    {kind === "check" ? <path d="M32 56 L48 72 L80 38" stroke="#3E9C6B" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
  </svg>
);

const Card: React.FC<{
  readonly n: number;
  readonly t: number;
  readonly icon: "form" | "group" | "free" | "check";
  readonly title: React.ReactNode;
  readonly sub?: React.ReactNode;
  readonly accent?: boolean;
}> = ({ n, t, icon, title, sub, accent }) => {
  if (t <= 0) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "22px 28px",
        borderRadius: 32,
        background: accent ? "#FFF6D6" : "#FFFFFF",
        border: `5px solid ${accent ? PAL.yellow : "#E3E8F0"}`,
        boxShadow: "0 14px 34px rgba(30,47,92,0.12)",
        transform: `translateX(${(1 - pop(t)) * 120}px) scale(${0.9 + 0.1 * pop(t)})`,
        opacity: clamp(t * 2.5),
        fontFamily,
        color: PAL.navy,
      }}
    >
      <div style={{ position: "relative" }}>
        <Icon kind={icon} />
        <div style={{ position: "absolute", left: -8, top: -8, width: 40, height: 40, borderRadius: 20, background: PAL.navy, color: "#FFFFFF", fontSize: 24, fontWeight: 900, textAlign: "center", lineHeight: "40px" }}>
          {n}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.12 }}>{title}</div>
        {sub ? <div style={{ fontSize: 30, fontWeight: 800, color: "#5B6785", marginTop: 6, lineHeight: 1.2 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

export const StepsScene: React.FC = () => {
  const { f, tl, at, len } = useScene("steps");
  const n04 = cueOf(tl, "n04");
  const w = (i: number) => at(wordTime(n04, i));
  const c1 = (f - Math.max(4, w(0) - 4)) / 12;
  const c2 = (f - (w(3) - 4)) / 12;
  const c3 = (f - (w(5) - 4)) / 12;
  const c4 = (f - (w(12) - 4)) / 12;
  // окно мечты гаснет
  const dreamA = 1 - easeInOut((f - 30) / Math.max(60, len * 0.55));
  const dream = sceneSpan(tl, "dream");
  const dreamLen = Math.round((dream.to - dream.from) * FPS);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #F3F8FF 0%, #FFF8EA 100%)" }}>
      {dreamA > 0.01 ? (
        <div style={{ position: "absolute", left: 640, top: 230, width: 360, height: 300, opacity: dreamA }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 40, overflow: "hidden", border: "6px solid #FFFFFF", boxShadow: "0 12px 30px rgba(30,47,92,0.16)", filter: `blur(${(1 - dreamA) * 6}px)` }}>
            <div style={{ position: "absolute", left: -180, top: -180, width: 1080, height: 1920, transform: "scale(0.5)", transformOrigin: "0 0" }}>
              <DreamKitchen t={dreamLen - 1} abs={-10000} askAt={0} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: -26, display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#FFFFFF", border: `3px solid ${PAL.yellow}`, borderRadius: 999, padding: "4px 18px", fontFamily, fontWeight: 900, fontSize: 28, color: PAL.navy }}>Баланын кыялы</div>
          </div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 70, top: 300, fontFamily, fontWeight: 900, fontSize: 54, color: PAL.navy, opacity: clamp(f / 10), width: 560, lineHeight: 1.1 }}>
        BalaGo кантип <span style={{ color: "#F2A541" }}>башталат?</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 560, display: "flex", flexDirection: "column", gap: 26 }}>
        <Card n={1} t={c1} icon="form" title="Арыз" sub="Профилдеги шилтеме же WhatsApp" />
        <Card n={2} t={c2} icon="group" title="Багытка ылайык топ" sub="3–4 бала • издөө 2 жумага чейин" />
        <Card
          n={3}
          t={c3}
          icon="free"
          accent
          title={
            <span>
              Биринчи толук сыноо сапары — <span style={{ color: "#D9473F" }}>акысыз</span>
            </span>
          }
          sub={<RouteText />}
        />
        <Card n={4} t={c4} icon="check" title="Чечимди өзүңүз кабыл аласыз" />
      </div>
    </AbsoluteFill>
  );
};
