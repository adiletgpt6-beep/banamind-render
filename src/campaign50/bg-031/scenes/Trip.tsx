// Сцена 3 (≈19–32 с): внутри того же чека открывается окно — маленькая
// кинематографичная сцена на всю высоту кадра. Условный пример (плашка
// «Шарттуу мисал»): улица Бишкека, горы Ала-Тоо, панельный дом и школа.
// «…эртең менен мектепке барууну» — белая машина с одним пристёгнутым
// ребёнком едет от дома к школе (утро); «…сабактан кийин» — школьный
// звонок, свет становится тёплым дневным; «…үйгө кайтууну» — машина
// везёт ребёнка обратно домой. Сверху собирается «ҮЙ → МЕКТЕП → ҮЙ» и
// «Бир бала • бир толук сапар». В конце окно сворачивается обратно в чек.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, cruise, easeInOut, easeOut, lerp } from "../../../two-schedules-2d/rig/motion";
import { Mountains } from "../../../two-schedules-2d/sets/Apartment";
import { PanelHouse, Tree } from "../../../two-schedules-2d/sets/Outdoor";
import { box, Depth, Shot } from "../../../two-schedules-2d/shots";
import { useScene, useWordAt } from "../context";
import { C } from "../palette";
import { R, ReceiptFront } from "../receipt";
import { BG31_TEXT } from "../script";
import { ArrowGlyph, ExampleTag, HomeIcon, rise, SchoolIcon, TableTop, WhiteCar } from "../ui";
import { MACRO, MACRO_CAM } from "./Unfold";

const W = 2700; // ширина улицы (мир)
const ROAD = 1440; // низ колёс машины
export const STREET = { home: 560, school: 2160 } as const;

// Окно внутри нижней половины чека (кадр).
const WIN = {
  left: MACRO.x + 250,
  right: MACRO.x + R.w - 40,
  top: MACRO.y + R.crease + 70,
  bottom: MACRO.y + R.crease + 450,
};

const School: React.FC<{ readonly x: number; readonly y: number }> = ({ x, y }) => (
  <div style={box({ left: x, top: y - 640, width: 760, height: 640 })}>
    <div style={box({ left: 0, top: 120, width: 760, height: 520, backgroundColor: "#F3E3B5" })} />
    <div style={box({ left: 260, top: 40, width: 240, height: 120, backgroundColor: "#EED89F" })} />
    <div style={box({ left: -16, top: 104, width: 792, height: 26, backgroundColor: "#B79F70", borderRadius: 4 })} />
    {Array.from({ length: 3 }).map((_, row) =>
      Array.from({ length: 6 }).map((__, col) => (
        <div key={`${row}-${col}`} style={box({ left: 36 + col * 122, top: 160 + row * 130, width: 82, height: 92, borderRadius: 6, backgroundColor: "#A9C6DE", border: "6px solid #FFFFFF", boxSizing: "border-box" })} />
      )),
    )}
    <div style={box({ left: 300, top: 440, width: 160, height: 200, backgroundColor: "#6B5444", borderRadius: "10px 10px 0 0" })} />
    <div style={box({ left: 210, top: 52, width: 340, height: 70, borderRadius: 14, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, fontSize: 46, fontWeight: 1000, textAlign: "center", lineHeight: "70px", letterSpacing: 2 })}>
      {BG31_TEXT.trip.school}
    </div>
    {/* ограда */}
    <div style={box({ left: -40, top: 560, width: 840, height: 80, backgroundImage: "repeating-linear-gradient(90deg, #5E6A7E 0 6px, transparent 6px 34px)", borderTop: "8px solid #5E6A7E" })} />
  </div>
);

const Street: React.FC<{ readonly day: number; readonly carX: number; readonly dir: 1 | -1; readonly wheel: number }> = ({ day, carX, dir, wheel }) => {
  const sky = `linear-gradient(180deg, ${mix("#BFDDF3", "#A9D2F2", day)} 0%, ${mix("#E3EEF5", "#F4EBD8", day)} 55%, ${mix("#FBE7CF", "#FFD9A3", day)} 100%)`;
  const sunX = lerp(380, 2200, day);
  const sunY = lerp(760, 420, Math.sin(day * Math.PI * 0.5));
  return (
    <div style={box({ left: 0, top: 0, width: W, height: 1920 })}>
      <div style={box({ left: -400, top: -200, width: W + 800, height: 1700, background: sky })} />
      <Depth depth={0.15}>
        <div style={box({ left: sunX - 70, top: sunY - 70, width: 140, height: 140, borderRadius: 70, backgroundColor: "#FFE7A0", boxShadow: "0 0 80px 40px rgba(255,220,140,0.45)" })} />
      </Depth>
      <Depth depth={0.25}>
        <Mountains x={-300} y={640} w={W + 900} h={420} />
      </Depth>
      <Depth depth={0.7}>
        <div style={box({ left: 1180, top: 1260, width: 1, height: 1, transform: "scale(0.72)", transformOrigin: "0 0" })}>
          <PanelHouse x={0} y={0} w={760} floors={6} color="#E6DCCC" seed={5} />
        </div>
        <Tree x={1080} y={1290} s={1.1} kind="poplar" />
        <Tree x={1700} y={1290} s={1.0} kind="poplar" tone={1} />
      </Depth>
      {/* дом ребёнка (слева) */}
      <div style={box({ left: 40, top: 1300, width: 1, height: 1, transform: "scale(0.98)", transformOrigin: "0 0" })}>
        <PanelHouse x={0} y={0} w={760} floors={5} color="#EADFCF" seed={3} door={380} />
      </div>
      <Tree x={880} y={1320} s={1.25} />
      <School x={1840} y={1310} />
      <Tree x={2640} y={1320} s={1.2} kind="poplar" />
      {/* тротуар, арык, дорога */}
      <div style={box({ left: -400, top: 1300, width: W + 800, height: 40, backgroundColor: "#D9D3C7" })} />
      <div style={box({ left: -400, top: 1340, width: W + 800, height: 220, backgroundColor: C.road })} />
      <div style={box({ left: -400, top: 1446, width: W + 800, height: 10, backgroundImage: "repeating-linear-gradient(90deg, #FFFFFF 0 70px, transparent 70px 150px)" })} />
      {/* ближний тротуар: плитка, бордюр, полоса газона с арыком */}
      <div style={box({ left: -400, top: 1560, width: W + 800, height: 24, backgroundColor: "#ECE7DD" })} />
      <div style={box({ left: -400, top: 1584, width: W + 800, height: 200, backgroundColor: "#DCD5C8", backgroundImage: "repeating-linear-gradient(90deg, rgba(120,110,90,0.18) 0 3px, transparent 3px 120px), repeating-linear-gradient(0deg, rgba(120,110,90,0.14) 0 3px, transparent 3px 66px)" })} />
      <div style={box({ left: -400, top: 1784, width: W + 800, height: 26, backgroundColor: "#B9B1A2" })} />
      <div style={box({ left: -400, top: 1810, width: W + 800, height: 600, backgroundColor: "#9CC27E" })} />
      <WhiteCar x={carX} y={ROAD} s={1.05} dir={dir} wheel={wheel} />
    </div>
  );
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const Bc = hex(b);
  const k = clamp(t);
  return `rgb(${A.map((v, i) => Math.round(v + (Bc[i] - v) * k)).join(",")})`;
};

const Chip: React.FC<{ readonly children: React.ReactNode; readonly style?: React.CSSProperties; readonly dark?: boolean }> = ({ children, style, dark }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 26px",
      borderRadius: 999,
      backgroundColor: dark ? C.navy : "rgba(255,255,255,0.95)",
      color: dark ? "#FFFFFF" : C.navy,
      fontFamily,
      fontWeight: 1000,
      boxShadow: "0 10px 26px rgba(20,40,90,0.16)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const TripScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const w0 = useWordAt("n03", 0);
  const wMorning = useWordAt("n03", 6);
  const wSchool = useWordAt("n03", 8);
  const wAfter = useWordAt("n03", 11);
  const wHome = useWordAt("n03", 13);
  const wEnd = useWordAt("n03", 15);
  // окно: раскрытие текста в сторону → окно → на весь кадр → обратно
  const hide = easeOut((f - 2) / 12) * (1 - easeOut((f - (frames - 8)) / 6));
  const open = easeInOut((f - 14) / 26);
  const close = easeInOut((f - (frames - 32)) / 22);
  const g = clamp(open - close);
  const ins = {
    top: lerp(WIN.top, 0, g),
    right: lerp(1080 - WIN.right, 0, g),
    bottom: lerp(1920 - WIN.bottom, 0, g),
    left: lerp(WIN.left, 0, g),
    r: lerp(26, 0, g),
  };
  // машина: утром дом → школа, после уроков школа → дом
  const t1a = wMorning - 6;
  const t1b = Math.max(t1a + 70, wSchool + 34);
  const t2a = Math.max(t1b + 16, wHome - 10);
  const t2b = Math.max(t2a + 70, wEnd + 24);
  const morning = cruise((f - t1a) / (t1b - t1a), 0.25);
  const back = cruise((f - t2a) / (t2b - t2a), 0.25);
  const carX = f < t2a ? lerp(STREET.home, STREET.school, morning) : lerp(STREET.school, STREET.home, back);
  const dir: 1 | -1 = f < t2a ? 1 : -1;
  const speed = f < t2a ? morning : back;
  const wheel = speed * 2400;
  const day = easeInOut((f - wAfter + 4) / 30);
  const camX = clamp(carX, 540, W - 540);
  const routeN = f >= wHome ? 3 : f >= wSchool ? 2 : f >= wMorning ? 1 : 0;
  const R3 = BG31_TEXT.trip.route;
  // надписи гаснут раньше, чем окно начинает сворачиваться
  const vis = clamp(open * 1.6 - 0.4) * (1 - easeOut((f - (frames - 38)) / 6));
  return (
    <>
      {/* чек на столе (под окном) */}
      <Shot f={f} from={0} to={100000} cam={MACRO_CAM} bg="#F3ECE0">
        <div style={{ position: "absolute", left: -600, top: -400, width: 2280, height: 2720 }}>
          <TableTop />
        </div>
        <div style={{ position: "absolute", left: MACRO.x, top: MACRO.y }}>
          <ReceiptFront fold={0} top={{ glow: 0, note: 1 }} bottom={{ hideText: hide }} />
        </div>
      </Shot>
      {/* окно-сцена */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${ins.top}px ${ins.right}px ${ins.bottom}px ${ins.left}px round ${ins.r}px)`, opacity: easeOut((f - 10) / 6) * (1 - easeOut((f - (frames - 10)) / 6)) }}>
        <Shot f={f} from={0} to={100000} cam={{ x: camX, y: lerp(1250, 1050, g), zoom: lerp(0.62, 1, g) }}>
          <Street day={day} carX={carX} dir={dir} wheel={wheel} />
        </Shot>
        {/* надписи (кадр, безопасная зона) */}
        <div style={{ opacity: vis }}>
          <div style={{ position: "absolute", left: 90, right: 150, top: 340, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
            <div style={{ ...rise(f, Math.max(32, w0)) }}>
              <Chip dark style={{ fontSize: 44 }}>
                {BG31_TEXT.trip.badge}
              </Chip>
            </div>
            <div style={{ ...rise(f, Math.max(34, wMorning)) }}>
              <Chip style={{ fontSize: 52, padding: "12px 30px", border: `4px solid ${C.yellow}` }}>
                {R3.map((p, i) =>
                  i < routeN ? (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", opacity: easeOut((f - [wMorning, wSchool, wHome][i]) / 8) }}>
                      {i > 0 ? <ArrowGlyph /> : null}
                      {i === 1 ? <SchoolIcon size={50} /> : <HomeIcon size={50} />}
                      <span style={{ marginLeft: 8 }}>{p}</span>
                    </span>
                  ) : null,
                )}
              </Chip>
            </div>
            <div style={{ ...rise(f, Math.max(36, wMorning + 4)) }}>
              <Chip style={{ fontSize: 38, backgroundColor: f >= wAfter ? "#FFE9C2" : "rgba(255,255,255,0.95)" }}>{f >= wAfter ? BG31_TEXT.trip.afternoon : BG31_TEXT.trip.morning}</Chip>
            </div>
          </div>
        </div>
      </div>
      {/* «Шарттуу мисал» — всё время, пока видна поездка: в углу окна */}
      {f >= 10 && f < frames - 6 && g < 0.999 ? <ExampleTag f={f} at={10} left={Math.max(90, ins.left + 14)} top={Math.max(262, ins.top + 14)} /> : null}
      {g >= 0.999 ? <ExampleTag f={f} at={10} /> : null}
    </>
  );
};
