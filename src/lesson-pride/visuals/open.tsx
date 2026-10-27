// Сцены начала фильма BM-019: холодный старт из точек, вопрос фильма,
// кабинет двух линз, карточка цитаты, Лонгборн и деньги, модель выбора.
import React from "react";
import { BRAND } from "../../banamind/brand";
import { C, FONT, HEAVY, SERIF } from "../theme";
import { BookObj, Coin, Label, Manor, OL, Person, Tree, type Who } from "./draw";
import { Appear, area, Arrow, at, Cross, Drift, Panel, pop, ramp, Txt, wob, type VisualProps } from "./kit";
import { LensCards, LensFrame } from "./lens";
import { Particles } from "./particles";

type P = { mode?: string; host?: string; [k: string]: unknown };

// Штамп-вердикт поверх портрета из точек.
const Stamp: React.FC<{ x: number; y: number; text: string; color: string; k: number; rot?: number }> = ({ x, y, text, color, k, rot = -8 }) => {
  if (k <= 0) return null;
  const s = 1.6 - 0.6 * Math.min(1, k);
  const w = text.length * 34 + 70;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-40} width={w} height={80} rx={14} fill={C.white} stroke={color} strokeWidth={8} />
      <text y={20} fontFamily={HEAVY} fontWeight={900} fontSize={56} fill={color} textAnchor="middle">
        {text}
      </text>
    </g>
  );
};

// p01 — две карточки-приговора собираются из точек; затем «трещина» уверенности.
export const DotPortraits: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  const b2 = at(ctx, 2);
  return (
    <Drift t={t} dur={dur} amount={0.03}>
      {/* рамки-портреты */}
      {[
        { x: 430, col: C.teal, shape: "man", label: "Высокомерный", at: 0.2 },
        { x: 1010, col: C.brick, shape: "man2", label: "Приятный", at: 1.2 },
      ].map((p, i) => (
        <g key={i}>
          <Appear t={t} at={p.at} x={p.x} y={470}>
            <rect x={-260} y={-330} width={520} height={640} rx={26} fill={C.cream} stroke={OL} strokeWidth={6} />
            <rect x={-236} y={-306} width={472} height={592} rx={18} fill="none" stroke={C.gold} strokeWidth={4} />
          </Appear>
          <Particles shape={p.shape} t={t} at={p.at + 0.2} dur={2.2} x={p.x} y={470} s={0.78} r={5} step={12.5} mono={undefined} breakAt={b2 + 0.8 + i * 0.4} spread={900} />
          <Stamp x={p.x} y={700} text={p.label} color={p.col} k={ramp(t, p.at + 2.2, 0.35)} />
        </g>
      ))}
      {/* на второй реплике — знак вопроса между портретами */}
      <Appear t={t} at={b1} x={720} y={480}>
        <circle r={74} fill={C.yellow} stroke={OL} strokeWidth={6} />
        <text y={34} fontFamily={HEAVY} fontWeight={900} fontSize={104} fill={C.ink} textAnchor="middle">
          ?
        </text>
      </Appear>
      {/* третья реплика: под распавшимися портретами проявляются слова */}
      <Appear t={t} at={b2 + 2} x={430} y={460}>
        <Txt x={0} y={0} size={46} color={C.inkSoft}>{"манеры ≠ характер"}</Txt>
      </Appear>
      <Appear t={t} at={b2 + 2.4} x={1010} y={460}>
        <Txt x={0} y={0} size={46} color={C.inkSoft}>{"обаяние ≠ правда"}</Txt>
      </Appear>
    </Drift>
  );
};

// p02 — книга + вопрос фильма.
export const BigQuestion: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur } = ctx;
  const b1 = at(ctx, 1);
  return (
    <Drift t={t} dur={dur} cx={1250}>
      <Appear t={t} at={0.15} x={900} y={500}>
        <g transform={`rotate(${wob(t, 1, 2)})`}>
          <BookObj x={0} y={0} s={1.5} label={"Гордость\nи пред-\nубеждение"} color="#8a3a52" />
        </g>
        <Txt x={0} y={260} size={38} color={C.inkSoft}>
          Джейн Остин
        </Txt>
      </Appear>
      <Appear t={t} at={b1} x={1450} y={300}>
        <Panel x={-330} y={-120} w={660} h={420} fill={C.white} />
        <Txt x={0} y={-30} size={44} weight={900}>{"Как умный человек"}</Txt>
        <Txt x={0} y={30} size={44} weight={900}>{"ошибается в людях,"}</Txt>
        <Txt x={0} y={90} size={44} weight={900} color={C.rose}>{"когда уверен"}</Txt>
        <Txt x={0} y={150} size={44} weight={900} color={C.rose}>{"в своей правоте?"}</Txt>
        <g transform={`translate(0 ${236}) scale(${pop(t, b1 + 1.4)})`}>
          <circle r={40} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <text y={20} fontFamily={HEAVY} fontWeight={900} fontSize={56} fill={C.ink} textAnchor="middle">?</text>
        </g>
      </Appear>
    </Drift>
  );
};

// Линзы: intro / first / question / clash / rearrange / align.
type LP = P & { focus?: "liz" | "darcy"; decided?: string[]; known?: string[]; fixed?: string[]; darcyDecided?: string[]; darcyKnown?: string[] };
export const Lenses: React.FC<VisualProps<LP>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  if (p.mode === "intro") {
    const sep = 0.4 + 0.6 * ramp(t, b(1) + 1.2, 1.2);
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <LensFrame x={A.cx - 300} y={470} r={240} who="liz" k={ramp(t, 0.2, 0.8)} sep={sep} t={t} labels={ramp(t, b(1), 0.6)} />
        <LensFrame x={A.cx + 300} y={470} r={240} who="darcy" k={ramp(t, 0.6, 0.8)} sep={sep} t={t} labels={ramp(t, b(1), 0.6)} />
        <Appear t={t} at={b(2) + 0.5} x={A.cx} y={820}>
          <Label x={0} y={0} text="метафора фильма, не предмет романа" size={30} bg={C.white} />
        </Appear>
        <Appear t={t} at={b(3)} x={A.cx + 420} y={150}>
          <Label x={0} y={0} text="⚠ спойлеры" size={34} bg={C.yellow} rot={6} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "first") {
    const who = p.focus ?? "liz";
    const r = 330;
    const x = A.cx;
    const darcy = who === "darcy";
    return (
      <Drift t={t} dur={dur} cx={x}>
        <LensFrame x={x} y={540} r={r} who={who} k={ramp(t, 0.1, 0.7)} sep={darcy ? 0.6 : 0.2 + 0.6 * ramp(t, b(1), 1)} t={t}>
          <LensCards
            who={who}
            r={r}
            t={t}
            size={32}
            decided={p.decided ?? []}
            known={p.known ?? []}
            dAt={darcy ? [0.6, 0.9] : [b(1), b(1) + 0.8]}
            kAt={darcy ? [b(1), b(1) + 1.6] : [0.6]}
            crossAt={darcy ? [b(1) + 0.4] : []}
            flagAt={darcy ? [undefined, b(2) + 0.6] : [undefined, b(2)]}
          />
        </LensFrame>
        {!darcy && (
          <Appear t={t} at={b(2) + 1} x={x + r + 40} y={240}>
            <Label x={0} y={0} text="задета гордость" size={30} bg={C.roseSoft} rot={8} />
          </Appear>
        )}
      </Drift>
    );
  }
  if (p.mode === "question") {
    return (
      <Drift t={t} dur={dur}>
        <LensFrame x={A.cx - 470} y={500} r={190} who="liz" k={ramp(t, 0, 0.5)} sep={0.8} t={t} labels={0} />
        <LensFrame x={A.cx + 470} y={500} r={190} who="darcy" k={ramp(t, 0.2, 0.5)} sep={0.8} t={t} labels={0} />
        <Particles shape="question" t={t} at={0.3} dur={2} x={A.cx} y={420} s={0.6} r={5} step={13} spread={500} />
        <Appear t={t} at={b(0) + 1.2} x={A.cx - 470} y={790}>
          <Label x={0} y={0} text="наблюдение" size={34} bg={C.white} />
        </Appear>
        <Appear t={t} at={b(0) + 1.8} x={A.cx + 470} y={790}>
          <Label x={0} y={0} text="приговор" size={34} bg={C.roseSoft} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "clash") {
    const r = 270;
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <LensFrame x={A.cx - 310} y={470} r={r} who="liz" k={ramp(t, 0.1, 0.6)} sep={0.8} t={t} labels={0}>
          <LensCards who="liz" r={r} t={t} size={28} decided={p.decided ?? []} known={p.known ?? []} dAt={[0.5, 0.8]} kAt={[b(2), b(2) + 0.6]} flagAt={[b(2) + 1.2]} />
        </LensFrame>
        <LensFrame x={A.cx + 310} y={470} r={r} who="darcy" k={ramp(t, 0.3, 0.6)} sep={0.8} t={t} labels={0}>
          <LensCards who="darcy" r={r} t={t} size={28} decided={p.darcyDecided ?? []} known={p.darcyKnown ?? []} dAt={[0.6, b(1)]} kAt={[0.9]} flagAt={[b(0) + 1.5]} />
        </LensFrame>
        {/* разные ошибки — разный вес */}
        <Appear t={t} at={b(3)} x={A.cx} y={815}>
          <Label x={-310} y={0} text="доверие без проверки" size={26} bg={C.roseSoft} />
          <Label x={310} y={0} text="неуважение + самоуверенность" size={26} bg={C.tealSoft} />
        </Appear>
      </Drift>
    );
  }
  if (p.mode === "rearrange") {
    const r = 340;
    const x = A.cx;
    return (
      <Drift t={t} dur={dur} cx={x}>
        <LensFrame x={x} y={540} r={r} who="liz" k={ramp(t, 0, 0.5)} sep={0.9 - 0.75 * ramp(t, b(2), 1.4)} t={t}>
          <LensCards
            who="liz"
            r={r}
            t={t}
            size={30}
            decided={p.decided ?? []}
            known={p.known ?? []}
            fixed={p.fixed}
            dAt={[0.3, 0.5]}
            kAt={[0.6, 0.9]}
            crossAt={[b(1), b(1) + 0.5]}
            fAt={[b(2), b(2) + 0.5]}
          />
        </LensFrame>
        <Appear t={t} at={b(2) + 1.4} x={x + r + 30} y={200}>
          <Label x={0} y={0} text="ошибка в себе" size={32} bg={C.yellow} rot={8} />
        </Appear>
      </Drift>
    );
  }
  // align — второй разговор: слои совпадают после проверки
  const r = 255;
  const al = ramp(t, b(3), 1.6);
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      <LensFrame x={A.cx - 310 + al * 15} y={460} r={r} who="liz" k={ramp(t, 0, 0.5)} sep={0.9 * (1 - al)} t={t} labels={1 - al} ok={ramp(t, b(3) + 1.4, 0.8)}>
        <LensCards who="liz" r={r} t={t} size={26} decided={["Дарси — злодей"]} known={["Поступки Дарси"]} fixed={["Дарси изменился"]} dAt={[0]} kAt={[b(2)]} crossAt={[b(2)]} fAt={[b(2) + 0.6]} />
      </LensFrame>
      <LensFrame x={A.cx + 310 - al * 15} y={460} r={r} who="darcy" k={ramp(t, 0.2, 0.5)} sep={0.9 * (1 - al)} t={t} labels={1 - al} ok={ramp(t, b(3) + 1.6, 0.8)}>
        <LensCards who="darcy" r={r} t={t} size={26} decided={["Она ждёт предложения"]} known={["Упрёк заслужен"]} fixed={["Её «нет» — право"]} dAt={[0]} kAt={[b(1)]} crossAt={[b(1)]} fAt={[b(1) + 0.6]} />
      </LensFrame>
      <Appear t={t} at={b(3) + 1.8} x={A.cx} y={810}>
        <Label x={0} y={0} text="совпадение после проверки" size={30} bg={C.sageSoft} />
      </Appear>
    </Drift>
  );
};

// Карточка цитаты: кто говорит и где (повествователь / герой). pair — две реплики.
export const QuoteCard: React.FC<VisualProps<P & { who?: string; where?: string; tone?: string; pair?: boolean; lines?: string[]; figs?: string[] }>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b1 = at(ctx, 1);
  if (p.mode === "card") {
    // карточка цитаты героя: кто говорит, где; под ней — участники сцены
    const figs = (p.figs ?? []) as Who[];
    const L = p.lines ?? [];
    const w = Math.max(...L.map((l) => l.length)) * 23 + 140;
    const h = L.length * 58 + 130;
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <Appear t={t} at={0.3} x={A.cx} y={300}>
          <Panel x={-w / 2} y={-h / 2} w={w} h={h} fill={C.cream} stroke={C.gold} />
          <Txt x={0} y={-h / 2 + 52} size={28} color={C.inkSoft} weight={800}>{`${p.who} · ${p.where}`}</Txt>
          {L.map((l, i) => (
            <text key={i} x={0} y={-h / 2 + 118 + i * 58} fontFamily={SERIF} fontWeight={700} fontSize={42} fill={C.ink} textAnchor="middle" opacity={ramp(t, 0.5 + i * 0.35, 0.5)}>
              {l}
            </text>
          ))}
        </Appear>
        {figs.map((f, i) => (
          <Person key={f} who={f} x={A.cx + (i - (figs.length - 1) / 2) * 300} y={960} s={0.7} t={t} seed={i} flip={i > 0} mood={i === 0 ? (t > b1 ? "kind" : "neutral") : "neutral"} pose={i === 0 && t > b1 ? "point" : "stand"} />
        ))}
      </Drift>
    );
  }
  if (p.pair) {
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <Person who="darcy" x={A.cx - 420} y={900} s={0.9} mood="proud" t={t} flip />
        <Person who="liz" x={A.cx + 420} y={900} s={0.9} mood={t > b1 ? "smile" : "neutral"} t={t} />
        <Appear t={t} at={0.4} x={A.cx - 160} y={250}>
          <Panel x={-330} y={-110} w={660} h={210} fill={C.tealSoft} />
          <Txt x={0} y={-30} size={36} weight={800}>{"«Мое хорошее отношение,"}</Txt>
          <Txt x={0} y={20} size={36} weight={800}>{"однажды утраченное,"}</Txt>
          <Txt x={0} y={70} size={36} weight={800}>{"потеряно безвозвратно»"}</Txt>
        </Appear>
        <Appear t={t} at={b1} x={A.cx + 160} y={520}>
          <Panel x={-320} y={-100} w={640} h={170} fill={C.roseSoft} />
          <Txt x={0} y={-20} size={36} weight={800}>{"«Ваш недостаток в том,"}</Txt>
          <Txt x={0} y={30} size={36} weight={800}>{"что вы склонны всех ненавидеть»"}</Txt>
        </Appear>
        <Appear t={t} at={b1 + 2.2} x={A.cx} y={140}>
          <Label x={0} y={0} text={p.where ?? ""} size={26} bg={C.white} />
        </Appear>
      </Drift>
    );
  }
  // ирония первого абзаца: свиток с фразой, затем «стрелка наоборот»
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      <Appear t={t} at={0.2} x={A.cx} y={330}>
        <Panel x={-520} y={-170} w={1040} h={320} fill={C.cream} stroke={C.gold} />
        <Txt x={0} y={-80} size={30} color={C.inkSoft} weight={800}>{`${p.who} · ${p.where}`}</Txt>
        <text x={0} y={-10} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
          <tspan x={0}>«…одинокий мужчина, обладающий определенным</tspan>
          <tspan x={0} dy={52}>состоянием, должен находиться</tspan>
          <tspan x={0} dy={52}>в постоянном поиске жены»</tspan>
        </text>
      </Appear>
      {/* холостяк и мама с пятью дочерьми: кто кого ищет */}
      <Appear t={t} at={b1} x={0} y={0}>
        <Person who="bingley" x={A.cx + 380} y={960} s={0.62} t={t} mood="smile" />
        <Person who="mrsB" x={A.cx - 380} y={960} s={0.66} t={t} mood="smile" pose="point" />
        {["jane", "liz", "mary", "kitty", "lydia"].map((w, i) => (
          <Person key={w} who={w as "jane"} x={A.cx - 230 + i * 70} y={960} s={0.42} t={t} seed={i} mood="smile" />
        ))}
        <Arrow x1={A.cx - 120} y1={640} x2={A.cx + 260} y2={640} k={ramp(t, b1 + 0.6, 0.7)} color={C.rose} w={12} bend={-0.15} />
        <Label x={A.cx + 40} y={560} text="ищут — его" size={32} bg={C.yellow} opacity={ramp(t, b1 + 1.2, 0.4)} />
      </Appear>
    </Drift>
  );
};

// Лонгборн: entail (дом уходит к наследнику) / mother (страх матери, деньги не отложены).
export const Estate: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b = (i: number) => at(ctx, i);
  if (p.mode === "mother") {
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <Manor x={A.cx} y={720} s={0.8} t={t} />
        <Person who="mrsB" x={A.cx - 380} y={950} s={0.85} t={t} mood={t > b(1) ? "tense" : "neutral"} pose={t > b(1) ? "reach" : "stand"} />
        <Appear t={t} at={b(1)} x={A.cx - 200} y={210}>
          <Panel x={-300} y={-80} w={600} h={150} fill={C.white} />
          <Txt x={0} y={-10} size={34}>{"«кто будет вас содержать,"}</Txt>
          <Txt x={0} y={36} size={34}>{"когда ваш отец покинет нас»"}</Txt>
        </Appear>
        {/* копилка, которую не наполняли: ждали сына */}
        <Appear t={t} at={b(2)} x={A.cx + 380} y={420}>
          <rect x={-120} y={-90} width={240} height={180} rx={40} fill={C.paperDark} stroke={OL} strokeWidth={5} />
          <rect x={-40} y={-100} width={80} height={16} rx={6} fill={OL} />
          <Txt x={0} y={20} size={30} color={C.inkSoft}>не отложено</Txt>
          <Label x={0} y={150} text="ждали сына-наследника" size={28} bg={C.yellow} />
          <Cross x={0} y={-10} s={160} k={ramp(t, b(2) + 1.2, 0.6)} />
        </Appear>
        <Appear t={t} at={b(3)} x={A.cx + 380} y={760}>
          <Label x={0} y={0} text="тревога ≠ оправдание" size={32} bg={C.roseSoft} />
        </Appear>
      </Drift>
    );
  }
  const heir = ramp(t, b(1), 1.2);
  const coins = Math.round(8 * ramp(t, 0.6, 1.2));
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      <Tree x={A.cx - 520} y={760} s={0.9} t={t} />
      <Tree x={A.cx + 300} y={760} s={0.7} t={t} />
      <g transform={`translate(${A.cx - 120 + heir * 0} 0)`}>
        <Manor x={0} y={720} s={0.82} t={t} />
        <Label x={0} y={380} text="Лонгборн" size={36} bg={C.cream} serif />
      </g>
      {/* пять дочерей перед домом */}
      {["jane", "liz", "mary", "kitty", "lydia"].map((w, i) => (
        <Person key={w} who={w as "jane"} x={A.cx - 320 + i * 100} y={960} s={0.5} t={t} seed={i} mood={t > b(3) ? "sad" : "smile"} />
      ))}
      {/* доход: монеты */}
      <Appear t={t} at={0.4} x={A.cx + 330} y={200}>
        {Array.from({ length: coins }).map((_, i) => (
          <Coin key={i} x={-90 + (i % 4) * 60} y={(i < 4 ? 0 : 50)} r={24} spin={t * 2 + i} />
        ))}
        <Txt x={0} y={130} size={30} color={C.ink}>{"«две тысячи фунтов годовых»"}</Txt>
      </Appear>
      {/* стрелка наследования мимо дочерей к Коллинзу */}
      <Arrow x1={A.cx + 160} y1={560} x2={A.cx + 420} y2={620} k={heir} color={C.plum} w={14} bend={-0.25} />
      <Appear t={t} at={b(2)} x={A.cx + 480} y={940}>
        <Person who="collins" x={0} y={0} s={0.72} t={t} mood="smile" />
        <Label x={0} y={-560} text="наследник" size={30} bg={C.plumSoft} />
      </Appear>
      <Appear t={t} at={b(1) + 0.6} x={A.cx - 120} y={250}>
        <Label x={0} y={0} text="только по мужской линии" size={30} bg={C.white} />
      </Appear>
    </Drift>
  );
};

// Весы-модель выбора (choice) и давление/уважение (pressure).
export const ScalesScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const A = area(p.host);
  const b1 = at(ctx, 1);
  if (p.mode === "pressure") {
    const k = ramp(t, b1, 1);
    return (
      <Drift t={t} dur={dur} cx={A.cx}>
        <Appear t={t} at={0.2} x={A.cx - 280} y={320}>
          <Panel x={-230} y={-150} w={460} h={330} fill={C.plumSoft} />
          <Txt x={0} y={-80} size={36} weight={900} color={C.plum}>Давление</Txt>
          <Txt x={0} y={-10} size={30}>{"нужен один ответ"}</Txt>
          <Txt x={0} y={40} size={30}>{"«нет» не слышат"}</Txt>
          <Txt x={0} y={90} size={30}>{"требуют обещаний"}</Txt>
        </Appear>
        <Appear t={t} at={0.9} x={A.cx + 280} y={320}>
          <Panel x={-230} y={-150} w={460} h={330} fill={C.sageSoft} />
          <Txt x={0} y={-80} size={36} weight={900} color={C.green}>Уважение</Txt>
          <Txt x={0} y={-10} size={30}>{"любой ответ возможен"}</Txt>
          <Txt x={0} y={40} size={30}>{"«нет» принимают"}</Txt>
          <Txt x={0} y={90} size={30}>{"выбор — свободный"}</Txt>
        </Appear>
        {/* бумеранг: визит леди Кэтрин срабатывает наоборот */}
        <g opacity={k}>
          <Person who="catherine" x={A.cx - 380} y={950} s={0.6} t={t} mood="angry" />
          <Arrow x1={A.cx - 260} y1={720} x2={A.cx + 300} y2={720} k={k} color={C.plum} w={10} bend={-0.25} />
          <Person who="darcy" x={A.cx + 400} y={950} s={0.6} t={t} mood={t > b1 + 1.5 ? "smile" : "neutral"} />
          <Label x={A.cx} y={630} text="эффект наоборот" size={28} bg={C.yellow} opacity={ramp(t, b1 + 1.4, 0.4)} />
        </g>
      </Drift>
    );
  }
  // choice: три гири — чувство, дом и деньги, уважение
  const tilt = Math.sin(t * 0.8) * 0.15;
  return (
    <Drift t={t} dur={dur} cx={A.cx}>
      <g transform={`translate(${A.cx} 300)`}>
        <rect x={-14} y={0} width={28} height={420} fill={C.goldDeep} stroke={OL} strokeWidth={5} />
        <path d="M -120 440 Q 0 400 120 440 L 140 470 L -140 470 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
        <g transform={`rotate(${tilt * 14})`}>
          <line x1={-330} y1={0} x2={330} y2={0} stroke={C.goldDeep} strokeWidth={18} strokeLinecap="round" />
          <circle r={26} fill={C.gold} stroke={OL} strokeWidth={5} />
          {[-1, 1].map((d) => (
            <g key={d} transform={`translate(${d * 330} 0) rotate(${-tilt * 14})`}>
              <path d="M 0 0 L -110 150 M 0 0 L 110 150" stroke={C.goldDeep} strokeWidth={4} />
              <path d="M -140 150 Q 0 220 140 150 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
            </g>
          ))}
        </g>
      </g>
      <Appear t={t} at={0.4} x={A.cx - 330} y={410}>
        <Label x={0} y={0} text="чувство" size={34} bg={C.roseSoft} />
      </Appear>
      <Appear t={t} at={0.9} x={A.cx + 330} y={410}>
        <Label x={0} y={0} text="дом и деньги" size={34} bg={C.paperDark} />
      </Appear>
      <Appear t={t} at={1.4} x={A.cx} y={180}>
        <Label x={0} y={0} text="с кем жить всю жизнь?" size={34} bg={C.white} />
      </Appear>
      <Appear t={t} at={b1} x={A.cx} y={860}>
        <Panel x={-470} y={-70} w={940} h={120} fill={C.cream} stroke={C.gold} />
        <Txt x={0} y={10} size={34} weight={800}>{"«Счастье в браке – это полностью вопрос случая»"}</Txt>
      </Appear>
    </Drift>
  );
};

export { BRAND, FONT };
