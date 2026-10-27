// Части 5–7: кясб и халк, шкала четырёх школ, затмение, фермер и верблюд, художник,
// зачем пророки, рынок, чудо, вызов Корана, пять Писаний, хафизы, правило трёх ответов.
// Пророки не изображаются: только места, предметы, свет и слова.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { Camel, Lantern, Mountains, OL, Sky, Star8 } from "./draw";
import { PageTag, QuoteCard, wrap } from "./generic";
import { Icon } from "./icons";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";

// ─────────────── два вида действий; кясб и халк ───────────────
export const Actions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const q = pop(t, 0.2) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const cols = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const formula = ramp(t, at(c, 2), 0.5);
  const breathe = 1 + 0.06 * Math.sin(t * 2.5);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 89–90" k={ramp(t, 0.3, 0.5)} />
      {q > 0.001 && (
        <g transform={`translate(${x} 470) scale(${q})`}>
          <Txt x={0} y={60} size={300} weight={900} family={HEAVY} color={C.gold} stroke="#fff">
            ?
          </Txt>
          <Tag x={-380} y={-80} text="всё знает и создаёт" size={34} color="#e6dcff" />
          <Tag x={380} y={-80} text="где наш выбор?" size={34} color={C.goldSoft} />
        </g>
      )}
      {cols > 0 &&
        [
          { h: "непроизвольные", items: [["pulse", "сердце"], ["sound", "вдохи"]], col: "#ececf2", resp: "не отвечаем" },
          { h: "добровольные", items: [["book", "читать"], ["pen", "писать"]], col: "#d9f0c8", resp: "выбираем и отвечаем" },
        ].map((g, i) => (
          <g key={g.h} transform={`translate(${x + (i ? 300 : -300)} 500) scale(${cols})`}>
            <Panel x={-260} y={-220} w={520} h={440} fill="#fffaf0" r={34} />
            <rect x={-260} y={-220} width={520} height={90} rx={34} fill={g.col} />
            <Txt x={0} y={-160} size={40} weight={900} family={HEAVY}>
              {g.h}
            </Txt>
            {g.items.map(([ic, lab], j) => (
              <g key={lab} transform={`translate(${-110 + j * 220} -10) scale(${i === 0 ? breathe : 1})`}>
                <Icon name={ic} r={64} t={t} color={[C.goldSoft, C.tealSoft][j]} />
                <Txt x={0} y={100} size={30} weight={800}>
                  {lab}
                </Txt>
              </g>
            ))}
            <Txt x={0} y={180} size={32} weight={900} color={i ? C.greenDeep : C.inkSoft}>
              {g.resp}
            </Txt>
          </g>
        ))}
      {formula > 0 && (
        <g opacity={formula}>
          {[
            { w: "человек", v: "выбирает и приобретает", term: "кясб", col: "#bfe0f7" },
            { w: "Аллах", v: "создаёт", term: "халк", col: C.goldSoft },
          ].map((f, i) => {
            const k = pop(t, at(c, 2.15 + i * 0.25));
            return (
              <g key={f.w} transform={`translate(${x} ${380 + i * 220}) scale(${k})`}>
                <Panel x={-520} y={-80} w={1040} h={160} fill="#fffaf0" r={30} />
                <rect x={-520} y={-80} width={260} height={160} rx={30} fill={f.col} />
                <Txt x={-390} y={14} size={44} weight={900} family={HEAVY}>
                  {f.w}
                </Txt>
                <Txt x={50} y={-6} size={40} weight={800}>
                  {f.v}
                </Txt>
                <Txt x={50} y={46} size={32} weight={900} color={C.terracotta}>
                  {`«${f.term}»`}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ─────────────── шкала четырёх школ ───────────────
const SCHOOLS = [
  { n: "джабриты", s: "нет ни воли, ни силы", pos: 0, at: 1, col: "#ececf2" },
  { n: "аш’ариты", s: "близко к полной зависимости", pos: 0.38, at: 3.1, col: C.goldSoft },
  { n: "матуридиты", s: "близко к абсолютной свободе", pos: 0.62, at: 3.55, col: "#b9e6c6" },
  { n: "мутазилиты", s: "человек сам создаёт действия", pos: 1, at: 2, col: "#ffd0c2" },
];
export const Spectrum: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const line = ramp(t, 0.3, 1);
  const L = 1180;
  const x0 = x - L / 2;
  const sunni = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 92–96" k={ramp(t, 0.3, 0.5)} />
      <rect x={x0} y={600} width={L * line} height={16} rx={8} fill="#8c93a8" />
      <Txt x={x0} y={680} size={28} weight={800} anchor="start" color={C.inkSoft} opacity={line}>
        полная зависимость
      </Txt>
      <Txt x={x0 + L} y={680} size={28} weight={800} anchor="end" color={C.inkSoft} opacity={clamp01(line * 2 - 1)}>
        абсолютная свобода
      </Txt>
      {sunni > 0 && <rect x={x0 + L * 0.3} y={585} width={L * 0.4 * sunni} height={46} rx={23} fill={C.gold} opacity={0.35} />}
      {sunni > 0 && (
        <Txt x={x} y={740} size={30} weight={900} color={C.terracotta} opacity={sunni}>
          суннитские школы
        </Txt>
      )}
      {SCHOOLS.map((s, i) => {
        const k = pop(t, at(c, s.at));
        const sx = x0 + L * s.pos;
        const up = i === 1 ? -170 : 0;
        return (
          <g key={s.n} transform={`translate(${sx} 608)`}>
            <circle r={22 * k} fill={s.col} stroke={OL} strokeWidth={5} />
            <g transform={`translate(0 ${-150 + up}) scale(${k})`} opacity={clamp01(k * 2)}>
              <Panel x={-170} y={-70} w={340} h={140} fill="#fffaf0" r={24} />
              <Txt x={0} y={-16} size={34} weight={900} family={HEAVY}>
                {s.n}
              </Txt>
              <Txt x={0} y={30} size={22} weight={800} color={C.inkSoft}>
                {s.s}
              </Txt>
            </g>
          </g>
        );
      })}
      {/* лист под порывами ветра — образ книги для джабритов */}
      {(() => {
        const k = ramp(t, at(c, 1.4), 0.4) * (1 - ramp(t, at(c, 2), 0.4));
        if (k <= 0) return null;
        const f = (t * 0.7) % 1;
        return (
          <g opacity={k}>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${x0 - 60} ${250 + i * 40} q 120 -30 240 0 t 240 0`} stroke="#bfe0f7" strokeWidth={6} fill="none" opacity={0.7} transform={`translate(${((t * 120 + i * 90) % 300) - 100} 0)`} />
            ))}
            <path d="M 0 0 Q -26 -40 26 -56 Q 40 -12 0 0 Z" fill="#7cc576" stroke={OL} strokeWidth={4} transform={`translate(${x0 + 80 + f * 380} ${300 + Math.sin(f * 12) * 50}) rotate(${f * 540})`} />
          </g>
        );
      })()}
    </g>
  );
};

// ─────────────── затмение: знание не принуждает ───────────────
export const Eclipse: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const move = ramp(t, 0.4, (at(c, 1.6) - 0.4) || 3);
  const sky = ramp(t, at(c, 1.4), 0.6);
  const part2 = ramp(t, at(c, 2), 0.5);
  const formula = pop(t, at(c, 3));
  const mx = x + 260 - 260 * move;
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 98–99" k={ramp(t, 0.3, 0.5)} />
      <g opacity={1 - part2 * 0.85}>
        <rect x={x - 520} y={190} width={1040} height={460} rx={40} fill={`rgb(${120 - 80 * sky}, ${180 - 120 * sky}, ${230 - 120 * sky})`} />
        <g transform={`translate(${x} 410)`}>
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={-6} y={-150} width={12} height={40} rx={6} fill="#ffb347" transform={`rotate(${i * 25.7 + t * 6})`} opacity={1 - 0.6 * sky} />
          ))}
          <circle r={95} fill="#ffd25e" stroke={OL} strokeWidth={6} />
          {sky > 0.6 && <circle r={110} fill="none" stroke="#fff6c8" strokeWidth={10} opacity={(sky - 0.6) * 2} />}
        </g>
        <circle cx={mx} cy={410} r={92} fill="#2a2f45" stroke={OL} strokeWidth={6} />
        <Pop t={t} at={at(c, 1.1)} x={x} y={720}>
          <Tag x={0} y={0} text="мы знаем, потому что затмение произойдёт" size={32} color={C.white} />
        </Pop>
      </g>
      {part2 > 0 && (
        <g opacity={part2 * (1 - formula)}>
          <g transform={`translate(${x - 300} 420)`}>
            <Icon name="mind" r={90} t={t} color="#e6dcff" />
            <Txt x={0} y={150} size={36} weight={900}>
              знание отца
            </Txt>
          </g>
          <g transform={`translate(${x + 300} 420)`}>
            <Icon name="book" r={90} t={t} color="#d9f0c8" />
            <Txt x={0} y={150} size={36} weight={900}>
              труд сына
            </Txt>
          </g>
          <Arrow x1={x + 170} y1={420} x2={x - 170} y2={420} k={ramp(t, at(c, 2.5), 0.6)} color={C.gold} w={10} />
        </g>
      )}
      {formula > 0.001 && (
        <g transform={`translate(${x} 700) scale(${formula})`}>
          <Panel x={-520} y={-90} w={1040} h={180} fill="#fffaf0" stroke={C.gold} r={30} />
          <Txt x={0} y={-12} size={34} weight={700} family={SERIF}>
            {"судьба, которую определил Аллах\nсогласно выбору самого человека"}
          </Txt>
          <Txt x={0} y={-120} size={28} weight={900} color={C.terracotta}>
            формула матуридитов · PDF 99
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── таваккуль: поле и верблюд ───────────────
export const Farmer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const excuse = pop(t, 0.3) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const steps = ["пахота", "посев", "сорняки", "урожай"];
  const field = ramp(t, at(c, 1), 0.5);
  const camel = ramp(t, at(c, 2), 0.6);
  const stepAt = (i: number) => at(c, 1.15 + i * 0.2);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 99–101" k={ramp(t, 0.3, 0.5)} />
      {excuse > 0.001 && (
        <g transform={`translate(${x} 470) scale(${excuse})`}>
          <Tag x={0} y={0} text="«Такова моя судьба»" size={56} color="#ececf2" />
          <Cross x={0} y={-8} s={130} k={ramp(t, at(c, 0.6), 0.5)} />
          <Txt x={0} y={120} size={34} weight={800} color={C.inkSoft}>
            не оправдание ни греху, ни лени
          </Txt>
        </g>
      )}
      {field > 0 && (
        <g opacity={field * (1 - camel * 0.85)}>
          <g transform={camera(t, c.dur, x, 600, 1, 1.04)}>
            <Sky mode="day" t={t} id="farm" sunX={x + 420} sunY={250} />
            <rect x={0} y={640} width={1920} height={440} fill="#c99a5e" />
            {Array.from({ length: 8 }).map((_, i) => {
              const k = ramp(t, stepAt(0) + i * 0.1, 0.3);
              return <path key={i} d={`M ${x - 560} ${680 + i * 34} L ${x - 560 + 1120 * k} ${680 + i * 34}`} stroke="#9a6e3f" strokeWidth={8} strokeLinecap="round" />;
            })}
            {Array.from({ length: 16 }).map((_, i) => {
              const sx = x - 520 + (i % 8) * 145;
              const sy = 690 + Math.floor(i / 8) * 120;
              const seed = ramp(t, stepAt(1) + i * 0.03, 0.3);
              const weed = ramp(t, stepAt(1), 0.3) * (1 - ramp(t, stepAt(2) + (i % 8) * 0.05, 0.3));
              const grow = ramp(t, stepAt(3) + i * 0.04, 1.2);
              return (
                <g key={i} transform={`translate(${sx} ${sy})`}>
                  {seed > 0 && <ellipse rx={7} ry={5} fill="#5b3b1c" opacity={seed * (1 - grow)} />}
                  {i % 3 === 1 && weed > 0 && <path d="M 30 0 l -8 -30 M 30 0 l 10 -28 M 30 0 l 0 -34" stroke="#6b7d3a" strokeWidth={5} opacity={weed} />}
                  {grow > 0 && (
                    <g transform={`scale(${grow})`}>
                      <path d="M 0 0 L 0 -70" stroke="#4f8a3c" strokeWidth={7} />
                      <path d="M 0 -40 Q -30 -50 -34 -74 Q -6 -70 0 -40 Z M 0 -50 Q 30 -60 34 -84 Q 6 -80 0 -50 Z" fill="#7cc576" stroke={OL} strokeWidth={3} />
                      <ellipse cx={0} cy={-86} rx={10} ry={18} fill="#f2b632" stroke={OL} strokeWidth={3} />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
          {steps.map((s, i) => (
            <Pop key={s} t={t} at={stepAt(i)} x={x - 450 + i * 300} y={250}>
              <Tag x={0} y={0} text={`${i + 1}. ${s}`} size={34} color={i === 3 ? C.goldSoft : C.white} />
            </Pop>
          ))}
        </g>
      )}
      {camel > 0 && (
        <g opacity={camel}>
          <rect x={x - 600} y={200} width={1200} height={620} rx={40} fill="#f6dfb0" />
          <Mountains y={600} color="#d7a86a" seed={5} scale={0.5} />
          <rect x={x - 600} y={600} width={1200} height={220} fill="#e2b56c" />
          <rect x={x - 250} y={420} width={30} height={240} rx={8} fill="#8a5a33" stroke={OL} strokeWidth={5} />
          <path d={`M ${x - 220} 470 Q ${x - 120} ${520 + Math.sin(t * 2) * 6} ${x + 10} 520`} stroke="#b8864b" strokeWidth={8} fill="none" />
          <Camel x={x + 120} y={650} s={1.1} walk={0} />
          <Check x={x - 235} y={360} s={60} k={ramp(t, at(c, 2.6), 0.5)} />
        </g>
      )}
    </g>
  );
};

// ─────────────── добро и зло: художник ───────────────
export const Painter: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const top = pop(t, 0.3) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const easel = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const paint = ramp(t, at(c, 1.1), 2);
  const wow = pop(t, at(c, 1.55));
  const contrast = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 102–104" k={ramp(t, 0.3, 0.5)} />
      {top > 0.001 && (
        <g transform={`translate(${x} 470) scale(${top})`}>
          <Tag x={-300} y={-60} text="создаёт и добро, и зло" size={38} color="#e6dcff" />
          <Tag x={300} y={80} text="зла не одобряет" size={38} color={C.goldSoft} />
          <Txt x={0} y={30} size={80} weight={900} color={C.terracotta}>
            ≠
          </Txt>
        </g>
      )}
      {easel > 0 && (
        <g opacity={easel} transform={`translate(${x} 480)`}>
          <path d="M -220 330 L -60 -260 M 220 330 L 60 -260 M 0 -260 L 0 360" stroke="#8a5a33" strokeWidth={18} strokeLinecap="round" />
          <rect x={-300} y={-240} width={600} height={420} fill="#fffaf0" stroke={OL} strokeWidth={10} />
          <rect x={-270} y={-210} width={540} height={360} fill="#e8ecf8" />
          {/* корявый засохший пень — «безобразное» на прекрасном рисунке */}
          <g opacity={paint}>
            <path d="M -60 140 Q -80 40 -40 -20 Q -90 -60 -120 -40 M -40 -20 Q -10 -90 30 -110 M 10 -40 Q 70 -60 110 -30 M 40 140 Q 60 40 20 -20" stroke="#5b3b1c" strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - paint)} />
            <ellipse cx={0} cy={150} rx={160} ry={18} fill="#9a8a70" opacity={paint} />
          </g>
          <path d="M 220 -230 L 360 -330" stroke="#5b3b1c" strokeWidth={10} strokeLinecap="round" />
          <circle cx={360} cy={-330} r={14} fill="#3b8fd0" />
        </g>
      )}
      {easel > 0 && wow > 0.001 && (
        <g transform={`translate(${x} 250) scale(${wow})`} opacity={easel}>
          <Tag x={0} y={0} text="«Какой прекрасный рисунок!»" size={40} color={C.goldSoft} />
        </g>
      )}
      {contrast > 0 && (
        <g opacity={contrast} transform={`translate(${x} 470)`}>
          <path d="M 0 -260 A 260 260 0 0 0 0 260 Z" fill="#253a66" />
          <path d="M 0 -260 A 260 260 0 0 1 0 260 Z" fill="#fff1c4" />
          <circle r={260} fill="none" stroke={OL} strokeWidth={6} />
          <Star8 x={-130} y={-40} r={24} fill="#fff4c4" rot={t * 20} />
          <Icon name="sun" r={50} t={t} color="#fff1c4" />
          <g transform="translate(130 0)">
            <Icon name="sprout" r={46} t={t} color="#d9f0c8" />
          </g>
          <Tag x={0} y={330} text="без зла не понять и не оценить добра" size={32} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ─────────────── зачем пророки: развилка и фонарь ───────────────
export const Crossroads: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const roads = ramp(t, 0.3, 0.8);
  const maze = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const lamp = ramp(t, at(c, 2), 0.6);
  const lights = ramp(t, at(c, 2.5), 1.2);
  return (
    <g>
      <g transform={camera(t, c.dur, x, 600, 1, 1.05)}>
        <Sky mode="dusk" t={t} id="cross" sunX={x + 460} sunY={330} />
        <Mountains y={640} color="#5a4a6e" seed={2} />
        <rect x={0} y={640} width={1920} height={440} fill="#8f7a66" />
        {Array.from({ length: 7 }).map((_, i) => {
          const a = -Math.PI / 2 + (i - 3) * 0.32;
          const len = 700 * roads;
          return <path key={i} d={`M ${x} 1000 L ${x + Math.cos(a) * len} ${1000 + Math.sin(a) * len * 0.5}`} stroke="#d8c3a2" strokeWidth={20 - Math.abs(i - 3) * 3} strokeLinecap="round" opacity={0.85 * (1 - lamp * 0.6)} />;
        })}
        {lights > 0 &&
          Array.from({ length: 9 }).map((_, i) => (
            <g key={i} opacity={clamp01(lights * 9 - i)}>
              <Lantern x={x - 560 + i * 140} y={640 - (i % 3) * 30} s={0.32} t={t + i} glow={0.9} />
            </g>
          ))}
      </g>
      <PageTag x={x} y={150} text="PDF 118–120" k={ramp(t, 0.3, 0.5)} dark />
      {Array.from({ length: 5 }).map((_, i) => (
        <Pop key={i} t={t} at={at(c, 0.4) + i * 0.15} x={x - 400 + i * 200} y={420 + wob(t, i, 8)}>
          <g opacity={1 - maze - lamp}>
            <Txt x={0} y={20} size={70} weight={900} color="#fff4d0">
              ?
            </Txt>
          </g>
        </Pop>
      ))}
      {maze > 0 && (
        <g opacity={maze}>
          <path d={`M ${x - 520} 420 q 120 -160 240 0 t 240 0 t 240 0 t 240 0`} stroke="#fff4d0" strokeWidth={10} fill="none" strokeDasharray="22 18" strokeDashoffset={-t * 60} />
          <Tag x={x} y={300} text="на опыт ушла бы вся жизнь" size={36} color="#fff4d0" />
        </g>
      )}
      {lamp > 0 && (
        <g opacity={lamp}>
          <path d={`M ${x} 1000 L ${x} ${1000 - 560 * lamp}`} stroke="#ffe08a" strokeWidth={30} strokeLinecap="round" opacity={0.65} />
          <Lantern x={x} y={420} s={0.8} t={t} glow={1} />
          <Tag x={x} y={260} text="посылание пророков — милость" size={38} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── рынок: пророки — люди ───────────────
export const Market: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.2, 0.8);
  const quote = ramp(t, at(c, 0.7), 0.6) * (1 - ramp(t, at(c, 1) - 0.2, 0.4));
  const end = pop(t, at(c, 1));
  const awn = ["#e5484d", "#3b8fd0", "#3d9a62", "#f2b632"];
  return (
    <g>
      <g opacity={k} transform={camera(t, c.dur, x, 600, 1, 1.05)}>
        <Sky mode="day" t={t} id="market" sunX={x - 450} sunY={220} />
        <rect x={0} y={700} width={1920} height={380} fill="#e8cf9e" />
        {awn.map((col, i) => {
          const sx = x - 540 + i * 360;
          return (
            <g key={i} transform={`translate(${sx} 700)`}>
              <rect x={-150} y={-260} width={300} height={260} fill="#f6e8cc" stroke={OL} strokeWidth={5} />
              {Array.from({ length: 6 }).map((_, j) => (
                <path key={j} d={`M ${-170 + j * 57} -300 L ${-113 + j * 57} -300 L ${-113 + j * 57} -250 Q ${-141 + j * 57} -230 ${-170 + j * 57} -250 Z`} fill={j % 2 ? col : "#fff"} stroke={OL} strokeWidth={4} transform={`translate(0 ${Math.sin(t * 2 + j) * 2})`} />
              ))}
              <rect x={-140} y={-90} width={280} height={90} fill="#b8864b" stroke={OL} strokeWidth={5} />
              {i === 0 && [0, 1, 2, 3, 4].map((j) => <circle key={j} cx={-100 + j * 50} cy={-110} r={22} fill="#ff7a6b" stroke={OL} strokeWidth={3} />)}
              {i === 1 && (
                <g transform="translate(0 -125)">
                  <Icon name="bread" r={40} t={t} color="#f6e8cc" />
                </g>
              )}
              {i === 2 && [0, 1, 2, 3].map((j) => <ellipse key={j} cx={-90 + j * 60} cy={-112} rx={26} ry={18} fill="#7cc576" stroke={OL} strokeWidth={3} />)}
              {i === 3 && (
                <g transform="translate(0 -125)">
                  <Icon name="water" r={40} t={t} color="#f6e8cc" />
                </g>
              )}
            </g>
          );
        })}
      </g>
      <PageTag x={x} y={150} text="PDF 124–125" k={ramp(t, 0.3, 0.5)} />
      <QuoteCard x={x} y={420} w={900} k={quote} text="Я всего лишь человек, такой же, как и вы" by="Сура «Аль-Кяхф» 18/110 · PDF 124" size={48} />
      {end > 0.001 && (
        <g transform={`translate(${x} 300) scale(${end})`}>
          <Tag x={0} y={0} text="избранность и высочайшая нравственность" size={38} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── что такое чудо ───────────────
export const Miracle: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = ramp(t, 0.2, 0.6);
  const stop = Math.max(0, Math.sin(clamp01((t - at(c, 0.55)) / 1.6) * Math.PI));
  const flow = t - 0.9 * stop;
  const def = pop(t, at(c, 1));
  const mis = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 130–131" k={ramp(t, 0.3, 0.5)} />
      <g opacity={k * (1 - mis * 0.85)}>
        {/* законы природы: равномерный поток, на миг «замирающий» */}
        <Panel x={x - 520} y={230} w={1040} h={300} fill="#e7f3fb" r={34} />
        {Array.from({ length: 12 }).map((_, i) => {
          const px = x - 500 + (((flow * 160 + i * 90) % 1040) + 1040) % 1040;
          return <circle key={i} cx={px} cy={380 + Math.sin(i * 1.7 + flow * 2) * 50} r={14} fill="#3b8fd0" opacity={0.75} />;
        })}
        {stop > 0.05 && (
          <g opacity={stop}>
            <Star8 x={x} y={380} r={70} fill="none" stroke={C.gold} rot={t * 40} />
            <Star8 x={x} y={380} r={36} fill={C.goldSoft} rot={-t * 40} />
          </g>
        )}
        <Tag x={x} y={270} text="законы природы — «Адатуллах»" size={30} color={C.white} />
        <Tag x={x} y={580} text="муаджиза — чудо" size={40} color={C.goldSoft} />
      </g>
      {def > 0.001 && (
        <g transform={`translate(${x} 700) scale(${def})`} opacity={1 - mis * 0.85}>
          <Panel x={-430} y={-60} w={860} h={120} fill="#fffaf0" stroke={C.gold} r={26} />
          <Txt x={0} y={14} size={36} weight={900}>
            чудо — действие Аллаха
          </Txt>
        </g>
      )}
      {mis > 0 && (
        <g opacity={mis}>
          <g transform={`translate(${x - 300} 480)`}>
            <path d="M -200 140 L -60 -120 L 0 -40 L 60 -140 L 200 140 Z" fill="#9a8f86" stroke={OL} strokeWidth={6} />
            <Tag x={0} y={210} text="«сдвинется гора»" size={34} color={C.white} />
          </g>
          <Txt x={x} y={500} size={110} weight={900} color={C.red}>
            ≠
          </Txt>
          <g transform={`translate(${x + 300} 480)`}>
            <rect x={-200} y={-140} width={400} height={280} rx={20} fill="#7cc0ea" stroke={OL} strokeWidth={6} />
            <rect x={-30} y={-140} width={60} height={280} fill="#f3d9a4" />
            <Tag x={0} y={210} text="расступилось море" size={34} color={C.white} />
          </g>
          <Pop t={t} at={at(c, 2.55)} x={x} y={260}>
            <Tag x={0} y={0} text="не совпало с заявлением — не чудо" size={36} color={C.goldSoft} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ─────────────── Коран — живое чудо, вызов ───────────────
export const QuranChallenge: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const past = ramp(t, 0.2, 0.6);
  const fade = ramp(t, at(c, 0.4), 1.4);
  const book = pop(t, at(c, 0.6));
  const ch = ramp(t, at(c, 1), 0.4) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const lights = ramp(t, at(c, 2), 2.5);
  const bars = [
    { lab: "подобное Корану", w: 900, at: 1.05 },
    { lab: "десять сур", w: 560, at: 1.4 },
    { lab: "одна сура", w: 260, at: 1.7 },
  ];
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 134, 145–147" k={ramp(t, 0.3, 0.5)} />
      <g opacity={past * (1 - fade) * (1 - ch)}>
        {["fire", "water", "scroll"].map((ic, i) => (
          <g key={ic} transform={`translate(${x - 460 + i * 120} ${450 + i * 20}) scale(${1 - 0.3 * fade})`}>
            <Icon name={ic} r={52} t={t} color="#ececf2" />
          </g>
        ))}
        <Txt x={x - 340} y={600} size={30} weight={800} color={C.inkSoft}>
          остались в прошлом
        </Txt>
      </g>
      {book > 0.001 && (
        <g opacity={1 - lights} transform={`translate(${x + (ch > 0 ? 0 : 230) * (1 - ch)} ${ch > 0 ? 260 : 470}) scale(${book * (ch > 0 ? 0.55 : 1)})`}>
          <circle r={230} fill="#ffe08a" opacity={0.18 + 0.08 * Math.sin(t * 2)} />
          <rect x={-170} y={-210} width={340} height={420} rx={18} fill="#1f6b55" stroke={OL} strokeWidth={6} />
          <rect x={-150} y={-190} width={300} height={380} rx={12} fill="none" stroke={C.gold} strokeWidth={6} />
          <Star8 x={0} y={0} r={70} fill="none" stroke={C.gold} rot={t * 8} />
          <Star8 x={0} y={0} r={36} fill={C.gold} rot={-t * 8} />
          <Txt x={0} y={150} size={32} weight={800} color={C.goldSoft}>
            Коран
          </Txt>
        </g>
      )}
      {ch > 0 &&
        bars.map((b, i) => {
          const k = ramp(t, at(c, b.at), 0.4);
          return (
            <g key={b.lab} opacity={ch} transform={`translate(${x} ${470 + i * 110})`}>
              <rect x={-b.w / 2} y={-40} width={b.w * k} height={80} rx={40} fill={["#bfe0f7", "#d9f0c8", C.goldSoft][i]} stroke={OL} strokeWidth={5} />
              {k > 0.5 && (
                <Txt x={0} y={14} size={36} weight={900}>
                  {b.lab}
                </Txt>
              )}
            </g>
          );
        })}
      {lights > 0 && (
        <g>
          {Array.from({ length: 60 }).map((_, i) => {
            const k = clamp01(lights * 60 - i);
            const px = x - 560 + (i % 12) * 100 + ((i * 37) % 30);
            const py = 380 + Math.floor(i / 12) * 80;
            return k > 0 ? (
              <g key={i}>
                <circle cx={px} cy={py} r={20 * k} fill="#ffe08a" opacity={0.3} />
                <circle cx={px} cy={py} r={7 * k} fill="#fff6c8" stroke={C.gold} strokeWidth={2} />
              </g>
            ) : null;
          })}
          <Tag x={x} y={300} text="избавил людей от заблуждений" size={38} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── пять Писаний ───────────────
const BOOKS = [
  { n: "Сухуф", s: "Ибрахиму и Мусе", scroll: true },
  { n: "Таурат", s: "Мусе" },
  { n: "Забур", s: "Дауду" },
  { n: "Инджиль", s: "Исе" },
  { n: "Коран", s: "Мухаммаду", gold: true },
];
export const Scrolls: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const line = ramp(t, 0.3, 1.2);
  const hl = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 139–145" k={ramp(t, 0.3, 0.5)} />
      <rect x={x - 600} y={640} width={1200 * line} height={12} rx={6} fill="#c9b48a" />
      {BOOKS.map((b, i) => {
        const k = pop(t, at(c, 0.3 + i * 0.14));
        const bx = x - 520 + i * 260;
        const dim = b.gold ? 1 : 1 - 0.35 * hl;
        return (
          <g key={b.n} transform={`translate(${bx} ${500 + wob(t, i, 3) - (b.gold ? 30 * hl : 0)}) scale(${k * (b.gold ? 1 + 0.12 * hl : 1)})`} opacity={clamp01(k * 2) * dim}>
            {b.scroll ? (
              <g>
                <rect x={-70} y={-90} width={140} height={180} fill={C.parchment} stroke={OL} strokeWidth={5} />
                <rect x={-84} y={-104} width={168} height={26} rx={13} fill="#b8864b" stroke={OL} strokeWidth={4} />
                <rect x={-84} y={78} width={168} height={26} rx={13} fill="#b8864b" stroke={OL} strokeWidth={4} />
              </g>
            ) : (
              <g>
                {b.gold && <circle r={150} fill="#ffe08a" opacity={0.25 * hl} />}
                <rect x={-80} y={-110} width={160} height={220} rx={12} fill={b.gold ? "#1f6b55" : ["#7a4b2a", "#3b5a8a", "#6b4a7a"][i - 1]} stroke={OL} strokeWidth={5} />
                <rect x={-66} y={-96} width={132} height={192} rx={8} fill="none" stroke={C.gold} strokeWidth={4} />
                <Star8 x={0} y={0} r={26} fill={C.gold} rot={b.gold ? t * 12 : 0} />
              </g>
            )}
            <Txt x={0} y={180} size={40} weight={900} family={HEAVY}>
              {b.n}
            </Txt>
            <Txt x={0} y={222} size={26} weight={800} color={C.terracotta}>
              {b.s}
            </Txt>
          </g>
        );
      })}
      <Pop t={t} at={at(c, 1.2)} x={x} y={280}>
        <Tag x={0} y={0} text="вера — во все Писания в ниспосланном виде" size={34} color={C.goldSoft} />
      </Pop>
    </g>
  );
};

// ─────────────── почему Коран сохранился ───────────────
export const Hafiz: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const parts = ramp(t, 0.3, at(c, 0.5));
  const people = ramp(t, at(c, 0.55), 1.4);
  const quote = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 145–149" k={ramp(t, 0.3, 0.5)} />
      <g opacity={1 - quote * 0.85}>
        <g transform={`translate(${x - 300} 470)`}>
          <rect x={-150} y={-190} width={300} height={380} rx={16} fill="#1f6b55" stroke={OL} strokeWidth={6} />
          <rect x={-130} y={-170} width={260} height={340} rx={10} fill="none" stroke={C.gold} strokeWidth={5} />
          {Array.from({ length: 23 }).map((_, i) => {
            const k = clamp01(parts * 23 - i);
            const yy = -150 + i * 13;
            return <rect key={i} x={-100} y={yy - 60 * (1 - k)} width={200} height={9} rx={4} fill={C.goldSoft} opacity={k} />;
          })}
          <Tag x={0} y={250} text="частями · 23 года" size={32} color={C.white} />
        </g>
        <g transform={`translate(${x + 300} 470)`}>
          {Array.from({ length: 48 }).map((_, i) => {
            const k = clamp01(people * 48 - i);
            const a = i * 2.4;
            const r = 30 + Math.sqrt(i) * 30;
            return k > 0 ? <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.8} r={10 * k} fill="#fff6c8" stroke={C.gold} strokeWidth={3} /> : null;
          })}
          <Tag x={0} y={250} text="сотни тысяч хафизов" size={32} color={C.goldSoft} />
        </g>
      </g>
      <QuoteCard x={x} y={470} w={960} k={quote} text="Несомненно, Мы ниспослали Коран, и Мы же охраняем его" by="Сура «Аль-Хиджр» 15/9 · PDF 145" size={48} />
    </g>
  );
};

// ─────────────── правило трёх ответов ───────────────
export const ThreeRule: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const rows = [
    { h: "совпадает с Кораном", r: "принимаем", mark: "check", col: "#b9e6c6" },
    { h: "противоречит", r: "не принимаем", mark: "cross", col: "#ffb4a8" },
    { h: "сведений нет", r: "воздерживаемся", mark: "?", col: "#ececf2" },
  ];
  const quote = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 151–152" k={ramp(t, 0.3, 0.5)} />
      {rows.map((r, i) => {
        const k = pop(t, at(c, 1 + i * 0.32));
        const mk = ramp(t, at(c, 1 + i * 0.32) + 0.3, 0.4);
        return (
          <g key={r.h} transform={`translate(${x} ${300 + i * 165}) scale(${k})`} opacity={clamp01(k * 2) * (1 - quote * 0.8)}>
            <Panel x={-540} y={-64} w={1080} h={128} fill="#fffaf0" r={30} />
            <rect x={-540} y={-64} width={150} height={128} rx={30} fill={r.col} />
            {r.mark === "check" && <Check x={-465} y={0} s={46} k={mk} />}
            {r.mark === "cross" && <Cross x={-465} y={0} s={56} k={mk} />}
            {r.mark === "?" && (
              <Txt x={-465} y={22} size={64} weight={900} color={C.inkSoft} opacity={mk}>
                ?
              </Txt>
            )}
            <Txt x={-350} y={14} size={38} weight={800} anchor="start">
              {r.h}
            </Txt>
            <Txt x={500} y={14} size={40} weight={900} anchor="end" family={HEAVY} color={C.terracotta}>
              {`→ ${r.r}`}
            </Txt>
          </g>
        );
      })}
      <QuoteCard x={x} y={480} w={960} k={quote} text="не подтверждайте их слова, но и не отвергайте их" by="хадис · Бухари «Шахадат», 29 · PDF 152" size={50} />
    </g>
  );
};

export { wrap };
