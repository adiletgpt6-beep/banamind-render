// Части 3–4: магнит, цепочка причин, гармония, три вероятности, идея совершенства,
// имена, «Нет ничего подобного Ему», столкновение воли, связь атрибутов.
// Правило: Творец не изображается ни в каком виде — ни светом, ни символом; только слова.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { Camel, Mountains, OL, Ship, Sky, Star8 } from "./draw";
import { PageTag, QuoteCard, wrap } from "./generic";
import { Icon } from "./icons";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";

// ─────────────── наскальные рисунки и магнит ───────────────
export const Magnet: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const wall = ramp(t, 0.2, 0.8) * (1 - ramp(t, at(c, 1) - 0.3, 0.5));
  const who = pop(t, at(c, 1));
  const mag = ramp(t, at(c, 2) - 0.2, 0.6);
  const pull = ramp(t, at(c, 2) + 0.6, 1.6);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 48–49" k={ramp(t, 0.3, 0.5)} />
      {wall > 0 && (
        <g opacity={wall}>
          <path d={`M ${x - 560} 240 Q ${x} 190 ${x + 560} 240 L ${x + 600} 800 Q ${x} 840 ${x - 600} 800 Z`} fill="#c99f72" stroke={OL} strokeWidth={6} />
          {/* рисунки охрой: солнце, звёзды, животные — без людей */}
          <g stroke="#8a3b22" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85}>
            <circle cx={x - 330} cy={380} r={50} />
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={x - 330 + Math.cos(i * 0.785) * 70} y1={380 + Math.sin(i * 0.785) * 70} x2={x - 330 + Math.cos(i * 0.785) * 95} y2={380 + Math.sin(i * 0.785) * 95} />
            ))}
            <path d={`M ${x - 60} 600 q 60 -70 140 -20 q 40 -40 80 0 M ${x + 10} 588 l -10 70 M ${x + 110} 588 l 10 70 M ${x + 200} 580 l 30 -40`} />
            <path d={`M ${x + 260} 380 l 18 40 l 44 4 l -34 28 l 12 44 l -40 -24 l -40 24 l 12 -44 l -34 -28 l 44 -4 Z`} />
            <path d={`M ${x - 420} 640 q 30 -50 90 -20 q 30 -30 60 0 M ${x - 380} 630 l -6 50 M ${x - 300} 628 l 6 50`} />
          </g>
          <Tag x={x} y={760} text="наскальные рисунки" size={32} color="#fff4d0" />
        </g>
      )}
      {who > 0.001 &&
        ["аль-Газали", "аш-Шахристани"].map((n, i) => (
          <g key={n} transform={`translate(${x - 220 + i * 440} 260) scale(${who})`} opacity={1 - mag * 0.3}>
            <Tag x={0} y={0} text={n} size={38} color={C.goldSoft} />
          </g>
        ))}
      {who > 0.001 && (
        <Txt x={x} y={360} size={40} weight={900} family={HEAVY} opacity={clamp01(who) * (1 - mag)}>
          доказательства пробуждают знание
        </Txt>
      )}
      {mag > 0 && (
        <g opacity={mag}>
          <g transform={`translate(${x + 260} 560) rotate(90)`}>
            <path d="M -110 -120 L -110 40 A 110 110 0 0 0 110 40 L 110 -120 L 50 -120 L 50 40 A 50 50 0 0 1 -50 40 L -50 -120 Z" fill="#e5484d" stroke={OL} strokeWidth={7} />
            <rect x={-110} y={-160} width={60} height={50} fill="#e8ecf8" stroke={OL} strokeWidth={6} />
            <rect x={50} y={-160} width={60} height={50} fill="#e8ecf8" stroke={OL} strokeWidth={6} />
          </g>
          {Array.from({ length: 9 }).map((_, i) => {
            const sx = x - 470 + (i % 3) * 70;
            const sy = 470 + Math.floor(i / 3) * 80;
            const tx = x + 75 - (i % 3) * 8;
            const ty = 500 + (i % 4) * 30;
            const k = clamp01(pull * 1.4 - i * 0.05);
            const e = k * k;
            return (
              <g key={i} transform={`translate(${sx + (tx - sx) * e} ${sy + (ty - sy) * e}) rotate(${(1 - e) * (i * 40) + e * 0})`}>
                <rect x={-34} y={-7} width={68} height={14} rx={4} fill="#8c93a8" stroke={OL} strokeWidth={4} />
                <circle cx={-34} cy={0} r={11} fill="#8c93a8" stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
          <Tag x={x} y={780} text="скрытое свойство: железо тянется к магниту" size={30} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ─────────────── цепочка причин ───────────────
export const Chain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const title = pop(t, 0.2);
  const change = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2) - 0.2, 0.4));
  const chain = ramp(t, at(c, 2), 2.4);
  const stop = ramp(t, at(c, 3), 0.8);
  const n = 8;
  const phase = (t * 0.5) % 1;
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 53–56" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} 240) scale(${title})`}>
        <Txt x={0} y={0} size={52} weight={900} family={HEAVY}>
          довод о возникновении мира
        </Txt>
        <Txt x={0} y={52} size={30} weight={800} color={C.terracotta}>
          «худус»
        </Txt>
      </g>
      {change > 0 && (
        <g opacity={change}>
          {[0, 1, 2, 3].map((i) => {
            const ph = (t * 0.6 + i * 0.25) % 1;
            return (
              <g key={i} transform={`translate(${x - 390 + i * 260} 520)`}>
                <circle r={90} fill="#fffaf0" stroke={OL} strokeWidth={5} />
                {i === 0 && <path d={`M 0 -60 A 60 60 0 1 0 0 60 A ${60 * Math.cos(ph * Math.PI * 2)} 60 0 1 ${ph < 0.5 ? 1 : 0} 0 -60 Z`} fill="#fff1a8" stroke={OL} strokeWidth={4} />}
                {i === 1 && (
                  <g transform={`rotate(${Math.sin(t * 2) * 10})`}>
                    <path d="M -36 36 Q -46 -30 36 -40 Q 42 30 -36 36 Z" fill={`hsl(${110 - ph * 90}, 55%, 52%)`} stroke={OL} strokeWidth={5} />
                  </g>
                )}
                {i === 2 && <Icon name="water" r={50} t={t} color={`hsl(${200 + ph * 40}, 70%, 85%)`} />}
                {i === 3 && <Icon name="sprout" r={50 + ph * 10} t={t} color="#d9f0c8" />}
              </g>
            );
          })}
          <Tag x={x} y={700} text="всё меняется → не вечно → есть начало" size={34} color={C.goldSoft} />
        </g>
      )}
      {chain > 0 && (
        <g opacity={1 - stop * 0.15}>
          {Array.from({ length: n }).map((_, i) => {
            const k = clamp01(chain * n - i);
            if (k <= 0) return null;
            const cx = x + 500 - i * 105;
            const fog = i >= n - 3 ? 1 - (i - (n - 3)) * 0.3 : 1;
            const wave = Math.sin((phase + i / n) * Math.PI * 2) * 6;
            return (
              <g key={i} transform={`translate(${cx} ${560 + wave}) scale(${k})`} opacity={fog * (stop > 0 ? 1 : 1)}>
                <ellipse rx={66} ry={36} fill="none" stroke={i % 2 ? "#8c93a8" : "#6b6f78"} strokeWidth={16} />
                <Txt x={0} y={-60} size={22} weight={800} color={C.inkSoft} opacity={0.7}>
                  {i === 0 ? "мир" : "причина"}
                </Txt>
              </g>
            );
          })}
          <g opacity={(1 - stop) * clamp01(chain * 2 - 1)}>
            <Txt x={x - 520} y={575} size={70} weight={900} color={C.inkSoft}>
              …?
            </Txt>
            <Cross x={x - 520} y={545} s={90} k={ramp(t, at(c, 2.7), 0.5)} />
            <Tag x={x - 200} y={720} text="бесконечная цепочка — без результата" size={30} color="#ececf2" />
          </g>
          {stop > 0 && (
            <g transform={`translate(${x - 520} 560) scale(${stop})`}>
              <Panel x={-190} y={-110} w={380} h={220} fill="#fffaf0" stroke={C.gold} r={30} />
              <Txt x={0} y={-24} size={32} weight={900}>
                {"Тот, Кто\nне имеет начала"}
              </Txt>
              <Txt x={0} y={78} size={26} weight={800} color={C.terracotta}>
                ни от чего не зависит
              </Txt>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ─────────────── довод гармонии: верблюд, небо, горы, земля ───────────────
export const Harmony: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const tag = pop(t, at(c, 0.4));
  const orbits = ramp(t, at(c, 1), 1);
  const labels = ["верблюд", "небеса", "горы", "земля"];
  const lp = [
    { x: x - 330, y: 700 },
    { x: x - 160, y: 330 },
    { x: x + 380, y: 520 },
    { x: x - 60, y: 820 },
  ];
  return (
    <g>
      <g transform={camera(t, c.dur, x, 600, 1.0, 1.06)}>
        <Sky mode="dawn" t={t} id="harm" sunX={x + 420} sunY={300} stars={40} />
        <Mountains y={720} color="#8c6f86" seed={3} />
        <Mountains y={760} color="#6f5a74" seed={6} scale={0.7} />
        <rect x={0} y={760} width={1920} height={320} fill="#e2b56c" />
        <Camel x={x - 330 + ((t * 18) % 140)} y={790} s={0.9} walk={t * 4} />
        {orbits > 0 && (
          <g opacity={orbits} transform={`translate(${x + 120} 360)`}>
            {[1, 2, 3].map((r) => (
              <g key={r}>
                <ellipse rx={90 * r} ry={30 * r} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} />
                <circle cx={Math.cos(t * (0.9 / r) + r) * 90 * r} cy={Math.sin(t * (0.9 / r) + r) * 30 * r} r={9 + r * 3} fill={["#ffd25e", "#9fdcc0", "#c5d8ff"][r - 1]} stroke={OL} strokeWidth={3} />
              </g>
            ))}
          </g>
        )}
      </g>
      {tag > 0.001 && (
        <g transform={`translate(${x} 150) scale(${tag})`}>
          <Tag x={0} y={0} text="«как ученого, так и мало образованного человека»" size={32} color="#fff4d0" />
        </g>
      )}
      {labels.map((l, i) => (
        <Pop key={l} t={t} at={at(c, 2.15 + i * 0.18)} x={lp[i].x} y={lp[i].y}>
          <Tag x={0} y={0} text={l} size={36} color={C.white} />
        </Pop>
      ))}
      <PageTag x={x} y={205} text="Сура «Аль-Гашийя» 88/17-20 · PDF 51, 54–55" k={ramp(t, at(c, 2), 0.5)} />
    </g>
  );
};

// ─────────────── три вероятности ───────────────
const Easel: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M -60 120 L -10 -110 M 60 120 L 10 -110 M 0 -110 L 0 130" stroke="#8a5a33" strokeWidth={9} strokeLinecap="round" />
    <rect x={-90} y={-100} width={180} height={140} fill="#fffaf0" stroke={OL} strokeWidth={6} />
    <path d="M -70 20 Q -30 -40 0 0 T 70 -30" stroke="#3b8fd0" strokeWidth={8} fill="none" />
    <circle cx={45} cy={-55} r={16} fill="#ffd25e" />
    <rect x={-100} y={-40 + Math.sin(t * 2) * 2} width={0} height={0} />
  </g>
);
const Plane: React.FC = () => (
  <g stroke={OL} strokeWidth={6} strokeLinejoin="round">
    <path d="M -110 0 Q -100 -22 -60 -22 L 90 -22 Q 120 -22 128 0 Q 120 18 90 18 L -60 18 Q -100 18 -110 0 Z" fill="#e8ecf8" />
    <path d="M -10 -18 L 40 -90 L 66 -90 L 40 -18 Z M -10 14 L 40 80 L 66 80 L 40 14 Z" fill="#c5d8ff" />
    <path d="M -96 -10 L -120 -60 L -100 -60 L -80 -18 Z" fill="#c5d8ff" />
    <path d="M 96 -14 Q 112 -14 116 -2 L 92 -2 Z" fill="#ececf2" />
  </g>
);
export const ThreeRoads: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const opts = [
    { n: "1", h: "сама себя", at: 1 },
    { n: "2", h: "случайность", at: 2 },
    { n: "3", h: "Творец", at: 3 },
  ];
  const w = 400;
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 58–61" k={ramp(t, 0.3, 0.5)} />
      <Txt x={x} y={240} size={50} weight={900} family={HEAVY} opacity={ramp(t, 0.3, 0.6)}>
        Как возникла Вселенная?
      </Txt>
      {opts.map((o, i) => {
        const k = pop(t, at(c, o.at));
        const cross = i < 2 ? ramp(t, at(c, o.at + 0.75), 0.5) : 0;
        const ok = i === 2 ? ramp(t, at(c, 3.4), 0.6) : 0;
        const cx = x - 430 + i * 430;
        return (
          <g key={o.n} transform={`translate(${cx} ${540 + wob(t, i, 3)}) scale(${k})`} opacity={clamp01(k * 2) * (cross > 0 ? 1 - 0.35 * cross : 1)}>
            <Panel x={-w / 2} y={-230} w={w} h={460} fill={i === 2 ? "#fffaf0" : "#f6f6fa"} stroke={i === 2 ? C.gold : undefined} r={34} />
            <Txt x={-w / 2 + 40} y={-170} size={40} weight={900} color={C.terracotta} anchor="start">
              {o.n}
            </Txt>
            {i === 0 && (
              <g>
                <g transform="translate(-90 -40) scale(0.6)">
                  <Easel t={t} />
                </g>
                <g transform="translate(85 -70) scale(0.55)">
                  <Plane />
                </g>
                <g transform="translate(70 40) scale(0.5)">
                  <Ship x={0} y={0} t={t} />
                </g>
              </g>
            )}
            {i === 1 && (
              <g transform="translate(0 -40)">
                {[0, 1].map((d) => (
                  <g key={d} transform={`translate(${-60 + d * 120} 0) rotate(${(t * 90 + d * 40) % 360})`}>
                    <rect x={-44} y={-44} width={88} height={88} rx={16} fill="#fff" stroke={OL} strokeWidth={6} />
                    {[[-20, -20], [20, 20], [0, 0], [20, -20], [-20, 20]].slice(0, 3 + d * 2).map(([dx, dy], j) => (
                      <circle key={j} cx={dx} cy={dy} r={8} fill={OL} />
                    ))}
                  </g>
                ))}
              </g>
            )}
            {i === 2 && (
              <g transform="translate(0 -50)">
                <Txt x={0} y={20} size={46} weight={700} family={SERIF} color={C.ink}>
                  {"«Разве есть\nсомнение…?!»"}
                </Txt>
              </g>
            )}
            <Txt x={0} y={150} size={42} weight={900} family={HEAVY}>
              {o.h}
            </Txt>
            {cross > 0 && <Cross x={0} y={-40} s={240} k={cross} />}
            {ok > 0 && <Check x={150} y={-170} s={60} k={ok} />}
          </g>
        );
      })}
    </g>
  );
};

// ─────────────── идея совершенства ───────────────
export const Idea: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const names = pop(t, 0.3);
  const bulb = pop(t, at(c, 1));
  const srcs = ["я — несовершенен", "небытие — ничто", "мир — с недостатками"];
  const end = ramp(t, at(c, 2), 0.6);
  const sufi = pop(t, at(c, 2.5));
  const glow = 0.6 + 0.4 * Math.sin(t * 3);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 56–57" k={ramp(t, 0.3, 0.5)} />
      {names > 0.001 &&
        ["Фараби", "Декарт"].map((n, i) => (
          <g key={n} transform={`translate(${x - 200 + i * 400} 250) scale(${names})`} opacity={1 - end}>
            <Tag x={0} y={0} text={n} size={42} color={i ? "#bfe0f7" : C.goldSoft} />
          </g>
        ))}
      {bulb > 0.001 && (
        <g transform={`translate(${x} 470) scale(${bulb})`}>
          <circle r={150} fill="#ffe08a" opacity={0.25 * glow} />
          <Icon name="mind" r={100} t={t} color="#fff4d0" />
          <Txt x={0} y={150} size={34} weight={900} family={HEAVY}>
            представление о совершенстве
          </Txt>
        </g>
      )}
      {srcs.map((s, i) => {
        const k = pop(t, at(c, 1.25 + i * 0.25));
        const sx = x + (i - 1) * 470;
        return (
          <g key={s} transform={`translate(${sx} 760) scale(${k})`} opacity={clamp01(k * 2) * (1 - end * 0.5)}>
            <Tag x={0} y={0} text={s} size={32} color="#ececf2" />
            <Cross x={0} y={-4} s={60} k={ramp(t, at(c, 1.25 + i * 0.25) + 0.4, 0.4)} />
          </g>
        );
      })}
      {end > 0 && (
        <g opacity={end}>
          <Arrow x1={x} y1={300} x2={x} y2={355} k={end} color={C.gold} w={9} />
          <Tag x={x} y={300} text="от Обладателя Совершенства" size={34} color={C.goldSoft} />
        </g>
      )}
      {sufi > 0.001 && (
        <g transform={`translate(${x + 430} 470) scale(${sufi})`}>
          <Panel x={-180} y={-110} w={360} h={220} fill="#fffaf0" r={28} />
          <Txt x={0} y={-50} size={28} weight={900} color={C.terracotta}>
            тасаввуф:
          </Txt>
          <Txt x={0} y={0} size={28} weight={800}>
            {"доказывать\nочевидное — напрасно"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── имена ───────────────
const NAMES = [
  { n: "Ар-Рахман", m: "Милостивый" },
  { n: "Аль-Алим", m: "Всезнающий" },
  { n: "Аль-Халик", m: "Создатель" },
];
export const Names: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const word = pop(t, 0.2);
  const num = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2) - 0.2, 0.4));
  const one = ramp(t, at(c, 2.6), 0.8);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 62–66" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} ${300 - 60 * clamp01(num + one)}) scale(${word * (1 - 0.35 * clamp01(num + one))})`} opacity={clamp01(word * 2)}>
        <Txt x={0} y={0} size={150} weight={700} family={SERIF} color={C.ink}>
          Аллах
        </Txt>
        <Txt x={0} y={70} size={32} weight={800} color={C.terracotta}>
          имя собственное — не переводится
        </Txt>
      </g>
      {num > 0 && (
        <g opacity={num} transform={`translate(${x} 560)`}>
          {Array.from({ length: 33 }).map((_, i) => {
            const a = (i / 33) * Math.PI * 2 + t * 0.2;
            return <Star8 key={i} x={Math.cos(a) * 300} y={Math.sin(a) * 160} r={12 + (i % 3) * 4} fill={i % 3 ? C.gold : C.tealSoft} rot={t * 30 + i * 10} />;
          })}
          <Txt x={0} y={40} size={140} weight={900} family={HEAVY} color={C.gold} stroke="#fff">
            99
          </Txt>
          <Txt x={0} y={115} size={32} weight={800} color={C.inkSoft}>
            самые известные — имён больше
          </Txt>
        </g>
      )}
      {NAMES.map((nm, i) => {
        const k = pop(t, at(c, 2.02 + i * 0.13));
        const cx = x + (i - 1) * 400;
        return (
          <g key={nm.n} transform={`translate(${cx} ${560 + wob(t, i, 3)}) scale(${k})`} opacity={clamp01(k * 2)}>
            <Panel x={-170} y={-100} w={340} h={200} fill="#fffaf0" r={26} stroke={C.gold} />
            <Txt x={0} y={-14} size={42} weight={900} family={HEAVY}>
              {nm.n}
            </Txt>
            <Txt x={0} y={48} size={32} weight={800} color={C.terracotta}>
              {nm.m}
            </Txt>
          </g>
        );
      })}
      {one > 0 && (
        <g opacity={one}>
          <Tag x={x} y={780} text="много имён — один Создатель" size={38} color={C.goldSoft} />
        </g>
      )}
    </g>
  );
};

// ─────────────── «Нет ничего подобного Ему» ───────────────
export const NotLike: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const q1 = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const big = pop(t, at(c, 1.35));
  const neg = ramp(t, at(c, 2), 0.4);
  const created = ["leaf", "water", "sun", "sprout", "moon", "star"];
  const nots = ["тело", "форма", "место", "время"];
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 67–70" k={ramp(t, 0.3, 0.5)} />
      {q1 > 0 && (
        <g opacity={q1}>
          {created.map((ic, i) => {
            const a = (i / created.length) * Math.PI * 2 + t * 0.25;
            return (
              <g key={ic} transform={`translate(${x + Math.cos(a) * 520} ${520 + Math.sin(a) * 250})`}>
                <Icon name={ic} r={48} t={t} color={[C.goldSoft, C.tealSoft, "#ffd0c2", "#d9f0c8", "#e6dcff", "#fff4d0"][i]} />
              </g>
            );
          })}
          <QuoteCard x={x} y={520} w={760} k={q1} text="Думайте о созданиях Аллаха. Но не задумывайтесь о Сущности Аллаха" by="хадис · PDF 67" size={40} />
        </g>
      )}
      {big > 0.001 && (
        <g transform={`translate(${x} ${380 - 80 * neg}) scale(${big * (1 - 0.25 * neg)})`}>
          <Txt x={0} y={0} size={96} weight={700} family={SERIF} color={C.ink}>
            {"Нет ничего\nподобного Ему"}
          </Txt>
          <Txt x={0} y={170} size={30} weight={800} color={C.terracotta}>
            Сура «Аш-Шура» 42/11
          </Txt>
        </g>
      )}
      {neg > 0 &&
        nots.map((n, i) => {
          const k = pop(t, at(c, 2.05 + i * 0.1));
          return (
            <g key={n} transform={`translate(${x - 450 + i * 300} 650) scale(${k})`} opacity={clamp01(k * 2)}>
              <Tag x={0} y={0} text={n} size={40} color="#ececf2" />
              <line x1={-70} y1={-6} x2={-70 + 140 * ramp(t, at(c, 2.05 + i * 0.1) + 0.3, 0.4)} y2={-6} stroke={C.red} strokeWidth={7} strokeLinecap="round" />
            </g>
          );
        })}
      {neg > 0 && (
        <Pop t={t} at={at(c, 2.6)} x={x} y={790}>
          <Tag x={0} y={0} text="Он ни в чём не нуждается · мы нуждаемся во всём" size={32} color={C.goldSoft} />
        </Pop>
      )}
    </g>
  );
};

// ─────────────── столкновение воли ───────────────
export const TwoWills: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const title = pop(t, 0.2);
  const setup = ramp(t, at(c, 1), 0.6);
  const outs = ramp(t, at(c, 2) - 0.2, 0.4);
  const quote = ramp(t, at(c, 3), 0.6);
  const jitter = Math.sin(t * 13) * 8 * setup * (1 - outs);
  const branches = [
    { h: "оба желания", r: "абсурд" },
    { h: "ни одного", r: "оба бессильны" },
    { h: "только одно", r: "второй слаб" },
  ];
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 72–73" k={ramp(t, 0.3, 0.5)} />
      <g transform={`translate(${x} 240) scale(${title})`} opacity={1 - quote * 0.8}>
        <Txt x={0} y={0} size={46} weight={900} family={HEAVY}>
          доказательство столкновения воли
        </Txt>
      </g>
      {setup > 0 && (
        <g opacity={setup * (1 - outs * 0.8) * (1 - quote)} transform={`translate(${x} 470)`}>
          <Arrow x1={-60} y1={0} x2={-360} y2={0} k={setup} color="#3b8fd0" w={12} />
          <g transform="translate(60 0)">
            <rect x={0} y={-50} width={300} height={100} rx={20} fill="none" stroke="#e5484d" strokeWidth={10} strokeDasharray="20 14" />
          </g>
          <circle cx={jitter} cy={0} r={46} fill={C.gold} stroke={OL} strokeWidth={6} />
          <Tag x={-300} y={-90} text="«двигаться»" size={32} color="#bfe0f7" />
          <Tag x={260} y={-90} text="«покой»" size={32} color="#ffd0c2" />
        </g>
      )}
      {branches.map((b, i) => {
        const k = pop(t, at(c, 2 + i * 0.3));
        const bx = x + (i - 1) * 430;
        return (
          <g key={b.h} transform={`translate(${bx} 600) scale(${k})`} opacity={clamp01(k * 2) * (1 - quote * 0.85)}>
            <Panel x={-190} y={-110} w={380} h={220} fill="#fffaf0" r={28} />
            <Txt x={0} y={-36} size={36} weight={900}>
              {b.h}
            </Txt>
            <Txt x={0} y={22} size={32} weight={800} color={C.red}>
              {`→ ${b.r}`}
            </Txt>
            <Cross x={0} y={70} s={44} k={ramp(t, at(c, 2 + i * 0.3) + 0.4, 0.4)} />
          </g>
        );
      })}
      <QuoteCard x={x} y={500} w={1040} k={quote} text="Если на земле или на небесах были бы другие божества, кроме Аллаха, то тогда все бы нарушилось" by="Сура «Аль-Анбийя» 21/22 · PDF 72" size={44} />
    </g>
  );
};

// ─────────────── восемь атрибутов и их связь ───────────────
const ATTR8 = ["Жизнь", "Знание", "Воля", "Могущество", "Слышание", "Видение", "Речь", "Создание"];
const PIPE = [
  { h: "Знание", s: "что произойдёт" },
  { h: "Воля", s: "выбор" },
  { h: "Могущество", s: "осуществимо" },
  { h: "Создание", s: "создаётся" },
];
export const Conveyor: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const ring = ramp(t, 0.2, 0.6) * (1 - ramp(t, at(c, 1) - 0.3, 0.4));
  const pipe = ramp(t, at(c, 1), 0.4) * (1 - ramp(t, at(c, 2) - 0.3, 0.4));
  const leaf = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <PageTag x={x} y={150} text="PDF 75–82" k={ramp(t, 0.3, 0.5)} />
      {ring > 0 &&
        ATTR8.map((a, i) => {
          const k = pop(t, at(c, 0.15 + i * 0.09));
          const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
          return (
            <g key={a} transform={`translate(${x + Math.cos(ang) * 430} ${520 + Math.sin(ang) * 260}) scale(${k})`} opacity={ring}>
              <Tag x={0} y={0} text={a} size={36} color={[C.goldSoft, "#bfe0f7", "#d9f0c8", "#ffd0c2"][i % 4]} />
            </g>
          );
        })}
      {ring > 0 && (
        <Txt x={x} y={535} size={44} weight={900} family={HEAVY} opacity={ring}>
          {"восемь вечных\nатрибутов"}
        </Txt>
      )}
      {pipe > 0 &&
        PIPE.map((p, i) => {
          const k = pop(t, at(c, 1.2 + i * 0.18));
          const px = x - 465 + i * 310;
          const lit = clamp01((t - at(c, 1.2 + i * 0.18)) / 0.4);
          return (
            <g key={p.h} opacity={pipe}>
              {i > 0 && <Arrow x1={px - 230} y1={500} x2={px - 140} y2={500} k={lit} color={C.gold} w={9} />}
              <g transform={`translate(${px} 500) scale(${k})`}>
                <Panel x={-130} y={-100} w={260} h={200} fill="#fffaf0" stroke={lit >= 1 ? C.gold : undefined} r={26} />
                <Txt x={0} y={-10} size={p.h.length > 8 ? 32 : 40} weight={900} family={HEAVY}>
                  {p.h}
                </Txt>
                <Txt x={0} y={44} size={28} weight={800} color={C.terracotta}>
                  {p.s}
                </Txt>
              </g>
            </g>
          );
        })}
      {leaf > 0 && (
        <g opacity={leaf}>
          {/* ветка и падающий лист */}
          <path d={`M ${x - 600} 250 Q ${x - 300} 300 ${x - 80} 260`} stroke="#8a5a33" strokeWidth={16} fill="none" strokeLinecap="round" />
          {[-520, -420, -300, -200].map((dx, i) => (
            <path key={i} d="M 0 0 Q -20 -36 20 -50 Q 34 -10 0 0 Z" fill="#7cc576" stroke={OL} strokeWidth={4} transform={`translate(${x + dx} ${270 - i * 4}) rotate(${-30 + i * 25})`} />
          ))}
          {(() => {
            const f = clamp01((t - at(c, 2)) / 3.5);
            const lx = x - 120 + Math.sin(f * 9) * 60;
            const ly = 280 + f * 420;
            return <path d="M 0 0 Q -24 -40 24 -56 Q 40 -12 0 0 Z" fill="#e2b56c" stroke={OL} strokeWidth={4} transform={`translate(${lx} ${ly}) rotate(${Math.sin(f * 9) * 50})`} />;
          })()}
          <QuoteCard x={x + 250} y={560} w={720} k={leaf} text="ни один лист не упадет без Его ведома" by="Сура «Аль-Ан‘ам» 6/59 · PDF 76" size={44} />
        </g>
      )}
    </g>
  );
};

export { wrap };
