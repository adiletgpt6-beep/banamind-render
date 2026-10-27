// Сцены BM-038, часть C: камера 3 «Эмоции» и камера 4 «Общество».
import React from "react";
import { C, CELL } from "../theme";
import { Bubble, Plate } from "./core";
import { hash, Morph, Swarm } from "./dots";
import { OL, Person, type Who } from "./draw";
import { Appear, Arrow, area, at, Check, clamp01, Cross, ease, Pop, ramp, Txt, type VisualProps } from "./kit";
import { Bars, BigNum, buildNet, Net, Spark } from "./lab";
import { pic, PICS } from "./pix";

type P = { host?: string; [k: string]: unknown };
const EMO = CELL.emotion;
const PUB = CELL.public;

// ── Почти 700 тысяч статей ──
export const Nyt: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const collect = ramp(t, 0.3, 3);
  const bars = ramp(t, at(ctx, 1), 0.4);
  // «газетные листы» — сетка точек-статей, заполняется сканированием
  const grid = [];
  const cols = 34;
  const rows = 14;
  for (let i = 0; i < cols * rows; i++) {
    const on = hash(i, 7) < collect * 1.05;
    if (!on) continue;
    const x = a.cx - 520 + (i % cols) * 31;
    const y = 200 + Math.floor(i / cols) * 31;
    grid.push(<rect key={i} x={x} y={y} width={22} height={22} rx={5} fill={[EMO.light, "#e6e9f2", PUB.light, CELL.currency.light][i % 4]} stroke={OL} strokeOpacity={0.3} strokeWidth={1.5} />);
  }
  const scanX = a.cx - 540 + ((t * 260) % 1080);
  return (
    <g>
      <g opacity={1 - bars}>
        {grid}
        {collect < 1 && <rect x={scanX} y={186} width={12} height={460} rx={6} fill={EMO.color} opacity={0.6} />}
        <BigNum x={a.cx} y={760} text="≈700 000" sub="статей за полгода" k={ramp(t, at(ctx, 0.6), 0.6)} color={EMO.deep} size={96} />
      </g>
      {bars > 0 && (
        <Bars
          t={t}
          x0={a.cx - 360}
          x1={a.cx + 360}
          base={720}
          hMax={360}
          max={30}
          items={[
            { label: "интересные", value: 25, color: CELL.currency.color, text: "+25 %", at: at(ctx, 1.4) },
            { label: "полезные", value: 30, color: CELL.value.color, text: "+30 %", at: at(ctx, 1.75) },
          ]}
        />
      )}
    </g>
  );
};

// ── Благоговение и грусть ──
export const Awe: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const canyon = ramp(t, 0.2, 1);
  const stage = ramp(t, at(ctx, 1.25), 0.7);
  const sad = ramp(t, at(ctx, 2), 0.7);
  return (
    <g>
      {/* каньон: слои скал */}
      <g opacity={canyon * (1 - stage)}>
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${a.cx - 600} ${420 + i * 70} L ${a.cx - 280 + i * 30} ${380 + i * 80} L ${a.cx - 180 + i * 20} ${560 + i * 40} L ${a.cx + 180 - i * 20} ${560 + i * 40} L ${a.cx + 260 - i * 30} ${380 + i * 80} L ${a.cx + 600} ${420 + i * 70} L ${a.cx + 600} ${760} L ${a.cx - 600} 760 Z`} fill={["#e0794a", "#c25e33", "#a04a2a", "#7a3b1a"][i]} stroke={OL} strokeWidth={3} opacity={0.95} />
        ))}
        <Person who="student" x={a.cx - 330} y={430} s={0.36} mood="shock" pose="arms" t={t} />
        <Plate x={a.cx} y={200} text="благоговение: что-то больше нас" size={36} k={ramp(t, 0.8, 0.5)} bg="#fff" />
      </g>
      {stage > 0 && (
        <g opacity={stage * (1 - sad)}>
          <rect x={a.cx - 520} y={180} width={1040} height={420} rx={30} fill="#2b2f52" stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${a.cx - 80 + i * 80} 180 L ${a.cx - 200 + i * 200} 600`} stroke={C.yellow} strokeOpacity={0.18} strokeWidth={70} />
          ))}
          <Person who="grandma" x={a.cx} y={560} s={0.6} mood="happy" pose="hold" t={t} />
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i} transform={`translate(${a.cx - 450 + i * 100} ${640 + Math.sin(t * 6 + i) * 6 * stage})`}>
              <circle r={22} fill="#8a93c0" stroke={OL} strokeWidth={3} />
            </g>
          ))}
          <BigNum x={a.cx + 330} y={290} text="100 млн" sub="за девять дней" k={ramp(t, at(ctx, 1.6), 0.5)} color={C.yellow} size={74} />
        </g>
      )}
      {sad > 0 && (
        <g>
          <Swarm pts={pic("drop", PICS.drop, a.cx - 220, 430, 1.9, 10)} k={sad} t={t} r={4.6} from="center" />
          <BigNum x={a.cx + 240} y={470} text="−16 %" sub="грустные статьи" k={sad} color="#3a68c4" size={110} />
        </g>
      )}
    </g>
  );
};

// ── Второе измерение: активация ──
const EMOS: { name: string; x: number; y: number; c: string }[] = [
  { name: "благоговение", x: 0.38, y: 0.86, c: CELL.stories.color },
  { name: "веселье", x: 0.82, y: 0.5, c: CELL.currency.color },
  { name: "злость", x: -0.72, y: 0.8, c: C.red },
  { name: "тревога", x: -0.45, y: 0.62, c: "#ff9f43" },
  { name: "грусть", x: -0.55, y: -0.7, c: "#5b8def" },
  { name: "удовлетворённость", x: 0.5, y: -0.66, c: CELL.value.color },
];
export const Arousal: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const cx = a.cx;
  const cy = 460;
  const W = 560;
  const H = 300;
  const axisY = ramp(t, at(ctx, 1), 0.7);
  const fire = ramp(t, at(ctx, 2), 0.6);
  return (
    <g>
      <line x1={cx - W} y1={cy} x2={cx + W} y2={cy} stroke={OL} strokeWidth={5} strokeLinecap="round" />
      <Txt x={cx - W + 70} y={cy + 50} size={28} weight={800} color={C.inkSoft}>
        негатив
      </Txt>
      <Txt x={cx + W - 70} y={cy + 50} size={28} weight={800} color={C.inkSoft}>
        позитив
      </Txt>
      <g opacity={axisY}>
        <line x1={cx} y1={cy + H} x2={cx} y2={cy - H} stroke={OL} strokeWidth={5} strokeLinecap="round" />
        <Txt x={cx + 110} y={cy - H + 10} size={30} weight={900} color={EMO.deep}>
          активация ↑
        </Txt>
        <rect x={cx - W} y={cy - H} width={W * 2} height={H} fill={EMO.color} opacity={0.08 + 0.05 * fire * Math.sin(t * 3)} />
      </g>
      {EMOS.map((e, i) => {
        const x = cx + e.x * W * (i < 2 ? 1 : 1);
        const yTarget = cy - e.y * H;
        const y = cy + (yTarget - cy) * axisY;
        const k = ramp(t, 0.3 + i * 0.15, 0.4);
        return (
          <g key={e.name} transform={`translate(${x} ${y}) scale(${k})`}>
            <circle r={26} fill={e.c} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={62} size={28} weight={900}>
              {e.name}
            </Txt>
          </g>
        );
      })}
      <Plate x={cx} y={850} text="«Активность разжигает огонь»" size={38} k={fire} bg={C.yellow} />
    </g>
  );
};

// ── История любви из поисковых запросов ──
const QUERIES = ["учёба в Париже", "кафе возле Лувра", "как произвести впечатление на француженку", "работа в Париже", "как собрать детскую кроватку"];
export const Search: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const span = Math.max(1, at(ctx, 1.2) - 0.4);
  const why = ramp(t, at(ctx, 1.35), 0.6);
  return (
    <g>
      <g opacity={1 - why}>
        {QUERIES.map((q, i) => {
          const at0 = 0.4 + (i / QUERIES.length) * span;
          const k = ramp(t, at0, 0.4);
          const typed = Math.floor(q.length * clamp01((t - at0) / 0.9));
          const y = 210 + i * 110;
          const last = i === QUERIES.length - 1;
          return (
            <g key={q} opacity={k * (i < QUERIES.length - 1 && t > at0 + span / QUERIES.length + 0.8 ? 0.55 : 1)}>
              <rect x={a.cx - 470} y={y - 40} width={940} height={80} rx={40} fill={last ? EMO.light : "#fff"} stroke={last ? EMO.deep : OL} strokeWidth={4} />
              <circle cx={a.cx - 420} cy={y} r={16} fill="none" stroke={C.inkSoft} strokeWidth={5} />
              <line x1={a.cx - 408} y1={y + 12} x2={a.cx - 396} y2={y + 24} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
              <text x={a.cx - 370} y={y + 12} fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={34} fill={C.ink}>
                {q.slice(0, typed)}
                {typed < q.length && Math.floor(t * 3) % 2 === 0 ? "|" : ""}
              </text>
            </g>
          );
        })}
      </g>
      {why > 0 && (
        <g>
          {["Почему это важно?", "Почему это важно?", "Почему это важно?"].map((s, i) => (
            <Appear key={i} t={t} at={at(ctx, 1.45 + i * 0.15)} x={a.cx - 260 + i * 260} y={420 - i * 90}>
              <rect x={-150} y={-40} width={300} height={80} rx={22} fill="#fff" stroke={EMO.deep} strokeWidth={4} />
              <Txt x={0} y={12} size={30} weight={900}>
                {s}
              </Txt>
            </Appear>
          ))}
          <Pop t={t} at={at(ctx, 1.95)} x={a.cx + 360} y={160}>
            <path d="M 0 60 C -90 0 -76 -70 -28 -70 C -8 -70 0 -54 0 -44 C 0 -54 8 -70 28 -70 C 76 -70 90 0 0 60 Z" fill={EMO.color} stroke={OL} strokeWidth={5} />
          </Pop>
          <Plate x={a.cx} y={720} text="эмоциональное ядро идеи" size={38} k={ramp(t, at(ctx, 2), 0.5)} bg={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Сломанная гитара ──
export const Guitar: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const pts = pic("guitar", PICS.guitar, a.cx - 300, 450, 2.4, 11);
  const crack = ramp(t, at(ctx, 0.3), 0.4);
  const months = clamp01((t - at(ctx, 0.5)) / 2.5);
  const song = ramp(t, at(ctx, 1), 0.6);
  const nodes = buildNet("guitar", a.cx + 250, 440, { gens: 4, fan: 2.3, step: 85, colors: [EMO.color, C.red, "#ff9f43", EMO.deep] });
  return (
    <g>
      <Swarm pts={pts} k={ramp(t, 0.1, 1)} t={t} r={5} />
      {crack > 0 && <path d={`M ${a.cx - 330} 470 L ${a.cx - 300} 500 L ${a.cx - 320} 530 L ${a.cx - 280} 570`} stroke={C.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={200} strokeDashoffset={200 * (1 - crack)} />}
      <g opacity={1 - song}>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={a.cx + 30 + (i % 3) * 120} y={240 + Math.floor(i / 3) * 120} width={100} height={100} rx={12} fill={months * 9 > i ? "#ffe1d8" : "#fff"} stroke={OL} strokeWidth={3} />
        ))}
        <Txt x={a.cx + 150} y={640} size={34} weight={900} color={C.red}>
          9 месяцев отказов
        </Txt>
      </g>
      {song > 0 && (
        <g>
          <Net nodes={nodes} k={clamp01((t - at(ctx, 1.1)) / 2.5) * 4} t={t} r={12} />
          <Pop t={t} at={at(ctx, 1)} x={a.cx + 250} y={440}>
            <circle r={46} fill={EMO.color} stroke={OL} strokeWidth={5} />
            <path d="M -10 -22 L -10 14 M -10 -22 L 18 -28 L 18 8" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
            <circle cx={-16} cy={16} r={9} fill="#fff" />
            <circle cx={12} cy={10} r={9} fill="#fff" />
          </Pop>
          <BigNum x={a.cx + 250} y={790} text="1,3 млн+" sub="меньше чем за четыре дня" k={ramp(t, at(ctx, 1.5), 0.5)} color={EMO.deep} size={80} />
        </g>
      )}
    </g>
  );
};

// ── Бег на месте ──
export const Running: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const run = ramp(t, at(ctx, 0.5), 0.5);
  const res = ramp(t, at(ctx, 1), 0.5);
  const bob = Math.abs(Math.sin(t * 8)) * 26 * run;
  return (
    <g>
      <g opacity={1 - res}>
        <rect x={a.cx - 430} y={560} width={120} height={14} rx={6} fill="#8a5a3c" />
        <rect x={a.cx - 420} y={480} width={100} height={84} rx={10} fill="#a8724c" stroke={OL} strokeWidth={4} />
        <Person who="student" x={a.cx - 370} y={700} s={0.42} mood="kind" pose="stand" t={t} />
        <Txt x={a.cx - 370} y={760} size={32} weight={900} color={C.inkSoft}>
          сидят минуту
        </Txt>
        <g transform={`translate(0 ${-bob})`}>
          <Person who="friend" x={a.cx + 250} y={700} s={0.42} mood="happy" pose="walk" t={t * 1.6} />
        </g>
        <Txt x={a.cx + 250} y={760} size={32} weight={900} color={EMO.deep}>
          бегают на месте
        </Txt>
        {run > 0 && <path d={`M ${a.cx + 180} 330 Q ${a.cx + 250} ${290 - bob} ${a.cx + 320} 330`} fill="none" stroke={EMO.color} strokeWidth={8} strokeLinecap="round" />}
      </g>
      {res > 0 && (
        <Bars
          t={t}
          x0={a.cx - 380}
          x1={a.cx + 380}
          base={700}
          hMax={420}
          max={75}
          items={[
            { label: "спокойные", value: 33, color: "#a7aec6", text: "меньше вдвое", at: at(ctx, 1.25) },
            { label: "после бега", value: 75, color: EMO.color, text: "75 %", at: at(ctx, 1.4) },
          ]}
        />
      )}
    </g>
  );
};

// ── Камера 4: перевёрнутый логотип ──
export const Visible: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const eye = pic("eye", PICS.eye, a.cx - 320, 420, 1.6, 10);
  const lap = pic("laptop", PICS.laptop, a.cx + 260, 420, 1.9, 10);
  const flip = ramp(t, at(ctx, 1.4), 0.9);
  const watchers = ramp(t, at(ctx, 1.7), 0.6);
  const who: Who[] = ["anna", "timur", "kid", "guest"];
  return (
    <g>
      <Swarm pts={eye} k={ramp(t, 0.3, 1.1)} t={t} r={4.6} from="center" />
      <g opacity={ramp(t, at(ctx, 1), 0.6)}>
        <Swarm pts={lap} k={ramp(t, at(ctx, 1), 1)} t={t} r={4.6} />
        <g transform={`translate(${a.cx + 260} 400) rotate(${180 * flip})`}>
          <circle r={46} fill={PUB.color} stroke={OL} strokeWidth={5} />
          <path d="M 0 -26 L 0 26 M -16 -8 L 0 -26 L 16 -8" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <Txt x={a.cx + 260} y={300} size={30} weight={900} color={PUB.deep} opacity={flip}>
        логотип — для окружающих
      </Txt>
      {who.map((w, i) => (
        <Person key={w} who={w} x={a.cx - 40 + i * 140} y={820} s={0.32} mood="smile" pose={i % 2 ? "point" : "stand"} t={t + i} opacity={watchers} />
      ))}
      <Plate x={a.cx - 320} y={180} text="«…создано, чтобы расти»" size={34} k={ramp(t, at(ctx, 2), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Социальное доказательство ──
export const Proof: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const fill = ramp(t, at(ctx, 0.5), 0.8);
  const trucks = ramp(t, at(ctx, 1), 0.6);
  const kidney = ramp(t, at(ctx, 2), 0.6);
  const queue = clamp01((t - at(ctx, 1.2)) / 2.4);
  return (
    <g>
      <g opacity={1 - trucks}>
        <path d={`M ${a.cx - 160} 300 L ${a.cx + 160} 300 L ${a.cx + 130} 620 L ${a.cx - 130} 620 Z`} fill="#eaf4ff" fillOpacity={0.8} stroke={OL} strokeWidth={6} />
        <Txt x={a.cx} y={270} size={34} weight={900}>
          чаевые
        </Txt>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={a.cx - 100 + (i % 3) * 60} y={560 - Math.floor(i / 3) * 34 - (1 - fill) * 300} width={80} height={30} rx={6} fill="#7fd36a" stroke={OL} strokeWidth={3} opacity={fill} transform={`rotate(${(i % 2 ? 8 : -6)} ${a.cx} 500)`} />
        ))}
      </g>
      {trucks > 0 && (
        <g opacity={trucks * (1 - kidney)}>
          {[0, 1].map((i) => {
            const x = a.cx - 300 + i * 600;
            return (
              <g key={i}>
                <rect x={x - 170} y={300} width={340} height={200} rx={24} fill={i ? "#ffeccc" : "#ffeccc"} stroke={OL} strokeWidth={5} />
                <rect x={x - 130} y={340} width={170} height={80} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
                <circle cx={x - 100} cy={510} r={30} fill="#1d2340" />
                <circle cx={x + 110} cy={510} r={30} fill="#1d2340" />
                <Txt x={x + 90} y={392} size={28} weight={900}>
                  еда
                </Txt>
              </g>
            );
          })}
          {Array.from({ length: 6 }, (_, i) => (
            <Person key={i} who={(["anna", "timur", "guest", "student", "friend", "neighbor"] as Who[])[i]} x={a.cx - 470 + i * 52} y={760} s={0.26} mood="neutral" pose="stand" t={t + i} opacity={clamp01(queue * 6 - i)} />
          ))}
          <Plate x={a.cx + 300} y={680} text="пусто" size={30} k={trucks} bg="#fff" />
        </g>
      )}
      {kidney > 0 && (
        <g opacity={kidney}>
          {Array.from({ length: 8 }, (_, i) => {
            const x = a.cx - 420 + i * 120;
            const no = clamp01((t - at(ctx, 2.2)) * 2 - i * 0.4);
            return (
              <g key={i}>
                <circle cx={x} cy={420} r={34} fill={no > 0.5 ? "#ffd9e3" : PUB.light} stroke={OL} strokeWidth={4} />
                <Txt x={x} y={432} size={30} weight={900}>
                  {`${i + 1}`}
                </Txt>
                {no > 0.5 && <Cross x={x} y={360} s={40} k={no} />}
              </g>
            );
          })}
          <BigNum x={a.cx} y={640} text="97,1 %" sub="отказов от предложенных почек" k={kidney} color={PUB.deep} size={90} />
        </g>
      )}
    </g>
  );
};

// ── Поведение публичное, мысли личные ──
export const Lecture: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const think = ramp(t, at(ctx, 1), 0.6);
  const who: Who[] = ["anna", "timur", "student", "friend", "guest", "neighbor"];
  return (
    <g>
      <rect x={a.cx - 360} y={160} width={720} height={260} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
      <path d={`M ${a.cx - 300} 330 C ${a.cx - 200} 200 ${a.cx - 100} 380 ${a.cx} 260 S ${a.cx + 200} 220 ${a.cx + 300} 300`} fill="none" stroke={C.inkSoft} strokeWidth={6} />
      <Txt x={a.cx} y={215} size={30} weight={900} color={C.inkSoft}>
        ∑ ∂ ∫ ≈ ???
      </Txt>
      {who.map((w, i) => (
        <g key={w}>
          <Person who={w} x={a.cx - 450 + i * 180} y={820} s={0.34} mood={think > 0.5 ? "doubt" : "neutral"} pose="stand" t={t + i} />
          {think > 0 && <Bubble x={a.cx - 450 + i * 180} y={520} text="?" k={ramp(t, at(ctx, 1.1) + i * 0.12, 0.4)} tone="hidden" size={40} tail="b" />}
        </g>
      ))}
      <Plate x={a.cx} y={455} text="поведение видно · мысли — нет" size={34} k={ramp(t, at(ctx, 0.6), 0.5)} bg={C.yellow} />
    </g>
  );
};

// ── Усы ноября ──
export const Mustache: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const grow = ramp(t, 0.5, at(ctx, 1) - 0.5);
  const pts = pic("mustache", PICS.mustache, a.cx - 300, 400, 2.4 * (0.4 + 0.6 * grow), 10);
  const money = ramp(t, at(ctx, 1), 0.6);
  const talk = ramp(t, at(ctx, 2), 0.6);
  const nodes = buildNet("mustache", a.cx + 300, 430, { gens: 3, fan: 2.4, step: 120, colors: [PUB.color, PUB.deep, C.spark, CELL.value.color] });
  return (
    <g>
      <g opacity={1 - talk * 0.5}>
        <Swarm pts={pts} k={ramp(t, 0.2, 0.8)} t={t} r={5} />
        {/* календарь ноября: 30 дней */}
        <g transform={`translate(${a.cx - 520} 560)`}>
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={(i % 10) * 46} y={Math.floor(i / 10) * 46} width={38} height={38} rx={8} fill={grow * 30 > i ? PUB.color : "#fff"} stroke={OL} strokeWidth={2.5} />
          ))}
          <Txt x={220} y={180} size={30} weight={900} color={PUB.deep}>
            ноябрь
          </Txt>
        </g>
      </g>
      {money > 0 && (
        <g opacity={money * (1 - talk)}>
          <BigNum x={a.cx + 330} y={250} text="30 → 450" sub="участников" k={money} color={PUB.deep} size={80} />
          <BigNum x={a.cx + 330} y={470} text="$54 000" sub="через год" k={ramp(t, at(ctx, 1.3), 0.5)} color={CELL.value.deep} size={80} />
          <BigNum x={a.cx + 330} y={690} text="$174 млн+" sub="к выходу книги" k={ramp(t, at(ctx, 1.65), 0.5)} color={CELL.value.deep} size={80} />
        </g>
      )}
      {talk > 0 && (
        <g>
          <Net nodes={nodes} k={clamp01((t - at(ctx, 2)) / 2.4) * 3} t={t} r={15} />
          <Bubble x={a.cx + 300} y={230} text="Зачем усы?" k={talk} size={36} />
        </g>
      )}
    </g>
  );
};

// ── Реклама, которая рекламирует себя ──
export const Signature: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const mail = pic("mail", PICS.mail, a.cx - 320, 380, 1.7, 10);
  const sends = clamp01((t - at(ctx, 0.6)) / 3);
  const phones = ramp(t, at(ctx, 2), 0.6);
  const nodes = buildNet("mail", a.cx - 320, 380, { gens: 3, fan: 2.6, step: 150, colors: [PUB.color, PUB.deep, CELL.triggers.color] });
  return (
    <g>
      <g opacity={1 - phones}>
        <Net nodes={nodes} k={sends * 3} t={t} r={12} people={false} />
        <Swarm pts={mail} k={ramp(t, 0.2, 1)} t={t} r={4.6} />
        <g transform={`translate(${a.cx + 300} 380)`} opacity={ramp(t, at(ctx, 0.3), 0.5)}>
          <rect x={-260} y={-160} width={520} height={320} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={-210} y1={-100 + i * 50} x2={150 - i * 60} y2={-100 + i * 50} stroke="#c3cbe0" strokeWidth={10} strokeLinecap="round" />
          ))}
          <rect x={-230} y={60} width={460} height={64} rx={14} fill={PUB.light} stroke={PUB.deep} strokeWidth={4} />
          <Txt x={0} y={102} size={26} weight={900} color={PUB.deep}>
            Заведите свой бесплатный ящик →
          </Txt>
        </g>
        <BigNum x={a.cx + 300} y={700} text="8,5 млн" sub="чуть больше чем за год" k={ramp(t, at(ctx, 1.2), 0.5)} color={PUB.deep} size={84} />
      </g>
      {phones > 0 && (
        <g opacity={phones}>
          {Array.from({ length: 7 }, (_, i) => {
            const x = a.cx - 480 + i * 160;
            const white = i % 3 === 1;
            return (
              <g key={i}>
                <Person who={(["anna", "timur", "student", "friend", "guest", "neighbor", "kid"] as Who[])[i]} x={x} y={820} s={0.36} mood="smile" pose="walk" t={t * 1.2 + i} />
                <path d={`M ${x - 22} ${610} Q ${x - 40} ${680} ${x - 10} ${720}`} fill="none" stroke={white ? "#ffffff" : "#1d2340"} strokeWidth={white ? 8 : 5} />
                {white && <circle cx={x - 10} cy={724} r={10} fill="#fff" stroke={OL} strokeWidth={2} />}
              </g>
            );
          })}
          <Plate x={a.cx} y={300} text="белые наушники видны издалека" size={36} k={phones} bg={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Обратная сторона: когда видимость вредит ──
export const Backfire: React.FC<VisualProps<P>> = (ctx) => {
  const { t, p } = ctx;
  const a = area(p.host);
  const ad = ramp(t, 0.3, 0.7);
  const up = ramp(t, at(ctx, 1.3), 1.2);
  const forest = ramp(t, at(ctx, 2), 0.7);
  const rule = ramp(t, at(ctx, 3), 0.6);
  return (
    <g>
      <g opacity={ad * (1 - forest)}>
        <rect x={a.cx - 520} y={200} width={460} height={300} rx={24} fill="#fff" stroke={OL} strokeWidth={5} />
        <Txt x={a.cx - 290} y={300} size={34} weight={900}>
          «многие так делают»
        </Txt>
        <Txt x={a.cx - 290} y={360} size={28} weight={800} color={C.inkSoft}>
          1998–2004 · почти миллиард $
        </Txt>
        <Arrow x1={a.cx + 60} y1={600} x2={a.cx + 420} y2={260} k={up} color={C.red} w={14} />
        <Plate x={a.cx + 240} y={660} text="стало хуже, а не лучше" size={32} k={up} bg="#ffe1d8" edge={C.red} />
      </g>
      {forest > 0 && (
        <g opacity={forest}>
          {[0, 1].map((i) => {
            const x = a.cx - 290 + i * 580;
            return (
              <g key={i}>
                <rect x={x - 20} y={460} width={40} height={240} fill="#8a5a3c" stroke={OL} strokeWidth={4} />
                <rect x={x - 240} y={220} width={480} height={250} rx={18} fill={i ? "#d3f5e1" : "#ffe1d8"} stroke={OL} strokeWidth={5} />
                <Txt x={x} y={310} size={30} weight={900}>
                  {i ? "Пожалуйста, сохраним" : "Многие посетители"}
                </Txt>
                <Txt x={x} y={360} size={30} weight={900}>
                  {i ? "окаменелый лес" : "уносят деревья…"}
                </Txt>
                {i ? <Check x={x} y={420} s={34} k={ramp(t, at(ctx, 2.6), 0.4)} /> : <Cross x={x} y={420} s={46} k={ramp(t, at(ctx, 2.3), 0.4)} />}
              </g>
            );
          })}
        </g>
      )}
      {rule > 0 && <Plate x={a.cx} y={800} text="не говорите, что многие это делают" size={38} k={rule} bg={C.yellow} />}
    </g>
  );
};

export const _unusedC = { Morph, Spark, ease, Check };
