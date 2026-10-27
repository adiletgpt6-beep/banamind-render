// Салон машины мамы, вид через лобовое стекло: мама за рулём (справа в
// кадре, левый руль), телефон в держателе на панели, сзади — сын
// (пристёгнут, рюкзак рядом). Общий мир для сцен 1, 3 и 4.
// Порядок слоёв: салон → окно → сын → подушка сиденья → спинки передних
// сидений → мама (тело) → ремень → мама (руки) → панель, руль → телефон.
import type { Place, PoseIn } from "../rig/Actor";
import { Actor } from "../rig/Actor";
import type { Vec } from "../rig/motion";
import { CabinBack, CabinFront, FrontSeats } from "../sets/Car";
import { box } from "../shots";

export const MOM_DRIVE: Place = { x: 830, y: 1980, h: 1180 };
export const SON_BACK: Place = { x: 520, y: 1330, h: 610 };
export const MOM_SEAT = 780;
export const SON_SEAT = 300;
export const HOLDER: Vec = { x: 300, y: 1470 };
// руки на руле (обод: центр 820, 1340; радиус 190)
export const WHEEL_L: Vec = { x: 660, y: 1258 };
export const WHEEL_R: Vec = { x: 982, y: 1258 };
export const NEAR_EAR: Vec = { x: 720, y: 830 };
export const LOOK_AT: Vec = { x: 700, y: 1010 };

export const Cabin: React.FC<{
  readonly f: number;
  readonly uid: string;
  readonly pass: number; // путь машины (отражения, улица в окне)
  readonly moving: boolean;
  readonly window?: "street" | "school" | "parking";
  readonly momFace: (t: number) => number;
  readonly momPose: (t: number) => PoseIn;
  readonly son?: { readonly face: (t: number) => number; readonly pose: (t: number) => PoseIn };
  readonly phoneInHolder: boolean;
  readonly phoneGlow: number;
  readonly phoneShake: number;
  readonly phoneRed?: boolean; // на экране — пропущенный (красный значок)
}> = ({ f, uid, pass, moving, window = "street", momFace, momPose, son, phoneInHolder, phoneGlow, phoneShake, phoneRed }) => {
  const colors = window === "school" ? ["#F2E6D6", "#9FB6CE", "#F2E6D6", "#86B06A", "#E8DCCB"] : window === "parking" ? ["#DCE3E8", "#C9D0DA", "#E6DACB", "#86B06A", "#DCE3E8"] : ["#E3D3C1", "#7FAF63", "#DDE3E8", "#E8DCCB", "#86B06A"];
  return (
    <>
      <CabinBack />
      {/* в заднем окне — улица (плывёт, пока едем) */}
      <div style={box({ left: 170, top: 560, width: 740, height: 230, borderRadius: "60px 60px 10px 10px", overflow: "hidden" })}>
        {[0, 1, 2, 3, 4].map((i) => {
          const raw = i * 260 - pass * 10;
          const x = (((raw % 1300) + 1300) % 1300) - 200;
          return <div key={i} style={box({ left: x, top: 40 + (i % 2) * 30, width: 160, height: 200, backgroundColor: colors[i], borderRadius: i % 2 ? 80 : 6 })} />;
        })}
      </div>
      {son ? <Actor uid={`${uid}-son`} look="son" f={f} place={() => SON_BACK} face={son.face} pose={son.pose} seed={4} /> : null}
      {/* подушка заднего сиденья перед ногами сына */}
      <div style={box({ left: 370, top: 1120, width: 340, height: 220, borderRadius: "40px 40px 20px 20px", backgroundColor: "#5F6776" })} />
      {son ? (
        // зелёный рюкзак сына рядом с ним на сиденье
        <div style={box({ left: 300, top: 1040, width: 120, height: 150, borderRadius: "40px 40px 24px 24px", backgroundColor: "#3E9C6B", boxShadow: "inset 0 -20px 0 rgba(0,0,0,0.12)" })}>
          <div style={box({ left: 20, top: 66, width: 80, height: 50, borderRadius: 16, backgroundColor: "#348A5D" })} />
        </div>
      ) : null}
      <FrontSeats />
      <Actor uid={`${uid}-mom`} look="mom" f={f} place={() => MOM_DRIVE} face={momFace} pose={momPose} role="mother" seed={1} layer="body" />
      {/* ремень безопасности: от плеча у двери к замку у бедра */}
      <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible" })}>
        <path d="M 905 1005 L 745 1395" stroke="#2A2E36" strokeWidth={30} strokeLinecap="round" />
        <path d="M 905 1005 L 745 1395" stroke="#3A3F4A" strokeWidth={16} strokeLinecap="round" />
      </svg>
      <Actor uid={`${uid}-mom`} look="mom" f={f} place={() => MOM_DRIVE} face={momFace} pose={momPose} role="mother" seed={1} layer="arms" />
      <CabinFront pass={pass} wheel={moving ? Math.sin(f * 0.05) * 3 : 0} />
      {/* телефон в держателе */}
      {phoneInHolder ? (
        <div style={box({ left: HOLDER.x - 46 + phoneShake, top: HOLDER.y - 80, width: 92, height: 160, borderRadius: 16, backgroundColor: "#1E2235", border: "4px solid #11131A", boxShadow: phoneGlow > 0 ? `0 0 ${30 * phoneGlow}px rgba(190,220,255,${0.7 * phoneGlow})` : "none" })}>
          <div style={box({ left: 6, top: 7, right: 6, bottom: 7, borderRadius: 10, backgroundColor: phoneGlow > 0 ? (phoneRed ? "#F3E4E4" : "#5C7BA8") : "#2C3B5C" })} />
          {phoneGlow > 0 && !phoneRed ? <div style={box({ left: 28, top: 30, width: 36, height: 36, borderRadius: 18, backgroundColor: "#B9C7E6" })} /> : null}
          {phoneGlow > 0 && !phoneRed ? <div style={box({ left: 30, top: 110, width: 32, height: 32, borderRadius: 16, backgroundColor: "#3FB86A" })} /> : null}
          {phoneGlow > 0 && phoneRed ? <div style={box({ left: 16, top: 40, width: 60, height: 30, borderRadius: 10, backgroundColor: "#E2433A" })} /> : null}
        </div>
      ) : null}
      <div style={box({ left: HOLDER.x - 16, top: HOLDER.y + 80, width: 32, height: 70, backgroundColor: "#11131A" })} />
    </>
  );
};
