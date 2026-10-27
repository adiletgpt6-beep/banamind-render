// Часть «Дневник»: двенадцать книг записок, где писались (Грануя, Карнунт, Дунай),
// линия жизни (по очерку Котляревского), дела правителя (по очерку), голоса файла,
// античная колоннада (без божеств и обрядов), дерево благодарности учителям, портрет отца.
import React from "react";
import { Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Big, Column, Laurel, OL, Person, Scroll, Tent, WaxTablet } from "./draw";

type VP = VisualProps<{ host?: string }>;
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// ── d01: 12 свитков выкатываются; замок «не для публики»; строки «спорят» ──
export const TwelveScrolls: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const lock = ramp(t, at(c, 1), 0.6);
  const talk = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {ROMAN.map((r, i) => {
        const k = pop(t, 0.2 + i * 0.12);
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = cx - 500 + col * 200;
        const y = 300 + row * 280 + wob(t, i, 4);
        return (
          <g key={r} transform={`translate(${x} ${y}) scale(${k * 0.85})`} opacity={clamp01(k * 1.4)}>
            <Scroll x={0} y={0} open={1} label={r} />
          </g>
        );
      })}
      {lock > 0 && (
        <g transform={`translate(${cx} 700) scale(${lock})`}>
          <Panel x={-330} y={-60} w={660} h={110} r={55} fill={C.yellow} />
          <g transform="translate(-260 -6)">
            <rect x={-26} y={-10} width={52} height={44} rx={8} fill={C.ink} />
            <path d="M -16 -10 V -26 A 16 16 0 0 1 16 -26 V -10" fill="none" stroke={C.ink} strokeWidth={8} />
          </g>
          <Txt x={30} y={12} size={40} weight={900}>
            не для чужих глаз
          </Txt>
        </g>
      )}
      {talk > 0 &&
        [0, 1, 2].map((i) => (
          <g key={i} opacity={talk} transform={`translate(${cx - 300 + i * 300} ${180 + wob(t, i, 8)})`}>
            <path d="M -60 -30 Q -60 -60 -30 -60 L 30 -60 Q 60 -60 60 -30 L 60 0 Q 60 30 30 30 L -10 30 L -30 50 L -26 30 Q -60 30 -60 0 Z" fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-6} size={36} weight={900} color={[C.coral, C.skyDeep, R.olive][i]}>
              {["?", "…", "!"][i]}
            </Txt>
          </g>
        ))}
    </g>
  );
};

// ── d02: карта — Дунай, приток Грануя, Карнунт, лагерь ──
export const DanubeMap: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k0 = ramp(t, 0.2, 1.2);
  const g = ramp(t, at(c, 0.3), 0.8);
  const ka = ramp(t, at(c, 1.2), 0.8);
  const camp = ramp(t, at(c, 2.2), 0.8);
  const ox = cx - 460;
  const river = `M ${ox} 520 Q ${ox + 200} 440 ${ox + 380} 500 T ${ox + 700} 470 T ${ox + 940} 540`;
  return (
    <g>
      <Panel x={ox - 40} y={150} w={1000} h={640} r={40} fill="#f3ead2" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${ox + 60 + i * 230} 220 q 40 -30 80 0 q 40 30 80 0`} fill="none" stroke="#c9b98f" strokeWidth={4} />
      ))}
      <path d={river} fill="none" stroke="#7cc0ec" strokeWidth={30} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - k0)} />
      <path d={river} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="20 30" strokeDashoffset={-t * 40} opacity={0.7 * k0} />
      <Txt x={ox + 520} y={430} size={40} weight={900} color={C.skyDeep} opacity={k0}>
        Дунай
      </Txt>
      {g > 0 && (
        <g opacity={g}>
          <path d={`M ${ox + 640} 480 Q ${ox + 620} 600 ${ox + 680} 720`} fill="none" stroke="#7cc0ec" strokeWidth={14} strokeLinecap="round" strokeDasharray={300} strokeDashoffset={300 * (1 - g)} />
          <Tag x={ox + 760} y={700} text="Грануя" size={32} color="#fff" />
          <Txt x={ox + 760} y={760} size={26} color={C.inkSoft}>
            (Книга I)
          </Txt>
        </g>
      )}
      {ka > 0 && (
        <g transform={`translate(${ox + 260} 480) scale(${ka})`}>
          <circle r={22} fill={R.terracotta} stroke={OL} strokeWidth={5} />
          <Tag x={0} y={-60} text="Карнунт" size={32} color={C.yellow} />
          <Txt x={0} y={60} size={26} color={C.inkSoft}>
            (Книга II)
          </Txt>
        </g>
      )}
      {camp > 0 &&
        [0, 1, 2].map((i) => (
          <g key={i} opacity={camp} transform={`translate(${ox + 440 + i * 70} ${620 + (i % 2) * 20})`}>
            <Tent x={0} y={0} s={0.18} open={0.4} />
          </g>
        ))}
      {camp > 0 && (
        <Txt x={ox + 510} y={690} size={30} weight={900} opacity={camp}>
          военный лагерь
        </Txt>
      )}
    </g>
  );
};

// ── d03: линия жизни по очерку Котляревского ──
export const LifeLine: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const x0 = cx - 480;
  const x1 = cx + 480;
  const k = ramp(t, 0.2, 1.4);
  const pts = [
    { x: x0, y: 500, top: "121 год", bot: "рождение", at: at(c, 0.25) },
    { x: x0 + 320, y: 500, top: "усыновлён", bot: "Антонином Пием", at: at(c, 0.6) },
    { x: x0 + 620, y: 500, top: "философия", bot: "спал на досках", at: at(c, 1.2) },
    { x: x1, y: 500, top: "180 год", bot: "лагерь на Дунае", at: at(c, 2.3) },
  ];
  return (
    <g>
      <line x1={x0} y1={500} x2={x0 + (x1 - x0) * k} y2={500} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {pts.map((p, i) => {
        const kk = pop(t, p.at);
        if (kk <= 0) return null;
        return (
          <g key={i} transform={`translate(${p.x} ${p.y}) scale(${kk})`}>
            <circle r={26} fill={i === 3 ? R.stone : C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-60} size={38} weight={900}>
              {p.top}
            </Txt>
            <Txt x={0} y={80} size={30} color={C.inkSoft}>
              {p.bot}
            </Txt>
          </g>
        );
      })}
      {t > at(c, 1.2) && (
        <g transform={`translate(${x0 + 620} 300) scale(${pop(t, at(c, 1.3))})`}>
          <rect x={-120} y={-20} width={240} height={30} rx={6} fill="#c79a5b" stroke={OL} strokeWidth={4} />
          <path d="M -110 -20 Q -60 -60 0 -40 Q 60 -64 110 -20 Z" fill="#a8692e" stroke={OL} strokeWidth={4} opacity={ramp(t, at(c, 1.7), 0.6)} />
          <Txt x={0} y={60} size={24} color={C.inkSoft}>
            доски → шкура
          </Txt>
        </g>
      )}
      <Pop t={t} at={0.4} x={cx} y={760}>
        <Tag x={0} y={0} text="по очерку С. А. Котляревского" size={30} color="#fff" />
      </Pop>
    </g>
  );
};

// ── d03b: дела правителя по очерку: наставники, сироты, матрасы под канатом ──
export const RulerDeeds: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const a = pop(t, at(c, 0.15));
  const b = pop(t, at(c, 0.6));
  const rope = ramp(t, at(c, 1), 0.5);
  const walk = ((t * 60) % 400) - 200;
  return (
    <g>
      <g transform={`translate(${cx - 300} 330) scale(${a})`}>
        <Person x={-60} y={60} s={1} color={R.olive} t={t} />
        <Person x={60} y={60} s={1} color={C.skyDeep} t={t + 1} />
        <Laurel x={0} y={-120} s={0.7} />
        <Txt x={0} y={150} size={30} weight={900}>
          наставники → в управление
        </Txt>
      </g>
      <g transform={`translate(${cx + 300} 330) scale(${b})`}>
        <path d="M -90 60 L -90 -40 L 0 -110 L 90 -40 L 90 60 Z" fill={R.marble} stroke={OL} strokeWidth={5} />
        <Person x={-30} y={60} s={0.6} color={C.coral} t={t} />
        <Person x={30} y={60} s={0.6} color={C.yellow} t={t + 2} />
        <Txt x={0} y={150} size={30} weight={900}>
          претор для сирот
        </Txt>
      </g>
      {rope > 0 && (
        <g opacity={rope}>
          <line x1={cx - 320} y1={600} x2={cx + 320} y2={600} stroke={C.brown} strokeWidth={6} />
          <rect x={cx - 320} y={760} width={640} height={40} rx={20} fill={R.terracottaSoft} stroke={OL} strokeWidth={4} />
          <rect x={cx - 320} y={760} width={640} height={10} rx={5} fill="#fff" opacity={0.5} />
          <g transform={`translate(${cx + walk} 600)`}>
            <Person x={0} y={-30} s={0.55} color={R.purple} t={t} arms={1} />
          </g>
          <Txt x={cx} y={840} size={28} color={C.inkSoft}>
            матрасы под канатом
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── d04: голоса файла — четыре карточки, у каждой свой цвет ──
export const Voices: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    { title: "Записи", who: "Марк Аврелий", color: R.purple, main: true },
    { title: "Предисловие", who: "переводчик Л. Д. Урусов", color: R.olive },
    { title: "Очерк", who: "С. А. Котляревский", color: R.terracotta },
    { title: "Примечания", who: "издатели", color: R.grey },
  ];
  const sep = ramp(t, at(c, 2), 0.7);
  return (
    <g>
      {items.map((it, i) => {
        const k = pop(t, at(c, 1 + i * 0.2));
        if (k <= 0) return null;
        const y = 330 + Math.floor(i / 2) * 260;
        const xx = cx + (i % 2 ? 1 : -1) * (190 + 70 * sep);
        return (
          <g key={i} transform={`translate(${xx} ${y}) scale(${k * (it.main ? 1.04 : 0.96)})`}>
            <rect x={-230} y={-90} width={460} height={190} rx={30} fill="#24324a" opacity={0.12} transform="translate(8 10)" />
            <rect x={-230} y={-90} width={460} height={190} rx={30} fill="#fff" stroke={it.color} strokeWidth={8} />
            <circle cx={-160} cy={4} r={46} fill={it.color} />
            <path d="M -182 -10 h 44 M -182 6 h 44 M -182 22 h 30" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
            <Txt x={50} y={-10} size={40} weight={900}>
              {it.title}
            </Txt>
            <Txt x={50} y={42} size={26} color={C.inkSoft}>
              {it.who}
            </Txt>
          </g>
        );
      })}
      {sep > 0 && <line x1={cx} y1={220} x2={cx} y2={220 + 560 * sep} stroke={C.yellowDeep} strokeWidth={8} strokeDasharray="16 14" />}
      <Pop t={t} at={at(c, 2.3)} x={cx} y={180}>
        <Tag x={0} y={0} text="кто это сказал?" size={36} color={C.yellow} />
      </Pop>
    </g>
  );
};

// ── d05: стоя — колоннада; свиток «Эпиктет» от Рустика; рамка «мировоззрение эпохи»; три практичных темы ──
export const StoaColumns: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const roof = ramp(t, 0.2, 1);
  const scroll = ramp(t, at(c, 0.5), 0.8);
  const frame = ramp(t, at(c, 1), 0.6);
  const prac = at(c, 2);
  return (
    <g>
      <g opacity={1 - ramp(t, prac, 0.6) * 0.88}>
        {[-330, -110, 110, 330].map((dx, i) => (
          <g key={i} transform={`translate(0 ${(1 - pop(t, 0.1 + i * 0.12)) * 300})`}>
            <Column x={cx + dx} y={720} s={0.95} h={340} />
          </g>
        ))}
        <path d={`M ${cx - 440} ${360} L ${cx} ${260 - 60 * roof} L ${cx + 440} 360 Z`} fill={R.marble} stroke={OL} strokeWidth={5} opacity={roof} />
        <rect x={cx - 460} y={720} width={920} height={30} rx={6} fill={R.marbleShade} stroke={OL} strokeWidth={4} />
        <Txt x={cx} y={340} size={44} weight={900} opacity={roof}>
          СТОЯ
        </Txt>
        {scroll > 0 && (
          <g transform={`translate(${cx - 220 + 440 * scroll} 560)`}>
            <Scroll x={0} y={0} s={0.7} open={0.6} />
            <Tag x={0} y={-130} text={scroll < 0.5 ? "Рустик" : "Эпиктет"} size={28} color="#fff" />
          </g>
        )}
        {frame > 0 && <rect x={cx - 480} y={220} width={960} height={560} rx={30} fill="none" stroke={C.inkSoft} strokeWidth={6} strokeDasharray="20 16" opacity={frame} />}
        {frame > 0 && <Tag x={cx} y={800} text="мировоззрение языческого Рима" size={30} color="#fff" />}
      </g>
      {["гнев", "долг", "честность", "время"].map((w, i) => {
        const k = pop(t, prac + 0.3 + i * 0.25);
        if (k <= 0) return null;
        return (
          <g key={w} transform={`translate(${cx - 360 + i * 240} ${480 + wob(t, i, 6)}) scale(${k})`}>
            <circle r={96} fill={[C.coral, R.olive, C.skyDeep, C.yellow][i]} stroke={OL} strokeWidth={6} />
            <Txt x={0} y={14} size={38} weight={900} color={i === 3 ? C.ink : "#fff"}>
              {w}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── d06: дерево благодарности: ветви-учителя, каждая даёт свой плод-качество ──
export const TeachersTree: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    { who: "дед", what: "незлобивость", at: at(c, 1), side: -1, y: 560 },
    { who: "мать", what: "простота", at: at(c, 1.5), side: 1, y: 560 },
    { who: "Рустик", what: "характер, простой слог", at: at(c, 2), side: -1, y: 400 },
    { who: "Аполлоний", what: "твёрдость + мягкость", at: at(c, 3), side: 1, y: 400 },
    { who: "Секст", what: "без гнева", at: at(c, 3.55), side: 0, y: 240 },
  ];
  const trunk = ramp(t, 0.2, 1.2);
  return (
    <g>
      <path d={`M ${cx} 820 L ${cx} ${820 - 600 * trunk}`} stroke="#8a5a2b" strokeWidth={46} strokeLinecap="round" />
      <ellipse cx={cx} cy={820} rx={160} ry={24} fill="#000" opacity={0.08} />
      {items.map((it, i) => {
        const k = ramp(t, it.at - 0.3, 0.6);
        if (k <= 0) return null;
        const ex = cx + it.side * 360;
        const ey = it.y - (it.side === 0 ? 0 : 30);
        const fr = pop(t, it.at);
        return (
          <g key={i}>
            {it.side !== 0 && <path d={`M ${cx} ${it.y + 60} Q ${cx + it.side * 160} ${it.y + 40} ${cx + (ex - cx) * k} ${ey}`} stroke="#8a5a2b" strokeWidth={18} fill="none" strokeLinecap="round" />}
            <g transform={`translate(${ex} ${ey}) scale(${fr})`}>
              <ellipse rx={190} ry={66} fill={R.oliveSoft} stroke={R.olive} strokeWidth={5} />
              <Txt x={0} y={-8} size={34} weight={900}>
                {it.who}
              </Txt>
              <Txt x={0} y={34} size={26} color={C.inkSoft}>
                {it.what}
              </Txt>
            </g>
          </g>
        );
      })}
      <Pop t={t} at={0.5} x={cx} y={130}>
        <Big x={0} y={0} text="от кого — чему" size={52} serif />
      </Pop>
    </g>
  );
};

// ── d07: портрет отца: совещание (разбор всех обстоятельств), меньше лести, долг важнее славы ──
export const ModestRuler: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const meet = ramp(t, 0.2, 0.7);
  const docs = clamp01((t - at(c, 0.3)) / Math.max(0.5, at(c, 0.95) - at(c, 0.3)));
  const flat = ramp(t, at(c, 1), 0.6);
  const duty = ramp(t, at(c, 1.5), 0.6);
  const people = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={meet * (1 - people * 0.7)}>
        <ellipse cx={cx} cy={560} rx={360} ry={110} fill="#c98b4a" stroke={OL} strokeWidth={6} />
        {[-260, -120, 120, 260].map((dx, i) => (
          <Person key={i} x={cx + dx} y={490} s={0.7} color={[R.olive, C.skyDeep, R.terracotta, C.coral][i]} t={t + i} />
        ))}
        <Person x={cx} y={470} s={0.85} color={R.purple} t={t} />
        {Array.from({ length: 6 }).map((_, i) => {
          const k = clamp01(docs * 6 - i);
          return (
            <g key={i} transform={`translate(${cx - 250 + i * 100} ${560 - k * 10}) rotate(${(i - 3) * 6})`} opacity={k}>
              <rect x={-30} y={-22} width={60} height={44} rx={4} fill="#fff" stroke={OL} strokeWidth={3} />
              <Check x={0} y={0} s={18} k={k} />
            </g>
          );
        })}
      </g>
      {flat > 0 && (
        <g opacity={flat * (1 - people * 0.7)}>
          {["слава!", "ура!", "о великий!"].map((w, i) => (
            <g key={w} transform={`translate(${cx - 330 + i * 330} ${260 - flat * 40}) scale(${1 - flat * 0.45})`} opacity={1 - flat * 0.6}>
              <Tag x={0} y={0} text={w} size={34} color="#fff" />
            </g>
          ))}
        </g>
      )}
      {duty > 0 && (
        <g transform={`translate(${cx} 780) scale(${duty})`} opacity={1 - people * 0.6}>
          <Panel x={-380} y={-50} w={760} h={96} r={48} fill={C.yellow} />
          <Txt x={0} y={12} size={38} weight={900}>
            долг важнее славы за него
          </Txt>
        </g>
      )}
      {people > 0 && (
        <g opacity={people}>
          <WaxTablet x={cx} y={300} s={1.1} k={1} text={["1. люди,", "   которые сделали", "   меня лучше"]} />
          <Txt x={cx} y={500} size={30} color={C.inkSoft}>
            а не победы
          </Txt>
        </g>
      )}
    </g>
  );
};
