// Пять YouTube-обложек фильма BM-029 «Илон Маск: цена невозможного» (канал BanaMind).
// Пять разных постановок: банан и книга-символ, ракета из точек и цена, три рабочих
// стола, результат и люди за ним, три опоры и выбор. Только собственный рисунок фильма
// (src/lesson-musk/visuals): без издательской обложки, фотографий книги и чужих изображений.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { DC, DESKS } from "../../lesson-musk/theme";
import { dotsOf, SH } from "../../lesson-musk/visuals/dots";
import { BookSymbol, Car, Coins, DeskGlass, Rocket } from "../../lesson-musk/visuals/objects";
import { OL, Person } from "../../lesson-musk/visuals/people";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/elon-musk-ashlee-vance/thumbnails.json";

const ENG = [DC.eng.color, DC.eng.deep, "#7fe3dc"];
const Dots: React.FC<{ pts: { x: number; y: number; c: string }[]; r: number }> = ({ pts, r }) => (
  <g>
    {pts.map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.c} stroke="#1b1f3d" strokeOpacity={0.35} strokeWidth={1.2} />
    ))}
  </g>
);

// ── №1 Классическое: банан + книга-символ, ракета и машина из точек ──
const Classic: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #4f86c4 0%, #2c3f7a 60%, #1a2550 100%)">
    <Rays x={880} y={330} color="#bfe3ff" count={16} opacity={0.07} />
    <Glow x={900} y={360} r={250} color="#7fe3dc" opacity={0.35} />
    <Dots pts={dotsOf("th1-rocket", SH.rocket(220), 1100, 330, ENG, 11, 240)} r={4.6} />
    <Dots pts={dotsOf("th1-car", SH.car(190), 830, 520, [DC.ppl.color, DC.ppl.deep, "#ffb0a8"], 10, 210)} r={4.2} />
    <g filter="url(#softShadow)">
      <BookSymbol x={560} y={470} s={0.78} rot={-8} />
    </g>
    <Host x={250} y={860} scale={0.95} pose="present" mood="joy" face={{ lookX: 0.6 }} />
    <Headline x={40} y={130} lines={["ИЛОН МАСК"]} size={124} font={FONTS.display} fill={BRAND.yellow} stroke="#111433" strokeWidth={18} />
    <Pill x={44} y={212} text="разбор книги Эшли Вэнса" size={36} bg="#ffffff" />
    <ChannelBadge x={990} y={672} scale={0.78} dark />
    <Vignette strength={0.4} />
  </Frame>
);

// ── №2 Интрига: «ЦЕНА МЕЧТЫ» — ракета из точек и три нити-цены ──
const Price: React.FC = () => {
  const tags = [
    { x: 1090, y: 260, t: "риск", c: DC.eng.color },
    { x: 1150, y: 430, t: "деньги", c: DC.res.color },
    { x: 1080, y: 600, t: "люди", c: DC.ppl.color },
  ];
  return (
    <Frame bg="linear-gradient(135deg, #1d2a5c 0%, #2f4f8c 55%, #4f86c4 100%)">
      <Glow x={760} y={400} r={260} color="#7fe3dc" opacity={0.35} />
      <Dots pts={dotsOf("th2-rocket", SH.rocket(270), 760, 420, ENG, 11, 300)} r={5.2} />
      {tags.map((g, i) => (
        <g key={i}>
          <path d={`M ${790} ${300 + i * 140} Q ${940} ${300 + i * 120} ${g.x - 90} ${g.y}`} stroke={g.c} strokeWidth={9} fill="none" strokeLinecap="round" />
          <g transform={`translate(${g.x} ${g.y}) rotate(${-6 + i * 5})`} filter="url(#shadow)">
            <path d="M -100 -44 L 90 -44 L 120 0 L 90 44 L -100 44 Z" fill={g.c} stroke={OL} strokeWidth={5} />
            <circle cx={88} cy={0} r={9} fill="#fff" stroke={OL} strokeWidth={3} />
            <text x={-8} y={13} fontFamily={FONTS.heavy} fontWeight={900} fontSize={38} fill="#fff" textAnchor="middle" stroke={OL} strokeWidth={6} paintOrder="stroke">
              {g.t}
            </text>
          </g>
        </g>
      ))}
      <Host x={250} y={880} scale={0.98} pose="point" mood="shock" face={{ lookX: 0.8, eye: 1.25 }} />
      <Headline x={40} y={138} lines={["ЦЕНА", "МЕЧТЫ"]} size={124} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#111433" strokeWidth={18} lineGap={0.98} />
      <ChannelBadge x={990} y={60} scale={0.72} dark />
      <Vignette strength={0.4} />
    </Frame>
  );
};

// ── №3 Исследователь: три прозрачных стола, банан в очках объясняет ──
const Desks: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2c3f7a 0%, #5f86c4 100%)">
    {DESKS.map((d, i) => (
      <g key={d.id}>
        <DeskGlass id={d.id} x={560 + i * 270} y={560} w={240} h={170} label={false} level={[0.45, 0.7, 0.9][i]} t={1} />
        <g transform={`translate(${560 + i * 270} 440)`}>
          {i === 0 && <Rocket x={0} y={60} s={0.2} t={0} />}
          {i === 1 && <Coins x={0} y={40} n={3} s={0.6} />}
          {i === 2 && (
            <g>
              {[-50, 0, 50].map((dx, j) => (
                <g key={j} transform={`translate(${dx} 0)`}>
                  <circle cx={0} cy={-18} r={17} fill={DC.ppl.color} stroke={OL} strokeWidth={3} />
                  <path d="M -24 34 Q -24 2 0 2 Q 24 2 24 34 Z" fill={DC.ppl.color} stroke={OL} strokeWidth={3} />
                </g>
              ))}
            </g>
          )}
        </g>
      </g>
    ))}
    <Host x={210} y={860} scale={0.9} pose="point" mood="happy" glasses face={{ lookX: 0.7 }} />
    <Headline x={640} y={150} lines={["ИДЕИ МАЛО"]} size={130} font={FONTS.display} fill={BRAND.yellow} stroke="#111433" strokeWidth={18} anchor="middle" />
    <Pill x={830} y={690} text="инженерия · деньги · люди" size={34} bg="#ffffff" anchor="middle" />
    <ChannelBadge x={40} y={60} scale={0.68} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// ── №4 Сопоставление: блестящий результат слева, люди и ресурсы справа ──
const MoneyPeople: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #1f4f78 0%, #1f4f78 49.6%, #5c4058 50.4%, #c78a7c 100%)">
    <Glow x={320} y={400} r={240} color="#bfe3ff" opacity={0.4} />
    <Rocket x={250} y={600} s={0.8} t={0.3} flame={0.6} />
    <Car x={420} y={620} s={0.42} t={0} color={DC.eng.color} />
    {/* цепочка людей и ресурсов под результатом */}
    {(["engineer", "welder", "engineer2", "worker", "investor"] as const).map((w, i) => (
      <Person key={w} who={w} x={760 + (i % 3) * 150} y={i < 3 ? 470 : 690} s={0.42} mood="smile" pose={i === 4 ? "give" : "stand"} t={1} seed={i} />
    ))}
    <Coins x={1180} y={680} n={4} s={0.8} />
    <path d="M 620 560 L 740 560" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
    <path d="M 720 540 L 745 560 L 720 580" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Host x={640} y={780} scale={0.45} pose="open" mood="wonder" />
    <Headline x={640} y={130} lines={["ДЕНЬГИ И ЛЮДИ"]} size={104} font={FONTS.display} fill="#ffffff" stroke="#141633" strokeWidth={17} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.72} dark />
  </Frame>
);

// ── №5 Самый сильный: конструкция на трёх опорах, одна трескается, банан выбирает ──
const AllIn: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #3c2f5c 0%, #8a5a6c 60%, #e0b48a 100%)">
    <Glow x={820} y={300} r={240} color="#ffd23f" opacity={0.3} />
    {/* платформа с конструкцией */}
    <rect x={560} y={400} width={560} height={40} rx={14} fill="#f7f3ea" stroke={OL} strokeWidth={6} />
    <Dots pts={dotsOf("th5-rocket", SH.rocket(150), 700, 250, ENG, 9, 170)} r={3.8} />
    <Dots pts={dotsOf("th5-car", SH.car(130), 930, 340, [DC.ppl.color, DC.ppl.deep, "#ffb0a8"], 9, 150)} r={3.6} />
    {DESKS.map((d, i) => (
      <g key={d.id} transform={`translate(${620 + i * 220} 440)`}>
        <rect x={-36} y={0} width={72} height={240} rx={10} fill={i === 2 ? "#ff8a7a" : d.color} stroke={OL} strokeWidth={6} />
        {i === 2 && <path d="M -10 20 L 14 80 L -6 120 L 18 190" stroke={OL} strokeWidth={6} fill="none" />}
      </g>
    ))}
    <Host x={230} y={870} scale={0.95} pose="ask" mood="think" face={{ lookX: 0.8, lookY: -0.3 }} />
    <Headline x={40} y={130} lines={["РИСКНУТЬ", "ВСЕМ?"]} size={118} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#141633" strokeWidth={18} lineGap={0.98} />
    <ChannelBadge x={990} y={672} scale={0.78} dark />
    <Vignette strength={0.35} />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/elon-musk-ashlee-vance/thumbnails.json.
export const MUSK_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Price, 3: Desks, 4: MoneyPeople, 5: AllIn },
};
