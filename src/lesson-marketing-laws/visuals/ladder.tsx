// Часть «Лестница» (законы 7, 8, 9, 14): лестница проката и «Мы стараемся
// больше», правило семи и «не-кола», гонка двух лошадей, противоположность
// лидеру, противоположные атрибуты, своя лестница «Рассвета».
import React from "react";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, FONT, Z } from "../theme";
import { OL } from "./draw";
import { Bottle, Horse, LadderShape, Loaf, Mainframe, MiniPC } from "./items";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ступенька с маркой: y — позиция ступеньки
const Rung: React.FC<{ x: number; y: number; text: string; k: number; color?: string; size?: number }> = ({ x, y, text, k, color = "#fff", size = 34 }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x + (1 - k) * 60} ${y})`} opacity={clamp01(k * 1.5)}>
      <rect x={-150} y={-34} width={300} height={68} rx={34} fill={color} stroke={OL} strokeWidth={4} />
      <text x={0} y={size * 0.36} fontFamily={FONT} fontWeight={900} fontSize={size} textAnchor="middle" fill={C.ink}>
        {text}
      </text>
    </g>
  );

// ── Закон лестницы: Hertz–Avis–National и «Мы стараемся больше» ──
export const Ladder: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const lad = ramp(t, 0.2, 0.6);
  const rungs = [at(c, 1.2), at(c, 1.35), at(c, 1.5)];
  const doubt = ramp(t, at(c, 2), 0.5);
  const honest = ramp(t, at(c, 3), 0.5);
  const money = ramp(t, at(c, 3.6), 0.8);
  const lx = cx - 230;
  return (
    <g>
      <g opacity={lad}>
        <LadderShape x={lx} y={820} s={1} steps={4} h={620} w={300} />
        <Txt x={lx} y={170} size={34} weight={900}>
          прокат автомобилей
        </Txt>
        <Rung x={lx} y={260} text="Hertz" k={pop(t, rungs[0])} color={C.yellow} />
        <Rung x={lx} y={447} text={honest > 0 ? "Avis — №2" : "Avis"} k={pop(t, rungs[1])} color={honest > 0 ? Z.mint : "#fff"} />
        <Rung x={lx} y={633} text="National" k={pop(t, rungs[2])} />
      </g>
      <g transform={`translate(${cx + 290} 0)`}>
        {doubt > 0 && (
          <g opacity={doubt * (1 - honest)}>
            <Panel x={-230} y={300} w={460} h={140} r={40} fill="#fff" />
            <Txt x={0} y={360} size={32} weight={900}>
              «Лучший прокат!»
            </Txt>
            <Txt x={0} y={410} size={28} color={C.inkSoft}>
              — но вы же не наверху?
            </Txt>
            <Txt x={0} y={600} size={140} weight={900} color={C.coral} opacity={0.7 + 0.3 * Math.sin(t * 4)}>
              ?
            </Txt>
          </g>
        )}
        {honest > 0 && (
          <g opacity={honest}>
            <Panel x={-290} y={240} w={580} h={300} r={40} fill={C.yellow} />
            <Txt x={0} y={310} size={32} weight={900}>
              «Мы лишь второй прокат.
            </Txt>
            <Txt x={0} y={360} size={32} weight={900}>
              Так зачем выбирать нас?
            </Txt>
            <Txt x={0} y={430} size={38} weight={900} color={C.coral}>
              Мы стараемся больше»
            </Txt>
            <g opacity={money}>
              <rect x={-200} y={600} width={400} height={30} rx={15} fill={Z.greySoft} />
              <rect x={-200} y={600} width={400 * money} height={30} rx={15} fill={C.green} />
              <Txt x={0} y={690} size={28} color={C.inkSoft}>
                после 13 лет убытков — прибыль
              </Txt>
            </g>
          </g>
        )}
      </g>
    </g>
  );
};

// ── Правило семи; «не-кола» 7-Up ──
export const Seven: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const boring = ramp(t, at(c, 1), 0.5);
  const uncola = ramp(t, at(c, 2), 0.5);
  return (
    <g>
      <g opacity={1 - uncola}>
        <g transform={`translate(${cx - 260} 0)`}>
          <LadderShape x={0} y={800} s={0.95} steps={7} h={600} w={260} />
          {Array.from({ length: 7 }).map((_, i) => {
            const k = pop(t, 0.4 + i * 0.22);
            return (
              <g key={i} transform={`translate(0 ${800 - 600 + 40 + (i * 540) / 6 - 30}) scale(${k})`}>
                <circle r={26} fill={["#ffd23f", C.coral, Z.teal, Z.purple, C.green, Z.orange, C.skyDeep][i]} stroke={OL} strokeWidth={4} />
                <text y={10} fontFamily={FONT} fontWeight={900} fontSize={26} textAnchor="middle" fill="#fff">
                  {i + 1}
                </text>
              </g>
            );
          })}
          <Pop t={t} at={at(c, 0.7)} x={0} y={150}>
            <Tag x={0} y={0} text="правило семи" size={38} color={C.yellow} />
          </Pop>
        </g>
        {boring > 0 && (
          <g opacity={boring} transform={`translate(${cx + 280} 0)`}>
            <LadderShape x={0} y={800} s={0.95} steps={2} h={300} w={220} />
            <Txt x={0} y={420} size={32} weight={900}>
              шины, аккумуляторы
            </Txt>
            <Txt x={0} y={470} size={28} color={C.inkSoft}>
              мало ступенек
            </Txt>
          </g>
        )}
      </g>
      {uncola > 0 && (
        <g opacity={uncola}>
          <LadderShape x={cx - 330} y={820} s={1} steps={2} h={260} w={200} />
          <Txt x={cx - 330} y={510} size={28} weight={900}>
            маленькая лестница
          </Txt>
          <LadderShape x={cx + 180} y={820} s={1} steps={8} h={620} w={260} />
          <Txt x={cx + 180} y={170} size={32} weight={900}>
            лестница колы
          </Txt>
          {[0, 1].map((i) => (
            <Bottle key={i} x={cx + 120 + i * 120} y={320 + i * 30} s={0.4} color="#7a3b22" />
          ))}
          <g transform={`translate(${cx + 180 + (1 - ramp(t, at(c, 2.4), 0.8)) * -510} ${560 - ramp(t, at(c, 2.4), 0.8) * 20})`}>
            <Bottle x={0} y={60} s={0.55} color={C.green} label="7-Up" />
          </g>
          <Pop t={t} at={at(c, 2.6)} x={cx + 470} y={500}>
            <Tag x={0} y={0} text="«Uncola» — №3" size={32} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Закон двойственности: две лошади, третья отстаёт (данные книги) ──
export const TwoHorses: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const race = ramp(t, 0.3, Math.max(1, at(c, 1) - 0.3));
  const chart = ramp(t, at(c, 1), 0.5);
  const yrs = ramp(t, at(c, 1.5), 0.9);
  const caveat = ramp(t, at(c, 2), 0.5);
  const sh = (a: number, b: number) => a + (b - a) * yrs;
  const bars = [
    { name: "лидер колы", v: sh(60, 45), col: C.coral },
    { name: "Pepsi", v: sh(25, 40), col: C.skyDeep },
    { name: "Royal Crown", v: sh(6, 3), col: Z.grey },
  ];
  return (
    <g>
      <g opacity={1 - chart}>
        <rect x={cx - 560} y={640} width={1120} height={14} rx={7} fill={C.brown} opacity={0.4} />
        <Horse x={cx - 420 + 760 * race} y={560} s={0.9} t={t} num="1" />
        <Horse x={cx - 440 + 730 * race} y={720} s={0.9} t={t + 0.4} color="#9c6b3a" num="2" />
        <Horse x={cx - 460 + 380 * race} y={860} s={0.7} t={t + 0.8} color={Z.grey} num="3" />
        <Pop t={t} at={0.3} x={cx} y={200}>
          <Txt x={0} y={0} size={52} weight={900}>
            гонка двух лошадей
          </Txt>
        </Pop>
      </g>
      {chart > 0 && (
        <g opacity={chart * (1 - caveat)}>
          <Txt x={cx} y={180} size={40} weight={900}>
            {`кола: ${Math.round(1969 + 22 * yrs)} (по данным книги)`}
          </Txt>
          {bars.map((b, i) => (
            <g key={b.name}>
              <Txt x={cx - 520} y={310 + i * 160} size={32} weight={900} anchor="start">
                {b.name}
              </Txt>
              <rect x={cx - 520} y={330 + i * 160} width={1000} height={60} rx={14} fill={Z.greySoft} />
              <rect x={cx - 520} y={330 + i * 160} width={(1000 * b.v) / 65} height={60} rx={14} fill={b.col} stroke={OL} strokeWidth={4} />
              <Txt x={cx - 510 + (1000 * b.v) / 65 + 70} y={374 + i * 160} size={34} weight={900}>
                {`${Math.round(b.v)}%`}
              </Txt>
            </g>
          ))}
        </g>
      )}
      {caveat > 0 && (
        <g transform={`translate(${cx} 470) rotate(-3) scale(${0.7 + 0.3 * caveat})`} opacity={caveat}>
          <rect x={-380} y={-62} width={760} height={124} rx={24} fill="#fff" stroke={C.coral} strokeWidth={7} />
          <Txt x={0} y={-6} size={36} weight={900} color={C.coral}>
            эвристика, а не закон природы
          </Txt>
          <Txt x={0} y={40} size={28} color={C.inkSoft}>
            результаты не предопределены
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── Закон противоположности: старое против нового, приятный вкус против «больницы» ──
export const Opposite: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const flip = ramp(t, 0.4, 0.8);
  const cola = ramp(t, at(c, 1), 0.5);
  const scope = ramp(t, at(c, 2), 0.5);
  const truth = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g opacity={1 - cola}>
        <Pop t={t} at={0.2} x={cx} y={220}>
          <Txt x={0} y={0} size={52} weight={900}>
            не лучше — другим
          </Txt>
        </Pop>
        <g transform={`translate(${cx} 520) rotate(${180 * flip})`}>
          <rect x={-200} y={-120} width={400} height={240} rx={30} fill={C.yellow} stroke={OL} strokeWidth={6} />
          <Txt x={0} y={20} size={60} weight={900}>
            ЛИДЕР
          </Txt>
        </g>
      </g>
      {cola > 0 && (
        <g opacity={cola * (1 - scope)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Bottle x={0} y={620} s={1.3} color="#7a3b22" label="Coca-Cola" />
            <Tag x={0} y={250} text="старый, проверенный" size={30} color={Z.greySoft} />
          </g>
          <Arrow x1={cx - 90} y1={480} x2={cx + 90} y2={480} k={ramp(t, at(c, 1.3), 0.5)} color={C.coral} w={12} />
          <g transform={`translate(${cx + 270} 0)`}>
            <Bottle x={0} y={620} s={1.3} color={C.skyDeep} label="Pepsi" />
            <Tag x={0} y={250} text="выбор нового поколения" size={30} color={C.yellow} />
          </g>
        </g>
      )}
      {scope > 0 && (
        <g opacity={scope * (1 - truth)}>
          <g transform={`translate(${cx - 270} 0)`}>
            <Bottle x={0} y={640} s={1.2} color="#c9a227" label="Listerine" />
            <g transform="translate(0 280)">
              <rect x={-60} y={-60} width={120} height={120} rx={14} fill="#fff" stroke={OL} strokeWidth={4} />
              <rect x={-14} y={-40} width={28} height={80} fill={C.red} />
              <rect x={-40} y={-14} width={80} height={28} fill={C.red} />
            </g>
            <Txt x={0} y={410} size={28} color={C.inkSoft}>
              «пахнет больницей»
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <Bottle x={0} y={640} s={1.2} color={Z.mint} label="Scope" />
            <g transform={`translate(0 ${300 + wob(t, 1, 5)})`}>
              <circle r={50} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <circle cx={-16} cy={-10} r={6} fill={OL} />
              <circle cx={16} cy={-10} r={6} fill={OL} />
              <path d="M -22 12 q 22 22 44 0" stroke={OL} strokeWidth={5} fill="none" />
            </g>
            <Txt x={0} y={410} size={28} color={C.inkSoft}>
              «приятный вкус»
            </Txt>
          </g>
        </g>
      )}
      {truth > 0 && (
        <g transform={`translate(${cx} 470) scale(${truth})`}>
          <rect x={-420} y={-110} width={840} height={220} rx={30} fill="#fff" stroke={C.green} strokeWidth={8} />
          <Txt x={0} y={-24} size={42} weight={900}>
            условие: в словах — правда
          </Txt>
          <Txt x={0} y={44} size={36} weight={900} color={C.coral}>
            обман — не стратегия
          </Txt>
          <Check x={-360} y={-34} s={40} k={truth} />
        </g>
      )}
    </g>
  );
};

// ── Закон атрибутов: противоположный атрибут ──
export const Attributes: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const crest = ramp(t, at(c, 1), 0.5);
  const mini = ramp(t, at(c, 2), 0.5);
  const gil = ramp(t, at(c, 3), 0.5);
  const fadeA = 1 - mini;
  const fadeB = 1 - gil;
  return (
    <g>
      <g opacity={1 - crest}>
        <Pop t={t} at={0.2} x={cx} y={300}>
          <Txt x={0} y={0} size={50} weight={900}>
            для каждого атрибута
          </Txt>
          <Txt x={0} y={70} size={50} weight={900} color={C.coral}>
            есть противоположный
          </Txt>
        </Pop>
      </g>
      {crest > 0 && (
        <g opacity={crest * fadeA}>
          <Pop t={t} at={at(c, 1.05)} x={cx} y={250}>
            <Tag x={0} y={0} text="Crest — «кариес»" size={44} color={C.yellow} />
          </Pop>
          {["отбеливание", "вкус", "свежее дыхание"].map((w, i) => (
            <g key={w}>
              <Arrow x1={cx} y1={300} x2={cx - 380 + i * 380} y2={460} k={ramp(t, at(c, 1.4 + i * 0.15), 0.4)} color={Z.grey} w={8} />
              <Pop t={t} at={at(c, 1.5 + i * 0.15)} x={cx - 380 + i * 380} y={520}>
                <Tag x={0} y={0} text={w} size={34} color={[Z.tealSoft, "#ffe0c2", Z.mint][i]} />
              </Pop>
            </g>
          ))}
        </g>
      )}
      {mini > 0 && (
        <g opacity={mini * fadeB}>
          <g transform={`translate(${cx - 260} 0)`}>
            <Mainframe x={0} y={680} s={1.4} t={t} color={C.sky} />
            <Tag x={0} y={250} text="IBM: «большой и мощный»" size={30} color={Z.greySoft} />
          </g>
          <g transform={`translate(${cx + 270} 0)`}>
            <g transform={`translate(0 640) scale(${pop(t, at(c, 2.5))})`}>
              <circle cy={-60} r={120} fill={C.yellow} opacity={0.35} />
              <MiniPC x={0} y={0} s={1} t={t} />
            </g>
            <Tag x={0} y={250} text="новичок: «маленький»" size={30} color={C.yellow} />
          </g>
        </g>
      )}
      {gil > 0 && (
        <g opacity={gil}>
          <Txt x={cx} y={220} size={44} weight={900}>
            Gillette не стала смеяться
          </Txt>
          {/* дорогая система и одноразовая бритва */}
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${cx - 220 + i * 440} 520) rotate(${-20 + wob(t, i, 4)}) scale(${i ? pop(t, at(c, 3.3)) : 1})`}>
              <rect x={-16} y={-10} width={32} height={260} rx={14} fill={i ? Z.orange : Z.grey} stroke={OL} strokeWidth={5} />
              <rect x={-80} y={-60} width={160} height={56} rx={10} fill={i ? "#fff" : Z.greySoft} stroke={OL} strokeWidth={5} />
            </g>
          ))}
          <Pop t={t} at={at(c, 3.6)} x={cx} y={820}>
            <Tag x={0} y={0} text="не смейтесь над новым атрибутом" size={34} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── «Рассвет»: своя лестница и противоположный атрибут ──
export const BakeryLadder: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const own = ramp(t, at(c, 0.5), 0.6);
  const attr = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g opacity={1 - attr}>
        <g transform={`translate(${cx - 300} 0)`}>
          <LadderShape x={0} y={800} s={0.9} steps={5} h={560} w={260} />
          <Txt x={0} y={200} size={30} weight={900}>
            «хлеб в городе»
          </Txt>
          <Rung x={0} y={290} text="Большая" k={pop(t, 0.3)} color={Z.greySoft} size={30} />
          <Rung x={0} y={720} text="Рассвет" k={pop(t, 0.6)} size={30} />
        </g>
        {own > 0 && (
          <g opacity={own} transform={`translate(${cx + 300} 0)`}>
            <LadderShape x={0} y={800} s={0.9} steps={3} h={420} w={260} />
            <Txt x={0} y={330} size={30} weight={900}>
              «утренний хлеб»
            </Txt>
            <Rung x={0} y={420} text="Рассвет" k={pop(t, at(c, 0.7))} color={C.yellow} size={30} />
          </g>
        )}
      </g>
      {attr > 0 && (
        <g opacity={attr}>
          <g transform={`translate(${cx - 280} 0)`}>
            <Panel x={-230} y={200} w={460} h={560} fill="#ffffffcc" />
            <Txt x={0} y={260} size={32} weight={900}>
              «Большая пекарня»
            </Txt>
            {Array.from({ length: 12 }).map((_, i) => (
              <Loaf key={i} x={-150 + (i % 4) * 100} y={380 + Math.floor(i / 4) * 110} s={0.42} color={["#e2a35a", "#c98b4a", "#f2c27a", "#d9955a"][i % 4]} />
            ))}
            <Txt x={0} y={720} size={30} color={C.inkSoft}>
              огромный выбор
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 0)`}>
            <Panel x={-230} y={200} w={460} h={560} fill="#fff" stroke={C.yellowDeep} />
            <Txt x={0} y={260} size={32} weight={900}>
              «Рассвет»
            </Txt>
            <Loaf x={-70} y={470} s={0.9} steam={1} t={t} />
            <Loaf x={90} y={500} s={0.7} steam={1} t={t + 0.4} />
            <Txt x={0} y={640} size={30} weight={900}>
              маленькое меню
            </Txt>
            <Txt x={0} y={700} size={30} weight={900} color={C.coral}>
              всё горячее к 7:00
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

