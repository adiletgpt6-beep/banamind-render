// Верхняя карточка сцен 1–4 (экранная, над картой): сначала вопрос, затем
// база расчёта и тариф текущей сцены. Цена сменяется «перелистыванием»
// (старая уходит вверх, новая приходит снизу) — без промежуточных чисел.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { ArrowText, CheckIcon, CrossIcon, easeOut, NAVY, NAVY_SOFT, popScale, prog, YELLOW, YELLOW_SOFT } from "../art";
import type { Bg32Beats } from "../beats";
import { BG32_TEXT, BG32_TIERS } from "../script";

const T = BG32_TEXT;

const Chip: React.FC<{ readonly children: React.ReactNode; readonly dark?: boolean }> = ({ children, dark }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 20px 8px 8px",
      borderRadius: 30,
      backgroundColor: dark ? NAVY : YELLOW_SOFT,
      color: dark ? "#FFFFFF" : NAVY,
      fontSize: 28,
      fontWeight: 900,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Logo: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <Img src={staticFile("assets/logo.png")} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#FFFFFF" }} />
);

export const PriceCard: React.FC<{ readonly t: number; readonly b: Bg32Beats }> = ({ t, b }) => {
  const appear = easeOut(prog(t, b.hook.from + 0.1, 0.5));
  const toTier = easeOut(prog(t, b.t1.from - 0.1, 0.55));
  const fade = 1 - prog(t, b.t3.to - 0.4, 0.35);
  const tier = t < b.t2.from ? 0 : t < b.t3.from ? 1 : 2;
  const priceAt = [b.t1.price, b.t2.price, b.t3.price];
  const rangeAt = [b.t1.range, b.t2.range, b.t3.range];

  // Цена всегда соответствует диапазону на экране: прежняя цена уходит
  // вместе с прежним диапазоном, до слова «миң» стоит «? сом», затем новая
  // цена приходит перелистыванием.
  const shownPrice = t >= priceAt[tier] ? tier : tier - 1;
  const flip = easeOut(prog(t, priceAt[tier], 0.4));
  const prevOut = tier > 0 ? easeOut(prog(t, rangeAt[tier] - 0.1, 0.3)) : 1;
  const prev = tier > 0 && prevOut < 1 ? BG32_TIERS[tier - 1].price : null;
  const ask = t < priceAt[tier] + 0.4 && (tier === 0 || prevOut > 0) ? (tier === 0 ? 1 : prevOut) * (1 - flip) : 0;

  const rangeU = easeOut(prog(t, rangeAt[tier], 0.4));
  const range = rangeU > 0 ? T.tiers[tier].range : tier === 0 ? T.basis : T.tiers[tier - 1].range;
  const noteU = easeOut(prog(t, priceAt[tier] + 0.5, 0.4));
  const overU = tier === 2 ? easeOut(prog(t, b.t3.over, 0.5)) : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        top: 250,
        height: 470,
        borderRadius: 44,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 18px 50px rgba(20,40,75,0.16)",
        border: `4px solid ${tier >= 0 && toTier > 0.5 ? YELLOW : "#E6EBF3"}`,
        fontFamily,
        color: NAVY,
        overflow: "hidden",
        opacity: appear * fade,
        transform: `translateY(${(1 - appear) * -30}px) scale(${0.96 + 0.04 * appear})`,
      }}
    >
      {/* 1. вопрос */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "34px 44px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
          opacity: 1 - toTier,
          transform: `translateY(${-toTier * 40}px)`,
        }}
      >
        <Chip>
          <Logo /> BalaGo • {T.city}
        </Chip>
        <div style={{ fontSize: 76, fontWeight: 1000, lineHeight: 1.08 }}>
          {T.question.split(" ").map((w, i) => {
            const u = easeOut(prog(t, b.hook.from + 0.25 + i * 0.12, 0.35));
            return (
              <span key={i} style={{ display: "inline-block", marginRight: 18, opacity: u, transform: `translateY(${(1 - u) * 20}px)`, color: i === 3 ? "#C98A00" : NAVY }}>
                {w}
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. тариф */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "30px 40px",
          display: "flex",
          flexDirection: "column",
          opacity: toTier,
          transform: `translateY(${(1 - toTier) * 40}px)`,
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          <Chip dark>
            <Logo size={40} /> BalaGo
          </Chip>
          <Chip>{T.perChild}</Chip>
        </div>
        <div style={{ marginTop: 22, height: 70, position: "relative" }}>
          <div
            key={range}
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: range === T.basis ? 44 : 56,
              fontWeight: 1000,
              whiteSpace: "nowrap",
              opacity: range === T.basis || rangeU === 0 ? 1 : rangeU,
              transform: `translateX(${range === T.basis || rangeU === 0 ? 0 : (1 - rangeU) * 30}px)`,
              color: range === T.basis ? NAVY_SOFT : NAVY,
            }}
          >
            <ArrowText text={range} size={range === T.basis ? 44 : 56} />
          </div>
        </div>
        <div style={{ marginTop: 8, height: 150, position: "relative", overflow: "hidden" }}>
          {prev !== null ? (
            <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${-prevOut * 150}px)`, opacity: 1 - prevOut }}>
              <PriceTag price={prev} />
            </div>
          ) : null}
          {ask > 0 ? (
            <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "baseline", gap: 18, opacity: ask * (0.35 + 0.1 * Math.sin(t * 6)) }}>
              <div style={{ fontSize: 132, fontWeight: 1000, lineHeight: 1.1, color: NAVY_SOFT, backgroundColor: "#EEF2F8", borderRadius: 28, padding: "0 44px" }}>?</div>
              <div style={{ fontSize: 64, fontWeight: 1000, color: NAVY_SOFT }}>{BG32_TEXT.som}</div>
            </div>
          ) : null}
          {shownPrice === tier ? (
            <div style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${(1 - flip) * 150}px) scale(${popScale(flip)})`, transformOrigin: "left center" }}>
              <PriceTag price={BG32_TIERS[tier].price} />
            </div>
          ) : null}
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: NAVY_SOFT, opacity: noteU, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckIcon color={NAVY_SOFT} /> {T.tiers[tier].note}
          </div>
          {tier === 2 ? (
            <div style={{ fontSize: 32, fontWeight: 800, color: "#C0392B", opacity: overU, display: "flex", alignItems: "center", gap: 10 }}>
              <CrossIcon color="#C0392B" /> {T.over}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const PriceTag: React.FC<{ readonly price: number }> = ({ price }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
    <div
      style={{
        fontSize: 132,
        fontWeight: 1000,
        lineHeight: 1.1,
        color: NAVY,
        backgroundColor: YELLOW,
        borderRadius: 28,
        padding: "0 28px",
        letterSpacing: -2,
      }}
    >
      {price}
    </div>
    <div style={{ fontSize: 64, fontWeight: 1000, color: NAVY }}>{BG32_TEXT.som}</div>
  </div>
);
