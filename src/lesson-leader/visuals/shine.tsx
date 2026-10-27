// Принцип 4 — SHINE: спортсмен без тренировок, витраж убеждений, личный лидерский час,
// «генеральная уборка», мачта и батарейки, близкие и вещи.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { zoneX } from "./hook";
import { ACRONYMS, RuleCard, WordTiles } from "./image";
import { Backpack, Battery, Bubble, Clock, Glasses, Heart, House, Mountain, OL, Phone, Ship, Sun, Tree, Worker } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

export const Athlete: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const intro = pop(t, 0.2);
  const principle = pop(t, at(c, 1));
  const sport = ramp(t, at(c, 2), 0.5);
  const tree = ramp(t, at(c, 3), 0.6);
  const shirt = ramp(t, at(c, 4), 0.6);
  const s1 = 1 - sport;
  const s2 = sport * (1 - tree);
  const s3 = tree * (1 - shirt);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx - 260} 640) scale(${intro})`}>
            <Worker x={0} y={0} s={1.5} role="masseur" t={t} arms={0.5} />
            <rect x={60} y={-30} width={260} height={50} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
            <path d={`M 80 -40 q 20 ${-10 + Math.sin(t * 4) * 6} 40 0 q 20 ${-10 + Math.sin(t * 4 + 1) * 6} 40 0`} stroke={C.violet} strokeWidth={5} fill="none" />
            <Tag x={60} y={100} text="массажист" size={30} color="#fff" />
          </g>
          {principle > 0 && (
            <g transform={`translate(${cx + 180} 330) scale(${principle})`}>
              <rect x={-400} y={-80} width={800} height={150} rx={34} fill={C.ink} />
              <Txt x={0} y={-16} size={34} color="#fff">
                Чтобы стать великим лидером,
              </Txt>
              <Txt x={0} y={34} size={34} color={C.yellow}>
                сначала станьте великой личностью
              </Txt>
            </g>
          )}
          <Pop t={t} at={at(c, 0.6)} x={cx + 180} y={600}>
            <Tag x={0} y={0} text="фундамент всего учения" size={32} color={C.yellow} />
          </Pop>
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          {/* на диване ждёт рекорда */}
          <g transform={`translate(${cx - 300} 640)`}>
            <rect x={-170} y={-60} width={340} height={110} rx={30} fill={C.coral} stroke={OL} strokeWidth={5} />
            <rect x={-190} y={-130} width={60} height={180} rx={24} fill={C.coral} stroke={OL} strokeWidth={5} />
            <Worker x={0} y={-30} s={1.1} role="plain" color={C.sky} t={0} />
            <g transform="translate(0 -300)">
              <Bubble x={0} y={0} w={260} h={80} fill="#fff" />
              <Txt x={0} y={10} size={28}>
                жду рекорд…
              </Txt>
            </g>
            <Cross x={0} y={-200} s={90} k={ramp(t, at(c, 2.4), 0.5)} />
          </g>
          {/* тренируется — медаль */}
          <g transform={`translate(${cx + 300} 680)`}>
            <g transform={`translate(0 ${-Math.abs(Math.sin(t * 5)) * 30})`}>
              <Worker x={0} y={0} s={1.3} role="plain" color={C.green} t={t} arms={Math.abs(Math.sin(t * 5))} />
            </g>
            <g transform="translate(110 -230)" opacity={ramp(t, at(c, 2.5), 0.5)}>
              <path d="M -20 -60 L 0 -10 L 20 -60" stroke={C.red} strokeWidth={10} fill="none" />
              <circle r={36} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={36} weight={900}>
                1
              </Txt>
            </g>
            <Tag x={0} y={90} text="тренировка" size={30} color={C.yellow} />
          </g>
        </g>
      )}
      {s3 > 0 && (
        <g opacity={s3}>
          {/* корни (внутреннее) питают крону (внешнее) */}
          <g transform={`translate(${cx} 640)`}>
            <path d="M 0 0 L -120 140 M 0 0 L 110 150 M 0 0 L -30 180 M 0 0 L 50 170" stroke="#8a5a2b" strokeWidth={16} strokeLinecap="round" opacity={0.85} />
            <Tree x={0} y={0} s={1.2} t={t} fruits={Math.floor(ramp(t, at(c, 3.3), 1.5) * 8)} />
          </g>
          <rect x={cx - 600} y={636} width={1200} height={8} fill="#8a5a2b" opacity={0.5} />
          <Tag x={cx + 380} y={330} text="внешнее: результаты" size={30} color={C.yellow} />
          <Tag x={cx + 380} y={760} text="внутреннее: мысли, силы, забота о себе" size={28} color="#fff" />
        </g>
      )}
      {shirt > 0 && (
        <g opacity={shirt}>
          <g transform={`translate(${cx} 600) scale(1.4)`}>
            <path d="M -110 -150 L -40 -170 Q 0 -140 40 -170 L 110 -150 L 150 -80 L 100 -60 L 100 120 L -100 120 L -100 -60 L -150 -80 Z" fill="#fff" stroke={OL} strokeWidth={5} />
            <text x={0} y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill={C.ink}>
              Я с рождения
            </text>
            <text x={0} y={0} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={C.yellowDeep}>
              классный
            </text>
          </g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} transform={`translate(${cx - 380 + i * 150} ${250 + (i % 2) * 40}) scale(${0.4 + 0.15 * Math.sin(t * 3 + i)})`} d="M 0 -50 L 14 -16 L 50 -14 L 22 10 L 30 46 L 0 26 L -30 46 L -22 10 L -50 -14 L -14 -16 Z" fill={C.yellow} stroke={OL} strokeWidth={3} />
          ))}
          <Tag x={cx} y={860} text="лишних людей не бывает" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const StainedGlass: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const A = ACRONYMS.SHINE;
  const word = ramp(t, 0.1, 0.4) * (1 - ramp(t, at(c, 1), 0.5));
  const glasses = ramp(t, at(c, 1), 0.5) * (1 - ramp(t, at(c, 2), 0.5));
  const win = ramp(t, at(c, 2), 0.6);
  const beliefs = ramp(t, at(c, 3), 0.6);
  const clear = ramp(t, at(c, 4), 2);
  const expect = ramp(t, at(c, 5), 0.6);
  const pieces = [
    { d: "M -260 -260 L 0 -260 L 0 -40 L -260 -100 Z", c: "#ff8fb1", label: "так принято" },
    { d: "M 0 -260 L 260 -260 L 260 -80 L 0 -40 Z", c: "#7fd8ff", label: "без должности —\nничего не изменить" },
    { d: "M -260 -100 L 0 -40 L -40 260 L -260 260 Z", c: "#ffd23f", label: "никому нельзя\nдоверять" },
    { d: "M 0 -40 L 260 -80 L 260 260 L -40 260 Z", c: "#a6e3a1", label: "работа\nбессмысленна" },
  ];
  return (
    <g>
      {word > 0 && (
        <g opacity={word}>
          <WordTiles word="SHINE" x={cx - 50} y={300} t={t} at={0.15} s={1.1} color={A.color} />
          <Pop t={t} at={0.7} x={cx} y={420}>
            <Tag x={0} y={0} text="«сияй»" size={38} color={C.yellow} />
          </Pop>
          {A.rules.map((r, i) => (
            <RuleCard key={i} x={cx - 50 + (i - 2) * 262} y={540} r={r} color={A.color} k={pop(t, 0.6 + i * 0.15)} />
          ))}
        </g>
      )}
      {glasses > 0 && (
        <g opacity={glasses}>
          <Glasses x={cx - 300} y={470} s={1.3} color="#ff8fb1" />
          <Glasses x={cx + 300} y={470} s={1.3} color="#2b2b3a" />
          <Cross x={cx - 300} y={470} s={140} k={ramp(t, at(c, 1.5), 0.4)} />
          <Cross x={cx + 300} y={470} s={140} k={ramp(t, at(c, 1.7), 0.4)} />
          <Tag x={cx - 300} y={640} text="розовые" size={30} color="#fff" />
          <Tag x={cx + 300} y={640} text="чёрные" size={30} color="#fff" />
          <Tag x={cx} y={250} text="S — смотреть ясно" size={40} color={C.yellow} />
        </g>
      )}
      {win > 0 && (
        <g opacity={win}>
          <g transform={`translate(${cx - 140} 500)`}>
            <path d="M -290 300 L -290 -150 Q -290 -330 0 -330 Q 290 -330 290 -150 L 290 300 Z" fill="#fff" stroke={OL} strokeWidth={10} />
            {/* мир за окном */}
            <rect x={-260} y={-60} width={520} height={340} fill="#bfe6fb" />
            <Sun x={160} y={20} r={50} t={t} />
            <Tree x={-140} y={260} s={0.8} t={t} fruits={4} />
            <Worker x={60} y={260} s={0.8} role="plain" t={t} />
            {pieces.map((p, i) => (
              <g key={i}>
                <path d={p.d} fill={p.c} opacity={0.85 * (1 - clamp01(clear * 4 - i))} stroke={OL} strokeWidth={6} />
                {beliefs > 0 && clamp01(clear * 4 - i) < 0.5 && (
                  <g opacity={beliefs * (1 - clamp01(clear * 4 - i) * 2)}>
                    {p.label.split("\n").map((l, j) => (
                      <text key={j} x={i % 2 ? 130 : -130} y={(i < 2 ? -160 : 110) + j * 30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={C.ink}>
                        {l}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            ))}
          </g>
          {clear > 0 && (
            <g transform={`translate(${cx + 330} 380) scale(${clamp01(clear * 2)})`}>
              <Bubble x={0} y={0} w={330} h={130} fill="#fffbe6" />
              <Txt x={0} y={-8} size={28}>
                а верно ли
              </Txt>
              <Txt x={0} y={30} size={28} weight={900}>
                я думаю?
              </Txt>
            </g>
          )}
          {expect > 0 && (
            <g transform={`translate(${cx + 330} 650)`} opacity={expect}>
              <Panel x={-180} y={-90} w={360} h={170} fill="#fff" r={24} />
              <Txt x={0} y={-30} size={24}>
                «не поддержат» →
              </Txt>
              <Txt x={0} y={6} size={24}>
                замкнулся →
              </Txt>
              <Txt x={0} y={42} size={24} color={C.red}>
                не поддержали
              </Txt>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

const ACTS = [
  { label: "учиться", icon: "book" },
  { label: "дневник", icon: "pen" },
  { label: "цели", icon: "target" },
  { label: "представить", icon: "eye" },
  { label: "движение", icon: "run" },
];

const ActIcon: React.FC<{ icon: string; t: number }> = ({ icon, t }) => {
  if (icon === "book") return <g><rect x={-40} y={-30} width={80} height={60} rx={6} fill={C.skyDeep} stroke={OL} strokeWidth={3} /><path d="M 0 -30 L 0 30" stroke="#fff" strokeWidth={3} /></g>;
  if (icon === "pen") return <g><rect x={-34} y={-40} width={68} height={80} rx={6} fill="#fff" stroke={OL} strokeWidth={3} /><path d="M -20 -16 L 20 -16 M -20 0 L 20 0 M -20 16 L 8 16" stroke={C.grey} strokeWidth={4} /></g>;
  if (icon === "target") return <g>{[40, 26, 12].map((r, i) => <circle key={i} r={r} fill={i % 2 ? "#fff" : C.red} stroke={OL} strokeWidth={3} />)}</g>;
  if (icon === "eye") return <g><path d="M -44 0 Q 0 -40 44 0 Q 0 40 -44 0 Z" fill="#fff" stroke={OL} strokeWidth={3} /><circle r={14} fill={C.violet} /></g>;
  return <g transform={`rotate(${Math.sin(t * 6) * 8})`}><circle cx={0} cy={-26} r={12} fill={C.green} /><path d="M 0 -14 L 0 14 M 0 14 L -16 38 M 0 14 L 16 38 M 0 -4 L -20 8 M 0 -4 L 20 -14" stroke={C.green} strokeWidth={7} strokeLinecap="round" /></g>;
};

export const MorningHour: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const sunrise = ramp(t, 0.2, 3);
  const softer = ramp(t, at(c, 1), 0.5);
  const acts = (i: number) => pop(t, at(c, 2) + i * 0.35);
  const pick = ramp(t, at(c, 3), 0.6);
  const forty = ramp(t, at(c, 4), 3);
  const s3 = ramp(t, at(c, 4), 0.4);
  return (
    <g>
      {/* рассвет */}
      <g opacity={1 - s3 * 0.8}>
        <circle cx={cx} cy={820 - sunrise * 240} r={120} fill="#ffd28a" opacity={0.9} />
        <rect x={cx - 640} y={760} width={1280} height={80} fill="#ffe9c7" />
      </g>
      {s3 < 1 && (
        <g opacity={1 - s3}>
          <g transform={`translate(${cx - 380} 380)`}>
            <Clock x={0} y={0} s={1.1} h={softer > 0.5 ? 7 : 5} m={0} />
            {softer > 0 && (
              <g opacity={softer}>
                <Tag x={0} y={170} text="по автору — в пять утра" size={28} color="#fff" />
                <Tag x={0} y={240} text="ваш спокойный час" size={30} color={C.yellow} />
              </g>
            )}
          </g>
          <Worker x={cx + 340} y={700} s={1.5} role="plain" color={C.violet} t={t * 0.4} />
          {ACTS.map((a, i) => {
            const k = acts(i);
            const chosen = i === 0 || i === 1 || i === 4;
            const x = cx - 120 + (i % 3) * 190;
            const y = 300 + Math.floor(i / 3) * 210;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp01(k * 2) * (pick > 0 && !chosen ? 1 - pick * 0.6 : 1)}>
                <circle r={70} fill="#fff" stroke={pick > 0.5 && chosen ? C.green : OL} strokeWidth={pick > 0.5 && chosen ? 8 : 4} />
                <ActIcon icon={a.icon} t={t} />
                <Txt x={0} y={110} size={26}>
                  {a.label}
                </Txt>
              </g>
            );
          })}
          {pick > 0 && <Tag x={cx + 80} y={830} text="2–3 упражнения в день" size={30} color={C.yellow} />}
        </g>
      )}
      {s3 > 0 && (
        <g opacity={s3}>
          <Txt x={cx} y={250} size={46} weight={900}>
            ≈ 40 дней новой привычки
          </Txt>
          {Array.from({ length: 40 }).map((_, i) => {
            const k = clamp01(forty * 40 - i);
            const hard = i < 14;
            return <rect key={i} x={cx - 520 + (i % 10) * 105} y={340 + Math.floor(i / 10) * 105} width={90} height={90} rx={14} fill={k > 0 ? (hard ? C.orange : C.green) : "#fff"} stroke={OL} strokeWidth={3} opacity={0.9} />;
          })}
          <Tag x={cx - 300} y={820} text="сначала неудобно" size={28} color="#ffe2c7" />
          <Tag x={cx + 300} y={820} text="потом легче" size={28} color="#d9f5e3" />
        </g>
      )}
    </g>
  );
};

export const Cleanup: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const broom = pop(t, 0.2);
  const pack = ramp(t, at(c, 1), 0.6);
  const forgive = ramp(t, at(c, 2), 1.2);
  const thanks = ramp(t, at(c, 3), 0.6);
  const s1 = 1 - ramp(t, at(c, 3), 0.4);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          {broom > 0 && pack < 1 && (
            <g transform={`translate(${cx} 450) scale(${broom})`} opacity={1 - pack}>
              <circle r={190} fill="#fff" stroke={OL} strokeWidth={5} />
              {Array.from({ length: 7 }).map((_, i) => (
                <rect key={i} x={-120 + ((i * 47) % 200) + Math.sin(t * 3 + i) * 4} y={-100 + ((i * 61) % 180)} width={34} height={22} rx={4} fill={[C.grey, C.wood, C.coral][i % 3]} transform={`rotate(${i * 25})`} />
              ))}
              <Tag x={0} y={260} text="генеральная уборка — в голове" size={32} color={C.yellow} />
            </g>
          )}
          {pack > 0 && (
            <g opacity={pack}>
              <g transform={`translate(${cx - 140 + forgive * 0} 690)`}>
                <Worker x={0} y={0} s={1.5} role="plain" color={C.teal} t={t} mood={forgive > 0.5 ? "smile" : "sad"} />
                {/* путы на ногах */}
                <g opacity={1 - forgive}>
                  <path d="M -40 20 Q 0 50 40 20" stroke="#6b7280" strokeWidth={10} fill="none" />
                  <circle cx={70} cy={40} r={28} fill="#6b7280" stroke={OL} strokeWidth={4} />
                  <Tag x={140} y={100} text="прошлое держит" size={24} color="#dfe3ea" />
                </g>
              </g>
              <g transform={`translate(${cx - 140 + forgive * -380} ${520 + forgive * 200}) rotate(${forgive * -30}) scale(${1 - forgive * 0.3})`}>
                <Backpack x={0} y={0} s={1} labels={["обиды", "сомнения", "ярлыки"]} />
              </g>
              {forgive > 0.6 && (
                <g transform={`translate(${cx + 300} 380)`} opacity={(forgive - 0.6) * 2.5}>
                  <Bubble x={0} y={0} w={340} h={110} fill="#e6f7ea" />
                  <Txt x={0} y={-6} size={28}>
                    я решаю
                  </Txt>
                  <Txt x={0} y={30} size={30} weight={900}>
                    простить
                  </Txt>
                </g>
              )}
            </g>
          )}
        </g>
      )}
      {thanks > 0 && (
        <g opacity={thanks}>
          <g transform={`translate(${cx} 500) rotate(${-2 + wob(t, 2, 0.6)})`}>
            <Panel x={-330} y={-280} w={660} h={520} fill="#fffef8" r={20} />
            <Txt x={0} y={-200} size={40} weight={900}>
              Я благодарен за…
            </Txt>
            {["близких", "здоровье", "крышу над головой", "интересную задачу"].map((s, i) => (
              <g key={i} opacity={ramp(t, at(c, 3.3) + i * 0.3, 0.4)}>
                <Heart x={-240} y={-110 + i * 90} s={0.55} />
                <text x={-190} y={-98 + i * 90} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.ink}>
                  {s}
                </text>
              </g>
            ))}
          </g>
        </g>
      )}
    </g>
  );
};

export const MastBattery: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const ship = pop(t, 0.2);
  const broken = ramp(t, at(c, 0.6), 0.8) * (1 - ramp(t, at(c, 1.2), 0.8));
  const note = pop(t, at(c, 1));
  const phone = ramp(t, at(c, 2), 0.5);
  const charge = ramp(t, at(c, 2.3), 2.5);
  const bats = (i: number) => pop(t, at(c, 3) + i * 0.4);
  const s1 = 1 - ramp(t, at(c, 2), 0.4);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <path d={`M ${cx - 640} 760 ${Array.from({ length: 16 }, (_, i) => `Q ${cx - 600 + i * 80} ${740 + Math.sin(t * 2 + i) * 14} ${cx - 560 + i * 80} 760`).join(" ")} L ${cx + 640} 840 L ${cx - 640} 840 Z`} fill="#7fc4ea" />
          <g transform={`scale(${ship})`} style={{ transformOrigin: `${cx}px 700px` }}>
            <Ship x={cx - 160} y={690} s={1.2} t={t} broken={broken} />
          </g>
          <Tag x={cx - 160} y={250} text={broken > 0.5 ? "без мачты — не плывёт" : "здоровье = мачта"} size={34} color={broken > 0.5 ? "#ffd6d6" : C.yellow} />
          {note > 0 && (
            <g transform={`translate(${cx + 360} 420) scale(${note})`}>
              <Panel x={-200} y={-90} w={400} h={170} fill="#fff" r={24} />
              <Txt x={0} y={-24} size={26} color={C.inkSoft}>
                не медицинский совет —
              </Txt>
              <Txt x={0} y={20} size={28} weight={900}>
                силы — это ресурс
              </Txt>
            </g>
          )}
        </g>
      )}
      {phone > 0 && (
        <g opacity={phone}>
          <Phone x={cx - 330} y={480} s={1.2}>
            <Battery x={0} y={10} s={0.55} level={0.08 + charge * 0.92} />
          </Phone>
          <path d={`M ${cx - 330} 660 Q ${cx - 330} 760 ${cx - 200} 790 L ${cx - 120} 790`} stroke={OL} strokeWidth={8} fill="none" />
          <rect x={cx - 130} y={770} width={50} height={40} rx={6} fill="#fff" stroke={OL} strokeWidth={4} />
          <Tag x={cx - 330} y={250} text="живите вдохновенно" size={34} color={C.yellow} />
          {["музыка", "книги", "люди", "природа"].map((s, i) => (
            <g key={i} transform={`translate(${cx + 30 + (i % 2) * 280} ${400 + Math.floor(i / 2) * 250}) scale(${bats(i)})`}>
              <Battery x={0} y={0} s={0.55} level={1} color={[C.violet, C.skyDeep, C.coral, C.green][i]} />
              <Txt x={0} y={110} size={28}>
                {s}
              </Txt>
            </g>
          ))}
          <Pop t={t} at={at(c, 3.7)} x={cx + 170} y={850}>
            <Tag x={0} y={0} text="отдых — защита от выгорания" size={28} color="#fff" />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const HomeThings: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const peak = pop(t, 0.2);
  const home = ramp(t, at(c, 1), 0.6);
  const life = ramp(t, at(c, 2), 0.5);
  const leash = ramp(t, at(c, 3), 0.5);
  const flip = ramp(t, at(c, 3.6), 0.8);
  const self = ramp(t, at(c, 4), 0.5);
  const give = ramp(t, at(c, 5), 0.6);
  const s1 = 1 - life;
  const s2 = life * (1 - give);
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          <g transform={`translate(${cx - 300} 0)`} opacity={clamp01(peak * 2) * (1 - home * 0.5)}>
            <Mountain x={0} y={800} s={1} color="#a9bcd4" />
            <Worker x={-60} y={395} s={0.8} role="boss" t={t} mood="sad" />
            <Tag x={0} y={860} text="вершина — в одиночестве?" size={28} color="#fff" />
          </g>
          {home > 0 && (
            <g opacity={home}>
              <House x={cx + 280} y={720} s={1.2} glow={home} />
              {[0, 1, 2].map((i) => (
                <Worker key={i} x={cx + 120 + i * 160} y={800} s={0.9} role="plain" color={[C.coral, C.green, C.sky][i]} t={t + i} arms={0.6} />
              ))}
              <Tag x={cx + 280} y={300} text="крепкий тыл" size={34} color={C.yellow} />
            </g>
          )}
        </g>
      )}
      {s2 > 0 && (
        <g opacity={s2}>
          {/* человек и вещи */}
          <g transform={`translate(${cx - 200 + leash * flip * 0} 720)`}>
            <g transform={`translate(${leash * (1 - flip) * 200} 0) rotate(${leash * (1 - flip) * 20})`}>
              <Worker x={0} y={0} s={1.5} role="plain" color={C.teal} t={t} mood={leash > 0.5 && flip < 0.5 ? "sad" : "smile"} arms={0.4} />
            </g>
          </g>
          {/* вещи */}
          {[
            { x: 260, y: 640, el: <g><rect x={-90} y={-40} width={180} height={60} rx={20} fill={C.red} stroke={OL} strokeWidth={4} /><circle cx={-50} cy={24} r={20} fill={OL} /><circle cx={50} cy={24} r={20} fill={OL} /></g> },
            { x: 420, y: 560, el: <House x={0} y={80} s={0.45} /> },
          ].map((it, i) => (
            <g key={i} transform={`translate(${cx + it.x} ${it.y})`} opacity={life}>
              {it.el}
            </g>
          ))}
          {leash > 0 && (
            <path
              d={`M ${cx - 130 + leash * (1 - flip) * 200} ${600} Q ${cx + 80} ${520} ${cx + 180} 620`}
              stroke={flip > 0.5 ? C.green : C.red}
              strokeWidth={6}
              fill="none"
              opacity={leash}
            />
          )}
          <Tag x={cx} y={260} text={leash > 0.5 ? (flip > 0.5 ? "я владею вещами" : "вещи владеют мной") : "каждый день — чуть лучше"} size={36} color={flip > 0.5 || leash < 0.5 ? C.yellow : "#ffd6d6"} />
          {self > 0 && (
            <g transform={`translate(${cx} 380)`} opacity={self}>
              <Tag x={0} y={0} text="важнее, кем я становлюсь" size={30} color="#fff" />
            </g>
          )}
        </g>
      )}
      {give > 0 && (
        <g opacity={give}>
          <g transform={`translate(${cx} 520)`}>
            <path d="M 0 -220 L 0 160 M -60 160 L 60 160" stroke={OL} strokeWidth={10} strokeLinecap="round" />
            <g transform={`rotate(${7 * give})`}>
              <path d="M -260 -190 L 260 -190" stroke={OL} strokeWidth={8} strokeLinecap="round" />
              <path d="M -300 -190 L -260 -100 L -220 -190 M 220 -190 L 260 -100 L 300 -190" stroke={OL} strokeWidth={4} fill="none" />
              <ellipse cx={-260} cy={-100} rx={80} ry={16} fill={C.grey} />
              <ellipse cx={260} cy={-100} rx={80} ry={16} fill={C.green} />
              <Txt x={-260} y={-130} size={30}>
                получил
              </Txt>
              <Txt x={260} y={-130} size={30} color={C.greenDeep}>
                отдал
              </Txt>
              <Heart x={260} y={-160} s={0.7} />
            </g>
          </g>
          <Tag x={cx} y={250} text="успех — в том, что вы отдали" size={36} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export { Arrow, Check, interpolate };
