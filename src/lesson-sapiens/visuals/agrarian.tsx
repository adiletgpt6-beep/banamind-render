// Часть «Поле» (аграрная революция): кто кого одомашнил, ловушка урожая на острове,
// роскошь становится необходимостью, успех вида против счастья человека, амбар и излишки.
import React from "react";
import { C } from "../theme";
import { Crowd, Field, Granary, Hut, Island, Person, Sea, Stage, Wheat } from "./island";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── a01: пшеница «одомашнила» человека ──
export const WheatScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const grow = ramp(t, 0.3, 3);
  const hard = ramp(t, at(c, 3), 0.8);
  const flip = ramp(t, at(c, 4), 0.8);
  const chores = ["расчищать поле", "носить воду", "полоть сорняки"];
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={560} width={1160} height={200} rx={30} fill="#c99a5a" opacity={0.35} />
      <Field x={120} y={640} w={1040} rows={3} t={t} k={grow} />
      <Person x={640} y={720} s={1.5} i={2} t={t} bend={hard * 0.9} sad={hard > 0.5} />
      <Pop t={t} at={at(c, 2)} x={640} y={180}>
        <Panel x={-420} y={-70} w={840} h={130} fill={C.ink} />
        <Txt x={0} y={14} size={52} color={C.yellow}>
          «величайший обман»?
        </Txt>
      </Pop>
      {flip > 0 && (
        <g opacity={flip}>
          <Panel x={170} y={290} w={940} h={150} fill={C.white} />
          <Txt x={640} y={352} size={44} color={C.ink}>
            кто кого одомашнил?
          </Txt>
          <Txt x={640} y={410} size={34} color={C.inkSoft}>
            человек — пшеницу? пшеница — человека?
          </Txt>
        </g>
      )}
      {chores.map((s, i) => (
        <Pop key={s} t={t} at={at(c, 5 + i * 0.25)} x={260 + i * 380} y={520}>
          <Tag x={0} y={0} text={s} color={C.yellow} size={34} />
        </Pop>
      ))}
    </Stage>
  );
};

// ── a02: остров — ловушка урожая ──
export const FarmIsland: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const seed = ramp(t, 0.3, 1.5);
  const kids = ramp(t, at(c, 1), 2);
  const trap = ramp(t, at(c, 2), 1.4);
  const lock = pop(t, at(c, 3));
  const fieldW = 200 + 520 * kids;
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={620} />
      <Island x={640} y={680} w={1160} t={t} palms={trap < 0.5} />
      <Hut x={330} y={650} s={1} />
      {kids > 0.3 && <Hut x={210} y={660} s={0.8} />}
      {kids > 0.6 && <Hut x={1060} y={660} s={0.85} />}
      <Field x={470} y={600} w={fieldW} rows={2} t={t} k={seed} />
      <Crowd x={420} y={720 - 40} cols={4 + Math.round(kids * 10)} rows={1} gap={46} s={0.6} t={t} />
      {["больше еды", "больше детей", "больше полей"].map((s, i) => (
        <Pop key={s} t={t} at={at(c, i === 0 ? 0.7 : 1 + i * 0.3)} x={230 + i * 410} y={210}>
          <Tag x={0} y={0} text={s} color={C.white} size={38} />
        </Pop>
      ))}
      {[0, 1].map((i) => (
        <Arrow key={i} x1={360 + i * 410} y1={210} x2={460 + i * 410} y2={210} k={ramp(t, at(c, 1.2 + i * 0.3), 0.4)} color={C.inkSoft} w={8} />
      ))}
      {trap > 0 && (
        <g opacity={trap}>
          <Txt x={640} y={310} size={42} color={C.red}>
            назад не вернуться
          </Txt>
        </g>
      )}
      {lock > 0 && (
        <g transform={`translate(640 470) scale(${lock})`}>
          <rect x={-60} y={-30} width={120} height={100} rx={18} fill={C.inkSoft} />
          <path d="M -36 -30 L -36 -64 A 36 36 0 0 1 36 -64 L 36 -30" stroke={C.inkSoft} strokeWidth={16} fill="none" />
          <circle cy={18} r={12} fill={C.yellow} />
          <Tag x={-170} y={20} text="ловушка" color={C.coral} textColor={C.white} size={38} />
        </g>
      )}
    </Stage>
  );
};

// значок письма
const Letter: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-50} y={-34} width={100} height={68} rx={8} fill={C.white} stroke={C.skyDeep} strokeWidth={5} />
    <path d="M -50 -30 L 0 8 L 50 -30" stroke={C.skyDeep} strokeWidth={5} fill="none" />
  </g>
);

// ── a03: роскошь превращается в необходимость ──
export const Luxury: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const law = pop(t, 0.3);
  const before = ramp(t, at(c, 1), 0.6);
  const after = ramp(t, at(c, 1.55), 1.5);
  const duty = ramp(t, at(c, 2), 0.6);
  const n = Math.round(after * 36);
  return (
    <Stage host={c.p.host}>
      {law > 0 && (
        <g transform={`translate(640 190) scale(${law})`}>
          <Panel x={-470} y={-70} w={940} h={130} fill={C.ink} />
          <Txt x={0} y={14} size={44} color={C.yellow}>
            роскошь становится необходимостью
          </Txt>
        </g>
      )}
      {before > 0 && (
        <g opacity={before}>
          <Panel x={60} y={330} w={460} h={400} fill={C.white} />
          <Txt x={290} y={400} size={38} color={C.ink}>
            раньше
          </Txt>
          <Letter x={210} y={520} />
          <Letter x={360} y={540} rot={8} />
          <Txt x={290} y={670} size={32} color={C.inkSoft}>
            несколько в месяц
          </Txt>
        </g>
      )}
      {after > 0 && (
        <g>
          <Panel x={620} y={330} w={600} h={400} fill={C.white} />
          <Txt x={920} y={400} size={38} color={C.ink}>
            теперь
          </Txt>
          {Array.from({ length: n }).map((_, i) => (
            <Letter key={i} x={700 + (i % 9) * 56 + wob(t, i, 3)} y={470 + Math.floor(i / 9) * 46} s={0.45} rot={((i * 37) % 30) - 15} />
          ))}
          <Txt x={920} y={700} size={32} color={C.red}>
            десятки в день
          </Txt>
        </g>
      )}
      {duty > 0 && (
        <g opacity={duty}>
          <Txt x={640} y={810} size={40} color={C.ink}>
            удобство стало обязанностью
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── a04: количество против счастья ──
export const CountVsHappy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const left = ramp(t, at(c, 1), 0.8);
  const right = ramp(t, at(c, 1.4), 1.6);
  const lesson = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <Txt x={640} y={170} size={44} color={C.ink}>
        что «считает» эволюция?
      </Txt>
      {left > 0 && (
        <g opacity={left}>
          <Panel x={70} y={240} w={500} h={460} fill="#eafbef" />
          <Txt x={320} y={310} size={38} color={C.greenDeep}>
            около ста собирателей
          </Txt>
          <Crowd x={150} y={420} cols={6} rows={3} gap={56} s={0.6} t={t} />
          <Txt x={320} y={660} size={34} color={C.greenDeep}>
            сытые
          </Txt>
        </g>
      )}
      {right > 0 && (
        <g>
          <Panel x={640} y={240} w={570} h={460} fill="#fff1ee" />
          <Txt x={925} y={310} size={38} color={C.red}>
            около тысячи земледельцев
          </Txt>
          <g opacity={right}>
            {Array.from({ length: Math.round(right * 60) }).map((_, i) => (
              <Person key={i} x={690 + (i % 12) * 40} y={400 + Math.floor(i / 12) * 48} s={0.4} i={i} t={t} sad bend={0.2} />
            ))}
          </g>
          <Txt x={925} y={660} size={34} color={C.red}>
            полуголодные
          </Txt>
        </g>
      )}
      {lesson > 0 && (
        <g transform={`translate(640 790) scale(${lesson})`}>
          <Panel x={-520} y={-55} w={1040} h={100} fill={C.ink} />
          <Txt x={0} y={14} size={36} color={C.yellow}>
            успех вида — не счастье человека
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── a05: амбар, тревога о будущем, излишки уходят наверх ──
export const GranaryScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const worry = ramp(t, at(c, 1), 0.6);
  const fill = ramp(t, at(c, 2), 2);
  const up = ramp(t, at(c, 2.5), 1.5);
  const palace = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={700} width={1160} height={40} rx={20} fill={C.sandDeep} opacity={0.6} />
      <Granary x={330} y={700} s={1.5} fill={fill * 0.9} />
      <Person x={560} y={700} s={1.3} i={3} t={t} look={1} sad={worry > 0.5} />
      {worry > 0 && (
        <g opacity={worry} transform={`translate(780 300)`}>
          <ellipse rx={150} ry={70} fill="#c7cfdb" />
          <circle cx={-90} cy={20} r={60} fill="#c7cfdb" />
          <circle cx={90} cy={20} r={56} fill="#c7cfdb" />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-60 + i * 60} y1={80} x2={-70 + i * 60} y2={80 + ((t * 120 + i * 40) % 60)} stroke={C.skyDeep} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
          ))}
          <Txt x={0} y={14} size={36} color={C.ink}>
            будет ли дождь?
          </Txt>
        </g>
      )}
      {up > 0 &&
        [0, 1, 2, 3].map((i) => {
          const k = clamp01(up * 1.6 - i * 0.2);
          return (
            <g key={i} transform={`translate(${380 + k * 560} ${520 - k * 220 + i * 18})`} opacity={k > 0 && k < 1 ? 1 : 0.6}>
              <ellipse rx={18} ry={10} fill={C.wheat} />
            </g>
          );
        })}
      {palace > 0 && (
        <g transform={`translate(1000 340) scale(${palace})`}>
          <rect x={-150} y={-60} width={300} height={170} fill={C.white} stroke={C.clayDark} strokeWidth={6} />
          <path d="M -170 -60 L 0 -150 L 170 -60 Z" fill={C.clay} />
          {[-100, -35, 35, 100].map((x) => (
            <rect key={x} x={x - 12} y={-50} width={24} height={150} fill={C.sand} />
          ))}
          <Txt x={0} y={170} size={32} color={C.ink}>
            {"правители · воины · знать"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── a06: пауза — поле на закате ──
export const PauseField: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <g>
      <circle cx={1500} cy={300} r={110} fill={C.yellow} opacity={0.6} />
      <rect x={0} y={560} width={1920} height={240} fill="#e9c27a" opacity={0.5} />
      {Array.from({ length: 40 }).map((_, i) => (
        <Wheat key={i} x={40 + i * 48} y={720} h={110 + (i % 3) * 20} t={t} seed={i} />
      ))}
      <Hut x={300} y={620} s={1.1} />
      <Txt x={960} y={200} size={44} color={C.inkSoft}>
        удобство или обязанность?
      </Txt>
    </g>
  );
};
