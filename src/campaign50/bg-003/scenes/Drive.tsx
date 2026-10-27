// Сцена 2: таймлапс обеденного часа. Мама выходит из кеңсе, садится в свою
// (семейную, серебристую, без надписей) машину → мектеп: сын выбегает из
// ворот и садится назад → үй (панельный дом, у подъезда встречает бабушка)
// → обратно в кеңсе, мама бегом заходит в дверь. Солнце и облака бегут
// быстрее обычного (таймлапс), шкала обеда наверху съедается (LunchBar).
// Время в пути — условный пример (в шкале «Шарттуу мисал»).
import { fontFamily } from "../../../fonts";
import { clamp01, easeInOut, FamilyCar, Figure, lerp, LOOKS, Mountains, NAVY, PanelHouse, Poplar, prog, YELLOW } from "../art";
import type { Bg3Beats } from "../beats";
import { BG3_TEXT } from "../script";

const WORLD_W = 3400;
const SIDEWALK = 1226; // линия ступней пешеходов
const CAR_Y = 1186; // верх локальной системы машины
const S = 0.42; // масштаб фигур
const CAR_A = 560;
const CAR_B = 1560;
const CAR_C = 2760;
const OFFICE_DOOR = 420;
const GATE = 1790;
const HOME_DOOR = 3020;

const Sign: React.FC<{ readonly x: number; readonly y: number; readonly text: string; readonly color?: string }> = ({ x, y, text, color = NAVY }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-text.length * 15 - 26} y={-38} width={text.length * 30 + 52} height={68} rx={22} fill="#FFFFFF" stroke={color} strokeWidth={5} />
    <text x={0} y={12} textAnchor="middle" fontSize={40} fontWeight={1000} fill={color} fontFamily={fontFamily}>
      {text}
    </text>
  </g>
);

const Office: React.FC<{ readonly door: number }> = ({ door }) => (
  <g>
    <rect x={190} y={640} width={460} height={560} fill="#CFE0F3" stroke="#9FB6D3" strokeWidth={5} />
    {Array.from({ length: 6 }, (_, f) =>
      Array.from({ length: 5 }, (_, c) => <rect key={`${f}-${c}`} x={214 + c * 86} y={662 + f * 80} width={66} height={58} rx={4} fill={(f + c) % 4 === 0 ? "#E9F3FF" : "#9EC0E6"} />),
    )}
    <rect x={180} y={622} width={480} height={22} fill="#9FB6D3" />
    {/* дверь */}
    <rect x={OFFICE_DOOR - 56} y={1010} width={112} height={190} fill="#5A7398" />
    <rect x={OFFICE_DOOR - 50} y={1016} width={100 * (1 - door * 0.8)} height={184} fill="#BFD7F0" stroke="#5A7398" strokeWidth={3} />
    <Sign x={OFFICE_DOOR} y={970} text={BG3_TEXT.places.office} />
  </g>
);

const School: React.FC<{ readonly t: number }> = ({ t }) => (
  <g>
    <rect x={1440} y={820} width={640} height={380} fill="#F6E7C8" stroke="#D8C39A" strokeWidth={5} />
    <path d="M 1420 822 L 1760 700 L 2100 822 Z" fill="#E7A86B" />
    {Array.from({ length: 3 }, (_, f) =>
      Array.from({ length: 6 }, (_, c) => (c === 2 || c === 3) && f === 2 ? null : <rect key={`${f}-${c}`} x={1470 + c * 102} y={850 + f * 110} width={70} height={70} rx={6} fill="#A9C7EA" stroke="#FFFFFF" strokeWidth={5} />),
    )}
    {/* часы на фасаде: время бежит быстро */}
    <circle cx={1760} cy={772} r={34} fill="#FFFFFF" stroke={NAVY} strokeWidth={5} />
    <rect x={1757} y={746} width={6} height={28} rx={3} fill={NAVY} transform={`rotate(${t * 140} 1760 772)`} />
    <rect x={1700} y={1060} width={120} height={140} fill="#7A5A44" />
    {/* ограда и ворота */}
    {Array.from({ length: 16 }, (_, i) => (i >= 7 && i <= 8 ? null : <rect key={i} x={1410 + i * 44} y={1120} width={8} height={90} fill="#4E6A91" />))}
    <rect x={1400} y={1126} width={300} height={8} fill="#4E6A91" />
    <rect x={1820} y={1126} width={280} height={8} fill="#4E6A91" />
    <Sign x={1760} y={930} text={BG3_TEXT.places.school} />
  </g>
);

const Home: React.FC = () => (
  <g>
    <PanelHouse x={2780} y={1200} w={480} floors={9} color="#EDE7F5" />
    <rect x={HOME_DOOR - 50} y={1040} width={100} height={160} fill="#6F5A7E" />
    <rect x={HOME_DOOR - 70} y={1024} width={140} height={20} fill="#C9BEDA" />
    {/* скамейка у подъезда */}
    <rect x={2830} y={1160} width={110} height={12} rx={4} fill="#9A7458" />
    <rect x={2838} y={1172} width={8} height={30} fill="#6B5240" />
    <rect x={2924} y={1172} width={8} height={30} fill="#6B5240" />
    <Sign x={HOME_DOOR} y={990} text={BG3_TEXT.places.home} />
  </g>
);

export const Drive: React.FC<{ readonly t: number; readonly b: Bg3Beats }> = ({ t, b }) => {
  const d = b.drive;
  const fadeIn = prog(t, d.from - 0.35, 0.35);
  // машина
  const leg = (from: number, to: number, a: number, c: number) => lerp(a, c, easeInOut(prog(t, from, to - from)));
  const carX = t < d.go2 ? leg(d.go1, d.atSchool, CAR_A, CAR_B) : t < d.go3 ? leg(d.go2, d.atHome, CAR_B, CAR_C) : leg(d.go3, d.atOffice, CAR_C, CAR_A);
  const back = t >= d.go3; // обратный путь — машина смотрит влево
  const moving = (t > d.go1 && t < d.atSchool) || (t > d.go2 && t < d.atHome) || (t > d.go3 && t < d.atOffice);
  const wheel = (carX / (2 * Math.PI * 30)) * 360 * (back ? -1 : 1);
  const bounce = moving ? Math.sin(t * 26) * 1.6 : 0;
  const cam = Math.max(0, Math.min(WORLD_W - 1080, carX + 210 - 540));
  // параллакс фона
  const far = -cam * 0.22;
  const mid = -cam * 0.5;
  // мама: выход из кеңсе → к машине; вечером — бегом от машины в дверь
  const momOut = t >= d.exit && t < d.inCar + 0.15;
  const momBack = t >= d.atOffice + 0.05 && t < d.over + 0.6;
  const momX = momOut ? lerp(OFFICE_DOOR, CAR_A + 250, easeInOut(prog(t, d.exit, d.inCar - d.exit))) : lerp(CAR_A + 250, OFFICE_DOOR, easeInOut(prog(t, d.atOffice + 0.05, d.over - d.atOffice - 0.05)));
  const momAlpha = momOut ? 1 - prog(t, d.inCar, 0.15) : momBack ? Math.min(prog(t, d.atOffice + 0.05, 0.12), 1 - prog(t, d.over + 0.2, 0.3)) : 0;
  const officeDoor = Math.max(1 - Math.abs(t - d.exit) / 0.35, 1 - Math.abs(t - (d.over + 0.15)) / 0.35, 0);
  const momInCar = t >= d.inCar && t < d.atOffice + 0.05;
  // сын: у ворот → машет → бежит к задней двери; дома — к бабушке
  const kidSchool = t < d.kidIn;
  const kidHome = t >= d.atHome + 0.2;
  const kidX = kidSchool
    ? lerp(GATE, CAR_B + 130, easeInOut(prog(t, d.atSchool + 0.35, d.kidIn - d.atSchool - 0.5)))
    : lerp(CAR_C + 130, HOME_DOOR - 60, easeInOut(prog(t, d.atHome + 0.25, d.kidOut - d.atHome - 0.25)));
  const kidAlpha = kidSchool ? 1 - prog(t, d.kidIn - 0.15, 0.15) : kidHome ? prog(t, d.atHome + 0.2, 0.15) : 0;
  const kidInCar = t >= d.kidIn && t < d.atHome + 0.25;
  const rearDoor = Math.max(1 - Math.abs(t - d.kidIn + 0.1) / 0.4, 1 - Math.abs(t - d.atHome - 0.25) / 0.4, 0);
  const kidWave = kidSchool && t > d.atSchool - 0.2 && t < d.atSchool + 0.4;
  const grannyWave = t > d.atHome && t < d.kidOut;
  const walkPh = (x: number, k = 24) => x / k;
  // солнце и облака (таймлапс)
  const u = prog(t, d.from, d.to - d.from);
  const sunX = lerp(160, 940, u);
  const sunY = 620 - Math.sin(u * Math.PI) * 90;
  const speed = back && moving ? clamp01(Math.sin(prog(t, d.go3, d.atOffice - d.go3) * Math.PI) * 1.4) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bg3-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#CFE4FA" />
            <stop offset="1" stopColor="#F4F9FF" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1080} height={1240} fill="url(#bg3-sky)" />
        <circle cx={sunX} cy={sunY} r={64} fill="#FFE07A" />
        <circle cx={sunX} cy={sunY} r={92} fill="#FFE07A" opacity={0.25} />
        {[0, 1, 2].map((i) => {
          const cx = ((i * 430 + t * 260) % 1500) - 200;
          return (
            <g key={i} transform={`translate(${cx} ${560 + i * 70})`} opacity={0.9}>
              <ellipse cx={0} cy={0} rx={90} ry={34} fill="#FFFFFF" />
              <ellipse cx={50} cy={-18} rx={60} ry={34} fill="#FFFFFF" />
            </g>
          );
        })}
        <g transform={`translate(${far} 0)`}>
          <Mountains w={2200} y={1010} x={120} />
        </g>
        <g transform={`translate(${mid} 0)`} opacity={0.75}>
          {Array.from({ length: 9 }, (_, i) => (
            <PanelHouse key={i} x={i * 330 - 60} y={1205} w={240} floors={6 + (i % 3)} color="#DEE6F1" />
          ))}
        </g>
        <g transform={`translate(${-cam} 0)`}>
          {/* тротуар, дорога, разметка */}
          <rect x={0} y={1200} width={WORLD_W} height={40} fill="#E3E7EE" />
          <rect x={0} y={1240} width={WORLD_W} height={180} fill="#9AA6B8" />
          {Array.from({ length: 34 }, (_, i) => (
            <rect key={i} x={i * 110} y={1326} width={56} height={8} rx={4} fill="#FFFFFF" opacity={0.85} />
          ))}
          <rect x={0} y={1420} width={WORLD_W} height={500} fill="#BFE3B4" />
          <rect x={0} y={1420} width={WORLD_W} height={26} fill="#E3E7EE" />
          {[90, 760, 1000, 1300, 2200, 2480, 2700, 3320].map((x, i) => (
            <Poplar key={i} x={x} y={1204} s={0.95 + (i % 2) * 0.15} sway={Math.sin(t * 2 + i) * 2} />
          ))}
          <Office door={officeDoor} />
          <School t={t} />
          <Home />
          {/* бабушка у подъезда */}
          <g transform={`translate(${HOME_DOOR + 60} ${SIDEWALK}) scale(${-S} ${S})`}>
            <Figure look={LOOKS.granny} t={t} blinkSeed={5} mouth="smile" armR={grannyWave ? { a: 160 + Math.sin(t * 12) * 14, e: 10 } : { a: 10, e: 30 }} />
          </g>
          {/* сын */}
          {kidAlpha > 0 ? (
            <g opacity={kidAlpha} transform={`translate(${kidX} ${SIDEWALK}) scale(${kidSchool ? -S * 0.72 : S * 0.72} ${S * 0.72})`}>
              <Figure
                look={LOOKS.son}
                t={t}
                blinkSeed={3}
                mouth="smile"
                walk={walkPh(kidX, 18)}
                walkAmt={kidSchool ? (t > d.atSchool + 0.35 && t < d.kidIn - 0.1 ? 1 : 0) : t > d.atHome + 0.25 && t < d.kidOut ? 0.9 : 0}
                armR={kidWave ? { a: 165 + Math.sin(t * 14) * 15, e: 8 } : undefined}
              />
            </g>
          ) : null}
          {/* мама */}
          {momAlpha > 0 ? (
            <g opacity={momAlpha} transform={`translate(${momX} ${SIDEWALK}) scale(${momBack ? -S : S} ${S})`}>
              <Figure
                look={LOOKS.mom}
                t={t}
                blinkSeed={1}
                mouth={momBack ? "worry" : "neutral"}
                worry={momBack ? 1 : 0.3}
                walk={walkPh(momX, momBack ? 20 : 24)}
                walkAmt={(momOut && t < d.inCar - 0.05) || (momBack && t < d.over) ? 1 : 0}
                lean={momBack ? 6 : 2}
              />
            </g>
          ) : null}
          {/* машина */}
          <g transform={`translate(${carX} ${CAR_Y})${back ? " translate(420 0) scale(-1 1)" : ""}`}>
            <FamilyCar wheel={wheel} bounce={bounce} mom={momInCar} kid={kidInCar} doorOpen={rearDoor} />
          </g>
        </g>
        {/* передний план: газон, кусты и тополя (быстрее камеры — глубина) */}
        <g transform={`translate(${-cam * 1.25} 0)`}>
          {Array.from({ length: 22 }, (_, i) => (
            <g key={i} transform={`translate(${i * 230 - 60} ${1500 + (i % 3) * 14})`}>
              <ellipse cx={0} cy={0} rx={110} ry={48} fill={i % 2 ? "#9ED39A" : "#8CC98A"} />
              <ellipse cx={60} cy={-20} rx={70} ry={42} fill="#A9DBA5" />
              {i % 4 === 1 ? <circle cx={-30} cy={-18} r={9} fill="#FFFFFF" /> : null}
              {i % 4 === 3 ? <circle cx={40} cy={-34} r={9} fill={YELLOW} /> : null}
            </g>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <Poplar key={i} x={i * 620 + 180} y={1860} s={1.35} sway={Math.sin(t * 2.2 + i) * 2.5} />
          ))}
        </g>
        {/* таймлапс: полосы скорости на обратном пути */}
        {speed > 0
          ? Array.from({ length: 7 }, (_, i) => {
              const y = 980 + i * 64;
              const x = ((i * 377 + t * 2400) % 1400) - 200;
              return <rect key={i} x={x} y={y} width={180 + (i % 3) * 60} height={6} rx={3} fill="#FFFFFF" opacity={0.7 * speed} />;
            })
          : null}
      </svg>
      {/* значок таймлапса (ускоренное время) */}
      <div style={{ position: "absolute", right: 150, top: 1262, display: "flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 16, backgroundColor: "rgba(20,40,75,0.75)", color: YELLOW, fontFamily, fontSize: 28, fontWeight: 1000 }}>
        <svg width={44} height={26} viewBox="0 0 44 26">
          <path d="M 2 2 L 20 13 L 2 24 Z M 22 2 L 40 13 L 22 24 Z" fill={YELLOW} />
        </svg>
      </div>
    </div>
  );
};
