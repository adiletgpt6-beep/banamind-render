// Технический лист вертушки 80-1-3: крупно в подставке с разгоном,
// повороты плоскости ротора, мелкий масштаб общего плана, вертушка в руке,
// увеличенный центр ротора (проверка контуров у бусины) и вертушка на фоне
// луга за окном со скоростью фильма (читаемость всех четырёх цветов).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Pinwheel, PinwheelInStand, pinwheelInStandHub, spinRamp } from "../sets/pinwheel";

export const PinwheelTest: React.FC = () => {
  const fr = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = fr / fps;
  // разгон 0 → 600°/с за 60 кадров, дальше постоянно (угол — аналитически)
  const sp = spinRamp(t, 0, 60 / fps, 0, 600, fps);
  const slow = spinRamp(t, 0, 0, 90, 90, fps); // медленное вращение без следа
  const film = spinRamp(t, 0, 0, -290, -290, fps); // как в фильме: против часовой
  const hub = pinwheelInStandHub(0, 0, 6);
  return (
    <AbsoluteFill style={{ background: "#f3ead9" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {/* на фоне луга за окном (цвета windowCorner) и столешницы */}
        <rect x={1575} y={40} width={325} height={480} fill="#86b56b" />
        <rect x={1575} y={380} width={325} height={140} fill="#7aaa60" />
        <rect x={1575} y={520} width={325} height={80} fill="#c9925f" />
        <PinwheelInStand x={1680} y={590} s={1.2} angle={film.angle} blur={film.blur} />
        <PinwheelInStand x={1830} y={590} s={0.53} angle={film.angle} blur={film.blur} />
        {/* крупно, s = 3 */}
        <PinwheelInStand x={330} y={1030} s={3} angle={sp.angle} blur={sp.blur} />
        {/* yaw 0, 35, 55, −55 в покое */}
        {[0, 35, 55, -55].map((yaw, i) => (
          <PinwheelInStand key={yaw} x={720 + i * 250} y={470} s={1.5} angle={0} yaw={yaw} />
        ))}
        {/* s = 0.53 (как в мире) и 0.265 (общий план мира 3840 на кадре 1920) */}
        <PinwheelInStand x={690} y={1010} s={0.53} angle={0} />
        <PinwheelInStand x={770} y={1010} s={0.53} angle={sp.angle} blur={sp.blur} yaw={35} />
        <PinwheelInStand x={690} y={760} s={0.265} angle={0} />
        <PinwheelInStand x={740} y={760} s={0.265} angle={sp.angle} blur={sp.blur} />
        {/* в руке: наклон 8°, медленно */}
        <Pinwheel x={980} y={1060} s={1.5} rot={8} angle={slow.angle} blur={slow.blur} />
        {/* дует справа: yaw 55, быстро */}
        <PinwheelInStand x={1230} y={1030} s={1.5} angle={sp.angle} blur={sp.blur} yaw={55} />
        {/* центр ротора при s = 6 (окно 380×380) */}
        <svg x={1500} y={660} width={380} height={380} viewBox={`${hub.x - 190} ${hub.y - 190} 380 380`}>
          <rect x={hub.x - 190} y={hub.y - 190} width={380} height={380} fill="#efe3cc" />
          <PinwheelInStand x={0} y={0} s={6} angle={sp.angle * 0.2} blur={sp.blur * 0.2} />
        </svg>
        <rect x={1500} y={660} width={380} height={380} fill="none" stroke="#b9a98c" strokeWidth={2} />
      </svg>
    </AbsoluteFill>
  );
};
