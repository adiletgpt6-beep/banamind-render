// Сцена 17. Они сами находят BalaGo. Тот же телефон мамы крупно, экран
// обращён к зрителю, левая рука держит корпус, указательный палец правой
// касается экрана; экран меняется только после касания:
//   поиск «Бишкек балдар үчүн такси» → карточка BalaGo в результатах →
//   страница → раздел «Алдын ала каттоо» → форма с уже введёнными данными
//   (Аты-жөнү, Мектеп, Маршрут «Үй → Мектеп → Үй», Убакыт) → касание
//   «Жөнөтүү» → «Өтүнмө жөнөтүлдү» (получена предварительная заявка — не
//   водитель, не маршрут, не поездка). Иллюстративный интерфейс: без URL,
//   рейтингов, отзывов, цен и номеров.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { box, Paper, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Iw2Timeline } from "../timing";
import { C, F } from "../theme";
import { IW2_TEXT } from "../script";
import { CloseHand, SKIN } from "../props/CloseHand";
import { RouteText } from "../kit";

const PH = { x: 250, y: 300, w: 580, h: 1160 };
const SCR = { x: PH.x + 24, y: PH.y + 64, w: PH.w - 48, h: PH.h - 128 };
export const PHONE_SCREEN = SCR;

export const balagoPlan = (tl: Iw2Timeline) => {
  const T = sceneTools(tl, "balago");
  const n09 = T.from("N09");
  const send = Math.max(n09 + 150, T.to("N09") - 12);
  return { tapSearch: 6, query: [10, 24] as const, results: 30, tapCard: 52, page: 58, tapSection: 98, form: 104, send, sent: send + 6, len: T.len };
};
type P = ReturnType<typeof balagoPlan>;

const S = IW2_TEXT;

const Field: React.FC<{ label: string; value: React.ReactNode; y: number; on: number }> = ({ label, value, y, on }) => (
  <div style={box({ left: 28, top: y, width: SCR.w - 56, height: 132 })}>
    <div style={{ fontFamily: F.text, fontWeight: 800, fontSize: 28, color: C.inkSoft }}>{label}</div>
    <div style={box({ left: 0, top: 42, width: SCR.w - 56, height: 80, backgroundColor: C.white, border: `3px solid ${C.ink}`, borderRadius: 14, boxSizing: "border-box" })}>
      <div style={box({ left: 20, top: 16, fontFamily: F.text, fontWeight: 800, fontSize: 34, color: C.ink, opacity: on, whiteSpace: "nowrap" })}>{value}</div>
    </div>
  </div>
);

const Screen: React.FC<{ f: number; p: P }> = ({ f, p }) => {
  const state = f < p.results ? "search" : f < p.page ? "results" : f < p.form ? "page" : "form";
  const qk = easeOut(clamp((f - p.query[0]) / (p.query[1] - p.query[0])));
  const pressed = (at: number) => f >= at && f < at + 5;
  const sent = easeOut(clamp((f - p.sent) / 8));
  return (
    <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, backgroundColor: C.paper, overflow: "hidden", borderRadius: 24 })}>
      {state === "search" || state === "results" ? (
        <>
          <div style={box({ left: 26, top: 90, width: SCR.w - 52, height: 92, backgroundColor: C.white, border: `3px solid ${f >= p.tapSearch ? C.blue : C.ink}`, borderRadius: 46, boxSizing: "border-box" })}>
            <div style={box({ left: 30, top: 22, fontFamily: F.text, fontWeight: 800, fontSize: 32, color: f >= p.query[0] ? C.ink : "#8C8A84", opacity: f >= p.query[0] ? qk : 1, whiteSpace: "nowrap" })}>{f >= p.query[0] ? S.search.query : S.search.hint}</div>
          </div>
          {state === "results" ? (
            <div style={box({ left: 26, top: 230, width: SCR.w - 52, height: 250, backgroundColor: pressed(p.tapCard) ? C.blueSoft : C.white, border: `3px solid ${C.ink}`, borderRadius: 20, boxSizing: "border-box", boxShadow: "6px 8px 0 rgba(23,23,23,0.12)", opacity: easeOut(clamp((f - p.results) / 8)) })}>
              <div style={box({ left: 24, top: 24, width: 96, height: 96, borderRadius: 20, backgroundColor: C.yellow, overflow: "hidden" })}>
                <Img src={staticFile("assets/logo.png")} style={box({ left: 4, top: 4, width: 88, height: 88 })} />
              </div>
              <div style={box({ left: 140, top: 30, fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.ink })}>{S.page.brand}</div>
              <div style={box({ left: 140, top: 86, fontFamily: F.text, fontWeight: 800, fontSize: 30, color: C.inkSoft })}>{S.page.tagline}</div>
              <div style={box({ left: 24, top: 160, width: SCR.w - 100, height: 14, borderRadius: 7, backgroundColor: "#E4E1D8" })} />
              <div style={box({ left: 24, top: 192, width: (SCR.w - 100) * 0.7, height: 14, borderRadius: 7, backgroundColor: "#E4E1D8" })} />
            </div>
          ) : null}
        </>
      ) : null}
      {state === "page" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 520, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={box({ left: SCR.w / 2 - 160, top: 40, width: 320, height: 320 })} />
          <div style={box({ left: 0, top: 380, width: SCR.w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.ink })}>{S.page.brand}</div>
          <div style={box({ left: 0, top: 452, width: SCR.w, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 36, color: C.ink })}>{S.page.tagline}</div>
          <div style={box({ left: 28, top: 600, width: SCR.w - 56, height: 120, backgroundColor: pressed(p.tapSection) ? C.navy : C.ink, borderRadius: 18, textAlign: "center", lineHeight: "120px", fontFamily: F.display, fontWeight: 900, fontSize: 44, color: C.white })}>{S.page.section}</div>
        </>
      ) : null}
      {state === "form" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 120, backgroundColor: C.yellow })} />
          <div style={box({ left: 28, top: 34, fontFamily: F.display, fontWeight: 900, fontSize: 46, color: C.ink })}>{S.form.title}</div>
          <Field label={S.form.name} value={S.form.nameValue} y={150} on={1} />
          <Field label={S.form.school} value={S.form.schoolValue} y={300} on={1} />
          <Field label={S.form.route} value={<RouteText text={S.form.routeValue} size={34} />} y={450} on={1} />
          <Field label={S.form.time} value={S.form.timeValue} y={600} on={1} />
          <div style={box({ left: 28, top: 790, width: SCR.w - 56, height: 116, backgroundColor: pressed(p.send) ? C.navy : C.ink, borderRadius: 18, textAlign: "center", lineHeight: "116px", fontFamily: F.display, fontWeight: 900, fontSize: 48, color: C.white, transform: `scale(${pressed(p.send) ? 0.97 : 1})` })}>{S.form.send}</div>
          {f >= p.sent ? (
            <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: `rgba(247,247,243,${0.95 * sent})` })}>
              <div style={box({ left: SCR.w / 2 - 90, top: 290, width: 180, height: 180, borderRadius: "50%", backgroundColor: C.yellow, border: `5px solid ${C.ink}`, boxSizing: "border-box", transform: `scale(${sent})` })}>
                <svg width={170} height={170}>
                  <path d="M 46 88 l 26 26 l 52 -56" stroke={C.ink} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={box({ left: 24, top: 520, width: SCR.w - 48, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 54, lineHeight: 1.1, color: C.ink, opacity: clamp((f - p.sent - 4) / 6) })}>{S.form.sent}</div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

// Кончик указательного пальца → запястье (CloseHand point, угол ANG).
const L = 220;
const ANG = 150;
const wristFor = (tip: { x: number; y: number }) => {
  const r = (ANG * Math.PI) / 180;
  const d = L * 1.1;
  return { x: tip.x + Math.sin(r) * d, y: tip.y - Math.cos(r) * d };
};
const T_SEARCH = { x: SCR.x + SCR.w / 2, y: SCR.y + 136 };
const T_CARD = { x: SCR.x + SCR.w / 2, y: SCR.y + 340 };
const T_SECTION = { x: SCR.x + SCR.w / 2, y: SCR.y + 660 };
const T_SEND = { x: SCR.x + SCR.w / 2, y: SCR.y + 848 };

export const BalagoScene: React.FC = () => {
  const { f } = useScene("balago");
  const p = usePlan(balagoPlan);
  const taps = [
    { at: p.tapSearch, tip: T_SEARCH },
    { at: p.tapCard, tip: T_CARD },
    { at: p.tapSection, tip: T_SECTION },
    { at: p.send, tip: T_SEND },
  ];
  // палец: подходит за 10 кадров, касание 4 кадра, затем отводится
  const rest = { x: PH.x + PH.w + 40, y: PH.y + PH.h * 0.72 };
  let tip = rest;
  let press = false;
  for (const t of taps) {
    if (f >= t.at - 10 && f < t.at) {
      const u = easeInOut((f - (t.at - 10)) / 10);
      tip = { x: lerp(rest.x, t.tip.x, u), y: lerp(rest.y, t.tip.y, u) - (1 - u) * 30 };
    } else if (f >= t.at && f < t.at + 4) {
      tip = t.tip;
      press = true;
    } else if (f >= t.at + 4 && f < t.at + 14) {
      const u = easeInOut((f - t.at - 4) / 10);
      tip = { x: lerp(t.tip.x, rest.x, u), y: lerp(t.tip.y, rest.y, u) };
    }
  }
  const w = wristFor(tip);
  return (
    <AbsoluteFill style={{ backgroundColor: C.paperWarm }}>
      <Paper color={C.paperWarm} dots="rgba(23,23,23,0.05)" />
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: C.navy, borderRadius: 60 })} />
      <div style={box({ left: PH.x + 12, top: PH.y + 12, width: PH.w - 24, height: PH.h - 24, backgroundColor: "#151B2A", borderRadius: 50 })} />
      <Screen f={f} p={p} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <CloseHand x={PH.x + 110} y={PH.y + PH.h + 160} angle={-172} size={250} {...SKIN.mama} shape="grip" mirror armLen={3} />
        <CloseHand x={w.x} y={w.y + (press ? 4 : 0)} angle={ANG} size={L} {...SKIN.mama} shape="point" armLen={4} />
        {press ? <circle cx={tip.x} cy={tip.y} r={30} fill="none" stroke={C.blue} strokeWidth={6} opacity={0.6} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

export const balagoTaps = (p: P) => [p.tapSearch, p.tapCard, p.tapSection, p.send];
