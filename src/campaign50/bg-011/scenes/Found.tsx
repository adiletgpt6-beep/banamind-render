// Сцена 3: сын проходит к холодильнику и молча показывает пальцем на
// магнитный крючок — ключи там. Папа хлопает себя по лбу, все смеются.
// Папа снимает связку (на словах «Ачкыч табылды»). Но мама поднимает
// взгляд на доску над комодом: три разноцветные записки «Дүйшөмбү /
// Шейшемби / Шаршемби — ким алып барат?». Камера наезжает на доску,
// комический пафос сменяется осознанием. Диктор: «Ачкыч табылды. Бирок
// күн сайын кайра чыккан суроо калды: баланы мектепке ким жеткирет?»
import { useCurrentFrame } from "remotion";
import { useLine, useScene, useTimeline } from "../context";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { anticipate, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { BG11_TEXT, BG11_VIDEO } from "../script";
import { C, Folder, K, KitchenBack, Note, NOTE_COLORS } from "../sets/Kitchen";
import { camKeys, View } from "../shots";
import { H, laugh, onDresser, stand } from "./common";
import { FOLDERS, keySwing } from "./Hook";

export const FOUND = { walk: 4, arrive: 52, point: 58, see: 76, laugh: 88, laughEnd: 132, dadWalk: 120, dadAt: 152, grab: 162 };

const SON_FROM = 1235;
const SON_AT = 450;
const DAD_FROM = 760;
const DAD_AT = 600;
const MOM_FROM = 1560;
const MOM_AT = 1010;

export const F_SON = (t: number): Place => {
  const u = cruise((t - FOUND.walk) / (FOUND.arrive - FOUND.walk), 0.3);
  return stand("son", lerp(SON_FROM, SON_AT, u), 36);
};
export const F_DAD = (t: number): Place => stand("dad", lerp(DAD_FROM, DAD_AT, cruise((t - FOUND.dadWalk) / (FOUND.dadAt - FOUND.dadWalk), 0.35)));
export const F_MOM = (t: number): Place => stand("mom", lerp(MOM_FROM, MOM_AT, cruise((t - 14) / 64, 0.3)), 6);

// Первый кадр слова реплики (кадры сцены): для монтажа по голосу.
const useWordAt = (id: string, word: string) => {
  const tl = useTimeline();
  const { from } = useScene();
  const c = tl.cues.find((x) => x.id === id)!;
  const w = c.words.find((x) => x.text.toLowerCase().startsWith(word.toLowerCase()));
  return Math.round((w ? w.start : c.from) * BG11_VIDEO.fps) - from;
};

export const FoundScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const n02 = useLine("n02");
  const birok = useWordAt("n02", "Бирок");
  const kunSaiyn = useWordAt("n02", "күн");
  const surooKaldy = useWordAt("n02", "калды");
  const grab = Math.max(FOUND.grab, n02.from + 16);
  const keysOn = f < grab + 4;
  const notice = Math.max(grab + 14, birok - 14); // мама поднимает взгляд на доску
  const closeAt = Math.max(notice + 34, kunSaiyn - 6);
  const backAt = frames - 54; // финальный план: родители задумались
  const lg = (t: number) => laugh(t, FOUND.laugh, FOUND.laughEnd);

  const sonPose = (t: number): PoseIn => ({
    expr: t < FOUND.see ? "calm" : t < FOUND.laughEnd ? "smile" : notice < t ? "thinking" : "softSmile",
    strapTug: 0.3,
    armL: {
      // пока идёт — рука у тела (держит лямку), затем показывает на крючок
      target:
        t < FOUND.arrive
          ? { x: F_SON(t).x - 0.13 * H.son, y: F_SON(t).y - 0.6 * H.son }
          : keysV(t, [[FOUND.arrive, { x: SON_AT - 0.13 * H.son, y: K.standY + 36 - 0.6 * H.son }], [FOUND.point + 10, { x: SON_AT - 0.2 * H.son, y: K.standY + 36 - 0.98 * H.son }], [FOUND.dadAt, { x: SON_AT - 0.2 * H.son, y: K.standY + 36 - 0.98 * H.son }], [FOUND.dadAt + 14, { x: SON_AT - 0.13 * H.son, y: K.standY + 36 - 0.6 * H.son }]], anticipate),
      shape: t > FOUND.point && t < FOUND.dadAt + 6 ? "point" : "fist",
      elbow: t > FOUND.point && t < FOUND.dadAt + 6 ? "out" : "in",
    },
    armR: { target: { x: F_SON(t).x + 0.12 * H.son, y: F_SON(t).y - 0.6 * H.son }, shape: "fist", elbow: "in" },
    lookY: keys(t, [[FOUND.arrive, 0], [FOUND.point + 4, -0.6], [FOUND.see, -0.6], [FOUND.see + 10, -0.1]]),
    shoulders: lg(t).shoulders * 0.8,
    nod: lg(t).nod * 0.6,
  });
  const sonFace = (t: number) => keys(t, [[FOUND.arrive - 8, -0.6], [FOUND.point + 2, -0.75], [FOUND.see, -0.75], [FOUND.see + 10, 0.55], [FOUND.laughEnd, 0.4], [notice + 8, 0.45]]);

  const dadPose = (t: number): PoseIn => {
    const l = lg(t);
    return {
      expr: t < FOUND.see ? "worried" : t < FOUND.laugh ? "surprised" : t < FOUND.laughEnd ? "smile" : t < notice + 10 ? "softSmile" : "thinking",
      lean: keys(t, [[0, 14], [FOUND.see - 10, 14], [FOUND.see, 0], [FOUND.dadAt, 0], [grab - 8, 10], [grab + 10, 0]]),
      shoulders: l.shoulders,
      nod: l.nod,
      lookY: keys(t, [[0, 0.7], [FOUND.see - 10, 0.7], [FOUND.see, -0.1], [grab - 14, -0.35], [grab + 8, 0]]),
      // ладонь ко лбу (комично), потом снимает ключи с крючка
      armR: {
        target: keysV(t, [[0, onDresser(860, -40)], [FOUND.see - 8, onDresser(860, -40)], [FOUND.see + 2, { x: F_DAD(t).x + 0.12 * H.dad, y: K.standY - 0.5 * H.dad }]]),
        shape: "relax",
        elbow: "down",
      },
      armL: {
        target: keysV(
          t,
          [
            [0, onDresser(700, -20)],
            [FOUND.see, onDresser(700, -20)],
            [FOUND.laugh, { x: DAD_FROM - 0.02 * H.dad, y: K.standY - 0.92 * H.dad }],
            [FOUND.laughEnd - 20, { x: DAD_FROM - 0.02 * H.dad, y: K.standY - 0.92 * H.dad }],
            [FOUND.laughEnd, { x: DAD_FROM - 0.12 * H.dad, y: K.standY - 0.5 * H.dad }],
            [FOUND.dadAt, { x: DAD_AT - 0.14 * H.dad, y: K.standY - 0.5 * H.dad }],
            [grab - 4, { x: K.hook.x + 30, y: K.hook.y + 48 }],
            [grab + 4, { x: K.hook.x + 34, y: K.hook.y + 52 }],
            [grab + 26, { x: DAD_AT - 0.08 * H.dad, y: K.standY - 0.56 * H.dad }],
          ],
          anticipate,
        ),
        shape: t < FOUND.laughEnd - 10 && t > FOUND.laugh - 6 ? "open" : t >= grab ? "fist" : "open",
        item: t >= grab ? "keys" : "none",
        elbow: t > FOUND.laugh - 6 && t < FOUND.laughEnd ? "out" : "down",
        behind: false,
      },
    };
  };
  const dadFace = (t: number) => keys(t, [[0, 0.55], [FOUND.see - 10, 0.55], [FOUND.see, -0.5], [FOUND.laugh + 10, -0.2], [FOUND.laughEnd, -0.3], [FOUND.dadAt, -0.7], [grab + 20, -0.4], [notice, -0.2], [notice + 16, 0.35]]);

  const momPose = (t: number): PoseIn => {
    const l = lg(t + 4);
    return {
      expr: t < FOUND.see ? "worried" : t < FOUND.laughEnd ? "smile" : t < notice ? "softSmile" : t < notice + 24 ? "surprised" : "thinking",
      shoulders: l.shoulders,
      nod: l.nod,
      lookY: keys(t, [[0, 0], [notice - 4, 0], [notice + 10, -0.75]]),
      armR: { target: t < 80 ? null : keysV(t, [[FOUND.laugh, { x: MOM_AT + 0.12 * H.mom, y: K.standY - 0.48 * H.mom }], [FOUND.laugh + 10, { x: MOM_AT + 0.02 * H.mom, y: K.standY - 0.7 * H.mom }], [FOUND.laughEnd - 10, { x: MOM_AT + 0.02 * H.mom, y: K.standY - 0.7 * H.mom }], [FOUND.laughEnd + 6, { x: MOM_AT + 0.12 * H.mom, y: K.standY - 0.48 * H.mom }]]), shape: "relax", elbow: "down", behind: false },
      armL: {
        target: t < 80 ? null : keysV(t, [[80, { x: MOM_AT - 0.12 * H.mom, y: K.standY - 0.48 * H.mom }], [notice + 16, { x: MOM_AT - 0.12 * H.mom, y: K.standY - 0.48 * H.mom }], [notice + 34, { x: MOM_AT - 0.24 * H.mom, y: K.standY - 0.9 * H.mom }]], anticipate),
        shape: t > notice + 20 ? "point" : "relax",
        elbow: "out",
      },
      headTilt: keys(t, [[notice + 20, 0], [notice + 40, -5]]),
    };
  };
  const momFace = (t: number) => keys(t, [[0, -0.85], [74, -0.85], [84, -0.55], [FOUND.laughEnd, -0.45], [notice, -0.45], [notice + 14, -0.6]]);

  const world = (
    <>
      <KitchenBack
        minutes={7 * 60 + 46 + f / 60}
        keys={keysOn}
        swing={keySwing(f, [FOUND.point + 4])}
        boardHi={[0, 1, 2].map((i) => keys(f, [[notice + 14 + i * 8, 0], [notice + 24 + i * 8, 1]]))}
        dresserTop={
          <>
            {FOLDERS.map(([x, c], i) => (
              <Folder key={x} x={x} y={K.dresser.top + 2 - i * 3} color={c} w={150} rot={i % 2 ? 4 : -3} />
            ))}
          </>
        }
      />
      <Actor uid="f-dad" look="dad" f={f} place={F_DAD} face={dadFace} pose={dadPose} seed={2} walkFrom={FOUND.dadWalk - 4} />
      <Actor uid="f-mom" look="mom" f={f} place={F_MOM} face={momFace} pose={momPose} seed={1} walkFrom={10} />
      <Actor uid="f-son" look="son" f={f} place={F_SON} face={sonFace} pose={sonPose} seed={4} walkFrom={0} />
    </>
  );
  const WIDE = { x: 660, y: 1160, zoom: 1.08 };
  const cam = camKeys(f, [
    [0, { x: 780, y: 1170, zoom: 1.0 }],
    [FOUND.arrive + 10, WIDE],
    [FOUND.see, { ...WIDE, x: 600, zoom: 1.14 }],
    [notice, { x: 640, y: 1130, zoom: 1.16 }],
    [closeAt, { x: K.board.x + K.board.w / 2, y: K.board.y + K.board.h / 2 + 30, zoom: 2.3 }],
  ]);
  // крупный план записок (наезд продолжается, записки подсвечиваются по одной)
  const close = f >= closeAt && f < backAt;
  const cu = easeOut((f - closeAt) / 10);
  const push = lerp(1, 1.06, easeInOut((f - closeAt) / Math.max(1, backAt - closeAt)));
  const hiAt = (i: number) => easeOut((f - (closeAt + 8 + i * Math.max(10, (surooKaldy - closeAt) / 3))) / 8);
  return (
    <>
      {!close && f < backAt ? <View cam={cam}>{world}</View> : null}
      {close ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#C99A62" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(110,70,30,0.28) 3px, transparent 3.4px)", backgroundSize: "34px 34px" }} />
          <div style={{ position: "absolute", inset: 0, transform: `scale(${push * lerp(0.92, 1, cu)})`, transformOrigin: "540px 900px", opacity: cu }}>
            {BG11_TEXT.notes.map((n, i) => (
              <div key={n.day} style={{ position: "absolute", left: [110, 560, 330][i], top: [380, 470, 930][i] }}>
                <Note day={n.day} q={n.q} color={NOTE_COLORS[i]} w={400} rot={[-6, 5, -2][i]} hi={hiAt(i)} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 200px rgba(60,35,10,0.35)" }} />
        </div>
      ) : null}
      {f >= backAt ? (
        <View cam={{ x: 830, y: 1010, zoom: lerp(1.75, 1.82, (f - backAt) / 54) }}>{world}</View>
      ) : null}
      {f >= backAt ? <div style={{ position: "absolute", inset: 0, background: `linear-gradient(rgba(255,196,20,0), rgba(20,40,90,${0.12 * easeOut((f - backAt) / 20)}))` }} /> : null}
      {/* лёгкая жёлтая вспышка на «Ачкыч табылды» */}
      {f >= grab && f < grab + 8 ? <div style={{ position: "absolute", inset: 0, backgroundColor: C.yellow, opacity: 0.18 * (1 - (f - grab) / 8) }} /> : null}
    </>
  );
};
