// Визуальные блоки: крючок, план выпуска, Alex, шаг 1, бюджет, остаток,
// цена часа, применение цены часа.
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { t } from "../i18n";
import { C, FONT } from "../theme";
import { Icon } from "../ui/Icons";
import { useScene } from "./ctx";
import { Abs, appear, Arrow, Card, Kicker, Pill, Title, usd } from "./kit";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Обёртка сцены: общее затухание в конце. */
export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { out } = useScene();
  return <AbsoluteFill style={{ opacity: out }}>{children}</AbsoluteFill>;
};

const Num: React.FC<{ v: number; size?: number; color?: string }> = ({ v, size = 96, color = C.navy }) => (
  <span style={{ fontFamily: FONT, fontWeight: 1000, fontSize: size, color, letterSpacing: -2, fontVariantNumeric: "tabular-nums" }}>{t(usd(v))}</span>
);

// ───────────────────────────── 1. Крючок
export const Hook: React.FC = () => {
  const { frame, at, pop, ramp } = useScene();
  // баланс счёта: растёт на «money», тает на «bills» → почти как раньше
  const up = ramp("h1@money", 0.8);
  const down = ramp("h2@bills", 2.2);
  const bal = 180 + up * 3820 - down * 3780;
  const fade = interpolate(frame, [at("h3@Today"), at("h3@Today") + 12], [1, 0], clamp);
  const k1 = pop("h1");
  const kz = pop("h1@zero");
  const ks = pop("h3@system");
  return (
    <Shell>
      <Abs x={110} y={250} w={520} style={{ opacity: fade }}>
        <div style={{ ...appear(k1), background: C.white, borderRadius: 32, padding: "30px 34px", boxShadow: "0 12px 34px rgba(20,37,74,0.12)", fontFamily: FONT }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.navySoft }}>{t("Account balance")}</div>
          <Num v={bal} size={92} color={down > 0.6 ? C.red : C.navy} />
          <div style={{ height: 22, borderRadius: 11, background: C.creamDeep, marginTop: 14, overflow: "hidden" }}>
            <div style={{ width: `${(bal / 4000) * 100}%`, height: "100%", background: down > 0.6 ? C.red : C.green }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800, color: C.navySoft, marginTop: 14 }}>
            <span style={{ opacity: up > 0.5 ? 1 : 0.35 }}>{t("Payday")}</span>
            <span style={{ opacity: down > 0.2 ? 1 : 0.35 }}>{t("Bills")}</span>
            <span style={{ opacity: down > 0.9 ? 1 : 0.35 }}>{t("Month end")}</span>
          </div>
        </div>
      </Abs>
      <Abs x={1310} y={300} w={540} style={{ opacity: fade }}>
        <Title k={kz} size={84}>
          {t("Starting from")} <span style={{ color: C.yellow, WebkitTextStroke: `2px ${C.navy}` }}>{t("zero")}</span>?
        </Title>
      </Abs>
      <Abs x={0} y={70} w={1920} style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, alignItems: "baseline" }}>
          <Title k={ks} size={104} align="center">
            {t("The Money")} <span style={{ color: C.green }}>{t("System")}</span>
          </Title>
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 18 }}>
          <Pill k={pop("h3@trick")} bg={C.white} color={C.navy}>
            {t("Not a trick")}
          </Pill>
          <Pill k={pop("h3@system#1")} bg={C.green}>
            {t("A system")}
          </Pill>
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 2. План выпуска
const STEPS = ["Where you stand", "The price of your hour", "Where your money flows", "What you're aiming for", "Growing income, honestly"];
const STEP_CUES = ["p2@stand", "p2@hour", "p2@flows", "p2@aiming", "p2@grow"];
export const Roadmap: React.FC = () => {
  const { pop, ramp } = useScene();
  const swap = ramp("p3", 0.5);
  return (
    <Shell>
      <Abs x={860} y={90} w={980} style={{ opacity: 1 - swap, transform: `translateY(${-swap * 40}px)` }}>
        <Kicker k={pop("p1")}>{t("This episode")}</Kicker>
        <Title k={pop("p1@five")} size={70}>
          {t("Five things you'll know")}
        </Title>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map((s, i) => (
            <Card
              key={s}
              k={pop(STEP_CUES[i])}
              w={900}
              label={t(s)}
              icon={(["target", "clock", "wallet", "pen", "seed"] as const)[i]}
              iconBg={i % 2 ? C.green : C.navy}
              style={{ padding: "14px 22px" }}
            />
          ))}
        </div>
      </Abs>
      <Abs x={860} y={110} w={980} style={{ opacity: swap }}>
        <Kicker k={pop("p3@note")}>{t("About this channel")}</Kicker>
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          <Card k={pop("p3@interest")} w={920} icon="x" iconBg={C.red} label={t("Interest-based debt and savings")} tone="white" />
          <Card k={pop("p3@gambling")} w={920} icon="x" iconBg={C.red} label={t("Gambling and betting")} />
          <Card k={pop("p3@rich")} w={920} icon="x" iconBg={C.red} label={t("Get-rich-quick schemes")} />
          <Card k={pop("p3@stick")} w={920} icon="check" iconBg={C.green} tone="green" label={t("Real work · Real activity · Clear numbers")} />
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 3. Alex
const AlexAvatar: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <circle cx={100} cy={100} r={100} fill={C.skyDeep} />
    <path d="M 40 196 C 44 140 156 140 160 196 Z" fill={C.green} />
    <rect x={88} y={118} width={24} height={26} rx={8} fill="#E8B48A" />
    <circle cx={100} cy={88} r={40} fill="#E8B48A" />
    <path d="M 60 84 C 58 50 92 38 116 46 C 134 52 144 68 140 86 C 128 70 104 64 84 66 C 74 70 66 76 60 84 Z" fill="#4A3426" />
    <circle cx={86} cy={92} r={4.5} fill={C.navy} />
    <circle cx={114} cy={92} r={4.5} fill={C.navy} />
    <path d="M 88 108 Q 100 116 112 108" stroke={C.navy} strokeWidth={4} fill="none" strokeLinecap="round" />
  </svg>
);
export const Alex: React.FC = () => {
  const { pop } = useScene();
  const k1 = pop("a1@Alex");
  return (
    <Shell>
      <Abs x={110} y={110} w={1000}>
        <div style={{ display: "flex", alignItems: "center", gap: 34, ...appear(k1) }}>
          <AlexAvatar size={220} />
          <div style={{ fontFamily: FONT, color: C.navy }}>
            <div style={{ fontSize: 96, fontWeight: 1000, letterSpacing: -2 }}>{t("Alex")}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.navySoft }}>
              <span style={{ ...appear(pop("a2@regular")), display: "inline-block" }}>{t("Regular job · paid monthly")}</span>
            </div>
          </div>
        </div>
      </Abs>
      <Abs x={110} y={420} w={1000}>
        <div style={{ background: C.white, borderRadius: 32, padding: "28px 36px", boxShadow: "0 12px 34px rgba(20,37,74,0.12)", fontFamily: FONT, ...appear(pop("a2@Take")) }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.navySoft }}>{t("Take-home pay")}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, ...appear(pop("a2@$4,000"), 14) }}>
            <span style={{ fontSize: 128, fontWeight: 1000, color: C.green, letterSpacing: -3 }}>{t("$4,000")}</span>
            <span style={{ fontSize: 44, fontWeight: 800, color: C.navy }}>{t("/ month")}</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.navySoft, ...appear(pop("a2@after"), 10) }}>
            {t("what actually lands in the account, after taxes and deductions")}
          </div>
        </div>
      </Abs>
      <Abs x={110} y={760}>
        <Pill k={pop("a3@teaching")} bg={C.yellow} color={C.navy} size={34}>
          {t("Teaching numbers — swap in your own")}
        </Pill>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 4. Шаг 1: где вы сейчас
export const Standing: React.FC = () => {
  const { pop, ramp } = useScene();
  const strike = (cue: string) => ramp(cue, 0.4);
  const rows = [
    ["Rent", "group-a"],
    ["Groceries", "group-a"],
    ["Streaming", "group-b"],
    ["Gas", "group-a"],
    ["Takeout", "group-b"],
    ["Phone", "group-a"],
  ];
  const sort = ramp("s3@sorts", 1.2);
  return (
    <Shell>
      <Abs x={90} y={80} w={560}>
        <Kicker k={pop("s1")}>{t("Step 1")}</Kicker>
        <Title k={pop("s1@honest")} size={66}>
          {t("Be honest about where you stand")}
        </Title>
      </Abs>
      <Abs x={90} y={420} w={540} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          ["Where you hope to be", "s2@hope"],
          ["Where friends seem to be", "s2@friends"],
        ].map(([txt, c]) => (
          <div key={txt} style={{ position: "relative", ...appear(pop(c)) }}>
            <Card k={1} w={520} label={t(txt)} dim={strike(c) * 0.6} />
            <div
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                height: 6,
                width: 480 * strike(c),
                background: C.red,
                borderRadius: 3,
              }}
            />
          </div>
        ))}
        <div style={appear(pop("s2@Where#2"))}>
          <Card k={1} w={520} tone="green" icon="target" iconBg={C.green} label={<b>{t("Where you are")}</b>} />
        </div>
      </Abs>
      <Abs x={1330} y={200} w={500}>
        <div style={{ background: C.white, borderRadius: 26, padding: "26px 28px", boxShadow: "0 12px 34px rgba(20,37,74,0.12)", fontFamily: FONT, ...appear(pop("s3@statement")) }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.navy, marginBottom: 14 }}>{t("Last month's statement")}</div>
          {rows.map(([name, g], i) => {
            const k = Math.max(0, Math.min(1, sort * 1.6 - i * 0.12));
            const color = g === "group-a" ? C.navy : C.green;
            return (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i ? `2px solid ${C.line}` : undefined }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.navy }}>{t(name)}</span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: C.white,
                    background: color,
                    borderRadius: 999,
                    padding: "4px 14px",
                    opacity: k,
                    transform: `scale(${0.7 + 0.3 * k})`,
                  }}
                >
                  {t(g === "group-a" ? "Essentials" : "Flexible")}
                </span>
              </div>
            );
          })}
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 5. Бюджет
const ESSENTIALS: [string, number, Parameters<typeof Icon>[0]["name"], string][] = [
  ["Rent", 1400, "home", "b2@Rent"],
  ["Groceries", 500, "cart", "b2@groceries"],
  ["Transportation", 350, "car", "b2@transportation"],
  ["Utilities & phone", 250, "bolt", "b2@utilities"],
  ["Health & insurance", 100, "heart", "b2@health"],
];
const FLEX: [string, number, Parameters<typeof Icon>[0]["name"], string][] = [
  ["Dining out & delivery", 300, "store", "b3@dining"],
  ["Subscriptions", 90, "phone", "b3@subscriptions"],
  ["Shopping & fun", 210, "gift", "b3@shopping"],
];
export const Budget: React.FC = () => {
  const { pop, ramp } = useScene();
  const split = ramp("b1@splits", 0.7);
  const total = pop("b4@$3,200");
  const Row: React.FC<{ r: (typeof ESSENTIALS)[number]; tone: string }> = ({ r, tone }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, background: C.white, borderRadius: 20, padding: "10px 18px", boxShadow: "0 6px 18px rgba(20,37,74,0.08)", fontFamily: FONT, ...appear(pop(r[3])) }}>
      <Icon name={r[2]} size={52} color={C.white} bg={tone} />
      <span style={{ fontSize: 30, fontWeight: 800, color: C.navy, flex: 1 }}>{t(r[0])}</span>
      <span style={{ fontSize: 34, fontWeight: 900, color: C.navy }}>{t(usd(r[1]))}</span>
    </div>
  );
  return (
    <Shell>
      <Abs x={860} y={50} w={620}>
        <div style={{ background: C.green, color: C.white, borderRadius: 26, padding: "16px 30px", fontFamily: FONT, textAlign: "center", ...appear(pop("b1")) }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{t(total > 0.05 ? "In  →  out" : "Take-home pay")}</div>
          <div style={{ fontSize: 66, fontWeight: 1000 }}>
            {total > 0.05 ? (
              <>
                {t("$4,000")} <span style={{ opacity: 0.7 }}>→</span> <span style={{ color: C.yellow }}>{t("$3,200")}</span>
              </>
            ) : (
              t("$4,000")
            )}
          </div>
        </div>
      </Abs>
      <Arrow x1={1060} y1={200} x2={830} y2={262} k={split} color={C.navy} width={7} bend={-0.12} />
      <Arrow x1={1290} y1={200} x2={1520} y2={262} k={split} color={C.navy} width={7} bend={0.12} />
      <Abs x={500} y={278} w={640}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, ...appear(pop("b2")) }}>
          <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 900, color: C.navy }}>{t("Essentials")}</span>
          <Pill k={pop("b2@$2,600")} bg={C.navy} size={32}>
            {t("$2,600")}
          </Pill>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ESSENTIALS.map((r) => (
            <Row key={r[0]} r={r} tone={C.navy} />
          ))}
        </div>
      </Abs>
      <Abs x={1200} y={278} w={640}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, ...appear(pop("b3")) }}>
          <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 900, color: C.navy }}>{t("Flexible")}</span>
          <Pill k={pop("b3@$600")} bg={C.green} size={32}>
            $600
          </Pill>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FLEX.map((r) => (
            <Row key={r[0]} r={r} tone={C.green} />
          ))}
        </div>
        <div style={{ marginTop: 26, ...appear(total) }}>
          <Card k={1} w={640} tone="yellow" label={t("Total spending")} value={t("$3,200")} icon="wallet" iconBg={C.navy} />
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 6. Остаток
export const Equation: React.FC = () => {
  const { pop } = useScene();
  const row = (k: number, sign: string, v: string, color: string = C.navy, size = 120) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 24, fontFamily: FONT, ...appear(k, 30) }}>
      <span style={{ fontSize: size * 0.7, fontWeight: 900, color: C.navySoft, width: 90, textAlign: "center" }}>{sign}</span>
      <span style={{ fontSize: size, fontWeight: 1000, color, letterSpacing: -3, minWidth: 460, textAlign: "right" }}>{t(v)}</span>
    </div>
  );
  const kLine = pop("e2@equals");
  return (
    <Shell>
      <Abs x={880} y={80} w={940}>
        <Title k={pop("e1")} size={80}>
          {t("What's left?")}
        </Title>
      </Abs>
      <Abs x={940} y={230} w={700}>
        {row(pop("e2@$4,000"), "", "$4,000")}
        {row(pop("e2@minus"), "−", "$3,200", C.red)}
        <div style={{ height: 8, background: C.navy, borderRadius: 4, margin: "14px 0 10px 120px", transform: `scaleX(${kLine})`, transformOrigin: "right" }} />
        {row(pop("e2@$800"), "=", "$800", C.green, 150)}
      </Abs>
      <Abs x={1010} y={790}>
        <Pill k={pop("e3@starting")} bg={C.yellow} color={C.navy} size={40}>
          {t("Your starting point")}
        </Pill>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 7. Цена часа
export const Hour: React.FC = () => {
  const { pop, ramp } = useScene();
  const seg = (cue: string, w: number, color: string, label: string) => {
    const k = ramp(cue, 0.5);
    return (
      <div style={{ width: w * k, height: 74, background: color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", whiteSpace: "nowrap" }}>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: C.navy, opacity: k }}>{t(label)}</span>
      </div>
    );
  };
  const kEq = pop("w4");
  return (
    <Shell>
      <Abs x={100} y={70} w={1000}>
        <Kicker k={pop("w1")}>{t("Step 2")}</Kicker>
        <Title k={pop("w1@hour")} size={70}>
          {t("What is one hour of your work really worth?")}
        </Title>
      </Abs>
      <Abs x={100} y={330} w={1000}>
        <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.navySoft, marginBottom: 10, ...appear(pop("w2@paid")) }}>{t("A typical week")}</div>
        <div style={{ display: "flex", borderRadius: 18, overflow: "hidden", border: `3px solid ${C.line}`, background: C.white, width: 1000 }}>
          <div style={{ width: 560 * ramp("w2@40", 0.6), height: 74, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", overflow: "hidden" }}>
            <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: C.white }}>{t("Paid: about 40 hours")}</span>
          </div>
          {seg("w2@commute", 150, C.yellow, "Commute")}
          {seg("w2@getting", 140, C.yellowSoft, "Prep")}
          {seg("w2@emails", 144, "#FFE08A", "Emails")}
        </div>
      </Abs>
      <Abs x={100} y={500} w={1000}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, ...appear(pop("w3@200")) }}>
          <Icon name="clock" size={96} color={C.white} bg={C.navy} />
          <span style={{ fontFamily: FONT, fontSize: 64, fontWeight: 1000, color: C.navy }}>{t("≈ 200 hours a month")}</span>
        </div>
      </Abs>
      <Abs x={100} y={660} w={1000}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: C.white,
            borderRadius: 28,
            padding: "18px 30px",
            boxShadow: "0 12px 30px rgba(20,37,74,0.12)",
            fontFamily: FONT,
            fontWeight: 1000,
            fontSize: 60,
            color: C.navy,
            ...appear(kEq),
          }}
        >
          <span>{t("$4,000")}</span>
          <span style={{ color: C.navySoft }}>÷</span>
          <span>{t("200 h")}</span>
          <span style={{ color: C.navySoft }}>≈</span>
          <span style={{ color: C.green, ...appear(pop("w4@$20")) }}>{t("$20 / hour")}</span>
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 8. Цена в часах
const Pips: React.FC<{ n: number; k: number }> = ({ n, k }) => (
  <div style={{ display: "flex", gap: 8 }}>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ opacity: Math.max(0, Math.min(1, k * n - i)), transform: `scale(${0.6 + 0.4 * Math.max(0, Math.min(1, k * n - i))})` }}>
        <Icon name="clock" size={44} color={C.navy} />
      </div>
    ))}
  </div>
);
export const HourPrice: React.FC = () => {
  const { pop, ramp } = useScene();
  const swap = ramp("u4", 0.4);
  return (
    <Shell>
      <Abs x={840} y={70} w={1000} style={{ opacity: 1 - swap * 0.85 }}>
        <Card k={pop("u1")} w={1000} tone="yellow" icon="heart" iconBg={C.red} label={<span>{t("Your value ≠ an hourly rate")}</span>} sub={t("The hour price is a tool for decisions")} />
      </Abs>
      <Abs x={840} y={250} w={1000} style={{ display: "flex", flexDirection: "column", gap: 18, opacity: 1 - swap * 0.85 }}>
        <div style={{ background: C.white, borderRadius: 26, padding: "20px 28px", boxShadow: "0 8px 24px rgba(20,37,74,0.1)", fontFamily: FONT, ...appear(pop("u2@sneakers")) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: C.navy }}>{t("Sneakers · $120")}</span>
            <span style={{ fontSize: 40, fontWeight: 1000, color: C.green, ...appear(pop("u2@six")) }}>{t("≈ 6 hours")}</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <Pips n={6} k={ramp("u2@six", 0.8)} />
          </div>
        </div>
        <div style={{ background: C.white, borderRadius: 26, padding: "20px 28px", boxShadow: "0 8px 24px rgba(20,37,74,0.1)", fontFamily: FONT, ...appear(pop("u2@delivery")) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: C.navy }}>{t("Delivery 3× a week · ~$20 each")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
            <Pips n={3} k={ramp("u2@roughly", 0.6)} />
            <span style={{ fontSize: 40, fontWeight: 1000, color: C.green, ...appear(pop("u2@roughly")) }}>{t("≈ 3 hours / week")}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <Pill k={pop("u3@worth")} bg={C.green} size={34}>
            {t("Sometimes worth it")}
          </Pill>
          <Pill k={pop("u3@not")} bg={C.white} color={C.navy} size={34}>
            {t("Sometimes not")}
          </Pill>
        </div>
      </Abs>
      <Abs x={840} y={320} w={1000} style={{ opacity: swap }}>
        <div style={{ background: C.navy, borderRadius: 32, padding: "34px 40px", fontFamily: FONT, color: C.white, boxShadow: "0 14px 40px rgba(20,37,74,0.25)" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.yellow }}>{t("Try it yourself")}</div>
          <div style={{ fontSize: 54, fontWeight: 1000, lineHeight: 1.15, marginTop: 8 }}>
            {t("Monthly take-home pay")}
            <br />{t("÷ all the hours work really takes")}
            <br />= <span style={{ color: C.yellow }}>{t("your hour")}</span>
          </div>
        </div>
      </Abs>
    </Shell>
  );
};


// ───────────────────────────── 7b. Сравнение работ: месяц против часа
const JobCard: React.FC<{ k: number; name: string; month: string; hours: string; rate: string; kh: number; kr: number; win: boolean }> = ({ k, name, month, hours, rate, kh, kr, win }) => (
  <div
    style={{
      width: 560,
      background: C.white,
      borderRadius: 34,
      padding: "28px 34px",
      fontFamily: FONT,
      color: C.navy,
      boxShadow: win && kr > 0.5 ? "0 18px 44px rgba(46,158,91,0.28)" : "0 10px 28px rgba(20,37,74,0.12)",
      border: `4px solid ${win && kr > 0.5 ? C.green : C.line}`,
      ...appear(k),
    }}
  >
    <div style={{ fontSize: 40, fontWeight: 1000 }}>{name}</div>
    <div style={{ fontSize: 30, fontWeight: 800, color: C.navySoft, marginTop: 12 }}>{t("Monthly pay")}</div>
    <div style={{ fontSize: 86, fontWeight: 1000, letterSpacing: -2, lineHeight: 1.05 }}>{month}</div>
    <div style={{ fontSize: 34, fontWeight: 800, color: C.navySoft, marginTop: 10, ...appear(kh, 8) }}>{t("÷ {n} real hours").replace("{n}", hours)}</div>
    <div style={{ height: 4, background: C.line, margin: "16px 0" }} />
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, ...appear(kr, 12) }}>
      <span style={{ fontSize: 96, fontWeight: 1000, color: win ? C.green : C.red, letterSpacing: -2 }}>{rate}</span>
      <span style={{ fontSize: 36, fontWeight: 800 }}>{t("/ hour")}</span>
    </div>
  </div>
);
export const Compare: React.FC = () => {
  const { pop } = useScene();
  return (
    <Shell>
      <Abs x={480} y={50} w={1380}>
        <Title k={pop("m1")} size={60}>
          {t("Monthly pay vs. the real hour")}
        </Title>
      </Abs>
      <Abs x={480} y={170} w={1380} style={{ display: "flex", gap: 40 }}>
        <JobCard k={pop("m2@Job")} name={t("Job A")} month={t("$4,500")} hours={t("250")} rate={t("$18")} kh={pop("m2@250")} kr={pop("m2@$18")} win={false} />
        <JobCard k={pop("m2@Job#1")} name={t("Job B")} month={t("$4,000")} hours={t("160")} rate={t("$25")} kh={pop("m2@160")} kr={pop("m2@$25")} win />
      </Abs>
      <Abs x={480} y={810} w={1380} style={{ textAlign: "center" }}>
        <Pill k={pop("m3@better")} bg={C.yellow} color={C.navy} size={36}>
          {t("A bigger paycheck isn't always a better hour")}
        </Pill>
      </Abs>
    </Shell>
  );
};
