// Блок «Риарден и металл»: первая плавка, путь Риардена, браслет и цепь,
// обмен браслетами, вина создателя, честная сделка, «мы движем миром».
import React from "react";
import { interpolate } from "remotion";
import { FONTS } from "../../banamind/fonts";
import { C } from "../theme";
import { Bracelet, Bubble, Coin, Factory, Figure, Ladle, OL, Track, Train, zoneX } from "./draw";
import { Pop, Tag, at, clamp01, ease, pop, ramp, wob, type VisualProps } from "./kit";

export const Pour: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const inside = ramp(t, at(c, 2), 0.8);
  const pour = ramp(t, at(c, 2.3), 1.2);
  const ten = pop(t, at(c, 3.5));
  return (
    <g>
      {/* снаружи: окна поезда и огни завода */}
      <g opacity={1 - inside}>
        <rect x={0} y={0} width={1920} height={1080} fill="#384663" opacity={0.75} />
        <Factory x={680} y={780} s={1.4} t={t} glow={0.9} sign="РИАРДЕН СТИЛ" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x={60 + i * 440} y={120} width={400} height={300} rx={30} fill="none" stroke="#d7dfeb" strokeWidth={22} />
          </g>
        ))}
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${260 + i * 700} 560)`}>
            <Figure x={0} y={0} s={1} hair={i ? "hat" : "m"} color={i ? "#6b5b7a" : "#7b8aa3"} t={t} mood="flat" />
          </g>
        ))}
        <Pop t={t} at={at(c, 1)} x={460} y={450}>
          <Bubble x={0} y={0} w={520} h={110} text={"«коллективные\nдостижения»"} size={34} k={1} />
        </Pop>
      </g>
      {/* внутри: ковш и поток */}
      {inside > 0 && (
        <g opacity={inside}>
          <rect x={0} y={0} width={1920} height={1080} fill="#4a3a33" opacity={0.6} />
          <rect x={60} y={120} width={60} height={800} fill="#6b5b50" stroke={OL} strokeWidth={4} />
          <Ladle x={520} y={360} s={1.3} tilt={-24 * pour + wob(t, 1, 1)} glow={1} />
          {pour > 0.2 && <path d={`M 690 ${300 + 10} Q 760 450 740 ${300 + 520 * pour}`} stroke="#fff5cf" strokeWidth={46} fill="none" strokeLinecap="round" />}
          <path d="M 560 870 L 920 870 L 890 980 L 590 980 Z" fill="#5c4a3c" stroke={OL} strokeWidth={5} />
          <ellipse cx={740} cy={870} rx={180} ry={26} fill={`rgba(255,240,190,${pour})`} />
          {Array.from({ length: 26 }).map((_, i) => {
            const k = (t * 0.9 + i / 26) % 1;
            return <circle key={i} cx={740 + Math.cos(i * 2.4) * k * 360} cy={850 - Math.sin(i * 1.3 + 1) * k * 300 + k * k * 260} r={4} fill="#ffd27a" opacity={(1 - k) * pour} />;
          })}
          <g transform="translate(200 900)">
            <Figure x={0} y={0} s={1.2} hair="m" color="#4c5a72" hairColor="#b9a77f" t={t} mood="smile" />
          </g>
          {ten > 0 && (
            <g transform={`translate(1100 260) scale(${ten})`}>
              <rect x={-220} y={-70} width={440} height={140} rx={30} fill={C.white} stroke={C.metal} strokeWidth={6} />
              <text y={-6} textAnchor="middle" fontFamily={FONTS.display} fontSize={60} fill={C.ink}>
                10 лет
              </text>
              <text y={44} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={30} fill={C.inkSoft}>
                опытов
              </text>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const RisePath: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const steps = [
    { label: "14 лет: рудник", b: 0.1, sign: false },
    { label: "30 лет: свой рудник", b: 0.55, sign: false },
    { label: "разорившийся завод", b: 1, sign: false },
    { label: "Руда Риардена", b: 1.4, sign: true },
    { label: "Риарден-Уголь", b: 1.6, sign: true },
    { label: "Риарден Стил", b: 1.8, sign: true },
  ];
  const cheer = ramp(t, at(c, 2), 0.6);
  return (
    <g>
      {steps.map((s, i) => {
        const k = pop(t, at(c, s.b));
        if (k <= 0.001) return null;
        const x = 640 + i * 200;
        const y = 880 - i * 110;
        return <rect key={`p${i}`} x={x - 90} y={y} width={180} height={1000 - y} fill={i < 3 ? "#d6cbb8" : "#c5ebe5"} stroke={OL} strokeWidth={4} opacity={clamp01(k * 1.5)} />;
      })}
      {steps.map((s, i) => {
        const k = pop(t, at(c, s.b));
        if (k <= 0.001) return null;
        const x = 640 + i * 200;
        const y = 880 - i * 110;
        return (
          <g key={`l${i}`} transform={`translate(${x} ${y - 36}) scale(${k})`} opacity={clamp01(k * 1.5)}>
            <rect x={-130} y={-30} width={260} height={60} rx={s.sign ? 8 : 30} fill={s.sign ? OL : C.white} stroke={OL} strokeWidth={4} />
            <text y={10} textAnchor="middle" fontFamily={s.sign ? FONTS.condensed : FONTS.heavy} fontWeight={800} fontSize={s.sign ? 30 : 22} fill={s.sign ? C.fire : C.ink}>
              {s.label}
            </text>
          </g>
        );
      })}
      {(() => {
        let i = 0;
        steps.forEach((s, j) => {
          if (t >= at(c, s.b)) i = j;
        });
        const x = 640 + i * 200;
        const y = 880 - i * 110;
        return (
          <g transform={`translate(${x} ${y - 72})`}>
            <Figure x={0} y={0} s={0.8} hair="m" color="#4c5a72" hairColor="#b9a77f" t={t} arms={cheer} mood="smile" />
          </g>
        );
      })()}
    </g>
  );
};

export const BraceletScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = pop(t, 0.2);
  const chain = ramp(t, at(c, 2.3), 1.2);
  const blame = [
    { text: "опять опоздал", b: 1.1, x: 220, y: 230 },
    { text: "«только деньги»", b: 1.4, x: 980, y: 210 },
    { text: "эгоистичный подарок", b: 1.7, x: 560, y: 860 },
  ];
  const two = pop(t, at(c, 3));
  return (
    <g>
      {/* люстра */}
      <g opacity={k}>
        <line x1={640} y1={0} x2={640} y2={150} stroke={OL} strokeWidth={4} />
        <path d="M 560 150 L 720 150 L 690 190 L 590 190 Z" fill={C.gold} stroke={OL} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={580 + i * 30} cy={205} r={10} fill="#fff7c9" opacity={0.7 + 0.3 * Math.sin(t * 3 + i)} />
        ))}
      </g>
      <g transform={`translate(640 520) scale(${k * 1.5})`}>
        <Bracelet x={0} y={0} t={t} shine={1 - chain} chain={chain} />
      </g>
      {chain > 0.6 && (
        <g opacity={(chain - 0.6) / 0.4}>
          <Tag x={640} y={680} text="«цепь»" size={50} color="#f5d0d6" />
        </g>
      )}
      {blame.map((b, i) => (
        <Bubble key={i} x={b.x} y={b.y} w={b.text.length * 20 + 80} h={86} text={b.text} size={32} k={pop(t, at(c, b.b)) * (1 - ramp(t, at(c, 2.2), 0.4))} />
      ))}
      {two > 0 && (
        <g transform={`translate(640 870) scale(${two})`}>
          <rect x={-560} y={-44} width={540} height={88} rx={44} fill="#c5ebe5" stroke={OL} strokeWidth={4} />
          <text x={-290} y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.ink}>
            10 лет труда
          </text>
          <rect x={20} y={-44} width={540} height={88} rx={44} fill="#f5d0d6" stroke={OL} strokeWidth={4} />
          <text x={290} y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.ink}>
            знак власти
          </text>
        </g>
      )}
    </g>
  );
};

export const BraceletSwap: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const swap = ramp(t, at(c, 1.2), 1.4);
  const silence = pop(t, at(c, 1.6));
  const tags = pop(t, at(c, 2));
  const ax = interpolate(swap, [0, 1], [-300, 300], { easing: ease });
  const arc = Math.sin(swap * Math.PI) * 160;
  return (
    <g>
      <g transform={`translate(${cx} 520)`}>
        <g transform={`translate(${ax} ${-arc})`}>
          <Bracelet x={0} y={0} s={0.9} t={t} color={C.metal} shine={0.3} />
          <Tag x={0} y={120} text="риарден-металл" size={30} color="#c5ebe5" />
        </g>
        <g transform={`translate(${-ax} ${arc})`}>
          <Bracelet x={0} y={0} s={0.9} t={-t} diamond shine={1} />
          <Tag x={0} y={120} text="бриллианты" size={30} color="#e6f0ff" />
        </g>
      </g>
      {silence > 0 && (
        <g transform={`translate(${cx} 230) scale(${silence})`} opacity={1 - ramp(t, at(c, 2), 0.3)}>
          <rect x={-260} y={-44} width={520} height={88} rx={44} fill={C.ink} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={36} fill={C.white}>
            мёртвая тишина…
          </text>
        </g>
      )}
      {tags > 0 && (
        <g transform={`translate(${cx} 210) scale(${tags})`}>
          <rect x={-470} y={-50} width={440} height={100} rx={50} fill={C.white} stroke={OL} strokeWidth={4} />
          <text x={-250} y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={46} fill={C.inkSoft}>
            цена
          </text>
          <text y={18} textAnchor="middle" fontFamily={FONTS.display} fontSize={56} fill={C.coral}>
            ≠
          </text>
          <rect x={30} y={-50} width={440} height={100} rx={50} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text x={250} y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={46} fill={C.ink}>
            ценность
          </text>
        </g>
      )}
    </g>
  );
};

export const Guilt: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const k = pop(t, 0.2);
  const weight = ramp(t, 0.6, 1.4) * (1 - 0.3 * ramp(t, at(c, 3), 1));
  const words = [
    { text: "эгоист", b: 1.2, x: 300, y: 260 },
    { text: "антиобщественно", b: 1.5, x: 980, y: 240 },
    { text: "думает только о работе", b: 2.2, x: 620, y: 150 },
  ];
  const goal = pop(t, at(c, 1.5));
  const weak = pop(t, at(c, 3));
  return (
    <g>
      <g transform={`translate(640 ${880 + weight * 14})`} opacity={k}>
        <Figure x={0} y={0} s={1.35} hair="m" color="#4c5a72" hairColor="#b9a77f" t={t} arms={0.85} mood="sad" />
        <g transform={`translate(0 ${-300 + weight * 20})`}>
          <path d="M -150 0 L 150 0 L 120 -150 L -120 -150 Z" fill="#6b7280" stroke={OL} strokeWidth={6} />
          <text y={-58} textAnchor="middle" fontFamily={FONTS.display} fontSize={56} fill={C.white}>
            ВИНА
          </text>
        </g>
      </g>
      {words.map((w, i) => (
        <Bubble key={i} x={w.x} y={w.y} w={w.text.length * 19 + 80} h={84} text={w.text} size={32} k={pop(t, at(c, w.b))} fill="#fdecef" />
      ))}
      {goal > 0 && (
        <g transform={`translate(1060 520) scale(${goal})`}>
          <rect x={-230} y={-60} width={460} height={120} rx={30} fill={C.white} stroke={C.metal} strokeWidth={6} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
            цель: сталь
          </text>
          <text y={36} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={32} fill={C.ink}>
            и деньги
          </text>
        </g>
      )}
      {weak > 0 && (
        <g transform={`translate(1060 720) scale(${weak})`}>
          <rect x={-260} y={-50} width={520} height={100} rx={30} fill="#eef3fa" stroke={OL} strokeWidth={4} />
          <text y={-6} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
            но не понимает близких:
          </text>
          <text y={30} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={28} fill={C.inkSoft}>
            жена — «абстракция»
          </text>
        </g>
      )}
    </g>
  );
};

export const Deal: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const k = pop(t, 0.2);
  const months = ramp(t, at(c, 0.4), 0.8);
  const price = pop(t, at(c, 0.75));
  const shake = pop(t, at(c, 1.2));
  const ideal = pop(t, at(c, 2));
  const tilt = Math.sin(t * 1.4) * 2;
  return (
    <g>
      <g transform={`translate(${cx} 470) scale(${k})`}>
        <rect x={-20} y={0} width={40} height={340} fill={C.steelDark} stroke={OL} strokeWidth={4} />
        <g transform={`rotate(${tilt})`}>
          <rect x={-420} y={-14} width={840} height={28} rx={14} fill={C.steel} stroke={OL} strokeWidth={4} />
          <g transform="translate(-380 0)">
            <path d="M -130 120 L 0 0 L 130 120" fill="none" stroke={OL} strokeWidth={4} />
            <rect x={-160} y={120} width={320} height={30} rx={12} fill="#d6cbb8" stroke={OL} strokeWidth={4} />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={-130} y={84 - i * 26} width={260} height={18} rx={6} fill={C.metal} stroke={OL} strokeWidth={3} />
            ))}
          </g>
          <g transform="translate(380 0)">
            <path d="M -130 120 L 0 0 L 130 120" fill="none" stroke={OL} strokeWidth={4} />
            <rect x={-160} y={120} width={320} height={30} rx={12} fill="#d6cbb8" stroke={OL} strokeWidth={4} />
            {[0, 1, 2, 3].map((i) => (
              <Coin key={i} x={-75 + i * 50} y={90 - (i % 2) * 20} r={30} t={t + i} />
            ))}
          </g>
        </g>
      </g>
      <g transform={`translate(${cx - 380} 260)`} opacity={months}>
        <rect x={-150} y={-50} width={300} height={100} rx={20} fill={C.white} stroke={OL} strokeWidth={4} />
        <text x={-60} y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={44} fill={C.inkSoft} textDecoration="line-through">
          12
        </text>
        <text x={40} y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={52} fill={C.metalDeep}>
          9
        </text>
        <text x={110} y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={24} fill={C.inkSoft}>
          мес.
        </text>
      </g>
      {price > 0 && (
        <g transform={`translate(${cx + 380} 260) scale(${price})`}>
          <rect x={-180} y={-50} width={360} height={100} rx={20} fill={C.yellow} stroke={OL} strokeWidth={4} />
          <text y={16} textAnchor="middle" fontFamily={FONTS.display} fontSize={40} fill={C.ink}>
            +$20 / т
          </text>
        </g>
      )}
      {shake > 0 && (
        <g transform={`translate(${cx} 150) scale(${shake})`} opacity={1 - ideal}>
          <rect x={-330} y={-46} width={660} height={92} rx={46} fill={C.ink} />
          <text y={15} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={36} fill={C.yellow}>
            «я не попрошайка»
          </text>
        </g>
      )}
      {ideal > 0 && (
        <g transform={`translate(${cx} 150) scale(${ideal})`}>
          <rect x={-420} y={-40} width={840} height={80} rx={40} fill={C.white} stroke={C.metal} strokeWidth={5} />
          <text y={13} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.ink}>
            честная сделка равных — без льгот
          </text>
        </g>
      )}
    </g>
  );
};

export const WorldMovers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const lift = ramp(t, 0.3, 2.4);
  const dreams = [
    { text: "мосты", b: 0.5 },
    { text: "заборы на 200 лет", b: 0.7 },
    { text: "лайнеры", b: 0.85 },
    { text: "самолёты", b: 0.95 },
  ];
  const villains = pop(t, at(c, 1)) * (1 - ramp(t, at(c, 2), 0.3));
  const move = pop(t, at(c, 2));
  const atlas = pop(t, at(c, 3));
  return (
    <g>
      {/* кран переносит рельсы */}
      <g>
        <rect x={140} y={140} width={30} height={700} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
        <rect x={140} y={130} width={900} height={30} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
        {(() => {
          const x = 260 + lift * 600;
          const y = 300 + Math.sin(lift * Math.PI) * -60 + (1 - lift) * 300;
          return (
            <g>
              <line x1={x} y1={160} x2={x} y2={y} stroke={OL} strokeWidth={4} />
              <rect x={x - 70} y={y} width={140} height={20} rx={4} fill={C.steelDark} />
              {[0, 1, 2].map((i) => (
                <rect key={i} x={x - 150} y={y + 24 + i * 16} width={300} height={12} rx={4} fill={C.metal} stroke={OL} strokeWidth={2} />
              ))}
            </g>
          );
        })()}
        <Train x={880} y={880} s={0.8} cars={3} t={t * 0.3} color={C.skyDeep} label="TT" />
        <Track x1={60} x2={1380} y={890} shift={0} />
      </g>
      {dreams.map((d, i) => (
        <Pop key={i} t={t} at={at(c, d.b)} x={1150} y={300 + i * 90}>
          <Tag x={0} y={0} text={d.text} size={30} color={i % 2 ? "#c5ebe5" : C.white} />
        </Pop>
      ))}
      {villains > 0 && (
        <g transform={`translate(640 500) scale(${villains})`}>
          <rect x={-440} y={-60} width={880} height={120} rx={30} fill="#fdecef" stroke={OL} strokeWidth={4} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={38} fill={C.ink}>
            «парочка негодяев» без «духовных целей»?
          </text>
        </g>
      )}
      {move > 0 && (
        <g transform={`translate(640 520) scale(${move})`}>
          <circle r={150} fill="#a9d6f5" stroke={OL} strokeWidth={6} />
          <path d="M -120 -40 Q -40 -90 30 -40 Q 80 0 130 -30 M -130 40 Q -40 80 40 50 Q 90 30 120 60" stroke={C.green} strokeWidth={30} fill="none" strokeLinecap="round" />
          <g transform={`rotate(${t * 30})`}>
            <circle r={176} fill="none" stroke={C.metal} strokeWidth={10} strokeDasharray="22 14" />
          </g>
          <rect x={-330} y={180} width={660} height={90} rx={45} fill={C.ink} />
          <text y={240} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={900} fontSize={42} fill={C.yellow}>
            «мы движем миром»
          </text>
        </g>
      )}
      {atlas > 0 && (
        <g transform={`translate(640 160) scale(${atlas})`}>
          <rect x={-480} y={-44} width={960} height={88} rx={44} fill={C.white} stroke={OL} strokeWidth={4} />
          <text y={14} textAnchor="middle" fontFamily={FONTS.heavy} fontWeight={800} fontSize={32} fill={C.inkSoft}>
            Атлант держит небо — наше наблюдение, не вывод книги
          </text>
        </g>
      )}
    </g>
  );
};

