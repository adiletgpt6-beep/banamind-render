// План 5 (18,20–21,70 с): «BalaGo ушул күнүмдүк каттамды өзүбүзгө алабыз».
//   • склейка 18,2: тёмно-синий кадр-переход — хаос недели схлопнулся в
//     жёлтую точку; на «BalaGo» точка раскрывается кругом-диафрагмой,
//     открывая живой кадр, и появляется логотип + «Бишкек • Балдар үчүн такси»;
//   • «күнүмдүк каттамды» — карточка каттама (ҮЙ → МЕКТЕП) у родителя;
//   • «өзүбүзгө алабыз» — карточка переезжает к BalaGo, у родителя остаётся
//     «✓ Жумуш» — работа не прерывается.
import { Img, staticFile } from "remotion";
import { fontFamily } from "../../fonts";
import { BriefcaseIcon, CheckIcon, HouseIcon, SchoolIcon } from "../../live/icons";
import { KineticTitle } from "../../live/KineticTitle";
import { easeInOut, easeOut, mix, ramp, springy, useT } from "../../live/sync";
import { LIVE_COLORS as C } from "../../live/theme";
import { GlassPanel, Glow } from "../../live/ui";
import { CUE, LIVE04 } from "../cues";

// Диафрагма: круг, через который виден живой кадр (рисуется ПОВЕРХ видео
// как тёмно-синяя маска с дыркой).
export const IrisTransition: React.FC = () => {
  const t = useT();
  const cut = LIVE04.cuts[3];
  if (t < cut - 0.32 || t > CUE.balago + 0.6) return null;
  const cover = ramp(t, cut - 0.3, 0.28, easeInOut); // затемнение до склейки
  const open = ramp(t, CUE.balago - 0.18, 0.62, easeInOut); // раскрытие круга
  const r = open * 1500;
  const dot = springy(t, cut - 0.05, 0.4) * (1 - open);
  const cx = 540;
  const cy = 640;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: cover }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="l4bg" cx="50%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#1B3878" />
            <stop offset="60%" stopColor={C.navyDeep} />
            <stop offset="100%" stopColor={C.navyInk} />
          </radialGradient>
          <mask id="l4iris">
            <rect width={1080} height={1920} fill="white" />
            <circle cx={cx} cy={cy} r={r} fill="black" />
          </mask>
        </defs>
        <rect width={1080} height={1920} fill="url(#l4bg)" mask="url(#l4iris)" />
        {r > 0 ? <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.yellow} strokeWidth={10 * (1 - open) + 2} opacity={1 - open} /> : null}
        {/* схлопнувшийся хаос — жёлтая точка с кольцами */}
        <circle cx={cx} cy={cy} r={34 * dot} fill={C.yellow} />
        {[1, 2, 3].map((k) => (
          <circle key={k} cx={cx} cy={cy} r={(34 + k * 40 * ramp(t, cut, 0.6)) * dot} fill="none" stroke={C.yellow} strokeOpacity={0.35 / k} strokeWidth={3} />
        ))}
      </svg>
    </div>
  );
};

// Логотип + подпись города в верхней зоне (над головой).
const BrandRow: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => {
  const k = springy(t, CUE.balago, 0.6);
  const txt = ramp(t, CUE.balago + 0.15, 0.35, easeOut);
  const city = ramp(t, CUE.balago + 0.45, 0.35, easeOut);
  const e = ramp(t, out, 0.35, easeInOut);
  if (k <= 0 || e >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 80, top: 250, height: 210, display: "flex", alignItems: "center", gap: 28, opacity: 1 - e, transform: `translateY(${-e * 40}px)` }}>
      <div style={{ position: "relative", width: 200, height: 200, transform: `scale(${k}) rotate(${(1 - k) * -40}deg)` }}>
        <Glow size={360} opacity={0.55} style={{ left: -80, top: -80 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: C.white, boxShadow: "0 24px 60px rgba(6,14,38,0.5), 0 0 0 6px rgba(255,201,14,0.9)" }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily, fontWeight: 1000, fontSize: 104, lineHeight: 0.95, color: C.white, opacity: txt, transform: `translateX(${(1 - txt) * -40}px)`, textShadow: "0 6px 26px rgba(0,0,0,0.55)" }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            padding: "8px 20px",
            borderRadius: 999,
            background: C.yellow,
            color: C.navyInk,
            fontFamily,
            fontWeight: 900,
            fontSize: 34,
            opacity: city,
            transform: `translateY(${(1 - city) * 20}px)`,
            boxShadow: "0 10px 30px rgba(255,201,14,0.45)",
          }}
        >
          Бишкек • Балдар үчүн такси
        </div>
      </div>
    </div>
  );
};

// Передача каттама: родитель → BalaGo.
const Handoff: React.FC<{ readonly t: number; readonly out: number }> = ({ t, out }) => {
  const at = CUE.kunumduk - 0.15;
  const token = springy(t, CUE.kattamdy, 0.5);
  const move = ramp(t, CUE.ozubuzgo, CUE.alabyz - CUE.ozubuzgo + 0.25, easeInOut);
  const done = springy(t, CUE.alabyz + 0.1, 0.5);
  const L = { x: 175, y: 185 };
  const R = { x: 765, y: 185 };
  const tx = mix(L.x, R.x, move);
  const ty = mix(L.y, R.y, move) - Math.sin(move * Math.PI) * 110;
  return (
    <GlassPanel t={t} at={at} out={out} left={70} top={1060} width={940} height={300}>
      {/* родитель */}
      <div style={{ position: "absolute", left: 40, top: 40, width: 270, height: 220, borderRadius: 30, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.14)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 34, color: C.muted }}>СИЗ</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, opacity: ramp(t, CUE.alabyz, 0.3) }}>
          <BriefcaseIcon size={56} />
          <span style={{ fontFamily, fontWeight: 900, fontSize: 34, color: C.white }}>Жумуш</span>
          <CheckIcon size={44} />
        </div>
      </div>
      {/* BalaGo */}
      <div style={{ position: "absolute", right: 40, top: 40, width: 270, height: 220, borderRadius: 30, background: done > 0 ? `rgba(255,201,14,${0.18 + 0.2 * done})` : "rgba(255,255,255,0.08)", border: `2px solid ${done > 0 ? C.yellow : "rgba(255,255,255,0.14)"}` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 14, textAlign: "center", fontFamily, fontWeight: 1000, fontSize: 38, color: C.white }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </div>
        {done > 0 ? (
          <div style={{ position: "absolute", right: -18, top: -18, transform: `scale(${done})` }}>
            <CheckIcon size={70} />
          </div>
        ) : null}
      </div>
      {/* стрелка между */}
      <svg width={940} height={300} style={{ position: "absolute", inset: 0 }}>
        <path d="M 330 150 L 600 150" stroke="rgba(255,255,255,0.25)" strokeWidth={6} strokeDasharray="3 14" strokeLinecap="round" />
        <path d="M 590 134 L 610 150 L 590 166" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {/* карточка каттама */}
      {token > 0 ? (
        <div
          style={{
            position: "absolute",
            left: tx - 115,
            top: ty - 50,
            width: 230,
            height: 128,
            borderRadius: 24,
            background: C.white,
            boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
            transform: `scale(${token}) rotate(${Math.sin(move * Math.PI) * -6}deg)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <HouseIcon size={46} />
            <span style={{ fontFamily, fontWeight: 900, fontSize: 30, color: C.navy }}>→</span>
            <SchoolIcon size={46} />
            <span style={{ fontFamily, fontWeight: 900, fontSize: 30, color: C.navy }}>→</span>
            <HouseIcon size={46} />
          </div>
          <div style={{ fontFamily, fontWeight: 900, fontSize: 26, color: C.navy, letterSpacing: 1 }}>КҮНҮМДҮК КАТТАМ</div>
        </div>
      ) : null}
    </GlassPanel>
  );
};

export const Solution: React.FC = () => {
  const t = useT();
  const [from, to] = [LIVE04.cuts[3], LIVE04.cuts[4]];
  if (t < from - 0.05 || t > to + 0.3) return null;
  return (
    <>
      <BrandRow t={t} out={to - 0.25} />
      <KineticTitle
        y={900}
        size={90}
        out={to - 0.3}
        lines={[
          [
            { text: "өзүбүзгө", at: CUE.ozubuzgo },
          ],
          [{ text: "алабыз", at: CUE.alabyz, accent: "yellow" }],
        ]}
      />
      <Handoff t={t} out={to - 0.2} />
    </>
  );
};
