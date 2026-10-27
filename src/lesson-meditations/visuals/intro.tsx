// Вступление BM-012: ночной лагерь на Дунае (художественный образ), утреннее
// напоминание на восковой табличке, три вопроса фильма, книга, карта трудного дня.
import React from "react";
import { Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { Big, Campfire, Cloud, Hero, OL, OilLamp, Phone, Rain, SkyArc, Tent, WaxTablet, Writer } from "./draw";

type VP = VisualProps<{ host?: string; quote?: string; ref?: string; words?: string[] }>;

export const AX = (host?: string) => (host === "right" || host === "peek" ? 690 : host === "left" ? 1240 : 960);

// ночное небо со звёздами (на всю сцену)
export const NightSky: React.FC<{ t: number; k?: number; river?: boolean }> = ({ t, k = 1, river = true }) => (
  <g opacity={k}>
    <rect x={0} y={0} width={1920} height={1080} fill={R.night} />
    <rect x={0} y={560} width={1920} height={520} fill="#18223c" />
    {Array.from({ length: 60 }).map((_, i) => (
      <circle key={i} cx={(i * 337) % 1920} cy={(i * 131) % 520} r={1.5 + (i % 3)} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + i))} />
    ))}
    <path d="M 1500 120 A 50 50 0 1 0 1550 190 A 38 38 0 1 1 1500 120 Z" fill="#fff3c4" />
    {river && (
      <g>
        <path d="M 0 640 Q 480 600 960 640 T 1920 630 L 1920 720 Q 1440 700 960 730 T 0 720 Z" fill="#2c4a78" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={((t * 40 + i * 330) % 2100) - 100} x2={((t * 40 + i * 330) % 2100) - 30} y1={672 + (i % 2) * 22} y2={672 + (i % 2) * 22} stroke="#9cc3f0" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
        ))}
      </g>
    )}
  </g>
);

// ── i01: ночь, лагерь, шатёр, в шатре пишет человек ──
export const TentNight: React.FC<VP> = (c) => {
  const { t } = c;
  const zoom = ramp(t, at(c, 1), 2.2);
  const write = ramp(t, at(c, 2), 0.6);
  const s = 1 + zoom * 1.25;
  return (
    <g>
      <NightSky t={t} />
      <g transform={`translate(690 760) scale(${s}) translate(-690 -760)`}>
        {[200, 420, 1060, 1260].map((x, i) => (
          <Tent key={i} x={x} y={820 - (i % 2) * 30} s={0.55} open={0.3} color="#b9ab8a" />
        ))}
        <Campfire x={300} y={860} s={0.9} t={t} />
        <Campfire x={1180} y={870} s={0.8} t={t + 1} />
        <Tent x={690} y={830} s={1.1} open={1} glow={0.7 + 0.15 * Math.sin(t * 6)} />
        <g transform="translate(690 820) scale(0.42)">
          <Writer x={-40} y={0} t={t} write={write} />
          <OilLamp x={170} y={-110} s={0.8} t={t} />
          <WaxTablet x={210} y={-60} s={0.32} k={write} />
        </g>
      </g>
      <Pop t={t} at={at(c, 2)} x={690} y={200}>
        <Big x={0} y={0} text="…самому себе" size={78} color="#fff3c4" serif />
      </Pop>
    </g>
  );
};

// ── i02: восковая табличка, строка перевода, ряд «трудных людей» ──
export const TabletQuote: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const words = c.p.words ?? [];
  const k2 = ramp(t, at(c, 1), 0.8);
  return (
    <g>
      <g opacity={1 - k2 * 0.25}>
        <WaxTablet x={cx} y={330} s={1.6} k={ramp(t, 0.2, 2.4)} text={(c.p.quote ?? "").split("\n")} />
        <Txt x={cx} y={560} size={28} color={C.inkSoft}>
          {c.p.ref ?? ""}
        </Txt>
      </g>
      {words.map((w, i) => {
        const a = at(c, 0.35 + i * 0.13);
        const k = pop(t, a);
        if (k <= 0) return null;
        const x = cx - 450 + i * 300;
        return (
          <g key={w} transform={`translate(${x} ${640 + wob(t, i, 6)}) scale(${k})`}>
            <circle r={70} fill={[C.coral, R.purple, C.skyDeep, R.olive][i % 4]} stroke={OL} strokeWidth={5} />
            <path d={i % 2 ? "M -26 -14 L -10 -6 M 26 -14 L 10 -6" : "M -26 -6 L -10 -14 M 26 -6 L 10 -14"} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
            <path d="M -22 26 Q 0 10 22 26" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" />
            <Txt x={0} y={124} size={30} weight={900}>
              {w}
            </Txt>
          </g>
        );
      })}
      {k2 > 0 && (
        <g opacity={k2}>
          <Panel x={cx - 330} y={780} w={660} h={84} r={42} fill={C.yellow} />
          <Txt x={cx} y={836} size={40} weight={900}>
            командовать собой
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── i03: три вопроса фильма, каждый со своей картинкой ──
export const Teaser: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const qs = [
    { text: "критика при всех?", color: C.coral, icon: "!" },
    { text: "план рухнул?", color: C.skyDeep, icon: "↯" },
    { text: "добро без «спасибо»?", color: R.olive, icon: "♥" },
  ];
  return (
    <g>
      {qs.map((q, i) => {
        const a = at(c, i);
        const k = pop(t, a);
        if (k <= 0) return null;
        const active = i === qs.length - 1 ? t >= a : t >= a && t < at(c, i + 1);
        const x = cx - 420 + i * 420;
        const y = 470 + (active ? -20 : 0) + wob(t, i, 5);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${k * (active ? 1.08 : 0.94)})`}>
            <rect x={-180} y={-220} width={360} height={420} rx={40} fill="#24324a" opacity={0.12} transform="translate(8 12)" />
            <rect x={-180} y={-220} width={360} height={420} rx={40} fill="#fff" stroke={active ? C.yellowDeep : OL} strokeWidth={active ? 9 : 5} />
            <circle cy={-70} r={96} fill={q.color} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-36} size={110} weight={900} color="#fff">
              {q.icon}
            </Txt>
            <Txt x={0} y={110} size={36} weight={900}>
              {q.text.replace(" ", "\n")}
            </Txt>
          </g>
        );
      })}
    </g>
  );
};

// ── i04: книга BanaMind (свой рисунок, не обложка издания) ──
export const BookIntro: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const open = ramp(t, at(c, 1), 0.9);
  return (
    <g>
      <g transform={`translate(${cx} 470) rotate(${Math.sin(t * 0.8) * 2}) scale(${0.9 + 0.1 * pop(t, 0.2)})`}>
        <rect x={-210} y={-300} width={420} height={560} rx={18} fill="#24324a" opacity={0.15} transform="translate(14 16)" />
        <rect x={-210} y={-300} width={420} height={560} rx={18} fill={R.purple} stroke={OL} strokeWidth={6} />
        <rect x={-210} y={-300} width={40} height={560} rx={12} fill="#4f2a66" stroke={OL} strokeWidth={6} />
        <rect x={-150} y={-250} width={320} height={460} rx={12} fill="none" stroke={R.gold} strokeWidth={5} />
        <g transform="translate(10 -90)">
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${sd * 20} 70 Q ${sd * 110} 20 ${sd * 96} -80`} fill="none" stroke={R.gold} strokeWidth={6} />
          ))}
          <text x={0} y={-10} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={40} textAnchor="middle" fill={R.gold}>
            Марк
          </text>
          <text x={0} y={36} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={40} textAnchor="middle" fill={R.gold}>
            Аврелий
          </text>
        </g>
        <text x={10} y={110} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={50} textAnchor="middle" fill="#fff">
          Наедине
        </text>
        <text x={10} y={170} fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={50} textAnchor="middle" fill="#fff">
          с собой
        </text>
      </g>
      {open > 0 && (
        <g opacity={open}>
          {["утро", "собрание", "помощь", "лайки", "провал", "вечер"].map((w, i) => {
            const k = pop(t, at(c, 1.15 + i * 0.1));
            const ang = -150 + i * 60;
            const rr = 400;
            const x = cx + Math.cos((ang * Math.PI) / 180) * rr;
            const y = 470 + Math.sin((ang * Math.PI) / 180) * rr * 0.72;
            return (
              <g key={w} transform={`translate(${x} ${y}) scale(${k})`}>
                <Tag x={0} y={0} text={w} size={30} color={i % 2 ? C.yellow : "#fff"} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── i05: карта трудного дня — дорожка с остановками, солнце идёт по дуге ──
export const DayMap: React.FC<VP> = (c) => {
  const { t } = c;
  const stops = [
    { x: 380, y: 620, label: "дождь", color: R.rain },
    { x: 640, y: 470, label: "критика", color: C.coral },
    { x: 900, y: 600, label: "просьба", color: R.olive },
    { x: 1160, y: 450, label: "чужой успех", color: R.purple },
    { x: 1420, y: 590, label: "провал", color: C.skyDeep },
    { x: 1660, y: 440, label: "вечер", color: R.terracotta },
  ];
  const prog = clamp01((t - 0.3) / Math.max(1, at(c, 1) - 0.6));
  const d = `M 240 700 ${stops.map((s) => `L ${s.x} ${s.y}`).join(" ")}`;
  const len = 1900;
  const idx = Math.min(stops.length - 1, Math.floor(prog * stops.length));
  const hero = stops[idx];
  return (
    <g>
      <SkyArc x={1000} y={360} w={900} phase={prog * 3} t={t} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      <path d={d} fill="none" stroke={C.yellowDeep} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 24" strokeDashoffset={-t * 40} />
      <path d={d} fill="none" stroke={C.yellow} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - prog)} />
      {stops.map((s, i) => {
        const k = pop(t, 0.3 + (i / stops.length) * (at(c, 1) - 0.6));
        return (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${k})`}>
            <circle r={44} fill={s.color} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={14} size={36} weight={900} color="#fff">
              {String(i + 1)}
            </Txt>
            <Txt x={0} y={i % 2 ? -66 : 92} size={32} weight={900}>
              {s.label}
            </Txt>
          </g>
        );
      })}
      <Hero x={hero.x + 78} y={hero.y + 40} s={0.22} t={t} pose={idx === 1 ? "shock" : idx === stops.length - 1 ? "cheer" : "idle"} mood={idx === 1 || idx === 4 ? "confused" : "happy"} />
      {idx === 0 && <Rain x={300} y={520} w={160} h={140} t={t} />}
      {idx === 0 && <Cloud x={380} y={500} s={0.5} />}
      {idx === 3 && <Phone x={1240} y={360} s={0.25} />}
      <Pop t={t} at={at(c, 1)} x={1000} y={820}>
        <Tag x={0} y={0} text="день придуман — трудности настоящие" size={34} color="#fff" />
      </Pop>
    </g>
  );
};
