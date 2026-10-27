// Сцена 4 (≈32–43 с): честные условия — до того, как снова появится
// условное зеркало. Отправленное мамой сообщение превращается в шаг
// «Арыз ✓», затем «Топ издөө…» (идёт) и серый «Каттам ?».
// Диктор: «Бирок арыздан кийин каттам дароо башталбайт. Адегенде
// ылайыктуу топ изделет, анын табылары кепил эмес.»
// Карта района Бишкека: дом мамы и школа, вокруг — волна поиска; серые
// точки других домов, часть подходит (жёлтая обводка) — «Жолу окшош»,
// «Убактысы туура келет». Ряд из 4 мест: одно занято её ребёнком,
// остальные пунктиром «?», «3–4 бала». На словах «кепил эмес» — штамп
// «Топ табылары кепил эмес». Группа в этой сцене НЕ формируется.
// В конце из центральной линии снова раскрывается условное зеркало.
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { useScene, useTimeline } from "../context";
import { HALF, LeftPanel, MirrorLine, NowLabel, RightPanel } from "../mirror";
import { C } from "../palette";
import { clamp, easeInOut, easeOut, keys, lerp } from "../rig/motion";
import { BG45_TEXT } from "../script";
import { Mountains } from "../sets/Apartment";
import { RouteIcon } from "../screens";
import { wordFrame } from "./common";
import { groupBeats } from "../beats";
import { TRIAL_AXIS, TRIAL_CAM_L, TRIAL_CAM_R, TrialLeftWorld, TrialRightWorld } from "./Trial";

const MAP = { x: 70, y: 560, w: 940, h: 540 } as const;
// Точки на карте (в координатах карты): дом мамы, школа, другие дома.
const HOME = { x: 300, y: 330 } as const;
const SCHOOL = { x: 700, y: 180 } as const;
const OTHERS = [
  { x: 180, y: 220 },
  { x: 420, y: 440 },
  { x: 520, y: 300 },
  { x: 120, y: 420 },
  { x: 820, y: 420 },
  { x: 360, y: 150 },
] as const;

const Pin: React.FC<{ x: number; y: number; color: string; ring?: string; a: number; s?: number; children?: React.ReactNode }> = ({ x, y, color, ring, a, s = 1, children }) => (
  <div style={{ position: "absolute", left: x - 34 * s, top: y - 80 * s, width: 68 * s, height: 86 * s, opacity: a, transform: `scale(${0.6 + 0.4 * easeOut(a)})`, transformOrigin: "50% 100%" }}>
    <svg width={68 * s} height={86 * s} viewBox="0 0 68 86" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {ring ? <circle cx={34} cy={32} r={36} fill="none" stroke={ring} strokeWidth={7} /> : null}
      <path d="M 34 84 C 30 70 4 54 4 32 A 30 30 0 1 1 64 32 C 64 54 38 70 34 84 Z" fill={color} />
      <circle cx={34} cy={32} r={16} fill="#FFFFFF" />
    </svg>
    <div style={{ position: "absolute", left: 0, top: 14 * s, width: 68 * s, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 24 * s, color: C.navy }}>{children}</div>
  </div>
);

// Силуэт ребёнка на месте в машине (место занято / пусто).
const Seat: React.FC<{ filled: number; a: number }> = ({ filled, a }) => (
  <svg width={96} height={96} viewBox="0 0 96 96" style={{ opacity: a }}>
    <rect x={8} y={8} width={80} height={80} rx={22} fill={filled ? C.yellowSoft : "#FFFFFF"} stroke={filled ? C.yellow : "#B8C4D6"} strokeWidth={5} strokeDasharray={filled ? undefined : "10 8"} />
    {filled ? (
      <g fill={C.navy}>
        <circle cx={48} cy={36} r={13} />
        <path d="M 26 76 C 26 58 36 52 48 52 C 60 52 70 58 70 76 Z" />
      </g>
    ) : (
      <text x={48} y={60} textAnchor="middle" fontSize={34} fontWeight={900} fill="#9AA8BE" fontFamily={fontFamily}>
        ?
      </text>
    )}
  </svg>
);

export const GroupScene: React.FC = () => {
  const f = useCurrentFrame();
  const { from, frames } = useScene();
  const tl = useTimeline();
  const cue = tl.cues.find((c) => c.id === "n03")!;
  const g = BG45_TEXT.group;
  const { notNow, title, fit, noG, mir0 } = groupBeats(frames, (p, fb, nth = 0) => wordFrame(cue, p, fb, from, nth));
  const a = (at: number, d = 10) => easeOut((f - at) / d);
  // конец сцены: условное зеркало раскрывается из центральной линии
  const shrink = easeInOut((f - mir0) / 26);
  const open = (f - (mir0 + 10)) / 30;
  const map0 = Math.min(-10, title - 20);
  const scan = (((f - map0) % 60) + 60) % 60 / 60;
  // медленный наезд камеры на карту — доска «дышит», а не стоит слайдом
  const push = 1 + 0.045 * easeInOut(f / Math.max(1, mir0));
  const board = (
    <div style={{ position: "absolute", inset: 0, fontFamily, color: C.navy, background: "linear-gradient(180deg, #FFFFFF 0%, #FFFBEF 100%)", transform: `scale(${push})`, transformOrigin: "50% 62%" }}>
      {/* заголовок */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 258, textAlign: "center", fontSize: 54, fontWeight: 900, lineHeight: 1.1, opacity: a(title - 6), transform: `translateY(${(1 - a(title - 6)) * 20}px)` }}>{g.title}</div>
      {/* отправленное сообщение «улетает» в шаг «Арыз ✓» */}
      {f < 18 ? (
        <div style={{ position: "absolute", left: lerp(330, 150, easeInOut(f / 16)), top: lerp(560, 360, easeInOut(f / 16)), width: 420, padding: "18px 20px", borderRadius: "26px 6px 26px 26px", backgroundColor: "#DCF4CF", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", transform: `scale(${lerp(1, 0.3, easeInOut(f / 16))})`, transformOrigin: "0 0", opacity: 1 - clamp((f - 10) / 8), zIndex: 2 }}>
          {[0.9, 0.7, 0.8, 0.6, 0.65].map((wd, i) => (
            <div key={i} style={{ height: 14, width: `${wd * 100}%`, borderRadius: 7, backgroundColor: "#9CC79A", marginBottom: 10 }} />
          ))}
        </div>
      ) : null}
      {/* шаги: Арыз ✓ → Топ издөө… → Каттам ? */}
      <div style={{ position: "absolute", left: 30, right: 30, top: 360, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        {g.steps.map((s, i) => {
          const on = a(10 + i * 8, 8);
          const state = i === 0 ? "done" : i === 1 ? "now" : "later";
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 16, opacity: on }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px 14px", borderRadius: 999, fontSize: 32, fontWeight: 900, whiteSpace: "nowrap", backgroundColor: state === "done" ? "#EEF3FA" : state === "now" ? C.yellow : "#F1F4F8", color: state === "later" ? "#8C99AE" : C.navy, border: `4px ${state === "later" ? "dashed" : "solid"} ${state === "done" ? "#C9D3E2" : state === "now" ? C.yellowDeep : "#C9D3E2"}` }}>
                {state === "done" ? (
                  <svg width={32} height={32} viewBox="0 0 44 44">
                    <path d="M 6 22 L 38 8 L 28 38 L 22 25 Z" fill={C.navy} />
                  </svg>
                ) : state === "now" ? (
                  <svg width={34} height={34} viewBox="0 0 40 40" style={{ transform: `rotate(${f * 9}deg)` }}>
                    <circle cx={20} cy={20} r={15} stroke={C.navy} strokeWidth={5} fill="none" strokeDasharray="60 40" strokeLinecap="round" />
                  </svg>
                ) : null}
                {s}
                {state === "later" ? "?" : ""}
              </div>
              {i < 2 ? <span style={{ fontSize: 40, fontWeight: 900, color: "#9AA8BE" }}>→</span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: a(notNow - 4) }}>
        <div style={{ padding: "8px 26px 10px", borderRadius: 18, backgroundColor: "#EEF3FA", fontSize: 34, fontWeight: 900, color: C.ink }}>{g.notNow}</div>
      </div>
      {/* карта района */}
      <div style={{ position: "absolute", left: MAP.x, top: MAP.y, width: MAP.w, height: MAP.h, borderRadius: 40, overflow: "hidden", backgroundColor: "#F3F1EA", boxShadow: "0 20px 44px rgba(20,40,90,0.14)", border: "5px solid #FFFFFF", opacity: a(map0, 12), transform: `translateY(${(1 - a(map0, 14)) * 40}px)` }}>
        <Mountains x={-20} y={-30} w={MAP.w + 40} h={120} />
        <div style={{ position: "absolute", left: 0, top: 70, width: MAP.w, height: MAP.h, backgroundImage: "repeating-linear-gradient(90deg, #FFFFFF 0 16px, transparent 16px 170px), repeating-linear-gradient(0deg, #FFFFFF 0 16px, transparent 16px 140px)", opacity: 0.95 }} />
        <div style={{ position: "absolute", left: -40, top: 250, width: MAP.w + 80, height: 30, backgroundColor: "#FFFFFF", transform: "rotate(-8deg)" }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", left: 40 + (i % 3) * 300, top: 110 + Math.floor(i / 3) * 210, width: 120, height: 80, borderRadius: 14, backgroundColor: i % 2 ? "#E6EFE0" : "#ECE6DA" }} />
        ))}
        {/* волна поиска вокруг дома */}
        {[0, 1].map((k) => {
          const t = (scan + k * 0.5) % 1;
          return (
            <div key={k} style={{ position: "absolute", left: HOME.x - 260 * t, top: HOME.y - 260 * t - 30, width: 520 * t, height: 520 * t, borderRadius: 999, border: `5px solid ${C.yellow}`, opacity: (1 - t) * 0.8 * a(map0 + 10, 10) }} />
          );
        })}
        {/* линия дом → школа (пунктир: маршрут ещё не собран) */}
        <svg width={MAP.w} height={MAP.h} style={{ position: "absolute", left: 0, top: 0, opacity: a(map0 + 8) }}>
          <path d={`M ${HOME.x} ${HOME.y - 30} Q ${(HOME.x + SCHOOL.x) / 2} ${SCHOOL.y - 90} ${SCHOOL.x} ${SCHOOL.y - 30}`} stroke={C.navy} strokeWidth={6} strokeDasharray="14 14" fill="none" opacity={0.35} />
        </svg>
        {OTHERS.map((o, i) => {
          const at = title + 10 + i * 6;
          // кандидаты ищутся — совпадений не показываем (группа не гарантирована)
          return (
            <Pin key={i} x={o.x} y={o.y} color="#C7D0DD" a={a(at, 8) * (0.75 + 0.25 * Math.sin((f + i * 11) / 7))} s={0.8}>
              ?
            </Pin>
          );
        })}
        <div style={{ position: "absolute", left: SCHOOL.x - 46, top: SCHOOL.y - 92, opacity: a(map0 + 6) }}>
          <RouteIcon kind="school" size={92} />
        </div>
        <div style={{ position: "absolute", left: HOME.x - 50, top: HOME.y - 100, opacity: a(map0 + 4) }}>
          <RouteIcon kind="home" size={100} />
        </div>
        {/* штамп: «Топ табылары кепил эмес» */}
        <div style={{ position: "absolute", right: 34, bottom: 34, padding: "14px 26px 16px", borderRadius: 22, border: `5px solid ${C.navy}`, backgroundColor: "rgba(255,255,255,0.94)", fontSize: 38, fontWeight: 900, color: C.navy, opacity: a(noG - 2, 6), transform: `rotate(${-4 + 2 * (1 - a(noG - 2, 8))}deg) scale(${1.25 - 0.25 * a(noG - 2, 8)})`, boxShadow: "0 10px 24px rgba(20,40,90,0.16)" }}>
          <svg width={38} height={38} viewBox="0 0 40 40" style={{ marginRight: 12, verticalAlign: "-6px" }}>
            <circle cx={20} cy={20} r={17} fill="none" stroke={C.navy} strokeWidth={4} />
            <circle cx={20} cy={12} r={3} fill={C.navy} />
            <rect x={17.5} y={17} width={5} height={13} rx={2.5} fill={C.navy} />
          </svg>
          {g.noGuarantee}
        </div>
      </div>
      {/* критерии и места */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1128, display: "flex", justifyContent: "center", gap: 18 }}>
        {g.checks.map((c, i) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 22px 12px", borderRadius: 999, backgroundColor: "#FFFFFF", border: `4px solid ${C.yellow}`, fontSize: 34, fontWeight: 900, opacity: a(fit + 6 + i * 8), transform: `translateY(${(1 - a(fit + 6 + i * 8)) * 16}px)` }}>
            <svg width={30} height={30} viewBox="0 0 40 40">
              <circle cx={17} cy={17} r={11} stroke={C.navy} strokeWidth={5} fill="none" />
              <path d="M 25 25 L 35 35" stroke={C.navy} strokeWidth={5} strokeLinecap="round" />
            </svg>
            {c}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, opacity: a(fit + 20) }}>
        {[1, 0, 0, 0].map((fl, i) => (
          <Seat key={i} filled={fl} a={a(fit + 20 + i * 4, 8) * (fl ? 1 : 0.7 + 0.3 * Math.sin((f + i * 9) / 7))} />
        ))}
        <div style={{ marginLeft: 12, padding: "10px 22px 12px", borderRadius: 18, backgroundColor: C.navy, color: "#FFFFFF", fontSize: 36, fontWeight: 900 }}>{g.seats}</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }}>
      {f < mir0 ? (
        board
      ) : (
        <>
          {/* доска уходит в левую половину («АЗЫР»), справа — условное зеркало */}
          <div style={{ position: "absolute", left: 0, top: 0, width: lerp(1080, HALF, shrink), height: 1920, overflow: "hidden", opacity: 1 - clamp(shrink * 3) }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${lerp(1, 0.5, shrink)})`, transformOrigin: "0% 50%" }}>{board}</div>
          </div>
          {/* доска уходит раньше, чем проявляется улица: без двойной экспозиции */}
          <div style={{ position: "absolute", inset: 0, opacity: clamp((shrink - 0.3) / 0.7) }}>
            <LeftPanel cam={TRIAL_CAM_L(f - frames)} width={HALF}>
              <TrialLeftWorld f={f - frames} />
            </LeftPanel>
          </div>
          <RightPanel cam={TRIAL_CAM_R(f - frames)} mirror={TRIAL_AXIS} open={open} f={f}>
            <TrialRightWorld f={f - frames} />
          </RightPanel>
          <MirrorLine draw={keys(f, [[mir0 + 12, 0], [mir0 + 26, 1]])} glow={0.6} />
          <NowLabel a={clamp((f - mir0 - 12) / 8)} />
        </>
      )}
    </div>
  );
};
