// Пять YouTube-обложек фильма BM-009 «Психология денег» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Обложка книги нарисована своей простой графикой (не копия издательской обложки).
import React from "react";
import { OL, Worker } from "../../lesson-money/visuals/draw";
import { Bill, Car, Coin, CoinStack, Jar, Key, Mansion, Watch } from "../../lesson-money/visuals/props";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/morgan-housel-psychology-of-money/thumbnails.json";

// обложка книги в 3/4 (своя графика): тёмно-зелёный переплёт, золотая монета
const Cover: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter="url(#softShadow)">
    <path d="M 150 -210 L 176 -196 L 176 224 L 150 210 Z" fill="#f4ecd8" stroke={OL} strokeWidth={4} />
    <rect x={-150} y={-210} width={300} height={420} rx={14} fill="#17573f" stroke={OL} strokeWidth={5} />
    <rect x={-150} y={-210} width={30} height={420} rx={10} fill="#000" opacity={0.22} />
    <rect x={-104} y={-176} width={236} height={352} rx={10} fill="none" stroke="#e8c96a" strokeWidth={4} />
    <text x={14} y={-118} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={26} fill="#e8c96a">
      Морган Хаузел
    </text>
    <text x={14} y={-40} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={42} fill="#fff8e6">
      Психология
    </text>
    <text x={14} y={14} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={50} fill="#fff8e6">
      денег
    </text>
    <path d="M -40 50 L 68 50" stroke="#e8c96a" strokeWidth={3} />
    <g transform="translate(14 112)">
      <circle r={40} fill="#e8c96a" stroke="#8a6a1a" strokeWidth={4} />
      <circle r={28} fill="none" stroke="#8a6a1a" strokeWidth={3} />
      <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill="#8a6a1a" />
    </g>
  </g>
);

// швабра для уборщика
const Mop: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-6} y={-260} width={12} height={260} rx={6} fill="#b07a45" stroke={OL} strokeWidth={4} />
    <rect x={-46} y={-6} width={92} height={22} rx={6} fill="#5a6b82" stroke={OL} strokeWidth={4} />
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M ${-40 + i * 10} 16 q ${(i % 2) * 6 - 3} 26 ${(i % 3) * 4 - 4} 46`} stroke="#e9e3d2" strokeWidth={8} strokeLinecap="round" fill="none" />
    ))}
  </g>
);

// пакет из магазина
const Bag: React.FC<{ x: number; y: number; s?: number; color: string; rot?: number }> = ({ x, y, s = 1, color, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -30 -100 Q -30 -150 0 -150 Q 30 -150 30 -100" stroke={OL} strokeWidth={7} fill="none" />
    <path d="M -64 -104 L 64 -104 L 74 0 L -74 0 Z" fill={color} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-50} y={-78} width={100} height={10} rx={5} fill="#fff" opacity={0.5} />
  </g>
);

// облако
const Cloud: React.FC<{ x: number; y: number; s?: number; fill?: string; opacity?: number }> = ({ x, y, s = 1, fill = "#fff", opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <ellipse cx={0} cy={0} rx={120} ry={46} fill={fill} />
    <circle cx={-50} cy={-26} r={50} fill={fill} />
    <circle cx={30} cy={-40} r={64} fill={fill} />
    <circle cx={90} cy={-10} r={40} fill={fill} />
  </g>
);

// искра-блеск
const Spark: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#fff" }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M 0 -26 L 6 -6 L 26 0 L 6 6 L 0 26 L -6 6 L -26 0 L -6 -6 Z" fill={color} />
);

// ── №1 Классическое: радостный банан с книгой, тёплая «денежная» библиотека ──
const Classic: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 75%, #3f9a68 0%, #1f6a47 45%, #0f3a28 100%)">
    {/* полки на фоне */}
    {[0, 1, 2].map((r) => (
      <g key={r} opacity={0.22}>
        <rect x={0} y={200 + r * 190} width={TW} height={16} fill="#c99a5b" />
        {Array.from({ length: 34 }).map((_, i) => (
          <rect key={i} x={10 + i * 38} y={100 + r * 190 + ((i * 7 + r) % 3) * 10} width={28} height={100 - ((i * 7 + r) % 3) * 10} rx={3} fill={["#e0b25a", "#9fd3a8", "#f5e3b5", "#7fb88a"][(i + r) % 4]} />
        ))}
      </g>
    ))}
    <Glow x={820} y={470} r={260} color="#ffe28a" opacity={0.55} />
    {/* падающие монеты и купюры */}
    <Coin x={640} y={300} s={0.9} rot={-18} />
    <Coin x={1180} y={360} s={0.7} rot={22} />
    <Coin x={560} y={650} s={0.75} rot={8} />
    <Bill x={1200} y={560} s={0.8} rot={-24} />
    <Bill x={480} y={430} s={0.62} rot={30} />
    <Cover x={800} y={480} s={0.78} rot={7} />
    <Host x={1095} y={835} scale={0.86} pose="presentLeft" mood="joy" mouth={0.55} round={0.15} face={{ lookX: -0.5 }} />
    <Headline x={52} y={150} lines={["ПСИХОЛОГИЯ", "ДЕНЕГ"]} sizes={[104, 150]} size={104} font={FONTS.display} colors={["#fff", BRAND.yellow]} stroke="#0a2618" strokeWidth={16} lineGap={1.12} />
    <Pill x={56} y={500} text="Морган Хаузел" size={40} bg="#fff" color="#0f3a28" />
    <ChannelBadge x={56} y={630} scale={1.2} dark />
  </Frame>
);

// ── №2 Интрига: «Уборщик богаче банкира?» — банка сбережений против проданного особняка ──
const Intrigue: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #2c2a12 0%, #1b1d33 50%, #121725 100%)">
    {/* тёплый свет слева, грозовой холод справа */}
    <Rays x={330} y={470} color="#ffd23f" count={18} opacity={0.12} />
    <Glow x={330} y={470} r={240} color="#ffcf3f" opacity={0.6} />
    <Glow x={1040} y={420} r={260} color="#5b6d99" opacity={0.45} />
    <Cloud x={980} y={300} s={1.1} fill="#3a4258" />
    <Cloud x={1180} y={280} s={0.9} fill="#2f364a" />
    <path d="M 1100 320 L 1080 370 L 1105 370 L 1085 420" stroke="#ffe27a" strokeWidth={6} fill="none" strokeLinejoin="round" />
    <rect x={0} y={640} width={TW} height={80} fill="#000" opacity={0.25} />
    <Worker x={130} y={640} s={1.7} role="janitor" mood="smile" />
    <Mop x={218} y={640} s={1.1} rot={6} />
    <Jar x={390} y={490} s={1.05} level={0.22} />
    {/* монеты в банке */}
    <CoinStack x={330} y={575} n={13} s={0.55} />
    <CoinStack x={392} y={580} n={17} s={0.55} />
    <CoinStack x={452} y={575} n={12} s={0.55} />
    <Coin x={350} y={400} s={0.5} rot={-20} />
    <Coin x={430} y={420} s={0.5} rot={14} />
    <Coin x={395} y={300} s={0.62} rot={-6} />
    <Coin x={330} y={318} s={0.48} rot={18} />
    <Coin x={460} y={322} s={0.5} rot={-14} />
    <Spark x={290} y={300} s={0.9} color="#fff6c4" />
    <Spark x={500} y={390} s={0.6} color="#fff6c4" />
    <g opacity={0.9}>
      <Mansion x={1060} y={640} s={0.86} crack={1} sold={1} />
    </g>
    <Host x={680} y={870} scale={0.76} pose="shock" mood="shock" mouth={0.8} round={0.85} face={{ lookX: -0.7, lookY: -0.1 }} />
    <Headline x={640} y={110} lines={["УБОРЩИК", "БОГАЧЕ БАНКИРА?"]} sizes={[104, 86]} size={104} font={FONTS.heavy} weight={900} anchor="middle" colors={["#fff", BRAND.yellow]} stroke="#06080f" strokeWidth={16} lineGap={1.0} />
    <Cover x={92} y={130} s={0.3} rot={-8} />
    <Vignette strength={0.4} />
    <ChannelBadge x={1080} y={692} scale={0.7} />
  </Frame>
);

// ── №3 Профессор: банан в очках у доски «ПОВЕДЕНИЕ > УМ» ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #7a4a2a 0%, #5a3520 60%, #3a2214 100%)">
    {/* обои кабинета в полоску */}
    {Array.from({ length: 22 }).map((_, i) => (
      <rect key={i} x={i * 60} y={0} width={30} height={TH} fill="#000" opacity={0.06} />
    ))}
    <Glow x={250} y={220} r={200} color="#ffcf8a" opacity={0.35} />
    {/* школьная доска */}
    <rect x={400} y={60} width={850} height={470} rx={18} fill="#24453a" stroke="#a9733f" strokeWidth={18} />
    <rect x={418} y={78} width={814} height={434} rx={8} fill="none" stroke="#fff" strokeWidth={2} opacity={0.08} />
    <text x={825} y={250} textAnchor="middle" fontFamily={FONTS.condensed} fontWeight={700} fontSize={150} fill="#fdfbf2" letterSpacing={2}>
      ПОВЕДЕНИЕ
    </text>
    <text x={825} y={440} textAnchor="middle" fontFamily={FONTS.condensed} fontWeight={700} fontSize={170} letterSpacing={4}>
      <tspan fill={BRAND.yellow}>{">"}</tspan>
      <tspan fill="#9fe0c0" dx={40}>
        УМ
      </tspan>
    </text>
    <path d="M 560 280 Q 825 300 1090 276" stroke="#fdfbf2" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.75} />
    {/* мел и полочка */}
    <rect x={410} y={528} width={830} height={18} rx={6} fill="#a9733f" stroke={OL} strokeWidth={3} />
    <rect x={1080} y={512} width={44} height={14} rx={6} fill="#fff" />
    {/* стол */}
    <rect x={0} y={600} width={TW} height={120} fill="#2a180d" />
    <Cover x={1150} y={560} s={0.36} rot={6} />
    <Host x={205} y={800} scale={0.9} rotate={-9} pose="point" mood="lookBoard" mouth={0.45} glasses bowtie />
    <Pill x={470} y={650} text="Простое объяснение" size={46} bg={BRAND.yellow} color={BRAND.ink} />
    <ChannelBadge x={30} y={60} scale={0.85} />
  </Frame>
);

// ── №4 Противопоставление: ВИДНО | НЕ ВИДНО, задумчивый банан в центре ──
const Contrast: React.FC = () => (
  <Frame bg="#111">
    {/* левая половина: блеск покупок */}
    <defs>
      <linearGradient id="m4l" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff6f91" />
        <stop offset="1" stopColor="#b8326a" />
      </linearGradient>
      <linearGradient id="m4sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1f7fb8" />
        <stop offset="1" stopColor="#0b2747" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={TW / 2} height={TH} fill="url(#m4l)" />
    <Rays x={320} y={520} color="#ffe0ef" count={14} opacity={0.18} />
    {/* правая половина: небо и море с айсбергом */}
    <rect x={TW / 2} y={0} width={TW / 2} height={430} fill="#bfe6ff" />
    <rect x={TW / 2} y={430} width={TW / 2} height={TH - 430} fill="url(#m4sea)" />
    <path d="M 860 430 L 930 352 L 980 380 L 1030 330 L 1110 430 Z" fill="#ffffff" stroke="#7ab3d6" strokeWidth={4} />
    <path d="M 780 430 L 1190 430 L 1250 560 L 1180 720 L 820 720 L 720 590 Z" fill="#9fd6f2" opacity={0.55} />
    <path d="M 640 430 L 1280 430" stroke="#fff" strokeWidth={5} opacity={0.8} />
    <Jar x={930} y={590} s={0.62} level={0.15} />
    <CoinStack x={895} y={640} n={9} s={0.38} />
    <CoinStack x={932} y={644} n={12} s={0.38} />
    <CoinStack x={968} y={640} n={8} s={0.38} />
    <Key x={1120} y={600} s={0.8} rot={-28} />
    <Spark x={1170} y={520} s={0.7} color="#fff6c4" />
    <Spark x={960} y={500} s={0.5} color="#fff6c4" />
    {/* левая сторона: машина, часы, пакеты */}
    <Car x={265} y={605} s={0.92} color="#ffd23f" shine={1} t={0} />
    <g>
      <rect x={112} y={290} width={56} height={180} rx={14} fill="#3a2a4a" stroke={OL} strokeWidth={4} />
      <Watch x={140} y={380} s={0.6} a={50} />
    </g>
    <Bag x={470} y={470} s={0.8} color="#8e6cf0" rot={-6} />
    <Bag x={560} y={440} s={0.7} color="#2fbfa0" rot={8} />
    {/* разделитель */}
    <rect x={TW / 2 - 4} y={0} width={8} height={TH} fill="#fff" />
    <Host x={640} y={845} scale={0.7} pose="think" mood="think" mouth={0.08} face={{ lookX: 0.6 }} />
    {/* заголовок */}
    <rect x={0} y={0} width={TW} height={200} fill="#14101d" opacity={0.9} />
    <Headline x={640} y={92} lines={["БОГАТСТВО,", "КОТОРОГО НЕ ВИДНО"]} sizes={[86, 62]} size={86} font={FONTS.display} anchor="middle" colors={["#fff", BRAND.yellow]} stroke="#000" strokeWidth={10} lineGap={0.95} />
    <Pill x={320} y={280} text="ВИДНО" size={52} bg="#fff" color="#b8326a" anchor="middle" />
    <Pill x={960} y={280} text="НЕ ВИДНО" size={52} bg="#0b2747" color="#fff" anchor="middle" />
    <ChannelBadge x={1000} y={690} scale={0.7} />
  </Frame>
);

// ── №5 Самый сильный: лестница за деньгами в облака и спокойный банан на скамейке ──
const LADDER: [number, number, number] = [210, 790, 600]; // низ x, низ y, верх x (верх y = -40)
const Strong: React.FC = () => {
  const [bx, by, tx] = LADDER;
  const ty = -40;
  const at = (k: number) => [bx + (tx - bx) * k, by + (ty - by) * k] as const;
  return (
    <Frame bg="linear-gradient(100deg, #46536f 0%, #6d7d9c 38%, #f4a26b 66%, #ffcf7a 100%)">
      <Glow x={1000} y={560} r={300} color="#fff1b8" opacity={0.75} />
      <Rays x={1000} y={560} color="#fff3c8" count={20} opacity={0.2} />
      {/* облака и деньги вверху лестницы */}
      <Coin x={560} y={70} s={0.8} rot={-12} />
      <Bill x={680} y={110} s={0.7} rot={18} />
      <Coin x={760} y={40} s={0.6} rot={10} />
      <Cloud x={500} y={150} s={1.2} fill="#e4e8f2" />
      <Cloud x={720} y={170} s={1.0} fill="#d5dbe8" />
      <Cloud x={340} y={110} s={0.8} fill="#cfd6e6" opacity={0.9} />
      {/* лестница */}
      {[-46, 46].map((dx) => (
        <line key={dx} x1={bx + dx} y1={by} x2={tx + dx} y2={ty} stroke="#5a3a1f" strokeWidth={12} strokeLinecap="round" />
      ))}
      {Array.from({ length: 19 }).map((_, i) => {
        const [x, y] = at(i / 18);
        return <line key={i} x1={x - 46} y1={y} x2={x + 46} y2={y} stroke="#7a5230" strokeWidth={8} strokeLinecap="round" />;
      })}
      {/* люди лезут вверх, всё меньше к облакам */}
      {[0.08, 0.2, 0.32, 0.44, 0.56, 0.68].map((k, i) => {
        const [x, y] = at(k);
        return <Worker key={i} x={x} y={y + 30} s={0.62 - k * 0.32} role={(["clerk", "boss", "plain", "cashier", "clerk", "boss"] as const)[i]} arms={1} mood="flat" />;
      })}
      <Cloud x={640} y={240} s={0.7} fill="#e4e8f2" opacity={0.85} />
      {/* скамейка */}
      <g>
        <rect x={830} y={505} width={330} height={20} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
        <rect x={830} y={540} width={330} height={20} rx={6} fill="#8a5a2b" stroke={OL} strokeWidth={4} />
      </g>
      <Host x={995} y={660} scale={0.6} pose="heart" mood="calm" mouth={0.12} face={{ eye: 0.72, smile: 1, cheek: 0.7, lookY: 0.1 }} />
      <g>
        <rect x={810} y={622} width={370} height={26} rx={8} fill="#a86d36" stroke={OL} strokeWidth={4} />
        <rect x={840} y={646} width={18} height={70} fill="#6b4422" stroke={OL} strokeWidth={3} />
        <rect x={1132} y={646} width={18} height={70} fill="#6b4422" stroke={OL} strokeWidth={3} />
      </g>
      <rect x={0} y={700} width={TW} height={20} fill="#3a3a2a" opacity={0.25} />
      <Headline x={1000} y={140} lines={["МНЕ", "ХВАТАЕТ"]} sizes={[92, 100]} size={100} font={FONTS.serif} weight={700} anchor="middle" colors={["#fff", "#fff"]} stroke="#4a1f0a" strokeWidth={16} lineGap={1.0} />
      <Vignette strength={0.35} />
      <ChannelBadge x={30} y={680} scale={0.7} />
    </Frame>
  );
};

// Тексты, концепции и рекомендация — в books/morgan-housel-psychology-of-money/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const MONEY_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
