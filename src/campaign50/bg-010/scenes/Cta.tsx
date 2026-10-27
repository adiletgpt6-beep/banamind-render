// Сцена 6 (≈62 с – конец): обрывки нити мысли висят на светлом фоне;
// слева проходит линия маршрута с точками ҮЙ • МЕКТЕП • ҮЙ и сшивает их
// в одну непрерывную нить (метафора: дорога в школу продумана заранее —
// без заявления, что папа уже клиент). Нить сворачивается в кольцо, в нём
// появляется логотип BalaGo; затем неподвижный финальный экран:
// «Бишкек • Балдар үчүн такси», маршрут, «Профилдеги шилтемеге өтүңүз»,
// «же WhatsApp аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28».
// Оба способа связи и номер видны вместе с BG10_CONTACTS_IN до последнего
// кадра (≥ 5 с), после последнего слова экран держится ≥ 3 с. Всё в
// безопасной зоне Reels: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { CUTS, scattered, Thread, type ThreadPiece } from "../editor";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG10_CONTACTS_IN, BG10_TEXT, BG10_VIDEO } from "../script";
import { NAVY, YELLOW } from "../sets/Office";

const LOGO = { x: 540, y: 430, r: 130 };

const LinkIcon: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 46 46" style={{ verticalAlign: "-8px", marginRight: 12 }}>
    <path d="M 19 27 L 27 19" stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
    <path d="M 21 13 L 25 9 Q 31 3 37 9 Q 43 15 37 21 L 33 25" stroke={NAVY} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M 25 33 L 21 37 Q 15 43 9 37 Q 3 31 9 25 L 13 21" stroke={NAVY} strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG10_TEXT.cta;
  const contactAt = Math.round(BG10_CONTACTS_IN * BG10_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  // сшивание: линия-маршрут проходит слева направо по доле длины нити
  const sweep = easeInOut(f / 22);
  const sc = scattered(1, f, { drift: 0.6 });
  const pieces: ThreadPiece[] = sc.map((p, i) => {
    const k = easeOut((sweep - CUTS[i]) / 0.18);
    return { ...p, dx: (p.dx ?? 0) * (1 - k), dy: (p.dy ?? 0) * (1 - k), rot: (p.rot ?? 0) * (1 - k), b: lerp(p.b, CUTS[i + 1], k) };
  });
  // после сшивания нить уменьшается и улетает в кольцо логотипа
  const shrink = easeInOut((f - 22) / 14);
  const threadO = 1 - clamp((f - 30) / 8);
  const logo = easeOut((f - 28) / 12);
  const ring = easeInOut((f - 24) / 14);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: NAVY, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: "#FFF4CF" }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF3FC" }} />
      {threadO > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: threadO, transformOrigin: `${LOGO.x}px ${LOGO.y}px`, transform: `translate(0px, ${lerp(0, LOGO.y - 820, shrink)}px) scale(${lerp(1, 0.25, shrink)})` }}>
          <Thread pieces={pieces} />
          {/* голова линии маршрута */}
          {sweep < 1 ? <div style={{ position: "absolute", left: lerp(120, 960, sweep) - 30, top: lerp(360, 1180, sweep) - 30, width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFFFFF", border: `8px solid ${YELLOW}`, boxSizing: "border-box" }} /> : null}
        </div>
      ) : null}
      {/* кольцо: нить замыкается вокруг логотипа */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={LOGO.x} cy={LOGO.y} r={LOGO.r + 16} fill="none" stroke={YELLOW} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${ring * 2 * Math.PI * (LOGO.r + 16)} 9999`} transform={`rotate(-90 ${LOGO.x} ${LOGO.y})`} />
      </svg>
      <div style={{ position: "absolute", left: LOGO.x - LOGO.r, top: LOGO.y - LOGO.r, width: LOGO.r * 2, height: LOGO.r * 2, opacity: logo, transform: `scale(${0.6 + 0.4 * logo})` }}>
        <Img src={staticFile(BG10_VIDEO.logo)} style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 150, top: 592, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ ...item(32), fontSize: 112, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(36), padding: "12px 34px", borderRadius: 999, backgroundColor: NAVY, color: "#FFFFFF", fontSize: 48, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(40), padding: "8px 30px", borderRadius: 999, backgroundColor: YELLOW, fontSize: 42, fontWeight: 900 }}>{t.route}</div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div style={{ opacity: a(contactAt, 8), marginTop: 14, width: "100%", padding: "26px 20px", borderRadius: 32, border: "4px solid #DCE3EE", backgroundColor: "#F8FAFD", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>
            <LinkIcon />
            {t.link}
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
          <div style={{ marginTop: 8, width: "100%", padding: "16px 0 18px", borderRadius: 24, backgroundColor: "#E8F6EC", border: "3px solid #BFE3CB" }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
            <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: NAVY }}>{t.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
