// Вступление и глава 1: крючок, книга, заставки глав, пейзажи, Замзам, год слона,
// кочевники Бану Саад, Чёрный камень. Людей в кадре нет.
import React from "react";
import { interpolate } from "remotion";
import { C, HEAVY, SERIF } from "../theme";
import { Birds, Camel, Caravan, Dunes, House, Kaaba, Lantern, Mountains, OL, Palm, Sky, Star8, Tent, type SkyMode } from "./draw";
import { Sheep } from "./icons";
import { Arrow, Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";

// маленькая подпись страницы книги
export const PageTag: React.FC<{ x: number; y: number; text: string; dark?: boolean; k?: number }> = ({ x, y, text, dark, k = 1 }) => {
  if (k <= 0) return null;
  const w = text.length * 15 + 40;
  return (
    <g transform={`translate(${x} ${y})`} opacity={clamp01(k)}>
      <rect x={-w / 2} y={-22} width={w} height={40} rx={20} fill={dark ? "rgba(255,255,255,0.14)" : "rgba(36,50,74,0.08)"} />
      <Txt x={0} y={7} size={24} weight={700} color={dark ? "#e8ecf8" : C.inkSoft}>
        {text}
      </Txt>
    </g>
  );
};

// ─────────────── крючок: ночь, один огонёк → множество огней ───────────────
export const Hook: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const one = ramp(t, at(c, 1), 1.2);
  const many = ramp(t, at(c, 2), 2.4);
  const title = pop(t, at(c, 3));
  return (
    <g>
      <g transform={camera(t, c.dur, 820, 700, 1.0, 1.1)}>
        <Sky mode="night" t={t} id="hook" sunX={1500} sunY={200} />
        <Mountains y={720} color="#232a4a" seed={3} />
        <Mountains y={760} color="#1b2140" seed={7} scale={0.7} />
        <Dunes t={t} tone="night" y={800} pan={3} />
        <Caravan t={t} y={890} n={4} speed={45} s={0.55} from={-200} />
        {one > 0 && <Lantern x={820} y={700} s={0.55 + 0.1 * one} t={t} glow={one} />}
        {many > 0 &&
          Array.from({ length: 160 }).map((_, i) => {
            const x = 200 + ((i * 197) % 1300);
            const y = 650 + ((i * 89) % 180);
            const d = Math.hypot(x - 820, (y - 700) * 3);
            const k = clamp01(many * 1.6 - d / 900);
            if (k <= 0) return null;
            const tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={14 * k} fill="#ffd977" opacity={0.18 * k} />
                <circle cx={x} cy={y} r={3.5 * k} fill="#fff1b0" opacity={tw} />
              </g>
            );
          })}
      </g>
      {title > 0 && (
        <g transform={`translate(820 250) scale(${0.85 + 0.15 * title})`} opacity={clamp01(title * 1.5)}>
          <Txt x={0} y={0} size={84} weight={700} family={SERIF} color="#fff4d0">
            Жизнеописание
          </Txt>
          <Txt x={0} y={86} size={64} weight={700} family={SERIF} color="#fff4d0">
            Пророка Мухаммада
          </Txt>
          <Star8 x={-330} y={40} r={20} fill={C.gold} rot={t * 20} />
          <Star8 x={330} y={40} r={20} fill={C.gold} rot={-t * 20} />
          <Txt x={0} y={150} size={36} weight={800} color={C.goldSoft}>
            Ибн Хишам · простыми словами
          </Txt>
        </g>
      )}
    </g>
  );
};

// ─────────────── о книге: цепочка передатчиков и правило фильма ───────────────
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const b = pop(t, 0.2);
  const chain = ["Ибн Исхак", "аль-Баккаи", "Ибн Хишам"];
  const rule = pop(t, at(c, 3));
  const bookOut = ramp(t, at(c, 3) - 0.4, 0.5);
  return (
    <g>
      <g transform={`translate(${x} 430) scale(${b})`} opacity={clamp01(b * 2) * (1 - bookOut)}>
        <g transform={`rotate(${wob(t, 1, 1.5)})`}>
          <rect x={-200} y={-250} width={400} height={500} rx={18} fill="#2f6f5a" stroke={OL} strokeWidth={6} />
          <rect x={-180} y={-230} width={360} height={460} rx={12} fill="none" stroke={C.gold} strokeWidth={5} />
          <Star8 x={0} y={-140} r={46} fill={C.gold} rot={t * 8} />
          <Txt x={0} y={-40} size={36} weight={700} family={SERIF} color="#fff4d0">
            {"Жизнеописание\nПророка\nМухаммада"}
          </Txt>
          <Txt x={0} y={170} size={30} weight={800} color={C.goldSoft}>
            Ибн Хишам
          </Txt>
        </g>
      </g>
      {chain.map((n, i) => {
        const k = pop(t, at(c, 1) + i * 0.45);
        const cx = x - 420 + i * 420;
        return (
          <g key={n}>
            {i > 0 && <Arrow x1={cx - 330} y1={780} x2={cx - 100} y2={780} k={ramp(t, at(c, 1) + i * 0.45 - 0.2, 0.4)} color={C.gold} w={8} />}
            <Pop t={t} at={at(c, 1) + i * 0.45} x={cx} y={780}>
              <Tag x={0} y={0} text={n} size={36} color={i === 2 ? C.gold : C.white} />
            </Pop>
            {i === 0 && k > 0 && (
              <Txt x={cx} y={850} size={26} weight={700} color={C.inkSoft} opacity={k}>
                VIII век
              </Txt>
            )}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 2)} x={x} y={150}>
        <Tag x={0} y={0} text="перевод Н. А. Гайнуллина · 656 страниц" size={30} color="#fff4d0" />
      </Pop>
      {rule > 0 && (
        <g transform={`translate(${x} 470) scale(${rule})`}>
          <Panel x={-470} y={-170} w={940} h={330} fill="#fffaf0" stroke={C.gold} />
          <Txt x={0} y={-95} size={40} weight={900} color={C.ink}>
            Без изображений пророков
          </Txt>
          {[
            ["места", "🕋"],
            ["карты", "🗺"],
            ["вещи", "📜"],
            ["слова", "✦"],
          ].map(([w], i) => (
            <g key={w} transform={`translate(${-330 + i * 220} 40)`}>
              <circle r={58} fill={[C.sandDeep, C.tealSoft, C.parchment, C.goldSoft][i]} stroke={OL} strokeWidth={4} />
              {i === 0 && <Kaaba x={0} y={36} s={0.28} />}
              {i === 1 && <path d="M -32 -24 L -10 -32 L 12 -24 L 34 -32 L 34 26 L 12 34 L -10 26 L -32 34 Z" fill="#fff" stroke={OL} strokeWidth={4} />}
              {i === 2 && <rect x={-24} y={-30} width={48} height={60} fill={C.paper} stroke={OL} strokeWidth={4} />}
              {i === 3 && <Star8 x={0} y={0} r={30} fill={C.gold} stroke={OL} />}
              <Txt x={0} y={100} size={30} weight={800}>
                {w}
              </Txt>
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ─────────────── заставка главы ───────────────
export const Chapter: React.FC<VisualProps<{ n: number; label: string; sub?: string }>> = (c) => {
  const { t, p } = c;
  const k = pop(t, 0.1);
  const line = ramp(t, 0.35, 0.8);
  const NUM = ["", "ПЕРВАЯ", "ВТОРАЯ", "ТРЕТЬЯ", "ЧЕТВЁРТАЯ", "ПЯТАЯ", "ШЕСТАЯ", "СЕДЬМАЯ", "ВОСЬМАЯ", "ДЕВЯТАЯ"];
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#14213d" opacity={0.9} />
      <g transform={`translate(960 470) rotate(${t * 6})`} opacity={0.18}>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`rotate(${i * 30}) translate(0 -330)`}>
            <Star8 x={0} y={0} r={60} fill="none" stroke={C.gold} />
          </g>
        ))}
        <Star8 x={0} y={0} r={250} fill="none" stroke={C.gold} />
      </g>
      <g transform={`translate(960 470) scale(${0.8 + 0.2 * k})`} opacity={clamp01(k * 1.5)}>
        <Star8 x={0} y={-190} r={42} fill={C.gold} rot={t * 30} />
        <Txt x={0} y={-90} size={40} weight={800} color={C.goldSoft} family={HEAVY}>
          {`ГЛАВА ${NUM[p.n] ?? p.n}`}
        </Txt>
        <Txt x={0} y={30} size={104} weight={700} family={SERIF} color="#fff4d0">
          {p.label}
        </Txt>
        <rect x={-360 * line} y={70} width={720 * line} height={6} rx={3} fill={C.gold} />
        {p.sub && (
          <Txt x={0} y={140} size={32} weight={700} color="#c9d3ee">
            {`по книге Ибн Хишама · ${p.sub}`}
          </Txt>
        )}
      </g>
    </g>
  );
};

// ─────────────── пейзаж: город, Кааба, пальмы, караван ───────────────
export const Landscape: React.FC<VisualProps<{ mode?: SkyMode; city?: "mecca" | "medina"; kaaba?: boolean; caravan?: boolean; palms?: boolean; banners?: boolean; label?: string; page?: string }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const mode = p.mode ?? "day";
  const night = mode === "night";
  const houses = Array.from({ length: 11 }).map((_, i) => ({ dx: (i - 5) * 92 + ((i * 37) % 30), h: 70 + ((i * 53) % 60), w: 80 + ((i * 29) % 40) }));
  const lbl = pop(t, 0.5);
  return (
    <g>
      <g transform={camera(t, c.dur, x, 640, 1.0, 1.07)}>
        <Sky mode={mode} t={t} id={`ls-${c.p.host}-${mode}`} sunX={x > 960 ? 520 : 1450} />
        <Mountains y={700} color={night ? "#2b3157" : p.city === "medina" ? "#b58a64" : "#9a6e4f"} seed={p.city === "medina" ? 5 : 1} scale={p.city === "medina" ? 0.6 : 1} />
        <Mountains y={740} color={night ? "#232848" : "#86603f"} seed={9} scale={0.55} />
        <rect x={0} y={720} width={1920} height={360} fill={night ? "#2c3155" : C.sandDeep} />
        {p.city === "medina" &&
          [-640, -470, 380, 520, 690].map((dx, i) => <Palm key={i} x={x + dx} y={800 + (i % 2) * 20} s={0.9 + (i % 3) * 0.12} t={t} seed={i} />)}
        <g>
          {houses.map((h, i) => (
            <House key={i} x={x + h.dx} y={790 + (i % 3) * 14} w={h.w} h={h.h} color={i % 2 ? "#e7c08a" : "#dcae74"} lit={night} door={i % 3 === 0} />
          ))}
        </g>
        {p.kaaba && <Kaaba x={x} y={815} s={0.95} glow={0.4 + 0.2 * Math.sin(t)} />}
        {p.banners &&
          [-380, -250, 250, 380].map((dx, i) => {
            const k = pop(t, 0.6 + i * 0.25);
            return (
              <g key={i} transform={`translate(${x + dx} ${900}) scale(${k})`}>
                <path d="M 0 0 L 0 -230" stroke={OL} strokeWidth={6} />
                <path d={`M 0 -230 Q 60 ${-210 + wob(t, i, 8)} 110 -200 Q 60 -180 0 -170 Z`} fill={[C.green, C.gold, C.terracotta, C.teal][i]} stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
        <Dunes t={t} tone={night ? "night" : "day"} y={900} pan={4} />
        {p.palms && p.city !== "medina" && <Palm x={x - 520} y={960} s={1.2} t={t} />}
        {p.caravan && <Caravan t={t} y={1000} n={4} speed={50} s={0.6} from={-150} />}
      </g>
      {p.label && lbl > 0 && (
        <g transform={`translate(${x} 150) scale(${lbl})`}>
          <Tag x={0} y={0} text={p.label} size={48} color="#fff4d0" />
        </g>
      )}
      {p.page && <PageTag x={x} y={225} text={p.page} k={ramp(t, 0.9, 0.5)} dark={night} />}
    </g>
  );
};

// ─────────────── Замзам: вода для всех ───────────────
export const Zamzam: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const water = ramp(t, at(c, 1.4), 1.2);
  const skins = [-1, 1].flatMap((side) => [0, 1, 2].map((i) => ({ side, i })));
  return (
    <g>
      <Sky mode="day" t={t} id="zam" sunX={x + 420} sunY={220} />
      <Mountains y={680} color="#a77a55" seed={2} />
      <rect x={0} y={680} width={1920} height={400} fill={C.sand} />
      <Dunes t={t} y={860} pan={2} />
      <g transform={`translate(${x} 700)`}>
        <ellipse cx={0} cy={60} rx={200} ry={44} fill="#000" opacity={0.12} />
        <path d="M -170 0 L -170 60 Q 0 110 170 60 L 170 0 Z" fill="#b99f7e" stroke={OL} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={170} ry={40} fill="#8c7a66" stroke={OL} strokeWidth={5} />
        <ellipse cx={0} cy={4} rx={130} ry={28} fill={water > 0 ? "#3c8cc4" : "#4a3b2c"} />
        {water > 0 &&
          Array.from({ length: 14 }).map((_, i) => {
            const ph = (t * 1.3 + i / 14) % 1;
            const ang = (i / 14) * Math.PI * 2;
            const r = ph * 220 * water;
            return <circle key={i} cx={Math.cos(ang) * r} cy={-ph * (1 - ph) * 520 * water + 0} r={9 * (1 - ph)} fill="#8fd0f0" opacity={0.9} />;
          })}
        {water > 0 && <path d={`M -20 0 Q 0 ${-200 * water} 20 0 Z`} fill="#8fd0f0" opacity={0.85} />}
      </g>
      {skins.map(({ side, i }, n) => {
        const k = pop(t, at(c, 1.6) + n * 0.12);
        const fill = ramp(t, at(c, 1.6) + 0.4 + n * 0.12, 1);
        const sx = x + side * (280 + i * 120);
        return (
          <g key={n} transform={`translate(${sx} ${820 + i * 20}) scale(${k})`}>
            <path d="M -30 -50 Q -46 10 -20 40 L 20 40 Q 46 10 30 -50 Z" fill={side < 0 ? "#b5523b" : "#7a5a33"} stroke={OL} strokeWidth={4} />
            <rect x={-10} y={-64} width={20} height={16} fill="#5a3d14" />
            <rect x={-24} y={40 - 70 * fill} width={48} height={70 * fill} fill="#8fd0f0" opacity={0.55} />
          </g>
        );
      })}
      <Pop t={t} at={0.4} x={x} y={150}>
        <Tag x={0} y={0} text="Замзам" size={50} color="#fff4d0" />
      </Pop>
      <Pop t={t} at={at(c, 1.7)} x={x} y={250}>
        <Tag x={0} y={0} text="«Идите к воде! Аллах нас напоил»" size={32} color={C.white} />
      </Pop>
      <PageTag x={x} y={320} text="стр. 51–53" k={ramp(t, at(c, 1.9), 0.5)} />
    </g>
  );
};

// слон (профиль); kneel 0…1 — опускается на колени
const Elephant: React.FC<{ x: number; y: number; s?: number; t: number; kneel: number; walk: number }> = ({ x, y, s = 1, t, kneel, walk }) => {
  const legs = [-110, -50, 60, 120];
  const drop = kneel * 70;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={6} rx={220} ry={24} fill="#000" opacity={0.15} />
      {legs.map((lx, i) => {
        const sw2 = (1 - kneel) * Math.sin(walk + i * 1.6) * 12;
        const h = 150 - drop * (i < 2 ? 1 : 0.6);
        return <rect key={i} x={lx - 28 + sw2} y={-h} width={56} height={h} rx={20} fill="#9aa3ad" stroke={OL} strokeWidth={5} />;
      })}
      <g transform={`translate(0 ${drop * 0.9}) rotate(${kneel * 4})`}>
        <ellipse cx={0} cy={-230} rx={190} ry={120} fill="#aab3bd" stroke={OL} strokeWidth={6} />
        <ellipse cx={175} cy={-280} rx={85} ry={80} fill="#aab3bd" stroke={OL} strokeWidth={6} />
        <path d="M 120 -330 Q 70 -260 120 -200 Q 150 -250 150 -300 Z" fill="#c3cbd3" stroke={OL} strokeWidth={5} />
        <path d={`M 240 -250 Q ${290 + Math.sin(t * 2) * 8} -150 ${260 + kneel * 30} ${-60 + kneel * 30}`} stroke="#aab3bd" strokeWidth={36} fill="none" strokeLinecap="round" />
        <path d={`M 240 -250 Q ${290 + Math.sin(t * 2) * 8} -150 ${260 + kneel * 30} ${-60 + kneel * 30}`} stroke={OL} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
        <path d="M 215 -235 Q 250 -215 265 -225" stroke="#fffaf0" strokeWidth={12} strokeLinecap="round" fill="none" />
        <circle cx={200} cy={-300} r={7} fill={OL} />
        <path d="M -185 -240 Q -215 -210 -205 -170" stroke={OL} strokeWidth={6} fill="none" />
        <rect x={-90} y={-345} width={180} height={40} rx={10} fill="#b5523b" stroke={OL} strokeWidth={4} />
        <path d="M -90 -325 L 90 -325" stroke={C.gold} strokeWidth={6} />
      </g>
    </g>
  );
};

// ─────────────── год слона ───────────────
export const ElephantScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const walkIn = ramp(t, 0, 2.5);
  const kneel = ramp(t, at(c, 2), 1.2);
  const birds = ramp(t, at(c, 2.4), 3);
  const year = pop(t, at(c, 3));
  const ex = x - 260 + walkIn * 260;
  return (
    <g>
      <Sky mode="day" t={t} id="eleph" sunX={x + 500} sunY={210} />
      <Mountains y={700} color="#9a6e4f" seed={4} />
      <rect x={0} y={700} width={1920} height={380} fill={C.sandDeep} />
      <Kaaba x={x + 470} y={760} s={0.45} />
      <Dunes t={t} y={900} pan={2} />
      <Elephant x={ex} y={930} s={0.95} t={t} kneel={kneel} walk={t * 5 * (1 - kneel)} />
      {birds > 0 && (
        <g>
          <Birds t={t} x={1900 - birds * 900} y={260 + Math.sin(t) * 20} n={14} spread={420} s={1.1} />
          {Array.from({ length: 10 }).map((_, i) => {
            const ph = (t * 0.9 + i * 0.37) % 1;
            const bx = 1900 - birds * 900 + ((i * 83) % 380) - 190;
            return <circle key={i} cx={bx - ph * 60} cy={300 + ph * 520} r={6} fill="#7a5a3a" opacity={birds * (1 - ph)} />;
          })}
        </g>
      )}
      <Pop t={t} at={at(c, 2.5)} x={x + 360} y={150}>
        <Tag x={0} y={0} text="Коран, сура 105" size={32} color={C.white} />
      </Pop>
      <Pop t={t} at={at(c, 1)} x={x - 120} y={150}>
        <Tag x={0} y={0} text="«у храма есть свой хозяин»" size={34} color="#fff4d0" />
      </Pop>
      {year > 0 && (
        <g transform={`translate(${x} 330) scale(${year})`}>
          <Txt x={0} y={0} size={96} weight={900} family={HEAVY} color={C.ink} stroke="#fff4d0">
            ГОД СЛОНА
          </Txt>
          <PageTag x={0} y={60} text="стр. 25–31, 59" />
        </g>
      )}
    </g>
  );
};

// ─────────────── кочевники Бану Саад: благодать в доме Халимы ───────────────
export const Nomads: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const blessing = ramp(t, at(c, 2), 1.5);
  const ages = [
    { text: "6 лет — умерла мать, Амина", at: 3 },
    { text: "8 лет — умер дед", at: 3.4 },
    { text: "дядя Абу Талиб", at: 3.8, gold: true },
  ];
  return (
    <g>
      <Sky mode="day" t={t} id="nomads" sunX={x - 500} sunY={220} />
      <Mountains y={690} color="#b58a64" seed={6} scale={0.7} />
      <rect x={0} y={690} width={1920} height={390} fill={C.sand} />
      <Dunes t={t} y={880} pan={2} />
      {[-300, -60, 220].map((dx, i) => (
        <Tent key={i} x={x + dx} y={760 + i * 6} s={1.3 - i * 0.12} color={["#f2e6cf", "#e9d2b0", "#f6ead6"][i]} />
      ))}
      <Camel x={x + 380} y={900} s={0.75} walk={0} color={blessing > 0.5 ? "#d4a868" : "#b89268"} />
      {blessing > 0 && <circle cx={x + 400} cy={830} r={80 * blessing} fill="#fff1b0" opacity={0.25 * blessing} />}
      {Array.from({ length: 7 }).map((_, i) => {
        const back = ramp(t, at(c, 2.3) + i * 0.1, 2);
        const sx = x - 620 + i * 85 + back * 120 + Math.sin(t + i) * 6;
        return <Sheep key={i} x={sx} y={950 + (i % 2) * 30} s={0.9 + blessing * 0.15} t={t} seed={i} />;
      })}
      <Pop t={t} at={at(c, 1)} x={x} y={150}>
        <Tag x={0} y={0} text="кормилица Халима · Бану Саад" size={36} color="#fff4d0" />
      </Pop>
      <PageTag x={x} y={225} text="стр. 58–64" k={ramp(t, at(c, 1.2), 0.5)} />
      {ages.map((a, i) => (
        <Pop key={i} t={t} at={at(c, a.at)} x={x} y={330 + i * 75}>
          <Tag x={0} y={0} text={a.text} size={32} color={a.gold ? C.gold : C.white} />
        </Pop>
      ))}
    </g>
  );
};

// ─────────────── Чёрный камень на ткани ───────────────
export const BlackStone: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const lift = ramp(t, at(c, 2.3), 1.6);
  const ropes = ramp(t, at(c, 2), 0.8);
  const truth = pop(t, at(c, 1.6));
  const flags = [
    { dx: -520, dy: 120, col: C.green },
    { dx: -380, dy: 260, col: C.terracotta },
    { dx: 380, dy: 260, col: C.teal },
    { dx: 520, dy: 120, col: C.gold },
  ];
  const cy = 820 - lift * 160;
  return (
    <g>
      <Sky mode="day" t={t} id="stone" sunX={x + 560} sunY={200} />
      <Mountains y={640} color="#9a6e4f" seed={8} />
      <rect x={0} y={640} width={1920} height={440} fill="#e8d2a6" />
      <g opacity={0.9}>
        <Kaaba x={x} y={700} s={1.45} />
      </g>
      {flags.map((f, i) => {
        const fx = x + f.dx;
        const fy = 700 + f.dy;
        const corner = { x: x + (i < 2 ? -90 : 90), y: cy + (i === 0 || i === 3 ? -20 : 30) };
        return (
          <g key={i}>
            {ropes > 0 && <path d={`M ${fx} ${fy - 150} Q ${(fx + corner.x) / 2} ${Math.max(fy, corner.y) + 30} ${corner.x} ${corner.y}`} stroke="#8a5a33" strokeWidth={6} fill="none" strokeDasharray={900} strokeDashoffset={900 * (1 - ropes)} />}
            <Pop t={t} at={at(c, 2) + i * 0.12} x={fx} y={fy}>
              <g>
                <path d="M 0 0 L 0 -230" stroke={OL} strokeWidth={6} />
                <path d={`M 0 -230 Q 50 ${-212 + wob(t, i, 6)} 95 -200 Q 50 -184 0 -172 Z`} fill={f.col} stroke={OL} strokeWidth={4} />
              </g>
            </Pop>
          </g>
        );
      })}
      <g transform={`translate(${x} ${cy})`}>
        <path d="M -110 -30 L 110 -30 L 130 40 L -130 40 Z" fill="#f4ead2" stroke={OL} strokeWidth={5} />
        <ellipse cx={0} cy={0} rx={50} ry={34} fill="#222" stroke={OL} strokeWidth={4} />
        <ellipse cx={-14} cy={-10} rx={14} ry={8} fill="#555" />
      </g>
      {truth > 0 && (
        <g transform={`translate(${x} 160) scale(${truth})`}>
          <Tag x={0} y={0} text="«Это — Правдивый. Мы согласны»" size={40} color="#fff4d0" />
        </g>
      )}
      <PageTag x={x} y={235} text="стр. 71–73" k={ramp(t, at(c, 1.8), 0.5)} />
      {lift > 0.9 && (
        <g opacity={clamp01((lift - 0.9) * 10)}>
          <Tag x={x} y={330} text="честь — всем племенам" size={34} color={C.gold} />
        </g>
      )}
    </g>
  );
};

export { interpolate };
