// Сцены BM-029 о ракетах: Марсианский оазис, таблица в самолёте, «всё внутри»,
// стенд, остров, пуски, поиск виноватого, цена деталей, давление сроков,
// ракета без рынка, Dragon у станции, выбор 2008 года и спасение.
// Ракеты, корабль и станция — условные схемы, не чертежи.
import React from "react";
import { C, DC, DISPLAY, FONT } from "../theme";
import { Coins, DateCard, Rocket } from "./objects";
import { dotsOf, Morph, SH, Swarm } from "./dots";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { Card, Label, OL, Person } from "./people";


// ── Марсианский оазис: от символа к цене ракеты ──
export const Oasis: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const mars = ramp(t, 0.2, 0.8);
  const shift = ramp(t, b2, 1);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.035}>
      <g opacity={1 - shift * 0.7}>
        <circle cx={cx + 300} cy={420} r={190 * mars} fill="#e0784a" stroke={OL} strokeWidth={5} />
        <circle cx={cx + 240} cy={360} r={30 * mars} fill="#c45c33" />
        <circle cx={cx + 360} cy={480} r={22 * mars} fill="#c45c33" />
        {/* оранжерея-купол */}
        <g transform={`translate(${cx - 220} 560) scale(${pop(t, 0.8)})`}>
          <path d="M -140 0 A 140 140 0 0 1 140 0 Z" fill={C.glass} fillOpacity={0.8} stroke={OL} strokeWidth={5} />
          <path d="M -70 0 L -70 -122 M 0 0 L 0 -140 M 70 0 L 70 -122 M -126 -60 L 126 -60" stroke={C.metal} strokeWidth={4} />
          {[-80, -20, 40, 90].map((x, i) => (
            <path key={i} d={`M ${x} 0 q -10 -40 0 -${50 + i * 8} q 14 20 0 ${50 + i * 8}`} fill="#3fbf6a" stroke={OL} strokeWidth={2} />
          ))}
        </g>
        <Appear t={t} at={1}>
          <Label x={cx - 220} y={660} text="символический проект" size={30} bg={C.paper} />
        </Appear>
      </g>
      {t > b1 && (
        <g transform={`translate(${cx} ${790})`} opacity={1 - shift * 0.3}>
          <Appear t={t} at={b1 + 0.1}>
            <Label x={-260} y={0} text="план: 20–30 млн $" size={32} bg={DC.res.light} />
          </Appear>
          <Appear t={t} at={b1 + 1.4}>
            <Label x={260} y={0} text="«как следует» — гораздо больше" size={30} bg={DC.ppl.light} />
          </Appear>
        </g>
      )}
      {shift > 0 && (
        <g>
          <Rocket x={cx} y={760} s={0.85 * shift + 0.15} t={t} fail={shift > 0.9 ? "tank" : null} />
          <Appear t={t} at={b2 + 0.8}>
            <Label x={cx + 320} y={420} text="цена ракеты" size={40} bg={C.yellow} />
          </Appear>
          {t > at(ctx, 2.6) && (
            <g opacity={ramp(t, at(ctx, 2.6), 0.4)}>
              <text x={cx - 340} y={300} fontFamily={DISPLAY} fontSize={44} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
                мыши
              </text>
              <Cross x={cx - 340} y={286} s={110} k={ramp(t, at(ctx, 2.75), 0.5)} />
            </g>
          )}
        </g>
      )}
    </Drift>
  );
};

// ── Таблица в самолёте: купить или построить ──
export const Spreadsheet: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const rows = ["материалы", "сборка", "запуск"];
  const buy = ramp(t, 0.2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.035}>
      {/* «купить» — закрытая дверь */}
      <g transform={`translate(${cx - 360} 470)`} opacity={buy * (1 - ramp(t, b1, 0.6) * 0.6)}>
        <rect x={-120} y={-170} width={240} height={340} rx={18} fill="#9aa6c0" stroke={OL} strokeWidth={5} />
        <circle cx={70} cy={0} r={12} fill={C.yellow} stroke={OL} strokeWidth={3} />
        <Txt x={0} y={-200} size={36} color="#fff">
          купить?
        </Txt>
        <Cross x={0} y={0} s={150} k={ramp(t, at(ctx, 0.6), 0.6)} />
      </g>
      {/* таблица-расчёт */}
      {t > b1 - 0.3 && (
        <g transform={`translate(${cx + 150} 470) scale(${pop(t, b1 - 0.3)})`}>
          <rect x={-330} y={-230} width={660} height={460} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={-330} y={-230} width={660} height={70} rx={22} fill={DC.eng.color} />
          <rect x={-330} y={-190} width={660} height={30} fill={DC.eng.color} />
          <Txt x={0} y={-182} size={34} color="#fff">
            построить самим
          </Txt>
          {rows.map((r, i) => {
            const k = ramp(t, b1 + 0.5 + i * 0.5, 0.4);
            return (
              <g key={r} opacity={k}>
                <text x={-290} y={-80 + i * 90} fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink}>
                  {r}
                </text>
                <rect x={60} y={-112 + i * 90} width={220 * k} height={40} rx={8} fill={DC.eng.light} stroke={OL} strokeWidth={3} />
              </g>
            );
          })}
          <line x1={-300} y1={170} x2={300} y2={170} stroke={OL} strokeWidth={4} opacity={ramp(t, b2 - 0.5, 0.4)} />
          <g opacity={ramp(t, b2, 0.5)}>
            <text x={0} y={215} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={DC.eng.deep} textAnchor="middle">
              «гораздо дешевле»?
            </text>
          </g>
        </g>
      )}
      {t > at(ctx, 2.5) && (
        <Appear t={t} at={at(ctx, 2.5)}>
          <Label x={cx + 150} y={860} text="допущение → проверить железом" size={32} bg={C.yellow} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Всё внутри компании ──
export const InHouse: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const parts = ["двигатели", "турбонасос", "баки", "наведение"];
  const ring = ramp(t, 0.3, 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <rect x={cx - 520} y={230} width={1040} height={560} rx={60} fill="#fff" fillOpacity={0.12} stroke="#fff" strokeWidth={6} strokeDasharray={`${3200 * ring} 3200`} />
      <Txt x={cx} y={290} size={34} color="#fff" opacity={ring}>
        внутри компании
      </Txt>
      {parts.map((q, i) => {
        const k = pop(t, at(ctx, 0.25 + i * 0.18));
        const x = cx - 390 + i * 260;
        return (
          <g key={q} transform={`translate(${x} 450) scale(${k})`}>
            <circle r={84} fill={DC.eng.light} stroke={OL} strokeWidth={5} />
            {i === 0 && <path d="M -30 -40 L 30 -40 L 46 40 L -46 40 Z" fill={C.metalDark} stroke={OL} strokeWidth={4} />}
            {i === 1 && <g fill="none" stroke={OL} strokeWidth={6}><circle r={40} /><path d="M 0 -40 Q 30 0 0 40 M -40 0 Q 0 -30 40 0" /></g>}
            {i === 2 && <rect x={-30} y={-50} width={60} height={100} rx={24} fill={C.metal} stroke={OL} strokeWidth={4} />}
            {i === 3 && <g><circle r={44} fill="none" stroke={OL} strokeWidth={5} /><path d="M 0 -44 L 10 0 L 0 44 L -10 0 Z" fill={C.red} stroke={OL} strokeWidth={3} transform={`rotate(${t * 40})`} /></g>}
            <Txt x={0} y={130} size={30} color="#fff">
              {q}
            </Txt>
          </g>
        );
      })}
      {t > b1 && (
        <g>
          <Person who="engineer" x={cx - 140} y={770} s={0.36} mood="smile" pose="point" t={t} />
          <Person who="welder" x={cx + 60} y={770} s={0.36} mood="smile" pose="stand" t={t} seed={2} flip />
          <Appear t={t} at={b1 + 0.2}>
            <Label x={cx - 40} y={870} text="инженер рядом со сварщиком" size={28} bg={C.paper} />
          </Appear>
          <Appear t={t} at={at(ctx, 1.55)}>
            <g transform={`translate(${cx + 380} 720)`}>
              <Card x={0} y={0} w={330} h={120} lines={["сложнее", "и дороже"]} edge={DC.res.color} />
            </g>
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Стенд: испытание — не полёт ──
export const TestStand: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const cyc = t < b1 ? (t % 2.2) / 2.2 : 0;
  const burst = t < b1 && cyc < 0.25 ? 1 - cyc * 4 : 0;
  const steady = t >= b1 ? 1 : 0;
  const flame = steady ? 1 + Math.sin(t * 30) * 0.05 : burst;
  const crack = t < b1 && t > at(ctx, 0.45);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {/* стенд: двигатель горизонтально */}
      <g transform={`translate(${cx - 120} 470)`}>
        <rect x={-320} y={-200} width={60} height={420} rx={10} fill={C.metalDark} stroke={OL} strokeWidth={5} />
        <rect x={-260} y={-70} width={220} height={140} rx={20} fill={C.metal} stroke={OL} strokeWidth={5} />
        <path d="M -40 -60 L 80 -100 L 80 100 L -40 60 Z" fill={C.metalDark} stroke={OL} strokeWidth={5} />
        {crack && <path d="M 10 -60 L 30 -20 L 15 10 L 40 50" stroke={C.red} strokeWidth={6} fill="none" />}
        {flame > 0 && (
          <g transform={`translate(80 0) scale(${flame} ${0.8 + flame * 0.2})`}>
            <path d="M 0 -90 Q 260 -40 420 0 Q 260 40 0 90 Z" fill={C.flame} opacity={0.9} />
            <path d="M 0 -50 Q 160 -20 260 0 Q 160 20 0 50 Z" fill={C.yellow} />
          </g>
        )}
      </g>
      {t < b1 && (
        <Appear t={t} at={0.6}>
          <Label x={cx + 260} y={250} text="глохнет через полсекунды" size={30} bg={DC.ppl.light} />
        </Appear>
      )}
      {t >= b1 && (
        <Appear t={t} at={b1 + 0.2}>
          <DateCard x={cx + 300} y={230} text="осень 2004" />
          <Label x={cx + 300} y={360} text="работает стабильно" size={30} bg={DC.eng.light} />
        </Appear>
      )}
      {t > at(ctx, 1.6) && (
        <g transform={`translate(${cx - 120} 820)`}>
          {["испытание", "данные", "исправление"].map((s, i) => (
            <g key={s} opacity={ramp(t, at(ctx, 1.6) + i * 0.4, 0.4)}>
              <rect x={-420 + i * 300} y={-40} width={240} height={80} rx={20} fill={i === 1 ? C.yellow : "#fff"} stroke={OL} strokeWidth={4} />
              <Txt x={-300 + i * 300} y={12} size={30}>
                {s}
              </Txt>
              {i < 2 && <Arrow x1={-170 + i * 300} y1={0} x2={-130 + i * 300} y2={0} k={1} color="#fff" w={6} />}
            </g>
          ))}
        </g>
      )}
      {t > b2 && (
        <g transform={`translate(${cx + 420} 600)`}>
          <Coins x={0} y={0} n={Math.max(0, 4 - Math.floor((t - b2) * 1.5))} s={0.6} />
        </g>
      )}
    </Drift>
  );
};

// ── Остров и странная экономия ──
export const Island: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const roll = clamp01((t - b1 - 0.8) / 3.5);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {/* океан */}
      <rect x={A.x0} y={560} width={A.x1 - A.x0} height={360} fill="#3a8fc8" opacity={0.6} />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M ${A.x0 + i * 160 + ((t * 30) % 160)} ${620 + (i % 3) * 70} q 20 -14 40 0 q 20 14 40 0`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
      ))}
      <ellipse cx={cx} cy={600} rx={460} ry={80} fill="#e9d29a" stroke={OL} strokeWidth={5} />
      {/* пальмы, вагончик, ангар, стол */}
      {[-380, 380].map((dx, i) => (
        <g key={i} transform={`translate(${cx + dx} 590)`}>
          <path d="M 0 0 Q 10 -80 0 -160" stroke="#7a5a3a" strokeWidth={14} fill="none" />
          {[0, 1, 2, 3].map((j) => (
            <path key={j} d={`M 0 -160 q ${40 * (j % 2 ? 1 : -1)} -20 ${90 * (j % 2 ? 1 : -1)} ${10 + j * 8}`} stroke="#2f8a4a" strokeWidth={14} fill="none" strokeLinecap="round" transform={`rotate(${wob(t, j, 4)} 0 -160)`} />
          ))}
        </g>
      ))}
      <rect x={cx - 260} y={500} width={150} height={80} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
      <Txt x={cx - 185} y={550} size={22}>
        офис
      </Txt>
      <rect x={cx + 120} y={470} width={180} height={110} rx={10} fill={C.metal} stroke={OL} strokeWidth={4} />
      <Txt x={cx + 210} y={540} size={22}>
        ангар
      </Txt>
      {/* солнце-жара */}
      <circle cx={A.x1 - 160} cy={200} r={70} fill={C.yellow} opacity={0.9} />
      <Appear t={t} at={0.5}>
        <Label x={cx} y={220} text="атолл Кваджалейн" size={38} bg={C.paper} />
      </Appear>
      {t > b1 && (
        <g>
          {/* дорожка из досок и ракета, которую катят */}
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={cx - 100 + i * 30} y={600} width={24} height={12} fill="#a87b4c" stroke={OL} strokeWidth={2} opacity={ramp(t, b1 + i * 0.05, 0.3)} />
          ))}
          <g transform={`translate(${cx + 210 - roll * 300} 596) rotate(-90)`}>
            <Rocket x={0} y={0} s={0.28} t={t} />
          </g>
          <Appear t={t} at={b1 + 0.6}>
            <Label x={cx} y={780} text="асфальт для 200 ярдов — отказ" size={30} bg={DC.res.light} />
          </Appear>
        </g>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.2}>
          <g transform={`translate(${cx} 360)`}>
            <rect x={-420} y={-50} width={840} height={96} rx={24} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={34}>
              сэкономили деньги → потратили силы
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Пуски Falcon 1: 1–3 неудачи, 4 — орбита ──
const LAUNCHES = [
  { date: "март 2006", res: "падение", ok: false },
  { date: "март 2007", res: "потеряна", ok: false },
  { date: "2008", res: "срыв", ok: false },
  { date: "28.09.2008", res: "орбита", ok: true },
];
export const Launches: React.FC<VisualProps<{ upto: 3 | 4; host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const four = p.upto === 4;
  const span = Math.min(1100, A.x1 - A.x0 - 80);
  const step = span / 4;
  const when = (i: number) => (four ? (i < 3 ? 0.2 + i * 0.25 : at(ctx, 1.05)) : i === 0 ? at(ctx, 0.2) : i === 1 ? at(ctx, 1.1) : at(ctx, 1.6));
  const zoom = !four && t > at(ctx, 2) ? ramp(t, at(ctx, 2), 0.8) : 0;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <g opacity={1 - zoom * 0.8}>
        {LAUNCHES.slice(0, p.upto).map((L, i) => {
          const x = cx - span / 2 + step * (i + 0.5);
          const k = ramp(t, when(i), 0.4);
          const up = clamp01((t - when(i)) / 1.6);
          const failAt = L.ok ? 2 : 0.55 + i * 0.12;
          const fell = !L.ok && up > failAt;
          const h = L.ok ? up * 420 : Math.min(up, failAt) * 420;
          return (
            <g key={i} opacity={Math.max(0.35, k)}>
              <line x1={x} y1={760} x2={x} y2={760 - h} stroke="#fff" strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
              {!fell ? (
                <Rocket x={x} y={760 - h} s={0.26} t={t} flame={up > 0 && up < 1 ? 1 : L.ok && up >= 1 ? 0.6 : 0} />
              ) : (
                <g transform={`translate(${x} ${760 - h})`}>
                  {[0, 1, 2, 3, 4].map((j) => (
                    <circle key={j} cx={Math.cos(j * 1.3) * 40 * clamp01((up - failAt) * 4)} cy={Math.sin(j * 1.3) * 40 * clamp01((up - failAt) * 4)} r={16} fill={j % 2 ? C.flame : C.yellow} opacity={1 - clamp01((up - failAt) * 2)} />
                  ))}
                </g>
              )}
              {L.ok && up >= 1 && (
                <g>
                  <ellipse cx={x} cy={340} rx={160} ry={40} fill="none" stroke={C.yellow} strokeWidth={6} strokeDasharray="14 10" />
                </g>
              )}
              <g transform={`translate(${x} 830)`} opacity={k}>
                <rect x={-step / 2 + 14} y={-34} width={step - 28} height={68} rx={18} fill="#fff" stroke={OL} strokeWidth={4} />
                <Txt x={0} y={10} size={Math.min(28, (step - 40) / 6)}>
                  {L.date}
                </Txt>
              </g>
              {up > Math.min(1, failAt) && (
                <g transform={`translate(${x} 920)`}>
                  {L.ok ? <Check x={0} y={0} s={40} k={ramp(t, when(i) + 1.6, 0.4)} /> : <Cross x={0} y={0} s={50} k={ramp(t, when(i) + failAt * 1.6, 0.4)} />}
                </g>
              )}
            </g>
          );
        })}
      </g>
      {zoom > 0 && (
        <g opacity={zoom}>
          <Rocket x={cx - 260} y={830} s={0.95} t={t} sep={0.15 + 0.1 * Math.sin(t * 2)} fail="stage" />
          <g transform={`translate(${cx + 260} 470)`}>
            <rect x={-300} y={-120} width={600} height={240} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <text x={0} y={-30} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill={C.ink} textAnchor="middle">
              1 % тяги
            </text>
            <text x={0} y={50} fontFamily={DISPLAY} fontWeight={800} fontSize={48} fill={C.red} textAnchor="middle">
              + 1,5 секунды
            </text>
          </g>
          <Appear t={t} at={at(ctx, 2.6)}>
            <Label x={cx + 260} y={700} text="на стенде не видно" size={32} bg={C.yellow} />
          </Appear>
        </g>
      )}
      {four && t > at(ctx, 2) && (
        <Appear t={t} at={at(ctx, 2.1)}>
          <g transform={`translate(${cx} 200)`}>
            <rect x={-430} y={-50} width={860} height={96} rx={24} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={34}>
              шесть лет · пятьсот человек
            </Txt>
          </g>
        </Appear>
      )}
      {four && t > at(ctx, 1) - 0.1 && t < at(ctx, 1.1) && (
        <g>
          <Label x={cx} y={200} text="«последний шанс»" size={40} bg={DC.ppl.light} />
        </g>
      )}
    </Drift>
  );
};

// ── Кто виноват: техник и коррозия ──
export const Blame: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const spot = ramp(t, 0.3, 0.6) * (1 - ramp(t, b1 + 1.8, 0.8));
  const nut = ramp(t, b1, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {/* прожектор на одного человека */}
      <path d={`M ${cx - 240} 120 L ${cx - 390} 830 L ${cx - 90} 830 Z`} fill="#fff" opacity={0.18 * spot} />
      <Person who="welder" x={cx - 240} y={830} s={0.5} mood={spot > 0.5 ? "shock" : "think"} pose="stand" t={t} />
      <Appear t={t} at={0.6}>
        <g opacity={spot}>
          <Label x={cx - 240} y={330} text="«виноват техник»" size={32} bg={DC.ppl.light} />
        </g>
      </Appear>
      {/* гайка под лупой: коррозия */}
      {nut > 0 && (
        <g transform={`translate(${cx + 230} 470) scale(${nut})`}>
          <circle r={190} fill="#fff" stroke={OL} strokeWidth={8} />
          <path d="M 134 134 L 250 250" stroke={OL} strokeWidth={30} strokeLinecap="round" />
          <polygon points="-70,-40 0,-80 70,-40 70,40 0,80 -70,40" fill={C.metal} stroke={OL} strokeWidth={6} />
          <circle r={34} fill="#fff" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={-60 + ((i * 37) % 120)} cy={-50 + ((i * 53) % 100)} r={8} fill="#b0703a" opacity={ramp(t, b1 + 0.8 + i * 0.1, 0.3)} />
          ))}
          <path d="M 20 -76 L 6 -30 L 26 0" stroke={C.red} strokeWidth={6} fill="none" opacity={ramp(t, b1 + 1.5, 0.3)} />
          <Txt x={0} y={250} size={30} color="#fff">
            коррозия · «по всей вероятности»
          </Txt>
        </g>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.1}>
          <g transform={`translate(${cx} 200)`}>
            <rect x={-440} y={-50} width={880} height={96} rx={24} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={32}>
              стол «инженерия» → стол «доверие»
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Цена детали: поставщик против своей работы ──
export const PriceCut: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const share = ramp(t, b1, 1.2);
  const bar = ramp(t, b1 + 1.6, 0.8);
  const cut = ramp(t, at(ctx, 1.6), 1.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {/* ракета, заполняемая «своим» цветом на 80–90 % */}
      <g transform={`translate(${cx - 400} 0)`}>
        <Rocket x={0} y={820} s={1} t={t} color="#fff" />
        <rect x={-46} y={820 - 470 * share * 0.88} width={92} height={470 * share * 0.88} fill={DC.eng.color} opacity={0.55} />
        <Appear t={t} at={b1 + 0.6}>
          <Label x={0} y={210} text="80–90 % — своё" size={30} bg={DC.eng.light} />
        </Appear>
      </g>
      {/* сравнение цены детали */}
      {t > b1 + 1.4 && (
        <g transform={`translate(${cx + 180} 0)`}>
          <rect x={-200} y={760 - 420 * bar} width={150} height={420 * bar} rx={10} fill={DC.ppl.color} stroke={OL} strokeWidth={4} />
          <rect x={60} y={760 - 420 * bar * (1 - cut * 0.968)} width={150} height={420 * bar * (1 - cut * 0.968)} rx={10} fill={DC.eng.color} stroke={OL} strokeWidth={4} />
          <line x1={-260} y1={760} x2={280} y2={760} stroke={OL} strokeWidth={6} />
          <g opacity={bar}>
            <Txt x={-125} y={820} size={28} color="#fff">
              поставщик
            </Txt>
            <Txt x={135} y={820} size={28} color="#fff">
              своя работа
            </Txt>
            <Label x={-125} y={300} text="120 тыс. $" size={30} bg={DC.ppl.light} />
          </g>
          <g opacity={cut}>
            <Label x={135} y={690} text="3900 $" size={30} bg={DC.eng.light} />
          </g>
        </g>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.4}>
          <g transform={`translate(${cx + 180} 200)`}>
            <rect x={-150} y={-56} width={300} height={100} rx={28} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <text x={0} y={20} fontFamily={DISPLAY} fontSize={56} fontWeight={800} fill={C.ink} textAnchor="middle">
              «ОК»
            </text>
          </g>
        </Appear>
      )}
      {t > b3 && (
        <Appear t={t} at={b3}>
          <Person who="assistant" x={cx - 100} y={880} s={0.42} mood="happy" pose="give" t={t} item={<rect x={-50} y={-30} width={100} height={60} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />} />
          <Label x={cx - 100} y={560} text="продажи: Шотвелл" size={30} bg={C.paper} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Давление сроков ──
export const Pressure: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  // планка поднимается выше, чем «реальность» (без таймеров и часов)
  const bar = 520 - 220 * ramp(t, 0.6, 1.4) - (t > b2 ? 0 : 0);
  const team = 7;
  const leave = clamp01((t - b1 - 0.5) / 2.5);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <g transform={`translate(${cx} 520)`}>
        <rect x={-420} y={-300} width={840} height={20} rx={10} fill={C.red} opacity={0.15} />
        <line x1={-420} y1={bar - 520} x2={420} y2={bar - 520} stroke={C.yellow} strokeWidth={14} strokeLinecap="round" />
        <Txt x={0} y={bar - 550} size={34} color="#fff">
          «невозможное — к пятнице»
        </Txt>
        <line x1={-420} y1={40} x2={420} y2={40} stroke="#fff" strokeWidth={8} strokeDasharray="20 14" opacity={ramp(t, b2, 0.6)} />
        <g opacity={ramp(t, b2, 0.6)}>
          <Txt x={-300} y={86} size={30} color="#fff">
            реальность
          </Txt>
        </g>
        {/* разрыв между планкой и реальностью заполняется людьми */}
        {t > b2 + 0.8 && (
          <g opacity={ramp(t, b2 + 0.8, 0.6)}>
            <path d={`M 360 ${bar - 520} L 360 40`} stroke={DC.ppl.color} strokeWidth={10} />
            <Txt x={360} y={(bar - 520 + 40) / 2} size={30} color="#fff">
              цена — людям
            </Txt>
          </g>
        )}
      </g>
      {Array.from({ length: team }, (_, i) => {
        const gone = i % 3 === 1 ? leave : 0;
        return (
          <g key={i} opacity={1 - gone} transform={`translate(${gone * (i < 3 ? -260 : 260)} 0)`}>
            <Person who={(["engineer", "engineer2", "welder", "worker", "designer", "manager", "assistant"] as const)[i]} x={cx - 330 + i * 110} y={880} s={0.32} mood={t > b1 ? "tense" : "think"} pose="stand" t={t} seed={i} />
          </g>
        );
      })}
      {t > b1 && (
        <Appear t={t} at={b1 + 0.2}>
          <Label x={cx - 330} y={620} text="90+ часов в неделю" size={28} bg={DC.ppl.light} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Успешная ракета без рынка ──
export const NoDemand: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <Rocket x={cx - 300} y={800} s={0.75} t={t} />
      <Appear t={t} at={0.4}>
        <Label x={cx - 300} y={240} text="долетела до орбиты" size={30} bg={DC.eng.light} />
      </Appear>
      {/* очередь заказчиков почти пуста */}
      <g transform={`translate(${cx + 220} 0)`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-260 + i * 90} y={520} width={70} height={130} rx={14} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="10 8" />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={ramp(t, b1 + i * 0.3, 0.4)}>
            <Person who="partner" x={-225 + i * 90} y={660} s={0.24} mood="neutral" pose="stand" t={t} seed={i} />
          </g>
        ))}
        <Appear t={t} at={b1 + 0.6}>
          <Label x={0} y={420} text="«трех Falcon 1 в год явно недостаточно»" size={26} bg={C.paper} />
        </Appear>
        <Appear t={t} at={at(ctx, 1.7)}>
          <DateCard x={0} y={790} text="июль 2009" />
        </Appear>
      </g>
      {t > b2 && (
        <Appear t={t} at={b2 + 0.1}>
          <g transform={`translate(${cx} 190)`}>
            <rect x={-480} y={-50} width={960} height={96} rx={24} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={34}>
              система = заказчики + ритм + деньги
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Dragon у станции ──
export const Dragon: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const approach = clamp01((t - 0.3) / Math.max(1, b1 - 0.6));
  const dx = cx + 380 - approach * 260;
  const dy = 300 + (1 - approach) * 220;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {/* станция: модули и панели */}
      <g transform={`translate(${cx - 140} 320)`} opacity={t < b2 ? 1 : 0.5}>
        <rect x={-260} y={-34} width={520} height={68} rx={20} fill={C.metal} stroke={OL} strokeWidth={4} />
        {[-220, -120, 120, 220].map((x) => (
          <rect key={x} x={x - 40} y={-170} width={80} height={110} fill="#3d5aa0" stroke={OL} strokeWidth={3} />
        ))}
        {[-220, -120, 120, 220].map((x) => (
          <rect key={`b${x}`} x={x - 40} y={60} width={80} height={110} fill="#3d5aa0" stroke={OL} strokeWidth={3} />
        ))}
        {/* манипулятор */}
        <path d={`M 160 34 L 230 ${120 - approach * 40} L ${dx - (cx - 140) - 50} ${dy - 320}`} stroke={C.white} strokeWidth={16} fill="none" strokeLinejoin="round" />
        <path d={`M 160 34 L 230 ${120 - approach * 40} L ${dx - (cx - 140) - 50} ${dy - 320}`} stroke={OL} strokeWidth={4} fill="none" strokeLinejoin="round" />
      </g>
      {/* капсула */}
      <g transform={`translate(${dx} ${dy}) rotate(-90)`} opacity={t < b2 ? 1 : 0.5}>
        <path d="M -50 40 L -36 -40 L 36 -40 L 50 40 Z" fill="#fff" stroke={OL} strokeWidth={4} />
        <rect x={-50} y={40} width={100} height={60} rx={6} fill={C.metal} stroke={OL} strokeWidth={4} />
        <rect x={-150} y={56} width={90} height={30} fill="#3d5aa0" stroke={OL} strokeWidth={3} />
        <rect x={60} y={56} width={90} height={30} fill="#3d5aa0" stroke={OL} strokeWidth={3} />
      </g>
      <Appear t={t} at={0.4}>
        <DateCard x={cx + 380} y={760} text="май 2012" />
      </Appear>
      {approach >= 1 && t < b1 + 1 && <Check x={cx + 120} y={180} s={60} k={ramp(t, b1 - 0.3, 0.5)} />}
      {t > b1 && (
        <g transform={`translate(${cx} 730)`}>
          {[
            { s: "испытание", c: "#fff", dash: true },
            { s: "отдельный успех", c: DC.eng.light, dash: false },
            { s: "система", c: C.yellow, dash: false },
          ].map((q, i) => (
            <g key={q.s} opacity={ramp(t, (i === 0 ? b1 : i === 1 ? b1 + 0.4 : b3) + 0.1, 0.4)} transform={`translate(${-380 + i * 380} 0)`}>
              <rect x={-170} y={-50} width={340} height={100} rx={24} fill={q.c} stroke={OL} strokeWidth={4} strokeDasharray={q.dash ? "14 10" : undefined} />
              <Txt x={0} y={12} size={32}>
                {q.s}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {t > b2 && t < b3 && (
        <g opacity={ramp(t, b2, 0.5)}>
          <Rocket x={cx - 140} y={620} s={0.5} t={t} legs={0.6 + 0.4 * Math.sin(t)} rot={8 * Math.sin(t * 1.6)} />
          <rect x={cx - 280} y={630} width={280} height={30} rx={8} fill={C.metalDark} stroke={OL} strokeWidth={4} />
          <Label x={cx + 260} y={470} text="посадка ступени: жёсткая" size={30} bg={DC.ppl.light} />
        </g>
      )}
    </Drift>
  );
};

// ── 2008: одна компания или обе ──
export const Choice: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const split = ramp(t, b1, 1.2);
  const pile = dotsOf("choice-coins", SH.circle(120), cx, 300, [DC.res.color, DC.res.deep, "#ffd27a"], 15, 140);
  const left = dotsOf("choice-l", SH.circle(85), cx - 330, 520, [DC.res.color, DC.res.deep, "#ffd27a"], 15, 100);
  const right = dotsOf("choice-r", SH.circle(85), cx + 330, 520, [DC.res.color, DC.res.deep, "#ffd27a"], 15, 100);
  const both = [...left.slice(0, Math.ceil(pile.length / 2)), ...right.slice(0, Math.floor(pile.length / 2))];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      {split <= 0 ? <Swarm pts={pile} k={clamp01(t / 1.5)} t={t} r={6.5} spread={500} /> : <Morph a={pile} b={both} k={split} t={t} r={6.5} />}
      <g transform={`translate(${cx - 330} 760)`}>
        <Rocket x={0} y={110} s={0.32} t={t} />
        <Txt x={0} y={150} size={30} color="#fff">
          ракеты
        </Txt>
      </g>
      <g transform={`translate(${cx + 330} 820)`}>
        <rect x={-120} y={-60} width={240} height={90} rx={30} fill={DC.eng.color} stroke={OL} strokeWidth={4} />
        <circle cx={-70} cy={30} r={24} fill="#2a2e44" />
        <circle cx={70} cy={30} r={24} fill="#2a2e44" />
        <Txt x={0} y={100} size={30} color="#fff">
          машины
        </Txt>
      </g>
      <Appear t={t} at={0.6}>
        <Label x={cx} y={150} text="одна или обе?" size={40} bg={C.paper} />
      </Appear>
      {t > b1 + 1.2 && (
        <Appear t={t} at={b1 + 1.2}>
          <Label x={cx} y={700} text="раунд закрыт накануне Рождества" size={30} bg={C.yellow} />
        </Appear>
      )}
      {t > at(ctx, 1.7) && (
        <Appear t={t} at={at(ctx, 1.7)}>
          <Label x={cx} y={940} text="переговоры — со слов Маска" size={26} bg={C.paper} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Контракт и цена для людей ──
export const Rescue: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const card = pop(t, 0.3);
  const people = ramp(t, b1, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.03}>
      <g transform={`translate(${cx} ${300 - people * 60}) scale(${card * (1 - people * 0.25)})`}>
        <rect x={-400} y={-120} width={800} height={240} rx={26} fill="#fff" stroke={OL} strokeWidth={5} />
        <rect x={-400} y={-120} width={800} height={50} rx={24} fill="#3d5aa0" />
        <text x={-360} y={-84} fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">
          23 декабря 2008 · контракт НАСА
        </text>
        <text x={0} y={30} fontFamily={DISPLAY} fontWeight={800} fontSize={74} fill={C.ink} textAnchor="middle">
          1,6 млрд $
        </text>
        <text x={0} y={92} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.inkSoft} textAnchor="middle">
          12 полётов к станции
        </text>
      </g>
      {people > 0 && (
        <g opacity={people}>
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <Person who={(["engineer", "welder", "engineer2", "worker", "assistant", "designer", "manager", "partner"] as const)[i]} x={cx - 420 + i * 120} y={820} s={0.32} mood={i % 3 ? "tense" : "think"} pose={i === 3 ? "give" : "stand"} t={t} seed={i} />
            </g>
          ))}
          <Appear t={t} at={b1 + 0.6}>
            <Label x={cx - 260} y={560} text="две смены без выходных" size={28} bg={DC.ppl.light} />
          </Appear>
          <Appear t={t} at={at(ctx, 1.55)}>
            <Label x={cx + 260} y={560} text="чеки на 25 или 50 тыс. $" size={28} bg={DC.res.light} />
          </Appear>
        </g>
      )}
      {t > b2 && (
        <Appear t={t} at={b2 + 0.1}>
          <g transform={`translate(${cx} 160)`}>
            <rect x={-420} y={-46} width={840} height={88} rx={22} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={32}>
              счёт оплатили не только владельцы
            </Txt>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

