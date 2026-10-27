// Залы 1–2 и 11: Шир (спокойный, под «Правилами», исцеление, видение в Зеркале),
// жалость (Бильбо, Фродо, Сэм щадят Горлума), Бильбо не может разжать руку,
// надпись в огне, история Смеагорла, Кольцо зовёт само, Бомбадил, отказ сильного.
import React from "react";
import { interpolate } from "remotion";
import { C, SERIF } from "../theme";
import { cxOf } from "./common";
import { Figure, Label, OL, Plinth, Ring } from "./figures";
import { Arrow, Cross, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// дерево: зелёное, срубленное (пень) или саженец
const Tree: React.FC<{ x: number; y: number; s?: number; state?: "full" | "stump" | "sapling"; t?: number; grow?: number }> = ({ x, y, s = 1, state = "full", t = 0, grow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {state === "stump" ? (
      <g>
        <rect x={-26} y={-40} width={52} height={40} fill="#8a6038" stroke={OL} strokeWidth={4} />
        <ellipse cx={0} cy={-40} rx={26} ry={9} fill="#d9b27a" stroke={OL} strokeWidth={4} />
      </g>
    ) : state === "sapling" ? (
      <g transform={`scale(${grow})`}>
        <line x1={0} y1={0} x2={0} y2={-80} stroke="#6b4a2a" strokeWidth={8} />
        <circle cx={0} cy={-100} r={34} fill={C.moss} stroke={OL} strokeWidth={4} />
      </g>
    ) : (
      <g transform={`rotate(${wob(t, x, 1.2)})`}>
        <rect x={-16} y={-120} width={32} height={120} fill="#7a5532" stroke={OL} strokeWidth={4} />
        <circle cx={0} cy={-170} r={78} fill={C.green} stroke={OL} strokeWidth={4} />
        <circle cx={-40} cy={-140} r={46} fill="#5bbd7c" />
      </g>
    )}
  </g>
);

// круглая дверь в холме
const HoleDoor: React.FC<{ x: number; y: number; color?: string }> = ({ x, y, color = "#2e7d4f" }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={70} fill={color} stroke={OL} strokeWidth={5} />
    <circle r={52} fill="none" stroke="#1d5a38" strokeWidth={4} />
    <circle cx={0} cy={0} r={8} fill={C.gold} stroke={OL} strokeWidth={3} />
  </g>
);

export const Shire: React.FC<VisualProps<P & { mode: "calm" | "scoured" | "healing" | "vision" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const mode = p.mode;
  const scoured = mode === "scoured" || mode === "vision";
  const heal = mode === "healing" ? ramp(t, at(c, 0.2), 3) : 0;
  const smoke = scoured ? ramp(t, at(c, 1), 1) : 0;
  const rules = mode === "scoured" ? [0, 1, 2].map((i) => pop(t, at(c, 0.3 + i * 0.12))) : [];
  const wound = mode === "healing" ? ramp(t, at(c, 1.2), 0.8) : 0;
  const content = (
    <g>
      {/* холмы */}
      <path d={`M ${cx - 820} 860 Q ${cx - 500} 460 ${cx - 140} 860 Z`} fill={scoured ? "#b8b39a" : "#8fd27a"} stroke={OL} strokeWidth={5} />
      <path d={`M ${cx - 260} 860 Q ${cx + 160} 380 ${cx + 600} 860 Z`} fill={scoured ? "#c2bca3" : "#a6dd8a"} stroke={OL} strokeWidth={5} />
      <HoleDoor x={cx + 170} y={720} color={scoured ? "#6e6a5e" : "#2e7d4f"} />
      <HoleDoor x={cx - 480} y={760} color={scoured ? "#6e6a5e" : "#c98a3a"} />
      {/* деревья: живые, пни или саженцы */}
      {[cx - 700, cx - 260, cx + 470, cx + 700].map((x, i) => (
        <Tree key={i} x={x} y={860} s={0.9} t={t} state={scoured ? "stump" : mode === "healing" ? (i % 2 ? "sapling" : "full") : "full"} grow={0.4 + 0.6 * heal} />
      ))}
      {/* мельница с трубой — при «Правилах» дымит */}
      {scoured && (
        <g transform={`translate(${cx + 560} 860)`}>
          <rect x={-90} y={-220} width={180} height={220} fill="#9c4a3a" stroke={OL} strokeWidth={5} />
          <rect x={30} y={-380} width={50} height={170} fill="#7a3a2e" stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => {
            const k = ((t * 0.35 + i / 3) % 1) * smoke;
            return <circle key={i} cx={55 + k * 60 + wob(t, i, 10)} cy={-400 - k * 220} r={30 + k * 50} fill="#55505a" opacity={0.6 * (1 - k)} />;
          })}
        </g>
      )}
      {/* «Правила» на столбах */}
      {rules.map((k, i) =>
        k > 0 ? (
          <g key={i} transform={`translate(${cx - 640 + i * 280} ${600 - (i % 2) * 40}) scale(${k}) rotate(${wob(t, i, 2)})`}>
            <rect x={-8} y={0} width={16} height={180} fill="#6b4a2a" />
            <rect x={-110} y={-80} width={220} height={100} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-18} size={30} weight={900} color={C.red}>
              {["ПРАВИЛА", "ЗАПРЕЩЕНО", "СБОР"][i]}
            </Txt>
          </g>
        ) : null,
      )}
      {mode === "calm" && (
        <g>
          <Figure kind="hobbit" x={cx - 60} y={880} s={0.85} t={t} mood="happy" />
          <Figure kind="sam" x={cx + 50} y={880} s={0.85} t={t} mood="happy" flip />
          <Pop t={t} at={at(c, 1)} x={cx} y={250}>
            <Label x={0} y={0} text="«самый незначительный» народ" size={36} bg={C.goldLight} />
          </Pop>
          <Pop t={t} at={at(c, 2)} x={cx} y={360}>
            <Label x={0} y={0} text="…о них говорят на Советах" size={36} />
          </Pop>
        </g>
      )}
      {mode === "healing" && (
        <g>
          <Figure kind="sam" x={cx - 100} y={880} s={0.85} t={t} mood="happy" arm="hold" />
          <g opacity={wound}>
            <Figure kind="hobbit" x={cx + 300} y={880} s={0.85} t={t} mood="sad" />
            <circle cx={cx + 330} cy={880 - 120} r={14 + 4 * Math.sin(t * 3)} fill={C.ember} opacity={0.7} />
            <Label x={cx + 300} y={600} text="рана не заживает" size={30} bg="#fff4ec" />
          </g>
        </g>
      )}
    </g>
  );
  if (mode === "vision") {
    // видение в чаше Зеркала: Шир в кругу воды
    const k = pop(t, 0.1);
    return (
      <g>
        <g transform={`translate(${cx} 470) scale(${k})`}>
          <ellipse cx={0} cy={330} rx={420} ry={60} fill="#cfd8e2" stroke={OL} strokeWidth={5} />
          <circle r={330} fill="#e9f3fb" stroke={C.silver} strokeWidth={18} />
          <clipPath id="visionClip">
            <circle r={318} />
          </clipPath>
          <g clipPath="url(#visionClip)" opacity={0.9}>
            <g transform={`translate(${-cx} -560)`}>{content}</g>
          </g>
        </g>
        <Figure kind="sam" x={cx + 470} y={900} s={0.95} t={t} mood={t > at(c, 1) ? "calm" : "scared"} />
      </g>
    );
  }
  return content;
};

// ── жалость: рука с мечом опускается ──
export const Pity: React.FC<VisualProps<P & { stage: "bilbo" | "frodo" | "sam" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const lower = ramp(t, at(c, p.stage === "bilbo" ? 1 : 0.5), 1.2);
  const who = p.stage === "sam" ? "sam" : "hobbit";
  const name = p.stage === "bilbo" ? "Бильбо" : p.stage === "frodo" ? "Фродо" : "Сэм";
  const swordAng = interpolate(lower, [0, 1], [-60, 70]);
  const glow = ramp(t, at(c, p.stage === "frodo" ? 1 : 1.2), 1);
  return (
    <g>
      {p.stage !== "sam" && (
        <rect x={cx - 640} y={190} width={1280} height={680} rx={60} fill={p.stage === "bilbo" ? "#d8d2c6" : "#e8e1d0"} opacity={0.7} />
      )}
      <Figure kind={who} x={cx - 240} y={860} s={1.3} t={t} mood={lower > 0.5 ? "sad" : "angry"} label={name} arm="out" />
      <g transform={`translate(${cx - 120} ${600}) rotate(${swordAng})`}>
        <rect x={-6} y={-200} width={14} height={180} fill="#dfe7ee" stroke={OL} strokeWidth={4} />
        <rect x={-30} y={-24} width={60} height={14} rx={6} fill={C.goldDeep} stroke={OL} strokeWidth={3} />
        <rect x={-6} y={-10} width={14} height={40} fill="#6b4a2a" stroke={OL} strokeWidth={3} />
      </g>
      <Figure kind="gollum" x={cx + 260} y={860} s={1.3} t={t} mood="scared" label="Горлум" flip />
      {glow > 0 && (
        <g opacity={glow}>
          <path d={`M ${cx - 60} 420 q 80 -90 160 0`} stroke={C.coral} strokeWidth={10} fill="none" strokeLinecap="round" />
          <Txt x={cx + 20} y={340} size={54} weight={900} color={C.coral}>
            жалость
          </Txt>
        </g>
      )}
      {p.stage === "frodo" && (
        <Pop t={t} at={at(c, 1.5)} x={cx + 260} y={560}>
          <Label x={0} y={0} text="«Смеагорл»" size={36} bg={C.goldLight} />
        </Pop>
      )}
      {p.stage === "sam" && (
        <g>
          <path d={`M ${cx - 700} 870 L ${cx + 700} 870 L ${cx + 700} 600 Q ${cx} 520 ${cx - 700} 820 Z`} fill="#b9a89a" opacity={0.5} />
          <Pop t={t} at={at(c, 1.4)} x={cx} y={250}>
            <Label x={0} y={0} text="«сам носил Кольцо»" size={34} bg="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Бильбо сжимает кольцо: «моя прелесть» ──
export const Cling: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const tense = ramp(t, at(c, 1), 0.8);
  const release = ramp(t, at(c, 2.2), 1.2);
  const shake = tense * (1 - release) * Math.sin(t * 30) * 4;
  return (
    <g>
      <Plinth x={cx} y={560} w={420} h={280} />
      <g transform={`translate(${cx + shake} 420)`}>
        {/* кулак, разжимающийся */}
        <circle r={110} fill="#ffe3c9" stroke={OL} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-90 + i * 46} y={-120 + release * -70} width={42} height={90 - release * 40} rx={20} fill="#ffe3c9" stroke={OL} strokeWidth={5} transform={`rotate(${release * (i - 1.5) * 14})`} />
        ))}
        <g opacity={release}>
          <Ring x={0} y={-40} r={40} glow={0.6} t={t} />
        </g>
      </g>
      <Pop t={t} at={at(c, 1.3)} x={cx - 420} y={260}>
        <Label x={0} y={0} text="«моя прелесть»" size={38} bg={C.goldLight} />
      </Pop>
      {[["подозрительность", 1.5], ["меч в руке", 1.7]].map(([w, b], i) => (
        <Pop key={String(w)} t={t} at={at(c, Number(b))} x={cx + 420} y={240 + i * 110}>
          <Label x={0} y={0} text={String(w)} size={32} bg="#fff4ec" />
        </Pop>
      ))}
      <Pop t={t} at={at(c, 2.3)} x={cx} y={180}>
        <Txt x={0} y={0} size={44} weight={900} color={C.greenDeep}>
          отпустить — почти невозможно
        </Txt>
      </Pop>
    </g>
  );
};

// ── надпись в огне, карман ──
export const FireRing: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const fire = ramp(t, 0.2, 0.6);
  const script = ramp(t, at(c, 0.4), 1.4);
  const pocket = ramp(t, at(c, 1.5), 1);
  return (
    <g>
      {/* камин */}
      <path d={`M ${cx - 380} 880 L ${cx - 380} 380 L ${cx + 380} 380 L ${cx + 380} 880 Z`} fill="#c9b49a" stroke={OL} strokeWidth={6} />
      <path d={`M ${cx - 260} 880 L ${cx - 260} 520 Q ${cx} 440 ${cx + 260} 520 L ${cx + 260} 880 Z`} fill="#4a3a33" stroke={OL} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M ${cx - 180 + i * 90} 880 Q ${cx - 220 + i * 90 + wob(t * 3, i, 14)} ${760 - (i % 2) * 60} ${cx - 160 + i * 90} ${700 - (i % 3) * 40} Q ${cx - 120 + i * 90} 780 ${cx - 100 + i * 90} 880 Z`}
          fill={i % 2 ? C.ember : C.gold}
          opacity={fire * 0.9}
        />
      ))}
      <g transform={`translate(${cx + pocket * 500} ${700 - pocket * 120}) scale(${1 - pocket * 0.4})`}>
        <Ring x={0} y={0} r={70} glow={0.8} t={t} />
        {/* огненные знаки — абстрактные штрихи, не шрифт экранизации */}
        <g opacity={script * (1 - pocket)}>
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <path key={i} d={`M ${Math.cos(a) * 70} ${Math.sin(a) * 70} l ${Math.cos(a + 1.6) * 12} ${Math.sin(a + 1.6) * 12}`} stroke="#fff0a8" strokeWidth={5} strokeLinecap="round" opacity={clamp01(script * 14 - i)} />;
          })}
        </g>
      </g>
      <Pop t={t} at={at(c, 0.7)} x={cx} y={280}>
        <Label x={0} y={0} text="Кольцо Всевластия" size={42} bg={C.goldLight} />
      </Pop>
      {pocket > 0.5 && (
        <g transform={`translate(${cx + 500} 620)`} opacity={pocket}>
          <path d="M -90 -60 L 90 -60 L 70 80 Q 0 110 -70 80 Z" fill="#3f8f5a" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={150} size={34} weight={900} color={C.inkSoft}>
            «в карман»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── история Смеагорла: цепочка шагов ──
export const GollumStory: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const steps = [
    { kind: "hobbit" as const, label: "Смеагорл", mood: "happy" as const, at: 0 },
    { kind: "hobbit" as const, label: "убил друга", mood: "angry" as const, at: 0.6 },
    { kind: "gollum" as const, label: "«мелкое всевластие»", mood: "wild" as const, at: 1 },
    { kind: "gollum" as const, label: "любит и ненавидит", mood: "sad" as const, at: 2 },
  ];
  return (
    <g>
      {steps.map((s, i) => {
        const a = pop(t, at(c, s.at) + 0.1);
        const x = cx - 600 + i * 400;
        return (
          <g key={i} opacity={clamp01(a * 1.4)} transform={`translate(0 ${(1 - a) * 30})`}>
            <Figure kind={s.kind} x={x} y={720} s={1.1} t={t} mood={s.mood} color={i === 0 ? "#7aa36a" : undefined} />
            <Label x={x} y={820} text={s.label} size={30} bg={i >= 2 ? "#f1f4ee" : "#fff"} />
            {i === 1 && <Ring x={x + 70} y={560} r={26} glow={0.7} t={t} />}
            {i < steps.length - 1 && <Arrow x1={x + 110} y1={600} x2={x + 290} y2={600} k={ramp(t, at(c, steps[i + 1].at), 0.5)} color={C.inkSoft} w={8} />}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 3)} x={cx} y={230}>
        <rect x={-430} y={-60} width={860} height={110} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <Txt x={0} y={14} size={44} weight={900} color={C.ink}>
          Гэндальф: «не мерзко, а горько»
        </Txt>
      </Pop>
    </g>
  );
};

// ── Кольцо зовёт: «подсказка со стороны», рана ──
export const RingCall: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const pull = ramp(t, 0.2, 2);
  const wound = ramp(t, at(c, 1.5), 0.6);
  return (
    <g>
      <Figure kind="hobbit" x={cx - 200} y={860} s={1.4} t={t} mood={wound > 0 ? "scared" : "calm"} label="Фродо" arm="out" />
      <Ring x={cx + 250} y={520} r={55} glow={1} t={t} />
      {[0, 1, 2].map((i) => {
        const k = ((t * 0.6 + i / 3) % 1) * pull;
        return <circle key={i} cx={cx + 250} cy={520} r={60 + k * 260} fill="none" stroke={C.gold} strokeWidth={6} opacity={0.6 * (1 - k)} />;
      })}
      <Pop t={t} at={at(c, 0.3)} x={cx + 250} y={250}>
        <Label x={0} y={0} text="«по чьей-то подсказке»" size={34} bg={C.goldLight} />
      </Pop>
      <Pop t={t} at={at(c, 1.2)} x={cx + 250} y={760}>
        <Label x={0} y={0} text="«по велению врага»" size={34} bg="#fff4ec" />
      </Pop>
      {wound > 0 && (
        <g opacity={wound}>
          <circle cx={cx - 160} cy={860 - 170} r={18 + 5 * Math.sin(t * 4)} fill={C.ember} />
          <path d={`M ${cx - 160} ${690} l 30 -30 M ${cx - 160} 690 l -26 -34 M ${cx - 160} 690 l 36 6`} stroke={C.ember} strokeWidth={6} strokeLinecap="round" />
          <Label x={cx - 200} y={420} text="рана" size={34} bg="#fff" />
        </g>
      )}
    </g>
  );
};

// ── Бомбадил: Кольцо не действует ──
export const Bombadil: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const toss = (t * 1.4) % 1;
  const y = 400 - Math.sin(toss * Math.PI) * 200;
  return (
    <g>
      <Figure kind="man" x={cx - 120} y={860} s={1.2} t={t} color="#4a8fd0" mood="happy" label="Том Бомбадил" arm="up" />
      <path d={`M ${cx - 175} ${860 - 360} L ${cx - 65} ${860 - 360} L ${cx - 120} ${860 - 440} Z`} fill="#f2c230" stroke={OL} strokeWidth={4} opacity={0.0} />
      <Ring x={cx + 10} y={y} r={34} glow={0.5} t={t} rot={toss * 360} />
      <Pop t={t} at={at(c, 0.6)} x={cx + 380} y={330}>
        <Label x={0} y={0} text="власти нет" size={38} bg={C.goldLight} />
      </Pop>
      <Pop t={t} at={at(c, 1.2)} x={cx + 380} y={470}>
        <Label x={0} y={0} text="но и задачу не решит" size={34} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── отказ сильного: рука отводит Кольцо ──
export const Refuse: React.FC<VisualProps<P & { who: string; says: string; reason: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const offer = ramp(t, 0.2, 1);
  const push = ramp(t, at(c, 0.6), 0.6);
  const kind = p.who === "Гэндальф" ? "wizard" : "man";
  return (
    <g>
      <Figure kind="hobbit" x={cx - 380} y={860} s={1.15} t={t} label="Фродо" arm="out" />
      <Figure kind={kind} x={cx + 260} y={860} s={1.1} t={t} label={p.who} mood={push > 0.3 ? "angry" : "calm"} arm="push" flip color={kind === "man" ? "#4f6b55" : undefined} />
      <Ring x={cx - 240 + offer * 240 - push * 180} y={600 - push * 40} r={40} glow={0.9} t={t} />
      {push > 0 && <Cross x={cx + 20} y={500} s={90} k={push} />}
      <Pop t={t} at={at(c, 0.5)} x={cx} y={220}>
        <rect x={-430} y={-62} width={860} height={112} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        {p.says.split("\n").map((l, i, a) => (
          <text key={i} x={0} y={14 + (i - (a.length - 1) / 2) * 48} fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.ink} textAnchor="middle">
            {l}
          </text>
        ))}
      </Pop>
      <Pop t={t} at={at(c, 1.2)} x={cx + 260} y={330}>
        {p.reason.split("\n").map((l, i) => (
          <Txt key={i} x={0} y={i * 44} size={36} weight={900} color={C.rust}>
            {l}
          </Txt>
        ))}
      </Pop>
    </g>
  );
};
