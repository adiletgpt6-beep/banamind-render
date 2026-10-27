// Залы 8–11: два голоса Горлума, кролик с травами, лестница историй, почти-раскаяние,
// выбор садовника, Эовин и Мерри, король-целитель и коронация, армия-приманка, две клятвы,
// два сада (искушение Сэма), «могу нести вас», Роковая Щель, король на коленях, Гавани.
import React from "react";
import { interpolate } from "remotion";
import { C, SERIF } from "../theme";
import { cxOf } from "./common";
import { Figure, Label, OL, Ring } from "./figures";
import { Arrow, Check, Cross, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

type P = { host?: string; [k: string]: unknown };

// ── два голоса: светлая и тёмная половины ──
export const TwoVoices: React.FC<VisualProps<P & { a: string; b: string }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  const a = pop(t, at(c, 0.3));
  const b = pop(t, at(c, 0.6));
  const nick = ramp(t, at(c, 1), 0.6);
  return (
    <g>
      <rect x={cx - 420} y={300} width={420} height={560} fill="#eef3e8" />
      <rect x={cx} y={300} width={420} height={560} fill="#e3dde8" />
      <line x1={cx} y1={300} x2={cx} y2={860} stroke={OL} strokeWidth={4} strokeDasharray="14 12" />
      <Figure kind="gollum" x={cx} y={860} s={1.8} t={t} mood={Math.sin(t * 1.5) > 0 ? "sad" : "wild"} eyes={Math.sin(t * 1.5) > 0 ? OL : "#37b24d"} />
      <g transform={`translate(${cx - 330} 230) scale(${a})`}>
        <rect x={-210} y={-60} width={420} height={110} rx={40} fill="#fff" stroke={C.greenDeep} strokeWidth={5} />
        <Txt x={0} y={12} size={38} weight={900} color={C.greenDeep}>
          {p.a}
        </Txt>
      </g>
      <g transform={`translate(${cx + 330} 230) scale(${b})`}>
        <rect x={-210} y={-80} width={420} height={150} rx={40} fill="#fff" stroke={C.violet} strokeWidth={5} />
        {p.b.split("\n").map((l, i) => (
          <Txt key={i} x={0} y={-10 + i * 46} size={36} weight={900} color={C.violet}>
            {l}
          </Txt>
        ))}
      </g>
      <g opacity={nick}>
        <Label x={cx - 230} y={930} text="Крадучка" size={32} bg="#fff" />
        <Label x={cx + 230} y={930} text="Вонючка" size={32} bg="#fff" />
      </g>
    </g>
  );
};

// ── кролик с травами ──
export const Stew: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  return (
    <g>
      <Figure kind="sam" x={cx - 300} y={860} s={1.3} t={t} mood="happy" label="Сэм" arm="hold" />
      <Figure kind="gollum" x={cx + 380} y={860} s={1.1} t={t} mood="angry" label="Горлум" flip />
      {/* костёр и котелок */}
      <g transform={`translate(${cx + 40} 860)`}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-40 + i * 40} 0 q ${wob(t * 3, i, 10)} -60 10 -100 q 14 50 10 100 Z`} fill={i % 2 ? C.ember : C.gold} />
        ))}
        <path d="M -110 -170 L 110 -170 L 90 -60 Q 0 -30 -90 -60 Z" fill="#5a5560" stroke={OL} strokeWidth={5} />
        {[0, 1, 2].map((i) => {
          const k = (t * 0.5 + i / 3) % 1;
          return <circle key={i} cx={-40 + i * 40 + wob(t, i, 8)} cy={-190 - k * 140} r={14 + k * 20} fill="#fff" opacity={0.7 * (1 - k)} />;
        })}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-70 + i * 60} -175 q 10 -30 24 -10`} stroke={C.greenDeep} strokeWidth={6} fill="none" strokeLinecap="round" />
        ))}
      </g>
      <Pop t={t} at={at(c, 0.7)} x={cx + 380} y={420}>
        <Label x={0} y={0} text="«Кар-то-фель?»" size={34} bg="#fff" />
      </Pop>
      <Pop t={t} at={at(c, 1.4)} x={cx} y={220}>
        <Label x={0} y={0} text="«есть-то приходится каждый день»" size={36} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── лестница историй ──
export const Stairs: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const climb = ramp(t, 0.2, Math.max(2, c.dur - 1));
  const laugh = ramp(t, at(c, 1.3), 0.5);
  return (
    <g>
      {Array.from({ length: 9 }).map((_, i) => (
        <rect key={i} x={cx - 640 + i * 140} y={860 - i * 64} width={160} height={64 * (i + 1)} fill={i % 2 ? "#cfc6b8" : "#d9d0c2"} stroke={OL} strokeWidth={3} />
      ))}
      {(() => {
        const i = climb * 7;
        const x = cx - 560 + i * 140;
        const y = 860 - Math.floor(i) * 64 - 4;
        return (
          <g>
            <Figure kind="sam" x={x - 70} y={y + 64} s={0.8} t={t} mood={laugh > 0 ? "happy" : "calm"} />
            <Figure kind="hobbit" x={x + 40} y={y} s={0.8} t={t} mood={laugh > 0 ? "happy" : "calm"} />
          </g>
        );
      })()}
      {/* звезда-фиал как свет истории */}
      <g transform={`translate(${cx + 560} 200)`}>
        <circle r={60 + 8 * Math.sin(t * 2)} fill={C.goldLight} opacity={0.5} />
        <path d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z" fill="#fff" />
      </g>
      <Pop t={t} at={at(c, 1)} x={cx - 140} y={210}>
        <rect x={-460} y={-60} width={920} height={110} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <text x={0} y={14} fontFamily={SERIF} fontWeight={700} fontSize={38} fill={C.ink} textAnchor="middle">
          «в историю какого рода угодили мы?»
        </text>
      </Pop>
    </g>
  );
};

// ── почти раскаяние: рука тянется — и зелёный огонь ──
export const Almost: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const touch = ramp(t, at(c, 0.4), 1.2);
  const wake = ramp(t, at(c, 2), 0.4);
  const green = ramp(t, at(c, 2.5), 0.5);
  return (
    <g>
      <rect x={cx - 700} y={200} width={1400} height={680} rx={60} fill="#dcd6cc" opacity={0.5} />
      {/* спящие хоббиты */}
      <g transform={`translate(${cx - 280} 840) rotate(${-80 * (1 - wake)})`}>
        <Figure kind="sam" x={0} y={0} s={0.9} t={t} mood={wake > 0.5 ? "angry" : "calm"} bob={false} />
      </g>
      <g transform={`translate(${cx - 60} 860) rotate(-82)`}>
        <Figure kind="hobbit" x={0} y={0} s={0.9} t={t} mood="calm" bob={false} />
      </g>
      <g transform={`translate(${cx + 330 - touch * 120} 0)`}>
        <Figure kind="gollum" x={0} y={860} s={1.3} t={t} mood={green > 0 ? "wild" : "sad"} eyes={green > 0 ? "#37b24d" : OL} flip arm={touch > 0.4 && wake < 0.5 ? "out" : "down"} />
      </g>
      {touch > 0.5 && wake < 0.5 && (
        <g opacity={touch}>
          <Label x={cx + 280} y={430} text="«почти заботливо»" size={34} bg={C.goldLight} />
        </g>
      )}
      {wake > 0 && (
        <Pop t={t} at={at(c, 2.1)} x={cx - 240} y={330}>
          <Label x={0} y={0} text="«пролаза!»" size={40} bg="#fff4ec" />
        </Pop>
      )}
      {green > 0 && (
        <g opacity={green}>
          <Txt x={cx} y={180} size={44} weight={900} color={C.ink}>
            «мгновение минуло безвозвратно»
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── выбор садовника: взять Кольцо — и вернуться к другу ──
export const SamChoice: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const take = ramp(t, at(c, 0.8), 0.8);
  const run = ramp(t, at(c, 1.1), 1);
  return (
    <g>
      {/* паутина-логово (абстрактно) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${cx + 700} 140 L ${cx + 200 + i * 90} 900`} stroke="#b9b3c7" strokeWidth={3} />
      ))}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${cx + 640 - i * 120} ${260 + i * 160} Q ${cx + 520 - i * 100} ${300 + i * 160} ${cx + 360 - i * 60} ${330 + i * 180}`} stroke="#b9b3c7" strokeWidth={3} fill="none" />
      ))}
      <g transform={`translate(${-run * 380} 0)`}>
        <Figure kind="sam" x={cx + 60} y={860} s={1.2} t={t} mood={run > 0 ? "angry" : "sad"} label="Сэм" arm={take > 0.5 && run < 0.5 ? "up" : "down"} />
        {take > 0 && run < 0.6 && <Ring x={cx + 140} y={860 - 320} r={22} glow={0.8} t={t} />}
      </g>
      <g transform={`translate(${cx - 520} 860) rotate(-80)`}>
        <Figure kind="hobbit" x={0} y={0} s={1} t={t} mood="calm" bob={false} />
      </g>
      <Pop t={t} at={at(c, 0.9)} x={cx + 260} y={230}>
        <Label x={0} y={0} text="идти одному?" size={36} bg="#fff" />
      </Pop>
      {run > 0.4 && (
        <Pop t={t} at={at(c, 1.3)} x={cx - 300} y={330}>
          <Label x={0} y={0} text="«Не могу без мистера Фродо»" size={34} bg={C.goldLight} />
        </Pop>
      )}
    </g>
  );
};

// ── Эовин и Мерри ──
export const Duo: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const rise = ramp(t, at(c, 1), 0.8);
  const fall = ramp(t, at(c, 1.7), 0.8);
  return (
    <g>
      <g opacity={1 - fall} transform={`translate(${cx + 280} ${fall * 120}) scale(${1 - fall * 0.3})`}>
        <Figure kind="shadow" x={0} y={880} s={1.5} t={t} />
      </g>
      <Pop t={t} at={at(c, 0.3)} x={cx + 280} y={200}>
        <Label x={0} y={0} text="«ни один живой человек…»" size={34} bg="#fff" />
      </Pop>
      <g transform={`translate(0 ${(1 - rise) * 40})`} opacity={clamp01(rise * 1.4)}>
        <Figure kind="lady" x={cx - 160} y={880} s={1} t={t} color="#cfe0f2" label="Эовин" mood="angry" arm="up" />
        <Figure kind="hobbit" x={cx + 60} y={880} s={1} t={t} color="#c98a3a" label="Мерри" mood="angry" arm="out" />
      </g>
      <Pop t={t} at={at(c, 1.3)} x={cx - 220} y={330}>
        <rect x={-310} y={-56} width={620} height={100} rx={30} fill="#fff" stroke={C.skyDeep} strokeWidth={5} />
        <text x={0} y={12} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.skyDeep} textAnchor="middle">
          «Ты смотришь на женщину»
        </text>
      </Pop>
    </g>
  );
};

// ── корона: король-целитель / коронация и жезл ──
export const Crown: React.FC<VisualProps<P & { mode: "heal" | "coronation" }>> = (c) => {
  const { t, p } = c;
  const cx = cxOf(p);
  if (p.mode === "heal") {
    const fold = ramp(t, at(c, 0.3), 0.8);
    const heal = ramp(t, at(c, 2), 1.5);
    return (
      <g>
        {/* свёрнутое знамя */}
        <g transform={`translate(${cx - 560} 260)`}>
          <rect x={0} y={0} width={10} height={420} fill={OL} />
          <rect x={10} y={10} width={260 * (1 - fold)} height={160} fill="#2f3a5a" stroke={OL} strokeWidth={4} />
          {fold < 0.6 && <circle cx={10 + 130 * (1 - fold)} cy={90} r={26} fill="#fff" opacity={1 - fold} />}
          {fold > 0.5 && <rect x={6} y={10} width={18} height={160} rx={8} fill="#2f3a5a" stroke={OL} strokeWidth={3} />}
        </g>
        <Figure kind="man" x={cx - 150} y={860} s={1.1} t={t} color="#6b7a6a" label="Арагорн" mood="calm" arm="out" />
        {/* больные просыпаются */}
        {["Фарамир", "Эовин", "Мерри"].map((w, i) => {
          const k = clamp01(heal * 3 - i);
          return (
            <g key={w} transform={`translate(${cx + 200 + i * 190} 860)`}>
              <rect x={-80} y={-40} width={160} height={40} rx={10} fill="#e6e0d6" stroke={OL} strokeWidth={3} />
              <circle cx={-40} cy={-60} r={28} fill="#ffd9b8" stroke={OL} strokeWidth={4} />
              <Txt x={0} y={44} size={26} weight={900} color={C.inkSoft}>
                {w}
              </Txt>
              {k > 0 && <circle cx={-40} cy={-60} r={50 + 10 * k} fill={C.goldLight} opacity={0.4 * k} />}
              {k > 0.5 && <Check x={40} y={-90} s={26} k={k} />}
            </g>
          );
        })}
        {/* листья целебной травы */}
        {heal > 0 &&
          [0, 1, 2, 3].map((i) => (
            <path key={i} d="M 0 0 q 18 -18 36 0 q -18 18 -36 0" fill={C.green} transform={`translate(${cx + 60 + i * 50 + wob(t, i, 10)} ${560 - ((t * 40 + i * 30) % 120)})`} opacity={0.8} />
          ))}
        <Pop t={t} at={at(c, 1)} x={cx + 380} y={260}>
          <rect x={-380} y={-56} width={760} height={100} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
          <text x={0} y={12} fontFamily={SERIF} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
            «Руки короля — руки целителя»
          </text>
        </Pop>
        <Pop t={t} at={at(c, 3)} x={cx + 380} y={390}>
          <Label x={0} y={0} text="лечит · ждёт · служит" size={36} bg={C.goldLight} />
        </Pop>
      </g>
    );
  }
  const give = ramp(t, at(c, 0.2), 1.2);
  const staff = ramp(t, at(c, 0.7), 0.8);
  return (
    <g>
      <Figure kind="hobbit" x={cx - 380} y={860} s={1} t={t} label="Фродо" arm="up" />
      <Figure kind="man" x={cx - 60} y={860} s={1.05} t={t} color="#6b7a6a" label="Арагорн" mood="happy" />
      <Figure kind="whiteWizard" x={cx + 220} y={860} s={1} t={t} label="Гэндальф" mood="happy" arm="up" />
      <g transform={`translate(${interpolate(give, [0, 1], [cx - 330, cx - 60])} ${interpolate(give, [0, 1], [560, 520])})`}>
        <path d="M -60 20 L -60 -20 L -30 0 L 0 -36 L 30 0 L 60 -20 L 60 20 Z" fill={C.silver} stroke={OL} strokeWidth={4} />
      </g>
      <g opacity={staff} transform={`translate(${cx + 470} 860)`}>
        <Figure kind="man" x={0} y={0} s={0.95} t={t} color="#4f7a55" label="Фарамир" mood="happy" arm="hold" />
        <rect x={50} y={-330} width={12} height={220} fill="#e8e1d6" stroke={OL} strokeWidth={3} />
      </g>
      <Pop t={t} at={at(c, 0.8)} x={cx + 300} y={240}>
        <Label x={0} y={0} text="«Эта служба не кончена»" size={36} bg={C.goldLight} />
      </Pop>
      <Pop t={t} at={at(c, 1.1)} x={cx - 200} y={240}>
        <Label x={0} y={0} text="дальше — самим" size={36} bg="#fff" />
      </Pop>
    </g>
  );
};

// ── армия-приманка: большая стрела к Воротам, маленький путь в стороне ──
export const Decoy: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const march = ramp(t, at(c, 1), 2);
  return (
    <g>
      <rect x={cx + 360} y={320} width={260} height={520} fill="#4a4452" stroke={OL} strokeWidth={5} />
      <rect x={cx + 430} y={560} width={120} height={280} fill="#2f2a36" />
      <Txt x={cx + 490} y={290} size={30} weight={900} color={C.inkSoft}>
        Чёрные Ворота
      </Txt>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={cx - 640 + march * 520 + (i % 4) * 46} y={600 + Math.floor(i / 4) * 60} width={30} height={50} rx={8} fill={["#5a6e8f", "#4f7a55", "#a8443c"][i % 3]} stroke={OL} strokeWidth={3} />
      ))}
      <Arrow x1={cx - 600} y1={540} x2={cx + 340} y2={540} k={march} color={C.red} w={14} />
      <Pop t={t} at={at(c, 1.2)} x={cx - 160} y={460}>
        <Label x={0} y={0} text="приманка для врага" size={34} bg="#fff4ec" />
      </Pop>
      {/* маленький путь Хранителя */}
      <path d={`M ${cx - 600} 900 C ${cx - 300} 860 ${cx} 940 ${cx + 300} 890`} stroke="#b9a47a" strokeWidth={5} strokeDasharray="8 12" fill="none" />
      <Figure kind="hobbit" x={cx - 600 + march * 900} y={900 - Math.sin(march * 3) * 20} s={0.3} t={t} />
      <Pop t={t} at={at(c, 0.4)} x={cx - 160} y={240}>
        <Label x={0} y={0} text="«не оружием»" size={40} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── две клятвы: страх и дружба ──
export const Oaths: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const L = ramp(t, at(c, 0.2), 0.8);
  const R = ramp(t, at(c, 1.1), 0.8);
  return (
    <g>
      <rect x={140} y={150} width={800} height={760} rx={40} fill="#ede7f3" opacity={L} />
      <rect x={980} y={150} width={800} height={760} rx={40} fill="#eef6e6" opacity={R} />
      <g opacity={L}>
        <Figure kind="man" x={400} y={820} s={0.95} t={t} color="#3a3445" label="Денетор" mood="angry" />
        <Figure kind="hobbit" x={640} y={820} s={0.95} t={t} color="#5a7fc4" label="Пин" mood="scared" arm="out" />
        <Txt x={540} y={260} size={38} weight={900} color={C.violet}>
          верность — любовью,
        </Txt>
        <Txt x={540} y={310} size={38} weight={900} color={C.red}>
          предательство — местью
        </Txt>
      </g>
      <g opacity={R}>
        <Figure kind="man" x={1240} y={820} s={0.95} t={t} color="#a07a3a" label="Теоден" mood="happy" />
        <Figure kind="hobbit" x={1480} y={820} s={0.95} t={t} color="#c98a3a" label="Мерри" mood="happy" arm="out" />
        <Txt x={1380} y={260} size={38} weight={900} color={C.greenDeep}>
          «освобождаю от службы,
        </Txt>
        <Txt x={1380} y={310} size={38} weight={900} color={C.greenDeep}>
          но не лишаю дружбы»
        </Txt>
      </g>
      <Pop t={t} at={at(c, 2.1)} x={960} y={470}>
        <rect x={-260} y={-50} width={520} height={90} rx={45} fill={C.gold} stroke={OL} strokeWidth={4} />
        <Txt x={0} y={12} size={38} weight={900}>
          страх или дружба?
        </Txt>
      </Pop>
    </g>
  );
};

// ── два сада: королевство-сад из видения и один маленький сад ──
export const Gardens: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const vision = ramp(t, at(c, 1), 1) * (1 - ramp(t, at(c, 2.4), 1));
  const small = ramp(t, at(c, 3), 0.8);
  return (
    <g>
      {/* огромный сад-королевство из видения */}
      <g opacity={0.25 + 0.75 * vision}>
        <rect x={cx - 760} y={200} width={1520} height={660} rx={40} fill="#dff0c8" />
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={cx - 700 + (i % 9) * 175} cy={300 + Math.floor(i / 9) * 260 + wob(t, i, 6)} r={60} fill={i % 3 ? C.green : C.moss} stroke={OL} strokeWidth={3} />
        ))}
        <Figure kind="sam" x={cx} y={860} s={1.8 + vision * 0.6} t={t} mood="wild" arm="up" />
        <Label x={cx} y={180} text="«Сэммиум Сильный, Герой Эпохи»" size={36} bg="#fff4ec" />
      </g>
      {vision > 0.2 && <Ring x={cx + 260} y={420} r={34} glow={1} t={t} />}
      {small > 0 && (
        <g transform={`translate(${cx} 660) scale(${small})`}>
          <rect x={-260} y={-20} width={520} height={220} rx={20} fill="#f6efdf" stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${-180 + i * 120} 120)`}>
              <line x1={0} y1={0} x2={0} y2={-60} stroke={C.greenDeep} strokeWidth={6} />
              <circle cx={0} cy={-70} r={18} fill={[C.coral, C.gold, C.violet, C.sky][i]} />
            </g>
          ))}
          <Txt x={0} y={260} size={38} weight={900} color={C.greenDeep}>
            один маленький сад
          </Txt>
          <Check x={300} y={60} s={40} k={small} />
        </g>
      )}
      {small > 0.5 && <Cross x={cx - 560} y={260} s={70} k={small} />}
    </g>
  );
};

// ── «я могу нести вас» ──
export const Carry: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const carry = ramp(t, at(c, 1), 1);
  const up = ramp(t, at(c, 1), Math.max(2, c.dur - at(c, 1)));
  const x = cx - 420 + up * 600;
  const y = 880 - up * 260;
  return (
    <g>
      <path d={`M ${cx - 760} 900 L ${cx + 300} 560 L ${cx + 760} 900 Z`} fill="#b7a7a0" stroke={OL} strokeWidth={5} />
      <path d={`M ${cx + 240} 590 L ${cx + 300} 560 L ${cx + 360} 600`} fill="none" stroke={C.ember} strokeWidth={8} />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle key={i} cx={(cx - 700 + i * 160 + t * 30) % 1920} cy={200 + (i * 73) % 300} r={6} fill="#8a817c" opacity={0.5} />
      ))}
      {carry < 0.5 ? (
        <g>
          <Figure kind="sam" x={x - 60} y={y} s={1} t={t} mood="sad" />
          <Figure kind="hobbit" x={x + 60} y={y} s={1} t={t} mood="sad" />
        </g>
      ) : (
        <g>
          <Figure kind="sam" x={x} y={y} s={1} t={t} mood="happy" arm="up" />
          <g transform={`translate(${x} ${y - 160}) rotate(-70)`}>
            <Figure kind="hobbit" x={0} y={0} s={0.9} t={t} mood="calm" bob={false} />
          </g>
        </g>
      )}
      <Pop t={t} at={at(c, 1.3)} x={cx - 160} y={240}>
        <rect x={-480} y={-60} width={960} height={110} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <text x={0} y={14} fontFamily={SERIF} fontWeight={700} fontSize={38} fill={C.ink} textAnchor="middle">
          «не могу нести его за вас, но могу нести вас»
        </text>
      </Pop>
    </g>
  );
};

// ── Роковая Щель: «Кольцо моё!», Горлум, падение ──
export const Doom: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const claim = ramp(t, at(c, 1.4), 0.5);
  const lunge = ramp(t, at(c, 2.2), 0.6);
  const fall = ramp(t, at(c, 2.75), 1.2);
  const glow = 0.5 + 0.2 * Math.sin(t * 3);
  return (
    <g>
      <rect x={260} y={120} width={1560} height={820} rx={30} fill="#8a7470" opacity={0.6} />
      {/* расщелина и огонь */}
      <path d="M 1000 940 L 1080 600 L 1180 600 L 1260 940 Z" fill={C.ember} opacity={glow + 0.3} />
      <path d="M 1030 940 L 1100 660 L 1160 660 L 1230 940 Z" fill={C.gold} opacity={glow} />
      <rect x={260} y={600} width={820} height={30} fill="#3d3236" />
      <Figure kind="hobbit" x={860} y={600} s={1.25} t={t} mood={claim > 0 ? "wild" : "sad"} label={claim > 0.5 ? "«Кольцо моё!»" : "Фродо"} opacity={1 - claim * 0.65} arm={claim > 0 ? "up" : "down"} />
      {claim < 0.5 && <Ring x={940} y={420} r={26} glow={1} t={t} />}
      {/* Горлум: бросок и падение */}
      <g transform={`translate(${interpolate(lunge, [0, 1], [460, 900]) + fall * 220} ${fall * 420})`} opacity={1 - fall * 0.9}>
        <Figure kind="gollum" x={0} y={600} s={1.2} t={t} mood="wild" eyes="#37b24d" arm={lunge > 0.5 ? "up" : "out"} />
        {lunge > 0.5 && <Ring x={50} y={380} r={22} glow={1} t={t} />}
      </g>
      {fall > 0.6 && (
        <g opacity={clamp01(fall * 2 - 1)}>
          <circle cx={1130} cy={700} r={120 * fall} fill="#fff1c8" opacity={0.5} />
          <Label x={1130} y={300} text="никто его не толкает" size={36} bg="#fff" />
        </g>
      )}
    </g>
  );
};

// ── король на коленях перед хоббитами ──
export const Kneel: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const kneel = ramp(t, 0.4, 1);
  return (
    <g>
      {Array.from({ length: 14 }).map((_, i) => (
        <Figure key={i} kind="man" x={cx - 700 + i * 108} y={560} s={0.45} t={t + i} color={["#5a6e8f", "#4f7a55", "#a07a3a"][i % 3]} mood="happy" opacity={0.7} />
      ))}
      <Figure kind="hobbit" x={cx - 140} y={880} s={1.1} t={t} label="Фродо" mood="happy" />
      <Figure kind="sam" x={cx + 20} y={880} s={1.1} t={t} label="Сэм" mood="happy" />
      <g transform={`translate(${cx + 330} ${880}) scale(1 ${1 - kneel * 0.35})`}>
        <Figure kind="man" x={0} y={0} s={1.05} t={t} color="#6b7a6a" mood="happy" bob={false} />
      </g>
      <Txt x={cx + 330} y={930} size={30} weight={900} color={C.inkSoft}>
        Арагорн
      </Txt>
      <Pop t={t} at={at(c, 0.6)} x={cx} y={220}>
        <Label x={0} y={0} text="«Воздайте им великую славу!»" size={40} bg={C.goldLight} />
      </Pop>
    </g>
  );
};

// ── Серые гавани: корабль уходит, Сэм возвращается ──
export const Havens: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const sail = ramp(t, at(c, 0.3), Math.max(2, at(c, 1) - 0.3));
  const home = ramp(t, at(c, 1), 1);
  return (
    <g>
      <rect x={0} y={560} width={1920} height={440} fill="#9ccfe6" opacity={0.7} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${((t * 40 + i * 500) % 2200) - 200} ${640 + i * 60} q 40 -16 80 0 t 80 0`} stroke="#fff" strokeWidth={5} fill="none" opacity={0.7} />
      ))}
      <g transform={`translate(${cx + 100 + sail * 500} ${620 - sail * 40}) scale(${1 - sail * 0.6})`} opacity={1 - sail * 0.3}>
        <path d="M -160 0 L 160 0 L 120 60 L -120 60 Z" fill="#f4f4f8" stroke={OL} strokeWidth={5} />
        <rect x={-4} y={-240} width={8} height={240} fill={OL} />
        <path d="M 6 -230 Q 130 -130 6 -20 Z" fill="#fff" stroke={OL} strokeWidth={4} />
      </g>
      <g transform={`translate(${cx - 520} 0)`} opacity={home}>
        {/* дом с круглой дверью и жёлтым окном */}
        <path d="M -180 560 Q 0 300 180 560 Z" fill="#a6dd8a" stroke={OL} strokeWidth={5} />
        <circle cx={0} cy={500} r={46} fill="#c98a3a" stroke={OL} strokeWidth={4} />
        <circle cx={100} cy={470} r={22} fill={C.goldLight} stroke={OL} strokeWidth={3} />
        <Figure kind="sam" x={-220} y={570} s={0.9} t={t} mood="calm" label="Сэм" />
      </g>
      <Pop t={t} at={at(c, 1.4)} x={cx} y={220}>
        <rect x={-320} y={-56} width={640} height={100} rx={30} fill="#fff" stroke={OL} strokeWidth={4} />
        <text x={0} y={12} fontFamily={SERIF} fontWeight={700} fontSize={44} fill={C.ink} textAnchor="middle">
          «Ладно, я вернулся»
        </text>
      </Pop>
    </g>
  );
};
