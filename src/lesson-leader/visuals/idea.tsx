// Часть «Лидер без титула»: рамка истории, маршрут к учителям, табличка должности,
// оркестр, четыре силы, выключатель «жертва/лидер», последний день, маленькие шаги.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { zoneX } from "./hook";
import { Badge, Brick, Bubble, CalendarGrid, Desk, Note, OL, Plate, Sprout, Switch, Tablet, Violin, WateringCan, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// книжный стеллаж
const Shelf: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 420 }) => {
  const cols = ["#e5484d", "#2f8fd0", "#3fb67c", "#ffd23f", "#8e6cf0", "#ff9f43", "#1fa59a"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-300} width={w} height={320} rx={10} fill="#c99060" stroke={OL} strokeWidth={5} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <rect x={-w / 2 + 10} y={-290 + r * 100} width={w - 20} height={86} fill="#a8734a" />
          {Array.from({ length: Math.floor((w - 30) / 26) }).map((_, i) => (
            <rect key={i} x={-w / 2 + 16 + i * 26} y={-280 + r * 100 + ((i * 7 + r) % 3) * 6} width={20} height={76 - ((i * 7 + r) % 3) * 6} rx={3} fill={cols[(i + r * 3) % cols.length]} stroke={OL} strokeWidth={2} />
          ))}
        </g>
      ))}
    </g>
  );
};

export const StoryFrame: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const shop = pop(t, 0.2);
  const auto = ramp(t, at(c, 1), 0.6);
  const tommy = ramp(t, at(c, 2), 1.2);
  const card = pop(t, at(c, 3.2));
  const route = ramp(t, at(c, 4), 1);
  const relay = pop(t, at(c, 5));
  return (
    <g>
      <g opacity={clamp01(shop * 2) * (1 - route * 0.7)} transform={`translate(0 ${(1 - shop) * 30})`}>
        <Shelf x={cx - 330} y={560} />
        <Shelf x={cx + 330} y={560} />
        {/* прилавок */}
        <rect x={cx - 200} y={600} width={400} height={150} rx={14} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
        <Worker x={cx - 60} y={600} s={1.25} role="clerk" t={t} mood={auto > 0.5 && tommy < 0.8 ? "flat" : "smile"} />
        <Txt x={cx} y={710} size={34} color="#fff">
          КНИГИ
        </Txt>
        {/* автопилот: серые одинаковые смены */}
        {auto > 0 && tommy < 1 && (
          <g opacity={auto * (1 - tommy)}>
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${cx - 330 + i * 165} 220)`}>
                <rect x={-60} y={-40} width={120} height={70} rx={14} fill="#c7cdd8" stroke={OL} strokeWidth={3} />
                <Txt x={0} y={8} size={26} color="#5d6678">
                  смена
                </Txt>
              </g>
            ))}
            <Tag x={cx} y={320} text="автопилот" size={34} color="#dfe3ea" />
          </g>
        )}
        {/* пожилой коллега подходит */}
        {tommy > 0 && <Worker x={interpolate(tommy, [0, 1], [cx + 700, cx + 130])} y={600} s={1.2} role="plain" color={C.violet} t={t} arms={0.3} skin="#efc9a6" />}
        {tommy > 0.8 && (
          <g transform={`translate(${cx + 230} 340)`} opacity={(tommy - 0.8) * 5}>
            <Tag x={0} y={0} text="лучший работник" size={30} color={C.yellow} />
          </g>
        )}
      </g>
      {card > 0 && (
        <g transform={`translate(${cx + 30} 300) scale(${card * (1 - route * 0.45)}) rotate(${-4 + wob(t, 1, 1.5)})`}>
          <rect x={-250} y={-110} width={500} height={220} rx={18} fill="#fff" stroke={OL} strokeWidth={5} />
          <text x={-220} y={-56} fontFamily={FONT} fontWeight={700} fontSize={26} fill={C.inkSoft}>
            Томми
          </text>
          <text x={-220} y={-22} fontFamily={FONT} fontWeight={700} fontSize={22} fill={C.grey}>
            должность:
          </text>
          <text x={0} y={60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={C.ink}>
            Человек
          </text>
        </g>
      )}
      {route > 0 && (
        <g opacity={route}>
          <path d={`M ${cx - 480} 690 C ${cx - 240} 560 ${cx - 120} 760 ${cx} 650 S ${cx + 300} 560 ${cx + 480} 680`} fill="none" stroke={C.skyDeep} strokeWidth={10} strokeDasharray="22 18" strokeLinecap="round" />
          {(["maid", "skier", "gardener", "masseur"] as const).map((r, i) => (
            <g key={r} transform={`translate(${cx - 360 + i * 240} ${640 + (i % 2 ? 40 : -20)}) scale(${pop(t, at(c, 4.2) + i * 0.2)})`}>
              <circle cx={0} cy={-70} r={88} fill="#fff" stroke={OL} strokeWidth={4} />
              <Worker x={0} y={0} s={0.82} role={r} t={t} />
            </g>
          ))}
        </g>
      )}
      {relay > 0 && (
        <g transform={`translate(${cx} 880) scale(${relay})`}>
          <Tag x={0} y={-60} text="узнал → передай другим" size={34} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const Route: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const stops = [
    { r: "maid" as const, label: "горничная", x: 520, y: 420, beat: 0.35 },
    { r: "skier" as const, label: "лыжник", x: 900, y: 640, beat: 0.75 },
    { r: "gardener" as const, label: "садовник", x: 1290, y: 400, beat: 1.25 },
    { r: "masseur" as const, label: "массажист", x: 1660, y: 620, beat: 1.75 },
  ];
  const map = pop(t, 0.1);
  const drive = clamp01((t - at(c, 0.2)) / Math.max(1, at(c, 1.9) - at(c, 0.2)));
  const pathD = "M 240 760 C 400 520 440 420 520 420 S 760 700 900 640 S 1140 380 1290 400 S 1560 660 1660 620";
  const L = 1900;
  const carK = drive;
  // приблизительное положение машины на кривой: по ключевым точкам
  const pts = [
    [240, 760],
    [520, 420],
    [900, 640],
    [1290, 400],
    [1660, 620],
  ];
  const seg = Math.min(3.999, carK * 4);
  const si = Math.floor(seg);
  const f = seg - si;
  const carX = pts[si][0] + (pts[si + 1][0] - pts[si][0]) * f;
  const carY = pts[si][1] + (pts[si + 1][1] - pts[si][1]) * f - Math.sin(f * Math.PI) * 60;
  const rule = ramp(t, at(c, 2.3), 0.6);
  return (
    <g opacity={clamp01(map * 2)}>
      {/* кварталы */}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={160 + (i % 7) * 240} y={160 + Math.floor(i / 7) * 520} width={170} height={150} rx={18} fill="#fff" opacity={0.45} />
      ))}
      <path d={pathD} fill="none" stroke="#fff" strokeWidth={46} strokeLinecap="round" />
      <path d={pathD} fill="none" stroke={C.skyDeep} strokeWidth={8} strokeDasharray={`${L}`} strokeDashoffset={L * (1 - carK)} strokeLinecap="round" />
      {stops.map((s, i) => {
        const k = pop(t, at(c, s.beat));
        return (
          <g key={i} transform={`translate(${s.x} ${s.y - 40}) scale(${k})`}>
            <circle cx={0} cy={-80} r={100} fill="#fff" stroke={OL} strokeWidth={5} />
            <Worker x={0} y={0} s={0.9} role={s.r} t={t} />
            <Tag x={0} y={70} text={s.label} size={30} color={C.yellow} />
            {rule > 0 && (
              <g transform={`translate(0 -205) scale(${rule})`}>
                <rect x={-150} y={-30} width={300} height={52} rx={26} fill={C.ink} />
                <Txt x={0} y={6} size={22} color="#fff">
                  1 принцип + 5 правил
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      {/* машинка */}
      <g transform={`translate(${carX} ${carY - 30})`}>
        <rect x={-50} y={-26} width={100} height={40} rx={14} fill={C.ink} stroke={OL} strokeWidth={4} />
        <path d="M -30 -26 L -18 -46 L 22 -46 L 34 -26 Z" fill="#9ccbf0" stroke={OL} strokeWidth={4} />
        <circle cx={-28} cy={16} r={12} fill={OL} />
        <circle cx={28} cy={16} r={12} fill={OL} />
      </g>
    </g>
  );
};

export const TitleFades: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const door = pop(t, 0.2);
  const remove = ramp(t, at(c, 1.55), 0.9);
  const inner = ramp(t, at(c, 2.2), 1.2);
  const order = pop(t, at(c, 3));
  const ceo = pop(t, at(c, 4.4));
  const nurse = ramp(t, at(c, 5), 0.6);
  const memo = ramp(t, at(c, 5.5), 1.2);
  const happy = ramp(t, at(c, 6), 0.6);
  const powerLight = (1 - remove) * clamp01(door * 2);
  const showDoor = 1 - nurse;
  return (
    <g>
      {showDoor > 0 && (
        <g opacity={showDoor}>
          {/* дверь с табличкой — «власть» светит, пока висит табличка */}
          <g transform={`translate(${cx - 300} 520) scale(${door})`}>
            <circle cx={0} cy={-120} r={260} fill={C.yellow} opacity={0.35 * powerLight} />
            <rect x={-130} y={-300} width={260} height={480} rx={12} fill="#8a5a2b" stroke={OL} strokeWidth={6} />
            <circle cx={90} cy={-40} r={14} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
            <g transform={`translate(${remove * 120} ${-180 + remove * 320}) rotate(${remove * 40})`} opacity={1 - remove * 0.6}>
              <Plate x={0} y={0} text="НАЧАЛЬНИК" s={0.68} />
            </g>
            <Tag x={0} y={250} text={remove > 0.5 ? "власть ушла" : "власть"} size={32} color={remove > 0.5 ? "#dfe3ea" : C.yellow} />
          </g>
          {/* человек делает работу хорошо — свет изнутри */}
          {inner > 0 && (
            <g transform={`translate(${cx + 260} 560)`} opacity={inner}>
              <circle cx={0} cy={-120} r={90 + 150 * inner} fill={C.yellow} opacity={0.3} />
              <Worker x={0} y={60} s={1.5} role="clerk" t={t} arms={0.4} />
              <Heart2 x={-120} y={-180} k={inner} />
              <Check x={130} y={-170} s={46} k={ramp(t, at(c, 2.5), 0.5)} />
              <Tag x={0} y={170} text="влияние" size={34} color={C.yellow} />
            </g>
          )}
          {order > 0 && ceo < 1 && (
            <g transform={`translate(${cx} 210) scale(${order})`} opacity={1 - ceo}>
              <rect x={-330} y={-46} width={660} height={80} rx={40} fill="#fff" stroke={OL} strokeWidth={3} />
              <Txt x={0} y={10} size={34}>
                должности и порядок — нужны
              </Txt>
            </g>
          )}
          {ceo > 0 && (
            <g transform={`translate(${cx + 260} 290) scale(${ceo})`}>
              <Badge x={0} y={0} s={0.7} text="директор" sub="СВОЕЙ РОЛИ" color="#fffbe6" />
            </g>
          )}
        </g>
      )}
      {/* пример: медсестра и памятка */}
      {nurse > 0 && (
        <g opacity={nurse}>
          <Worker x={cx - 380} y={720} s={1.6} role="nurse" t={t} arms={0.5} />
          <g transform={`translate(${cx} 420) scale(${0.6 + 0.4 * memo})`} opacity={clamp01(memo * 2)}>
            <Panel x={-210} y={-230} w={420} h={430} fill="#fff" r={20} />
            <Txt x={0} y={-170} size={34} weight={900}>
              Процедуры
            </Txt>
            {["утро — анализы", "день — капельница", "вечер — осмотр"].map((s, i) => (
              <g key={i} opacity={ramp(t, at(c, 5.6) + i * 0.4, 0.4)}>
                <circle cx={-160} cy={-100 + i * 90} r={22} fill={[C.sky, C.yellow, C.violet][i]} stroke={OL} strokeWidth={3} />
                <text x={-124} y={-90 + i * 90} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.ink}>
                  {s}
                </text>
              </g>
            ))}
          </g>
          {[0, 1, 2].map((i) => (
            <Worker key={i} x={cx + 300 + i * 150} y={720} s={1.15} role="plain" color={[C.coral, C.teal, C.orange][i]} t={t + i} mood={happy > 0.5 ? "smile" : "flat"} />
          ))}
          <Pop t={t} at={at(c, 6.2)} x={cx + 450} y={380}>
            <Tag x={0} y={0} text="ведёт за собой" size={34} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

const Heart2: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M 0 30 C -50 -10 -30 -50 0 -26 C 30 -50 50 -10 0 30 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
  </g>
);

export const Orchestra: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const roles = ["clerk", "nurse", "cashier", "janitor", "barista", "maid"] as const;
  const stage = pop(t, 0.15);
  const sour = ramp(t, at(c, 1.4), 0.4) * (1 - ramp(t, at(c, 2), 0.6));
  const labels = ramp(t, at(c, 3), 0.6);
  return (
    <g opacity={clamp01(stage * 2)}>
      {/* сцена */}
      <path d={`M ${cx - 600} 760 L ${cx + 600} 760 L ${cx + 520} 640 L ${cx - 520} 640 Z`} fill="#c99060" stroke={OL} strokeWidth={5} />
      {/* дирижёр */}
      <Pop t={t} at={at(c, 1)} x={cx} y={450}>
        <g>
          <Worker x={0} y={0} s={1.3} role="boss" t={t} arms={0.6 + Math.sin(t * 4) * 0.3} />
          <path d={`M 60 -100 L ${110 + Math.sin(t * 4) * 20} -170`} stroke={OL} strokeWidth={5} strokeLinecap="round" />
        </g>
      </Pop>
      {roles.map((r, i) => {
        const x = cx - 500 + i * 200 + (i >= 3 ? 0 : 0);
        const bad = i === 2;
        const k = pop(t, 0.3 + i * 0.12);
        return (
          <g key={r} transform={`translate(${x} 700) scale(${k})`}>
            <Worker x={0} y={0} s={1} role={r} t={t} mood={bad && sour > 0.3 ? "sad" : "smile"} />
            <Violin x={42} y={-60} s={0.6} rot={-30} />
            {/* ноты: ровные или «фальшивые» */}
            {[0, 1].map((n) => {
              const ph = (t * 0.8 + n * 0.5 + i * 0.13) % 1;
              const wobble = sour * (bad ? 40 : 14) * Math.sin(t * 9 + n);
              return <Note key={n} x={20 + n * 30 + wobble} y={-200 - ph * 140} s={0.8} color={bad && sour > 0.2 ? C.red : C.ink} />;
            })}
            {labels > 0 && (
              <g opacity={labels} transform="translate(0 60)">
                <Tag x={0} y={0} text={["продавец", "медсестра", "кассир", "уборщик", "бариста", "горничная"][i]} size={24} color="#fff" />
              </g>
            )}
          </g>
        );
      })}
      {sour > 0.1 && (
        <g transform={`translate(${cx + 260} 300)`} opacity={sour}>
          <Bubble x={0} y={0} w={300} h={110} />
          <Txt x={0} y={14} size={44} color={C.red} weight={900}>
            фальшь!
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 2)} x={cx} y={190}>
        <Tag x={0} y={0} text="маленьких ролей не бывает" size={42} color={C.yellow} />
      </Pop>
    </g>
  );
};

const FORCES = ["показывать себя с лучшей стороны", "вдохновлять своим примером", "добиваться перемен к лучшему", "уважение, признательность, доброта"];

export const FourForces: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const head = pop(t, 0.2);
  const stamp = (i: number) => ramp(t, at(c, 5) + i * 0.25, 0.25);
  return (
    <g>
      <g transform={`translate(${cx} 170) scale(${head})`}>
        <Txt x={0} y={0} size={52} weight={900}>
          Четыре силы без титула
        </Txt>
      </g>
      {FORCES.map((f, i) => {
        const k = pop(t, at(c, i + 1));
        const x = cx - 330 + (i % 2) * 660;
        const y = 360 + Math.floor(i / 2) * 270;
        const s = stamp(i);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-300} y={-110} w={600} h={210} fill="#fff" r={30} />
            <circle cx={-230} cy={-30} r={44} fill={[C.skyDeep, C.violet, C.green, C.coral][i]} />
            <Txt x={-230} y={-12} size={50} color="#fff" weight={900}>
              {String(i + 1)}
            </Txt>
            <ForceIcon i={i} t={t} />
            <text x={-270} y={70} fontFamily={FONT} fontWeight={800} fontSize={27} fill={C.ink}>
              {f}
            </text>
            {s > 0 && (
              <g transform={`translate(170 -40) rotate(-10) scale(${1.6 - 0.6 * s})`} opacity={s}>
                <rect x={-130} y={-34} width={260} height={62} rx={10} fill="none" stroke={C.red} strokeWidth={5} />
                <Txt x={0} y={10} size={28} color={C.red} weight={900}>
                  титул не нужен
                </Txt>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

const ForceIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0) return <g transform="translate(-60 -30)"><circle r={34} fill={C.yellow} stroke={OL} strokeWidth={3} /><path d="M -14 -4 L -4 8 L 16 -14" stroke={OL} strokeWidth={6} fill="none" /></g>;
  if (i === 1) return <g transform="translate(-60 -30)">{[0, 1, 2].map((k) => <circle key={k} r={14 + k * 14 + ((t * 20) % 14)} fill="none" stroke={C.violet} strokeWidth={4} opacity={0.8 - k * 0.25} />)}</g>;
  if (i === 2) return <g transform="translate(-60 -30)"><path d="M -30 20 L -6 -4 L 8 10 L 34 -22" stroke={C.green} strokeWidth={8} fill="none" strokeLinecap="round" /><path d="M 34 -22 l -14 2 m 14 -2 l -2 14" stroke={C.green} strokeWidth={8} strokeLinecap="round" /></g>;
  return <g transform="translate(-60 -30)"><path d="M 0 22 C -34 -4 -22 -34 0 -16 C 22 -34 34 -4 0 22 Z" fill={C.coral} stroke={OL} strokeWidth={3} /></g>;
};

export const VictimSwitch: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const sw = pop(t, 0.2);
  const flip = ramp(t, at(c, 2), 0.35) * (1 - ramp(t, at(c, 3), 0.3)) + ramp(t, at(c, 4), 0.35);
  const k = clamp01(flip);
  const excuses = ["я же не директор", "виноват начальник", "сейчас такие времена"];
  const example = ramp(t, at(c, 3), 0.5) * (1 - ramp(t, at(c, 4), 0.5));
  const motto = pop(t, at(c, 4.2));
  const calm = ramp(t, at(c, 5), 0.6);
  return (
    <g>
      <circle cx={cx} cy={470} r={300} fill={C.yellow} opacity={0.3 * k} />
      {example < 0.99 && (
        <g opacity={1 - example}>
          <Switch x={cx} y={480} s={sw * 1.05} k={k} />
          <Txt x={cx} y={250} size={40} weight={900} color={k > 0.5 ? C.greenDeep : C.grey}>
            лидер
          </Txt>
          <Txt x={cx} y={740} size={40} weight={900} color={k < 0.5 ? C.red : C.grey}>
            жертва
          </Txt>
          {excuses.map((e, i) => {
            const a = ramp(t, at(c, 1) + i * 0.3, 0.4) * (1 - k);
            return a > 0 ? (
              <g key={i} transform={`translate(${cx - 430 + (i % 2) * 40} ${320 + i * 150})`} opacity={a}>
                <Bubble x={0} y={0} w={330} h={90} fill="#eef1f6" />
                <Txt x={0} y={10} size={28} color={C.inkSoft}>
                  {e}
                </Txt>
              </g>
            ) : null;
          })}
          {k > 0.5 && (
            <g transform={`translate(${cx + 420} 420)`} opacity={(k - 0.5) * 2}>
              <Bubble x={0} y={0} w={360} h={120} fill="#fffbe6" />
              <Txt x={0} y={-6} size={30} weight={900}>
                что могу сделать я —
              </Txt>
              <Txt x={0} y={30} size={30} weight={900}>
                здесь и сегодня?
              </Txt>
            </g>
          )}
        </g>
      )}
      {/* пример: зависшая касса */}
      {example > 0 && (
        <g opacity={example}>
          <rect x={cx - 420} y={430} width={260} height={170} rx={16} fill="#dfe3ea" stroke={OL} strokeWidth={5} />
          <rect x={cx - 400} y={450} width={220} height={90} rx={8} fill="#2b3a67" />
          <Txt x={cx - 290} y={510} size={34} color={C.red}>
            ОШИБКА
          </Txt>
          <Worker x={cx - 290} y={720} s={1.2} role="cashier" t={t} />
          {[0, 1, 2, 3].map((i) => (
            <Worker key={i} x={cx - 40 + i * 120} y={720} s={0.95} role="plain" color={[C.teal, C.violet, C.sky, C.pink][i]} t={t + i} mood="flat" />
          ))}
          {["извиниться", "вторая касса", "записать поломку"].map((s, i) => (
            <g key={i} transform={`translate(${cx + 120 + i * 0} ${220 + i * 80})`} opacity={ramp(t, at(c, 3.4) + i * 0.2, 0.4)}>
              <rect x={-170} y={-34} width={340} height={58} rx={29} fill="#fff" stroke={OL} strokeWidth={3} />
              <Check x={-136} y={-6} s={20} k={ramp(t, at(c, 3.5) + i * 0.2, 0.4)} />
              <Txt x={20} y={8} size={28}>
                {s}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {motto > 0 && (
        <g transform={`translate(${cx} 150) scale(${motto})`}>
          <rect x={-470} y={-50} width={940} height={84} rx={42} fill={C.ink} />
          <Txt x={0} y={6} size={34} color="#fff">
            жертвы — проблемы · лидеры — решения
          </Txt>
        </g>
      )}
      {calm > 0 && (
        <g transform={`translate(${cx + 430} 690)`} opacity={calm}>
          <Tag x={0} y={0} text="наша реакция — в наших руках" size={28} color="#fff" />
        </g>
      )}
    </g>
  );
};

export const LastDay: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const stone = pop(t, at(c, 1));
  const gold = pop(t, at(c, 2));
  const months = ramp(t, at(c, 4), 2.2);
  const grid = ramp(t, at(c, 3.9), 0.4);
  const fade = 1 - grid * 0.85;
  const sun = ramp(t, 0.2, 1.2);
  return (
    <g>
      {/* рассвет — мысль о последнем дне без мрачных образов */}
      <circle cx={cx} cy={820} r={160 + 40 * sun} fill={C.orange} opacity={0.25 * sun * fade} />
      <g opacity={fade}>
        <g transform={`translate(${cx} ${stone > 0 ? 190 : 400}) scale(${pop(t, 0.3) * (stone > 0 ? 0.8 : 1.2)})`}>
          <Txt x={0} y={0} size={50} weight={900}>
            Мысленный эксперимент:
          </Txt>
          <Txt x={0} y={60} size={50} weight={900} color={C.orange}>
            мой последний день
          </Txt>
        </g>
        {stone > 0 && (
          <g transform={`translate(${cx - 300} 560) scale(${stone * 0.78})`}>
            <Tablet x={0} y={0} title="Сожаления" items={["не рискнул", "жил чужой жизнью", "никому не помог"]} show={Math.ceil(clamp01((t - at(c, 1.2)) / 2.5) * 3)} />
          </g>
        )}
        {gold > 0 && (
          <g transform={`translate(${cx + 300} 560) scale(${gold * 0.78})`}>
            <circle r={330} fill={C.yellow} opacity={0.2 + 0.1 * Math.sin(t * 3)} />
            <Tablet x={0} y={0} gold title="Победы" items={["выложился", "поддерживал людей", "падал — и вставал", "был первопроходцем", "стал сильнее и добрее"]} show={Math.min(5, Math.ceil(clamp01((t - at(c, 2.2)) / 3) * 3) + (t > at(c, 3) ? 1 : 0) + (t > at(c, 3.5) ? 1 : 0))} />
          </g>
        )}
      </g>
      {grid > 0 && (
        <g opacity={grid}>
          <Txt x={cx} y={180} size={48} weight={900}>
            ≈ 960 месяцев
          </Txt>
          <g transform={`translate(${cx - 480} 230)`}>
            {Array.from({ length: 960 }).map((_, i) => {
              const col = i % 48;
              const row = Math.floor(i / 48);
              const on = i / 960 < months * 0.45;
              return <rect key={i} x={col * 20} y={row * 26} width={16} height={20} rx={3} fill={on ? C.skyDeep : "#fff"} opacity={on ? 0.85 : 0.75} />;
            })}
          </g>
          <Pop t={t} at={at(c, 5)} x={cx} y={830}>
            <Tag x={0} y={0} text="что для меня главное?" size={38} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const SmallSteps: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const stairs = ramp(t, at(c, 0.3), 2.5);
  const habits = pop(t, at(c, 1));
  const cracks = ramp(t, at(c, 2), 2.4);
  const garden = ramp(t, at(c, 3), 0.6);
  const grow = ramp(t, at(c, 3.4), 3);
  const deadEnd = ramp(t, at(c, 4), 0.6);
  const first = 1 - garden;
  return (
    <g>
      {first > 0 && (
        <g opacity={first}>
          {/* лесенка к звезде */}
          {Array.from({ length: 8 }).map((_, i) => {
            const k = clamp01(stairs * 8 - i);
            return k > 0 ? <rect key={i} x={cx - 560 + i * 80} y={780 - i * 60} width={80} height={60 + i * 60} fill={i % 2 ? "#ffe9a8" : "#ffd86b"} stroke={OL} strokeWidth={3} opacity={k} /> : null;
          })}
          <g transform={`translate(${cx - 520 + stairs * 560} ${730 - stairs * 420})`}>
            <Worker x={0} y={0} s={0.9} role="plain" t={t} />
          </g>
          <g transform={`translate(${cx + 90} 270) rotate(${t * 20})`} opacity={stairs}>
            <path d="M 0 -50 L 14 -16 L 50 -14 L 22 10 L 30 46 L 0 26 L -30 46 L -22 10 L -50 -14 L -14 -16 Z" fill={C.yellow} stroke={OL} strokeWidth={4} />
          </g>
          {habits > 0 && (
            <g transform={`translate(${cx - 380} 230) scale(${habits})`}>
              <Tag x={0} y={0} text="несколько простых привычек" size={30} color="#fff" />
            </g>
          )}
          {/* «ладно, потом» — трещины в стене */}
          {cracks > 0 && (
            <g transform={`translate(${cx + 380} 560)`}>
              {Array.from({ length: 12 }).map((_, i) => {
                const fallen = cracks > 0.85 ? (cracks - 0.85) * 6.6 : 0;
                return <Brick key={i} x={-130 + (i % 3) * 130} y={180 - Math.floor(i / 3) * 60 + fallen * (i * 13 % 50)} w={124} h={56} color="#c7cdd8" rot={fallen * ((i * 37) % 30 - 15)} />;
              })}
              {Array.from({ length: Math.floor(cracks * 6) }).map((_, i) => (
                <path key={i} d={`M ${-150 + i * 50} ${-30 + (i % 2) * 60} l 16 22 l -10 16 l 14 18`} stroke={OL} strokeWidth={3} fill="none" />
              ))}
              <Tag x={0} y={-140} text="«ладно, потом»" size={32} color="#ffd6d6" />
            </g>
          )}
        </g>
      )}
      {garden > 0 && (
        <g opacity={garden * (1 - deadEnd * 0.7)}>
          <rect x={cx - 520} y={700} width={1040} height={60} rx={20} fill="#8a5a2b" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Sprout key={i} x={cx - 420 + i * 170} y={712} s={1.5} grow={clamp01(grow * 1.4 - i * 0.07)} t={t} color={[C.pink, C.yellow, C.violet, C.coral, C.sky, C.orange][i]} />
          ))}
          <WateringCan x={cx - 520 + grow * 860} y={430} s={1.1} rot={20} pour={t} />
          <g transform={`translate(${cx + 330} 300)`} opacity={ramp(t, at(c, 3.7), 0.5)}>
            <Bubble x={0} y={0} w={330} h={100} />
            <Txt x={0} y={10} size={30}>
              не выкапывать!
            </Txt>
          </g>
        </g>
      )}
      {deadEnd > 0 && (
        <g transform={`translate(${cx} 360) scale(${deadEnd})`}>
          <Panel x={-380} y={-140} w={760} h={260} fill="#fff" r={30} />
          <Txt x={0} y={-60} size={40} weight={900}>
            тупиковой работы нет —
          </Txt>
          <Txt x={0} y={0} size={40} weight={900} color={C.skyDeep}>
            в тупик заводят мысли
          </Txt>
          <Txt x={0} y={70} size={30} color={C.inkSoft} weight={700}>
            где здесь мастерство и забота о людях?
          </Txt>
        </g>
      )}
    </g>
  );
};

export { Desk, CalendarGrid, Arrow, Cross };
