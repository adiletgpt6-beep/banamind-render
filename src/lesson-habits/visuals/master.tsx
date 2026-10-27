// Мастерство: таланты и «своя игра» (пловец и бегун), правило Златовласки и скука,
// обратная сторона привычек — практика, годовой обзор, гибкая идентичность.
import React from "react";
import { C, FONT } from "../theme";
import { OL, Worker } from "./draw";
import { Check, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Chip, Icon, zoneX } from "./parts";

// фигура спортсмена с пропорциями: torso — длина туловища, legs — длина ног
const Athlete: React.FC<{ x: number; y: number; torso: number; legs: number; color: string; t: number; swim?: boolean }> = ({ x, y, torso, legs, color, t, swim }) => {
  const sw = Math.sin(t * 4) * 20;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M -16 0 L -22 ${legs} M 16 0 L 22 ${legs}`} stroke={OL} strokeWidth={16} strokeLinecap="round" />
      <path d={`M -16 0 L -22 ${legs} M 16 0 L 22 ${legs}`} stroke="#f2c79b" strokeWidth={9} strokeLinecap="round" />
      <rect x={-40} y={-torso} width={80} height={torso + 10} rx={30} fill={color} stroke={OL} strokeWidth={5} />
      <path d={`M -36 ${-torso + 30} L ${-80} ${-torso + 30 + (swim ? -60 + sw : 80)} M 36 ${-torso + 30} L 80 ${-torso + 30 + (swim ? -60 - sw : 80)}`} stroke={OL} strokeWidth={12} strokeLinecap="round" />
      <circle cx={0} cy={-torso - 40} r={38} fill="#f2c79b" stroke={OL} strokeWidth={5} />
      {swim && <path d={`M -38 ${-torso - 48} Q 0 ${-torso - 100} 38 ${-torso - 48} Z`} fill={C.skyDeep} stroke={OL} strokeWidth={4} />}
    </g>
  );
};

export const Genes: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const pair = pop(t, 0.2);
  const ruler = ramp(t, at(c, 0.6), 0.6);
  const swap = ramp(t, at(c, 1.4), 0.8);
  const fit = ramp(t, at(c, 2), 0.6);
  const qs = ramp(t, at(c, 3), 0.6);
  const s0 = 1 - fit;
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(pair * 2)}>
          {/* бассейн и дорожка */}
          <rect x={cx - 560} y={760} width={520} height={70} rx={12} fill={C.sky} stroke={OL} strokeWidth={4} />
          <rect x={cx + 40} y={760} width={520} height={70} rx={12} fill="#e5806b" stroke={OL} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={cx + 60} y1={780 + i * 18} x2={cx + 540} y2={780 + i * 18} stroke="#fff" strokeWidth={3} opacity={0.7} />
          ))}
          <Athlete x={cx - 300 + swap * 600} y={590} torso={260} legs={160} color={C.skyDeep} t={t} swim={swap < 0.5} />
          <Athlete x={cx + 300 - swap * 600} y={590} torso={150} legs={170} color={C.coral} t={t} />
          <Txt x={cx - 300} y={880} size={30}>
            пловец: длинный торс
          </Txt>
          <Txt x={cx + 300} y={880} size={30}>
            бегун: длинные ноги
          </Txt>
          {ruler > 0 && swap < 0.3 && (
            <g opacity={ruler * (1 - swap * 3)}>
              <line x1={cx - 420} y1={590} x2={cx + 420} y2={590} stroke={C.violet} strokeWidth={5} strokeDasharray="14 10" />
              <line x1={cx - 420} y1={760} x2={cx + 420} y2={760} stroke={C.violet} strokeWidth={5} strokeDasharray="14 10" />
              <Chip x={cx} y={675} text="брюки одной длины" size={30} color="#e9e2ff" k={ruler} />
            </g>
          )}
          {swap > 0.4 && (
            <g transform={`translate(${cx} 200)`}>
              <Tag x={0} y={0} text="поменять виды спорта? вряд ли" size={34} color="#ffe0d9" />
            </g>
          )}
        </g>
      )}
      {fit > 0 && (
        <g opacity={fit}>
          <g opacity={1 - qs}>
            <g transform={`translate(${cx} 470) scale(${pop(t, at(c, 2.1))})`}>
              <rect x={-480} y={-150} width={960} height={300} rx={40} fill="#fff" stroke={OL} strokeWidth={5} />
              <Txt x={0} y={-60} size={40} weight={900}>
                гены — не приговор,
              </Txt>
              <Txt x={0} y={0} size={40} weight={900} color={C.greenDeep}>
                а подсказка, где шансы на вашей стороне
              </Txt>
              <Txt x={0} y={80} size={32} color={C.inkSoft}>
                выбирайте привычки под себя
              </Txt>
            </g>
          </g>
          {qs > 0 && (
            <g>
              {["что для меня удовольствие, а для других — работа?", "где я теряю счёт времени?"].map((q, i) => (
                <g key={i} transform={`translate(${cx} ${330 + i * 170}) scale(${pop(t, at(c, 3.1) + i * 0.7)})`}>
                  <rect x={-520} y={-60} width={1040} height={120} rx={60} fill={i ? "#e9e2ff" : C.yellow} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={14} size={36}>
                    {q}
                  </Txt>
                </g>
              ))}
              <g transform={`translate(${cx} 720) scale(${pop(t, at(c, 3.6))})`}>
                <Tag x={0} y={0} text="гены не отменяют труда" size={34} color="#fff" />
              </g>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Goldilocks: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const stage = pop(t, 0.2);
  const len = ramp(t, at(c, 0.3), Math.max(1, at(c, 0.95) - at(c, 0.3)));
  const zone = ramp(t, at(c, 1), 0.6);
  const bored = ramp(t, at(c, 2), 0.6);
  const pro = ramp(t, at(c, 3), 0.6);
  const s0 = 1 - zone;
  const s1 = zone * (1 - bored);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(stage * 2)}>
          {/* сцена и микрофон, выступление становится длиннее понемногу */}
          <path d={`M ${cx - 500} 760 L ${cx + 500} 760 L ${cx + 460} 820 L ${cx - 460} 820 Z`} fill={C.wood} stroke={OL} strokeWidth={5} />
          <path d={`M ${cx - 480} 200 Q ${cx - 380} 480 ${cx - 480} 760`} fill={C.red} opacity={0.8} />
          <path d={`M ${cx + 480} 200 Q ${cx + 380} 480 ${cx + 480} 760`} fill={C.red} opacity={0.8} />
          <Worker x={cx - 60} y={740} s={1.4} role="plain" color="#fff" t={t} arms={0.5} />
          <g transform={`translate(${cx + 60} 740)`}>
            <line x1={0} y1={0} x2={0} y2={-200} stroke={OL} strokeWidth={8} />
            <rect x={-16} y={-250} width={32} height={56} rx={14} fill="#4a5874" stroke={OL} strokeWidth={4} />
          </g>
          <g transform={`translate(${cx} 260)`}>
            <rect x={-300} y={-24} width={600} height={48} rx={24} fill="#fff" stroke={OL} strokeWidth={4} />
            <rect x={-296} y={-20} width={592 * (0.15 + 0.85 * len)} height={40} rx={20} fill={C.yellow} />
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={-300 + (i + 1) * 74} y1={-24} x2={-300 + (i + 1) * 74} y2={24} stroke={OL} strokeWidth={2} opacity={0.4} />
            ))}
            <Txt x={0} y={80} size={30} color={C.inkSoft}>
              выступление — понемногу длиннее
            </Txt>
          </g>
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          {[
            { label: "слишком легко", sub: "скучно", col: "#dfe3ea", x: -380 },
            { label: "в самый раз", sub: "интересно", col: "#d9f5e5", x: 0 },
            { label: "слишком трудно", sub: "тревожно", col: "#ffe0d9", x: 380 },
          ].map((z, i) => (
            <g key={i} transform={`translate(${cx + z.x} 480) scale(${pop(t, at(c, 1.1) + i * 0.3) * (i === 1 ? 1.12 : 0.92)})`}>
              <rect x={-170} y={-190} width={340} height={380} rx={30} fill={z.col} stroke={OL} strokeWidth={i === 1 ? 7 : 4} />
              <circle cx={0} cy={-60} r={70} fill={C.yellow} stroke={OL} strokeWidth={5} />
              <circle cx={-24} cy={-70} r={7} fill={OL} />
              <circle cx={24} cy={-70} r={7} fill={OL} />
              <path d={i === 0 ? "M -24 -30 L 24 -30" : i === 1 ? "M -26 -36 Q 0 -10 26 -36" : "M -24 -26 Q 0 -44 24 -26"} stroke={OL} strokeWidth={5} fill="none" strokeLinecap="round" />
              <Txt x={0} y={70} size={32} weight={900}>
                {z.label}
              </Txt>
              <Txt x={0} y={120} size={28} color={C.inkSoft}>
                {z.sub}
              </Txt>
            </g>
          ))}
          <Chip x={cx} y={200} text="правило Златовласки: на краю возможностей" size={34} color={C.yellow} k={pop(t, at(c, 1.4))} />
        </g>
      )}
      {bored > 0 && (
        <g opacity={bored}>
          <g opacity={1 - pro}>
            <Worker x={cx - 200} y={700} s={1.4} role="plain" color={C.sky} t={t} mood="flat" />
            {[0, 1, 2].map((i) => (
              <text key={i} x={cx - 120 + i * 40} y={480 - i * 40 - ((t * 25) % 40)} fontFamily={FONT} fontWeight={900} fontSize={40 + i * 8} fill={C.inkSoft} opacity={0.7}>
                z
              </text>
            ))}
            <g transform={`translate(${cx + 260} 500)`}>
              <Tag x={0} y={0} text="побеждает тот, кто выдерживает скуку" size={30} color="#fff" />
            </g>
          </g>
          {pro > 0 && (
            <g opacity={pro}>
              {[
                { title: "профессионал", sub: "по расписанию", good: true },
                { title: "любитель", sub: "ждёт вдохновения", good: false },
              ].map((p, i) => (
                <g key={i} transform={`translate(${cx - 270 + i * 540} 420) scale(${pop(t, at(c, 3.1) + i * 0.5)})`}>
                  <rect x={-230} y={-130} width={460} height={260} rx={30} fill={p.good ? "#d9f5e5" : "#fff"} stroke={OL} strokeWidth={4} />
                  <Txt x={0} y={-50} size={38} weight={900}>
                    {p.title}
                  </Txt>
                  <Txt x={0} y={10} size={30} color={C.inkSoft}>
                    {p.sub}
                  </Txt>
                  {p.good ? (
                    <g transform="translate(0 80)">
                      {[0, 1, 2, 3, 4].map((j) => (
                        <Check key={j} x={-120 + j * 60} y={0} s={22} k={ramp(t, at(c, 3.3) + j * 0.15, 0.3)} />
                      ))}
                    </g>
                  ) : (
                    <Icon name="bulb" x={0} y={80} s={0.9} color="#dfe3ea" />
                  )}
                </g>
              ))}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Review: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const auto = pop(t, 0.2);
  const stairs = ramp(t, at(c, 1), 0.6);
  const review = ramp(t, at(c, 2), 0.6);
  const ident = ramp(t, at(c, 3), 0.6);
  const s0 = 1 - stairs;
  const s1 = stairs * (1 - review);
  const s2 = review * (1 - ident);
  return (
    <g>
      {s0 > 0 && (
        <g opacity={s0 * clamp01(auto * 2)}>
          {/* автопилот пропускает ошибки */}
          <Worker x={cx - 200} y={700} s={1.4} role="plain" color={C.sky} t={t} mood="flat" />
          <g transform={`translate(${cx - 200} 420)`}>
            <rect x={-140} y={-40} width={280} height={80} rx={40} fill="#dfe3ea" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={12} size={30} color={C.inkSoft}>
              на автопилоте
            </Txt>
          </g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${cx + 150 + i * 130} ${600 - i * 60})`} opacity={0.4 + 0.4 * Math.sin(t * 2 + i)}>
              <circle r={36} fill="#ffe0d9" stroke={C.red} strokeWidth={4} strokeDasharray="8 6" />
              <Txt x={0} y={14} size={40} weight={900} color={C.red}>
                !
              </Txt>
            </g>
          ))}
          <Txt x={cx + 280} y={760} size={30} color={C.red}>
            мелкие ошибки не видны
          </Txt>
        </g>
      )}
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx} 220) scale(${pop(t, at(c, 1.1))})`}>
            <rect x={-520} y={-56} width={1040} height={112} rx={56} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <Txt x={0} y={16} size={40} weight={900}>
              привычки + практика = мастерство
            </Txt>
          </g>
          {[0, 1, 2, 3].map((i) => {
            const k = ramp(t, at(c, 1.3) + i * 0.3, 0.4);
            return (
              <g key={i} opacity={k}>
                <rect x={cx - 440 + i * 220} y={780 - (i + 1) * 100} width={220} height={(i + 1) * 100} fill={["#bfe0fb", "#c2eed7", "#ffe9a0", "#f9cfe1"][i]} stroke={OL} strokeWidth={4} />
                <Txt x={cx - 330 + i * 220} y={760 - (i + 1) * 100 + 70} size={26} weight={900}>
                  {["основа", "автомат", "новый навык", "уровень"][i]}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          <g transform={`translate(${cx} 480)`}>
            <rect x={-420} y={-300} width={840} height={600} rx={20} fill="#fffaf0" stroke={OL} strokeWidth={5} />
            <line x1={-360} y1={-300} x2={-360} y2={300} stroke={C.coral} strokeWidth={4} />
            <Txt x={0} y={-220} size={40} weight={900}>
              годовой обзор
            </Txt>
            {["Что получилось?", "Что не получилось?", "Чему я научился?"].map((q, i) => (
              <g key={i} opacity={clamp01(ramp(t, at(c, 2.3), 1.4) * 3 - i)}>
                <text x={-320} y={-100 + i * 120} fontFamily={FONT} fontWeight={800} fontSize={44} fill={C.ink}>
                  {`${i + 1}. ${q}`}
                </text>
                <line x1={-320} y1={-70 + i * 120} x2={360} y2={-70 + i * 120} stroke="#c7cdd8" strokeWidth={4} strokeDasharray="10 8" />
              </g>
            ))}
          </g>
        </g>
      )}
      {ident > 0 && (
        <g opacity={ident}>
          <g transform={`translate(${cx - 280} 500)`}>
            {/* жёсткая роль трескается */}
            <rect x={-200} y={-120} width={400} height={240} rx={14} fill="#c7cdd8" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={14} size={40} weight={900}>
              «спортсмен»
            </Txt>
            <path d="M -40 -120 L -10 -40 L -50 20 L 0 120" stroke={OL} strokeWidth={6} fill="none" strokeDasharray={300} strokeDashoffset={300 * (1 - ramp(t, at(c, 3.4), 0.6))} />
            <Txt x={0} y={180} size={28} color={C.red}>
              одна роль — легко потерять опору
            </Txt>
          </g>
          <g transform={`translate(${cx + 280} 500) scale(${pop(t, at(c, 3.6))})`}>
            <path d={`M -200 0 Q -200 -140 0 -130 Q 200 -${130 + Math.sin(t * 2) * 10} 200 0 Q 200 140 0 130 Q -200 ${130 + Math.cos(t * 2) * 10} -200 0 Z`} fill="#bfe6fb" stroke={OL} strokeWidth={5} />
            <Txt x={0} y={-10} size={30} weight={900}>
              «люблю движение
            </Txt>
            <Txt x={0} y={30} size={30} weight={900}>
              и не сдаюсь»
            </Txt>
            <Txt x={0} y={180} size={28} color={C.greenDeep}>
              гибко, как вода
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};
