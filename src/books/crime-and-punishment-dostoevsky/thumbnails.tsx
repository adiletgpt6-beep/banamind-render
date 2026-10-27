// Пять YouTube-обложек фильма BM-016 «Преступление и наказание» (канал BanaMind).
// Пять разных постановок: весы (чёрно-золотая), две дороги, сломленный силуэт в
// Петербурге, интеллектуальная дуэль, литературный банан в библиотеке.
// Без крови и насилия, без чужих иллюстраций и кадров экранизаций — персонажи
// нарисованы заново в стиле фильма (src/lesson-crime/visuals/draw.tsx).
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { House, OL, Person, Scales } from "../../lesson-crime/visuals/draw";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/crime-and-punishment-dostoevsky/thumbnails.json";

const GOLD = "#e8b84a";
const TITLE = ["Преступление", "и наказание"];

// ── №1 «ТЕОРИЯ УБИЙСТВА?» — чёрно-золотые двойные весы ──
const Theory: React.FC = () => (
  <Frame bg="radial-gradient(circle at 70% 45%, #4a3a1c 0%, #1d1a26 55%, #0e0d14 100%)">
    <Rays x={880} y={250} color="#ffd98a" count={18} opacity={0.08} />
    <Glow x={880} y={300} r={260} color="#e8b84a" opacity={0.35} />
    <g transform="translate(880 130) scale(0.78)">
      <Scales
        x={0}
        y={0}
        s={1}
        tilt={0.75}
        color={GOLD}
        left={
          <g>
            <Person who="lizaveta" x={0} y={-6} s={0.42} mood="kind" t={0} />
          </g>
        }
        right={
          <g>
            {Array.from({ length: 12 }).map((_, i) => (
              <text key={i} x={((i % 4) - 1.5) * 44} y={-14 - Math.floor(i / 4) * 40} fontFamily={FONTS.serif} fontWeight={700} fontSize={40} fill="#fff4cf" textAnchor="middle">
                {(i * 7 + 1) % 10}
              </text>
            ))}
          </g>
        }
      />
    </g>
    <Pill x={652} y={300} text="человек" size={30} bg="#fff4cf" anchor="middle" />
    <Pill x={1112} y={360} text="«сотни»" size={30} bg={GOLD} anchor="middle" />
    <Host x={200} y={800} scale={0.98} pose="think" mood="think" face={{ smile: -0.25, brow: 0.2, tilt: -0.3, lookX: 0.8, lookY: -0.4 }} />
    <Headline x={40} y={150} lines={["ТЕОРИЯ", "УБИЙСТВА?"]} size={112} font={FONTS.display} fill="#fff4cf" colors={["#fff4cf", GOLD]} stroke="#0e0d14" strokeWidth={16} lineGap={1.0} />
    <ChannelBadge x={980} y={668} scale={0.85} dark />
    <Vignette strength={0.5} />
  </Frame>
);

// ── №2 «СОВЕСТЬ ИЛИ СУД?» — две дороги и лицо ведущего ──
const Roads: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #3d4a7c 0%, #8c7aa8 55%, #e6c79a 100%)">
    <Glow x={330} y={320} r={200} color="#ffe1b0" opacity={0.55} />
    <Glow x={960} y={320} r={200} color="#b9c4ff" opacity={0.45} />
    {/* две дороги расходятся от зрителя */}
    <path d="M 560 720 L 640 720 L 380 330 L 340 330 Z" fill="#f2e2c4" opacity={0.95} />
    <path d="M 680 720 L 760 720 L 950 330 L 910 330 Z" fill="#c9cde6" opacity={0.95} />
    <Pill x={360} y={290} text="совесть" size={46} bg="#ffe1b0" anchor="middle" />
    <Pill x={930} y={290} text="суд" size={46} bg="#c9cde6" anchor="middle" />
    <g transform="translate(360 330)">
      <circle r={36} fill="#ffd98a" />
    </g>
    <g transform="translate(930 330)">
      <rect x={-34} y={-30} width={68} height={50} rx={6} fill="#6c5ea8" />
    </g>
    <Host x={640} y={1150} scale={1.3} pose="think" mood="think" face={{ smile: -0.15, brow: 0.45, tilt: 0.4, eye: 1.12, lookX: -0.6, lookY: -0.5 }} />
    <Headline x={640} y={128} lines={["СОВЕСТЬ ИЛИ СУД?"]} size={100} font={FONTS.display} fill="#ffffff" stroke="#1f2440" strokeWidth={16} anchor="middle" />
    <ChannelBadge x={990} y={672} scale={0.8} dark />
  </Frame>
);

// ── №3 «ПОЧЕМУ ОН СЛОМАЛСЯ?» — абстрактный Петербург, силуэт, мягкий луч ──
const Broken: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #2b3158 0%, #4a4f86 60%, #6a5f9e 100%)">
    <g opacity={0.9}>
      {Array.from({ length: 9 }).map((_, i) => (
        <House key={i} x={-30 + i * 150} y={600} w={140} h={260 + ((i * 97) % 200)} color={i % 2 ? "#3a3f6a" : "#33385f"} t={0} seed={i + 2} lit={0.18} floors={6} />
      ))}
    </g>
    <rect x={0} y={600} width={TW} height={120} fill="#262a4a" />
    {/* мягкий луч сверху */}
    <path d="M 760 -20 L 1020 -20 L 980 640 L 800 640 Z" fill="#ffe9b8" opacity={0.22} />
    <Glow x={890} y={560} r={120} color="#ffe9b8" opacity={0.5} />
    <g transform="translate(890 650) scale(1.25)">
      <Person who="rask" x={0} y={0} s={0.62} pose="cover" mood="closed" t={0} tint={0.15} />
    </g>
    {/* трещина через кадр */}
    <path d="M 700 0 L 740 120 L 700 200 L 760 330 L 720 420" stroke="#ffd98a" strokeWidth={5} fill="none" opacity={0.65} />
    <Host x={1150} y={900} scale={0.92} pose="hush" mood="serious" face={{ smile: -0.3, tilt: 0.4, brow: 0.2, lookX: -0.9 }} />
    <Headline x={40} y={150} lines={["ПОЧЕМУ", "ОН СЛОМАЛСЯ?"]} size={100} font={FONTS.display} fill="#ffffff" colors={["#ffffff", "#ffd98a"]} stroke="#141633" strokeWidth={16} lineGap={1.02} />
    <Pill x={44} y={668} text="Преступление и наказание" size={30} bg="#ffffff" />
    <ChannelBadge x={1000} y={60} scale={0.78} dark />
    <Vignette strength={0.45} />
  </Frame>
);

// ── №4 «ГЕНИЙ ИЛИ ПРЕСТУПНИК?» — разорванная теория, дуэль ──
const Duel: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #2f3a6a 0%, #2f3a6a 49.6%, #6b4a2a 50.4%, #6b4a2a 100%)">
    <Glow x={320} y={380} r={220} color="#8fb6e0" opacity={0.35} />
    <Glow x={960} y={380} r={220} color="#e8b84a" opacity={0.35} />
    {/* разорванный лист статьи */}
    <g transform="translate(640 470) rotate(-4)">
      <path d="M -200 -150 L 0 -150 L -20 -90 L 10 -40 L -15 10 L 12 60 L -10 150 L -200 150 Z" fill="#f1ead6" stroke={OL} strokeWidth={4} />
      <text x={-105} y={-100} fontFamily={FONTS.serif} fontWeight={700} fontSize={26} fill="#1f2440" textAnchor="middle">
        О преступ-
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-180} y={-60 + i * 36} width={140} height={10} rx={5} fill="#8a93b5" opacity={0.6} />
      ))}
    </g>
    <g transform="translate(680 450) rotate(7)">
      <path d="M 40 -150 L 220 -150 L 220 150 L 30 150 L 52 60 L 28 10 L 54 -40 L 24 -90 Z" fill="#f1ead6" stroke={OL} strokeWidth={4} />
      <text x={130} y={-100} fontFamily={FONTS.serif} fontWeight={700} fontSize={26} fill="#1f2440" textAnchor="middle">
        лении
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={70} y={-60 + i * 36} width={130} height={10} rx={5} fill="#8a93b5" opacity={0.6} />
      ))}
    </g>
    <g transform="translate(250 700) scale(1.25)">
      <Person who="rask" x={0} y={0} s={0.7} mood="tense" t={0} />
    </g>
    <g transform="translate(1030 700) scale(1.25)">
      <Person who="porfiry" x={0} y={0} s={0.7} mood="smile" t={0} flip look={-0.8} />
    </g>
    <Headline x={640} y={110} lines={["ГЕНИЙ ИЛИ", "ПРЕСТУПНИК?"]} size={90} font={FONTS.display} fill="#ffffff" colors={["#ffffff", BRAND.yellow]} stroke="#141633" strokeWidth={15} lineGap={1.0} anchor="middle" />
    <Host x={640} y={790} scale={0.62} pose="shrug" mood="confused" face={{ smile: -0.2 }} />
    <ChannelBadge x={1000} y={672} scale={0.78} dark />
  </Frame>
);

// ── №5 «ПРЕСТУПЛЕНИЕ И НАКАЗАНИЕ» — литературный банан в библиотеке ──
const Library: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #4a3326 0%, #6e4b36 60%, #3a2a20 100%)">
    {/* полки с корешками */}
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={0} y={60 + r * 200} width={TW} height={16} fill="#2e2018" />
        {Array.from({ length: 26 }).map((_, i) => {
          const h = 120 + ((i * 37 + r * 13) % 50);
          return <rect key={i} x={10 + i * 49} y={60 + r * 200 - h} width={40} height={h} rx={4} fill={["#7a2f2f", "#2f5a4a", "#3d4b72", "#8a6a3a", "#5a3a5a"][(i + r) % 5]} opacity={0.8} />;
        })}
      </g>
    ))}
    <rect x={0} y={0} width={TW} height={TH} fill="#1d140f" opacity={0.45} />
    <Glow x={440} y={420} r={220} color="#ffcf7a" opacity={0.5} />
    <BookCover x={470} y={420} scale={0.92} rotate={-6} title={TITLE} subtitle="Фёдор Достоевский" color="#5a1f24" accent="#e8c96a" />
    <Host x={980} y={840} scale={1.05} pose="present" mood="calm" glasses bowtie face={{ lookX: -0.8, smile: 0.3 }} />
    <Headline x={640} y={112} lines={["ПРЕСТУПЛЕНИЕ И НАКАЗАНИЕ"]} size={70} font={FONTS.serif} weight={700} fill="#fff4dc" stroke="#1d140f" strokeWidth={12} anchor="middle" />
    <Pill x={640} y={190} text="разбор за 30 минут" size={34} bg={BRAND.yellow} anchor="middle" />
    <ChannelBadge x={40} y={672} scale={0.8} dark />
    <Vignette strength={0.5} />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/crime-and-punishment-dostoevsky/thumbnails.json.
export const CRIME_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Theory, 2: Roads, 3: Broken, 4: Duel, 5: Library },
};
