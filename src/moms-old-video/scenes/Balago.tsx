// Сцена 9 «BalaGo менен таанышуу» (≈ 8,2 с).
// Телефон в руках мамы, папа показывает пальцем: карточка BalaGo — логотип,
// «Балдар үчүн такси», «Бишкек», маршрут ҮЙ → МЕКТЕП → ҮЙ. Тап по кнопке —
// предварительная заявка крупными полями (вымышленные данные), отправка —
// «Алдын ала өтүнмө калтырылды / Каттамды сүйлөшүү үчүн». Без цены, номера,
// адреса и обещания поездки. Затем родители смотрят друг на друга.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import type { PoseIn } from "../rig/Actor";
import { easeInOut, keys, keysV, lerp } from "../rig/motion";
import { BalaGoPage, HoldingHands, Phone, PreRequestForm } from "../screens";
import { box, camMove, Shot } from "../shots";
import type { MovCue } from "../timing";
import { sceneLen, wordFrame } from "./common";
import { phoneGeom, PointingHand } from "./EveningParts";
import { EveningBack } from "./Schedule";
import { dadSofaBase, momSofaBase, seatedHead, SofaEvening, SOFA_DAD, SOFA_MOM } from "./sofaKit";

const INS = { x: 540, y: 905, w: 560 } as const;
const G = phoneGeom(INS.x, INS.y, INS.w);
const SKIN = { mom: "#E6B590", momShade: "#D29B74", sleeve: "#C47A62", dad: "#DCAA84", dadShade: "#C5906B", dadSleeve: "#5E7396" };

// Моменты сцены по словам диктора (их же берёт звук).
export const balagoBeats = (cues: readonly MovCue[]) => {
  const pageAt = Math.min(-2, wordFrame(cues, "n09", 1) - 4); // карточка собирается к слову «Балаго»
  const tap1 = wordFrame(cues, "n09", 3) + 2; // «таап»
  const formAt = tap1 + 5;
  const fill0 = wordFrame(cues, "n09", 4); // «каттамды сүйлөшүү үчүн»
  const fills = [fill0, fill0 + 13, fill0 + 26, fill0 + 39];
  const tap2 = wordFrame(cues, "n09", 9) - 2; // «өтүнмө»
  const sentAt = tap2 + 8;
  return { pageAt, tap1, formAt, fills, tap2, sentAt };
};

export const BalagoScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("balago");
  const { pageAt, tap1, formAt, fills, tap2, sentAt } = balagoBeats(cues);
  const look = Math.max(sentAt + 30, len - 62);

  // палец папы: кнопка на карточке → в сторону → кнопка отправки → прочь
  const btn1 = G.at(270, 872);
  const btn2 = G.at(270, 880);
  const rest = { x: 1000, y: 1420 };
  const tip = keysV(f, [
    [pageAt + 10, { x: 1120, y: 1700 }],
    [tap1 - 8, { x: btn1.x + 60, y: btn1.y + 70 }],
    [tap1 - 1, btn1],
    [tap1 + 3, btn1],
    [tap1 + 14, rest],
    [tap2 - 10, rest],
    [tap2 - 1, btn2],
    [tap2 + 3, btn2],
    [tap2 + 18, { x: 1140, y: 1760 }],
  ]);
  const showTip = f > pageAt + 10 && f < tap2 + 18;
  const slide = easeInOut((f - formAt) / 8);
  const insert = (
    <div style={box({ inset: 0, transformOrigin: `${INS.x}px ${INS.y}px`, scale: `${1 + 0.04 * Math.min(1, f / look)}` })}>
      <HoldingHands x={INS.x} y={INS.y} w={INS.w} skin={SKIN.mom} shade={SKIN.momShade} sleeve={SKIN.sleeve} />
      <Phone x={INS.x} y={INS.y} w={INS.w}>
        <div style={box({ inset: 0, backgroundColor: "#FFFFFF" })} />
        {f < formAt + 8 ? (
          <div style={box({ inset: 0, translate: `${-lerp(0, 540, slide)}px 0` })}>
            <BalaGoPage f={f} at={pageAt} tapAt={tap1} />
          </div>
        ) : null}
        {f >= formAt ? (
          <div style={box({ inset: 0, translate: `${lerp(540, 0, slide)}px 0` })}>
            <PreRequestForm f={f} fills={fills} tapAt={tap2} sentAt={sentAt} />
          </div>
        ) : null}
      </Phone>
      {showTip ? <PointingHand x={tip.x} y={tip.y} ang={30} s={0.9} skin={SKIN.dad} shade={SKIN.dadShade} sleeve={SKIN.dadSleeve} /> : null}
    </div>
  );

  // ---------- родители смотрят друг на друга ----------
  const mom = (t: number): PoseIn => ({
    ...momSofaBase(true),
    expr: t < look + 8 ? "calm" : "grateful",
    lookY: keys(t, [[look, 0.42], [look + 8, 0.06]]),
    lookX: 0.6,
    lean: keys(t, [[look + 6, 0], [look + 20, 3]]),
    headTilt: keys(t, [[look, 3], [look + 16, 6]]),
  });
  const dad = (t: number): PoseIn => ({
    ...dadSofaBase(),
    expr: t < look + 12 ? "softSmile" : "smile",
    lean: keys(t, [[look, 7], [look + 14, 3]]),
    lookY: keys(t, [[look + 4, 0.4], [look + 12, 0.06]]),
    lookX: -0.6,
  });
  const momFace = (t: number) => keys(t, [[look, 0.26], [look + 10, 0.5]]);
  const dadFace = (t: number) => keys(t, [[look + 4, -0.36], [look + 14, -0.6]]);
  const mh = seatedHead(SOFA_MOM, "momHome", 0.5);
  const dh = seatedHead(SOFA_DAD, "dad", -0.6);
  const cam0 = { x: (mh.x + dh.x) / 2, y: (mh.y + dh.y) / 2 + 120, zoom: 1.95 };

  return (
    <div style={box({ inset: 0, backgroundColor: "#3A3E62" })}>
      {f < look ? (
        <>
          <EveningBack />
          {insert}
        </>
      ) : (
        <Shot f={f} from={look} to={len} cam={camMove(f, look, len, cam0, { ...cam0, zoom: cam0.zoom * 1.06 })} bg="#3B3149">
          <SofaEvening f={f} uid="b9" phone mom={mom} dad={dad} momFace={momFace} dadFace={dadFace} glow={0.8} />
        </Shot>
      )}
    </div>
  );
};
