// Общий телефон с WhatsApp-группой каттама для сцен group и location:
// одинаковая геометрия, чтобы стык сцен был бесшовным. Внутри экрана —
// абсолютные координаты (px экрана телефона).
import { C } from "../palette";
import { abs, ChatHeader, font, PhoneFrame } from "../parts";
import { BG26_TEXT } from "../script";

export const PHONE = { x: 100, y: 345, w: 880, h: 1490 } as const;
export const BEZ = Math.round(PHONE.w * 0.035);
export const SCREEN_W = PHONE.w - 2 * BEZ;
// экран → кадр
export const toFrame = (x: number, y: number) => ({ x: PHONE.x + BEZ + x, y: PHONE.y + BEZ + y });

// Вертикальная раскладка ленты чата (px экрана, до прокрутки).
export const CHAT_Y = {
  sys: 186,
  members: 288,
  vignette: 362,
  msg1: 734,
  msg2: 870,
  link: 1006,
  msg3: 1411,
  reply: 1547,
} as const;

// Высота врезки с водителем (px экрана).
export const VIGNETTE_H = 360;

export const ChatPhone: React.FC<{ readonly clock: string; readonly cover?: number; readonly children: React.ReactNode }> = ({ clock, cover = 0, children }) => (
  <PhoneFrame x={PHONE.x} y={PHONE.y} w={PHONE.w} h={PHONE.h} clock={clock}>
    {/* обои чата */}
    <div style={abs({ inset: 0, background: C.chatBg, backgroundImage: "radial-gradient(rgba(150,130,100,0.10) 3px, transparent 4px)", backgroundSize: "54px 54px" })} />
    {children}
    <ChatHeader title={BG26_TEXT.chat.groupTitle} sub={BG26_TEXT.chat.members} />
    {/* стык со сценой сайта: белый экран растворяется в чат */}
    {cover > 0 ? <div style={abs({ inset: 0, background: "#FFFFFF", opacity: cover })} /> : null}
  </PhoneFrame>
);

// Участники группы (без фото — обобщённые аватары).
export const Members: React.FC<{ readonly p: number }> = ({ p }) => {
  const [driver, dad, mom] = BG26_TEXT.chat.memberNames;
  const people = [
    { n: driver, c: "#C2571A" },
    { n: dad, c: "#4E6FA8" },
    { n: mom, c: "#B4518A" },
    { n: "+2", c: "#6A7AA0" },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
      {people.map((m, i) => {
        const k = Math.max(0, Math.min(1, p * 4 - i));
        return (
          <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px 8px 8px", borderRadius: 999, background: "#FFFFFF", opacity: k, transform: `scale(${0.7 + 0.3 * k})`, boxShadow: "0 2px 0 rgba(0,0,0,0.05)" }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: m.c, display: "flex", alignItems: "center", justifyContent: "center", ...font(24, 900, "#FFFFFF") }}>{m.n === "+2" ? "+2" : m.n[0]}</div>
            {m.n === "+2" ? null : <div style={font(26, 800, "#2A3550")}>{m.n}</div>}
          </div>
        );
      })}
    </div>
  );
};
