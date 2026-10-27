// Вступление и части 1–2: вечные вопросы, книга, три части религии, тело и душа,
// фундамент и шесть столпов, доводы, середина, пять взглядов на веру, сердце,
// знание и вера, дерево и плоды, страх и надежда. Людей в кадре нет.
import React from "react";
import { interpolate } from "remotion";
import { C, HEAVY, SERIF } from "../theme";
import { Mountains, OL, Sky, Star8 } from "./draw";
import { PageTag, QuoteCard, wrap } from "./generic";
import { Icon } from "./icons";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";

// ─────────────── крючок: вечные вопросы в ночном небе ───────────────
const QUESTIONS = ["Откуда я пришёл?", "Куда я иду?", "Что будет после смерти?", "Кто создал меня?", "Для чего я создан?"];
const Q_POS = [
  { x: 470, y: 250 },
  { x: 1180, y: 210 },
  { x: 760, y: 420 },
  { x: 420, y: 600 },
  { x: 1120, y: 620 },
];
export const HookQuestions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const times = [at(c, 0.02), at(c, 0.3), at(c, 0.62), at(c, 1.02), at(c, 1.5)];
  const gather = ramp(t, at(c, 2.15), 1.4);
  const book = pop(t, at(c, 2.45));
  return (
    <g>
      <g transform={camera(t, c.dur, 820, 500, 1.0, 1.08)}>
        <Sky mode="night" t={t} id="hookq" sunX={1560} sunY={170} stars={110} />
        <Mountains y={860} color="#1f2648" seed={4} />
        <Mountains y={900} color="#171d3b" seed={8} scale={0.7} />
      </g>
      {QUESTIONS.map((q, i) => {
        const k = pop(t, times[i]);
        if (k <= 0.001) return null;
        const p = Q_POS[i];
        const gx = p.x + (820 - p.x) * gather;
        const gy = p.y + wob(t, i, 10) + (300 - p.y) * gather;
        const w = q.length * 27 + 90;
        return (
          <g key={i} transform={`translate(${gx} ${gy}) scale(${k * (1 - 0.55 * gather)})`} opacity={clamp01(k * 1.6) * (1 - gather)}>
            <rect x={-w / 2 - 6} y={-50} width={w + 12} height={100} rx={50} fill="#ffd977" opacity={0.18 + 0.08 * Math.sin(t * 2 + i)} />
            <rect x={-w / 2} y={-42} width={w} height={84} rx={42} fill="#fff7dc" stroke={C.gold} strokeWidth={4} />
            <Txt x={0} y={14} size={44} weight={900} family={HEAVY} color={C.ink}>
              {q}
            </Txt>
          </g>
        );
      })}
      {book > 0.001 && (
        <g transform={`translate(820 600) scale(${book})`} opacity={clamp01(book * 1.5)}>
          <circle r={260} fill="#ffd977" opacity={0.12} />
          <rect x={-180} y={-230} width={360} height={460} rx={18} fill="#1f6b55" stroke={OL} strokeWidth={6} />
          <rect x={-160} y={-210} width={320} height={420} rx={12} fill="none" stroke={C.gold} strokeWidth={5} />
          <Star8 x={0} y={-120} r={44} fill={C.gold} rot={t * 10} />
          <Txt x={0} y={-10} size={40} weight={700} family={SERIF} color="#fff4d0">
            {"Исламское\nвероучение"}
          </Txt>
          <Txt x={0} y={110} size={34} weight={800} color={C.goldSoft}>
            (Акыда)
          </Txt>
          <Txt x={0} y={170} size={24} weight={700} color="#cfe8dc">
            проф. Ахмед Саим Кылавуз
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── о книге: учёные, карта книги, правила фильма ───────────────
const SCHOLARS = ["Абу Ханифа", "Шафии", "Матуриди", "Аш’ари"];
const MAP = ["Вера и её основы", "Божественность", "Пророчество", "Сведения о невидимом"];
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const b = pop(t, 0.2);
  const mapK = ramp(t, at(c, 2) - 0.2, 0.6);
  const rule = pop(t, at(c, 3));
  const out = ramp(t, at(c, 3) - 0.4, 0.5);
  return (
    <g>
      <g transform={`translate(${x} ${430 - 60 * mapK}) scale(${b * (1 - 0.35 * mapK)})`} opacity={clamp01(b * 2) * (1 - out)}>
        <g transform={`rotate(${wob(t, 1, 1.5)})`}>
          <rect x={-190} y={-240} width={380} height={480} rx={18} fill="#1f6b55" stroke={OL} strokeWidth={6} />
          <rect x={-170} y={-220} width={340} height={440} rx={12} fill="none" stroke={C.gold} strokeWidth={5} />
          <Star8 x={0} y={-130} r={44} fill={C.gold} rot={t * 8} />
          <Txt x={0} y={-20} size={38} weight={700} family={SERIF} color="#fff4d0">
            {"Исламское\nвероучение"}
          </Txt>
          <Txt x={0} y={110} size={30} weight={800} color={C.goldSoft}>
            (Акыда)
          </Txt>
          <Txt x={0} y={175} size={24} weight={700} color="#cfe8dc">
            Москва · 2010 · 224 стр.
          </Txt>
        </g>
      </g>
      {SCHOLARS.map((n, i) => {
        const k = pop(t, at(c, 1.2) + i * 0.35) * (1 - mapK);
        if (k <= 0.001) return null;
        const a = (i / 4) * Math.PI * 2 - Math.PI / 4 + t * 0.15;
        return (
          <g key={n} transform={`translate(${x + Math.cos(a) * 360} ${430 + Math.sin(a) * 250}) scale(${k})`}>
            <Tag x={0} y={0} text={n} size={34} color={i % 2 ? C.white : C.goldSoft} />
          </g>
        );
      })}
      {mapK > 0 &&
        MAP.map((m, i) => {
          const k = pop(t, at(c, 2) + 0.3 + i * 0.3) * (1 - out);
          if (k <= 0.001) return null;
          const cx = x - 465 + i * 310;
          return (
            <g key={m} transform={`translate(${cx} 690) scale(${k})`}>
              <Panel x={-140} y={-70} w={280} h={150} fill="#fffaf0" r={24} stroke={C.gold} />
              <Txt x={0} y={-30} size={24} weight={800} color={C.terracotta}>
                {`глава ${i + 1}`}
              </Txt>
              <Txt x={0} y={14} size={30} weight={900}>
                {wrap(m, 13)}
              </Txt>
            </g>
          );
        })}
      {rule > 0.001 && (
        <g transform={`translate(${x} 470) scale(${rule})`}>
          <Panel x={-480} y={-210} w={960} h={420} fill="#fffaf0" stroke={C.gold} />
          <Txt x={0} y={-130} size={42} weight={900} color={C.ink}>
            Без изображений Аллаха и пророков
          </Txt>
          {(
            [
              ["схемы", "link"],
              ["природа", "sprout"],
              ["предметы", "book"],
              ["слова", "talk"],
            ] as const
          ).map(([w, ic], i) => (
            <g key={w} transform={`translate(${-330 + i * 220} 0)`}>
              <Icon name={ic} r={56} t={t} color={[C.goldSoft, C.tealSoft, C.parchment, "#e6dcff"][i]} />
              <Txt x={0} y={98} size={30} weight={800}>
                {w}
              </Txt>
            </g>
          ))}
          <Txt x={0} y={180} size={28} weight={800} color={C.terracotta}>
            мнение школы — с названием школы
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── три части религии ───────────────
const PARTS3 = [
  { a: "акыда", r: "вероучение", s: "акыда и калям", icon: "heart" },
  { a: "ибада", r: "поклонение", s: "фикх", icon: "mosque" },
  { a: "ахляк", r: "нравственность", s: "ахляк и тасаввуф", icon: "sprout" },
];
export const ThreeParts: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const sci = ramp(t, at(c, 1), 0.6);
  const focus = ramp(t, at(c, 2), 0.7);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 7" k={ramp(t, 0.3, 0.5)} />
      {PARTS3.map((p, i) => {
        const cx = x - 400 + i * 400;
        const k = pop(t, at(c, 0.25 + i * 0.22));
        const dim = i === 0 ? 1 : 1 - 0.55 * focus;
        const lift = i === 0 ? -30 * focus : 0;
        return (
          <g key={p.a} transform={`translate(${cx} ${480 + lift + wob(t, i, 3)}) scale(${k * (i === 0 ? 1 + 0.06 * focus : 1)})`} opacity={clamp01(k * 2) * dim}>
            <path d="M -160 260 L -160 -150 Q -160 -260 0 -290 Q 160 -260 160 -150 L 160 260 Z" fill="#fffaf0" stroke={i === 0 ? C.gold : "#d8bd85"} strokeWidth={i === 0 ? 9 : 6} />
            <g transform="translate(0 -150)">
              <Icon name={p.icon} r={62} t={t} color={[C.goldSoft, C.tealSoft, "#d9f0c8"][i]} />
            </g>
            <Txt x={0} y={-10} size={56} weight={900} family={HEAVY}>
              {p.a}
            </Txt>
            <Txt x={0} y={44} size={32} weight={800} color={C.inkSoft}>
              {p.r}
            </Txt>
            {sci > 0 && (
              <g opacity={sci} transform={`translate(0 ${150 + (1 - sci) * 20})`}>
                <rect x={-140} y={-38} width={280} height={66} rx={33} fill={[C.goldSoft, C.tealSoft, "#d9f0c8"][i]} />
                <Txt x={0} y={6} size={28} weight={800}>
                  {p.s}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 2.3)} x={x - 400} y={830}>
        <Tag x={0} y={0} text="эта книга" size={34} color={C.gold} />
      </Pop>
    </g>
  );
};

// ─────────────── фитра: тело и душа ───────────────
export const BodySoul: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const seed = pop(t, 0.2);
  const split = ramp(t, at(c, 1), 0.8);
  const quote = ramp(t, at(c, 2), 0.6);
  const glow = 0.6 + 0.4 * Math.sin(t * 2.2);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 10–11" k={ramp(t, 0.3, 0.5)} />
      {/* фитра: свет внутри круга — врождённое чувство */}
      <g transform={`translate(${x} ${430 - 60 * split}) scale(${seed * (1 - 0.45 * split)})`} opacity={clamp01(seed * 2) * (1 - quote * 0.7)}>
        <circle r={200} fill="#ffe9a8" opacity={0.35 * glow} />
        <circle r={140} fill="#fffaf0" stroke={C.gold} strokeWidth={8} />
        <Star8 x={0} y={-20} r={56} fill={C.gold} rot={t * 12} />
        <Txt x={0} y={90} size={50} weight={900} family={HEAVY}>
          фитра
        </Txt>
      </g>
      {split > 0 &&
        [
          { lab: "тело", need: "пища", icon: "bread", dx: -330 },
          { lab: "душа", need: "вера", icon: "heart", dx: 330 },
        ].map((s, i) => (
          <g key={s.lab} transform={`translate(${x + s.dx * split} ${560}) scale(${split})`} opacity={split * (1 - quote * 0.75)}>
            <Panel x={-220} y={-150} w={440} h={300} fill="#fffaf0" r={30} />
            <g transform="translate(-110 0)">
              <Icon name={s.icon} r={70} t={t} color={i ? "#ffd0c2" : C.goldSoft} />
            </g>
            <Txt x={70} y={-20} size={54} weight={900} family={HEAVY}>
              {s.lab}
            </Txt>
            <Txt x={70} y={45} size={34} weight={800} color={C.terracotta}>
              {`→ ${s.need}`}
            </Txt>
          </g>
        ))}
      {split > 0.5 && <Txt x={x} y={575} size={64} weight={900} color={C.gold} opacity={(split - 0.5) * 2 * (1 - quote)}>+</Txt>}
      <QuoteCard x={x} y={500} w={980} k={quote} text="И самая большая потребность души – вера" by="PDF 11" size={46} />
    </g>
  );
};

// ─────────────── фундамент и шесть столпов ───────────────
const PILLARS = ["Аллах", "ангелы", "Писания", "пророки", "Судный день", "судьба"];
const BUILD = ["#e7c08a", "#cfe0f2", "#d9f0c8"];
export const Foundation: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const base = ramp(t, 0.2, 0.9);
  const line = ramp(t, at(c, 1), 1.2);
  const houses = ramp(t, at(c, 2), 0.5);
  const pillars = ramp(t, at(c, 3) - 0.3, 0.5);
  // здания над фундаментом сменяют друг друга — разные эпохи, разный шариат
  const era = Math.floor(Math.max(0, t - at(c, 2)) / 1.6) % 3;
  const eraK = clamp01(((t - at(c, 2)) % 1.6) / 0.4);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 12–13" k={ramp(t, 0.3, 0.5)} />
      <rect x={x - 620} y={720} width={1240 * base} height={90} rx={10} fill="#a9906f" stroke={OL} strokeWidth={6} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={x - 610 + i * 103} y={732} width={92} height={30} rx={5} fill="#c4ab86" opacity={clamp01(base * 12 - i)} />
      ))}
      <Txt x={x} y={790} size={36} weight={900} color="#fff8ea" opacity={base}>
        вероучение — фундамент
      </Txt>
      {line > 0 && (
        <g opacity={1 - pillars}>
          <Arrow x1={x - 560} y1={680} x2={x - 560 + 1120 * line} y2={680} k={1} color={C.gold} w={8} />
          <Txt x={x - 560} y={660} size={28} weight={800} anchor="start" color={C.inkSoft} opacity={line}>
            Адам
          </Txt>
          <Txt x={x + 560} y={660} size={28} weight={800} anchor="end" color={C.inkSoft} opacity={clamp01(line * 2 - 1)}>
            Мухаммад
          </Txt>
        </g>
      )}
      {houses > 0 && pillars < 1 && (
        <g opacity={houses * (1 - pillars)} transform={`translate(${x} 640)`}>
          <g transform={`scale(${0.8 + 0.2 * eraK})`} opacity={eraK}>
            {era === 0 && <path d="M -260 0 L -260 -220 L 0 -330 L 260 -220 L 260 0 Z" fill={BUILD[0]} stroke={OL} strokeWidth={6} />}
            {era === 1 && (
              <g>
                <rect x={-280} y={-240} width={560} height={240} fill={BUILD[1]} stroke={OL} strokeWidth={6} />
                <path d="M -120 -240 Q 0 -380 120 -240 Z" fill="#7fd0c8" stroke={OL} strokeWidth={6} />
              </g>
            )}
            {era === 2 && (
              <g>
                <rect x={-300} y={-200} width={180} height={200} fill={BUILD[2]} stroke={OL} strokeWidth={6} />
                <rect x={-90} y={-290} width={180} height={290} fill={BUILD[0]} stroke={OL} strokeWidth={6} />
                <rect x={120} y={-230} width={180} height={230} fill={BUILD[1]} stroke={OL} strokeWidth={6} />
              </g>
            )}
          </g>
          <Tag x={0} y={-400} text="шариат: у каждой общины свой" size={32} color={C.goldSoft} />
        </g>
      )}
      {pillars > 0 &&
        PILLARS.map((p, i) => {
          const k = pop(t, at(c, 3) + i * 0.32);
          const px = x - 525 + i * 210;
          return (
            <g key={p} transform={`translate(${px} 712)`} opacity={clamp01(k * 2)}>
              <g transform={`scale(1 ${k})`}>
                <rect x={-46} y={-400} width={92} height={400} fill="#fffaf0" stroke={OL} strokeWidth={5} />
                <rect x={-62} y={-420} width={124} height={30} rx={6} fill={C.gold} stroke={OL} strokeWidth={5} />
              </g>
              <g transform={`translate(0 ${-460})`}>
                <Txt x={0} y={0} size={p.length > 8 ? 26 : 30} weight={900} opacity={clamp01(k)}>
                  {p.includes(" ") ? p.replace(" ", "\n") : p}
                </Txt>
              </g>
            </g>
          );
        })}
    </g>
  );
};

// ─────────────── вера требует доводов ───────────────
export const NoBlind: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const title = pop(t, at(c, 0.2));
  const bad = ["«Закрой на все глаза и покорись»", "«Невежество – мать набожности»"];
  const src = [
    { lab: "история", icon: "scroll" },
    { lab: "мир вокруг", icon: "sun" },
    { lab: "сам человек", icon: "mind" },
  ];
  const srcK = ramp(t, at(c, 2) - 0.2, 0.4);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 15" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} 250) scale(${title})`} opacity={clamp01(title * 2)}>
        <Txt x={0} y={0} size={70} weight={900} family={HEAVY} color={C.ink}>
          доказательства
        </Txt>
        <rect x={-260} y={22} width={520} height={8} rx={4} fill={C.gold} />
      </g>
      {bad.map((b, i) => {
        const k = pop(t, at(c, 1.25 + i * 0.4));
        const cross = ramp(t, at(c, 1.25 + i * 0.4) + 0.5, 0.5);
        return (
          <g key={b} transform={`translate(${x} ${410 + i * 120}) scale(${k})`} opacity={clamp01(k * 2) * (1 - srcK)}>
            <rect x={-420} y={-44} width={840} height={88} rx={44} fill="#ececf2" stroke="#9aa0b4" strokeWidth={4} />
            <Txt x={0} y={14} size={38} weight={800} color={C.inkSoft}>
              {b}
            </Txt>
            {cross > 0 && <line x1={-400} y1={0} x2={-400 + 800 * cross} y2={0} stroke={C.red} strokeWidth={9} strokeLinecap="round" />}
          </g>
        );
      })}
      {src.map((s, i) => {
        const k = pop(t, at(c, 2) + i * 0.6);
        return (
          <g key={s.lab} transform={`translate(${x - 380 + i * 380} 560) scale(${k})`} opacity={clamp01(k * 2)}>
            <Icon name={s.icon} r={86} t={t} color={[C.goldSoft, "#bfe0f7", "#ffd0c2"][i]} />
            <Txt x={0} y={150} size={36} weight={900}>
              {s.lab}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── золотая середина ───────────────
export const Middle: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = pop(t, 0.2);
  const phase2 = ramp(t, at(c, 1), 0.5);
  const quote = ramp(t, at(c, 2), 0.6);
  const tilt = Math.sin(t * 1.3) * 2.5 * (1 - phase2 * 0.6);
  const ends1 = ["отрицать всё невидимое", "множество богов"];
  const ends2 = ["возвысить до Бога", "принизить"];
  const ends = phase2 < 0.5 ? ends1 : ends2;
  const lab = clamp01(Math.abs(phase2 - 0.5) * 2);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 15–18" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} 520) scale(${k})`} opacity={clamp01(k * 2) * (1 - quote * 0.8)}>
        <path d="M -40 230 L 0 30 L 40 230 Z" fill="#c4ab86" stroke={OL} strokeWidth={6} />
        <g transform={`rotate(${tilt})`}>
          <rect x={-560} y={0} width={1120} height={22} rx={11} fill="#8a5a33" stroke={OL} strokeWidth={5} />
          {[-1, 1].map((sd, i) => (
            <g key={sd} transform={`translate(${sd * 440} -40)`} opacity={lab}>
              <Panel x={-190} y={-110} w={380} h={130} fill="#ececf2" r={26} />
              <Txt x={0} y={-30} size={32} weight={800} color={C.inkSoft}>
                {wrap(ends[i], 14)}
              </Txt>
              <Cross x={0} y={-45} s={60} k={ramp(t, at(c, phase2 < 0.5 ? 0.6 : 1.6), 0.4) * 0.8} />
            </g>
          ))}
          <circle cx={0} cy={11} r={40} fill={C.gold} stroke={OL} strokeWidth={5} />
        </g>
        <Txt x={0} y={-140} size={48} weight={900} family={HEAVY} color={C.ink}>
          {phase2 < 0.5 ? "середина" : "«лишь создания»"}
        </Txt>
      </g>
      <QuoteCard x={x} y={480} w={900} k={quote} text="Нет принуждения в вере" by="Сура «Аль-Бакара» 2/256 · PDF 18" size={58} />
    </g>
  );
};

// ─────────────── пять взглядов на веру ───────────────
const VIEWS = [
  { icons: ["heart"], h: "сердце", who: "аш’ариты, матуридиты", at: 1 },
  { icons: ["mind"], h: "знание", who: "джахмиты", at: 2 },
  { icons: ["talk"], h: "слова", who: "мурджиты, каррамиты", at: 2.5 },
  { icons: ["heart", "talk"], h: "сердце + слова", who: "ханафиты, Абу Ханифа", at: 3 },
  { icons: ["heart", "talk", "sprout"], h: "сердце + слова + дела", who: "хариджиты, мутазилиты", at: 3.55 },
];
export const FiveViews: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const title = pop(t, 0.2);
  const w = 236;
  const gap = 18;
  const total = 5 * w + 4 * gap;
  return (
    <g>
      <g transform={`translate(${x} 175) scale(${title})`}>
        <Txt x={0} y={0} size={60} weight={900} family={HEAVY}>
          Что такое иман?
        </Txt>
      </g>
      <PageTag x={x} y={232} text="PDF 19–26" k={ramp(t, 0.4, 0.5)} />
      {VIEWS.map((v, i) => {
        const k = pop(t, at(c, v.at));
        const cx = x - total / 2 + w / 2 + i * (w + gap);
        return (
          <g key={i} transform={`translate(${cx} ${545 + wob(t, i, 4)}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-w / 2} y={-220} w={w} h={440} fill="#fffaf0" r={28} />
            {v.icons.map((ic, j) => (
              <g key={ic} transform={`translate(${(j - (v.icons.length - 1) / 2) * 66} ${-120})`}>
                <Icon name={ic} r={v.icons.length > 1 ? 34 : 60} t={t} color={["#ffd0c2", C.goldSoft, "#d9f0c8"][j]} />
              </g>
            ))}
            <Txt x={0} y={10} size={v.h.length > 12 ? 28 : 36} weight={900} family={HEAVY}>
              {wrap(v.h, 9)}
            </Txt>
            <Txt x={0} y={120} size={24} weight={800} color={C.terracotta}>
              {wrap(v.who, 12)}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── вера — в сердце ───────────────
export const HeartScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = pop(t, 0.2);
  const quote = ramp(t, at(c, 1.35), 0.6) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const end = ramp(t, at(c, 2), 0.5);
  const beat = 1 + 0.05 * Math.max(0, Math.sin(t * 5.5));
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 21–25" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x - 200 * (1 - end) * 0} ${440}) scale(${k * beat})`} opacity={clamp01(k * 2) * (1 - quote * 0.85)}>
        <circle r={240} fill="#ffd0c2" opacity={0.3} />
        <path d="M 0 150 C -230 0 -160 -180 0 -80 C 160 -180 230 0 0 150 Z" fill="#ff8a7a" stroke={OL} strokeWidth={8} />
        <Star8 x={0} y={-10} r={40} fill="#fff4d0" rot={t * 15} opacity={0.9} />
        <Txt x={0} y={240} size={44} weight={900} family={HEAVY}>
          утверждение сердцем
        </Txt>
      </g>
      <Pop t={t} at={at(c, 0.55)} x={x + 340} y={250}>
        <g opacity={1 - quote}>
          <Icon name="talk" r={52} t={t} color={C.goldSoft} />
          <Txt x={0} y={95} size={28} weight={800} color={C.inkSoft}>
            слова — для людей
          </Txt>
        </g>
      </Pop>
      <QuoteCard x={x} y={460} w={1000} k={quote} text="Разве ты рассек ему сердце и заглянул в него?!" by="хадис · Муслим «Иман», 41 · PDF 21" size={50} />
      {end > 0 && (
        <g opacity={end}>
          <Tag x={x} y={740} text="что в сердце — ведает только Аллах" size={36} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── знание и вера: противоположности ───────────────
export const Antonyms: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const rows = [
    { a: "знание", b: "невежество", col: "#bfe0f7" },
    { a: "вера", b: "неверие", col: "#ffd0c2" },
  ];
  const wrong = pop(t, at(c, 1));
  const choice = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 22–23 · имам Матуриди" k={ramp(t, 0.3, 0.5)} />
      {rows.map((r, i) => {
        const k = pop(t, at(c, 0.25 + i * 0.4));
        const y = 290 + i * 170;
        return (
          <g key={r.a} transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 2) * (1 - choice * 0.6)}>
            <Tag x={-330} y={0} text={r.a} size={46} color={r.col} />
            <Arrow x1={-160} y1={-8} x2={160} y2={-8} k={1} color={C.inkSoft} w={7} />
            <Arrow x1={160} y1={-8} x2={-160} y2={-8} k={1} color={C.inkSoft} w={7} />
            <Tag x={330} y={0} text={r.b} size={46} color="#ececf2" />
          </g>
        );
      })}
      {wrong > 0.001 && (
        <g transform={`translate(${x} 640) scale(${wrong})`} opacity={1 - choice}>
          <Panel x={-470} y={-70} w={940} h={140} fill="#fffaf0" r={30} />
          <Txt x={0} y={14} size={36} weight={800}>
            невежда = неверующий? учёный = верующий?
          </Txt>
          <Cross x={420} y={0} s={70} k={ramp(t, at(c, 1.5), 0.5)} />
        </g>
      )}
      {choice > 0 && (
        <g transform={`translate(${x} 620) scale(${choice})`}>
          <Icon name="heart" r={80} t={t} color="#ffd0c2" />
          <Check x={150} y={0} s={70} k={choice} />
          <Txt x={0} y={150} size={44} weight={900} family={HEAVY}>
            вера — выбор сердца
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── дерево и плоды ───────────────
export const TreeFruit: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const grow = ramp(t, 0.2, 1.2);
  const fruit = ramp(t, at(c, 2), 2.2);
  const light = ramp(t, at(c, 2) + 0.6, 1);
  const tag = pop(t, at(c, 3));
  const sway = Math.sin(t * 1.4) * 2;
  const tx = x - 150;
  const fruits = Array.from({ length: 11 }).map((_, i) => ({ x: Math.cos(i * 2.39) * (90 + (i % 4) * 45), y: -330 + Math.sin(i * 2.39) * (70 + (i % 3) * 30) }));
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 30–31" k={ramp(t, 0.3, 0.5)} />
      <ellipse cx={tx} cy={812} rx={330} ry={34} fill="#7cae5a" opacity={0.6} />
      <g transform={`translate(${tx} 810) scale(${0.5 + 0.5 * grow}) rotate(${sway})`} opacity={clamp01(grow * 2)}>
        <path d="M -30 0 Q -26 -160 -40 -260 L 40 -260 Q 26 -160 30 0 Z" fill="#8a5a33" stroke={OL} strokeWidth={6} />
        {light > 0 && <rect x={-10} y={-250} width={20} height={240} rx={10} fill="#ffe08a" opacity={0.75 * light * (0.7 + 0.3 * Math.sin(t * 3))} />}
        <path d="M -30 -230 Q -140 -260 -170 -320 M 30 -230 Q 140 -260 170 -330" stroke="#8a5a33" strokeWidth={22} fill="none" strokeLinecap="round" />
        {[[-150, -360, 130], [0, -420, 170], [150, -360, 130], [-70, -300, 120], [80, -300, 120]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={["#5bb36a", "#4fa35e", "#62bd72", "#56ad66", "#6cc47b"][i]} stroke={OL} strokeWidth={5} />
        ))}
        {fruits.map((f, i) => {
          const k = clamp01(fruit * 11 - i);
          return k > 0 ? <circle key={i} cx={f.x} cy={f.y} r={22 * k} fill="#ff7a6b" stroke={OL} strokeWidth={4} /> : null;
        })}
      </g>
      <g opacity={ramp(t, at(c, 1.2), 0.5)}>
        <Tag x={x + 330} y={420} text="вера — корень и ствол" size={32} color={C.white} />
      </g>
      <g opacity={fruit > 0 ? clamp01(fruit * 3) : 0}>
        <Tag x={x + 330} y={520} text="добрые дела — плоды" size={32} color="#ffd0c2" />
      </g>
      {tag > 0.001 && (
        <g transform={`translate(${x + 300} 680) scale(${tag})`}>
          <Panel x={-260} y={-90} w={520} h={170} fill="#fffaf0" stroke={C.gold} r={26} />
          <Txt x={0} y={-20} size={32} weight={700} family={SERIF}>
            {"«Сохранить веру сложнее,\nчем ее обрести»"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── между страхом и надеждой ───────────────
export const FearHope: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = pop(t, 0.2);
  const ext = ramp(t, at(c, 1), 0.5);
  const quote = ramp(t, at(c, 2), 0.6);
  const bal = Math.sin(t * 1.6) * 3;
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 38–39" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} 330) scale(${k})`} opacity={clamp01(k * 2) * (1 - quote * 0.75)}>
        <rect x={-10} y={0} width={20} height={380} fill="#8a5a33" stroke={OL} strokeWidth={5} />
        <rect x={-110} y={370} width={220} height={30} rx={10} fill="#8a5a33" stroke={OL} strokeWidth={5} />
        <g transform={`rotate(${bal})`}>
          <rect x={-380} y={-12} width={760} height={24} rx={12} fill="#b8864b" stroke={OL} strokeWidth={5} />
          {[-1, 1].map((sd, i) => (
            <g key={sd} transform={`translate(${sd * 340} 0) rotate(${-bal})`}>
              <path d="M 0 0 L -90 160 M 0 0 L 90 160" stroke={OL} strokeWidth={4} />
              <path d="M -120 160 Q 0 230 120 160 Z" fill={i ? "#b9e6c6" : "#bfe0f7"} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={280} size={44} weight={900} family={HEAVY}>
                {i ? "надежда" : "страх"}
              </Txt>
            </g>
          ))}
        </g>
      </g>
      {ext > 0 &&
        ["самоуверенность", "отчаяние"].map((e, i) => (
          <g key={e} transform={`translate(${x + (i ? 560 : -560)} 330) scale(${ext})`} opacity={1 - quote}>
            <Tag x={0} y={0} text={e} size={32} color="#ececf2" />
            <Cross x={0} y={-6} s={70} k={ramp(t, at(c, 1.5) + i * 0.3, 0.4)} />
          </g>
        ))}
      <QuoteCard x={x} y={480} w={980} k={quote} text="Не теряйте надежды на милость Аллаха" by="Сура «Юсуф» 12/87 · PDF 39" size={52} />
    </g>
  );
};

// служебное: плавное число от a до b (для подсказок)
export const lerpN = (t: number, a: number, b: number, from: number, dur: number) => interpolate(t, [from, from + dur], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
