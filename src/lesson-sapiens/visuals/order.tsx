// Часть «Порядок»: воображаемый порядок (два документа), порядок в желаниях,
// письмо и табличка Кушима, архив острова, иерархии и порочный круг, перемены.
import React from "react";
import { C } from "../theme";
import { Island, Person, Scroll, Sea, Stage, Tablet } from "./island";
import { Arrow, Panel, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── o01: два документа — Хаммурапи и Декларация ──
export const TwoScrolls: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const a = pop(t, at(c, 1));
  const b = pop(t, at(c, 2));
  const ranks = ramp(t, at(c, 3), 0.8);
  const eq = ramp(t, at(c, 3.6), 0.8);
  const agree = pop(t, at(c, 4));
  const keep = ramp(t, at(c, 5), 0.6);
  return (
    <Stage host={c.p.host}>
      {a > 0 && (
        <g transform={`translate(330 420) scale(${a})`}>
          <Tablet x={0} y={0} s={1.5} k={ramp(t, at(c, 1.2), 1.5)} />
          <Txt x={0} y={-200} size={36} color={C.ink}>
            Законы Хаммурапи
          </Txt>
          <Txt x={0} y={210} size={30} color={C.inkSoft}>
            около 1776 года до н. э.
          </Txt>
        </g>
      )}
      {b > 0 && (
        <g transform={`translate(950 420) scale(${b})`}>
          <Scroll x={0} y={0} w={280} h={300} rows={5} k={ramp(t, at(c, 2.2), 1.5)} />
          <Txt x={0} y={-200} size={36} color={C.ink}>
            Декларация независимости
          </Txt>
          <Txt x={0} y={210} size={30} color={C.inkSoft}>
            1776 год
          </Txt>
        </g>
      )}
      {ranks > 0 && (
        <g opacity={ranks * (1 - agree)}>
          {["знать", "простонародье", "рабы"].map((r, i) => (
            <g key={r} transform="translate(330 690)">
              {i === 0 && <Tag x={-150} y={0} text={r} color={C.yellow} size={28} />}
              {i === 1 && <Tag x={40} y={60} text={r} color={C.sand} size={28} />}
              {i === 2 && <Tag x={-120} y={120} text={r} color="#d9c7b0" size={28} />}
            </g>
          ))}
        </g>
      )}
      {eq > 0 && (
        <g opacity={eq * (1 - agree)} transform="translate(950 700)">
          {[-120, -40, 40, 120].map((x, i) => (
            <Person key={x} x={x} y={40} s={0.8} i={i + 1} t={t} />
          ))}
          <Txt x={0} y={100} size={32} color={C.skyDeep}>
            «все равны»
          </Txt>
        </g>
      )}
      {agree > 0 && (
        <g transform={`translate(640 700) scale(${agree})`} opacity={1 - keep}>
          <Panel x={-470} y={-60} w={940} h={110} fill={C.white} stroke={C.coral} />
          <Txt x={0} y={12} size={34} color={C.ink}>
            по Харари: не законы природы, а договорённости
          </Txt>
        </g>
      )}
      {keep > 0 && (
        <g opacity={keep}>
          <Panel x={240} y={640} w={800} h={110} fill={C.ink} />
          <Txt x={640} y={708} size={36} color={C.yellow}>
            общие правила нужно поддерживать
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── o02: желания тоже подсказывает общая история ──
export const Desires: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const old = pop(t, at(c, 1));
  const now = pop(t, at(c, 1.5));
  const story = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <Person x={640} y={760} s={1.6} i={4} t={t} look={0} />
      {old > 0 && (
        <g transform={`translate(300 360) scale(${old})`}>
          <ellipse rx={230} ry={150} fill={C.white} />
          <path d="M -120 70 L 0 -90 L 120 70 Z" fill={C.sandDeep} />
          <path d="M -60 70 L 0 -10 L 60 70 Z" fill={C.sand} />
          <Txt x={0} y={124} size={30} color={C.inkSoft}>
            древний правитель
          </Txt>
        </g>
      )}
      {now > 0 && (
        <g transform={`translate(980 360) scale(${now})`}>
          <ellipse rx={230} ry={150} fill={C.white} />
          <path d="M -100 -10 L -30 -60 L 40 -10 L 40 60 L -100 60 Z" fill={C.coral} />
          <g transform={`translate(80 -30) rotate(${-15 + wob(t, 1, 3)})`}>
            <path d="M -50 0 L 50 0 L 60 8 L -40 8 Z M -10 0 L 10 -30 L 20 0 Z" fill={C.skyDeep} />
          </g>
          <Txt x={0} y={124} size={30} color={C.inkSoft}>
            современный человек
          </Txt>
        </g>
      )}
      {story > 0 && (
        <g opacity={story}>
          <Arrow x1={420} y1={520} x2={590} y2={600} k={story} color={C.yellowDeep} w={8} />
          <Arrow x1={860} y1={520} x2={690} y2={600} k={story} color={C.yellowDeep} w={8} />
          <Tag x={640} y={170} text="мечты подсказывает общая история" color={C.yellow} size={36} />
        </g>
      )}
    </Stage>
  );
};

// ── o03: письмо — учёт на глиняной табличке ──
export const TabletScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const brain = ramp(t, at(c, 1), 0.6);
  const tab = pop(t, at(c, 2));
  const acc = pop(t, at(c, 3));
  const name = pop(t, at(c, 4));
  const role = ramp(t, at(c, 5), 0.5);
  const nums = ["налоги", "долги", "зерно"];
  return (
    <Stage host={c.p.host}>
      {brain > 0 && (
        <g opacity={brain * (1 - tab * 0.6)}>
          <ellipse cx={300} cy={330} rx={170} ry={130} fill="#f5b5c0" />
          <path d="M 180 330 Q 240 260 300 330 Q 360 400 420 330" stroke="#d98a99" strokeWidth={8} fill="none" />
          {nums.map((n, i) => (
            <g key={n} transform={`translate(${200 + i * 100 + wob(t * 3, i, 10)} ${180 - i * 10})`}>
              <Txt x={0} y={0} size={30} color={C.red}>
                {n}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {tab > 0 && (
        <g transform={`translate(780 420) scale(${tab})`}>
          <Tablet x={0} y={0} s={1.9} k={ramp(t, at(c, 2.2), 2)} />
          <Txt x={0} y={-230} size={34} color={C.ink}>
            шумеры, больше 5000 лет назад
          </Txt>
        </g>
      )}
      {acc > 0 && (
        <g transform={`translate(300 620) scale(${acc})`}>
          <Tag x={0} y={0} text="первые тексты — учёт" color={C.yellow} size={36} />
        </g>
      )}
      {name > 0 && (
        <g transform={`translate(780 760) scale(${name})`}>
          <Panel x={-260} y={-60} w={520} h={110} fill={C.white} stroke={C.clayDark} />
          <Txt x={0} y={14} size={44} color={C.clayDark}>
            «Кушим»
          </Txt>
        </g>
      )}
      {role > 0 && (
        <g opacity={role}>
          <Txt x={300} y={760} size={30} color={C.inkSoft}>
            имя? или должность?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// шкаф с ящиками
const Cabinet: React.FC<{ x: number; y: number; k: number; t: number; open: number }> = ({ x, y, k, open }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-170} y={-260} width={340} height={300} rx={14} fill={C.wood} />
    {[0, 1, 2].map((r) =>
      [0, 1].map((col) => {
        const o = r === 1 && col === 0 ? open * 50 : 0;
        return (
          <g key={`${r}-${col}`} transform={`translate(${-150 + col * 160} ${-240 + r * 92 + o * 0.2})`}>
            <rect x={0} y={0} width={140} height={78} rx={8} fill="#c48a4f" transform={`translate(${o * 0} ${0})`} />
            <rect x={50} y={34} width={40} height={10} rx={5} fill={C.woodDark} />
            {o > 0 && <rect x={10} y={78} width={120} height={o} fill={C.clay} />}
          </g>
        );
      }),
    )}
  </g>
);

// ── o04: архив острова ──
export const Archive: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const few = ramp(t, 0.2, 0.6);
  const many = ramp(t, at(c, 1), 1.2);
  const cab = pop(t, at(c, 1.3));
  const harder = pop(t, at(c, 2));
  const boxes = ramp(t, at(c, 3), 1);
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={640} />
      <Island x={420} y={690} w={700} t={t} palms={false} />
      {Array.from({ length: Math.round(4 + many * 14) }).map((_, i) => (
        <Person key={i} x={170 + (i % 9) * 56} y={660 - Math.floor(i / 9) * 30} s={0.6} i={i} t={t} />
      ))}
      {few > 0 && many < 0.5 && (
        <g opacity={few * (1 - many * 2)}>
          <Tag x={420} y={420} text="все помнят, кто сколько должен" color={C.white} size={32} />
        </g>
      )}
      {cab > 0 && <Cabinet x={1000} y={620} k={cab} t={t} open={boxes} />}
      {[0, 1, 2].map((i) => {
        const k = ramp(t, at(c, 1.5 + i * 0.25), 0.5);
        return k > 0 ? <Tag key={i} x={420} y={240 + i * 70} text={["кто записывает?", "где хранится?", "как найти?"][i]} color={C.yellow} size={32} /> : null;
      })}
      {harder > 0 && (
        <g transform={`translate(940 210) scale(${harder})`}>
          <Panel x={-300} y={-60} w={600} h={110} fill={C.white} stroke={C.skyDeep} />
          <Txt x={0} y={12} size={30} color={C.ink}>
            хранить и искать — сложнее знаков
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── o05: иерархия и порочный круг ──
export const Hierarchy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pyr = ramp(t, at(c, 1), 0.8);
  const natural = pop(t, at(c, 2));
  const cycle = ramp(t, at(c, 3), 1.2);
  const note = pop(t, at(c, 4));
  const tiers = [
    { w: 220, y: 300, c: C.yellow },
    { w: 380, y: 400, c: C.sand },
    { w: 540, y: 500, c: "#d9c7b0" },
  ];
  return (
    <Stage host={c.p.host}>
      <g opacity={pyr * (1 - cycle * 0.75)} transform="translate(-140 -170) scale(1.45)">
        {tiers.map((ti, i) => (
          <g key={i} transform={`translate(330 ${ti.y + (1 - clamp01(pyr * 3 - i)) * 40})`} opacity={clamp01(pyr * 3 - i)}>
            <rect x={-ti.w / 2} y={-44} width={ti.w} height={88} rx={14} fill={ti.c} />
            {Array.from({ length: i + 1 }).map((_, k) => (
              <Person key={k} x={-((i + 1) * 60) / 2 + 30 + k * 60} y={30} s={0.5} i={i * 3 + k} t={t} />
            ))}
          </g>
        ))}
      </g>
      {natural > 0 && (
        <g transform={`translate(330 640) scale(${natural})`} opacity={1 - cycle * 0.75}>
          <Tag x={0} y={0} text="«так устроено природой»?" color={C.white} size={32} />
        </g>
      )}
      {cycle > 0 && (
        <g transform="translate(870 450)" opacity={cycle}>
          <circle r={210} fill="none" stroke={C.coral} strokeWidth={10} strokeDasharray={`${cycle * 1320} 2000`} transform={`rotate(${-90 + t * 8})`} />
          {[
            { a: -90, text: "нет образования" },
            { a: 30, text: "бедность" },
            { a: 150, text: "«значит, хуже»" },
          ].map((p, i) => (
            <g key={i} transform={`translate(${Math.cos((p.a * Math.PI) / 180) * 210} ${Math.sin((p.a * Math.PI) / 180) * 210})`} opacity={clamp01(cycle * 3 - i)}>
              <Tag x={0} y={0} text={p.text} color={C.white} size={30} />
            </g>
          ))}
          <Txt x={0} y={12} size={36} color={C.coral}>
            порочный круг
          </Txt>
        </g>
      )}
      {note > 0 && (
        <g transform={`translate(640 800) scale(${note})`}>
          <Panel x={-500} y={-55} w={1000} h={100} fill={C.ink} />
          <Txt x={0} y={14} size={34} color={C.yellow}>
            объяснить — не значит оправдать
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── o06: весы перемен (без изображения сцен насилия) ──
export const Balance: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const tilt0 = 18;
  const change = ramp(t, at(c, 2), 2);
  const tilt = tilt0 * (1 - change * 0.85) + wob(t, 1, 1);
  const theories = ramp(t, at(c, 1), 0.6);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 520)">
        <rect x={-14} y={-20} width={28} height={260} fill={C.inkSoft} />
        <rect x={-120} y={230} width={240} height={30} rx={12} fill={C.inkSoft} />
        <g transform={`rotate(${tilt})`}>
          <rect x={-380} y={-30} width={760} height={18} rx={9} fill={C.ink} />
          <g transform="translate(-340 -20)">
            <path d="M -90 120 L 90 120 L 60 160 L -60 160 Z" fill={C.skyDeep} />
            <line x1={-80} y1={120} x2={0} y2={0} stroke={C.ink} strokeWidth={3} />
            <line x1={80} y1={120} x2={0} y2={0} stroke={C.ink} strokeWidth={3} />
          </g>
          <g transform="translate(340 -20)">
            <path d="M -90 120 L 90 120 L 60 160 L -60 160 Z" fill={C.coral} />
            <line x1={-80} y1={120} x2={0} y2={0} stroke={C.ink} strokeWidth={3} />
            <line x1={80} y1={120} x2={0} y2={0} stroke={C.ink} strokeWidth={3} />
          </g>
        </g>
      </g>
      <Txt x={640} y={190} size={40} color={C.ink}>
        права и власть в обществе
      </Txt>
      {theories > 0 && (
        <g opacity={theories * (1 - change)}>
          {["теория 1?", "теория 2?", "теория 3?"].map((s, i) => (
            <Tag key={s} x={300 + i * 340} y={300} text={s} color="#f3edff" size={30} />
          ))}
        </g>
      )}
      {change > 0 && (
        <g opacity={change}>
          <Tag x={640} y={300} text="огромные перемены последних ста лет" color={C.yellow} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── o07: пауза — табличка правил ──
export const PauseTablet: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <g>
      <Tablet x={330} y={420} s={1.5} k={1} rot={-8 + wob(t, 1, 2)} />
      <g transform="translate(1600 420)">
        <rect x={-50} y={-160} width={100} height={280} rx={30} fill={C.ink} />
        <circle cy={-100} r={34} fill={C.red} opacity={0.4 + 0.6 * (Math.sin(t) > 0.3 ? 1 : 0)} />
        <circle cy={-10} r={34} fill={C.yellow} opacity={0.4} />
        <circle cy={80} r={34} fill={C.green} opacity={0.4 + 0.6 * (Math.sin(t) <= 0.3 ? 1 : 0)} />
      </g>
      <Txt x={960} y={200} size={44} color={C.inkSoft}>
        маленькие договорённости
      </Txt>
    </g>
  );
};
