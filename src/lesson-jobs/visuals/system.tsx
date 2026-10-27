// «Система»: из десяти задач — три, цифровой узел и перекрёсток; тайный магазин на
// складе; плеер на тысячу песен; спор об отцовстве; девяносто девять центов;
// продукт как система и сад за стеной.
import React from "react";
import { C } from "../theme";
import { ColorPod, Coin, Note, OL, Person, Player, Stage } from "./draw";
import { Arrow, Check, Cross, Panel, Tag, Txt, at, clamp01, pop, ramp, type VisualProps } from "./kit";

// дорожный указатель на перекрёстке
export const Crossroads: React.FC<{ x: number; y: number; k: number; s?: number }> = ({ x, y, k, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={k}>
    <rect x={-8} y={-200} width={16} height={260} fill={C.steelDark} />
    <g transform="rotate(-8) translate(0 -170)">
      <rect x={-210} y={-34} width={240} height={60} rx={8} fill={C.green} stroke={OL} strokeWidth={3} />
      <Txt x={-90} y={8} size={26} weight={900} color={C.white}>
        {"Технологии"}
      </Txt>
    </g>
    <g transform="rotate(8) translate(0 -100)">
      <rect x={-30} y={-34} width={270} height={60} rx={8} fill={C.skyDeep} stroke={OL} strokeWidth={3} />
      <Txt x={105} y={8} size={24} weight={900} color={C.white}>
        {"Гуманитарное"}
      </Txt>
    </g>
  </g>
);

// ── s01: десять задач → три; цифровой узел; перекрёсток ──
export const DigitalHub: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const list = ramp(t, 0.2, 1);
  const strike = ramp(t, at(c, 0.6), 1.2);
  const hub = ramp(t, at(c, 1), 1.4);
  const sign = ramp(t, at(c, 2), 0.8);
  const keep = [0, 3, 6];
  return (
    <Stage host={c.p.host}>
      <g opacity={list * (1 - hub * 0.75) * (1 - sign * 0.9)} transform={`translate(${-hub * 140} 0)`}>
        <Panel x={120} y={150} w={420} h={680} fill={C.white} />
        {Array.from({ length: 10 }).map((_, i) => {
          const k = keep.includes(i);
          return (
            <g key={i} transform={`translate(160 ${210 + i * 62})`}>
              <Txt x={0} y={14} size={30} anchor="start" weight={900} color={k ? C.ink : C.inkSoft}>
                {`${i + 1}. задача`}
              </Txt>
              {!k && <line x1={-10} y1={2} x2={-10 + 300 * clamp01(strike * 10 - (i - (i > 3 ? 1 : 0)) * 1.2)} y2={2} stroke={C.red} strokeWidth={6} />}
            </g>
          );
        })}
      </g>
      {hub > 0 && (
        <g opacity={hub} transform="translate(800 470)">
          <ColorPod x={0} y={120} s={0.7} color={C.teal} t={t} />
          {["камера", "плеер", "фото", "музыка", "видео"].map((w, i) => {
            const a = -Math.PI / 2 + ((i - 2) * Math.PI) / 3.2;
            const x = Math.cos(a) * 330;
            const y = Math.sin(a) * 280 + 20;
            const k = clamp01(hub * 5 - i);
            return (
              <g key={w} opacity={k}>
                <line x1={0} y1={-20} x2={x * k} y2={y * k} stroke={C.teal} strokeWidth={5} strokeDasharray="12 8" strokeDashoffset={-t * 40} />
                <Tag x={x} y={y} text={w} color={C.white} size={26} />
              </g>
            );
          })}
        </g>
      )}
      {sign > 0 && <Crossroads x={260} y={760} k={sign} s={0.8} />}
    </Stage>
  );
};

// ── s02: магазин-прототип на складе ──
export const StorePrototype: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const shelf = ramp(t, 0.2, 0.8);
  const ware = ramp(t, at(c, 1), 1);
  const regroup = ramp(t, at(c, 2.5), 1.6);
  const bar = ramp(t, at(c, 3), 0.8);
  const zones = ["кино", "фото", "музыка"];
  const models = ["модель А", "модель Б", "модель В"];
  return (
    <Stage host={c.p.host}>
      <g opacity={shelf * (1 - ware)}>
        <rect x={140} y={250} width={1000} height={420} rx={12} fill={C.wood} opacity={0.3} />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={170 + i * 105} y={340 + (i % 2) * 150} width={90} height={110} rx={8} fill={[C.beige, C.sky, C.coral][i % 3]} stroke={OL} strokeWidth={3} />
        ))}
        <Txt x={640} y={220} size={30} color={C.inkSoft}>
          {"затерялись среди чужих коробок"}
        </Txt>
      </g>
      {ware > 0 && (
        <g opacity={ware}>
          <path d="M 120 300 L 640 160 L 1160 300 L 1160 820 L 120 820 Z" fill={C.concrete} stroke={OL} strokeWidth={5} />
          <rect x={180} y={360} width={920} height={420} rx={14} fill={C.white} stroke={OL} strokeWidth={3} />
          {[0, 1, 2].map((i) => {
            const x = 330 + i * 310;
            return (
              <g key={i}>
                <rect x={x - 120} y={520} width={240} height={30} rx={8} fill={C.woodLight} stroke={OL} strokeWidth={2} />
                <ColorPod x={x - 40} y={515} s={0.2} color={[C.teal, C.coral, C.violet][i]} t={t} />
                <Txt x={x} y={600} size={28} weight={900} color={regroup > 0.5 ? C.greenDeep : C.inkSoft}>
                  {regroup > 0.5 ? zones[i] : models[i]}
                </Txt>
              </g>
            );
          })}
          <Txt x={640} y={420} size={28} color={C.inkSoft}>
            {"тайный макет на складе"}
          </Txt>
          {regroup > 0 && regroup < 1 && <rect x={180} y={360} width={920} height={420} rx={14} fill={C.yellow} opacity={0.2 * Math.sin(regroup * Math.PI)} />}
        </g>
      )}
      {regroup > 0 && (
        <g opacity={regroup}>
          <Person x={1060} y={860} s={0.38} color={C.green} name="Джонсон" t={t} gesture="point" flip />
          <Note x={1050} y={250} text={"«Рон прав»"} k={regroup} color={C.yellow} size={30} rot={4} />
        </g>
      )}
      {bar > 0 && (
        <g opacity={bar} transform="translate(640 700)">
          <rect x={-200} y={-30} width={400} height={60} rx={14} fill={C.white} stroke={OL} strokeWidth={3} />
          <Txt x={0} y={12} size={26} weight={900}>
            {"стойка консультаций"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s03: плеер на тысячу песен ──
export const PlayerBuild: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const disk = pop(t, at(c, 0.4));
  const team = ramp(t, at(c, 1), 1.4);
  const pocket = ramp(t, at(c, 2), 1);
  const songs = Math.round(1000 * clamp01(pocket * 1.2));
  return (
    <Stage host={c.p.host}>
      {disk > 0 && (
        <g transform={`translate(260 330) scale(${disk})`} opacity={clamp01(disk) * (1 - pocket * 0.6)}>
          <rect x={-90} y={-90} width={180} height={180} rx={14} fill={C.steelDark} stroke={OL} strokeWidth={4} />
          <circle r={64} fill={C.concrete} stroke={OL} strokeWidth={3} />
          <circle r={12} fill={C.steel} />
          <line x1={0} y1={0} x2={Math.cos(t * 3) * 56} y2={Math.sin(t * 3) * 56} stroke={C.yellowDeep} strokeWidth={4} />
          <Txt x={0} y={140} size={26} color={C.inkSoft}>
            {"диск размером с монету"}
          </Txt>
          <Txt x={0} y={180} size={26} color={C.inkSoft}>
            {"Рубинштейн"}
          </Txt>
        </g>
      )}
      <g transform="translate(700 470)">
        <Player x={0} y={0} s={1.5 * (0.5 + 0.5 * clamp01(team * 2))} t={t} spin={clamp01(team * 2 - 0.5)} />
      </g>
      {team > 0 &&
        [
          ["Фаделл", "команда", 1030, 260],
          ["Шиллер", "колесо", 1060, 470],
          ["Айв", "белый цвет", 1030, 680],
        ].map(([n, w, x, y], i) => (
          <g key={n as string} opacity={clamp01(team * 3 - i)}>
            <Tag x={x as number} y={y as number} text={`${n} — ${w}`} color={[C.white, C.yellow, C.white][i]} size={26} />
            <Arrow x1={(x as number) - 160} y1={y as number} x2={820} y2={420 + i * 40} k={clamp01(team * 3 - i)} w={5} />
          </g>
        ))}
      {pocket > 0 && (
        <g opacity={pocket}>
          <path d="M 120 760 L 520 760 L 500 880 L 140 880 Z" fill={C.skyDeep} stroke={OL} strokeWidth={4} />
          <Player x={320} y={790} s={0.45} t={t} />
          <Txt x={320} y={730} size={30} weight={900}>
            {`${songs} песен в кармане`}
          </Txt>
          <Tag x={860} y={740} text="не больше трёх нажатий" color={C.green} size={26} textColor={C.white} />
        </g>
      )}
    </Stage>
  );
};

// ── s04: у продукта много родителей ──
export const FatherDispute: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const two = ramp(t, 0.2, 0.8);
  const poster = ramp(t, at(c, 1), 0.8);
  const many = ramp(t, at(c, 2), 1.4);
  return (
    <Stage host={c.p.host}>
      <Player x={640} y={420} s={1.1} t={t} />
      <g opacity={two * (1 - many * 0.5)}>
        <Person x={330} y={820} s={0.44} color={C.violet} name="Рубинштейн" t={t} gesture="point" />
        <Person x={950} y={820} s={0.44} color={C.coral} name="Фаделл" t={t} seed={2} gesture="point" flip />
        <Txt x={640} y={190} size={34} weight={900}>
          {"«отец — я»  ·  «нет, я»"}
        </Txt>
      </g>
      {poster > 0 && (
        <g opacity={poster * (1 - many * 0.6)} transform="translate(1080 360) rotate(4)">
          <rect x={-110} y={-150} width={220} height={300} rx={8} fill={C.yellowDeep} stroke={OL} strokeWidth={4} />
          <path d="M -30 120 Q -40 30 -10 -10 Q 20 -60 0 -100 M -10 -10 Q 30 20 60 10" stroke={OL} strokeWidth={14} fill="none" strokeLinecap="round" />
          <circle cx={4} cy={-118} r={20} fill={OL} />
          <path d="M 0 -96 Q 40 -40 50 40" stroke={C.white} strokeWidth={4} fill="none" />
          <Txt x={0} y={190} size={22} color={C.inkSoft}>
            {"придумали в агентстве"}
          </Txt>
        </g>
      )}
      {many > 0 &&
        Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2 + t * 0.2;
          const k = clamp01(many * 9 - i);
          return <Person key={i} x={640 + Math.cos(a) * 380 * k} y={500 + Math.sin(a) * 220 * k} s={0.24} color={[C.sky, C.coral, C.green, C.violet, C.yellowDeep, C.teal][i % 6]} t={t} seed={i} opacity={k} />;
        })}
      {many > 0.6 && <Tag x={640} y={170} text="у продукта много родителей" color={C.yellow} size={32} />}
    </Stage>
  );
};

// ── s05: девяносто девять центов ──
export const MusicStore: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const free = ramp(t, 0.2, 0.8);
  const coin = pop(t, at(c, 1) + 0.3);
  const split = ramp(t, at(c, 1.6), 0.8);
  const fast = ramp(t, at(c, 2), 1.4);
  return (
    <Stage host={c.p.host}>
      <g opacity={free * (1 - coin)}>
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i} transform={`translate(${180 + i * 100} ${260 + Math.sin(t * 2 + i) * 30})`}>
            <path d="M -10 20 L -10 -24 L 20 -32 L 20 12" stroke={C.inkSoft} strokeWidth={6} fill="none" strokeLinecap="round" />
            <circle cx={-16} cy={22} r={9} fill={C.inkSoft} />
          </g>
        ))}
        <Cross x={640} y={260} s={110} k={ramp(t, at(c, 0.5), 0.6)} />
        <Txt x={640} y={400} size={28} color={C.red}>
          {"незаконное скачивание"}
        </Txt>
      </g>
      {coin > 0 && (
        <g transform={`translate(360 560) scale(${coin})`} opacity={clamp01(coin)}>
          <Coin x={0} y={0} r={120} label="99¢" />
          <Txt x={0} y={180} size={28} color={C.inkSoft}>
            {"за одну песню"}
          </Txt>
        </g>
      )}
      {split > 0 && (
        <g opacity={split} transform="translate(360 560)">
          <path d="M 0 0 L 0 -120 A 120 120 0 1 1 -113 40 Z" fill={C.coral} opacity={0.45} />
          <Txt x={0} y={-150} size={26} weight={900} color={C.red}>
            {"70¢ — музыкальным компаниям"}
          </Txt>
        </g>
      )}
      {fast > 0 && (
        <g opacity={fast} transform="translate(920 600)">
          <Panel x={-260} y={-200} w={520} h={380} fill={C.white} />
          <Txt x={0} y={-140} size={30} weight={900}>
            {"миллион песен"}
          </Txt>
          <rect x={-200} y={-80} width={400} height={44} rx={22} fill={C.concrete} />
          <rect x={-200} y={-80} width={400 * clamp01(fast * 1.3)} height={44} rx={22} fill={C.green} />
          <Txt x={0} y={20} size={28} color={C.inkSoft}>
            {"ждали: за полгода"}
          </Txt>
          <Txt x={0} y={100} size={44} weight={900} color={C.greenDeep}>
            {"вышло: за 6 дней"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};

// ── s06: продукт как система, сад за стеной ──
export const WindowsDebate: React.FC<VisualProps> = (c) => {
  const { t } = c;
  const debate = ramp(t, 0.2, 1);
  const sys = ramp(t, at(c, 1), 1.4);
  const wall = ramp(t, at(c, 1.6), 1);
  const both = ramp(t, at(c, 2), 0.8);
  return (
    <Stage host={c.p.host}>
      <g opacity={debate * (1 - sys)}>
        <Person x={330} y={820} s={0.46} color={C.ink} name="Джобс" t={t} gesture="arms" />
        {[0, 1, 2, 3].map((i) => (
          <Person key={i} x={680 + i * 150} y={820} s={0.36} color={[C.violet, C.coral, C.sky, C.green][i]} t={t} seed={i + 3} gesture="point" flip />
        ))}
        <Txt x={640} y={300} size={34} weight={900}>
          {"четверо против одного — и он уступил"}
        </Txt>
      </g>
      {sys > 0 && (
        <g opacity={sys} transform="translate(640 500)">
          {["плеер", "программа", "магазин", "удобство"].map((w, i) => {
            const a = (i / 4) * Math.PI * 2 - Math.PI / 2 + t * 0.15;
            return (
              <g key={w}>
                <circle cx={Math.cos(a) * 200} cy={Math.sin(a) * 160} r={78} fill={[C.sky, C.green, C.coral, C.yellow][i]} opacity={0.9} stroke={OL} strokeWidth={3} />
                <Txt x={Math.cos(a) * 200} y={Math.sin(a) * 160 + 10} size={24} weight={900}>
                  {w}
                </Txt>
              </g>
            );
          })}
          {wall > 0 && <ellipse rx={330 + 10 * wall} ry={280 + 10 * wall} fill="none" stroke={C.woodDark} strokeWidth={22 * wall} strokeDasharray="60 10" />}
        </g>
      )}
      {wall > 0 && <Tag x={640} y={170} text="сад за высокой стеной?" color={C.coral} size={30} textColor={C.white} />}
      {both > 0 && (
        <g opacity={both}>
          <Check x={160} y={850} s={34} k={both} />
          <Txt x={300} y={862} size={26} color={C.greenDeep}>
            {"простота"}
          </Txt>
          <Cross x={960} y={850} s={50} k={both} />
          <Txt x={1110} y={862} size={26} color={C.red}>
            {"меньше свободы"}
          </Txt>
        </g>
      )}
    </Stage>
  );
};
