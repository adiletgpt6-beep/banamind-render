// Сцена 6 (≈62 с – конец): финал.
// Рюкзак крупно улыбается, бегунок застёгивает молнию-рот слева направо,
// рюкзак подмигивает и отпрыгивает вверх, а застёгнутая молния летит вниз
// и становится контрастным подчёркиванием карточки контактов.
// С BG46_CONTACTS_IN и до последнего кадра одновременно видны (неподвижно,
// крупно, в безопасной зоне Reels): «Бишкек • Балдар үчүн такси»,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз»,
// «WhatsApp: 0998 08 38 28». Диктор: Бишкек, профиль и WhatsApp.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { FACE } from "../Backpack";
import { ctaBeats } from "../beats";
import { useTimeline } from "../context";
import { C } from "../palette";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { BG46_TEXT } from "../script";
import { faceKeys, hop, LiveBag } from "./common";

// Молния-полоска: жёлтая лента, тёмно-синие зубчики, бегунок справа.
const ZipStrip: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly a?: number }> = ({ x, y, w, a = 1 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: a }}>
    <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={13} fill={C.yellow} />
    <path d={`M ${x - w / 2 + 14} ${y} L ${x + w / 2 - 30} ${y}`} stroke={C.bagTrim} strokeWidth={12} strokeDasharray="7 7" />
    <rect x={x + w / 2 - 34} y={y - 17} width={34} height={34} rx={9} fill={C.metal} stroke={C.bagTrim} strokeWidth={5} />
  </svg>
);

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const T = BG46_TEXT.cta;
  const { n04, wProfile, wWa, contactsIn, zip0, zip1, wink, up0, up1 } = ctaBeats(useTimeline());
  const u = easeInOut((f - up0) / (up1 - up0));
  const bagS = lerp(1.05, 0.5, u);
  const bagX = lerp(540, 270, u);
  const bagBottom = lerp(1260, 650, u);
  const [h0, s0] = hop(f, n04.from + 2, 34, 12);
  const face = (t: number) =>
    faceKeys(t, [
      [0, FACE.happy],
      [wink, { ...FACE.happy, lidR: 1, squint: 0.75 }],
      [wink + 12, FACE.happy],
      [wProfile, { ...FACE.happy, lookX: 0.6, lookY: 0.8 }],
      [wWa, { ...FACE.happy, lookX: 0.5, lookY: 1 }],
      [n04.from, FACE.proud],
      [n04.to + 6, FACE.happy],
    ], 6);
  const smileMouth = (t: number) => (t < zip1 + 2 ? { open: 0.45 * (1 - clamp((t - zip0) / (zip1 - zip0))), round: 0, wide: 0.7 } : null);
  // 2. молния летит вниз и становится подчёркиванием
  const fly = easeInOut((f - up0 + 2) / 18);
  const lineY = 838;
  const zx = lerp(540, 515, fly); // центр карточки
  const zy = lerp(1260 - 292 * 1.05, lineY, fly);
  const zw = lerp(256 * 1.05, 660, fly);
  const card = easeOut((f - contactsIn + 6) / 10);
  const glowProfile = keys(f, [[wProfile - 4, 0], [wProfile + 4, 1], [wWa - 6, 1], [wWa + 4, 0.25]]);
  const glowWa = keys(f, [[wWa - 4, 0], [wWa + 4, 1]]);
  const row = (icon: React.ReactNode, text: string, glow: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 24, backgroundColor: `rgba(255,201,14,${0.16 * glow})`, border: `4px solid rgba(255,201,14,${0.9 * glow})` }}>
      {icon}
      <div style={{ fontSize: 39, fontWeight: 900, color: C.navy, lineHeight: 1.15, whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #FFF9E2 60%, #FFEFB8 100%)", fontFamily }}>
      {/* зубчатая рамка по краям — мотив молнии */}
      <div style={{ position: "absolute", left: 24, right: 24, top: 24, bottom: 24, borderRadius: 40, border: `6px dashed rgba(20,40,90,0.10)` }} />
      {/* логотип */}
      <div style={{ position: "absolute", left: 600, top: 330, width: 300, height: 300, opacity: card, transform: `scale(${0.8 + 0.2 * card})` }}>
        <Img src={staticFile("assets/campaign50/bg-046/logo.png")} style={{ width: 300, height: 300, objectFit: "contain" }} />
      </div>
      {/* карточка контактов */}
      <div style={{ position: "absolute", left: 60, right: 110, top: 690, opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
        <div style={{ padding: "48px 40px 40px", borderRadius: 44, backgroundColor: "#FFFFFF", boxShadow: "0 24px 60px rgba(20,40,90,0.18)" }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.navy, textAlign: "center", whiteSpace: "nowrap" }}>{T.city}</div>
          <div style={{ height: 70 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {row(
              <div style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={48} height={48} viewBox="0 0 24 24">
                  <circle cx={12} cy={8} r={4} fill="#FFFFFF" />
                  <path d="M4 21 Q4 14 12 14 Q20 14 20 21 Z" fill="#FFFFFF" />
                </svg>
              </div>,
              T.link,
              glowProfile,
            )}
            {row(
              <div style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width={50} height={50} viewBox="0 0 24 24">
                  <path d="M12 3 A9 9 0 0 0 4.2 16.5 L3 21 L7.6 19.8 A9 9 0 1 0 12 3 Z" fill="#FFFFFF" />
                  <path d="M8.6 7.8 Q9.2 7.4 9.6 8.2 L10.3 9.8 Q10.4 10.3 10 10.7 L9.6 11.1 Q10.6 13.1 12.9 14.3 L13.4 13.8 Q13.8 13.5 14.3 13.7 L15.8 14.4 Q16.4 14.8 16 15.6 Q15.3 16.8 13.8 16.5 Q9.4 15.4 7.8 10.6 Q7.5 8.7 8.6 7.8 Z" fill="#25D366" />
                </svg>
              </div>,
              T.or,
              glowWa,
            )}
          </div>
          {/* номер: крупно, неподвижно */}
          <div style={{ marginTop: 26, padding: "22px 20px 26px", borderRadius: 30, backgroundColor: C.yellow, textAlign: "center", boxShadow: "0 10px 0 #E0A800" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: C.navy }}>{T.whatsappLabel}</div>
            <div style={{ fontSize: 96, fontWeight: 1000, color: C.navy, letterSpacing: 2, lineHeight: 1.05, whiteSpace: "nowrap" }}>{T.whatsappNumber}</div>
          </div>
        </div>
      </div>
      {/* молния-подчёркивание под «Бишкек • Балдар үчүн такси» */}
      {f >= up0 - 2 ? <ZipStrip x={zx} y={zy} w={zw} a={clamp((f - up0 + 2) / 4)} /> : null}
      {/* рюкзак-герой: застёгивает рот, подмигивает, садится над карточкой */}
      <LiveBag
        uid="cta-bag"
        f={f}
        x={() => bagX}
        y={() => bagBottom - h0}
        s={bagS}
        face={face}
        squash={() => s0 + keys(f, [[zip1, 0], [zip1 + 4, 0.2], [zip1 + 12, 0]])}
        closed={f < up0 ? clamp((f - zip0) / (zip1 - zip0)) : 1}
        mouthFx={(t) => smileMouth(t) ?? { open: 0, round: 0, wide: 0 }}
        speaks={false}
        seed={19}
        shadow={u > 0.9}
        rot={(t) => Math.sin(t / 20) * 1.5 * u}
      />
    </div>
  );
};
