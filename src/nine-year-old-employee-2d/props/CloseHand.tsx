// Кисть крупным планом (вид сверху или спереди) — для планов рук: лист на
// столе, фотография, бейдж, телефон, мачта. Несколько ясно нарисованных
// пальцев вместо сложной деформирующейся кисти. (0, 0) — запястье, кисть
// направлена вдоль +y, поворот angle (градусы), size — длина кисти (px).
// shape: open — ладонь с вытянутыми пальцами; pinch — большой и
// указательный сведены (держит край листа/фото); point — указательный
// вытянут (касание экрана); grip — пальцы обхватывают (мачта, телефон);
// rest — расслабленно на столе.
export type CloseShape = "open" | "pinch" | "point" | "grip" | "rest";

export const CloseHand: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly size: number;
  readonly skin: string;
  readonly shade: string;
  readonly sleeve: string;
  readonly cuff?: string;
  readonly shape?: CloseShape;
  readonly mirror?: boolean; // левая рука
  readonly armLen?: number; // длина видимого рукава (px)
  readonly lift?: number; // 0…1 палец приподнят (печать)
}> = ({ x, y, angle, size: L, skin, shade, sleeve, cuff, shape = "rest", mirror = false, armLen = 2.6, lift = 0 }) => {
  const s = mirror ? -1 : 1;
  const W = L * 0.78;
  const st = { stroke: shade, strokeWidth: Math.max(1.5, L * 0.025) };
  const finger = (k: number, len: number, rot: number, key: string, up = 0) => (
    <rect key={key} x={k * W * 0.24 - W * 0.11} y={L * 0.48 - up * L * 0.08} width={W * 0.22} height={len} rx={W * 0.11} fill={skin} {...st} transform={`rotate(${rot} ${k * W * 0.24} ${L * 0.5})`} />
  );
  const fingers = (() => {
    switch (shape) {
      case "open":
        return [finger(-1.5, L * 0.5, 6, "a"), finger(-0.5, L * 0.58, 2, "b"), finger(0.5, L * 0.56, -2, "c"), finger(1.5, L * 0.46, -6, "d")];
      case "point":
        return [
          <rect key="fist" x={-W / 2} y={L * 0.42} width={W} height={L * 0.3} rx={W * 0.3} fill={skin} {...st} />,
          <rect key="idx" x={s * W * 0.22 - W * 0.11} y={L * 0.5} width={W * 0.22} height={L * 0.62} rx={W * 0.11} fill={skin} {...st} />,
        ];
      case "pinch":
        return [
          <rect key="fist" x={-W / 2} y={L * 0.42} width={W} height={L * 0.32} rx={W * 0.3} fill={skin} {...st} />,
          <rect key="idx" x={s * W * 0.2 - W * 0.11} y={L * 0.55} width={W * 0.22} height={L * 0.4} rx={W * 0.11} fill={skin} {...st} transform={`rotate(${s * -18} ${s * W * 0.2} ${L * 0.6})`} />,
        ];
      case "grip":
        return [<rect key="fist" x={-W / 2 - 2} y={L * 0.4} width={W + 4} height={L * 0.36} rx={W * 0.34} fill={skin} {...st} />, ...[-1, 0, 1].map((k) => <line key={k} x1={k * W * 0.24} y1={L * 0.46} x2={k * W * 0.24} y2={L * 0.62} stroke={shade} strokeWidth={2} strokeLinecap="round" />)];
      default:
        return [finger(-1.5, L * 0.4, 3, "a", lift > 0.5 ? 0 : 0), finger(-0.5, L * 0.46, 1, "b", lift), finger(0.5, L * 0.45, -1, "c", 1 - lift), finger(1.5, L * 0.38, -3, "d")];
    }
  })();
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      {/* рукав (уходит за край кадра) */}
      <rect x={-W * 0.62} y={-L * armLen} width={W * 1.24} height={L * armLen - L * 0.12} rx={W * 0.3} fill={sleeve} />
      {cuff ? <rect x={-W * 0.64} y={-L * 0.34} width={W * 1.28} height={L * 0.22} rx={W * 0.1} fill={cuff} /> : null}
      {/* запястье и ладонь */}
      <rect x={-W * 0.36} y={-L * 0.2} width={W * 0.72} height={L * 0.4} fill={skin} />
      <rect x={-W / 2} y={0} width={W} height={L * 0.62} rx={W * 0.4} fill={skin} {...st} />
      {/* большой палец */}
      <rect x={s * W * 0.44 - W * 0.12} y={L * 0.08} width={W * 0.24} height={L * 0.42} rx={W * 0.12} fill={skin} {...st} transform={`rotate(${s * (shape === "pinch" ? 18 : shape === "grip" ? 8 : -34)} ${s * W * 0.42} ${L * 0.14})`} />
      {fingers}
    </g>
  );
};

export const SKIN = {
  boy: { skin: "#E8B48D", shade: "#C98D66", sleeve: "#F2B632", cuff: "#D99A1E" },
  dad: { skin: "#DCAA84", shade: "#B9845F", sleeve: "#2F3B66", cuff: "#EEF2F7" },
  mom: { skin: "#E6B590", shade: "#C99470", sleeve: "#C96B5A", cuff: "#F5EADB" },
  friend: { skin: "#D9A67E", shade: "#B88560", sleeve: "#5FA35A", cuff: "#4C8A48" },
} as const;
