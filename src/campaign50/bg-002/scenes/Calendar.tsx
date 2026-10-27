// Сцена 3 (17,6–29,6 с): календарь на мониторе. Папа пробует передвинуть
// «Кардар менен жолугушуу», чтобы освободить 15:00 («Сабак бүтөт»), —
// час 16:00 занят («Отчёт талкуулоо»), встреча возвращается. Неделя:
// встречи каждый день в разное время. Диктор: «Жумуштагы жолугушуулар ар
// күнү бирдей болбойт.» Видимое решение героя: папа создаёт эскертме
// «Мектепке каттамды алдын ала уюштуруу» («Мектепке каттамды алдын ала
// уюштурсачы?»), затем тянется к планшету.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { anticipate, keys, keysV } from "../rig/motion";
import { CalendarScreen, CAL } from "../screens";
import { OFFICE } from "../sets/Office";
import { box, camMove, Shot } from "../shots";
import { lineFrames, onDesk, seatedDad, seatOf } from "./common";
import { OfficeWorld } from "./OfficeWorld";

export const CALENDAR = { back: 296 } as const;

export const CalendarScene: React.FC = () => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const n03 = lineFrames(cues, "n03", "calendar");
  const typeTo = Math.max(CAL.note + 40, Math.min(n03.to, CALENDAR.back - 16));
  const dad = seatedDad();
  const b = CALENDAR.back;
  const dadPose = (t: number) => ({
    expr: t < b + 14 ? ("thinking" as const) : ("calm" as const),
    sit: 1,
    seat: seatOf(dad),
    lean: keys(t, [[b, 4], [b + 24, 10]]),
    lookX: keys(t, [[b, 0.6], [b + 10, 0.2]]),
    lookY: keys(t, [[b, 0.2], [b + 14, 0.45]]),
    nod: keys(t, [[b + 2, 0], [b + 10, 5], [b + 20, 0]]),
    armR: { target: keysV(t, [[b, onDesk(OFFICE.folder.x + 40, -4)], [b + 30, onDesk(OFFICE.tablet.x - 150, -60)]], anticipate), shape: t > b + 24 ? ("point" as const) : ("relax" as const), elbow: "down" as const, behind: false },
    armL: { target: onDesk(dad.x - 0.13 * dad.h, -4), shape: "relax" as const, elbow: "down" as const },
  });
  const dadFace = (t: number) => keys(t, [[b, 0.6], [b + 16, 0.35]]);
  return (
    <>
      <Shot
        f={f}
        from={0}
        to={b}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #E9EDF3, #D3DAE4)" })}>
            <div style={box({ left: 40, top: 430, width: 1000, height: 1300, transformOrigin: "50% 0", scale: `${0.8 + 0.015 * (f / b)}`, borderRadius: 34, backgroundColor: "#2B3242", padding: 22, boxSizing: "border-box", boxShadow: "0 40px 80px rgba(20,30,60,0.3)" })}>
              <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden" }}>
                <CalendarScreen f={f} typeTo={typeTo} />
              </div>
            </div>
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={b} to={400} cam={camMove(f, b, 360, { x: 900, y: 1070, zoom: 1.45 }, { x: 910, y: 1075, zoom: 1.52 })}>
        <OfficeWorld f={f} dad={() => dad} dadFace={dadFace} dadPose={dadPose} sitters={2} doorOpen={1} tablet={<div style={box({ inset: 0, backgroundColor: "#FFF4C2" })} />} />
      </Shot>
    </>
  );
};
