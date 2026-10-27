"""TB-003 world layout, persistent cast and authoring helpers used by the scene scripts.

World coordinates (camera z = 1 shows 1920×1080 around (cx, cy)); the floor is at y = GROUND.
Locations along x: GARDEN — the city garden of lights where Rin builds panels at his main job; ROOM — his
workroom with the table, the two plaques and a window; SITE — the training site: a row of stands, the
materials table and the side room behind an open door where Rin waits; SAI — another site of another
working circle; BOARD — empty area for calm light explanatory compositions.
Helpers (timing by spoken words, staging, carrying) follow the TB-002 kit; the world and cast are new."""
import numpy as np

import film
import rigs
import shapes
from film import RigActor, ShapeActor

GROUND = 905.0
RS = 1.15            # Rin scale (≈ 310 px tall); Tai ≈ 440 px; people ≈ 400 px
GARDEN_X = 1000.0
G_STANDS = (640.0, 860.0, 1080.0, 1300.0)
ROOM_X = 4600.0
TABLE_Y = GROUND - 140      # table centre; its top is 24 px higher
TABLE_TOP = TABLE_Y - 24
ROOM_DOOR_X = ROOM_X + 640
WINDOW_X = ROOM_X - 640
SITE_X = 8000.0
S_STANDS = (7520.0, 7720.0, 7920.0, 8120.0)
MAT_X = 7050.0               # materials table on the site
SITE_DOOR_X = 8640.0         # the open door; Rin's side room is behind it (x > 8700)
SIDE_X = 8900.0
SAI_X = 11600.0
BOARD_X = 15000.0
STAND_Y = GROUND - 206       # stand centre (foot on the floor)
PANEL_Y = GROUND - 328       # panel centre when hung on a stand
SKY_Y = 330.0


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

    def fixed(self, name, x, y, alpha=1.0, layer=1, **kw):
        a = self.prop(name, x, y, layer=layer, alpha=alpha, **kw)
        a.key(0, 0.01, alpha=alpha)
        return a

    def build_world(self):
        F = self.fixed
        self.env = []
        for i in range(6):
            x0 = -1200 + 2400 * i
            self.env.append(F("ground", x0 + 1200 - 1200, GROUND + 4, layer=-3, alpha=0.85))
            self.env.append(F("skyline", x0, SKY_Y, layer=-6, alpha=0.16))
        # garden of lights (main job)
        for x in (180, 1720, 2250):
            self.env.append(F("tree", x, GROUND - 270, layer=-4, alpha=0.55))
        for x in (420, 1520, 2000):
            self.env.append(F("lamp", x, GROUND - 206, layer=-1, alpha=0.9))
        self.env.append(F("arch", 2600, GROUND - 210, layer=-2, alpha=0.65))
        for x in (300, 1180, 1880):
            self.env.append(F("bush", x, GROUND - 60, layer=0, alpha=0.75))
        self.g_stands = [F("stand", x, STAND_Y, layer=1, alpha=0.6) for x in G_STANDS]
        self.g_panels = [F("panel_" + k, x, PANEL_Y, layer=2, alpha=1.0) for k, x in zip("abcd", G_STANDS)]
        # workroom
        self.table = F("table", ROOM_X, TABLE_Y, layer=1)
        self.room_door = F("door_room", ROOM_DOOR_X, GROUND - 160, layer=0)
        self.window = F("window", WINDOW_X, 430, layer=-1, alpha=0.8)
        self.env.append(F("lamp", ROOM_X - 760, GROUND - 206, layer=-1, alpha=0.6))
        # training site
        self.s_stands = [F("stand", x, STAND_Y, layer=1, alpha=0.6) for x in S_STANDS]
        self.mat_table = F("table", MAT_X, TABLE_Y, layer=1)
        self.materials = F("materials", MAT_X - 40, TABLE_TOP - 62, layer=2)
        self.site_door = F("door_room_open", SITE_DOOR_X, GROUND - 160, layer=0)
        self.site_marks = F("site_marks", SITE_X, GROUND + 18, layer=-2, alpha=0.6)
        for x in (6500, 9600):
            self.env.append(F("tree", x, GROUND - 270, layer=-4, alpha=0.45))
        self.env.append(F("lamp", 6750, GROUND - 206, layer=-1, alpha=0.8))
        # Sai's site in another working circle
        self.sai_arch = F("arch", SAI_X - 300, GROUND - 210, layer=-2, alpha=0.6)
        self.sai_stands = [F("stand", SAI_X + dx, STAND_Y, layer=1, alpha=0.55) for dx in (120, 340)]
        self.sai_panels = [F("panel_" + k, SAI_X + dx, PANEL_Y, layer=2, alpha=0.9) for k, dx in (("d", 120), ("a", 340))]
        self.env.append(F("tree", SAI_X + 700, GROUND - 270, layer=-4, alpha=0.5))

    def build_cast(self):
        self.rin = self.rig(rigs.rin(), 7, s=RS, layer=6, x=900, face=1.0)
        self.tai = self.rig(rigs.tai(), 21, s=1.0, layer=6, x=-500, face=1.0)
        self.sai = self.rig(rigs.person("sai"), 31, s=1.0, layer=6, x=-500, face=1.0)
        self.p = {k: self.rig(rigs.person(k), 40 + i, s=0.96, layer=5, x=-500, dim=0.92)
                  for i, k in enumerate(("mel", "dan", "ola", "client"))}
        self.small = [self.rig(rigs.person(k), 60 + i, s=0.45, layer=-2, x=-500, y=GROUND - 150, dim=0.5)
                      for i, k in enumerate(("far1", "far2", "far1"))]
        # site panels: positions on the row; their pattern can change by morphing the shape
        self.s_panels = [self.prop("panel_" + k, x, PANEL_Y, layer=2, alpha=0.0) for k, x in zip("abcd", S_STANDS)]
        P = self.prop
        self.plaque1 = P("plaque", ROOM_X - 100, TABLE_TOP - 26, s=0.88, layer=3, alpha=0.0)
        self.plaque2 = P("plaque", ROOM_X + 100, TABLE_TOP - 26, s=0.88, layer=3, alpha=0.0)
        self.order = P("shiftsheet", ROOM_X, TABLE_TOP - 70, s=0.5, layer=3, alpha=0.0)
        self.shift = P("shiftsheet", SIDE_X, 500, s=0.6, layer=7, alpha=0.0)   # Tai's shift sheet (carried)

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
            speed = 125 * a.tr.init["s"] if a.rig is rigs.rin() else 230 * a.tr.init["s"]
        d = max(0.6, abs(x1 - x0) / speed)
        face = 1.0 if x1 >= x0 else -1.0
        a.key(t, 0.25, face=face, pose=walk_pose)
        kw = {"x": x1}
        if y is not None:
            kw["y"] = y
        a.key(t + 0.25, d, **kw)
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

    def cut(self, t, cx, cy=540.0, z=1.0, light=0.0, dip=0.35):
        """Soft cut: brief fade to the background, move the camera, fade back in (dark scene unless light=1)."""
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

    def day(self, t, tint, d=2.5, k=0.26):
        """Soft colour of the day (no timers, no calendar panic): only the light changes."""
        self.st.look.key(t, d, tint=tuple(tint), tint_k=k)

    def headline(self, t0, t1, s, y=118, style="label", x=None, **kw):
        """Screen-fixed short caption (scene idea), top centre by default."""
        return self.st.cap(t0, t1, s, 960 if x is None else x, y, style, world=False, **kw)

    def label(self, t0, t1, s, x, y, style="small", **kw):
        """Caption attached to the world (follows the camera)."""
        return self.st.cap(t0, t1, s, x, y, style, world=True, **kw)

    def sfx(self, t, kind, gain=1.0):
        self.st.sound(t, kind, gain)

    def flow(self, n, t0, t1, src, dst, **kw):
        """Stream of lights; src/dst may be one point or a list of points (cycled to n)."""
        def fit(p):
            a = np.asarray(p, np.float32)
            return a if a.ndim == 1 else a[np.arange(n) % len(a)]
        return self.st.add(film.Flow(n, t0, t1, fit(src), fit(dst), **kw))

    def tmp(self, name, x, y, t_in, t_out, s=1.0, layer=4, d=0.6, alpha=1.0, **kw):
        """A prop that appears at t_in and fades at t_out (assembled from scattered lights)."""
        a = self.prop(name, x, y, s=s, layer=layer, alpha=0.0, assemble=0.0, ox=x, oy=y, **kw)
        a.key(t_in, d, alpha=alpha, assemble=1.0)
        a.key(t_out, d * 0.8, alpha=0.0)
        a.t_on, a.t_off = t_in - 0.1, t_out + d + 0.2
        return a

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


# soft colours of the days (tint of the background glow)
DAYS = {"thu": (0.70, 0.52, 0.22), "mon": (0.22, 0.32, 0.70), "tue": (0.12, 0.50, 0.52),
        "wed": (0.42, 0.26, 0.70), "fri": (0.62, 0.26, 0.52), "fri_eve": (0.40, 0.22, 0.60),
        "sat": (0.16, 0.56, 0.36), "sun": (0.70, 0.56, 0.26)}


# ------------------------------------------------------------ shared scene helpers
def msg(K, t, src, dst, d=1.3, s=0.8, hold=0.6, layer=8):
    """A message bubble assembles at src, travels to dst and fades there (a request waiting for an answer)."""
    m = K.prop("msg", src[0], src[1], s=s, layer=layer, alpha=0.0, assemble=0.0, ox=src[0], oy=src[1])
    m.key(t, 0.4, alpha=1.0, assemble=1.0)
    m.key(t + 0.45, d, x=float(dst[0]), y=float(dst[1]))
    m.key(t + 0.45 + d + hold, 0.4, alpha=0.0)
    m.t_on, m.t_off = t - 0.1, t + d + hold + 1.4
    K.sfx(t, "pop", 0.5)
    return m


def say(K, t0, t1, s, actor, dy=-40, dx=0, style="cite", size=None):
    """A short spoken line as a world caption above the actor's head (position taken at t0)."""
    st = actor.tr.at(t0)
    h = {"Rin": 330, "Tai": 470}.get(type(actor.rig).__name__, 430) * st["s"]
    return K.label(t0, t1, s, st["x"] + dx, st["y"] - h + dy, style, size=size)


def bars(K, t_end, items, x0, y, u=6.0, h=1.4, gap=6, lab_size=26):
    """Sequential horizontal bars [(value, colour, label, t_show)] from x0; returns end x and the actors."""
    x = x0
    out = []
    for v, col, lab, tt in items:
        w = v * u
        b = K.prop("bar", x + w / 2, y, layer=4, sx=w / 100, sy=h, smax=1.0, n=int(max(60, w * 30 * h / 12)),
                   tint=(col[0], col[1], col[2], 1.0), alpha=0.0)
        b.key(tt, 0.6, alpha=1.0)
        b.key(t_end - 0.45, 0.3, alpha=0.0)
        if lab:
            K.label(tt + 0.1, t_end - 0.45, lab, x + w / 2, y + 22 * h + 16, "small", size=lab_size)
        out.append(b)
        x += w + gap
    return x, out
