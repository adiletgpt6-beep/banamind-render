// Общее для сцен BG-046: рост персонажей, «живой» рюкзак (губы по речи,
// моргание, пружинящая ткань, маятник лямок), надписи сцен.
import { useContext } from "react";
import { fontFamily } from "../../../fonts";
import { Backpack, FACE, mixFace, type BagFace, type BagFaceId } from "../Backpack";
import { CLOSED, lipAt, SceneContext, TimelineContext, type Viseme } from "../context";
import { C } from "../palette";
import { blinkAt, clamp, easeOut, keys, pendulum } from "../rig/motion";


// Рост персонажей (px мира) и масштаб рюкзака рядом с ними.
export const H = { mom: 990, girl: 720 } as const;
export const BAG_S = 0.4;

// Смена выражений по ключам: [[кадр, выражение], …] с плавным переходом.
export const faceKeys = (f: number, pts: readonly (readonly [number, BagFaceId | BagFace])[], blend = 8): BagFace => {
  const get = (v: BagFaceId | BagFace) => (typeof v === "string" ? FACE[v] : v);
  let cur = get(pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    const [t, v] = pts[i];
    if (f < t) break;
    cur = mixFace(cur, get(v), clamp((f - t) / blend));
  }
  return cur;
};

type LiveBagProps = {
  readonly uid: string;
  readonly f: number; // кадр сцены
  readonly x: (t: number) => number; // мировые px (низ рюкзака)
  readonly y: (t: number) => number;
  readonly s: number;
  readonly face: (t: number) => BagFace;
  readonly lean?: (t: number) => number;
  readonly rot?: (t: number) => number;
  readonly squash?: (t: number) => number;
  readonly speaks?: boolean; // губы по репликам роли bag
  readonly straps?: "hang" | "none";
  readonly pocket?: number;
  readonly closed?: number;
  readonly seed?: number;
  readonly shadow?: boolean;
  readonly blinks?: readonly number[];
  readonly opacity?: number;
  // своя форма рта (зевок, «о!») поверх речи
  readonly mouthFx?: (t: number) => Viseme | null;
  // f отсчитывается не от начала сцены, а от начала плана: сдвиг (кадры)
  // для поиска губ по шкале озвучки
  readonly offset?: number;
};

// Рюкзак «живёт»: рот по речи, моргание, ткань пружинит на ударных
// слогах, лямки и брелок качаются от движения.
export const LiveBag: React.FC<LiveBagProps> = (p) => {
  const { cues } = useContext(TimelineContext);
  const { from } = useContext(SceneContext);
  const f = p.f;
  const lip = (t: number) => p.mouthFx?.(t) ?? (p.speaks === false ? CLOSED : lipAt(cues, "bag", t + from + (p.offset ?? 0)));
  const mouth = lip(f);
  const prev = lip(f - 2);
  // ударный слог: рот резко раскрылся — ткань чуть сжимается
  const punch = clamp((mouth.open - prev.open) * 1.6, -0.2, 0.35);
  const talk = mouth.open * 0.16 + punch * 0.5;
  const squash = (p.squash ? p.squash(f) : 0) + talk;
  const lean = p.lean ? p.lean(f) : 0;
  const swingPos = (t: number) => p.x(t) + (p.lean ? p.lean(t) * p.s * 0.6 : 0);
  const swing = pendulum(swingPos, f, 0.55) + Math.sin(f / 17 + (p.seed ?? 1)) * 1.5;
  const blink = blinkAt(f, p.seed ?? 3, p.blinks ?? []);
  return (
    <Backpack
      uid={p.uid}
      x={p.x(f)}
      y={p.y(f)}
      s={p.s}
      f={f}
      face={p.face(f)}
      blink={blink}
      mouth={mouth}
      squash={squash}
      lean={lean}
      rot={p.rot ? p.rot(f) : 0}
      swing={swing}
      straps={p.straps}
      pocket={p.pocket}
      closed={p.closed}
      shadow={p.shadow}
      opacity={p.opacity}
    />
  );
};

// Подпрыгивание «как живой» (0 → вверх → приземление со сжатием):
// возвращает [смещение вверх px, сжатие].
export const hop = (f: number, at: number, height = 40, dur = 14): [number, number] => {
  const u = (f - at) / dur;
  if (u < -0.35 || u > 1.5) return [0, 0];
  if (u < 0) return [0, 0.35 * Math.sin(Math.PI * clamp(-u / 0.35))]; // приседает перед прыжком
  if (u <= 1) return [height * Math.sin(Math.PI * u), -0.25 * Math.sin(Math.PI * u)];
  return [0, 0.4 * Math.sin(Math.PI * clamp((u - 1) / 0.5)) * (1 - (u - 1) * 0.8)];
};

// ---------- Надписи ----------

// Маленькая строка «Ойдон чыгарылган жомок» сверху.
export const TaleLine: React.FC<{ readonly f: number; readonly text: string; readonly at?: number; readonly top?: number }> = ({ f, text, at = 2, top = 200 }) => {
  const a = easeOut((f - at) / 10);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: a, pointerEvents: "none" }}>
      <div style={{ padding: "8px 26px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.86)", color: C.ink, fontFamily, fontSize: 32, fontWeight: 800, letterSpacing: 0.5, boxShadow: "0 6px 16px rgba(20,40,90,0.12)" }}>
        ✦ {text} ✦
      </div>
    </div>
  );
};

// Надпись сцены (левый верх): жёлтая полоска + тёмно-синий текст.
export const SceneLabel: React.FC<{ readonly f: number; readonly text: string; readonly at?: number; readonly top?: number; readonly out?: number }> = ({ f, text, at = 4, top = 210, out }) => {
  const a = easeOut((f - at) / 10) * (out === undefined ? 1 : 1 - easeOut((f - out) / 8));
  if (a <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 64, top, opacity: a, transform: `translateX(${(1 - a) * -40}px)`, pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px 14px 18px", borderRadius: 22, backgroundColor: "#FFFFFF", boxShadow: "0 10px 26px rgba(20,40,90,0.16)", fontFamily, fontSize: 40, fontWeight: 900, color: C.navy }}>
        <div style={{ width: 14, height: 46, borderRadius: 7, backgroundColor: C.yellow }} />
        {text}
      </div>
    </div>
  );
};

// «Шарттуу мисал» — видно всё время условной сцены.
export const SampleTag: React.FC<{ readonly text: string; readonly top?: number }> = ({ text, top = 200 }) => (
  <div style={{ position: "absolute", right: 150, top, pointerEvents: "none" }}>
    <div style={{ padding: "12px 26px", borderRadius: 18, backgroundColor: C.navy, color: "#FFFFFF", fontFamily, fontSize: 36, fontWeight: 900, letterSpacing: 0.5, border: `4px solid ${C.yellow}`, boxShadow: "0 10px 24px rgba(20,40,90,0.25)" }}>
      {text}
    </div>
  </div>
);

// Плавное появление/исчезание по кадрам.
export const fade = (f: number, a: number, b: number, d = 8) => clamp(Math.min((f - a) / d, (b - f) / d));

export { keys };
