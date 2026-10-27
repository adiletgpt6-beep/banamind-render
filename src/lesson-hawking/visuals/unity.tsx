// Часть «Единство»: две теории не стыкуются, струны и свёрнутые измерения,
// Вселенная без края (гипотеза, аналогия только для мнимого времени), три
// разных голоса о Творце (без изображений), граница науки, три варианта будущего.
import React from "react";
import { C } from "../theme";
import { Panel, Pop, Tag, Txt, at, pop, ramp, type VisualProps } from "./kit";
import { BlackHole, Earth, Note, Stage, Wave } from "./space";

// ── u01: ОТО + кванты = бесконечности ──
export const Clash: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const both = ramp(t, at(c, 1), 1);
  const inf = pop(t, at(c, 2));
  const need = pop(t, at(c, 3));
  const sep = 260 - both * 130;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 400)">
        <g transform={`translate(${-sep} 0)`}>
          <circle r={130} fill="rgba(59,156,255,0.2)" stroke={C.skyDeep} strokeWidth={5} />
          <Txt x={0} y={-150} size={32}>
            ОТО
          </Txt>
        </g>
        <g transform={`translate(${sep} 0)`}>
          <circle r={130} fill="rgba(169,139,255,0.2)" stroke={C.violetDeep} strokeWidth={5} />
          <Txt x={0} y={-150} size={32}>
            кванты
          </Txt>
        </g>
        {both > 0.6 && <BlackHole x={0} y={0} r={36} t={t} disk={0} />}
        {inf > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 + t;
            return (
              <g key={i} transform={`translate(${Math.cos(a) * 180 * inf} ${Math.sin(a) * 120 * inf})`}>
                <Txt x={0} y={14} size={56} color={C.red}>
                  ∞
                </Txt>
              </g>
            );
          })}
        <Txt x={0} y={230} size={26} color={C.dim} opacity={both}>
          центр чёрной дыры и самое начало
        </Txt>
      </g>
      {need > 0 && (
        <g transform={`translate(640 780) scale(${need})`}>
          <Tag x={0} y={0} text="нужна квантовая теория гравитации — её нет" color={C.pink} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── u02: струна вместо точки; свёрнутые измерения (апельсин) ──
export const Strings: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const modes = ramp(t, at(c, 0.6), 1);
  const dims = pop(t, at(c, 1));
  const zoom = ramp(t, at(c, 1.5), 1.6);
  const fail = pop(t, at(c, 2));
  const loop = (n: number, r: number, ph: number) =>
    Array.from({ length: 81 })
      .map((_, i) => {
        const a = (i / 80) * Math.PI * 2;
        const rr = r + Math.sin(a * n + ph) * 14;
        return `${i ? "L" : "M"} ${Math.cos(a) * rr} ${Math.sin(a) * rr}`;
      })
      .join(" ");
  return (
    <Stage host={c.p.host}>
      {[2, 3, 5].map((n, i) => (
        <g key={n} transform={`translate(${170 + i * 200} 300)`} opacity={i === 0 ? 1 : modes}>
          <path d={loop(n, 60, t * 4)} fill="none" stroke={[C.yellow, C.cyan, C.pink][i]} strokeWidth={6} />
          <Txt x={0} y={120} size={24} color={C.dim}>
            {["частица А", "частица Б", "частица В"][i]}
          </Txt>
        </g>
      ))}
      {dims > 0 && (
        <g transform={`translate(330 620) scale(${dims})`}>
          <Tag x={0} y={0} text="10 или 26 измерений" color={C.violet} size={34} textColor={C.white} />
        </g>
      )}
      {zoom > 0 && (
        <g opacity={zoom} transform="translate(980 420)">
          <circle r={150} fill="#ff9d2e" />
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={Math.cos(i * 2.4) * (30 + (i % 6) * 20)} cy={Math.sin(i * 2.4) * (30 + (i % 6) * 20)} r={4 + zoom * 4} fill="#d97a14" opacity={zoom} />
          ))}
          <Txt x={0} y={210} size={26} color={C.dim}>
            издали гладкий, вблизи — с рельефом
          </Txt>
        </g>
      )}
      {fail > 0 && (
        <g transform={`translate(640 840) scale(${fail})`}>
          <Tag x={0} y={0} text="прогноз «к концу века» не сбылся · подтверждения нет" color={C.orange} size={28} textColor={C.night} />
        </g>
      )}
    </Stage>
  );
};

// ── u03: Вселенная без края: глобус, начало как полюс ──
export const NoBoundary: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const globe = pop(t, at(c, 1));
  const pole = ramp(t, at(c, 2), 1);
  const warn = pop(t, at(c, 3));
  const lat = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.6));
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={330} y={190}>
        <Tag x={0} y={0} text="предложение Хокинга" color={C.pink} size={34} />
        <Txt x={0} y={70} size={26} color={C.dim}>
          мнимое время — математический приём
        </Txt>
      </Pop>
      {globe > 0 && (
        <g transform={`translate(420 600) scale(${0.85 * globe})`}>
          <Earth x={0} y={0} r={200} t={t * 0.3} />
          {[0.3, 0.55, 0.8].map((l, i) => (
            <ellipse key={i} cx={0} cy={-200 + l * 400 - 200 + 200} rx={Math.sin(l * Math.PI) * 200} ry={Math.sin(l * Math.PI) * 30} fill="none" stroke={C.yellow} strokeWidth={2} opacity={0.6} />
          ))}
          <ellipse cx={0} cy={-200 + lat * 400} rx={Math.sin(lat * Math.PI) * 200} ry={Math.sin(lat * Math.PI) * 30} fill="none" stroke={C.yellow} strokeWidth={5} />
          <Txt x={260} y={-200 + lat * 400} size={22} color={C.yellow} anchor="start">
            размер Вселенной
          </Txt>
          {pole > 0 && (
            <g opacity={pole}>
              <circle cx={0} cy={-200} r={12} fill={C.white} />
              <Txt x={0} y={-230} size={26}>
                «начало» — как полюс
              </Txt>
              <Txt x={0} y={270} size={26} color={C.dim}>
                «севернее полюса» — бессмысленно
              </Txt>
            </g>
          )}
        </g>
      )}
      {warn > 0 && (
        <g transform={`translate(1000 450) scale(${warn})`}>
          <Panel x={-230} y={-150} w={460} h={300} stroke={C.pink} sw={3} />
          <Txt x={0} y={-80} size={28}>
            гипотеза, не факт
          </Txt>
          <Txt x={0} y={-20} size={24} color={C.dim}>
            аналогия — только
          </Txt>
          <Txt x={0} y={14} size={24} color={C.dim}>
            для мнимого времени,
          </Txt>
          <Txt x={0} y={48} size={24} color={C.dim}>
            не для наших часов
          </Txt>
          <Txt x={0} y={110} size={26} color={C.pink}>
            ещё не проверена
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── u04: три голоса — три подписанные карточки (без изображений) ──
export const Voices: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q = pop(t, at(c, 0.5));
  const mark = ramp(t, at(c, 1), 0.8);
  const others = at(c, 2);
  const V = [
    { name: "Карл Саган", role: "предисловие", col: C.violetDeep },
    { name: "Я. А. Смородинский", role: "послесловие, 1989", col: C.coral },
  ];
  return (
    <Stage host={c.p.host}>
      {q > 0 && (
        <g transform={`translate(640 290) scale(${q})`}>
          <Panel x={-520} y={-150} w={1040} h={300} stroke={C.skyDeep} sw={4} />
          <Txt x={0} y={-80} size={28} color={C.sky}>
            Хокинг, глава 8 — вопрос:
          </Txt>
          <Txt x={0} y={-10} size={38}>
            «Остаётся ли тогда место
          </Txt>
          <Txt x={0} y={45} size={38}>
            для Создателя?»
          </Txt>
          {mark > 0 && (
            <Txt x={0} y={115} size={26} color={C.coral} opacity={mark}>
              философский вопрос на основе неподтверждённой гипотезы
            </Txt>
          )}
        </g>
      )}
      {V.map((v, i) => {
        const k = pop(t, others + 0.3 + i * 0.6);
        if (k <= 0) return null;
        return (
          <g key={v.name} transform={`translate(${380 + i * 520} 650) scale(${k})`}>
            <rect x={-230} y={-80} width={460} height={160} rx={30} fill="rgba(14,20,48,0.85)" stroke={v.col} strokeWidth={4} />
            <Txt x={0} y={-12} size={32}>
              {v.name}
            </Txt>
            <Txt x={0} y={34} size={24} color={C.dim}>
              {`${v.role} · своё толкование`}
            </Txt>
          </g>
        );
      })}
      {t > others + 1.5 && <Note x={640} y={800} text="голоса разных авторов не смешиваем" o={ramp(t, others + 1.5)} />}
    </Stage>
  );
};

// ── u05: две полки вопросов: «как» (физика) и «зачем/кто» (вера и философия) ──
export const Boundary: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const how = pop(t, 0.4);
  const faith = pop(t, at(c, 1));
  const tool = ramp(t, at(c, 2), 1);
  const line = ramp(t, at(c, 1) + 0.6, 1);
  return (
    <Stage host={c.p.host}>
      {how > 0 && (
        <g transform={`translate(330 420) scale(${how})`}>
          <Panel x={-270} y={-220} w={540} h={440} stroke={C.green} sw={4} />
          <Txt x={0} y={-150} size={34} color={C.green}>
            физическая модель
          </Txt>
          <Txt x={0} y={-90} size={28}>
            как меняются величины?
          </Txt>
          {["расстояния", "температуры", "время на часах"].map((w, i) => (
            <Txt key={w} x={0} y={-20 + i * 55} size={28} color={C.dim}>
              {`• ${w}`}
            </Txt>
          ))}
          <Txt x={0} y={180} size={24} color={C.green}>
            проверяется опытом
          </Txt>
        </g>
      )}
      {line > 0 && <line x1={640} y1={220} x2={640} y2={220 + 420 * line} stroke={C.yellow} strokeWidth={5} strokeDasharray="14 10" />}
      {faith > 0 && (
        <g transform={`translate(950 420) scale(${faith})`}>
          <Panel x={-270} y={-220} w={540} h={440} stroke={C.coral} sw={4} />
          <Txt x={0} y={-150} size={34} color={C.coral}>
            вера и философия
          </Txt>
          <Txt x={0} y={-90} size={28}>
            вопрос о Творце
          </Txt>
          <Txt x={0} y={-20} size={26} color={C.dim}>
            эксперимент книги
          </Txt>
          <Txt x={0} y={20} size={26} color={C.dim}>
            не решает его
          </Txt>
          <Txt x={0} y={60} size={26} color={C.dim}>
            ни в одну сторону
          </Txt>
        </g>
      )}
      {tool > 0 && (
        <g transform={`translate(640 800) scale(${tool})`}>
          <Tag x={0} y={0} text="наука честно показывает, где кончается её инструмент" color={C.yellow} size={28} />
        </g>
      )}
    </Stage>
  );
};

// ── u06: три варианта будущего физики ──
export const ThreePaths: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const P = [
    { at: at(c, 0.4), label: "1. полная теория есть", col: C.green },
    { at: at(c, 1), label: "2. всё точнее без конца", col: C.sky },
    { at: at(c, 1.5), label: "3. окончательной нет", col: C.coral },
  ];
  const step = pop(t, at(c, 2));
  return (
    <Stage host={c.p.host}>
      <circle cx={120} cy={480} r={24} fill={C.yellow} />
      {P.map((p, i) => {
        const k = ramp(t, p.at, 1);
        if (k <= 0) return null;
        const ey = 220 + i * 210;
        return (
          <g key={i}>
            <path d={`M 140 480 C 400 480 400 ${ey} ${140 + 420 * k} ${ey}`} fill="none" stroke={p.col} strokeWidth={8} opacity={0.9} />
            {i === 0 && k > 0.95 && <circle cx={560} cy={ey} r={26} fill={p.col} />}
            {i === 1 && k > 0.95 && [0, 1, 2, 3].map((j) => <circle key={j} cx={560 + j * 40} cy={ey} r={24 - j * 5} fill="none" stroke={p.col} strokeWidth={4} />)}
            {i === 2 && k > 0.95 && <Wave x={540} y={ey} w={120} amp={12} len={30} phase={t * 5} color={p.col} />}
            <Txt x={720} y={ey + 12} size={30} anchor="start" opacity={k}>
              {p.label}
            </Txt>
          </g>
        );
      })}
      {step > 0 && (
        <g transform={`translate(640 820) scale(${step})`}>
          <Tag x={0} y={0} text="и даже полная теория — лишь первый шаг" color={C.white} size={30} />
        </g>
      )}
    </Stage>
  );
};
