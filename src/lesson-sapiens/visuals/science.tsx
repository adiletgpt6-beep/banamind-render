// Часть «Наука»: открытие незнания (карты), три черты науки, медицина, кто платит
// за науку, вера в растущий пирог (без механики кредита), цена равнодушия,
// энергия, расписание, семья/государство/рынок, «самое мирное время» с датой.
import React from "react";
import { C } from "../theme";
import { Clock, Factory, Gear, Island, Person, Ship, Stage } from "./island";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";

// ── s01: карты без пустот и карты с белыми пятнами ──
export const Maps: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const old = pop(t, at(c, 2));
  const nw = pop(t, at(c, 3));
  const inv = ramp(t, at(c, 4), 0.8);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={170}>
        <Panel x={-260} y={-70} w={520} h={120} fill={C.ink} />
        <Txt x={0} y={14} size={50} color={C.yellow}>
          «мы не знаем»
        </Txt>
      </Pop>
      {old > 0 && (
        <g transform={`translate(330 480) scale(${old}) rotate(-3)`}>
          <rect x={-250} y={-180} width={500} height={360} rx={16} fill="#f4e3c0" stroke={C.wood} strokeWidth={6} />
          <path d="M -200 -100 Q -100 -160 0 -110 Q 100 -60 190 -120 L 200 140 L -210 150 Z" fill="#d7b98a" />
          {[[-120, -40], [20, 10], [120, 60], [-60, 90]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={18} fill="#b68f5b" />
          ))}
          <Txt x={0} y={230} size={30} color={C.ink}>
            середина XV века: всё «известно»
          </Txt>
        </g>
      )}
      {nw > 0 && (
        <g transform={`translate(950 480) scale(${nw}) rotate(2)`}>
          <rect x={-250} y={-180} width={500} height={360} rx={16} fill="#f4e3c0" stroke={C.wood} strokeWidth={6} />
          <path d="M -230 -150 Q -150 -170 -90 -120 Q -60 -40 -120 40 Q -170 130 -230 150 Z" fill="#d7b98a" />
          <rect x={-60} y={-150} width={280} height={290} rx={20} fill={C.white} stroke={C.inkSoft} strokeWidth={4} strokeDasharray="14 10" />
          <Txt x={80} y={10} size={64} color={C.inkSoft}>
            ?
          </Txt>
          <Txt x={0} y={230} size={30} color={C.ink}>
            белые пятна
          </Txt>
        </g>
      )}
      {inv > 0 && (
        <g opacity={inv}>
          <Ship x={900 + inv * 80} y={480} s={0.5} t={t} />
          <Tag x={640} y={820} text="пустое место — приглашение узнать" color={C.yellow} size={36} />
        </g>
      )}
    </Stage>
  );
};

// ── s02: три черты науки ──
export const Pillars: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = [
    { title: "признать", sub: "незнание", at: at(c, 1.05) },
    { title: "наблюдения", sub: "и математика", at: at(c, 1.35) },
    { title: "новые", sub: "возможности", at: at(c, 1.7) },
  ];
  const power = pop(t, at(c, 2.6));
  return (
    <Stage host={c.p.host}>
      <rect x={140} y={250} width={1000} height={40} rx={10} fill={C.steel} opacity={ramp(t, 0.2, 0.6)} />
      {items.map((it, i) => {
        const k = ramp(t, it.at, 0.7);
        return (
          <g key={i} transform={`translate(${280 + i * 360} 300)`}>
            <rect x={-90} y={0} width={180} height={420 * k} rx={12} fill={[C.skyDeep, C.violet, C.green][i]} opacity={0.85} />
            {k > 0.6 && (
              <>
                <Txt x={0} y={180} size={36} color={C.white}>
                  {it.title}
                </Txt>
                <Txt x={0} y={230} size={30} color={C.white}>
                  {it.sub}
                </Txt>
              </>
            )}
          </g>
        );
      })}
      {power > 0 && (
        <g transform={`translate(640 170) scale(${power})`}>
          <Tag x={0} y={0} text="«знание — сила» (Бэкон)" color={C.yellow} size={40} />
        </g>
      )}
    </Stage>
  );
};

// ── s02b: медицина — данные книги ──
export const Medicine: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bars = ramp(t, at(c, 1), 2);
  const life = ramp(t, at(c, 1.7), 1);
  const a = 150;
  const b = 150 - 145 * bars;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.4} x={640} y={170}>
        <Tag x={0} y={0} text="болезни — задача, а не судьба" color={C.white} size={38} />
      </Pop>
      <g transform="translate(140 700)">
        <rect x={0} y={-a * 2.6} width={200} height={a * 2.6} rx={10} fill={C.coral} opacity={ramp(t, at(c, 1), 0.5)} />
        <rect x={300} y={-b * 2.6} width={200} height={Math.max(4, b * 2.6)} rx={10} fill={C.green} opacity={ramp(t, at(c, 1.3), 0.5)} />
        <Txt x={100} y={50} size={30} color={C.ink}>
          XVII век
        </Txt>
        <Txt x={400} y={50} size={30} color={C.ink}>
          время книги
        </Txt>
        <Txt x={100} y={-a * 2.6 - 20} size={40} color={C.coral} opacity={ramp(t, at(c, 1), 0.5)}>
          150
        </Txt>
        <Txt x={400} y={-b * 2.6 - 20} size={40} color={C.greenDeep} opacity={ramp(t, at(c, 1.3), 0.5)}>
          {String(Math.round(b))}
        </Txt>
        <Txt x={250} y={100} size={26} color={C.inkSoft}>
          из 1000 младенцев, Англия
        </Txt>
      </g>
      {life > 0 && (
        <g opacity={life} transform="translate(970 470)">
          <circle r={170} fill={C.white} />
          <circle r={170} fill="none" stroke={C.green} strokeWidth={22} strokeDasharray={`${life * 0.67 * 1068} 2000`} transform="rotate(-90)" />
          <Txt x={0} y={10} size={64} color={C.ink}>
            67
          </Txt>
          <Txt x={0} y={60} size={28} color={C.inkSoft}>
            лет в среднем
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s03: наука — империя — деньги ──
export const Triangle: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const nodes = [
    { x: 640, y: 230, label: "наука", color: C.skyDeep },
    { x: 300, y: 650, label: "правители\nи армии", color: C.violet },
    { x: 980, y: 650, label: "торговые\nкомпании", color: C.yellowDeep },
  ];
  const loop = ramp(t, at(c, 1), 1.5);
  const cook = pop(t, at(c, 2));
  const both = ramp(t, at(c, 4), 0.8);
  return (
    <Stage host={c.p.host}>
      {nodes.map((n, i) => {
        const k = pop(t, i === 0 ? 0.3 : at(c, 1.3 + i * 0.2));
        return k > 0 ? (
          <g key={i} transform={`translate(${n.x} ${n.y}) scale(${k})`}>
            <circle r={110} fill={n.color} />
            <Txt x={0} y={n.label.includes("\n") ? -8 : 12} size={34} color={C.white}>
              {n.label}
            </Txt>
          </g>
        ) : null;
      })}
      <Arrow x1={520} y1={300} x2={370} y2={540} k={loop} color={C.inkSoft} w={8} bend={0.1} />
      <Arrow x1={420} y1={680} x2={860} y2={680} k={loop} color={C.inkSoft} w={8} bend={0.1} />
      <Arrow x1={910} y1={540} x2={760} y2={300} k={loop} color={C.inkSoft} w={8} bend={0.1} />
      {cook > 0 && (
        <g transform={`translate(640 520) scale(${cook})`}>
          <Ship x={0} y={0} s={0.6} t={t} />
          <Txt x={0} y={90} size={28} color={C.ink}>
            плавание Кука
          </Txt>
        </g>
      )}
      {both > 0 && (
        <g opacity={both}>
          <Tag x={330} y={830} text="помощь" color="#eafbef" size={34} />
          <Tag x={950} y={830} text="угнетение" color="#fff1ee" size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── s04: растущий пирог (только идея роста и доверия к будущему) ──
export const Pie: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fixed = ramp(t, at(c, 1), 0.6);
  const grow = ramp(t, at(c, 2), 2.4);
  const nomech = pop(t, at(c, 3));
  const trust = pop(t, at(c, 4));
  const r = 150 + grow * 90;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={160}>
        <Tag x={0} y={0} text="исторический анализ, не совет" color={C.white} size={34} />
      </Pop>
      <g transform="translate(640 470)">
        <circle r={r} fill={C.wheat} />
        <circle r={r * 0.86} fill="#f3cf6b" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i / 5) * Math.PI * 2) * r} y2={Math.sin((i / 5) * Math.PI * 2) * r} stroke={C.wood} strokeWidth={5} opacity={fixed} />
        ))}
      </g>
      {fixed > 0 && grow < 0.3 && (
        <g opacity={fixed * (1 - grow * 3)}>
          <Txt x={220} y={480} size={34} color={C.red}>
            кто-то богатеет
          </Txt>
          <Txt x={1060} y={480} size={34} color={C.red}>
            кто-то беднеет
          </Txt>
        </g>
      )}
      {grow > 0.3 && (
        <g opacity={clamp01(grow * 2 - 0.6)}>
          <Txt x={640} y={800} size={40} color={C.ink}>
            «пирог может расти»
          </Txt>
        </g>
      )}
      {nomech > 0 && (
        <g transform={`translate(1060 260) scale(${nomech})`} opacity={1 - trust}>
          <Panel x={-200} y={-60} w={400} h={110} fill="#fff1ee" />
          <Txt x={0} y={12} size={28} color={C.red}>
            механизмы не разбираем
          </Txt>
        </g>
      )}
      {trust > 0 && (
        <g transform={`translate(640 470) scale(${trust})`}>
          <rect x={-280} y={-50} width={560} height={96} rx={48} fill={C.ink} />
          <Txt x={0} y={14} size={36} color={C.yellow}>
            доверие к будущему
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s05: цена равнодушия (без шоковых изображений) ──
export const Indifference: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const scale = ramp(t, 0.3, 0.8);
  const heavy = ramp(t, at(c, 1), 1);
  const cold = pop(t, at(c, 2));
  const tilt = -14 * heavy;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 560)" opacity={scale}>
        <rect x={-12} y={-20} width={24} height={240} fill={C.inkSoft} />
        <g transform={`rotate(${tilt})`}>
          <rect x={-380} y={-30} width={760} height={18} rx={9} fill={C.ink} />
          <g transform="translate(-330 0)">
            <path d="M -100 100 L 100 100 L 70 140 L -70 140 Z" fill={C.yellow} />
            <Txt x={0} y={80} size={32} color={C.ink}>
              прибыль
            </Txt>
          </g>
          <g transform="translate(330 0)">
            <path d="M -100 100 L 100 100 L 70 140 L -70 140 Z" fill={C.coral} />
            <Txt x={0} y={80} size={32} color={C.ink}>
              люди
            </Txt>
          </g>
        </g>
      </g>
      <Pop t={t} at={0.5} x={640} y={170}>
        <Tag x={0} y={0} text="рынок без политики — наивность" color={C.white} size={34} />
      </Pop>
      {cold > 0 && (
        <g transform={`translate(640 300) scale(${cold})`}>
          <Panel x={-330} y={-56} w={660} h={100} fill="#e9f0fb" />
          <Txt x={0} y={12} size={36} color={C.skyDeep}>
            не ненависть, а равнодушие
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s06: энергия — солнце, мускулы, пар ──
export const Energy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sun = ramp(t, at(c, 1), 0.6);
  const convert = ramp(t, at(c, 2), 0.6);
  const kettle = pop(t, at(c, 3));
  const train = ramp(t, at(c, 3.6), 2);
  const limit = pop(t, at(c, 4));
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={160}>
        <Tag x={0} y={0} text="энергия — ключ к машинам" color={C.white} size={38} />
      </Pop>
      {sun > 0 && (
        <g opacity={sun * (1 - kettle * 0.7)}>
          <circle cx={200} cy={240} r={70} fill={C.yellow} />
          <Arrow x1={290} y1={260} x2={430} y2={330} k={sun} color={C.yellowDeep} w={7} />
          <g transform="translate(500 400)">
            <path d="M 0 40 Q -10 -30 0 -60 Q 30 -40 20 40 Z" fill={C.green} />
            <path d="M 0 40 Q -40 -10 -30 -40 Q 0 -20 0 40 Z" fill={C.palm} />
          </g>
          <Arrow x1={560} y1={400} x2={690} y2={400} k={sun} color={C.yellowDeep} w={7} />
          <Person x={780} y={470} s={1.2} i={2} t={t} arm={Math.sin(t * 3)} />
          <Txt x={480} y={540} size={32} color={C.ink}>
            солнце — растения — мускулы
          </Txt>
        </g>
      )}
      {convert > 0 && kettle <= 0 && (
        <g opacity={convert}>
          <Txt x={640} y={690} size={40} color={C.ink}>
            тепло превращается в движение
          </Txt>
        </g>
      )}
      {kettle > 0 && (
        <g transform={`translate(300 520) scale(${kettle})`}>
          <path d="M -110 0 Q -120 -120 0 -130 Q 120 -120 110 0 Z" fill={C.steel} />
          <rect x={-120} y={-10} width={240} height={30} rx={10} fill="#5b6a82" />
          <g transform={`translate(0 ${-140 - Math.abs(Math.sin(t * 9)) * 18}) rotate(${Math.sin(t * 9) * 6})`}>
            <ellipse rx={80} ry={16} fill="#8494ad" />
            <circle cy={-20} r={12} fill="#5b6a82" />
          </g>
          {[0, 1, 2].map((i) => {
            const ph = (t * 0.7 + i / 3) % 1;
            return <circle key={i} cx={100 + ph * 60} cy={-160 - ph * 120} r={16 + ph * 24} fill="#dfe5ee" opacity={0.8 * (1 - ph)} />;
          })}
        </g>
      )}
      {train > 0 && (
        <g transform={`translate(${520 + train * 380} 600)`}>
          <rect x={-160} y={-90} width={240} height={90} rx={14} fill={C.red} />
          <rect x={80} y={-140} width={80} height={140} rx={10} fill={C.ink} />
          <rect x={-130} y={-170} width={40} height={80} fill={C.ink} />
          {[-110, -20, 100].map((x) => (
            <circle key={x} cx={x} cy={10} r={30} fill={C.ink} />
          ))}
          <Gear x={-20} y={10} r={18} rot={t * 300} color={C.steel} />
        </g>
      )}
      {limit > 0 && (
        <g transform={`translate(640 180) scale(${limit})`}>
          <Panel x={-430} y={-60} w={860} h={110} fill={C.ink} />
          <Txt x={0} y={12} size={34} color={C.yellow}>
            предел — не энергия, а незнание
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s07: расписание вместо солнца ──
export const Schedule: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const line = ramp(t, 0.3, 1);
  const rail = ramp(t, at(c, 1), 1);
  const island = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <Clock x={240} y={330} r={130} t={t} speed={8} />
      <g opacity={line * (1 - island)}>
        <Factory x={760} y={440} s={1.2} t={t} />
        <rect x={420} y={460} width={680} height={36} rx={18} fill={C.inkSoft} />
        {Array.from({ length: 7 }).map((_, i) => (
          <rect key={i} x={430 + ((i * 100 + t * 80) % 660)} y={430} width={60} height={30} rx={6} fill={C.yellow} />
        ))}
      </g>
      {rail > 0 && (
        <g opacity={rail * (1 - island)}>
          <Panel x={420} y={560} w={680} h={170} fill={C.white} />
          <Txt x={760} y={630} size={34} color={C.ink}>
            единое время по Гринвичу
          </Txt>
          <Txt x={760} y={690} size={30} color={C.inkSoft}>
            из-за железных дорог
          </Txt>
        </g>
      )}
      {island > 0 && (
        <g opacity={island}>
          <Island x={700} y={560} w={760} t={t} palms />
          <Clock x={700} y={330} r={100} t={t} speed={3} />
          <Tag x={700} y={720} text="не солнце, а расписание" color={C.yellow} size={36} />
        </g>
      )}
    </Stage>
  );
};

// ── s08: семья и община → государство и рынок ──
export const FamilyState: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fam = ramp(t, at(c, 1), 0.8);
  const shift = ramp(t, at(c, 2), 1.5);
  const free = pop(t, at(c, 3));
  const nations = ramp(t, at(c, 4), 1);
  const roles = ["работа", "защита", "помощь в болезни", "забота в старости"];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 460)" opacity={fam}>
        <circle r={210 - shift * 60} fill="#fff1e0" stroke={C.coral} strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return <Person key={i} x={Math.cos(a) * 90 * (1 - shift * 0.3)} y={Math.sin(a) * 60 + 40} s={0.8} i={i + 1} t={t} />;
        })}
        <Txt x={0} y={-230 + shift * 60} size={34} color={C.coral}>
          семья и община
        </Txt>
      </g>
      {roles.map((r, i) => {
        const k = ramp(t, at(c, 1.2 + i * 0.15), 0.5);
        const x = 720 + (980 - 720) * shift;
        return k > 0 ? (
          <g key={r} transform={`translate(${x} ${240 + i * 80})`} opacity={k}>
            <rect x={-150} y={-30} width={300} height={56} rx={28} fill={C.white} />
            <Txt x={0} y={10} size={28} color={C.ink}>
              {r}
            </Txt>
          </g>
        ) : null;
      })}
      {shift > 0 && (
        <g opacity={shift} transform="translate(980 650)">
          <rect x={-240} y={0} width={220} height={130} rx={12} fill={C.skyDeep} />
          <Txt x={-130} y={78} size={30} color={C.white}>
            государство
          </Txt>
          <rect x={20} y={0} width={220} height={130} rx={12} fill={C.yellowDeep} />
          <Txt x={130} y={78} size={30} color={C.white}>
            рынок
          </Txt>
        </g>
      )}
      {free > 0 && (
        <g transform={`translate(640 150) scale(${free})`} opacity={1 - nations}>
          <Tag x={0} y={0} text="свобода — но слабее связи" color={C.yellow} size={34} />
        </g>
      )}
      {nations > 0 && (
        <g opacity={nations}>
          <Tag x={640} y={150} text="воображаемые сообщества: нации, потребители" color={C.white} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── s09: «самое мирное время» — оценка с датой ──
export const Peace: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const graph = ramp(t, at(c, 1), 2);
  const stamp = pop(t, at(c, 2));
  const pts = [0.85, 0.7, 0.62, 0.4, 0.28, 0.15];
  const n = 1 + graph * (pts.length - 1);
  let d = "";
  for (let i = 0; i < Math.floor(n); i++) d += `${i ? "L" : "M"} ${180 + i * 190} ${700 - pts[i] * 420}`;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={160}>
        <Tag x={0} y={0} text="самое мирное время? — оценка автора" color={C.white} size={34} />
      </Pop>
      <line x1={150} y1={720} x2={1150} y2={720} stroke={C.ink} strokeWidth={6} />
      <line x1={150} y1={260} x2={150} y2={720} stroke={C.ink} strokeWidth={6} />
      <Txt x={170} y={250} size={26} color={C.inkSoft} anchor="start">
        доля погибших от насилия
      </Txt>
      {graph > 0 && <path d={d} stroke={C.skyDeep} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {graph > 0.95 && <Txt x={1130} y={600} size={30} color={C.skyDeep}>около 1,5 %</Txt>}
      {stamp > 0 && (
        <g transform={`translate(880 380) rotate(-8) scale(${stamp})`}>
          <rect x={-230} y={-70} width={460} height={140} rx={16} fill="none" stroke={C.red} strokeWidth={8} />
          <Txt x={0} y={-6} size={40} color={C.red}>
            глава 2012 года
          </Txt>
          <Txt x={0} y={42} size={28} color={C.red}>
            не гарантия навсегда
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s10: пауза — шестерёнки ──
export const PauseGear: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <g>
      <Gear x={330} y={420} r={150} teeth={12} rot={t * 12} color="#b8c3d6" />
      <Gear x={540} y={250} r={90} teeth={9} rot={-t * 20} color="#c9d6ea" />
      <Gear x={1600} y={420} r={150} teeth={12} rot={-t * 12} color="#b8c3d6" />
      <Gear x={1390} y={250} r={90} teeth={9} rot={t * 20} color="#c9d6ea" />
      <Txt x={960} y={180} size={44} color={C.inkSoft}>
        на кого вы опираетесь?
      </Txt>
    </g>
  );
};

