// Хук и начало шага 1: телефон мамы крупно. Экран 1 — схематичная форма
// сайта BalaGo (три поля и жёлтая кнопка), экран 2 — WhatsApp-чат с
// предзаполненным арызом, который мама САМА отправляет (одна серая
// галочка, без ответа и «серверного» подтверждения).
// Координаты — кадр 1080×1920 (как у PhoneClose): корпус PH, экран SCR.
import { Img, staticFile } from "remotion";
import { Bubble, Icon, WaBadge, type IconKind } from "../art";
import { box, Svg } from "../kit";
import { ChatScreen } from "../props/Chat";
import { CloseHand, SKIN } from "../props/CloseHand";
import { fingerAt, PH, SCR, type Tap } from "../props/Phone";
import { clamp, easeOut } from "../rig/motion";
import { BG25_TEXT, BG25_VIDEO } from "../script";
import { C, F } from "../theme";

export const CASE = C.yellow; // чехол телефона мамы (и в среднем плане)
export const SENT_TIME = "12:30";

// ---------- Форма сайта ----------
export const FORM = { headerH: 112, titleY: 150, fieldY0: 262, fieldStep: 172, inputDy: 48, inputH: 88, submitY: 808, submitH: 116 } as const;
const FIELD_ICONS: readonly IconKind[] = ["home", "school", "clock"];

// Точка касания поля i / кнопки (координаты кадра).
export const fieldTip = (i: number) => ({ x: SCR.x + SCR.w * 0.62, y: SCR.y + FORM.fieldY0 + i * FORM.fieldStep + FORM.inputDy + FORM.inputH * 0.55 });
export const submitTip = () => ({ x: SCR.x + SCR.w * 0.6, y: SCR.y + FORM.submitY + FORM.submitH * 0.55 });
// Кнопка отправки ChatScreen (84×84, отступы 14/16 от края экрана).
export const sendTip = () => ({ x: SCR.x + SCR.w - 14 - 42, y: SCR.y + SCR.h - 16 - 42 });

export const FormScreen: React.FC<{
  readonly f: number;
  readonly typed: readonly number[]; // сколько букв уже введено в каждое поле
  readonly focus: number; // активное поле (−1 — нет)
  readonly press: number; // 0…1 — нажатие кнопки
}> = ({ f, typed, focus, press }) => {
  const caretOn = Math.floor(f / 8) % 2 === 0;
  const pk = Math.sin(Math.PI * clamp(press));
  return (
    <div style={box({ inset: 0, backgroundColor: C.bg, fontFamily: F.text, overflow: "hidden" })}>
      {/* шапка сайта */}
      <div style={box({ left: 0, right: 0, top: 0, height: FORM.headerH, backgroundColor: C.white, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", boxShadow: "0 4px 14px rgba(20,40,90,0.08)" })}>
        <Img src={staticFile(BG25_VIDEO.logo)} style={{ width: 66, height: 66, borderRadius: 33, objectFit: "cover", backgroundColor: C.white, border: `3px solid ${C.yellow}` }} />
        <div style={{ fontWeight: 900, fontSize: 40, color: C.navy, letterSpacing: 0.5 }}>{BG25_TEXT.hook.site}</div>
        <div style={{ flex: 1 }} />
        {[0, 1, 2].map((k) => (
          <div key={k} style={box({ right: 28, top: 40 + k * 14, width: 36, height: 6, borderRadius: 3, backgroundColor: C.navy })} />
        ))}
      </div>
      <div style={box({ left: 0, right: 0, top: FORM.headerH, height: 8, backgroundColor: C.yellow })} />
      {/* заголовок формы */}
      <div style={box({ left: 32, top: FORM.titleY, fontWeight: 900, fontSize: 60, color: C.navy, lineHeight: 1 })}>{BG25_TEXT.hook.formTitle}</div>
      <div style={box({ left: 34, top: FORM.titleY + 70, width: 92, height: 8, borderRadius: 4, backgroundColor: C.yellow })} />
      {/* три поля */}
      {BG25_TEXT.hook.fields.map((fl, i) => {
        const y = FORM.fieldY0 + i * FORM.fieldStep;
        const n = Math.max(0, Math.min(fl.v.length, typed[i] ?? 0));
        const on = focus === i;
        const full = n >= fl.v.length;
        return (
          <div key={fl.k}>
            <div style={box({ left: 34, top: y, display: "flex", alignItems: "center", gap: 12 })}>
              <Icon kind={FIELD_ICONS[i]} s={36} color={full ? C.navy : C.inkSoft} w={4.6} />
              <div style={{ fontWeight: 900, fontSize: 30, color: full ? C.navy : C.inkSoft }}>{fl.k}</div>
            </div>
            <div
              style={box({
                left: 28,
                right: 28,
                top: y + FORM.inputDy,
                height: FORM.inputH,
                borderRadius: 20,
                backgroundColor: C.white,
                border: `4px solid ${on ? C.yellow : full ? C.blueSoft : C.line}`,
                boxShadow: on ? "0 0 0 6px rgba(255,201,14,0.22)" : "none",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                padding: "0 22px",
                fontWeight: 800,
                fontSize: 32,
                color: C.navy,
                whiteSpace: "nowrap",
                overflow: "hidden",
              })}
            >
              {fl.v.slice(0, n)}
              {on && !full && caretOn ? <span style={{ display: "inline-block", width: 3, height: 36, marginLeft: 2, backgroundColor: C.navy }} /> : null}
              {full ? (
                <div style={{ marginLeft: "auto", display: "flex" }}>
                  <Icon kind="check" s={34} color={C.green} w={5} />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {/* жёлтая кнопка: сайт открывает WhatsApp */}
      <div
        style={box({
          left: 28,
          right: 28,
          top: FORM.submitY,
          height: FORM.submitH,
          borderRadius: 60,
          backgroundColor: press > 0 ? C.yellowDeep : C.yellow,
          transform: `scale(${1 - 0.04 * pk})`,
          boxShadow: `0 ${12 - 8 * pk}px 24px rgba(233,176,0,0.35)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontWeight: 900,
          fontSize: 40,
          color: C.navy,
        })}
      >
        <WaBadge s={50} />
        {BG25_TEXT.hook.submit}
      </div>
    </div>
  );
};

// ---------- Чат с арызом ----------
// draft — текст ещё в поле ввода; sent 0…1 — исходящий пузырь появился.
export const SentChat: React.FC<{ readonly draft: boolean; readonly sent: number; readonly sendPress?: number }> = ({ draft, sent, sendPress = 0 }) => (
  <ChatScreen
    w={SCR.w}
    h={SCR.h}
    title={BG25_TEXT.hook.chatName}
    subtitle={BG25_TEXT.hook.chatSub}
    avatar="logo"
    msgs={sent > 0 ? [{ out: true, lines: BG25_TEXT.hook.message, time: SENT_TIME, ticks: 1, appear: sent }] : []}
    draft={draft ? BG25_TEXT.hook.message : null}
    sendPress={sendPress}
    size={28}
  />
);

// Пузырь отправленного сообщения отдельно (та же раскладка, что в
// ChatScreen: прижат вправо и вниз над пустым полем ввода высотой 92).
// Нужен шагу 1: лента выходит точно из-под его нижнего края.
export const BUBBLE_BOTTOM = SCR.h - 92 - 26; // низ пузыря внутри SCR
export const BUBBLE_W = (SCR.w - 36) * 0.84; // ширина (длинные строки переносятся)
export const bubbleBottomFrame = () => ({ x: SCR.x + SCR.w - 18 - BUBBLE_W / 2, y: SCR.y + BUBBLE_BOTTOM });

export const SentBubble: React.FC<{ readonly mark?: number }> = ({ mark = 0 }) => (
  <div style={box({ left: 18, right: 18, top: 136, height: BUBBLE_BOTTOM - 136, display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: F.text })}>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Bubble out time={SENT_TIME} ticks={1} size={28} style={mark ? { boxShadow: `0 0 0 ${5 * mark}px ${C.yellow}, 0 2px 4px rgba(0,0,0,0.08)` } : undefined}>
        {BG25_TEXT.hook.message.map((l, j) => (
          <div key={j}>{l}</div>
        ))}
      </Bubble>
    </div>
  </div>
);

// ---------- Телефон в руках (без фона кадра) ----------
// Как PhoneClose, но прозрачный: слой можно масштабировать камерой и
// растворять поверх другого плана.
const TAP_L = 210;
const TAP_ANG = 150;
const wristFor = (tip: { x: number; y: number }) => {
  const r = (TAP_ANG * Math.PI) / 180;
  const lx = 0.78 * TAP_L * 0.22;
  const ly = TAP_L * 1.1;
  return { x: tip.x - (lx * Math.cos(r) - ly * Math.sin(r)), y: tip.y - (lx * Math.sin(r) + ly * Math.cos(r)) };
};

export const PhoneInHands: React.FC<{
  readonly f: number;
  readonly taps: readonly Tap[];
  readonly pointer?: boolean; // показывать руку с указательным пальцем
  readonly children: React.ReactNode;
}> = ({ f, taps, pointer = true, children }) => {
  const { tip, press } = fingerAt(f, taps);
  const w = wristFor(tip);
  const pressAge = taps.reduce((acc, t) => (f >= t.at && f < t.at + 10 ? f - t.at : acc), -1);
  const ring = taps.find((t) => f >= t.at && f < t.at + 10);
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>
      <div style={box({ left: PH.x + 22, top: PH.y + 30, width: PH.w, height: PH.h, backgroundColor: "rgba(23,42,70,0.16)", borderRadius: 64, filter: "blur(6px)" })} />
      <div style={box({ left: PH.x, top: PH.y, width: PH.w, height: PH.h, backgroundColor: CASE, borderRadius: 64 })} />
      <div style={box({ left: PH.x + 5, top: PH.y + 5, width: PH.w - 10, height: 40, borderRadius: "60px 60px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0))" })} />
      <div style={box({ left: PH.x + 12, top: PH.y + 12, width: PH.w - 24, height: PH.h - 24, backgroundColor: "#1E2235", borderRadius: 54 })} />
      <div style={box({ left: PH.x + PH.w / 2 - 50, top: PH.y + 34, width: 100, height: 14, borderRadius: 7, backgroundColor: "#2E344C" })} />
      <div style={box({ left: SCR.x, top: SCR.y, width: SCR.w, height: SCR.h, overflow: "hidden", borderRadius: 26 })}>{children}</div>
      <Svg>
        <CloseHand x={PH.x + 110} y={PH.y + PH.h + 160} angle={-170} size={250} {...SKIN.apa} shape="grip" mirror armLen={3} />
        {pointer ? <CloseHand x={w.x} y={w.y + (press ? 4 : 0)} angle={TAP_ANG} size={TAP_L} {...SKIN.apa} shape="point" armLen={4} /> : null}
        {ring && pressAge >= 0 ? (
          <circle cx={ring.tip.x} cy={ring.tip.y} r={22 + pressAge * 4} fill="none" stroke={C.blue} strokeWidth={6} opacity={0.55 * (1 - easeOut(pressAge / 10))} />
        ) : null}
      </Svg>
    </div>
  );
};
