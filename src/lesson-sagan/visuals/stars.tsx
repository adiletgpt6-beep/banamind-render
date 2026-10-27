// Жизнь звёзд и галактики: пирог «с нуля», синтез в Солнце, нейтрино и их
// загадка, стадии жизни Солнца (без сверхновой), ступени синтеза в массивных
// звёздах и «звезда-гостья» 1054 года, круговорот звёздного вещества, красное
// смещение, расширение без центра, возраст и судьба Вселенной. Схемы упрощены,
// но причинность сохранена; стадии звёзд разной массы не смешиваются.
import React from "react";
import { C } from "../theme";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Earth, Galaxy, Note, Stage, Star, rnd } from "./space";

// атом-кружок с подписью
const Atom: React.FC<{ x: number; y: number; r?: number; color: string; label: string }> = ({ x, y, r = 34, color, label }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill={color} />
    <Txt x={0} y={r * 0.34} size={r * 0.9} color={C.night}>
      {label}
    </Txt>
  </g>
);

// ── s01: пирог с нуля ──
export const ApplePie: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const atoms = pop(t, at(c, 1) + 0.6);
  const star = pop(t, at(c, 2) + 0.4);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={230} y={470}>
        <g>
          <ellipse rx={170} ry={60} cy={40} fill="#c9853f" />
          <ellipse rx={170} ry={60} fill="#e2a95a" />
          {[-80, -20, 40, 100].map((x) => (
            <path key={x} d={`M ${x - 20} -10 q 20 -20 40 0`} fill="none" stroke="#a8622a" strokeWidth={6} />
          ))}
          <Txt x={0} y={150} size={30}>
            яблочный пирог
          </Txt>
        </g>
      </Pop>
      {atoms > 0 && (
        <g opacity={clamp01(atoms)}>
          <Arrow x1={420} y1={470} x2={540} y2={470} k={atoms} color={C.faint} w={6} />
          <g transform={`translate(700 470) scale(${atoms})`}>
            <Atom x={-90} y={-60} color={C.steel} label="C" />
            <Atom x={0} y={-60} color={C.coral} label="O" />
            <Atom x={90} y={-60} color={C.sky} label="H" />
            <Txt x={0} y={40} size={28} color={C.dim}>
              атомы
            </Txt>
          </g>
        </g>
      )}
      {star > 0 && (
        <g opacity={clamp01(star)}>
          <Arrow x1={840} y1={420} x2={920} y2={340} k={star} color={C.amber} w={6} />
          <g transform={`translate(1010 290) scale(${star})`}>
            <Star x={0} y={0} r={70} color={C.amber} />
            <Txt x={0} y={140} size={28}>
              кроме водорода —
            </Txt>
            <Txt x={0} y={180} size={28} color={C.amber}>
              из звёзд
            </Txt>
          </g>
          <Note x={900} y={700} text="водород — со времён Большого взрыва" />
        </g>
      )}
    </Stage>
  );
};

// ── s02: синтез в недрах Солнца ──
export const SunFusion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fuse = ramp(t, 0.6, 2);
  const how = pop(t, at(c, 1) + 0.4);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 470)">
        <circle r={300} fill={C.amber} opacity={0.25} />
        <circle r={210} fill={C.amber} opacity={0.5} />
        <circle r={110} fill="#fff1c4" />
        <Txt x={0} y={-130} size={26} color={C.night}>
          ядро
        </Txt>
      </g>
      <g transform="translate(400 470)">
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + 0.6;
          const r = 80 * (1 - fuse);
          return <Atom key={i} x={Math.cos(a) * r} y={Math.sin(a) * r} r={20} color={C.sky} label="H" />;
        })}
        {fuse > 0.95 && <Atom x={0} y={0} r={34} color={C.yellow} label="He" />}
      </g>
      <Pop t={t} at={1.2} x={1000} y={300}>
        <Tag x={0} y={0} text="водород → гелий" color={C.yellow} size={36} />
      </Pop>
      {how > 0 && (
        <g transform={`translate(1000 500) scale(${how})`}>
          <Panel x={-230} y={-80} w={460} h={160} r={28} />
          <Txt x={0} y={-10} size={30}>
            как заглянуть внутрь?
          </Txt>
          <Txt x={0} y={40} size={28} color={C.dim}>
            свет выходит долго
          </Txt>
        </g>
      )}
      <Note x={400} y={850} text="схема, не в масштабе" />
    </Stage>
  );
};

// ── s03: нейтрино: проходят насквозь, детектор, загадка, развязка ──
export const Neutrinos: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const tank = ramp(t, at(c, 1), 0.8);
  const fewer = ramp(t, at(c, 1) + 3, 0.8);
  const puzzle = pop(t, at(c, 2) + 0.3);
  const answer = ramp(t, at(c, 3) + 0.3, 1);
  const N = 9;
  return (
    <Stage host={c.p.host}>
      <Star x={120} y={260} r={70} color={C.amber} />
      <Earth x={440} y={260} r={70} />
      {Array.from({ length: N }).map((_, i) => {
        const x = 200 + ((t * 220 + i * 110) % 1000);
        const kind = answer > 0 ? i % 3 : 0;
        return <circle key={i} cx={x} cy={240 + (i % 3) * 20} r={7} fill={[C.green, C.violet, C.pink][kind]} />;
      })}
      <Note x={640} y={150} text="проходят сквозь Солнце и Землю" o={ramp(t, 0.8, 0.6)} />
      {tank > 0 && (
        <g opacity={tank} transform="translate(860 520)">
          <rect x={-170} y={-110} width={340} height={220} rx={30} fill={C.deep} stroke={C.steel} strokeWidth={6} />
          <Txt x={0} y={-50} size={28}>
            бак с хлором
          </Txt>
          <Txt x={0} y={0} size={28} color={C.dim}>
            хлор → аргон
          </Txt>
          <g transform="translate(0 60)">
            <rect x={-120} y={-14} width={240} height={28} rx={14} fill="#000" opacity={0.3} />
            <rect x={-120} y={-14} width={240 * (1 - fewer * 0.66)} height={28} rx={14} fill={C.green} />
            <rect x={120 - 2} y={-22} width={4} height={44} fill={C.yellow} />
          </g>
          <Txt x={0} y={140} size={24} color={C.yellow} opacity={fewer}>
            меньше расчёта
          </Txt>
        </g>
      )}
      {puzzle > 0 && answer < 0.5 && (
        <g transform={`translate(330 560) scale(${puzzle})`}>
          <Tag x={0} y={0} text="1980: загадка не решена" color={C.coral} size={32} />
        </g>
      )}
      {answer > 0 && (
        <g opacity={answer}>
          <Panel x={60} y={480} w={540} h={180} r={28} stroke={C.green} />
          <Txt x={330} y={540} size={28}>
            три типа нейтрино
          </Txt>
          <Txt x={330} y={585} size={28}>
            превращаются друг в друга
          </Txt>
          <Txt x={330} y={630} size={24} color={C.dim}>
            по примечанию переводчика
          </Txt>
          <Check x={560} y={520} s={34} k={answer} />
        </g>
      )}
    </Stage>
  );
};

// ── s04: стадии жизни Солнца ──
export const SunLife: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const stages = [
    { label: "Солнце сейчас", r: 50, color: C.amber, beat: 0 },
    { label: "красный гигант", r: 120, color: C.red, beat: 1 },
    { label: "туманность", r: 90, color: C.cyan, beat: 1.4 },
    { label: "белый карлик", r: 18, color: "#eef3ff", beat: 1.8 },
  ];
  const no = pop(t, at(c, 2) + 0.3);
  return (
    <Stage host={c.p.host}>
      {stages.map((s, i) => {
        const k = pop(t, at(c, s.beat) + 0.4);
        if (k <= 0) return null;
        const x = 140 + i * 330;
        return (
          <g key={s.label} transform={`translate(${x} 400) scale(${k})`}>
            {i === 2 ? (
              <g>
                <circle r={s.r} fill="none" stroke={s.color} strokeWidth={14} opacity={0.6} />
                <circle r={10} fill="#fff" />
              </g>
            ) : (
              <Star x={0} y={0} r={s.r} color={s.color} glow={0.6} />
            )}
            <Txt x={0} y={190} size={28}>
              {s.label}
            </Txt>
            {i < 3 && <Arrow x1={140} y1={0} x2={190} y2={0} k={1} w={5} color={C.faint} />}
          </g>
        );
      })}
      {no > 0 && (
        <g transform={`translate(640 740) scale(${no})`}>
          <Tag x={0} y={0} text="сверхновой у Солнца не будет" color={C.yellow} size={34} />
        </g>
      )}
      <Note x={640} y={840} text="размеры условные, сроки — оценки книги" />
    </Stage>
  );
};

// ── s05: ступени синтеза и звезда-гостья ──
export const Forge: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shells = ["H", "He", "C", "O", "Si", "Fe"];
  const cols = [C.sky, C.yellow, C.steel, C.coral, C.violet, C.orange];
  const fit = ramp(t, at(c, 1) + 0.6, 1.2);
  const guest = pop(t, at(c, 2) + 0.4);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 450)">
        {shells.map((e, i) => {
          const k = pop(t, 0.3 + i * 0.45);
          const r = 280 - i * 45;
          return (
            <g key={e} opacity={clamp01(k)}>
              <circle r={r} fill={cols[i]} opacity={0.32 + i * 0.06} stroke={cols[i]} strokeWidth={3} />
              <Txt x={0} y={-r + 34} size={28} color={C.night}>
                {e}
              </Txt>
            </g>
          );
        })}
      </g>
      {fit > 0 && (
        <g opacity={fit} transform="translate(940 300)">
          <Panel x={-260} y={-100} w={520} h={200} r={28} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const h = [120, 90, 40, 60, 30, 50][i];
            return (
              <g key={i}>
                <rect x={-200 + i * 70} y={60 - h} width={34} height={h} rx={6} fill={C.violet} opacity={0.8} />
                <circle cx={-183 + i * 70} cy={60 - h - 4} r={6} fill={C.yellow} />
              </g>
            );
          })}
          <Txt x={0} y={90} size={24} color={C.dim}>
            расчёт (точки) и наблюдение (столбцы)
          </Txt>
        </g>
      )}
      {guest > 0 && (
        <g transform={`translate(940 640) scale(${guest})`}>
          <Panel x={-260} y={-80} w={520} h={160} r={28} stroke={C.amber} />
          <Txt x={0} y={-12} size={30} color={C.amber}>
            1054: «звезда-гостья»
          </Txt>
          <Txt x={0} y={38} size={28}>
            сегодня — Крабовидная туманность
          </Txt>
        </g>
      )}
      <Note x={330} y={860} text="слои массивной звезды — упрощённая схема" />
    </Stage>
  );
};

// ── s06: круговорот звёздного вещества ──
export const StarStuff: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const loop = ramp(t, at(c, 1), 2.4);
  const nodes = [
    { label: "звёзды", x: 640, y: 210 },
    { label: "межзвёздный газ", x: 1000, y: 480 },
    { label: "новые звёзды и планеты", x: 640, y: 740 },
    { label: "мы", x: 280, y: 480 },
  ];
  const atoms = [
    { e: "N", text: "ДНК", color: C.sky },
    { e: "Ca", text: "зубы", color: C.steel },
    { e: "Fe", text: "кровь", color: C.coral },
  ];
  return (
    <Stage host={c.p.host}>
      {nodes.map((n, i) => {
        const k = pop(t, (i === 3 ? 0.3 : at(c, 1)) + (i === 3 ? 0 : i * 0.6));
        if (k <= 0) return null;
        return (
          <g key={n.label} transform={`translate(${n.x} ${n.y}) scale(${k})`}>
            <Panel x={-170} y={-44} w={340} h={88} r={44} stroke={i === 3 ? C.yellow : C.glassLine} />
            <Txt x={0} y={12} size={i === 2 ? 26 : 32} color={i === 3 ? C.yellow : C.text}>
              {n.label}
            </Txt>
          </g>
        );
      })}
      {[0, 1, 2].map((i) => {
        const a = nodes[i];
        const b = nodes[i + 1];
        return <Arrow key={i} x1={a.x + (b.x > a.x ? 120 : -120)} y1={a.y + 50} x2={b.x + (b.x > a.x ? -40 : 40)} y2={b.y - 50} k={clamp01(loop * 3 - i)} color={C.amber} w={5} bend={0.15} />;
      })}
      {atoms.map((a, i) => {
        const k = pop(t, 0.8 + i * 0.6);
        if (k <= 0) return null;
        return (
          <g key={a.e} transform={`translate(${200 + i * 80} ${620}) scale(${k})`}>
            <Atom x={0} y={0} r={30} color={a.color} label={a.e} />
            <Txt x={0} y={64} size={22} color={C.dim}>
              {a.text}
            </Txt>
          </g>
        );
      })}
      <Note x={640} y={480} text="миллиарды лет, много звёзд" o={loop} />
    </Stage>
  );
};

// спектр с тёмными линиями; shift 0…1 — сдвиг к красному
const Spectrum: React.FC<{ x: number; y: number; w: number; shift: number; label?: string }> = ({ x, y, w, shift, label }) => {
  const lines = [0.18, 0.32, 0.55, 0.7];
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`sp-${y}`}>
          <stop offset="0%" stopColor="#7a5cf0" />
          <stop offset="25%" stopColor="#3b9cff" />
          <stop offset="45%" stopColor="#4fdc94" />
          <stop offset="65%" stopColor="#ffd23f" />
          <stop offset="82%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#ff4a4a" />
        </linearGradient>
      </defs>
      <rect width={w} height={60} rx={10} fill={`url(#sp-${y})`} />
      {lines.map((l) => (
        <rect key={l} x={(l + shift * 0.2) * w} y={0} width={6} height={60} fill="#0b1230" />
      ))}
      {label && (
        <text x={-20} y={40} textAnchor="end" fontFamily="Nunito" fontWeight={800} fontSize={26} fill={C.text}>
          {label}
        </text>
      )}
    </g>
  );
};

// ── g01: красное смещение ──
export const Redshift: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const g = [
    { label: "близкая", shift: 0.15 },
    { label: "дальше", shift: 0.5 },
    { label: "далёкая", shift: 1 },
  ];
  const show = ramp(t, at(c, 2), 1.2);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.4} x={340} y={200}>
        <Spectrum x={0} y={0} w={600} shift={0} label="лаборатория" />
      </Pop>
      {g.map((s, i) => {
        const k = pop(t, at(c, 1) + 0.6 + i * 0.5);
        if (k <= 0) return null;
        return (
          <g key={s.label} opacity={clamp01(k)}>
            <Galaxy x={170} y={360 + i * 150} s={0.18 + (2 - i) * 0.06} n={90} dot={2.4} />
            <Spectrum x={340} y={330 + i * 150} w={600} shift={s.shift * show} label={s.label} />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 2) + 1.2} x={640} y={830}>
        <Tag x={0} y={0} text="дальше — сильнее сдвиг к красному" color={C.coral} size={34} />
      </Pop>
    </Stage>
  );
};

// ── g02: расширение без центра и проверка альтернатив ──
export const Expansion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const s = 1 + ramp(t, 0.6, 4) * 0.45;
  const alt = pop(t, at(c, 1) + 0.4);
  const stat = pop(t, at(c, 2) + 0.4);
  const pts = Array.from({ length: 16 }).map((_, i) => ({ x: (rnd(i + 3) - 0.5) * 520, y: (rnd(i + 30) - 0.5) * 380 }));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(360 450)">
        {pts.map((p, i) => (
          <g key={i} transform={`translate(${p.x * s} ${p.y * s})`}>
            <Galaxy x={0} y={0} s={0.17} n={50} dot={3.2} tilt={0.6} />
          </g>
        ))}
        {pts.slice(0, 5).map((p, i) => (
          <line key={i} x1={0} y1={0} x2={p.x * s} y2={p.y * s} stroke={C.yellow} strokeWidth={2} strokeDasharray="6 8" opacity={0.6} />
        ))}
      </g>
      <Pop t={t} at={at(c, 0) + 2} x={360} y={790}>
        <Tag x={0} y={0} text="все удаляются от всех" color={C.sky} size={32} />
      </Pop>
      {alt > 0 && (
        <g transform={`translate(1000 330) scale(${alt})`}>
          <Panel x={-230} y={-90} w={460} h={180} r={28} />
          <Txt x={0} y={-30} size={28}>
            краснеет от тяготения?
          </Txt>
          <Txt x={0} y={20} size={26} color={C.dim}>
            линии — разреженный газ
          </Txt>
          <Txt x={0} y={64} size={30} color={C.coral}>
            не подходит
          </Txt>
        </g>
      )}
      {stat > 0 && (
        <g transform={`translate(1000 600) scale(${stat})`}>
          <Tag x={0} y={0} text="спор решает статистика" color={C.yellow} size={30} />
        </g>
      )}
    </Stage>
  );
};

// ── g03: возраст и судьба Вселенной: 1980 → примечания ──
export const FateOfUniverse: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const age = ramp(t, at(c, 0) + 2.4, 0.8);
  const curve = ramp(t, at(c, 1), 1.6);
  const accel = ramp(t, at(c, 2) + 2, 1.6);
  const W = 640;
  const path = (f: (u: number) => number, k: number) => {
    const ps: string[] = [];
    for (let i = 0; i <= 60 * k; i++) {
      const u = i / 60;
      ps.push(`${560 + u * W},${720 - f(u) * 400}`);
    }
    return ps.join(" ");
  };
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.4} x={260} y={250}>
        <g>
          <Panel x={-220} y={-70} w={440} h={140} r={28} />
          <Txt x={0} y={-8} size={28} color={C.dim}>
            книга, 1980:
          </Txt>
          <Txt x={0} y={40} size={32}>
            10 или 20 млрд лет
          </Txt>
        </g>
      </Pop>
      {age > 0 && (
        <g opacity={age}>
          <Panel x={40} y={360} w={440} h={140} r={28} stroke={C.blue} />
          <Txt x={260} y={420} size={28} color={C.dim}>
            примечание издания:
          </Txt>
          <Txt x={260} y={468} size={32} color={C.sky}>
            ≈ 13,8 млрд лет
          </Txt>
        </g>
      )}
      <line x1={560} y1={720} x2={1220} y2={720} stroke={C.faint} strokeWidth={3} />
      <line x1={560} y1={720} x2={560} y2={280} stroke={C.faint} strokeWidth={3} />
      <Txt x={890} y={770} size={24} color={C.dim}>
        время →
      </Txt>
      <Txt x={540} y={300} size={24} color={C.dim} anchor="end">
        размер
      </Txt>
      {curve > 0 && <polyline points={path((u) => Math.sin(u * Math.PI) * 0.7, curve)} fill="none" stroke={C.coral} strokeWidth={5} strokeDasharray="10 8" />}
      {curve > 0 && <polyline points={path((u) => Math.sqrt(u) * 0.75, curve)} fill="none" stroke={C.sky} strokeWidth={5} strokeDasharray="10 8" />}
      {accel > 0 && <polyline points={path((u) => 0.55 * Math.sqrt(u) + 0.45 * u * u, accel)} fill="none" stroke={C.yellow} strokeWidth={7} />}
      <g opacity={curve}>
        <Txt x={1230} y={420} size={22} color={C.sky} anchor="end">
          вечно?
        </Txt>
        <Txt x={1230} y={700} size={22} color={C.coral} anchor="end">
          сжатие?
        </Txt>
      </g>
      {accel > 0 && (
        <g opacity={accel}>
          <Tag x={890} y={240} text="ускоряется (прим. пер.)" color={C.yellow} size={30} />
        </g>
      )}
      <Note x={890} y={850} text="качественная схема, без масштаба" />
    </Stage>
  );
};

// ── g04: Флатландия: точки на раздуваемом шаре удаляются друг от друга ──
export const Flatland: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const curve = ramp(t, at(c, 1), 1);
  const grow = ramp(t, at(c, 1) + 1.6, 3);
  const R = 140 + grow * 90;
  const dots = Array.from({ length: 9 }).map((_, i) => ({ a: rnd(i + 11) * Math.PI * 2, b: (rnd(i + 21) - 0.5) * 1.6 }));
  return (
    <Stage host={c.p.host}>
      {/* плоский мир */}
      <g opacity={1 - curve * 0.7}>
        <path d="M 120 640 L 520 640 L 600 520 L 200 520 Z" fill={C.deep} stroke={C.sky} strokeWidth={4} />
        <polygon points="300,600 330,560 360,600" fill={C.yellow} />
        <rect x={420} y={565} width={36} height={36} fill={C.coral} />
        <Txt x={360} y={700} size={28} color={C.dim}>
          плоские жители не знают «вверх»
        </Txt>
      </g>
      {curve > 0 && (
        <g opacity={curve} transform="translate(900 430)">
          <circle r={R} fill={C.deep} stroke={C.sky} strokeWidth={4} />
          <ellipse rx={R} ry={R * 0.3} fill="none" stroke={C.faint} strokeWidth={2} />
          {dots.map((d, i) => (
            <circle key={i} cx={Math.cos(d.a) * R * 0.8 * Math.cos(d.b)} cy={Math.sin(d.b) * R * 0.8} r={9} fill={C.yellow} />
          ))}
          <Txt x={0} y={R + 50} size={28}>
            нет ни края, ни центра
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 2) + 1.5} x={640} y={180}>
        <Tag x={0} y={0} text="Большой взрыв — «везде»" color={C.yellow} size={34} />
      </Pop>
      <Note x={640} y={840} text="аналогия, а не форма Вселенной" />
    </Stage>
  );
};
