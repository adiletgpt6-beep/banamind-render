// Сцена 6 (финал, визуальный матч-кат): снова макро магнитного крючка
// сбоку холодильника — как в первом кадре. Крючок загорается жёлтым, его
// изогнутая линия вытягивается и превращается в жёлтую линию маршрута
// ҮЙ → МЕКТЕП → ҮЙ, вокруг неё собирается фирменный финал. Затем —
// неподвижный экран: «Бишкек • Балдар үчүн такси», «Профилдеги
// шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз», «WhatsApp: 0998 08 38
// 28». Оба способа связи и номер видны вместе с BG11_CONTACTS_IN до
// последнего кадра (≥ 5 с), после последнего слова экран держится ≥ 3 с.
// Безопасная зона Reels: сверху ≥ 250 px, снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG11_CONTACTS_IN, BG11_TEXT, BG11_VIDEO } from "../script";
import { RouteIcon } from "../screens";
import { C, Fridge, HOOK_S, K } from "../sets/Kitchen";
import { View } from "../shots";
import { HOOK_CAM, keySwing } from "./Hook";

// Линия крючка (локальные координаты MagnetHook) → экран при HOOK_CAM.
const hookToScreen = (x: number, y: number) => ({
  x: 540 + (K.hook.x + x * HOOK_S - HOOK_CAM.x) * HOOK_CAM.zoom,
  y: 960 + (K.hook.y + y * HOOK_S - HOOK_CAM.y) * HOOK_CAM.zoom,
});
// точки J-образного крючка: вниз, дуга, вверх
const HOOK_PTS = (() => {
  const pts: { x: number; y: number }[] = [];
  const N = 48;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    let p: { x: number; y: number };
    if (u < 0.4) p = { x: 0, y: 8 + (u / 0.4) * 18 };
    else if (u < 0.8) {
      const a = Math.PI - ((u - 0.4) / 0.4) * Math.PI; // от π до 0 (нижняя полуокружность)
      p = { x: 9 + 9 * Math.cos(a), y: 28 + 10 * Math.sin(a) };
    } else p = { x: 18, y: 28 - ((u - 0.8) / 0.2) * 8 };
    pts.push(hookToScreen(p.x, p.y));
  }
  return pts;
})();
const LINE_Y = 790;
const LINE = { x0: 170, x1: 910 };
const linePt = (u: number) => ({ x: lerp(LINE.x0, LINE.x1, u), y: LINE_Y + Math.sin(u * Math.PI * 2) * 0 });

export const CTA_MORPH = { glow: 4, from: 14, to: 40, bg: 12 };

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG11_TEXT.cta;
  const contactAt = Math.round(BG11_CONTACTS_IN * BG11_VIDEO.fps);
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({ opacity: a(at), translate: `0 ${(1 - a(at)) * 22}px` });
  const m = easeInOut((f - CTA_MORPH.from) / (CTA_MORPH.to - CTA_MORPH.from));
  const glow = easeOut((f - CTA_MORPH.glow) / 8);
  const bg = easeInOut((f - CTA_MORPH.bg) / 16);
  const pts = HOOK_PTS.map((p, i) => {
    const q = linePt(i / (HOOK_PTS.length - 1));
    return { x: lerp(p.x, q.x, m), y: lerp(p.y, q.y, m) };
  });
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const width = lerp(6 * HOOK_S * HOOK_CAM.zoom, 18, m);
  const icon = (at: number) => ({ opacity: a(at, 8), transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * easeOut((f - at) / 10)})` });
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      {/* матч-кат: тот же крючок, что в первом кадре */}
      {bg < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - bg }}>
          <View cam={{ ...HOOK_CAM, zoom: HOOK_CAM.zoom * lerp(1, 0.92, clamp(f / 20)) }}>
            <Fridge keys swing={keySwing(f + 900)} evening={1} />
          </View>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: -220, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft, opacity: bg }} />
      <div style={{ position: "absolute", right: -200, bottom: -180, width: 620, height: 620, borderRadius: 310, backgroundColor: "#EAF3FC", opacity: bg }} />
      {/* крючок → жёлтая линия маршрута */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={d} stroke={glow > 0 ? C.yellow : "#B9C1CD"} strokeOpacity={Math.max(0.0001, glow)} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* значки маршрута на линии */}
      {[
        { x: LINE.x0, kind: "home" as const, at: CTA_MORPH.to - 2 },
        { x: (LINE.x0 + LINE.x1) / 2, kind: "school" as const, at: CTA_MORPH.to + 3 },
        { x: LINE.x1, kind: "home" as const, at: CTA_MORPH.to + 8 },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", left: s.x, top: LINE_Y, ...icon(s.at) }}>
          <RouteIcon kind={s.kind} size={110} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: LINE_Y + 62, display: "flex", justifyContent: "center", ...item(CTA_MORPH.to + 10) }}>
        <div style={{ padding: "6px 28px", borderRadius: 999, backgroundColor: C.yellow, fontSize: 40, fontWeight: 900 }}>{t.route}</div>
      </div>
      {/* логотип, бренд, город */}
      <div style={{ position: "absolute", left: 540 - 105, top: 268, width: 210, height: 210, ...item(CTA_MORPH.to - 4) }}>
        <Img src={staticFile(BG11_VIDEO.logo)} style={{ width: 210, height: 210, borderRadius: 105, objectFit: "cover", boxShadow: "0 24px 50px rgba(20,40,90,0.18)" }} />
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <div style={{ ...item(CTA_MORPH.to), fontSize: 100, fontWeight: 900, lineHeight: 1 }}>{t.brand}</div>
        <div style={{ ...item(CTA_MORPH.to + 4), padding: "12px 34px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 50, fontWeight: 900 }}>{t.city}</div>
      </div>
      {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
      <div style={{ position: "absolute", left: 70, right: 150, top: 960, opacity: a(contactAt, 8), padding: "26px 20px", borderRadius: 32, border: "4px solid #DCE3EE", backgroundColor: "#F8FAFD", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
        <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>🔗 {t.link}</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
        <div style={{ marginTop: 8, width: "100%", padding: "14px 0 18px", borderRadius: 24, backgroundColor: "#E8F6EC", border: "3px solid #BFE3CB" }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
          <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: 1, lineHeight: 1.05, color: C.navy, whiteSpace: "nowrap" }}>{t.whatsappNumber}</div>
        </div>
      </div>
    </div>
  );
};
