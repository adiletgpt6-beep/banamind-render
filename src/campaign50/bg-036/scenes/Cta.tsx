// Сцена 6 (финал). Шапка финала (логотип, BalaGo, город) уже на месте, пока
// сцена проявляется поверх предыдущей — без белой паузы. Бумажная лента
// сворачивается в фирменный жёлтый угол
// (с делениями рулетки) и освобождает место неподвижной контрастной
// финальной карточке: логотип, «BalaGo», «Бишкек • Балдар үчүн такси»,
// «40 төлөйсүз → 45 аласыз», «Профилдеги шилтемеге өтүңүз», «же WhatsApp
// аркылуу жазыңыз» и крупно «WhatsApp: 0998 08 38 28». Оба способа связи
// и номер видны одновременно с BG36_CONTACTS_IN до последнего кадра
// (≥ 5 с), после последнего слова экран держится ≥ 3 с. Номер не
// прячется в переходе. Всё в безопасной зоне Reels: сверху ≥ 250 px,
// снизу ≥ 400 px, справа ≥ 150 px.
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import type { SfxPlan } from "../Bg36Audio";
import { clamp, easeInOut, easeOut, lerp } from "../art/motion";
import { FlatTape, GRID, PANEL_H, PANEL_W } from "../art/Tape";
import { Txt } from "../art/ui";
import { C } from "../palette";
import { BG36_CONTACTS_IN, BG36_TEXT, BG36_VIDEO, BG36_XFADE } from "../script";
import { type ScenePlanArgs, sec, useSceneArgs, wordF } from "./common";

const CONTACTS = sec(BG36_CONTACTS_IN);
const CORNER = 430; // катет жёлтого угла, px

export const SFX_CTA: SfxPlan = () => [
  { at: 2, src: "audio/sfx-whoosh.mp3", volume: 0.2 },
  { at: 12, src: "audio/sfx-paper.mp3", volume: 0.22 },
  { at: CONTACTS, src: "audio/sfx-chime.mp3", volume: 0.2 },
];

const LOGO = { x: 500, y: 520, r: 124 }; // ось колонки: (70 + 930) / 2

// Акценты финала на словах диктора (контакты при этом не двигаются):
// «Бишкектеги» — блик по плашке города, «профилдеги шилтемеге» — маркер
// под строкой ссылки, «экрандагы номерге WhatsApp» — свечение блока номера.
// После последнего слова всё неподвижно (≥ 3 с).
export const ctaPlan = (a: ScenePlanArgs) => ({
  city: wordF(a, "n06", 1), // «Бишкектеги»
  link: wordF(a, "n07", 5), // «профилдеги»
  linkEnd: wordF(a, "n07", 7), // «өтүңүз»
  phone: wordF(a, "n07", 9), // «экрандагы»
  go: wordF(a, "n08", 2), // «жолго»
  frames: a.sc.frames,
});

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = BG36_TEXT.cta;
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  const item = (at: number): React.CSSProperties => ({
    opacity: a(at),
    transform: `translateY(${(1 - a(at)) * 20}px)`,
  });
  const p = ctaPlan(useSceneArgs("cta"));
  // после смены сцены лента влетает слева в верхний угол и складывается
  // в жёлтый треугольник (ничего не появляется поверх уходящей сцены)
  // лента стартует от левого края ещё во время растворения (не над формой)
  const t0 = Math.round(BG36_XFADE / 2);
  const fly = easeInOut((f - t0) / 16);
  const corner = easeOut((f - t0 - 6) / 12);
  const tapeScale = lerp(0.3, 0.07, fly);
  const tapeX = lerp(-120, 50, fly);
  const tapeY = lerp(560, 50, fly);
  const tapeO = clamp((f - t0) / 4) * (1 - clamp((f - t0 - 12) / 5));
  const contactsIn = a(CONTACTS, 8);
  // акценты: 0…1…0 вокруг слова
  const beat = (at: number, len = 22) => Math.sin(Math.PI * clamp((f - at + 2) / len));
  const cityGlow = beat(p.city, 26);
  const linkMark = easeInOut((f - p.link) / Math.max(8, p.linkEnd - p.link));
  const phoneGlow = beat(p.phone, 30);
  const logoBob = -5 * beat(p.go, 18);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", fontFamily, color: C.navy, overflow: "hidden" }}>
      {/* мягкие фирменные пятна */}
      <div style={{ position: "absolute", right: -220, bottom: -200, width: 660, height: 660, borderRadius: 330, backgroundColor: C.sky }} />
      {/* жёлтый угол с делениями рулетки и линией сгиба */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`scale(${corner})`}>
          <path d={`M 0 0 L ${CORNER} 0 L 0 ${CORNER} Z`} fill={C.yellow} />
          <path d={`M ${CORNER} 0 L 0 ${CORNER}`} stroke={C.yellowDeep} strokeWidth={6} />
          <path d={`M ${CORNER * 0.62} 0 L 0 ${CORNER * 0.62}`} stroke="rgba(255,255,255,0.55)" strokeWidth={3} strokeDasharray="10 9" />
          {Array.from({ length: 21 }).map((_, i) => {
            const u = (i + 0.5) / 21;
            const x = CORNER * (1 - u);
            const y = CORNER * u;
            const len = i % 5 === 0 ? 30 : 16;
            return (
              <path key={i} d={`M ${x} ${y} l ${-len * 0.707} ${-len * 0.707}`} stroke={C.navy} strokeWidth={i % 5 === 0 ? 4 : 2.5} opacity={0.7} />
            );
          })}
        </g>
      </svg>
      {tapeO > 0 ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${tapeX}px, ${tapeY}px) rotate(${-20 - 25 * fly}deg) scale(${tapeScale}) translate(${-GRID.x - PANEL_W / 2}px, ${-GRID.y - PANEL_H * 2.5}px)`,
            transformOrigin: "0 0",
            opacity: tapeO,
          }}
        >
          <FlatTape />
        </div>
      ) : null}
      {/* логотип */}
      <div
        style={{
          position: "absolute",
          left: LOGO.x - LOGO.r,
          top: LOGO.y - LOGO.r,
          width: LOGO.r * 2,
          height: LOGO.r * 2,
          opacity: a(-6),
          transform: `translateY(${logoBob}px) scale(${0.85 + 0.15 * a(-6)})`,
        }}
      >
        <Img
          src={staticFile(BG36_VIDEO.logo)}
          style={{ width: LOGO.r * 2, height: LOGO.r * 2, borderRadius: LOGO.r, objectFit: "cover", boxShadow: "0 22px 46px rgba(20,40,90,0.18)" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 150,
          top: 672,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <div style={{ ...item(-4), fontSize: 104, fontWeight: 1000, lineHeight: 1 }}>{t.brand}</div>
        <div
          style={{
            ...item(-2),
            padding: "12px 34px 14px",
            borderRadius: 999,
            backgroundColor: C.navy,
            color: "#FFFFFF",
            fontSize: 48,
            fontWeight: 900,
            position: "relative",
            overflow: "hidden",
            boxShadow: cityGlow > 0 ? `0 0 ${28 * cityGlow}px rgba(255,201,14,${0.75 * cityGlow})` : undefined,
          }}
        >
          {/* блик по плашке на слове «Бишкектеги» */}
          {f >= p.city - 2 && f < p.city + 26 ? (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 90,
                left: `${-15 + 130 * clamp((f - p.city + 2) / 26)}%`,
                background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)",
              }}
            />
          ) : null}
          <span style={{ position: "relative" }}>{t.city}</span>
        </div>
        <div
          style={{
            ...item(2),
            padding: "8px 26px 10px",
            borderRadius: 999,
            backgroundColor: C.yellow,
            fontSize: 38,
            fontWeight: 900,
          }}
        >
          <Txt>{t.pack}</Txt>
        </div>
        {/* оба способа связи и номер — вместе, неподвижно, до конца ролика */}
        <div
          style={{
            opacity: contactsIn,
            marginTop: 14,
            width: "100%",
            padding: "26px 20px 22px",
            borderRadius: 32,
            border: "4px solid #DCE3EE",
            backgroundColor: "#F8FAFD",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 46,
              fontWeight: 900,
              lineHeight: 1.1,
              // маркер под строкой ссылки на словах «профилдеги шилтемеге»
              backgroundImage: `linear-gradient(${C.yellow}, ${C.yellow})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "0 88%",
              backgroundSize: `${100 * linkMark}% 34%`,
              padding: "0 6px",
            }}
          >
            <svg width={46} height={46} viewBox="0 0 24 24">
              <path
                d="M10 14 a4 4 0 0 0 5.6 0 l3-3 a4 4 0 0 0 -5.6 -5.6 l-1 1 M14 10 a4 4 0 0 0 -5.6 0 l-3 3 a4 4 0 0 0 5.6 5.6 l1 -1"
                fill="none"
                stroke={C.navy}
                strokeWidth={2.4}
                strokeLinecap="round"
              />
            </svg>
            {t.link}
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: "#3A4F80", lineHeight: 1.1 }}>{t.or}</div>
          <div
            style={{
              marginTop: 8,
              width: "100%",
              padding: "14px 0 18px",
              borderRadius: 24,
              backgroundColor: C.greenSoft,
              border: "3px solid #BFE3CB",
              // свечение блока номера на словах «экрандагы номерге WhatsApp»
              boxShadow: phoneGlow > 0 ? `0 0 0 ${6 * phoneGlow}px rgba(46,139,87,${0.35 * phoneGlow}), 0 0 ${30 * phoneGlow}px rgba(46,139,87,${0.4 * phoneGlow})` : undefined,
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 900, color: "#1F7A45" }}>{t.whatsappLabel}</div>
            <div style={{ fontSize: 98, fontWeight: 1000, letterSpacing: 1, lineHeight: 1.05, color: C.navy }}>{t.whatsappNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
