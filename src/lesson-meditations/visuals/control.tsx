// Часть «Что в моей власти»: утро и одеяло (Книга V), дождь и уехавший автобус
// (вымышленный эпизод), два круга (метафора BanaMind), факт и рассказ о факте,
// оговорка о настоящей боли, внутреннее убежище/твердыня, возвращение к себе и скала.
import React from "react";
import { Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Bed, Bee, Big, Bus, Cloud, Hero, OL, QuoteCard, Rain, SkyArc } from "./draw";

type VP = VisualProps<{ host?: string; stage?: number }>;

// ── два круга: внешний «не в моей власти», внутренний «в моей власти» (метафора BanaMind) ──
export const Circles: React.FC<{
  x: number;
  y: number;
  t: number;
  k: number;
  outer?: { text: string; k: number }[];
  inner?: { text: string; k: number }[];
  r?: number;
  glowInner?: number;
}> = ({ x, y, t, k, outer = [], inner = [], r = 340, glowInner = 0 }) => {
  if (k <= 0) return null;
  const ri = r * 0.48;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.85 + 0.15 * k})`} opacity={clamp01(k * 1.3)}>
      <circle r={r} fill="#e7eef8" stroke={R.grey} strokeWidth={8} strokeDasharray="22 14" />
      <circle r={ri + 30 * glowInner} fill={C.yellow} opacity={0.25 * glowInner} />
      <circle r={ri} fill="#fff6d0" stroke={C.yellowDeep} strokeWidth={10} />
      <text y={-r + 56} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={30} textAnchor="middle" fill={C.inkSoft}>
        НЕ В МОЕЙ ВЛАСТИ
      </text>
      <text y={-ri + 48} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={28} textAnchor="middle" fill={C.ink}>
        В МОЕЙ ВЛАСТИ
      </text>
      {outer.map((o, i) => {
        if (o.k <= 0) return null;
        const a = (-90 + 50 + i * (260 / Math.max(1, outer.length - 1 || 1))) * (Math.PI / 180) + Math.sin(t * 0.3 + i) * 0.02;
        const rr = (r + ri) / 2 + 12;
        return (
          <g key={o.text} transform={`translate(${Math.cos(a + Math.PI / 2) * rr * 0.98} ${Math.sin(a + Math.PI / 2) * rr * 0.98}) scale(${o.k})`}>
            <Tag x={0} y={0} text={o.text} size={26} color="#fff" />
          </g>
        );
      })}
      {inner.map((o, i) => {
        if (o.k <= 0) return null;
        return (
          <g key={o.text} transform={`translate(0 ${-ri * 0.18 + i * 54}) scale(${o.k})`}>
            <Tag x={0} y={0} text={o.text} size={26} color={C.yellow} />
          </g>
        );
      })}
    </g>
  );
};

// ── c01: кровать, банан под одеялом; вокруг трудятся пчёлы, муравьи, растёт росток ──
export const BedMorning: React.FC<VP> = (c) => {
  const { t } = c;
  const up = ramp(t, at(c, 1.2), 1);
  const busy = ramp(t, at(c, 2), 0.6);
  const rest = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <rect x={1240} y={140} width={420} height={320} rx={18} fill="#cfdcec" stroke={OL} strokeWidth={6} />
      <line x1={1450} y1={140} x2={1450} y2={460} stroke={OL} strokeWidth={5} />
      <SkyArc x={1450} y={430} w={380} phase={0.15 + up * 0.2} t={t} />
      {up < 1 && <Rain x={1260} y={160} w={380} h={290} t={t} k={1 - up} />}
      <Bed x={760} y={720} s={1.1} />
      <g transform={`translate(${620 + up * 40} ${640 - up * 120})`}>
        <Hero x={0} y={0} s={0.42} t={t} pose={up > 0.5 ? "cheer" : "idle"} mood={up > 0.5 ? "joy" : "confused"} />
      </g>
      {up < 1 && <path d={`M 470 ${620 - 0} Q 760 ${560 - up * 40} 1060 640 L 1060 720 L 470 720 Z`} fill={R.terracottaSoft} stroke={OL} strokeWidth={5} opacity={1 - up} />}
      {up < 0.4 &&
        [0, 1, 2].map((i) => (
          <Txt key={i} x={700 + i * 40} y={480 - ((t * 30 + i * 20) % 60)} size={40 - i * 6} weight={900} color={C.inkSoft} opacity={0.7}>
            z
          </Txt>
        ))}
      {busy > 0 && (
        <g opacity={busy}>
          {[0, 1, 2].map((i) => (
            <Bee key={i} x={1300 + Math.cos(t * 1.5 + i * 2) * 120} y={600 + Math.sin(t * 2 + i) * 50} s={1.2} t={t} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${1150 + ((t * 50 + i * 60) % 420)} 820)`}>
              <ellipse rx={10} ry={7} fill={OL} />
              <ellipse cx={12} rx={8} ry={6} fill={OL} />
              <rect x={-10} y={-18} width={14} height={10} fill={C.yellow} stroke={OL} strokeWidth={2} />
            </g>
          ))}
          <path d={`M 1720 820 Q 1716 ${760 - busy * 30} 1730 ${700 - busy * 40}`} stroke={R.olive} strokeWidth={8} fill="none" />
          <ellipse cx={1750} cy={700 - busy * 40} rx={26} ry={12} fill={R.olive} transform={`rotate(-30 1750 ${700 - busy * 40})`} />
        </g>
      )}
      {rest > 0 && (
        <g transform={`translate(760 220) scale(${rest})`}>
          <Panel x={-260} y={-50} w={520} h={96} r={48} fill="#fff" />
          <Txt x={0} y={12} size={38} weight={900}>
            отдых — но в меру
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── c02: дождь, остановка, автобус уезжает, «день испорчен» ──
export const RainBus: React.FC<VP> = (c) => {
  const { t } = c;
  const bx = 700 + Math.max(0, t - at(c, 0.45)) * 420;
  const ruin = pop(t, at(c, 1));
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#9fb3cc" opacity={0.35} />
      {[0, 1, 2].map((i) => (
        <Cloud key={i} x={300 + i * 420 + Math.sin(t * 0.3 + i) * 20} y={170 + (i % 2) * 40} s={1.1} color="#d9e1ec" />
      ))}
      <Rain x={80} y={220} w={1300} h={620} t={t} />
      <rect x={0} y={800} width={1920} height={30} fill={R.grey} />
      <g transform="translate(260 800)">
        <rect x={-6} y={-300} width={12} height={300} fill={OL} />
        <rect x={-50} y={-300} width={100} height={60} rx={10} fill={C.skyDeep} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={-260} size={30} weight={900} color="#fff">
          A
        </Txt>
      </g>
      <Bus x={bx} y={800} s={1.1} t={t} />
      {bx > 900 && <path d={`M ${bx - 200} 770 q -40 -10 -80 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.7} />}
      <Hero x={400} y={812} s={0.36} t={t} pose={t < at(c, 1) ? "shock" : "shrug"} mood={t < at(c, 1) ? "shock" : "confused"} />
      {ruin > 0 && (
        <g transform={`translate(560 460) scale(${ruin}) rotate(${-4 + Math.sin(t * 3) * 1.5})`}>
          <path d="M -230 -70 Q -230 -110 -190 -110 L 190 -110 Q 230 -110 230 -70 L 230 30 Q 230 70 190 70 L -100 70 L -150 120 L -140 70 Q -230 70 -230 30 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={0} size={48} weight={900} color={C.red}>
            день испорчен!
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── c03: два круга (метафора BanaMind), предметы раскладываются по кругам, цитата ──
export const TwoCircles: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, at(c, 0.3), 0.8);
  const outer = ["погода", "автобус", "чужие слова", "чужие поступки"].map((w, i) => ({ text: w, k: pop(t, at(c, 1.15 + i * 0.18)) }));
  const inner = ["моя оценка", "мой шаг", "мои слова"].map((w, i) => ({ text: w, k: pop(t, at(c, 2.2 + i * 0.22)) }));
  const three = ramp(t, at(c, 3), 0.5);
  const quote = ramp(t, at(c, 4), 0.6);
  return (
    <g>
      <g opacity={1 - quote * 0.75} transform={`translate(0 ${-quote * 40})`}>
        <Circles x={cx} y={480} t={t} k={k} outer={outer} inner={inner} glowInner={three} />
        <Pop t={t} at={at(c, 0.6)} x={cx} y={110}>
          <Tag x={0} y={0} text="схема BanaMind — не рисунок из книги" size={28} color="#fff" />
        </Pop>
      </g>
      {three > 0 && quote < 0.5 && (
        <g opacity={three * (1 - quote * 2)}>
          {["верное суждение", "дело ради общего блага", "добрый настрой"].map((w, i) => (
            <g key={w} transform={`translate(${cx + (i - 1) * 380} 870) scale(${pop(t, at(c, 3.1 + i * 0.2))})`}>
              <Tag x={0} y={0} text={w} size={26} color={R.oliveSoft} />
            </g>
          ))}
        </g>
      )}
      <QuoteCard x={cx} y={520} w={860} k={quote} text={"Все зависит от убеждения.\nМир – изменение,\nжизнь – убеждение."} refText="Книги II и IV" size={46} />
    </g>
  );
};

// ── c04: событие → фильтр суждения → чувство; «ребёнок болен» ≠ «в опасности»; автобус ≠ «день испорчен» ──
export const JudgeFilter: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, 0.2, 0.7);
  const ex = ramp(t, at(c, 1), 0.6);
  const mine = ramp(t, at(c, 2), 0.6);
  const facts = mine > 0 ? ["автобус уехал", "«день испорчен»"] : ex > 0 ? ["«ребёнок болен»", "«он в опасности»"] : ["событие", "суждение"];
  const fade = clamp01((t % 3) / 0.3);
  const flow = (t * 160) % 520;
  return (
    <g opacity={k}>
      <g transform={`translate(${cx - 390} 460)`}>
        <circle r={140} fill="#fff" stroke={OL} strokeWidth={6} />
        <Txt x={0} y={10} size={26} weight={900}>
          {facts[0]}
        </Txt>
        <Txt x={0} y={196} size={30} color={C.inkSoft}>
          факт
        </Txt>
      </g>
      <g transform={`translate(${cx} 460)`}>
        <path d="M -130 -130 L 130 -130 L 34 20 L 34 110 L -34 140 L -34 20 Z" fill={R.tealSoft} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
        <Txt x={0} y={-66} size={28} weight={900}>
          суждение
        </Txt>
      </g>
      <circle cx={cx - 270 + flow} cy={460} r={14} fill={C.yellowDeep} opacity={fade * (flow < 500 ? 1 : 0)} />
      <g transform={`translate(${cx + 390} 460)`}>
        <circle r={140} fill={mine > 0 || ex > 0 ? "#ffe2dc" : "#fff"} stroke={OL} strokeWidth={6} />
        <Txt x={0} y={10} size={26} weight={900} color={C.red}>
          {facts[1]}
        </Txt>
        <Txt x={0} y={196} size={30} color={C.inkSoft}>
          мой рассказ
        </Txt>
        {(ex > 0 || mine > 0) && <Cross x={0} y={-176} s={60} k={ramp(t, (mine > 0 ? at(c, 2.5) : at(c, 1.5)), 0.4)} />}
      </g>
      {mine > 0 && (
        <g transform={`translate(${cx} 780) scale(${pop(t, at(c, 2.6))})`}>
          <Panel x={-300} y={-46} w={600} h={92} r={46} fill={C.yellow} />
          <Txt x={0} y={14} size={38} weight={900}>
            рассказ можно переписать
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── c05: настоящая боль не отменяется; что сверху — паника/обида; кнопка «сделать» ──
export const HonestPain: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const real = pop(t, 0.3);
  const extra = ramp(t, at(c, 1), 0.6);
  const act = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g transform={`translate(${cx} 640) scale(${real})`}>
        <rect x={-400} y={-60} width={800} height={130} rx={24} fill={R.stone} stroke={OL} strokeWidth={6} />
        <Txt x={0} y={18} size={38} weight={900} color="#fff">
          боль · болезнь · несправедливость
        </Txt>
        <Tag x={0} y={130} text="это реально" size={30} color="#fff" />
      </g>
      {["паника", "обида", "проклятия"].map((w, i) => {
        const k = clamp01(extra * 3 - i);
        if (k <= 0) return null;
        const y = 520 - i * 90 - (1 - k) * 100;
        const gone = act;
        return (
          <g key={w} transform={`translate(${cx + gone * (i - 1) * 500} ${y - gone * 200})`} opacity={k * (1 - gone)}>
            <rect x={-150} y={-36} width={300} height={72} rx={36} fill="#ffd3c2" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={34} weight={900} color={C.red}>
              {w}
            </Txt>
          </g>
        );
      })}
      {act > 0 && (
        <g transform={`translate(${cx} 330) scale(${pop(t, at(c, 2.1))})`}>
          <circle r={110} fill={C.green} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={14} size={40} weight={900} color="#fff">
            сделать
          </Txt>
          <Check x={150} y={0} s={46} k={ramp(t, at(c, 2.4), 0.4)} />
        </g>
      )}
    </g>
  );
};

// ── c06: море и горы «где-то там» ↔ крепость внутри, банан на остановке дышит ──
export const InnerCitadel: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const far = ramp(t, 0.2, 0.7);
  const inside = ramp(t, at(c, 1), 0.8);
  const fort = ramp(t, at(c, 2), 0.8);
  const breath = 1 + 0.06 * Math.sin(t * 1.4);
  return (
    <g>
      <g opacity={far * (1 - inside * 0.8)} transform={`translate(0 ${-inside * 60})`}>
        <path d={`M ${cx - 480} 560 L ${cx - 300} 300 L ${cx - 160} 460 L ${cx - 40} 260 L ${cx + 120} 560 Z`} fill="#9fb8d6" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M ${cx - 40} 260 L ${cx - 80} 330 L ${cx} 320 Z`} fill="#fff" />
        <path d={`M ${cx + 80} 560 Q ${cx + 280} 520 ${cx + 480} 560 L ${cx + 480} 620 L ${cx + 80} 620 Z`} fill="#6cb7e8" stroke={OL} strokeWidth={5} />
        <Txt x={cx} y={680} size={34} color={C.inkSoft}>
          море? горы?
        </Txt>
      </g>
      {inside > 0 && (
        <g opacity={inside}>
          <circle cx={cx} cy={460} r={260 * breath} fill={C.yellow} opacity={0.18} />
          <circle cx={cx} cy={460} r={190 * breath} fill={C.yellow} opacity={0.22} />
          <Hero x={cx} y={600} s={0.38} t={t} pose="heart" mood="calm" />
          <Pop t={t} at={at(c, 1.3)} x={cx} y={200}>
            <Tag x={0} y={0} text="«уединиться в самом себе»" size={34} color="#fff" />
          </Pop>
        </g>
      )}
      {fort > 0 && (
        <g opacity={fort}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${cx + sd * 280} ${700 - fort * 20})`}>
              <rect x={-60} y={-280} width={120} height={280} fill={R.stone} stroke={OL} strokeWidth={5} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={-60 + i * 44} y={-310} width={32} height={30} fill={R.stone} stroke={OL} strokeWidth={4} />
              ))}
              <rect x={-14} y={-200} width={28} height={50} rx={14} fill={OL} />
            </g>
          ))}
          <rect x={cx - 220} y={560} width={440} height={140} fill={R.stone} stroke={OL} strokeWidth={5} opacity={0.0} />
          <Tag x={cx} y={790} text="«твердыня»" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── c07: маятник «выбило → вернулся», мышца растёт; скала и волны ──
export const ReturnSwing: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const swing = ramp(t, 0.2, 0.6) * (1 - ramp(t, at(c, 2), 0.6));
  const rock = ramp(t, at(c, 2), 0.8);
  const n = Math.max(0, t - at(c, 1));
  const amp = 32 * Math.exp(-n * 0.25);
  const ang = Math.sin(t * 2.6) * (t < at(c, 1) ? 32 : amp);
  const muscle = ramp(t, at(c, 1), 2.5);
  return (
    <g>
      {swing > 0 && (
        <g opacity={swing}>
          <line x1={cx - 300} y1={160} x2={cx + 300} y2={160} stroke={OL} strokeWidth={8} />
          <g transform={`translate(${cx} 160) rotate(${ang})`}>
            <line x1={0} y1={0} x2={0} y2={420} stroke={OL} strokeWidth={6} />
            <circle cy={460} r={60} fill={C.yellow} stroke={OL} strokeWidth={6} />
            <Txt x={0} y={474} size={34} weight={900}>
              я
            </Txt>
          </g>
          <line x1={cx} y1={160} x2={cx} y2={640} stroke={C.green} strokeWidth={4} strokeDasharray="10 10" />
          <Txt x={cx} y={700} size={30} weight={900} color={C.greenDeep}>
            «вернуться к самому себе»
          </Txt>
          {muscle > 0 && (
            <g transform={`translate(${cx + 380} 480) scale(${0.6 + 0.6 * muscle})`}>
              <path d="M -60 40 Q -70 -40 -10 -60 Q 30 -100 60 -50 Q 80 -10 40 10 Q 10 40 -60 40 Z" fill="#ffd9b0" stroke={OL} strokeWidth={5} />
              <Txt x={0} y={100} size={26} weight={900}>
                чаще = легче
              </Txt>
            </g>
          )}
        </g>
      )}
      {rock > 0 && (
        <g opacity={rock}>
          <path d={`M ${cx - 160} 760 L ${cx - 120} 420 L ${cx - 30} 360 L ${cx + 80} 400 L ${cx + 160} 760 Z`} fill={R.stone} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => {
            const ph = (t * 0.6 + i / 3) % 1;
            const side = i % 2 ? 1 : -1;
            const x = cx + side * (480 - ph * 300);
            const calm = ph > 0.75 ? 1 - (ph - 0.75) * 4 : 1;
            return (
              <path key={i} d={`M ${x - 80} 700 Q ${x - side * 10} ${640 - 70 * calm} ${x + 80} 700`} fill="none" stroke="#6cb7e8" strokeWidth={16} strokeLinecap="round" opacity={0.9 * calm} />
            );
          })}
          <rect x={cx - 520} y={740} width={1040} height={60} fill="#6cb7e8" opacity={0.6} />
          <Pop t={t} at={at(c, 2.3)} x={cx} y={250}>
            <Big x={0} y={0} text="«Будь подобен скале»" size={56} serif />
          </Pop>
        </g>
      )}
    </g>
  );
};

