// Итоги: возвращение на остров (цепочка «получили / заплатили»), три урока,
// как читать такие книги, финальный вопрос, прощание с атрибуцией книги.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { FONTS } from "../../banamind/fonts";
import { CLAIMS } from "../components/ClaimBadge";
import { C } from "../theme";
import { BookCover } from "./intro";
import { Hut, Island, Person, Sea, Stage } from "./island";
import { Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";

// ── e01: остров — что получили и чем заплатили ──
export const IslandRecap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const steps = [
    { gain: "личное доверие", cost: "только ~150", at: at(c, 1) },
    { gain: "общие договорённости", cost: "их надо беречь", at: at(c, 1.5) },
    { gain: "больше еды", cost: "тяжёлый труд", at: at(c, 2) },
    { gain: "письмо и учёт", cost: "власть над людьми", at: at(c, 2.5) },
    { gain: "мост доверия", cost: "всё имеет цену", at: at(c, 3) },
    { gain: "сила науки", cost: "куда направить?", at: at(c, 3.5) },
  ];
  const whole = ramp(t, at(c, 4), 1);
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={700} />
      <Island x={640} y={740} w={900} t={t} />
      <Hut x={520} y={720} s={0.8} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Person key={i} x={600 + i * 60} y={720} s={0.7} i={i} t={t} />
      ))}
      <Txt x={340} y={150} size={34} color={C.greenDeep}>
        получили
      </Txt>
      <Txt x={940} y={150} size={34} color={C.red}>
        заплатили
      </Txt>
      {steps.map((s, i) => {
        const k = pop(t, s.at);
        if (k <= 0) return null;
        const y = 210 + i * 72;
        return (
          <g key={i} opacity={clamp01(k)}>
            <g transform={`translate(340 ${y}) scale(${k})`}>
              <rect x={-250} y={-28} width={500} height={56} rx={28} fill="#eafbef" />
              <Txt x={0} y={11} size={28} color={C.ink}>
                {s.gain}
              </Txt>
            </g>
            <g transform={`translate(940 ${y}) scale(${k})`}>
              <rect x={-250} y={-28} width={500} height={56} rx={28} fill="#fff1ee" />
              <Txt x={0} y={11} size={28} color={C.ink}>
                {s.cost}
              </Txt>
            </g>
          </g>
        );
      })}
      {whole > 0 && (
        <g opacity={whole}>
          <circle cx={640} cy={660} r={420} fill="none" stroke={C.yellowDeep} strokeWidth={8} strokeDasharray="20 16" strokeDashoffset={-t * 30} opacity={0.6} />
        </g>
      )}
    </Stage>
  );
};

// ── e02: три урока ──
export const Lessons: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = [
    { n: "1", text: "доверие и общие правила\nстоит беречь и проверять", color: C.skyDeep },
    { n: "2", text: "прогресс не равен счастью:\nу улучшений есть цена", color: C.coral },
    { n: "3", text: "сила требует\nответственности", color: C.green },
  ];
  return (
    <Stage host={c.p.host}>
      {items.map((it, i) => {
        const k = pop(t, at(c, 1 + i));
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(640 ${250 + i * 200}) scale(${k})`}>
            <Panel x={-520} y={-80} w={1040} h={160} fill={C.white} />
            <circle cx={-430} cy={0} r={52} fill={it.color} />
            <Txt x={-430} y={18} size={52} color={C.white}>
              {it.n}
            </Txt>
            <Txt x={60} y={-8} size={38} color={C.ink}>
              {it.text}
            </Txt>
          </g>
        );
      })}
      <Pop t={t} at={0.3} x={640} y={110}>
        <Txt x={0} y={0} size={40} color={C.inkSoft}>
          даже если не соглашаться во всём
        </Txt>
      </Pop>
    </Stage>
  );
};

// ── e03: как читать такие книги ──
export const ReadCritically: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const types: ("book" | "hypo" | "opinion")[] = ["book", "hypo", "opinion"];
  const relig = pop(t, at(c, 2));
  const final = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - final * 0.3}>
        <BookCover x={260} y={470} s={0.9} t={t} />
      </g>
      {types.map((k, i) => {
        const kk = pop(t, at(c, 1 + i * 0.25));
        if (kk <= 0) return null;
        const cl = CLAIMS[k];
        return (
          <g key={k} transform={`translate(860 ${280 + i * 150}) scale(${kk})`}>
            <Panel x={-280} y={-56} w={560} h={112} fill={C.white} />
            <circle cx={-210} cy={0} r={32} fill={cl.color} />
            <Txt x={30} y={12} size={34} color={C.ink}>
              {["известно", "предполагается", "мнение автора"][i]}
            </Txt>
          </g>
        );
      })}
      {relig > 0 && (
        <g transform={`translate(860 760) scale(${relig})`}>
          <Panel x={-330} y={-55} w={660} h={100} fill="#fff1ee" />
          <Txt x={0} y={12} size={30} color={C.coral}>
            о религии — мировоззрение автора
          </Txt>
        </g>
      )}
      {final > 0 && (
        <g opacity={final}>
          <Tag x={640} y={150} text="читать с интересом — и различать" color={C.yellow} size={38} />
        </g>
      )}
    </Stage>
  );
};

// ── e04: финальный вопрос (карточка — QuestionOverlay) ──
export const FinalQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <g>
      <Sea t={t} x={0} w={1920} y={600} />
      <Island x={420} y={650} w={600} t={t} />
      <Island x={1500} y={650} w={600} t={t} />
      {[0, 1, 2].map((i) => (
        <Person key={i} x={330 + i * 90} y={630} s={1} i={i} t={t} />
      ))}
      {[0, 1, 2].map((i) => (
        <Person key={i} x={1410 + i * 90} y={630} s={1} i={i + 3} t={t} look={-1} />
      ))}
      <Txt x={960} y={200} size={46} color={C.inkSoft}>
        общее решение — и его цена
      </Txt>
    </g>
  );
};

// ── e05: прощание, атрибуция книги, знак BanaMind ──
export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const brand = pop(t, 0.2);
  const book = pop(t, at(c, 1));
  return (
    <g>
      {brand > 0 && (
        <g transform={`translate(960 190) scale(${brand})`}>
          <text x={0} y={0} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={110}>
            <tspan fill={C.ink}>{BRAND.wordmark[0]}</tspan>
            <tspan fill={C.yellowDeep}>{BRAND.wordmark[1]}</tspan>
          </text>
          <Txt x={0} y={70} size={40} color={C.inkSoft}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      )}
      {book > 0 && (
        <g opacity={clamp01(book)}>
          <BookCover x={380} y={560} s={0.85 * book} t={t} />
          <g transform={`translate(1520 520) scale(${book})`}>
            <Panel x={-300} y={-120} w={600} h={240} fill={C.white} />
            <Txt x={0} y={-40} size={34} color={C.ink}>
              {"«Sapiens. Краткая история\nчеловечества»"}
            </Txt>
            <Txt x={0} y={70} size={30} color={C.inkSoft}>
              Юваль Ной Харари
            </Txt>
          </g>
        </g>
      )}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={200 + ((i * 151) % 1520)} cy={380 + ((t * 70 + i * 63) % 420)} r={8} fill={[C.coral, C.yellow, C.sky, C.green][i % 4]} opacity={0.6} />
      ))}
    </g>
  );
};
