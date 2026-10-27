import React from "react";
import { displacementMapURL, FISHEYE, lensAmount, lensMagnification } from "../engines/RefractionEngine";
import { LeafSurfaceContent } from "./LeafSurface";
import { DROP_RADIUS_LEAF } from "../engines/NestedWorldEngine";

// The drop, in leaf coordinates. Inside it we render the (magnified, refracted) leaf surface of
// world S — the drop is a lens and the visual portal to the next scale. Outside: contact shadow,
// focused caustic, dark refracted rim, specular highlight from the one sun (upper left).
export const WaterDrop: React.FC<{ c: { x: number; y: number }; J: number }> = ({ c, J }) => {
  const r = DROP_RADIUS_LEAF;
  const k = lensMagnification(J);
  const lens = lensAmount(J);
  const body = 1 - Math.min(1, Math.max(0, (J - 18.9) / 0.6));
  const disp = 2 * FISHEYE * r * lens;
  return (
    <g>
      <defs>
        <clipPath id="dropClip"><circle cx={c.x} cy={c.y} r={r} /></clipPath>
        <filter id="dropLens" filterUnits="userSpaceOnUse" x={c.x - r} y={c.y - r} width={2 * r} height={2 * r}>
          <feImage href={displacementMapURL()} x={c.x - r} y={c.y - r} width={2 * r} height={2 * r} preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale={disp} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id="dropRim" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.55" stopColor="#0a2a1a" stopOpacity={0} />
          <stop offset="0.86" stopColor="#0a2a1a" stopOpacity={0.28} />
          <stop offset="0.97" stopColor="#06180f" stopOpacity={0.6} />
          <stop offset="1" stopColor="#e8fbff" stopOpacity={0.5} />
        </radialGradient>
        <radialGradient id="dropCaustic" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fdfbe6" stopOpacity={0.75} />
          <stop offset="1" stopColor="#fdfbe6" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="dropSpec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* contact shadow (light from upper-left → shadow lower-right) */}
      <ellipse cx={c.x + r * 0.32} cy={c.y + r * 0.28} rx={r * 1.04} ry={r * 0.98} fill="#082816" opacity={0.45 * body} />
      <g clipPath="url(#dropClip)">
        <g filter={lens > 0.01 ? "url(#dropLens)" : undefined}>
          <g transform={`translate(${c.x} ${c.y}) scale(${k / 8})`}>
            <LeafSurfaceContent id="lensS" view={{ x0: -1.5 * r * 8 / k, y0: -1.5 * r * 8 / k, x1: 1.5 * r * 8 / k, y1: 1.5 * r * 8 / k }} />
          </g>
        </g>
        <circle cx={c.x} cy={c.y} r={r} fill="url(#dropRim)" opacity={body} />
        {/* refracted sunlight focused on the far side */}
        <ellipse cx={c.x + r * 0.42} cy={c.y + r * 0.4} rx={r * 0.34} ry={r * 0.22} transform={`rotate(-40 ${c.x + r * 0.42} ${c.y + r * 0.4})`} fill="url(#dropCaustic)" opacity={body} />
      </g>
      <g opacity={body}>
        <ellipse cx={c.x - r * 0.38} cy={c.y - r * 0.42} rx={r * 0.3} ry={r * 0.15} transform={`rotate(-38 ${c.x - r * 0.38} ${c.y - r * 0.42})`} fill="url(#dropSpec)" />
        <circle cx={c.x - r * 0.12} cy={c.y - r * 0.6} r={r * 0.05} fill="#fff" opacity={0.85} />
        <path d={`M ${c.x - r * 0.75} ${c.y + r * 0.25} A ${r * 0.8} ${r * 0.8} 0 0 0 ${c.x + r * 0.2} ${c.y + r * 0.78}`} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={r * 0.04} strokeLinecap="round" />
      </g>
    </g>
  );
};
