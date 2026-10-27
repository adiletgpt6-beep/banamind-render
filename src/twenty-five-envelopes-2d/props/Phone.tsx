// Телефон мамы крупным планом (один корпус на всё время, экран к зрителю)
// и состояния его экрана. Экран меняется только после касания пальца:
// поиск → результаты → страница BalaGo → предварительная форма → статус
// «Өтүнмө жөнөтүлдү / Маршрутту талкуулоо үчүн». Интерфейс иллюстративный:
// без URL, номеров телефона, цен, рейтингов, отзывов, водителя и оплаты;
// реальных отправок нет.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { TE2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Svg } from "../kit";
import { clamp, easeInOut, easeOut, lerp, type Vec } from "../rig/motion";
import { CloseHand } from "./CloseHand";

// Корпус в кадре и экран.
export const PH = { x: 250, y: 160, w: 580, h: 1190 } as const;
export const SCR = { x: PH.x + 24, y: PH.y + 70, w: PH.w - 48, h: PH.h - 130 } as const;

const T = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", fontFamily: F.text, color: C.ink, ...s });

// ---------- Поиск, страница BalaGo, предварительная форма ----------
// Одно устройство: состояние меняется только после касания пальца.
export type WebState = "search" | "results" | "page" | "form" | "sent";
export const WebScreen: React.FC<{
  readonly state: WebState;
  readonly typed?: number; // доля набранного запроса
  readonly pressed?: string | null;
  readonly filled?: number; // 0…2: адрес, школа
  readonly sentT?: number; // кадры после нажатия «Жөнөтүү»
}> = ({ state, typed = 1, pressed = null, filled = 0, sentT = 0 }) => {
  const q = TE2_TEXT.search.query;
  const shown = q.slice(0, Math.round(q.length * clamp(typed)));
  const Fm = TE2_TEXT.form;
  const Pg = TE2_TEXT.page;
  return (
    <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: "#FBF9F5", overflow: "hidden" })}>
      {state === "search" || state === "results" ? (
        <>
          <div style={box({ left: 26, top: 60, width: SCR.w - 52, height: 92, backgroundColor: "#FFFFFF", border: `4px solid ${C.blue}`, borderRadius: 46, boxSizing: "border-box" })}>
            <div style={T({ left: 30, top: 22, fontWeight: 800, fontSize: 32, color: shown ? C.ink : "#9AA3B2", whiteSpace: "nowrap" })}>{shown || TE2_TEXT.search.hint}</div>
            {state === "search" && typed < 1 ? <div style={box({ left: 34 + shown.length * 17.2, top: 24, width: 3, height: 42, backgroundColor: C.blue })} /> : null}
          </div>
          {state === "search" ? (
            <div style={box({ left: 0, top: SCR.h - 380, width: SCR.w, height: 380, backgroundColor: "#D9DDE4" })}>
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 10 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 10 + c * ((SCR.w - 20) / 10), top: 22 + r * 88, width: (SCR.w - 20) / 10 - 8, height: 70, backgroundColor: pressed === `key${r}${c}` ? "#BFC7D4" : "#FFFFFF", borderRadius: 10 })} />),
              )}
            </div>
          ) : (
            <>
              <div style={box({ left: 26, top: 200, width: SCR.w - 52, height: 170, backgroundColor: pressed === "result" ? "#FFF3C4" : "#FFFFFF", borderRadius: 20, border: `3px solid ${C.yellow}`, boxSizing: "border-box" })}>
                <Img src={staticFile("assets/logo.png")} style={box({ left: 20, top: 22, width: 124, height: 124, borderRadius: 62 })} />
                <div style={T({ left: 166, top: 36, fontWeight: 800, fontSize: 44 })}>{TE2_TEXT.brand}</div>
                <div style={T({ left: 166, top: 96, fontWeight: 500, fontSize: 32, color: C.inkSoft })}>{TE2_TEXT.tagline}</div>
              </div>
              {TE2_TEXT.results.map((t, i) => (
                <div key={t} style={box({ left: 26, top: 400 + i * 150, width: SCR.w - 52, height: 124, backgroundColor: "#FFFFFF", borderRadius: 20, border: "3px solid #E6E1D6", boxSizing: "border-box" })}>
                  <div style={T({ left: 26, top: 38, fontWeight: 800, fontSize: 34, color: C.inkSoft })}>{t}</div>
                </div>
              ))}
            </>
          )}
        </>
      ) : null}
      {state === "page" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 470, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={box({ left: SCR.w / 2 - 150, top: 40, width: 300, height: 300, borderRadius: 150 })} />
          <div style={T({ left: 0, top: 360, width: SCR.w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 56 })}>{TE2_TEXT.brand}</div>
          <div style={T({ left: 0, top: 500, width: SCR.w, textAlign: "center", fontWeight: 800, fontSize: 42 })}>{TE2_TEXT.tagline}</div>
          <div style={box({ left: 40, top: 580, width: SCR.w - 80, height: 86, borderRadius: 43, backgroundColor: "#FFF3C4", border: `3px solid ${C.yellow}`, boxSizing: "border-box" })}>
            <div style={T({ left: 0, top: 18, width: SCR.w - 80, textAlign: "center", fontWeight: 800, fontSize: 36 })}>{Pg.route}</div>
          </div>
          <div style={T({ left: 40, top: 700, width: SCR.w - 80, textAlign: "center", fontWeight: 500, fontSize: 32, lineHeight: 1.3, color: C.inkSoft })}>{Pg.info}</div>
          <div style={box({ left: 36, top: 800, width: SCR.w - 72, height: 118, backgroundColor: pressed === "cta" ? "#0F1E33" : C.navy, borderRadius: 24, transform: `scale(${pressed === "cta" ? 0.97 : 1})` })}>
            <div style={T({ left: 0, top: 30, width: SCR.w - 72, textAlign: "center", fontWeight: 800, fontSize: 44, color: "#FFFFFF" })}>{Pg.cta}</div>
          </div>
        </>
      ) : null}
      {state === "form" || state === "sent" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 132, backgroundColor: C.yellow })} />
          <div style={T({ left: 30, top: 38, fontFamily: F.display, fontWeight: 900, fontSize: 50 })}>{Fm.title}</div>
          {[
            [Fm.address, Fm.addressDone],
            [Fm.school, Fm.schoolDone],
          ].map(([label, done], i) => {
            const k = clamp((filled - i) * 1.4);
            return (
              <div key={label} style={box({ left: 30, top: 170 + i * 170, width: SCR.w - 60, height: 140 })}>
                <div style={T({ left: 6, top: 0, fontWeight: 800, fontSize: 30, color: C.inkSoft })}>{label}</div>
                <div style={box({ left: 0, top: 44, width: SCR.w - 60, height: 92, backgroundColor: "#FFFFFF", border: `4px solid ${k > 0 ? C.green : "#D6D0C4"}`, borderRadius: 18, boxSizing: "border-box" })}>
                  <div style={T({ left: 24, top: 22, fontWeight: 800, fontSize: 34, opacity: k, whiteSpace: "nowrap" })}>✓ {done}</div>
                </div>
              </div>
            );
          })}
          <div style={box({ left: 30, top: 530, width: SCR.w - 60, height: 92, borderRadius: 18, backgroundColor: "#FFF3C4", border: `3px solid ${C.yellow}`, boxSizing: "border-box" })}>
            <div style={T({ left: 0, top: 22, width: SCR.w - 60, textAlign: "center", fontWeight: 800, fontSize: 36 })}>{Fm.route}</div>
          </div>
          <div style={box({ left: 30, top: 760, width: SCR.w - 60, height: 124, backgroundColor: pressed === "send" ? "#0F1E33" : C.navy, borderRadius: 24, transform: `scale(${pressed === "send" ? 0.97 : 1})` })}>
            <div style={T({ left: 0, top: 32, width: SCR.w - 60, textAlign: "center", fontWeight: 800, fontSize: 48, color: "#FFFFFF" })}>{Fm.send}</div>
          </div>
          {state === "sent" ? (
            <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: `rgba(251,249,245,${0.96 * easeOut(clamp(sentT / 8))})` })}>
              <div style={box({ left: SCR.w / 2 - 90, top: 260, width: 180, height: 180, borderRadius: 90, backgroundColor: C.green, transform: `scale(${easeOut(clamp(sentT / 10))})` })}>
                <svg width={180} height={180}>
                  <path d="M 50 92 l 28 28 l 54 -58" stroke="#FFFFFF" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={T({ left: 30, top: 500, width: SCR.w - 60, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 60, lineHeight: 1.1, opacity: clamp((sentT - 4) / 6) })}>{Fm.sent}</div>
              <div style={T({ left: 30, top: 650, width: SCR.w - 60, textAlign: "center", fontWeight: 800, fontSize: 38, color: C.inkSoft, opacity: clamp((sentT - 8) / 6) })}>{Fm.sentSub}</div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};
export const WEB_TAP = {
  search: { x: SCR.x + SCR.w / 2, y: SCR.y + 106 },
  result: { x: SCR.x + SCR.w / 2, y: SCR.y + 285 },
  cta: { x: SCR.x + SCR.w / 2, y: SCR.y + 859 },
  address: { x: SCR.x + SCR.w / 2, y: SCR.y + 260 },
  school: { x: SCR.x + SCR.w / 2, y: SCR.y + 430 },
  send: { x: SCR.x + SCR.w / 2, y: SCR.y + 822 },
  key: (i: number): Vec => ({ x: SCR.x + 40 + ((i * 7) % 10) * ((SCR.w - 60) / 10), y: SCR.y + SCR.h - 330 + ((i * 3) % 4) * 88 }),
} as const;
export const keyId = (i: number) => `key${(i * 3) % 4}${(i * 7) % 10}`;

// ---------- Телефон в руке крупно ----------
// Левая рука держит корпус снизу; указательный палец правой подходит к
// точке касания (за lead кадров), касается (press) и отходит.
export type Tap = { readonly at: number; readonly tip: Vec };
const L = 210;
const ANG = 150;
const wristFor = (tip: Vec) => {
  const r = (ANG * Math.PI) / 180;
  const lx = 0.78 * L * 0.22;
  const ly = L * 1.1;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

export const fingerAt = (f: number, taps: readonly Tap[]) => {
  const home = { x: PH.x + PH.w + 140, y: PH.y + PH.h * 0.9 };
  let tip = home;
  let press = false;
  for (let i = 0; i < taps.length; i++) {
    const a = taps[i];
    const prev = taps[i - 1];
    const from = prev && a.at - prev.at < 40 ? { x: prev.tip.x + 30, y: prev.tip.y + 24 } : home;
    const lead = prev ? Math.min(12, Math.max(3, a.at - prev.at - 3)) : 12;
    if (f >= a.at - lead && f <= a.at + 2) {
      const u = easeInOut(clamp((f - (a.at - lead)) / lead));
      tip = { x: lerp(from.x, a.tip.x, u), y: lerp(from.y, a.tip.y, u) - (1 - u) * 24 };
      press = f >= a.at && f <= a.at + 2;
      break;
    }
    const next = taps[i + 1];
    if (f > a.at + 2 && (!next || f < next.at - Math.min(12, Math.max(3, next.at - a.at - 3)))) {
      const away = next && next.at - a.at < 40 ? 0 : easeInOut(clamp((f - a.at - 2) / 12));
      const rest = { x: a.tip.x + 30, y: a.tip.y + 24 };
      tip = { x: lerp(rest.x, home.x, away), y: lerp(rest.y, home.y, away) };
    }
  }
  return { tip, press };
};

export const PhoneClose: React.FC<{
  readonly f: number;
  readonly taps: readonly Tap[];
  readonly skin: { skin: string; shade: string; sleeve: string; cuff?: string };
  readonly caseColor?: string;
  readonly bg?: string;
  readonly children: React.ReactNode;
}> = ({ f, taps, skin, caseColor = C.coral, bg = "#EFDDBD", children }) => {
  const { tip, press } = fingerAt(f, taps);
  const w = wristFor(tip);
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <div style={box({ inset: 0, background: `radial-gradient(ellipse at 50% 30%, ${C.amberGlow}, rgba(0,0,0,0) 70%)` })} />
      <div style={box({ left: PH.x + 18, top: PH.y + 24, width: PH.w, height: PH.h, backgroundColor: "rgba(23,42,70,0.18)", borderRadius: 64 })} />
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: caseColor, borderRadius: 64 })} />
      <div style={box({ left: PH.x + 12, top: PH.y + 12, width: PH.w - 24, height: PH.h - 24, backgroundColor: "#1E2235", borderRadius: 54 })} />
      <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, overflow: "hidden", borderRadius: 26 })}>{children}</div>
      <Svg>
        <CloseHand x={PH.x + 110} y={PH.y + PH.h + 160} angle={-170} size={250} {...skin} shape="grip" mirror armLen={3} />
        <CloseHand x={w.x} y={w.y + (press ? 4 : 0)} angle={ANG} size={L} {...skin} shape="point" armLen={4} />
        {press ? <circle cx={tip.x} cy={tip.y} r={30} fill="none" stroke={C.blue} strokeWidth={6} opacity={0.6} /> : null}
      </Svg>
    </AbsoluteFill>
  );
};
