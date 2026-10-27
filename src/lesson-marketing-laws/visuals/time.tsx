// Часть «Время и честность» (законы 11, 15, 16): краткосрочный и долгосрочный
// эффект (распродажи, купоны, расширение линии), вечная акция «Рассвета»,
// признание минуса, честная вывеска «Рассвета», один смелый ход.
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, FONT, Z } from "../theme";
import { Car, OL } from "./draw";
import { Bakery, Bottle, Clock, Loaf, Mainframe } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

// график: ломаная по точкам 0…1, рисуется слева направо
const Graph: React.FC<{ x: number; y: number; w: number; h: number; pts: number[]; k: number; color: string; label?: string }> = ({ x, y, w, h, pts, k, color, label }) => {
  const n = pts.length - 1;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${x + (w * i) / n} ${y + h - h * v}`).join(" ");
  const len = w * 2.2;
  return (
    <g>
      <line x1={x} x2={x + w} y1={y + h} y2={y + h} stroke={OL} strokeWidth={4} />
      <line x1={x} x2={x} y1={y} y2={y + h} stroke={OL} strokeWidth={4} />
      <path d={d} fill="none" stroke={color} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - clamp01(k))} />
      {label && (
        <text x={x + w} y={y + h + 40} fontFamily={FONT} fontWeight={800} fontSize={26} textAnchor="end" fill={C.inkSoft}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── Закон перспективы ──
export const SaleYoyo: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const g1 = ramp(t, at(c, 0.4), 1.6);
  const sale = ramp(t, at(c, 1), 0.5);
  const coupon = ramp(t, at(c, 2), 0.5);
  const line = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - sale}>
        <Pop t={t} at={0.2} x={cx} y={190}>
          <Txt x={0} y={0} size={44} weight={900}>
            сегодня ≠ через годы
          </Txt>
        </Pop>
        <Graph x={cx - 450} y={290} w={900} h={420} pts={[0.3, 0.85, 0.6, 0.45, 0.32, 0.2, 0.12]} k={g1} color={C.coral} label="время →" />
        <Pop t={t} at={at(c, 0.5)} x={cx - 230} y={320}>
          <Tag x={0} y={0} text="краткосрочно: рост" size={28} color={Z.mint} />
        </Pop>
        <Pop t={t} at={at(c, 0.8)} x={cx + 250} y={560}>
          <Tag x={0} y={0} text="долгосрочно: наоборот" size={28} color={Z.greySoft} />
        </Pop>
      </g>
      {sale > 0 && (
        <g opacity={sale * (1 - coupon)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${cx - 440 + i * 220} ${470 + wob(t, i, 5)}) scale(${pop(t, at(c, 1.05 + i * 0.08))})`}>
              <rect x={-90} y={-130} width={180} height={260} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
              <rect x={-80} y={-40} width={160} height={70} rx={8} fill={C.red} />
              <text y={10} fontFamily={FONT} fontWeight={900} fontSize={26} textAnchor="middle" fill="#fff">
                СКИДКА
              </text>
            </g>
          ))}
          <Pop t={t} at={at(c, 1.5)} x={cx} y={760}>
            <Tag x={0} y={0} text="приучает ждать скидку" size={36} color={C.yellow} />
          </Pop>
        </g>
      )}
      {coupon > 0 && (
        <g opacity={coupon * (1 - line)}>
          <g transform={`translate(${cx - 260} 0)`}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${(i - 1) * 40} ${430 + i * 30}) rotate(${-10 + i * 10})`}>
                <rect x={-140} y={-70} width={280} height={140} rx={10} fill="#fff7d6" stroke={OL} strokeWidth={4} strokeDasharray="12 8" />
                <Txt x={0} y={14} size={34} weight={900} color={C.coral}>
                  купон
                </Txt>
              </g>
            ))}
            <Txt x={0} y={680} size={28} color={C.inkSoft}>
              чтобы продажи не упали
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Panel x={-230} y={300} w={460} h={300} fill={C.yellow} />
            <Txt x={0} y={420} size={36} weight={900}>
              «каждый день
            </Txt>
            <Txt x={0} y={480} size={36} weight={900}>
              низкие цены»
            </Txt>
          </g>
        </g>
      )}
      {line > 0 && (
        <g opacity={line}>
          <Txt x={cx} y={200} size={40} weight={900}>
            расширение линейки
          </Txt>
          <Graph x={cx - 450} y={280} w={900} h={420} pts={[0.2, 0.5, 0.85, 0.7, 0.5, 0.35, 0.22]} k={ramp(t, at(c, 3.1), 1.4)} color={Z.purple} label="годы →" />
          <g transform={`translate(${cx + 330} 300)`} opacity={ramp(t, at(c, 3.5), 0.4)}>
            <rect x={-110} y={-50} width={220} height={100} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-8} size={24} weight={900}>
              квартальный
            </Txt>
            <Txt x={0} y={26} size={24} weight={900}>
              отчёт
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет»: вечная акция по понедельникам ──
export const BakeryDiscount: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const later = ramp(t, at(c, 0.6), 0.8);
  const note = ramp(t, at(c, 1), 0.5);
  const days = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
  return (
    <g>
      <Pop t={t} at={0.2} x={cx} y={190}>
        <Tag x={0} y={0} text="«по понедельникам — полцены»" size={36} color={C.yellow} />
      </Pop>
      {days.map((d, i) => {
        const h = i === 0 ? 300 : 300 - 230 * later;
        return (
          <g key={d}>
            <rect x={cx - 455 + i * 130} y={720 - h} width={100} height={h} rx={10} fill={i === 0 ? C.coral : Z.tealSoft} stroke={OL} strokeWidth={4} />
            <Txt x={cx - 405 + i * 130} y={760} size={30} weight={900}>
              {d}
            </Txt>
          </g>
        );
      })}
      <g opacity={later}>
        <Txt x={cx + 200} y={330} size={32} weight={900} color={C.inkSoft}>
          через полгода: ждут понедельника
        </Txt>
      </g>
      {note > 0 && (
        <g transform={`translate(${cx} 830) scale(${note})`}>
          <Tag x={0} y={0} text="учебный пример, не прогноз" size={28} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Закон искренности ──
export const Candor: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const why = ramp(t, at(c, 1), 0.5);
  const ex = ramp(t, at(c, 2), 0.5);
  const rules = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - why}>
        <Pop t={t} at={0.2} x={cx} y={300}>
          <Txt x={0} y={0} size={52} weight={900}>
            признайте минус —
          </Txt>
          <Txt x={0} y={72} size={52} weight={900} color={C.green}>
            поверят в плюс
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 0.5)} x={cx - 200} y={600}>
          <circle r={70} fill={C.coral} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={22} size={72} weight={900} color="#fff">
            −
          </Txt>
        </Pop>
        <Arrow x1={cx - 100} y1={600} x2={cx + 100} y2={600} k={ramp(t, at(c, 0.6), 0.5)} color={C.ink} w={10} />
        <Pop t={t} at={at(c, 0.75)} x={cx + 200} y={600}>
          <circle r={70} fill={C.green} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={24} size={72} weight={900} color="#fff">
            +
          </Txt>
        </Pop>
      </g>
      {why > 0 && (
        <g opacity={why * (1 - ex)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Panel x={-230} y={260} w={460} h={300} fill="#fff" />
            <Txt x={0} y={360} size={36} weight={900}>
              «Мы лучшие!»
            </Txt>
            <Txt x={0} y={430} size={30} color={C.inkSoft}>
              нужно доказывать
            </Txt>
            <Txt x={0} y={520} size={60} weight={900} color={Z.grey}>
              ?
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Panel x={-230} y={260} w={460} h={300} fill={C.yellow} />
            <Txt x={0} y={360} size={36} weight={900}>
              «У нас есть минус»
            </Txt>
            <Txt x={0} y={430} size={30} color={C.inkSoft}>
              сразу верят
            </Txt>
            <Check x={0} y={500} s={50} k={ramp(t, at(c, 1.6), 0.4)} />
          </g>
        </g>
      )}
      {ex > 0 && (
        <g opacity={ex * (1 - rules)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <g transform={`translate(0 ${560 + wob(t, 1, 4)})`}>
              <rect x={-90} y={-130} width={180} height={190} rx={20} fill="#c4462f" stroke={OL} strokeWidth={5} />
              <rect x={-100} y={-160} width={200} height={40} rx={10} fill="#e2a35a" stroke={OL} strokeWidth={4} />
              <rect x={-70} y={-70} width={140} height={60} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-30} size={22} weight={900}>
                Smucker's
              </Txt>
            </g>
            <Txt x={0} y={300} size={28} weight={900}>
              «С таким именем
            </Txt>
            <Txt x={0} y={340} size={28} weight={900}>
              он должен быть хорошим»
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Bottle x={0} y={660} s={1.1} color="#c9a227" label="Listerine" />
            <Txt x={0} y={300} size={28} weight={900}>
              «Вкус, который вы
            </Txt>
            <Txt x={0} y={340} size={28} weight={900}>
              ненавидите дважды в день»
            </Txt>
            <Pop t={t} at={at(c, 2.6)} x={0} y={420}>
              <Tag x={0} y={0} text="→ убивает микробы" size={28} color={Z.mint} />
            </Pop>
          </g>
        </g>
      )}
      {rules > 0 && (
        <g opacity={rules}>
          {["минус очевиден покупателю", "быстро — к пользе", "цель — ценность, не извинение"].map((w, i) => (
            <Pop key={w} t={t} at={at(c, 3.05 + i * 0.2)} x={cx} y={260 + i * 130}>
              <rect x={-400} y={-50} width={800} height={100} rx={50} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={36} weight={900}>
                {w}
              </Txt>
            </Pop>
          ))}
          <Pop t={t} at={at(c, 3.8)} x={cx} y={710}>
            <Tag x={0} y={0} text="честность — лучшая политика" size={42} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет» говорит правду ──
export const BakeryCandor: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const sign = ramp(t, 0.3, 0.6);
  const both = ramp(t, at(c, 1), 0.5);
  return (
    <g>
      <Bakery x={cx - 280} y={760} s={0.75} t={t} />
      <g transform={`translate(${cx + 230} 360) rotate(${wob(t, 2, 1.5)})`} opacity={sign}>
        <rect x={-300} y={-170} width={600} height={340} rx={20} fill="#2f3b2f" stroke={C.brown} strokeWidth={14} />
        <text x={0} y={-90} fontFamily={FONT} fontWeight={800} fontSize={34} textAnchor="middle" fill="#fff">
          Нет тортов и витрины
        </text>
        <text x={0} y={-44} fontFamily={FONT} fontWeight={800} fontSize={34} textAnchor="middle" fill="#fff">
          на сто позиций.
        </text>
        <text x={0} y={22} fontFamily={FONT} fontWeight={800} fontSize={34} textAnchor="middle" fill={C.yellow}>
          Встаём в 4 утра —
        </text>
        <text x={0} y={68} fontFamily={FONT} fontWeight={800} fontSize={34} textAnchor="middle" fill={C.yellow}>
          хлеб горячий к 7:00
        </text>
      </g>
      <Clock x={cx + 450} y={640} s={0.7} h={4} m={0} />
      {both > 0 && (
        <g opacity={both}>
          <Pop t={t} at={at(c, 1.05)} x={cx + 60} y={700}>
            <Tag x={0} y={0} text="минус — настоящий" size={30} color={Z.greySoft} />
          </Pop>
          <Pop t={t} at={at(c, 1.3)} x={cx + 120} y={800}>
            <Tag x={0} y={0} text="польза — настоящая" size={30} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Закон сингулярности: один ход; фланги GM; «настоящая вещь» ──
export const OneMove: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const harder = ramp(t, at(c, 1), 0.5);
  const gm = ramp(t, at(c, 2), 0.5);
  const coke = ramp(t, at(c, 3), 0.5);
  const front = ramp(t, at(c, 4), 0.5);
  return (
    <g>
      <g opacity={1 - harder}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} opacity={i === 2 ? 1 : 0.35}>
            <Arrow x1={cx - 400} y1={260 + i * 110} x2={cx + (i === 2 ? 420 : 100 + (i % 2) * 80)} y2={260 + i * 110} k={ramp(t, 0.2 + i * 0.1, 0.8)} color={i === 2 ? C.coral : Z.grey} w={i === 2 ? 16 : 8} />
          </g>
        ))}
        <Pop t={t} at={at(c, 0.5)} x={cx} y={830}>
          <Tag x={0} y={0} text="один ход — существенный результат" size={32} color={C.yellow} />
        </Pop>
      </g>
      {harder > 0 && (
        <g opacity={harder * (1 - gm)}>
          {[0, 1].map((i) => (
            <g key={i}>
              <Txt x={cx - 250 + i * 500} y={260} size={34} weight={900}>
                {i ? "вы, чуть усерднее" : "лидер"}
              </Txt>
              <rect x={cx - 400 + i * 500} y={320} width={300} height={360} rx={16} fill={i ? Z.tealSoft : C.yellow} stroke={OL} strokeWidth={5} />
              <rect x={cx - 400 + i * 500} y={320} width={300} height={(i ? 22 : 0) + 6 * Math.sin(t * 3) * i} fill={C.green} opacity={0.6} />
            </g>
          ))}
          <Pop t={t} at={at(c, 1.5)} x={cx} y={760}>
            <Tag x={0} y={0} text="разница почти незаметна" size={32} color={C.white} />
          </Pop>
        </g>
      )}
      {gm > 0 && (
        <g opacity={gm * (1 - coke)}>
          <Txt x={cx} y={200} size={40} weight={900}>
            General Motors: удары с флангов
          </Txt>
          <rect x={cx - 200} y={340} width={400} height={300} rx={20} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          <Car x={cx} y={540} s={0.9} t={0} color={Z.grey} />
          <Txt x={cx} y={620} size={28} weight={900}>
            середина рынка
          </Txt>
          <g transform={`translate(${cx - 420 + 80 * ramp(t, at(c, 2.3), 0.8)} 520)`}>
            <Car x={0} y={0} s={0.45} t={t} color={C.coral} />
            <Txt x={0} y={60} size={26} weight={900}>
              маленькие
            </Txt>
          </g>
          <g transform={`translate(${cx + 420 - 80 * ramp(t, at(c, 2.5), 0.8)} 520)`}>
            <Car x={0} y={0} s={0.7} t={t} color={C.ink} />
            <Txt x={0} y={60} size={26} weight={900}>
              очень дорогие
            </Txt>
          </g>
        </g>
      )}
      {coke > 0 && (
        <g opacity={coke * (1 - front)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Bottle x={0} y={640} s={1.1} color="#7a3b22" label="новая" />
            <Cross x={0} y={480} s={130} k={ramp(t, at(c, 3.3), 0.4)} />
            <Txt x={0} y={260} size={30} weight={900}>
              шаг назад
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Bottle x={0} y={640} s={1.25} color="#7a3b22" label="Classic" />
            <Txt x={0} y={260} size={30} weight={900}>
              шаг вперёд
            </Txt>
            <Pop t={t} at={at(c, 3.6)} x={0} y={330}>
              <Tag x={0} y={0} text="«настоящая вещь»" size={34} color={C.yellow} />
            </Pop>
          </g>
        </g>
      )}
      {front > 0 && (
        <g opacity={front}>
          <g transform={`translate(${cx - 300} 0)`}>
            <Mainframe x={0} y={640} s={1} t={t} color={Z.greySoft} />
            <Txt x={0} y={700} size={28} weight={900}>
              штаб-квартира
            </Txt>
          </g>
          <Arrow x1={cx - 150} y1={480} x2={cx + 120} y2={480} k={ramp(t, at(c, 4.2), 0.6)} color={C.coral} w={14} />
          <g transform={`translate(${cx + 300} 0)`}>
            <Loaf x={-60} y={560} s={0.6} />
            <Car x={70} y={600} s={0.5} t={t} color={C.coral} />
            <Txt x={0} y={700} size={28} weight={900}>
              рынок
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};
