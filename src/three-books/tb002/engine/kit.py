"""TB-002 world layout, persistent cast and authoring helpers used by the scene scripts.

World coordinates (camera z = 1 shows 1920×1080 around (cx, cy)); the floor is at y = GROUND.
Locations along x: A — Tiko's stall by the upper passage; B — bench, door and stairs on Naya's route;
C — box pickup point with the low table, neighbour's stall further on; BOARD — empty area for calm
light explanatory compositions."""
import math

import numpy as np

import film
import rigs
import shapes
from film import RigActor, ShapeActor

GROUND = 905.0
TS = 1.15          # Tiko scale (≈ 345 px tall; Naya ≈ 420 px)
STALL_X = 900.0
STALL_Y = GROUND - 230
COUNTER_TOP = STALL_Y + 80
SIGN_Y = STALL_Y - 188
BOX_X, BOX_Y = 760.0, COUNTER_TOP - 55
BENCH_X, DOOR_X, STAIRS_X = 2500.0, 3150.0, 3700.0
PICKUP_X, TABLE_X, NEIGHBOR_X = 5400.0, 5900.0, 6700.0
TABLEA_X = 1420.0       # low test table next to the stall
TABLE_TOP = GROUND - 60 - 20
BOARD_X = 14000.0
UPPER_Y = 175.0


def auto_n(name, smax=1.0):
    return int(min(16000, max(250, film.shape_area(name) * smax * smax / film.SPACING ** 2 * 1.25)))


class Kit:
    def __init__(self, st):
        self.st = st
        self.T = st.T
        self.warn = []
        self._seed = 0
        self.build_world()
        self.build_cast()

    # ------------------------------------------------------------ actors
    def prop(self, name, x=960, y=540, s=1.0, layer=3, smax=None, n=None, **kw):
        self._seed += 1
        a = ShapeActor(name, n=n or auto_n(name, smax or max(1.0, s)), seed=self._seed, layer=layer, x=x, y=y,
                       s=s, **kw)
        return self.st.add(a)

    def rig(self, r, seed, s=1.0, layer=5, y=GROUND, **kw):
        return self.st.add(RigActor(r, seed=seed, layer=layer, s=s, y=y, **kw))

    def build_world(self):
        P = self.prop
        self.env = []
        for i in range(5):
            self.env.append(P("floor", x=-1200 + 2400 * i + 1200 - 1200, y=GROUND + 4, layer=-3, alpha=0.85))
            self.env.append(P("upper", x=-1200 + 2400 * i, y=UPPER_Y, layer=-4, alpha=0.32))
        self.stall = P("stall", STALL_X, STALL_Y, layer=1, alpha=1.0)
        self.psign = P("platform_sign", 1700, 150, layer=0, alpha=0.9)
        self.bench = P("bench", BENCH_X, GROUND - 40, layer=1, alpha=1.0)
        self.door = P("door", DOOR_X, GROUND - 160, layer=1, alpha=1.0)
        self.stairs = P("stairs", STAIRS_X, GROUND - 160, layer=0, alpha=0.9)
        self.pickup = P("pickup", PICKUP_X, GROUND - 200, layer=1, alpha=0.6)
        self.table = P("lowtable", TABLE_X, GROUND - 60, layer=1, alpha=1.0)
        self.tableA = P("lowtable", TABLEA_X, GROUND - 60, layer=1, alpha=0.0)
        self.nstall = P("neighbor_stall", NEIGHBOR_X, GROUND - 190, layer=1, alpha=1.0)
        for a in [self.stall, self.psign, self.bench, self.door, self.stairs, self.pickup, self.table,
                  self.nstall, self.tableA] + self.env:
            a.key(0, 0.01, alpha=a.tr.init["alpha"])
            a.tr.init["alpha"] = a.tr.init["alpha"]
        self.st.cap(0, film.TOTAL, "К платформам", 1680, 150, "note", world=True, fade=0.01)

    def build_cast(self):
        self.tiko = self.rig(rigs.tiko(), 7, s=TS, layer=6, x=590, face=1.0)
        self.naya = self.rig(rigs.naya(), 21, s=1.0, layer=6, x=2300, face=1.0)
        self.p = {k: self.rig(rigs.passer(k), 30 + i, s=0.97, layer=4, x=-400, dim=0.85)
                  for i, k in enumerate(("p1", "p2", "p3", "p4", "elder", "neighbor"))}
        self.small = [self.rig(rigs.passer(k), 60 + i, s=0.42, layer=-2, x=-400, y=UPPER_Y + 40, dim=0.45)
                      for i, k in enumerate(("p1", "p3", "p2", "p4"))]
        P = self.prop
        self.unibox = P("unibox", BOX_X, BOX_Y, layer=4, smax=1.6)    # later becomes the carrier
        self.uscreen = P("unibox_screen", BOX_X - 20, BOX_Y - 40, layer=3)
        self.uflag = P("unibox_flag", BOX_X + 60, BOX_Y - 40, layer=3)
        self.udrawer1 = P("unibox_drawer", BOX_X, BOX_Y + 15, layer=3)
        self.udrawer2 = P("unibox_drawer", BOX_X, BOX_Y + 37, layer=3)
        self.uhandle = P("unibox_handle", BOX_X, BOX_Y - 55, layer=3)
        self.manual = P("manual", BOX_X + 120, COUNTER_TOP - 40, layer=4)
        self.nboxes = P("boxpair", 0, 0, layer=5)        # Naya's two flat boxes
        self.cord = P("cord_tie", 0, 0, layer=6)
        self.tray = P("tray", STALL_X + 120, COUNTER_TOP - 16, layer=3)

    # ------------------------------------------------------------ timing helpers
    def w(self, bid, needle, occ=1, end=False, frac=None):
        """Time of a spoken word (measured alignment); never crashes the build."""
        try:
            return self.T.W(bid, needle, occ, end)
        except KeyError:
            b = self.T.blocks[bid]
            self.warn.append(f"{bid}:{needle}")
            return b["start"] + b["dur"] * (0.5 if frac is None else frac)

    def S(self, bid, dt=0.0):
        return self.T.S(bid, dt)

    def E(self, bid, dt=0.0):
        return self.T.E(bid, dt)

    # ------------------------------------------------------------ staging helpers
    def place(self, a, t, **kw):
        a.key(t, 0.01, **kw)
        return a

    def pose(self, a, t, name=None, d=0.6, **kw):
        a.key(t, d, pose=name, **kw) if isinstance(a, RigActor) else a.key(t, d, **kw)
        return a

    def show(self, a, t, d=0.6, alpha=1.0, **kw):
        a.key(t, d, alpha=alpha, **kw)
        return a

    def hide(self, a, t, d=0.6):
        a.key(t, d, alpha=0.0)
        return a

    def walk(self, a, t, x1, speed=None, pose_after="stand", y=None, walk_pose="walk"):
        """Walk to x1 starting at t; returns arrival time. Faces the walking direction."""
        st = a.tr.at(t)
        x0 = st["x"]
        if speed is None:
            speed = 115 * a.tr.init["s"] if a.rig is rigs.tiko() else 230 * a.tr.init["s"]
        d = max(0.6, abs(x1 - x0) / speed)
        face = 1.0 if x1 >= x0 else -1.0
        a.key(t, 0.25, face=face, pose=walk_pose)
        kw = {"x": x1}
        if y is not None:
            kw["y"] = y
        a.key(t + 0.25, d, **kw)
        # keep the stride while moving: re-key pose fields at the same values (x tween continues)
        a.key(t + 0.25 + d, 0.35, pose=pose_after, x=x1, **({} if y is None else {"y": y}))
        return t + 0.25 + d

    def turn(self, a, t, face, d=0.45):
        a.key(t, d, face=float(face))
        return a

    def cam(self, t, d=1.2, cx=None, cy=None, z=None):
        kw = {}
        if cx is not None:
            kw["cx"] = float(cx)
        if cy is not None:
            kw["cy"] = float(cy)
        if z is not None:
            kw["z"] = float(z)
        self.st.cam.key(t, d, **kw)

    def cut(self, t, cx, cy=540.0, z=1.0, light=None, dip=0.35):
        """Soft cut: brief fade to the background, move the camera, fade back in."""
        self.st.look.key(t - dip, dip, fade=0.0)
        self.st.cam.key(t, 0.01, cx=float(cx), cy=float(cy), z=float(z))
        if light is not None:
            self.st.look.key(t, 0.01, light=float(light), bloom=0.12 if light else 0.4, dust=0.3 if light else 1.0)
        self.st.look.key(t + 0.02, dip + 0.15, fade=1.0)

    def board(self, t0, t1, cx=BOARD_X, cy=540.0, back=None):
        """Light explanatory composition in the empty BOARD area between t0 and t1, then return."""
        self.cut(t0, cx, cy, 1.0, light=1.0)
        if back is not None:
            self.cut(t1, *back, light=0.0)

    def headline(self, t0, t1, s, y=118, style="label", x=None, **kw):
        """Screen-fixed short caption (scene idea), top centre by default."""
        return self.st.cap(t0, t1, s, 960 if x is None else x, y, style, world=False, **kw)

    def label(self, t0, t1, s, x, y, style="small", **kw):
        """Caption attached to the world (follows the camera)."""
        return self.st.cap(t0, t1, s, x, y, style, world=True, **kw)

    def sfx(self, t, kind, gain=1.0):
        self.st.sound(t, kind, gain)

    def flow(self, n, t0, t1, src, dst, **kw):
        return self.st.add(film.Flow(n, t0, t1, src, dst, **kw))

    # ------------------------------------------------------------ carry helpers
    def hold(self, obj, rig, t, joint="hand_f", dx=0.0, dy=0.0, d=0.35):
        """From t the object follows the rig's hand (smooth pick-up)."""
        obj.attach(rig, joint)
        obj.key(t, d, att=1.0, adx=float(dx), ady=float(dy))
        return obj

    def release(self, obj, t, x, y, d=0.35, **kw):
        """Put the object down at (x, y): it leaves the hand and rests there."""
        obj.key(t, 0.01, x=float(x), y=float(y))
        obj.key(t + 0.01, d, att=0.0, **kw)
        return obj

    def walker(self, a, t0, x0, x1, speed=None, face=None, alpha=1.0, fade=0.5, walk_pose="walk"):
        """A passer-by crossing the frame: appears at x0, walks to x1, disappears."""
        self.place(a, t0, x=float(x0), alpha=0.0, face=float(face if face is not None else (1 if x1 > x0 else -1)))
        a.key(t0 + 0.01, fade, alpha=alpha)
        t1 = self.walk(a, t0 + 0.02, x1, speed=speed, walk_pose=walk_pose)
        a.key(t1 - fade, fade, alpha=0.0)
        return t1
