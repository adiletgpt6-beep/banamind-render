// Части «Продажи» и «Будущее»: «построите — придут?», выгода от клиента и цена
// привлечения, лестница способов продавать, вирусный рост, один канал,
// человек и компьютер, гибридная система «Игорь».
import React from "react";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, Z } from "../theme";
import { Cat, Coin, Dot, Laptop, Megaphone, OL, Rocket, Shop } from "./draw";
import { AX } from "./parts";

type VP = VisualProps<{ host?: string }>;

// ── «Если построите — придут?» Нет: дистрибуция — часть продукта ──
export const BuildIt: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const empty = ramp(t, at(c, 0.6), 0.6);
  const hidden = ramp(t, at(c, 1), 0.6);
  const part = pop(t, at(c, 2));
  return (
    <g>
      <g transform={`translate(${cx - 220} 640)`}>
        <circle cx={0} cy={-120} r={190} fill={C.yellow} opacity={0.25} />
        <Shop x={0} y={0} s={1.6} awning={Z.teal} label="отличный продукт" />
      </g>
      {empty > 0 && (
        <g opacity={empty}>
          <path d={`M ${cx - 80} 660 Q ${cx + 150} 640 ${cx + 450} 660`} stroke={Z.grey} strokeWidth={30} strokeLinecap="round" opacity={0.4} />
          <g transform={`translate(${cx + 380} 520) rotate(${wob(t * 2, 1, 4)})`}>
            <Txt x={0} y={0} size={80} weight={900} color={C.inkSoft}>
              ?
            </Txt>
          </g>
          <Tag x={cx + 280} y={300} text="клиенты сами не придут" size={34} color="#ffd9d6" />
        </g>
      )}
      {hidden > 0 && (
        <g opacity={hidden * (1 - part * 0.3)}>
          <g transform={`translate(${cx + 330} 620)`} opacity={0.35 + 0.25 * Math.sin(t * 2)}>
            <Dot x={0} y={0} s={1.6} color={Z.purple} />
            <Megaphone x={70} y={-50} s={0.5} t={t} />
          </g>
          <Txt x={cx + 330} y={760} size={28} color={C.inkSoft}>
            хорошие продажи незаметны
          </Txt>
        </g>
      )}
      {part > 0 && (
        <g transform={`translate(${cx} 200) scale(${part})`}>
          <Tag x={0} y={0} text="продажи = часть продукта" size={42} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Выгода от клиента за всё время > цена его привлечения ──
export const Ltv: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const left = ramp(t, 0.3, 0.8);
  const right = ramp(t, at(c, 0.55), 0.8);
  const rule = pop(t, at(c, 1));
  const tilt = ramp(t, at(c, 1), 1) * -8;
  return (
    <g>
      <line x1={cx} y1={300} x2={cx} y2={700} stroke={C.ink} strokeWidth={10} />
      <path d={`M ${cx - 90} 720 L ${cx + 90} 720 L ${cx} 680 Z`} fill={C.ink} />
      <g transform={`rotate(${tilt} ${cx} 320)`}>
        <line x1={cx - 380} y1={320} x2={cx + 380} y2={320} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <g transform={`translate(${cx - 380} 320)`} opacity={left}>
          <line x1={0} y1={0} x2={0} y2={60} stroke={C.ink} strokeWidth={5} />
          <path d="M -130 60 L 130 60 Q 100 140 0 140 Q -100 140 -130 60 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Coin key={i} x={-70 + i * 35} y={40 - (i % 2) * 30} s={0.6} />
          ))}
          <Txt x={0} y={200} size={30} weight={900}>
            выгода от клиента
          </Txt>
          <Txt x={0} y={236} size={26} color={C.inkSoft}>
            за всё время
          </Txt>
        </g>
        <g transform={`translate(${cx + 380} 320)`} opacity={right}>
          <line x1={0} y1={0} x2={0} y2={60} stroke={C.ink} strokeWidth={5} />
          <path d="M -130 60 L 130 60 Q 100 140 0 140 Q -100 140 -130 60 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <Coin x={0} y={40} s={0.6} />
          <Txt x={0} y={200} size={30} weight={900}>
            цена привлечения
          </Txt>
        </g>
      </g>
      {rule > 0 && (
        <g transform={`translate(${cx} 820) scale(${rule})`}>
          <Tag x={0} y={0} text="первое должно быть больше второго" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Лестница способов продавать (от дорогих сделок к вирусному росту) ──
export const SalesLadder: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const steps = [
    { title: "сложные сделки", sub: "SpaceX и NASA", color: Z.purple, icon: <Rocket x={0} y={20} s={0.38} t={t} /> },
    { title: "личные продажи", sub: "Box", color: Z.teal, icon: <Dot x={0} y={18} s={1} color={Z.teal} /> },
    { title: "«мёртвая зона»", sub: "≈ 1000 $", color: C.red, icon: <Txt x={0} y={20} size={50} weight={900} color={C.red}>?</Txt> },
    { title: "маркетинг и реклама", sub: "массовые товары", color: C.coral, icon: <Megaphone x={0} y={0} s={0.42} t={t} /> },
    { title: "вирусный рост", sub: "пользователи зовут друзей", color: C.green, icon: <Dot x={0} y={18} s={1} color={C.green} ring={C.yellowDeep} /> },
  ];
  const active = steps.findIndex((_, i) => i === steps.length - 1 || t < at(c, i + 1));
  return (
    <g>
      <Txt x={cx - 450} y={170} size={28} color={C.inkSoft} anchor="start">
        цена сделки ↑
      </Txt>
      {steps.map((s, i) => {
        const k = pop(t, at(c, i) - 0.05);
        if (k <= 0) return null;
        const y = 200 + i * 120;
        const w = 520 + i * 90;
        const on = i === active;
        return (
          <g key={i} transform={`translate(${cx - 450 + (1 - k) * 60} ${y})`} opacity={clamp01(k * 1.5) * (on ? 1 : 0.75)}>
            <rect x={0} y={0} width={w} height={100} rx={22} fill={on ? C.yellow : "#ffffffdd"} stroke={on ? OL : s.color} strokeWidth={on ? 5 : 4} />
            <g transform="translate(60 50)">
              <circle r={40} fill="#fff" stroke={OL} strokeWidth={3} />
              <g transform="scale(0.8)">{s.icon}</g>
            </g>
            <Txt x={120} y={46} size={34} weight={900} anchor="start">
              {s.title}
            </Txt>
            <Txt x={120} y={84} size={24} color={C.inkSoft} anchor="start">
              {s.sub}
            </Txt>
            {i === 2 && <Cross x={w - 50} y={50} s={50} k={ramp(t, at(c, 2.6), 0.4)} />}
          </g>
        );
      })}
    </g>
  );
};

// ── Вирусный рост: +7 % в день → удвоение примерно за 10 дней ──
export const Viral: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const g = ramp(t, 0.3, Math.max(1, at(c, 1.8) - 0.3));
  const gens = 1 + Math.floor(g * 5.99);
  const nodes: { x: number; y: number; gen: number; px: number; py: number }[] = [{ x: cx, y: 480, gen: 0, px: cx, py: 480 }];
  for (let gen = 1; gen < gens; gen++) {
    const prev = nodes.filter((n) => n.gen === gen - 1);
    prev.forEach((p, j) => {
      [0, 1].forEach((k) => {
        const a = ((j * 2 + k) / (prev.length * 2)) * Math.PI * 2 + gen * 0.4;
        const r = 70 * gen;
        nodes.push({ x: cx + Math.cos(a) * r * 1.35, y: 480 + Math.sin(a) * r * 0.85, gen, px: p.x, py: p.y });
      });
    });
  }
  return (
    <g>
      {nodes.map((n, i) => (
        <line key={`l${i}`} x1={n.px} y1={n.py} x2={n.x} y2={n.y} stroke={Z.grey} strokeWidth={3} opacity={0.6} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={Math.max(7, 22 - n.gen * 3)} fill={n.gen === gens - 1 ? C.yellow : Z.teal} stroke={OL} strokeWidth={3} />
      ))}
      <Pop t={t} at={0.4} x={cx - 380} y={190}>
        <Tag x={0} y={0} text="+7 % в день" size={40} color={C.yellow} />
      </Pop>
      <Pop t={t} at={at(c, 1)} x={cx + 340} y={190}>
        <Tag x={0} y={0} text="×2 ≈ каждые 10 дней" size={40} color={C.white} />
      </Pop>
    </g>
  );
};

// ── Один работающий канал; продавать и компанию; «продавец — вы сами» ──
export const OneChannel: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const pipes = ramp(t, 0.2, 0.6);
  const one = ramp(t, at(c, 1), 0.6);
  const company = ramp(t, at(c, 2), 0.6);
  const you = pop(t, at(c, 3));
  const flows = [0.25, 0.1, 1, 0.15];
  return (
    <g>
      <g opacity={pipes * (1 - company)}>
        {flows.map((f, i) => {
          const x = cx - 390 + i * 260;
          const main = i === 2;
          const w = main ? 30 + 40 * one : 14;
          return (
            <g key={i}>
              <rect x={x - w / 2} y={240} width={w} height={420} rx={w / 2} fill={main && one > 0 ? C.green : Z.greySoft} stroke={OL} strokeWidth={3} />
              {Array.from({ length: main ? 6 : 1 }).map((_, k) => (
                <Coin key={k} x={x} y={260 + ((t * 160 * (main ? 1 + one : f) + k * 70) % 400)} s={main ? 0.6 : 0.4} />
              ))}
              {!main && <Cross x={x} y={720} s={50} k={ramp(t, at(c, 0.6), 0.4)} />}
            </g>
          );
        })}
        <Tag x={cx} y={190} text="один канал сильнее всех остальных" size={34} color={C.white} />
      </g>
      {company > 0 && (
        <g opacity={company * (1 - you * 0.6)}>
          <Shop x={cx} y={560} s={1.3} awning={Z.teal} label="ваша компания" />
          {[
            [-320, "сотрудникам"],
            [320, "партнёрам"],
          ].map(([dx, s]) => (
            <g key={String(s)}>
              <Dot x={cx + Number(dx)} y={520} s={1.4} color={Z.purple} />
              <Tag x={cx + Number(dx)} y={640} text={String(s)} size={28} color={C.white} />
              <Arrow x1={cx + Number(dx) * 0.3} y1={460} x2={cx + Number(dx) * 0.75} y2={470} k={ramp(t, at(c, 2.2), 0.5)} color={C.coral} w={6} />
            </g>
          ))}
        </g>
      )}
      {you > 0 && (
        <g transform={`translate(${cx} 240) scale(${you})`}>
          <Tag x={0} y={0} text="нет продавцов? продавец — вы" size={42} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Человек и компьютер сильны в разном ──
export const HumanMachine: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const fear = ramp(t, 0.2, 0.6);
  const split = ramp(t, at(c, 1), 0.6);
  const cat = ramp(t, at(c, 2), 0.6);
  const together = pop(t, at(c, 3));
  return (
    <g>
      <g opacity={fear * (1 - split)}>
        <Txt x={cx} y={300} size={44} weight={900}>
          машины заменят людей?
        </Txt>
        <Dot x={cx - 200} y={520} s={2} color={C.coral} />
        <Laptop x={cx + 200} y={580} s={0.9} t={t} />
        <Arrow x1={cx + 60} y1={480} x2={cx - 100} y2={480} k={ramp(t, 0.6, 0.6)} color={C.red} w={8} />
      </g>
      {split > 0 && (
        <g opacity={split * (1 - together * 0.4)}>
          <Panel x={cx - 540} y={200} w={500} h={300} fill="#ffe7c2" />
          <Dot x={cx - 290} y={330} s={1.6} color={C.coral} />
          <Txt x={cx - 290} y={430} size={30} weight={900}>
            человек: решения
          </Txt>
          <Txt x={cx - 290} y={470} size={26} color={C.inkSoft}>
            понимает сложное
          </Txt>
          <Panel x={cx + 40} y={200} w={500} h={300} fill={Z.tealSoft} />
          <Laptop x={cx + 290} y={370} s={0.6} t={t} />
          <Txt x={cx + 290} y={430} size={30} weight={900}>
            компьютер: данные
          </Txt>
          <Txt x={cx + 290} y={470} size={26} color={C.inkSoft}>
            считает огромные объёмы
          </Txt>
        </g>
      )}
      {cat > 0 && (
        <g opacity={cat * (1 - together)}>
          <Cat x={cx} y={800} s={0.8} t={t} />
          <Tag x={cx - 330} y={640} text="компьютер Google: 3 из 4" size={28} color={C.white} />
          <Tag x={cx + 330} y={640} text="ребёнок 4 лет: без ошибок" size={28} color={C.yellow} />
        </g>
      )}
      {together > 0 && (
        <g transform={`translate(${cx} 720) scale(${together})`}>
          <Tag x={0} y={0} text="компьютер — помощник, а не замена" size={40} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── Гибрид «Игорь»: компьютер отмечает, человек решает ──
export const Igor: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const loss = pop(t, 0.3);
  const auto = ramp(t, at(c, 1), 0.6);
  const hybrid = ramp(t, at(c, 2), 0.6);
  const win = pop(t, at(c, 3));
  return (
    <g>
      {loss > 0 && (
        <g transform={`translate(${cx} 210) scale(${loss})`} opacity={1 - hybrid * 0.7}>
          <Tag x={0} y={0} text="−10 млн $ в месяц на мошенничестве" size={34} color="#ffd9d6" />
        </g>
      )}
      {/* поток платежей */}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = cx - 520 + ((t * 180 + i * 130) % 1100);
        const bad = i % 4 === 1;
        const flagged = hybrid > 0 && bad && x > cx - 120;
        return (
          <g key={i} transform={`translate(${x} 470)`}>
            <rect x={-40} y={-26} width={80} height={52} rx={8} fill={bad ? (flagged ? C.red : "#ffd9d6") : "#fff"} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={10} size={26} weight={900} color={bad ? C.red : C.inkSoft}>
              $
            </Txt>
          </g>
        );
      })}
      <g opacity={auto * (1 - hybrid)}>
        <Laptop x={cx} y={700} s={0.8} t={t} />
        <Tag x={cx} y={330} text="только автомат: мошенники обходят" size={30} color={C.white} />
      </g>
      {hybrid > 0 && (
        <g opacity={hybrid}>
          <Laptop x={cx - 170} y={720} s={0.7} t={t} />
          <Txt x={cx - 170} y={790} size={26} weight={900}>
            отмечает
          </Txt>
          <Dot x={cx + 170} y={660} s={1.6} color={C.coral} />
          <Txt x={cx + 170} y={790} size={26} weight={900}>
            решает
          </Txt>
          <Arrow x1={cx - 40} y1={640} x2={cx + 80} y2={640} k={ramp(t, at(c, 2.3), 0.5)} color={C.coral} w={8} />
          <Tag x={cx} y={330} text="«Игорь» = компьютер + человек" size={34} color={C.yellow} />
        </g>
      )}
      {win > 0 && (
        <g transform={`translate(${cx + 400} 600) scale(${win})`}>
          <Check x={0} y={0} s={60} k={ramp(t, at(c, 3.1), 0.5)} />
        </g>
      )}
    </g>
  );
};
