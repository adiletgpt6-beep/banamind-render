// Сцены BM-038, часть D: камера 5 «Практическая ценность», камера 6 «Истории»,
// шесть камер вместе и последний эксперимент.
import React from "react";
import { C, CELL, CELLS } from "../theme";
import { Bubble, Plate } from "./core";
import { hash, Morph, Swarm } from "./dots";
import { OL, Person, type Who } from "./draw";
import { Appear, Arrow, area, at, Check, clamp01, Cross, ease, Pop, ramp, Txt, type VisualProps } from "./kit";
import { BigNum, buildNet, Chamber, Lamp, Net, Spark } from "./lab";
import { pic, PICS } from "./pix";

type P = { host?: string; [k: string]: unknown };
const VAL = CELL.value;
const STO = CELL.stories;

// ── Кукуруза за четыре минуты ──
export const Corn: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const pts = pic("corn", PICS.corn, a.cx - 330, 440, 2.4, 11);
  const steps = ["микроволновка · 4 мин", "срезать ~1 см", "встряхнуть"];
  const shake = Math.sin(t * 18) * 8 * (ramp(t, at(ctx, 1.75), 0.2) * (1 - ramp(t, at(ctx, 1.95), 0.2)));
  const views = ramp(t, at(ctx, 2), 0.6);
  return (
    <g>
      <g transform={`translate(${shake} 0)`}>
        <Swarm pts={pts} k={ramp(t, 0.2, 1.2)} t={t} r={5} from="below" />
      </g>
      <Person who="grandma" x={a.cx - 40} y={820} s={0.5} mood="happy" pose="give" t={t} opacity={ramp(t, 0.3, 0.6) * (1 - views * 0.6)} color="#3d6fd0" />
      {steps.map((s, i) => (
        <Appear key={s} t={t} at={at(ctx, 1 + i * 0.3)} x={a.cx + 320} y={250 + i * 130}>
          <rect x={-240} y={-46} width={480} height={92} rx={24} fill="#fff" stroke={VAL.deep} strokeWidth={5} />
          <circle cx={-196} cy={0} r={26} fill={VAL.color} stroke={OL} strokeWidth={3} />
          <Txt x={-196} y={12} size={32} weight={900} color="#fff">
            {`${i + 1}`}
          </Txt>
          <Txt x={30} y={12} size={32} weight={900}>
            {s}
          </Txt>
        </Appear>
      ))}
      <BigNum x={a.cx + 320} y={730} text="5 млн+" sub="первое место среди 55+" k={views} color={VAL.deep} size={84} />
    </g>
  );
};

// ── Стройка амбара ──
export const Barn: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const build = clamp01((t - 0.4) / Math.max(2, at(ctx, 1) - 0.4));
  const gift = ramp(t, at(ctx, 1), 0.7);
  const parts = 8;
  return (
    <g>
      <g opacity={1 - gift}>
        {Array.from({ length: parts }, (_, i) => {
          const k = clamp01(build * parts - i);
          if (k <= 0) return null;
          const row = Math.floor(i / 2);
          const x = a.cx - 160 + (i % 2) * 160;
          const y = 640 - row * 90;
          return <rect key={i} x={x - 2} y={y - 90 + (1 - ease(k)) * -80} width={164} height={88} fill={["#c0503a", "#d0603f"][i % 2]} stroke={OL} strokeWidth={4} opacity={k} />;
        })}
        {build > 0.9 && <path d={`M ${a.cx - 190} 280 L ${a.cx} 160 L ${a.cx + 190} 280 Z`} fill="#8a3e2a" stroke={OL} strokeWidth={5} />}
        {(["neighbor", "timur", "anna", "grandma"] as Who[]).map((w, i) => (
          <Person key={w} who={w} x={a.cx - 420 + i * 280 + (i > 1 ? 280 : 0) - (i > 1 ? 280 : 0)} y={820} s={0.36} mood="happy" pose={i % 2 ? "give" : "hold"} t={t + i} flip={i > 1} />
        ))}
      </g>
      {gift > 0 && (
        <g>
          <Swarm pts={pic("gift", PICS.gift, a.cx, 420, 1.5, 10)} k={gift} t={t} r={4.6} from="center" />
          <Arrow x1={a.cx - 360} y1={600} x2={a.cx + 360} y2={600} k={ramp(t, at(ctx, 1.2), 0.8)} color={VAL.deep} bend={-0.2} />
          <Plate x={a.cx} y={720} text="поделиться = помочь" size={38} k={ramp(t, at(ctx, 1.4), 0.5)} bg={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Узкий совет и конкретный друг ──
export const Narrow: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const crowd = ramp(t, 0.3, 0.6);
  const hit = ramp(t, at(ctx, 0.6), 0.6);
  const mail = ramp(t, at(ctx, 1), 0.6);
  return (
    <g>
      <g opacity={1 - mail}>
        {Array.from({ length: 14 }, (_, i) => {
          const x = a.cx - 520 + (i % 7) * 150;
          const y = 520 + Math.floor(i / 7) * 170;
          const special = i === 9;
          return <Person key={i} who={(["anna", "timur", "guest", "student", "friend", "neighbor", "kid2"] as Who[])[i % 7]} x={x} y={y} s={0.26} mood={special && hit > 0.5 ? "happy" : "neutral"} pose="stand" t={t + i} opacity={crowd * (special ? 1 : 1 - hit * 0.6)} />;
        })}
        <Appear t={t} at={0.4} x={a.cx - 240} y={210}>
          <rect x={-200} y={-70} width={400} height={140} rx={22} fill="#fff" stroke={VAL.deep} strokeWidth={5} />
          <Txt x={0} y={-6} size={30} weight={900}>
            Статья:
          </Txt>
          <Txt x={0} y={40} size={30} weight={900} color={VAL.deep}>
            эфиопская кухня
          </Txt>
        </Appear>
        <Arrow x1={a.cx - 40} y1={260} x2={a.cx - 520 + 2 * 150 + 10} y2={560} k={hit} color={VAL.deep} />
      </g>
      {mail > 0 && (
        <g opacity={mail}>
          <Swarm pts={pic("narrow-mail", PICS.mail, a.cx - 300, 420, 1.3, 10)} k={mail} t={t} r={4.4} />
          {["купил дом", "учится вести бюджет"].map((s, i) => (
            <g key={s}>
              <Arrow x1={a.cx - 140} y1={420} x2={a.cx + 160} y2={300 + i * 240} k={ramp(t, at(ctx, 1.3 + i * 0.3), 0.6)} color={VAL.deep} />
              <Person who={i ? "student" : "timur"} x={a.cx + 340} y={420 + i * 240} s={0.3} mood="smile" pose="take" t={t} opacity={ramp(t, at(ctx, 1.4 + i * 0.3), 0.4)} />
              <Plate x={a.cx + 340} y={250 + i * 240} text={s} size={28} k={ramp(t, at(ctx, 1.45 + i * 0.3), 0.4)} bg="#fff" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// ── Как выглядит выгода ──
export const Deals: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const tag = pic("deal-tag", PICS.tag, a.cx - 300, 360, 1.6, 10);
  const sale = ramp(t, at(ctx, 0.5), 0.5);
  const rule = ramp(t, at(ctx, 1), 0.6);
  const honest = ramp(t, at(ctx, 2), 0.6);
  return (
    <g>
      <g opacity={1 - rule}>
        <Swarm pts={tag} k={ramp(t, 0.2, 1)} t={t} r={4.6} />
        <Pop t={t} at={at(ctx, 0.5)} x={a.cx - 300} y={200}>
          <rect x={-150} y={-38} width={300} height={76} rx={16} fill={C.red} stroke={OL} strokeWidth={4} transform="rotate(-6)" />
          <Txt x={0} y={14} size={40} weight={900} color="#fff">
            РАСПРОДАЖА
          </Txt>
        </Pop>
        <BigNum x={a.cx + 260} y={380} text="+50 %" sub="спроса при той же цене" k={sale} color={VAL.deep} size={100} />
      </g>
      {rule > 0 && (
        <g opacity={rule}>
          <g transform={`translate(${a.cx - 280} 420)`}>
            <rect x={-220} y={-140} width={440} height={280} rx={26} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-70} size={30} weight={900} color={C.inkSoft}>
              до $100
            </Txt>
            <Txt x={0} y={20} size={80} weight={900} color={VAL.deep}>
              −20 %
            </Txt>
            <Txt x={0} y={100} size={28} weight={800} color={C.inkSoft}>
              кажется больше
            </Txt>
          </g>
          <g transform={`translate(${a.cx + 280} 420)`}>
            <rect x={-220} y={-140} width={440} height={280} rx={26} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-70} size={30} weight={900} color={C.inkSoft}>
              дороже $100
            </Txt>
            <Txt x={0} y={20} size={80} weight={900} color={VAL.deep}>
              −$400
            </Txt>
            <Txt x={0} y={100} size={28} weight={800} color={C.inkSoft}>
              кажется больше
            </Txt>
          </g>
          <Txt x={a.cx} y={240} size={36} weight={900} opacity={rule}>
            правило ста
          </Txt>
        </g>
      )}
      {honest > 0 && (
        <Appear t={t} at={at(ctx, 2)} x={a.cx} y={720}>
          <rect x={-380} y={-50} width={760} height={100} rx={26} fill="#ffe1d8" stroke={C.red} strokeWidth={5} />
          <Txt x={30} y={14} size={34} weight={900}>
            выдуманная «старая цена» — обман
          </Txt>
          <Cross x={-330} y={0} s={50} k={1} />
        </Appear>
      )}
    </g>
  );
};

// ── Примечание о правде ──
export const Truth: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const doc = ramp(t, at(ctx, 1), 0.6);
  const fake = ramp(t, at(ctx, 1.5), 0.6);
  const spread = clamp01((t - at(ctx, 2)) / 2.4);
  const shield = ramp(t, at(ctx, 3), 0.7);
  const nodes = buildNet("truth", a.cx - 200, 430, { gens: 3, fan: 2.3, step: 120, colors: ["#a7aec6", "#8a93b8", "#c3cbe0"] });
  return (
    <g>
      {/* документ 1998 года */}
      <g transform={`translate(${a.cx - 200} 430) rotate(${-4})`} opacity={doc * (1 - shield * 0.5)}>
        <rect x={-150} y={-190} width={300} height={380} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-130} size={30} weight={900}>
          статья, 1998
        </Txt>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={-110} y1={-80 + i * 44} x2={110 - (i % 2) * 40} y2={-80 + i * 44} stroke="#c3cbe0" strokeWidth={10} strokeLinecap="round" />
        ))}
        <g transform={`rotate(-18) scale(${0.6 + 0.4 * fake})`} opacity={fake}>
          <rect x={-150} y={110} width={300} height={70} rx={10} fill="none" stroke={C.red} strokeWidth={8} />
          <Txt x={0} y={160} size={40} weight={900} color={C.red}>
            ФАЛЬШИВКА
          </Txt>
        </g>
      </g>
      <g opacity={spread * (1 - shield)}>
        <Net nodes={nodes} k={spread * 3} t={t} r={12} />
      </g>
      <Plate x={a.cx - 200} y={830} text="связи прививок с аутизмом нет" size={36} k={ramp(t, at(ctx, 1.4), 0.5)} bg={C.yellow} />
      {shield > 0 && (
        <g>
          <Swarm pts={pic("shield", PICS.shield, a.cx + 330, 410, 1.7, 10)} k={shield} t={t} r={4.8} from="center" />
          <Plate x={a.cx + 330} y={650} text="проверьте, прежде чем переслать" size={32} k={shield} bg="#fff" edge={C.green} />
        </g>
      )}
    </g>
  );
};

// ── Камера 6: троянский конь ──
export const Horse: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const chamber = ramp(t, 0, 0.6);
  const pts = pic("horse", PICS.horse, a.cx - 120, 470, 2.5, 11);
  const k = ramp(t, at(ctx, 1), 1.3);
  const roll = ramp(t, at(ctx, 1.6), 1.6);
  const xray = ramp(t, at(ctx, 2.2), 0.7);
  return (
    <g>
      <Chamber cell="stories" x={a.cx - 640} y={130} w={1280} h={690} k={chamber}>
        {/* стены Трои */}
        <g opacity={k}>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={a.cx + 360 + (i % 2) * 70} y={300 + Math.floor(i / 2) * 120} width={66} height={116} fill="#e6dcc6" stroke={OL} strokeWidth={3} />
          ))}
          <path d={`M ${a.cx + 360} 300 L ${a.cx + 360} 270 L ${a.cx + 396} 270 L ${a.cx + 396} 300 M ${a.cx + 430} 300 L ${a.cx + 430} 270 L ${a.cx + 466} 270 L ${a.cx + 466} 300`} fill="#e6dcc6" stroke={OL} strokeWidth={3} />
        </g>
        <g transform={`translate(${roll * 220} 0)`}>
          <Swarm pts={pts} k={k} t={t} r={5.4} from="left" />
          {xray > 0 && (
            <g opacity={xray}>
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${a.cx - 200 + i * 70} 470)`}>
                  <circle r={22} fill={C.yellow} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={9} size={24} weight={900}>
                    !
                  </Txt>
                </g>
              ))}
              <Plate x={a.cx - 120} y={300} text="внутри — смысл" size={34} k={xray} bg={C.yellow} />
            </g>
          )}
        </g>
      </Chamber>
    </g>
  );
};

// ── История как вместилище ──
export const Vessel: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const broke = ramp(t, at(ctx, 0.35), 0.4);
  const fresh = ramp(t, at(ctx, 0.8), 0.6);
  const inside = ramp(t, at(ctx, 1), 0.7);
  const jacket = (x: number, ok: boolean, k: number) => (
    <g transform={`translate(${x} 430) scale(${k})`} opacity={k}>
      <path d="M -110 -150 L -40 -170 Q 0 -140 40 -170 L 110 -150 L 150 40 L 100 50 L 100 160 L -100 160 L -100 50 L -150 40 Z" fill={ok ? "#3b82f6" : "#5b9cff"} stroke={OL} strokeWidth={6} />
      <line x1={0} y1={-150} x2={0} y2={160} stroke={ok ? "#ffd23f" : C.red} strokeWidth={8} strokeDasharray={ok ? undefined : "18 12"} />
    </g>
  );
  return (
    <g>
      <g opacity={1 - inside}>
        {jacket(a.cx - 300, false, ramp(t, 0.2, 0.6))}
        {broke > 0 && <Cross x={a.cx - 300} y={430} s={120} k={broke} />}
        <Arrow x1={a.cx - 120} y1={430} x2={a.cx + 120} y2={430} k={fresh} color={STO.deep} />
        {jacket(a.cx + 300, true, fresh)}
        <Bubble x={a.cx + 300} y={200} text="замена бесплатно" k={fresh} size={34} />
      </g>
      {inside > 0 && (
        <g>
          <Swarm pts={pic("vessel-book", PICS.book, a.cx, 430, 1.9, 10)} k={inside} t={t} r={4.6} from="center" />
          <Pop t={t} at={at(ctx, 1.3)} x={a.cx} y={430}>
            <rect x={-200} y={-44} width={400} height={88} rx={22} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={12} size={32} weight={900}>
              здесь заботятся о клиентах
            </Txt>
          </Pop>
          <Plate x={a.cx} y={740} text="доказательство через аналогию" size={36} k={ramp(t, at(ctx, 1.5), 0.5)} bg="#fff" edge={STO.deep} />
        </g>
      )}
    </g>
  );
};

// ── Эволюция одного лица ──
export const Dove: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const fx = a.cx - 240;
  const face = pic("face", PICS.face, fx, 440, 2.6, 11);
  // «ретушь»: та же картинка, вытянутая и гладкая
  const retouched = face.map((q, i) => ({ x: fx + (q.x - fx) * 0.86, y: 440 + (q.y - 440) * 1.12 - (q.y > 520 ? 20 : 0), c: q.c === "#1d2340" ? q.c : i % 5 === 0 ? "#ff8aa6" : q.c }));
  const steps = clamp01((t - 0.6) / Math.max(2, at(ctx, 1) - 0.6));
  const m = ramp(t, at(ctx, 0.6), 1.6);
  const board = ramp(t, at(ctx, 1), 0.7);
  return (
    <g>
      {board > 0 && (
        <g opacity={board}>
          <rect x={fx - 300} y={130} width={600} height={620} rx={14} fill="#2b2f52" stroke={OL} strokeWidth={6} />
          <rect x={fx - 30} y={750} width={60} height={110} fill="#8a93b8" stroke={OL} strokeWidth={4} />
        </g>
      )}
      <Morph a={face} b={retouched} k={m} t={t} r={5} />
      {["грим", "причёска", "свет и съёмка", "ретушь"].map((s, i) => (
        <Plate key={s} x={a.cx + 330} y={290 + i * 90} text={s} size={32} k={clamp01(steps * 4 - i)} bg={i === 3 ? "#ffe1d8" : "#fff"} />
      ))}
      <Appear t={t} at={at(ctx, 1.05)} x={a.cx + 330} y={720}>
        <rect x={-300} y={-70} width={600} height={140} rx={24} fill={C.yellow} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={-8} size={30} weight={900}>
          «Неудивительно, что наше
        </Txt>
        <Txt x={0} y={36} size={30} weight={900}>
          восприятие красоты искажено»
        </Txt>
      </Appear>
      <BigNum x={a.cx + 330} y={170} text="16 млн+" sub="просмотров (данные тех лет)" k={ramp(t, at(ctx, 2.2), 0.5)} color={STO.deep} size={64} />
    </g>
  );
};

// ── Пустой конь: прыжок в бассейн и малыши ──
export const Pool: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const jump = clamp01((t - 0.6) / 1.6);
  const babies = ramp(t, at(ctx, 1), 0.7);
  const y = 260 + 380 * jump * jump;
  const splash = jump >= 1 ? ramp(t, 2.2, 0.4) * (1 - ramp(t, 3.4, 0.8)) : 0;
  const talkNodes = buildNet("pool", a.cx + 260, 380, { gens: 3, fan: 2.4, step: 110, colors: [STO.color, CELL.emotion.color, C.spark] });
  return (
    <g>
      <g opacity={1 - babies}>
        <rect x={a.cx - 560} y={640} width={600} height={180} rx={20} fill="#7aa7d8" stroke={OL} strokeWidth={5} />
        <rect x={a.cx - 520} y={220} width={160} height={24} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
        <g transform={`translate(${a.cx - 380 + jump * 120} ${y}) rotate(${jump * 160})`}>
          <circle cy={-60} r={22} fill={C.skin} stroke={OL} strokeWidth={4} />
          <rect x={-22} y={-40} width={44} height={80} rx={18} fill="#fff" stroke={OL} strokeWidth={4} />
          <rect x={-18} y={-20} width={36} height={18} fill={C.red} />
        </g>
        {splash > 0 && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={a.cx - 260 + Math.cos(i) * 90 * splash} cy={640 - Math.abs(Math.sin(i * 1.7)) * 120 * splash} r={12} fill="#cfe2ff" stroke={OL} strokeWidth={2} />)}
        <Net nodes={talkNodes} k={clamp01((t - 2) / 2) * 3} t={t} r={12} />
        <Plate x={a.cx + 260} y={620} text="о трюке говорят" size={32} k={ramp(t, 2.6, 0.5)} bg="#fff" />
        <Plate x={a.cx + 260} y={720} text="о рекламодателе — нет" size={32} k={ramp(t, 3.1, 0.5)} bg="#ffe1d8" edge={C.red} />
      </g>
      {babies > 0 && (
        <g opacity={babies}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${a.cx - 380 + i * 170 + Math.sin(t * 3 + i) * 30} ${560 + Math.abs(Math.sin(t * 4 + i)) * -20})`}>
              <circle cy={-70} r={34} fill={C.skin} stroke={OL} strokeWidth={4} />
              <rect x={-26} y={-36} width={52} height={60} rx={20} fill={["#ff8aa6", "#94bce6", "#ffe27a"][i]} stroke={OL} strokeWidth={4} />
              <rect x={-30} y={30} width={60} height={12} rx={6} fill={OL} />
              <circle cx={-20} cy={46} r={7} fill="#fff" stroke={OL} strokeWidth={2} />
              <circle cx={20} cy={46} r={7} fill="#fff" stroke={OL} strokeWidth={2} />
            </g>
          ))}
          <BigNum x={a.cx + 300} y={340} text="50 млн+" sub="просмотров" k={ramp(t, at(ctx, 1.3), 0.5)} color={STO.deep} size={84} />
          <BigNum x={a.cx + 300} y={600} text="−25 %" sub="продаж в тот же год" k={ramp(t, at(ctx, 1.55), 0.5)} color={C.red} size={84} />
          <Plate x={a.cx} y={820} text="«ценная виральность»: продукт внутри истории" size={34} k={ramp(t, at(ctx, 2), 0.5)} bg={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Не говорите «нет» панде ──
export const Panda: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const no = ramp(t, at(ctx, 0.6), 0.4);
  const panda = ramp(t, at(ctx, 1), 0.6);
  const chaos = clamp01((t - at(ctx, 1.25)) / 2);
  return (
    <g>
      {/* полка магазина */}
      <rect x={a.cx - 560} y={250} width={420} height={360} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <line x1={a.cx - 560} y1={370 + r * 120} x2={a.cx - 140} y2={370 + r * 120} stroke={OL} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => {
            const fly = chaos * (1 + hash(r * 4 + i, 3));
            return <rect key={i} x={a.cx - 530 + i * 96 + fly * 160 * (hash(i, r) - 0.3)} y={300 + r * 120 - fly * 120 * hash(i + r, 2) + fly * fly * 200} width={70} height={60} rx={10} fill={["#ffe27a", "#ffd23f", "#f5b400"][r]} stroke={OL} strokeWidth={3} transform={`rotate(${fly * 90 * (hash(i, r + 4) - 0.5)} ${a.cx - 495 + i * 96} ${330 + r * 120})`} />;
          })}
        </g>
      ))}
      <Person who="neighbor" x={a.cx + 40} y={820} s={0.5} mood={panda > 0.5 ? "shock" : "tense"} pose={no > 0.5 ? "stop" : "stand"} t={t} />
      <Person who="kid" x={a.cx - 120} y={820} s={0.5} mood="smile" pose="point" t={t} />
      {no > 0 && panda < 0.5 && <Bubble x={a.cx + 60} y={330} text="Нет!" k={no} size={44} />}
      {panda > 0 && (
        <g transform={`translate(${a.cx + 380} ${560 + Math.abs(Math.sin(t * 5)) * -16 * panda}) scale(${0.6 + 0.4 * panda})`} opacity={panda}>
          <ellipse cx={0} cy={40} rx={110} ry={130} fill="#fff" stroke={OL} strokeWidth={6} />
          <circle cy={-130} r={90} fill="#fff" stroke={OL} strokeWidth={6} />
          <circle cx={-70} cy={-200} r={30} fill={OL} />
          <circle cx={70} cy={-200} r={30} fill={OL} />
          <ellipse cx={-34} cy={-136} rx={22} ry={28} fill={OL} />
          <ellipse cx={34} cy={-136} rx={22} ry={28} fill={OL} />
          <circle cx={-30} cy={-140} r={7} fill="#fff" />
          <circle cx={30} cy={-140} r={7} fill="#fff" />
          <ellipse cy={-96} rx={14} ry={10} fill={OL} />
          <ellipse cx={-100} cy={0} rx={30} ry={70} fill={OL} transform={`rotate(${20 + Math.sin(t * 8) * 30 * chaos} -100 -40)`} />
          <ellipse cx={100} cy={0} rx={30} ry={70} fill={OL} transform={`rotate(${-20 - Math.sin(t * 8) * 30 * chaos} 100 -40)`} />
        </g>
      )}
      <Plate x={a.cx} y={180} text="«Никогда не говорите “НЕТ” панде»" size={38} k={ramp(t, at(ctx, 1.3), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Испорченный телефон ──
export const Telephone: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const n = 6;
  const pass = clamp01((t - 0.6) / Math.max(2, at(ctx, 1.6) - 0.6)) * n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = a.cx - 600 + i * 240;
        const k = clamp01(pass - i + 1);
        const details = Math.max(1, Math.round(10 * Math.pow(0.78, i)));
        return (
          <g key={i} opacity={0.3 + 0.7 * k}>
            <Person who={(["anna", "timur", "student", "friend", "guest", "neighbor"] as Who[])[i]} x={x} y={820} s={0.3} mood="kind" pose="give" t={t + i} />
            <g transform={`translate(${x} 470)`}>
              <rect x={-96} y={-150} width={192} height={260} rx={18} fill="#fff" stroke={OL} strokeWidth={4} />
              {Array.from({ length: details }, (_, j) => (
                <rect key={j} x={-70 + (j % 3) * 50} y={-120 + Math.floor(j / 3) * 50} width={40} height={40} rx={8} fill={j === 0 ? STO.color : "#c3cbe0"} stroke={OL} strokeWidth={j === 0 ? 4 : 2} />
              ))}
            </g>
            {i < n - 1 && <Arrow x1={x + 100} y1={470} x2={x + 140} y2={470} k={clamp01(pass - i)} color={STO.deep} w={8} />}
          </g>
        );
      })}
      <BigNum x={a.cx} y={230} text="≈70 % деталей теряется" k={ramp(t, at(ctx, 1), 0.5)} color={STO.deep} size={64} />
      <Plate x={a.cx} y={680} text="главное остаётся — и становится острее" size={34} k={ramp(t, at(ctx, 1.5), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Двадцать женщин и маникюр ──
export const Salon: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const camp = ramp(t, 0.3, 0.7);
  const teach = ramp(t, at(ctx, 1), 0.7);
  const grow = clamp01((t - at(ctx, 2)) / 2.2);
  const cells = ramp(t, at(ctx, 3), 0.6);
  const nodes = buildNet("salon", a.cx - 120, 470, { gens: 3, fan: 2.6, step: 130, colors: ["#ff8aa6", "#ff6f93", "#d22a57", C.spark] });
  return (
    <g>
      <g opacity={camp * (1 - grow * 0.6)}>
        <path d={`M ${a.cx - 520} 640 L ${a.cx - 400} 520 L ${a.cx - 280} 640 Z`} fill="#c3d6fb" stroke={OL} strokeWidth={4} />
        <path d={`M ${a.cx - 300} 640 L ${a.cx - 180} 520 L ${a.cx - 60} 640 Z`} fill="#d6e5ff" stroke={OL} strokeWidth={4} />
        <Plate x={a.cx - 290} y={470} text="лагерь беженцев, 1975" size={30} k={camp} bg="#fff" />
      </g>
      {teach > 0 && grow < 0.95 && (
        <g opacity={teach * (1 - grow)}>
          {Array.from({ length: 20 }, (_, i) => (
            <circle key={i} cx={a.cx + 80 + (i % 5) * 56} cy={300 + Math.floor(i / 5) * 60} r={20} fill="#ff8aa6" stroke={OL} strokeWidth={3} />
          ))}
          <Txt x={a.cx + 192} y={580} size={30} weight={900}>
            двадцать женщин
          </Txt>
        </g>
      )}
      {grow > 0 && (
        <g>
          <Net nodes={nodes} k={grow * 3} t={t} r={14} />
          <BigNum x={a.cx + 430} y={240} text="80 %" sub="мастеров в Калифорнии" k={ramp(t, at(ctx, 2.2), 0.5)} color={CELL.emotion.deep} size={90} />
        </g>
      )}
      {cells > 0 && (
        <g>
          {(["triggers", "public", "value", "stories"] as const).map((c, i) => (
            <Plate key={c} x={a.cx - 450 + i * 300} y={820} text={CELL[c].short} size={32} k={ramp(t, at(ctx, 3.1 + i * 0.12), 0.4)} bg={CELL[c].light} edge={CELL[c].deep} />
          ))}
        </g>
      )}
    </g>
  );
};

// ── Чизстейк по шести камерам ──
export const Recap: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const steak = pic("recap-steak", PICS.steak, a.cx, 470, 1.6, 10);
  const order: [string, number][] = [
    ["currency", 0.3],
    ["triggers", 0.55],
    ["emotion", 0.8],
    ["value", 1.2],
    ["stories", 1.6],
  ];
  return (
    <g>
      <Swarm pts={steak} k={ramp(t, 0.2, 1)} t={t} r={4.6} />
      {CELLS.map((c, i) => {
        const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = a.cx + Math.cos(ang) * 430;
        const y = 470 + Math.sin(ang) * 300;
        const hit = order.find((o) => o[0] === c);
        const k = hit ? ramp(t, at(ctx, hit[1]), 0.5) : 0;
        return (
          <g key={c}>
            <line x1={a.cx} y1={470} x2={a.cx + (x - a.cx) * k} y2={470 + (y - 470) * k} stroke={CELL[c].color} strokeWidth={8} strokeLinecap="round" opacity={k} />
            <Chamber cell={c} x={x - 120} y={y - 70} w={240} h={140} k={0.35 + 0.65 * k} small glow={k}>
              <Spark x={x} y={y + 30} r={18} t={t} k={k} color={CELL[c].color} />
            </Chamber>
          </g>
        );
      })}
    </g>
  );
};

// ── Большой пожар не от большой искры ──
export const Fire: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const nodes = buildNet("fire", a.cx, 600, { gens: 5, fan: 2.1, step: 92, spread: Math.PI * 1.1, dir: -Math.PI / 2, colors: ["#ffb020", "#ff9f43", "#ff6f3c", "#ffd23f", "#f5a524"] });
  const grow = clamp01((t - 1) / Math.max(3, at(ctx, 1.5) - 1)) * 5;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i} transform={`translate(${a.cx - 560 + i * 140} 700)`}>
          <rect x={-8} y={0} width={16} height={60} fill="#8a5a3c" />
          <path d="M 0 -110 L 50 10 L -50 10 Z" fill={grow > 2 + (Math.abs(i - 4) * 0.6) ? "#ffb020" : CELL.value.color} stroke={OL} strokeWidth={3} />
        </g>
      ))}
      <Net nodes={nodes} k={grow} t={t} r={12} />
      <Spark x={a.cx} y={600} r={16} t={t} k={ramp(t, 0.3, 0.5)} />
      <Plate x={a.cx - 280} y={180} text="маленькая искра" size={32} k={ramp(t, 0.6, 0.5)} bg="#fff" />
      <Plate x={a.cx + 280} y={180} text="тысячи обычных людей" size={32} k={ramp(t, at(ctx, 1), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Три ошибки применения ──
export const Mistakes: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const items = ["нужны все шесть", "конь без воинов", "громко = ценно"];
  const caveat = ramp(t, at(ctx, 4), 0.6);
  return (
    <g>
      {items.map((s, i) => {
        const y = 250 + i * 170;
        const k = ramp(t, at(ctx, i + 1), 0.5);
        return (
          <Appear key={s} t={t} at={at(ctx, i + 1)} x={a.cx} y={y}>
            <rect x={-460} y={-62} width={920} height={124} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
            <circle cx={-390} cy={0} r={38} fill={C.red} stroke={OL} strokeWidth={4} />
            <Txt x={-390} y={14} size={40} weight={900} color="#fff">
              {`${i + 1}`}
            </Txt>
            <Txt x={30} y={16} size={42} weight={900}>
              {s}
            </Txt>
            <Cross x={360} y={0} s={60} k={ramp(t, at(ctx, i + 1.5), 0.4) * k} />
          </Appear>
        );
      })}
      <Plate x={a.cx} y={790} text="выводы повышают шансы, но ничего не обещают" size={34} k={caveat} bg={C.yellow} />
    </g>
  );
};

// ── Последний эксперимент / знак полезной идеи уходит к человеку ──
export const Finale: React.FC<VisualProps<P & { stage: number }>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  if (p.stage === 1) {
    const scale = ramp(t, at(ctx, 0.5), 0.8);
    return (
      <g>
        <Chamber cell="value" x={a.x0 + 20} y={170} w={600} h={520} k={ramp(t, 0, 0.5)} label={false}>
          <Spark x={a.x0 + 320} y={430} r={50} t={t} />
        </Chamber>
        <g transform={`translate(${a.x0 + 900} 430)`} opacity={scale}>
          <rect x={-260} y={-200} width={520} height={400} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-120} size={34} weight={900} color={C.inkSoft}>
            не «насколько громко?»
          </Txt>
          <line x1={-200} y1={-80} x2={200} y2={-80} stroke={C.red} strokeWidth={6} opacity={ramp(t, at(ctx, 0.7), 0.4)} />
          <Txt x={0} y={20} size={40} weight={900} color={CELL.value.deep}>
            «чего она стоит,
          </Txt>
          <Txt x={0} y={74} size={40} weight={900} color={CELL.value.deep}>
            если её передадут?»
          </Txt>
        </g>
      </g>
    );
  }
  // знак идеи летит из камеры к человеку, у того начинается свой разговор
  const fly = ease(clamp01((t - 0.8) / Math.max(2, at(ctx, 0.7) - 0.8)));
  const sx = a.cx - 520;
  const sy = 420;
  const tx = a.cx + 420;
  const ty = 520;
  const x = sx + (tx - sx) * fly;
  const y = sy + (ty - sy) * fly - Math.sin(fly * Math.PI) * 220;
  const talk = ramp(t, at(ctx, 0.75), 0.8);
  const nodes = buildNet("finale", tx + 40, 520, { gens: 2, fan: 2, step: 130, spread: Math.PI * 1.2, dir: 0, colors: CELLS.map((c) => CELL[c].color) });
  return (
    <g>
      <Chamber cell="value" x={sx - 220} y={220} w={440} h={420} k={1} label={false}>
        <Spark x={sx} y={sy} r={24} t={t} dim={fly > 0.05 ? 0.7 : 0} />
      </Chamber>
      <path d={`M ${sx} ${sy} Q ${(sx + tx) / 2} ${sy - 260} ${x} ${y}`} fill="none" stroke={C.spark} strokeWidth={6} strokeDasharray="14 14" opacity={0.7} />
      <g transform={`translate(${x} ${y})`}>
        <circle r={46} fill="#fff" stroke={OL} strokeWidth={5} />
        <Swarm pts={pic("finale-bulb", PICS.bulb, 0, 0, 0.36, 5)} k={1} t={t} r={2.4} outline={false} />
      </g>
      <Person who="anna" x={tx} y={840} s={0.52} mood={talk > 0.5 ? "happy" : "kind"} pose={talk > 0.5 ? "give" : "take"} t={t} />
      {talk > 0 && <Net nodes={nodes} k={talk * 2} t={t} r={14} />}
      <Bubble x={tx - 20} y={250} text="Смотри, что я узнала!" k={talk} size={34} tone="fresh" />
      <Plate x={a.cx} y={130} text="не баннер — полезная идея" size={34} k={ramp(t, 1, 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Три вывода ──
export const Takeaways: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const items: [string, string][] = [
    ["не случайность", "шесть причин передать"],
    ["обычные люди", "по одному разговору"],
    ["правда и польза", "проверить до отправки"],
  ];
  return (
    <g>
      {items.map(([h, s], i) => {
        const x = a.cx - 400 + i * 400;
        return (
          <Appear key={h} t={t} at={at(ctx, i) + 0.1} x={x} y={430}>
            <rect x={-180} y={-230} width={360} height={460} rx={34} fill="#fff" stroke={[CELL.currency.deep, CELL.public.deep, CELL.value.deep][i]} strokeWidth={6} />
            <circle cx={0} cy={-140} r={56} fill={[CELL.currency.color, CELL.public.color, CELL.value.color][i]} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-118} size={64} weight={900} color="#fff">
              {`${i + 1}`}
            </Txt>
            <Txt x={0} y={10} size={36} weight={900}>
              {h}
            </Txt>
            <Txt x={0} y={80} size={28} weight={800} color={C.inkSoft}>
              {s}
            </Txt>
            {i === 0 && (
              <g transform="translate(0 150)">
                {CELLS.map((c, j) => (
                  <circle key={c} cx={-100 + j * 40} cy={0} r={14} fill={CELL[c].color} stroke={OL} strokeWidth={3} />
                ))}
              </g>
            )}
          </Appear>
        );
      })}
    </g>
  );
};

export const _unusedD = { Lamp, Check, Morph };
