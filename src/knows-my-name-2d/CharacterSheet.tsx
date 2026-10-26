// Рабочий лист героев №30 (не кадр фильма): мальчик (дома и в школе), мама,
// папа — спереди, в три четверти и сбоку, тем же ригом и теми же
// пропорциями, что в сценах; ниже — позы: слушает, говорит, телефон, письмо,
// машинка в руке, поправляет лямку. Композиция KM2CharacterSheet (папка
// Scenes в Studio): npx remotion still … KM2CharacterSheet.
import { AbsoluteFill } from "remotion";
import "./fonts";
import { SceneContext, TimelineContext } from "./context";
import { Actor, type PoseIn } from "./rig/Actor";
import type { LookId } from "./rig/looks";
import { buildKm2Timeline, estimateKm2Manifest } from "./timing";
import { C, F } from "./theme";
import { H } from "./scenes/common";

const tl = buildKm2Timeline(estimateKm2Manifest());
const ROW: { look: LookId; h: number; label: string }[] = [
  { look: "km2Boy", h: H.boy, label: "Уулу (үйдө)" },
  { look: "km2BoySchool", h: H.boy, label: "Уулу (мектепте)" },
  { look: "km2MomHome", h: H.mom, label: "Апасы" },
  { look: "km2Dad", h: H.dad, label: "Атасы" },
];
const TURNS = [0, 0.5, 0.85];

export const CharacterSheet: React.FC = () => {
  const poses: { look: LookId; h: number; label: string; pose: PoseIn; face: number }[] = [
    { look: "km2Boy", h: H.boy, label: "угуп жатат", face: -0.5, pose: { expr: "calm", lookY: 0.05 } },
    { look: "km2Boy", h: H.boy, label: "машинка колунда", face: -0.5, pose: { expr: "softSmile", armL: { target: { x: 0, y: 0 }, shape: "fist", item: "toycar", elbow: "down" } } },
    { look: "km2MomHome", h: H.mom, label: "телефон", face: 0.2, pose: { expr: "calm", lookY: 0.5, armR: { target: { x: 0, y: 0 }, shape: "phone", item: "phone", itemColor: "#EDE5D8", glow: -1, elbow: "down", behind: false } } },
    { look: "km2Dad", h: H.dad, label: "ручка", face: 0.1, pose: { expr: "thinking", lookY: 0.4, armR: { target: { x: 0, y: 0 }, shape: "fist", item: "pen", elbow: "down", behind: false } } },
  ];
  return (
    <TimelineContext.Provider value={tl}>
      <SceneContext.Provider value={{ from: 0, to: 30 }}>
        <AbsoluteFill style={{ backgroundColor: C.paper }}>
          {ROW.map((r, i) => (
            <div key={r.look} style={{ position: "absolute", left: 0, top: 30 + i * 330, width: 1080, height: 330 }}>
              <div style={{ position: "absolute", left: 30, top: 6, fontFamily: F.text, fontWeight: 800, fontSize: 30, color: C.navy }}>{r.label}</div>
              {TURNS.map((tv, j) => (
                <Actor key={j} uid={`cs-${i}-${j}`} look={r.look} f={10} place={() => ({ x: 200 + j * 300, y: 320, h: r.h * 0.36 })} face={() => tv} pose={() => ({ expr: "calm" })} seed={i + 1} />
              ))}
            </div>
          ))}
          {poses.map((p, i) => {
            const place = { x: 140 + i * 260, y: 1880, h: p.h * 0.5 };
            const k = place.h / 1000;
            const target = { x: place.x + 120 * k * (p.face < 0 ? -1 : 1), y: place.y - 520 * k };
            const withT = (a?: PoseIn["armL"]) => (a ? { ...a, target } : undefined);
            return (
              <div key={i}>
                <Actor uid={`cp-${i}`} look={p.look} f={10} place={() => place} face={() => p.face} pose={() => ({ ...p.pose, armL: withT(p.pose.armL), armR: withT(p.pose.armR) })} seed={i + 5} />
                <div style={{ position: "absolute", left: place.x - 120, top: 1890 - p.h * 0.5 - 60, width: 240, textAlign: "center", fontFamily: F.text, fontWeight: 800, fontSize: 26, color: C.navy }}>{p.label}</div>
              </div>
            );
          })}
        </AbsoluteFill>
      </SceneContext.Provider>
    </TimelineContext.Provider>
  );
};
