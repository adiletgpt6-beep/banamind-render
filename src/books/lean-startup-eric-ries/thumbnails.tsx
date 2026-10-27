// Пять YouTube-обложек BM-024 «Бизнес с нуля» Э. Риса (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Собственный визуал «Лаборатории гипотез» из фильма (капсулы, шары, шестерни, прототип, компас);
// издательская обложка, рисунки книги и чужой фирменный стиль не используются.
import React from "react";
import { FONTS } from "../../banamind/fonts";
import { BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/lean-startup-eric-ries/thumbnails.json";
import { Balloon, BookCover, Capsule, Compass, Drop, Flask, Gear, OL, Paper, Phone } from "./film/visuals/draw";

const AuthorTag: React.FC<{ x: number; y: number; dark?: boolean; anchor?: "start" | "middle" }> = ({ x, y, dark, anchor }) => (
  <Pill x={x} y={y} text="Эрик Рис · «Бизнес с нуля»" size={28} bg={dark ? "#fff" : BRAND.ink} color={dark ? BRAND.ink : "#fff"} anchor={anchor} />
);

// ── №1 Классическое: банан в лаборатории, книга, пузырь кликов ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(160deg, #e9f9ff 0%, #bfeaff 55%, #7fd0f2 100%)">
    {Array.from({ length: 17 }).map((_, i) => (
      <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={720} stroke="#1d2740" strokeOpacity={0.05} strokeWidth={2} />
    ))}
    <Glow x={360} y={420} r={240} color="#ffffff" opacity={0.8} />
    <g transform="translate(1080 300)">
      <Balloon x={0} y={0} r={130} text="клики" color="#ff7eb0" t={0.4} size={48} />
    </g>
    <g transform="translate(620 450) rotate(-6) scale(0.78)">
      <BookCover x={0} y={0} />
    </g>
    <Flask x={900} y={520} s={1.0} level={0.5} t={0.8} color="#19b39a" />
    <Host x={250} y={800} scale={0.95} pose="present" mood="think" mouth={0.25} face={{ lookX: 0.7 }} />
    <Headline x={1250} y={120} lines={["ИДЕЯ", "НЕ ПРОДАЁТСЯ?"]} size={84} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke={BRAND.ink} strokeWidth={16} lineGap={1.08} anchor="end" />
    <AuthorTag x={760} y={668} />
    <ChannelBadge x={40} y={62} scale={0.85} dark />
  </Frame>
);

// ── №2 Интрига: пустое приложение, паутина, стрелка к тесту ──
const EmptyStore: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #fff6dc 0%, #ffe3a3 100%)">
    <Rays x={760} y={430} color="#fff7d6" count={18} opacity={0.35} />
    <g transform="translate(830 450) rotate(-4) scale(1.0)">
      <Phone x={0} y={0}>
        <rect x={-90} y={-180} width={180} height={50} rx={10} fill="#d3ebff" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-90 + (i % 2) * 96} y={-110 + Math.floor(i / 2) * 96} width={84} height={84} rx={12} fill="#eef1f6" />
        ))}
        <text x={0} y={140} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={90} fill="#d8433a">
          0
        </text>
        <path d="M 60 -200 Q 80 -150 108 -150 M 60 -200 Q 70 -140 100 -110 M 60 -200 L 108 -120" stroke="#9aa3b5" strokeWidth={3} fill="none" />
      </Phone>
    </g>
    <path d="M 975 470 C 1030 460 1060 420 1090 380" stroke="#1d2740" strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M 1060 372 L 1096 372 L 1090 408" stroke="#1d2740" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Flask x={1150} y={300} s={1.05} level={0.55} t={0.2} color="#19b39a" />
    <Pill x={1150} y={440} text="тест" size={36} bg="#19b39a" color="#fff" anchor="middle" />
    <Host x={250} y={820} scale={0.95} pose="shrug" mood="confused" mouth={0.35} round={0.4} />
    <Headline x={40} y={110} lines={["КЛИЕНТЫ", "НЕ ПРИХОДЯТ?"]} size={86} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke={BRAND.ink} strokeWidth={16} lineGap={1.05} />
    <AuthorTag x={760} y={672} />
    <ChannelBadge x={980} y={60} scale={0.85} dark />
  </Frame>
);

// ── №3 Профессор: банан в очках, бумажный прототип и круг обучения ──
const StartWithTest: React.FC = () => (
  <Frame bg="radial-gradient(circle at 62% 45%, #2f5f8a 0%, #1d3d63 60%, #10243e 100%)">
    {Array.from({ length: 9 }).map((_, i) => (
      <line key={i} x1={0} y1={i * 80} x2={1280} y2={i * 80} stroke="#fff" strokeOpacity={0.05} strokeWidth={2} />
    ))}
    <g transform="translate(870 420)">
      <circle r={220} fill="none" stroke="#27b4e6" strokeWidth={26} strokeDasharray="300 46" />
      {["создать", "оценить", "научиться"].map((w, i) => {
        const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
        return <Pill key={w} x={Math.cos(a) * 220} y={Math.sin(a) * 220 + 10} text={w} size={30} bg="#fff" anchor="middle" />;
      })}
      <g transform="rotate(4) scale(0.58)">
        <Paper x={0} y={0} k={1} />
      </g>
    </g>
    <Host x={250} y={820} scale={0.98} pose="pointUp" mood="happy" mouth={0.45} glasses bowtie />
    <Headline x={40} y={120} lines={["НАЧНИТЕ", "С ТЕСТА"]} size={92} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#06101f" strokeWidth={16} lineGap={1.08} />
    <Pill x={450} y={672} text="Простое объяснение" size={34} />
    <ChannelBadge x={980} y={672} scale={0.85} />
  </Frame>
);

// ── №4 Противопоставление: две дороги — прежний курс и вираж; компас в центре ──
const TwoRoutes: React.FC = () => (
  <Frame bg="linear-gradient(90deg, #a7b0c2 0%, #cdd3df 49.9%, #c9b8ff 50.1%, #8c6cf0 100%)">
    <path d="M 640 720 C 600 560 300 520 180 300" stroke="#7a849c" strokeWidth={70} fill="none" strokeLinecap="round" />
    <path d="M 640 720 C 600 560 300 520 180 300" stroke="#fff" strokeWidth={6} strokeDasharray="22 22" fill="none" opacity={0.6} />
    <path d="M 640 720 C 700 560 1000 520 1100 300" stroke="#5a3cc0" strokeWidth={70} fill="none" strokeLinecap="round" />
    <path d="M 640 720 C 700 560 1000 520 1100 300" stroke="#fff" strokeWidth={6} strokeDasharray="22 22" fill="none" />
    <g transform="translate(180 260)">
      <circle r={44} fill="#e5484d" stroke={OL} strokeWidth={6} />
      <path d="M -18 -18 L 18 18 M 18 -18 L -18 18" stroke="#fff" strokeWidth={10} strokeLinecap="round" />
    </g>
    <g transform="translate(1100 250)">
      <path d="M 0 -50 L 15 -15 L 52 -12 L 24 12 L 33 48 L 0 28 L -33 48 L -24 12 L -52 -12 L -15 -15 Z" fill="#ffd23f" stroke={OL} strokeWidth={5} />
    </g>
    <Compass x={640} y={370} r={95} angle={48} />
    <Host x={640} y={830} scale={0.82} pose="shrug" mood="think" mouth={0.2} />
    <Headline x={640} y={110} lines={["МЕНЯТЬ КУРС?"]} size={100} font={FONTS.heavy} weight={900} fill="#fff" stroke="#2a2340" strokeWidth={16} anchor="middle" />
    <Pill x={40} y={672} text="прежний курс" size={32} bg="#fff" />
    <Pill x={1000} y={672} text="вираж" size={32} bg={BRAND.yellow} />
    <AuthorTag x={640} y={186} dark anchor="middle" />
    <ChannelBadge x={40} y={60} scale={0.8} dark />
  </Frame>
);

// ── №5 Самый сильный: огромный красивый шар-показатель и ноль оплат ──
const DangerMetrics: React.FC = () => (
  <Frame bg="radial-gradient(circle at 68% 45%, #3a1f3d 0%, #24142a 60%, #140b18 100%)">
    <Glow x={820} y={330} r={280} color="#ff7eb0" opacity={0.35} />
    <g transform="translate(820 300)">
      <Balloon x={0} y={0} r={210} text="1 000 000" color="#ff7eb0" t={0.4} size={70} />
      <text x={0} y={70} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={34} fill={OL}>
        регистраций
      </text>
    </g>
    <g transform="translate(1110 560)">
      <rect x={-130} y={-80} width={260} height={160} rx={22} fill="#fff" stroke={OL} strokeWidth={6} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={96} fill="#d8433a">
        0
      </text>
      <text x={0} y={66} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={24} fill={OL}>
        платят
      </text>
    </g>
    <Gear x={560} y={600} r={50} rot={10} color="#f5b52e" />
    <Drop x={650} y={620} s={0.9} />
    <Capsule x={1100} y={150} w={300} h={84} text="иллюстрация" glow={0.2} size={32} />
    <Host x={250} y={820} scale={1} pose="shock" mood="shock" mouth={0.75} round={0.85} face={{ lookX: 0.8, eye: 1.32 }} />
    <Headline x={40} y={130} lines={["ОПАСНЫЕ", "МЕТРИКИ"]} size={104} font={FONTS.display} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#0b060d" strokeWidth={18} lineGap={1.05} />
    <Vignette strength={0.3} />
    <AuthorTag x={470} y={672} dark />
    <ChannelBadge x={980} y={672} scale={0.85} />
  </Frame>
);

export const LSR_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: EmptyStore, 3: StartWithTest, 4: TwoRoutes, 5: DangerMetrics },
};
