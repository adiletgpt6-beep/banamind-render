// WhatsApp-подобный экран чата (иллюстрация, без логотипа приложения):
// шапка с именем чата, сообщения, поле ввода с кнопкой «жөнөтүү».
// Используется в хуке (мама сама отправляет предзаполненный арыз), в
// начале шага 1 (лента выходит из отправленного сообщения) и в шагах 5–6
// (группа родителей, водитель сам пишет сообщения).
// Размер задаётся w × h (обычно экран телефона SCR из Phone.tsx).
import { Img, staticFile } from "remotion";
import { Avatar, Bubble, IconPath } from "../art";
import { box } from "../kit";
import { clamp, easeOut } from "../rig/motion";
import { BG25_VIDEO } from "../script";
import { C, F } from "../theme";

export type ChatMsg = {
  readonly out?: boolean;
  readonly author?: string;
  readonly lines: readonly string[];
  readonly time?: string;
  readonly ticks?: number;
  // 0…1 — появление (снизу, с лёгким масштабом); 1 — на месте
  readonly appear?: number;
  // выделение сообщения (мягкая жёлтая обводка), 0…1
  readonly mark?: number;
};

export const ChatScreen: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly title: string;
  readonly subtitle?: string;
  readonly avatar?: "logo" | "group";
  readonly msgs: readonly ChatMsg[];
  // предзаполненный текст в поле ввода (null — поле пустое)
  readonly draft?: readonly string[] | null;
  // 0…1 — нажатие кнопки отправки (подсветка, лёгкое вдавливание)
  readonly sendPress?: number;
  readonly size?: number; // размер шрифта сообщений
  readonly scrollY?: number; // сдвиг ленты сообщений вверх, px
}> = ({ w, h, title, subtitle, avatar = "logo", msgs, draft = null, sendPress = 0, size = 28, scrollY = 0 }) => {
  const top = 118;
  const inputH = draft ? Math.min(h * 0.6, 70 + draft.length * size * 0.86 * 1.28 * 1.6) : 92;
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, overflow: "hidden", backgroundColor: C.chatBg, fontFamily: F.text })}>
      {/* узор фона — редкие светлые точки */}
      <div style={box({ inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 2px, transparent 2.6px)", backgroundSize: "34px 34px" })} />
      {/* сообщения */}
      <div
        style={box({
          left: 18,
          right: 18,
          top: top + 18,
          bottom: inputH + 26,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: 14,
          transform: `translateY(${-scrollY}px)`,
        })}
      >
        {msgs.map((m, i) => {
          const a = clamp(m.appear ?? 1);
          if (a <= 0) return null;
          const k = easeOut(a);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                opacity: clamp(k * 1.6),
                transform: `translateY(${(1 - k) * 40}px) scale(${0.9 + 0.1 * k})`,
                transformOrigin: m.out ? "100% 100%" : "0% 100%",
              }}
            >
              <Bubble
                out={m.out}
                author={m.author}
                time={m.time}
                ticks={m.ticks}
                size={size}
                style={m.mark ? { boxShadow: `0 0 0 ${5 * m.mark}px ${C.yellow}, 0 2px 4px rgba(0,0,0,0.08)` } : undefined}
              >
                {m.lines.map((l, j) => (
                  <div key={j} style={{ marginTop: j && !l ? size * 0.4 : 0 }}>
                    {l}
                  </div>
                ))}
              </Bubble>
            </div>
          );
        })}
      </div>
      {/* шапка */}
      <div style={box({ left: 0, right: 0, top: 0, height: top, backgroundColor: C.chatTop, display: "flex", alignItems: "center", gap: 16, padding: "0 20px" })}>
        <svg width={30} height={30} viewBox="0 0 24 24">
          <path d="M15 4 L7 12 L15 20" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {avatar === "logo" ? (
          <Img src={staticFile(BG25_VIDEO.logo)} style={{ width: 76, height: 76, borderRadius: 38, objectFit: "cover", backgroundColor: "#FFFFFF" }} />
        ) : (
          <Avatar s={76} bg="#D6EFE6" fg={C.chatTop} />
        )}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ color: "#FFFFFF", fontWeight: 900, fontSize: 34, whiteSpace: "nowrap" }}>{title}</div>
          {subtitle ? <div style={{ color: "rgba(255,255,255,0.82)", fontWeight: 700, fontSize: 22, whiteSpace: "nowrap" }}>{subtitle}</div> : null}
        </div>
      </div>
      {/* поле ввода и кнопка отправки */}
      <div style={box({ left: 14, right: 14, bottom: 16, height: inputH, display: "flex", alignItems: "flex-end", gap: 12 })}>
        <div
          style={{
            flex: 1,
            height: "100%",
            borderRadius: 30,
            backgroundColor: "#FFFFFF",
            padding: "16px 22px",
            boxSizing: "border-box",
            fontSize: draft ? size * 0.86 : size * 0.92,
            fontWeight: 700,
            lineHeight: 1.28,
            color: draft ? "#1F2A33" : "#9AA7B0",
            overflow: "hidden",
          }}
        >
          {draft ? draft.map((l, i) => <div key={i}>{l || " "}</div>) : <div>Билдирүү</div>}
        </div>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            flexShrink: 0,
            backgroundColor: sendPress > 0 ? "#168A55" : "#1FA463",
            transform: `scale(${1 - 0.08 * Math.sin(Math.PI * clamp(sendPress))})`,
            boxShadow: sendPress > 0 ? `0 0 0 ${10 * Math.sin(Math.PI * clamp(sendPress))}px rgba(31,164,99,0.25)` : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={46} height={46} viewBox="0 0 48 48">
            <IconPath kind="send" color="#FFFFFF" />
          </svg>
        </div>
      </div>
    </div>
  );
};
