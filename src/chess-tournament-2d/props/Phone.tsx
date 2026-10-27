// Телефон крупным планом (один корпус на всё время, экран к зрителю) и
// состояния его экрана. Экран меняется только после касания пальца:
// переписка «Машыктыруучу», рабочий календарь (встречи в 15:00), поиск →
// результаты → страница BalaGo → форма предварительной заявки → статус
// «Өтүнмө жөнөтүлдү». Интерфейс иллюстративный: без URL, номеров, цен,
// рейтингов, отзывов, водителя и оплаты; реальных отправок нет.
import { AbsoluteFill, Img, staticFile } from "remotion";
import { CH2_TEXT } from "../script";
import { C, F } from "../theme";
import { box, Svg } from "../kit";
import { clamp, easeInOut, easeOut, lerp, type Vec } from "../rig/motion";
import { CloseHand } from "./CloseHand";

// Корпус в кадре и экран.
export const PH = { x: 250, y: 160, w: 580, h: 1190 } as const;
export const SCR = { x: PH.x + 24, y: PH.y + 70, w: PH.w - 48, h: PH.h - 130 } as const;

const T = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", fontFamily: F.text, color: C.ink, ...s });

// ---------- Переписка ----------
export const ChatScreen: React.FC<{ readonly incoming?: string; readonly draft?: string; readonly typed?: number; readonly sent?: number; readonly pulse?: boolean }> = ({ incoming, draft = "", typed = 0, sent = -1, pulse = false }) => {
  const shown = draft.slice(0, Math.round(draft.length * clamp(typed)));
  const isSent = sent >= 0;
  return (
    <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: "#EEF2F7" })}>
      <div style={box({ left: 0, top: 0, width: SCR.w, height: 132, backgroundColor: "#FFFFFF", borderBottom: "2px solid #DCE3EC" })}>
        <div style={box({ left: 28, top: 30, width: 72, height: 72, borderRadius: 36, backgroundColor: "#5E8C7A", color: "#FFFFFF", fontFamily: F.text, fontWeight: 800, fontSize: 38, textAlign: "center", lineHeight: "72px" })}>М</div>
        <div style={T({ left: 120, top: 44, fontWeight: 800, fontSize: 38 })}>{CH2_TEXT.coach}</div>
      </div>
      {incoming ? (
        <div style={box({ left: 28, top: 180, width: SCR.w - 150, backgroundColor: "#FFFFFF", borderRadius: "8px 26px 26px 26px", padding: "22px 26px", boxShadow: pulse ? `0 0 0 6px ${C.blueSoft}` : "none" })}>
          <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 40, lineHeight: 1.25, color: C.ink }}>{incoming}</div>
        </div>
      ) : null}
      {isSent ? (
        <div style={box({ right: 28, top: 400, width: SCR.w - 140, backgroundColor: "#D9F0DC", borderRadius: "26px 8px 26px 26px", padding: "22px 26px", opacity: easeOut(clamp(sent / 6)), transform: `translateY(${(1 - easeOut(clamp(sent / 8))) * 40}px)` })}>
          <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 38, lineHeight: 1.28, color: C.ink }}>{draft}</div>
        </div>
      ) : null}
      {/* поле ввода и кнопка отправки */}
      <div style={box({ left: 0, top: SCR.h - 300, width: SCR.w, height: 300, backgroundColor: "#FFFFFF", borderTop: "2px solid #DCE3EC" })}>
        <div style={box({ left: 24, top: 24, width: SCR.w - 150, minHeight: 90, maxHeight: 250, overflow: "hidden", backgroundColor: "#F3F5F8", borderRadius: 30, padding: "18px 24px", boxSizing: "border-box" })}>
          <div style={{ fontFamily: F.text, fontWeight: 500, fontSize: 32, lineHeight: 1.25, color: shown && !isSent ? C.ink : "#9AA3B2" }}>{isSent ? "Билдирүү…" : shown || "Билдирүү…"}</div>
        </div>
        <div style={box({ left: SCR.w - 108, top: 30, width: 84, height: 84, borderRadius: 42, backgroundColor: shown && !isSent ? C.green : "#C9D2DE" })}>
          <svg width={84} height={84}>
            <path d="M 26 44 L 58 30 L 46 60 L 42 47 Z" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};
// точки касания на экране переписки (координаты кадра)
export const CHAT_SEND: Vec = { x: SCR.x + SCR.w - 66, y: SCR.y + SCR.h - 228 };
export const CHAT_INPUT: Vec = { x: SCR.x + SCR.w / 2 - 60, y: SCR.y + SCR.h - 220 };

// ---------- Календарь ----------
export const CalendarScreen: React.FC<{ readonly item: string; readonly early: string; readonly mark?: number; readonly accent?: string }> = ({ item, early, mark = 0, accent = C.blue }) => (
  <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: "#FFFFFF" })}>
    <div style={T({ left: 30, top: 34, fontWeight: 800, fontSize: 48 })}>{CH2_TEXT.calendar.title}</div>
    {CH2_TEXT.calendar.days.map((d, i) => (
      <div key={d} style={box({ left: 24, top: 140 + i * 300, width: SCR.w - 48, height: 270 })}>
        <div style={T({ left: 6, top: 0, fontWeight: 800, fontSize: 36, color: C.inkSoft })}>{d}</div>
        <div style={box({ left: 0, top: 58, width: SCR.w - 48, height: 70, backgroundColor: "#EEF2F7", borderRadius: 14 })}>
          <div style={T({ left: 22, top: 14, fontWeight: 500, fontSize: 32, color: C.inkSoft })}>11:00 · {early}</div>
        </div>
        <div style={box({ left: 0, top: 144, width: SCR.w - 48, height: 96, backgroundColor: accent, borderRadius: 14, boxShadow: mark > 0 ? `0 0 0 ${6 * mark}px ${C.yellow}` : "none" })}>
          <div style={T({ left: 22, top: 26, fontWeight: 800, fontSize: 34, color: "#FFFFFF", whiteSpace: "nowrap" })}>
            {CH2_TEXT.calendar.time} · {item}
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ---------- Поиск, страница BalaGo, форма ----------
export type WebState = "search" | "results" | "page" | "form" | "sent";
export const WebScreen: React.FC<{ readonly state: WebState; readonly typed?: number; readonly pressed?: string | null; readonly filled?: number; readonly sentT?: number }> = ({ state, typed = 1, pressed = null, filled = 1, sentT = 0 }) => {
  const q = CH2_TEXT.search.query;
  const shown = q.slice(0, Math.round(q.length * clamp(typed)));
  const Fm = CH2_TEXT.form;
  return (
    <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: "#FBF9F5", overflow: "hidden" })}>
      {state === "search" || state === "results" ? (
        <>
          <div style={box({ left: 26, top: 60, width: SCR.w - 52, height: 92, backgroundColor: "#FFFFFF", border: `4px solid ${C.blue}`, borderRadius: 46, boxSizing: "border-box" })}>
            <div style={T({ left: 30, top: 20, fontWeight: 800, fontSize: 34, color: shown ? C.ink : "#9AA3B2", whiteSpace: "nowrap" })}>{shown || CH2_TEXT.search.hint}</div>
          </div>
          {state === "search" ? (
            <div style={box({ left: 0, top: SCR.h - 380, width: SCR.w, height: 380, backgroundColor: "#D9DDE4" })}>
              {Array.from({ length: 4 }).map((_, r) =>
                Array.from({ length: 10 }).map((__, c) => <div key={`${r}${c}`} style={box({ left: 10 + c * ((SCR.w - 20) / 10), top: 22 + r * 88, width: (SCR.w - 20) / 10 - 8, height: 70, backgroundColor: "#FFFFFF", borderRadius: 10 })} />),
              )}
            </div>
          ) : (
            <>
              <div style={box({ left: 26, top: 200, width: SCR.w - 52, height: 170, backgroundColor: pressed === "result" ? "#FFF3C4" : "#FFFFFF", borderRadius: 20, border: `3px solid ${C.yellow}`, boxSizing: "border-box" })}>
                <Img src={staticFile("assets/logo.png")} style={box({ left: 20, top: 22, width: 124, height: 124 })} />
                <div style={T({ left: 166, top: 36, fontWeight: 800, fontSize: 44 })}>{CH2_TEXT.brand}</div>
                <div style={T({ left: 166, top: 96, fontWeight: 500, fontSize: 32, color: C.inkSoft })}>{CH2_TEXT.tagline}</div>
              </div>
              {CH2_TEXT.results.map((t, i) => (
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
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 520, backgroundColor: C.yellow })} />
          <Img src={staticFile("assets/logo.png")} style={box({ left: SCR.w / 2 - 190, top: 40, width: 380, height: 378 })} />
          <div style={T({ left: 0, top: 430, width: SCR.w, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 52 })}>{CH2_TEXT.tagline}</div>
          <div style={T({ left: 36, top: 580, width: SCR.w - 72, fontWeight: 500, fontSize: 38, lineHeight: 1.3 })}>{CH2_TEXT.page.info}</div>
          <div style={box({ left: 36, top: 780, width: SCR.w - 72, height: 118, backgroundColor: pressed === "cta" ? "#0F1E33" : C.navy, borderRadius: 24, transform: `scale(${pressed === "cta" ? 0.97 : 1})` })}>
            <div style={T({ left: 0, top: 30, width: SCR.w - 72, textAlign: "center", fontWeight: 800, fontSize: 44, color: "#FFFFFF" })}>{CH2_TEXT.page.cta}</div>
          </div>
        </>
      ) : null}
      {state === "form" || state === "sent" ? (
        <>
          <div style={box({ left: 0, top: 0, width: SCR.w, height: 132, backgroundColor: C.yellow })} />
          <div style={T({ left: 30, top: 38, fontFamily: F.display, fontWeight: 900, fontSize: 50 })}>{Fm.title}</div>
          {[Fm.route, Fm.when, Fm.days, Fm.time].map((t, i) => (
            <div key={t} style={box({ left: 30, top: 172 + i * 140, width: SCR.w - 60, height: 112, backgroundColor: "#FFFFFF", border: `4px solid ${filled > i ? C.blue : "#D6D0C4"}`, borderRadius: 18, boxSizing: "border-box" })}>
              <div style={T({ left: 24, top: 30, fontWeight: 800, fontSize: i === 2 ? 30 : 36, opacity: clamp((filled - i) * 1.5), whiteSpace: "nowrap" })}>{t}</div>
            </div>
          ))}
          <div style={box({ left: 30, top: 760, width: SCR.w - 60, height: 124, backgroundColor: pressed === "send" ? "#0F1E33" : C.navy, borderRadius: 24, transform: `scale(${pressed === "send" ? 0.97 : 1})` })}>
            <div style={T({ left: 0, top: 32, width: SCR.w - 60, textAlign: "center", fontWeight: 800, fontSize: 48, color: "#FFFFFF" })}>{Fm.send}</div>
          </div>
          {state === "sent" ? (
            <div style={box({ left: 0, top: 0, width: SCR.w, height: SCR.h, backgroundColor: `rgba(251,249,245,${0.95 * easeOut(clamp(sentT / 8))})` })}>
              <div style={box({ left: SCR.w / 2 - 90, top: 300, width: 180, height: 180, borderRadius: 90, backgroundColor: C.green, transform: `scale(${easeOut(clamp(sentT / 10))})` })}>
                <svg width={180} height={180}>
                  <path d="M 50 92 l 28 28 l 54 -58" stroke="#FFFFFF" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={T({ left: 30, top: 540, width: SCR.w - 60, textAlign: "center", fontFamily: F.display, fontWeight: 900, fontSize: 60, lineHeight: 1.1, opacity: clamp((sentT - 4) / 6) })}>{Fm.sent}</div>
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
  cta: { x: SCR.x + SCR.w / 2, y: SCR.y + 839 },
  send: { x: SCR.x + SCR.w / 2, y: SCR.y + 822 },
  key: (i: number): Vec => ({ x: SCR.x + 40 + ((i * 7) % 10) * ((SCR.w - 60) / 10), y: SCR.y + SCR.h - 330 + ((i * 3) % 4) * 88 }),
} as const;

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
