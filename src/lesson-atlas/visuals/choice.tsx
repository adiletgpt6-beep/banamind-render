// Блок «Выбор и цена»: Сан-Себастьян, деньги как мера работы, экспресс с
// «пассажирами на крыше», «Линия Джона Голта», добровольцы, прибыль, «Все мы!»,
// первый рейс и мост, разбитый бокал, бегство фирм и обрыв фрагмента.
import React from "react";
import { interpolate } from "remotion";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Bridge, Bubble, Canyon, Coin, Derrick, Figure, Icon, Mountains, OL, Silhouette, Track, Train, WineGlass, zoneX } from "./draw";
import { Check, Cross, Pop, Tag, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

export const SanSebastian: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const kid = pop(t, at(c, 1));
  const why = pop(t, at(c, 1.5));
  const mines = pop(t, at(c, 3));
  const empty = ramp(t, at(c, 3.6), 0.8);
  const loss = ramp(t, at(c, 4), 1.6);
  const train = pop(t, at(c, 5));
  const irony = pop(t, at(c, 6));
  const question = pop(t, at(c, 7));
  return (
    <g>
      {/* детство: «Зачем?» */}
      <g opacity={1 - mines * 0.9}>
        <g transform={`translate(860 820) scale(${kid})`}>
          <Figure x={0} y={0} s={1.1} hair="m" color="#a0522d" hairColor="#1e1a18" t={t} arms={0.4} mood="smile" />
        </g>
        <Bubble x={1060} y={430} w={300} h={110} text="«Зачем?»" size={54} k={why} />
        <Pop t={t} at={at(c, 2)} x={1300} y={260}>
          <Tag x={0} y={0} text="состояние — только приумножить" size={30} color={C.yellow} />
        </Pop>
      </g>
      {mines > 0 && (
        <g opacity={mines}>
          <Mountains y={720} color="#d8b48a" snow={false} seed={2} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${780 + i * 300} 700)`}>
              <Icon name="mine" x={0} y={0} s={1.6} />
              {empty > 0 && (
                <text y={-110} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.red} opacity={empty}>
                  пусто
                </text>
              )}
            </g>
          ))}
          <Tag x={1080} y={250} text="Сан-Себастьян · национализация" size={32} color={C.white} />
          {loss > 0 &&
            Array.from({ length: 10 }).map((_, i) => {
              const k = clamp01(loss * 1.6 - i * 0.06);
              return <Coin key={i} x={700 + i * 70} y={300 + k * 560} r={26} t={t + i} />;
            })}
          {train > 0 && (
            <g transform={`translate(1120 150) scale(${train})`}>
              <rect x={-440} y={-40} width={880} height={80} rx={40} fill={C.ink} />
              <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.yellow}>
                Дагни заранее вывезла ценное с линии
              </text>
            </g>
          )}
        </g>
      )}
      {irony > 0 && (
        <g transform={`translate(1100 420) scale(${irony}) rotate(${wob(t, 3, 1.2)})`} opacity={1 - question * 0.85}>
          <rect x={-470} y={-90} width={940} height={180} rx={30} fill={C.white} stroke={C.violet} strokeWidth={6} />
          <text y={-24} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
            «без эгоизма, без прибыли, ради рабочих…
          </text>
          <text y={28} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.violet}>
            все требования морали нашего времени»
          </text>
        </g>
      )}
      {question > 0 && (
        <g transform={`translate(1100 420) scale(${question})`}>
          <rect x={-420} y={-70} width={840} height={140} rx={30} fill={C.ink} />
          <text y={-8} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.white}>
            «лишь часть правды»
          </text>
          <text y={38} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.yellow}>
            зачем — во фрагменте не сказано
          </text>
        </g>
      )}
    </g>
  );
};

export const Money: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const coin = pop(t, 0.3);
  const fake = pop(t, at(c, 1));
  const cross = ramp(t, at(c, 1.4), 0.5);
  const measure = pop(t, at(c, 2));
  const q = pop(t, at(c, 3));
  return (
    <g>
      <g transform={`translate(420 480) scale(${coin})`}>
        <Coin x={0} y={0} r={150} t={t * 0.4} label="$" />
        <Tag x={0} y={230} text="мера сделанной работы" size={32} color="#c5ebe5" />
      </g>
      {fake > 0 && (
        <g transform={`translate(980 480) scale(${fake})`}>
          <Coin x={0} y={0} r={110} t={t * 0.4 + 1} label="$" color="#c9c3b5" />
          <Cross x={0} y={0} s={200} k={cross} />
          <Tag x={0} y={190} text="«любой жулик»?" size={30} color="#fdecef" />
        </g>
      )}
      {measure > 0 && (
        <g transform={`translate(700 160) scale(${measure})`}>
          <rect x={-480} y={-46} width={960} height={92} rx={46} fill={C.ink} />
          <text y={15} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.yellow}>
            «каждое слово имеет свой смысл»
          </text>
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(700 790) scale(${q})`}>
          <rect x={-470} y={-44} width={940} height={88} rx={44} fill={C.white} stroke={C.violet} strokeWidth={5} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.ink}>
            почему же он выбрасывает миллионы? — открыто
          </text>
        </g>
      )}
    </g>
  );
};

export const Express: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const roll = t * 160;
  const riders = ramp(t, at(c, 1), 1.2);
  const ask = pop(t, at(c, 1.5));
  const answer = pop(t, at(c, 2));
  const phrase = pop(t, at(c, 3));
  const idea = pop(t, at(c, 4));
  return (
    <g>
      <Mountains y={700} color="#c8d3e4" seed={1} />
      <rect x={0} y={700} width={1920} height={380} fill="#dfe6ee" />
      <Track x1={0} x2={1920} y={760} shift={roll} />
      <g transform={`translate(${interpolate(t, [0, c.dur], [-40, 40])} 0)`}>
        <Train x={1180} y={746} s={1.05} cars={4} t={t * 1.5} color={C.metalDeep} label="TT" />
        {Array.from({ length: 11 }).map((_, i) => {
          const k = clamp01(riders * 11 - i);
          if (k <= 0) return null;
          const x = 230 + i * 88;
          return (
            <g key={i} transform={`translate(${x} ${626 - k * 6})`} opacity={k}>
              <Figure x={0} y={0} s={0.5} hair={i % 3 === 0 ? "hat" : i % 3 === 1 ? "f" : "m"} color={["#a678c9", "#8796ab", "#e0a458", "#7a5b4a"][i % 4]} t={t + i} arms={i % 2 ? 0.8 : 0} mood={i % 2 ? "o" : "flat"} />
            </g>
          );
        })}
        <Tag x={1310} y={560} text="создатели тянут" size={28} color="#c5ebe5" />
      </g>
      {ask > 0 && (
        <g transform={`translate(1100 230) scale(${ask})`} opacity={1 - phrase * 0.9}>
          <rect x={-560} y={-60} width={1120} height={120} rx={30} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.ink}>
            Франсиско: «Почему вы соглашаетесь
          </text>
          <text y={36} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.ink}>
            везти их на себе?»
          </text>
        </g>
      )}
      {answer > 0 && phrase <= 0 && (
        <Pop t={t} at={at(c, 2)} x={1100} y={400}>
          <Tag x={0} y={0} text="«правоту называют пороком»" size={32} color={C.yellow} />
        </Pop>
      )}
      {phrase > 0 && (
        <g transform={`translate(1100 230) scale(${phrase})`}>
          <rect x={-560} y={-60} width={1120} height={120} rx={30} fill={C.ink} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.white}>
            «Мы ведём вперёд экспресс,
          </text>
          <text y={36} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.yellow}>
            а они едут на крыше»
          </text>
        </g>
      )}
      {idea > 0 && (
        <g transform={`translate(1100 400) scale(${idea})`}>
          <Tag x={0} y={0} text="тянут мир — и чувствуют вину" size={32} color="#f5d0d6" />
        </g>
      )}
    </g>
  );
};

export const Naming: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const office = pop(t, 0.2);
  const investors = pop(t, at(c, 1));
  const paint = ramp(t, at(c, 2.3), 1.8);
  const flash = ramp(t, at(c, 2.6), 0.2) * (1 - ramp(t, at(c, 3), 0.4));
  const vs = pop(t, at(c, 3));
  const text = "Линия Джона Голта";
  const shown = text.slice(0, Math.round(text.length * paint));
  return (
    <g>
      <g transform={`translate(1150 300) scale(${office})`} opacity={1 - paint * 0.6}>
        <rect x={-300} y={-80} width={600} height={160} rx={20} fill={C.white} stroke={OL} strokeWidth={4} />
        <text y={-14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
          своя компания Дагни
        </text>
        <text y={30} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill={C.inkSoft}>
          (на время — вне «Таггерта»)
        </text>
      </g>
      {investors > 0 && (
        <g opacity={1 - paint * 0.7}>
          {["Уайэтт", "Нильсен", "Хэммонд", "Стоктон", "Данаггер", "Риарден $1 000 000"].map((n, i) => (
            <Pop key={n} t={t} at={at(c, 1) + i * 0.25} x={720 + (i % 3) * 380} y={500 + Math.floor(i / 3) * 100}>
              <Tag x={0} y={0} text={n} size={28} color={i === 5 ? C.yellow : "#c5ebe5"} />
            </Pop>
          ))}
        </g>
      )}
      {/* локомотив с надписью */}
      {paint > 0 && (
        <g>
          <g transform="translate(560 860)">
            <path d="M 0 -20 L 0 -260 Q 0 -300 40 -300 L 1040 -300 Q 1100 -300 1110 -240 L 1120 -20 Z" fill={C.metalDeep} stroke={OL} strokeWidth={8} />
            <text x={560} y={-140} textAnchor="middle" fontFamily={FONTS.display} fontSize={72} fill={C.white}>
              {shown}
            </text>
            {[120, 360, 760, 1000].map((x) => (
              <circle key={x} cx={x} cy={0} r={34} fill={OL} />
            ))}
          </g>
          {flash > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#fff" opacity={flash * 0.5} />}
        </g>
      )}
      {vs > 0 && (
        <g transform={`translate(1110 180) scale(${vs})`}>
          <rect x={-560} y={-56} width={1120} height={112} rx={30} fill={C.ink} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.white}>
            «пусть придёт и попробует отобрать»
          </text>
          <text y={34} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.yellow}>
            Франсиско: «он это сделает»
          </text>
        </g>
      )}
    </g>
  );
};

export const Volunteers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const noise = pop(t, 0.2) * (1 - ramp(t, at(c, 1), 0.4));
  const union = pop(t, at(c, 1)) * (1 - ramp(t, at(c, 2), 0.4));
  const board = pop(t, at(c, 2));
  const hands = ramp(t, at(c, 2.2), 1.6);
  const lot = pop(t, at(c, 3));
  return (
    <g>
      {noise > 0 &&
        ["Ничего у них не выйдет!", "мост рухнет", "«морские свинки»", "петиция"].map((s, i) => (
          <Bubble key={i} x={300 + (i % 2) * 560} y={260 + Math.floor(i / 2) * 220} w={s.length * 20 + 80} h={90} text={s} size={34} k={noise} fill="#fdecef" />
        ))}
      {union > 0 && (
        <g transform={`translate(640 460) scale(${union})`}>
          <rect x={-420} y={-120} width={840} height={240} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-40} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.ink}>
            «Подпишите запрет письменно»
          </text>
          <text y={30} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.inkSoft}>
            делегат профсоюза отступает
          </text>
        </g>
      )}
      {board > 0 && (
        <g>
          <g transform={`translate(640 250) scale(${board})`}>
            <rect x={-360} y={-90} width={720} height={180} rx={14} fill="#fffdf6" stroke={OL} strokeWidth={5} />
            <text y={-20} textAnchor="middle" fontFamily={FONTS.display} fontSize={48} fill={C.ink}>
              НУЖНЫ ДОБРОВОЛЬЦЫ
            </text>
            <text y={40} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
              машинисты на первый рейс
            </text>
          </g>
          {Array.from({ length: 12 }).map((_, i) => {
            const k = clamp01(hands * 12 - i);
            const silent = i === 2 || i === 7 || i === 10;
            const x = 140 + (i % 6) * 200;
            const y = 690 + Math.floor(i / 6) * 170;
            return (
              <g key={i} opacity={silent ? 0.35 : 1}>
                <Figure x={x} y={y} s={0.8} hair="cap" color={["#3e5a86", "#5b6a84", "#4a6b8a"][i % 3]} t={t + i} arms={silent ? 0 : k} mood={silent ? "flat" : "smile"} />
              </g>
            );
          })}
          <Pop t={t} at={at(c, 2.6)} x={640} y={420}>
            <Tag x={0} y={0} text="молчат трое: отпуск, больница, тюрьма" size={26} color={C.yellow} />
          </Pop>
        </g>
      )}
      {lot > 0 && (
        <g transform={`translate(1080 600) scale(${lot})`}>
          <path d="M -90 0 L 90 0 L 70 -110 L -70 -110 Z" fill="#3c3f4e" stroke={OL} strokeWidth={4} />
          <rect x={-120} y={-10} width={240} height={22} rx={10} fill="#3c3f4e" stroke={OL} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-40 + i * 30} y={-150 - Math.abs(Math.sin(t * 3 + i)) * 40} width={24} height={40} rx={4} fill="#fffdf6" stroke={OL} strokeWidth={2} transform={`rotate(${i * 20 - 20})`} />
          ))}
          <Tag x={0} y={80} text="жребий" size={30} color={C.white} />
        </g>
      )}
    </g>
  );
};

export const ProfitChart: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bars = [
    { v: 2, label: "средняя\nдоходность", color: C.steel, b: 1 },
    { v: 4, label: "выше —\n«ростовщичество»", color: C.coral, b: 1.35 },
    { v: 15, label: "план\nДагни", color: C.metal, b: 1.65 },
    { v: 25, label: "Риарден", color: C.metalDeep, b: 1.85 },
  ];
  const base = 760;
  const scale = 19;
  const head = pop(t, 0.2);
  const journo = pop(t, at(c, 2));
  const author = pop(t, at(c, 3));
  return (
    <g>
      <g transform={`translate(1150 170) scale(${head})`} opacity={1 - journo}>
        <rect x={-420} y={-50} width={840} height={100} rx={50} fill={C.ink} />
        <text y={17} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={40} fill={C.yellow}>
          «Я хочу заработать»
        </text>
      </g>
      <line x1={620} y1={base} x2={1720} y2={base} stroke={OL} strokeWidth={5} />
      {bars.map((b, i) => {
        const k = ramp(t, at(c, b.b), 0.8);
        const h = b.v * scale * k;
        const x = 720 + i * 260;
        return (
          <g key={i}>
            <rect x={x - 80} y={base - h} width={160} height={h} rx={12} fill={b.color} stroke={OL} strokeWidth={4} />
            {k > 0.1 && (
              <text x={x} y={base - h - 20} textAnchor="middle" fontFamily={FONTS.display} fontSize={52} fill={C.ink} opacity={k}>
                {`${b.v}%`}
              </text>
            )}
            {b.label.split("\n").map((l, j) => (
              <text key={j} x={x} y={base + 40 + j * 32} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={26} fill={C.inkSoft} opacity={k}>
                {l}
              </text>
            ))}
          </g>
        );
      })}
      {journo > 0 && (
        <g transform={`translate(1150 170) scale(${journo})`} opacity={1 - author}>
          <rect x={-500} y={-56} width={1000} height={112} rx={28} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            служит втрое дольше · стоит вдвое дешевле
          </text>
          <text y={34} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.metalDeep}>
            общество тоже в выигрыше?
          </text>
        </g>
      )}
      {author > 0 && (
        <g transform={`translate(1150 170) scale(${author})`}>
          <rect x={-500} y={-56} width={1000} height={112} rx={28} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            позиция автора: прибыль создателя
          </text>
          <text y={34} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            и польза для всех не противоречат
          </text>
        </g>
      )}
    </g>
  );
};

export const GaltAnswer: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const facts = pop(t, 0.2) * (1 - ramp(t, at(c, 1.9), 0.3));
  const calc = pop(t, at(c, 1)) * (1 - ramp(t, at(c, 2), 0.3));
  const q = pop(t, at(c, 2));
  const a = pop(t, at(c, 2.5));
  const shift = ramp(t, at(c, 3), 1);
  return (
    <g>
      {/* толпа на платформе */}
      {Array.from({ length: 16 }).map((_, i) => (
        <Silhouette key={i} x={80 + i * 80 + (i % 2) * 20} y={1000 - (i % 3) * 30} s={0.7} color={["#5b6a84", "#6b7a94", "#4f5d78"][i % 3]} opacity={0.85} />
      ))}
      {facts > 0 && (
        <g transform={`translate(660 300) scale(${facts})`}>
          {["Шайенн · 22 июля", "80 вагонов", "100 миль в час"].map((s, i) => (
            <Tag key={i} x={(i - 1) * 380} y={0} text={s} size={34} color={i === 2 ? C.yellow : C.white} />
          ))}
        </g>
      )}
      {calc > 0 && (
        <g transform={`translate(660 520) scale(${calc})`}>
          <rect x={-470} y={-90} width={940} height={180} rx={24} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-24} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={34} fill={C.ink}>
            поезд 7 000 т · мост — на 3 000 т
          </text>
          <text y={40} textAnchor="middle" fontFamily={FONTS.display} fontSize={48} fill={C.metalDeep}>
            «Мои расчёты»
          </text>
        </g>
      )}
      {q > 0 && <Bubble x={420} y={330} w={560} h={120} text={"«А кто такой\nДжон Голт?»"} size={42} k={q} />}
      {a > 0 && (
        <g transform={`translate(860 580) scale(${a}) rotate(${wob(t, 4, 2)})`}>
          <rect x={-300} y={-100} width={600} height={200} rx={50} fill={interpolate(shift, [0, 1], [0, 1]) > 0.5 ? C.yellow : C.metal} stroke={OL} strokeWidth={7} />
          <text y={36} textAnchor="middle" fontFamily={FONTS.display} fontSize={110} fill={C.ink}>
            «Все мы!»
          </text>
        </g>
      )}
      {shift > 0 && (
        <g opacity={shift}>
          <g transform="translate(660 160)">
            <rect x={-500} y={-46} width={330} height={92} rx={46} fill="#dfe4ee" />
            <text x={-335} y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.inkSoft}>
              отговорка
            </text>
            <text x={0} y={18} textAnchor="middle" fontFamily={FONTS.display} fontSize={52} fill={C.ink}>
              →
            </text>
            <rect x={170} y={-46} width={330} height={92} rx={46} fill={C.yellow} />
            <text x={335} y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
              гордость
            </text>
          </g>
          <Tag x={660} y={800} text="наша трактовка · кто такой Голт — не раскрыто" size={28} color={C.white} />
        </g>
      )}
    </g>
  );
};

export const FirstRun: React.FC<VisualProps> = (c) => {
  const { t, dur } = c;
  const bridge = ramp(t, at(c, 3), 1);
  const roll = t * 420;
  const guards = 1 - bridge;
  const cheer = pop(t, at(c, 1));
  const code = pop(t, at(c, 2)) * (1 - bridge);
  const trainX = interpolate(t, [at(c, 3), dur], [-200, 1700], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <g>
      {guards > 0 && (
        <g opacity={guards}>
          <Mountains y={640} color="#b9c9de" seed={3} />
          <rect x={0} y={640} width={1920} height={440} fill="#e3dccb" />
          <Track x1={0} x2={1920} y={760} shift={roll} color={C.metal} />
          {Array.from({ length: 5 }).map((_, i) => {
            const x = ((i * 520 - roll * 0.9) % 2600 + 2600) % 2600 - 300;
            return (
              <g key={i}>
                <Figure x={x} y={700} s={0.8} hair="hat" color="#6b5a46" t={t} arms={0.9} mood="smile" />
              </g>
            );
          })}
          <Train x={1080} y={746} s={1} cars={4} t={t * 3} color={C.metalDeep} label="TT" />
          {cheer > 0 &&
            Array.from({ length: 20 }).map((_, i) => {
              const k = (t * 0.6 + i / 20) % 1;
              return <rect key={i} x={(i * 97) % 1900} y={k * 700} width={14} height={8} fill={[C.coral, C.yellow, C.sky, C.green][i % 4]} transform={`rotate(${k * 600 + i * 40} ${(i * 97) % 1900} ${k * 700})`} opacity={cheer * 0.9} />;
            })}
          <Pop t={t} at={at(c, 1.3)} x={1100} y={260}>
            <Tag x={0} y={0} text="«Получилось!»" size={48} color={C.yellow} />
          </Pop>
          {code > 0 && (
            <g transform={`translate(1100 420) scale(${code})`}>
              <rect x={-470} y={-50} width={940} height={100} rx={50} fill={C.ink} />
              <text y={15} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.white}>
                двигатели — «моральный кодекс, воплощённый в стали»
              </text>
            </g>
          )}
        </g>
      )}
      {bridge > 0 && (
        <g opacity={bridge}>
          <rect x={0} y={0} width={1920} height={1080} fill="#d7ecfa" />
          <Canyon y={620} gapA={540} gapB={1500} />
          <Bridge x={520} y={600} w={1000} color={C.metal} />
          <Track x1={0} x2={1920} y={580} color={C.metal} />
          <Train x={trainX} y={566} s={0.9} cars={4} t={t * 3} color={C.metalDeep} label="TT" />
          <Pop t={t} at={at(c, 3.6)} x={1020} y={300}>
            <Tag x={0} y={0} text="«Ну вот, приехали»" size={46} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const Glass: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const plans = pop(t, 0.3);
  const toss = ramp(t, at(c, 1.3), 0.5);
  const shards = ramp(t, at(c, 1.3) + 0.5, 0.8);
  const quote = pop(t, at(c, 1.6));
  return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#36324a" opacity={0.55} />
      {[0, 1, 2, 3].map((i) => (
        <Derrick key={i} x={160 + i * 300} y={880} s={0.8} t={t + i} flame />
      ))}
      <Pop t={t} at={0.3} x={640} y={220}>
        <Tag x={0} y={0} text="Колорадо — «столица Ренессанса»" size={36} color={C.yellow} />
      </Pop>
      {/* стена справа */}
      <rect x={1180} y={140} width={40} height={760} fill="#d8cfbc" stroke={OL} strokeWidth={4} />
      {shards <= 0 ? (
        <WineGlass x={interpolate(toss, [0, 1], [640, 1170])} y={interpolate(toss, [0, 0.5, 1], [620, 480, 520])} s={1.6} tilt={toss * 300} />
      ) : (
        Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const d = shards * 160;
          return <path key={i} d="M 0 -14 L 10 8 L -10 8 Z" fill="#eaf4fb" stroke={OL} strokeWidth={2} transform={`translate(${1160 - Math.abs(Math.cos(a)) * d} ${520 + Math.sin(a) * d + shards * shards * 200}) rotate(${i * 50 + shards * 300})`} opacity={1 - shards * 0.5} />;
        })
      )}
      {quote > 0 && (
        <g transform={`translate(640 420) scale(${quote})`}>
          <rect x={-480} y={-60} width={960} height={120} rx={30} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            «Постараемся думать, что это
          </text>
          <text y={32} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={30} fill={C.ink}>
            всерьёз и надолго»
          </text>
        </g>
      )}
      <Pop t={t} at={at(c, 2)} x={640} y={760}>
        <Tag x={0} y={0} text="почему — фрагмент не объясняет" size={32} color="#f5d0d6" />
      </Pop>
      <g opacity={plans * 0} />
    </g>
  );
};

export const Migration: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const map = pop(t, 0.2);
  const go = ramp(t, at(c, 1), 3.2);
  const mowen = pop(t, at(c, 2));
  const worker = pop(t, at(c, 3));
  const share = pop(t, at(c, 4));
  const end = ramp(t, at(c, 4.6), 0.8);
  const cx = zoneX(c.p.host);
  const A = { x: cx + 420, y: 330 };
  const B = { x: cx - 300, y: 470 };
  return (
    <g>
      <g transform={`translate(${cx} 470) scale(${map})`}>
        <path d="M -620 -230 L 560 -260 L 640 -120 L 600 160 L 380 250 L -200 260 L -560 200 L -640 0 Z" fill="#eef0e6" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {map > 0.5 && (
        <g>
          <circle cx={A.x} cy={A.y} r={14} fill={C.coral} stroke={OL} strokeWidth={3} />
          <Tag x={A.x} y={A.y - 50} text="Коннектикут" size={28} color={C.white} />
          <circle cx={B.x} cy={B.y} r={14} fill={C.metal} stroke={OL} strokeWidth={3} />
          <Tag x={B.x} y={B.y + 56} text="Колорадо" size={28} color="#c5ebe5" />
          <path d={`M ${A.x} ${A.y} Q ${(A.x + B.x) / 2} ${A.y - 160} ${B.x} ${B.y}`} stroke={C.steelDark} strokeWidth={6} fill="none" strokeDasharray="14 12" />
          {[0, 1, 2].map((i) => {
            const k = clamp01(go * 1.3 - i * 0.15);
            const x = A.x + (B.x - A.x) * k;
            const y = A.y + (B.y - A.y) * k - Math.sin(k * Math.PI) * 160;
            return k > 0 && k < 1 ? (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x={-50} y={-30} width={100} height={46} rx={6} fill="#8a9bb3" stroke={OL} strokeWidth={3} />
                <path d="M -40 -30 L -20 -60 L 30 -60 L 40 -30" fill="#6d7d95" stroke={OL} strokeWidth={3} />
                <circle cx={-30} cy={22} r={9} fill={OL} />
                <circle cx={30} cy={22} r={9} fill={OL} />
              </g>
            ) : null;
          })}
          <Pop t={t} at={at(c, 1.4)} x={A.x} y={A.y + 90}>
            <Tag x={0} y={0} text="«всё дело в законе»" size={28} color={C.yellow} />
          </Pop>
        </g>
      )}
      {mowen > 0 && <Bubble x={cx + 320} y={760} w={600} h={110} text={"Моуэн: «там даже правительство\nтолком ничего не делает»"} size={28} k={mowen * (1 - worker * 0.8)} />}
      {worker > 0 && <Bubble x={cx + 320} y={760} w={640} h={110} text={"«может, это у вас здесь есть то,\nчего нет там»"} size={28} k={worker * (1 - share * 0.9)} fill="#c5ebe5" />}
      {share > 0 && <Bubble x={cx + 320} y={760} w={600} h={110} text={"«Мне тоже положена\nмоя доля этого металла»"} size={30} k={share} fill="#fdecef" />}
      {end > 0 && (
        <g opacity={end}>
          <rect x={cx - 520} y={110} width={1040} height={100} rx={20} fill="#fffdf6" stroke={C.red} strokeWidth={6} />
          <text x={cx} y={176} textAnchor="middle" fontFamily={FONTS.serif} fontWeight={700} fontSize={40} fill={C.red}>
            Конец ознакомительного фрагмента
          </text>
        </g>
      )}
    </g>
  );
};

export { Check };
