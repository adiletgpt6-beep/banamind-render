// Телефон мамы (сцены «start» и «cta»): одна и та же отрисовка, чтобы
// склейка «телефон → финал» совпадала до пикселя.
//   • сайт BalaGo: форма «Каттоо» — үй дареги, мектеп, сабак убактысы;
//     кнопка «WhatsApp аркылуу жөнөтүү» открывает подготовленное сообщение;
//   • WhatsApp: чат «BalaGo», сообщение уже в поле ввода — мама САМА
//     нажимает «отправить»; после отправки — пузырь с одной серой
//     галочкой (отправлено). Никакого «заявка принята/подтверждена».
import { fontFamily } from "../../../fonts";
import { box, clamp01, easeInOut, easeOut, INK, NAVY, NAVY_SOFT, SendIcon, WA_GREEN, YELLOW } from "../art";
import { BG41_TEXT } from "../script";
import { Img, staticFile } from "remotion";

const S = BG41_TEXT.start;

// Положение телефона в кадре (экранные px) — общее для start и cta.
export const PHONE = { x: 540, y: 598, w: 420, h: 852 } as const;
export const SCREEN_INSET = 16;
export const SW = PHONE.w - 2 * SCREEN_INSET;
export const SH = PHONE.h - 2 * SCREEN_INSET;

export type PhoneState = {
  readonly typed: readonly [number, number, number]; // доля набранных букв в полях
  readonly active: number; // активное поле (каретка), −1 — нет
  readonly button: number; // 0…1 нажатие кнопки
  readonly slide: number; // 0…1 переход сайт → WhatsApp
  readonly sendPress: number; // 0…1 нажатие «отправить»
  readonly sent: number; // 0…1 пузырь улетел в чат
  readonly caretOn: boolean;
};

// Точки касания (координаты экрана телефона, px от левого верхнего угла экрана).
export const TAP = {
  field: (i: number) => ({ x: SW * 0.7, y: 300 + i * 118 + 64 }),
  button: { x: SW * 0.5, y: 700 },
  send: { x: SW - 44, y: SH - 52 },
} as const;

const Site: React.FC<{ readonly s: PhoneState }> = ({ s }) => (
  <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })}>
    <div style={box({ left: 0, right: 0, top: 0, height: 150, backgroundColor: YELLOW, display: "flex", alignItems: "center", gap: 12, padding: "40px 18px 0", boxSizing: "border-box" })}>
      <Img src={staticFile("assets/logo.png")} style={{ width: 70, height: 70, borderRadius: 35, boxShadow: "0 4px 10px rgba(20,40,75,0.2)" }} />
      <div style={{ fontSize: 27, fontWeight: 1000, color: NAVY, lineHeight: 1.1 }}>{S.siteTitle}</div>
    </div>
    <div style={box({ left: 22, top: 182, fontSize: 40, fontWeight: 1000, color: NAVY })}>{S.formTitle}</div>
    <div style={box({ left: 22, top: 236, width: 64, height: 7, borderRadius: 4, backgroundColor: YELLOW })} />
    {S.fields.map((fl, i) => {
      const chars = [...fl.value];
      const n = Math.round(clamp01(s.typed[i]) * chars.length);
      const active = s.active === i;
      return (
        <div key={fl.name} style={box({ left: 22, right: 22, top: 268 + i * 118 })}>
          <div style={{ fontSize: 25, fontWeight: 900, color: NAVY_SOFT, marginBottom: 6 }}>{fl.name}</div>
          <div
            style={{
              height: 66,
              borderRadius: 16,
              border: `3px solid ${active ? YELLOW : "#D5DEEA"}`,
              backgroundColor: active ? "#FFFBEA" : "#F6F8FC",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 31,
              fontWeight: 900,
              color: NAVY,
              boxSizing: "border-box",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {chars.slice(0, n).join("")}
            {active && s.caretOn ? <span style={{ display: "inline-block", width: 3, height: 32, marginLeft: 3, backgroundColor: NAVY }} /> : null}
          </div>
        </div>
      );
    })}
    {/* кнопка: открывает подготовленное сообщение в WhatsApp */}
    <div
      style={box({
        left: 22,
        right: 22,
        top: 660,
        height: 84,
        borderRadius: 24,
        backgroundColor: WA_GREEN,
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontSize: 28,
        fontWeight: 1000,
        transform: `scale(${1 - 0.05 * Math.sin(Math.PI * clamp01(s.button))})`,
        boxShadow: "0 8px 18px rgba(37,165,90,0.35)",
      })}
    >
      <WaGlyph size={40} />
      {S.button}
    </div>
  </div>
);

const WaGlyph: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M 12 3 Q 20.5 3 20.5 11.5 Q 20.5 20 12 20 Q 9.6 20 7.7 19 L 3.8 20.2 L 5 16.5 Q 3.5 14.3 3.5 11.5 Q 3.5 3 12 3 Z" fill="#FFFFFF" />
    <path d="M 9 8 L 10.6 8 L 11.2 10.4 L 10.2 11.2 Q 11 13 12.9 13.9 L 13.7 12.9 L 16 13.5 L 16 15 Q 16 16.2 14.7 16.2 Q 8.2 15.6 7.8 9.3 Q 7.8 8 9 8 Z" fill={WA_GREEN} />
  </svg>
);

const MsgLines: React.FC<{ readonly size: number }> = ({ size }) => (
  <>
    {S.message.map((l, i) => (
      <div key={i} style={{ fontSize: size, fontWeight: i === 0 ? 900 : 800, color: INK, lineHeight: 1.28 }}>
        {l}
      </div>
    ))}
  </>
);

const Chat: React.FC<{ readonly s: PhoneState }> = ({ s }) => {
  const fly = easeInOut(s.sent);
  return (
    <div style={box({ inset: 0, backgroundColor: "#ECE5DD", overflow: "hidden" })}>
      {/* шапка чата */}
      <div style={box({ left: 0, right: 0, top: 0, height: 140, backgroundColor: "#0B6E4F", display: "flex", alignItems: "center", gap: 14, padding: "40px 18px 0", boxSizing: "border-box" })}>
        <Img src={staticFile("assets/logo.png")} style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: "#FFFFFF" }} />
        <div style={{ fontSize: 32, fontWeight: 1000, color: "#FFFFFF" }}>{S.chatName}</div>
      </div>
      {/* узор фона */}
      <div style={box({ left: 0, right: 0, top: 140, bottom: 0, backgroundImage: "radial-gradient(rgba(0,0,0,0.035) 2px, rgba(0,0,0,0) 2.5px)", backgroundSize: "28px 28px" })} />
      {/* отправленное сообщение */}
      {fly > 0 ? (
        <div
          style={box({
            right: 14,
            top: 180 + (1 - fly) * 420,
            width: SW * 0.8,
            padding: "14px 16px 30px",
            borderRadius: "22px 22px 6px 22px",
            backgroundColor: "#DCF8C6",
            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
            opacity: Math.min(1, fly * 2),
            transform: `scale(${0.9 + 0.1 * fly})`,
            transformOrigin: "100% 100%",
          })}
        >
          <MsgLines size={25} />
          <div style={box({ right: 14, bottom: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 17, fontWeight: 800, color: "#7A8A80" })}>
            20:15
            {/* одна серая галочка: сообщение отправлено */}
            <svg width={20} height={16} viewBox="0 0 20 16">
              <path d="M 3 8.5 L 7.5 13 L 17 3" fill="none" stroke="#8C9A92" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      ) : null}
      {/* поле ввода: подготовленный текст, пока не отправлен */}
      <div style={box({ left: 12, right: 92, bottom: 16, minHeight: 72, padding: "12px 16px", borderRadius: 26, backgroundColor: "#FFFFFF", boxSizing: "border-box", boxShadow: "0 2px 4px rgba(0,0,0,0.08)" })}>
        {fly < 1 ? (
          <div style={{ opacity: 1 - Math.min(1, fly * 3) }}>
            <MsgLines size={24} />
          </div>
        ) : (
          <div style={{ fontSize: 22, fontWeight: 800, color: "#9AA5A0", lineHeight: "48px" }}> </div>
        )}
      </div>
      <div
        style={box({
          right: 12,
          bottom: 16,
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: WA_GREEN,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 - 0.14 * Math.sin(Math.PI * clamp01(s.sendPress))})`,
          boxShadow: "0 4px 10px rgba(37,165,90,0.4)",
        })}
      >
        <SendIcon size={36} />
      </div>
    </div>
  );
};

// Экран телефона (без корпуса): сайт уезжает влево, WhatsApp приезжает справа.
export const PhoneScreen: React.FC<{ readonly s: PhoneState }> = ({ s }) => {
  const u = easeInOut(s.slide);
  return (
    <div style={box({ left: 0, top: 0, width: SW, height: SH, overflow: "hidden", borderRadius: 40, fontFamily })}>
      {u < 1 ? (
        <div style={box({ inset: 0, transform: `translateX(${-u * SW}px)` })}>
          <Site s={s} />
        </div>
      ) : null}
      {u > 0 ? (
        <div style={box({ inset: 0, transform: `translateX(${(1 - u) * SW}px)` })}>
          <Chat s={s} />
        </div>
      ) : null}
    </div>
  );
};

// Телефон целиком (корпус + экран) в прямоугольнике PHONE.
export const Phone: React.FC<{ readonly s: PhoneState; readonly style?: React.CSSProperties }> = ({ s, style }) => (
  <div
    style={{
      position: "absolute",
      left: PHONE.x,
      top: PHONE.y,
      width: PHONE.w,
      height: PHONE.h,
      borderRadius: 56,
      backgroundColor: "#1E2235",
      boxShadow: "0 24px 50px rgba(20,40,75,0.35), inset 0 0 0 3px #3A4160",
      ...style,
    }}
  >
    <div style={box({ left: SCREEN_INSET, top: SCREEN_INSET })}>
      <PhoneScreen s={s} />
    </div>
    <div style={box({ left: PHONE.w / 2 - 50, top: 26, width: 100, height: 26, borderRadius: 13, backgroundColor: "#1E2235" })} />
  </div>
);

// Большой палец правой руки мамы: держит телефон снизу справа и нажимает.
// (tx, ty) — кончик пальца (экранные px), press 0…1 — нажатие.
export const Thumb: React.FC<{ readonly tx: number; readonly ty: number; readonly press: number; readonly skin?: string; readonly sleeve?: string }> = ({
  tx,
  ty,
  press,
  skin = "#E4B28C",
  sleeve = "#E9A23B",
}) => {
  const base = { x: PHONE.x + PHONE.w + 40, y: PHONE.y + PHONE.h + 40 };
  const dx = tx - base.x;
  const dy = ty - base.y;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  const k = 1 - 0.06 * press;
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {/* ладонь и рукав снизу справа */}
      <ellipse cx={base.x + 10} cy={base.y + 30} rx={120} ry={92} fill={skin} />
      <rect x={base.x - 40} y={base.y + 70} width={260} height={400} rx={60} fill={sleeve} transform={`rotate(-28 ${base.x} ${base.y})`} />
      <g transform={`translate(${base.x} ${base.y}) rotate(${ang})`}>
        <rect x={-10} y={-27} width={len * k + 14} height={54} rx={27} fill={skin} />
        <ellipse cx={len * k - 6} cy={0} rx={15} ry={19} fill="#F3D2B8" opacity={0.9} />
      </g>
    </svg>
  );
};

// Кольцо касания на экране.
export const TapRing: React.FC<{ readonly x: number; readonly y: number; readonly u: number }> = ({ x, y, u }) =>
  u > 0 && u < 1 ? (
    <div style={box({ left: x - 20 - 30 * u, top: y - 20 - 30 * u, width: 40 + 60 * u, height: 40 + 60 * u, borderRadius: 999, border: `5px solid ${YELLOW}`, opacity: 1 - easeOut(u) })} />
  ) : null;
