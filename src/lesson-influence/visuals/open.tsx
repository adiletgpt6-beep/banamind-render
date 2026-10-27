// Сцены вступления и главы 1 (автопилот): холодный старт, книга и автор,
// индюшка, «магнитофон», бирюза, короткая дорожка, три ведра.
import React from "react";
import { interpolate } from "remotion";
import { C, DISPLAY, FC } from "../theme";
import { Badge, BookObj, Card, Gift, Label, OL, Person, PriceTag, QMark, YesButton } from "./draw";
import { dotsOf, SH, Swarm } from "./dots";
import { Appear, area, Arrow, at, Check, clamp01, Drift, ease, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string };

// ── Холодный старт: четыре сигнала тянут к кнопке «ДА», затем вопрос ──
export const Hook: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 520;
  const crowd = dotsOf("hook-crowd", SH.union(...[-56, 0, 56].map((dx, i) => SH.move(SH.person(64), dx, i === 1 ? -8 : 6))), 0, 0, [FC.social.color, FC.social.deep, "#ffffff"], 8, 160);
  const items = [
    { at: at(ctx, 0.05), x: cx - 430, y: cy - 190, k: "gift" },
    { at: at(ctx, 0.4), x: cx + 430, y: cy - 190, k: "crowd" },
    { at: at(ctx, 0.75), x: cx - 430, y: cy + 150, k: "expert" },
    { at: at(ctx, 1.05), x: cx + 430, y: cy + 150, k: "today" },
  ];
  const pull = ramp(t, at(ctx, 1.5), 1.2);
  const press = ramp(t, at(ctx, 1.6), 0.4);
  const q = ramp(t, at(ctx, 2.15), 0.7);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.04}>
      <g opacity={1 - q * 0.75}>
        <YesButton x={cx} y={cy + 40} s={1.25} press={press * (1 - q)} />
      </g>
      {items.map((it, i) => {
        const k = ramp(t, it.at, 0.55);
        if (k <= 0) return null;
        const x = it.x + (cx - it.x) * pull * 0.18;
        const y = it.y + (cy - it.y) * pull * 0.18;
        const col = [FC.recip, FC.social, FC.authority, FC.scarcity][i];
        return (
          <g key={i} opacity={k * (1 - q * 0.7)} transform={`translate(${x} ${y + (1 - k) * 40}) scale(${0.8 + 0.2 * k})`}>
            <circle r={118} fill={col.light} stroke={col.deep} strokeWidth={6} />
            {it.k === "gift" && <Gift x={0} y={0} s={1.1} open={0.3 + 0.3 * Math.sin(t * 2)} />}
            {it.k === "crowd" && (
              <g transform="translate(0 6)">
                <Swarm pts={crowd} k={clamp01((t - it.at) / 1)} t={t} r={3.8} from="center" breathe={0.6} />
              </g>
            )}
            {it.k === "expert" && <Badge x={0} y={-12} s={0.95} />}
            {it.k === "today" && (
              <g>
                <rect x={-66} y={-70} width={132} height={130} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
                <rect x={-66} y={-70} width={132} height={40} rx={14} fill={FC.scarcity.color} stroke={OL} strokeWidth={5} />
                <Txt x={0} y={28} size={29} color={C.ink}>
                  сегодня
                </Txt>
              </g>
            )}
            <Arrow x1={0} y1={0} x2={(cx - x) * 0.35} y2={(cy - y) * 0.35} k={0} />
          </g>
        );
      })}
      {items.map((it, i) => {
        const k = ramp(t, it.at + 0.3, 0.6) * (1 - q);
        return <Arrow key={`a${i}`} x1={it.x + (cx - it.x) * 0.4} y1={it.y + (cy - it.y) * 0.4} x2={it.x + (cx - it.x) * 0.62} y2={it.y + (cy - it.y) * 0.62} k={k} color="#fff" w={8} />;
      })}
      {q > 0 && (
        <g opacity={q} transform={`translate(${cx} ${cy - 10}) scale(${0.6 + 0.4 * q})`}>
          <QMark x={0} y={0} s={1.7} />
          <Txt x={0} y={190} size={54} color="#fff">
            вам это нужно?
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Книга и автор: книга, «наблюдатель под прикрытием», предупреждение ──
export const BookIntro: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const disguise = ramp(t, at(ctx, 1), 0.7);
  const warn = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <Appear t={t} at={at(ctx, 0)} x={cx - 320} y={470}>
        <BookObj x={0} y={0} s={1.5} rot={wob(t, 1, 1.5)} />
      </Appear>
      {/* автор-наблюдатель: учится у продавцов, сборщиков пожертвований, рекламщиков */}
      <g opacity={disguise * (1 - warn)}>
        {["продажи", "реклама", "сборы средств"].map((s, i) => (
          <g key={s} transform={`translate(${cx + 150 + i * 190} ${640 + (1 - ramp(t, at(ctx, 1) + i * 0.25)) * 40})`} opacity={ramp(t, at(ctx, 1) + i * 0.25)}>
            <Person who={(["seller", "boss", "friend"] as const)[i]} x={0} y={0} s={0.62} mood="smile" pose={i === 1 ? "point" : "stand"} t={t} seed={i} />
            <Label x={0} y={50} text={s} size={26} />
          </g>
        ))}
        <g transform={`translate(${cx + 340} 200)`}>
          <circle r={70} fill="#fff" stroke={OL} strokeWidth={5} />
          <circle cx={-22} cy={-4} r={18} fill="none" stroke={OL} strokeWidth={6} />
          <circle cx={22} cy={-4} r={18} fill="none" stroke={OL} strokeWidth={6} />
          <path d="M -4 -4 L 4 -4" stroke={OL} strokeWidth={6} />
          <path d="M -40 30 Q 0 10 40 30" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
          <Txt x={0} y={112} size={30} color="#fff">
            наблюдение изнутри
          </Txt>
        </g>
      </g>
      {warn > 0 && (
        <g opacity={warn} transform={`translate(${cx} ${560 + (1 - warn) * 30})`}>
          <Card x={160} y={-90} w={520} h={120} lines={["не кнопки управления"]} size={40} fill="#ffe1e1" edge={C.red} />
          <Card x={160} y={90} w={520} h={120} lines={["сигналы и проверка"]} size={40} fill={C.yellow} edge={C.gold} />
        </g>
      )}
    </Drift>
  );
};

// индюшка (простая округлая птица)
const Turkey: React.FC<{ x: number; y: number; s?: number; t: number; mood?: "calm" | "angry" | "love" }> = ({ x, y, s = 1, t, mood = "calm" }) => {
  const fan = mood === "angry" ? 1 : 0.6;
  const bob = Math.sin(t * 3) * 3;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {Array.from({ length: 9 }).map((_, i) => {
        const ang = -80 + i * 20;
        return <ellipse key={i} cx={-40} cy={-140} rx={34} ry={95 * fan + 30} fill={["#b5643a", "#d98a4a", "#8f4a2a"][i % 3]} stroke={OL} strokeWidth={4} transform={`rotate(${ang} -40 -60)`} />;
      })}
      <ellipse cx={-10} cy={-70} rx={110} ry={90} fill="#7a4a30" stroke={OL} strokeWidth={5} />
      <path d="M 70 -110 Q 110 -170 90 -230" stroke="#d9b39a" strokeWidth={34} fill="none" strokeLinecap="round" />
      <circle cx={92} cy={-236} r={36} fill="#d9b39a" stroke={OL} strokeWidth={5} />
      <path d="M 120 -236 L 150 -228 L 120 -220 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
      <path d="M 108 -216 Q 118 -180 104 -170" stroke={C.red} strokeWidth={14} fill="none" strokeLinecap="round" />
      <circle cx={100} cy={-244} r={6} fill={OL} />
      {mood === "angry" && <path d="M 86 -262 L 110 -254" stroke={OL} strokeWidth={5} strokeLinecap="round" />}
      {mood === "love" && <path d="M 150 -300 C 120 -330 140 -350 150 -334 C 160 -350 180 -330 150 -300 Z" fill={FC.liking.color} stroke={OL} strokeWidth={3} />}
      <path d="M -30 10 L -30 40 M 10 10 L 10 40" stroke="#c98a3a" strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

// чучело хорька на ниточке
const Ferret: React.FC<{ x: number; y: number; s?: number; speaker?: number; t: number }> = ({ x, y, s = 1, speaker = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -130 -40 Q -60 -90 40 -60 Q 110 -50 120 -20 Q 60 0 -120 -10 Z" fill="#8c7a6a" stroke={OL} strokeWidth={5} />
    <path d="M -130 -40 Q -190 -40 -200 -10" stroke="#8c7a6a" strokeWidth={22} fill="none" strokeLinecap="round" />
    <circle cx={110} cy={-50} r={34} fill="#9c8a7a" stroke={OL} strokeWidth={5} />
    <circle cx={120} cy={-58} r={5} fill={OL} />
    <path d="M -80 -10 L -80 6 M 40 -10 L 40 6" stroke={OL} strokeWidth={8} strokeLinecap="round" />
    <rect x={-160} y={4} width={300} height={16} rx={6} fill="#a8724c" stroke={OL} strokeWidth={3} />
    <path d="M -160 12 L -330 12" stroke="#fff" strokeWidth={3} />
    {speaker > 0 && (
      <g opacity={speaker}>
        <rect x={-30} y={-84} width={50} height={40} rx={8} fill="#2b2f52" stroke="#fff" strokeWidth={3} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${30 + i * 18} -84 Q ${44 + i * 18} -64 ${30 + i * 18} -44`} stroke="#fff" strokeWidth={4} fill="none" opacity={0.4 + 0.6 * Math.max(0, Math.sin(t * 6 - i))} />
        ))}
        <Label x={-4} y={-130} text="пи-пи!" size={30} bg={C.yellow} />
      </g>
    )}
  </g>
);

export const TurkeyScene: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const k1 = ramp(t, at(ctx, 1), 0.8);
  const k2 = ramp(t, at(ctx, 2), 0.6);
  const fx = interpolate(t, [at(ctx, 1), at(ctx, 1) + 2.5], [a.x1 + 200, cx + 230], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const mood = k2 > 0.5 ? "love" : k1 > 0.3 ? "angry" : "calm";
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <rect x={a.x0} y={780} width={a.x1 - a.x0} height={30} rx={14} fill="#7fb36a" opacity={0.9} />
      <Turkey x={cx - 220} y={780} s={1.1} t={t} mood={mood} />
      {/* птенец пищит — забота включается */}
      <g opacity={1 - k1}>
        <circle cx={cx + 180} cy={740} r={34} fill={C.yellow} stroke={OL} strokeWidth={4} />
        <circle cx={cx + 192} cy={732} r={5} fill={OL} />
        <path d="M 0 0 L 16 6 L 0 12 Z" transform={`translate(${cx + 210} 736)`} fill="#f59e0b" stroke={OL} strokeWidth={2} />
        <Label x={cx + 200} y={650} text="пи-пи!" size={30} bg={C.yellow} />
        <Arrow x1={cx + 120} y1={640} x2={cx - 40} y2={560} k={ramp(t, at(ctx, 0.4))} color="#fff" bend={0.2} />
      </g>
      {k1 > 0 && <Ferret x={fx} y={790} s={0.95} speaker={k2} t={t} />}
      <Appear t={t} at={at(ctx, 0.3)} x={cx} y={200}>
        <Card x={0} y={0} w={560} h={100} lines={["сигнал → готовая реакция"]} size={38} />
      </Appear>
    </Drift>
  );
};

// ── «Магнитофон внутри»: кнопка → кассета крутится → «щёлк, жжж» ──
export const Tape: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const press = ramp(t, at(ctx, 0.3), 0.3);
  const spin = press > 0.5 ? (t - at(ctx, 0.3)) * 4 : 0;
  const human = ramp(t, at(ctx, 1), 0.7);
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g transform={`translate(${cx} 470)`}>
        <rect x={-380} y={-200} width={760} height={400} rx={40} fill="#2e3566" stroke={OL} strokeWidth={6} />
        <rect x={-300} y={-150} width={600} height={220} rx={26} fill="#f3efe6" stroke={OL} strokeWidth={5} />
        {[-150, 150].map((x, i) => (
          <g key={i} transform={`translate(${x} -40) rotate(${(spin * 180) / Math.PI})`}>
            <circle r={70} fill="#fff" stroke={OL} strokeWidth={5} />
            {[0, 60, 120, 180, 240, 300].map((d) => (
              <rect key={d} x={-6} y={-60} width={12} height={28} rx={4} fill={OL} transform={`rotate(${d})`} />
            ))}
            <circle r={16} fill={OL} />
          </g>
        ))}
        <path d="M -150 30 L 150 30" stroke="#6b4a3a" strokeWidth={10} />
        {[-180, -60, 60, 180].map((x, i) => (
          <rect key={i} x={x - 46} y={110 + (i === 1 ? press * 14 : 0)} width={92} height={56} rx={12} fill={i === 1 ? C.green : "#4a5280"} stroke={OL} strokeWidth={4} />
        ))}
        <path d="M -60 125 L -60 150 L -38 138 Z" transform="translate(52 0)" fill="#fff" />
      </g>
      {press > 0.5 && (
        <g>
          <text x={cx - 420} y={260} fontFamily={DISPLAY} fontWeight={800} fontSize={72} fill={C.yellow} stroke={OL} strokeWidth={8} paintOrder="stroke" transform={`rotate(-10 ${cx - 420} 260)`} opacity={ramp(t, at(ctx, 0.35), 0.2)}>
            щёлк!
          </text>
          <text x={cx + 300} y={250} fontFamily={DISPLAY} fontWeight={800} fontSize={64} fill="#fff" stroke={OL} strokeWidth={8} paintOrder="stroke" transform={`rotate(8 ${cx + 300} 250)`} opacity={ramp(t, at(ctx, 0.55), 0.3)}>
            жжж…
          </text>
        </g>
      )}
      {human > 0 && (
        <g opacity={human}>
          <Person who="anna" x={cx - 520} y={980} s={0.62} mood="shock" pose="stand" t={t} />
          <path d={`M ${cx - 470} 560 Q ${cx - 420} 520 ${cx - 380} 560`} stroke={C.yellow} strokeWidth={6} fill="none" />
          <Label x={cx - 520} y={520} text="и у людей?" size={30} bg={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Бирюза: ½ → ×2, ценник растёт, украшения раскупают ──
export const Turquoise: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const note = ramp(t, at(ctx, 0.6), 0.5);
  const flip = ramp(t, at(ctx, 1.1), 0.5);
  const sold = ramp(t, at(ctx, 1.5), 1.2);
  const rule = ramp(t, at(ctx, 2.2), 0.6);
  const price = flip < 0.5 ? "100" : "200";
  return (
    <Drift t={t} dur={dur} cx={cx}>
      {/* витрина */}
      <rect x={cx - 460} y={430} width={600} height={300} rx={26} fill="#e9f6ff" fillOpacity={0.6} stroke="#fff" strokeWidth={6} />
      {Array.from({ length: 8 }).map((_, i) => {
        const gone = clamp01(sold * 9 - i);
        const x = cx - 400 + (i % 4) * 140;
        const y = 520 + Math.floor(i / 4) * 130;
        return (
          <g key={i} opacity={1 - gone} transform={`translate(${x + gone * 300} ${y - gone * 80})`}>
            <circle r={36} fill="none" stroke="#c9a46a" strokeWidth={6} />
            <circle cy={36} r={20} fill="#30c9c0" stroke={OL} strokeWidth={4} />
            <circle cy={36} r={7} fill="#fff" opacity={0.6} />
          </g>
        );
      })}
      <PriceTag x={cx + 330} y={520} text={`${price} $`} s={1.25} color={flip < 0.5 ? C.yellow : "#ff9a8a"} rot={-6 + flip * 10} />
      {/* записка хозяйки */}
      <g opacity={note * (1 - flip)} transform={`translate(${cx + 330} 330)`}>
        <rect x={-140} y={-60} width={280} height={120} rx={10} fill="#fff8d6" stroke={OL} strokeWidth={4} transform="rotate(-4)" />
        <Txt x={0} y={14} size={42}>
          цена × ½
        </Txt>
      </g>
      <g opacity={flip} transform={`translate(${cx + 330} 330) scale(${1 + 0.1 * Math.sin(t * 6) * (1 - sold)})`}>
        <rect x={-140} y={-60} width={280} height={120} rx={10} fill="#ffe1dc" stroke={OL} strokeWidth={4} transform="rotate(4)" />
        <Txt x={0} y={14} size={42} color={C.red}>
          цена × 2 ?!
        </Txt>
      </g>
      {sold > 0.2 && (
        <g opacity={clamp01(sold * 2)}>
          {[0, 1, 2].map((i) => (
            <Person key={i} who={(["grandma", "guest", "friend"] as const)[i]} x={cx + 220 + i * 150} y={1000} s={0.5} mood="happy" pose="take" t={t} seed={i} flip />
          ))}
        </g>
      )}
      {rule > 0 && (
        <g opacity={rule} transform={`translate(${cx - 160} ${250 + (1 - rule) * 20})`}>
          <Card x={0} y={0} w={560} h={110} lines={["дорого = хорошо?"]} size={44} fill={C.yellow} />
        </g>
      )}
    </Drift>
  );
};

// ── Короткая дорожка: длинный путь раздумий и короткий путь; подделанный указатель ──
export const Shortcut: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const x0 = cx - 520;
  const x1 = cx + 520;
  const longK = ramp(t, at(ctx, 0.2), 2);
  const shortK = ramp(t, at(ctx, 1), 1);
  const fake = ramp(t, at(ctx, 2), 0.6);
  const longPath = `M ${x0} 760 C ${x0 + 120} 260, ${cx - 200} 240, ${cx} 420 S ${x1 - 80} 220, ${x1} 760`;
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <path d={longPath} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={22} strokeLinecap="round" strokeDasharray="4 34" />
      <path d={longPath} fill="none" stroke={FC.social.light} strokeWidth={10} strokeLinecap="round" strokeDasharray={3000} strokeDashoffset={3000 * (1 - longK)} />
      <path d={`M ${x0} 760 L ${x1} 760`} stroke={C.yellow} strokeWidth={16} strokeLinecap="round" strokeDasharray={1100} strokeDashoffset={1100 * (1 - shortK)} />
      <circle cx={x0} cy={760} r={26} fill="#fff" stroke={OL} strokeWidth={5} />
      <g transform={`translate(${x1} 760)`}>
        <circle r={40} fill={C.green} stroke={OL} strokeWidth={5} />
        <Check x={0} y={0} s={36} k={ramp(t, at(ctx, 1.4))} color="#fff" />
      </g>
      <Appear t={t} at={at(ctx, 0.2)} x={cx} y={300}>
        <Label x={0} y={0} text="всё взвесить" size={30} />
      </Appear>
      <Appear t={t} at={at(ctx, 1)} x={cx} y={840}>
        <Label x={0} y={0} text="короткий путь: обычно верно" size={32} bg={C.yellow} />
      </Appear>
      {fake > 0 && (
        <g opacity={fake} transform={`translate(${cx - 200} 600) rotate(${-6 + Math.sin(t * 3) * 2})`}>
          <rect x={-8} y={-10} width={16} height={90} fill="#8a5a3c" stroke={OL} strokeWidth={3} />
          <path d="M -150 -90 L 120 -90 L 160 -50 L 120 -10 L -150 -10 Z" fill={C.red} stroke={OL} strokeWidth={4} />
          <Txt x={-10} y={-36} size={32} color="#fff">
            подделка сигнала
          </Txt>
          <path d={`M 40 80 Q 120 200 260 230`} stroke={C.red} strokeWidth={10} fill="none" strokeDasharray="18 14" />
        </g>
      )}
    </Drift>
  );
};

// ── Три ведра и контраст: костюм → свитер ──
export const Buckets: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const hands = ramp(t, at(ctx, 1), 0.8);
  const shop = ramp(t, at(ctx, 2), 0.7);
  const bucket = (x: number, color: string, label: string, steam: boolean, ice: boolean) => (
    <g transform={`translate(${x} 640)`}>
      <path d="M -110 -120 L 110 -120 L 86 100 L -86 100 Z" fill="#c9d3e6" stroke={OL} strokeWidth={5} />
      <ellipse cx={0} cy={-120} rx={110} ry={26} fill={color} stroke={OL} strokeWidth={5} />
      {steam && [0, 1, 2].map((i) => <path key={i} d={`M ${-40 + i * 40} -160 q 14 -30 0 -60 q -14 -30 0 -60`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.4 + 0.3 * Math.sin(t * 3 + i)} />)}
      {ice && [0, 1].map((i) => <rect key={i} x={-50 + i * 50} y={-136} width={30} height={22} rx={4} fill="#e8f7ff" stroke={OL} strokeWidth={3} transform={`rotate(${i * 20 - 10})`} />)}
      <Txt x={0} y={160} size={34} color="#fff">
        {label}
      </Txt>
    </g>
  );
  return (
    <Drift t={t} dur={dur} cx={cx}>
      <g opacity={1 - shop}>
        {bucket(cx - 330, "#8fd0ff", "холодная", false, true)}
        {bucket(cx, "#ffd9a8", "тёплая", false, false)}
        {bucket(cx + 330, "#ff8a6a", "горячая", true, false)}
        {hands > 0 && (
          <g opacity={hands}>
            <Label x={cx - 150} y={360} text="«горячо!»" size={32} bg="#ffcab8" />
            <Label x={cx + 150} y={360} text="«холодно!»" size={32} bg="#cfe9ff" />
            <Arrow x1={cx - 330} y1={420} x2={cx - 60} y2={480} k={hands} color="#8fd0ff" />
            <Arrow x1={cx + 330} y1={420} x2={cx + 60} y2={480} k={hands} color="#ff8a6a" />
          </g>
        )}
      </g>
      {shop > 0 && (
        <g opacity={shop}>
          <g transform={`translate(${cx - 260} 560)`}>
            <path d="M -110 -160 L -40 -190 L 0 -150 L 40 -190 L 110 -160 L 130 160 L -130 160 Z" fill="#3a4466" stroke={OL} strokeWidth={5} />
            <path d="M -40 -190 L 0 -60 L 40 -190" fill="#fff" stroke={OL} strokeWidth={4} />
            <PriceTag x={0} y={230} text="большая сумма" s={0.8} color="#ffb8a8" />
          </g>
          <Arrow x1={cx - 80} y1={560} x2={cx + 100} y2={560} k={ramp(t, at(ctx, 2.3))} color="#fff" w={10} />
          <g transform={`translate(${cx + 280} 560) scale(${0.75})`}>
            <path d="M -110 -150 Q 0 -180 110 -150 L 130 160 L -130 160 Z" fill={FC.recip.color} stroke={OL} strokeWidth={5} />
            <path d="M -40 -168 Q 0 -120 40 -168" fill="none" stroke={OL} strokeWidth={5} />
            {[0, 1, 2].map((i) => <path key={i} d={`M -110 ${-60 + i * 70} L 110 ${-60 + i * 70}`} stroke={FC.recip.deep} strokeWidth={8} />)}
          </g>
          <Appear t={t} at={at(ctx, 2.5)} x={cx + 280} y={800}>
            <Label x={0} y={0} text="кажется мелочью" size={32} bg={C.yellow} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

