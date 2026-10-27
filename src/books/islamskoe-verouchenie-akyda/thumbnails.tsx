// Пять YouTube-обложек BM-003 «Исламское вероучение (Акыда)», канал BanaMind.
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Религиозное правило: на обложках нет изображений Аллаха, пророков, ангелов, джиннов,
// их силуэтов или «заменителей» — только банан-ведущий, природа, предметы и надписи.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/islamskoe-verouchenie-akyda/thumbnails.json";
import { Camel, Mountains, OL, Star8 } from "./visuals/draw";

const TITLE = ["Исламское", "вероучение"];
const SUB = "(Акыда) · Кылавуз";

const Stars: React.FC<{ n: number; seed: number; h?: number }> = ({ n, seed, h = 420 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = (i * 263 + seed * 97) % TW;
      const y = (i * 151 + seed * 31) % h;
      return <circle key={i} cx={x} cy={y} r={1 + (i % 3)} fill="#fff" opacity={0.35 + (i % 4) * 0.15} />;
    })}
  </g>
);

// орнамент из восьмиконечных звёзд
const Ornament: React.FC<{ color: string; opacity: number }> = ({ color, opacity }) => (
  <g opacity={opacity}>
    {Array.from({ length: 7 * 4 }).map((_, i) => (
      <Star8 key={i} x={(i % 7) * 200 + (Math.floor(i / 7) % 2 ? 100 : 0)} y={Math.floor(i / 7) * 190 + 40} r={56} fill="none" stroke={color} />
    ))}
  </g>
);

// ── №1 Классическое: банан + книга, изумрудный зал с орнаментом ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #0f4a3c 0%, #1f7a5c 55%, #0b3a30 100%)">
    <Ornament color="#e8c96a" opacity={0.16} />
    <Glow x={560} y={430} r={260} color="#ffe7a8" opacity={0.35} />
    <Host x={250} y={800} scale={0.98} pose="present" mood="happy" mouth={0.3} />
    <BookCover x={560} y={460} scale={0.7} rotate={-7} title={TITLE} subtitle={SUB} color="#1e5a4a" />
    <Headline x={760} y={150} lines={["ИСЛАМСКОЕ", "ВЕРОУЧЕНИЕ"]} size={64} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#062a22" strokeWidth={14} lineGap={1.08} />
    <Headline x={764} y={330} lines={["АКЫДА"]} size={96} font={FONTS.serif} weight={700} fill="#fff4d0" stroke="#062a22" strokeWidth={14} />
    <Pill x={768} y={420} text="вся книга за 30 минут" size={32} bg="#fff4d0" />
    <Pill x={768} y={500} text="проф. Ахмед Саим Кылавуз" size={26} bg="#9fdcc0" />
    <ChannelBadge x={40} y={60} scale={0.8} dark />
  </Frame>
);

// ── №2 Интрига: ночь, вечные вопросы книги, удивлённый банан ──
const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 40% 40%, #2b3f7a 0%, #141f45 55%, #070b1c 100%)">
    <Stars n={110} seed={7} h={720} />
    <g transform="scale(0.667)">
      <Mountains y={1000} color="#1b2140" seed={4} />
    </g>
    <Glow x={520} y={360} r={260} color="#9fb6ff" opacity={0.25} />
    <Headline x={60} y={150} lines={["ОТКУДА Я?", "ЗАЧЕМ Я?"]} size={110} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#06101f" strokeWidth={16} lineGap={1.05} />
    <Headline x={66} y={420} lines={["КУДА Я ИДУ?"]} size={64} font={FONTS.heavy} weight={900} fill="#c9d3ee" stroke="#06101f" strokeWidth={12} />
    <Host x={1050} y={850} scale={0.98} pose="shock" mood="wonder" mouth={0.55} round={0.7} face={{ lookX: -0.8, lookY: -0.4, eye: 1.3, brow: 0.9 }} />
    <BookCover x={560} y={560} scale={0.36} rotate={8} title={TITLE} subtitle={SUB} color="#1e5a4a" />
    <Pill x={66} y={660} text="ответы книги «Исламское вероучение»" size={26} bg="#ffffff" padX={30} />
    <ChannelBadge x={980} y={56} scale={0.75} dark />
    <Vignette strength={0.45} />
  </Frame>
);

// ── №3 Профессор: банан в очках у кафедры, библиотека с арками ──
const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #5a3a22 0%, #2e1d12 100%)">
    {Array.from({ length: 5 }).map((_, i) => (
      <g key={i} transform={`translate(${130 + i * 260} 0)`}>
        <path d="M -105 720 L -105 230 Q -105 110 0 85 Q 105 110 105 230 L 105 720 Z" fill="#3f2a18" stroke="#e8c96a" strokeWidth={4} opacity={0.85} />
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={-85} y={290 + r * 105} width={170} height={10} fill="#7a4b2a" />
            {Array.from({ length: 7 }).map((_, b) => (
              <rect key={b} x={-80 + b * 23} y={290 + r * 105 - 62 - ((b * 7 + i) % 3) * 6} width={18} height={62 + ((b * 7 + i) % 3) * 6} fill={["#1f6b55", "#7a2e3a", "#2f4f8a", "#b8864b"][(b + r + i) % 4]} />
            ))}
          </g>
        ))}
      </g>
    ))}
    <rect x={0} y={0} width={TW} height={TH} fill="#000" opacity={0.25} />
    <Glow x={900} y={380} r={240} color="#ffe3a0" opacity={0.4} />
    <path d="M 760 720 L 820 480 L 1060 480 L 1120 720 Z" fill="#7a4b2a" stroke="#3b2a10" strokeWidth={6} />
    <BookCover x={940} y={330} scale={0.62} rotate={6} title={TITLE} subtitle={SUB} color="#1e5a4a" />
    <Host x={360} y={830} scale={1.02} pose="point" mood="happy" mouth={0.3} glasses bowtie face={{ smile: 0.65, brow: 0.25, lookX: 0.6 }} />
    <Headline x={56} y={130} lines={["АКЫДА"]} size={120} font={FONTS.display} fill="#fff4d0" stroke="#1a0e06" strokeWidth={16} />
    <Pill x={62} y={215} text="основы веры — по порядку" size={34} bg="#e8c96a" />
    <Pill x={940} y={660} text="Простое объяснение" size={36} anchor="middle" bg={BRAND.yellow} />
    <ChannelBadge x={40} y={690} scale={0.72} dark />
  </Frame>
);

// ── №4 Противопоставление: «Судьба» против «Выбора» ──
const Contrast: React.FC = () => (
  <Frame bg="#1a1a1a">
    <rect x={0} y={0} width={TW / 2} height={TH} fill="#24356b" />
    <rect x={TW / 2} y={0} width={TW / 2} height={TH} fill="#f3d9a4" />
    {/* слева: лист на ветру — образ книги для «полной зависимости» */}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M 40 ${360 + i * 60} q 120 -40 240 0 t 240 0`} stroke="#9fb6ff" strokeWidth={8} fill="none" opacity={0.55} />
    ))}
    <path d="M 0 0 Q -46 -70 46 -96 Q 70 -20 0 0 Z" fill="#7cc576" stroke={OL} strokeWidth={6} transform="translate(300 440) rotate(-30) scale(1.6)" />
    {/* справа: привязанный верблюд — «привяжи верблюда» */}
    <rect x={850} y={330} width={26} height={260} rx={8} fill="#8a5a33" stroke={OL} strokeWidth={5} />
    <path d="M 876 380 Q 960 420 1040 430" stroke="#8a5a33" strokeWidth={8} fill="none" />
    <Camel x={1110} y={580} s={0.95} walk={0} />
    <Headline x={40} y={130} lines={["СУДЬБА"]} size={110} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#0b1430" strokeWidth={12} />
    <Headline x={1244} y={130} lines={["ВЫБОР?"]} size={110} font={FONTS.condensed} weight={700} fill="#c8643b" stroke="#2b1a0e" strokeWidth={12} anchor="end" />
    <Pill x={640} y={200} text="или" size={46} anchor="middle" bg={BRAND.yellow} font={FONTS.condensed} weight={700} />
    <Host x={640} y={860} scale={0.9} pose="think" mood="think" face={{ lookX: 0.2, lookY: -0.9 }} />
    <Pill x={180} y={650} text="четыре школы" size={32} anchor="middle" bg="#ffffff" />
    <ChannelBadge x={980} y={680} scale={0.72} dark />
  </Frame>
);

// ── №5 Самый сильный: «Картина без художника?» — довод книги о Творце ──
const Strongest: React.FC = () => (
  <Frame bg="radial-gradient(circle at 65% 45%, #fff1c4 0%, #ffcf6a 45%, #c8643b 100%)">
    <Rays x={820} y={380} color="#fff8e6" count={22} opacity={0.2} />
    {/* мольберт с картиной — рядом никого */}
    <g transform="translate(900 470) scale(0.85)">
      <path d="M -150 300 L -40 -220 M 150 300 L 40 -220 M 0 -230 L 0 320" stroke="#5b3b1c" strokeWidth={16} strokeLinecap="round" />
      <rect x={-230} y={-210} width={460} height={330} fill="#fffaf0" stroke={OL} strokeWidth={10} />
      <rect x={-205} y={-185} width={410} height={280} fill="#8fd0f0" />
      <path d="M -205 95 L -100 -20 L -10 60 L 80 -50 L 205 95 Z" fill="#7a9a5a" />
      <circle cx={130} cy={-110} r={36} fill="#ffd25e" />
    </g>
    <Headline x={40} y={130} lines={["КАРТИНА", "БЕЗ ХУДОЖНИКА?"]} size={78} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#3a1608" strokeWidth={16} lineGap={1.05} rotate={-2} />
    <Host x={190} y={930} scale={0.9} pose="shock" mood="shock" mouth={0.7} round={0.8} face={{ eye: 1.3, brow: 0.9, lookX: 0.8 }} />
    <Pill x={430} y={660} text="вера и разум · «Исламское вероучение»" size={24} bg="#ffffff" padX={30} />
    <ChannelBadge x={1000} y={56} scale={0.72} dark />
  </Frame>
);

export const AKYDA_THUMBNAILS: BookThumbnails = {
  slug: meta.slug,
  title: meta.title,
  thumbnails: meta.thumbnails as BookThumbnails["thumbnails"],
  recommended: meta.recommended,
  why: meta.why,
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strongest },
};

export { TH };
