// Блок «Мир романа»: фраза-отговорка, приметы упадка, киоскёр, герои.
import React from "react";
import { interpolate } from "remotion";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Bubble, Factory, Figure, Icon, Oak, OL, Silhouette, Skyline, Typewriter, zoneX } from "./draw";
import { Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

export const GaltPhrase: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const people = [
    { x: 170, label: "бродяга", hair: "hat" as const, color: "#7b6f63", b: 0.2 },
    { x: 440, label: "клерк", hair: "bald" as const, color: "#8796ab", b: 1.3 },
    { x: 700, label: "машинист", hair: "cap" as const, color: "#3e5a86", b: 1.6 },
    { x: 960, label: "инженер", hair: "m" as const, color: C.green, b: 1.9 },
    { x: 1220, label: "делец", hair: "hat" as const, color: "#5b4b7a", b: 2.2 },
  ];
  const shrug = ramp(t, at(c, 3), 0.6);
  const meaning = pop(t, at(c, 2.2));
  return (
    <g>
      <rect x={60} y={820} width={1300} height={14} rx={7} fill="#cfd6e2" />
      {people.map((p, i) => {
        const k = pop(t, at(c, p.b));
        if (k <= 0.001) return null;
        return (
          <g key={i} opacity={clamp01(k * 1.5)}>
            <Figure x={p.x} y={800} s={1.05} hair={p.hair} color={p.color} t={t} arms={shrug * 0.9} mood={shrug > 0.5 ? "flat" : "o"} hairColor="#3b2a1e" />
            <Tag x={p.x} y={880} text={p.label} size={26} color={C.white} />
            <Bubble x={p.x + (i % 2 ? 30 : -10)} y={430 - (i % 2) * 70} w={270} h={110} text={"Кто такой\nДжон Голт?"} size={30} k={k * (1 - shrug * 0.15)} />
          </g>
        );
      })}
      {meaning > 0 && (
        <g transform={`translate(700 170) scale(${meaning})`}>
          <rect x={-560} y={-56} width={1120} height={112} rx={56} fill={C.ink} />
          <text y={18} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={42} fill={C.yellow}>
            = «не надо задавать бесполезных вопросов»
          </text>
        </g>
      )}
      {shrug > 0 && (
        <g transform={`translate(1210 600) scale(${pop(t, at(c, 3))}) rotate(${wob(t, 1, 3)})`}>
          <rect x={-190} y={-46} width={380} height={92} rx={46} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.inkSoft}>
            пожатие плечами
          </text>
        </g>
      )}
      <Pop t={t} at={at(c, 4)} x={700} y={300}>
        <Tag x={0} y={0} text="запомним: позже смысл изменится" size={34} color={C.yellow} />
      </Pop>
    </g>
  );
};

export const Decay: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x0 = zoneX(c.p.host) - 520;
  const cal = pop(t, at(c, 1));
  const tw = pop(t, at(c, 1.4));
  const rust = pop(t, at(c, 2));
  const oak = pop(t, at(c, 3));
  const split = ramp(t, at(c, 3.6), 0.7);
  const flash = split > 0 && split < 0.4 ? 1 - split / 0.4 : 0;
  const motto = pop(t, at(c, 4));
  return (
    <g>
      <Skyline y={560} t={t} seed={5} x0={x0 - 80} x1={x0 + 1160} color="#b4bfd0" />
      {/* трещина на десять этажей */}
      <path d={`M ${x0 + 300} 240 l 18 40 l -14 40 l 20 50 l -16 60 l 14 60`} stroke={OL} strokeWidth={5} fill="none" opacity={ramp(t, 0.3, 1)} />
      {cal > 0 && (
        <g transform={`translate(${x0 + 180} 640) scale(${cal})`}>
          <rect x={-150} y={-90} width={300} height={170} rx={12} fill="#fffdf6" stroke={OL} strokeWidth={5} />
          <rect x={-150} y={-90} width={300} height={40} rx={12} fill={C.red} />
          <text y={22} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
            «Твои дни
          </text>
          <text y={60} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
            сочтены»
          </text>
        </g>
      )}
      {tw > 0 && <g transform={`translate(${x0 + 520} 760) scale(${tw * 0.9})`}><Typewriter x={0} y={0} t={t} broken={ramp(t, at(c, 1.6), 1)} /></g>}
      {rust > 0 && (
        <g transform={`translate(${x0 + 180} 880) scale(${rust})`}>
          <rect x={-130} y={-60} width={260} height={90} rx={12} fill="#b5743f" stroke={OL} strokeWidth={4} />
          <circle cx={-70} cy={-15} r={26} fill="#8e5a33" stroke={OL} strokeWidth={4} />
          <rect x={-20} y={-100} width={30} height={60} fill="#9c6237" stroke={OL} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={-100 + i * 50} cy={10 + (i % 2) * 8} r={6} fill="#6d3f1f" />
          ))}
          <Txt x={0} y={80} size={26} color={C.inkSoft}>
            ржавый станок
          </Txt>
        </g>
      )}
      {oak > 0 && (
        <g transform={`translate(${x0 + 880} 880) scale(${oak * 1.05})`}>
          <Oak x={0} y={0} split={split} t={t} />
          {flash > 0 && <path d="M -10 -520 L 30 -420 L -10 -400 L 30 -260" stroke="#fff3a0" strokeWidth={14} fill="none" opacity={flash} />}
        </g>
      )}
      {motto > 0 && (
        <g transform={`translate(${x0 + 560} 170) scale(${motto})`}>
          <rect x={-470} y={-50} width={940} height={100} rx={50} fill={C.ink} />
          <text y={16} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={C.yellow}>
            снаружи сила — внутри пустота
          </text>
        </g>
      )}
    </g>
  );
};

export const Kiosk: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fade = ramp(t, at(c, 1), 2.4);
  const crowd = pop(t, at(c, 2));
  const fear = ramp(t, at(c, 2.5), 0.8);
  const empty = pop(t, at(c, 3));
  return (
    <g>
      {/* киоск */}
      <g transform="translate(420 520)">
        <Panel x={-260} y={-260} w={520} h={520} fill="#ffeccc" />
        <rect x={-260} y={-300} width={520} height={70} rx={20} fill={C.coral} stroke={OL} strokeWidth={5} />
        <text y={-252} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.white}>
          КИОСК
        </text>
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const gone = clamp01(fade * 12 - (11 - i)) > 0.5 && i > 4;
          const hues = ["#e06c75", "#61afef", "#98c379", "#e5c07b", "#c678dd", "#56b6c2"];
          return (
            <g key={i} transform={`translate(${-180 + col * 120} ${-170 + row * 120})`} opacity={gone ? 0.15 : 1}>
              <rect x={-40} y={-44} width={80} height={88} rx={8} fill={gone ? "#ddd" : hues[i % 6]} stroke={OL} strokeWidth={3} strokeDasharray={gone ? "8 6" : undefined} />
              {!gone && <rect x={-30} y={-24} width={60} height={20} rx={4} fill="#fff" opacity={0.8} />}
            </g>
          );
        })}
        <Figure x={0} y={250} s={0.9} hair="bald" color="#8a7a66" mood="sad" t={t} />
      </g>
      <Pop t={t} at={at(c, 1.3)} x={420} y={170}>
        <Tag x={0} y={0} text="новых не выпускают" size={34} color={C.yellow} />
      </Pop>
      {/* прохожие */}
      {crowd > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const x = 820 + ((t * (90 + i * 14) + i * 150) % 560);
          return <Silhouette key={i} x={x} y={900} s={0.8} walk={1} t={t + i} color={fear > 0.5 ? "#6b5b7a" : "#5b6a84"} opacity={crowd} />;
        })}
      {crowd > 0 && (
        <g opacity={crowd}>
          <g opacity={1 - fear}>
            <Tag x={1100} y={560} text="спешат к цели →" size={34} color="#c9f0d9" />
          </g>
          <g opacity={fear}>
            <Tag x={1100} y={560} text="гонит страх" size={38} color="#f5d0d6" />
          </g>
        </g>
      )}
      {empty > 0 && (
        <g transform={`translate(1100 320) scale(${empty})`}>
          <rect x={-300} y={-60} width={600} height={120} rx={30} fill={C.ink} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.white}>
            «Кто такой Джон Голт?»
          </text>
          <text y={36} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.yellow}>
            = безнадёжность
          </text>
        </g>
      )}
    </g>
  );
};

// Карточки героев: условные портреты + символ.
const HEROES = [
  { name: "Дагни Таггерт", role: "вице-президент, инженер", icon: "rails", hair: "f" as const, color: C.metal, hairColor: "#4a3020" },
  { name: "Джеймс Таггерт", role: "президент компании", icon: "folder", hair: "m" as const, color: "#8796ab", hairColor: "#6b4a2a" },
  { name: "Эдди Уиллерс", role: "помощник Дагни", icon: "notebook", hair: "m" as const, color: C.sky, hairColor: "#c9a35e" },
  { name: "Хэнк Риарден", role: "сталь и новый сплав", icon: "ingot", hair: "m" as const, color: "#4c5a72", hairColor: "#b9a77f" },
  { name: "Франсиско д’Анкония", role: "медный король", icon: "copper", hair: "m" as const, color: "#a0522d", hairColor: "#1e1a18" },
  { name: "Эллис Уайэтт", role: "нефть Колорадо", icon: "derrick", hair: "m" as const, color: C.fireDeep, hairColor: "#2c2018" },
];

export const Cast: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const logo = pop(t, 0.15);
  return (
    <g>
      <g transform={`translate(1100 140) scale(${logo})`}>
        <rect x={-560} y={-50} width={1120} height={100} rx={50} fill={C.ink} />
        <text y={16} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={40} fill={C.white}>
          «Таггерт Трансконтинентал» · <tspan fill={C.yellow}>от океана до океана</tspan>
        </text>
      </g>
      {HEROES.map((h, i) => {
        const k = pop(t, at(c, i + 1));
        if (k <= 0.001) return null;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 560 + col * 420 + (row ? 120 : 0);
        const y = 400 + row * 340;
        const active = t >= at(c, i + 1) && t < at(c, i + 2);
        return (
          <g key={i} transform={`translate(${x} ${y + wob(t, i, 2)}) scale(${(0.6 + 0.4 * k) * (active ? 1.06 : 0.96)})`} opacity={clamp01(k * 1.4)}>
            <Panel x={-190} y={-150} w={380} h={300} fill={active ? "#fffbe8" : C.white} stroke={active ? C.yellowDeep : undefined} r={30} />
            <circle cx={-90} cy={-40} r={78} fill="#eef3fa" />
            <g transform="translate(-90 60) scale(0.78)">
              <Figure x={0} y={0} hair={h.hair} color={h.color} hairColor={h.hairColor} t={t} mood={active ? "smile" : "flat"} />
            </g>
            <Icon name={h.icon} x={90} y={-40} s={0.9} t={t} />
            <text x={0} y={100} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
              {h.name}
            </text>
            <text x={0} y={134} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={22} fill={C.inkSoft}>
              {h.role}
            </text>
          </g>
        );
      })}
      <g opacity={interpolate(t, [0, 1], [0, 0.6], { extrapolateRight: "clamp" })}>
        <Factory x={1800} y={1000} s={0.4} t={t} />
      </g>
    </g>
  );
};
