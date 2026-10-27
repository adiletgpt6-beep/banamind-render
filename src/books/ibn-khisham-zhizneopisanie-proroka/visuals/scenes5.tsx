// Глава 9: Арафат и прощальная проповедь, занавес утренней молитвы, ночной фонарь,
// итог-уроки и финал. Без изображения людей; скорбные сцены — тихие, тёплый свет.
import React from "react";
import { BRAND } from "../../../banamind/brand";
import { C, HEAVY, SERIF } from "../theme";
import { Lantern, Mountains, OL, Sky, Star8, Tent } from "./draw";
import { Icon } from "./icons";
import { Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";
import { PageTag } from "./scenes1";

// ─────────────── Арафат: шатры и огромная толпа огоньков ───────────────
export const Arafat: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const crowd = ramp(t, 0.3, 3);
  const words = pop(t, at(c, 1));
  return (
    <g>
      <g transform={camera(t, c.dur, x, 620, 1.0, 1.08)}>
        <Sky mode="dusk" t={t} id="arafat" sunX={x + 520} sunY={330} />
        <Mountains y={640} color="#7a5a6a" seed={18} scale={0.7} />
        <path d={`M ${x - 200} 640 Q ${x} 440 ${x + 200} 640 Z`} fill="#8a6670" />
        <rect x={0} y={640} width={1920} height={440} fill="#c99a7a" />
        {Array.from({ length: 36 }).map((_, i) => (
          <Tent key={i} x={60 + ((i * 211) % 1800)} y={700 + ((i * 53) % 120)} s={0.35 + ((i * 7) % 4) * 0.05} color={i % 3 ? "#f6ead6" : "#f2e6cf"} />
        ))}
        {Array.from({ length: 420 }).map((_, i) => {
          const px = ((i * 137) % 1900) + 10;
          const py = 830 + ((i * 59) % 240);
          const k = clamp01(crowd * 420 - i);
          if (k <= 0) return null;
          return <circle key={i} cx={px} cy={py} r={3 + (i % 3)} fill={i % 5 ? "#fffaf0" : "#ffe08a"} opacity={0.75 * k} />;
        })}
      </g>
      <Pop t={t} at={0.5} x={x} y={150}>
        <Tag x={0} y={0} text="прощальное паломничество · Арафат" size={36} color="#fff4d0" />
      </Pop>
      {words > 0 && (
        <g transform={`translate(${x} 360) scale(${words})`}>
          <Panel x={-520} y={-110} w={1040} h={200} fill="rgba(255,250,240,0.94)" stroke={C.gold} />
          <Txt x={0} y={-30} size={40} weight={700} family={SERIF}>
            «О люди! Слушайте мои слова!
          </Txt>
          <Txt x={0} y={30} size={34} weight={700} family={SERIF}>
            Может быть, я уже не встречусь с вами больше…»
          </Txt>
        </g>
      )}
      <PageTag x={x} y={225} text="стр. 590–596" dark k={ramp(t, 0.8, 0.5)} />
    </g>
  );
};

// ─────────────── занавес и свет утренней молитвы ───────────────
export const Curtain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const choice = pop(t, at(c, 1));
  const ansar = pop(t, at(c, 2));
  const open = ramp(t, at(c, 3), 2);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2b2238" />
      {/* дверной проём, за ним — ряды молящихся огоньками (без фигур) */}
      <g transform={`translate(${x} 520)`}>
        <rect x={-300} y={-360} width={600} height={720} fill="#f6e7c4" />
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 9 }).map((_, i) => (
            <rect key={`${r}-${i}`} x={-270 + i * 60} y={120 + r * 46} width={40} height={14} rx={7} fill="#c9a06a" opacity={0.25 + open * 0.5} />
          )),
        )}
        <circle cx={0} cy={-120} r={220} fill="#fff7d6" opacity={0.4 * open} />
        {/* занавес — сдвигается в сторону */}
        <path d={`M -300 -360 L ${-300 + 600 * (1 - open * 0.7)} -360 Q ${-300 + 600 * (1 - open * 0.7) + 20} 0 ${-300 + 600 * (1 - open * 0.7)} 360 L -300 360 Z`} fill="#7a3b4a" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={i} d={`M ${-300 + i * 100 * (1 - open * 0.7)} -360 L ${-300 + i * 100 * (1 - open * 0.7) + wob(t, i, 6)} 360`} stroke="#5e2c39" strokeWidth={6} opacity={0.6} />
        ))}
        <rect x={-320} y={-380} width={640} height={30} rx={10} fill="#a9693f" stroke={OL} strokeWidth={4} />
      </g>
      {choice > 0 && open <= 0.05 && (
        <g transform={`translate(${x} 130) scale(${choice})`}>
          <Tag x={0} y={0} text="выбор — то, что у Аллаха · Абу Бакр заплакал" size={30} color="#fff4d0" />
        </g>
      )}
      {ansar > 0 && open <= 0.05 && (
        <g transform={`translate(${x} 900) scale(${ansar})`}>
          <Tag x={0} y={-60} text="«Поступайте с ансарами всегда по-доброму!»" size={30} color={C.goldSoft} />
        </g>
      )}
      {open > 0 && (
        <g opacity={open}>
          <Tag x={x} y={130} text="вторник, утренняя молитва" size={34} color="#fff4d0" />
        </g>
      )}
      <PageTag x={x} y={205} text="стр. 625–631" dark k={ramp(t, 0.6, 0.5)} />
    </g>
  );
};

// ─────────────── ночной фонарь: кончина, слова Абу Бакра, погребение ───────────────
export const Lamp: React.FC<VisualProps<{ text: string; page: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const k = ramp(t, 0.3, 2);
  const words = pop(t, at(c, 1.4));
  const verse = ramp(t, at(c, 2), 1);
  const ruler = ramp(t, at(c, 3), 1);
  const night = ramp(t, at(c, 4), 1.5);
  return (
    <g>
      <Sky mode="night" t={t} id="lamp" sunX={x + 480} sunY={200} moon stars={90} />
      <rect x={0} y={860} width={1920} height={220} fill="#151a33" />
      <g opacity={k}>
        <Lantern x={x} y={560} s={1.4} t={t} glow={0.6 + 0.4 * k - night * 0.3} />
      </g>
      {words > 0 && verse < 1 && (
        <g transform={`translate(${x} 200) scale(${words})`} opacity={1 - verse}>
          <Txt x={0} y={0} size={64} weight={700} family={SERIF} color="#fff4d0">
            {p.text}
          </Txt>
          <Txt x={0} y={52} size={26} weight={800} color="#c9d3ee">
            — Абу Бакр
          </Txt>
        </g>
      )}
      {verse > 0 && ruler < 1 && (
        <g opacity={verse * (1 - ruler)}>
          <Txt x={x} y={190} size={42} weight={700} family={SERIF} color="#fff4d0">
            «Мухаммад только лишь посланник…»
          </Txt>
          <Txt x={x} y={240} size={26} weight={800} color="#c9d3ee">
            Коран, 3:144 · стр. 633–634
          </Txt>
        </g>
      )}
      {ruler > 0 && night < 1 && (
        <g opacity={ruler * (1 - night)}>
          <Txt x={x} y={190} size={42} weight={700} family={SERIF} color="#fff4d0">
            «Я не самый лучший из вас…»
          </Txt>
          <Txt x={x} y={240} size={26} weight={800} color="#c9d3ee">
            Абу Бакр · стр. 643
          </Txt>
        </g>
      )}
      {night > 0 && (
        <g opacity={night}>
          <Txt x={x} y={200} size={40} weight={700} family={SERIF} color="#fff4d0">
            ночь на среду
          </Txt>
          <Txt x={x} y={248} size={26} weight={800} color="#c9d3ee">
            стр. 645–646
          </Txt>
        </g>
      )}
      <PageTag x={x} y={300} text={p.page} dark k={k * (1 - verse)} />
    </g>
  );
};

// ─────────────── итог: уроки книги ───────────────
type RecapItem = { icon: string; text: string; sub: string; at: number };
export const Recap: React.FC<VisualProps<{ items: RecapItem[] }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const title = pop(t, 0.2);
  return (
    <g>
      <g transform={`translate(${x} 150) scale(${title})`}>
        <Txt x={0} y={0} size={60} weight={900} family={HEAVY} color={C.ink}>
          Что оставляет нам эта книга
        </Txt>
      </g>
      {p.items.map((it, i) => {
        const k = pop(t, at(c, it.at));
        const y = 270 + i * 118;
        return (
          <g key={i} transform={`translate(${x - 380} ${y}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-60} y={-50} w={820} h={100} fill="#fffaf0" r={50} />
            <Icon name={it.icon} r={44} t={t} color={[C.goldSoft, C.tealSoft, "#ffd0c2", "#d9f0c8", "#e6dcff"][i % 5]} />
            <Txt x={70} y={10} size={40} weight={900} anchor="start">
              {it.text}
            </Txt>
            <Txt x={740} y={10} size={24} weight={700} anchor="end" color={C.inkSoft}>
              {it.sub}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── финал ───────────────
export const Finale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = pop(t, 0.2);
  const logo = pop(t, at(c, 2));
  return (
    <g>
      <Sky mode="night" t={t} id="finale" sunX={1500} sunY={200} stars={120} />
      {Array.from({ length: 240 }).map((_, i) => {
        const px = ((i * 197) % 1900) + 10;
        const py = 760 + ((i * 71) % 300);
        return <circle key={i} cx={px} cy={py} r={2.5 + (i % 3)} fill="#ffe08a" opacity={(0.4 + 0.4 * Math.sin(t * 2 + i)) * k} />;
      })}
      <g transform={`translate(${x} 470) scale(${k})`}>
        <Txt x={0} y={0} size={50} weight={700} family={SERIF} color="#fff4d0">
          {"Ибн Хишам\n«Жизнеописание Пророка Мухаммада»"}
        </Txt>
        <Txt x={0} y={110} size={28} weight={800} color="#c9d3ee">
          перевод Н. А. Гайнуллина · «Умма», 2007 · 656 страниц
        </Txt>
        <Star8 x={-560} y={-14} r={18} fill={C.gold} rot={t * 20} />
        <Star8 x={560} y={-14} r={18} fill={C.gold} rot={-t * 20} />
      </g>
      {logo > 0 && (
        <g transform={`translate(${x} 300) scale(${logo})`}>
          <text x={0} y={-40} textAnchor="middle" fontFamily="Rubik, sans-serif" fontWeight={900} fontSize={70}>
            <tspan fill="#ffffff">{BRAND.wordmark[0]}</tspan>
            <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
          </text>
        </g>
      )}
      {logo > 0 && (
        <g opacity={logo}>
          <Txt x={x} y={700} size={36} weight={800} color={C.goldSoft}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
    </g>
  );
};

export { OL };
