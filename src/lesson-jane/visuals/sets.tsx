// Места романа как плоские декорации (1920×1080): каждая — свой цвет и свет,
// всегда светлая и читаемая. Персонажи и подписи ставит сцена (stage.tsx).
import React from "react";
import { C } from "../theme";
import { OL, Tree } from "./draw";
import { Candle, Chestnut, Door, Hall, Moor, Signpost, Window } from "./scenery";

type SetProps = { t: number; p: Record<string, unknown> };

const Floor: React.FC<{ y?: number; color: string; boards?: boolean }> = ({ y = 860, color, boards = true }) => (
  <g>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={color} />
    <line x1={0} y1={y} x2={1920} y2={y} stroke={OL} strokeWidth={5} />
    {boards && Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 180 - 60} y1={y} x2={i * 200 - 300} y2={1080} stroke={OL} strokeWidth={2} opacity={0.18} />)}
  </g>
);

const Wall: React.FC<{ color: string; trim?: string; y?: number }> = ({ color, trim = "#ffffff", y = 860 }) => (
  <g>
    <rect x={0} y={0} width={1920} height={y} fill={color} />
    <rect x={0} y={y - 110} width={1920} height={14} fill={trim} opacity={0.6} />
  </g>
);

const Fireplace: React.FC<{ x: number; y: number; t: number; s?: number }> = ({ x, y, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-300} width={380} height={300} fill="#e8dcc8" stroke={OL} strokeWidth={5} />
    <rect x={-220} y={-330} width={440} height={40} rx={8} fill="#d6c6aa" stroke={OL} strokeWidth={5} />
    <rect x={-120} y={-200} width={240} height={200} rx={20} fill="#4a3a36" stroke={OL} strokeWidth={4} />
    {[0, 1, 2].map((i) => {
      const h = 90 + Math.sin(t * 7 + i * 2) * 18;
      return <path key={i} d={`M ${-60 + i * 60} -10 Q ${-90 + i * 60} ${-h * 0.6} ${-60 + i * 60} ${-h} Q ${-30 + i * 60} ${-h * 0.6} ${-60 + i * 60} -10 Z`} fill={i === 1 ? C.yellow : C.gold} stroke={OL} strokeWidth={3} />;
    })}
    <circle cx={0} cy={-100} r={160} fill={C.yellow} opacity={0.12 + 0.04 * Math.sin(t * 5)} />
  </g>
);

const Bookcase: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 360 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-560} width={w} height={560} fill="#8a5c38" stroke={OL} strokeWidth={5} />
    {[0, 1, 2, 3].map((r) => (
      <g key={r}>
        <rect x={-w / 2 + 14} y={-540 + r * 135} width={w - 28} height={118} fill="#6b4428" />
        {Array.from({ length: Math.floor((w - 40) / 30) }).map((_, i) => (
          <rect key={i} x={-w / 2 + 20 + i * 30} y={-530 + r * 135 + ((i * 7) % 20)} width={24} height={108 - ((i * 7) % 20)} rx={3} fill={["#c94a4a", "#4f8a8a", "#e3a93a", "#6a5a8a", "#7a9a5a"][(i + r) % 5]} stroke={OL} strokeWidth={2} />
        ))}
      </g>
    ))}
  </g>
);

export const SETS: Record<string, React.FC<SetProps>> = {
  // мастерская ведущего: светлая стена, стол, карта, лампа
  studio: ({ t }) => (
    <g>
      <Wall color="#fbf1df" />
      <Floor color="#e9d2ae" />
      <Window x={1600} y={380} w={300} h={380} t={t} sky="#bfe0f4" curtain={C.gold} />
      <Bookcase x={300} y={860} w={340} />
    </g>
  ),
  // Гейтсхед: гостиная, камин, оконная ниша со шторой
  gateshead: ({ t }) => (
    <g>
      <Wall color="#f8e3d8" trim="#c94a4a" />
      <Floor color="#d9b48c" />
      <Window x={1560} y={420} w={340} h={420} t={t} sky="#c7d6e6" rain={0.6} hills="#9fb59a" curtain={C.red} />
      <Fireplace x={520} y={860} t={t} />
      {[200, 860, 1180].map((x) => (
        <rect key={x} x={x} y={180} width={160} height={200} rx={10} fill="#f1d8c8" stroke={OL} strokeWidth={4} />
      ))}
    </g>
  ),
  // красная комната: кровать под красным пологом, кресло, зеркало, запертая дверь
  redRoom: ({ t, p }) => {
    const dark = Number(p.dim ?? 0);
    return (
      <g>
        <Wall color="#f3c9c4" trim="#cf3f4b" />
        <Floor color="#c98f7a" />
        <g transform="translate(1320 860)">
          <rect x={-320} y={-520} width={640} height={60} rx={10} fill="#a8303c" stroke={OL} strokeWidth={5} />
          <path d="M -320 -460 Q -360 -200 -300 -120 L -250 -120 Q -280 -300 -250 -460 Z" fill={C.red} stroke={OL} strokeWidth={4} />
          <path d="M 320 -460 Q 360 -200 300 -120 L 250 -120 Q 280 -300 250 -460 Z" fill={C.red} stroke={OL} strokeWidth={4} />
          <rect x={-260} y={-200} width={520} height={200} rx={20} fill="#f4e6e0" stroke={OL} strokeWidth={5} />
          <rect x={-280} y={-120} width={560} height={120} rx={14} fill={C.red} stroke={OL} strokeWidth={5} />
          {[-300, 290].map((px) => <rect key={px} x={px} y={-520} width={14} height={520} fill="#7a3b2a" stroke={OL} strokeWidth={3} />)}
        </g>
        <g transform="translate(780 860)">
          <rect x={-70} y={-260} width={140} height={160} rx={12} fill="#ffffff" stroke={OL} strokeWidth={5} />
          <rect x={-90} y={-110} width={180} height={50} rx={10} fill="#ffffff" stroke={OL} strokeWidth={5} />
          <path d="M -80 -60 L -80 0 M 80 -60 L 80 0" stroke={OL} strokeWidth={8} />
        </g>
        <g transform="translate(330 470)">
          <ellipse rx={110} ry={150} fill="#d8e4ec" stroke="#b9821c" strokeWidth={14} />
          <ellipse rx={92} ry={132} fill="none" stroke={OL} strokeWidth={4} />
          <ellipse cx={-30} cy={-40} rx={18} ry={50} fill="#ffffff" opacity={0.6} transform="rotate(20)" />
        </g>
        <Door x={110} y={860} s={0.9} locked={Boolean(p.locked)} color="#8a3a3a" />
        <rect x={0} y={0} width={1920} height={1080} fill="#7a1f2a" opacity={0.12 * dark + 0.04 * Math.sin(t * 2) * dark} />
      </g>
    );
  },
  // Ловуд: длинная классная, высокие окна, скамьи
  lowood: ({ t }) => (
    <g>
      <Wall color="#e4ebf3" trim="#5f7fa6" />
      <Floor color="#b9c3cf" />
      {[260, 760, 1260, 1720].map((x) => (
        <Window key={x} x={x} y={330} w={220} h={330} t={t} sky="#dfe9f2" hills="#b7c6b4" curtain="" rain={0.2} />
      ))}
      {[0, 1].map((r) => (
        <rect key={r} x={120 + r * 40} y={760 + r * 70} width={1680 - r * 80} height={30} rx={8} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
      ))}
    </g>
  ),
  // Ловуд весной: сад, ограда, холмы, туман
  lowoodGarden: ({ t }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#e8f1f6" />
      <path d="M 0 560 Q 500 420 1000 520 Q 1500 620 1920 480 L 1920 1080 L 0 1080 Z" fill="#bcd6b4" stroke={OL} strokeWidth={4} />
      <path d="M 0 700 Q 600 640 1200 700 Q 1600 740 1920 690 L 1920 1080 L 0 1080 Z" fill="#a6c99c" stroke={OL} strokeWidth={4} />
      {[180, 520, 1500, 1780].map((x, i) => <Tree key={x} x={x} y={760 + (i % 2) * 30} s={0.9} t={t} color={i % 2 ? "#8cc28a" : "#a5d39a"} />)}
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={60 + i * 140} y={820} width={16} height={120} fill="#8a6a4a" stroke={OL} strokeWidth={3} />
      ))}
      <rect x={40} y={850} width={1860} height={14} fill="#8a6a4a" stroke={OL} strokeWidth={3} />
      <rect x={0} y={0} width={1920} height={1080} fill="#ffffff" opacity={0.12 + 0.05 * Math.sin(t * 0.6)} />
    </g>
  ),
  // спальня: кровать с пологом; fire 0…1 — горящий полог; veil — разорванная фата
  bedroom: ({ t, p }) => {
    const fire = Number(p.fire ?? 0);
    return (
      <g>
        <Wall color="#f4e8dc" trim="#b9821c" />
        <Floor color="#c49a72" />
        <Window x={300} y={400} w={260} h={360} t={t} sky="#c9d8ec" moon curtain="#8a6a9a" />
        <g transform="translate(1400 860)">
          <rect x={-300} y={-540} width={600} height={50} rx={10} fill="#8a5c38" stroke={OL} strokeWidth={5} />
          <path d="M -300 -490 Q -340 -260 -280 -130 L -230 -130 Q -260 -300 -230 -490 Z" fill="#c9a0b8" stroke={OL} strokeWidth={4} />
          <path d="M 300 -490 Q 340 -260 280 -130 L 230 -130 Q 260 -300 230 -490 Z" fill="#c9a0b8" stroke={OL} strokeWidth={4} />
          <rect x={-260} y={-200} width={520} height={200} rx={20} fill="#fbf5e8" stroke={OL} strokeWidth={5} />
          <rect x={-280} y={-110} width={560} height={110} rx={14} fill="#9a7ab8" stroke={OL} strokeWidth={5} />
          {fire > 0.02 && <circle cx={0} cy={-300} r={380} fill="#ffb347" opacity={0.2 * fire} />}
          {fire > 0.02 &&
            [-270, -150, 150, 270, -40, 60].map((x, i) => {
              const h = (110 + Math.sin(t * 8 + i * 1.7) * 30) * fire;
              const y0 = i > 3 ? -480 : i % 2 ? -300 : -200;
              return <path key={i} d={`M ${x - 34} ${y0} Q ${x - 40} ${y0 - h * 0.6} ${x} ${y0 - h} Q ${x + 40} ${y0 - h * 0.6} ${x + 34} ${y0} Z`} fill={i % 2 ? C.yellow : "#ff8f3a"} stroke={OL} strokeWidth={3} />;
            })}
        </g>
        {Boolean(p.veil) && (
          <g transform="translate(1120 640)">
            <path d="M -110 -140 Q -40 -170 30 -140 L 70 60 L 20 30 L -10 80 L -50 20 L -90 70 L -130 40 Z" fill="#ffffff" stroke={OL} strokeWidth={4} />
            <path d="M -20 -150 L 0 -20 L -40 40" stroke={OL} strokeWidth={4} fill="none" />
          </g>
        )}
      </g>
    );
  },
  // Тернфилд снаружи: дом-замок, деревья, тропа
  thornfield: ({ t, p }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#f3e6cc" />
      <path d="M 0 700 Q 600 640 1100 690 Q 1500 730 1920 660 L 1920 1080 L 0 1080 Z" fill="#b9cf9a" stroke={OL} strokeWidth={4} />
      <Hall x={1100} y={720} s={0.95} t={t} burnt={Number(p.burnt ?? 0)} lit={p.night ? 1 : 0.4} />
      <Tree x={260} y={760} s={1.1} t={t} />
      <Tree x={1780} y={780} s={0.9} t={t} color="#7fb37a" />
    </g>
  ),
  // Тернфилд внутри: библиотека/гостиная с камином и свечами
  library: ({ t }) => (
    <g>
      <Wall color="#f6e4c8" trim="#b9821c" />
      <Floor color="#c9935f" />
      <Bookcase x={250} y={860} w={360} />
      <Bookcase x={1680} y={860} w={360} />
      <Fireplace x={960} y={860} t={t} s={0.95} />
      <Candle x={760} y={510} s={0.55} t={t} />
      <Candle x={1160} y={510} s={0.55} t={t + 1} />
    </g>
  ),
  // коридор третьего этажа: ряд закрытых дверей, свеча
  corridor: ({ t, p }) => (
    <g>
      <Wall color="#ecdcc6" trim="#8a6a4a" />
      <Floor color="#b48a62" />
      {[360, 760, 1160, 1560].map((x, i) => (
        <Door key={x} x={x} y={860} s={0.9} color={i === Number(p.focus ?? -1) ? "#5a3a2a" : "#8a5c38"} locked={i === Number(p.focus ?? -1) && Boolean(p.locked)} />
      ))}
      <Candle x={960} y={440} s={0.5} t={t} />
    </g>
  ),
  // крыша Тернфилда: зубцы, далёкий горизонт
  roof: ({ t }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#d9ecf8" />
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse key={i} cx={((i * 430 + t * 18) % 2300) - 200} cy={160 + (i % 3) * 70} rx={130} ry={40} fill="#ffffff" opacity={0.85} />
      ))}
      <path d="M 0 620 Q 400 540 800 600 Q 1300 660 1920 560 L 1920 1080 L 0 1080 Z" fill="#a9c79a" stroke={OL} strokeWidth={4} />
      <path d="M 0 700 Q 700 660 1920 720 L 1920 1080 L 0 1080 Z" fill="#94b98a" stroke={OL} strokeWidth={4} />
      <rect x={0} y={860} width={1920} height={220} fill="#b9ad9a" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 17 }).map((_, i) => (
        <rect key={i} x={i * 120} y={800} width={70} height={70} fill="#b9ad9a" stroke={OL} strokeWidth={5} />
      ))}
    </g>
  ),
  // зимняя дорога: лунный вечер, лёд, перелаз
  road: ({ t }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#dce8f4" />
      <circle cx={1580} cy={200} r={80} fill="#fff8d8" stroke={OL} strokeWidth={4} />
      <path d="M 0 640 Q 500 560 1000 620 Q 1500 680 1920 600 L 1920 1080 L 0 1080 Z" fill="#eef4f8" stroke={OL} strokeWidth={4} />
      <path d="M 700 1080 Q 900 800 980 640 L 1060 640 Q 1100 820 1420 1080 Z" fill="#c9d8e6" stroke={OL} strokeWidth={4} />
      <path d="M 880 960 Q 960 900 1060 950" stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.8} />
      {[260, 1700].map((x) => <Tree key={x} x={x} y={720} s={0.9} t={t} color="#e8f0f6" />)}
      <g transform="translate(560 760)">
        {[0, 1, 2].map((i) => <rect key={i} x={-100} y={-120 + i * 40} width={200} height={16} rx={6} fill="#8a6a4a" stroke={OL} strokeWidth={3} />)}
        {[-90, 90].map((x) => <rect key={x} x={x - 8} y={-140} width={16} height={140} fill="#8a6a4a" stroke={OL} strokeWidth={3} />)}
      </g>
    </g>
  ),
  // гостиная с гостями: люстра, фортепиано
  salon: ({ t }) => (
    <g>
      <Wall color="#fbecd8" trim="#d4a24a" />
      <Floor color="#c99a6a" />
      <g transform={`translate(960 40) rotate(${Math.sin(t * 0.8) * 1.2})`}>
        <line x1={0} y1={0} x2={0} y2={90} stroke={OL} strokeWidth={4} />
        <path d="M -200 110 Q 0 190 200 110" fill="none" stroke="#c9a24a" strokeWidth={10} />
        {[-180, -90, 0, 90, 180].map((x) => (
          <g key={x}>
            <circle cx={x} cy={110 + (x === 0 ? 50 : Math.abs(x) < 100 ? 34 : 0)} r={14} fill={C.yellow} stroke={OL} strokeWidth={3} />
          </g>
        ))}
      </g>
      <g transform="translate(1520 860)">
        <path d="M -260 -330 L 200 -330 Q 300 -330 300 -230 L 300 -150 L -260 -150 Z" fill="#2a2a34" stroke={OL} strokeWidth={5} />
        <rect x={-260} y={-170} width={560} height={40} fill="#ffffff" stroke={OL} strokeWidth={4} />
        {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={-250 + i * 38} y={-170} width={14} height={24} fill="#2a2a34" />)}
        {[-240, 260].map((x) => <rect key={x} x={x} y={-130} width={20} height={130} fill="#2a2a34" stroke={OL} strokeWidth={3} />)}
      </g>
      {[200, 760, 1180].map((x) => (
        <rect key={x} x={x} y={170} width={180} height={230} rx={10} fill="#f6dcb8" stroke={OL} strokeWidth={4} />
      ))}
    </g>
  ),
  // сад: каштан, дорожка, вечер
  orchard: ({ t, p }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={p.storm ? "#dfe3ee" : "#fdf0d8"} />
      <circle cx={1650} cy={190} r={70} fill={p.storm ? "#e8ecf4" : "#ffe7a8"} stroke={OL} strokeWidth={4} />
      <path d="M 0 700 Q 600 620 1200 690 Q 1600 730 1920 660 L 1920 1080 L 0 1080 Z" fill="#a9cf8e" stroke={OL} strokeWidth={4} />
      <path d="M 600 1080 Q 820 860 900 700 L 1000 700 Q 1060 880 1320 1080 Z" fill="#efd9b0" stroke={OL} strokeWidth={4} />
      <Chestnut x={1460} y={760} s={1.05} t={t} split={Number(p.split ?? 0)} />
      <Tree x={240} y={780} s={0.95} t={t} color="#8cc28a" />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={(i * 211) % 1900} cy={180 + ((i * 97) % 300) + Math.sin(t + i) * 10} r={5} fill={C.yellow} opacity={p.storm ? 0 : 0.8} />
      ))}
    </g>
  ),
  // церковь: арки, алтарь, скамьи
  church: ({ t }) => (
    <g>
      <Wall color="#f2ece2" trim="#a39b8c" />
      <Floor color="#c8bba6" boards={false} />
      {[360, 960, 1560].map((x) => (
        <g key={x}>
          <path d={`M ${x - 140} 860 L ${x - 140} 360 Q ${x} 160 ${x + 140} 360 L ${x + 140} 860`} fill="#e6dccc" stroke={OL} strokeWidth={5} />
          <path d={`M ${x - 70} 560 L ${x - 70} 400 Q ${x} 310 ${x + 70} 400 L ${x + 70} 560 Z`} fill="#bfe0f4" stroke={OL} strokeWidth={4} opacity={0.9} />
        </g>
      ))}
      <rect x={860} y={700} width={200} height={160} fill="#efe2c6" stroke={OL} strokeWidth={5} />
      <Candle x={890} y={700} s={0.4} t={t} />
      <Candle x={1030} y={700} s={0.4} t={t + 2} />
    </g>
  ),
  // пустошь: вересковые холмы, указатель, дождь по желанию
  moor: ({ t, p }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill={p.rain ? "#e3e2ee" : "#f1eef8"} />
      {Array.from({ length: 4 }).map((_, i) => (
        <ellipse key={i} cx={((i * 560 + t * 22) % 2400) - 240} cy={150 + i * 40} rx={220} ry={60} fill={p.rain ? "#c9c6d8" : "#ffffff"} opacity={0.9} />
      ))}
      <Moor t={t} />
      {Boolean(p.sign) && <Signpost x={1500} y={880} s={0.9} arms={["?", "?"]} />}
      {Boolean(p.rain) &&
        Array.from({ length: 70 }).map((_, i) => {
          const px = (i * 61) % 1960;
          const py = ((t * 520 + i * 131) % 1180) - 60;
          return <line key={i} x1={px} y1={py} x2={px - 14} y2={py + 40} stroke="#8a86a8" strokeWidth={3} opacity={0.55} strokeLinecap="round" />;
        })}
      {Boolean(p.light) && (
        <g transform="translate(1640 600)">
          <circle r={90 + Math.sin(t * 2) * 8} fill={C.yellow} opacity={0.3} />
          <circle r={18} fill={C.yellow} stroke={OL} strokeWidth={3} />
        </g>
      )}
    </g>
  ),
  // Мур-Хаус: кухня-гостиная с огнём, книги, тепло
  moorHouse: ({ t }) => (
    <g>
      <Wall color="#eef4e4" trim="#5f9a6a" />
      <Floor color="#c8b48c" />
      <Fireplace x={1500} y={860} t={t} s={0.95} />
      <Window x={420} y={400} w={300} h={360} t={t} sky="#d8d2ea" hills="#a77fc9" curtain="#5f9a6a" />
      <rect x={760} y={700} width={420} height={30} rx={8} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
      {[0, 1, 2].map((i) => <rect key={i} x={800 + i * 70} y={650 - i * 6} width={56} height={52 + i * 6} rx={4} fill={["#6a5a8a", "#c94a4a", "#4f8a8a"][i]} stroke={OL} strokeWidth={3} />)}
    </g>
  ),
  // сельская школа в Мортоне
  school: ({ t }) => (
    <g>
      <Wall color="#f6f0e0" trim="#8a9a6a" />
      <Floor color="#c9b38c" />
      <rect x={640} y={190} width={640} height={340} rx={10} fill="#3e5a48" stroke="#8a6a4a" strokeWidth={14} />
      <text x={960} y={340} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={64} fill="#f4f4ee" textAnchor="middle" opacity={0.9}>
        А Б В
      </text>
      <Window x={250} y={380} w={260} h={330} t={t} sky="#d8ecf8" curtain="" />
      <Window x={1670} y={380} w={260} h={330} t={t} sky="#d8ecf8" curtain="" />
    </g>
  ),
  // кабинет Сент-Джона: холодный свет, карта, книга
  study: ({ t }) => (
    <g>
      <Wall color="#e6eff6" trim="#6aa9d8" />
      <Floor color="#b7c2cc" />
      <g transform="translate(1440 420)">
        <rect x={-300} y={-220} width={600} height={420} rx={12} fill="#f6f1e2" stroke={OL} strokeWidth={5} />
        <path d="M -200 -120 Q -60 -180 40 -120 Q 140 -60 80 40 Q 20 140 -40 180 Q -80 90 -150 40 Q -230 -20 -200 -120 Z" fill="#d6e8c8" stroke={OL} strokeWidth={4} />
        <circle cx={-20} cy={0} r={12} fill={C.red} stroke={OL} strokeWidth={3} />
      </g>
      <Window x={330} y={400} w={280} h={360} t={t} sky="#cfe2f0" hills="#c8d6e0" curtain="#6aa9d8" />
      {Array.from({ length: 16 }).map((_, i) => {
        const px = (i * 131 + t * 30) % 1920;
        const py = (i * 67 + t * 60) % 860;
        return <circle key={i} cx={px} cy={py} r={4} fill="#ffffff" opacity={0.7} />;
      })}
    </g>
  ),
  // Ферндин: дом в лесу, мягкий свет
  ferndean: ({ t }) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#eef3e2" />
      {Array.from({ length: 9 }).map((_, i) => <Tree key={i} x={60 + i * 230} y={700 + (i % 2) * 40} s={0.95 + (i % 3) * 0.1} t={t} color={["#7fb37a", "#6fa86a", "#8cc28a"][i % 3]} />)}
      <path d="M 0 760 Q 900 720 1920 770 L 1920 1080 L 0 1080 Z" fill="#b5cf98" stroke={OL} strokeWidth={4} />
      <g transform="translate(960 800)">
        <rect x={-260} y={-260} width={520} height={260} fill="#d8c3a0" stroke={OL} strokeWidth={5} />
        <path d="M -300 -260 L 0 -420 L 300 -260 Z" fill="#8a6a4a" stroke={OL} strokeWidth={5} />
        <rect x={-50} y={-150} width={100} height={150} rx={40} fill="#6b4a3a" stroke={OL} strokeWidth={4} />
        {[-170, 170].map((x) => <rect key={x} x={x - 40} y={-200} width={80} height={80} rx={6} fill={C.yellow} opacity={0.7} stroke={OL} strokeWidth={3} />)}
      </g>
    </g>
  ),
};
