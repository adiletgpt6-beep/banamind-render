// Часть «Фокус» (законы 10, 12, 13): деление категорий (амёба), Volkswagen
// «Жук», шкаф, который заполняется сам, соус для птицы и новые вкусы,
// палатка «Рассвета», три жертвы, цель — не рынок.
import React from "react";
import { Arrow, Check, Cross, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, FONT, Z } from "../theme";
import { Car, Dot, OL, Plane, Shop } from "./draw";
import { Bakery, Bottle, Computer, Loaf, Mainframe, MiniPC, Tent } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

// капля-«клетка» категории
const Cell: React.FC<{ x: number; y: number; r: number; color: string; label: string; t: number; seed?: number; size?: number }> = ({ x, y, r, color, label, t, seed = 0, size = 28 }) => {
  const d = Array.from({ length: 10 })
    .map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const rr = r * (1 + 0.06 * Math.sin(t * 2 + i * 1.7 + seed));
      return `${i === 0 ? "M" : "L"} ${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}`;
    })
    .join(" ");
  return (
    <g>
      <path d={`${d} Z`} fill={color} stroke={OL} strokeWidth={4} strokeLinejoin="round" opacity={0.95} />
      <text x={x} y={y + size * 0.36} fontFamily={FONT} fontWeight={900} fontSize={size} textAnchor="middle" fill={C.ink}>
        {label}
      </text>
    </g>
  );
};

// ── Закон деления: компьютеры делятся, у каждой ветки свой лидер; Acura ──
export const Amoeba: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const split = ramp(t, at(c, 1), Math.max(1, at(c, 1.8) - at(c, 1)));
  const acura = ramp(t, at(c, 2), 0.6);
  const kids = ["мейнфреймы", "мини", "рабочие станции", "персональные", "переносные"];
  return (
    <g>
      <g opacity={1 - acura}>
        {split < 0.05 ? (
          <Cell x={cx} y={480} r={200} color={Z.tealSoft} label="компьютеры" t={t} size={44} />
        ) : (
          kids.map((k, i) => {
            const a = -Math.PI / 2 + (i / kids.length) * Math.PI * 2;
            const dist = 270 * split;
            const x = cx + Math.cos(a) * dist * 1.25;
            const y = 480 + Math.sin(a) * dist;
            return <Cell key={k} x={x} y={y} r={200 - 90 * split} color={[Z.tealSoft, Z.mint, "#dfe8ff", "#ffe0c2", "#f8d7ef"][i]} label={k} t={t} seed={i} size={k.length > 10 ? 22 : 28} />;
          })
        )}
        <Pop t={t} at={at(c, 1.8)} x={cx} y={480}>
          <Tag x={0} y={0} text="у каждой ветки — свой лидер" size={30} color={C.yellow} />
        </Pop>
      </g>
      {acura > 0 && (
        <g opacity={acura}>
          <Txt x={cx} y={200} size={44} weight={900}>
            новая категория → новый бренд
          </Txt>
          <g transform={`translate(${cx - 270} 0)`}>
            <Car x={0} y={560} s={0.9} t={t} color={Z.teal} />
            <Shop x={0} y={780} s={0.8} label="салон Honda" awning={Z.teal} />
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <g transform={`translate(0 560) scale(${pop(t, at(c, 2.4))})`}>
              <Car x={0} y={0} s={0.95} t={t} color={C.ink} />
            </g>
            <Shop x={0} y={780} s={0.8} label="салон Acura" awning={C.ink} glow={ramp(t, at(c, 2.6), 0.5)} />
          </g>
        </g>
      )}
    </g>
  );
};

// ── Volkswagen: «Жук» 67 % → большие машины → менее 4 % (данные книги) ──
export const Beetle: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const big = ramp(t, at(c, 1), 0.6);
  const fall = ramp(t, at(c, 1.5), 1.2);
  const mind = ramp(t, at(c, 2), 0.5);
  const share = 67 - (67 - 3.8) * fall;
  const BeetleCar: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -120 -10 Q -120 -120 0 -130 Q 120 -120 120 -10 Z" fill={Z.mint} stroke={OL} strokeWidth={5} />
      <path d="M -60 -70 Q -40 -110 0 -112 L 0 -70 Z M 14 -70 L 14 -112 Q 54 -108 70 -70 Z" fill={Z.tealSoft} stroke={OL} strokeWidth={4} />
      {[-70, 70].map((wx) => (
        <circle key={wx} cx={wx} cy={-8} r={26} fill={C.ink} stroke={OL} strokeWidth={4} />
      ))}
    </g>
  );
  return (
    <g>
      <g transform={`translate(${cx - 280} 0)`} opacity={1 - big * 0.6}>
        <BeetleCar x={0} y={560} s={1.2} />
        <Txt x={0} y={630} size={32} weight={900}>
          «Жук»
        </Txt>
      </g>
      <g transform={`translate(${cx + 280} 0)`}>
        <Txt x={0} y={200} size={34} weight={900}>
          доля импорта в США
        </Txt>
        <Txt x={0} y={300} size={90} weight={900} color={fall > 0.5 ? C.red : C.green}>
          {fall < 0.99 ? `${Math.round(share)}%` : "< 4%"}
        </Txt>
        <Txt x={0} y={350} size={26} color={C.inkSoft}>
          по данным книги
        </Txt>
        {big > 0 &&
          [0, 1, 2].map((i) => (
            <g key={i} opacity={big} transform={`translate(${-160 + i * 160} ${560 + i * 10})`}>
              <Car x={0} y={0} s={0.5} t={t} color={[Z.navy, Z.purple, C.coral][i]} />
            </g>
          ))}
        <Pop t={t} at={at(c, 1.2)} x={0} y={660}>
          <Tag x={0} y={0} text="то же имя — большие и дорогие" size={28} color={C.white} />
        </Pop>
      </g>
      {mind > 0 && (
        <g transform={`translate(${cx} 800) scale(${mind})`}>
          <Tag x={0} y={0} text="Volkswagen в сознании = маленькая машина" size={34} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Закон удлинения линии: шкаф заполняется сам; IBM = «всё» = ничего ──
export const Closet: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const fill = ramp(t, at(c, 1), Math.max(1, at(c, 1.9) - at(c, 1)));
  const ibm = ramp(t, at(c, 2), 0.5);
  const items = 14;
  return (
    <g>
      <g opacity={1 - ibm}>
        <Pop t={t} at={0.2} x={cx} y={190}>
          <Txt x={0} y={0} size={46} weight={900}>
            самый нарушаемый закон
          </Txt>
        </Pop>
        <g transform={`translate(${cx - 200} 0)`}>
          <rect x={-220} y={260} width={440} height={560} rx={16} fill="#c98b4a" stroke={OL} strokeWidth={6} />
          <rect x={-200} y={280} width={400} height={520} rx={10} fill="#f6e3c5" stroke={OL} strokeWidth={4} />
          <Loaf x={0} y={780} s={0.8} />
          {Array.from({ length: items }).map((_, i) => {
            const k = clamp01(fill * items - i);
            if (k <= 0) return null;
            return (
              <g key={i} transform={`translate(${-150 + (i % 4) * 100} ${700 - Math.floor(i / 4) * 110 - (1 - k) * 200}) rotate(${(i * 37) % 30 - 15})`} opacity={k}>
                <rect x={-40} y={-40} width={80} height={80} rx={10} fill={[C.coral, Z.purple, Z.teal, C.green, Z.orange, C.skyDeep][i % 6]} stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
        </g>
        <g transform={`translate(${cx + 330} 0)`}>
          <Txt x={0} y={360} size={32} weight={900}>
            один прибыльный продукт
          </Txt>
          <rect x={-60} y={380} width={120 - 0 * fill} height={30} rx={15} fill={C.green} />
          <Arrow x1={0} y1={440} x2={0} y2={540} k={fill} color={C.coral} w={10} />
          <Txt x={0} y={600} size={32} weight={900} color={fill > 0.6 ? C.red : C.inkSoft}>
            множество — убытки
          </Txt>
        </g>
      </g>
      {ibm > 0 && (
        <g opacity={ibm}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Mainframe x={0} y={640} s={1.4} t={t} color={C.sky} />
            <Tag x={0} y={250} text="раньше: мейнфреймы" size={30} color={C.yellow} />
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + t * 0.5;
              return (
                <g key={i} transform={`translate(${Math.cos(a) * 150} ${520 + Math.sin(a) * 120}) scale(0.4)`}>
                  {i % 2 ? <Computer x={0} y={0} s={1} t={t} /> : <MiniPC x={0} y={0} s={1} t={t} />}
                </g>
              );
            })}
            <Tag x={0} y={250} text="потом: всё сразу" size={30} color={Z.greySoft} />
          </g>
          <Pop t={t} at={at(c, 2.6)} x={cx} y={800}>
            <Tag x={0} y={0} text="всё = ничего" size={44} color={C.coral} textColor="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Соус A-1 для птицы; вкусы 7-Up; «сильным где-то» ──
export const LineSauce: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const poultry = pop(t, at(c, 0.45));
  const flop = ramp(t, at(c, 0.8), 0.5);
  const up = ramp(t, at(c, 1), 0.5);
  const drop = ramp(t, at(c, 1.4), 1);
  const quote = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={1 - up}>
        <g transform={`translate(${cx - 260} 0)`}>
          <Bottle x={0} y={660} s={1.3} color="#5a2a1a" label="A-1" />
          <Tag x={0} y={260} text="соус для стейка" size={30} color={C.yellow} />
        </g>
        {poultry > 0 && (
          <g transform={`translate(${cx + 260} 0)`}>
            <g transform={`translate(0 660) scale(${poultry})`}>
              <Bottle x={0} y={0} s={1.3} color="#c98b4a" label="A-1" />
            </g>
            <Tag x={0} y={260} text="…для птицы?" size={30} color={Z.greySoft} />
            <Cross x={0} y={480} s={150} k={flop} />
            <g opacity={flop}>
              <Txt x={0} y={760} size={28} color={C.inkSoft}>
                18 млн $ рекламы — провал
              </Txt>
            </g>
          </g>
        )}
      </g>
      {up > 0 && (
        <g opacity={up * (1 - quote)}>
          <Txt x={cx} y={200} size={40} weight={900}>
            7-Up: новые вкусы и версии
          </Txt>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${cx - 420 + i * 110} ${600}) scale(${pop(t, at(c, 1.1 + i * 0.1))})`}>
              <Bottle x={0} y={0} s={0.6} color={[C.green, C.yellowDeep, C.red, Z.grey][i]} />
            </g>
          ))}
          <g transform={`translate(${cx + 300} 0)`}>
            <rect x={-80} y={700 - 380 * (1 - drop * (1 - 2.5 / 5.7))} width={160} height={380 * (1 - drop * (1 - 2.5 / 5.7))} rx={12} fill={C.green} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={680 - 380 * (1 - drop * (1 - 2.5 / 5.7))} size={44} weight={900}>
              {`${(5.7 - (5.7 - 2.5) * drop).toFixed(1).replace(".", ",")}%`}
            </Txt>
            <Txt x={0} y={750} size={26} color={C.inkSoft}>
              доля, по данным книги
            </Txt>
          </g>
        </g>
      )}
      {quote > 0 && (
        <g transform={`translate(${cx} 470) scale(${quote})`}>
          <rect x={-460} y={-120} width={920} height={240} rx={40} fill={C.yellow} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={-16} size={46} weight={900}>
            «Лучше быть сильным где-то,
          </Txt>
          <Txt x={0} y={50} size={46} weight={900}>
            чем слабым везде»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет»: соблазн палатки ──
export const BakeryTent: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ideas = ["торты", "пицца", "кофейня", "ужин"];
  const tent = ramp(t, at(c, 1), 0.8);
  const weak = ramp(t, at(c, 1.5), 0.8);
  return (
    <g>
      <g opacity={1 - tent}>
        <Bakery x={cx} y={620} s={0.85} t={t} glow={1} />
        {ideas.map((w, i) => (
          <Pop key={w} t={t} at={at(c, 0.25 + i * 0.18)} x={cx - 420 + i * 280} y={230 + (i % 2) * 70}>
            <Tag x={0} y={0} text={`«Рассвет-${w}»`} size={30} color={[Z.tealSoft, "#ffe0c2", Z.mint, "#f8d7ef"][i]} />
          </Pop>
        ))}
      </g>
      {tent > 0 && (
        <g opacity={tent}>
          <Tent x={cx} y={760} s={1.1} w={0.8 + 1.4 * tent} color={Z.purple} />
          <Txt x={cx} y={200} size={44} weight={900}>
            стратегия-палатка
          </Txt>
          <g transform={`translate(${cx} 360)`}>
            <Txt x={0} y={0} size={70 - 34 * weak} weight={900} color={C.yellowDeep} opacity={1 - weak * 0.6}>
              «утро»
            </Txt>
          </g>
          <Pop t={t} at={at(c, 1.7)} x={cx} y={825}>
            <Tag x={0} y={0} text="шатёр больше — слово слабее" size={30} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Закон жертвоприношения: три жертвы; Emery vs FedEx; игрушки; джемы ──
export const Sacrifice: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const three = ["линейка", "«всем понравиться»", "постоянные перемены"];
  const fx = ramp(t, at(c, 1), 0.5);
  const toys = ramp(t, at(c, 2), 0.5);
  const jam = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - fx}>
        <Pop t={t} at={0.2} x={cx} y={200}>
          <Txt x={0} y={0} size={48} weight={900}>
            чтобы получить — откажитесь
          </Txt>
        </Pop>
        {three.map((w, i) => (
          <Pop key={w} t={t} at={at(c, 0.5 + i * 0.12)} x={cx} y={360 + i * 130}>
            <rect x={-330} y={-50} width={660} height={100} rx={50} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={38} weight={900}>
              {w}
            </Txt>
          </Pop>
        ))}
      </g>
      {fx > 0 && (
        <g opacity={fx * (1 - toys)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Txt x={0} y={220} size={36} weight={900}>
              Emery: всё подряд
            </Txt>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={-150 + (i % 3) * 100} y={300 + Math.floor(i / 3) * 110} width={[60, 90, 70, 100, 50, 80][i]} height={[60, 90, 70, 80, 50, 70][i]} rx={8} fill="#d9a066" stroke={OL} strokeWidth={4} />
            ))}
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Txt x={0} y={220} size={36} weight={900}>
              Federal Express
            </Txt>
            <Plane x={0} y={380 + Math.sin(t * 2) * 8} s={0.9} />
            <rect x={-50} y={460} width={100} height={70} rx={8} fill="#d9a066" stroke={OL} strokeWidth={4} />
            <Tag x={0} y={600} text="только ночные посылки" size={30} color={C.yellow} />
            <Check x={0} y={700} s={50} k={ramp(t, at(c, 1.6), 0.4)} />
          </g>
        </g>
      )}
      {toys > 0 && (
        <g opacity={toys * (1 - jam)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Shop x={0} y={560} s={1.4} label="универмаг Interstate" awning={Z.grey} />
            <Cross x={0} y={460} s={120} k={ramp(t, at(c, 2.2), 0.4)} />
          </g>
          <Arrow x1={cx - 70} y1={460} x2={cx + 90} y2={460} k={ramp(t, at(c, 2.4), 0.4)} color={C.coral} w={12} />
          <g transform={`translate(${cx + 270} 0)`}>
            <Shop x={0} y={560} s={1.4} label="Toys “R” Us" awning={C.coral} glow={ramp(t, at(c, 2.6), 0.5)} />
            <Tag x={0} y={650} text="только игрушки" size={30} color={C.yellow} />
          </g>
        </g>
      )}
      {jam > 0 && (
        <g opacity={jam}>
          <Txt x={cx} y={200} size={40} weight={900}>
            джемы и желе (по данным книги)
          </Txt>
          {[
            { n: "Kraft — всё", v: 9, col: Z.grey },
            { n: "Smucker's — только джемы", v: 35, col: C.coral },
          ].map((b, i) => {
            const k = ramp(t, at(c, 3.2 + i * 0.2), 0.7);
            return (
              <g key={b.n}>
                <Txt x={cx - 500} y={350 + i * 200} size={34} weight={900} anchor="start">
                  {b.n}
                </Txt>
                <rect x={cx - 500} y={375 + i * 200} width={1000} height={70} rx={16} fill={Z.greySoft} />
                <rect x={cx - 500} y={375 + i * 200} width={(1000 * b.v * k) / 40} height={70} rx={16} fill={b.col} stroke={OL} strokeWidth={4} />
                <Txt x={cx - 500 + (1000 * b.v * k) / 40 + 70} y={426 + i * 200} size={38} weight={900}>
                  {`${Math.round(b.v * k)}%`}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── Цель — не рынок; People Express и White Castle ──
export const TargetMarket: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const crowd = ramp(t, at(c, 0.5), 0.8);
  const steady = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={1 - steady}>
        {/* мишень — молодёжь, покупатели — все */}
        <g transform={`translate(${cx - 220} 470)`}>
          {[160, 110, 60].map((r, i) => (
            <circle key={r} r={r} fill={i % 2 ? "#fff" : C.coral} stroke={OL} strokeWidth={5} />
          ))}
          <Dot x={0} y={18} s={1.4} color={Z.teal} />
          <Txt x={0} y={230} size={32} weight={900}>
            цель: молодёжь
          </Txt>
        </g>
        <g transform={`translate(${cx + 300} 0)`} opacity={crowd}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Dot key={i} x={-180 + (i % 4) * 120} y={340 + Math.floor(i / 4) * 130 + wob(t, i, 4)} s={1.2} color={[Z.teal, C.coral, Z.purple, C.green, Z.orange, C.skyDeep][i % 6]} />
          ))}
          <Txt x={0} y={700} size={32} weight={900}>
            покупают все
          </Txt>
        </g>
        <Pop t={t} at={at(c, 1.1)} x={cx} y={815}>
          <Tag x={0} y={0} text="цель ≠ рынок" size={44} color={C.yellow} />
        </Pop>
      </g>
      {steady > 0 && (
        <g opacity={steady}>
          <Txt x={cx} y={200} size={40} weight={900}>
            третья жертва — постоянные перемены
          </Txt>
          <g transform={`translate(${cx - 270} 0)`}>
            <Plane x={0} y={420 - ramp(t, at(c, 2.3), 0.6) * 60 + ramp(t, at(c, 2.6), 1) * 240} s={0.9} rot={ramp(t, at(c, 2.6), 1) * 30} />
            <Txt x={0} y={720} size={32} weight={900}>
              People Express
            </Txt>
            <Txt x={0} y={770} size={26} color={C.inkSoft}>
              «всем всё» — потеряла высоту
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Shop x={0} y={620} s={1.4} label="White Castle" awning={C.skyDeep} />
            <Txt x={0} y={720} size={26} color={C.inkSoft}>
              позиция не меняется
            </Txt>
            <Check x={0} y={350} s={50} k={ramp(t, at(c, 2.8), 0.4)} />
          </g>
        </g>
      )}
    </g>
  );
};

