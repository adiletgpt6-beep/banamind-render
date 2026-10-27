// Путешественники, свет и время: линзы расширяют окно, предсказание о спутниках
// Юпитера, вулкан Ио, прогнозы 1980 года и их проверка, взгляд в прошлое,
// мысленный эксперимент со световой волной, звездолёты «на бумаге», планеты у
// других звёзд. Аппараты — обобщённые собственные схемы, не чертежи миссий.
import React from "react";
import { C } from "../theme";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Galaxy, Note, Planet, Probe, Stage, Star, rnd } from "./space";

// ── t01: линзы: капля воды и кольца Сатурна ──
export const Lenses: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const drop = pop(t, at(c, 1) + 0.2);
  const sat = pop(t, at(c, 1) + 2.4);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={250}>
        <g>
          <ellipse rx={150} ry={40} fill="#cfe9ff" opacity={0.35} stroke={C.sky} strokeWidth={5} />
          <Txt x={0} y={95} size={30} color={C.dim}>
            шлифованная линза
          </Txt>
        </g>
      </Pop>
      {drop > 0 && (
        <g transform={`translate(330 590) scale(${drop})`}>
          <circle r={150} fill="#16304a" stroke={C.sky} strokeWidth={6} />
          {Array.from({ length: 7 }).map((_, i) => (
            <ellipse key={i} cx={Math.cos(i * 1.7 + t * 0.4) * 80} cy={Math.sin(i * 2.3 + t * 0.3) * 70} rx={16} ry={8} fill={C.green} opacity={0.85} transform={`rotate(${i * 40})`} />
          ))}
          <Txt x={0} y={200} size={30}>
            жизнь в капле
          </Txt>
        </g>
      )}
      {sat > 0 && (
        <g transform={`translate(950 590) scale(${sat})`}>
          <Planet x={0} y={0} r={90} color="#e8cf9a" bands="#c9a86a" ring />
          <circle cx={210} cy={-80} r={14} fill={C.amber} />
          <Txt x={210} y={-110} size={24} color={C.dim}>
            Титан
          </Txt>
          <Txt x={0} y={200} size={30}>
            кольца Сатурна
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── t02: предсказание по плотности до снимков ──
export const MoonsPredict: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const moons = [
    { name: "Ио", color: "#e9c25a", rock: true },
    { name: "Европа", color: "#d9cdb8", rock: true },
    { name: "Ганимед", color: "#9a8f80", rock: false },
    { name: "Каллисто", color: "#6f6458", rock: false },
  ];
  const check = ramp(t, at(c, 1) + 2, 0.8);
  return (
    <Stage host={c.p.host}>
      <Planet x={140} y={450} r={150} color="#d8b48a" bands="#a8774f" />
      {moons.map((m, i) => {
        const k = pop(t, at(c, 0) + 0.8 + i * 0.4);
        if (k <= 0) return null;
        const x = 470 + i * 210;
        return (
          <g key={m.name} transform={`translate(${x} 420) scale(${k})`}>
            <circle r={62} fill={m.color} />
            <circle r={62} fill="none" stroke={m.rock ? C.amber : C.sky} strokeWidth={5} strokeDasharray={m.rock ? "0" : "8 6"} />
            <Txt x={0} y={110} size={28}>
              {m.name}
            </Txt>
            <Txt x={0} y={150} size={24} color={m.rock ? C.amber : C.sky} opacity={ramp(t, at(c, 1), 0.6)}>
              {m.rock ? "камень" : "лёд и камень"}
            </Txt>
          </g>
        );
      })}
      {check > 0 && (
        <g opacity={check}>
          <Tag x={780} y={700} text="очень разные миры — подтвердилось" color={C.green} size={34} />
          <Check x={1160} y={700} s={40} k={check} />
        </g>
      )}
      <Note x={640} y={830} text="размеры не в масштабе" />
    </Stage>
  );
};

// ── t03: Ио — нет кратеров, вулкан, приливы ──
export const Io: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const plume = ramp(t, at(c, 1) + 0.6, 1.6);
  const tide = ramp(t, at(c, 2) + 0.4, 1);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(450 470)">
        <circle r={230} fill="#e8c35a" />
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse key={i} cx={Math.cos(i * 2.1) * 140 * rnd(i + 3)} cy={Math.sin(i * 1.7) * 150 * rnd(i + 9)} rx={20 + rnd(i) * 26} ry={14 + rnd(i + 1) * 16} fill={i % 3 ? "#c8742e" : "#f6ecd0"} opacity={0.75} />
        ))}
        <circle r={230} fill="none" stroke="#000" strokeOpacity={0.15} strokeWidth={30} />
        {/* столб выброса на краю диска */}
        <g transform="translate(0 -230)" opacity={plume}>
          <path d={`M -10 0 Q -60 ${-110 * plume} 0 ${-160 * plume} Q 60 ${-110 * plume} 10 0 Z`} fill="#f2e9c9" opacity={0.8} />
        </g>
      </g>
      <Pop t={t} at={at(c, 0) + 0.6} x={1000} y={240}>
        <Tag x={0} y={0} text="кратеров нет" color={C.yellow} size={36} />
      </Pop>
      <Pop t={t} at={at(c, 1) + 1.4} x={1000} y={360}>
        <Tag x={0} y={0} text="действующий вулкан" color={C.orange} size={34} />
      </Pop>
      {tide > 0 && (
        <g opacity={tide}>
          <Panel x={790} y={450} w={420} h={170} r={26} stroke={C.green} />
          <Txt x={1000} y={510} size={28}>
            предсказано заранее:
          </Txt>
          <Txt x={1000} y={560} size={28} color={C.green}>
            приливы греют недра
          </Txt>
        </g>
      )}
      <Note x={450} y={790} text="рисунок по описанию, не снимок «Вояджера»" />
    </Stage>
  );
};

// ── t05: прогнозы 1980 года и проверка временем ──
export const Forecasts: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rows = [
    { what: "Титан: атмосфера из азота?", then: "предположение Сагана", now: "2005: почти целиком азот", beat: 0, k2: 1 },
    { what: "«Вояджеры» за границей солнечного ветра", then: "ожидание: середина XXI века", now: "фактически 2012 и 2018", beat: 2, k2: 2 },
  ];
  return (
    <Stage host={c.p.host}>
      <Txt x={640} y={190} size={32} color={C.dim}>
        прогноз 1980 года → проверка (примечания переводчика)
      </Txt>
      {rows.map((r, i) => {
        const k = pop(t, at(c, r.beat) + 0.3);
        if (k <= 0) return null;
        const res = ramp(t, at(c, r.k2) + (i ? 2.5 : 0.6), 0.7);
        const y = 330 + i * 250;
        return (
          <g key={r.what} transform={`translate(0 ${y})`} opacity={clamp01(k)}>
            <Panel x={40} y={-90} w={1200} h={200} r={28} />
            <Txt x={80} y={-35} size={32} anchor="start">
              {r.what}
            </Txt>
            <Txt x={80} y={20} size={28} anchor="start" color={C.dim}>
              {r.then}
            </Txt>
            <g opacity={res}>
              <Arrow x1={560} y1={65} x2={620} y2={65} k={res} color={C.green} w={5} />
              <Txt x={640} y={76} size={28} anchor="start" color={C.green}>
                {r.now}
              </Txt>
            </g>
          </g>
        );
      })}
    </Stage>
  );
};

// ── l01: смотреть далеко — смотреть в прошлое ──
export const LookBack: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = [
    { label: "друг в трёх метрах", time: "стомиллионная доля секунды", beat: 0 },
    { label: "Солнце", time: "восемь минут", beat: 1 },
    { label: "далёкая галактика", time: "время в пути света", beat: 1.5 },
  ];
  const deep = ramp(t, at(c, 2), 1);
  return (
    <Stage host={c.p.host}>
      <line x1={80} y1={360} x2={1200} y2={360} stroke={C.faint} strokeWidth={4} />
      {items.map((it, i) => {
        const k = pop(t, at(c, it.beat) + 0.3);
        if (k <= 0) return null;
        const x = 200 + i * 440;
        return (
          <g key={it.label} transform={`translate(${x} 360) scale(${k})`}>
            {i === 0 && <circle cy={-110} r={50} fill={C.coral} />}
            {i === 1 && <Star x={0} y={-110} r={56} color={C.amber} />}
            {i === 2 && <Galaxy x={0} y={-110} s={0.4} n={120} dot={2.6} />}
            <circle r={12} fill={C.yellow} />
            <Txt x={0} y={60} size={32}>
              {it.label}
            </Txt>
            <Txt x={0} y={104} size={26} color={C.sky}>
              {it.time}
            </Txt>
          </g>
        );
      })}
      {deep > 0 && (
        <g opacity={deep}>
          <Panel x={240} y={640} w={800} h={120} r={28} stroke={C.yellow} />
          <Txt x={640} y={715} size={36} color={C.yellow}>
            время = расстояние ÷ скорость света
          </Txt>
        </g>
      )}
      <Note x={640} y={570} text="дальше по линии — глубже в прошлое" o={ramp(t, 1, 0.6)} />
    </Stage>
  );
};

// ── l03: мысленный эксперимент: рядом со световой волной ──
export const LightRide: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const same = ramp(t, at(c, 1), 0.8);
  const test = pop(t, at(c, 2) + 0.4);
  const pts: string[] = [];
  for (let x = 0; x <= 1000; x += 10) pts.push(`${100 + x},${330 + Math.sin(x / 60 - t * 3) * 60}`);
  return (
    <Stage host={c.p.host}>
      <polyline points={pts.join(" ")} fill="none" stroke={C.sky} strokeWidth={6} />
      <g transform={`translate(${200 + Math.min(1, t / 4) * 500} 260)`}>
        <circle r={30} fill={C.yellow} />
        <Txt x={0} y={-50} size={26} color={C.yellow}>
          наблюдатель
        </Txt>
      </g>
      <Note x={640} y={470} text="мысленный эксперимент — опыт, поставленный в голове" />
      {same > 0 && (
        <g opacity={same}>
          <Tag x={640} y={560} text="скорость света одинакова для всех" color={C.sky} size={34} />
        </g>
      )}
      {test > 0 && (
        <g transform={`translate(640 700) scale(${test})`}>
          <Panel x={-430} y={-60} w={860} h={120} r={28} stroke={C.green} />
          <Txt x={0} y={-6} size={30}>
            проверки: часы после полёта отстают,
          </Txt>
          <Txt x={0} y={36} size={30} color={C.green}>
            ускорители учитывают эффект
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l04: звездолёты на бумаге ──
export const StarshipPaper: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fc = pop(t, at(c, 1) + 0.3);
  const rule = pop(t, at(c, 2) + 0.3);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={350} y={380}>
        <g>
          <rect x={-240} y={-170} width={480} height={340} rx={10} fill="#e9eef8" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={-240} y1={-170 + i * 40} x2={240} y2={-170 + i * 40} stroke="#b9c6e0" strokeWidth={2} />
          ))}
          <path d="M -150 40 L 120 -40 L 150 -20 L -120 60 Z" fill="none" stroke={C.ink} strokeWidth={5} />
          <path d="M -150 40 L -190 70 M -120 60 L -170 95" stroke={C.ink} strokeWidth={4} />
          <Txt x={0} y={140} size={26} color={C.ink}>
            расчёт на бумаге
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 0) + 1.6} x={950} y={250}>
        <g>
          <Txt x={0} y={0} size={32}>
            0,1 скорости света
          </Txt>
          <Txt x={0} y={50} size={40} color={C.yellow}>
            ≈ 43 года до ближайшей звезды
          </Txt>
        </g>
      </Pop>
      {fc > 0 && (
        <g transform={`translate(950 450) scale(${fc})`}>
          <Tag x={0} y={0} text="двигатель «через десятилетия» — прогноз" color={C.coral} size={28} />
        </g>
      )}
      {rule > 0 && (
        <g transform={`translate(640 690) scale(${rule})`}>
          <Panel x={-470} y={-70} w={940} h={140} r={30} />
          <Txt x={-230} y={-8} size={30} color={C.green}>
            в будущее — можно
          </Txt>
          <Txt x={230} y={-8} size={30} color={C.coral}>
            в прошлое — закрыто
          </Txt>
          <Txt x={0} y={44} size={26} color={C.dim}>
            машины времени нет
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── l05: планеты у других звёзд: ожидание → наблюдение ──
export const Exoplanets: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const found = ramp(t, at(c, 1) + 0.6, 2.4);
  const stars = Array.from({ length: 40 }).map((_, i) => ({ x: 120 + rnd(i + 5) * 1040, y: 200 + rnd(i + 55) * 460, p: rnd(i + 99) < found }));
  return (
    <Stage host={c.p.host}>
      {stars.map((s, i) => (
        <g key={i}>
          <circle cx={s.x} cy={s.y} r={6} fill="#fff5d6" />
          {s.p && <circle cx={s.x} cy={s.y} r={20} fill="none" stroke={C.green} strokeWidth={3} />}
          {s.p && <circle cx={s.x + 20} cy={s.y} r={5} fill={C.sky} />}
        </g>
      ))}
      <Pop t={t} at={at(c, 0) + 0.6} x={640} y={140}>
        <Tag x={0} y={0} text="1980: ожидание, заявки противоречат" color={C.coral} size={32} />
      </Pop>
      {found > 0.2 && (
        <g opacity={clamp01((found - 0.2) * 2)}>
          <Tag x={640} y={760} text="к концу 2018 года: ≈ 4000 планет (прим. пер.)" color={C.green} size={32} />
        </g>
      )}
      <Note x={640} y={850} text="схема, не карта неба" />
    </Stage>
  );
};


// ── t04: путь снимка: спутник → зонд → радиосигнал → антенны → команда ──
export const SignalPath: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sig = ramp(t, at(c, 0) + 1.2, 3);
  const team = pop(t, at(c, 1) + 1.8);
  const ants = [0, 1, 2].map((i) => pop(t, at(c, 1) + 0.3 + i * 0.4));
  return (
    <Stage host={c.p.host}>
      <circle cx={110} cy={250} r={60} fill="#d9cdb8" />
      <Txt x={110} y={350} size={26} color={C.dim}>
        Европа
      </Txt>
      <Probe x={340} y={250} s={0.9} rot={-8} />
      {Array.from({ length: 6 }).map((_, i) => {
        const u = clamp01(sig * 1.2 - i * 0.12);
        return u > 0 && u < 1 ? <path key={i} d={`M ${430 + u * 520} ${270 + u * 200} a 26 26 0 0 1 0 40`} fill="none" stroke={C.cyan} strokeWidth={4} opacity={1 - u * 0.5} /> : null;
      })}
      <Note x={690} y={300} text="≈ полмиллиарда километров" o={sig} />
      {["Испания", "Мохаве", "Австралия"].map((n, i) => {
        const k = ants[i];
        if (k <= 0) return null;
        return (
          <g key={n} transform={`translate(${830 + i * 150} 560) scale(${k * 0.55})`}>
            <path d="M -50 120 L 0 20 L 50 120 Z" fill={C.deep} stroke={C.steel} strokeWidth={8} />
            <path d="M -110 -10 Q 0 90 110 -10 Z" fill="#e8eefc" stroke={C.dim} strokeWidth={6} transform="rotate(-25)" />
            <Txt x={0} y={190} size={40} color={C.dim}>
              {n}
            </Txt>
          </g>
        );
      })}
      {team > 0 && (
        <g transform={`translate(640 780) scale(${team})`}>
          <Tag x={0} y={0} text="команда превращает сигнал в снимок" color={C.yellow} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── l02: квазары: больше вдали — то есть в прошлом ──
export const Quasars: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fill = ramp(t, at(c, 1) + 0.3, 2);
  const note = pop(t, at(c, 1) + 3);
  const shells = [110, 210, 310];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(520 470)">
        {shells.map((r) => (
          <circle key={r} r={r} fill="none" stroke={C.faint} strokeWidth={3} strokeDasharray="8 10" />
        ))}
        <circle r={14} fill={C.yellow} />
        <Txt x={0} y={44} size={24} color={C.yellow}>
          мы
        </Txt>
        {Array.from({ length: 36 }).map((_, i) => {
          const ring = i < 4 ? 0 : i < 13 ? 1 : 2;
          const a = rnd(i + 7) * Math.PI * 2;
          const r = shells[ring] - 30 - rnd(i + 3) * 50;
          const show = clamp01(fill * 3 - ring);
          return show > 0 ? <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.85} r={7} fill={C.violet} opacity={show} /> : null;
        })}
        <Txt x={0} y={-shells[2] - 16} size={26} color={C.dim}>
          дальше = раньше
        </Txt>
      </g>
      {note > 0 && (
        <g transform={`translate(1060 360) scale(${note})`}>
          <Panel x={-200} y={-90} w={400} h={180} r={26} stroke={C.blue} />
          <Txt x={0} y={-30} size={24} color={C.dim}>
            примечание переводчика:
          </Txt>
          <Txt x={0} y={14} size={28}>
            активные ядра
          </Txt>
          <Txt x={0} y={54} size={28}>
            молодых галактик
          </Txt>
        </g>
      )}
      <Note x={520} y={840} text="точки — квазары, схема без масштаба" o={fill} />
    </Stage>
  );
};
