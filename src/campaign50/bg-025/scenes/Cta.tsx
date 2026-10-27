// Финал (≈15 с). Продолжение общего плана всей ленты из шага 5–6: мама
// аккуратно складывает ленту гармошкой снизу вверх (6 → 1), лента
// становится памяткой «6 кадам» с шестью пунктами; белый лист памятки
// раскрывается на весь кадр (match-cut) и становится бренд-экраном.
// С кадра BG25_CONTACTS_IN и до последнего кадра неподвижно и одновременно
// видны: логотип, «Бишкек • Балдар үчүн такси», ҮЙ → МЕКТЕП → ҮЙ,
// «Профилдеги шилтемеге өтүңүз», «же WhatsApp аркылуу жазыңыз» и крупный
// номер «WhatsApp: 0998 08 38 28». Движется только мягкий фон и тонкие
// подчёркивания под словами диктора (сами блоки не двигаются).
import { Img, staticFile, useCurrentFrame } from "remotion";
import { Icon, WaBadge } from "../art";
import { useWordMatch } from "../context";
import { box, FPS, Paper, Shot, Svg, type Cam } from "../kit";
import { DONE, PANEL_ART } from "../panels";
import { SKIN, CloseHand } from "../props/CloseHand";
import { panelTop, Ribbon, RIB, RIB_X, type PanelSpec } from "../ribbon";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG25_CONTACTS_IN, BG25_STEPS, BG25_TEXT, BG25_VIDEO } from "../script";
import { SFX, type SceneSfx } from "../sfx";
import { C, F, SAFE } from "../theme";
import { wordMatchIn } from "../timing";

const T = BG25_TEXT.cta;

// Кадры действия (от начала сцены).
export const CTA = {
  foldFrom: 8, // лента начинает складываться (после бумажного перехода)
  foldStep: 7, // каждая следующая панель — через 7 кадров
  foldLen: 12, // один сгиб — 12 кадров
  flipAt: 50, // сложенная лента переворачивается обложкой памятки
  flipLen: 14,
  openAt: 96, // памятка в руках ≈ 1,1 с, затем лист раскрывается в бренд-экран
  openLen: 12,
  contacts: Math.round(BG25_CONTACTS_IN * FPS), // контакты на месте (≈111)
} as const;

// Общий план всей ленты (как в конце шага 5–6).
const WIDE: Cam = { x: 540, y: panelTop(1) + 3 * RIB.h, zoom: 0.44 };

// Панели складываются снизу вверх: панель n — от foldFrom + (6 − n)·foldStep.
const foldOf = (f: number, n: number) => {
  if (n === 1) return 1;
  const a = CTA.foldFrom + (RIB.count - n) * CTA.foldStep;
  return 1 - easeInOut((f - a) / CTA.foldLen);
};

// Памятка: сложенная лента — обложка «6 кадам» и шесть пунктов.
const Memo: React.FC<{ readonly w: number; readonly h: number }> = ({ w, h }) => (
  <div
    style={box({
      left: -w / 2,
      top: -h / 2,
      width: w,
      height: h,
      borderRadius: 18,
      backgroundColor: C.paper,
      boxShadow: "0 24px 50px rgba(20,40,90,0.22)",
      overflow: "hidden",
      fontFamily: F.text,
    })}
  >
    <div style={box({ left: 0, right: 0, top: 0, height: h * 0.17, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: h * 0.1, color: C.navy })}>
      {T.memo}
    </div>
    {BG25_STEPS.map((s, i) => (
      <div key={s} style={box({ left: w * 0.06, right: w * 0.03, top: h * (0.215 + i * 0.13), display: "flex", alignItems: "center", gap: w * 0.025, fontWeight: 900, fontSize: h * 0.064, color: C.navy, whiteSpace: "nowrap" })}>
        <div style={{ width: h * 0.088, height: h * 0.088, borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontSize: h * 0.055, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
        {s}
      </div>
    ))}
    {/* сгибы гармошки */}
    {[1, 2, 3].map((k) => (
      <div key={k} style={box({ left: 0, right: 0, top: (h * k) / 4, height: 2, backgroundColor: "rgba(120,100,60,0.12)" })} />
    ))}
  </div>
);

// Мягкий фон бренд-экрана: два больших светлых круга медленно дрейфуют.
const BrandBg: React.FC<{ readonly f: number }> = ({ f }) => (
  <div style={box({ inset: 0, backgroundColor: C.white, overflow: "hidden" })}>
    <div style={box({ left: -260 + Math.sin(f / 70) * 30, top: -240 + Math.cos(f / 90) * 20, width: 820, height: 820, borderRadius: 410, backgroundColor: C.yellowSoft })} />
    <div style={box({ right: -300 + Math.cos(f / 80) * 30, bottom: 120 + Math.sin(f / 95) * 24, width: 760, height: 760, borderRadius: 380, backgroundColor: C.sky })} />
  </div>
);

// Тонкое жёлтое подчёркивание под блоком: рисуется слева направо на слове.
const Underline: React.FC<{ readonly f: number; readonly at: number; readonly x: number; readonly y: number; readonly w: number }> = ({ f, at, x, y, w }) => {
  const k = easeOut((f - at) / 12);
  if (k <= 0) return null;
  return <div style={box({ left: x, top: y, width: w * k, height: 8, borderRadius: 4, backgroundColor: C.yellow })} />;
};

// Блоки контактов: координаты кадра, неподвижны с кадра CTA.contacts.
const L = { x: SAFE.left + 10, w: 1080 - SAFE.left - SAFE.right - 20 } as const; // 80…920

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const atLink = useWordMatch("n07", "профилдеги");
  const atWa = useWordMatch("n07", "ватсап");
  const atNum = useWordMatch("n07", "экрандагы");

  // 1) лента складывается (общий план), руки мамы держат края панели 1
  const panels: PanelSpec[] = [];
  for (let n = 1; n <= RIB.count; n++) {
    const A = PANEL_ART[n];
    panels.push({ n, unfold: foldOf(f, n), art: <A t={DONE} /> });
  }
  const foldEnd = CTA.foldFrom + 4 * CTA.foldStep + CTA.foldLen;
  const folded = f >= foldEnd;
  // камера: с общего плана плавно подходит к сложенной ленте (памятке)
  const MEMO_ZOOM = 1.05; // памятка ≈ 860 px в ширину
  const pull = easeInOut((f - CTA.foldFrom) / (CTA.flipAt + CTA.flipLen - CTA.foldFrom));
  const memoY = panelTop(1) + RIB.h / 2;
  const cam: Cam = {
    x: 540,
    y: lerp(WIDE.y, memoY - 30, pull) + Math.sin(f / 40) * 3 * pull,
    zoom: lerp(WIDE.zoom, MEMO_ZOOM, pull) + 0.02 * easeInOut((f - (CTA.flipAt + CTA.flipLen)) / 40),
  };
  // 2) памятка: сложенная лента поворачивается вокруг вертикальной оси (3D),
  // с обратной стороны — обложка «6 кадам» с шестью пунктами
  const flip = easeInOut((f - CTA.flipAt) / CTA.flipLen);
  // 3) белый лист памятки раскрывается на весь кадр
  const open = easeInOut((f - CTA.openAt) / CTA.openLen);
  const contactsOn = f >= CTA.contacts;

  return (
    <div style={box({ inset: 0, fontFamily: F.text })}>
      {/* бренд-экран (под листом до раскрытия) */}
      {f >= CTA.openAt ? <BrandBg f={f} /> : null}

      {/* лента и памятка — до раскрытия */}
      {open < 1 ? (
        <div style={box({ inset: 0, opacity: 1 - open })}>
          <Shot f={f} cam={cam} bg={C.bg}>
            <Paper />
            {/* лента / памятка: две стороны одного листа, поворот rotateY */}
            <div style={box({ left: 0, top: 0, width: 1080, height: 1, perspective: 2600, perspectiveOrigin: `540px ${memoY}px` })}>
              <div style={box({ left: 0, top: 0, width: 1080, height: 1, transformStyle: "preserve-3d", transformOrigin: `540px ${memoY}px`, transform: `rotateY(${180 * flip}deg)` })}>
                <div style={box({ left: 0, top: 0, width: 1080, height: 1, backfaceVisibility: "hidden" })}>
                  <Ribbon panels={panels} showEdge={!folded} />
                </div>
                <div style={box({ left: 540, top: memoY, width: 1, height: 1, backfaceVisibility: "hidden", transform: "rotateY(180deg)" })}>
                  <Memo w={RIB.w} h={RIB.h} />
                </div>
              </div>
            </div>
            <Svg>
              {(() => {
                // руки держат низ ленты и поднимаются вместе со складываемыми
                // панелями; на перевороте отпускают, затем держат памятку за бока
                let bottom = panelTop(1) + RIB.h;
                for (let n = 2; n <= RIB.count; n++) bottom += RIB.h * Math.cos((90 * (1 - easeInOut(clamp(foldOf(f, n)))) * Math.PI) / 180);
                const away = easeInOut((f - (CTA.flipAt - 4)) / 8) * (1 - easeInOut((f - (CTA.flipAt + CTA.flipLen - 2)) / 10));
                const gone = easeInOut((f - (CTA.openAt - 6)) / 10);
                const hold = easeInOut((f - (CTA.flipAt + CTA.flipLen - 2)) / 10);
                const yFold = bottom + 140;
                const yMemo = memoY + 500; // щепоть — у нижних углов памятки, текст открыт
                const y = lerp(yFold, yMemo, hold) + (away + gone) * 700;
                const dx = lerp(16, 24, hold);
                if (away + gone >= 0.999) return null;
                return (
                  <>
                    <CloseHand x={RIB_X - dx} y={y + Math.sin(f / 26) * 3} angle={-150} size={280} {...SKIN.apa} shape="pinch" mirror armLen={7} />
                    <CloseHand x={RIB_X + RIB.w + dx} y={y + Math.sin(f / 31 + 1) * 3} angle={150} size={280} {...SKIN.apa} shape="pinch" armLen={7} />
                  </>
                );
              })()}
            </Svg>
          </Shot>
          {/* лист памятки растёт до размера кадра */}
          {f >= CTA.openAt ? (
            <div
              style={box({
                left: lerp(540 - (RIB.w * cam.zoom) / 2, -40, open),
                top: lerp(960 + (memoY - cam.y) * cam.zoom - (RIB.h * cam.zoom) / 2, -40, open),
                width: lerp(RIB.w * cam.zoom, 1160, open),
                height: lerp(RIB.h * cam.zoom, 2000, open),
                borderRadius: lerp(18, 0, open),
                backgroundColor: C.white,
                // памятка растворяется в белом листе, пока лист растёт
                opacity: clamp((f - CTA.openAt + 1) / 5),
              })}
            />
          ) : null}
        </div>
      ) : null}

      {/* контакты: появляются к кадру CTA.contacts и дальше неподвижны */}
      {f >= CTA.openAt + 2 ? (
        <div style={box({ inset: 0, opacity: contactsOn ? 1 : clamp((f - (CTA.openAt + 2)) / (CTA.contacts - CTA.openAt - 2)) })}>
          {/* логотип */}
          <div style={box({ left: 540 - 165 - 30, top: 300, width: 330, height: 330 })}>
            <Img
              src={staticFile(BG25_VIDEO.logo)}
              style={{ width: 330, height: 330, borderRadius: 165, objectFit: "cover", boxShadow: "0 18px 40px rgba(20,40,90,0.18)", transform: `scale(${1 + 0.015 * Math.sin(f / 22)})` }}
            />
          </div>
          {/* город */}
          <div style={box({ left: L.x, width: L.w, top: 664, textAlign: "center", fontWeight: 900, fontSize: 52, lineHeight: 1.1, color: C.navy, whiteSpace: "nowrap" })}>{T.city}</div>
          {/* маршрут */}
          <div style={box({ left: L.x, width: L.w, top: 742, display: "flex", justifyContent: "center" })}>
            <div style={{ padding: "10px 30px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontWeight: 900, fontSize: 40, letterSpacing: 1 }}>{T.route}</div>
          </div>
          {/* 1) ссылка в профиле */}
          <div
            style={box({
              left: L.x,
              width: L.w,
              top: 850,
              height: 128,
              borderRadius: 34,
              backgroundColor: C.white,
              border: `5px solid ${C.navy}`,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "0 28px",
              boxSizing: "border-box",
              boxShadow: "0 14px 30px rgba(20,40,90,0.12)",
            })}
          >
            <div style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: C.yellow, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon kind="link" s={52} color={C.navy} w={5} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 38, color: C.navy, lineHeight: 1.1, whiteSpace: "nowrap" }}>{T.link}</div>
            <svg width={44} height={60} viewBox="0 0 44 60" style={{ marginLeft: "auto", flexShrink: 0 }}>
              <path d="M22 56 V8 M6 24 L22 6 L38 24" fill="none" stroke={C.navy} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* или */}
          <div style={box({ left: L.x, width: L.w, top: 1004, textAlign: "center", fontWeight: 800, fontSize: 44, color: C.inkSoft })}>{T.or}</div>
          {/* 2) WhatsApp и полный номер */}
          <div
            style={box({
              left: L.x,
              width: L.w,
              top: 1084,
              height: 230,
              borderRadius: 40,
              backgroundColor: C.navy,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 34px",
              boxSizing: "border-box",
              boxShadow: "0 18px 36px rgba(20,40,90,0.24)",
            })}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <WaBadge s={64} />
              <div style={{ fontWeight: 900, fontSize: 48, color: C.white }}>{T.whatsappLabel}</div>
            </div>
            <div style={{ marginTop: 8, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: C.yellow, letterSpacing: 2, whiteSpace: "nowrap" }}>{T.whatsappNumber}</div>
          </div>
          {/* подчёркивания под словами диктора (блоки неподвижны) */}
          <Underline f={f} at={Math.max(CTA.contacts, atLink)} x={L.x + 40} y={988} w={L.w - 80} />
          <Underline f={f} at={Math.max(CTA.contacts, atWa, atNum)} x={L.x + 40} y={1326} w={L.w - 80} />
        </div>
      ) : null}
    </div>
  );
};

export const ctaSfx: SceneSfx = (tl) => [
  { at: CTA.foldFrom + 2, src: SFX.fold, volume: 0.3 },
  { at: CTA.foldFrom + 2 * CTA.foldStep + 2, src: SFX.fold, volume: 0.26 },
  { at: CTA.foldFrom + 4 * CTA.foldStep + 2, src: SFX.fold, volume: 0.3 },
  { at: CTA.flipAt, src: SFX.rustle, volume: 0.24 },
  { at: CTA.openAt, src: SFX.whoosh, volume: 0.18 },
  { at: CTA.contacts, src: SFX.chime, volume: 0.18 },
  { at: Math.max(CTA.contacts + 6, wordMatchIn(tl, "cta", "n07", "профилдеги")), src: SFX.tick, volume: 0.16 },
  { at: Math.max(CTA.contacts + 12, wordMatchIn(tl, "cta", "n07", "ватсап")), src: SFX.tick, volume: 0.16 },
];
