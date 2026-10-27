// Часть «Счастье»: ожидания и условия, близнецы, «кондиционер» настроения и смысл,
// три пути будущего (прогнозы времени книги), сила без цели.
import React from "react";
import { C } from "../theme";
import { Person, Sea, Ship, Stage } from "./island";
import { Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── f01: ожидания против условий ──
export const Happiness: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const power = ramp(t, at(c, 1), 0.8);
  const money = ramp(t, at(c, 2), 1.2);
  const exp = ramp(t, at(c, 3), 2.5);
  const twins = ramp(t, at(c, 4), 0.6) * (1 - ramp(t, at(c, 5), 0.5));
  const ads = ramp(t, at(c, 5), 0.8);
  const cond = 220 + exp * 180;
  const want = 260 + exp * 260 + ads * 60;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={150}>
        <Tag x={0} y={0} text="стали ли мы счастливее?" color={C.yellow} size={42} />
      </Pop>
      {power > 0 && exp < 0.05 && twins <= 0 && (
        <g opacity={power}>
          <Txt x={640} y={300} size={40} color={C.ink}>
            сила ≠ счастье?
          </Txt>
          <g transform="translate(640 520)">
            <rect x={-300} y={-60} width={600} height={30} rx={15} fill="#dfe5ee" />
            <rect x={-300} y={-60} width={600 * clamp01(money * 0.6 + 0.2)} height={30} rx={15} fill={C.yellowDeep} />
            <Txt x={-320} y={-34} size={28} color={C.ink} anchor="end">
              деньги
            </Txt>
            <rect x={-300} y={20} width={600} height={30} rx={15} fill="#dfe5ee" />
            <rect x={-300} y={20} width={600 * clamp01(money * 0.9)} height={30} rx={15} fill={C.coral} />
            <Txt x={-320} y={46} size={28} color={C.ink} anchor="end">
              близкие
            </Txt>
            {money > 0.6 && (
              <Txt x={0} y={130} size={30} color={C.inkSoft}>
                деньги помогают лишь до предела
              </Txt>
            )}
          </g>
        </g>
      )}
      {exp > 0.05 && twins <= 0.01 && (
        <g opacity={clamp01(exp * 4)}>
          <line x1={150} y1={760} x2={1130} y2={760} stroke={C.ink} strokeWidth={6} />
          <rect x={330} y={760 - cond} width={220} height={cond} rx={12} fill={C.green} />
          <rect x={730} y={760 - want} width={220} height={want} rx={12} fill={C.coral} />
          <Txt x={440} y={800} size={30} color={C.ink}>
            условия
          </Txt>
          <Txt x={840} y={800} size={30} color={C.ink}>
            ожидания
          </Txt>
          <line x1={550} y1={760 - cond} x2={730} y2={760 - cond} stroke={C.inkSoft} strokeWidth={4} strokeDasharray="10 8" />
          <Txt x={640} y={760 - cond - (want - cond) / 2} size={30} color={C.red}>
            разрыв
          </Txt>
          {ads > 0 && (
            <g opacity={ads} transform={`translate(1060 ${360 + wob(t, 1, 6)})`}>
              <rect x={-90} y={-60} width={180} height={120} rx={14} fill={C.ink} />
              <Txt x={0} y={12} size={32} color={C.yellow}>
                реклама
              </Txt>
            </g>
          )}
        </g>
      )}
      {twins > 0 && (
        <g opacity={twins}>
          <Panel x={120} y={260} w={480} h={420} fill={C.white} />
          <Panel x={680} y={260} w={480} h={420} fill={C.white} />
          <Person x={360} y={560} s={1.5} i={1} t={t} sad />
          <Person x={920} y={560} s={1.5} i={1} t={t} arm={1} />
          <Txt x={360} y={330} size={32} color={C.ink}>
            авария
          </Txt>
          <Txt x={920} y={330} size={32} color={C.ink}>
            крупный выигрыш
          </Txt>
          <Txt x={640} y={760} size={34} color={C.violet}>
            через два года — почти как прежде
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── f02: «кондиционер» настроения и смысл ──
export const Thermostat: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wave = ramp(t, 0.3, 0.6);
  const note = pop(t, at(c, 1));
  const meaning = ramp(t, at(c, 2), 0.8);
  let d = "";
  for (let i = 0; i <= 60; i++) {
    const x = 140 + i * 16;
    const amp = Math.exp(-((i % 20) / 6)) * (i % 40 < 20 ? 1 : -1);
    const y = 480 - amp * 180 - Math.sin(t * 2 + i * 0.3) * 6;
    d += `${i ? "L" : "M"} ${x} ${y}`;
  }
  return (
    <Stage host={c.p.host}>
      <g opacity={wave * (1 - meaning * 0.7)}>
        <line x1={140} y1={480} x2={1120} y2={480} stroke={C.inkSoft} strokeWidth={4} strokeDasharray="12 10" />
        <path d={d} stroke={C.violet} strokeWidth={8} fill="none" strokeLinejoin="round" />
        <Txt x={1130} y={470} size={28} color={C.inkSoft} anchor="end">
          привычный уровень
        </Txt>
        <Txt x={640} y={200} size={40} color={C.ink}>
          настроение как кондиционер
        </Txt>
      </g>
      {note > 0 && (
        <g transform={`translate(640 760) scale(${note})`} opacity={1 - meaning}>
          <Panel x={-420} y={-55} w={840} h={100} fill="#f3edff" />
          <Txt x={0} y={12} size={32} color={C.violet}>
            точка зрения, а не медицинский вывод
          </Txt>
        </g>
      )}
      {meaning > 0 && (
        <g opacity={meaning} transform="translate(640 470)">
          <circle r={200} fill={C.yellow} opacity={0.3} />
          <circle r={130} fill={C.white} />
          <Txt x={0} y={14} size={50} color={C.ink}>
            смысл
          </Txt>
          <Tag x={0} y={280} text="не только приятные минуты" color={C.white} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── f03: три двери будущего (прогнозы) ──
export const ThreeDoors: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const doors = [
    { label: "гены", sub: "менять организмы", color: C.green },
    { label: "тело + машина", sub: "киборги", color: C.skyDeep },
    { label: "небиологическая", sub: "жизнь в компьютерах", color: C.violet },
  ];
  const fog = ramp(t, at(c, 2), 0.8);
  const ask = pop(t, at(c, 4));
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={150}>
        <Tag x={0} y={0} text="прогнозы своего времени" color="#dfe5ee" size={38} />
      </Pop>
      {doors.map((d, i) => {
        const k = pop(t, at(c, 1.1 + i * 0.25));
        const open = ramp(t, at(c, 1.3 + i * 0.25), 0.8);
        return k > 0 ? (
          <g key={i} transform={`translate(${250 + i * 390} 470) scale(${k})`}>
            <rect x={-130} y={-210} width={260} height={400} rx={18} fill={d.color} opacity={0.25} />
            <rect x={-130} y={-210} width={260 * (1 - open * 0.7)} height={400} rx={18} fill={d.color} />
            <circle cx={-130 + 260 * (1 - open * 0.7) - 30} cy={0} r={12} fill={C.white} />
            <Txt x={0} y={240} size={32} color={C.ink}>
              {d.label}
            </Txt>
            <Txt x={0} y={280} size={26} color={C.inkSoft}>
              {d.sub}
            </Txt>
          </g>
        ) : null;
      })}
      {fog > 0 && (
        <g opacity={fog * 0.75 * (1 - ask)}>
          <rect x={60} y={240} width={1160} height={460} rx={30} fill="#ffffff" opacity={0.6} />
          <Txt x={640} y={480} size={44} color={C.inkSoft}>
            будущее неизвестно
          </Txt>
        </g>
      )}
      {ask > 0 && (
        <g transform={`translate(640 470) scale(${ask})`}>
          <Panel x={-430} y={-70} w={860} h={130} fill={C.ink} />
          <Txt x={0} y={16} size={44} color={C.yellow}>
            чего мы захотим хотеть?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── f04: от каноэ к ракете — но куда? ──
export const Voyage: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const prog = ramp(t, at(c, 1), 3);
  const where = pop(t, at(c, 2));
  const note = ramp(t, at(c, 3), 0.8);
  const stages = ["каноэ", "парусник", "пароход", "ракета"];
  const idx = Math.min(3, Math.floor(prog * 4));
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={600} />
      <g transform={`translate(${200 + prog * 760} ${560 - idx * 40})`}>
        {idx === 0 && <path d="M -90 0 Q 0 40 90 0 L 70 20 Q 0 50 -70 20 Z" fill={C.woodDark} />}
        {idx === 1 && <Ship x={0} y={0} s={0.8} t={t} />}
        {idx === 2 && (
          <g>
            <path d="M -130 0 L 130 0 L 100 50 L -100 50 Z" fill={C.ink} />
            <rect x={-60} y={-60} width={120} height={60} fill={C.white} />
            <rect x={20} y={-120} width={36} height={60} fill={C.red} />
            <circle cx={38} cy={-150 - ((t * 40) % 40)} r={20} fill="#dfe5ee" opacity={0.7} />
          </g>
        )}
        {idx === 3 && (
          <g transform={`translate(0 ${-prog * 80}) rotate(-20)`}>
            <path d="M 0 -120 Q 40 -60 34 40 L -34 40 Q -40 -60 0 -120 Z" fill={C.white} stroke={C.ink} strokeWidth={5} />
            <circle cy={-30} r={16} fill={C.skyDeep} />
            <path d={`M -20 40 L 0 ${90 + Math.sin(t * 20) * 10} L 20 40 Z`} fill={C.yellowDeep} />
          </g>
        )}
      </g>
      <g>
        {stages.map((s, i) => (
          <Tag key={s} x={220 + i * 280} y={180} text={s} color={i <= idx && prog > 0 ? C.yellow : C.white} size={32} />
        ))}
      </g>
      {where > 0 && (
        <g transform={`translate(640 330) scale(${where})`}>
          <Txt x={0} y={20} size={80} color={C.red}>
            куда?
          </Txt>
        </g>
      )}
      {note > 0 && (
        <g opacity={note}>
          <Panel x={160} y={740} w={960} h={100} fill={C.white} />
          <Txt x={640} y={804} size={30} color={C.ink}>
            метафора силы — не богословие; урок: ответственность
          </Txt>
        </g>
      )}
    </Stage>
  );
};
