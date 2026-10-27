// Слой 3 — история и сквозные метафоры: яблоко с бесконечными причинами, человек на нитях,
// щепка в колёсах машины, круглый Каратаев, плен и звёзды, живой глобус из капель, ребёнок
// «правит» каретой, лодка градоначальника и корабль народа, паровоз, конус власти, поднятая рука,
// Коперник, войско из нитей, комета, дверь, граната. Метафоры Толстого — по тексту романа;
// их рисунок — собственная схема BanaMind.
import React from "react";
import { interpolate } from "remotion";
import { rnd } from "../components/Background";
import { C, SERIF } from "../theme";
import { Card, cxOf, dark, dotsCloud, ink, Label, type P } from "./common";
import { NameTag, Person, type Who } from "./figures";
import { Arrow, at, clamp01, pop, Pop, ramp, Txt, wob, type VisualProps } from "./kit";

// ── яблоко: тысяча причин падения ──
export const Apple: React.FC<VisualProps<P & { causes: string[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const fall = ramp(t, at(c, 1.2), 0.9);
  const y = interpolate(fall, [0, 1], [380, 820]);
  return (
    <g>
      <path d={`M ${cx - 40} 900 L ${cx - 20} 420 Q ${cx - 200} 300 ${cx - 360} 280 M ${cx - 20} 420 Q ${cx + 100} 300 ${cx + 300} 260`} stroke="#6b4a32" strokeWidth={36} fill="none" strokeLinecap="round" />
      <ellipse cx={cx - 20} cy={250} rx={420} ry={190} fill="#4caf6e" stroke="#2b7d4c" strokeWidth={6} />
      {Array.from({ length: 30 }).map((_, i) => (
        <circle key={i} cx={cx - 400 + rnd(i, 91) * 760} cy={130 + rnd(i, 92) * 230} r={22} fill="#7cc46a" opacity={0.7} />
      ))}
      <g transform={`translate(${cx + 120 + wob(t, 1, fall > 0 ? 0 : 3)} ${y}) rotate(${fall * 200})`}>
        <circle r={40} fill={C.red} stroke={C.ink} strokeWidth={5} />
        <path d="M 0 -40 q 6 -20 18 -26" stroke="#6b4a32" strokeWidth={6} fill="none" />
      </g>
      <rect x={0} y={900} width={1920} height={40} fill="#c7d6a8" />
      {p.causes.map((cs, i) => {
        const a = (i / p.causes.length) * Math.PI * 2 - Math.PI / 2;
        const k = pop(t, at(c, Math.min(0.4 + i * 0.22, c.beats.length - 0.3)));
        return (
          <g key={i} opacity={clamp01(k)}>
            <Arrow x1={cx + 120 + Math.cos(a) * 440} y1={560 + Math.sin(a) * 300} x2={cx + 120 + Math.cos(a) * 120} y2={560 + Math.sin(a) * 90} k={k} color={C.dots[i % 8]} w={8} />
            <Label x={cx + 120 + Math.cos(a) * 520} y={560 + Math.sin(a) * 330} text={cs} size={28} bg="#fff" />
          </g>
        );
      })}
    </g>
  );
};

// ── человек на нитях: решения тянут чужие руки ──
export const Strings: React.FC<VisualProps<P & { who: Who; name: string; pulls: string[]; cut?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const n = p.pulls.length;
  const cut = p.cut ? ramp(t, at(c, c.beats.length - 0.6), 0.6) : 0;
  return (
    <g>
      <rect x={cx - 560} y={230} width={1120} height={36} rx={18} fill="#8a6a4a" />
      {p.pulls.map((pl, i) => {
        const x = cx - 420 + (i * 840) / Math.max(1, n - 1);
        const k = ramp(t, at(c, Math.min(i * 0.5, c.beats.length - 0.3)), 0.6);
        const sway = Math.sin(t * 1.6 + i) * 10;
        const tx = cx + (i - (n - 1) / 2) * 40;
        return (
          <g key={i} opacity={k}>
            <line x1={x} y1={266} x2={interpolate(cut, [0, 1], [tx + sway, x])} y2={interpolate(cut, [0, 1], [600, 380])} stroke={C.ink} strokeWidth={3} strokeDasharray={cut > 0.5 ? "6 10" : undefined} />
            <g transform={`translate(${x} 230)`}>
              <circle r={34} fill="#f3d9bf" stroke={C.ink} strokeWidth={4} />
            </g>
            <Label x={x} y={170} text={pl} size={28} bg="#fff" />
          </g>
        );
      })}
      <Person who={p.who} x={cx} y={900} s={1.2} t={t} arm={cut > 0.5 ? "up" : "out"} arm2="out" label={p.name} />
    </g>
  );
};

// ── щепка в колёсах машины ──
export const Machine: React.FC<VisualProps<P & { text?: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const Gear: React.FC<{ x: number; y: number; r: number; dir: number; col: string }> = ({ x, y, r, dir, col }) => {
    const teeth = Math.round(r / 14);
    return (
      <g transform={`translate(${x} ${y}) rotate(${dir * t * (600 / r)})`}>
        {Array.from({ length: teeth }).map((_, i) => (
          <rect key={i} x={-12} y={-r - 22} width={24} height={34} rx={4} fill={col} stroke={C.ink} strokeWidth={4} transform={`rotate(${(i * 360) / teeth})`} />
        ))}
        <circle r={r} fill={col} stroke={C.ink} strokeWidth={5} />
        <circle r={r * 0.3} fill="#fff" stroke={C.ink} strokeWidth={4} />
      </g>
    );
  };
  return (
    <g>
      <Gear x={cx - 300} y={480} r={190} dir={1} col="#9aa3b5" />
      <Gear x={cx + 100} y={420} r={120} dir={-1.6} col="#c9d6e3" />
      <Gear x={cx + 380} y={600} r={150} dir={1.27} col="#9aa3b5" />
      <g transform={`translate(${cx - 70 + Math.sin(t * 6) * 4} 560) rotate(${t * 40})`}>
        <rect x={-50} y={-9} width={100} height={18} rx={4} fill="#d9b27a" stroke={C.ink} strokeWidth={3} />
      </g>
      {p.text && (
        <Pop t={t} at={at(c, 0.3)} x={cx} y={900}>
          <Label x={0} y={0} text={p.text} size={34} bg="#fff" />
        </Pop>
      )}
      <Pop t={t} at={at(c, Math.min(2, c.beats.length - 0.4))} x={cx} y={180}>
        <Label x={0} y={0} text="«порядок, склад обстоятельств»" size={36} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── Каратаев: всё круглое; картошка с солью ──
export const Karataev: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const round = ramp(t, at(c, 1), 1.5);
  const potato = pop(t, at(c, 0.4));
  return (
    <g>
      <rect x={cx - 640} y={180} width={1280} height={700} rx={20} fill="#5a4636" opacity={0.18} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={cx - 640 + i * 160} y1={180} x2={cx - 640 + i * 160} y2={880} stroke="#5a4636" strokeOpacity={0.25} strokeWidth={6} />
      ))}
      <circle cx={cx + 160} cy={560} r={300 * round} fill="none" stroke={C.ember} strokeWidth={8} opacity={0.6 * round} />
      <circle cx={cx + 160} cy={560} r={240 * round} fill="#ffe7a3" opacity={0.35 * round} />
      <Person who="karataev" x={cx + 160} y={820} s={1.15} t={t} arm="reach" label="Платон Каратаев" />
      <Person who="pierre" x={cx - 300} y={820} s={1.1} t={t} label="Пьер" />
      {potato > 0 && (
        <g transform={`translate(${cx - 60} ${600 - potato * 40}) scale(${potato})`}>
          <ellipse rx={36} ry={26} fill="#c99a5a" stroke={C.ink} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-14 + i * 14} cy={-6 + (i % 2) * 10} r={3} fill="#fff" />
          ))}
        </g>
      )}
      <Pop t={t} at={at(c, 1.2)} x={cx + 160} y={190}>
        <Label x={0} y={0} text="«час терпеть, а век жить»" size={36} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── плен: вертикальные прутья, за ними звёзды и луна ──
export const Captivity: React.FC<VisualProps<P & { laugh?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const open = ramp(t, at(c, 1), 2.4);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#141a3a" opacity={0.85} />
      {Array.from({ length: 140 }).map((_, i) => (
        <circle key={i} cx={rnd(i, 101) * 1920} cy={rnd(i, 102) * 760} r={1.5 + rnd(i, 103) * 3 * (0.4 + open)} fill={i % 7 ? "#fff" : C.yellow} opacity={0.4 + 0.5 * open} />
      ))}
      <circle cx={cx + 420} cy={210} r={70} fill="#fff6d8" />
      <path d={`M 0 860 Q ${cx} 760 1920 840 L 1920 1080 L 0 1080 Z`} fill="#232c5c" />
      <Person who="pierre" light x={cx - 60} y={860} s={1.05} t={t} arm={p.laugh && open > 0.3 ? "up" : "down"} arm2={p.laugh && open > 0.3 ? "up" : "down"} label="Пьер" labelColor={C.yellow} />
      {/* прутья расходятся: стены остаются, но не держат */}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = cx - 640 + i * 160;
        const off = (i < 4.5 ? -1 : 1) * open * (260 + i * 10);
        return <rect key={i} x={x + off} y={60} width={22} height={900} rx={8} fill="#3a3f55" stroke="#1a1d2e" strokeWidth={3} opacity={1 - open * 0.55} />;
      })}
      {open > 0.4 && <Label x={cx} y={150} text="«и все это во мне»" size={40} bg="#fff" />}
    </g>
  );
};

// ── живой глобус из капель: капли сливаются и разделяются ──
export const Globe: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const R = 300;
  const merge = ramp(t, at(c, 1), 2);
  const drops = Array.from({ length: 150 }).map((_, i) => {
    const lat = Math.acos(2 * rnd(i, 111) - 1) - Math.PI / 2;
    const lon = rnd(i, 112) * Math.PI * 2 + t * 0.35;
    return { x: Math.cos(lat) * Math.sin(lon) * R, y: Math.sin(lat) * R, z: Math.cos(lat) * Math.cos(lon), i };
  });
  return (
    <g transform={`translate(${cx} 500)`}>
      <circle r={R + 10} fill={dark(p) ? "#1c2456" : "#e3edf7"} stroke={C.violet} strokeWidth={6} />
      {drops
        .filter((d) => d.z > -0.2)
        .sort((a, b) => a.z - b.z)
        .map((d) => {
          const special = d.i === 17;
          const fade = special ? 1 - merge : 1;
          return <circle key={d.i} cx={d.x} cy={d.y} r={(8 + d.z * 8) * (special ? 1.8 : 1) * (0.6 + 0.4 * fade)} fill={special ? C.yellow : C.dots[d.i % 8]} opacity={0.55 + 0.45 * d.z * fade} stroke={special ? C.ink : "none"} strokeWidth={3} />;
        })}
      <Pop t={t} at={at(c, 1.3)} x={0} y={-R - 70}>
        <Label x={0} y={0} text="«разлился и исчез»" size={36} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── ребёнок в карете держится за тесёмочки и думает, что правит ──
export const Carriage: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const roll = t * 60;
  const reveal = ramp(t, at(c, 1), 1);
  return (
    <g>
      <rect x={0} y={800} width={1920} height={60} fill="#c9b38a" />
      {/* лошади-точки: настоящий ход */}
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={i} transform={`translate(${cx + 320 + (i % 2) * 190 + Math.floor(i / 2) * 30} ${700 - Math.floor(i / 2) * 30 + Math.abs(Math.sin(t * 6 + i)) * -10})`} opacity={i > 1 ? 0.8 : 1}>
          {[-40, -20, 24, 44].map((lx, j) => (
            <line key={j} x1={lx} y1={10} x2={lx + Math.sin(t * 9 + i + j * 1.7) * 14} y2={92} stroke="#5a3e28" strokeWidth={11} strokeLinecap="round" />
          ))}
          <ellipse rx={66} ry={34} fill="#7a5a3a" stroke={C.ink} strokeWidth={4} />
          <path d="M 46 -16 L 82 -70 L 112 -60 L 96 -40 L 70 -4 Z" fill="#7a5a3a" stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -64 -8 q -30 10 -36 40" stroke="#4a3220" strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <rect x={cx - 380} y={500} width={600} height={260} rx={40} fill="#2f3f6a" stroke={C.ink} strokeWidth={6} />
      <rect x={cx - 330} y={540} width={500} height={160} rx={20} fill="#e9e1cc" opacity={0.95} />
      {[cx - 280, cx + 120].map((x, i) => (
        <g key={i} transform={`translate(${x} 790) rotate(${roll})`}>
          <circle r={60} fill="none" stroke={C.ink} strokeWidth={10} />
          {[0, 1, 2, 3].map((j) => (
            <line key={j} x1={0} y1={0} x2={0} y2={-56} stroke={C.ink} strokeWidth={6} transform={`rotate(${j * 90})`} />
          ))}
        </g>
      ))}
      {/* тесёмочки внутри */}
      <line x1={cx - 30} y1={560} x2={cx - 70 + Math.sin(t * 3) * 14} y2={640} stroke={C.red} strokeWidth={5} />
      <line x1={cx + 30} y1={560} x2={cx + 50 + Math.sin(t * 3 + 1) * 14} y2={640} stroke={C.red} strokeWidth={5} />
      <Person who="napoleon" x={cx} y={700} s={0.5} t={t} arm="up" arm2="up" />
      <Pop t={t} at={at(c, 0.4)} x={cx - 80} y={420}>
        <Label x={0} y={0} text="«я правлю!»" size={36} bg="#fff" />
      </Pop>
      <g opacity={reveal}>
        <Label x={cx + 470} y={560} text="везут лошади" size={32} bg={C.goldLight} />
      </g>
    </g>
  );
};

// ── градоначальник в лодке упирается шестом в корабль народа ──
export const Ship: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const storm = ramp(t, at(c, 1), 1.5);
  const sway = Math.sin(t * (1 + storm * 2)) * (4 + storm * 10);
  const shipX = cx + 180 + t * 18 * (0.4 + storm);
  return (
    <g>
      <rect x={0} y={620} width={1920} height={460} fill={storm > 0.5 ? "#6d8aa8" : "#9fc0de"} />
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={i} d={`M ${(i * 160 + t * 40) % 2100 - 100} ${660 + (i % 4) * 90} q 40 ${-14 - storm * 20} 80 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />
      ))}
      <g transform={`translate(${shipX} 640) rotate(${sway * 0.3})`}>
        <path d="M -420 0 L 420 0 L 340 140 L -340 140 Z" fill="#7a5a3a" stroke={C.ink} strokeWidth={6} />
        <line x1={0} y1={0} x2={0} y2={-420} stroke={C.ink} strokeWidth={12} />
        <path d="M 10 -400 Q 220 -260 10 -60 Z" fill="#fffaf0" stroke={C.ink} strokeWidth={5} />
        {dotsCloud(40, 0, 50, 300, 40, 121).map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={9} fill={d.c} />
        ))}
      </g>
      <g transform={`translate(${shipX - 700} ${700 + sway})`}>
        <path d="M -90 0 L 90 0 L 60 40 L -60 40 Z" fill="#c99a5a" stroke={C.ink} strokeWidth={4} />
        <Person who="man" x={0} y={0} s={0.45} t={t} arm="reach" />
        <line x1={20} y1={-90} x2={260 - storm * 120} y2={-40 + storm * 80} stroke="#8a5a3a" strokeWidth={8} />
      </g>
      <Pop t={t} at={at(c, 1.2)} x={cx} y={200}>
        <Label x={0} y={0} text="корабль идёт своим ходом" size={36} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── паровоз: «чёрт», колёса или дым? ──
export const Locomotive: React.FC<VisualProps<P & { answers: string[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const x = cx - 200 + Math.sin(t * 0.3) * 20;
  return (
    <g>
      <rect x={0} y={800} width={1920} height={14} fill="#5d4a3a" />
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={(i * 90 - ((t * 120) % 90))} y={812} width={50} height={14} fill="#8a6a4a" />
      ))}
      <g transform={`translate(${x} 0)`}>
        <rect x={-260} y={560} width={420} height={200} rx={20} fill="#2f3f6a" stroke={C.ink} strokeWidth={6} />
        <rect x={160} y={480} width={180} height={280} rx={14} fill="#3a4a7a" stroke={C.ink} strokeWidth={6} />
        <rect x={-200} y={470} width={70} height={100} fill="#2f3f6a" stroke={C.ink} strokeWidth={6} />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={-180 + i * 120} cy={770 - (i === 3 ? 10 : 0)} r={i === 3 ? 60 : 44} fill="#c9d6e3" stroke={C.ink} strokeWidth={6} transform={`rotate(${t * 200} ${-180 + i * 120} ${770 - (i === 3 ? 10 : 0)})`} strokeDasharray="20 10" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => {
          const k = (t * 0.8 + i / 6) % 1;
          return <circle key={i} cx={-165 - k * 300} cy={440 - k * 280} r={30 + k * 60} fill="#fff" stroke="#c9d6e3" strokeWidth={3} opacity={1 - k} />;
        })}
      </g>
      {p.answers.map((a, i) => (
        <Pop key={i} t={t} at={at(c, Math.min(1 + i * 0.33, c.beats.length - 0.2))} x={cx - 540 + i * 360} y={200 + (i % 2) * 80}>
          <Label x={0} y={0} text={a} size={34} bg={i === p.answers.length - 1 ? C.goldLight : "#fff"} />
        </Pop>
      ))}
    </g>
  );
};

// ── конус власти: наверху приказ и оправдание, внизу — дело ──
export const Cone: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = ramp(t, 0.2, 1.2);
  const rows = 7;
  return (
    <g>
      <path d={`M ${cx} 150 L ${cx + 520 * k} 860 L ${cx - 520 * k} 860 Z`} fill={dark(p) ? "#26306a" : "#ffffff"} stroke={C.violet} strokeWidth={6} opacity={0.6} />
      {Array.from({ length: rows }).map((_, r) => {
        const n = 1 + r * r;
        const y = 210 + r * 100;
        const w = (r / (rows - 1)) * 480;
        return Array.from({ length: n }).map((__, i) => {
          const x = cx + (n === 1 ? 0 : -w + (2 * w * i) / (n - 1));
          const show = ramp(t, at(c, Math.min(0.2 + r * 0.15, c.beats.length - 0.2)), 0.5);
          return <circle key={`${r}-${i}`} cx={x} cy={y + Math.sin(t * 2 + i) * (r > 3 ? 3 : 0)} r={r === 0 ? 22 : Math.max(6, 14 - r)} fill={r === 0 ? C.gold : C.dots[(i + r) % 8]} stroke={C.ink} strokeWidth={r === 0 ? 4 : 1.5} opacity={show} />;
        });
      })}
      <Pop t={t} at={at(c, 0.6)} x={cx + 380} y={210}>
        <Label x={0} y={0} text="приказывает, объясняет" size={30} bg="#fff" />
      </Pop>
      <Pop t={t} at={at(c, 1)} x={cx + 380} y={900}>
        <Label x={0} y={0} text="делают тысячи" size={30} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── поднятая рука: свобода и три основания необходимости ──
export const Hand: React.FC<VisualProps<P & { items: string[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const up = ramp(t, at(c, 0.3), 0.6) * (1 - ramp(t, at(c, 0.8), 0.6));
  const bar = ramp(t, at(c, 2), 2);
  return (
    <g>
      <Person who="man" x={cx - 420} y={860} s={1.25} t={t} arm={up > 0.5 ? "up" : "down"} label="я свободен?" labelColor={C.violet} />
      <g transform={`translate(${cx + 160} 0)`}>
        <Card x={-60} y={220} w={720} h={560} fill="#fff" stroke={C.violet} />
        <Txt x={300} y={290} size={34} weight={900} color={C.violet}>
          ЧЕМ БОЛЬШЕ ЗНАЕМ…
        </Txt>
        {p.items.map((it, i) => (
          <Pop key={i} t={t} at={at(c, Math.min(1.6 + i * 0.25, c.beats.length - 0.2))} x={300} y={380 + i * 100}>
            <Label x={0} y={0} text={it} size={30} bg={C.goldLight} />
          </Pop>
        ))}
        <rect x={20} y={700} width={560} height={40} rx={20} fill="#eee" stroke={C.ink} strokeWidth={3} />
        <rect x={20} y={700} width={560 * (1 - bar * 0.8)} height={40} rx={20} fill={C.violet} />
        <Txt x={300} y={770} size={26} weight={800} color={C.inkSoft}>
          …тем меньше видимой свободы
        </Txt>
      </g>
    </g>
  );
};

// ── Коперник: мы не чувствуем движения Земли ──
export const Copernicus: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const flip = ramp(t, at(c, 1), 2);
  const sunX = interpolate(flip, [0, 1], [cx + 380, cx]);
  const earthR = 320;
  const a = t * 0.6;
  const ex = interpolate(flip, [0, 1], [cx, cx + Math.cos(a) * earthR]);
  const ey = interpolate(flip, [0, 1], [520, 520 + Math.sin(a) * earthR * 0.45]);
  return (
    <g>
      <ellipse cx={cx} cy={520} rx={earthR} ry={earthR * 0.45} fill="none" stroke={ink(p)} strokeOpacity={0.4 * flip} strokeWidth={4} strokeDasharray="12 10" />
      <circle cx={sunX} cy={interpolate(flip, [0, 1], [300, 520])} r={90} fill={C.yellow} stroke={C.goldDeep} strokeWidth={8} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1={sunX + Math.cos((i * Math.PI) / 6) * 110} y1={interpolate(flip, [0, 1], [300, 520]) + Math.sin((i * Math.PI) / 6) * 110} x2={sunX + Math.cos((i * Math.PI) / 6) * 140} y2={interpolate(flip, [0, 1], [300, 520]) + Math.sin((i * Math.PI) / 6) * 140} stroke={C.goldDeep} strokeWidth={8} strokeLinecap="round" />
      ))}
      <circle cx={ex} cy={ey} r={56} fill={C.skyDeep} stroke={C.ink} strokeWidth={5} />
      <path d={`M ${ex - 30} ${ey - 10} q 20 -24 40 -6 q 10 20 -16 30 Z`} fill={C.green} />
      <Pop t={t} at={at(c, 0.3)} x={cx - 500} y={200}>
        <Label x={0} y={0} text="«земля стоит» — так кажется" size={30} bg="#fff" />
      </Pop>
      <Pop t={t} at={at(c, 1.4)} x={cx + 420} y={900}>
        <Label x={0} y={0} text="неощущаемая зависимость" size={32} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── сон Николеньки: войско из тонких нитей, впереди — слава ──
export const Threads: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = ramp(t, 0.2, 2);
  return (
    <g>
      {Array.from({ length: 70 }).map((_, i) => {
        const y = 260 + (i % 14) * 44;
        const x0 = cx - 760 + Math.floor(i / 14) * 60;
        return <path key={i} d={`M ${x0} ${y} C ${x0 + 300} ${y - 60 + Math.sin(t + i) * 30}, ${x0 + 700} ${y + 60}, ${x0 + 1100 * k} ${y + Math.sin(t * 0.8 + i) * 40}`} stroke={C.dots[i % 8]} strokeWidth={3} fill="none" opacity={0.7} />;
      })}
      <circle cx={cx + 560} cy={360} r={110} fill="#fff3c4" opacity={0.85} />
      <Txt x={cx + 560} y={372} size={36} weight={900} color={C.goldDeep}>
        СЛАВА
      </Txt>
      <Person who="child" x={cx - 300} y={860} s={1.3} t={t} arm="point" label="Николенька" labelColor={C.gold} />
      <Person who="pierre" x={cx - 520} y={860} s={0.95} t={t} label="Пьер" dim={ramp(t, at(c, 1), 1) > 0.5} />
    </g>
  );
};

// ── комета над Москвой ──
export const Comet: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = ramp(t, at(c, 1), 1.5);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#141a3a" opacity={0.9} />
      {Array.from({ length: 90 }).map((_, i) => (
        <circle key={i} cx={rnd(i, 131) * 1920} cy={rnd(i, 132) * 700} r={1.5 + rnd(i, 133) * 2.5} fill="#fff" opacity={0.6} />
      ))}
      <g opacity={k} transform={`translate(${cx + 300} 250)`}>
        <path d="M 0 0 L -520 -130 L -500 -90 L -540 -40 L -480 -30 Z" fill="#fff6d8" opacity={0.5} />
        <path d="M 0 0 L -420 -60 L -400 -20 Z" fill="#ffe39a" opacity={0.8} />
        <circle r={22} fill="#fff" stroke={C.yellow} strokeWidth={6} />
      </g>
      {/* силуэт Москвы: купола */}
      <path d={`M 0 860 L 0 760 ${Array.from({ length: 12 }).map((_, i) => `L ${i * 160 + 40} 760 Q ${i * 160 + 80} ${700 - (i % 3) * 30} ${i * 160 + 120} 760`).join(" ")} L 1920 760 L 1920 860 Z`} fill="#232c5c" />
      <rect x={0} y={860} width={1920} height={220} fill="#1a2150" />
      <Person who="pierre" light x={cx - 200} y={900} s={1} t={t} label="Пьер" labelColor={C.yellow} />
      <Pop t={t} at={at(c, 1.6)} x={cx + 300} y={430}>
        <Label x={0} y={0} text="комета 1812-го года" size={32} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── дверь: сон Андрея о смерти как пробуждении ──
export const Door: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const push = ramp(t, at(c, 0.3), 2.4);
  const light = ramp(t, at(c, 1), 1.6);
  return (
    <g>
      <rect x={cx - 220} y={160} width={440} height={700} fill="#fff6d8" opacity={0.3 + light * 0.7} />
      <rect x={cx - 240} y={140} width={480} height={740} fill="none" stroke={C.ink} strokeWidth={14} />
      <g transform={`translate(${cx - 220} 160) scale(${1 - push * 0.85} 1)`}>
        <rect x={0} y={0} width={440} height={700} fill="#8a6a4a" stroke={C.ink} strokeWidth={6} />
        <circle cx={390} cy={360} r={14} fill={C.gold} />
      </g>
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={i} x1={cx} y1={510} x2={cx + Math.cos((i * Math.PI) / 8) * 900 * light} y2={510 + Math.sin((i * Math.PI) / 8) * 600 * light} stroke="#ffe39a" strokeWidth={6} opacity={0.35 * light} />
      ))}
      <Pop t={t} at={at(c, 1.2)} x={cx} y={950}>
        <Label x={0} y={0} text="«смерть — пробуждение»" size={36} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── граната вертится на лугу, полк стоит под огнём ──
export const Grenade: React.FC<VisualProps<P>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const spin = t * 400;
  const flash = ramp(t, at(c, 2), 0.25);
  return (
    <g>
      <rect x={0} y={700} width={1920} height={380} fill="#b9c79a" />
      {Array.from({ length: 60 }).map((_, i) => (
        <path key={i} d={`M ${rnd(i, 141) * 1920} ${760 + rnd(i, 142) * 280} l ${wob(t, i, 6)} -26`} stroke="#6f8a4a" strokeWidth={4} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <Person key={i} who="soldier" x={cx - 640 + i * 110} y={760} s={0.42} t={t} />
      ))}
      <Person who="andrei" x={cx + 200} y={860} s={1.05} t={t} label="Андрей" />
      {flash < 0.5 && (
        <g transform={`translate(${cx - 40} 880) rotate(${spin})`}>
          <circle r={26} fill="#3a3f55" stroke={C.ink} strokeWidth={4} />
          <path d="M 0 -26 q 10 -20 0 -40" stroke="#c9d6e3" strokeWidth={6} fill="none" />
        </g>
      )}
      {flash > 0 && <circle cx={cx - 40} cy={860} r={260 * flash} fill="#fff" stroke="#c9d6e3" strokeWidth={4} opacity={1 - flash * 0.6} />}
      <Pop t={t} at={at(c, 1)} x={cx} y={220}>
        <Label x={0} y={0} text="«я люблю жизнь, эту траву, землю…»" size={32} bg="#fff" />
      </Pop>
    </g>
  );
};

export { NameTag, SERIF };
