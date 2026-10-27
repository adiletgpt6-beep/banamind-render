// Основы: британские велосипедисты, сложные проценты привычек, долина разочарования,
// цели и системы, атомы, три слоя изменений, голоса за идентичность, петля привычки,
// четыре закона.
import React from "react";
import { interpolate } from "remotion";
import { C, FONT } from "../theme";
import { OL, Worker } from "./draw";
import { Arrow, Check, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Cat, Chip, Icon, IconTile, zoneX, type IconName } from "./parts";

// велосипедист (сбоку)
const Cyclist: React.FC<{ x: number; y: number; s?: number; t: number; color?: string }> = ({ x, y, s = 1, t, color = C.skyDeep }) => {
  const a = t * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-90, 90].map((wx) => (
        <g key={wx} transform={`translate(${wx} 0)`}>
          <circle r={56} fill="none" stroke={OL} strokeWidth={8} />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={0} y1={-50} x2={0} y2={50} stroke={OL} strokeWidth={3} transform={`rotate(${(a * 57.3) % 360 + i * 60})`} />
          ))}
        </g>
      ))}
      <path d="M -90 0 L -20 -80 L 60 -80 L 90 0 M -20 -80 L 0 0 L -90 0 M 60 -80 L 50 -110" stroke={color} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <rect x={-46} y={-100} width={52} height={14} rx={7} fill={OL} />
      {/* гонщик */}
      <path d={`M -16 -96 L 30 -170 M 30 -170 L 56 -112 M -16 -96 L ${Math.cos(a) * 26} ${Math.sin(a) * 26} `} stroke={OL} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d="M -16 -96 Q 0 -160 30 -172" stroke={color} strokeWidth={34} strokeLinecap="round" fill="none" />
      <circle cx={46} cy={-200} r={26} fill="#f2c79b" stroke={OL} strokeWidth={4} />
      <path d="M 18 -214 Q 46 -246 76 -210 Z" fill={C.red} stroke={OL} strokeWidth={4} />
    </g>
  );
};

export const Cycling: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const road = pop(t, 0.1);
  const tweak = ramp(t, at(c, 1), 0.4);
  const items: { icon: IconName; label: string }[] = [
    { icon: "star", label: "седло" },
    { icon: "moon", label: "подушка" },
    { icon: "water", label: "мытьё рук" },
    { icon: "eye", label: "белый фургон" },
  ];
  const win = ramp(t, at(c, 3), 0.6);
  const speed = 1 + 2 * win;
  return (
    <g>
      {/* дорога */}
      <g opacity={clamp01(road * 2)}>
        <rect x={cx - 640} y={770} width={1280} height={80} rx={20} fill="#9aa5b8" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={cx - 640 + ((i * 130 - t * 220 * speed) % 1560 + 1560) % 1560 - 140} y={804} width={70} height={10} rx={5} fill="#fff" />
        ))}
        <Cyclist x={cx - 250 + win * 160} y={714} s={1.05} t={t * speed} />
      </g>
      {/* «+1 %» во всём */}
      {items.map((it, i) => {
        const k = pop(t, at(c, 2) + i * 0.45 + 0.1);
        return (
          <g key={i}>
            <IconTile name={it.icon} x={cx - 420 + i * 280} y={300} k={k} label={it.label} />
            {k > 0.5 && (
              <g transform={`translate(${cx - 420 + i * 280 + 54} 230)`}>
                <circle r={34} fill={C.green} stroke={OL} strokeWidth={3} />
                <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#fff">
                  +1%
                </text>
              </g>
            )}
          </g>
        );
      })}
      {tweak > 0 && win < 1 && (
        <g transform={`translate(${cx + 330} 560)`} opacity={tweak * (1 - win)}>
          <Tag x={0} y={0} text="хотя бы на 1 %" size={38} color={C.yellow} />
        </g>
      )}
      {/* пьедестал и медали */}
      {win > 0 && (
        <g transform={`translate(${cx + 370} 760) scale(${win})`}>
          <rect x={-70} y={-150} width={140} height={150} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <rect x={-200} y={-100} width={130} height={100} fill="#dfe3ea" stroke={OL} strokeWidth={5} />
          <rect x={70} y={-70} width={130} height={70} fill="#e8b27a" stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-60} size={60} weight={900}>
            1
          </Txt>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${-110 + i * 110} ${-260 + Math.sin(t * 3 + i) * 8})`}>
              <path d="M -16 -50 L 0 -10 L 16 -50" stroke={C.skyDeep} strokeWidth={10} fill="none" />
              <circle r={30} fill={C.yellow} stroke={OL} strokeWidth={4} />
              <Icon name="star" x={0} y={0} s={0.5} color={C.yellowDeep} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

export const Compound: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const ax = pop(t, 0.1);
  const up = ramp(t, at(c, 0.3), 2.2);
  const down = ramp(t, at(c, 1), 1.2);
  const stamp = pop(t, at(c, 2.2));
  const plane = ramp(t, at(c, 3), 0.6);
  const fly = ramp(t, at(c, 3.25), 3);
  const chart = 1 - plane;
  const X0 = cx - 470;
  const Y0 = 760;
  const W = 820;
  const H = 520;
  const pts = (f: (x: number) => number, k: number) => {
    const n = Math.max(2, Math.round(60 * k));
    return Array.from({ length: n }, (_, i) => {
      const x = (i / 59) * 365;
      return `${X0 + (x / 365) * W},${Y0 - Math.min(1.05, f(x)) * H}`;
    }).join(" ");
  };
  // обе линии стартуют с одного уровня: +1 % в день → ≈ ×37, −1 % → почти ноль
  const upF = (d: number) => 0.14 + ((Math.pow(1.01, d) - 1) / 36.8) * 0.86;
  const downF = (d: number) => 0.14 * Math.pow(0.99, d);
  return (
    <g>
      {chart > 0 && (
        <g opacity={chart * clamp01(ax * 2)}>
          <line x1={X0} y1={Y0} x2={X0 + W + 40} y2={Y0} stroke={OL} strokeWidth={6} strokeLinecap="round" />
          <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 40} stroke={OL} strokeWidth={6} strokeLinecap="round" />
          <Txt x={X0 + W / 2} y={Y0 + 56} size={30} color={C.inkSoft}>
            один год
          </Txt>
          <polyline points={pts(upF, up)} fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={pts(downF, down)} fill="none" stroke={C.red} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          {up > 0.95 && (
            <g transform={`translate(${X0 + W + 10} ${Y0 - H})`}>
              <Chip x={70} y={-20} text="≈ ×37" size={44} color={C.green} textColor="#fff" />
              <Txt x={70} y={50} size={28} color={C.greenDeep}>
                +1 % в день
              </Txt>
            </g>
          )}
          {down > 0.95 && (
            <g transform={`translate(${X0 + W + 10} ${Y0 - 30})`}>
              <Chip x={70} y={-20} text="≈ 0" size={40} color={C.red} textColor="#fff" />
              <Txt x={70} y={44} size={28} color={C.red}>
                −1 % в день
              </Txt>
            </g>
          )}
          {stamp > 0 && (
            <g transform={`translate(${X0 + 300} ${Y0 - 330}) rotate(-8) scale(${stamp})`}>
              <rect x={-250} y={-56} width={500} height={112} rx={20} fill="#fff" stroke={C.coral} strokeWidth={7} />
              <Txt x={0} y={-6} size={34} color={C.coral} weight={900}>
                иллюстрация,
              </Txt>
              <Txt x={0} y={36} size={34} color={C.coral} weight={900}>
                а не обещание
              </Txt>
            </g>
          )}
        </g>
      )}
      {plane > 0 && (
        <g opacity={plane}>
          {/* карта: старт и два города */}
          <circle cx={cx - 480} cy={620} r={26} fill={C.ink} />
          <Txt x={cx - 480} y={690} size={30}>
            старт
          </Txt>
          {[
            { x: cx + 460, y: 240, label: "цель" },
            { x: cx + 460, y: 560, label: "другой город" },
          ].map((p, i) => (
            <g key={i}>
              <Icon name="pin" x={p.x} y={p.y - 30} s={1.3} color={i === 0 ? C.green : C.red} />
              <Txt x={p.x} y={p.y + 50} size={30}>
                {p.label}
              </Txt>
            </g>
          ))}
          <path d={`M ${cx - 480} 620 L ${cx + 460} 240`} stroke={C.green} strokeWidth={6} strokeDasharray="18 14" fill="none" />
          <path d={`M ${cx - 480} 620 L ${cx + 460} 560`} stroke={C.red} strokeWidth={6} strokeDasharray="18 14" fill="none" opacity={fly} />
          <path d={`M ${cx - 380} 580 A 100 100 0 0 1 ${cx - 380} 612`} stroke={OL} strokeWidth={4} fill="none" opacity={fly} />
          <Txt x={cx - 330} y={606} size={26} opacity={fly}>
            3,5°
          </Txt>
          {(() => {
            const px = interpolate(fly, [0, 1], [cx - 480, cx + 440]);
            const py = interpolate(fly, [0, 1], [620, 562]);
            return (
              <g transform={`translate(${px} ${py - 30}) rotate(-4)`}>
                <path d="M -60 0 L 60 -8 Q 76 -6 70 6 L -60 10 Z" fill="#fff" stroke={OL} strokeWidth={4} />
                <path d="M -6 -2 L -30 -44 L -10 -44 L 20 -4 Z M -6 6 L -26 40 L -6 40 L 20 6 Z M -56 0 L -70 -26 L -56 -26 L -44 -2 Z" fill={C.skyDeep} stroke={OL} strokeWidth={3} />
              </g>
            );
          })()}
          <Pop t={t} at={at(c, 3.7)} x={cx} y={820}>
            <Tag x={0} y={0} text="маленький поворот руля" size={36} color={C.yellow} />
          </Pop>
        </g>
      )}
    </g>
  );
};

export const Plateau: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const X0 = cx - 520;
  const Y0 = 700;
  const W = 760;
  const H = 440;
  const exp = ramp(t, at(c, 0.3), 1);
  const real = ramp(t, at(c, 0.6), 1.6);
  const valley = ramp(t, at(c, 1), 0.6);
  const bamboo = ramp(t, at(c, 2), 0.5);
  const grow = ramp(t, at(c, 2.3), 2);
  const stone = ramp(t, at(c, 2.5), 0.5);
  const crack = ramp(t, at(c, 2.85), 0.3);
  const plateau = ramp(t, at(c, 3), 0.5);
  const curve = (x: number) => (x < 0.6 ? 0.08 * x : 0.048 + Math.pow((x - 0.6) / 0.4, 2.2) * 0.95);
  const n = Math.max(2, Math.round(50 * real));
  const pts = Array.from({ length: n }, (_, i) => {
    const x = i / 49;
    return `${X0 + x * W},${Y0 - curve(x) * H}`;
  }).join(" ");
  const hit = Math.sin(t * 9) > 0.6 ? 1 : 0;
  const chartOp = 1 - bamboo;
  return (
    <g>
      <g opacity={chartOp}>
        <line x1={X0} y1={Y0} x2={X0 + W + 30} y2={Y0} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 - H - 30} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        <Txt x={X0 + W - 20} y={Y0 + 50} size={28} color={C.inkSoft}>
          усилия
        </Txt>
        <Txt x={X0 - 10} y={Y0 - H - 50} size={28} color={C.inkSoft} anchor="start">
          результат
        </Txt>
        <line x1={X0} y1={Y0} x2={X0 + W * exp} y2={Y0 - H * 0.8 * exp} stroke={C.inkSoft} strokeWidth={6} strokeDasharray="16 12" />
        {exp > 0.9 && (
          <Txt x={X0 + W * 0.62} y={Y0 - H * 0.62} size={28} color={C.inkSoft}>
            ожидание
          </Txt>
        )}
        <polyline points={pts} fill="none" stroke={C.green} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
        {valley > 0 && <path d={`M ${X0 + 20} ${Y0 - 20} L ${X0 + W * 0.66} ${Y0 - H * 0.5} L ${X0 + W * 0.66} ${Y0 - 30} Z`} fill={C.coral} opacity={0.18 * valley} />}
        {valley > 0 && (
          <g transform={`translate(${X0 + W * 0.42} ${Y0 - 110})`}>
            <Chip x={0} y={0} text="долина разочарования" size={30} color="#ffe0d9" k={valley} />
          </g>
        )}
        {plateau > 0 && (
          <g>
            <line x1={X0 + W * 0.66} y1={Y0 - H - 10} x2={X0 + W * 0.66} y2={Y0 + 10} stroke={C.violet} strokeWidth={5} strokeDasharray="10 10" opacity={plateau} />
            <Chip x={X0 + W * 0.66} y={Y0 - H - 40} text="порог" size={30} color="#e9e2ff" k={plateau} />
          </g>
        )}
      </g>
      {/* бамбук: корни под землёй, потом рывок вверх */}
      {bamboo > 0 && (
        <g transform={`translate(${cx + 420} 0)`} opacity={bamboo}>
          <rect x={-150} y={620} width={300} height={6} fill={C.greenDeep} />
          <rect x={-150} y={626} width={300} height={200} fill="#c99060" opacity={0.6} />
          {Array.from({ length: 7 }).map((_, i) => (
            <path key={i} d={`M 0 626 Q ${-100 + i * 33} ${680 + (i % 3) * 30} ${-130 + i * 44} ${700 + (i % 2) * 90}`} stroke="#8a5a2b" strokeWidth={5} fill="none" strokeDasharray={200} strokeDashoffset={200 * (1 - clamp01(grow * 2))} />
          ))}
          {(() => {
            const h = Math.max(0, grow * 2 - 1) * 460;
            return (
              <g>
                <rect x={-14} y={626 - h} width={28} height={h} fill={C.green} stroke={OL} strokeWidth={3} />
                {Array.from({ length: Math.floor(h / 70) }).map((_, i) => (
                  <g key={i}>
                    <line x1={-16} y1={600 - i * 70} x2={16} y2={600 - i * 70} stroke={OL} strokeWidth={3} />
                    <ellipse cx={i % 2 ? 40 : -40} cy={590 - i * 70} rx={34} ry={10} fill={C.green} transform={`rotate(${i % 2 ? -25 : 25} ${i % 2 ? 40 : -40} ${590 - i * 70})`} />
                  </g>
                ))}
              </g>
            );
          })()}
          <Txt x={0} y={870} size={30} color={C.greenDeep}>
            бамбук: сначала корни
          </Txt>
        </g>
      )}
      {/* каменотёс */}
      {stone > 0 && (
        <g transform={`translate(${cx - 260} 450)`} opacity={stone}>
          <rect x={-120} y={-90} width={240} height={180} rx={20} fill="#9aa5b8" stroke={OL} strokeWidth={5} />
          {crack > 0 && <path d={`M 0 -90 L -14 -30 L 12 10 L -6 50 L 6 90`} stroke={OL} strokeWidth={6} fill="none" strokeDasharray={200} strokeDashoffset={200 * (1 - crack)} />}
          <g transform={`translate(${150} ${-110}) rotate(${hit ? -10 : 25})`}>
            <rect x={-6} y={-10} width={12} height={110} fill={C.wood} stroke={OL} strokeWidth={3} />
            <rect x={-40} y={-30} width={80} height={34} rx={6} fill="#4a5874" stroke={OL} strokeWidth={3} />
          </g>
          <Txt x={0} y={150} size={30} color={C.inkSoft}>
            удар за ударом
          </Txt>
        </g>
      )}
    </g>
  );
};

export const SystemsGoals: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const intro = pop(t, at(c, 0) + 0.2);
  const same = ramp(t, at(c, 1), 0.5);
  const room = ramp(t, at(c, 2), 0.5);
  const mess = ramp(t, at(c, 2.6), 1.2);
  const later = ramp(t, at(c, 3), 0.5);
  const end = ramp(t, at(c, 4), 0.6);
  const gear = (x: number, y: number, r: number, dir: number) => (
    <g transform={`translate(${x} ${y}) rotate(${t * 40 * dir})`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={-r * 0.18} y={-r - 16} width={r * 0.36} height={30} rx={6} fill={C.skyDeep} stroke={OL} strokeWidth={3} transform={`rotate(${i * 45})`} />
      ))}
      <circle r={r} fill={C.sky} stroke={OL} strokeWidth={5} />
      <circle r={r * 0.3} fill="#fff" stroke={OL} strokeWidth={4} />
    </g>
  );
  return (
    <g>
      {/* цель — табло, система — шестерёнки */}
      <g opacity={clamp01(intro * 2) * Math.min(1, 1 - same + end)}>
        <g transform={`translate(${cx - 270} 360) scale(${intro})`}>
          <rect x={-170} y={-110} width={340} height={220} rx={24} fill={C.ink} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-40} size={34} color="#fff">
            ЦЕЛЬ
          </Txt>
          <Icon name="star" x={0} y={40} s={1.4} />
          <Txt x={0} y={170} size={30} color={C.inkSoft}>
            что я хочу
          </Txt>
        </g>
        <g transform={`translate(${cx + 270} 360) scale(${intro})`}>
          {gear(-60, -20, 70, 1)}
          {gear(70, 40, 50, -1.4)}
          <Txt x={0} y={170} size={30} color={C.inkSoft}>
            что я делаю каждый день
          </Txt>
        </g>
      </g>
      {/* одинаковые цели у победителя и проигравшего */}
      {same > 0 && room === 0 && (
        <g opacity={same} transform="translate(0 40)">
          {[-1, 1].map((d, i) => (
            <g key={i} transform={`translate(${cx + d * 200} 700)`}>
              <Worker x={0} y={0} s={1.1} role="plain" color={i ? C.violet : C.coral} t={t} mood={i ? "sad" : "smile"} />
              <g transform="translate(0 -200)">
                <rect x={-90} y={-30} width={180} height={56} rx={28} fill={C.yellow} stroke={OL} strokeWidth={3} />
                <Txt x={0} y={10} size={28}>
                  цель: золото
                </Txt>
              </g>
            </g>
          ))}
          <Txt x={cx} y={600} size={60} weight={900} color={C.red}>
            =
          </Txt>
        </g>
      )}
      {/* убранная комната снова захламлена */}
      {room > 0 && later === 0 && (
        <g transform={`translate(${cx} 660)`} opacity={room}>
          <rect x={-300} y={-200} width={600} height={260} rx={20} fill="#fff" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 9 }).map((_, i) => {
            const mk = clamp01(mess * 9 - i);
            const away = 1 - ramp(t, at(c, 2.2), 0.6);
            const show = Math.max(away, mk);
            return <rect key={i} x={-260 + ((i * 97) % 500)} y={-20 - ((i * 53) % 140)} width={50 + (i % 3) * 16} height={30} rx={6} fill={[C.coral, C.sky, C.yellow, C.violet][i % 4]} stroke={OL} strokeWidth={3} transform={`rotate(${(i * 37) % 50 - 25} ${-235 + ((i * 97) % 500)} ${-5 - ((i * 53) % 140)})`} opacity={show} />;
          })}
          <Check x={250} y={-150} s={40} k={ramp(t, at(c, 2.25), 0.4) * (1 - mess)} />
          <Txt x={0} y={120} size={32} color={C.inkSoft}>
            {mess > 0.4 ? "привычки прежние — хаос вернулся" : "уборка: комната чистая"}
          </Txt>
        </g>
      )}
      {/* «счастье потом» против радости каждый день */}
      {later > 0 && end === 0 && (
        <g opacity={later}>
          <line x1={cx - 500} y1={700} x2={cx + 500} y2={700} stroke={OL} strokeWidth={6} />
          <g transform={`translate(${cx + 470} 640)`}>
            <Icon name="star" x={0} y={0} s={1.3} />
            <Txt x={0} y={-60} size={28}>
              «потом»
            </Txt>
          </g>
          {Array.from({ length: 7 }).map((_, i) => (
            <g key={i} transform={`translate(${cx - 460 + i * 130} 700)`} opacity={clamp01(ramp(t, at(c, 3.4), 1.4) * 7 - i)}>
              <circle r={26} fill={C.yellow} stroke={OL} strokeWidth={3} />
              <path d="M -10 2 Q 0 12 10 2" stroke={OL} strokeWidth={3} fill="none" />
            </g>
          ))}
          <Txt x={cx - 60} y={790} size={30} color={C.greenDeep}>
            система радует каждый день
          </Txt>
        </g>
      )}
      {end > 0 && (
        <g opacity={end}>
          <g transform={`translate(${cx - 270} 660)`}>
            <circle r={80} fill="#fff" stroke={OL} strokeWidth={5} />
            <path d={`M 0 0 L ${Math.sin(t) * 6} -60`} stroke={C.red} strokeWidth={10} strokeLinecap="round" />
            <circle r={10} fill={OL} />
            <Txt x={0} y={130} size={32}>
              направление
            </Txt>
          </g>
          <g transform={`translate(${cx + 270} 660)`}>
            <Arrow x1={-90} y1={0} x2={90} y2={0} k={ramp(t, at(c, 4.3), 0.6)} color={C.green} w={14} />
            <Txt x={0} y={130} size={32}>
              движение
            </Txt>
          </g>
        </g>
      )}
    </g>
  );
};

export const Atoms: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const one = pop(t, 0.2);
  const join = ramp(t, at(c, 1.2), 2.2);
  const sys = ramp(t, at(c, 2), 0.6);
  const N = 14;
  const labels = ["вода", "сон", "чтение", "зарядка", "порядок", "письмо", "шаги"];
  return (
    <g>
      {Array.from({ length: N }).map((_, i) => {
        const a = (i / N) * Math.PI * 2;
        const sx = cx + Math.cos(a * 3.1 + i) * 460;
        const sy = 450 + Math.sin(a * 2.3 + i) * 260;
        const ring = i < 6 ? 0 : 1;
        const ra = (i / (ring ? 8 : 6)) * Math.PI * 2 + t * 0.4 * (ring ? -1 : 1);
        const tx = cx + Math.cos(ra) * (ring ? 230 : 120);
        const ty = 470 + Math.sin(ra) * (ring ? 170 : 90);
        const k = pop(t, 0.2 + i * 0.12);
        const x = interpolate(join, [0, 1], [sx, tx]);
        const y = interpolate(join, [0, 1], [sy, ty]);
        return (
          <g key={i}>
            {join > 0.6 && i > 0 && <line x1={x} y1={y} x2={cx} y2={470} stroke={OL} strokeWidth={4} opacity={(join - 0.6) * 1.5} />}
            <g transform={`translate(${x} ${y + wob(t, i, 4)}) scale(${k})`}>
              <circle r={36} fill={[C.sky, C.coral, C.yellow, C.green, C.violet, C.pink][i % 6]} stroke={OL} strokeWidth={4} />
              <circle cx={-10} cy={-12} r={9} fill="#fff" opacity={0.6} />
            </g>
          </g>
        );
      })}
      {join > 0.6 && (
        <g transform={`translate(${cx} 470) scale(${(join - 0.6) * 2.5 > 1 ? 1 : (join - 0.6) * 2.5})`}>
          <circle r={70} fill={C.yellow} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={12} size={30} weight={900}>
            система
          </Txt>
        </g>
      )}
      {one > 0 && join < 0.5 && (
        <g transform={`translate(${cx} 840)`} opacity={1 - join * 2}>
          <Tag x={0} y={0} text="одна маленькая привычка — почти незаметна" size={32} color="#fff" />
        </g>
      )}
      {join >= 0.5 &&
        labels.map((l, i) => (
          <Chip key={i} x={cx - 520 + (i % 4) * 340 + (i > 3 ? 170 : 0)} y={i > 3 ? 860 : 790} text={l} size={28} color="#fff" k={pop(t, at(c, 1.6) + i * 0.12)} />
        ))}
      {sys > 0 && (
        <g transform={`translate(${cx} 160)`}>
          <Chip x={0} y={0} text="проблема — в системе, а не в вас" size={36} color={C.yellow} k={pop(t, at(c, 2.2))} />
        </g>
      )}
    </g>
  );
};

export const IdentityLayers: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host) - 160;
  const cy = 500;
  const rings = [
    { r: 330, label: "результаты", sub: "что я получаю", col: "#ffd6bd" },
    { r: 230, label: "процессы", sub: "что я делаю", col: "#ffe9a0" },
    { r: 120, label: "идентичность", sub: "во что я верю", col: C.yellow },
  ];
  const inward = ramp(t, at(c, 2), 0.8);
  const smoke = ramp(t, at(c, 3), 0.5);
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(${1 - 0.25 * smoke}) translate(${-smoke * 180} 0)`}>
        {rings.map((rg, i) => {
          const k = pop(t, i === 0 ? 0.3 : at(c, 1) + (i - 1) * 0.9 + 0.2);
          return (
            <g key={i} transform={`scale(${k})`}>
              <ellipse rx={rg.r} ry={rg.r * 0.82} fill={rg.col} stroke={OL} strokeWidth={5} opacity={0.95} />
            </g>
          );
        })}
        {rings.map((rg, i) => {
          const k = clamp01(pop(t, i === 0 ? 0.5 : at(c, 1) + (i - 1) * 0.9 + 0.4));
          return (
            <g key={i} opacity={k}>
              <Txt x={0} y={-(rg.r * 0.82) + (i === 2 ? 110 : 52)} size={i === 2 ? 34 : 32} weight={900}>
                {rg.label}
              </Txt>
              <Txt x={0} y={-(rg.r * 0.82) + (i === 2 ? 150 : 88)} size={24} color={C.inkSoft} weight={700}>
                {rg.sub}
              </Txt>
            </g>
          );
        })}
        {inward > 0 && (
          <g opacity={inward}>
            <Arrow x1={-480} y1={-200} x2={-330} y2={-120} k={inward} color={C.inkSoft} w={7} />
            <Arrow x1={0} y1={30} x2={0} y2={230} k={ramp(t, at(c, 2.4), 0.8)} color={C.green} w={10} />
            <Arrow x1={60} y1={30} x2={330} y2={180} k={ramp(t, at(c, 2.5), 0.8)} color={C.green} w={10} />
          </g>
        )}
      </g>
      {smoke > 0 &&
        [
          { text: "«Я пытаюсь бросить»", y: 330, good: false },
          { text: "«Я не курю»", y: 600, good: true },
        ].map((b, i) => {
          const k = pop(t, at(c, 3.2) + i * 1.2);
          return (
            <g key={i} transform={`translate(${cx + 440} ${b.y}) scale(${k})`}>
              <rect x={-260} y={-80} width={520} height={160} rx={40} fill={b.good ? "#d9f5e5" : "#fff"} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={40}>
                {b.text}
              </Txt>
              <g transform="translate(220 -80)">
                {b.good ? <Check x={0} y={0} s={36} k={ramp(t, at(c, 3.8), 0.5)} /> : <Txt x={0} y={14} size={44} color={C.inkSoft}>…</Txt>}
              </g>
              <Txt x={0} y={124} size={26} color={C.inkSoft}>
                {b.good ? "уже видит себя иначе" : "всё ещё курильщик, который борется"}
              </Txt>
            </g>
          );
        })}
    </g>
  );
};

export const Votes: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const box = pop(t, 0.2);
  const ballots: { icon: IconName; yes: boolean; at: number }[] = [
    { icon: "page", yes: true, at: 1.1 },
    { icon: "dumbbell", yes: true, at: 1.55 },
    { icon: "moon", yes: false, at: 2.0 },
    { icon: "book", yes: true, at: 2.25 },
    { icon: "water", yes: true, at: 2.45 },
    { icon: "coffee", yes: false, at: 2.65 },
    { icon: "shoe", yes: true, at: 2.85 },
  ];
  const meter = ramp(t, at(c, 2.2), 1);
  const steps = ramp(t, at(c, 3), 0.5);
  const q = ramp(t, at(c, 4), 0.5);
  const showMain = 1 - steps;
  return (
    <g>
      <g opacity={showMain}>
        {/* урна */}
        <g transform={`translate(${cx - 160} 640) scale(${box})`}>
          <rect x={-170} y={-150} width={340} height={260} rx={20} fill="#fff" stroke={OL} strokeWidth={6} />
          <rect x={-90} y={-160} width={180} height={20} rx={8} fill={OL} />
          <Txt x={0} y={20} size={36} weight={900}>
            кем я становлюсь
          </Txt>
        </g>
        {ballots.map((b, i) => {
          const tt = (t - at(c, b.at)) / 0.8;
          if (tt <= 0) return null;
          const f = clamp01(tt);
          const sx = cx + 380;
          const sy = 260 + (i % 3) * 120;
          const x = interpolate(f, [0, 1], [sx, cx - 160]);
          const y = interpolate(f, [0, 0.5, 1], [sy, sy - 120, 470]);
          return (
            <g key={i}>
              {f < 1 && (
                <g transform={`translate(${x} ${y}) scale(${1 - f * 0.5})`}>
                  <rect x={-70} y={-50} width={140} height={100} rx={12} fill={b.yes ? "#d9f5e5" : "#ffe0d9"} stroke={OL} strokeWidth={4} />
                  <Icon name={b.icon} x={-22} y={0} s={0.8} />
                  <Txt x={38} y={14} size={36} weight={900} color={b.yes ? C.greenDeep : C.red}>
                    {b.yes ? "за" : "–"}
                  </Txt>
                </g>
              )}
              {/* учтённый голос — фишка в ряду над урной */}
              {f >= 1 && (
                <g transform={`translate(${cx - 340 + i * 60} 380) scale(${clamp01((tt - 1) * 4)})`}>
                  <circle r={24} fill={b.yes ? C.green : C.coral} stroke={OL} strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })}
        {/* шкала большинства */}
        {meter > 0 && (
          <g transform={`translate(${cx + 260} 760)`} opacity={meter}>
            <rect x={-220} y={-30} width={440} height={60} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
            <rect x={-216} y={-26} width={432 * 0.72 * meter} height={52} rx={26} fill={C.green} />
            <line x1={0} y1={-46} x2={0} y2={46} stroke={OL} strokeWidth={4} strokeDasharray="8 6" />
            <Txt x={0} y={90} size={30}>
              достаточно большинства
            </Txt>
          </g>
        )}
      </g>
      {steps > 0 && (
        <g opacity={steps}>
          {["1. Решите, кем хотите быть", "2. Докажите это маленькими делами"].map((s, i) => (
            <g key={i} transform={`translate(${cx} ${330 + i * 170}) scale(${pop(t, at(c, 3) + i * 0.8)})`}>
              <rect x={-420} y={-62} width={840} height={124} rx={30} fill={i ? "#d9f5e5" : C.yellow} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={14} size={44}>
                {s}
              </Txt>
            </g>
          ))}
          {q > 0 && (
            <g transform={`translate(${cx} 720) scale(${pop(t, at(c, 4.1))})`}>
              <rect x={-560} y={-60} width={1120} height={120} rx={60} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={12} size={32} color={C.inkSoft}>
                «Как поступил бы человек, который заботится о здоровье?»
              </Txt>
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const HabitLoop: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const boxK = pop(t, 0.2);
  const fast = ramp(t, at(c, 1), Math.max(1, at(c, 1.9) - at(c, 1)));
  const loop = ramp(t, at(c, 3), 0.6);
  const lamp = ramp(t, at(c, 4.6), 0.4);
  const stages = [
    { label: "стимул", col: C.sky, icon: "eye" as IconName },
    { label: "желание", col: C.pink, icon: "heart" as IconName },
    { label: "реакция", col: C.green, icon: "shoe" as IconName },
    { label: "награда", col: C.yellow, icon: "star" as IconName },
  ];
  const lever = Math.sin(t * (3 + fast * 6)) > 0.7;
  // полоски времени выхода из ящика: всё короче
  const bars = [1, 0.8, 0.85, 0.55, 0.4, 0.35, 0.2, 0.12, 0.08];
  const exp = 1 - loop;
  return (
    <g>
      {exp > 0 && (
        <g opacity={exp}>
          <g transform={`translate(${cx - 200} 560) scale(${boxK})`}>
            <rect x={-250} y={-220} width={500} height={330} rx={14} fill="#e8c99a" stroke={OL} strokeWidth={6} />
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={i} x1={-200 + i * 80} y1={-220} x2={-200 + i * 80} y2={110} stroke={OL} strokeWidth={4} opacity={0.35} />
            ))}
            <Cat x={interpolate(Math.sin(t * (1 + fast * 3)), [-1, 1], [-120, 40])} y={80} s={0.9} t={t} happy={fast > 0.6} />
            <g transform="translate(180 30)">
              <rect x={-8} y={-60} width={16} height={70} fill={OL} transform={`rotate(${lever ? 30 : -10} 0 10)`} />
              <circle r={14} fill={C.red} stroke={OL} strokeWidth={3} />
            </g>
            <rect x={250} y={-120} width={20} height={150} fill={fast > 0.4 && lever ? "#fff" : C.wood} stroke={OL} strokeWidth={4} />
          </g>
          <g transform={`translate(${cx + 330} 300)`}>
            <Txt x={0} y={-40} size={30} color={C.inkSoft}>
              время выхода
            </Txt>
            {bars.map((b, i) => (
              <rect key={i} x={-160} y={i * 42} width={320 * b * clamp01(fast * 9 - i)} height={30} rx={10} fill={i > 5 ? C.green : C.coral} />
            ))}
          </g>
          {ramp(t, at(c, 2), 0.5) > 0 && (
            <g transform={`translate(${cx + 330} 780)`}>
              <Chip x={0} y={0} text="на автомате" size={38} color={C.yellow} k={pop(t, at(c, 2))} />
            </g>
          )}
        </g>
      )}
      {loop > 0 && (
        <g opacity={loop}>
          <circle cx={cx} cy={480} r={250} fill="none" stroke="#fff" strokeWidth={46} />
          {(() => {
            const a = t * 1.8;
            return <circle cx={cx + Math.cos(a) * 250} cy={480 + Math.sin(a) * 250} r={18} fill={C.yellowDeep} stroke={OL} strokeWidth={3} />;
          })()}
          {stages.map((s, i) => {
            const a = -Math.PI / 2 + (i * Math.PI) / 2;
            const k = pop(t, at(c, 3.15) + i * 0.4);
            const x = cx + Math.cos(a) * 250;
            const y = 480 + Math.sin(a) * 250;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${k})`}>
                <circle r={86} fill={s.col} stroke={OL} strokeWidth={5} />
                <Icon name={s.icon} x={0} y={-16} s={0.9} />
                <Txt x={0} y={52} size={26} weight={900}>
                  {s.label}
                </Txt>
              </g>
            );
          })}
          {/* выключатель и лампа */}
          <g transform={`translate(${cx} 480)`} opacity={ramp(t, at(c, 4), 0.5)}>
            <rect x={-46} y={-70} width={92} height={140} rx={16} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-20} y={lamp > 0.5 ? -46 : 4} width={40} height={42} rx={8} fill={lamp > 0.5 ? C.yellow : "#b9c3d3"} stroke={OL} strokeWidth={3} />
            {lamp > 0.5 && <circle r={150} fill={C.yellow} opacity={0.2} />}
          </g>
        </g>
      )}
    </g>
  );
};

export const LAW_INFO = [
  { good: "очевидно", bad: "невидимо", col: C.sky, stage: "стимул" },
  { good: "привлекательно", bad: "непривлекательно", col: C.pink, stage: "желание" },
  { good: "просто", bad: "трудно", col: C.green, stage: "реакция" },
  { good: "приятно", bad: "неприятно", col: C.yellow, stage: "награда" },
];

export const FourLaws: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const flip = ramp(t, at(c, 2), 0.8);
  return (
    <g>
      {LAW_INFO.map((l, i) => {
        const k = pop(t, i === 0 ? at(c, 0.4) : at(c, 1) + (i - 1) * 0.7 + 0.3);
        const x = cx - 450 + i * 300;
        const fl = clamp01(flip * 1.6 - i * 0.2);
        const sx = Math.abs(Math.cos(fl * Math.PI));
        const back = fl > 0.5;
        return (
          <g key={i} transform={`translate(${x} 470) scale(${k})`}>
            <Txt x={0} y={-250} size={26} color={C.inkSoft}>
              {l.stage}
            </Txt>
            <g transform={`scale(${sx} 1)`}>
              <rect x={-130} y={-200} width={260} height={360} rx={30} fill={back ? "#e3e6ec" : l.col} stroke={OL} strokeWidth={5} />
              <circle cx={0} cy={-110} r={50} fill="#fff" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-92} size={54} weight={900}>
                {String(i + 1)}
              </Txt>
              <Txt x={0} y={20} size={24} color={C.inkSoft}>
                {back ? "для вредного" : "закон"}
              </Txt>
              <Txt x={0} y={76} size={l.good.length > 10 || l.bad.length > 10 ? 25 : 34} weight={900} color={back ? C.red : C.ink}>
                {back ? l.bad : l.good}
              </Txt>
            </g>
          </g>
        );
      })}
      <Pop t={t} at={at(c, 3)} x={cx} y={820}>
        <Tag x={0} y={0} text="хорошее — вперёд, вредное — наоборот" size={34} color="#fff" />
      </Pop>
    </g>
  );
};
