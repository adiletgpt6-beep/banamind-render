// Сцены «мозга» BM-035: условный мозг с глубокой областью (базальные ганглии),
// «сжатие» последовательности шагов в один блок, Т-лабиринт с крысой и кривой
// активности, прогулка вокруг квартала (история Юджина — без портрета реального
// человека), предвкушение награды (кривая всплеска переезжает раньше), товары
// из примеров книги (зубная плёнка и покалывание, запах в комнате).
// Всё — учебные схемы BanaMind, а не снимки мозга и не реконструкции опытов.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Appear, area, Arrow, at, clamp01, Cross, Drift, ramp, wob, type VisualProps } from "./kit";
import { Figure, Label, OL } from "./props";

type P = { host?: string; [k: string]: unknown };
const S = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const N = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const A = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

// Силуэт мозга (вид сбоку), центр (0,0), ширина ≈ 640.
const BRAIN = "M -300 40 C -330 -60 -270 -170 -170 -200 C -110 -250 0 -260 70 -230 C 160 -250 260 -200 300 -120 C 340 -40 320 60 250 100 C 230 150 170 170 110 160 C 80 200 30 210 -10 190 L -20 250 L -70 250 L -70 170 C -150 170 -270 140 -300 40 Z";

export const BrainShape: React.FC<{ x: number; y: number; s?: number; k: number; t: number; cortex?: number; core?: number; coreLabel?: string }> = ({ x, y, s = 1, k, t, cortex = 1, core = 0, coreLabel }) => {
  if (k <= 0) return null;
  const folds = [
    "M -230 -60 Q -180 -110 -120 -80 Q -60 -40 -20 -90",
    "M -40 -170 Q 0 -120 60 -150 Q 120 -180 170 -130",
    "M 120 -60 Q 180 -30 240 -70",
    "M -250 40 Q -200 0 -150 30 Q -100 60 -60 20",
    "M 60 60 Q 120 30 180 70",
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (0.85 + 0.15 * k)})`} opacity={clamp01(k * 1.5)}>
      <path d={BRAIN} fill="#f6d7dc" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      {folds.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#d98f9c" strokeWidth={7} strokeLinecap="round" opacity={0.8} />
      ))}
      {/* искры активности коры: гаснут, когда действие становится привычным */}
      {cortex > 0 &&
        Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const r = 150 + (i % 3) * 40;
          const ph = Math.sin(t * 3 + i * 1.3) * 0.5 + 0.5;
          return <circle key={i} cx={Math.cos(a) * r * 0.95} cy={Math.sin(a) * r * 0.6 - 40} r={9 + ph * 6} fill={C.cue} opacity={cortex * (0.35 + ph * 0.5)} />;
        })}
      {/* глубокая область */}
      <g opacity={0.35 + 0.65 * core}>
        <ellipse cx={-10} cy={20} rx={70} ry={48} fill={core > 0 ? C.routine : "#e8b9c2"} stroke={OL} strokeWidth={4} />
        {core > 0 && <ellipse cx={-10} cy={20} rx={70 + Math.sin(t * 2.4) * 8 + 20} ry={48 + Math.sin(t * 2.4) * 6 + 14} fill={C.routine} opacity={0.18 * core} />}
      </g>
      {coreLabel && core > 0 && (
        <g opacity={core}>
          <line x1={50} y1={40} x2={300} y2={210} stroke={OL} strokeWidth={4} />
          <Label x={360} y={240} text={coreLabel} size={32} bg={C.routineSoft} />
        </g>
      )}
    </g>
  );
};

// ── Мозг: искры коры гаснут, работа уходит в глубокую область; «сжатие» шагов ──
// p: coreBeat, quietBeat, chunkBeat, steps [..], chunk, coreLabel, caption, captionBeat
export const Brain: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const steps = A(p.steps);
  const hasSteps = steps.length > 0;
  const bx = hasSteps ? Ar.x0 + 330 : Ar.cx - 60;
  const core = p.coreBeat !== undefined ? ramp(t, at(ctx, N(p.coreBeat, 1)), 0.8) : 0;
  const quiet = p.quietBeat !== undefined ? ramp(t, at(ctx, N(p.quietBeat, 1)), 1.4) : 0;
  const chunkAt = at(ctx, N(p.chunkBeat, 2));
  const ch = ramp(t, chunkAt, 1.2);
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.035}>
      <BrainShape x={bx} y={480} s={hasSteps ? 0.85 : 1.05} k={ramp(t, 0.2, 0.8)} t={t} cortex={1 - quiet * 0.85} core={core} coreLabel={S(p.coreLabel) || undefined} />
      {hasSteps && (
        <g transform={`translate(${Ar.x1 - 320} 0)`}>
          {steps.map((s, i) => {
            const k = ramp(t, at(ctx, N(p.stepsBeat, 0)) + 0.3 + i * 0.35, 0.5);
            // при «сжатии» шаги съезжаются в один блок
            const y0 = 230 + i * 92;
            const y1 = 480;
            const y = y0 + (y1 - y0) * ch;
            return (
              <g key={i} opacity={k * (1 - ch * 0.9)} transform={`translate(0 ${y})`}>
                <rect x={-230} y={-36} width={460} height={72} rx={18} fill={C.white} stroke={OL} strokeWidth={4} />
                <circle cx={-190} cy={0} r={20} fill={C.routine} />
                <text x={-155} y={12} fontFamily={FONT} fontWeight={800} fontSize={32} fill={C.ink}>
                  {s}
                </text>
              </g>
            );
          })}
          {ch > 0 && (
            <g transform={`translate(0 480) scale(${0.7 + 0.3 * ch})`} opacity={ch}>
              <rect x={-290} y={-60} width={580} height={120} rx={30} fill={C.routine} stroke={OL} strokeWidth={5} />
              <text y={14} fontFamily={HEAVY} fontWeight={900} fontSize={38} fill="#fff" textAnchor="middle">
                {S(p.chunk, "одним блоком")}
              </text>
            </g>
          )}
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={135}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// Мышка-схема (крыса из опыта книги): округлое тело, ушки, хвост.
const Rat: React.FC<{ x: number; y: number; rot?: number; t: number; s?: number }> = ({ x, y, rot = 0, t, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d={`M -40 0 Q -80 ${10 + Math.sin(t * 6) * 8} -110 ${-5 + Math.sin(t * 6 + 1) * 10}`} fill="none" stroke="#c98f8f" strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={0} cy={0} rx={46} ry={28} fill="#c7c9d6" stroke={OL} strokeWidth={4} />
    <circle cx={34} cy={-20} r={13} fill="#e6c3c9" stroke={OL} strokeWidth={3} />
    <circle cx={34} cy={20} r={13} fill="#e6c3c9" stroke={OL} strokeWidth={3} />
    <circle cx={44} cy={-6} r={4.5} fill={OL} />
    <circle cx={60} cy={0} r={6} fill="#e08a9a" />
  </g>
);

// ── Т-лабиринт: щелчок, перегородка, крыса бежит к шоколаду; справа — кривая
// активности мозга: в первых забегах высокая всё время, после обучения — всплески
// только в начале и в конце ──
// p: runBeat, learnBeat, labels {start, end}
export const Maze: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const ox = Ar.cx - 330;
  const oy = 230;
  const run = at(ctx, N(p.runBeat, 0)) + 0.3;
  const learn = at(ctx, N(p.learnBeat, 1));
  const learned = ramp(t, learn, 1);
  // путь крысы: старт внизу, вверх по стволу, налево к шоколаду
  const cycle = learned > 0.5 ? 2.2 : 5.5;
  const u = t < run ? 0 : (((t - run) / cycle) % 1 + 1) % 1;
  const wander = learned > 0.5 ? 0 : Math.sin(u * Math.PI * 6) * 26;
  let rx = ox;
  let ry = oy + 520;
  let rot = -90;
  if (u < 0.6) {
    const v = u / 0.6;
    rx = ox + wander;
    ry = oy + 520 - v * 420;
  } else {
    const v = (u - 0.6) / 0.4;
    rx = ox - v * 260;
    ry = oy + 100 + wander * 0.3;
    rot = 180;
  }
  // кривая активности
  const gx = Ar.cx + 120;
  const gy = 700;
  const gw = 560;
  const curve = (k: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = i / 60;
      const flat = 0.75 + Math.sin(x * 23) * 0.12;
      const spikes = 0.12 + 0.88 * Math.exp(-((x - 0.06) ** 2) / 0.003) + 0.88 * Math.exp(-((x - 0.94) ** 2) / 0.003);
      const v = flat * (1 - k) + spikes * k;
      pts.push(`${i === 0 ? "M" : "L"} ${gx + x * gw} ${gy - v * 300}`);
    }
    return pts.join(" ");
  };
  const gk = ramp(t, run, 1);
  const click = t > run && t < run + 0.8 ? 1 - (t - run) / 0.8 : 0;
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* лабиринт */}
      <g opacity={ramp(t, 0.1, 0.6)}>
        <path d={`M ${ox - 40} ${oy + 560} L ${ox - 40} ${oy + 140} L ${ox - 300} ${oy + 140} L ${ox - 300} ${oy + 60} L ${ox + 300} ${oy + 60} L ${ox + 300} ${oy + 140} L ${ox + 40} ${oy + 140} L ${ox + 40} ${oy + 560} Z`} fill={C.white} stroke={OL} strokeWidth={8} strokeLinejoin="round" />
        {/* шоколад слева, пусто справа */}
        <g transform={`translate(${ox - 255} ${oy + 100})`}>
          <rect x={-26} y={-20} width={52} height={40} rx={6} fill="#7a4a2e" stroke={OL} strokeWidth={3} />
          <line x1={0} y1={-20} x2={0} y2={20} stroke="#5a3520" strokeWidth={3} />
          <circle r={50 + Math.sin(t * 2.4) * 5} fill={C.reward} opacity={0.22} />
        </g>
        {/* перегородка — открывается на щелчок */}
        <rect x={ox - 40} y={oy + 470 - ramp(t, run, 0.3) * 60} width={80} height={12} fill={C.cue} opacity={1 - ramp(t, run, 0.3)} />
        {click > 0 && <circle cx={ox} cy={oy + 530} r={30 + (1 - click) * 70} fill="none" stroke={C.cue} strokeWidth={6} opacity={click} />}
        {t >= run && <Rat x={rx} y={ry} rot={rot} t={t} s={0.8} />}
        <text x={ox} y={oy + 620} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.inkSoft} textAnchor="middle">
          {S(p.mazeLabel, "условная схема опыта")}
        </text>
      </g>
      {/* график активности */}
      <g opacity={gk}>
        <rect x={gx - 30} y={gy - 360} width={gw + 60} height={420} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
        <line x1={gx} y1={gy} x2={gx + gw} y2={gy} stroke={OL} strokeWidth={4} />
        <path d={curve(learned)} fill="none" stroke={learned > 0.5 ? C.routine : C.cue} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
        <text x={gx + gw / 2} y={gy - 320} fontFamily={HEAVY} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">
          {learned > 0.5 ? S(p.after, "после обучения") : S(p.before, "первые забеги")}
        </text>
        <text x={gx} y={gy + 44} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.cue}>
          {S(p.startLabel, "щелчок")}
        </text>
        <text x={gx + gw} y={gy + 44} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.reward} textAnchor="end">
          {S(p.endLabel, "шоколад")}
        </text>
      </g>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={135}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Прогулка вокруг квартала: условный пожилой человек выходит из дома и
// возвращается по той же петле; на вопрос «где ваш дом?» — знак вопроса ──
// p: walkBeat, askBeat, homeBeat, ask, caption
export const Walk: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const cx = Ar.cx;
  const cy = 520;
  const W = 760;
  const H = 400;
  const walk = at(ctx, N(p.walkBeat, 0)) + 0.4;
  const ask = p.askBeat !== undefined ? at(ctx, N(p.askBeat, 1)) : 1e9;
  // позиция на прямоугольной петле
  const per = 2 * (W + H);
  const u = t < walk ? 0 : ((t - walk) * 120) % per;
  const pos = (d: number): [number, number] => {
    const x0 = cx - W / 2;
    const y0 = cy - H / 2;
    if (d < W) return [x0 + d, y0 + H];
    if (d < W + H) return [x0 + W, y0 + H - (d - W)];
    if (d < 2 * W + H) return [x0 + W - (d - W - H), y0];
    return [x0, y0 + (d - 2 * W - H)];
  };
  const [fx, fy] = pos(u);
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.035}>
      {/* квартал */}
      <rect x={cx - W / 2} y={cy - H / 2} width={W} height={H} rx={30} fill="none" stroke={C.routine} strokeWidth={22} opacity={0.35} strokeDasharray="2 30" strokeLinecap="round" />
      <rect x={cx - W / 2 + 70} y={cy - H / 2 + 70} width={W - 140} height={H - 140} rx={24} fill={C.sageSoft} stroke={OL} strokeWidth={5} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${cx - 200 + i * 200} ${cy})`}>
          <circle r={48} fill={C.sage} stroke={OL} strokeWidth={4} />
          <rect x={-8} y={30} width={16} height={36} fill="#8a5a34" />
        </g>
      ))}
      {/* дом в углу петли */}
      <g transform={`translate(${cx - W / 2 - 90} ${cy + H / 2 + 30})`}>
        <path d="M -80 0 L -80 -100 L 0 -170 L 80 -100 L 80 0 Z" fill={C.rewardSoft} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-24} y={-60} width={48} height={60} fill={C.routine} stroke={OL} strokeWidth={4} />
        <circle r={110 + Math.sin(t * 2) * 6} cy={-80} fill={C.reward} opacity={0.12 * ramp(t, at(ctx, N(p.homeBeat, 2)), 0.6)} />
      </g>
      {t >= walk && <Figure x={fx} y={fy + 20} s={0.42} color={C.routine} head="#e9c3a1" bob={Math.abs(Math.sin(t * 6)) * -6} />}
      {t >= ask && (
        <g transform={`translate(${cx + W / 2 + 120} ${cy - 120})`} opacity={ramp(t, ask, 0.5)}>
          <Label x={0} y={0} text={S(p.ask, "Где ваш дом?")} size={34} bg={C.white} />
          <text x={0} y={130 + wob(t, 1, 6)} fontFamily={HEAVY} fontWeight={900} fontSize={120} fill={C.crave} textAnchor="middle">
            ?
          </text>
        </g>
      )}
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={cx} y={135}>
          <Label x={0} y={0} text={S(p.caption)} size={34} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Предвкушение: экран с фигурой → капля сока; всплеск активности сначала
// на соке, потом — раньше, на сигнале; если сока нет — провал (разочарование) ──
// p: phase: «reward» | «anticipate» | «missing» (или beats: anticipateBeat, missingBeat)
export const Anticipation: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const ant = p.anticipateBeat !== undefined ? ramp(t, at(ctx, N(p.anticipateBeat, 1)), 1) : 0;
  const miss = p.missingBeat !== undefined ? ramp(t, at(ctx, N(p.missingBeat, 2)), 1) : 0;
  const sx = Ar.cx - 300;
  const gx = Ar.cx - 40;
  const gw = 640;
  const gy = 640;
  // цикл: фигура на экране в 0.2, сок в 0.6 цикла
  const cyc = (((t * 0.32) % 1) + 1) % 1;
  const shape = cyc > 0.15 && cyc < 0.55;
  const drop = !miss && cyc > 0.55 && cyc < 0.8;
  const curve = () => {
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = i / 80;
      const atReward = Math.exp(-((x - 0.7) ** 2) / 0.002) * (1 - ant);
      const atCue = Math.exp(-((x - 0.25) ** 2) / 0.002) * ant;
      const dip = -0.55 * Math.exp(-((x - 0.72) ** 2) / 0.003) * miss;
      const v = 0.18 + atReward * 0.8 + atCue * 0.8 + dip;
      pts.push(`${i === 0 ? "M" : "L"} ${gx + x * gw} ${gy - v * 300}`);
    }
    return pts.join(" ");
  };
  return (
    <Drift t={t} dur={dur} cx={Ar.cx} amount={0.03}>
      {/* экран */}
      <g transform={`translate(${sx} 300)`} opacity={ramp(t, 0.1, 0.6)}>
        <rect x={-170} y={-120} width={340} height={230} rx={20} fill={OL} />
        <rect x={-150} y={-100} width={300} height={190} rx={12} fill={shape ? "#fff6e0" : "#3c4660"} />
        {shape && <path d="M 0 -60 L 60 40 L -60 40 Z" fill={C.cue} stroke={OL} strokeWidth={4} />}
        <rect x={-30} y={110} width={60} height={50} fill={OL} />
        <text y={210} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.inkSoft} textAnchor="middle">
          {S(p.screen, "фигура на экране")}
        </text>
      </g>
      {/* трубочка с соком */}
      <g transform={`translate(${sx} 610)`} opacity={ramp(t, 0.3, 0.6)}>
        <rect x={-14} y={-60} width={28} height={110} rx={10} fill={C.rewardSoft} stroke={OL} strokeWidth={4} />
        {drop && <circle cx={0} cy={70 + (cyc - 0.55) * 300} r={14} fill={C.reward} stroke={OL} strokeWidth={3} />}
        {miss > 0 && cyc > 0.55 && cyc < 0.85 && <Cross x={0} y={110} s={70} k={1} />}
        <text y={190} fontFamily={FONT} fontWeight={800} fontSize={30} fill={C.inkSoft} textAnchor="middle">
          {S(p.juice, "капля сока")}
        </text>
      </g>
      {/* график */}
      <g opacity={ramp(t, 0.5, 0.8)}>
        <rect x={gx - 30} y={gy - 380} width={gw + 60} height={460} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
        <line x1={gx} y1={gy} x2={gx + gw} y2={gy} stroke={OL} strokeWidth={4} />
        <line x1={gx + gw * 0.25} y1={gy - 340} x2={gx + gw * 0.25} y2={gy} stroke={C.cue} strokeWidth={3} strokeDasharray="8 8" />
        <line x1={gx + gw * 0.7} y1={gy - 340} x2={gx + gw * 0.7} y2={gy} stroke={C.reward} strokeWidth={3} strokeDasharray="8 8" />
        <path d={curve()} fill="none" stroke={ant > 0.5 ? C.crave : C.reward} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
        <text x={gx + gw * 0.25} y={gy + 44} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.cue} textAnchor="middle">
          сигнал
        </text>
        <text x={gx + gw * 0.7} y={gy + 44} fontFamily={FONT} fontWeight={800} fontSize={26} fill={C.reward} textAnchor="middle">
          награда
        </text>
        <text x={gx + gw / 2} y={gy - 340} fontFamily={HEAVY} fontWeight={800} fontSize={30} fill={C.ink} textAnchor="middle">
          {miss > 0.5 ? S(p.missText, "награды нет — разочарование") : ant > 0.5 ? S(p.antText, "всплеск — уже при сигнале") : S(p.rewText, "всплеск — при награде")}
        </text>
      </g>
      {S(p.caption) && (
        <Appear t={t} at={at(ctx, N(p.captionBeat, 2)) + 0.3} x={Ar.cx} y={130}>
          <Label x={0} y={0} text={S(p.caption)} size={32} bg={C.craveSoft} />
        </Appear>
      )}
    </Drift>
  );
};

// ── Товары из примеров книги (без логотипов и упаковок):
// mode «tooth» — зуб, мутная плёнка и «покалывание» свежести;
// mode «room» — комната, волны запаха, баллончик; в конце уборки — блёстки-награда ──
export const Product: React.FC<VisualProps<P>> = (ctx) => {
  const { t, dur, p } = ctx;
  const Ar = area(p.host);
  const mode = S(p.mode, "tooth");
  const b1 = at(ctx, N(p.b1, 1));
  const b2 = at(ctx, N(p.b2, 2));
  const k1 = ramp(t, b1, 0.8);
  const k2 = ramp(t, b2, 0.8);
  const cx = Ar.cx;
  if (mode === "tooth") {
    return (
      <Drift t={t} dur={dur} cx={cx} amount={0.035}>
        <g transform={`translate(${cx} 470) scale(1.3)`} opacity={ramp(t, 0.1, 0.6)}>
          <path d="M -140 -120 Q -150 -200 -60 -200 Q 0 -180 60 -200 Q 150 -200 140 -120 Q 130 -20 100 60 Q 80 180 40 200 Q 10 200 0 100 Q -10 200 -40 200 Q -80 180 -100 60 Q -130 -20 -140 -120 Z" fill="#fffdf6" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          {/* плёнка — исчезает после чистки */}
          <path d="M -130 -110 Q -135 -180 -60 -185 Q 0 -168 60 -185 Q 135 -180 128 -110 Q 120 -40 100 0 L -100 0 Q -122 -40 -130 -110 Z" fill="#e9d79a" opacity={0.55 * (1 - k1)} />
          {/* покалывание свежести */}
          {k2 > 0 &&
            Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2 + t * 0.6;
              const r = 230 + Math.sin(t * 5 + i) * 18;
              return (
                <g key={i} transform={`translate(${Math.cos(a) * r} ${Math.sin(a) * r * 0.75}) rotate(${t * 90 + i * 30})`} opacity={k2}>
                  <path d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill={C.routine} />
                </g>
              );
            })}
        </g>
        <Appear t={t} at={0.4} x={Ar.x0 + 250} y={200}>
          <Label x={0} y={0} text={S(p.l0, "плёнка на зубах")} size={34} bg={C.cueSoft} />
        </Appear>
        {k1 > 0 && (
          <Appear t={t} at={b1} x={Ar.x1 - 230} y={300}>
            <Label x={0} y={0} text={S(p.l1, "чистка — действие")} size={34} bg={C.routineSoft} />
          </Appear>
        )}
        {k2 > 0 && (
          <Appear t={t} at={b2} x={Ar.x1 - 250} y={700}>
            <Label x={0} y={0} text={S(p.l2, "покалывание —\nзнак «сработало»")} size={34} bg={C.craveSoft} />
          </Appear>
        )}
      </Drift>
    );
  }
  // комната: запах, баллончик, уборка
  const smell = 1 - k1;
  return (
    <Drift t={t} dur={dur} cx={cx} amount={0.035}>
      <g opacity={ramp(t, 0.1, 0.6)}>
        <rect x={cx - 560} y={180} width={1120} height={640} rx={36} fill="#fff9ee" stroke={OL} strokeWidth={6} />
        <rect x={cx - 560} y={680} width={1120} height={140} rx={0} fill="#ead9bf" opacity={0.7} />
        <rect x={cx - 460} y={520} width={360} height={170} rx={30} fill={C.routineSoft} stroke={OL} strokeWidth={5} />
        <rect x={cx + 260} y={250} width={220} height={180} rx={14} fill="#dff0fb" stroke={OL} strokeWidth={5} />
        {/* волны запаха — к ним «привыкают» и перестают замечать */}
        {smell > 0 &&
          [0, 1, 2].map((i) => (
            <path key={i} d={`M ${cx - 380 + i * 120} 500 q 30 -40 0 -80 q -30 -40 0 -80`} fill="none" stroke={C.sage} strokeWidth={10} strokeLinecap="round" opacity={smell * (0.4 + 0.3 * Math.sin(t * 2 + i))} transform={`translate(0 ${-((t * 20 + i * 30) % 60)})`} />
          ))}
        {/* уборка — шаги, в конце блёстки */}
        {k1 > 0 && (
          <g opacity={k1}>
            <g transform={`translate(${cx + 100} 600) rotate(${Math.sin(t * 4) * 10})`}>
              <rect x={-30} y={-90} width={60} height={110} rx={14} fill={C.tealSoft} stroke={OL} strokeWidth={4} />
              <rect x={-14} y={-120} width={28} height={30} rx={6} fill={C.teal} stroke={OL} strokeWidth={3} />
            </g>
          </g>
        )}
        {k2 > 0 &&
          Array.from({ length: 16 }, (_, i) => {
            const x = cx - 420 + ((i * 137) % 840);
            const y = 260 + ((i * 89) % 380);
            const s = 0.6 + 0.4 * Math.sin(t * 4 + i);
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${s * k2})`}>
                <path d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill={C.reward} stroke={OL} strokeWidth={1.5} />
              </g>
            );
          })}
      </g>
      <Appear t={t} at={0.5} x={cx} y={120}>
        <Label x={0} y={0} text={S(p.l0, "запах, к которому привыкли")} size={34} bg={C.white} />
      </Appear>
      {k1 > 0 && (
        <Appear t={t} at={b1} x={cx - 300} y={765}>
          <Label x={0} y={0} text={S(p.l1, "уборка")} size={34} bg={C.routineSoft} />
        </Appear>
      )}
      {k2 > 0 && (
        <Appear t={t} at={b2} x={cx + 300} y={765}>
          <Label x={0} y={0} text={S(p.l2, "свежий запах = награда")} size={34} bg={C.rewardSoft} />
        </Appear>
      )}
    </Drift>
  );
};

export { Arrow };
