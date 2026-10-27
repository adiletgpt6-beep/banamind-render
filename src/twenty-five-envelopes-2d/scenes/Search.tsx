// Сцена 11. Они сами находят BalaGo (N06). Вечер, тот же стол.
// A. Мама берёт телефон и начинает вводить запрос; папа наклоняется.
// B. Телефон крупно (одно устройство): «Бишкек балдар үчүн такси» набирается
//    касаниями клавиш → результаты.
// C. Папа замечает вариант и показывает на экран.
// D. Касание результата → страница BalaGo («Балдар үчүн такси»,
//    «Үй → Мектеп → Үй», «Алдын ала каттоо»). Родители читают — пауза.
import { clamp, keys } from "../rig/motion";
import { Shot, useScene, usePlan } from "../kit";
import { sceneTools } from "../plan";
import type { Te2Timeline } from "../timing";
import { C } from "../theme";
import { SKIN } from "../props/CloseHand";
import { keyId, PhoneClose, WEB_TAP, WebScreen, type Tap } from "../props/Phone";
import { KitchenBack } from "./Dinner";
import { Act, type ActorSpec } from "./room";
import { H, seatOf } from "./common";

export const searchPlan = (tl: Te2Timeline) => {
  const T = sceneTools(tl, "search");
  const L = T.len;
  const typeFrom = 46;
  const keys = Array.from({ length: 12 }, (_, i) => typeFrom + 6 + i * 6);
  const results = keys[keys.length - 1] + 8;
  const notice = results + 18;
  const phone2 = notice + 30;
  const tapResult = phone2 + 14;
  const read = Math.max(tapResult + 40, L - 46);
  return { typeFrom, keys, results, notice, phone2, tapResult, read, len: L };
};

const FLOOR = 1540;
const TOPY = 1300;

export const parentsAtPhone = (uid: string, mode: "type" | "notice" | "read"): ActorSpec[] => [
  {
    uid: `${uid}-dad`,
    look: "dadHome",
    place: () => ({ x: 430, y: FLOOR, h: H.dad }),
    face: () => 0.55,
    pose: (t) => ({
      sit: 1,
      seat: seatOf(H.dad),
      lean: 14,
      expr: mode === "notice" ? "softSmile" : "thinking",
      lookY: 0.45,
      nod: 6,
      armL: { target: { x: 380, y: TOPY - 6 }, shape: "relax", elbow: "down" },
      armR: mode === "notice" ? { target: { x: 600, y: 1170 + keys(t, [[0, 20], [10, 0]]) }, shape: "point", elbow: "down", behind: false } : { target: { x: 500, y: TOPY - 6 }, shape: "relax", elbow: "down" },
    }),
    seed: 51,
  },
  {
    uid: `${uid}-mom`,
    look: "momHome",
    place: () => ({ x: 680, y: FLOOR, h: H.mom }),
    face: () => (mode === "notice" ? -0.35 : -0.1),
    pose: (t) => ({
      sit: 1,
      seat: seatOf(H.mom),
      lean: 8,
      expr: mode === "read" ? { browIn: 3, browOut: 2, lid: 0.12, smile: 0.15 } : "calm",
      lookY: 0.5,
      nod: 6,
      armL: { target: { x: 640, y: 1190 }, shape: "phone", elbow: "down", item: "phone", glow: 1, itemColor: C.coral, itemTilt: 8 },
      armR: { target: { x: 668, y: 1196 + (mode === "type" ? Math.sin(t * 1.1) * 4 : 0) }, shape: "point", elbow: "down" },
    }),
    seed: 12,
  },
];

export const TableAtPhone: React.FC<{ f: number; mode: "type" | "notice" | "read"; uid: string; zoom?: number }> = ({ f, mode, uid, zoom = 2.0 }) => {
  const ps = parentsAtPhone(uid, mode);
  return (
    <Shot f={f} cam={{ x: 560, y: 1080, zoom }} bg="#E3C9A2">
      <KitchenBack />
      {ps.map((a) => (
        <Act key={a.uid} s={a} f={f} layer="body" />
      ))}
      <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <rect x={120} y={TOPY} width={840} height={34} fill="#F4EEE2" />
        <rect x={120} y={TOPY + 34} width={840} height={FLOOR + 40 - TOPY} fill="#E5D8C2" />
      </svg>
      {ps.map((a) => (
        <Act key={`${a.uid}-a`} s={a} f={f} layer="arms" />
      ))}
    </Shot>
  );
};

export const SearchScene: React.FC = () => {
  const { f } = useScene("search");
  const p = usePlan(searchPlan);
  if (f < p.typeFrom) return <TableAtPhone f={f} mode="type" uid="s1" zoom={keys(f, [[0, 1.8], [p.typeFrom, 1.95]])} />;
  if (f >= p.notice && f < p.phone2) return <TableAtPhone f={f} mode="notice" uid="s2" zoom={2.2} />;
  if (f >= p.read) return <TableAtPhone f={f} mode="read" uid="s3" zoom={2.1} />;
  const taps: Tap[] = [...p.keys.map((at, i) => ({ at, tip: WEB_TAP.key(i) })), { at: p.tapResult, tip: WEB_TAP.result }];
  const typed = clamp((f - p.keys[0] + 2) / (p.keys[p.keys.length - 1] - p.keys[0] + 4));
  const pressedKey = p.keys.findIndex((k) => f >= k && f <= k + 2);
  const state = f < p.results ? "search" : f < p.tapResult + 2 ? "results" : "page";
  return (
    <PhoneClose f={f} taps={taps} skin={SKIN.mom}>
      <WebScreen state={state} typed={typed} pressed={pressedKey >= 0 ? keyId(pressedKey) : f >= p.tapResult && f <= p.tapResult + 2 ? "result" : null} />
    </PhoneClose>
  );
};
