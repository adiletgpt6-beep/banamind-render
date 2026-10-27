// Сцены модели фильма BM-029: холодный старт, три рабочих стола, точечная сборка
// предмета, выводы, открытые прогнозы и финал. Всё зависит только от времени сцены.
import React from "react";
import { C, DC, DESKS, DISPLAY, FONT, type DeskId } from "../theme";
import { Car, DeskGlass, Factory, Rocket } from "./objects";
import { dotsOf, Morph, SH, Swarm } from "./dots";
import { Appear, area, Arrow, at, clamp01, Drift, ramp, Txt, type VisualProps } from "./kit";
import { Label, OL, Person } from "./people";

const ENG = [DC.eng.color, DC.eng.deep, "#7fe3dc"];
const RES = [DC.res.color, DC.res.deep, "#ffd27a"];
const PPL = [DC.ppl.color, DC.ppl.deep, "#ffb0a8"];

// ── Счёт-квитанция: три строки цены (без сумм — качественная модель) ──
const Bill: React.FC<{ x: number; y: number; k: number; rows: number; t: number }> = ({ x, y, k, rows, t }) => {
  if (k <= 0) return null;
  const h = 330;
  return (
    <g transform={`translate(${x} ${y + (1 - k) * 80}) rotate(${-4 + Math.sin(t * 0.8) * 1})`} opacity={k}>
      <rect x={-210} y={-h / 2 + 8} width={420} height={h} rx={14} fill="#000" opacity={0.15} />
      <path d={`M -210 ${-h / 2} L 210 ${-h / 2} L 210 ${h / 2} ${Array.from({ length: 11 }, (_, i) => `L ${210 - (i + 0.5) * 38.2} ${h / 2 + (i % 2 ? 0 : 14)}`).join(" ")} L -210 ${h / 2} Z`} fill={C.paper} stroke={OL} strokeWidth={4} />
      <Txt x={0} y={-h / 2 + 52} size={36} color={C.ink}>
        СЧЁТ
      </Txt>
      <line x1={-180} y1={-h / 2 + 74} x2={180} y2={-h / 2 + 74} stroke={C.inkSoft} strokeWidth={3} strokeDasharray="10 8" />
      {DESKS.map((d, i) => {
        const kk = clamp01(rows - i);
        if (kk <= 0) return null;
        return (
          <g key={d.id} transform={`translate(${-180 + (1 - kk) * -30} ${-h / 2 + 128 + i * 66})`} opacity={kk}>
            <rect x={0} y={-26} width={34} height={34} rx={8} fill={d.color} stroke={OL} strokeWidth={3} />
            <text x={50} y={0} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink}>
              {["инженерный риск", "деньги и время", "доверие людей"][i]}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Hook: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  // 1) пустые контуры: завода, команды и машины ещё нет
  const ghostK = ramp(t, 0.2, 0.8) * (1 - ramp(t, b1 + 0.2, 0.8));
  // 2) чертёж и сборка ракеты из точек
  const gridK = ramp(t, b1 - 0.2, 0.9);
  const rocket = dotsOf("hook-rocket", SH.rocket(300), cx - 180, 470, ENG, 15, 330);
  const buildK = clamp01((t - b1) / 3.2);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.04}>
      {/* миллиметровка чертежа */}
      <g opacity={gridK * 0.55}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`v${i}`} x1={cx - 560 + i * 80} y1={130} x2={cx - 560 + i * 80} y2={130 + 700 * ramp(t, b1 - 0.2 + i * 0.05, 0.6)} stroke="#fff" strokeWidth={2} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1={cx - 560} y1={150 + i * 80} x2={cx - 560 + 1040 * ramp(t, b1 + i * 0.05, 0.6)} y2={150 + i * 80} stroke="#fff" strokeWidth={2} />
        ))}
      </g>
      {ghostK > 0 && (
        <g opacity={ghostK}>
          <g transform={`translate(${cx - 380} 560) scale(0.62)`} strokeDasharray="16 12">
            <Factory x={0} y={0} w={520} k={1} t={0} color="none" />
          </g>
          <Label x={cx - 380} y={640} text="завода нет" size={28} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx - 70 + i * 70} cy={470} r={34} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="10 8" />
          ))}
          <Label x={cx} y={640} text="команды нет" size={28} />
          <Car x={cx + 380} y={520} s={0.5} ghost t={t} />
          <Label x={cx + 380} y={640} text="машины нет" size={28} />
        </g>
      )}
      {t > b1 - 0.3 && <Swarm pts={rocket} k={buildK} t={t} r={6.5} spread={700} seed={3} />}
      {t > b1 + 2.4 && (
        <Appear t={t} at={b1 + 2.4}>
          <Label x={cx - 180} y={860} text="испытания" size={30} bg={DC.eng.light} />
        </Appear>
      )}
      <Bill x={cx + 260} y={470} k={ramp(t, b1 + 1.6, 0.8)} rows={clamp01((t - b2) / 0.6) * 3 + (t > b2 ? 0 : clamp01((t - b1 - 2.2) / 0.6))} t={t} />
    </Drift>
  );
};

// ── Три рабочих стола: intro / model / ask / crisis ──
export const Desks: React.FC<VisualProps<{ mode: "intro" | "model" | "ask" | "crisis"; focus?: DeskId; host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const mode = p.mode;
  const A = area(p.host);
  const ask = mode === "ask";
  // в «вопросе» банан стоит по центру — столы по краям, выше титров
  // в «вопросе» выделенный стол крупно слева, два других — справа, выше титров
  const others = DESKS.map((d) => d.id).filter((id) => id !== (p.focus ?? "eng"));
  const askPos = (id: DeskId) => (id === (p.focus ?? "eng") ? { x: 380, y: 640 } : { x: 1560, y: others.indexOf(id) === 0 ? 400 : 760 });
  const pos: Record<DeskId, { x: number; y: number }> = ask
    ? { eng: askPos("eng"), res: askPos("res"), ppl: askPos("ppl") }
    : {
        eng: { x: A.cx - (A.x1 - A.x0) * 0.32, y: 600 },
        res: { x: A.cx, y: 600 },
        ppl: { x: A.cx + (A.x1 - A.x0) * 0.32, y: 600 },
      };
  const wOf = (id: DeskId) => (ask ? (id === (p.focus ?? "eng") ? 460 : 300) : Math.min(440, (A.x1 - A.x0) * 0.3));
  const hOf = (id: DeskId) => (ask ? (id === (p.focus ?? "eng") ? 260 : 170) : 250);
  const crisis = mode === "crisis";
  const levelOf = (i: number) => {
    if (crisis) {
      const b = at(ctx, Math.min(i, 1) + 0.3);
      return 0.35 + 0.6 * ramp(t, b, 1.6);
    }
    if (mode === "model") return 0.25 + 0.45 * clamp01(Math.sin(t * 0.6 + i * 1.7) * 0.5 + 0.5) * ramp(t, at(ctx, Math.min(i, 2)), 1);
    return undefined;
  };
  const focusOf = (id: DeskId, i: number) => {
    if (p.focus) return p.focus === id;
    if (mode === "model") {
      const b = at(ctx, i === 0 ? 1 : i === 1 ? 1.5 : 2);
      const e = at(ctx, i === 0 ? 1.5 : i === 1 ? 2 : 2.99);
      return t >= b && t < e + 0.4;
    }
    if (mode === "intro") return t >= at(ctx, 0) + 0.6 + i * 1.1 && t < at(ctx, 1);
    return false;
  };
  // «решение» — жёлтая фишка, которую банан кладёт на каждый стол по очереди
  const chipT = mode === "model" ? clamp01((t - at(ctx, 2.4)) / Math.max(1, ctx.ends[2] - at(ctx, 2.4))) : -1;
  const chipIdx = Math.min(2, Math.floor(chipT * 3));
  const chipK = (chipT * 3) % 1;
  return (
    <Drift t={t} dur={dur} cx={A.cx} cy={480} amount={0.03}>
      {crisis && (
        <g opacity={0.5 * ramp(t, at(ctx, 0), 1)}>
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M ${A.x0 + i * ((A.x1 - A.x0) / 5)} 120 q 40 60 -10 120 q -40 50 10 110`} stroke={C.red} strokeWidth={5} fill="none" opacity={0.25 + 0.25 * Math.sin(t * 3 + i)} />
          ))}
        </g>
      )}
      {DESKS.map((d, i) => {
        const k = ramp(t, (ask ? 0.1 : mode === "intro" ? at(ctx, 0) + 0.3 + i * 1.1 : 0.15 + i * 0.25), 0.7);
        return <DeskGlass key={d.id} id={d.id} x={pos[d.id].x} y={pos[d.id].y} w={wOf(d.id)} h={hOf(d.id)} k={k} focus={focusOf(d.id, i)} dim={!!p.focus && p.focus !== d.id} level={levelOf(i)} t={t} />;
      })}
      {/* предметы на столах */}
      {DESKS.map((d, i) => {
        const k = ramp(t, (ask ? 0.4 : mode === "intro" ? at(ctx, 0) + 0.6 + i * 1.1 : 0.5 + i * 0.25), 0.6);
        const { x, y } = pos[d.id];
        const top = y - hOf(d.id);
        const s = ask ? (p.focus === d.id ? 1.05 : 0.65) : 0.95;
        return (
          <g key={d.id} opacity={k * (p.focus && p.focus !== d.id ? 0.45 : 1)} transform={`translate(${x} ${top + 125 * s}) scale(${s})`}>
            {d.id === "eng" && (
              <g>
                <Rocket x={-60} y={70} s={0.24} t={t} />
                <g transform="translate(60 10)" fill="none" stroke={DC.eng.deep} strokeWidth={8}>
                  <circle r={40} />
                  <path d="M 0 -40 L 0 40 M -40 0 L 40 0" />
                </g>
              </g>
            )}
            {d.id === "res" && (
              <g>
                {[0, 1, 2].map((j) => (
                  <g key={j} transform={`translate(${-80 + j * 80} ${40 - j * 16})`}>
                    {Array.from({ length: 2 + j }, (_, q) => (
                      <ellipse key={q} cx={0} cy={-q * 16} rx={34} ry={11} fill={DC.res.color} stroke={OL} strokeWidth={3} />
                    ))}
                  </g>
                ))}
                <path d="M 90 -40 L 110 -40 L 100 -20 Z M 100 -20 L 90 0 L 110 0 Z" fill={DC.res.deep} stroke={OL} strokeWidth={3} transform="translate(-10 20) scale(1.3)" />
              </g>
            )}
            {d.id === "ppl" && (
              <g>
                {[-70, 0, 70].map((dx, j) => (
                  <g key={j} transform={`translate(${dx} ${j === 1 ? -6 : 6})`}>
                    <circle cx={0} cy={-30} r={22} fill={j === 1 ? DC.ppl.color : DC.ppl.light} stroke={OL} strokeWidth={3} />
                    <path d="M -32 36 Q -32 -6 0 -6 Q 32 -6 32 36 Z" fill={j === 1 ? DC.ppl.color : DC.ppl.light} stroke={OL} strokeWidth={3} />
                  </g>
                ))}
              </g>
            )}
          </g>
        );
      })}
      {mode === "model" && chipT >= 0 && chipT <= 1 && (
        <g>
          {(() => {
            const from = chipIdx === 0 ? { x: A.x0 + 20, y: 260 } : pos[DESKS[chipIdx - 1].id];
            const to = pos[DESKS[chipIdx].id];
            const e = clamp01(chipK * 1.6);
            const xx = from.x + (to.x - from.x) * e;
            const yy = (chipIdx === 0 ? from.y : from.y - 300) + (to.y - 300 - (chipIdx === 0 ? from.y : from.y - 300)) * e - Math.sin(e * Math.PI) * 120;
            return (
              <g transform={`translate(${xx} ${yy})`}>
                <circle r={40} fill={C.yellow} stroke={OL} strokeWidth={5} />
                <Txt x={0} y={12} size={30}>
                  !
                </Txt>
              </g>
            );
          })()}
          <Appear t={t} at={at(ctx, 2.4)}>
            <Label x={A.cx} y={200} text="одно решение — три проверки" size={34} bg={C.yellow} />
          </Appear>
        </g>
      )}
      {mode === "intro" && (
        <Appear t={t} at={at(ctx, 1.2)}>
          <g transform={`translate(${A.cx} 190)`}>
            <rect x={-330} y={-52} width={660} height={92} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={42} color={C.ink}>
              книга: до начала 2015 года
            </Txt>
          </g>
          {t > at(ctx, 2.2) && (
            <g transform={`translate(${A.cx + 390} 290) rotate(-8)`} opacity={ramp(t, at(ctx, 2.2), 0.5)}>
              <rect x={-170} y={-36} width={340} height={64} rx={14} fill={C.paper} stroke={C.red} strokeWidth={6} />
              <Txt x={0} y={10} size={32} color={C.red}>
                не новости
              </Txt>
            </g>
          )}
        </Appear>
      )}
      {crisis && (
        <Appear t={t} at={at(ctx, 0.2)}>
          <g transform={`translate(${A.cx} 190)`}>
            <rect x={-150} y={-58} width={300} height={100} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
            <text x={0} y={22} fontFamily={DISPLAY} fontWeight={800} fontSize={64} fill={C.red} textAnchor="middle">
              2008
            </text>
          </g>
        </Appear>
      )}
    </Drift>
  );
};

// ── Точечная сборка предмета (ракета/машина) с подписью стола ──
export const Assemble: React.FC<VisualProps<{ shape: "rocket" | "car"; desk: DeskId; host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const rocket = dotsOf("as-rocket", SH.rocket(320), cx, 470, ENG, 15, 340);
  const car = dotsOf("as-car", SH.car(360), cx, 520, ENG, 15, 380);
  const people = dotsOf(
    "as-people",
    SH.union(SH.move(SH.person(150), -260, 0), SH.move(SH.person(170), 0, -20), SH.move(SH.person(150), 260, 0)),
    cx,
    500,
    PPL,
    15,
    420,
  );
  const coins = dotsOf("as-coin", SH.union(SH.move(SH.circle(120), -150, 0), SH.move(SH.circle(120), 150, 0)), cx, 500, RES, 15, 320);
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const b3 = at(ctx, 3);
  const k1 = clamp01(t / 2.4);
  const m1 = clamp01((t - b1 - 0.2) / 2);
  const m2 = clamp01((t - b2 - 0.2) / 2);
  const m3 = clamp01((t - b3 - 0.2) / 2);
  // цель → система? → кто платит? → деньги (суммы из книги в реплике)
  let view: React.ReactNode;
  if (t < b1) view = <Swarm pts={rocket} k={k1} t={t} r={6.5} spread={800} seed={7} />;
  else if (t < b2) view = <Morph a={rocket} b={car} k={m1} t={t} r={6.5} />;
  else if (t < b3) view = <Morph a={car} b={people} k={m2} t={t} r={6.5} />;
  else view = <Morph a={people} b={coins} k={m3} t={t} r={6.5} />;
  const label = t < b1 ? "цель" : t < b2 ? "система?" : t < b3 ? "кто платит?" : "100 · 70 · 30 млн $";
  const col = t < b1 ? DC.eng.light : t < b2 ? C.paper : t < b3 ? DC.ppl.light : DC.res.light;
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480} amount={0.035}>
      {view}
      <Label x={cx} y={150} text={label} size={40} bg={col} />
    </Drift>
  );
};

// ── Вывод N: крупная карточка + маленькая модель ──
const CONCL = [
  { title: "Проверяйте ограничение", sub: "Какова физика процесса?", desk: "eng" as DeskId },
  { title: "Видьте команду", sub: "система держится на многих", desk: "ppl" as DeskId },
  { title: "Считайте полную цену", sub: "все три стола сразу", desk: "res" as DeskId },
];
export const Conclusion: React.FC<VisualProps<{ n: 1 | 2 | 3; host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const c = CONCL[p.n - 1];
  const d = DC[c.desk];
  const k = ramp(t, 0.2, 0.7);
  return (
    <Drift t={t} dur={dur} cx={A.cx} cy={460} amount={0.03}>
      {/* три номера, текущий выделен */}
      {[1, 2, 3].map((n) => (
        <g key={n} transform={`translate(${A.cx + (n - 2) * 140} 170)`} opacity={n <= p.n ? 1 : 0.35}>
          <circle r={50} fill={n === p.n ? d.color : "#fff"} stroke={OL} strokeWidth={5} />
          <text x={0} y={18} fontFamily={DISPLAY} fontWeight={800} fontSize={52} textAnchor="middle" fill={C.ink}>
            {n}
          </text>
        </g>
      ))}
      <g transform={`translate(${A.cx} ${470 + (1 - k) * 60})`} opacity={k}>
        <rect x={-500} y={-150} width={1000} height={300} rx={40} fill={C.paper} stroke={OL} strokeWidth={5} />
        <rect x={-500} y={-150} width={28} height={300} rx={14} fill={d.color} />
        <text x={0} y={-20} fontFamily={DISPLAY} fontWeight={800} fontSize={66} textAnchor="middle" fill={C.ink}>
          {c.title}
        </text>
        <text x={0} y={70} fontFamily={FONT} fontWeight={800} fontSize={44} textAnchor="middle" fill={d.deep} opacity={ramp(t, at(ctx, 1), 0.6)}>
          {c.sub}
        </text>
      </g>
      {p.n === 1 && (
        <g opacity={ramp(t, at(ctx, 1.3), 0.6)}>
          <Rocket x={A.cx - 380} y={860} s={0.33} t={t} />
          <g transform={`translate(${A.cx} 790)`}>
            <rect x={-60} y={-40} width={120} height={70} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={8} size={26}>
              деталь
            </Txt>
          </g>
          <Car x={A.cx + 380} y={830} s={0.3} t={t} battery={1} />
        </g>
      )}
      {p.n === 2 && (
        <g opacity={ramp(t, at(ctx, 0.4), 0.6)}>
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} opacity={ramp(t, at(ctx, 0.2 + i * 0.07), 0.4)}>
              <Person who={(["brother", "engineer", "welder", "engineer2", "designer", "worker", "manager", "assistant", "partner"] as const)[i]} x={A.cx - 520 + i * 130} y={820} s={0.3} mood="smile" t={t} seed={i} />
            </g>
          ))}
        </g>
      )}
      {p.n === 3 && (
        <g>
          {DESKS.map((dd, i) => (
            <DeskGlass key={dd.id} id={dd.id} x={A.cx + (i - 1) * 330} y={880} w={280} h={120} k={ramp(t, at(ctx, 0.3 + i * 0.2), 0.5)} label={false} level={i === 1 ? 0.5 : 0.3 + ramp(t, at(ctx, 1), 1.4) * (i === 2 ? 0.62 : 0.1)} t={t} />
          ))}
        </g>
      )}
    </Drift>
  );
};

// ── Открытые прогнозы книги ──
export const Forecasts: React.FC<VisualProps> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const items = ["посадка ступени", "доступный электромобиль", "частые запуски", "Марс"];
  return (
    <Drift t={t} dur={dur} cx={A.cx} cy={480} amount={0.03}>
      <g transform={`translate(${A.cx} 170)`}>
        <rect x={-300} y={-50} width={600} height={88} rx={22} fill={C.paper} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={12} size={38}>
          план на начало 2015 года
        </Txt>
      </g>
      {items.map((it, i) => {
        const k = ramp(t, at(ctx, 0.15 + i * 0.18), 0.5);
        const y = 320 + i * 125;
        return (
          <g key={it} transform={`translate(${A.cx - 330 + (1 - k) * -40} ${y})`} opacity={k}>
            <rect x={0} y={-46} width={660} height={92} rx={24} fill="#fff" fillOpacity={0.9} stroke={OL} strokeWidth={4} strokeDasharray="14 10" />
            <text x={40} y={14} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
              {it}
            </text>
            <g transform="translate(600 0)" opacity={ramp(t, at(ctx, 1.1 + i * 0.1), 0.5)}>
              <circle r={34} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={40}>
                ?
              </Txt>
            </g>
          </g>
        );
      })}
    </Drift>
  );
};

// ── Финал: три стола собираются в устойчивую конструкцию, логотип ──
export const Finale: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b2 = at(ctx, 2);
  const pts = dotsOf("fin-rocket", SH.rocket(230), A.cx, 380, [...ENG, ...RES, ...PPL], 13, 260, "rows");
  const k = clamp01(t / 3);
  const logo = ramp(t, b2, 0.8);
  return (
    <Drift t={t} dur={dur} cx={A.cx} cy={400} amount={0.02}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${A.cx + (i - 1) * 380} 760)`} opacity={ramp(t, 0.3 + i * 0.3, 0.6) * (1 - logo * 0.6)}>
          <DeskGlass id={DESKS[i].id} x={0} y={0} w={300} h={130} label={false} t={t} />
        </g>
      ))}
      <g opacity={1 - logo * 0.6}>
        <Swarm pts={pts} k={k} t={t} r={5.5} spread={600} seed={11} />
        {[0, 1, 2].map((i) => (
          <Arrow key={i} x1={A.cx + (i - 1) * 380} y1={620} x2={A.cx + (i - 1) * 50} y2={600} k={ramp(t, 1.4 + i * 0.25, 0.8)} color="#fff" w={7} bend={i === 1 ? 0 : (i - 1) * -0.15} />
        ))}
      </g>
      {logo > 0 && (
        <g opacity={logo} transform={`translate(${A.cx} ${380 + (1 - logo) * 30})`}>
          <rect x={-330} y={-70} width={660} height={140} rx={34} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <text x={0} y={26} fontFamily={DISPLAY} fontWeight={800} fontSize={78} fill={C.ink} textAnchor="middle">
            BanaMind
          </text>
          <text x={0} y={130} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
            Большие идеи. Простыми словами.
          </text>
        </g>
      )}
    </Drift>
  );
};

