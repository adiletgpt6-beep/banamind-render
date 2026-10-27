// Навык 1 «Будьте проактивны»: промежуток между раздражителем и реакцией и четыре дара,
// «своя погода», реактивная и проактивная речь, Круг Забот / Круг Влияния и три вида
// проблем, история менеджера у властного начальника, палка о двух концах.
import React from "react";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Cloud, Icon, Label, OL, Person, Phone, Sun } from "./draw";
import { Appear, area, Arrow, at, Check, clamp01, Drift, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

const H1 = HABIT[1].color;

// ───────────── промежуток ─────────────
export const Gap: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const open = ramp(t, b1 + 1.2, 1.2);
  const gapW = 40 + open * 600;
  const gifts = [
    { label: "самосознание", icon: "target" as const },
    { label: "воображение", icon: "star" as const },
    { label: "совесть", icon: "compass" as const },
    { label: "независимая воля", icon: "key" as const },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      <Appear t={t} at={0.3} x={cx - gapW / 2 - 170} y={420}>
        <Card x={0} y={0} w={300} h={180} color={C.coral} title="событие" lines={["раздражитель"]} />
      </Appear>
      <Appear t={t} at={0.9} x={cx + gapW / 2 + 170} y={420}>
        <Card x={0} y={0} w={300} h={180} color={C.teal} title="ответ" lines={["реакция"]} />
      </Appear>
      {open < 0.2 && t > 1.2 && (
        <g transform={`translate(${cx} 420)`}>
          {[-1, 0, 1].map((i) => (
            <ellipse key={i} cx={i * 28} cy={0} rx={22} ry={14} fill="none" stroke={OL} strokeWidth={7} />
          ))}
          <Txt x={0} y={-40} size={26} color={C.white}>
            привычка
          </Txt>
        </g>
      )}
      {open > 0 && (
        <g>
          <rect x={cx - gapW / 2 + 10} y={290} width={Math.max(0, gapW - 20)} height={260} rx={30} fill={C.sun} opacity={0.22 + 0.08 * Math.sin(t * 2)} />
          <rect x={cx - gapW / 2 + 10} y={290} width={Math.max(0, gapW - 20)} height={260} rx={30} fill="none" stroke={C.white} strokeWidth={5} strokeDasharray="14 12" />
          <Txt x={cx} y={275} size={32} color={C.white} weight={900}>
            промежуток = свобода выбора
          </Txt>
        </g>
      )}
      {gifts.map((g, i) => {
        const k = ramp(t, b2 + i * 0.7, 0.5);
        if (k <= 0 || open < 0.9) return null;
        const gx = cx - 138 + (i % 2) * 276;
        const gy = 360 + Math.floor(i / 2) * 120;
        return (
          <g key={g.label} opacity={k} transform={`translate(${gx} ${gy + (1 - k) * 20})`}>
            <rect x={-130} y={-40} width={260} height={80} rx={40} fill={C.white} stroke={OL} strokeWidth={4} />
            <Icon name={g.icon} x={-92} y={0} s={0.62} color={H1} />
            <text x={-60} y={9} fontFamily={FONT} fontWeight={900} fontSize={g.label.length > 12 ? 20 : 25} fill={C.ink}>
              {g.label}
            </text>
          </g>
        );
      })}
      <Appear t={t} at={b1 - 0.1} x={cx} y={720}>
        <g>
          <rect x={-560} y={-70} width={1120} height={140} rx={36} fill={C.paper} stroke={OL} strokeWidth={5} />
          <rect x={-560} y={-70} width={18} height={140} rx={9} fill={H1} />
          <text y={-12} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink} textAnchor="middle">
            «между раздражителем и реакцией
          </text>
          <text y={36} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink} textAnchor="middle">
            человек имеет свободу выбора»
          </text>
          <text x={540} y={60} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.inkSoft} textAnchor="end">
            мысль В. Франкла в книге Кови
          </text>
        </g>
      </Appear>
    </Drift>
  );
};

// ───────────── своя погода ─────────────
export const Weather: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const two = ramp(t, b1 - 0.2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <g opacity={1 - two}>
        <g transform={`translate(${cx} 420)`}>
          <text fontFamily={DISPLAY} fontWeight={800} fontSize={110} textAnchor="middle" fill={C.white}>
            <tspan fill={C.sun}>ответ</tspan>ственность
          </text>
          <Appear t={t} at={0.8} x={0} y={110}>
            <Label x={0} y={0} text="способность выбирать ответ" size={36} bg={C.paper} />
          </Appear>
        </g>
      </g>
      {two > 0 && (
        <g opacity={two}>
          <Cloud x={cx - 300} y={240} s={0.9} color="#8f9bb8" rain={1} t={t} />
          <Person who="marat" x={cx - 300} y={850} s={0.85} t={t} pose="cross" mood="sad" accent={C.coral} />
          <Label x={cx - 300} y={900} text="зависит от «погоды»" size={26} bg={C.coralSoft} />
          <Sun x={cx + 300} y={260} r={58} t={t} />
          {b2 < t && <Cloud x={cx + 300 + Math.sin(t * 0.8) * 90} y={210} s={0.45} color="#c9d2e6" rain={0.5} t={t} />}
          <Person who="marat" x={cx + 300} y={850} s={0.85} t={t} pose="open" mood="calm" accent={C.teal} />
          <Label x={cx + 300} y={900} text="погода внутри: ценности" size={26} bg={C.tealSoft} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── реактивная и проактивная речь ─────────────
export const Language: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const pairs = [
    ["Я ничего не могу поделать", "Посмотрим, какие есть возможности"],
    ["Он так меня раздражает", "Я контролирую свои чувства"],
    ["Я вынужден", "Я предпочитаю"],
  ];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      {pairs.map(([a, b], i) => {
        const inK = ramp(t, 0.4 + i * 0.9, 0.5);
        const flip = ramp(t, b1 + i * 1.1, 0.5);
        const sy = Math.abs(Math.cos(flip * Math.PI));
        const showB = flip > 0.5;
        const y = 250 + i * 160;
        return (
          <g key={i} transform={`translate(${cx} ${y}) scale(${inK} ${Math.max(0.03, sy) * inK})`} opacity={inK}>
            <rect x={-440} y={-58} width={880} height={116} rx={30} fill={showB ? C.tealSoft : C.coralSoft} stroke={OL} strokeWidth={5} />
            <circle cx={-390} cy={0} r={26} fill={showB ? C.teal : C.coral} />
            <text x={20} y={13} fontFamily={FONT} fontWeight={900} fontSize={38} fill={C.ink} textAnchor="middle">
              {showB ? b : a}
            </text>
          </g>
        );
      })}
      <Appear t={t} at={b2} x={cx} y={760}>
        <g>
          <circle r={70} fill="none" stroke={C.white} strokeWidth={16} />
          <path d="M -70 0 L 70 0 M 0 0 L 0 70" stroke={C.white} strokeWidth={14} />
          <circle r={18} fill={C.white} />
          <g transform={`rotate(${Math.sin(t * 1.5) * 18})`}>
            <circle r={84} fill="none" stroke={C.sun} strokeWidth={6} strokeDasharray="20 16" />
          </g>
          <Txt x={240} y={12} size={34} color={C.white} weight={900}>
            руль снова у вас
          </Txt>
        </g>
      </Appear>
    </Drift>
  );
};

// ───────────── круг забот / круг влияния ─────────────
type CirclesP = { host?: string; mode: "intro" | "control" };
export const Circles: React.FC<VisualProps<CirclesP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const cy = 470;
  if (p.mode === "control") {
    const rows = [
      { title: "прямой контроль", sub: "моё поведение", color: C.teal, icon: "people" as const },
      { title: "косвенный контроль", sub: "поведение других — влиять, не управлять", color: "#3d8bff", icon: "chat" as const },
      { title: "вне контроля", sub: "прошлое, пробка — принять", color: "#9aa6c4", icon: "moon" as const },
    ];
    const b1 = at(ctx, 1);
    const b2 = at(ctx, 2);
    const warn = ramp(t, b2, 0.6);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={460}>
        <g opacity={1 - warn}>
          {rows.map((r, i) => {
            const k = ramp(t, (i < 2 ? 0.3 + i * 1.6 : b1), 0.5);
            return (
              <g key={r.title} opacity={k} transform={`translate(${cx} ${250 + i * 175}) translate(${(1 - k) * 60} 0)`}>
                <rect x={-500} y={-70} width={1000} height={140} rx={34} fill={C.white} stroke={OL} strokeWidth={5} />
                <circle cx={-420} cy={0} r={48} fill={r.color} stroke={OL} strokeWidth={4} />
                <Icon name={r.icon} x={-420} y={0} s={0.9} color={C.white} />
                <text x={-350} y={-6} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>
                  {r.title}
                </text>
                <text x={-350} y={40} fontFamily={FONT} fontWeight={800} fontSize={28} fill={C.inkSoft}>
                  {r.sub}
                </text>
              </g>
            );
          })}
        </g>
        {warn > 0 && (
          <g opacity={warn} transform={`translate(${cx} 460) scale(${0.85 + 0.15 * warn})`}>
            <Card x={0} y={0} w={940} h={360} color={H1} title="Граница инструмента" lines={["проактивность ≠ власть над чужими решениями", "проактивность ≠ вина за то, что случилось", "болезнь, бедность, чужая жестокость — не выбор", "выбор — следующий шаг"]} size={32} titleSize={42} />
          </g>
        )}
      </Drift>
    );
  }
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const outerK = ramp(t, 0.3, 0.8);
  const innerK = ramp(t, b1, 0.7);
  const complain = ramp(t, b2, 0.8) - ramp(t, b2 + 2.4, 0.8);
  const grow = ramp(t, b2 + 3, 1.6);
  const rIn = innerK * (135 - complain * 50 + grow * 55);
  const concerns = ["экономика", "начальник", "погода", "пробки", "здоровье мамы", "оценки сына"];
  const mine = ["мой ответ", "подготовка", "обещания"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={cy}>
      <circle cx={cx} cy={cy} r={390 * outerK} fill={C.white} opacity={0.18} stroke={C.white} strokeWidth={6} />
      <Appear t={t} at={0.6} x={cx} y={cy - 360}>
        <Label x={0} y={0} text="Круг Забот" size={34} bg={C.paper} />
      </Appear>
      {concerns.map((c, i) => {
        const a = (i / concerns.length) * Math.PI * 2 - Math.PI / 2 + 0.3;
        const k = ramp(t, 0.8 + i * 0.35, 0.4);
        return (
          <g key={c} opacity={k * (1 - 0.4 * innerK)} transform={`translate(${cx + Math.cos(a) * 330} ${cy + Math.sin(a) * 285 + wob(t, i, 5)})`}>
            <Label x={0} y={0} text={c} size={26} bg={C.coralSoft} />
          </g>
        );
      })}
      {innerK > 0 && (
        <g>
          <circle cx={cx} cy={cy} r={Math.max(10, rIn)} fill={H1} opacity={0.85} stroke={OL} strokeWidth={5} />
          <Txt x={cx} y={cy - Math.max(10, rIn) * 0.45} size={32} color={C.white} weight={900}>
            Круг Влияния
          </Txt>
          {mine.map((m, i) => (
            <g key={m} opacity={ramp(t, b1 + 0.8 + i * 0.6, 0.4) * clamp01(rIn / 120)}>
              <Txt x={cx} y={cy + 6 + i * 40} size={28} color={C.white}>
                {m}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {complain > 0 &&
        [0, 1, 2].map((i) => (
          <g key={i} opacity={complain}>
            <Bubble x={cx - 520 + i * 70} y={260 + i * 180} text={["«виноваты они»", "«ничего не изменить»", "«опять…»"][i]} w={300} size={26} bg={C.coralSoft} tail="right" />
          </g>
        ))}
      {grow > 0 && (
        <g opacity={grow}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return <Arrow key={i} x1={cx + Math.cos(a) * (rIn + 10)} y1={cy + Math.sin(a) * (rIn + 10)} x2={cx + Math.cos(a) * (rIn + 60)} y2={cy + Math.sin(a) * (rIn + 60)} k={grow} color={C.white} w={7} />;
          })}
        </g>
      )}
    </Drift>
  );
};

// ───────────── менеджер у властного начальника ─────────────
export const Corridor: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const x0 = A.x0;
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const walk = ramp(t, b1, 2.2);
  const heroX = x0 + 520 + walk * (A.x1 - x0 - 820);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={520}>
      <rect x={x0 + 20} y={160} width={A.x1 - x0 - 40} height={700} rx={30} fill="#e9eef8" stroke={OL} strokeWidth={5} opacity={0.95} />
      <rect x={A.x1 - 300} y={260} width={220} height={560} rx={12} fill={C.wood} stroke={OL} strokeWidth={5} />
      <Label x={A.x1 - 190} y={230} text="президент" size={26} bg={C.white} />
      <Person who="boss" x={A.x1 - 190} y={800} s={0.62} t={t} pose={t > b1 + 2.4 ? "open" : "cross"} mood={t > b1 + 2.4 ? "calm" : "angry"} flip />
      {[0, 1].map((i) => (
        <Person key={i} who={i ? "woman" : "man"} x={x0 + 160 + i * 190} y={840} s={0.62} t={t} pose="open" mood="sad" seed={i} />
      ))}
      <Appear t={t} at={0.6}>
        <Bubble x={x0 + 250} y={340} text={"«ему бы уйти…»\n«ничего не изменить»"} w={380} size={26} bg={C.coralSoft} />
      </Appear>
      <Person who="marat" x={heroX} y={840} s={0.62} t={t} pose={walk > 0 && walk < 1 ? "walk" : "hold"} mood="calm" accent={C.teal} />
      {walk > 0 && (
        <g transform={`translate(${heroX + 40} 610)`}>
          <rect x={-46} y={-34} width={92} height={68} rx={8} fill={C.sun} stroke={OL} strokeWidth={4} />
          <text y={8} fontFamily={FONT} fontWeight={900} fontSize={18} fill={C.ink} textAnchor="middle">
            анализ
          </text>
        </g>
      )}
      <Appear t={t} at={b1 + 2.4}>
        <Bubble x={A.x1 - 330} y={360} text="А что вы думаете?" w={340} size={30} tail="right" />
      </Appear>
      {t > b2 && (
        <g>
          <circle cx={heroX} cy={700} r={80 + ramp(t, b2, 2) * 140} fill="none" stroke={H1} strokeWidth={10} opacity={0.85} />
          <Label x={heroX} y={460 - ramp(t, b2, 2) * 60} text="круг влияния растёт" size={28} bg={HABIT[1].soft} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── палка о двух концах ─────────────
export const Stick: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const lift = ramp(t, 1.2, 1.2);
  const errK = ramp(t, b1, 0.6);
  const msg = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={460}>
      <g opacity={1 - msg} transform={`translate(${cx} ${430 - errK * 120}) scale(${1 - errK * 0.3})`}>
        <g transform={`translate(0 ${-lift * 90})`}>
          <rect x={-420} y={-18} width={840} height={36} rx={18} fill={C.wood} stroke={OL} strokeWidth={5} />
          <Label x={-340} y={-70} text="выбор" size={32} bg={C.tealSoft} />
          <Label x={340} y={-70} text="последствия" size={32} bg={C.coralSoft} />
        </g>
        <circle cx={-400} cy={-lift * 90 + 34} r={26} fill="#efcfb0" stroke={OL} strokeWidth={4} />
      </g>
      {errK > 0 && msg < 1 && (
        <g opacity={errK * (1 - msg)}>
          {["признать", "исправить", "извлечь урок"].map((s, i) => {
            const k = ramp(t, b1 + 0.6 + i * 0.8, 0.4);
            return (
              <g key={s} transform={`translate(${cx - 360 + i * 360} 620)`} opacity={k}>
                <rect x={-150} y={-50} width={300} height={100} rx={30} fill={C.white} stroke={OL} strokeWidth={4} />
                <text x={20} y={12} fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.ink} textAnchor="middle">
                  {s}
                </text>
                <Check x={-110} y={-2} s={32} k={k} />
                {i < 2 && <Arrow x1={160} y1={0} x2={200} y2={0} k={k} color={C.white} w={8} />}
              </g>
            );
          })}
        </g>
      )}
      {msg > 0 && (
        <g opacity={msg}>
          <Phone x={cx - 280} y={460} s={1.3} t={t} />
          <Bubble x={cx + 170} y={380} text={"Отчёт будет к двенадцати,\nвот что уже готово"} w={520} size={32} tail="left" bg={C.tealSoft} />
          <Pop t={t} at={b2 + 1.6} x={cx + 170} y={600}>
            <Label x={0} y={0} text="пробка осталась · утро — нет" size={32} bg={C.white} />
          </Pop>
        </g>
      )}
    </Drift>
  );
};

