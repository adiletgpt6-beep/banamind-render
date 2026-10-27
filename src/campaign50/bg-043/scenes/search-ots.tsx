// Сцена 3, второй план: «через плечо» мамы. Большой экран ноутбука с
// простым браузером (адресная строка, поле поиска, кнопка «Издөө»,
// результаты), на переднем плане — мама со спины (тёмные волосы с пучком,
// уши, шея, плечи в жакете). Будильники сидят у неё на плечах (рисуются
// в Search.tsx между экраном и мамой).
// Мир кадра совпадает с кадром 1080×1920 при камере { 540, 960, 1 }.
// Важное на экране — между y ≈ 400 и 1040; голова мамы ниже экрана.
import { fontFamily } from "../../../fonts";
import { clamp, lerp } from "../anim";
import { Logo, Sparks } from "../parts";
import { C } from "../palette";
import { BG43_TEXT } from "../script";
import { box } from "../shots";

// ---------- Геометрия ----------
export const OTS = {
  bezel: { x0: 66, y0: 386, x1: 1014, y1: 1054 },
  screen: { x0: 84, y0: 404, x1: 996, y1: 1036 },
  chromeH: 70,
  // поле поиска и кнопка: «домашний» вид → вид с результатами
  fieldHome: { x: 112, y: 594, w: 816, h: 90, font: 31 },
  fieldRes: { x: 112, y: 494, w: 680, h: 74, font: 26 },
  btnHome: { cx: 540, cy: 748, w: 220, h: 70, font: 32 },
  btnRes: { cx: 866, cy: 531, w: 124, h: 74, font: 26 },
  // слоты результатов
  slot1: { y: 596 },
  brand: { x0: 100, x1: 936, y: 702, h: 172 },
  slot3: { y: 900 },
  // мама со спины
  head: { x: 540, y: 1228, rx: 106, ry: 124 },
  // будильники на плечах (точка опоры — чуть ниже линии плеча)
  perch: { work: { x: 262, y: 1402 }, school: { x: 818, y: 1402 } },
} as const;

const MOM = {
  hair: "#2A201D",
  hairLine: "#45362F",
  skin: "#E6B590",
  skinShade: "#D29B74",
  jacket: "#5F78B0",
  jacketShade: "#4C6497",
  collar: "#FFF6E6",
  gold: "#E9A900",
};

// ---------- Фон: стена напротив, мягкий свет, растение, стол ----------
export const OtsBackground: React.FC<{ readonly f: number }> = ({ f }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <div style={box({ left: -400, top: -400, width: 1880, height: 1520, background: "linear-gradient(180deg, #FFFFFF 0%, #FBF5EA 70%, #F5EBDA 100%)" })} />
    <div style={box({ left: -400, top: -400, width: 1880, height: 1520, backgroundImage: "repeating-linear-gradient(90deg, rgba(20,40,90,0.022) 0 4px, transparent 4px 96px)" })} />
    {/* мягкое пятно света от окна за кадром */}
    <div style={box({ left: -260, top: -120, width: 760, height: 760, borderRadius: 380, background: "radial-gradient(circle, rgba(255,244,194,0.75) 0%, rgba(255,244,194,0) 70%)" })} />
    {/* полоска фирменного жёлтого на стене (как в офисе) */}
    <div style={box({ left: -400, top: 1000, width: 1880, height: 14, backgroundColor: C.yellowSoft })} />
    {/* растение справа, чуть покачивается */}
    <svg width={260} height={420} viewBox="0 0 260 420" style={box({ left: 900, top: 640 })}>
      <g transform={`rotate(${Math.sin(f / 40) * 1.5} 120 380)`}>
        <path d="M 120 380 C 60 300 30 220 50 130 C 90 190 110 280 120 380 Z" fill="#7DBA84" />
        <path d="M 120 380 C 170 300 210 220 200 120 C 160 190 135 280 120 380 Z" fill="#8FCB93" />
        <path d="M 120 380 C 112 280 116 160 132 60 C 150 160 140 280 120 380 Z" fill="#6AAE74" />
      </g>
      <path d="M 70 360 L 180 360 L 168 420 L 82 420 Z" fill="#FFFFFF" stroke="#E2D8C6" strokeWidth={4} />
    </svg>
    {/* стол */}
    <div style={box({ left: -400, top: 1040, width: 1880, height: 1200, background: `linear-gradient(180deg, #F2E1C6 0%, ${C.desk} 40%, #E2C9A6 100%)` })} />
    <div style={box({ left: -400, top: 1040, width: 1880, height: 8, backgroundColor: "rgba(160,120,70,0.14)" })} />
  </div>
);

// ---------- Ноутбук спереди: рамка экрана и клавиатурная часть ----------
export const LaptopFront: React.FC<{ readonly children?: React.ReactNode }> = ({ children }) => {
  const b = OTS.bezel;
  const s = OTS.screen;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      {/* корпус под экраном (клавиатура) — в перспективе */}
      <svg width={1080} height={160} viewBox="0 0 1080 160" style={box({ left: 0, top: b.y1 - 16 })}>
        <path d="M 52 8 L 1028 8 L 1080 104 L 0 104 Z" fill="#C9D2E2" />
        <path d="M 52 8 L 1028 8 L 1036 22 L 44 22 Z" fill="#B3BED2" />
        {Array.from({ length: 3 }, (_, r) =>
          Array.from({ length: 14 }, (_, c) => {
            const y = 32 + r * 22;
            const k = (y - 8) / 96;
            const x0 = 52 - 52 * k + 40;
            const w = (1080 - 2 * x0) / 14;
            return <rect key={`${r}-${c}`} x={x0 + c * w + 3} y={y} width={w - 6} height={15} rx={4} fill="#AEB9CC" opacity={0.75} />;
          }),
        )}
        <rect x={0} y={100} width={1080} height={12} rx={6} fill="#B7C1D3" />
      </svg>
      {/* рамка экрана */}
      <div style={box({ left: b.x0, top: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, borderRadius: 30, backgroundColor: "#283452", boxShadow: "0 24px 50px rgba(20,40,90,0.22)" })} />
      <div style={box({ left: 535, top: b.y0 + 6, width: 10, height: 10, borderRadius: 5, backgroundColor: "#46557A" })} />
      <div style={box({ left: s.x0, top: s.y0, width: s.x1 - s.x0, height: s.y1 - s.y0, borderRadius: 10, overflow: "hidden", backgroundColor: "#FFFFFF" })}>
        {children}
      </div>
    </div>
  );
};

// ---------- Браузер ----------
export type BrowserState = {
  readonly f: number;
  readonly typed: number; // сколько букв запроса набрано
  readonly caret: boolean;
  readonly focus: number; // 0…1 — поле в фокусе (жёлтая рамка)
  readonly morph: number; // 0 — «домашний» вид, 1 — страница результатов
  readonly hover: number; // курсор над кнопкой
  readonly press: number; // кнопка нажата
  readonly skeleton: number; // 0…1 — заглушки загрузки
  readonly r1: number; // появление результатов 0…1
  readonly r3: number;
  readonly brand: number; // «поп» результата BalaGo (с перелётом)
  readonly brandAt: number; // кадр появления (для искр)
  readonly brandHover: number; // курсор над результатом BalaGo
  readonly picked: number; // результат выбран (нажат)
  readonly pickedAt: number;
  readonly cursor: { readonly x: number; readonly y: number; readonly show: number; readonly press: number; readonly ripple: number };
};

const rectLerp = (a: { x: number; y: number; w: number; h: number; font: number }, b: typeof a, t: number) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  font: lerp(a.font, b.font, t),
});

// Координаты внутри экрана: мировые минус левый верхний угол экрана.
const SX = OTS.screen.x0;
const SY = OTS.screen.y0;

const Magnifier: React.FC<{ readonly size: number; readonly color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: "block", flex: "none" }}>
    <circle cx={17} cy={17} r={11} fill="none" stroke={color} strokeWidth={5} />
    <path d="M 25 25 L 35 35" stroke={color} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const Skeleton: React.FC<{ readonly y: number; readonly o: number; readonly f: number; readonly wide?: boolean }> = ({ y, o, f, wide }) => {
  if (o <= 0.01) return null;
  const shimmer = 0.55 + 0.25 * Math.sin(f / 3 + y / 60);
  return (
    <div style={box({ left: 112 - SX, top: y - SY, width: 760, height: 90, opacity: o * shimmer })}>
      <div style={box({ left: 0, top: 6, width: 200, height: 18, borderRadius: 9, backgroundColor: "#DCE6F2" })} />
      <div style={box({ left: 0, top: 40, width: wide ? 640 : 520, height: 30, borderRadius: 15, backgroundColor: "#E3EAF4" })} />
    </div>
  );
};

const Result: React.FC<{ readonly y: number; readonly a: number; readonly title: string; readonly url: string }> = ({ y, a, title, url }) => {
  if (a <= 0.01) return null;
  return (
    <div style={box({ left: 112 - SX, top: y - SY, width: 800, opacity: a, transform: `translateY(${(1 - a) * 18}px)`, fontFamily })}>
      <div style={{ fontSize: 23, fontWeight: 700, color: C.muted, lineHeight: "30px" }}>{url}</div>
      <div style={{ fontSize: 31, fontWeight: 800, color: "#2B4C8F", lineHeight: "42px", whiteSpace: "nowrap" }}>{title}</div>
    </div>
  );
};

export const Browser: React.FC<{ readonly s: BrowserState }> = ({ s }) => {
  const q = BG43_TEXT.search.query;
  const fld = rectLerp(OTS.fieldHome, OTS.fieldRes, s.morph);
  const bh = OTS.btnHome;
  const br = OTS.btnRes;
  const btn = { cx: lerp(bh.cx, br.cx, s.morph), cy: lerp(bh.cy, br.cy, s.morph), w: lerp(bh.w, br.w, s.morph), h: lerp(bh.h, br.h, s.morph), font: lerp(bh.font, br.font, s.morph) };
  const bscale = 1 + 0.05 * s.hover - 0.08 * s.press;
  const B = OTS.brand;
  const brandT = clamp(s.brand, 0, 1.2);
  return (
    <div style={box({ left: 0, top: 0, width: OTS.screen.x1 - SX, height: OTS.screen.y1 - SY, fontFamily, color: C.navy })}>
      {/* верхняя панель браузера */}
      <div style={box({ left: 0, top: 0, width: OTS.screen.x1 - SX, height: OTS.chromeH, backgroundColor: "#EEF2F8", borderBottom: "2px solid #DCE4F0" })}>
        {["#F28B82", C.yellow, "#81C995"].map((c, i) => (
          <div key={c} style={box({ left: 26 + i * 26, top: 27, width: 16, height: 16, borderRadius: 8, backgroundColor: c })} />
        ))}
        <div style={box({ left: 110, top: 14, width: 770, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", boxShadow: "inset 0 0 0 2px #E1E8F2" })}>
          <svg width={22} height={26} viewBox="0 0 22 26" style={box({ left: 18, top: 8 })}>
            <rect x={2} y={11} width={18} height={13} rx={3} fill="#9FB0CF" />
            <path d="M 6 11 L 6 7 Q 11 1 16 7 L 16 11" fill="none" stroke="#9FB0CF" strokeWidth={3} />
          </svg>
          <div style={box({ left: 52, top: 15, width: 230 + 90 * s.morph, height: 12, borderRadius: 6, backgroundColor: "#DCE4F0" })} />
        </div>
      </div>
      {/* загрузка: тонкая жёлтая полоса под панелью */}
      {s.skeleton > 0.01 ? (
        <div style={box({ left: 0, top: OTS.chromeH, width: (OTS.screen.x1 - SX) * clamp(s.skeleton * 1.1), height: 5, backgroundColor: C.yellow, opacity: s.r1 < 0.99 ? 1 : 0 })} />
      ) : null}
      {/* поле поиска */}
      <div
        style={box({
          left: fld.x - SX,
          top: fld.y - SY,
          width: fld.w,
          height: fld.h,
          borderRadius: fld.h / 2,
          backgroundColor: "#FFFFFF",
          boxShadow: `0 0 0 ${3 + s.focus}px ${s.focus > 0.5 ? C.yellow : "#C9D3E6"}, 0 8px 22px rgba(20,40,90,${0.06 + 0.06 * s.focus})`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingLeft: 28,
          boxSizing: "border-box",
          overflow: "hidden",
        })}
      >
        <Magnifier size={fld.font * 1.05} color={C.muted} />
        <div style={{ fontSize: fld.font, fontWeight: 800, whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
          <span>{q.slice(0, s.typed)}</span>
          <span style={{ display: "inline-block", width: 3, height: fld.font * 1.1, marginLeft: 2, backgroundColor: C.navy, opacity: s.caret ? 1 : 0 }} />
        </div>
      </div>
      {/* кнопка «Издөө» */}
      <div
        style={box({
          left: btn.cx - btn.w / 2 - SX,
          top: btn.cy - btn.h / 2 - SY,
          width: btn.w,
          height: btn.h,
          borderRadius: btn.h / 2,
          backgroundColor: s.press > 0.5 ? C.yellowDeep : C.yellow,
          transform: `scale(${bscale})`,
          boxShadow: `0 ${8 - 6 * s.press}px 18px rgba(233,169,0,${0.25 + 0.2 * s.hover})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: btn.font,
          fontWeight: 900,
        })}
      >
        {BG43_TEXT.search.searchBtn}
      </div>
      {/* результаты */}
      <Skeleton y={OTS.slot1.y} o={s.skeleton * (1 - s.r1)} f={s.f} />
      <Skeleton y={B.y + 30} o={s.skeleton * (1 - clamp(brandT))} f={s.f} wide />
      <Skeleton y={OTS.slot3.y} o={s.skeleton * (1 - s.r3)} f={s.f} wide />
      <Result y={OTS.slot1.y} a={s.r1} title={BG43_TEXT.search.results[0].title} url={BG43_TEXT.search.results[0].url} />
      <Result y={OTS.slot3.y} a={s.r3} title={BG43_TEXT.search.results[1].title} url={BG43_TEXT.search.results[1].url} />
      {brandT > 0.01 ? (
        <div
          style={box({
            left: B.x0 - SX,
            top: B.y - SY,
            width: B.x1 - B.x0,
            height: B.h,
            borderRadius: 26,
            backgroundColor: C.yellowSoft,
            boxShadow: `0 0 0 ${3 + 2 * s.picked}px ${C.yellow}, 0 0 0 ${10 + 10 * s.brandHover + 6 * s.picked}px rgba(255,201,14,${0.18 + 0.14 * s.picked}), 0 14px 30px rgba(233,169,0,0.22)`,
            opacity: clamp(brandT * 3),
            transform: `scale(${(0.7 + 0.3 * brandT) * (1 - 0.025 * s.cursor.press * s.brandHover)})`,
            transformOrigin: "20% 50%",
          })}
        >
          <Logo x={82} y={B.h / 2} r={46} scale={0.6 + 0.4 * clamp(brandT * 1.4)} />
          <div style={box({ left: 150, top: 22, width: 660 })}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.muted, lineHeight: "30px" }}>{BG43_TEXT.search.brand.url}</div>
            <div
              style={{
                fontSize: 35,
                fontWeight: 900,
                color: C.navy,
                lineHeight: "50px",
                whiteSpace: "nowrap",
                textDecoration: s.brandHover > 0.5 ? "underline" : "none",
                textDecorationColor: C.yellowDeep,
                textDecorationThickness: 4,
                textUnderlineOffset: 6,
              }}
            >
              {BG43_TEXT.search.brand.title}
            </div>
            <div style={{ fontSize: 27, fontWeight: 800, color: C.ink, lineHeight: "40px", whiteSpace: "nowrap" }}>{BG43_TEXT.search.brand.snippet}</div>
          </div>
        </div>
      ) : null}
      <div style={box({ left: -SX, top: -SY })}>
        <Sparks x={B.x0 + 82} y={B.y + B.h / 2} f={s.f} at={s.brandAt + 2} n={8} spread={96} />
        <Sparks x={B.x0 + 82} y={B.y + B.h / 2} f={s.f} at={s.pickedAt} n={6} spread={70} />
      </div>
      <MouseCursor {...s.cursor} />
    </div>
  );
};

// Указатель мыши: белая стрелка с тёмным контуром; нажатие — сжатие и
// расходящееся кольцо.
const MouseCursor: React.FC<BrowserState["cursor"]> = ({ x, y, show, press, ripple }) => {
  if (show <= 0.01) return null;
  return (
    <>
      {ripple > 0 && ripple < 1 ? (
        <div style={box({ left: x - SX - 40 * ripple, top: y - SY - 40 * ripple, width: 80 * ripple, height: 80 * ripple, borderRadius: 999, border: `4px solid ${C.yellowDeep}`, opacity: 1 - ripple })} />
      ) : null}
      <svg width={44} height={60} viewBox="0 0 44 60" style={box({ left: x - SX - 6, top: y - SY - 4, opacity: show, transform: `scale(${1 - 0.14 * press})`, transformOrigin: "6px 4px" })}>
        <path d="M 6 4 L 6 46 L 16 36 L 24 54 L 31 51 L 23 33 L 37 33 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={3.5} strokeLinejoin="round" />
      </svg>
    </>
  );
};

// ---------- Мама со спины ----------
export type MomBackState = {
  readonly f: number;
  readonly typing: number; // 0…1 — плечи «печатают»
  readonly headTurn: number; // −1…1 — лёгкий поворот головы (px сдвиг пучка)
  readonly headTilt: number; // градусы
  readonly nod: number; // 0…1 — кивок (голова чуть вниз)
  readonly breath: number; // −1…1
};

export const MomBack: React.FC<{ readonly s: MomBackState }> = ({ s }) => {
  const H = OTS.head;
  const bob = s.breath * 2.2;
  const tapL = s.typing * Math.max(0, Math.sin(s.f * 1.15)) * 3;
  const tapR = s.typing * Math.max(0, Math.sin(s.f * 1.15 + 2.1)) * 3;
  const hx = H.x + s.headTurn * 14;
  const hy = H.y + s.nod * 10 + bob * 0.6;
  const bunX = H.x + s.headTurn * 26;
  return (
    <svg width={1080} height={1920} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <defs>
        <linearGradient id="bg43-momback-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A2D29" />
          <stop offset="1" stopColor={MOM.hair} />
        </linearGradient>
      </defs>
      {/* корпус: плечи в жакете (уходят за нижний край кадра) */}
      <g transform={`translate(0 ${bob})`}>
        <path
          d={`M 470 1366 C 400 ${1372 + tapL * 0.3} 300 ${1380 + tapL} 230 ${1398 + tapL} C 160 ${1416 + tapL} 112 1450 96 1530 L 64 1990 L 1016 1990 L 984 1530 C 968 1450 920 ${1416 + tapR} 850 ${1398 + tapR} C 780 ${1380 + tapR} 680 ${1372 + tapR * 0.3} 610 1366 Z`}
          fill={MOM.jacket}
        />
        {/* рукава уходят вперёд к клавиатуре — тень по бокам */}
        <path d={`M 230 ${1398 + tapL} C 160 ${1416 + tapL} 112 1450 96 1530 L 64 1990 L 210 1990 C 196 1760 200 1560 250 ${1452 + tapL} Z`} fill={MOM.jacketShade} />
        <path d={`M 850 ${1398 + tapR} C 920 ${1416 + tapR} 968 1450 984 1530 L 1016 1990 L 870 1990 C 884 1760 880 1560 830 ${1452 + tapR} Z`} fill={MOM.jacketShade} />
        {/* швы: плечевые и шов спинки */}
        <path d={`M 250 ${1452 + tapL} C 300 ${1420 + tapL} 360 1400 420 1392`} fill="none" stroke={MOM.jacketShade} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        <path d={`M 830 ${1452 + tapR} C 780 ${1420 + tapR} 720 1400 660 1392`} fill="none" stroke={MOM.jacketShade} strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        <path d="M 540 1420 L 540 1990" stroke={MOM.jacketShade} strokeWidth={4} opacity={0.55} />
        {/* шея */}
        <path d={`M ${hx - 52} 1300 L ${hx - 56} 1372 Q 540 1384 ${hx + 56} 1372 L ${hx + 52} 1300 Z`} fill={MOM.skin} />
        {/* воротник блузки и воротник жакета */}
        <path d="M 466 1362 Q 540 1392 614 1362 L 620 1380 Q 540 1414 460 1380 Z" fill={MOM.collar} />
        <path d="M 446 1374 Q 540 1414 634 1374 L 650 1398 Q 540 1444 430 1398 Z" fill={MOM.jacketShade} />
      </g>
      {/* голова (со спины): затылок, уши, волосы собраны в пучок */}
      <g transform={`rotate(${s.headTilt} ${H.x} 1360)`}>
        {([-1, 1] as const).map((side) => (
          <g key={side}>
            <ellipse cx={hx + side * (H.rx - 6)} cy={hy + 10} rx={17} ry={27} fill={MOM.skin} />
            <ellipse cx={hx + side * (H.rx - 2)} cy={hy + 12} rx={7} ry={15} fill={MOM.skinShade} opacity={0.7} />
            <circle cx={hx + side * (H.rx - 4)} cy={hy + 42} r={6} fill={MOM.gold} />
          </g>
        ))}
        {/* затылок и тень под волосами */}
        <ellipse cx={hx} cy={hy + 24} rx={H.rx - 14} ry={H.ry - 20} fill={MOM.skin} />
        <path d={`M ${hx - 78} ${hy + 70} Q ${hx} ${hy + 100} ${hx + 78} ${hy + 70} L ${hx + 70} ${hy + 92} Q ${hx} ${hy + 118} ${hx - 70} ${hy + 92} Z`} fill={MOM.skinShade} opacity={0.55} />
        {/* волосы: гладко зачёсаны к пучку, линия роста на затылке */}
        <path
          d={`M ${hx - H.rx} ${hy + 6} C ${hx - H.rx} ${hy - 96} ${hx - 58} ${hy - H.ry} ${hx} ${hy - H.ry} C ${hx + 58} ${hy - H.ry} ${hx + H.rx} ${hy - 96} ${hx + H.rx} ${hy + 6} C ${hx + H.rx - 4} ${hy + 48} ${hx + 82} ${hy + 72} ${hx + 66} ${hy + 76} Q ${hx + 30} ${hy + 64} ${hx} ${hy + 86} Q ${hx - 30} ${hy + 64} ${hx - 66} ${hy + 76} C ${hx - 82} ${hy + 72} ${hx - H.rx + 4} ${hy + 48} ${hx - H.rx} ${hy + 6} Z`}
          fill="url(#bg43-momback-hair)"
        />
        {[-70, -40, -14, 14, 40, 70].map((dx, i) => (
          <path
            key={i}
            d={`M ${hx + dx * 1.05} ${hy + 66 - Math.abs(dx) * 0.3} Q ${hx + dx * 0.9} ${hy - 40} ${bunX + dx * 0.18} ${hy - H.ry + 14}`}
            fill="none"
            stroke={MOM.hairLine}
            strokeWidth={3.2}
            strokeLinecap="round"
            opacity={0.75}
          />
        ))}
        {/* блик от экрана по верху головы */}
        <path d={`M ${hx - 74} ${hy - 72} Q ${hx} ${hy - H.ry - 10} ${hx + 74} ${hy - 72}`} fill="none" stroke="#A9BCE0" strokeWidth={5} strokeLinecap="round" opacity={0.45} />
        {/* пучок с жёлтой резинкой */}
        <circle cx={bunX} cy={hy - H.ry - 22} r={50} fill={MOM.hair} />
        <path d={`M ${bunX - 30} ${hy - H.ry - 30} Q ${bunX} ${hy - H.ry - 70} ${bunX + 32} ${hy - H.ry - 26}`} fill="none" stroke={MOM.hairLine} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${bunX - 18} ${hy - H.ry - 10} Q ${bunX + 6} ${hy - H.ry - 44} ${bunX + 26} ${hy - H.ry - 8}`} fill="none" stroke={MOM.hairLine} strokeWidth={4} strokeLinecap="round" />
        <path d={`M ${bunX - 40} ${hy - H.ry - 46} Q ${bunX} ${hy - H.ry - 86} ${bunX + 40} ${hy - H.ry - 46}`} fill="none" stroke="#A9BCE0" strokeWidth={4} strokeLinecap="round" opacity={0.45} />
        <ellipse cx={bunX} cy={hy - H.ry + 16} rx={34} ry={10} fill={C.yellow} stroke={C.yellowDeep} strokeWidth={3} />
      </g>
    </svg>
  );
};
