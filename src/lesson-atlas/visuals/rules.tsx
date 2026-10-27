// Блок «Правила игры»: сделка в баре, правило альянса, «результат, а не старание»,
// новый мост, Закон справедливой доли, логика Поттера, туман намёков, институт.
import React from "react";
import { interpolate } from "remotion";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Bridge, Bubble, Canyon, Derrick, Doc, Factory, Figure, OL, WineGlass, zoneX } from "./draw";
import { Arrow, Check, Cross, Pop, Tag, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

export const BarTable: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = pop(t, 0.2);
  const seats = [
    { name: "Джеймс", color: "#8796ab", hair: "m" as const, b: 1 },
    { name: "Бойль", color: "#7a5b4a", hair: "bald" as const, b: 1.25 },
    { name: "Ларкин", color: "#9a8f7a", hair: "bald" as const, b: 1.5 },
    { name: "Моуч", color: "#5b6a84", hair: "m" as const, b: 1.75 },
  ];
  const words = [
    { text: "«обстоятельства»", b: 2.2 },
    { text: "«чужое бремя»", b: 2.6 },
    { text: "«равные возможности»", b: 3.3 },
  ];
  const ore = ramp(t, at(c, 3.6), 1);
  const swap = pop(t, at(c, 5));
  const mouch = pop(t, at(c, 6));
  return (
    <g>
      {/* низкий потолок «подвала» */}
      <rect x={0} y={0} width={1920} height={110} fill="#2f3a57" opacity={0.85 * k} />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={420 + i * 190} cy={110} r={16} fill="#7fa8ff" opacity={0.5 + 0.3 * Math.sin(t * 2 + i)} />
      ))}
      {/* стол */}
      <g opacity={k}>
        <ellipse cx={1100} cy={780} rx={520} ry={90} fill="#6b4a33" stroke={OL} strokeWidth={5} />
        {seats.map((s, i) => {
          const kk = pop(t, at(c, s.b));
          const x = 760 + i * 230;
          return (
            <g key={i} opacity={clamp01(kk * 1.4)}>
              <Figure x={x} y={740} s={0.95} hair={s.hair} color={s.color} t={t} mood="flat" />
              <WineGlass x={x + 50} y={790} s={0.6} fill="#5a8cff" />
              <Tag x={x} y={890} text={s.name} size={26} color={C.white} />
            </g>
          );
        })}
      </g>
      {words.map((w, i) => (
        <Bubble key={i} x={700 + i * 380} y={260 + (i % 2) * 60} w={w.text.length * 17 + 70} h={80} text={w.text} size={30} k={pop(t, at(c, w.b)) * (1 - ramp(t, at(c, 3.6), 0.3))} />
      ))}
      {/* глыба руды делится на «доли» */}
      {ore > 0 && (
        <g transform="translate(1100 250)">
          {[0, 1, 2, 3].map((i) => {
            const a = -60 + i * 40;
            const dx = Math.cos(((a - 90) * Math.PI) / 180) * 120 * ore;
            const dy = Math.sin(((a - 90) * Math.PI) / 180) * 40 * ore;
            return (
              <path key={i} d={`M 0 0 L ${Math.cos(((a - 110) * Math.PI) / 180) * 150} ${Math.sin(((a - 110) * Math.PI) / 180) * 150 + 120} A 150 150 0 0 1 ${Math.cos(((a - 70) * Math.PI) / 180) * 150} ${Math.sin(((a - 70) * Math.PI) / 180) * 150 + 120} Z`} fill={i === 0 ? "#8a6a52" : "#9b7b62"} stroke={OL} strokeWidth={4} transform={`translate(${dx} ${dy})`} />
            );
          })}
          <Tag x={0} y={-60} text="«доля железной руды»" size={34} color={C.yellow} />
          <Pop t={t} at={at(c, 4)} x={0} y={200}>
            <Tag x={0} y={0} text="рудники есть у Риардена" size={28} color="#f5d0d6" />
          </Pop>
        </g>
      )}
      {swap > 0 && (
        <g transform={`translate(1100 480) scale(${swap})`} opacity={1 - mouch}>
          <Arrow x1={-220} y1={0} x2={220} y2={0} k={1} color={C.inkSoft} bend={0.25} />
          <Arrow x1={220} y1={30} x2={-220} y2={30} k={1} color={C.inkSoft} bend={0.25} />
          <Tag x={0} y={100} text="ты — мне, я — тебе" size={30} color={C.white} />
        </g>
      )}
      {mouch > 0 && (
        <g transform={`translate(1100 470) scale(${mouch})`}>
          <rect x={-300} y={-56} width={600} height={112} rx={28} fill={C.ink} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.white}>
            Моуч — «человек Риардена
          </text>
          <text y={34} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.yellow}>
            в Вашингтоне»
          </text>
        </g>
      )}
    </g>
  );
};

export const RuleVote: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const hands = ramp(t, 0.4, 1.4);
  const stamp = ramp(t, at(c, 0.6), 0.4);
  const map = pop(t, at(c, 1));
  const erase = ramp(t, at(c, 1.5), 1.4);
  const conway = pop(t, at(c, 2));
  const dagny = pop(t, at(c, 3));
  return (
    <g>
      {/* зал альянса: ряды рук */}
      <g opacity={1 - map * 0.85}>
        {Array.from({ length: 14 }).map((_, i) => {
          const x = cx - 600 + (i % 7) * 200;
          const y = 760 + Math.floor(i / 7) * 120;
          const up = clamp01(hands * 14 - i) * (i === 3 || i === 9 || i === 12 ? 0.2 : 1);
          return <Figure key={i} x={x} y={y} s={0.75} hair={i % 3 ? "m" : "bald"} color={["#8796ab", "#7a5b4a", "#5b6a84"][i % 3]} t={t} arms={up} mood="flat" />;
        })}
        <Doc x={cx} y={330} s={0.8} title={"Правило против\nхищнической\nконкуренции"} stamp="ПРИНЯТО" stampK={stamp} />
      </g>
      {/* карта Колорадо */}
      {map > 0 && (
        <g transform={`translate(${cx} 440) scale(${map * 0.82})`}>
          <rect x={-420} y={-280} width={840} height={560} rx={24} fill="#f4ead6" stroke={OL} strokeWidth={6} />
          <text x={-390} y={-236} fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.inkSoft}>
            КОЛОРАДО
          </text>
          <path d="M -360 120 Q -120 -40 60 40 T 360 -120" stroke="#c4a37a" strokeWidth={14} fill="none" strokeDasharray="1 0" />
          <path d="M -360 160 Q -100 60 80 120 T 360 60" stroke={C.coral} strokeWidth={16} fill="none" strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * erase} />
          <Tag x={150} y={190} text="«Феникс-Дуранго»" size={28} color="#ffd6cf" />
          <Tag x={-150} y={-60} text="Таггерт" size={28} color={C.white} />
          <Pop t={t} at={at(c, 1.4)} x={0} y={-150}>
            <Tag x={0} y={0} text="через 9 месяцев — уйти" size={32} color={C.yellow} />
          </Pop>
        </g>
      )}
      {conway > 0 && (
        <g transform={`translate(${cx - 380} 800) scale(${conway})`} opacity={1 - dagny * 0.6}>
          <rect x={-200} y={-46} width={400} height={92} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={28} fill={C.ink}>
            Конвей: «так решило
          </text>
          <text y={28} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={28} fill={C.ink}>
            большинство»
          </text>
        </g>
      )}
      {dagny > 0 && (
        <g transform={`translate(${cx + 260} 800) scale(${dagny})`}>
          <rect x={-330} y={-50} width={660} height={100} rx={26} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text y={-8} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={28} fill={C.ink}>
            Дагни: «вас наказывают за то,
          </text>
          <text y={28} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={28} fill={C.ink}>
            что вы работали так хорошо»
          </text>
        </g>
      )}
    </g>
  );
};

export const Result: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wy = pop(t, 0.2);
  const ans = pop(t, at(c, 1));
  const cards = pop(t, at(c, 2));
  const cross = ramp(t, at(c, 2.5), 0.5);
  return (
    <g>
      <g transform={`translate(330 880) scale(${wy})`}>
        <Derrick x={-80} y={0} s={1.1} t={t} flame />
        <Derrick x={110} y={0} s={0.8} t={t + 1} flame />
      </g>
      <Bubble x={640} y={260} w={640} h={130} text={"Уайэтт: «через 9 месяцев\nнужны перевозки!»"} size={34} k={wy} fill="#fdecef" />
      {ans > 0 && (
        <g transform={`translate(840 470) scale(${ans})`}>
          <rect x={-360} y={-56} width={720} height={112} rx={30} fill={C.metal} stroke={OL} strokeWidth={5} />
          <text y={16} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={38} fill={C.white}>
            «Вы получите нужный объём»
          </text>
        </g>
      )}
      {cards > 0 && (
        <g transform={`scale(1)`}>
          <g transform={`translate(560 720) scale(${cards})`}>
            <rect x={-250} y={-60} width={500} height={120} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
            <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.inkSoft}>
              «делаю всё, что могу»
            </text>
            <Cross x={0} y={0} s={140} k={cross} />
          </g>
          <g transform={`translate(1100 720) scale(${cards})`}>
            <rect x={-200} y={-60} width={400} height={120} rx={24} fill={C.yellow} stroke={OL} strokeWidth={4} />
            <text y={14} textAnchor="middle" fontFamily={FONTS.display} fontSize={44} fill={C.ink}>
              результат
            </text>
            <Check x={150} y={-50} s={40} k={ramp(t, at(c, 2.6), 0.5)} />
          </g>
        </g>
      )}
    </g>
  );
};

export const BridgeDesign: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const old = pop(t, 0.3);
  const oldCross = ramp(t, at(c, 1.4), 0.5);
  const fresh = ramp(t, at(c, 2), 1.6);
  const cost = pop(t, at(c, 2.5));
  const sun = ramp(t, at(c, 3), 1.4);
  return (
    <g>
      <rect x={60} y={120} width={1320} height={780} rx={20} fill="#e6f1fb" stroke="#b8cde4" strokeWidth={4} />
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={i} x1={60 + i * 60} y1={120} x2={60 + i * 60} y2={900} stroke="#cfe0f2" strokeWidth={2} />
      ))}
      <g transform="translate(720 520)">
        <g transform="scale(0.68) translate(-960 -560)">
          <Canyon y={620} gapA={560} gapB={1360} color="#e0b58c" />
        </g>
      </g>
      {/* копия деревянного моста */}
      {old > 0 && (
        <g transform={`translate(440 420) scale(${old})`} opacity={1 - fresh * 0.75}>
          <Bridge x={-260} y={0} w={520} color="#9b6f45" />
          <Tag x={0} y={-150} text="«стальная копия деревянного»" size={28} color={C.white} />
          <Cross x={0} y={-40} s={130} k={oldCross} />
        </g>
      )}
      {/* новая ферма Риардена */}
      {fresh > 0 && (
        <g>
          <Bridge x={330} y={570} w={780} k={fresh} color={C.metal} arches />
          <Pop t={t} at={at(c, 2.2)} x={720} y={360}>
            <Tag x={0} y={0} text="новый тип фермы" size={34} color="#c5ebe5" />
          </Pop>
        </g>
      )}
      {cost > 0 && (
        <g transform={`translate(720 790) scale(${cost})`}>
          <rect x={-420} y={-46} width={840} height={92} rx={46} fill={C.ink} />
          <text y={15} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={38} fill={C.yellow}>
            $800 тыс. вместо $2 млн
          </text>
        </g>
      )}
      {sun > 0 && (
        <g opacity={sun}>
          <Factory x={1180} y={460} s={0.55} t={t} smoke={1.4} />
          <circle cx={1180} cy={180} r={50} fill={C.yellow} opacity={0.8} />
          <Tag x={1100} y={250} text="«новый восход»" size={30} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

export const FairShare: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const doc = pop(t, 0.2);
  const stamp = ramp(t, at(c, 1.5), 0.4);
  const move = ramp(t, at(c, 2.3), 1.4);
  const own = pop(t, at(c, 3));
  const fair = pop(t, at(c, 4));
  const signs = [
    { from: "Руда Риардена", to: "Ларкин", y: 0 },
    { from: "Риарден-Уголь", to: "Данаггер", y: 1 },
  ];
  return (
    <g>
      <g transform={`translate(${cx - 330} 470) rotate(${-4 + wob(t, 1, 1)})`}>
        <Doc x={0} y={0} s={doc * 0.95} title={"Закон\nсправедливой\nдоли"} stamp="ПРИНЯТ" stampK={stamp} />
        <Pop t={t} at={at(c, 1.3)} x={0} y={260}>
          <Tag x={0} y={0} text="голосование — 45 минут" size={30} color={C.yellow} />
        </Pop>
      </g>
      {signs.map((s, i) => {
        const k = pop(t, at(c, 2.1 + i * 0.2));
        if (k <= 0.001) return null;
        const flip = clamp01(move * 2 - i * 0.6);
        return (
          <g key={i} transform={`translate(${cx + 260} ${330 + i * 190}) scale(${k})`}>
            <rect x={-250} y={-60} width={500} height={120} rx={14} fill={OL} />
            <g transform={`scale(1 ${Math.abs(Math.cos(flip * Math.PI))})`}>
              <text y={14} textAnchor="middle" fontFamily={FONTS.condensed} fontWeight={700} fontSize={44} fill={flip < 0.5 ? C.fire : "#d9deea"}>
                {flip < 0.5 ? s.from : s.to}
              </text>
            </g>
          </g>
        );
      })}
      {own > 0 && (
        <g transform={`translate(${cx + 260} 680) scale(${own})`}>
          <rect x={-330} y={-56} width={660} height={112} rx={28} fill={C.white} stroke={C.metal} strokeWidth={5} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            «собственность либо принадлежит
          </text>
          <text y={32} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            мне, либо нет»
          </text>
        </g>
      )}
      {fair > 0 && (
        <g transform={`translate(${cx} 810) scale(${fair})`}>
          <rect x={-430} y={-40} width={860} height={80} rx={40} fill="#ead6df" stroke={OL} strokeWidth={4} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.ink}>
            защитники: «свой шанс должен получить каждый»
          </text>
        </g>
      )}
    </g>
  );
};

export const PotterFork: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const start = pop(t, 0.3);
  const q = pop(t, at(c, 1));
  const fork = ramp(t, at(c, 2), 1.2);
  const check = pop(t, at(c, 3));
  const no = ramp(t, at(c, 3.6), 0.4);
  const good = pop(t, at(c, 4));
  return (
    <g>
      <g transform={`translate(200 820) scale(${start})`}>
        <Figure x={0} y={0} s={1.1} hair="bald" color="#7d8597" t={t} mood="flat" />
        <Tag x={0} y={70} text="д-р Поттер" size={26} color={C.white} />
      </g>
      {q > 0 && (
        <g transform={`translate(500 300) scale(${q})`}>
          <rect x={-150} y={-60} width={300} height={120} rx={30} fill={C.metal} stroke={OL} strokeWidth={5} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.white}>
            металл?
          </text>
        </g>
      )}
      {fork > 0 && (
        <g>
          <Arrow x1={650} y1={300} x2={940} y2={200} k={fork} color={C.inkSoft} />
          <Arrow x1={650} y1={300} x2={940} y2={460} k={fork} color={C.inkSoft} />
          <g opacity={fork}>
            <rect x={960} y={150} width={400} height={100} rx={24} fill="#fdecef" stroke={OL} strokeWidth={4} />
            <text x={1160} y={192} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.ink}>
              плох → опасен
            </text>
            <text x={1160} y={228} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.ink}>
              физически
            </text>
            <rect x={960} y={410} width={400} height={100} rx={24} fill="#fdecef" stroke={OL} strokeWidth={4} />
            <text x={1160} y={452} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.ink}>
              хорош → опасен
            </text>
            <text x={1160} y={488} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.red}>
              социально
            </text>
          </g>
          <Pop t={t} at={at(c, 2.6)} x={1160} y={580}>
            <Tag x={0} y={0} text="любой ответ — «опасен»" size={30} color={C.yellow} />
          </Pop>
        </g>
      )}
      {check > 0 && (
        <g transform={`translate(560 640) rotate(-5) scale(${check})`} opacity={1 - ramp(t, at(c, 4), 0.4) * 0.6}>
          <rect x={-230} y={-80} width={460} height={160} rx={10} fill="#eaf6e8" stroke={OL} strokeWidth={4} />
          <text x={-200} y={-30} fontFamily={FONTS.serif} fontWeight={700} fontSize={28} fill={C.inkSoft}>
            ЧЕК
          </text>
          <text x={-200} y={20} fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill={C.ink}>
            сумма: впишите сами
          </text>
          <Cross x={0} y={0} s={150} k={no} />
        </g>
      )}
      {good > 0 && (
        <g transform={`translate(700 820) scale(${good})`}>
          <rect x={-470} y={-44} width={940} height={88} rx={44} fill={C.metal} stroke={OL} strokeWidth={4} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.white}>
            «риарден-металл очень хорош»
          </text>
        </g>
      )}
    </g>
  );
};

export const Rumor: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const doc = pop(t, 0.2);
  const fog = ramp(t, at(c, 1), 1.5);
  const chart = ramp(t, at(c, 2), 1.4);
  const mowen = pop(t, at(c, 3));
  const vote = pop(t, at(c, 4));
  const phrases = ["есть вероятность…", "нельзя полностью отвергнуть…", "может появиться…"];
  return (
    <g>
      <Doc x={cx - 380} y={420} s={doc * 0.8} title={"Заявление\nинститута"} lines={6} />
      {fog > 0 &&
        phrases.map((p, i) => {
          const k = clamp01(fog * 3 - i);
          const x = cx - 220 + i * 200 + Math.sin(t * 0.6 + i) * 30 + k * 60;
          const y = 260 + i * 120 + Math.cos(t * 0.5 + i) * 14;
          return (
            <g key={i} opacity={k * 0.95}>
              <ellipse cx={x} cy={y} rx={250} ry={56} fill="#dfe4ee" />
              <text x={x} y={y + 11} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.inkSoft} fontStyle="italic">
                {p}
              </text>
            </g>
          );
        })}
      <Pop t={t} at={at(c, 1.5)} x={cx - 380} y={720}>
        <Tag x={0} y={0} text="«дело рук труса»" size={32} color={C.yellow} />
      </Pop>
      {chart > 0 && (
        <g transform={`translate(${cx + 330} 540)`} opacity={chart}>
          <rect x={-200} y={-140} width={400} height={280} rx={20} fill={C.white} stroke={OL} strokeWidth={4} />
          <path d={`M -170 -90 L -90 -60 L -10 -80 ${chart > 0.4 ? "L 60 30" : ""} ${chart > 0.7 ? "L 160 100" : ""}`} stroke={C.red} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text y={-104} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={24} fill={C.inkSoft}>
            акции
          </text>
          {["договор ✗", "профсоюз ✗"].map((s, i) => (
            <Pop key={i} t={t} at={at(c, 2.4 + i * 0.25)} x={0} y={190 + i * 70}>
              <Tag x={0} y={0} text={s} size={28} color="#fdecef" />
            </Pop>
          ))}
        </g>
      )}
      {mowen > 0 && (
        <g transform={`translate(${cx - 120} 810) scale(${mowen})`} opacity={1 - vote * 0.9}>
          <rect x={-420} y={-44} width={840} height={88} rx={44} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.ink}>
            Моуэн: «слишком многие недовольны»
          </text>
        </g>
      )}
      {vote > 0 && (
        <g transform={`translate(${cx - 120} 810) scale(${vote})`}>
          <rect x={-420} y={-44} width={840} height={88} rx={44} fill={C.ink} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.yellow}>
            качество — голосованием?
          </text>
        </g>
      )}
    </g>
  );
};

export const Institute: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = pop(t, 0.2);
  const motto = ramp(t, at(c, 0.4), 0.8);
  const admit = pop(t, at(c, 1));
  const hush = ramp(t, at(c, 1.5), 0.6);
  const money = pop(t, at(c, 3));
  return (
    <g>
      <g transform={`translate(640 560) scale(${k})`}>
        <path d="M -460 -160 L 0 -330 L 460 -160 Z" fill="#f4f2ec" stroke={OL} strokeWidth={6} />
        <rect x={-460} y={-160} width={920} height={40} fill="#e7e2d6" stroke={OL} strokeWidth={5} />
        {[-380, -230, -80, 80, 230, 380].map((x) => (
          <rect key={x} x={x - 30} y={-120} width={60} height={380} fill="#fbfaf6" stroke={OL} strokeWidth={4} />
        ))}
        <rect x={-500} y={260} width={1000} height={40} fill="#e7e2d6" stroke={OL} strokeWidth={5} />
        <g opacity={motto}>
          <text y={-188} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={26} fill={C.ink}>
            БЕССТРАШНОМУ РАЗУМУ · НЕРУШИМОЙ ИСТИНЕ
          </text>
        </g>
      </g>
      {admit > 0 && (
        <g transform={`translate(640 520) scale(${admit})`}>
          <rect x={-300} y={-150} width={600} height={300} rx={20} fill="#2d4a3e" stroke={OL} strokeWidth={6} />
          <text y={-60} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={34} fill="#e8f5ee">
            металл —
          </text>
          <text y={-10} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={34} fill="#e8f5ee">
            «удивительный материал»
          </text>
          <text y={60} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill="#9fd4b8">
            (только наедине)
          </text>
          {hush > 0 && (
            <g opacity={hush} transform="translate(0 110)">
              <rect x={-170} y={-24} width={340} height={48} rx={24} fill={C.red} />
              <text y={11} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={28} fill={C.white}>
                публично — молчит
              </text>
            </g>
          )}
        </g>
      )}
      {money > 0 && (
        <g transform={`translate(640 140) scale(${money})`}>
          <rect x={-470} y={-44} width={940} height={88} rx={44} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.ink}>
            отдел металлургии отстал от частной фирмы
          </text>
        </g>
      )}
      <g opacity={interpolate(t, [0, 1], [0, 1], { extrapolateRight: "clamp", easing: ease })} />
    </g>
  );
};
