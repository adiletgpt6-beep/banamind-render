// «Гараж»: клуб самодельщиков, стартовый капитал, первый заказ и сборка, слои
// продукта, три правила Марккулы, кто создал вторую модель.
import React from "react";
import { C } from "../theme";
import { BeigeBox, Board, Coin, Garage, Note, OL, Person, Stage } from "./draw";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── g01: клуб любителей, первая буква на экране, «продавать, а не раздавать» ──
export const Homebrew: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const open = ramp(t, 0.2, 1.4);
  const letter = ramp(t, at(c, 1.5), 0.6);
  const sell = ramp(t, at(c, 2.3), 0.8);
  return (
    <Stage host={c.p.host}>
      <Garage x={430} y={820} s={0.82} open={open}>
        {open > 0.3 &&
          [0, 1, 2, 3, 4].map((i) => <Person key={i} x={-220 + i * 110} y={0} s={0.32} color={[C.sky, C.coral, C.green, C.violet, C.yellowDeep][i]} t={t} seed={i} />)}
      </Garage>
      <Txt x={430} y={170} size={30} color={C.inkSoft} opacity={open}>
        {"клуб любителей · 1975"}
      </Txt>
      <g transform="translate(1000 400)">
        <rect x={-180} y={-150} width={360} height={260} rx={18} fill={C.screen} stroke={OL} strokeWidth={5} />
        {letter > 0 && (
          <text x={-150} y={-60} fontFamily="monospace" fontSize={90} fill={C.green} opacity={letter}>
            A
          </text>
        )}
        <rect x={-150 + (letter > 0 ? 60 : 0)} y={-100} width={40} height={60} fill={C.green} opacity={Math.sin(t * 6) > 0 ? 0.9 : 0} />
        <Txt x={0} y={160} size={26} color={C.inkSoft}>
          {"первая буква на экране"}
        </Txt>
      </g>
      {sell > 0 && (
        <g opacity={sell} transform="translate(1000 720)">
          <rect x={-250} y={-60} width={240} height={110} rx={14} fill={C.white} stroke={OL} strokeWidth={3} />
          <Txt x={-130} y={10} size={28}>
            {"схема даром"}
          </Txt>
          <Arrow x1={0} y1={-5} x2={50} y2={-5} k={sell} />
          <rect x={60} y={-60} width={220} height={110} rx={14} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <Txt x={170} y={10} size={28}>
            {"готовая плата"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── g02: микроавтобус и калькулятор → капитал; название ──
export const StartCapital: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sold = ramp(t, at(c, 0.5), 1.2);
  const name = pop(t, at(c, 1.3));
  const wayne = ramp(t, at(c, 2), 1);
  return (
    <Stage host={c.p.host}>
      {/* микроавтобус уезжает */}
      <g transform={`translate(${260 - sold * 420} 380)`} opacity={1 - sold * 0.8}>
        <rect x={-150} y={-90} width={300} height={140} rx={40} fill={C.sky} stroke={OL} strokeWidth={5} />
        <rect x={-120} y={-70} width={90} height={50} rx={10} fill={C.white} />
        <rect x={-20} y={-70} width={90} height={50} rx={10} fill={C.white} />
        <circle cx={-90} cy={55} r={32} fill={OL} />
        <circle cx={90} cy={55} r={32} fill={OL} />
      </g>
      <g transform={`translate(560 ${400 - sold * 60})`} opacity={1 - sold * 0.8}>
        <rect x={-60} y={-90} width={120} height={180} rx={14} fill={C.steelDark} stroke={OL} strokeWidth={4} />
        <rect x={-44} y={-74} width={88} height={40} rx={6} fill="#c7e3b5" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={-44 + (i % 3) * 32} y={-20 + Math.floor(i / 3) * 32} width={24} height={22} rx={5} fill={C.concrete} />
        ))}
      </g>
      {sold > 0.3 && (
        <g opacity={clamp01(sold * 2 - 0.6)}>
          {[0, 1, 2].map((i) => (
            <Coin key={i} x={400 + i * 70} y={600 - i * 18} r={46} />
          ))}
          <Txt x={470} y={720} size={32} color={C.inkSoft}>
            {"первый капитал"}
          </Txt>
        </g>
      )}
      {name > 0 && (
        <g transform={`translate(950 380) scale(${name}) rotate(${wob(t, 1, 3)})`} opacity={clamp01(name)}>
          <circle r={130} fill={C.green} stroke={OL} strokeWidth={6} />
          <path d="M 0 -130 Q 20 -190 70 -200" stroke={C.woodDark} strokeWidth={14} fill="none" strokeLinecap="round" />
          <ellipse cx={60} cy={-170} rx={44} ry={20} fill={C.greenDeep} transform="rotate(-25 60 -170)" />
          <Txt x={0} y={24} size={64} color={C.white} weight={900}>
            Apple
          </Txt>
        </g>
      )}
      {wayne > 0 && (
        <g opacity={wayne}>
          <Person x={950 + wayne * 160} y={830} s={0.44} color={C.coral} name="Уэйн" t={t} seed={4} flip />
          <Note x={980} y={640} text={"вышел через\n11 дней"} k={wayne} size={28} rot={3} />
        </g>
      )}
    </Stage>
  );
};

// ── g03: первый заказ и сборка в гараже (реконструкция) ──
export const GarageWork: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const order = pop(t, at(c, 0) + 0.3);
  const credit = ramp(t, at(c, 1), 0.8);
  const shop = ramp(t, at(c, 2), 1);
  const team = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      {order > 0 && (
        <g transform={`translate(280 260) scale(${order}) rotate(-3)`} opacity={clamp01(order)}>
          <rect x={-200} y={-120} width={400} height={240} rx={12} fill={C.white} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={-60} size={32} weight={900}>
            {"ЗАКАЗ"}
          </Txt>
          <Txt x={0} y={0} size={40} color={C.skyDeep} weight={900}>
            {"50 × 500$"}
          </Txt>
          <Txt x={0} y={60} size={26} color={C.inkSoft}>
            {"только собранные"}
          </Txt>
        </g>
      )}
      {credit > 0 && (
        <g opacity={credit} transform="translate(280 560)">
          <rect x={-200} y={-70} width={400} height={140} rx={14} fill={C.cream} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={-10} size={30} weight={900}>
            {"детали в кредит"}
          </Txt>
          <Txt x={0} y={40} size={28} color={C.red}>
            {"на 30 дней"}
          </Txt>
        </g>
      )}
      <g opacity={shop}>
        <rect x={560} y={160} width={680} height={700} rx={20} fill="#3a4253" />
        <rect x={600} y={200} width={600} height={160} rx={8} fill={C.concrete} />
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <rect x={612 + (i % 6) * 98} y={212 + Math.floor(i / 6) * 74} width={88} height={62} rx={6} fill={C.white} stroke={OL} strokeWidth={2} />
            <Txt x={656 + (i % 6) * 98} y={252 + Math.floor(i / 6) * 74} size={22}>
              {String(i + 1)}
            </Txt>
          </g>
        ))}
        <rect x={600} y={600} width={600} height={30} rx={6} fill={C.woodDark} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Board x={700 + i * 200} y={560} s={0.36} t={t} glow={1} />
            <circle cx={700 + i * 200} cy={410} r={20} fill={C.coral} opacity={0.5 + 0.3 * Math.sin(t * 2 + i)} />
          </g>
        ))}
      </g>
      {team > 0 && (
        <g opacity={team}>
          {["Возняк", "Джобс", "Коттке", "Патти"].map((n, i) => (
            <Person key={n} x={640 + i * 150} y={850} s={0.34} color={[C.sky, C.ink, C.green, C.violet][i]} name={n} t={t} seed={i} gesture={i === 0 ? "hold" : "stand"} />
          ))}
        </g>
      )}
    </Stage>
  );
};

// ── g04: голая плата → готовый продукт (слои) ──
export const ProductLayers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const thousand = ramp(t, at(c, 1), 1);
  const asm = ramp(t, at(c, 2), 1.6);
  const tasks = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 420)">
        <Board x={0} y={0} s={0.9} t={t} />
        <Txt x={0} y={-150} size={30} color={C.inkSoft}>
          {"голая плата"}
        </Txt>
        {["корпус", "клавиатура", "блок питания"].map((w, i) => (
          <g key={w} transform={`translate(0 ${170 + i * 56})`}>
            <rect x={-160} y={-24} width={320} height={46} rx={23} fill={asm > (i + 1) / 4 ? C.green : C.white} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={10} size={26} color={asm > (i + 1) / 4 ? C.white : C.ink}>
              {asm > (i + 1) / 4 ? `✓ ${w}` : `нет: ${w}`}
            </Txt>
          </g>
        ))}
      </g>
      {thousand > 0 && (
        <g opacity={thousand * (1 - asm)}>
          <Person x={760} y={460} s={0.4} color={C.coral} name="любитель" t={t} />
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={880 + (i % 10) * 34} cy={250 + Math.floor(i / 10) * 40} r={11} fill={C.sky} opacity={clamp01(thousand * 40 - i)} />
          ))}
          <Txt x={1040} y={460} size={30} color={C.skyDeep}>
            {"× 1000 людей"}
          </Txt>
        </g>
      )}
      {asm > 0 && (
        <g opacity={asm} transform={`translate(950 ${520 + (1 - asm) * 40})`}>
          <BeigeBox x={0} y={0} s={1.05} t={t} on={asm} />
          <Txt x={0} y={110} size={26} color={C.inkSoft}>
            {"корпус — Мэнок · питание — Холт"}
          </Txt>
        </g>
      )}
      {tasks > 0 && (
        <g opacity={tasks}>
          {["изобретение", "спрос", "упаковка"].map((w, i) => (
            <Tag key={w} x={250 + i * 390} y={830} text={w} color={[C.sky, C.coral, C.yellow][i]} size={32} />
          ))}
        </g>
      )}
    </Stage>
  );
};

// ── g05: три правила Марккулы ──
export const ThreeRules: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rules = [
    { w: "эмпатия", d: "понимать нужды людей", at: at(c, 1.2) },
    { w: "фокус", d: "отбросить второстепенное", at: at(c, 1.7) },
    { w: "впечатление", d: "судят по обложке", at: at(c, 2.2) },
  ];
  return (
    <Stage host={c.p.host}>
      <Person x={160} y={820} s={0.55} color={C.steelDark} name="Марккула" t={t} gesture="point" />
      {rules.map((r, i) => {
        const k = pop(t, r.at);
        return (
          <g key={r.w} transform={`translate(${720} ${260 + i * 210}) scale(${k})`} opacity={clamp01(k)}>
            <Panel x={-430} y={-80} w={860} h={160} fill={C.white} />
            <circle cx={-350} cy={0} r={50} fill={[C.coral, C.sky, C.yellow][i]} />
            <Txt x={-350} y={16} size={48} weight={900} color={C.white}>
              {String(i + 1)}
            </Txt>
            <Txt x={-270} y={-6} size={46} weight={900} anchor="start">
              {r.w}
            </Txt>
            <Txt x={-270} y={44} size={30} color={C.inkSoft} anchor="start">
              {r.d}
            </Txt>
          </g>
        );
      })}
      {ramp(t, at(c, 2.6), 0.6) > 0 && (
        <g opacity={ramp(t, at(c, 2.6), 0.6)} transform="translate(1080 760) rotate(6)">
          <rect x={-90} y={-60} width={180} height={120} rx={8} fill={C.white} stroke={OL} strokeWidth={4} />
          <path d="M -90 -20 L 90 -20" stroke={C.yellowDeep} strokeWidth={6} />
          <Txt x={0} y={36} size={22} color={C.inkSoft}>
            {"даже коробка"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── g06: кто создал? обе фразы верны ──
export const CreditSplit: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sales = ramp(t, 0.2, 2);
  const split = ramp(t, at(c, 1), 0.8);
  const both = ramp(t, at(c, 2), 0.6);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 330)">
        <BeigeBox x={0} y={60} s={0.9} t={t} />
        <Txt x={0} y={150} size={34} weight={900} color={C.skyDeep} opacity={sales}>
          {"16 лет · ≈ 6 млн"}
        </Txt>
      </g>
      {split > 0 && (
        <g opacity={split}>
          <g transform="translate(250 650)">
            <Panel x={-220} y={-110} w={440} h={220} fill="#eaf6ff" />
            <Txt x={0} y={-40} size={34} weight={900}>
              {"сердце машины"}
            </Txt>
            <Txt x={0} y={20} size={30} color={C.skyDeep}>
              {"Возняк"}
            </Txt>
          </g>
          <g transform="translate(1030 650)">
            <Panel x={-220} y={-110} w={440} h={220} fill="#fff4e0" />
            <Txt x={0} y={-40} size={34} weight={900}>
              {"путь к людям"}
            </Txt>
            <Txt x={0} y={20} size={30} color={C.coral}>
              {"Джобс"}
            </Txt>
          </g>
        </g>
      )}
      {both > 0 && (
        <g opacity={both}>
          <Check x={400} y={820} s={46} k={both} />
          <Txt x={700} y={835} size={40} weight={900} color={C.greenDeep}>
            {"верно и то и другое"}
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 0.3)} x={640} y={150}>
        <Tag x={0} y={0} text="Кто создал?" color={C.yellow} size={42} />
      </Pop>
    </Stage>
  );
};
