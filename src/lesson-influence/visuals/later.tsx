// Сцены фильтров 4–7: капли в ухо, символы власти, актёр в роли врача,
// печенье, игрушка за барьером, говядина, щит у дома, звонок в ресторан,
// робот, заразная зевота, синхронность, совет вместо мнения.
import React from "react";
import { C, DISPLAY, FC, FONT } from "../theme";
import { Badge, Card, Jar, Label, OL, Person, Phone, QMark } from "./draw";
import { dotsOf, hash, SH, Swarm } from "./dots";
import { Appear, area, at, clamp01, Cross, Drift, ease, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string };

// ── Капли в ухо: рецепт, сокращение, «а при чём тут ухо?» ──
export const Ear: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const short = ramp(t, at(ctx, 0.5), 0.6);
  const obey = ramp(t, at(ctx, 1), 0.6);
  const ask = ramp(t, at(ctx, 1.6), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g transform={`translate(${cx - 300} 470) rotate(-4)`}>
        <rect x={-210} y={-230} width={420} height={460} rx={18} fill="#fff" stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-160} size={40} color={C.inkSoft}>
          Рецепт
        </Txt>
        <rect x={-170} y={-120} width={340} height={10} rx={5} fill="#d6dbe8" />
        <rect x={-170} y={-90} width={260} height={10} rx={5} fill="#d6dbe8" />
        <text x={0} y={10} fontFamily={DISPLAY} fontWeight={800} fontSize={58} fill={FC.authority.deep} textAnchor="middle">
          {short < 0.5 ? "в правое ухо" : "R ear"}
        </text>
        {short >= 0.5 && (
          <text x={0} y={90} fontFamily={DISPLAY} fontWeight={800} fontSize={58} fill={C.red} textAnchor="middle" opacity={ramp(t, at(ctx, 0.7))}>
            → «Rear»
          </text>
        )}
        <Badge x={150} y={170} s={0.55} />
      </g>
      <Person who="doctor" x={cx + 220} y={960} s={0.8} mood={ask > 0.5 ? "doubt" : "neutral"} pose={obey > 0.5 && ask < 0.5 ? "hold" : "think"} t={t} flip color={FC.authority.color} />
      {obey > 0 && (
        <g opacity={obey}>
          <Label x={cx + 220} y={330} text="назначил врач" size={32} bg={FC.authority.light} border={FC.authority.deep} />
        </g>
      )}
      {ask > 0 && (
        <g opacity={ask} transform={`translate(${cx + 420} 520)`}>
          <QMark x={0} y={0} s={0.9} />
          <Label x={0} y={110} text="при чём тут ухо?" size={30} bg="#fff" />
        </g>
      )}
    </Drift>
  );
};

// ── Символы власти: титул, униформа, костюм; переход на красный ──
export const Symbols: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const prof = ramp(t, at(ctx, 1), 0.8);
  const uni = ramp(t, at(ctx, 2), 0.6);
  const suit = ramp(t, at(ctx, 3), 0.6);
  const phase = suit > 0 ? 3 : uni > 0 ? 2 : prof > 0 ? 1 : 0;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {phase === 0 && (
        <g>
          {[
            { x: cx - 380, el: <Label x={0} y={0} text="звание" size={38} bg={FC.authority.light} border={FC.authority.deep} /> },
            { x: cx, el: <Badge x={0} y={0} s={1.2} /> },
            { x: cx + 380, el: <Label x={0} y={0} text="костюм" size={38} bg={FC.authority.light} border={FC.authority.deep} /> },
          ].map((it, i) => (
            <Appear key={i} t={t} at={at(ctx, 0.1) + i * 0.4} x={it.x} y={520}>
              {it.el}
            </Appear>
          ))}
        </g>
      )}
      {phase === 1 && (
        <g opacity={prof}>
          <Person who="guest" x={cx - 260} y={900} s={0.8} mood="smile" pose="stand" t={t} />
          <Person who="guest" x={cx + 260} y={900 } s={0.8 * (1 + 0.08 * ease(ramp(t, at(ctx, 1.5), 0.8)))} mood="smile" pose="stand" t={t} />
          <Label x={cx - 260} y={330} text="«студент»" size={34} />
          <Label x={cx + 260} y={290} text="«профессор»" size={34} bg={FC.authority.light} border={FC.authority.deep} />
          <line x1={cx + 120} y1={900 - 0.8 * 1.08 * 1.15 * 440} x2={cx + 420} y2={900 - 0.8 * 1.08 * 1.15 * 440} stroke={C.yellow} strokeWidth={5} strokeDasharray="12 10" opacity={ramp(t, at(ctx, 1.6))} />
          <line x1={cx - 400} y1={900 - 0.8 * 1.15 * 440} x2={cx - 120} y2={900 - 0.8 * 1.15 * 440} stroke="#fff" strokeWidth={5} strokeDasharray="12 10" opacity={ramp(t, at(ctx, 1.6))} />
          <Txt x={cx + 420} y={900 - 0.8 * 1.08 * 1.15 * 440 - 20} size={34} color={C.yellow} anchor="start">
            «выше»
          </Txt>
        </g>
      )}
      {phase === 2 && (
        <g opacity={uni}>
          <Person who="officer" x={cx - 340} y={900} s={0.85} mood="neutral" pose="point" t={t} />
          <g transform={`translate(${cx + 220} 520)`}>
            <Txt x={-180} y={-150} size={36} color="#fff">
              ожидали
            </Txt>
            <Txt x={180} y={-150} size={36} color="#fff">
              на деле
            </Txt>
            {[63, 92].map((v, i) => {
              const k = ramp(t, at(ctx, 2.2) + i * 0.6, 1);
              const pts = dotsOf(`uni-${i}`, SH.rect(260, 260), 0, 0, ["#fff"], 26, 160).slice(0, 100);
              return (
                <g key={i} transform={`translate(${i ? 180 : -180} 40)`}>
                  {pts.map((q, d) => (
                    <circle key={d} cx={q.x} cy={q.y} r={10} fill={d < v * k ? (i ? C.yellow : "#b9c4ff") : "#ffffff"} fillOpacity={d < v * k ? 1 : 0.15} stroke={OL} strokeOpacity={0.35} strokeWidth={1.4} />
                  ))}
                  <Txt x={0} y={200} size={56} color={i ? C.yellow : "#fff"}>
                    {`${Math.round(v * k)} %`}
                  </Txt>
                </g>
              );
            })}
          </g>
        </g>
      )}
      {phase === 3 && (
        <g opacity={suit}>
          {/* светофор и переход */}
          <g transform={`translate(${cx - 520} 300)`}>
            <rect x={-40} y={-90} width={80} height={180} rx={20} fill="#2b2f52" stroke={OL} strokeWidth={4} />
            <circle cy={-45} r={26} fill={C.red} />
            <circle cy={30} r={26} fill="#3a4a3a" />
            <rect x={-8} y={90} width={16} height={520} fill="#4a5070" />
          </g>
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={cx - 420 + i * 150} y={860} width={90} height={40} fill="#fff" opacity={0.8} />
          ))}
          <Person who="boss" x={cx - 220 + ramp(t, at(ctx, 3.2), 3) * 420} y={860} s={0.7} mood="neutral" pose="walk" t={t} />
          {[0, 1, 2].map((i) => {
            const k = ramp(t, at(ctx, 3.4) + i * 0.4, 3);
            return <Person key={i} who={(["anna", "student", "neighbor"] as const)[i]} x={cx - 420 - i * 90 + k * 420} y={880} s={0.55} mood="smile" pose="walk" t={t} seed={i} opacity={clamp01(k * 4)} />;
          })}
          <Txt x={cx + 300} y={360} size={64} color={C.yellow}>
            ×3
          </Txt>
          <Txt x={cx + 300} y={410} size={30} color="#fff">
            за «костюмом»
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Актёр в роли врача: телевизор, халат-костюм на вешалке, «я не врач» ──
export const Actor: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const coat = ramp(t, at(ctx, 1), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={cx - 380} y={250} width={760} height={480} rx={30} fill="#2b2f52" stroke={OL} strokeWidth={6} />
      <rect x={cx - 350} y={280} width={700} height={420} rx={16} fill="#dfe9ff" />
      <Person who="doctor" x={cx - 100} y={690} s={0.75} mood="smile" pose="hold" t={t} color={FC.authority.color} item={<rect x={-26} y={-34} width={52} height={68} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />} />
      <g transform={`translate(${cx + 170} 390)`}>
        <rect x={-150} y={-56} width={300} height={112} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
        <text x={0} y={-8} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
          «Я не врач,
        </text>
        <text x={0} y={30} fontFamily={FONT} fontWeight={900} fontSize={30} fill={C.ink} textAnchor="middle">
          но играю врача»
        </text>
      </g>
      {coat > 0 && (
        <g opacity={coat}>
          {/* халат «отделяется» от человека — это костюм, а не знание */}
          <g transform={`translate(${cx + 470 + coat * 20} ${560})`}>
            <path d="M 0 -200 L 0 -170" stroke={OL} strokeWidth={6} />
            <path d="M -60 -170 Q 0 -200 60 -170" stroke={OL} strokeWidth={6} fill="none" />
            <path d="M -80 -160 L 80 -160 L 100 120 L -100 120 Z" fill="#fff" stroke={OL} strokeWidth={5} />
            <path d="M -20 -160 L 0 -60 L 20 -160" fill={FC.authority.light} stroke={OL} strokeWidth={4} />
            <Label x={0} y={170} text="образ ≠ знание" size={30} bg={C.yellow} />
          </g>
        </g>
      )}
    </Drift>
  );
};

// ── Печенье: ваза 10 и ваза 2, затем 10 → 2 «разобрали» ──
export const Cookies: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const swap = ramp(t, at(ctx, 1.4), 1.2);
  const n = Math.round(10 - 8 * swap);
  const hearts = ramp(t, at(ctx, 1), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Appear t={t} at={at(ctx, 0.2)} x={cx - 320} y={800}>
        <Jar x={0} y={0} n={n} s={1.3} />
        <Txt x={0} y={90} size={40} color="#fff">
          {n === 10 ? "10 штук" : swap < 1 ? "…" : "было 10 — стало 2"}
        </Txt>
      </Appear>
      <Appear t={t} at={at(ctx, 0.6)} x={cx + 320} y={800}>
        <Jar x={0} y={0} n={2} s={1.3} />
        <Txt x={0} y={90} size={40} color="#fff">
          2 штуки
        </Txt>
      </Appear>
      {hearts > 0 && (
        <g opacity={hearts}>
          {[0, 1, 2].map((i) => (
            <path key={i} d="M 0 18 C -40 -10 -22 -44 0 -20 C 22 -44 40 -10 0 18 Z" transform={`translate(${cx + 260 + i * 60} ${300 + wob(t, i, 6)}) scale(1.2)`} fill={FC.scarcity.color} stroke={OL} strokeWidth={3} />
          ))}
        </g>
      )}
      {swap > 0.8 && (
        <g opacity={ramp(t, at(ctx, 1.6), 0.6)}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d="M 0 18 C -40 -10 -22 -44 0 -20 C 22 -44 40 -10 0 18 Z" transform={`translate(${cx - 440 + i * 60} ${300 + wob(t, i + 3, 6)}) scale(1.2)`} fill={FC.scarcity.color} stroke={OL} strokeWidth={3} />
          ))}
          <Label x={cx - 320} y={220} text="«разобрали!»" size={32} bg={FC.scarcity.light} border={FC.scarcity.deep} />
        </g>
      )}
    </Drift>
  );
};

// ── Игрушка за барьером: низкий барьер — без разницы; высокий — тянутся к недоступной ──
export const Toddler: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const high = ramp(t, at(ctx, 1), 0.8);
  const reach = ramp(t, at(ctx, 1.2), 1.2);
  const wallH = 70 + 220 * high;
  const toy = (x: number, color: string) => (
    <g transform={`translate(${x} 840)`}>
      <rect x={-46} y={-80} width={92} height={80} rx={14} fill={color} stroke={OL} strokeWidth={4} />
      <circle cx={-20} cy={-50} r={10} fill="#fff" />
      <circle cx={20} cy={-50} r={10} fill="#fff" />
      <rect x={-8} y={-110} width={16} height={30} fill={OL} />
      <circle cy={-118} r={12} fill={C.red} stroke={OL} strokeWidth={3} />
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={a.x0 + 40} y={840} width={a.x1 - a.x0 - 80} height={20} rx={8} fill="#c9cfe0" opacity={0.6} />
      {toy(cx - 140, FC.social.color)}
      {toy(cx + 330, FC.scarcity.color)}
      {/* прозрачный барьер */}
      <rect x={cx + 200} y={840 - wallH} width={22} height={wallH} rx={8} fill="#e8f4ff" fillOpacity={0.5} stroke="#fff" strokeWidth={4} />
      <Person who="kid" x={cx - 380 + reach * 380} y={850} s={0.95} mood={reach > 0.5 ? "happy" : "think"} pose={reach > 0.6 ? "give" : "stand"} t={t} />
      <Appear t={t} at={at(ctx, 1.2)} x={cx} y={280}>
        <Txt x={0} y={0} size={64} color={C.yellow}>
          в 3 раза быстрее
        </Txt>
      </Appear>
      <Appear t={t} at={at(ctx, 1.6)} x={cx + 300} y={420}>
        <Label x={0} y={0} text="запрет → желаннее" size={32} bg={FC.scarcity.light} border={FC.scarcity.deep} />
      </Appear>
    </Drift>
  );
};

// ── Говядина: обычное предложение ×1, «скоро не будет» ×2, «эксклюзивно» ×6; «вы можете отказаться» ──
export const Beef: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const free = ramp(t, at(ctx, 2), 0.7);
  const rows = [
    { label: "обычное предложение", v: 1, at: at(ctx, 0.1) },
    { label: "«скоро будет мало»", v: 2, at: at(ctx, 0.7) },
    { label: "«эксклюзивно: мало кто знает»", v: 6, at: at(ctx, 1.3) },
  ];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g opacity={1 - free * 0.85}>
        {rows.map((r, i) => {
          const k = ramp(t, r.at, 0.5);
          if (k <= 0) return null;
          const y = 320 + i * 170;
          return (
            <g key={i} opacity={k}>
              <text x={cx - 160} y={y + 14} fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff" textAnchor="end" stroke={OL} strokeWidth={6} paintOrder="stroke">
                {r.label}
              </text>
              {Array.from({ length: r.v }).map((_, j) => {
                const kj = clamp01((t - r.at - 0.2) * 4 - j);
                return (
                  <g key={j} transform={`translate(${cx - 90 + j * 110} ${y}) scale(${0.5 + 0.5 * kj})`} opacity={kj}>
                    <rect x={-46} y={-40} width={92} height={80} rx={18} fill="#d9625a" stroke={OL} strokeWidth={4} />
                    <path d="M -30 -10 Q 0 -30 30 -10 Q 10 10 -30 -10" fill="#f2c0b0" />
                  </g>
                );
              })}
              <Txt x={cx - 90 + r.v * 110} y={y + 18} size={48} color={i === 2 ? C.yellow : "#fff"} anchor="start">
                {`×${r.v}`}
              </Txt>
            </g>
          );
        })}
      </g>
      {free > 0 && (
        <g opacity={free} transform={`translate(${cx} 520)`}>
          <Card x={0} y={-60} w={820} h={130} lines={["«Конечно, делайте как хотите»"]} size={44} fill="#fff" edge={FC.scarcity.color} />
          <Txt x={0} y={110} size={44} color={C.yellow}>
            согласие более чем ×2
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Щит у дома: маленькая табличка → огромный щит ──
export const Sign: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const small = ramp(t, at(ctx, 1), 0.6);
  const big = ramp(t, at(ctx, 1.4), 0.9);
  const house = (x: number, s: number) => (
    <g transform={`translate(${x} 860) scale(${s})`}>
      <rect x={-150} y={-220} width={300} height={220} fill="#f2e2c4" stroke={OL} strokeWidth={5} />
      <path d="M -180 -210 L 0 -340 L 180 -210 Z" fill="#c9604a" stroke={OL} strokeWidth={5} />
      <rect x={-40} y={-120} width={80} height={120} fill="#8a5a3c" stroke={OL} strokeWidth={4} />
      <rect x={-120} y={-170} width={60} height={50} fill="#cfe2ff" stroke={OL} strokeWidth={3} />
      <rect x={60} y={-170} width={60} height={50} fill="#cfe2ff" stroke={OL} strokeWidth={3} />
    </g>
  );
  const sign = (x: number, w: number, h: number, txt: string, size: number) => (
    <g transform={`translate(${x} 860)`}>
      <rect x={-6} y={-h - 60} width={12} height={h + 60} fill="#8a5a3c" />
      <rect x={-w / 2} y={-h - 60} width={w} height={h} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
      <text x={0} y={-60 - h / 2 + size * 0.35} fontFamily={FONT} fontWeight={900} fontSize={size} fill={C.ink} textAnchor="middle">
        {txt}
      </text>
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {house(cx - 280, 1)}
      {house(cx + 300, 1)}
      <Appear t={t} at={at(ctx, 0.2)} x={0} y={0}>
        {sign(cx - 280, 440, 200, "ВЕДИТЕ ОСТОРОЖНО", 34)}
      </Appear>
      <Cross x={cx - 280} y={760} s={150} k={ramp(t, at(ctx, 0.7))} />
      <Appear t={t} at={at(ctx, 0.6)} x={cx - 280} y={340}>
        <Txt x={0} y={0} size={52} color="#fff">
          83 % — «нет»
        </Txt>
      </Appear>
      {small > 0 && <g opacity={small * (1 - big * 0.4)}>{sign(cx + 160, 120, 60, "осторожно", 18)}</g>}
      {big > 0 && <g opacity={big}>{sign(cx + 300, 440 * big, 200 * big, "ВЕДИТЕ ОСТОРОЖНО", 34 * big)}</g>}
      <Appear t={t} at={at(ctx, 1.6)} x={cx + 300} y={340}>
        <Txt x={0} y={0} size={52} color={C.yellow}>
          76 % — «да»
        </Txt>
      </Appear>
    </Drift>
  );
};

// ── Ресторан: администратор спрашивает и ждёт ответа; неявки 30 → 10 ──
export const Restaurant: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const yes = ramp(t, at(ctx, 0.8), 0.5);
  const stat = ramp(t, at(ctx, 1.1), 1.2);
  const tables = 10;
  const empty = Math.round(3 - 2 * stat);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Phone x={cx - 400} y={520} s={1.3}>
        <rect x={-94} y={-166} width={188} height={84} rx={16} fill={FC.commit.light} />
        {["Вы позвоните нам,", "если планы", "изменятся?"].map((ln, i) => (
          <text key={i} x={0} y={-136 + i * 22} fontFamily={FONT} fontWeight={900} fontSize={19} fill={C.ink} textAnchor="middle">
            {ln}
          </text>
        ))}
        {yes > 0 && (
          <g opacity={yes}>
            <rect x={-40} y={-60} width={130} height={60} rx={16} fill={FC.commit.color} />
            <text x={25} y={-20} fontFamily={DISPLAY} fontWeight={800} fontSize={32} fill="#fff" textAnchor="middle">
              Да!
            </text>
          </g>
        )}
      </Phone>
      {/* столики: красные — неявка */}
      {Array.from({ length: tables }).map((_, i) => {
        const x = cx + 30 + (i % 5) * 130;
        const y = 420 + Math.floor(i / 5) * 200;
        const isEmpty = i < empty;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx={0} cy={30} rx={50} ry={16} fill="#000" opacity={0.12} />
            <ellipse cx={0} cy={0} rx={52} ry={22} fill="#fff" stroke={OL} strokeWidth={4} />
            <rect x={-6} y={0} width={12} height={40} fill="#8a5a3c" />
            {isEmpty ? <Cross x={0} y={-50} s={44} k={1} /> : <circle cx={0} cy={-56} r={22} fill={["#ffb03b", "#8fb6ff", "#ff9fbf", "#7be0a4"][i % 4]} stroke={OL} strokeWidth={3} />}
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 1.1)} x={cx + 290} y={300}>
        <Txt x={0} y={0} size={56} color={C.yellow}>
          неявки: 30 % → 10 %
        </Txt>
      </Appear>
    </Drift>
  );
};

// ── Робот: строгая угроза → потом тянет к роботу; мягкая просьба → своё решение ──
const Robot: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-180} width={120} height={120} rx={16} fill="#9aa3c0" stroke={OL} strokeWidth={4} />
    <rect x={-40} y={-56} width={80} height={56} rx={10} fill="#7a83a0" stroke={OL} strokeWidth={4} />
    <circle cx={-24} cy={-130} r={14} fill={C.yellow} stroke={OL} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 4)} />
    <circle cx={24} cy={-130} r={14} fill={C.yellow} stroke={OL} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 4)} />
    <rect x={-30} y={-90} width={60} height={10} rx={4} fill={OL} />
    <line x1={0} y1={-180} x2={0} y2={-210} stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-214} r={8} fill={C.red} />
  </g>
);
export const RobotScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const four = ramp(t, at(ctx, 0.2), 0.6);
  const strict = ramp(t, at(ctx, 1), 0.6);
  const mild = ramp(t, at(ctx, 2), 0.6);
  const words = ["сам выбрал", "сказал вслух", "постарался"];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {strict <= 0 && (
        <g opacity={four}>
          {words.map((w, i) => (
            <Appear key={w} t={t} at={at(ctx, 0.2) + i * 0.5} x={cx - 420 + i * 420} y={520}>
              <circle r={130} fill={FC.commit.light} stroke={FC.commit.deep} strokeWidth={6} />
              <Txt x={0} y={14} size={40}>
                {w}
              </Txt>
            </Appear>
          ))}
        </g>
      )}
      {strict > 0 && (
        <g>
          <g opacity={strict} transform={`translate(${cx - 330} 0)`}>
            <Robot x={0} y={860} s={1.7} t={t} />
            <Label x={0} y={300} text="строгая угроза" size={32} bg="#ffd0c8" />
            <Txt x={0} y={430} size={64} color="#fff">
              77 %
            </Txt>
            <Txt x={0} y={474} size={28} color="#fff">
              потом выбрали робота
            </Txt>
          </g>
          <g opacity={mild} transform={`translate(${cx + 330} 0)`}>
            <Robot x={0} y={860} s={1.7} t={t} />
            <Label x={0} y={300} text="мягкая просьба" size={32} bg={FC.commit.light} border={FC.commit.deep} />
            <Txt x={0} y={430} size={64} color={C.yellow}>
              33 %
            </Txt>
            <Txt x={0} y={474} size={28} color="#fff">
              решили сами
            </Txt>
          </g>
        </g>
      )}
    </Drift>
  );
};

// ── Заразная зевота: родные → друзья → знакомые → незнакомцы (кольца «близости») ──
export const Yawn: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const rings = [
    { r: 120, label: "родные", k: 1, c: FC.unity.color },
    { r: 230, label: "друзья", k: 0.7, c: "#ffd57a" },
    { r: 340, label: "знакомые", k: 0.45, c: "#ffe6ad" },
    { r: 450, label: "незнакомцы", k: 0.2, c: "#fff3d6" },
  ];
  const wave = ((t - at(ctx, 0.2)) % 3) / 3;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {[...rings].reverse().map((r, i) => (
        <circle key={i} cx={cx} cy={540} r={r.r * 0.86} fill={r.c} fillOpacity={0.25} stroke={r.c} strokeWidth={5} opacity={ramp(t, at(ctx, 0.1) + (3 - i) * 0.3)} />
      ))}
      {rings.map((r, i) => {
        const k = ramp(t, at(ctx, 0.15) + i * 0.6, 0.5);
        const yawning = r.k > hash(Math.floor(t / 3) + i, 2) * 0.9 && Math.abs(wave - i * 0.18) < 0.2;
        return (
          <g key={i} opacity={k}>
            {[0, 1].map((j) => {
              const ang = -Math.PI / 2 + (j ? 0.45 : -0.45) + i * 0.6;
              const x = cx + Math.cos(ang) * (r.r * 0.86 - 50);
              const y = 540 + Math.sin(ang) * (r.r * 0.86 - 50);
              return (
                <g key={j} transform={`translate(${x} ${y})`}>
                  <circle r={34} fill={C.skin} stroke={OL} strokeWidth={4} />
                  <path d={yawning ? "M -10 -10 L -2 -8 M 10 -10 L 2 -8" : "M -14 -8 L -6 -8 M 6 -8 L 14 -8"} stroke={OL} strokeWidth={4} strokeLinecap="round" />
                  <ellipse cy={12} rx={yawning ? 10 : 8} ry={yawning ? 14 : 2} fill={OL} />
                </g>
              );
            })}
            {i > 0 && <Label x={cx + [0, 0, 0, 1][i] * r.r * 0.86} y={540 + [0, 1, -1, 0][i] * r.r * 0.86} text={r.label} size={28} bg="#fff" />}
          </g>
        );
      })}
      <Label x={cx} y={540} text="родные" size={28} bg={C.yellow} />
    </Drift>
  );
};

// ── Синхронность: два метронома в такт / не в такт, затем точки-пары помогают ──
export const Sync: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const stats = ramp(t, at(ctx, 1), 0.6);
  const tap = (x: number, phase: number, label: string, c: string) => (
    <g transform={`translate(${x} 520) scale(1.5)`}>
      {[-90, 90].map((dx, i) => {
        const ph = t * 4 + (i ? phase : 0);
        const up = Math.max(0, Math.sin(ph));
        return (
          <g key={i} transform={`translate(${dx} 0)`}>
            <rect x={-70} y={60} width={140} height={20} rx={8} fill="#8a5a3c" />
            <circle cx={0} cy={40 - up * 60} r={26} fill={c} stroke={OL} strokeWidth={4} />
            {up < 0.1 && <circle cx={0} cy={60} r={44} fill="none" stroke="#fff" strokeWidth={4} opacity={0.6} />}
          </g>
        );
      })}
      <Label x={0} y={170} text={label} size={32} />
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {tap(cx - 340, 0, "в такт", FC.unity.color)}
      {tap(cx + 340, 1.9, "не в такт", "#9aa3c0")}
      {stats > 0 && (
        <g opacity={stats}>
          <Txt x={cx - 340} y={350} size={70} color={C.yellow}>
            49 %
          </Txt>
          <Txt x={cx + 340} y={350} size={70} color="#fff">
            18 %
          </Txt>
          <Txt x={cx} y={250} size={36} color="#fff">
            остались помочь партнёру
          </Txt>
        </g>
      )}
      <Appear t={t} at={at(ctx, 1.6)} x={cx} y={170}>
        <Label x={0} y={0} text="дети пели вместе → помогали чаще более чем в 3 раза" size={30} bg={FC.unity.light} border={FC.unity.deep} />
      </Appear>
    </Drift>
  );
};

// ── Совет вместо мнения: «Ваше мнение?» → человек в стороне; «Ваш совет?» → рисуют вместе ──
export const Cocreate: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const advice = ramp(t, at(ctx, 0.6), 0.6);
  const build = ramp(t, at(ctx, 1), 2);
  const pts = dotsOf("cocreate-house", SH.union(SH.move(SH.rect(260, 180), 0, 60), SH.strokes([[-150, -30, 0, -150, 150, -30]], 50)), cx, 470, [FC.unity.color, FC.unity.deep, "#fff0c2", FC.recip.color], 15, 220);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Person who="anna" x={cx - 440} y={960} s={0.75} mood={advice > 0.5 ? "happy" : "neutral"} pose={advice > 0.5 ? "point" : "stand"} t={t} />
      <Person who="neighbor" x={cx + 440} y={960} s={0.75} mood="smile" pose={advice > 0.5 ? "give" : "stand"} t={t} flip />
      <g opacity={1 - advice}>
        <Label x={cx - 200} y={300} text="«Ваше мнение?»" size={36} />
      </g>
      <g opacity={advice}>
        <Label x={cx - 200} y={250} text="«Ваш совет?»" size={36} bg={C.yellow} />
      </g>
      <Swarm pts={pts} k={build} t={t} r={7} from="below" />
      <Appear t={t} at={at(ctx, 1.2)} x={cx} y={760}>
        <Label x={0} y={0} text="построили вместе — значит, наше" size={32} bg={FC.unity.light} border={FC.unity.deep} />
      </Appear>
    </Drift>
  );
};

