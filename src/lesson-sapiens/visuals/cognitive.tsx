// Часть «Язык» (когнитивная революция): пищевая цепочка, перемены 70–30 тыс. лет
// назад, сплетни, предел 150, общие истории, компания-фикция, культура на обгоне,
// три слоя реальности, уточнение о вере, собиратели, расселение.
import React from "react";
import { C } from "../theme";
import { BigBeast, Bubble, Crowd, Factory, Island, Net, Palm, Person, Scroll, Sea, Ship, Stage } from "./island";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// простые силуэты зверей пищевой цепочки
const Beast: React.FC<{ kind: "lion" | "hyena" | "rabbit" | "bird"; x: number; y: number; s?: number; t: number }> = ({ kind, x, y, s = 1, t }) => {
  const col = kind === "lion" ? "#d99a3b" : kind === "hyena" ? "#9a8a6a" : kind === "rabbit" ? "#c7b7a3" : "#7fa7c9";
  return (
    <g transform={`translate(${x} ${y + Math.sin(t * 2 + x) * 3}) scale(${s})`}>
      {kind === "bird" ? (
        <path d="M -40 0 Q -10 -30 0 0 Q 10 -30 40 0" stroke={col} strokeWidth={10} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx={0} cy={-34} rx={kind === "rabbit" ? 30 : 60} ry={kind === "rabbit" ? 24 : 34} fill={col} />
          <circle cx={kind === "rabbit" ? 28 : 58} cy={kind === "rabbit" ? -50 : -54} r={kind === "rabbit" ? 16 : 26} fill={col} />
          {kind === "lion" && <circle cx={58} cy={-54} r={36} fill="#b9772a" opacity={0.6} />}
          {kind === "rabbit" && <ellipse cx={30} cy={-80} rx={6} ry={18} fill={col} />}
          <circle cx={kind === "rabbit" ? 34 : 68} cy={kind === "rabbit" ? -54 : -60} r={4} fill={C.ink} />
        </>
      )}
    </g>
  );
};

// ── c01: человек в середине пищевой цепочки ──
export const FoodChain: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lv = [
    { y: 230, label: "крупные хищники", k: ramp(t, 0.2, 0.6) },
    { y: 420, label: "древний человек", k: ramp(t, at(c, 1), 0.6) },
    { y: 610, label: "мелкая дичь", k: ramp(t, at(c, 1.3), 0.6) },
  ];
  const queue = ramp(t, at(c, 2), 0.8);
  const species = ramp(t, at(c, 3), 0.8);
  const big = ramp(t, at(c, 5), 0.8);
  return (
    <Stage host={c.p.host}>
      {lv.map((l, i) =>
        l.k > 0 ? (
          <g key={i} opacity={l.k * (1 - species)} transform={`translate(${(1 - l.k) * 60} 0)`}>
            <Panel x={140} y={l.y - 70} w={1000} h={140} fill={i === 1 ? "#fff4d8" : C.white} stroke={i === 1 ? C.yellowDeep : undefined} />
            <Txt x={360} y={l.y + 14} size={36} color={C.ink} anchor="middle">
              {l.label}
            </Txt>
            {i === 0 && (
              <>
                <Beast kind="lion" x={720} y={l.y + 50} t={t} s={0.9} />
                <Beast kind="hyena" x={920} y={l.y + 50} t={t} s={0.8} />
              </>
            )}
            {i === 1 && (
              <>
                <Person x={700} y={l.y + 56} s={0.9} i={1} t={t} />
                <Person x={800} y={l.y + 56} s={0.9} i={2} t={t} look={-1} />
                {queue > 0 && (
                  <g opacity={queue}>
                    <Bubble x={980} y={l.y - 4} text="ждём очереди" size={32} k={queue} />
                  </g>
                )}
              </>
            )}
            {i === 2 && (
              <>
                <Beast kind="rabbit" x={760} y={l.y + 50} t={t} />
                <Beast kind="bird" x={920} y={l.y + 10} t={t} />
              </>
            )}
          </g>
        ) : null,
      )}
      {lv[1].k > 0 && species < 0.5 && (
        <>
          <Arrow x1={1180} y1={300} x2={1180} y2={380} k={lv[1].k} color={C.red} w={8} />
          <Arrow x1={1180} y1={480} x2={1180} y2={560} k={lv[2].k} color={C.green} w={8} />
        </>
      )}
      {species > 0 && (
        <g opacity={species}>
          <Txt x={640} y={260} size={44} color={C.ink}>
            несколько видов людей одновременно
          </Txt>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${260 + i * 190} ${560 + (i % 2) * 20})`} opacity={clamp01(species * 5 - i)}>
              <Person x={0} y={0} s={1.1 + (i % 3) * 0.15} i={i + 3} t={t} />
            </g>
          ))}
          <Txt x={640} y={700} size={34} color={C.inkSoft}>
            эволюционная рамка книги
          </Txt>
        </g>
      )}
      {big > 0 && (
        <g opacity={big}>
          <Txt x={640} y={160} size={46} color={C.skyDeep}>
            {"как обычное существо\nстало самым влиятельным?"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// значки изобретений
const InventIcon: React.FC<{ kind: string; x: number; y: number; k: number; t: number }> = ({ kind, x, y, k, t }) => {
  if (k <= 0) return null;
  const st = { stroke: C.woodDark, strokeWidth: 10, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g transform={`translate(${x} ${y + wob(t, x, 4)}) scale(${k})`} opacity={clamp01(k)}>
      <circle r={90} fill={C.white} />
      {kind === "boat" && <path d="M -60 10 L 60 10 L 40 40 L -40 40 Z" fill={C.wood} />}
      {kind === "boat" && <path d="M 0 10 L 0 -60 L 40 0 Z" fill={C.sky} />}
      {kind === "bow" && (
        <g>
          <path d="M -20 -60 Q 50 0 -20 60" {...st} />
          <line x1={-20} y1={-60} x2={-20} y2={60} stroke={C.ink} strokeWidth={3} />
          <line x1={-50} y1={0} x2={50} y2={0} stroke={C.ink} strokeWidth={6} />
        </g>
      )}
      {kind === "needle" && (
        <g>
          <line x1={-50} y1={50} x2={50} y2={-50} stroke={C.steel} strokeWidth={9} strokeLinecap="round" />
          <circle cx={40} cy={-40} r={7} fill={C.white} stroke={C.steel} strokeWidth={3} />
          <path d="M 40 -40 Q 60 0 0 30 Q -40 50 -60 20" stroke={C.coral} strokeWidth={4} fill="none" />
        </g>
      )}
      {kind === "lamp" && (
        <g>
          <path d="M -50 10 Q 0 50 50 10 L 30 -6 L -30 -6 Z" fill={C.clay} />
          <path d={`M 0 -10 Q ${-16 + Math.sin(t * 8) * 4} -40 0 -70 Q ${16 + Math.sin(t * 7) * 4} -40 0 -10 Z`} fill={C.yellowDeep} />
        </g>
      )}
      {kind === "beads" && [0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx={Math.cos(i * 0.9 - 2.6) * 50} cy={Math.sin(i * 0.9 - 2.6) * 50 + 20} r={13} fill={[C.coral, C.yellow, C.sky, C.green][i % 4]} />)}
      {kind === "trade" && (
        <g>
          <path d="M -50 -10 L 40 -10" {...st} stroke={C.green} />
          <path d="M 20 -30 L 45 -10 L 20 10" {...st} stroke={C.green} />
          <path d="M 50 30 L -40 30" {...st} stroke={C.coral} />
          <path d="M -20 10 L -45 30 L -20 50" {...st} stroke={C.coral} />
        </g>
      )}
    </g>
  );
};

// ── c02: что изменилось 70–30 тыс. лет назад ──
export const Inventions: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const items = ["boat", "lamp", "bow", "needle", "trade"];
  const labels = ["лодки", "лампы", "луки", "иглы", "торговля"];
  const brain = ramp(t, at(c, 2), 0.7);
  const lang = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <Tag x={640} y={170} text="70–30 тысяч лет назад" color={C.yellow} size={42} />
      {items.map((it, i) => {
        const k = pop(t, at(c, 1 + i * 0.16));
        return (
          <g key={it}>
            <InventIcon kind={it} x={170 + i * 235} y={400} k={k} t={t} />
            {k > 0.2 && (
              <Txt x={170 + i * 235} y={540} size={32} color={C.ink} opacity={clamp01(k)}>
                {labels[i]}
              </Txt>
            )}
          </g>
        );
      })}
      {brain > 0 && (
        <g opacity={brain}>
          <Panel x={240} y={600} w={800} h={110} fill="#f3edff" />
          <Txt x={640} y={668} size={34} color={C.violet}>
            причина точно не известна
          </Txt>
        </g>
      )}
      {lang > 0 && (
        <g transform={`translate(640 300) scale(${lang})`}>
          <rect x={-300} y={-80} width={600} height={140} rx={70} fill={C.ink} />
          <Txt x={0} y={14} size={56} color={C.yellow}>
            новый язык
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c03: сигналы и сплетни ──
export const Gossip: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const monkey = ramp(t, 0.2, 0.5) * (1 - ramp(t, at(c, 1), 0.5));
  const gossip = ramp(t, at(c, 1), 0.6);
  const who = [at(c, 2), at(c, 2.3), at(c, 2.6)];
  return (
    <Stage host={c.p.host}>
      {monkey > 0 && (
        <g opacity={monkey}>
          <Palm x={260} y={640} s={1.6} t={t} />
          <Bubble x={420} y={260} text="Осторожно, орёл!" size={40} k={pop(t, 0.5)} tail={-1} />
          <Bubble x={900} y={420} text="Осторожно, лев!" size={40} k={pop(t, 1.6)} />
          <path d="M 860 180 Q 900 140 940 180 Q 980 140 1020 180" stroke={C.ink} strokeWidth={8} fill="none" />
        </g>
      )}
      {gossip > 0 && (
        <g opacity={gossip}>
          <Island x={640} y={660} w={980} t={t} palms={false} />
          {[0, 1, 2, 3, 4].map((i) => (
            <Person key={i} x={300 + i * 170} y={630} s={1.15} i={i} t={t} look={i < 2 ? 1 : -1} />
          ))}
          <Bubble x={400} y={430} text="кто помогает?" size={32} k={pop(t, who[0])} />
          <Bubble x={720} y={380} text="кто ленится?" size={32} k={pop(t, who[1])} tail={-1} />
          <Bubble x={1000} y={450} text="кто обманывает?" size={32} k={pop(t, who[2])} tail={-1} />
          <Pop t={t} at={at(c, 1.4)} x={640} y={180}>
            <Tag x={0} y={0} text="версия: язык для сплетен" color={C.violet} textColor={C.white} size={38} />
          </Pop>
        </g>
      )}
    </Stage>
  );
};

// ── c04: предел личного доверия ≈ 150 ──
export const Limit150: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const grow = ramp(t, at(c, 1), 1.4);
  const many = ramp(t, at(c, 2), 1.4);
  const ask = pop(t, at(c, 3));
  const cols = 5 + Math.round(grow * 9 + many * 10);
  const rows = 2 + Math.round(grow * 2 + many * 3);
  const net: [number, number][] = [
    [380, 520], [520, 470], [660, 540], [800, 480], [920, 540],
  ];
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={600} />
      <Island x={640} y={660} w={1100} t={t} palms={false} />
      {grow < 0.1 && <Net pts={net} k={ramp(t, 0.3, 1)} t={t} color={C.green} links={[[0, 1], [1, 2], [2, 3], [3, 4], [0, 2], [1, 3], [2, 4], [0, 4]]} />}
      <Crowd x={640 - cols * 22} y={640 - rows * 27} cols={cols} rows={rows} gap={44} s={0.42} t={t} />
      <Pop t={t} at={at(c, 1)} x={640} y={190}>
        <Panel x={-250} y={-70} w={500} h={130} fill={C.white} />
        <Txt x={0} y={-4} size={52} color={C.ink}>
          около 150
        </Txt>
        <Txt x={0} y={42} size={32} color={C.inkSoft}>
          предел личного знакомства
        </Txt>
      </Pop>
      {many > 0.3 && (
        <g opacity={ramp(t, at(c, 2.2), 0.5)}>
          <Txt x={640} y={330} size={46} color={C.red}>
            всех не узнать
          </Txt>
        </g>
      )}
      {ask > 0 && (
        <g transform={`translate(1080 330) scale(${ask})`}>
          <circle r={70} fill={C.yellow} />
          <Txt x={0} y={30} size={96} color={C.ink}>
            ?
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c05: общая история связывает незнакомцев ──
export const SharedStory: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const story = pop(t, at(c, 0.5));
  const words = ["компании", "законы", "государства", "права"];
  const link = ramp(t, at(c, 1.4), 1.5);
  const pts: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    pts.push([640 + Math.cos(a) * 470, 470 + Math.sin(a) * 250]);
  }
  const center: [number, number] = [640, 460];
  return (
    <Stage host={c.p.host}>
      {pts.map(([x, y], i) => (
        <g key={i} opacity={clamp01(ramp(t, 0.2 + i * 0.06, 0.4))}>
          {link > 0 && <line x1={x} y1={y - 40} x2={x + (center[0] - x) * link} y2={y - 40 + (center[1] - y + 40) * link} stroke={C.yellowDeep} strokeWidth={4} strokeDasharray="10 10" strokeDashoffset={-t * 30} opacity={0.7 * link} />}
          <Person x={x} y={y} s={0.75} i={i} t={t} />
        </g>
      ))}
      {story > 0 && (
        <g transform={`translate(640 460) scale(${story})`}>
          <circle r={150 + Math.sin(t * 2) * 6} fill={C.yellow} opacity={0.25} />
          <Scroll x={0} y={0} w={230} h={240} title="общая история" rows={3} k={ramp(t, at(c, 0.7), 1)} />
        </g>
      )}
      {words.map((w, i) => (
        <Pop key={w} t={t} at={at(c, 1.1 + i * 0.08)} x={260 + i * 255} y={150}>
          <Tag x={0} y={0} text={w} color={C.white} size={32} />
        </Pop>
      ))}
      <Pop t={t} at={at(c, 3.3)} x={640} y={820}>
        <Tag x={0} y={0} text="сила — в общей договорённости" color={C.ink} textColor={C.yellow} size={38} />
      </Pop>
    </Stage>
  );
};

// ── c06: компания живёт не в железе ──
export const Company: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const scrap = ramp(t, at(c, 1.2), 1);
  const law = pop(t, at(c, 2.2));
  const power = ramp(t, at(c, 3), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={1 - scrap * 0.85} transform={`translate(${-scrap * 120} ${scrap * 80})`}>
        <Factory x={300} y={540} s={1.1} t={t} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${200 + i * 110} 640)`}>
            <rect x={-44} y={-30} width={88} height={34} rx={14} fill={[C.coral, C.skyDeep, C.green][i]} />
            <circle cx={-26} cy={6} r={12} fill={C.ink} />
            <circle cx={26} cy={6} r={12} fill={C.ink} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <Person key={i} x={180 + i * 120} y={770} s={0.8} i={i + 2} t={t} />
        ))}
      </g>
      {scrap > 0.2 && (
        <g opacity={clamp01(scrap * 2 - 0.4)}>
          <Cross x={300} y={600} s={240} k={scrap} />
        </g>
      )}
      <g transform="translate(880 430)">
        <circle r={190 + Math.sin(t * 2) * 5} fill={C.yellow} opacity={0.22} />
        <Panel x={-190} y={-130} w={380} h={260} fill={C.white} stroke={C.yellowDeep} />
        <Txt x={0} y={-40} size={40} color={C.ink}>
          КОМПАНИЯ
        </Txt>
        <Txt x={0} y={14} size={34} color={C.inkSoft}>
          юридическая фикция
        </Txt>
        {law > 0 && (
          <g transform={`scale(${law})`}>
            <Check x={0} y={80} s={50} k={ramp(t, at(c, 2.3), 0.5)} />
          </g>
        )}
      </g>
      {power > 0 && (
        <g opacity={power}>
          <Txt x={880} y={710} size={30} color={C.ink}>
            {"владеет · нанимает · подписывает"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c06b: культура на полосе обгона ──
export const FastLane: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const road = ramp(t, 0.2, 0.8);
  const slow = ramp(t, at(c, 1), 3);
  const fast = ramp(t, at(c, 1.5), 1.6);
  const lane = pop(t, at(c, 2.2));
  return (
    <Stage host={c.p.host}>
      <g opacity={road}>
        <rect x={60} y={360} width={1160} height={330} rx={30} fill="#5b6a82" />
        <line x1={80} y1={525} x2={1200} y2={525} stroke={C.white} strokeWidth={8} strokeDasharray="50 40" strokeDashoffset={-t * 120} />
        <Txt x={140} y={430} size={34} color={C.white} anchor="start">
          гены
        </Txt>
        <Txt x={140} y={610} size={34} color={C.yellow} anchor="start">
          культура
        </Txt>
      </g>
      <g transform={`translate(${260 + slow * 120} 470)`}>
        <ellipse rx={60} ry={34} fill="#b0a48a" />
        <circle cx={55} cy={-8} r={22} fill="#b0a48a" />
        <Txt x={0} y={-50} size={30} color={C.white}>
          {"> 1 млн лет"}
        </Txt>
      </g>
      <g transform={`translate(${260 + fast * 760} 635)`}>
        <rect x={-80} y={-36} width={160} height={58} rx={22} fill={C.yellow} />
        <circle cx={-46} cy={24} r={16} fill={C.ink} />
        <circle cx={46} cy={24} r={16} fill={C.ink} />
        {fast > 0.1 && <path d="M -110 -20 L -170 -20 M -110 0 L -190 0" stroke={C.white} strokeWidth={6} strokeLinecap="round" opacity={0.7} />}
        <Txt x={0} y={-50} size={30} color={C.ink}>
          одно поколение
        </Txt>
      </g>
      {lane > 0 && (
        <g transform={`translate(640 220) scale(${lane})`}>
          <Panel x={-380} y={-70} w={760} h={130} fill={C.white} />
          <Txt x={0} y={14} size={46} color={C.ink}>
            культура на полосе обгона
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c07: три слоя реальности ──
export const ThreeLayers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cols = [
    { title: "объективное", sub: "радиация", color: C.skyDeep, at: at(c, 1) },
    { title: "субъективное", sub: "воображаемый друг", color: C.coral, at: at(c, 2) },
    { title: "общее убеждение", sub: "деньги, законы, государства", color: C.yellowDeep, at: at(c, 3) },
  ];
  const fade = ramp(t, at(c, 4), 0.8);
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={640} y={170}>
        <Tag x={0} y={0} text="«воображаемое» — не ложь" color={C.white} size={40} />
      </Pop>
      {cols.map((cl, i) => (
        <Pop key={i} t={t} at={cl.at} x={230 + i * 410} y={470}>
          <Panel x={-190} y={-190} w={380} h={380} fill={i === 2 ? "#fff6d6" : C.white} stroke={i === 2 ? C.yellowDeep : undefined} />
          <circle cy={-80} r={64} fill={cl.color} opacity={0.9} />
          {i === 0 &&
            [0, 120, 240].map((a) => <path key={a} d="M 0 -80 L 24 -120 A 46 46 0 0 1 46 -80 Z" transform={`rotate(${a + t * 20} 0 -80)`} fill={C.white} />)}
          {i === 1 && <circle cy={-80} r={30} fill={C.white} opacity={0.5 + 0.5 * Math.sin(t * 2)} />}
          {i === 2 && (
            <g>
              <circle cx={-22} cy={-80} r={14} fill={C.white} />
              <circle cx={22} cy={-80} r={14} fill={C.white} />
              <circle cx={0} cy={-108} r={14} fill={C.white} />
              <circle cx={0} cy={-52} r={14} fill={C.white} />
            </g>
          )}
          <Txt x={0} y={40} size={36} color={C.ink}>
            {cl.title}
          </Txt>
          <Txt x={0} y={92} size={i === 2 ? 26 : 30} color={C.inkSoft}>
            {cl.sub}
          </Txt>
        </Pop>
      ))}
      {fade > 0 && (
        <g opacity={fade}>
          <Panel x={240} y={720} w={800} h={100} fill={C.ink} />
          <Txt x={640} y={784} size={32} color={C.yellow}>
            перестанут признавать все — сила исчезнет
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c08: спокойная карточка-уточнение о вере (без символов и изображений) ──
export const FaithNote: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const a = pop(t, at(c, 1));
  const b = pop(t, at(c, 2));
  const d = pop(t, at(c, 3));
  return (
    <Stage host={c.p.host}>
      <Pop t={t} at={0.2} x={640} y={170}>
        <Txt x={0} y={0} size={50} color={C.ink}>
          Важное уточнение
        </Txt>
      </Pop>
      {a > 0 && (
        <g transform={`translate(330 440) scale(${a})`}>
          <Panel x={-280} y={-150} w={560} h={300} fill={C.white} stroke={C.coral} />
          <Txt x={0} y={-80} size={30} color={C.coral}>
            позиция Харари
          </Txt>
          <Txt x={0} y={-10} size={30} color={C.ink}>
            {"относит к «общим\nисториям» и религии"}
          </Txt>
        </g>
      )}
      {b > 0 && (
        <g transform={`translate(950 440) scale(${b})`}>
          <Panel x={-280} y={-150} w={560} h={300} fill={C.white} stroke={C.yellowDeep} />
          <Txt x={0} y={-80} size={30} color={C.yellowDeep}>
            позиция фильма
          </Txt>
          <Txt x={0} y={-10} size={30} color={C.ink}>
            {"не доказанный факт;\nвопросы веры — вне\nэтого механизма"}
          </Txt>
        </g>
      )}
      {d > 0 && (
        <g transform={`translate(640 720) scale(${d})`}>
          <Tag x={0} y={0} text="дальше: деньги · законы · государства" color={C.ink} textColor={C.white} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── c09: собиратели ──
export const Foragers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const know = ["растения", "звери", "сезоны"];
  const hours = ramp(t, at(c, 2), 0.7);
  const danger = ramp(t, at(c, 3), 0.6);
  const lost = ramp(t, at(c, 4), 0.8);
  return (
    <Stage host={c.p.host}>
      <Sea t={t} y={640} />
      <Island x={640} y={680} w={1000} t={t} />
      <Person x={420} y={650} s={1.2} i={1} t={t} arm={0.8} />
      <Person x={560} y={660} s={1.1} i={4} t={t} bend={0.4} />
      <Person x={760} y={650} s={1.15} i={2} t={t} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={470 + i * 40} cy={430 + Math.sin(t * 2 + i) * 6} r={14} fill={[C.coral, C.yellow, C.green, C.violet][i]} opacity={0.9} />
      ))}
      {know.map((k, i) => (
        <Pop key={k} t={t} at={at(c, 1.3 + i * 0.12)} x={300 + i * 340} y={190}>
          <Tag x={0} y={0} text={k} color={C.white} size={34} />
        </Pop>
      ))}
      {hours > 0 && (
        <g opacity={hours * (1 - lost)}>
          <Panel x={860} y={300} w={380} h={150} fill={C.white} />
          <Txt x={1050} y={362} size={30} color={C.ink}>
            меньше часов
          </Txt>
          <Txt x={1050} y={410} size={30} color={C.ink}>
            разнообразная еда
          </Txt>
        </g>
      )}
      {danger > 0 && (
        <g opacity={danger * (1 - lost)}>
          <Panel x={40} y={300} w={380} h={150} fill="#fff1ee" />
          <Txt x={230} y={362} size={30} color={C.red}>
            не идеализировать:
          </Txt>
          <Txt x={230} y={410} size={30} color={C.red}>
            опасная жизнь
          </Txt>
        </g>
      )}
      {lost > 0 && (
        <g opacity={lost}>
          <Panel x={240} y={300} w={800} h={160} fill={C.white} />
          <g transform="translate(400 380)">
            <path d="M -40 30 L -20 -30 L 30 -20 L 40 30 Z" fill="#9aa5b8" />
          </g>
          <Txt x={720} y={372} size={34} color={C.ink}>
            остался камень
          </Txt>
          <Txt x={720} y={420} size={34} color={C.inkSoft}>
            дерево, одежда, слова — исчезли
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── c10: расселение и исчезновение гигантов (гипотеза) ──
export const Spread: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const path = ramp(t, 0.2, 2.2);
  const beasts = ramp(t, at(c, 1), 0.5);
  const fadeB = ramp(t, at(c, 1.5), 1.5);
  const weigh = ramp(t, at(c, 2.2), 0.7);
  const climate = ramp(t, at(c, 3), 0.6);
  const myth = ramp(t, at(c, 4), 0.6);
  return (
    <Stage host={c.p.host}>
      <rect x={40} y={170} width={1200} height={560} rx={40} fill={C.sea} opacity={0.35} />
      <path d="M 200 300 Q 300 230 420 290 Q 470 380 380 430 Q 260 470 200 400 Z" fill={C.sand} />
      <path d="M 700 260 Q 820 210 900 280 Q 930 380 840 420 Q 720 430 690 350 Z" fill={C.sand} />
      <path d="M 900 520 Q 1040 480 1120 560 Q 1130 660 1020 680 Q 900 670 890 600 Z" fill={C.sand} />
      <path d="M 420 300 Q 600 200 760 290 M 860 400 Q 930 470 960 540" stroke={C.ink} strokeWidth={6} strokeDasharray={`${path * 900} 2000`} fill="none" />
      <Ship x={600 * path + 300 * (1 - path)} y={260} s={0.4} t={t} />
      {beasts > 0 && (
        <g opacity={beasts * (1 - fadeB * 0.55)}>
          <BigBeast x={760} y={420} s={0.7} t={t} />
          <BigBeast x={1000} y={680} s={0.6} t={t} />
        </g>
      )}
      {weigh > 0 && (
        <g opacity={weigh}>
          <Panel x={80} y={540} w={520} h={150} fill={C.white} />
          <Txt x={340} y={600} size={30} color={C.violet}>
            люди? климат?
          </Txt>
          <Txt x={340} y={650} size={32} color={C.inkSoft}>
            улики косвенные
          </Txt>
        </g>
      )}
      {climate > 0 && (
        <g transform="translate(620 180)" opacity={climate}>
          <circle r={40} fill={C.yellow} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1={0} y1={-56} x2={0} y2={-76} stroke={C.yellowDeep} strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 45 + t * 10})`} />
          ))}
        </g>
      )}
      {myth > 0 && (
        <g opacity={myth}>
          <Panel x={240} y={770} w={800} h={90} fill={C.ink} />
          <Txt x={640} y={828} size={30} color={C.yellow}>
            «полная гармония с природой» — по Харари, миф
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── пауза-вопрос: спокойный остров (карточка вопроса — QuestionOverlay) ──
export const PauseIsland: React.FC<VisualProps> = (c) => {
  const { t } = c;
  return (
    <g>
      <Sea t={t} x={0} w={1920} y={560} />
      <Island x={420} y={600} w={560} t={t} />
      <Island x={1500} y={620} w={520} t={t} />
      <Person x={360} y={580} s={1} i={1} t={t} />
      <Person x={470} y={585} s={1} i={3} t={t} look={-1} />
      <Person x={1460} y={600} s={1} i={5} t={t} />
      <Person x={1560} y={600} s={1} i={2} t={t} look={-1} />
      <path d={`M 520 520 Q 960 ${360 + Math.sin(t) * 20} 1420 540`} stroke={C.yellowDeep} strokeWidth={6} strokeDasharray="14 12" strokeDashoffset={-t * 30} fill="none" opacity={0.8} />
      <Txt x={960} y={200} size={44} color={C.inkSoft}>
        доверие между незнакомцами
      </Txt>
    </g>
  );
};

