// Часть «Гнев и обида»: собрание и критика (вымышленный эпизод), «созданы для
// совместной работы» (Книга II), не уподобляться обидчику (VI), правила XI книги,
// доброжелательность непобедима, весы «права ли критика», взгляд на себя, изумруд и родник.
import React from "react";
import { Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Big, Emerald, Hero, OL, Person, QuoteCard, Spring } from "./draw";

type VP = VisualProps<{ host?: string }>;

// экран с графиком/слайдом
const Screen: React.FC<{ x: number; y: number; s?: number; t: number; n?: number; off?: number }> = ({ x, y, s = 1, t, n = 1, off = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-240} y={-160} width={480} height={300} rx={14} fill={C.ink} stroke={OL} strokeWidth={6} />
    <rect x={-224} y={-144} width={448} height={268} rx={8} fill={off > 0.5 ? "#2a2f3c" : "#f4f9ff"} />
    {off <= 0.5 &&
      Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={-200 + (i % 4) * 104} y={-120 + Math.floor(i / 4) * 64} width={92} height={50} rx={6} fill={[R.tealSoft, R.terracottaSoft, R.oliveSoft, "#e3dcff"][i % 4]} stroke={OL} strokeWidth={2} />
      ))}
    {off <= 0.5 && n <= 1 && <path d={`M -190 90 L -100 ${20 + Math.sin(t) * 10} L 0 50 L 100 -40 L 190 -80`} stroke={C.green} strokeWidth={10} fill="none" />}
    <line x1={0} y1={140} x2={0} y2={210} stroke={OL} strokeWidth={8} />
  </g>
);

// ── a01: собрание, коллега указывает «Это провал», герой краснеет ──
export const MeetingCritic: React.FC<VP> = (c) => {
  const { t } = c;
  const say = pop(t, at(c, 0.55));
  const blush = ramp(t, at(c, 1), 0.6);
  const reply = ramp(t, at(c, 1.3), 0.6);
  return (
    <g>
      <Screen x={960} y={340} s={1} t={t} n={12} />
      <rect x={520} y={640} width={880} height={40} rx={14} fill="#c98b4a" stroke={OL} strokeWidth={5} />
      {[620, 780, 1140, 1300].map((x, i) => (
        <Person key={i} x={x} y={640} s={0.85} color={[R.olive, C.skyDeep, R.purple, R.grey][i]} t={t + i} />
      ))}
      <Person x={1470} y={660} s={1} color={C.coral} t={t} arms={say > 0 ? 1 : 0} />
      <Hero x={460} y={760} s={0.4} t={t} pose={blush > 0 ? "shock" : "present"} mood={blush > 0 ? "shock" : "happy"} />
      {blush > 0 && (
        <g opacity={blush}>
          <ellipse cx={420} cy={590} rx={22} ry={12} fill={C.red} opacity={0.6} />
          <ellipse cx={500} cy={590} rx={22} ry={12} fill={C.red} opacity={0.6} />
        </g>
      )}
      {say > 0 && (
        <g transform={`translate(1470 370) scale(${say})`}>
          <path d="M -200 -70 Q -200 -110 -160 -110 L 160 -110 Q 200 -110 200 -70 L 200 20 Q 200 60 160 60 L 60 60 L 20 110 L 20 60 L -160 60 Q -200 60 -200 20 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-8} size={46} weight={900} color={C.red}>
            «Это провал»
          </Txt>
        </g>
      )}
      {reply > 0 && (
        <g transform={`translate(460 330) scale(${reply})`}>
          <circle r={90} fill="#fff" stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + t * 2;
            return <path key={i} d={`M ${Math.cos(a) * 40} ${Math.sin(a) * 40} L ${Math.cos(a) * 70} ${Math.sin(a) * 70}`} stroke={C.red} strokeWidth={10} strokeLinecap="round" />;
          })}
          <Txt x={0} y={16} size={48} weight={900} color={C.red}>
            !#@
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── a02: руки, ноги, веки, челюсти — пары работают вместе ──
export const HandsTogether: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const why = ramp(t, at(c, 1), 0.6);
  const pairs = ramp(t, at(c, 2), 0.6);
  const quote = ramp(t, at(c, 3), 0.6);
  const clap = Math.abs(Math.sin(t * 3));
  return (
    <g>
      <g opacity={why * (1 - pairs)}>
        <Person x={cx - 220} y={600} s={1.4} color={C.coral} t={t} />
        <g transform={`translate(${cx - 220} 330)`}>
          <circle r={50} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={0} y={18} size={52} weight={900} color={C.inkSoft}>
            ?
          </Txt>
        </g>
        <Txt x={cx + 160} y={420} size={40} weight={900}>
          не знают,
        </Txt>
        <Txt x={cx + 160} y={480} size={40} weight={900}>
          что есть добро
        </Txt>
        <Tag x={cx + 160} y={580} text="но всё равно — родня" size={32} color={C.yellow} />
      </g>
      {pairs > 0 && (
        <g opacity={pairs * (1 - quote * 0.8)}>
          <g transform={`translate(${cx - 300} 400)`}>
            <g transform={`translate(${-20 - 30 * (1 - clap)} 0) rotate(-12)`}>
              <rect x={-40} y={-80} width={80} height={140} rx={36} fill="#fff" stroke={OL} strokeWidth={5} />
            </g>
            <g transform={`translate(${20 + 30 * (1 - clap)} 0) rotate(12)`}>
              <rect x={-40} y={-80} width={80} height={140} rx={36} fill="#fff" stroke={OL} strokeWidth={5} />
            </g>
            <Txt x={0} y={150} size={30} weight={900}>
              руки
            </Txt>
          </g>
          <g transform={`translate(${cx} 400)`}>
            <path d={`M -90 ${-10 - 30 * clap} Q 0 ${-80 - 30 * clap} 90 ${-10 - 30 * clap} Z`} fill="#ffb3b3" stroke={OL} strokeWidth={5} />
            <path d={`M -90 ${10 + 30 * clap} Q 0 ${80 + 30 * clap} 90 ${10 + 30 * clap} Z`} fill="#ffb3b3" stroke={OL} strokeWidth={5} />
            {[-60, -20, 20, 60].map((dx) => (
              <rect key={dx} x={dx - 12} y={-12 - 30 * clap} width={24} height={20} fill="#fff" stroke={OL} strokeWidth={2} />
            ))}
            <Txt x={0} y={150} size={30} weight={900}>
              челюсти
            </Txt>
          </g>
          <g transform={`translate(${cx + 300} 400)`}>
            {[-1, 1].map((sd) => (
              <g key={sd} transform={`translate(${sd * 50} ${sd > 0 ? 20 * Math.sin(t * 4) : -20 * Math.sin(t * 4)})`}>
                <path d="M -18 -80 L -18 40 L 20 50" stroke={OL} strokeWidth={14} fill="none" strokeLinecap="round" />
              </g>
            ))}
            <Txt x={0} y={150} size={30} weight={900}>
              ноги
            </Txt>
          </g>
          <Big x={cx} y={700} text="созданы для совместной работы" size={44} />
        </g>
      )}
      <QuoteCard x={cx} y={520} w={880} k={quote} text={"Люди рождены друг для друга.\nПоэтому или вразумляй,\nили же терпи."} refText="Книга VIII" size={44} />
    </g>
  );
};

// ── a03: зеркало — грубость в ответ удваивает грубиянов; лицо, искажённое гневом ──
export const MirrorAnger: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const two = ramp(t, at(c, 1), 0.6);
  const face = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <QuoteCard x={cx} y={150} w={900} k={ramp(t, 0.2, 0.6) * (1 - face)} text={"Лучший способ оборониться от обиды –\nэто не уподобляться обидчику."} refText="Книга VI" size={40} />
      {two > 0 && (
        <g opacity={two * (1 - face)}>
          <g transform={`translate(${cx - 260} 640)`}>
            <Person x={0} y={0} s={1.3} color={C.coral} t={t} arms={1} />
            <Tag x={0} y={-230} text="грубиян" size={30} color="#ffd3c2" />
          </g>
          <g transform={`translate(${cx + 40} 640)`} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2))}>
            <Person x={0} y={0} s={1.3} color={C.coral} t={t} arms={1} />
            <Tag x={0} y={-230} text="грубиян №2?" size={30} color="#ffd3c2" />
            <Cross x={0} y={-90} s={140} k={ramp(t, at(c, 1.5), 0.5)} />
          </g>
          <g transform={`translate(${cx + 300} 660)`}>
            <Hero x={0} y={0} s={0.34} t={t} pose="hush" mood="calm" />
          </g>
        </g>
      )}
      {face > 0 && (
        <g opacity={face}>
          {[0, 1].map((i) => {
            const angry = i === 1 ? clamp01(Math.sin(t * 1.4) * 1.5) : 0;
            return (
              <g key={i} transform={`translate(${cx + (i ? 220 : -220)} 460)`}>
                <circle r={150} fill="#ffd9b0" stroke={OL} strokeWidth={6} />
                <path d={`M -70 ${-40 - 20 * angry} L -30 ${-30 + 10 * angry} M 70 ${-40 - 20 * angry} L 30 ${-30 + 10 * angry}`} stroke={OL} strokeWidth={8} strokeLinecap="round" />
                <circle cx={-50} cy={0} r={10} fill={OL} />
                <circle cx={50} cy={0} r={10} fill={OL} />
                <path d={angry > 0.3 ? "M -50 80 Q 0 40 50 80" : "M -50 60 Q 0 100 50 60"} stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
                {i === 1 && <circle r={150} fill={C.red} opacity={0.25 * angry} />}
                <Txt x={0} y={220} size={30} weight={900}>
                  {i ? "в гневе" : "спокойно"}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── a04: правила XI книги — список появляется по репликам ──
export const RulesList: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = [
    "ошибаются против воли",
    "я и сам ошибаюсь",
    "«чужая душа – потемки»",
    "гнев тяжелее причины",
  ];
  const head = pop(t, at(c, 0.2));
  return (
    <g>
      <g transform={`translate(${cx} 150) scale(${head})`}>
        <Panel x={-330} y={-50} w={660} h={96} r={48} fill={R.parchment} />
        <Txt x={0} y={14} size={38} weight={900}>
          если меня обидели…
        </Txt>
      </g>
      {items.map((it, i) => {
        const a = at(c, i + 1);
        const k = pop(t, a);
        if (k <= 0) return null;
        const active = t >= a && (i === items.length - 1 || t < at(c, i + 2));
        return (
          <g key={i} transform={`translate(${cx - 380 + (1 - k) * 60} ${260 + i * 140})`} opacity={clamp01(k * 1.5)}>
            <Panel x={0} y={0} w={760} h={110} r={55} fill={active ? C.yellow : "#ffffffdd"} />
            <circle cx={55} cy={55} r={40} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={55} y={70} size={40} weight={900}>
              {String(i + 1)}
            </Txt>
            <Txt x={120} y={70} size={38} anchor="start">
              {it}
            </Txt>
          </g>
        );
      })}
      {t > at(c, 3) && t < at(c, 4) && (
        <g transform={`translate(${cx + 330} 560)`} opacity={ramp(t, at(c, 3.2), 0.4)}>
          <circle r={60} fill="#2a2f3c" />
          <circle cx={-16} cy={-8} r={8} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 3)} />
          <circle cx={16} cy={-8} r={8} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 3)} />
        </g>
      )}
    </g>
  );
};

// ── a05: щит доброжелательности: стрелы-колкости отскакивают и превращаются в цветы ──
export const KindShield: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = pop(t, 0.3);
  const calm = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      <g transform={`translate(${cx - 120} 480) scale(${k})`}>
        <path d="M 0 -200 Q 150 -170 160 -120 Q 160 80 0 200 Q -160 80 -160 -120 Q -150 -170 0 -200 Z" fill="#fff6d0" stroke={C.yellowDeep} strokeWidth={10} />
        <path d="M 0 -60 C -30 -110 -110 -80 -80 -20 C -60 20 0 50 0 70 C 0 50 60 20 80 -20 C 110 -80 30 -110 0 -60 Z" fill={C.coral} stroke={OL} strokeWidth={5} />
        <Txt x={0} y={150} size={28} weight={900}>
          искренне, не напоказ
        </Txt>
      </g>
      {[0, 1, 2].map((i) => {
        const ph = ((t - 0.6 + i * 0.8) % 2.4) / 2.4;
        if (t < 0.6 + i * 0.3) return null;
        const hit = ph > 0.5;
        const x = hit ? cx - 120 + 170 + (ph - 0.5) * 380 : cx + 520 - ph * 2 * 470;
        const y = 380 + i * 100 + (hit ? -(ph - 0.5) * 300 : 0);
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            {hit ? (
              <g opacity={1 - (ph - 0.5) * 2}>
                {[0, 1, 2, 3, 4].map((p) => (
                  <ellipse key={p} cx={Math.cos((p / 5) * 6.28) * 16} cy={Math.sin((p / 5) * 6.28) * 16} rx={12} ry={8} fill={[C.yellow, C.coral, R.purple][i]} transform={`rotate(${p * 72})`} />
                ))}
                <circle r={9} fill={C.yellowDeep} />
              </g>
            ) : (
              <g>
                <line x1={0} y1={0} x2={90} y2={0} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
                <path d="M 0 0 L 24 -14 L 24 14 Z" fill={C.red} />
              </g>
            )}
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.6)} x={cx + 120} y={150}>
        <Big x={0} y={0} text="«нечто неодолимое»" size={54} serif />
      </Pop>
      {calm > 0 && (
        <g transform={`translate(${cx} 790) scale(${calm})`}>
          <Panel x={-360} y={-46} w={720} h={92} r={46} fill={C.yellow} />
          <Txt x={0} y={14} size={36} weight={900}>
            ближе к спокойствию — ближе к силе
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── a06: весы — «грубость» и «правда» в критике; правда забирается себе ──
export const CriticScale: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, at(c, 0.3), 0.6);
  const truth = ramp(t, at(c, 1), 0.6);
  const free = ramp(t, at(c, 2), 0.6);
  const take = ramp(t, at(c, 3.3), 0.8);
  const tilt = -10 * truth + 4 * Math.sin(t * 1.5) * (1 - truth);
  return (
    <g opacity={k}>
      <rect x={cx - 14} y={340} width={28} height={420} fill={C.brown} />
      <rect x={cx - 120} y={750} width={240} height={30} rx={10} fill={C.brown} />
      <g transform={`translate(${cx} 340) rotate(${tilt})`}>
        <rect x={-380} y={-10} width={760} height={20} rx={10} fill={C.brown} />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 360} 0) rotate(${-tilt})`}>
            <line x1={-60} y1={0} x2={-90} y2={140} stroke={OL} strokeWidth={3} />
            <line x1={60} y1={0} x2={90} y2={140} stroke={OL} strokeWidth={3} />
            <path d="M -110 140 L 110 140 Q 90 190 0 190 Q -90 190 -110 140 Z" fill={R.marbleShade} stroke={OL} strokeWidth={5} />
            {sd < 0 ? (
              <g transform="translate(0 110)">
                <Tag x={0} y={0} text="грубый тон" size={28} color="#ffd3c2" />
              </g>
            ) : (
              truth > 0 &&
              take < 1 && (
                <g transform={`translate(${take * -420} ${110 + take * 300}) scale(${truth})`}>
                  <Tag x={0} y={0} text="слайдов многовато" size={28} color={C.yellow} />
                </g>
              )
            )}
          </g>
        ))}
      </g>
      {free > 0 && (
        <g transform={`translate(${cx} 160) scale(${free})`}>
          <Tag x={0} y={0} text="изменить мнение ≠ потерять свободу" size={32} color="#fff" />
        </g>
      )}
      {take > 0 && <Hero x={cx - 420} y={860} s={0.3} t={t} pose="cheer" mood="joy" />}
    </g>
  );
};

// ── a07: лупа оборачивается на себя; «Это его дело» ──
export const LookInside: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const turn = ramp(t, at(c, 0.4), 1);
  const his = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={1 - his * 0.8}>
        <Person x={cx + 260} y={640} s={1.3} color={C.coral} t={t} />
        <Hero x={cx - 260} y={700} s={0.4} t={t} pose="think" mood="think" />
        <g transform={`translate(${cx + 260 * (1 - 2 * turn) * 0.5} 380) rotate(${180 * turn})`}>
          <line x1={42} y1={42} x2={100} y2={100} stroke={C.brown} strokeWidth={22} strokeLinecap="round" />
          <circle r={60} fill="#eaf6ff" fillOpacity={0.6} stroke={OL} strokeWidth={10} />
        </g>
        <Pop t={t} at={at(c, 0.6)} x={cx} y={160}>
          <Tag x={0} y={0} text="«оглянись на себя»" size={36} color={C.yellow} />
        </Pop>
      </g>
      {his > 0 && (
        <g opacity={his}>
          <g transform={`translate(${cx - 230} 450)`}>
            <circle r={150} fill="#e7eef8" stroke={R.grey} strokeWidth={6} strokeDasharray="16 12" />
            <Txt x={0} y={-10} size={30} weight={900}>
              его презрение
            </Txt>
            <Txt x={0} y={40} size={30} color={C.inkSoft}>
              «Это его дело»
            </Txt>
          </g>
          <g transform={`translate(${cx + 230} 450)`}>
            <circle r={150} fill="#fff6d0" stroke={C.yellowDeep} strokeWidth={8} />
            <Txt x={0} y={-10} size={30} weight={900}>
              моё дело:
            </Txt>
            <Txt x={0} y={40} size={30} weight={900}>
              не давать повода
            </Txt>
            <Check x={0} y={100} s={40} k={ramp(t, at(c, 1.5), 0.4)} />
          </g>
        </g>
      )}
    </g>
  );
};

// ── a08: изумруд в шуме слов; родник смывает грязь ──
export const EmeraldSpring: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const em = ramp(t, 0.2, 0.6) * (1 - ramp(t, at(c, 1), 0.6));
  const sp = ramp(t, at(c, 1), 0.6);
  const throwK = clamp01((t - at(c, 1.25)) / 0.8);
  const dirt = throwK * (1 - clamp01((t - at(c, 1.25) - 1) / 2.5));
  return (
    <g>
      {em > 0 && (
        <g opacity={em}>
          <Emerald x={cx} y={460} s={1.6 + 0.05 * Math.sin(t * 2)} glint={0.6 + 0.4 * Math.sin(t * 3)} />
          {["скучно!", "не то!", "фу", "провал", "ха"].map((w, i) => {
            const a = (i / 5) * Math.PI * 2 + t * 0.5;
            return (
              <g key={w} transform={`translate(${cx + Math.cos(a) * 380} ${460 + Math.sin(a) * 230})`} opacity={0.7}>
                <Tag x={0} y={0} text={w} size={26} color="#fff" />
              </g>
            );
          })}
          <Pop t={t} at={at(c, 0.4)} x={cx} y={780}>
            <Tag x={0} y={0} text="«остаться изумрудом»" size={34} color={C.yellow} />
          </Pop>
        </g>
      )}
      {sp > 0 && (
        <g opacity={sp}>
          <Spring x={cx} y={600} s={1.4} t={t} dirt={dirt} />
          {throwK > 0 && throwK < 1 && (
            <circle cx={cx + 420 - throwK * 440} cy={300 + throwK * 280 - Math.sin(throwK * Math.PI) * 120} r={22} fill="#7a5a2a" stroke={OL} strokeWidth={3} />
          )}
          <g transform={`translate(${cx} 230)`}>
            <Tag x={-240} y={0} text="родник" size={34} color={R.tealSoft} />
            <Txt x={0} y={14} size={36} weight={900}>
              или
            </Txt>
            <Tag x={240} y={0} text="болото?" size={34} color="#d9cfa8" />
          </g>
        </g>
      )}
    </g>
  );
};
