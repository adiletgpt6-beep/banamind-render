// Часть «Польза людям»: просьба о помощи и несправедливость бездействием (IX),
// отговорка «я занят» (I), лоза-лошадь-пчела (V), улей и пчела (VI, XI),
// отсечённая и привитая ветвь (XI), достоинства близких (VI), глаз не требует платы (IX).
import React from "react";
import { Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Bee, Big, Hero, Hive, Horse, OL, Person, QuoteCard, Vine } from "./draw";

type VP = VisualProps<{ host?: string }>;

const Box: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-60} y={-50} width={120} height={100} rx={6} fill="#c98b4a" stroke={OL} strokeWidth={5} />
    <path d="M -60 -20 L 60 -20 M 0 -50 L 0 -20" stroke={OL} strokeWidth={4} />
    <rect x={-24} y={-50} width={48} height={30} fill="#e8c27a" opacity={0.6} />
  </g>
);

// ── s01: соседка с коробками; герой проходит мимо / останавливается; «бездействие тоже» ──
export const PassBy: React.FC<VP> = (c) => {
  const { t } = c;
  const walk = clamp01((t - at(c, 1)) / 1.6);
  const stop = ramp(t, at(c, 2), 0.6);
  const hx = 560 + walk * 380 * (1 - stop * 0.4);
  const wobble = Math.sin(t * 3) * 6;
  return (
    <g>
      <rect x={0} y={780} width={1920} height={20} fill={R.grey} opacity={0.5} />
      <g transform="translate(1260 780)">
        <Person x={0} y={0} s={1.25} color={R.purple} t={t} arms={0.8} />
        <Box x={0} y={-210 + wobble} s={0.9} rot={wobble * 0.5} />
        <Box x={-10} y={-300 + wobble * 1.4} s={0.75} rot={-wobble} />
        <path d="M -44 -170 q -10 -20 -30 -14" stroke={OL} strokeWidth={3} fill="none" />
        <Txt x={60} y={-380} size={34} weight={900} color={C.inkSoft} opacity={0.6 + 0.4 * Math.sin(t * 4)}>
          уф…
        </Txt>
      </g>
      <Hero x={hx} y={790} s={0.38} t={t} pose={stop > 0.5 ? "point" : walk > 0 ? "shrug" : "idle"} mood={stop > 0.5 ? "serious" : "confused"} flip={false} />
      {walk > 0 && stop < 1 && (
        <g opacity={(1 - stop) * clamp01(walk * 3)}>
          <Tag x={hx} y={430} text="я ничего плохого не делаю…" size={30} color="#fff" />
        </g>
      )}
      {stop > 0 && (
        <g transform={`translate(960 210) scale(${stop})`}>
          <Panel x={-460} y={-60} w={920} h={120} r={60} fill={C.yellow} />
          <Txt x={0} y={-6} size={34} weight={900}>
            несправедливость бывает и
          </Txt>
          <Txt x={0} y={36} size={34} weight={900}>
            бездействием
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── s02: стопка «неотложных дел»-отговорок рассыпается; император с огромной картой ──
export const BusyExcuse: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const fall = ramp(t, at(c, 1), 1.2);
  const notes = ["я занят", "срочно!", "потом", "нет времени", "дела"];
  return (
    <g>
      {notes.map((n, i) => {
        const k = pop(t, 0.3 + i * 0.25);
        if (k <= 0) return null;
        const fx = (i - 2) * 220 * fall;
        const fy = fall * (380 - i * 30) + Math.sin(fall * 3 + i) * 30 * fall;
        return (
          <g key={n} transform={`translate(${cx + fx} ${640 - i * 92 + fy}) rotate(${(i % 2 ? 4 : -4) + fall * (i - 2) * 25}) scale(${k})`} opacity={1 - fall * 0.5}>
            <rect x={-160} y={-40} width={320} height={80} rx={10} fill={["#fff3a8", "#ffd3c2", "#d9f2e3", "#e3dcff", "#cdeaff"][i]} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={36} weight={900}>
              {n}
            </Txt>
          </g>
        );
      })}
      {fall > 0.3 && (
        <g opacity={ramp(t, at(c, 1.2), 0.6)}>
          <g transform={`translate(${cx} 330)`}>
            <rect x={-260} y={-130} width={520} height={260} rx={20} fill="#f3ead2" stroke={OL} strokeWidth={5} />
            <path d="M -230 40 Q -120 -40 0 20 T 230 -20" stroke="#7cc0ec" strokeWidth={14} fill="none" />
            {[-150, -40, 80, 180].map((dx, i) => (
              <circle key={i} cx={dx} cy={-50 + (i % 2) * 70} r={10} fill={R.terracotta} />
            ))}
            <Txt x={0} y={-150} size={34} weight={900}>
              у него — целая империя
            </Txt>
          </g>
          <Hero x={cx + 360} y={820} s={0.3} t={t} pose="shrug" mood="joy" />
        </g>
      )}
    </g>
  );
};

// ── s03: три типа людей → лоза, лошадь, пчела; «не кричит об этом» ──
export const VineHorseBee: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const nobody = ramp(t, 0.2, 0.6) * (1 - ramp(t, at(c, 1), 0.5));
  const types = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2), 0.5));
  const nature = ramp(t, at(c, 2), 0.6);
  const quiet = ramp(t, at(c, 3), 0.6);
  const third = ramp(t, at(c, 4), 0.6);
  return (
    <g>
      {nobody > 0 && (
        <g opacity={nobody}>
          <Hero x={cx - 120} y={760} s={0.4} t={t} pose="shrug" mood="confused" />
          <g transform={`translate(${cx + 200} 560)`}>
            <rect x={-60} y={-50} width={120} height={100} rx={6} fill="#c98b4a" stroke={OL} strokeWidth={5} />
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${cx - 380 + i * 380} 260)`}>
              <circle r={36} fill="#ffd9b0" stroke={OL} strokeWidth={4} />
              <rect x={-30} y={-6} width={60} height={20} rx={4} fill={C.ink} />
            </g>
          ))}
          <Txt x={cx} y={180} size={34} weight={900} color={C.inkSoft}>
            никто не заметил
          </Txt>
        </g>
      )}
      {types > 0 && (
        <g opacity={types}>
          {[
            { t: "«спасибо мне!»", c: "#ffd3c2" },
            { t: "молча: «ты мне должен»", c: "#e3dcff" },
          ].map((it, i) => (
            <g key={i} transform={`translate(${cx - 230 + i * 460} 460) scale(${pop(t, at(c, 1.2 + i * 0.4))})`}>
              <Person x={0} y={120} s={1.2} color={[C.coral, R.purple][i]} t={t} />
              <Tag x={0} y={-130} text={it.t} size={28} color={it.c} />
            </g>
          ))}
        </g>
      )}
      {nature > 0 && (
        <g opacity={nature * (1 - third * 0.85)}>
          <g transform={`translate(${cx - 380} 760) scale(${pop(t, at(c, 2.1))})`}>
            <Vine x={0} y={0} s={1} t={t} grapes={[1, ramp(t, at(c, 2.3), 0.6), ramp(t, at(c, 2.5), 0.6)]} />
          </g>
          <g transform={`translate(${cx + ((t * 120) % 500) - 250} 770) scale(${pop(t, at(c, 2.5))})`}>
            <Horse x={0} y={0} s={0.9} t={t} />
          </g>
          <g transform={`translate(${cx + 380} 360) scale(${pop(t, at(c, 2.7))})`}>
            <Bee x={Math.cos(t * 2) * 60} y={Math.sin(t * 3) * 30} s={2.2} t={t} />
          </g>
          {quiet > 0 && (
            <g transform={`translate(${cx} 170) scale(${quiet})`}>
              <Big x={0} y={0} text="«…не кричит об этом»" size={52} serif />
            </g>
          )}
        </g>
      )}
      {third > 0 && (
        <g opacity={third} transform={`translate(${cx} 470)`}>
          {["добро сделано", "добро получено"].map((w, i) => (
            <g key={w} transform={`translate(${(i - 1) * 330 + 0} 0)`}>
              <Tag x={0} y={0} text={w} size={32} color={C.yellow} />
              <Check x={0} y={70} s={30} k={1} />
            </g>
          ))}
          <g transform="translate(330 0)" opacity={0.5 + 0.5 * Math.sin(t * 4)}>
            <Tag x={0} y={0} text="ещё и слава?" size={32} color="#ffd3c2" />
            <Txt x={0} y={90} size={60} weight={900} color={C.red}>
              ?
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

// ── s04: улей и пчела; польза улью ↔ польза пчеле ──
export const HiveBee: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = pop(t, 0.3);
  const glow = ramp(t, at(c, 1), 0.8);
  const part = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <QuoteCard x={cx} y={110} w={940} k={ramp(t, 0.4, 0.6)} text={"Не приносящее пользы улью –\nне принесет пользы и пчеле."} refText="Книга VI" size={40} />
      <g transform={`translate(${cx} 800) scale(${k})`}>
        <Hive x={0} y={0} s={1.2} glow={glow} />
      </g>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = t * (0.8 + i * 0.1) + i;
        const r = 260 + (i % 3) * 40;
        return <Bee key={i} x={cx + Math.cos(a) * r} y={580 + Math.sin(a) * r * 0.35} s={1} t={t + i} rot={Math.cos(a) > 0 ? 0 : 180} />;
      })}
      {glow > 0 && (
        <g opacity={glow}>
          <Arrow2 x1={cx - 420} y1={560} x2={cx - 180} y2={600} />
          <Arrow2 x1={cx + 180} y1={600} x2={cx + 420} y2={560} />
          <Tag x={cx - 480} y={500} text="я помог" size={28} color="#fff" />
          <Tag x={cx + 480} y={500} text="и мне польза" size={28} color={C.yellow} />
        </g>
      )}
      {part > 0 && <Tag x={cx} y={430} text="часть общего улья" size={32} color={C.yellow} />}
    </g>
  );
};

const Arrow2: React.FC<{ x1: number; y1: number; x2: number; y2: number }> = ({ x1, y1, x2, y2 }) => (
  <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={C.inkSoft} strokeWidth={6} strokeDasharray="12 10" />
);

// ── s05: ветвь отсекается от соседней — и от всего дерева; прививка, срастание ──
export const BranchGraft: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const cut = ramp(t, at(c, 0.4), 0.8);
  const graft = ramp(t, at(c, 1), 1.2);
  const off = cut * (1 - graft);
  const bx = cx + 160 + off * 160;
  const by = 330 + off * 300;
  const rot = off * 50;
  return (
    <g>
      <path d={`M ${cx - 80} 820 Q ${cx - 60} 600 ${cx - 40} 300`} stroke="#8a5a2b" strokeWidth={50} fill="none" strokeLinecap="round" />
      <path d={`M ${cx - 50} 520 Q ${cx - 260} 470 ${cx - 400} 380`} stroke="#8a5a2b" strokeWidth={22} fill="none" strokeLinecap="round" />
      {[[cx - 400, 360], [cx - 300, 330], [cx - 60, 270], [cx + 20, 230], [cx - 130, 230]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={70} fill="#5aa64a" stroke={OL} strokeWidth={4} opacity={0.9} />
      ))}
      <g transform={`translate(${bx} ${by}) rotate(${rot})`}>
        <path d="M -180 0 Q -80 -20 120 -60" stroke="#8a5a2b" strokeWidth={20} fill="none" strokeLinecap="round" />
        <circle cx={120} cy={-80} r={60} fill={off > 0.5 ? "#b6c26a" : "#5aa64a"} stroke={OL} strokeWidth={4} />
        <circle cx={40} cy={-60} r={44} fill={off > 0.5 ? "#b6c26a" : "#5aa64a"} stroke={OL} strokeWidth={4} />
      </g>
      {cut > 0 && graft < 0.3 && <Tag x={cx + 360} y={760} text="отрезал себя от всех" size={30} color="#ffd3c2" />}
      {graft > 0.6 && (
        <g opacity={ramp(t, at(c, 1.2), 0.6)}>
          <rect x={cx - 30} y={318} width={60} height={30} rx={8} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <Tag x={cx + 340} y={760} text="можно срастись снова" size={30} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── s06: «звёздочки» достоинств над людьми рядом ──
export const VirtuesNotice: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ppl = [
    { x: -380, color: C.skyDeep, v: "деловитость" },
    { x: -130, color: R.olive, v: "скромность" },
    { x: 130, color: C.coral, v: "щедрость" },
    { x: 380, color: R.purple, v: "здоровается первой" },
  ];
  return (
    <g>
      {ppl.map((p, i) => {
        const k = pop(t, i < 3 ? at(c, 0.3 + i * 0.2) : at(c, 1.2));
        return (
          <g key={i}>
            <Person x={cx + p.x} y={700} s={1.2} color={p.color} t={t + i} />
            {k > 0 && (
              <g transform={`translate(${cx + p.x} ${420 + wob(t, i, 8)}) scale(${k})`}>
                <path d="M 0 -50 L 14 -16 L 50 -14 L 22 8 L 32 44 L 0 24 L -32 44 L -22 8 L -50 -14 L -14 -16 Z" fill={C.yellow} stroke={OL} strokeWidth={4} />
                <Tag x={0} y={-100} text={p.v} size={26} color="#fff" />
              </g>
            )}
          </g>
        );
      })}
      <Pop t={t} at={0.3} x={cx} y={150}>
        <Big x={0} y={0} text="заметить достоинства" size={52} />
      </Pop>
    </g>
  );
};

// ── s07: глаз и ноги требуют платы? (смешно) — счёт перечёркнут ──
export const EyeFeet: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const bill = ramp(t, at(c, 0.4), 0.6);
  const no = ramp(t, at(c, 0.85), 0.5);
  const bold = ramp(t, at(c, 1), 0.6);
  const look = Math.sin(t * 1.5) * 14;
  return (
    <g>
      <g opacity={1 - bold * 0.75}>
        <g transform={`translate(${cx - 220} 420)`}>
          <ellipse rx={150} ry={90} fill="#fff" stroke={OL} strokeWidth={6} />
          <circle cx={look} r={56} fill={C.skyDeep} />
          <circle cx={look} r={26} fill={OL} />
          <circle cx={look + 16} cy={-18} r={10} fill="#fff" />
          {bill > 0 && (
            <g transform={`translate(160 -120) scale(${bill}) rotate(8)`}>
              <rect x={-90} y={-60} width={180} height={120} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-10} size={28} weight={900}>
                счёт:
              </Txt>
              <Txt x={0} y={30} size={26}>
                «за то, что вижу»
              </Txt>
            </g>
          )}
        </g>
        <g transform={`translate(${cx + 240} 560)`}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 40} ${Math.sin(t * 5 + sd) * 14})`}>
              <path d="M 0 -160 L 0 0 L 50 0" stroke={OL} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
          {bill > 0 && (
            <g transform={`translate(0 -240) scale(${bill}) rotate(-6)`}>
              <rect x={-90} y={-50} width={180} height={100} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={26}>
                «за то, что хожу»
              </Txt>
            </g>
          )}
        </g>
        {no > 0 && (
          <g opacity={no}>
            <line x1={cx - 520} y1={250} x2={cx + 520} y2={700} stroke={C.red} strokeWidth={14} strokeLinecap="round" opacity={0.7} />
          </g>
        )}
      </g>
      {bold > 0 && (
        <g transform={`translate(${cx} 500) scale(${bold})`}>
          <Hero x={0} y={160} s={0.36} t={t} pose="cheer" mood="joy" />
          <Tag x={0} y={-160} text="делать смело — пересуды не помеха" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};
