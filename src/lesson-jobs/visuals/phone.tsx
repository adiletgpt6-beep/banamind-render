// «iPhone и iPad»: страх перед телефоном, откуда мультитач, стекло за полгода,
// перезагрузка дизайна, три устройства в одном, планшет и магазин программ, антенна.
import React from "react";
import { C } from "../theme";
import { Note, OL, Person, Phone, Player, Stage, Tablet } from "./draw";
import { Arrow, Check, Cross, Panel, Pop, Tag, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";

// ── p01: плеер в опасности ──
export const PhoneThreat: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const pie = ramp(t, 0.2, 1.2);
  const eat = ramp(t, at(c, 1), 1.6);
  const clunky = ramp(t, at(c, 2), 0.8);
  const ang = Math.PI * 2 * 0.45 * pie;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 420)">
        <circle r={200} fill={C.concrete} />
        <path d={`M 0 0 L 0 -200 A 200 200 0 ${ang > Math.PI ? 1 : 0} 1 ${Math.sin(ang) * 200} ${-Math.cos(ang) * 200} Z`} fill={C.yellowDeep} />
        <Txt x={0} y={260} size={30} weight={900}>
          {"≈ половина прибыли — плеер"}
        </Txt>
      </g>
      <g transform="translate(900 450)">
        <Player x={-90 * eat} y={0} s={1.1 * (1 - eat * 0.6)} t={t} />
        {eat > 0 && (
          <g opacity={eat} transform={`translate(${120 - eat * 60} 0)`}>
            <Phone x={0} y={0} s={0.9} t={t} k={0} keys={1} />
            <path d={`M -90 ${-40 + Math.sin(t * 8) * 10} L -140 0 L -90 ${40 - Math.sin(t * 8) * 10}`} fill={C.red} opacity={0.6} />
          </g>
        )}
      </g>
      {clunky > 0 && (
        <g opacity={clunky}>
          <Note x={900} y={800} text={"совместный телефон —\nнеуклюжий"} k={clunky} color="#ffe7e3" size={26} rot={-2} />
          <Tag x={330} y={820} text="«сделаем сами»" color={C.yellow} size={32} />
        </g>
      )}
    </Stage>
  );
};

// ── p02: откуда мультитач — версии ──
export const MultitouchOrigin: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const touch = ramp(t, 0.2, 1);
  const v1 = ramp(t, at(c, 1), 0.8);
  const v2 = ramp(t, at(c, 2), 0.8);
  const tab = ramp(t, at(c, 3), 1.2);
  const fx = Math.sin(t * 1.4) * 60;
  return (
    <Stage host={c.p.host}>
      <g transform="translate(640 300)" opacity={touch * (1 - tab)}>
        <rect x={-220} y={-120} width={440} height={240} rx={24} fill={C.screen} />
        {[-1, 1].map((d) => (
          <g key={d} transform={`translate(${d * (60 + Math.abs(fx))} 0)`}>
            <circle r={30} fill={C.white} opacity={0.35} />
            <circle r={14} fill={C.white} opacity={0.85} />
          </g>
        ))}
        <Txt x={0} y={170} size={28} color={C.inkSoft}>
          {"экран чувствует несколько касаний"}
        </Txt>
      </g>
      {v1 > 0 && (
        <g opacity={v1} transform="translate(250 640)">
          <Panel x={-220} y={-110} w={440} h={240} fill="#eef6ff" />
          <Txt x={0} y={-60} size={28} weight={900}>
            {"версия Джобса"}
          </Txt>
          <g transform="translate(-90 30) rotate(30)">
            <rect x={-8} y={-60} width={16} height={120} rx={8} fill={C.steel} />
          </g>
          <Cross x={-90} y={30} s={80} k={v1} />
          <Txt x={70} y={40} size={24} color={C.inkSoft}>
            {"«никакого\nстилуса»"}
          </Txt>
        </g>
      )}
      {v2 > 0 && (
        <g opacity={v2} transform="translate(1030 640)">
          <Panel x={-220} y={-110} w={440} h={240} fill="#f4f1ff" />
          <Txt x={0} y={-60} size={28} weight={900}>
            {"версия Айва"}
          </Txt>
          <Txt x={0} y={0} size={24} color={C.inkSoft}>
            {"группа уже пробовала\nмультитач"}
          </Txt>
          <Tag x={0} y={95} text="+ куплены патенты на жесты" color={C.white} size={22} />
        </g>
      )}
      {tab > 0 && (
        <g opacity={tab}>
          <Tablet x={540} y={330} s={0.5} t={t} />
          <Arrow x1={640} y1={330} x2={720} y2={330} k={tab} />
          <Phone x={790} y={330} s={0.42} t={t} k={tab} />
        </g>
      )}
    </Stage>
  );
};

// ── p03: стекло за полгода ──
export const GorillaGlass: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const scratch = ramp(t, 0.2, 1);
  const talk = ramp(t, at(c, 1), 0.8);
  const plant = ramp(t, at(c, 2), 1.4);
  const note = pop(t, at(c, 2.6));
  return (
    <Stage host={c.p.host}>
      <g transform="translate(260 400)">
        <rect x={-110} y={-200} width={220} height={400} rx={30} fill="#d6e6f2" stroke={OL} strokeWidth={4} />
        {scratch > 0 &&
          [0, 1, 2].map((i) => <line key={i} x1={-70 + i * 30} y1={-120 + i * 70} x2={(-70 + i * 30 + 120) * 1} y2={-90 + i * 70} stroke={C.steel} strokeWidth={3} opacity={scratch * (1 - plant)} />)}
        <Txt x={0} y={250} size={26} color={C.inkSoft}>
          {plant > 0.5 ? "прочное стекло" : "пластик царапается"}
        </Txt>
        {plant > 0.5 && <rect x={-110} y={-200} width={220} height={400} rx={30} fill={C.white} opacity={0.35 + 0.2 * Math.sin(t * 2)} />}
      </g>
      {talk > 0 && (
        <g opacity={talk}>
          <Person x={560} y={840} s={0.42} color={C.ink} name="Джобс" t={t} gesture="point" />
          <Person x={820} y={840} s={0.42} color={C.skyDeep} name="Уикс" t={t} seed={3} flip />
          <Note x={700} y={560} text={"«пусть это вас\nне пугает»"} k={talk} color={C.white} size={26} />
        </g>
      )}
      {plant > 0 && (
        <g opacity={plant} transform="translate(1060 340)">
          <path d="M -150 120 L -150 -20 L -80 -60 L -80 -20 L -10 -60 L -10 -20 L 60 -60 L 60 120 Z" fill={C.concrete} stroke={OL} strokeWidth={4} />
          <rect x={90} y={-120} width={30} height={240} fill={C.steel} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={105 + wob(t * 2, i, 10)} cy={-150 - ((t * 40 + i * 30) % 90)} r={14} fill="#fff" opacity={0.6} />
          ))}
          <Txt x={-30} y={190} size={28} weight={900}>
            {"< 6 месяцев"}
          </Txt>
        </g>
      )}
      {note > 0 && (
        <g transform={`translate(1050 680) scale(${note})`} opacity={clamp01(note)}>
          <rect x={-150} y={-60} width={300} height={120} rx={6} fill={C.woodLight} />
          <rect x={-130} y={-44} width={260} height={88} rx={4} fill={C.white} />
          <Txt x={0} y={10} size={22} weight={900}>
            {"«без вас ничего бы не вышло»"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── p04: перезагрузка дизайна ──
export const Redesign: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const night = ramp(t, 0.2, 0.8);
  const swap = ramp(t, at(c, 1), 1.6);
  const pride = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={night * (1 - swap * 0.4)}>
        <circle cx={1080} cy={220} r={60} fill={C.yellow} opacity={0.6} />
        <circle cx={1105} cy={205} r={52} fill={C.cream} />
      </g>
      <g transform="translate(420 470)">
        <rect x={-130} y={-230} width={260} height={460} rx={40} fill={C.steel} stroke={OL} strokeWidth={5} opacity={1 - swap} />
        <rect x={-90} y={-170} width={180} height={300} rx={10} fill={C.screen} opacity={1 - swap} />
        <Txt x={0} y={290} size={26} color={C.inkSoft} opacity={1 - swap}>
          {"корпус спорит с экраном"}
        </Txt>
      </g>
      <g transform="translate(840 470)" opacity={swap}>
        <Phone x={0} y={0} s={1.25} t={t} k={swap} />
        <Txt x={0} y={290} size={26} color={C.inkSoft}>
          {"стекло до края, тонкий ободок"}
        </Txt>
      </g>
      <g transform={`translate(630 ${470 - Math.sin(swap * Math.PI) * 60})`} opacity={Math.sin(swap * Math.PI)}>
        <circle r={70} fill={C.yellow} stroke={OL} strokeWidth={4} />
        <path d="M -30 -10 A 32 32 0 1 1 -20 24" stroke={OL} strokeWidth={8} fill="none" />
        <path d="M -40 -26 L -30 -6 L -12 -18" stroke={OL} strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      {pride > 0 && <Tag x={640} y={170} text="одно из решений, которыми он гордился" color={C.green} size={28} textColor={C.white} />}
    </Stage>
  );
};

// ── p05: три устройства — одно ──
export const ThreeInOne: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const three = ramp(t, 0.3, 1.2);
  const merge = ramp(t, at(c, 1), 1.6);
  const sales = ramp(t, at(c, 2), 1.4);
  const labels = ["плеер", "телефон", "интернет"];
  return (
    <Stage host={c.p.host}>
      {labels.map((w, i) => {
        const a = (i / 3) * Math.PI * 2 + t * (1 + merge * 3) * 0.6;
        const r = 260 * (1 - merge);
        const k = clamp01(three * 3 - i);
        return (
          <g key={w} opacity={k * (1 - merge * 0.9)} transform={`translate(${640 + Math.cos(a) * r} ${470 + Math.sin(a) * r * 0.6})`}>
            <circle r={90} fill={[C.coral, C.green, C.sky][i]} stroke={OL} strokeWidth={4} />
            <Txt x={0} y={10} size={28} weight={900} color={C.white}>
              {w}
            </Txt>
          </g>
        );
      })}
      {merge > 0.5 && (
        <g opacity={clamp01(merge * 2 - 1)}>
          <Phone x={640} y={470} s={1.1} t={t} k={1} />
          <Tag x={640} y={170} text="это одно устройство" color={C.yellow} size={34} />
        </g>
      )}
      {sales > 0 && (
        <g opacity={sales}>
          <Note x={230} y={760} text={"«самый дорогой\nтелефон в мире»"} k={sales} color="#ffe7e3" size={24} rot={-3} />
          <Arrow x1={400} y1={760} x2={860} y2={760} k={sales} color={C.green} />
          <Tag x={1030} y={760} text="90 млн к концу 2010" color={C.green} size={28} textColor={C.white} />
        </g>
      )}
    </Stage>
  );
};

// ── p06: двадцать макетов, разочарование и магазин программ ──
export const TabletApps: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const models = ramp(t, 0.2, 1.6);
  const mood = ramp(t, at(c, 1), 1);
  const apps = ramp(t, at(c, 2), 1.6);
  return (
    <Stage host={c.p.host}>
      {Array.from({ length: 20 }).map((_, i) => {
        const k = clamp01(models * 20 - i);
        const w = 60 + (i % 5) * 14;
        return <rect key={i} x={140 + (i % 10) * 104 - w / 2 + 40} y={200 + Math.floor(i / 10) * 140} width={w} height={w * 1.3} rx={8} fill={C.steelDark} opacity={k * (1 - mood)} />;
      })}
      <Txt x={640} y={170} size={28} color={C.inkSoft} opacity={models * (1 - mood)}>
        {"двадцать макетов разного размера"}
      </Txt>
      {mood > 0 && (
        <g opacity={mood}>
          <Tablet x={400} y={600} s={0.75} t={t} />
          <g transform="translate(780 540)">
            <path d={`M 0 0 L 80 ${60 * (1 - mood)} L 160 ${80 - 160 * mood} L 240 ${-100 * mood}`} stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" />
            <Txt x={120} y={110} size={26} color={C.inkSoft}>
              {"отзывы → миллион за месяц"}
            </Txt>
          </g>
        </g>
      )}
      {apps > 0 && (
        <g opacity={apps} transform="translate(1000 360)">
          {Array.from({ length: 16 }).map((_, i) => {
            const k = clamp01(apps * 16 - i);
            return <rect key={i} x={-150 + (i % 4) * 76} y={-150 + Math.floor(i / 4) * 76} width={60} height={60} rx={14} fill={[C.coral, C.sky, C.green, C.yellow, C.violet][i % 5]} opacity={k} transform={`scale(${0.6 + 0.4 * k})`} />;
          })}
          <Txt x={0} y={190} size={24} color={C.inkSoft}>
            {"сначала был против"}
          </Txt>
          <Check x={150} y={190} s={22} k={apps} />
        </g>
      )}
    </Stage>
  );
};

// ── p07: «мы несовершенны» ──
export const Antenna: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const bars = ramp(t, 0.2, 0.6);
  const defend = ramp(t, at(c, 1), 0.8);
  const truth = ramp(t, at(c, 2), 0.8);
  const lose = 0.5 + 0.5 * Math.sin(t * 2);
  return (
    <Stage host={c.p.host}>
      <g transform="translate(330 470)" opacity={bars}>
        <Phone x={0} y={0} s={1} t={t} k={1} />
        <g transform="translate(-60 -230)">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={i * 26} y={-i * 14} width={18} height={20 + i * 14} rx={3} fill={i < 5 * lose ? C.green : C.concrete} />
          ))}
        </g>
        <ellipse cx={-60} cy={160} rx={60} ry={34} fill="#f1d3b5" stroke={OL} strokeWidth={3} opacity={0.9} />
      </g>
      {defend > 0 && (
        <g opacity={defend * (1 - truth * 0.6)}>
          <Person x={760} y={840} s={0.42} color={C.ink} name="Джобс" t={t} gesture="arms" />
          <Note x={760} y={520} text={"сначала — оборона"} k={defend} color="#ffe7e3" size={26} />
          <Person x={1060} y={840} s={0.42} color={C.violet} name="Маккенна" t={t} seed={2} flip />
        </g>
      )}
      {truth > 0 && (
        <g opacity={truth}>
          <Panel x={620} y={170} w={560} h={150} fill={C.white} />
          <Txt x={900} y={240} size={34} weight={900}>
            {"«Мы несовершенны»"}
          </Txt>
          <Txt x={900} y={290} size={24} color={C.inkSoft}>
            {"+ бесплатные чехлы"}
          </Txt>
          <Pop t={t} at={at(c, 2.2)} x={1060} y={650}>
            <Tag x={0} y={0} text="просто правда" color={C.green} size={28} textColor={C.white} />
          </Pop>
        </g>
      )}
    </Stage>
  );
};
