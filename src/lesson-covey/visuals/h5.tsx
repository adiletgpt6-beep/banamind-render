// Навык 5 «Сначала стремитесь понять, потом — быть понятым»: окулист отдаёт свои очки,
// пять уровней слушания, разговор отца и сына в двух версиях (автобиографические ответы
// и отражение смысла и чувства, «луковица»), «психологический кислород», этос-пафос-логос.
import React from "react";
import { C, DISPLAY, FONT, HABIT } from "../theme";
import { Bubble, Card, Icon, Label, OL, Person } from "./draw";
import { Appear, area, Arrow, at, Cross, Drift, Pop, ramp, Txt, type VisualProps } from "./kit";

const H5 = HABIT[5].color;

// ───────────── окулист ─────────────
export const Optician: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const give = ramp(t, b1 + 0.8, 1);
  const blur = ramp(t, b1 + 1.8, 0.8);
  const angry = t > at(ctx, 1.7);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <rect x={cx - 120} y={180} width={240} height={300} rx={20} fill={C.white} stroke={OL} strokeWidth={5} />
      {["Ш Б", "М Н К", "Ы И Б Ц"].map((r, i) => (
        <g key={i}>
          {/* «плохое зрение» — двоение букв, а не размытие кадра */}
          {blur > 0 && (
            <text x={cx + blur * 14} y={260 + i * 70 + blur * 6} fontFamily={DISPLAY} fontWeight={800} fontSize={56 - i * 12} fill={C.ink} textAnchor="middle" opacity={0.35 * blur}>
              {r}
            </text>
          )}
          <text x={cx} y={260 + i * 70} fontFamily={DISPLAY} fontWeight={800} fontSize={56 - i * 12} fill={C.ink} textAnchor="middle" opacity={1 - blur * 0.45}>
            {r}
          </text>
        </g>
      ))}
      <Person who="doctor" x={cx - 330} y={870} s={0.75} t={t} pose={give > 0 && give < 1 ? "point" : "stand"} mood={angry ? "angry" : "happy"} />
      <Person who="man" x={cx + 330} y={870} s={0.75} t={t} pose={blur > 0.5 ? "cover" : "stand"} mood={blur > 0.5 ? "shock" : "neutral"} flip />
      {give > 0 && (
        <g transform={`translate(${cx - 250 + give * 560} ${520 - Math.sin(give * Math.PI) * 80})`}>
          <circle cx={-20} cy={0} r={18} fill={C.sky} opacity={0.6} stroke={OL} strokeWidth={4} />
          <circle cx={20} cy={0} r={18} fill={C.sky} opacity={0.6} stroke={OL} strokeWidth={4} />
        </g>
      )}
      <Pop t={t} at={b1 + 0.6} x={cx - 300} y={260}>
        <Bubble x={0} y={0} text={"Эти очки я ношу\nуже лет десять!"} w={340} size={28} tail="down" />
      </Pop>
      {angry && (
        <Pop t={t} at={at(ctx, 1.7)} x={cx - 290} y={420}>
          <Bubble x={0} y={0} text="Какой же вы неблагодарный!" w={420} size={26} bg={C.coralSoft} />
        </Pop>
      )}
      <Appear t={t} at={b2} x={cx} y={130}>
        <Label x={0} y={0} text="рецепт без диагноза" size={32} bg={HABIT[5].soft} />
      </Appear>
    </Drift>
  );
};

// ───────────── пять уровней слушания ─────────────
export const Levels: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const stairs = ramp(t, b1 - 0.3, 0.6);
  const card = ramp(t, b2, 0.6);
  const lv = ["игнорировать", "делать вид", "выборочно", "внимательно", "эмпатически"];
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - stairs}>
        <Person who="dina" x={cx - 250} y={850} s={0.8} t={t} pose="open" mood="sad" />
        <Person who="marat" x={cx + 250} y={850} s={0.8} t={t} pose="cross" mood="think" accent={C.coral} flip />
        <Bubble x={cx - 230} y={330} text={"Мне сегодня\nтак тяжело…"} w={320} size={30} />
        <Pop t={t} at={0.9} x={cx + 240} y={300}>
          <Bubble x={0} y={0} text={"…а я сейчас\nрасскажу, как надо"} w={340} size={28} think />
        </Pop>
      </g>
      {stairs > 0 && (
        <g opacity={stairs * (1 - card * 0.75)}>
          {lv.map((s, i) => {
            const k = ramp(t, b1 + i * 0.9, 0.5);
            const x = A.x0 + 80 + i * ((A.x1 - A.x0 - 200) / 5);
            const y = 800 - i * 110;
            const top = i === 4;
            return (
              <g key={s} opacity={0.3 + 0.7 * k}>
                <rect x={x} y={y} width={(A.x1 - A.x0 - 200) / 5 + 20} height={860 - y} rx={14} fill={top ? H5 : "#ffffff"} stroke={OL} strokeWidth={4} opacity={top ? 1 : 0.9} />
                <text x={x + ((A.x1 - A.x0 - 200) / 5 + 20) / 2} y={y - 18} fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.white} textAnchor="middle">
                  {s}
                </text>
                <text x={x + ((A.x1 - A.x0 - 200) / 5 + 20) / 2} y={y + 56} fontFamily={DISPLAY} fontWeight={800} fontSize={44} fill={top ? C.white : C.inkSoft} textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            );
          })}
        </g>
      )}
      {card > 0 && (
        <g opacity={card} transform={`translate(${cx} 460) scale(${0.85 + 0.15 * card})`}>
          <Card x={0} y={0} w={820} h={260} color={H5} title="Эмпатия ≠ симпатия" lines={["понять человека не значит", "согласиться с ним во всём"]} size={36} titleSize={46} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── разговор отца и сына ─────────────
type TalkP = { host?: string; mode: "auto" | "empathy" };
export const Talk: React.FC<VisualProps<TalkP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const room = (
    <g>
      <rect x={A.x0 + 30} y={160} width={A.x1 - A.x0 - 60} height={700} rx={40} fill="#ffe9c7" stroke={OL} strokeWidth={5} opacity={0.96} />
      <rect x={A.x0 + 90} y={220} width={200} height={160} rx={14} fill={C.sky} stroke={OL} strokeWidth={5} />
    </g>
  );
  if (p.mode === "auto") {
    const tags = [
      { at: 0.3, x: cx - 530, y: 280, text: "«В твоём возрасте я…»", tag: "оценка" },
      { at: at(ctx, 0.55), x: cx - 530, y: 450, text: "«Опять двойка? С кем?»", tag: "выпытывание" },
      { at: b1, x: cx - 80, y: 280, text: "«Садись и учись»", tag: "совет" },
      { at: at(ctx, 1.5), x: cx - 80, y: 450, text: "«Переходный возраст»", tag: "интерпретация" },
    ];
    const door = ramp(t, b2 + 1.6, 0.8);
    return (
      <Drift t={t} dur={dur} cx={cx} cy={480}>
        {room}
        <Person who="marat" x={cx - 330} y={860} s={0.62} t={t} pose="point" mood="tense" accent={C.coral} />
        <Person who="timur" x={cx + 200} y={860} s={0.8} t={t} pose="cross" mood={door > 0.3 ? "angry" : "sad"} flip opacity={1 - door} />
        {tags.map((g, i) => (
          <Pop key={i} t={t} at={g.at} x={g.x + 200} y={g.y}>
            <Bubble x={0} y={0} text={g.text} w={420} size={27} tail="none" bg={C.coralSoft} />
            <Label x={-110} y={-58} text={g.tag} size={22} bg={C.white} />
          </Pop>
        ))}
        {door > 0 && (
          <g transform={`translate(${A.x1 - 200} 860)`}>
            <rect x={-120} y={-460} width={240} height={460} fill="#2f3a55" stroke={OL} strokeWidth={5} />
            <rect x={-120} y={-460} width={240 * door} height={460} fill={C.wood} stroke={OL} strokeWidth={5} />
            <Label x={-30} y={-500} text="разговор закрыт" size={26} bg={C.white} />
          </g>
        )}
      </Drift>
    );
  }
  const layers = ["школа", "один тест", "страх отстать"];
  const peel = [b1 + 0.4, b1 + 1.8, b1 + 3.2].map((a) => ramp(t, a, 0.6));
  const ask = ramp(t, b2, 0.5);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      {room}
      <Person who="marat" x={cx - 140} y={860} s={0.78} t={t} pose="sit" mood="calm" accent={C.teal} />
      <Person who="timur" x={cx + 120} y={860} s={0.78} t={t} pose="sit" mood={ask > 0 ? "calm" : "sad"} flip />
      <Pop t={t} at={0.6} x={cx - 300} y={260}>
        <Bubble x={0} y={0} text={"Похоже, школа сейчас\nтебя здорово злит?"} w={420} size={28} tail="down" bg={C.tealSoft} />
      </Pop>
      <Appear t={t} at={b1} x={cx + 420} y={390}>
        <g>
          {layers.map((l, i) => {
            const r = 170 - i * 50;
            const off = i < 2 ? peel[i] : 0;
            return (
              <g key={l} opacity={1 - off}>
                <ellipse cx={0} cy={0} rx={r} ry={r * 0.86} fill={["#d7b2ff", "#c08cff", H5][i]} stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
          <Label x={0} y={210} text={layers[peel[1] > 0.5 ? 2 : peel[0] > 0.5 ? 1 : 0]} size={30} bg={C.white} />
        </g>
      </Appear>
      {ask > 0 && (
        <Pop t={t} at={b2} x={cx + 360} y={640}>
          <Bubble x={0} y={0} text={"Пап, а вы не поможете\nмне с этим?"} w={420} size={28} tail="down" />
        </Pop>
      )}
      <Appear t={t} at={b1 + 4.2} x={cx - 300} y={450}>
        <Label x={0} y={0} text="смысл + чувство" size={28} bg={HABIT[5].soft} />
      </Appear>
    </Drift>
  );
};

// ───────────── психологический кислород ─────────────
export const Oxygen: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  const low = 1 - ramp(t, 0.6, 1.6) * 0.8;
  const fill = ramp(t, b1 + 1.6, 1.6);
  const air = b1 < t ? Math.max(low, fill) : low;
  const lim = ramp(t, b2, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      <g opacity={1 - lim}>
        <rect x={cx - 480} y={200} width={560} height={620} rx={40} fill="#e6f4ff" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 14 }).map((_, i) => {
          const y = 780 - ((t * 40 + i * 47) % 560);
          return <circle key={i} cx={cx - 440 + ((i * 97) % 480)} cy={y} r={8 + (i % 3) * 4} fill="#fff" stroke="#9fd0f5" strokeWidth={3} opacity={air * 0.9} />;
        })}
        <Person who="man" x={cx - 200} y={800} s={0.75} t={t} pose={air < 0.4 ? "cover" : "open"} mood={air < 0.4 ? "tense" : "calm"} />
        <g transform={`translate(${cx + 300} 520)`}>
          <rect x={-70} y={-240} width={140} height={480} rx={70} fill={C.white} stroke={OL} strokeWidth={5} />
          <rect x={-56} y={226 - 452 * air} width={112} height={452 * air} rx={56} fill={air < 0.4 ? C.coral : "#7fd0ff"} />
          <Txt x={0} y={300} size={30} color={C.white} weight={900}>
            «кислород»
          </Txt>
        </g>
        <Appear t={t} at={b1 + 0.6} x={cx - 200} y={230}>
          <Bubble x={0} y={0} text="меня поняли" w={300} size={32} tail="down" bg={C.tealSoft} />
        </Appear>
      </g>
      {lim > 0 && (
        <g opacity={lim} transform={`translate(${cx} 460) scale(${0.85 + 0.15 * lim})`}>
          <Card x={0} y={0} w={860} h={300} color={H5} title="Граница инструмента" lines={["слушание — не терапия и не диагноз", "если очень тяжело — нужен специалист"]} size={34} titleSize={42} />
        </g>
      )}
    </Drift>
  );
};

// ───────────── этос, пафос, логос ─────────────
export const Ethos: React.FC<VisualProps<{ host?: string }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const cx = A.cx;
  const b1 = at(ctx, 1);
  const steps = [
    { w: "этос", s: "доверие к вам", icon: "key" as const },
    { w: "пафос", s: "чувства собеседника", icon: "heart" as const },
    { w: "логос", s: "логика и факты", icon: "clip" as const },
  ];
  const wrong = ramp(t, b1 + 2.4, 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx} cy={480}>
      {steps.map((s, i) => {
        const k = ramp(t, 0.8 + i * (i ? 1.4 : 0.6) + (i ? b1 - 1.4 : 0), 0.6);
        const x = cx - 380 + i * 380;
        const y = 640 - i * 120;
        return (
          <g key={s.w} opacity={0.25 + 0.75 * k}>
            <rect x={x - 170} y={y} width={340} height={860 - y} rx={22} fill={["#b9a6ff", "#9b7bff", H5][i]} stroke={OL} strokeWidth={5} />
            <Icon name={s.icon} x={x} y={y + 80} s={1.3} color={i === 1 ? C.rose : C.white} />
            <Txt x={x} y={y - 60} size={44} color={C.white} weight={900}>
              {s.w}
            </Txt>
            <Txt x={x} y={y - 18} size={26} color={C.white}>
              {s.s}
            </Txt>
            {i < 2 && <Arrow x1={x + 120} y1={y - 120} x2={x + 250} y2={y - 200} k={k} color={C.white} w={8} bend={-0.15} />}
          </g>
        );
      })}
      {wrong > 0 && (
        <g opacity={wrong}>
          <Label x={cx + 380} y={250} text="обычно начинаем отсюда" size={26} bg={C.coralSoft} />
          <Cross x={cx + 380} y={350} s={70} k={ramp(t, b1 + 3, 0.5)} />
        </g>
      )}
    </Drift>
  );
};
