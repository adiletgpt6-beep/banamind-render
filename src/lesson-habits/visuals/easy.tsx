// Закон 3 «Сделайте простым»: количество против качества, линия привычки,
// закон наименьшего усилия (шланг), подготовка окружения, правило двух минут,
// обратный закон «усложните» (сундук Гюго, роутер с таймером, автоматизация).
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { OL, Phone, Worker } from "./draw";
import { Arrow, Check, Cross, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Chip, Fork, Hose, Icon, Router, TV, Trunk, zoneX } from "./parts";

// фотокарточка
const Photo: React.FC<{ x: number; y: number; s?: number; rot?: number; hue?: number }> = ({ x, y, s = 1, rot = 0, hue = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-70} y={-56} width={140} height={112} rx={6} fill="#fff" stroke={OL} strokeWidth={3} />
    <rect x={-60} y={-46} width={120} height={78} fill={[C.sky, C.green, C.pink, C.yellow][hue % 4]} />
    <path d="M -60 32 L -20 -6 L 10 20 L 30 4 L 60 32 Z" fill="#fff" opacity={0.6} />
  </g>
);

export const Photos: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const split = pop(t, at(c, 1) - 0.1);
  const pile = ramp(t, at(c, 1.3), Math.max(1, at(c, 2.8) - at(c, 1.3)));
  const trophy = pop(t, at(c, 2.3));
  const motion = ramp(t, at(c, 3), 0.6);
  const first = 1 - motion;
  return (
    <g>
      {first > 0 && (
        <g opacity={first * clamp01(split * 2)}>
          <line x1={cx} y1={200} x2={cx} y2={820} stroke={OL} strokeWidth={4} strokeDasharray="16 12" />
          <Txt x={cx - 300} y={230} size={38} weight={900}>
            «количество»
          </Txt>
          <Txt x={cx + 300} y={230} size={38} weight={900}>
            «качество»
          </Txt>
          {Array.from({ length: 22 }).map((_, i) => {
            const k = clamp01(pile * 22 - i);
            if (k <= 0) return null;
            return <Photo key={i} x={cx - 300 + ((i * 53) % 260) - 130} y={720 - Math.floor(i / 5) * 60 - (1 - k) * 200} s={0.8} rot={((i * 37) % 40) - 20} hue={i} />;
          })}
          <Worker x={cx + 230} y={720} s={1.1} role="plain" color={C.violet} t={t} mood="flat" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx + 290 + i * 34} cy={480 - i * 40} r={14 + i * 8} fill="#fff" stroke={OL} strokeWidth={3} />
          ))}
          <g transform={`translate(${cx + 400} 340)`}>
            <rect x={-90} y={-60} width={180} height={120} rx={50} fill="#fff" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={14} size={30}>
              идеал?
            </Txt>
          </g>
          <Photo x={cx + 380} y={680} s={0.9} rot={4} hue={2} />
          {trophy > 0 && (
            <g transform={`translate(${cx - 300} 380) scale(${trophy})`}>
              <path d="M -50 -60 L 50 -60 L 40 10 Q 0 50 -40 10 Z" fill={C.yellow} stroke={OL} strokeWidth={5} />
              <rect x={-10} y={30} width={20} height={40} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
              <rect x={-44} y={66} width={88} height={20} rx={6} fill={C.wood} stroke={OL} strokeWidth={3} />
              <Txt x={0} y={-80} size={30} color={C.greenDeep}>
                лучшие снимки
              </Txt>
            </g>
          )}
        </g>
      )}
      {motion > 0 && (
        <g opacity={motion}>
          <g transform={`translate(${cx - 290} 520)`}>
            <rect x={-250} y={-220} width={500} height={440} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-150} size={40} weight={900} color={C.inkSoft}>
              движение
            </Txt>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${-120 + i * 120} ${-20 + i * 30}) rotate(${(i - 1) * 8})`}>
                <rect x={-60} y={-80} width={120} height={160} rx={8} fill="#fffaf0" stroke={OL} strokeWidth={3} />
                {[0, 1, 2, 3].map((r) => (
                  <line key={r} x1={-40} y1={-50 + r * 30} x2={40} y2={-50 + r * 30} stroke={C.grey} strokeWidth={5} strokeLinecap="round" />
                ))}
              </g>
            ))}
            <Txt x={0} y={180} size={30} color={C.inkSoft}>
              планы, книги о диетах
            </Txt>
          </g>
          <g transform={`translate(${cx + 290} 520) scale(${pop(t, at(c, 3.4))})`}>
            <rect x={-250} y={-220} width={500} height={440} rx={30} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-150} size={40} weight={900} color={C.greenDeep}>
              действие
            </Txt>
            <ellipse cx={0} cy={20} rx={150} ry={60} fill="#fff" stroke={OL} strokeWidth={5} />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={-80 + i * 40} cy={10 + (i % 2) * 14} r={22} fill={[C.green, C.red, C.yellow, C.green, C.orange][i]} stroke={OL} strokeWidth={3} />
            ))}
            <Txt x={0} y={180} size={30} color={C.greenDeep}>
              полезный обед — на тарелке
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

export const HabitLine: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const q = pop(t, 0.2);
  const draw = ramp(t, at(c, 1), 2.4);
  const line = ramp(t, at(c, 1.6), 0.6);
  const myth = ramp(t, at(c, 2), 0.5);
  const X0 = cx - 470;
  const Y0 = 740;
  const W = 900;
  const H = 440;
  const f = (x: number) => 1 - Math.exp(-x * 3.4);
  const n = Math.max(2, Math.round(60 * draw));
  const pts = Array.from({ length: n }, (_, i) => `${X0 + (i / 59) * W},${Y0 - f(i / 59) * H}`).join(" ");
  const dots = Math.floor(draw * 18);
  return (
    <g>
      <g opacity={clamp01(q * 2)}>
        <line x1={X0} y1={Y0} x2={X0 + W + 30} y2={Y0} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 40} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        <Txt x={X0 + W - 60} y={Y0 + 54} size={30} color={C.inkSoft}>
          повторения
        </Txt>
        <Txt x={X0 + 10} y={Y0 - H - 60} size={30} color={C.inkSoft} anchor="start">
          автоматизм
        </Txt>
        {Array.from({ length: dots }).map((_, i) => (
          <circle key={i} cx={X0 + ((i + 1) / 19) * W} cy={Y0 + 20} r={9} fill={C.green} />
        ))}
        <polyline points={pts} fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        {line > 0 && (
          <g opacity={line}>
            <line x1={X0} y1={Y0 - H * 0.82} x2={X0 + W} y2={Y0 - H * 0.82} stroke={C.violet} strokeWidth={6} strokeDasharray="18 12" />
            <Chip x={X0 + W - 140} y={Y0 - H * 0.82 - 50} text="линия привычки" size={32} color="#e9e2ff" k={line} />
          </g>
        )}
        <Txt x={X0 + 140} y={Y0 - 60} size={28} color={C.inkSoft} opacity={draw > 0.1 ? 1 : 0}>
          с усилием
        </Txt>
      </g>
      {myth > 0 && (
        <g>
          {[
            { text: "21 день?", x: -330 },
            { text: "300 дней?", x: -60 },
          ].map((m, i) => (
            <g key={i} transform={`translate(${cx + m.x} 220) scale(${pop(t, at(c, 2) + i * 0.4)})`}>
              <rect x={-120} y={-50} width={240} height={100} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={38} color={C.inkSoft}>
                {m.text}
              </Txt>
              <Cross x={0} y={0} s={90} k={ramp(t, at(c, 2.5) + i * 0.2, 0.4)} />
            </g>
          ))}
          <g transform={`translate(${cx + 300} 220) scale(${pop(t, at(c, 2.7))})`}>
            <rect x={-170} y={-50} width={340} height={100} rx={30} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={14} size={38} color={C.greenDeep}>
              сколько раз
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

export const Friction: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const two = pop(t, 0.2);
  const hose = ramp(t, at(c, 1), 0.5);
  const crank = ramp(t, at(c, 1.4), 0.6);
  const straight = ramp(t, at(c, 1.75), 0.8);
  const route = ramp(t, at(c, 2), 0.5);
  const form = ramp(t, at(c, 3), 0.5);
  const s0 = 1 - hose;
  const s1 = hose * (1 - route);
  const s2 = route * (1 - form);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(two * 2)}>
          {[
            { label: "легко", h: 80, col: C.green },
            { label: "трудно", h: 280, col: C.coral },
          ].map((p, i) => (
            <g key={i} transform={`translate(${cx - 260 + i * 520} 720)`}>
              <path d={`M -200 0 L 200 0 L ${i ? 60 : 160} ${-p.h} L ${i ? -60 : -160} ${-p.h} Z`} fill={p.col} stroke={OL} strokeWidth={5} opacity={0.85} />
              <Txt x={0} y={60} size={36}>
                {p.label}
              </Txt>
              {i === 0 && <Worker x={0} y={-p.h} s={1} role="plain" color={C.sky} t={t} />}
            </g>
          ))}
          <Arrow x1={cx - 100} y1={420} x2={cx - 230} y2={560} k={ramp(t, at(c, 0.5), 0.5)} color={C.green} w={9} />
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          <Hose x={cx - 520} y={520} s={1.1} kink={1 - straight} flow={0.2 + 0.25 * crank * (1 - straight) + 0.8 * straight} t={t} />
          {crank > 0 && straight < 0.5 && (
            <g transform={`translate(${cx - 640} 330)`}>
              <Chip x={0} y={0} text="крутить кран = давить мотивацией" size={28} color="#ffe0d9" k={crank} />
            </g>
          )}
          {straight > 0.3 && (
            <g transform={`translate(${cx + 30} 760)`}>
              <Chip x={0} y={0} text="распрямить шланг = убрать трение" size={32} color="#d9f5e5" k={straight} />
            </g>
          )}
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          {/* дом → работа: зал по пути и зал в стороне */}
          <path d={`M ${cx - 480} 620 L ${cx + 480} 620`} stroke="#fff" strokeWidth={50} strokeLinecap="round" />
          <path d={`M ${cx + 130} 620 L ${cx + 130} 300`} stroke="#fff" strokeWidth={40} strokeLinecap="round" />
          <g transform={`translate(${cx - 520} 620)`}>
            <rect x={-60} y={-90} width={120} height={90} fill="#fff3d6" stroke={OL} strokeWidth={4} />
            <path d="M -76 -84 L 0 -150 L 76 -84 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
          </g>
          <g transform={`translate(${cx + 520} 620)`}>
            <rect x={-70} y={-180} width={140} height={180} fill="#dfe8f2" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={40} size={28}>
              работа
            </Txt>
          </g>
          {[
            { x: cx - 120, y: 620, ok: true },
            { x: cx + 130, y: 300, ok: false },
          ].map((g, i) => (
            <g key={i} transform={`translate(${g.x} ${g.y - 40})`}>
              <rect x={-90} y={-70} width={180} height={110} rx={14} fill={g.ok ? "#d9f5e5" : "#ffe0d9"} stroke={OL} strokeWidth={4} />
              <Icon name="dumbbell" x={0} y={-16} s={1.2} />
              <Txt x={0} y={30} size={26}>
                {g.ok ? "по пути" : "в стороне"}
              </Txt>
            </g>
          ))}
          {(() => {
            const k = clamp01((t - at(c, 2.3)) / 3);
            const x = interpolate(k, [0, 1], [cx - 460, cx + 450]);
            return <circle cx={x} cy={620} r={24} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />;
          })()}
        </g>
      )}
      {form > 0 && (
        <g opacity={form}>
          {[0, 1].map((v) => {
            const steps = v ? ["ссылка на форму", "заполнить"] : ["сайт", "найти форму", "скачать", "заполнить"];
            return (
              <g key={v} transform={`translate(${cx - 290 + v * 580} 300)`}>
                <Txt x={0} y={-30} size={32} weight={900} color={v ? C.greenDeep : C.inkSoft}>
                  {v ? "на шаг меньше" : "было"}
                </Txt>
                {steps.map((s, i) => (
                  <g key={i} transform={`translate(0 ${30 + i * 110}) scale(${pop(t, at(c, 3.1) + v * 0.6 + i * 0.15)})`}>
                    <rect x={-190} y={-40} width={380} height={80} rx={20} fill={v ? "#d9f5e5" : "#fff"} stroke={OL} strokeWidth={4} />
                    <Txt x={0} y={12} size={30}>
                      {s}
                    </Txt>
                  </g>
                ))}
              </g>
            );
          })}
          <g transform={`translate(${cx + 290} 600) scale(${pop(t, at(c, 3.7))})`}>
            <Tag x={0} y={0} text="ответили больше людей" size={30} color={C.yellow} />
          </g>
        </g>
      )}
    </g>
  );
};

export const Prime: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const room = pop(t, 0.2);
  const prep = ramp(t, at(c, 1), 0.5);
  const tv = ramp(t, at(c, 2), 0.5);
  const phone = ramp(t, at(c, 3), 0.5);
  const s0 = 1 - prep;
  const s1 = prep * (1 - tv);
  const s2 = tv * (1 - phone);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(room * 2)}>
          {/* комната «перезагружается»: вещи сами встают на места */}
          <rect x={cx - 520} y={250} width={1040} height={540} rx={30} fill="#fff" stroke={OL} strokeWidth={5} />
          {[
            { x: -300, y: 620, w: 260, h: 90, col: C.violet },
            { x: 0, y: 650, w: 200, h: 50, col: C.sky },
            { x: 280, y: 500, w: 120, h: 160, col: C.yellow },
          ].map((o, i) => {
            const k = ramp(t, at(c, 0.3) + i * 0.4, 0.8);
            const dx = (1 - k) * ((i % 2 ? 1 : -1) * 120);
            const rot = (1 - k) * (i % 2 ? 30 : -25);
            return <rect key={i} x={cx + o.x - o.w / 2 + dx} y={o.y - o.h / 2} width={o.w} height={o.h} rx={16} fill={o.col} stroke={OL} strokeWidth={4} transform={`rotate(${rot} ${cx + o.x} ${o.y})`} />;
          })}
          <Chip x={cx} y={320} text="«перезагрузка комнаты»" size={38} color={C.yellow} k={pop(t, at(c, 0.5))} />
          <Txt x={cx} y={760} size={30} color={C.inkSoft}>
            уходя — подготовить к следующему делу
          </Txt>
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx - 280} 540)`}>
            <rect x={-220} y={-220} width={440} height={440} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-160} size={32} weight={900}>
              с вечера
            </Txt>
            <path d="M -100 40 L -60 -60 L 60 -60 L 100 40 L 60 40 L 60 120 L -60 120 L -60 40 Z" fill={C.coral} stroke={OL} strokeWidth={4} />
            <Icon name="shoe" x={-110} y={150} s={1} />
            <Icon name="water" x={140} y={60} s={1.4} />
          </g>
          <g transform={`translate(${cx + 280} 540) scale(${pop(t, at(c, 1.5))})`}>
            <rect x={-220} y={-220} width={440} height={440} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-160} size={32} weight={900}>
              на неделю
            </Txt>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(0 ${-60 + i * 100})`}>
                <rect x={-150} y={-38} width={300} height={76} rx={18} fill="#e9f7ff" stroke={OL} strokeWidth={4} />
                {[0, 1, 2, 3].map((j) => (
                  <circle key={j} cx={-100 + j * 66} cy={0} r={18} fill={[C.green, C.orange, C.red, C.green][(i + j) % 4]} stroke={OL} strokeWidth={2} />
                ))}
              </g>
            ))}
          </g>
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          <TV x={cx - 180} y={480} s={1.2} on={0} t={t} />
          <g transform={`translate(${cx + 180 + ramp(t, at(c, 2.3), 0.6) * 120} 640)`}>
            <path d="M -200 0 Q -100 60 0 0" stroke={OL} strokeWidth={8} fill="none" />
            <rect x={0} y={-20} width={60} height={40} rx={8} fill="#fff" stroke={OL} strokeWidth={4} />
            <line x1={60} y1={-10} x2={84} y2={-10} stroke={OL} strokeWidth={6} />
            <line x1={60} y1={10} x2={84} y2={10} stroke={OL} strokeWidth={6} />
          </g>
          <rect x={cx + 360} y={560} width={60} height={160} rx={10} fill="#fff" stroke={OL} strokeWidth={4} />
          <g transform={`translate(${cx + 140} ${440 - ramp(t, at(c, 2.6), 0.6) * 60})`}>
            <rect x={-28} y={-60} width={56} height={120} rx={10} fill="#2b3a67" stroke={OL} strokeWidth={4} />
            {[0, 1].map((i) => (
              <rect key={i} x={50 + i * 40} y={-40 + ramp(t, at(c, 2.6), 0.6) * 60} width={28} height={70} rx={6} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />
            ))}
          </g>
          <Chip x={cx} y={200} text="вредному — больше трения" size={36} color="#ffe0d9" k={pop(t, at(c, 2.2))} />
        </g>
      )}
      {phone > 0 && (
        <g opacity={phone}>
          <rect x={cx + 150} y={230} width={30} height={580} fill={OL} opacity={0.75} />
          <Phone x={cx + 400} y={520} s={0.7} />
          <Txt x={cx + 400} y={720} size={28} color={C.inkSoft}>
            до обеда — там
          </Txt>
          <rect x={cx - 520} y={640} width={560} height={26} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
          <Worker x={cx - 240} y={630} s={1.2} role="clerk" t={t} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${cx - 430 + i * 190} 380)`} opacity={clamp01(ramp(t, at(c, 3.3), 1.5) * 3 - i)}>
              <rect x={-70} y={-50} width={140} height={100} rx={20} fill="#d9f5e5" stroke={OL} strokeWidth={3} />
              <Check x={0} y={0} s={30} k={1} />
            </g>
          ))}
          <Txt x={cx - 240} y={290} size={30} color={C.greenDeep}>
            часы спокойной работы
          </Txt>
        </g>
      )}
    </g>
  );
};

export const TwoMinutes: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const fork = pop(t, 0.2);
  const pick = ramp(t, at(c, 0.4), 0.5) > 0.5 ? -1 : 0;
  const rule = ramp(t, at(c, 1), 0.6);
  const cards = [
    { from: "читать каждый вечер", to: "1 страница", icon: "page" },
    { from: "заниматься йогой", to: "расстелить коврик", icon: "mat" },
    { from: "бегать", to: "зашнуровать кроссовки", icon: "shoe" },
  ];
  const start = ramp(t, at(c, 3), 0.5);
  const gym = ramp(t, at(c, 4), 0.6);
  const s0 = 1 - rule;
  const s1 = rule * (1 - start);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0}>
          <Fork x={cx} y={560} s={1.2} k={fork} pick={pick} />
          <g transform={`translate(${cx - 300} 300)`}>
            <Chip x={0} y={0} text="форма → тренировка" size={32} color="#d9f5e5" k={pop(t, at(c, 0.4))} />
          </g>
          <g transform={`translate(${cx + 300} 300)`}>
            <Chip x={0} y={0} text="диван → сериал" size={32} color="#ffe0d9" k={pop(t, at(c, 0.7))} />
          </g>
          <Chip x={cx} y={820} text="решающий момент" size={34} color={C.yellow} k={pop(t, at(c, 0.3))} />
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx} 210) scale(${pop(t, at(c, 1.1))})`}>
            <rect x={-360} y={-60} width={720} height={120} rx={60} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={16} size={50} weight={900}>
              правило двух минут
            </Txt>
          </g>
          {cards.map((cd, i) => {
            const k = pop(t, at(c, 2) + i * 0.6);
            const shrink = ramp(t, at(c, 2) + i * 0.6 + 0.3, 0.6);
            return (
              <g key={i} transform={`translate(${cx} ${370 + i * 150}) scale(${k})`}>
                <rect x={-540} y={-55} width={480} height={110} rx={24} fill="#fff" stroke={OL} strokeWidth={4} />
                <Txt x={-300} y={12} size={32} color={C.inkSoft}>
                  {cd.from}
                </Txt>
                <Arrow x1={-40} y1={0} x2={40} y2={0} k={shrink} color={C.green} w={9} />
                <g opacity={shrink}>
                  <rect x={60} y={-55} width={480} height={110} rx={24} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
                  <Icon name={cd.icon as "page"} x={105} y={0} s={0.8} />
                  <Txt x={330} y={11} size={28} weight={900} color={C.greenDeep}>
                    {cd.to}
                  </Txt>
                </g>
              </g>
            );
          })}
        </g>
      )}
      {start > 0 && (
        <g opacity={start}>
          {/* «начать» — первая ступень, «улучшать» — потом */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={cx - 480 + i * 170} y={760 - (i + 1) * 80} width={170} height={(i + 1) * 80} fill={i === 0 ? C.yellow : "#e9eef5"} stroke={OL} strokeWidth={4} opacity={i === 0 ? 1 : 0.5 + 0.5 * gym} />
          ))}
          <Txt x={cx - 395} y={640} size={30} weight={900}>
            начать
          </Txt>
          <Txt x={cx + 40} y={420} size={30} color={C.inkSoft}>
            улучшать — потом
          </Txt>
          {gym > 0 && (
            <g>
              <Worker x={interpolate(gym, [0, 1], [cx - 395, cx + 375])} y={interpolate(gym, [0, 1], [680, 360])} s={0.9} role="plain" color={C.green} t={t} arms={0.4} />
              <g transform={`translate(${cx - 120} 200) scale(${pop(t, at(c, 4.3))})`}>
                <Tag x={0} y={0} text="5 минут в зале → захотелось дольше" size={30} color="#fff" />
              </g>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const LockIn: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const lock = ramp(t, at(c, 0.5), 0.8);
  const write = ramp(t, at(c, 1), 0.6);
  const router = ramp(t, at(c, 2), 0.5);
  const night = ramp(t, at(c, 2.4), 0.6);
  const auto = ramp(t, at(c, 3), 0.5);
  const s0 = 1 - router;
  const s1 = router * (1 - auto);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0}>
          {/* одежда уходит в сундук */}
          {[0, 1, 2].map((i) => {
            const k = clamp01(ramp(t, at(c, 0.2) + i * 0.2, 0.6));
            const x = interpolate(k, [0, 1], [cx - 520 + i * 120, cx - 280]);
            const y = interpolate(k, [0, 0.5, 1], [320, 260, 600]);
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${1 - k * 0.5})`} opacity={1 - clamp01(k * 1.2 - 0.2) * (lock > 0.2 ? 1 : 0)}>
                <path d="M -50 -40 L -20 -56 L 20 -56 L 50 -40 L 40 -10 L 28 -16 L 28 50 L -28 50 L -28 -16 L -40 -10 Z" fill={[C.sky, C.coral, C.violet][i]} stroke={OL} strokeWidth={4} />
              </g>
            );
          })}
          <Trunk x={cx - 280} y={700} s={1.1} lock={lock} />
          {/* писатель в шали за столом */}
          {write > 0 && (
            <g transform={`translate(${cx + 260} 640)`} opacity={write}>
              <rect x={-220} y={0} width={440} height={26} rx={8} fill={C.wood} stroke={OL} strokeWidth={4} />
              <Worker x={0} y={-10} s={1.2} role="plain" color="#c9a24a" t={t} arms={0.2} />
              <path d="M -60 -100 Q 0 -20 60 -100 L 50 -40 Q 0 -10 -50 -40 Z" fill="#e8c96a" stroke={OL} strokeWidth={3} opacity={0.9} />
              {[0, 1, 2, 3].map((i) => {
                const k = clamp01((t - at(c, 1.2)) * 0.8 - i * 0.5);
                return <rect key={i} x={110 + i * 6} y={-12 - i * 10} width={90} height={12} rx={2} fill="#fffaf0" stroke={OL} strokeWidth={2} opacity={k} />;
              })}
              <Txt x={0} y={90} size={30} color={C.inkSoft}>
                выйти не в чем — пишет
              </Txt>
            </g>
          )}
          <Chip x={cx} y={200} text="приём самоограничения" size={36} color={C.yellow} k={pop(t, at(c, 1.4))} />
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          <rect x={cx - 560} y={220} width={1120} height={600} rx={30} fill={night > 0.5 ? "#2b3a67" : "#fff"} opacity={0.18 + 0.5 * night} />
          <Router x={cx - 160} y={600} s={1.5} on={1 - night} />
          <g transform={`translate(${cx + 260} 520)`}>
            <circle r={110} fill="#fff" stroke={OL} strokeWidth={6} />
            <path d="M 0 0 L 0 -70 M 0 0 L 50 30" stroke={OL} strokeWidth={8} strokeLinecap="round" />
            <circle r={10} fill={OL} />
            <Txt x={0} y={170} size={30}>
              таймер в розетке
            </Txt>
          </g>
          {night > 0.5 && <Icon name="moon" x={cx + 420} y={300} s={1.6} />}
          {night > 0.5 && (
            <g transform={`translate(${cx - 160} 300)`}>
              <Tag x={0} y={0} text="пора спать" size={36} color={C.yellow} />
            </g>
          )}
        </g>
      )}
      {auto > 0 && (
        <g opacity={auto}>
          {[
            { label: "зарплата", sub: "часть → накопления", icon: "star" },
            { label: "браузер", sub: "лишние сайты заблокированы", icon: "eye" },
          ].map((a, i) => (
            <g key={i} transform={`translate(${cx} ${380 + i * 240}) scale(${pop(t, at(c, 3.2) + i * 0.6)})`}>
              <rect x={-500} y={-90} width={1000} height={180} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
              <Icon name={a.icon as "star"} x={-400} y={0} s={1.3} />
              <Txt x={-300} y={-14} size={36} anchor="start" weight={900}>
                {a.label}
              </Txt>
              <Txt x={-300} y={40} size={30} anchor="start" color={C.inkSoft}>
                {a.sub}
              </Txt>
              <g transform="translate(400 0)">
                <circle r={50} fill={C.green} stroke={OL} strokeWidth={4} />
                <path d="M -20 -20 A 28 28 0 1 1 -24 10 M -24 10 L -34 -4 M -24 10 L -8 4" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" transform={`rotate(${t * 90})`} />
              </g>
            </g>
          ))}
          <Chip x={cx} y={200} text="одно усилие — работает годами" size={36} color={C.yellow} k={pop(t, at(c, 3.6))} />
        </g>
      )}
    </g>
  );
};
