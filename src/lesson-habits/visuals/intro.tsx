// Вступление: кубик льда и порог, три вопроса о привычках, «трейлер» разбора,
// ведущий, автор и книга.
import React from "react";
import { C, FONT } from "../theme";
import { Heart, OL, Sprout } from "./draw";
import { Arrow, Check, Cross, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Card, Chip, Icon, IceCube, IconTile, Thermometer, WeekStrip, zoneX, type IconName } from "./parts";

// значок атома (символ книги в нашем оформлении)
export const AtomIcon: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = C.skyDeep }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 60, 120].map((r, i) => (
      <ellipse key={i} rx={90} ry={32} fill="none" stroke={color} strokeWidth={8} transform={`rotate(${r + t * 12})`} />
    ))}
    <circle r={22} fill={C.yellow} stroke={OL} strokeWidth={5} />
    {[0, 1, 2].map((i) => {
      const a = t * 2.2 + (i * Math.PI * 2) / 3;
      const rot = ((i * 60 + t * 12) * Math.PI) / 180;
      const ex = Math.cos(a) * 90;
      const ey = Math.sin(a) * 32;
      return <circle key={i} cx={ex * Math.cos(rot) - ey * Math.sin(rot)} cy={ex * Math.sin(rot) + ey * Math.cos(rot)} r={11} fill={C.coral} stroke={OL} strokeWidth={3} />;
    })}
  </g>
);

// своя простая обложка «Атомные привычки» (не копия оригинального дизайна)
export const HabitsBook: React.FC<{ x: number; y: number; s?: number; t: number; rot?: number }> = ({ x, y, s = 1, t, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-150} y={-210} width={300} height={420} rx={18} fill="#173a5e" stroke={OL} strokeWidth={6} />
    <rect x={-136} y={-210} width={16} height={420} fill="#000" opacity={0.2} />
    <AtomIcon x={10} y={-90} s={0.95} t={t} color="#7fd8ff" />
    <text x={10} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">
      АТОМНЫЕ
    </text>
    <text x={10} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.yellow}>
      ПРИВЫЧКИ
    </text>
    <text x={10} y={160} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={28} fill="#bfe0fb">
      Джеймс Клир
    </text>
  </g>
);

export const IceCubeScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const room = pop(t, 0.15);
  const warm = ramp(t, at(c, 0.25), Math.max(0.6, at(c, 0.95) - at(c, 0.25)));
  const zero = ramp(t, at(c, 1.4), 0.5);
  const melt = ramp(t, at(c, 1.5), 2.2);
  const steps = ramp(t, at(c, 2), 0.8);
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <g>
      {/* холодная комната: пар изо рта и снежинки */}
      {Array.from({ length: 10 }).map((_, i) => {
        const ph = (t * 0.12 + i * 0.1) % 1;
        return (
          <g key={i} opacity={0.8 * (1 - zero)}>
            <Icon name="snow" x={180 + ((i * 197) % 1100)} y={140 + ph * 600} s={1.2} />
          </g>
        );
      })}
      <g opacity={clamp01(room * 2)}>
        <Thermometer x={cx - 420} y={720} s={1.05} level={0.15 + 0.55 * warm + 0.12 * zero} hot={zero} />
        <g transform={`translate(${cx - 420} 280)`}>
          <Chip x={0} y={0} text={zero > 0.5 ? "0 °C" : "−4 °C"} size={40} color={zero > 0.5 ? C.yellow : "#dff4ff"} />
        </g>
        {/* стол */}
        <rect x={cx - 230} y={720} width={520} height={30} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
        <IceCube x={cx + 30} y={720} s={1.2} melt={melt} t={t} />
        {zero > 0 && <circle cx={cx + 30} cy={580} r={180 + 40 * glow} fill={C.yellow} opacity={0.18 * zero} />}
      </g>
      {/* шкала шагов: все одинаковые, последний — заметный */}
      {steps > 0 && (
        <g transform={`translate(${cx - 300} 820)`} opacity={steps}>
          {Array.from({ length: 9 }).map((_, i) => (
            <rect key={i} x={i * 74} y={-30} width={62} height={44} rx={10} fill={i === 8 ? C.yellow : "#dff4ff"} stroke={OL} strokeWidth={3} opacity={clamp01(steps * 9 - i)} />
          ))}
        </g>
      )}
    </g>
  );
};

export const Teaser: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const k1 = pop(t, at(c, 0) + 0.1);
  const k2 = pop(t, at(c, 1));
  const k3 = pop(t, at(c, 2));
  const fade1 = 1 - 0.45 * clamp01(k2);
  const fade2 = 1 - 0.45 * clamp01(k3);
  return (
    <g>
      {/* 1: полезное три дня, вредное — годами */}
      <g transform={`translate(${cx - 380} 450) scale(${k1})`} opacity={fade1}>
        <Card x={0} y={0} w={330} h={420} title="3 дня" color={C.sky}>
          {[0, 1, 2].map((i) => (
            <Check key={i} x={-90 + i * 90} y={-40} s={36} k={clamp01((t - at(c, 0) - 0.4 - i * 0.25) * 3)} />
          ))}
          <Sprout x={0} y={150} s={1} grow={0.5 - 0.3 * ramp(t, at(c, 0.6), 0.6)} t={t} />
        </Card>
      </g>
      {/* 2: сила воли? */}
      <g transform={`translate(${cx} 450) scale(${k2})`} opacity={fade2}>
        <Card x={0} y={0} w={330} h={420} title="сила воли?" color={C.coral}>
          <path d="M -70 60 Q -70 -40 0 -60 Q 70 -40 60 20" fill="none" stroke={OL} strokeWidth={26} strokeLinecap="round" />
          <circle cx={0} cy={-70} r={46} fill="#f2c79b" stroke={OL} strokeWidth={5} />
          <Txt x={90} y={-60} size={90} weight={900} color={C.red}>
            ?
          </Txt>
        </Card>
      </g>
      {/* 3: маленький шаг против рывка */}
      <g transform={`translate(${cx + 380} 450) scale(${k3})`}>
        <Card x={0} y={0} w={330} h={420} title="шаг или рывок" color={C.green}>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-120 + i * 60} y={110 - i * 50} width={60} height={50 + i * 50} fill={i <= Math.floor(ramp(t, at(c, 2.3), 1.2) * 4) ? C.green : "#e9eef5"} stroke={OL} strokeWidth={3} />
          ))}
          <Arrow x1={-110} y1={-80} x2={110} y2={-110} k={ramp(t, at(c, 2.2), 0.6)} color={C.red} w={8} bend={-0.4} />
        </Card>
      </g>
    </g>
  );
};

export const Trailer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const book = pop(t, at(c, 0) + 0.1);
  const items = ["системы", "4 закона", "обратная сторона"];
  const plan = pop(t, at(c, 2));
  return (
    <g>
      <g transform={`translate(${cx - 360} ${470 + wob(t, 1, 6)}) scale(${book}) rotate(${-5 + wob(t, 2, 1.5)})`}>
        <HabitsBook x={0} y={0} t={t} />
      </g>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${cx + 180} ${260 + i * 130})`}>
          <Chip x={0} y={0} text={it} size={44} color={[C.yellow, C.sky, C.pink][i]} k={pop(t, at(c, 1) + i * 0.55)} />
        </g>
      ))}
      {plan > 0 && (
        <g transform={`translate(${cx + 180} 720) scale(${plan * 0.55})`}>
          <WeekStrip x={0} y={0} shown={7} done={[true, true, true, true, true, true, true]} />
        </g>
      )}
      <Pop t={t} at={at(c, 2.4)} x={cx + 180} y={820}>
        <Tag x={0} y={0} text="план на 7 дней" size={36} color={C.yellow} />
      </Pop>
    </g>
  );
};

export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const mark = pop(t, 0.2);
  const story = ramp(t, at(c, 1), 0.6);
  const steps = ramp(t, at(c, 2), 0.6);
  const manual = ramp(t, at(c, 3), 0.6);
  const pick = ramp(t, at(c, 4), 0.6);
  const icons: IconName[] = ["moon", "broom", "book", "dumbbell"];
  const sciences = ["психология", "биология", "неврология", "философия"];
  const s1 = 1 - manual;
  return (
    <g>
      {/* знак канала */}
      <g transform={`translate(${cx} 190) scale(${mark * (1 - 0.35 * story)})`} opacity={1 - 0.5 * pick}>
        <text x={0} y={0} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={110}>
          <tspan fill={C.ink}>Bana</tspan>
          <tspan fill="#e09a00">Mind</tspan>
        </text>
        <Txt x={0} y={58} size={34} weight={800} color={C.inkSoft}>
          Big Ideas. Simply Explained.
        </Txt>
      </g>
      {/* история автора: мяч, повязка → маленькие шаги */}
      {story > 0 && s1 > 0 && (
        <g opacity={story * s1}>
          <g transform={`translate(${cx - 360} 560)`}>
            <circle r={90} fill="#fff" stroke={OL} strokeWidth={6} />
            <path d="M -60 -60 Q -20 0 -60 60 M 60 -60 Q 20 0 60 60" stroke={C.red} strokeWidth={6} fill="none" strokeDasharray="12 8" />
            <g transform="translate(70 -80)">
              <rect x={-34} y={-34} width={68} height={68} rx={12} fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M -8 -22 L 8 -22 L 8 -8 L 22 -8 L 22 8 L 8 8 L 8 22 L -8 22 L -8 8 L -22 8 L -22 -8 L -8 -8 Z" fill={C.red} />
            </g>
            <Tag x={0} y={160} text="травма" size={32} color="#dfe3ea" />
          </g>
          {steps > 0 &&
            icons.map((ic, i) => {
              const k = pop(t, at(c, 2) + 0.3 + i * 0.35);
              return (
                <IconTile key={i} name={ic} x={cx - 120 + i * 170} y={640 - i * 70} k={k} />
              );
            })}
          {steps > 0 && <Arrow x1={cx - 230} y1={700} x2={cx + 420} y2={380} k={ramp(t, at(c, 2.4), 1)} color={C.green} w={9} bend={0.15} />}
        </g>
      )}
      {/* практическая инструкция из разных наук */}
      {manual > 0 && (
        <g opacity={manual * (1 - pick)}>
          <HabitsBook x={cx - 330} y={560} s={0.9} t={t} rot={-4} />
          <g transform={`translate(${cx - 330} 290)`}>
            <Tag x={0} y={0} text="инструкция" size={34} color={C.yellow} />
          </g>
          {sciences.map((s, i) => (
            <g key={i}>
              <Chip x={cx + 230} y={380 + i * 100} text={s} size={34} color={[C.sky, C.green, C.pink, C.violet][i]} textColor={i === 3 ? "#fff" : C.ink} k={pop(t, at(c, 3.3) + i * 0.2)} />
              <Arrow x1={cx + 60} y1={380 + i * 100} x2={cx - 150} y2={500 + i * 20} k={ramp(t, at(c, 3.4) + i * 0.2, 0.5)} color={C.inkSoft} w={5} />
            </g>
          ))}
        </g>
      )}
      {pick > 0 && (
        <g opacity={pick}>
          <g transform={`translate(${cx - 230} 620)`}>
            <rect x={-170} y={-70} width={340} height={140} rx={24} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={40}>
              20 глав подряд
            </Txt>
            <Cross x={0} y={0} s={120} k={ramp(t, at(c, 4.2), 0.5)} />
          </g>
          <g transform={`translate(${cx + 230} 620) scale(${pop(t, at(c, 4.4))})`}>
            <rect x={-170} y={-70} width={340} height={140} rx={24} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
            <Txt x={-20} y={14} size={40}>
              самое полезное
            </Txt>
            <Heart x={140} y={-60} s={1.2} color={C.coral} />
          </g>
          <Arrow x1={cx - 40} y1={620} x2={cx + 40} y2={620} k={ramp(t, at(c, 4.3), 0.4)} color={C.green} w={10} />
        </g>
      )}
    </g>
  );
};
