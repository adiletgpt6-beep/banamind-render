// Часть «Быть первым» (законы 1–3): первый против лучшего, имя-нарицательное
// и собачье мороженое, Амелия Эрхарт, «Белоснежка и семь гномов», категория
// вместо бренда, пекарня «Рассвет» в новой категории, Altair и простое имя,
// замок на сложившемся мнении.
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, FONT, Z } from "../theme";
import { OL, Plane } from "./draw";
import { Bakery, Bike, Clock, Computer, Head, Mainframe, MiniPC, Phone } from "./items";
import { Ocean } from "./intro";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ── Закон лидерства: пьедестал «первый» и «лучший» ──
export const FirstVsBest: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const title = pop(t, 0.2);
  const best = ramp(t, at(c, 1), 0.6);
  const swap = ramp(t, at(c, 2), 0.8);
  const leaders = ramp(t, at(c, 3), 0.4);
  const base = 720;
  return (
    <g>
      <g transform={`translate(${cx} 190) scale(${title})`}>
        <Txt x={0} y={0} size={56} weight={900}>
          лучше быть первым,
        </Txt>
        <Txt x={0} y={70} size={56} weight={900} color={C.coral}>
          чем лучшим
        </Txt>
      </g>
      <g opacity={1 - leaders}>
        {/* «первый» и «лучший» меняются местами в головах */}
        <g transform={`translate(${cx - 200 + 0 * swap} 0)`}>
          <rect x={-120} y={base - 200 - 60 * swap} width={240} height={200 + 60 * swap} rx={12} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={base - 110 - 60 * swap} size={44} weight={900}>
            первый
          </Txt>
        </g>
        <g opacity={best}>
          <rect x={cx + 80} y={base - 200 + 80 * swap} width={240} height={200 - 80 * swap} rx={12} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
          <Txt x={cx + 200} y={base - 110 + 80 * swap} size={44} weight={900} color={C.inkSoft}>
            лучший
          </Txt>
          <g transform={`translate(${cx + 200} ${base - 260 + 80 * swap + wob(t, 3, 5)})`}>
            <path d="M 0 -40 L 10 -13 L 38 -13 L 16 5 L 24 32 L 0 16 L -24 32 L -16 5 L -38 -13 L -10 -13 Z" fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
          </g>
        </g>
        <Pop t={t} at={at(c, 2.3)} x={cx - 200} y={base - 330}>
          <Tag x={0} y={0} text="новая категория" size={32} color={C.white} />
        </Pop>
        <line x1={cx - 460} x2={cx + 460} y1={base} y2={base} stroke={OL} strokeWidth={6} />
      </g>
      {leaders > 0 &&
        [
          ["прокат авто", "Hertz", Z.tealSoft],
          ["компьютеры", "IBM", "#dfe8ff"],
          ["кола", "Coca-Cola", "#ffe0d6"],
        ].map(([cat, brand, col], i) => {
          const k = pop(t, at(c, 3.2 + i * 0.18));
          return (
            <g key={i} transform={`translate(${cx - 360 + i * 360} 520) scale(${k})`}>
              <Panel x={-160} y={-150} w={320} h={300} fill={col} />
              <Txt x={0} y={-80} size={32} color={C.inkSoft}>
                {cat}
              </Txt>
              <circle cx={0} cy={10} r={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={30} size={56} weight={900}>
                1
              </Txt>
              <Txt x={0} y={118} size={40} weight={900}>
                {brand}
              </Txt>
            </g>
          );
        })}
    </g>
  );
};

// ── Имя становится словом; собачье мороженое ──
export const Generic: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const part2 = ramp(t, at(c, 1), 0.5);
  const dog = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={1 - part2}>
        <Panel x={cx - 420} y={250} w={340} h={400} fill="#fff" />
        <rect x={cx - 380} y={300} width={260} height={150} rx={10} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
        <rect x={cx - 340} y={290 - 10 * Math.abs(Math.sin(t * 3))} width={180} height={20} fill="#fff" stroke={OL} strokeWidth={3} />
        <Txt x={cx - 250} y={540} size={30} color={C.inkSoft}>
          копир другой марки
        </Txt>
        <Pop t={t} at={at(c, 0.5)} x={cx + 200} y={360}>
          <rect x={-230} y={-80} width={460} height={160} rx={60} fill="#fff" stroke={OL} strokeWidth={5} />
          <path d="M -150 76 L -190 140 L -100 78 Z" fill="#fff" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
          <Txt x={0} y={-6} size={34}>
            «Как сделать
          </Txt>
          <Txt x={0} y={40} size={34} weight={900} color={C.coral}>
            копию Xerox?»
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 0.8)} x={cx + 200} y={600}>
          <Tag x={0} y={0} text="имя → обычное слово" size={36} color={C.yellow} />
        </Pop>
      </g>
      {part2 > 0 && (
        <g opacity={part2}>
          <Txt x={cx} y={190} size={50} weight={900}>
            первый ≠ всегда победитель
          </Txt>
          <Pop t={t} at={at(c, 1.3)} x={cx - 270} y={340}>
            <Tag x={0} y={0} text="слишком поздно" size={36} color={Z.greySoft} />
          </Pop>
          <Pop t={t} at={at(c, 1.6)} x={cx + 270} y={340}>
            <Tag x={0} y={0} text="никому не нужно" size={36} color={Z.greySoft} />
          </Pop>
          {dog > 0 && (
            <g transform={`translate(${cx} 640) scale(${dog})`}>
              {/* мороженое для собак */}
              <path d="M -40 -40 L 40 -40 L 0 80 Z" fill="#e0a868" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
              <circle cx={0} cy={-70} r={50} fill="#ffd9e6" stroke={OL} strokeWidth={5} />
              <path d="M -26 -86 q -22 -14 -30 6 q 10 16 30 4 M 26 -86 q 22 -14 30 6 q -10 16 -30 4" fill="#fff" stroke={OL} strokeWidth={4} />
              {/* собака довольна */}
              <g transform={`translate(-260 40) rotate(${wob(t, 1, 4)})`}>
                <ellipse cx={0} cy={0} rx={70} ry={44} fill="#d8a46b" stroke={OL} strokeWidth={5} />
                <circle cx={-70} cy={-40} r={40} fill="#d8a46b" stroke={OL} strokeWidth={5} />
                <ellipse cx={-96} cy={-60} rx={14} ry={30} fill="#a8692e" stroke={OL} strokeWidth={4} />
                <circle cx={-80} cy={-46} r={5} fill={OL} />
                <path d="M -98 -26 q 10 14 22 0" stroke={OL} strokeWidth={4} fill="none" />
                <path d={`M 66 -10 Q 100 ${-40 + Math.sin(t * 12) * 16} 110 -60`} stroke={OL} strokeWidth={9} fill="none" strokeLinecap="round" />
              </g>
              <Check x={-260} y={-120} s={50} k={ramp(t, at(c, 2.3), 0.4)} />
              {/* хозяин сомневается */}
              <g transform="translate(260 40)">
                <circle cy={-110} r={36} fill="#ffe1c4" stroke={OL} strokeWidth={5} />
                <path d="M -50 40 L -40 -60 L 40 -60 L 50 40 Z" fill={Z.teal} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
                <path d="M -12 -100 q 12 -8 24 0" stroke={OL} strokeWidth={4} fill="none" />
              </g>
              <Cross x={260} y={-200} s={70} k={ramp(t, at(c, 2.6), 0.4)} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// ── Закон категории: третий пилот — первая женщина ──
export const Earhart: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ocean = ramp(t, at(c, 1), 0.5);
  const fly = ramp(t, at(c, 1.15), Math.max(1, at(c, 1.7) - at(c, 1.15)));
  const relabel = ramp(t, at(c, 1.75), 0.5);
  return (
    <g>
      <g opacity={1 - ocean}>
        <Pop t={t} at={0.2} x={cx} y={260}>
          <Txt x={0} y={0} size={46} weight={900}>
            не первый в категории?
          </Txt>
        </Pop>
        <Pop t={t} at={at(c, 0.55)} x={cx} y={420}>
          <rect x={-330} y={-70} width={660} height={140} rx={70} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={16} size={46} weight={900}>
            создайте новую категорию
          </Txt>
        </Pop>
      </g>
      {ocean > 0 && (
        <g opacity={ocean}>
          <Ocean cx={cx} t={t} y={600} w={1000} />
          <Plane x={cx - 440 + 880 * fly} y={430 + Math.sin(t * 2) * 8} s={0.85} color="#ffe0ee" />
          <g transform={`translate(${cx} 230)`}>
            <g opacity={1 - relabel}>
              <Tag x={0} y={0} text="№3 · Амелия Эрхарт" size={40} color={Z.greySoft} />
            </g>
            {relabel > 0 && (
              <g transform={`scale(${0.7 + 0.3 * relabel})`} opacity={relabel}>
                <Tag x={0} y={0} text="№1 · первая женщина" size={44} color={C.yellow} />
              </g>
            )}
          </g>
          <line x1={cx - 230} x2={cx + 230} y1={232} y2={232} stroke={C.red} strokeWidth={6} opacity={relabel * 0} />
        </g>
      )}
    </g>
  );
};

// ── «Белоснежка и семь гномов», DEC и Dell ──
export const Dwarfs: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const crowd = ramp(t, 0.4, 0.8);
  const mini = pop(t, at(c, 1.4));
  const dell = pop(t, at(c, 2.3));
  const q = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - q}>
        <Mainframe x={cx - 420} y={560} s={1} t={t} color={C.sky} />
        <Txt x={cx - 420} y={610} size={34} weight={900}>
          IBM
        </Txt>
        {Array.from({ length: 7 }).map((_, i) => {
          const k = ramp(t, 0.4 + i * 0.12, 0.4) * crowd;
          return (
            <g key={i} opacity={k} transform={`translate(${cx - 240 + i * 66} ${560 + (1 - k) * 40})`}>
              <Mainframe x={0} y={0} s={0.42} t={t + i} />
            </g>
          );
        })}
        <Pop t={t} at={at(c, 0.6)} x={cx - 40} y={250}>
          <Tag x={0} y={0} text="«Белоснежка и семь гномов»" size={36} color={C.white} />
        </Pop>
        {mini > 0 && (
          <g transform={`translate(${cx + 330} 560) scale(${mini})`}>
            <circle cy={-60} r={130} fill={C.yellow} opacity={0.35} />
            <MiniPC x={0} y={0} s={1.1} t={t} />
            <Txt x={0} y={52} size={30} weight={900}>
              Digital Equipment
            </Txt>
            <Tag x={0} y={-200} text="№1 в мини" size={30} color={C.yellow} />
          </g>
        )}
        {dell > 0 && (
          <g transform={`translate(${cx + 330} 820) scale(${dell})`}>
            <Phone x={-90} y={0} s={0.6} t={t} ring={1} />
            <Computer x={60} y={10} s={0.45} t={t} />
            <Txt x={200} y={-20} size={30} weight={900} anchor="start">
              Dell
            </Txt>
          </g>
        )}
      </g>
      {q > 0 && (
        <g opacity={q}>
          <Panel x={cx - 500} y={280} w={1000} h={380} fill="#fff" />
          <g opacity={0.55}>
            <Txt x={cx} y={390} size={46} color={C.inkSoft}>
              «Чем мы лучше?»
            </Txt>
            <line x1={cx - 230} x2={cx + 230} y1={374} y2={374} stroke={C.red} strokeWidth={8 * ramp(t, at(c, 3.3), 0.4)} strokeLinecap="round" />
          </g>
          <g transform={`translate(${cx} 540) scale(${pop(t, at(c, 3.4))})`}>
            <Txt x={0} y={0} size={64} weight={900} color={C.coral}>
              «В чём мы первые?»
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

// ── Думайте категориями: щит у бренда, любопытство у категории ──
export const CategoryMind: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const right = ramp(t, at(c, 0.5), 0.6);
  const sell = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={1 - sell}>
        <Panel x={cx - 540} y={170} w={500} h={600} fill="#ffffffcc" />
        <Txt x={cx - 290} y={240} size={38} weight={900}>
          бренды
        </Txt>
        {["мы лучше!", "нет, мы!", "№1 по качеству!"].map((s, i) => (
          <Pop key={s} t={t} at={0.3 + i * 0.3} x={cx - 290 + (i - 1) * 110} y={330 + i * 70}>
            <Tag x={0} y={0} text={s} size={26} color={[C.coral, Z.purple, Z.teal][i]} textColor="#fff" />
          </Pop>
        ))}
        <g transform={`translate(${cx - 290} 680)`}>
          <path d="M 0 -110 L 80 -80 Q 80 20 0 60 Q -80 20 -80 -80 Z" fill={Z.greySoft} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={-10} size={30} weight={900}>
            защита
          </Txt>
        </g>
        <g opacity={right}>
          <Panel x={cx + 40} y={170} w={500} h={600} fill="#fff" stroke={C.yellowDeep} />
          <Txt x={cx + 290} y={240} size={38} weight={900}>
            новая категория
          </Txt>
          <g transform={`translate(${cx + 290} 470) scale(${0.9 + 0.1 * Math.sin(t * 2)})`}>
            <circle r={120} fill={C.yellow} opacity={0.35} />
            <Txt x={0} y={30} size={110} weight={900} color={C.yellowDeep}>
              ?!
            </Txt>
          </g>
          <Txt x={cx + 290} y={690} size={34} color={C.inkSoft}>
            «что нового?»
          </Txt>
        </g>
      </g>
      {sell > 0 && (
        <g opacity={sell}>
          <MiniPC x={cx - 200} y={600} s={1.4} t={t} />
          <Arrow x1={cx - 40} y1={480} x2={cx + 120} y2={480} k={ramp(t, at(c, 1.2), 0.5)} color={C.coral} w={12} />
          <Txt x={cx + 300} y={430} size={42} weight={900}>
            зачем нужен
          </Txt>
          <Txt x={cx + 300} y={490} size={42} weight={900} color={C.coral}>
            мини-компьютер
          </Txt>
          <Txt x={cx + 300} y={580} size={30} color={C.inkSoft}>
            а не «почему мы»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет»: новая категория «утренний хлеб с доставкой» ──
export const BakeryCategory: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ours = ramp(t, at(c, 1), 0.6);
  const ride = ramp(t, at(c, 1.4), Math.max(1, at(c, 1.95) - at(c, 1.4)));
  const note = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g transform={`translate(${cx - 300} 640)`}>
        <Bakery x={0} y={0} s={0.9} t={t} sign="Большая" color="#eef1f7" awning={Z.grey} />
        <Txt x={0} y={60} size={30} color={C.inkSoft}>
          «Большая пекарня»
        </Txt>
      </g>
      <Pop t={t} at={at(c, 0.5)} x={cx - 300} y={220}>
        <Tag x={0} y={0} text="«лучший хлеб» — занято" size={30} color={Z.greySoft} />
      </Pop>
      {ours > 0 && (
        <g opacity={ours}>
          <g transform={`translate(${cx + 260} 640)`}>
            <Bakery x={0} y={0} s={0.9} t={t} glow={1} />
          </g>
          <Clock x={cx + 470} y={240} s={0.8} h={6 + ride} m={(ride * 60) % 60} />
          <Bike x={cx - 40 + 300 * ride} y={830} s={0.6} t={t} />
          <Pop t={t} at={at(c, 1.6)} x={cx + 200} y={240}>
            <Tag x={0} y={0} text="горячий хлеб до 7:00" size={32} color={C.yellow} />
          </Pop>
        </g>
      )}
      <g transform={`translate(${cx} 160)`} opacity={note}>
        <Tag x={0} y={0} text="вымышленный пример BanaMind" size={28} color={C.white} />
      </g>
    </g>
  );
};

// ── Закон разума: Altair первым на рынке, IBM первой в сознании, простое имя Apple ──
export const AltairApple: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const altair = ramp(t, at(c, 1), 0.5);
  const gone = ramp(t, at(c, 1.6), 0.8);
  const ibm = ramp(t, at(c, 2), 0.5);
  const names = ramp(t, at(c, 3), 0.5);
  const pick = ramp(t, at(c, 3.8), 0.6);
  const list = ["Apple II", "Commodore Pet", "IMSAI 8080", "MITS Altair 8800", "TRS-80"];
  return (
    <g>
      <g opacity={1 - names}>
        <Pop t={t} at={0.2} x={cx} y={190}>
          <Txt x={0} y={0} size={46} weight={900}>
            первым в сознании &gt; первым на рынке
          </Txt>
        </Pop>
        <g opacity={altair * (1 - gone * 0.75)} transform={`translate(${cx - 270} ${620 + gone * 40})`}>
          <Computer x={0} y={0} s={1} t={t} label="Altair" />
          <Txt x={0} y={60} size={30} weight={900}>
            первый на рынке
          </Txt>
        </g>
        {gone > 0.5 && (
          <g transform={`translate(${cx - 270} 480) rotate(-10)`} opacity={gone}>
            <Tag x={0} y={0} text="продукта нет" size={34} color={C.red} textColor="#fff" />
          </g>
        )}
        {ibm > 0 && (
          <g opacity={ibm}>
            <Head x={cx + 270} y={600} s={1.1}>
              <g transform={`scale(${0.6 + 0.4 * ibm})`}>
                <Mainframe x={10} y={10} s={0.55} t={t} color={C.sky} />
              </g>
            </Head>
            <Txt x={cx + 270} y={800} size={30} weight={900}>
              IBM — первой в сознании
            </Txt>
          </g>
        )}
      </g>
      {names > 0 && (
        <g opacity={names}>
          <Txt x={cx} y={190} size={44} weight={900}>
            какое имя запомнить проще?
          </Txt>
          {list.map((n, i) => {
            const k = pop(t, at(c, 3.05 + i * 0.1));
            const isApple = i === 0;
            const s = isApple ? 1 + 0.25 * pick : 1 - 0.15 * pick;
            return (
              <g key={n} transform={`translate(${cx - 400 + (i % 3) * 400} ${330 + Math.floor(i / 3) * 200}) scale(${k * s})`} opacity={isApple ? 1 : 1 - 0.5 * pick}>
                <Panel x={-180} y={-60} w={360} h={120} r={60} fill={isApple && pick > 0 ? C.yellow : "#fff"} />
                <Txt x={0} y={14} size={n.length > 12 ? 30 : 38} weight={900}>
                  {n}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── Мнение почти не меняется: Xerox — «копир» в голове ──
export const MindLock: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const tries = ramp(t, at(c, 0.3), Math.max(1, at(c, 0.95) - at(c, 0.3)));
  const lock = pop(t, at(c, 1));
  return (
    <g>
      <Head x={cx - 120} y={600} s={1.3}>
        <rect x={-90} y={-100} width={180} height={100} rx={10} fill={Z.greySoft} stroke={OL} strokeWidth={5} />
        <rect x={-60} y={-112} width={120} height={18} fill="#fff" stroke={OL} strokeWidth={3} />
        <text x={0} y={-36} fontFamily={FONT} fontWeight={900} fontSize={30} textAnchor="middle" fill={C.ink}>
          копир
        </text>
      </Head>
      {lock > 0 && (
        <g transform={`translate(${cx - 120} 420) scale(${lock})`}>
          <rect x={-46} y={-20} width={92} height={74} rx={12} fill={C.yellowDeep} stroke={OL} strokeWidth={5} />
          <path d="M -28 -20 L -28 -46 A 28 28 0 0 1 28 -46 L 28 -20" fill="none" stroke={OL} strokeWidth={10} />
          <circle cy={14} r={9} fill={OL} />
        </g>
      )}
      {/* попытки «вставить» компьютер в голову отскакивают */}
      {[0, 1, 2].map((i) => {
        const ph = clamp01(tries * 3 - i);
        if (ph <= 0) return null;
        const bounce = ph < 0.6 ? ph / 0.6 : 1 - (ph - 0.6) / 0.4;
        return (
          <g key={i} transform={`translate(${cx + 420 - 260 * bounce} ${300 + i * 150})`} opacity={1 - Math.max(0, ph - 0.85) * 4}>
            <Computer x={0} y={60} s={0.45} t={t} />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 0.4)} x={cx + 400} y={200}>
        <Tag x={0} y={0} text="25 лет · 2 млрд $" size={32} color={C.white} />
      </Pop>
      <Pop t={t} at={at(c, 1.3)} x={cx + 120} y={830}>
        <Tag x={0} y={0} text="менять мнение — самое расточительное" size={30} color={C.yellow} />
      </Pop>
    </g>
  );
};

