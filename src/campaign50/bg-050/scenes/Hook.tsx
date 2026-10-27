// Сцена 1 (0 – ≈ 6 с): хук. Белый фон, один большой вопрос — буквы
// появляются по слогам ровно тогда, когда диктор их произносит. Справа —
// три живых портрета (мама с чертежами, папа с поделкой, предпринимательница
// с образцами войлока); за окнами угадывается Бишкек (Ала-Тоо, панельные
// дома, тополя). В конце хука портрет 1 раскрывается в сцену ответа 1
// (HookExpand — используется в начале сцены work).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { InScene, sceneOf, useTimeline } from "../context";
import { C } from "../palette";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { BG50_TEXT, BG50_VIDEO, type Bg50SceneId } from "../script";
import { fitCam, FULL, lerpRect, View, type Cam, type Rect } from "../shots";
import { ExampleChip } from "../ui";
import { EveningWorld, EVENING_PORTRAIT } from "../worlds/Evening";
import { StudioWorld, STUDIO_PORTRAIT } from "../worlds/Studio";
import { WorkWorld, WORK_PORTRAIT } from "../worlds/Work";

const FPS = BG50_VIDEO.fps;

// Портреты справа (экран): x 712…1012 — изображение, текста под
// кнопками Reels нет.
export const HOOK_TILES: readonly Rect[] = [
  { x: 712, y: 372, w: 300, h: 352, r: 34 },
  { x: 712, y: 758, w: 300, h: 352, r: 34 },
  { x: 712, y: 1144, w: 300, h: 352, r: 34 },
];

type TileDef = { readonly scene: Bg50SceneId; readonly World: React.FC<{ readonly f: number }>; readonly portrait: Cam; readonly bg: string; readonly pre: number };
// pre — кадр мира, который виден в конце хука (до начала своей сцены).
export const TILE_DEFS: readonly TileDef[] = [
  { scene: "work", World: WorkWorld, portrait: WORK_PORTRAIT, bg: "#F6F8FC", pre: 0 },
  { scene: "evening", World: EveningWorld, portrait: EVENING_PORTRAIT, bg: "#F3E7D6", pre: -40 },
  { scene: "studio", World: StudioWorld, portrait: STUDIO_PORTRAIT, bg: "#FBF4EA", pre: -40 },
];

// Живой мир плитки i в кадре мира wf.
export const TileWorld: React.FC<{ readonly i: number; readonly wf: number }> = ({ i, wf }) => {
  const d = TILE_DEFS[i];
  return (
    <InScene id={d.scene}>
      <d.World f={wf} />
    </InScene>
  );
};

// Текст вопроса: каждая буква появляется в момент, когда диктор её
// произносит (тайминги букв озвучки), слегка поднимаясь.
const Question: React.FC<{ readonly t: number; readonly fade?: number }> = ({ t, fade = 1 }) => {
  const tl = useTimeline();
  const cue = tl.cues.find((c) => c.id === "n01")!;
  const words = [...BG50_TEXT.hook.lead.split(" "), ...BG50_TEXT.hook.big];
  // время появления каждой буквы — по порядку букв реплики
  let li = 0;
  let lastAt = cue.from;
  const letterTime = () => {
    const c = cue.chars[li];
    li++;
    return c ? c.start - 0.04 : cue.to;
  };
  const leadN = BG50_TEXT.hook.lead.split(" ").length;
  const render = (w: string, big: boolean, key: number) => (
    <span key={key} style={{ display: "inline-block", whiteSpace: "nowrap", marginRight: big ? 0 : 12 }}>
      {[...w].map((ch, j) => {
        const isL = /\p{L}/u.test(ch);
        const at = isL ? letterTime() : lastAt + 0.06;
        if (isL) lastAt = at;
        const a = easeOut((t - at) / 0.14);
        return (
          <span key={j} style={{ display: "inline-block", opacity: a, translate: `0 ${(1 - a) * 18}px` }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
  // подчёркивание под «ЭМНЕГЕ» после того, как его произнесли
  const emWord = cue.words.find((w) => w.text.toLowerCase().startsWith("эмнеге"));
  const under = easeOut((t - (emWord ? emWord.end : cue.from + 2.5)) / 0.35);
  return (
    <div style={{ position: "absolute", left: 60, top: 540, width: 620, fontFamily, color: C.navy, opacity: fade }}>
      <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.2, color: C.ink }}>{words.slice(0, leadN).map((w, i) => render(w, false, i))}</div>
      <div style={{ marginTop: 34, fontSize: 70, fontWeight: 900, lineHeight: 1.16, letterSpacing: 0 }}>
        {words.slice(leadN).map((w, i) => (
          <div key={i} style={{ position: "relative" }}>
            {i === 1 ? (
              <div style={{ position: "absolute", left: -6, top: 48, width: 300 * under, height: 26, borderRadius: 13, backgroundColor: C.yellow, opacity: 0.9 }} />
            ) : null}
            <div style={{ position: "relative" }}>{render(w, true, i + leadN)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Title: React.FC<{ readonly a: number }> = ({ a }) => (
  <div style={{ position: "absolute", left: 60, top: 392, opacity: a, translate: `0 ${(1 - a) * 16}px` }}>
    <div style={{ display: "inline-block", padding: "10px 26px 12px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontFamily, fontSize: 38, fontWeight: 900, boxShadow: `0 6px 0 ${C.yellowDeep}` }}>
      {BG50_TEXT.title}
    </div>
  </div>
);

const Backdrop: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }} />
    <div style={{ position: "absolute", left: -260, top: -220, width: 820, height: 820, borderRadius: 410, backgroundColor: C.yellowSoft }} />
    <div style={{ position: "absolute", right: -240, bottom: -260, width: 760, height: 760, borderRadius: 380, backgroundColor: C.sky }} />
  </>
);

// Портрет: живой мир в рамке с белой каймой.
const Portrait: React.FC<{ readonly i: number; readonly wf: number; readonly a: number; readonly rect?: Rect }> = ({ i, wf, a, rect = HOOK_TILES[i] }) => {
  if (a <= 0.01) return null;
  const s = 0.82 + 0.18 * a;
  const r: Rect = { x: rect.x + (rect.w * (1 - s)) / 2, y: rect.y + (rect.h * (1 - s)) / 2 + (1 - a) * 30, w: rect.w * s, h: rect.h * s, r: rect.r };
  return (
    <>
      <div style={{ position: "absolute", left: r.x - 8, top: r.y - 8, width: r.w + 16, height: r.h + 16, borderRadius: (r.r ?? 0) + 8, backgroundColor: "#FFFFFF", opacity: a, boxShadow: "0 22px 50px rgba(20,40,90,0.2)" }} />
      <View rect={r} cam={fitCam(TILE_DEFS[i].portrait, r)} bg={TILE_DEFS[i].bg} opacity={a}>
        <TileWorld i={i} wf={wf} />
      </View>
    </>
  );
};

// Кадр мира плитки i в кадре хука f.
const hookWf = (i: number, f: number, hookFrames: number) => f - hookFrames + TILE_DEFS[i].pre;

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const hook = sceneOf(tl, "hook");
  const t = (f + hook.from) / FPS;
  const pop = (i: number) => easeOut((f - (8 + i * 9)) / 12);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Backdrop />
      <ExampleChip a={pop(0)} />
      <Title a={easeOut((f - 2) / 10)} />
      <Question t={t} />
      {[0, 1, 2].map((i) => (
        <Portrait key={i} i={i} wf={hookWf(i, f, hook.frames)} a={pop(i)} />
      ))}
    </div>
  );
};

// Начало сцены ответа: хук (вопрос и остальные портреты) гаснет, портрет
// index раскрывается на весь кадр, камера плавно переходит от портрета
// к плану сцены. children — мир сцены (в координатах мира).
export const HookExpand: React.FC<{ readonly f: number; readonly index: number; readonly cam: Cam; readonly children: React.ReactNode }> = ({ f, index, cam, children }) => {
  const tl = useTimeline();
  const hook = sceneOf(tl, "hook");
  const T = 20;
  const p = easeInOut(f / T);
  const portrait = TILE_DEFS[index].portrait;
  const c: Cam = { x: portrait.x + (cam.x - portrait.x) * p, y: portrait.y + (cam.y - portrait.y) * p, s: portrait.s + (cam.s - portrait.s) * p };
  const rect = lerpRect(HOOK_TILES[index], FULL, p);
  const fade = 1 - clamp(f / 14);
  return (
    <>
      {fade > 0 ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Backdrop />
          <Title a={fade} />
          <Question t={hook.from / FPS + 99} fade={fade} />
          {[0, 1, 2]
            .filter((i) => i !== index)
            .map((i) => (
              <Portrait key={i} i={i} wf={hookWf(i, hook.frames + f, hook.frames)} a={fade} />
            ))}
        </div>
      ) : null}
      <View rect={rect} cam={fitCam(c, rect)} bg={TILE_DEFS[index].bg} shadow={p < 1}>
        {children}
      </View>
    </>
  );
};
