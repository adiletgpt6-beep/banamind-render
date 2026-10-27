// Сцена 2. «Всё готово». Пометка «Ошол эле күнү, эртең менен».
// A. Общий план студии «АЙКЫН»: Айжан у стола, рядом образцы и ноутбук
//    (видна наружная крышка); она выравнивает образцы.
// B. Руки крупно: два образца выравниваются по краю.
// C. Эскиз вывески «БУЛАК» на доске (наезд камеры).
// D. Вставка экрана ноутбука (со стороны Айжан): нужный слайд открыт,
//    пальцы нажимают клавиши, пункты списка отмечаются на словах
//    рассказчика («Презентация», «эсептөөлөр», «үлгүлөрү»).
import { AbsoluteFill } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { anticipate, clamp, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { T3B_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { T3bTimeline } from "../timing";
import { CloseHand } from "../props/CloseHand";
import { LaptopFront, LaptopScreenView } from "../props/Laptop";
import { DECK, DeckSlide, Fit } from "../props/Call";
import { STUDIO, StudioBack, StudioDesk } from "../sets/Studio";

export const MOM_HAND = { skin: "#E3B18C", shade: "#CD9870", sleeve: "#22334C", cuff: "#F7F1E6" } as const;

export const studioPlan = (tl: T3bTimeline) => {
  const T = sceneTools(tl, "studio");
  const hands = T.word("N01", "Бүгүн") - 6;
  const sketch = hands + 56;
  const laptop = T.word("N01", "Презентация") - 16;
  const screen = laptop + 18;
  const ticks = [T.word("N01", "Презентация") + 6, T.word("N01", "эсептөөлөр") + 6, T.word("N01", "үлгүлөрү") + 6];
  return { hands, sketch, laptop, screen, ticks, len: T.len };
};
type P = ReturnType<typeof studioPlan>;

// Пометка времени: плашка входит и держится ≈ 2,6 с.
export const TimeNote: React.FC<{ readonly t: number; readonly text: string; readonly dur?: number }> = ({ t, text, dur = 80 }) => {
  if (t < 0 || t > dur + 10) return null;
  const k = easeOut(clamp(t / 10)) * (1 - easeOut(clamp((t - dur) / 10)));
  return (
    <div style={box({ left: 80, top: 180, padding: "14px 30px 18px", backgroundColor: C.navy, color: C.paper, fontFamily: F.text, fontWeight: 800, fontSize: 52, borderRadius: 14, opacity: k, transform: `translateY(${(1 - k) * -20}px)` })}>{text}</div>
  );
};

const MOM: Place = { x: 400, y: STUDIO.floorY, h: 900 };
const SAMPLE_A0 = { x: 250, y: 1288 };
const Wide: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const reach = keys(f, [[18, 0], [34, 1], [p.hands - 14, 1], [p.hands - 2, 0.4]]);
  const slide = easeInOut(clamp((f - 36) / 20));
  const pose = () => ({
    expr: "calm" as const,
    lookY: 0.6,
    lean: 6 * reach,
    armL: { target: keysV(f, [[18, { x: 300, y: 1180 }], [34, { x: 262 + 20 * slide, y: 1286 }]], anticipate), shape: reach > 0.5 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    armR: { target: keysV(f, [[18, { x: 500, y: 1180 }], [34, { x: 470, y: 1286 }]], anticipate), shape: reach > 0.5 ? ("open" as const) : ("relax" as const), elbow: "down" as const, behind: false },
  });
  return (
    <Shot f={f} cam={{ x: 540, y: 960 + 20 * easeInOut(clamp(f / 90)), zoom: 1 }} bg={C.studioWall}>
      <StudioBack />
      <Actor uid="s2-mom" look="aizhan" f={f} place={() => MOM} face={() => 0.1} pose={pose} seed={5} layer="body" />
      <StudioDesk />
      {/* образцы на столе и закрытая папка, ноутбук — наружная крышка */}
      <div style={box({ left: SAMPLE_A0.x + 20 * slide, top: SAMPLE_A0.y - 18, width: 120, height: 20, backgroundColor: C.bulakA, borderRadius: 4 })} />
      <div style={box({ left: 420, top: 1270, width: 120, height: 20, backgroundColor: "#C9A47A", borderRadius: 4 })} />
      <LaptopFront x={800} y={1300} w={300} open={1} />
      <Actor uid="s2-mom" look="aizhan" f={f} place={() => MOM} face={() => 0.1} pose={pose} seed={5} layer="arms" />
    </Shot>
  );
};

// B. Руки выравнивают два образца (вид сверху).
const Hands: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const t = f - p.hands;
  const a = easeInOut(clamp((t - 8) / 18));
  const b = easeInOut(clamp((t - 24) / 16));
  const sA = { x: lerp(250, 300, a), y: lerp(980, 900, a), r: lerp(-9, 0, a) };
  const sB = { x: lerp(600, 560, b), y: lerp(840, 900, b), r: lerp(6, 0, b) };
  return (
    <AbsoluteFill style={{ backgroundColor: "#E9E2D4" }}>
      <Svg>
        <g opacity={0.25}>
          <line x1={0} y1={1160} x2={1080} y2={1160} stroke={C.navy} strokeWidth={3} strokeDasharray="14 12" />
        </g>
        <g transform={`translate(${sA.x} ${sA.y}) rotate(${sA.r})`}>
          <rect x={-130} y={-130} width={240} height={260} rx={10} fill={C.bulakA} stroke="#22706C" strokeWidth={4} />
          <rect x={-130} y={-130} width={240} height={70} rx={10} fill="#BFE6E2" opacity={0.5} />
        </g>
        <g transform={`translate(${sB.x + 140} ${sB.y}) rotate(${sB.r})`}>
          <rect x={-110} y={-130} width={240} height={260} rx={10} fill="#C9A47A" stroke="#A9845B" strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-100} y1={-90 + i * 60} x2={120} y2={-80 + i * 60} stroke="#B48E62" strokeWidth={6} />
          ))}
        </g>
        <CloseHand x={sA.x - 40} y={sA.y + 330} angle={168} size={210} {...MOM_HAND} shape="open" armLen={3} />
        <CloseHand x={sB.x + 200 + 40 * (1 - b)} y={sB.y + 330} angle={192} size={210} {...MOM_HAND} shape="open" mirror armLen={3} />
      </Svg>
    </AbsoluteFill>
  );
};

// C. Эскиз «БУЛАК» на доске: камера подъезжает.
const Sketch: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const u = easeInOut(clamp((f - p.sketch) / 40));
  return (
    <Shot f={f} cam={{ x: lerp(330, 270, u), y: lerp(750, 710, u), zoom: lerp(2.4, 2.9, u) }} bg={C.studioWall}>
      <StudioBack />
    </Shot>
  );
};

// D. Экран ноутбука: слайд и список готовности.
const Screen: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const press = (i: number) => (Math.floor(f / 3 + i) % 4 === 0 ? 1 : 0);
  return (
    <AbsoluteFill style={{ backgroundColor: "#2B2F38" }}>
      <LaptopScreenView x={540} y={1180} w={1000}>
        <div style={box({ left: 0, top: 0, width: 1280, height: 800, backgroundColor: "#1E232D" })}>
          <Fit x={30} y={40} W={820} w={DECK.w} h={DECK.h} radius={8}>
            <DeckSlide />
          </Fit>
          <div style={box({ left: 880, top: 40, width: 370, height: 460, backgroundColor: "#FBF9F4", borderRadius: 14 })}>
            <div style={box({ left: 30, top: 24, fontFamily: F.display, fontWeight: 900, fontSize: 40, color: C.navy })}>{T3B_TEXT.client}</div>
            {T3B_TEXT.checklist.map((t, i) => {
              const k = easeOut(clamp((f - p.ticks[i]) / 8));
              return (
                <div key={t} style={box({ left: 30, top: 110 + i * 110, width: 320, height: 80 })}>
                  <div style={box({ left: 0, top: 10, width: 60, height: 60, borderRadius: 12, border: `5px solid ${k > 0 ? C.green : "#B8B2A6"}`, backgroundColor: k > 0 ? C.green : "transparent", boxSizing: "border-box" })}>
                    {k > 0 ? (
                      <svg width={50} height={50} style={box({ left: 0, top: 0 })}>
                        <path d="M 10 26 l 10 10 l 20 -22" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${60 * k} 60`} />
                      </svg>
                    ) : null}
                  </div>
                  <div style={box({ left: 82, top: 18, fontFamily: F.text, fontWeight: 800, fontSize: 38, color: C.navy })}>{t}</div>
                </div>
              );
            })}
          </div>
        </div>
      </LaptopScreenView>
      <Svg>
        {/* пальцы на клавиатуре: короткие нажатия */}
        <CloseHand x={360} y={1680} angle={176} size={170} {...MOM_HAND} lift={press(0)} armLen={3} />
        <CloseHand x={720} y={1680} angle={184} size={170} {...MOM_HAND} lift={press(2)} mirror armLen={3} />
      </Svg>
    </AbsoluteFill>
  );
};

export const StudioScene: React.FC = () => {
  const { f } = useScene("studio");
  const p = usePlan(studioPlan);
  let shot: React.ReactNode;
  if (f < p.hands) shot = <Wide f={f} p={p} />;
  else if (f < p.sketch) shot = <Hands f={f} p={p} />;
  else if (f < p.laptop) shot = <Sketch f={f} p={p} />;
  else if (f < p.screen) shot = <Wide f={f - p.laptop + 70} p={p} />;
  else shot = <Screen f={f} p={p} />;
  return (
    <AbsoluteFill>
      {shot}
      <TimeNote t={f - 4} text={T3B_TEXT.sameDay} dur={74} />
    </AbsoluteFill>
  );
};
