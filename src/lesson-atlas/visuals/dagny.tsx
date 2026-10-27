// Блок «Дагни и дорога»: красный семафор, уход Келлога, мелодия «Пятого концерта»,
// статуя основателя.
import React from "react";
import { interpolate } from "remotion";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Bubble, Figure, OL, Signal, Silhouette, Track, Train, zoneX } from "./draw";
import { Pop, Tag, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

export const RedSignal: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const go = ramp(t, at(c, 3.8), 1.6);
  const trainX = 640 + interpolate(go, [0, 1], [0, 1000], { easing: ease });
  const q1 = pop(t, at(c, 1.2)) * (1 - ramp(t, at(c, 3), 0.3));
  const q2 = pop(t, at(c, 2)) * (1 - ramp(t, at(c, 3), 0.3));
  const beru = pop(t, at(c, 3.7));
  const lesson = pop(t, at(c, 4));
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2d3a55" opacity={0.7} />
      {Array.from({ length: 40 }).map((_, i) => (
        <circle key={i} cx={(i * 211) % 1400} cy={(i * 97) % 420 + 40} r={2 + (i % 3)} fill="#fff" opacity={0.4 + 0.4 * Math.sin(t + i)} />
      ))}
      <rect x={0} y={760} width={1920} height={320} fill="#3b4a66" />
      <Track x1={0} x2={1920} y={760} shift={go * 600} color="#8b9ab3" tie="#5a4a3e" />
      <g transform={`translate(${trainX} 744)`}>
        <Train x={0} y={0} s={0.95} cars={3} t={go * 3} lights color="#c94f4f" label="Комета" />
      </g>
      <Signal x={1180} y={500} s={1.1} state={go > 0.05 ? "off" : "red"} glow={0.6 + 0.4 * Math.sin(t * 4)} />
      <Bubble x={420} y={430} w={380} h={110} text={"Ждём приказа…"} size={34} k={q1} />
      <Bubble x={860} y={330} w={420} h={110} text={"А кто виноват\nбудет?"} size={32} k={q2} />
      {beru > 0 && (
        <g transform={`translate(640 300) scale(${beru}) rotate(${wob(t, 2, 2)})`}>
          <rect x={-200} y={-80} width={400} height={160} rx={40} fill={C.yellow} stroke={OL} strokeWidth={6} />
          <text y={30} textAnchor="middle" fontFamily={FONTS.display} fontSize={90} fill={C.ink}>
            «Беру»
          </text>
        </g>
      )}
      {lesson > 0 && (
        <g transform={`translate(640 140) scale(${lesson})`}>
          <rect x={-330} y={-46} width={660} height={92} rx={46} fill={C.white} />
          <text y={16} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={C.ink}>
            тема: ответственность
          </text>
        </g>
      )}
    </g>
  );
};

export const Quitter: React.FC<VisualProps<{ name: string; role: string; host: string }>> = (c) => {
  const { t, p } = c;
  const cx = zoneX(p.host);
  const walk = ramp(t, at(c, 1), 0.3);
  const x = cx - 220 + Math.max(0, t - at(c, 1)) * 60 * walk;
  const doorK = pop(t, 0.2);
  const galt = pop(t, at(c, 2));
  const defeat = pop(t, at(c, 2.6));
  return (
    <g>
      {/* контора: стол и пустой стул */}
      <g transform={`translate(${cx - 420} 760) scale(${doorK})`}>
        <rect x={-150} y={-20} width={300} height={24} rx={8} fill="#a37b52" stroke={OL} strokeWidth={4} />
        <rect x={-130} y={0} width={20} height={130} fill="#8a6440" />
        <rect x={110} y={0} width={20} height={130} fill="#8a6440" />
        <rect x={-60} y={-90} width={120} height={70} rx={8} fill="#fffdf6" stroke={OL} strokeWidth={3} />
        <text x={0} y={-48} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={20} fill={C.inkSoft}>
          повышение
        </text>
      </g>
      <g opacity={1 - ramp(t, at(c, 2.5), 1.2)}>
        <Figure x={x} y={860} s={1.2} hair="m" color={C.green} hairColor="#6b4a2a" walk={walk} t={t} mood="flat" flip={false} />
        <g transform={`translate(${x + 54} 840)`}>
          <rect x={0} y={-10} width={60} height={44} rx={6} fill={C.rail} stroke={OL} strokeWidth={3} />
        </g>
      </g>
      <Pop t={t} at={0.4} x={cx} y={200}>
        <g>
          <rect x={-300} y={-56} width={600} height={112} rx={28} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={44} fill={C.ink}>
            {p.name}
          </text>
          <text y={34} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
            {p.role} · любит свою работу
          </text>
        </g>
      </Pop>
      <Bubble x={cx + 160} y={460} w={460} h={110} text={"А кто такой\nДжон Голт?"} size={34} k={galt} />
      {defeat > 0 && (
        <g transform={`translate(${cx} 360) scale(${defeat})`}>
          <rect x={-270} y={-40} width={540} height={80} rx={40} fill={C.ink} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.yellow}>
            объяснений нет
          </text>
        </g>
      )}
    </g>
  );
};

export const Melody: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const notes = ramp(t, 0.3, 0.5);
  const discs = pop(t, at(c, 1));
  const fifth = pop(t, at(c, 1.5));
  const freeze = pop(t, at(c, 2.5));
  return (
    <g>
      <g transform={`translate(${cx - 360} 820)`}>
        <Figure x={0} y={0} s={1.15} hair="cap" color="#3e5a86" t={t} mood="smile" />
      </g>
      {notes > 0 &&
        Array.from({ length: 10 }).map((_, i) => {
          const k = (t * 0.4 + i / 10) % 1;
          const x = cx - 330 + k * 700;
          const y = 620 - k * 380 + Math.sin(k * 10 + i) * 40;
          return (
            <text key={i} x={x} y={y} fontFamily={FONTS.display} fontSize={60 + (i % 3) * 14} fill={[C.violet, C.metal, C.coral][i % 3]} opacity={(1 - k) * notes}>
              {i % 2 ? "♪" : "♫"}
            </text>
          );
        })}
      {discs > 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const isFifth = i === 4;
          const k = isFifth ? fifth : discs;
          if (k <= 0.001) return null;
          const x = cx + 30 + (i - 2) * 150;
          return (
            <g key={i} transform={`translate(${x} ${isFifth ? 360 : 420}) scale(${k * (isFifth ? 1.2 : 1)}) rotate(${t * 40 * (isFifth ? 0 : 1)})`}>
              <circle r={64} fill={isFifth ? "#fff7e0" : "#2b3446"} stroke={isFifth ? C.yellowDeep : OL} strokeWidth={5} strokeDasharray={isFifth ? "12 8" : undefined} />
              <circle r={22} fill={isFifth ? C.yellow : C.violet} />
              <text y={isFifth ? 12 : 10} textAnchor="middle" fontFamily={FONTS.display} fontSize={isFifth ? 34 : 26} fill={isFifth ? C.ink : "#fff"}>
                {isFifth ? "5?" : String(i + 1)}
              </text>
            </g>
          );
        })}
      <Pop t={t} at={at(c, 1.3)} x={cx + 30} y={250}>
        <Tag x={0} y={0} text="у Халлея — четыре концерта" size={34} color={C.white} />
      </Pop>
      {freeze > 0 && (
        <g transform={`translate(${cx + 30} 640) scale(${freeze})`}>
          <rect x={-380} y={-46} width={760} height={92} rx={46} fill={C.ink} />
          <text y={15} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={34} fill={C.yellow}>
            откуда эта музыка — не сказано
          </text>
        </g>
      )}
    </g>
  );
};

export const Statue: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = pop(t, 0.15);
  const line = ramp(t, at(c, 1), 1.4);
  const rumors = ramp(t, at(c, 2), 1);
  return (
    <g>
      {/* колонны вокзала */}
      {[140, 360, 1000, 1220].map((x, i) => (
        <g key={i} opacity={k}>
          <rect x={x - 40} y={120} width={80} height={760} fill="#e9e2d2" stroke={OL} strokeWidth={4} />
          <rect x={x - 56} y={110} width={112} height={30} fill="#d8cfbc" stroke={OL} strokeWidth={4} />
        </g>
      ))}
      <rect x={60} y={880} width={1260} height={30} fill="#d8cfbc" />
      {/* статуя */}
      <g transform={`translate(680 880) scale(${k})`}>
        <rect x={-120} y={-120} width={240} height={120} fill="#cfc6b2" stroke={OL} strokeWidth={5} />
        <text y={-50} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={26} fill={C.inkSoft}>
          Нат Таггерт
        </text>
        <g transform="translate(0 -120) scale(2.1)">
          <Figure x={0} y={-34} color="#c7c9cc" hair="m" hairColor="#a9abaf" skin="#d7d9dc" mood="flat" />
        </g>
      </g>
      {/* прямая линия к горизонту */}
      <path d={`M 820 700 L ${820 + line * 420} ${700 - line * 240}`} stroke={C.metal} strokeWidth={10} strokeLinecap="round" opacity={line} />
      <Pop t={t} at={at(c, 1.3)} x={1000} y={300}>
        <Tag x={0} y={0} text="без государственных займов" size={32} color="#c9f0d9" />
      </Pop>
      {rumors > 0 && (
        <g opacity={rumors}>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={420 + i * 130 + Math.sin(t + i) * 20} cy={240 + (i % 2) * 40} rx={110} ry={44} fill="#6b6f80" opacity={0.35} />
          ))}
          <Tag x={560} y={250} text="мрачные слухи" size={34} color="#e3d8f0" />
        </g>
      )}
      <Pop t={t} at={at(c, 3)} x={680} y={160}>
        <g>
          <rect x={-420} y={-44} width={840} height={88} rx={44} fill={C.ink} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={36} fill={C.yellow}>
            даже идеал в романе не стерилен
          </text>
        </g>
      </Pop>
      <g opacity={clamp01(1 - k)} />
    </g>
  );
};

export { Silhouette };
