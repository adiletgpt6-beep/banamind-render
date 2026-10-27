// Сцена 7 (≈ 56–67 с): телефон мамы крупно. Открыт сайт BalaGo
// (Балдар үчүн такси • Бишкек): мама сама вводит дом, школу и время —
// условный пример (пометка «Шарттуу мисал»). Заявка не «подтверждается»:
// кнопка WhatsApp просто видна, никакого экрана «принято».
// Затем по словам диктора из экрана выходят три честных шага:
// «Алгач топ» (3–4 бала, издөө 2 жумага чейин) → «Акысыз толук сыноо»
// (үй → мектеп → үй, топ түзүлгөндөн кийин) → «Чечим сиздики» (төлөм —
// чечимден кийин); внизу — «Натыйжа кепил эмес».
import { Img, staticFile, useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { lineIn, useScene, useTimeline, wordIn } from "../context";
import { C } from "../palette";
import { LOOKS } from "../rig/looks";
import { clamp, easeInOut, easeOut, lerp } from "../rig/motion";
import { BG50_TEXT, BG50_VIDEO } from "../script";
import { HoldingHand, PhoneFrame, StatusBar, TapFinger } from "../screens";
import { appear, ExampleChip } from "../ui";

const PH = { x: 170, y: 250, w: 700 } as const;
const TYPE0 = 12; // начало ввода первого поля
const PER_FIELD = 16;

const Field: React.FC<{ readonly label: string; readonly value: string; readonly f: number; readonly at: number; readonly active: boolean }> = ({ label, value, f, at, active }) => {
  const n = Math.round(value.length * clamp((f - at) / (PER_FIELD - 3)));
  const caret = active && Math.floor(f / 8) % 2 === 0;
  const done = n >= value.length;
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.muted }}>{label}</div>
      <div
        style={{
          marginTop: 8,
          padding: "16px 20px",
          borderRadius: 18,
          backgroundColor: "#FFFFFF",
          border: `3px solid ${active ? C.yellow : done ? "#BFE3CB" : "#DCE3EE"}`,
          fontSize: 32,
          fontWeight: 800,
          color: C.navy,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span>{value.slice(0, n)}</span>
        {caret ? <span style={{ width: 3, height: 34, backgroundColor: C.navy }} /> : null}
        {done && !active ? <span style={{ marginLeft: "auto", color: C.green, fontWeight: 900 }}>✓</span> : null}
      </div>
    </div>
  );
};

// Экран сайта BalaGo в телефоне.
const SiteScreen: React.FC<{ readonly f: number }> = ({ f }) => {
  const s = BG50_TEXT.site;
  const btn = appear(f, TYPE0 + PER_FIELD * 3 + 2, 10);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#F7F9FC", fontFamily }}>
      <StatusBar time={BG50_TEXT.home.clock} />
      <div style={{ position: "absolute", left: 34, right: 34, top: 96, display: "flex", alignItems: "center", gap: 18 }}>
        <Img src={staticFile(BG50_VIDEO.logo)} style={{ width: 96, height: 96, borderRadius: 48, objectFit: "cover", boxShadow: "0 8px 18px rgba(20,40,90,0.18)" }} />
        <div>
          <div style={{ fontSize: 50, fontWeight: 900, color: C.navy, lineHeight: 1 }}>{s.brand}</div>
          <div style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: C.ink }}>{s.tagline}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 34, right: 34, top: 230, height: 8, borderRadius: 4, backgroundColor: C.yellow }} />
      <div style={{ position: "absolute", left: 34, right: 34, top: 270 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.navy, lineHeight: 1.15 }}>{s.formTitle}</div>
        {s.fields.map((fl, i) => (
          <Field key={fl.label} label={fl.label} value={fl.value} f={f} at={TYPE0 + i * PER_FIELD} active={f >= TYPE0 + i * PER_FIELD - 2 && f < TYPE0 + (i + 1) * PER_FIELD - 2} />
        ))}
        <div
          style={{
            marginTop: 34,
            padding: "22px 0",
            borderRadius: 999,
            backgroundColor: "#25A35A",
            color: "#FFFFFF",
            fontSize: 34,
            fontWeight: 900,
            textAlign: "center",
            opacity: btn,
            transform: `scale(${0.92 + 0.08 * btn})`,
            boxShadow: "0 10px 22px rgba(37,163,90,0.3)",
          }}
        >
          {s.send}
        </div>
      </div>
    </div>
  );
};

// Карточка шага с номером.
const Step: React.FC<{ readonly i: number; readonly a: number; readonly from: { x: number; y: number } }> = ({ i, a, from }) => {
  const it = BG50_TEXT.steps.items[i];
  const y = 350 + i * 300;
  const x = 60;
  const e = easeOut(a);
  if (a <= 0.001) return null;
  const free = i === 1;
  return (
    <div
      style={{
        position: "absolute",
        left: lerp(from.x, x, e),
        top: lerp(from.y, y, e),
        width: 870,
        height: 236,
        borderRadius: 34,
        backgroundColor: "#FFFFFF",
        border: `4px solid ${i === 2 ? C.navy : C.yellow}`,
        boxShadow: "0 18px 40px rgba(20,40,90,0.14)",
        transform: `scale(${0.5 + 0.5 * e})`,
        transformOrigin: "0 0",
        opacity: clamp(a * 2),
        fontFamily,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 34px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: "none", width: 104, height: 104, borderRadius: 52, backgroundColor: i === 2 ? C.navy : C.yellow, color: i === 2 ? "#FFFFFF" : C.navy, fontSize: 60, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 56, fontWeight: 900, color: C.navy, lineHeight: 1.05 }}>{it.title}</div>
        <div style={{ marginTop: 12, fontSize: 32, fontWeight: 800, color: C.ink, lineHeight: 1.2 }}>{it.note}</div>
      </div>
      {free ? (
        <div style={{ position: "absolute", right: 26, top: -26, padding: "8px 22px", borderRadius: 999, backgroundColor: C.green, color: "#FFFFFF", fontSize: 30, fontWeight: 900, rotate: "4deg" }}>{BG50_TEXT.steps.freeBadge}</div>
      ) : null}
    </div>
  );
};

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const { frames } = useScene();
  // в конце сцены шаги мягко уходят вверх — к финальной карточке
  const outro = easeInOut((f - (frames - 12)) / 12);
  const w1 = wordIn(tl, "n03", "алгач", 0.12, "search");
  const w2 = wordIn(tl, "n03", "түзүл", 0.42, "search");
  const w3 = wordIn(tl, "n03", "андан", 0.8, "search");
  const n03 = lineIn(tl, "n03", "search");
  const split = w1 - 8; // телефон уходит, шаги выходят
  const out = easeInOut((f - split) / 18);
  const enter = easeOut(f / 10);
  const ph = { x: PH.x, y: PH.y + out * 1300, s: 1 };
  const mom = LOOKS.momSeeker;
  const stepFrom = { x: PH.x + 60, y: PH.y + 500 };
  const stepA = (at: number) => clamp((f - Math.max(at, split + 2)) / 14);
  const noG = appear(f, Math.max(w3 + 20, n03.to - 24), 12);
  const flow = appear(f, split + 18, 10); // после того как телефон с примером ушёл
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "radial-gradient(circle at 50% 30%, #FFFFFF 0%, #F4F7FC 70%, #EAF1FA 100%)" }}>
      {/* шаги — после того как телефон уходит вниз */}
      {f >= split ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - outro, transform: `translateY(${-160 * outro}px)` }}>
          <div style={{ position: "absolute", left: 60, right: 150, top: 232, display: "flex", justifyContent: "flex-start", opacity: flow }}>
            <div style={{ padding: "10px 24px 12px", borderRadius: 999, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, fontSize: 30, fontWeight: 900 }}>{BG50_TEXT.steps.flow}</div>
          </div>
          {[w1, w2, w3].map((at, i) => (
            <Step key={i} i={i} a={stepA(at)} from={stepFrom} />
          ))}
          {[0, 1].map((i) => (
            <div key={`ar${i}`} style={{ position: "absolute", left: 140, top: 590 + i * 300, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `34px solid ${C.yellow}`, opacity: stepA([w2, w3][i]) }} />
          ))}
          <div style={{ position: "absolute", left: 60, top: 1262, opacity: noG, translate: `0 ${(1 - noG) * 20}px` }}>
            <div style={{ padding: "12px 28px 14px", borderRadius: 999, backgroundColor: "#EEF1F6", border: "3px solid #D3DAE6", color: C.ink, fontFamily, fontSize: 36, fontWeight: 900 }}>ⓘ {BG50_TEXT.steps.noGuarantee}</div>
          </div>
        </div>
      ) : null}
      {/* телефон с сайтом */}
      {out < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - out * 0.6, transform: `translateY(${ph.y - PH.y}px) scale(${lerp(1.06, 1, enter)})`, transformOrigin: "50% 40%" }}>
          <PhoneFrame x={PH.x} y={PH.y} w={PH.w} tilt={-1.5}>
            <SiteScreen f={f} />
          </PhoneFrame>
          <HoldingHand x={PH.x} y={PH.y} w={PH.w} sleeve={mom.topColor} skin={mom.skin} />
          <TapFinger x={PH.x + 590} y={PH.y + 470} f={f} tapAt={TYPE0 - 4} skin={mom.skin} />
        </div>
      ) : null}
      {out < 1 ? <ExampleChip /> : null}
      {/* вход: короткая белая вспышка-наезд из сцены home */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", opacity: 1 - enter, pointerEvents: "none" }} />
    </div>
  );
};
