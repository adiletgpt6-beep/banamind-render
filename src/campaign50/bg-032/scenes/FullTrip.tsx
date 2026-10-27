// Сцена 5: одна цена = полный круг ҮЙ → МЕКТЕП → ҮЙ. Сначала зачёркивается
// «бир тарапка», затем два плана одного дня: утром машина BalaGo везёт от
// дома к школе, после уроков — обратно. Итог: «Бир баа = эки багыт».
import { fontFamily } from "../../../fonts";
import { ArrowGlyph, ArrowText, BellIcon, CarSide, CheckIcon, CrossIcon, easeInOut, easeOut, House, Mountains, NAVY, NAVY_SOFT, popScale, prog, ROAD, School, SunIcon, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg32Beats } from "../beats";
import { BG32_TEXT } from "../script";

const T = BG32_TEXT.full;
const DRIVE = 2.6;
const HOUSE_X = 150;
const SCHOOL_X = 800;

const Strip: React.FC<{
  readonly top: number;
  readonly t: number;
  readonly at: number;
  readonly morning: boolean;
  readonly appear: number;
}> = ({ top, t, at, morning, appear }) => {
  const u = easeInOut(prog(t, at, DRIVE));
  const carStart = morning ? HOUSE_X + 50 : SCHOOL_X - 330;
  const carEnd = morning ? SCHOOL_X - 330 : HOUSE_X + 50;
  const x = carStart + (carEnd - carStart) * u;
  const moving = u > 0 && u < 1;
  const done = easeOut(prog(t, at + DRIVE - 0.1, 0.4));
  const focus = t >= at - 0.2 ? 1 : 0.55;
  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top,
        height: 440,
        borderRadius: 40,
        overflow: "hidden",
        background: morning ? "linear-gradient(#DCEBFF, #F7FBFF 70%)" : "linear-gradient(#FFE7CC, #FFF8EE 70%)",
        boxShadow: "0 14px 40px rgba(20,40,75,0.14)",
        border: `4px solid ${t >= at - 0.2 && t < at + DRIVE + 0.6 ? YELLOW : "#E3E8F0"}`,
        opacity: appear * focus,
        transform: `translateY(${(1 - appear) * 60}px)`,
      }}
    >
      <svg width={968} height={440} viewBox="0 0 968 440" style={{ position: "absolute", inset: 0 }}>
        <circle cx={morning ? 150 : 820} cy={morning ? 96 : 120} r={44} fill={morning ? "#FFD34D" : "#FFB45C"} opacity={0.9} />
        <Mountains width={968} y={150} tone={morning ? 0 : 1} />
        <rect x={0} y={300} width={968} height={140} fill="#FFFFFF" />
        <rect x={0} y={352} width={968} height={40} fill={ROAD} />
        <path d="M 0 372 L 968 372" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="26 22" />
        <g transform={`translate(${HOUSE_X} 352) scale(1.75)`}>
          <House glow={(morning ? 1 - u : done) * 0.8} />
        </g>
        <g transform={`translate(${SCHOOL_X} 352) scale(1.45)`}>
          <School glow={(morning ? done : 1 - u) * 0.8} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: x, top: 256, transform: `translateY(${moving ? Math.sin(t * 30) * 1.5 : 0}px)` }}>
        <CarSide width={250} wheelTurn={x * 2.2} flip={!morning} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 26,
          top: 22,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 24px",
          borderRadius: 30,
          backgroundColor: "#FFFFFF",
          fontSize: 38,
          fontWeight: 1000,
          color: NAVY,
          boxShadow: "0 6px 16px rgba(20,40,75,0.12)",
        }}
      >
        {morning ? <SunIcon size={44} /> : <BellIcon size={44} />}
        {morning ? T.morning : T.afternoon}
        <span style={{ color: NAVY_SOFT, fontWeight: 900 }}>•</span>
        <span style={{ display: "flex", alignItems: "center" }}>
          <ArrowText text={morning ? T.morningRoute : T.afternoonRoute} size={38} />
        </span>
      </div>
      {/* галочка по прибытии */}
      <div
        style={{
          position: "absolute",
          right: 26,
          top: 22,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: YELLOW,
          border: `4px solid ${NAVY}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 38,
          fontWeight: 1000,
          color: NAVY,
          transform: `scale(${popScale(done)})`,
          opacity: done,
        }}
      >
        <CheckIcon size={40} />
      </div>
    </div>
  );
};

export const FullTrip: React.FC<{ readonly t: number; readonly b: Bg32Beats }> = ({ t, b }) => {
  const f = b.full;
  const inU = easeOut(prog(t, f.from - 0.3, 0.6));
  const title = (i: number) => easeOut(prog(t, f.from - 0.2 + i * 0.15, 0.35));
  const cross = easeOut(prog(t, f.notOneWay + 0.55, 0.35));
  const oneU = easeOut(prog(t, f.onePrice, 0.45));
  const parts = ["ҮЙ", "→", "МЕКТЕП", "→", "ҮЙ"];
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, opacity: inU, transform: `scale(${1.08 - 0.08 * inU})` }}>
      <div style={{ position: "absolute", left: -200, top: -260, width: 640, height: 640, borderRadius: 320, backgroundColor: YELLOW_SOFT }} />
      {/* заголовок */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 255, display: "flex", justifyContent: "center", gap: 18, fontSize: 84, fontWeight: 1000, color: NAVY }}>
        {parts.map((p, i) => (
          <span key={i} style={{ opacity: title(i), transform: `translateY(${(1 - title(i)) * 24}px)`, display: "flex", alignItems: "center" }}>
            {p === "→" ? <ArrowGlyph size={84} color="#C98A00" /> : p}
          </span>
        ))}
      </div>
      {/* «бир тарапка» зачёркивается → «Бир баа = эки багыт» */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 80, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "8px 30px",
            borderRadius: 40,
            border: `4px solid ${NAVY_SOFT}`,
            fontSize: 44,
            fontWeight: 900,
            color: NAVY_SOFT,
            opacity: easeOut(prog(t, f.notOneWay, 0.3)) * (1 - oneU),
          }}
        >
          <ArrowGlyph size={44} /> {T.notOneWay.replace(" эмес", "")}
          <div style={{ position: "absolute", left: 16, right: 16, top: "50%", height: 6, borderRadius: 3, backgroundColor: "#E8463A", transformOrigin: "left", transform: `scaleX(${cross})` }} />
          <span style={{ opacity: cross, display: "flex" }}>
            <CrossIcon size={40} />
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            padding: "10px 36px",
            borderRadius: 40,
            backgroundColor: YELLOW,
            border: `4px solid ${NAVY}`,
            fontSize: 50,
            fontWeight: 1000,
            color: NAVY,
            opacity: oneU,
            transform: `scale(${popScale(oneU)})`,
            whiteSpace: "nowrap",
          }}
        >
          {T.one}
        </div>
      </div>
      <Strip top={490} t={t} at={f.morning} morning appear={easeOut(prog(t, f.from - 0.15, 0.5))} />
      <Strip top={955} t={t} at={f.afternoon} morning={false} appear={easeOut(prog(t, f.from + 0.05, 0.5))} />
    </div>
  );
};
