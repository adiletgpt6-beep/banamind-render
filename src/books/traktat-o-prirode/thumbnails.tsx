// Пять YouTube-обложек фильма «Трактат о природе» (канал BanaMind).
// Каждая — отдельная концепция: своя композиция, эмоция банана, шрифт и палитра.
// Все изображённые примеры (аптека, муха, солнце в каплях, сосна, дворец) — из книги;
// Аллах и пророки не изображаются.
import React from "react";
import { Drop, Fly, Flower, Jar, OL, Shard, Sun, Tree } from "../../lesson-traktat/visuals/draw";
import { FONTS } from "../../banamind/fonts";
import { BookCover, BRAND, ChannelBadge, Frame, Glow, Headline, Host, Pill, Rays, TH, TW, Vignette } from "../../thumbnails/kit";
import type { BookThumbnails } from "../../thumbnails/types";
import meta from "../../../books/traktat-o-prirode/thumbnails.json";

const TITLE = ["Трактат", "о природе"];
const SUB = "Рисале-и Нур";
const JAR_COLORS = ["#ff8fa3", "#7fd1ae", "#ffd166", "#9bb8ff", "#c79bff", "#ffad7a"];

// ── №1 Классическое: банан + книга на фоне природы ──
const Classic: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #6fc3ef 0%, #bfe7fb 55%, #e9f8ff 100%)">
    <Glow x={1120} y={90} r={180} color="#fff6c4" opacity={0.9} />
    <Sun x={1150} y={90} r={58} t={0} />
    <path d={`M 0 520 Q 320 430 640 500 T ${TW} 470 L ${TW} ${TH} L 0 ${TH} Z`} fill="#8fd47a" />
    <path d={`M 0 600 Q 380 540 760 600 T ${TW} 580 L ${TW} ${TH} L 0 ${TH} Z`} fill="#5fbf6a" />
    <Tree x={80} y={560} s={0.5} t={0} pine />
    {[[700, 690, "#ff8fa3", 0], [760, 700, "#c79bff", 1], [1040, 690, "#ffd166", 2], [1110, 705, "#ff7a6b", 0]].map(([x, y, c, k], i) => (
      <Flower key={i} x={x as number} y={y as number} color={c as string} s={0.75} t={0} kind={k as number} stem={80} />
    ))}
    <Host x={300} y={790} scale={0.98} pose="present" mood="happy" mouth={0.35} />
    <BookCover x={560} y={455} scale={0.7} rotate={-7} title={TITLE} subtitle={SUB} />
    <Headline x={700} y={250} lines={["ТРАКТАТ", "О ПРИРОДЕ"]} size={80} font={FONTS.display} fill="#fff" stroke="#163a2b" strokeWidth={16} lineGap={1.12} />
    <ChannelBadge x={706} y={412} scale={1.25} dark />
    <Tree x={1170} y={640} s={0.62} t={0} fruits={6} />
  </Frame>
);

// ── №2 Интрига: «Кто создал этот мир?» ──
const Stars: React.FC<{ n: number; seed: number }> = ({ n, seed }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = (i * 263 + seed * 97) % TW;
      const y = (i * 151 + seed * 31) % 460;
      return <circle key={i} cx={x} cy={y} r={1 + (i % 3)} fill="#fff" opacity={0.35 + (i % 4) * 0.15} />;
    })}
  </g>
);

const Intrigue: React.FC = () => (
  <Frame bg="radial-gradient(circle at 62% 38%, #1f5d7a 0%, #10304f 45%, #081428 100%)">
    <Stars n={70} seed={3} />
    <Glow x={760} y={230} r={230} color="#ffcf5a" opacity={0.45} />
    <Rays x={760} y={230} color="#ffe9a8" count={18} opacity={0.12} />
    <Sun x={760} y={230} r={78} t={0} />
    {/* капли и осколки, в каждом — отражение солнца */}
    {[[600, 430, 1.1], [700, 520, 0.9], [860, 470, 1.2], [930, 360, 0.8]].map(([x, y, s], i) =>
      i % 2 ? <Shard key={i} x={x} y={y} s={s * 1.4} rot={i * 30} glint={1.4} /> : <Drop key={i} x={x} y={y} s={s * 1.2} glint={1.4} />,
    )}
    <g opacity={0.95}>
      <Tree x={520} y={720} s={0.62} t={0} pine />
      <Flower x={660} y={720} color="#ff8fa3" s={0.9} t={0} stem={110} />
      <Flower x={740} y={720} color="#9bb8ff" s={0.75} t={0} kind={1} stem={90} />
    </g>
    <Fly x={470} y={330} s={0.85} t={0.4} />
    <Glow x={250} y={560} r={120} color="#ffd23f" opacity={0.35} />
    <BookCover x={250} y={565} scale={0.42} rotate={-10} title={TITLE} subtitle={SUB} color="#1d5c47" />
    <Host x={1085} y={810} scale={0.98} pose="pointUp" mood="wonder" mouth={0.55} round={0.7} face={{ lookX: -0.9, lookY: -0.8, eye: 1.3, brow: 0.9 }} />
    <Headline x={56} y={140} lines={["КТО СОЗДАЛ", "ЭТОТ МИР?"]} size={92} font={FONTS.heavy} weight={900} fill="#fff" colors={[undefined, BRAND.yellow]} stroke="#06101f" strokeWidth={14} lineGap={1.08} />
    <Vignette strength={0.5} />
    <ChannelBadge x={40} y={680} scale={0.85} />
  </Frame>
);

// ── №3 Профессор: банан-преподаватель в библиотеке ──
const SPINES = ["#7a2e2e", "#2e4f7a", "#2e6b4f", "#7a5c2e", "#4f2e6b", "#8a6a2c", "#3a3a3a", "#5a7a2e"];
const Shelves: React.FC = () => (
  <g>
    {[0, 1, 2].map((r) => (
      <g key={r}>
        {Array.from({ length: 40 }).map((_, i) => {
          const w = 18 + ((i * 7 + r * 5) % 4) * 6;
          const x = 10 + i * 34 + ((r * 13) % 20);
          const h = 120 + ((i * 11 + r * 3) % 5) * 12;
          return <rect key={i} x={x} y={40 + r * 190 + (150 - h)} width={w} height={h} rx={3} fill={SPINES[(i + r * 3) % SPINES.length]} opacity={0.9} />;
        })}
        <rect x={0} y={190 + r * 190} width={TW} height={18} fill="#4a2f17" />
      </g>
    ))}
  </g>
);

const Professor: React.FC = () => (
  <Frame bg="linear-gradient(180deg, #5b3a1e 0%, #3b2412 100%)">
    <Shelves />
    <rect x={0} y={0} width={TW} height={TH} fill="#2a1609" opacity={0.42} />
    <Glow x={880} y={330} r={260} color="#ffd98a" opacity={0.45} />
    <rect x={0} y={620} width={TW} height={100} fill="#6b4523" />
    {/* кафедра с книгой */}
    <path d="M 760 640 L 1000 640 L 960 720 L 800 720 Z" fill="#7a4e26" stroke="#2b1a0c" strokeWidth={5} />
    <rect x={850} y={560} width={60} height={90} fill="#7a4e26" stroke="#2b1a0c" strokeWidth={5} />
    <BookCover x={880} y={380} scale={0.82} rotate={5} title={TITLE} subtitle={SUB} color="#1f6f52" />
    <Host x={360} y={820} scale={1.02} pose="point" mood="happy" mouth={0.3} glasses bowtie face={{ smile: 0.65, brow: 0.25, lookX: 0.6 }} />
    {/* название — академическая плашка */}
    <g filter="url(#shadow)">
      <rect x={160} y={28} width={960} height={112} rx={18} fill="#163a2b" stroke="#e8c96a" strokeWidth={5} />
    </g>
    <text x={640} y={110} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={76} fill="#fff4d6" letterSpacing={2}>
      ТРАКТАТ О ПРИРОДЕ
    </text>
    <Pill x={1050} y={650} text="Простое объяснение" size={38} anchor="middle" bg={BRAND.yellow} />
    <ChannelBadge x={40} y={690} scale={0.75} />
  </Frame>
);

// ── №4 Противопоставление: случайность или замысел ──
const Contrast: React.FC = () => (
  <Frame bg="#1a1a1a">
    {/* слева — хаос */}
    <defs>
      <linearGradient id="chaos" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3a1518" />
        <stop offset="100%" stopColor="#14090b" />
      </linearGradient>
      <linearGradient id="order" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bfeaff" />
        <stop offset="60%" stopColor="#d9f5c9" />
        <stop offset="100%" stopColor="#8fd47a" />
      </linearGradient>
    </defs>
    <path d={`M 0 0 L 700 0 L 580 ${TH} L 0 ${TH} Z`} fill="url(#chaos)" />
    <path d={`M 700 0 L ${TW} 0 L ${TW} ${TH} L 580 ${TH} Z`} fill="url(#order)" />
    {Array.from({ length: 14 }).map((_, i) => (
      <path
        key={i}
        d={`M ${20 + ((i * 53) % 520)} ${200 + ((i * 97) % 480)} q ${60 - ((i * 31) % 120)} ${-80 + ((i * 17) % 160)} ${120 - ((i * 71) % 240)} ${((i * 29) % 140) - 70} t ${((i * 43) % 160) - 80} ${((i * 37) % 120) - 60}`}
        fill="none"
        stroke={JAR_COLORS[i % 6]}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.55}
      />
    ))}
    {[[120, 470, -70], [250, 560, 110], [80, 640, 160], [400, 640, -120], [330, 420, 40]].map(([x, y, r], i) => (
      <Jar key={i} x={x} y={y} color={JAR_COLORS[i]} s={0.9} tilt={r} level={0.4} />
    ))}
    {[[200, 330], [460, 520], [520, 300]].map(([x, y], i) => (
      <Shard key={i} x={x} y={y} s={1.1} rot={i * 50} glint={0} />
    ))}
    {/* справа — гармония */}
    <Sun x={1150} y={260} r={58} t={0} />
    <Tree x={1110} y={690} s={0.78} t={0} fruits={7} />
    {[[820, 700, "#ff8fa3", 0], [900, 700, "#c79bff", 1], [980, 700, "#ffd166", 2]].map(([x, y, c, k], i) => (
      <Flower key={i} x={x as number} y={y as number} color={c as string} s={0.8} t={0} kind={k as number} stem={100 + i * 20} />
    ))}
    <line x1={700} y1={0} x2={580} y2={TH} stroke="#fff" strokeWidth={6} opacity={0.85} />
    <Host x={640} y={830} scale={0.92} pose="think" mood="think" face={{ lookX: 0.2, lookY: -0.9 }} />
    <Headline x={40} y={118} lines={["СЛУЧАЙНОСТЬ"]} size={108} font={FONTS.condensed} weight={700} fill="#ffb3b3" stroke="#14090b" strokeWidth={12} />
    <Headline x={1244} y={300} lines={["ЗАМЫСЕЛ?"]} size={108} font={FONTS.condensed} weight={700} fill="#ffffff" stroke="#1f4a2a" strokeWidth={12} anchor="end" />
    <Pill x={1000} y={176} text="или" size={48} anchor="middle" bg={BRAND.yellow} font={FONTS.condensed} weight={700} />
    <ChannelBadge x={40} y={690} scale={0.75} dark />
  </Frame>
);

// ── №5 Самый сильный: «Само собой?» — крючок фильма с аптекой ──
const Strong: React.FC = () => (
  <Frame bg="radial-gradient(circle at 40% 55%, #19b5e6 0%, #0a74b3 55%, #06375e 100%)">
    <Rays x={430} y={470} color="#ffffff" count={20} opacity={0.1} />
    {/* баночки опрокидываются, вещества сливаются в одно «лекарство» */}
    {[[150, 300, -60], [300, 250, 75], [470, 300, -110], [120, 470, 140], [520, 450, 95], [330, 380, -30]].map(([x, y, r], i) => (
      <Jar key={i} x={x} y={y} color={JAR_COLORS[i]} s={1.05} tilt={r} level={0.6} />
    ))}
    {JAR_COLORS.map((c, i) => (
      <path key={i} d={`M ${130 + i * 80} ${330 + (i % 2) * 120} Q ${300 + i * 10} 470 ${460} ${500}`} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.85} />
    ))}
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${-40 + i * 60} ${180 + i * 120} q 90 -40 180 0 t 180 0`} stroke="#d6f3ff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.55} />
    ))}
    <Glow x={470} y={540} r={120} color="#fff4b0" opacity={0.85} />
    <g transform="translate(470 545) scale(1.15)" filter="url(#softShadow)">
      <path d="M -40 -110 L 40 -110 L 40 -80 Q 70 -60 70 -20 L 70 60 Q 70 80 50 80 L -50 80 Q -70 80 -70 60 L -70 -20 Q -70 -60 -40 -80 Z" fill="#e6f6ff" stroke={OL} strokeWidth={5} />
      <rect x={-46} y={-140} width={92} height={32} rx={8} fill="#ff7a6b" stroke={OL} strokeWidth={4} />
      <path d="M -12 -10 L 12 -10 L 12 10 L 32 10 L 32 34 L 12 34 L 12 54 L -12 54 L -12 34 L -32 34 L -32 10 L -12 10 Z" fill="#e5484d" />
    </g>
    <Host x={1010} y={940} scale={1.32} pose="open" mood="shock" mouth={1} round={1} face={{ lookX: -0.9, lookY: 0.15, smile: -1, brow: 1, tilt: 0.85, eye: 1.36, cheek: 0.2 }} />
    <Headline x={1210} y={300} lines={["?!"]} size={120} font={FONTS.display} fill="#ff6b5b" stroke="#062a47" strokeWidth={14} rotate={12} anchor="middle" />
    <path d="M 1150 330 Q 1166 300 1176 330 Q 1180 350 1163 352 Q 1146 350 1150 330 Z" fill="#bfe9ff" stroke="#062a47" strokeWidth={4} />
    <Headline x={44} y={150} lines={["САМО", "СОБОЙ?"]} size={150} font={FONTS.display} fill={BRAND.yellow} colors={["#ffffff", BRAND.yellow]} stroke="#062a47" strokeWidth={20} lineGap={0.98} rotate={-3} />
    <Pill x={56} y={670} text="Трактат о природе" size={36} bg="#ffffff" />
    <ChannelBadge x={900} y={60} scale={0.8} dark />
  </Frame>
);

// Тексты, концепции и рекомендация — в books/traktat-o-prirode/thumbnails.json
// (их же читает проверка орфографии и отчёт); здесь только рисунки.
export const TRAKTAT_THUMBNAILS: BookThumbnails = {
  ...(meta as Omit<BookThumbnails, "components">),
  components: { 1: Classic, 2: Intrigue, 3: Professor, 4: Contrast, 5: Strong },
};
