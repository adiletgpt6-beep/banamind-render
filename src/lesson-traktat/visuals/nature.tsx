// Дорога третья «Так потребовала природа»: солнце в осколках, горшок и фабрики,
// солдат и правитель, сосновая семечка, дворец с книжкой, войско и «нити»,
// природа — рисунок, а не художник; открытая четвёртая дорога.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { Book, Bubble, Drop, Factory, Fly, Flower, OL, Palace, Person, Seed, Shard, Soldier, Sun, Tree } from "./draw";
import { Crossroads, zoneX } from "./intro";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const Ground: React.FC<{ y?: number; color?: string }> = ({ y = 800, color = "#cfe9b5" }) => <path d={`M 0 ${y} Q 480 ${y - 30} 960 ${y} T 1920 ${y} L 1920 1080 L 0 1080 Z`} fill={color} />;

export const Suns: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const items = Array.from({ length: 8 }).map((_, i) => ({ x: x - 420 + i * 120, y: 760 + (i % 2) * 40, drop: i % 2 === 0 }));
  const glint = ramp(t, at(c, 1), 1);
  const absurd = ramp(t, at(c, 3), 1.2) * (1 - ramp(t, at(c, 7) - 0.3, 0.4));
  const rays = ramp(t, at(c, 7), 1.2);
  const flyK = pop(t, at(c, 5));
  return (
    <g>
      <Ground y={720} color="#e6f2d8" />
      <Sun x={x + 330} y={210} r={80} t={t} />
      {/* лучи от одного солнца ко всем каплям и к морю */}
      {rays > 0 &&
        items.map((it, i) => <line key={i} x1={x + 330} y1={210} x2={x + 330 + (it.x - x - 330) * rays} y2={210 + (it.y - 210) * rays} stroke={C.yellowDeep} strokeWidth={4} opacity={0.55} strokeDasharray="12 10" />)}
      {items.map((it, i) =>
        it.drop ? <Drop key={i} x={it.x} y={it.y} s={1.1} glint={glint * (1 - absurd * 0.7)} /> : <Shard key={i} x={it.x} y={it.y} s={1.3} rot={i * 25} glint={glint * (1 - absurd * 0.7)} />,
      )}
      {/* «своё солнце» в каждом осколке */}
      {absurd > 0 &&
        items.map((it, i) => (
          <g key={i} transform={`translate(${it.x} ${it.y - 110 - wob(t * 2, i, 8)}) scale(${absurd * 0.45})`} opacity={absurd}>
            <Sun x={0} y={0} r={70} t={t + i} />
          </g>
        ))}
      <g opacity={1 - ramp(t, at(c, 5) - 0.3, 0.3)}>
        <Pop t={t} at={at(c, 3.5)} x={x - 80} y={440}>
          <Tag x={0} y={0} text="солнце в каждом осколке?!" size={36} color={C.white} />
        </Pop>
      </g>
      <Cross x={x - 80} y={440} s={130} k={ramp(t, at(c, 4.6), 0.5) * (1 - ramp(t, at(c, 5) - 0.2, 0.3))} />
      {/* мошка со «всемогущей природой» внутри */}
      {flyK > 0 && (
        <g opacity={1 - ramp(t, at(c, 7) - 0.3, 0.4)} transform={`translate(${x - 300} 360) scale(${flyK})`}>
          <circle r={130} fill="#fff" stroke={OL} strokeWidth={6} />
          <Fly x={0} y={10} s={1.5} t={t} />
          <Tag x={0} y={175} text="внутри — своя «всемогущая природа»?" size={28} color="#ffd6d6" />
          <Cross x={0} y={0} s={150} k={ramp(t, at(c, 6), 0.6)} />
        </g>
      )}
      <Pop t={t} at={at(c, 7.3)} x={x - 200} y={360}>
        <g>
          <Tag x={0} y={0} text="одно солнце — легко везде" size={38} color={C.yellow} />
          <Check x={290} y={-6} s={40} k={ramp(t, at(c, 7.6), 0.5)} />
        </g>
      </Pop>
      <g opacity={ramp(t, at(c, 7.5), 0.6)}>
        <path d={`M ${x + 120} 1080 Q ${x + 300} 850 ${x + 520} 860 L ${x + 700} 1080 Z`} fill="#8fd0f5" opacity={0.7} />
      </g>
      <Pop t={t} at={at(c, 9)} x={x - 200} y={560}>
        <Tag x={0} y={0} text="а в мухе — целая Вселенная? нет!" size={32} color="#ffd6d6" />
      </Pop>
    </g>
  );
};

export const FlowerPot: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const grow = ramp(t, at(c, 1), 2);
  const factories = ramp(t, at(c, 4), 2.2);
  const colors = [C.coral, "#9bb8ff", C.yellowDeep, C.violet, "#ff8fd1"];
  return (
    <g>
      {/* семена падают */}
      {[0, 1, 2, 3, 4].map((i) => {
        const k = ramp(t, 0.3 + i * 0.25, 0.7);
        return k < 1 ? <Seed key={i} x={x - 160 + i * 80} y={interpolate(k, [0, 1], [200, 600])} s={1} /> : null;
      })}
      {/* цветы */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${x - 160 + i * 80} 620) scale(${grow})`}>
          <Flower x={0} y={0} color={colors[i]} kind={i % 3} s={1} stem={120 + (i % 3) * 50} t={t} />
        </g>
      ))}
      {/* горшок (полупрозрачный, когда внутри «фабрики») */}
      <g transform={`translate(${x} 700)`}>
        <path d="M -260 -80 L 260 -80 L 220 160 L -220 160 Z" fill="#d9825b" stroke={OL} strokeWidth={6} opacity={1 - factories * 0.55} />
        <rect x={-280} y={-110} width={560} height={50} rx={12} fill="#c96f45" stroke={OL} strokeWidth={6} />
        <ellipse cx={0} cy={-84} rx={250} ry={18} fill="#6b4a1e" />
        {factories > 0 &&
          Array.from({ length: 12 }).map((_, i) => {
            const k = clamp01(factories * 12 - i);
            return <Factory key={i} x={-180 + (i % 6) * 72} y={10 + Math.floor(i / 6) * 90} s={0.48 * k} t={t + i} />;
          })}
      </g>
      {/* простые вещества */}
      {["H", "O", "C", "N"].map((e, i) => (
        <Pop key={e} t={t} at={at(c, 2) + i * 0.3} x={x - 390 + (i % 2) * 0} y={250 + i * 105}>
          <g>
            <circle r={40} fill={["#cfe8ff", "#ffd6d6", "#e5e7eb", "#e0f7e9"][i]} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={40} weight={900}>
              {e}
            </Txt>
          </g>
        </Pop>
      ))}
      {["воздух", "вода", "тепло", "свет"].map((w, i) => (
        <Pop key={w} t={t} at={at(c, 3) + i * 0.3} x={x + 400} y={250 + i * 105}>
          <Tag x={0} y={0} text={w} size={32} color={C.white} />
        </Pop>
      ))}
      <Pop t={t} at={at(c, 4.4)} x={x} y={170}>
        <Tag x={0} y={0} text="фабрик — как во всей Европе?!" size={40} color={C.yellow} />
      </Pop>
      <Cross x={x} y={760} s={180} k={ramp(t, at(c, 6), 0.6)} />
    </g>
  );
};

const Castle: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-140} width={240} height={140} fill="#e9e4f7" stroke={OL} strokeWidth={5} />
    {[-120, -40, 40].map((dx) => (
      <rect key={dx} x={dx} y={-170} width={80} height={30} fill="#e9e4f7" stroke={OL} strokeWidth={5} />
    ))}
    <rect x={-30} y={-70} width={60} height={70} rx={30} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
    <path d="M -40 -200 L -40 -240 L -20 -220 L 0 -250 L 20 -220 L 40 -240 L 40 -200 Z" fill={C.yellow} stroke={OL} strokeWidth={4} />
  </g>
);

export const SoldierScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const link = ramp(t, at(c, 1), 1);
  const cut = ramp(t, at(c, 6), 0.6);
  const pack = ramp(t, at(c, 6.4), 1);
  const sx = x + 280;
  const sy = 760;
  return (
    <g>
      <Pop t={t} at={0.3} x={x - 330} y={600}>
        <Castle x={0} y={0} s={1.3} />
      </Pop>
      <Pop t={t} at={at(c, 0.6)} x={x - 330} y={680}>
        <Tag x={0} y={0} text="правитель: казна и войско" size={28} color={C.white} />
      </Pop>
      {/* золотая связь */}
      {link > 0 && (
        <g>
          <path d={`M ${x - 180} ${470} Q ${x} ${330 - wob(t, 1, 10)} ${x + (sx - x) * (cut > 0 ? 0.45 : 1) * link} ${cut > 0 ? 420 + cut * 80 : 600}`} stroke={C.yellowDeep} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={cut > 0 ? "20 14" : undefined} opacity={1 - cut * 0.5} />
          {cut <= 0 &&
            [0, 1, 2].map((i) => {
              const k = ((t * 0.5 + i / 3) % 1) * link;
              const px = interpolate(k, [0, 1], [x - 180, sx]);
              const py = interpolate(k, [0, 0.5, 1], [470, 360, 600]);
              return <rect key={i} x={px - 18} y={py - 16} width={36} height={30} rx={6} fill="#c98b4a" stroke={OL} strokeWidth={3} />;
            })}
        </g>
      )}
      {/* солдат */}
      <g transform={`translate(${sx} ${sy + pack * 18})`}>
        {pack > 0 && (
          <g transform={`translate(${-40 - pack * 30} ${-150 + pack * 10}) scale(${0.4 + pack * 1.1})`}>
            <rect x={-60} y={-80} width={120} height={140} rx={20} fill="#8a6a3a" stroke={OL} strokeWidth={4} />
            <rect x={-40} y={-110} width={80} height={40} rx={10} fill="#6b4a1e" stroke={OL} strokeWidth={4} />
          </g>
        )}
        <g transform={`rotate(${pack * 12})`}>
          <Soldier x={0} y={0} s={1.9} t={t} />
        </g>
        {cut <= 0 && (
          <g transform="translate(60 -230)">
            <rect x={0} y={-50} width={8} height={160} fill="#6b4a1e" />
            <path d={`M 8 -50 L ${80 + wob(t * 3, 1, 6)} -30 L 8 -10 Z`} fill={C.coral} stroke={OL} strokeWidth={3} />
          </g>
        )}
      </g>
      <g opacity={1 - cut}>
        <Pop t={t} at={at(c, 2)} x={sx} y={290}>
          <Tag x={0} y={0} text="сила × 100 000" size={42} color={C.yellow} />
        </Pop>
      </g>
      {/* муравей и муха — большие дела благодаря связи */}
      <Pop t={t} at={at(c, 5)} x={x} y={880}>
        <g opacity={1 - cut}>
          <Fly x={-90} y={0} s={0.6} t={t} />
          <g transform="translate(60 10)">
            <ellipse cx={-26} cy={0} rx={18} ry={14} fill={OL} />
            <ellipse cx={4} cy={0} rx={14} ry={11} fill={OL} />
            <ellipse cx={30} cy={-2} rx={12} ry={10} fill={OL} />
            <path d="M -20 8 l -12 18 M 0 8 l 0 20 M 20 8 l 12 18" stroke={OL} strokeWidth={4} />
          </g>
        </g>
      </Pop>
      {/* обрыв */}
      {cut > 0 && (
        <g transform={`translate(${x + 30} 420)`} opacity={cut}>
          <path d="M -30 -30 L 30 30 M 30 -30 L -30 30" stroke={C.red} strokeWidth={12} strokeLinecap="round" />
        </g>
      )}
      <Pop t={t} at={at(c, 7)} x={sx} y={300}>
        <Tag x={0} y={0} text="только свои маленькие силы" size={32} color="#ffd6d6" />
      </Pop>
      <Pop t={t} at={at(c, 8)} x={x} y={170}>
        <g>
          <Panel x={-470} y={-70} w={940} h={120} fill="#fff" />
          <Txt x={-230} y={10} size={34} color={C.greenDeep}>
            с Творцом — легко
          </Txt>
          <Txt x={230} y={10} size={34} color={C.red}>
            без Него — невозможно
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

export const PineSeed: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const grow = ramp(t, at(c, 1), 2.6);
  const plan = ramp(t, at(c, 2), 0.8);
  const squeeze = ramp(t, at(c, 4), 1.6);
  const show2 = ramp(t, at(c, 6) - 0.3, 0.4);
  return (
    <g>
      <g opacity={1 - show2}>
        <Ground y={820} color="#d7ecc0" />
        <g transform={`translate(${x - 120} 820)`}>
          <Tree x={0} y={0} s={1.15} pine grow={grow * (1 - squeeze * 0.9)} />
        </g>
        <Pop t={t} at={0.3} x={x + 300} y={520}>
          <g>
            <circle r={130} fill="#fff" stroke={OL} strokeWidth={6} />
            <Seed x={0} y={0} s={3.4} />
            {plan > 0 && (
              <g opacity={plan * (1 - squeeze)} transform="translate(-10 40) scale(0.32)">
                <path d="M -120 -50 L 0 -170 L 120 -50 Z M -98 -120 L 0 -240 L 98 -120 Z M -76 -190 L 0 -310 L 76 -190 Z" fill="none" stroke="#2b6cb0" strokeWidth={10} strokeDasharray="20 14" />
              </g>
            )}
            {squeeze > 0 && (
              <g transform={`scale(${0.9 - squeeze * 0.5})`} opacity={squeeze}>
                <Tree x={0} y={60} s={0.5} pine />
              </g>
            )}
          </g>
        </Pop>
        <Pop t={t} at={at(c, 0.4)} x={x + 300} y={710}>
          <Tag x={0} y={0} text="как зёрнышко пшеницы" size={28} color={C.white} />
        </Pop>
        <Pop t={t} at={at(c, 2.3)} x={x + 300} y={300}>
          <Tag x={0} y={0} text="программа дерева" size={32} color={C.yellow} />
        </Pop>
        <Pop t={t} at={at(c, 4.6)} x={x + 60} y={180}>
          <Tag x={0} y={0} text="без связи — целое дерево внутри семечки?!" size={32} color="#ffd6d6" />
        </Pop>
        <Cross x={x + 300} y={520} s={150} k={ramp(t, at(c, 5.5), 0.6)} />
      </g>
      {show2 > 0 && (
        <g opacity={show2}>
          <Castle x={x - 300} y={640} s={1.1} />
          <path d={`M ${x - 180} 480 Q ${x} 360 ${x + 200} 560`} stroke={C.yellowDeep} strokeWidth={10} fill="none" />
          <Soldier x={x + 230} y={760} s={1.8} t={t} />
          <Pop t={t} at={at(c, 7)} x={x} y={880}>
            <Tag x={0} y={0} text="ответ: его поддерживают казна и войско" size={36} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// пустыня, дворец, путник и книжка с планом
export const PalaceBook: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const walk = ramp(t, at(c, 2), 2.5);
  const lookK = ramp(t, at(c, 3), 0.5);
  const bookK = pop(t, at(c, 4));
  const links = ramp(t, at(c, 5), 1);
  const idea = ramp(t, at(c, 6), 0.5);
  const board = ramp(t, at(c, 8), 0.6);
  const stars = ramp(t, at(c, 10), 1);
  const px = interpolate(walk, [0, 1], [x - 650, x - 330]);
  const things = [
    { dx: -120, label: "ваза" },
    { dx: 30, label: "лампа" },
    { dx: 180, label: "ковёр" },
  ];
  return (
    <g>
      <path d="M 0 760 Q 400 700 800 760 T 1920 740 L 1920 1080 L 0 1080 Z" fill="#f3d9a4" />
      <path d="M 0 820 Q 500 780 1000 830 T 1920 810 L 1920 1080 L 0 1080 Z" fill="#ebc987" />
      {stars > 0 &&
        Array.from({ length: 16 }).map((_, i) => (
          <circle key={i} cx={(i * 211) % 1920} cy={90 + ((i * 97) % 260)} r={4 + (i % 3) * 2} fill="#fff" opacity={stars * (0.5 + 0.5 * Math.sin(t * 3 + i))} />
        ))}
      <Pop t={t} at={at(c, 1)} x={x + 60} y={790}>
        <Palace x={0} y={0} s={1.25} />
      </Pop>
      {/* вещи во дворце */}
      {things.map((th, i) => (
        <Pop key={i} t={t} at={at(c, 3) + i * 0.25} x={x + 60 + th.dx} y={360}>
          <g>
            <circle r={44} fill="#fff" stroke={OL} strokeWidth={4} />
            {i === 0 && <path d="M -14 -24 L 14 -24 L 10 -12 Q 26 0 16 22 L -16 22 Q -26 0 -10 -12 Z" fill={C.violet} stroke={OL} strokeWidth={3} />}
            {i === 1 && <path d="M -20 10 L 20 10 L 10 -22 L -10 -22 Z M -4 10 L -4 24 L 4 24 L 4 10" fill={C.yellow} stroke={OL} strokeWidth={3} />}
            {i === 2 && <rect x={-26} y={-16} width={52} height={32} rx={4} fill={C.coral} stroke={OL} strokeWidth={3} />}
            <Txt x={0} y={78} size={26}>
              {th.label}
            </Txt>
            <Cross x={30} y={-30} s={36} k={ramp(t, at(c, 3.5) + i * 0.3, 0.4) * lookK} />
            <line x1={0} y1={44} x2={0} y2={44 + 300 * links} stroke={C.yellowDeep} strokeWidth={4} strokeDasharray="8 8" opacity={links} />
          </g>
        </Pop>
      ))}
      {/* книжка с планом */}
      {bookK > 0 && (
        <g transform={`translate(${x + 60} 640) scale(${bookK * 0.45}) rotate(${wob(t, 3, 2)})`}>
          <Book x={0} y={0} color={C.skyDeep} title={"план\nи правила"} />
        </g>
      )}
      <Person x={px} y={830} s={1.25} color="#d18b47" hat t={walk < 1 ? t * 3 : 0} />
      {idea > 0 && (
        <g opacity={idea}>
          <Bubble x={px - 60} y={420} w={420} h={130} tail={[px + 10, 650]} />
          <Txt x={px + 150} y={470} size={30}>
            {"«книжка построила\nдворец!»"}
          </Txt>
          <Cross x={px + 330} y={445} s={60} k={ramp(t, at(c, 7), 0.5)} />
        </g>
      )}
      <g opacity={1 - ramp(t, at(c, 9) - 0.3, 0.3)}>
        <Pop t={t} at={at(c, 7.3)} x={x + 360} y={180}>
          <Tag x={0} y={0} text="природа — как книга законов" size={34} color={C.yellow} />
        </Pop>
      </g>
      {board > 0 && (
        <g transform={`translate(${x + 560} 470)`} opacity={board * (1 - ramp(t, at(c, 9.5), 0.4))}>
          <rect x={-150} y={-100} width={300} height={200} rx={12} fill="#2f5d50" stroke="#8a5a2b" strokeWidth={12} />
          <path d={`M -110 -40 q 30 -20 60 0 t 60 0 t 60 0`} stroke="#fff" strokeWidth={6} fill="none" opacity={1 - ((t * 0.7) % 1)} />
          <path d="M -110 20 q 30 -20 60 0 t 60 0" stroke="#fff" strokeWidth={6} fill="none" opacity={(t * 0.7) % 1} />
          <rect x={-40 + Math.sin(t * 2) * 60} y={50} width={60} height={26} rx={6} fill="#f1c27d" />
          <Txt x={0} y={150} size={28}>
            доска сама не пишет
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 9)} x={x + 60} y={140}>
        <Tag x={0} y={0} text="у дворца есть Строитель" size={38} color={C.white} />
      </Pop>
    </g>
  );
};

const Worshipper: React.FC<{ x: number; y: number; pose: number; s?: number; color: string }> = ({ x, y, pose, s = 1, color }) => {
  // pose: 0 — стоит, 1 — поясной поклон, 2 — сидит
  const bow = Math.min(1, pose);
  const sit = Math.max(0, pose - 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`translate(0 ${sit * 30}) rotate(${-bow * 70 * (1 - sit)} 0 -20)`}>
        <rect x={-24} y={-90} width={48} height={70} rx={20} fill={color} stroke={OL} strokeWidth={3} />
        <circle cx={0} cy={-108} r={18} fill="#fff" stroke={OL} strokeWidth={3} />
      </g>
      <path d="M -12 -20 L -14 10 M 12 -20 L 14 10" stroke={OL} strokeWidth={7} strokeLinecap="round" opacity={1 - sit} />
    </g>
  );
};

export const ArmyThreads: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const army = 1 - ramp(t, at(c, 3) - 0.3, 0.4);
  const threads1 = ramp(t, at(c, 2), 0.8);
  const mosque = ramp(t, at(c, 3), 0.6);
  const threads2 = ramp(t, at(c, 5), 0.6) * (1 - ramp(t, at(c, 5.5), 0.6));
  const order = ramp(t, at(c, 5.6), 0.6);
  // синхронные движения: встать/присесть
  const cmd = (Math.sin(t * 1.6) + 1) / 2;
  const wpose = (() => {
    const ph = (t * 0.35) % 3;
    return ph < 1 ? 0 : ph < 1.3 ? (ph - 1) / 0.3 : ph < 2 ? 1 : ph < 2.3 ? 1 + (ph - 2) / 0.3 : 2 - (ph - 2.3) / 0.7 * 2;
  })();
  return (
    <g>
      {army > 0 && (
        <g opacity={army}>
          <Ground y={800} color="#d9e8c4" />
          <g transform={`translate(${x - 560} 640)`}>
            <Soldier x={0} y={0} s={1.7} color="#2a4aa0" />
            <g transform="translate(46 -200)">
              <rect x={0} y={0} width={8} height={150} fill="#6b4a1e" />
              <path d={`M 8 0 L 70 ${10 + wob(t * 4, 1, 4)} L 8 34 Z`} fill={C.red} stroke={OL} strokeWidth={3} />
            </g>
          </g>
          {Array.from({ length: 18 }).map((_, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const sx = x - 260 + col * 120 + row * 30;
            const sy = 560 + row * 110;
            return (
              <g key={i}>
                {threads1 > 0 && <line x1={sx} y1={0} x2={sx} y2={(sy - 150) * threads1} stroke="#9aa5b8" strokeWidth={2} strokeDasharray="6 6" />}
                <Soldier x={sx} y={sy} s={1.05} squat={cmd} />
              </g>
            );
          })}
          <Pop t={t} at={at(c, 1)} x={x - 560} y={330}>
            <Tag x={0} y={0} text="«Встать! Сесть!»" size={34} color={C.white} />
          </Pop>
          <Pop t={t} at={at(c, 2.4)} x={x + 220} y={200}>
            <Tag x={0} y={0} text="невидимые нити?" size={36} color="#ffd6d6" />
          </Pop>
        </g>
      )}
      {mosque > 0 && (
        <g opacity={mosque}>
          <g transform={`translate(${x} 560)`}>
            <rect x={-520} y={-160} width={1040} height={420} rx={20} fill="#f7f1ff" stroke={OL} strokeWidth={5} />
            <path d="M -200 -160 Q -200 -360 0 -380 Q 200 -360 200 -160 Z" fill="#b9e3d2" stroke={OL} strokeWidth={5} />
            <rect x={-560} y={-380} width={40} height={640} rx={10} fill="#e6dcf7" stroke={OL} strokeWidth={5} />
            <rect x={520} y={-380} width={40} height={640} rx={10} fill="#e6dcf7" stroke={OL} strokeWidth={5} />
            <path d="M -560 -380 L -540 -440 L -520 -380 Z M 520 -380 L 540 -440 L 560 -380 Z" fill="#b9e3d2" stroke={OL} strokeWidth={4} />
            <rect x={-480} y={210} width={960} height={40} fill="#c9a6e6" opacity={0.5} />
            <Worshipper x={0} y={-10} pose={wpose} s={1.1} color="#e9f7ef" />
            {Array.from({ length: 14 }).map((_, i) => {
              const col = i % 7;
              const row = Math.floor(i / 7);
              const wx = -420 + col * 130 + row * 65;
              const wy = 100 + row * 125;
              return (
                <g key={i}>
                  {threads2 > 0 && <line x1={wx} y1={-300} x2={wx} y2={-300 + (wy - 100 + 300) * threads2} stroke="#9aa5b8" strokeWidth={2} strokeDasharray="6 6" />}
                  <Worshipper x={wx} y={wy} pose={wpose} s={0.95} color={["#cfe8ff", "#ffe3c2", "#e0f7e9", "#ffd6e0"][i % 4]} />
                </g>
              );
            })}
          </g>
          <Pop t={t} at={at(c, 3.4)} x={x} y={130}>
            <Tag x={0} y={0} text="все вместе — за голосом имама" size={34} color={C.white} />
          </Pop>
          {order > 0 && (
            <g opacity={order}>
              <Tag x={x} y={940 - 70} text="не нити, а правила и порядок" size={36} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const ArtNotArtist: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const rows = [
    { b: 1, yes: "творение", no: "не Творец" },
    { b: 2, yes: "узор", no: "не художник" },
    { b: 3, yes: "законы", no: "не правитель" },
    { b: 4, yes: "лекало", no: "не чертёжник" },
  ];
  const ans = ramp(t, at(c, 6), 0.6);
  return (
    <g>
      <Pop t={t} at={0.3} x={x} y={150}>
        <Txt x={0} y={0} size={58} weight={900}>
          Природа — это…
        </Txt>
      </Pop>
      {rows.map((r, i) => {
        const k = pop(t, at(c, r.b));
        if (k <= 0) return null;
        const y = 290 + i * 140;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`} opacity={1 - ans * 0.9}>
            <rect x={-480} y={-55} width={440} height={100} rx={30} fill="#d8f5e1" stroke={OL} strokeWidth={4} />
            <Txt x={-260} y={12} size={44}>
              {r.yes}
            </Txt>
            <Check x={-80} y={-6} s={34} k={ramp(t, at(c, r.b) + 0.3, 0.4)} />
            <rect x={40} y={-55} width={440} height={100} rx={30} fill="#eef1f6" stroke="#9aa5b8" strokeWidth={4} strokeDasharray="10 8" />
            <Txt x={260} y={12} size={40} color={C.inkSoft} weight={700}>
              {r.no}
            </Txt>
          </g>
        );
      })}
      {ans > 0 && (
        <g transform={`translate(${x} 520) scale(${ans})`}>
          <rect x={-300} y={-220} width={600} height={420} rx={20} fill="#c98b4a" stroke={OL} strokeWidth={6} />
          <rect x={-260} y={-180} width={520} height={340} fill="#fffdf7" />
          <Flower x={-120} y={120} color={C.coral} s={1.2} t={t} />
          <Flower x={20} y={120} color="#9bb8ff" s={1.4} kind={1} t={t} />
          <Sun x={170} y={-90} r={40} t={t} />
          <Tag x={0} y={270} text="рисунок! а у рисунка есть художник" size={38} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const RoadOpen: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const roadsOut = ramp(t, at(c, 4) - 0.3, 0.4);
  const blocked = [0.1, 0.4, 0.7].map((f) => ramp(t, at(c, 1 + f), 0.5));
  const curtain = ramp(t, at(c, 7), 1.6);
  return (
    <g>
      <g opacity={1 - roadsOut}>
        <Crossroads t={t} cx={x} show={[1, 1, 1, 1]} blocked={blocked} open={ramp(t, at(c, 2), 0.8)} />
        <Pop t={t} at={at(c, 3)} x={x} y={170}>
          <Tag x={0} y={0} text="«Неужели вы сомневаетесь в Аллахе, Творце небес и земли?»" size={30} color={C.white} />
        </Pop>
      </g>
      {roadsOut > 0 && (
        <g opacity={roadsOut}>
          {/* дождь → цветы: порядок причин, и всё — творение */}
          <g transform={`translate(${x - 330} 420)`}>
            <ellipse rx={130} ry={70} fill="#e8eef5" stroke={OL} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={-80 + i * 40} y1={80 + ((t * 200 + i * 40) % 120)} x2={-90 + i * 40} y2={104 + ((t * 200 + i * 40) % 120)} stroke={C.skyDeep} strokeWidth={6} strokeLinecap="round" />
            ))}
          </g>
          <Arrow x1={x - 160} y1={460} x2={x + 120} y2={460} k={ramp(t, at(c, 6), 0.6)} color={C.green} />
          <g transform={`translate(${x + 330} 640)`}>
            <Flower x={-60} y={0} color={C.coral} s={1.2} t={t} />
            <Flower x={60} y={0} color={C.violet} s={1.4} kind={2} t={t} />
          </g>
          <Pop t={t} at={at(c, 4.4)} x={x} y={170}>
            <Tag x={0} y={0} text="и причины, и природа — тоже сотворены" size={34} color={C.yellow} />
          </Pop>
          {/* занавес */}
          {curtain > 0 && (
            <g>
              <rect x={x - 560} y={250} width={1120} height={560} fill="#fff7d6" opacity={curtain * 0.6} />
              <path d={`M ${x - 560} 240 L ${x - 560 + 560 * (1 - curtain * 0.8)} 240 Q ${x - 560 + 500 * (1 - curtain * 0.8)} 520 ${x - 560 + 560 * (1 - curtain * 0.8)} 820 L ${x - 560} 820 Z`} fill="#c0392b" stroke={OL} strokeWidth={5} />
              <path d={`M ${x + 560} 240 L ${x + 560 - 560 * (1 - curtain * 0.8)} 240 Q ${x + 560 - 500 * (1 - curtain * 0.8)} 520 ${x + 560 - 560 * (1 - curtain * 0.8)} 820 L ${x + 560} 820 Z`} fill="#c0392b" stroke={OL} strokeWidth={5} />
              <rect x={x - 580} y={220} width={1160} height={40} rx={10} fill="#8a1f1f" />
              <Pop t={t} at={at(c, 7.5)} x={x} y={880}>
                <Tag x={0} y={0} text="причины — занавес; за ним — дело Творца" size={34} color={C.white} />
              </Pop>
            </g>
          )}
        </g>
      )}
    </g>
  );
};
