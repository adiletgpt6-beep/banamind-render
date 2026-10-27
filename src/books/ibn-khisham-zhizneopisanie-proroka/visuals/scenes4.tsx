// Главы 6–8: Бадр в числах, ожерелье Зайнаб, схема Ухуда, ров, верблюдица и тень слона,
// дерево клятвы, рост общины, ночные костры, очищение Каабы. Людей в кадре нет.
import React from "react";
import { C, HEAVY, SERIF } from "../theme";
import { Camel, Dunes, Fire, House, Kaaba, Mountains, OL, Sky, Tent, Tree } from "./draw";
import { Icon } from "./icons";
import { Panel, Pop, Tag, Txt, at, camera, clamp01, contentX, pop, ramp, wob, type VisualProps } from "./kit";
import { PageTag } from "./scenes1";

// ─────────────── инфографика чисел (точки) ───────────────
type Group = { n: number; label: string; color: string; at: number };
export const Numbers: React.FC<VisualProps<{ title: string; page?: string; groups: Group[]; extra?: { text: string; at: number }[] }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const title = pop(t, 0.2);
  const win = ramp(t, at(c, 4.6), 1);
  return (
    <g>
      <g transform={`translate(${x} 150) scale(${title})`}>
        <Txt x={0} y={0} size={64} weight={900} family={HEAVY} color={C.ink}>
          {p.title}
        </Txt>
        {p.page && <PageTag x={0} y={52} text={p.page} />}
      </g>
      {p.groups.map((g, gi) => {
        const k = ramp(t, at(c, g.at), 1.6);
        const cols = gi === 0 ? 20 : 38;
        const per = gi === 0 ? 1 : 1;
        const dots = Math.round(g.n / per);
        const bx = gi === 0 ? x - 520 : x - 80;
        const size = gi === 0 ? 18 : 14;
        const shown = Math.floor(dots * k);
        return (
          <g key={gi}>
            {Array.from({ length: shown }).map((_, i) => (
              <circle key={i} cx={bx + (i % cols) * size} cy={300 + Math.floor(i / cols) * size} r={size * 0.36} fill={g.color} />
            ))}
            {k > 0 && (
              <g transform={`translate(${bx + ((cols - 1) * size) / 2} ${300 + Math.ceil(dots / cols) * size + 60})`} opacity={clamp01(k * 2)}>
                <Txt x={0} y={0} size={60} weight={900} family={HEAVY} color={g.color}>
                  {gi === 0 ? String(Math.round(g.n * k)) : `≈${Math.round(g.n * k)}`}
                </Txt>
                <Txt x={0} y={44} size={26} weight={800} color={C.inkSoft}>
                  {g.label}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
      {(p.extra ?? []).map((e, i) => (
        <Pop key={i} t={t} at={at(c, e.at)} x={x - 300 + i * 600} y={880 - 30}>
          <Tag x={0} y={0} text={e.text} size={30} color={C.goldSoft} />
        </Pop>
      ))}
      {win > 0 && (
        <g opacity={win}>
          <Tag x={x} y={250} text="17 рамадана — победа" size={36} color="#d9f0c8" />
        </g>
      )}
    </g>
  );
};

// ─────────────── ожерелье Хадиджи ───────────────
export const Necklace: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const k = pop(t, at(c, 0.5));
  const free = ramp(t, at(c, 1.4), 1);
  const honest = ramp(t, at(c, 2), 1.2);
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2b2238" opacity={0.75} />
      <g transform={`translate(${x} ${470}) scale(${k}) rotate(${wob(t, 2, 2)})`}>
        <circle r={300} fill="#ffe8a0" opacity={0.12 + 0.08 * Math.sin(t * 2)} />
        <path d="M -230 -120 Q 0 230 230 -120" fill="none" stroke="#c9a24a" strokeWidth={6} />
        {Array.from({ length: 15 }).map((_, i) => {
          const u = i / 14;
          const px = -230 + u * 460;
          const py = -120 + 4 * (u - u * u) * 230 * 0.86;
          return <circle key={i} cx={px} cy={py} r={i === 7 ? 34 : 18} fill={i === 7 ? "#c8643b" : i % 2 ? "#fff4d0" : "#7fd0c8"} stroke={OL} strokeWidth={4} />;
        })}
      </g>
      <Pop t={t} at={0.4} x={x} y={150}>
        <Tag x={0} y={0} text="ожерелье, подаренное Хадиджей" size={36} color="#fff4d0" />
      </Pop>
      {free > 0 && (
        <g opacity={free * (1 - honest)}>
          <Tag x={x} y={820} text="пленника отпустили, вещи вернули" size={34} color={C.white} />
        </g>
      )}
      {honest > 0 && (
        <g opacity={honest}>
          <Tag x={x} y={820} text="«Плохо начать моё мусульманство с того, что я нарушу свою честность»" size={28} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x} y={225} text="стр. 310, 313–314" dark k={ramp(t, 0.6, 0.5)} />
    </g>
  );
};

// ─────────────── схема Ухуда (фишки, без людей) ───────────────
export const Uhud: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const archers = pop(t, at(c, 1));
  const leave = ramp(t, at(c, 2.2), 1.2);
  const flank = ramp(t, at(c, 2.6), 1.8);
  const sorrow = ramp(t, at(c, 3), 1);
  const verse = pop(t, at(c, 5));
  const ox = x - 40;
  return (
    <g>
      <g opacity={1 - sorrow * 0.35}>
        <rect x={0} y={0} width={1920} height={1080} fill="#efe1c8" />
        {/* гора Ухуд */}
        <path d={`M ${ox - 620} 330 L ${ox - 380} 140 L ${ox - 120} 220 L ${ox + 160} 120 L ${ox + 460} 240 L ${ox + 640} 330 Z`} fill="#a9693f" stroke={OL} strokeWidth={5} />
        <Txt x={ox - 50} y={110} size={40} weight={900} color={C.ink}>
          гора Ухуд
        </Txt>
        {/* холм лучников */}
        <ellipse cx={ox - 330} cy={520} rx={150} ry={70} fill="#c9935a" stroke={OL} strokeWidth={4} />
        {archers > 0 &&
          Array.from({ length: 10 }).map((_, i) => {
            const leaving = clamp01(leave * 1.4 - i * 0.04);
            const px = ox - 400 + (i % 5) * 34 + leaving * (300 + i * 20);
            const py = 505 + Math.floor(i / 5) * 30 + leaving * 160;
            return (
              <g key={i} transform={`translate(${px} ${py}) scale(${archers})`}>
                <path d="M 0 -26 L 0 0" stroke={OL} strokeWidth={3} />
                <path d="M 0 -26 L 18 -20 L 0 -14 Z" fill={C.green} />
              </g>
            );
          })}
        {/* мусульмане — зелёные фишки, курайшиты — терракотовые */}
        {Array.from({ length: 14 }).map((_, i) => (
          <circle key={i} cx={ox - 140 + (i % 7) * 46} cy={560 + Math.floor(i / 7) * 46} r={17} fill={C.green} stroke={OL} strokeWidth={3} />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={ox - 160 + (i % 9) * 46 - (1 - leave) * 0} cy={760 + Math.floor(i / 9) * 46 + leave * 40} r={17} fill={C.terracotta} stroke={OL} strokeWidth={3} />
        ))}
        {/* конница обходит с тыла */}
        {flank > 0 && (
          <g>
            <path d={`M ${ox + 380} 760 Q ${ox + 520} 420 ${ox - 60} 470`} fill="none" stroke={C.red} strokeWidth={12} strokeDasharray="900" strokeDashoffset={900 * (1 - flank)} strokeLinecap="round" />
            <path d={`M ${ox - 60} 470 l 40 -24 l -6 44 z`} fill={C.red} opacity={flank > 0.95 ? 1 : 0} />
            <Tag x={ox + 520} y={360} text="конница — с тыла" size={30} color="#ffd0c2" />
          </g>
        )}
      </g>
      <Pop t={t} at={at(c, 1)} x={ox - 330} y={430}>
        <Tag x={0} y={0} text="50 лучников: стоять на месте" size={28} color={C.white} />
      </Pop>
      {sorrow > 0 && verse <= 0 && (
        <g opacity={sorrow}>
          <Tag x={x + 420} y={200} text="день большого несчастья" size={34} color="#e6dcff" />
        </g>
      )}
      {verse > 0 && (
        <g transform={`translate(${x + 120} 200) scale(${verse})`}>
          <Tag x={0} y={0} text="«…прости им… Советуйся с ними о делах» — стр. 367" size={30} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x + 520} y={150} text="стр. 335–367" k={ramp(t, 0.6, 0.5)} />
    </g>
  );
};

// ─────────────── ров вокруг Медины ───────────────
export const Trench: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const army = ramp(t, at(c, 0.3), 1.5);
  const dig = ramp(t, at(c, 1), 3);
  const dates = pop(t, at(c, 2));
  const wind = ramp(t, at(c, 4), 1.5);
  const cy = 600;
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#e9dcc0" />
      {/* Медина: дома и пальмы */}
      <g transform={`translate(${x - 40} ${cy})`}>
        <circle r={210} fill="#d8c79c" />
        {Array.from({ length: 9 }).map((_, i) => (
          <House key={i} x={-150 + (i % 3) * 110} y={-60 + Math.floor(i / 3) * 80} w={70} h={50} color="#e7c08a" door={false} />
        ))}
        <Txt x={0} y={-230} size={38} weight={900} color={C.ink}>
          Медина
        </Txt>
      </g>
      {/* ров — дуга с севера */}
      <path d={`M ${x - 380} ${cy + 80} A 340 340 0 0 1 ${x + 300} ${cy + 80}`} fill="none" stroke="#6b4428" strokeWidth={34} strokeDasharray="1300" strokeDashoffset={1300 * (1 - dig)} strokeLinecap="round" />
      <path d={`M ${x - 380} ${cy + 80} A 340 340 0 0 1 ${x + 300} ${cy + 80}`} fill="none" stroke="#3b2a1a" strokeWidth={10} strokeDasharray="1300" strokeDashoffset={1300 * (1 - dig)} strokeLinecap="round" />
      {/* войско союзников — шатры за рвом */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = Math.PI * (1.08 + i * 0.07);
        const r = 560 - (1 - army) * 200;
        const blow = wind * (i % 2 ? 1 : 0.7);
        return (
          <g key={i} transform={`translate(${x - 40 + Math.cos(a) * r + blow * 400} ${cy + Math.sin(a) * r * 0.75 - blow * 120}) rotate(${blow * 60})`} opacity={army * (1 - wind)}>
            <Tent x={0} y={0} s={0.6} color={i % 2 ? "#e9b9a0" : "#f2e6cf"} />
          </g>
        );
      })}
      {wind > 0 &&
        Array.from({ length: 8 }).map((_, i) => {
          const xx = ((t * 700 + i * 260) % 2200) - 140;
          return <path key={i} d={`M ${xx} ${180 + i * 90} q 60 -30 120 0 t 120 0`} stroke="#9cb3c9" strokeWidth={8} fill="none" opacity={0.7 * wind} strokeLinecap="round" />;
        })}
      <Pop t={t} at={at(c, 1)} x={x - 40} y={120}>
        <Tag x={0} y={0} text="ров — совет Сальмана (рассказывают)" size={32} color={C.white} />
      </Pop>
      {dates > 0 && (
        <g transform={`translate(${x + 430} ${cy - 40}) scale(${dates})`}>
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse key={i} cx={(i % 3) * 30 - 30} cy={Math.floor(i / 3) * 22 - 22} rx={13} ry={9} fill="#7a3d1f" stroke={OL} strokeWidth={2} />
          ))}
          <Tag x={0} y={70} text="финики — на всех" size={28} color={C.goldSoft} />
        </g>
      )}
      <Pop t={t} at={at(c, 3)} x={x - 40} y={190}>
        <Tag x={0} y={0} text="«Арабы не знали такой ловушки!»" size={32} color="#fff4d0" />
      </Pop>
      <PageTag x={x - 460} y={120} text="стр. 385–397" k={ramp(t, at(c, 1.1), 0.5)} />
    </g>
  );
};

// ─────────────── верблюдица опускается на колени; тень слона ───────────────
export const Kneel: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const walk = ramp(t, 0, at(c, 2));
  const kneel = ramp(t, at(c, 2), 1.2);
  const ghost = ramp(t, at(c, 2.4), 1.2);
  const ihram = pop(t, at(c, 1));
  return (
    <g>
      <Sky mode="day" t={t} id="hud" sunX={x - 480} sunY={220} />
      <Mountains y={700} color="#9a7a5a" seed={14} />
      <rect x={0} y={700} width={1920} height={380} fill={C.sand} />
      <Dunes t={t} y={880} pan={2 * (1 - kneel)} />
      {ghost > 0 && (
        <g opacity={0.28 * ghost} transform={`translate(${x + 380} 700) scale(0.9)`}>
          <ellipse cx={0} cy={-200} rx={180} ry={110} fill="#6b7480" />
          <ellipse cx={170} cy={-250} rx={80} ry={75} fill="#6b7480" />
          <path d="M 230 -230 Q 280 -140 260 -40" stroke="#6b7480" strokeWidth={34} fill="none" strokeLinecap="round" />
          {[-100, -40, 60, 120].map((lx, i) => (
            <rect key={i} x={lx - 26} y={-110 + (i < 2 ? 60 : 30)} width={52} height={110 - (i < 2 ? 60 : 30)} rx={18} fill="#6b7480" />
          ))}
          <Txt x={60} y={60} size={34} weight={800} color="#4a5874">
            год слона
          </Txt>
        </g>
      )}
      <g transform={`translate(${x - 260 + walk * 120} ${860}) scale(1.35)`}>
        <g transform={`translate(0 ${kneel * 45})`}>
          {kneel < 0.7 &&
            [-50, -30, 40, 60].map((lx, i) => <path key={i} d={`M ${lx} -70 L ${lx + Math.sin(t * 6 * (1 - kneel) + i) * 12 * (1 - kneel)} -4`} stroke={i % 2 ? "#a77c48" : OL} strokeWidth={11} strokeLinecap="round" />)}
          <path d="M -80 -70 Q -90 -110 -50 -118 Q -30 -170 0 -120 Q 30 -160 60 -118 Q 90 -110 85 -70 Z" fill="#d8b07a" stroke={OL} strokeWidth={4} />
          <path d={`M 80 -96 Q 110 -110 112 ${-160 + kneel * 40} Q 114 ${-190 + kneel * 40} 138 ${-186 + kneel * 40} Q 156 ${-184 + kneel * 40} 150 ${-168 + kneel * 40} Q 136 ${-160 + kneel * 40} 134 ${-140 + kneel * 40} Q 128 -100 92 -74 Z`} fill="#d8b07a" stroke={OL} strokeWidth={4} />
          <rect x={-50} y={-160} width={100} height={36} rx={10} fill="#f2f2ec" stroke={OL} strokeWidth={4} />
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={ihram}>
          <Camel x={x - 640 - i * 150 + walk * 120} y={860} s={0.45} walk={t * 6 * (1 - kneel) + i} />
        </g>
      ))}
      {ihram > 0 && (
        <g transform={`translate(${x} 150) scale(${ihram})`}>
          <Tag x={0} y={0} text="малое паломничество · жертвенные животные" size={32} color="#fff4d0" />
        </g>
      )}
      <Pop t={t} at={at(c, 2.4)} x={x} y={250}>
        <Tag x={0} y={0} text="«Её удерживает тот, кто не пустил слона в Мекку»" size={30} color={C.goldSoft} />
      </Pop>
      <PageTag x={x} y={325} text="стр. 431–432" k={ramp(t, at(c, 2.6), 0.5)} />
    </g>
  );
};

// ─────────────── дерево клятвы ───────────────
export const PledgeTree: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const pledge = ramp(t, at(c, 1), 1.4);
  const urwa = pop(t, at(c, 3));
  const freed = pop(t, at(c, 4));
  return (
    <g>
      <g transform={camera(t, c.dur, x, 600, 1.0, 1.06)}>
        <Sky mode="day" t={t} id="tree" sunX={x + 520} sunY={200} />
        <Mountains y={720} color="#9a7a5a" seed={15} scale={0.6} />
        <rect x={0} y={720} width={1920} height={360} fill="#d9c08a" />
        <Tree x={x} y={900} s={1.5} t={t} glow={pledge} />
        {pledge > 0 &&
          Array.from({ length: 40 }).map((_, i) => {
            const a = (i / 40) * Math.PI * 2;
            const r = 330 + (i % 3) * 30;
            return <circle key={i} cx={x + Math.cos(a) * r} cy={880 + Math.sin(a) * r * 0.18} r={7} fill="#fff1b0" opacity={clamp01(pledge * 40 - i) * (0.6 + 0.4 * Math.sin(t * 3 + i))} />;
          })}
      </g>
      <Pop t={t} at={0.4} x={x} y={150}>
        <Tag x={0} y={0} text="слух: Осман убит" size={34} color="#ffd0c2" />
      </Pop>
      {pledge > 0 && (
        <g opacity={pledge}>
          <Tag x={x} y={235} text="клятва под деревом: «не убежим»" size={34} color="#fff4d0" />
        </g>
      )}
      {urwa > 0 && (
        <g transform={`translate(${x} 320) scale(${urwa})`}>
          <Tag x={0} y={0} text="Урва: «нигде не видел такого почёта»" size={30} color={C.white} />
        </g>
      )}
      {freed > 0 && (
        <g transform={`translate(${x} 395) scale(${freed})`}>
          <Tag x={0} y={0} text="стрелявших по лагерю — простили и отпустили" size={28} color={C.goldSoft} />
        </g>
      )}
      <PageTag x={x} y={1080 - 220} text="стр. 434–437" k={0} />
    </g>
  );
};

// ─────────────── рост: 1400 → 10 000 ───────────────
export const Growth: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const fath = pop(t, at(c, 0.3));
  const a = ramp(t, at(c, 2), 1.2);
  const b = ramp(t, at(c, 2.5), 2.2);
  const cols = 60;
  const dot = 11;
  return (
    <g>
      {fath > 0 && (
        <g transform={`translate(${x} 150) scale(${fath})`}>
          <Txt x={0} y={0} size={46} weight={700} family={SERIF} color={C.ink}>
            «Мы помогли тебе победить верной победой»
          </Txt>
          <PageTag x={0} y={50} text="сура «аль-Фатх» · стр. 440–442" />
        </g>
      )}
      <g transform={`translate(${x - 520} 300)`}>
        <Txt x={45} y={-10} size={48} weight={900} color={C.green}>
          {`${Math.round(1400 * a).toLocaleString("ru-RU")}`}
        </Txt>
        <Txt x={45} y={28} size={24} weight={800} color={C.inkSoft}>
          аль-Худайбия
        </Txt>
        {Array.from({ length: Math.round(140 * a) }).map((_, i) => (
          <circle key={i} cx={(i % 10) * dot} cy={80 + Math.floor(i / 10) * dot} r={3.2} fill={C.green} />
        ))}
      </g>
      <g transform={`translate(${x - 300} 300)`}>
        <Txt x={(cols * dot) / 2} y={-10} size={56} weight={900} color={C.terracotta}>
          {b > 0 ? `${Math.round(10000 * b).toLocaleString("ru-RU")}` : ""}
        </Txt>
        <Txt x={(cols * dot) / 2} y={28} size={24} weight={800} color={C.inkSoft}>
          {b > 0 ? "через два года — у Мекки" : ""}
        </Txt>
        {Array.from({ length: Math.round(1000 * b) }).map((_, i) => (
          <circle key={i} cx={(i % cols) * dot} cy={80 + Math.floor(i / cols) * dot} r={3.2} fill={i % 7 ? C.terracotta : C.gold} />
        ))}
      </g>
      <Txt x={x} y={560 + 11 * 17} size={26} weight={800} color={C.inkSoft} opacity={b}>
        одна точка — десять человек
      </Txt>
    </g>
  );
};

// ─────────────── ночные костры у Мекки и три безопасных места ───────────────
export const Fires: React.FC<VisualProps<{ safe: { icon: string; text: string }[] }>> = (c) => {
  const { t, p } = c;
  const x = contentX(p.host);
  const letter = ramp(t, at(c, 1), 1);
  const fires = ramp(t, at(c, 2), 2.5);
  const safe = at(c, 3);
  return (
    <g>
      <Sky mode="night" t={t} id="fires" sunX={x + 520} sunY={170} />
      <Mountains y={640} color="#262a48" seed={16} />
      <rect x={0} y={640} width={1920} height={440} fill="#1d2140" />
      <g transform={`translate(${x} 640)`}>
        <Kaaba x={0} y={10} s={0.35} glow={0.5} />
        {Array.from({ length: 9 }).map((_, i) => (
          <House key={i} x={-260 + i * 65} y={10 + (i % 2) * 6} w={50} h={36 + (i % 3) * 10} color="#4a4f7a" lit door={false} />
        ))}
      </g>
      {Array.from({ length: 70 }).map((_, i) => {
        const k = clamp01(fires * 70 - i);
        if (k <= 0) return null;
        const fx = 80 + ((i * 263) % 1760);
        const fy = 760 + ((i * 97) % 280);
        return <Fire key={i} x={fx} y={fy} s={0.35 + ((i * 7) % 5) * 0.06} t={t} seed={i} />;
      })}
      {letter > 0 && fires <= 0.1 && (
        <g opacity={letter}>
          <Tag x={x} y={160} text="письмо Хатиба перехвачено — Хатиб прощён" size={30} color={C.white} />
        </g>
      )}
      {fires > 0.1 && (
        <Pop t={t} at={at(c, 2.2)} x={x} y={160}>
          <Tag x={0} y={0} text="10 000 · ночные костры" size={34} color="#fff4d0" />
        </Pop>
      )}
      {p.safe.map((s, i) => {
        const k = pop(t, safe + i * 0.9);
        return (
          <g key={i} transform={`translate(${x - 340 + i * 340} 380) scale(${k})`}>
            <Panel x={-140} y={-120} w={280} h={250} fill="#fffaf0" stroke={C.gold} />
            <g transform="translate(0 -40)">
              <Icon name={s.icon} r={52} t={t} color={C.tealSoft} />
            </g>
            <Txt x={0} y={60} size={28} weight={900}>
              {s.text}
            </Txt>
            <Txt x={0} y={100} size={22} weight={800} color={C.green}>
              в безопасности
            </Txt>
          </g>
        );
      })}
      <PageTag x={x} y={235} text="стр. 478–487" dark k={ramp(t, 0.6, 0.5)} />
    </g>
  );
};

// ─────────────── Кааба: идолы падают, ключ возвращён ───────────────
export const KaabaIdols: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = contentX(c.p.host);
  const fall = ramp(t, at(c, 0.4), 2.6);
  const key = pop(t, at(c, 1));
  const adam = pop(t, at(c, 2));
  const idols = Array.from({ length: 14 }).map((_, i) => ({ a: (i / 14) * Math.PI * 2, h: 70 + ((i * 31) % 50) }));
  return (
    <g>
      <Sky mode="day" t={t} id="idols" sunX={x - 520} sunY={200} />
      <rect x={0} y={640} width={1920} height={440} fill="#efe1c3" />
      <ellipse cx={x} cy={800} rx={560} ry={150} fill="#e2d1ad" stroke="#c9b48a" strokeWidth={4} />
      <Kaaba x={x} y={820} s={1.15} glow={0.3 + fall * 0.5} />
      {idols.map((d, i) => {
        const k = clamp01(fall * 1.6 - (i % 7) * 0.12);
        const ix = x + Math.cos(d.a) * 470;
        const iy = 800 + Math.sin(d.a) * 120;
        const front = Math.sin(d.a) > 0;
        return (
          <g key={i} transform={`translate(${ix} ${iy}) rotate(${k * (Math.cos(d.a) > 0 ? 90 : -90)})`} opacity={front || k < 1 ? 1 : 0.8}>
            <rect x={-22} y={-d.h} width={44} height={d.h} rx={6} fill="#8c7a66" stroke={OL} strokeWidth={4} />
            <rect x={-28} y={-d.h - 10} width={56} height={14} rx={4} fill="#6f6152" stroke={OL} strokeWidth={3} />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.5)} x={x} y={150}>
        <Tag x={0} y={0} text="«Пришла правда, и неправда исчезла»" size={38} color="#fff4d0" />
      </Pop>
      {key > 0 && (
        <g transform={`translate(${x + 430} 380) scale(${key}) rotate(${wob(t, 3, 4)})`}>
          <Icon name="key" r={70} t={t} color={C.goldSoft} />
          <Tag x={0} y={115} text="ключ — Осману ибн Тальхе" size={28} color={C.white} />
        </g>
      )}
      {adam > 0 && (
        <g transform={`translate(${x - 400} 380) scale(${adam})`}>
          <Panel x={-210} y={-90} w={420} h={170} fill="#fffaf0" stroke={C.gold} />
          <Txt x={0} y={-20} size={30} weight={900}>
            все люди — от Адама,
          </Txt>
          <Txt x={0} y={26} size={30} weight={900}>
            а Адам создан из глины
          </Txt>
        </g>
      )}
      <PageTag x={x} y={225} text="стр. 493–497" k={ramp(t, 0.8, 0.5)} />
    </g>
  );
};

export { Dunes };
