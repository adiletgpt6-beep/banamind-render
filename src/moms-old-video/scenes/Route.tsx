// Сцена 8 «Мектеп жолу» (≈ 10,4 с).
// Продолжение доски сцены 7: подписи гаснут, полосы истончаются в линии —
// и на их месте собирается простая схема: МЕКТЕП внизу, ҮЙ вверху, у дома
// ждёт «Бала багуучу» (n07). На n08 линия пути рисуется от школы к дому, на
// ней — знак вопроса: дорогу от школы ещё нужно организовать. Схема уходит —
// родители на диване смотрят друг на друга и кивают: решают вместе.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { clamp, easeInOut, keys } from "../rig/motion";
import type { PoseIn } from "../rig/Actor";
import { RouteScheme } from "../screens";
import { box, camMove, Shot } from "../shots";
import { sceneLen, wordFrame } from "./common";
import { ClashBoard, EveningBack, PhoneMini } from "./Schedule";
import { dadSofaBase, momSofaBase, seatedHead, SofaEvening, SOFA_DAD, SOFA_MOM } from "./sofaKit";

const SHOWN = { card: -400, bar1: -400, bar2: -400, clash: -400, laptop: -400 };

export const RouteScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const len = sceneLen("route");
  const nannyAt = wordFrame(cues, "n07", 2); // «бала багуучу»
  const pathAt = wordFrame(cues, "n08", 0); // «Мектептен үйгө…»
  const questionAt = wordFrame(cues, "n08", 4); // «болсо»
  const reveal = [len - 62, len - 50] as const;
  const nods = { mom: len - 38, dad: len - 30 };

  const morph = easeInOut(clamp((f - 2) / 18));
  const rv = easeInOut(clamp((f - reveal[0]) / (reveal[1] - reveal[0])));

  // ---------- родители ----------
  const mom = (t: number): PoseIn => ({
    ...momSofaBase(true),
    expr: t < nods.mom + 4 ? "calm" : "softSmile",
    lookY: 0.08,
    lookX: 0.6,
    nod: keys(t, [[nods.mom, 0], [nods.mom + 6, 7], [nods.mom + 13, 0]]),
  });
  const dad = (t: number): PoseIn => ({
    ...dadSofaBase(),
    expr: t < nods.dad + 2 ? "calm" : "softSmile",
    lean: 4,
    lookY: 0.06,
    lookX: -0.6,
    nod: keys(t, [[nods.dad, 0], [nods.dad + 6, 7], [nods.dad + 13, 0]]),
  });
  const momFace = (t: number) => keys(t, [[reveal[0], 0.3], [reveal[1] + 6, 0.5]]);
  const dadFace = (t: number) => keys(t, [[reveal[0], -0.4], [reveal[1] + 4, -0.62]]);
  const mh = seatedHead(SOFA_MOM, "momHome", 0.5);
  const dh = seatedHead(SOFA_DAD, "dad", -0.6);
  const cam0 = { x: (mh.x + dh.x) / 2, y: (mh.y + dh.y) / 2 + 110, zoom: 1.75 };

  return (
    <div style={box({ inset: 0, backgroundColor: "#3A3E62" })}>
      <EveningBack />
      {f < 24 ? <ClashBoard f={f} at={SHOWN} morph={morph} phone={<PhoneMini f={f} />} /> : null}
      {f < reveal[1] ? (
        <div style={box({ inset: 0, opacity: 1 - rv, scale: `${1 - 0.06 * rv}` })}>
          <RouteScheme f={f} at={12} nannyAt={nannyAt} pathAt={pathAt} questionAt={questionAt} />
        </div>
      ) : null}
      {f >= reveal[0] ? (
        <div style={box({ inset: 0, opacity: rv })}>
          <Shot f={f} from={reveal[0]} to={len} cam={camMove(f, reveal[0], len, { ...cam0, zoom: cam0.zoom * 0.96 }, cam0)} bg="#3B3149">
            <SofaEvening f={f} uid="r8" phone mom={mom} dad={dad} momFace={momFace} dadFace={dadFace} glow={0.6} />
          </Shot>
        </div>
      ) : null}
    </div>
  );
};
