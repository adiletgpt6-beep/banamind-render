// Принцип 2 — SPARK: лыжник и лавина перемен, зона комфорта и кривая обучения,
// прямота, приоритеты, стена препятствий, ответ вместо реакции и уважение.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { zoneX } from "./hook";
import { Brick, Bubble, Heart, Mountain, OL, Phone, Skier, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const Snow: React.FC<{ t: number; n?: number; x0?: number; w?: number }> = ({ t, n = 30, x0 = 0, w = 1920 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = x0 + ((i * 137 + t * 30 * (1 + (i % 3))) % w);
      const y = (i * 71 + t * 60 * (1 + (i % 2))) % 900;
      return <circle key={i} cx={x} cy={y + 100} r={3 + (i % 3)} fill="#fff" opacity={0.8} />;
    })}
  </g>
);

export const SkierScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const intro = pop(t, 0.2);
  const aval = ramp(t, at(c, 1), 2.2);
  const head = ramp(t, at(c, 1.4), 0.5) * (1 - ramp(t, at(c, 2), 0.5));
  const back = ramp(t, at(c, 3), 0.5);
  const fwd = ramp(t, at(c, 3.5), 0.5);
  const easy = ramp(t, at(c, 5), 0.6);
  const slope = (x: number) => 300 + (x - (cx - 560)) * 0.42;
  return (
    <g>
      {/* склон */}
      <path d={`M ${cx - 700} 280 L ${cx + 600} 830 L ${cx - 700} 830 Z`} fill="#f4f9ff" stroke="#9cb3c9" strokeWidth={6} />
      <Mountain x={cx + 330} y={520} s={0.7} color="#b7cbe4" />
      <Snow t={t} n={24} x0={cx - 700} w={1300} />
      {intro > 0 && t < at(c, 1) && (
        <g transform={`translate(${cx - 200} ${slope(cx - 200) - 10}) scale(${intro})`}>
          <Worker x={0} y={0} s={1.2} role="skier" t={t} />
          <path d="M -30 -80 l 0 -20 M 30 -80 l 0 -20" stroke={C.yellowDeep} strokeWidth={4} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} transform={`translate(${-80 + i * 40} -200) scale(0.5)`} d="M 0 -26 L 8 -8 L 26 -6 L 12 6 L 16 26 L 0 16 L -16 26 L -12 6 L -26 -6 L -8 -8 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
          ))}
          <Tag x={0} y={60} text="чемпион по слалому" size={28} color="#fff" />
        </g>
      )}
      {/* лавина перемен */}
      {aval > 0 && t < at(c, 3) && (
        <g>
          <path
            d={`M ${cx - 700} 280 ${Array.from({ length: 12 }, (_, i) => `Q ${cx - 700 + i * 60 * aval + 30} ${240 + (i % 2) * 80} ${cx - 700 + (i + 1) * 60 * aval} ${280 + ((i + 1) * 60 * aval) * 0.42}`).join(" ")} L ${cx - 700} 830 Z`}
            fill="#fff"
            stroke="#c9d8ea"
            strokeWidth={6}
            opacity={0.95}
          />
          <Tag x={cx - 200} y={210} text="лавина перемен" size={34} color="#e6eefc" />
          {head > 0 && (
            <g transform={`translate(${cx + 150} ${slope(cx + 150)})`} opacity={head}>
              <path d="M -40 0 L -20 -60 L 20 -60 L 40 0" fill={C.sky} stroke={OL} strokeWidth={4} />
              <ellipse cx={0} cy={-62} rx={70} ry={26} fill="#fff" stroke="#c9d8ea" strokeWidth={4} />
              <Tag x={0} y={-150} text="голову в снег?" size={30} color="#ffd6d6" />
            </g>
          )}
          {t > at(c, 2) && (
            <g transform={`translate(${cx + 150} ${slope(cx + 150) - 30})`} opacity={ramp(t, at(c, 2), 0.5)}>
              <Skier x={0} y={0} s={1} lean={0.7} slope={22} t={t} />
              <Tag x={0} y={-220} text="двигаться вместе со склоном" size={28} color={C.yellow} />
            </g>
          )}
        </g>
      )}
      {/* назад — падение, вперёд — едет */}
      {back > 0 && easy < 1 && (
        <g opacity={1 - easy}>
          <g transform={`translate(${cx - 380} ${slope(cx - 380) - 20})`}>
            <Skier x={0} y={0} s={0.95} lean={-1} slope={22} t={t} fall={ramp(t, at(c, 3.4), 0.5)} />
            <Tag x={0} y={-230} text="назад — страх" size={28} color="#ffd6d6" />
            <Cross x={110} y={-150} s={60} k={ramp(t, at(c, 3.4), 0.4)} />
          </g>
          {fwd > 0 && (
            <g transform={`translate(${cx + interpolate(fwd, [0, 1], [0, 160]) + Math.sin(t * 2) * 10} ${slope(cx + 160 * fwd) - 20})`}>
              <Skier x={0} y={0} s={0.95} lean={1} slope={22} t={t} />
              <Tag x={0} y={-230} text="вперёд — управление" size={28} color={C.yellow} />
            </g>
          )}
          <Pop t={t} at={at(c, 4.3)} x={cx - 100} y={800}>
            <Tag x={0} y={0} text="рисковать — с умом" size={30} color="#fff" />
          </Pop>
        </g>
      )}
      {easy > 0 && (
        <g opacity={easy}>
          <rect x={cx - 640} y={240} width={1240} height={560} rx={30} fill="#eef6ff" />
          <path d={`M ${cx - 600} 520 L ${cx - 60} 620`} stroke="#9cb3c9" strokeWidth={8} />
          <path d={`M ${cx + 40} 300 L ${cx + 560} 760`} stroke="#9cb3c9" strokeWidth={8} />
          <Skier x={cx - 330} y={555} s={0.75} lean={0} slope={10} t={t} />
          <Skier x={cx + 300} y={520} s={0.75} lean={1} slope={42} t={t} />
          <Tag x={cx - 330} y={330} text="лёгкий: все «профи»" size={28} color="#fff" />
          <Tag x={cx + 260} y={290} text="трудный: видно, кто чего стоит" size={28} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const ComfortZone: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const grow = ramp(t, at(c, 0.2), 3);
  const arms = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 3), 0.5));
  const swap = ramp(t, at(c, 1.55), 0.5);
  const fear = ramp(t, at(c, 3), 0.5) * (1 - ramp(t, at(c, 4), 0.5));
  const curve = ramp(t, at(c, 4), 3.5);
  const showA = 1 - arms - ramp(t, at(c, 3), 0.5);
  const r = 140 + grow * 200;
  return (
    <g>
      {showA > 0 && t < at(c, 1.2) && (
        <g opacity={clamp01(1 - ramp(t, at(c, 1), 0.5))}>
          <circle cx={cx} cy={500} r={r} fill={C.green} opacity={0.18} stroke={C.greenDeep} strokeWidth={6} strokeDasharray="18 12" />
          <circle cx={cx} cy={500} r={140} fill={C.green} opacity={0.15} />
          <Txt x={cx} y={510} size={34} color={C.greenDeep} weight={900}>
            зона комфорта
          </Txt>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 - 0.6;
            const k = clamp01(grow * 5 - i);
            return (
              <g key={i} transform={`translate(${cx + Math.cos(a) * (r + 40)} ${500 + Math.sin(a) * (r + 40) * 0.8})`} opacity={k}>
                <Worker x={0} y={40} s={0.55} role="plain" t={t} />
                <Txt x={0} y={-60} size={22} color={C.inkSoft}>
                  {["новый навык", "выступить", "спросить", "попросить", "начать"][i]}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
      {arms > 0 && (
        <g opacity={arms}>
          {/* руки скрещены: привычно / наоборот */}
          {[0, 1].map((side) => {
            const active = side === 0 ? 1 - swap * 0.5 : 0.5 + swap * 0.5;
            const x = cx - 270 + side * 540;
            const top = side === 0 ? C.coral : C.skyDeep;
            const bottom = side === 0 ? C.skyDeep : C.coral;
            return (
              <g key={side} transform={`translate(${x} 520)`} opacity={active}>
                <rect x={-90} y={-180} width={180} height={300} rx={60} fill="#fff" stroke={OL} strokeWidth={5} />
                <circle cx={0} cy={-230} r={60} fill="#f2c79b" stroke={OL} strokeWidth={5} />
                <path d="M -110 -40 Q 0 30 110 -60" stroke={bottom} strokeWidth={38} strokeLinecap="round" fill="none" />
                <path d="M 110 -40 Q 0 30 -110 -60" stroke={top} strokeWidth={38} strokeLinecap="round" fill="none" />
                <Tag x={0} y={190} text={side === 0 ? "как обычно" : "наоборот"} size={32} color={side === 0 ? "#fff" : C.yellow} />
                {side === 1 && swap > 0.5 && (
                  <g transform="translate(0 -360)" opacity={ramp(t, at(c, 2), 0.4)}>
                    <Bubble x={0} y={0} w={260} h={80} fill="#fffbe6" />
                    <Txt x={0} y={10} size={28}>
                      неудобно = рост
                    </Txt>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      )}
      {fear > 0 && (
        <g opacity={fear}>
          <path d={`M ${cx - 400} 700 L ${cx + 400} 700`} stroke={OL} strokeWidth={6} />
          <rect x={cx + 120} y={420} width={30} height={280} fill={C.red} opacity={0.6} />
          <Worker x={cx - 60 + ramp(t, at(c, 3.4), 1) * 260} y={700} s={1.3} role="plain" t={t} arms={0.4} />
          <Tag x={cx + 135} y={380} text="привычная граница" size={28} color="#fff" />
          <Tag x={cx} y={260} text="маленький шаг, не опасный риск" size={32} color={C.yellow} />
        </g>
      )}
      {curve > 0 && (
        <g opacity={clamp01(curve * 4)}>
          <path d={`M ${cx - 480} 780 L ${cx + 480} 780 M ${cx - 480} 780 L ${cx - 480} 260`} stroke={OL} strokeWidth={6} />
          <Txt x={cx - 420} y={300} size={26} color={C.inkSoft} anchor="start">
            мастерство
          </Txt>
          <path
            d={Array.from({ length: 61 }, (_, i) => {
              const x = i / 60;
              const y = 0.4 - 0.25 * Math.sin(Math.min(1, x / 0.45) * Math.PI) * (x < 0.45 ? 1 : 0) + (x > 0.45 ? Math.pow((x - 0.45) / 0.55, 1.4) * 0.55 : 0);
              return x <= curve ? `${i ? "L" : "M"} ${cx - 480 + x * 960} ${780 - y * 480}` : "";
            }).join(" ")}
            fill="none"
            stroke={C.violet}
            strokeWidth={10}
            strokeLinecap="round"
          />
          {curve > 0.3 && <Tag x={cx - 180} y={760} text="срыв" size={30} color="#ffd6d6" />}
          {curve > 0.85 && <Tag x={cx + 330} y={300} text="прорыв" size={34} color={C.yellow} />}
        </g>
      )}
    </g>
  );
};

export const Candor: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const fog = ramp(t, at(c, 0.4), 0.6);
  const clear = ramp(t, at(c, 0.8), 0.6);
  const rude = ramp(t, at(c, 2), 0.5);
  const kind = ramp(t, at(c, 2.5), 0.5);
  const face = ramp(t, at(c, 4), 0.5);
  const gossip = ramp(t, at(c, 5), 0.5);
  const s1 = 1 - ramp(t, at(c, 2), 0.4);
  const s2 = ramp(t, at(c, 2), 0.4) * (1 - face);
  const s3 = face * (1 - gossip);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx - 270} 450)`} opacity={fog * (1 - clear * 0.6)}>
            <Bubble x={0} y={0} w={420} h={150} fill="#eef1f6" />
            <Txt x={0} y={-10} size={28} color={C.grey}>
              в целом, в некотором роде,
            </Txt>
            <Txt x={0} y={30} size={28} color={C.grey}>
              возможно, отчасти…
            </Txt>
          </g>
          {clear > 0 && (
            <g transform={`translate(${cx + 270} 450) scale(${clear})`}>
              <Bubble x={0} y={0} w={420} h={150} fill="#fffbe6" />
              <Txt x={0} y={-6} size={30} weight={900}>
                Отчёт опоздает на день.
              </Txt>
              <Txt x={0} y={34} size={30} weight={900}>
                Вот почему и что я делаю.
              </Txt>
            </g>
          )}
          <Tag x={cx - 270} y={620} text="обтекаемо" size={30} color="#dfe3ea" />
          {clear > 0 && <Tag x={cx + 270} y={620} text="честно и ясно" size={30} color={C.yellow} />}
          <Pop t={t} at={at(c, 1.2)} x={cx} y={250}>
            <Tag x={0} y={0} text="честность ≠ грубость" size={40} color="#fff" />
          </Pop>
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          {[0, 1].map((side) => {
            const k = side === 0 ? rude : kind;
            const x = cx - 300 + side * 600;
            return (
              <g key={side} opacity={k}>
                <g transform={`translate(${x} 330)`}>
                  <Bubble x={0} y={0} w={500} h={120} fill={side === 0 ? "#ffe3e3" : "#e6f7ea"} />
                  <Txt x={0} y={side === 0 ? 12 : -4} size={side === 0 ? 34 : 26} weight={900} color={side === 0 ? C.red : C.greenDeep}>
                    {side === 0 ? "Опять всё не так!" : "Вижу, вы стараетесь."}
                  </Txt>
                  {side === 1 && (
                    <Txt x={0} y={30} size={26} weight={900} color={C.greenDeep}>
                      Подсказать, как ещё лучше?
                    </Txt>
                  )}
                </g>
                <Worker x={x} y={730} s={1.4} role="plain" color={side === 0 ? C.grey : C.sky} t={t} mood={side === 0 ? "sad" : "smile"} arms={side === 1 ? 0.4 : 0} />
                {side === 0 ? (
                  <path d={`M ${x - 80} 520 L ${x + 80} 520 L ${x + 70} 640 Q ${x} 690 ${x - 70} 640 Z`} fill="#9aa5b8" stroke={OL} strokeWidth={5} opacity={ramp(t, at(c, 3), 0.5)} />
                ) : (
                  <path d={`M ${x - 50} 470 q 50 -40 100 0`} stroke={C.green} strokeWidth={8} fill="none" opacity={ramp(t, at(c, 3.4), 0.5)} />
                )}
                <Tag x={x} y={820} text={side === 0 ? "защищается" : "готов слушать"} size={28} color={side === 0 ? "#dfe3ea" : C.yellow} />
              </g>
            );
          })}
        </g>
      )}
      {s3 > 0 && (
        <g opacity={s3}>
          <Phone x={cx - 330} y={520} s={1.1}>
            <rect x={-50} y={-60} width={100} height={60} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
            <path d="M -50 -60 L 0 -20 L 50 -60" stroke={OL} strokeWidth={3} fill="none" />
          </Phone>
          <Cross x={cx - 330} y={520} s={130} k={ramp(t, at(c, 4.3), 0.5)} />
          <Worker x={cx + 160} y={700} s={1.4} role="plain" color={C.violet} t={t} arms={0.4} />
          <Worker x={cx + 370} y={700} s={1.4} role="plain" color={C.orange} t={t} flip arms={0.4} />
          <Heart x={cx + 265} y={420} s={0.9} />
          <Tag x={cx + 265} y={300} text="лицом к лицу" size={36} color={C.yellow} />
        </g>
      )}
      {gossip > 0 && (
        <g opacity={gossip}>
          {["сплетни", "жалобы", "злословие"].map((s, i) => (
            <g key={i} transform={`translate(${cx - 360 + i * 360} 400)`}>
              <Bubble x={0} y={0} w={260} h={100} fill="#eef1f6" />
              <Txt x={0} y={10} size={32} color={C.inkSoft}>
                {s}
              </Txt>
              <Cross x={0} y={0} s={110} k={ramp(t, at(c, 5.2) + i * 0.25, 0.4)} />
            </g>
          ))}
          <Tag x={cx} y={640} text="слова задают и моё настроение" size={34} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const Priorities: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const busy = pop(t, 0.2);
  const marble = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2), 0.5));
  const chip = ramp(t, at(c, 1.3), 2.5);
  const bars = ramp(t, at(c, 2), 1);
  const list = ramp(t, at(c, 3), 0.5);
  const quiet = ramp(t, at(c, 4), 0.6);
  const s1 = 1 - ramp(t, at(c, 1), 0.4);
  const s3 = bars * (1 - list);
  const s4 = list * (1 - quiet);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx} 560) scale(${busy})`}>
            <Worker x={0} y={140} s={1.5} role="clerk" t={t * 3} arms={0.8 + Math.sin(t * 9) * 0.2} />
            {Array.from({ length: 10 }).map((_, i) => {
              const a = t * 2 + i * 0.63;
              return (
                <g key={i} transform={`translate(${Math.cos(a) * 330} ${-60 + Math.sin(a) * 180})`}>
                  <rect x={-50} y={-30} width={100} height={60} rx={8} fill="#fff" stroke={OL} strokeWidth={3} />
                  <rect x={-36} y={-12} width={72} height={8} rx={4} fill="#d7dde8" />
                  <rect x={-36} y={4} width={50} height={8} rx={4} fill="#d7dde8" />
                </g>
              );
            })}
            <Tag x={0} y={-330} text="очень занят — а главное не сделано" size={32} color="#fff" />
          </g>
        </g>
      )}
      {marble > 0 && (
        <g opacity={marble}>
          {/* глыба: лишние куски откалываются, проявляется фигура */}
          <g transform={`translate(${cx} 520)`}>
            <path d="M -60 220 L -50 40 Q -80 -40 -40 -80 Q -30 -170 20 -170 Q 70 -160 60 -80 Q 100 -30 60 40 L 70 220 Z" fill="#f1efe8" stroke={OL} strokeWidth={5} />
            {Array.from({ length: 10 }).map((_, i) => {
              const k = clamp01(chip * 10 - i);
              const ang = (i / 10) * Math.PI * 2;
              const px = Math.cos(ang) * (150 + k * 300);
              const py = Math.sin(ang) * (150 + k * 200) + k * k * 300;
              return <path key={i} transform={`translate(${px} ${py}) rotate(${k * 200 + i * 30})`} d="M -60 -40 L 50 -50 L 70 30 L -40 50 Z" fill="#e3ded2" stroke={OL} strokeWidth={4} opacity={1 - k * 0.8} />;
            })}
          </g>
          <Tag x={cx} y={240} text="отсечь всё лишнее" size={36} color={C.yellow} />
        </g>
      )}
      {s3 > 0 && (
        <g opacity={s3}>
          {[0, 1].map((row) => (
            <g key={row} transform={`translate(${cx - 400} ${380 + row * 220})`}>
              <Txt x={-20} y={20} size={30} anchor="end">
                {row === 0 ? "дела" : "результат"}
              </Txt>
              <rect x={0} y={-40} width={800 * bars} height={80} rx={12} fill="#e9eef5" stroke={OL} strokeWidth={3} />
              <rect x={0} y={-40} width={(row === 0 ? 160 : 640) * bars} height={80} rx={12} fill={C.violet} />
              <Txt x={(row === 0 ? 80 : 320) * bars} y={14} size={34} color="#fff" weight={900}>
                {row === 0 ? "20%" : "80%"}
              </Txt>
            </g>
          ))}
          <Tag x={cx} y={250} text="немногие ключевые дела" size={34} color={C.yellow} />
        </g>
      )}
      {s4 > 0 && (
        <g opacity={s4}>
          <Panel x={cx - 330} y={240} w={660} h={560} fill="#fffef8" r={24} />
          {["главное дело №1", "главное дело №2", "срочная мелочь", "лишняя встреча", "чужая просьба"].map((s, i) => {
            const no = i >= 2;
            return (
              <g key={i} transform={`translate(${cx - 270} ${320 + i * 95})`}>
                <circle cx={0} cy={0} r={20} fill={no ? "#c7cdd8" : C.green} />
                <text x={40} y={12} fontFamily={FONT} fontWeight={800} fontSize={32} fill={no ? C.grey : C.ink}>
                  {s}
                </text>
                {no && <line x1={36} y1={0} x2={36 + 330 * ramp(t, at(c, 3.4) + (i - 2) * 0.25, 0.4)} y2={0} stroke={C.red} strokeWidth={5} />}
                {no && ramp(t, at(c, 3.4) + (i - 2) * 0.25, 0.4) > 0.8 && <Tag x={460} y={0} text="нет" size={28} color="#ffd6d6" />}
              </g>
            );
          })}
        </g>
      )}
      {quiet > 0 && (
        <g opacity={quiet}>
          <circle cx={cx} cy={500} r={250} fill="#fff6c4" opacity={0.6} />
          <Worker x={cx} y={640} s={1.5} role="plain" color={C.violet} t={0} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx} cy={430} r={60 + ((t * 30 + i * 60) % 180)} fill="none" stroke={C.violet} strokeWidth={3} opacity={1 - ((t * 30 + i * 60) % 180) / 180} />
          ))}
          <Tag x={cx} y={250} text="замедлиться, чтобы ускориться" size={34} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const WallScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const wall = pop(t, 0.2);
  const ways = [
    { label: "перелезть", d: `M ${cx - 380} 700 Q ${cx} 160 ${cx + 380} 700` },
    { label: "обойти", d: `M ${cx - 380} 700 Q ${cx - 50} 860 ${cx + 380} 700` },
    { label: "подкоп", d: `M ${cx - 380} 700 Q ${cx} 900 ${cx + 380} 760` },
    { label: "слабое место", d: `M ${cx - 380} 640 L ${cx + 380} 640` },
  ];
  const job = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3), 0.5));
  const pdv = ramp(t, at(c, 3), 0.5) * (1 - ramp(t, at(c, 4), 0.5));
  const fall = ramp(t, at(c, 4), 0.5);
  const s1 = 1 - ramp(t, at(c, 2), 0.4);
  const stars = ramp(t, at(c, 0.4), 1);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          {/* «тёмной ночью лучше видно звёзды» */}
          {Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={cx - 560 + i * 100} cy={200 + ((i * 47) % 90)} r={4 + (i % 3)} fill={C.yellowDeep} opacity={stars * (0.5 + 0.5 * Math.sin(t * 3 + i))} />
          ))}
          <g transform={`translate(${cx} 760) scale(1 ${wall})`}>
            {Array.from({ length: 28 }).map((_, i) => {
              const row = Math.floor(i / 4);
              const col = i % 4;
              const weak = i === 13;
              return <Brick key={i} x={-120 + col * 80 + (row % 2) * 20} y={-30 - row * 58} w={76} h={54} color={weak ? "#e8a07f" : "#b9643f"} />;
            })}
          </g>
          <Worker x={cx - 420} y={760} s={1.2} role="plain" color={C.violet} t={t} />
          {ways.map((w, i) => {
            const k = ramp(t, at(c, 1) + i * 0.25, 0.6);
            const L = 1000;
            return (
              <g key={i}>
                <path d={w.d} fill="none" stroke={[C.green, C.skyDeep, C.orange, C.violet][i]} strokeWidth={8} strokeDasharray={`${L}`} strokeDashoffset={L * (1 - k)} strokeLinecap="round" />
                {k > 0.9 && <Tag x={cx + 520} y={260 + i * 90} text={w.label} size={28} color={[C.green, C.skyDeep, C.orange, C.violet][i]} textColor="#fff" />}
              </g>
            );
          })}
        </g>
      )}
      {job > 0 && (
        <g opacity={job}>
          <g transform={`translate(${cx - 300} 330)`}>
            <rect x={-170} y={-90} width={340} height={180} rx={14} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-20} size={30} weight={900}>
              Повышение
            </Txt>
            <Txt x={0} y={40} size={40} weight={900} color={C.red}>
              ОТКАЗ
            </Txt>
          </g>
          <Arrow x1={cx - 100} y1={330} x2={cx + 80} y2={330} k={ramp(t, at(c, 2.4), 0.5)} color={C.green} />
          <g transform={`translate(${cx + 300} 330)`} opacity={ramp(t, at(c, 2.5), 0.5)}>
            <Bubble x={0} y={0} w={380} h={130} fill="#e6f7ea" />
            <Txt x={0} y={-8} size={28}>
              каких навыков
            </Txt>
            <Txt x={0} y={30} size={28}>
              не хватило?
            </Txt>
          </g>
          <g transform={`translate(${cx} 700)`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={i} x={-330 + i * 115} y={-30} width={100} height={60} rx={10} fill={ramp(t, at(c, 2.7) + i * 0.2, 0.3) > 0.5 ? C.green : "#fff"} stroke={OL} strokeWidth={3} />
            ))}
            <Txt x={0} y={80} size={28} color={C.inkSoft}>
              полгода — навыки освоены
            </Txt>
          </g>
        </g>
      )}
      {pdv > 0 && (
        <g opacity={pdv}>
          <Txt x={cx} y={300} size={120} weight={900} color={C.violet}>
            ПДВ
          </Txt>
          <Txt x={cx} y={380} size={36} weight={800}>
            продолжать двигаться вперёд
          </Txt>
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={i} cx={cx - 400 + i * 160} cy={700 + (i % 2) * 30} rx={34} ry={18} fill={C.ink} opacity={ramp(t, at(c, 3.3) + i * 0.15, 0.3) * 0.7} />
          ))}
        </g>
      )}
      {fall > 0 && (
        <g opacity={fall}>
          {Array.from({ length: 8 }).map((_, i) => {
            const up = (Math.floor((t - at(c, 4)) * 2) % 2 === 0) || i === 7;
            return (
              <g key={i} transform={`translate(${cx - 490 + i * 140} 720)`}>
                <g transform={`rotate(${i < 7 && !up ? 80 : 0} 0 20)`}>
                  <Worker x={0} y={0} s={0.8} role="plain" color={i === 7 ? C.green : C.violet} t={t} arms={i === 7 ? 1 : 0} />
                </g>
                <Txt x={0} y={80} size={24} color={C.inkSoft}>
                  {String(i + 1)}
                </Txt>
              </g>
            );
          })}
          <Tag x={cx} y={300} text="упасть 7 раз — подняться 8" size={38} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const Respond: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const react = ramp(t, at(c, 0.3), 0.5);
  const pause = ramp(t, at(c, 1), 0.5);
  const mail = ramp(t, at(c, 2), 0.5) * (1 - ramp(t, at(c, 3), 0.5));
  const control = ramp(t, at(c, 3), 0.5) * (1 - ramp(t, at(c, 4), 0.5));
  const kudos = ramp(t, at(c, 4), 0.5);
  const s1 = 1 - ramp(t, at(c, 2), 0.4);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          {/* событие → вспышка */}
          <g transform={`translate(${cx} 330)`} opacity={react}>
            <rect x={-500} y={-50} width={220} height={100} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={-390} y={12} size={30}>
              событие
            </Txt>
            <Arrow x1={-270} y1={0} x2={-60} y2={0} k={react} color={C.red} />
            <path transform={`translate(80 0) scale(${0.9 + 0.1 * Math.sin(t * 12)})`} d="M 0 -80 L 24 -24 L 80 -30 L 36 10 L 60 70 L 0 36 L -60 70 L -36 10 L -80 -30 L -24 -24 Z" fill={C.red} stroke={OL} strokeWidth={4} />
            <Txt x={300} y={12} size={34} color={C.red} weight={900}>
              реакция
            </Txt>
          </g>
          {pause > 0 && (
            <g transform={`translate(${cx} 620)`} opacity={pause}>
              <rect x={-500} y={-50} width={220} height={100} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={-390} y={12} size={30}>
                событие
              </Txt>
              <Arrow x1={-270} y1={0} x2={-150} y2={0} k={pause} color={C.green} />
              <g transform="translate(-60 0)">
                <circle r={60} fill="#fff" stroke={C.green} strokeWidth={6} />
                <rect x={-24} y={-28} width={16} height={56} rx={4} fill={C.green} />
                <rect x={8} y={-28} width={16} height={56} rx={4} fill={C.green} />
              </g>
              <Arrow x1={10} y1={0} x2={170} y2={0} k={ramp(t, at(c, 1.4), 0.5)} color={C.green} />
              <Txt x={300} y={12} size={34} color={C.greenDeep} weight={900}>
                ответ
              </Txt>
            </g>
          )}
        </g>
      )}
      {mail > 0 && (
        <g opacity={mail}>
          <g transform={`translate(${cx - 280} 420)`}>
            <rect x={-200} y={-130} width={400} height={260} rx={16} fill="#fff" stroke={OL} strokeWidth={4} />
            <path d="M -200 -130 L 0 10 L 200 -130" stroke={OL} strokeWidth={4} fill="none" />
            <Txt x={0} y={90} size={34} color={C.red} weight={900}>
              !!! ВОЗМУЩЁН !!!
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 420)`} opacity={ramp(t, at(c, 2.5), 0.5)}>
            <Bubble x={0} y={0} w={420} h={180} fill="#e6f7ea" />
            <Txt x={0} y={-30} size={28}>
              Что вас расстроило?
            </Txt>
            <Txt x={0} y={14} size={28}>
              Вот что я предлагаю:
            </Txt>
            <Check x={0} y={60} s={30} k={ramp(t, at(c, 2.8), 0.4)} />
          </g>
          <Tag x={cx} y={700} text="не тушить пожар, а решать" size={32} color={C.yellow} />
        </g>
      )}
      {control > 0 && (
        <g opacity={control}>
          <circle cx={cx} cy={500} r={300} fill="#eef1f6" stroke={C.grey} strokeWidth={4} strokeDasharray="14 10" />
          <circle cx={cx} cy={500} r={150} fill="#e6f7ea" stroke={C.green} strokeWidth={6} />
          <Txt x={cx} y={510} size={30} color={C.greenDeep} weight={900}>
            зависит от меня
          </Txt>
          <Txt x={cx} y={250} size={28} color={C.grey}>
            погода, курс, чужие решения
          </Txt>
        </g>
      )}
      {kudos > 0 && (
        <g opacity={kudos}>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <Worker x={cx - 300 + i * 300} y={720} s={1.3} role={(["clerk", "janitor", "barista"] as const)[i]} t={t + i} arms={ramp(t, at(c, 4.4) + i * 0.4, 0.4)} />
              <g transform={`translate(${cx - 300 + i * 300} 430) scale(${pop(t, at(c, 4.4) + i * 0.4)})`}>
                <Bubble x={0} y={0} w={230} h={80} fill="#fffbe6" />
                <Txt x={0} y={10} size={28} weight={900}>
                  {["спасибо!", "здорово!", "отлично!"][i]}
                </Txt>
              </g>
              <Heart x={cx - 230 + i * 300} y={520} s={0.6 * ramp(t, at(c, 5) + i * 0.3, 0.4)} />
            </g>
          ))}
          <Tag x={cx} y={250} text="почёт и уважение каждому" size={38} color={C.yellow} />
          <Pop t={t} at={at(c, 5.6)} x={cx} y={830}>
            <Tag x={0} y={0} text="не ждать начальника" size={28} color="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

export { wob, Panel };
