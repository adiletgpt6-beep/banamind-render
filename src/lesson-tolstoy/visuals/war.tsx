// 1812: миллиарды причин и яблоко, «вот и всё геройство?», шахматы против
// чувства, план против поля, батарея-«семья», трава под гранатой, дождь,
// Фили, пустая Москва, уходящий город, подводы, деревянный город, Мытищи, дверь.
import React from "react";
import { C, HERO } from "../theme";
import { Big, BigArrow, Candle, Chip, DotNet, Flame, Hero, House, Label, Note, PaperMap, Person, QuoteCard, Smoke, Stage, rnd } from "./draw";
import { Cross, at, pop, ramp, type VisualProps } from "./kit";

// ── b01: Неман, миллионы причин, яблоко ──
export const ManyCauses: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const net = ramp(t, at(c, 1), 2);
  const apple = ramp(t, at(c, 2) + 1.5, 1.2);
  return (
    <Stage host={c.p.host}>
      <PaperMap x={60} y={150} w={700} h={680} seed={3}>
        <Chip x={350} y={50} text="12 ИЮНЯ 1812 · НЕМАН" />
        <BigArrow x1={60} y1={500} x2={600} y2={430} k={ramp(t, 0.4, 1.2)} w={30} color={C.french} />
      </PaperMap>
      <DotNet x={100} y={220} w={620} h={560} n={110} seed={21} k={net} align={net * 0.7} dir={-0.1} r={6} />
      {/* яблоко на ветке — и падает */}
      <g transform="translate(1000 0)">
        <path d="M -160 250 Q 0 200 160 260" stroke="#6b4a2f" strokeWidth={16} fill="none" />
        <g transform={`translate(0 ${280 + apple * 420})`} opacity={ramp(t, at(c, 2), 0.5)}>
          <circle r={46} fill={C.red} />
          <rect x={-4} y={-62} width={8} height={20} fill="#6b4a2f" />
          <path d="M 4 -54 Q 30 -70 40 -50 Q 20 -46 4 -54 Z" fill={C.green} />
        </g>
        <Label x={0} y={180} text="отчего оно падает?" color={C.paper} size={28} k={pop(t, at(c, 2) + 0.8)} />
      </g>
      <Label x={410} y={812} text="«Царь — есть раб истории»" color={C.coral} size={30} k={pop(t, at(c, 2) + 0.2)} />
    </Stage>
  );
};

// ── b07: Островна — награда без чувства подвига ──
export const HeroQuestion: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const q = ramp(t, at(c, 1), 0.8);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="ОСТРОВНА · ИЮЛЬ 1812" k={pop(t, 0.2)} />
      <Hero id="nikolai" x={440} y={760} s={0.95} />
      <Person x={820} y={760} s={0.8} color={C.french} dress="uniform" arm={1} label="молодой француз" labelColor={C.french} />
      <g transform={`translate(440 ${470}) scale(${pop(t, at(c, 0) + 3)})`}>
        <path d="M 0 -50 L 50 0 L 0 50 L -50 0 Z" fill={C.white} stroke={C.amber} strokeWidth={6} />
      </g>
      <g opacity={q}>
        <Big x={640} y={300} text="?" size={160} color={C.yellow} k={q} />
      </g>
      <Label x={640} y={360 + 40} text="«что называется геройством?»" color={HERO.nikolai} size={28} k={pop(t, at(c, 1) + 1)} />
    </Stage>
  );
};

// ── b02: шахматная доска и «чувство» в каждом солдате ──
export const ChessVsFeeling: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const feel = ramp(t, at(c, 1), 1.2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(160 220)" opacity={1 - feel * 0.6}>
        {Array.from({ length: 36 }).map((_, i) => (
          <rect key={i} x={(i % 6) * 70} y={Math.floor(i / 6) * 70} width={70} height={70} fill={(i + Math.floor(i / 6)) % 2 ? C.paper : "#8a6d45"} />
        ))}
        <Label x={210} y={-30} text="«военная наука»" color={C.paper} size={26} />
        <Cross x={210} y={210} s={300} k={ramp(t, at(c, 0) + 3.4, 0.8)} />
      </g>
      <DotNet x={720} y={230} w={420} h={420} n={60} seed={31} k={feel} align={0.9} dir={-Math.PI / 2} r={8} />
      <Hero id="andrei" x={930} y={830} s={0.6} label={false} />
      <QuoteCard x={170} y={680} w={940} text={"«Сражение выиграет тот,\nкто твердо решил его выиграть»"} who="князь Андрей — Пьеру, канун Бородина" k={ramp(t, at(c, 1) + 0.5, 0.7)} size={34} />
    </Stage>
  );
};

// ── b03: план Наполеона против поля ──
export const PlanVsField: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = ["пункт 1", "пункт 2", "пункт 3", "пункт 4"];
  const late = ramp(t, at(c, 1), 1);
  const hand = ramp(t, at(c, 2), 1.4);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(140 200)">
        <rect width={440} height={420} rx={14} fill={C.paper} />
        <text x={220} y={56} textAnchor="middle" fontFamily="'PT Serif', Georgia, serif" fontWeight={700} fontSize={32} fill={C.inkBrown}>
          Диспозиция
        </text>
        {items.map((it, i) => (
          <g key={it} transform={`translate(40 ${110 + i * 76})`}>
            <text fontFamily="Nunito, sans-serif" fontWeight={800} fontSize={30} fill={C.inkBrown} y={10}>
              {it}
            </text>
            <Cross x={300} y={0} s={46} k={ramp(t, 0.6 + i * 0.6, 0.5)} />
          </g>
        ))}
      </g>
      <g transform="translate(660 200)">
        <rect width={500} height={420} rx={14} fill="#3c4a3a" />
        <Smoke x={120} y={300} t={t} seed={3} />
        <Smoke x={360} y={280} t={t} seed={5} />
        {late > 0 && (
          <g opacity={late}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${80 + i * 150} ${90 + Math.sin(t * 2 + i) * 6})`}>
                <rect x={-40} y={-26} width={80} height={52} rx={6} fill={C.paper} />
                <text y={8} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={18} fill={C.red}>
                  поздно
                </text>
              </g>
            ))}
          </g>
        )}
      </g>
      <g transform={`translate(380 ${800})`}>
        <Hero id="napoleon" x={0} y={0} s={0.7} arm={1 - hand} label={false} />
      </g>
      <Label x={860} y={720} text="«ни в кого не стрелял»" color={C.paper} size={26} k={pop(t, at(c, 1) + 1.6)} />
      <Label x={860} y={800} text="гвардию в бой не ввёл" color={HERO.napoleon} size={26} k={pop(t, at(c, 2) + 2)} dark={false} />
    </Stage>
  );
};

// ── b04: Пьер на батарее — «семья» ──
export const BatteryFamily: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const gone = ramp(t, at(c, 1) + 3.5, 1.6);
  return (
    <Stage host={c.p.host}>
      <path d="M 120 760 Q 640 420 1160 760 Z" fill="#5b5a44" />
      <Smoke x={300} y={560} t={t} seed={7} />
      <Smoke x={980} y={560} t={t} seed={9} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Person key={i} x={320 + i * 130} y={720 - Math.sin((i / 5) * Math.PI) * 120} s={0.55} color="#c8a46a" dress="uniform" o={1 - gone * (i % 2 ? 0.9 : 0.3)} />
      ))}
      <Hero id="pierre" x={640} y={640} s={0.75} hat="white" />
      <Label x={640} y={210} text="«наш барин»" color={C.gold} size={34} k={pop(t, at(c, 1) + 0.6)} />
      <Note x={640} y={842} text="центральная батарея Бородинского поля · схема" o={ramp(t, 0.5, 0.6)} />
    </Stage>
  );
};

// ── b05: трава, граната, «я люблю жизнь» ──
export const GrassField: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const thought = ramp(t, at(c, 1), 0.8);
  const tent = ramp(t, at(c, 2), 1);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={520} width={1160} height={340} rx={24} fill="#4c7a3c" opacity={1 - tent * 0.6} />
      {Array.from({ length: 60 }).map((_, i) => {
        const x = 80 + rnd(i) * 1120;
        const h = 30 + rnd(i + 7) * 40;
        return <path key={i} d={`M ${x} 860 Q ${x + 8 + Math.sin(t * 2 + i) * 6} ${860 - h / 2} ${x + 4} ${860 - h}`} stroke="#8fd16a" strokeWidth={5} fill="none" opacity={(1 - tent * 0.6) * 0.9} />;
      })}
      <g opacity={1 - tent}>
        <Hero id="andrei" x={540} y={760} s={0.9} label={false} />
        <g transform={`translate(760 760) rotate(${t * 300})`} opacity={ramp(t, 0.8, 0.4)}>
          <circle r={22} fill="#2a2a2a" />
          <line x1={0} y1={0} x2={0} y2={-34} stroke={C.amber} strokeWidth={4} />
        </g>
      </g>
      <QuoteCard x={150} y={180} w={980} text={"«Я не могу, я не хочу умереть,\nя люблю жизнь, люблю эту траву,\nземлю, воздух…»"} who="мысль князя Андрея · т. III, ч. II" k={thought * (1 - tent)} size={34} />
      {tent > 0 && (
        <g opacity={tent}>
          <path d="M 300 760 L 640 300 L 980 760 Z" fill="#e8e0cc" />
          <Hero id="andrei" x={540} y={740} s={0.6} lean={-80} label={false} />
          <Hero id="anatole" x={760} y={740} s={0.6} lean={80} label={false} />
          <Label x={640} y={230} text="жалость и любовь — вместо ненависти" color={HERO.andrei} size={28} />
        </g>
      )}
    </Stage>
  );
};

// ── b06: дождь над полем ──
export const RainField: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={28} fill="#2a3346" />
      {Array.from({ length: 80 }).map((_, i) => {
        const x = 80 + rnd(i) * 1120;
        const y = 150 + ((rnd(i + 11) * 700 + t * 420) % 700);
        return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 26} stroke="#9fc4ff" strokeWidth={3} opacity={0.75} />;
      })}
      <DotNet x={160} y={560} w={960} h={220} n={60} seed={41} k={1} align={0} arrows={0.3} r={6} />
      <QuoteCard x={170} y={210} w={940} text={"«Довольно, довольно, люди.\nПерестаньте… Опомнитесь»."} who="Толстой — словно голос дождя · т. III, ч. II" k={ramp(t, 0.6, 0.7)} size={36} />
      <Label x={640} y={808} text="победа нравственная" color={C.gold} size={32} k={pop(t, at(c, 1) + 0.6)} />
    </Stage>
  );
};

// ── m01: Фили глазами Малаши ──
export const FiliCouncil: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="ФИЛИ · 1812" k={pop(t, 0.2)} />
      <rect x={160} y={240} width={960} height={560} rx={16} fill="#5a4630" />
      <rect x={160} y={240} width={300} height={220} fill="#7a5f40" />
      <Person x={310} y={440} s={0.5} color={C.paper} dress="child" label="Малаша" labelColor={C.paper} />
      <rect x={520} y={600} width={520} height={30} rx={8} fill="#3a2e20" />
      {[0, 1, 2, 3].map((i) => (
        <Person key={i} x={580 + i * 120} y={760} s={0.55} color="#8c99b8" dress="uniform" />
      ))}
      <Hero id="kutuzov" x={1000} y={780} s={0.7} label={false} />
      <QuoteCard x={460} y={260} w={600} text={"«я — приказываю\nотступление»"} who="Кутузов · т. III, ч. III, гл. 4" k={ramp(t, at(c, 1) + 0.6, 0.7)} size={38} />
    </Stage>
  );
};

// ── m07: Поклонная гора — депутация не пришла ──
export const EmptyCity: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const wait = ramp(t, at(c, 0) + 2, 2);
  return (
    <Stage host={c.p.host}>
      {/* силуэт города с куполами */}
      <g transform="translate(160 560)">
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i} transform={`translate(${i * 80} 0)`}>
            <rect x={0} y={-60 - (i % 3) * 30} width={64} height={120 + (i % 3) * 30} fill="#8a6d45" />
            {i % 3 === 1 && <circle cx={32} cy={-110} r={24} fill={C.gold} />}
          </g>
        ))}
      </g>
      <path d="M 60 860 L 400 680 L 740 860 Z" fill="#4c7a3c" />
      <Hero id="napoleon" x={400} y={700} s={0.7} label={false} />
      <path d={`M 470 690 L 720 690`} stroke={C.dim} strokeWidth={4} strokeDasharray="10 12" opacity={wait} />
      <Label x={900} y={760} text="депутации нет" color={C.paper} size={28} k={pop(t, at(c, 0) + 4)} />
      <QuoteCard x={530} y={170} w={680} text={"«Москва пуста.\nКакое невероятное событие!»"} who="перевод из примечаний издания" k={ramp(t, at(c, 1) + 1.4, 0.7)} size={34} />
    </Stage>
  );
};

// ── m02: город уходит — тысячи частных решений ──
export const CityLeaving: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const go = ramp(t, 0.3, 6);
  return (
    <Stage host={c.p.host}>
      <g opacity={0.7}>
        {Array.from({ length: 10 }).map((_, i) => (
          <House key={i} x={160 + (i % 5) * 220} y={420 + Math.floor(i / 5) * 200} s={0.5} light={1 - go} />
        ))}
      </g>
      <DotNet x={140} y={250} w={1000} h={560} n={150} seed={51} k={1} align={0.3 + go * 0.4} dir={0.4} arrows={1} r={6} drift={go * 120} />
      <Label x={640} y={190} text="каждый для себя — и вместе" color={C.cyan} size={30} k={pop(t, 0.8)} />
      <Label x={640} y={812} text="Растопчин — «как мальчик»" color={C.dim} size={26} k={pop(t, at(c, 1) + 2)} />
    </Stage>
  );
};

// ── m03: подводы — вещи или раненые ──
const Cart: React.FC<{ x: number; y: number; load: "things" | "people"; k: number }> = ({ x, y, load, k }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-90} y={-50} width={180} height={50} rx={6} fill="#8a6d45" />
    <circle cx={-56} cy={8} r={26} fill="none" stroke="#5a4630" strokeWidth={8} />
    <circle cx={56} cy={8} r={26} fill="none" stroke="#5a4630" strokeWidth={8} />
    {load === "things" ? (
      <g opacity={1 - k}>
        <rect x={-70} y={-120} width={60} height={70} fill="#b78f5a" />
        <rect x={0} y={-104} width={70} height={54} fill="#9c7444" />
      </g>
    ) : (
      <g opacity={k}>
        <Person x={-30} y={-50} s={0.4} color="#c8a46a" dress="uniform" lean={-40} />
        <Person x={30} y={-50} s={0.4} color="#c8a46a" dress="uniform" lean={-30} />
      </g>
    )}
  </g>
);
export const CartsChoice: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const swap = ramp(t, at(c, 2), 1.4);
  return (
    <Stage host={c.p.host}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cart x={260 + i * 300} y={500} load="things" k={swap} />
          <Cart x={260 + i * 300} y={500} load="people" k={swap} />
        </g>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Person key={i} x={200 + i * 170} y={800} s={0.5} color="#c8a46a" dress="uniform" lean={i % 2 ? 10 : -10} o={1 - swap * 0.8} />
      ))}
      <Hero id="natasha" x={1150} y={800} s={0.8} arm={ramp(t, at(c, 1), 0.4)} />
      <QuoteCard x={170} y={170} w={940} text={"«Маменька, это нельзя;\nпосмотрите, что на дворе!»"} who="Наташа · т. III, ч. III, гл. 16" k={ramp(t, at(c, 1) + 0.4, 0.7) * (1 - swap * 0.4)} size={34} />
    </Stage>
  );
};

// ── m04: деревянный город горит ──
export const WoodenCity: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const fire = ramp(t, 0.5, 4);
  return (
    <Stage host={c.p.host}>
      <rect x={60} y={140} width={1160} height={720} rx={28} fill="#2a1a20" />
      {Array.from({ length: 14 }).map((_, i) => (
        <g key={i} transform={`translate(${120 + i * 80} ${700})`}>
          <rect x={0} y={-80 - (i % 4) * 20} width={66} height={80 + (i % 4) * 20} fill="#6b4a2f" stroke="#4a3220" strokeWidth={4} />
          {[0, 1, 2].map((j) => (
            <line key={j} x1={0} y1={-20 - j * 22} x2={66} y2={-20 - j * 22} stroke="#4a3220" strokeWidth={3} />
          ))}
          {rnd(i + 2) < fire && <Flame x={33} y={-80 - (i % 4) * 20} s={0.6} t={t} seed={i} />}
        </g>
      ))}
      <Label x={640} y={220} text="покинутый деревянный город" color={C.amber} size={30} k={pop(t, 0.6)} />
      <QuoteCard x={260} y={300} w={760} text={"«Москва сожжена жителями,\nэто правда»"} who="Толстой · т. III, ч. III, гл. 26" k={ramp(t, at(c, 1), 0.7)} size={36} />
    </Stage>
  );
};

// ── m05: Мытищи — ночная лампа ──
export const LampVigil: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <Stage host={c.p.host}>
      <rect x={160} y={200} width={960} height={600} rx={20} fill="#1b1a2c" />
      <circle cx={640} cy={430} r={260} fill={C.amber} opacity={0.08} />
      <Candle x={640} y={560} t={t} />
      <Hero id="andrei" x={880} y={740} s={0.7} lean={-75} label={false} />
      <g transform={`translate(${380 + ramp(t, 0.3, 1.5) * 120} 0)`}>
        <Hero id="natasha" x={0} y={740} s={0.8} lean={10} />
      </g>
      <Label x={500} y={260} text="«Простите меня!»" color={HERO.natasha} size={30} k={pop(t, 1.6)} />
      <Label x={860} y={330} text="«…больше, лучше, чем прежде»" color={HERO.andrei} size={28} k={pop(t, at(c, 1) + 0.8)} />
    </Stage>
  );
};

// ── m06: Ярославль — дверь и свет ──
export const DoorLight: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const open = ramp(t, at(c, 0) + 2.5, 2.5);
  return (
    <Stage host={c.p.host}>
      <rect x={440} y={180} width={400} height={620} rx={10} fill="#fff6d8" />
      <g transform={`translate(440 180) scale(${1 - open * 0.85} 1)`}>
        <rect width={400} height={620} rx={10} fill="#6b4a2f" stroke="#4a3220" strokeWidth={8} />
        <circle cx={340} cy={320} r={14} fill={C.gold} />
      </g>
      <Label x={640} y={160 + 0} text="«Я умер — я проснулся»" color={C.white} size={30} k={pop(t, at(c, 0) + 4.5)} />
      <g opacity={ramp(t, at(c, 1), 0.8)}>
        <Hero id="natasha" x={260} y={820} s={0.7} />
        <Hero id="marya" x={1020} y={820} s={0.7} />
      </g>
    </Stage>
  );
};

// ── b08: Кутузов принимает армию; Андрей выбирает полк, а не штаб ──
export const RegimentChoice: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pick = ramp(t, at(c, 1) + 2, 1.2);
  return (
    <Stage host={c.p.host}>
      <Chip x={640} y={170} text="АВГУСТ 1812" k={pop(t, 0.2)} />
      <Hero id="kutuzov" x={260} y={760} s={0.9} />
      <Label x={260} y={420} text="«всё отступать и отступать!»" color={HERO.kutuzov} size={24} k={pop(t, 1.4)} />
      <g transform="translate(560 300)">
        <rect width={240} height={150} rx={14} fill={C.paper} opacity={1 - pick * 0.6} />
        <text x={120} y={86} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={30} fill={C.inkBrown} opacity={1 - pick * 0.6}>
          штаб
        </text>
      </g>
      <g transform="translate(1000 500)">
        {Array.from({ length: 6 }).map((_, i) => (
          <Person key={i} x={(i % 3) * 90} y={240 + Math.floor(i / 3) * 70} s={0.45} color="#c8a46a" dress="uniform" />
        ))}
        <text x={90} y={-10} textAnchor="middle" fontFamily="Nunito, sans-serif" fontWeight={900} fontSize={30} fill={C.gold}>
          полк
        </text>
      </g>
      <g transform={`translate(${560 + pick * 180} 0)`}>
        <Hero id="andrei" x={120} y={780} s={0.8} />
      </g>
    </Stage>
  );
};
