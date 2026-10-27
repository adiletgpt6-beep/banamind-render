// Дорога первая «Создали причины»: аптека, живое как мазь, муха, один мастер.
import React from "react";
import { interpolate } from "remotion";
import { C } from "../theme";
import { Drop, Fly, Flower, Jar, OL, Sun } from "./draw";
import { zoneX } from "./intro";
import { Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

const JAR_COLORS = ["#ff8fa3", "#7fd1ae", "#ffd166", "#9bb8ff", "#c79bff", "#ffad7a", "#7ad3e6", "#e6a3d4"];

const Bowl: React.FC<{ x: number; y: number; fill: number; color?: string; messy?: boolean }> = ({ x, y, fill, color = "#ffb3c1", messy }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -90 -40 Q -90 50 0 50 Q 90 50 90 -40 Z" fill="#fff" stroke={OL} strokeWidth={5} />
    {fill > 0 && <ellipse cx={0} cy={-40 + (1 - fill) * 30} rx={84 - (1 - fill) * 14} ry={16} fill={messy ? "#8d7b68" : color} />}
    <ellipse cx={0} cy={-40} rx={90} ry={18} fill="none" stroke={OL} strokeWidth={5} />
  </g>
);

export const Pharmacy: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shelf = pop(t, 0.2);
  const wind = ramp(t, at(c, 7), 1.2);
  const fall = ramp(t, at(c, 7.5), 1.4);
  const doses = [
    { b: 4, label: "1–2 г", jar: 1 },
    { b: 4.33, label: "3–4 г", jar: 7 },
    { b: 4.66, label: "6–7 г", jar: 12 },
  ];
  const bowlFill = ramp(t, at(c, 4), 2.5);
  return (
    <g>
      {/* полки с баночками */}
      <g transform={`translate(950 470) scale(${shelf})`} opacity={clamp01(shelf * 2)}>
        <Panel x={-340} y={-300} w={680} h={600} fill="#fff7ea" />
        {[0, 1, 2].map((row) => (
          <rect key={row} x={-320} y={-130 + row * 180} width={640} height={14} rx={7} fill="#c98b4a" />
        ))}
        {Array.from({ length: 15 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const jx = -250 + col * 125;
          const jy = -134 + row * 180;
          const myFall = clamp01(fall * 1.6 - ((i * 7) % 10) / 16);
          const tilt = wob(t, i, 2) * wind + myFall * (i % 2 ? 95 : -95);
          const dy = myFall * (row === 2 ? 30 : 60);
          return <Jar key={i} x={jx + myFall * (i % 2 ? 30 : -30)} y={jy + dy} color={JAR_COLORS[i % 8]} level={0.4 + ((i * 13) % 5) / 10} s={0.95} tilt={tilt} />;
        })}
        <Pop t={t} at={at(c, 5)} x={0} y={-250}>
          <Tag x={0} y={0} text="больше 50 баночек" size={30} color={C.yellow} />
        </Pop>
        {/* ветер */}
        {wind > 0 &&
          [0, 1, 2].map((i) => {
            const x0 = -420 + ((t * 600 + i * 230) % 900);
            return <path key={i} d={`M ${x0} ${-160 + i * 160} q 60 -30 120 0 t 120 0`} stroke="#9cb3c9" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8 * wind} />;
          })}
      </g>
      {/* мазь и лекарство */}
      <Pop t={t} at={at(c, 1)} x={1560} y={360}>
        <g>
          <Bowl x={0} y={0} fill={fall > 0.3 ? 1 : bowlFill} messy={fall > 0.3} />
          <Txt x={0} y={100} size={32}>
            живительная мазь
          </Txt>
        </g>
      </Pop>
      <Pop t={t} at={at(c, 1.5)} x={1560} y={650}>
        <g>
          <path d="M -40 -110 L 40 -110 L 40 -80 Q 70 -60 70 -20 L 70 60 Q 70 80 50 80 L -50 80 Q -70 80 -70 60 L -70 -20 Q -70 -60 -40 -80 Z" fill="#cdeaff" stroke={OL} strokeWidth={5} />
          <rect x={-46} y={-140} width={92} height={32} rx={8} fill={C.coral} stroke={OL} strokeWidth={4} />
          <path d="M -12 -10 L 12 -10 L 12 10 L 32 10 L 32 34 L 12 34 L 12 54 L -12 54 L -12 34 L -32 34 L -32 10 L -12 10 Z" fill={C.red} />
          <Txt x={0} y={130} size={32}>
            целебное лекарство
          </Txt>
          <Check x={90} y={-60} s={44} k={ramp(t, at(c, 6), 0.5)} />
        </g>
      </Pop>
      {/* готовые экземпляры */}
      {[0, 1, 2, 3].map((i) => (
        <Pop key={i} t={t} at={at(c, 2) + i * 0.15} x={1740 + (i % 2) * 52} y={500 + Math.floor(i / 2) * 50}>
          <g>
            <rect x={-22} y={-26} width={44} height={36} rx={8} fill="#ffb3c1" stroke={OL} strokeWidth={3} />
            <rect x={-24} y={-34} width={48} height={12} rx={4} fill="#fff" stroke={OL} strokeWidth={3} />
          </g>
        </Pop>
      ))}
      {/* точные дозы */}
      {doses.map((d, i) => {
        const k = ramp(t, at(c, d.b), 0.9);
        if (k <= 0 || fall > 0.2) return null;
        const row = Math.floor(d.jar / 5);
        const col = d.jar % 5;
        const sx = 950 - 250 + col * 125;
        const sy = 470 - 134 + row * 180 - 60;
        const x = interpolate(k, [0, 1], [sx, 1560]);
        const y = interpolate(k, [0, 0.5, 1], [sy, Math.min(sy, 260) - 60, 330]);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={16} fill={JAR_COLORS[d.jar % 8]} stroke={OL} strokeWidth={3} />
            <Tag x={x} y={y - 40} text={d.label} size={28} color={C.white} />
          </g>
        );
      })}
      <Pop t={t} at={at(c, 5.5)} x={1560} y={200}>
        <g>
          <Tag x={0} y={0} text="±1 г — не работает!" size={30} color="#ffd6d6" />
        </g>
      </Pop>
      <Cross x={950} y={760} s={150} k={ramp(t, at(c, 9), 0.6)} />
      <Pop t={t} at={at(c, 9.3)} x={950} y={880}>
        <Tag x={0} y={0} text="само так не смешается!" size={38} color={C.yellow} />
      </Pop>
    </g>
  );
};

const Bunny: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(t * 2.5)) * -8}) scale(${s})`}>
    <ellipse cx={-26} cy={-150} rx={18} ry={52} fill="#fff" stroke={OL} strokeWidth={4} transform={`rotate(${-10 + wob(t, 1, 4)} -26 -110)`} />
    <ellipse cx={26} cy={-150} rx={18} ry={52} fill="#fff" stroke={OL} strokeWidth={4} transform={`rotate(${10 - wob(t, 2, 4)} 26 -110)`} />
    <ellipse cx={0} cy={-20} rx={70} ry={60} fill="#fff" stroke={OL} strokeWidth={4} />
    <circle cx={0} cy={-90} r={50} fill="#fff" stroke={OL} strokeWidth={4} />
    <circle cx={-18} cy={-96} r={6} fill={OL} />
    <circle cx={18} cy={-96} r={6} fill={OL} />
    <ellipse cx={0} cy={-80} rx={7} ry={5} fill="#ff8fa3" />
    <ellipse cx={-30} cy={-76} rx={10} ry={6} fill="#ffb3c1" opacity={0.7} />
    <ellipse cx={30} cy={-76} rx={10} ry={6} fill="#ffb3c1" opacity={0.7} />
  </g>
);

export const LifeMix: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const sub = ["H", "O", "C", "N", "Ca", "Fe", "P", "K"];
  const flow = ramp(t, at(c, 2), 1.5);
  return (
    <g>
      <Pop t={t} at={0.3} x={x - 200} y={640}>
        <Bunny x={0} y={0} s={1.3} t={t} />
      </Pop>
      <Pop t={t} at={at(c, 1)} x={x + 220} y={700}>
        <Flower x={0} y={0} color="#9bb8ff" s={1.6} t={t} kind={1} />
      </Pop>
      {sub.map((s, i) => {
        const a = (i / sub.length) * Math.PI * 2 + t * 0.25;
        const rx = x + Math.cos(a) * 420;
        const ry = 430 + Math.sin(a) * 250;
        const target = i % 2 ? [x + 220, 520] : [x - 200, 520];
        const k = clamp01(flow * 1.3 - i * 0.04);
        const bx = rx + (target[0] - rx) * k * 0.5;
        const by = ry + (target[1] - ry) * k * 0.5;
        return (
          <Pop key={i} t={t} at={at(c, 2) + i * 0.08} x={bx} y={by}>
            <g>
              <circle r={36} fill={JAR_COLORS[i]} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={13} size={34} weight={900}>
                {s}
              </Txt>
            </g>
          </Pop>
        );
      })}
      <g opacity={1 - ramp(t, at(c, 4) - 0.3, 0.3)}>
        <Pop t={t} at={at(c, 2.5)} x={x} y={170}>
          <Tag x={0} y={0} text="каждое — в точной мере" size={40} color={C.white} />
        </Pop>
      </g>
      {/* слепые причины не знают меры */}
      <g opacity={1 - ramp(t, at(c, 6) - 0.3, 0.3)}>
      <Pop t={t} at={at(c, 4)} x={x} y={190}>
        <g>
          <Panel x={-330} y={-80} w={660} h={150} fill="#f1f5f9" />
          {[-220, -80, 60, 200].map((dx, i) => (
            <g key={i} transform={`translate(${dx} 0)`}>
              {i === 0 && <Drop x={0} y={0} s={0.9} glint={0} />}
              {i === 1 && <path d="M -40 10 q 20 -30 40 0 t 40 0" stroke="#7d93ab" strokeWidth={10} fill="none" strokeLinecap="round" />}
              {i === 2 && <circle r={34} fill="#b98b5a" stroke={OL} strokeWidth={4} />}
              {i === 3 && <path d="M 0 -40 Q 30 0 0 34 Q -30 0 0 -40 Z" fill="#ff9f43" stroke={OL} strokeWidth={4} />}
              <Txt x={0} y={58} size={40} color={C.red} weight={900}>
                ?
              </Txt>
            </g>
          ))}
        </g>
      </Pop>
      </g>
      {["мудрость", "знание", "воля"].map((w, i) => (
        <Pop key={w} t={t} at={at(c, 5) + i * 0.35} x={x - 300 + i * 300} y={880}>
          <Tag x={0} y={0} text={w} size={40} color={C.yellow} />
        </Pop>
      ))}
      <Pop t={t} at={at(c, 6)} x={x} y={170}>
        <g>
          <rect x={-330} y={-60} width={660} height={100} rx={30} fill={C.green} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={8} size={40} color="#fff">
            Вселенная — огромная аптека
          </Txt>
        </g>
      </Pop>
    </g>
  );
};

export const FlyScene: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const crowd = ramp(t, at(c, 3), 1.6);
  const zoom = ramp(t, at(c, 4), 1);
  const causes = [
    (k: number) => <Sun x={0} y={0} r={46} t={t} key={k} />,
    (k: number) => (
      <g key={k}>
        <ellipse cx={0} cy={0} rx={70} ry={40} fill="#e8eef5" stroke={OL} strokeWidth={4} />
        <path d="M -30 50 l -8 22 M 0 50 l -8 22 M 30 50 l -8 22" stroke={C.skyDeep} strokeWidth={6} strokeLinecap="round" />
      </g>
    ),
    (k: number) => <circle key={k} r={50} fill="#b98b5a" stroke={OL} strokeWidth={4} />,
    (k: number) => <Drop key={k} x={0} y={0} s={1.2} glint={0} />,
    (k: number) => <path key={k} d="M -50 0 q 25 -30 50 0 t 50 0" stroke="#7d93ab" strokeWidth={12} fill="none" strokeLinecap="round" />,
    (k: number) => <path key={k} d="M 0 -50 Q 40 0 0 44 Q -40 0 0 -50 Z" fill="#ff9f43" stroke={OL} strokeWidth={4} />,
  ];
  const fx = x - 80;
  const fy = 500;
  return (
    <g>
      <Pop t={t} at={0.2} x={fx} y={fy}>
        <Fly x={0} y={0} s={2.6} t={t} />
      </Pop>
      {causes.map((draw, i) => {
        const a = (i / causes.length) * Math.PI * 2 - Math.PI / 2;
        const ox = fx + Math.cos(a) * 400;
        const oy = fy + Math.sin(a) * 300;
        const k = clamp01(crowd * 1.2 - i * 0.05);
        const px = ox + (fx - ox) * k * 0.82;
        const py = oy + (fy - oy) * k * 0.82;
        const sc = 1 - k * 0.55;
        return (
          <Pop key={i} t={t} at={at(c, 1) + i * 0.15} x={px + (k > 0.6 ? wob(t * 3, i, 6) : 0)} y={py}>
            <g transform={`scale(${sc})`}>
              {draw(i)}
              <line x1={0} y1={0} x2={(fx - px) / sc} y2={(fy - py) / sc} stroke="#9aa5b8" strokeWidth={3} strokeDasharray="8 10" opacity={1 - k} />
            </g>
          </Pop>
        );
      })}
      {/* лупа — клеточка глаза */}
      {zoom > 0 && (
        <g transform={`translate(${x + 380} 330) scale(${zoom})`}>
          <line x1={-150} y1={60} x2={-300} y2={150} stroke={OL} strokeWidth={6} strokeDasharray="10 10" />
          <circle r={170} fill="#fff7f7" stroke={OL} strokeWidth={8} />
          <circle r={170} fill="none" stroke="#c9d6e3" strokeWidth={22} opacity={0.6} />
          {Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2;
            return <polygon key={i} points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" transform={`translate(${Math.cos(a) * 80} ${Math.sin(a) * 80})`} fill="#ffd0d0" stroke="#c0392b" strokeWidth={3} />;
          })}
          <polygon points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" fill="#ffd0d0" stroke="#c0392b" strokeWidth={3} />
          {crowd > 0.5 &&
            [0, 1, 2, 3, 4].map((i) => (
              <g key={i} transform={`translate(${-60 + i * 30 + wob(t * 4, i, 4)} ${10 + (i % 2) * 22}) scale(0.4)`}>
                {causes[i](i)}
              </g>
            ))}
          <Txt x={0} y={225} size={30}>
            клеточка глаза
          </Txt>
        </g>
      )}
      <Pop t={t} at={at(c, 6)} x={fx} y={850}>
        <Tag x={0} y={0} text="весь мир — внутри мухи?!" size={40} color={C.yellow} />
      </Pop>
      <Cross x={fx + 220} y={260} s={110} k={ramp(t, at(c, 6.4), 0.6)} />
    </g>
  );
};

// цветок, нарисованный одной кистью, и каракули сотни рук
export const OneMaker: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const x = zoneX(c.p.host);
  const draw = ramp(t, at(c, 1), 3);
  const mess = ramp(t, at(c, 2), 3);
  const inside = ramp(t, at(c, 4), 1.5);
  const showArt = 1 - ramp(t, at(c, 4) - 0.4, 0.5);
  const P = "M 0 120 L 0 -20 M 0 30 Q -50 10 -70 40 Q -30 60 0 30 M 0 -20 m -46 0 a 46 46 0 1 0 92 0 a 46 46 0 1 0 -92 0";
  return (
    <g>
      {showArt > 0 && (
        <g opacity={showArt}>
          <g transform={`translate(${x - 270} 470)`}>
            <Panel x={-220} y={-250} w={440} h={500} fill="#fffdf7" />
            <path d={P} fill="none" stroke={C.greenDeep} strokeWidth={14} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - draw)} />
            <circle cx={0} cy={-20} r={30 * draw} fill={C.coral} opacity={draw} />
            <g transform={`translate(${60 - 60 * draw} ${120 - 160 * draw}) rotate(30)`}>
              <rect x={-8} y={-70} width={16} height={70} rx={4} fill={C.yellow} stroke={OL} strokeWidth={3} />
              <path d="M -8 0 L 0 18 L 8 0 Z" fill={OL} />
            </g>
            <Txt x={0} y={210} size={34}>
              один мастер
            </Txt>
            <Check x={150} y={-200} s={46} k={ramp(t, at(c, 1.7), 0.5)} />
          </g>
          <g transform={`translate(${x + 270} 470)`}>
            <Panel x={-220} y={-250} w={440} h={500} fill="#fffdf7" />
            {mess > 0 &&
              Array.from({ length: 12 }).map((_, i) => {
                const len = 300 * mess;
                return (
                  <path
                    key={i}
                    d={`M ${-150 + ((i * 53) % 300)} ${-170 + ((i * 97) % 300)} q ${60 - ((i * 31) % 120)} ${-80 + ((i * 17) % 160)} ${120 - ((i * 71) % 240)} ${((i * 29) % 140) - 70} t ${((i * 43) % 160) - 80} ${((i * 37) % 120) - 60}`}
                    fill="none"
                    stroke={JAR_COLORS[i % 8]}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={len + " 999"}
                  />
                );
              })}
            {Array.from({ length: 7 }).map((_, i) => (
              <g key={i} transform={`translate(${-160 + i * 52 + wob(t * 5, i, 10)} ${-170 + ((i * 61) % 200) + wob(t * 4, i + 3, 10)}) rotate(${i * 40})`} opacity={clamp01(mess * 3)}>
                <rect x={-6} y={-46} width={12} height={46} rx={3} fill={JAR_COLORS[(i + 3) % 8]} stroke={OL} strokeWidth={3} />
              </g>
            ))}
            <Txt x={0} y={210} size={34}>
              сто слепых рук
            </Txt>
            <Cross x={150} y={-200} s={70} k={ramp(t, at(c, 3), 0.6)} />
          </g>
        </g>
      )}
      {inside > 0 && (
        <g opacity={inside} transform={`translate(${x} 470)`}>
          <ellipse rx={300} ry={230} fill="#fff" stroke={OL} strokeWidth={8} />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r = 60 + (i % 4) * 34;
            return <circle key={i} cx={Math.cos(a + t * 0.2) * r} cy={Math.sin(a + t * 0.2) * r * 0.7} r={14 - (i % 4) * 2} fill={JAR_COLORS[i % 8]} stroke={OL} strokeWidth={2} />;
          })}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${-520} ${-120 + i * 120} l 170 ${20 - i * 20}`} stroke="#7d93ab" strokeWidth={12} strokeLinecap="round" opacity={0.8} />
          ))}
          <Tag x={-430} y={-200} text="снаружи" size={30} color={C.white} />
          <Tag x={0} y={-270} text="внутри — ещё тоньше" size={34} color={C.yellow} />
          <Pop t={t} at={at(c, 6)} x={360} y={170}>
            <g>
              <circle r={90} fill="#fff" stroke={OL} strokeWidth={6} />
              <g transform="scale(0.55)">
                <Fly x={0} y={10} t={t} />
              </g>
              <path d="M 64 64 L 120 120" stroke={OL} strokeWidth={14} strokeLinecap="round" />
            </g>
          </Pop>
        </g>
      )}
      <Pop t={t} at={at(c, 8)} x={x} y={860}>
        <Tag x={0} y={0} text="ответ: нужна точная мера" size={40} color={C.yellow} />
      </Pop>
    </g>
  );
};

