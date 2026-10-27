"""Chapter scripts. Each module chNN.build(st) adds key-frames, lights, captions and sound cues.
Persistent actors (the fox and the recurring objects) are created once here."""
import importlib

import kit
from film import FoxActor


def build_all(st):
    st.nox = st.add(FoxActor())
    # recurring objects: vessel (what remains), compass (direction), bridge (reserve/room for error),
    # box with the circular lock (the hidden wish)
    st.jar = kit.obj(st, "jar", 1500, seed=1, layer=3)
    st.jarfill = kit.obj(st, "jar_fill", 1400, seed=2, layer=3, level=0.0)
    st.box = kit.obj(st, "box", 2200, seed=3, layer=3)
    st.lock = kit.obj(st, "lock", 700, seed=4, layer=4)
    st.tower = kit.obj(st, "tower", 3200, seed=5, layer=1)
    st.compass = kit.obj(st, "compass", 1600, seed=6, layer=3)
    st.bridge = kit.obj(st, "bridge", 3000, seed=7, layer=2)
    st.ground = kit.obj(st, "ground", 700, seed=8, layer=0, x=960, y=kit.GROUND + 8)
    for ch in st.T.chapters:
        kit.chapter_card(st, ch)
        try:
            mod = importlib.import_module(f"scenes.ch{ch['index']:02d}")
        except ModuleNotFoundError:
            continue
        mod.build(st)
