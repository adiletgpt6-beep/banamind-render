import { COLORS } from "../config";

// Небольшая белая машина (вид сверху), носом вверх.
// Тёмно-синий контур и тень, чтобы белый кузов читался на светлом фоне.
export const CarTopView: React.FC<{ readonly size: number }> = ({ size }) => {
  return (
    <svg
      width={size * 0.56}
      height={size}
      viewBox="0 0 56 100"
      style={{ overflow: "visible" }}
    >
      <ellipse cx="28" cy="54" rx="30" ry="48" fill={COLORS.shadow} />
      {/* колёса */}
      <rect x="0" y="18" width="8" height="18" rx="3" fill={COLORS.navy} />
      <rect x="48" y="18" width="8" height="18" rx="3" fill={COLORS.navy} />
      <rect x="0" y="66" width="8" height="18" rx="3" fill={COLORS.navy} />
      <rect x="48" y="66" width="8" height="18" rx="3" fill={COLORS.navy} />
      {/* кузов */}
      <rect
        x="4"
        y="2"
        width="48"
        height="96"
        rx="16"
        fill={COLORS.white}
        stroke={COLORS.navy}
        strokeWidth="3.5"
      />
      {/* лобовое стекло */}
      <path
        d="M10 30 Q28 20 46 30 L42 42 Q28 37 14 42 Z"
        fill={COLORS.navySoft}
      />
      {/* крыша */}
      <rect x="13" y="44" width="30" height="26" rx="5" fill="#F2F5FA" />
      {/* заднее стекло */}
      <path
        d="M14 72 Q28 76 42 72 L45 82 Q28 87 11 82 Z"
        fill={COLORS.navySoft}
      />
      {/* фары */}
      <rect x="9" y="5" width="10" height="5" rx="2.5" fill={COLORS.yellow} />
      <rect x="37" y="5" width="10" height="5" rx="2.5" fill={COLORS.yellow} />
    </svg>
  );
};
