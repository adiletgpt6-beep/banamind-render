// Кисть крупным планом (вид сверху или спереди) — для планов рук с
// предметами: папка, календарь, телефон, бейдж, фотография. Несколько ясно
// нарисованных пальцев вместо сложной деформирующейся кисти. (0, 0) —
// запястье, кисть направлена вдоль +y, поворот angle (градусы), size —
// длина кисти (px). Контур — тонкий тёмный (ink, px мира).
// shape: open — ладонь с вытянутыми пальцами (разглаживает); pinch —
// большой и указательный сведены (держит край папки, фото, карточки);
// point — указательный вытянут (касание экрана); grip — пальцы обхватывают
// (ручка, телефон); rest — расслабленно.
import { C } from "../theme";

export type CloseShape = "open" | "pinch" | "point" | "grip" | "rest";

export type Skin = { readonly skin: string; readonly shade: string; readonly sleeve: string; readonly cuff?: string };

// Цвета кожи и рукавов — те же, что у персонажей (rig/looks.ts).
export const SKIN = {
  mom: { skin: "#E6B590", shade: "#D29B74", sleeve: "#8FA58A", cuff: "#F6EEDF" },
  momTalk: { skin: "#E6B590", shade: "#D29B74", sleeve: "#2F5FA8", cuff: "#FBF6EC" },
  dad: { skin: "#DCAA84", shade: "#C5906B", sleeve: "#CFE0EE", cuff: "#A9C3DA" },
  dadHome: { skin: "#DCAA84", shade: "#C5906B", sleeve: "#7D8C9B", cuff: "#66768A" },
  sonSchool: { skin: "#E8B48D", shade: "#D29A73", sleeve: "#2F4A7A", cuff: "#FFFFFF" },
  sonHome: { skin: "#E8B48D", shade: "#D29A73", sleeve: "#78AFC2" },
  grandma: { skin: "#DDAA88", shade: "#C4916F", sleeve: "#9C6B7E", cuff: "#F3ECE2" },
} as const satisfies Record<string, Skin>;

export const CloseHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly size: number;
  readonly look: Skin;
  readonly shape?: CloseShape;
  readonly mirror?: boolean; // левая рука
  readonly armLen?: number; // длина видимого рукава (в длинах кисти)
  readonly lift?: number; // 0…1 палец приподнят
  readonly ink?: number;
  readonly part?: "all" | "back" | "front"; // back — рукав и ладонь, front — пальцы (поверх предмета)
}> = ({ x, y, angle, size: L, look, shape = "rest", mirror = false, armLen = 2.6, lift = 0, ink = 3, part = "all" }) => {
  const s = mirror ? -1 : 1;
  const W = L * 0.78;
  const st = { stroke: C.ink, strokeWidth: ink, strokeLinejoin: "round" as const };
  const finger = (k: number, len: number, rot: number, key: string, up = 0) => (
    <rect key={key} x={k * W * 0.24 - W * 0.11} y={L * 0.48 - up * L * 0.08} width={W * 0.22} height={len} rx={W * 0.11} fill={look.skin} {...st} transform={`rotate(${rot} ${k * W * 0.24} ${L * 0.5})`} />
  );
  const fingers = (() => {
    switch (shape) {
      case "open":
        return [finger(-1.5, L * 0.5, 6, "a"), finger(-0.5, L * 0.58, 2, "b"), finger(0.5, L * 0.56, -2, "c"), finger(1.5, L * 0.46, -6, "d")];
      case "point":
        return [
          <rect key="fist" x={-W / 2} y={L * 0.42} width={W} height={L * 0.3} rx={W * 0.3} fill={look.skin} {...st} />,
          <rect key="idx" x={s * W * 0.22 - W * 0.11} y={L * 0.5} width={W * 0.22} height={L * 0.62} rx={W * 0.11} fill={look.skin} {...st} />,
        ];
      case "pinch":
        return [
          <rect key="fist" x={-W / 2} y={L * 0.42} width={W} height={L * 0.32} rx={W * 0.3} fill={look.skin} {...st} />,
          <rect key="idx" x={s * W * 0.2 - W * 0.11} y={L * 0.55} width={W * 0.22} height={L * 0.4} rx={W * 0.11} fill={look.skin} {...st} transform={`rotate(${s * -18} ${s * W * 0.2} ${L * 0.6})`} />,
        ];
      case "grip":
        return [
          <rect key="fist" x={-W / 2 - 2} y={L * 0.4} width={W + 4} height={L * 0.36} rx={W * 0.34} fill={look.skin} {...st} />,
          ...[-1, 0, 1].map((k) => <line key={k} x1={k * W * 0.24} y1={L * 0.46} x2={k * W * 0.24} y2={L * 0.62} stroke={C.ink} strokeWidth={ink * 0.6} strokeLinecap="round" />),
        ];
      default:
        return [finger(-1.5, L * 0.4, 3, "a"), finger(-0.5, L * 0.46, 1, "b", lift), finger(0.5, L * 0.45, -1, "c", 1 - lift), finger(1.5, L * 0.38, -3, "d")];
    }
  })();
  const back = (
    <>
      {/* рукав (уходит за край кадра) */}
      <rect x={-W * 0.62} y={-L * armLen} width={W * 1.24} height={L * armLen - L * 0.12} rx={W * 0.3} fill={look.sleeve} {...st} />
      {look.cuff ? <rect x={-W * 0.64} y={-L * 0.34} width={W * 1.28} height={L * 0.22} rx={W * 0.1} fill={look.cuff} {...st} /> : null}
      {/* запястье и ладонь */}
      <rect x={-W * 0.36} y={-L * 0.16} width={W * 0.72} height={L * 0.36} fill={look.skin} />
      <path d={`M ${-W * 0.36} ${-L * 0.14} L ${-W * 0.36} ${L * 0.12} M ${W * 0.36} ${-L * 0.14} L ${W * 0.36} ${L * 0.12}`} stroke={C.ink} strokeWidth={ink} />
      <rect x={-W / 2} y={0} width={W} height={L * 0.62} rx={W * 0.4} fill={look.skin} {...st} />
      <rect x={-W / 2 + ink} y={L * 0.3} width={W * 0.5} height={L * 0.26} rx={W * 0.2} fill={look.shade} opacity={0.35} />
    </>
  );
  const front = (
    <>
      {/* большой палец */}
      <rect x={s * W * 0.44 - W * 0.12} y={L * 0.08} width={W * 0.24} height={L * 0.42} rx={W * 0.12} fill={look.skin} {...st} transform={`rotate(${s * (shape === "pinch" ? 18 : shape === "grip" ? 8 : -34)} ${s * W * 0.42} ${L * 0.14})`} />
      {fingers}
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {part !== "front" ? back : null}
      {part !== "back" ? front : null}
    </g>
  );
};
