// Сцена 11. Родители сами находят BalaGo и оставляют предварительную заявку.
// Телефон мамы в руке крупно; экран меняется только после касания пальца:
//   1) поле поиска → набор «Балдар үчүн такси» (короткие касания клавиш);
//   2) результаты (простой список без рейтингов, отзывов и цен) → касание
//      строки BalaGo;
//   3) страница BalaGo (логотип проекта, «Балдар үчүн такси», приём
//      предварительных заявок, направление «Мектеп → Үй») — M02;
//   4) родители вместе смотрят на экран — F06; выбрано «Мектеп → Үй»;
//   5) форма «Алдын ала арыз»: Мектеп, Үй, Сабактын бүтүү убактысы 14:30 —
//      поля заполняются по касанию (M03);
//   6) касание «Арыз жөнөтүү» → «Алдын ала арыз жөнөтүлдү» (заявка
//      отправлена — не маршрут и не поездка). Без адресов, номера и URL.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { NY2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Paper, Shot, Svg, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Ny2Timeline } from "../timing";
import { CloseHand, SKIN } from "../props/CloseHand";
import { KITCHEN, KitchenBack, KitchenTable } from "../sets/Kitchen";
import { H, seatOf } from "./common";

// Экран телефона в кадре (из него раскрывается комната следующей сцены).
const PH = { x: 250, y: 260, w: 580, h: 1180 };
const SCR = { x: PH.x + 26, y: PH.y + 70, w: PH.w - 52, h: PH.h - 140 };
export const PHONE_FINAL = SCR;

export const balagoPlan = (tl: Ny2Timeline) => {
  const T = sceneTools(tl, "balago");
  const m02 = T.from("M02");
  const typeFrom = 22;
  const query = NY2_TEXT.search.query;
  const typeTo = typeFrom + query.length * 3;
  const tapResult = Math.min(m02 - 28, typeTo + 26);
  const pageAt = tapResult + 6;
  const f06 = T.from("F06");
  const two: [number, number] = [f06 - 6, T.to("F06") + 4]; // родители вдвоём
  const route = two[1] + 2; // касание «Мектеп → Үй»
  const formAt = route + 14;
  const m03 = T.from("M03");
  const fill = [T.word("M03", "Мектебин"), T.word("M03", "дарегин"), T.word("M03", "убакытты")].map((x) => Math.max(x, formAt + 6));
  const send = T.to("M03") + 22;
  return { tapSearch: 10, typeFrom, typeTo, tapResult, pageAt, m02, two, route, formAt, m03, fill, send, sent: send + 6, len: T.len };
};
type P = ReturnType<typeof balagoPlan>;

// Кончик указательного пальца (CloseHand point) → положение запястья.
const L = 210;
const ANG = 150;
const wristFor = (tip: { x: number; y: number }) => {
  const r = (ANG * Math.PI) / 180;
  const lx = 0.78 * L * 0.22;
  const ly = L * 1.1;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

// Точки касаний на экране (кадр).
const T_SEARCH = { x: SCR.x + SCR.w / 2, y: SCR.y + 150 };
const T_RESULT = { x: SCR.x + SCR.w / 2, y: SCR.y + 470 };
const T_ROUTE = { x: SCR.x + SCR.w / 2, y: SCR.y + 690 };
const T_FIELDS = [SCR.y + 300, SCR.y + 470, SCR.y + 640].map((y) => ({ x: SCR.x + SCR.w * 0.7, y }));
const T_SEND = { x: SCR.x + SCR.w / 2, y: SCR.y + 900 };
const KEYS_Y = SCR.y + SCR.h - 330;

const Field: React.FC<{ label: string; value: string; filled: number; y: number }> = ({ label, value, filled, y }) => (
  <div style={box({ left: 30, top: y, width: SCR.w - 60, height: 140 })}>
    <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 30, color: C.inkSoft }}>{label}</div>
    <div style={box({ left: 0, top: 46, width: SCR.w - 60, height: 82, backgroundColor: "#FFFFFF", border: `4px solid ${filled > 0 ? C.blue : "#CFC8BA"}`, borderRadius: 16, boxSizing: "border-box" })}>
      <div style={box({ left: 22, top: 16, fontFamily: F.text, fontWeight: 800, fontSize: 38, color: C.ink, opacity: filled })}>{value}</div>
    </div>
  </div>
);

const Screen: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const q = NY2_TEXT.search.query;
  const typed = q.slice(0, Math.max(0, Math.min(q.length, Math.floor((f - p.typeFrom) / 3) + 1)));
  const state = f < p.typeTo + 8 ? "search" : f < p.pageAt ? "results" : f < p.formAt ? "page" : "form";
  const routeOn = f >= p.route;
  const sent = f >= p.sent;
  return (
    <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, backgroundColor: "#FBF8F2", overflow: "hidden", borderRadius: 26 })}>
      {state === "search" || state === "results" ? (
        <>
          <div style={box({ left: 30, top: 110, width: SCR.w - 60, height: 90, backgroundColor: "#FFFFFF", border: `4px solid ${f >= p.tapSearch ? C.blue : "#CFC8BA"}`, borderRadius: 45, boxSizing: "border-box" })}>
            <div style={box({ left: 30, top: 18, fontFamily: F.text, fontWeight: 800, fontSize: 38, color: typed.length && f >= p.typeFrom ? C.ink : "#9A948A" })}>{f >= p.typeFrom ? typed : NY2_TEXT.search.hint}</div>
          </div>
          {state === "search" ? (
            // клавиатура
            <div style={box({ left: 0, top: SCR.h - 360, width: SCR.w, height: 360, backgroundColor: "#D9D5CC" })}>
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 10 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 10 + c * ((SCR.w - 20) / 10), top: 20 + r * 82, width: (SCR.w - 20) / 10 - 8, height: 66, backgroundColor: "#FFFFFF", borderRadius: 10 })} />),
              )}
            </div>
          ) : (
            <>
              {["BalaGo — Балдар үчүн такси", "Такси чакыруу", "Мектеп жаңылыктары"].map((t, i) => (
                <div key={t} style={box({ left: 30, top: 260 + i * 170, width: SCR.w - 60, height: 140, backgroundColor: i === 0 && f >= p.tapResult ? "#E3E7FF" : "#FFFFFF", borderRadius: 18, border: "3px solid #E2DDD2", boxSizing: "border-box", padding: "26px 26px", fontFamily: F.text, fontWeight: 800, fontSize: 34, color: i === 0 ? C.blue : C.inkSoft })}>
                  {t}
                </div>
              ))}
            </>
          )}
        </>
      ) : null}
      {state === "page" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 470, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={box({ left: SCR.w / 2 - 170, top: 50, width: 340, height: 340 })} />
          <div style={box({ left: 0, top: 400, width: SCR.w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.ink })}>{NY2_TEXT.page.tagline}</div>
          <div style={box({ left: 30, top: 510, width: SCR.w - 60, padding: "18px 22px", boxSizing: "border-box", backgroundColor: "#FFFFFF", borderRadius: 18, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.inkSoft })}>{NY2_TEXT.page.status}</div>
          <div style={box({ left: 30, top: 640, width: SCR.w - 60, height: 100, backgroundColor: routeOn ? C.blue : "#FFFFFF", border: `4px solid ${C.blue}`, borderRadius: 50, boxSizing: "border-box", textAlign: "center", lineHeight: "92px", fontFamily: F.display, fontWeight: 900, fontSize: 48, color: routeOn ? C.white : C.blue })}>{NY2_TEXT.page.route}</div>
          <div style={box({ left: 30, top: 800, width: SCR.w - 60, height: 110, backgroundColor: C.orange, borderRadius: 18, textAlign: "center", lineHeight: "110px", fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.white })}>{NY2_TEXT.page.cta}</div>
        </>
      ) : null}
      {state === "form" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 130, backgroundColor: C.yellow })} />
          <div style={box({ left: 30, top: 34, fontFamily: F.display, fontWeight: 900, fontSize: 48, color: C.ink })}>{NY2_TEXT.form.title}</div>
          <div style={box({ left: 30, top: 150, padding: "8px 22px", backgroundColor: C.blue, borderRadius: 30, fontFamily: F.display, fontWeight: 900, fontSize: 34, color: C.white })}>{NY2_TEXT.page.route}</div>
          <Field label={NY2_TEXT.form.school} value={NY2_TEXT.form.schoolValue} filled={clamp((f - p.fill[0]) / 6)} y={240} />
          <Field label={NY2_TEXT.form.home} value={NY2_TEXT.form.homeValue} filled={clamp((f - p.fill[1]) / 6)} y={410} />
          <Field label={NY2_TEXT.form.time} value={NY2_TEXT.form.timeValue} filled={clamp((f - p.fill[2]) / 6)} y={580} />
          <div style={box({ left: 30, top: 840, width: SCR.w - 60, height: 120, backgroundColor: f >= p.send && f < p.send + 6 ? "#C9361A" : C.orange, borderRadius: 18, textAlign: "center", lineHeight: "120px", fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.white, transform: `scale(${f >= p.send && f < p.send + 6 ? 0.97 : 1})` })}>{NY2_TEXT.form.send}</div>
          {sent ? (
            <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: `rgba(251,248,242,${0.94 * easeOut(clamp((f - p.sent) / 8))})` })}>
              <div style={box({ left: SCR.w / 2 - 90, top: 300, width: 180, height: 180, borderRadius: "50%", backgroundColor: "#3FAE6A", transform: `scale(${easeOut(clamp((f - p.sent) / 10))})` })}>
                <svg width={180} height={180}>
                  <path d="M 50 92 l 28 28 l 54 -58" stroke="#FFFFFF" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={box({ left: 30, top: 540, width: SCR.w - 60, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 56, lineHeight: 1.1, color: C.ink, opacity: clamp((f - p.sent - 4) / 6) })}>{NY2_TEXT.form.sent}</div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

// Палец: к точке касания, касание (короткое нажатие), отвод.
const tapTimes = (p: P) => {
  const taps: { at: number; tip: { x: number; y: number } }[] = [{ at: p.tapSearch, tip: T_SEARCH }];
  const q = NY2_TEXT.search.query;
  for (let i = 0; i < q.length; i++) taps.push({ at: p.typeFrom + i * 3, tip: { x: SCR.x + 40 + ((i * 7) % 10) * ((SCR.w - 60) / 10), y: KEYS_Y + 40 + ((i * 3) % 4) * 82 } });
  taps.push({ at: p.tapResult, tip: T_RESULT });
  taps.push({ at: p.route, tip: T_ROUTE });
  p.fill.forEach((at, i) => taps.push({ at, tip: T_FIELDS[i] }));
  taps.push({ at: p.send, tip: T_SEND });
  return taps;
};

const PhoneClose: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const taps = tapTimes(p);
  // ближайшее касание: палец подходит за 8 кадров, касается, отходит
  let tip = { x: PH.x + PH.w + 60, y: PH.y + PH.h * 0.75 };
  let press = 0;
  for (let i = 0; i < taps.length; i++) {
    const a = taps[i];
    const prev = taps[i - 1];
    const from = prev ? prev.tip : tip;
    const lead = prev ? Math.min(8, Math.max(2, a.at - prev.at - 1)) : 8;
    if (f >= a.at - lead && f <= a.at + 2) {
      const u = easeInOut(clamp((f - (a.at - lead)) / lead));
      tip = { x: lerp(from.x, a.tip.x, u), y: lerp(from.y, a.tip.y, u) - (1 - u) * 26 };
      press = f >= a.at && f <= a.at + 2 ? 1 : 0;
      break;
    }
    if (f > a.at + 2 && (!taps[i + 1] || f < taps[i + 1].at - Math.min(8, Math.max(2, taps[i + 1].at - a.at - 1)))) {
      tip = { x: a.tip.x + 40, y: a.tip.y + 30 };
    }
  }
  const w = wristFor(tip);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Paper />
      {/* корпус телефона (розовый чехол мамы) */}
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: C.pink, borderRadius: 60 })} />
      <div style={box({ left: PH.x + 14, top: PH.y + 14, width: PH.w - 28, height: PH.h - 28, backgroundColor: "#1E2235", borderRadius: 48 })} />
      <Screen f={f} p={p} />
      <Svg>
        {/* левая рука держит телефон снизу */}
        <CloseHand x={PH.x + 90} y={PH.y + PH.h + 170} angle={-172} size={240} {...SKIN.mom} shape="grip" mirror armLen={3} />
        {/* правая: указательный палец касается экрана */}
        <CloseHand x={w.x} y={w.y + press * 4} angle={ANG} size={L} {...SKIN.mom} shape="point" armLen={4} />
        {press ? <circle cx={tip.x} cy={tip.y} r={30} fill="none" stroke={C.blue} strokeWidth={6} opacity={0.6} /> : null}
      </Svg>
    </AbsoluteFill>
  );
};

// Родители вдвоём смотрят на экран; папа показывает на направление.
const MOM: Place = { x: 380, y: KITCHEN.floorY, h: H.mom };
const DAD: Place = { x: 650, y: KITCHEN.floorY, h: H.dad };
const Together: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const momPose = () => ({ sit: 1, seat: seatOf(H.mom), expr: "softSmile" as const, lookY: 0.55, lookX: 0.2, armR: { target: { x: 470, y: 1090 }, shape: "phone" as const, item: "phone" as const, itemColor: C.pink, glow: 1, elbow: "down" as const, behind: false }, armL: { target: { x: 420, y: 1120 }, shape: "relax" as const, elbow: "down" as const } });
  const dadPose = (tt: number) => ({
    sit: 1,
    seat: seatOf(H.dad),
    lean: 8,
    expr: "calm" as const,
    lookY: 0.5,
    lookX: -0.5,
    armL: { target: keys(tt, [[p.two[0] + 10, 0], [p.two[0] + 22, 1]]) > 0.5 ? { x: 500, y: 1070 } : { x: 600, y: KITCHEN.tableTop - 4 }, shape: "point" as const, elbow: "down" as const, behind: false },
    armR: { target: { x: 760, y: KITCHEN.tableTop - 4 }, shape: "relax" as const, elbow: "down" as const },
  });
  return (
    <Shot f={f} cam={{ x: 520, y: 1060, zoom: 1.7 }} bg="#F3E3C4">
      <KitchenBack />
      <Actor uid="b11-mom" look="momHome" f={f} place={() => MOM} face={() => 0.25} pose={momPose} role="mother" seed={5} layer="body" />
      <Actor uid="b11-dad" look="dadIT" f={f} place={() => DAD} face={() => -0.55} pose={dadPose} role="father" seed={2} layer="body" />
      <KitchenTable />
      <Actor uid="b11-mom" look="momHome" f={f} place={() => MOM} face={() => 0.25} pose={momPose} role="mother" seed={5} layer="arms" />
      <Actor uid="b11-dad" look="dadIT" f={f} place={() => DAD} face={() => -0.55} pose={dadPose} role="father" seed={2} layer="arms" />
    </Shot>
  );
};

export const BalagoScene: React.FC = () => {
  const { f } = useScene("balago");
  const p = usePlan(balagoPlan);
  if (f >= p.two[0] && f < p.two[1]) return <Together f={f} p={p} />;
  return <PhoneClose f={f} p={p} />;
};

export const balagoTaps = (p: P) => [p.tapSearch, p.tapResult, p.route, ...p.fill, p.send];
