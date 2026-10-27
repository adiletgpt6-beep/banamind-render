// Сцена 2 (≈7–20 с): общий план — папа за ноутбуком в своём рабочем углу,
// над крышкой в воздухе ещё висят два обрывка жёлтой нити (сюрреализм).
// Звонит телефон; папа берёт его, в круге звонка — сын в школьном
// коридоре: «Ата, бүгүн мектептен сиз алып кетесизби?» Папа спокойно,
// с улыбкой: «Ооба, балам. Жумушумду токтотуп, чыгайын.» Он сверяет время
// на часах с листком «Сабак бүтөт 12:30», кладёт телефон, закрывает
// ноутбук, встаёт и уходит за сыном.
import { useCurrentFrame } from "remotion";
import { useLine, useScene } from "../context";
import { Thread } from "../editor";
import { Actor, type Place, type PoseIn } from "../rig/Actor";
import { clamp, cruise, easeInOut, easeOut, keys, keysV, lerp } from "../rig/motion";
import { BG10_TEXT } from "../script";
import { PhoneFlat } from "../sets/Apartment";
import { Chair, Desk, Laptop, OFFICE, OfficeBack, ScreenGlow } from "../sets/Office";
import { camMove, Shot } from "../shots";
import { CUT_U } from "./Hook";
import { DAD_SEAT, seated } from "./common";
import { fontFamily } from "../../../fonts";
import { NAVY, YELLOW } from "../sets/Office";

export const CALL = { buzz: 22, pick: 48, up: 64, bubble: 70 };

// Обрывки нити над ноутбуком: та же нить, уменьшенная (мир сцены).
export const FloatingThread: React.FC<{ f: number; o: number; x?: number; y?: number; s?: number; scatter?: number }> = ({ f, o, x = 1340, y = 700, s = 0.3, scatter = 0 }) =>
  o > 0 ? (
    <div style={{ position: "absolute", left: x - 540 * s, top: y - 760 * s, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0", opacity: o }}>
      <Thread
        glow={0.8}
        width={16}
        pieces={[
          { a: 0.02, b: CUT_U, sag: 70 + 8 * Math.sin(f / 18), dx: -40 * scatter, dy: 30 * scatter + 6 * Math.sin(f / 23), rot: -8 * scatter, pivot: "a" },
          { a: CUT_U + 0.01, b: 0.95, sagA: 60 + 8 * Math.cos(f / 20), dx: 120 * scatter, dy: 140 + 50 * scatter + 8 * Math.sin(f / 17), rot: 14 + 12 * scatter, pivot: "c" },
        ]}
      />
    </div>
  ) : null;

// Пузырь звонка с сыном (координаты кадра).
const CallBubble: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  if (k <= 0) return null;
  const R = 190;
  const son = (): Place => ({ x: 190, y: 930, h: 900 });
  const sonPose = (): PoseIn => ({
    expr: "softSmile",
    lookY: 0.05,
    headTilt: -4,
    armR: { target: { x: 300, y: 330 }, shape: "phone", item: "phone", elbow: "down", glow: 0.6, behind: false },
    armL: { target: null, shape: "relax" },
  });
  const ring = 1 + 0.04 * Math.sin(f / 4) * clamp(1 - (f - CALL.bubble) / 30);
  return (
    <div style={{ position: "absolute", left: 300 - R, top: 540 - R, width: R * 2, height: R * 2, opacity: k, transform: `scale(${(0.7 + 0.3 * easeOut(k)) * ring})` }}>
      <div style={{ position: "absolute", inset: -14, borderRadius: R + 14, backgroundColor: YELLOW }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: R, overflow: "hidden", background: "linear-gradient(180deg, #FFF3CC 0%, #F6E6B8 100%)" }}>
        {/* школьный коридор: окно и доска объявлений */}
        <div style={{ position: "absolute", left: 30, top: 40, width: 120, height: 150, borderRadius: 8, backgroundColor: "#CFE6FA", border: "8px solid #FFFFFF" }} />
        <div style={{ position: "absolute", left: 250, top: 70, width: 110, height: 90, borderRadius: 6, backgroundColor: "#7FB08A" }} />
        <div style={{ position: "absolute", left: 0, top: 300, width: 380, height: 80, backgroundColor: "#E7D2A2" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1, height: 1 }}>
          <Actor uid="s2-son" look="son" f={f} place={son} face={() => 0.15} pose={sonPose} role="son" seed={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: R - 150, top: R * 2 + 24, width: 300, textAlign: "center", fontFamily, color: NAVY }}>
        <div style={{ fontSize: 40, fontWeight: 900 }}>{BG10_TEXT.call.name}</div>
      </div>
    </div>
  );
};

export const CallScene: React.FC = () => {
  const f = useCurrentFrame();
  const { frames } = useScene();
  const s01 = useLine("s01");
  const f01 = useLine("f01");
  const look = f01.to + 6; // взгляд на часы (вставка)
  const L = look + 32; // обратно общий план
  const down = L; // телефон на стол
  const lid = L + 12; // рука к крышке
  const shut = L + 22; // крышка закрывается
  const stand = L + 40;
  const walk = L + 62;
  const P = (t: number): Place => (t < walk ? DAD_SEAT : { ...DAD_SEAT, x: lerp(DAD_SEAT.x, DAD_SEAT.x + 820, cruise((t - walk) / 64, 0.3)) });
  const phoneHand = (t: number) => {
    const p = P(t);
    return keysV(t, [
      [CALL.pick - 14, { x: OFFICE.laptop.x - 150, y: OFFICE.laptop.y - 40 }],
      [CALL.pick, { x: OFFICE.phone.x + 6, y: OFFICE.phone.y - 18 }],
      [CALL.up, { x: p.x - 60, y: 1000 }],
      [down, { x: p.x - 60, y: 1000 }],
      [down + 14, { x: OFFICE.phone.x + 6, y: OFFICE.phone.y - 18 }],
      [down + 26, { x: p.x - 120, y: 1170 }],
    ]);
  };
  const lidTop = OFFICE.laptop.y - 10 - OFFICE.laptop.h * lidOpen(f, shut);
  const dadPose = (t: number): PoseIn => {
    const base = seated(t, {});
    const holding = t >= CALL.pick + 4 && t < down + 12;
    const sit = keys(t, [[stand, 1], [stand + 22, 0]]);
    const armR =
      t < lid - 10
        ? base.armR!
        : t < stand + 4
          ? { target: keysV(t, [[lid - 10, base.armR!.target!], [lid + 6, { x: OFFICE.laptop.x + 40, y: lidTop - 6 }]]), shape: "open" as const, elbow: "down" as const }
          : { target: null, shape: "relax" as const };
    return {
      ...base,
      sit,
      lean: keys(t, [[0, 6], [CALL.pick - 6, 6], [CALL.pick, 12], [CALL.up, 2], [lid, 14], [shut + 10, 4], [stand + 20, 0]]),
      expr: t < CALL.buzz + 10 ? "thinking" : t < s01.from ? "calm" : t < f01.from ? "softSmile" : t < look ? "smile" : "calm",
      lookY: keys(t, [[0, 0.45], [CALL.buzz + 4, 0.75], [CALL.up, 0.2], [look - 2, 0.2], [look + 4, -0.6], [L - 2, -0.6], [L + 4, 0.55], [stand, 0.55], [stand + 14, 0]]),
      lookX: keys(t, [[look - 2, 0], [look + 4, 0.9], [L - 2, 0.9], [L + 4, 0]]),
      headTilt: keys(t, [[s01.from, 0], [s01.from + 14, 6], [f01.from, 6], [f01.from + 10, 0]]),
      nod: keys(t, [[f01.from + 2, 0], [f01.from + 10, 6], [f01.from + 20, 0], [f01.from + 34, 3], [f01.from + 44, 0]]),
      armL: t < CALL.pick - 14 || t > down + 40 ? (t > down + 40 ? { target: null, shape: "relax" } : base.armL!) : {
        target: phoneHand(t),
        shape: holding ? "phone" : "open",
        item: holding ? "phone" : "none",
        elbow: t > CALL.pick + 6 && t < down + 6 ? "hang" : "down",
        glow: holding ? 0.8 : 0,
        behind: false,
      },
      armR,
    };
  };
  const dadFace = (t: number) => keys(t, [[0, 0], [look - 2, 0], [look + 6, 0.55], [L - 2, 0.55], [L + 6, 0.05], [walk, 0.05]]);
  const phoneOnDesk = f < CALL.pick + 4 || f > down + 12;
  const buzz = f >= CALL.buzz && f < CALL.pick + 4 ? Math.sin(f * 2.2) * 3 : 0;
  const ringGlow = f >= CALL.buzz && f < CALL.pick + 4 ? 1 : 0;
  const open = lidOpen(f, shut);
  const bubbleK = easeOut((f - CALL.bubble) / 10) * (1 - easeOut((f - (f01.to + 6)) / 8));
  const world = (
    <>
      <OfficeBack minutes={12 * 60 + 5 + clamp((f - look) / 60)} />
      <Chair x={OFFICE.chair.x} />
      <ScreenGlow x={OFFICE.dadX} y={920} a={open} />
      <Actor uid="s2-dad" look="dad" f={f} place={P} face={dadFace} pose={dadPose} role="father" seed={2} walkFrom={walk - 2} />
      <Desk />
      <Laptop open={open} />
      {phoneOnDesk ? <PhoneFlat x={OFFICE.phone.x} y={OFFICE.phone.y} glow={ringGlow} shake={buzz} scale={1.3} /> : null}
      <FloatingThread f={f} o={0.85 * (1 - easeInOut((f - shut) / 16))} />
    </>
  );
  const b = s01.from - 10;
  const c = f01.from - 6;
  return (
    <>
      <Shot f={f} from={0} to={b} cam={camMove(f, 0, b, { x: 1080, y: 1060, zoom: 0.9 }, { x: 1060, y: 1040, zoom: 1.02 })}>
        {world}
      </Shot>
      <Shot f={f} from={b} to={c} cam={camMove(f, b, c, { x: 980, y: 1120, zoom: 1.38 }, { x: 980, y: 1110, zoom: 1.45 })}>
        {world}
      </Shot>
      <Shot f={f} from={c} to={look} cam={camMove(f, c, look, { x: 1070, y: 930, zoom: 1.75 }, { x: 1070, y: 930, zoom: 1.85 })}>
        {world}
      </Shot>
      {/* вставка: часы и листок «Сабак бүтөт 12:30» */}
      <Shot f={f} from={look} to={L} cam={camMove(f, look, L, { x: 1560, y: 470, zoom: 2.0 }, { x: 1560, y: 460, zoom: 2.15 })}>
        {world}
      </Shot>
      <Shot f={f} from={L} to={frames + 1} cam={camMove(f, L, frames, { x: 1120, y: 1060, zoom: 0.95 }, { x: 1320, y: 1060, zoom: 0.92 })}>
        {world}
      </Shot>
      {f < look ? <CallBubble f={f} k={bubbleK} /> : null}
    </>
  );
};

// Крышка ноутбука: открыта до shut, затем закрывается за 16 кадров.
export const lidOpen = (f: number, shut: number) => 1 - easeInOut((f - shut) / 16);
