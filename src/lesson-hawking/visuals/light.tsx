// Часть «Свет и время»: мячик в поезде, опоздание спутников Юпитера (Рёмер),
// опыт Майкельсона — Морли, световые часы, близнецы и E = mc², световые конусы,
// гравитация как геометрия, отклонение света Солнцем, часы на башне.
import React from "react";
import { C } from "../theme";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Astronaut, Clock, Earth, Grid, LightCone, Mirror, Note, Photon, Rocket, Spark, Stage, Sun } from "./space";

// ── l01: мячик в поезде — две точки зрения ──
export const Train: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const outside = ramp(t, at(c, 1), 0.8);
  const both = pop(t, at(c, 2));
  const time = pop(t, at(c, 3));
  const bounce = (x: number) => Math.abs(Math.sin(x * Math.PI));
  const trainX = outside > 0 ? ((t - at(c, 1)) * 110) % 980 : 0;
  return (
    <Stage host={c.p.host}>
      {/* вагон изнутри */}
      <g transform="translate(330 340)">
        <Panel x={-260} y={-200} w={520} h={360} />
        <rect x={-200} y={60} width={400} height={20} rx={8} fill={C.amber} />
        <circle cx={0} cy={40 - bounce(t * 0.9) * 200} r={22} fill={C.white} />
        <line x1={0} y1={-170} x2={0} y2={40} stroke={C.yellow} strokeWidth={3} strokeDasharray="6 10" opacity={0.6} />
        <Txt x={0} y={130} size={30} color={C.yellow}>
          для пассажира: на месте
        </Txt>
      </g>
      {/* с платформы: поезд едет вправо, мячик чертит дуги */}
      {outside > 0 && (
        <g opacity={outside} transform="translate(0 700)">
          <rect x={20} y={110} width={1240} height={10} fill={C.dim} />
          <g transform={`translate(${120 + trainX} 0)`}>
            <rect x={-110} y={-40} width={220} height={140} rx={20} fill={C.skyDeep} />
            <rect x={-90} y={-20} width={60} height={50} rx={8} fill={C.night} />
            <rect x={30} y={-20} width={60} height={50} rx={8} fill={C.night} />
          </g>
          <path
            d={Array.from({ length: 60 })
              .map((_, i) => {
                const back = (i / 59) * Math.min(3.5, trainX / 120);
                const x = 120 + trainX - back * 120;
                const tt = t - at(c, 1) - back;
                return `${i ? "L" : "M"} ${x} ${-50 - bounce(tt * 0.9) * 120}`;
              })
              .join(" ")}
            fill="none"
            stroke={C.white}
            strokeWidth={4}
            opacity={0.75}
          />
          <circle cx={120 + trainX} cy={-50 - bounce((t - at(c, 1)) * 0.9) * 120} r={14} fill={C.white} />
          <Txt x={640} y={180} size={28} color={C.sky}>
            для человека на платформе: дуги вдоль пути
          </Txt>
        </g>
      )}
      {both > 0 && (
        <g transform={`translate(950 300) scale(${both})`}>
          <Tag x={0} y={0} text="правы оба" color={C.yellow} size={44} />
          <Txt x={0} y={80} size={30} color={C.dim}>
            абсолютного покоя нет
          </Txt>
        </g>
      )}
      {time > 0 && (
        <g transform={`translate(950 470) scale(${time})`}>
          <Clock x={-90} y={0} r={50} phase={t * 0.3} color={C.sky} />
          <Txt x={60} y={-6} size={30}>
            а время —
          </Txt>
          <Txt x={60} y={34} size={30} color={C.coral}>
            одно на всех?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l02: Рёмер — свету нужно время ──
export const Roemer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const far = ramp(t, at(c, 1), 1.5);
  const wave = ramp(t, at(c, 2), 1);
  const ea = -0.3 + far * 2.6;
  const ex = 360 + Math.cos(ea) * 170;
  const ey = 430 + Math.sin(ea) * 170;
  const jx = 1000;
  const jy = 430;
  const dist = Math.hypot(jx - ex, jy - ey);
  const flight = ((t * 0.5) % 1) * dist;
  const ang = Math.atan2(ey - jy, ex - jx);
  return (
    <Stage host={c.p.host}>
      <Sun x={360} y={430} r={50} t={t} />
      <circle cx={360} cy={430} r={170} fill="none" stroke={C.glassLine} strokeWidth={3} />
      <Earth x={ex} y={ey} r={28} t={t} />
      <g transform={`translate(${jx} ${jy})`}>
        <circle r={60} fill="#d9a066" />
        <path d="M -58 -12 Q 0 -4 58 -12 M -55 14 Q 0 20 55 14" stroke="#a8673a" strokeWidth={8} fill="none" />
        <circle cx={Math.cos(t * 1.4) * 100} cy={Math.sin(t * 1.4) * 26} r={10} fill={C.text} />
      </g>
      <line x1={jx} y1={jy} x2={ex} y2={ey} stroke={C.yellow} strokeWidth={2} strokeDasharray="6 12" opacity={0.6} />
      <Photon x={jx + Math.cos(ang) * flight} y={jy + Math.sin(ang) * flight} r={9} />
      <Pop t={t} at={0.3} x={680} y={170}>
        <Tag x={0} y={0} text="1676 · Рёмер" color={C.yellow} size={36} />
      </Pop>
      {far > 0.5 && (
        <g opacity={ramp(t, at(c, 1) + 0.8)}>
          <Panel x={420} y={640} w={560} h={150} />
          <Txt x={700} y={700} size={34} color={C.text}>
            дальше от Юпитера —
          </Txt>
          <Txt x={700} y={750} size={34} color={C.yellow}>
            затмения позже
          </Txt>
        </g>
      )}
      {wave > 0 && (
        <g opacity={wave} transform="translate(1100 700)">
          <Txt x={0} y={0} size={28} color={C.sky}>
            Максвелл:
          </Txt>
          <Txt x={0} y={40} size={28} color={C.sky}>
            свет — волна
          </Txt>
          <Txt x={0} y={90} size={26} color={C.dim}>
            «эфир»?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l03: интерферометр: «по ветру» и «поперёк» — разницы нет ──
export const Michelson: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wind = ramp(t, 0.3, 0.8) * (1 - ramp(t, at(c, 1.5), 0.8));
  const res = pop(t, at(c, 1.4));
  const ein = pop(t, at(c, 2));
  const ph = (t * 1.2) % 1;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(420 440)">
        <rect x={-30} y={-30} width={60} height={60} fill={C.sky} opacity={0.4} transform="rotate(45)" />
        <Mirror x={300} y={0} w={20} />
        <rect x={290} y={-80} width={20} height={160} rx={6} fill={C.sky} />
        <rect x={-80} y={-310} width={160} height={20} rx={6} fill={C.sky} />
        <line x1={-260} y1={0} x2={300} y2={0} stroke={C.yellow} strokeWidth={3} opacity={0.4} />
        <line x1={0} y1={0} x2={0} y2={-300} stroke={C.yellow} strokeWidth={3} opacity={0.4} />
        <Photon x={ph < 0.5 ? ph * 2 * 300 : (1 - ph) * 2 * 300} y={0} r={10} />
        <Photon x={0} y={-(ph < 0.5 ? ph * 2 * 300 : (1 - ph) * 2 * 300)} r={10} />
        <rect x={-300} y={-30} width={40} height={60} rx={8} fill={C.amber} />
        <Txt x={0} y={110} size={28} color={C.dim}>
          два луча — два направления
        </Txt>
        {wind > 0 && (
          <g opacity={wind}>
            {[0, 1, 2].map((i) => (
              <Arrow key={i} x1={-300 + ((t * 160 + i * 140) % 500)} y1={200 + i * 30} x2={-200 + ((t * 160 + i * 140) % 500)} y2={200 + i * 30} k={1} color={C.dim} w={5} />
            ))}
            <Txt x={0} y={320} size={28} color={C.dim}>
              «эфирный ветер»?
            </Txt>
          </g>
        )}
      </g>
      {res > 0 && (
        <g transform={`translate(1000 320) scale(${res})`}>
          <Panel x={-220} y={-110} w={440} h={220} />
          <Txt x={0} y={-30} size={36}>
            1887 · разница:
          </Txt>
          <Txt x={0} y={50} size={66} color={C.yellow}>
            нет
          </Txt>
        </g>
      )}
      {ein > 0 && (
        <g transform={`translate(1000 620) scale(${ein})`}>
          <Tag x={0} y={0} text="c — одна для всех" color={C.green} size={40} textColor={C.night} />
          <Txt x={0} y={80} size={30} color={C.coral}>
            цена: нет единого времени
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l04: световые часы на месте и в полёте ──
export const LightClock: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const moving = ramp(t, at(c, 1), 0.8);
  const slow = pop(t, at(c, 2));
  const note = ramp(t, at(c, 3), 0.6);
  const H = 300;
  // неподвижные часы: импульс туда-обратно
  const p1 = (t * 0.8) % 1;
  const y1 = p1 < 0.5 ? p1 * 2 * H : (1 - p1) * 2 * H;
  // движущиеся: тот же свет, путь по диагонали, тик реже (γ преувеличен)
  const gamma = 1.7;
  const p2 = ((t * 0.8) / gamma) % 1;
  const y2 = p2 < 0.5 ? p2 * 2 * H : (1 - p2) * 2 * H;
  const span = 420;
  const run = ((t - at(c, 1)) * 0.8) / gamma;
  const mx = 640 + ((run * span) % (span * 1.5));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(230 220)">
        <Mirror x={0} y={0} w={150} />
        <Mirror x={0} y={H} w={150} />
        <line x1={0} y1={0} x2={0} y2={H} stroke={C.yellow} strokeWidth={2} strokeDasharray="5 10" opacity={0.5} />
        <Photon x={0} y={H - y1} r={11} />
        <Txt x={0} y={H + 80} size={30}>
          на месте
        </Txt>
        <Clock x={0} y={H + 180} r={52} phase={t * 0.4} color={C.yellow} />
      </g>
      {moving > 0 && (
        <g opacity={moving} transform="translate(0 220)">
          <g transform={`translate(${mx} 0)`}>
            <Mirror x={0} y={0} w={150} />
            <Mirror x={0} y={H} w={150} />
            <Photon x={0} y={H - y2} r={11} />
          </g>
          {/* след света по диагонали */}
          <path d={`M ${mx - span * 0.5} ${H} L ${mx - span * 0.25} 0 L ${mx} ${H}`} fill="none" stroke={C.yellow} strokeWidth={4} opacity={0.5} strokeDasharray="10 8" />
          <Arrow x1={mx - 120} y1={-50} x2={mx + 60} y2={-50} k={1} color={C.sky} w={6} />
          <Txt x={900} y={H + 80} size={30}>
            летит мимо нас
          </Txt>
          <Clock x={900} y={H + 180} r={52} phase={(t * 0.4) / gamma} color={C.sky} />
        </g>
      )}
      {slow > 0 && (
        <g transform={`translate(560 820) scale(${slow})`}>
          <Tag x={0} y={0} text="путь длиннее → «тики» реже" color={C.yellow} size={36} />
        </g>
      )}
      <Note x={640} y={160} text="эффект в кадре сильно преувеличен" o={note} />
    </Stage>
  );
};

// ── l05: близнецы и E = mc² ──
export const Twins: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const trip = ramp(t, 0.4, at(c, 1) - 0.4);
  const out = trip < 0.5 ? trip * 2 : (1 - trip) * 2;
  const paths = pop(t, at(c, 1));
  const emc = pop(t, at(c, 2));
  return (
    <Stage host={c.p.host}>
      {/* пространство-время: дома — прямая, путешественник — «ломаная» */}
      <g transform="translate(330 830) scale(0.85)">
        <Arrow x1={-200} y1={60} x2={-200} y2={-560} k={1} color={C.dim} w={4} />
        <Txt x={-200} y={-590} size={26} color={C.dim}>
          время
        </Txt>
        <line x1={0} y1={40} x2={0} y2={-540} stroke={C.sky} strokeWidth={6} />
        <path d={`M 0 40 L 230 -250 L 0 -540`} fill="none" stroke={C.yellow} strokeWidth={6} strokeDasharray="1400" strokeDashoffset={1400 * (1 - clamp01(trip))} />
        <circle cx={0} cy={40 - trip * 580} r={14} fill={C.sky} />
        <Rocket x={trip < 0.5 ? out * 230 : out * 230} y={40 - trip * 580} s={0.35} ang={trip < 0.5 ? 40 : -40} t={t} />
        {paths > 0 && (
          <g opacity={paths}>
            <Clock x={-110} y={-620} r={38} phase={0.9} color={C.sky} />
            <Clock x={150} y={-620} r={38} phase={0.55} color={C.yellow} />
            <Txt x={20} y={-680} size={26} color={C.text}>
              разные пути — разное время
            </Txt>
          </g>
        )}
      </g>
      <Pop t={t} at={0.3} x={980} y={300}>
        <Astronaut x={-90} y={0} s={0.9} t={t} />
        <Astronaut x={90} y={0} s={0.9} t={t + 2} color="#ffe9a8" />
        <Txt x={-90} y={130} size={26} color={C.sky}>
          дома
        </Txt>
        <Txt x={90} y={130} size={26} color={C.yellow}>
          в полёте
        </Txt>
      </Pop>
      {emc > 0 && (
        <g transform={`translate(980 620) scale(${emc})`}>
          <Panel x={-230} y={-110} w={460} h={230} />
          <Txt x={0} y={0} size={76} color={C.yellow}>
            E = mc²
          </Txt>
          <Txt x={0} y={70} size={28} color={C.dim}>
            до скорости света — не разогнать
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l06: световые конусы ──
export const Cones: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const flash = pop(t, 0.4);
  const grow = ramp(t, at(c, 1), 1.6);
  const past = ramp(t, at(c, 2), 1.2);
  const sun = pop(t, at(c, 3));
  const ring = ((t * 0.7) % 1) * 200;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(470 500)">
        <Arrow x1={-330} y1={330} x2={-330} y2={-340} k={ramp(t, 0.2)} color={C.dim} w={4} />
        <Txt x={-330} y={-360} size={26} color={C.dim}>
          время
        </Txt>
        <Arrow x1={-360} y1={300} x2={330} y2={300} k={ramp(t, 0.2)} color={C.dim} w={4} />
        <Txt x={340} y={340} size={26} color={C.dim} anchor="end">
          пространство
        </Txt>
        {grow > 0 && <LightCone x={0} y={0} h={270} k={grow} narrow={1} labels={false} />}
        {past > 0 && (
          <g opacity={past}>
            <path d="M 0 0 L -270 270 L 270 270 Z" fill={C.sky} opacity={0.22} />
            <Txt x={0} y={200} size={30}>
              прошлое
            </Txt>
            <Txt x={330} y={-20} size={28} color={C.dim}>
              «в стороне»:
            </Txt>
            <Txt x={330} y={14} size={28} color={C.dim}>
              связи нет
            </Txt>
          </g>
        )}
        {grow > 0.6 && (
          <Txt x={0} y={-180} size={30}>
            будущее
          </Txt>
        )}
        {flash > 0 && (
          <g transform={`scale(${flash})`}>
            <circle r={18 + Math.sin(t * 6) * 3} fill={C.white} />
            <Spark x={0} y={0} r={40} color={C.yellow} o={0.8} />
          </g>
        )}
      </g>
      {/* вид сверху: расходящийся круг */}
      <g transform="translate(1080 260)" opacity={ramp(t, at(c, 1) + 0.6)}>
        <circle r={ring * 0.6} fill="none" stroke={C.yellow} strokeWidth={4} opacity={1 - ring / 200} />
        <circle r={6} fill={C.white} />
        <Txt x={0} y={150} size={24} color={C.dim}>
          свет расходится шаром
        </Txt>
      </g>
      {sun > 0 && (
        <g transform={`translate(1050 640) scale(${sun})`}>
          <Sun x={-110} y={0} r={36} t={t} />
          <Arrow x1={-60} y1={0} x2={70} y2={0} k={ramp(t, at(c, 3) + 0.3, 1.5)} color={C.yellow} w={5} />
          <Earth x={110} y={0} r={26} t={t} />
          <Txt x={0} y={90} size={30} color={C.yellow}>
            ≈ 8 минут
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l07: искривление пространства-времени, кратчайший путь на глобусе ──
export const Curvature: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const dent = ramp(t, at(c, 0.4), 1.6);
  const orbit = ramp(t, at(c, 1), 0.8);
  const globe = pop(t, at(c, 2));
  const warn = pop(t, at(c, 3));
  const a = t * 0.9;
  return (
    <Stage host={c.p.host}>
      <Grid x={470} y={300} w={820} h={600} depth={dent * 150} mx={0} color={C.sky} n={12} />
      <Sun x={470} y={300 + 135 + dent * 150 - 40} r={46} t={t} />
      {orbit > 0 && <Earth x={470 + Math.cos(a) * 300} y={300 + 135 + dent * 150 - 40 + Math.sin(a) * 90 + 20} r={22} t={t} />}
      {globe > 0 && (
        <g transform={`translate(1060 300) scale(${globe})`}>
          <Earth x={0} y={0} r={120} t={0} />
          <path d="M -90 -30 Q 0 -120 90 -40" fill="none" stroke={C.yellow} strokeWidth={6} strokeDasharray="12 8" />
          <circle cx={-90} cy={-30} r={9} fill={C.yellow} />
          <circle cx={90} cy={-40} r={9} fill={C.yellow} />
          <Txt x={0} y={170} size={26} color={C.dim}>
            кратчайший путь — дуга
          </Txt>
        </g>
      )}
      {warn > 0 && (
        <g transform={`translate(640 860) scale(${warn})`}>
          <Tag x={0} y={0} text="только картинка: искривлено 4-мерное пространство-время" color={C.white} size={28} />
        </g>
      )}
    </Stage>
  );
};

// ── l08: отклонение света звезды Солнцем во время затмения ──
export const Eclipse: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ray = ramp(t, at(c, 0.4), 1.4);
  const photo = pop(t, at(c, 1));
  const merc = pop(t, at(c, 2));
  const pathD = "M 1220 200 Q 700 300 520 420 Q 380 520 120 560";
  return (
    <Stage host={c.p.host}>
      <Spark x={1220} y={200} r={20} color={C.white} />
      <g transform="translate(560 430)">
        <circle r={80} fill="#000" />
        <circle r={86} fill="none" stroke="#ffe8b0" strokeWidth={10} opacity={0.7} />
        <circle r={110} fill="#ffe8b0" opacity={0.12} />
        <Txt x={0} y={150} size={26} color={C.dim}>
          Солнце, закрытое Луной
        </Txt>
      </g>
      <path d={pathD} fill="none" stroke={C.yellow} strokeWidth={6} strokeDasharray="1300" strokeDashoffset={1300 * (1 - ray)} />
      {ray > 0.95 && (
        <g>
          <line x1={120} y1={560} x2={1250} y2={130} stroke={C.yellow} strokeWidth={3} strokeDasharray="8 12" opacity={0.6} />
          <Spark x={1250} y={130} r={18} color={C.yellow} o={0.8} />
          <Txt x={1000} y={200} size={26} color={C.yellow} anchor="end">
            видимое положение
          </Txt>
          <Earth x={120} y={560} r={40} t={t} />
        </g>
      )}
      {photo > 0 && (
        <g transform={`translate(360 780) scale(${photo})`}>
          <Tag x={0} y={0} text="1919 · сдвиг найден" color={C.green} size={36} textColor={C.night} />
        </g>
      )}
      {merc > 0 && (
        <g transform={`translate(950 760) scale(${merc})`}>
          <Check x={-150} y={0} s={40} k={ramp(t, at(c, 2) + 0.3)} />
          <Txt x={30} y={12} size={30}>
            и орбита Меркурия
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l09: часы у основания и наверху башни ──
export const TowerClocks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const exp = ramp(t, at(c, 1), 1);
  const gps = pop(t, at(c, 2));
  const solved = pop(t, at(c, 3));
  const k = exp * 0.18;
  return (
    <Stage host={c.p.host}>
      <Earth x={340} y={1220} r={440} t={t * 0.2} />
      {exp > 0 && (
        <g opacity={exp}>
          <rect x={300} y={300} width={80} height={480} rx={10} fill={C.deep} stroke={C.glassLine} strokeWidth={3} />
          <ellipse cx={340} cy={290} rx={110} ry={40} fill="#3a4a86" />
          <Clock x={340} y={200} r={62} phase={t * 0.5 + k * t} color={C.yellow} />
          <Clock x={340} y={720} r={62} phase={t * 0.5} color={C.sky} />
          <Txt x={510} y={210} size={28} color={C.yellow} anchor="start">
            наверху — быстрее
          </Txt>
          <Txt x={510} y={730} size={28} color={C.sky} anchor="start">
            внизу — медленнее
          </Txt>
          <Tag x={520} y={130} text="1962" color={C.yellow} size={30} />
        </g>
      )}
      {gps > 0 && (
        <g transform={`translate(1000 400) scale(${gps})`}>
          <Earth x={0} y={0} r={60} t={t} />
          <circle r={140} fill="none" stroke={C.glassLine} strokeWidth={2} strokeDasharray="6 10" />
          <g transform={`rotate(${t * 20}) translate(140 0) rotate(${-t * 20})`}>
            <rect x={-22} y={-14} width={44} height={28} rx={4} fill={C.dim} />
            <rect x={-62} y={-8} width={34} height={16} fill={C.sky} />
            <rect x={28} y={-8} width={34} height={16} fill={C.sky} />
          </g>
          <Txt x={0} y={200} size={28}>
            спутниковая навигация
          </Txt>
          <Txt x={0} y={240} size={26} color={C.dim}>
            без поправок — ошибки на км
          </Txt>
        </g>
      )}
      {solved > 0 && (
        <g transform={`translate(950 790) scale(${solved})`}>
          <Tag x={0} y={0} text="разгадка двух часов" color={C.yellow} size={40} />
        </g>
      )}
    </Stage>
  );
};
