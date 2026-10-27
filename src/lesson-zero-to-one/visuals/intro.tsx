// Вступление и часть «0 → 1»: сто магазинов, три вопроса, книга, план фильма,
// пишущие машинки и текстовый редактор, глобализация и технологии, вопрос
// о неудобной истине, команда, пузырь 1999 года, четыре урока, «думать самому».
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Bulb, Coin, Dot, Globe, Laptop, OL, Shop, Typewriter, ZeroBook } from "./draw";
import { AX, BigLabel, Card3D, Swords } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ── Крючок: сто одинаковых магазинов и одна новая вещь ──
export const HookShops: React.FC<VP> = (c) => {
  const { t } = c;
  const grow = ramp(t, 0.1, at(c, 0.75) - 0.1);
  const dim = ramp(t, at(c, 1.05), 0.8);
  const star = pop(t, at(c, 1.2));
  const n = Math.round(grow * 100);
  return (
    <g>
      <g opacity={1 - 0.65 * dim}>
        {Array.from({ length: n }).map((_, i) => {
          const r = Math.floor(i / 10);
          const k = i % 10;
          return <Shop key={i} x={150 + k * 102} y={190 + r * 70} s={0.42} awning={[C.coral, Z.teal, C.skyDeep][(r + k) % 3]} />;
        })}
      </g>
      <Pop t={t} at={at(c, 0.55)} x={640} y={110}>
        <Tag x={0} y={0} text={`магазинов: ${Math.max(1, n)}`} size={40} color={C.white} />
      </Pop>
      {star > 0 && (
        <g transform={`translate(640 ${520}) scale(${star})`}>
          <circle r={250} fill={C.yellow} opacity={0.35 + 0.1 * Math.sin(t * 3)} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 + t * 0.3;
            return <line key={i} x1={Math.cos(a) * 200} y1={Math.sin(a) * 200} x2={Math.cos(a) * 270} y2={Math.sin(a) * 270} stroke={C.yellowDeep} strokeWidth={12} strokeLinecap="round" />;
          })}
          <Bulb x={0} y={60} s={1.5} t={t} />
          <Tag x={0} y={250} text="такого ещё не было" size={42} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Три вопроса фильма ──
export const Teaser: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [0, 1, 2].map((i) => pop(t, at(c, i) - 0.1));
  return (
    <g>
      {items.map((k, i) => (
        <Card3D key={i} k={k} x={cx - 380 + i * 380} y={470} w={340} h={460} color={[Z.tealSoft, "#ffe7c2", "#e6e1ff"][i]} active={t >= at(c, i) - 0.1 && (i === 2 || t < at(c, i + 1) - 0.1)}>
          {i === 0 && (
            <g>
              <Swords x={0} y={-60} s={1.1} t={t} />
              <rect x={-90} y={60} width={180} height={24} rx={12} fill={Z.greySoft} />
              <rect x={-90} y={60} width={180 * (1 - ramp(t, at(c, 0.3), 1.6) * 0.9)} height={24} rx={12} fill={C.green} />
              <Txt x={0} y={150} size={34}>
                прибыль?
              </Txt>
            </g>
          )}
          {i === 1 && (
            <g>
              <circle cx={-40} cy={-40} r={110} fill="none" stroke={Z.grey} strokeWidth={6} strokeDasharray="14 12" />
              <circle cx={70} cy={20} r={34 + 6 * Math.sin(t * 3)} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <path d="M 70 -14 L 70 -80 L 110 -66 L 70 -52" fill={C.coral} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={150} size={34}>
                крошечный рынок?
              </Txt>
            </g>
          )}
          {i === 2 && (
            <g>
              <rect x={-80} y={-110} width={160} height={130} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
              <path d="M -80 -70 L 80 -70" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-10} size={60} weight={900} color={C.coral}>
                ?
              </Txt>
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={-60 + k * 60} cy={70} r={8} fill={Z.grey} opacity={0.4 + 0.6 * ((Math.floor(t * 2) + k) % 3 === 0 ? 1 : 0)} />
              ))}
              <Txt x={0} y={150} size={34}>
                продаёт себя сам?
              </Txt>
            </g>
          )}
        </Card3D>
      ))}
    </g>
  );
};

// ── Книга и автор (собственный рисунок книги, не обложка издания) ──
export const BookIntro: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const facts = ramp(t, at(c, 1), 0.5);
  const noRecipe = ramp(t, at(c, 2.1), 0.6);
  return (
    <g>
      <Pop t={t} at={0} x={cx - 270} y={470}>
        <ZeroBook x={0} y={0} s={0.95} t={t} />
      </Pop>
      <g opacity={ramp(t, 0.2, 0.5)}>
        <Txt x={cx + 170} y={250} size={58} weight={900}>
          {"«От нуля\nк единице»"}
        </Txt>
        <Txt x={cx + 170} y={420} size={34} color={C.inkSoft}>
          {"Питер Тиль,\nБлейк Мастерс"}
        </Txt>
      </g>
      <g opacity={facts * (1 - noRecipe * 0.7)}>
        {["PayPal", "Palantir", "Facebook"].map((s, i) => (
          <Pop key={s} t={t} at={at(c, 1.05 + i * 0.12)} x={cx + 60 + i * 120} y={560 + (i % 2) * 70}>
            <Tag x={0} y={0} text={s} size={30} color={[Z.tealSoft, "#ffe7c2", "#dfe8ff"][i]} />
          </Pop>
        ))}
        <Pop t={t} at={at(c, 1.55)} x={cx + 170} y={760}>
          <Tag x={0} y={0} text="курс в Стэнфорде, 2012" size={32} color={C.yellow} />
        </Pop>
      </g>
      {noRecipe > 0 && (
        <g transform={`translate(${cx + 170} 650) rotate(-6) scale(${0.6 + 0.4 * noRecipe})`} opacity={noRecipe}>
          <rect x={-230} y={-90} width={460} height={180} rx={20} fill="#fff" stroke={C.red} strokeWidth={8} />
          <Txt x={0} y={-12} size={44} weight={900} color={C.red}>
            ГОТОВОГО
          </Txt>
          <Txt x={0} y={46} size={44} weight={900} color={C.red}>
            РЕЦЕПТА НЕТ
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── Ведущий и план фильма ──
export const Roadmap: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const rows: [string, string][] = [
    ["копировать", "создавать"],
    ["воевать", "быть уникальным"],
    ["удача", "план"],
  ];
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={200}>
        <text x={0} y={0} fontFamily="Rubik, Nunito" fontWeight={900} fontSize={110} textAnchor="middle" fill={C.ink}>
          Bana<tspan fill={C.yellowDeep}>Mind</tspan>
        </text>
        <Txt x={0} y={64} size={36} color={C.inkSoft}>
          Большие идеи. Простыми словами.
        </Txt>
      </Pop>
      {rows.map(([a, b], i) => {
        const k = ramp(t, at(c, 1.15 + i * 0.25), 0.5);
        const y = 400 + i * 140;
        if (k <= 0) return null;
        return (
          <g key={i} opacity={k} transform={`translate(${(1 - k) * 80} 0)`}>
            <Panel x={cx - 520} y={y - 50} w={330} h={96} r={48} fill={Z.greySoft} />
            <Txt x={cx - 355} y={y + 14} size={40} color={C.inkSoft}>
              {a}
            </Txt>
            <Arrow x1={cx - 170} y1={y} x2={cx - 30} y2={y} k={ramp(t, at(c, 1.25 + i * 0.25), 0.5)} color={C.coral} w={12} />
            <Panel x={cx - 10} y={y - 50} w={460} h={96} r={48} fill={C.yellow} />
            <Txt x={cx + 220} y={y + 14} size={42}>
              {b}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── 1 → N и 0 → 1: сто пишущих машинок и текстовый редактор ──
export const ZeroOne: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const horiz = ramp(t, at(c, 2), 0.6);
  const copies = ramp(t, at(c, 3), at(c, 3.9) - at(c, 3));
  const vert = ramp(t, at(c, 4), 0.6);
  const editor = pop(t, at(c, 5.1));
  const n = 1 + Math.round(copies * 11);
  return (
    <g>
      {/* вступительные слова: одно событие — один раз */}
      <g opacity={1 - horiz}>
        <Pop t={t} at={0.2} x={cx} y={300}>
          <Txt x={0} y={0} size={64} weight={900}>
            Каждое событие
          </Txt>
          <Txt x={0} y={80} size={64} weight={900} color={C.coral}>
            случается однажды
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 1)} x={cx} y={560}>
          <Tag x={0} y={0} text="копия ≠ урок" size={48} color={C.yellow} />
        </Pop>
      </g>
      {horiz > 0 && (
        <g opacity={horiz}>
          {/* горизонтальный прогресс */}
          <Panel x={cx - 560} y={140} w={1120} h={300} fill="#ffffffcc" />
          <BigLabel x={cx - 470} y={230} text="1 → N" color={C.inkSoft} k={horiz} />
          <Txt x={cx - 470} y={290} size={28} color={C.inkSoft}>
            горизонтальный
          </Txt>
          {Array.from({ length: n }).map((_, i) => (
            <Typewriter key={i} x={cx - 300 + i * 74} y={400} s={0.42} t={t + i} />
          ))}
          <Arrow x1={cx - 330} y1={170} x2={cx + 520} y2={170} k={copies} color={Z.grey} w={8} />
          {/* вертикальный прогресс */}
          <g opacity={vert}>
            <Panel x={cx - 560} y={470} w={1120} h={390} fill="#ffffffee" />
            <BigLabel x={cx - 470} y={570} text="0 → 1" color={C.coral} k={vert} />
            <Txt x={cx - 470} y={630} size={28} color={C.inkSoft}>
              вертикальный
            </Txt>
            <Typewriter x={cx - 120} y={800} s={0.7} t={t} />
            <Arrow x1={cx + 10} y1={780} x2={cx + 140} y2={620} k={ramp(t, at(c, 5), 0.6)} color={C.coral} w={10} />
            {editor > 0 && (
              <g transform={`translate(${cx + 300} 800) scale(${editor})`}>
                <circle cx={0} cy={-110} r={170} fill={C.yellow} opacity={0.3} />
                <Laptop x={0} y={0} s={1.05} t={t - at(c, 5.1)} />
                <Txt x={0} y={60} size={30} weight={900}>
                  текстовый редактор
                </Txt>
              </g>
            )}
          </g>
        </g>
      )}
    </g>
  );
};

// ── Глобализация (копирование) и технология (новое) ──
export const GlobeTech: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const copyK = ramp(t, 0.3, at(c, 0.9));
  const tech = pop(t, at(c, 1));
  const verdict = ramp(t, at(c, 2.4), 0.6);
  const load = ramp(t, at(c, 3), at(c, 3.9) - at(c, 3));
  const note = pop(t, at(c, 4));
  const spots = [
    [-150, -40],
    [60, -70],
    [130, 40],
    [-60, 70],
    [-170, 30],
  ];
  return (
    <g>
      <g transform={`translate(${cx - 270} 420)`}>
        <Globe x={0} y={0} s={1.5} t={t} />
        {spots.map(([sx, sy], i) => {
          const k = clamp01(copyK * 5 - i);
          return k > 0 ? <Pop key={i} t={t} at={0.3 + i * 0.25} x={sx} y={sy}><rect x={-18} y={-30} width={36} height={30} fill={Z.grey} stroke={OL} strokeWidth={3} /><path d="M -20 -30 L 0 -46 L 20 -30 Z" fill={C.coral} stroke={OL} strokeWidth={3} /></Pop> : null;
        })}
        <Txt x={0} y={240} size={40} weight={900} color={C.inkSoft}>
          глобализация
        </Txt>
        <Txt x={0} y={290} size={30} color={C.inkSoft}>
          повторить в другом месте
        </Txt>
      </g>
      {tech > 0 && (
        <g transform={`translate(${cx + 280} 420) scale(${tech})`}>
          <Bulb x={0} y={70} s={1.4} t={t} />
          <Txt x={0} y={240} size={40} weight={900} color={C.coral}>
            технология
          </Txt>
          <Txt x={0} y={290} size={30} color={C.inkSoft}>
            новый, лучший способ
          </Txt>
        </g>
      )}
      {verdict > 0 && (
        <g opacity={verdict}>
          <Txt x={cx} y={190} size={44} weight={900}>
            Что важнее для будущего?
          </Txt>
          <Check x={cx + 400} y={180} s={50} k={verdict} />
        </g>
      )}
      {load > 0 && (
        <g transform={`translate(${cx - 270} 420)`} opacity={1 - note * 0.3}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-120 + i * 120} ${-190 - 30 * load} l 0 ${-40 * load}`} stroke={C.red} strokeWidth={10} strokeLinecap="round" opacity={load} />
          ))}
          <Tag x={0} y={-270 - 40 * load} text="ресурсы ограничены" size={30} color="#ffd9d6" />
        </g>
      )}
      <Pop t={t} at={at(c, 4.05)} x={cx} y={780}>
        <Tag x={0} y={0} text="взгляд автора, 2014" size={36} color={C.white} />
      </Pop>
    </g>
  );
};

// ── Вопрос о неудобной истине ──
export const Contrarian: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const card = pop(t, at(c, 1) - 0.1);
  const tpl = ramp(t, at(c, 3), 0.6);
  const flip = ramp(t, at(c, 3.55), 0.5);
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={170}>
        <Tag x={0} y={0} text="вопрос на собеседовании" size={36} color={C.white} />
      </Pop>
      {card > 0 && (
        <g transform={`translate(${cx} 370) scale(${card})`} opacity={1 - tpl * 0.55}>
          <Panel x={-520} y={-130} w={1040} h={260} fill="#fff" stroke={Z.teal} />
          <Txt x={0} y={-40} size={44} weight={900}>
            «Назовите важную истину,
          </Txt>
          <Txt x={0} y={20} size={44} weight={900}>
            с которой большинство
          </Txt>
          <Txt x={0} y={80} size={44} weight={900}>
            вокруг вас не согласно»
          </Txt>
        </g>
      )}
      <g opacity={ramp(t, at(c, 2), 0.5) * (1 - tpl)}>
        <Tag x={cx - 250} y={600} text="думать самому" size={36} color={Z.tealSoft} />
        <Tag x={cx + 250} y={600} text="смелость" size={36} color="#ffe7c2" />
      </g>
      {tpl > 0 && (
        <g opacity={tpl}>
          <Panel x={cx - 560} y={540} w={1120} h={250} fill="#ffffffee" />
          {Array.from({ length: 9 }).map((_, i) => (
            <Dot key={i} x={cx - 470 + (i % 3) * 70} y={640 + Math.floor(i / 3) * 52} s={0.7} color={Z.grey} />
          ))}
          <Txt x={cx - 70} y={620} size={40} anchor="start">
            Большинство: «X»
          </Txt>
          <g transform={`translate(${cx + 170} 720) scale(${1 + 0.1 * Math.sin(t * 4) * flip})`}>
            <Txt x={0} y={14} size={44} weight={900} color={C.coral}>
              а верно обратное
            </Txt>
          </g>
          <Dot x={cx - 470 + 240} y={690} s={0.9} color={C.coral} ring={C.yellowDeep} />
        </g>
      )}
    </g>
  );
};

// ── Почему стартап: большая организация, одиночка, команда с миссией ──
export const StartupTeam: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const cols = [cx - 380, cx, cx + 380];
  const big = pop(t, at(c, 1) - 0.1);
  const lone = pop(t, at(c, 2) - 0.1);
  const team = pop(t, at(c, 3) - 0.1);
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={170}>
        <Txt x={0} y={0} size={52} weight={900}>
          Где рождается новое?
        </Txt>
      </Pop>
      {big > 0 && (
        <g transform={`translate(${cols[0]} 560) scale(${big})`}>
          <rect x={-110} y={-300} width={220} height={300} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={-86 + (i % 3) * 64} y={-276 + Math.floor(i / 3) * 66} width={44} height={40} fill="#fff" stroke={OL} strokeWidth={3} />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={70 + i * 8} y={-330 - i * 18} width={70} height={40} rx={4} fill="#fff4d6" stroke={OL} strokeWidth={3} transform={`rotate(${-8 + i * 6})`} />
          ))}
          <Txt x={0} y={60} size={32} weight={900}>
            большая организация
          </Txt>
          <Cross x={0} y={-150} s={150} k={ramp(t, at(c, 1.6), 0.5)} />
        </g>
      )}
      {lone > 0 && (
        <g transform={`translate(${cols[1]} 560) scale(${lone})`}>
          <Dot x={0} y={-60} s={2} color={Z.purple} />
          <rect x={-40} y={-10} width={80} height={56} rx={6} fill={C.white} stroke={OL} strokeWidth={4} transform="rotate(-8)" />
          <Txt x={0} y={100} size={32} weight={900}>
            одиночка
          </Txt>
          <Txt x={0} y={-180} size={30} color={C.inkSoft}>
            книга — да, отрасль — нет
          </Txt>
        </g>
      )}
      {team > 0 && (
        <g transform={`translate(${cols[2]} 560) scale(${team})`}>
          <circle cx={0} cy={-90} r={150} fill={C.yellow} opacity={0.3 + 0.1 * Math.sin(t * 3)} />
          <path d="M 0 -140 L 0 -250 L 70 -228 L 0 -206" fill={C.coral} stroke={OL} strokeWidth={4} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2 + t * 0.4;
            return <Dot key={i} x={Math.cos(a) * 110} y={-80 + Math.sin(a) * 60} s={0.9} color={[Z.teal, C.coral, Z.purple][i % 3]} />;
          })}
          <Txt x={0} y={60} size={32} weight={900}>
            команда с миссией
          </Txt>
          <Check x={0} y={120} s={44} k={ramp(t, at(c, 3.5), 0.5)} />
        </g>
      )}
    </g>
  );
};

// ── Пузырь доткомов ──
export const BubbleChart: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const x0 = cx - 480;
  const y0 = 760;
  const draw = ramp(t, 0.3, at(c, 1.7) - 0.3);
  const pay = ramp(t, at(c, 2), 0.6);
  const popAt = at(c, 3.6);
  const burst = ramp(t, popAt, 0.35);
  const pts = Array.from({ length: 40 }).map((_, i) => {
    const u = i / 39;
    const v = u < 0.85 ? Math.pow(u / 0.85, 3) : 1 - (u - 0.85) * 4;
    return [x0 + u * 900, y0 - 40 - v * 420] as const;
  });
  const shown = Math.max(2, Math.round(draw * pts.length * (burst > 0 ? 1 : 0.87)));
  const path = pts.slice(0, shown).map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const bR = 40 + 120 * draw;
  return (
    <g>
      <line x1={x0} y1={y0} x2={x0 + 940} y2={y0} stroke={C.ink} strokeWidth={5} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - 520} stroke={C.ink} strokeWidth={5} />
      <Txt x={x0 + 120} y={y0 + 50} size={30} color={C.inkSoft}>
        сентябрь 1998
      </Txt>
      <Txt x={x0 + 790} y={y0 + 50} size={30} color={C.inkSoft}>
        март 2000
      </Txt>
      <path d={path} stroke={C.coral} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {burst < 1 && (
        <g transform={`translate(${x0 + 690} ${y0 - 400}) scale(${1 + burst * 0.4})`} opacity={1 - burst}>
          <circle r={bR} fill="#bfe6fb" fillOpacity={0.45} stroke={C.skyDeep} strokeWidth={5} />
          <path d={`M ${-bR * 0.5} ${-bR * 0.4} A ${bR * 0.6} ${bR * 0.6} 0 0 1 ${-bR * 0.1} ${-bR * 0.7}`} stroke="#fff" strokeWidth={8} fill="none" />
          <Txt x={0} y={16} size={44} weight={900} color={C.skyDeep}>
            .com
          </Txt>
        </g>
      )}
      {burst > 0 &&
        Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          const r = 60 + 200 * burst;
          return <circle key={i} cx={x0 + 690 + Math.cos(a) * r} cy={y0 - 400 + Math.sin(a) * r} r={14 * (1 - burst * 0.7)} fill={C.skyDeep} opacity={1 - burst * 0.6} />;
        })}
      {burst > 0.3 && (
        <Pop t={t} at={popAt + 0.15} x={x0 + 690} y={y0 - 400}>
          <Txt x={0} y={20} size={80} weight={900} color={C.red}>
            ПУФ!
          </Txt>
        </Pop>
      )}
      <Pop t={t} at={at(c, 1.4)} x={x0 + 240} y={y0 - 470}>
        <Tag x={0} y={0} text="≈ 18 месяцев" size={36} color={C.white} />
      </Pop>
      {pay > 0 && burst < 1 && (
        <g opacity={pay * (1 - burst)} transform={`translate(${x0 + 260} ${y0 - 200})`}>
          <Dot x={-70} y={0} s={1.2} color={Z.teal} />
          <Dot x={70} y={0} s={1.2} color={Z.purple} />
          <Coin x={-70} y={-90 - 10 * Math.sin(t * 4)} s={0.9} label="10" />
          <Coin x={70} y={-90 - 10 * Math.sin(t * 4 + 1)} s={0.9} label="10" />
          <Txt x={0} y={80} size={28} color={C.inkSoft}>
            за вход + за друга
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── Четыре урока после краха и их противоположности ──
const OLD = ["маленькие шаги", "без плана", "улучшай чужое", "продукт важнее продаж"];
const NEW = ["смелость лучше банальности", "плохой план лучше никакого", "конкуренция убивает прибыль", "продажи важны как продукт"];
export const LessonsFlip: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const doubt = pop(t, at(c, 2));
  return (
    <g>
      {OLD.map((o, i) => {
        const appear = i === 0 ? at(c, 0.4) : at(c, 1) + (i - 1) * ((at(c, 1.95) - at(c, 1)) / 3);
        const k = pop(t, appear);
        const flipAt = at(c, 3) + i * ((at(c, 3.95) - at(c, 3)) / 4);
        const f = ramp(t, flipAt, 0.5);
        const sx = Math.abs(Math.cos(f * Math.PI));
        const front = f < 0.5;
        const x = cx - 270 + (i % 2) * 540;
        const y = 300 + Math.floor(i / 2) * 260;
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k * sx} ${k})`}>
            <rect x={-260} y={-100} width={520} height={200} rx={30} fill={front ? Z.greySoft : C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-30} size={30} color={C.inkSoft} weight={900}>
              {front ? `урок ${i + 1}` : `наоборот ${i + 1}`}
            </Txt>
            <Txt x={0} y={30} size={front ? 38 : 30} weight={900} color={front ? C.inkSoft : C.ink}>
              {front ? o : NEW[i]}
            </Txt>
          </g>
        );
      })}
      {doubt > 0 && t < at(c, 3) && (
        <g transform={`translate(${cx} 830) scale(${doubt})`}>
          <Tag x={0} y={0} text="а может, наоборот?" size={44} color={C.coral} textColor={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Думать самому: толпа, «анти-толпа» и независимый ──
export const ThinkSelf: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, 0.2, 0.6);
  const self = pop(t, at(c, 0.6));
  return (
    <g opacity={k}>
      {Array.from({ length: 12 }).map((_, i) => {
        const x = cx - 500 + ((i * 70 + t * 60) % 420);
        return <Dot key={i} x={x} y={300 + (i % 3) * 60} s={0.9} color={Z.grey} />;
      })}
      <Arrow x1={cx - 500} y1={460} x2={cx - 120} y2={460} k={1} color={Z.grey} w={8} />
      <Txt x={cx - 310} y={520} size={32} color={C.inkSoft}>
        толпа
      </Txt>
      <Dot x={cx + 180 - ((t * 60) % 200)} y={360} s={1.1} color={Z.purple} />
      <Arrow x1={cx + 260} y1={460} x2={cx + 20} y2={460} k={1} color={Z.purple} w={8} />
      <Txt x={cx + 140} y={520} size={32} color={C.inkSoft}>
        против толпы
      </Txt>
      {self > 0 && (
        <g transform={`translate(${cx + 400} 420) scale(${self})`}>
          <circle cy={-40} r={120} fill={C.yellow} opacity={0.3} />
          <Dot x={0} y={0} s={1.6} color={C.coral} />
          <Bulb x={0} y={-90} s={0.5} t={t} />
          <Txt x={0} y={110} size={36} weight={900}>
            думает сам
          </Txt>
          <Check x={0} y={170} s={40} k={ramp(t, at(c, 0.8), 0.5)} />
        </g>
      )}
      <Pop t={t} at={at(c, 1)} x={cx} y={720}>
        <Tag x={0} y={0} text="не правила, а вопросы" size={44} color={C.white} />
      </Pop>
      <g transform={`translate(${cx - 380} 720) rotate(${wob(t, 1, 6)})`} opacity={ramp(t, at(c, 1.1), 0.4)}>
        <Txt x={0} y={20} size={80} weight={900} color={C.coral}>
          ?
        </Txt>
      </g>
      <g transform={`translate(${cx + 380} 720) rotate(${wob(t, 2, 6)})`} opacity={ramp(t, at(c, 1.2), 0.4)}>
        <Txt x={0} y={20} size={80} weight={900} color={Z.teal}>
          ?
        </Txt>
      </g>
    </g>
  );
};
