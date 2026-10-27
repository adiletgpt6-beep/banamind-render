// Схемы группы d: «вы изменитесь», невозвратные затраты, билет в парк, разные игры,
// соблазн пессимизма, истории в головах, пазл картины мира, итоги, исповедь автора,
// пять шагов на неделю, прощание BanaMind. Всё зависит только от времени сцены.
import React from "react";
import { C, FONT } from "../theme";
import { Chair, Heart, OL, Person, Sun, Tree, Worker } from "./draw";
import { Bridge, Coin, CoinStack, Cottage, Flag, Jar, Key, Scales, Shield, Watch } from "./props";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, zoneX, type VisualProps } from "./kit";

// ───────────── мелкие рисованные детали этой группы ─────────────

// бегун: ноги и руки качаются, phase — фаза шага, lean — наклон вперёд
const Runner: React.FC<{ x: number; y: number; s?: number; phase: number; color: string; lean?: number; sad?: boolean; bib?: string }> = ({ x, y, s = 1, phase, color, lean = 8, sad, bib }) => {
  const a = Math.sin(phase) * 32;
  const leg = (ang: number) => `M 0 -6 L ${Math.sin((ang * Math.PI) / 180) * 44} ${Math.cos((ang * Math.PI) / 180) * 44 - 6}`;
  return (
    <g transform={`translate(${x} ${y - Math.abs(Math.cos(phase)) * 6}) scale(${s}) rotate(${lean})`}>
      <path d={`${leg(a)} ${leg(-a)}`} stroke={OL} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d={`M -10 -64 L ${-10 - Math.sin(phase) * 34} -30 M 10 -64 L ${10 + Math.sin(phase) * 34} -30`} stroke={OL} strokeWidth={9} strokeLinecap="round" />
      <rect x={-28} y={-82} width={56} height={78} rx={22} fill={color} stroke={OL} strokeWidth={4} />
      {bib && <rect x={-18} y={-66} width={36} height={26} rx={4} fill="#fff" stroke={OL} strokeWidth={2} />}
      <circle cx={0} cy={-110} r={28} fill="#f2c79b" stroke={OL} strokeWidth={4} />
      <circle cx={-2} cy={-114} r={4} fill={OL} />
      <circle cx={14} cy={-114} r={4} fill={OL} />
      <path d={sad ? "M -2 -94 Q 8 -102 18 -94" : "M -2 -100 Q 8 -91 18 -100"} stroke={OL} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

// маленький трактор
const Tractor: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-90} y={-70} width={150} height={56} rx={10} fill={C.red} stroke={OL} strokeWidth={5} />
    <rect x={-80} y={-150} width={70} height={84} rx={8} fill="#bfe6ff" stroke={OL} strokeWidth={5} />
    <rect x={30} y={-108} width={14} height={40} fill={OL} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={37 + Math.sin(t * 2 + i) * 6} cy={-124 - i * 22 - ((t * 20) % 22)} r={8 + i * 3} fill="#c9d3e0" opacity={0.6 - i * 0.15} />
    ))}
    <g transform={`translate(-50 0) rotate(${t * 90})`}>
      <circle r={44} fill="#2b2b3a" stroke={OL} strokeWidth={5} />
      <circle r={18} fill={C.yellow} />
      <rect x={-3} y={-42} width={6} height={18} fill="#c9d3e0" />
    </g>
    <g transform={`translate(52 14) rotate(${t * 160})`}>
      <circle r={26} fill="#2b2b3a" stroke={OL} strokeWidth={5} />
      <circle r={10} fill={C.yellow} />
    </g>
  </g>
);

// облачко: mood 1 — солнечное, 0 — грозовое
const Cloud: React.FC<{ x: number; y: number; s?: number; mood: number; t: number }> = ({ x, y, s = 1, mood, t }) => {
  const fill = mood > 0.5 ? "#ffffff" : "#7d879c";
  return (
    <g transform={`translate(${x + wob(t, x, 3)} ${y}) scale(${s})`}>
      {mood > 0.5 && <Sun x={44} y={-34} r={26} t={t} />}
      <path d="M -70 20 Q -90 -14 -54 -24 Q -46 -62 -6 -54 Q 20 -80 50 -50 Q 90 -50 82 -10 Q 100 20 66 26 Z" fill={fill} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      {mood <= 0.5 && <path d="M 4 24 L -12 56 L 6 56 L -6 86" stroke={C.yellow} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
};

// мини-банан (покупатель билета)
const MiniBanana: React.FC<{ x: number; y: number; s?: number; t: number; walk?: number }> = ({ x, y, s = 1, t, walk = 0 }) => {
  const step = Math.sin(t * 9) * 14 * walk;
  return (
    <g transform={`translate(${x} ${y - Math.abs(Math.sin(t * 9)) * 6 * walk}) scale(${s})`}>
      <path d={`M -12 -10 L ${-14 - step} 30 M 12 -10 L ${14 + step} 30`} stroke={OL} strokeWidth={8} strokeLinecap="round" />
      <path d="M -6 -180 Q -50 -120 -30 -40 Q -20 -4 10 -4 Q 40 -10 34 -40 Q 4 -110 22 -176 Q 10 -196 -6 -180 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 2 -184 L 6 -200" stroke="#6b4a1e" strokeWidth={9} strokeLinecap="round" />
      <circle cx={-8} cy={-110} r={5} fill={OL} />
      <circle cx={14} cy={-112} r={5} fill={OL} />
      <path d="M -6 -92 Q 4 -82 16 -94" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};

// ───────────── s39: вы изменитесь ─────────────
export const LifeStages: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const road = ramp(t, 0.2, 1);
  const xs = [cx - 450, cx - 150, cx + 150, cx + 450];
  const labels = ["трактор", "юрист", "семья", "а потом?"];
  const app = [0.15, 0.4, 0.7, 0.92].map((f) => pop(t, at(c, f)));
  const title = pop(t, at(c, 1));
  const later = ramp(t, at(c, 1.7), 0.8);
  const bal = pop(t, at(c, 2.15));
  const shift = ramp(t, at(c, 2), 0.8);
  const gy = 560 - shift * 50;
  return (
    <g>
      {/* лента жизни */}
      <g opacity={road}>
        <path d={`M ${cx - 600} ${gy + 34} L ${cx - 600 + 1200 * road} ${gy + 34}`} stroke={C.violet} strokeWidth={20} strokeLinecap="round" opacity={0.35} />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={gy + 34} r={12} fill={C.violet} opacity={app[i]} />
        ))}
      </g>
      {/* 1 — мальчик в тракторе */}
      {app[0] > 0.01 && (
        <g transform={`translate(${xs[0]} ${gy}) scale(${app[0] * 1.3})`}>
          <Worker x={-30} y={-62} s={0.55} role="plain" color={C.sky} t={t} arms={0.5} />
          <Tractor x={10} y={-10} s={0.75} t={t} />
        </g>
      )}
      {/* 2 — подросток-юрист с портфелем */}
      {app[1] > 0.01 && (
        <g transform={`translate(${xs[1]} ${gy}) scale(${app[1] * 1.3})`}>
          <Worker x={0} y={0} s={0.95} role="clerk" t={t} />
          <rect x={44} y={-28} width={62} height={46} rx={8} fill="#6b4a1e" stroke={OL} strokeWidth={4} />
          <path d="M 62 -28 Q 75 -42 88 -28" stroke={OL} strokeWidth={4} fill="none" />
        </g>
      )}
      {/* 3 — взрослый с ребёнком */}
      {app[2] > 0.01 && (
        <g transform={`translate(${xs[2]} ${gy}) scale(${app[2] * 1.3})`}>
          <Worker x={-30} y={0} s={1.05} role="plain" color={C.teal} t={t} arms={0.3} />
          <Worker x={46} y={10} s={0.55} role="plain" color={C.pink} t={t + 1} arms={0.8} />
          <Heart x={64} y={-120} s={0.7 + 0.08 * Math.sin(t * 4)} />
        </g>
      )}
      {/* 4 — пожилой человек с тростью */}
      {app[3] > 0.01 && (
        <g transform={`translate(${xs[3]} ${gy}) scale(${app[3] * 1.3})`}>
          <Worker x={0} y={0} s={1} role="plain" color={C.grey} t={t} skin="#f0c9a6" />
          <path d="M -26 -144 Q 0 -160 26 -144" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M 52 -30 L 60 32 M 52 -30 Q 52 -44 40 -44" stroke="#6b4a1e" strokeWidth={7} strokeLinecap="round" fill="none" />
        </g>
      )}
      {labels.map((l, i) => (
        <g key={l} opacity={clamp01(app[i] * 2)}>
          <Txt x={xs[i]} y={gy + 110} size={38} color={i === 3 ? C.violet : C.ink}>
            {l}
          </Txt>
        </g>
      ))}
      {/* «вот теперь я окончательный!» — пузырь над каждым и лопается */}
      {[0, 1, 2, 3].map((i) => {
        const s0 = at(c, 1.05 + i * 0.17);
        const k = pop(t, s0);
        const burst = ramp(t, s0 + 2.3, 0.35);
        if (k <= 0.01) return null;
        const x = xs[i];
        const y = gy - 290;
        if (burst >= 1) return null;
        return (
          <g key={i}>
            <g transform={`translate(${x} ${y}) scale(${k * (1 + burst * 0.4)})`} opacity={1 - burst}>
              <rect x={-135} y={-50} width={270} height={84} rx={36} fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M -16 33 L 0 58 L 14 33" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
              <Txt x={0} y={4} size={34}>
                я — навсегда!
              </Txt>
            </g>
            {burst > 0 &&
              Array.from({ length: 8 }).map((_, j) => {
                const a = (j / 8) * Math.PI * 2;
                return <line key={j} x1={x + Math.cos(a) * (60 + burst * 80)} y1={y + Math.sin(a) * (40 + burst * 60)} x2={x + Math.cos(a) * (80 + burst * 110)} y2={y + Math.sin(a) * (54 + burst * 80)} stroke={C.coral} strokeWidth={6} strokeLinecap="round" opacity={1 - burst} />;
              })}
          </g>
        );
      })}
      {title > 0 && (
        <g transform={`translate(${cx} 150) scale(${title})`}>
          <rect x={-380} y={-50} width={760} height={92} rx={46} fill={C.ink} />
          <Txt x={0} y={14} size={40} color="#fff">
            иллюзия конца истории
          </Txt>
        </g>
      )}
      {later > 0 && bal < 0.5 && (
        <g opacity={later * (1 - bal * 2)}>
          <Arrow x1={cx - 420} y1={gy + 150} x2={cx + 420} y2={gy + 150} k={later} color={C.violet} w={9} bend={0.06} />
          <Tag x={cx} y={gy + 235} text="через 10 лет — новые цели" size={36} color="#fff" />
        </g>
      )}
      {/* весы «без крайностей» */}
      {bal > 0.01 && (
        <g transform={`translate(${cx} ${gy + 220}) scale(${bal})`}>
          <g transform="translate(-200 0)">
            <Scales x={0} y={-60} s={0.5} tilt={Math.sin(t * 1.6) * 0.12} left={<Coin x={0} y={-30} s={0.7} />} right={<Heart x={0} y={-16} s={0.9} />} />
          </g>
          <rect x={30} y={-10} width={410} height={84} rx={42} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <Txt x={235} y={46} size={38}>
            без крайностей
          </Txt>
        </g>
      )}
    </g>
  );
};


// ───────────── s40: невозвратные затраты ─────────────
export const SunkBag: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const scene = pop(t, 0.2);
  const letGo = ramp(t, at(c, 2.15), 0.5);
  const run = ramp(t, at(c, 2.3), 2.2);
  const path = ramp(t, at(c, 2.05), 0.9);
  const gy = 720;
  const tug = Math.sin(t * 3) * 6 * (1 - letGo);
  const px = cx - 30 + run * 430 + tug;
  const bagX = cx - 400;
  const handX = px - 60;
  const handY = gy - 90;
  const drafts = 5;
  return (
    <g>
      {/* дорожки: старая — в гору, новая — лёгкая */}
      <g opacity={scene}>
        <path d={`M ${cx - 620} ${gy + 30} L ${cx + 520} ${gy + 30}`} stroke="#c8b49a" strokeWidth={26} strokeLinecap="round" />
        {path > 0 && <path d={`M ${cx + 40} ${gy + 30} L ${cx + 40 + 480 * path} ${gy + 30}`} stroke={C.green} strokeWidth={26} strokeLinecap="round" />}
      </g>
      {path > 0.5 && (
        <g transform={`translate(${cx + 400} ${gy - 290}) scale(${pop(t, at(c, 2.2))})`}>
          <rect x={-150} y={-46} width={300} height={84} rx={20} fill={C.green} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={12} size={38} color="#fff">
            новый план →
          </Txt>
        </g>
      )}
      {/* тяжёлый мешок «уже вложено» */}
      <g transform={`translate(${bagX} ${gy + 20}) scale(${scene * 1.2}) rotate(${(1 - letGo) * Math.sin(t * 3) * 2})`}>
        <path d="M -150 0 Q -180 -150 -60 -200 L -40 -232 L 40 -232 L 60 -200 Q 180 -150 150 0 Z" fill="#a98458" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -50 -212 L 50 -212" stroke={OL} strokeWidth={8} />
        <rect x={-130} y={-140} width={260} height={84} rx={14} fill="#fff6e2" stroke={OL} strokeWidth={4} />
        <Txt x={0} y={-112} size={34}>
          {"уже\nвложено"}
        </Txt>
        <text x={-100} y={-14} fontFamily={FONT} fontWeight={900} fontSize={34} fill="#6b4a1e" opacity={0.6}>
          {"годы · силы"}
        </text>
      </g>
      {/* верёвка: натянута, затем падает */}
      {scene > 0.3 && (
        <path
          d={letGo < 1 ? `M ${bagX + 40} ${gy - 240} Q ${(bagX + handX) / 2} ${gy - 120 + letGo * 160} ${handX + letGo * -200} ${handY + letGo * 120}` : `M ${bagX + 40} ${gy - 240} Q ${bagX + 120} ${gy + 30} ${bagX + 230} ${gy + 26}`}
          stroke="#8a5a2b"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
      )}
      {/* человечек: тянет, отпускает и бежит */}
      {run < 0.02 ? (
        <g transform={`translate(${px} ${gy}) scale(${scene})`}>
          <g transform="rotate(14)">
            <Worker x={0} y={0} s={1.35} role="plain" color={C.coral} t={t} arms={0.2} mood={letGo > 0.5 ? "smile" : "sad"} flip />
          </g>
          {letGo < 0.5 &&
            [0, 1].map((i) => <path key={i} d="M 0 0 q -8 14 0 20 q 8 -6 0 -20 Z" transform={`translate(${60 + i * 22} ${-150 + ((t * 40 + i * 20) % 40)})`} fill={C.sky} />)}
        </g>
      ) : (
        <Runner x={px} y={gy - 4} s={1.35} phase={t * 11} color={C.coral} />
      )}
      {letGo > 0.3 && (
        <g transform={`translate(${bagX} ${gy - 360}) scale(${pop(t, at(c, 2.3))})`}>
          <Tag x={0} y={0} text="прошлое уже потрачено" size={38} color="#fff" />
        </g>
      )}
      {/* черновики Канемана улетают в корзину */}
      {(() => {
        const st = pop(t, at(c, 1));
        if (st <= 0.01) return null;
        const bx = cx + 380;
        const by = 440;
        const sx = cx - 120;
        const sy = 420;
        return (
          <g opacity={clamp01(st * 2) * (1 - ramp(t, at(c, 2), 0.6))}>
            {/* корзина */}
            <g transform={`translate(${bx} ${by})`}>
              <path d="M -90 -60 L 90 -60 L 70 80 L -70 80 Z" fill="#9aa5b8" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
              {[-40, 0, 40].map((lx) => (
                <path key={lx} d={`M ${lx} -50 L ${lx * 0.8} 70`} stroke={OL} strokeWidth={3} opacity={0.5} />
              ))}
            </g>
            {/* стопка готовых глав */}
            {Array.from({ length: drafts }).map((_, i) => {
              const f = ramp(t, at(c, 1.3) + i * 0.6, 0.9);
              const x = sx + (bx - sx) * f;
              const y = sy - i * 10 + (by - 60 - (sy - i * 10)) * f - Math.sin(f * Math.PI) * 90;
              if (f >= 1) return null;
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${f * 220 + (i % 2) * 4})`}>
                  <rect x={-70} y={-48} width={140} height={96} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />
                  {[-26, -6, 14].map((ly) => (
                    <rect key={ly} x={-52} y={ly} width={ly === 14 ? 60 : 104} height={8} rx={4} fill="#c9d3e0" />
                  ))}
                </g>
              );
            })}
            <g transform={`translate(${cx} 200) scale(${st})`}>
              <Tag x={0} y={0} text="готовые главы — в корзину" size={38} color={C.yellow} />
            </g>
          </g>
        );
      })()}
    </g>
  );
};

// ───────────── s41: билет в парк, а не штраф ─────────────
export const ParkTicket: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const booth = pop(t, 0.2);
  const tag = pop(t, at(c, 0.25));
  const costs = ["сомнения", "страх", "неуверенность"];
  const ticket = pop(t, at(c, 1));
  const park = ramp(t, at(c, 2), 0.8);
  const buy = ramp(t, at(c, 2.3), 1.4);
  const rain = ramp(t, at(c, 3), 0.8);
  const sneak = ramp(t, at(c, 3.15), 1.6);
  const bill = pop(t, at(c, 3.3));
  const gy = 740;
  const cartPos = (t * 0.18) % 1;
  const track = (u: number) => [1390 + u * 430, 470 - Math.sin(u * Math.PI * 3) * 110 - u * 40] as const;
  const [kx, ky] = track(cartPos);
  return (
    <g>
      <rect x={620} y={gy + 30} width={1220} height={12} rx={6} fill={C.violet} opacity={0.25} />
      {/* касса */}
      <g transform={`translate(720 ${gy + 30}) scale(${booth})`}>
        <rect x={-120} y={-300} width={240} height={300} rx={12} fill="#fff3d6" stroke={OL} strokeWidth={5} />
        <path d="M -150 -300 L 150 -300 L 130 -360 L -130 -360 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        {[-100, -50, 0, 50, 100].map((sx, i) => (
          <path key={sx} d={`M ${sx - 25} -300 Q ${sx} -270 ${sx + 25} -300`} fill={i % 2 ? "#fff" : C.yellow} stroke={OL} strokeWidth={3} />
        ))}
        <rect x={-80} y={-230} width={160} height={110} rx={10} fill="#bfe6ff" stroke={OL} strokeWidth={4} />
        <rect x={-96} y={-120} width={192} height={22} rx={6} fill={C.wood} stroke={OL} strokeWidth={4} />
        <text x={0} y={-322} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fff">
          КАССА
        </text>
      </g>
      {/* ценник без цены */}
      {tag > 0.01 && ticket < 0.5 && (
        <g transform={`translate(1090 250) rotate(${wob(t, 1, 6)}) scale(${tag})`} opacity={1 - ticket * 2}>
          <path d="M -150 -60 L 120 -60 L 170 0 L 120 60 L -150 60 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={130} cy={0} r={10} fill="#fff" stroke={OL} strokeWidth={3} />
          <Txt x={-10} y={14} size={40}>
            цена: ?
          </Txt>
        </g>
      )}
      {/* билет: цена — сомнения, страх, неуверенность */}
      {ticket > 0.01 && (
        <g transform={`translate(${1090 + buy * 20} 250) rotate(${-3 + wob(t, 2, 1.5)}) scale(${ticket * 0.85})`}>
          <path d="M -230 -150 L 230 -150 L 230 -40 Q 200 -20 230 0 L 230 150 L -230 150 L -230 0 Q -200 -20 -230 -40 Z" fill="#fff" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-230} y={-150} width={460} height={64} fill={C.violet} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-104} size={36} color="#fff">
            БИЛЕТ · цена:
          </Txt>
          {costs.map((s, i) => {
            const k = pop(t, at(c, 1.15 + i * 0.25));
            return (
              <g key={s} transform={`translate(0 ${-34 + i * 58}) scale(${k})`} opacity={clamp01(k * 2)}>
                <circle cx={-170} cy={-10} r={10} fill={[C.skyDeep, C.coral, C.violet][i]} />
                <text x={-145} y={2} fontFamily={FONT} fontWeight={800} fontSize={36} fill={C.ink}>
                  {s}
                </text>
              </g>
            );
          })}
        </g>
      )}
      {/* парк: ворота и горки */}
      {park > 0.01 && (
        <g opacity={park}>
          {rain > 0 && <Sun x={1780} y={180} r={50} t={t} />}
          <path d={Array.from({ length: 41 }, (_, i) => track(i / 40)).map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ")} stroke={C.coral} strokeWidth={12} fill="none" strokeLinecap="round" />
          {Array.from({ length: 9 }, (_, i) => track(i / 8)).map(([x, y], i) => (
            <line key={i} x1={x} y1={y + 6} x2={x} y2={gy + 30} stroke={OL} strokeWidth={5} opacity={0.55} />
          ))}
          <g transform={`translate(${kx} ${ky - 22})`}>
            <rect x={-34} y={-24} width={68} height={40} rx={10} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <circle cx={-12} cy={-34} r={10} fill="#f2c79b" stroke={OL} strokeWidth={3} />
            <circle cx={14} cy={-34} r={10} fill="#f2c79b" stroke={OL} strokeWidth={3} />
          </g>
          {/* ворота */}
          <g transform={`translate(1290 ${gy + 30})`}>
            <rect x={-80} y={-230} width={24} height={230} fill={C.skyDeep} stroke={OL} strokeWidth={4} />
            <rect x={56} y={-230} width={24} height={230} fill={C.skyDeep} stroke={OL} strokeWidth={4} />
            <path d="M -96 -226 Q 0 -300 96 -226 L 96 -190 Q 0 -260 -96 -190 Z" fill={C.yellow} stroke={OL} strokeWidth={4} />
            <text x={0} y={-218} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink}>
              ПАРК
            </text>
          </g>
          {/* забор */}
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={1400 + i * 44} y={gy - 40} width={14} height={70} rx={4} fill="#d9c3a1" stroke={OL} strokeWidth={3} />
          ))}
          <rect x={1390} y={gy - 24} width={440} height={10} fill="#d9c3a1" stroke={OL} strokeWidth={2} />
        </g>
      )}
      {/* банан спокойно покупает билет и идёт в парк */}
      {park > 0.01 && (
        <MiniBanana x={900 + buy * 390} y={gy} s={0.8} t={t} walk={buy > 0 && buy < 1 ? 1 : 0} />
      )}
      <Pop t={t} at={at(c, 2.3)} x={1110} y={460}>
        <rect x={-250} y={-44} width={500} height={84} rx={42} fill={C.green} stroke={OL} strokeWidth={3} />
        <Check x={-195} y={-4} s={28} k={1} color="#fff" />
        <Txt x={30} y={12} size={38} color="#fff">
          плата, не штраф
        </Txt>
      </Pop>
      {/* дождь */}
      {rain > 0 && (
        <g opacity={rain}>
          <Cloud x={1600} y={200} s={1.3} mood={0} t={t} />
          {Array.from({ length: 14 }).map((_, i) => {
            const dx = 1500 + (i % 7) * 34;
            const dy = 260 + (((t * 300 + i * 53) % 180) as number);
            return <line key={i} x1={dx} y1={dy} x2={dx - 8} y2={dy + 22} stroke={C.skyDeep} strokeWidth={5} strokeLinecap="round" />;
          })}
        </g>
      )}
      {/* кто-то лезет под забор — и платит дважды */}
      {sneak > 0.01 && (
        <g>
          <g transform={`translate(${1620 + sneak * 60} ${gy + 6}) rotate(70)`}>
            <Worker x={0} y={0} s={0.75} role="plain" color={C.grey} t={t} mood="sad" />
          </g>
          {bill > 0.01 && (
            <g transform={`translate(1650 ${gy - 150}) rotate(${6 + wob(t, 3, 2)}) scale(${bill})`}>
              <rect x={-170} y={-50} width={340} height={96} rx={10} fill="#ffe3e3" stroke={C.red} strokeWidth={5} />
              <Txt x={0} y={-6} size={34} color={C.red}>
                {"счёт:\nплатите дважды"}
              </Txt>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ───────────── s42: разные игры ─────────────
export const TwoGames: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const head = pop(t, 0.3);
  const runners = ramp(t, at(c, 1), 0.5);
  const s1 = at(c, 1);
  const sprint = clamp01((t - s1) / Math.max(1, at(c, 1.8) - s1));
  const sprinterX = 220 + sprint * 860;
  const shout = pop(t, at(c, 2.1));
  const mStart = at(c, 2.3);
  const burst = clamp01((t - mStart) / 2.2);
  const tired = ramp(t, mStart + 2.3, 0.6);
  const calmX = 260 + clamp01((t - s1) / 30) * 180;
  const marathonX = calmX + burst * 380;
  const track = 1 - ramp(t, at(c, 3), 0.6);
  const clothes = ramp(t, at(c, 3), 0.6);
  const paper = pop(t, at(c, 4));
  const write = ramp(t, at(c, 4.25), 1.6);
  return (
    <g>
      {head > 0 && (
        <g transform={`translate(${cx} 140) scale(${head})`}>
          <rect x={-300} y={-48} width={600} height={90} rx={45} fill={C.ink} />
          <Txt x={0} y={13} size={42} color="#fff">
            у каждого своя игра
          </Txt>
        </g>
      )}
      {/* беговая дорожка */}
      {track > 0.01 && (
        <g opacity={track * clamp01(head * 2)}>
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x={110} y={330 + i * 230} width={1180} height={150} rx={20} fill={i ? "#f2a38a" : "#e58b6e"} opacity={0.6} />
              {Array.from({ length: 12 }).map((_, j) => (
                <rect key={j} x={140 + j * 100} y={400 + i * 230} width={50} height={8} rx={4} fill="#fff" opacity={0.7} />
              ))}
            </g>
          ))}
          {/* финиш спринтера «вечер» и далёкая цель марафонца */}
          <Flag x={1150} y={760} s={0.8} text="вечер" color={C.coral} wave={Math.sin(t * 3)} />
          <Sign x={1100} y={420} s={0.85} text="30 лет →" color={C.green} />
          {runners > 0 && (
            <g opacity={runners}>
              <Runner x={marathonX} y={450} s={1.25} phase={t * (5 + burst * 8) * (1 - tired * 0.8)} color={C.green} lean={tired > 0.3 ? 24 : 8} sad={tired > 0.3} bib="1" />
              <Runner x={Math.min(sprinterX, 1080)} y={680} s={1.25} phase={sprint < 1 ? t * 14 : 0} color={C.coral} lean={sprint < 1 ? 16 : 0} bib="2" />
              <g transform={`translate(${marathonX} 255)`}>
                <Tag x={0} y={0} text="30 лет" size={34} color={C.green} textColor="#fff" />
              </g>
              <g transform={`translate(${Math.min(sprinterX, 1080)} 488)`}>
                <Tag x={0} y={0} text="до вечера" size={34} color={C.coral} textColor="#fff" />
              </g>
            </g>
          )}
          {shout > 0.01 && (
            <g transform={`translate(${Math.min(sprinterX, 1080) - 300} 560) scale(${shout}) rotate(${wob(t, 2, 3)})`}>
              <rect x={-120} y={-40} width={240} height={76} rx={30} fill="#fff" stroke={C.red} strokeWidth={5} />
              <Txt x={0} y={12} size={38} color={C.red}>
                быстрее!
              </Txt>
            </g>
          )}
          {tired > 0.01 && (
            <g opacity={tired}>
              {[0, 1, 2].map((i) => (
                <path key={i} d="M 0 0 q -9 16 0 22 q 9 -6 0 -22 Z" transform={`translate(${marathonX + 30 + i * 20} ${320 + ((t * 50 + i * 18) % 40)})`} fill={C.sky} />
              ))}
              <g transform={`translate(${marathonX + 200} 360)`}>
                <Tag x={0} y={0} text="выдохся" size={34} color="#fff" textColor={C.red} />
              </g>
            </g>
          )}
        </g>
      )}
      {/* костюм юриста и шлёпанцы автора */}
      {clothes > 0.01 && (
        <g opacity={clothes * (1 - paper * 0.15)}>
          {[0, 1].map((i) => {
            const k = pop(t, at(c, 3 + i * 0.45));
            const x = cx - 290 + i * 580;
            return (
              <g key={i} transform={`translate(${x} 400) scale(${k})`}>
                <Panel x={-250} y={-200} w={500} h={340} fill="#fff" r={30} stroke={i ? C.teal : C.navy} />
                {i === 0 ? (
                  <g>
                    <Worker x={-110} y={60} s={1.25} role="boss" t={t} />
                    <rect x={-200} y={-10} width={60} height={46} rx={8} fill="#6b4a1e" stroke={OL} strokeWidth={4} />
                    <Txt x={100} y={-10} size={38}>
                      {"юристу —\nкостюм"}
                    </Txt>
                  </g>
                ) : (
                  <g>
                    <Worker x={-110} y={40} s={1.25} role="plain" color={C.teal} t={t} />
                    <ellipse cx={-132} cy={82} rx={18} ry={9} fill={C.coral} stroke={OL} strokeWidth={3} />
                    <ellipse cx={-88} cy={82} rx={18} ry={9} fill={C.coral} stroke={OL} strokeWidth={3} />
                    <Txt x={100} y={-10} size={38}>
                      {"автору —\nшлёпанцы"}
                    </Txt>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}
      {/* листок «моя игра» */}
      {paper > 0.01 && (
        <g transform={`translate(${cx} 720) rotate(${-2 + wob(t, 4, 1)}) scale(${paper})`}>
          <rect x={-330} y={-100} width={660} height={190} rx={14} fill="#fffdf4" stroke={OL} strokeWidth={5} />
          {[-10, 40].map((ly) => (
            <line key={ly} x1={-290} y1={ly + 22} x2={290} y2={ly + 22} stroke="#bcd3ee" strokeWidth={3} />
          ))}
          <Txt x={0} y={-40} size={44} weight={900}>
            моя игра:
          </Txt>
          <path d="M -260 30 q 40 -30 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0" stroke={C.skyDeep} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - write)} />
          <g transform={`translate(${-260 + write * 480} ${10}) rotate(30)`}>
            <rect x={-8} y={-80} width={16} height={80} rx={4} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
            <path d="M -8 0 L 0 16 L 8 0 Z" fill={OL} />
          </g>
        </g>
      )}
    </g>
  );
};

// дорожный знак (локальная обёртка над простой табличкой)
const Sign: React.FC<{ x: number; y: number; s?: number; text: string; color: string }> = ({ x, y, s = 1, text, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-6} y={-30} width={12} height={130} fill={C.wood} stroke={OL} strokeWidth={3} />
    <rect x={-120} y={-100} width={240} height={74} rx={14} fill={color} stroke={OL} strokeWidth={4} />
    <Txt x={0} y={-50} size={36} color="#fff">
      {text}
    </Txt>
  </g>
);

// ───────────── s43: соблазн пессимизма ─────────────
export const NewsVsProgress: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const paper = pop(t, 0.2);
  const shake = paper > 0.9 ? Math.sin(t * 18) * 2 : 0;
  const smart = pop(t, at(c, 0.6));
  const opt = ramp(t, at(c, 1), 1.6);
  const top = 1 - ramp(t, at(c, 4), 0.7);
  const grow = 0.3 + 0.7 * clamp01((t - at(c, 2)) / Math.max(1, c.dur - at(c, 2)));
  const growOn = ramp(t, at(c, 2), 0.6);
  const plane = clamp01((t - at(c, 2.3)) / 14);
  const match = ramp(t, at(c, 3), 0.4);
  const smoke = ramp(t, at(c, 3.25), 0.5);
  const hawking = ramp(t, at(c, 4), 0.7);
  const bonus = ramp(t, at(c, 4.2), 0.6);
  const pts: [number, number][] = [
    [0, 0.12],
    [0.12, 0.3],
    [0.2, 0.18],
    [0.34, 0.42],
    [0.44, 0.3],
    [0.58, 0.55],
    [0.68, 0.46],
    [0.82, 0.72],
    [0.9, 0.64],
    [1, 0.9],
  ];
  return (
    <g>
      {/* газета: громкий мрачный заголовок и маленькая заметка о хорошем */}
      {top > 0.01 && (
        <g opacity={top}>
          <g transform={`translate(${900 + shake} 330) rotate(-3) scale(${paper})`}>
            <rect x={-250} y={-180} width={500} height={360} rx={8} fill="#f7f3ea" stroke={OL} strokeWidth={5} />
            <rect x={-230} y={-162} width={460} height={40} fill="#2b2b3a" />
            <text x={0} y={-132} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#fff">
              НОВОСТИ
            </text>
            <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={C.red}>
              ВСЁ РУХНЕТ!
            </text>
            {[-10, 20, 50].map((ly) => (
              <rect key={ly} x={-230} y={ly} width={260} height={12} rx={6} fill="#d8d2c4" />
            ))}
            <rect x={50} y={-12} width={180} height={150} fill="#e6e1d6" />
            <rect x={-230} y={86} width={260} height={66} fill="#ecebe6" stroke="#c9c4b8" strokeWidth={2} />
            <text x={-100} y={112} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={20} fill="#9aa0aa">
              жизнь стала
            </text>
            <text x={-100} y={138} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={20} fill="#9aa0aa">
              немного лучше
            </text>
          </g>
          {smart > 0.01 && (
            <g transform={`translate(900 590) scale(${smart})`} opacity={1 - ramp(t, at(c, 2.8), 0.5)}>
              <Tag x={0} y={0} text="звучит умнее…" size={36} color="#fff" textColor={C.inkSoft} />
            </g>
          )}
          {/* оптимизм: долгий путь с провалами, но вверх */}
          {opt > 0 && (
            <g>
              <rect x={1260} y={150} width={560} height={350} rx={30} fill="#fff" opacity={0.9 * clamp01(opt * 3)} />
              <LineChartSoft x={1300} y={200} w={480} h={240} pts={pts} k={opt} />
              <Txt x={1540} y={480} size={34} color={C.greenDeep} opacity={clamp01(opt * 3)}>
                хорошего больше
              </Txt>
              {[2, 4, 6, 8].map((i, j) => (
                <circle key={i} cx={1300 + pts[i][0] * 480} cy={440 - pts[i][1] * 240} r={9} fill={C.red} opacity={clamp01((opt - pts[i][0]) * 6)} />
              ))}
              {opt > 0.9 && <Txt x={1340} y={190} size={30} color={C.red} anchor="start">неудачи будут</Txt>}
            </g>
          )}
        </g>
      )}
      {/* прогресс: дерево растёт медленно, самолётик Райт летит — никто не смотрит */}
      {growOn > 0.01 && (
        <g opacity={growOn}>
          <Tree x={1660} y={840} s={0.92} grow={grow} t={t} />
          <g transform={`translate(${1180 + plane * 360} ${620 - Math.sin(plane * Math.PI) * 40 + wob(t, 5, 4)}) scale(0.9)`}>
            <rect x={-70} y={-28} width={140} height={10} rx={4} fill="#f3e2c7" stroke={OL} strokeWidth={3} />
            <rect x={-70} y={4} width={140} height={10} rx={4} fill="#f3e2c7" stroke={OL} strokeWidth={3} />
            <path d="M -40 -18 L -40 4 M 40 -18 L 40 4 M 0 -18 L 0 4" stroke={OL} strokeWidth={3} />
            <path d="M 70 -10 L 104 -10 M -70 -10 L -100 -24 L -100 4 Z" stroke={OL} strokeWidth={3} fill="#f3e2c7" />
            <ellipse cx={-6} cy={-36} rx={12} ry={8} fill="#f2c79b" stroke={OL} strokeWidth={2} />
          </g>
          <g transform="translate(1340 805)">
            <Tag x={0} y={0} text={match > 0.5 ? "годы" : "медленно и тихо"} size={36} color="#fff" textColor={C.greenDeep} />
          </g>
        </g>
      )}
      {/* спичка: беда — быстро и громко */}
      {match > 0.01 && (
        <g transform="translate(800 830)">
          <rect x={-8} y={-130} width={16} height={130} rx={4} fill="#e8c68e" stroke={OL} strokeWidth={3} transform="rotate(-20)" />
          <g transform="rotate(-20) translate(0 -140)">
            <path d={`M 0 ${-60 * match} Q 26 -20 0 10 Q -26 -20 0 ${-60 * match} Z`} fill={C.orange} stroke={C.red} strokeWidth={4} opacity={1 - smoke * 0.7} />
          </g>
          {smoke > 0 &&
            [0, 1, 2, 3].map((i) => (
              <circle key={i} cx={-60 + i * 30 + Math.sin(t * 3 + i) * 10} cy={-170 - i * 28 - smoke * 30} r={22 + i * 6 + smoke * 8} fill="#9aa5b8" opacity={0.55 * (1 - smoke * 0.3)} />
            ))}
          <Tag x={190} y={-25} text="миг" size={40} color={C.red} textColor="#fff" />
        </g>
      )}
      {/* Хокинг: ожидания почти на нуле — всё остальное бонус */}
      {hawking > 0.01 && (
        <g opacity={hawking}>
          <Panel x={680} y={150} w={1120} h={300} fill="#fff" r={36} />
          <Txt x={760} y={230} size={38} anchor="start">
            ожидания
          </Txt>
          <rect x={760} y={260} width={420} height={50} rx={25} fill="#eef1f6" stroke={OL} strokeWidth={3} />
          <rect x={764} y={264} width={22} height={42} rx={20} fill={C.coral} />
          <Txt x={760} y={390} size={36} anchor="start" color={C.inkSoft}>
            почти ноль
          </Txt>
          <Arrow x1={1210} y1={290} x2={1330} y2={290} k={bonus} color={C.inkSoft} w={8} />
          {[0, 1, 2, 3, 4].map((i) => {
            const k = pop(t, at(c, 4.3) + i * 0.4);
            return k > 0.01 ? (
              <g key={i} transform={`translate(${1400 + i * 78} ${330 - (i % 2) * 40}) scale(${k}) rotate(${t * 30 + i * 20})`}>
                <path d="M 0 -30 L 9 -9 L 30 0 L 9 9 L 0 30 L -9 9 L -30 0 L -9 -9 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
              </g>
            ) : null;
          })}
          <g transform={`translate(1560 220) scale(${pop(t, at(c, 4.35))})`}>
            <Tag x={0} y={0} text="всё после — бонус" size={38} color={C.yellow} />
          </g>
        </g>
      )}
    </g>
  );
};

// плавная «долгая» кривая без осей (не биржевой график)
const LineChartSoft: React.FC<{ x: number; y: number; w: number; h: number; pts: [number, number][]; k: number }> = ({ x, y, w, h, pts, k }) => {
  const d = pts.map(([px, py], i) => `${i ? "L" : "M"} ${x + px * w} ${y + h - py * h}`).join(" ");
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot((pts[i][0] - pts[i - 1][0]) * w, (pts[i][1] - pts[i - 1][1]) * h);
  return (
    <g>
      <path d={`M ${x} ${y + h} L ${x + w} ${y + h}`} stroke={C.grey} strokeWidth={4} strokeLinecap="round" />
      <path d={d} stroke={C.green} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - clamp01(k))} />
    </g>
  );
};

// ───────────── s44: истории в головах ─────────────
const City: React.FC<{ x: number; y: number; t: number; mood: number; label: string; k: number; trend: number }> = ({ x, y, t, mood, label, k, trend }) => {
  const b = [
    [-230, 150, C.skyDeep],
    [-150, 230, C.violet],
    [-60, 170, C.teal],
    [30, 260, C.navy],
    [120, 190, C.coral],
    [200, 140, C.skyDeep],
  ] as const;
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-280} y={-330} width={560} height={420} rx={30} fill="#fff" opacity={0.75} />
      {b.map(([bx, h, col], i) => (
        <g key={i}>
          <rect x={bx - 36} y={-h} width={72} height={h} rx={6} fill={col} stroke={OL} strokeWidth={4} />
          {Array.from({ length: Math.floor(h / 50) }).map((_, j) => (
            <rect key={j} x={bx - 20} y={-h + 18 + j * 46} width={40} height={22} rx={3} fill="#ffe58a" opacity={0.85} />
          ))}
        </g>
      ))}
      {[-200, -60, 80, 210].map((px, i) => (
        <g key={i}>
          <Person x={px} y={50} s={0.42} color={[C.coral, C.green, C.yellowDeep, C.pink][i]} t={t + i} sad={mood < 0.5} />
          <Cloud x={px} y={-280 + (i % 2) * 30} s={0.48} mood={mood} t={t + i} />
        </g>
      ))}
      <rect x={-280} y={70} width={560} height={14} fill="#8a9a7c" />
      <g transform="translate(-200 -370)">
        <rect x={-70} y={-34} width={140} height={60} rx={20} fill={C.ink} />
        <Txt x={0} y={10} size={36} color="#fff">
          {label}
        </Txt>
      </g>
      <g transform="translate(200 -370)">
        <circle r={36} fill={trend > 0 ? C.green : C.red} stroke={OL} strokeWidth={3} />
        <path d={trend > 0 ? "M -16 12 L 0 -14 L 16 12" : "M -16 -12 L 0 14 L 16 -12"} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

export const StoryClouds: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const ufo = ramp(t, 0.2, 1.4);
  const c1 = pop(t, at(c, 0.45));
  const c2 = pop(t, at(c, 0.8));
  const same = ramp(t, at(c, 1), 0.6);
  const storm = ramp(t, at(c, 1.55), 0.8);
  const story = pop(t, at(c, 1.75));
  const want = pop(t, at(c, 2));
  const ux = cx - 700 + ufo * 700 + Math.sin(t * 0.9) * 260 * ufo;
  return (
    <g>
      <City x={cx - 300} y={660} t={t} mood={1} label="2007" k={c1} trend={1} />
      <City x={cx + 300} y={660} t={t} mood={1 - storm} label="2009" k={c2} trend={storm > 0.5 ? -1 : 1} />
      {/* летающая тарелка с пришельцем */}
      <g transform={`translate(${ux} ${170 + wob(t, 2, 8)})`} opacity={ufo}>
        <path d={`M -40 30 L ${-140 + Math.sin(t * 2) * 20} 400 L ${140 + Math.sin(t * 2) * 20} 400 L 40 30 Z`} fill="#fff7b0" opacity={0.25} />
        <ellipse cx={0} cy={-12} rx={58} ry={50} fill="#bfe6ff" stroke={OL} strokeWidth={4} opacity={0.9} />
        <circle cx={0} cy={-16} r={26} fill="#8fe08f" stroke={OL} strokeWidth={3} />
        <ellipse cx={-9} cy={-20} rx={6} ry={9} fill={OL} />
        <ellipse cx={9} cy={-20} rx={6} ry={9} fill={OL} />
        <path d="M -14 -40 L -22 -62 M 14 -40 L 22 -62" stroke={OL} strokeWidth={3} />
        <circle cx={-22} cy={-64} r={5} fill={C.coral} />
        <circle cx={22} cy={-64} r={5} fill={C.coral} />
        <ellipse cx={0} cy={14} rx={130} ry={34} fill={C.grey} stroke={OL} strokeWidth={5} />
        {[-80, -30, 30, 80].map((lx, i) => (
          <circle key={lx} cx={lx} cy={18} r={8} fill={Math.floor(t * 3 + i) % 2 ? C.yellow : C.coral} />
        ))}
      </g>
      {/* всё на месте */}
      {same > 0.01 && storm < 1 && (
        <g opacity={same * (1 - ramp(t, at(c, 1.75), 0.5))}>
          {["дома", "заводы", "люди", "знания"].map((w, i) => (
            <g key={w} transform={`translate(${cx - 450 + i * 300} 805) scale(${pop(t, at(c, 1.05 + i * 0.08))})`}>
              <rect x={-130} y={-36} width={260} height={66} rx={33} fill="#fff" stroke={C.green} strokeWidth={4} />
              <Check x={-90} y={-4} s={22} k={1} />
              <Txt x={18} y={10} size={34}>
                {w}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {story > 0.01 && want < 0.5 && (
        <g transform={`translate(${cx} 805) scale(${story})`} opacity={1 - want * 2}>
          <Tag x={0} y={0} text="изменились только истории" size={38} color={C.yellow} />
        </g>
      )}
      {want > 0.01 && (
        <g transform={`translate(${cx} 805) scale(${want})`}>
          <rect x={-520} y={-48} width={1040} height={90} rx={45} fill={C.ink} />
          <Heart x={-460} y={6} s={0.9} />
          <Txt x={20} y={12} size={36} color="#fff">
            очень хочется верить → легко верим
          </Txt>
        </g>
      )}
    </g>
  );
};

// ───────────── s45: пазл картины мира ─────────────
export const Puzzle: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const board = pop(t, 0.2);
  const missing = [2, 5, 9];
  const fill = ramp(t, at(c, 0.45), 2.2);
  const child = pop(t, at(c, 1));
  const idk = pop(t, at(c, 1.55));
  const box = pop(t, at(c, 2));
  const lens = ramp(t, at(c, 2.2), 3);
  const warn = pop(t, at(c, 2.6));
  const q = ramp(t, at(c, 3), 0.6);
  const px0 = 680;
  const py0 = 170;
  const cell = 120;
  const colors = [C.sky, C.skyDeep, C.green, C.teal, C.yellow, C.orange, C.coral, C.violet, C.pink, C.greenDeep, C.sky, C.yellowDeep];
  return (
    <g>
      <g transform={`translate(${px0 + 240} ${py0 + 180}) scale(${board}) translate(${-240} ${-180})`}>
        <rect x={-16} y={-16} width={512} height={392} rx={22} fill="#fff" stroke={OL} strokeWidth={5} />
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = col * cell;
          const y = row * cell;
          const isMiss = missing.includes(i);
          const fk = isMiss ? clamp01(fill * 3 - missing.indexOf(i)) : 1;
          return (
            <g key={i}>
              {isMiss && <rect x={x + 6} y={y + 6} width={cell - 12} height={cell - 12} rx={10} fill="#f4f6fa" stroke={C.grey} strokeWidth={4} strokeDasharray="12 10" />}
              {fk > 0 && (
                <g opacity={isMiss ? fk : 1}>
                  <rect x={x + 4} y={y + 4} width={cell - 8} height={cell - 8} rx={10} fill={isMiss ? "#ffe9a8" : colors[i]} stroke={OL} strokeWidth={3} />
                  {col < 3 && !isMiss && <circle cx={x + cell} cy={y + cell / 2} r={16} fill={colors[i]} stroke={OL} strokeWidth={3} />}
                  {isMiss && <path d={`M ${x + 22} ${y + 70} q 20 -40 38 -10 t 38 -14`} stroke={C.coral} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={120} strokeDashoffset={120 * (1 - fk)} />}
                </g>
              )}
            </g>
          );
        })}
        <Txt x={240} y={-36} size={38} weight={900}>
          картина мира
        </Txt>
      </g>
      {/* человечек дорисовывает фломастером */}
      {board > 0.5 && (
        <g>
          <Worker x={1260} y={470} s={1} role="plain" color={C.violet} t={t} arms={fill > 0 && fill < 1 ? 0.6 + Math.sin(t * 8) * 0.2 : 0.1} flip />
          {fill > 0 && fill < 1 && (
            <g transform={`translate(${1206} ${404 + Math.sin(t * 8) * 6}) rotate(-50)`}>
              <rect x={-8} y={-60} width={16} height={60} rx={4} fill={C.coral} stroke={OL} strokeWidth={3} />
            </g>
          )}
        </g>
      )}
      <Pop t={t} at={at(c, 0.7)} x={920} y={610}>
        <Tag x={0} y={0} text="удобная история" size={36} color={C.yellow} />
      </Pop>
      {/* дочка автора: мир простыми историями */}
      {child > 0.01 && (
        <g>
          <Worker x={1710} y={480} s={0.7 * child} role="plain" color={C.pink} t={t} arms={0.6} />
          <g transform={`translate(1560 300) scale(${child}) rotate(${wob(t, 1, 2)})`}>
            <rect x={-160} y={-56} width={320} height={100} rx={40} fill="#fff" stroke={OL} strokeWidth={4} />
            <path d="M 80 42 L 130 80 L 110 42" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
            <Sun x={-100} y={-6} r={24} t={t} />
            <Txt x={30} y={8} size={36}>
              всё просто!
            </Txt>
          </g>
        </g>
      )}
      {idk > 0.01 && (
        <g transform={`translate(1540 610) scale(${idk})`}>
          <rect x={-270} y={-46} width={540} height={84} rx={42} fill={C.ink} />
          <Txt x={0} y={10} size={34} color="#fff">
            я не знаю, чего я не знаю
          </Txt>
        </g>
      )}
      {/* слишком красивая коробка и лупа */}
      {box > 0.01 && (
        <g>
          <g transform={`translate(900 760) scale(${box})`}>
            {[0, 1, 2, 3].map((i) => (
              <path key={i} d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" transform={`translate(${-230 + i * 150} ${-100 + (i % 2) * 190}) scale(${0.8 + 0.4 * Math.sin(t * 4 + i)})`} fill={C.yellow} />
            ))}
            <rect x={-220} y={-90} width={440} height={170} rx={16} fill="#ffd86b" stroke={OL} strokeWidth={5} />
            <rect x={-20} y={-90} width={40} height={170} fill={C.coral} opacity={0.8} />
            <rect x={-205} y={-66} width={410} height={124} rx={12} fill="#fff" opacity={0.94} />
            <Txt x={0} y={-16} size={36}>
              {"всегда одинаковый\nдоход"}
            </Txt>
          </g>
          {lens > 0 && (
            <g transform={`translate(${760 + Math.sin(lens * Math.PI * 2) * 140 + 140} ${740 + Math.cos(lens * Math.PI * 3) * 20})`}>
              <circle r={56} fill="#e6f6ff" opacity={0.5} stroke={OL} strokeWidth={8} />
              <rect x={36} y={36} width={22} height={80} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} transform="rotate(-45 46 46)" />
            </g>
          )}
        </g>
      )}
      {warn > 0.01 && (
        <g transform={`translate(1450 760) scale(${warn})`}>
          <path d="M -250 -4 L -205 -84 L -160 -4 Z" fill={C.yellow} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <Txt x={-205} y={-16} size={44} weight={900}>
            !
          </Txt>
          <rect x={-130} y={-80} width={360} height={80} rx={40} fill={C.red} />
          <Txt x={50} y={-26} size={36} color="#fff">
            проверьте факты
          </Txt>
        </g>
      )}
      {q > 0.01 && (
        <g transform={`translate(1780 760) scale(${q * (1 + 0.05 * Math.sin(t * 3))})`} opacity={q}>
          <circle r={44} fill={C.violet} />
          <Txt x={0} y={18} size={56} color="#fff" weight={900}>
            ?
          </Txt>
        </g>
      )}
    </g>
  );
};

// ───────────── s46: итоги ─────────────
const RecapIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (i) {
    case 0: // скромность
      return (
        <g>
          <Heart x={0} y={10} s={1.6} color={C.pink} />
          <Worker x={0} y={40} s={0.45} role="plain" color={C.skyDeep} t={t} arms={0.4} />
        </g>
      );
    case 1: // меньше самолюбия — больше сбережений
      return (
        <g>
          <path transform="translate(-60 0) scale(0.7)" d="M -50 30 L -60 -40 L -25 -10 L 0 -50 L 25 -10 L 60 -40 L 50 30 Z" fill={C.gold} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -10 -4 L 20 -4" stroke={C.inkSoft} strokeWidth={6} strokeLinecap="round" />
          <path d="M 12 -14 L 22 -4 L 12 6" stroke={C.inkSoft} strokeWidth={6} fill="none" strokeLinecap="round" />
          <CoinStack x={70} y={44} n={2 + Math.floor((Math.sin(t * 2) + 1) * 1.5)} s={0.7} />
        </g>
      );
    case 2: // спокойный сон
      return (
        <g>
          <rect x={-80} y={-10} width={160} height={70} rx={34} fill="#e9eefb" stroke={OL} strokeWidth={4} />
          <path d="M 30 -60 A 30 30 0 1 0 60 -20 A 24 24 0 1 1 30 -60 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
          {[0, 1, 2].map((j) => (
            <text key={j} x={-40 + j * 22} y={-20 - j * 18 - ((t * 10) % 8)} fontFamily={FONT} fontWeight={900} fontSize={22 + j * 6} fill={C.violet}>
              z
            </text>
          ))}
        </g>
      );
    case 3: // время работает
      return <Watch x={0} y={10} s={0.62} a={t * 8} />;
    case 4: // место для ошибок
      return <Shield x={0} y={8} s={0.55} color={C.teal} />;
    case 5: // копить без причины
      return <Jar x={0} y={12} s={0.36} level={0.55 + 0.1 * Math.sin(t)} t={t} />;
    case 6: // свобода времени
      return <Key x={10} y={10} s={0.65} rot={-20 + wob(t, 2, 6)} />;
    default: // своя игра
      return <Flag x={-50} y={66} s={0.62} text="моя" color={C.coral} wave={Math.sin(t * 3)} />;
  }
};

export const Recap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const intro = pop(t, 0.3);
  const head = pop(t, at(c, 1));
  const items = ["скромность", "меньше\nсамолюбия", "спокойный сон", "время\nработает", "место\nдля ошибок", "копить\nбез причины", "свобода\nвремени", "своя игра"];
  const when = [1.35, 1.75, 2.1, 2.45, 2.75, 3.1, 3.4, 3.75];
  const cols = [C.pink, C.gold, C.violet, C.skyDeep, C.teal, C.money, C.yellowDeep, C.coral];
  return (
    <g>
      {intro > 0.01 && head < 0.6 && (
        <g transform={`translate(1080 420) scale(${intro})`} opacity={1 - head * 1.6}>
          <Panel x={-430} y={-130} w={860} h={240} fill="#fff" />
          <Txt x={0} y={-30} size={44} weight={900}>
            «я не знаю вас…»
          </Txt>
          <Txt x={0} y={50} size={38} color={C.inkSoft}>
            поэтому — не советы, а уроки
          </Txt>
        </g>
      )}
      {head > 0.01 && (
        <g transform={`translate(1105 118) scale(${head})`}>
          <Txt x={0} y={14} size={50} weight={900}>
            полезно почти всем
          </Txt>
        </g>
      )}
      {items.map((it, i) => {
        const k = pop(t, at(c, when[i]));
        if (k <= 0.01) return null;
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 380 + col * 370 + 170;
        const y = 160 + row * 310;
        return (
          <g key={i} transform={`translate(${x} ${y + 145 + wob(t, i, 3)}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-170} y={-145} w={340} h={290} fill="#fff" r={30} stroke={cols[i]} />
            <circle cx={-130} cy={-105} r={24} fill={cols[i]} />
            <Txt x={-130} y={-94} size={30} color="#fff" weight={900}>
              {String(i + 1)}
            </Txt>
            <g transform="translate(0 -50)">
              <RecapIcon i={i} t={t} />
            </g>
            <Txt x={0} y={it.includes("\n") ? 64 : 84} size={34} weight={900}>
              {it}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ───────────── s47: исповедь автора ─────────────
export const Independence: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const note = pop(t, 0.3);
  const chart = ramp(t, at(c, 1), 2.5);
  const flow = ramp(t, at(c, 1.5), 0.6);
  const house = pop(t, at(c, 2));
  const scales = pop(t, at(c, 2.4));
  const family = ramp(t, at(c, 3), 0.7);
  const x0 = 680;
  const y0 = 240;
  const w = 520;
  const h = 260;
  const inc = (u: number) => y0 + h - (0.25 + 0.7 * u) * h;
  const exp = (u: number) => y0 + h - (0.25 + 0.08 * u) * h;
  const u = chart;
  const top = 1 - family;
  return (
    <g>
      {note > 0.01 && (
        <g transform={`translate(1170 150) scale(${note})`}>
          <rect x={-380} y={-48} width={760} height={90} rx={45} fill={C.ink} />
          <Heart x={-320} y={6} s={0.8} color={C.pink} />
          <Txt x={30} y={12} size={38} color="#fff">
            личный пример, не совет
          </Txt>
        </g>
      )}
      {/* доходы растут, расходы ровные — разница течёт в банку */}
      {chart > 0.01 && top > 0.01 && (
        <g opacity={top}>
          <rect x={x0 - 30} y={y0 - 30} width={w + 60} height={h + 80} rx={26} fill="#fff" opacity={0.85} />
          <path d={`M ${x0} ${y0 + h} L ${x0 + w} ${y0 + h}`} stroke={C.grey} strokeWidth={4} />
          <path d={`M ${x0} ${inc(0)} L ${x0 + w * u} ${inc(u)} L ${x0 + w * u} ${exp(u)} L ${x0} ${exp(0)} Z`} fill={C.money} opacity={0.25} />
          <path d={`M ${x0} ${inc(0)} L ${x0 + w * u} ${inc(u)}`} stroke={C.moneyDeep} strokeWidth={10} strokeLinecap="round" />
          <path d={`M ${x0} ${exp(0)} L ${x0 + w * u} ${exp(u)}`} stroke={C.coral} strokeWidth={10} strokeLinecap="round" />
          <Txt x={x0 + 20} y={inc(0.62) - 20} size={34} anchor="start" color={C.moneyDeep} opacity={clamp01(u * 3)}>
            доходы
          </Txt>
          <Txt x={x0 + w - 10} y={exp(1) + 50} size={34} anchor="end" color={C.coral} opacity={clamp01(u * 3)}>
            расходы
          </Txt>
          {flow > 0 &&
            [0, 1, 2, 3].map((i) => {
              const f = (t * 0.5 + i * 0.25) % 1;
              const sx = x0 + w;
              const sy = (inc(u) + exp(u)) / 2;
              return <Coin key={i} x={sx + (1400 - sx) * f} y={sy + (330 - sy) * f - Math.sin(f * Math.PI) * 90} s={0.5} spin={Math.cos(t * 4 + i)} />;
            })}
          <Jar x={1460} y={380} s={0.95} level={0.2 + 0.6 * flow * clamp01((t - at(c, 1.5)) / 8)} t={t} />
          <g transform={`translate(1460 565) scale(${flow})`}>
            <Tag x={0} y={0} text="фонд независимости" size={34} color={C.yellow} />
          </g>
        </g>
      )}
      {/* дом без кредита и весы «счастливым или правым» */}
      {house > 0.01 && (
        <g>
          <g transform={`translate(860 ${830}) scale(${house * 0.85})`}>
            <Cottage x={0} y={0} s={1} glow={0.6 + 0.3 * Math.sin(t * 2)} />
          </g>
          <g transform={`translate(${860 + 150} 720) rotate(${-6 + wob(t, 1, 2)}) scale(${house})`}>
            <rect x={-110} y={-34} width={220} height={64} rx={12} fill="#fff" stroke={C.green} strokeWidth={5} />
            <Txt x={0} y={12} size={34} color={C.greenDeep}>
              без кредита
            </Txt>
          </g>
        </g>
      )}
      {scales > 0.01 && (
        <g transform={`translate(1450 ${top > 0.5 ? 650 : 650}) scale(${scales})`}>
          <Scales x={0} y={0} s={0.55} tilt={-0.6 + 0.08 * Math.sin(t * 2)} left={<Heart x={0} y={-14} s={1.1} />} right={<text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.inkSoft}>%</text>} />
          <Txt x={-150} y={170} size={34} color={C.coral}>
            счастливым
          </Txt>
          <Txt x={150} y={140} size={34} color={C.inkSoft}>
            «правым»
          </Txt>
        </g>
      )}
      {/* семейный стол */}
      {family > 0.01 && (
        <g transform={`translate(1170 470) scale(${0.6 + 0.4 * family})`} opacity={family}>
          {[-200, 0, 200].map((dx, i) => (
            <g key={dx}>
              <Chair x={dx} y={40} s={0.7} />
              <Person x={dx} y={-30} s={0.9 - (i === 1 ? 0.25 : 0)} color={[C.teal, C.pink, C.skyDeep][i]} t={t + i} arms={0.3} />
            </g>
          ))}
          <rect x={-330} y={-20} width={660} height={40} rx={10} fill={C.wood} stroke={OL} strokeWidth={5} />
          <rect x={-300} y={20} width={24} height={110} fill={C.wood} stroke={OL} strokeWidth={4} />
          <rect x={276} y={20} width={24} height={110} fill={C.wood} stroke={OL} strokeWidth={4} />
          <Heart x={-60} y={-30} s={0.8} color={C.coral} />
          <rect x={10} y={-40} width={90} height={22} rx={4} fill="#fff" stroke={OL} strokeWidth={3} />
          <g transform="translate(0 -230)">
            <Tag x={0} y={0} text="решения — за семейным столом" size={36} color={C.yellow} />
          </g>
        </g>
      )}
    </g>
  );
};

// ───────────── s48: пять шагов на неделю ─────────────
const STEPS = [
  { label: "моё «достаточно»", color: C.skyDeep },
  { label: "траты напоказ", color: C.violet },
  { label: "маленький запас", color: C.money },
  { label: "запас в плане", color: C.coral },
  { label: "моя игра", color: C.yellowDeep },
];

const StepIcon: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  switch (i) {
    case 0:
      return (
        <g>
          <rect x={-34} y={-30} width={68} height={60} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
          <path d="M -20 -10 L 20 -10 M -20 6 L 10 6" stroke={C.grey} strokeWidth={5} strokeLinecap="round" />
          <rect x={10} y={-52} width={12} height={54} rx={3} fill={C.yellowDeep} stroke={OL} strokeWidth={2} transform={`rotate(${30 + Math.sin(t * 6) * 8} 16 0)`} />
        </g>
      );
    case 1:
      return (
        <g>
          <circle r={30} fill="#fff" stroke={OL} strokeWidth={4} />
          <circle r={14} fill={C.violet} />
          <circle r={5} fill={OL} />
          <path d="M -46 0 Q 0 -44 46 0 Q 0 44 -46 0 Z" fill="none" stroke={OL} strokeWidth={4} />
        </g>
      );
    case 2:
      return <Jar x={0} y={4} s={0.24} level={0.3 + 0.1 * Math.sin(t * 2)} t={t} />;
    case 3:
      return (
        <g>
          <rect x={-38} y={-24} width={76} height={52} rx={8} fill={C.coral} stroke={OL} strokeWidth={3} />
          <path d="M -14 -24 L -14 -36 L 14 -36 L 14 -24" stroke={OL} strokeWidth={4} fill="none" />
          <rect x={-38} y={-4} width={76} height={8} fill={C.yellow} />
        </g>
      );
    default:
      return <Flag x={-30} y={40} s={0.4} text="" color={C.yellowDeep} wave={Math.sin(t * 3)} />;
  }
};

export const WeekPlan: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const sheet = pop(t, 0.2);
  const stamp = pop(t, at(c, 0.55));
  const when = [1.05, 1.5, 2.05, 2.5, 3.05];
  const done = ramp(t, at(c, 3.6), 0.6);
  return (
    <g>
      <g transform={`translate(${cx} 470) rotate(${-1 + wob(t, 1, 0.4)}) scale(${sheet})`}>
        <rect x={-552} y={-352} width={1110} height={720} rx={24} fill="#000" opacity={0.1} />
        <rect x={-560} y={-360} width={1110} height={720} rx={24} fill="#fffdf4" stroke={OL} strokeWidth={5} />
        <rect x={-560} y={-360} width={60} height={720} rx={20} fill={C.yellow} opacity={0.6} />
        {[-210, -105, 0, 105, 210].map((ly) => (
          <line key={ly} x1={-480} y1={ly + 42} x2={520} y2={ly + 42} stroke="#d6e2f2" strokeWidth={3} />
        ))}
        <Txt x={-150} y={-268} size={54} weight={900}>
          5 шагов на неделю
        </Txt>
      </g>
      {stamp > 0.01 && (
        <g transform={`translate(${cx + 400} 150) rotate(-10) scale(${stamp})`}>
          <rect x={-170} y={-40} width={340} height={76} rx={14} fill="none" stroke={C.green} strokeWidth={6} />
          <Txt x={0} y={12} size={34} color={C.green}>
            без инвестиций
          </Txt>
        </g>
      )}
      {STEPS.map((s, i) => {
        const k = pop(t, at(c, when[i]));
        if (k <= 0.01) return null;
        const y = 290 + i * 105;
        return (
          <g key={i} transform={`translate(${cx - 430} ${y}) scale(${k})`} opacity={clamp01(k * 2)}>
            <circle cx={0} cy={0} r={34} fill={s.color} />
            <Txt x={0} y={14} size={38} color="#fff" weight={900}>
              {String(i + 1)}
            </Txt>
            <text x={60} y={14} fontFamily={FONT} fontWeight={900} fontSize={42} fill={C.ink}>
              {s.label}
            </text>
            <g transform="translate(700 0)">
              <StepIcon i={i} t={t} />
            </g>
            <rect x={800} y={-32} width={64} height={64} rx={12} fill="#fff" stroke={s.color} strokeWidth={5} />
            <Check x={832} y={0} s={30} k={ramp(t, at(c, when[i] + 0.3), 0.4)} color={s.color} />
          </g>
        );
      })}
      {done > 0.01 && (
        <g transform={`translate(${cx} 800) scale(${done})`}>
          <Tag x={0} y={0} text="одна фраза о своей игре" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ───────────── s49: прощание ─────────────
export const Goodbye: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rays = ramp(t, 0.2, 1);
  const calm = pop(t, at(c, 0.5));
  const free = pop(t, at(c, 1.2));
  const logo = pop(t, at(c, 2));
  const thanks = pop(t, at(c, 2.4));
  const gather = (d: number) => ramp(t, d, 1.2);
  const items = [
    { x: 260, y: 360, d: 0.3 },
    { x: 1660, y: 360, d: 0.6 },
    { x: 280, y: 690, d: 0.9 },
    { x: 1640, y: 690, d: 1.2 },
  ];
  return (
    <g>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + t * 0.12;
        return <path key={i} d={`M 960 470 L ${960 + Math.cos(a) * 1500} ${470 + Math.sin(a) * 1500} L ${960 + Math.cos(a + 0.12) * 1500} ${470 + Math.sin(a + 0.12) * 1500} Z`} fill="#fff" opacity={0.2 * rays} />;
      })}
      {/* главные образы фильма собираются вокруг банана */}
      {items.map((it, i) => {
        const k = gather(it.d) * (1 - ramp(t, at(c, 1.9), 0.6));
        if (k <= 0.01) return null;
        const fromX = it.x < 960 ? -300 : 2220;
        const x = fromX + (it.x - fromX) * k;
        const y = it.y + wob(t, i, 8);
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={clamp01(k * 2)}>
            <circle r={150} fill="#fff" opacity={0.55} />
            {i === 0 && <Jar x={0} y={10} s={0.6} level={0.75} t={t} />}
            {i === 1 && (
              <g>
                <Watch x={-30} y={-20} s={0.75} a={t * 10} />
                <Key x={40} y={70} s={0.6} rot={-25} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={-140} y={-10} width={280} height={110} rx={20} fill="#9fd6f2" opacity={0.8} />
                <path d="M -60 0 L 0 -90 L 60 0 Z" fill="#fff" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
                <path d="M -60 0 L 60 0 L 100 80 L -110 90 Z" fill="#d7efff" stroke={OL} strokeWidth={4} strokeLinejoin="round" opacity={0.85} />
              </g>
            )}
            {i === 3 && <Bridge x={0} y={-30} s={0.32} k={1} />}
          </g>
        );
      })}
      {calm > 0.01 && (
        <g transform={`translate(330 170) scale(${calm}) rotate(${wob(t, 3, 1.5)})`}>
          <Tag x={0} y={0} text="терпение и спокойствие" size={36} color="#fff" />
        </g>
      )}
      {free > 0.01 && (
        <g transform={`translate(1590 170) scale(${free}) rotate(${wob(t, 4, 1.5)})`}>
          <Tag x={0} y={0} text="свобода времени" size={36} color={C.yellow} />
        </g>
      )}
      {/* логотип BanaMind */}
      {logo > 0.01 && (
        <g transform={`translate(1580 ${470 + wob(t, 5, 4)}) scale(${logo})`}>
          <rect x={-290} y={-170} width={580} height={330} rx={44} fill="#1d2333" />
          <text x={0} y={-40} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={104}>
            <tspan fill="#ffffff">Bana</tspan>
            <tspan fill="#ffd23f">Mind</tspan>
          </text>
          <Txt x={0} y={40} size={42} weight={800} color="#ffffff">
            {"Большие идеи.\nПростыми словами."}
          </Txt>
        </g>
      )}
      {thanks > 0.01 && (
        <g transform={`translate(340 420) scale(${thanks}) rotate(${wob(t, 1, 3)})`}>
          <Heart x={0} y={-110} s={1.6} color={C.coral} />
          <Tag x={0} y={0} text="Спасибо!" size={60} color={C.yellow} />
        </g>
      )}
      {thanks > 0.01 && (
        <g transform={`translate(340 590) scale(${pop(t, at(c, 2.6))}) rotate(${wob(t, 2, 3)})`}>
          <Tag x={0} y={0} text="до встречи!" size={48} color="#fff" />
        </g>
      )}
      {logo > 0.01 &&
        Array.from({ length: 10 }).map((_, i) => {
          const a = i * 2.4;
          const r = 120 + ((t * 60 + i * 37) % 260);
          return <circle key={i} cx={340 + Math.cos(a) * r * 0.9} cy={500 + Math.sin(a) * r * 0.6} r={8} fill={[C.yellow, C.coral, C.sky, C.green][i % 4]} opacity={logo * (1 - (r - 120) / 260)} />;
        })}
    </g>
  );
};
