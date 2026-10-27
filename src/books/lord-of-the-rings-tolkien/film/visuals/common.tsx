// Общие экспонаты музея: кнопка «решить всё», кольцо-зеркало, коридор шести линз,
// предупреждение, табличка зала, цитата, гипотеза (зачёркивается контрпримером),
// весы, триада, три вывода и финальная заставка BanaMind.
import React from "react";
import { interpolate } from "remotion";
import { BRAND } from "../../../../banamind/brand";
import { C, DISPLAY, SERIF } from "../theme";
import { Figure, Label, OL, Ring } from "./figures";
import { Arrow, Check, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// центр «сцены» экспоната — в стороне от ведущего
export const cxOf = (p: { host?: unknown }) => (p.host === "right" ? 820 : p.host === "left" ? 1110 : p.host === "corner" ? 1040 : 960);

type P = { host?: string; [k: string]: unknown };

// ── кнопка, которая «решит всё» ──
export const ButtonOffer: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.1);
  const probs = ["войны", "голод", "несправедливость"];
  const vanish = ramp(t, at(c, 0.6), 0.9);
  const crown = pop(t, at(c, 1.2));
  const press = interpolate(Math.sin(t * 3), [-1, 1], [0, 10]);
  return (
    <g>
      {probs.map((w, i) => {
        const a = pop(t, at(c, 0.15 + i * 0.12));
        const x = cx - 440 + i * 440;
        const bw = w.length * 22 + 80;
        return (
          <g key={w} transform={`translate(${x} ${200 + (i % 2) * 40}) scale(${a * (1 - vanish * 0.6)})`} opacity={1 - vanish}>
            <rect x={-bw / 2} y={-50} width={bw} height={90} rx={45} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={12} size={38} color={C.inkSoft}>
              {w}
            </Txt>
          </g>
        );
      })}
      {vanish > 0.2 &&
        [0, 1, 2].map((i) => (
          <path key={i} d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill={C.gold} transform={`translate(${cx - 420 + i * 420} ${210}) scale(${vanish * (1 + 0.3 * Math.sin(t * 5 + i))})`} opacity={1 - ramp(t, at(c, 1), 0.5)} />
        ))}
      <g transform={`translate(${cx} 640) scale(${k})`}>
        <ellipse cx={0} cy={70} rx={250} ry={50} fill="#000" opacity={0.08} />
        <rect x={-230} y={-10} width={460} height={110} rx={30} fill="#d9cfbb" stroke={OL} strokeWidth={6} />
        <ellipse cx={0} cy={-10 + press} rx={180} ry={70} fill={C.red} stroke={OL} strokeWidth={6} />
        <ellipse cx={-50} cy={-30 + press} rx={60} ry={20} fill="#fff" opacity={0.35} />
        <Txt x={0} y={6 + press} size={40} weight={900} color="#fff">
          РЕШИТЬ ВСЁ
        </Txt>
      </g>
      {crown > 0 && (
        <g transform={`translate(${cx} 420) scale(${crown})`}>
          <path d="M -120 40 L -120 -40 L -60 0 L 0 -70 L 60 0 L 120 -40 L 120 40 Z" fill={C.gold} stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          <Txt x={0} y={110} size={40} weight={900}>
            вся власть — у вас
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── кольцо-зеркало: в отражении — соблазны ──
export const RingMirror: React.FC<VisualProps<P & { words?: string[]; dim?: boolean }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const words = p.words ?? [];
  const dim = p.dim ? ramp(t, at(c, 0.4), 2.5) : 0;
  const k = pop(t, 0.05);
  const R = 250;
  return (
    <g>
      <g transform={`translate(${cx} 470) scale(${k})`}>
        <circle r={R - 40} fill={dim > 0.5 ? "#e9e3d6" : "#f3f7fb"} opacity={0.9} />
        {/* отражения-соблазны по кругу внутри зеркала */}
        {words.map((w, i) => {
          const a = ramp(t, at(c, Math.min(2, 1 + i * 0.25)), 0.5);
          const gx = (i % 2 ? 1 : -1) * 92 + wob(t, i, 3);
          const gy = (i < 2 ? -50 : 60) + wob(t * 0.8, i + 2, 3);
          return (
            <g key={w} transform={`translate(${gx} ${gy})`} opacity={a * (1 - dim)}>
              <Txt x={0} y={12} size={34} weight={900} color={i % 3 ? C.goldDeep : C.inkSoft}>
                {w}
              </Txt>
            </g>
          );
        })}
        {!words.length && (
          <Txt x={0} y={14} size={44} weight={800} color={C.inkSoft} opacity={dim}>
            пустой круг
          </Txt>
        )}
        <Ring x={0} y={0} r={R} glow={1} t={t} dim={dim} />
      </g>
    </g>
  );
};

// ── маленький против большого ──
export const SmallVsBig: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const g = ramp(t, 0.2, 1);
  const h = pop(t, at(c, 0.3));
  return (
    <g>
      {/* горы силы — абстрактные пики */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${cx - 700 + i * 380} 860 L ${cx - 520 + i * 380} ${300 + (i % 2) * 90} L ${cx - 320 + i * 380} 860 Z`} fill={["#c9bfae", "#b5aa96", "#d6ccba"][i]} opacity={g} />
      ))}
      <rect x={cx - 760} y={856} width={1520} height={12} rx={6} fill="#a99d86" opacity={g} />
      {h > 0 && (
        <g transform={`translate(0 ${(1 - h) * 40})`} opacity={h}>
          <Figure kind="hobbit" x={cx + 300} y={858} s={0.9} t={t} label="Фродо" mood="calm" />
          <Figure kind="sam" x={cx + 430} y={858} s={0.9} t={t} label="Сэм" mood="happy" />
        </g>
      )}
      <Pop t={t} at={at(c, 1)} x={cx + 365} y={560}>
        <Txt x={0} y={0} size={150} weight={900} color={C.goldDeep}>
          ?
        </Txt>
      </Pop>
    </g>
  );
};

// ── коридор музея: шесть линз-книг ──
export const Museum: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const n = 6;
  const romans = ["I", "II", "III", "IV", "V", "VI"];
  const light = Math.floor(clamp01((t - at(c, 1)) / Math.max(1, at(c, 2) - at(c, 1))) * n);
  const chips = ["ценность", "соблазн", "цена"];
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const x = cx - 560 + i * 224;
        const a = pop(t, 0.15 + i * 0.12);
        const on = i < light || ramp(t, at(c, 2), 0.4) > 0.5;
        return (
          <g key={i} transform={`translate(${x} 420) scale(${a})`}>
            <rect x={-80} y={-200} width={160} height={340} rx={80} fill={on ? "#fff6d6" : "#fff"} stroke={OL} strokeWidth={5} />
            <circle cx={0} cy={-60} r={52} fill="none" stroke={on ? C.gold : C.stoneDeep} strokeWidth={16} />
            {on && <circle cx={0} cy={-60} r={78} fill={C.goldLight} opacity={0.35 + 0.15 * Math.sin(t * 2 + i)} />}
            <Txt x={0} y={90} size={48} weight={900} color={on ? C.goldDeep : C.inkSoft}>
              {romans[i]}
            </Txt>
          </g>
        );
      })}
      <Txt x={cx} y={150} size={44} weight={900} color={C.ink} opacity={ramp(t, 0.3)}>
        Музей искушений
      </Txt>
      {chips.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 2 + i * 0.25)} x={cx - 360 + i * 360} y={760}>
          <rect x={-150} y={-46} width={300} height={84} rx={42} fill={[C.green, C.gold, C.coral][i]} />
          <Txt x={0} y={12} size={40} weight={900} color="#fff">
            {w}
          </Txt>
          {i < 2 && <Arrow x1={160} y1={-4} x2={200} y2={-4} k={1} color={C.inkSoft} w={8} />}
        </Pop>
      ))}
    </g>
  );
};

// ── предупреждение: формат, спойлеры, имена перевода ──
export const Notice: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const rows = [
    { icon: "?", text: "Расследование, а не пересказ" },
    { icon: "!", text: "Спойлеры, включая финал" },
    { icon: "Аа", text: "Имена — как в нашем переводе" },
  ];
  const names = ["Горлум", "Сэм Скромби", "Скальбург", "Ристания"];
  return (
    <g>
      {rows.map((r, i) => (
        <Pop key={i} t={t} at={at(c, i) + 0.1} x={cx} y={220 + i * 150}>
          <rect x={-520} y={-58} width={1040} height={116} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
          <circle cx={-450} cy={0} r={40} fill={[C.sky, C.coral, C.gold][i]} />
          <Txt x={-450} y={14} size={40} weight={900} color="#fff">
            {r.icon}
          </Txt>
          <Txt x={-380} y={14} size={42} anchor="start">
            {r.text}
          </Txt>
        </Pop>
      ))}
      {names.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 2.45 + i * 0.12)} x={cx - 390 + i * 260} y={720}>
          <rect x={-120} y={-38} width={240} height={70} rx={35} fill={C.goldLight} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={10} size={30} weight={900}>
            {w}
          </Txt>
        </Pop>
      ))}
    </g>
  );
};

// ── табличка нового зала: дверь музея открывается ──
export const HallCard: React.FC<VisualProps<P & { n: string; title: string; sub: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const open = ramp(t, 0.15, 0.9);
  const k = pop(t, 0.05);
  return (
    <g>
      <g transform={`translate(${cx} 560) scale(${0.85 + 0.1 * k})`}>
        {/* арка */}
        <path d="M -330 330 L -330 -150 Q 0 -420 330 -150 L 330 330 Z" fill="#fff8e6" stroke={OL} strokeWidth={6} />
        <path d="M -270 330 L -270 -120 Q 0 -350 270 -120 L 270 330 Z" fill={C.goldLight} opacity={0.5 + 0.5 * open} />
        {/* створки */}
        <path d={`M -270 330 L -270 -120 Q -135 -235 0 -260 L 0 330 Z`} fill="#c99a5a" stroke={OL} strokeWidth={5} transform={`translate(${-270 * open} 0) scale(${1 - open * 0.75} 1)`} />
        <path d={`M 270 330 L 270 -120 Q 135 -235 0 -260 L 0 330 Z`} fill="#c99a5a" stroke={OL} strokeWidth={5} transform={`translate(${270 * open} 0) scale(${1 - open * 0.75} 1)`} />
        <g opacity={ramp(t, 0.5, 0.5)}>
          <Txt x={0} y={-60} size={36} weight={800} color={C.inkSoft}>
            ЗАЛ
          </Txt>
          <Txt x={0} y={70} size={150} weight={900} color={C.goldDeep}>
            {p.n}
          </Txt>
        </g>
      </g>
      <g opacity={ramp(t, 0.6, 0.5)} transform={`translate(0 ${(1 - ramp(t, 0.6, 0.5)) * 20})`}>
        <text x={cx} y={170} fontFamily={DISPLAY} fontSize={72} fill={C.ink} textAnchor="middle">
          {p.title}
        </text>
        <Txt x={cx} y={245} size={36} weight={800} color={C.inkSoft}>
          {p.sub}
        </Txt>
      </g>
    </g>
  );
};

// ── цитата-экспонат (короткая, со ссылкой на место в книге) ──
export const Quote: React.FC<VisualProps<P & { text: string; who: string; ref: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const lines = p.text.split("\n");
  const k = pop(t, 0.1);
  const reveal = ramp(t, 0.3, 1.2);
  const w = Math.min(1180, Math.max(Math.max(...lines.map((l) => l.length)) * 34 + 200, p.who.length * 19 + 120));
  return (
    <g>
      <g transform={`translate(${cx} 420) scale(${k}) rotate(${wob(t * 0.3, 1, 0.6)})`}>
        <rect x={-w / 2 + 10} y={-190} width={w} height={380} rx={30} fill="#000" opacity={0.08} />
        <rect x={-w / 2} y={-200} width={w} height={380} rx={30} fill="#fffdf6" stroke={OL} strokeWidth={5} />
        <text x={-w / 2 + 40} y={-90} fontFamily={SERIF} fontWeight={700} fontSize={160} fill={C.gold} opacity={0.6}>
          «
        </text>
        {lines.map((l, i) => (
          <text key={i} x={0} y={-30 + i * 76 - (lines.length - 1) * 30} fontFamily={SERIF} fontWeight={700} fontSize={60} fill={C.ink} textAnchor="middle" opacity={clamp01(reveal * lines.length - i)}>
            {l}
          </text>
        ))}
        <line x1={-140} y1={100} x2={140} y2={100} stroke={C.gold} strokeWidth={5} opacity={reveal} />
        <Txt x={0} y={150} size={34} weight={800} color={C.inkSoft} opacity={reveal}>
          {p.who}
        </Txt>
      </g>
      <g opacity={ramp(t, 0.9, 0.5)}>
        <Label x={cx} y={720} text={p.ref} size={28} bg={C.goldLight} />
      </g>
    </g>
  );
};

// ── гипотеза на доске: перечёркивается контрпримером из книги ──
export const Hypothesis: React.FC<VisualProps<P & { claim: string; counter: string; ref: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  const crossK = ramp(t, at(c, 1.3), 0.7);
  const counterK = pop(t, at(c, 1.5));
  return (
    <g>
      <g transform={`translate(${cx} 330) scale(${k})`}>
        <rect x={-460} y={-200} width={920} height={360} rx={26} fill="#2f5a4a" stroke="#6b4a2a" strokeWidth={18} />
        <Txt x={0} y={-120} size={34} weight={800} color="#cfe6d8">
          ГИПОТЕЗА
        </Txt>
        <g opacity={1 - crossK * 0.45}>
          {p.claim.split("\n").map((l, i) => (
            <Txt key={i} x={0} y={-30 + i * 70} size={58} weight={800} color="#fff">
              {l}
            </Txt>
          ))}
        </g>
        {crossK > 0 && <line x1={-380} y1={10} x2={-380 + 760 * crossK} y2={-10 - 40 * crossK} stroke={C.coral} strokeWidth={16} strokeLinecap="round" />}
      </g>
      {counterK > 0 && (
        <g transform={`translate(${cx} 720) scale(${counterK})`}>
          <rect x={-420} y={-90} width={840} height={180} rx={30} fill="#fff" stroke={C.greenDeep} strokeWidth={6} />
          {p.counter.split("\n").map((l, i) => (
            <Txt key={i} x={30} y={-14 + i * 60} size={48} weight={900} color={C.greenDeep}>
              {l}
            </Txt>
          ))}
          <Check x={-340} y={0} s={46} k={ramp(t, at(c, 1.6), 0.5)} />
          <Label x={300} y={-90} text={p.ref} size={24} bg={C.goldLight} />
        </g>
      )}
    </g>
  );
};

// ── весы: два довода ──
export const Scales: React.FC<VisualProps<P & { left: string; right: string; tilt?: "left" | "right" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const k = pop(t, 0.1);
  const tiltK = ramp(t, at(c, 1.1), 1.2);
  const ang = (p.tilt === "left" ? -1 : 1) * 12 * tiltK + wob(t, 2, 1.2);
  const L = 360;
  const rad = (ang * Math.PI) / 180;
  const lx = -Math.cos(rad) * L;
  const ly = -Math.sin(rad) * L;
  const rx = Math.cos(rad) * L;
  const ry = Math.sin(rad) * L;
  const Pan: React.FC<{ x: number; y: number; text: string; color: string; show: number }> = ({ x, y, text, color, show }) => (
    <g transform={`translate(${x} ${y})`}>
      <line x1={-110} y1={140} x2={0} y2={0} stroke={OL} strokeWidth={4} />
      <line x1={110} y1={140} x2={0} y2={0} stroke={OL} strokeWidth={4} />
      <path d="M -150 140 Q 0 220 150 140 Z" fill={color} stroke={OL} strokeWidth={5} />
      <g opacity={show}>
        {text.split("\n").map((l, i) => (
          <Txt key={i} x={0} y={-60 + i * 50 - 40} size={42} weight={900} color={C.ink}>
            {l}
          </Txt>
        ))}
      </g>
    </g>
  );
  return (
    <g transform={`translate(${cx} 260) scale(${k})`}>
      <rect x={-14} y={0} width={28} height={560} fill="#b08a4a" stroke={OL} strokeWidth={4} />
      <path d="M -160 580 L 160 580 L 100 520 L -100 520 Z" fill="#b08a4a" stroke={OL} strokeWidth={4} />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OL} strokeWidth={16} strokeLinecap="round" />
      <circle r={26} fill={C.gold} stroke={OL} strokeWidth={4} />
      <Pan x={lx} y={ly} text={p.left} color="#e6d3b8" show={ramp(t, at(c, 0.3))} />
      <Pan x={rx} y={ry} text={p.right} color={C.goldLight} show={ramp(t, at(c, 1))} />
    </g>
  );
};

// ── триада понятий: красивая вывеска и «мелкий шрифт» ──
export const Triad: React.FC<VisualProps<P & { title: string; items: string[]; cost: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const costK = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <Txt x={cx} y={190} size={54} weight={900} color={C.ink} opacity={ramp(t, 0.1)}>
        {p.title}
      </Txt>
      {p.items.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 0.35 + i * 0.15)} x={cx - 400 + i * 400} y={420}>
          <path d="M -150 120 L -150 -60 Q 0 -150 150 -60 L 150 120 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={-150} y={120} width={300} height={22} fill={C.stoneDeep} stroke={OL} strokeWidth={4} />
          <circle cx={0} cy={-10} r={44} fill={[C.sky, C.violet, C.green][i % 3]} opacity={0.9} />
          <Txt x={0} y={90} size={44} weight={900}>
            {w}
          </Txt>
        </Pop>
      ))}
      <g opacity={costK} transform={`translate(${cx} ${720 + (1 - costK) * 20})`}>
        <rect x={-430} y={-50} width={860} height={92} rx={20} fill="#fff4ec" stroke={C.coral} strokeWidth={4} strokeDasharray="14 10" />
        <Txt x={0} y={12} size={40} weight={800} color={C.rust}>
          {p.cost}
        </Txt>
      </g>
    </g>
  );
};

// ── три вывода BanaMind ──
export const Recap: React.FC<VisualProps<P & { items: string[] }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  return (
    <g>
      <Txt x={cx} y={150} size={50} weight={900} opacity={ramp(t, 0.2)}>
        Три вывода BanaMind
      </Txt>
      {p.items.map((w, i) => {
        const a = pop(t, at(c, 1 + i));
        const active = t >= at(c, 1 + i) && t < at(c, 2 + i) + 0.3;
        return (
          <g key={i} transform={`translate(${cx - 520 + i * 520} 470) scale(${a * (active ? 1.06 : 1)})`} opacity={clamp01(a * 1.5)}>
            <rect x={-230} y={-210} width={460} height={430} rx={34} fill={active ? "#fff7da" : "#fff"} stroke={active ? C.goldDeep : OL} strokeWidth={active ? 8 : 4} />
            <circle cx={0} cy={-120} r={56} fill={[C.green, C.gold, C.coral][i]} />
            <Txt x={0} y={-100} size={60} weight={900} color="#fff">
              {String(i + 1)}
            </Txt>
            {w.split("\n").map((l, j) => (
              <Txt key={j} x={0} y={20 + j * 58} size={44} weight={900}>
                {l}
              </Txt>
            ))}
          </g>
        );
      })}
    </g>
  );
};

// ── финальная заставка: знак BanaMind, вопрос ──
export const EndCard: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const s = ramp(t, 0.8, 0.8);
  return (
    <g>
      <g transform={`translate(${cx} 330) scale(${k})`}>
        <text x={0} y={0} fontFamily={DISPLAY} fontSize={150} textAnchor="middle">
          <tspan fill={BRAND.ink}>{BRAND.wordmark[0]}</tspan>
          <tspan fill={C.goldDeep}>{BRAND.wordmark[1]}</tspan>
        </text>
        <Txt x={0} y={90} size={40} weight={800} color={C.inkSoft} opacity={s}>
          Большие идеи. Простыми словами.
        </Txt>
      </g>
      <g opacity={ramp(t, 1.2, 0.8)}>
        <Ring x={cx - 500} y={540} r={60} glow={0.3} t={t} dim={0.7} />
        <Ring x={cx + 500} y={540} r={60} glow={0.3} t={t} dim={0.7} />
        <Txt x={cx} y={560} size={44} weight={900} color={C.ink}>
          А что бы выбрали вы?
        </Txt>
      </g>
    </g>
  );
};

