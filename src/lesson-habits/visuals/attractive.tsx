// Закон 2 «Сделайте привлекательным»: птенцы чаек и сверхнормальные стимулы,
// дофамин и ожидание, связка «нужно + хочется», племя, опыт Аша, переосмысление
// и обратный закон «сделайте непривлекательным».
import React from "react";
import { C, FONT } from "../theme";
import { OL, Phone, Worker } from "./draw";
import { Arrow, Check, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Chick, Chip, ExerciseBike, GullHead, Icon, TV, zoneX } from "./parts";

export const Supernormal: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const real = pop(t, 0.2);
  const card = ramp(t, at(c, 1.3), 0.5);
  const three = ramp(t, at(c, 1.6), 0.5);
  const modern = ramp(t, at(c, 2), 0.6);
  const peck = (Math.sin(t * 6) + 1) / 2;
  const first = 1 - modern;
  return (
    <g>
      {first > 0 && (
        <g opacity={first}>
          {/* настоящая голова */}
          <g transform={`translate(${cx - 380} 470) scale(${real})`} opacity={1 - card * 0.6}>
            <GullHead x={0} y={0} s={1.1} dots={1} />
            <Chick x={80} y={300} s={0.9} peck={peck * 0.6} />
          </g>
          {/* картонный клюв с тремя пятнами */}
          {card > 0 && (
            <g transform={`translate(${cx + 220} 450) scale(${card})`}>
              <GullHead x={0} y={0} s={1.1} dots={three > 0.5 ? 3 : 1} card />
              <Chick x={80} y={320} s={0.9} peck={three > 0.5 ? peck : peck * 0.5} excited={three} />
              <Chick x={-80} y={340} s={0.8} peck={three > 0.5 ? 1 - peck : 0.2} excited={three} />
              {three > 0.5 && <Chip x={60} y={-170} text="ещё охотнее!" size={34} color={C.yellow} k={three} />}
            </g>
          )}
        </g>
      )}
      {modern > 0 && (
        <g opacity={modern}>
          {[
            { icon: "star", label: "очень вкусная еда", x: -380 },
            { icon: "page", label: "бесконечная лента", x: 0 },
            { icon: "heart", label: "мгновенные лайки", x: 380 },
          ].map((m, i) => {
            const k = pop(t, at(c, 2.2) + i * 0.5);
            return (
              <g key={i} transform={`translate(${cx + m.x} 460) scale(${k})`}>
                <circle r={150 + 10 * Math.sin(t * 4 + i)} fill={C.yellow} opacity={0.3} />
                {i === 1 ? (
                  <Phone x={0} y={0} s={0.9}>
                    {[0, 1, 2, 3].map((r) => (
                      <rect key={r} x={-56} y={-110 + ((r * 60 + t * 120) % 240)} width={112} height={44} rx={8} fill={[C.coral, C.sky, C.green, C.pink][r]} />
                    ))}
                  </Phone>
                ) : (
                  <g>
                    <circle r={110} fill="#fff" stroke={OL} strokeWidth={5} />
                    <Icon name={m.icon as "star"} x={0} y={0} s={2.2} color={i === 0 ? C.orange : C.red} />
                  </g>
                )}
                <Txt x={0} y={230} size={30}>
                  {m.label}
                </Txt>
              </g>
            );
          })}
          <Chip x={cx} y={180} text="сверхнормальные стимулы" size={40} color={C.pink} k={pop(t, at(c, 2.1))} />
          {ramp(t, at(c, 3), 0.5) > 0 && (
            <g transform={`translate(${cx} 830)`}>
              <Tag x={0} y={0} text="полезное — сделать привлекательнее" size={34} color={C.yellow} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

export const Dopamine: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const axes = pop(t, 0.2);
  const draw = ramp(t, at(c, 1), 2.4);
  const party = ramp(t, at(c, 2), 0.6);
  const X0 = cx - 480;
  const Y0 = 720;
  const W = 900;
  // всплеск при ожидании (до подарка), меньше — при получении
  const f = (x: number) => 0.1 + 0.75 * Math.exp(-Math.pow((x - 0.38) / 0.09, 2)) + 0.25 * Math.exp(-Math.pow((x - 0.78) / 0.06, 2));
  const n = Math.max(2, Math.round(80 * draw));
  const pts = Array.from({ length: n }, (_, i) => `${X0 + (i / 79) * W},${Y0 - f(i / 79) * 420}`).join(" ");
  return (
    <g>
      <g opacity={clamp01(axes * 2)}>
        <line x1={X0} y1={Y0} x2={X0 + W + 30} y2={Y0} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 - 470} stroke={OL} strokeWidth={6} strokeLinecap="round" />
        <Txt x={X0 + 10} y={Y0 - 490} size={28} color={C.inkSoft} anchor="start">
          дофамин
        </Txt>
        <polyline points={pts} fill="none" stroke={C.violet} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        {/* сигнал и подарок */}
        <g transform={`translate(${X0 + W * 0.38} ${Y0 + 70})`} opacity={clamp01(draw * 3 - 1)}>
          <Icon name="eye" x={0} y={0} s={0.9} />
          <Txt x={0} y={60} size={26}>
            предвкушение
          </Txt>
        </g>
        <g transform={`translate(${X0 + W * 0.78} ${Y0 + 66})`} opacity={clamp01(draw * 2 - 1.4)}>
          <rect x={-30} y={-30} width={60} height={50} rx={6} fill={C.coral} stroke={OL} strokeWidth={4} />
          <rect x={-36} y={-42} width={72} height={16} rx={4} fill={C.yellow} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={64} size={26}>
            получение
          </Txt>
        </g>
        {draw > 0.5 && (
          <g transform={`translate(${X0 + W * 0.38} ${Y0 - 470})`}>
            <Chip x={0} y={0} text="ждём — и уже хочется" size={32} color={C.yellow} k={pop(t, at(c, 1.5))} />
          </g>
        )}
      </g>
      {party > 0 && (
        <g transform={`translate(${cx + 330} 300) scale(${party}) rotate(${wob(t, 2, 3)})`}>
          <rect x={-150} y={-90} width={300} height={180} rx={24} fill="#fff" stroke={OL} strokeWidth={4} />
          <Txt x={0} y={-20} size={30}>
            ждать праздника
          </Txt>
          <Txt x={0} y={30} size={30} color={C.violet} weight={900}>
            ≥ сам праздник
          </Txt>
        </g>
      )}
    </g>
  );
};

export const Bundling: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const scene = pop(t, 0.2);
  // педали крутятся — сериал идёт; пауза — экран гаснет
  const pedal = Math.sin(t * 0.9) > -0.6 ? 1 : 0;
  const spin = t * 300 * pedal;
  const pairs = ramp(t, at(c, 1), 0.6);
  const chain = ramp(t, at(c, 2), 0.6);
  const first = 1 - pairs;
  return (
    <g>
      {first > 0 && (
        <g opacity={first * clamp01(scene * 2)}>
          <ExerciseBike x={cx - 260} y={700} s={1.3} spin={spin} />
          <Worker x={cx - 300} y={500} s={1.1} role="plain" color={C.sky} t={t} arms={0.2} />
          <TV x={cx + 300} y={420} s={1.15} on={pedal} t={t} label="серия" />
          <path d={`M ${cx - 140} 680 Q ${cx + 40} 760 ${cx + 300} 580`} stroke={OL} strokeWidth={6} fill="none" strokeDasharray="14 10" />
          <Chip x={cx + 300} y={680} text={pedal ? "крутите — сериал идёт" : "остановились — пауза"} size={30} color={pedal ? "#d9f5e5" : "#ffe0d9"} />
        </g>
      )}
      {pairs > 0 && (
        <g opacity={pairs * (1 - chain * 0.8)}>
          {[
            { need: "прогулка", want: "любимый подкаст" },
            { need: "10 приседаний", want: "новости" },
          ].map((p, i) => {
            const k = pop(t, at(c, 1.2) + i * 0.6);
            return (
              <g key={i} transform={`translate(${cx} ${360 + i * 220}) scale(${k})`}>
                <rect x={-480} y={-70} width={400} height={140} rx={30} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
                <Txt x={-280} y={-20} size={24} color={C.inkSoft}>
                  нужно
                </Txt>
                <Txt x={-280} y={30} size={36}>
                  {p.need}
                </Txt>
                <Txt x={0} y={20} size={70} weight={900} color={C.orange}>
                  +
                </Txt>
                <rect x={80} y={-70} width={400} height={140} rx={30} fill="#fde0ec" stroke={OL} strokeWidth={4} />
                <Txt x={280} y={-20} size={24} color={C.inkSoft}>
                  хочется
                </Txt>
                <Txt x={280} y={30} size={36}>
                  {p.want}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
      {chain > 0 && (
        <g opacity={chain}>
          {["привычное", "нужное", "желанное"].map((l, i) => (
            <g key={i}>
              <g transform={`translate(${cx - 380 + i * 380} 760) scale(${pop(t, at(c, 2.1) + i * 0.4)})`}>
                <rect x={-150} y={-60} width={300} height={120} rx={60} fill={[C.white, "#d9f5e5", "#fde0ec"][i]} stroke={OL} strokeWidth={4} />
                <Txt x={0} y={14} size={36}>
                  {l}
                </Txt>
              </g>
              {i < 2 && <Arrow x1={cx - 220 + i * 380} y1={760} x2={cx - 160 + i * 380} y2={760} k={ramp(t, at(c, 2.3) + i * 0.4, 0.4)} color={C.inkSoft} w={8} />}
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

// шахматная фигура (пешка/ферзь)
const ChessPiece: React.FC<{ x: number; y: number; s?: number; dark?: boolean }> = ({ x, y, s = 1, dark }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 40 L 40 40 L 30 10 L 18 10 Q 26 -20 14 -36 A 22 22 0 1 0 -14 -36 Q -26 -20 -18 10 L -30 10 Z" fill={dark ? "#3b3f4a" : "#fffaf0"} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

export const Tribe: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const home = pop(t, 0.2);
  const groups = ramp(t, at(c, 2), 0.6);
  const club = ramp(t, at(c, 3), 0.6);
  const first = 1 - groups;
  const ring = (n: number, r: number, col: string, k: number) =>
    Array.from({ length: n }).map((_, i) => {
      const a = (i / n) * Math.PI * 2 + t * 0.2;
      return (
        <g key={i} opacity={clamp01(k * n - i)}>
          <circle cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.6} r={22} fill={col} stroke={OL} strokeWidth={3} />
        </g>
      );
    });
  return (
    <g>
      {first > 0 && (
        <g opacity={first * clamp01(home * 2)}>
          {/* дом, полный шахмат */}
          <g transform={`translate(${cx} 620)`}>
            <rect x={-420} y={-300} width={840} height={360} rx={24} fill="#fff8e8" stroke={OL} strokeWidth={6} />
            {/* доска */}
            <g transform="translate(-180 -60)">
              {Array.from({ length: 16 }).map((_, i) => (
                <rect key={i} x={-120 + (i % 4) * 60} y={-120 + Math.floor(i / 4) * 60} width={60} height={60} fill={(i + Math.floor(i / 4)) % 2 ? "#8a5a2b" : "#f3e2c7"} />
              ))}
              <rect x={-120} y={-120} width={240} height={240} fill="none" stroke={OL} strokeWidth={5} />
              <ChessPiece x={-30} y={-40} s={0.8} />
              <ChessPiece x={60} y={20} s={0.8} dark />
            </g>
            {[0, 1, 2].map((i) => (
              <Worker key={i} x={80 + i * 120} y={20} s={0.8 + i * 0.08} role="plain" color={[C.pink, C.violet, C.coral][i]} t={t + i} />
            ))}
            <Txt x={200} y={-210} size={32}>
              три сестры
            </Txt>
          </g>
          {ramp(t, at(c, 1), 0.5) > 0 && (
            <g transform={`translate(${cx} 220)`}>
              <Tag x={0} y={0} text="шахматы — обычное дело дома" size={34} color={C.yellow} />
            </g>
          )}
        </g>
      )}
      {groups > 0 && (
        <g opacity={groups * (1 - club)}>
          {[
            { label: "близкие", n: 4, r: 70, col: C.coral },
            { label: "большинство", n: 12, r: 120, col: C.sky },
            { label: "авторитеты", n: 3, r: 70, col: C.yellow },
          ].map((g, i) => {
            const k = ramp(t, at(c, 2.1) + i * 0.6, 0.6);
            return (
              <g key={i} transform={`translate(${cx - 380 + i * 380} 480)`}>
                <ellipse rx={170} ry={130} fill="#fff" stroke={OL} strokeWidth={4} opacity={clamp01(k * 2)} />
                {ring(g.n, g.r, g.col, k)}
                {i === 2 && k > 0.5 && <Icon name="star" x={0} y={-10} s={1} />}
                {i === 0 && k > 0.5 && <Icon name="heart" x={0} y={-6} s={0.8} />}
                <Txt x={0} y={190} size={34} opacity={clamp01(k * 2)}>
                  {g.label}
                </Txt>
              </g>
            );
          })}
        </g>
      )}
      {club > 0 && (
        <g opacity={club}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Worker key={i} x={cx - 360 + i * 180 + ((t * 90) % 60) - 30} y={720 + (i % 2) * 20} s={1} role="plain" color={i === 2 ? C.green : [C.sky, C.coral, C.green, C.violet, C.pink][i]} t={t * 2 + i} arms={0.3} />
          ))}
          <Chip x={cx} y={300} text="клуб бегунов: бегать — нормально" size={36} color="#d9f5e5" k={pop(t, at(c, 3.2))} />
        </g>
      )}
    </g>
  );
};

export const Asch: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const cards = pop(t, 0.2);
  const actors = ramp(t, at(c, 1), 0.6);
  const doubt = ramp(t, at(c, 1.6), 1);
  const pie = ramp(t, at(c, 2), 1);
  const law = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      {/* две карточки с линиями */}
      <g transform={`translate(${cx - 120} 300) scale(${cards})`} opacity={1 - law}>
        <rect x={-460} y={-130} width={300} height={260} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
        <line x1={-310} y1={-80} x2={-310} y2={80} stroke={OL} strokeWidth={10} strokeLinecap="round" />
        <rect x={-100} y={-130} width={460} height={260} rx={20} fill="#fff" stroke={OL} strokeWidth={4} />
        {[
          { l: "A", h: 110 },
          { l: "B", h: 160 },
          { l: "C", h: 220 },
        ].map((ln, i) => (
          <g key={i}>
            <line x1={10 + i * 130} y1={60} x2={10 + i * 130} y2={60 - ln.h * 0.62} stroke={i === 1 ? C.greenDeep : OL} strokeWidth={10} strokeLinecap="round" />
            <Txt x={10 + i * 130} y={110} size={34}>
              {ln.l}
            </Txt>
          </g>
        ))}
      </g>
      {/* актёры поднимают «A» */}
      {actors > 0 && (
        <g opacity={actors * (1 - law)}>
          {Array.from({ length: 6 }).map((_, i) => {
            const k = clamp01(actors * 6 - i);
            const x = cx - 520 + i * 150;
            return (
              <g key={i}>
                <Worker x={x} y={760} s={0.9} role="plain" color="#9aa5b8" t={t} arms={k} />
                {k > 0.3 && (
                  <g transform={`translate(${x} 560)`}>
                    <rect x={-34} y={-30} width={68} height={56} rx={10} fill="#ffe0d9" stroke={OL} strokeWidth={3} />
                    <Txt x={0} y={12} size={34} weight={900} color={C.red}>
                      A
                    </Txt>
                  </g>
                )}
              </g>
            );
          })}
          <g transform={`translate(${cx + 400} 760)`}>
            <Worker x={0} y={0} s={1.05} role="plain" color={C.yellowDeep} t={t} mood={doubt > 0.5 ? "sad" : "smile"} />
            {doubt > 0 && (
              <g opacity={doubt}>
                <circle cx={-40} cy={-160} r={8} fill="#7fd1f5" />
                <Txt x={40} y={-170} size={60} weight={900} color={C.inkSoft}>
                  ?
                </Txt>
              </g>
            )}
          </g>
        </g>
      )}
      {pie > 0 && law < 1 && (
        <g transform={`translate(${cx + 380} 300) scale(${pie})`} opacity={1 - law}>
          <circle r={110} fill="#fff" stroke={OL} strokeWidth={5} />
          {(() => {
            const a = 0.75 * pie * Math.PI * 2;
            const x = Math.sin(a) * 110;
            const y = -Math.cos(a) * 110;
            return <path d={`M 0 0 L 0 -110 A 110 110 0 ${a > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={C.coral} stroke={OL} strokeWidth={4} />;
          })()}
          <Txt x={0} y={160} size={30}>
            почти ¾ соглашались
          </Txt>
        </g>
      )}
      {law > 0 && (
        <g opacity={law}>
          {[
            { text: "против племени", sub: "непривлекательно", col: "#ffe0d9", x: -300 },
            { text: "вместе с племенем", sub: "очень привлекательно", col: "#d9f5e5", x: 300 },
          ].map((b, i) => (
            <g key={i} transform={`translate(${cx + b.x} 560) scale(${pop(t, at(c, 3.1) + i * 0.5)})`}>
              <rect x={-260} y={-110} width={520} height={220} rx={30} fill={b.col} stroke={OL} strokeWidth={4} />
              <Txt x={0} y={-20} size={40}>
                {b.text}
              </Txt>
              <Txt x={0} y={40} size={32} color={C.inkSoft}>
                {b.sub}
              </Txt>
            </g>
          ))}
        </g>
      )}
    </g>
  );
};

export const Reframe: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const cx = zoneX(c.p.host);
  const motive = pop(t, 0.2);
  const swap = ramp(t, at(c, 1.15), 0.8);
  const ritual = ramp(t, at(c, 2), 0.6);
  const quit = ramp(t, at(c, 3), 0.6);
  const s1 = 1 - ritual;
  const breath = (Math.sin(t * 1.6) + 1) / 2;
  return (
    <g>
      {s1 > 0 && (
        <g opacity={s1}>
          {/* айсберг: желание сверху, мотив в глубине */}
          <g transform={`translate(${cx} 360) scale(${motive})`} opacity={1 - swap * 0.85}>
            <rect x={-560} y={0} width={1120} height={8} fill={C.skyDeep} />
            <path d="M -120 0 L -60 -110 L 30 -80 L 110 0 Z" fill="#fff" stroke={OL} strokeWidth={4} />
            <path d="M -260 8 L 260 8 L 160 240 L -180 260 Z" fill="#dff4ff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-30} size={28}>
              желание
            </Txt>
            {["снять тревогу", "одобрение", "быть рядом"].map((m, i) => (
              <Txt key={i} x={0} y={80 + i * 50} size={30} color={C.skyDeep}>
                {m}
              </Txt>
            ))}
          </g>
          {swap > 0 && (
            <g transform={`translate(${cx} 520)`}>
              <g opacity={1 - clamp01(swap * 1.5 - 0.3)}>
                <rect x={-360} y={-70} width={720} height={140} rx={40} fill="#ffe0d9" stroke={OL} strokeWidth={4} />
                <Txt x={0} y={16} size={52} color={C.red}>
                  «я должен»
                </Txt>
              </g>
              <g opacity={clamp01(swap * 1.5 - 0.5)} transform={`scale(${0.9 + 0.1 * swap})`}>
                <rect x={-460} y={-70} width={920} height={140} rx={40} fill="#d9f5e5" stroke={OL} strokeWidth={4} />
                <Txt x={0} y={16} size={50} color={C.greenDeep}>
                  «у меня есть возможность»
                </Txt>
              </g>
              <g transform="translate(0 190)" opacity={ramp(t, at(c, 1.6), 0.5)}>
                <Txt x={0} y={0} size={34} color={C.inkSoft}>
                  «нужно бегать» → «стать выносливее»
                </Txt>
              </g>
            </g>
          )}
        </g>
      )}
      {ritual > 0 && quit < 1 && (
        <g opacity={ritual * (1 - quit)}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={cx - 260} cy={480} r={70 + breath * 70 + i * 40} fill="none" stroke={C.sky} strokeWidth={6} opacity={0.6 - i * 0.18} />
          ))}
          <Txt x={cx - 260} y={494} size={40} weight={900} color={C.skyDeep}>
            вдох
          </Txt>
          <Txt x={cx - 260} y={720} size={32}>
            три глубоких вдоха
          </Txt>
          <g transform={`translate(${cx + 260} 480) scale(${pop(t, at(c, 2.3))})`}>
            <circle r={120} fill={C.yellow} stroke={OL} strokeWidth={5} />
            <circle cx={-40} cy={-30} r={12} fill={OL} />
            <circle cx={40} cy={-30} r={12} fill={OL} />
            <path d="M -60 30 Q 0 90 60 30" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
          <Txt x={cx + 260} y={720} size={32}>
            улыбка
          </Txt>
          <Arrow x1={cx - 90} y1={480} x2={cx + 100} y2={480} k={ramp(t, at(c, 2.2), 0.5)} color={C.inkSoft} w={8} />
        </g>
      )}
      {quit > 0 && (
        <g opacity={quit}>
          <g transform={`translate(${cx - 300} 500)`}>
            <circle r={150} fill="#e3e6ec" stroke={OL} strokeWidth={5} opacity={1 - 0.4 * ramp(t, at(c, 3.6), 1)} />
            <Txt x={0} y={10} size={36} color={C.inkSoft}>
              вредная
            </Txt>
            <Txt x={0} y={56} size={36} color={C.inkSoft}>
              привычка
            </Txt>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return <path key={i} d={`M ${Math.cos(a) * 170} ${Math.sin(a) * 170} l ${Math.cos(a) * 30} ${Math.sin(a) * 30}`} stroke={C.yellow} strokeWidth={8} strokeLinecap="round" opacity={1 - ramp(t, at(c, 3.6), 1)} />;
            })}
          </g>
          <g transform={`translate(${cx + 250} 480)`}>
            <rect x={-260} y={-220} width={520} height={440} rx={26} fill="#fff" stroke={OL} strokeWidth={4} />
            <Txt x={0} y={-160} size={34} weight={900}>
              что я выиграю
            </Txt>
            {["больше сил", "больше денег", "свобода", "уважение к себе"].map((g, i) => (
              <g key={i} opacity={clamp01(ramp(t, at(c, 3.3), 1.2) * 4 - i)}>
                <Check x={-190} y={-80 + i * 80} s={26} k={1} />
                <text x={-150} y={-68 + i * 80} fontFamily={FONT} fontWeight={800} fontSize={34} fill={C.ink}>
                  {g}
                </text>
              </g>
            ))}
          </g>
          <Chip x={cx} y={190} text="сделайте вредное непривлекательным" size={36} color={C.pink} k={pop(t, at(c, 3.1))} />
        </g>
      )}
    </g>
  );
};
