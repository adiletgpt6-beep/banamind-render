// Сцены 1–2. Вопрос: карта «Кеңсе → Мектеп», маршрут быстро прорисован,
// крупно «11 мүнөт»; рядом календарь мамы с блоком на целый час и знаком
// вопроса — «Бир сааттан ашык?». Затем как было обычно: мама — из офиса
// в школу, к бабушке домой и обратно в офис; карточки родителей
// «Долбоордук топ» и «Маркетинг»; календарь мамы освобождает длинный
// промежуток.
import { Actor, type Place } from "../rig/Actor";
import { clamp, easeInOut, easeOut, keys } from "../rig/motion";
import { EM2_TEXT } from "../script";
import { NODE, ROUTE } from "../story";
import { C } from "../theme";
import { BigFigure, Calendar, Panel } from "../graphics/Hud";
import { MapView } from "../graphics/Map";
import { partial, pointAt, toPath, type P } from "../graphics/geom";
import { PanelShot } from "../shots";
import { fontFamily } from "../../fonts";
import { STAGE, useScene } from "./kit";

const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

export const QuestionScene: React.FC = () => {
  const { f, t, word } = useScene("question");
  const draw = easeInOut(clamp((f - 6) / 34));
  const eleven = easeOut((f - word("n01", 2)) / 10);
  const cal = easeOut((f - word("n01", 5)) / 12);
  const q = easeOut((f - word("n01", 8)) / 10);
  const cam = { x: keys(f, [[0, 450], [240, 470]]), y: keys(f, [[0, 390], [240, 400]]), zoom: keys(f, [[0, 1.25], [240, 1.32]]) };
  return (
    <>
      <Panel x={STAGE.x} y={STAGE.y} w={STAGE.w} h={STAGE.h} title={EM2_TEXT.route}>
        <MapView t={t} f={f} cam={cam} w={STAGE.w} h={STAGE.h} routes={[]} preview={draw} glow={f > 40 ? "school" : undefined} />
      </Panel>
      {/* «11 мүнөт» — над маршрутом */}
      <div style={box({ left: STAGE.x, width: STAGE.w, top: 210 })}>
        <BigFigure text={EM2_TEXT.eleven} a={eleven} size={150} />
      </div>
      {/* календарь мамы: блок больше часа и вопрос */}
      <div style={box({ left: 450, top: 620, width: 530, height: 560, opacity: cal, translate: `${(1 - cal) * 60}px 0` })}>
        <Panel x={0} y={0} w={530} h={560} accent={q > 0.5 ? C.yellow : undefined}>
          <Calendar w={530} h={560} mode="mom" question={q} />
        </Panel>
      </div>
      <div style={box({ left: 90, top: 1040, fontFamily, fontSize: 64, fontWeight: 900, color: C.yellow, opacity: q, translate: `0 ${(1 - q) * 20}px`, textShadow: "0 6px 24px rgba(0,0,0,0.8)" })}>{EM2_TEXT.moreThanHour}</div>
    </>
  );
};

// Обычный круг мамы: Кеңсе → Мектеп → Үй (бабушка) → Кеңсе.
const LOOP: readonly P[] = [...ROUTE.drive, { x: 650, y: 650 }, { x: 640, y: 860 }, { x: 640, y: 1030 }, { x: 430, y: 1030 }, NODE.home, { x: 430, y: 860 }, { x: 250, y: 860 }, { x: 250, y: 500 }, NODE.office];

// Карточка-портрет: голова персонажа в круглой рамке и подпись.
const Portrait: React.FC<{ f: number; look: "dad" | "mom"; label: string; title: string; x: number; y: number; a: number; seed: number }> = ({ f, look, label, title, x, y, a, seed }) => {
  const p: Place = { x: 500, y: 1700, h: 800 };
  return (
    <div style={box({ left: x, top: y, width: 450, height: 190, opacity: a, translate: `0 ${(1 - a) * 24}px` })}>
      <Panel x={0} y={0} w={450} h={190}>
        <PanelShot f={f} from={0} to={99999} x={18} y={18} w={150} h={150} radius={75} cam={{ x: 500, y: 1700 - 0.86 * 800, zoom: 0.85 }} bg="#1A2738">
          <Actor uid={`op-${look}`} look={look} f={f} place={() => p} face={() => 0.15} pose={() => ({ expr: "softSmile" as const })} seed={seed} />
        </PanelShot>
        <div style={box({ left: 190, top: 34, fontFamily, fontSize: 38, fontWeight: 900, color: C.text })}>{title}</div>
        <div style={box({ left: 190, top: 96, fontFamily, fontSize: 32, fontWeight: 800, color: C.yellow })}>{label}</div>
      </Panel>
    </div>
  );
};

export const UsualScene: React.FC = () => {
  const { f, t, word } = useScene("usual");
  // маркер мамы по кругу — по словам «мектептен», «чоң апасына», «кеңсеге»
  const wSchool = word("n02", 2);
  const wHome = word("n02", 4);
  const wOffice = word("n02", 7);
  const u = keys(f, [[0, 0], [wSchool + 4, 0.33], [wHome + 6, 0.66], [wOffice + 10, 1]], easeInOut);
  const pt = pointAt(LOOP, u);
  const a = (k: number) => easeOut((f - k) / 12);
  return (
    <>
      <Portrait f={f} look="dad" title="Ата" label={EM2_TEXT.roles.father} x={70} y={120} a={a(0)} seed={2} />
      <Portrait f={f} look="mom" title="Апа" label={EM2_TEXT.roles.mother} x={560} y={120} a={a(6)} seed={1} />
      <Panel x={STAGE.x} y={330} w={STAGE.w} h={880}>
        <MapView t={t} f={f} cam={{ x: 470, y: 600, zoom: 0.86 }} w={STAGE.w} h={880} routes={[]} glow={u < 0.34 ? "school" : u < 0.67 ? "home" : "office"} />
        <svg width={STAGE.w} height={880} viewBox={`0 0 ${STAGE.w} 880`} style={box({ left: 0, top: 0 })}>
          <g transform={`translate(${STAGE.w / 2} 440) scale(0.86) translate(-470 -600)`}>
            <path d={toPath(partial(LOOP, u))} stroke={C.teal} strokeWidth={8 / 0.86} fill="none" strokeDasharray="2 18" strokeLinecap="round" />
            <circle cx={pt.x} cy={pt.y} r={16 / 0.86} fill={C.teal} stroke={C.bg} strokeWidth={5} />
            <text x={pt.x + 26} y={pt.y - 22} fontFamily={fontFamily} fontWeight={900} fontSize={30 / 0.86} fill={C.teal} paintOrder="stroke" stroke={C.bg} strokeWidth={8}>
              Апа
            </text>
          </g>
        </svg>
        {/* календарь мамы — длинный промежуток вокруг школьной поездки */}
        <div style={box({ right: 20, bottom: 20, width: 360, height: 400, opacity: a(wOffice - 20), borderRadius: 22, overflow: "hidden", border: `2px solid ${C.line}`, backgroundColor: C.panel })}>
          <Calendar w={360} h={400} mode="mom" question={0} />
        </div>
      </Panel>
    </>
  );
};

