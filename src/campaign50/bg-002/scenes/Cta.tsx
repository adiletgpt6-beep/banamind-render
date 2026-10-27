// Сцена 6 (51,4 с – конец): папа у открытой переговорной, таймер
// остановился («Убагында»). Линия курсора проходит по кадру и открывает
// фирменный экран: логотип, «Бишкек • Балдар үчүн такси», ҮЙ → МЕКТЕП →
// ҮЙ, «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и
// крупно «WhatsApp: 0998 08 38 28». Все контакты видны одновременно и
// неподвижно до последнего кадра (≥ 3 с после последнего слова).
// Всё в безопасной зоне: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { ASSETS, COLORS } from "../../../config";
import { fontFamily } from "../../../fonts";
import { easeInOut, easeOut } from "../rig/motion";
import { BG2_TEXT } from "../script";
import { box, Shot } from "../shots";
import { OfficeWorld } from "./OfficeWorld";
import { DAD_DOOR, dadStandingPose, MiniForm } from "./Terms";
import { H, placeAt } from "./common";

export const CTA = { wipeFrom: 30, wipeTo: 52 } as const;

// Финальная карточка (статична после появления).
export const CtaCard: React.FC<{ readonly f: number }> = ({ f }) => {
  const t = BG2_TEXT.cta;
  const a = (at: number) => easeOut((f - at) / 10);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 18}px` });
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: COLORS.navy, overflow: "hidden" })}>
      <div style={box({ left: -260, top: -280, width: 760, height: 760, borderRadius: 380, backgroundColor: COLORS.yellowSoft })} />
      <div style={box({ right: -240, bottom: -220, width: 640, height: 640, borderRadius: 320, backgroundColor: COLORS.sky })} />
      <div style={box({ left: 70, width: 860, top: 270, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" })}>
        <div style={item(0)}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 200, height: 200, borderRadius: 100, objectFit: "cover", boxShadow: "0 20px 44px rgba(20,40,90,0.18)" }} />
        </div>
        <div style={{ ...item(1), fontSize: 108, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(2), padding: "14px 36px", borderRadius: 999, backgroundColor: COLORS.yellow, whiteSpace: "nowrap", fontSize: 52, fontWeight: 900 }}>{t.city}</div>
        <div style={{ ...item(3), fontSize: 44, fontWeight: 900, color: "#2E4377", letterSpacing: 1 }}>{t.route}</div>
        <div style={{ ...item(4), marginTop: 6, width: 820, padding: "22px 20px", borderRadius: 30, backgroundColor: COLORS.navy, color: "#FFFFFF", fontSize: 48, whiteSpace: "nowrap", fontWeight: 900 }}>{t.link}</div>
        <div style={{ ...item(5), fontSize: 46, fontWeight: 800, color: "#2E4377" }}>{t.or}</div>
        <div style={{ ...item(6), width: 820, padding: "20px 20px 24px", borderRadius: 30, border: "5px solid #2E8B57", backgroundColor: "#F2F9F3", lineHeight: 1.1 }}>
          <div style={{ fontSize: 46, fontWeight: 900, color: "#23774A" }}>WhatsApp</div>
          <div style={{ fontSize: 100, fontWeight: 900, letterSpacing: 1, marginTop: 6 }}>{t.whatsapp.replace("WhatsApp: ", "")}</div>
        </div>
      </div>
    </div>
  );
};

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const w = easeInOut((f - CTA.wipeFrom) / (CTA.wipeTo - CTA.wipeFrom));
  const lineX = 1080 * w;
  const dad = () => placeAt(DAD_DOOR, 1500, H.dad);
  return (
    <>
      {f < CTA.wipeTo ? (
        <Shot f={f} from={0} to={CTA.wipeTo} cam={{ x: 1300 + f * 0.6, y: 1060, zoom: 1.4 + f * 0.003 }}>
          <OfficeWorld f={f} dad={dad} dadFace={() => -0.3} dadPose={(t) => dadStandingPose(t, 0)} dadBehindDesk={false} sitters={2} doorOpen={1} phone={null} folder={false} tablet={<MiniForm />} />
        </Shot>
      ) : null}
      {f >= CTA.wipeFrom ? (
        <div style={box({ inset: 0, clipPath: f < CTA.wipeTo ? `inset(0 ${1080 - lineX}px 0 0)` : undefined })}>
          <CtaCard f={f - CTA.wipeFrom - 4} />
        </div>
      ) : null}
      {f >= CTA.wipeFrom && f < CTA.wipeTo + 4 ? <div style={box({ left: lineX - 7, top: 0, width: 14, height: 1920, backgroundColor: COLORS.yellow, boxShadow: "0 0 30px rgba(255,201,14,0.8)" })} /> : null}
    </>
  );
};
