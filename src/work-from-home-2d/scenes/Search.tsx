// Сцена 12 «BalaGo'ну өздөрү табышты». Мама берёт телефон, папа смотрит
// рядом. Экран (правильной стороной, крупно): поиск «баланы мектептен үйгө
// жеткирүү» → в выдаче BalaGo «Балдар үчүн такси» → страница с короткой
// информацией о школьных поездках → «Алдын ала өтүнмө»: «Маршрут: Мектеп →
// Үй», «Баланы үйдө тосуп алуучу: Апасы» → касание «Жөнөтүү» → «Өтүнмө
// жөнөтүлдү». Только предварительная заявка; номер здесь не показывается.
import { useCurrentFrame } from "remotion";
import { anticipate, clamp, keys, keysV } from "../rig/motion";
import { HoldingHand, PhoneFrame, SearchFlow, TapFinger, type PhoneStep } from "../screens";
import { box, camMove, Shot } from "../shots";
import { sceneLen } from "./common";
import { sofaPose, sofaSeat } from "./Calendars";
import { KitchenWorld } from "./worlds";

export const SEARCH_SHOTS = { sofa: [0, 56], phone: [56, 384] } as const;
// касания (кадры сцены) и точки на экране (px кадра)
export const TAPS = {
  bar: { at: 64, x: 600, y: 512 },
  go: { at: 136, x: 600, y: 512 },
  result: { at: 196, x: 560, y: 760 },
  apply: { at: 258, x: 560, y: 1095 },
  send: { at: 330, x: 540, y: 1225 },
} as const;

export const SearchScene: React.FC = () => {
  const f = useCurrentFrame();
  const len = sceneLen("search");
  const S = SEARCH_SHOTS;
  const dad = sofaSeat("dad");
  const mom = sofaSeat("mom");
  const phoneRest = { x: mom.x + 0.22 * mom.h, y: mom.y - 0.3 * mom.h };
  const phoneHold = { x: mom.x + 0.05 * mom.h, y: mom.y - 0.52 * mom.h };
  const take = 22;
  const lower = S.phone[1] + 14;
  const momPose = (t: number) => ({
    ...sofaPose(mom),
    expr: t < S.phone[1] ? ("thinking" as const) : ("softSmile" as const),
    lean: 6,
    lookY: t < lower ? 0.5 : 0,
    armR: {
      target: keysV(t, [[0, { x: mom.x + 0.04 * mom.h, y: mom.y - 0.37 * mom.h }], [take, phoneRest], [take + 22, phoneHold], [lower, phoneHold], [lower + 20, { x: mom.x + 0.04 * mom.h, y: mom.y - 0.37 * mom.h }]], anticipate),
      shape: t >= take ? ("phone" as const) : ("relax" as const),
      item: t >= take ? ("phone" as const) : ("none" as const),
      flat: t >= take ? 0.3 : 1,
      elbow: "down" as const,
      behind: false,
    },
    armL: { target: { x: mom.x - 0.03 * mom.h, y: mom.y - 0.37 * mom.h }, shape: "relax" as const, elbow: "down" as const },
  });
  const dadPose = (t: number) => ({
    ...sofaPose(dad),
    expr: t < S.phone[1] ? ("calm" as const) : ("smile" as const),
    lean: keys(t, [[take, 0], [take + 20, 10]]),
    lookY: 0.45,
    armL: { target: { x: dad.x - 0.04 * dad.h, y: dad.y - 0.37 * dad.h }, shape: "relax" as const, elbow: "down" as const },
    armR: { target: { x: dad.x + 0.04 * dad.h, y: dad.y - 0.37 * dad.h }, shape: "relax" as const, elbow: "down" as const },
    nod: keys(t, [[S.phone[1] + 6, 0], [S.phone[1] + 14, 5], [S.phone[1] + 24, 0]]),
  });
  const world = (
    <KitchenWorld
      minutes={19 * 60 + 6}
      evening={1}
      workLight={0}
      sofa={[
        { uid: "s12-dad", look: "dad", f, place: () => dad, face: () => 0.45, pose: dadPose, seed: 2 },
        { uid: "s12-mom", look: "mom", f, place: () => mom, face: (t) => keys(t, [[0, 0.1], [lower, 0.1], [lower + 14, -0.5]]), pose: momPose, seed: 1 },
      ]}
    />
  );
  // экран: шаг меняется после касаний
  const step: PhoneStep = f < TAPS.go.at + 6 ? "search" : f < TAPS.result.at + 6 ? "results" : f < TAPS.apply.at + 6 ? "page" : f < TAPS.send.at + 8 ? "form" : "sent";
  const stepAt = step === "results" ? TAPS.go.at + 6 : step === "page" ? TAPS.result.at + 6 : step === "form" ? TAPS.apply.at + 6 : step === "sent" ? TAPS.send.at + 8 : 0;
  const typed = clamp((f - TAPS.bar.at - 8) / 56);
  // палец: подходит к точке касания, нажимает, отходит
  const taps = Object.values(TAPS);
  const pos = keysV(f, taps.flatMap((t) => [[t.at - 20, { x: t.x + 260, y: t.y + 620 }], [t.at - 6, { x: t.x + 40, y: t.y + 60 }], [t.at - 1, { x: t.x, y: t.y }], [t.at + 8, { x: t.x + 30, y: t.y + 50 }], [t.at + 22, { x: t.x + 260, y: t.y + 620 }]] as const), anticipate);
  const press = Math.max(...taps.map((t) => clamp(1 - Math.abs(f - t.at) / 5)));
  const typingNow = f > TAPS.bar.at + 8 && f < TAPS.bar.at + 64;
  return (
    <>
      <Shot f={f} from={S.sofa[0]} to={S.sofa[1]} cam={camMove(f, S.sofa[0], S.sofa[1], { x: -180, y: 1160, zoom: 1.25 }, { x: -170, y: 1160, zoom: 1.3 })}>
        {world}
      </Shot>
      <Shot
        f={f}
        from={S.phone[0]}
        to={S.phone[1]}
        cam={{ x: 540, y: 960, zoom: 1 }}
        overlay={
          <div style={box({ inset: 0, background: "linear-gradient(180deg, #6E8FB6, #5B7BA2)" })}>
            <PhoneFrame x={170} y={330} w={740}>
              <SearchFlow f={f} step={step} typed={typed} stepAt={stepAt} pressSend={clamp(1 - Math.abs(f - TAPS.send.at) / 5)} />
            </PhoneFrame>
            <HoldingHand x={170} y={330} w={740} sleeve="#5E9A93" skin="#E6B590" side={-1} />
            {/* клавиатура при наборе запроса */}
            {typingNow ? (
              <div style={box({ left: 196, top: 1290, width: 688, height: 520, borderRadius: "0 0 60px 60px", backgroundColor: "#D7DDE5", padding: "24px 14px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 })}>
                {[10, 9, 9, 5].map((n, r) => (
                  <div key={r} style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {Array.from({ length: n }).map((_, k) => (
                      <div key={k} style={{ width: r === 3 && k === 2 ? 260 : 56, height: 88, borderRadius: 12, backgroundColor: "#FFFFFF", boxShadow: "0 3px 0 #AEB6C4" }} />
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
            <TapFinger x={typingNow ? 300 + 66 * ((f * 3) % 7) : pos.x} y={typingNow ? 1360 + 104 * (Math.floor(f / 7) % 3) : pos.y} press={typingNow ? (f % 7 < 3 ? 1 : 0) : press} skin="#E6B590" sleeve="#5E9A93" a={clamp((f - S.phone[0] - 2) / 6)} />
          </div>
        }
      >
        {null}
      </Shot>
      <Shot f={f} from={S.phone[1]} to={len} cam={camMove(f, S.phone[1], len, { x: -200, y: 1150, zoom: 1.3 }, { x: -200, y: 1150, zoom: 1.34 })}>
        {world}
      </Shot>
    </>
  );
};
