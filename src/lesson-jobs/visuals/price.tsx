// «Цена» и «Итоги»: девять месяцев, три истории, тайна и правда, семья, мог ли
// он быть мягче, спокойная передача; отрасли, карта авторов, три вопроса,
// последняя кнопка, прощание. Болезнь — спокойно и без натурализма.
import React from "react";
import { C, FONT } from "../theme";
import { BRAND } from "../../banamind/brand";
import { BookCover, ButtonGrid, Door, Heart, Note, OL, Person, Stage } from "./draw";
import { Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── c01: календарь из девяти месяцев ──
export const CalendarWait: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cal = ramp(t, 0.3, 0.8);
  const months = ramp(t, at(c, 1), 2.4);
  const regret = ramp(t, at(c, 2), 0.8);
  const note = ramp(t, at(c, 3), 0.6);
  const names = ["окт", "ноя", "дек", "янв", "фев", "мар", "апр", "май", "июн"];
  return (
    <Stage host={c.p.host}>
      <g opacity={cal}>
        <Txt x={640} y={190} size={32} weight={900} color={C.inkSoft}>
          {"девять месяцев ожидания"}
        </Txt>
        {names.map((m, i) => {
          const k = clamp01(months * 9 - i);
          return (
            <g key={m} transform={`translate(${210 + (i % 5) * 215} ${330 + Math.floor(i / 5) * 210})`}>
              <rect x={-80} y={-70} width={160} height={150} rx={14} fill={C.white} stroke={OL} strokeWidth={3} />
              <rect x={-80} y={-70} width={160} height={40} rx={14} fill={C.coral} opacity={0.7} />
              <Txt x={0} y={-40} size={24} weight={900} color={C.white}>
                {m}
              </Txt>
              <path d="M -40 10 L 40 60 M 40 10 L -40 60" stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" opacity={k * 0.6} />
            </g>
          );
        })}
      </g>
      {regret > 0 && (
        <g opacity={regret}>
          <Note x={1080} y={560} text={"годы спустя —\nс сожалением"} k={regret} color="#eef6ff" size={26} rot={3} />
        </g>
      )}
      {note > 0 && (
        <g opacity={note} transform="translate(640 790)">
          <rect x={-420} y={-50} width={840} height={100} rx={50} fill={C.white} stroke={C.greenDeep} strokeWidth={4} />
          <Txt x={0} y={12} size={30} weight={900} color={C.greenDeep}>
            {"история — не совет · решать с врачами"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c02: три истории речи ──
export const ThreeStories: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const stage = ramp(t, 0.3, 0.8);
  const cards = [
    { w: "бросил колледж", d: "и пошёл на интересное", at: at(c, 1) },
    { w: "увольнение", d: "свобода стать новичком", at: at(c, 1.5) },
    { w: "болезнь", d: "остаётся главное", at: at(c, 2) },
  ];
  return (
    <Stage host={c.p.host}>
      <g opacity={stage}>
        <rect x={340} y={700} width={600} height={60} rx={14} fill={C.woodDark} />
        <rect x={600} y={600} width={80} height={100} rx={8} fill={C.wood} />
        <Txt x={640} y={190} size={30} color={C.inkSoft}>
          {"речь перед выпускниками · 2005"}
        </Txt>
      </g>
      {cards.map((k0, i) => {
        const k = pop(t, k0.at);
        return (
          <g key={k0.w} transform={`translate(${240 + i * 400} 400) scale(${k}) rotate(${(i - 1) * 3})`} opacity={clamp01(k)}>
            <Panel x={-170} y={-130} w={340} h={250} fill={[C.white, "#fff4e0", "#eef6ff"][i]} />
            <circle cx={0} cy={-80} r={34} fill={[C.coral, C.yellowDeep, C.skyDeep][i]} />
            <Txt x={0} y={-68} size={32} weight={900} color={C.white}>
              {String(i + 1)}
            </Txt>
            <Txt x={0} y={10} size={32} weight={900}>
              {k0.w}
            </Txt>
            <Txt x={0} y={60} size={24} color={C.inkSoft}>
              {k0.d}
            </Txt>
          </g>
        );
      })}
    </Stage>
  );
};

// ── c03: тайна и правда; донорство ──
export const Secrecy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const curtain = ramp(t, 0.3, 1);
  const open = ramp(t, at(c, 1), 1.2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 470)">
        <rect x={-420} y={-300} width={840} height={560} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={-220} size={30} weight={900}>
          {"что знала публика"}
        </Txt>
        <Note x={-200} y={-60} text={"«здоров»"} k={curtain} color="#eef1f5" size={30} rot={-3} />
        <Note x={180} y={-40} text={"«гормональный сбой»"} k={curtain} color="#eef1f5" size={28} rot={3} />
        <Txt x={0} y={80} size={28} color={C.red} opacity={curtain}>
          {"Айзексон: «не вся правда»"}
        </Txt>
        {/* занавес раскрывается */}
        <rect x={-420} y={120} width={420 * (1 - open)} height={140} fill={C.coral} opacity={0.75} />
        <rect x={420 * open} y={120} width={420 * (1 - open)} height={140} fill={C.coral} opacity={0.75} />
        {open > 0 && (
          <g opacity={open}>
            <Heart x={-180} y={190} s={0.7} color={C.green} />
            <Txt x={80} y={204} size={30} weight={900} color={C.greenDeep}>
              {"призыв стать донорами"}
            </Txt>
          </g>
        )}
      </g>
    </Stage>
  );
};

// ── c04: семья ──
export const FamilyRoom: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fam = ramp(t, 0.3, 1.2);
  const voices = ramp(t, at(c, 1), 1);
  const lisa = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <rect x={80} y={160} width={1120} height={560} rx={30} fill="#fff6ea" />
      <rect x={160} y={220} width={260} height={180} rx={10} fill="#ffe7c2" stroke={OL} strokeWidth={3} />
      <path d="M 180 380 L 260 300 L 320 350 L 400 280" stroke={C.green} strokeWidth={8} fill="none" />
      <rect x={80} y={680} width={1120} height={40} rx={10} fill={C.woodLight} />
      {[
        ["Лорен", C.violet, 600],
        ["Рид", C.sky, 760],
        ["Эрин", C.coral, 880],
        ["Ив", C.green, 990],
        ["Лиза", C.yellowDeep, 1110],
      ].map(([n, col, x], i) => (
        <g key={n as string} opacity={clamp01(fam * 5 - i)}>
          <Person x={x as number} y={700} s={i === 0 ? 0.5 : 0.36} color={col as string} name={n as string} t={t} seed={i} />
        </g>
      ))}
      <Person x={450} y={700} s={0.5} color={C.ink} name="Джобс" t={t} seed={7} gesture={lisa > 0 ? "sad" : "stand"} />
      {voices > 0 && <Note x={830} y={260} text={"«он не совершенен»"} k={voices} color={C.white} size={28} rot={2} />}
      {lisa > 0 && (
        <g opacity={lisa}>
          <Note x={450} y={820} text={"«жаль, что не был лучшим отцом»"} k={lisa} color="#eef6ff" size={26} />
        </g>
      )}
    </Stage>
  );
};

// ── c05: нет фильтра ──
export const NoFilter: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pipe = ramp(t, 0.3, 1);
  const ask = ramp(t, at(c, 1), 0.8);
  const scale = ramp(t, at(c, 2), 1.2);
  return (
    <Stage host={c.p.host}>
      <g opacity={pipe} transform="translate(640 330)">
        <circle cx={-360} cy={0} r={90} fill={C.violet} opacity={0.85} />
        <Txt x={-360} y={10} size={30} weight={900} color={C.white}>
          {"мысль"}
        </Txt>
        <rect x={-260} y={-20} width={520} height={40} rx={20} fill={C.concrete} />
        <g transform={`translate(0 0)`}>
          <rect x={-40} y={-70} width={80} height={140} rx={10} fill="none" stroke={C.red} strokeWidth={5} strokeDasharray="12 10" />
          <Txt x={0} y={-90} size={24} color={C.red}>
            {"фильтра нет"}
          </Txt>
        </g>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={-240 + ((t * 300 + i * 170) % 500)} cy={0} r={14} fill={C.coral} />
        ))}
        <circle cx={360} cy={0} r={90} fill={C.coral} opacity={0.85} />
        <Txt x={360} y={10} size={30} weight={900} color={C.white}>
          {"слово"}
        </Txt>
      </g>
      {ask > 0 && (
        <g opacity={ask * (1 - scale * 0.5)}>
          <Person x={330} y={860} s={0.4} color={C.violet} name="Херцфельд" t={t} />
          <Person x={640} y={860} s={0.4} color={C.ink} name="Джобс" t={t} seed={2} flip />
          <Note x={490} y={590} text={"«я такой, какой есть»"} k={ask} color={C.white} size={26} />
        </g>
      )}
      {scale > 0 && (
        <g opacity={scale} transform="translate(1000 680)">
          <Panel x={-220} y={-140} w={440} h={280} fill="#fff1ee" />
          <Txt x={0} y={-80} size={26} weight={900}>
            {"Айзексон:"}
          </Txt>
          <Txt x={0} y={-30} size={24} color={C.inkSoft}>
            {"мог себя контролировать"}
          </Txt>
          <rect x={-160} y={20} width={320} height={26} rx={13} fill={C.concrete} />
          <rect x={-160} y={20} width={320 * 0.68 * scale} height={26} rx={13} fill={C.red} />
          <Txt x={0} y={95} size={24} color={C.red}>
            {"мешало чаще, чем помогало"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c06: спокойная передача ──
export const Handover: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const door = ramp(t, 0.3, 1);
  const pass = ramp(t, at(c, 1), 1.6);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - pass * 0.7}>
        <Door x={260} y={820} s={0.8} close={door} label="1985" />
      </g>
      <Pop t={t} at={at(c, 0.6)} x={640} y={250}>
        <rect x={-240} y={-90} width={480} height={180} rx={10} fill={C.white} stroke={OL} strokeWidth={3} />
        <Txt x={0} y={-30} size={26} color={C.inkSoft}>
          {"письмо совету · август 2011"}
        </Txt>
        <Txt x={0} y={30} size={32} weight={900}>
          {"«этот день настал»"}
        </Txt>
      </Pop>
      {pass > 0 && (
        <g opacity={pass}>
          <Person x={620} y={840} s={0.5} color={C.ink} name="Джобс" t={t} />
          <Person x={980} y={840} s={0.5} color={C.steel} name="Кук" t={t} seed={3} flip />
          <g transform={`translate(${680 + 200 * pass} ${600 - Math.sin(pass * Math.PI) * 80})`}>
            <rect x={-40} y={-30} width={80} height={60} rx={10} fill={C.yellow} stroke={OL} strokeWidth={3} />
            <circle r={10} fill={OL} />
          </g>
          <Tag x={800} y={470} text="без переворотов" color={C.green} size={28} textColor={C.white} />
        </g>
      )}
    </Stage>
  );
};

// ── e01: отрасли, которые изменились ──
export const Industries: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const few = ramp(t, 0.3, 0.8);
  const ring = ramp(t, at(c, 1), 2);
  const verdict = ramp(t, at(c, 2), 0.8);
  const list = ["компьютеры", "анимация", "музыка", "телефоны", "планшеты", "магазины"];
  return (
    <Stage host={c.p.host}>
      <g opacity={few * (1 - ring * 0.6)}>
        <Tag x={640} y={180} text="сам изобрёл немного" color={C.white} size={30} />
      </g>
      <g transform="translate(640 500)">
        <circle r={110} fill={C.yellow} stroke={OL} strokeWidth={4} opacity={ring} />
        <Txt x={0} y={-6} size={28} weight={900} opacity={ring}>
          {"соединять"}
        </Txt>
        <Txt x={0} y={30} size={22} color={C.inkSoft} opacity={ring}>
          {"идеи · искусство · технику"}
        </Txt>
        {list.map((w, i) => {
          const a = (i / list.length) * Math.PI * 2 - Math.PI / 2;
          const k = clamp01(ring * 6 - i);
          const x = Math.cos(a) * 340;
          const y = Math.sin(a) * 250;
          return (
            <g key={w} opacity={k}>
              <line x1={Math.cos(a) * 110} y1={Math.sin(a) * 110} x2={x * 0.82} y2={y * 0.82} stroke={OL} strokeWidth={3} opacity={0.5} />
              <Tag x={x} y={y} text={w} color={[C.sky, C.neon, C.coral, C.green, C.teal, C.yellowDeep][i]} size={26} textColor={C.white} />
            </g>
          );
        })}
      </g>
      {verdict > 0 && (
        <g opacity={verdict}>
          <Panel x={240} y={790} w={800} h={90} fill={C.ink} />
          <Txt x={640} y={848} size={32} weight={900} color={C.yellow}>
            {"«не самый выдающийся ум — но гений»"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── e02: карта настоящих авторов ──
export const CreditMap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const names = [
    ["Возняк", "плата"],
    ["Аткинсон", "графика"],
    ["Каре", "шрифты"],
    ["Лассетер", "фильмы"],
    ["Кэтмалл", "студия"],
    ["Айв", "дизайн"],
    ["Рубинштейн", "плеер"],
    ["Фаделл", "плеер"],
    ["Кук", "поставки"],
  ];
  const map = ramp(t, 0.2, 3.5);
  const choice = ramp(t, at(c, 1), 1);
  const team = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      {names.map(([n, w], i) => {
        const k = clamp01(map * 9 - i);
        const a = (i / names.length) * Math.PI * 2 - Math.PI / 2;
        const x = 640 + Math.cos(a) * 470;
        const y = 480 + Math.sin(a) * 300;
        return (
          <g key={n} opacity={k}>
            {choice > 0 && <line x1={640} y1={480} x2={x} y2={y} stroke={C.yellowDeep} strokeWidth={4} opacity={choice * 0.7} />}
            <g transform={`translate(${x} ${y})`}>
              <rect x={-110} y={-44} width={220} height={88} rx={20} fill={C.white} stroke={OL} strokeWidth={3} />
              <Txt x={0} y={-6} size={26} weight={900}>
                {n}
              </Txt>
              <Txt x={0} y={26} size={20} color={C.inkSoft}>
                {w}
              </Txt>
            </g>
          </g>
        );
      })}
      {choice > 0 && (
        <g opacity={choice} transform="translate(640 480)">
          <circle r={110 + 6 * Math.sin(t * 3)} fill={C.ink} />
          <Txt x={0} y={-10} size={28} weight={900} color={C.yellow}>
            {"Джобс:"}
          </Txt>
          <Txt x={0} y={30} size={26} weight={900} color={C.white}>
            {"выбор"}
          </Txt>
        </g>
      )}
      {team > 0 && <Tag x={640} y={630} text="без команды — ничего" color={C.yellow} size={30} />}
    </Stage>
  );
};

// ── e03: три вопроса себе ──
export const ThreeQuestions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const qs = [
    { w: "Что упростить?", at: at(c, 1) },
    { w: "Кого я не слышу?", at: at(c, 2) },
    { w: "Какую цену не переносить на людей?", at: at(c, 3) },
  ];
  return (
    <Stage host={c.p.host}>
      {qs.map((q, i) => {
        const k = pop(t, q.at);
        return (
          <g key={q.w} transform={`translate(640 ${260 + i * 180}) scale(${k})`} opacity={clamp01(k)}>
            <Panel x={-520} y={-70} w={1040} h={140} fill={i === 2 ? C.ink : C.white} />
            <circle cx={-440} cy={0} r={46} fill={[C.sky, C.coral, C.yellow][i]} />
            <Txt x={-440} y={14} size={40} weight={900} color={i === 2 ? C.ink : C.white}>
              {String(i + 1)}
            </Txt>
            <Txt x={-370} y={14} size={i === 2 ? 36 : 42} weight={900} anchor="start" color={i === 2 ? C.yellow : C.ink}>
              {q.w}
            </Txt>
          </g>
        );
      })}
    </Stage>
  );
};

// ── e04: последняя кнопка ──
export const LastButton: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const off = ramp(t, 0.3, 2.4);
  const one = ramp(t, at(c, 1), 1);
  const keep = (i: number) => i === 44;
  return (
    <Stage host={c.p.host} y={-60}>
      <g opacity={1 - one * 0.85}>
        <ButtonGrid x={640} y={400} cols={10} rows={6} keep={keep} off={off} t={t} size={40} />
      </g>
      {one > 0 && (
        <g transform={`translate(640 330) scale(${0.8 + 0.4 * one})`} opacity={one}>
          <circle r={120 + 10 * Math.sin(t * 2.4)} fill={C.yellow} opacity={0.3} />
          <rect x={-70} y={-70} width={140} height={140} rx={34} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Heart x={0} y={6} s={0.7} />
          <Txt x={0} y={200} size={34} weight={900}>
            {"как мы обращаемся с людьми"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── e05: прощание ──
export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const logo = pop(t, 0.3);
  const book = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host} y={-80}>
      <g transform={`translate(640 250) scale(${logo})`} opacity={clamp01(logo)}>
        <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={BRAND.ink}>
          {BRAND.wordmark[0]}
          <tspan fill={BRAND.yellow} stroke={BRAND.ink} strokeWidth={3} paintOrder="stroke">
            {BRAND.wordmark[1]}
          </tspan>
        </text>
        <Txt x={0} y={66} size={32} color={C.inkSoft}>
          {"Большие идеи. Простыми словами."}
        </Txt>
      </g>
      {book > 0 && (
        <g opacity={book}>
          <BookCover x={240} y={520} s={0.6} t={t} />
          <Txt x={1040} y={500} size={28} color={C.inkSoft}>
            {"Уолтер Айзексон, «Стив Джобс»"}
          </Txt>
          <Txt x={1040} y={545} size={22} color={C.inkSoft}>
            {"пер. Ю. Полещук, А. Цырульниковой,"}
          </Txt>
          <Txt x={1040} y={580} size={22} color={C.inkSoft}>
            {"А. Чередниченко, Д. Горяниной"}
          </Txt>
        </g>
      )}
      <g opacity={0.7}>
        {Array.from({ length: 10 }).map((_, i) => (
          <circle key={i} cx={100 + i * 120} cy={760 + wob(t, i, 12)} r={8} fill={[C.yellow, C.sky, C.coral][i % 3]} />
        ))}
      </g>
    </Stage>
  );
};
