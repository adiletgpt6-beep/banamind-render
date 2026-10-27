// Итоги: снова двое часов (теперь с объяснением), четыре полки знания,
// «чем сильнее объяснение, тем яснее граница незнания», прощание BanaMind.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT } from "../theme";
import { Pop, Tag, Txt, at, pop, ramp, type VisualProps } from "./kit";
import { Clock, Earth, Galaxy, Spark, Stage } from "./space";

// ── z01: часы и их собственные пути в пространстве-времени ──
export const ClocksAgain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const paths = ramp(t, at(c, 1), 1.6);
  const ok = pop(t, at(c, 2));
  return (
    <Stage host={c.p.host}>
      <Earth x={330} y={1000} r={300} t={t * 0.2} />
      <Pop t={t} at={0.3} x={330} y={620}>
        <Clock x={0} y={0} r={70} phase={t * 0.4} color={C.sky} />
      </Pop>
      <Pop t={t} at={0.5} x={330} y={300}>
        <Clock x={0} y={0} r={70} phase={t * 0.4 + 0.08} color={C.yellow} />
      </Pop>
      {paths > 0 && (
        <g transform="translate(700 760)" opacity={paths}>
          <line x1={0} y1={0} x2={0} y2={-560} stroke={C.dim} strokeWidth={3} />
          <path d={`M 120 0 C 120 -200 ${140 + 40 * paths} -400 120 -${520 * paths}`} fill="none" stroke={C.sky} strokeWidth={8} />
          <path d={`M 360 0 C 380 -200 ${400 - 40 * paths} -400 360 -${560 * paths}`} fill="none" stroke={C.yellow} strokeWidth={8} />
          <Txt x={240} y={60} size={26} color={C.dim}>
            у каждых часов — свой путь
          </Txt>
          <Txt x={-20} y={-575} size={24} color={C.dim}>
            время ↑
          </Txt>
        </g>
      )}
      {ok > 0 && (
        <g transform={`translate(940 140) scale(${ok})`}>
          <Tag x={0} y={0} text="не ошибка — так устроен мир" color={C.yellow} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── z02: четыре полки ──
export const Shelves: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const S = [
    { title: "наблюдение", items: "часы на башне · красное смещение · реликтовый свет · волны", col: C.green, at: at(c, 1) },
    { title: "модель", items: "большой взрыв · горизонт · сингулярность", col: C.violetDeep, at: at(c, 2) },
    { title: "гипотеза", items: "излучение Хокинга · инфляция · струны · без края", col: C.pink, at: at(c, 2.5) },
    { title: "философия", items: "смысл · вопрос о Творце", col: C.coral, at: at(c, 3) },
  ];
  return (
    <Stage host={c.p.host}>
      {S.map((s, i) => {
        const k = ramp(t, s.at, 0.7);
        const y = 210 + i * 170;
        return (
          <g key={s.title}>
            <rect x={40} y={y + 50} width={1200} height={16} rx={6} fill="#3a4a86" />
            {k > 0 && (
              <g opacity={k} transform={`translate(${60 + (1 - k) * 60} ${y})`}>
                <rect x={0} y={-40} width={260} height={84} rx={18} fill={s.col} />
                <Txt x={130} y={14} size={32} color={C.white}>
                  {s.title}
                </Txt>
                <Txt x={300} y={12} size={26} color={C.text} anchor="start">
                  {s.items}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
    </Stage>
  );
};

// ── z03: свет знания расширяется — и граница незнания становится длиннее ──
export const Finale: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const grow = ramp(t, at(c, 1), 2.4);
  const inv = pop(t, at(c, 2));
  const R = 110 + grow * 120;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={180}>
        <Txt x={0} y={0} size={30} color={C.dim}>
          мечта Хокинга — понять, почему существуем мы и Вселенная
        </Txt>
      </Pop>
      <g transform="translate(470 520)">
        <circle r={R + 60} fill="none" stroke={C.pink} strokeWidth={3} strokeDasharray="10 12" opacity={grow} />
        <circle r={R} fill="rgba(255,210,63,0.16)" stroke={C.yellow} strokeWidth={5} />
        <Galaxy x={0} y={0} s={0.6} t={t} color={C.yellow} />
        <Txt x={0} y={R * 0.55} size={28} color={C.yellow}>
          знаем
        </Txt>
        <Txt x={0} y={R + 100} size={26} color={C.pink} opacity={grow}>
          граница незнания длиннее
        </Txt>
      </g>
      {inv > 0 && (
        <g transform={`translate(1030 520) scale(${inv})`}>
          <Clock x={-70} y={-40} r={50} phase={t * 0.4} color={C.sky} />
          <Clock x={70} y={-40} r={50} phase={t * 0.4 + 0.08} color={C.yellow} />
          <Txt x={0} y={70} size={30}>
            не растерянность —
          </Txt>
          <Txt x={0} y={115} size={30} color={C.yellow}>
            приглашение думать
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── z04: финальная заставка BanaMind ──
export const Outro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const logo = pop(t, 0.3);
  const sub = ramp(t, 0.9, 0.8);
  return (
    <g>
      {logo > 0 && (
        <g transform={`translate(1230 430) scale(${logo})`}>
          <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={120}>
            <tspan fill={C.white}>{BRAND.wordmark[0]}</tspan>
            <tspan fill={BRAND.yellow}>{BRAND.wordmark[1]}</tspan>
          </text>
          <Txt x={0} y={80} size={40} color={C.dim} opacity={sub}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Spark key={i} x={800 + i * 170} y={230 + Math.sin(t * 2 + i) * 20} r={14} color={i % 2 ? C.yellow : C.white} o={sub * 0.7} />
      ))}
    </g>
  );
};
