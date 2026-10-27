// «Макинтош»: визит в Xerox, украли или улучшили, команда Mac, красота внутри,
// поле искажения реальности (обе стороны), Лиза, опционы, пираты, запуск.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { Board, Coin, Compact, Heart, Note, OL, Person, Stage, Windows } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, ramp, wob, type VisualProps } from "./kit";

// ── m01: лаборатория Xerox: окошки, папки, мышь ──
export const XeroxVisit: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const deal = ramp(t, at(c, 1), 0.8);
  const scr = ramp(t, at(c, 2), 1.4);
  const veil = ramp(t, at(c, 2.6), 0.8);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(0 0)">
        <rect x={60} y={150} width={460} height={300} rx={20} fill={C.white} stroke={OL} strokeWidth={4} />
        <Txt x={290} y={220} size={38} weight={900}>
          {"Лаборатория Xerox"}
        </Txt>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={100 + i * 130} y={260} width={110} height={150} rx={8} fill={[C.sky, C.green, C.violet][i]} opacity={0.4} />
        ))}
      </g>
      {deal > 0 && (
        <g opacity={deal * (1 - veil)}>
          <Coin x={290} y={560} r={60} label="1М$" />
          <Arrow x1={360} y1={560} x2={520} y2={560} k={deal} color={C.greenDeep} />
          <Txt x={290} y={680} size={28} color={C.inkSoft}>
            {"инвестиция за показ"}
          </Txt>
        </g>
      )}
      <g transform="translate(900 470)">
        <rect x={-320} y={-260} width={640} height={460} rx={24} fill={C.concrete} stroke={OL} strokeWidth={5} />
        <Windows x={-290} y={-230} w={580} h={380} k={scr} t={t} />
        {/* мышь */}
        <g transform={`translate(${200 + Math.sin(t * 1.3) * 30} 300)`} opacity={scr}>
          <rect x={-40} y={-50} width={80} height={110} rx={30} fill={C.beige} stroke={OL} strokeWidth={4} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-34 + i * 24} y={-44} width={20} height={34} rx={6} fill={C.beigeDark} />
          ))}
          <path d="M 0 -50 Q 10 -90 -40 -110" stroke={OL} strokeWidth={4} fill="none" />
        </g>
      </g>
      {veil > 0 && (
        <g opacity={veil}>
          <Person x={260} y={860} s={0.5} color={C.ink} name="Джобс" t={t} gesture="cheer" />
          <Note x={290} y={470} text={"«пелена с глаз»"} k={veil} color={C.yellow} size={30} rot={-4} />
        </g>
      )}
    </Stage>
  );
};

// ── m02: мышь за 300$ → за 15$; окна, меню; богатый сосед ──
export const MouseUpgrade: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const old = ramp(t, at(c, 1), 0.6);
  const neu = ramp(t, at(c, 1.6), 0.8);
  const ui = ramp(t, at(c, 2), 1.2);
  const neighbor = ramp(t, at(c, 3), 0.8);
  const fin = ramp(t, at(c, 4), 0.6);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={640} y={150}>
        <Tag x={0} y={0} text={fin > 0.5 ? "идея + воплощение" : "украли или улучшили?"} color={fin > 0.5 ? C.green : C.yellow} size={40} />
      </Pop>
      {old > 0 && (
        <g opacity={old} transform="translate(220 380)">
          <rect x={-70} y={-90} width={140} height={190} rx={40} fill={C.beigeDark} stroke={OL} strokeWidth={5} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={-60 + i * 42} y={-80} width={36} height={60} rx={10} fill={C.beige} stroke={OL} strokeWidth={2} />
          ))}
          <Txt x={0} y={150} size={40} weight={900} color={C.red}>
            300$
          </Txt>
        </g>
      )}
      {neu > 0 && (
        <g>
          <Arrow x1={320} y1={380} x2={500} y2={380} k={neu} color={C.green} />
          <g opacity={neu} transform="translate(600 380)">
            <rect x={-60} y={-80} width={120} height={170} rx={50} fill={C.beige} stroke={OL} strokeWidth={5} />
            <rect x={-50} y={-70} width={100} height={50} rx={16} fill={C.beigeDark} />
            <Txt x={0} y={150} size={40} weight={900} color={C.greenDeep}>
              ≈15$
            </Txt>
          </g>
        </g>
      )}
      {ui > 0 && (
        <g opacity={ui} transform="translate(800 230)">
          <rect x={0} y={0} width={420} height={300} rx={14} fill={C.white} stroke={OL} strokeWidth={4} />
          <rect x={0} y={0} width={420} height={34} rx={14} fill={C.concrete} />
          {["Файл", "Правка", "Вид"].map((m, i) => (
            <text key={m} x={20 + i * 110} y={24} fontFamily={FONT} fontWeight={800} fontSize={20} fill={OL}>
              {m}
            </text>
          ))}
          <rect x={20} y={34} width={140} height={110 * ui} fill={C.white} stroke={OL} strokeWidth={2} />
          <rect x={150} y={80} width={200} height={130} rx={6} fill="#eef6ff" stroke={OL} strokeWidth={3} />
          <rect x={200 + Math.sin(t) * 20} y={140} width={200} height={130} rx={6} fill="#fff4e0" stroke={OL} strokeWidth={3} />
          <Txt x={210} y={340} size={24} color={C.inkSoft}>
            {"перекрывающиеся окна — Аткинсон"}
          </Txt>
        </g>
      )}
      {neighbor > 0 && (
        <g opacity={neighbor * (1 - fin * 0.4)} transform="translate(640 700)">
          <Panel x={-460} y={-90} w={920} h={170} fill="#f4f1ff" />
          <Person x={-330} y={80} s={0.4} color={C.ink} t={t} name="Apple" />
          <Person x={330} y={80} s={0.4} color={C.skyDeep} t={t} name="Microsoft" seed={2} flip />
          <g transform="translate(0 -10)">
            <rect x={-110} y={-50} width={220} height={100} rx={12} fill={C.white} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={12} size={30} weight={900}>
              {"сосед Xerox"}
            </Txt>
          </g>
          <Arrow x1={-250} y1={10} x2={-130} y2={0} k={neighbor} />
          <Arrow x1={250} y1={10} x2={130} y2={0} k={neighbor} />
        </g>
      )}
    </Stage>
  );
};

// ── m03: чья это машина: Раскин → команда ──
export const MacTeam: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const raskin = ramp(t, 0.2, 0.6);
  const leave = ramp(t, at(c, 1.4), 1);
  const team = ramp(t, at(c, 2), 1.5);
  const flag = ramp(t, at(c, 3), 0.8);
  const names = [
    { n: "Смит", w: "плата", col: C.sky },
    { n: "Аткинсон", w: "графика", col: C.green },
    { n: "Херцфельд", w: "система", col: C.violet },
    { n: "Каре", w: "шрифты", col: C.coral },
  ];
  return (
    <Stage host={c.p.host}>
      <g opacity={raskin * (1 - leave * 0.7)} transform={`translate(${-leave * 120} 0)`}>
        <Person x={220} y={820} s={0.55} color={C.woodLight} name="Раскин" t={t} gesture={leave > 0.5 ? "sad" : "stand"} />
        <Note x={240} y={430} text={"простой\nнедорогой\nкомпьютер"} k={raskin} size={28} rot={-3} />
      </g>
      <Compact x={680} y={560} s={0.9} t={t} k={team} />
      {names.map((p, i) => {
        const k = clamp01(team * 4 - i);
        const x = 520 + (i % 2) * 520 - 90;
        const y = i < 2 ? 820 : 470;
        return (
          <g key={p.n} opacity={k}>
            <Person x={x + (i % 2 ? 140 : -40)} y={y} s={0.36} color={p.col} name={p.n} t={t} seed={i + 2} />
            <Txt x={x + (i % 2 ? 140 : -40)} y={y - 200} size={24} color={C.inkSoft}>
              {p.w}
            </Txt>
          </g>
        );
      })}
      {flag > 0 && (
        <g transform={`translate(1180 ${130 + (1 - flag) * 40}) scale(0.7)`} opacity={flag}>
          <line x1={0} y1={0} x2={0} y2={200} stroke={OL} strokeWidth={8} />
          <path d={`M 0 0 Q 70 ${wob(t * 2, 1, 10)} 140 10 L 140 100 Q 70 ${100 + wob(t * 2, 2, 10)} 0 90 Z`} fill={OL} />
          <circle cx={70} cy={46} r={18} fill={C.white} />
          <path d="M 52 70 L 88 70" stroke={C.white} strokeWidth={6} />
        </g>
      )}
    </Stage>
  );
};

// ── m04: красота внутри корпуса: плата, скруглённые углы, подписи ──
export const MacDesign: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const inside = ramp(t, 0.3, 1);
  const walk = ramp(t, at(c, 1), 1.6);
  const sign = ramp(t, at(c, 2), 1.6);
  return (
    <Stage host={c.p.host}>
      <g opacity={(1 - walk * 0.7) * (1 - sign * 0.8)} transform={`translate(${-walk * 60} 0)`}>
        <Compact x={300} y={720} s={1.05} t={t} face={false} />
        <g opacity={inside} transform="translate(300 480)">
          <rect x={-120} y={-80} width={240} height={160} rx={10} fill="none" stroke={C.yellow} strokeWidth={4} strokeDasharray="10 8" />
          <Board x={0} y={0} s={0.6} t={t} glow={1} />
        </g>
      </g>
      {walk > 0 && (
        <g opacity={walk * (1 - sign * 0.85)} transform="translate(860 400)">
          {[
            [-230, -140, 160, 100],
            [-30, -170, 240, 120],
            [-250, 20, 220, 130],
            [20, 10, 180, 160],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx={28} fill={[C.sky, C.coral, C.green, C.yellow][i]} opacity={clamp01(walk * 4 - i)} stroke={OL} strokeWidth={4} />
          ))}
          <Txt x={0} y={240} size={30} color={C.inkSoft}>
            {"скруглённые прямоугольники — повсюду"}
          </Txt>
        </g>
      )}
      {sign > 0 && (
        <g opacity={sign} transform="translate(640 600)">
          <rect x={-420} y={-120} width={840} height={240} rx={18} fill={C.beigeDark} stroke={OL} strokeWidth={4} />
          {Array.from({ length: 45 }).map((_, i) => {
            const k = clamp01(sign * 45 - i);
            const x = -380 + (i % 15) * 54;
            const y = -70 + Math.floor(i / 15) * 60;
            return <path key={i} d={`M ${x} ${y} q 10 -14 20 0 t 20 0`} stroke={OL} strokeWidth={3} fill="none" opacity={k} />;
          })}
          <Txt x={0} y={170} size={32} weight={900} color={C.ink}>
            {"45 подписей внутри корпуса"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── m05: поле искажения реальности ──
export const DistortionField: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const f = ramp(t, 0.3, 1.2);
  const def = ramp(t, at(c, 1), 1.6);
  const two = ramp(t, at(c, 2), 0.8);
  const words = ["обаяние", "красноречие", "воля", "подгонка фактов"];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 470)">
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} rx={(140 + i * 70) * f} ry={(100 + i * 50) * f} fill="none" stroke={C.neon} strokeWidth={6 - i} opacity={0.5 - i * 0.08} transform={`rotate(${t * 10 * (i % 2 ? 1 : -1)})`} />
        ))}
        <Person x={0} y={110} s={0.5} color={C.ink} name="Джобс" t={t} />
        {/* календарь, который гнётся в поле */}
        <g transform={`translate(330 -160) skewX(${Math.sin(t * 1.5) * 14 * f})`}>
          <rect x={-90} y={-70} width={180} height={150} rx={10} fill={C.white} stroke={OL} strokeWidth={3} />
          <rect x={-90} y={-70} width={180} height={40} rx={10} fill={C.red} />
          <Txt x={0} y={50} size={56} weight={900}>
            {"срок"}
          </Txt>
        </g>
      </g>
      {words.map((w, i) => {
        const k = clamp01(def * 4 - i);
        return (
          <g key={w} opacity={k} transform={`translate(${i % 2 ? 1110 : 170} ${230 + Math.floor(i / 2) * 470})`}>
            <Tag x={0} y={0} text={w} color={i === 3 ? C.coral : C.white} size={30} />
          </g>
        );
      })}
      {two > 0 && (
        <g opacity={two}>
          <Tag x={430} y={820} text="предупреждение" color={C.coral} size={32} />
          <Tag x={850} y={820} text="комплимент" color={C.green} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── m06: светлая сторона: 10 секунд × миллионы людей ──
export const BootTime: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const imp = ramp(t, 0.3, 0.8);
  const calc = ramp(t, at(c, 1), 2);
  const done = ramp(t, at(c, 2), 1);
  const bar = done > 0 ? 0.3 + 0.7 * done : clamp01((t % 6) / 6);
  return (
    <Stage host={c.p.host}>
      <g opacity={imp}>
        <Tag x={640} y={170} text="«мы не знали, что это невозможно»" color={C.white} size={32} />
      </g>
      <g transform="translate(330 470)">
        <Compact x={0} y={200} s={0.9} t={t} face={false} />
        <rect x={-80} y={-60} width={160} height={16} rx={8} fill={C.concrete} />
        <rect x={-80} y={-60} width={160 * bar} height={16} rx={8} fill={done > 0 ? C.green : C.yellowDeep} />
      </g>
      {calc > 0 && (
        <g opacity={calc} transform="translate(900 430)">
          <Panel x={-320} y={-200} w={640} h={400} fill={C.ink} />
          <Txt x={0} y={-110} size={44} color={C.white} weight={900} opacity={clamp01(calc * 3)}>
            {"10 секунд"}
          </Txt>
          <Txt x={0} y={-40} size={40} color={C.screenGlow} weight={900} opacity={clamp01(calc * 3 - 1)}>
            {"× миллионы людей"}
          </Txt>
          <Txt x={0} y={30} size={40} color={C.yellow} weight={900} opacity={clamp01(calc * 3 - 2)}>
            {"× каждый день"}
          </Txt>
          <Txt x={0} y={120} size={38} color={C.coral} weight={900} opacity={clamp01(calc * 3 - 2.4)}>
            {"= человеческие жизни"}
          </Txt>
        </g>
      )}
      {done > 0 && (
        <Pop t={t} at={at(c, 2.2)} x={330} y={820}>
          <Tag x={0} y={0} text="−28 секунд" color={C.green} size={40} textColor={C.white} />
        </Pop>
      )}
    </Stage>
  );
};

// ── m07: чёрно-белый мир: гений/бездарь, шедевр/мусор ──
export const BinaryWorld: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const split = ramp(t, 0.3, 0.8);
  const idea = ramp(t, at(c, 1), 1.6);
  const burn = ramp(t, at(c, 2), 1.2);
  const flip = Math.sin(t * 2.4) > 0;
  return (
    <Stage host={c.p.host}>
      <g opacity={split * (1 - burn * 0.75)}>
        <rect x={80} y={140} width={560} height={440} rx={26} fill={C.white} stroke={OL} strokeWidth={4} />
        <rect x={640} y={140} width={560} height={440} rx={26} fill={C.ink} />
        <Txt x={360} y={220} size={44} weight={900}>
          {"«гений»"}
        </Txt>
        <Txt x={920} y={220} size={44} weight={900} color={C.white}>
          {"«бездарь»"}
        </Txt>
        <Person x={flip ? 360 : 920} y={530} s={0.42} color={C.sky} t={t} gesture={flip ? "cheer" : "sad"} />
        <Txt x={640} y={620} size={28} color={C.inkSoft}>
          {"середины нет"}
        </Txt>
      </g>
      {idea > 0 && (
        <g opacity={idea * (1 - burn * 0.6)} transform="translate(640 720)">
          <Note x={-260} y={0} text={"«глупость»"} k={clamp01(idea * 2)} rot={-3} color="#ffd9d4" size={30} />
          <Arrow x1={-120} y1={0} x2={100} y2={0} k={clamp01(idea * 2 - 0.6)} />
          <Note x={260} y={0} text={"«моя идея!»"} k={clamp01(idea * 2 - 1)} rot={3} color="#dff5e6" size={30} />
          <Txt x={0} y={-60} size={24} color={C.inkSoft}>
            {"через неделю"}
          </Txt>
        </g>
      )}
      {burn > 0 && (
        <g opacity={burn} transform="translate(640 380)">
          <Panel x={-330} y={-80} w={660} h={160} fill="#fff1ee" />
          <Txt x={0} y={-10} size={36} weight={900} color={C.red}>
            {"«нет оправдания»"}
          </Txt>
          <Txt x={0} y={44} size={26} color={C.inkSoft}>
            {"сорванные сроки · выгорание"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── m08: Лиза: отрицание, тест, позднее признание ──
export const LisaStory: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const baby = ramp(t, 0.3, 0.8);
  const test = ramp(t, at(c, 1), 1);
  const late = ramp(t, at(c, 2), 1);
  return (
    <Stage host={c.p.host}>
      <g opacity={baby}>
        <Person x={250} y={820} s={0.5} color={C.violet} name="Крисэнн" t={t} gesture="hold" />
        <Heart x={330} y={560} s={0.5} color={C.neonPink} />
        <Txt x={330} y={500} size={28} color={C.inkSoft}>
          {"дочь Лиза"}
        </Txt>
      </g>
      <g transform="translate(760 330)">
        <rect x={-200} y={-140} width={400} height={260} rx={22} fill={C.white} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={-80} size={30} weight={900}>
          {"анализ"}
        </Txt>
        <rect x={-150} y={-30} width={300} height={34} rx={17} fill={C.concrete} />
        <rect x={-150} y={-30} width={300 * 0.944 * test} height={34} rx={17} fill={C.violet} />
        <Txt x={0} y={70} size={46} weight={900} color={C.violet} opacity={test}>
          {"> 94 %"}
        </Txt>
      </g>
      {late > 0 && (
        <g opacity={late}>
          <Compact x={1080} y={760} s={0.55} t={t} face={false} />
          <Txt x={1080} y={540} size={30} weight={900}>
            {"компьютер «Lisa»"}
          </Txt>
          <Note x={640} y={700} text={"годы спустя:\n«повёл бы себя лучше»"} k={late} color="#eef6ff" size={28} rot={-2} />
        </g>
      )}
    </Stage>
  );
};

// ── m09: биржа, опционы и дружба ──
export const IpoShares: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const up = ramp(t, 0.2, 2);
  const lost = ramp(t, at(c, 1), 0.8);
  const woz = ramp(t, at(c, 2), 1.2);
  const pts = Array.from({ length: 12 }).map((_, i) => [120 + i * 90, 560 - Math.pow(i / 11, 2) * 380 * up + Math.sin(i * 2) * 14]);
  return (
    <Stage host={c.p.host}>
      <path opacity={1 - lost * 0.75} d={`M ${pts.map((p) => p.join(" ")).join(" L ")}`} stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Pop t={t} at={0.6} x={1050} y={170}>
        <Tag x={0} y={0} text="1980 · выход на биржу" color={C.yellow} size={34} />
      </Pop>
      {lost > 0 && (
        <g opacity={lost}>
          <Person x={330} y={840} s={0.42} color={C.green} name="Коттке" t={t} gesture="sad" />
          <Cross x={330} y={600} s={70} k={lost} />
          <Txt x={330} y={540} size={26} color={C.inkSoft}>
            {"без акций"}
          </Txt>
        </g>
      )}
      {woz > 0 && (
        <g opacity={woz}>
          <Person x={900} y={840} s={0.42} color={C.sky} name="Возняк" t={t} gesture="arms" />
          {Array.from({ length: 6 }).map((_, i) => {
            const k = clamp01(woz * 6 - i);
            return <Coin key={i} x={900 + (i - 2.5) * 70 * k} y={620 - Math.sin(k * Math.PI) * 60} r={26} />;
          })}
          <Txt x={900} y={540} size={26} color={C.inkSoft}>
            {"делится с коллегами"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── m10: пиратский флаг и тайный дисковод ──
export const PirateFlag: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const mottos = ramp(t, 0.2, 2);
  const order = ramp(t, at(c, 1), 0.8);
  const secret = ramp(t, at(c, 1.5), 0.8);
  const saved = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(200 150)">
        <line x1={0} y1={0} x2={0} y2={300} stroke={OL} strokeWidth={10} />
        <path d={`M 0 0 Q 90 ${wob(t * 2, 1, 14)} 180 14 L 180 130 Q 90 ${130 + wob(t * 2, 2, 14)} 0 116 Z`} fill={OL} />
        <circle cx={90} cy={60} r={24} fill={C.white} />
        <path d="M 66 92 L 114 92" stroke={C.white} strokeWidth={8} />
      </g>
      {["путешествие — награда", "доводи до конца", "лучше быть пиратом"].map((m, i) => (
        <Tag key={m} x={680} y={170 + i * 80} text={m} color={[C.yellow, C.white, C.coral][i]} size={30} />
      )).map((el, i) => (
        <g key={i} opacity={clamp01(mottos * 3 - i) * (1 - saved * 0.9)}>
          {el}
        </g>
      ))}
      {order > 0 && (
        <g opacity={order} transform="translate(0 0)">
          <Person x={280} y={850} s={0.42} color={C.ink} name="Джобс" t={t} gesture="point" />
          <Arrow x1={380} y1={650} x2={560} y2={650} k={order} color={C.red} />
          <g transform="translate(660 650)">
            <rect x={-90} y={-60} width={180} height={120} rx={12} fill="#ffe7e3" stroke={OL} strokeWidth={3} />
            <Txt x={0} y={10} size={28} weight={900}>
              {"фирма А"}
            </Txt>
          </g>
        </g>
      )}
      {secret > 0 && (
        <g opacity={secret}>
          <Person x={1030} y={850} s={0.42} color={C.sky} name="Беллвилл" t={t} seed={3} flip />
          <g transform="translate(1030 560)">
            <rect x={-90} y={-60} width={180} height={120} rx={12} fill="#e3f7ea" stroke={OL} strokeWidth={3} strokeDasharray="10 8" />
            <Txt x={0} y={10} size={28} weight={900}>
              {"фирма Б"}
            </Txt>
            <rect x={-26} y={-26} width={52} height={52} rx={4} fill={C.steelDark} opacity={0.4} transform="translate(120 -40)" />
          </g>
        </g>
      )}
      {saved > 0 && (
        <g opacity={saved}>
          <Cross x={660} y={650} s={80} k={saved} />
          <Check x={1030} y={420} s={50} k={saved} />
          <Tag x={1030} y={330} text="спасибо за непослушание" color={C.green} size={26} textColor={C.white} />
        </g>
      )}
    </Stage>
  );
};

// ── m11: «Привет, я Макинтош» ──
export const MacLaunch: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const night = 1 - ramp(t, at(c, 1), 0.8);
  const out = ramp(t, at(c, 1.2), 1.2);
  const hi = ramp(t, at(c, 1.7), 0.6);
  const clap = ramp(t, at(c, 2), 0.6);
  return (
    <Stage host={c.p.host}>
      {night > 0 && (
        <g opacity={night}>
          <circle cx={1100} cy={220} r={60} fill={C.yellow} opacity={0.6} />
          <circle cx={1125} cy={205} r={52} fill={C.cream} />
          {[0, 1, 2].map((i) => (
            <Person key={i} x={300 + i * 260} y={760} s={0.4} color={[C.sky, C.green, C.violet][i]} t={t} seed={i} gesture="hold" />
          ))}
        </g>
      )}
      {out > 0 && (
        <g opacity={out}>
          <rect x={80} y={760} width={1120} height={80} rx={20} fill="#2a3146" />
          <g transform={`translate(640 ${760 - 80 * out})`}>
            <rect x={-150} y={-30} width={300} height={90} rx={20} fill={C.woodDark} opacity={1 - out} />
            <Compact x={0} y={0} s={0.85 * out} t={t} face={hi > 0} k={hi} />
          </g>
          {hi > 0 && (
            <g opacity={hi} transform="translate(940 320)">
              <path d="M -170 -60 Q -170 -100 -130 -100 L 170 -100 Q 210 -100 210 -60 L 210 30 Q 210 70 170 70 L -60 70 L -110 120 L -100 70 L -130 70 Q -170 70 -170 30 Z" fill={C.white} stroke={OL} strokeWidth={4} />
              <Txt x={20} y={-10} size={38} weight={900}>
                {"Привет!"}
              </Txt>
            </g>
          )}
        </g>
      )}
      {clap > 0 &&
        Array.from({ length: 16 }).map((_, i) => {
          const x = 80 + i * 74;
          const y = 900 - Math.abs(Math.sin(t * 6 + i)) * 20;
          return <circle key={i} cx={x} cy={y} r={20} fill={[C.sky, C.coral, C.green, C.violet][i % 4]} opacity={clap * 0.85} />;
        })}
      <g opacity={interpolate(clap, [0, 1], [0, 1])}>
        <Tag x={640} y={170} text="овация" color={C.yellow} size={36} />
      </g>
    </Stage>
  );
};
