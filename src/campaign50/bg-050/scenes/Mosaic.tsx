// Сцена 5 (≈ 36–45 с): камера отъезжает — три ответа на одной странице
// (плитки живые: люди дышат, моргают), четвёртая плитка — «?» «Сизчи?».
// Диктор: «Ар кимдин жообу башка. Бирок күн сайын кайталанган мектеп
// жолу баарына тааныш.» — на «ар кимдин» плитки по очереди подсвечиваются,
// на «күн сайын» через центр страницы рисуется общая жёлтая петля пути
// үй → мектеп → үй с днями недели (Дш…Жм загораются по кругу), она
// касается всех плиток. В конце «?» в четвёртой плитке превращается в
// четвёртую маму, которая смотрит в телефон (переход к сцене home).
import { useCurrentFrame } from "remotion";
import { fontFamily } from "../../../fonts";
import { InScene, sceneOf, useTimeline, wordIn } from "../context";
import { C } from "../palette";
import { clamp, easeInOut, easeOut } from "../rig/motion";
import { BG50_TEXT } from "../script";
import { RouteIcon } from "../screens";
import { fitCam, FULL, lerpRect, View, type Cam, type Rect } from "../shots";
import { ExampleChip, TileCaption } from "../ui";
import { EveningWorld, EVENING_TILE } from "../worlds/Evening";
import { HOME_TILE, HomeWorld } from "../worlds/Home";
import { studioCam, studioKeys, StudioWorld, STUDIO_TILE } from "../worlds/Studio";
import { WorkWorld, WORK_TILE } from "../worlds/Work";

export const SLOTS: readonly Rect[] = [
  { x: 60, y: 330, w: 465, h: 500, r: 30 },
  { x: 555, y: 330, w: 465, h: 500, r: 30 },
  { x: 60, y: 860, w: 465, h: 500, r: 30 },
  { x: 555, y: 860, w: 465, h: 500, r: 30 },
];
const CENTER = { x: 540, y: 845 } as const;
const LOOP_R = 178;

// Сколько кадров длится «?» → мама в четвёртой плитке (конец сцены).
export const REVEAL = 26;

// Петля ежедневного пути с днями недели и значками үй / мектеп.
const RouteLoop: React.FC<{ readonly p: number; readonly f: number; readonly from: number }> = ({ p, f, from }) => {
  if (p <= 0) return null;
  const circ = 2 * Math.PI * LOOP_R;
  const days = BG50_TEXT.mosaic.days;
  // дни загораются по кругу (два оборота), бегущая точка — «каждый день»
  const step = 9;
  const lit = Math.floor(Math.max(0, f - from - 10) / step) % days.length;
  const dot = ((f - from) / (step * days.length)) * 2 * Math.PI - Math.PI / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={CENTER.x} cy={CENTER.y} r={LOOP_R + 30} fill="rgba(255,255,255,0.86)" opacity={easeOut(p * 2)} />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={LOOP_R}
          fill="none"
          stroke={C.yellow}
          strokeWidth={20}
          strokeLinecap="round"
          strokeDasharray={`${circ * easeInOut(p)} ${circ}`}
          transform={`rotate(-90 ${CENTER.x} ${CENTER.y})`}
        />
        <circle cx={CENTER.x} cy={CENTER.y} r={LOOP_R} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="14 16" opacity={0.9 * p} />
        {p >= 1 ? <circle cx={CENTER.x + LOOP_R * Math.cos(dot)} cy={CENTER.y + LOOP_R * Math.sin(dot)} r={17} fill={C.navy} stroke="#FFFFFF" strokeWidth={5} /> : null}
      </svg>
      {/* үй сверху, мектеп снизу */}
      <div style={{ position: "absolute", left: CENTER.x - 38, top: CENTER.y - LOOP_R - 38, opacity: easeOut((p - 0.1) * 3) }}>
        <RouteIcon kind="home" size={76} />
      </div>
      <div style={{ position: "absolute", left: CENTER.x - 38, top: CENTER.y + LOOP_R - 38, opacity: easeOut((p - 0.5) * 3) }}>
        <RouteIcon kind="school" size={76} />
      </div>
      {/* дни недели по кругу */}
      {days.map((d, i) => {
        const ang = Math.PI * (0.2 + i * 0.4) - Math.PI / 2 + Math.PI * 0.1;
        const x = CENTER.x + (LOOP_R + 2) * Math.cos(ang);
        const y = CENTER.y + (LOOP_R + 2) * Math.sin(ang);
        const a = easeOut((p - 0.15 - i * 0.12) * 4);
        const on = p >= 1 && i === lit;
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: x - 36,
              top: y - 24,
              width: 72,
              height: 48,
              borderRadius: 24,
              backgroundColor: on ? C.navy : "#FFFFFF",
              color: on ? "#FFFFFF" : C.navy,
              border: `3px solid ${C.navy}`,
              fontFamily,
              fontSize: 26,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: a,
              transform: `scale(${(0.6 + 0.4 * a) * (on ? 1.12 : 1)})`,
            }}
          >
            {d}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: CENTER.x - 140, top: CENTER.y - 46, width: 280, textAlign: "center", fontFamily, color: C.navy, opacity: easeOut((p - 0.6) * 3) }}>
        <div style={{ fontSize: 32, fontWeight: 900 }}>{BG50_TEXT.mosaic.loopTitle}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.ink }}>{BG50_TEXT.mosaic.loopRoute}</div>
      </div>
    </div>
  );
};

// Четвёртая плитка: жёлтый «?» и «Сизчи?» (вопрос к зрителю).
const Fourth: React.FC<{ readonly a: number }> = ({ a }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${C.yellowSoft}, ${C.yellow})`, opacity: a, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily, color: C.navy }}>
    <div style={{ fontSize: 210, fontWeight: 900, lineHeight: 0.9 }}>?</div>
    <div style={{ marginTop: 16, fontSize: 52, fontWeight: 900 }}>{BG50_TEXT.mosaic.fourth}</div>
  </div>
);

// Страница мозаики без перехода (плитки 1–3) — гаснет под раскрывающейся
// четвёртой плиткой в начале сцены home.
export const MosaicStill: React.FC<{ readonly fade: number; readonly f: number }> = ({ fade, f }) => {
  const tl = useTimeline();
  const me = sceneOf(tl, "mosaic");
  const at = (id: "work" | "evening" | "studio") => sceneOf(tl, id).frames + me.frames + f;
  const defs = [
    { id: "work" as const, cam: WORK_TILE, bg: "#F6F8FC", W: WorkWorld },
    { id: "evening" as const, cam: EVENING_TILE, bg: "#F3E7D6", W: EveningWorld },
    { id: "studio" as const, cam: STUDIO_TILE, bg: "#FBF4EA", W: StudioWorld },
  ];
  if (fade <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: fade }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #FFFFFF 0%, #F4F7FC 100%)" }} />
      <div style={{ position: "absolute", left: -240, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft, opacity: 0.8 }} />
      <div style={{ position: "absolute", right: 150, top: 226 }}>
        <div style={{ padding: "8px 24px 10px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontFamily, fontSize: 32, fontWeight: 900, boxShadow: `0 5px 0 ${C.yellowDeep}` }}>{BG50_TEXT.title}</div>
      </div>
      {defs.map((d, i) => (
        <div key={d.id}>
          <div style={{ position: "absolute", left: SLOTS[i].x - 8, top: SLOTS[i].y - 8, width: SLOTS[i].w + 16, height: SLOTS[i].h + 16, borderRadius: (SLOTS[i].r ?? 0) + 8, backgroundColor: "#FFFFFF", boxShadow: "0 20px 46px rgba(20,40,90,0.18)" }} />
          <View rect={SLOTS[i]} cam={fitCam(d.cam, SLOTS[i])} bg={d.bg} overlay={<TileCaption n={i + 1} scale={0.95} right={i === 1 ? 100 : 14} />}>
            <InScene id={d.id}>
              <d.W f={at(d.id)} />
            </InScene>
          </View>
        </div>
      ))}
      <div style={{ position: "absolute", left: SLOTS[3].x - 8, top: SLOTS[3].y - 8, width: SLOTS[3].w + 16, height: SLOTS[3].h + 16, borderRadius: (SLOTS[3].r ?? 0) + 8, backgroundColor: "#FFFFFF" }} />
    </div>
  );
};

export const MosaicScene: React.FC = () => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  const me = sceneOf(tl, "mosaic");
  const work = sceneOf(tl, "work");
  const ev = sceneOf(tl, "evening");
  const st = sceneOf(tl, "studio");
  // 1) студия сворачивается из полного кадра в плитку 3
  const T = 24;
  const p = easeInOut(f / T);
  const sf = st.frames + f;
  const studioFull = studioCam(sf, studioKeys(tl));
  const camStudio: Cam = { x: studioFull.x + (STUDIO_TILE.x - studioFull.x) * p, y: studioFull.y + (STUDIO_TILE.y - studioFull.y) * p, s: studioFull.s + (STUDIO_TILE.s - studioFull.s) * p };
  const rectStudio = lerpRect(FULL, SLOTS[2], p);
  const pop = (i: number) => easeOut((f - (6 + i * 5)) / 12);
  // 2) подсветка плиток на «Ар кимдин жообу башка»
  const n02 = tl.cues.find((c) => c.id === "n02")!;
  const n02From = Math.round(n02.from * 30) - me.from;
  const hi = (i: number) => {
    const at = n02From + 4 + i * 9;
    return clamp((f - at) / 6) * (1 - clamp((f - at - 22) / 8));
  };
  // 3) петля пути на «күн сайын»
  const loopAt = wordIn(tl, "n02", "күн", 0.45, "mosaic") - 4;
  const loop = clamp((f - loopAt) / 30);
  // 4) «?» → четвёртая мама
  const reveal = clamp((f - (me.frames - REVEAL)) / REVEAL);
  const loopFade = 1 - clamp((f - (me.frames - REVEAL - 4)) / 14);
  const tileBorder = (i: number) => (
    <div
      key={`b${i}`}
      style={{
        position: "absolute",
        left: SLOTS[i].x - 8,
        top: SLOTS[i].y - 8,
        width: SLOTS[i].w + 16,
        height: SLOTS[i].h + 16,
        borderRadius: (SLOTS[i].r ?? 0) + 8,
        backgroundColor: "#FFFFFF",
        boxShadow: `0 20px 46px rgba(20,40,90,0.18), 0 0 0 ${6 * hi(i)}px ${C.yellow}`,
        opacity: i === 2 ? p : pop(i),
      }}
    />
  );
  const wf = (sc: { frames: number }) => sc.frames + f;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #FFFFFF 0%, #F4F7FC 100%)" }} />
      <div style={{ position: "absolute", left: -240, top: -240, width: 760, height: 760, borderRadius: 380, backgroundColor: C.yellowSoft, opacity: 0.8 }} />
      {/* заголовок страницы */}
      <div style={{ position: "absolute", right: 150, top: 226, opacity: pop(0) }}>
        <div style={{ padding: "8px 24px 10px", borderRadius: 999, backgroundColor: C.yellow, color: C.navy, fontFamily, fontSize: 32, fontWeight: 900, boxShadow: `0 5px 0 ${C.yellowDeep}` }}>{BG50_TEXT.title}</div>
      </div>
      {[0, 1, 2, 3].map(tileBorder)}
      <View rect={{ ...SLOTS[0], x: SLOTS[0].x, y: SLOTS[0].y + (1 - pop(0)) * 40 }} cam={fitCam(WORK_TILE, SLOTS[0])} bg="#F6F8FC" opacity={pop(0)} overlay={<TileCaption n={1} a={pop(0)} scale={0.95} />}>
        <InScene id="work">
          <WorkWorld f={wf(work)} />
        </InScene>
      </View>
      <View rect={{ ...SLOTS[1], y: SLOTS[1].y + (1 - pop(1)) * 40 }} cam={fitCam(EVENING_TILE, SLOTS[1])} bg="#F3E7D6" opacity={pop(1)} overlay={<TileCaption n={2} a={pop(1)} scale={0.95} right={100} />}>
        <InScene id="evening">
          <EveningWorld f={wf(ev)} />
        </InScene>
      </View>
      <View rect={rectStudio} cam={fitCam(camStudio, rectStudio)} bg="#FBF4EA" shadow={p < 1} overlay={<TileCaption n={3} a={p} scale={0.95} />}>
        <InScene id="studio">
          <StudioWorld f={sf} />
        </InScene>
      </View>
      <View rect={{ ...SLOTS[3], y: SLOTS[3].y + (1 - pop(3)) * 40 }} cam={fitCam(HOME_TILE, SLOTS[3])} bg="#2A2F55" opacity={pop(3)} overlay={<Fourth a={1 - easeInOut(reveal)} />}>
        {reveal > 0 ? (
          <InScene id="home">
            <HomeWorld f={f - me.frames} />
          </InScene>
        ) : null}
      </View>
      <div style={{ opacity: loopFade }}>
        <RouteLoop p={loop} f={f} from={loopAt + 30} />
      </div>
      <ExampleChip a={1} />
    </div>
  );
};
