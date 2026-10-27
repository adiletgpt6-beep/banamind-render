// Печать панели 5/6 бумажной ленты (координаты панели RIB.w × RIB.h):
// «Ата-энелердин WhatsApp тобу». Бумажная карточка группового чата:
// зелёная шапка с аватаром группы, названием «Каттамдын ата-энелери» и
// подзаголовком «Ата-энелер • Айдоочу»; ряд участников — три родителя и
// постоянный водитель (подпись «Айдоочу», значок машины); ниже — поле
// сообщений. Водитель сам пишет «Жолго чыктым» и «Жеткирдим» — обычные
// входящие пузыри (без галочек «прочитано», без системных значков).
// t — кадры с момента, когда панель легла плашмя (большое t — итог).
// Сцена шага 5–6 передаёт свои моменты появления (show); по умолчанию
// всё видно — итог для следующих сцен и финала.
import { Avatar, Bubble, Icon } from "../art";
import { box, settle } from "../kit";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { BG25_TEXT } from "../script";
import { C, F } from "../theme";

const T = BG25_TEXT.step56;
// итог (как DONE в panels/index.ts; без циклического импорта)
const DONE = 9999;

export type P5Show = {
  readonly ink?: number; // кадры от «окрашивания» шапки группы
  readonly pulse?: number; // 0…1 — мягкая подсветка мест родителей
  readonly joins?: readonly number[]; // кадры от появления участников (4)
  readonly msgs?: readonly number[]; // кадры от появления сообщений (2)
};

// Карточка на панели и её части (координаты панели).
export const P5_CARD = { x: 40, y: 84, w: 716, h: 508, head: 100, row: 156, r: 28, border: 3 } as const;
// Поле сообщений (внутри рамки карточки) — сцена накрывает им итоговую
// печать, пока водитель ещё не написал.
export const P5_CHAT = {
  x: P5_CARD.x + P5_CARD.border,
  y: P5_CARD.y + P5_CARD.head + P5_CARD.row,
  w: P5_CARD.w - 2 * P5_CARD.border,
  h: P5_CARD.h - P5_CARD.head - P5_CARD.row - P5_CARD.border,
} as const;

const HEAD_PALE = "#E1EBE6";
const INK_DUR = 14;

// Шапка группы. До «окрашивания» — бледная, затем зелёная заливка
// проходит слева направо, и надписи под ней становятся белыми.
export const P5Head: React.FC<{ readonly w: number; readonly h: number; readonly ink?: number; readonly title?: number }> = ({ w, h, ink = DONE, title = 34 }) => {
  const k = easeInOut(ink / INK_DUR);
  const content = (on: boolean) => (
    <div style={box({ left: 0, top: 0, width: w, height: h, display: "flex", alignItems: "center", gap: h * 0.18, padding: `0 ${h * 0.24}px`, boxSizing: "border-box" })}>
      <div style={{ opacity: on ? 1 : 0.55, flexShrink: 0, display: "flex" }}>
        <Avatar s={h * 0.68} bg={on ? "#D6EFE6" : "#F4F8F6"} fg={on ? C.chatTop : "#A9BDB5"} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ color: on ? C.white : "#93A9A0", fontFamily: F.text, fontWeight: 900, fontSize: title, lineHeight: 1.08, whiteSpace: "nowrap" }}>{T.group}</div>
        <div style={{ color: on ? "rgba(255,255,255,0.85)" : "#A9BBB4", fontFamily: F.text, fontWeight: 700, fontSize: title * 0.7, lineHeight: 1.15, whiteSpace: "nowrap" }}>{T.members}</div>
      </div>
    </div>
  );
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: HEAD_PALE, overflow: "hidden" })}>
      {k < 1 ? content(false) : null}
      {k > 0 ? (
        <div style={box({ left: 0, top: 0, width: w * k, height: h, overflow: "hidden", backgroundColor: C.chatTop })}>
          {content(true)}
        </div>
      ) : null}
    </div>
  );
};

// Участники: три родителя и водитель. До появления — пунктирное место.
const MEMBERS = [
  { bg: "#FFE9A6", fg: "#9A7420" },
  { bg: C.skyDeep, fg: C.navy },
  { bg: "#F6D6CC", fg: "#A35F4E" },
  { bg: C.navy, fg: C.white },
] as const;
const AV = 96;

const Member: React.FC<{ readonly i: number; readonly t: number; readonly pulse: number }> = ({ i, t, pulse }) => {
  const m = MEMBERS[i];
  const driver = i === 3;
  const k = t >= 0 ? settle(t, 14) : 0;
  const ring = t >= 0 && t < 18 ? t / 18 : -1;
  const glow = driver ? 0 : pulse;
  return (
    <div style={{ position: "relative", width: AV + 40, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: AV, height: AV }}>
        {/* пустое место участника */}
        <div
          style={box({
            inset: 0,
            borderRadius: 999,
            border: `4px dashed ${glow > 0.01 ? C.yellowDeep : "#C3CEDC"}`,
            backgroundColor: glow > 0.01 ? `rgba(255,243,196,${0.9 * glow})` : "transparent",
            boxSizing: "border-box",
            opacity: 1 - clamp(k * 1.4),
          })}
        />
        {ring >= 0 ? <div style={box({ left: AV / 2 - (AV / 2) * (1 + 0.5 * ring), top: AV / 2 - (AV / 2) * (1 + 0.5 * ring), width: AV * (1 + 0.5 * ring), height: AV * (1 + 0.5 * ring), borderRadius: 999, border: `4px solid ${C.yellow}`, boxSizing: "border-box", opacity: 0.8 * (1 - ring) })} /> : null}
        {k > 0 ? (
          <div style={box({ inset: 0, transform: `scale(${0.35 + 0.65 * k})`, opacity: clamp(k * 1.8) })}>
            <Avatar s={AV} bg={m.bg} fg={m.fg} />
            {driver ? (
              <div style={box({ right: -10, bottom: -6, width: 46, height: 46, borderRadius: 999, backgroundColor: C.yellow, border: `3px solid ${C.white}`, display: "flex", alignItems: "center", justifyContent: "center" })}>
                <Icon kind="car" s={32} color={C.navy} w={5} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {driver ? (
        <div style={{ marginTop: 6, fontFamily: F.text, fontWeight: 900, fontSize: 28, lineHeight: 1.05, color: C.navy, opacity: clamp(k * 1.5) }}>{T.driver}</div>
      ) : null}
    </div>
  );
};

// Поле сообщений: фон чата и входящие пузыри водителя (сверху вниз).
export const P5Chat: React.FC<{ readonly w: number; readonly h: number; readonly msgs?: readonly number[]; readonly size?: number; readonly round?: number; readonly pad?: number }> = ({
  w,
  h,
  msgs = [DONE, DONE],
  size = 31,
  round = P5_CARD.r - P5_CARD.border,
  pad = 18,
}) => (
  <div style={box({ left: 0, top: 0, width: w, height: h, backgroundColor: C.chatBg, overflow: "hidden", borderRadius: `0 0 ${round}px ${round}px` })}>
    <div style={box({ inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 2px, transparent 2.6px)", backgroundSize: "30px 30px" })} />
    {/* пустой чат: бледный значок, пока сообщений нет */}
    <div style={box({ left: w / 2 - 40, top: h / 2 - 40, width: 80, height: 80, opacity: 0.22 * (1 - clamp(((msgs[0] ?? DONE) + 1) / 8)) })}>
      <Icon kind="chat" s={80} color={C.inkSoft} w={3.6} />
    </div>
    <div style={box({ left: pad, right: pad, top: pad, display: "flex", flexDirection: "column", alignItems: "stretch", gap: size * 0.42 })}>
      {[T.msg1, T.msg2].map((text, i) => {
        const t = msgs[i] ?? DONE;
        if (t < 0) return null;
        const k = easeOut(t / 10);
        // короткая мягкая подсветка нового сообщения
        const ping = t < 26 ? Math.sin(Math.PI * clamp(t / 26)) : 0;
        return (
          <div key={i} style={{ display: "flex", width: "100%", opacity: clamp(k * 1.6), transform: `translateY(${(1 - k) * 26}px) scale(${0.9 + 0.1 * k})`, transformOrigin: "0% 0%" }}>
            <Bubble author={T.driver} size={size} style={{ whiteSpace: "nowrap", boxShadow: `0 0 0 ${6 * ping}px rgba(255,201,14,0.55), 0 2px 4px rgba(0,0,0,0.08)` }}>
              {text}
            </Bubble>
          </div>
        );
      })}
    </div>
  </div>
);

export const P5Art: React.FC<{ readonly t: number; readonly show?: P5Show }> = ({ show }) => {
  const ink = show?.ink ?? DONE;
  const pulse = show?.pulse ?? 0;
  const joins = show?.joins ?? [DONE, DONE, DONE, DONE];
  const msgs = show?.msgs ?? [DONE, DONE];
  const { x, y, w, h, head, row, r, border } = P5_CARD;
  return (
    <>
      {/* карточка группы */}
      <div style={box({ left: x, top: y, width: w, height: h, borderRadius: r, backgroundColor: C.white, overflow: "hidden", boxShadow: "0 6px 0 rgba(20,40,90,0.05)" })}>
        <div style={box({ left: 0, top: 0, width: w, height: head })}>
          <P5Head w={w} h={head} ink={ink} />
        </div>
        {/* ряд участников */}
        <div style={box({ left: 0, top: head, width: w, height: row, display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 16, gap: 22, boxSizing: "border-box" })}>
          {[0, 1, 2, 3].map((i) => (
            <Member key={i} i={i} t={joins[i] ?? DONE} pulse={pulse} />
          ))}
        </div>
        <div style={box({ left: 0, right: 0, top: head + row - 2, height: 2, backgroundColor: "#E4EAF1" })} />
      </div>
      {/* поле сообщений */}
      <div style={box({ left: P5_CHAT.x, top: P5_CHAT.y, width: P5_CHAT.w, height: P5_CHAT.h })}>
        <P5Chat w={P5_CHAT.w} h={P5_CHAT.h} msgs={msgs} />
      </div>
      {/* тонкая рамка карточки поверх */}
      <div style={box({ left: x, top: y, width: w, height: h, borderRadius: r, border: `${border}px solid #D5DEE9`, boxSizing: "border-box" })} />
    </>
  );
};
