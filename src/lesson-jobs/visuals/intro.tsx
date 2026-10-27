// Вступление и «Истоки»: пульт со ста кнопками, два вопроса, книга, метки,
// усыновление, забор отца, звонок Хьюлетту, два Стива, синяя коробочка,
// каллиграфия, игровой автомат и спор о деньгах за игру.
import React from "react";
import { CLAIMS } from "../components/ClaimBadge";
import { C, FONT } from "../theme";
import type { Claim } from "../types";
import { Bench, Board, BookCover, ButtonGrid, Coin, Fence, Heart, Note, OL, Person, Stage } from "./draw";
import { Arrow, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";

// ── h01: пульт со ста кнопками, девяносто шесть гаснут ──
export const HundredButtons: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const on = ramp(t, 0.1, 1.2);
  const off = ramp(t, at(c, 1.3), 2.2);
  const keep = (i: number) => [33, 36, 63, 66].includes(i);
  const glow = ramp(t, at(c, 2), 0.6);
  return (
    <Stage host={c.p.host}>
      <g opacity={on} transform={`translate(0 ${(1 - on) * 40})`}>
        <Panel x={150} y={120} w={980} h={720} fill="#2a3146" r={44} />
        <rect x={190} y={160} width={900} height={40} rx={20} fill="#3a4360" />
        <Txt x={640} y={190} size={26} color="#9aa6c4" weight={800}>
          {"ПУЛЬТ ХОРОШИХ ИДЕЙ"}
        </Txt>
        <ButtonGrid x={640} y={510} cols={10} rows={10} keep={keep} off={off} t={t} size={44} />
        {glow > 0 &&
          [33, 36, 63, 66].map((i) => {
            const g = 44 * 1.3;
            const x = 640 - (10 * g) / 2 + (i % 10) * g + 22;
            const y = 510 - (10 * g) / 2 + Math.floor(i / 10) * g + 22;
            return <circle key={i} cx={x} cy={y} r={40 + 6 * Math.sin(t * 4)} fill={C.yellow} opacity={0.35 * glow} />;
          })}
      </g>
      <Pop t={t} at={at(c, 1)} x={640} y={128}>
        <Tag x={0} y={0} text={off > 0.5 ? "осталось четыре" : "100 → 4 ?"} color={C.yellow} size={40} />
      </Pop>
    </Stage>
  );
};

// ── h02: два вопроса фильма ──
export const TwoQuestions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q1 = pop(t, at(c, 0) + 0.1);
  const q2 = pop(t, at(c, 1) + 0.1);
  const icons = ramp(t, at(c, 0.4), 1.2);
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(640 270) scale(${q1})`} opacity={clamp01(q1)}>
        <Panel x={-580} y={-120} w={1160} h={220} fill={C.white} />
        <Txt x={0} y={-24} size={52} color={C.ink}>
          {"Не лучший инженер —\nно изменил целые отрасли?"}
        </Txt>
      </g>
      <g opacity={icons} transform={`translate(0 ${(1 - icons) * 20})`}>
        {["компьютеры", "музыка", "телефоны"].map((w, i) => (
          <g key={w} transform={`translate(${300 + i * 340} 470)`}>
            <circle r={58} fill={[C.sky, C.coral, C.green][i]} opacity={0.9} />
            {i === 0 && <rect x={-30} y={-26} width={60} height={42} rx={6} fill={C.white} />}
            {i === 1 && <path d="M -14 22 L -14 -22 L 22 -30 L 22 14" stroke={C.white} strokeWidth={8} fill="none" strokeLinecap="round" />}
            {i === 2 && <rect x={-18} y={-32} width={36} height={64} rx={8} fill={C.white} />}
            <Txt x={0} y={100} size={30} color={C.inkSoft}>
              {w}
            </Txt>
          </g>
        ))}
      </g>
      <g transform={`translate(640 720) scale(${q2})`} opacity={clamp01(q2)}>
        <Panel x={-580} y={-100} w={1160} h={190} fill={C.ink} />
        <Txt x={0} y={-12} size={48} color={C.yellow}>
          {"Какую цену платил он сам —\nи люди рядом с ним?"}
        </Txt>
      </g>
    </Stage>
  );
};

// ── h03: книга Айзексона и честный формат ──
export const BookIntro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const b = pop(t, 0.2);
  const talks = ramp(t, at(c, 1), 1.2);
  const ras = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={clamp01(b)}>
        <BookCover x={260} y={450} s={0.95 * (0.7 + 0.3 * b)} t={t} />
      </g>
      <g opacity={talks}>
        <Panel x={540} y={150} w={660} h={250} />
        <Txt x={870} y={230} size={62} color={C.skyDeep} weight={900}>
          {"≈ 40 бесед"}
        </Txt>
        <Txt x={870} y={290} size={34} color={C.inkSoft}>
          {"с самим Джобсом"}
        </Txt>
        <g transform="translate(870 350)">
          {Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx={-230 + i * 20} cy={0} r={7} fill={C.violet} opacity={clamp01(talks * 24 - i)} />
          ))}
        </g>
        <Txt x={870} y={385} size={26} color={C.inkSoft}>
          {"и больше ста других людей"}
        </Txt>
      </g>
      {ras > 0 && (
        <g opacity={ras} transform={`translate(870 600)`}>
          <Panel x={-330} y={-130} w={660} h={290} fill="#f4f1ff" />
          {[-200, 0, 200].map((x, i) => (
            <g key={i}>
              <Person x={x} y={110} s={0.42} color={[C.sky, C.coral, C.green][i]} t={t} seed={i} />
              <g transform={`translate(${x + 40} -70)`}>
                <ellipse rx={66} ry={36} fill={C.white} stroke={OL} strokeWidth={3} />
                <Txt x={0} y={12} size={34} color={[C.skyDeep, C.red, C.greenDeep][i]} weight={900}>
                  {["А", "Б", "В"][i]}
                </Txt>
              </g>
            </g>
          ))}
          <Txt x={0} y={-150} size={28} color={C.violet}>
            {"одно событие — разные версии"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── h04: легенда меток ──
export const ClaimLegend: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const list: Claim[] = ["book", "jobs", "witness", "dispute", "opinion", "recon"];
  const fig = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      {list.map((k, i) => {
        const kk = pop(t, 0.3 + i * 0.35);
        const cl = CLAIMS[k];
        return (
          <g key={k} transform={`translate(${60 + (i % 2) * 600} ${170 + Math.floor(i / 2) * 140}) scale(${kk})`} opacity={clamp01(kk)}>
            <rect x={0} y={-46} width={560} height={92} rx={46} fill={C.white} />
            <circle cx={46} cy={0} r={30} fill={cl.color} />
            <text x={96} y={12} fontFamily={FONT} fontWeight={800} fontSize={33} fill={C.ink}>
              {cl.label}
            </text>
          </g>
        );
      })}
      {fig > 0 && (
        <g opacity={fig}>
          <Person x={420} y={810} s={0.5} color={C.ink} name="условная фигура" t={t} />
          <Txt x={820} y={700} size={34} color={C.inkSoft} weight={800}>
            {"не портрет —\nсхема"}
          </Txt>
          <Arrow x1={700} y1={690} x2={500} y2={640} k={ramp(t, at(c, 1.3), 0.6)} />
        </g>
      )}
    </Stage>
  );
};

// ── r01: два набора родителей ──
export const Adoption: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const home = ramp(t, 0.2, 0.8);
  const chosen = ramp(t, at(c, 1), 0.8);
  const theory = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={home}>
        {/* дом */}
        <path d="M 300 560 L 640 330 L 980 560 Z" fill={C.coral} stroke={OL} strokeWidth={5} strokeLinejoin="round" />
        <rect x={350} y={560} width={580} height={260} fill={C.cream} stroke={OL} strokeWidth={5} />
        <rect x={600} y={680} width={80} height={140} fill={C.wood} stroke={OL} strokeWidth={4} />
        <Person x={470} y={810} s={0.55} color={C.steel} name="Пол" t={t} seed={1} gesture={chosen > 0.5 ? "arms" : "stand"} />
        <Person x={810} y={810} s={0.55} color={C.violet} name="Клара" t={t} seed={2} gesture={chosen > 0.5 ? "arms" : "stand"} />
        <Person x={640} y={810} s={0.34} color={C.yellowDeep} t={t} seed={3} />
      </g>
      {chosen > 0 && (
        <g opacity={chosen}>
          <Heart x={640} y={440} s={0.9 + 0.08 * Math.sin(t * 3)} />
          <Note x={640} y={250} text={"«Мы специально\nтебя выбрали»"} k={chosen} color={C.white} size={34} />
        </g>
      )}
      {theory > 0 && (
        <g opacity={theory}>
          <Note x={190} y={240} text={"друзья: всё\nиз-за усыновления"} k={theory} rot={-4} size={26} />
          <Cross x={190} y={240} s={110} k={ramp(t, at(c, 2.4), 0.6)} />
          <Note x={1090} y={240} text={"Джобс: они —\nмои настоящие"} k={theory} rot={4} color="#dff5e6" size={26} />
        </g>
      )}
    </Stage>
  );
};

// ── r02: обратная сторона забора ──
export const FenceScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const turn = ramp(t, at(c, 1.3), 1.6);
  const xray = ramp(t, at(c, 2.2), 1);
  return (
    <Stage host={c.p.host}>
      <Bench x={640} y={830} w={1100} />
      <g transform={`translate(${xray * 160} ${-xray * 40 + xray * 150}) scale(${1 - xray * 0.25})`}>
        <Fence x={560} y={760} s={1} back={turn} good={1} />
        <Person x={1090} y={820} s={0.62} color={C.steel} name="Пол" t={t} gesture={turn > 0.2 && turn < 0.9 ? "point" : "stand"} flip />
      </g>
      <Pop t={t} at={at(c, 1.6)} x={560} y={170}>
        <Tag x={0} y={0} text={turn > 0.5 ? "изнанка — тоже аккуратно" : "лицевая сторона"} color={turn > 0.5 ? C.yellow : C.white} size={36} />
      </Pop>
      {xray > 0 && (
        <g opacity={xray} transform="translate(980 330)">
          <Panel x={-210} y={-160} w={420} h={300} fill={C.ink} />
          <Board x={0} y={-10} s={0.95} t={t} glow={1} />
          <Txt x={0} y={124} size={28} color={C.yellow}>
            {"через тридцать лет"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── r03: звонок Хьюлетту ──
export const PhoneCall: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const book = ramp(t, at(c, 1), 0.7);
  const ring = ramp(t, at(c, 1.5), 0.5);
  const gift = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <Person x={250} y={820} s={0.48} color={C.yellowDeep} name="12 лет" t={t} gesture="hold" />
      {book > 0 && (
        <g opacity={book} transform="translate(280 420) rotate(-6)">
          <rect x={-120} y={-150} width={240} height={300} rx={10} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={-90} size={30} weight={900}>
            {"СПРАВОЧНИК"}
          </Txt>
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={-90} y={-50 + i * 26} width={i === 4 ? 180 : 120 + ((i * 37) % 60)} height={10} rx={5} fill={i === 4 ? C.red : C.ink} opacity={i === 4 ? 1 : 0.35} />
          ))}
        </g>
      )}
      {ring > 0 && (
        <g opacity={ring}>
          <path d={`M 420 380 Q 640 ${240 + Math.sin(t * 3) * 20} 880 380`} stroke={C.skyDeep} strokeWidth={8} fill="none" strokeDasharray="18 14" strokeDashoffset={-t * 60} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={880} cy={380} r={30 + ((t * 60 + i * 30) % 90)} fill="none" stroke={C.skyDeep} strokeWidth={4} opacity={1 - ((t * 60 + i * 30) % 90) / 90} />
          ))}
          <Person x={1000} y={820} s={0.55} color={C.steel} name="Хьюлетт" t={t} seed={4} flip />
          <Pop t={t} at={at(c, 1.6)} x={1000} y={300}>
            <Tag x={0} y={0} text="≈ 20 минут" color={C.white} size={34} />
          </Pop>
        </g>
      )}
      {gift > 0 && (
        <g opacity={gift}>
          <g transform={`translate(640 ${560 - gift * 40})`}>
            <rect x={-80} y={-50} width={160} height={100} rx={10} fill={C.green} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={10} size={28} color={C.white}>
              {"детали"}
            </Txt>
          </g>
          <Note x={640} y={740} text={"+ летняя работа"} k={gift} color={C.white} size={30} />
        </g>
      )}
    </Stage>
  );
};

// ── r04: два Стива ──
export const TwoSteves: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const a = ramp(t, 0.2, 0.7);
  const b = ramp(t, at(c, 2), 0.7);
  const link = ramp(t, at(c, 3), 1);
  return (
    <Stage host={c.p.host}>
      <g opacity={a}>
        <Person x={320} y={800} s={0.62} color={C.sky} name="Возняк" t={t} gesture="hold" />
        <Board x={320} y={360} s={0.75} t={t} glow={link} />
        <Txt x={320} y={220} size={34} color={C.skyDeep} weight={900}>
          {"придумывает"}
        </Txt>
      </g>
      {b > 0 && (
        <g opacity={b}>
          <Person x={960} y={800} s={0.62} color={C.ink} name="Джобс" t={t} seed={2} gesture="point" flip />
          <g transform="translate(960 360)">
            {[0, 1, 2].map((i) => (
              <Person key={i} x={-120 + i * 120} y={90} s={0.28} color={[C.coral, C.green, C.violet][i]} t={t} seed={i + 5} />
            ))}
            <Txt x={0} y={-130} size={34} color={C.red} weight={900}>
              {"кому и зачем?"}
            </Txt>
          </g>
        </g>
      )}
      {link > 0 && (
        <g>
          <Arrow x1={480} y1={360} x2={780} y2={360} k={link} color={C.yellowDeep} w={12} />
          <Txt x={630} y={320} size={30} color={C.inkSoft} opacity={link}>
            {"изобретение → продукт"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── r05: синяя коробочка — плохой пример ──
export const BlueBox: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const box = pop(t, 0.3);
  const price = ramp(t, at(c, 1), 0.7);
  const rob = ramp(t, at(c, 1.55), 0.4);
  const stamp = pop(t, at(c, 3) + 0.2);
  return (
    <Stage host={c.p.host}>
      {/* условная телефонная сеть */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={140 + i * 250} y1={170} x2={140 + i * 250} y2={420} stroke={C.steel} strokeWidth={6} />
          <path d={`M ${110 + i * 250} 180 L ${170 + i * 250} 180`} stroke={C.steel} strokeWidth={6} />
          {i < 4 && <path d={`M ${140 + i * 250} 200 Q ${265 + i * 250} ${240 + Math.sin(t + i) * 6} ${390 + i * 250} 200`} stroke={C.steelDark} strokeWidth={3} fill="none" />}
        </g>
      ))}
      <g transform={`translate(640 520) scale(${box})`} opacity={clamp01(box)}>
        <rect x={-140} y={-90} width={280} height={180} rx={18} fill={C.skyDeep} stroke={OL} strokeWidth={5} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={-110 + (i % 4) * 58} y={-66 + Math.floor(i / 4) * 50} width={44} height={36} rx={8} fill={C.white} opacity={0.85} />
        ))}
      </g>
      {price > 0 && (
        <g opacity={price}>
          <Coin x={340} y={740} r={58} label="40$" />
          <Arrow x1={420} y1={740} x2={830} y2={740} k={price} color={C.inkSoft} />
          <Coin x={920} y={740} r={74} label="150$" />
          <Txt x={630} y={710} size={26} color={C.inkSoft}>
            {"детали → цена"}
          </Txt>
        </g>
      )}
      {rob > 0 && rob < 1 && <rect x={0} y={100} width={1280} height={780} fill={C.red} opacity={0.12 * Math.sin(rob * Math.PI)} />}
      {stamp > 0 && (
        <g transform={`translate(640 380) rotate(-10) scale(${0.6 + 0.4 * stamp})`} opacity={clamp01(stamp)}>
          <rect x={-300} y={-70} width={600} height={140} rx={14} fill="none" stroke={C.red} strokeWidth={12} />
          <Txt x={0} y={22} size={64} color={C.red} weight={900}>
            {"НЕ ПОДВИГ"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── r06: каллиграфия → шрифты ──
export const Calligraphy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const drop = ramp(t, at(c, 0.4), 0.8);
  const letters = ramp(t, at(c, 1), 2);
  const screen = ramp(t, at(c, 2), 0.9);
  const word = "Шрифт";
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - drop * 0.6}>
        <Panel x={80} y={150} w={360} h={220} />
        <Txt x={260} y={220} size={30} weight={900}>
          {"обязательные\nпредметы"}
        </Txt>
        <Cross x={260} y={300} s={90} k={drop} />
      </g>
      <g transform="translate(700 330)">
        <Panel x={-260} y={-170} w={620} h={330} fill="#fffaf0" />
        <text x={60} y={40} textAnchor="middle" fontFamily="Georgia, 'PT Serif', serif" fontSize={120} fill={C.ink} letterSpacing={(1 - letters) * 40 + 4}>
          {word.split("").map((ch, i) => (
            <tspan key={i} opacity={clamp01(letters * 5 - i)}>
              {ch}
            </tspan>
          ))}
        </text>
        <line x1={-210} y1={66} x2={330} y2={66} stroke={C.coral} strokeWidth={3} strokeDasharray="8 8" opacity={letters} />
        <Txt x={60} y={-110} size={28} color={C.inkSoft}>
          {"засечки · расстояния между буквами"}
        </Txt>
      </g>
      {screen > 0 && (
        <g opacity={screen} transform={`translate(640 ${720 + (1 - screen) * 30})`}>
          <rect x={-300} y={-90} width={600} height={170} rx={16} fill={C.screen} />
          {["Aa", "Бб", "Gg", "Яя"].map((s, i) => (
            <text key={i} x={-240 + i * 150} y={20} fontFamily={i % 2 ? FONT : "Georgia, serif"} fontWeight={i % 2 ? 900 : 400} fontSize={64} fill={C.white}>
              {s}
            </text>
          ))}
          <Txt x={0} y={130} size={26} color={C.inkSoft}>
            {"по оценке Джобса — шрифты первого Mac"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── r07: игровой автомат — инструкция в две строки ──
export const Arcade: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lines = ramp(t, at(c, 0.5), 1);
  const road = ramp(t, at(c, 2), 1);
  const bx = 640 + Math.sin(t * 2.2) * 120;
  const by = 330 + Math.abs(Math.sin(t * 3.1)) * -90;
  return (
    <Stage host={c.p.host}>
      <g transform={`translate(${road > 0 ? -road * 220 : 0} 0)`}>
        <path d="M 470 860 L 450 170 Q 450 130 490 130 L 790 130 Q 830 130 830 170 L 810 860 Z" fill={C.violet} stroke={OL} strokeWidth={5} />
        <rect x={500} y={190} width={280} height={250} rx={12} fill={C.screen} />
        <rect x={520 + (Math.sin(t * 2.2) + 1) * 90} y={400} width={70} height={12} rx={4} fill={C.white} />
        <circle cx={bx} cy={by} r={9} fill={C.yellow} />
        <rect x={520} y={480} width={240} height={120} rx={12} fill="#6a52c9" />
        <circle cx={600} cy={540} r={22} fill={C.red} />
        <rect x={660} y={520} width={60} height={40} rx={8} fill={C.yellow} />
        <rect x={610} y={660} width={60} height={14} rx={7} fill={OL} />
        {lines > 0 && (
          <g opacity={lines}>
            <Panel x={860} y={220} w={420} h={210} fill={C.white} />
            <Txt x={1070} y={300} size={34} weight={900}>
              {"1. Вставьте монету"}
            </Txt>
            <Txt x={1070} y={370} size={34} weight={900} opacity={clamp01(lines * 2 - 1)}>
              {"2. Уворачивайтесь"}
            </Txt>
          </g>
        )}
      </g>
      {road > 0 && (
        <g opacity={road}>
          <path d="M 860 860 Q 980 600 1200 520" stroke={C.woodLight} strokeWidth={40} fill="none" strokeLinecap="round" />
          <Person x={1020} y={760} s={0.4} color={C.coral} t={t} seed={7} />
          <Note x={1090} y={720} text={"личный поиск,\nа не рецепт"} k={road} color={C.white} size={28} />
        </g>
      )}
    </Stage>
  );
};

// ── r08: деньги за игру — две версии ──
export const AtariDispute: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const chips = ramp(t, at(c, 1), 1.4);
  const left = ramp(t, at(c, 2), 0.8);
  const right = ramp(t, at(c, 3), 0.8);
  const scaleTilt = Math.sin(t * 1.2) * 0.25;
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - left * 0.92}>
        <Board x={640} y={360} s={1.3} t={t} glow={chips} />
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i} opacity={chips}>
            <circle cx={360 + i * 30} cy={560} r={10} fill={C.yellow} />
          </g>
        ))}
        <Txt x={640} y={620} size={32} color={C.inkSoft} opacity={chips}>
          {"четыре ночи без сна · экономная схема"}
        </Txt>
      </g>
      {left > 0 && (
        <g opacity={left} transform="translate(320 470)">
          <Panel x={-280} y={-200} w={560} h={380} fill="#eef6ff" />
          <Person x={-150} y={150} s={0.42} color={C.sky} name="Возняк" t={t} />
          <g transform="translate(60 -60) rotate(-4)">
            <rect x={-140} y={-50} width={280} height={100} rx={10} fill={C.white} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={16} size={40} weight={900} color={C.greenDeep}>
              {"чек 350$"}
            </Txt>
          </g>
          <Txt x={60} y={60} size={26} color={C.inkSoft}>
            {"о премии узнал\nчерез 10 лет"}
          </Txt>
        </g>
      )}
      {right > 0 && (
        <g opacity={right} transform="translate(960 470)">
          <Panel x={-280} y={-200} w={560} h={380} fill="#f4f1f8" />
          <Person x={150} y={150} s={0.42} color={C.ink} name="Джобс" t={t} seed={3} flip />
          <Txt x={-50} y={-90} size={30} weight={900} color={C.ink}>
            {"«не помню»"}
          </Txt>
          <Txt x={-50} y={-30} size={26} color={C.inkSoft}>
            {"«отдал половину\nтого, что получил»"}
          </Txt>
        </g>
      )}
      {right > 0.5 && (
        <g transform={`translate(640 160) rotate(${scaleTilt * 8})`}>
          <rect x={-190} y={-38} width={380} height={76} rx={38} fill={C.red} />
          <Txt x={0} y={13} size={34} color={C.white} weight={900}>
            {"версии расходятся"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};
