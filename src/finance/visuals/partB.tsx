// Визуальные блоки: источники дохода, актив/обязательство/денежный поток,
// три модели движения денег, утечки, «тратить меньше, чем зарабатываешь».
import React from "react";
import { t } from "../i18n";
import { C, FONT } from "../theme";
import { Icon, type IconName } from "../ui/Icons";
import { useScene } from "./ctx";
import { Abs, appear, Arrow, Card, Kicker, Pill, Title } from "./kit";
import { Shell } from "./partA";

// ───────────────────────────── 9. Карта источников дохода
const BOXES: { n: string; t: string; sub: string; icon: IconName; cue: string }[] = [
  { n: "1", t: "A job", sub: "Time and skill for a paycheck", icon: "briefcase", cue: "q3" },
  { n: "2", t: "Self-employed", sub: "Your own service: design, repairs, tutoring", icon: "tools", cue: "q4" },
  { n: "3", t: "A business", sub: "A system and a team, beyond your own hours", icon: "store", cue: "q5" },
  { n: "4", t: "Productive assets", sub: "Part of a real business, a rental, creative work", icon: "key", cue: "q6" },
];
export const Quadrant: React.FC = () => {
  const { pop, ramp, frame, at } = useScene();
  const grid = pop("q2");
  const active = BOXES.findIndex((b, i) => frame >= at(b.cue) && (i === 3 || frame < at(BOXES[i + 1].cue)));
  const even = ramp("q7", 0.5);
  return (
    <Shell>
      <Abs x={0} y={110} w={1920} style={{ opacity: 1 - grid, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Kicker k={pop("q1")}>{t("Step 3")}</Kicker>
        </div>
      </Abs>
      <Abs x={1290} y={300} w={600} style={{ opacity: 1 - grid }}>
        <Title k={pop("q1@income")} size={64}>
          {t("Where income can come from")}
        </Title>
      </Abs>
      <Abs x={500} y={60} w={1360} style={{ opacity: grid }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontFamily: FONT, fontSize: 48, fontWeight: 1000, color: C.navy }}>{t("Where income can come from")}</span>
          <Pill k={pop("q2@sketch")} bg={C.yellow} color={C.navy} size={28}>
            {t("A sketch, not a law")}
          </Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          {BOXES.map((b, i) => {
            const k = pop(b.cue);
            const on = i === active && even < 0.5;
            return (
              <div
                key={b.n}
                style={{
                  height: 300,
                  boxSizing: "border-box",
                  borderRadius: 32,
                  padding: "26px 30px",
                  background: on ? C.white : "rgba(255,255,255,0.72)",
                  border: `4px solid ${on ? C.green : C.line}`,
                  boxShadow: on ? "0 16px 40px rgba(20,37,74,0.16)" : "0 6px 18px rgba(20,37,74,0.06)",
                  fontFamily: FONT,
                  color: C.navy,
                  transform: `scale(${on ? 1.02 : 1})`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: C.navy, color: C.white, fontSize: 38, fontWeight: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {b.n}
                  </div>
                  <span style={{ fontSize: 46, fontWeight: 1000, ...appear(k, 10) }}>{t(b.t)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, ...appear(k, 10) }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: C.navySoft, lineHeight: 1.25 }}>{t(b.sub)}</span>
                  <Icon name={b.icon} size={92} color={C.white} bg={C.green} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 22, justifyContent: "center" }}>
          <Pill k={pop("q7@better")} bg={C.navy} size={30}>
            {t("No box is better by default")}
          </Pill>
          <Pill k={pop("q7@time")} bg={C.white} color={C.navy} size={30}>
            {t("Every source takes time · money · risk")}
          </Pill>
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 10. Актив, обязательство, денежный поток
const Col: React.FC<{ k: number; title: string; color: string; children: React.ReactNode; def: string; kd: number }> = ({ k, title, color, children, def, kd }) => (
  <div style={{ width: 320, ...appear(k) }}>
    <div style={{ background: color, color: C.white, borderRadius: 22, padding: "14px 18px", fontFamily: FONT, fontSize: 38, fontWeight: 1000, textAlign: "center" }}>{title}</div>
    <div style={{ fontFamily: FONT, fontSize: 25, fontWeight: 700, color: C.navySoft, padding: "12px 6px", minHeight: 96, lineHeight: 1.25, ...appear(kd, 8) }}>{def}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
  </div>
);
const Chip: React.FC<{ k: number; icon: IconName; label: string; bg: string }> = ({ k, icon, label, bg }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.white, borderRadius: 18, padding: "8px 14px", fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.navy, boxShadow: "0 6px 16px rgba(20,37,74,0.08)", ...appear(k, 10) }}>
    <Icon name={icon} size={46} color={C.white} bg={bg} />
    {label}
  </div>
);
export const Assets: React.FC = () => {
  const { pop, ramp } = useScene();
  const house = ramp("x5", 0.5);
  return (
    <Shell>
      <Abs x={90} y={70} w={1080} style={{ opacity: 1 - house, display: "flex", gap: 30 }}>
        <Col k={pop("x1@assets")} kd={pop("x2")} title={t("Asset")} color={C.green} def={t("Something you own that has value")}>
          <Chip k={pop("x2@savings")} icon="coin" label={t("Savings")} bg={C.green} />
          <Chip k={pop("x2@tools")} icon="tools" label={t("Tools")} bg={C.green} />
          <Chip k={pop("x2@car")} icon="car" label={t("A car")} bg={C.green} />
          <Chip k={pop("x2@home")} icon="home" label={t("A home")} bg={C.green} />
        </Col>
        <Col k={pop("x1@liabilities")} kd={pop("x3")} title={t("Liability")} color={C.red} def={t("Something you owe to someone else")}>
          <Chip k={pop("x3@bill")} icon="bill" label={t("An unpaid bill")} bg={C.red} />
          <Chip k={pop("x3@debt")} icon="tax" label={t("A debt")} bg={C.red} />
        </Col>
        <Col k={pop("x1@cash")} kd={pop("x4")} title={t("Cash flow")} color={C.navy} def={t("Money moving in or out each month")}>
          <Chip k={pop("x4@in")} icon="wallet" label={t("In  ↓")} bg={C.green} />
          <Chip k={pop("x4@out")} icon="wallet" label={t("Out  ↑")} bg={C.red} />
        </Col>
      </Abs>
      <Abs x={470} y={60} w={1400} style={{ opacity: house }}>
        <div style={{ position: "relative", width: 1400, height: 820 }}>
          {/* дом в центре */}
          <div style={{ position: "absolute", left: 520, top: 220, width: 360, textAlign: "center", ...appear(pop("x5@house")) }}>
            <Icon name="home" size={300} color={C.navy} />
            <div style={{ marginTop: -6 }}>
              <Pill k={pop("x5@asset")} bg={C.green} size={36}>
                {t("Asset")}
              </Pill>
            </div>
          </div>
          {/* расходы — деньги уходят */}
          {[
            ["Property tax", "x5@property", 40],
            ["Insurance", "x5@insurance", 200],
            ["Repairs", "x5@repairs", 360],
          ].map(([txt, c, y]) => (
            <React.Fragment key={txt as string}>
              <div style={{ position: "absolute", left: 0, top: y as number, ...appear(pop(c as string)) }}>
                <Card k={1} w={330} tone="red" label={t(txt as string)} sub={t("cash going out")} style={{ padding: "14px 20px" }} />
              </div>
              <Arrow x1={560} y1={380} x2={340} y2={(y as number) + 52} k={ramp(c as string, 0.5)} color={C.red} width={6} />
            </React.Fragment>
          ))}
          <div style={{ position: "absolute", left: 0, top: 560, width: 520, ...appear(pop("x5@turn")) }}>
            <Card k={1} w={500} tone="yellow" icon="check" iconBg={C.green} label={t("Costs don't make it a liability")} style={{ padding: "16px 20px" }} />
          </div>
          {/* доход от аренды комнаты */}
          <div style={{ position: "absolute", left: 1040, top: 200, ...appear(pop("x6@rent")) }}>
            <Card k={1} w={360} tone="green" label={t("Room rent")} sub={t("cash coming in")} icon="key" iconBg={C.green} style={{ padding: "14px 20px" }} />
          </div>
          <Arrow x1={1040} y1={260} x2={860} y2={340} k={ramp("x6@rent", 0.5)} color={C.green} width={6} />
          <div style={{ position: "absolute", left: 980, top: 470, display: "flex", flexDirection: "column", gap: 12 }}>
            <Pill k={pop("x6@Three")} bg={C.green} size={30}>
              {t("Asset: the house")}
            </Pill>
            <Pill k={pop("x6@separate")} bg={C.red} size={30}>
              {t("Costs: cash out")}
            </Pill>
            <Pill k={pop("x6@separate#1")} bg={C.navy} size={30}>
              {t("Rent: cash in")}
            </Pill>
          </div>
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 11. Три модели движения денег
const Node: React.FC<{ k: number; label: string; icon: IconName; bg: string; w?: number; tone?: "white" | "green" | "red" | "yellow" }> = ({ k, label, icon, bg, w = 250, tone = "white" }) => (
  <div style={{ width: w, ...appear(k, 12) }}>
    <Card k={1} w={w} label={<span style={{ fontSize: 28 }}>{label}</span>} icon={icon} iconBg={bg} tone={tone} style={{ padding: "12px 14px", gap: 12 }} />
  </div>
);
const Flow: React.FC<{ y: number; k: number; dim: number; title: string; children: React.ReactNode }> = ({ y, k, dim, title, children }) => (
  <Abs x={470} y={y} w={1400} style={{ opacity: Math.min(1, k * 1.5) * (1 - dim * 0.55) }}>
    <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 1000, color: C.navy, marginBottom: 8 }}>{title}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{children}</div>
  </Abs>
);
const To: React.FC<{ k: number; color?: string }> = ({ k, color = C.navy }) => (
  <svg width={60} height={30} style={{ opacity: k }}>
    <path d="M 4 15 L 44 15" stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={40} strokeDashoffset={40 * (1 - k)} />
    <path d="M 40 4 L 56 15 L 40 26 Z" fill={color} opacity={k > 0.9 ? 1 : 0} />
  </svg>
);
export const Patterns: React.FC = () => {
  const { pop, ramp } = useScene();
  const d1 = ramp("c3", 0.5);
  const d2 = ramp("c4", 0.5);
  const final = ramp("c5", 0.5);
  return (
    <Shell>
      <Abs x={470} y={36} w={1400}>
        <Title k={pop("c1")} size={56}>
          {t("Three ways money moves")}
        </Title>
      </Abs>
      <Flow y={140} k={pop("c2")} dim={Math.max(d1, final * 0.6)} title={t("Pattern 1")}>
        <Node k={pop("c2@money")} label={t("Paycheck")} icon="wallet" bg={C.green} w={230} />
        <To k={ramp("c2@goes", 0.4)} />
        <Node k={pop("c2@expenses")} label={t("All to expenses")} icon="cart" bg={C.navy} w={330} />
        <To k={ramp("c2@Every", 0.4)} />
        <Node k={pop("c2@resets")} label={t("Back to $0")} icon="x" bg={C.red} tone="red" w={260} />
      </Flow>
      <Flow y={370} k={pop("c3")} dim={Math.max(d2, final * 0.6)} title={t("Pattern 2")}>
        <Node k={pop("c3@money")} label={t("Paycheck")} icon="wallet" bg={C.green} w={230} />
        <To k={ramp("c3@payments", 0.4)} />
        <Node k={pop("c3@payments")} label={t("Payments on borrowed money")} icon="lock" bg={C.red} tone="red" w={420} />
        <To k={ramp("c3@Next", 0.4)} />
        <Node k={pop("c3@spoken")} label={t("Next paycheck already spoken for")} icon="bill" bg={C.red} w={440} />
      </Flow>
      <Flow y={600} k={pop("c4")} dim={0} title={t("Pattern 3")}>
        <Node k={pop("c4@money")} label={t("Paycheck")} icon="wallet" bg={C.green} w={210} />
        <To k={ramp("c4@covered", 0.4)} />
        <Node k={pop("c4@covered")} label={t("Expenses covered")} icon="check" bg={C.navy} w={260} />
        <To k={ramp("c4@stays", 0.4)} color={C.green} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Node k={pop("c4@reserve")} label={t("Reserve")} icon="shield" bg={C.green} w={260} tone="green" />
          <Node k={pop("c4@goals")} label={t("Goals & skills")} icon="target" bg={C.green} w={260} tone="green" />
        </div>
        <To k={ramp("c4@time", 0.4)} color={C.green} />
        <Node k={pop("c4@productive")} label={t("Real, productive activity")} icon="seed" bg={C.green} w={320} tone="green" />
      </Flow>
      <Abs x={470} y={36} w={1400} style={{ textAlign: "right" }}>
        <Pill k={final} bg={C.yellow} color={C.navy} size={30}>
          {t("Same paycheck · different direction")}
        </Pill>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 12. Где утекают деньги
export const Leaks: React.FC = () => {
  const { pop, ramp } = useScene();
  const gross = ramp("l2@gross", 0.8);
  return (
    <Shell>
      <Abs x={860} y={60} w={980}>
        <Title k={pop("l1")} size={64}>
          {t("Where money slips away")}
        </Title>
      </Abs>
      <Abs x={860} y={200} w={980}>
        <div style={{ ...appear(pop("l2")) }}>
          <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 1000, color: C.navy, marginBottom: 10 }}>{t("1 · Deductions")}</div>
          <div style={{ display: "flex", height: 70, borderRadius: 18, overflow: "hidden", border: `3px solid ${C.line}` }}>
            <div style={{ width: `${72}%`, background: C.green, display: "flex", alignItems: "center", paddingLeft: 18, fontFamily: FONT, fontWeight: 900, fontSize: 28, color: C.white, whiteSpace: "nowrap" }}>
              {t("Take-home $4,000")}
            </div>
            <div style={{ width: `${28 * gross}%`, background: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 20, color: C.navy, whiteSpace: "nowrap", overflow: "hidden" }}>
              {t("Taxes & deductions")}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 26, fontWeight: 800, color: C.navySoft, marginTop: 8 }}>
            <span style={appear(pop("l2@stub"), 6)}>{t("Read your pay stub")}</span>
            <span style={appear(gross, 6)}>{t("Gross pay = the whole bar")}</span>
          </div>
        </div>
      </Abs>
      <Abs x={860} y={420} w={980}>
        <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 1000, color: C.navy, marginBottom: 10, ...appear(pop("l3")) }}>{t("2 · Charges")}</div>
        <div style={{ display: "flex", gap: 12 }}>
          <Pill k={pop("l3@late")} bg={C.redSoft} color={C.navy} size={28}>
            {t("Late fees")}
          </Pill>
          <Pill k={pop("l3@overdraft")} bg={C.redSoft} color={C.navy} size={28}>
            {t("Overdraft fees")}
          </Pill>
          <Pill k={pop("l3@interest")} bg={C.redSoft} color={C.navy} size={28}>
            {t("Interest charges")}
          </Pill>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <Pill k={pop("l3@avoid")} bg={C.navy} size={28}>
            {t("✕ No interest-based debt")}
          </Pill>
          <Pill k={pop("l3@time")} bg={C.green} size={28}>
            {t("✓ Pay bills on time")}
          </Pill>
        </div>
      </Abs>
      <Abs x={860} y={650} w={980}>
        <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 1000, color: C.navy, marginBottom: 10, ...appear(pop("l4")) }}>{t("3 · Small automatic spending")}</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            ["Forgotten subscriptions", "l4@subscriptions"],
            ["Delivery fees", "l4@delivery"],
            ["Impulse buys", "l4@impulse"],
          ].map(([txt, c]) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 8, ...appear(pop(c), 10) }}>
              <Icon name="drop" size={40} color={C.skyDeep} />
              <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 800, color: C.navy }}>{t(txt)}</span>
            </div>
          ))}
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 13. Тратить меньше, чем зарабатываешь
const Change: React.FC<{ k: number; ks: number; label: string; from: string; to: string }> = ({ k, ks, label, from, to }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 22, background: C.white, borderRadius: 24, padding: "16px 26px", fontFamily: FONT, boxShadow: "0 8px 22px rgba(20,37,74,0.09)", ...appear(k) }}>
    <span style={{ fontSize: 34, fontWeight: 900, color: C.navy, flex: 1 }}>{label}</span>
    <span style={{ position: "relative", fontSize: 42, fontWeight: 1000, color: C.navySoft }}>
      {from}
      <span style={{ position: "absolute", left: -4, right: -4, top: "52%", height: 5, background: C.red, transform: `scaleX(${ks})`, transformOrigin: "left", borderRadius: 3 }} />
    </span>
    <span style={{ fontSize: 34, color: C.navySoft, opacity: ks }}>→</span>
    <span style={{ fontSize: 46, fontWeight: 1000, color: C.green, opacity: ks }}>{to}</span>
  </div>
);
export const Trim: React.FC = () => {
  const { pop, ramp } = useScene();
  return (
    <Shell>
      <Abs x={100} y={50} w={1100}>
        <Title k={pop("t1@spend")} size={60}>
          {t("Spend")} <span style={{ color: C.green }}>{t("less")}</span> {t("than you earn")}
        </Title>
        <div style={{ marginTop: 16 }}>
          <Pill k={pop("t1@Clearly")} bg={C.yellow} color={C.navy} size={30}>
            {t("Clearly less")}
          </Pill>
        </div>
      </Abs>
      <Abs x={100} y={300} w={1000} style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <Pill k={pop("t2@essentials")} bg={C.navy} size={26}>
          {t("✓ Essentials stay")}
        </Pill>
        <Pill k={pop("t2@Rest")} bg={C.white} color={C.navy} size={26}>
          {t("✓ Rest")}
        </Pill>
        <Pill k={pop("t2@family")} bg={C.white} color={C.navy} size={26}>
          {t("✓ Family")}
        </Pill>
        <Pill k={pop("t2@joys")} bg={C.white} color={C.navy} size={26}>
          {t("✓ Small joys")}
        </Pill>
      </Abs>
      <Abs x={100} y={410} w={1000} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Change k={pop("t3@Delivery")} ks={ramp("t3@$200", 0.4)} label={t("Delivery")} from={t("$300")} to={t("$200")} />
        <Change k={pop("t3@subscriptions")} ks={ramp("t3@$40", 0.4)} label={t("Subscriptions")} from={t("$90")} to={t("$40")} />
      </Abs>
      <Abs x={100} y={640} w={1000} style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1, ...appear(pop("t4@Spending")) }}>
          <Card k={1} w={480} label={t("Spending")} sub={<span>{t("$3,200")} → <b style={{ color: C.navy }}>{t("$3,050")}</b></span>} icon="cart" iconBg={C.navy} />
        </div>
        <div style={{ flex: 1, ...appear(pop("t4@leftover")) }}>
          <Card k={1} w={480} tone="green" label={t("Leftover")} sub={<span>$800 → <b style={{ color: C.greenDark, fontSize: 34 }}>$950</b></span>} icon="wallet" iconBg={C.green} />
        </div>
      </Abs>
    </Shell>
  );
};
