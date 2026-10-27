// Жизнь и память, поиск собеседников, ответственность за Землю, три вывода.
// Пришельцы не рисуются; оценки формулы Дрейка подписаны как догадки; без
// военных сцен и насилия. Библиотека и следы — условные рисунки фильма.
import React from "react";
import { C } from "../theme";
import { Arrow, Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Dish, Earth, MiniWindow, Note, Stage, StarField, Twinkle } from "./space";

// ── b01: «скачок» оказался молью ──
export const MothMistake: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const claim = pop(t, at(c, 1) + 0.4);
  const moth = ramp(t, at(c, 2) + 0.8, 1);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={320} y={300}>
        <g>
          <rect x={-60} y={-110} width={120} height={220} rx={30} fill="#d8ecff" opacity={0.35} stroke={C.sky} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${-20 + i * 20} ${-30 + i * 40})`}>
              <ellipse rx={10} ry={6} fill="#5a3b1c" />
              <ellipse cx={-6} cy={-6} rx={8} ry={4} fill="#fff" opacity={0.6} />
            </g>
          ))}
          <Txt x={0} y={160} size={26} color={C.dim}>
            плодовые мушки
          </Txt>
        </g>
      </Pop>
      {/* странное насекомое */}
      <g transform="translate(820 330)">
        <g transform={`scale(${1 + moth * 0.1})`}>
          <ellipse rx={30} ry={14} fill="#6a5a44" />
          <path d="M -10 -6 Q -90 -90 -110 -10 Q -60 10 -10 6 Z" fill={moth > 0.5 ? "#b9a782" : "#8a7a60"} />
          <path d="M 10 -6 Q 90 -90 110 -10 Q 60 10 10 6 Z" fill={moth > 0.5 ? "#b9a782" : "#8a7a60"} />
        </g>
      </g>
      {claim > 0 && moth < 0.5 && (
        <g transform={`translate(820 500) scale(${claim})`}>
          <Tag x={0} y={0} text="эволюционный скачок?!" color={C.coral} size={34} />
        </g>
      )}
      {moth > 0 && (
        <g opacity={moth}>
          <Tag x={820} y={500} text="обычная моль" color={C.green} size={36} />
          <Panel x={420} y={620} w={800} h={130} r={28} />
          <Txt x={820} y={675} size={28}>
            наблюдение верное · объяснение поспешное
          </Txt>
          <Txt x={820} y={720} size={28} color={C.yellow}>
            проверка — один вопрос
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── b02: искра в колбе и пересмотр ──
export const SparkFlask: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const brown = ramp(t, at(c, 0) + 3, 2);
  const notes = pop(t, at(c, 1) + 0.6);
  const rev = ramp(t, at(c, 2) + 0.4, 1);
  const spark = Math.floor(t * 4) % 3 === 0 && brown < 1;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 460)">
        <circle r={190} fill={`rgba(150,100,50,${0.12 + brown * 0.4})`} stroke={C.sky} strokeWidth={6} />
        <rect x={-30} y={-290} width={60} height={110} fill="none" stroke={C.sky} strokeWidth={6} />
        <line x1={-110} y1={-40} x2={-30} y2={-40} stroke={C.steel} strokeWidth={8} />
        <line x1={110} y1={-40} x2={30} y2={-40} stroke={C.steel} strokeWidth={8} />
        {spark && <path d="M -30 -40 L -10 -60 L 0 -30 L 15 -55 L 30 -40" fill="none" stroke={C.yellow} strokeWidth={5} />}
        <Txt x={0} y={260} size={26} color={C.dim}>
          газы + электрическая искра
        </Txt>
      </g>
      {notes > 0 && (
        <g transform={`translate(950 300) scale(${notes})`}>
          <Panel x={-260} y={-80} w={520} h={160} r={28} />
          <Txt x={0} y={-12} size={30}>
            блоки белков — получены
          </Txt>
          <Txt x={0} y={38} size={30} color={C.yellow}>
            «ноты, но не музыка»
          </Txt>
        </g>
      )}
      {rev > 0 && (
        <g opacity={rev}>
          <Panel x={700} y={480} w={500} h={240} r={28} stroke={C.blue} />
          <Txt x={950} y={530} size={26} color={C.dim}>
            примечание переводчика:
          </Txt>
          <Txt x={950} y={575} size={28}>
            ранняя атмосфера — иная
          </Txt>
          <Txt x={950} y={620} size={28}>
            органики меньше
          </Txt>
          <Txt x={950} y={665} size={28} color={C.sky}>
            изучают источники и космос
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── b03: три библиотеки ──
export const ThreeLibraries: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const libs = [
    { label: "гены", sub: "инструкции в каждой клетке", color: C.green, beat: 0 },
    { label: "мозг", sub: "порождает и проверяет идеи", color: C.violet, beat: 1 },
    { label: "книги", sub: "голоса через тысячи лет", color: C.amber, beat: 2 },
  ];
  const health = pop(t, at(c, 3) + 0.4);
  return (
    <Stage host={c.p.host}>
      {libs.map((l, i) => {
        const k = pop(t, at(c, l.beat) + 0.3);
        if (k <= 0) return null;
        const x = 220 + i * 420;
        return (
          <g key={l.label} transform={`translate(${x} 380) scale(${k})`}>
            <rect x={-150} y={-170} width={300} height={300} rx={26} fill={C.glass} stroke={l.color} strokeWidth={4} />
            {i === 0 && (
              <g>
                {Array.from({ length: 10 }).map((_, j) => (
                  <g key={j}>
                    <circle cx={Math.sin(j * 0.7 + t) * 50} cy={-120 + j * 22} r={7} fill={C.green} />
                    <circle cx={-Math.sin(j * 0.7 + t) * 50} cy={-120 + j * 22} r={7} fill={C.sky} />
                  </g>
                ))}
              </g>
            )}
            {i === 1 && <ellipse cy={-30} rx={100} ry={80} fill={C.violet} opacity={0.6} />}
            {i === 2 &&
              [0, 1, 2, 3, 4].map((j) => <rect key={j} x={-100 + j * 42} y={-110 - (j % 2) * 14} width={34} height={150 + (j % 2) * 14} rx={4} fill={[C.amber, C.coral, C.sky, C.green, C.violet][j]} />)}
            <Txt x={0} y={180} size={40} color={l.color}>
              {l.label}
            </Txt>
            <Txt x={0} y={224} size={24} color={C.dim}>
              {l.sub}
            </Txt>
          </g>
        );
      })}
      {[0, 1].map((i) => (
        <Arrow key={i} x1={380 + i * 420} y1={380} x2={450 + i * 420} y2={380} k={ramp(t, at(c, i + 1), 0.6)} color={C.faint} w={6} />
      ))}
      {health > 0 && (
        <g transform={`translate(640 760) scale(${health})`}>
          <Tag x={0} y={0} text="здоровье цивилизации — по её библиотекам" color={C.yellow} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── c01: хочется — не значит доказано ──
export const WishVsProof: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const scale = ramp(t, at(c, 1) + 0.6, 1.2);
  const tilt = 14 * scale;
  return (
    <Stage host={c.p.host}>
      <StarField x={40} y={130} w={1200} h={300} n={40} seed={77} o={0.7} />
      <g transform="translate(640 560)">
        <rect x={-8} y={-10} width={16} height={230} fill={C.brass} />
        <g transform={`rotate(${tilt})`}>
          <rect x={-420} y={-14} width={840} height={16} rx={8} fill={C.brass} />
          <g transform="translate(-340 0)">
            <path d="M -110 0 L 110 0 L 80 70 L -80 70 Z" fill={C.glass} stroke={C.coral} strokeWidth={4} />
            <Txt x={0} y={50} size={30} color={C.coral}>
              желание
            </Txt>
          </g>
          <g transform="translate(340 0)">
            <path d="M -110 0 L 110 0 L 80 70 L -80 70 Z" fill={C.glass} stroke={C.green} strokeWidth={4} />
            <Txt x={0} y={50} size={30} color={C.green}>
              проверка
            </Txt>
          </g>
        </g>
      </g>
      <Pop t={t} at={at(c, 1) + 2} x={640} y={330}>
        <Tag x={0} y={0} text="1980: надёжных свидетельств нет" color={C.yellow} size={34} />
      </Pop>
    </Stage>
  );
};

// картуш с условными знаками
const Cartouche: React.FC<{ x: number; y: number; signs: string[]; hl: number[]; k: number; name: string }> = ({ x, y, signs, hl, k, name }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-80} y={-260} width={160} height={520} rx={80} fill="#e9dcb8" stroke="#7d6230" strokeWidth={6} />
    {signs.map((s, i) => (
      <g key={i} transform={`translate(0 ${-200 + i * 70})`}>
        <rect x={-34} y={-28} width={68} height={56} rx={10} fill={hl.includes(i) ? C.yellow : "transparent"} opacity={hl.includes(i) ? k * 0.85 : 0} />
        <Txt x={0} y={14} size={34} color="#3a2a10">
          {s}
        </Txt>
      </g>
    ))}
    <Txt x={0} y={310} size={28}>
      {name}
    </Txt>
  </g>
);

// ── c02: Шампольон: проверка на втором имени ──
export const Champollion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const second = pop(t, at(c, 1) + 1.2);
  const match = ramp(t, at(c, 1) + 3, 1);
  const mix = pop(t, at(c, 2) + 0.4);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={300} y={460}>
        <Cartouche x={0} y={0} signs={["П", "Т", "О", "Л", "М", "И", "С"]} hl={[0, 3]} k={match} name="Птолемей" />
      </Pop>
      {second > 0 && (
        <g opacity={clamp01(second)}>
          <Cartouche x={640} y={460} signs={["К", "Л", "Е", "О", "П", "А", "Т"]} hl={[1, 4, 5]} k={match} name="Клеопатра" />
        </g>
      )}
      {match > 0 && (
        <g opacity={match}>
          <Check x={1000} y={300} s={60} k={match} />
          <Txt x={1040} y={420} size={30}>
            «п», «л», «а»
          </Txt>
          <Txt x={1040} y={465} size={30}>
            совпали
          </Txt>
        </g>
      )}
      {mix > 0 && (
        <g transform={`translate(1040 620) scale(${mix})`}>
          <Tag x={0} y={0} text="звуки + знаки-понятия" color={C.yellow} size={28} />
        </g>
      )}
      <Note x={640} y={860} text="буквы вместо иероглифов — условная схема" />
    </Stage>
  );
};

// ── c03: формула Дрейка — воронка фильтров ──
export const DrakeFunnel: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const filters = ["звёзды", "планеты", "жизнь", "разум", "технологии", "срок жизни цивилизации"];
  const guess = ramp(t, at(c, 1) + 0.4, 0.8);
  const ends = pop(t, at(c, 2) + 1.6);
  return (
    <Stage host={c.p.host}>
      {filters.map((f, i) => {
        const k = pop(t, at(c, 0) + 1 + i * 0.4);
        if (k <= 0) return null;
        const w = 720 - i * 90;
        const y = 180 + i * 92;
        const unsure = i >= 2;
        return (
          <g key={f} transform={`translate(420 ${y}) scale(${k})`}>
            <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill={unsure ? `rgba(255,131,211,${0.12 + guess * 0.2})` : "rgba(79,220,148,0.2)"} stroke={unsure ? C.pink : C.green} strokeWidth={3} strokeDasharray={unsure && guess > 0 ? "10 8" : "0"} />
            <Txt x={0} y={11} size={i === 5 ? 26 : 30} color={i === 5 ? C.yellow : C.text}>
              {f}
            </Txt>
          </g>
        );
      })}
      {guess > 0 && (
        <g opacity={guess}>
          <Txt x={1010} y={230} size={28} color={C.green}>
            известно неплохо
          </Txt>
          <Txt x={1010} y={450} size={28} color={C.pink}>
            «немногим больше,
          </Txt>
          <Txt x={1010} y={490} size={28} color={C.pink}>
            чем догадки»
          </Txt>
        </g>
      )}
      {ends > 0 && (
        <g transform={`translate(640 780) scale(${ends})`}>
          <Panel x={-520} y={-60} w={1040} h={120} r={30} stroke={C.yellow} />
          <Txt x={0} y={-6} size={30}>
            около десяти — или миллионы
          </Txt>
          <Txt x={0} y={36} size={26} color={C.yellow}>
            оценки 1980 года, не найденные соседи
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c04: тишина как данные ──
export const Silence: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const hist = pop(t, at(c, 1) + 0.4);
  const honest = pop(t, at(c, 2) + 0.4);
  const pts: string[] = [];
  for (let x = 0; x <= 700; x += 8) pts.push(`${x},${Math.sin(x * 0.37 + t * 2) * 6 + Math.sin(x * 0.11) * 4}`);
  return (
    <Stage host={c.p.host}>
      <Dish x={230} y={480} s={1.5} />
      <g transform="translate(470 300)">
        <rect x={-10} y={-70} width={720} height={140} rx={20} fill={C.glass} stroke={C.glassLine} strokeWidth={2} />
        <polyline points={pts.join(" ")} fill="none" stroke={C.cyan} strokeWidth={4} />
        <Txt x={350} y={110} size={26} color={C.dim}>
          шум — сигнала нет
        </Txt>
      </g>
      {hist > 0 && (
        <g transform={`translate(830 540) scale(${hist})`}>
          <Panel x={-330} y={-70} w={660} h={140} r={28} stroke={C.blue} />
          <Txt x={0} y={-10} size={28}>
            1981: финансирование прекращено
          </Txt>
          <Txt x={0} y={36} size={28}>
            большой проект — сигналов нет
          </Txt>
        </g>
      )}
      {honest > 0 && (
        <g transform={`translate(640 760) scale(${honest})`}>
          <Tag x={0} y={0} text="«ничего не найдено» ≠ «никого нет»" color={C.yellow} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── e01: Земля издалека: кто говорит от её имени ──
export const EarthFromAfar: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const z = ramp(t, 0.3, 3);
  const q = pop(t, at(c, 1) + 2.6);
  return (
    <Stage host={c.p.host}>
      <StarField x={40} y={130} w={1200} h={740} n={60} seed={41} o={0.7} />
      <g transform={`translate(640 440) scale(${1.4 - z * 0.9})`}>
        <Earth x={0} y={0} r={200} spin={t * 0.02} />
        {z < 0.6 && [0, 1, 2].map((i) => <path key={i} d={`M ${-120 + i * 90} -160 L ${-100 + i * 90} 160`} stroke="#fff" strokeWidth={4} strokeDasharray="10 12" opacity={0.6 * (1 - z)} />)}
      </g>
      <Pop t={t} at={at(c, 0) + 1.2} x={640} y={170}>
        <Tag x={0} y={0} text="срок жизни цивилизации — и наш" color={C.coral} size={32} />
      </Pop>
      {q > 0 && (
        <g transform={`translate(640 780) scale(${q})`}>
          <Tag x={0} y={0} text="кто говорит от имени Земли?" color={C.yellow} size={38} />
        </g>
      )}
    </Stage>
  );
};

// ── e02: два правила науки ──
export const TwoRules: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const rules = [
    { n: "1", text: "всё можно проверять;", sub: "авторитет — не довод" },
    { n: "2", text: "противоречит фактам —", sub: "пересмотри" },
  ];
  const back = ramp(t, at(c, 2), 1);
  const icons = ["тени", "8′", "«Викинг»", "нейтрино"];
  return (
    <Stage host={c.p.host}>
      {rules.map((r, i) => {
        const k = pop(t, at(c, 1) + 0.3 + i * 1.6);
        if (k <= 0) return null;
        return (
          <g key={r.n} transform={`translate(640 ${260 + i * 200}) scale(${k})`}>
            <Panel x={-520} y={-75} w={1040} h={150} r={30} stroke={i ? C.amber : C.green} />
            <circle cx={-440} cy={0} r={44} fill={i ? C.amber : C.green} />
            <Txt x={-440} y={16} size={48} color={C.night}>
              {r.n}
            </Txt>
            <Txt x={-370} y={-8} size={38} anchor="start">
              {r.text}
            </Txt>
            <Txt x={-370} y={42} size={34} anchor="start" color={i ? C.amber : C.green}>
              {r.sub}
            </Txt>
          </g>
        );
      })}
      {icons.map((ic, i) => (
        <g key={ic} opacity={clamp01(back * 4 - i)}>
          <Tag x={250 + i * 260} y={720} text={ic} color={C.sky} size={30} />
        </g>
      ))}
    </Stage>
  );
};

// ── e03: Александрийская библиотека: знание, которое не стало общим ──
export const Library: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const few = ramp(t, at(c, 1) + 0.6, 1);
  const fade = ramp(t, at(c, 2) + 0.4, 1.4);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 470)" opacity={1 - fade * 0.55}>
        <path d="M -300 -160 L 0 -260 L 300 -160 Z" fill={C.brass} />
        <rect x={-300} y={-160} width={600} height={30} fill={C.brassDark} />
        {[-240, -120, 0, 120, 240].map((x) => (
          <rect key={x} x={x - 22} y={-130} width={44} height={300} fill="#e7dcc2" />
        ))}
        <rect x={-320} y={170} width={640} height={30} fill={C.brassDark} />
        {[-180, -60, 60, 180].map((x) => (
          <g key={x} transform={`translate(${x} 20)`}>
            {[0, 1, 2].map((j) => (
              <rect key={j} x={-30 + j * 20} y={-40} width={14} height={80} rx={4} fill={[C.amber, C.coral, C.sky][j]} opacity={0.8} />
            ))}
          </g>
        ))}
      </g>
      <Pop t={t} at={at(c, 0) + 1} x={1000} y={240}>
        <Tag x={0} y={0} text="первый научный институт" color={C.amber} size={30} />
      </Pop>
      {few > 0 && (
        <g opacity={few}>
          <Panel x={760} y={340} w={480} h={180} r={28} />
          <Txt x={1000} y={400} size={28}>
            знание — для немногих
          </Txt>
          <Txt x={1000} y={450} size={28}>
            вопрос о рабстве
          </Txt>
          <Txt x={1000} y={495} size={28}>
            не задавали
          </Txt>
        </g>
      )}
      {fade > 0 && (
        <g opacity={fade}>
          <Tag x={1000} y={640} text="защищать было почти некому" color={C.yellow} size={30} />
        </g>
      )}
      <Note x={400} y={820} text="условный рисунок, не реконструкция здания" />
    </Stage>
  );
};

// ── e04: два следа и маленькая Земля ──
export const Responsibility: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const moon = pop(t, at(c, 0) + 2);
  const earth = ramp(t, at(c, 1), 1.6);
  const Foot: React.FC<{ x: number; y: number; r: number; color: string }> = ({ x, y, r, color }) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <ellipse rx={22} ry={40} fill={color} />
      {[-14, -5, 4, 12].map((dx, i) => (
        <circle key={i} cx={dx} cy={-48 + Math.abs(dx) * 0.3} r={6} fill={color} />
      ))}
    </g>
  );
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.4} x={250} y={330}>
        <g>
          <rect x={-180} y={-130} width={360} height={260} rx={24} fill="#8a6a46" />
          <Foot x={-60} y={20} r={-8} color="#5a4026" />
          <Foot x={50} y={-30} r={6} color="#5a4026" />
          <Txt x={0} y={180} size={26}>
            следы предков
          </Txt>
        </g>
      </Pop>
      {moon > 0 && (
        <g transform={`translate(750 330) scale(${moon})`}>
          <rect x={-180} y={-130} width={360} height={260} rx={24} fill="#9a9a96" />
          <rect x={-40} y={-50} width={80} height={110} rx={20} fill="#6f6f6a" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={-40} y={-44 + i * 26} width={80} height={10} fill="#808079" />
          ))}
          <Txt x={0} y={180} size={26}>
            след на Луне
          </Txt>
        </g>
      )}
      {earth > 0 && (
        <g opacity={earth} transform="translate(1100 330)">
          <Earth x={0} y={0} r={36 + earth * 40} spin={t * 0.02} />
        </g>
      )}
      <Pop t={t} at={at(c, 1) + 2.4} x={640} y={720}>
        <Tag x={0} y={0} text="мы отвечаем за Землю" color={C.yellow} size={44} />
      </Pop>
      <Note x={500} y={820} text="условные рисунки" />
    </Stage>
  );
};

// ── z01–z03: три вывода ──
export const Conclusion: React.FC<VisualProps<{ n: number; host: unknown }>> = (c) => {
  const { t } = c;
  const n = c.p.n;
  const items = [
    { title: "Масштаб требует осторожности", color: C.sky },
    { title: "Знание растёт через проверку и пересмотр", color: C.green },
    { title: "Далёкое помогает ценить свой мир", color: C.amber },
  ];
  return (
    <Stage host={c.p.host}>
      <MiniWindow x={640} y={300} s={0.75} active={n - 1}>
        {n === 3 ? <Earth x={0} y={-20} r={70} spin={t * 0.02} /> : <Twinkle x={0} y={-40} s={1} />}
      </MiniWindow>
      {items.map((it, i) => {
        if (i >= n) return null;
        const k = i === n - 1 ? pop(t, 0.8) : 1;
        return (
          <g key={it.title} transform={`translate(640 ${520 + i * 100}) scale(${k})`} opacity={i === n - 1 ? 1 : 0.55}>
            <Panel x={-520} y={-42} w={1040} h={84} r={42} stroke={it.color} />
            <circle cx={-470} cy={0} r={26} fill={it.color} />
            <Txt x={-470} y={10} size={28} color={C.night}>
              {String(i + 1)}
            </Txt>
            <Txt x={-420} y={12} size={34} anchor="start">
              {it.title}
            </Txt>
          </g>
        );
      })}
    </Stage>
  );
};

// ── z04: финал канала ──
export const Outro: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={190}>
        <g>
          <Txt x={0} y={0} size={100} color={C.yellow}>
            BanaMind
          </Txt>
          <Txt x={0} y={66} size={36} color={C.text}>
            Большие идеи. Простыми словами.
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={1.2} x={180} y={420}>
        <Earth x={0} y={0} r={60} spin={t * 0.02} />
      </Pop>
    </Stage>
  );
};
