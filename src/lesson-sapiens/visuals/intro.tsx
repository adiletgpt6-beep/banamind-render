// Вступление: тысяча незнакомцев, два вопроса фильма, книга, метки утверждений,
// учебный остров и три революции.
import React from "react";
import { C, FONT } from "../theme";
import { CLAIMS } from "../components/ClaimBadge";
import type { Claim } from "../types";
import { Crowd, Hut, Island, Net, Sea, Stage } from "./island";
import { Arrow, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// условная обложка книги (оригинальный рисунок, не обложка издательства)
export const BookCover: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + wob(t, 2, 5)}) rotate(${wob(t * 0.5, 1, 1.5)}) scale(${s})`}>
    <rect x={-170} y={-230} width={340} height={460} rx={18} fill="#1f2a44" />
    <rect x={-156} y={-230} width={14} height={460} fill="#000" opacity={0.18} />
    <rect x={-130} y={-190} width={260} height={4} fill={C.yellow} />
    <text y={-110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={C.white} letterSpacing={2}>
      Sapiens
    </text>
    <text y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.sand}>
      Краткая история
    </text>
    <text y={-28} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.sand}>
      человечества
    </text>
    <circle cy={70} r={74} fill={C.yellow} opacity={0.18} />
    <path d="M -50 110 Q -40 30 0 20 Q 40 30 50 110 Z" fill={C.yellow} opacity={0.75} />
    <circle cy={0} r={24} fill={C.yellow} opacity={0.75} />
    <rect x={-130} y={170} width={260} height={4} fill={C.yellow} />
    <text y={210} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={C.white}>
      Юваль Ной Харари
    </text>
  </g>
);

// ── h01: тысяча незнакомцев складываются в город; шимпанзе — хаос ──
export const Strangers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fill = ramp(t, 0.2, 2.2);
  const link = ramp(t, at(c, 1), 1.6);
  const city = ramp(t, at(c, 1.3), 1.2);
  const chaos = ramp(t, at(c, 2), 0.6);
  const pts: [number, number][] = [];
  for (let i = 0; i < 14; i++) pts.push([120 + ((i * 197) % 1080), 260 + ((i * 131) % 420)]);
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < 400; i++) {
    const k = clamp01(fill * 400 - i);
    if (k <= 0) continue;
    const gx = (i % 40) * 30 + 40;
    const gy = Math.floor(i / 40) * 44 + 220;
    const jx = chaos * Math.sin(i * 12.9 + t * 6) * 70;
    const jy = chaos * Math.cos(i * 7.1 + t * 5) * 50;
    dots.push(<circle key={i} cx={gx + jx} cy={gy + jy} r={9 * k} fill={["#ff9a7a", "#7cc6e8", "#8fd39b", "#c9a6f2", "#ffd166"][i % 5]} opacity={0.9 * (1 - chaos * 0.35)} />);
  }
  return (
    <Stage host={c.p.host}>
      {city > 0 && (
        <g opacity={city * (1 - chaos)} transform={`translate(0 ${(1 - city) * 40})`}>
          {[[60, 200], [200, 300], [340, 160], [500, 260], [640, 120], [800, 230], [950, 180], [1100, 280]].map(([x, h], i) => (
            <g key={i}>
              <rect x={x} y={200 - h + 120} width={120} height={h} rx={8} fill="#c9d6ea" />
              {Array.from({ length: Math.floor(h / 50) }).map((_, j) => (
                <rect key={j} x={x + 20} y={200 - h + 140 + j * 50} width={80} height={18} rx={4} fill={C.yellow} opacity={0.6 + 0.4 * Math.sin(t * 2 + i + j)} />
              ))}
            </g>
          ))}
        </g>
      )}
      {dots}
      <g opacity={1 - chaos}>
        <Net pts={pts} k={link} t={t} />
      </g>
      <Pop t={t} at={0.4} x={640} y={150}>
        <Tag x={0} y={0} text={chaos > 0.5 ? "тысяча шимпанзе" : "тысяча незнакомцев"} color={chaos > 0.5 ? C.coral : C.yellow} size={44} />
      </Pop>
      {chaos > 0 && (
        <g opacity={chaos}>
          <Txt x={640} y={760} size={64} color={C.red} weight={900}>
            хаос
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── h02: два вопроса фильма ──
export const BigQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q1 = pop(t, at(c, 0) + 0.1);
  const q2 = pop(t, at(c, 1) + 0.1);
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(640 300) scale(${q1})`} opacity={clamp01(q1)}>
        <Panel x={-560} y={-110} w={1120} h={200} fill={C.white} />
        <Txt x={0} y={-12} size={60} color={C.ink}>
          {"Как незнакомцы научились\nдоверять друг другу?"}
        </Txt>
      </g>
      <g transform={`translate(640 600) scale(${q2})`} opacity={clamp01(q2)}>
        <Panel x={-560} y={-110} w={1120} h={200} fill={C.ink} />
        <Txt x={0} y={-12} size={56} color={C.yellow}>
          {"Какую цену мы платим\nза каждое улучшение?"}
        </Txt>
      </g>
      {[0, 1, 2].map((i) => (
        <text key={i} x={80 + i * 560} y={140 + Math.sin(t * 1.6 + i) * 14} fontFamily={FONT} fontWeight={900} fontSize={90} fill={C.yellowDeep} opacity={0.25}>
          ?
        </text>
      ))}
    </Stage>
  );
};

// ── h03: книга и честный формат ──
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b = pop(t, 0.2);
  const notAudio = ramp(t, at(c, 2), 0.5);
  const own = ramp(t, at(c, 3), 0.5);
  return (
    <Stage host={c.p.host}>
      <g opacity={clamp01(b)}>
        <BookCover x={330} y={430} s={0.95 * (0.7 + 0.3 * b)} t={t} />
      </g>
      <Pop t={t} at={at(c, 1)} x={890} y={260}>
        <Panel x={-260} y={-70} w={520} h={130} fill={C.white} />
        <Txt x={0} y={-6} size={54} color={C.ink}>
          70 000 лет
        </Txt>
        <Txt x={0} y={42} size={34} color={C.inkSoft}>
          истории нашего вида
        </Txt>
      </Pop>
      {notAudio > 0 && (
        <g opacity={notAudio} transform="translate(890 470)">
          <Panel x={-260} y={-60} w={520} h={110} fill="#fff1ee" />
          <Txt x={0} y={14} size={36} color={C.red}>
            не аудиокнига
          </Txt>
          <line x1={-200} y1={4} x2={200 * (2 * notAudio - 1)} y2={4} stroke={C.red} strokeWidth={6} opacity={notAudio > 0.5 ? 0.6 : 0} />
        </g>
      )}
      {own > 0 && (
        <g opacity={own} transform="translate(890 640)">
          <Panel x={-260} y={-60} w={520} h={110} fill="#eafbef" />
          <Txt x={0} y={14} size={36} color={C.greenDeep}>
            идеи своими словами
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── h04: легенда меток ──
const LEGEND: Claim[] = ["book", "hypo", "opinion", "forecast", "model", "film"];
export const Legend: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const showAt = [1, 1.5, 2, 2.5, 3, 3.5];
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={640} y={150}>
        <Txt x={0} y={0} size={50} color={C.ink}>
          Что сейчас звучит?
        </Txt>
      </Pop>
      <Arrow x1={1000} y1={120} x2={1220} y2={40} k={ramp(t, at(c, 0.4), 0.6)} color={C.yellowDeep} w={9} bend={-0.2} />
      {LEGEND.map((k, i) => {
        const cl = CLAIMS[k];
        const kk = pop(t, at(c, showAt[i]));
        if (kk <= 0) return null;
        const x = i % 2 ? 960 : 330;
        const y = 290 + Math.floor(i / 2) * 170;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${kk})`} opacity={clamp01(kk)}>
            <Panel x={-290} y={-62} w={580} h={124} fill={C.white} />
            <circle cx={-220} cy={0} r={34} fill={cl.color} />
            <text x={-160} y={13} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
              {cl.label.split(" · ")[0]}
            </text>
            {cl.label.includes(" · ") && (
              <text x={-160} y={46} fontFamily={FONT} fontWeight={800} fontSize={22} fill={C.inkSoft}>
                {cl.label.split(" · ")[1]}
              </text>
            )}
          </g>
        );
      })}
    </Stage>
  );
};

// ── h05: учебный остров ──
export const IslandIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const isl = ramp(t, 0.1, 1);
  const people = ramp(t, at(c, 1), 2);
  const steps = ["язык", "правила", "поле", "письмо", "деньги", "наука"];
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={560} />
      <g transform={`translate(0 ${(1 - isl) * 200})`} opacity={isl}>
        <Island x={640} y={600} w={820} t={t} />
        <Hut x={520} y={560} s={0.8} />
      </g>
      <Crowd x={600} y={520} cols={6} rows={2} gap={50} s={0.55} k={people} t={t} />
      <Pop t={t} at={0.6} x={640} y={170}>
        <Tag x={0} y={0} text="учебная модель · не история" color={C.green} textColor={C.white} size={36} />
      </Pop>
      {steps.map((s, i) => {
        const k = pop(t, at(c, 2 + i * 0.13));
        if (k <= 0) return null;
        return (
          <g key={s} transform={`translate(${130 + i * 205} 300) scale(${k})`} opacity={clamp01(k)}>
            <rect x={-90} y={-36} width={180} height={64} rx={32} fill={C.white} />
            <Txt x={0} y={10} size={30} color={C.ink}>
              {s}
            </Txt>
          </g>
        );
      })}
      {ramp(t, at(c, 3), 0.5) > 0 && (
        <g opacity={ramp(t, at(c, 3), 0.5)}>
          <Txt x={360} y={430} size={40} color={C.greenDeep}>
            получили?
          </Txt>
          <Txt x={920} y={430} size={40} color={C.red}>
            заплатили?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── h06: три революции на ленте времени ──
export const Roadmap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const line = ramp(t, 0.2, 1.2);
  const marks = [
    { x: 180, label: "Когнитивная", when: "около 70 тыс. лет назад", color: C.seaDeep, at: at(c, 1.05) },
    { x: 640, label: "Аграрная", when: "около 12 тыс. лет назад", color: C.wheat, at: at(c, 1.4) },
    { x: 1100, label: "Научная", when: "около 500 лет назад", color: C.violet, at: at(c, 1.75) },
  ];
  const note = ramp(t, at(c, 2), 0.5);
  return (
    <Stage host={c.p.host}>
      <Txt x={640} y={190} size={54} color={C.ink}>
        Три революции
      </Txt>
      <line x1={80} y1={480} x2={80 + 1120 * line} y2={480} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      {marks.map((m, i) => {
        const k = pop(t, m.at);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${m.x} 480)`}>
            <circle r={34 * k} fill={m.color} />
            <g transform={`scale(${k})`} opacity={clamp01(k)}>
              <Txt x={0} y={-70} size={42} color={C.ink}>
                {m.label}
              </Txt>
              <Txt x={0} y={100} size={30} color={C.inkSoft}>
                {m.when}
              </Txt>
            </g>
          </g>
        );
      })}
      {note > 0 && (
        <g opacity={note}>
          <Panel x={240} y={640} w={800} h={110} fill="#f3edff" />
          <Txt x={640} y={708} size={32} color={C.violet}>
            даты — по книге; учёные их уточняют
          </Txt>
        </g>
      )}
    </Stage>
  );
};


