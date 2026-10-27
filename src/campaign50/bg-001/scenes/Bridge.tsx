// Сцена 4 (мост, правка 01). Почему в истории появляется BalaGo:
//   1) экран: календарь дня — встреча 16:30–17:30 совпадает с «Сабак
//      бүтөт 17:00»; мама тянет встречу ниже, но там встреча с клиентом —
//      снова конфликт; встреча возвращается на место;
//   2) мама откидывается, думает (внутренний голос, губы не двигаются):
//      «Жолугушууларды жылдыра бергенче, баламдын жолун алдын ала
//      уюштурсамчы?» — к концу фразы решается, наклоняется и печатает;
//   3) экран: она сама набирает «Бишкек балдар үчүн такси», находит
//      карточку BalaGo и нажимает «Толугураак». Имя BalaGo звучит только
//      после этого — в следующей сцене, где эта же карточка раскрывается.
// Время в календаре — условный пример.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { bg1Beats } from "../beats";
import { CuesContext } from "../context";
import { type PoseIn } from "../rig/Actor";
import { anticipate, easeInOut, keys, keysV } from "../rig/motion";
import { CalendarScreen, SearchScreen } from "../screens";
import { box, camMove, Shot } from "../shots";
import { keyAt, restOnDesk, seatOf } from "./common";
import { MOM, OfficeWorld } from "./OfficeWorld";

const Full: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={box({ left: 0, top: 0, width: 1080, height: 1920 })}>{children}</div>;

export const BridgeScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const { cal, m02, search, typeFrom, typeTo, found, click } = bg1Beats(cues).bridge;
  const drag = easeInOut((f - cal.drag) / (cal.dragEnd - cal.drag));
  const back = easeInOut((f - cal.back) / (cal.backEnd - cal.back));

  // мама: после неудачного переноса — откидывается и думает; на второй
  // половине мысли — решение (лёгкая улыбка, кивок), наклон к ноутбуку
  const mid = Math.round((m02.from + m02.to) / 2);
  const decide = m02.to - 18;
  const pose = (t: number): PoseIn => {
    const typing = t >= decide + 10;
    return {
      expr: t < m02.from ? "tired" : t < mid ? "thinking" : "softSmile",
      sit: 1,
      seat: seatOf(MOM),
      lean: keys(t, [[cal.cut, 4], [cal.cut + 20, -2], [decide, -2], [decide + 14, 8]]),
      exhale: keys(t, [[cal.cut, 0.2], [cal.cut + 16, 0.9], [m02.from + 20, 0.2]]),
      lookY: keys(t, [[cal.cut, 0.3], [cal.cut + 18, -0.3], [mid, -0.3], [mid + 14, 0.05], [decide + 6, 0.35]]),
      headTilt: keys(t, [[cal.cut + 10, 0], [cal.cut + 30, 5], [mid, 5], [mid + 12, 0]]),
      nod: keys(t, [[mid + 4, 0], [mid + 12, 5], [mid + 22, 0]]),
      armL: {
        target: typing ? keyAt(0, t, true) : keysV(t, [[cal.cut, keyAt(0, cal.cut, false)], [cal.cut + 18, restOnDesk(MOM, -1).target!], [decide, restOnDesk(MOM, -1).target!], [decide + 10, keyAt(0, decide + 10, false)]], anticipate),
        shape: "relax",
        elbow: "down",
        behind: false,
      },
      armR: { target: keyAt(3, t, typing), shape: "relax", elbow: "down", behind: false },
    };
  };
  // взгляд: в окно (влево-вверх, думает) → снова на экран ноутбука
  const face = (t: number) => keys(t, [[cal.cut, 0.5], [cal.cut + 20, -0.15], [mid, -0.15], [mid + 16, 0.2], [decide + 4, 0.5]]);

  return (
    <>
      <Shot f={f} from={0} to={cal.cut} cam={{ x: 540, y: 960, zoom: 1 }}>
        <Full>
          <CalendarScreen f={f} clashAt={cal.clashAt} drag={drag} back={back} />
        </Full>
      </Shot>
      <Shot f={f} from={cal.cut} to={search.from} cam={camMove(f, cal.cut, search.from, { x: 520, y: 1050, zoom: 1.7 }, { x: 510, y: 1040, zoom: 1.9 })}>
        <OfficeWorld f={f} uid="b4-mom" minutes={16 * 60 + 41 + f / 600} face={face} pose={pose} speaking={false} />
      </Shot>
      <Shot f={f} from={search.from} to={400} cam={{ x: 540, y: 960, zoom: 1 }}>
        <Full>
          <SearchScreen f={f} typeFrom={typeFrom} typeTo={typeTo} found={found} click={click} />
        </Full>
      </Shot>
    </>
  );
};
