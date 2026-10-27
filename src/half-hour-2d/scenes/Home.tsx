import { interpolate, useCurrentFrame } from "remotion";
import { easeInOut } from "../../components/anim";
import { armKeys, LOOKS, type Arm, exprKeys } from "../Character";
import { useMouth } from "../context";
import { Phone } from "../props";
import { Actor, reach, type Placement } from "../rig";
import { BalaGoPage, FormScreen } from "../screens";
import { LivingRoom, SofaSeat } from "../sets2";
import { camMove, Shot } from "../shots";
import { keys } from "../ui";

const MOM_SOFA: Placement = { x: 370, y: 1560, h: 1000 };
const HUSBAND_SOFA: Placement = { x: 700, y: 1575, h: 1060 };

// ---------- Сцена 7: вечер дома (95–108 с) ----------
export const EveningScene: React.FC = () => {
  const f = useCurrentFrame();
  const momMouth = useMouth("mother");
  const husMouth = useMouth("husband");
  // муж берёт телефон с колен и показывает маме страницу
  const lapL = reach(HUSBAND_SOFA, "husband", -1, 640, 1420, 1);
  const showL = reach(HUSBAND_SOFA, "husband", -1, 545, 1260, 1);
  const husArmL: Arm = armKeys(f, [
    [0, lapL],
    [228, lapL],
    [256, showL],
    [390, showL],
  ]);
  const husArmR: Arm = reach(HUSBAND_SOFA, "husband", 1, 740, 1430, 1);
  const momArmL = reach(MOM_SOFA, "mom", -1, 330, 1420, 1);
  const momArmR = reach(MOM_SOFA, "mom", 1, 420, 1425, 1);
  const world = (
    <>
      <LivingRoom />
      <SofaSeat />
      <Actor
        at={MOM_SOFA}
        kind="mom"
        sit={1}
        expr={exprKeys(f, [[0, "tired"], [146, "neutral"], [296, "calm"]], 12)}
        mouth={momMouth}
        look={keys(f, [[0, 0], [120, 0], [136, 0.9], [240, 0.9], [262, 0.7]])}
        lookY={keys(f, [[0, 0.6], [110, 0.6], [136, 0], [240, 0], [262, 0.7]])}
        turn={keys(f, [[120, 0], [140, 0.35]])}
        shoulders={keys(f, [[0, 0.6], [150, 0.6], [200, 0.2]])}
        armL={momArmL}
        armR={momArmR}
        watchL
        seed={1}
      />
      <Actor
        at={HUSBAND_SOFA}
        kind="husband"
        sit={1}
        expr={exprKeys(f, [[0, "calm"], [146, "smile"]])}
        mouth={husMouth}
        look={keys(f, [[0, -0.9], [228, -0.9], [250, -0.5]])}
        lookY={keys(f, [[228, 0], [250, 0.5], [300, 0.5], [320, 0]])}
        turn={-0.4}
        armL={husArmL}
        armR={husArmR}
        itemL="phone"
        seed={3}
      />
    </>
  );
  const ph = interpolate(f, [255, 270], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  return (
    <>
      <Shot f={f} from={0} to={26} cam={camMove(f, 0, 26, { x: 540, y: 1180, scale: 1.32 }, { x: 535, y: 1180, scale: 1.35 })}>
        {world}
      </Shot>
      {/* мама устало делится: средний план */}
      <Shot f={f} from={26} to={150} cam={camMove(f, 26, 150, { x: 400, y: 1110, scale: 2.0 }, { x: 410, y: 1110, scale: 2.1 })}>
        {world}
      </Shot>
      <Shot f={f} from={150} to={255} cam={camMove(f, 150, 255, { x: 690, y: 1110, scale: 2.0 }, { x: 680, y: 1120, scale: 2.1 })}>
        {world}
      </Shot>
      {/* страница BalaGo на телефоне мужа */}
      <Shot
        f={f}
        from={255}
        to={330}
        cam={{ x: 540, y: 960, scale: 1 }}
        overlay={
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#E8D6BE" }}>
            <Phone w={640} style={{ left: 220, top: 300 + (1 - ph) * 40, rotate: "-2deg" }}>
              <BalaGoPage f={f - 255} />
            </Phone>
            {/* рука мужа держит телефон снизу справа: рукав свитера, ладонь, большой палец */}
            <div style={{ position: "absolute", left: 800, top: 1560 + (1 - ph) * 40, width: 190, height: 420, borderRadius: 80, backgroundColor: LOOKS.husband.top, rotate: "-28deg", transformOrigin: "50% 0%" }} />
            <div style={{ position: "absolute", left: 770, top: 1430 + (1 - ph) * 40, width: 150, height: 190, borderRadius: 70, backgroundColor: LOOKS.husband.skin, rotate: "-28deg" }} />
            <div style={{ position: "absolute", left: 752, top: 1388 + (1 - ph) * 40, width: 52, height: 120, borderRadius: 26, backgroundColor: LOOKS.husband.skin, rotate: "-38deg", boxShadow: "-4px 4px 10px rgba(20,40,90,0.15)" }} />
          </div>
        }
      >
        {world}
      </Shot>
      <Shot f={f} from={330} to={390} cam={camMove(f, 330, 390, { x: 540, y: 1150, scale: 1.65 }, { x: 540, y: 1150, scale: 1.72 })}>
        {world}
      </Shot>
    </>
  );
};

// ---------- Сцена 8: предварительная заявка (108–114 с) ----------
export const FormScene: React.FC = () => {
  const f = useCurrentFrame();
  const tapAt = 84;
  // палец: от края к полям, затем к кнопке «Арызды жөнөтүү»
  // палец плавно входит снизу, касается полей по очереди, нажимает кнопку
  const fx = keys(f, [[0, 760], [12, 560], [28, 560], [34, 560], [52, 560], [72, 600], [84, 560], [100, 760], [124, 980]]);
  const fy = keys(f, [[0, 1980], [12, 760], [28, 760], [34, 930], [52, 1100], [72, 1260], [84, 1240], [100, 1500], [124, 2000]]);
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#E8D6BE" }}>
      <Phone w={640} style={{ left: 220, top: 300 }}>
        <FormScreen f={f} fills={[12, 32, 54]} tapAt={tapAt} sentAt={96} />
      </Phone>
      <div style={{ position: "absolute", left: fx - 40, top: fy, width: 80, height: 260, borderRadius: 40, backgroundColor: LOOKS.mom.skin, boxShadow: "0 10px 30px rgba(20,40,90,0.18)" }} />
      <div style={{ position: "absolute", left: fx - 26, top: fy + 10, width: 52, height: 40, borderRadius: 20, backgroundColor: "#F6DCC4" }} />
    </div>
  );
};
