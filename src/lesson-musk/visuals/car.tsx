// Сцены BM-029 об электромобилях: кто основал компанию, батарея, трансмиссия и
// бюджет, образец без завода, цепочка финансирования, решения и плохие новости,
// зарядная сеть, кризис продаж 2013 года и Гигафабрика. Условные схемы.
import React from "react";
import { C, DC, DISPLAY } from "../theme";
import { Car, Cell, DateCard, Factory } from "./objects";
import { dotsOf, Morph, SH, Swarm } from "./dots";
import { Appear, area, Arrow, at, clamp01, Cross, Drift, pop, ramp, Txt, type VisualProps } from "./kit";
import { Card, Label, OL, Person } from "./people";

const ENG = [DC.eng.color, DC.eng.deep, "#7fe3dc"];

// ── Кто основал Tesla: схема ролей ──
export const Founders: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const myth = ramp(t, 0.2, 0.5) * (1 - ramp(t, b1, 0.6));
  const node = (x: number, y: number, who: "founder" | "designer" | "engineer" | "investor" | "partner", name: string, role: string, k: number, c: string) => (
    <g opacity={k} transform={`translate(${x} ${y + (1 - k) * 40})`}>
      <circle cx={0} cy={-70} r={78} fill={c} fillOpacity={0.35} stroke={OL} strokeWidth={4} />
      <Person who={who} x={0} y={0} s={0.3} mood="smile" pose="stand" t={t} />
      <rect x={-130} y={20} width={260} height={84} rx={18} fill="#fff" stroke={OL} strokeWidth={4} />
      <Txt x={0} y={56} size={28}>
        {name}
      </Txt>
      <Txt x={0} y={90} size={22} color={C.inkSoft}>
        {role}
      </Txt>
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      {myth > 0 && (
        <g opacity={myth}>
          <Person who="founder" x={cx} y={760} s={0.7} mood="happy" pose="arms" t={t} />
          <Label x={cx} y={260} text="«гений-одиночка»?" size={44} bg={C.paper} />
          <Cross x={cx} y={250} s={120} k={ramp(t, at(ctx, 0.7), 0.4)} />
        </g>
      )}
      {t > b1 - 0.2 && (
        <g>
          <DateCard x={cx} y={190} text="1 июля 2003" />
          {node(cx - 250, 470, "designer", "Мартин Эберхард", "сооснователь", ramp(t, b1, 0.5), DC.eng.color)}
          {node(cx + 250, 470, "partner", "Марк Тарпеннинг", "сооснователь", ramp(t, b1 + 0.4, 0.5), DC.eng.color)}
          {node(cx - 250, 760, "investor", "Илон Маск", "инвестор · председатель", ramp(t, at(ctx, 1.6), 0.5), DC.res.color)}
          {node(cx + 250, 760, "engineer", "Дж. Б. Штробель", "идея батареи", ramp(t, b2 + 0.3, 0.5), DC.ppl.color)}
          <g opacity={ramp(t, b2 + 1.2, 0.6)}>
            {[
              [cx - 120, 520, cx + 120, 520],
              [cx - 250, 590, cx - 250, 620],
              [cx + 250, 590, cx + 250, 620],
              [cx - 120, 790, cx + 120, 790],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={6} strokeDasharray="12 10" />
            ))}
          </g>
        </g>
      )}
    </Drift>
  );
};

// ── Батарея из тысяч ячеек: тепловой разбег и барьер ──
export const BatteryPack: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const cols = 14;
  const rows = 6;
  const fire = clamp01((t - at(ctx, 0.5)) / 2.2);
  const fixed = t > b1;
  const contain = ramp(t, b1 + 0.5, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <g transform={`translate(${cx - (cols * 52) / 2} 300)`}>
        <rect x={-30} y={-30} width={cols * 52 + 40} height={rows * 80 + 40} rx={24} fill={C.metal} stroke={OL} strokeWidth={5} />
        {Array.from({ length: cols * rows }, (_, i) => {
          const cxi = i % cols;
          const ry = Math.floor(i / cols);
          const d = Math.hypot(cxi - 3, ry - 2);
          const hotNow = fixed ? (d < 0.5 ? 1 : 0) : clamp01(fire * 6 - d);
          const k = ramp(t, 0.1 + (i % 17) * 0.04, 0.3);
          return (
            <g key={i} opacity={k}>
              <Cell x={cxi * 52 + 4} y={ry * 80 + 40} s={0.5} hot={hotNow} />
            </g>
          );
        })}
        {fixed &&
          [0, 1].map((j) => (
            <rect key={j} x={(j ? 4 : 1) * 52 + 4 - 26 + (j ? 30 : -6)} y={-10} width={8} height={rows * 80 * contain} rx={4} fill={C.yellow} stroke={OL} strokeWidth={2} />
          ))}
      </g>
      {!fixed && fire > 0.2 && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const u = ((t * 1.3 + j * 0.17) % 1);
            return <circle key={j} cx={cx - 190 + Math.cos(j) * 80 * u} cy={440 - u * 160} r={14 * (1 - u)} fill={j % 2 ? C.flame : C.yellow} />;
          })}
          <Appear t={t} at={at(ctx, 0.75)}>
            <Label x={cx + 260} y={210} text="«как от связки фейерверков»" size={30} bg={DC.ppl.light} />
          </Appear>
        </g>
      )}
      {fixed && (
        <Appear t={t} at={b1 + 0.3}>
          <Label x={cx} y={210} text="найти место отказа и закрыть" size={32} bg={C.yellow} />
        </Appear>
      )}
      <DateCard x={A.x0 + 150} y={860} text="2005" />
    </Drift>
  );
};

// ── Трансмиссия и бюджет ──
export const Budget: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const spin = t < b1 ? t * 400 * (1 - ramp(t, at(ctx, 0.6), 0.3)) : 0;
  const plan = ramp(t, b1 + 0.6, 0.6);
  const real = ramp(t, b1 + 1.4, 1.8);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <g opacity={1 - ramp(t, b1, 0.6) * 0.6}>
        <g transform={`translate(${cx - 360} 420) rotate(${spin})`}>
          <path d={Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; const r1 = 120; const r2 = 150; return `${i ? "L" : "M"} ${Math.cos(a) * r2} ${Math.sin(a) * r2} L ${Math.cos(a + 0.26) * r2} ${Math.sin(a + 0.26) * r2} L ${Math.cos(a + 0.26) * r1} ${Math.sin(a + 0.26) * r1} L ${Math.cos(a + 0.52) * r1} ${Math.sin(a + 0.52) * r1}`; }).join(" ") + " Z"} fill={C.metal} stroke={OL} strokeWidth={5} />
          <circle r={40} fill={C.metalDark} stroke={OL} strokeWidth={5} />
        </g>
        {t > at(ctx, 0.6) && <path d={`M ${cx - 420} 340 L ${cx - 370} 420 L ${cx - 410} 470 L ${cx - 340} 540`} stroke={C.red} strokeWidth={10} fill="none" />}
        <Appear t={t} at={at(ctx, 0.6)}>
          <Label x={cx - 360} y={680} text="«всего 40 секунд»" size={32} bg={DC.ppl.light} />
        </Appear>
      </g>
      {t > b1 && (
        <g transform={`translate(${cx + 180} 0)`}>
          <line x1={-260} y1={780} x2={300} y2={780} stroke={OL} strokeWidth={6} />
          <rect x={-200} y={780 - 70 * plan} width={170} height={70 * plan} rx={10} fill={DC.res.light} stroke={OL} strokeWidth={4} />
          <rect x={60} y={780 - 390 * real} width={170} height={390 * real} rx={10} fill={DC.res.color} stroke={OL} strokeWidth={4} />
          <g opacity={plan}>
            <Txt x={-115} y={830} size={28} color="#fff">
              план 2004
            </Txt>
            <Label x={-115} y={660} text="25 млн $" size={30} bg="#fff" />
          </g>
          <g opacity={real}>
            <Txt x={145} y={830} size={28} color="#fff">
              итог
            </Txt>
            <Label x={145} y={340} text="140 млн $" size={30} bg="#fff" />
          </g>
        </g>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.2}>
          <g transform={`translate(${cx - 330} 380)`}>
            <rect x={-200} y={-90} width={400} height={180} rx={22} fill="#fff" stroke={OL} strokeWidth={4} />
            <text x={0} y={-24} fontFamily={DISPLAY} fontSize={50} fontWeight={800} fill={C.inkSoft} textAnchor="middle" textDecoration="line-through">
              92 тыс. $
            </text>
            <text x={0} y={52} fontFamily={DISPLAY} fontSize={58} fontWeight={800} fill={C.red} textAnchor="middle">
              109 тыс. $
            </text>
            <Txt x={0} y={140} size={28} color="#fff">
              и для предзаказов
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Красивый образец без завода ──
export const Prototype: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const one = dotsOf("proto-car", SH.car(330), cx, 450, ENG, 14, 350);
  const many = dotsOf(
    "proto-many",
    SH.union(SH.move(SH.car(150), -330, -80), SH.move(SH.car(150), 0, -80), SH.move(SH.car(150), 330, -80), SH.move(SH.car(150), -165, 110), SH.move(SH.car(150), 165, 110)),
    cx,
    450,
    ENG,
    11,
    520,
  );
  const m = clamp01((t - b2 - 0.2) / 2.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      {t < b2 ? <Swarm pts={one} k={clamp01(t / 2.2)} t={t} r={6.5} spread={700} seed={5} /> : <Morph a={one} b={many} k={m} t={t} r={5.5} />}
      {/* сцена презентации */}
      <g opacity={1 - ramp(t, b2, 0.6)}>
        <ellipse cx={cx} cy={640} rx={420} ry={50} fill="#fff" opacity={0.25} />
        <DateCard x={cx - 420} y={200} text="2009" />
      </g>
      {t > b1 && t < b2 + 0.5 && (
        <g opacity={ramp(t, b1, 0.5)}>
          <g transform={`translate(${cx - 230} 800)`}>
            <Card x={0} y={0} w={320} h={100} lines={["денег нет"]} edge={DC.res.color} />
          </g>
          <g transform={`translate(${cx + 230} 800)`}>
            <Card x={0} y={0} w={320} h={100} lines={["завода нет"]} edge={DC.eng.color} />
          </g>
          <Label x={cx} y={200} text="шансы «стремились к нулю»" size={32} bg={DC.ppl.light} />
        </g>
      )}
      {t > b2 && (
        <g opacity={ramp(t, b2 + 0.4, 0.6)}>
          <Label x={cx - 330} y={200} text="прототип: можно сделать" size={30} bg="#fff" />
          <Label x={cx + 330} y={200} text="серия: можно делать тысячами" size={30} bg={C.yellow} />
        </g>
      )}
      {t > at(ctx, 3) && (
        <Appear t={t} at={at(ctx, 3)}>
          <g transform={`translate(${cx} 830)`}>
            <rect x={-420} y={-50} width={840} height={96} rx={24} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={32}>
              хотели 100–200 млн $ — «крайне недооценивая»
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Цепочка финансирования завода ──
export const FundingChain: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b3 = at(ctx, 3);
  const links = [
    { n: "Daimler", v: "50 млн $", c: DC.eng.color },
    { n: "ссуда", v: "465 млн $", c: DC.res.color },
    { n: "завод", v: "42 млн $", c: C.metalDark },
    { n: "Toyota", v: "50 млн $", c: DC.ppl.color },
  ];
  const fac = ramp(t, at(ctx, 1.7), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      {links.map((l, i) => {
        const k = pop(t, b1 + 0.2 + i * 0.7);
        const x = cx - 420 + i * 280;
        return (
          <g key={l.n} transform={`translate(${x} 300) scale(${k})`}>
            <rect x={-120} y={-70} width={240} height={140} rx={70} fill="none" stroke={l.c} strokeWidth={22} />
            <rect x={-120} y={-70} width={240} height={140} rx={70} fill="none" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={-6} size={28} color="#fff">
              {l.n}
            </Txt>
            <Txt x={0} y={34} size={26} color={C.yellow}>
              {l.v}
            </Txt>
          </g>
        );
      })}
      <g transform={`translate(${cx} 780)`}>
        <Factory x={0} y={0} w={620} k={fac} t={t} />
      </g>
      {t > at(ctx, 2) && (
        <Appear t={t} at={at(ctx, 2)}>
          <Label x={cx} y={490} text="каждое звено — чьё-то доверие" size={32} bg={C.yellow} />
        </Appear>
      )}
      {t > b3 && (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} opacity={ramp(t, b3 + i * 0.08, 0.3)}>
              <Person who={(["worker", "welder", "engineer", "worker"] as const)[i % 4]} x={i < 6 ? cx - 560 + i * 40 : cx + 360 + (i - 6) * 40} y={790} s={0.2} mood="happy" pose="stand" t={t} seed={i} />
            </g>
          ))}
          <Appear t={t} at={b3 + 0.6}>
            <Label x={cx} y={880} text="рабочие места для тысяч людей" size={28} bg={C.paper} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Решения и плохие новости ──
export const Decisions: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const late = ramp(t, at(ctx, 2.55), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <g opacity={1 - ramp(t, b2, 0.6) * 0.5}>
        <Car x={cx - 140} y={560} s={0.9} t={t} color="#c9d3e3" />
        <Appear t={t} at={0.5}>
          <Label x={cx - 360} y={300} text="алюминиевый кузов" size={30} bg={DC.eng.light} />
        </Appear>
        <Appear t={t} at={1.3}>
          <g transform={`translate(${cx + 330} 380)`}>
            <rect x={-80} y={-110} width={160} height={220} rx={14} fill="#22284a" stroke={OL} strokeWidth={5} />
            <rect x={-64} y={-94} width={128} height={188} rx={8} fill={C.sky} />
            <Label x={0} y={-160} text="большой экран" size={28} bg={DC.eng.light} />
          </g>
        </Appear>
      </g>
      {t > b1 && (
        <Appear t={t} at={b1 + 0.1}>
          <g transform={`translate(${cx} 780)`}>
            <rect x={-470} y={-60} width={940} height={120} rx={28} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-8} size={30}>
              «Не надо говорить Илону,
            </Txt>
            <Txt x={0} y={34} size={30}>
              что что-то нельзя сделать»
            </Txt>
          </g>
        </Appear>
      )}
      {t > b2 && (
        <g>
          {/* плохая новость — конверт, который идёт всё дольше и растёт */}
          <g transform={`translate(${cx - 380 + late * 640} ${300 - Math.sin(late * Math.PI) * 80}) scale(${0.8 + late * 0.8})`}>
            <rect x={-60} y={-40} width={120} height={80} rx={8} fill={C.paper} stroke={OL} strokeWidth={4} />
            <path d="M -60 -40 L 0 6 L 60 -40" fill="none" stroke={OL} strokeWidth={4} />
            <circle cx={40} cy={22} r={14} fill={C.red} />
          </g>
          <Appear t={t} at={at(ctx, 2.75)}>
            <Label x={cx + 260} y={480} text="задержка: 18 месяцев — два с лишним года" size={26} bg={DC.ppl.light} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Зарядная сеть ──
export const Supercharger: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const road = ramp(t, 0.3, 1.4);
  const stations = [0.15, 0.42, 0.7, 0.93];
  const carU = ((t * 0.12) % 1);
  const charge = clamp01((t - b1 - 0.2) / 2.4);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <path d={`M ${A.x0 + 40} 520 Q ${cx} 380 ${A.x1 - 40} 520`} stroke="#444a66" strokeWidth={60} fill="none" strokeDasharray={`${1600 * road} 2000`} />
      <path d={`M ${A.x0 + 40} 520 Q ${cx} 380 ${A.x1 - 40} 520`} stroke="#fff" strokeWidth={5} fill="none" strokeDasharray="30 30" opacity={road} />
      {stations.map((u, i) => {
        const x = A.x0 + 40 + (A.x1 - A.x0 - 80) * u;
        const y = 520 - Math.sin(u * Math.PI) * 140 * 0.98 - 90;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${pop(t, 0.8 + i * 0.4)})`}>
            <rect x={-26} y={-70} width={52} height={90} rx={12} fill={DC.ppl.color} stroke={OL} strokeWidth={4} />
            <path d="M -6 -50 L 8 -30 L -4 -28 L 8 -6" stroke="#fff" strokeWidth={6} fill="none" strokeLinejoin="round" />
          </g>
        );
      })}
      {t < b1 && (
        <g transform={`translate(${A.x0 + 40 + (A.x1 - A.x0 - 80) * carU} ${520 - Math.sin(carU * Math.PI) * 140})`}>
          <Car x={0} y={-30} s={0.22} t={t} drive={1} />
        </g>
      )}
      <Appear t={t} at={at(ctx, 0.6)}>
        <Label x={cx} y={200} text="«пан или пропал»" size={40} bg={C.paper} />
      </Appear>
      {t > b1 && (
        <g>
          <g transform={`translate(${cx - 300} 790)`}>
            <rect x={-200} y={-60} width={400} height={120} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-186} y={-46} width={372 * charge} height={92} rx={14} fill={DC.eng.color} />
            <rect x={200} y={-24} width={20} height={48} rx={6} fill={OL} />
            <Txt x={0} y={14} size={34}>
              150 миль ≈ 20 минут
            </Txt>
          </g>
          <Appear t={t} at={at(ctx, 1.5)}>
            <g transform={`translate(${cx + 300} 820)`}>
              <rect x={-170} y={-24} width={340} height={30} rx={10} fill="#f7f3ea" stroke={OL} strokeWidth={4} />
              <Person who="founder" x={0} y={84} s={0.3} mood="think" pose="point" t={t} />
              <Label x={0} y={-80} text="стол — прямо в цеху" size={26} bg={C.paper} />
            </g>
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Кризис продаж 2013 ──
export const SalesTurn: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const orders = 10;
  const sold = t < b1 ? 1 : Math.min(orders, 1 + Math.floor((t - b1 - 0.6) * 2));
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      <DateCard x={cx - 420} y={190} text="начало 2013" />
      {/* заказы → проданные машины */}
      {Array.from({ length: orders }, (_, i) => {
        const done = i < sold;
        return (
          <g key={i} transform={`translate(${cx - 450 + (i % 5) * 190} ${380 + Math.floor(i / 5) * 170})`} opacity={ramp(t, 0.3 + i * 0.06, 0.3)}>
            {done ? <Car x={0} y={20} s={0.24} t={t} /> : (
              <g>
                <rect x={-60} y={-36} width={120} height={80} rx={10} fill="#fff" stroke={OL} strokeWidth={3} strokeDasharray="10 8" />
                <Txt x={0} y={14} size={26}>
                  заказ
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      {t > at(ctx, 0.55) && t < b1 + 0.5 && (
        <g opacity={ramp(t, at(ctx, 0.55), 0.4)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Person key={i} who={(["engineer", "designer", "manager", "engineer2", "assistant"] as const)[i]} x={cx - 300 + i * 150} y={830} s={0.26} mood="tense" pose="phone" t={t} seed={i} />
          ))}
          <Label x={cx} y={720} text="все сотрудники — продают" size={28} bg={DC.ppl.light} />
        </g>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.1}>
          <g transform={`translate(${cx} 820)`}>
            <rect x={-440} y={-70} width={880} height={140} rx={28} fill="#eaf7ec" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-12} size={30}>
              8 мая 2013
            </Txt>
            <Txt x={0} y={38} size={36}>
              прибыль 11 млн $ · продажи 562 млн $
            </Txt>
          </g>
        </Appear>
      )}
      {t > b1 && t < b2 && (
        <Appear t={t} at={b1 + 0.2}>
          <Label x={cx + 360} y={200} text="«осведомленные источники»" size={26} bg={C.paper} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Гигафабрика: узкое место переезжает ──
export const Gigafactory: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  // «бутылочное горлышко» переезжает по цепочке: двигатель → батареи
  const chain = ["двигатель", "кузов", "батареи"];
  const neck = 2;
  const move = ramp(t, 0.3, 1.4);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={470} amount={0.03}>
      {chain.map((c, i) => {
        const x = cx - 380 + i * 380;
        const hot = i === neck ? move : i === 0 ? 1 - move : 0;
        return (
          <g key={c} transform={`translate(${x} 360)`}>
            <rect x={-150} y={-70} width={300} height={140} rx={28} fill={hot > 0.5 ? DC.ppl.light : "#fff"} stroke={hot > 0.5 ? C.red : OL} strokeWidth={hot > 0.5 ? 8 : 5} />
            <Txt x={0} y={12} size={34}>
              {c}
            </Txt>
            {i < 2 && <Arrow x1={160} y1={0} x2={220} y2={0} k={1} color="#fff" w={7} />}
          </g>
        );
      })}
      <g transform={`translate(${cx + 380} 470)`} opacity={move}>
        <path d="M -30 0 L -14 60 L 14 60 L 30 0 Z" fill={C.red} opacity={0.8} />
        <Txt x={0} y={110} size={28} color="#fff">
          узкое место
        </Txt>
      </g>
      <g transform={`translate(${cx - 140} 860)`}>
        <Factory x={0} y={0} w={720} k={ramp(t, at(ctx, 0.5), 2.4)} t={t} color={C.metal} />
      </g>
      <Appear t={t} at={at(ctx, 0.7)}>
        <Label x={cx + 420} y={700} text="Гигафабрика" size={34} bg={C.paper} />
      </Appear>
      {t > b1 && (
        <Appear t={t} at={b1 + 0.2}>
          <g transform={`translate(${cx + 420} 800)`}>
            <Card x={0} y={0} w={360} h={120} lines={["полгода задержки", "≈ миллиард в месяц"]} edge={DC.res.color} />
          </g>
        </Appear>
      )}
    </Drift>
  );
};

