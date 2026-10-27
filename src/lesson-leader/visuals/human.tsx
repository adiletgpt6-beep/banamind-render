// Принцип 3 — HUMAN: бетон превращается в сад, первый шаг навстречу, круги по воде.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { zoneX } from "./hook";
import { Bubble, Heart, OL, Sprout, WateringCan, Worker } from "./draw";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

export const Garden: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const ceo = pop(t, 0.2);
  const green = ramp(t, at(c, 0.6), 2.5);
  const principle = pop(t, at(c, 1));
  const people = ramp(t, at(c, 3), 0.6);
  const grow = ramp(t, at(c, 4), 3);
  const roofY = 700;
  return (
    <g>
      {/* город и крыша */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={cx - 640 + i * 220} y={420 - (i % 3) * 70} width={160} height={400} fill="#c7d3e6" opacity={0.6} />
      ))}
      <rect x={cx - 600} y={roofY} width={1200} height={140} fill={interpolate(green, [0, 1], [0, 1]) > 0.5 ? "#8a5a2b" : "#9aa0aa"} stroke={OL} strokeWidth={5} />
      <rect x={cx - 600} y={roofY - 18} width={1200 * green} height={22} fill={C.green} />
      {Array.from({ length: 8 }).map((_, i) => (
        <Sprout key={i} x={cx - 540 + i * 155} y={roofY - 10} s={1.2} grow={clamp01(green * 1.6 - i * 0.08) * (people > 0 ? 1 - people : 1)} t={t} color={[C.pink, C.yellow, C.violet, C.coral][i % 4]} />
      ))}
      <g transform={`translate(${cx - 520} ${roofY - 10}) scale(${ceo})`}>
        <Worker x={0} y={0} s={1.25} role="gardener" t={t} />
        <path d={`M -36 -150 L 36 -150`} stroke={C.red} strokeWidth={0} />
      </g>
      <Pop t={t} at={0.4} x={cx - 520} y={roofY - 260}>
        <g>
          <rect x={-150} y={-30} width={300} height={56} rx={28} fill="#fff" stroke={OL} strokeWidth={3} />
          <Txt x={0} y={8} size={24} color={C.inkSoft}>
            был директором
          </Txt>
          <path d="M -120 -2 L 120 -2" stroke={C.red} strokeWidth={4} opacity={ramp(t, at(c, 0.5), 0.5)} />
        </g>
      </Pop>
      {principle > 0 && people < 1 && (
        <g transform={`translate(${cx + 120} 240) scale(${principle})`} opacity={1 - people}>
          <rect x={-420} y={-70} width={840} height={130} rx={34} fill={C.ink} />
          <Txt x={0} y={-12} size={32} color="#fff">
            Чем глубже отношения с людьми,
          </Txt>
          <Txt x={0} y={34} size={32} color={C.yellow}>
            тем сильнее влияние
          </Txt>
        </g>
      )}
      {people > 0 && (
        <g opacity={people}>
          <Tag x={cx + 120} y={230} text="дело = люди вокруг общей цели" size={32} color={C.yellow} />
          {[0, 1, 2, 3].map((i) => {
            const g = clamp01(grow * 1.4 - i * 0.12);
            const x = cx - 200 + i * 200;
            return (
              <g key={i}>
                <Sprout x={x} y={roofY - 10} s={1.5} grow={0.5 + g * 0.5} t={t} color={[C.pink, C.yellow, C.violet, C.coral][i]} />
                <g transform={`translate(${x} ${roofY - 220 - g * 40}) scale(${0.5 + 0.2 * g})`} opacity={g}>
                  <circle r={46} fill="#f2c79b" stroke={OL} strokeWidth={4} />
                  <circle cx={-14} cy={-6} r={5} fill={OL} />
                  <circle cx={14} cy={-6} r={5} fill={OL} />
                  <path d="M -14 14 Q 0 26 14 14" stroke={OL} strokeWidth={4} fill="none" />
                </g>
              </g>
            );
          })}
          <WateringCan x={cx - 400 + grow * 700} y={roofY - 360} s={1} rot={22} pour={t} />
          <Pop t={t} at={at(c, 4.5)} x={cx + 120} y={330}>
            <Tag x={0} y={0} text="посадить · поливать · ждать" size={30} color="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const GiveFirst: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const wait = pop(t, 0.2);
  const step = ramp(t, at(c, 1), 1);
  const mirror = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3), 0.5));
  const lecture = ramp(t, at(c, 3), 0.5) * (1 - ramp(t, at(c, 4), 0.5));
  const pawn = ramp(t, at(c, 4), 0.5);
  const s1 = 1 - ramp(t, at(c, 2), 0.4);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1 * clamp01(wait * 2)}>
          <Worker x={cx - 360 + step * 230} y={720} s={1.5} role="plain" color={C.green} t={t} arms={step * 0.7} />
          <Worker x={cx + 360} y={720} s={1.5} role="plain" color={C.orange} t={t} flip arms={step > 0.9 ? 0.6 : 0} />
          {step < 0.5 &&
            [0, 1].map((i) => (
              <g key={i} transform={`translate(${cx - 360 + i * 720} 380)`} opacity={1 - step * 2}>
                <Bubble x={0} y={0} w={240} h={80} fill="#eef1f6" />
                <Txt x={0} y={10} size={28} color={C.inkSoft}>
                  жду…
                </Txt>
              </g>
            ))}
          {step > 0.6 && (
            <g opacity={(step - 0.6) * 2.5}>
              <Heart x={cx + 10} y={430} s={1.2} />
              <Tag x={cx} y={300} text="первый шаг — мой" size={38} color={C.yellow} />
            </g>
          )}
        </g>
      )}
      {mirror > 0 && (
        <g opacity={mirror}>
          {[
            ["уважаю", "уважают"],
            ["слушаю", "слушают"],
            ["помогаю", "помогают"],
          ].map(([a, b], i) => (
            <g key={i} transform={`translate(${cx} ${330 + i * 150})`} opacity={ramp(t, at(c, 2.1) + i * 0.3, 0.4)}>
              <rect x={-470} y={-46} width={360} height={84} rx={42} fill={C.yellow} />
              <Txt x={-290} y={12} size={34} weight={900}>
                {a}
              </Txt>
              <Arrow x1={-90} y1={0} x2={90} y2={0} k={ramp(t, at(c, 2.3) + i * 0.3, 0.4)} color={C.green} />
              <rect x={110} y={-46} width={360} height={84} rx={42} fill="#fff" stroke={OL} strokeWidth={3} />
              <Txt x={290} y={12} size={34}>
                {b}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {lecture > 0 && (
        <g opacity={lecture}>
          <g transform={`translate(${cx - 300} 600)`}>
            <Worker x={0} y={120} s={1.4} role="boss" t={t} arms={0.8} />
            <Bubble x={0} y={-200} w={330} h={90} fill="#ffe3e3" />
            <Txt x={0} y={-190} size={28} color={C.red}>
              бла-бла-бла!
            </Txt>
            <Worker x={170} y={120} s={1.1} role="plain" color={C.grey} t={t} mood="sad" />
          </g>
          <g transform={`translate(${cx + 300} 600)`}>
            <Worker x={0} y={120} s={1.4} role="clerk" t={t} arms={0.4} />
            <Worker x={-150} y={120} s={1.1} role="plain" color={C.teal} t={t} />
            <Worker x={150} y={120} s={1.1} role="plain" color={C.pink} t={t} />
            <Tag x={0} y={-180} text="пример" size={34} color={C.yellow} />
          </g>
        </g>
      )}
      {pawn > 0 && (
        <g opacity={pawn}>
          {/* шахматная доска */}
          <g transform={`translate(${cx - 300} 560)`}>
            {Array.from({ length: 16 }).map((_, i) => (
              <rect key={i} x={-160 + (i % 4) * 80} y={-160 + Math.floor(i / 4) * 80} width={80} height={80} fill={(i + Math.floor(i / 4)) % 2 ? "#e9d8b8" : "#a8734a"} />
            ))}
            <g transform="translate(0 -40)" opacity={1 - ramp(t, at(c, 4.4), 0.6)}>
              <circle cx={0} cy={-70} r={30} fill={C.ink} />
              <path d="M -30 -40 L 30 -40 L 50 60 L -50 60 Z" fill={C.ink} />
            </g>
            <g opacity={ramp(t, at(c, 4.4), 0.6)}>
              <Worker x={0} y={60} s={1.1} role="plain" color={C.violet} t={t} />
            </g>
          </g>
          <g transform={`translate(${cx + 260} 500)`} opacity={ramp(t, at(c, 4.6), 0.5)}>
            <Bubble x={0} y={0} w={420} h={170} fill="#fff" />
            <Txt x={0} y={-30} size={28}>
              мама двоих детей,
            </Txt>
            <Txt x={0} y={10} size={28}>
              рисует, учит испанский…
            </Txt>
            <Txt x={0} y={50} size={26} color={C.inkSoft}>
              у каждого своя история
            </Txt>
          </g>
          <Tag x={cx} y={250} text="люди — не пешки" size={40} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const Ripples: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const drop = at(c, 0.4);
  const k = t - drop;
  const names = ramp(t, at(c, 1), 0.5);
  const reveal = ramp(t, at(c, 1.6), 0.6);
  const team = ramp(t, at(c, 3), 0.6);
  const caution = ramp(t, at(c, 4), 0.6);
  const people = [
    { role: "boss" as const, name: "директор", x: -380, y: -140 },
    { role: "clerk" as const, name: "продавец", x: 360, y: -120 },
    { role: "barista" as const, name: "бариста", x: -420, y: 120 },
    { role: "janitor" as const, name: "уборщик", x: 380, y: 120 },
  ];
  return (
    <g>
      <g transform={`translate(${cx} 520)`}>
        <ellipse rx={560} ry={300} fill="#bfe6fb" stroke="#7fbde3" strokeWidth={6} />
        {k > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const r = ((k * 140 + i * 110) % 560) * 1;
            return k * 140 > i * 110 ? <ellipse key={i} rx={r} ry={r * 0.53} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - r / 560} /> : null;
          })}
        {/* камешек падает */}
        {t < drop + 0.2 && <circle cx={0} cy={interpolate(t, [Math.max(0, drop - 0.8), drop], [-420, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} r={22} fill="#8a8f99" stroke={OL} strokeWidth={4} />}
        {people.map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y + 140})`} opacity={names}>
            <Worker x={0} y={0} s={1} role={p.role} t={t + i} mood={k * 140 > 300 ? "smile" : "flat"} />
            <g transform="translate(0 50)">
              <rect x={-90} y={-24} width={180} height={44} rx={10} fill="#fff" stroke={OL} strokeWidth={3} />
              <text x={0} y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.ink}>
                {p.role === "janitor" ? (reveal > 0.5 ? "Сергей" : "???") : p.name}
              </text>
            </g>
          </g>
        ))}
      </g>
      {names > 0 && caution < 1 && (
        <g transform={`translate(${cx} 160)`} opacity={names * (1 - caution)}>
          <Tag x={0} y={0} text={team > 0.5 ? "хорошие отношения → сильная команда" : "как зовут уборщика?"} size={36} color={C.yellow} />
        </g>
      )}
      {caution > 0 && (
        <g transform={`translate(${cx} 190) scale(${caution})`}>
          <rect x={-470} y={-60} width={940} height={110} rx={34} fill="#fff" stroke={C.orange} strokeWidth={5} />
          <Txt x={0} y={-8} size={30}>
            помогать искренне —
          </Txt>
          <Txt x={0} y={32} size={30} color={C.red}>
            без расчёта и манипуляции
          </Txt>
        </g>
      )}
    </g>
  );
};

export { Check, Panel, wob };
