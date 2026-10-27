// Итоги: ночной блокнот банана (как записи в шатре), семь мыслей дня с двумя кругами,
// одно правило XII книги, «пора и стать им» (X, XI), финал — шатёр и комната рядом.
import React from "react";
import { Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX, NightSky } from "./intro";
import { Big, Hero, OL, OilLamp, QuoteCard, Tent, WaxTablet, Writer } from "./draw";

type VP = VisualProps<{ host?: string }>;

// ── e01: ночь, стол, лампа; блокнот банана — строки с галочками ──
export const NightNotebook: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const qs = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2), 0.5));
  const rows = ["не ответил грубостью", "помог соседке", "признал ошибку", "позвонил бабушке"];
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={R.night} opacity={0.82} />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={(i * 337) % 1920} cy={(i * 97) % 300} r={2} fill="#fff" opacity={0.3 + 0.4 * Math.abs(Math.sin(t + i))} />
      ))}
      <rect x={cx - 520} y={700} width={1040} height={40} rx={12} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
      <OilLamp x={cx - 420} y={700} s={1.2} t={t} glow={1.4} />
      <g transform={`translate(${cx + 40} 450)`}>
        <rect x={-300} y={-230} width={600} height={460} rx={16} fill="#fffaf0" stroke={OL} strokeWidth={6} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line key={i} x1={-260} x2={260} y1={-160 + i * 60} y2={-160 + i * 60} stroke="#d8e4f2" strokeWidth={3} />
        ))}
        <Txt x={0} y={-180} size={30} weight={900} color={C.inkSoft}>
          себе, не для публики
        </Txt>
        {rows.map((r, i) => {
          const a = at(c, 2.1 + i * 0.16);
          const k = clamp01((t - a) / 0.7);
          if (k <= 0) return null;
          return (
            <g key={r} opacity={k}>
              <Check x={-230} y={-110 + i * 80} s={26} k={k} />
              <text x={-190} y={-98 + i * 80} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={34} fill={C.ink} textLength={Math.min(400, r.length * 19) * k} lengthAdjust="spacingAndGlyphs">
                {r}
              </text>
            </g>
          );
        })}
        {t > at(c, 2.8) && (
          <Txt x={0} y={210} size={32} weight={900} color={C.greenDeep} opacity={ramp(t, at(c, 2.8), 0.5)}>
            не идеально — но на шаг вперёд
          </Txt>
        )}
      </g>
      {qs > 0 && (
        <g opacity={qs}>
          <Tag x={cx + 40} y={140} text="не придётся ли пожалеть?" size={32} color={C.yellow} />
          <Tag x={cx + 40} y={200 + 20} text="не обидел ли кого словом или делом?" size={28} color="#fff" />
        </g>
      )}
    </g>
  );
};

// ── e02: семь мыслей — список-лестница; рядом маленькие два круга ──
export const Recap: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    { text: "многое — в моей оценке", at: at(c, 0.4) },
    { text: "не становиться обидчиком", at: at(c, 1.2) },
    { text: "бездействие — тоже выбор", at: at(c, 1.6) },
    { text: "добро без аплодисментов", at: at(c, 2.2) },
    { text: "прекрасное — без похвалы", at: at(c, 2.6) },
    { text: "препятствие укажет путь", at: at(c, 3.1) },
    { text: "у нас есть настоящее", at: at(c, 3.6) },
  ];
  return (
    <g>
      <g transform={`translate(${cx + 360} 220) scale(${pop(t, 0.3) * 0.7})`}>
        <circle r={150} fill="#e7eef8" stroke={R.grey} strokeWidth={6} strokeDasharray="16 10" />
        <circle r={78} fill="#fff6d0" stroke={C.yellowDeep} strokeWidth={8} />
        <Txt x={0} y={14} size={40} weight={900}>
          я
        </Txt>
      </g>
      {items.map((it, i) => {
        const k = pop(t, it.at);
        if (k <= 0) return null;
        const active = t >= it.at && (i === items.length - 1 || t < items[i + 1].at);
        return (
          <g key={i} transform={`translate(${cx - 430 + i * 40 + (1 - k) * 60} ${150 + i * 96})`} opacity={clamp01(k * 1.5)}>
            <Panel x={0} y={0} w={560} h={80} r={40} fill={active ? C.yellow : "#ffffffdd"} />
            <circle cx={40} cy={40} r={28} fill={C.ink} />
            <Txt x={40} y={51} size={30} weight={900} color="#fff">
              {String(i + 1)}
            </Txt>
            <Txt x={86} y={52} size={32} weight={900} anchor="start">
              {it.text}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── e03: два больших правила: «не приличествует — не делай», «ложь — не говори» ──
export const TwoRules: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const a = pop(t, at(c, 0.45));
  const b = pop(t, at(c, 0.75));
  return (
    <g>
      <QuoteCard x={cx} y={120} w={980} k={ramp(t, 0.3, 0.6)} text={"Если это не приличествует, не делай этого,\nесли ложь, не говори."} refText="Книга XII" size={38} />
      {[
        { k: a, x: cx - 260, title: "НЕ ДЕЛАЙ", sub: "если не достойно", color: C.coral },
        { k: b, x: cx + 260, title: "НЕ ГОВОРИ", sub: "если неправда", color: C.skyDeep },
      ].map((r, i) =>
        r.k > 0 ? (
          <g key={i} transform={`translate(${r.x} 560) scale(${r.k})`}>
            <circle r={170} fill={r.color} stroke={OL} strokeWidth={8} />
            <circle r={140} fill="none" stroke="#fff" strokeWidth={6} opacity={0.5} />
            <Txt x={0} y={0} size={44} weight={900} color="#fff">
              {r.title}
            </Txt>
            <Txt x={0} y={52} size={28} color="#fff">
              {r.sub}
            </Txt>
          </g>
        ) : null,
      )}
    </g>
  );
};

// ── e04: «рассуждать» (облако слов) → «стать» (банан делает шаг); учить жизни — сначала себя ──
export const BeGood: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const be = ramp(t, at(c, 0.6), 0.8);
  const teach = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2), 0.5));
  const end = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={(1 - be * 0.7) * (1 - teach)}>
        {["каким должен быть…", "а вот если бы…", "в принципе…", "теоретически…"].map((w, i) => (
          <g key={w} transform={`translate(${cx - 300 + (i % 2) * 320} ${260 + Math.floor(i / 2) * 120 + Math.sin(t * 1.5 + i) * 8})`}>
            <Tag x={0} y={0} text={w} size={28} color="#fff" />
          </g>
        ))}
      </g>
      {be > 0 && teach < 1 && (
        <g opacity={be * (1 - teach) * (1 - end)}>
          <Big x={cx} y={620} text="«пора и стать им»" size={72} serif />
          <Hero x={cx + 380} y={820} s={0.3} t={t} pose="cheer" mood="joy" />
        </g>
      )}
      {teach > 0 && (
        <g opacity={teach}>
          <g transform={`translate(${cx - 220} 470)`}>
            <rect x={-200} y={-140} width={400} height={280} rx={14} fill={R.olive} stroke={OL} strokeWidth={6} />
            <Txt x={0} y={-30} size={60} weight={900} color="#fff">
              А Б В
            </Txt>
            <Txt x={0} y={60} size={36} weight={900} color="#fff">
              жизнь?
            </Txt>
          </g>
          <g transform={`translate(${cx + 260} 470)`}>
            <Txt x={0} y={-20} size={40} weight={900}>
              сначала —
            </Txt>
            <Txt x={0} y={40} size={40} weight={900} color={C.greenDeep}>
              научиться самому
            </Txt>
          </g>
        </g>
      )}
      {end > 0 && (
        <g transform={`translate(${cx} 470) scale(${end})`}>
          <Panel x={-380} y={-60} w={760} h={120} r={60} fill={C.yellow} />
          <Txt x={0} y={16} size={44} weight={900}>
            совет и для нас
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── e05: разделённый кадр — шатёр с лампой и комната с блокнотом; логотип BanaMind ──
export const Finale: React.FC<VP> = (c) => {
  const { t } = c;
  const split = ramp(t, 0.2, 1.2);
  const brand = ramp(t, at(c, 2), 0.8);
  return (
    <g>
      <g opacity={split}>
        <clipPath id="med-fin-l">
          <rect x={0} y={0} width={960} height={1080} />
        </clipPath>
        <g clipPath="url(#med-fin-l)">
          <NightSky t={t} />
          <Tent x={480} y={760} s={1.1} open={1} glow={0.75} />
          <g transform="translate(480 750) scale(0.42)">
            <Writer x={-40} y={0} t={t} />
            <OilLamp x={170} y={-110} s={0.8} t={t} />
            <WaxTablet x={210} y={-60} s={0.32} k={1} />
          </g>
          <Txt x={480} y={180} size={40} weight={900} color="#fff3c4">
            шатёр на Дунае
          </Txt>
        </g>
        <rect x={960} y={0} width={960} height={1080} fill="#2b3a62" />
        <rect x={1060} y={680} width={760} height={30} rx={10} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
        <OilLamp x={1160} y={680} s={1} t={t + 1} />
        <g transform="translate(1500 600) rotate(-4)">
          <rect x={-150} y={-90} width={300} height={180} rx={10} fill="#fffaf0" stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-120} x2={110 - i * 30} y1={-40 + i * 40} y2={-40 + i * 40} stroke={C.inkSoft} strokeWidth={5} />
          ))}
        </g>
        <Txt x={1440} y={180} size={40} weight={900} color="#fff3c4">
          ваша комната
        </Txt>
        <line x1={960} y1={0} x2={960} y2={1080} stroke={C.yellow} strokeWidth={8} />
      </g>
      {brand > 0 && (
        <g opacity={brand}>
          <rect x={0} y={0} width={1920} height={1080} fill="#fff6da" opacity={0.92 * brand} />
          <Big x={760} y={420} text="BanaMind" size={120} k={brand} />
          <Txt x={760} y={500} size={44} weight={900} color={C.inkSoft}>
            Большие идеи — простыми словами
          </Txt>
          <Pop t={t} at={at(c, 2.2)} x={760} y={600}>
            <Tag x={0} y={0} text="Марк Аврелий · «Наедине с собой»" size={34} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};
