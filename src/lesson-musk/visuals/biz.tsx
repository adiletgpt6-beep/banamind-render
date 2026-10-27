// Сцены BM-029 о первых компаниях: Zip2, контроль и инвестор, продажи, X.com,
// гонка с Confinity, смещение с поста и «две версии» спорных эпизодов.
import React from "react";
import { C, DC, DISPLAY, FONT } from "../theme";
import { Coins, DateCard } from "./objects";
import { Appear, area, Arrow, at, clamp01, Drift, pop, ramp, Txt, type VisualProps } from "./kit";
import { Card, Label, OL, Person } from "./people";

// ── Zip2: справочник + карта, братья, деньги, наставник ──
export const Zip2Map: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const mapK = ramp(t, b1, 0.8);
  const route = clamp01((t - b1 - 1) / 2);
  const pins = [
    { x: -220, y: -90 },
    { x: 60, y: -150 },
    { x: 170, y: 40 },
    { x: -80, y: 90 },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.035}>
      {/* братья-основатели */}
      <g transform={`translate(${cx - 380} 0)`} opacity={1 - mapK * 0.15}>
        <Person who="founder" x={-60} y={800} s={0.5} mood="happy" pose={t < b1 ? "wave" : "point"} t={t} />
        <Person who="brother" x={90} y={800} s={0.48} mood="smile" pose="stand" t={t} seed={2} />
        <Appear t={t} at={0.6}>
          <Label x={15} y={300} text="Илон + Кимбал" size={32} bg={C.paper} />
        </Appear>
      </g>
      {/* карта со справочником */}
      <g transform={`translate(${cx + 170} 470)`} opacity={mapK}>
        <rect x={-300} y={-230} width={600} height={430} rx={26} fill="#e8f3e4" stroke={OL} strokeWidth={5} />
        {[-180, -60, 60, 180].map((x) => (
          <line key={x} x1={x} y1={-230} x2={x + 30} y2={200} stroke="#fff" strokeWidth={14} />
        ))}
        {[-140, -20, 100].map((y) => (
          <line key={y} x1={-300} y1={y} x2={300} y2={y + 20} stroke="#fff" strokeWidth={14} />
        ))}
        <path d={`M -220 -90 L -200 -10 L 60 0 L 170 40`} fill="none" stroke={DC.ppl.color} strokeWidth={10} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - route)} />
        {pins.map((q, i) => {
          const k = pop(t, b1 + 0.3 + i * 0.2);
          return (
            <g key={i} transform={`translate(${q.x} ${q.y}) scale(${k})`}>
              <path d="M 0 0 C -26 -30 -26 -62 0 -62 C 26 -62 26 -30 0 0 Z" fill={i === 2 ? DC.ppl.color : DC.eng.color} stroke={OL} strokeWidth={3} />
              <circle cx={0} cy={-40} r={9} fill="#fff" />
            </g>
          );
        })}
        <g transform="translate(-300 -230)">
          <rect x={-170} y={20} width={180} height={220} rx={14} fill="#fff" stroke={OL} strokeWidth={4} opacity={ramp(t, b1 + 0.6, 0.5)} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={-150} y={44 + i * 38} width={140 - (i % 2) * 40} height={14} rx={6} fill={C.inkSoft} opacity={ramp(t, b1 + 0.7 + i * 0.1, 0.4)} />
          ))}
        </g>
      </g>
      {/* мало денег */}
      {t > b2 && (
        <g>
          <Coins x={cx + 470} y={860} n={Math.round(3 * ramp(t, b2, 0.8))} s={0.7} />
          <Appear t={t} at={b2 + 0.3}>
            <Label x={cx + 470} y={710} text="28 тыс. $" size={34} bg={DC.res.light} />
          </Appear>
        </g>
      )}
      {t > b3 && (
        <Appear t={t} at={b3}>
          <Person who="investor" x={cx - 140} y={810} s={0.44} mood="kind" pose="give" t={t} item={<Coins x={0} y={0} n={1} s={0.35} />} />
          <Label x={cx - 140} y={560} text="наставник" size={30} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Код героя и работа команды ──
export const CodeRewrite: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const N = 14;
  const fixK = clamp01((t - at(ctx, 0.55)) / 3);
  const bad = (i: number) => (i * 7) % 3 === 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.035}>
      <g transform={`translate(${cx - 120} 480)`}>
        <rect x={-260} y={-290} width={520} height={560} rx={24} fill="#22284a" stroke={OL} strokeWidth={5} />
        {Array.from({ length: N }, (_, i) => {
          const k = ramp(t, 0.2 + i * 0.12, 0.3);
          const fixed = bad(i) && fixK * N > i;
          const col = bad(i) ? (fixed ? C.green : C.red) : "#7fb5ff";
          return <rect key={i} x={-220 + (i % 3) * 20} y={-250 + i * 37} width={(220 + ((i * 53) % 200)) * k} height={18} rx={8} fill={col} opacity={0.95} />;
        })}
      </g>
      {/* команда инженеров переписывает */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={ramp(t, at(ctx, 0.5 + i * 0.12), 0.5)}>
          <Person who={(["engineer", "engineer2", "manager"] as const)[i]} x={cx + 260 + i * 120} y={820} s={0.38} mood="think" pose={i === 1 ? "point" : "stand"} t={t} seed={i} flip />
        </g>
      ))}
      {t > b1 && (
        <Appear t={t} at={b1 + 0.2}>
          <g transform={`translate(${cx + 330} 300)`}>
            <Card x={0} y={-70} w={360} h={100} lines={["«один час»"]} edge={DC.res.color} />
            <Arrow x1={0} y1={-12} x2={0} y2={40} k={ramp(t, b1 + 0.8, 0.4)} color="#fff" w={7} />
            <g opacity={ramp(t, b1 + 1.1, 0.4)}>
              <Card x={0} y={110} w={360} h={100} lines={["день или два"]} edge={DC.res.deep} />
            </g>
          </g>
        </Appear>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.3}>
          <g transform={`translate(${cx - 120} 190)`}>
            <rect x={-280} y={-50} width={560} height={90} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={36}>
              черновик → продукт
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Деньги в обмен на контроль (кресло директора) ──
const Chair: React.FC<{ x: number; y: number; label: string; color: string }> = ({ x, y, label, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-170} width={140} height={150} rx={22} fill={color} stroke={OL} strokeWidth={5} />
    <rect x={-80} y={-30} width={160} height={36} rx={12} fill={color} stroke={OL} strokeWidth={5} />
    <path d="M -60 6 L -64 70 M 60 6 L 64 70" stroke={OL} strokeWidth={9} strokeLinecap="round" />
    <text x={0} y={-90} fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff" textAnchor="middle">
      {label}
    </text>
  </g>
);
export const ControlTrade: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const money = clamp01((t - 0.6) / 1.6);
  const swap = ramp(t, b1, 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <g opacity={1 - ramp(t, b2, 0.6) * 0.7}>
        {/* деньги от фонда */}
        <g transform={`translate(${cx + 420 - money * 300} ${320})`}>
          <Coins x={0} y={0} n={3} s={0.7} />
        </g>
        <Appear t={t} at={0.9}>
          <Label x={cx + 330} y={180} text="3 млн $ от фонда" size={32} bg={DC.res.light} />
        </Appear>
        <Chair x={cx - 120} y={720} label="CEO" color={DC.ppl.deep} />
        <Chair x={cx + 230} y={720} label="CTO" color={DC.eng.deep} />
        {/* Маск пересаживается из кресла CEO в кресло CTO, в CEO приходит другой человек */}
        <Person who="founder" x={cx - 120 + swap * 350} y={900} s={0.42} mood={swap > 0.5 ? "doubt" : "smile"} pose="stand" t={t} />
        <g opacity={swap}>
          <Person who="manager" x={cx - 120 - (1 - swap) * 260} y={900} s={0.42} mood="smile" pose="stand" t={t} seed={3} />
        </g>
        <Appear t={t} at={b1 + 1}>
          <Label x={cx + 230} y={480} text="директор по технологиям" size={26} bg={C.paper} />
        </Appear>
      </g>
      {t > b2 && (
        <Appear t={t} at={b2 + 0.1}>
          <g transform={`translate(${cx} 520)`}>
            <g transform={`translate(${-150 - Math.sin(t * 3) * 6} 0)`}>
              <path d="M -150 -90 L 60 -90 L 60 -30 Q 100 -30 100 0 Q 100 30 60 30 L 60 90 L -150 90 Z" fill={DC.eng.color} stroke={OL} strokeWidth={5} />
            </g>
            <g transform={`translate(${180 + Math.sin(t * 3) * 6} 0)`}>
              <path d="M -150 -90 L 150 -90 L 150 90 L -150 90 L -150 30 Q -110 30 -110 0 Q -110 -30 -150 -30 Z" fill={DC.ppl.color} stroke={OL} strokeWidth={5} />
            </g>
            <Txt x={0} y={170} size={34} color="#fff">
              слияние сорвалось
            </Txt>
            <g transform="translate(0 -170) rotate(-3)">
              <rect x={-260} y={-44} width={520} height={80} rx={18} fill={C.paper} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={32}>
                «мнения сильно разнятся»
              </Txt>
            </g>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── «Я никогда никем не управлял» ──
export const Manage: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const tense = t < b1;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <g opacity={tense ? 1 : 0.4 + 0.6 * (1 - ramp(t, b1, 0.6))}>
        <ellipse cx={cx} cy={720} rx={420} ry={90} fill="#f7f3ea" stroke={OL} strokeWidth={5} />
        {(["engineer", "engineer2", "manager", "designer"] as const).map((w, i) => (
          <Person key={w} who={w} x={cx - 330 + i * 220} y={880} s={0.36} mood={tense ? "tense" : "think"} pose="stand" t={t} seed={i} />
        ))}
        <g>
          <Person who="founder" x={cx + 60 + ramp(t, at(ctx, 0.5), 1.2) * 470} y={640} s={0.4} mood="tense" pose="walk" t={t} />
        </g>
        <Appear t={t} at={at(ctx, 0.6)}>
          <Label x={cx - 160} y={300} text="резкость на совещаниях" size={32} bg={DC.ppl.light} />
        </Appear>
      </g>
      {!tense && (
        <Appear t={t} at={b1 + 0.1}>
          <g transform={`translate(${cx} 360)`}>
            <rect x={-470} y={-90} width={940} height={180} rx={36} fill="#fff" stroke={OL} strokeWidth={5} />
            <path d="M -60 90 L -110 150 L -10 90 Z" fill="#fff" stroke={OL} strokeWidth={5} />
            <text x={0} y={18} fontFamily={DISPLAY} fontSize={56} fontWeight={800} fill={C.ink} textAnchor="middle">
              «Я никогда никем не управлял»
            </text>
          </g>
          <g transform={`translate(${cx} 680)`} opacity={ramp(t, at(ctx, 1.5), 0.6)}>
            <ellipse rx={90} ry={50} fill="#fff" stroke={OL} strokeWidth={5} />
            <circle r={30} fill={DC.ppl.color} stroke={OL} strokeWidth={4} />
            <circle r={12} fill={OL} />
            <Txt x={0} y={110} size={32} color="#fff">
              глазами других
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Продажа компании: чек и доли ──
export const Exit: React.FC<VisualProps<{ variant?: "paypal"; host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const pp = p.variant === "paypal";
  const b1 = at(ctx, 1);
  const k = pop(t, 0.4);
  const split = ramp(t, at(ctx, 0.6), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460} amount={0.03}>
      <g transform={`translate(${cx} 300) scale(${k}) rotate(-3)`}>
        <rect x={-380} y={-110} width={760} height={220} rx={22} fill="#eaf7ec" stroke={OL} strokeWidth={5} />
        <rect x={-380} y={-110} width={760} height={46} rx={20} fill={DC.res.color} />
        <text x={-340} y={-76} fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">
          {pp ? "июль 2002 · eBay покупает PayPal" : "февраль 1999 · Compaq покупает Zip2"}
        </text>
        <text x={0} y={60} fontFamily={DISPLAY} fontWeight={800} fontSize={92} fill={C.ink} textAnchor="middle">
          {pp ? "1,5 млрд $" : "307 млн $"}
        </text>
      </g>
      {split > 0 &&
        (pp
          ? [
              { x: cx - 220, text: "Маску ≈ 250 млн $", c: DC.res.light },
              { x: cx + 240, text: "после налогов — 180", c: C.paper },
            ]
          : [
              { x: cx - 230, text: "Илон — 22 млн $", c: DC.res.light },
              { x: cx + 230, text: "Кимбал — 15 млн $", c: DC.res.light },
            ]
        ).map((q, i) => (
          <g key={i} opacity={split}>
            <Arrow x1={cx + (i ? 80 : -80)} y1={420} x2={q.x} y2={560} k={split} color="#fff" w={8} />
            <Label x={q.x} y={620} text={q.text} size={34} bg={q.c} />
          </g>
        ))}
      {t > b1 && !pp && (
        <Appear t={t} at={b1 + 0.2}>
          <g transform={`translate(${cx} 800)`}>
            <rect x={-520} y={-56} width={1040} height={104} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={32}>
              Вэнс: «всегда будет бороться за сохранение контроля»
            </Txt>
          </g>
        </Appear>
      )}
      {t > b1 && pp && (
        <g>
          {["?", "?", "?"].map((q, i) => (
            <g key={i} transform={`translate(${cx - 260 + i * 260} 830)`} opacity={ramp(t, b1 + i * 0.3, 0.4)}>
              <rect x={-90} y={-70} width={180} height={140} rx={22} fill="#fff" stroke={OL} strokeWidth={4} strokeDasharray="14 10" />
              <Txt x={0} y={20} size={70}>
                {q}
              </Txt>
            </g>
          ))}
        </g>
      )}
    </Drift>
  );
};

// ── X.com: банк с нуля и стена правил ──
export const BankBuild: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const build = clamp01((t - 0.3) / 3);
  const walls = ["лицензии", "правила", "чужие деньги"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <g transform={`translate(${cx - 200} 820)`}>
        {/* банк собирается из блоков */}
        {Array.from({ length: 5 }, (_, i) => {
          const k = clamp01(build * 6 - i);
          return <rect key={i} x={-190 + i * 80} y={-300 + (1 - k) * -200} width={56} height={300} rx={8} fill="#fff" stroke={OL} strokeWidth={4} opacity={k} />;
        })}
        <path d={`M -230 -300 L 0 ${-300 - 150 * clamp01(build * 6 - 5)} L 230 -300 Z`} fill={DC.eng.color} stroke={OL} strokeWidth={5} opacity={clamp01(build * 6 - 5)} />
        <rect x={-240} y={0} width={480} height={30} rx={8} fill={C.metal} stroke={OL} strokeWidth={4} />
        <text x={0} y={-330} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={C.ink} textAnchor="middle" opacity={clamp01(build * 6 - 5)}>
          X.com
        </text>
      </g>
      {walls.map((w, i) => {
        const k = ramp(t, b1 + 0.6 + i * 0.6, 0.6);
        return (
          <g key={w} transform={`translate(${cx + 300 + (1 - k) * 300} ${360 + i * 160})`} opacity={k}>
            <rect x={-170} y={-60} width={340} height={120} rx={14} fill="#c46a4a" stroke={OL} strokeWidth={5} />
            <path d="M -170 0 L 170 0 M -60 -60 L -60 0 M 60 0 L 60 60" stroke="#8a4630" strokeWidth={5} />
            <Txt x={0} y={14} size={34} color="#fff">
              {w}
            </Txt>
          </g>
        );
      })}
      <Appear t={t} at={b1}>
        <Label x={cx - 200} y={250} text="адская работа" size={34} bg={C.paper} />
      </Appear>
    </Drift>
  );
};

// ── Гонка с Confinity: деньги горят, рост, спор технологий ──
export const MoneyBurn: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const users = Math.floor(ramp(t, 0.4, 2.5) * 60);
  const phase2 = t >= b2;
  const phase3 = t >= b3;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {!phase3 && (
        <g opacity={phase2 ? 1 - ramp(t, b3 - 0.5, 0.5) : 1}>
          {/* клиенты-точки */}
          {Array.from({ length: users }, (_, i) => (
            <circle key={i} cx={cx - 480 + (i % 15) * 26} cy={260 + Math.floor(i / 15) * 26} r={9} fill={DC.ppl.color} stroke={OL} strokeOpacity={0.4} strokeWidth={1.5} />
          ))}
          <Appear t={t} at={1.2}>
            <Label x={cx - 300} y={410} text="200 тыс. клиентов" size={30} bg={C.paper} />
          </Appear>
          {/* две компании, монеты вылетают */}
          {[
            { x: cx + 150, n: "X.com", c: DC.eng.color },
            { x: cx + 420, n: "Confinity", c: DC.ppl.color },
          ].map((co, i) => (
            <g key={co.n} opacity={ramp(t, 0.6 + i * 0.4, 0.5)}>
              <rect x={co.x - 120} y={480} width={240} height={160} rx={22} fill={co.c} stroke={OL} strokeWidth={5} />
              <Txt x={co.x} y={575} size={36} color="#fff">
                {co.n}
              </Txt>
              {t > b1 &&
                [0, 1, 2, 3].map((j) => {
                  const u = ((t - b1) * 0.9 + j * 0.25) % 1;
                  return (
                    <g key={j} transform={`translate(${co.x - 60 + j * 40 + u * 60 * (j % 2 ? 1 : -1)} ${470 - u * 260})`} opacity={1 - u}>
                      <ellipse rx={22} ry={8} fill={DC.res.color} stroke={OL} strokeWidth={2} />
                    </g>
                  );
                })}
            </g>
          ))}
          {phase2 && (
            <Appear t={t} at={b2 + 0.2}>
              <g transform={`translate(${cx + 290} 780)`}>
                <Card x={0} y={0} w={620} h={120} lines={["20 часов в сутки… а он — 23"]} edge={DC.ppl.color} />
              </g>
            </Appear>
          )}
        </g>
      )}
      {phase3 && (
        <g>
          {[
            { x: cx - 260, n: "Linux", c: "#3f9a68" },
            { x: cx + 260, n: "Microsoft", c: "#3d7bd9" },
          ].map((s, i) => (
            <g key={s.n} transform={`translate(${s.x + (i ? 1 : -1) * Math.sin(t * 6) * 4} 520)`} opacity={ramp(t, b3 + i * 0.2, 0.5)}>
              {[0, 1, 2].map((j) => (
                <rect key={j} x={-130} y={-140 + j * 90} width={260} height={74} rx={12} fill={s.c} stroke={OL} strokeWidth={4} />
              ))}
              <Txt x={0} y={240} size={38} color="#fff">
                {s.n}
              </Txt>
            </g>
          ))}
          <path d={`M ${cx - 30} 360 L ${cx + 20} 470 L ${cx - 20} 480 L ${cx + 30} 620`} stroke={C.yellow} strokeWidth={12} fill="none" strokeLinejoin="round" opacity={ramp(t, b3 + 0.5, 0.3) * (0.6 + 0.4 * Math.sin(t * 9))} />
          <Appear t={t} at={b3 + 1.6}>
            <g transform={`translate(${cx} 260)`}>
              <rect x={-130} y={-60} width={260} height={110} rx={16} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={10} size={32} color={C.red}>
                сайт упал
              </Txt>
            </g>
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Смещение с поста: самолёт, письма, кресло ──
export const Ouster: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const fly = clamp01((t - 0.3) / 6);
  const letters = clamp01((t - at(ctx, 0.5)) / 1.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <DateCard x={cx - 420} y={180} text="сентябрь 2000" />
      {/* самолёт уходит за край */}
      <g transform={`translate(${A.x0 + 100 + fly * (A.x1 - A.x0)} ${260 - fly * 80}) rotate(-6)`}>
        <path d="M -90 0 L 70 -10 Q 100 0 70 10 Z M -20 -6 L -60 -60 L -30 -60 L 20 -6 Z M -20 6 L -60 60 L -30 60 L 20 6 Z M -80 -2 L -100 -30 L -84 -30 L -66 -2 Z" fill="#fff" stroke={OL} strokeWidth={4} />
      </g>
      {/* стол правления */}
      <rect x={cx - 300} y={660} width={600} height={40} rx={14} fill="#8a5a3c" stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={ramp(t, 0.5 + i * 0.15, 0.4)}>
          <Person who={(["investor", "official", "manager", "partner"] as const)[i]} x={cx - 230 + i * 155} y={660} s={0.3} mood="think" pose="stand" t={t} seed={i} />
        </g>
      ))}
      {Array.from({ length: 5 }, (_, i) => {
        const u = clamp01(letters * 1.6 - i * 0.15);
        if (u <= 0) return null;
        return (
          <g key={i} transform={`translate(${A.x1 - 80 - u * (A.x1 - 80 - (cx - 200 + i * 100))} ${820 - Math.sin(u * Math.PI) * 220 - u * 180}) rotate(${(1 - u) * 30})`}>
            <rect x={-40} y={-28} width={80} height={56} rx={6} fill={C.paper} stroke={OL} strokeWidth={3} />
            <path d="M -40 -28 L 0 4 L 40 -28" fill="none" stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0.75)}>
        <Label x={cx} y={790} text="письма о недоверии правлению" size={30} bg={DC.ppl.light} />
      </Appear>
      {t > b1 && (
        <Appear t={t} at={b1 + 0.1}>
          <g transform={`translate(${cx} 420)`}>
            <Card x={-230} y={0} w={380} h={110} lines={["CEO: Питер Тиль"]} edge={DC.eng.color} />
            <Card x={230} y={0} w={420} h={110} lines={["Маск: советник", "и инвестор"]} edge={DC.res.color} />
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Две версии одного эпизода ──
const VERS: Record<string, { left: [string, string[]]; right: [string, string[]]; bottom?: [string, string[]] }> = {
  paypal: {
    left: ["Вэнс", ["выжила во многом", "благодаря Маску"]],
    right: ["участник", ["ещё полгода —", "и крах"]],
    bottom: ["Приложение 2 · версия Маска", ["поторопился со сменой бренда"]],
  },
  tesla: {
    left: ["Маск", ["обвиняет прежнее", "руководство"]],
    right: ["Эберхард", ["«Со мной обошлись", "несправедливо»"]],
    bottom: ["Вэнс", ["«дети в процессе развода»"]],
  },
  brown: {
    left: ["Вэнс", ["«самый вопиющий пример", "бездушного отношения»"]],
    right: ["Маск", ["отношения исчерпали себя,", "двенадцать лет — хороший срок"]],
  },
};
export const Versions: React.FC<VisualProps<{ variant?: "tesla" | "brown"; host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const v = VERS[p.variant ?? "paypal"];
  const n = ctx.beats.length;
  const lAt = p.variant === "brown" ? at(ctx, 0.3) : p.variant === "tesla" ? at(ctx, 1) : at(ctx, 0.3);
  const rAt = p.variant === "brown" ? at(ctx, 1) : p.variant === "tesla" ? at(ctx, 1.4) : at(ctx, 1);
  const bAt = p.variant === "tesla" ? at(ctx, 1.75) : at(ctx, Math.min(2, n - 1));
  const w = Math.min(560, (A.x1 - A.x0) / 2 - 50);
  const Side: React.FC<{ x: number; who: string; lines: string[]; c: string; k: number }> = ({ x, who, lines, c, k }) => (
    <g transform={`translate(${x} ${470 + (1 - k) * 60})`} opacity={k}>
      <rect x={-w / 2} y={-150} width={w} height={300} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
      <rect x={-w / 2} y={-150} width={w} height={70} rx={30} fill={c} />
      <rect x={-w / 2} y={-110} width={w} height={30} fill={c} />
      <Txt x={0} y={-100} size={36} color="#fff">
        {who}
      </Txt>
      <Txt x={0} y={lines.length > 1 ? 10 : 40} size={Math.min(38, (w - 40) / (Math.max(...lines.map((l) => l.length)) * 0.55))}>
        {lines.join("\n")}
      </Txt>
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <Side x={cx - w / 2 - 24} who={v.left[0]} lines={v.left[1]} c="#3d7bd9" k={ramp(t, lAt, 0.6)} />
      <Side x={cx + w / 2 + 24} who={v.right[0]} lines={v.right[1]} c={DC.ppl.color} k={ramp(t, rAt, 0.6)} />
      <g opacity={ramp(t, 0.2, 0.5)}>
        <circle cx={cx} cy={470} r={40} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={cx} y={486} size={40}>
          ⇄
        </Txt>
      </g>
      {v.bottom && t > bAt && (
        <Appear t={t} at={bAt}>
          <g transform={`translate(${cx} 230)`}>
            <rect x={-440} y={-62} width={880} height={124} rx={26} fill={C.paper} stroke={OL} strokeWidth={4} strokeDasharray={p.variant ? undefined : "14 10"} />
            <Txt x={0} y={-12} size={28} color={C.inkSoft}>
              {v.bottom[0]}
            </Txt>
            <Txt x={0} y={34} size={36}>
              {v.bottom[1][0]}
            </Txt>
          </g>
        </Appear>
      )}
      {!p.variant && t > at(ctx, 3) && (
        <Appear t={t} at={at(ctx, 3)}>
          <Label x={cx} y={790} text="перспектива участника ≠ вердикт" size={32} bg={C.yellow} />
        </Appear>
      )}
      {p.variant === "brown" && (
        <Appear t={t} at={at(ctx, 1.6)}>
          <Label x={cx} y={790} text="оценка автора · ответ героя" size={32} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};
