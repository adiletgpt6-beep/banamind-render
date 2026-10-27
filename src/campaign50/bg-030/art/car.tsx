// Белая машина (не жёлтое такси, без марки и надписей), вид сбоку.
// Водитель держит руль обеими руками; сзади — трое детей, каждый
// пристёгнут ремнём (диагональная лента), без детских кресел.

const Kid: React.FC<{ readonly x: number; readonly y: number; readonly hair: string; readonly shirt: string; readonly s?: number }> = ({ x, y, hair, shirt, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-24 40 Q-24 6 0 4 Q24 6 24 40 Z" fill={shirt} />
    <circle cx={0} cy={-14} r={17} fill="#E8B993" />
    <path d="M-17 -16 Q-14 -36 2 -34 Q18 -32 17 -14 Q8 -24 -17 -16 Z" fill={hair} />
    {/* ремень безопасности */}
    <path d="M-20 4 L18 40" stroke="#2D3646" strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const WhiteCar: React.FC<{ readonly x: number; readonly y: number; readonly dir: 1 | -1; readonly s?: number; readonly wheel?: number; readonly kids?: boolean }> = ({ x, y, dir, s = 1, wheel = 0, kids = true }) => (
  <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
    <ellipse cx={0} cy={4} rx={190} ry={14} fill="#000" opacity={0.14} />
    {/* кузов */}
    <path d="M-190 -34 Q-188 -78 -150 -84 L-110 -88 Q-74 -150 -10 -152 L58 -152 Q108 -148 134 -94 L170 -86 Q194 -78 194 -46 L194 -20 Q194 -12 186 -12 L-184 -12 Q-190 -12 -190 -20 Z" fill="#FFFFFF" stroke="#C9D2DE" strokeWidth={4} />
    {/* окна */}
    <path d="M-96 -92 Q-66 -140 -14 -142 L14 -142 L14 -92 Z" fill="#D5E6F5" />
    <path d="M26 -142 L56 -142 Q98 -138 120 -92 L26 -92 Z" fill="#D5E6F5" />
    {/* дети сзади (силуэты внутри заднего окна) */}
    {kids ? (
      <g>
        <clipPath id={`rear-${x.toFixed(0)}-${dir}`}>
          <path d="M-96 -92 Q-66 -140 -14 -142 L14 -142 L14 -92 Z" />
        </clipPath>
        <g clipPath={`url(#rear-${x.toFixed(0)}-${dir})`}>
          <Kid x={-58} y={-112} hair="#2A201D" shirt="#3E64B3" s={0.92} />
          <Kid x={-30} y={-110} hair="#4A3428" shirt="#E07A5F" s={0.95} />
          <Kid x={-4} y={-108} hair="#1F1A19" shirt="#6BAF6B" />
        </g>
      </g>
    ) : null}
    {/* водитель: руки на руле */}
    <g>
      <clipPath id={`front-${x.toFixed(0)}-${dir}`}>
        <path d="M26 -142 L56 -142 Q98 -138 120 -92 L26 -92 Z" />
      </clipPath>
      <g clipPath={`url(#front-${x.toFixed(0)}-${dir})`}>
        <path d="M30 -92 Q30 -118 52 -120 Q74 -118 74 -92 Z" fill="#3B4A68" />
        <circle cx={52} cy={-128} r={14} fill="#D9A47E" />
        <path d="M38 -132 Q40 -146 54 -144 Q66 -142 66 -130 Q56 -138 38 -132 Z" fill="#1F1A19" />
        <circle cx={96} cy={-104} r={14} fill="none" stroke="#2D3646" strokeWidth={5} />
        <path d="M66 -104 L88 -106" stroke="#D9A47E" strokeWidth={7} strokeLinecap="round" />
      </g>
    </g>
    <rect x={18} y={-142} width={8} height={52} fill="#FFFFFF" />
    {/* двери, ручки, фары */}
    <path d="M18 -90 L18 -14" stroke="#D8DFE8" strokeWidth={3} />
    <path d="M-104 -90 L-104 -14" stroke="#D8DFE8" strokeWidth={3} />
    <rect x={-60} y={-70} width={26} height={6} rx={3} fill="#C9D2DE" />
    <rect x={60} y={-70} width={26} height={6} rx={3} fill="#C9D2DE" />
    <rect x={178} y={-70} width={16} height={14} rx={4} fill="#FFE7A6" />
    <rect x={-190} y={-66} width={10} height={14} rx={3} fill="#F2A08F" />
    {/* колёса */}
    {[-118, 120].map((wx) => (
      <g key={wx} transform={`translate(${wx} -12)`}>
        <circle r={36} fill="#2B3240" />
        <circle r={17} fill="#C3CAD5" />
        <g transform={`rotate(${wheel})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <rect key={a} x={-2.5} y={-15} width={5} height={13} fill="#8A93A3" transform={`rotate(${a})`} />
          ))}
        </g>
      </g>
    ))}
  </g>
);

