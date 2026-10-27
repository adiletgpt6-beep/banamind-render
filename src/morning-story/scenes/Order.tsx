import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS } from "../../config";
import { fontFamily } from "../../fonts";
import { ARM, Character, mixArm, type Arm, type Expr } from "../Character";
import { Apartment } from "../sets";
import { ClockFace, hhmm, INK, Phone } from "../props";
import { TaxiApp, type AppState } from "../screens";
import { MS_TEXT } from "../script";
import { useLineCue, useMouth, useSceneLength, useWordCue } from "../StoryContext";
import { Cam, Caption, Chip, clampCam, Feet, keys, Panel, ramp } from "../ui";
import { HOME_END_CAM, PHONE_BIG } from "./Home";

const C = MS_TEXT.captions;

// Положение телефона в сценах 3–4 (экранные координаты: центр и ширина).
const PHONE_S4 = { w: 520, cx: 640, cy: 960 } as const;
const PIP = { w: 300, cx: 820, cy: 600 } as const;

const phoneBox = (p: { w: number; cx: number; cy: number }) => ({
  left: p.cx - p.w / 2,
  top: p.cy - (p.w * 2.05) / 2,
});
const lerpP = (
  a: { w: number; cx: number; cy: number },
  b: { w: number; cx: number; cy: number },
  t: number,
) => ({
  w: a.w + (b.w - a.w) * t,
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
});

// Затемнённая квартира — фон сцен 3–4 (тот же кадр, что в конце сцены 2).
const DimHome: React.FC<{ clock: number }> = ({ clock }) => (
  <>
    <Cam {...HOME_END_CAM}>
      <Apartment light={1} clockMinutes={clock} />
    </Cam>
    <AbsoluteFill style={{ backgroundColor: "rgba(20,30,55,0.5)" }} />
  </>
);

// Палец, нажимающий на экран (кружок + волна).
const Tap: React.FC<{ x: number; y: number; frame: number; at: number }> = ({
  x,
  y,
  frame,
  at,
}) => {
  const p = frame - at;
  if (p < -8 || p > 16) return null;
  const press = ramp(frame, at - 8, at);
  const wave = ramp(frame, at, at + 14);
  return (
    <div style={{ position: "absolute", left: x - 60, top: y - 60, width: 120, height: 120 }}>
      <div style={{ position: "absolute", inset: 30 - 50 * wave, borderRadius: 999, border: `6px solid rgba(255,255,255,${0.9 * (1 - wave)})` }} />
      <div style={{ position: "absolute", left: 32, top: 32, width: 56, height: 56, borderRadius: 28, backgroundColor: `rgba(255,255,255,${0.75 * press * (1 - wave * 0.6)})`, boxShadow: "0 6px 16px rgba(0,0,0,0.25)" }} />
    </div>
  );
};

// Точка внутри экрана телефона → экран (для касаний).
const onScreen = (p: { w: number; cx: number; cy: number }, sx: number, sy: number) => {
  const k = p.w / 600;
  const b = phoneBox(p);
  return { x: b.left + (22 + sx) * k, y: b.top + (22 + sy) * k };
};

// ---------- Сцена 3: апа такси чакырат ----------
export const OrderScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s03Order");
  const wA = useWordCue("s03Order", "n02", "мойнуна");
  const wB = useWordCue("s03Order", "n02", "жумушка");
  const wC = useWordCue("s03Order", "n02", "кызын");
  const tapAt = 20;
  const shrink = ramp(t, 30, 52);
  const back = ramp(t, len - 26, len);
  const p =
    back > 0
      ? lerpP(PIP, PHONE_S4, back)
      : lerpP(PHONE_BIG, PIP, shrink);
  const state: AppState = t < tapAt + 2 ? "order" : back > 0.5 ? "found" : "searching";
  const clock = 7 * 60 + 22 + ramp(t, 0, len, 0, 8);
  const aIn = ramp(t, Math.max(40, wA - 10), Math.max(56, wA + 6));
  const bIn = ramp(t, Math.max(60, wB - 10), Math.max(76, wB + 6));
  const cIn = ramp(t, Math.max(80, wC - 8), Math.max(94, wC + 6));
  const out = ramp(t, len - 30, len - 10);
  const tap = onScreen(PHONE_BIG, 278, 960);
  const hair = Math.sin(t / 5) * 10;
  const jacket = ramp(t, Math.max(70, wB), Math.max(110, wB + 40));
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <DimHome clock={clock} />
      {/* A: волосы у зеркала */}
      <Panel x={90 - 800 * out} y={270} w={540} h={520} bg="#F3E7D7" style={{ translate: `${(1 - aIn) * -800}px 0px`, visibility: aIn > 0 && out < 1 ? "visible" : "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 160, height: 520, background: "linear-gradient(160deg, #EAF4FB, #CFE3F2)" }} />
        <div style={{ position: "absolute", left: 120, top: 40 }}>
          <Character kind="mom" height={1150} expr="worried" armL={[ARM.hair[0] + hair, ARM.hair[1]]} armR={mixArm(ARM.down, ARM.chin, 0.5 + 0.5 * Math.sin(t / 9))} look={-1} bag seed={4} />
        </div>
      </Panel>
      {/* B: куртка дочери и сумка */}
      <Panel x={90} y={880 + 1200 * out} w={900} h={560} bg="#EFE4D3" style={{ translate: `0px ${(1 - bIn) * 1200}px`, visibility: bIn > 0 && out < 1 ? "visible" : "hidden" }}>
        <div style={{ position: "absolute", left: 110, top: 40 }}>
          <Character kind="mom" height={1000} expr="worried" armL={mixArm(ARM.down, [-250, 560], jacket)} armR={mixArm(ARM.hold, [-220, 520], jacket)} look={1} headTilt={8} bag seed={5} />
        </div>
        <div style={{ position: "absolute", left: 470, top: 150 }}>
          <Character kind="girl" height={640} expr="calm" jacket={jacket > 0.5 ? "#6CB4C6" : undefined} armL={mixArm(ARM.down, [-200, 330], jacket - ramp(t, wB + 46, wB + 60))} armR={ARM.relaxed} look={-0.6} seed={6} />
        </div>
        {/* часы в углу кадра */}
        <div style={{ position: "absolute", right: 30, top: 26, scale: `${0.8 + 0.2 * cIn}`, opacity: cIn }}>
          <ClockFace size={190} minutes={clock} />
        </div>
      </Panel>
      <Phone w={p.w} style={phoneBox(p)}>
        <TaxiApp state={state} spinner={t} pressed={t >= tapAt - 4 && t < tapAt + 6 ? 1 : 0} car={{ x: 430, y: 250, angle: 90 }} />
      </Phone>
      <Tap x={tap.x} y={tap.y} frame={t} at={tapAt} />
    </AbsoluteFill>
  );
};

// Реакция мамы в круглом окне (крупный план).
const MomBubble: React.FC<{
  x: number;
  y: number;
  r: number;
  expr: Expr;
  mouth: number;
  look?: number;
  armL?: Arm;
  item?: "phone" | "none";
}> = ({ x, y, r, expr, mouth, look = 0, armL = ARM.down, item = "none" }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r, overflow: "hidden", backgroundColor: "#F3E7D7", border: "10px solid #FFFFFF", boxShadow: "0 20px 50px rgba(20,40,90,0.3)", boxSizing: "border-box" }}>
    {/* крупный план: голова и плечи (рисунок ×6.5 радиуса) */}
    <div style={{ position: "absolute", left: r - 0.2 * 6.5 * r - 10, top: r - 0.17 * 6.5 * r }}>
      <Character kind="mom" height={6.5 * r} expr={expr} mouth={mouth} look={look} armL={armL} itemL={item} seed={7} />
    </div>
  </div>
);

// Цифровые часы «ускоренного» времени.
const BigTime: React.FC<{ minutes: number; flip: number; style?: React.CSSProperties }> = ({ minutes, flip, style }) => (
  <div style={{ position: "absolute", padding: "14px 30px", borderRadius: 26, backgroundColor: INK, color: "#FFFFFF", fontFamily, fontWeight: 900, fontSize: 84, letterSpacing: 2, fontVariantNumeric: "tabular-nums", boxShadow: "0 18px 40px rgba(20,40,90,0.3)", scale: `${1 + 0.06 * flip}`, ...style }}>
    {hhmm(minutes)}
  </div>
);

// ---------- Сцена 4: биринчи такси ----------
export const FirstTaxiScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s04First");
  const m02 = useLineCue("s04First", "m02");
  const m03 = useLineCue("s04First", "m03");
  const mouth = useMouth("s04First", "mother");
  // время: 07:31 → 07:34 → 07:37 (ускоренно), затем 07:38
  const steps = [30, 58, 86];
  const minutes =
    7 * 60 + 31 + (t >= steps[1] ? 3 : 0) + (t >= steps[2] ? 3 : 0) + (t >= m03.start ? 1 : 0);
  const flip = steps.reduce((a, s) => a + (ramp(t, s, s + 4) - ramp(t, s + 4, s + 10)), 0);
  const callAt = m02.end + 12;
  const cancelAt = m03.end + 10;
  const state: AppState = t < callAt ? "found" : t < cancelAt ? "calling" : "order";
  const ring = ((t - callAt) % 30) / 30;
  const jitter = Math.sin(t / 3) * 2;
  const expr: Expr = t < m02.start - 10 ? "neutral" : t < m03.end + 20 ? "worried" : "annoyed";
  const callTap = onScreen(PHONE_S4, 470, 960);
  const cancelTap = onScreen(PHONE_S4, 278, 1080);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <DimHome clock={7 * 60 + 30 + t / 60} />
      <Phone w={PHONE_S4.w} style={phoneBox(PHONE_S4)}>
        <TaxiApp state={state} car={{ x: 432 + jitter, y: 250, angle: 90 }} ring={ring} />
      </Phone>
      <Tap x={callTap.x} y={callTap.y} frame={t} at={callAt} />
      <Tap x={cancelTap.x} y={cancelTap.y} frame={t} at={cancelAt} />
      <BigTime minutes={minutes} flip={flip} style={{ left: 60, top: 780 }} />
      <MomBubble x={240} y={1290} r={185} expr={expr} mouth={mouth} look={0.8} />
      <Caption text={C.time} frame={t} at={14} out={len - 12} />
    </AbsoluteFill>
  );
};

// ---------- Сцена 5: экинчи такси алыста ----------
export const SecondTaxiScene: React.FC = () => {
  const t = useCurrentFrame();
  const len = useSceneLength("s05Second");
  const d01 = useLineCue("s05Second", "d01");
  const m04 = useLineCue("s05Second", "m04");
  const mouthMom = useMouth("s05Second", "mother");
  const mouthGirl = useMouth("s05Second", "daughter");
  const tapAt = 18;
  const state: AppState = t < tapAt + 2 ? "order" : t < tapAt + 16 ? "searching" : "eta";
  const zoom = keys(t, [[tapAt + 16, 1], [tapAt + 40, 0.5]]);
  const turn = t > m04.end + 10;
  const momExpr: Expr = t < d01.end ? "worried" : t < m04.end + 6 ? "smile" : "worried";
  const bend = ramp(t, d01.end - 6, d01.end + 8) - ramp(t, m04.end + 2, m04.end + 14);
  const card = ramp(t, 0, 16);
  const cam = clampCam({ x: keys(t, [[0, 640], [len, 610]]), y: 1180, scale: keys(t, [[0, 1.1], [len, 1.16]]) });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Cam {...cam}>
        {/* прихожая */}
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#EFE3D2" }} />
        <div style={{ position: "absolute", left: 640, top: 760, width: 330, height: 700, borderRadius: "18px 18px 0 0", backgroundColor: "#B88B62", border: "16px solid #FFFFFF", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 920, top: 1090, width: 22, height: 22, borderRadius: 11, backgroundColor: "#E5B300" }} />
        <div style={{ position: "absolute", left: 90, top: 820, width: 420, height: 16, borderRadius: 8, backgroundColor: "#9A6844" }} />
        {[150, 260, 370].map((x, i) => (
          <div key={x} style={{ position: "absolute", left: x, top: 836, width: 70, height: 170, borderRadius: "30px 30px 14px 14px", backgroundColor: ["#5D6D82", "#8A5E48", "#E07A5F"][i] }} />
        ))}
        <div style={{ position: "absolute", left: 0, top: 1460, width: 1080, height: 460, backgroundColor: "#D9C2A2" }} />
        <div style={{ position: "absolute", left: 0, top: 1446, width: 1080, height: 18, backgroundColor: "#FFFFFF" }} />
        <Feet x={turn ? 360 : 340} y={1750} height={1000}>
          <Character kind="mom" height={1000} expr={momExpr} mouth={mouthMom} look={turn ? -0.6 : 0.9} headTilt={10 * bend} tilt={4 * bend} armR={mixArm(ARM.down, [-210, 560], bend)} armL={turn ? mixArm(ARM.down, ARM.phoneLook, ramp(t, m04.end + 10, m04.end + 20)) : ARM.down} itemL={turn ? "phone" : "none"} bag flip={turn} seed={8} />
        </Feet>
        <Feet x={590} y={1760} height={640}>
          <Character kind="girl" height={640} expr={t > d01.start - 10 && t < m04.end ? "neutral" : "calm"} mouth={mouthGirl} look={-1} headTilt={t > d01.start - 10 && t < m04.end + 10 ? -8 : 0} jacket="#6CB4C6" backpack seed={9} />
        </Feet>
      </Cam>
      {/* телефон с новым заказом */}
      <div style={{ position: "absolute", left: 640, top: 430, opacity: card, translate: `0px ${(1 - card) * 40}px` }}>
        <Phone w={300} style={{ left: 0, top: 0 }}>
          <TaxiApp state={state} spinner={t} zoom={zoom} car={{ x: 60, y: -40, angle: 140 }} pressed={t >= tapAt - 4 && t < tapAt + 6 ? 1 : 0} />
        </Phone>
      </div>
      {state === "eta" ? (
        <div style={{ position: "absolute", left: 646, top: 1080, scale: `${ramp(t, tapAt + 20, tapAt + 30)}` }}>
          <Chip size={60} bg={COLORS.yellow} color={INK}>
            {MS_TEXT.app.eta}
          </Chip>
        </div>
      ) : null}
      <Caption text={C.minutes} frame={t} at={tapAt + 26} out={len - 12} />
    </AbsoluteFill>
  );
};
