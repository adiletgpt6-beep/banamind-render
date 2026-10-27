// Сцена 6 (≈56 с – конец): линия-зеркало, разделявшая два понедельника,
// втягивается к верху кадра и складывается в жёлтую дугу вокруг логотипа
// BalaGo. Затем неподвижный финальный экран: «BalaGo», «Бишкек • Балдар
// үчүн такси», ҮЙ → МЕКТЕП → ҮЙ, «Профилдеги шилтемеге өтүңүз», «же
// WhatsApp аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28».
// Оба способа связи и номер видны одновременно с BG45_CONTACTS_IN до
// последнего кадра (≥ 5 с), после последнего слова экран держится ≥ 3 с.
// Всё в безопасной зоне Reels: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { useScene, useTimeline } from "../context";
import { LeftPanel, NowLabel, RightPanel } from "../mirror";
import { fontFamily } from "../../../fonts";
import { C } from "../palette";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { BG45_CONTACTS_IN, BG45_TEXT, BG45_VIDEO } from "../script";
import { sceneOf } from "../timing";
import { CAM_HALF, OFFICE_AXIS, typePose, wordFrame } from "./common";
import { OfficeWorld } from "./OfficeWorld";
import { TRIAL_CAM_L, TrialLeftWorld } from "./Trial";
import { trialBeats } from "../beats";
import { PlannedWeek } from "../screens";

const CX = 510; // центр колонки (справа отступ 150 px под кнопки Reels)
const LOGO = { x: CX, y: 430, r: 118 } as const;

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG45_TEXT.cta;
  const contactAt = Math.round(BG45_CONTACTS_IN * BG45_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  // линия: 0–16 кадров втягивается к логотипу, 8–24 — дуга вокруг него
  const pull = easeInOut(f / 16);
  const lineX = lerp(540, LOGO.x, pull);
  const top = lerp(0, LOGO.y - LOGO.r - 14, pull);
  const bottom = lerp(1920, LOGO.y + LOGO.r + 14, pull);
  const ring = easeInOut((f - 8) / 16);
  const logo = easeOut((f - 12) / 10);
  const R = LOGO.r + 14;
  const circ = 2 * Math.PI * R;
  // две половины расходятся в стороны, как створки, — остаётся линия
  const tl = useTimeline();
  const { from } = useScene();
  // мягкие акценты в такт словам диктора (тексты и номер не двигаются)
  const n05 = tl.cues.find((c) => c.id === "n05")!;
  const n06 = tl.cues.find((c) => c.id === "n06")!;
  const hl = (a0: number, a1: number) => keys(f, [[a0 - 4, 0], [a0 + 4, 1], [a1, 1], [a1 + 10, 0]]);
  const city = hl(wordFrame(n05, "бишкектеги", 0.2, from), wordFrame(n05, "такси", 0.9, from) + 6);
  const link = hl(wordFrame(n06, "профилдеги", 0.3, from), wordFrame(n06, "же", 0.55, from));
  const wa = hl(wordFrame(n06, "номерге", 0.7, from), Math.round(n06.to * BG45_VIDEO.fps) - from + 4);
  const trial = sceneOf(tl, "trial");
  const fe = trial.frames + f;
  const n04 = tl.cues.find((c) => c.id === "n04")!;
  const tb = trialBeats((p, fb) => wordFrame(n04, p, fb, trial.from));
  const lb = { back: tb.back, office: tb.office };
  const slide = easeInOut(f / 14);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      {/* мягкие фирменные круги */}
      <div style={{ position: "absolute", left: -240, top: -260, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft, opacity: a(4, 14) }} />
      <div style={{ position: "absolute", right: -220, bottom: -200, width: 640, height: 640, borderRadius: 320, backgroundColor: "#EAF3FC", opacity: a(4, 14) }} />
      {slide < 1 ? (
        <>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-600 * slide}px)` }}>
            <LeftPanel cam={TRIAL_CAM_L(fe, lb)}>
              <TrialLeftWorld f={fe} lb={lb} />
            </LeftPanel>
            <NowLabel a={1} />
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${600 * slide}px)` }}>
            <RightPanel cam={CAM_HALF} mirror={OFFICE_AXIS} open={1} f={fe}>
              <OfficeWorld f={fe} minutes={15 * 60 + 13} uid="c-o" pose={(tt) => ({ ...typePose(tt, 1, 5), expr: "softSmile" })} seed={6} screen={<PlannedWeek />} />
            </RightPanel>
          </div>
        </>
      ) : null}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {ring < 1 ? <line x1={lineX} y1={top} x2={lineX} y2={bottom} stroke={C.yellow} strokeWidth={10} strokeLinecap="round" opacity={1 - ring} /> : null}
        <circle cx={LOGO.x} cy={LOGO.y} r={R} fill="none" stroke={C.yellow} strokeWidth={14} strokeDasharray={`${circ * ring} ${circ}`} transform={`rotate(-90 ${LOGO.x} ${LOGO.y})`} />
        {/* медленно вращающийся пунктир вокруг дуги — финал живой, контакты неподвижны */}
        <circle cx={LOGO.x} cy={LOGO.y} r={R + 22} fill="none" stroke={C.yellow} strokeWidth={5} strokeDasharray="4 18" strokeLinecap="round" opacity={0.7 * clamp((f - 24) / 14)} transform={`rotate(${f * 0.6} ${LOGO.x} ${LOGO.y})`} />
      </svg>
      <div style={{ position: "absolute", left: LOGO.x - LOGO.r, top: LOGO.y - LOGO.r, width: LOGO.r * 2, height: LOGO.r * 2, opacity: logo, transform: `scale(${(0.6 + 0.4 * logo) * (1 + 0.014 * Math.sin(f / 16) * clamp((f - 26) / 20))})` }}>
        <Img src={staticFile(BG45_VIDEO.logo)} style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
      </div>
      <div style={{ position: "absolute", left: 90, right: 150, top: 590, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
        <div style={{ ...item(14), fontSize: 108, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(18), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 48, fontWeight: 900, boxShadow: `0 0 0 ${10 * city}px rgba(255,201,14,0.55)` }}>{t.city}</div>
        <div style={{ ...item(20), padding: "8px 30px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 42, fontWeight: 900 }}>{t.route}</div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div style={{ opacity: clamp((f - contactAt) / 8), marginTop: 14, width: "100%", padding: "26px 20px", borderRadius: 32, border: "4px solid #DCE3EE", backgroundColor: "#F8FAFD", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 42, fontWeight: 900, lineHeight: 1.1, whiteSpace: "nowrap", padding: "4px 14px", borderRadius: 16, backgroundColor: `rgba(255,201,14,${0.45 * link})` }}>
            <svg width={44} height={44} viewBox="0 0 44 44">
              <path d="M 18 26 L 26 18 M 14 20 L 9 25 A 7 7 0 0 0 19 35 L 24 30 M 30 24 L 35 19 A 7 7 0 0 0 25 9 L 20 14" stroke={C.navy} strokeWidth={4.5} fill="none" strokeLinecap="round" />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
          <div style={{ marginTop: 8, width: "100%", padding: "16px 0 18px", borderRadius: 24, backgroundColor: C.waSoft, border: "3px solid #BFE3CB", boxShadow: `0 0 0 ${10 * wa}px rgba(37,168,90,0.35), 0 ${14 * wa}px ${30 * wa}px rgba(37,168,90,0.25)` }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
            <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy }}>{t.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
