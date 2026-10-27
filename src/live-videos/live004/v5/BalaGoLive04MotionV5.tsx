// LIVE-004 v5 — полировка v4 (V5_BRIEF.md, Issue #72). Монтаж, ритм, зумы
// и вставки v4 сохранены; изменены только пять мест:
// 1) свет у фонтана (grade.ts); 2) шкала темпа без процентов;
// 3) маршрут плавнее и читаемее (Route.tsx); 4) шапка @balago.kg ниже края,
// крупнее «шилтеме», стрелка точно в ссылку; 5) номер WhatsApp контрастный
// сразу и неподвижный до конца. Новой озвучки нет, финал естественный.
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import "../../../fonts";
import { fontFamily } from "../../../fonts";
import { Captions } from "../../../live/Captions";
import { ChatPhoneIcon, LinkIcon } from "../../../live/icons";
import { KineticTitle } from "../../../live/KineticTitle";
import { easeInOut, easeOut, mix, ramp, springy, useT } from "../../../live/sync";
import { LIVE_COLORS as C } from "../../../live/theme";
import { Glow, LightSweep } from "../../../live/ui";
import { LIVE04 } from "../../../live04/timing";
import { LIVE04_PHRASES, LIVE04_WORDS } from "../../../live04/transcript";
import { StepsInsert, WeekInsert } from "../Inserts";
import { V4_CUTS } from "../v4/plan-v4";
import { gradeAt } from "./grade";
import { V5_CUE as V4_CUE, V5_END_SEC as V4_END_SEC, V5_GESTURE as V4_GESTURE, V5_SFX as V4_SFX, V5_ROUTE_END } from "./plan-v5";
import { RouteV5 } from "./Route";

export const LIVE004_V5_FRAMES = Math.round(V4_END_SEC * LIVE04.fps);

// ---------------------------------------------------------------- камера
type Zoom = { readonly from: number; readonly to: number; readonly scale: number; readonly ox: number; readonly oy: number; readonly dur: number };
// Приближения к лицу (ox/oy — точка лица в кадре, доли); «to» — склейка или конец.
const ZOOMS: readonly Zoom[] = [
  { from: V4_CUE.emes - 0.05, to: V4_CUTS[0], scale: 1.1, ox: 0.5, oy: 0.31, dur: 0.6 },
  { from: V4_CUE.tempke, to: V4_CUTS[2], scale: 1.07, ox: 0.5, oy: 0.29, dur: 0.7 },
  { from: V4_CUE.besh - 0.05, to: V4_CUTS[3], scale: 1.12, ox: 0.48, oy: 0.32, dur: 0.45 },
  { from: V4_CUE.biz - 0.1, to: V4_END_SEC + 1, scale: 1.06, ox: 0.5, oy: 0.3, dur: 1.2 },
];
// Мягкий «толчок» входящего плана — не на всех склейках, чтобы ритм менялся.
const PUNCH_CUTS = [V4_CUTS[1], V4_CUTS[4], V4_CUTS[5]];

const camera = (t: number) => {
  for (const z of ZOOMS) {
    if (t >= z.from && t < z.to) return { s: mix(1, z.scale, ramp(t, z.from, z.dur, easeInOut)), ox: z.ox, oy: z.oy };
  }
  for (const c of PUNCH_CUTS) {
    if (t >= c && t < c + 0.4) return { s: mix(1.05, 1, ramp(t, c, 0.35, easeOut)), ox: 0.5, oy: 0.4 };
  }
  return { s: 1, ox: 0.5, oy: 0.4 };
};

const Footage: React.FC = () => {
  const t = useT();
  const { width, height } = useVideoConfig();
  const g = gradeAt(t);
  const cam = camera(t);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="l4v5grade" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values={String(g.sat)} />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude={g.r[0]} exponent={g.r[1]} offset={g.r[2]} />
            <feFuncG type="gamma" amplitude={g.g[0]} exponent={g.g[1]} offset={g.g[2]} />
            <feFuncB type="gamma" amplitude={g.b[0]} exponent={g.b[1]} offset={g.b[2]} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${cam.s})`, transformOrigin: `${cam.ox * 100}% ${cam.oy * 100}%` }}>
        <OffthreadVideo src={staticFile(LIVE04.source)} muted style={{ width, height, objectFit: "cover", filter: "url(#l4v5grade)" }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- хук
const R = 112;
const Stopwatch: React.FC<{ readonly t: number }> = ({ t }) => {
  const a = springy(t, V4_CUE.keede, 0.55);
  const out = ramp(t, V4_CUTS[0] - 0.35, 0.3, easeInOut);
  if (a <= 0 || out >= 1) return null;
  const fill = ramp(t, V4_CUE.twenty, 0.55, easeOut) / 3 + ramp(t, V4_CUE.emes, 0.8, easeInOut) * 0.92;
  const hot = ramp(t, V4_CUE.emes, 0.3);
  const col = hot > 0.5 ? C.red : C.yellow;
  const circ = 2 * Math.PI * (R - 6);
  return (
    <div style={{ position: "absolute", left: 540 - 160, top: 1210 - 160, width: 320, height: 320, opacity: 1 - out, transform: `scale(${(0.6 + 0.4 * a) * (1 - 0.2 * out)})` }}>
      <Glow size={460} color={hot > 0.5 ? "rgba(255,77,94,0.8)" : "rgba(255,201,14,0.7)"} opacity={0.35} style={{ left: -70, top: -70 }} />
      <svg width={320} height={320} viewBox="-160 -160 320 320" style={{ position: "absolute", inset: 0 }}>
        <circle r={R + 30} fill="rgba(10,22,54,0.84)" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
        <circle r={R - 6} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={16} />
        <circle r={R - 6} fill="none" stroke={col} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${Math.min(1, fill) * circ} ${circ}`} transform="rotate(-90)" />
        {fill > 1 ? <circle r={R - 28} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${(fill - 1) * 2 * Math.PI * (R - 28)} 9999`} transform="rotate(-90)" /> : null}
        <line x1={0} y1={0} x2={0} y2={-(R - 34)} stroke={C.white} strokeWidth={6} strokeLinecap="round" transform={`rotate(${fill * 360})`} />
        <circle r={9} fill={C.white} />
        <rect x={-16} y={-R - 54} width={32} height={20} rx={6} fill={col} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 186, textAlign: "center", fontFamily, fontWeight: 900, fontSize: 50, color: C.white, fontVariantNumeric: "tabular-nums" }}>
        {fill >= 1 ? "60+" : Math.round(fill * 60)}
        <span style={{ fontSize: 28, marginLeft: 6, opacity: 0.85 }}>мүн</span>
      </div>
    </div>
  );
};

const Hook: React.FC = () => {
  const t = useT();
  if (t > V4_CUTS[0] + 0.1) return null;
  return (
    <>
      <KineticTitle
        y={880}
        size={94}
        out={V4_CUE.keede - 0.05}
        lines={[
          [
            { text: "Баланы", at: V4_CUE.balany },
            { text: "мектепке", at: V4_CUE.balany + 0.34 },
          ],
          [{ text: "жеткирүү", at: V4_CUE.zhetkiruu, accent: "yellow" }],
        ]}
      />
      <KineticTitle
        y={880}
        size={90}
        out={V4_CUTS[0] - 0.35}
        lines={[[{ text: "20 мүнөт", at: V4_CUE.twenty }], [{ text: "эмес", at: V4_CUE.emes, accent: "red" }]]}
      />
      <Stopwatch t={t} />
    </>
  );
};

// ---------------------------------------------------------------- темп
const Tempo: React.FC = () => {
  const t = useT();
  const at = V4_CUE.kayra2;
  const a = ramp(t, at, 0.3);
  const out = ramp(t, V4_CUTS[2] - 0.35, 0.3, easeInOut);
  if (a <= 0 || out >= 1) return null;
  const v = mix(mix(1, 0.25, ramp(t, at + 0.15, 0.5, easeOut)), 1, ramp(t, V4_CUE.kirish, 0.65, easeInOut));
  const col = v < 0.5 ? C.red : v < 0.85 ? C.yellowDeep : C.yellow;
  const RR = 170;
  const pt = (deg: number) => {
    const r = ((deg - 90) * Math.PI) / 180;
    return `${Math.cos(r) * RR} ${Math.sin(r) * RR}`;
  };
  const arc = (from: number, to: number) => `M ${pt(from)} A ${RR} ${RR} 0 0 1 ${pt(to)}`;
  return (
    <div style={{ position: "absolute", left: 210, top: 1070, width: 660, height: 280, borderRadius: 36, background: "rgba(10,22,54,0.82)", border: "2px solid rgba(255,255,255,0.14)", opacity: a * (1 - out), transform: `translateY(${(1 - a) * 30}px)` }}>
      <svg width={660} height={280} viewBox="-330 -200 660 280" style={{ position: "absolute", inset: 0 }}>
        <path d={arc(-90, 90)} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={30} strokeLinecap="round" />
        <path d={arc(-90, -90 + 180 * v)} fill="none" stroke={col} strokeWidth={30} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={-(RR - 52)} stroke={C.white} strokeWidth={8} strokeLinecap="round" transform={`rotate(${-90 + v * 180})`} />
        <circle r={15} fill={C.white} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 216, textAlign: "center", fontFamily, fontWeight: 900, color: C.white, fontSize: 40, letterSpacing: 2 }}>
        {/* без процентов (v5): слова по смыслу фразы «кайра ошол эле темпке кириш керек» */}
        <span style={{ color: col }}>{t >= V4_CUE.kirish - 0.05 ? "КАЙРА ТЕМПКЕ" : "ТЕМП ТҮШТҮ"}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- BalaGo + Бишкек
const Brand: React.FC = () => {
  const t = useT();
  const k = springy(t, V4_CUE.balago, 0.6);
  const out = ramp(t, V4_CUTS[4] - 0.45, 0.35, easeInOut);
  if (k <= 0 || out >= 1) return null;
  const txt = ramp(t, V4_CUE.balago + 0.15, 0.35);
  const city = ramp(t, V4_CUE.balago + 0.45, 0.35);
  return (
    <div style={{ position: "absolute", left: 80, top: 250, display: "flex", alignItems: "center", gap: 26, opacity: 1 - out, transform: `translateY(${-out * 30}px)` }}>
      <div style={{ position: "relative", width: 190, height: 190, transform: `scale(${k})` }}>
        <Glow size={340} opacity={0.5} style={{ left: -75, top: -75 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", background: C.white, boxShadow: "0 0 0 6px rgba(255,201,14,0.95), 0 20px 50px rgba(6,14,38,0.45)" }}>
          <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily, fontWeight: 1000, fontSize: 100, lineHeight: 0.95, color: C.white, opacity: txt, transform: `translateX(${(1 - txt) * -30}px)`, textShadow: "0 6px 24px rgba(0,0,0,0.5)" }}>
          Bala<span style={{ color: C.yellow }}>Go</span>
        </div>
        <div style={{ alignSelf: "flex-start", padding: "8px 20px", borderRadius: 999, background: C.yellow, color: C.navyInk, fontFamily, fontWeight: 900, fontSize: 34, opacity: city, transform: `translateY(${(1 - city) * 16}px)` }}>
          Бишкек • Балдар үчүн такси
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- CTA: Instagram
// Стилизованная шапка профиля (схема, не скриншот): аватар-логотип,
// @balago.kg, описание и строка ссылки. Без подписчиков, публикаций и цифр.
// v5: блок ниже верхнего края (в безопасной зоне Reels, над волосами),
// строка «шилтеме» крупнее, стрелка от пальца упирается точно в неё.
const CARD = { left: 90, top: 268, width: 820, height: 192 } as const;
const PILL = { left: CARD.left + 150, top: CARD.top + 108, width: 270, height: 66 } as const;

const InstagramHeader: React.FC = () => {
  const t = useT();
  const g = V4_GESTURE;
  const a = springy(t, g.pointUpFrom, 0.55);
  const out = ramp(t, V4_CUE.zhe - 0.3, 0.3, easeInOut);
  if (a <= 0 || out >= 1) return null;
  const draw = ramp(t, g.pointUpPeak, 0.4, easeInOut);
  const pulse = t > g.pointUpPeak + 0.4 ? 0.5 + 0.5 * Math.sin((t - g.pointUpPeak - 0.4) * 9) : 0;
  // стрелка: от кончика пальца вверх-влево (мимо очков) — в низ строки ссылки
  const p0 = { x: g.fingertip.x - 30, y: g.fingertip.y - 40 };
  const p2 = { x: PILL.left + PILL.width / 2, y: PILL.top + PILL.height + 10 };
  const p1 = { x: p2.x + 30, y: p0.y - 60 };
  const path = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;
  const ang = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <div
        style={{
          position: "absolute",
          ...CARD,
          borderRadius: 34,
          background: C.white,
          boxShadow: "0 24px 60px rgba(6,14,38,0.35)",
          transform: `translateY(${(1 - a) * -50}px) scale(${0.94 + 0.06 * a})`,
          opacity: Math.min(1, a * 1.6),
          fontFamily,
          color: C.navyInk,
        }}
      >
        <div style={{ position: "absolute", left: 18, top: 38, width: 116, height: 116, borderRadius: "50%", background: `conic-gradient(${C.yellow}, #FF8A3D, #E1306C, ${C.yellow})`, padding: 5 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: C.white, padding: 4 }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "contain" }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 150, top: 14, fontWeight: 1000, fontSize: 44 }}>@balago.kg</div>
        <div style={{ position: "absolute", left: 150, top: 68, fontWeight: 800, fontSize: 27, color: C.navy }}>BalaGo — Бишкектеги балдар үчүн такси</div>
      </div>
      {/* строка ссылки в био — крупная, отдельным слоем (точная цель стрелки) */}
      <div
        style={{
          position: "absolute",
          ...PILL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          borderRadius: 999,
          background: `rgba(255,201,14,${0.35 + 0.65 * draw})`,
          boxShadow: `0 0 0 ${3 + 5 * pulse}px rgba(255,201,14,${0.55 * draw})`,
          fontFamily,
          fontWeight: 1000,
          fontSize: 40,
          color: C.navyInk,
          opacity: Math.min(1, a * 1.6),
          transform: `translateY(${(1 - a) * -50}px) scale(${1 + 0.04 * draw})`,
        }}
      >
        <LinkIcon size={46} color={C.navyInk} />
        шилтеме
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={path} fill="none" stroke={C.navyInk} strokeOpacity={0.35} strokeWidth={17} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        <path d={path} fill="none" stroke={C.yellow} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
        {draw > 0.95 ? (
          <path d="M -28 -20 L 4 0 L -28 20" fill="none" stroke={C.yellow} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${p2.x} ${p2.y}) rotate(${ang})`} />
        ) : null}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- CTA: WhatsApp
// Под рукой, показывающей вниз; узкая карточка по центру — не закрывает
// раскрытые руки в конце. v5: карточка и номер контрастны сразу (вход 0,2 с,
// без долгого проявления цифр), один мягкий зелёный акцент, затем неподвижно.
const WhatsApp: React.FC = () => {
  const t = useT();
  const at = V4_CUE.tomonku;
  const a = ramp(t, at, 0.2, easeOut);
  if (a <= 0) return null;
  const glow = Math.max(0, 1 - (t - at - 0.2) / 0.6) * (t > at + 0.2 ? 1 : a);
  return (
    <div
      style={{
        position: "absolute",
        left: 300,
        top: 1176,
        width: 480,
        height: 170,
        borderRadius: 32,
        background: C.white,
        boxShadow: `0 22px 56px rgba(6,14,38,0.4), 0 0 0 ${10 * glow}px rgba(43,211,139,${0.45 * glow})`,
        borderLeft: `12px solid ${C.green}`,
        transform: `translateY(${(1 - a) * 24}px) scale(${0.94 + 0.06 * a})`,
        opacity: a,
        fontFamily,
      }}
    >
      <div style={{ position: "absolute", left: 20, top: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <ChatPhoneIcon size={52} />
        <span style={{ fontWeight: 900, fontSize: 36, color: "#0E7A3E" }}>WhatsApp</span>
      </div>
      <div style={{ position: "absolute", left: 22, top: 82, fontWeight: 1000, fontSize: 62, color: C.navyInk, fontVariantNumeric: "tabular-nums", letterSpacing: 0.5 }}>
        0998 08 38 28
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- звук
const Sound: React.FC = () => {
  const fps = LIVE04.fps;
  const speaking = (t: number) => LIVE04_WORDS.some((w) => t >= w.start - 0.25 && t <= w.end + 0.35);
  const music = (f: number) => {
    const t = f / fps;
    let acc = 0;
    let n = 0;
    for (let k = -0.25; k <= 0.25; k += 0.05) {
      acc += speaking(t + k) ? 0.075 : 0.16;
      n++;
    }
    return (acc / n) * interpolate(t, [0, 0.5, V4_END_SEC - 1.4, V4_END_SEC], [0.4, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  };
  return (
    <>
      <Audio src={staticFile(LIVE04.voice)} />
      <Audio src={staticFile("audio/live04/music.mp3")} volume={music} />
      {V4_SFX.map((s, i) => (
        <Sequence key={i} from={Math.round(s.at * fps)} durationInFrames={Math.round(1.2 * fps)} layout="none">
          <Audio src={staticFile(`audio/live04/sfx-${s.name}.mp3`)} volume={s.volume} />
        </Sequence>
      ))}
    </>
  );
};

export const BalaGoLive04MotionV5: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: C.navyInk }}>
      <Footage />
      <LightSweep t={t} at={V4_CUE.balago - 0.05} dur={0.8} strength={0.2} />
      <Hook />
      <StepsInsert />
      <KineticTitle
        y={870}
        size={92}
        out={V4_CUE.kayra2 - 0.35}
        lines={[[{ text: "Андан кийин", at: V4_CUE.andan }], [{ text: "кайра", at: V4_CUE.kayra1 }, { text: "жумушка", at: V4_CUE.zhumushka, accent: "yellow" }]]}
      />
      <Tempo />
      <WeekInsert />
      <Brand />
      <RouteV5 from={V4_CUE.erteng - 0.3} to={V5_ROUTE_END} />
      <InstagramHeader />
      <WhatsApp />
      <Captions phrases={LIVE04_PHRASES} mode="calm" />
      <Sound />
    </AbsoluteFill>
  );
};
