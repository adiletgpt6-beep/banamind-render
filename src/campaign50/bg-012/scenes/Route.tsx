// 5. Маршрут: страница BalaGo «растворяется» в лист бумаги, и мелковые
// линии рисунка складываются в маршрут: ҮЙ → МЕКТЕП (утром) и обратно
// (после уроков). Затем три шага: заявка → подходящая группа → бесплатная
// первая полная пробная поездка; поездка — только после формирования группы.
import { getLength, getPointAtLength, getTangentAtLength } from "@remotion/paths";
import { AbsoluteFill, interpolate } from "remotion";
import { useScene, useTimeline } from "../context";
import { fontFamily } from "../fonts";
import { CrayonDefs, NAVY, PAPER, YELLOW } from "../props";
import { B12_TEXT } from "../script";
import { tw } from "../rig/motion";
import { clamp, wordAt } from "./common";

const TOP = "M 320 600 C 430 470 680 470 770 590";
const BACK = "M 780 700 C 680 820 430 820 320 700";
const MOUNT = "M 150 400 L 260 300 L 330 350 L 430 250 L 530 340 L 620 270 L 720 350 L 820 290 L 930 400";
const L_TOP = getLength(TOP);
const L_BACK = getLength(BACK);
const L_MOUNT = getLength(MOUNT);

const House: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M -80 70 L -80 -30 L 0 -100 L 80 -30 L 80 70 Z" fill="#FF9A76" stroke="#D9572B" strokeWidth={6} strokeLinejoin="round" />
    <path d="M -96 -20 L 0 -110 L 96 -20" stroke="#B5432A" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-22} y={10} width={44} height={60} fill="#FFE07A" stroke="#D9572B" strokeWidth={5} />
    <rect x={-62} y={-20} width={34} height={30} fill="#BFE3FF" stroke="#D9572B" strokeWidth={4} />
  </g>
);

const School: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-110} y={-50} width={220} height={120} fill="#FFE9A8" stroke="#C98A00" strokeWidth={6} />
    <path d="M -126 -46 L 0 -110 L 126 -46 Z" fill="#7CB8E8" stroke="#3E7DB8" strokeWidth={6} strokeLinejoin="round" />
    <line x1={0} y1={-110} x2={0} y2={-170} stroke={NAVY} strokeWidth={5} />
    <path d="M 0 -170 L 46 -156 L 0 -142 Z" fill="#E8453C" />
    {[-80, -40, 40, 80].map((wx) => (
      <rect key={wx} x={wx - 14} y={-26} width={28} height={30} fill="#BFE3FF" stroke="#3E7DB8" strokeWidth={4} />
    ))}
    <rect x={-20} y={14} width={40} height={56} fill="#C98A00" />
  </g>
);

// Белая машина (мелковый контур), едет по линии.
const Car: React.FC<{ x: number; y: number; ang: number; flip: boolean }> = ({ x, y, ang, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${flip ? -1 : 1} 1)`}>
    <path d="M -62 14 L -56 -8 L -30 -30 L 26 -30 L 46 -8 L 64 0 L 64 14 Z" fill="#FFFFFF" stroke={NAVY} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -26 -24 L -6 -24 L -6 -8 L -44 -8 Z M 2 -24 L 22 -24 L 38 -8 L 2 -8 Z" fill="#BFE3FF" />
    <rect x={-58} y={2} width={120} height={7} fill={YELLOW} />
    <circle cx={-32} cy={16} r={13} fill={NAVY} />
    <circle cx={36} cy={16} r={13} fill={NAVY} />
  </g>
);

const Card: React.FC<{ y: number; n: string; text: string; o: number; icon: "form" | "group" | "gift" }> = ({ y, n, text, o, icon }) => (
  <g transform={`translate(0 ${y + (1 - o) * 30})`} opacity={o}>
    <rect x={92} y={4} width={896} height={92} rx={22} fill="#000" opacity={0.08} />
    <rect x={86} y={0} width={896} height={92} rx={22} fill="#FFFFFF" stroke="#EADFC8" strokeWidth={3} />
    <circle cx={142} cy={46} r={30} fill={YELLOW} />
    <text x={142} y={58} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={34} fill={NAVY}>
      {n}
    </text>
    <g transform="translate(210 46)">
      {icon === "form" ? (
        <g>
          <rect x={-18} y={-24} width={36} height={48} rx={5} fill="#EEF3FB" stroke={NAVY} strokeWidth={4} />
          <path d="M -9 -10 H 9 M -9 0 H 9 M -9 10 H 3" stroke={NAVY} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      ) : icon === "group" ? (
        <g>
          {[-22, -7, 8, 23].map((cx, i) => (
            <g key={cx} opacity={i === 3 ? 0.45 : 1}>
              <circle cx={cx} cy={-8} r={8} fill="#FBD9B5" stroke={NAVY} strokeWidth={2.5} />
              <path d={`M ${cx - 9} 16 Q ${cx} -2 ${cx + 9} 16 Z`} fill={["#7CB8E8", YELLOW, "#F0617A", "#5DB36A"][i]} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <rect x={-20} y={-10} width={40} height={32} rx={4} fill="#F0617A" />
          <rect x={-24} y={-20} width={48} height={12} rx={3} fill="#E8453C" />
          <rect x={-4} y={-20} width={8} height={42} fill={YELLOW} />
        </g>
      )}
    </g>
    <text x={252} y={60} fontFamily={fontFamily} fontWeight={900} fontSize={icon === "gift" ? 33 : 38} fill={NAVY}>
      {text}
    </text>
  </g>
);

export const RouteScene: React.FC = () => {
  const { t, dur, cue, abs } = useScene();
  const { cues } = useTimeline();
  const n03 = cue("n03");
  const c2 = cues.find((c) => c.id === "n02");
  const c3 = cues.find((c) => c.id === "n03");
  const rel = (x: number) => x - abs + t; // абсолютное → время сцены
  const wSchool = rel(wordAt(c2, "мектепке", c2 ? c2.from + 1.2 : abs));
  const wBack = rel(wordAt(c2, "кайра", c2 ? c2.from + 2.2 : abs));
  const wGroup = rel(wordAt(c3, "ылайыктуу", c3 ? c3.from + 0.6 : abs));
  const wFirst = rel(wordAt(c3, "биринчи", c3 ? c3.from + 2.6 : abs));
  // линии маршрута
  const top = tw(t, Math.max(0.6, wSchool - 1.0), wSchool + 0.5, 0, 1);
  const back = tw(t, wBack - 0.2, wBack + 1.2, 0, 1);
  const carK = t < wBack - 0.2 ? top : 1 + back;
  const onBack = carK > 1;
  const path = onBack ? BACK : TOP;
  const len = onBack ? L_BACK : L_TOP;
  const at = Math.min(len - 0.01, (onBack ? back : top) * len);
  const pt = getPointAtLength(path, Math.max(0.01, at)) ?? { x: 320, y: 600 };
  const tg = getTangentAtLength(path, Math.max(0.01, at)) ?? { x: 1, y: 0 };
  const raw = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
  // машина наклоняется по линии, но не «встаёт на дыбы» (не более ±28°)
  const norm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
  const ang = Math.max(-28, Math.min(28, onBack ? norm(raw - 180) : norm(raw)));
  const mount = tw(t, 0.2, 1.4, 0, 1);
  const routeTxt = tw(t, wBack + 0.6, wBack + 1.2, 0, 1);
  const fadeIn = interpolate(t, [0, 0.35], [1, 0], clamp);
  const S = B12_TEXT.steps;
  // лёгкий медленный наезд
  const z = 1 + t * 0.006;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <CrayonDefs id="route-cr" seed={11} amount={4} />
          <pattern id="route-paper" width={24} height={24} patternUnits="userSpaceOnUse">
            <circle cx={4} cy={6} r={1.2} fill="#E9DFC9" />
            <circle cx={16} cy={18} r={1} fill="#EFE6D3" />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#route-paper)" />
        <g transform={`translate(540 800) scale(${z}) translate(-540 -800)`}>
          <g filter="url(#route-cr)">
            <path d={MOUNT} stroke="#8FA3C0" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L_MOUNT} strokeDashoffset={L_MOUNT * (1 - mount)} />
            <House x={230} y={650} />
            <School x={860} y={660} />
            <path d={TOP} stroke={YELLOW} strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={L_TOP} strokeDashoffset={L_TOP * (1 - top)} />
            <path d={BACK} stroke="#7CB8E8" strokeWidth={14} fill="none" strokeLinecap="round" strokeDasharray={L_BACK} strokeDashoffset={L_BACK * (1 - back)} />
            <path d="M 748 560 L 774 594 L 734 600" stroke={YELLOW} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={top > 0.97 ? 1 : 0} />
            <path d="M 342 740 L 316 704 L 356 698" stroke="#7CB8E8" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={back > 0.97 ? 1 : 0} />
          </g>
          <text x={540} y={232} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={76} fill={NAVY} opacity={mount}>
            {B12_TEXT.route.city}
          </text>
          <text x={230} y={790} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={40} fill={NAVY}>
            {B12_TEXT.route.home}
          </text>
          <text x={860} y={790} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={40} fill={NAVY}>
            {B12_TEXT.route.school}
          </text>
          {top > 0.02 ? <Car x={pt.x} y={pt.y - 22} ang={ang} flip={onBack} /> : null}
          <g opacity={routeTxt}>
            <rect x={210} y={850} width={660} height={84} rx={42} fill={YELLOW} />
            {/* «ҮЙ → МЕКТЕП → ҮЙ»: стрелки нарисованы */}
            {B12_TEXT.cta.route.split(" → ").map((p, i) => (
              <text key={i} x={[262, 540, 818][i]} y={907} textAnchor="middle" fontFamily={fontFamily} fontWeight={900} fontSize={46} fill={NAVY}>
                {p}
              </text>
            ))}
            {[318, 702].map((x) => (
              <path key={x} d={`M ${x} 892 H ${x + 48} M ${x + 34} 880 L ${x + 50} 892 L ${x + 34} 904`} stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </g>
        </g>
        <Card y={975} n={S[0].n} text={S[0].text} icon="form" o={tw(t, n03.from - 0.1, n03.from + 0.35, 0, 1)} />
        <Card y={1083} n={S[1].n} text={S[1].text} icon="group" o={tw(t, wGroup - 0.1, wGroup + 0.35, 0, 1)} />
        <Card y={1191} n={S[2].n} text={S[2].text} icon="gift" o={tw(t, wFirst - 0.1, wFirst + 0.35, 0, 1)} />
        <text x={540} y={1322} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={29} fill="#55607A" opacity={tw(t, n03.to - 0.6, n03.to, 0, 1)}>
          {B12_TEXT.stepsNote}
        </text>
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={fadeIn} />
        <rect width={1080} height={1920} fill="#FFFFFF" opacity={interpolate(t, [dur - 0.3, dur], [0, 0.6], clamp)} />
      </svg>
    </AbsoluteFill>
  );
};
