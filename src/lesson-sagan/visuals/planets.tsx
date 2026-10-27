// Венера и Марс: ожидание, ошибка, приборная проверка. Болота Венеры как цепочка
// догадок, приборы один за другим, парниковый эффект, «каналы» только как
// подписанный рисунок наблюдателя, проверка «Маринером-9», разрешение снимка,
// три опыта «Викинга» и вопрос без ответа. Марсианская жизнь не рисуется.
import React from "react";
import { C } from "../theme";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";
import { Earth, Note, Planet, Stage, Star } from "./space";

// ── p01: цепочка догадок: ничего не видно → … → динозавры ──
export const VenusSwamp: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const chain = ["ничего не видно", "облака", "вода", "болота", "динозавры?"];
  const strike = ramp(t, at(c, 2) + 0.6, 0.8);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.3} x={230} y={460}>
        <Planet x={0} y={0} r={170} color={C.venus} bands="#fff4d6" shade={0.35} label="Венера" />
      </Pop>
      {chain.map((w, i) => {
        const k = pop(t, at(c, 1) + i * 0.6);
        if (k <= 0) return null;
        const y = 200 + i * 125;
        return (
          <g key={w} transform={`translate(840 ${y}) scale(${k})`}>
            <Panel x={-210} y={-44} w={420} h={88} r={44} stroke={i === 4 ? C.coral : C.glassLine} />
            <Txt x={0} y={14} size={36} color={i === 4 ? C.coral : C.text}>
              {w}
            </Txt>
            {i < 4 && <Arrow x1={0} y1={48} x2={0} y2={78} k={1} w={5} color={C.faint} />}
          </g>
        );
      })}
      {strike > 0 && (
        <g opacity={strike}>
          <line x1={600} y1={700} x2={1080} y2={160} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
          <Tag x={840} y={820} text="ожидания вместо наблюдений" color={C.yellow} size={34} />
        </g>
      )}
    </Stage>
  );
};

// ── p02: прибор за прибором ──
export const VenusInstruments: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const steps = [
    { tool: "спектр", res: "пара нет", color: C.sky, beat: 0 },
    { tool: "радиотелескоп", res: "очень горячо", color: C.amber, beat: 1 },
    { tool: "аппараты «Венера»", res: "≈ 480 °C · ≈ 90 атм", color: C.orange, beat: 2 },
  ];
  const air = pop(t, at(c, 2) + 3);
  return (
    <Stage host={c.p.host}>
      <Planet x={170} y={470} r={130} color={C.venus} bands="#fff4d6" shade={0.4} />
      {steps.map((s, i) => {
        const k = pop(t, at(c, s.beat) + 0.4);
        if (k <= 0) return null;
        const y = 230 + i * 170;
        return (
          <g key={s.tool} transform={`translate(0 ${y})`} opacity={clamp01(k)}>
            <Arrow x1={320} y1={0} x2={480} y2={0} k={k} color={s.color} w={6} />
            <g transform={`translate(760 0) scale(${k})`}>
              <Panel x={-260} y={-60} w={520} h={120} r={28} stroke={s.color} />
              <Txt x={0} y={-10} size={32} color={s.color}>
                {s.tool}
              </Txt>
              <Txt x={0} y={36} size={36}>
                {s.res}
              </Txt>
            </g>
          </g>
        );
      })}
      {air > 0 && (
        <g transform={`translate(760 760) scale(${air})`}>
          <Tag x={0} y={0} text="CO₂ и облака серной кислоты" color={C.yellow} size={32} />
        </g>
      )}
      <Pop t={t} at={at(c, 0) + 2.2} x={760} y={140}>
        <Note x={0} y={0} text="болота, нефть и «газировка» отпали" />
      </Pop>
    </Stage>
  );
};

// ── p03: парниковый эффект ──
export const Greenhouse: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const sun = ramp(t, 0.3, 1.2);
  const ir = ramp(t, at(c, 0) + 2, 1.4);
  const earth = pop(t, at(c, 1) + 0.3);
  const warn = pop(t, at(c, 2) + 0.5);
  return (
    <Stage host={c.p.host}>
      {/* поверхность и слой газа */}
      <rect x={60} y={640} width={720} height={40} rx={12} fill={C.orange} opacity={0.75} />
      <rect x={60} y={300} width={720} height={70} rx={20} fill={C.violet} opacity={0.25} />
      <Txt x={420} y={348} size={28} color={C.violet}>
        углекислый газ
      </Txt>
      <Star x={150} y={180} r={50} color={C.amber} />
      <Arrow x1={200} y1={220} x2={380} y2={630} k={sun} color={C.yellow} w={7} />
      <Txt x={260} y={480} size={26} color={C.yellow} anchor="end" opacity={sun}>
        свет
      </Txt>
      {[0, 1, 2].map((i) => {
        const x = 480 + i * 100;
        const k = clamp01(ir * 1.4 - i * 0.2);
        return (
          <g key={i} opacity={k}>
            <path d={`M ${x} 630 q 20 -40 0 -80 q -20 -40 0 -80 q 20 -30 0 -60`} fill="none" stroke={C.red} strokeWidth={6} strokeLinecap="round" />
            <Arrow x1={x} y1={390} x2={x + 10} y2={560} k={k} color={C.coral} w={5} />
          </g>
        );
      })}
      <Txt x={580} y={720} size={26} color={C.coral} opacity={ir}>
        тепло задерживается
      </Txt>
      {earth > 0 && (
        <g transform={`translate(1060 300) scale(${earth})`}>
          <Earth x={0} y={0} r={90} />
          <Txt x={0} y={150} size={28}>
            на Земле CO₂
          </Txt>
          <Txt x={0} y={190} size={28}>
            связан в породах
          </Txt>
        </g>
      )}
      {warn > 0 && (
        <g transform={`translate(1060 700) scale(${warn})`}>
          <Tag x={0} y={0} text="баланс — не мелочь" color={C.yellow} size={34} />
        </g>
      )}
      <Note x={420} y={850} text="упрощённая схема" />
    </Stage>
  );
};

// ── p04: «каналы» — только рисунок наблюдателя ──
export const MarsCanals: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lines = ramp(t, at(c, 0) + 0.8, 2);
  const net = ramp(t, at(c, 1) + 0.4, 1.4);
  const doubt = ramp(t, at(c, 2) + 0.3, 0.8);
  const L = [
    [-120, -60, 90, 40],
    [-60, -130, 40, 120],
    [-140, 50, 120, -70],
    [10, -140, 130, 20],
    [-130, 120, 20, -20],
    [-30, 60, 140, 110],
  ];
  return (
    <Stage host={c.p.host}>
      <g transform="translate(400 460)">
        <Planet x={0} y={0} r={200} color={C.mars} shade={0.4} />
        <ellipse cx={0} cy={-175} rx={70} ry={22} fill="#fff" opacity={0.85} />
        {L.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * clamp01(i < 3 ? lines * 1.5 : net * 1.5 - (i - 3) * 0.3)} y2={y1 + (y2 - y1) * clamp01(i < 3 ? lines * 1.5 : net * 1.5 - (i - 3) * 0.3)} stroke="#4a1d0e" strokeWidth={5} strokeLinecap="round" opacity={0.85 * (1 - doubt * 0.6)} />
        ))}
      </g>
      <Pop t={t} at={at(c, 0) + 1} x={980} y={260}>
        <Tag x={0} y={0} text="canali = «русла»" color={C.amber} size={36} />
      </Pop>
      <Pop t={t} at={at(c, 1) + 0.8} x={980} y={400}>
        <Tag x={0} y={0} text="«каналы»? строители?" color={C.coral} size={34} />
      </Pop>
      {doubt > 0 && (
        <g opacity={doubt}>
          <Panel x={760} y={510} w={440} h={130} r={26} />
          <Txt x={980} y={565} size={30}>
            другие наблюдатели:
          </Txt>
          <Txt x={980} y={610} size={30} color={C.yellow}>
            каналов не видно
          </Txt>
        </g>
      )}
      <Note x={400} y={720} text="линии — рисунок наблюдателя XIX века, не реальная карта" />
    </Stage>
  );
};

// ── p05: проверка снимками с орбиты ──
export const CanalsCheck: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const scan = ramp(t, at(c, 0) + 0.6, 2.2);
  const res = ramp(t, at(c, 1), 0.8);
  const q = pop(t, at(c, 2) + 0.3);
  return (
    <Stage host={c.p.host}>
      {/* слева — рисунок, справа — «снимок» (схема рельефа) */}
      <Panel x={40} y={160} w={560} h={480} r={24} fill="#3a1c12" stroke={C.brass} />
      <Txt x={320} y={215} size={30} color={C.amber}>
        рисунок
      </Txt>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={100 + i * 30} y1={280 + i * 70} x2={540 - i * 40} y2={330 + i * 60} stroke="#ffcf9e" strokeWidth={4} opacity={0.8} />
      ))}
      <Panel x={680} y={160} w={560} h={480} r={24} fill="#4a2414" stroke={C.sky} />
      <Txt x={960} y={215} size={30} color={C.sky}>
        снимок с орбиты
      </Txt>
      <g opacity={scan}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={740 + ((i * 97) % 440)} cy={280 + ((i * 61) % 320)} r={14 + (i % 3) * 10} fill="none" stroke="#c98a5e" strokeWidth={4} />
        ))}
        <path d="M 720 560 q 120 -40 240 10 q 120 40 240 -20" fill="none" stroke="#e8b38a" strokeWidth={10} opacity={0.5} />
        <Txt x={960} y={600} size={24} color={C.dim}>
          полосы пыли
        </Txt>
      </g>
      <rect x={680} y={160 + scan * 460} width={560} height={6} fill={C.sky} opacity={scan < 1 ? 0.8 : 0} />
      {res > 0 && (
        <g opacity={res}>
          <Cross x={320} y={420} s={120} k={res} />
          <Tag x={640} y={720} text="совпадений нет" color={C.yellow} size={38} />
        </g>
      )}
      {q > 0 && (
        <g transform={`translate(640 820) scale(${q})`}>
          <Note x={0} y={0} text="снимок — условная схема рельефа" />
        </g>
      )}
    </Stage>
  );
};

// ── p06: найдите жизнь на Земле — разрешение снимка ──
export const Resolution: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lvl = t < at(c, 1) + 1 ? 0 : t < at(c, 1) + 3.2 ? 1 : 2;
  const labels = ["≈ 1 км: следов жизни почти нет", "≈ 100 м: поля и дороги", "≈ 1 м: животные и люди"];
  const S = [64, 16, 4][lvl];
  const tiles: React.ReactNode[] = [];
  for (let y = 0; y < 480; y += S)
    for (let x = 0; x < 640; x += S) {
      const fieldsHue = Math.floor(x / 80 + y / 80) % 2 ? "#5d8f3a" : "#7aa84a";
      const color = lvl === 0 ? ((x * 7 + y * 3) % 128 < 64 ? "#5f8a46" : "#6c9550") : fieldsHue;
      tiles.push(<rect key={`${x}-${y}`} x={x} y={y} width={S} height={S} fill={color} />);
    }
  return (
    <Stage host={c.p.host}>
      <g transform="translate(320 170)">
        <rect x={-6} y={-6} width={652} height={492} rx={12} fill={C.brass} />
        {tiles}
        {lvl >= 1 && <line x1={0} y1={240} x2={640} y2={240} stroke="#cfc6b0" strokeWidth={10} />}
        {lvl >= 1 && <line x1={320} y1={0} x2={320} y2={480} stroke="#cfc6b0" strokeWidth={10} />}
        {lvl === 2 && (
          <g>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${120 + i * 70} ${120 + i * 20})`}>
                <ellipse rx={22} ry={12} fill="#f4f0e6" />
                <circle cx={22} cy={-6} r={8} fill="#f4f0e6" />
              </g>
            ))}
            <circle cx={470} cy={350} r={10} fill="#ffcc99" />
            <rect x={462} y={360} width={16} height={30} rx={6} fill={C.blue} />
          </g>
        )}
      </g>
      <Pop t={t} at={at(c, 1)} x={640} y={740}>
        <Tag x={0} y={0} text={labels[lvl]} color={C.yellow} size={34} />
      </Pop>
      <Note x={640} y={840} text="условная схема, не снимок" />
    </Stage>
  );
};

// ── p07: «Викинг»: три опыта ──
export const VikingTests: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const yes = ramp(t, at(c, 1) + 0.4, 0.6);
  const org = pop(t, at(c, 2) + 0.2);
  const clay = pop(t, at(c, 2) + 2.5);
  const verdict = pop(t, at(c, 3) + 0.3);
  return (
    <Stage host={c.p.host}>
      <Planet x={160} y={720} r={260} color={C.mars} shade={0.3} />
      {/* посадочный модуль — простая собственная схема */}
      <g transform="translate(250 430)">
        <rect x={-70} y={-40} width={140} height={60} rx={10} fill={C.steel} />
        <line x1={-60} y1={20} x2={-90} y2={70} stroke={C.steel} strokeWidth={8} />
        <line x1={60} y1={20} x2={90} y2={70} stroke={C.steel} strokeWidth={8} />
        <line x1={70} y1={-10} x2={150} y2={40} stroke={C.dim} strokeWidth={6} />
        <circle cx={-30} cy={-60} r={18} fill={C.dim} />
      </g>
      {[0, 1, 2].map((i) => {
        const k = pop(t, at(c, 0) + 0.8 + i * 0.4);
        if (k <= 0) return null;
        return (
          <g key={i} transform={`translate(${620 + i * 200} 260) scale(${k})`}>
            <rect x={-70} y={-80} width={140} height={160} rx={20} fill={C.glass} stroke={C.glassLine} strokeWidth={2} />
            <Txt x={0} y={-30} size={26} color={C.dim}>
              {`опыт ${i + 1}`}
            </Txt>
            {i < 2 ? <Check x={0} y={30} s={50} k={yes} /> : <Txt x={0} y={44} size={50} color={C.dim}>—</Txt>}
          </g>
        );
      })}
      {org > 0 && (
        <g transform={`translate(820 470) scale(${org})`}>
          <Tag x={0} y={0} text="органики в грунте нет" color={C.coral} size={34} />
        </g>
      )}
      {clay > 0 && (
        <g transform={`translate(820 560) scale(${clay})`}>
          <Tag x={0} y={0} text="глины дают те же эффекты" color={C.amber} size={32} />
        </g>
      )}
      {verdict > 0 && (
        <g transform={`translate(820 700) scale(${verdict})`}>
          <Panel x={-300} y={-60} w={600} h={120} r={30} stroke={C.yellow} />
          <Txt x={0} y={14} size={34} color={C.yellow}>
            доказательств жизни нет
          </Txt>
        </g>
      )}
      <Note x={640} y={860} text="схема аппарата и опытов, не снимок миссии" />
    </Stage>
  );
};

// ── p08: вопрос без ответа: отсутствие тоже нужно объяснить ──
export const MarsQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const ethic = pop(t, at(c, 1) + 0.3);
  return (
    <Stage host={c.p.host}>
      <Planet x={420} y={460} r={220} color={C.mars} shade={0.4} />
      <Txt x={420} y={500} size={160} color="#fff" opacity={0.85}>
        ?
      </Txt>
      <Pop t={t} at={at(c, 0) + 0.5} x={980} y={300}>
        <g>
          <Panel x={-250} y={-70} w={500} h={140} r={28} />
          <Txt x={0} y={-8} size={32}>
            «нет жизни» —
          </Txt>
          <Txt x={0} y={40} size={32} color={C.yellow}>
            тоже нужно объяснить
          </Txt>
        </g>
      </Pop>
      {ethic > 0 && (
        <g transform={`translate(980 520) scale(${ethic})`}>
          <Panel x={-250} y={-70} w={500} h={140} r={28} stroke={C.green} />
          <Txt x={0} y={-8} size={30}>
            если там есть жизнь,
          </Txt>
          <Txt x={0} y={40} size={30} color={C.green}>
            Марс принадлежит ей
          </Txt>
        </g>
      )}
    </Stage>
  );
};
