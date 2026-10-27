// Красивая модель и упрямые данные: костры или дыры в шкуре, эпициклы,
// проверка астрологии близнецами, многогранники Кеплера, восемь угловых минут,
// эллипс, яблоко и Луна, параллакс Аристарха, пластина Гюйгенса,
// где мы в Галактике. Все схемы — собственные, масштаб условный.
import React from "react";
import { C } from "../theme";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Earth, Galaxy, Note, Stage, StarField, Star, Twinkle, rnd } from "./space";

// ── o01: костры или дыры? блуждающие звёзды решают спор ──
export const FiresOrHoles: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const h2 = ramp(t, at(c, 1), 0.8);
  const wander = ramp(t, at(c, 2), 3);
  const verdict = ramp(t, at(c, 2) + 2.2, 0.6);
  const stars = Array.from({ length: 12 }).map((_, i) => ({ x: 120 + rnd(i + 40) * 420, y: 250 + rnd(i + 80) * 330 }));
  return (
    <Stage host={c.p.host}>
      <Panel x={40} y={150} w={570} h={560} r={28} />
      <Txt x={325} y={210} size={34} color={C.amber}>
        далёкие костры?
      </Txt>
      {stars.map((s, i) => (
        <g key={i}>
          <path d={`M ${s.x} ${s.y + 10} q -10 -10 0 -24 q 10 14 0 24 Z`} fill={C.amber} />
          <circle cx={s.x} cy={s.y + 4} r={3} fill="#fff" />
        </g>
      ))}
      <g opacity={h2}>
        <Panel x={670} y={150} w={570} h={560} r={28} fill="#3a2a22" stroke={C.brass} />
        <Txt x={955} y={210} size={34} color={C.amber}>
          дыры в шкуре неба?
        </Txt>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x + 630} cy={s.y} r={7} fill="#fff6d8" />
        ))}
        {/* блуждающая звезда уходит со своего места */}
        <circle cx={790 + wander * 330} cy={420 - Math.sin(wander * Math.PI) * 90} r={10} fill={C.sky} />
        <path d={`M 790 420 Q ${955} 270 ${1120} 420`} fill="none" stroke={C.sky} strokeWidth={4} strokeDasharray="8 10" opacity={wander} />
        <Cross x={955} y={600} s={110} k={verdict} />
      </g>
      <Pop t={t} at={at(c, 2) + 2.6} x={955} y={770}>
        <Tag x={0} y={0} text="дыра не может путешествовать" color={C.yellow} size={34} />
      </Pop>
      <Note x={640} y={840} text="воображаемое рассуждение древнего охотника (образ Сагана)" o={ramp(t, 0.8, 0.6)} size={22} />
    </Stage>
  );
};

// ── o02: петля Марса и эпициклы ──
export const Epicycles: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const draw = ramp(t, 0.3, Math.max(4, c.dur * 0.6));
  const model = ramp(t, at(c, 1), 1);
  // видимый путь с петлёй (схема)
  const pts: string[] = [];
  const N = 120;
  for (let i = 0; i <= N * draw; i++) {
    const u = i / N;
    const x = 120 + u * 980;
    const y = 360 - Math.sin(u * Math.PI) * 60 + (u > 0.38 && u < 0.62 ? -Math.sin(((u - 0.38) / 0.24) * Math.PI * 2) * 70 : 0);
    const loopX = u > 0.38 && u < 0.62 ? -Math.sin(((u - 0.38) / 0.24) * Math.PI) * 120 : 0;
    pts.push(`${x + loopX},${y}`);
  }
  const a = t * 1.1;
  const big = { x: 640 + Math.cos(a * 0.25) * 200, y: 640 + Math.sin(a * 0.25) * 90 };
  return (
    <Stage host={c.p.host}>
      <StarField x={80} y={180} w={1120} h={300} n={40} seed={17} o={0.7} r={2} />
      <polyline points={pts.join(" ")} fill="none" stroke={C.mars} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <Txt x={640} y={200} size={32} color={C.dim}>
        Марс среди звёзд: вперёд, назад и снова вперёд
      </Txt>
      <g opacity={model}>
        <ellipse cx={640} cy={640} rx={200} ry={90} fill="none" stroke={C.faint} strokeWidth={3} />
        <Earth x={640} y={640} r={34} />
        <circle cx={big.x} cy={big.y} r={60} fill="none" stroke={C.violet} strokeWidth={3} strokeDasharray="6 8" />
        <circle cx={big.x + Math.cos(a) * 60} cy={big.y + Math.sin(a) * 60} r={13} fill={C.mars} />
        <Txt x={960} y={720} size={30} color={C.violet} anchor="start">
          круг на круге
        </Txt>
      </g>
      <Note x={640} y={830} text="схема, не в масштабе" o={model} />
    </Stage>
  );
};

// вложенные «тела» Кеплера (схема: окружности и правильные многоугольники как сечения)
const poly = (n: number, r: number, rot = -Math.PI / 2) =>
  Array.from({ length: n })
    .map((_, i) => `${Math.cos(rot + (i * 2 * Math.PI) / n) * r},${Math.sin(rot + (i * 2 * Math.PI) / n) * r}`)
    .join(" ");

// ── o04: прекрасная модель — пять тел между шестью орбитами ──
export const KeplerSolids: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const build = ramp(t, 0.3, 3);
  const miss = ramp(t, at(c, 1), 1);
  const shapes = [
    { n: 4, r: 300 },
    { n: 4, r: 235, rot: -Math.PI / 4 },
    { n: 5, r: 175 },
    { n: 6, r: 125 },
    { n: 3, r: 80 },
  ];
  const orbits = [330, 262, 200, 148, 100, 62];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(420 470)">
        {orbits.map((r, i) => (
          <circle key={r} r={r + (miss > 0 ? Math.sin(i * 2.3) * 14 * miss : 0)} fill="none" stroke={C.sky} strokeWidth={3} opacity={clamp01(build * 6 - i)} />
        ))}
        {shapes.map((s, i) => (
          <polygon key={i} points={poly(s.n, s.r, s.rot)} fill="none" stroke={C.brass} strokeWidth={4} opacity={clamp01(build * 5 - i) * (1 - miss * 0.5)} />
        ))}
        <circle r={20} fill={C.amber} />
      </g>
      <Pop t={t} at={0.8} x={1000} y={270}>
        <g>
          <Txt x={0} y={0} size={40} color={C.brass}>
            6 планет · 5 тел
          </Txt>
          <Txt x={0} y={50} size={28} color={C.dim}>
            изящная идея Кеплера
          </Txt>
        </g>
      </Pop>
      {miss > 0 && (
        <g opacity={miss}>
          <Panel x={790} y={420} w={420} h={150} r={26} stroke={C.coral} />
          <Txt x={1000} y={485} size={34} color={C.coral}>
            расстояния
          </Txt>
          <Txt x={1000} y={535} size={34} color={C.coral}>
            не совпадают
          </Txt>
        </g>
      )}
      <Note x={420} y={850} text="плоская схема вместо объёмных тел" o={build} />
    </Stage>
  );
};

// ── o05: восемь угловых минут ──
export const EightMinutes: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fit = ramp(t, at(c, 0) + 0.4, 1.4);
  const off = ramp(t, at(c, 1) + 0.3, 1);
  const moon = ramp(t, at(c, 2), 0.8);
  const R = 260;
  const obs = Array.from({ length: 10 }).map((_, i) => (i / 10) * Math.PI * 2 + 0.2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(430 470)">
        <circle r={R} fill="none" stroke={C.violet} strokeWidth={5} strokeDasharray={`${fit * 1640} 2000`} />
        <circle r={16} fill={C.amber} />
        {obs.map((a, i) => (
          <circle key={i} cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={9} fill={C.green} opacity={clamp01(fit * 3 - i * 0.15)} />
        ))}
        {[0, 1].map((i) => {
          const a = 2.55 + i * 0.5;
          return <circle key={i} cx={Math.cos(a) * (R + 34)} cy={Math.sin(a) * (R + 34)} r={11} fill={C.red} opacity={off} />;
        })}
        <Txt x={0} y={R + 60} size={28} color={C.dim}>
          точки — наблюдения Тихо Браге
        </Txt>
      </g>
      <Pop t={t} at={at(c, 0) + 1.6} x={1000} y={260}>
        <g>
          <Tag x={0} y={0} text="10 точек — до 2′" color={C.green} size={36} />
        </g>
      </Pop>
      <Pop t={t} at={at(c, 1) + 1} x={1000} y={400}>
        <Tag x={0} y={0} text="2 точки — мимо на 8′" color={C.red} size={36} />
      </Pop>
      {moon > 0 && (
        <g opacity={moon} transform="translate(1000 600)">
          <circle r={75} fill="#e8e4d8" />
          <rect x={-75} y={-90} width={150 / 15} height={180} fill={C.yellow} opacity={0.9} />
          <Txt x={0} y={130} size={28} color={C.dim}>
            2′ ≈ пятнадцатая часть Луны
          </Txt>
        </g>
      )}
      <Note x={430} y={835} text="отклонение на схеме преувеличено" o={off} />
    </Stage>
  );
};

// ── o06: эллипс: гармония должна согласоваться с опытом ──
export const Ellipse: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const morph = ramp(t, at(c, 0) + 0.3, 1.6);
  const areas = ramp(t, at(c, 1), 1);
  const rx = 330;
  const ry = 330 - morph * 70;
  const fx = Math.sqrt(Math.max(0, rx * rx - ry * ry));
  const a = t * 0.6;
  const px = Math.cos(a) * rx;
  const py = Math.sin(a) * ry;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(560 470)">
        <ellipse rx={rx} ry={ry} fill="none" stroke={C.violet} strokeWidth={6} />
        <circle cx={-fx * 0.0 + fx} cy={0} r={22} fill={C.amber} />
        {areas > 0 && (
          <g opacity={areas * 0.8}>
            <path d={`M ${fx} 0 L ${rx} 0 A ${rx} ${ry} 0 0 1 ${Math.cos(0.35) * rx} ${Math.sin(0.35) * ry} Z`} fill={C.yellow} opacity={0.5} />
            <path d={`M ${fx} 0 L ${-rx} 0 A ${rx} ${ry} 0 0 1 ${Math.cos(Math.PI + 0.62) * rx} ${Math.sin(Math.PI + 0.62) * ry} Z`} fill={C.yellow} opacity={0.5} />
          </g>
        )}
        <circle cx={px} cy={py} r={16} fill={C.mars} />
      </g>
      <Pop t={t} at={at(c, 0) + 1.8} x={1080} y={250}>
        <Tag x={0} y={0} text="не круг — эллипс" color={C.violet} size={36} textColor={C.white} />
      </Pop>
      <Pop t={t} at={at(c, 1) + 0.6} x={1080} y={380}>
        <g>
          <Txt x={0} y={0} size={30}>
            равные площади
          </Txt>
          <Txt x={0} y={44} size={30}>
            за равное время
          </Txt>
        </g>
      </Pop>
      <Note x={560} y={835} text="вытянутость орбиты Марса на схеме сильно преувеличена" o={morph} />
    </Stage>
  );
};

// ── o07: яблоко и Луна — одна сила ──
export const AppleMoon: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fall = ramp(t, 0.5, 1.2);
  const moonA = t * 0.35;
  const law = pop(t, at(c, 1) + 0.3);
  return (
    <Stage host={c.p.host}>
      <Earth x={480} y={560} r={150} spin={t * 0.02} />
      {/* дерево и яблоко на «вершине» Земли (условно) */}
      <rect x={472} y={330} width={16} height={84} fill="#7a5a32" />
      <circle cx={480} cy={320} r={48} fill={C.greenDeep} />
      <circle cx={505} cy={330 + fall * 70} r={14} fill={C.red} />
      <circle cx={480} cy={560} r={360} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="6 10" />
      <g transform={`translate(${480 + Math.cos(moonA) * 360} ${560 + Math.sin(moonA) * 360})`}>
        <circle r={36} fill="#e3dfd2" />
      </g>
      <Arrow x1={505} y1={360} x2={505} y2={420} k={fall} color={C.yellow} w={6} />
      {law > 0 && (
        <g transform={`translate(1050 360) scale(${law})`}>
          <Panel x={-210} y={-90} w={420} h={260} r={28} />
          <Txt x={0} y={-20} size={34} color={C.yellow}>
            одна сила
          </Txt>
          <Txt x={0} y={40} size={28}>
            вдвое дальше —
          </Txt>
          <Txt x={0} y={86} size={28}>
            вчетверо слабее
          </Txt>
        </g>
      )}
      <Note x={480} y={835} text="размеры и расстояния не в масштабе" o={fall} />
    </Stage>
  );
};

// ── o08: Аристарх: Солнце в центре, но звёзды не сдвигаются — значит, они очень далеко ──
export const Parallax: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const yr = t * 0.5;
  const ex = 360 + Math.cos(yr) * 200;
  const ey = 520 + Math.sin(yr) * 80;
  const far = ramp(t, at(c, 1), 1.4);
  const proof = pop(t, at(c, 2) + 0.3);
  return (
    <Stage host={c.p.host}>
      <ellipse cx={360} cy={520} rx={200} ry={80} fill="none" stroke={C.faint} strokeWidth={3} />
      <Star x={360} y={520} r={44} color={C.amber} />
      <Earth x={ex} y={ey} r={20} />
      <Twinkle x={760 + far * 340} y={330} s={0.8} />
      <line x1={ex} y1={ey} x2={760 + far * 340} y2={330} stroke={C.sky} strokeWidth={2.5} strokeDasharray="6 8" />
      <Pop t={t} at={at(c, 0) + 0.4} x={360} y={260}>
        <Tag x={0} y={0} text="Солнце в центре" color={C.amber} size={34} />
      </Pop>
      {far > 0 && (
        <g opacity={far}>
          <Txt x={1000} y={460} size={30}>
            звёзды почти не сдвигаются:
          </Txt>
          <Txt x={1000} y={505} size={30} color={C.yellow}>
            они невероятно далеко
          </Txt>
        </g>
      )}
      {proof > 0 && (
        <g transform={`translate(900 680) scale(${proof})`}>
          <Tag x={0} y={0} text="сдвиг измерили лишь в XIX веке" color={C.green} size={32} />
        </g>
      )}
      <Note x={640} y={860} text="схема, не в масштабе" />
    </Stage>
  );
};

// ── o09: Гюйгенс: дырочка в латунной пластине и Сириус ──
export const Huygens: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const hole = ramp(t, at(c, 0) + 0.3, 1);
  const res = pop(t, at(c, 1) + 0.3);
  const fix = pop(t, at(c, 2) + 0.3);
  return (
    <Stage host={c.p.host}>
      <Star x={180} y={430} r={90} color={C.amber} label="Солнце" />
      <g transform="translate(560 430)">
        <rect x={-30} y={-230} width={60} height={460} rx={10} fill={C.brass} />
        {Array.from({ length: 5 }).map((_, i) => (
          <circle key={i} cx={0} cy={-170 + i * 80} r={(12 - i * 2.4) * hole + 1} fill="#120c04" />
        ))}
      </g>
      <Twinkle x={860} y={300} s={0.9} />
      <Txt x={860} y={380} size={30}>
        Сириус
      </Txt>
      {res > 0 && (
        <g transform={`translate(950 520) scale(${res})`}>
          <Txt x={0} y={0} size={34}>
            блеск ≈ 1/28 000 Солнца
          </Txt>
          <Txt x={0} y={50} size={34} color={C.yellow}>
            → примерно полгода света
          </Txt>
        </g>
      )}
      {fix > 0 && (
        <g transform={`translate(950 680) scale(${fix})`}>
          <Tag x={0} y={0} text="метод верный, допущение неточное" color={C.green} size={30} />
        </g>
      )}
      <Note x={640} y={860} text="расчёт XVII века в пересказе книги" o={hole} />
    </Stage>
  );
};

// ── o10: где мы в Галактике: центр или окраина ──
export const OurPlace: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const move = ramp(t, at(c, 1), 1.8);
  const m31 = pop(t, at(c, 2) + 0.3);
  const sx = 640 - move * 230;
  return (
    <Stage host={c.p.host}>
      <Galaxy x={640} y={460} s={1.35} tilt={0.42} n={300} dot={2.6} />
      <g transform={`translate(${sx} ${460 + move * 40})`}>
        <circle r={14} fill={C.yellow} stroke="#fff" strokeWidth={4} />
        <Txt x={0} y={-30} size={28} color={C.yellow}>
          Солнце
        </Txt>
      </g>
      <Pop t={t} at={at(c, 0) + 0.6} x={640} y={180}>
        <Tag x={0} y={0} text={move < 0.5 ? "думали: мы в центре" : "на самом деле: окраина"} color={move < 0.5 ? C.coral : C.green} size={34} />
      </Pop>
      {m31 > 0 && (
        <g transform={`translate(960 230) scale(${m31})`}>
          <Galaxy x={0} y={0} s={0.35} tilt={0.5} n={120} dot={2.4} color={C.sky} />
          <Txt x={0} y={90} size={26}>
            туманность — другая галактика
          </Txt>
        </g>
      )}
      <Note x={640} y={860} text="рисунок галактики — схема, не снимок" />
    </Stage>
  );
};


// ── o04: Коперник: проще, но не точнее ──
export const SimpleNotProof: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const note = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      {[0, 1].map((i) => {
        const k = pop(t, 0.3 + i * (at(c, 0) + 0.6));
        if (k <= 0) return null;
        const cx = 330 + i * 620;
        const a = t * 0.5;
        return (
          <g key={i} transform={`translate(${cx} 420) scale(${k})`}>
            <Txt x={0} y={-250} size={34} color={i ? C.amber : C.sky}>
              {i ? "Коперник: Солнце в центре" : "Птолемей: Земля в центре"}
            </Txt>
            {[90, 150, 210].map((r) => (
              <circle key={r} r={r} fill="none" stroke={C.faint} strokeWidth={3} />
            ))}
            {i === 0 ? <Earth x={0} y={0} r={30} /> : <Star x={0} y={0} r={34} color={C.amber} />}
            {i === 0 && <circle cx={Math.cos(a) * 150} cy={Math.sin(a) * 150} r={36} fill="none" stroke={C.violet} strokeWidth={3} strokeDasharray="5 7" />}
            <circle cx={Math.cos(a) * 150 + (i === 0 ? Math.cos(a * 3) * 36 : 0)} cy={Math.sin(a) * 150 + (i === 0 ? Math.sin(a * 3) * 36 : 0)} r={12} fill={C.mars} />
            {i === 1 && <Earth x={Math.cos(a * 1.6) * 90} y={Math.sin(a * 1.6) * 90} r={14} />}
          </g>
        );
      })}
      {note > 0 && (
        <g opacity={note}>
          <Tag x={640} y={740} text="проще — да · точнее — нет" color={C.yellow} size={38} />
          <Note x={640} y={820} text="по примечанию переводчика, модели с кругами" />
        </g>
      )}
    </Stage>
  );
};
