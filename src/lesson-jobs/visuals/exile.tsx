// «Изгнание»: сладкая водичка, падение продаж, схема компании с одиноким квадратом,
// идеальный куб NeXT, провал-подготовка, Pixar и «сделай отличный фильм».
import React from "react";
import { C } from "../theme";
import { Coin, Compact, Cube, Note, OL, Person, Stage } from "./draw";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── x01: «сладкая водичка или изменить мир» ──
export const SugarWater: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pair = ramp(t, 0.2, 0.8);
  const q = ramp(t, at(c, 1), 1);
  const calls = ramp(t, at(c, 2), 1.2);
  return (
    <Stage host={c.p.host}>
      {/* балкон, вечерний город */}
      <rect x={60} y={140} width={1160} height={520} rx={30} fill="#ffcf9e" opacity={0.6} />
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={90 + i * 125} y={660 - 120 - ((i * 53) % 200)} width={100} height={120 + ((i * 53) % 200)} fill="#8a6b7a" opacity={0.55} />
      ))}
      <rect x={60} y={640} width={1160} height={26} rx={10} fill={OL} opacity={0.7} />
      <g opacity={pair}>
        <Person x={380} y={860} s={0.55} color={C.ink} name="Джобс" t={t} gesture={q > 0.3 ? "point" : "stand"} />
        <Person x={880} y={860} s={0.55} color={C.steelDark} name="Скалли" t={t} seed={2} flip />
      </g>
      {q > 0 && (
        <g opacity={q}>
          <g transform="translate(400 300)">
            <path d="M -40 -110 L 40 -110 L 50 -70 Q 70 -40 70 0 L 70 110 L -70 110 L -70 0 Q -70 -40 -50 -70 Z" fill={C.coral} opacity={0.75} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={170} size={28} color={C.inkSoft}>
              {"сладкая вода?"}
            </Txt>
          </g>
          <g transform="translate(880 300)">
            <circle r={110} fill={C.sky} stroke={OL} strokeWidth={4} />
            <path d="M -60 -50 Q -20 -80 20 -40 Q 50 -10 80 -40 M -90 20 Q -40 0 0 30 Q 40 60 90 20" stroke={C.green} strokeWidth={22} fill="none" strokeLinecap="round" />
            <Txt x={0} y={170} size={28} color={C.inkSoft}>
              {"или изменить мир?"}
            </Txt>
          </g>
          <Txt x={640} y={310} size={60} weight={900} color={C.ink}>
            {"?"}
          </Txt>
        </g>
      )}
      {calls > 0 && (
        <g opacity={calls * (1 - 0.6 * ramp(t, at(c, 2.6), 0.6))}>
          {Array.from({ length: 10 }).map((_, i) => (
            <path key={i} d={`M 470 ${720 - i * 10} Q 640 ${640 - i * 18 + Math.sin(t * 3 + i) * 8} 790 ${720 - i * 10}`} stroke={C.yellowDeep} strokeWidth={3} fill="none" opacity={clamp01(calls * 10 - i)} />
          ))}
          <Tag x={640} y={570} text="по 10 звонков в день" color={C.white} size={28} />
        </g>
      )}
    </Stage>
  );
};

// ── x02: продажи падают ──
export const SalesDrop: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const specs = ramp(t, 0.2, 1.5);
  const price = pop(t, at(c, 1) + 0.2);
  const drop = ramp(t, at(c, 2), 2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(230 560)">
        <Compact x={0} y={150} s={0.9} t={t} face={false} />
        {["мало памяти", "нет жёсткого диска", "нет вентилятора"].map((w, i) => (
          <g key={w} opacity={clamp01(specs * 3 - i)} transform={`translate(0 ${-380 + i * 70})`}>
            <rect x={-190} y={-26} width={380} height={52} rx={26} fill="#fff1ee" stroke={C.red} strokeWidth={3} />
            <Txt x={0} y={10} size={26} color={C.red}>
              {w}
            </Txt>
          </g>
        ))}
      </g>
      {price > 0 && (
        <g transform={`translate(640 300) scale(${price}) rotate(-6)`} opacity={clamp01(price)}>
          <rect x={-150} y={-60} width={300} height={120} rx={20} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={20} size={52} weight={900}>
            {"2495$"}
          </Txt>
        </g>
      )}
      <g transform="translate(560 360)">
        <line x1={0} y1={420} x2={640} y2={420} stroke={OL} strokeWidth={4} />
        <line x1={0} y1={0} x2={0} y2={420} stroke={OL} strokeWidth={4} />
        {[0.95, 0.82, 0.6, 0.42, 0.25, 0.1].map((h, i) => {
          const k = clamp01(drop * 6 - i);
          return <rect key={i} x={30 + i * 100} y={420 - 380 * h * k} width={70} height={380 * h * k} rx={8} fill={i < 2 ? C.green : i < 4 ? C.yellowDeep : C.red} />;
        })}
        <Txt x={320} y={470} size={26} color={C.inkSoft}>
          {"продажи по месяцам (схема)"}
        </Txt>
        {drop > 0.8 && (
          <Pop t={t} at={at(c, 2.7)} x={540} y={140}>
            <Tag x={0} y={0} text="10 % прогноза" color={C.red} size={30} textColor={C.white} />
          </Pop>
        )}
      </g>
    </Stage>
  );
};

// ── x03: схема компании и одинокий квадрат ──
export const OrgChart: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const board = ramp(t, at(c, 0.4), 0.8);
  const coup = ramp(t, at(c, 1), 1.2);
  const cut = ramp(t, at(c, 2), 1.4);
  const versions = ramp(t, at(c, 3), 0.8);
  const nodes = [
    [640, 200, "совет"],
    [640, 340, "Скалли"],
    [380, 480, "Mac"],
    [640, 480, "Apple II"],
    [900, 480, "продажи"],
  ] as const;
  const jx = 1100;
  const jy = 300 + cut * 120;
  return (
    <Stage host={c.p.host}>
      {nodes.map(([x, y, n], i) => (
        <g key={n}>
          {i > 0 && <line x1={i === 1 ? 640 : 640} y1={i === 1 ? 230 : 370} x2={x} y2={y - 30} stroke={OL} strokeWidth={4} opacity={0.6} />}
          <rect x={x - 100} y={y - 30} width={200} height={60} rx={14} fill={i === 0 ? C.yellow : C.white} stroke={OL} strokeWidth={3} />
          <Txt x={x} y={y + 10} size={26} weight={900}>
            {n}
          </Txt>
        </g>
      ))}
      {board > 0 && (
        <g opacity={board}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Check key={i} x={500 + i * 56} y={140} s={18} k={clamp01(board * 6 - i)} />
          ))}
          <Txt x={950} y={150} size={24} color={C.inkSoft}>
            {"единогласно"}
          </Txt>
        </g>
      )}
      {/* квадрат Джобса: сначала у Mac, потом отдельно */}
      <g>
        {cut < 0.5 && <line x1={380} y1={510} x2={cut > 0 ? 380 : 380} y2={600} stroke={OL} strokeWidth={4} opacity={1 - cut * 2} />}
        <g transform={`translate(${380 + (jx - 380) * cut} ${630 + (jy - 630) * cut})`}>
          <rect x={-110} y={-32} width={220} height={64} rx={14} fill={cut > 0.5 ? C.concrete : C.white} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={10} size={24} weight={900}>
            {cut > 0.5 ? "председатель" : "Джобс"}
          </Txt>
        </g>
      </g>
      {coup > 0 && coup < 1 && (
        <g opacity={Math.sin(coup * Math.PI)}>
          <Note x={380} y={760} text={"план: убрать Скалли"} k={1} color="#ffe3de" size={26} rot={-3} />
          <Arrow x1={520} y1={760} x2={760} y2={760} k={coup} color={C.red} />
          <Person x={860} y={860} s={0.32} color={C.violet} name="Гассе" t={t} flip />
        </g>
      )}
      {versions > 0 && (
        <g opacity={versions}>
          <Note x={330} y={780} text={"Джобс: «предатель»"} k={versions} color="#eef6ff" size={26} rot={-2} />
          <Note x={950} y={780} text={"Скалли: «не могу доверять»"} k={versions} color="#fff4e0" size={26} rot={2} />
          <Tag x={640} y={640} text="решение многих людей" color={C.yellow} size={28} />
        </g>
      )}
    </Stage>
  );
};

// ── x04: идеальный куб NeXT ──
export const NextCube: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cube = pop(t, 0.3);
  const ruler = ramp(t, at(c, 1), 1);
  const factory = ramp(t, at(c, 2), 1.4);
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(380 ${470 + wob(t, 1, 4)}) scale(${1.2 * cube}) rotate(${wob(t * 0.4, 2, 2)})`} opacity={clamp01(cube)}>
        <Cube x={0} y={0} s={1} />
      </g>
      {ruler > 0 && (
        <g opacity={ruler}>
          <line x1={250} y1={700} x2={250 + 270 * ruler} y2={700} stroke={C.yellowDeep} strokeWidth={8} />
          <Txt x={380} y={750} size={30} weight={900}>
            {"ровно 1 фут"}
          </Txt>
          <Coin x={380} y={200} r={70} label="650к$" />
          <Txt x={380} y={300} size={24} color={C.inkSoft}>
            {"только формы для отливки"}
          </Txt>
        </g>
      )}
      {factory > 0 && (
        <g opacity={factory} transform="translate(900 470)">
          <Panel x={-300} y={-290} w={600} h={560} fill="#eef1f5" />
          <Txt x={0} y={-220} size={30} weight={900}>
            {"в месяц"}
          </Txt>
          <rect x={-200} y={180 - 360 * factory} width={140} height={360 * factory} rx={10} fill={C.steel} />
          <rect x={60} y={180 - 360 * 0.04 * factory} width={140} height={360 * 0.04 * factory} rx={6} fill={C.red} />
          <Txt x={-130} y={230} size={28}>
            {"можем 10 000"}
          </Txt>
          <Txt x={130} y={230} size={28} color={C.red}>
            {"продали ≤ 400"}
          </Txt>
          <Tag x={0} y={-340} text="цена 6500$" color={C.yellow} size={30} />
        </g>
      )}
    </Stage>
  );
};

// ── x05: провал как подготовка: акты пьесы ──
export const SecondAct: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const soft = ramp(t, 0.3, 1);
  const acts = ramp(t, at(c, 1), 1.6);
  return (
    <Stage host={c.p.host}>
      <g opacity={soft} transform="translate(640 300)">
        <Cube x={-300} y={20} s={0.8} />
        <Arrow x1={-160} y1={0} x2={60} y2={0} k={soft} color={C.violet} />
        <rect x={80} y={-110} width={420} height={220} rx={16} fill={C.screen} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={110 + (i % 3) * 130} y={-80 + Math.floor(i / 3) * 90} width={110} height={70} rx={8} fill={[C.sky, C.green, C.violet, C.coral, C.yellow, C.teal][i]} opacity={0.75} />
        ))}
        <Txt x={290} y={160} size={30} weight={900} color={C.violet}>
          {"программная система NeXTSTEP"}
        </Txt>
      </g>
      {acts > 0 && (
        <g transform="translate(640 690)">
          {["I акт: взлёт", "II акт: провал", "III акт: возвращение"].map((a, i) => {
            const k = clamp01(acts * 3 - i);
            return (
              <g key={a} opacity={k} transform={`translate(${(i - 1) * 400} ${(1 - k) * 20})`}>
                <rect x={-180} y={-70} width={360} height={140} rx={20} fill={i === 1 ? C.ink : C.white} stroke={OL} strokeWidth={3} />
                <Txt x={0} y={10} size={32} weight={900} color={i === 1 ? C.yellow : C.ink}>
                  {a}
                </Txt>
              </g>
            );
          })}
          <Arrow x1={-160} y1={110} x2={330} y2={110} k={clamp01(acts * 1.5 - 0.8)} color={C.yellowDeep} bend={-0.2} />
        </g>
      )}
    </Stage>
  );
};

// ── x06: Pixar: дорогой компьютер не пошёл, лампы покорили зал ──
const Lamp: React.FC<{ x: number; y: number; s: number; t: number; hop?: number }> = ({ x, y, s, t, hop = 0 }) => {
  const jump = Math.abs(Math.sin(t * 3)) * 40 * hop;
  const nod = Math.sin(t * 2.4) * 12;
  return (
    <g transform={`translate(${x} ${y - jump}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={70} ry={16} fill={C.steelDark} />
      <g transform={`rotate(${-20 + nod * 0.4})`}>
        <line x1={0} y1={0} x2={30} y2={-140} stroke={C.steel} strokeWidth={14} strokeLinecap="round" />
        <g transform={`translate(30 -140) rotate(${50 + nod})`}>
          <line x1={0} y1={0} x2={110} y2={0} stroke={C.steel} strokeWidth={14} strokeLinecap="round" />
          <g transform="translate(110 0) rotate(40)">
            <path d="M -30 -10 L 30 -10 L 60 60 L -60 60 Z" fill={C.concrete} stroke={OL} strokeWidth={4} />
            <circle cx={0} cy={60} r={20} fill={C.yellow} />
          </g>
        </g>
      </g>
    </g>
  );
};

export const PixarLab: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const buy = ramp(t, 0.3, 0.8);
  const machine = ramp(t, at(c, 1), 0.8);
  const lamps = ramp(t, at(c, 2), 1);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={30} fill="#1e1838" opacity={0.92} />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={80 + ((i * 197) % 1120)} cy={160 + ((i * 113) % 680)} r={2.5} fill={C.neon} opacity={0.4 + 0.4 * Math.sin(t * 2 + i)} />
      ))}
      <g opacity={buy}>
        <Tag x={640} y={200} text="10 млн $ → доля в Pixar" color={C.neon} size={32} textColor={C.white} />
      </g>
      {machine > 0 && (
        <g opacity={machine * (1 - lamps * 0.6)} transform="translate(330 520)">
          <rect x={-150} y={-160} width={300} height={320} rx={16} fill={C.steelDark} stroke={C.neon} strokeWidth={3} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={-120} y={-130 + i * 46} width={240} height={30} rx={6} fill="#2b3550" />
          ))}
          <Txt x={0} y={220} size={34} weight={900} color={C.coral}>
            {"125 000 $ — не пошёл"}
          </Txt>
        </g>
      )}
      {lamps > 0 && (
        <g opacity={lamps}>
          <rect x={620} y={700} width={560} height={14} rx={7} fill={C.woodLight} />
          <Lamp x={760} y={700} s={1.1} t={t} />
          <Lamp x={1010} y={700} s={0.7} t={t} hop={1} />
          <circle cx={1100 - ((t * 120) % 200)} cy={680} r={18} fill={C.coral} />
          <Txt x={900} y={300} size={30} weight={900} color={C.white}>
            {"Кэтмалл · Смит · Лассетер"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── x07: «сделай отличный фильм» ──
export const TinToy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const money = ramp(t, 0.2, 1.4);
  const ask = ramp(t, at(c, 1), 0.8);
  const prize = pop(t, at(c, 1.7));
  const toys = ramp(t, at(c, 2), 1);
  const trust = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={money * (1 - ask * 0.7)}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Coin key={i} x={300 + (i % 5) * 90} y={300 + Math.floor(i / 5) * 90 + (1 - clamp01(money * 10 - i)) * -80} r={36} />
        ))}
        <Txt x={480} y={520} size={30} color={C.inkSoft}>
          {"≈ 50 млн $ своих денег"}
        </Txt>
      </g>
      {ask > 0 && (
        <g opacity={ask}>
          <Person x={260} y={850} s={0.45} color={C.coral} name="Лассетер" t={t} />
          <Person x={560} y={850} s={0.45} color={C.ink} name="Джобс" t={t} seed={2} gesture="point" flip />
          <Note x={420} y={620} text={"«сделай\nотличный фильм»"} k={ask} color={C.yellow} size={30} />
        </g>
      )}
      {prize > 0 && (
        <g transform={`translate(950 380) scale(${prize})`} opacity={clamp01(prize)}>
          <path d="M -30 140 L 30 140 L 20 100 L -20 100 Z" fill={C.yellowDeep} />
          <rect x={-14} y={-60} width={28} height={160} rx={10} fill={C.yellow} />
          <circle cy={-80} r={30} fill={C.yellow} />
          <Txt x={0} y={200} size={32} weight={900}>
            {"«Оскар»"}
          </Txt>
        </g>
      )}
      {toys > 0 && (
        <g opacity={toys * (1 - prize * 0.3)} transform="translate(950 720)">
          <rect x={-60} y={-80} width={60} height={80} rx={8} fill={C.sky} stroke={OL} strokeWidth={3} transform={`rotate(${wob(t, 1, 6)})`} />
          <circle cx={60} cy={-30} r={30} fill={C.coral} stroke={OL} strokeWidth={3} />
          <rect x={110} y={-90} width={30} height={90} rx={6} fill={C.green} stroke={OL} strokeWidth={3} transform={`rotate(${wob(t, 2, 6)})`} />
          <Txt x={40} y={60} size={26} color={C.inkSoft}>
            {"«История игрушек» — Лассетер и команда"}
          </Txt>
        </g>
      )}
      {trust > 0 && <Tag x={640} y={170} text="доверять творцам" color={C.green} size={34} textColor={C.white} />}
    </Stage>
  );
};
