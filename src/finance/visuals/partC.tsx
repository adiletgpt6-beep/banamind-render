// Визуальные блоки: цели и резерв, рост цены часа, реальная деятельность,
// масштабирование, итог, действие на сегодня, финал.
import React from "react";
import { interpolate } from "remotion";
import { t } from "../i18n";
import { C, FONT } from "../theme";
import { Icon, type IconName } from "../ui/Icons";
import { useScene } from "./ctx";
import { Abs, appear, Bar, Card, Kicker, Pill, Title, usd } from "./kit";
import { Shell } from "./partA";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ───────────────────────────── 14. Цели и резерв
const Jar: React.FC<{ k: number; label: string; v: string; color: string; h: number; icon: IconName }> = ({ k, label, v, color, h, icon }) => (
  <div style={{ width: 280, textAlign: "center", fontFamily: FONT, ...appear(k) }}>
    <div style={{ height: 220, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: 170, height: 40 + h * k, background: color, borderRadius: "22px 22px 30px 30px", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 14, boxSizing: "border-box" }}>
        <Icon name={icon} size={60} color={C.white} />
      </div>
    </div>
    <div style={{ fontSize: 52, fontWeight: 1000, color: C.navy, marginTop: 10 }}>{v}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: C.navySoft }}>{label}</div>
  </div>
);
export const Goals: React.FC = () => {
  const { pop, ramp, frame, at, fps } = useScene();
  const reserveMode = ramp("g3", 0.5);
  // помесячное пополнение резерва: 13 шагов по $600 за время реплики g4
  const a = at("g4@takes");
  const b = a + 3.2 * fps;
  const months = Math.floor(interpolate(frame, [a, b], [0, 13], clamp));
  const saved = Math.min(7800, months * 600);
  return (
    <Shell>
      <Abs x={860} y={60} w={980}>
        <Kicker k={pop("g1")}>{t("Step 4")}</Kicker>
        <Title k={pop("g1@goal")} size={62}>
          {t("A goal needs a number")}
        </Title>
      </Abs>
      <Abs x={860} y={240} w={980} style={{ opacity: 1 - ramp("g2", 0.4) }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            ["S", "Specific", "g5@specific"],
            ["M", "Measurable", "g5@measurable"],
            ["R", "Realistic", "g5@realistic"],
            ["M", "Meaningful", "g5@meaningful"],
            ["T", "Deadline", "g5@deadline"],
          ].map(([l, txt, c], i) => (
            <div key={i} style={{ width: 184, background: C.white, borderRadius: 24, padding: "16px 10px", textAlign: "center", fontFamily: FONT, boxShadow: "0 8px 22px rgba(20,37,74,0.1)", ...appear(pop(c)) }}>
              <div style={{ fontSize: 72, fontWeight: 1000, color: C.green, lineHeight: 1 }}>{l}</div>
              <div style={{ fontSize: 25, fontWeight: 800, color: C.navy, marginTop: 6 }}>{t(txt)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
          <Card k={pop("g5@rich")} w={980} tone="red" icon="x" iconBg={C.red} label={t("“I want to be rich”")} sub={t("no number, no deadline")} />
          <Card k={pop("g5@Build")} w={980} tone="green" icon="check" iconBg={C.green} label={t("“Build a $7,800 reserve in 13 months”")} sub={t("specific, measurable, with a deadline")} />
        </div>
      </Abs>
      <Abs x={860} y={250} w={980} style={{ opacity: Math.min(ramp("g2", 0.4), 1 - reserveMode), display: "flex", gap: 30, justifyContent: "center" }}>
        <Jar k={pop("g2@$600")} label={t("Reserve")} v={t("$600")} color={C.navy} h={150} icon="shield" />
        <Jar k={pop("g2@$250")} label={t("Skills fund")} v={t("$250")} color={C.green} h={70} icon="book" />
        <Jar k={pop("g2@$100")} label={t("Giving & small joys")} v={t("$100")} color={C.yellow} h={30} icon="heart" />
      </Abs>
      <Abs x={860} y={720} w={980} style={{ opacity: 1 - reserveMode, textAlign: "center" }}>
        <Pill k={pop("g2@splits")} bg={C.white} color={C.navy} size={30}>
          {t("$600 + $250 + $100 = $950 each month")}
        </Pill>
      </Abs>
      <Abs x={860} y={250} w={980} style={{ opacity: reserveMode }}>
        <Card k={pop("g3@cushion")} w={980} tone="white" icon="umbrella" iconBg={C.navy} label={t("Reserve: a cushion for surprises")} sub={t("a car repair, a few slow months")} />
        <div style={{ marginTop: 24, fontFamily: FONT, ...appear(pop("g3@target")) }}>
          <div style={{ fontSize: 40, fontWeight: 1000, color: C.navy }}>
            {t("Target: 3 months of essentials")}
          </div>
          <div style={{ fontSize: 46, fontWeight: 1000, color: C.navySoft, marginTop: 6 }}>
            {t("3 × $2,600 =")} <span style={{ color: C.green }}>{t("$7,800")}</span>
          </div>
        </div>
        <div style={{ marginTop: 40, ...appear(pop("g4")) }}>
          <Bar k={1} w={980} fill={saved / 7800} label={t("Month {m} of 13").replace("{m}", String(months))} right={`${t(usd(saved))} / ${t("$7,800")}`} h={56} />
          <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
            <Pill k={pop("g4@$600")} bg={C.navy} size={28}>
              {t("$600 a month")}
            </Pill>
            <Pill k={pop("g4@promised")} bg={C.white} color={C.navy} size={28}>
              {t("No promised returns · just steady deposits")}
            </Pill>
          </div>
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 15. Рост цены часа
export const HourUp: React.FC = () => {
  const { pop, ramp } = useScene();
  const q = ramp("r3", 0.5);
  const ideas: [string, IconName, string][] = [
    ["A certification", "book", "r3@certification"],
    ["A stronger skill your team needs", "tools", "r3@stronger"],
    ["Harder problems", "target", "r3@harder"],
    ["Ask for a raise, with results in hand", "chart", "r3@raise"],
  ];
  const path = ramp("r4", 0.5);
  return (
    <Shell>
      <Abs x={0} y={70} w={1920} style={{ opacity: 1 - q, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Kicker k={pop("r1")}>{t("Step 5")}</Kicker>
          <Title k={pop("r1@value")} size={74} align="center">
            {t("Grow the value of your hour")}
          </Title>
        </div>
      </Abs>
      <Abs x={60} y={300} w={520} style={{ opacity: 1 - q }}>
        <div style={{ ...appear(pop("r2")) }}>
          <div style={{ background: C.white, borderRadius: 30, padding: "26px 30px", boxShadow: "0 12px 30px rgba(20,37,74,0.12)", fontFamily: FONT, color: C.navy }}>
            <Icon name="question" size={70} color={C.white} bg={C.yellow} />
            <div style={{ fontSize: 40, fontWeight: 1000, lineHeight: 1.18, marginTop: 12 }}>{t("Doing roughly what I do now…")}</div>
          </div>
        </div>
      </Abs>
      <Abs x={1340} y={300} w={520} style={{ opacity: 1 - q }}>
        <div style={{ ...appear(pop("r2@how")) }}>
          <div style={{ background: C.navy, borderRadius: 30, padding: "26px 30px", fontFamily: FONT, color: C.white }}>
            <div style={{ fontSize: 40, fontWeight: 1000, lineHeight: 1.18 }}>
              {t("how could one hour of my work be worth")} <span style={{ color: C.yellow }}>{t("more")}</span>?
            </div>
          </div>
        </div>
      </Abs>
      <Abs x={100} y={80} w={1000} style={{ opacity: q * (1 - path) }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ideas.map(([txt, i, c]) => (
            <Card key={txt} k={pop(c)} w={980} label={t(txt)} icon={i} iconBg={C.green} />
          ))}
        </div>
      </Abs>
      <Abs x={100} y={140} w={1040} style={{ opacity: path }}>
        <Title k={pop("r4")} size={52}>
          {t("Alex's path")}
        </Title>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 40 }}>
          <Card k={pop("r4@skills")} w={300} label={t("Skills fund")} sub={t("$250 / month")} icon="wallet" iconBg={C.green} style={{ padding: "14px 16px" }} />
          <span style={{ fontSize: 50, color: C.navy, opacity: pop("r4@course") }}>→</span>
          <Card k={pop("r4@course")} w={260} label={t("A course")} icon="book" iconBg={C.navy} style={{ padding: "14px 16px" }} />
          <span style={{ fontSize: 50, color: C.navySoft, opacity: pop("r4@aims") }}>⇢</span>
          <div style={{ border: `4px dashed ${C.navySoft}`, borderRadius: 30, ...appear(pop("r4@role")) }}>
            <Card k={1} w={300} label={t("A role that pays more")} icon="briefcase" iconBg={C.navySoft} tone="sky" style={{ padding: "14px 16px", boxShadow: "none", border: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
          <Pill k={pop("r4@guaranteed")} bg={C.white} color={C.navy} size={30}>
            {t("Takes time · nothing guaranteed")}
          </Pill>
          <Pill k={pop("r4@carry")} bg={C.green} size={30}>
            {t("A skill you always carry")}
          </Pill>
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 16. Реальная деятельность — переменная прибыль
const Month: React.FC<{ k: number; title: string; rev: number; cost: number; kp: number; note?: string }> = ({ k, title, rev, cost, kp, note }) => (
  <div style={{ width: 430, background: C.white, borderRadius: 28, padding: "22px 26px", boxShadow: "0 10px 28px rgba(20,37,74,0.12)", fontFamily: FONT, color: C.navy, ...appear(k) }}>
    <div style={{ fontSize: 32, fontWeight: 1000, marginBottom: 8 }}>{title}</div>
    {[
      ["Revenue", usd(rev), C.navy],
      ["Costs", "−" + usd(cost), C.red],
    ].map(([a, b, c]) => (
      <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 800, padding: "6px 0" }}>
        <span style={{ color: C.navySoft }}>{t(a as string)}</span>
        <span style={{ color: c }}>{t(b as string)}</span>
      </div>
    ))}
    <div style={{ height: 4, background: C.line, margin: "8px 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 42, fontWeight: 1000, opacity: Math.min(1, kp * 1.4) }}>
      <span>{t("Profit")}</span>
      <span style={{ color: C.green }}>{t(usd(rev - cost))}</span>
    </div>
    {note ? <div style={{ fontSize: 24, fontWeight: 700, color: C.navySoft, marginTop: 4, opacity: kp }}>{note}</div> : null}
  </div>
);
export const RealActivity: React.FC = () => {
  const { pop, ramp } = useScene();
  const partner = ramp("v6", 0.5);
  const k1 = pop("v3@Profit");
  const k2 = pop("v4@Profit");
  return (
    <Shell>
      <Abs x={100} y={70} w={1100} style={{ opacity: 1 - Math.max(partner, ramp("v3", 0.4)) }}>
        <Title k={pop("v1@real")} size={72}>
          {t("Real activity,")} <span style={{ color: C.green }}>{t("real profit")}</span>
        </Title>
        <div style={{ marginTop: 40, ...appear(pop("v2@tuning")) }}>
          <Card k={1} w={760} icon="bike" iconBg={C.green} label={t("Weekend bike tune-ups")} sub={t("a small service for neighbors")} />
        </div>
      </Abs>
      <Abs x={480} y={60} w={1380} style={{ opacity: ramp("v3", 0.4) * (1 - partner) }}>
        <div style={{ display: "flex", gap: 30, alignItems: "flex-start" }}>
          <Month k={pop("v3@revenue")} title={t("Month 1")} rev={600} cost={250} kp={k1} note={t("before taxes on it")} />
          <Month k={pop("v4@next")} title={t("Month 2")} rev={300} cost={200} kp={k2} />
          {/* столбики прибыли */}
          <div style={{ width: 380, height: 420, display: "flex", alignItems: "flex-end", gap: 40, padding: "0 30px", borderBottom: `5px solid ${C.navy}`, fontFamily: FONT }}>
            {[
              [350, k1, "M1"],
              [100, k2, "M2"],
            ].map(([v, k, l]) => (
              <div key={l as string} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 1000, color: C.green, opacity: k as number }}>{t(usd(v as number))}</div>
                <div style={{ height: (v as number) * 0.95 * (k as number), background: C.green, borderRadius: "14px 14px 0 0" }} />
                <div style={{ fontSize: 26, fontWeight: 800, color: C.navySoft, marginTop: 8, marginBottom: -46 }}>{t(l as string)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 90 }}>
          <Pill k={pop("v5@down")} bg={C.navy} size={32}>
            {t("Profit goes up and down")}
          </Pill>
          <Pill k={pop("v5@promised")} bg={C.white} color={C.navy} size={32}>
            {t("No promised rate")}
          </Pill>
          <Pill k={pop("v5@lose")} bg={C.redSoft} color={C.navy} size={32}>
            {t("Losses are possible")}
          </Pill>
        </div>
      </Abs>
      <Abs x={100} y={70} w={1150} style={{ opacity: partner }}>
        <Title k={pop("v6@partner")} size={56}>
          {t("Investing as a partner")}
        </Title>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 34 }}>
          <Card k={pop("v6@money")} w={250} label={t("You")} icon="person" iconBg={C.green} style={{ padding: "14px 16px" }} />
          <span style={{ fontSize: 50, color: C.navy }}>+</span>
          <Card k={pop("v6@business")} w={420} label={t("A real business")} icon="store" iconBg={C.navy} style={{ padding: "14px 16px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 34 }}>
          <Card k={pop("v6@shares")} w={1000} tone="green" icon="check" iconBg={C.green} label={t("Share the actual profit — and the losses too")} />
          <Card k={pop("v6@fixed")} w={1000} tone="red" icon="x" iconBg={C.red} label={t("A fixed, guaranteed payout on the money you put in")} />
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 17. Масштабирование
export const Scale: React.FC = () => {
  const { pop, ramp, frame } = useScene();
  const many = ramp("k2@many", 0.9);
  return (
    <Shell>
      <Abs x={860} y={60} w={980}>
        <Title k={pop("k1@scaling")} size={70}>
          {t("Scaling")}
        </Title>
      </Abs>
      <Abs x={860} y={200} w={980}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, ...appear(pop("k1@hour")) }}>
          <Icon name="clock" size={110} color={C.white} bg={C.navy} />
          <span style={{ fontSize: 60, color: C.navy }}>→</span>
          <Icon name="person" size={110} color={C.navy} />
          <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: C.navy }}>{t("1 hour, sold once")}</span>
        </div>
      </Abs>
      <Abs x={860} y={330} w={980}>
        <div style={{ display: "flex", alignItems: "center", gap: 26, ...appear(pop("k2")) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(["book", "pen", "laptop"] as IconName[]).map((n, i) => (
              <div key={n} style={appear(pop(["k2@guide", "k2@design", "k2@tool"][i]), 8)}>
                <Icon name={n} size={64} color={C.white} bg={C.green} />
              </div>
            ))}
          </div>
          <span style={{ fontSize: 60, color: C.green }}>→</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 64px)", gap: 10 }}>
            {Array.from({ length: 18 }).map((_, i) => {
              const k = Math.max(0, Math.min(1, many * 18 - i));
              return (
                <div key={i} style={{ opacity: k, transform: `translateY(${(1 - k) * 10 + Math.sin(frame / 18 + i) * 2}px)` }}>
                  <Icon name="person" size={60} color={i % 3 === 0 ? C.green : C.navy} />
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 900, color: C.navy, marginTop: 16, ...appear(pop("k2@once")) }}>{t("Build once, useful to many")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18, ...appear(pop("k2@location")) }}>
          <Icon name="store" size={64} color={C.white} bg={C.navy} />
          <span style={{ fontSize: 40, color: C.navy }}>→</span>
          <Icon name="store" size={64} color={C.white} bg={C.navy} />
          <Icon name="store" size={64} color={C.white} bg={C.green} />
          <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: C.navySoft }}>{t("a second location of a shop that works")}</span>
        </div>
      </Abs>
      <Abs x={860} y={810} w={980} style={{ display: "flex", gap: 14 }}>
        <Pill k={pop("k3@time")} bg={C.white} color={C.navy} size={28}>
          {t("Upfront time & effort")}
        </Pill>
        <Pill k={pop("k3@money")} bg={C.white} color={C.navy} size={28}>
          {t("Costs")}
        </Pill>
        <Pill k={pop("k3@might")} bg={C.redSoft} color={C.navy} size={28}>
          {t("Might not work out")}
        </Pill>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 18. Итог
const RECAP: [string, IconName, string][] = [
  ["Know where you stand", "target", "z2@stand"],
  ["Know the price of your hour", "clock", "z2@hour"],
  ["Watch where money flows", "wallet", "z2@flows"],
  ["Give every dollar a goal", "pen", "z2@goal"],
  ["Grow your income, honestly", "seed", "z2@grow"],
];
export const Recap: React.FC = () => {
  const { pop } = useScene();
  return (
    <Shell>
      <Abs x={100} y={70} w={1050}>
        <Title k={pop("z1")} size={70}>
          {t("The money system")}
        </Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 28 }}>
          {RECAP.map(([txt, i, c], n) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 18, ...appear(pop(c)) }}>
              <div style={{ width: 66, height: 66, borderRadius: 33, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={44} color={C.white} />
              </div>
              <Card k={1} w={880} label={`${n + 1}. ${t(txt)}`} icon={i} iconBg={C.navy} style={{ padding: "12px 20px" }} />
            </div>
          ))}
        </div>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 19. Действие на сегодня
const TODO: [string, string][] = [
  ["Write down your monthly take-home pay", "d2@Write"],
  ["List last month's spending in groups", "d2@List"],
  ["Subtract to find your leftover", "d2@Subtract"],
  ["Divide your pay by your real work hours", "d2@divide"],
  ["Pick one goal and give it a number", "d3@Pick"],
  ["Make the first small transfer", "d3@transfer"],
];
export const Today: React.FC = () => {
  const { pop, ramp } = useScene();
  return (
    <Shell>
      <Abs x={860} y={50} w={980}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Title k={pop("d1@move")} size={64}>
            {t("Your move today")}
          </Title>
          <Pill k={pop("d1@twenty")} bg={C.yellow} color={C.navy} size={30}>
            {t("~20 minutes")}
          </Pill>
        </div>
      </Abs>
      <Abs x={860} y={180} w={980} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TODO.map(([txt, c], i) => {
          const k = pop(c);
          const done = ramp(c, 0.4);
          return (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 18, background: C.white, borderRadius: 22, padding: "12px 20px", boxShadow: "0 6px 18px rgba(20,37,74,0.08)", fontFamily: FONT, ...appear(k) }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, border: `4px solid ${C.green}`, background: done > 0.6 ? C.green : C.white, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
                {done > 0.6 ? <Icon name="check" size={36} color={C.white} /> : <span style={{ fontWeight: 1000, fontSize: 26, color: C.green }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 34, fontWeight: 800, color: C.navy }}>{t(txt)}</span>
            </div>
          );
        })}
      </Abs>
      <Abs x={860} y={800}>
        <Pill k={pop("d3@counts")} bg={C.green} size={30}>
          {t("Even a small one counts")}
        </Pill>
      </Abs>
    </Shell>
  );
};

// ───────────────────────────── 20. Финал
export const Outro: React.FC = () => {
  const { pop, frame } = useScene();
  const k = pop("o1@subscribe");
  const pulse = 1 + Math.max(0, Math.sin(frame / 9)) * 0.03 * k;
  return (
    <Shell>
      <Abs x={0} y={80} w={1920} style={{ textAlign: "center" }}>
        <Title k={pop("o1")} size={72} align="center">
          {t("One clear step at a time")}
        </Title>
      </Abs>
      <Abs x={1290} y={380} w={560}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            background: C.red,
            color: C.white,
            borderRadius: 999,
            padding: "22px 40px",
            fontFamily: FONT,
            fontWeight: 1000,
            fontSize: 50,
            boxShadow: "0 14px 36px rgba(217,83,79,0.35)",
            transform: `scale(${pulse})`,
            ...appear(k),
          }}
        >
          <Icon name="bell" size={64} color={C.white} />
          {t("Subscribe")}
        </div>
      </Abs>
      <Abs x={90} y={420} w={560}>
        <Card k={pop("o1@next")} w={520} tone="white" icon="seed" iconBg={C.green} label={t("Next episode")} sub={t("building this system further")} />
      </Abs>
    </Shell>
  );
};
