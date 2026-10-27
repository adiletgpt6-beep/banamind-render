// Части «План» и «Секреты»: лотерейный билет и чертёж, четыре взгляда на будущее,
// холм и гора, закон степеней, жизнь — не портфель, три двери, четыре причины,
// секреты о природе и о людях, девять лет одной задачи.
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Blueprint, Bulb, Dot, Door, House, OL, Rocket, Shop, Ticket } from "./draw";
import { AX, ListBoard } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ── Удача или умение: тысяча копий мира невозможна; вы — не лотерейный билет ──
export const Lottery: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const scales = ramp(t, 0.2, 0.6);
  const worlds = ramp(t, at(c, 1), at(c, 1.8) - at(c, 1));
  const ahead = ramp(t, at(c, 2), 0.6);
  const torn = ramp(t, at(c, 3.3), 0.6);
  return (
    <g>
      <g opacity={scales * (1 - worlds * 0.85)}>
        <line x1={cx} y1={240} x2={cx} y2={560} stroke={C.ink} strokeWidth={8} />
        <g transform={`rotate(${Math.sin(t * 1.5) * 8} ${cx} 300)`}>
          <line x1={cx - 280} y1={300} x2={cx + 280} y2={300} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
          <Txt x={cx - 280} y={400} size={40} weight={900}>
            удача
          </Txt>
          <Txt x={cx + 280} y={400} size={40} weight={900}>
            умение
          </Txt>
          <path d={`M ${cx - 340} 330 L ${cx - 220} 330`} stroke={C.ink} strokeWidth={6} />
          <path d={`M ${cx + 220} 330 L ${cx + 340} 330`} stroke={C.ink} strokeWidth={6} />
        </g>
        <path d={`M ${cx - 70} 580 L ${cx + 70} 580 L ${cx} 540 Z`} fill={C.ink} />
      </g>
      {worlds > 0 && (
        <g opacity={worlds * (1 - ahead)}>
          {Array.from({ length: Math.round(worlds * 24) }).map((_, i) => (
            <circle key={i} cx={cx - 500 + (i % 8) * 140} cy={300 + Math.floor(i / 8) * 150} r={50} fill={C.sky} stroke={OL} strokeWidth={3} opacity={0.8} />
          ))}
          <Cross x={cx} y={450} s={260} k={ramp(t, at(c, 1.6), 0.5)} />
          <Txt x={cx} y={790} size={34} weight={900}>
            1000 копий мира не создать
          </Txt>
        </g>
      )}
      {ahead > 0 && (
        <g opacity={ahead}>
          <g transform={`translate(${cx - 270} 500)`}>
            <Ticket x={0} y={0} s={1.2} rot={-8 + torn * 25} />
            {torn > 0 && <Cross x={0} y={0} s={200} k={torn} />}
          </g>
          <g transform={`translate(${cx + 280} 500) scale(${0.8 + 0.2 * ahead})`}>
            <Blueprint x={0} y={0} s={1.1} k={ramp(t, at(c, 2.2), 1.6)} />
            <Txt x={0} y={170} size={34} weight={900}>
              план
            </Txt>
          </g>
          <Arrow x1={cx - 70} y1={500} x2={cx + 80} y2={500} k={ramp(t, at(c, 2.4), 0.5)} color={C.coral} w={12} />
        </g>
      )}
      <Pop t={t} at={at(c, 3.4)} x={cx} y={200}>
        <Tag x={0} y={0} text="вы — не лотерейный билет" size={46} color={C.yellow} />
      </Pop>
    </g>
  );
};

// ── Четыре взгляда на будущее: ясный/туманный × лучше/хуже ──
export const Quadrant: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const grid = ramp(t, 0.2, 0.8);
  const dOpt = pop(t, at(c, 1));
  const iOpt = pop(t, at(c, 2));
  const warn = ramp(t, at(c, 3), 0.5);
  const one = ramp(t, at(c, 4), 0.6);
  const x0 = cx - 330;
  const y0 = 500;
  const S = 300;
  const cellFill = (on: number, base: string) => (on > 0 ? base : "#ffffffaa");
  return (
    <g opacity={grid}>
      <Txt x={x0 - S / 2} y={y0 - S - 40} size={30} weight={900} color={C.inkSoft}>
        ясное будущее
      </Txt>
      <Txt x={x0 + S / 2 + 20} y={y0 - S - 40} size={30} weight={900} color={C.inkSoft}>
        туманное
      </Txt>
      <Txt x={x0 + S + 140} y={y0 - S / 2 + 10} size={30} weight={900} color={C.inkSoft} anchor="start">
        лучше
      </Txt>
      <Txt x={x0 + S + 140} y={y0 + S / 2 + 10} size={30} weight={900} color={C.inkSoft} anchor="start">
        хуже
      </Txt>
      <rect x={x0 - S} y={y0 - S} width={S} height={S} rx={20} fill={cellFill(dOpt, C.yellow)} stroke={OL} strokeWidth={5} />
      <rect x={x0 + 20} y={y0 - S} width={S} height={S} rx={20} fill={cellFill(iOpt, "#ffe7c2")} stroke={OL} strokeWidth={5} />
      <rect x={x0 - S} y={y0 + 20} width={S} height={S} rx={20} fill="#ffffffaa" stroke={OL} strokeWidth={5} />
      <rect x={x0 + 20} y={y0 + 20} width={S} height={S} rx={20} fill="#ffffffaa" stroke={OL} strokeWidth={5} />
      {dOpt > 0 && (
        <g transform={`translate(${x0 - S / 2} ${y0 - S / 2}) scale(${dOpt})`}>
          <Rocket x={0} y={-10} s={0.75} t={t} />
          <Txt x={0} y={110} size={26} weight={900}>
            план + работа
          </Txt>
          <circle cx={90} cy={-90} r={26} fill="#f1f1f1" stroke={OL} strokeWidth={3} />
        </g>
      )}
      {iOpt > 0 && (
        <g transform={`translate(${x0 + 20 + S / 2} ${y0 - S / 2}) scale(${iOpt})`}>
          <path d="M -90 -30 q 30 -40 70 -10 q 30 -40 70 0 q 40 0 30 40 L -90 30 Z" fill="#fff" stroke={OL} strokeWidth={4} transform={`translate(${wob(t, 2, 6)} 0)`} />
          <Txt x={0} y={100} size={26} weight={900}>
            «само сложится»
          </Txt>
          <Cross x={0} y={0} s={150} k={warn} />
        </g>
      )}
      <Txt x={x0 - S / 2} y={y0 + S / 2 + 30} size={26} color={C.inkSoft}>
        готовиться к худшему
      </Txt>
      <Txt x={x0 + 20 + S / 2} y={y0 + S / 2 + 30} size={26} color={C.inkSoft}>
        ждать худшего
      </Txt>
      {one > 0 && (
        <Pop t={t} at={at(c, 4.1)} x={cx + 420} y={520}>
          <Panel x={-190} y={-110} w={380} h={220} fill={C.yellow} />
          <Txt x={0} y={-30} size={34} weight={900}>
            {"выберите цель —\nстаньте сильным\nв одном"}
          </Txt>
        </Pop>
      )}
    </g>
  );
};

// ── Холм и гора: маленькие правки ведут к ближайшей вершине ──
export const HillClimb: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const climb = ramp(t, at(c, 1), at(c, 1.5) - at(c, 1));
  const mountain = ramp(t, at(c, 1.5), 0.8);
  const apple = pop(t, at(c, 2));
  const fb = pop(t, at(c, 3));
  const hx = cx - 330;
  const ballX = hx - 200 + climb * 200;
  const ballY = 760 - Math.sin(((ballX - (hx - 260)) / 520) * Math.PI) * 200;
  return (
    <g>
      <path d={`M ${cx - 600} 780 Q ${hx} 360 ${hx + 260} 780 Z`} fill={C.green} stroke={OL} strokeWidth={5} opacity={0.9} />
      <Txt x={hx} y={530} size={30} weight={900} color={C.white}>
        холм
      </Txt>
      {mountain > 0 && (
        <g opacity={mountain}>
          <path d={`M ${hx + 160} 780 L ${cx + 300} ${780 - 560 * mountain} L ${cx + 600} 780 Z`} fill={Z.purple} stroke={OL} strokeWidth={5} opacity={0.85} />
          <path d={`M ${cx + 240} ${780 - 470 * mountain} L ${cx + 300} ${780 - 560 * mountain} L ${cx + 360} ${780 - 470 * mountain} Z`} fill="#fff" />
          <Txt x={cx + 300} y={700} size={30} weight={900} color={C.white}>
            гора
          </Txt>
          <path d={`M ${hx + 20} 520 Q ${cx} 200 ${cx + 280} ${300}`} stroke={C.coral} strokeWidth={8} fill="none" strokeDasharray="20 16" opacity={ramp(t, at(c, 1.7), 0.6)} />
        </g>
      )}
      <circle cx={ballX} cy={ballY - 26} r={24} fill={C.yellow} stroke={OL} strokeWidth={4} />
      {[0.2, 0.45, 0.7].map((p, i) => (
        <circle key={i} cx={hx - 200 + p * 200} cy={760 - Math.sin(((p * 200 + 60) / 520) * Math.PI) * 200} r={6} fill={OL} opacity={climb > p ? 0.6 : 0} />
      ))}
      <Pop t={t} at={at(c, 0.5)} x={hx} y={260}>
        <Tag x={0} y={0} text="мелкие правки" size={32} color={C.white} />
      </Pop>
      {apple > 0 && (
        <Pop t={t} at={at(c, 2)} x={cx + 300} y={180}>
          <Tag x={0} y={0} text="Apple: план на годы, iPod 2001" size={30} color={C.yellow} />
        </Pop>
      )}
      {fb > 0 && (
        <g transform={`translate(${cx + 300} 860) scale(${fb})`}>
          <Tag x={-50} y={-40} text="1 млрд $? — нет, свой план" size={30} color={Z.tealSoft} />
        </g>
      )}
    </g>
  );
};

// ── Закон степеней: «колокол» против одного гиганта ──
export const PowerLaw: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const normal = ramp(t, at(c, 1), 0.8);
  const power = ramp(t, at(c, 2), 1);
  const fund = pop(t, at(c, 3));
  const focus = pop(t, at(c, 4.2));
  const base = 760;
  const n = 12;
  const bell = (i: number) => 50 + 230 * Math.exp(-Math.pow((i - (n - 1) / 2) / 2.4, 2));
  const pl = (i: number) => (i === 0 ? 520 : 260 / Math.pow(i + 1, 1.6));
  return (
    <g>
      <Pop t={t} at={0.1} x={cx} y={170}>
        <Txt x={0} y={0} size={50} weight={900}>
          закон степеней
        </Txt>
      </Pop>
      <line x1={cx - 520} y1={base} x2={cx + 520} y2={base} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: n }).map((_, i) => {
        const h = bell(i) * (1 - power) + pl(i) * power;
        const k = clamp01(normal * 3 - i * 0.15);
        return <rect key={i} x={cx - 500 + i * 84} y={base - h * k} width={64} height={h * k} rx={8} fill={i === 0 && power > 0.3 ? C.coral : Z.teal} stroke={OL} strokeWidth={3} />;
      })}
      <Txt x={cx} y={base + 54} size={30} color={C.inkSoft} opacity={normal * (1 - power)}>
        ожидание: много средних
      </Txt>
      <Txt x={cx} y={base + 54} size={30} color={C.coral} weight={900} opacity={power}>
        на деле: один больше всех остальных
      </Txt>
      {fund > 0 && (
        <Pop t={t} at={at(c, 3)} x={cx + 200} y={330}>
          <Tag x={0} y={0} text="лучшая инвестиция > все остальные" size={30} color={C.yellow} />
        </Pop>
      )}
      {focus > 0 && (
        <g transform={`translate(${cx + 380} 470) scale(${focus})`}>
          <circle r={70} fill="none" stroke={C.red} strokeWidth={10} />
          <circle r={36} fill="none" stroke={C.red} strokeWidth={10} />
          <circle r={10} fill={C.red} />
          <Txt x={0} y={120} size={28} weight={900}>
            найти главное
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── Жизнь — не портфель: одна дорога вместо десяти ──
export const LifePath: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const ten = ramp(t, 0.2, 0.8);
  const one = ramp(t, at(c, 1), 0.6);
  const join = pop(t, at(c, 2));
  const single = pop(t, at(c, 3));
  return (
    <g>
      <g opacity={ten * (1 - one * 0.8)}>
        <Dot x={cx - 420} y={520} s={1.6} color={C.coral} />
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={i} d={`M ${cx - 380} 500 Q ${cx - 100} ${280 + i * 50} ${cx + 380} ${230 + i * 60}`} stroke={[Z.teal, Z.purple, C.skyDeep, C.green][i % 4]} strokeWidth={6} fill="none" strokeDasharray="14 12" />
        ))}
        <Txt x={cx} y={190} size={40} weight={900}>
          10 карьер сразу?
        </Txt>
        <Cross x={cx + 60} y={500} s={200} k={ramp(t, at(c, 0.6), 0.5)} />
      </g>
      {one > 0 && (
        <g opacity={one * (1 - single * 0.5)}>
          <Dot x={cx - 420} y={520} s={1.6} color={C.coral} />
          <path d={`M ${cx - 380} 500 Q ${cx - 50} 330 ${cx + 200} 420`} stroke={C.coral} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - ramp(t, at(c, 1.1), 1.2))} />
          <Tag x={cx} y={250} text="чем заниматься — важно" size={40} color={C.yellow} />
        </g>
      )}
      {join > 0 && (
        <g transform={`translate(${cx + 330} 470) scale(${join})`} opacity={1 - single * 0.5}>
          <circle cy={-60} r={130} fill={C.yellow} opacity={0.3} />
          <Shop x={0} y={0} s={1.2} awning={C.green} />
          <Rocket x={110} y={-160} s={0.5} t={t} />
          <Txt x={0} y={70} size={28} weight={900}>
            сильная растущая компания
          </Txt>
        </g>
      )}
      {single > 0 && (
        <g transform={`translate(${cx} 720) scale(${single})`}>
          {["рынок", "способ продаж", "решение"].map((s, i) => (
            <Tag key={s} x={-340 + i * 340} y={0} text={`1 главный: ${s}`} size={26} color={C.white} />
          ))}
        </g>
      )}
    </g>
  );
};

// ── Секрет — не тайна: три двери ──
export const SecretDoors: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const q = ramp(t, 0.2, 0.6);
  const doors = ramp(t, at(c, 2), 0.6);
  const mid = ramp(t, at(c, 3), 0.8);
  const xs = [cx - 360, cx, cx + 360];
  return (
    <g>
      <g opacity={q * (1 - doors * 0.7)}>
        <Txt x={cx} y={200} size={40} weight={900}>
          какой ценный бизнес ещё никто не построил?
        </Txt>
      </g>
      <g opacity={ramp(t, at(c, 1), 0.6) * (1 - doors)}>
        <Panel x={cx - 500} y={300} w={460} h={300} fill="#fff" />
        <Txt x={cx - 270} y={400} size={40} weight={900}>
          тайна
        </Txt>
        <Txt x={cx - 270} y={470} size={28} color={C.inkSoft}>
          не разгадать
        </Txt>
        <Panel x={cx + 40} y={300} w={460} h={300} fill={C.yellow} />
        <Txt x={cx + 270} y={400} size={40} weight={900}>
          секрет
        </Txt>
        <Txt x={cx + 270} y={470} size={28}>
          трудно, но можно
        </Txt>
      </g>
      {doors > 0 && (
        <g opacity={doors}>
          <Door x={xs[0]} y={760} color="#9fe0b8" label="лёгкое" open={ramp(t, at(c, 2.3), 0.5)} />
          <Door x={xs[1]} y={760} color={C.yellowDeep} label="трудное" open={mid} glow={mid} />
          <Door x={xs[2]} y={760} color={Z.grey} label="невозможное" />
          <Cross x={xs[2]} y={620} s={110} k={ramp(t, at(c, 2.7), 0.4)} />
          {mid > 0.6 && (
            <g transform={`translate(${xs[1]} 600) scale(${pop(t, at(c, 3.4))})`}>
              <circle r={44} fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M -14 8 A 16 16 0 1 1 14 8 L 8 30 L -8 30 Z" fill={C.ink} />
            </g>
          )}
          <Pop t={t} at={at(c, 3.5)} x={xs[1]} y={300}>
            <Tag x={0} y={0} text="здесь секреты" size={32} color={C.white} />
          </Pop>
        </g>
      )}
    </g>
  );
};

// ── Четыре причины не искать секреты + пример HP ──
export const WhyNot: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const hp = ramp(t, at(c, 3), 0.6);
  const items = [
    { text: "крошечные шажки", at: at(c, 1) },
    { text: "страх ошибиться", at: at(c, 1.55) },
    { text: "самоуспокоенность", at: at(c, 2) },
    { text: "«всё уже придумали»", at: at(c, 2.55) },
  ];
  const base = 760;
  const curve = (u: number) => (u < 0.55 ? 0.1 + u * 1.5 : 0.92 - (u - 0.55) * 1.6);
  return (
    <g>
      <g opacity={1 - hp}>
        <ListBoard ctx={c} x={cx - 420} y={210} w={840} items={items} rowH={120} size={42} />
      </g>
      {hp > 0 && (
        <g opacity={hp}>
          <Txt x={cx} y={220} size={40} weight={900}>
            Hewlett-Packard (по данным книги)
          </Txt>
          <line x1={cx - 460} y1={base} x2={cx + 460} y2={base} stroke={C.ink} strokeWidth={5} />
          <path
            d={Array.from({ length: 30 })
              .map((_, i) => {
                const u = (i / 29) * ramp(t, at(c, 3.1), 2);
                return `${i ? "L" : "M"} ${cx - 440 + u * 880} ${base - curve(u) * 400}`;
              })
              .join(" ")}
            stroke={Z.teal}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
          <Txt x={cx - 200} y={base + 50} size={28} color={C.inkSoft}>
            изобретали
          </Txt>
          <Txt x={cx + 260} y={base + 50} size={28} color={C.inkSoft}>
            перестали
          </Txt>
          <Bulb x={cx - 200} y={base - 430} s={0.45} t={t} on={1} />
          <Bulb x={cx + 260} y={base - 250} s={0.45} t={t} on={0} />
        </g>
      )}
    </g>
  );
};

// ── Секреты о природе и о людях; свободные комнаты и путешественники ──
export const TwoSecrets: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const two = ramp(t, 0.2, 0.6);
  const rooms = ramp(t, at(c, 1), 0.6);
  const link = ramp(t, at(c, 1.5), 0.8);
  const look = pop(t, at(c, 3));
  return (
    <g>
      <g opacity={two * (1 - rooms)}>
        <Panel x={cx - 520} y={230} w={480} h={380} fill={Z.tealSoft} />
        <Txt x={cx - 280} y={320} size={40} weight={900}>
          о природе
        </Txt>
        <g transform={`translate(${cx - 280} 470)`}>
          <circle r={70} fill={C.yellow} stroke={OL} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} rx={120} ry={34} fill="none" stroke={Z.purple} strokeWidth={4} transform={`rotate(${i * 60 + t * 20})`} />
          ))}
        </g>
        <Panel x={cx + 40} y={230} w={480} h={380} fill="#ffe7c2" />
        <Txt x={cx + 280} y={320} size={40} weight={900}>
          о людях
        </Txt>
        <g transform={`translate(${cx + 280} 470)`}>
          <Dot x={-50} y={30} s={1.3} color={C.coral} />
          <Dot x={50} y={30} s={1.3} color={Z.teal} />
          <path d="M -10 -70 q 20 -30 40 0" stroke={OL} strokeWidth={4} fill="none" />
          <Txt x={10} y={-90} size={40} weight={900}>
            ?
          </Txt>
        </g>
      </g>
      {rooms > 0 && (
        <g opacity={rooms}>
          <House x={cx - 280} y={720} s={1} />
          <Txt x={cx - 280} y={790} size={30} weight={900}>
            свободная комната
          </Txt>
          <g transform={`translate(${cx + 300} 600)`}>
            <Dot x={0} y={0} s={1.8} color={Z.purple} />
            <rect x={40} y={-10} width={60} height={70} rx={10} fill={C.coral} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={190} size={30} weight={900}>
              путешественник
            </Txt>
          </g>
          <path d={`M ${cx - 130} 560 Q ${cx} 420 ${cx + 220} 520`} stroke={C.coral} strokeWidth={8} fill="none" strokeDasharray={500} strokeDashoffset={500 * (1 - link)} />
          {link > 0.95 && (
            <Pop t={t} at={at(c, 2)} x={cx} y={400}>
              <Tag x={0} y={0} text="Airbnb" size={40} color={C.yellow} />
            </Pop>
          )}
        </g>
      )}
      {look > 0 && (
        <g transform={`translate(${cx} 200) scale(${look})`}>
          <Tag x={0} y={0} text="ищите там, где никто не ищет" size={40} color={C.white} />
        </g>
      )}
    </g>
  );
};

// ── Девять лет одной задачи (Эндрю Уайлс) ──
export const Wiles: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const yrs = ramp(t, 0.6, at(c, 0.95) - 0.6);
  const done = pop(t, at(c, 1));
  const team = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <g opacity={1 - team}>
        <Panel x={cx - 420} y={200} w={840} h={260} fill="#fdfbf5" />
        <text x={cx} y={360} fontFamily="PT Serif, serif" fontWeight={700} fontSize={110} textAnchor="middle" fill={C.ink}>
          aⁿ + bⁿ ≠ cⁿ
        </text>
        <Txt x={cx} y={430} size={28} color={C.inkSoft}>
          теорема Ферма: 350+ лет без доказательства
        </Txt>
        <g transform={`translate(${cx - 400} 600)`}>
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={i} opacity={clamp01(yrs * 9 - i)}>
              <rect x={i * 90} y={-40} width={70} height={80} rx={8} fill={Z.tealSoft} stroke={OL} strokeWidth={3} />
              <Txt x={i * 90 + 35} y={14} size={30} weight={900}>
                {String(i + 1)}
              </Txt>
            </g>
          ))}
          <Txt x={400} y={110} size={30} weight={900}>
            9 лет работы
          </Txt>
        </g>
        {done > 0 && (
          <g transform={`translate(${cx + 380} 300) scale(${done})`}>
            <Check x={0} y={0} s={70} k={ramp(t, at(c, 1.05), 0.5)} />
          </g>
        )}
      </g>
      {team > 0 && (
        <g opacity={team}>
          <g transform={`translate(${cx} 520)`}>
            <circle r={200} fill={C.yellow} opacity={0.25} />
            {Array.from({ length: 5 }).map((_, i) => {
              const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
              return <Dot key={i} x={Math.cos(a) * 150} y={Math.sin(a) * 120} s={1} color={[Z.teal, C.coral, Z.purple][i % 3]} />;
            })}
            <g transform={`rotate(${wob(t, 3, 8)})`}>
              <circle r={40} fill="#fff" stroke={OL} strokeWidth={4} />
              <path d="M -12 6 A 14 14 0 1 1 12 6 L 7 26 L -7 26 Z" fill={C.ink} />
            </g>
          </g>
          <Tag x={cx} y={790} text="секрет — для команды" size={36} color={C.white} />
          <Arrow x1={cx - 420} y1={520} x2={cx - 230} y2={520} k={ramp(t, at(c, 3.2), 0.5)} color={C.coral} w={10} />
        </g>
      )}
    </g>
  );
};
