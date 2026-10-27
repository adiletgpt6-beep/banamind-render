// Схемы группы b (главы 3–6): «мне хватает», весы риска, лестница без верха,
// бесценное, ледниковый период, столбики Баффета, восьмёрки, ровный путь,
// две задачи, выживание, гантель оптимизма, коллекционер картин, длинные хвосты.
import React from "react";
import { C, FONT } from "../theme";
import { Book, Bubble, Heart, OL, Person, Sun, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Tag, Txt, at, clamp01, pop, ramp, wob, zoneX, type VisualProps } from "./kit";
import { Coin, Key, LineChart, Newspaper, Scales, Shield, Wad } from "./props";

// ───────────── мелкие помощники ─────────────
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const prog = (t: number, a: number, b: number) => clamp01((t - a) / Math.max(0.001, b - a));

const starPath = (r: number) => {
  const p: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    p.push(`${i ? "L" : "M"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return p.join(" ") + " Z";
};
const Star: React.FC<{ x: number; y: number; r?: number; color?: string; rot?: number }> = ({ x, y, r = 30, color = C.gold, rot = 0 }) => (
  <path transform={`translate(${x} ${y}) rotate(${rot})`} d={starPath(r)} fill={color} stroke={OL} strokeWidth={3} strokeLinejoin="round" />
);

const Sparkle: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#fff" }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z" fill={color} stroke={C.gold} strokeWidth={3} />
);

// мешок денег; низ мешка — в (x, y)
const Sack: React.FC<{ x: number; y: number; s?: number; crack?: number; rot?: number }> = ({ x, y, s = 1, crack = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -62 0 Q -86 -72 -30 -102 L -42 -128 Q 0 -142 42 -128 L 30 -102 Q 86 -72 62 0 Z" fill="#d9b277" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -36 -104 Q 0 -96 36 -104" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
    <text y={-28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={C.moneyDeep}>
      $
    </text>
    {crack > 0 && <path d="M -20 -98 L -4 -70 L -26 -46 L 0 -22 L -12 0" fill="none" stroke={OL} strokeWidth={5} strokeDasharray={140} strokeDashoffset={140 * (1 - clamp01(crack))} />}
  </g>
);

const Cloud: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={0} rx={110} ry={46} fill="#fff" />
    <circle cx={-50} cy={-20} r={44} fill="#fff" />
    <circle cx={20} cy={-38} r={56} fill="#fff" />
    <circle cx={70} cy={-10} r={38} fill="#fff" />
  </g>
);

const MiniBanana: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t * 2) * 3})`}>
    <path d="M -44 -6 Q -40 -112 30 -140 Q 8 -86 22 -24 Q 26 12 -8 12 Q -46 12 -44 -6 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 30 -140 L 40 -152" stroke="#6b4a1e" strokeWidth={8} strokeLinecap="round" />
    <circle cx={-18} cy={-58} r={5} fill={OL} />
    <circle cx={2} cy={-60} r={5} fill={OL} />
    <path d="M -20 -42 Q -8 -32 4 -44" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

// ───────────── s14: «Мне хватает» ─────────────
export const EnoughParty: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const scene = pop(t, 0.1);
  const names = pop(t, at(c, 0.45));
  const joke = pop(t, at(c, 1.1)) * (1 - ramp(t, at(c, 2.1), 0.5));
  const reply = pop(t, at(c, 2.35));
  const calm = ramp(t, at(c, 2.1), 0.8);
  const wads = t < at(c, 0.3) ? 0 : 1 + Math.floor(prog(t, at(c, 0.3), at(c, 2.6)) * 6);
  const seg = (x0: number, u: number) => [x0 + 300 * u, 112 + 4 * 46 * u * (1 - u)];
  const bulbs = ["#ff7a6b", "#ffd23f", "#6cc5f0", "#3fb67c", "#ff8fb1", "#8e6cf0"];
  return (
    <g opacity={clamp01(scene * 1.5)}>
      {/* гирлянды */}
      {[100, 400, 700, 1000].map((x0) => (
        <path key={x0} d={`M ${x0} 112 Q ${x0 + 150} 204 ${x0 + 300} 112`} stroke={OL} strokeWidth={3} fill="none" />
      ))}
      {Array.from({ length: 24 }).map((_, i) => {
        const [bx, by] = seg(100 + Math.floor(i / 6) * 300, ((i % 6) + 0.5) / 6);
        return <ellipse key={i} cx={bx} cy={by + 12} rx={11} ry={15} fill={bulbs[i % 6]} stroke={OL} strokeWidth={2.5} opacity={0.55 + 0.45 * Math.sin(t * 4 + i * 1.3)} />;
      })}
      {/* бассейн */}
      <rect x={110} y={636} width={1180} height={36} rx={10} fill="#efe4cf" stroke={OL} strokeWidth={4} />
      <rect x={140} y={672} width={1120} height={150} rx={30} fill={C.sky} stroke="#e9f6ff" strokeWidth={14} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={Array.from({ length: 23 })
            .map((_, j) => `${j ? "L" : "M"} ${170 + j * 48} ${712 + i * 38 + Math.sin(t * 2.4 + j * 0.8 + i) * 6}`)
            .join(" ")}
          stroke="#fff"
          strokeWidth={5}
          fill="none"
          opacity={0.55}
          strokeLinecap="round"
        />
      ))}
      {/* богач со стопкой денег */}
      <rect x={400} y={548} width={180} height={18} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
      <rect x={480} y={566} width={20} height={70} fill={C.wood} stroke={OL} strokeWidth={4} />
      {Array.from({ length: wads }).map((_, i) => (
        <Wad key={i} x={490 + (i % 2) * 6} y={520 - i * 36} s={0.55} rot={(i % 3) - 1} />
      ))}
      <Worker x={280} y={600} s={1.45} role="boss" t={t} arms={0.4 + Math.sin(t * 5) * 0.15} mood={calm > 0.5 ? "flat" : "smile"} />
      <Wad x={280 + 62} y={470 + Math.sin(t * 5) * 6} s={0.42} rot={-12} />
      {/* писатели */}
      {calm > 0 && <circle cx={1040} cy={480} r={150} fill={C.yellow} opacity={0.3 * calm + 0.06 * Math.sin(t * 3)} />}
      <Person x={720} y={600} s={1.45} color={C.violet} t={t} arms={joke > 0.2 ? 0.7 : 0} />
      <Person x={1040} y={600} s={1.45} color={C.teal} t={t} skin="#f0c49a" />
      <Book x={1110} y={520} s={0.3} color={C.coral} />
      {names > 0 && (
        <g opacity={clamp01(names * 1.5)}>
          <Tag x={280} y={760} text="богач" size={36} color="#fff" />
          <Tag x={720} y={760} text="Воннегут" size={36} color="#fff" />
          <Tag x={1040} y={760} text="Хеллер" size={36} color="#fff" />
        </g>
      )}
      {/* шутка Воннегута */}
      {joke > 0.01 && (
        <g transform={`translate(${cx} 300) scale(${joke})`}>
          <Bubble x={0} y={0} w={660} h={170} />
          <Wad x={-200} y={-12} s={0.55} />
          <Txt x={-200} y={60} size={34}>
            за 1 день
          </Txt>
          <Txt x={0} y={30} size={96} color={C.coral}>
            {">"}
          </Txt>
          <Book x={200} y={-18} s={0.24} color={C.coral} />
          <Txt x={200} y={60} size={34}>
            за роман
          </Txt>
        </g>
      )}
      {/* ответ Хеллера */}
      {reply > 0.01 && (
        <g transform={`translate(900 300) scale(${reply}) rotate(${wob(t, 2, 1.2)})`}>
          <g transform="scale(-1 1)">
            <Bubble x={0} y={0} w={520} h={150} fill="#fffbe6" />
          </g>
          <Heart x={-205} y={6} s={0.6} />
          <Txt x={35} y={20} size={60} color={C.moneyDeep}>
            Мне хватает
          </Txt>
        </g>
      )}
      {calm > 0.3 &&
        [0, 1, 2].map((i) => {
          const ph = (t * 0.5 + i / 3) % 1;
          return <Heart key={i} x={1150 + i * 40 + Math.sin(t * 2 + i) * 14} y={560 - ph * 160} s={0.4} color={C.pink} />;
        })}
    </g>
  );
};

// ───────────── s15: весы риска ─────────────
export const RiskScales: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const card = pop(t, 0.15);
  const boss = pop(t, at(c, 0.55));
  const money = pop(t, at(c, 1.05));
  const dream = pop(t, at(c, 1.5));
  const bars = ramp(t, at(c, 2.25), 0.9);
  const scales = pop(t, at(c, 0.3));
  const bagIn = ramp(t, at(c, 1.55), 0.5);
  const shieldIn = ramp(t, at(c, 2.6), 0.5);
  const heartIn = ramp(t, at(c, 3.25), 0.5);
  const keyIn = ramp(t, at(c, 3.55), 0.5);
  const crack = ramp(t, at(c, 3.8), 0.6);
  const moral = pop(t, at(c, 3.15));
  const tilt = 0.7 * bagIn - 0.7 * shieldIn - 0.5 * heartIn - 0.4 * keyIn + wob(t, 1, 0.03);
  const drop = (k: number) => (1 - k) * -260;
  return (
    <g>
      {/* карточка героя */}
      {card > 0 && (
        <g opacity={clamp01(card * 1.5)}>
          <Panel x={650} y={140} w={380} h={590} />
          <Txt x={840} y={210} size={42}>
            Раджат Гупта
          </Txt>
          {boss > 0 && (
            <g transform={`translate(840 268) scale(${boss})`} opacity={1 - bars}>
              <Tag x={0} y={0} text="глава компании" size={34} color={C.sky} />
            </g>
          )}
          {dream > 0 && (
            <g transform={`translate(${840 + wob(t, 3, 3)} 365) scale(${dream})`} opacity={1 - bars}>
              <Bubble x={0} y={0} w={300} h={70} fill="#fffbe6" />
              <Txt x={0} y={12} size={34} color={C.moneyDeep}>
                хочу миллиард
              </Txt>
            </g>
          )}
          <Person x={840} y={610} s={1.25} color={C.orange} t={t} skin="#c98b5e" sad={bars > 0.5} />
          {money > 0 && (
            <g transform={`translate(840 680) scale(${money})`} opacity={1 - bars}>
              <Tag x={0} y={0} text="≈ 100 млн $" size={36} color={C.money} textColor="#fff" />
            </g>
          )}
          {bars > 0 && (
            <g>
              {/* решётка только вокруг фигуры: имя героя остаётся читаемым */}
              <rect x={650} y={250} width={380} height={480 * bars} rx={20} fill={C.navy} opacity={0.18} />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x={676 + i * 46} y={250} width={14} height={480 * bars} rx={7} fill="#5d6678" stroke={OL} strokeWidth={2} />
              ))}
              <rect x={650} y={250 + 480 * bars * 0.45} width={380} height={16} rx={8} fill="#5d6678" stroke={OL} strokeWidth={2} />
            </g>
          )}
        </g>
      )}
      {/* весы: нужное против ненужного */}
      {scales > 0 && (
        <g opacity={clamp01(scales * 1.5)}>
          <Scales
            x={1430}
            y={330}
            s={1.15}
            tilt={tilt}
            left={
              <g>
                {shieldIn > 0 && (
                  <g transform={`translate(-62 ${-62 + drop(shieldIn)})`}>
                    <Shield x={0} y={0} s={0.5} color={C.skyDeep} />
                  </g>
                )}
                {heartIn > 0 && <Heart x={10} y={-30 + drop(heartIn)} s={1.5} color={C.coral} />}
                {keyIn > 0 && <Key x={78} y={-40 + drop(keyIn)} s={0.42} rot={-70} />}
              </g>
            }
            right={
              bagIn > 0 ? (
                <g transform={`translate(0 ${drop(bagIn)})`}>
                  <Sack x={0} y={0} s={0.85} crack={crack} rot={crack * 8} />
                  {crack > 0.3 &&
                    [0, 1, 2, 3].map((i) => {
                      const k = clamp01((crack - 0.3) * 1.5 - i * 0.1);
                      return <Coin key={i} x={-30 + i * 22 + k * (i - 1.5) * 50} y={-30 + k * k * 260} s={0.4} spin={Math.cos(t * 6 + i)} />;
                    })}
                  <g opacity={1 - crack * 0.5}>
                    <Tag x={0} y={-150} text="ещё больше" size={32} color={C.gold} />
                  </g>
                </g>
              ) : null
            }
          />
          <Txt x={1165} y={655} size={36} color={C.greenDeep} opacity={ramp(t, at(c, 2.7), 0.5)}>
            нужное
          </Txt>
          <Txt x={1695} y={655} size={36} color={C.inkSoft} opacity={ramp(t, at(c, 2.7), 0.5)}>
            ненужное
          </Txt>
          {[
            { k: shieldIn, x: 1180, text: "репутация", col: C.sky },
            { k: heartIn, x: 1420, text: "семья", col: C.pink },
            { k: keyIn, x: 1640, text: "свобода", col: C.yellow },
          ].map((it) =>
            it.k > 0 ? (
              <g key={it.text} transform={`translate(${it.x} 740) scale(${it.k})`}>
                <Tag x={0} y={0} text={it.text} size={36} color={it.col} />
              </g>
            ) : null,
          )}
        </g>
      )}
      {moral > 0 && (
        <g transform={`translate(1430 120) scale(${moral})`}>
          <Txt x={0} y={0} size={46} color={C.ink}>
            {"Нужным не рискуют\nради ненужного"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ───────────── s16: лестница без верха ─────────────
export const EndlessLadder: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bars = pop(t, 0.2);
  const g0 = prog(t, at(c, 0.2), at(c, 1.6));
  const res = 60 + 150 * g0;
  const exp = 50 + 300 * Math.pow(g0, 1.3);
  const formula = pop(t, at(c, 1.1));
  const ladder = ramp(t, at(c, 0.6), 1.2);
  const climb = ramp(t, at(c, 2.05), 0.8);
  const fog = ramp(t, at(c, 3), 1);
  const bench = pop(t, at(c, 3.3));
  const steps = 8;
  const sx = (i: number) => 900 + i * 125;
  const sy = (i: number) => 800 - i * 96;
  const labels = ["$", "$$", "$$$", "$$$$", "$$$$$", "$$$$$$"];
  const people = [
    { i: 1, col: C.coral, tag: "новичок" },
    { i: 3, col: C.violet, tag: "звезда" },
    { i: 5, col: C.teal, tag: "ещё выше" },
  ];
  return (
    <g>
      {/* результат и ожидания */}
      {bars > 0 && (
        <g opacity={clamp01(bars * 1.5)} transform="translate(250 -40)">
          <rect x={150} y={680} width={460} height={8} rx={4} fill={C.inkSoft} />
          <rect x={200} y={680 - res} width={150} height={res} rx={14} fill={C.green} stroke={OL} strokeWidth={4} />
          <rect x={410} y={680 - exp} width={150} height={exp} rx={14} fill={C.coral} stroke={OL} strokeWidth={4} />
          <Txt x={275} y={668 - res} size={34} color={C.greenDeep}>
            результат
          </Txt>
          <Txt x={485} y={668 - exp} size={34} color={C.red}>
            ожидания
          </Txt>
        </g>
      )}
      {formula > 0 && (
        <g transform={`translate(560 165) scale(${formula})`}>
          <rect x={-450} y={-56} width={900} height={92} rx={46} fill="#fff" stroke={C.yellowDeep} strokeWidth={6} />
          <Txt x={0} y={8} size={44}>
            счастье = результат − ожидания
          </Txt>
        </g>
      )}
      {/* лестница уходит в облака */}
      <g opacity={ladder}>
        {Array.from({ length: steps }).map((_, i) => {
          const k = clamp01(ladder * steps - i);
          if (k <= 0) return null;
          return (
            <g key={i} opacity={i >= 6 ? 0.6 : 1} transform={`translate(0 ${(1 - k) * 30})`}>
              <rect x={sx(i)} y={sy(i)} width={130} height={34} rx={8} fill={i % 2 ? "#c99060" : C.wood} stroke={OL} strokeWidth={4} />
              <line x1={sx(i) + 65} y1={sy(i) + 34} x2={sx(i) + 65} y2={Math.min(830, sy(i) + 110)} stroke={OL} strokeWidth={4} opacity={0.4} />
              {i < labels.length && i % 2 === 0 && (
                <Txt x={sx(i) + 65} y={sy(i) + 80} size={34} color={C.moneyDeep}>
                  {labels[i]}
                </Txt>
              )}
            </g>
          );
        })}
        <Cloud x={1700 + wob(t, 1, 10)} y={130} s={1.3} op={0.75 + 0.25 * fog} />
        <Cloud x={1560 + wob(t, 2, 12)} y={70} s={1.0} op={0.6 + 0.4 * fog} />
        {fog > 0 && (
          <g opacity={fog}>
            <Cloud x={1480 + wob(t, 3, 10)} y={170} s={1.1} />
            <Txt x={1700} y={150} size={80} color={C.inkSoft} opacity={0.6 + 0.3 * Math.sin(t * 3)}>
              ?
            </Txt>
          </g>
        )}
      </g>
      {/* люди на ступенях смотрят вверх */}
      {people.map((p, n) => {
        const k = pop(t, at(c, 2.1 + n * 0.22));
        if (k <= 0) return null;
        const px = sx(p.i) + 70;
        const py = sy(p.i);
        return (
          <g key={p.tag} opacity={clamp01(k * 1.5)} transform={`translate(0 ${(1 - k) * -40})`}>
            <Person x={px} y={py - 30} s={0.8} color={p.col} t={t} arms={0.5} />
            <Arrow x1={px + 30} y1={py - 150} x2={px + 110} y2={py - 225} k={climb} color={C.yellowDeep} w={7} bend={0.1} />
            <Tag x={px - 130} y={py - 60} text={p.tag} size={34} color="#fff" />
          </g>
        );
      })}
      {/* вне гонки */}
      {bench > 0 && (
        <g transform={`translate(1640 790) scale(${bench})`}>
          <rect x={-110} y={-40} width={220} height={20} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
          <path d="M -90 -20 L -90 30 M 90 -20 L 90 30" stroke={OL} strokeWidth={8} strokeLinecap="round" />
          <MiniBanana x={-20} y={-40} s={0.75} t={t} />
          <g transform="translate(0 -200)">
            <Tag x={0} y={0} text="вне гонки" size={40} color={C.green} textColor="#fff" />
          </g>
        </g>
      )}
    </g>
  );
};

// ───────────── s17: бесценное ─────────────
export const Priceless: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bar = pop(t, 0.2);
  const line = ramp(t, at(c, 0.45), 0.7);
  const chase = ramp(t, at(c, 0.6), 0.6);
  const q = pop(t, at(c, 2.1));
  const items = [
    { label: "репутация", beat: 1.3, draw: <Shield x={0} y={0} s={0.62} color={C.skyDeep} /> },
    { label: "свобода", beat: 1.45, draw: <Key x={10} y={0} s={0.62} rot={-35} /> },
    {
      label: "семья\nи друзья",
      beat: 1.62,
      draw: (
        <g>
          <Person x={-36} y={60} s={0.62} color={C.coral} t={t} />
          <Person x={36} y={66} s={0.55} color={C.sky} t={t + 1} />
          <Heart x={0} y={-50} s={0.6} color={C.pink} />
        </g>
      ),
    },
    { label: "счастье", beat: 1.8, draw: <Sun x={0} y={0} r={52} t={t} /> },
  ];
  return (
    <g>
      {/* шкала: нужное | погоня */}
      {bar > 0 && (
        <g opacity={clamp01(bar * 1.5)}>
          <rect x={660} y={110} width={560} height={86} rx={43} fill={C.green} opacity={0.9} />
          <Txt x={940} y={168} size={42} color="#fff">
            нужное
          </Txt>
          <rect x={1240} y={110} width={580} height={86} rx={43} fill="#c7cdd8" opacity={chase} />
          <g opacity={chase}>
            <Txt x={1480} y={168} size={42} color={C.inkSoft}>
              погоня
            </Txt>
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${1640 + i * 50 + ((t * 40) % 50)} 134 l 22 19 l -22 19`} stroke={C.inkSoft} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
            ))}
          </g>
          <line x1={1230} y1={96} x2={1230} y2={96 + 140 * line} stroke={C.yellowDeep} strokeWidth={10} strokeLinecap="round" />
          {line > 0.9 && (
            <g transform={`translate(1230 262) scale(${pop(t, at(c, 0.75))})`}>
              <Tag x={0} y={0} text="достаточно" size={38} color={C.yellow} />
            </g>
          )}
        </g>
      )}
      {/* витрины «бесценно» */}
      {items.map((it, i) => {
        const k = pop(t, at(c, it.beat));
        if (k <= 0) return null;
        const x = 815 + i * 290;
        return (
          <g key={i} transform={`translate(${x} ${330 + (1 - k) * 40})`} opacity={clamp01(k * 1.5)}>
            <Panel x={-128} y={0} w={256} h={330} r={28} />
            <rect x={-104} y={24} width={208} height={190} rx={22} fill="#eaf6ff" stroke="#bcd7ee" strokeWidth={4} />
            <rect x={-82} y={36} width={16} height={150} rx={8} fill="#fff" opacity={0.7} />
            <g transform={`translate(0 ${118 + wob(t, i, 4)})`}>{it.draw}</g>
            <Txt x={0} y={it.label.includes("\n") ? 256 : 276} size={34}>
              {it.label}
            </Txt>
            <g transform={`translate(64 -6) rotate(${12 + wob(t, i + 2, 3)})`}>
              <path d="M -10 -30 L -10 0" stroke={OL} strokeWidth={3} />
              <rect x={-108} y={0} width={196} height={56} rx={10} fill={C.gold} stroke={OL} strokeWidth={3} />
              <Txt x={-10} y={40} size={34} color={C.ink}>
                бесценно
              </Txt>
            </g>
          </g>
        );
      })}
      {/* вопрос: одно предложение */}
      {q > 0 && (
        <g transform={`translate(1240 760) scale(${q})`}>
          <rect x={-520} y={-50} width={1040} height={100} rx={26} fill="#fffbe6" stroke={C.yellowDeep} strokeWidth={5} />
          <Txt x={-300} y={14} size={40}>
            Мне хватает — это…
          </Txt>
          <line x1={-60} y1={24} x2={-60 + 520 * ramp(t, at(c, 2.3), 2.5)} y2={24} stroke={C.inkSoft} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ───────────── s18: ледниковый период ─────────────
export const IceAge: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const land = pop(t, 0.1);
  const title = pop(t, 0.3) * (1 - ramp(t, at(c, 1), 0.5));
  const cards = ramp(t, at(c, 1.05), 0.5) * (1 - ramp(t, at(c, 2.05), 0.5));
  const winterX = ramp(t, at(c, 1.35), 0.6);
  const summerOk = ramp(t, at(c, 1.55), 0.6);
  const melt = prog(t, at(c, 1.5), at(c, 1.95));
  const years = prog(t, at(c, 2.05), at(c, 2.95));
  const rays = ramp(t, at(c, 2.45), 0.6);
  const formula = pop(t, at(c, 3.15));
  // высота ледника: остаток после лета, затем слой за слоем
  const base = lerp(70, 26, melt);
  const layers = years * 7;
  const H = t < at(c, 2.05) ? base : 26 + layers * 40 + Math.max(0, Math.sin((layers % 1) * Math.PI)) * 12;
  const Wd = 220 + Math.min(1, H / 300) * 760;
  const top = 720 - H;
  const shine = ramp(t, at(c, 3), 1);
  const winter = t < at(c, 1.5) || (t > at(c, 2.05) && (layers % 1) < 0.5);
  return (
    <g opacity={clamp01(land * 1.5)}>
      <Sun x={180} y={330} r={66} t={t} />
      {/* снег падает */}
      {winter &&
        Array.from({ length: 16 }).map((_, i) => {
          const fy = ((t * 70 + i * 97) % 520) + 230;
          const fx = 260 + ((i * 173) % 1000) + Math.sin(t * 2 + i) * 14;
          return <circle key={i} cx={fx} cy={fy} r={7} fill="#fff" stroke="#b9d6ea" strokeWidth={2} />;
        })}
      {/* земля */}
      <path d="M 100 720 L 1290 720 L 1290 830 L 100 830 Z" fill="#9fc98a" stroke={OL} strokeWidth={4} />
      <path d="M 100 720 Q 300 700 520 720 T 1290 718" fill="none" stroke="#7fae6b" strokeWidth={8} />
      {/* ледник */}
      <path d={`M ${cx - Wd / 2} 722 Q ${cx - Wd * 0.38} ${top} ${cx} ${top} Q ${cx + Wd * 0.38} ${top} ${cx + Wd / 2} 722 Z`} fill="#f4fbff" stroke={OL} strokeWidth={5} />
      {Array.from({ length: Math.floor(Math.max(0, H - 30) / 40) }).map((_, i) => {
        const ly = 720 - 30 - i * 40;
        const f = Math.max(0, (ly - top) / H);
        return <path key={i} d={`M ${cx - (Wd / 2) * Math.sqrt(f) * 0.92} ${ly} Q ${cx} ${ly - 10} ${cx + (Wd / 2) * Math.sqrt(f) * 0.92} ${ly}`} stroke="#b9d6ea" strokeWidth={4} fill="none" />;
      })}
      {shine > 0 && <Sparkle x={cx - Wd * 0.2} y={top + 50} s={shine * (0.8 + 0.3 * Math.sin(t * 4))} />}
      {shine > 0 && <Sparkle x={cx + Wd * 0.22} y={top + 90} s={shine * (0.8 + 0.3 * Math.sin(t * 4 + 2))} />}
      {t > at(c, 1.7) && t < at(c, 2.2) && (
        <g opacity={ramp(t, at(c, 1.7), 0.4) * (1 - ramp(t, at(c, 2.05), 0.3))}>
          <Arrow x1={cx + 230} y1={560} x2={cx + 70} y2={top + 6} k={1} color={C.skyDeep} w={8} />
          <Tag x={cx + 280} y={530} text="остаток" size={38} color="#fff" />
        </g>
      )}
      {/* лучи отражаются */}
      {rays > 0 &&
        [0, 1, 2].map((i) => {
          const hx = cx - 160 + i * 160;
          const hy = top + 20 + Math.abs(i - 1) * 30;
          return (
            <g key={i} opacity={rays * (0.7 + 0.3 * Math.sin(t * 4 + i))}>
              <line x1={240} y1={360} x2={hx} y2={hy} stroke={C.yellowDeep} strokeWidth={6} strokeDasharray="16 12" />
              <Arrow x1={hx} y1={hy} x2={hx + 120 + i * 30} y2={hy - 210} k={rays} color={C.orange} w={6} />
            </g>
          );
        })}
      {rays > 0 && (
        <g opacity={rays * (1 - formula)}>
          <Tag x={cx + 260} y={210} text="отражает солнце" size={36} color={C.yellow} />
        </g>
      )}
      {/* заголовок и карточки */}
      {title > 0.01 && (
        <g transform={`translate(${cx + 100} 200) scale(${title})`}>
          <Tag x={0} y={0} text="ледниковый период" size={48} color="#e6f4ff" />
        </g>
      )}
      {cards > 0 && (
        <g opacity={cards}>
          <Panel x={360} y={130} w={360} h={130} r={26} />
          <Txt x={540} y={212} size={40}>
            суровые зимы
          </Txt>
          <Cross x={680} y={150} s={50} k={winterX} />
          <Panel x={780} y={130} w={400} h={130} r={26} />
          <Txt x={980} y={212} size={40}>
            прохладное лето
          </Txt>
          <Check x={1150} y={150} s={50} k={summerOk} />
        </g>
      )}
      {/* формула */}
      {formula > 0 && (
        <g transform={`translate(${cx + 20} 160) scale(${formula})`}>
          <Tag x={-360} y={0} text="маленький остаток" size={34} color="#e6f4ff" />
          <Txt x={-142} y={14} size={48}>
            +
          </Txt>
          <Tag x={-40} y={0} text="время" size={34} color={C.yellow} />
          <Txt x={64} y={14} size={48}>
            =
          </Txt>
          <Tag x={290} y={0} text="огромный результат" size={34} color={C.green} textColor="#fff" />
        </g>
      )}
    </g>
  );
};

// ───────────── s19: столбики Баффета ─────────────
export const BuffettBars: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const intro = pop(t, 0.15) * (1 - ramp(t, at(c, 1), 0.6));
  const head = pop(t, at(c, 0.9));
  const ages = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 89];
  const bx = (a: number) => 720 + ((a - 10) / 79) * 1020;
  const share = (a: number) => (a <= 65 ? 0.0355 * Math.pow((a - 10) / 55, 3.2) : 0.0355 + 0.9645 * Math.pow((a - 65) / 24, 1.5));
  const grow = prog(t, at(c, 1.0), at(c, 1.45));
  const brace = pop(t, at(c, 1.5));
  const span = ramp(t, at(c, 2.05), 0.8);
  const win = ramp(t, at(c, 2.4), 0.6);
  const inset = pop(t, at(c, 2.55)) * (1 - ramp(t, at(c, 3.1), 0.4));
  const secret = pop(t, at(c, 3.25));
  const base = 720;
  const maxH = 380;
  return (
    <g>
      {/* вступление: известный инвестор, тысячи книг */}
      {intro > 0.01 && (
        <g opacity={clamp01(intro * 1.5)}>
          <Person x={980} y={640} s={1.8} color={C.navy} t={t} skin="#f1d2b8" />
          <Tag x={980} y={720} text="Уоррен Баффет" size={44} color="#fff" />
          {Array.from({ length: 3 }).map((_, col) =>
            Array.from({ length: 7 - col * 2 }).map((_, r) => (
              <rect
                key={`${col}-${r}`}
                x={1360 + col * 130 + (r % 2) * 8}
                y={680 - r * 44 - (1 - pop(t, 0.3 + col * 0.15 + r * 0.06)) * 60}
                width={120}
                height={40}
                rx={6}
                fill={[C.coral, C.sky, C.green, C.violet, C.orange, C.teal, C.pink][(r + col * 2) % 7]}
                stroke={OL}
                strokeWidth={3}
              />
            )),
          )}
          <Tag x={1500} y={300} text="тысячи книг" size={40} color={C.yellow} />
        </g>
      )}
      {/* шапка графика */}
      {head > 0 && (
        <g opacity={clamp01(head * 1.5)}>
          <Txt x={680} y={128} size={54} anchor="start">
            Уоррен Баффет
          </Txt>
          <Txt x={680} y={180} size={34} anchor="start" color={C.inkSoft} weight={700}>
            по данным книги (2020)
          </Txt>
          <line x1={690} y1={base} x2={1780} y2={base} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
          {[10, 30, 50, 65, 80].map((a) => (
            <Txt key={a} x={bx(a)} y={base + 46} size={34} color={a === 65 ? C.red : C.inkSoft}>
              {String(a)}
            </Txt>
          ))}
          <Txt x={1780} y={base + 46} size={30} anchor="end" color={C.inkSoft} weight={700}>
            лет
          </Txt>
        </g>
      )}
      {/* столбики */}
      {ages.map((a, i) => {
        const k = clamp01(grow * ages.length * 1.1 - i);
        if (k <= 0) return null;
        const h = Math.max(4, share(a) * maxH) * k;
        const dim = a >= 30 && a <= 60 ? 1 : 1 - win * 0.35;
        return <rect key={a} x={bx(a) - 22} y={base - h} width={44} height={h} rx={6} fill={a >= 65 ? C.gold : C.green} stroke={OL} strokeWidth={3} opacity={dim} />;
      })}
      {/* скобка: после 65 */}
      {brace > 0 && (
        <g opacity={clamp01(brace * 1.5) * (1 - win * 0.2)}>
          <path d={`M ${bx(65) - 20} ${base - maxH - 10} L ${bx(65) - 20} ${base - maxH - 34} L ${bx(89) + 22} ${base - maxH - 34} L ${bx(89) + 22} ${base - maxH - 10}`} stroke={C.red} strokeWidth={6} fill="none" strokeLinejoin="round" />
          <g transform={`translate(${(bx(65) + bx(89)) / 2 - 20} ${base - maxH - 112}) scale(${brace})`}>
            <Txt x={0} y={0} size={46} color={C.ink}>
              {"81,5 из 84,5 млрд $"}
            </Txt>
            <Txt x={0} y={44} size={38} color={C.red}>
              после 65 лет
            </Txt>
          </g>
        </g>
      )}
      {/* почти три четверти века */}
      {span > 0 && (
        <g opacity={span * (1 - win)}>
          <Arrow x1={bx(10)} y1={600} x2={bx(10) + (bx(89) - bx(10)) * 0.55 * span} y2={600} k={1} color={C.skyDeep} w={8} />
          <Tag x={bx(10) + 230} y={548} text="инвестирует с 10 лет" size={36} color="#fff" />
        </g>
      )}
      {/* если бы с 30 до 60 */}
      {win > 0 && (
        <g opacity={win}>
          <rect x={bx(30) - 34} y={base - 70} width={bx(60) - bx(30) + 68} height={84} rx={14} fill="none" stroke={C.coral} strokeWidth={6} strokeDasharray="18 12" />
          <Txt x={(bx(30) + bx(60)) / 2} y={base - 86} size={34} color={C.red}>
            с 30 до 60
          </Txt>
        </g>
      )}
      {inset > 0.01 && (
        <g transform={`translate(950 400) scale(${inset})`}>
          <Panel x={-250} y={-180} w={500} h={300} r={30} />
          <rect x={-170} y={-150} width={110} height={210} rx={10} fill={C.gold} stroke={OL} strokeWidth={4} />
          <rect x={60} y={56} width={110} height={4} rx={2} fill={C.coral} stroke={OL} strokeWidth={2} />
          <Txt x={-115} y={100} size={34}>
            было
          </Txt>
          <Txt x={115} y={100} size={34}>
            было бы
          </Txt>
          <Txt x={115} y={-60} size={44} color={C.red}>
            {"на 99,9%\nменьше"}
          </Txt>
        </g>
      )}
      {secret > 0 && (
        <g transform={`translate(1010 360) scale(${secret}) rotate(${wob(t, 1, 1.5)})`}>
          <Tag x={0} y={0} text="главный секрет — время" size={50} color={C.yellow} />
          <Star x={-372} y={-6} r={30} rot={t * 30} />
        </g>
      )}
    </g>
  );
};

// ───────────── s20: восемь плюс восемь / восемь на восемь ─────────────
const EightRow: React.FC<{ y: number; op: string; k: number; color: string; result: string; rk: number }> = ({ y, op, k, color, result, rk }) => (
  <g>
    <rect x={100} y={y - 50} width={1190} height={100} rx={50} fill="#fff" opacity={0.92 * clamp01(k * 3)} />
    {Array.from({ length: 9 }).map((_, i) => {
      const kk = clamp01(k * 9 - i);
      if (kk <= 0) return null;
      return (
        <g key={i} transform={`translate(${160 + i * 77} ${y}) scale(${kk})`}>
          <circle r={27} fill={color} stroke={OL} strokeWidth={3} />
          <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#fff">
            8
          </text>
          {i < 8 && (
            <text x={38.5} y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.inkSoft}>
              {op}
            </text>
          )}
        </g>
      );
    })}
    {rk > 0 && (
      <g transform={`translate(830 ${y}) scale(${rk})`}>
        <Txt x={0} y={18} size={54} anchor="start" color={color}>
          {`= ${result}`}
        </Txt>
      </g>
    )}
  </g>
);

export const Eights: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const chart = ramp(t, 0.2, 0.6) * (1 - ramp(t, at(c, 1), 0.5));
  const chartK = prog(t, at(c, 0.02), at(c, 0.6));
  const parts = 1 - ramp(t, at(c, 2), 0.5);
  const rowA = prog(t, at(c, 1.0), at(c, 1.2));
  const resA = pop(t, at(c, 1.2));
  const rowB = prog(t, at(c, 1.25), at(c, 1.45));
  const resB = pop(t, at(c, 1.45));
  const sumBar = prog(t, at(c, 1.0), at(c, 1.25));
  const tower = Math.pow(prog(t, at(c, 1.3), at(c, 1.75)), 2.2);
  const disks = ramp(t, at(c, 2.05), 0.5);
  const newDisk = pop(t, at(c, 2.38));
  const pts: [number, number][] = Array.from({ length: 21 }).map((_, i) => {
    const u = i / 20;
    return [u, (Math.exp(4.2 * u) - 1) / (Math.exp(4.2) - 1)];
  });
  return (
    <g>
      {/* прямая против кривой */}
      {chart > 0 && (
        <g opacity={chart}>
          <LineChart x={180} y={250} w={1040} h={500} pts={[[0, 0], [1, 0.42]]} k={chartK} color={C.skyDeep} width={10} />
          <LineChart x={180} y={250} w={1040} h={500} pts={pts} k={clamp01(chartK * 1.2 - 0.2)} color={C.coral} width={10} axis={false} />
          <Tag x={1060} y={480} text="как мы думаем" size={38} color={C.sky} />
          {chartK > 0.8 && <Tag x={1000} y={260} text="как растёт" size={38} color={C.coral} textColor="#fff" />}
        </g>
      )}
      {/* восьмёрки */}
      {t > at(c, 1) && parts > 0 && (
        <g opacity={parts}>
          {/* короткая лесенка сложения */}
          {Array.from({ length: Math.ceil(sumBar * 9) }).map((_, i) => (
            <rect key={i} x={360 + i * 36} y={770 - (i + 1) * 22} width={34} height={(i + 1) * 22} rx={4} fill={C.green} stroke={OL} strokeWidth={3} />
          ))}
          {sumBar > 0.95 && (
            <Txt x={520} y={530} size={52} color={C.greenDeep}>
              72
            </Txt>
          )}
          <Txt x={520} y={822} size={34} color={C.inkSoft} opacity={clamp01(sumBar * 3)}>
            сложение
          </Txt>
          {/* башня умножения уходит за кадр */}
          {tower > 0 && (
            <g>
              <rect x={880} y={770 - 1000 * tower} width={150} height={1000 * tower} fill={C.coral} stroke={OL} strokeWidth={4} />
              {Array.from({ length: Math.floor(tower * 22) }).map((_, i) => (
                <line key={i} x1={880} y1={770 - (i + 1) * 45} x2={1030} y2={770 - (i + 1) * 45} stroke={OL} strokeWidth={2} opacity={0.35} />
              ))}
              <Txt x={955} y={822} size={34} color={C.inkSoft}>
                умножение
              </Txt>
            </g>
          )}
          <EightRow y={180} op="+" k={rowA} color={C.green} result="72" rk={resA} />
          <EightRow y={300} op="×" k={rowB} color={C.coral} result="134 217 728" rk={resB} />
        </g>
      )}
      {/* жёсткие диски */}
      {disks > 0 && (
        <g opacity={disks}>
          <g transform={`translate(350 ${780 + (1 - disks) * 40})`}>
            <rect x={-150} y={-440} width={300} height={440} rx={18} fill="#c7cdd8" stroke={OL} strokeWidth={5} />
            <rect x={-115} y={-400} width={230} height={260} rx={14} fill="#eef3f8" stroke={OL} strokeWidth={4} />
            {Array.from({ length: 6 }).map((_, i) => (
              <ellipse key={i} cx={0} cy={-370 + i * 40} rx={90} ry={14} fill="#8aa0b8" stroke={OL} strokeWidth={2.5} />
            ))}
            <rect x={-28} y={-385} width={56} height={240} rx={8} fill="#5d6678" opacity={0.5} />
            {[-90, 0, 90].map((dx) => (
              <circle key={dx} cx={dx} cy={-90} r={12} fill={dx === 0 ? C.red : C.green} stroke={OL} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 5 + dx)} />
            ))}
          </g>
          <Tag x={350} y={290} text="1950-е" size={36} color="#fff" />
          <Txt x={350} y={225} size={56} color={C.inkSoft}>
            3,5 МБ
          </Txt>
          <Arrow x1={560} y1={560} x2={830} y2={560} k={ramp(t, at(c, 2.25), 0.6)} color={C.orange} w={12} />
          {newDisk > 0 && (
            <g transform={`translate(1040 ${560 + wob(t, 1, 5)}) scale(${newDisk})`}>
              <circle r={150} fill={C.yellow} opacity={0.25 + 0.08 * Math.sin(t * 3)} />
              <rect x={-110} y={-70} width={220} height={140} rx={18} fill={C.navy} stroke={OL} strokeWidth={5} />
              <rect x={-86} y={-46} width={120} height={14} rx={7} fill="#fff" opacity={0.5} />
              <circle cx={70} cy={40} r={10} fill={C.green} />
              <Txt x={0} y={-110} size={64} color={C.ink}>
                100 ТБ
              </Txt>
            </g>
          )}
          {newDisk > 0 && (
            <g transform={`translate(760 180) scale(${pop(t, at(c, 2.6))})`}>
              <Tag x={0} y={0} text="в десятки миллионов раз больше" size={38} color={C.orange} textColor="#fff" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ───────────── s21: заткнитесь и ждите ─────────────
const Turtle: React.FC<{ x: number; y: number; s?: number; t: number; walking: boolean }> = ({ x, y, s = 1, t, walking }) => {
  const w = walking ? Math.sin(t * 9) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-46, -16, 18, 48].map((lx, i) => (
        <ellipse key={lx} cx={lx + (i % 2 ? w : -w) * 8} cy={-6} rx={14} ry={18} fill="#7cc893" stroke={OL} strokeWidth={4} />
      ))}
      <ellipse cx={92 + w * 2} cy={-40} rx={26} ry={22} fill="#7cc893" stroke={OL} strokeWidth={4} />
      <circle cx={102 + w * 2} cy={-46} r={4.5} fill={OL} />
      <path d={`M ${96 + w * 2} -32 Q ${104 + w * 2} -26 ${112 + w * 2} -34`} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M -76 -10 Q -74 -96 0 -98 Q 74 -96 76 -10 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -40 -16 L -30 -60 L 0 -76 L 30 -60 L 40 -16 M -30 -60 L -60 -40 M 30 -60 L 60 -40 M 0 -76 L 0 -94" stroke={C.yellowDeep} strokeWidth={5} fill="none" strokeLinejoin="round" />
      <path d="M 50 -84 L 60 -96" stroke="#6b4a1e" strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

const Rocket: React.FC<{ x: number; y: number; rot: number; s?: number; flame: number; t: number }> = ({ x, y, rot, s = 1, flame, t }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {flame > 0 && <path d={`M -18 60 Q 0 ${110 + Math.sin(t * 30) * 14} 18 60 Z`} fill={C.orange} stroke={C.red} strokeWidth={4} opacity={flame} />}
    <path d="M -30 60 L -30 -30 Q 0 -100 30 -30 L 30 60 Z" fill="#fff" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 20 L -56 66 L -30 60 Z M 30 20 L 56 66 L 30 60 Z" fill={C.red} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={0} cy={-8} r={14} fill={C.sky} stroke={OL} strokeWidth={4} />
  </g>
);

export const SteadyPath: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const book = pop(t, 0.2);
  const bookTag = pop(t, at(c, 0.4));
  const ground = ramp(t, 0.3, 0.8);
  const launch = prog(t, at(c, 1.05), at(c, 1.4));
  const boom = prog(t, at(c, 1.42), at(c, 1.75));
  const steadyTag = pop(t, at(c, 1.55));
  const walk = prog(t, at(c, 0.5), at(c, 2));
  const climbP = prog(t, at(c, 2.08), at(c, 2.9));
  const steps = [
    { label: "знания", col: C.sky },
    { label: "здоровье", col: C.green },
    { label: "отношения", col: C.pink },
  ];
  const stX = (i: number) => 1260 + i * 190;
  const stY = (i: number) => 760 - (i + 1) * 70;
  // положение черепахи
  let tx = lerp(470, 1170, walk);
  let ty = 760;
  if (climbP > 0) {
    const seg = Math.min(2.999, climbP * 3);
    const i = Math.floor(seg);
    const f = seg - i;
    const x0 = i === 0 ? 1170 : stX(i - 1) + 95;
    const y0 = i === 0 ? 760 : stY(i - 1);
    tx = lerp(x0, stX(i) + 95, f);
    ty = lerp(y0, stY(i), Math.min(1, f * 1.6)) - Math.sin(Math.min(1, f * 1.6) * Math.PI) * 30;
  }
  // ракета
  const rx = lerp(720, 1150, launch);
  const ry = 700 - Math.sin(launch * Math.PI * 0.5) * 520;
  return (
    <g>
      {book > 0 && (
        <g transform={`translate(360 ${330 + wob(t, 0, 4)}) rotate(${-5 + wob(t, 1, 1)}) scale(${book})`}>
          <Book x={0} y={0} s={1} color={C.violet} title={"Заткнитесь\nи ждите"} />
        </g>
      )}
      {bookTag > 0 && (
        <g transform={`translate(360 560) scale(${bookTag})`}>
          <Tag x={0} y={0} text="«Заткнитесь и ждите»" size={36} color={C.yellow} />
        </g>
      )}
      {/* дорога */}
      <g opacity={ground}>
        <rect x={400} y={758} width={870} height={16} rx={8} fill={C.inkSoft} opacity={0.5} />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={420 + i * 60} y={790} width={30} height={8} rx={4} fill={C.inkSoft} opacity={0.3} />
        ))}
      </g>
      {/* ракета «рекорд» */}
      {launch > 0 && boom < 0.05 && (
        <g>
          <path d={`M 720 700 Q 760 300 ${rx} ${ry}`} stroke={C.coral} strokeWidth={5} strokeDasharray="12 12" fill="none" opacity={0.6} />
          <Rocket x={rx} y={ry} rot={launch * 40} s={1.1} flame={1} t={t} />
          <Tag x={rx - 160} y={ry + 20} text="рекорд" size={38} color={C.coral} textColor="#fff" />
        </g>
      )}
      {launch <= 0 && t > at(c, 0.9) && <Rocket x={720} y={700} rot={0} s={1.1} flame={0} t={t} />}
      {boom > 0.05 && (
        <g opacity={1 - ramp(t, at(c, 2), 0.6)}>
          <circle cx={1150} cy={180} r={30 + boom * 120} fill={C.orange} opacity={0.5 * (1 - boom)} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const px = 1150 + Math.cos(a) * 160 * boom;
            const py = 180 + Math.sin(a) * 80 * boom + boom * boom * 560;
            return <rect key={i} x={px - 16} y={py - 10} width={32} height={20} rx={4} fill={i % 2 ? "#fff" : C.red} stroke={OL} strokeWidth={3} transform={`rotate(${boom * 400 + i * 60} ${px} ${py})`} />;
          })}
          <g transform={`translate(1150 ${lerp(200, 700, boom)}) rotate(${boom * 20})`} opacity={1 - boom * 0.3}>
            <Tag x={0} y={0} text="рекорд" size={38} color="#c7cdd8" />
            <Cross x={0} y={-6} s={70} k={ramp(boom, 0.4, 0.4)} />
          </g>
        </g>
      )}
      {/* ступени маленьких шагов */}
      {steps.map((s, i) => {
        const k = pop(t, at(c, 2.05 + i * 0.25));
        if (k <= 0) return null;
        return (
          <g key={s.label} transform={`translate(0 ${(1 - k) * 40})`} opacity={clamp01(k * 1.5)}>
            <rect x={stX(i)} y={stY(i)} width={190} height={760 - stY(i) + 14} rx={10} fill={s.col} stroke={OL} strokeWidth={4} />
            <Tag x={stX(i) + 95} y={stY(i) - 190} text={s.label} size={34} color="#fff" />
          </g>
        );
      })}
      <Turtle x={tx} y={ty} s={0.9} t={t} walking={walk > 0 && (walk < 1 || (climbP > 0 && climbP < 1))} />
      {steadyTag > 0 && climbP < 0.05 && (
        <g transform={`translate(${tx} ${ty - 150}) scale(${steadyTag * (1 - ramp(t, at(c, 2), 0.4))})`}>
          <Tag x={0} y={0} text="ровный шаг" size={38} color={C.green} textColor="#fff" />
        </g>
      )}
      {climbP >= 1 && <Star x={stX(2) + 160} y={stY(2) - 60} r={30} rot={t * 40} />}
    </g>
  );
};

// ───────────── s22: заработать и сохранить ─────────────
export const TwoTasks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const mtn = pop(t, 0.1);
  const earn = pop(t, at(c, 0.25));
  const keep = pop(t, at(c, 0.6));
  const man = ramp(t, at(c, 1), 0.4);
  const climb = prog(t, at(c, 1.1), at(c, 1.95));
  const paper = pop(t, at(c, 1.5));
  const debt = pop(t, at(c, 2.3));
  const sway = ramp(t, at(c, 2.2), 0.3) * (1 - ramp(t, at(c, 2.55), 0.1));
  const fall = prog(t, at(c, 2.55), at(c, 2.95));
  const virt = at(c, 3);
  const path: [number, number][] = [
    [730, 795],
    [1120, 730],
    [860, 620],
    [1190, 520],
    [960, 420],
    [1120, 325],
  ];
  const d = path.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  // положение по тропе
  const segs = path.length - 1;
  const u = Math.min(segs - 0.001, climb * segs);
  const si = Math.floor(u);
  const f = u - si;
  let px = lerp(path[si][0], path[si + 1][0], f);
  let py = lerp(path[si][1], path[si + 1][1], f);
  let rot = Math.sin(t * 9) * 14 * sway;
  if (fall > 0) {
    px = lerp(1180, 1580, fall);
    py = 325 + (800 - 325) * fall * fall - Math.sin(fall * Math.PI) * 60;
    rot = fall * 100;
  }
  const bag = 0.3 + climb * 0.22;
  return (
    <g>
      {/* гора */}
      <g opacity={clamp01(mtn * 1.5)}>
        <path d="M 660 810 L 1060 215 L 1160 215 L 1500 810 Z" fill="#a9b9e0" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <path d="M 1060 215 L 1160 215 L 1186 260 L 1150 250 L 1120 275 L 1090 250 L 1036 252 Z" fill="#fff" stroke={OL} strokeWidth={3} strokeLinejoin="round" />
        <path d={d} stroke="#fff" strokeWidth={14} fill="none" strokeDasharray="22 14" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
        <rect x={1046} y={207} width={128} height={14} rx={6} fill={C.wood} stroke={OL} strokeWidth={3} />
      </g>
      {earn > 0 && (
        <g transform={`translate(760 560) scale(${earn})`}>
          <Tag x={0} y={0} text="заработать" size={40} color={C.yellow} />
        </g>
      )}
      {keep > 0 && (
        <g transform={`translate(1110 140) scale(${keep})`}>
          <Tag x={0} y={0} text="сохранить" size={44} color={C.green} textColor="#fff" />
        </g>
      )}
      {/* Ливермор */}
      {paper > 0 && (
        <g transform={`translate(800 ${300 + wob(t, 1, 3)}) scale(${paper * 0.55}) rotate(-6)`}>
          <Newspaper x={0} y={0} head="КРАХ 1929" sub="биржа рухнула" />
        </g>
      )}
      {man > 0 && (
        <g opacity={man}>
          <Tag x={800} y={440} text="Джесси Ливермор" size={36} color="#fff" />
        </g>
      )}
      {debt > 0 && (
        <g transform={`translate(1180 ${335}) scale(${debt})`}>
          <rect x={-10} y={-8} width={110} height={26} rx={6} fill="#d9774f" stroke={OL} strokeWidth={4} transform={`rotate(${fall * 25})`} />
          <Tag x={150} y={-30} text="долги" size={36} color={C.red} textColor="#fff" />
        </g>
      )}
      {man > 0 && (
        <g transform={`translate(${px} ${py}) rotate(${rot})`} opacity={man}>
          <Worker x={0} y={-20} s={0.9} role="plain" color={C.orange} t={t} mood={fall > 0 ? "sad" : "smile"} arms={0.2} />
          <Sack x={52} y={-14} s={bag} />
        </g>
      )}
      {fall > 0.6 &&
        [0, 1, 2, 3].map((i) => {
          const k = clamp01((fall - 0.6) * 2.5);
          return <Coin key={i} x={1530 + i * 40 + k * i * 10} y={720 + k * 70 - Math.sin(k * Math.PI) * (40 + i * 10)} s={0.4} spin={Math.cos(t * 5 + i)} />;
        })}
      {/* качества */}
      {["смелость", "оптимизм"].map((w, i) => {
        const k = pop(t, virt + 0.2 + i * 0.25);
        return k > 0 ? (
          <g key={w} transform={`translate(760 ${650 + i * 72}) scale(${k})`}>
            <Tag x={0} y={0} text={w} size={36} color="#fff3b0" />
          </g>
        ) : null;
      })}
      {["скромность", "бережливость", "немного страха"].map((w, i) => {
        const k = pop(t, at(c, 3.45) + i * 0.25);
        return k > 0 ? (
          <g key={w} transform={`translate(1680 ${420 + i * 72}) scale(${k})`}>
            <Tag x={0} y={0} text={w} size={36} color={C.green} textColor="#fff" />
          </g>
        ) : null;
      })}
    </g>
  );
};

// ───────────── s23: главное — выжить ─────────────
export const Survival: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ground = pop(t, 0.1);
  const walk = prog(t, at(c, 0.1), at(c, 0.95));
  const banner = pop(t, at(c, 0.55));
  const list = pop(t, at(c, 1.05));
  const rows = ["долги", "паника", "плохая репутация"];
  const gap = ramp(t, at(c, 2), 0.7);
  const coin = pop(t, at(c, 2.2));
  const no = ramp(t, at(c, 2.55), 0.6);
  const pits = [340, 590, 840];
  const x = lerp(170, 990, walk);
  let hop = 0;
  for (const p of pits) {
    const dd = Math.abs(x - p);
    if (dd < 110) hop = Math.max(hop, 120 * Math.cos((dd / 110) * (Math.PI / 2)));
  }
  return (
    <g>
      <g opacity={clamp01(ground * 1.5)}>
        <rect x={100} y={740} width={1200} height={90} fill="#9fc98a" stroke={OL} strokeWidth={4} />
        {pits.map((p) => (
          <g key={p}>
            <path d={`M ${p - 75} 738 L ${p - 55} 828 L ${p + 55} 828 L ${p + 75} 738 Z`} fill="#4a3b2c" stroke={OL} strokeWidth={4} />
            <Txt x={p} y={800} size={34} color="#fff">
              кризис
            </Txt>
          </g>
        ))}
        {gap > 0 && (
          <g>
            <path d={`M ${1210 - 110 * gap} 738 L ${1210 - 80 * gap} 834 L ${1210 + 80 * gap} 834 L ${1210 + 90 * gap} 738 Z`} fill="#2b2118" stroke={OL} strokeWidth={4} />
            <Txt x={1210} y={800} size={34} color="#fff" opacity={gap}>
              всё
            </Txt>
          </g>
        )}
      </g>
      <Person x={x} y={712 - hop} s={1.1} color={C.green} t={t} arms={hop > 10 ? 0.8 : 0.1} />
      {banner > 0 && (
        <g transform={`translate(${zoneX(c.p.host)} 140) scale(${banner})`}>
          <Tag x={0} y={0} text="главное — остаться в игре" size={50} color={C.yellow} />
        </g>
      )}
      {list > 0 && (
        <g transform={`translate(680 ${370 + (1 - list) * 30})`} opacity={clamp01(list * 1.5) * (1 - gap * 0.35)}>
          <Panel x={-330} y={-160} w={660} h={330} r={30} />
          <Txt x={0} y={-96} size={44}>
            Баффет не делал:
          </Txt>
          {rows.map((r, i) => {
            const k = ramp(t, at(c, 1.25 + i * 0.22), 0.5);
            return (
              <g key={r} opacity={clamp01(k * 2)}>
                <Txt x={-210} y={-12 + i * 76} size={42} anchor="start">
                  {r}
                </Txt>
                <Cross x={-260} y={-26 + i * 76} s={44} k={k} />
              </g>
            );
          })}
        </g>
      )}
      {coin > 0 && (
        <g>
          <g transform={`translate(1210 ${540 + wob(t, 1, 10)}) scale(${coin})`}>
            <circle r={70} fill={C.yellow} opacity={0.3} />
            <Coin x={0} y={0} s={1.1} spin={0.65 + 0.35 * Math.cos(t * 2.5)} />
            <Tag x={0} y={-110} text="прибыль" size={36} color="#fff" />
          </g>
          <Cross x={1210} y={540} s={140} k={no} />
        </g>
      )}
    </g>
  );
};

// ───────────── s24: оптимист и параноик ─────────────
const Umbrella: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 0 L 0 70 Q 0 90 -18 86" stroke={OL} strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d="M -80 0 Q -80 -80 0 -80 Q 80 -80 80 0 Q 60 -14 40 0 Q 20 -14 0 0 Q -20 -14 -40 0 Q -60 -14 -80 0 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 0 -80 Q -20 -40 -40 0 M 0 -80 Q 20 -40 40 0" stroke={OL} strokeWidth={3} fill="none" opacity={0.5} />
  </g>
);
const Helmet: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -52 0 Q -52 -60 0 -60 Q 52 -60 52 0 Z" fill={C.yellow} stroke={OL} strokeWidth={5} />
    <rect x={-66} y={-6} width={132} height={16} rx={8} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
    <rect x={-8} y={-60} width={16} height={56} fill={C.yellowDeep} />
  </g>
);
const Bolt: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 6 -50 L -20 6 L 0 6 L -10 50 L 24 -12 L 4 -12 L 18 -50 Z" fill={C.yellow} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
);

export const Barbell: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bar = pop(t, 0.2);
  const optimist = pop(t, at(c, 0.4));
  const careful = pop(t, at(c, 0.7));
  const rain = ramp(t, at(c, 1.4), 0.6) * (1 - ramp(t, at(c, 2.2), 0.5));
  const chart = ramp(t, at(c, 2), 0.6) * (1 - ramp(t, at(c, 3), 0.5));
  const lineK = prog(t, at(c, 2.02), at(c, 2.6));
  const plans = ramp(t, at(c, 3.05), 0.5);
  const planB = pop(t, at(c, 3.4));
  const tilt = Math.sin(t * 1.4) * 3;
  const pts: [number, number][] = [
    [0, 0.08], [0.1, 0.14], [0.17, 0.06], [0.25, 0.2], [0.35, 0.28], [0.42, 0.18], [0.5, 0.34], [0.6, 0.44], [0.67, 0.36], [0.78, 0.6], [0.88, 0.72], [1, 0.92],
  ];
  const bolts = [
    { u: 0.17, v: 0.06, label: "войны" },
    { u: 0.42, v: 0.18, label: "кризисы" },
    { u: 0.67, v: 0.36, label: "эпидемии" },
  ];
  const CX = 720;
  const CY = 530;
  const CW = 1040;
  const CH = 200;
  return (
    <g>
      {/* гантель */}
      {bar > 0 && (
        <g transform={`translate(1230 290) rotate(${tilt}) scale(${bar})`}>
          <rect x={-380} y={-14} width={760} height={28} rx={14} fill="#8a96ab" stroke={OL} strokeWidth={5} />
          <rect x={-60} y={-24} width={120} height={48} rx={14} fill="#5d6678" stroke={OL} strokeWidth={4} />
          {optimist > 0 && (
            <g transform={`translate(-430 0) scale(${optimist})`}>
              <Sun x={0} y={0} r={80} t={t} />
            </g>
          )}
          {careful > 0 && (
            <g transform={`translate(430 0) scale(${careful})`}>
              <circle r={110} fill="#d8ecfb" stroke={OL} strokeWidth={5} />
              <Umbrella x={-20} y={10} s={0.9} />
              <Helmet x={50} y={70} s={0.55} />
            </g>
          )}
        </g>
      )}
      {optimist > 0 && (
        <g transform={`translate(810 470) scale(${optimist})`}>
          <Tag x={0} y={0} text="долгий оптимизм" size={36} color={C.yellow} />
        </g>
      )}
      {careful > 0 && (
        <g transform={`translate(1640 470) scale(${careful})`}>
          <Tag x={0} y={0} text="осторожность сейчас" size={36} color={C.sky} />
        </g>
      )}
      {/* дождь неприятностей по дороге */}
      {rain > 0 &&
        Array.from({ length: 10 }).map((_, i) => {
          const ry = ((t * 260 + i * 53) % 150) + 110;
          return <line key={i} x1={1560 + (i % 5) * 40} y1={ry} x2={1554 + (i % 5) * 40} y2={ry + 22} stroke={C.skyDeep} strokeWidth={5} strokeLinecap="round" opacity={rain} />;
        })}
      {/* 170 лет: беды и рост */}
      {chart > 0 && (
        <g opacity={chart}>
          <Panel x={660} y={500} w={1160} h={330} r={30} />
          <LineChart x={CX} y={CY + 20} w={CW} h={CH} pts={pts} k={lineK} color={C.green} width={10} />
          {bolts.map((b, i) => {
            const k = pop(t, at(c, 2.08 + i * 0.16));
            if (k <= 0) return null;
            const bx = CX + b.u * CW;
            const by = CY + 20 + CH - b.v * CH;
            return (
              <g key={b.label} transform={`translate(${bx} ${by - 70}) scale(${k})`}>
                <Bolt x={0} y={0} s={0.8} />
                <Txt x={0} y={-52} size={34} color={C.red}>
                  {b.label}
                </Txt>
              </g>
            );
          })}
          <Tag x={1690} y={794} text="170 лет" size={34} color="#fff" />
          {lineK > 0.95 && <Tag x={1610} y={560} text="уровень жизни ↑" size={34} color={C.green} textColor="#fff" />}
        </g>
      )}
      {/* план А и план Б */}
      {plans > 0 && (
        <g opacity={plans}>
          <Panel x={690} y={540} w={480} h={260} r={30} />
          <Txt x={930} y={606} size={48}>
            План А
          </Txt>
          <path d="M 740 720 L 1110 720" stroke={C.skyDeep} strokeWidth={10} strokeDasharray="20 14" strokeLinecap="round" />
          <rect x={890} y={680} width={80} height={70} rx={14} fill="#8a7f72" stroke={OL} strokeWidth={4} />
          <Cross x={930} y={715} s={70} k={ramp(t, at(c, 3.18), 0.5)} />
          <Arrow x1={1190} y1={670} x2={1290} y2={670} k={ramp(t, at(c, 3.3), 0.4)} color={C.inkSoft} w={9} />
          {planB > 0 && (
            <g transform={`translate(1560 670) scale(${planB})`}>
              <Panel x={-240} y={-130} w={480} h={260} r={30} fill="#effaf3" />
              <Txt x={0} y={-64} size={48} color={C.greenDeep}>
                План Б
              </Txt>
              <path d="M -190 50 Q -60 -40 60 50 T 190 30" stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" />
              <Check x={150} y={-70} s={44} k={ramp(t, at(c, 3.55), 0.5)} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ───────────── s25: коллекционер картин ─────────────
const Painting: React.FC<{ x: number; y: number; w: number; h: number; i: number; grey: number; glow?: number; rot?: number }> = ({ x, y, w, h, i, grey, glow = 0, rot = 0 }) => {
  const pal = [C.coral, C.sky, C.green, C.violet, C.orange, C.teal, C.pink, C.yellow];
  const a = pal[i % pal.length];
  const b = pal[(i * 3 + 2) % pal.length];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {glow > 0 && <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={18} fill={C.yellow} opacity={glow * 0.6} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={glow > 0 ? C.gold : C.wood} stroke={OL} strokeWidth={3} />
      <rect x={-w / 2 + 9} y={-h / 2 + 9} width={w - 18} height={h - 18} fill="#fff8ec" />
      {i % 3 === 0 && <circle cx={-w * 0.1} cy={0} r={h * 0.24} fill={a} />}
      {i % 3 === 1 && <path d={`M ${-w * 0.3} ${h * 0.3} L 0 ${-h * 0.28} L ${w * 0.3} ${h * 0.3} Z`} fill={a} />}
      {i % 3 === 2 && <rect x={-w * 0.3} y={-h * 0.25} width={w * 0.36} height={h * 0.5} fill={a} />}
      <rect x={w * 0.04} y={-h * 0.1} width={w * 0.24} height={h * 0.34} fill={b} opacity={0.85} />
      {grey > 0 && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#9aa5b8" opacity={grey * 0.75} />}
    </g>
  );
};

export const ArtCollector: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const tail = ramp(t, 0.2, 0.5) * (1 - ramp(t, at(c, 1), 0.5));
  const tailK = prog(t, at(c, 0.03), at(c, 0.5));
  const wall = prog(t, at(c, 1.02), at(c, 1.3));
  const dull = ramp(t, at(c, 1.4), 0.8);
  const drop = prog(t, at(c, 1.55), at(c, 1.95));
  const star = pop(t, at(c, 1.6));
  const scales = pop(t, at(c, 1.75));
  const tip = ramp(t, at(c, 1.85), 0.8);
  const dim = 1 - 0.6 * ramp(t, at(c, 2), 0.5);
  const film = ramp(t, at(c, 2.05), 0.6);
  const snow = pop(t, at(c, 2.38));
  const stars = [8, 16];
  return (
    <g>
      {/* длинный хвост */}
      {tail > 0 && (
        <g opacity={tail}>
          <Panel x={140} y={170} w={1140} h={560} r={34} />
          {Array.from({ length: 24 }).map((_, i) => {
            const big = i === 7 ? 1 : i === 18 ? 0.75 : 0;
            const h = (big ? 380 * big : 16 + ((i * 37) % 30)) * clamp01(tailK * 24 - i);
            return <rect key={i} x={190 + i * 44} y={680 - h} width={32} height={h} rx={5} fill={big ? C.gold : "#b9c3d3"} stroke={OL} strokeWidth={2.5} />;
          })}
          {tailK > 0.9 && (
            <g>
              <Tag x={760} y={250} text="редкие события дают почти всё" size={38} color={C.yellow} />
              <Star x={190 + 7 * 44 + 16} y={270} r={26} rot={t * 40} />
            </g>
          )}
        </g>
      )}
      {/* стена картин */}
      {wall > 0 && (
        <g opacity={dim}>
          {Array.from({ length: 24 }).map((_, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const k = clamp01(wall * 24 - i);
            if (k <= 0) return null;
            const isStar = stars.includes(i);
            const falls = !isStar && (i * 7) % 3 === 0;
            const fy = falls ? drop * drop * 700 : 0;
            const op = falls ? clamp01(1 - drop * 1.3) : 1;
            return (
              <g key={i} opacity={op * k}>
                <Painting x={190 + col * 132} y={210 + row * 118 + fy} w={114} h={100} i={i} grey={isStar ? 0 : dull} glow={isStar ? star * (0.7 + 0.3 * Math.sin(t * 4)) : 0} rot={falls ? drop * (i % 2 ? 40 : -40) : 0} />
              </g>
            );
          })}
          {star > 0 && (
            <g transform={`translate(${190 + 2 * 132} 276) scale(${star})`}>
              <Tag x={0} y={-30} text="Пикассо" size={36} color={C.yellow} />
            </g>
          )}
          {scales > 0 && (
            <g opacity={clamp01(scales * 1.5)}>
              <Scales
                x={1120}
                y={250}
                s={0.62}
                tilt={-tip}
                left={<Painting x={0} y={-60} w={110} h={96} i={8} grey={0} glow={0.8} />}
                right={
                  <g>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <Painting key={j} x={-40 + (j % 3) * 40} y={-40 - Math.floor(j / 3) * 50} w={70} h={60} i={j + 2} grey={1} rot={(j - 2) * 8} />
                    ))}
                  </g>
                }
              />
              <Tag x={1120} y={490} text="окупили всё" size={36} color={C.green} textColor="#fff" />
            </g>
          )}
        </g>
      )}
      {/* киноплёнка Диснея */}
      {film > 0 && (
        <g opacity={film}>
          <Tag x={330} y={630} text="400+ мультфильмов" size={36} color="#fff" />
          <rect x={100} y={680} width={1190} height={130} fill="#2b2b3a" />
          {Array.from({ length: 24 }).map((_, i) => (
            <g key={i}>
              <rect x={110 + i * 50} y={688} width={26} height={14} rx={3} fill="#fff" opacity={0.8} />
              <rect x={110 + i * 50} y={788} width={26} height={14} rx={3} fill="#fff" opacity={0.8} />
            </g>
          ))}
          {Array.from({ length: 10 }).map((_, i) => {
            const fx = 110 + (((i * 126 - t * 40) % 1260) + 1260) % 1260;
            if (fx > 1180) return null;
            return (
              <g key={i}>
                <rect x={fx} y={708} width={110} height={74} rx={6} fill="#6d7486" />
                <Txt x={fx + 55} y={758} size={40} color={C.coral}>
                  −
                </Txt>
              </g>
            );
          })}
          <rect x={100} y={680} width={20} height={130} fill="#2b2b3a" />
          <rect x={1270} y={680} width={20} height={130} fill="#2b2b3a" />
        </g>
      )}
      {snow > 0 && (
        <g transform={`translate(${cx} ${560 + wob(t, 2, 4)}) scale(${snow})`}>
          <circle r={200} fill={C.yellow} opacity={0.3 + 0.08 * Math.sin(t * 3)} />
          <rect x={-170} y={-120} width={340} height={230} rx={14} fill="#fff" stroke={C.gold} strokeWidth={10} />
          <path d="M -40 30 Q -40 -30 0 -30 Q 40 -30 40 30 Q 40 70 0 70 Q -40 70 -40 30 Z" fill={C.red} stroke={OL} strokeWidth={4} />
          <path d="M 0 -30 Q 4 -50 16 -58" stroke="#6b4a1e" strokeWidth={6} fill="none" />
          <path d="M 6 -46 Q 30 -62 44 -44 Q 22 -34 6 -46 Z" fill={C.green} stroke={OL} strokeWidth={3} />
          <Sparkle x={-110} y={-60} s={0.8 + 0.3 * Math.sin(t * 5)} />
          <Sparkle x={110} y={40} s={0.7 + 0.3 * Math.sin(t * 5 + 2)} />
          <Tag x={0} y={-170} text="«Белоснежка»" size={40} color={C.yellow} />
          <Check x={210} y={-10} s={60} k={ramp(t, at(c, 2.7), 0.5)} />
        </g>
      )}
    </g>
  );
};

// ───────────── s26: можно ошибаться в половине случаев ─────────────
export const TailsChart: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const COLS = 10;
  const ROWS = 5;
  const N = COLS * ROWS;
  const reveal = prog(t, at(c, 0.02), at(c, 0.45));
  const total = prog(t, at(c, 0.2), at(c, 0.75));
  const dimGrid = 1 - 0.45 * ramp(t, at(c, 1), 0.5);
  const stage = pop(t, at(c, 1.05));
  const panic = pop(t, at(c, 2.05));
  const calm = ramp(t, at(c, 2.45), 0.6);
  const kind = (i: number) => (i === 13 || i === 31 || i === 46 ? "star" : (i * 7 + 3) % 11 < 5 ? "x" : "ok");
  // накопленный итог
  const series: [number, number][] = [];
  let v = 0.25;
  for (let i = 0; i < N; i++) {
    const k = kind(i);
    v += k === "star" ? 0.2 : k === "x" ? -0.012 : 0.006;
    series.push([i / (N - 1), Math.max(0.02, Math.min(0.98, v))]);
  }
  const jokes = 6;
  return (
    <g>
      <g opacity={dimGrid}>
        <Panel x={390} y={110} w={720} h={400} r={30} />
        {Array.from({ length: N }).map((_, i) => {
          const k = clamp01(reveal * N - i);
          if (k <= 0) return null;
          const gx = 440 + (i % COLS) * 68;
          const gy = 160 + Math.floor(i / COLS) * 68;
          const kd = kind(i);
          return (
            <g key={i}>
              <rect x={gx - 28} y={gy - 28} width={56} height={56} rx={10} fill={kd === "x" ? "#ffe3e0" : kd === "star" ? "#fff3c4" : "#e3f6ea"} />
              {kd === "x" && <Cross x={gx} y={gy} s={28} k={k} />}
              {kd === "ok" && <circle cx={gx} cy={gy} r={9 * k} fill={C.green} />}
              {kd === "star" && <Star x={gx} y={gy} r={24 * k} rot={t * 30} />}
            </g>
          );
        })}
        <Panel x={1170} y={110} w={640} h={400} r={30} />
        <LineChart x={1220} y={150} w={540} h={300} pts={series} k={total} color={C.moneyDeep} width={8} />
        {total > 0.97 && (
          <g transform={`translate(1700 ${150 + 300 - series[N - 1][1] * 300 - 50}) scale(${pop(t, at(c, 0.75))})`}>
            <Tag x={-40} y={0} text="итог ↑" size={40} color={C.green} textColor="#fff" />
          </g>
        )}
        {reveal > 0.95 && (
          <g transform={`translate(750 560) scale(${pop(t, at(c, 0.5))})`}>
            <Tag x={0} y={0} text="почти половина — ошибки" size={36} color="#ffe3e0" />
          </g>
        )}
      </g>
      {/* маленький клуб с микрофоном */}
      {stage > 0 && (
        <g opacity={clamp01(stage * 1.5)} transform={`translate(0 ${(1 - stage) * 40})`}>
          <rect x={560} y={600} width={700} height={220} rx={20} fill="#3b2d4f" stroke={OL} strokeWidth={4} />
          <path d={`M 560 600 Q 600 ${700 + Math.sin(t * 1.5) * 6} 600 820 L 560 820 Z M 1260 600 Q 1220 ${700 + Math.sin(t * 1.5 + 1) * 6} 1220 820 L 1260 820 Z`} fill={C.red} stroke={OL} strokeWidth={3} />
          <path d="M 1170 600 L 1070 790 L 1250 790 Z" fill={C.yellow} opacity={0.18} />
          <rect x={600} y={790} width={620} height={30} fill="#7a5a3a" stroke={OL} strokeWidth={3} />
          <Person x={1180} y={780} s={0.9} color={C.sky} t={t} arms={0.3} />
          <line x1={1100} y1={700} x2={1100} y2={790} stroke={OL} strokeWidth={6} />
          <ellipse cx={1100} cy={690} rx={12} ry={18} fill="#5d6678" stroke={OL} strokeWidth={3} />
          {Array.from({ length: jokes }).map((_, i) => {
            const k = pop(t, at(c, 1.2 + i * 0.12));
            if (k <= 0) return null;
            const jx = 700 + (i % 3) * 150 + (i > 2 ? 40 : 0);
            const jy = i > 2 ? 750 : 665;
            const good = i === 4;
            return (
              <g key={i} transform={`translate(${jx} ${jy}) scale(${k * 0.8})`}>
                <Bubble x={0} y={0} w={150} h={64} fill={good ? "#fff3c4" : "#fff"} />
                <Txt x={0} y={12} size={32}>
                  шутка
                </Txt>
                {!good && <line x1={-62} y1={2} x2={62} y2={2} stroke={C.red} strokeWidth={7} strokeLinecap="round" strokeDasharray={124} strokeDashoffset={124 * (1 - ramp(t, at(c, 1.3 + i * 0.12), 0.4))} />}
                {good && <Star x={86} y={-30} r={22} rot={t * 40} />}
              </g>
            );
          })}
        </g>
      )}
      {/* паника вокруг, спокойствие в центре */}
      {panic > 0 && (
        <g opacity={clamp01(panic * 1.5)}>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + 0.6;
            const px = 1560 + Math.cos(a) * 170 + Math.sin(t * 14 + i) * 5;
            const py = 760 + Math.sin(a) * 60;
            return (
              <g key={i}>
                <Person x={px} y={py} s={0.65} color="#c7cdd8" t={t * 3} arms={0.9} sad />
                <Txt x={px + 30} y={py - 120} size={40} color={C.red}>
                  !
                </Txt>
              </g>
            );
          })}
          <circle cx={1560} cy={700} r={80} fill={C.green} opacity={0.2 * calm + 0.05 * Math.sin(t * 3)} />
          <Person x={1560} y={760} s={0.8} color={C.green} t={0} />
          {calm > 0 && (
            <g transform={`translate(1560 560) scale(${calm})`}>
              <Tag x={0} y={0} text="спокойствие" size={38} color={C.green} textColor="#fff" />
            </g>
          )}
        </g>
      )}
    </g>
  );
};
