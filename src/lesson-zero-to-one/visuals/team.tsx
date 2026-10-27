// Часть «Команда»: фундамент и сооснователи, собственность/управление/контроль,
// автобус, зарплата и доли, культура и «мафия PayPal» (метафора), двадцатый
// сотрудник, каждому — одно дело, шкала «закрытая группа ↔ консультанты».
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Bus, Coin, Dot, Heart, House, Laptop, OL, Shop } from "./draw";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ── Закон Тиля: фундамент и выбор сооснователя ──
export const Foundation: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const law = pop(t, at(c, 1));
  const pair = ramp(t, at(c, 2), 0.6);
  const know = ramp(t, at(c, 3), 0.6);
  const crack = ramp(t, at(c, 1.4), 0.8);
  return (
    <g>
      <g opacity={1 - pair}>
        <House x={cx} y={700} s={1.4} crack={crack} base="#b9a07a" />
        {law > 0 && (
          <g transform={`translate(${cx} 230) scale(${law})`}>
            <Panel x={-470} y={-70} w={940} h={140} fill="#fff" stroke={C.coral} />
            <Txt x={0} y={-8} size={36} weight={900}>
              «Ошибки, сделанные в самом начале,
            </Txt>
            <Txt x={0} y={42} size={36} weight={900}>
              невозможно исправить»
            </Txt>
          </g>
        )}
      </g>
      {pair > 0 && (
        <g opacity={pair}>
          <g transform={`translate(${cx - 140} 560)`}>
            <Dot x={0} y={0} s={2.2} color={Z.teal} />
          </g>
          <g transform={`translate(${cx + 140} 560)`}>
            <Dot x={0} y={0} s={2.2} color={C.coral} />
          </g>
          <Heart x={cx} y={400 + Math.sin(t * 3) * 8} s={0.9 + 0.1 * Math.sin(t * 4)} />
          <Txt x={cx} y={720} size={36} weight={900}>
            сооснователь — почти как супруг
          </Txt>
          {know > 0 && (
            <g opacity={know}>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${cx - 90 + i * 60} 300 q 10 -30 20 0`} stroke={Z.grey} strokeWidth={5} fill="none" />
              ))}
              <Tag x={cx} y={220} text="сначала узнайте друг друга" size={36} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── Собственность, управление, контроль; совет из трёх ──
export const ThreeBranches: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const b = [at(c, 1), at(c, 1.35), at(c, 1.7)];
  const board = ramp(t, at(c, 2), 0.6);
  const cols = [
    { title: "собственность", sub: "кто владеет", color: Z.tealSoft },
    { title: "управление", sub: "кто руководит", color: "#ffe7c2" },
    { title: "контроль", sub: "кто решает", color: "#e6e1ff" },
  ];
  return (
    <g>
      {cols.map((cl, i) => {
        const k = pop(t, b[i]);
        if (k <= 0) return null;
        const x = cx - 360 + i * 360;
        return (
          <g key={i} transform={`translate(${x} 420) scale(${k})`} opacity={i < 2 ? 1 - board * 0.5 : 1}>
            <Panel x={-160} y={-170} w={320} h={340} fill={cl.color} stroke={i === 2 && board > 0 ? C.yellowDeep : undefined} />
            <g transform="translate(0 -60)">
              {i === 0 && (
                <g>
                  <circle r={60} fill={C.yellow} stroke={OL} strokeWidth={4} />
                  <path d="M 0 0 L 0 -60 A 60 60 0 0 1 52 30 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
                </g>
              )}
              {i === 1 && <path d={`M -50 30 L 50 30 L 50 -10 Q 0 -60 -50 -10 Z M -30 30 L -30 50 M 30 30 L 30 50`} fill={Z.teal} stroke={OL} strokeWidth={4} transform={`rotate(${wob(t, 1, 6)})`} />}
              {i === 2 && (
                <g>
                  <rect x={-70} y={-20} width={140} height={50} rx={10} fill="#c98b4a" stroke={OL} strokeWidth={4} />
                  {[-50, 0, 50].map((dx) => (
                    <Dot key={dx} x={dx} y={-30} s={0.7} color={Z.purple} />
                  ))}
                </g>
              )}
            </g>
            <Txt x={0} y={60} size={34} weight={900}>
              {cl.title}
            </Txt>
            <Txt x={0} y={110} size={28} color={C.inkSoft}>
              {cl.sub}
            </Txt>
          </g>
        );
      })}
      {board > 0 && (
        <g opacity={board}>
          <Tag x={cx + 360} y={680} text="совет: 3 (не больше 5)" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── «Ты либо в автобусе, либо нет»; зарплата и доля в компании ──
export const Incentives: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const bus = ramp(t, 0.2, 0.6);
  const pay = ramp(t, at(c, 1), 0.6);
  const share = pop(t, at(c, 2));
  const noFormula = pop(t, at(c, 3));
  const drive = ramp(t, 0.5, 3);
  return (
    <g>
      <g opacity={bus * (1 - pay)}>
        <Bus x={cx - 100 + drive * 200} y={600} s={1.4} t={t} />
        <Dot x={cx - 330} y={560} s={1.4} color={Z.grey} />
        <Txt x={cx} y={260} size={44} weight={900}>
          в автобусе — или нет
        </Txt>
      </g>
      {pay > 0 && (
        <g opacity={pay}>
          <g transform={`translate(${cx - 300} 520)`}>
            <rect x={-60} y={-210} width={120} height={220} rx={12} fill={Z.greySoft} stroke={OL} strokeWidth={4} />
            <rect x={-60} y={-50} width={120} height={60} rx={12} fill={C.green} />
            <Txt x={0} y={80} size={30} weight={900}>
              скромная зарплата
            </Txt>
            <Txt x={0} y={120} size={26} color={C.inkSoft}>
              директора стартапа
            </Txt>
            <Coin x={0} y={-120} s={0.7} />
          </g>
          {share > 0 && (
            <g transform={`translate(${cx + 260} 470) scale(${share})`}>
              <circle r={140} fill={C.yellow} stroke={OL} strokeWidth={5} />
              {[0, 1, 2, 3, 4].map((i) => {
                const a0 = (i / 5) * Math.PI * 2 - Math.PI / 2;
                return <line key={i} x1={0} y1={0} x2={Math.cos(a0) * 140} y2={Math.sin(a0) * 140} stroke={OL} strokeWidth={4} />;
              })}
              <path d={`M 0 0 L 0 -140 A 140 140 0 0 1 ${Math.cos(-Math.PI / 2 + 1.256) * 140} ${Math.sin(-Math.PI / 2 + 1.256) * 140} Z`} fill={C.coral} stroke={OL} strokeWidth={4} transform={`translate(${6 + 4 * Math.sin(t * 3)} ${-6})`} />
              <Txt x={0} y={200} size={32} weight={900}>
                доля в компании
              </Txt>
            </g>
          )}
          {noFormula > 0 && (
            <g transform={`translate(${cx} 230) scale(${noFormula})`}>
              <Tag x={0} y={0} text="идеальной формулы нет" size={36} color={C.white} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── Культура — не пуфы; «мафия PayPal» как шутливое прозвище ──
export const Mafia: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const perks = ramp(t, 0.2, 0.6);
  const people = ramp(t, at(c, 1), 0.6);
  const net = ramp(t, at(c, 2), 1.2);
  const like = pop(t, at(c, 3));
  const comps = ["Tesla", "LinkedIn", "YouTube", "Yelp", "Palantir", "SpaceX"];
  return (
    <g>
      <g opacity={perks * (1 - people)}>
        <g transform={`translate(${cx - 300} 520)`}>
          <ellipse cx={0} cy={20} rx={110} ry={70} fill={Z.purple} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={150} size={30} weight={900}>
            пуф
          </Txt>
        </g>
        <g transform={`translate(${cx + 40} 520)`}>
          <rect x={-120} y={-20} width={240} height={110} rx={8} fill={C.green} stroke={OL} strokeWidth={5} />
          <line x1={0} y1={-20} x2={0} y2={90} stroke="#fff" strokeWidth={5} />
          <circle cx={60 * Math.sin(t * 4)} cy={-60 + 30 * Math.abs(Math.cos(t * 4))} r={14} fill="#fff" stroke={OL} strokeWidth={3} />
          <Txt x={0} y={150} size={30} weight={900}>
            пинг-понг
          </Txt>
        </g>
        <Cross x={cx - 130} y={520} s={300} k={ramp(t, at(c, 0.6), 0.5)} />
        <Txt x={cx} y={250} size={40} weight={900}>
          это ещё не культура
        </Txt>
      </g>
      {people > 0 && (
        <g opacity={people}>
          <g transform={`translate(${cx} 500)`}>
            <circle r={110} fill={C.yellow} opacity={0.35} />
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2 + t * 0.2;
              return <Dot key={i} x={Math.cos(a) * 70} y={Math.sin(a) * 50 + 10} s={0.8} color={Z.teal} />;
            })}
            <Txt x={0} y={170} size={30} weight={900}>
              команда PayPal
            </Txt>
          </g>
          {comps.map((s, i) => {
            const a = (i / comps.length) * Math.PI * 2 - Math.PI / 2;
            const k = clamp01(net * comps.length - i);
            const x = cx + Math.cos(a) * 400;
            const y = 500 + Math.sin(a) * 250;
            return k > 0 ? (
              <g key={s} opacity={k}>
                <line x1={cx + Math.cos(a) * 120} y1={500 + Math.sin(a) * 90} x2={x - Math.cos(a) * 80} y2={y - Math.sin(a) * 40} stroke={Z.grey} strokeWidth={4} strokeDasharray="10 8" />
                <Tag x={x} y={y + 14} text={s} size={28} color={C.white} />
              </g>
            ) : null;
          })}
          <Pop t={t} at={at(c, 2.1)} x={cx} y={200}>
            <Tag x={0} y={0} text="«мафия PayPal» — шутливое прозвище" size={32} color={Z.tealSoft} />
          </Pop>
          {like > 0 && (
            <g transform={`translate(${cx} 830) scale(${like})`}>
              <Heart x={-280} y={-30} s={0.5} />
              <Tag x={20} y={0} text="нравится работать вместе" size={34} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── Почему двадцатый инженер придёт к вам ──
export const Twentieth: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const choose = ramp(t, 0.3, 0.8);
  const generic = ramp(t, at(c, 1), 0.6);
  const good = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={choose}>
        <Dot x={cx} y={460} s={2} color={C.coral} />
        <Tag x={cx} y={330} text="№ 20" size={40} color={C.yellow} />
        <Shop x={cx - 360} y={560} s={1.2} awning={Z.grey} label="большая компания" />
        <Shop x={cx + 360} y={560} s={1.2} awning={Z.teal} label="ваш стартап" />
        <Arrow x1={cx - 70} y1={470} x2={cx - 250} y2={500} k={1} color={Z.grey} w={6} />
        <Arrow x1={cx + 70} y1={470} x2={cx + 250} y2={500} k={1} color={Z.grey} w={6} />
      </g>
      {generic > 0 && (
        <g opacity={generic * (1 - good * 0.7)}>
          {["«умные люди»", "«важные задачи»"].map((s, i) => (
            <g key={s}>
              <Tag x={cx - 220 + i * 440} y={220} text={s} size={30} color={Z.greySoft} />
              <Cross x={cx - 220 + i * 440} y={220} s={70} k={ramp(t, at(c, 1.5 + i * 0.1), 0.4)} />
            </g>
          ))}
        </g>
      )}
      {good > 0 && (
        <g opacity={good}>
          <Panel x={cx - 300} y={680} w={600} h={130} fill={C.yellow} />
          <Txt x={cx} y={735} size={34} weight={900}>
            уникальная миссия
          </Txt>
          <Txt x={cx} y={782} size={34} weight={900}>
            + команда, с которой хочется работать
          </Txt>
          <Check x={cx + 360} y={560} s={50} k={ramp(t, at(c, 2.4), 0.5)} />
        </g>
      )}
    </g>
  );
};

// ── Каждому — одно главное дело ──
export const OneThing: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const icons = ["код", "продажи", "дизайн", "финансы", "поддержка"];
  const clash = ramp(t, at(c, 1), 0.6);
  const calm = ramp(t, at(c, 1.55), 0.6);
  return (
    <g>
      {icons.map((s, i) => {
        const k = pop(t, 0.3 + i * 0.25);
        if (k <= 0) return null;
        const x = cx - 440 + i * 220;
        return (
          <g key={s} transform={`translate(${x} 420) scale(${k})`}>
            <Dot x={0} y={60} s={1.5} color={[Z.teal, C.coral, Z.purple, C.skyDeep, C.green][i]} />
            <Tag x={0} y={-80} text={s} size={28} color={C.white} />
            <Txt x={0} y={170} size={60} weight={900} color={C.inkSoft}>
              1
            </Txt>
          </g>
        );
      })}
      {clash > 0 && (
        <g opacity={clash * (1 - calm)}>
          <Dot x={cx - 120} y={720} s={1.3} color={Z.teal} />
          <Dot x={cx + 120} y={720} s={1.3} color={Z.teal} />
          <Tag x={cx} y={640} text="одна задача на двоих" size={30} color="#ffd9d6" />
          <path d={`M ${cx - 40} 700 l 20 20 l -20 20 M ${cx + 40} 700 l -20 20 l 20 20`} stroke={C.red} strokeWidth={6} fill="none" />
        </g>
      )}
      {calm > 0 && (
        <Pop t={t} at={at(c, 1.6)} x={cx} y={720}>
          <Tag x={0} y={0} text="у каждого своё — конфликтов меньше" size={34} color={C.yellow} />
        </Pop>
      )}
    </g>
  );
};

// ── Шкала: закрытая группа ↔ консультанты; стартап — предан верной идее ──
export const Spectrum: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const line = ramp(t, 0.2, 0.8);
  const mark = ramp(t, at(c, 1), 1.2);
  const x0 = cx - 480;
  const x1 = cx + 480;
  return (
    <g>
      <line x1={x0} y1={500} x2={x0 + (x1 - x0) * line} y2={500} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <g opacity={line}>
        <g transform={`translate(${x0} 500)`}>
          <circle r={90} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI * 2;
            return <Dot key={i} x={Math.cos(a) * 45} y={Math.sin(a) * 40 + 10} s={0.55} color={Z.grey} />;
          })}
          <Txt x={0} y={150} size={28} weight={900}>
            закрытая группа
          </Txt>
          <Txt x={0} y={186} size={24} color={C.inkSoft}>
            отрезаны от мира
          </Txt>
        </g>
        <g transform={`translate(${x1} 500)`}>
          <Dot x={0} y={10} s={1.6} color={Z.grey} />
          <Laptop x={0} y={-60} s={0.35} t={t} />
          <Txt x={0} y={150} size={28} weight={900}>
            консультанты
          </Txt>
          <Txt x={0} y={186} size={24} color={C.inkSoft}>
            ни к чему не привязаны
          </Txt>
        </g>
      </g>
      {mark > 0 && (
        <g transform={`translate(${x0 + (x1 - x0) * (0.5 - 0.22 * mark)} 500)`}>
          <circle r={60} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={12} size={26} weight={900}>
            стартап
          </Txt>
          <Pop t={t} at={at(c, 1.5)} x={0} y={-150}>
            <Tag x={0} y={0} text="предан верной идее" size={34} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};
