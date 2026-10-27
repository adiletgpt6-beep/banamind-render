// Сцены после «расчёта», люди, дуэль с Порфирием, Соня, зеркала, Мармеладовы.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { BookObj, Candle, Coin, House, Label, Note, OL, Person, type FigMood, type Who } from "./draw";
import { Appear, area, at, clamp01, Drift, ramp, Txt, wob, type VisualProps } from "./kit";

type P = { host?: string; round?: number; who?: string; traits?: string[]; key?: string; stage?: number };

// ── Лихорадка и тайник ──
export const Fever: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const hole = ramp(t, at(ctx, 1), 0.6);
  const stone = ramp(t, at(ctx, 2), 0.8);
  const shake = Math.sin(t * 7) * 3;
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* каморка: косой потолок, жёлтые обои */}
      <path d={`M ${a.x0 + 40} 860 L ${a.x0 + 40} 260 L ${a.x0 + 360} 160 L ${a.x1 - 40} 160 L ${a.x1 - 40} 860 Z`} fill={C.wall} stroke={OL} strokeWidth={5} opacity={1 - stone} />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={a.x0 + 140 + i * 110} cy={330 + (i % 3) * 120} r={14} fill="#d8b766" opacity={(1 - stone) * 0.8} />
      ))}
      {/* пульс-волна лихорадки */}
      <path
        d={Array.from({ length: 60 }).map((_, i) => `${i ? "L" : "M"} ${a.x0 + 60 + i * ((a.x1 - a.x0 - 120) / 59)} ${220 + Math.sin(i * 0.9 + t * 6) * (i % 12 === 0 ? 40 : 8)}`).join(" ")}
        stroke={C.rose}
        strokeWidth={6}
        fill="none"
        opacity={0.8 * (1 - stone)}
      />
      <g opacity={1 - stone}>
        <rect x={a.x0 + 120} y={700} width={520} height={90} rx={20} fill="#8a6a6a" stroke={OL} strokeWidth={4} />
        <Person who="rask" x={a.x0 + 760 + shake} y={860} s={0.62} t={t} mood={hole > 0.5 ? "shock" : "tense"} pose={hole > 0.3 ? "reach" : "stand"} />
        {hole > 0 && (
          <g opacity={hole}>
            <path d={`M ${a.x1 - 340} 520 l 120 -20 l 20 110 l -130 10 Z`} fill="#3a2a2a" stroke={OL} strokeWidth={4} />
            <Label x={a.x1 - 280} y={440} text="«Разве так прячут?»" size={32} serif bg={C.paper} />
          </g>
        )}
      </g>
      {stone > 0 && (
        <g opacity={stone}>
          <rect x={a.x0 + 40} y={160} width={a.x1 - a.x0 - 80} height={700} rx={10} fill="#b9b0a0" stroke={OL} strokeWidth={4} />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={a.x0 + 60 + i * 190} y={180} width={170} height={330} fill="#a89c88" stroke={OL} strokeWidth={3} />
          ))}
          <path d={`M ${a.cx - 200} 820 Q ${a.cx - 210} 680 ${a.cx - 40} 660 Q ${a.cx + 190} 650 ${a.cx + 210} 820 Z`} fill="#8b8a92" stroke={OL} strokeWidth={5} />
          {/* кошелёк — нераскрытый */}
          <g transform={`translate(${a.cx + 330} 640) rotate(${wob(t, 4, 3)})`}>
            <path d="M -60 -30 Q 0 -70 60 -30 L 60 40 Q 0 60 -60 40 Z" fill="#8a5a3a" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={110} size={28} color={C.ink}>
              не открыт
            </Txt>
          </g>
          <Person who="rask" x={a.x0 + 240} y={860} s={0.6} t={t} mood="shock" />
        </g>
      )}
    </Drift>
  );
};

// ── Предметы как груз; колокольчик ──
export const Objects: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const items = ["петля", "носок", "серёжки", "кошелёк"];
  const bell = ramp(t, at(ctx, 1), 0.6);
  const circle = ramp(t, at(ctx, 2), 0.8);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {items.map((it, i) => {
        const ang = t * 0.35 + (i * Math.PI) / 2;
        const r = 330 - circle * 90;
        const x = a.cx + Math.cos(ang) * r * 1.4;
        const y = 480 + Math.sin(ang) * r * 0.75;
        return (
          <g key={it} opacity={ramp(t, at(ctx, 0) + i * 0.25)}>
            <Label x={x} y={y} text={it} size={34} bg={i % 2 ? C.fog : C.paper} />
          </g>
        );
      })}
      <Person who="rask" x={a.cx} y={760} s={0.6} t={t} mood={bell > 0.5 ? "tense" : "sad"} />
      {bell > 0 && (
        <g opacity={bell} transform={`translate(${a.cx + 420} 250) rotate(${Math.sin(t * 12) * 18 * bell})`}>
          <path d="M 0 -60 L 0 -30 M -50 40 Q -50 -30 0 -30 Q 50 -30 50 40 Z" fill={C.gold} stroke={OL} strokeWidth={5} />
          <circle cx={0} cy={52} r={12} fill={C.goldDeep} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={140} size={28} color={C.paper}>
            тот же колокольчик
          </Txt>
        </g>
      )}
      {circle > 0 && <ellipse cx={a.cx} cy={480} rx={560} ry={300} fill="none" stroke={C.gold} strokeWidth={6} strokeDasharray="20 16" strokeDashoffset={-t * 60} opacity={circle} />}
    </Drift>
  );
};

// ── Дуэль: Заметов / Порфирий (раунды) ──
export const Duel: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const round = p.round ?? 1;
  const opp: Who = round === 0 ? "zametov" : "porfiry";
  const tension = 0.5 + 0.5 * Math.sin(t * (1 + round * 0.4));
  const lean = ramp(t, at(ctx, 1), 1);
  const raskMood: FigMood = round === 3 ? (lean > 0.5 ? "shock" : "tense") : round === 4 ? "angry" : "tense";
  const oppMood: FigMood = round === 0 ? "neutral" : round === 3 ? "sad" : "smile";
  const labels: Record<number, string[]> = {
    0: ["«не верю!»"],
    1: ["«поджидаю»", "«Знает!»", "мираж?"],
    2: ["необыкновенный?", "«перешагнул бы»", "Лазарь?"],
    3: ["«книжные мечты»", "«вы убили»", "«Станьте солнцем»"],
    4: ["«Убивец!»", "Николай: «Я убивец!»", "«поборемся»"],
  };
  const ls = labels[round] ?? [];
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* у каждого раунда свой фон: трактир, кабинет, «шахматы», каморка, улица */}
      <rect x={a.x0 + 40} y={160} width={a.x1 - a.x0 - 80} height={700} rx={24} fill={["#8a6e5a", "#6a7aa6", "#5d6a96", "#c9a87a", "#7d86a8"][round] ?? "#6a7aa6"} opacity={0.7} />
      {round === 0 && (
        <g>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={a.x0 + 120 + i * 330} y={200} width={240} height={180} rx={10} fill="#e9c97f" opacity={0.55 + 0.1 * Math.sin(t + i)} stroke={OL} strokeWidth={3} />
          ))}
          <Label x={a.x1 - 260} y={210} text="трактир" size={26} bg={C.fog} />
        </g>
      )}
      {round === 1 && (
        <g>
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={a.x0 + 80} y={230 + r * 110} width={420} height={10} fill="#4a3a30" />
              {Array.from({ length: 10 }).map((_, i) => (
                <rect key={i} x={a.x0 + 90 + i * 40} y={230 + r * 110 - 70 - ((i * 13 + r * 7) % 20)} width={32} height={70 + ((i * 13 + r * 7) % 20)} fill={["#7a2f2f", "#2f5a4a", "#3d4b72", "#8a6a3a"][(i + r) % 4]} opacity={0.85} />
              ))}
            </g>
          ))}
        </g>
      )}
      {round === 2 && (
        <g transform={`translate(${a.cx} 610) scale(1 0.5)`}>
          {Array.from({ length: 36 }).map((_, i) => (
            <rect key={i} x={-180 + (i % 6) * 60} y={-180 + Math.floor(i / 6) * 60} width={60} height={60} fill={(i + Math.floor(i / 6)) % 2 ? "#f1ead6" : "#3a3550"} />
          ))}
        </g>
      )}
      {round === 3 && (
        <g>
          <path d={`M ${a.x0 + 40} 300 L ${a.x0 + 400} 160 L ${a.x1 - 40} 160`} stroke={OL} strokeWidth={4} fill="none" />
          <rect x={a.cx - 110} y={190} width={220} height={170} rx={8} fill="#ffe9b8" stroke={OL} strokeWidth={4} />
        </g>
      )}
      {round === 4 && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <House key={i} x={a.x0 + 60 + i * 230} y={620} w={210} h={300 + (i % 2) * 90} color="#8f93b5" t={t} seed={i + 30} />
          ))}
        </g>
      )}
      <g opacity={0.2}>
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={a.cx - 260 + i * 120} y={200} width={18} height={420} fill="#1f2440" transform={`skewX(${-14})`} />
        ))}
      </g>
      {round === 3 && <rect x={a.cx - 140} y={170} width={280} height={210} rx={16} fill={C.dawn} opacity={0.25 + 0.35 * lean} />}
      <rect x={a.cx - 320} y={700} width={640} height={36} rx={10} fill="#6b5240" stroke={OL} strokeWidth={4} />
      <Person who="rask" x={a.cx - 300 - lean * 20} y={860} s={0.68} t={t} mood={raskMood} pose={round === 4 ? "stand" : "stand"} />
      <Person who={opp} x={a.cx + 300} y={860} s={0.68} t={t} mood={oppMood} flip pose={round === 2 ? "point" : round === 3 ? "hold" : "stand"} look={-0.6} />
      {round === 4 && ramp(t, at(ctx, 1)) > 0 && <Person who="nikolay" x={a.cx + 40} y={880} s={0.55} t={t} pose="kneel" mood="sad" opacity={ramp(t, at(ctx, 1))} />}
      {/* «нить» напряжения между ними */}
      <path d={`M ${a.cx - 230} 520 Q ${a.cx} ${520 - 60 * tension} ${a.cx + 230} 520`} stroke={C.gold} strokeWidth={4} strokeDasharray="10 10" fill="none" opacity={0.7} />
      {ls.map((l, i) => (
        <Appear key={l} t={t} at={at(ctx, i === 0 ? 0.4 : i)} x={a.cx + (i - (ls.length - 1) / 2) * 340} y={300 + (i % 2) * 70}>
          <Label x={0} y={0} text={l} size={30} serif bg={i === 2 ? C.gold : C.paper} />
        </Appear>
      ))}
    </Drift>
  );
};

// ── Портрет персонажа с чертами ──
const NAMES: Record<string, string> = { razum: "Разумихин", dunya: "Дуня", sonya: "Соня Мармеладова" };
export const Portrait: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const who = (p.who ?? "razum") as Who;
  const traits = p.traits ?? [];
  const keyK = p.key ? ramp(t, at(ctx, 1), 0.6) : 0;
  const mood: FigMood = who === "dunya" ? (keyK > 0 ? "angry" : "neutral") : who === "sonya" ? "kind" : "smile";
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* рама портрета */}
      <rect x={a.cx - 520} y={170} width={480} height={640} rx={26} fill={C.paper} stroke={C.goldDeep} strokeWidth={10} />
      <rect x={a.cx - 500} y={190} width={440} height={600} rx={18} fill={who === "sonya" ? "#cfe1d2" : who === "dunya" ? "#d6dcef" : "#ead7c2"} />
      {who === "sonya" && <circle cx={a.cx - 280} cy={360} r={180 + Math.sin(t) * 6} fill={C.gold} opacity={0.18} />}
      <Person who={who} x={a.cx - 280} y={760} s={1.0} t={t} mood={mood} pose={who === "razum" ? "hold" : "stand"} />
      <Txt x={a.cx - 280} y={880} size={44} color={C.paper}>
        {NAMES[who] ?? ""}
      </Txt>
      {traits.map((tr, i) => (
        <Appear key={tr} t={t} at={at(ctx, Math.min(i, ctx.beats.length - 1) + 0.2)} x={a.cx + 260} y={300 + i * 150}>
          <Label x={0} y={0} text={tr} size={42} bg={i === 0 ? C.gold : i === 1 ? C.dawn : C.fog} />
        </Appear>
      ))}
      {p.key && keyK > 0 && (
        <g opacity={keyK} transform={`translate(${a.cx + 260} 760) scale(${0.8 + 0.2 * keyK})`}>
          <Label x={0} y={0} text={`«${p.key}»`} size={56} serif bg={C.rose} />
        </g>
      )}
    </Drift>
  );
};

// ── Семья: мать и сестра рядом, но «из-за тысячи верст» / прощание ──
export const Family: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const farewell = p.stage === 1;
  const gap = farewell ? 1 - ramp(t, at(ctx, 1), 1.2) : ramp(t, at(ctx, 0.3), 1.6);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={a.x0 + 40} y={180} width={a.x1 - a.x0 - 80} height={680} rx={24} fill="#e3d6c4" opacity={0.9} />
      {farewell && <BookObj x={a.cx + 330} y={560} s={0.45} open={1} />}
      <Person who="mother" x={a.cx + 100} y={820} s={0.78} t={t} mood={farewell ? (ramp(t, at(ctx, 1)) > 0.5 ? "sad" : "smile") : "sad"} pose={farewell ? "read" : "stand"} flip />
      {!farewell && <Person who="dunya" x={a.cx + 330} y={820} s={0.78} t={t} mood="tense" flip />}
      <Person who="rask" x={a.cx - 260 - gap * 240} y={820} s={0.78} t={t} mood="sad" pose={farewell && ramp(t, at(ctx, 1.5)) > 0.5 ? "bow" : "stand"} />
      {!farewell && gap > 0.2 && (
        <g opacity={gap}>
          <path d={`M ${a.cx - 300} 420 L ${a.cx + 60} 420`} stroke={C.inkSoft} strokeWidth={6} strokeDasharray="6 14" />
          <Label x={a.cx - 120} y={360} text="«из-за тысячи верст»" size={32} serif />
        </g>
      )}
      {farewell && (
        <Appear t={t} at={at(ctx, 1)} x={a.cx - 100} y={300}>
          <Label x={0} y={0} text="«будете ли вы любить меня…»" size={32} serif bg={C.dawn} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Бабочка и свечка ──
export const Moth: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const tight = 1 - 0.6 * ramp(t, at(ctx, 1), dur - at(ctx, 1));
  const ang = t * 2.2;
  const mx = a.cx + Math.cos(ang) * 260 * tight;
  const my = 420 + Math.sin(ang * 1.3) * 140 * tight;
  const flap = Math.sin(t * 30) * 0.5 + 0.5;
  const nature = ramp(t, at(ctx, 2), 0.6);
  const psych = ramp(t, at(ctx, 3), 0.6);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <Candle x={a.cx} y={700} s={2.3} t={t} glow={1.1} />
      <g transform={`translate(${mx} ${my}) rotate(${Math.cos(ang) * 30})`}>
        <ellipse cx={-22} cy={0} rx={26 * (0.4 + 0.6 * flap)} ry={34} fill="#e9e3f4" stroke={OL} strokeWidth={3} />
        <ellipse cx={22} cy={0} rx={26 * (0.4 + 0.6 * flap)} ry={34} fill="#e9e3f4" stroke={OL} strokeWidth={3} />
        <ellipse cx={0} cy={0} rx={6} ry={22} fill={OL} />
      </g>
      <g opacity={nature}>
        {["бледность", "нервы", "обморок"].map((w, i) => (
          <Label key={w} x={a.x0 + 230} y={300 + i * 110} text={w} size={34} bg={C.fog} />
        ))}
      </g>
      <g opacity={psych}>
        <Label x={a.x1 - 260} y={300} text="улики: нет" size={36} bg={C.paper} />
        <Label x={a.x1 - 260} y={410} text="психология: да" size={36} bg={C.gold} />
      </g>
    </Drift>
  );
};

// ── Комната Сони: свеча и книга; чтение о Лазаре ──
export const CandleRoom: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const reading = p.stage === 1;
  const bow = !reading ? ramp(t, at(ctx, 0.5), 1) : 0;
  const light = reading ? ramp(t, at(ctx, 0.5), 2) : 0.3;
  const power = reading ? ramp(t, at(ctx, 2.3), 0.7) : 0;
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* кривая комната: стены под углом */}
      <path d={`M ${a.x0 + 40} 860 L ${a.x0 + 120} 180 L ${a.x1 - 40} 230 L ${a.x1 - 120} 860 Z`} fill="#b7a98f" stroke={OL} strokeWidth={5} />
      <circle cx={a.cx} cy={520} r={260 + 160 * light} fill={C.gold} opacity={0.12 + 0.12 * light} />
      <rect x={a.cx - 160} y={640} width={320} height={30} rx={8} fill="#7a5a3a" stroke={OL} strokeWidth={4} />
      <Candle x={a.cx + 110} y={640} s={0.8} t={t} glow={0.6 + light * 0.6} />
      {reading ? (
        <>
          <Person who="sonya" x={a.cx - 120} y={860} s={0.74} t={t} pose="read" mood="closed" />
          <Person who="rask" x={a.cx + 320} y={860} s={0.74} t={t} mood={power > 0.5 ? "tense" : "sad"} flip />
          <Appear t={t} at={at(ctx, 1)} x={a.cx} y={280}>
            <Label x={0} y={0} text="«за чтением вечной книги»" size={34} serif bg={C.paper} />
          </Appear>
          {power > 0 && (
            <g opacity={power}>
              <Label x={a.cx + 330} y={380} text="…и сразу о «власти»" size={32} bg={C.fog} />
            </g>
          )}
        </>
      ) : (
        <>
          <Person who="sonya" x={a.cx + 220} y={860} s={0.74} t={t} mood={bow > 0.5 ? "shock" : "sad"} flip />
          <Person who="rask" x={a.cx - 200} y={860} s={0.74} t={t} pose={bow > 0.5 ? "kneel" : "stand"} mood="sad" />
          <Appear t={t} at={at(ctx, 1)} x={a.cx} y={280}>
            <Label x={0} y={0} text="«всему страданию человеческому»" size={32} serif bg={C.paper} />
          </Appear>
          <Appear t={t} at={at(ctx, 2)} x={a.cx} y={380}>
            <Label x={0} y={0} text="«Что ж бы я без Бога-то была?»" size={32} serif bg={C.dawn} />
          </Appear>
        </>
      )}
    </Drift>
  );
};

// ── Зеркало: отражения Лужина и Свидригайлова ──
export const Mirror: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const who = (p.who ?? "luzhin") as Who;
  const show = ramp(t, at(ctx, who === "luzhin" ? 1 : 0.2), 1.2);
  const ripple = Math.sin(t * 2) * 4;
  const tags = who === "luzhin" ? ["«возлюби… одного себя»", "выгода", "власть над бедной женой"] : ["«изверг ли я или сам жертва?»", "скука", "своеволие"];
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <g transform={`translate(${a.cx} 500)`}>
        <rect x={-300} y={-360} width={600} height={720} rx={300} fill="#c8a858" stroke={OL} strokeWidth={6} />
        <rect x={-270} y={-330} width={540} height={660} rx={270} fill="#cfd8f0" />
        <rect x={-270} y={-330} width={540} height={660} rx={270} fill="url(#mirrorShine)" opacity={0.6} />
        <defs>
          <linearGradient id="mirrorShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.7} />
            <stop offset="45%" stopColor="#fff" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* отражение: сперва Раскольников, затем другой */}
        <g opacity={1 - show} transform={`translate(${ripple} 0)`}>
          <Person who="rask" x={0} y={300} s={0.82} t={t} mood="tense" />
        </g>
        <g opacity={show} transform={`translate(${-ripple} 0)`}>
          <Person who={who} x={0} y={300} s={0.82} t={t} mood={who === "luzhin" ? "smile" : "closed"} />
        </g>
      </g>
      {tags.map((tg, i) => (
        <Appear key={tg} t={t} at={at(ctx, Math.min(ctx.beats.length - 1, i + 1))} x={i === 0 ? a.cx : a.cx + (a.cx > 960 ? -440 : 440)} y={i === 0 ? 110 : 380 + (i - 1) * 110}>
          <Label x={0} y={0} text={tg} size={30} serif={i === 0} bg={i === 0 ? C.paper : C.fog} />
        </Appear>
      ))}
    </Drift>
  );
};

// ── Подлог со ста рублями ──
export const Banknote: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const accuse = ramp(t, at(ctx, 0.3), 0.6);
  const reveal = ramp(t, at(ctx, 1), 0.8);
  const why = ramp(t, at(ctx, 2), 0.8);
  // купюра летит из руки Лужина в карман Сони (на раскрытии — обратно, пунктиром)
  const fx = a.cx + 260;
  const tx = a.cx - 240;
  const nk = reveal;
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={a.x0 + 40} y={600} width={a.x1 - a.x0 - 80} height={40} rx={10} fill="#7a5a3a" stroke={OL} strokeWidth={4} />
      <Person who="sonya" x={tx} y={860} s={0.7} t={t} mood={reveal > 0.5 ? "sad" : "shock"} />
      <Person who="luzhin" x={fx} y={860} s={0.72} t={t} mood={reveal > 0.5 ? "angry" : "smile"} flip pose={accuse > 0.3 && reveal < 0.5 ? "point" : "stand"} />
      {reveal > 0 && <Person who="crowd" x={a.cx + 10} y={880} s={0.55} t={t} mood="shock" opacity={reveal} />}
      <Note x={interpolate(nk, [0, 1], [tx + 40, fx - 60])} y={interpolate(nk, [0, 1], [640, 470]) - Math.sin(nk * Math.PI) * 120} s={0.6} value="100" rot={wob(t, 2, 6)} />
      {reveal > 0 && <path d={`M ${fx - 80} 520 Q ${a.cx} 330 ${tx + 60} 600`} stroke={C.red} strokeWidth={5} strokeDasharray="14 12" fill="none" opacity={reveal} />}
      <Appear t={t} at={at(ctx, 1)} x={a.cx} y={240}>
        <Label x={0} y={0} text="подложил сам" size={38} bg={C.rose} />
      </Appear>
      {why > 0 && (
        <g opacity={why}>
          <Label x={a.cx} y={340} text="чужая честь → средство" size={34} bg={C.paper} />
        </g>
      )}
    </Drift>
  );
};

// ── Три формы своеволия ──
export const Triptych: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const items: { who: Who; tag: string }[] = [
    { who: "luzhin", tag: "выгода" },
    { who: "svid", tag: "прихоть" },
    { who: "rask", tag: "идея" },
  ];
  const same = ramp(t, at(ctx, 1), 0.8);
  const w = (a.x1 - a.x0) / 3;
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {items.map((it, i) => {
        const x = a.x0 + w * (i + 0.5);
        const k = ramp(t, at(ctx, 0) + i * 0.6, 0.5);
        return (
          <g key={it.who} opacity={k}>
            <rect x={x - w / 2 + 20} y={180} width={w - 40} height={600} rx={22} fill={C.paper} opacity={0.9} stroke={OL} strokeWidth={4} />
            <Person who={it.who} x={x} y={700} s={0.68} t={t} mood={it.who === "rask" ? "tense" : "smile"} />
            <Label x={x} y={240} text={it.tag} size={36} bg={C.fog} />
          </g>
        );
      })}
      {same > 0 && (
        <g opacity={same}>
          <rect x={a.x0 + 40} y={790} width={a.x1 - a.x0 - 80} height={70} rx={18} fill={C.gold} stroke={OL} strokeWidth={4} />
          <Txt x={a.cx} y={838} size={36}>
            другой человек — средство
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Мармеладов: двадцать рублей ──
export const Coins: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const give = ramp(t, at(ctx, 1.4), 1);
  const nat = ramp(t, at(ctx, 2), 0.7);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={a.x0 + 40} y={180} width={a.x1 - a.x0 - 80} height={680} rx={22} fill="#d7c9b4" opacity={0.92} />
      {/* окно с ночным городом */}
      <rect x={a.x1 - 380} y={230} width={260} height={200} rx={10} fill="#4a5590" stroke={OL} strokeWidth={4} />
      <House x={a.x1 - 360} y={430} w={110} h={120} color="#3b4270" t={t} seed={5} lit={0.6} />
      <Person who="sonya" x={a.cx - 120} y={840} s={0.72} t={t} mood="sad" />
      <Person who="katerina" x={a.cx + 120} y={840} s={0.72} t={t} mood="sad" flip />
      <Person who="rask" x={a.x0 + 230} y={840} s={0.72} t={t} mood="kind" pose={give > 0 && give < 1 ? "reach" : "stand"} />
      {Array.from({ length: 6 }).map((_, i) => {
        const k = clamp01(give * 1.6 - i * 0.12);
        const x = interpolate(k, [0, 1], [a.x0 + 300, a.cx + 40 + (i % 3) * 30]);
        const y = interpolate(k, [0, 1], [640, 700 - Math.floor(i / 3) * 18]) - Math.sin(k * Math.PI) * 90;
        return k > 0 ? <Coin key={i} x={x} y={y} r={18} spin={t * 5 + i} /> : null;
      })}
      <Appear t={t} at={at(ctx, 1.4)} x={a.cx} y={260}>
        <Label x={0} y={0} text="все деньги — 20 рублей" size={36} bg={C.paper} />
      </Appear>
      {nat > 0 && (
        <g opacity={nat}>
          <Label x={a.cx} y={360} text="натура > теория" size={38} bg={C.dawn} />
        </g>
      )}
    </Drift>
  );
};

// ── Поминки: гордость бедных ──
export const Funeral: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const defend = ramp(t, at(ctx, 1), 0.7);
  const kids = ramp(t, at(ctx, 2), 0.8);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={a.x0 + 40} y={180} width={a.x1 - a.x0 - 80} height={680} rx={22} fill="#cbb89c" opacity={0.9} />
      {/* стол с разномастной посудой */}
      <rect x={a.x0 + 120} y={620} width={a.x1 - a.x0 - 240} height={40} rx={10} fill="#f4f1e6" stroke={OL} strokeWidth={4} />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx={a.x0 + 200 + i * 130} cy={612} rx={36} ry={10} fill={["#e9e3f4", "#f2d5bb", "#cfe1d2"][i % 3]} stroke={OL} strokeWidth={3} />
      ))}
      <Person who="katerina" x={a.cx - 100} y={860} s={0.74} t={t} mood={defend > 0.5 ? "angry" : "tense"} pose={defend > 0.5 && kids < 0.5 ? "point" : "stand"} />
      <Person who="sonya" x={a.cx + 200} y={860} s={0.7} t={t} mood="sad" flip />
      {kids > 0 && [0, 1, 2].map((i) => <Person key={i} who="child" x={a.cx + 360 + i * 90} y={860} s={0.48} t={t + i} mood="sad" seed={i} opacity={kids} />)}
      <Appear t={t} at={at(ctx, 0.3)} x={a.cx - 200} y={260}>
        <Label x={0} y={0} text="«не хуже других»" size={34} serif bg={C.paper} />
      </Appear>
      <Appear t={t} at={at(ctx, 2.2)} x={a.cx + 260} y={360}>
        <Label x={0} y={0} text="«с рук на руки»" size={34} serif bg={C.dawn} />
      </Appear>
    </Drift>
  );
};
