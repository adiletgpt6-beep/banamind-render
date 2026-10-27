// Телефон в правой руке мамы: ладонь и рукав за телефоном, кончики пальцев
// на левой кромке, большой палец над экраном (касание — tap 0…1).
// Экраны: страница заявки на сайте BalaGo (подписи как на сайте) и чат
// WhatsApp с подготовленным сайтом сообщением — отправляет мама сама.
import { Img, staticFile } from "remotion";
import { ASSETS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { BG47_TEXT } from "../script";
import { clamp, easeOut } from "./motion";
import { C } from "./palette";
import { FieldIcon } from "./popups";

export const PHONE = { w: 400, h: 820, r: 58, bezel: 14 } as const;
const SW = PHONE.w - PHONE.bezel * 2;
const SH = PHONE.h - PHONE.bezel * 2;

const Finger: React.FC<{ readonly x1: number; readonly y1: number; readonly x2: number; readonly y2: number; readonly w: number; readonly nail?: boolean }> = ({ x1, y1, x2, y2, w, nail = false }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const nx = x2 - Math.cos(a) * w * 0.2;
  const ny = y2 - Math.sin(a) * w * 0.2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.skinEdge} strokeWidth={w + 6} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.skin} strokeWidth={w} strokeLinecap="round" />
      {nail ? <ellipse cx={nx} cy={ny} rx={w * 0.26} ry={w * 0.33} transform={`rotate(${(a * 180) / Math.PI + 90} ${nx} ${ny})`} fill={C.nail} /> : null}
    </g>
  );
};

// Телефон с рукой. (x, y) — центр телефона на экране. thumb — точка касания
// в координатах экрана телефона (0…SW, 0…SH); tap — нажатие (палец ниже).
export const PhoneInHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly scale?: number;
  readonly thumb: { readonly x: number; readonly y: number };
  readonly tap?: number;
  readonly children: React.ReactNode;
}> = ({ x, y, rot = -4, scale = 1, thumb, tap = 0, children }) => {
  const tx = PHONE.bezel + thumb.x;
  const ty = PHONE.bezel + thumb.y;
  // основание большого пальца следует за кончиком: палец не длиннее ≈ 230 px,
  // ладонь сдвигается вдоль правой кромки телефона, как при настоящем хвате
  const base = { x: Math.min(PHONE.w + 24, tx + 140), y: Math.min(PHONE.h + 40, ty + 178) };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${rot}deg) scale(${scale})` }}>
      <div style={{ position: "absolute", left: -PHONE.w / 2, top: -PHONE.h / 2, width: PHONE.w, height: PHONE.h }}>
        {/* ладонь и рукав за телефоном */}
        <svg width={PHONE.w} height={PHONE.h} viewBox={`0 0 ${PHONE.w} ${PHONE.h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={`M${base.x - 40} ${base.y + 150} L ${PHONE.w + 260} 1500 L ${PHONE.w + 560} 1400 L ${base.x + 150} ${base.y + 60} Z`} fill={C.sleeve} stroke={C.sleeveDark} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M${base.x - 30} ${base.y + 150} L ${base.x + 150} ${base.y + 66}`} stroke={C.cuff} strokeWidth={40} strokeLinecap="round" />
          {/* ладонь: силуэт кисти за телефоном */}
          <path
            d={`M${base.x - 60} ${base.y - 40} C ${base.x - 20} ${base.y - 120}, ${base.x + 110} ${base.y - 130}, ${base.x + 140} ${base.y - 40} C ${base.x + 160} ${base.y + 20}, ${base.x + 120} ${base.y + 90}, ${base.x + 60} ${base.y + 120} L ${base.x - 30} ${base.y + 140} C ${base.x - 80} ${base.y + 90}, ${base.x - 90} ${base.y + 10}, ${base.x - 60} ${base.y - 40} Z`}
            fill={C.skin}
            stroke={C.skinEdge}
            strokeWidth={6}
          />
        </svg>
        {/* корпус */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: PHONE.r,
            backgroundColor: "#1E2740",
            boxShadow: "0 30px 60px rgba(20,40,90,0.30), inset 0 0 0 3px #3B4566",
          }}
        />
        <div style={{ position: "absolute", left: PHONE.bezel, top: PHONE.bezel, width: SW, height: SH, borderRadius: PHONE.r - 12, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
          {children}
          <div style={{ position: "absolute", left: SW / 2 - 50, top: 10, width: 100, height: 26, borderRadius: 13, backgroundColor: "#1E2740" }} />
        </div>
        {/* пальцы на левой кромке и большой палец над экраном */}
        <svg width={PHONE.w} height={PHONE.h} viewBox={`0 0 ${PHONE.w} ${PHONE.h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Finger x1={-34} y1={430} x2={10} y2={424} w={30} nail />
          <Finger x1={-36} y1={508} x2={12} y2={504} w={31} nail />
          <Finger x1={-34} y1={586} x2={10} y2={586} w={30} nail />
          <Finger x1={-28} y1={660} x2={6} y2={662} w={27} nail />
          <Finger x1={base.x} y1={base.y} x2={tx + 6 * tap} y2={ty + 10 * tap} w={52} nail />
        </svg>
        {tap > 0 ? (
          <div
            style={{
              position: "absolute",
              left: tx - 40,
              top: ty - 40,
              width: 80,
              height: 80,
              borderRadius: 40,
              border: `5px solid ${C.yellow}`,
              transform: `scale(${0.5 + tap})`,
              opacity: 1 - clamp(tap),
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

export const PHONE_SCREEN = { w: SW, h: SH } as const;

// Страница заявки BalaGo (фрагмент формы). fill[i] — заполнение поля i.
export const SiteForm: React.FC<{ readonly fill: readonly number[]; readonly press?: number; readonly glow?: number }> = ({ fill, press = 0, glow = -1 }) => {
  const s = BG47_TEXT.apply.site;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, backgroundColor: "#FFFFFF" }}>
      <div style={{ height: 58, backgroundColor: "#F3F5F9" }} />
      <div style={{ position: "absolute", left: 18, right: 18, top: 50, height: 34, borderRadius: 17, backgroundColor: "#E7EBF2", fontSize: 17, fontWeight: 700, color: "#56607A", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {s.url}
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, top: 98, display: "flex", alignItems: "center", gap: 10 }}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 46, height: 46, borderRadius: 23 }} />
        <div style={{ fontSize: 24, fontWeight: 900 }}>BalaGo</div>
        <div style={{ marginLeft: "auto", width: 30, height: 4, borderRadius: 2, backgroundColor: C.navy, boxShadow: `0 9px 0 ${C.navy}, 0 -9px 0 ${C.navy}` }} />
      </div>
      <div style={{ position: "absolute", left: 22, right: 22, top: 160 }}>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 999, backgroundColor: C.yellowSoft, fontSize: 17, fontWeight: 900 }}>{s.eyebrow}</div>
        <div style={{ fontSize: 29, fontWeight: 900, lineHeight: 1.12, marginTop: 8 }}>{s.title}</div>
        {/* свёрнутые верхние поля формы */}
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, opacity: 0.45 }}>
          {[0, 1].map((i) => (
            <div key={i} style={{ height: 12, width: `${70 - i * 18}%`, borderRadius: 6, backgroundColor: "#D7DDEA" }} />
          ))}
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {s.fields.map((fl, i) => {
            const p = clamp(fill[i] ?? 0);
            return (
              <div key={fl.label}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#56607A", marginBottom: 4 }}>{fl.label}</div>
                <div
                  style={{
                    height: 48,
                    borderRadius: 12,
                    border: `3px solid ${glow === i ? C.yellow : p > 0 ? C.navySoft : "#CCD3E2"}`,
                    boxShadow: glow === i ? "0 0 0 5px rgba(255,201,14,0.4)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 12px",
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.ink,
                  }}
                >
                  {p > 0 ? <FieldIcon kind={fl.icon === "home" ? "home" : fl.icon === "school" ? "school" : "time"} filled={1} size={30} /> : null}
                  {fl.value ? (
                    <span style={{ clipPath: `inset(0 ${100 - p * 100}% 0 0)` }}>{fl.value}</span>
                  ) : (
                    // адрес не показываем: условная серая полоса вместо личных данных
                    <div style={{ height: 14, width: `${62 * p}%`, borderRadius: 7, backgroundColor: "#C9D1E0" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 16,
            height: 62,
            borderRadius: 16,
            backgroundColor: C.yellow,
            border: `3px solid ${C.navy}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 25,
            fontWeight: 900,
            transform: `scale(${1 - 0.05 * press})`,
            boxShadow: `0 ${6 - 5 * press}px 0 ${C.navy}`,
          }}
        >
          {s.button}
        </div>
      </div>
    </div>
  );
};

// Чат WhatsApp: подготовленное сайтом сообщение в поле ввода; после
// отправки (sent 0…1) — пузырь справа с двумя галочками.
export const WhatsAppChat: React.FC<{ readonly sent: number; readonly press?: number }> = ({ sent, press = 0 }) => {
  const ch = BG47_TEXT.apply.chat;
  const msg = (
    <>
      <div style={{ fontWeight: 800 }}>{ch.greeting}</div>
      {ch.lines.map(([k, v]) => (
        <div key={k} style={{ marginTop: 3 }}>
          <span style={{ fontWeight: 800 }}>{k}</span>{" "}
          {v ? v : <span style={{ display: "inline-block", width: 90, height: 11, borderRadius: 6, backgroundColor: "#B9C3D4", verticalAlign: "middle" }} />}
        </div>
      ))}
    </>
  );
  const s = easeOut(sent);
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily, backgroundColor: "#EFE7DD" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 128, backgroundColor: "#1F7A55" }} />
      <div style={{ position: "absolute", left: 18, right: 18, top: 62, display: "flex", alignItems: "center", gap: 12, color: "#FFFFFF" }}>
        <div style={{ fontSize: 30, fontWeight: 900 }}>‹</div>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: "#FFFFFF" }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{ch.name}</div>
          <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.9 }}>{ch.number}</div>
        </div>
      </div>
      {/* отправленное сообщение */}
      {s > 0 ? (
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 150 + (1 - s) * 260,
            width: SW - 70,
            padding: "12px 14px 26px",
            borderRadius: 18,
            borderTopRightRadius: 4,
            backgroundColor: "#D9FDD3",
            fontSize: 17,
            lineHeight: 1.25,
            color: "#1C2B33",
            opacity: Math.min(1, s * 2),
            boxShadow: "0 2px 0 rgba(0,0,0,0.08)",
          }}
        >
          {msg}
          <div style={{ position: "absolute", right: 12, bottom: 4, fontSize: 16, fontWeight: 900, color: "#8696A0" }}>✓</div>
        </div>
      ) : null}
      {/* поле ввода с подготовленным текстом */}
      <div style={{ position: "absolute", left: 12, right: 76, bottom: 22, maxHeight: s > 0 ? 54 : 330, overflow: "hidden", padding: "12px 16px", borderRadius: 24, backgroundColor: "#FFFFFF", fontSize: 17, lineHeight: 1.25, color: "#1C2B33" }}>
        {s > 0.5 ? <span style={{ color: "#9AA3B2" }}>…</span> : msg}
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 22,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#1FA855",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 - 0.1 * press})`,
        }}
      >
        <svg width={28} height={28} viewBox="0 0 24 24">
          <path d="M3 20 L21 12 L3 4 L5.5 12 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};
