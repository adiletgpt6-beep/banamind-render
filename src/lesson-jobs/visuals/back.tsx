// «Возвращение»: тонущий корабль, шаги возвращения, четыре клетки, «Думай иначе»,
// студия Айва, компьютер с ручкой, команда и поставки.
import React from "react";
import { C } from "../theme";
import { BeigeBox, ButtonGrid, ColorPod, Coin, Cube, Note, OL, Person, Stage } from "./draw";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── v01: тонущий корабль и спасательная система ──
export const SinkingShip: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sink = ramp(t, 0.2, 2.5);
  const os = ramp(t, at(c, 1), 1);
  const back = ramp(t, at(c, 2), 0.8);
  const tilt = 8 * sink;
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={560} width={1160} height={300} rx={30} fill={C.skyDeep} opacity={0.45} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M 80 ${600 + i * 60} q 70 ${-16 + Math.sin(t + i) * 6} 140 0 t 140 0 t 140 0 t 140 0 t 140 0 t 140 0 t 140 0 t 140 0`} stroke={C.white} strokeWidth={4} fill="none" opacity={0.5} />
      ))}
      <g transform={`translate(420 ${560 + sink * 70}) rotate(${tilt})`}>
        <path d="M -260 -20 L 260 -20 L 200 90 L -200 90 Z" fill={C.wood} stroke={OL} strokeWidth={5} />
        <rect x={-30} y={-280} width={14} height={260} fill={OL} />
        <path d="M -16 -270 L 160 -120 L -16 -120 Z" fill={C.white} stroke={OL} strokeWidth={4} />
        <circle cx={120} cy={40} r={18} fill={C.screen} />
      </g>
      <Pop t={t} at={0.5} x={420} y={180}>
        <Tag x={0} y={0} text="доля рынка 16 % → 4 %" color={C.coral} size={32} textColor={C.white} />
      </Pop>
      {os > 0 && (
        <g opacity={os} transform="translate(950 330)">
          <Cube x={0} y={40} s={0.7} />
          <Txt x={0} y={-130} size={30} weight={900}>
            {"готовая система"}
          </Txt>
          <Txt x={0} y={200} size={28} color={C.inkSoft}>
            {"> 400 млн $"}
          </Txt>
          <Arrow x1={-120} y1={110} x2={-330} y2={250} k={os} color={C.green} bend={0.2} />
        </g>
      )}
      {back > 0 && (
        <g opacity={back}>
          <Person x={1160} y={540} s={0.42} color={C.ink} name="советник" t={t} />
        </g>
      )}
    </Stage>
  );
};

// ── v02: ступени возвращения ──
export const ReturnSteps: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const odds = ramp(t, 0.3, 1.2);
  const steps = ramp(t, at(c, 1), 1.6);
  const dollar = pop(t, at(c, 2) + 0.2);
  const list = ["советник без зарплаты", "временный глава", "руководитель"];
  return (
    <Stage host={c.p.host}>
      <g opacity={odds} transform="translate(300 300)">
        <Panel x={-230} y={-150} w={460} h={300} fill={C.white} />
        <Txt x={0} y={-90} size={28} weight={900}>
          {"шансы спасти Apple"}
        </Txt>
        <rect x={-180} y={-40} width={360} height={30} rx={15} fill={C.concrete} />
        <rect x={-180} y={-40} width={360 * 0.1 * odds} height={30} rx={15} fill={C.red} />
        <rect x={-180} y={30} width={360} height={30} rx={15} fill={C.concrete} />
        <rect x={-180} y={30} width={360 * 0.6 * odds} height={30} rx={15} fill={C.green} />
        <Txt x={0} y={110} size={24} color={C.inkSoft}>
          {"по прикидке Вуларда: без и с Джобсом"}
        </Txt>
      </g>
      {list.map((w, i) => {
        const k = clamp01(steps * 3 - i);
        return (
          <g key={w} opacity={k}>
            <rect x={620 + i * 180} y={760 - i * 150} width={420 - i * 60} height={70} rx={14} fill={[C.concrete, C.sky, C.green][i]} stroke={OL} strokeWidth={3} />
            <Txt x={620 + i * 180 + (420 - i * 60) / 2} y={760 - i * 150 + 46} size={28} weight={900}>
              {w}
            </Txt>
          </g>
        );
      })}
      {dollar > 0 && (
        <g transform={`translate(300 720) scale(${dollar})`} opacity={clamp01(dollar)}>
          <Coin x={0} y={0} r={90} label="1$" />
          <Txt x={0} y={140} size={28} color={C.inkSoft}>
            {"зарплата в год"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── v03: дюжина моделей → четыре клетки ──
export const Grid2x2: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const many = ramp(t, 0.2, 1);
  const grid = ramp(t, at(c, 1), 1.4);
  const cut = ramp(t, at(c, 2), 1.2);
  const cost = ramp(t, at(c, 3), 0.8);
  const cell = ["дом · стол", "профи · стол", "дом · с собой", "профи · с собой"];
  return (
    <Stage host={c.p.host}>
      <g opacity={many * (1 - grid)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`translate(${200 + (i % 4) * 280} ${260 + Math.floor(i / 4) * 200}) rotate(${wob(t, i, 3)})`}>
            <BeigeBox x={0} y={60} s={0.35} t={t} on={0} />
            <Txt x={0} y={95} size={22} color={C.inkSoft}>
              {`модель ${1400 + i * 700}`}
            </Txt>
          </g>
        ))}
        <Tag x={640} y={170} text="какую посоветовать другу?" color={C.yellow} size={32} />
      </g>
      {grid > 0 && (
        <g opacity={grid} transform="translate(640 470)">
          <rect x={-420} y={-300} width={840} height={600} rx={20} fill={C.white} stroke={OL} strokeWidth={5} />
          <line x1={0} y1={-300} x2={0} y2={-300 + 600 * grid} stroke={OL} strokeWidth={6} />
          <line x1={-420} y1={0} x2={-420 + 840 * grid} y2={0} stroke={OL} strokeWidth={6} />
          {cell.map((w, i) => {
            const k = clamp01(grid * 4 - i - 0.2);
            const x = i % 2 ? 210 : -210;
            const y = i < 2 ? -150 : 150;
            return (
              <g key={w} opacity={k} transform={`translate(${x} ${y})`}>
                <circle r={70} fill={[C.teal, C.steel, C.coral, C.violet][i]} opacity={0.85} />
                <Txt x={0} y={115} size={28} weight={900}>
                  {w}
                </Txt>
              </g>
            );
          })}
          <Txt x={0} y={-330} size={30} weight={900} color={C.inkSoft}>
            {"четыре продукта вместо десятков"}
          </Txt>
        </g>
      )}
      {cut > 0 && (
        <g opacity={cut * (1 - cost)}>
          <Tag x={190} y={830} text="−70 % моделей" color={C.red} size={30} textColor={C.white} />
          <g transform="translate(1110 820)">
            <rect x={-80} y={-50} width={160} height={90} rx={10} fill={C.concrete} stroke={OL} strokeWidth={3} />
            <Cross x={0} y={-5} s={70} k={cut} />
          </g>
        </g>
      )}
      {cost > 0 && (
        <g opacity={cost}>
          {Array.from({ length: 14 }).map((_, i) => (
            <circle key={i} cx={360 + i * 40} cy={800} r={13} fill={C.steel} opacity={0.6} />
          ))}
          <Txt x={640} y={850} size={28} color={C.red} weight={900}>
            {"цена: тысячи уволенных"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── v04: «Думай иначе» — галерея условных портретов ──
export const ThinkDifferent: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const gal = ramp(t, 0.3, 2);
  const team = ramp(t, at(c, 1), 0.8);
  const inward = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      {Array.from({ length: 8 }).map((_, i) => {
        const k = clamp01(gal * 8 - i);
        const x = 160 + (i % 4) * 320;
        const y = 290 + Math.floor(i / 4) * 260;
        return (
          <g key={i} opacity={k} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * k})`}>
            <rect x={-120} y={-120} width={240} height={240} rx={8} fill="#f2f2f2" stroke={OL} strokeWidth={4} />
            <circle cx={0} cy={-20} r={44} fill="#9a9a9a" />
            <path d="M -70 110 Q -70 30 0 30 Q 70 30 70 110 Z" fill="#7a7a7a" />
          </g>
        );
      })}
      <Txt x={640} y={170} size={44} weight={900} color={C.ink} opacity={gal}>
        {"Думай иначе"}
      </Txt>
      {team > 0 && (
        <g opacity={team}>
          <Note x={1010} y={790} text={"Клоу · Сиголл · Танимото\n+ Джобс"} k={team} color={C.white} size={26} />
        </g>
      )}
      {inward > 0 && (
        <g opacity={inward}>
          <Note x={300} y={790} text={"и для своих:\nради чего мы работаем"} k={inward} color={C.yellow} size={26} rot={-2} />
        </g>
      )}
    </Stage>
  );
};

// ── v05: студия дизайна ──
export const DesignStudio: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ive = ramp(t, 0.3, 0.8);
  const flow = ramp(t, at(c, 1), 1.4);
  const shadow = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={30} fill={C.white} opacity={0.9} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={140 + i * 360} y={620} width={300} height={24} rx={8} fill={C.steel} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${290 + i * 360} ${560 + wob(t, i, 3)})`}>
          <rect x={-60} y={-60} width={120} height={60} rx={26} fill={[C.concrete, C.teal, C.coral][i]} opacity={0.8} stroke={OL} strokeWidth={3} />
        </g>
      ))}
      <g opacity={ive}>
        <Person x={250} y={840} s={0.44} color={C.steelDark} name="Айв" t={t} gesture="hold" />
      </g>
      {flow > 0 && (
        <g opacity={flow} transform="translate(780 330)">
          <rect x={-260} y={-120} width={180} height={110} rx={14} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <Txt x={-170} y={-55} size={28} weight={900}>
            {"дизайн"}
          </Txt>
          <Arrow x1={-70} y1={-65} x2={60} y2={-65} k={flow} color={C.ink} />
          <rect x={80} y={-120} width={200} height={110} rx={14} fill={C.concrete} stroke={OL} strokeWidth={3} />
          <Txt x={180} y={-55} size={28} weight={900}>
            {"инженерия"}
          </Txt>
          <Txt x={10} y={50} size={26} color={C.inkSoft}>
            {"теперь направление задаёт дизайн"}
          </Txt>
        </g>
      )}
      {shadow > 0 && (
        <g opacity={shadow}>
          <Note x={760} y={510} text={"«это была моя идея»"} k={shadow} color="#ffe7e3" size={26} rot={-3} />
        </g>
      )}
    </Stage>
  );
};

// ── v06: бежевый ящик → цветной полупрозрачный компьютер с ручкой ──
export const ImacReveal: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const show = ramp(t, at(c, 0.3), 1.2);
  const handle = ramp(t, at(c, 1), 0.8);
  const colors = ramp(t, at(c, 2), 1.4);
  const cols = [C.teal, C.coral, C.yellowDeep, C.violet, C.green];
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - show * 0.7} transform={`translate(${-show * 120} 0)`}>
        <BeigeBox x={320} y={620} s={0.85} t={t} on={0} />
        <Txt x={320} y={720} size={26} color={C.inkSoft}>
          {"так выглядели компьютеры"}
        </Txt>
      </g>
      <g opacity={show} transform={`translate(780 ${640 + (1 - show) * 60})`}>
        <ColorPod x={0} y={0} s={1.15} color={C.teal} t={t} />
        {handle > 0 && <circle cx={0} cy={-370} r={70} fill={C.yellow} opacity={0.3 * handle} />}
        <Txt x={0} y={-140} size={32} weight={900} color={C.white}>
          {"Привет (снова)"}
        </Txt>
      </g>
      {handle > 0 && <Note x={1110} y={260} text={"ручка: можно\nпотрогать"} k={handle} color={C.white} size={26} rot={4} />}
      {colors > 0 &&
        cols.map((col, i) => {
          const k = clamp01(colors * 5 - i);
          return (
            <g key={i} opacity={k}>
              <ColorPod x={160 + i * 110} y={860} s={0.24} color={col} t={t} />
            </g>
          );
        })}
      {colors > 0 && <Tag x={1010} y={820} text="≈ 278 000 за 6 недель" color={C.green} size={26} textColor={C.white} />}
    </Stage>
  );
};

// ── v07: поставки: склады, грузовики, дни вместо месяцев ──
export const SupplyChain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const net = ramp(t, 0.3, 1);
  const shrink = ramp(t, at(c, 1), 1.6);
  const team = ramp(t, at(c, 2), 1);
  const n = Math.round(19 - 10 * shrink);
  return (
    <Stage host={c.p.host}>
      <g opacity={net}>
        <Person x={170} y={840} s={0.44} color={C.steel} name="Кук" t={t} gesture="point" />
        {Array.from({ length: 19 }).map((_, i) => {
          const keep = i < n;
          return (
            <g key={i} opacity={keep ? 1 : 0.15} transform={`translate(${360 + (i % 7) * 120} ${200 + Math.floor(i / 7) * 120})`}>
              <path d="M -40 0 L -40 -40 L 0 -60 L 40 -40 L 40 0 Z" fill={keep ? C.woodLight : C.concrete} stroke={OL} strokeWidth={3} />
            </g>
          );
        })}
        <Txt x={780} y={560} size={30} weight={900}>
          {`склады: ${n}`}
        </Txt>
      </g>
      <g transform={`translate(${360 + ((t * 120) % 760)} 640)`}>
        <rect x={-60} y={-40} width={90} height={60} rx={6} fill={C.white} stroke={OL} strokeWidth={3} />
        <rect x={30} y={-26} width={40} height={46} rx={6} fill={C.sky} stroke={OL} strokeWidth={3} />
        <circle cx={-34} cy={24} r={12} fill={OL} />
        <circle cx={44} cy={24} r={12} fill={OL} />
      </g>
      <g opacity={shrink}>
        <Tag x={780} y={740} text={shrink > 0.6 ? "запасы — на дни" : "запасы — на месяцы"} color={shrink > 0.6 ? C.green : C.coral} size={30} textColor={C.white} />
      </g>
      {team > 0 && (
        <g opacity={team}>
          <ButtonGrid x={1060} y={830} cols={5} rows={1} keep={() => true} off={0} t={t} size={34} />
          <Txt x={1060} y={780} size={24} color={C.inkSoft}>
            {"команда, а не соло"}
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 2.3)} x={1000} y={460}>
        <Panel x={-260} y={-40} w={520} h={80} fill={C.white} r={40} />
        <Txt x={0} y={14} size={30} weight={900}>
          {"лучшие — к лучшим"}
        </Txt>
      </Pop>
    </Stage>
  );
};
