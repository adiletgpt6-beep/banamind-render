// Сцена 14. «Ооба. Ал көптөн бери…» (M05, C06).
// A. Мама уже у стола; замечает оставленную записку и с мягкой улыбкой
//    спрашивает: «Муну баары бир бересиңби?» (M05).
// B. Аян поднимает голову, смотрит на неё: «Ооба. Ал көптөн бери көргүсү
//    келип жүргөн.» (C06) — и придвигает комикс к записке. Мама улыбается.
// C. Последний человеческий план сверху: записка с новой строкой, комикс,
//    конверт «Эмир» и ручка рядом. Спокойная пауза до контактов.
import { clamp, easeInOut, keys, lerp } from "../rig/motion";
import { useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { NOTE } from "../script";
import { NOTE_H, NOTE_W, NoteSheet } from "../props/Note";
import { TOP, toFront } from "../sets/Room";
import { Svg } from "../kit";
import { DeskTop } from "./desk";
import { finalItems } from "./Box";
import { ayanSeated, AYAN_SEAT, MOM_STAND, onDesk, RoomFront, ROOM_CAM, type ActorSpec } from "./room";

export const promisePlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "promise");
  const c06 = T.from("C06");
  const c06End = T.to("C06");
  return { m05: T.from("M05"), m05End: T.to("M05"), c06, c06End, slide: [c06End - 30, c06End - 4] as const, top: c06End + 10, len: T.len };
};
type P = ReturnType<typeof promisePlan>;

const COMIC_TO = { x: TOP.noteSpot.x + 420, y: TOP.noteSpot.y - 40 };
const comicAt = (t: number, p: P) => {
  const k = easeInOut(clamp((t - p.slide[0]) / (p.slide[1] - p.slide[0])));
  return { x: lerp(TOP.comic.x, COMIC_TO.x, k), y: lerp(TOP.comic.y, COMIC_TO.y, k), rot: lerp(-6, 4, k) };
};

// записка во фронтальном плане (лист на столе перед Аяном)
const NoteFront: React.FC = () => {
  const q = toFront(TOP.noteSpot.x, TOP.noteSpot.y);
  const w = NOTE_W * 0.5 * 0.358 * q.s;
  return (
    <Svg>
      <rect x={q.x - w / 2 + 3} y={q.y - 9} width={w} height={24} rx={2} fill="rgba(60,40,20,0.2)" />
      <rect x={q.x - w / 2} y={q.y - 12} width={w} height={22} rx={2} fill="#FFFDF7" stroke="#E2DACB" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={q.x - w * 0.4} y={q.y - 7 + k * 6} width={w * (k === 2 ? 0.6 : 0.8)} height={2.5} rx={1} fill="#2B4A8A" opacity={0.7} />
      ))}
    </Svg>
  );
};

const momSpec = (p: P): ActorSpec => ({
  uid: "pr-mom",
  look: "momHome",
  place: () => MOM_STAND,
  face: (t) => keys(t, [[p.m05 - 16, -0.4], [p.m05 + 4, -0.7]]),
  pose: (t) => ({
    expr: t < p.c06End ? "softSmile" : "smile",
    lookY: t < p.m05 ? 0.7 : 0.3,
    nod: t < p.m05 ? 9 : 4,
    lean: 6,
    armL: { target: { x: MOM_STAND.x - 120, y: 1262 }, shape: "relax", elbow: "down" },
    armR: { target: null },
  }),
  role: "mother",
  seed: 12,
});

const ayanSpec = (p: P): ActorSpec => ({
  uid: "pr-ayan",
  look: "ayanHome",
  place: () => AYAN_SEAT,
  face: (t) => keys(t, [[p.m05End, 0.1], [p.m05End + 10, 0.55], [p.slide[0], 0.5], [p.slide[0] + 6, 0.2], [p.slide[1] + 4, 0.5]]),
  pose: (t) => {
    const c = comicAt(t, p);
    return ayanSeated({
      expr: t < p.c06 ? { browIn: 3, browOut: 2, lid: 0.1, smile: 0.1 } : "smile",
      lookY: keys(t, [[p.m05End, 0.6], [p.m05End + 10, -0.05], [p.slide[0], -0.05], [p.slide[0] + 6, 0.55], [p.slide[1] + 4, 0]]),
      nod: keys(t, [[p.m05End, 7], [p.m05End + 10, 0]]),
      armL: t >= p.slide[0] - 10 && t <= p.slide[1] + 8 ? { target: onDesk(c.x, c.y), shape: "open", elbow: "down" } : { target: onDesk(1600, 1680), shape: "relax", elbow: "down" },
      armR: { target: onDesk(TOP.noteSpot.x - 250, 1650), shape: "relax", elbow: "down" },
    });
  },
  role: "son",
  seed: 11,
});

export const PromiseScene: React.FC = () => {
  const { f } = useScene("promise");
  const p = usePlan(promisePlan);
  const c = comicAt(f, p);
  const items = finalItems().map((e) => ({ ...e, x: TOP.noteSpot.x - 120, y: TOP.noteSpot.y - 330, rot: -6, empty: true }));
  if (f >= p.top) {
    return (
      <DeskTop
        f={f}
        cam={{ x: TOP.noteSpot.x + 150, y: TOP.noteSpot.y - 60, zoom: keys(f, [[p.top, 1.45], [p.len, 1.5]]) }}
        items={items}
        boxInside={24}
        comic={{ x: COMIC_TO.x, y: COMIC_TO.y, rot: 4 }}
        pen={{ x: TOP.noteSpot.x + 120, y: TOP.noteSpot.y + 220, angle: -80 }}
        above={
          <div style={{ position: "absolute", left: TOP.noteSpot.x - NOTE_W * 0.25, top: TOP.noteSpot.y - NOTE_H * 0.25, transform: "scale(0.5)", transformOrigin: "0 0" }}>
            <NoteSheet added={[...NOTE.added].length} fold={1} />
          </div>
        }
      />
    );
  }
  const shot = f < p.m05End + 6 ? ROOM_CAM.two : f < p.c06End ? ROOM_CAM.ayan : ROOM_CAM.two;
  return <RoomFront f={f} cam={shot} items={items} boxInside={24} ayan={ayanSpec(p)} mom={momSpec(p)} comic={false} pen={false} onTop={<><NoteFront /><ComicFrontAt x={c.x} y={c.y} /></>} />;
};

const ComicFrontAt: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const q = toFront(x, y);
  const w = 240 * 0.358 * q.s;
  return (
    <Svg>
      <rect x={q.x - w / 2 + 2} y={q.y - 8} width={w} height={18} rx={3} fill="rgba(60,40,20,0.2)" />
      <rect x={q.x - w / 2} y={q.y - 10} width={w} height={16} rx={3} fill="#5B8DD6" />
      <rect x={q.x - w / 2 + 6} y={q.y - 8} width={w * 0.5} height={6} rx={2} fill="#FFD43B" />
    </Svg>
  );
};
