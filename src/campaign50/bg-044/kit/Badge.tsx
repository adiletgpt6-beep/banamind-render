// Метка условности в левом верхнем углу (под верхней зоной интерфейса
// Reels, y ≥ 250): «Оюндагы мисал» — пока на экране игра, «Шарттуу мисал» —
// пока видна условная 2D-сцена семьи. Сцена рисует метку сама, всё время,
// пока виден соответствующий кадр; во время превращения игры в 2D
// (видны оба мира) — kind="both": обе метки одна под другой.
import { fontFamily } from "../../../fonts";
import { BG44_TEXT } from "../script";
import { C } from "../palette";

export const BADGE = { left: 48, top: 258, height: 58 } as const;

export const Badge: React.FC<{ readonly kind: "game" | "example" | "both"; readonly opacity?: number }> = ({ kind, opacity = 1 }) => {
  if (kind === "both")
    return (
      <>
        <BadgeOne game opacity={opacity} top={BADGE.top} />
        <BadgeOne game={false} opacity={opacity} top={BADGE.top + BADGE.height + 10} />
      </>
    );
  return <BadgeOne game={kind === "game"} opacity={opacity} top={BADGE.top} />;
};

const BadgeOne: React.FC<{ readonly game: boolean; readonly opacity: number; readonly top: number }> = ({ game, opacity, top }) => {
  return (
    <div
      style={{
        position: "absolute",
        left: BADGE.left,
        top,
        height: BADGE.height,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 22px 0 14px",
        borderRadius: 14,
        backgroundColor: game ? C.navy : "rgba(255,255,255,0.94)",
        border: `4px solid ${game ? C.yellow : C.navy}`,
        boxShadow: "0 6px 0 rgba(20,40,90,0.18)",
        fontFamily,
        fontSize: 30,
        fontWeight: 900,
        color: game ? C.white : C.navy,
        opacity,
        zIndex: 50,
      }}
    >
      {game ? (
        // маленький пиксельный джойстик
        <svg width={40} height={28} viewBox="0 0 10 7" shapeRendering="crispEdges">
          <path d="M1 1h8v5h-8z" fill={C.yellow} />
          <path d="M2 3h3v1h-3zM3 2h1v3h-1z" fill={C.navy} />
          <path d="M6 2h1v1h-1zM7 4h1v1h-1z" fill={C.navy} />
        </svg>
      ) : (
        <svg width={30} height={30} viewBox="0 0 30 30">
          <circle cx={15} cy={15} r={13} fill={C.yellow} />
          <rect x={13} y={13} width={4} height={10} rx={2} fill={C.navy} />
          <circle cx={15} cy={8.5} r={2.4} fill={C.navy} />
        </svg>
      )}
      {game ? BG44_TEXT.gameExample : BG44_TEXT.example}
    </div>
  );
};
