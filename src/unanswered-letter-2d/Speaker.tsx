// Портрет говорящего рядом с субтитрами — у каждой роли свой:
//   Айжан — сама героиня (каре, бирюзовый кардиган), коллега — коллега,
//   муж — муж, дочь — девочка (в машине — в школьной форме, дома — в
//   розовом свитере), закадровый рассказчик — логотип BalaGo.
// Рот на портрете двигается по фактической речи той же роли (тайминги букв
// и громкость её файла); при внутреннем чтении письма рот закрыт.
import { useContext } from "react";
import { Logo } from "../components/Logo";
import { CuesContext, lipAt, type Viseme } from "./context";
import { Head } from "./rig/Head";
import { LOOKS, type LookId } from "./rig/looks";
import { blinkAt } from "./rig/motion";
import { EXPR, mixExpr } from "./rig/pose";
import type { Ul2Role, Ul2SceneId } from "./script";
import { C } from "./theme";

export const ROLE_COLOR: Record<Ul2Role, string> = {
  narrator: C.yellow,
  mother: "#7FD6CD", // бирюзовый — цвет кардигана Айжан
  father: "#A9C3F0",
  daughter: "#F5A8BC",
  colleague: "#B9D7A8",
};

export const lookOfRole = (role: Exclude<Ul2Role, "narrator">, scene: Ul2SceneId): LookId => {
  switch (role) {
    case "mother":
      return "aizhan";
    case "father":
      return "dad";
    case "colleague":
      return "colleague";
    case "daughter":
      return scene === "drawing" ? "girlHome" : "girl";
  }
};

// Голова и плечи (центр круга — 0, 0; радиус 130).
const Portrait: React.FC<{ uid: string; lookId: LookId; f: number; mouth: Viseme; smile: number }> = ({ uid, lookId, f, mouth, smile }) => {
  const L = LOOKS[lookId];
  const child = L.build.headRx > 66;
  const s = child ? 0.86 : 1;
  const expr = mixExpr(EXPR.calm, EXPR.smile, smile);
  const blink = blinkAt(f, uid.length * 7 + 3);
  const common = { look: L, cx: 0, cy: -8, turn: 0, lookX: 0, lookY: 0, nod: 0, expr, mouth, blink, hairSway: 0 } as const;
  return (
    <g transform={`translate(0 ${child ? 10 : 6}) scale(${s})`}>
      <Head uid={`${uid}-b`} part="back" {...common} />
      <path d="M -22 40 L -24 82 L 24 82 L 22 40 Z" fill={L.skinShade} />
      <path d="M -136 190 Q -130 96 -62 84 L 62 84 Q 130 96 136 190 Z" fill={L.topColor} />
      <path d="M -30 84 L 0 116 L 30 84 Z" fill={L.inner} />
      <Head uid={`${uid}-f`} part="front" {...common} />
    </g>
  );
};

// Круглый портрет диаметром size. f — абсолютный кадр ролика.
export const SpeakerAvatar: React.FC<{
  readonly role: Ul2Role;
  readonly scene: Ul2SceneId;
  readonly f: number;
  readonly size: number;
  readonly inner?: boolean;
  readonly smile?: number;
}> = ({ role, scene, f, size, inner = false, smile = 0.4 }) => {
  const cues = useContext(CuesContext);
  const color = ROLE_COLOR[role];
  if (role === "narrator") {
    return (
      <div style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Logo size={size - 12} style={{ boxShadow: "none" }} />
      </div>
    );
  }
  const lookId = lookOfRole(role, scene);
  const mouth = inner ? { open: 0, round: 0, wide: 0 } : lipAt(cues, role, f);
  const id = `spk-${role}-${lookId}`;
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", flex: "none", boxShadow: `0 0 0 4px ${color}` }}>
      <svg width={size} height={size} viewBox="-130 -130 260 260">
        <defs>
          <clipPath id={`${id}-clip`}>
            <circle r={130} />
          </clipPath>
        </defs>
        <circle r={130} fill={color} />
        <circle r={130} fill="rgba(255,255,255,0.35)" />
        <g clipPath={`url(#${id}-clip)`}>
          <Portrait uid={id} lookId={lookId} f={f} mouth={mouth} smile={smile} />
        </g>
      </svg>
    </div>
  );
};
