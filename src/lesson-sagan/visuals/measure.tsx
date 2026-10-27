// Измерить недоступное: лестница световых расстояний, пустота космоса,
// тени Эратосфена (наблюдение → две модели → проверка → число), оговорка
// об источнике, Колумб и «желаемый ответ», античный глобус и границы знания.
import React from "react";
import { C } from "../theme";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, pop, ramp, type VisualProps } from "./kit";
import { Earth, Galaxy, Note, Rays, Stage, StarField, Stick, Star } from "./space";

// ── m01: свет как линейка — секунда, восемь минут, год ──
export const LightLadder: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const steps = [
    { big: "1 секунда", small: "≈ 7 оборотов вокруг Земли", color: C.sky },
    { big: "8 минут", small: "от Солнца до Земли", color: C.amber },
    { big: "1 световой год", small: "≈ 10 триллионов км", color: C.violet },
  ];
  const warn = ramp(t, at(c, 2) + 0.4, 0.6);
  return (
    <Stage host={c.p.host}>
      <line x1={80} y1={470} x2={1200} y2={470} stroke={C.faint} strokeWidth={4} strokeDasharray="6 10" />
      {steps.map((s, i) => {
        const k = pop(t, at(c, i) + 0.2);
        if (k <= 0) return null;
        const x = 200 + i * 440;
        return (
          <g key={s.big} transform={`translate(${x} 470) scale(${k})`}>
            <circle r={16} fill={s.color} />
            {i === 0 && <Earth x={0} y={-150} r={70} />}
            {i === 1 && <Star x={0} y={-150} r={62} color={C.amber} />}
            {i === 2 && <StarField x={-120} y={-230} w={240} h={150} n={16} seed={9} r={2.6} />}
            <Txt x={0} y={90} size={44} color={s.color}>
              {s.big}
            </Txt>
            <Txt x={0} y={140} size={30} color={C.dim}>
              {s.small}
            </Txt>
          </g>
        );
      })}
      {[0, 1].map((i) => (
        <Arrow key={i} x1={240 + i * 440} y1={470} x2={600 + i * 440} y2={470} k={ramp(t, at(c, i + 1), 0.7)} color={C.yellow} w={6} />
      ))}
      {warn > 0 && (
        <g opacity={warn}>
          <Panel x={290} y={700} w={700} h={110} r={26} stroke={C.yellow} />
          <Txt x={640} y={770} size={38} color={C.yellow}>
            световой год — это расстояние
          </Txt>
        </g>
      )}
      <Note x={640} y={860} text="шаги на линейке не в масштабе" o={ramp(t, 1, 0.6)} />
    </Stage>
  );
};

// ── m02: космос в основном пуст ──
export const EmptySpace: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const zoom = ramp(t, at(c, 0) + 0.4, 2.6);
  const tag = pop(t, at(c, 1) + 0.3);
  return (
    <Stage host={c.p.host}>
      <Panel x={60} y={140} w={1160} h={600} r={30} fill="rgba(8,12,34,0.92)" />
      <g transform={`translate(640 440) scale(${1 + zoom * 1.4})`}>
        <Galaxy x={0} y={0} s={0.45 * (1 - zoom * 0.5)} n={150} dot={2.6} tilt={0.55} />
      </g>
      <g opacity={zoom}>
        <circle cx={980} cy={260} r={6} fill="#fff" />
        <circle cx={300} cy={620} r={5} fill="#ffe2b0" />
      </g>
      {tag > 0 && (
        <g transform={`translate(640 820) scale(${tag})`}>
          <Tag x={0} y={0} text="почти везде — пустота" color={C.sky} size={42} />
        </g>
      )}
    </Stage>
  );
};

// город-ярлык под палочкой
const City: React.FC<{ x: number; y: number; name: string }> = ({ x, y, name }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={20} width={240} height={56} rx={28} fill={C.deep} stroke={C.brass} strokeWidth={3} />
    <Txt x={0} y={58} size={32}>
      {name}
    </Txt>
  </g>
);

// ── m03: наблюдение — в Сиене тени нет, в Александрии есть ──
export const Shadows: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rays = ramp(t, 0.3, 1.2);
  const alex = ramp(t, at(c, 1) + 0.3, 1.2);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={620} width={1160} height={14} rx={7} fill={C.land} opacity={0.6} />
      <Rays x={160} y={150} w={960} h={330} angle={0} k={rays} n={7} />
      <Stick x={360} y={620} len={180} angle={0} />
      <City x={360} y={630} name="Сиена" />
      <Stick x={920} y={620} len={180} angle={20 * alex} />
      <City x={920} y={630} name="Александрия" />
      <Pop t={t} at={at(c, 0) + 0.8} x={360} y={360}>
        <Tag x={0} y={0} text="тени нет" color={C.yellow} size={36} />
      </Pop>
      <Pop t={t} at={at(c, 1) + 1.2} x={920} y={360}>
        <Tag x={0} y={0} text="тень есть" color={C.sky} size={36} />
      </Pop>
      <Note x={640} y={800} text="полдень одного и того же дня · угол тени увеличен" o={ramp(t, 1.4, 0.6)} />
    </Stage>
  );
};

// ── m04: две модели — плоская Земля и круглая ──
export const FlatOrRound: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const round = ramp(t, at(c, 1), 1);
  const verdict = ramp(t, at(c, 2) + 0.3, 0.8);
  return (
    <Stage host={c.p.host}>
      {/* плоская */}
      <Panel x={40} y={150} w={570} h={560} r={28} />
      <Txt x={325} y={215} size={36} color={C.dim}>
        если Земля плоская
      </Txt>
      <rect x={90} y={560} width={470} height={12} rx={6} fill={C.land} />
      <Rays x={120} y={270} w={410} h={250} angle={18} k={ramp(t, 0.3, 1)} n={5} />
      <Stick x={190} y={560} len={110} angle={18} />
      <Stick x={460} y={560} len={110} angle={18} />
      <Txt x={325} y={650} size={30} color={C.yellow}>
        тени всюду одинаковы
      </Txt>
      <Cross x={325} y={430} s={170} k={verdict} />
      {/* круглая */}
      <g opacity={round}>
        <Panel x={670} y={150} w={570} h={560} r={28} />
        <Txt x={955} y={215} size={36} color={C.dim}>
          если Земля искривлена
        </Txt>
        <path d="M 720 640 Q 955 430 1190 640" fill="none" stroke={C.land} strokeWidth={12} strokeLinecap="round" />
        <Rays x={760} y={260} w={390} h={220} angle={0} k={round} n={5} />
        <g transform="translate(830 560) rotate(-26)">
          <Stick x={0} y={0} len={100} angle={0} />
        </g>
        <g transform="translate(1080 560) rotate(26)">
          <Stick x={0} y={0} len={100} angle={0} />
        </g>
        <Txt x={955} y={680} size={30} color={C.yellow}>
          тени разные
        </Txt>
        <Check x={955} y={430} s={80} k={verdict} />
      </g>
      <Note x={640} y={800} text="лучи Солнца почти параллельны: оно очень далеко" o={round} />
    </Stage>
  );
};

// ── m05: семь градусов — одна пятидесятая круга ──
export const SevenDegrees: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ang = ramp(t, 0.4, 1.2);
  const mult = pop(t, at(c, 1) + 0.2);
  const res = pop(t, at(c, 2) + 0.2);
  const R = 250;
  const a1 = -90;
  const a2 = -90 + 7 * 3; // угол в кадре увеличен ×3 для наглядности
  const p = (a: number, r = R) => [450 + Math.cos((a * Math.PI) / 180) * r, 470 + Math.sin((a * Math.PI) / 180) * r];
  const [x1, y1] = p(a1);
  const [x2, y2] = p(a2);
  return (
    <Stage host={c.p.host}>
      <circle cx={450} cy={470} r={R} fill={C.deep} stroke={C.land} strokeWidth={8} />
      <line x1={450} y1={470} x2={x1} y2={y1} stroke={C.dim} strokeWidth={4} />
      <line x1={450} y1={470} x2={450 + (x2 - 450) * ang} y2={470 + (y2 - 470) * ang} stroke={C.dim} strokeWidth={4} />
      <path d={`M 450 ${470 - 70} A 70 70 0 0 1 ${p(a2, 70)[0]} ${p(a2, 70)[1]}`} fill="none" stroke={C.yellow} strokeWidth={6} opacity={ang} />
      <Txt x={500} y={360} size={34} color={C.yellow} opacity={ang}>
        7°
      </Txt>
      <circle cx={x1} cy={y1} r={12} fill={C.yellow} />
      <circle cx={x2} cy={y2} r={12} fill={C.sky} opacity={ang} />
      <Txt x={x1 - 40} y={y1 - 30} size={28} anchor="end">
        Сиена
      </Txt>
      <Txt x={x2 + 30} y={y2 - 20} size={28} anchor="start" opacity={ang}>
        Александрия
      </Txt>
      {mult > 0 && (
        <g transform={`translate(1000 330) scale(${mult})`}>
          <Txt x={0} y={0} size={40}>
            7° ≈ 1/50 круга
          </Txt>
          <Txt x={0} y={70} size={40} color={C.sky}>
            800 км × 50
          </Txt>
        </g>
      )}
      {res > 0 && (
        <g transform={`translate(1000 560) scale(${res})`}>
          <Tag x={0} y={0} text="≈ 40 000 км" color={C.yellow} size={50} />
          <Txt x={0} y={80} size={28} color={C.dim}>
            окружность Земли
          </Txt>
        </g>
      )}
      <Note x={450} y={800} text="угол на схеме увеличен" o={ang} />
    </Stage>
  );
};

// ── m06: откуда мы это знаем — пересказ, календарь ──
export const SourceCaveat: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = [
    { text: "рассказ дошёл в пересказе Клеомеда", color: C.blue },
    { text: "«21 июня» — по нашему календарю", color: C.blue },
    { text: "колодец — местное предание", color: C.coral },
  ];
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={250} y={440}>
        <g>
          <rect x={-150} y={-190} width={300} height={380} rx={20} fill="#e9dcb8" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={-110} y1={-140 + i * 40} x2={110 - (i % 3) * 30} y2={-140 + i * 40} stroke="#9a8a62" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
          ))}
        </g>
      </Pop>
      {items.map((it, i) => {
        const k = pop(t, at(c, Math.min(i, c.beats.length - 1)) + 0.3 + i * 0.4);
        if (k <= 0) return null;
        return (
          <g key={it.text} transform={`translate(830 ${260 + i * 160}) scale(${k})`}>
            <Panel x={-360} y={-56} w={720} h={112} r={26} stroke={it.color} />
            <Txt x={0} y={14} size={34}>
              {it.text}
            </Txt>
          </g>
        );
      })}
    </Stage>
  );
};

// ── m07: Колумб — желаемый ответ против измерения ──
export const Columbus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const squeeze = ramp(t, at(c, 1), 1.4);
  const luck = pop(t, at(c, 2) + 0.3);
  const r = 230 - squeeze * 70;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 450)">
        <circle r={230} fill="none" stroke={C.green} strokeWidth={5} strokeDasharray="12 10" opacity={0.7} />
        <circle r={r} fill={C.deep} stroke={C.coral} strokeWidth={8} />
        <Txt x={0} y={-250} size={30} color={C.green}>
          по Эратосфену
        </Txt>
        <Txt x={0} y={12} size={34} color={C.coral} opacity={squeeze}>
          «удобная» Земля
        </Txt>
      </g>
      <Pop t={t} at={at(c, 0) + 0.4} x={960} y={300}>
        <g>
          <Panel x={-260} y={-70} w={520} h={140} r={26} />
          <Txt x={0} y={-8} size={34}>
            меньшая Земля
          </Txt>
          <Txt x={0} y={42} size={34} color={C.dim}>
            + самая длинная Азия
          </Txt>
        </g>
      </Pop>
      {luck > 0 && (
        <g transform={`translate(960 560) scale(${luck})`}>
          <Tag x={0} y={0} text="спасла неожиданная Америка" color={C.yellow} size={36} />
          <Txt x={0} y={80} size={30} color={C.dim}>
            проверку нельзя подгонять под желание
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── m08: античный глобус — точно у дома, размыто вдали ──
export const OldGlobe: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fog = ramp(t, at(c, 0) + 0.6, 1);
  const cosmos = ramp(t, at(c, 1), 1);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 450)">
        <circle r={260} fill={C.deep} stroke={C.brass} strokeWidth={8} />
        <path d="M -60 -40 q 50 -30 110 -10 q 30 40 -20 70 q -60 10 -90 -60 Z" fill={C.land} stroke="#fff" strokeWidth={4} />
        <Txt x={0} y={110} size={26} color={C.text}>
          известно точно
        </Txt>
        <g opacity={fog}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M ${-230 + i * 30} ${-120 + i * 70} q 40 -20 70 10`} fill="none" stroke={C.land} strokeWidth={5} strokeDasharray="6 12" opacity={0.6} />
          ))}
          <Txt x={-150} y={210} size={26} color={C.dim}>
            догадки
          </Txt>
          <Txt x={170} y={-190} size={26} color={C.dim}>
            ?
          </Txt>
        </g>
      </g>
      <g opacity={cosmos}>
        <Arrow x1={700} y1={450} x2={820} y2={450} k={cosmos} color={C.yellow} w={7} />
        <g transform="translate(1020 450)">
          <circle r={190} fill="rgba(8,12,34,0.9)" stroke={C.brass} strokeWidth={6} />
          <circle r={14} fill={C.amber} />
          {[50, 80, 115].map((rr, i) => (
            <circle key={rr} r={rr} fill="none" stroke={C.sky} strokeWidth={3} opacity={0.8 - i * 0.2} />
          ))}
          {[150, 175].map((rr) => (
            <circle key={rr} r={rr} fill="none" stroke={C.sky} strokeWidth={3} strokeDasharray="5 12" opacity={0.4} />
          ))}
          <Txt x={0} y={250} size={28} color={C.dim}>
            наше знание о Космосе
          </Txt>
        </g>
      </g>
    </Stage>
  );
};

