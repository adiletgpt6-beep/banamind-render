// Часть «Чёрные дыры»: равновесие звезды и её остатки, «тёмные звёзды» Мичелла,
// наклон световых конусов и горизонт, два наблюдателя, приливные силы, «нет волос»,
// Лебедь X-1, после книги — LIGO и EHT, площадь горизонта и энтропия, излучение
// Хокинга (упрощённая картинка с оговоркой), первичные дыры. Все изображения
// чёрных дыр — художественные схемы, не снимки телескопов.
import React from "react";
import { C } from "../theme";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Astronaut, BlackHole, Clock, LightCone, Note, Photon, Rocket, Spark, Stage, Sun, Wave } from "./space";

// ── b01: звезда — спор гравитации и давления; белый карлик, нейтронная звезда, предел ──
export const StarLife: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bal = ramp(t, at(c, 1), 0.8);
  const shrink = ramp(t, at(c, 2), 1.4);
  const limit = pop(t, at(c, 3));
  const r = 150 - shrink * 110;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(360 450)">
        <Sun x={0} y={0} r={r} t={t} color={shrink > 0.5 ? "#cfe3ff" : C.amber} />
        {bal > 0 &&
          [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            const R = r + 70;
            return (
              <g key={i} opacity={bal * (1 - shrink)}>
                <Arrow x1={Math.cos(a) * (R + 60)} y1={Math.sin(a) * (R + 60)} x2={Math.cos(a) * (R + 5)} y2={Math.sin(a) * (R + 5)} k={1} color={C.violet} w={5} />
                <Arrow x1={Math.cos(a + 0.2) * (r + 10)} y1={Math.sin(a + 0.2) * (r + 10)} x2={Math.cos(a + 0.2) * (r + 55)} y2={Math.sin(a + 0.2) * (r + 55)} k={1} color={C.orange} w={5} />
              </g>
            );
          })}
        {bal > 0 && shrink < 0.3 && (
          <g opacity={bal}>
            <Txt x={-230} y={-260} size={26} color={C.violet} anchor="start">
              гравитация сжимает
            </Txt>
            <Txt x={-230} y={300} size={26} color={C.orange} anchor="start">
              жар реакций давит наружу
            </Txt>
          </g>
        )}
      </g>
      {shrink > 0.6 && (
        <g opacity={ramp(t, at(c, 2) + 0.9)} transform="translate(940 300)">
          <circle cx={-140} cy={0} r={34} fill="#e6f0ff" />
          <Txt x={-140} y={80} size={24}>
            белый карлик
          </Txt>
          <circle cx={120} cy={0} r={16} fill="#a8d0ff" />
          <circle cx={120} cy={0} r={30} fill="none" stroke={C.sky} strokeWidth={2} opacity={0.6} />
          <Txt x={120} y={80} size={24}>
            нейтронная звезда
          </Txt>
        </g>
      )}
      {limit > 0 && (
        <g transform={`translate(940 610) scale(${limit})`}>
          <Panel x={-280} y={-110} w={560} h={240} />
          <Txt x={0} y={-40} size={30}>
            предел Чандрасекара
          </Txt>
          <Txt x={0} y={20} size={28} color={C.sky}>
            в книге: ~1,5 массы Солнца
          </Txt>
          <Txt x={0} y={70} size={28} color={C.orange}>
            сегодня: ≈ 1,4
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── b02: Мичелл (1783) и слово Уилера (1969) ──
export const DarkStar: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const gr = pop(t, at(c, 1));
  const name = pop(t, at(c, 2));
  const ph = (t * 0.6) % 1;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(380 470)">
        <circle r={110} fill="#1a1020" stroke={C.dim} strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((i) => {
          const a = -Math.PI / 2 + (i - 2) * 0.45;
          const h = Math.sin(ph * Math.PI) * 170;
          return <Photon key={i} x={Math.cos(a) * (115 + h)} y={Math.sin(a) * (115 + h)} r={8} />;
        })}
        <Txt x={0} y={190} size={28}>
          свет падает обратно
        </Txt>
        <Tag x={0} y={-330} text="1783 · Джон Мичелл" color={C.yellow} size={32} />
      </g>
      {gr > 0 && (
        <g transform={`translate(970 330) scale(${gr})`}>
          <Panel x={-250} y={-90} w={500} h={180} />
          <Txt x={0} y={-10} size={30}>
            точное описание —
          </Txt>
          <Txt x={0} y={40} size={30} color={C.sky}>
            общая теория относительности
          </Txt>
        </g>
      )}
      {name > 0 && (
        <g transform={`translate(970 620) scale(${name})`}>
          <Txt x={0} y={0} size={60} color={C.text}>
            «чёрная дыра»
          </Txt>
          <Txt x={0} y={60} size={28} color={C.dim}>
            1969 · Джон Уилер
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── b03: световые конусы наклоняются внутрь → горизонт ──
export const Horizon: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const tilt = ramp(t, 0.4, at(c, 1.6));
  const hz = pop(t, at(c, 2));
  const vac = pop(t, at(c, 3));
  const xs = [-420, -280, -150, -40];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(700 480)">
        <circle r={60 + (1 - tilt) * 40} fill="#000" stroke={C.orange} strokeWidth={3} />
        {xs.map((x, i) => {
          const d = Math.abs(x);
          const lean = tilt * (1 - d / 520) * 60;
          return <LightCone key={i} x={x} y={0} h={70} k={1} tilt={lean} narrow={1 - tilt * (1 - d / 520) * 0.5} labels={false} />;
        })}
        {hz > 0 && (
          <g opacity={hz}>
            <circle r={120} fill="none" stroke={C.yellow} strokeWidth={5} strokeDasharray="14 10" />
            <Txt x={0} y={-160} size={32} color={C.yellow}>
              горизонт событий
            </Txt>
            <Txt x={0} y={200} size={26} color={C.dim}>
              не стенка, а граница без возврата
            </Txt>
          </g>
        )}
      </g>
      <Txt x={260} y={250} size={28} color={C.dim} opacity={ramp(t, 0.5)}>
        будущее света
      </Txt>
      <Txt x={260} y={290} size={28} color={C.dim} opacity={ramp(t, 0.5)}>
        наклоняется внутрь
      </Txt>
      {vac > 0 && (
        <g transform={`translate(640 820) scale(${vac})`}>
          <Tag x={0} y={0} text="издалека — как обычное тело той же массы" color={C.white} size={30} />
        </g>
      )}
    </Stage>
  );
};

// ── b04: астронавт шлёт сигналы, корабль получает всё реже и краснее ──
export const TwoObservers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const own = ramp(t, at(c, 1), 0.6);
  const far = ramp(t, at(c, 2), 0.6);
  const fall = clamp01((t - 0.5) / Math.max(1, c.dur - 1));
  const ax = 330 + fall * 170;
  const n = 6;
  return (
    <Stage host={c.p.host}>
      <BlackHole x={560} y={500} r={90} t={t} disk={0.25} />
      <circle cx={560} cy={500} r={96} fill="none" stroke={C.yellow} strokeWidth={3} strokeDasharray="10 8" />
      <Astronaut x={ax} y={480} s={0.55} t={t} />
      <Rocket x={1150} y={300} s={0.6} ang={-90} t={t} flame={0} />
      {/* сигналы: всё реже и краснее */}
      {Array.from({ length: n }).map((_, i) => {
        const delay = i * (1 + i * 0.6);
        const p = clamp01((t - 0.8 - delay) / 3);
        if (p <= 0 || p >= 1) return null;
        const red = i / n;
        return <Photon key={i} x={ax + (1120 - ax) * p} y={470 + (300 - 470) * p} r={10 - red * 4} color={red > 0.5 ? C.red : red > 0.25 ? C.orange : C.yellow} />;
      })}
      {own > 0 && (
        <g opacity={own} transform="translate(300 760)">
          <Clock x={0} y={0} r={50} phase={t * 0.5} color={C.yellow} />
          <Txt x={0} y={90} size={24}>
            у астронавта: обычные секунды
          </Txt>
        </g>
      )}
      {far > 0 && (
        <g opacity={far} transform="translate(1000 640)">
          <Clock x={0} y={0} r={50} phase={t * 0.12} color={C.red} />
          <Txt x={0} y={90} size={24}>
            на корабле: реже, краснее, тусклее
          </Txt>
          <Note x={0} y={130} text="последнего сигнала не дождутся" />
        </g>
      )}
    </Stage>
  );
};

// ── b05: приливное растяжение; маленькая и огромная дыра ──
export const Tidal: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pull = ramp(t, at(c, 0.5), 1.2);
  const spag = ramp(t, at(c, 1), 1.6);
  const big = pop(t, at(c, 2));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 480)">
        <BlackHole x={0} y={260} r={70} t={t} disk={0.3} />
        <Astronaut x={0} y={-90 + spag * 40} s={0.8} t={0} stretch={1 + spag * 1.3} />
        {pull > 0 && (
          <g opacity={pull * (1 - spag * 0.6)}>
            <Arrow x1={70} y1={10} x2={70} y2={110} k={1} color={C.red} w={8} />
            <Arrow x1={70} y1={-150} x2={70} y2={-110} k={1} color={C.orange} w={5} />
            <Txt x={110} y={60} size={24} color={C.red} anchor="start">
              ноги — сильнее
            </Txt>
            <Txt x={110} y={-130} size={24} color={C.orange} anchor="start">
              голова — слабее
            </Txt>
          </g>
        )}
        <Txt x={0} y={400} size={26} color={C.dim}>
          дыра в несколько масс Солнца
        </Txt>
      </g>
      {big > 0 && (
        <g transform={`translate(960 430) scale(${big})`}>
          <circle r={230} fill="#000" />
          <circle r={236} fill="none" stroke={C.yellow} strokeWidth={4} strokeDasharray="12 10" />
          <Astronaut x={-170} y={-150} s={0.4} t={t} />
          <Txt x={0} y={20} size={28} color={C.text}>
            огромная дыра:
          </Txt>
          <Txt x={0} y={60} size={26} color={C.dim}>
            горизонт — почти незаметно
          </Txt>
          <Note x={0} y={290} text="опасность зависит от массы" />
        </g>
      )}
    </Stage>
  );
};

// ── b06: «нет волос»: разное вещество → три числа ──
export const NoHair: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fall = ramp(t, 0.6, at(c, 1) - 0.4);
  const three = ramp(t, at(c, 1), 1.2);
  const lost = ramp(t, at(c, 3), 0.8);
  const things = [
    { col: C.amber, shape: "star" },
    { col: C.sky, shape: "cloud" },
    { col: C.green, shape: "box" },
  ];
  return (
    <Stage host={c.p.host}>
      {things.map((th, i) => {
        const x0 = 150 + i * 220;
        const x = x0 + (360 - x0) * fall;
        const y = 220 + fall * 260;
        const s = 1 - fall * 0.8;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - fall * 0.9}>
            {th.shape === "star" && <Spark x={0} y={0} r={50} color={th.col} />}
            {th.shape === "cloud" && <ellipse rx={60} ry={36} fill={th.col} />}
            {th.shape === "box" && <rect x={-40} y={-40} width={80} height={80} rx={10} fill={th.col} />}
          </g>
        );
      })}
      <BlackHole x={360} y={560} r={90} t={t} disk={0.5} />
      {three > 0 &&
        ["масса", "вращение", "заряд"].map((w, i) => {
          const k = pop(t, at(c, 1) + 0.4 + i * 0.5);
          return (
            <g key={w} transform={`translate(950 ${280 + i * 120}) scale(${k})`}>
              <Tag x={0} y={0} text={w} color={[C.yellow, C.sky, C.coral][i]} size={40} />
            </g>
          );
        })}
      {pop(t, at(c, 2)) > 0 && (
        <Txt x={950} y={680} size={30} color={C.dim} opacity={ramp(t, at(c, 2))}>
          «у чёрной дыры нет волос»
        </Txt>
      )}
      {lost > 0 && (
        <g opacity={lost}>
          <Tag x={640} y={820} text="а информация? — спор не решён" color={C.pink} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── b07: звезда-компаньон, аккреционный диск, рентген ──
export const Cygnus: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const disk = ramp(t, at(c, 1), 1.2);
  const bet = pop(t, at(c, 2));
  const a = t * 0.7;
  const sx = 640 + Math.cos(a) * 330;
  const sy = 440 + Math.sin(a) * 110;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={320} y={180}>
        <Txt x={0} y={0} size={30} color={C.dim}>
          «чёрный кот в тёмной комнате»
        </Txt>
      </Pop>
      <ellipse cx={640} cy={440} rx={330} ry={110} fill="none" stroke={C.glassLine} strokeWidth={2} strokeDasharray="8 10" />
      <BlackHole x={640} y={440} r={40} t={t} disk={disk} tilt={0.3} />
      {disk > 0 && (
        <path d={`M ${sx} ${sy} Q ${(sx + 640) / 2} ${sy - 120} 700 440`} fill="none" stroke={C.amber} strokeWidth={10 * disk} opacity={0.6} />
      )}
      <Sun x={sx} y={sy} r={60} t={t} color="#7fb6ff" />
      {disk > 0.5 &&
        [0, 1, 2].map((i) => {
          const r = ((t * 90 + i * 60) % 180) + 40;
          return <circle key={i} cx={640} cy={440} r={r} fill="none" stroke={C.cyan} strokeWidth={3} opacity={(1 - r / 220) * disk} />;
        })}
      {disk > 0.5 && (
        <Txt x={640} y={660} size={28} color={C.cyan}>
          горячий газ светится рентгеном
        </Txt>
      )}
      {bet > 0 && (
        <g transform={`translate(640 800) scale(${bet})`}>
          <Tag x={0} y={0} text="Лебедь X-1 · пари Хокинга и Торна, 1975" color={C.yellow} size={32} />
        </g>
      )}
      <Note x={1100} y={180} text="схема, не снимок" />
    </Stage>
  );
};

// ── b08: LIGO (2015) и тень дыры EHT (2019, 2022) ──
export const LigoEht: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const merge = ramp(t, at(c, 1), 2.4);
  const chirp = ramp(t, at(c, 1) + 0.6, 2);
  const eht = pop(t, at(c, 2));
  const sep = 110 * (1 - merge * 0.85);
  const ang = t * (2 + merge * 10);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={330} y={170}>
        <Panel x={-280} y={-60} w={560} h={110} stroke={C.skyDeep} sw={3} />
        <Txt x={0} y={10} size={26} color={C.sky}>
          в книге: «волны пока не поймали»
        </Txt>
      </Pop>
      <g transform="translate(330 430)">
        {merge < 0.98 ? (
          <>
            <BlackHole x={Math.cos(ang) * sep} y={Math.sin(ang) * sep * 0.5} r={34} t={t} disk={0} />
            <BlackHole x={-Math.cos(ang) * sep} y={-Math.sin(ang) * sep * 0.5} r={30} t={t} disk={0} />
          </>
        ) : (
          <BlackHole x={0} y={0} r={46} t={t} disk={0} />
        )}
        {[0, 1, 2, 3].map((i) => {
          const r = ((t * 120 + i * 60) % 240) + 60;
          return <ellipse key={i} rx={r} ry={r * 0.5} fill="none" stroke={C.violet} strokeWidth={3} opacity={(1 - r / 300) * clamp01(merge * 3)} />;
        })}
      </g>
      {chirp > 0 && (
        <g transform="translate(70 700)">
          <path
            d={Array.from({ length: 200 })
              .map((_, i) => {
                const x = (i / 199) * 520 * chirp;
                const q = x / 520;
                const amp = 10 + 60 * q ** 3 * (q < 0.92 ? 1 : Math.max(0, 1 - (q - 0.92) * 12));
                return `${i ? "L" : "M"} ${x} ${Math.sin(q * q * 70) * amp}`;
              })
              .join(" ")}
            fill="none"
            stroke={C.orange}
            strokeWidth={4}
          />
          <Tag x={260} y={130} text="2015 · LIGO" color={C.orange} size={34} textColor={C.night} />
        </g>
      )}
      {eht > 0 && (
        <g transform={`translate(970 420) scale(${eht})`}>
          <circle r={190} fill="#05050a" />
          <circle r={110} fill="none" stroke="#ff9a3a" strokeWidth={38} opacity={0.85} />
          <path d="M -110 0 A 110 110 0 0 1 110 0" fill="none" stroke="#ffd58a" strokeWidth={30} opacity={0.6} transform={`rotate(${200 + Math.sin(t) * 5})`} />
          <circle r={72} fill="#000" />
          <Tag x={0} y={260} text="2019 · 2022 · EHT" color={C.orange} size={34} textColor={C.night} />
          <Note x={0} y={330} text="наша схема «тени», не снимок телескопа" />
        </g>
      )}
    </Stage>
  );
};

// ── b09: площадь горизонта не уменьшается; энтропия; «кочерга» ──
export const Area: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const merge = ramp(t, at(c, 0.4), 1.6);
  const ent = pop(t, at(c, 1));
  const bek = pop(t, at(c, 2));
  const hot = ramp(t, at(c, 3), 1);
  const r1 = 70;
  const r2 = 55;
  const r3 = Math.sqrt(r1 * r1 + r2 * r2) * 1.12;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(360 420)">
        {merge < 1 ? (
          <>
            <circle cx={-150 * (1 - merge)} cy={0} r={r1} fill="#000" stroke={C.yellow} strokeWidth={4} />
            <circle cx={150 * (1 - merge)} cy={0} r={r2} fill="#000" stroke={C.yellow} strokeWidth={4} />
          </>
        ) : (
          <circle r={r3} fill="#000" stroke={C.yellow} strokeWidth={5} />
        )}
        <Txt x={0} y={180} size={30} color={C.yellow}>
          {merge < 1 ? "площадь А + площадь Б" : "новая площадь не меньше суммы"}
        </Txt>
        <Tag x={0} y={-200} text="1970 · Хокинг" color={C.yellow} size={30} />
      </g>
      {ent > 0 && (
        <g transform={`translate(980 260) scale(${ent})`}>
          <Panel x={-250} y={-70} w={500} h={150} />
          <Txt x={0} y={-6} size={30}>
            похоже на энтропию:
          </Txt>
          <Txt x={0} y={44} size={30} color={C.violet}>
            тоже только растёт
          </Txt>
        </g>
      )}
      {bek > 0 && (
        <g transform={`translate(980 480) scale(${bek})`}>
          <Txt x={0} y={0} size={28}>
            Бекенштейн: площадь = энтропия
          </Txt>
        </g>
      )}
      {hot > 0 && (
        <g opacity={hot} transform="translate(980 680)">
          <rect x={-200} y={-14} width={300} height={28} rx={12} fill={C.steel} />
          <rect x={60} y={-18} width={140} height={36} rx={14} fill={C.orange} opacity={0.6 + 0.4 * Math.sin(t * 4)} />
          <Txt x={0} y={80} size={28} color={C.coral}>
            энтропия → температура → свечение?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── b10: излучение Хокинга: квантовые колебания у горизонта (с оговоркой) ──
export const HawkingRad: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const glow = ramp(t, at(c, 0.4), 1);
  const pairs = ramp(t, at(c, 1.4), 0.8);
  const warn = pop(t, at(c, 2));
  const temp = pop(t, at(c, 3));
  const obs = pop(t, at(c, 4));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 450)">
        <circle r={190} fill={C.amber} opacity={0.06 * glow} />
        <BlackHole x={0} y={0} r={120} t={t} disk={0} />
        <circle r={124} fill="none" stroke={C.yellow} strokeWidth={3} strokeDasharray="8 8" />
        {/* слабое тепловое излучение — волны во все стороны */}
        {glow > 0 &&
          Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + 0.3;
            const r = 140 + ((t * 70 + i * 23) % 160);
            return <Wave key={i} x={Math.cos(a) * r} y={Math.sin(a) * r} w={30} amp={5} len={12} phase={t * 8} color={C.amber} sw={3} />;
          })}
        {pairs > 0 &&
          [0, 1, 2].map((i) => {
            const a = -0.8 + i * 0.8;
            const ph = ((t * 0.5 + i * 0.33) % 1);
            const bx = Math.cos(a) * 128;
            const by = Math.sin(a) * 128;
            return (
              <g key={i} opacity={pairs}>
                <circle cx={bx * (1 - ph * 0.3)} cy={by * (1 - ph * 0.3)} r={9} fill={C.violet} />
                <circle cx={bx * (1 + ph * 0.9)} cy={by * (1 + ph * 0.9)} r={9} fill={C.yellow} />
              </g>
            );
          })}
      </g>
      {warn > 0 && (
        <g transform={`translate(1000 250) scale(${warn})`}>
          <Panel x={-260} y={-90} w={520} h={180} stroke={C.violet} sw={3} />
          <Txt x={0} y={-15} size={30}>
            пара частиц —
          </Txt>
          <Txt x={0} y={35} size={30} color={C.violet}>
            упрощённая картинка
          </Txt>
        </g>
      )}
      {temp > 0 && (
        <g transform={`translate(1000 500) scale(${temp})`}>
          <BlackHole x={-150} y={0} r={50} t={t} disk={0} />
          <Txt x={-150} y={90} size={24} color={C.sky}>
            больше — холоднее
          </Txt>
          <BlackHole x={120} y={0} r={18} t={t} disk={0} />
          <circle cx={120} cy={0} r={40} fill={C.orange} opacity={0.3 + 0.2 * Math.sin(t * 5)} />
          <Txt x={120} y={90} size={24} color={C.orange}>
            меньше — горячее
          </Txt>
        </g>
      )}
      {obs > 0 && (
        <g transform={`translate(1000 760) scale(${obs})`}>
          <Tag x={0} y={0} text="прямо пока не наблюдали" color={C.pink} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── b11: первичные дыры — гипотеза, вспышки не найдены ──
export const Primordial: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const hot = ramp(t, at(c, 1), 2);
  const none = ramp(t, at(c, 2), 0.8);
  const r = 40 - hot * 30;
  const flash = hot > 0.95 ? ramp(t, at(c, 1) + 2, 0.4) * (1 - ramp(t, at(c, 1) + 2.6, 1)) : 0;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 450)">
        <circle r={260} fill="#2a1c4a" opacity={0.5} />
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={Math.cos(i * 2.4) * (40 + (i % 7) * 30)} cy={Math.sin(i * 2.4) * (40 + (i % 7) * 30)} r={6 + (i % 3) * 4} fill={C.pink} opacity={0.3} />
        ))}
        <circle r={r + 30 * hot} fill={C.orange} opacity={0.25 + 0.4 * hot} />
        <circle r={Math.max(4, r)} fill="#000" stroke={C.orange} strokeWidth={3} />
        {flash > 0 && <Spark x={0} y={0} r={240 * flash} color={C.white} o={flash} />}
        <Txt x={0} y={320} size={28} color={C.dim}>
          ранняя Вселенная (схема)
        </Txt>
      </g>
      <Pop t={t} at={0.3} x={1000} y={260}>
        <Tag x={0} y={0} text="первичные дыры" color={C.pink} size={36} />
      </Pop>
      {hot > 0 && (
        <Txt x={1000} y={420} size={28} opacity={hot}>
          меньше → горячее → вспышка?
        </Txt>
      )}
      {none > 0 && (
        <g opacity={none} transform="translate(1000 600)">
          <Panel x={-250} y={-80} w={500} h={160} />
          <Txt x={0} y={-10} size={30}>
            вспышки искали —
          </Txt>
          <Txt x={0} y={40} size={30} color={C.coral}>
            не нашли
          </Txt>
        </g>
      )}
    </Stage>
  );
};
