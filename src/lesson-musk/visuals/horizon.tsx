// Сцены BM-029 о горизонте миссии и человеческой цене: связь компаний, письмо
// 7 июня 2013 года, Марс и цена доставки (прогноз), «трудно работать», баланс
// жизни и работы, критики и защита. Без таймеров и без инвестиционных подсказок.
import React from "react";
import { C, DC, FONT } from "../theme";
import { Car, DateCard, Rocket } from "./objects";
import { Appear, area, Arrow, at, clamp01, Drift, pop, ramp, Txt, type VisualProps } from "./kit";
import { Card, Label, OL, Person } from "./people";

// ── Единая теория поля: три узла, связанные технологиями ──
export const FieldTheory: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const nodes = [
    { x: cx, y: 270, n: "ракеты", c: DC.eng.color },
    { x: cx - 380, y: 660, n: "машины", c: DC.ppl.color },
    { x: cx + 380, y: 660, n: "солнечные панели", c: DC.res.color },
  ];
  const crack = ramp(t, b3, 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      {[
        [0, 1],
        [1, 2],
        [2, 0],
      ].map(([a, b], i) => {
        const k = ramp(t, at(ctx, 0.5 + i * 0.15), 0.7);
        const shake = crack > 0 ? Math.sin(t * 20 + i) * 4 * crack : 0;
        return (
          <g key={i}>
            <line x1={nodes[a].x} y1={nodes[a].y} x2={nodes[a].x + (nodes[b].x - nodes[a].x) * k + shake} y2={nodes[a].y + (nodes[b].y - nodes[a].y) * k} stroke={crack > 0.5 && i !== 2 ? C.red : "#fff"} strokeWidth={10} strokeLinecap="round" />
            {/* частицы-идеи бегут по связям */}
            {k >= 1 &&
              [0, 1, 2].map((j) => {
                const u = (t * 0.35 + j / 3 + i * 0.1) % 1;
                return <circle key={j} cx={nodes[a].x + (nodes[b].x - nodes[a].x) * u} cy={nodes[a].y + (nodes[b].y - nodes[a].y) * u} r={10} fill={C.yellow} stroke={OL} strokeWidth={2} />;
              })}
          </g>
        );
      })}
      {nodes.map((nd, i) => (
        <g key={nd.n} transform={`translate(${nd.x} ${nd.y}) scale(${pop(t, 0.2 + i * 0.3)})`}>
          <circle r={120} fill={nd.c} stroke={OL} strokeWidth={6} />
          {i === 0 && <Rocket x={0} y={70} s={0.22} t={t} />}
          {i === 1 && <Car x={0} y={20} s={0.3} t={t} />}
          {i === 2 && (
            <g transform="rotate(-10)">
              <rect x={-70} y={-40} width={140} height={80} rx={8} fill="#2b4a8a" stroke={OL} strokeWidth={4} />
              <path d="M -23 -40 L -23 40 M 23 -40 L 23 40 M -70 0 L 70 0" stroke="#9ec5ff" strokeWidth={3} />
            </g>
          )}
          <Txt x={0} y={170} size={32} color="#fff">
            {nd.n}
          </Txt>
        </g>
      ))}
      {t > b1 && t < b2 + 0.3 && (
        <Appear t={t} at={b1 + 0.2}>
          <Label x={cx} y={900} text="панели в аренду — без покупки сразу" size={30} bg={DC.res.light} />
        </Appear>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.4}>
          <Label x={cx} y={900} text="аккумуляторы ⇄ панели ⇄ зарядные станции" size={30} bg={C.paper} />
        </Appear>
      )}
      {crack > 0 && <Label x={cx} y={470} text="и общий риск" size={36} bg={DC.ppl.light} />}
    </Drift>
  );
};

// ── Письмо 7 июня 2013 года: арифметика ──
export const Letter2013: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const k = pop(t, 0.3);
  const launches = Math.floor(clamp01((t - at(ctx, 1.65)) / 2) * 12);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <g transform={`translate(${cx - 300} 470) scale(${k}) rotate(-3)`}>
        <rect x={-230} y={-330} width={460} height={620} rx={12} fill="#fff" stroke={OL} strokeWidth={5} />
        <text x={-190} y={-270} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
          Всем сотрудникам SpaceX
        </text>
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={-190} y={-220 + i * 44} width={380 - ((i * 61) % 120)} height={14} rx={6} fill={i === 3 || i === 6 ? C.yellow : "#c9d0dc"} />
        ))}
      </g>
      <DateCard x={cx - 300} y={150} text="7 июня 2013" />
      {t > b1 && (
        <g transform={`translate(${cx + 260} 0)`}>
          <Appear t={t} at={b1 + 0.1}>
            <Card x={0} y={290} w={480} h={110} lines={["расходы года: 800–900 млн $"]} edge={DC.res.color} />
          </Appear>
          <Appear t={t} at={at(ctx, 1.4)}>
            <Card x={0} y={420} w={480} h={110} lines={["60 млн $ за успешный запуск"]} edge={DC.eng.color} />
          </Appear>
          <g transform="translate(0 600)" opacity={ramp(t, at(ctx, 1.65), 0.4)}>
            {Array.from({ length: 12 }, (_, i) => (
              <g key={i} transform={`translate(${-200 + (i % 6) * 80} ${Math.floor(i / 6) * 120})`} opacity={i < launches ? 1 : 0.2}>
                <Rocket x={0} y={50} s={0.16} t={t} />
              </g>
            ))}
            <Txt x={0} y={260} size={30} color="#fff">
              ≈ 12 успешных полётов в год
            </Txt>
          </g>
        </g>
      )}
      {t > b2 && t < b3 && (
        <Appear t={t} at={b2 + 0.1}>
          <g transform={`translate(${cx + 260} 860)`}>
            <rect x={-300} y={-46} width={600} height={88} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={30}>
              биржа — только после Марса
            </Txt>
          </g>
        </Appear>
      )}
      {t > b3 && (
        <Appear t={t} at={b3 + 0.1}>
          <g transform={`translate(${cx} 860) rotate(-2)`}>
            <rect x={-480} y={-52} width={960} height={100} rx={22} fill={C.paper} stroke={C.red} strokeWidth={6} />
            <Txt x={0} y={14} size={34} color={C.ink}>
              документ 2013 года · не финансовый совет
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Марс упирается в цену доставки (прогноз героя) ──
export const Mars: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  // «ползунок» цены: дорого → дешевле; город — только пунктиром (прогноз)
  const slide = ramp(t, b1, 1.6);
  const cityK = ramp(t, b1 + 1, 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <circle cx={cx + 280} cy={560} r={260} fill="#e0784a" stroke={OL} strokeWidth={5} />
      <circle cx={cx + 200} cy={480} r={40} fill="#c45c33" />
      <circle cx={cx + 360} cy={640} r={30} fill="#c45c33" />
      {/* купола города — пунктир, потому что это прогноз */}
      <g opacity={cityK}>
        {[-120, -20, 90, 180].map((dx, i) => (
          <path key={i} d={`M ${cx + 280 + dx - 46} 330 A 46 46 0 0 1 ${cx + 280 + dx + 46} 330 Z`} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="10 8" transform={`translate(0 ${i % 2 ? 10 : 0})`} />
        ))}
      </g>
      <g transform={`translate(${cx - 360} 360)`}>
        <rect x={-200} y={-30} width={400} height={60} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <circle cx={-170 + 340 * (1 - slide)} cy={0} r={40} fill={slide > 0.5 ? DC.eng.color : C.red} stroke={OL} strokeWidth={5} />
        <Txt x={-150} y={90} size={26} color="#fff">
          дешевле
        </Txt>
        <Txt x={150} y={90} size={26} color="#fff">
          дороже
        </Txt>
        <Appear t={t} at={at(ctx, 0.55)}>
          <Card x={0} y={-150} w={440} h={110} lines={["миллиард $ за человека", "→ колонии не будет"]} edge={C.red} />
        </Appear>
      </g>
      {t > b1 && (
        <Appear t={t} at={b1 + 0.4}>
          <g transform={`translate(${cx - 360} 640)`}>
            <rect x={-230} y={-50} width={460} height={100} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} strokeDasharray="14 10" />
            <Txt x={0} y={14} size={34}>
              прогноз, не результат
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Человеческая цена: круг команды ──
export const PeopleCost: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const n = 9;
  const who = ["engineer", "engineer2", "welder", "designer", "assistant", "manager", "worker", "partner", "investor"] as const;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * 330;
        const y = 470 + Math.sin(a) * 220;
        const strain = ramp(t, b1 + i * 0.1, 0.8);
        return (
          <g key={i} opacity={ramp(t, 0.1 + i * 0.08, 0.4)}>
            <line x1={cx} y1={470} x2={x} y2={y} stroke={strain > 0.5 ? DC.ppl.color : "#fff"} strokeWidth={4} opacity={0.6} />
            <Person who={who[i]} x={x} y={y + 70} s={0.26} mood={t > b1 ? "tense" : "think"} pose="stand" t={t} seed={i} />
          </g>
        );
      })}
      <circle cx={cx} cy={470} r={60} fill={C.yellow} stroke={OL} strokeWidth={5} />
      <Appear t={t} at={at(ctx, 0.4)}>
        <Label x={cx} y={150} text="«крайне трудно работать»" size={34} bg={DC.ppl.light} />
      </Appear>
      {t > b1 && (
        <Appear t={t} at={b1 + 0.2}>
          <g transform={`translate(${cx} 810)`}>
            <Card x={-280} y={0} w={500} h={100} lines={["«без Илона ничего бы не было»"]} edge={DC.eng.color} />
            <Card x={280} y={0} w={500} h={100} lines={["аноним: «как боеприпасы»"]} edge={DC.ppl.color} />
          </g>
        </Appear>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.2}>
          <Label x={cx} y={470} text="цена вне отчёта" size={30} bg="#fff" />
        </Appear>
      )}
    </Drift>
  );
};

// ── Баланс жизни и работы ──
export const Balance: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b3 = at(ctx, 3);
  const tilt = (14 * ramp(t, 0.5, 1.6) - 14 * ramp(t, b3 + 0.2, 1.6)) + Math.sin(t * 1.3) * 1;
  const r = (tilt * Math.PI) / 180;
  const arm = 340;
  const L = { x: cx - Math.cos(r) * arm, y: 400 - Math.sin(r) * arm };
  const R = { x: cx + Math.cos(r) * arm, y: 400 + Math.sin(r) * arm };
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <path d={`M ${cx} 400 L ${cx} 820 M ${cx - 120} 830 L ${cx + 120} 830`} stroke={OL} strokeWidth={14} strokeLinecap="round" />
      <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <circle cx={cx} cy={400} r={18} fill={C.yellow} stroke={OL} strokeWidth={4} />
      <g transform={`translate(${L.x} ${L.y + 70})`}>
        <rect x={-150} y={-50} width={300} height={100} rx={22} fill="#fff" stroke={OL} strokeWidth={4} />
        <Txt x={0} y={14} size={34}>
          жизнь, семья
        </Txt>
      </g>
      <g transform={`translate(${R.x} ${R.y + 70})`}>
        <rect x={-150} y={-50} width={300} height={100} rx={22} fill={DC.res.light} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={14} size={34}>
          работа
        </Txt>
      </g>
      {t > b1 && t < b3 && (
        <Appear t={t} at={b1 + 0.1}>
          <g transform={`translate(${cx} 180)`}>
            <rect x={-500} y={-50} width={1000} height={96} rx={24} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={32}>
              Вэнс: «Работа и есть жизнь…»
            </Txt>
          </g>
        </Appear>
      )}
      {t > at(ctx, 2) && t < b3 && (
        <Appear t={t} at={at(ctx, 2)}>
          <Label x={cx} y={920} text="«Отпуск убьет меня» — слова Маска" size={30} bg={DC.ppl.light} />
        </Appear>
      )}
      {t > b3 && (
        <Appear t={t} at={b3 + 0.1}>
          <g transform={`translate(${cx} 180)`}>
            <rect x={-500} y={-50} width={1000} height={96} rx={24} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={32}>
              часы работы ≠ ценность человека
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Критики и защита ──
export const Critics: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const both = ramp(t, b2, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <g transform={`translate(${cx - 270 + both * 30} 0)`} opacity={ramp(t, 0.3, 0.5)}>
        <rect x={-230} y={260} width={460} height={420} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
        <rect x={-230} y={260} width={460} height={70} rx={30} fill={C.metalDark} />
        <Txt x={0} y={308} size={34} color="#fff">
          критики
        </Txt>
        <Txt x={0} y={420} size={30}>
          {"«переоценённая\nигрушка»"}
        </Txt>
        <Txt x={0} y={580} size={30}>
          сомнения в обещаниях
        </Txt>
      </g>
      <g transform={`translate(${cx + 270 - both * 30} 0)`} opacity={ramp(t, b1, 0.5)}>
        <rect x={-230} y={260} width={460} height={420} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
        <rect x={-230} y={260} width={460} height={70} rx={30} fill="#3d7bd9" />
        <Txt x={0} y={308} size={34} color="#fff">
          Вэнс
        </Txt>
        <Txt x={0} y={420} size={30}>
          {"признаёт\nограничения"}
        </Txt>
        <Txt x={0} y={580} size={30}>
          {"спорит о значении\nракетной компании"}
        </Txt>
      </g>
      {both > 0 && (
        <g opacity={both}>
          <Arrow x1={cx - 60} y1={800} x2={cx + 60} y2={800} k={both} color="#fff" w={8} />
          <Arrow x1={cx + 60} y1={850} x2={cx - 60} y2={850} k={both} color="#fff" w={8} />
          <Label x={cx} y={940} text="достижения и цена — вместе" size={32} bg={C.yellow} />
        </g>
      )}
    </Drift>
  );
};
