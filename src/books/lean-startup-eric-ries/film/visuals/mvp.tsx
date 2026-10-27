// «Минимальный продукт» и «Цикл»: бумажный прототип оживает, весы качества, видео вместо продукта,
// один клиент, люди за занавесом, учебный «Утренний хлеб», страхи и дурные вести; цикл
// «создать-оценить-научиться», обратное планирование, беговая дорожка функций, круг хлеба.
import React from "react";
import { C, HEAVY } from "../theme";
import { Capsule, Card, OL, Paper, Person, Phone, Pill, Spark } from "./draw";
import { Arrow, Cross, Pop, Txt, at, clamp01, pop, ramp, wob, type VisualProps } from "./kit";
import { Badge, Chain, Icon, IconCard, cxOf, spread, type P } from "./parts";

// ── минимально рабочий продукт: бумажный набросок оживает и запускает круг ──
export const MvpPaper: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const alive = ramp(t, at(c, 1.2), 0.8);
  const loop = ramp(t, at(c, 1.35), 2.5);
  const goal = pop(t, at(c, 1.75));
  return (
    <g>
      <Pop t={t} at={at(c, 0.3)} x={cx} y={170}>
        <Pill x={0} y={0} text="минимально рабочий продукт · MVP" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={42} />
      </Pop>
      <Pop t={t} at={at(c, 0.5)} x={cx - 260} y={530}>
        <Paper x={0} y={0} s={0.95} rot={-3 + wob(t, 1, 1)} k={alive} title={alive > 0.5 ? "" : "набросок"} />
      </Pop>
      {/* круг обучения вокруг прототипа */}
      {loop > 0 && (
        <g transform={`translate(${cx + 280} 520)`}>
          <circle r={170} fill="none" stroke={C.greyLight} strokeWidth={24} />
          <circle r={170} fill="none" stroke={C.teal} strokeWidth={24} strokeDasharray={2 * Math.PI * 170} strokeDashoffset={2 * Math.PI * 170 * (1 - clamp01(loop))} transform="rotate(-90)" strokeLinecap="round" />
          {["создать", "оценить", "научиться"].map((w, i) => {
            const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
            return (
              <g key={w} opacity={clamp01(loop * 3 - i)}>
                <Pill x={Math.cos(a) * 170} y={Math.sin(a) * 170 + 12} text={w} fill="#fff" size={28} />
              </g>
            );
          })}
          <Txt x={0} y={14} size={30} color={C.inkSoft}>
            минимум усилий
          </Txt>
        </g>
      )}
      {goal > 0 && (
        <g transform={`translate(${cx} 850) scale(${goal})`}>
          <Pill x={0} y={0} text="«начать процесс обучения, а не закончить его»" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={34} />
        </g>
      )}
    </g>
  );
};

// ── весы качества: халтура / вылизанный продукт / «ровно сколько нужно клиенту» ──
export const QualityScale: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const tilt = Math.sin(t * 1.4) * 6 * (1 - ramp(t, at(c, 1.4), 0.6));
  const who = pop(t, at(c, 1.45));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx} 520) scale(${k})`}>
          <path d="M -40 300 L 40 300 L 14 -40 L -14 -40 Z" fill={C.grey} stroke={OL} strokeWidth={5} />
          <g transform={`rotate(${tilt})`}>
            <rect x={-420} y={-60} width={840} height={20} rx={10} fill={OL} />
            {/* левая чаша: халтура */}
            <g transform="translate(-380 -50)">
              <path d="M 0 0 L -50 130 M 0 0 L 50 130" stroke={OL} strokeWidth={4} />
              <path d="M -110 130 Q 0 190 110 130 Z" fill="#fff" stroke={OL} strokeWidth={5} />
              <Icon name="box" x={0} y={100} s={0.9} />
              <Cross x={60} y={60} s={60} k={ramp(t, at(c, 0.6), 0.4)} />
              <Txt x={0} y={240} size={30} color={C.coralDeep}>
                халтура
              </Txt>
            </g>
            {/* правая чаша: вылизанное ненужное */}
            <g transform="translate(380 -50)">
              <path d="M 0 0 L -50 130 M 0 0 L 50 130" stroke={OL} strokeWidth={4} />
              <path d="M -110 130 Q 0 190 110 130 Z" fill="#fff" stroke={OL} strokeWidth={5} />
              <Icon name="star" x={0} y={95} s={0.9} color={C.gold} />
              <Spark x={50} y={60} s={0.6} />
              <Cross x={60} y={60} s={60} k={ramp(t, at(c, 1.15), 0.4)} />
              <Txt x={0} y={240} size={30} color={C.coralDeep}>
                шлифовка ненужного
              </Txt>
            </g>
          </g>
          <circle cy={-50} r={18} fill={C.gold} stroke={OL} strokeWidth={4} />
        </g>
      )}
      {who > 0 && (
        <g transform={`translate(${cx} 210) scale(${who})`}>
          <Capsule x={0} y={0} w={780} h={120} text="качество = насколько нужно клиенту" glow={0.6} color={C.teal} size={34} />
        </g>
      )}
    </g>
  );
};

// ── Dropbox: видео вместо сложного продукта, список желающих растёт ──
export const VideoMvp: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const hard = pop(t, at(c, 0.3));
  const video = pop(t, at(c, 1.1));
  const list = ramp(t, at(c, 1.55), 1.5);
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      {hard > 0 && (
        <g transform={`translate(${cx - 340} 470) scale(${hard})`} opacity={1 - video * 0.55}>
          <Card x={0} y={0} w={440} h={380} fill="#fff">
            {[-1, 0, 1].map((i) => (
              <g key={i} transform={`translate(${i * 130} -40)`}>
                <rect x={-50} y={-40} width={100} height={70} rx={8} fill={C.skyLight} stroke={OL} strokeWidth={4} />
                <rect x={-20} y={30} width={40} height={14} fill={OL} />
              </g>
            ))}
            <path d="M -130 60 Q 0 140 130 60" stroke={C.cyan} strokeWidth={6} strokeDasharray="12 10" fill="none" />
            <Txt x={0} y={150} size={28} color={C.inkSoft}>
              сложно и долго строить
            </Txt>
          </Card>
        </g>
      )}
      {video > 0 && (
        <g transform={`translate(${cx + 40} 470) scale(${video})`}>
          <rect x={-200} y={-140} width={400} height={260} rx={20} fill="#2b3550" stroke={OL} strokeWidth={6} />
          <rect x={-180} y={-120} width={360} height={200} rx={10} fill={C.cyanLight} />
          <circle r={50} fill="#fff" stroke={OL} strokeWidth={5} opacity={0.9} />
          <path d="M -16 -26 L 26 0 L -16 26 Z" fill={C.coral} />
          <rect x={-160} y={98} width={320 * clamp01((t - at(c, 1.1)) / 4)} height={8} rx={4} fill={C.coral} />
          <Txt x={0} y={170} size={30}>
            трёхминутное видео
          </Txt>
        </g>
      )}
      {list > 0 && (
        <g transform={`translate(${cx + 400} 470)`} opacity={clamp01(list * 2)}>
          <rect x={-60} y={-200} width={120} height={360} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
          <rect x={-46} y={146 - 330 * list} width={92} height={330 * list} rx={8} fill={C.teal} />
          <Txt x={0} y={210} size={26} color={C.inkSoft}>
            желающие
          </Txt>
          <Txt x={0} y={-226} size={30} color={C.tealDeep}>
            {list < 0.5 ? "5 000" : "75 000"}
          </Txt>
        </g>
      )}
    </g>
  );
};

// ── MVP для одного клиента: пакет рецептов вручную, чек каждую неделю ──
export const OneClient: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const one = pop(t, at(c, 0.4));
  const pack = ramp(t, at(c, 1.1), 1.2);
  const check = pop(t, at(c, 1.7));
  const auto = ramp(t, at(c, 2.1), 1);
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      {one > 0 && (
        <g transform={`translate(${cx + 300} 600) scale(${one})`}>
          <Person kind="woman" x={0} y={120} s={0.95} t={t} mood={pack > 0.8 ? "happy" : "calm"} />
          <Pill x={0} y={170} text="единственная клиентка" fill="#fff" size={28} />
        </g>
      )}
      <g transform={`translate(${cx - 300} 600)`}>
        <Person kind="founder" x={-60} y={120} s={0.85} t={t} mood="happy" arm="hold" />
        <Person kind="man" x={60} y={120} s={0.8} t={t + 1} mood="happy" />
      </g>
      {pack > 0 && (
        <g transform={`translate(${cx - 220 + 440 * pack} ${440 - Math.sin(pack * Math.PI) * 80})`}>
          <rect x={-60} y={-50} width={120} height={100} rx={10} fill={C.kraft} stroke={OL} strokeWidth={4} />
          <Txt x={0} y={-6} size={22}>
            рецепты
          </Txt>
          <Txt x={0} y={26} size={22}>
            + покупки
          </Txt>
        </g>
      )}
      {check > 0 && (
        <g transform={`translate(${cx} 300) scale(${check}) rotate(${-4 + wob(t, 2, 2)})`}>
          <rect x={-170} y={-60} width={340} height={120} rx={12} fill={C.mintLight} stroke={OL} strokeWidth={5} />
          <Txt x={0} y={-8} size={30}>
            чек каждую неделю
          </Txt>
          <Txt x={0} y={40} size={36} color={C.mintDeep}>
            $9,95
          </Txt>
        </g>
      )}
      {auto > 0 && (
        <g transform={`translate(${cx} 860)`} opacity={auto}>
          <Pill x={-260} y={0} text="вручную" fill="#fff" size={32} />
          <Arrow x1={-130} y1={0} x2={70} y2={0} k={auto} w={8} />
          <Pill x={240} y={0} text="автоматизация — потом" fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={32} />
        </g>
      )}
    </g>
  );
};

// ── «Волшебник Изумрудного города»: за занавесом — люди ──
export const WizardCurtain: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const open = ramp(t, at(c, 0.55), 0.9);
  const tag = pop(t, at(c, 1.3));
  return (
    <g>
      <Badge x={cx} y={150} kind="history" t={t} />
      {k > 0 && (
        <g transform={`translate(${cx} 520) scale(${k})`}>
          {/* «программа» на экране */}
          <Phone x={-360} y={0} s={0.8}>
            <rect x={-90} y={-150} width={180} height={60} rx={14} fill={C.cyanLight} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={-112} size={22}>
              ваш вопрос?
            </Txt>
            <rect x={-90} y={-60} width={180} height={80} rx={14} fill={C.tealLight} stroke={OL} strokeWidth={3} />
            <Txt x={0} y={-12} size={22}>
              ответ готов!
            </Txt>
          </Phone>
          <path d="M -220 0 L -120 0" stroke={C.inkSoft} strokeWidth={6} strokeDasharray="12 10" />
          {/* сцена с занавесом */}
          <rect x={-100} y={-260} width={520} height={460} rx={20} fill="#fff7e8" stroke={OL} strokeWidth={6} />
          {[0, 1, 2].map((i) => (
            <Person key={i} kind={(["woman", "man", "worker"] as const)[i]} x={20 + i * 140} y={150} s={0.45} t={t + i} mood="happy" arm={i === 1 ? "hold" : "down"} />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={20 + i * 140 - 36} y={110} width={72} height={40} rx={6} fill="#59647f" stroke={OL} strokeWidth={3} />
          ))}
          {/* занавес */}
          <path d={`M -100 -260 L ${-100 + 260 * (1 - open)} -260 Q ${-100 + 200 * (1 - open)} 0 ${-100 + 260 * (1 - open) - 20} 200 L -100 200 Z`} fill="#b03a48" stroke={OL} strokeWidth={5} />
          <path d={`M 420 -260 L ${420 - 260 * (1 - open)} -260 Q ${420 - 200 * (1 - open)} 0 ${420 - 260 * (1 - open) + 20} 200 L 420 200 Z`} fill="#b03a48" stroke={OL} strokeWidth={5} />
        </g>
      )}
      {tag > 0 && (
        <g transform={`translate(${cx} 860) scale(${tag})`}>
          <Pill x={0} y={0} text="«Волшебника Изумрудного города»" fill={C.goldLight} color={C.goldDeep} stroke={C.gold} size={36} />
        </g>
      )}
    </g>
  );
};

// ── учебный пример: «Утренний хлеб» — листовка и тетрадь вместо приложения ──
export const BreadMvp: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const dream = pop(t, at(c, 0.4));
  const swap = ramp(t, at(c, 1), 0.7);
  const second = pop(t, at(c, 1.6));
  return (
    <g>
      <Badge x={cx} y={150} kind="study" t={t} />
      {/* пекарня */}
      <Pop t={t} at={0.3} x={cx - 360} y={560}>
        <g>
          <rect x={-170} y={-140} width={340} height={260} rx={14} fill="#fff4e0" stroke={OL} strokeWidth={5} />
          <path d="M -190 -140 L -190 -200 L 190 -200 L 190 -140 Z" fill={C.orange} stroke={OL} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d="M -190 -140 L -190 -110 Q -143 -90 -96 -110 L -96 -140 Z" fill={i % 2 ? "#fff" : C.orange} stroke={OL} strokeWidth={3} transform={`translate(${i * 95} 0)`} />
          ))}
          <Txt x={0} y={-158} size={30} color="#fff">
            пекарня
          </Txt>
          <Icon name="bread" x={-60} y={10} s={1} />
          <Icon name="bread" x={60} y={30} s={0.8} />
        </g>
      </Pop>
      {/* мечта о приложении → листовка */}
      {dream > 0 && (
        <g transform={`translate(${cx + 40} 500) scale(${dream * (1 - swap * 0.4)})`} opacity={1 - swap * 0.6}>
          <Phone x={0} y={0} s={0.7}>
            <Icon name="bread" x={0} y={-60} s={1.2} />
            <rect x={-70} y={40} width={140} height={44} rx={22} fill={C.teal} />
          </Phone>
          <Cross x={0} y={0} s={160} k={swap} />
          <Txt x={0} y={210} size={28} color={C.inkSoft}>
            год разработки
          </Txt>
        </g>
      )}
      {swap > 0 && (
        <g transform={`translate(${cx + 360} 470) scale(${swap})`}>
          <rect x={-130} y={-170} width={260} height={300} rx={10} fill="#fff" stroke={OL} strokeWidth={5} transform="rotate(4)" />
          <Icon name="bread" x={0} y={-80} s={1} />
          <Txt x={0} y={10} size={26}>
            хлеб к утру
          </Txt>
          <Icon name="phone" x={0} y={80} s={0.6} color={C.teal} />
          <rect x={-140} y={160} width={280} height={140} rx={8} fill={C.cream} stroke={OL} strokeWidth={4} />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={-110} y1={190 + i * 26} x2={110} y2={190 + i * 26} stroke={C.grey} strokeWidth={3} />
          ))}
          <Txt x={0} y={330} size={26} color={C.inkSoft}>
            тетрадь на неделю
          </Txt>
        </g>
      )}
      {second > 0 && (
        <g transform={`translate(${cx + 40} 240) scale(${second})`}>
          <Capsule x={0} y={0} w={740} h={110} text="закажут ли второй раз?" glow={0.5 + 0.3 * Math.sin(t * 3)} color={C.teal} size={36} />
        </g>
      )}
    </g>
  );
};

// ── страхи вокруг MVP ──
export const MvpFears: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const fears = [
    { icon: "law" as const, label: "юридические\nвопросы", fix: "консультация\nс юристом", color: C.sky },
    { icon: "people" as const, label: "конкуренты", fix: "учиться\nбыстрее всех", color: C.coral },
    { icon: "shield" as const, label: "риск\nдля бренда", fix: "другой\nзнак", color: C.violet },
    { icon: "warn" as const, label: "плохие\nновости", fix: "договориться\nзаранее", color: C.gold },
  ];
  return (
    <g>
      {fears.map((f, i) => {
        const k = pop(t, spread(c, 0, i, 4, 0.4, 0.95));
        const fixK = pop(t, i === 3 ? at(c, 1.95) : spread(c, 1, i, 3, 0.05, 0.75));
        const x = cx - 465 + i * 310;
        return (
          <g key={i}>
            <IconCard x={x} y={420} w={280} h={270} icon={f.icon} label={f.label} k={k} color={f.color} size={30} />
            {fixK > 0 && (
              <g transform={`translate(${x} 700) scale(${fixK})`}>
                <Arrow x1={0} y1={-140} x2={0} y2={-80} k={1} w={7} />
                <rect x={-130} y={-60} width={260} height={110} rx={20} fill={C.tealLight} stroke={C.teal} strokeWidth={4} />
                <Txt x={0} y={-12} size={26} color={C.tealDeep}>
                  {f.fix}
                </Txt>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ── дурные вести: договор заранее, настойчивость + гибкость ──
export const BadNews: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const env = pop(t, at(c, 0.3));
  const pact = pop(t, at(c, 1.1));
  const mix = pop(t, at(c, 1.7));
  return (
    <g>
      {env > 0 && (
        <g transform={`translate(${cx - 320} 430) scale(${env}) rotate(${wob(t, 1, 3)})`}>
          <rect x={-180} y={-120} width={360} height={240} rx={16} fill="#fff" stroke={OL} strokeWidth={6} />
          <path d="M -180 -120 L 0 20 L 180 -120" fill="none" stroke={OL} strokeWidth={5} />
          <Icon name="warn" x={0} y={50} s={0.8} />
          <Txt x={0} y={170} size={30}>
            результат теста
          </Txt>
        </g>
      )}
      {pact > 0 && (
        <g transform={`translate(${cx + 300} 430) scale(${pact})`}>
          <Card x={0} y={0} w={480} h={300} fill={C.cream}>
            <Txt x={0} y={-90} size={32}>
              договорились заранее:
            </Txt>
            <Txt x={0} y={-20} size={30} color={C.tealDeep}>
              {"не бросаем проект\nпосле первого теста"}
            </Txt>
            <path d="M -140 100 Q -100 70 -60 100 T 20 100" stroke={C.skyDeep} strokeWidth={4} fill="none" />
            <path d="M 60 100 Q 100 70 140 100" stroke={C.coralDeep} strokeWidth={4} fill="none" />
          </Card>
        </g>
      )}
      {mix > 0 && (
        <g transform={`translate(${cx} 780) scale(${mix})`}>
          <Pill x={-230} y={0} text="настойчивость" fill={C.skyLight} color={C.skyDeep} stroke={C.sky} size={36} />
          <text x={0} y={14} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill={OL}>
            +
          </text>
          <Pill x={210} y={0} text="гибкость" fill={C.tealLight} color={C.tealDeep} stroke={C.teal} size={36} />
        </g>
      )}
    </g>
  );
};

// ── цикл «создать-оценить-научиться»: идеи → продукт → данные → знания ──
export const BmlLoop: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const R = 250;
  const nodes = [
    { label: "идеи", icon: "bulb" as const, color: C.gold },
    { label: "продукт", icon: "box" as const, color: C.kraft },
    { label: "данные", icon: "chart" as const, color: C.cyan },
    { label: "знания", icon: "check" as const, color: C.teal },
  ];
  const acts = ["создать", "оценить", "научиться"];
  const fast = ramp(t, at(c, 1.2), 0.6);
  const speed = 0.5 + fast * 1.6;
  const ang = (t * speed) % (Math.PI * 2);
  return (
    <g>
      <g transform={`translate(${cx} 540)`}>
        <circle r={R} fill="none" stroke={C.greyLight} strokeWidth={30} />
        <circle r={R} fill="none" stroke={C.cyan} strokeWidth={30} strokeDasharray={`${2 * Math.PI * R * ramp(t, 0.2, 2)} 9999`} transform="rotate(-90)" strokeLinecap="round" opacity={0.7} />
        {/* бегущая капля */}
        <g transform={`rotate(${(ang * 180) / Math.PI - 90}) translate(${R} 0)`}>
          <circle r={26} fill="#fff" stroke={C.cyanDeep} strokeWidth={8} />
        </g>
        {nodes.map((n, i) => {
          const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
          const k = pop(t, spread(c, 0, i, 4, 0.3, 0.95));
          return (
            <g key={n.label} transform={`translate(${Math.cos(a) * R} ${Math.sin(a) * R}) scale(${k})`}>
              <circle r={78} fill="#fff" stroke={OL} strokeWidth={6} />
              <Icon name={n.icon} x={0} y={-10} s={0.85} color={n.color} />
              <Txt x={0} y={52} size={24}>
                {n.label}
              </Txt>
            </g>
          );
        })}
        {acts.map((a, i) => {
          const ang2 = -Math.PI / 2 + ((i + 0.5) / 4) * Math.PI * 2;
          return (
            <g key={a} opacity={ramp(t, spread(c, 0, i + 1, 4, 0.3, 0.95), 0.4)}>
              <Pill x={Math.cos(ang2) * (R + 115)} y={Math.sin(ang2) * (R + 90)} text={a} fill={C.cyanLight} color={C.cyanDeep} stroke={C.cyan} size={28} />
            </g>
          );
        })}
        <Txt x={0} y={10} size={34}>
          {fast > 0.5 ? "быстрее весь круг" : "цикл"}
        </Txt>
      </g>
    </g>
  );
};

// ── обратное планирование: научиться ← измерить ← построить ──
export const ReversePlan: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const items = [
    { icon: "box" as const, label: "создать", color: C.kraft },
    { icon: "chart" as const, label: "оценить", color: C.cyan },
    { icon: "bulb" as const, label: "научиться", color: C.teal },
  ];
  const back = ramp(t, at(c, 1), 0.6);
  const order = [spread(c, 1, 2, 3, 0.05, 0.4), spread(c, 1, 1, 3, 0.4, 0.7), spread(c, 1, 0, 3, 0.7, 0.85)];
  return (
    <g>
      <Txt x={cx} y={250} size={34} color={C.inkSoft}>
        делаем →
      </Txt>
      <Chain cx={cx} y={430} items={items} times={[at(c, 0.2), at(c, 0.35), at(c, 0.5)]} t={t} gap={330} w={260} h={220} />
      {back > 0 && (
        <g opacity={back}>
          <Txt x={cx} y={660} size={34} color={C.violetDeep}>
            ← планируем
          </Txt>
          {[2, 1, 0].map((i, j) => {
            const k = pop(t, order[j]);
            const x = cx - 330 + i * 330;
            return k > 0 ? (
              <g key={i} transform={`translate(${x} 780) scale(${k})`}>
                <circle r={46} fill={C.violet} stroke={OL} strokeWidth={4} />
                <text x={0} y={18} textAnchor="middle" fontFamily={HEAVY} fontWeight={900} fontSize={52} fill="#fff">
                  {j + 1}
                </text>
                {j < 2 && <Arrow x1={-60} y1={0} x2={-260} y2={0} k={ramp(t, order[j] + 0.2, 0.4)} color={C.violet} w={7} />}
              </g>
            ) : null;
          })}
        </g>
      )}
    </g>
  );
};

// ── беговая дорожка функций: кнопки сыплются, знание стоит на месте ──
export const FeatureTreadmill: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const k = pop(t, 0.2);
  const quote = pop(t, at(c, 1.1));
  return (
    <g>
      {k > 0 && (
        <g transform={`translate(${cx} 560) scale(${k})`}>
          <rect x={-380} y={60} width={760} height={50} rx={25} fill="#59647f" stroke={OL} strokeWidth={5} />
          {Array.from({ length: 12 }).map((_, i) => {
            const x = -360 + ((i * 70 - t * 160) % 720 + 720) % 720;
            return <line key={i} x1={x} y1={68} x2={x + 20} y2={102} stroke="#8a95b0" strokeWidth={5} />;
          })}
          <path d="M 300 60 L 360 -200 L 400 -200" stroke={OL} strokeWidth={10} fill="none" strokeLinecap="round" />
          {/* кнопки-функции едут и падают */}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = 300 - (((t * 160 + i * 120) % 720) + 0);
            const off = x < -360;
            return !off ? <rect key={i} x={x - 40} y={10} width={80} height={44} rx={22} fill={[C.cyan, C.pink, C.gold, C.teal, C.violet, C.coral][i]} stroke={OL} strokeWidth={4} /> : null;
          })}
          <Txt x={-140} y={200} size={30} color={C.inkSoft}>
            новая кнопка каждый день
          </Txt>
          {/* шкала знаний */}
          <g transform="translate(-300 -220)">
            <rect x={-30} y={-120} width={60} height={240} rx={14} fill="#fff" stroke={OL} strokeWidth={5} />
            <rect x={-20} y={100} width={40} height={10} rx={5} fill={C.teal} />
            <Txt x={0} y={160} size={26}>
              знания
            </Txt>
          </g>
        </g>
      )}
      {quote > 0 && (
        <g transform={`translate(${cx} 200) scale(${quote})`}>
          <Pill x={0} y={0} text="«как быстро мы можем пройти весь цикл»" fill={C.yellow} size={38} />
        </g>
      )}
    </g>
  );
};

// ── учебный пример: один круг «Утреннего хлеба» ──
export const BreadLoop: React.FC<VisualProps<P>> = (c) => {
  const { t } = c;
  const cx = cxOf(c.p);
  const steps = [
    { icon: "mail" as const, label: "создать:\nлистовка", color: C.kraft },
    { icon: "bread" as const, label: "оценить:\nвернулись?", color: C.gold },
    { icon: "bulb" as const, label: "научиться:\nгипотеза ценности", color: C.teal },
  ];
  const week = pop(t, at(c, 1.75));
  return (
    <g>
      <Badge x={cx} y={150} kind="study" t={t} />
      <Chain cx={cx} y={450} items={steps} times={[at(c, 0.25), at(c, 0.6), at(c, 1.05)]} t={t} gap={360} w={300} h={260} size={28} active={t > at(c, 1.05) ? 2 : t > at(c, 0.6) ? 1 : 0} />
      {/* тетрадь: мало повторов */}
      <Pop t={t} at={at(c, 0.85)} x={cx} y={730}>
        <g>
          <rect x={-260} y={-60} width={520} height={120} rx={14} fill={C.cream} stroke={OL} strokeWidth={4} />
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i} transform={`translate(${-220 + i * 48} 0)`}>
              <circle r={14} fill={i < 2 ? C.teal : "#fff"} stroke={OL} strokeWidth={3} />
            </g>
          ))}
          <Txt x={0} y={100} size={26} color={C.inkSoft}>
            вернулись на второй день (условно)
          </Txt>
        </g>
      </Pop>
      {week > 0 && (
        <g transform={`translate(${cx} 900) scale(${week})`}>
          <Pill x={0} y={0} text="узнали за неделю, а не за год" fill={C.yellow} size={34} />
        </g>
      )}
    </g>
  );
};

