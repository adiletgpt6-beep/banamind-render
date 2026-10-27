// Часть «Расширение»: ближайшая звезда и другие галактики, спектр и красное
// смещение, закон Хаббла без центра, три сценария Фридмана, реликтовое излучение,
// сингулярность «если ОТО верна», что узнали после книги.
import React from "react";
import { C } from "../theme";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Galaxy, Note, Spark, Spectrum, Stage, Sun, Telescope } from "./space";

// ── e01: от ближайшей звезды к другим галактикам ──
export const Galaxies: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const zoom = ramp(t, at(c, 1), 2);
  const many = ramp(t, at(c, 2), 1.4);
  const sun = pop(t, at(c, 3));
  const s = 1 - zoom * 0.6;
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - zoom}>
        <Sun x={240} y={460} r={50} t={t} />
        <Spark x={1000} y={460} r={22} color={C.coral} />
        <Arrow x1={300} y1={460} x2={970} y2={460} k={ramp(t, 0.5, 1.5)} color={C.yellow} w={5} />
        <Txt x={620} y={420} size={34} color={C.yellow}>
          ≈ 4 световых года
        </Txt>
        <Txt x={1000} y={530} size={26} color={C.dim}>
          ближайшая звезда
        </Txt>
      </g>
      {zoom > 0 && (
        <g opacity={zoom}>
          <Galaxy x={640} y={460} s={2.2 * s + 0.6} t={t} color={C.sky} tilt={0.5} />
          <Txt x={640} y={760} size={32} opacity={1 - many}>
            Млечный Путь — вся Вселенная?
          </Txt>
        </g>
      )}
      {many > 0 &&
        [
          [180, 220, 0.6, C.violet],
          [1080, 250, 0.7, C.pink],
          [230, 720, 0.5, C.amber],
          [1100, 700, 0.55, C.cyan],
          [900, 140, 0.35, C.sky],
          [420, 160, 0.3, C.coral],
        ].map(([x, y, sc, col], i) => <Galaxy key={i} x={x as number} y={y as number} s={(sc as number) * many} t={t + i} color={col as string} tilt={0.35 + (i % 3) * 0.15} />)}
      {many > 0 && (
        <g opacity={many}>
          <Tag x={640} y={820} text="1924 · Хаббл: галактик много" color={C.yellow} size={36} />
        </g>
      )}
      {sun > 0 && (
        <g transform={`translate(${640 + 160} ${460 + 40}) scale(${sun})`}>
          <circle r={14} fill={C.yellow} />
          <circle r={30} fill="none" stroke={C.yellow} strokeWidth={3} />
          <Txt x={0} y={-50} size={26} color={C.yellow}>
            Солнце — в рукаве
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── e02: призма, спектр, линии поглощения, сдвиг к красному ──
export const SpectrumLab: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lines = ramp(t, at(c, 1), 0.6);
  const shift = ramp(t, at(c, 2), 1.6);
  const cosmo = pop(t, at(c, 3));
  const wave = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <Telescope x={170} y={260} s={0.7} ang={-20} />
      <g transform="translate(470 240)">
        <path d="M -60 60 L 0 -50 L 60 60 Z" fill={C.sky} opacity={0.35} stroke={C.white} strokeWidth={3} />
        <line x1={-220} y1={20} x2={-30} y2={20} stroke={C.white} strokeWidth={6} />
        {["#7a3cff", "#35d0ff", "#46e07a", "#ffe14a", "#ff3030"].map((col, i) => (
          <line key={i} x1={30} y1={20} x2={300} y2={-40 + i * 30} stroke={col} strokeWidth={5} opacity={0.85} />
        ))}
      </g>
      <g transform="translate(240 440)">
        <Txt x={0} y={-20} size={26} color={C.dim} anchor="start">
          лаборатория (неподвижный источник)
        </Txt>
        <Spectrum x={0} y={0} w={800} h={80} shift={0} lines={lines > 0 ? [0.22, 0.38, 0.55, 0.71] : []} />
      </g>
      {shift > 0 && (
        <g transform="translate(240 620)" opacity={clamp01(shift * 2)}>
          <Txt x={0} y={-20} size={26} color={C.dim} anchor="start">
            далёкая галактика
          </Txt>
          <Spectrum x={0} y={0} w={800} h={80} shift={shift} />
          <Arrow x1={300} y1={120} x2={500} y2={120} k={shift} color={C.red} w={6} />
          <Txt x={400} y={170} size={30} color={C.red}>
            к красному
          </Txt>
        </g>
      )}
      {cosmo > 0 && (
        <g transform={`translate(1150 300) scale(${cosmo})`}>
          <Panel x={-140} y={-100} w={280} h={200} />
          <path d={Array.from({ length: 60 }).map((_, i) => `${i ? "L" : "M"} ${-120 + i * 4} ${Math.sin(i * (0.6 - 0.35 * wave)) * 30}`).join(" ")} fill="none" stroke={C.coral} strokeWidth={5} />
          <Txt x={0} y={75} size={22} color={C.dim}>
            свет растянут
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── e03: закон Хаббла; у расширения нет центра ──
export const Hubble: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const exp = ramp(t, at(c, 0.3), at(c, 2) - at(c, 0.3) + 2);
  const scale = 1 + exp * 0.6;
  const other = ramp(t, at(c, 2), 0.8);
  const eins = pop(t, at(c, 3));
  const pts = Array.from({ length: 9 }).map((_, i) => ({ x: ((i % 3) - 1) * 210, y: (Math.floor(i / 3) - 1) * 170 }));
  const ref = other > 0 ? pts[2] : pts[4];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(470 470)">
        {pts.map((p, i) => {
          const x = p.x * scale;
          const y = p.y * scale;
          const isRef = p === ref;
          return (
            <g key={i}>
              {!isRef && exp > 0.1 && <Arrow x1={ref.x * scale + (x - ref.x * scale) * 0.3} y1={ref.y * scale + (y - ref.y * scale) * 0.3} x2={ref.x * scale + (x - ref.x * scale) * 0.85} y2={ref.y * scale + (y - ref.y * scale) * 0.85} k={1} color={isRef ? C.yellow : C.coral} w={3 + Math.hypot(x - ref.x * scale, y - ref.y * scale) / 180} />}
              <Galaxy x={x} y={y} s={0.38} t={t + i} color={isRef ? C.yellow : C.violet} />
            </g>
          );
        })}
      </g>
      <Pop t={t} at={0.4} x={1060} y={200}>
        <Tag x={0} y={0} text="1929 · дальше → быстрее" color={C.yellow} size={34} />
      </Pop>
      {other > 0 && (
        <g opacity={other}>
          <Panel x={860} y={330} w={400} h={200} />
          <Txt x={1060} y={410} size={32}>
            из любой галактики
          </Txt>
          <Txt x={1060} y={470} size={32} color={C.yellow}>
            та же картина
          </Txt>
          <Note x={1060} y={570} text="центра у расширения нет" />
        </g>
      )}
      {eins > 0 && (
        <g transform={`translate(1060 760) scale(${eins})`}>
          <Txt x={0} y={0} size={28} color={C.dim}>
            Эйнштейн «подпирал»
          </Txt>
          <Txt x={0} y={40} size={28} color={C.dim}>
            неподвижную Вселенную
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── e04: Фридман — два допущения и три сценария ──
export const Friedmann: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const a1 = pop(t, at(c, 1));
  const a2 = pop(t, at(c, 1.5));
  const move = pop(t, at(c, 2));
  const curves = ramp(t, at(c, 3), 2.4);
  const P = (f: (x: number) => number, k: number) =>
    Array.from({ length: 50 })
      .map((_, i) => {
        const x = (i / 49) * k;
        return `${i ? "L" : "M"} ${x * 620} ${-f(x) * 330}`;
      })
      .join(" ");
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={320} y={170}>
        <Tag x={0} y={0} text="1922 · Фридман" color={C.yellow} size={36} />
      </Pop>
      {a1 > 0 && (
        <g transform={`translate(320 300) scale(${a1})`}>
          <Txt x={0} y={0} size={28}>
            1) одинаково во всех направлениях
          </Txt>
        </g>
      )}
      {a2 > 0 && (
        <g transform={`translate(320 350) scale(${a2})`}>
          <Txt x={0} y={0} size={28}>
            2) так же из любой точки
          </Txt>
        </g>
      )}
      {move > 0 && (
        <g transform={`translate(1000 300) scale(${move})`}>
          <Tag x={0} y={0} text="на месте стоять не может" color={C.white} size={30} />
        </g>
      )}
      <g transform="translate(260 820)" opacity={ramp(t, at(c, 3) - 0.5)}>
        <Arrow x1={0} y1={0} x2={720} y2={0} k={1} color={C.dim} w={4} />
        <Arrow x1={0} y1={0} x2={0} y2={-380} k={1} color={C.dim} w={4} />
        <Txt x={720} y={40} size={24} color={C.dim} anchor="end">
          время
        </Txt>
        <Txt x={10} y={-395} size={24} color={C.dim} anchor="start">
          расстояние между галактиками
        </Txt>
        <path d={P((x) => Math.max(0, Math.sin(x * Math.PI) * 0.85), clamp01(curves * 3))} fill="none" stroke={C.coral} strokeWidth={6} />
        <path d={P((x) => Math.min(1.1, Math.sqrt(x) * 1.1), clamp01(curves * 3 - 1))} fill="none" stroke={C.sky} strokeWidth={6} />
        <path d={P((x) => Math.pow(x, 0.62) * 0.95, clamp01(curves * 3 - 2))} fill="none" stroke={C.yellow} strokeWidth={6} strokeDasharray="14 8" />
        {curves > 0.98 && (
          <g>
            <Txt x={830} y={-340} size={24} color={C.sky} anchor="start">
              вечно
            </Txt>
            <Txt x={830} y={-290} size={24} color={C.yellow} anchor="start">
              на границе
            </Txt>
            <Txt x={830} y={-20} size={24} color={C.coral} anchor="start">
              сжатие
            </Txt>
          </g>
        )}
      </g>
    </Stage>
  );
};

// ── e05: антенна и реликтовое излучение со всех сторон ──
export const Cmb: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const noise = ramp(t, 0.6, 1);
  const bird = pop(t, at(c, 1));
  const echo = ramp(t, at(c, 2), 1.2);
  const hot = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 600)">
        <path d="M -150 -40 L 60 -200 L 160 40 Z" fill={C.dim} stroke={C.text} strokeWidth={4} />
        <rect x={-30} y={20} width={60} height={160} fill={C.steel} />
        <Txt x={0} y={240} size={26} color={C.dim}>
          рупорная антенна, 1965
        </Txt>
        {bird > 0 && (
          <g transform={`translate(60 -150) scale(${bird})`}>
            <path d="M -20 0 Q 0 -20 20 0 Q 0 -8 -20 0" fill={C.text} />
            <Txt x={70} y={-30} size={24} color={C.dim} anchor="start">
              почистили — шум остался
            </Txt>
          </g>
        )}
      </g>
      {/* шум со всех сторон */}
      {noise > 0 &&
        Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const r = 240 + ((t * 60 + i * 37) % 220);
          return (
            <path
              key={i}
              d={`M ${330 + Math.cos(a) * r} ${520 + Math.sin(a) * r * 0.7} q 10 -12 20 0 q 10 12 20 0`}
              fill="none"
              stroke={C.cyan}
              strokeWidth={3}
              opacity={noise * 0.6 * (1 - (r - 240) / 220)}
              transform={`rotate(${(a * 180) / Math.PI + 90} ${330 + Math.cos(a) * r} ${520 + Math.sin(a) * r * 0.7})`}
            />
          );
        })}
      {echo > 0 && (
        <g opacity={echo} transform="translate(950 430)">
          <ellipse rx={260} ry={150} fill="#2b3f8a" />
          {Array.from({ length: 70 }).map((_, i) => {
            const x = Math.cos(i * 7.3) * 230 * Math.abs(Math.sin(i * 1.7));
            const y = Math.sin(i * 7.3) * 130 * Math.abs(Math.cos(i * 2.3));
            return <circle key={i} cx={x} cy={y} r={14 + (i % 4) * 4} fill={i % 3 ? "#ff9b5a" : "#5fa0ff"} opacity={0.35} />;
          })}
          <Txt x={0} y={210} size={30}>
            остывший свет ранней Вселенной
          </Txt>
          <Note x={0} y={250} text="схема карты неба, цвета условные" />
        </g>
      )}
      {hot > 0 && (
        <g transform={`translate(950 800) scale(${hot})`}>
          <Tag x={0} y={0} text="была плотнее и горячее" color={C.green} size={34} textColor={C.night} />
        </g>
      )}
    </Stage>
  );
};

// ── e06: прокрутка назад к сингулярности и знак «если» ──
export const Singularity: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const back = ramp(t, 0.4, at(c, 1) + 0.5);
  const sing = pop(t, at(c, 1));
  const thm = pop(t, at(c, 2));
  const iff = pop(t, at(c, 3));
  const sc = 1 - back * 0.97;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 480)">
        {Array.from({ length: 10 }).map((_, i) => {
          const a = i * 0.63;
          const r = (140 + (i % 3) * 70) * sc;
          return <Galaxy key={i} x={Math.cos(a) * r} y={Math.sin(a) * r * 0.8} s={0.3} t={t + i} color={C.violet} />;
        })}
        <circle r={30 + back * 50} fill={C.amber} opacity={back * 0.5} />
        {sing > 0 && (
          <g transform={`scale(${sing})`}>
            <circle r={14} fill={C.white} />
            <Txt x={0} y={150} size={34} color={C.yellow}>
              сингулярность
            </Txt>
            <Txt x={0} y={195} size={26} color={C.dim}>
              здесь теория перестаёт работать
            </Txt>
          </g>
        )}
        <Txt x={0} y={-300} size={28} color={C.dim}>
          ← прокрутка расширения назад
        </Txt>
      </g>
      {thm > 0 && (
        <g transform={`translate(1000 330) scale(${thm})`}>
          <Panel x={-230} y={-120} w={460} h={240} />
          <Txt x={0} y={-40} size={30}>
            1970 · Хокинг и Пенроуз
          </Txt>
          <Txt x={0} y={20} size={30} color={C.violet}>
            начало неизбежно…
          </Txt>
        </g>
      )}
      {iff > 0 && (
        <g transform={`translate(1000 610) scale(${iff})`}>
          <Txt x={0} y={0} size={110} color={C.yellow}>
            ЕСЛИ
          </Txt>
          <Txt x={0} y={70} size={28}>
            ОТО верна до конца
          </Txt>
          <Txt x={0} y={115} size={26} color={C.pink}>
            кванты могут всё изменить
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── e07: книга ↔ после книги ──
export const AfterBook: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const nw = pop(t, at(c, 1));
  const dark = ramp(t, at(c, 2), 0.8);
  const age = pop(t, at(c, 3));
  const bend = ramp(t, at(c, 1) + 0.6, 1.5);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={320} y={220}>
        <Panel x={-260} y={-90} w={520} h={300} stroke={C.skyDeep} sw={4} />
        <Txt x={0} y={-20} size={30} color={C.sky}>
          в книге (1980-е)
        </Txt>
        <Txt x={0} y={40} size={30}>
          возраст 10–20 млрд лет
        </Txt>
        <Txt x={0} y={100} size={30}>
          расширение замедляется?
        </Txt>
      </Pop>
      {nw > 0 && (
        <g transform={`translate(950 380) scale(${nw})`}>
          <Panel x={-290} y={-220} w={580} h={440} stroke={C.orange} sw={4} />
          <Txt x={0} y={-160} size={30} color={C.orange}>
            после книги · 1998
          </Txt>
          <g transform="translate(-220 120)">
            <Arrow x1={0} y1={0} x2={440} y2={0} k={1} color={C.dim} w={3} />
            <path d={`M 0 0 Q 200 -${60 + bend * 0} 260 -110 Q 340 -${150 + bend * 60} 440 -${200 + bend * 80}`} fill="none" stroke={C.orange} strokeWidth={6} />
            <path d="M 0 0 Q 200 -60 260 -110 Q 340 -150 440 -180" fill="none" stroke={C.dim} strokeWidth={4} strokeDasharray="8 8" opacity={0.6} />
            <Txt x={220} y={50} size={24} color={C.dim}>
              время → сейчас
            </Txt>
          </g>
          <Txt x={0} y={-90} size={34}>
            расширение ускоряется
          </Txt>
          <Txt x={0} y={200} size={22} color={C.dim}>
            сверхновые · Нобелевская премия 2011
          </Txt>
        </g>
      )}
      {dark > 0 && (
        <g opacity={dark} transform="translate(320 620)">
          <circle r={70} fill="#000" stroke={C.violet} strokeWidth={4} strokeDasharray="6 8" />
          <Txt x={0} y={14} size={50} color={C.violet}>
            ?
          </Txt>
          <Txt x={0} y={120} size={30}>
            «тёмная энергия»
          </Txt>
        </g>
      )}
      {age > 0 && (
        <g transform={`translate(950 790) scale(${age})`}>
          <Tag x={0} y={0} text="«Планк»: ≈ 13,8 млрд лет" color={C.orange} size={36} textColor={C.night} />
        </g>
      )}
    </Stage>
  );
};
