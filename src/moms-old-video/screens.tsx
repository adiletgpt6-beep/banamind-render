// Экраны фильма №33: телефон (корпус с перспективой и руки для крупных
// планов), старая запись 2014 года (сцена, зерно, мягкость), галерея,
// расписание студии, пересечение вечернего времени с работой, схема
// школьного маршрута, страница и предварительная заявка BalaGo, выбор
// субботы, камера с записью, крупный план ноутбука.
// Тексты — кыргызча, крупные, короткими строками.
import { Img, interpolate, staticFile } from "remotion";
import { ASSETS, COLORS } from "../config";
import { fontFamily } from "../fonts";
import { Actor, type Place } from "./rig/Actor";
import { danceAt, hipVelocity, tuckTarget, type DanceSeg } from "./rig/dance";
import { LOOKS, type LookId } from "./rig/looks";
import { clamp, easeOut, keys } from "./rig/motion";
import { MOV_TEXT } from "./script";
import { box, type Cam } from "./shots";
import { Stage } from "./sets/Places";

export const INK = "#1E2235";
export const appear = (f: number, at: number, d = 10) => easeOut((f - at) / d);
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- телефон ----------
// Экран 9 : 19,5; содержимое рисуется в своей системе 540 × 1170 и
// масштабируется под корпус. rotY / rotX — поворот корпуса (перспектива):
// экран остаётся в рамке и поворачивается вместе с ней.
export const SCREEN_W = 540;
export const SCREEN_H = 1170;

export const Phone: React.FC<{
  readonly x: number; // центр
  readonly y: number;
  readonly w: number; // ширина корпуса
  readonly rotY?: number;
  readonly rotX?: number;
  readonly rot?: number;
  readonly children?: React.ReactNode;
  readonly shadow?: boolean;
}> = ({ x, y, w, rotY = 0, rotX = 0, rot = 0, children, shadow = true }) => {
  const h = w * (SCREEN_H / SCREEN_W) * 1.0 + w * 0.08;
  const sw = w * 0.92;
  const k = sw / SCREEN_W;
  return (
    <div
      style={box({
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        // 3D — только при повороте: плоский корпус не создаёт отдельного
        // слоя (иначе при зуме камеры экран растеризуется с потерей резкости)
        transform: rotY || rotX ? `perspective(${w * 6}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotate(${rot}deg)` : rot ? `rotate(${rot}deg)` : undefined,
        transformOrigin: "50% 50%",
      })}
    >
      <div style={box({ inset: 0, borderRadius: w * 0.12, backgroundColor: INK, boxShadow: shadow ? "0 30px 70px rgba(15,20,45,0.35)" : undefined })} />
      {/* боковая грань при повороте (толщина корпуса) */}
      {Math.abs(rotY) > 4 ? <div style={box({ top: w * 0.05, bottom: w * 0.05, width: w * 0.04, [rotY > 0 ? "left" : "right"]: -w * 0.02, borderRadius: w * 0.02, backgroundColor: "#2E3448" })} /> : null}
      <div style={box({ left: w * 0.04, top: w * 0.04, width: sw, height: h - w * 0.08, borderRadius: w * 0.09, overflow: "hidden", backgroundColor: "#000000", fontFamily })}>
        <div style={box({ left: 0, top: (h - w * 0.08 - SCREEN_H * k) / 2, width: SCREEN_W, height: SCREEN_H, transform: `scale(${k})`, transformOrigin: "0 0" })}>{children}</div>
        {/* блик стекла */}
        <div style={box({ inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.10), transparent 35%)", pointerEvents: "none" })} />
      </div>
      <div style={box({ left: w * 0.4, top: w * 0.06, width: w * 0.2, height: w * 0.045, borderRadius: w * 0.03, backgroundColor: INK })} />
    </div>
  );
};

// Две руки держат телефон за нижнюю половину (крупный план): ладони и
// предплечья — по бокам корпуса (почти не заходят на экран), большие
// пальцы лежат на рамке, кончики пальцев выглядывают из-за краёв.
export const HoldingHands: React.FC<{ readonly x: number; readonly y: number; readonly w: number; readonly skin: string; readonly shade: string; readonly sleeve: string; readonly sleeveShort?: boolean }> = ({ x, y, w, skin, shade, sleeve, sleeveShort }) => {
  const h = w * (SCREEN_H / SCREEN_W) + w * 0.08;
  const B = y + h / 2;
  return (
    <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", pointerEvents: "none" })}>
      {([-1, 1] as const).map((side) => {
        const ex = x + side * (w / 2); // край корпуса
        const palm = { x: ex + side * w * 0.035, y: B - h * 0.17 };
        const ang = -side * 24; // предплечье уходит вниз и наружу (локти шире телефона)
        return (
          <g key={side}>
            {/* предплечье и рукав */}
            <g transform={`rotate(${ang} ${palm.x} ${palm.y})`}>
              <rect x={palm.x - w * 0.15} y={palm.y} width={w * 0.3} height={h * 0.95} rx={w * 0.15} fill={skin} />
              <rect x={palm.x - w * 0.15 + (side > 0 ? w * 0.18 : 0)} y={palm.y + h * 0.05} width={w * 0.12} height={h * 0.9} rx={w * 0.06} fill="#000000" opacity={0.07} />
              {!sleeveShort ? <rect x={palm.x - w * 0.18} y={palm.y + h * 0.32} width={w * 0.36} height={h * 0.9} rx={w * 0.16} fill={sleeve} /> : null}
            </g>
            {/* ладонь у края корпуса */}
            <ellipse cx={palm.x} cy={palm.y} rx={w * 0.16} ry={h * 0.11} fill={skin} />
            <ellipse cx={palm.x + side * w * 0.05} cy={palm.y + h * 0.03} rx={w * 0.09} ry={h * 0.07} fill={shade} opacity={0.35} />
            {/* кончики пальцев из-за края корпуса (пальцы — за телефоном) */}
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={ex + side * w * 0.012} cy={B - h * (0.42 - i * 0.07)} rx={w * 0.04} ry={h * 0.026} fill={skin} stroke={shade} strokeWidth={1.5} />
            ))}
            {/* большой палец на рамке */}
            <g transform={`rotate(${-side * 32} ${ex} ${B - h * 0.2})`}>
              <rect x={ex - w * 0.04} y={B - h * 0.32} width={w * 0.08} height={h * 0.15} rx={w * 0.04} fill={skin} stroke={shade} strokeWidth={1.5} />
              <ellipse cx={ex} cy={B - h * 0.305} rx={w * 0.025} ry={h * 0.012} fill="#FFFFFF" opacity={0.35} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export const StatusBar: React.FC<{ readonly time: string; readonly dark?: boolean }> = ({ time, dark }) => (
  <div style={box({ left: 34, right: 34, top: 22, display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 800, color: dark ? "#FFFFFF" : INK, zIndex: 2 })}>
    <span>{time}</span>
    <span style={{ letterSpacing: 2 }}>▮▮▮</span>
  </div>
);

// ---------- старая запись: сцена 2014 года ----------
// Танец — та же хореография (rig/dance.ts). cam — камера внутри записи
// (мир сцены). Зерно — детерминированный шум (seed по кадру), мягкость,
// чуть выцветшие цвета, виньетка, метка года.
export const OLD_STAGE_MOM: Place = { x: 900, y: 1500, h: 900 };

export const DancerActor: React.FC<{
  readonly uid: string;
  readonly look: LookId;
  readonly f: number;
  readonly place: Place;
  readonly segs: readonly DanceSeg[];
  readonly expr?: "smile" | "softSmile" | "proud" | "laugh" | "focused" | "calm";
  readonly exprAt?: (t: number) => "smile" | "softSmile" | "proud" | "laugh" | "focused" | "calm" | "oops";
  readonly role?: "mother" | "son";
  readonly seed?: number;
  readonly mirror?: boolean;
}> = ({ uid, look, f, place, segs, expr = "smile", exprAt, role, seed = 1, mirror }) => {
  const b = LOOKS[look].build;
  const k = place.h / 1000;
  const sg = mirror ? -1 : 1;
  const el = (
    <Actor
      uid={uid}
      look={look}
      f={f}
      place={() => place}
      lead="body"
      role={role}
      seed={seed}
      face={(t) => danceAt(t, segs, b).turn}
      pose={(t) => {
        const d = danceAt(t, segs, b);
        const rest = { x: 60, y: b.shoulderY + b.upperArm + b.forearm - 30 };
        const tuck = tuckTarget(b, d.tuck, rest);
        const v = hipVelocity(t, segs, b);
        return {
          feet: d.feet,
          hipShift: d.hipShift,
          hipTilt: d.hipTilt,
          torsoTilt: d.torsoTilt,
          crouch: d.crouch,
          lean: d.lean,
          nod: d.nod,
          headTilt: d.headTilt,
          lookY: d.lookY,
          hemSway: -v * 0.35,
          hairSway: -v * 0.5,
          expr: exprAt ? exprAt(t) : expr,
          armL: { target: null, fk: d.armL, shape: "soft" },
          armR: d.tuck > 0.01 ? { target: { x: place.x + tuck.x * k, y: place.y + tuck.y * k }, shape: "soft", elbow: "down", behind: d.tuck > 0.5 } : { target: null, fk: d.armR, shape: "soft" },
        };
      }}
    />
  );
  if (!mirror) return el;
  // отражение в зеркале: зеркально по x относительно точки персонажа
  return <div style={box({ left: 0, top: 0, transform: `translateX(${2 * place.x}px) scaleX(${sg})`, transformOrigin: "0 0" })}>{el}</div>;
};

// Зерно старой записи: SVG-шум с seed по кадру (детерминированно).
export const Grain: React.FC<{ readonly f: number; readonly opacity?: number; readonly id: string }> = ({ f, opacity = 0.16, id }) => (
  <svg width="100%" height="100%" style={box({ inset: 0, opacity, mixBlendMode: "overlay", pointerEvents: "none" })}>
    <filter id={`grain-${id}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={(Math.floor(f / 2) % 7) + 1} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#grain-${id})`} />
  </svg>
);

export const OldVideo: React.FC<{
  readonly f: number; // кадр сцены (для актёра и зерна)
  readonly t: number; // время танца (кадры хореографии)
  readonly segs: readonly DanceSeg[];
  readonly cam: Cam;
  readonly w?: number;
  readonly h?: number;
  readonly year?: boolean;
  readonly id: string;
  readonly exprAt?: (t: number) => "smile" | "softSmile" | "proud" | "laugh" | "focused" | "calm" | "oops";
  // soft — мягкость CSS-фильтром (только в полноэкранном кадре; внутри
  // масштабируемого мира фильтр растеризуется грубо — там только слои цвета)
  readonly soft?: boolean;
}> = ({ f, t, segs, cam, w = 1080, h = 1920, year = true, id, exprAt, soft = true }) => {
  const P = OLD_STAGE_MOM;
  return (
    <div style={box({ left: 0, top: 0, width: w, height: h, overflow: "hidden", backgroundColor: "#141B3C" })}>
      <div style={box({ left: 0, top: 0, width: w, height: h, filter: soft ? "blur(0.7px)" : undefined })}>
        <div style={box({ left: 0, top: 0, width: 1, height: 1, transformOrigin: "0 0", transform: `translate(${w / 2 - cam.x * cam.zoom}px, ${h / 2 - cam.y * cam.zoom}px) scale(${cam.zoom})` })}>
          <Stage f={f} spotX={P.x + danceAt(t, segs, LOOKS.youngMom.build).hipShift * (P.h / 1000)} />
          <DancerActor uid={`old-${id}`} look="youngMom" f={t} place={P} segs={segs} exprAt={exprAt} seed={7} />
        </div>
      </div>
      {/* выцветшие тёплые цвета старой записи — слоями, без фильтра */}
      <div style={box({ inset: 0, backgroundColor: "rgba(255,226,180,0.12)", mixBlendMode: "multiply", pointerEvents: "none" })} />
      <div style={box({ inset: 0, backgroundColor: "rgba(150,150,160,0.10)", mixBlendMode: "saturation", pointerEvents: "none" })} />
      <div style={box({ inset: 0, backgroundColor: "rgba(255,245,230,0.06)", pointerEvents: "none" })} />
      <Grain f={f} id={id} opacity={soft ? 0.18 : 0.12} />
      <div style={box({ inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(10,10,30,0.45))", pointerEvents: "none" })} />
      {year ? (
        <div style={box({ right: w * 0.06, bottom: h * 0.04, fontFamily, fontSize: w * 0.045, fontWeight: 800, color: "rgba(255,240,200,0.75)", letterSpacing: 2 })}>{MOV_TEXT.oldVideoYear}</div>
      ) : null}
    </div>
  );
};

// ---------- галерея старого телефона ----------
export const Gallery: React.FC<{ readonly f: number; readonly tapAt: number }> = ({ f, tapAt }) => {
  const g = MOV_TEXT.gallery;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 5], [1, 0.94, 1], CL);
  const thumbs = ["#B8C9D9", "#E3C9A8", "#9FC2A4", "#C8B5D9", "#E7B7A8", "#A9BCD6", "#D9C79F", "#BFD3C4"];
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", color: INK })}>
      <StatusBar time="20:12" />
      <div style={box({ left: 30, top: 80, fontSize: 46, fontWeight: 900 })}>{g.title}</div>
      <div style={box({ left: 30, top: 146, fontSize: 28, fontWeight: 800, color: "#5A6B8C" })}>{g.album}</div>
      {thumbs.map((c, i) => {
        const big = i === 4;
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <div key={i} style={box({ left: 24 + col * 168, top: 200 + row * 168, width: 160, height: 160, borderRadius: 10, backgroundColor: c, overflow: "hidden", scale: big ? `${press}` : undefined, boxShadow: big && f >= tapAt - 6 ? "0 0 0 6px #FFC90E" : undefined })}>
            {big ? (
              <>
                <div style={box({ inset: 0, background: "radial-gradient(circle at 80px 50px, #F6D58E, #22306A 75%)" })} />
                <div style={box({ left: 68, top: 40, width: 24, height: 24, borderRadius: 12, backgroundColor: "#E6B590" })} />
                <div style={box({ left: 62, top: 62, width: 36, height: 56, borderRadius: "12px 12px 6px 6px", backgroundColor: "#3E6FB8" })} />
                <div style={box({ right: 8, bottom: 6, fontSize: 22, fontWeight: 800, color: "#FFFFFF" })}>{g.duration}</div>
                <div style={box({ left: 8, bottom: 8, width: 0, height: 0, borderLeft: "16px solid #FFFFFF", borderTop: "10px solid transparent", borderBottom: "10px solid transparent" })} />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// Видео на экране телефона (открытое из галереи): чёрные поля, ползунок.
export const VideoPlayer: React.FC<{ readonly progress: number; readonly children: React.ReactNode }> = ({ progress, children }) => (
  <div style={box({ inset: 0, backgroundColor: "#000000" })}>
    <div style={box({ left: 0, top: (SCREEN_H - SCREEN_W * (16 / 9)) / 2, width: SCREEN_W, height: SCREEN_W * (16 / 9), overflow: "hidden" })}>{children}</div>
    <div style={box({ left: 30, right: 30, bottom: 60, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" })}>
      <div style={box({ left: 0, top: 0, bottom: 0, width: `${clamp(progress) * 100}%`, borderRadius: 3, backgroundColor: "#FFFFFF" })} />
      <div style={box({ left: `calc(${clamp(progress) * 100}% - 9px)`, top: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: "#FFFFFF" })} />
    </div>
  </div>
);

// ---------- расписание студии ----------
// highlight: 0 — нет, 1 — вечерняя группа, 2 — пробное занятие.
// noTime — без часа на экране (сцена 10: акцент только на дне).
export const ScheduleScreen: React.FC<{ readonly f: number; readonly at: number; readonly pick?: number; readonly pickAt?: number; readonly glowTime?: number; readonly noTime?: boolean }> = ({ f, at, pick = 0, pickAt = 0, glowTime = 0, noTime = false }) => {
  const s = MOV_TEXT.schedule;
  return (
    <div style={box({ inset: 0, backgroundColor: "#F5F7FB", color: INK })}>
      <StatusBar time="21:05" />
      <div style={box({ left: 0, right: 0, top: 70, height: 230, background: "linear-gradient(135deg, #2E4A86, #4B6BB0)" })}>
        <svg width={540} height={230} viewBox="0 0 540 230" style={box({ left: 0, top: 0 })}>
          <circle cx={430} cy={60} r={90} fill="rgba(255,255,255,0.08)" />
          <circle cx={480} cy={180} r={60} fill="rgba(255,255,255,0.08)" />
        </svg>
        <div style={box({ left: 34, top: 110, fontSize: 52, fontWeight: 900, color: "#FFFFFF" })}>{s.title}</div>
      </div>
      {s.rows.map((r, i) => {
        const a = appear(f, at + 8 + i * 8, 12);
        const picked = pick === i + 1 && f >= pickAt;
        return (
          <div
            key={r.name}
            style={box({
              left: 26,
              right: 26,
              top: 340 + i * 220,
              height: 190,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              border: `5px solid ${picked ? COLORS.yellow : "#E1E7F0"}`,
              boxShadow: "0 8px 20px rgba(20,40,90,0.08)",
              opacity: a,
              translate: `0 ${(1 - a) * 30}px`,
              scale: picked ? `${interpolate(f, [pickAt - 3, pickAt, pickAt + 6], [1, 0.96, 1], CL)}` : undefined,
            })}
          >
            <div style={box({ left: 30, top: 26, fontSize: 46, fontWeight: 900 })}>{r.name}</div>
            <div style={box({ left: 30, top: 96, fontSize: 34, fontWeight: 800, color: "#5A6B8C" })}>{r.when}</div>
            {r.time && !noTime ? (
              <div style={box({ right: 26, top: 44, padding: "10px 22px", borderRadius: 20, backgroundColor: glowTime > 0 && i === 0 ? COLORS.yellow : "#EAF0FA", fontSize: 44, fontWeight: 900, boxShadow: glowTime > 0 && i === 0 ? `0 0 0 ${8 * glowTime}px rgba(255,201,14,0.35)` : undefined })}>{r.time}</div>
            ) : null}
            {picked ? <div style={box({ right: 30, top: 50, width: 80, height: 80, borderRadius: 40, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 48, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" })}>✓</div> : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------- пересечение вечернего времени (графика поверх кадра) ----------
// Шкала 18:00–21:00: полоса «Кечки топ» (с телефона) и полоса «Бүтпөгөн иш»
// (с ноутбука) сходятся на одном отрезке 19:00–20:30.
// Шкала: 18:00 в x0, 21:00 в x0 + w (кадр).
export const TC = { x0: 150, w: 780 } as const;
// bar1At / bar2At / clashAt — по словам диктора; morph 0…1 — полосы
// становятся тонкими линиями, подписи гаснут (переход к схеме маршрута).
export const TimeConflict: React.FC<{ readonly f: number; readonly at: number; readonly bar1At?: number; readonly bar2At?: number; readonly clashAt?: number; readonly morph?: number }> = ({ f, at, bar1At = at + 12, bar2At = at + 30, clashAt = at + 52, morph = 0 }) => {
  const s = MOV_TEXT.schedule;
  const a = appear(f, at, 14);
  const bar1 = appear(f, bar1At, 18);
  const bar2 = appear(f, bar2At, 18);
  const clash = appear(f, clashAt, 12) * (1 - morph);
  const txt = 1 - morph;
  const barH = lerpN(150, 16, morph);
  const X0 = TC.x0;
  const W = TC.w;
  const xAt = (h: number) => X0 + ((h - 18) / 3) * W;
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: INK, opacity: a })}>
      <div style={box({ left: 60, right: 60, top: 300, height: 760, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.96)", boxShadow: "0 30px 80px rgba(20,30,60,0.25)" })} />
      {s.hours.map((hh, i) => (
        <div key={hh} style={box({ left: xAt(18 + i) - 60, top: 360, width: 120, textAlign: "center", fontSize: 34, fontWeight: 800, color: "#5A6B8C", opacity: txt })}>{hh}</div>
      ))}
      {s.hours.map((hh, i) => (
        <div key={`l${hh}`} style={box({ left: xAt(18 + i) - 2, top: 420, width: 4, height: 560, backgroundColor: "#E1E7F0", opacity: txt })} />
      ))}
      {/* вечерняя группа — с телефона (навигационный синий) */}
      <div style={box({ left: xAt(19), top: 470 + (150 - barH) / 2, width: (xAt(20.5) - xAt(19)) * bar1, height: barH, borderRadius: Math.min(30, barH / 2), backgroundColor: COLORS.navy, overflow: "hidden" })}>
        <div style={box({ left: 26, top: 46, fontSize: 44, fontWeight: 900, color: "#FFFFFF", whiteSpace: "nowrap", display: "flex", gap: 16, alignItems: "center", opacity: txt })}>
          <svg width={26} height={44} viewBox="0 0 26 44">
            <rect x={1} y={1} width={24} height={42} rx={5} fill="#FFFFFF" />
            <rect x={4} y={6} width={18} height={30} rx={2} fill="#6F8BC4" />
          </svg>
          {s.rows[0].name}
        </div>
      </div>
      {/* работа — с ноутбука */}
      <div style={box({ left: xAt(19), top: 680 + (150 - barH) / 2, width: (xAt(20.5) - xAt(19)) * bar2, height: barH, borderRadius: Math.min(30, barH / 2), backgroundColor: "#C9D2E0", overflow: "hidden" })}>
        <div style={box({ left: 26, top: 46, fontSize: 44, fontWeight: 900, color: INK, whiteSpace: "nowrap", display: "flex", gap: 16, alignItems: "center", opacity: txt })}>
          <svg width={52} height={40} viewBox="0 0 52 40">
            <rect x={6} y={2} width={40} height={28} rx={4} fill={INK} />
            <rect x={10} y={6} width={32} height={20} rx={2} fill="#9FC0E8" />
            <rect x={0} y={32} width={52} height={6} rx={3} fill={INK} />
          </svg>
          {s.conflictWork}
        </div>
      </div>
      {/* общий отрезок: одно и то же время */}
      <div style={box({ left: xAt(19) - 14, top: 450, width: xAt(20.5) - xAt(19) + 28, height: 400, borderRadius: 40, border: `8px solid ${COLORS.yellow}`, opacity: clash, boxSizing: "border-box", scale: `${0.96 + 0.04 * clash}` })} />
      <div style={box({ left: xAt(19), top: 880, padding: "12px 26px", borderRadius: 24, backgroundColor: COLORS.yellow, fontSize: 40, fontWeight: 900, opacity: clash })}>{s.rows[0].time}</div>
    </div>
  );
};

// ---------- схема школьного маршрута ----------
// Линии расписания превращаются в путь: МЕКТЕП → (путь) → ҮЙ, где ждёт
// няня. Путь рисуется постепенно; на участке пути — знак вопроса.
export const RouteScheme: React.FC<{ readonly f: number; readonly at: number; readonly nannyAt: number; readonly pathAt: number; readonly questionAt: number }> = ({ f, at, nannyAt, pathAt, questionAt }) => {
  const r = MOV_TEXT.route;
  const a = appear(f, at, 14);
  const path = clamp((f - pathAt) / 50);
  const q = appear(f, questionAt, 12);
  const nanny = appear(f, nannyAt, 12);
  const P = "M 230 1240 C 300 1000 520 1080 560 860 C 600 640 820 700 850 540";
  return (
    <div style={box({ left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: INK, opacity: a })}>
      <div style={box({ left: 60, right: 60, top: 260, height: 1230, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.97)", boxShadow: "0 30px 80px rgba(20,30,60,0.22)" })} />
      <svg width={1080} height={1920} style={box({ left: 0, top: 0 })}>
        <path d={P} stroke="#E1E7F0" strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d={P} stroke={COLORS.navy} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray="10 26" pathLength={1000} style={{ strokeDashoffset: 0 }} opacity={0.25} />
        <path d={P} stroke={COLORS.navy} strokeWidth={14} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${path} 1`} />
      </svg>
      {/* школа */}
      <div style={box({ left: 110, top: 1220, width: 240, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 })}>
        <RouteIcon kind="school" size={150} />
        <div style={{ fontSize: 46, fontWeight: 900 }}>{r.school}</div>
      </div>
      {/* дом и няня */}
      <div style={box({ left: 730, top: 380, width: 240, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 })}>
        <RouteIcon kind="home" size={150} />
        <div style={{ fontSize: 46, fontWeight: 900 }}>{r.home}</div>
      </div>
      <div style={box({ left: 620, top: 610, display: "flex", alignItems: "center", gap: 14, padding: "12px 24px 12px 14px", borderRadius: 40, backgroundColor: "#EAF3FC", opacity: nanny, scale: `${0.9 + 0.1 * nanny}` })}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          <circle cx={32} cy={32} r={32} fill="#F2C14E" />
          <circle cx={32} cy={24} r={11} fill="#14285A" />
          <path d="M 12 54 Q 32 30 52 54 Z" fill="#14285A" />
        </svg>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{r.nanny}</div>
      </div>
      {/* вопрос на пути */}
      <div style={box({ left: 470, top: 900, width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.yellow, fontSize: 96, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", opacity: q, scale: `${0.7 + 0.3 * q}`, boxShadow: "0 12px 30px rgba(255,201,14,0.45)" })}>{r.question}</div>
    </div>
  );
};

export const RouteIcon: React.FC<{ readonly kind: "home" | "school"; readonly size: number }> = ({ kind, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={48} fill={kind === "home" ? COLORS.yellow : COLORS.navy} />
    {kind === "home" ? (
      <path d="M 26 52 L 50 30 L 74 52 L 68 52 L 68 74 L 32 74 L 32 52 Z" fill={COLORS.navy} />
    ) : (
      <g fill="#FFFFFF">
        <path d="M 24 46 L 50 28 L 76 46 Z" />
        <rect x={30} y={46} width={40} height={28} />
        <rect x={45} y={58} width={10} height={16} fill={COLORS.navy} />
      </g>
    )}
  </svg>
);

// Маршрут ҮЙ → МЕКТЕП → ҮЙ крупными значками (страница, финал).
export const RouteRow: React.FC<{ readonly f: number; readonly at: number; readonly size?: number; readonly labels?: boolean }> = ({ f, at, size = 96, labels = true }) => {
  const route = clamp((f - at) / 36);
  const names = ["ҮЙ", "МЕКТЕП", "ҮЙ"];
  return (
    <div style={{ position: "relative", width: size * 4.6, height: size * (labels ? 1.6 : 1.05) }}>
      <svg width={size * 4.6} height={size} viewBox={`0 0 ${size * 4.6} ${size}`} style={box({ left: 0, top: 0 })}>
        <path d={`M ${size * 0.6} ${size / 2} L ${size * 4} ${size / 2}`} stroke={COLORS.navy} strokeWidth={size * 0.06} strokeDasharray={`${size * 0.14} ${size * 0.12}`} opacity={0.25} />
        <path d={`M ${size * 0.6} ${size / 2} L ${size * 0.6 + size * 3.4 * route} ${size / 2}`} stroke={COLORS.navy} strokeWidth={size * 0.06} />
      </svg>
      {(["home", "school", "home"] as const).map((k, i) => (
        <div key={i} style={box({ left: size * 0.1 + i * size * 1.7, top: 0, width: size, display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.06, opacity: 0.35 + 0.65 * clamp(route * 2.2 - i * 0.6 + 0.2) })}>
          <RouteIcon kind={k} size={size} />
          {labels ? <div style={{ fontSize: size * 0.3, fontWeight: 900, color: COLORS.navy, whiteSpace: "nowrap" }}>{names[i]}</div> : null}
        </div>
      ))}
    </div>
  );
};

// ---------- BalaGo: карточка сервиса и предварительная заявка ----------
export const BalaGoPage: React.FC<{ readonly f: number; readonly at: number; readonly tapAt?: number }> = ({ f, at, tapAt }) => {
  const p = MOV_TEXT.page;
  const press = tapAt !== undefined ? interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL) : 1;
  const a = (k: number) => appear(f, at + k * 5, 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#FFFFFF", color: COLORS.navy })}>
      <StatusBar time="21:20" />
      <div style={box({ left: 0, right: 0, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 })}>
        <div style={{ opacity: a(0), scale: `${0.9 + 0.1 * a(0)}` }}>
          <Img src={staticFile(ASSETS.logo)} style={{ width: 200, height: 200, borderRadius: 100, objectFit: "cover" }} />
        </div>
        <div style={{ fontSize: 72, fontWeight: 900, opacity: a(1) }}>{p.brand}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#3A4F80", opacity: a(2) }}>{p.tagline}</div>
        <div style={{ marginTop: 6, padding: "6px 24px", borderRadius: 999, backgroundColor: "#EAF3FC", fontSize: 34, fontWeight: 900, opacity: a(3) }}>{p.city}</div>
      </div>
      <div style={box({ left: 40, right: 40, top: 560, height: 200, borderRadius: 30, backgroundColor: COLORS.yellowSoft, display: "flex", alignItems: "center", justifyContent: "center", opacity: a(4) })}>
        <RouteRow f={f} at={at + 26} size={92} />
      </div>
      <div style={box({ left: 40, right: 40, top: 820, padding: "30px 0", borderRadius: 999, backgroundColor: COLORS.yellow, fontSize: 44, fontWeight: 900, textAlign: "center", scale: `${press}`, boxShadow: "0 10px 24px rgba(255,201,14,0.4)", opacity: a(6) })}>{MOV_TEXT.form.title}</div>
    </div>
  );
};

// Предварительная заявка: поля (вымышленные данные) заполняются, кнопка →
// «Алдын ала өтүнмө калтырылды / Каттамды сүйлөшүү үчүн». Без цены,
// телефона, адреса и подтверждения поездки.
export const PreRequestForm: React.FC<{ readonly f: number; readonly fills: readonly number[]; readonly tapAt: number; readonly sentAt: number }> = ({ f, fills, tapAt, sentAt }) => {
  const t = MOV_TEXT.form;
  const press = interpolate(f, [tapAt - 3, tapAt, tapAt + 6], [1, 0.95, 1], CL);
  const sent = appear(f, sentAt, 12);
  return (
    <div style={box({ inset: 0, backgroundColor: "#F4F6FA", color: INK })}>
      <StatusBar time="21:22" />
      <div style={box({ left: 34, right: 34, top: 80, display: "flex", alignItems: "center", gap: 16 })}>
        <Img src={staticFile(ASSETS.logo)} style={{ width: 84, height: 84, borderRadius: 42, objectFit: "cover" }} />
        <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.navy }}>{t.title}</div>
      </div>
      {t.fields.map(([label, value], i) => {
        const typed = clamp((f - fills[i]) / 12);
        const shown = value.slice(0, Math.round(value.length * typed));
        return (
          <div key={label} style={box({ left: 34, right: 34, top: 210 + i * 150, display: "flex", flexDirection: "column", gap: 8, opacity: 1 - sent * 0.5 })}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#5A6B8C" }}>{label}</div>
            <div style={{ height: 84, borderRadius: 20, backgroundColor: "#FFFFFF", border: `3px solid ${f >= fills[i] && typed < 1 ? COLORS.yellow : "#DCE3EE"}`, display: "flex", alignItems: "center", padding: "0 22px", fontSize: 38, fontWeight: 800 }}>{shown}</div>
          </div>
        );
      })}
      <div style={box({ left: 34, right: 34, top: 830, padding: "28px 0", borderRadius: 999, backgroundColor: COLORS.yellow, color: COLORS.navy, fontSize: 42, fontWeight: 900, textAlign: "center", scale: `${press}`, opacity: 1 - sent })}>{t.send}</div>
      <div style={box({ left: 34, right: 34, top: 780, padding: "30px 24px", borderRadius: 30, backgroundColor: "#FFFFFF", border: "5px solid #3E8E5E", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: sent, scale: `${0.94 + 0.06 * sent}`, textAlign: "center" })}>
        <div style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: "#3E8E5E", color: "#FFFFFF", fontSize: 54, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
        <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.15 }}>{t.sent}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#3A4F80" }}>{t.note}</div>
      </div>
    </div>
  );
};

// ---------- камера телефона: идёт запись ----------
export const CameraUI: React.FC<{ readonly f: number; readonly recFrom: number; readonly children: React.ReactNode }> = ({ f, recFrom, children }) => {
  const sec = Math.max(0, Math.floor((f - recFrom) / 30));
  const time = `00:${String(sec).padStart(2, "0")}`;
  const blink = Math.floor(f / 15) % 2 === 0;
  return (
    <div style={box({ inset: 0, backgroundColor: "#000000" })}>
      <div style={box({ left: 0, top: (SCREEN_H - SCREEN_W * (16 / 9)) / 2, width: SCREEN_W, height: SCREEN_W * (16 / 9), overflow: "hidden" })}>{children}</div>
      <div style={box({ left: 0, right: 0, top: 40, display: "flex", justifyContent: "center" })}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 18px", borderRadius: 20, backgroundColor: "rgba(0,0,0,0.45)", color: "#FFFFFF", fontSize: 30, fontWeight: 800 }}>
          <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#E5483E", opacity: f >= recFrom && blink ? 1 : 0.35 }} />
          {time}
        </div>
      </div>
      <div style={box({ left: SCREEN_W / 2 - 46, bottom: 70, width: 92, height: 92, borderRadius: 46, border: "6px solid #FFFFFF", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" })}>
        <div style={{ width: f >= recFrom ? 34 : 70, height: f >= recFrom ? 34 : 70, borderRadius: f >= recFrom ? 8 : 35, backgroundColor: "#E5483E" }} />
      </div>
    </div>
  );
};

// ---------- ноутбук крупно сверху: экран и клавиатура, руки печатают ----------
// Вид со стороны мамы (над её плечами): экран виден, потому что смотрим
// с её стороны. warm — домашний вечерний свет.
export const KeyboardCloseup: React.FC<{ readonly f: number; readonly typing: boolean; readonly warm?: number; readonly progress?: string; readonly sleeve: string; readonly skin: string }> = ({ f, typing, warm = 0, progress, sleeve, skin }) => {
  const t = MOV_TEXT.laptop;
  const tap = (i: number) => (typing ? Math.max(0, Math.sin(f * 0.9 + i * 2.1)) * 10 : 0);
  return (
    <div style={box({ inset: 0, background: warm > 0.5 ? "linear-gradient(180deg, #6B4E3B, #8A6648)" : "linear-gradient(180deg, #C8CED8, #E4E7EC)", fontFamily })}>
      {/* экран */}
      <div style={box({ left: 90, top: 150, width: 900, height: 620, borderRadius: 26, backgroundColor: "#2B2F38" })} />
      <div style={box({ left: 112, top: 172, width: 856, height: 576, borderRadius: 12, backgroundColor: "#FFFFFF", overflow: "hidden", color: INK })}>
        <div style={box({ left: 0, right: 0, top: 0, height: 70, backgroundColor: "#2F5D9E", display: "flex", alignItems: "center", padding: "0 30px", color: "#FFFFFF", fontSize: 30, fontWeight: 800 })}>
          {t.title}
          <div style={{ marginLeft: "auto", padding: "4px 16px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.22)", fontSize: 26 }}>{progress ?? t.progress}</div>
        </div>
        {[0.92, 0.8, 0.86, 0.5].map((w, i) => (
          <div key={i} style={box({ left: 40, top: 110 + i * 52, width: 780 * w, height: 22, borderRadius: 11, backgroundColor: "#D9DFE9" })} />
        ))}
        <div style={box({ left: 40, top: 340, fontSize: 40, fontWeight: 900, color: "#2F5D9E" })}>{t.task}</div>
        <div style={box({ left: 40, top: 410, width: 520, height: 28, borderRadius: 14, backgroundColor: "#E9EEF6" })}>
          <div style={box({ left: 0, top: 0, bottom: 0, width: "60%", borderRadius: 14, backgroundColor: COLORS.yellow })} />
        </div>
        {warm > 0.5 ? <div style={box({ inset: 0, backgroundColor: "rgba(255,190,120,0.08)" })} /> : null}
      </div>
      {/* основание и клавиатура */}
      <div style={box({ left: 40, top: 790, width: 1000, height: 560, borderRadius: 30, backgroundColor: "#B9C0CC" })} />
      <div style={box({ left: 90, top: 830, width: 900, height: 330, borderRadius: 16, backgroundColor: "#2E333D" })}>
        {Array.from({ length: 4 }).map((_, r) =>
          Array.from({ length: 12 }).map((__, c) => <div key={`${r}-${c}`} style={box({ left: 14 + c * 73, top: 14 + r * 78, width: 64, height: 66, borderRadius: 10, backgroundColor: "#3B414D" })} />),
        )}
      </div>
      <div style={box({ left: 400, top: 1190, width: 280, height: 140, borderRadius: 18, backgroundColor: "#AEB6C3" })} />
      {/* руки: предплечья снизу, пальцы на клавишах */}
      {([-1, 1] as const).map((side) => (
        <div key={side}>
          <div style={box({ left: 540 + side * 250 - 110, top: 1060, width: 220, height: 900, borderRadius: 110, backgroundColor: sleeve, rotate: `${side * -14}deg`, transformOrigin: "50% 0%" })} />
          <div style={box({ left: 540 + side * 230 - 95, top: 930, width: 190, height: 200, borderRadius: 90, backgroundColor: skin })} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={box({ left: 540 + side * 230 - 88 + i * 46, top: 880 - tap(i + (side > 0 ? 4 : 0)) + Math.abs(i - 1.5) * 10, width: 40, height: 90, borderRadius: 20, backgroundColor: skin })} />
          ))}
        </div>
      ))}
    </div>
  );
};

// Метка выбранного дня на экране (кинетический акцент «Ишемби»).
export const DayAccent: React.FC<{ readonly f: number; readonly at: number }> = ({ f, at }) => {
  const a = appear(f, at, 12);
  const letters = [...MOV_TEXT.saturday];
  return (
    <div style={box({ left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", fontFamily })}>
      <div style={{ padding: "26px 60px", borderRadius: 999, backgroundColor: COLORS.yellow, boxShadow: "0 16px 40px rgba(255,201,14,0.45)", opacity: a, scale: `${0.85 + 0.15 * a}`, display: "flex" }}>
        {letters.map((c, i) => (
          <span key={i} style={{ fontSize: 110, fontWeight: 900, color: COLORS.navy, display: "inline-block", opacity: appear(f, at + 2 + i * 2, 8), translate: `0 ${(1 - appear(f, at + 2 + i * 2, 8)) * 24}px` }}>
            {c}
          </span>
        ))}
      </div>
    </div>
  );
};

// Кинетическая надпись по словам (короткие смысловые фразы).
export const KineticWords: React.FC<{ readonly f: number; readonly at: number; readonly text: string; readonly size?: number; readonly color?: string; readonly top: number; readonly bg?: string; readonly out?: number }> = ({ f, at, text, size = 96, color = COLORS.navy, top, bg, out }) => {
  const words = text.split(" ");
  const fade = out !== undefined ? 1 - easeOut((f - out) / 10) : 1;
  return (
    <div style={box({ left: 90, right: 90, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${size * 0.1}px ${size * 0.28}px`, fontFamily, opacity: fade })}>
      {words.map((w, i) => {
        const a = appear(f, at + i * 5, 10);
        return (
          <span key={i} style={{ display: "inline-block", fontSize: size, fontWeight: 900, lineHeight: 1.1, color, opacity: a, translate: `0 ${(1 - a) * size * 0.35}px`, scale: `${0.9 + 0.1 * a}`, padding: bg ? `${size * 0.06}px ${size * 0.2}px` : undefined, borderRadius: bg ? size * 0.3 : undefined, backgroundColor: bg }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (f: number, pts: readonly (readonly [number, number])[]) => keys(f, pts);
