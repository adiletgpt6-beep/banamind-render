// Сцены фильтров 1–4: уступка, подарок или приём, вечеринка-продажа, открытки
// «Вы мне нравитесь», зеркальное фото, лагерь, синоптик, взгляд в небо,
// закадровый смех, бассейн, тележки, зов о помощи.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FC, FONT } from "../theme";
import { Card, Gift, Label, OL, Person, PriceTag } from "./draw";
import { dotsOf, hash, SH, Swarm } from "./dots";
import { Appear, area, Arrow, at, Check, clamp01, Cross, Drift, ease, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string };

// ── Отказ — затем отступление: большая просьба сжимается в маленькую ──
export const Concession: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const big = ramp(t, at(ctx, 0.3), 0.5);
  const no = ramp(t, at(ctx, 1), 0.4);
  const shrink = ramp(t, at(ctx, 1.25), 0.8);
  const back = ramp(t, at(ctx, 1.7), 0.6);
  const stat = ramp(t, at(ctx, 2.3), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Person who="kid" x={cx + 300} y={940} s={1.05} mood={no > 0.5 && shrink < 0.5 ? "doubt" : "happy"} pose="give" t={t} flip />
      <Person who="boss" x={cx - 340} y={940} s={0.95} mood={back > 0.5 ? "doubt" : "neutral"} pose={no > 0.3 && shrink < 0.5 ? "stop" : back > 0.3 ? "take" : "stand"} t={t} />
      {/* просьба: билеты 5 $ → шоколад 1 $ */}
      <g opacity={big} transform={`translate(${cx + 40} ${420}) scale(${1 - 0.45 * shrink})`}>
        {shrink < 0.5 ? (
          <g>
            <rect x={-170} y={-90} width={340} height={180} rx={20} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-10} size={44}>
              билеты
            </Txt>
            <Txt x={0} y={52} size={56}>
              5 $
            </Txt>
          </g>
        ) : (
          <g>
            <rect x={-170} y={-90} width={340} height={180} rx={20} fill="#7a4a30" stroke={OL} strokeWidth={5} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={-150 + i * 76} y={-70} width={66} height={140} rx={8} fill="#8f5a3a" stroke="#5a3424" strokeWidth={3} />
            ))}
            <Txt x={0} y={150} size={70} color="#fff">
              1 $
            </Txt>
          </g>
        )}
      </g>
      <Cross x={cx + 40} y={420} s={160} k={no * (1 - shrink)} />
      {back > 0 && (
        <g opacity={back}>
          <Arrow x1={cx + 180} y1={250} x2={cx - 40} y2={250} k={back} color={FC.recip.color} w={12} />
          <Arrow x1={cx - 200} y1={310} x2={cx - 20} y2={310} k={ramp(t, at(ctx, 1.9))} color="#fff" w={12} />
          <Label x={cx + 40} y={190} text="уступка ↔ уступка" size={32} bg={FC.recip.light} border={FC.recip.deep} />
        </g>
      )}
      {stat > 0 && (
        <g opacity={stat} transform={`translate(${cx - 340} 300)`}>
          <Txt x={0} y={0} size={58} color="#fff">
            17 % → 50 %
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Подарок или приём: две карточки, честный подарок принимаем, трюк называем ──
export const GiftVsTrick: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const l = ramp(t, at(ctx, 0.2), 0.6);
  const r = ramp(t, at(ctx, 1), 0.6);
  const reveal = ramp(t, at(ctx, 1.4), 0.8);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g opacity={l} transform={`translate(${cx - 300} ${520 + (1 - l) * 30})`}>
        <rect x={-250} y={-260} width={500} height={520} rx={36} fill={FC.recip.light} stroke={OL} strokeWidth={5} />
        <Gift x={0} y={-60} s={1.6} open={0.2 + 0.15 * Math.sin(t * 2)} />
        <Txt x={0} y={110} size={44}>
          честный подарок
        </Txt>
        <Label x={0} y={190} text="спасибо!" size={36} bg="#fff" />
        <Check x={180} y={-200} s={50} k={ramp(t, at(ctx, 0.6))} />
      </g>
      <g opacity={r} transform={`translate(${cx + 300} ${520 + (1 - r) * 30})`}>
        <rect x={-250} y={-260} width={500} height={520} rx={36} fill="#ffe6e0" stroke={OL} strokeWidth={5} />
        <g transform={`translate(0 ${-60}) rotate(${reveal * -8})`}>
          <Gift x={0} y={0} s={1.6} open={reveal} color="#f08a7a" />
          {reveal > 0.3 && <PriceTag x={0} y={-60 - reveal * 60} text="счёт" s={0.9} color="#ffd0c8" />}
        </g>
        <Txt x={0} y={110} size={44}>
          приём продаж
        </Txt>
        <Label x={0} y={190} text="назову как есть" size={36} bg="#fff" />
      </g>
      <Appear t={t} at={at(ctx, 1.6)} x={cx} y={180}>
        <Card x={0} y={0} w={760} h={100} lines={["на трюк не отвечают услугой"]} size={40} fill={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Домашняя вечеринка-продажа: подруга-хозяйка, контейнеры, сердечки ──
export const Party: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const buy = ramp(t, at(ctx, 1), 0.8);
  const boxes = [FC.recip.color, FC.liking.color, FC.social.color, FC.scarcity.color];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* гостиная: стол с контейнерами */}
      <rect x={cx - 560} y={720} width={1120} height={30} rx={12} fill={C.deskTop} stroke={OL} strokeWidth={4} />
      {boxes.map((c, i) => (
        <g key={i} transform={`translate(${cx - 180 + i * 120} ${690 + wob(t, i, 2)})`}>
          <rect x={-46} y={-60} width={92} height={60} rx={12} fill={c} fillOpacity={0.75} stroke={OL} strokeWidth={4} />
          <rect x={-50} y={-72} width={100} height={18} rx={8} fill={c} stroke={OL} strokeWidth={4} />
        </g>
      ))}
      <Person who="friend" x={cx} y={1000} s={0.75} mood="happy" pose="wave" t={t} />
      <Label x={cx} y={290} text="хозяйка — ваша подруга" size={32} bg={FC.liking.light} border={FC.liking.deep} />
      {[-1, 1].map((d, i) => (
        <Person key={i} who={i ? "neighbor" : "anna"} x={cx + d * 420} y={1000} s={0.72} mood={buy > 0.5 ? "smile" : "think"} pose={buy > 0.5 && i === 0 ? "take" : "stand"} t={t} flip={d > 0} seed={i} />
      ))}
      {/* сердечки от подруги к гостям */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const ph = ((t * 0.5 + i / 6) % 1);
        const d = i % 2 ? 1 : -1;
        return (
          <path key={i} d="M 0 10 C -24 -8 -12 -26 0 -12 C 12 -26 24 -8 0 10 Z" transform={`translate(${cx + d * ph * 380} ${520 - Math.sin(ph * Math.PI) * 120}) scale(1.4)`} fill={FC.liking.color} stroke={OL} strokeWidth={2} opacity={Math.sin(ph * Math.PI)} />
        );
      })}
      {buy > 0 && (
        <g opacity={buy} transform={`translate(${cx - 420} 420)`}>
          <Card x={0} y={0} w={380} h={120} lines={["покупаю дружбу?"]} size={36} fill="#fff" edge={FC.liking.color} />
        </g>
      )}
    </Drift>
  );
};

// ── Открытки «Вы мне нравитесь»: стопка растёт, затем сходство имён ──
export const CardsPile: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k = ramp(t, at(ctx, 0.2), 2.4);
  const names = ramp(t, at(ctx, 1), 0.6);
  const praise = ramp(t, at(ctx, 2), 0.6);
  const n = 26;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {Array.from({ length: n }).map((_, i) => {
        const ki = clamp01(k * n - i);
        if (ki <= 0) return null;
        const tx = cx - 470 + (hash(i, 1) - 0.5) * 180;
        const ty = 720 - i * 9;
        return (
          <g key={i} transform={`translate(${tx + (1 - ki) * 500} ${ty - (1 - ki) * 300}) rotate(${(hash(i, 2) - 0.5) * 24})`} opacity={names > 0.5 ? 0.5 : 1}>
            <rect x={-120} y={-74} width={240} height={148} rx={10} fill="#fff" stroke={OL} strokeWidth={3} />
            <path d="M 0 22 C -34 -4 -18 -32 0 -14 C 18 -32 34 -4 0 22 Z" fill={FC.liking.color} transform="translate(-60 0) scale(0.8)" />
            <text x={30} y={10} fontFamily={FONT} fontWeight={900} fontSize={20} fill={C.ink} textAnchor="middle">
              Вы мне
            </text>
            <text x={30} y={34} fontFamily={FONT} fontWeight={900} fontSize={20} fill={C.ink} textAnchor="middle">
              нравитесь
            </text>
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0.4)} x={cx - 470} y={300}>
        <Label x={0} y={0} text="13 000 × 12 раз в год" size={34} bg={C.yellow} />
      </Appear>
      {names > 0 && (
        <g opacity={names} transform={`translate(${cx + 260} 470)`}>
          <Card x={0} y={-120} w={460} h={110} lines={["Роберт Грир"]} size={40} fill="#fff" title="получатель" />
          <Card x={0} y={70} w={460} h={110} lines={["Боб Грегар"]} size={40} fill={FC.liking.light} title="отправитель" />
          <Txt x={0} y={260} size={46} color={C.yellow}>
            ответов почти ×2
          </Txt>
        </g>
      )}
      {praise > 0 && (
        <g opacity={praise}>
          <Label x={cx + 260} y={200} text="похвала — даже корыстная — греет" size={30} bg={FC.liking.light} border={FC.liking.deep} />
        </g>
      )}
    </Drift>
  );
};

// ── Зеркальное фото: два портрета, «вам» и «другу» ──
const Portrait: React.FC<{ x: number; y: number; flip?: boolean; s?: number }> = ({ x, y, flip, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-150} y={-190} width={300} height={380} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
    <rect x={-130} y={-170} width={260} height={300} rx={12} fill="#cfe2ff" />
    <g transform={`scale(${flip ? -1 : 1} 1)`}>
      <path d="M -70 -60 Q -80 -140 0 -140 Q 70 -140 90 -80 Q 40 -110 -20 -100 Q -50 -96 -70 -60 Z" fill="#5a3a2a" stroke={OL} strokeWidth={4} />
      <ellipse cx={0} cy={-30} rx={74} ry={86} fill={C.skin} stroke={OL} strokeWidth={4} />
      <path d="M -74 -60 Q -40 -120 30 -110 Q 80 -100 76 -40 Q 40 -90 -74 -60 Z" fill="#5a3a2a" stroke={OL} strokeWidth={4} />
      <ellipse cx={-26} cy={-30} rx={7} ry={9} fill={OL} />
      <ellipse cx={26} cy={-30} rx={7} ry={9} fill={OL} />
      <path d="M -24 20 Q 4 34 30 16" stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={40} cy={4} r={5} fill="#a0603a" />
    </g>
    <path d="M -80 130 Q 0 70 80 130 L 100 190 L -100 190 Z" fill={FC.liking.color} stroke={OL} strokeWidth={4} />
  </g>
);
export const Mirror: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const two = ramp(t, at(ctx, 0.5), 0.6);
  const votes = ramp(t, at(ctx, 1.2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Appear t={t} at={at(ctx, 0.2)} x={cx - 240} y={500}>
        <Portrait x={0} y={0} />
        <Txt x={0} y={250} size={36} color="#fff">
          настоящее
        </Txt>
      </Appear>
      <g opacity={two} transform={`translate(${cx + 240} ${500 + (1 - two) * 30})`}>
        <Portrait x={0} y={0} flip />
        <Txt x={0} y={250} size={36} color="#fff">
          зеркальное
        </Txt>
      </g>
      {votes > 0 && (
        <g opacity={votes}>
          <Label x={cx + 240} y={250} text="нравится вам" size={32} bg={FC.liking.light} border={FC.liking.deep} />
          <Label x={cx - 240} y={250} text="нравится другу" size={32} bg={C.yellow} />
          <Check x={cx + 370} y={330} s={44} k={votes} color={FC.liking.deep} />
          <Check x={cx - 110} y={330} s={44} k={ramp(t, at(ctx, 1.5))} color={C.gold} />
        </g>
      )}
    </Drift>
  );
};

// ── Лагерь: две команды-«тучки» точек, грузовик, одна общая команда ──
export const Camp: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const split = ramp(t, at(ctx, 0.3), 1);
  const truck = ramp(t, at(ctx, 1.2), 0.6);
  const push = ramp(t, at(ctx, 1.5), 2);
  const groupL = dotsOf("camp-l", SH.circle(130), cx - 380, 520, ["#3d8bff", "#1f5fcc", "#cfe2ff"], 22, 160);
  const groupR = dotsOf("camp-r", SH.circle(130), cx + 380, 520, ["#ff9a2e", "#d86d00", "#ffe0bd"], 22, 160);
  // при общем деле две команды сливаются в одну общую группу за грузовиком
  const team = dotsOf("camp-team", SH.circle(150), cx - 250, 600, ["#fff"], 21, 180);
  const chain = (pts: typeof groupL, side: number) =>
    pts.map((q, i) => {
      const target = team[(i * 2 + (side > 0 ? 1 : 0)) % team.length];
      const k = ease(clamp01(push * 1.4 - hash(i, side + 5) * 0.4));
      return { ...q, x: q.x + (target.x - q.x) * k, y: q.y + (target.y - q.y) * k };
    });
  const tx = interpolate(push, [0.5, 1], [0, 240], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Swarm pts={truck > 0 ? chain(groupL, -1) : groupL} k={split} t={t} r={8} from="scatter" spread={400} />
      <Swarm pts={truck > 0 ? chain(groupR, 1) : groupR} k={split} t={t} r={8} from="scatter" spread={400} seed={3} />
      <g opacity={1 - truck}>
        <Label x={cx - 380} y={330} text="Орлы" size={36} bg="#cfe2ff" />
        <Label x={cx + 380} y={330} text="Гремучие змеи" size={36} bg="#ffe0bd" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${cx - 60} ${470 + i * 40} L ${cx - 20} ${490 + i * 40} L ${cx + 20} ${470 + i * 40} L ${cx + 60} ${490 + i * 40}`} stroke={C.red} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 5 + i)} />
        ))}
      </g>
      {truck > 0 && (
        <g opacity={truck} transform={`translate(${cx + 150 + tx * 0.6} 640)`}>
          <rect x={-170} y={-120} width={240} height={140} rx={14} fill="#e5c34a" stroke={OL} strokeWidth={5} />
          <rect x={70} y={-80} width={110} height={100} rx={14} fill="#e5c34a" stroke={OL} strokeWidth={5} />
          <rect x={92} y={-62} width={60} height={42} rx={6} fill="#cfe2ff" stroke={OL} strokeWidth={3} />
          {[-110, 120].map((x) => (
            <g key={x} transform={`translate(${x} 30) rotate(${tx * 2})`}>
              <circle r={36} fill="#3a3f5a" stroke={OL} strokeWidth={5} />
              <rect x={-4} y={-30} width={8} height={60} fill="#9aa3c0" />
            </g>
          ))}
          <Label x={0} y={-180} text="еда для всех" size={30} />
        </g>
      )}
      <Appear t={t} at={at(ctx, 1.7)} x={cx} y={250}>
        <Card x={0} y={0} w={560} h={100} lines={["общее дело → «мы»"]} size={42} fill={C.yellow} />
      </Appear>
    </Drift>
  );
};

// ── Синоптик: тучи, гневные письма, затем «гонец ни при чём» ──
export const Weather: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const mail = ramp(t, at(ctx, 0.5), 1.6);
  const assoc = ramp(t, at(ctx, 1), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* экран ТВ */}
      <rect x={cx - 360} y={260} width={720} height={440} rx={30} fill="#2b2f52" stroke={OL} strokeWidth={6} />
      <rect x={cx - 330} y={290} width={660} height={380} rx={18} fill="#8fb6e0" />
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${cx - 120 + i * 220 + Math.sin(t + i) * 10} ${380 + i * 20})`}>
          <ellipse rx={90} ry={44} fill="#e8edf6" stroke={OL} strokeWidth={4} />
          <ellipse cx={-50} cy={10} rx={50} ry={34} fill="#e8edf6" stroke={OL} strokeWidth={4} />
          {[0, 1, 2, 3].map((d) => (
            <line key={d} x1={-40 + d * 26} y1={50 + ((t * 120 + d * 30) % 60)} x2={-46 + d * 26} y2={66 + ((t * 120 + d * 30) % 60)} stroke="#3d8bff" strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
      ))}
      <Person who="boss" x={cx + 200} y={700} s={0.55} mood={mail > 0.4 ? "shock" : "smile"} pose="point" t={t} flip />
      {Array.from({ length: 7 }).map((_, i) => {
        const k = clamp01(mail * 7 - i);
        if (k <= 0) return null;
        const sx = a.x0 + (i % 2 ? 80 : a.x1 - a.x0 - 80);
        const x = sx + (cx + 160 - sx) * ease(k);
        const y = 900 - Math.sin(k * Math.PI) * 300 - i * 6;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${(hash(i) - 0.5) * 40})`} opacity={1 - k * 0.3}>
            <rect x={-46} y={-30} width={92} height={60} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />
            <path d="M -46 -30 L 0 6 L 46 -30" fill="none" stroke={OL} strokeWidth={3} />
            <text x={0} y={22} fontFamily={DISPLAY} fontWeight={800} fontSize={26} fill={C.red} textAnchor="middle">
              !!!
            </text>
          </g>
        );
      })}
      {assoc > 0 && (
        <g opacity={assoc} transform={`translate(${cx} 860)`}>
          <Card x={0} y={0} w={760} h={100} lines={["рядом с плохой новостью = виноват?"]} size={38} fill={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Взгляд в небо: один смотрит — прохожие идут мимо; группа смотрит — все задирают голову ──
const Walker: React.FC<{ x: number; y: number; look: number; c: string; s?: number }> = ({ x, y, look, c, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-150} width={44} height={110} rx={20} fill={c} stroke={OL} strokeWidth={4} />
    <rect x={-18} y={-44} width={14} height={44} rx={6} fill="#3a3f5a" />
    <rect x={4} y={-44} width={14} height={44} rx={6} fill="#3a3f5a" />
    <g transform={`translate(0 -180) rotate(${-look * 35})`}>
      <circle r={30} fill={C.skin} stroke={OL} strokeWidth={4} />
      <circle cx={10} cy={-4 - look * 8} r={4} fill={OL} />
    </g>
  </g>
);
export const Sky: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const group = ramp(t, at(ctx, 0.5), 0.8);
  const crowd = ramp(t, at(ctx, 1), 2.5);
  const lookers = [cx - 60, cx, cx + 60];
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={a.x0} y={820} width={a.x1 - a.x0} height={24} rx={10} fill="#c9cfe0" opacity={0.6} />
      {/* пустое небо, куда все смотрят */}
      <circle cx={cx + 160} cy={240} r={70} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="12 14" opacity={0.6 + 0.3 * Math.sin(t * 3)} />
      <Txt x={cx + 160} y={252} size={36} color="#fff">
        ?
      </Txt>
      {lookers.map((x, i) => (
        <Walker key={i} x={x} y={820} look={i === 1 ? 1 : group} c={[C.yellow, "#ffb03b", "#f2a2c0"][i]} s={1.1} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => {
        const base = (t * 70 + i * 160) % (a.x1 - a.x0 + 200);
        const x = a.x0 - 100 + base;
        if (Math.abs(x - cx) < 140) return null;
        const look = clamp01(crowd * 10 - i) * (hash(i, 7) < 0.82 ? 1 : 0);
        return <Walker key={i} x={x} y={830 + (i % 3) * 12} look={look} c={["#8fb6ff", "#7be0a4", "#c9a7ff", "#ffd2a8"][i % 4]} s={0.85} />;
      })}
      <Appear t={t} at={at(ctx, 1.1)} x={cx - 400} y={300}>
        <Txt x={0} y={0} size={72} color={C.yellow}>
          80 %
        </Txt>
        <Txt x={0} y={50} size={30} color="#fff">
          прохожих подняли глаза
        </Txt>
      </Appear>
    </Drift>
  );
};

// ── Закадровый смех: ТВ, «ха-ха» из колонки, зритель смеётся ──
export const Laugh: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const opera = ramp(t, at(ctx, 1), 0.7);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g opacity={1 - opera}>
        <rect x={cx - 300} y={300} width={600} height={360} rx={26} fill="#2b2f52" stroke={OL} strokeWidth={6} />
        <rect x={cx - 272} y={328} width={544} height={304} rx={14} fill="#ffe6a8" />
        <Person who="neighbor" x={cx - 70} y={620} s={0.5} mood="smile" pose="shrug" t={t} />
        <Person who="friend" x={cx + 90} y={620} s={0.5} mood="happy" pose="point" t={t} flip />
        <g transform={`translate(${cx + 360} 380)`}>
          <rect x={-40} y={-60} width={80} height={120} rx={14} fill="#3a3f5a" stroke={OL} strokeWidth={4} />
          <circle r={28} fill="#22263a" stroke="#fff" strokeWidth={3} />
          {[0, 1, 2].map((i) => (
            <text key={i} x={60 + i * 30} y={-40 - i * 34 - ((t * 40) % 30)} fontFamily={DISPLAY} fontWeight={800} fontSize={40} fill={C.yellow} stroke={OL} strokeWidth={5} paintOrder="stroke" opacity={0.6 + 0.4 * Math.sin(t * 5 + i)}>
              ха!
            </text>
          ))}
          <Label x={0} y={110} text="запись" size={26} />
        </g>
        <Person who="anna" x={cx - 460} y={980} s={0.7} mood="happy" pose="stand" t={t} />
      </g>
      {opera > 0 && (
        <g opacity={opera}>
          <rect x={cx - 500} y={260} width={1000} height={480} rx={20} fill="#ffe6a8" stroke={OL} strokeWidth={5} />
          <rect x={cx - 520} y={720} width={1040} height={50} rx={10} fill="#a8724c" stroke={OL} strokeWidth={5} />
          <path d={`M ${cx - 500} 260 L ${cx - 260} 260 Q ${cx - 300} 500 ${cx - 380} 720 L ${cx - 500} 720 Z`} fill="#b03a4a" stroke={OL} strokeWidth={4} />
          <path d={`M ${cx + 500} 260 L ${cx + 260} 260 Q ${cx + 300} 500 ${cx + 380} 720 L ${cx + 500} 720 Z`} fill="#b03a4a" stroke={OL} strokeWidth={4} />
          <path d={`M ${cx - 510} 250 L ${cx + 510} 250 L ${cx + 510} 320 Q ${cx + 400} 290 ${cx + 255} 320 Q ${cx + 130} 290 ${cx} 320 Q ${cx - 130} 290 ${cx - 255} 320 Q ${cx - 400} 290 ${cx - 510} 320 Z`} fill="#8a2a3a" stroke={OL} strokeWidth={4} />
          <Person who="friend" x={cx} y={720} s={0.55} mood="happy" pose="arms" t={t} />
          {Array.from({ length: 9 }).map((_, i) => {
            const clap = Math.abs(Math.sin(t * 8 + i)) * 10;
            return (
              <g key={i} transform={`translate(${cx - 320 + i * 80} ${880})`}>
                <circle cy={-60} r={26} fill={i === 4 ? C.yellow : "#5a5f80"} stroke={OL} strokeWidth={3} />
                <rect x={-24} y={-36} width={48} height={60} rx={12} fill={i === 4 ? C.yellow : "#5a5f80"} stroke={OL} strokeWidth={3} />
                {i === 4 && (
                  <g>
                    <circle cx={-10 - clap} cy={-10} r={10} fill={C.skin} stroke={OL} strokeWidth={2} />
                    <circle cx={10 + clap} cy={-10} r={10} fill={C.skin} stroke={OL} strokeWidth={2} />
                  </g>
                )}
              </g>
            );
          })}
          <Label x={cx + 260} y={630} text="нанятый «клакёр»" size={32} bg={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Бассейн: Крис с кругом, Томми плавает сам, Крис снимает круг ──
export const Pool: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const tommy = ramp(t, at(ctx, 1), 0.6);
  const brave = ramp(t, at(ctx, 1.6), 1);
  const rule = ramp(t, at(ctx, 2), 0.6);
  const water = 640;
  const swimmer = (x: number, color: string, ring: number) => (
    <g transform={`translate(${x} ${water + Math.sin(t * 3 + x) * 6})`}>
      {ring > 0 && <ellipse cx={0} cy={4} rx={70} ry={26} fill="none" stroke="#ff7a59" strokeWidth={22} opacity={ring} />}
      <circle cy={-40} r={36} fill={C.skin} stroke={OL} strokeWidth={4} />
      <path d="M -36 -52 Q -30 -86 0 -86 Q 30 -86 36 -52 Q 18 -70 -36 -52 Z" fill={color} stroke={OL} strokeWidth={3} />
      <circle cx={-12} cy={-42} r={4} fill={OL} />
      <circle cx={12} cy={-42} r={4} fill={OL} />
      <path d="M -10 -24 Q 0 -16 10 -24" stroke={OL} strokeWidth={3} fill="none" />
      <path d={`M -60 0 Q -40 ${-10 + Math.sin(t * 6) * 10} -20 0 M 20 0 Q 40 ${-10 - Math.sin(t * 6) * 10} 60 0`} stroke={C.skin} strokeWidth={14} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={a.x0 + 40} y={water - 20} width={a.x1 - a.x0 - 80} height={360} rx={30} fill="#5fc4e8" stroke="#fff" strokeWidth={8} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${a.x0 + 80 + i * 200} ${water + 80 + (i % 2) * 60} q 30 -16 60 0 t 60 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.5} transform={`translate(${Math.sin(t + i) * 20} 0)`} />
      ))}
      {swimmer(cx - 220 + brave * 40, "#6a4428", 1 - brave)}
      <g opacity={tommy}>{swimmer(cx + 220, "#e0b25a", 0)}</g>
      <Label x={cx - 220} y={460} text="Крис, 3 года" size={30} />
      <g opacity={tommy}>
        <Label x={cx + 220} y={460} text="Томми, 3 года" size={30} bg={C.yellow} />
      </g>
      {brave > 0.3 && <Check x={cx - 120} y={420} s={44} k={ramp(t, at(ctx, 1.9))} />}
      {rule > 0 && (
        <g opacity={rule} transform={`translate(${cx} 230)`}>
          <Card x={0} y={0} w={740} h={110} lines={["похожие люди + неуверенность"]} size={40} fill={FC.social.light} edge={FC.social.color} />
        </g>
      )}
    </Drift>
  );
};

// ── Тележки: пустые тележки → нанятые «покупатели» → все с тележками ──
const Cart: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -70 -90 L 70 -90 L 56 -20 L -56 -20 Z" fill="#c9d3e6" fillOpacity={0.6} stroke={OL} strokeWidth={4} />
    {[-40, -10, 20, 50].map((d) => <line key={d} x1={d} y1={-90} x2={d - 6} y2={-20} stroke={OL} strokeWidth={2} />)}
    <path d="M 70 -90 L 96 -116" stroke={OL} strokeWidth={6} strokeLinecap="round" />
    <circle cx={-44} cy={0} r={12} fill="#3a3f5a" />
    <circle cx={44} cy={0} r={12} fill="#3a3f5a" />
  </g>
);
export const Carts: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const hired = ramp(t, at(ctx, 1), 0.6);
  const follow = ramp(t, at(ctx, 1.5), 1.5);
  const fake = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={a.x0} y={900} width={a.x1 - a.x0} height={20} rx={8} fill="#c9cfe0" opacity={0.5} />
      {/* стоящие без дела тележки */}
      {[0, 1, 2].map((i) => (
        <Cart key={i} x={cx - 480 + i * 60} y={900} s={0.9} />
      ))}
      <Label x={cx - 420} y={600} text="новинка: стеснялись" size={30} opacity={1 - hired} />
      {hired > 0 &&
        [0, 1].map((i) => {
          const x = interpolate(t, [at(ctx, 1), at(ctx, 1) + 6], [cx - 200 + i * 120, cx + 260 + i * 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={i} opacity={hired}>
              <Person who={i ? "guest" : "friend"} x={x - 70} y={900} s={0.55} mood="smile" pose="walk" t={t} seed={i} />
              <Cart x={x + 40} y={900} s={0.8} />
              {fake > 0 && <Label x={x} y={560} text="нанят" size={26} bg="#ffd0c8" opacity={fake} />}
            </g>
          );
        })}
      {follow > 0 &&
        [0, 1, 2].map((i) => {
          const k = clamp01(follow * 3 - i);
          const x = cx - 360 + i * 150 + k * 120;
          return (
            <g key={`f${i}`} opacity={k}>
              <Person who={(["grandma", "neighbor", "anna"] as const)[i]} x={x - 70} y={900} s={0.55} mood="happy" pose="walk" t={t} seed={i + 4} />
              <Cart x={x + 40} y={900} s={0.8} />
            </g>
          );
        })}
      <Appear t={t} at={at(ctx, 2.2)} x={cx} y={250}>
        <Card x={0} y={0} w={700} h={100} lines={["удобно — но толпа была нанята"]} size={38} fill={FC.social.light} edge={FC.social.color} />
      </Appear>
    </Drift>
  );
};

// ── Как звать на помощь: толпа точек, каждый ждёт; луч на одного «в голубом пиджаке» ──
export const Help: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const point = ramp(t, at(ctx, 1.2), 0.6);
  const people = Array.from({ length: 11 }).map((_, i) => ({ x: cx - 500 + i * 100, y: 860 + (i % 2) * 30, who: (["neighbor", "guest", "anna", "student", "grandma", "crowd", "friend", "timur", "crowd", "boss", "guest"] as const)[i] }));
  const chosen = 6;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {people.map((q, i) => {
        const isChosen = i === chosen;
        const dim = point > 0 && !isChosen ? 0.55 : 1;
        return (
          <g key={i} opacity={dim}>
            <Person who={q.who} x={q.x} y={q.y} s={0.42} mood={isChosen && point > 0.5 ? "tense" : "think"} pose={isChosen && point > 0.7 ? "phone" : i % 3 === 0 ? "shrug" : "stand"} t={t} seed={i} color={isChosen ? "#4f9ae8" : undefined} />
            {point < 0.3 && i % 2 === 0 && (
              <text x={q.x} y={q.y - 260} fontFamily={DISPLAY} fontWeight={800} fontSize={34} fill="#fff" textAnchor="middle" opacity={0.6 + 0.4 * Math.sin(t * 3 + i)}>
                ?
              </text>
            )}
          </g>
        );
      })}
      <g opacity={1 - point}>
        <Label x={cx} y={330} text="«пусть поможет кто-нибудь»" size={34} />
      </g>
      {point > 0 && (
        <g opacity={point}>
          <path d={`M ${cx - 560} 300 L ${people[chosen].x - 70} ${people[chosen].y - 220} L ${people[chosen].x + 70} ${people[chosen].y - 220} Z`} fill={C.yellow} opacity={0.25} />
          <Label x={cx - 300} y={300} text="вы, в голубом пиджаке!" size={36} bg={C.yellow} />
          <Arrow x1={cx - 300} y1={350} x2={people[chosen].x - 20} y2={people[chosen].y - 260} k={point} color={C.yellow} w={10} />
        </g>
      )}
    </Drift>
  );
};

