// Сын стоит у дивана (справа от папы) с альбомом в руках.
import { visemeAt } from "../context";
import { Album } from "../props";
import type { Face } from "../rig/Head";
import { Person, type PersonPose } from "../rig/Person";
import type { B12Cue } from "../timing";
import { breath, face, idleTilt, talkNod } from "./common";

export const SON_X = 1320;
export const SON_SCALE = 1.2;
export const SON_Y = 1700 - SON_SCALE * 360;

export const StandingSon: React.FC<{
  readonly t: number;
  readonly abs: number;
  readonly cues: readonly B12Cue[];
  readonly x?: number;
  // альбом в руках: высота (лок. координаты) и наклон; null — альбома нет
  readonly album: { readonly y: number; readonly rot?: number; readonly x?: number } | null;
  readonly f: Partial<Face>;
  readonly pose?: Partial<PersonPose>;
  readonly blinks?: readonly number[];
}> = ({ t, abs, cues, x = SON_X, album, f, pose, blinks }) => {
  const vis = visemeAt(cues, "son", abs);
  const ax = album?.x ?? 0;
  return (
    <Person
      uid="son-stand"
      look="son"
      x={x}
      y={SON_Y}
      scale={SON_SCALE}
      pose={{
        legs: "stand",
        tilt: idleTilt(t, 4, 1.6),
        nod: talkNod(vis, abs, 4),
        breathe: breath(t, 4),
        l: album ? { x: ax - 132, y: album.y + 14, kind: "hold" } : { x: -64, y: 138, kind: "rest" },
        r: album ? { x: ax + 132, y: album.y + 18, kind: "hold" } : { x: 64, y: 138, kind: "rest" },
        ...pose,
      }}
      face={face(abs, 4, vis, f, blinks)}
      propFront={
        album ? (
          <g transform={`translate(${ax} ${album.y}) rotate(${album.rot ?? 0})`}>
            <g transform="scale(0.4)">
              <Album uid="album-stand" />
            </g>
            <ellipse cx={-134} cy={14} rx={7} ry={13} fill="#F4CDA8" />
            <ellipse cx={134} cy={18} rx={7} ry={13} fill="#F4CDA8" />
          </g>
        ) : null
      }
    />
  );
};
