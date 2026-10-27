// Сцена 5 (41,5–52,5 с). Слайд со схемой маршрута сменяется порядком
// «Топ түзүү → Акысыз сыноо → Чечим»; шаги подсвечиваются вместе со
// словами диктора: «Адегенде маршрутуңузга ылайык топ түзүлөт. Биринчи
// толук сыноо сапары акысыз, андан кийин гана чечим чыгарасыз.»
// Внизу — «Сапар топ түзүлгөндөн кийин гана башталат» (поездка не
// изображается). Затем мама в телефоне нажимает «Шилтемени сактоо» —
// ссылка сохранена для заявки.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { LOOKS } from "../rig/looks";
import { easeInOut, easeOut, keys, keysV } from "../rig/motion";
import { B6_TEXT } from "../script";
import { HoldBack, HoldFront, BalaGoPage, PhoneFrame, Slide, TapFinger } from "../screens";
import { OFFICE } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import { H, wordFrame } from "./common";
import { OfficeWorld } from "./OfficeWorld";

export const TERMS = { flip: 6, close: 40, pov: 248, tap: 272, saved: 278 };
const MOM = { x: OFFICE.mom.x, y: OFFICE.mom.y, h: H.mom };
const SL = { x: 40, y: 380, w: 1000 };

export const TermsScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const w1 = wordFrame(cues, "n03", "terms", "топ", 80);
  const w2 = wordFrame(cues, "n03", "terms", "сыноо", 150);
  const w3 = wordFrame(cues, "n03", "terms", "чечим", 225);
  const lit = easeOut((f - w1) / 8) + easeOut((f - w2) / 8) + easeOut((f - w3) / 8) + 0.6 * easeOut((f - w3 - 10) / 10);
  const terms = easeInOut((f - TERMS.flip) / 30);
  const momPose = (t: number): PoseIn => ({
    expr: "calm",
    armL: { target: { x: MOM.x - 60, y: MOM.y - 0.55 * MOM.h }, shape: "phone", item: "phone", glow: 1, elbow: "down", itemTilt: -8 },
    armR: { target: keysV(t, [[0, { x: MOM.x + 80, y: MOM.y - 0.45 * MOM.h }], [20, { x: OFFICE.screen.x + 120, y: OFFICE.screen.y + 230 }]]), shape: "point", elbow: "out" },
    lookY: -0.1,
  });
  // лазерная точка идёт по подсвеченному шагу (координаты слайда 1600×900)
  const step = Math.min(2, Math.floor(Math.max(0, lit - 0.5)));
  const dot = { x: keys(f, [[w1, 300], [w2, 800], [w3, 1300]]), y: 430 + Math.sin(f / 7) * 10, on: f > w1 - 6 ? 1 : 0 };
  const ph = { x: 220, y: 110, w: 640 };
  const k = ph.w / 700;
  const mom = LOOKS.mom;
  const tip = keysV(f, [[TERMS.pov + 6, { x: ph.x + 520 * k, y: 1600 }], [TERMS.tap - 8, { x: ph.x + 350 * k, y: ph.y + 1080 * k }], [TERMS.tap, { x: ph.x + 350 * k, y: ph.y + 1060 * k }], [TERMS.tap + 14, { x: ph.x + 600 * k, y: 1750 }]]);
  return (
    <>
      <Shot f={f} from={0} to={TERMS.close} cam={camMove(f, 0, TERMS.close, { x: 1600, y: 980, zoom: 1.16 }, { x: 1700, y: 700, zoom: 1.6 })}>
        <OfficeWorld
          f={f}
          minutes={B6_TEXT.clockNow + 13 + f / 600}
          slide={{ reveal: 1, route: 1, terms }}
          seated={[]}
          standing={[{ uid: "r-mom", look: "mom", seed: 1, place: () => MOM, face: () => 0.55, pose: momPose, role: "mother" }]}
          emptyChairs={[OFFICE.seat.b, OFFICE.seat.colleague, OFFICE.seat.c]}
        />
      </Shot>
      {/* экран крупно: шаги подсвечиваются вместе со словами диктора */}
      <Shot
        f={f}
        from={TERMS.close}
        to={TERMS.pov}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, backgroundColor: "#EEF0F2" })}>
            <div style={box({ left: -100, top: 1300, width: 1300, height: 700, backgroundColor: "#DDE3EA" })} />
            <div style={box({ left: SL.x - 24, top: SL.y - 24, width: SL.w + 48, height: (SL.w * 9) / 16 + 48, borderRadius: 18, backgroundColor: "#2A2F3A", boxShadow: "0 30px 60px rgba(30,40,60,0.25)" })} />
            <div style={box({ left: SL.x, top: SL.y, width: SL.w, height: (SL.w * 9) / 16, overflow: "hidden", scale: `${1 + 0.02 * easeInOut((f - TERMS.close) / 200)}` })}>
              <Slide w={SL.w} s={{ reveal: 1, route: 1, terms: 1, lit, dot: { ...dot, on: dot.on * (step >= 0 ? 1 : 0) } }} />
            </div>
          </div>
        }
      >
        {null}
      </Shot>
      {/* мама сохраняет ссылку для заявки */}
      <Shot
        f={f}
        from={TERMS.pov}
        to={9999}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "radial-gradient(circle at 50% 40%, #F3F5F8, #C9D2DD)" })}>
            <HoldBack x={ph.x} y={ph.y} w={ph.w} sleeve={mom.topColor} skin={mom.skin} />
            <PhoneFrame x={ph.x} y={ph.y + Math.sin(f / 28) * 4} w={ph.w} tilt={-1}>
              <BalaGoPage f={f} at={-200} stepsAt={-200} tapAt={TERMS.tap} savedAt={TERMS.saved} />
            </PhoneFrame>
            <HoldFront x={ph.x} y={ph.y} w={ph.w} skin={mom.skin} />
            <TapFinger x={tip.x} y={tip.y} sleeve={mom.topColor} skin={mom.skin} press={f >= TERMS.tap - 3 && f <= TERMS.tap + 4 ? 1 : 0} />
          </div>
        }
      >
        {null}
      </Shot>
    </>
  );
};
