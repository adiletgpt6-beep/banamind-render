// S08 · Папка снова в чемодане.
//
// Визуальная рифма с S01: тот же ракурс сверху (TOP_CAM), тот же стол,
// чемодан, расписание и папка тех же размеров. Но теперь без сомнения:
//  • папка лежит на столе (там, куда мама положила её в S01); кисть мамы
//    приходит сверху справа, берёт папку за угол и поднимает («кайра алып»);
//  • уверенно переносит и опускает её в чемодан (≈1,3 с) — «салды»;
//  • пальцы раскрываются, ладонь разглаживает папку (папка чуть
//    выравнивается под ладонью); взгляд к расписанию не возвращается;
//  • кисть уходит из кадра полностью; только потом крышка закрывается
//    (вращение вокруг шарнира, ≈0,7 с, мягко ускоряясь), затем короткая
//    молния — бегунок проходит вдоль ближнего края. Камера в конце
//    чуть подъезжает к закрытому чемодану.
import { useScene, usePlan, Shot, Svg, camKeys, useInk } from "../kit";
import { sceneTools } from "../plan";
import type { Sd2Timeline } from "../timing";
import { clamp, easeIn, easeInOut, easeOut, glide, lerp, type Vec } from "../rig/motion";
import { SuitcaseTop } from "../props/Suitcase";
import { FolderTop } from "../props/Folder";
import { ScheduleSheet } from "../props/Calendar";
import { CloseHand, SKIN } from "../props/CloseHand";
import { TableTop } from "../sets/Home";
import { IN, SC, SHEET, TOP_CAM } from "./S01Suitcase";
import type { Sd2SfxPlan } from "../sfx";

// Кадры действий (кадры сцены) — общие для анимации и звука.
export const packPlan = (tl: Sd2Timeline) => {
  const T = sceneTools(tl, "pack");
  const contact = T.word("N07", "кайра") - 2; // кисть взяла папку со стола
  const reach0 = Math.max(0, contact - 24);
  const lift = contact + 10; // папка поднята над столом
  const land = Math.max(lift + 34, T.word("N07", "салды") + 3); // легла в чемодан
  const open = land + 4; // пальцы раскрываются
  const smooth0 = land + 8; // ладонь разглаживает папку
  const smooth1 = smooth0 + 20;
  const exit0 = smooth1 + 1; // кисть уходит из кадра целиком
  const exit1 = exit0 + 16;
  const lid0 = exit1 + 3; // крышка закрывается
  const lid1 = lid0 + 21;
  const zip0 = lid1 + 3; // молния
  const zip1 = Math.min(T.len - 6, zip0 + 13);
  return { len: T.len, reach0, contact, lift, land, open, smooth0, smooth1, exit0, exit1, lid0, lid1, zip0, zip1 };
};
type Plan = ReturnType<typeof packPlan>;

const FW = 300; // папка — те же размеры, что в S01
const FH = 220;
const ON_TABLE: Vec = { x: 792, y: 368 }; // папка на столе (дальше чемодана, справа)
const ROT_TABLE = 7;
const ROT_IN = -4;
// плечо мамы за кадром сверху справа: от него — направление руки
const SHOULDER: Vec = { x: 1260, y: -270 };
const HAND = 150;

// угол кисти (CloseHand): рукав направлен к плечу
const armAngle = (w: Vec) => (Math.atan2(SHOULDER.x - w.x, -(SHOULDER.y - w.y)) * 180) / Math.PI;
// точка на линии «запястье → плечо»
const towardShoulder = (w: Vec, d: number): Vec => {
  const dx = SHOULDER.x - w.x;
  const dy = SHOULDER.y - w.y;
  const L = Math.hypot(dx, dy) || 1;
  return { x: w.x + (dx / L) * d, y: w.y + (dy / L) * d };
};
// запястье держит правый верхний угол папки (как в S01)
const gripOf = (c: Vec, rot: number, sc: number): Vec => {
  const r = (rot * Math.PI) / 180;
  const lx = (FW / 2) * sc;
  const ly = (-FH / 2) * sc;
  return { x: c.x + lx * Math.cos(r) - ly * Math.sin(r) + 34, y: c.y + lx * Math.sin(r) + ly * Math.cos(r) - 56 };
};

// Папка: центр, поворот, высота над поверхностью (0…1).
const folderAt = (f: number, p: Plan) => {
  if (f < p.contact) return { c: ON_TABLE, rot: ROT_TABLE, h: 0 };
  if (f < p.lift) {
    const u = easeOut((f - p.contact) / (p.lift - p.contact));
    return { c: { x: ON_TABLE.x - u * 6, y: ON_TABLE.y - u * 10 }, rot: ROT_TABLE, h: u * 0.75 };
  }
  if (f < p.land) {
    const u = (f - p.lift) / (p.land - p.lift);
    const c = glide(f, p.lift, p.land, [{ x: ON_TABLE.x - 6, y: ON_TABLE.y - 10 }, { x: 640, y: 500 }, { x: 470, y: 682 }, IN]);
    // высота держится, затем папка уверенно опускается в чемодан
    const h = 0.75 * (1 - easeInOut(clamp((u - 0.45) / 0.55)));
    return { c, rot: lerp(ROT_TABLE, ROT_IN, easeInOut(u)), h };
  }
  // ладонь разглаживает: папка чуть выравнивается и сдвигается вместе с ней
  const s = easeInOut((f - p.smooth0) / (p.smooth1 - p.smooth0));
  return { c: { x: IN.x - s * 4, y: IN.y + s * 1.5 }, rot: lerp(ROT_IN, -2.5, s), h: 0 };
};

// Кисть: запястье, форма, размер (выше — чуть крупнее).
const handAt = (f: number, p: Plan) => {
  const fo = folderAt(f, p);
  const sc = 1 + fo.h * 0.06;
  const grip = gripOf(fo.c, fo.rot, sc);
  if (f < p.contact) {
    // приходит из-за края кадра к углу папки
    const g0 = gripOf(ON_TABLE, ROT_TABLE, 1);
    const u = easeInOut((f - p.reach0) / (p.contact - p.reach0));
    const from = towardShoulder(g0, 470);
    return { w: { x: lerp(from.x, g0.x, u), y: lerp(from.y, g0.y, u) }, shape: f < p.contact - 3 ? ("rest" as const) : ("pinch" as const), size: HAND * (1 + 0.05 * (1 - u)) };
  }
  if (f < p.open) return { w: grip, shape: "pinch" as const, size: HAND * sc };
  // пальцы отпустили: кисть чуть приподнимается и ложится ладонью на папку
  const g1 = gripOf(IN, ROT_IN, 1);
  const B: Vec = { x: 548, y: 650 }; // ладонь на правой части папки
  const E: Vec = { x: 430, y: 700 }; // провела влево
  if (f < p.smooth0) {
    const u = easeInOut((f - p.open) / (p.smooth0 - p.open));
    return { w: { x: lerp(g1.x, B.x, u), y: lerp(g1.y, B.y, u) - Math.sin(u * Math.PI) * 18 }, shape: "open" as const, size: HAND * (1 + 0.04 * Math.sin(u * Math.PI)) };
  }
  if (f < p.exit0) {
    const u = easeInOut((f - p.smooth0) / (p.smooth1 - p.smooth0));
    return { w: { x: lerp(B.x, E.x, u), y: lerp(B.y, E.y, u) + Math.sin(u * Math.PI) * 6 }, shape: "open" as const, size: HAND };
  }
  // уходит вдоль руки к плечу — полностью за кадр
  const u = easeIn((f - p.exit0) / (p.exit1 - p.exit0));
  const out = towardShoulder(E, Math.hypot(SHOULDER.x - E.x, SHOULDER.y - E.y) - 60);
  return { w: { x: lerp(E.x, out.x, u), y: lerp(E.y, out.y, u) }, shape: "open" as const, size: HAND * (1 + 0.05 * u) };
};

const PackShot: React.FC<{ f: number; p: Plan }> = ({ f, p }) => {
  const ink = useInk(4);
  const fo = folderAt(f, p);
  const inCase = f >= p.land;
  const lid = f < p.lid0 ? 0 : 1 - Math.cos((clamp((f - p.lid0) / (p.lid1 - p.lid0)) * Math.PI) / 2);
  const zipT = easeInOut((f - p.zip0) / (p.zip1 - p.zip0));
  const hand = handAt(f, p);
  const handVisible = f >= p.reach0 && f < p.exit1;
  const sc = 1 + fo.h * 0.06;
  return (
    <>
      <TableTop ink={ink} uid="s08-top" />
      <Svg>
        <g transform={`rotate(-3 ${SHEET.x + SHEET.w / 2} ${SHEET.y + SHEET.h / 2})`}>
          <ScheduleSheet x={SHEET.x} y={SHEET.y} w={SHEET.w} h={SHEET.h} ink={ink * 0.8} />
        </g>
        <SuitcaseTop x={SC.x} hinge={SC.hinge} w={SC.w} h={SC.h} lid={lid} zipT={zipT} ink={ink}>
          {inCase ? <FolderTop cx={fo.c.x} cy={fo.c.y} w={FW} h={FH} rot={fo.rot} ink={ink} /> : null}
        </SuitcaseTop>
        {!inCase ? <FolderTop cx={fo.c.x} cy={fo.c.y} w={FW * sc} h={FH * sc} rot={fo.rot} ink={ink} shadow={fo.h} /> : null}
        {handVisible ? <CloseHand x={hand.w.x} y={hand.w.y} angle={armAngle(hand.w)} size={hand.size} look={SKIN.mom} shape={hand.shape} armLen={9} ink={ink} /> : null}
      </Svg>
    </>
  );
};

export const S08Pack: React.FC = () => {
  const { f } = useScene("pack");
  const p = usePlan(packPlan);
  // камера: чуть шире (папка на столе) → тот же ракурс, что в S01 → лёгкий
  // подъезд к закрытому чемодану
  const cam = camKeys(f, [
    [0, { x: 556, y: 804, zoom: 1.1 }],
    [p.land, { ...TOP_CAM }],
    [p.lid0, { ...TOP_CAM }],
    [p.len, { x: 480, y: 836, zoom: 1.33 }],
  ]);
  return (
    <Shot f={f} cam={cam}>
      <PackShot f={f} p={p} />
    </Shot>
  );
};

// Звук: папка ложится в чемодан, крышка закрывается, молния.
export const sfxS08Pack: Sd2SfxPlan = (tl) => {
  const p = packPlan(tl);
  return [
    { at: 0, kind: "room", dur: p.len / 30 },
    { at: p.land - 2, kind: "folder-down", volume: 0.32 },
    { at: p.lid1 - 2, kind: "lid", volume: 0.4 },
    { at: p.zip0, kind: "zip", volume: 0.3 },
  ];
};
