// Главы 2, 4, 5: пещеры Хира и Саур, Акаба, ночь заговора, Сурака, мечеть, братство,
// договоры, азан, кибла. Людей в кадре нет: огоньки, предметы, архитектура.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { Dunes, House, Kaaba, Lantern, Letter, Mountains, OL, Palm, Sky, Star8 } from "./draw";
import { Arrow, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";
import { PageTag } from "./scenes1";

// ─────────────── пещера (Хира — свет и слово; Саур — укрытие) ───────────────
export const Cave: React.FC<VisualProps<{ variant: "hira" | "thawr"; word?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const hira = p.variant === "hira";
  const light = hira ? ramp(t, at(c, 1.4), 1.2) : 0.35 + 0.1 * Math.sin(t * 2);
  const word = hira ? pop(t, at(c, 1.5)) : 0;
  const verse = hira ? ramp(t, at(c, 2.4), 1) : 0;
  const reward = !hira ? pop(t, at(c, 1.4)) : 0;
  const belt = !hira ? pop(t, at(c, 2.2)) : 0;
  return (
    <g>
      <g transform={camera(t, c.dur, x, 600, 1.0, 1.08)}>
        <Sky mode="night" t={t} id={`cave-${p.variant}`} sunX={x + (hira ? 520 : -520)} sunY={180} stars={120} />
        <path d={`M ${x - 900} 1080 L ${x - 560} 560 L ${x - 300} 380 L ${x - 60} 300 L ${x + 200} 420 L ${x + 520} 600 L ${x + 900} 1080 Z`} fill="#3a2f4a" stroke="#241c30" strokeWidth={6} />
        <path d={`M ${x - 640} 1080 L ${x - 380} 700 L ${x - 120} 560 L ${x + 160} 640 L ${x + 460} 820 L ${x + 700} 1080 Z`} fill="#4a3c58" />
        <g transform={`translate(${x - 40} 640)`}>
          <ellipse cx={0} cy={0} rx={150} ry={110} fill="#120e1a" />
          <ellipse cx={0} cy={10} rx={150 + light * 60} ry={110 + light * 50} fill="#fff1b0" opacity={0.18 * light} />
          <ellipse cx={0} cy={6} rx={120} ry={86} fill="#ffe8a0" opacity={0.55 * light} />
        </g>
        {!hira && <Dunes t={t} tone="night" y={980} pan={2} />}
      </g>
      {hira && (
        <Pop t={t} at={0.4} x={x} y={150}>
          <Tag x={0} y={0} text="гора Хира · месяц рамадан" size={34} color="#fff4d0" />
        </Pop>
      )}
      {word > 0 && (
        <g transform={`translate(${x - 40} 360) scale(${word})`}>
          <Txt x={0} y={0} size={150} weight={700} family={SERIF} color="#fff4d0" stroke="#8a6a2c">
            {p.word ?? ""}
          </Txt>
        </g>
      )}
      {verse > 0 && (
        <g opacity={verse}>
          <Tag x={x - 40} y={470} text="Коран, 96:1–5 · стр. 93–94" size={28} color={C.goldSoft} />
        </g>
      )}
      {!hira && (
        <Pop t={t} at={0.4} x={x} y={150}>
          <Tag x={0} y={0} text="пещера на горе Саур · три дня" size={34} color="#fff4d0" />
        </Pop>
      )}
      {reward > 0 && (
        <g transform={`translate(${x + 420} 330) scale(${reward})`}>
          <Panel x={-150} y={-60} w={300} h={110} fill="#fffaf0" stroke={C.terracotta} />
          <Txt x={0} y={10} size={34} weight={900} color={C.terracotta}>
            100 верблюдиц
          </Txt>
        </g>
      )}
      {belt > 0 && (
        <g transform={`translate(${x - 420} 330) scale(${belt})`}>
          <path d="M -120 0 Q -60 -30 0 0 Q 60 30 120 0" stroke="#c8643b" strokeWidth={18} fill="none" strokeLinecap="round" />
          <rect x={-40} y={10} width={80} height={60} rx={12} fill="#e4b86a" stroke={OL} strokeWidth={4} />
          <Tag x={0} y={120} text="пояс Асмы" size={30} color={C.white} />
        </g>
      )}
      {!hira && <PageTag x={x} y={225} text="стр. 212–214" dark k={ramp(t, 0.6, 0.5)} />}
    </g>
  );
};

// ─────────────── Акаба: ночное ущелье, 73 + 2 огонька ───────────────
export const Aqaba: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const n = ramp(t, 0.5, 3.2);
  const bond = ramp(t, at(c, 1.3), 1);
  return (
    <g>
      <Sky mode="night" t={t} id="aqaba" sunX={x + 500} sunY={170} />
      <path d={`M 0 1080 L 0 300 L ${x - 420} 520 L ${x - 260} 1080 Z`} fill="#262a48" />
      <path d={`M 1920 1080 L 1920 260 L ${x + 420} 520 L ${x + 260} 1080 Z`} fill="#262a48" />
      <path d={`M ${x - 260} 1080 L ${x - 330} 560 L ${x + 330} 560 L ${x + 260} 1080 Z`} fill="#1d2140" />
      {Array.from({ length: 75 }).map((_, i) => {
        const k = clamp01(n * 75 - i);
        if (k <= 0) return null;
        const row = Math.floor(i / 15);
        const col = i % 15;
        const px = x - 280 + col * 40 + (row % 2) * 20;
        const py = 600 + row * 40;
        const woman = i >= 73;
        const glow = 0.7 + 0.3 * Math.sin(t * 3 + i);
        return (
          <g key={i} opacity={k}>
            <circle cx={px} cy={py} r={16} fill={woman ? "#ff9db0" : "#ffd977"} opacity={0.25 * glow + bond * 0.2} />
            <circle cx={px} cy={py} r={6} fill={woman ? "#ffd0db" : "#fff1b0"} />
          </g>
        );
      })}
      <Pop t={t} at={0.6} x={x} y={150}>
        <Tag x={0} y={0} text="ущелье аль-Акаба · ночью, тайно" size={34} color="#fff4d0" />
      </Pop>
      <Pop t={t} at={at(c, 0.6)} x={x} y={230}>
        <Tag x={0} y={0} text="73 мужчины и 2 женщины" size={34} color={C.goldSoft} />
      </Pop>
      {bond > 0 && (
        <g transform={`translate(${x} 440) scale(${bond})`}>
          <Txt x={0} y={0} size={64} weight={700} family={SERIF} color="#fff4d0" stroke="#3a2f4a">
            «Я и вы — кровные братья»
          </Txt>
        </g>
      )}
      <PageTag x={x} y={300} text="стр. 194–195" dark k={ramp(t, at(c, 0.8), 0.5)} />
    </g>
  );
};

// ─────────────── ночь заговора: постель под зелёным плащом ───────────────
export const NightRoom: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const plot = ramp(t, 0.4, 1);
  const cloak = pop(t, at(c, 1));
  const trust = ramp(t, at(c, 2), 1.2);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2b2238" />
      <rect x={0} y={760} width={1920} height={320} fill="#3a2e45" />
      {/* окно с луной */}
      <g transform={`translate(${x + 330} 330)`}>
        <path d="M -130 160 L -130 -60 Q 0 -200 130 -60 L 130 160 Z" fill="#1c2c58" stroke="#a9693f" strokeWidth={14} />
        <path d="M 30 -60 A 50 50 0 1 0 30 40 A 40 40 0 1 1 30 -60 Z" fill="#fff4c4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx={-80 + i * 30} cy={60 + ((i * 37) % 60)} r={2} fill="#fff" opacity={0.7} />
        ))}
      </g>
      {/* постель и зелёный плащ (без человека) */}
      <g transform={`translate(${x - 180} 800)`}>
        <rect x={-260} y={-60} width={520} height={60} rx={14} fill="#8a5a33" stroke={OL} strokeWidth={5} />
        <rect x={-250} y={-100} width={500} height={50} rx={20} fill="#f2e6cf" stroke={OL} strokeWidth={4} />
        <rect x={-240} y={-110} width={110} height={40} rx={16} fill="#fffaf0" stroke={OL} strokeWidth={3} />
        {cloak > 0 && (
          <path d={`M -120 -100 Q 0 ${-150 - 6 * Math.sin(t * 1.2)} 240 -104 L 240 -60 L -120 -60 Z`} fill="#3d9a62" stroke={OL} strokeWidth={4} opacity={cloak} />
        )}
      </g>
      <Lantern x={x - 560} y={560} s={0.7} t={t} glow={0.8} />
      {plot > 0 && trust < 0.5 && (
        <g opacity={plot * (1 - trust * 2)}>
          <Tag x={x} y={160} text="Дом собраний: заговор знати" size={34} color="#ffd0c2" />
        </g>
      )}
      {cloak > 0 && <Tag x={x - 180} y={600} text="Али — в постели под зелёным плащом" size={30} color={C.white} />}
      {trust > 0 && (
        <g opacity={trust}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${x + 120 + i * 120} ${200 + Math.sin(t * 2 + i) * 6})`}>
              <rect x={-40} y={-30} width={80} height={60} rx={10} fill={[C.parchment, "#e4b86a", "#cfe8ff"][i]} stroke={OL} strokeWidth={4} />
              <path d="M -40 -10 L 40 -10" stroke={OL} strokeWidth={3} />
            </g>
          ))}
          <Tag x={x + 240} y={300} text="вещи, отданные ему на хранение" size={28} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x} y={1000 - 30} text="стр. 208–213" dark k={0} />
    </g>
  );
};

// конь (без всадника), профиль вправо; sink — ноги увязают в песке
const Horse: React.FC<{ x: number; y: number; s?: number; t: number; sink: number }> = ({ x, y, s = 1, t, sink }) => {
  const kick = Math.sin(t * 12) * 14 * (1 - sink);
  const legs: [number, number][] = [[-95, 0], [-60, 1], [70, 2], [105, 3]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={170} ry={18} fill="#000" opacity={0.12} />
      {legs.map(([lx, i]) => {
        const d = i < 2 ? sink * 70 : sink * 25;
        const sw = i % 2 ? kick : -kick;
        return (
          <g key={i}>
            <path d={`M ${lx} -150 L ${lx + sw * 0.6} -70 L ${lx + sw} ${-6 + d}`} stroke={i % 2 ? "#6b4428" : "#7a4f2c"} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x={lx + sw - 12} y={-14 + d} width={24} height={14} rx={4} fill="#2b1d0e" />
          </g>
        );
      })}
      <g transform={`rotate(${sink * 8} 0 -170)`}>
        <path d="M -130 -200 Q -150 -150 -110 -130 L 120 -130 Q 160 -150 140 -210 Q 60 -240 -40 -235 Q -110 -232 -130 -200 Z" fill="#8a5a33" stroke={OL} strokeWidth={5} />
        <path d="M 110 -200 Q 140 -260 175 -300 L 195 -290 Q 175 -250 160 -190 Z" fill="#8a5a33" stroke={OL} strokeWidth={5} />
        <path d="M 170 -305 Q 210 -320 250 -290 Q 262 -270 240 -262 L 190 -268 Q 170 -280 170 -305 Z" fill="#8a5a33" stroke={OL} strokeWidth={5} />
        <circle cx={208} cy={-296} r={5} fill={OL} />
        <path d="M 180 -310 L 186 -335 L 196 -312 Z" fill="#6b4428" stroke={OL} strokeWidth={3} />
        <path d="M 120 -245 Q 150 -290 172 -310" stroke="#3b2a1a" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M -135 -205 Q ${-190 + Math.sin(t * 5) * 8} -180 -175 -110`} stroke="#3b2a1a" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M -30 -236 Q 20 -250 60 -236 L 60 -200 L -30 -200 Z" fill="#b5523b" stroke={OL} strokeWidth={4} />
      </g>
    </g>
  );
};

// ─────────────── Сурака: конь увязает, охранное письмо ───────────────
export const HorseScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const sink = ramp(t, 1.4, 1.6);
  const letter = pop(t, at(c, 1));
  const later = ramp(t, at(c, 1.6), 1);
  return (
    <g>
      <Sky mode="day" t={t} id="suraqa" sunX={x - 480} sunY={220} />
      <Mountains y={700} color="#a77a55" seed={12} scale={0.7} />
      <rect x={0} y={700} width={1920} height={380} fill={C.sand} />
      <Dunes t={t} y={860} pan={1} />
      <g transform={`translate(0 ${Math.sin(t * 9) * 3 * (1 - sink)})`}>
        <Horse x={x - 140} y={920} s={1.15} t={t} sink={sink} />
      </g>
      {Array.from({ length: 12 }).map((_, i) => {
        const ph = (t * 0.8 + i / 12) % 1;
        return <circle key={i} cx={x - 60 + Math.cos(i) * 120 * ph} cy={960 - ph * 120} r={30 * ph} fill="#e8cf9a" opacity={(1 - ph) * sink} />;
      })}
      {letter > 0 && (
        <g transform={`translate(${x + 360} 420) scale(${letter}) rotate(${wob(t, 1, 3)})`}>
          <Letter x={0} y={0} s={2.2} />
          <Tag x={0} y={140} text="охранное письмо" size={32} color={C.white} />
        </g>
      )}
      {later > 0 && (
        <g opacity={later}>
          <Tag x={x} y={170} text="«День верности и доброты»" size={44} color="#fff4d0" />
        </g>
      )}
      <PageTag x={x} y={245} text="стр. 215–217" k={ramp(t, 0.6, 0.5)} />
    </g>
  );
};

// ─────────────── строительство мечети ───────────────
export const Mosque: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const kneel = ramp(t, at(c, 1), 1);
  const build = ramp(t, at(c, 1.6), (c.ends[2] ?? c.dur) - at(c, 1.6));
  const bricks = Math.floor(build * 48);
  const song = pop(t, at(c, 2.4));
  return (
    <g>
      <Sky mode="day" t={t} id="mosque" sunX={x + 520} sunY={200} />
      <rect x={0} y={720} width={1920} height={360} fill="#e2c38c" />
      {[-560, -440, 470, 600].map((dx, i) => (
        <Palm key={i} x={x + dx} y={780} s={1} t={t} seed={i} />
      ))}
      {/* сушильня фиников: ряды фиников на циновках */}
      <g opacity={1 - build}>
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i} transform={`translate(${x - 300 + i * 200} 820)`}>
            <rect x={-80} y={-14} width={160} height={28} rx={8} fill="#c9a06a" stroke={OL} strokeWidth={3} />
            {Array.from({ length: 7 }).map((_, j) => (
              <ellipse key={j} cx={-60 + j * 20} cy={-6} rx={8} ry={6} fill="#7a3d1f" />
            ))}
          </g>
        ))}
      </g>
      {/* стены из кирпича и стволы пальм */}
      <g transform={`translate(${x} 900)`}>
        {Array.from({ length: bricks }).map((_, i) => {
          const row = Math.floor(i / 12);
          const col = i % 12;
          return <rect key={i} x={-360 + col * 60 + (row % 2) * 30} y={-40 - row * 40} width={58} height={38} fill={i % 3 ? "#c99a62" : "#b8864f"} stroke={OL} strokeWidth={2} />;
        })}
        {build > 0.7 &&
          [-300, -100, 100, 300].map((px, i) => (
            <rect key={i} x={px - 14} y={-260} width={28} height={260 - 160 * 0} fill="#8a5a33" stroke={OL} strokeWidth={3} opacity={clamp01((build - 0.7) * 4)} />
          ))}
        {build > 0.85 && <path d="M -400 -260 L 400 -260 L 380 -230 L -380 -230 Z" fill="#6fb05c" stroke={OL} strokeWidth={4} opacity={clamp01((build - 0.85) * 6)} />}
      </g>
      {/* верблюдица опускается на колени */}
      <g transform={`translate(${x + 330} ${980 + kneel * 30}) scale(0.75)`}>
        <ellipse cx={0} cy={0} rx={120} ry={18} fill="#000" opacity={0.12} />
        <path d="M -80 -70 Q -90 -110 -50 -118 Q -30 -170 0 -120 Q 30 -160 60 -118 Q 90 -110 85 -70 Z" fill="#c99a5e" stroke={OL} strokeWidth={4} transform={`translate(0 ${kneel * 40})`} />
        <path d="M 80 -96 Q 110 -110 112 -160 Q 114 -190 138 -186 Q 156 -184 150 -168 Q 136 -160 134 -140 Q 128 -100 92 -74 Z" fill="#c99a5e" stroke={OL} strokeWidth={4} transform={`translate(0 ${kneel * 40})`} />
        {kneel < 0.6 && [-50, -30, 40, 60].map((lx, i) => <path key={i} d={`M ${lx} -70 L ${lx} -4`} stroke={OL} strokeWidth={11} strokeLinecap="round" />)}
      </g>
      <Pop t={t} at={0.3} x={x} y={150}>
        <Tag x={0} y={0} text="«Освободите ей дорогу! Ей уже приказано»" size={34} color="#fff4d0" />
      </Pop>
      {song > 0 && (
        <g transform={`translate(${x} 250) scale(${song})`}>
          <Tag x={0} y={0} text="«О Боже! Смилуйся над ансарами и мухаджирами!»" size={30} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x - 600} y={150} text="стр. 219–221" k={ramp(t, 0.6, 0.5)} />
    </g>
  );
};

// ─────────────── братство: пары фонарей, связанные нитями ───────────────
export const Bonds: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const tie = ramp(t, at(c, 1), 2);
  const date = pop(t, at(c, 2));
  const pairs = 5;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1f3b33" opacity={0.85} />
      <Txt x={x - 300} y={200} size={40} weight={900} color="#fff4d0">
        мухаджиры
      </Txt>
      <Txt x={x + 300} y={200} size={40} weight={900} color="#c8f0e6">
        ансары
      </Txt>
      {Array.from({ length: pairs }).map((_, i) => {
        const y = 300 + i * 110;
        const k = clamp01(tie * pairs - i);
        const ax = x - 300 + (1 - k) * -40;
        const bx = x + 300 + (1 - k) * 40;
        return (
          <g key={i}>
            {k > 0 && (
              <path d={`M ${ax} ${y} Q ${x} ${y - 40 + Math.sin(t * 2 + i) * 10} ${bx} ${y}`} stroke={C.gold} strokeWidth={6} fill="none" strokeDasharray={700} strokeDashoffset={700 * (1 - k)} />
            )}
            <Lantern x={ax} y={y} s={0.38} t={t + i} glow={0.5 + 0.5 * k} />
            <Lantern x={bx} y={y} s={0.38} t={t + i * 2} glow={0.5 + 0.5 * k} />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 1.3)} x={x} y={880}>
        <Tag x={0} y={0} text="«Побратайтесь во имя Аллаха по двое!»" size={34} color="#fff4d0" />
      </Pop>
      {date > 0 && (
        <g transform={`translate(${x} 110) scale(${date})`}>
          <Tag x={0} y={0} text="осколок финиковой косточки · доброе слово" size={32} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x} y={960} text="стр. 224, 228–229" dark k={0} />
    </g>
  );
};

// ─────────────── документ: строки пишутся, формулы заменяются ───────────────
type Row = { text: string; at: number; gold?: boolean };
type Strike = { from: string; to: string; at: number };
export const DocumentScene: React.FC<VisualProps<{ title: string; page?: string; rows: Row[]; strike?: Strike[] }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const k = ramp(t, 0.15, 0.9);
  const items: ({ kind: "strike" } & Strike | ({ kind: "row" } & Row))[] = [
    ...(p.strike ?? []).map((s) => ({ kind: "strike" as const, ...s })),
    ...p.rows.map((r) => ({ kind: "row" as const, ...r })),
  ];
  const h = 220 + items.length * 120;
  const top = 540 - h / 2;
  return (
    <g>
      <g transform={`translate(${x} 540) scale(${0.9 + 0.1 * k}) translate(${-x} -540)`} opacity={k}>
        <rect x={x - 520 + 10} y={top + 14} width={1040} height={h} rx={10} fill="#000" opacity={0.12} />
        <rect x={x - 520} y={top} width={1040} height={h} rx={10} fill={C.parchment} stroke={C.parchmentDeep} strokeWidth={6} />
        <rect x={x - 495} y={top + 25} width={990} height={h - 50} rx={6} fill="none" stroke={C.parchmentDeep} strokeWidth={2} strokeDasharray="12 8" />
        <Txt x={x} y={top + 90} size={52} weight={700} family={SERIF} color={C.ink}>
          {p.title}
        </Txt>
        {p.page && (
          <Txt x={x + 430} y={top + 60} size={22} weight={700} color={C.terracotta} anchor="end">
            {p.page}
          </Txt>
        )}
        {items.map((it, i) => {
          const y = top + 190 + i * 120;
          const a = at(c, it.at);
          const write = ramp(t, a + 0.1, 1.1);
          if (write <= 0) return null;
          if (it.kind === "strike") {
            const cross = ramp(t, a + 1.0, 0.5);
            const repl = ramp(t, a + 1.4, 0.8);
            return (
              <g key={i}>
                <g opacity={1 - repl * 0.55}>
                  <Txt x={x} y={y - 18} size={Math.min(34, Math.floor(1600 / it.from.length))} weight={700} family={SERIF} color={C.inkSoft}>
                    {`«${it.from}»`}
                  </Txt>
                  <rect x={x - 400} y={y - 32} width={800 * cross} height={6} fill={C.red} />
                </g>
                <Txt x={x} y={y + 34} size={40} weight={700} family={SERIF} color={C.terracotta} opacity={repl}>
                  {`«${it.to}»`}
                </Txt>
              </g>
            );
          }
          return (
            <g key={i}>
              <clipPath id={`clip-doc-${i}`}>
                <rect x={x - 480} y={y - 50} width={960 * write} height={80} />
              </clipPath>
              <g clipPath={`url(#clip-doc-${i})`}>
                <Txt x={x} y={y} size={Math.min(it.gold ? 40 : 38, Math.floor(1700 / it.text.length))} weight={it.gold ? 900 : 700} family={SERIF} color={it.gold ? C.terracotta : C.ink}>
                  {it.text}
                </Txt>
              </g>
              <Star8 x={x - 470} y={y - 12} r={10} fill={C.gold} opacity={write} />
            </g>
          );
        })}
      </g>
    </g>
  );
};

// ─────────────── азан: рассвет, звук волнами ───────────────
export const Adhan: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const dawn = ramp(t, 0, (c.ends[1] ?? 4) + 1);
  const voice = ramp(t, at(c, 1.4), 1);
  const bilal = pop(t, at(c, 2));
  return (
    <g>
      <Sky mode={dawn > 0.5 ? "dawn" : "night"} t={t} id={`adhan-${dawn > 0.5}`} sunX={x - 520} sunY={760 - dawn * 260} />
      <rect x={0} y={720} width={1920} height={360} fill="#c9a06a" opacity={0.6 + 0.4 * dawn} />
      {[-560, 520].map((dx, i) => (
        <Palm key={i} x={x + dx} y={760} s={1.05} t={t} seed={i} />
      ))}
      <g transform={`translate(${x} 780)`}>
        <rect x={-260} y={-160} width={520} height={160} fill="#d8b47e" stroke={OL} strokeWidth={5} />
        <path d="M -280 -160 L 280 -160 L 260 -140 L -260 -140 Z" fill="#6fb05c" stroke={OL} strokeWidth={4} />
        <path d="M -30 0 L -30 -80 Q 0 -110 30 -80 L 30 0 Z" fill="#7a4b2a" />
        {voice > 0 &&
          [0, 1, 2, 3, 4].map((i) => {
            const ph = (t * 0.6 + i / 5) % 1;
            return <ellipse key={i} cx={0} cy={-170} rx={60 + ph * 700} ry={20 + ph * 260} fill="none" stroke="#fff4d0" strokeWidth={6 * (1 - ph)} opacity={voice * (1 - ph)} />;
          })}
      </g>
      <Pop t={t} at={0.4} x={x} y={150}>
        <Tag x={0} y={0} text="рог? гонг?" size={38} color={C.white} />
      </Pop>
      {voice > 0 && (
        <g opacity={voice}>
          <Txt x={x} y={420} size={58} weight={700} family={SERIF} color="#fff4d0" stroke="#5a3d14">
            «Аллах велик!»
          </Txt>
        </g>
      )}
      {bilal > 0 && (
        <g transform={`translate(${x} 250) scale(${bilal})`}>
          <Tag x={0} y={0} text="голос Биляля" size={40} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x} y={505} text="стр. 230–231" dark={dawn < 0.5} k={voice} />
    </g>
  );
};

// ─────────────── кибла: Иерусалим → Кааба; примирение ───────────────
export const Qibla: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const turn = ramp(t, at(c, 0.45), 1.6);
  const peace = ramp(t, at(c, 1), 1.2);
  const ang = -40 + turn * 175; // стрелка: север-запад (Иерусалим) → юг (Мекка)
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#eaf7ec" opacity={0.4} />
      <g transform={`translate(${x - 260} 520)`}>
        <circle r={260} fill="#fffaf0" stroke={OL} strokeWidth={6} />
        <circle r={230} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="6 10" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={-4} y={-250} width={8} height={26} fill={OL} transform={`rotate(${i * 45})`} />
        ))}
        <g transform={`rotate(${ang})`}>
          <path d="M 0 -200 L 26 0 L 0 26 L -26 0 Z" fill={C.terracotta} stroke={OL} strokeWidth={4} />
          <path d="M 0 200 L 18 0 L -18 0 Z" fill="#9aa3ad" stroke={OL} strokeWidth={3} />
        </g>
        <circle r={14} fill={OL} />
        <g transform="translate(-200 -300)" opacity={1 - turn * 0.6}>
          <Txt x={0} y={0} size={34} weight={900}>
            Иерусалим
          </Txt>
        </g>
        <g transform="translate(140 330)" opacity={0.4 + turn * 0.6}>
          <Kaaba x={0} y={0} s={0.3} />
          <Txt x={0} y={50} size={34} weight={900}>
            Кааба
          </Txt>
        </g>
      </g>
      <Pop t={t} at={at(c, 0.6)} x={x - 260} y={110}>
        <Tag x={0} y={0} text="17-й или 18-й месяц — две версии" size={30} color="#fff4d0" />
      </Pop>
      {peace > 0 && (
        <g transform={`translate(${x + 340} 520)`} opacity={peace}>
          <Panel x={-240} y={-210} w={480} h={420} fill="#fffaf0" stroke={C.gold} />
          <Txt x={-110} y={-120} size={34} weight={900} color={C.terracotta}>
            аус
          </Txt>
          <Txt x={110} y={-120} size={34} weight={900} color={C.teal}>
            хазрадж
          </Txt>
          <circle cx={-110 + peace * 70} cy={0} r={60} fill="#ffd0c2" stroke={OL} strokeWidth={4} />
          <circle cx={110 - peace * 70} cy={0} r={60} fill="#c8f0e6" stroke={OL} strokeWidth={4} opacity={0.9} />
          <Txt x={0} y={150} size={30} weight={800}>
            «Возврат к язычеству?»
          </Txt>
        </g>
      )}
      <PageTag x={x - 260} y={900} text="стр. 249, 253–254, 281" k={0} />
    </g>
  );
};

export { Arrow, House, HEAVY };
