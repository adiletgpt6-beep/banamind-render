// Часть «Слава»: телефон и чужой успех (вымышленный эпизод), изумруд без похвалы (IV),
// вся земля — точка (IV, IX), снять блеск: пурпур — шерсть (VI) и важные люди за едой (X),
// «Не иди по стопам Цезарей» (VI) + милосердие после мятежа (предисловие),
// себя любим больше, а чужое мнение ценим выше (XII), кому мы хотим понравиться (VIII).
import React from "react";
import { Check, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "../../lesson-traktat/visuals/kit";
import { C, R } from "../theme";
import { AX } from "./intro";
import { Big, Emerald, Grapes, Heart, Hero, Laurel, OL, Person, Phone, QuoteCard } from "./draw";

type VP = VisualProps<{ host?: string }>;

const Likes: React.FC<{ x: number; y: number; n: string; color?: string; s?: number }> = ({ x, y, n, color = C.coral, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Heart x={-30} y={0} s={0.35} color={color} />
    <Txt x={20} y={12} size={34} weight={900} anchor="start">
      {n}
    </Txt>
  </g>
);

// ── f01: два телефона: «3» и «тысячи»; банан расстроен ──
export const LikesPhone: React.FC<VP> = (c) => {
  const { t } = c;
  const mine = pop(t, 0.3);
  const other = pop(t, at(c, 0.45));
  const hist = ramp(t, at(c, 1), 0.6);
  const n = Math.floor(clamp01((t - at(c, 0.5)) / 1.5) * 4800);
  return (
    <g>
      <g transform={`translate(700 470) scale(${mine})`}>
        <Phone x={0} y={0} s={1.15} rot={-4}>
          <rect x={-80} y={-150} width={160} height={150} rx={10} fill={R.oliveSoft} />
          <Hero x={0} y={-14} s={0.2} t={t} pose="present" mood="happy" />
          <Likes x={-40} y={60} n="3" />
        </Phone>
      </g>
      <g transform={`translate(1220 450) scale(${other})`}>
        <Phone x={0} y={0} s={1.15} rot={4}>
          <rect x={-80} y={-150} width={160} height={150} rx={10} fill="#e3dcff" />
          <Person x={0} y={-20} s={0.8} color={R.purple} t={t} arms={1} />
          <Laurel x={0} y={-110} s={0.35} color={R.gold} />
          <Likes x={-50} y={60} n={n.toLocaleString("ru-RU")} />
        </Phone>
        {Array.from({ length: 8 }).map((_, i) => {
          const ph = (t * 0.7 + i / 8) % 1;
          return <Heart key={i} x={-120 + (i % 4) * 80 + Math.sin(t * 2 + i) * 10} y={180 - ph * 420} s={0.22 + 0.08 * (i % 3)} color={C.coral} />;
        })}
      </g>
      <Hero x={420} y={840} s={0.3} t={t} pose="shrug" mood="confused" />
      {hist > 0 && (
        <g transform={`translate(960 160) scale(${hist})`}>
          <Tag x={0} y={0} text="телефонов в Риме не было — жажда похвалы была" size={30} color="#fff" />
        </g>
      )}
    </g>
  );
};

// ── f02: изумруд, золото, кость, пурпур, мрамор, цветок — похвала не меняет их ──
export const EmeraldPraise: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const items = ramp(t, at(c, 1), 0.6);
  const praise = Math.sin(t * 1.2) > 0;
  return (
    <g>
      <g transform={`translate(${cx} ${430 - items * 60}) scale(${pop(t, 0.3) * (1 - items * 0.35)})`}>
        <Emerald x={0} y={0} s={1.8} glint={0.7 + 0.3 * Math.sin(t * 3)} />
      </g>
      <g opacity={1 - items}>
        <g transform={`translate(${cx - 380} 440)`} opacity={praise ? 1 : 0.25}>
          <Tag x={0} y={0} text="«восхитительно!»" size={30} color={C.yellow} />
        </g>
        <g transform={`translate(${cx + 380} 440)`} opacity={praise ? 0.25 : 1}>
          <Tag x={0} y={0} text="…тишина" size={30} color="#fff" />
        </g>
        <Txt x={cx} y={760} size={36} weight={900}>
          изумруд тот же
        </Txt>
      </g>
      {items > 0 &&
        ["золото", "кость", "пурпур", "мрамор", "цветок"].map((w, i) => {
          const k = pop(t, at(c, 1.1 + i * 0.12));
          const x = cx - 440 + i * 220;
          return (
            <g key={w} transform={`translate(${x} ${640 + wob(t, i, 5)}) scale(${k})`}>
              <circle r={70} fill={[R.gold, "#fff8e8", R.purple, R.marble, "#ff8fb1"][i]} stroke={OL} strokeWidth={5} />
              <Txt x={0} y={120} size={28} weight={900}>
                {w}
              </Txt>
            </g>
          );
        })}
      {items > 0 && (
        <Pop t={t} at={at(c, 1.5)} x={cx} y={150}>
          <Big x={0} y={0} text="прекрасно само по себе" size={50} serif />
        </Pop>
      )}
    </g>
  );
};

// ── f03: камера отъезжает — город → страна → земля → точка ──
export const EarthPoint: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const z = ramp(t, at(c, 0.2), 4);
  const s = 1 - 0.94 * z;
  const flip = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <g transform={`translate(${cx} 470) scale(${s})`} opacity={1 - flip * 0.6}>
        <circle r={300} fill={C.sky} stroke={OL} strokeWidth={8 / Math.max(0.2, s)} />
        <path d="M -180 -100 q 60 -60 140 -20 q 40 60 -20 100 q -80 20 -120 -80 Z" fill={C.green} stroke={OL} strokeWidth={5} />
        <path d="M 60 40 q 80 -20 120 60 q -20 80 -80 60 q -60 -40 -40 -120 Z" fill={C.green} stroke={OL} strokeWidth={5} />
        <Hero x={-60} y={-60} s={0.12} t={t} pose="cheer" mood="joy" />
      </g>
      {z > 0.7 && (
        <g opacity={ramp(t, at(c, 0.6), 0.6)}>
          {Array.from({ length: 30 }).map((_, i) => (
            <circle key={i} cx={cx + ((i * 211) % 900) - 450} cy={200 + ((i * 97) % 560)} r={2 + (i % 3)} fill={C.inkSoft} opacity={0.4} />
          ))}
          <Tag x={cx} y={300} text="«вся-то земля – точка»" size={36} color={C.yellow} />
        </g>
      )}
      {flip > 0 && (
        <g opacity={flip}>
          {[0, 1].map((i) => {
            const on = (Math.floor(t * 0.8) + i) % 2 === 0;
            return (
              <g key={i} transform={`translate(${cx + (i ? 240 : -240)} 640) scale(${on ? 1.1 : 0.9})`} opacity={on ? 1 : 0.4}>
                <Tag x={0} y={0} text={i ? "завтра: «фу»" : "сегодня: «браво»"} size={34} color={i ? "#ffd3c2" : C.yellow} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// ── f04: «рентген» вещей: пурпурная одежда = шерсть + улитка, вино = виноград; важные люди за едой ──
export const PurpleRobe: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const xray = ramp(t, at(c, 1), 0.8);
  const vanity = ramp(t, at(c, 2), 0.6);
  const lunch = ramp(t, at(c, 3), 0.6);
  return (
    <g>
      <g opacity={1 - lunch}>
        <g transform={`translate(${cx - 220} 470)`}>
          <path d="M -120 -160 L 120 -160 L 170 200 L -170 200 Z" fill={R.purple} stroke={OL} strokeWidth={6} opacity={1 - xray * 0.75} />
          <path d="M -120 -160 L -60 -200 L 60 -200 L 120 -160" fill="none" stroke={R.gold} strokeWidth={8} opacity={1 - xray} />
          {xray > 0 && (
            <g opacity={xray}>
              <g transform="translate(-50 20)">
                <ellipse rx={80} ry={56} fill="#fff" stroke={OL} strokeWidth={4} />
                {[-40, 0, 40].map((dx) => (
                  <circle key={dx} cx={dx} cy={-20} r={24} fill="#fff" stroke={OL} strokeWidth={3} />
                ))}
                <circle cx={70} cy={-10} r={20} fill="#ddd" stroke={OL} strokeWidth={3} />
              </g>
              <g transform="translate(90 130)">
                <path d="M -30 10 Q -40 -30 0 -30 Q 40 -30 30 10 Z" fill="#e9c9a0" stroke={OL} strokeWidth={4} />
                <path d="M -10 -24 Q 0 -10 10 -24" stroke={OL} strokeWidth={3} fill="none" />
                <circle cx={-2} cy={20} r={8} fill={C.red} />
              </g>
              <Tag x={0} y={260} text="шерсть + краска улитки" size={28} color="#fff" />
            </g>
          )}
        </g>
        <g transform={`translate(${cx + 260} 470)`}>
          <path d="M -60 -150 L 60 -150 Q 70 -20 0 20 Q -70 -20 -60 -150 Z" fill="#fff" stroke={OL} strokeWidth={5} />
          <path d={`M -56 -110 L 56 -110 Q 60 -26 0 10 Q -60 -26 -56 -110 Z`} fill="#8e2a4a" opacity={1 - xray * 0.7} />
          <rect x={-8} y={20} width={16} height={120} fill="#fff" stroke={OL} strokeWidth={4} />
          <rect x={-60} y={136} width={120} height={18} rx={9} fill="#fff" stroke={OL} strokeWidth={4} />
          {xray > 0 && <Grapes x={0} y={-30} s={0.9} k={xray} />}
          {xray > 0 && <Tag x={0} y={260} text="выжатый виноград" size={28} color="#fff" />}
        </g>
        {vanity > 0 && (
          <g transform={`translate(${cx} 150) scale(${vanity})`}>
            <Panel x={-440} y={-50} w={880} h={96} r={48} fill={C.yellow} />
            <Txt x={0} y={14} size={36} weight={900}>
              сильнее всего обманывает тщеславие
            </Txt>
          </g>
        )}
      </g>
      {lunch > 0 && (
        <g opacity={lunch}>
          <rect x={cx - 360} y={560} width={720} height={36} rx={14} fill="#c98b4a" stroke={OL} strokeWidth={5} />
          <g transform={`translate(${cx} 560)`}>
            <Person x={0} y={0} s={1.4} color={R.purple} t={t} />
            <path d={`M 40 -100 q 30 ${10 + 8 * Math.sin(t * 6)} 60 0`} stroke={OL} strokeWidth={5} fill="none" />
            <ellipse cx={120} cy={-10} rx={70} ry={18} fill="#fff" stroke={OL} strokeWidth={4} />
            <circle cx={110} cy={-24} r={18} fill="#e6a050" stroke={OL} strokeWidth={3} />
            <Txt x={-200} y={-200} size={40} weight={900} color={C.inkSoft} opacity={0.5 + 0.5 * Math.sin(t * 3)}>
              ам!
            </Txt>
          </g>
          <Tag x={cx} y={200} text="важный господин… за обедом" size={34} color="#fff" />
          <Hero x={cx + 420} y={830} s={0.28} t={t} pose="shrug" mood="joy" />
        </g>
      )}
    </g>
  );
};

// ── f05: колесница с надписью «власть» тянет в сторону, банан-канат «простота»; указ о милосердии ──
export const CaesarNot: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const pull = ramp(t, 0.3, 0.8) * (1 - ramp(t, at(c, 2), 0.6));
  const virt = ramp(t, at(c, 1), 0.6);
  const edict = ramp(t, at(c, 2), 0.8);
  const tug = Math.sin(t * 2) * 20;
  return (
    <g>
      {pull > 0 && (
        <g opacity={pull}>
          <g transform={`translate(${cx - 300 + tug} 480)`}>
            <path d="M -100 -40 L 100 -40 L 120 40 L -120 40 Z" fill={R.gold} stroke={OL} strokeWidth={6} />
            <circle cx={-70} cy={60} r={44} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
            <circle cx={70} cy={60} r={44} fill="#8a5a2b" stroke={OL} strokeWidth={5} />
            <Tag x={0} y={-90} text="соблазн власти" size={28} color="#ffd3c2" />
          </g>
          <line x1={cx - 180 + tug} y1={470} x2={cx + 220} y2={470} stroke={C.brown} strokeWidth={10} />
          <g transform={`translate(${cx + 280} 540)`}>
            <Hero x={0} y={0} s={0.34} t={t} pose="pointLeft" mood="serious" />
          </g>
          <QuoteCard x={cx} y={130} w={760} k={pop(t, at(c, 0.4))} text={"Не иди по стопам Цезарей"} refText="Книга VI" size={46} />
          {virt > 0 &&
            ["простота", "справедливость", "доброжелательность", "пример Антонина"].map((w, i) => (
              <g key={w} transform={`translate(${cx - 390 + i * 260} 760) scale(${pop(t, at(c, 1.1 + i * 0.2))})`}>
                <Tag x={0} y={0} text={w} size={24} color={C.yellow} />
              </g>
            ))}
        </g>
      )}
      {edict > 0 && (
        <g opacity={edict}>
          <g transform={`translate(${cx} 440) scale(${0.8 + 0.2 * edict})`}>
            <rect x={-320} y={-220} width={640} height={420} rx={20} fill={R.parchment} stroke={OL} strokeWidth={6} />
            <Txt x={0} y={-150} size={40} weight={900}>
              сенату
            </Txt>
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={-240} x2={240 - (i === 3 ? 160 : 0)} y1={-80 + i * 50} y2={-80 + i * 50} stroke="#b39463" strokeWidth={6} />
            ))}
            <Big x={0} y={170} text="милосердие" size={56} color={R.terracotta} serif />
          </g>
          <Tag x={cx} y={760} text="по предисловию переводчика" size={28} color="#fff" />
          <Check x={cx + 280} y={330} s={50} k={ramp(t, at(c, 2.6), 0.5)} />
        </g>
      )}
    </g>
  );
};

// ── f06: весы: «люблю себя» тяжелее, но «что подумают другие» перевешивает ──
export const OpinionScale: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const k = ramp(t, 0.2, 0.6);
  const flip = ramp(t, at(c, 0.55), 1.2);
  const shy = ramp(t, at(c, 1), 0.6);
  const tilt = 12 - 24 * flip;
  return (
    <g opacity={k}>
      <rect x={cx - 14} y={300} width={28} height={420} fill={C.brown} />
      <rect x={cx - 120} y={710} width={240} height={30} rx={10} fill={C.brown} />
      <g transform={`translate(${cx} 300) rotate(${tilt})`}>
        <rect x={-400} y={-10} width={800} height={20} rx={10} fill={C.brown} />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 380} 0) rotate(${-tilt})`}>
            <line x1={-70} y1={0} x2={-100} y2={150} stroke={OL} strokeWidth={3} />
            <line x1={70} y1={0} x2={100} y2={150} stroke={OL} strokeWidth={3} />
            <path d="M -120 150 L 120 150 Q 100 200 0 200 Q -100 200 -120 150 Z" fill={R.marbleShade} stroke={OL} strokeWidth={5} />
            {sd < 0 ? (
              <g transform="translate(0 130)">
                <Heart x={0} y={0} s={0.45} color={C.coral} />
                <Txt x={0} y={130} size={28} weight={900}>
                  моё мнение
                </Txt>
              </g>
            ) : (
              <g transform="translate(0 124)">
                {[-50, 0, 50].map((dx) => (
                  <circle key={dx} cx={dx} cy={-6} r={22} fill="#ffd9b0" stroke={OL} strokeWidth={3} />
                ))}
                <Txt x={0} y={136} size={26} weight={900}>
                  «что подумают?»
                </Txt>
              </g>
            )}
          </g>
        ))}
      </g>
      {shy > 0 && (
        <g transform={`translate(${cx} 830) scale(${shy})`}>
          <Tag x={0} y={0} text="стесняемся соседей больше, чем себя" size={30} color={C.yellow} />
        </g>
      )}
    </g>
  );
};

// ── f07: «нравиться тому, кто не нравится себе?» — человек хмурится в зеркало; банан убирает телефон ──
export const PleaseWhom: React.FC<VP> = (c) => {
  const { t } = c;
  const cx = AX(c.p.host);
  const q = ramp(t, 0.3, 0.6) * (1 - ramp(t, at(c, 1), 0.6));
  const done = ramp(t, at(c, 1), 0.6);
  const congr = ramp(t, at(c, 1.5), 0.6);
  return (
    <g>
      {q > 0 && (
        <g opacity={q}>
          <g transform={`translate(${cx + 200} 470)`}>
            <ellipse rx={130} ry={180} fill="#dff1ff" stroke={OL} strokeWidth={8} />
            <ellipse rx={110} ry={160} fill="none" stroke="#fff" strokeWidth={4} opacity={0.6} />
            <Person x={0} y={120} s={1} color={R.purple} t={t} sad />
          </g>
          <Person x={cx - 140} y={610} s={1.2} color={R.purple} t={t} sad />
          <Hero x={cx - 420} y={780} s={0.3} t={t} pose="ask" mood="wonder" />
          <Tag x={cx} y={180} text="нравиться тому, кто не нравится себе?" size={32} color="#fff" />
        </g>
      )}
      {done > 0 && (
        <g opacity={done}>
          <Hero x={cx - 160} y={780} s={0.42} t={t} pose="heart" mood="happy" />
          <g transform={`translate(${cx + 220} ${560 + done * 40}) rotate(${done * 20})`}>
            <Phone x={0} y={0} s={0.6}>
              {congr > 0 && (
                <g transform={`scale(${congr})`}>
                  <rect x={-80} y={-60} width={160} height={80} rx={20} fill={C.yellow} />
                  <Txt x={0} y={-8} size={26} weight={900}>
                    поздравляю!
                  </Txt>
                </g>
              )}
            </Phone>
          </g>
          <Tag x={cx} y={220} text="и это тоже — мой внутренний круг" size={32} color={C.yellow} />
        </g>
      )}
    </g>
  );
};
