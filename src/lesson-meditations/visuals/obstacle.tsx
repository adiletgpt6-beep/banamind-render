// Часть «Препятствия»: сорванная презентация и своя ошибка (вымышленный эпизод),
// препятствие укажет путь (V, VIII), огонь и лампада (IV, X), горький огурец (VIII),
// вернуться к лекарству и «стать хорошим завтра» (V, VIII), хромой воин и стена (VII, X),
// борьба, а не танец, и левая рука на поводьях (VII, XII), «хотя бы на один шаг» (IX).
import React from "react";
import { Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Big, Bush, Cucumber, Fire, Hero, OL, OilLamp, Person, QuoteCard, Wall } from "./draw";

type VP = VisualProps<{ host?: string }>;

const Board: React.FC<{ x: number; y: number; s?: number; k?: number; t: number }> = ({ x, y, s = 1, k = 0, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-170} width={520} height={320} rx={14} fill="#fff" stroke={OL} strokeWidth={6} />
    <circle cx={-120} cy={-20} r={70} fill="none" stroke={C.skyDeep} strokeWidth={8} strokeDasharray={440} strokeDashoffset={440 * (1 - clamp01(k * 3))} />
    <path d="M -40 -20 L 60 -20" stroke={C.coral} strokeWidth={8} strokeDasharray={100} strokeDashoffset={100 * (1 - clamp01(k * 3 - 1))} />
    <path d="M 46 -34 L 64 -20 L 46 -6" stroke={C.coral} strokeWidth={8} fill="none" opacity={clamp01(k * 3 - 1.5)} />
    <rect x={80} y={-80} width={120} height={120} rx={10} fill="none" stroke={C.green} strokeWidth={8} strokeDasharray={480} strokeDashoffset={480 * (1 - clamp01(k * 3 - 2))} />
    {k > 0 && k < 1 && <circle cx={-120 + 320 * k} cy={60 + Math.sin(t * 9) * 4} r={8} fill={C.ink} />}
  </g>
);

// ── o01: проектор гаснет; ошибка в отчёте подсвечивается ──
export const PlanCrash: React.FC<VP> = (c) => {
  const { t } = c;
  const off = ramp(t, at(c, 0.7), 0.15);
  const err = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g transform="translate(980 360)">
        <rect x={-340} y={-200} width={680} height={400} rx={10} fill={off > 0.5 ? "#3a3f4c" : "#f4f9ff"} stroke={OL} strokeWidth={6} />
        {off < 0.5 && <path d="M -300 140 L -150 40 L 0 80 L 150 -60 L 300 -120" stroke={C.green} strokeWidth={12} fill="none" />}
        {off > 0.5 && (
          <Txt x={0} y={20} size={60} weight={900} color="#fff" opacity={0.3}>
            · · ·
          </Txt>
        )}
      </g>
      <g transform="translate(980 760)">
        <rect x={-90} y={-40} width={180} height={70} rx={12} fill={R.grey} stroke={OL} strokeWidth={5} />
        <circle cx={70} cy={-6} r={22} fill={off > 0.5 ? "#333" : "#fff7c4"} stroke={OL} strokeWidth={4} />
        {off < 0.5 && <path d="M 90 -6 L 400 -360 L 400 -360 L -40 -340 Z" fill="#fff7c4" opacity={0.25} />}
      </g>
      {off > 0 && t < at(c, 0.7) + 0.6 && (
        <Txt x={1200} y={700} size={60} weight={900} color={C.red}>
          щёлк!
        </Txt>
      )}
      <Hero x={500} y={820} s={0.38} t={t} pose={err > 0 ? "hush" : off > 0 ? "shock" : "present"} mood={err > 0 ? "confused" : off > 0 ? "shock" : "happy"} />
      {err > 0 && (
        <g transform={`translate(1500 520) scale(${err}) rotate(4)`}>
          <rect x={-170} y={-210} width={340} height={420} rx={12} fill="#fff" stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <line x1={-130} x2={60} y1={-150 + i * 60} y2={-150 + i * 60} stroke={R.grey} strokeWidth={6} />
              <Txt x={120} y={-140 + i * 60} size={28} weight={900} color={i === 3 ? C.red : C.ink}>
                {["120", "85", "40", "254", "18", "517"][i]}
              </Txt>
            </g>
          ))}
          <ellipse cx={120} cy={30} rx={60} ry={30} fill="none" stroke={C.red} strokeWidth={6} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
          <Tag x={0} y={-260} text="моя ошибка" size={30} color="#ffd3c2" />
        </g>
      )}
    </g>
  );
};

// ── o02: дорога, камень-препятствие; солнце/ветер/зверь; камень сам становится ступенькой ──
export const ObstacleWay: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const hind = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1), 0.6));
  const turn = ramp(t, at(c, 1.4), 1.2);
  const board = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g opacity={1 - board * 0.85}>
        <path d={`M ${cx - 520} 700 L ${cx + 520} 700`} stroke="#d9c9a3" strokeWidth={60} strokeLinecap="round" />
        <g transform={`translate(${cx} ${700 - 60 - turn * -10}) rotate(${turn * -90})`}>
          <path d="M -120 60 Q -140 -60 -40 -100 Q 60 -130 120 -40 Q 150 40 100 60 Z" fill={R.stone} stroke={OL} strokeWidth={6} />
        </g>
        {turn > 0.5 && <path d={`M ${cx - 140} 640 L ${cx - 60} 560 L ${cx + 60} 560 L ${cx + 140} 640`} stroke={C.yellowDeep} strokeWidth={10} fill="none" strokeDasharray="14 10" opacity={turn} />}
        <Hero x={cx - 300 + turn * 300} y={680 - Math.sin(turn * Math.PI) * 120 - (turn > 0.5 ? 0 : 0)} s={0.3} t={t} pose={turn > 0.5 ? "cheer" : "think"} mood={turn > 0.5 ? "joy" : "think"} />
        {hind > 0 && (
          <g opacity={hind}>
            {["солнце", "ветер", "дикий зверь"].map((w, i) => (
              <Tag key={w} x={cx - 360 + i * 360} y={300 + wob(t, i, 6)} text={w} size={30} color="#fff" />
            ))}
            <Txt x={cx} y={420} size={34} weight={900} color={C.inkSoft}>
              мешают делу — но не настрою
            </Txt>
          </g>
        )}
        <QuoteCard x={cx} y={150} w={900} k={ramp(t, at(c, 1.3), 0.6) * (1 - board)} text={"…то, что стояло на пути,\nсамо укажет путь."} refText="Книга V" size={44} />
      </g>
      {board > 0 && (
        <g opacity={board}>
          <Board x={cx} y={440} s={1.2} k={ramp(t, at(c, 2.2), 2.5)} t={t} />
          <Hero x={cx + 420} y={830} s={0.32} t={t} pose="point" mood="joy" />
          <Tag x={cx} y={780} text="нет проектора → есть маркер" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── o03: лампада гаснет от брошенной ветки, костёр разгорается выше ──
export const FireLamp: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ph = clamp01((t - at(c, 0.35)) / 2.2);
  const big = ramp(t, at(c, 0.6), 2);
  const no = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={1 - no * 0.6}>
        <OilLamp x={cx - 300} y={560} s={1.4} t={t} out={clamp01(ph * 2.5 - 0.6)} />
        <Fire x={cx + 280} y={680} s={1} t={t} k={0.5 + big * 0.6} />
        {[0, 1].map((i) => {
          const tx = i ? cx + 280 : cx - 220;
          const p = clamp01(ph * 2 - i * 0.4);
          if (p <= 0 || p >= 1) return null;
          return (
            <g key={i} transform={`translate(${tx + (1 - p) * (i ? 300 : -260)} ${200 + p * (i ? 380 : 260)}) rotate(${p * 200})`}>
              <rect x={-50} y={-10} width={100} height={20} rx={8} fill="#8a5a2b" stroke={OL} strokeWidth={3} />
            </g>
          );
        })}
        <Tag x={cx - 300} y={760} text="слабая лампада гаснет" size={28} color="#fff" />
        <Tag x={cx + 280} y={760} text="пламя вздымается выше" size={28} color={C.yellow} />
      </g>
      {no > 0 && (
        <g transform={`translate(${cx} 240) scale(${no})`}>
          <Panel x={-400} y={-56} w={800} h={110} r={55} fill={C.yellow} />
          <Txt x={0} y={14} size={42} weight={900}>
            «И не ссылайся на препятствия»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── o04: горький огурец летит в корзину, банан обходит колючий куст ──
export const CucumberThorns: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const toss = clamp01((t - at(c, 0.25)) / 1);
  const walk = clamp01((t - at(c, 0.55)) / 2.4);
  const why = ramp(t, at(c, 1), 0.6);
  const hx = cx - 420 + walk * 840;
  const hy = 760 - Math.sin(clamp01((walk - 0.3) / 0.4) * Math.PI) * 140;
  return (
    <g>
      <g transform={`translate(${cx - 300 + toss * 560} ${360 - Math.sin(toss * Math.PI) * 160 + toss * 160}) rotate(${toss * 540})`}>
        <Cucumber x={0} y={0} s={0.8} />
      </g>
      {toss < 0.2 && <Txt x={cx - 300} y={260} size={40} weight={900} color={C.greenDeep}>фу, горький!</Txt>}
      <g transform={`translate(${cx + 280} 600)`}>
        <path d="M -70 -40 L 70 -40 L 54 80 L -54 80 Z" fill="#c98b4a" stroke={OL} strokeWidth={5} />
        <line x1={-60} y1={0} x2={60} y2={0} stroke={OL} strokeWidth={3} />
      </g>
      <Bush x={cx} y={790} s={1.1} />
      <path d={`M ${cx - 420} 790 Q ${cx} 520 ${cx + 420} 790`} stroke={C.yellowDeep} strokeWidth={6} fill="none" strokeDasharray="12 12" opacity={0.6} />
      <Hero x={hx} y={hy} s={0.28} t={t} pose={walk > 0.9 ? "cheer" : "idle"} mood="happy" />
      {why > 0 && (
        <g opacity={why} transform={`translate(${cx} 170)`}>
          <Tag x={0} y={0} text="«зачем в мире горькие огурцы?!» — не важно" size={30} color="#fff" />
          <Cross x={330} y={-2} s={50} k={ramp(t, at(c, 1.3), 0.4)} />
        </g>
      )}
    </g>
  );
};

// ── o05: банан «срывается» с дорожки, возвращается, как к лекарству; «завтра» → «сегодня» ──
export const MedicineReturn: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const back = ramp(t, at(c, 0.5), 1.2);
  const tom = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2), 0.5));
  const rule = ramp(t, at(c, 2), 0.6) * (1 - ramp(t, at(c, 3), 0.5));
  const fix = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <g opacity={1 - Math.max(tom, rule, fix) * 0.85}>
        <path d={`M ${cx - 480} 620 L ${cx + 480} 620`} stroke={C.yellow} strokeWidth={30} strokeLinecap="round" />
        <Tag x={cx} y={700} text="мои правила" size={30} color="#fff" />
        <Hero x={cx - 100} y={620 - 0 + (1 - back) * 160} s={0.3} t={t} pose={back > 0.8 ? "cheer" : "shrug"} mood={back > 0.8 ? "joy" : "confused"} />
        <g transform={`translate(${cx + 260} 400) scale(${pop(t, at(c, 0.3))})`}>
          <rect x={-40} y={-80} width={80} height={140} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={-40} y={-20} width={80} height={44} fill={C.coral} />
          <rect x={-30} y={-106} width={60} height={30} rx={6} fill={R.grey} stroke={OL} strokeWidth={4} />
          <path d="M -12 2 h 24 M 0 -10 v 24" stroke="#fff" strokeWidth={6} />
          <Txt x={0} y={110} size={26} color={C.inkSoft}>
            как к лекарству
          </Txt>
        </g>
      </g>
      {tom > 0 && (
        <g opacity={tom}>
          <g transform={`translate(${cx - 230} 440)`}>
            <rect x={-170} y={-110} width={340} height={220} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-30} size={36} weight={900} color={C.inkSoft}>
              хорошим
            </Txt>
            <Txt x={0} y={40} size={52} weight={900} color={C.coral}>
              завтра
            </Txt>
            <Cross x={0} y={0} s={180} k={ramp(t, at(c, 1.5), 0.5)} />
          </g>
          <g transform={`translate(${cx + 230} 440) scale(${pop(t, at(c, 1.6))})`}>
            <rect x={-170} y={-110} width={340} height={220} rx={20} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-30} size={36} weight={900}>
              хорошим
            </Txt>
            <Txt x={0} y={40} size={52} weight={900} color={C.greenDeep}>
              сегодня
            </Txt>
          </g>
        </g>
      )}
      {rule > 0 && (
        <g opacity={rule}>
          {[
            { t: "исправить того, кто ошибся", y: 330 },
            { t: "не получается — исправить дело", y: 500 },
          ].map((r, i) => (
            <g key={i} transform={`translate(${cx} ${r.y}) scale(${pop(t, at(c, 2.1 + i * 0.4))})`}>
              <Panel x={-400} y={-56} w={800} h={110} r={55} fill={i ? R.oliveSoft : "#fff"} />
              <Txt x={0} y={14} size={36} weight={900}>
                {r.t}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {fix > 0 && (
        <g opacity={fix}>
          <g transform={`translate(${cx} 430)`}>
            <rect x={-200} y={-200} width={400} height={400} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
            <Txt x={-40} y={-20} size={56} weight={900} color={C.red} opacity={1 - ramp(t, at(c, 3.4), 0.5)}>
              254
            </Txt>
            <line x1={-110} y1={-36} x2={30} y2={-36} stroke={C.red} strokeWidth={8} opacity={ramp(t, at(c, 3.3), 0.4)} />
            <Txt x={80} y={60} size={56} weight={900} color={C.greenDeep} opacity={ramp(t, at(c, 3.5), 0.5)}>
              245
            </Txt>
            <Check x={120} y={140} s={40} k={ramp(t, at(c, 3.7), 0.4)} />
          </g>
          <Tag x={cx} y={130} text="«здесь я ошибся»" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── o06: хромой воин у стены, товарищ подсаживает ──
export const WallHelp: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const help = ramp(t, at(c, 0.5), 1);
  const climb = ramp(t, at(c, 0.8), 1.6);
  const advice = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={1 - advice * 0.94}>
        <Wall x={cx + 180} y={800} s={1} w={460} h={420} />
        <g transform={`translate(${cx - 140 + climb * 150} ${800 - climb * 380})`}>
          <Person x={0} y={0} s={1.2} color={R.terracotta} t={t} arms={climb > 0 ? 1 : 0} />
          <rect x={-30} y={-10} width={14} height={40} fill="#fff" stroke={OL} strokeWidth={3} />
        </g>
        {help > 0 && (
          <g transform={`translate(${cx - 360 + help * 180} 800)`} opacity={help}>
            <Person x={0} y={0} s={1.2} color={R.olive} t={t} arms={1} />
          </g>
        )}
        <QuoteCard x={cx - 120} y={110} w={800} k={pop(t, at(c, 0.2))} text={"Не стыдись прибегать\nк помощи других."} refText="Книга VII" size={40} />
      </g>
      {advice > 0 && (
        <g opacity={advice}>
          <Hero x={cx - 260} y={780} s={0.34} t={t} pose="ask" mood="wonder" />
          {[0, 1, 2].map((i) => (
            <Person key={i} x={cx + 120 + i * 150} y={760} s={1} color={[C.skyDeep, R.purple, R.olive][i]} t={t + i} />
          ))}
          <Tag x={cx + 270} y={480} text="посоветоваться с лучшими" size={32} color={C.yellow} />
          <Big x={cx} y={250} text="просить помощи — тоже сила" size={48} />
        </g>
      )}
    </g>
  );
};

// ── o07: танцор (всё по нотам) vs борец (готов к внезапному); левая рука и поводья ──
export const WrestlerDancer: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1), 0.6));
  const reins = ramp(t, at(c, 1), 0.6) * (1 - ramp(t, at(c, 2), 0.6));
  const box = ramp(t, at(c, 2), 0.6);
  const drop = clamp01((t - at(c, 2.5)) / 0.8);
  const sway = Math.sin(t * 3);
  const jolt = Math.sin(t * 1.3) > 0.85 ? 1 : 0;
  return (
    <g>
      {k > 0 && (
        <g opacity={k}>
          <g transform={`translate(${cx - 260} 640) rotate(${sway * 10})`}>
            <Person x={0} y={0} s={1.3} color="#ff8fb1" t={t} arms={0.5 + 0.5 * sway} />
            {[0, 1, 2].map((i) => (
              <Txt key={i} x={-90 + i * 90} y={-280 - Math.abs(Math.sin(t * 2 + i)) * 30} size={44} weight={900} color={R.purple}>
                ♪
              </Txt>
            ))}
            <Tag x={0} y={80} text="танец: по нотам" size={28} color="#fff" />
          </g>
          <g transform={`translate(${cx + 260 + jolt * 20} 640)`}>
            <Person x={0} y={0} s={1.3} color={C.skyDeep} t={t} arms={0.3} />
            <g transform={`translate(${-200 + jolt * 60} -60)`} opacity={jolt}>
              <Txt x={0} y={0} size={60} weight={900} color={C.red}>
                !
              </Txt>
            </g>
            <Tag x={0} y={80} text="борьба: к внезапному" size={28} color={C.yellow} />
          </g>
          <Pop t={t} at={at(c, 0.3)} x={cx} y={190}>
            <Big x={0} y={0} text="жизнь — скорее борьба" size={52} />
          </Pop>
        </g>
      )}
      {box > 0 && (
        <g opacity={box}>
          <g transform={`translate(${cx - 260} 600)`}>
            <Person x={0} y={0} s={1.3} color={R.terracotta} t={t} arms={0.4} />
            <g transform={`translate(${40 - drop * 20} ${-150 + drop * 150}) rotate(${drop * 120})`}>
              <rect x={-6} y={-90} width={12} height={110} rx={4} fill={R.greySoft} stroke={OL} strokeWidth={3} />
              <rect x={-24} y={16} width={48} height={10} rx={4} fill={C.brown} />
            </g>
            <Tag x={0} y={90} text="гладиатор: меч выпал" size={26} color="#ffd3c2" />
          </g>
          <g transform={`translate(${cx + 260} 600)`}>
            <Person x={0} y={0} s={1.3} color={C.skyDeep} t={t} arms={0.6} />
            {[-1, 1].map((sd) => (
              <circle key={sd} cx={sd * 46} cy={-150 + Math.sin(t * 6 + sd) * 6} r={20} fill="#fff" stroke={OL} strokeWidth={4} />
            ))}
            <Tag x={0} y={90} text="боец: руки всегда при себе" size={26} color={C.yellow} />
          </g>
          <Big x={cx} y={250} text="правила — как руки бойца" size={48} />
        </g>
      )}
      {reins > 0 && (
        <g opacity={reins}>
          <g transform={`translate(${cx} 470)`}>
            <path d="M -260 -40 Q 0 -140 260 -40" stroke={C.brown} strokeWidth={14} fill="none" />
            <g transform="translate(-200 30)">
              <path d="M -60 60 Q -70 -20 -20 -40 L 40 -40 Q 70 -20 60 60 Z" fill="#fff" stroke={OL} strokeWidth={6} />
              <Txt x={0} y={140} size={30} weight={900}>
                левая
              </Txt>
              <Txt x={0} y={180} size={26} color={C.greenDeep}>
                держит крепче
              </Txt>
            </g>
            <g transform="translate(200 30)" opacity={0.6}>
              <path d="M -60 60 Q -70 -20 -20 -40 L 40 -40 Q 70 -20 60 60 Z" fill="#fff" stroke={OL} strokeWidth={6} />
              <Txt x={0} y={140} size={30} weight={900}>
                правая
              </Txt>
            </g>
          </g>
          <Tag x={cx} y={200} text="потому что привыкла" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── o08: лестница из маленьких шагов; банан делает один шаг; клиент доволен ──
export const OneStep: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const steps = 6;
  const step = ramp(t, at(c, 0.3), 1);
  const note = ramp(t, at(c, 1), 0.6);
  const happy = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {Array.from({ length: steps }).map((_, i) => (
        <rect key={i} x={cx - 450 + i * 150} y={760 - i * 70} width={150} height={70 + i * 70} fill={i === 1 ? C.yellow : "#fff"} stroke={OL} strokeWidth={5} opacity={i <= 1 ? 1 : 0.45} />
      ))}
      <Hero x={cx - 375 + step * 150} y={760 - step * 70} s={0.26} t={t} pose={step > 0.9 ? "cheer" : "idle"} mood="joy" />
      <QuoteCard x={cx + 120} y={140} w={720} k={pop(t, at(c, 0.5))} text={"…хотя бы\nна один шаг."} refText="Книга IX" size={48} />
      {note > 0 && <Tag x={cx - 250} y={470} text="Котляревский: чужд утопий" size={28} color="#fff" />}
      {happy > 0 && (
        <g transform={`translate(${cx + 560} 660) scale(${happy})`}>
          <Person x={0} y={100} s={1.1} color={R.olive} t={t} arms={1} />
          <Txt x={0} y={-150} size={40} weight={900} color={C.greenDeep}>
            понятно!
          </Txt>
        </g>
      )}
    </g>
  );
};
