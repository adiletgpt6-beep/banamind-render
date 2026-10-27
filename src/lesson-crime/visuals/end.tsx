// Финальные сцены: версии мотива, перекрёсток и признание, суд, Сибирь
// (дорога, острог, двор, берег реки), сон о «трихинах», три вывода.
// Без изображения насилия; религиозные предметы — как предметы героев, без священных образов.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT, SERIF } from "../theme";
import { House, Label, OL, Person, Silhouette } from "./draw";
import { Appear, area, at, clamp01, Drift, ramp, Txt, type VisualProps } from "./kit";

type P = { host?: string; stage?: number; variant?: string; n?: number };

// ── Версии мотива: карточки отбрасываются одна за другой ──
export const Motives: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const cards = ["ограбить?", "помочь матери?", "«Наполеоном сделаться»?", "«вошь»?"];
  const last = ramp(t, at(ctx, 2.4), 0.8);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <Person who="sonya" x={a.x1 - 180} y={860} s={0.66} t={t} mood="sad" flip />
      <Person who="rask" x={a.x0 + 180} y={860} s={0.66} t={t} mood="tense" />
      <Appear t={t} at={at(ctx, 0.4)} x={a.cx} y={200}>
        <Label x={0} y={0} text="«Угадай»" size={40} serif bg={C.paper} />
      </Appear>
      {cards.map((c, i) => {
        const inK = ramp(t, at(ctx, 1) + i * 0.7, 0.4);
        const out = ramp(t, at(ctx, 2) + i * 0.35, 0.5);
        const x = a.cx - 300 + (i % 2) * 600;
        const y = 380 + Math.floor(i / 2) * 170;
        return (
          <g key={c} opacity={inK * (1 - out * 0.75)} transform={`translate(${x + out * (i % 2 ? 80 : -80)} ${y + out * 60}) rotate(${out * (i % 2 ? 12 : -12)})`}>
            <rect x={-250} y={-60} width={500} height={120} rx={16} fill={C.paper} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={36}>
              {c}
            </Txt>
            {out > 0.2 && <line x1={-220} y1={0} x2={-220 + 440 * out} y2={0} stroke={C.red} strokeWidth={6} />}
          </g>
        );
      })}
      {last > 0 && (
        <g opacity={last} transform={`translate(${a.cx} 780) scale(${0.85 + 0.15 * last})`}>
          <rect x={-420} y={-62} width={840} height={124} rx={20} fill={C.gold} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={14} size={40}>
            «я только осмелиться захотел»
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Перекрёсток: совет Сони (0) / площадь и контора (1) ──
export const Crossroads: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const stage = p.stage ?? 0;
  if (stage === 0) {
    const roads = ramp(t, at(ctx, 0.3), 1);
    const refuse = ramp(t, at(ctx, 1.4), 0.6);
    return (
      <Drift t={t} dur={dur} cx={a.cx}>
        <path d={`M ${a.cx} 900 L ${a.cx} 560 M ${a.cx} 560 L ${a.cx - 420} 260 M ${a.cx} 560 L ${a.cx + 420} 260 M ${a.cx} 560 L ${a.cx} 200`} stroke={C.paper} strokeWidth={40 * roads} strokeLinecap="round" fill="none" opacity={0.85} />
        <Label x={a.cx} y={170} text="«стань на перекрестке»" size={34} serif bg={C.dawn} opacity={roads} />
        <Label x={a.cx - 420} y={220} text="признать" size={32} opacity={roads} />
        <Label x={a.cx + 420} y={220} text="«страдание принять»" size={30} serif opacity={roads} />
        <Person who="sonya" x={a.cx + 260} y={880} s={0.66} t={t} mood="kind" pose="point" flip />
        <Person who="rask" x={a.cx - 200 - refuse * 80} y={880} s={0.66} t={t} mood={refuse > 0.5 ? "angry" : "sad"} />
        <Appear t={t} at={at(ctx, 1.4)} x={a.cx - 320} y={440}>
          <Label x={0} y={0} text="«Нет! Не пойду я к ним»" size={32} serif bg={C.fog} />
        </Appear>
      </Drift>
    );
  }
  const kneel = ramp(t, at(ctx, 0.4), 0.8);
  const office = ramp(t, at(ctx, 1), 0.9);
  const back = ramp(t, at(ctx, 1.6), 0.8);
  const words = ramp(t, at(ctx, 2), 0.6);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {/* Сенная площадь */}
      <g opacity={1 - office}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <House key={i} x={a.x0 + i * 240} y={720} w={220} h={260 + (i % 3) * 60} color="#a99a8a" t={t} seed={i + 20} />
        ))}
        <rect x={a.x0} y={720} width={a.x1 - a.x0} height={180} fill="#9e9080" />
        {[0, 1, 2, 3].map((i) => (
          <Person key={i} who="crowd" x={a.x0 + 200 + i * 330} y={860 + (i % 2) * 20} s={0.5} t={t + i} mood="smile" seed={i} flip={i % 2 === 0} opacity={0.85} />
        ))}
        <Person who="rask" x={a.cx} y={880} s={0.66} t={t} pose={kneel > 0.5 ? "kneel" : "stand"} mood="closed" />
        <g transform={`translate(${a.cx} 520)`} opacity={kneel}>
          <path d="M 0 -26 L 0 26 M -16 -8 L 16 -8" stroke="#a37b4a" strokeWidth={8} strokeLinecap="round" />
          <Txt x={0} y={70} size={26} color={C.paper}>
            кипарисный крестик Сони
          </Txt>
        </g>
      </g>
      {/* контора */}
      {office > 0 && (
        <g opacity={office}>
          <rect x={a.x0 + 40} y={180} width={a.x1 - a.x0 - 80} height={680} rx={20} fill="#c9c3b2" />
          <rect x={a.x1 - 420} y={220} width={300} height={600} fill="#8e9ab8" stroke={OL} strokeWidth={4} />
          <rect x={a.x0 + 200} y={600} width={500} height={34} fill="#6b5240" stroke={OL} strokeWidth={4} />
          <Person who="officer" x={a.x0 + 450} y={860} s={0.68} t={t} mood={words > 0.5 ? "shock" : "smile"} />
          <Person who="rask" x={a.cx + 120 + (1 - back) * 260} y={860} s={0.68} t={t} mood="closed" flip={back < 0.5} />
          {back > 0 && <Person who="sonya" x={a.x1 - 270} y={760} s={0.42} t={t} mood="sad" opacity={back} />}
          <Appear t={t} at={at(ctx, 2)} x={a.cx} y={300}>
            <Label x={0} y={0} text="«Это я убил…»" size={44} serif bg={C.paper} />
          </Appear>
        </g>
      )}
    </Drift>
  );
};

// ── Суд: смягчающие обстоятельства и приговор ──
export const Court: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const facts = ["явка с повинною", "помогал больному товарищу", "спас двоих детей на пожаре"];
  const sentence = ramp(t, at(ctx, 2), 0.8);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={a.x0 + 40} y={160} width={a.x1 - a.x0 - 80} height={700} rx={24} fill="#d8cdb6" opacity={0.92} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={a.x0 + 120 + i * 300} y={180} width={50} height={660} fill="#bfae8c" />
      ))}
      <rect x={a.cx - 400} y={360} width={800} height={60} rx={10} fill="#7a5a3a" stroke={OL} strokeWidth={4} />
      <Person who="rask" x={a.cx + 360} y={860} s={0.66} t={t} mood="closed" />
      {facts.map((f, i) => (
        <Appear key={f} t={t} at={at(ctx, 1) + i * 0.8} x={a.cx} y={130 + i * 72}>
          <Label x={0} y={0} text={f} size={28} bg={i === 2 ? C.dawn : C.paper} />
        </Appear>
      ))}
      {sentence > 0 && (
        <g opacity={sentence} transform={`translate(${a.cx - 120} 560)`}>
          <rect x={-330} y={-56} width={660} height={112} rx={18} fill={C.paper} stroke={C.goldDeep} strokeWidth={6} />
          <Txt x={0} y={16} size={40}>
            каторга · восемь лет
          </Txt>
        </g>
      )}
    </Drift>
  );
};

// ── Сибирь: дорога / острог / двор / берег реки ──
export const Siberia: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const v = p.variant ?? "road";
  const dawn = v === "river" ? ramp(t, 0, Math.max(4, dur * 0.6)) : 0;
  const sky1 = v === "river" ? interpolate(dawn, [0, 1], [0, 1]) : 0.3;
  return (
    <g>
      <defs>
        <linearGradient id={`sib-${v}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={v === "prison" || v === "yard" ? "#9aa6c4" : "#a8c4e6"} />
          <stop offset="100%" stopColor={v === "river" ? "#ffd9a8" : "#e9e4d8"} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill={`url(#sib-${v})`} opacity={0.9} />
      {v === "river" && <circle cx={1500} cy={560 - sky1 * 160} r={90} fill="#fff1c9" opacity={0.6 + 0.4 * sky1} />}
      {v === "road" && (
        <Drift t={t} dur={dur} cx={a.cx}>
          <path d={`M ${a.x0} 900 Q ${a.cx} 620 ${a.x1} 560`} stroke="#c9b89a" strokeWidth={70} fill="none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Silhouette key={i} x={a.x0 + 300 + i * 120 + t * 6} y={760 - i * 30} s={0.4} color="#5a6080" opacity={0.75} />
          ))}
          <Person who="sonya" x={a.x0 + 200 + t * 4} y={880} s={0.62} t={t} pose="walk" mood="kind" />
          <Appear t={t} at={at(ctx, 1)} x={a.x1 - 340} y={300}>
            <g>
              <Person who="mother" x={0} y={200} s={0.5} t={t} mood="sad" pose="read" />
              <Label x={0} y={-180} text="мать ждала сына" size={30} />
            </g>
          </Appear>
          <Appear t={t} at={at(ctx, 0.6)} x={a.x0 + 420} y={230}>
            <g>
              <Person who="dunya" x={-60} y={160} s={0.4} t={t} mood="smile" />
              <Person who="razum" x={60} y={160} s={0.42} t={t} mood="smile" flip />
              <Label x={0} y={-130} text="Дуня и Разумихин" size={28} />
            </g>
          </Appear>
        </Drift>
      )}
      {(v === "prison" || v === "yard") && (
        <Drift t={t} dur={dur} cx={a.cx}>
          {/* частокол острога */}
          {Array.from({ length: 30 }).map((_, i) => (
            <path key={i} d={`M ${i * 66} 520 L ${i * 66 + 30} 470 L ${i * 66 + 60} 520 L ${i * 66 + 60} 900 L ${i * 66} 900 Z`} fill="#8a7a62" stroke={OL} strokeWidth={3} />
          ))}
          <rect x={0} y={860} width={1920} height={220} fill="#cfc6b4" />
          {v === "prison" ? (
            <g>
              <Person who="rask" x={a.cx} y={940} s={0.7} t={t} mood="closed" pose="hold" />
              <Appear t={t} at={at(ctx, 1)} x={a.cx} y={330}>
                <Label x={0} y={0} text="«уязвленной гордости»" size={36} serif bg={C.paper} />
              </Appear>
              <Appear t={t} at={at(ctx, 1.5)} x={a.cx} y={430}>
                <Label x={0} y={0} text="«не раскаивался»" size={36} serif bg={C.fog} />
              </Appear>
              <Appear t={t} at={at(ctx, 3)} x={a.cx} y={230}>
                <Label x={0} y={0} text="«глубокую ложь»" size={34} serif bg={C.dawn} />
              </Appear>
            </g>
          ) : (
            <g>
              {[0, 1, 2, 3].map((i) => (
                <Person key={i} who="convict" x={a.x0 + 160 + i * 150} y={960} s={0.55} t={t + i} mood={i % 2 ? "angry" : "tense"} seed={i} flip />
              ))}
              <Person who="rask" x={a.x0 + 840} y={960} s={0.6} t={t} mood="closed" />
              <Appear t={t} at={at(ctx, 0.3)} x={a.x0 + 400} y={330}>
                <Label x={0} y={0} text="«Ты барин!»" size={36} serif bg={C.fog} />
              </Appear>
              <Appear t={t} at={at(ctx, 1)} x={a.x1 - 260} y={600}>
                <g>
                  <circle cx={0} cy={240} r={200} fill={C.gold} opacity={0.2} />
                  <Person who="sonya" x={0} y={360} s={0.62} t={t} mood="kind" />
                  <Label x={0} y={-30} text="«Матушка, Софья Семеновна»" size={28} serif bg={C.dawn} />
                </g>
              </Appear>
            </g>
          )}
        </Drift>
      )}
      {v === "river" && (
        <Drift t={t} dur={dur} cx={960} amount={0.05}>
          {/* дальний берег: степь, юрты */}
          <rect x={0} y={560} width={1920} height={60} fill="#c8c08a" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${1100 + i * 140} 590 q 40 -60 80 0 Z`} fill="#e8dcc0" stroke={OL} strokeWidth={3} />
          ))}
          <rect x={0} y={620} width={1920} height={200} fill="#8fb3d8" />
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d={`M ${((i * 170 + t * 18) % 2100) - 100} ${650 + (i % 4) * 40} q 40 -10 80 0`} stroke="#e6f0fb" strokeWidth={4} fill="none" opacity={0.7} />
          ))}
          <rect x={0} y={820} width={1920} height={260} fill="#c9b894" />
          {/* брёвна */}
          <rect x={560} y={850} width={420} height={40} rx={20} fill="#8a6a4a" stroke={OL} strokeWidth={4} />
          <Person who="rask" x={720} y={900} s={0.66} t={t} pose={ramp(t, at(ctx, 1.4)) > 0.5 ? "kneel" : "sit"} mood={ramp(t, at(ctx, 1.4)) > 0.5 ? "closed" : "sad"} />
          <Appear t={t} at={at(ctx, 1)} x={0} y={0} dy={0}>
            <Person who="sonya" x={980} y={910} s={0.64} t={t} mood="kind" flip />
          </Appear>
          <Appear t={t} at={at(ctx, 0.5)} x={1300} y={470}>
            <Label x={0} y={0} text="«Там была свобода»" size={34} serif bg={C.paper} />
          </Appear>
          <Appear t={t} at={at(ctx, 2)} x={860} y={300}>
            <Label x={0} y={0} text="«Их воскресила любовь»" size={40} serif bg={C.dawn} />
          </Appear>
        </Drift>
      )}
    </g>
  );
};

// ── Сон о «трихинах»: идеи-микробы заражают людей ──
export const Trichinae: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const spread = ramp(t, at(ctx, 0.4), Math.max(2, dur * 0.6));
  const people = Array.from({ length: 10 }).map((_, i) => ({ x: a.x0 + 140 + (i % 5) * ((a.x1 - a.x0 - 280) / 4), y: 520 + Math.floor(i / 5) * 300 }));
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      <rect x={a.x0 + 20} y={150} width={a.x1 - a.x0 - 40} height={760} rx={28} fill="#d9d4ec" opacity={0.6} />
      {people.map((q, i) => {
        const inf = clamp01(spread * 1.6 - i * 0.12);
        return (
          <g key={i}>
            <Silhouette x={q.x} y={q.y} s={0.55} color={inf > 0.5 ? "#7a5e9a" : "#6c7aa6"} />
            {inf > 0.5 && (
              <g transform={`translate(${q.x} ${q.y - 200})`}>
                <Label x={0} y={0} text="я прав" size={22} bg={C.paper} opacity={inf} />
              </g>
            )}
          </g>
        );
      })}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = a.x0 + ((i * 197 + t * 40 * (1 + (i % 3))) % (a.x1 - a.x0));
        const y = 200 + ((i * 113 + Math.sin(t + i) * 40) % 640);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${t * 60 + i * 20})`} opacity={0.4 + 0.5 * spread}>
            <ellipse rx={14} ry={6} fill="#a46ab8" />
            <circle cx={10} cy={0} r={4} fill="#ffd23f" />
          </g>
        );
      })}
      <Appear t={t} at={at(ctx, 0.3)} x={a.cx} y={230}>
        <Label x={0} y={0} text="«одаренные умом и волей»" size={34} serif bg={C.paper} />
      </Appear>
      <Appear t={t} at={at(ctx, 2)} x={a.cx} y={130}>
        <Label x={0} y={0} text="интерпретация: теория, ставшая эпидемией" size={28} bg={C.fog} />
      </Appear>
    </Drift>
  );
};

// ── Три вывода ──
export const Conclusions: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const a = area(p.host);
  const n = p.n ?? 1;
  const titles = ["Человек — не показатель", "Идея может прятать гордыню", "Перемена — путь, а не вспышка"];
  const icons = [
    (k: number) => (
      <g>
        <text x={-120} y={30} fontFamily={SERIF} fontWeight={700} fontSize={120} fill={C.steel} opacity={1 - k}>
          %
        </text>
        <g opacity={k}>
          <Person who="lizaveta" x={-80} y={110} s={0.42} t={t} mood="kind" />
        </g>
      </g>
    ),
    (k: number) => (
      <g>
        <rect x={-150} y={-80} width={160} height={200} rx={14} fill={C.paper} stroke={OL} strokeWidth={4} transform={`rotate(${-8 * k})`} />
        <text x={-70} y={10} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle" opacity={1 - k * 0.6}>
          идея
        </text>
        <g opacity={k}>
          <path d="M -40 60 L -10 -30 L 20 60 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
          <text x={-10} y={110} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.ink} textAnchor="middle">
            «я»
          </text>
        </g>
      </g>
    ),
    (k: number) => (
      <g>
        <path d={`M -200 100 Q -80 ${100 - 140 * k} 60 ${-20 * k} T 200 -80`} stroke={C.dawn} strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={-200} cy={100} r={14} fill={C.gold} />
      </g>
    ),
  ];
  const k = ramp(t, at(ctx, 0.5), 1.4);
  return (
    <Drift t={t} dur={dur} cx={a.cx}>
      {[1, 2, 3].map((i) => {
        const active = i === n;
        const done = i < n;
        const x = a.x0 + 60 + (i - 1) * ((a.x1 - a.x0 - 120) / 3) + (a.x1 - a.x0 - 120) / 6;
        return (
          <g key={i} opacity={active ? 1 : done ? 0.7 : 0.35} transform={`translate(${x} ${active ? 470 : 500}) scale(${active ? 1 : 0.84})`}>
            <rect x={-190} y={-280} width={380} height={560} rx={26} fill={active ? C.paper : "#d9d6e8"} stroke={active ? C.goldDeep : OL} strokeWidth={active ? 7 : 4} />
            <circle cx={0} cy={-220} r={40} fill={C.gold} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-205} size={44}>
              {String(i)}
            </Txt>
            <g transform="translate(40 -40)">{icons[i - 1](active ? k : done ? 1 : 0)}</g>
            <text x={0} y={180} fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.ink} textAnchor="middle">
              {titles[i - 1].split(" ").reduce<string[]>((rows, w) => {
                const last = rows[rows.length - 1];
                if (last && (last + " " + w).length <= 16) rows[rows.length - 1] = last + " " + w;
                else rows.push(w);
                return rows;
              }, []).map((r, j) => (
                <tspan key={j} x={0} dy={j === 0 ? 0 : 40}>
                  {r}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
      <Txt x={a.cx} y={130} size={30} color={C.paper} weight={700}>
        авторский разбор BanaMind, а не слова Достоевского
      </Txt>
    </Drift>
  );
};
