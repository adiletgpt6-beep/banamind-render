// Принцип 1 — IMAGE, и общие сцены всех акронимов: слово из плиток с раскрытием
// правил (IMAGE, SPARK, HUMAN; SHINE — в shine.tsx), новаторство, мастерство,
// искренность, характер, этика, лист практики.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { LetterTile, zoneX } from "./hook";
import { Brick, Bubble, CalendarGrid, Heart, Mountain, OL, Phone, Sprout, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

export type Rule = { ch: string; en: string; ru: string };
export const ACRONYMS: Record<string, { color: string; meaning: string; principle: string; rules: Rule[] }> = {
  IMAGE: {
    color: C.skyDeep,
    meaning: "образ",
    principle: "Чтобы быть лидером,\nтитулы не нужны",
    rules: [
      { ch: "I", en: "Innovation", ru: "Новаторство" },
      { ch: "M", en: "Mastery", ru: "Мастерство" },
      { ch: "A", en: "Authenticity", ru: "Искренность" },
      { ch: "G", en: "Guts", ru: "Характер" },
      { ch: "E", en: "Ethics", ru: "Этика" },
    ],
  },
  SPARK: {
    color: C.violet,
    meaning: "искра",
    principle: "Бурные времена порождают\nвеликих лидеров",
    rules: [
      { ch: "S", en: "Speak with Candor", ru: "Говори\nс жаром" },
      { ch: "P", en: "Prioritize", ru: "Расставляй\nприоритеты" },
      { ch: "A", en: "Adversity Breeds\nOpportunity", ru: "Препятствия\nпорождают\nперспективы" },
      { ch: "R", en: "Respond\nVersus React", ru: "Отвечай,\nа не реагируй" },
      { ch: "K", en: "Kudos\nfor Everyone", ru: "Почёт\nи уважение\nкаждому" },
    ],
  },
  HUMAN: {
    color: C.green,
    meaning: "человечность",
    principle: "Чем глубже отношения с людьми,\nтем сильнее авторитет",
    rules: [
      { ch: "H", en: "Helpfulness", ru: "Услужливость" },
      { ch: "U", en: "Understanding", ru: "Понимание" },
      { ch: "M", en: "Mingle", ru: "Общение" },
      { ch: "A", en: "Amuse", ru: "Веселье" },
      { ch: "N", en: "Nurture", ru: "Забота" },
    ],
  },
  SHINE: {
    color: C.yellowDeep,
    meaning: "сияй",
    principle: "Чтобы стать великим лидером,\nсначала станьте великой личностью",
    rules: [
      { ch: "S", en: "See Clearly", ru: "Смотрите на мир\nнепредубеждённо" },
      { ch: "H", en: "Health Is Wealth", ru: "Ваше здоровье —\nваше богатство" },
      { ch: "I", en: "Inspiration\nMatters", ru: "Живите\nвдохновенно" },
      { ch: "N", en: "Neglect Not\nYour Family", ru: "Помните\nо близких" },
      { ch: "E", en: "Elevate Your\nLifestyle", ru: "Каждый день\nповышайте свой\nуровень жизни" },
    ],
  },
};

// карточка правила под буквой
export const RuleCard: React.FC<{ x: number; y: number; r: Rule; color: string; k: number; dim?: number; w?: number }> = ({ x, y, r, color, k, dim = 0, w = 250 }) => {
  if (k <= 0.001) return null;
  const ru = r.ru.split("\n");
  const en = r.en.split("\n");
  // размер русского текста — чтобы самая длинная строка помещалась в карточку
  const ruSize = Math.min(30, (w - 28) / (Math.max(...ru.map((l) => l.length)) * 0.6));
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * k})`} opacity={clamp01(k * 1.6) * (1 - dim * 0.6)}>
      <rect x={-w / 2 + 5} y={-10 + 8} width={w} height={250} rx={24} fill="#000" opacity={0.08} />
      <rect x={-w / 2} y={-10} width={w} height={250} rx={24} fill="#fff" stroke={color} strokeWidth={5} />
      <circle cx={0} cy={-10} r={34} fill={color} stroke={OL} strokeWidth={3} />
      <text x={0} y={6} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={42} fill="#fff">
        {r.ch}
      </text>
      {en.map((l, i) => (
        <text key={i} x={0} y={60 + i * 26} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.inkSoft}>
          {l}
        </text>
      ))}
      {ru.map((l, i) => (
        <text key={i} x={0} y={60 + en.length * 26 + 30 + i * (ruSize + 4)} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={ruSize} fill={C.ink}>
          {l}
        </text>
      ))}
    </g>
  );
};

// слово-акроним плитками
export const WordTiles: React.FC<{ word: string; x: number; y: number; t: number; at: number; s?: number; color: string; hi?: number }> = ({ word, x, y, t, at: a, s = 1, color, hi = -1 }) => (
  <g>
    {word.split("").map((ch, i) => {
      const k = pop(t, a + i * 0.08);
      const lift = hi === i ? -14 : 0;
      return <LetterTile key={i} x={x + (i - 2) * 112 * s} y={y + lift - (1 - clamp01(k)) * 50} ch={ch} color={hi >= 0 && hi !== i ? "#aab4c4" : color} s={s} k={k} />;
    })}
  </g>
);

type AcrP = { word: string; n: number; focus?: string; host?: unknown };

export const Acronym: React.FC<VisualProps<AcrP>> = (c) => {
  const { t, p } = c;
  const cx = zoneX(p.host);
  const A = ACRONYMS[p.word];
  if (p.word === "IMAGE") return <ImageIntro {...c} />;
  if (p.word === "HUMAN" && p.focus) return <HumanFocus {...c} />;
  // SPARK: слово сразу, правила — по второй реплике
  const tiles = 0.2;
  const spark = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <g>
      <g transform={`translate(${cx} 165)`}>
        <Txt x={0} y={0} size={34} weight={800} color={C.inkSoft}>
          {`Принцип ${p.n}: ${A.principle.replace("\n", " ")}`}
        </Txt>
      </g>
      <WordTiles word={p.word} x={cx} y={300} t={t} at={tiles} s={1.1} color={A.color} />
      <Pop t={t} at={at(c, 0.6)} x={cx + 380} y={300}>
        <g>
          <circle r={48} fill={C.yellow} opacity={0.4 + 0.4 * spark} />
          <path d="M 0 -36 L 10 -10 L 36 0 L 10 10 L 0 36 L -10 10 L -36 0 L -10 -10 Z" fill="#fff" stroke={C.yellowDeep} strokeWidth={4} />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 0.5)} x={cx} y={400}>
        <Tag x={0} y={0} text={`«${A.meaning}»`} size={36} color={C.yellow} />
      </Pop>
      {A.rules.map((r, i) => (
        <RuleCard key={i} x={cx + (i - 2) * 270} y={520} r={r} color={A.color} k={pop(t, at(c, 1 + i * 0.19))} />
      ))}
    </g>
  );
};

// IMAGE: горничная, отель, слово, правила
const ImageIntro: React.FC<VisualProps<AcrP>> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const A = ACRONYMS.IMAGE;
  const maid = pop(t, 0.2);
  const word = ramp(t, at(c, 3), 0.5);
  const sparkle = (i: number) => 0.5 + 0.5 * Math.sin(t * 5 + i * 2);
  const brand = pop(t, at(c, 1.3));
  const principle = pop(t, at(c, 2.2));
  const first = 1 - word;
  return (
    <g>
      {first > 0 && (
        <g opacity={first}>
          {/* номер отеля: кровать, блеск */}
          <g transform={`translate(${cx} 600) scale(${maid})`}>
            <rect x={-420} y={-60} width={360} height={140} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-420} y={-110} width={110} height={70} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-420} y={-20} width={360} height={40} fill={C.sky} opacity={0.6} />
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d={`M ${-360 + i * 90} -150 l 8 20 l 20 8 l -20 8 l -8 20 l -8 -20 l -20 -8 l 20 -8 Z`} fill={C.yellow} opacity={sparkle(i)} />
            ))}
            <Worker x={120} y={80} s={1.6} role="maid" t={t} arms={0.5} />
            <path d={`M 190 -60 q 30 ${-20 + Math.sin(t * 6) * 10} 60 0`} stroke={C.sky} strokeWidth={8} fill="none" strokeLinecap="round" />
            <Tag x={-240} y={160} text="уборка как искусство" size={32} color={C.yellow} />
          </g>
          {brand > 0 && (
            <g transform={`translate(${cx + 230} 330) scale(${brand})`}>
              <Bubble x={0} y={0} w={380} h={110} />
              <Txt x={0} y={-6} size={30}>
                я представляю
              </Txt>
              <Txt x={0} y={30} size={30} weight={900}>
                весь отель
              </Txt>
            </g>
          )}
          {principle > 0 && (
            <g transform={`translate(${cx - 120} 230) scale(${principle})`}>
              <rect x={-330} y={-60} width={660} height={110} rx={30} fill={C.ink} />
              <Txt x={0} y={-10} size={30} color="#fff">
                Чтобы быть лидером,
              </Txt>
              <Txt x={0} y={30} size={30} color={C.yellow}>
                титулы не нужны
              </Txt>
            </g>
          )}
        </g>
      )}
      {word > 0 && (
        <g opacity={word}>
          <Txt x={cx} y={160} size={34} weight={800} color={C.inkSoft}>
            Принцип 1: Чтобы быть лидером, титулы не нужны
          </Txt>
          <WordTiles word="IMAGE" x={cx} y={290} t={t} at={at(c, 3)} s={1.1} color={A.color} />
          <Pop t={t} at={at(c, 3.6)} x={cx + 390} y={290}>
            <Tag x={0} y={0} text="«образ»" size={36} color={C.yellow} />
          </Pop>
          {A.rules.map((r, i) => (
            <RuleCard key={i} x={cx + (i - 2) * 270} y={520} r={r} color={A.color} k={pop(t, at(c, 4 + i * 0.18))} />
          ))}
        </g>
      )}
    </g>
  );
};

// HUMAN по частям: H+U (s28) и M+A+N (s29)
const HumanFocus: React.FC<VisualProps<AcrP>> = (c) => {
  const { t, p } = c;
  const cx = zoneX(p.host);
  const A = ACRONYMS.HUMAN;
  const first = p.focus === "HU";
  // какая буква сейчас в фокусе
  const beats = first ? [1, 3] : [0, 1, 2];
  const letters = first ? [0, 1] : [2, 3, 4];
  let cur = -1;
  beats.forEach((b, i) => {
    if (t >= at(c, b) - 0.2) cur = letters[i];
  });
  const wordIn = first ? 0.2 : 0;
  return (
    <g>
      <WordTiles word="HUMAN" x={cx} y={190} t={t} at={wordIn} s={0.85} color={A.color} hi={cur} />
      {first && (
        <Pop t={t} at={at(c, 0.6)} x={cx} y={290}>
          <Tag x={0} y={0} text="«человечность»" size={32} color={C.yellow} />
        </Pop>
      )}
      {cur >= 0 && (
        <g>
          <RuleCard x={cx - 420} y={420} r={A.rules[cur]} color={A.color} k={pop(t, at(c, beats[letters.indexOf(cur)]))} w={260} />
          <g transform={`translate(${cx + 150} 600)`}>
            <HumanArt i={cur} t={t} c={c} />
          </g>
        </g>
      )}
      {first && cur < 0 && (
        <g>
          {A.rules.map((r, i) => (
            <RuleCard key={i} x={cx + (i - 2) * 270} y={430} r={r} color={A.color} k={pop(t, at(c, 0.4) + i * 0.15)} />
          ))}
        </g>
      )}
    </g>
  );
};

const HumanArt: React.FC<{ i: number; t: number; c: VisualProps<AcrP> }> = ({ i, t, c }) => {
  if (i === 0) {
    // помочь больше, чем требует инструкция; продавец «сквозь» и продавец-помощник
    const two = ramp(t, at(c, 2), 0.6);
    return (
      <g>
        <Worker x={-260} y={160} s={1.3} role="clerk" t={t} mood={two > 0.5 ? "flat" : "smile"} />
        <Worker x={-110} y={160} s={1.2} role="plain" color={C.pink} t={t} />
        <rect x={-60} y={40} width={90} height={70} rx={10} fill={C.orange} stroke={OL} strokeWidth={4} />
        <Tag x={-180} y={-160} text={two > 0.5 ? "смотрит сквозь" : "помогу донести"} size={28} color={two > 0.5 ? "#dfe3ea" : C.yellow} />
        {two > 0 && (
          <g opacity={two}>
            <Worker x={140} y={160} s={1.3} role="clerk" t={t} arms={0.5} />
            <Worker x={290} y={160} s={1.2} role="plain" color={C.teal} t={t} />
            <Heart x={220} y={-80} s={1.1 + 0.1 * Math.sin(t * 4)} />
            <Tag x={215} y={-160} text="вернусь сюда!" size={28} color={C.yellow} />
          </g>
        )}
      </g>
    );
  }
  if (i === 1) {
    // слушать: «жду своей очереди» против настоящего слушания
    const wait = ramp(t, at(c, 4), 0.5);
    const listen = ramp(t, at(c, 5), 0.6);
    return (
      <g>
        <Worker x={-200} y={170} s={1.3} role="plain" color={C.violet} t={t} />
        <Worker x={160} y={170} s={1.3} role="plain" color={C.orange} t={t} flip />
        <Bubble x={-200} y={-140} w={240} h={90} />
        <g transform="translate(-200 -132)">
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={-40 + k * 40} cy={0} r={10} fill={C.inkSoft} opacity={0.4 + 0.6 * ((Math.floor(t * 3) + k) % 3 === 0 ? 1 : 0)} />
          ))}
        </g>
        {wait > 0 && listen < 1 && (
          <g opacity={wait * (1 - listen)}>
            <Bubble x={190} y={-150} w={300} h={90} fill="#ffe9e9" />
            <Txt x={190} y={-140} size={26} color={C.red}>
              когда уже моя очередь?
            </Txt>
          </g>
        )}
        {listen > 0 && (
          <g opacity={listen}>
            <path d="M 70 40 q 30 -40 0 -80 M 100 60 q 50 -60 0 -120" stroke={C.green} strokeWidth={7} fill="none" strokeLinecap="round" />
            <Tag x={170} y={-150} text="слушаю, не перебиваю" size={28} color={C.yellow} />
          </g>
        )}
      </g>
    );
  }
  if (i === 2) {
    // общение: выйти из ракушки
    const out = ramp(t, at(c, 0.3), 1.2);
    return (
      <g>
        <path d="M -260 160 Q -260 -20 -160 -20 Q -60 -20 -60 160 Z" fill="#f5d0a9" stroke={OL} strokeWidth={5} />
        <Worker x={interpolate(out, [0, 1], [-160, 0])} y={160} s={1.2} role="plain" color={C.sky} t={t} arms={out} />
        {[0, 1, 2].map((k) => (
          <Worker key={k} x={120 + k * 110} y={160} s={1.05} role="plain" color={[C.pink, C.green, C.orange][k]} t={t + k} arms={out * 0.5} />
        ))}
        <Tag x={60} y={-140} text="вживую, а не в ракушке" size={30} color={C.yellow} />
      </g>
    );
  }
  if (i === 3) {
    const laugh = 0.5 + 0.5 * Math.sin(t * 8);
    return (
      <g>
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${-200 + k * 200} ${160 - Math.abs(Math.sin(t * 5 + k)) * 14})`}>
            <Worker x={0} y={0} s={1.25} role="plain" color={[C.violet, C.coral, C.teal][k]} t={t} arms={0.6} />
          </g>
        ))}
        {[0, 1, 2, 3].map((k) => (
          <text key={k} x={-240 + k * 150} y={-110 - laugh * 20} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.yellowDeep}>
            ха
          </text>
        ))}
        <Tag x={0} y={-200} text="работа — не наказание" size={30} color={C.yellow} />
      </g>
    );
  }
  // забота: растить людей, как сад; доброта и твёрдость
  const grow = ramp(t, at(c, 2), 3);
  const scale = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      {[0, 1, 2, 3].map((k) => (
        <Sprout key={k} x={-380 + k * 130} y={170} s={1.5} grow={clamp01(grow * 1.3 - k * 0.1)} t={t} color={[C.pink, C.yellow, C.violet, C.coral][k]} />
      ))}
      <Tag x={-185} y={-130} text="замечать лучшее" size={30} color={C.yellow} />
      {scale > 0 && (
        <g transform={`translate(400 40) scale(${scale * 0.9})`}>
          <path d="M 0 -120 L 0 80 M -110 -80 L 110 -80" stroke={OL} strokeWidth={8} strokeLinecap="round" />
          <path d="M -150 -80 L -110 0 L -70 -80 M 70 -80 L 110 0 L 150 -80" stroke={OL} strokeWidth={4} fill="none" />
          <ellipse cx={-110} cy={0} rx={50} ry={12} fill={C.coral} />
          <ellipse cx={110} cy={0} rx={50} ry={12} fill={C.skyDeep} />
          <Txt x={-110} y={50} size={24}>
            доброта
          </Txt>
          <Txt x={110} y={50} size={24}>
            твёрдость
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Innovation: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const stairs = ramp(t, at(c, 0.2), 2.5);
  const q = pop(t, at(c, 1));
  const cafe = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3), 0.5));
  const curve = ramp(t, at(c, 3.1), 2.5);
  const oldWay = ramp(t, at(c, 4), 1.5);
  const creep = ramp(t, at(c, 5), 3);
  const showA = 1 - ramp(t, at(c, 2), 0.4);
  const showC = ramp(t, at(c, 3), 0.4) * (1 - ramp(t, at(c, 5), 0.4));
  const showD = ramp(t, at(c, 5), 0.4);
  return (
    <g>
      {showA > 0 && (
        <g opacity={showA}>
          {Array.from({ length: 7 }).map((_, i) => {
            const k = clamp01(stairs * 7 - i);
            return (
              <g key={i} opacity={k}>
                <rect x={cx - 420 + i * 120} y={760 - i * 55 - 50} width={110} height={50 + i * 55} rx={8} fill={i % 2 ? "#bfe0fb" : "#9fd0f5"} stroke={OL} strokeWidth={3} />
                <Txt x={cx - 365 + i * 120} y={745 - i * 55 - 60} size={22} color={C.skyDeep}>
                  +1%
                </Txt>
              </g>
            );
          })}
          <Txt x={cx - 360} y={300} size={30} color={C.inkSoft} weight={800}>
            вчера
          </Txt>
          <Txt x={cx + 360} y={300} size={30} color={C.skyDeep} weight={900}>
            сегодня — чуть лучше
          </Txt>
          {q > 0 && (
            <g transform={`translate(${cx} 210) scale(${q})`}>
              <Bubble x={0} y={0} w={720} h={100} fill="#fffbe6" />
              <Txt x={0} y={12} size={36} weight={900}>
                Что я сегодня могу улучшить?
              </Txt>
            </g>
          )}
        </g>
      )}
      {cafe > 0 && (
        <g opacity={cafe}>
          <rect x={cx - 360} y={600} width={720} height={60} rx={14} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
          <Worker x={cx - 250} y={600} s={1.3} role="barista" t={t} />
          {["Анна: латте", "Иван: без сахара", "Лиза: какао"].map((s, i) => (
            <g key={i} transform={`translate(${cx - 60 + i * 150} 560)`} opacity={ramp(t, at(c, 2.2) + i * 0.3, 0.4)}>
              <path d="M -40 -70 L 40 -70 L 32 0 L -32 0 Z" fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M 40 -55 q 26 10 0 34" stroke={OL} strokeWidth={4} fill="none" />
              <Tag x={0} y={-110} text={s.split(":")[0]} size={22} color={C.yellow} />
            </g>
          ))}
          {[0, 1, 2].map((i) => {
            const back = ramp(t, at(c, 2.6) + i * 0.3, 0.8);
            return <Worker key={i} x={cx + 520 - back * 120 + i * 0} y={760 + i * 0} s={1} role="plain" color={[C.pink, C.teal, C.violet][i]} t={t + i} />;
          })}
          <Tag x={cx + 330} y={300} text="гости возвращаются" size={32} color={C.yellow} />
        </g>
      )}
      {showC > 0 && (
        <g opacity={showC}>
          <path d={`M ${cx - 450} 760 L ${cx + 450} 760 M ${cx - 450} 760 L ${cx - 450} 300`} stroke={OL} strokeWidth={6} />
          <path
            d={Array.from({ length: 41 }, (_, i) => {
              const x = i / 40;
              const y = (Math.pow(1.09, x * 40) - 1) / (Math.pow(1.09, 40) - 1);
              return `${i ? "L" : "M"} ${cx - 450 + x * 900 * curve} ${760 - y * 420 * curve}`;
            }).join(" ")}
            fill="none"
            stroke={C.green}
            strokeWidth={10}
            strokeLinecap="round"
          />
          {oldWay > 0 && <path d={`M ${cx - 450} 640 L ${cx - 450 + 900 * oldWay} ${640 + 90 * oldWay}`} stroke={C.red} strokeWidth={8} strokeDasharray="16 12" />}
          <Tag x={cx + 260} y={300} text="накопленный эффект" size={32} color={C.yellow} />
          {oldWay > 0.5 && <Tag x={cx + 300} y={740} text="«как всегда»" size={28} color="#ffd6d6" />}
        </g>
      )}
      {showD > 0 && (
        <g opacity={showD}>
          {/* посредственность подкрадывается: огонёк тускнеет день за днём */}
          {Array.from({ length: 6 }).map((_, i) => {
            const fade = clamp01(creep * 6 - i);
            const glow = 1 - 0.13 * i * fade;
            return (
              <g key={i} transform={`translate(${cx - 450 + i * 180} 560)`}>
                <circle r={70} fill={C.orange} opacity={0.6 * glow} />
                <path d="M 0 -60 Q 40 -10 20 30 Q 0 50 -20 30 Q -40 -10 0 -60 Z" fill={interpolate(glow, [0.3, 1], [0, 1]) > 0.5 ? C.yellowDeep : "#c7cdd8"} stroke={OL} strokeWidth={3} transform={`scale(${0.5 + 0.5 * glow})`} />
                <Txt x={0} y={130} size={24} color={C.inkSoft}>
                  {["месяц 1", "2", "4", "6", "9", "год"][i]}
                </Txt>
              </g>
            );
          })}
          <Tag x={cx} y={330} text="посредственность подкрадывается незаметно" size={30} color="#ffe2d6" />
        </g>
      )}
    </g>
  );
};

export const Mastery: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const pride = pop(t, 0.2);
  const best = pop(t, at(c, 1));
  const formula = pop(t, at(c, 3));
  const month = ramp(t, at(c, 5), 2.5);
  const idea = ramp(t, at(c, 6), 0.6);
  const s1 = 1 - ramp(t, at(c, 4), 0.4);
  const s2 = ramp(t, at(c, 4), 0.4) * (1 - idea);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx - 330} 600) scale(${pride})`}>
            <Worker x={0} y={0} s={1.5} role="clerk" t={t} arms={0.3} />
            <path d="M 70 -170 l 10 24 l 26 4 l -19 18 l 5 26 l -22 -13 l -22 13 l 5 -26 l -19 -18 l 26 -4 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
            <Tag x={0} y={90} text="работа, которой горжусь" size={28} color={C.yellow} />
          </g>
          {best > 0 && (
            <g transform={`translate(${cx + 220} 300) scale(${best})`}>
              {[110, 80, 50, 22].map((r, i) => (
                <circle key={i} r={r} fill={i % 2 ? "#fff" : C.red} stroke={OL} strokeWidth={3} />
              ))}
              <g transform={`translate(${-200 + ramp(t, at(c, 1.4), 0.6) * 200} 0)`}>
                <path d="M -80 0 L 0 0" stroke={OL} strokeWidth={6} />
                <path d="M 0 0 l -20 -12 m 20 12 l -20 12" stroke={OL} strokeWidth={6} />
              </g>
              <Txt x={0} y={170} size={30} weight={900}>
                как сделал бы лучший в мире?
              </Txt>
            </g>
          )}
          {formula > 0 && (
            <g transform={`translate(${cx + 220} 690) scale(${formula})`}>
              <rect x={-360} y={-50} width={720} height={90} rx={45} fill={C.ink} />
              <Txt x={0} y={10} size={32} color="#fff">
                фокус + время = мастерство
              </Txt>
            </g>
          )}
          <Pop t={t} at={at(c, 2.2)} x={cx + 220} y={560}>
            <Tag x={0} y={0} text="≈ 10 000 часов — ориентир" size={28} color="#fff" />
          </Pop>
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          <Txt x={cx} y={180} size={46} weight={900}>
            Ежедневная пятёрка
          </Txt>
          {/* пять целей на сегодня */}
          <g transform={`translate(${cx - 430} 270)`}>
            <Panel x={0} y={0} w={330} h={380} fill="#fff" r={24} />
            <Txt x={165} y={52} size={28} weight={900}>
              сегодня
            </Txt>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <rect x={30} y={80 + i * 58} width={36} height={36} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
                <Check x={48} y={97 + i * 58} s={18} k={ramp(t, at(c, 4.3) + i * 0.3, 0.3)} />
                <rect x={82} y={90 + i * 58} width={190 - (i % 3) * 30} height={16} rx={8} fill="#d7dde8" />
              </g>
            ))}
          </g>
          <g transform={`translate(${cx - 40} 300)`}>
            <CalendarGrid x={0} y={0} cols={6} rows={5} cell={58} done={Math.floor(month * 30)} />
          </g>
          {month > 0.3 && <Tag x={cx + 150} y={720} text="≈ 150 маленьких дел за месяц" size={30} color={C.yellow} />}
        </g>
      )}
      {idea > 0 && (
        <g opacity={idea}>
          <g transform={`translate(${cx - 220} 470)`}>
            <circle r={110} fill={C.yellow} opacity={0.3} />
            <path d="M -50 -20 A 60 60 0 1 1 50 -20 Q 44 10 26 30 L 26 54 L -26 54 L -26 30 Q -44 10 -50 -20 Z" fill="#fff6c4" stroke={OL} strokeWidth={5} />
            <rect x={-26} y={60} width={52} height={14} rx={4} fill={C.inkSoft} />
            <Txt x={0} y={170} size={30}>
              идея
            </Txt>
          </g>
          <Arrow x1={cx - 80} y1={470} x2={cx + 130} y2={470} k={ramp(t, at(c, 6.3), 0.6)} color={C.green} w={12} />
          <g transform={`translate(${cx + 260} 560)`}>
            <Worker x={0} y={0} s={1.3} role="plain" t={t} arms={0.3} />
            <Tag x={0} y={70} text="первый шаг" size={30} color={C.yellow} />
          </g>
        </g>
      )}
    </g>
  );
};

export const Authenticity: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const mask = ramp(t, at(c, 1.2), 1);
  const word = pop(t, at(c, 1.6));
  const values = pop(t, at(c, 2));
  const ego = ramp(t, at(c, 3), 1.2);
  const scale = ramp(t, at(c, 3.5), 0.8);
  const err = ramp(t, at(c, 4), 0.5);
  const s1 = 1 - ramp(t, at(c, 3), 0.4);
  const s2 = ramp(t, at(c, 3), 0.4) * (1 - err);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx - 220} 640)`}>
            <Worker x={0} y={0} s={2} role="plain" color={C.teal} t={t} />
            {/* маска роли */}
            <g transform={`translate(${mask * -230} ${-220 + mask * 170}) rotate(${mask * -50})`} opacity={1 - mask * 0.3}>
              <ellipse cx={0} cy={0} rx={74} ry={66} fill="#fff" stroke={OL} strokeWidth={5} />
              <path d="M -40 -10 q 12 -14 24 0 M 16 -10 q 12 -14 24 0" stroke={OL} strokeWidth={5} fill="none" />
              <path d="M -30 26 Q 0 50 30 26" stroke={OL} strokeWidth={5} fill="none" />
              <path d="M -74 -10 L -120 -30 M 74 -10 L 120 -30" stroke={OL} strokeWidth={3} />
            </g>
            <Tag x={0} y={100} text={mask > 0.5 ? "настоящий" : "роль «как надо»"} size={30} color={mask > 0.5 ? C.yellow : "#dfe3ea"} />
          </g>
          {word > 0 && (
            <g transform={`translate(${cx + 260} 330) scale(${word})`}>
              <Panel x={-200} y={-80} w={400} h={150} fill="#fff" r={24} />
              <Txt x={0} y={-12} size={30}>
                сказал —
              </Txt>
              <Txt x={0} y={34} size={34} weight={900} color={C.greenDeep}>
                сделал
              </Txt>
            </g>
          )}
          {values > 0 && (
            <g transform={`translate(${cx + 260} 600) scale(${values})`}>
              <Tag x={-110} y={0} text="ценности" size={30} color={C.yellow} />
              <Tag x={110} y={70} text="таланты" size={30} color={C.yellow} />
              <Heart x={-180} y={90} s={0.9} />
            </g>
          )}
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          {/* эго за дверью */}
          <rect x={cx - 420} y={300} width={200} height={400} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={6} />
          <g transform={`translate(${cx - 520 - ego * 60} 640)`}>
            <path d="M -50 0 L -40 -110 L -20 -90 L 0 -130 L 20 -90 L 40 -110 L 50 0 Z" fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={50} size={26}>
              эго
            </Txt>
          </g>
          <Worker x={cx - 120} y={700} s={1.4} role="plain" color={C.teal} t={t} />
          {scale > 0 && (
            <g transform={`translate(${cx + 260} 520) scale(${scale})`}>
              <path d="M 0 -200 L 0 160 M -60 160 L 60 160" stroke={OL} strokeWidth={10} strokeLinecap="round" />
              <g transform={`rotate(${-12 * scale})`}>
                <path d="M -220 -170 L 220 -170" stroke={OL} strokeWidth={8} strokeLinecap="round" />
                <path d="M -260 -170 L -220 -80 L -180 -170 M 180 -170 L 220 -80 L 260 -170" stroke={OL} strokeWidth={4} fill="none" />
                <ellipse cx={-220} cy={-80} rx={70} ry={14} fill={C.grey} />
                <ellipse cx={220} cy={-80} rx={70} ry={14} fill={C.green} />
                <Txt x={-220} y={-110} size={26}>
                  получил
                </Txt>
                <Txt x={220} y={-110} size={26} color={C.greenDeep}>
                  дал
                </Txt>
              </g>
            </g>
          )}
        </g>
      )}
      {err > 0 && (
        <g opacity={err}>
          <Worker x={cx - 250} y={700} s={1.5} role="clerk" t={t} />
          <g transform={`translate(${cx - 250} 330)`}>
            <Bubble x={0} y={0} w={420} h={110} fill="#fffbe6" />
            <Txt x={0} y={12} size={34} weight={900}>
              я ошибся, исправлю
            </Txt>
          </g>
          {[0, 1, 2].map((i) => (
            <Worker key={i} x={cx + 120 + i * 150} y={700} s={1.2} role="plain" color={[C.pink, C.sky, C.orange][i]} t={t + i} />
          ))}
          <Pop t={t} at={at(c, 4.6)} x={cx + 270} y={380}>
            <Tag x={0} y={0} text="доверие +" size={36} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const Courage: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const climb = ramp(t, at(c, 0.3), Math.max(2, at(c, 4) - at(c, 0.3)));
  const doubt = ramp(t, at(c, 1), 0.6);
  const valley = ramp(t, at(c, 2), 0.6);
  const fall = ramp(t, at(c, 3.2), 0.4) * (1 - ramp(t, at(c, 3.6), 0.5));
  const useful = ramp(t, at(c, 4), 0.6);
  const px = cx - 380 + climb * 520;
  const py = 760 - climb * 420 + fall * 60;
  return (
    <g>
      {/* долина уюта слева, гора возможностей справа */}
      <path d={`M ${cx - 640} 800 Q ${cx - 450} 700 ${cx - 300} 790`} fill="#bde6b8" opacity={valley} />
      <g opacity={valley}>
        <rect x={cx - 560} y={700} width={130} height={80} rx={10} fill="#ffe9a8" stroke={OL} strokeWidth={3} />
        <path d={`M ${cx - 575} 705 L ${cx - 495} 650 L ${cx - 415} 705 Z`} fill={C.coral} stroke={OL} strokeWidth={3} />
        <Tag x={cx - 490} y={620} text="долина уюта" size={26} color="#fff" />
      </g>
      <Mountain x={cx + 200} y={820} s={1.15} color="#9db8d9" />
      <path d={`M ${cx - 380} 760 L ${cx + 140} 340`} stroke="#fff" strokeWidth={10} strokeDasharray="20 16" opacity={0.8} />
      <g opacity={valley}>
        <Tag x={cx + 330} y={250} text="гора возможностей" size={28} color={C.yellow} />
      </g>
      <g transform={`translate(${px} ${py}) rotate(${fall * 70})`}>
        <Worker x={0} y={0} s={1.1} role="plain" color={C.red} t={t} arms={0.4} />
      </g>
      {/* голоса «не выйдет» */}
      {doubt > 0 &&
        ["не выйдет", "куда ты?", "смешно!"].map((s, i) => (
          <g key={i} transform={`translate(${cx - 480 + i * 210} ${330 + (i % 2) * 90})`} opacity={doubt * (1 - useful * 0.6) * (0.75 + 0.25 * Math.sin(t * 3 + i))}>
            <Bubble x={0} y={0} w={200} h={70} fill="#eef1f6" />
            <Txt x={0} y={8} size={24} color={C.inkSoft}>
              {s}
            </Txt>
          </g>
        ))}
      <Pop t={t} at={at(c, 3.7)} x={cx + 360} y={560}>
        <Tag x={0} y={0} text="упал — встал" size={30} color={C.yellow} />
      </Pop>
      {useful > 0 && (
        <g transform={`translate(${cx - 260} 200)`} opacity={useful}>
          <Bubble x={0} y={0} w={360} h={80} fill="#e6f7ea" />
          <Txt x={0} y={8} size={26} color={C.greenDeep}>
            полезный совет — учту
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Ethics: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const build = ramp(t, at(c, 0.3), 3.5);
  const pull = ramp(t, at(c, 1.6), 0.5);
  const crash = ramp(t, at(c, 1.9), 0.8);
  const phone = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3), 0.5));
  const simple = ramp(t, at(c, 3), 0.5) * (1 - ramp(t, at(c, 4), 0.5));
  const film = ramp(t, at(c, 4), 0.5);
  const showWall = 1 - ramp(t, at(c, 2), 0.4);
  return (
    <g>
      {showWall > 0 && (
        <g opacity={showWall}>
          {Array.from({ length: 24 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const k = clamp01(build * 24 - i);
            if (k <= 0) return null;
            const dx = crash * ((i * 53) % 200 - 100);
            const dy = crash * (300 - row * 30) * ((i * 7) % 3 === 0 ? 1 : 0.7);
            const isPulled = i === 5;
            return (
              <Brick
                key={i}
                x={cx - 195 + col * 130 + (row % 2) * 30 + dx + (isPulled ? pull * 300 : 0)}
                y={780 - row * 62 + dy - (1 - k) * 60}
                w={124}
                h={56}
                rot={crash * ((i * 31) % 40 - 20)}
                color={isPulled ? C.red : "#d9774f"}
                label={["честность", "слово", "вовремя", "", "", "", "", "порядочность"][i] ?? ""}
              />
            );
          })}
          <Tag x={cx} y={300} text={crash > 0.3 ? "одна минута" : "годы"} size={36} color={crash > 0.3 ? "#ffd6d6" : C.yellow} />
        </g>
      )}
      {phone > 0 && (
        <g opacity={phone}>
          <Phone x={cx - 200} y={520} s={1.3}>
            <Txt x={0} y={-60} size={22}>
              отзыв
            </Txt>
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} transform={`translate(${-48 + i * 24} -20) scale(0.45)`} d="M 0 -26 L 8 -8 L 26 -6 L 12 6 L 16 26 L 0 16 L -16 26 L -12 6 L -26 -6 L -8 -8 Z" fill={i < 1 ? C.yellowDeep : "#d7dde8"} />
            ))}
            <rect x={-50} y={10} width={100} height={10} rx={5} fill="#c7cdd8" />
            <rect x={-50} y={30} width={80} height={10} rx={5} fill="#c7cdd8" />
          </Phone>
          {Array.from({ length: 12 }).map((_, i) => (
            <Worker key={i} x={cx + 60 + (i % 4) * 110} y={420 + Math.floor(i / 4) * 150} s={0.6 * ramp(t, at(c, 2.3) + i * 0.08, 0.3)} role="plain" color={[C.sky, C.pink, C.teal, C.orange][i % 4]} t={t + i} mood="flat" />
          ))}
          <Tag x={cx + 220} y={260} text="прочитают тысячи" size={32} color={C.yellow} />
        </g>
      )}
      {simple > 0 && (
        <g opacity={simple}>
          {["приходить вовремя", "выполнять обещанное", "относиться к людям так, как хотите, чтобы относились к вам"].map((s, i) => (
            <g key={i} transform={`translate(${cx} ${320 + i * 150})`} opacity={ramp(t, at(c, 3.1) + i * 0.35, 0.4)}>
              <rect x={-460} y={-50} width={920} height={96} rx={30} fill="#fff" stroke={OL} strokeWidth={3} />
              <Check x={-410} y={-2} s={30} k={ramp(t, at(c, 3.2) + i * 0.35, 0.4)} />
              <Txt x={20} y={12} size={i === 2 ? 26 : 34}>
                {s}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {film > 0 && (
        <g opacity={film}>
          {/* киноплёнка: слово и дело совпадают */}
          <rect x={cx - 460} y={330} width={920} height={300} rx={14} fill={OL} />
          {Array.from({ length: 14 }).map((_, i) => (
            <g key={i}>
              <rect x={cx - 440 + i * 65} y={345} width={30} height={22} rx={4} fill="#fff" />
              <rect x={cx - 440 + i * 65} y={595} width={30} height={22} rx={4} fill="#fff" />
            </g>
          ))}
          <rect x={cx - 420} y={385} width={400} height={190} rx={8} fill="#fffbe6" />
          <rect x={cx + 20} y={385} width={400} height={190} rx={8} fill="#e6f4ff" />
          <Txt x={cx - 220} y={470} size={36} weight={900}>
            говорю
          </Txt>
          <Txt x={cx + 220} y={470} size={36} weight={900}>
            делаю
          </Txt>
          <path d={`M ${cx - 380} 530 ${Array.from({ length: 20 }, (_, i) => `L ${cx - 380 + i * 18} ${530 + Math.sin(t * 8 + i) * 16}`).join(" ")}`} stroke={C.skyDeep} strokeWidth={5} fill="none" />
          <path d={`M ${cx + 60} 530 ${Array.from({ length: 20 }, (_, i) => `L ${cx + 60 + i * 18} ${530 + Math.sin(t * 8 + i) * 16}`).join(" ")}`} stroke={C.skyDeep} strokeWidth={5} fill="none" />
          <Tag x={cx} y={720} text="звук и картинка совпадают" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// лист практики: задания + вопрос (IMAGE и SPARK)
const PRACTICE: Record<string, { title: string; items: { text: string; beat: number }[]; caution?: { beat: number; lines: string[] } }> = {
  image: {
    title: "Задание: принцип 1",
    items: [
      { text: "где я перекладываю ответственность?", beat: 1 },
      { text: "5 маленьких целей на каждый день недели", beat: 2 },
    ],
  },
  spark: {
    title: "Задание: принцип 2",
    items: [
      { text: "одна перемена, которую я откладываю", beat: 0.2 },
      { text: "почему я ей сопротивляюсь?", beat: 0.6 },
    ],
    caution: { beat: 1, lines: ["не всякая беда — «подарок»", "но маленький шаг выбрать можно"] },
  },
};

export const Practice: React.FC<VisualProps<{ set: string; host?: unknown }>> = (c) => {
  const { t, p } = c;
  const cx = zoneX(p.host);
  const P = PRACTICE[p.set];
  const sheet = pop(t, 0.2);
  const cau = P.caution ? ramp(t, at(c, P.caution.beat), 0.6) : 0;
  return (
    <g>
      <g transform={`translate(${cx - 270 * cau} 470) scale(${sheet * (1 - 0.22 * cau)}) rotate(${-2 + wob(t, 3, 0.8)})`}>
        <Panel x={-400} y={-300} w={800} h={560} fill="#fffef8" r={20} />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={-360} y1={-160 + i * 50} x2={360} y2={-160 + i * 50} stroke="#cfe0f5" strokeWidth={3} />
        ))}
        <line x1={-310} y1={-300} x2={-310} y2={260} stroke="#f5b5b5" strokeWidth={3} />
        <Txt x={0} y={-220} size={44} weight={900}>
          {P.title}
        </Txt>
        {P.items.map((it, i) => (
          <g key={i} opacity={ramp(t, at(c, it.beat), 0.4)}>
            <rect x={-350} y={-130 + i * 140} width={50} height={50} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            <Check x={-325} y={-105 + i * 140} s={26} k={ramp(t, at(c, it.beat + 0.6), 0.4)} />
            <text x={-270} y={-92 + i * 140} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.ink}>
              {it.text}
            </text>
            <path d={`M -270 ${-60 + i * 140} q 60 ${wob(t, i, 4)} 140 0 t 160 0 t 140 0`} stroke={C.skyDeep} strokeWidth={3} fill="none" opacity={0.5} />
          </g>
        ))}
      </g>
      {cau > 0 && P.caution && (
        <g transform={`translate(${cx + 370} 470) scale(${cau})`}>
          <Panel x={-260} y={-160} w={520} h={300} fill="#fff6e6" r={30} stroke={C.orange} />
          <circle cx={0} cy={-100} r={34} fill={C.orange} />
          <Txt x={0} y={-86} size={44} color="#fff" weight={900}>
            !
          </Txt>
          {P.caution.lines.map((l, i) => (
            <Txt key={i} x={0} y={-10 + i * 60} size={26}>
              {l}
            </Txt>
          ))}
        </g>
      )}
    </g>
  );
};

export { Cross };
