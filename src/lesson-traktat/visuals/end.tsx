// Итоговая часть: часовщик и писатель, лица, село с двумя главными, мир-дерево,
// доктор и лекарство, секрет лёгкости, весна и невидимые чернила, повторение, прощание.
import React from "react";
import { interpolate } from "remotion";
import { BRAND } from "../../banamind/brand";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Book, Bubble, Drop, Factory, Fly, Flower, Heart, Jar, OL, Person, Shard, Soldier, Sun, Tree } from "./draw";
import { zoneX } from "./intro";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const Gear: React.FC<{ x: number; y: number; r: number; rot: number; color?: string }> = ({ x, y, r, rot, color = "#cbd5e1" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: 10 }).map((_, i) => (
      <rect key={i} x={-r * 0.14} y={-r * 1.22} width={r * 0.28} height={r * 0.35} fill={color} stroke={OL} strokeWidth={3} transform={`rotate(${i * 36})`} />
    ))}
    <circle r={r} fill={color} stroke={OL} strokeWidth={4} />
    <circle r={r * 0.3} fill="#fff" stroke={OL} strokeWidth={3} />
  </g>
);

const Watch: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-40} y={-170} width={80} height={60} rx={10} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    <rect x={-40} y={110} width={80} height={60} rx={10} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    <circle r={120} fill="#fff" stroke={OL} strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, i) => (
      <rect key={i} x={-4} y={-108} width={8} height={18} fill={OL} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-80} stroke={OL} strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 30})`} />
    <line x1={0} y1={0} x2={0} y2={-55} stroke={C.red} strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 3})`} />
    <circle r={10} fill={OL} />
  </g>
);

const FACE_SKIN = ["#f2c79b", "#e0a878", "#c68a5c", "#f6d5b8", "#a8754f", "#ecbf94"];
const FACE_HAIR = ["#3b2a10", "#7a4a1e", "#111", "#d9a441", "#5a3d14", "#9a5b2e"];
const Face: React.FC<{ x: number; y: number; i: number; s?: number; same?: boolean }> = ({ x, y, i, s = 1, same }) => {
  const k = same ? 0 : i;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={60} fill={FACE_SKIN[k % 6]} stroke={OL} strokeWidth={4} />
      <path d={k % 3 === 0 ? "M -60 -10 Q -60 -70 0 -70 Q 60 -70 60 -10 Q 40 -40 0 -44 Q -40 -40 -60 -10 Z" : k % 3 === 1 ? "M -58 -20 Q -40 -76 10 -66 Q 60 -56 58 -10 Q 20 -50 -58 -20 Z" : "M -62 0 Q -70 -70 0 -72 Q 70 -70 62 0 L 54 -30 Q 0 -60 -54 -30 Z"} fill={FACE_HAIR[k % 6]} />
      <ellipse cx={-20} cy={0} rx={6 + (k % 2) * 2} ry={8} fill={OL} />
      <ellipse cx={20} cy={0} rx={6 + (k % 2) * 2} ry={8} fill={OL} />
      <path d={`M -18 ${28 + (k % 3)} Q 0 ${40 + (k % 4) * 3} 18 ${28 + (k % 3)}`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
      {k % 4 === 2 && <ellipse cx={0} cy={14} rx={7} ry={5} fill="#d18b6a" />}
    </g>
  );
};

export const WatchPen: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const ph1 = 1 - ramp(t, at(c, 3) - 0.3, 0.4);
  const ph2 = ramp(t, at(c, 3) - 0.3, 0.4) * (1 - ramp(t, at(c, 5) - 0.3, 0.4));
  const ph3 = ramp(t, at(c, 5) - 0.3, 0.4) * (1 - ramp(t, at(c, 9) - 0.3, 0.4));
  const ph4 = ramp(t, at(c, 9) - 0.3, 0.4);
  const assemble = ramp(t, at(c, 1), 1.6);
  return (
    <g>
      {ph1 > 0 && (
        <g opacity={ph1}>
          {/* детали → часы */}
          <g transform={`translate(${x - 280} 480)`}>
            <Panel x={-230} y={-250} w={460} h={500} fill="#fffdf7" />
            {assemble < 1 &&
              [0, 1, 2, 3].map((i) => (
                <Gear key={i} x={interpolate(assemble, [0, 1], [-120 + (i % 2) * 240, 0])} y={interpolate(assemble, [0, 1], [-140 + Math.floor(i / 2) * 260, 0])} r={30 + i * 6} rot={t * 40 * (i % 2 ? 1 : -1)} color={["#cbd5e1", "#fcd34d", "#a7f3d0", "#fbcfe8"][i]} />
              ))}
            {assemble >= 1 && <Watch x={0} y={0} s={1.2} t={t} />}
            <Txt x={0} y={215} size={30}>
              собрать детали
            </Txt>
            <Check x={170} y={-200} s={44} k={ramp(t, at(c, 2), 0.5)} />
          </g>
          <g transform={`translate(${x + 280} 480)`}>
            <Panel x={-230} y={-250} w={460} h={500} fill="#fffdf7" />
            <Gear x={-40} y={-30} r={60} rot={t * 90} color="#cbd5e1" />
            <Gear x={60} y={60} r={44} rot={-t * 120} color="#fcd34d" />
            <Gear x={70} y={-90} r={30} rot={-t * 150} color="#a7f3d0" />
            <Txt x={0} y={215} size={30}>
              машина внутри деталей?
            </Txt>
            <Cross x={170} y={-200} s={70} k={ramp(t, at(c, 2.3), 0.5)} />
          </g>
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2}>
          <g transform={`translate(${x - 280} 480)`}>
            <Book x={0} y={0} s={1} color={C.green} title={"книга"} />
            <g transform="translate(130 -60) rotate(30)">
              <rect x={-9} y={-110} width={18} height={100} rx={5} fill={C.violet} stroke={OL} strokeWidth={3} />
              <path d="M -9 -10 L 0 14 L 9 -10 Z" fill="#c9a227" stroke={OL} strokeWidth={3} />
            </g>
            <Check x={140} y={-200} s={44} k={ramp(t, at(c, 3.5), 0.5)} />
          </g>
          <g transform={`translate(${x + 280} 480)`}>
            <rect x={-150} y={-200} width={300} height={400} fill="#fff" stroke={OL} strokeWidth={4} />
            <g transform={`translate(0 40) scale(${0.6 + 0.4 * ramp(t, at(c, 4), 0.6)})`}>
              <rect x={-110} y={-50} width={220} height={110} rx={16} fill="#64748b" stroke={OL} strokeWidth={4} />
              {Array.from({ length: 12 }).map((_, i) => (
                <circle key={i} cx={-80 + (i % 6) * 32} cy={-10 + Math.floor(i / 6) * 34} r={11} fill="#e2e8f0" stroke={OL} strokeWidth={2} />
              ))}
            </g>
            <Tag x={0} y={250} text="машинка внутри бумаги?" size={28} color="#ffd6d6" />
            <Cross x={140} y={-200} s={70} k={ramp(t, at(c, 4.5), 0.5)} />
          </g>
        </g>
      )}
      {ph3 > 0 && (
        <g opacity={ph3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Pop key={i} t={t} at={at(c, 5) + i * 0.12} x={x - 420 + (i % 4) * 280} y={330 + Math.floor(i / 4) * 230}>
              <Face x={0} y={wob(t, i, 4)} i={i} />
            </Pop>
          ))}
          <Pop t={t} at={at(c, 6)} x={x} y={150}>
            <Tag x={0} y={0} text="каждое лицо — отдельная книга" size={38} color={C.yellow} />
          </Pop>
          {ramp(t, at(c, 7), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 7), 0.5)}>
              <rect x={x - 560} y={760} width={1120} height={120} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
              {[0, 1, 2, 3].map((i) => (
                <Face key={i} x={x - 380 + i * 160} y={820} i={0} s={0.45} same />
              ))}
              <Txt x={x + 300} y={835} size={30}>
                одинаковые копии?
              </Txt>
              <Cross x={x - 140} y={820} s={90} k={ramp(t, at(c, 8), 0.5)} />
            </g>
          )}
        </g>
      )}
      {ph4 > 0 && (
        <g opacity={ph4}>
          <g transform={`translate(${x} 520)`}>
            <rect x={-150} y={-120} width={300} height={220} rx={20} fill="#94a3b8" stroke={OL} strokeWidth={5} />
            <rect x={-110} y={-80} width={220} height={60} rx={8} fill="#e2e8f0" />
            <Txt x={0} y={70} size={30} color="#fff">
              «типография»
            </Txt>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <g key={i}>
                  <Jar x={Math.cos(a) * 420} y={Math.sin(a) * 260 + 40} color={["#ff8fa3", "#7fd1ae", "#ffd166", "#9bb8ff", "#c79bff", "#ffad7a"][i]} s={0.9} />
                  <Arrow x1={Math.cos(a) * 360} y1={Math.sin(a) * 220} x2={Math.cos(a) * 190} y2={Math.sin(a) * 140} k={ramp(t, at(c, 9.3) + i * 0.1, 0.6)} color={C.inkSoft} w={6} />
                </g>
              );
            })}
          </g>
          <Pop t={t} at={at(c, 9.6)} x={x} y={170}>
            <Tag x={0} y={0} text="вещества со всего мира — в точной мере" size={34} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

const House: React.FC<{ x: number; y: number; color: string; s?: number }> = ({ x, y, color, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-80} width={120} height={80} fill={color} stroke={OL} strokeWidth={4} />
    <path d="M -76 -76 L 0 -140 L 76 -76 Z" fill="#c0392b" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-16} y={-46} width={32} height={46} fill="#8a5a2b" />
  </g>
);

export const Village: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const ph1 = 1 - ramp(t, at(c, 3) - 0.3, 0.4);
  const ph2 = ramp(t, at(c, 3) - 0.3, 0.4);
  const zap = Math.abs(Math.sin(t * 6));
  return (
    <g>
      {ph1 > 0 && (
        <g opacity={ph1}>
          <Person x={x - 200} y={720} s={1.6} color={C.green} t={t} arms={0.6} />
          <Pop t={t} at={0.4} x={x - 200} y={380}>
            <g>
              <Heart x={0} y={0} s={1.6} />
              <Tag x={0} y={-90} text="хвала Аллаху за веру" size={30} color={C.white} />
            </g>
          </Pop>
          {ramp(t, at(c, 1), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 1), 0.5)}>
              <Bubble x={x + 40} y={260} w={540} h={170} tail={[x - 120, 560]} />
              <Txt x={x + 310} y={325} size={30}>
                {"а если маленькие причины\nчуть-чуть помогут?"}
              </Txt>
            </g>
          )}
          <Pop t={t} at={at(c, 2)} x={x + 260} y={720}>
            <g>
              <rect x={-130} y={-40} width={260} height={30} rx={8} fill="#c98b4a" stroke={OL} strokeWidth={4} />
              <Person x={0} y={-40} s={1.1} color={C.skyDeep} t={t} />
              <g transform="translate(150 -170)">
                <circle r={40} fill="#ffd6d6" stroke={OL} strokeWidth={4} />
                <rect x={-20} y={-6} width={40} height={12} rx={4} fill={C.red} />
              </g>
            </g>
          </Pop>
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2}>
          <path d="M 0 860 Q 960 800 1920 860 L 1920 1080 L 0 1080 Z" fill="#cfe9b5" />
          {[-420, -240, 240, 420].map((dx, i) => (
            <House key={i} x={x + dx} y={800} color={["#ffe3c2", "#d6ecff", "#e0f7e9", "#ffd6e0"][i]} />
          ))}
          <Person x={x - 90} y={790} s={1.3} color={C.coral} t={t} arms={0.8} />
          <Person x={x + 90} y={790} s={1.3} color={C.violet} t={t} arms={0.8} />
          <Tag x={x - 90} y={540} text="главный" size={26} color={C.white} />
          <Tag x={x + 90} y={480} text="и я главный!" size={26} color={C.white} />
          <path d={`M ${x - 20} ${600} L ${x + 10} ${640} L ${x - 6} ${644} L ${x + 22} ${690}`} stroke={C.yellowDeep} strokeWidth={8} fill="none" opacity={zap} strokeLinejoin="round" />
          <Pop t={t} at={at(c, 3.4)} x={x} y={340}>
            <Tag x={0} y={0} text="два главных — путаница" size={38} color="#ffd6d6" />
          </Pop>
          <Pop t={t} at={at(c, 4)} x={x} y={220}>
            <Tag x={0} y={0} text="даже маленькая власть не терпит вмешательства" size={30} color={C.white} />
          </Pop>
          <Pop t={t} at={at(c, 5)} x={x} y={130}>
            <g>
              <rect x={-460} y={-56} width={920} height={96} rx={30} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={10} size={36}>
                у Творца нет соучастника
              </Txt>
            </g>
          </Pop>
        </g>
      )}
    </g>
  );
};

export const WorldTree: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const tree = ramp(t, at(c, 1), 1.4);
  const golden = pop(t, at(c, 2));
  const hearts = ramp(t, at(c, 4), 1);
  const bright = ramp(t, at(c, 6), 1);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#fff8d6" opacity={bright * 0.5} />
      <Pop t={t} at={0.3} x={x - 420} y={320}>
        <g>
          <Bubble x={-200} y={-80} w={420} h={130} tail={[-120, 120]} />
          <Txt x={10} y={-30} size={28}>
            {"а немного благодарности\nпричинам — можно?"}
          </Txt>
        </g>
      </Pop>
      <g transform={`translate(${x + 60} 900)`}>
        <Tree x={0} y={0} s={1.9} t={t} fruits={14} grow={tree} />
      </g>
      {golden > 0 && (
        <g transform={`translate(${x + 60} 430) scale(${golden})`}>
          <circle r={46} fill={C.yellowDeep} stroke={OL} strokeWidth={5} />
          <circle cx={-14} cy={-14} r={12} fill="#fff" opacity={0.6} />
          <circle r={70 + Math.sin(t * 3) * 6} fill="none" stroke={C.yellow} strokeWidth={6} opacity={0.6} />
          <Tag x={0} y={-100} text="человек" size={32} color={C.white} />
        </g>
      )}
      {hearts > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const ph = (t * 0.4 + i / 5) % 1;
          return <Heart key={i} x={x + 60 + (i - 2) * 70 + Math.sin(t * 2 + i) * 10} y={420 - ph * 300} s={0.9} color={C.coral} />;
        })}
      <Pop t={t} at={at(c, 4.3)} x={x + 400} y={720}>
        <Tag x={0} y={0} text="благодарность" size={32} color={C.yellow} />
      </Pop>
      <Pop t={t} at={at(c, 5)} x={x + 60} y={150}>
        <Tag x={0} y={0} text="чтобы Его узнали и полюбили" size={38} color={C.white} />
      </Pop>
      {bright > 0 && <Sun x={x + 520} y={220} r={60} t={t} />}
    </g>
  );
};

const Bed: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-170} y={-60} width={340} height={60} rx={14} fill="#cfe8ff" stroke={OL} strokeWidth={4} />
    <rect x={-170} y={-140} width={30} height={170} rx={8} fill="#c98b4a" stroke={OL} strokeWidth={4} />
    <rect x={140} y={-100} width={30} height={130} rx={8} fill="#c98b4a" stroke={OL} strokeWidth={4} />
  </g>
);

export const Doctor: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const ph1 = 1 - ramp(t, at(c, 4) - 0.3, 0.4);
  const ph2 = ramp(t, at(c, 4) - 0.3, 0.4) * (1 - ramp(t, at(c, 5) - 0.3, 0.4));
  const ph3 = ramp(t, at(c, 5) - 0.3, 0.4);
  return (
    <g>
      {ph1 > 0 && (
        <g opacity={ph1}>
          <Pop t={t} at={at(c, 1)} x={x} y={160}>
            <Tag x={0} y={0} text="Аллах ни в чём не нуждается — это нужно нам" size={34} color={C.white} />
          </Pop>
          <Pop t={t} at={at(c, 2)} x={x + 330} y={460}>
            <g>
              <path d="M -50 -120 L 50 -120 L 50 -90 Q 86 -66 86 -20 L 86 70 Q 86 92 64 92 L -64 92 Q -86 92 -86 70 L -86 -20 Q -86 -66 -50 -90 Z" fill="#ffe3ea" stroke={OL} strokeWidth={5} />
              <rect x={-56} y={-152} width={112} height={36} rx={10} fill={C.green} stroke={OL} strokeWidth={4} />
              <Heart x={0} y={20} s={1.4} />
              <Tag x={0} y={160} text="лекарство для души" size={30} color={C.yellow} />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 2.6)} x={x - 260} y={760}>
            <g>
              <Bed x={0} y={0} />
              <Person x={-40} y={-60} s={1} color="#cbd5e1" sad t={0} />
              <Person x={180} y={20} s={1.3} color="#fff" t={t} arms={0.5} />
              <path d="M 160 -110 Q 180 -60 200 -110" stroke={OL} strokeWidth={4} fill="none" />
            </g>
          </Pop>
          {ramp(t, at(c, 3), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 3), 0.5)}>
              <Bubble x={x - 560} y={330} w={460} h={120} tail={[x - 330, 560]} />
              <Txt x={x - 330} y={385} size={28}>
                {"«зачем ты так\nнастаиваешь?»"}
              </Txt>
            </g>
          )}
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2}>
          <Tree x={x - 300} y={860} s={1.2} t={t} fruits={5} />
          <Flower x={x + 60} y={860} color={C.coral} s={1.6} t={t} />
          <Flower x={x + 260} y={860} color={C.violet} s={1.3} kind={2} t={t} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${x - 300 + i * 290} ${300 + Math.sin(t * 2 + i) * 12})`}>
              <rect x={-60} y={-40} width={120} height={80} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M -60 -40 L 0 6 L 60 -40" fill="none" stroke={OL} strokeWidth={4} />
              <Heart x={0} y={18} s={0.5} />
            </g>
          ))}
          <Tag x={x} y={170} text="каждая вещь — как письмо и зеркало" size={36} color={C.yellow} />
        </g>
      )}
      {ph3 > 0 && (
        <g opacity={ph3}>
          {[0, 1].map((i) => {
            const happy = i === 1;
            const k = ramp(t, at(c, 6) + i * 0.4, 0.6);
            return (
              <g key={i} transform={`translate(${x - 280 + i * 560} 500)`}>
                <rect x={-240} y={-270} width={480} height={500} rx={36} fill={happy ? "#fff7d6" : "#e5e7eb"} stroke={OL} strokeWidth={5} opacity={0.4 + k * 0.6} />
                {happy ? <Sun x={120} y={-170} r={50} t={t} /> : <ellipse cx={120} cy={-170} rx={80} ry={40} fill="#9ca3af" />}
                {happy ? <Flower x={-120} y={150} color={C.coral} s={1.2} t={t} /> : <path d="M -120 150 L -120 40 M -120 60 L -150 40" stroke="#6b7280" strokeWidth={8} />}
                <Person x={30} y={170} s={1.4} color={happy ? C.yellow : "#9ca3af"} sad={!happy} t={t} arms={happy ? 0.7 : 0} />
                <Tag x={0} y={-230} text={happy ? "радостный — радостный мир" : "грустный — грустный мир"} size={28} color={C.white} />
              </g>
            );
          })}
          <Pop t={t} at={at(c, 4.6)} x={x} y={150}>
            <Tag x={0} y={0} text="каждый видит мир через своё зеркало" size={36} color={C.yellow} />
          </Pop>
          {ramp(t, at(c, 7), 0.6) > 0 &&
            [0, 1, 2, 3].map((i) => <Heart key={i} x={x - 300 + i * 200} y={880 - ((t * 60 + i * 40) % 120)} s={0.8} color={C.coral} />)}
        </g>
      )}
    </g>
  );
};

export const OneRoot: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const ph1 = 1 - ramp(t, at(c, 2) - 0.3, 0.4);
  const ph2 = ramp(t, at(c, 2) - 0.3, 0.4) * (1 - ramp(t, at(c, 4) - 0.3, 0.4));
  const ph3 = ramp(t, at(c, 4) - 0.3, 0.4);
  return (
    <g>
      {ph1 > 0 && (
        <g opacity={ph1}>
          <g transform={`translate(${x - 280} 520)`}>
            <Panel x={-250} y={-300} w={500} h={560} fill="#f0fdf4" />
            <Soldier x={0} y={-160} s={1.2} color="#b91c1c" />
            {Array.from({ length: 20 }).map((_, i) => (
              <Soldier key={i} x={-180 + (i % 5) * 90} y={-20 + Math.floor(i / 5) * 60} s={0.5} squat={(Math.sin(t * 2) + 1) / 2} />
            ))}
            <Check x={190} y={-250} s={44} k={ramp(t, at(c, 0.5), 0.5)} />
            <Tag x={0} y={300} text="1 командир → 100 солдат" size={28} color={C.white} />
          </g>
          {ramp(t, at(c, 1), 0.4) > 0 && (
            <g transform={`translate(${x + 280} 520)`} opacity={ramp(t, at(c, 1), 0.4)}>
              <Panel x={-250} y={-300} w={500} h={560} fill="#fef2f2" />
              <Soldier x={wob(t * 6, 1, 6)} y={60} s={1.2} />
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return (
                  <g key={i}>
                    <Soldier x={Math.cos(a) * 190} y={60 + Math.sin(a) * 170} s={0.55} color="#b91c1c" />
                    <Arrow x1={Math.cos(a) * 160} y1={20 + Math.sin(a) * 140} x2={Math.cos(a) * 60} y2={0 + Math.sin(a) * 50} k={1} color={C.red} w={4} />
                  </g>
                );
              })}
              <Cross x={190} y={-250} s={70} k={ramp(t, at(c, 1.5), 0.5)} />
              <Tag x={0} y={300} text="1 солдат ← 100 командиров" size={28} color={C.white} />
            </g>
          )}
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2}>
          <Factory x={x - 300} y={420} s={1.6} t={t} />
          {Array.from({ length: 12 }).map((_, i) => (
            <Soldier key={i} x={x - 480 + (i % 6) * 70} y={640 + Math.floor(i / 6) * 90} s={0.6} />
          ))}
          <Arrow x1={x - 300} y1={450} x2={x - 300} y2={540} k={1} color={C.green} />
          <Tag x={x - 300} y={250} text="одна фабрика — легко" size={30} color={C.white} />
          {ramp(t, at(c, 3), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 3), 0.5)}>
              {[0, 1, 2, 3, 4].map((i) => {
                const a = (i / 5) * Math.PI * 2;
                return (
                  <g key={i}>
                    <Factory x={x + 330 + Math.cos(a) * 200} y={560 + Math.sin(a) * 180} s={0.7} t={t + i} />
                    <Arrow x1={x + 330 + Math.cos(a) * 150} y1={540 + Math.sin(a) * 140} x2={x + 330 + Math.cos(a) * 60} y2={560 + Math.sin(a) * 50} k={1} color={C.red} w={4} />
                  </g>
                );
              })}
              <Soldier x={x + 330} y={600} s={0.9} />
              <Tag x={x + 330} y={250} text="много заводов на одного — трудно" size={28} color="#ffd6d6" />
            </g>
          )}
        </g>
      )}
      {ph3 > 0 && (
        <g opacity={ph3}>
          <path d="M 0 860 Q 960 820 1920 860 L 1920 1080 L 0 1080 Z" fill="#cfe9b5" />
          <g transform={`translate(${x} 860)`}>
            <path d="M 0 0 Q -10 50 -60 90 M 0 0 Q 10 60 50 100 M 0 0 L 0 110" stroke="#8a5a2b" strokeWidth={14} fill="none" strokeLinecap="round" />
            <Tree x={0} y={0} s={1.6} t={t} fruits={Math.round(6 + ramp(t, at(c, 5), 1.5) * 30)} />
            {[0, 1, 2, 3, 4].map((i) => {
              const ph = (t * 0.5 + i / 5) % 1;
              return <circle key={i} cx={Math.sin(i) * 6} cy={100 - ph * 400} r={9} fill={C.skyDeep} opacity={0.8} />;
            })}
          </g>
          <Pop t={t} at={at(c, 4.3)} x={x + 420} y={860}>
            <Tag x={0} y={0} text="один корень" size={32} color={C.white} />
          </Pop>
          <Pop t={t} at={at(c, 5.3)} x={x} y={150}>
            <Tag x={0} y={0} text="1000 плодов — легко, как один" size={38} color={C.yellow} />
          </Pop>
          <Pop t={t} at={at(c, 6.3)} x={x - 420} y={760}>
            <Flower x={0} y={0} color={C.coral} s={1.3} t={t} />
          </Pop>
          <Pop t={t} at={at(c, 10)} x={x} y={245}>
            <Tag x={0} y={0} text="ответ: 100 солдат у одного командира" size={34} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const Spring: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const ph1 = 1 - ramp(t, at(c, 4) - 0.3, 0.4);
  const ph2 = ramp(t, at(c, 4) - 0.3, 0.4) * (1 - ramp(t, at(c, 6) - 0.3, 0.4));
  const ph3 = ramp(t, at(c, 6) - 0.3, 0.4);
  const reveal = ramp(t, at(c, 5), 1.6);
  const bloom = ramp(t, at(c, 6), 3);
  const flame = ramp(t, 0.6, 0.3);
  return (
    <g>
      {ph1 > 0 && (
        <g opacity={ph1}>
          {/* спичка */}
          <g transform={`translate(${x - 360} 520) rotate(-20)`}>
            <rect x={-8} y={-10} width={16} height={200} rx={6} fill="#f1c27d" stroke={OL} strokeWidth={3} />
            <ellipse cx={0} cy={-16} rx={14} ry={20} fill="#c0392b" stroke={OL} strokeWidth={3} />
            {flame > 0 && <path d={`M 0 ${-90 - Math.sin(t * 12) * 6} Q 30 -50 0 -26 Q -30 -50 0 ${-90 - Math.sin(t * 12) * 6} Z`} fill="#ffb020" opacity={flame} transform={`scale(${flame})`} />}
          </g>
          <Pop t={t} at={at(c, 0.4)} x={x - 360} y={800}>
            <Tag x={0} y={0} text="легко, как зажечь спичку" size={30} color={C.yellow} />
          </Pop>
          <Pop t={t} at={at(c, 1)} x={x + 80} y={330}>
            <g>
              <circle r={70} fill="#fff" stroke={OL} strokeWidth={4} />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d="M 0 -30 L 6 -6 L 30 0 L 6 6 L 0 30 L -6 6 L -30 0 L -6 -6 Z" fill={C.yellowDeep} transform={`rotate(${t * 20 + i * 22}) scale(${0.6 + i * 0.12})`} opacity={0.5} />
              ))}
              <Tag x={0} y={110} text="из ничего" size={28} color={C.white} />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 1.4)} x={x + 380} y={330}>
            <g>
              <circle r={70} fill="#fff" stroke={OL} strokeWidth={4} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={-46 + i * 32} y={-10 - (i % 2) * 26} width={30} height={30} rx={6} fill={[C.coral, C.sky, C.green][i]} stroke={OL} strokeWidth={3} />
              ))}
              <Tag x={0} y={110} text="из того, что есть" size={28} color={C.white} />
            </g>
          </Pop>
          {ramp(t, at(c, 2), 0.5) > 0 && (
            <g opacity={ramp(t, at(c, 2), 0.5)}>
              <Person x={x + 230} y={830} s={1.2} color={C.violet} t={t} />
              <Bubble x={x + 280} y={560} w={380} h={110} tail={[x + 250, 700]} />
              <Txt x={x + 470} y={625} size={28}>
                «из ничего — ничего»
              </Txt>
              <Pop t={t} at={at(c, 3)} x={x - 40} y={640}>
                <Tag x={0} y={0} text="верно лишь для людей и причин" size={28} color="#ffd6d6" />
              </Pop>
            </g>
          )}
        </g>
      )}
      {ph2 > 0 && (
        <g opacity={ph2} transform={`translate(${x} 500)`}>
          <rect x={-320} y={-260} width={640} height={480} rx={16} fill="#fffdf7" stroke={OL} strokeWidth={5} />
          <defs>
            <clipPath id="inkClip">
              <rect x={-320} y={-260} width={640 * reveal} height={480} />
            </clipPath>
          </defs>
          <g clipPath="url(#inkClip)">
            <Flower x={-120} y={170} color={C.coral} s={1.6} t={t} />
            <Tree x={150} y={190} s={0.9} t={t} fruits={4} />
          </g>
          <g transform={`translate(${-320 + 640 * reveal} ${-40 + Math.sin(t * 6) * 40}) rotate(20)`}>
            <rect x={-12} y={-150} width={24} height={120} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
            <path d="M -16 -30 Q 0 20 16 -30 Z" fill="#7dd3fc" stroke={OL} strokeWidth={3} />
          </g>
          <Tag x={0} y={-300} text="невидимые чернила проявляются" size={32} color={C.yellow} />
        </g>
      )}
      {ph3 > 0 && (
        <g opacity={ph3}>
          <path d="M 0 760 Q 480 720 960 760 T 1920 750 L 1920 1080 L 0 1080 Z" fill="#bfe6a5" />
          {Array.from({ length: 22 }).map((_, i) => {
            const k = clamp01(bloom * 22 - i);
            return <Flower key={i} x={x - 640 + ((i * 59) % 1280)} y={800 + ((i * 37) % 120)} color={[C.coral, "#9bb8ff", C.yellowDeep, C.violet, "#ff8fd1"][i % 5]} s={0.7 * k} kind={i % 3} stem={80 + (i % 4) * 20} t={t} />;
          })}
          <Pop t={t} at={at(c, 7)} x={x - 400} y={420}>
            <Fly x={0} y={wob(t * 2, 1, 12)} s={0.8} t={t} />
          </Pop>
          <Pop t={t} at={at(c, 7.3)} x={x + 380} y={380}>
            <g transform={`translate(0 ${wob(t * 2, 2, 10)})`}>
              <ellipse rx={50} ry={34} fill="#ffd166" stroke={OL} strokeWidth={4} />
              <circle cx={40} cy={-30} r={24} fill="#ffd166" stroke={OL} strokeWidth={4} />
              <circle cx={48} cy={-34} r={4} fill={OL} />
              <path d="M 62 -30 L 80 -24 L 62 -20 Z" fill="#ff9f43" />
              <path d={`M -20 -10 Q -40 ${-60 + Math.sin(t * 10) * 16} -70 -20`} fill="#ffe08a" stroke={OL} strokeWidth={4} />
            </g>
          </Pop>
          <Pop t={t} at={at(c, 6.3)} x={x} y={170}>
            <Tag x={0} y={0} text="каждую весну — сотни тысяч видов" size={40} color={C.yellow} />
          </Pop>
          <Pop t={t} at={at(c, 8)} x={x} y={280}>
            <Tag x={0} y={0} text="за несколько недель — новый мир" size={34} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const Recap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const icons: { b: number; label: string; draw: () => React.ReactNode }[] = [
    { b: 1, label: "дороги", draw: () => <Txt x={0} y={30} size={90} weight={900}>4</Txt> },
    { b: 2, label: "аптека", draw: () => <Jar x={0} y={40} color="#ff8fa3" s={1.1} /> },
    { b: 3, label: "муха", draw: () => <Fly x={0} y={10} s={0.9} t={t} /> },
    { b: 4, label: "одно перо", draw: () => <Book x={0} y={0} s={0.42} color={C.green} /> },
    { b: 5, label: "одно солнце", draw: () => (<g><Shard x={-30} y={20} s={1.2} /><Drop x={40} y={10} s={0.9} /></g>) },
    { b: 6, label: "рисунок", draw: () => (<g><rect x={-60} y={-50} width={120} height={100} fill="#c98b4a" stroke={OL} strokeWidth={4} /><rect x={-46} y={-36} width={92} height={72} fill="#fff" /><Flower x={0} y={30} color={C.coral} s={0.5} t={t} /></g>) },
    { b: 7, label: "единый Творец", draw: () => <Check x={0} y={0} s={60} k={1} color={C.yellowDeep} /> },
    { b: 8, label: "один корень", draw: () => <Tree x={0} y={70} s={0.42} t={t} fruits={6} /> },
    { b: 9, label: "лекарство души", draw: () => <Heart x={0} y={10} s={1.6} /> },
  ];
  return (
    <g>
      <Pop t={t} at={0.3} x={x} y={130}>
        <Txt x={0} y={0} size={56} weight={900}>
          Что мы узнали
        </Txt>
      </Pop>
      {icons.map((ic, i) => {
        const k = pop(t, at(c, ic.b));
        if (k <= 0) return null;
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <g key={i} transform={`translate(${x - 380 + col * 380} ${290 + row * 230}) scale(${k})`}>
            <rect x={-170} y={-95} width={340} height={200} rx={30} fill="#fff" stroke={i === 6 ? C.yellowDeep : "#e2e8f0"} strokeWidth={i === 6 ? 8 : 4} />
            <g transform="translate(-80 0)">{ic.draw()}</g>
            <Txt x={70} y={14} size={30}>
              {ic.label.replace(" ", "\n")}
            </Txt>
            <Check x={140} y={-70} s={26} k={ramp(t, at(c, ic.b) + 0.4, 0.4)} />
          </g>
        );
      })}
    </g>
  );
};

export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ayah = ramp(t, at(c, 1), 1) * (1 - ramp(t, at(c, 2) - 0.2, 0.5));
  const bye = pop(t, at(c, 2));
  return (
    <g>
      <g opacity={ayah} transform="translate(960 150)">
        <rect x={-640} y={-110} width={1280} height={220} rx={40} fill="#fffdf6" stroke="#e8c96a" strokeWidth={8} />
        <Txt x={0} y={-30} size={40} weight={800}>
          {"«Нет у нас знаний, кроме тех, которым Ты научил нас.\nПоистине, Ты — Знающий, Мудрый»"}
        </Txt>
        <Txt x={0} y={85} size={24} weight={700} color={C.inkSoft}>
          Коран, сура 2, аят 32 (смысловой перевод)
        </Txt>
      </g>
      <Pop t={t} at={at(c, 0.2)} x={360} y={820}>
        <Heart x={0} y={0} s={2.4} />
      </Pop>
      {bye > 0 && (
        <g>
          <g transform={`translate(960 200) scale(${bye})`}>
            <Txt x={0} y={0} size={96} weight={900}>
              Спасибо за внимание
            </Txt>
            <Txt x={0} y={70} size={40} weight={700} color={C.inkSoft}>
              до встречи в следующей книге
            </Txt>
          </g>
          {/* знак канала BanaMind — в правом верхнем углу, не за ведущим */}
          <g transform="translate(1560 64)" opacity={bye}>
            <rect x={-330} y={-34} width={660} height={64} rx={32} fill={BRAND.ink} />
            <text x={-300} y={11} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34}>
              <tspan fill="#fff">{BRAND.wordmark[0]}</tspan>
              <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
            </text>
            <text x={300} y={9} textAnchor="end" fontFamily={FONTS.heavy} fontWeight={800} fontSize={24} fill="#d9deea">
              {BRAND.slogan}
            </text>
          </g>
          <Flower x={300} y={900} color={C.coral} s={1.5} t={t} />
          <Flower x={1560} y={900} color={C.violet} s={1.4} kind={2} t={t} />
          <Tree x={1720} y={900} s={0.9} t={t} fruits={5} />
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={200 + ((i * 151) % 1520)} cy={420 + ((t * 80 + i * 70) % 400)} r={8} fill={[C.coral, C.yellow, C.sky, C.green][i % 4]} opacity={0.7} />
          ))}
        </g>
      )}
    </g>
  );
};
