// Вступление: крючок с табличкой должности, три вопроса книги, «трейлер» разбора,
// ведущий и книга.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import type { HostSpot } from "../types";
import { Badge, Chair, Desk, Mountain, OL, Plate, Skier, Sprout, WateringCan, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// центр области схемы в зависимости от места банана
export const zoneX = (host: unknown) => {
  const h = host as HostSpot;
  return h === "left" ? 1170 : h === "right" ? 760 : h === "corner" ? 1080 : h === "peek" ? 720 : 960;
};

export const HookBadge: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = 700;
  const office = pop(t, 0.15);
  const noOffice = ramp(t, at(c, 0.3), 0.5);
  const noTitle = ramp(t, at(c, 0.55), 0.5);
  const noTeam = ramp(t, at(c, 0.8), 0.5);
  const fall = ramp(t, at(c, 0.6), 0.9);
  const badge = pop(t, at(c, 1));
  const yes = ramp(t, at(c, 1.7), 0.5);
  const glow = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <g>
      {/* кабинет: стол, кресло, табличка, «подчинённые» */}
      <g transform={`translate(${x} 640) scale(${0.85 + 0.15 * office})`} opacity={clamp01(office * 2) * (1 - 0.65 * badge)}>
        <Chair x={-20} y={0} s={1} />
        <Desk x={0} y={40} s={0.95} />
        <g opacity={1 - noOffice * 0.6}>
          <Plate x={0} y={interpolate(fall, [0, 1], [-330, 230])} rot={fall * 38} text="ДИРЕКТОР" s={0.9} />
        </g>
        {[-430, -330, 330, 430].map((dx, i) => (
          <g key={i} opacity={1 - noTeam}>
            <Worker x={dx} y={150 - noTeam * 40} s={0.8} role="clerk" t={t} mood="flat" />
          </g>
        ))}
        <Cross x={0} y={-60} s={110} k={noOffice} />
      </g>
      {/* три «нет» */}
      {[
        { k: noOffice, y: 250, text: "нет кабинета" },
        { k: noTitle, y: 330, text: "нет должности" },
        { k: noTeam, y: 410, text: "нет подчинённых" },
      ].map((it, i) =>
        it.k > 0 ? (
          <g key={i} transform={`translate(${70 + (1 - it.k) * -60} ${it.y})`} opacity={it.k * (1 - badge * 0.5)}>
            <rect x={0} y={-44} width={330} height={62} rx={31} fill="#fff" stroke={OL} strokeWidth={3} />
            <Txt x={165} y={0} size={34} color={C.ink}>
              {it.text}
            </Txt>
          </g>
        ) : null,
      )}
      {/* бейдж «Человек» */}
      {badge > 0.01 && (
        <g transform={`translate(${x + 40} ${470 + wob(t, 1, 5)}) scale(${badge * 1.15}) rotate(${(1 - badge) * -20 + wob(t, 2, 2)})`}>
          <circle r={260} fill={C.yellow} opacity={0.25 * yes * glow} />
          <Badge x={0} y={60} text="Человек" sub="ДОЛЖНОСТЬ" />
          <g transform="translate(200 -120)">
            <circle r={58} fill={yes > 0.5 ? C.green : C.yellow} stroke={OL} strokeWidth={5} />
            {yes < 0.5 ? (
              <Txt x={0} y={30} size={84} weight={900}>
                ?
              </Txt>
            ) : (
              <Check x={0} y={4} s={44} k={yes * 2 - 1} color="#fff" />
            )}
          </g>
        </g>
      )}
      <Pop t={t} at={at(c, 1.25)} x={x + 60} y={150}>
        <Txt x={0} y={0} size={58} weight={900} color={C.ink}>
          Лидер без титула?
        </Txt>
      </Pop>
    </g>
  );
};

// карточка-вопрос с картинкой
const QCard: React.FC<{ t: number; k: number; small: number; x: number; y: number; title: string; children: React.ReactNode }> = ({ k, small, x, y, title, children }) => {
  if (k <= 0.001) return null;
  const s = 0.86 - small * 0.43;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * k)})`} opacity={clamp01(k * 1.6)}>
      <Panel x={-380} y={-300} w={760} h={560} fill="#fffdf6" r={40} />
      <g>{children}</g>
      <rect x={-340} y={150} width={680} height={80} rx={40} fill={C.yellow} />
      <Txt x={0} y={204} size={40} weight={900}>
        {title}
      </Txt>
    </g>
  );
};

export const Teaser: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const k = [0, 1, 2].map((i) => pop(t, at(c, i) + 0.05));
  const sm = [0, 1, 2].map((i) => (i < 2 ? ramp(t, at(c, i + 1) - 0.2, 0.5) : 0));
  // текущая карточка в центре, прошлые — мини в ряд сверху
  const pos = (i: number) => {
    const m = sm[i];
    return { x: interpolate(m, [0, 1], [cx, cx - 380 + i * 380]), y: interpolate(m, [0, 1], [590, 200]) };
  };
  return (
    <g>
      <QCard t={t} k={k[0]} small={sm[0]} {...pos(0)} title="горничная сильнее директора?">
        <Worker x={-150} y={110} s={1.35} role="maid" t={t} arms={0.5} />
        <Worker x={160} y={110} s={1.35} role="boss" t={t} mood="flat" />
        <g transform={`translate(160 -200)`}>
          <rect x={-70} y={-24} width={140} height={44} rx={8} fill="#e8c96a" stroke={OL} strokeWidth={3} />
          <Txt x={0} y={9} size={22}>
            ДИРЕКТОР
          </Txt>
        </g>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M -150 -170 m ${-40 + i * 40} 0 l 6 -30`} stroke={C.yellowDeep} strokeWidth={6} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 4 + i)} />
        ))}
      </QCard>
      <QCard t={t} k={k[1]} small={sm[1]} {...pos(1)} title="наклониться вперёд?">
        <path d="M -360 120 L 360 -140 L 360 130 L -360 130 Z" fill="#eef6ff" />
        <path d="M -360 120 L 360 -140" stroke="#9cb3c9" strokeWidth={6} />
        <Skier x={20 + Math.sin(t * 1.2) * 20} y={-10} s={1} lean={0.8} slope={-20} t={t} />
        <g transform="translate(-200 -150)">
          <Arrow x1={0} y1={0} x2={120} y2={-30} k={1} color={C.green} w={10} />
        </g>
      </QCard>
      <QCard t={t} k={k[2]} small={sm[2]} {...pos(2)} title="садовник = лидер?">
        <Worker x={-150} y={110} s={1.3} role="gardener" t={t} />
        <WateringCan x={-50} y={-10} s={0.8} rot={20} pour={t} />
        {[0, 1, 2].map((i) => (
          <Sprout key={i} x={90 + i * 90} y={110} s={1.2} grow={clamp01((t - at(c, 2)) / 2 - i * 0.15)} t={t} />
        ))}
      </QCard>
    </g>
  );
};

const WORDS: { w: string; color: string }[] = [
  { w: "IMAGE", color: C.skyDeep },
  { w: "SPARK", color: C.violet },
  { w: "HUMAN", color: C.green },
  { w: "SHINE", color: C.yellowDeep },
];

export const LetterTile: React.FC<{ x: number; y: number; ch: string; color: string; s?: number; k?: number }> = ({ x, y, ch, color, s = 1, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * k})`} opacity={clamp01(k * 1.5)}>
    <rect x={-46} y={-50} width={92} height={100} rx={18} fill={color} stroke={OL} strokeWidth={4} />
    <rect x={-46} y={-50} width={92} height={40} rx={18} fill="#fff" opacity={0.18} />
    <text x={0} y={24} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={66} fill="#fff">
      {ch}
    </text>
  </g>
);

export const Trailer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const head = pop(t, 0.2);
  const steps = pop(t, at(c, 2.1));
  return (
    <g>
      <g transform={`translate(${cx} 190) scale(${head})`}>
        <Txt x={0} y={0} size={56} weight={900}>
          4 принципа · 20 правил
        </Txt>
      </g>
      {WORDS.map((wd, wi) => {
        const base = at(c, 1) + wi * 0.55;
        const y = 330 + wi * 125;
        return (
          <g key={wd.w}>
            {wd.w.split("").map((ch, li) => {
              const k = pop(t, base + li * 0.07);
              const fly = 1 - clamp01(k);
              return <LetterTile key={li} x={cx - 230 + li * 112 + fly * (li - 2) * 80} y={y - fly * 60} ch={ch} color={wd.color} s={0.95} k={k} />;
            })}
          </g>
        );
      })}
      {/* до появления слов — пять «пустых» плиток пульсируют */}
      {t < at(c, 1) &&
        [0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((l) => (
            <rect key={`${r}${l}`} x={cx - 276 + l * 112} y={280 + r * 125} width={92} height={100} rx={18} fill="#fff" opacity={0.35 + 0.25 * Math.sin(t * 4 + r + l)} stroke={OL} strokeWidth={2} />
          )),
        )}
      {steps > 0 && (
        <g transform={`translate(${cx + 420} 520) scale(${steps}) rotate(${4 + wob(t, 1, 1)})`}>
          <Panel x={-150} y={-190} w={300} h={380} fill="#fff" r={28} />
          <Txt x={0} y={-130} size={34} weight={900}>
            5 шагов
          </Txt>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={-110} y={-96 + i * 56} width={34} height={34} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
              <Check x={-93} y={-80 + i * 56} s={18} k={ramp(t, at(c, 2.3) + i * 0.25, 0.3)} />
              <rect x={-60} y={-86 + i * 56} width={160 - (i % 2) * 40} height={14} rx={7} fill="#d7dde8" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// обложка книги — собственная простая графика, не копия издательской обложки
export const LeaderBook: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 150 -210 L 176 -196 L 176 224 L 150 210 Z" fill="#f4ecd8" stroke={OL} strokeWidth={4} />
    <rect x={-150} y={-210} width={300} height={420} rx={14} fill="#1f3a5f" stroke={OL} strokeWidth={5} />
    <rect x={-150} y={-210} width={30} height={420} rx={10} fill="#000" opacity={0.2} />
    <rect x={-104} y={-176} width={236} height={352} rx={10} fill="none" stroke="#e8c96a" strokeWidth={4} />
    <text x={14} y={-96} textAnchor="middle" fontFamily="PT Serif, serif" fontWeight={700} fontSize={26} fill="#e8c96a">
      Робин Шарма
    </text>
    <text x={14} y={-20} textAnchor="middle" fontFamily="PT Serif, serif" fontWeight={700} fontSize={50} fill="#fff8e6">
      Лидер
    </text>
    <text x={14} y={36} textAnchor="middle" fontFamily="PT Serif, serif" fontWeight={700} fontSize={42} fill="#fff8e6">
      без титула
    </text>
    <path d="M -40 80 L 68 80" stroke="#e8c96a" strokeWidth={3} />
    <g transform="translate(14 130)">
      <path d="M 0 -26 L 7 -7 L 26 0 L 7 7 L 0 26 L -7 7 L -26 0 L -7 -7 Z" fill="#e8c96a" />
    </g>
  </g>
);

export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const brand = pop(t, 0.2);
  const book = pop(t, at(c, 1));
  const fict = ramp(t, at(c, 2), 0.6);
  const ideas = ramp(t, at(c, 2.5), 0.6);
  const swap = ramp(t, at(c, 3), 0.7);
  const go = pop(t, at(c, 4));
  const bookFade = 1 - swap * 0.5;
  return (
    <g>
      {/* знак канала */}
      <g transform={`translate(${cx} ${180 - (book > 0 ? 40 : 0) * book}) scale(${brand * (1 - 0.35 * book)})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily="Rubik, Nunito" fontWeight={900} fontSize={110}>
          <tspan fill={C.ink}>Bana</tspan>
          <tspan fill="#e09a00">Mind</tspan>
        </text>
        <Txt x={0} y={58} size={34} weight={800} color={C.inkSoft}>
          Big Ideas. Simply Explained.
        </Txt>
      </g>
      {book > 0 && (
        <g opacity={bookFade}>
          <LeaderBook x={cx - 250} y={560} s={0.95 * book} rot={-5 + wob(t, 1, 1.5)} />
        </g>
      )}
      <g opacity={1 - ramp(t, at(c, 4), 0.4)}>
        <Pop t={t} at={at(c, 1.5)} x={cx - 250} y={830}>
          <Tag x={0} y={0} text="притча" size={36} color={C.yellow} />
        </Pop>
      </g>
      {/* герои вымышлены, идеи — в центре */}
      {fict > 0 && (
        <g transform={`translate(${cx + 230} 500)`} opacity={fict * (1 - swap * 0.4)}>
          <Panel x={-230} y={-190} w={460} h={300} fill="#fff" r={30} />
          {[-140, -45, 50, 145].map((dx, i) => (
            <g key={i} opacity={0.55}>
              <Worker x={dx} y={40} s={0.75} role={(["maid", "skier", "gardener", "masseur"] as const)[i]} t={t} />
            </g>
          ))}
          <g transform="rotate(-8)">
            <rect x={-180} y={-150} width={360} height={64} rx={14} fill="#fff" stroke={C.red} strokeWidth={5} />
            <Txt x={0} y={-105} size={34} color={C.red} weight={900}>
              герои вымышлены
            </Txt>
          </g>
        </g>
      )}
      {ideas > 0 && (
        <g transform={`translate(${cx + 230} ${720 - (1 - ideas) * 40})`} opacity={ideas}>
          <rect x={-200} y={-46} width={400} height={80} rx={40} fill={C.green} />
          <Txt x={0} y={10} size={36} color="#fff" weight={900}>
            идеи — реальны
          </Txt>
        </g>
      )}
      {swap > 0 && (
        <g opacity={swap}>
          <g transform={`translate(${cx - 250} 300)`}>
            <rect x={-170} y={-40} width={340} height={70} rx={35} fill="#fff" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={10} size={32}>
              пересказ романа
            </Txt>
            <Cross x={150} y={-10} s={60} k={ramp(t, at(c, 3.2), 0.5)} />
          </g>
          <g transform={`translate(${cx + 230} 300)`}>
            <rect x={-170} y={-40} width={340} height={70} rx={35} fill={C.yellow} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={10} size={32}>
              разбор идей
            </Txt>
            <Check x={150} y={-10} s={40} k={ramp(t, at(c, 3.5), 0.5)} />
          </g>
        </g>
      )}
      {go > 0 && (
        <g transform={`translate(${cx} 840) scale(${go})`}>
          <Arrow x1={-220} y1={0} x2={220} y2={0} k={ramp(t, at(c, 4), 0.8)} color={C.skyDeep} w={14} />
          <Txt x={0} y={-30} size={36} weight={900} color={C.skyDeep}>
            поехали!
          </Txt>
        </g>
      )}
    </g>
  );
};

export { Mountain };
