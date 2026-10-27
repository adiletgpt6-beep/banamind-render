// Вступление: одна большая стрела «полководца» распадается на сеть точек-решений,
// книга (тома, эпилог, примечания), три слоя карты «Масштаб выбора», метки голосов.
import React from "react";
import { CLAIMS } from "../components/ClaimBadge";
import { LAYERS } from "../components/MapFrame";
import { C, HERO } from "../theme";
import type { Claim } from "../types";
import { BigArrow, Chip, DotNet, Hero, Label, Note, PaperMap, Person, Stage, Volume, rnd } from "./draw";
import { at, clamp01, pop, ramp, type VisualProps } from "./kit";

// ── i01: одна стрела — и миллионы маленьких ──
export const OneArrow: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const draw = ramp(t, 0.2, 1.4);
  const split = ramp(t, at(c, 1) + 0.3, 2.2);
  const dots = ramp(t, at(c, 1), 2.5);
  const align = ramp(t, at(c, 2) + 1, 3);
  return (
    <Stage host={c.p.host}>
      <PaperMap x={60} y={150} w={1160} h={680} seed={4} />
      <DotNet x={120} y={200} w={1040} h={580} n={180} seed={7} k={dots} align={align * 0.85} dir={-0.15} arrows={dots} r={7} />
      <BigArrow x1={220} y1={640} x2={1060} y2={330} k={draw} w={64} color={C.french} o={1 - split * 0.85} />
      {split < 0.5 && (
        <g opacity={1 - split * 2}>
          <Person x={190} y={700} s={0.9} color={HERO.napoleon} dress="uniform" hat="bicorne" />
          <Label x={300} y={520} text="«гений» решает?" color={C.paper} size={30} k={pop(t, 0.9)} />
        </g>
      )}
      <Label x={640} y={120} text="тысячи решений" color={C.yellow} size={34} k={pop(t, at(c, 2) + 0.5)} />
    </Stage>
  );
};

// ── i02: книга — четыре тома, эпилог, примечания ──
export const BookShelf: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const vols = [
    { l: "I", s: "1805", c: HERO.andrei },
    { l: "II", s: "1806–1811", c: HERO.natasha },
    { l: "III", s: "1812", c: C.orange },
    { l: "IV", s: "1812", c: HERO.pierre },
    { l: "Эп.", s: "1813–1820", c: C.violet },
  ];
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="Л. Н. ТОЛСТОЙ · «ВОЙНА И МИР»" k={pop(t, 0.2)} />
      {vols.map((v, i) => {
        const k = pop(t, 0.4 + i * 0.25);
        return k > 0 ? (
          <g key={v.l} opacity={clamp01(k)}>
            <Volume x={260 + i * 190} y={560 - (1 - k) * 40} label={v.l} sub={v.s} color={v.c} />
          </g>
        ) : null;
      })}
      <rect x={140} y={566} width={1000} height={14} rx={7} fill="#6b4a2f" />
      <g opacity={ramp(t, at(c, 1), 0.6)}>
        <rect x={250} y={630} width={780} height={96} rx={20} fill={C.paper} />
        <text x={640} y={672} textAnchor="middle" fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={32} fill={C.inkBrown}>
          «Eh bien, mon prince…» → «Ну, князь…»
        </text>
        <text x={640} y={710} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={24} fill="#8a6d45">
          перевод французской речи — в примечаниях издания
        </text>
      </g>
      <Label x={640} y={810} text="впереди спойлеры" color={C.coral} size={34} k={pop(t, at(c, 2) + 1.4)} />
    </Stage>
  );
};

// ── i03: три слоя карты ──
const Plane: React.FC<{ y: number; color: string; k: number; children?: React.ReactNode; label: string }> = ({ y, color, k, children, label }) => {
  if (k <= 0) return null;
  return (
    <g transform={`translate(0 ${y + (1 - k) * 60})`} opacity={clamp01(k * 1.4)}>
      <path d="M 160 0 L 1180 0 L 1080 170 L 60 170 Z" fill={color} opacity={0.18} stroke={color} strokeWidth={4} />
      {children}
      <text x={1210} y={100} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={30} fill={color}>
        {label}
      </text>
    </g>
  );
};

export const ThreeLayers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k1 = ramp(t, at(c, 1), 0.7);
  const k2 = ramp(t, at(c, 2), 0.7);
  const k3 = ramp(t, at(c, 3), 0.7);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(-40 0) scale(0.92)">
        <Plane y={640} color={LAYERS[0].color} k={k1} label="1">
          <Hero id="pierre" x={360} y={140} s={0.55} label={false} />
          <Hero id="natasha" x={560} y={140} s={0.55} label={false} />
          <Hero id="andrei" x={760} y={140} s={0.55} label={false} />
        </Plane>
        <Plane y={400} color={LAYERS[1].color} k={k2} label="2">
          <path d="M 250 120 Q 500 40 760 90 T 1020 60" fill="none" stroke={C.russian} strokeWidth={14} strokeLinecap="round" />
          <path d="M 300 40 Q 560 120 900 130" fill="none" stroke={C.french} strokeWidth={14} strokeLinecap="round" strokeDasharray="30 16" />
        </Plane>
        <Plane y={160} color={LAYERS[2].color} k={k3} label="3">
          <DotNet x={140} y={20} w={940} h={130} n={90} seed={9} k={k3} r={6} arrows={0.9} align={0.3} dir={0} />
        </Plane>
      </g>
      <Note x={640} y={842} text="схема BanaMind: не иллюстрация романа и не карта сражения" o={ramp(t, 0.4, 0.6)} />
    </Stage>
  );
};

// ── i04: метки голосов ──
export const Legend: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const list: Claim[] = ["story", "hero", "essay", "history", "note", "map", "film"];
  return (
    <Stage host={c.p.host}>
      {list.map((id, i) => {
        const k = pop(t, 0.3 + i * 0.45);
        if (k <= 0) return null;
        const cl = CLAIMS[id];
        return (
          <g key={id} transform={`translate(${260 + (1 - k) * 40} ${200 + i * 96})`} opacity={clamp01(k)}>
            <rect x={0} y={-36} width={760} height={72} rx={36} fill="rgba(12,18,42,0.88)" stroke={cl.color} strokeWidth={3} />
            <circle cx={36} cy={0} r={24} fill={cl.color} />
            <text x={80} y={11} fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={32} fill={C.text}>
              {cl.label}
            </text>
          </g>
        );
      })}
      {/* немного живых точек вокруг легенды */}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={120 + rnd(i + 3) * 1040} cy={150 + rnd(i + 30) * 720} r={6} fill={[C.yellow, C.sky, C.pink, C.green][i % 4]} opacity={0.5} />
      ))}
    </Stage>
  );
};
