"""All TB-003 scenes, executed in screenplay order on one Stage."""
import importlib

from kit import Kit

MODULES = ["a01_a03", "a04_a05", "a06_a07", "a08_a09"]


def build_all(st):
    K = Kit(st)
    st.kit = K
    table = {}
    for m in MODULES:
        try:
            mod = importlib.import_module(f"scenes.{m}")
        except ModuleNotFoundError as e:
            if e.name == f"scenes.{m}":
                continue
            raise
        table.update(mod.SCENES)
    for sc in st.T.scenes:
        fn = table.get(sc["id"])
        if fn:
            fn(K, sc)
        st.mark(sc["t0"], sc["id"])
    # small part label at the start of each of the 9 parts (not a full-screen title)
    for p in st.T.parts:
        t0 = st.T.part_times[p["id"]] + (0.6 if p["index"] > 1 else 3.0)
        st.cap(t0, t0 + 4.5, f"_{p['index']:02d}_  {p['title']}", 96, 70, "chapter", align="left", world=False)
    return K
