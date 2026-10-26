// Сцена 6 (финал): пузыри семейного чата складываются в одну карточку
// контактов. Карточка неподвижна до конца ролика: Бишкек, ссылка в профиле
// и WhatsApp 0998 08 38 28 видны одновременно всё время показа (≥ 5 с,
// ≥ 3 с после последнего слова).
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BG18_CONTACTS } from "../script";
import { abs, C, clamp, font, LinkIcon, pop, SoftBackdrop, WaIcon } from "../ui";

const FLY = [
  { x: 120, y: 260, w: 360 },
  { x: 600, y: 420, w: 300 },
  { x: 160, y: 700, w: 420 },
  { x: 560, y: 980, w: 340 },
  { x: 140, y: 1240, w: 300 },
];

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const fold = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const card = pop(f, 10, 15);
  const pulse = 1 + 0.02 * Math.sin(f / 9) * interpolate(f, [30, 40], [0, 1], clamp);
  return (
    <>
      <SoftBackdrop f={f} />
      {/* пузыри чата летят в центр и исчезают */}
      {fold < 1
        ? FLY.map((b, i) => (
            <div
              key={i}
              style={abs({
                left: interpolate(fold, [0, 1], [b.x, 540 - b.w / 2]),
                top: interpolate(fold, [0, 1], [b.y, 800]),
                width: b.w,
                height: 90,
                borderRadius: 30,
                background: i % 2 ? C.dad : C.mom,
                opacity: 1 - fold,
                transform: `scale(${1 - 0.6 * fold})`,
                boxShadow: "0 8px 20px rgba(22,52,107,0.12)",
              })}
            />
          ))
        : null}
      <div style={abs({ left: 60, right: 60, top: 210, opacity: Math.min(1, card * 1.5), transform: `scale(${(0.8 + 0.2 * card) * 1.05})`, transformOrigin: "50% 0" })}>
        <div style={{ borderRadius: 48, background: C.white, boxShadow: "0 20px 60px rgba(22,52,107,0.18)", padding: "40px 44px 46px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: 340, height: 340 }} />
          <div style={{ padding: "12px 30px", borderRadius: 40, background: C.navy, ...font(48, 1000, C.white) }}>{BG18_CONTACTS.city}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>
            <div style={{ width: 76, height: 76, borderRadius: 76, background: C.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LinkIcon size={44} />
            </div>
            <div style={font(46, 900, C.navy)}>{BG18_CONTACTS.profile}</div>
          </div>
          <div style={font(40, 800, C.grey)}>{BG18_CONTACTS.or}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 34px", borderRadius: 34, background: "#E7F8EC", border: `5px solid ${C.green}`, transform: `scale(${pulse})` }}>
            <WaIcon size={86} />
            <div>
              <div style={font(34, 900, C.green)}>WhatsApp:</div>
              <div style={{ ...font(78, 1000, C.ink), letterSpacing: 1 }}>{BG18_CONTACTS.phone}</div>
            </div>
          </div>
          <div style={{ ...font(46, 1000, C.navy), marginTop: 10 }}>
            <span style={{ background: C.yellow, padding: "4px 18px", borderRadius: 14 }}>{BG18_CONTACTS.slogan}</span>
          </div>
        </div>
      </div>
    </>
  );
};
