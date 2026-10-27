// Сцена 4 (связующий поступок): вид сверху на стол. Сын разворачивает свой
// рисунок часов и дорисовывает две стрелки мелком: от маминой работы к
// школе и от дома к школе. Мамин палец обводит их — она видит, что
// повторяется именно дорога: «Күн сайын ушул жолду башкача уюштурса
// болобу?» На рисунке появляется петля «Күн сайын». Затем мама сама
// открывает ноутбук и ищет заранее организованную школьную поездку в
// Бишкеке — находит BalaGo по ссылке в профиле (только страница сервиса:
// без заявки, без поездки).
import { Img, staticFile } from "remotion";
import { ArrowText, easeInOut, easeOut, House, NAVY, NAVY_SOFT, popScale, prog, School, YELLOW, YELLOW_SOFT } from "../art";
import { glide, keys, type Vec } from "../rig/motion";
import { cueFrames, local, wordFrame, type SceneProps } from "../kit";
import { BG13_TEXT } from "../script";
import { box, PAPER, TopHand } from "./sets";

const D = BG13_TEXT.drawing;
const S = BG13_TEXT.search;

// Точки рисунка (координаты листа 0…900 × 0…1100).
export const DRAW = {
  clock: { x: 450, y: 560, r: 170 },
  office: { x: 170, y: 190 },
  school: { x: 740, y: 330 },
  home: { x: 250, y: 930 },
} as const;
const A1: Vec[] = [
  { x: 250, y: 220 },
  { x: 470, y: 150 },
  { x: 650, y: 280 },
];
const A2: Vec[] = [
  { x: 330, y: 900 },
  { x: 660, y: 860 },
  { x: 760, y: 470 },
];
const pathOf = (pts: readonly Vec[]) => `M ${pts[0].x} ${pts[0].y} Q ${pts[1].x} ${pts[1].y} ${pts[2].x} ${pts[2].y}`;
const lenOf = (pts: readonly Vec[]) => Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) + Math.hypot(pts[2].x - pts[1].x, pts[2].y - pts[1].y);
// Точка на квадратичной кривой.
export const onCurve = (pts: readonly Vec[], u: number): Vec => {
  const a = 1 - u;
  return { x: a * a * pts[0].x + 2 * a * u * pts[1].x + u * u * pts[2].x, y: a * a * pts[0].y + 2 * a * u * pts[1].y + u * u * pts[2].y };
};

const Stroke: React.FC<{ readonly pts: readonly Vec[]; readonly u: number; readonly color: string; readonly w?: number }> = ({ pts, u, color, w = 12 }) => {
  if (u <= 0) return null;
  const L = lenOf(pts) * 1.05;
  const tip = onCurve(pts, Math.min(1, u));
  const prev = onCurve(pts, Math.max(0, Math.min(1, u) - 0.04));
  const ang = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI;
  return (
    <g>
      <path d={pathOf(pts)} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - Math.min(1, u))} opacity={0.92} />
      {u >= 1 ? <path d="M -30 -20 L 0 0 L -30 20" transform={`translate(${tip.x} ${tip.y}) rotate(${ang})`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

// Детский рисунок часов. a1/a2 — стрелки (0…1), loop — петля «Күн сайын»,
// sun — дорисованное солнце (финал), labels — подписи.
export const ClockDrawing: React.FC<{
  readonly f: number;
  readonly a1?: number;
  readonly a2?: number;
  readonly loop?: number;
  readonly sun?: number;
  readonly icons?: number;
  readonly clockFade?: number;
}> = ({ f, a1 = 0, a2 = 0, loop = 0, sun = 0, icons = 1, clockFade = 1 }) => {
  const c = DRAW.clock;
  const wob = Math.sin(f / 9) * 1.5;
  return (
    <svg width={PAPER.w} height={PAPER.h} viewBox={`0 0 ${PAPER.w} ${PAPER.h}`} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <g opacity={clockFade}>
        {/* солнце-лучи (финал) */}
        {Array.from({ length: 12 }, (_, i) => {
          const u = Math.max(0, Math.min(1, sun * 12 - i));
          const a = ((i * 30 - 75) * Math.PI) / 180;
          return u > 0 ? (
            <path
              key={i}
              d={`M ${c.x + Math.cos(a) * (c.r + 22)} ${c.y + Math.sin(a) * (c.r + 22)} L ${c.x + Math.cos(a) * (c.r + 22 + 70 * u)} ${c.y + Math.sin(a) * (c.r + 22 + 70 * u)}`}
              stroke="#F5B400"
              strokeWidth={16}
              strokeLinecap="round"
            />
          ) : null;
        })}
        <circle cx={c.x} cy={c.y} r={c.r} fill={sun > 0 ? `rgba(255,214,90,${0.45 * Math.min(1, sun * 1.5)})` : "rgba(255,255,255,0)"} stroke="#3B76D6" strokeWidth={13} strokeLinecap="round" transform={`rotate(${wob} ${c.x} ${c.y})`} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <circle key={i} cx={c.x + Math.sin(a) * (c.r - 30)} cy={c.y - Math.cos(a) * (c.r - 30)} r={i % 3 === 0 ? 9 : 5} fill="#3B76D6" />;
        })}
        {/* стрелки часов — длинная минутная «тянется» */}
        <path d={`M ${c.x} ${c.y} L ${c.x} ${c.y - 92}`} stroke={NAVY} strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${c.x} ${c.y} Q ${c.x + 70} ${c.y + 10 + wob * 3} ${c.x + 150} ${c.y + 46}`} stroke="#E8463A" strokeWidth={10} strokeLinecap="round" fill="none" />
        <circle cx={c.x} cy={c.y} r={14} fill={YELLOW} stroke={NAVY} strokeWidth={4} />
        {/* улыбка солнца */}
        {sun > 0.6 ? <path d={`M ${c.x - 60} ${c.y + 78} Q ${c.x} ${c.y + 120} ${c.x + 60} ${c.y + 78}`} stroke="#E8463A" strokeWidth={10} fill="none" strokeLinecap="round" opacity={prog(sun, 0.6, 0.3)} /> : null}
      </g>
      {icons > 0 ? (
        <g opacity={icons}>
          {/* мамин офис */}
          <g transform={`translate(${DRAW.office.x} ${DRAW.office.y})`}>
            <rect x={-56} y={-110} width={112} height={130} rx={8} fill="#DCE8F8" stroke={NAVY_SOFT} strokeWidth={6} />
            {[0, 1, 2].map((r) => [0, 1].map((cc) => <rect key={`${r}${cc}`} x={-38 + cc * 44} y={-92 + r * 36} width={30} height={22} rx={4} fill="#9CC0EA" />))}
            <text x={0} y={70} textAnchor="middle" fontSize={40} fontWeight={1000} fill={NAVY_SOFT} fontFamily="Nunito">
              {D.office}
            </text>
          </g>
          <g transform={`translate(${DRAW.school.x} ${DRAW.school.y}) scale(1.25)`}>
            <School />
            <text x={0} y={42} textAnchor="middle" fontSize={34} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
              {D.school}
            </text>
          </g>
          <g transform={`translate(${DRAW.home.x} ${DRAW.home.y}) scale(1.4)`}>
            <House />
            <text x={0} y={36} textAnchor="middle" fontSize={30} fontWeight={1000} fill={NAVY} fontFamily="Nunito">
              {D.home}
            </text>
          </g>
        </g>
      ) : null}
      <Stroke pts={A1} u={a1} color="#E8463A" />
      <Stroke pts={A2} u={a2} color="#22A06B" />
      {loop > 0 ? (
        <g opacity={Math.min(1, loop * 2)}>
          <path
            d="M 600 640 A 120 70 -30 1 1 830 600"
            fill="none"
            stroke="#8457D0"
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={520}
            strokeDashoffset={520 * (1 - loop)}
          />
          <text x={700} y={760} textAnchor="middle" fontSize={50} fontWeight={1000} fill="#8457D0" fontFamily="Nunito" transform="rotate(-6 700 760)">
            {D.note}
          </text>
        </g>
      ) : null}
    </svg>
  );
};

// Деревянный стол сверху и лист бумаги.
export const TableTop: React.FC<{ readonly children?: React.ReactNode; readonly unfold?: number; readonly lamp?: number }> = ({ children, unfold = 1, lamp = 1 }) => (
  <>
    <div style={box({ inset: 0, background: "linear-gradient(160deg, #D8B48A 0%, #C89E72 100%)" })} />
    {Array.from({ length: 9 }, (_, i) => (
      <div key={i} style={box({ left: 0, right: 0, top: 120 + i * 210, height: 4, backgroundColor: "rgba(120,80,40,0.12)" })} />
    ))}
    <div style={box({ inset: 0, background: "radial-gradient(circle at 60% 30%, rgba(255,220,150,0.45) 0%, rgba(255,220,150,0) 60%)", opacity: lamp })} />
    <div
      style={box({
        left: PAPER.x,
        top: PAPER.y,
        width: PAPER.w,
        height: PAPER.h,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 18px 40px rgba(70,40,10,0.28)",
        transform: `scaleY(${0.12 + 0.88 * unfold}) rotate(${(1 - unfold) * -3}deg)`,
        transformOrigin: "50% 50%",
        overflow: "hidden",
      })}
    >
      <div style={box({ left: 0, right: 0, top: PAPER.h / 2 - 2, height: 4, backgroundColor: "rgba(20,40,75,0.08)" })} />
      {children}
    </div>
  </>
);

// Экран ноутбука: поиск → результат BalaGo → страница сервиса.
const Search: React.FC<{ readonly f: number }> = ({ f }) => {
  const typed = S.query.slice(0, Math.max(0, Math.floor(f * 1.25)));
  const results = easeOut(prog(f, 46, 10));
  const hover = prog(f, 62, 6);
  const click = f >= 74 && f < 82 ? 0.97 : 1;
  const page = easeInOut(prog(f, 82, 10));
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F7FB", fontFamily: "Nunito" })}>
      <div style={box({ left: 40, right: 40, top: 60, height: 96, borderRadius: 48, backgroundColor: "#FFFFFF", boxShadow: "0 6px 16px rgba(20,40,75,0.12)", display: "flex", alignItems: "center", padding: "0 34px", fontSize: 34, fontWeight: 800, color: NAVY, overflow: "hidden", whiteSpace: "nowrap" })}>
        <svg width={40} height={40} viewBox="0 0 24 24" style={{ marginRight: 18, flexShrink: 0 }}>
          <circle cx={10} cy={10} r={6.5} fill="none" stroke={NAVY_SOFT} strokeWidth={2.6} />
          <path d="M 15 15 L 21 21" stroke={NAVY_SOFT} strokeWidth={2.6} strokeLinecap="round" />
        </svg>
        {typed}
        {f < 46 && Math.floor(f / 6) % 2 === 0 ? <span style={{ color: NAVY_SOFT }}>|</span> : null}
      </div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={box({
            left: 40,
            right: 40,
            top: 200 + i * 230,
            height: 200,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
            boxShadow: i === 0 && hover > 0 ? `0 0 0 ${6 * hover}px ${YELLOW}, 0 10px 24px rgba(20,40,75,0.16)` : "0 4px 12px rgba(20,40,75,0.08)",
            opacity: results * (i === 0 ? 1 : 0.55),
            transform: `translateY(${(1 - results) * 30}px) scale(${i === 0 ? click : 1})`,
            padding: "26px 30px",
            boxSizing: "border-box",
          })}
        >
          {i === 0 ? (
            <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
              <Img src={staticFile("assets/logo.png")} style={{ width: 110, height: 110, borderRadius: 55 }} />
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#1E7A44" }}>{S.resultUrl}</div>
                <div style={{ fontSize: 40, fontWeight: 1000, color: NAVY, lineHeight: 1.1 }}>{S.resultTitle}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: NAVY_SOFT, display: "flex", alignItems: "center" }}>
                  <ArrowText text={S.resultText} size={28} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={box({ left: 30, top: 34, width: 380, height: 26, borderRadius: 13, backgroundColor: "#E3E9F2" })} />
              <div style={box({ left: 30, top: 84, width: 640, height: 22, borderRadius: 11, backgroundColor: "#EDF1F6" })} />
              <div style={box({ left: 30, top: 124, width: 520, height: 22, borderRadius: 11, backgroundColor: "#EDF1F6" })} />
            </>
          )}
        </div>
      ))}
      {/* курсор */}
      {f >= 50 && page < 1 ? (
        <svg width={44} height={56} viewBox="0 0 22 28" style={box({ left: keys(f, [[50, 820], [64, 560]]), top: keys(f, [[50, 700], [64, 300]]) })}>
          <path d="M 2 2 L 2 22 L 7.5 17 L 11 25 L 14.5 23.5 L 11 15.5 L 18 15.5 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={2} strokeLinejoin="round" />
        </svg>
      ) : null}
      {page > 0 ? (
        <div style={box({ inset: 0, backgroundColor: "#FFFFFF", opacity: page, padding: "70px 50px", boxSizing: "border-box" })}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: 130, height: 130, borderRadius: 65 }} />
            <div>
              <div style={{ fontSize: 70, fontWeight: 1000, color: NAVY, lineHeight: 1 }}>BalaGo</div>
              <div style={{ fontSize: 34, fontWeight: 900, color: NAVY_SOFT }}>Бишкек • Балдар үчүн такси</div>
            </div>
          </div>
          <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", padding: "14px 30px", borderRadius: 40, backgroundColor: YELLOW, fontSize: 44, fontWeight: 1000, color: NAVY }}>
            <ArrowText text="ҮЙ → МЕКТЕП → ҮЙ" size={44} />
          </div>
          <div style={{ marginTop: 30, padding: "24px 28px", borderRadius: 26, backgroundColor: YELLOW_SOFT, fontSize: 36, fontWeight: 900, color: NAVY, lineHeight: 1.25 }}>{S.resultText.split("•")[1]?.trim()}</div>
        </div>
      ) : null}
    </div>
  );
};

export const drawingKeys = (tl: SceneProps["tl"]) => {
  const m02 = cueFrames(tl, "m02");
  return {
    m02,
    unfold: [0, 18] as const,
    a1: [20, 46] as const,
    a2: [46, 74] as const,
    loopAt: wordFrame(tl, "m02", "күн", 0.05),
    trace: [m02.from - 6, m02.to] as const,
    search: m02.to + 10,
  };
};

export const Drawing: React.FC<SceneProps> = ({ t, tl }) => {
  const { f } = local(tl, "drawing", t);
  const k = drawingKeys(tl);
  const unfold = easeOut(prog(f, k.unfold[0], k.unfold[1] - k.unfold[0]));
  const a1 = easeInOut(prog(f, k.a1[0], k.a1[1] - k.a1[0]));
  const a2 = easeInOut(prog(f, k.a2[0], k.a2[1] - k.a2[0]));
  const loop = easeInOut(prog(f, k.loopAt + 6, 26));
  // мелок сына идёт за кончиком рисуемой стрелки
  const crayonTip = f < k.a1[1] ? onCurve(A1, a1) : onCurve(A2, a2);
  const sonHand = f >= k.a1[0] - 6 && f < k.a2[1] + 14;
  const sonOut = prog(f, k.a2[1] + 2, 12);
  // мамин палец обводит обе стрелки — «ушул жол»
  const trace = prog(f, k.trace[0], k.trace[1] - k.trace[0]);
  const tracePts: Vec[] = [...A1, ...A2.slice().reverse()];
  const fingerAt = glide(Math.round(trace * 100), 0, 100, tracePts);
  const momIn = easeOut(prog(f, k.trace[0] - 10, 12)) * (1 - easeInOut(prog(f, k.search - 6, 8)));
  const lap = easeInOut(prog(f, k.search, 10));
  const z = keys(f, [[0, 1.0], [k.a2[1], 1.04], [k.trace[1], 1.08]]);
  return (
    <div style={box({ inset: 0, overflow: "hidden" })}>
      <div style={box({ inset: 0, transform: `scale(${z})`, transformOrigin: "50% 45%" })}>
        <TableTop unfold={unfold}>
          <ClockDrawing f={f} a1={a1} a2={a2} loop={loop} />
        </TableTop>
        {sonHand ? (
          <TopHand x={PAPER.x + crayonTip.x + 30} y={PAPER.y + crayonTip.y + 140 + sonOut * 900} angle={-18} sleeve="#2F4A7A" crayon={f < k.a1[1] ? "#E8463A" : "#22A06B"} s={0.95} />
        ) : null}
        {momIn > 0 ? (
          <TopHand x={PAPER.x + fingerAt.x + (1 - momIn) * 600} y={PAPER.y + fingerAt.y + 100 + (1 - momIn) * 500} angle={-32} sleeve="#C4614F" skin="#E4B28C" point s={1.05} />
        ) : null}
      </div>
      {/* ноутбук мамы: поиск школьной поездки */}
      {lap > 0 ? (
        <div style={box({ left: 30, right: 30, top: 230 + (1 - lap) * 1700, height: 1240, borderRadius: 40, backgroundColor: "#2A3142", padding: 26, boxSizing: "border-box", boxShadow: "0 30px 60px rgba(20,40,75,0.35)" })}>
          <div style={box({ left: 26, right: 26, top: 26, bottom: 26, borderRadius: 22, overflow: "hidden" })}>
            <Search f={f - k.search - 8} />
          </div>
        </div>
      ) : null}
      {lap > 0 ? <div style={box({ left: 0, right: 0, top: 1460 + (1 - lap) * 600, height: 80, backgroundColor: "#8F98A8", borderRadius: 20 })} /> : null}
      {f < k.search ? null : (
        <div style={box({ left: 0, right: 0, top: 1540, bottom: 0, background: "linear-gradient(160deg, #D8B48A 0%, #C89E72 100%)", opacity: lap })} />
      )}
      <div style={box({ left: 46, top: 200, opacity: popScale(prog(f, 4, 10)) > 0 ? 1 - lap : 0, padding: "8px 24px", borderRadius: 30, backgroundColor: "#FFFFFF", fontSize: 34, fontWeight: 1000, color: NAVY, boxShadow: "0 8px 20px rgba(20,40,75,0.16)" })}>
        {BG13_TEXT.hook.day} • 20:45
      </div>
    </div>
  );
};
