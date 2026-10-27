// Часть «Деньги» (объединение человечества): миры сливаются, рынок без денег,
// формы денег, деньги как система доверия и её цена, империи, развилки истории,
// зачем изучать историю. Религии — без символов и изображений (только подпись).
import React from "react";
import { C, FONT } from "../theme";
import { Coin, Crowd, Island, Net, Person, Sack, Sea, Shell, Stage } from "./island";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── u01: тысячи миров сливаются в один ──
export const WorldsMerge: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const merge = ramp(t, at(c, 1), 3);
  const three = ramp(t, at(c, 2), 0.6);
  const blobs = Array.from({ length: 14 }).map((_, i) => {
    const a = (i / 14) * Math.PI * 2;
    const r = 380 * (1 - merge * 0.85);
    return { x: 640 + Math.cos(a) * r * 1.3, y: 450 + Math.sin(a) * r * 0.75, s: 40 + (i % 3) * 14 };
  });
  return (
    <Stage host={c.p.host}>
      {merge > 0.6 && <ellipse cx={640} cy={450} rx={260 * merge} ry={170 * merge} fill={C.sand} opacity={clamp01((merge - 0.6) * 3)} />}
      {blobs.map((b, i) => (
        <ellipse key={i} cx={b.x} cy={b.y} rx={b.s * 1.3} ry={b.s} fill={C.sand} stroke={C.sandDeep} strokeWidth={4} opacity={1 - clamp01((merge - 0.85) * 6)} />
      ))}
      <Pop t={t} at={at(c, 1.5)} x={640} y={450}>
        <Txt x={0} y={14} size={40} color={C.ink}>
          {merge > 0.7 ? "один связанный мир" : ""}
        </Txt>
      </Pop>
      {three > 0 && (
        <g opacity={three}>
          {[
            { x: 260, label: "деньги" },
            { x: 640, label: "империи" },
            { x: 1020, label: "религии*" },
          ].map((it, i) => (
            <g key={i} transform={`translate(${it.x} 160) scale(${clamp01(three * 3 - i)})`}>
              <rect x={-150} y={-46} width={300} height={84} rx={42} fill={i === 0 ? C.yellow : C.white} />
              <Txt x={0} y={12} size={36} color={C.ink}>
                {it.label}
              </Txt>
            </g>
          ))}
          <Txt x={640} y={800} size={28} color={C.inkSoft}>
            * в интерпретации автора; вопросы веры фильм не решает
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── u02: рынок без денег ──
export const Barter: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const no = pop(t, at(c, 0.6));
  const pairs = ramp(t, at(c, 1), 2.2);
  const money = pop(t, at(c, 2));
  const goods = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return [640 + Math.cos(a) * 330, 450 + Math.sin(a) * 210] as [number, number];
  });
  const links: [number, number][] = [];
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) links.push([a, b]);
  return (
    <Stage host={c.p.host}>
      {pairs < 0.05 && (
        <g>
          <Person x={330} y={600} s={1.5} i={1} t={t} />
          <Person x={950} y={600} s={1.5} i={4} t={t} look={-1} />
          <g transform="translate(330 330)">
            <circle r={60} fill={C.red} />
            <path d="M 0 -60 Q 10 -80 26 -84" stroke={C.palmDeep} strokeWidth={8} fill="none" />
            <Txt x={0} y={110} size={32} color={C.ink}>
              садовник
            </Txt>
          </g>
          <g transform="translate(950 330)">
            <path d="M -60 20 L -60 -40 L -10 -40 L -10 0 L 60 10 L 60 30 Z" fill={C.woodDark} />
            <Txt x={0} y={110} size={32} color={C.ink}>
              сапожник
            </Txt>
          </g>
          {no > 0 && <Cross x={640} y={360} s={120} k={no} />}
        </g>
      )}
      {pairs > 0.05 && (
        <g opacity={clamp01(pairs * 4)}>
          {links.slice(0, Math.round(pairs * links.length)).map(([a, b], i) => (
            <line key={i} x1={goods[a][0]} y1={goods[a][1]} x2={goods[b][0]} y2={goods[b][1]} stroke={C.coral} strokeWidth={2.5} opacity={0.5 * (1 - money)} />
          ))}
          {goods.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={30} fill={[C.red, C.wheat, C.woodDark, C.skyDeep, C.green, C.violet][i % 6]} />
          ))}
          <g opacity={1 - money}>
            <Panel x={340} y={130} w={600} h={110} fill={C.white} />
            <Txt x={640} y={198} size={38} color={C.red}>
              100 товаров = 4950 цен
            </Txt>
          </g>
        </g>
      )}
      {money > 0 && (
        <g>
          {goods.map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={640} y2={450} stroke={C.yellowDeep} strokeWidth={5} opacity={money} />
          ))}
          <g transform={`translate(640 450) scale(${money})`}>
            <Coin x={0} y={0} r={100} label="мера" spin={0} />
          </g>
        </g>
      )}
    </Stage>
  );
};

// ── u03: чем бывали деньги ──
export const MoneyForms: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = [
    { at: at(c, 0.35), label: "ячмень", draw: <Sack x={0} y={60} s={1.2} label="" /> },
    {
      at: at(c, 0.7),
      label: "раковины каури",
      draw: (
        <g>
          <Shell x={-40} y={0} s={0.9} rot={-20} />
          <Shell x={40} y={10} s={0.9} rot={15} />
        </g>
      ),
    },
    { at: at(c, 1), label: "монеты", draw: <Coin x={0} y={0} r={70} label="" spin={t * 2} /> },
    {
      at: at(c, 2),
      label: "записи в компьютерах",
      draw: (
        <g>
          <rect x={-90} y={-70} width={180} height={120} rx={12} fill={C.ink} />
          <text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.green}>
            {(1000 + Math.floor(t * 37) * 13).toString().slice(-4)}
          </text>
          <rect x={-30} y={50} width={60} height={20} fill={C.ink} />
        </g>
      ),
    },
  ];
  const seal = ramp(t, at(c, 1.2), 0.6);
  const share = ramp(t, at(c, 2.3), 0.6);
  return (
    <Stage host={c.p.host}>
      <line x1={120} y1={440} x2={1160} y2={440} stroke={C.inkSoft} strokeWidth={6} strokeDasharray="12 14" opacity={0.4} />
      {items.map((it, i) => {
        const k = pop(t, it.at);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${170 + i * 310} 420) scale(${k})`}>
            <circle r={120} fill={C.white} />
            {it.draw}
            <Txt x={0} y={180} size={32} color={C.ink}>
              {it.label}
            </Txt>
          </g>
        );
      })}
      {seal > 0 && (
        <g opacity={seal}>
          <Tag x={790} y={200} text="печать правителя = гарантия" color={C.yellow} size={30} />
        </g>
      )}
      {share > 0 && (
        <g opacity={share}>
          <Panel x={240} y={720} w={800} h={100} fill={C.ink} />
          <Txt x={640} y={784} size={32} color={C.yellow}>
            больше девяти десятых денег (данные книги)
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── u04: деньги — сеть доверия между незнакомцами ──
export const TrustWeb: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const coin = pop(t, at(c, 0.5));
  const web = ramp(t, at(c, 1), 2);
  const bridge = ramp(t, at(c, 3), 1);
  const pts: [number, number][] = Array.from({ length: 10 }).map((_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    return [640 + Math.cos(a) * 460, 440 + Math.sin(a) * 240];
  });
  return (
    <Stage host={c.p.host}>
      {pts.map(([x, y], i) => (
        <g key={i}>
          {web > 0 && (
            <line x1={640} y1={440} x2={640 + (x - 640) * clamp01(web * 1.5 - i * 0.05)} y2={440 + (y - 440) * clamp01(web * 1.5 - i * 0.05)} stroke={C.yellowDeep} strokeWidth={5} strokeDasharray="12 10" strokeDashoffset={-t * 30} />
          )}
          <Person x={x} y={y + 40} s={0.9} i={i * 2} t={t} look={x < 640 ? 1 : -1} />
        </g>
      ))}
      {coin > 0 && (
        <g transform={`translate(640 440) scale(${coin})`}>
          <circle r={130 + Math.sin(t * 2) * 6} fill={C.yellow} opacity={0.25} />
          <Coin x={0} y={0} r={90} label="?" spin={t * 1.2} />
        </g>
      )}
      <Pop t={t} at={at(c, 1.4)} x={640} y={150}>
        <Tag x={0} y={0} text="система взаимного доверия" color={C.white} size={38} />
      </Pop>
      {bridge > 0 && (
        <g opacity={bridge}>
          <path d="M 120 830 Q 640 700 1160 830" stroke={C.wood} strokeWidth={22} fill="none" strokeLinecap="round" />
          <Txt x={640} y={850} size={32} color={C.ink}>
            мост к незнакомцу
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── u05: цена — деньги вытесняют дружбу, семью, честь ──
export const MoneyCost: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const values = ["дружба", "семья", "честь"];
  const push = ramp(t, at(c, 1.3), 2);
  const note = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      {values.map((v, i) => {
        const k = pop(t, at(c, 1 + i * 0.15));
        const px = push * (220 + i * 30);
        return k > 0 ? (
          <g key={v} transform={`translate(${280 + i * 240 - px * 0.2} ${360 + i * 20}) scale(${k})`} opacity={1 - push * 0.6}>
            <circle r={90} fill={C.white} stroke={C.coral} strokeWidth={6} />
            <path d="M 0 30 C -50 -10 -40 -60 0 -30 C 40 -60 50 -10 0 30 Z" fill={C.coral} opacity={0.8} />
            <Txt x={0} y={140} size={34} color={C.ink}>
              {v}
            </Txt>
          </g>
        ) : null;
      })}
      <g transform={`translate(${1100 - push * 120} 420)`}>
        <Coin x={0} y={0} r={110 + push * 30} label="" spin={t} />
      </g>
      <Pop t={t} at={at(c, 2)} x={640} y={170}>
        <Txt x={0} y={12} size={38} color={C.ink}>
          доверие к деньгам — не доверие к людям
        </Txt>
      </Pop>
      {note > 0 && (
        <g transform={`translate(640 790) scale(${note})`}>
          <Panel x={-400} y={-50} w={800} h={92} fill="#eef3ff" />
          <Txt x={0} y={10} size={32} color={C.skyDeep}>
            история, а не финансовый совет
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── u06: империи — две стороны ──
export const Empire: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const grow = ramp(t, 0.3, 2.5);
  const cost = ramp(t, at(c, 1), 0.6);
  const legacy = ramp(t, at(c, 2), 0.6);
  const we = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 330)">
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const k = clamp01(grow * 9 - i);
          return (
            <circle key={i} cx={Math.cos(a) * 170} cy={Math.sin(a) * 110} r={60} fill={k > 0.5 ? C.violet : "#d8cff5"} opacity={0.35 + 0.5 * k} />
          );
        })}
        <circle r={70} fill={C.violet} />
        <Txt x={0} y={12} size={30} color={C.white}>
          империя
        </Txt>
      </g>
      {cost > 0 && (
        <g opacity={cost}>
          <Panel x={60} y={560} w={540} h={200} fill="#fff1ee" />
          <Txt x={330} y={620} size={34} color={C.red}>
            цена
          </Txt>
          <Txt x={330} y={680} size={30} color={C.ink}>
            {"войны · порабощение\nизгнание народов"}
          </Txt>
        </g>
      )}
      {legacy > 0 && (
        <g opacity={legacy}>
          <Panel x={680} y={560} w={540} h={200} fill="#eafbef" />
          <Txt x={950} y={620} size={34} color={C.greenDeep}>
            наследие
          </Txt>
          <Txt x={950} y={680} size={30} color={C.ink}>
            {"языки · дороги\nзаконы · культура"}
          </Txt>
        </g>
      )}
      {we > 0 && (
        <g transform={`translate(640 140) scale(${we})`}>
          <Tag x={0} y={0} text="«они» становятся «мы»" color={C.yellow} size={40} />
        </g>
      )}
    </Stage>
  );
};

// ── u07: развилки истории ──
export const Forks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const tree = ramp(t, at(c, 1), 2);
  const hindsight = ramp(t, at(c, 1.6), 0.8);
  const chaos = ramp(t, at(c, 3), 0.8);
  const nodes: { x: number; y: number; px: number; py: number; lit: boolean; d: number }[] = [];
  const build = (x: number, y: number, d: number, lit: boolean, px: number, py: number) => {
    nodes.push({ x, y, px, py, lit, d });
    if (d >= 3) return;
    build(x + 280, y - 150 / (d + 1), d + 1, lit && true, x, y);
    build(x + 280, y + 150 / (d + 1), d + 1, false, x, y);
  };
  build(160, 460, 0, true, 160, 460);
  return (
    <Stage host={c.p.host}>
      {nodes.map((n, i) => {
        const k = clamp01(tree * 4 - n.d);
        if (k <= 0) return null;
        const lit = n.lit && hindsight > 0;
        return (
          <g key={i}>
            <line x1={n.px} y1={n.py} x2={n.px + (n.x - n.px) * k} y2={n.py + (n.y - n.py) * k} stroke={lit ? C.yellowDeep : C.inkSoft} strokeWidth={lit ? 12 : 6} opacity={lit ? 1 : 0.45 + 0.4 * (1 - hindsight)} strokeLinecap="round" />
            <circle cx={n.x} cy={n.y} r={lit ? 18 : 12} fill={lit ? C.yellow : C.white} stroke={C.ink} strokeWidth={3} opacity={k} />
          </g>
        );
      })}
      {hindsight > 0 && (
        <g opacity={hindsight}>
          <Tag x={640} y={170} text="«неизбежно» — только задним числом" color={C.white} size={34} />
        </g>
      )}
      {chaos > 0 && (
        <g opacity={chaos} transform="translate(640 780)">
          <Panel x={-430} y={-60} w={860} h={110} fill={C.ink} />
          <Txt x={-200} y={14} size={32} color={C.yellow}>
            прогноз
          </Txt>
          <Arrow x1={-120} y1={4} x2={60} y2={4} k={chaos} color={C.yellow} w={6} />
          <Txt x={230} y={14} size={32} color={C.yellow}>
            меняет события
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── u07b: история расширяет горизонт ──
export const Horizon: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const open = ramp(t, at(c, 1), 1.6);
  const alt = ramp(t, at(c, 2), 1);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={200} width={1160} height={520} rx={40} fill={C.sky} opacity={0.25} />
      <circle cx={640} cy={720} r={120 + open * 60} fill={C.yellow} opacity={0.7} />
      <rect x={60} y={720} width={1160} height={60} fill={C.sea} opacity={0.6} />
      <g opacity={1 - open * 0.8}>
        <rect x={60} y={200} width={1160} height={520} rx={40} fill="none" stroke={C.ink} strokeWidth={10} />
        <rect x={440 + open * 0} y={260} width={400} height={400} rx={20} fill="none" stroke={C.inkSoft} strokeWidth={8} />
      </g>
      <Pop t={t} at={at(c, 1.3)} x={640} y={140}>
        <Tag x={0} y={0} text="история — чтобы расширить горизонт" color={C.white} size={36} />
      </Pop>
      {alt > 0 &&
        ["иначе", "по-другому", "ещё иначе"].map((s, i) => (
          <g key={s} opacity={clamp01(alt * 3 - i)} transform={`translate(${260 + i * 380} ${420 + wob(t, i, 6)})`}>
            <ellipse rx={150} ry={70} fill={C.white} opacity={0.85} />
            <Txt x={0} y={12} size={34} color={C.skyDeep}>
              {`мир ${s}`}
            </Txt>
          </g>
        ))}
    </Stage>
  );
};

// ── u08: пауза — монета на острове ──
export const PauseCoin: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <g>
      <Sea t={t} x={0} w={1920} y={600} />
      <Island x={380} y={640} w={500} t={t} />
      <Island x={1540} y={640} w={500} t={t} />
      <Crowd x={290} y={610} cols={3} rows={1} gap={60} s={0.8} t={t} />
      <Crowd x={1450} y={610} cols={3} rows={1} gap={60} s={0.8} t={t} seed={4} />
      <g transform={`translate(960 ${330 + wob(t, 1, 10)})`}>
        <Coin x={0} y={0} r={90} label="" spin={t * 0.9} />
      </g>
      <Net pts={[[460, 520], [960, 330], [1460, 520]]} k={1} t={t} links={[[0, 1], [1, 2]]} />
      <Txt x={960} y={180} size={44} color={C.inkSoft}>
        помогают или заменяют?
      </Txt>
    </g>
  );
};

