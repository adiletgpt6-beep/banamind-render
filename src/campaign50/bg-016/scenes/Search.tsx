// Сцена 4: телефон мамы крупно. Календарь уходит, мама набирает
// «Бишкекте балдар үчүн мектеп такси», выбирает BalaGo, изучает страницу
// и поля заявки. Камера ныряет в белую машинку-иконку маршрута →
// схема Бишкека: ҮЙ → МЕКТЕП (эртең менен) → ҮЙ (сабактан кийин).
import { AbsoluteFill, Img, staticFile } from "remotion";
import { fontFamily } from "../../../fonts";
import { cueOf, useScene } from "../context";
import { PAL } from "../Kitchen";
import { clamp, easeInOut, easeOut, keys } from "../../../two-schedules-2d/rig/motion";
import { wordTime } from "../timeline";
import { CityTag, pop, RouteText, Sun } from "../ui";

const QUERY = "Бишкекте балдар үчүн мектеп такси";

// Белая легковая машина сверху (иконка маршрута).
export const CarTop: React.FC<{ readonly x: number; readonly y: number; readonly rot: number; readonly s?: number }> = ({ x, y, rot, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={4} cy={6} rx={58} ry={32} fill="#000" opacity={0.12} />
    <rect x={-58} y={-28} width={116} height={56} rx={22} fill="#FFFFFF" stroke="#1E2F5C" strokeWidth={4} />
    <rect x={8} y={-22} width={26} height={44} rx={8} fill="#9FD3F7" />
    <rect x={-40} y={-22} width={20} height={44} rx={7} fill="#9FD3F7" />
    <rect x={44} y={-24} width={8} height={12} rx={3} fill="#FFE27A" />
    <rect x={44} y={12} width={8} height={12} rx={3} fill="#FFE27A" />
  </g>
);

// Белая машина сбоку (на странице сайта).
export const CarSide: React.FC<{ readonly x: number; readonly y: number; readonly s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-90 10 L-90 -14 Q -86 -26 -70 -28 L-44 -30 L-22 -54 Q -16 -60 -6 -60 L38 -60 Q 48 -60 54 -52 L72 -30 L86 -26 Q 96 -22 96 -10 L96 10 Z" fill="#FFFFFF" stroke="#1E2F5C" strokeWidth={4} />
    <path d="M-16 -50 L-2 -50 L-2 -32 L-34 -32 Z M6 -50 L40 -50 L58 -32 L6 -32 Z" fill="#9FD3F7" />
    <circle cx={-52} cy={12} r={18} fill="#2B3A62" />
    <circle cx={-52} cy={12} r={8} fill="#C9D1DB" />
    <circle cx={60} cy={12} r={18} fill="#2B3A62" />
    <circle cx={60} cy={12} r={8} fill="#C9D1DB" />
  </g>
);

const Field: React.FC<{ readonly label: string; readonly a: number }> = ({ label, a }) => (
  <div style={{ opacity: a, marginTop: 14 }}>
    <div style={{ fontSize: 24, fontWeight: 800, color: "#7A86A6" }}>{label}</div>
    <div style={{ height: 52, borderRadius: 14, border: "3px solid #DDE3EA", background: "#F8FAFC", marginTop: 6 }} />
  </div>
);

// Экран телефона (520×1040 px).
const PhoneScreen: React.FC<{ readonly f: number }> = ({ f }) => {
  const n = Math.round(clamp((f - 8) / 44) * QUERY.length);
  const results = clamp((f - 56) / 10);
  const tapAt = 74;
  const page = easeInOut((f - 80) / 14);
  const scroll = keys(f, [[0, 0], [104, 0], [126, -150]]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#FFFFFF", fontFamily, color: PAL.navy }}>
      {/* поиск */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-page * 100}%)` }}>
        <div style={{ margin: "70px 26px 0", height: 74, borderRadius: 37, border: "4px solid #DDE3EA", display: "flex", alignItems: "center", padding: "0 22px", gap: 12, fontSize: 25, fontWeight: 800 }}>
          <svg width={30} height={30} viewBox="0 0 30 30">
            <circle cx={12} cy={12} r={9} fill="none" stroke={PAL.navy} strokeWidth={4} />
            <path d="M19 19 L27 27" stroke={PAL.navy} strokeWidth={4} strokeLinecap="round" />
          </svg>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
            {QUERY.slice(0, n)}
            {f < 56 && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: "#3E6FB0" }}>|</span> : null}
          </span>
        </div>
        <div style={{ opacity: results, transform: `translateY(${(1 - results) * 30}px)` }}>
          <div
            style={{
              margin: "34px 22px 0",
              padding: 20,
              borderRadius: 24,
              background: f > tapAt && f < tapAt + 12 ? "#FFF1C2" : "#FFFBEA",
              border: `4px solid ${PAL.yellow}`,
              display: "flex",
              gap: 18,
              alignItems: "center",
            }}
          >
            <Img src={staticFile("assets/logo.png")} style={{ width: 92, height: 92 }} />
            <div>
              <div style={{ fontSize: 32, fontWeight: 900 }}>BalaGo</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#5B6785" }}>Балдар үчүн такси • Бишкек</div>
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ margin: "22px 22px 0", padding: 20, borderRadius: 24, background: "#F4F6FA" }}>
              <div style={{ width: 260 - i * 40, height: 22, borderRadius: 11, background: "#D5DBE6" }} />
              <div style={{ width: 380, height: 16, borderRadius: 8, background: "#E3E8F0", marginTop: 14 }} />
              <div style={{ width: 300, height: 16, borderRadius: 8, background: "#E3E8F0", marginTop: 10 }} />
            </div>
          ))}
        </div>
        {f > tapAt - 4 && f < tapAt + 14 ? (
          <div
            style={{
              position: "absolute",
              left: 300 - 40,
              top: 250 - 40,
              width: 80,
              height: 80,
              borderRadius: 40,
              background: "rgba(62,111,176,0.25)",
              transform: `scale(${0.6 + (f - tapAt + 4) / 12})`,
            }}
          />
        ) : null}
      </div>
      {/* страница BalaGo */}
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - page) * 100}%)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: scroll }}>
          <div style={{ background: "#FFF6D6", padding: "64px 28px 26px", display: "flex", alignItems: "center", gap: 18 }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: 110, height: 110 }} />
            <div>
              <div style={{ fontSize: 40, fontWeight: 900 }}>BalaGo</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Балдар үчүн такси</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#5B6785" }}>Бишкек</div>
            </div>
          </div>
          <div style={{ margin: "24px 22px 0", borderRadius: 26, background: "#EEF6FD", padding: "18px 18px 10px" }}>
            <div style={{ fontSize: 26, fontWeight: 900, textAlign: "center" }}>
              <RouteText />
            </div>
            <svg width={440} height={130} viewBox="0 0 440 130">
              <path d="M40 100 Q 220 10 400 100" stroke="#3E6FB0" strokeWidth={6} strokeDasharray="14 10" fill="none" />
              <circle cx={40} cy={100} r={16} fill="#F2A541" />
              <circle cx={400} cy={100} r={16} fill="#E5677A" />
              <CarSide x={220} y={70} s={0.62} />
            </svg>
          </div>
          <div style={{ margin: "22px 26px 0" }}>
            <div style={{ fontSize: 32, fontWeight: 900 }}>Арыз</div>
            <Field label="Аты-жөнүңүз" a={clamp((f - 94) / 6)} />
            <Field label="Мектеп" a={clamp((f - 98) / 6)} />
            <Field label="Үй дареги" a={clamp((f - 102) / 6)} />
            <Field label="Телефон" a={clamp((f - 106) / 6)} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Карта маршрута: Бишкек, горы на юге, дом и школа.
const HOME = { x: 230, y: 1210 };
const SCHOOL = { x: 840, y: 700 };
const legA = (u: number) => {
  // ҮЙ → МЕКТЕП: квадратичная кривая через (330, 760)
  const c = { x: 360, y: 770 };
  const x = (1 - u) * (1 - u) * HOME.x + 2 * (1 - u) * u * c.x + u * u * SCHOOL.x;
  const y = (1 - u) * (1 - u) * HOME.y + 2 * (1 - u) * u * c.y + u * u * SCHOOL.y;
  return { x, y };
};
const legB = (u: number) => {
  const c = { x: 760, y: 1180 };
  const x = (1 - u) * (1 - u) * SCHOOL.x + 2 * (1 - u) * u * c.x + u * u * HOME.x;
  const y = (1 - u) * (1 - u) * SCHOOL.y + 2 * (1 - u) * u * c.y + u * u * HOME.y;
  return { x, y };
};
const tangent = (fn: (u: number) => { x: number; y: number }, u: number) => {
  const a = fn(Math.max(0, u - 0.01));
  const b = fn(Math.min(1, u + 0.01));
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
};

const RouteMap: React.FC<{ readonly f: number; readonly aFrom: number; readonly bFrom: number }> = ({ f, aFrom, bFrom }) => {
  const ua = easeInOut((f - aFrom) / 40);
  const ub = easeInOut((f - bFrom) / 40);
  const onB = f >= bFrom;
  const car = onB ? legB(ub) : legA(ua);
  const rot = onB ? tangent(legB, ub) : tangent(legA, ua);
  const pathA = Array.from({ length: 41 }, (_, i) => legA(i / 40));
  const pathB = Array.from({ length: 41 }, (_, i) => legB(i / 40));
  const d = (pts: { x: number; y: number }[], upto: number) =>
    pts.slice(0, Math.max(1, Math.round(upto * 40)) + 1).map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3F7F1" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* горы Ала-Тоо на юге (вверху карты) */}
        <path d="M0 520 L120 330 L230 430 L380 250 L520 410 L660 280 L800 420 L930 300 L1080 400 L1080 560 L0 560 Z" fill="#B8C6E0" />
        <path d="M340 300 L380 250 L425 305 L395 296 L380 315 Z M620 320 L660 280 L705 330 L670 326 Z M890 340 L930 300 L970 345 L935 340 Z M85 380 L120 330 L155 385 L120 376 Z" fill="#FFFFFF" />
        <rect x={0} y={540} width={1080} height={1380} fill="#EEF4EA" />
        {/* улицы */}
        {[640, 860, 1080, 1300].map((y) => (
          <rect key={y} x={0} y={y} width={1080} height={26} fill="#FFFFFF" />
        ))}
        {[160, 420, 680, 940].map((x) => (
          <rect key={x} x={x} y={540} width={26} height={980} fill="#FFFFFF" />
        ))}
        {/* кварталы и тополя */}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={(i * 211) % 1040 + 30} cy={600 + ((i * 337) % 860)} r={14} fill="#A9D49A" />
        ))}
        <path d={d(pathA, 1)} stroke="#C9D7EA" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={d(pathB, 1)} stroke="#F6DDB0" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={d(pathA, ua)} stroke="#3E6FB0" strokeWidth={14} fill="none" strokeLinecap="round" />
        {onB ? <path d={d(pathB, ub)} stroke="#F2A541" strokeWidth={14} fill="none" strokeLinecap="round" /> : null}
        {/* дом */}
        <g transform={`translate(${HOME.x} ${HOME.y})`}>
          <circle r={86} fill="#FFFFFF" stroke="#F2A541" strokeWidth={8} />
          <path d="M-42 6 L0 -34 L42 6 L42 44 L-42 44 Z" fill="#F2A541" />
          <rect x={-12} y={16} width={24} height={28} fill="#FFFFFF" />
        </g>
        {/* школа */}
        <g transform={`translate(${SCHOOL.x} ${SCHOOL.y})`}>
          <circle r={86} fill="#FFFFFF" stroke="#E5677A" strokeWidth={8} />
          <rect x={-48} y={-18} width={96} height={56} fill="#E5677A" />
          <path d="M-56 -18 L0 -50 L56 -18 Z" fill="#C94F62" />
          <rect x={-10} y={10} width={20} height={28} fill="#FFFFFF" />
          <rect x={-2} y={-74} width={4} height={26} fill="#2B3A62" />
          <path d="M2 -74 L26 -66 L2 -58 Z" fill={PAL.yellow} />
        </g>
        <CarTop x={car.x} y={car.y} rot={rot} s={1.1} />
      </svg>
      <div style={{ position: "absolute", left: HOME.x - 120, top: HOME.y + 96, width: 240, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 46, color: PAL.navy }}>ҮЙ</div>
      <div style={{ position: "absolute", left: SCHOOL.x - 160, top: SCHOOL.y + 96, width: 320, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 46, color: PAL.navy }}>МЕКТЕП</div>
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 880,
          opacity: clamp((f - aFrom) / 8) * (1 - clamp((f - bFrom) / 8)),
          fontFamily,
          fontWeight: 900,
          fontSize: 36,
          color: "#3E6FB0",
          background: "#FFFFFF",
          padding: "8px 20px",
          borderRadius: 18,
        }}
      >
        <Sun />
        эртең менен
      </div>
      <div
        style={{
          position: "absolute",
          left: 560,
          top: 1110,
          opacity: clamp((f - bFrom) / 8),
          fontFamily,
          fontWeight: 900,
          fontSize: 36,
          color: "#C9821F",
          background: "#FFFFFF",
          padding: "8px 20px",
          borderRadius: 18,
        }}
      >
        сабактан кийин
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 600, display: "flex", justifyContent: "center", opacity: clamp((f - aFrom + 10) / 10) }}>
        <div style={{ background: PAL.navy, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 40, padding: "14px 30px", borderRadius: 24, transform: `scale(${pop((f - aFrom + 10) / 12)})` }}>
          1 толук сапар:{" "}
          <span style={{ color: PAL.yellow }}>
            <RouteText color={PAL.yellow} />
          </span>
        </div>
      </div>
      <CityTag x={70} y={1400} opacity={clamp((f - aFrom) / 10)} />
    </AbsoluteFill>
  );
};

export const SearchScene: React.FC = () => {
  const { f, tl, at } = useScene("search");
  const n03 = cueOf(tl, "n03");
  // наезд в машинку — с началом фразы диктора, карта — к слову «мектепке»
  const dive = Math.max(122, at(n03.from) + 4);
  const mapAt = dive + 22;
  const aFrom = Math.max(mapAt + 4, at(wordTime(n03, 2)) - 6);
  const bFrom = Math.max(aFrom + 44, at(wordTime(n03, 4)) - 4);
  const zoom = easeInOut((f - dive) / 26);
  const enter = easeOut(f / 12);
  // телефон: 540×1080 по центру; машинка-иконка на экране ≈ (220+..., 300)
  const phoneScale = (0.92 + enter * 0.08) * (1 + zoom * 5);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFF6E6 0%, #FDE9C8 100%)" }}>
      {f < mapAt + 10 ? (
        <AbsoluteFill style={{ transform: `scale(${phoneScale})`, transformOrigin: "540px 462px", opacity: 1 - clamp((f - mapAt) / 10) }}>
          <div
            style={{
              position: "absolute",
              left: 270,
              top: 210,
              width: 540,
              height: 1080,
              borderRadius: 64,
              background: "#1E2F5C",
              boxShadow: "0 30px 80px rgba(30,47,92,0.3)",
              padding: 12,
            }}
          >
            <div style={{ position: "relative", width: 516, height: 1056, borderRadius: 54, overflow: "hidden" }}>
              <PhoneScreen f={f} />
              <div style={{ position: "absolute", left: 208, top: 14, width: 100, height: 26, borderRadius: 13, background: "#1E2F5C" }} />
            </div>
          </div>
          {/* пальцы мамы по бокам телефона */}
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <path d="M262 980 Q 210 1000 214 1080 Q 220 1200 300 1290 L 380 1290 L 300 1100 Z" fill="#E6B590" />
            <path d="M818 900 Q 880 920 880 1010 Q 876 1180 790 1290 L 700 1290 L 800 1060 Z" fill="#E6B590" />
            <path d="M818 700 Q 846 706 846 740 Q 846 770 818 776 Z" fill="#E6B590" />
            <path d="M818 790 Q 850 796 850 830 Q 850 862 818 868 Z" fill="#E6B590" />
          </svg>
        </AbsoluteFill>
      ) : null}
      {f >= mapAt ? (
        <AbsoluteFill style={{ opacity: clamp((f - mapAt) / 10), transform: `scale(${1.2 - 0.2 * easeOut((f - mapAt) / 20)})` }}>
          <RouteMap f={f} aFrom={aFrom} bFrom={bFrom} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: f < 10 ? 1 - f / 10 : 0 }} />
    </AbsoluteFill>
  );
};
