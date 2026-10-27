// Сцена 5: полный маршрут и точные условия.
// Диктор: «BalaGo — Бишкектеги балдар үчүн такси: үйдөн мектепке, кайра
// үйгө. Каттамга ылайыктуу топ түзүлгөндөн кийин биринчи толук сыноо
// сапары акысыз.»
//
// Два мира становятся одной картой Бишкека: белая машина едет ҮЙ →
// МЕКТЕП на слове «мектепке» и обратно на «кайра үйгө». Затем —
// условный пример (помечен «Шарттуу мисал»): дети на своих местах
// заднего сиденья с пристёгнутыми ремнями, и условия: группа 3–4 по
// местам, поиск до 2 недель, первая полная пробная поездка бесплатно
// после формирования группы.
import { useCurrentFrame } from "remotion";
import { Actor, type Place } from "../../../two-schedules-2d/rig/Actor";
import { clamp, easeInOut, easeOut } from "../../../two-schedules-2d/rig/motion";
import { CabinBack } from "../../../two-schedules-2d/sets/CarViews";
import { Mountains } from "../../../two-schedules-2d/sets/Apartment";
import { CarTopView } from "../../../components/CarTopView";
import { fontFamily } from "../../../fonts";
import { box, useWord } from "../context";
import { BG19_TEXT } from "../script";
import { RouteIcon } from "../screens";
import { NAVY, YELLOW } from "../sets";

// Путь по улицам (px кадра): дом слева внизу → школа справа вверху.
const HOME_P = { x: 230, y: 1210 };
const SCHOOL_P = { x: 830, y: 640 };
const PATH = [HOME_P, { x: 230, y: 930 }, { x: 560, y: 930 }, { x: 560, y: 640 }, SCHOOL_P];
const BACK = [...PATH].reverse();
const lenOf = (pts: readonly { x: number; y: number }[]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
const along = (pts: readonly { x: number; y: number }[], u: number) => {
  let d = clamp(u) * lenOf(pts);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l || i === pts.length - 1) {
      const k = l ? Math.min(1, d / l) : 0;
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, ang: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90 };
    }
    d -= l;
  }
  return { ...pts[pts.length - 1], ang: 0 };
};
const poly = (pts: readonly { x: number; y: number }[], dx = 0) => pts.map((p) => `${p.x + dx},${p.y + dx}`).join(" ");

// Карта: кварталы, парк, горы Ала-Тоо, дом и школа.
const CityMap: React.FC<{ f: number; go: number; arrive: number; back: number; home: number }> = ({ f, go, arrive, back, home }) => {
  const u1 = easeInOut((f - go) / Math.max(1, arrive - go));
  const u2 = easeInOut((f - back) / Math.max(1, home - back));
  const car = f < back ? along(PATH, u1) : along(BACK, u2);
  const drawn1 = clamp((f - go + 6) / Math.max(1, arrive - go));
  const drawn2 = clamp((f - back + 6) / Math.max(1, home - back));
  const L = lenOf(PATH);
  const pulse = (t0: number) => (f >= t0 ? 1 + 0.12 * Math.sin(clamp((f - t0) / 14) * Math.PI) : 1);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F3F6FA" })}>
      <Mountains x={-80} y={300} w={1240} h={260} />
      <div style={box({ left: 0, top: 520, width: 1080, height: 1400, backgroundColor: "#EEF1F5" })} />
      {/* кварталы */}
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <div key={`${r}-${c}`} style={box({ left: 30 + c * 260, top: 560 + r * 220, width: 220, height: 180, borderRadius: 18, backgroundColor: (r + c) % 3 === 0 ? "#DDEBD5" : "#E6E1D8" })} />
        )),
      )}
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <polyline points={poly(PATH)} fill="none" stroke="#FFFFFF" strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={poly(PATH)} fill="none" stroke={YELLOW} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${L * drawn1} ${L}`} />
        <polyline points={poly(BACK, 14)} fill="none" stroke={NAVY} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${L * drawn2} ${L}`} opacity={0.7} />
      </svg>
      {[
        { p: HOME_P, kind: "home" as const, label: BG19_TEXT.route.home, t: home, dx: -10, dy: 70 },
        { p: SCHOOL_P, kind: "school" as const, label: BG19_TEXT.route.school, t: arrive, dx: 0, dy: 70 },
      ].map((m) => (
        <div key={m.kind} style={box({ left: m.p.x - 90 + m.dx, top: m.p.y - 260, width: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, scale: `${pulse(m.t)}` })}>
          <div style={{ width: 132, height: 132, borderRadius: 66, backgroundColor: "#FFFFFF", boxShadow: "0 10px 24px rgba(20,40,90,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RouteIcon kind={m.kind} size={100} />
          </div>
          <div style={{ padding: "6px 18px", borderRadius: 999, backgroundColor: NAVY, color: "#FFFFFF", fontFamily, fontSize: 32, fontWeight: 900 }}>{m.label}</div>
        </div>
      ))}
      <div style={box({ left: car.x - 34, top: car.y - 60, width: 68, height: 120, rotate: `${car.ang}deg` })}>
        <CarTopView size={120} />
      </div>
    </div>
  );
};

// Задний ряд: три ребёнка на своих местах, ремни пристёгнуты.
const KIDS: readonly { look: "son" | "kidA" | "daughter"; place: Place; face: number }[] = [
  { look: "kidA", place: { x: 300, y: 1330, h: 560 }, face: 0.2 },
  { look: "son", place: { x: 540, y: 1330, h: 590 }, face: 0 },
  { look: "daughter", place: { x: 780, y: 1330, h: 640 }, face: -0.2 },
];
const Belt: React.FC<{ p: Place; build: "child" | "teen" }> = ({ p }) => {
  // плечевая лямка: от плеча (слева в кадре) к замку у бедра справа
  const k = p.h / 1000;
  const sh = { x: p.x - 62 * k, y: p.y - 300 - 210 * k };
  const hip = { x: p.x + 70 * k, y: p.y - 300 + 10 * k };
  const lapL = { x: p.x - 80 * k, y: p.y - 300 + 2 * k };
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
      <line x1={sh.x} y1={sh.y} x2={hip.x} y2={hip.y} stroke="#2A2E36" strokeWidth={30 * k + 6} strokeLinecap="round" />
      <line x1={sh.x} y1={sh.y} x2={hip.x} y2={hip.y} stroke="#3B414D" strokeWidth={18 * k + 4} strokeLinecap="round" />
      <line x1={lapL.x} y1={lapL.y} x2={hip.x} y2={hip.y} stroke="#2A2E36" strokeWidth={26 * k + 6} strokeLinecap="round" />
      <rect x={hip.x - 12} y={hip.y - 10} width={26} height={20} rx={5} fill="#C9CED6" />
    </svg>
  );
};

const RearSeatExample: React.FC<{ f: number }> = ({ f }) => (
  <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
    <CabinBack />
    {KIDS.map((k, i) => (
      <Actor key={k.look} uid={`r5-${k.look}`} look={k.look} f={f} place={() => k.place} face={() => k.face} seed={11 + i} pose={() => ({ expr: "softSmile", sit: 1, seat: 300, packOff: true, armL: { target: { x: k.place.x - 0.12 * k.place.h, y: 1035 }, shape: "relax", elbow: "down" }, armR: { target: { x: k.place.x + 0.12 * k.place.h, y: 1035 }, shape: "relax", elbow: "down" } })} />
    ))}
    {/* подушка сиденья перед ногами (вид спереди) */}
    <div style={box({ left: 130, top: 1080, width: 820, height: 260, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
    {KIDS.map((k) => (
      <Belt key={k.look} p={k.place} build="child" />
    ))}
  </div>
);

const Chip: React.FC<{ text: string; sub?: string; a: number; strong?: boolean }> = ({ text, sub, a, strong }) => (
  <div style={{ opacity: a, translate: `0 ${(1 - a) * 24}px`, padding: "20px 30px", borderRadius: 28, backgroundColor: strong ? YELLOW : "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,90,0.14)", fontFamily, color: NAVY }}>
    <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.15 }}>{text}</div>
    {sub ? <div style={{ fontSize: 32, fontWeight: 800, color: "#3A4F80", marginTop: 4 }}>* {sub}</div> : null}
  </div>
);

export const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const go = useWord("n4", 5); // «үйдөн»
  const arrive = useWord("n4", 7); // «кайра»
  const home = useWord("n4", 9); // «Каттамга»
  const phaseB = home + 6;
  const w10 = useWord("n4", 10); // «ылайыктуу»
  const w12 = useWord("n4", 12); // «түзүлгөндөн»
  const w15 = useWord("n4", 15); // «толук»
  const toB = easeInOut((f - phaseB) / 18);
  const intro = easeOut(f / 14);
  const r = BG19_TEXT.route;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F3F6FA", fontFamily })}>
      {/* карта: из маршрута на странице — к карте города */}
      <div style={box({ left: 0, top: 0, width: 1080, height: 1920, opacity: 1 - clamp(toB * 1.8), scale: `${(0.92 + 0.08 * intro) * (1 - 0.08 * toB)}`, transformOrigin: "540px 900px" })}>
        <CityMap f={f} go={go} arrive={arrive} back={arrive + 4} home={home} />
        <div style={box({ left: 90, top: 270, padding: "12px 28px", borderRadius: 999, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 44, fontWeight: 900 })}>{r.city}</div>
        <div style={box({ left: 90, right: 150, top: 1290, display: "flex", justifyContent: "center" })}>
          <Chip text={r.full} a={easeOut((f - arrive) / 10)} strong />
        </div>
      </div>
      {/* условный пример + условия */}
      {toB > 0 ? (
        <div style={box({ inset: 0, opacity: clamp(toB * 1.8 - 0.8) })}>
          <div style={box({ left: 60, top: 260, width: 960, height: 600, borderRadius: 40, overflow: "hidden", boxShadow: "0 18px 40px rgba(20,40,90,0.2)", translate: `0 ${(1 - toB) * 40}px` })}>
            <div style={box({ left: 0, top: 0, width: 1080, height: 1920, scale: "0.89", transformOrigin: "0 0", translate: "-0px -540px" })}>
              <RearSeatExample f={f} />
            </div>
            <div style={box({ left: 24, top: 22, padding: "8px 22px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.92)", color: NAVY, fontSize: 32, fontWeight: 900 })}>{r.example}</div>
            <div style={box({ left: 24, right: 24, bottom: 20, padding: "10px 18px", borderRadius: 18, backgroundColor: "rgba(20,40,90,0.78)", color: "#FFFFFF", fontSize: 30, fontWeight: 800, textAlign: "center" })}>{r.belts}</div>
          </div>
          <div style={box({ left: 60, right: 150, top: 900, display: "flex", flexDirection: "column", gap: 20 })}>
            <Chip text={r.group} a={easeOut((f - w10) / 10)} />
            <Chip text={r.search} a={easeOut((f - w12) / 10)} />
            <Chip text={r.trial} sub={r.trialNote} a={easeOut((f - w15) / 10)} strong />
          </div>
        </div>
      ) : null}
    </div>
  );
};
