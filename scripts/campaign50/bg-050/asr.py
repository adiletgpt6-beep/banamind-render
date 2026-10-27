# Технический замер озвучки BalaGoBG050:
#   • разборчивость кыргызской речи — модель Meta MMS (facebook/mms-1b-all,
#     адаптер "kir"): доля ошибок по буквам (CER) относительно сценария;
#   • основной тон (медиана F0, Гц) — чтобы голоса мамы, папы, сына и диктора
#     различались по высоте.
# Это не проверка на слух: акцент и естественность интонации модель не
# оценивает, но неразборчивые и искажённые слова дают высокий CER.
#
#   python scripts/campaign50/bg-050/asr.py --score in.json out.json
#       in.json: [{"path": …, "text": …}, …] →
#       out.json: [{"path", "heard", "cer", "f0"}, …]
import json
import re
import subprocess
import sys


def norm(s: str) -> str:
    s = s.lower().replace("balago", "балаго").replace("ё", "е")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def lev(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def cer(ref: str, hyp: str) -> float:
    r, h = norm(ref), norm(hyp)
    return round(lev(r, h) / max(1, len(r)), 3)


def load(path: str):
    import numpy as np

    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32)


def median_f0(audio) -> float:
    """Медиана основного тона по озвученным кадрам (автокорреляция)."""
    import numpy as np

    sr = 16000
    win, hop = 640, 160  # 40 мс / 10 мс
    lo, hi = sr // 500, sr // 65
    rms_all = np.sqrt(np.mean(audio**2) + 1e-12)
    f0s = []
    for i in range(0, len(audio) - win, hop):
        fr = audio[i : i + win] * np.hanning(win)
        if np.sqrt(np.mean(fr**2)) < 0.5 * rms_all:
            continue
        ac = np.correlate(fr, fr, mode="full")[win - 1 :]
        if ac[0] <= 0:
            continue
        ac = ac / ac[0]
        seg = ac[lo:hi]
        k = int(np.argmax(seg))
        if seg[k] > 0.45:
            f0s.append(sr / (lo + k))
    return round(float(np.median(f0s)), 1) if f0s else 0.0


_model = None


def recognizer():
    global _model
    if _model is None:
        import torch
        from transformers import AutoProcessor, Wav2Vec2ForCTC

        model_id = "facebook/mms-1b-all"
        processor = AutoProcessor.from_pretrained(model_id, target_lang="kir")
        model = Wav2Vec2ForCTC.from_pretrained(model_id, target_lang="kir", ignore_mismatched_sizes=True)
        model.eval()
        _model = (processor, model, torch)
    return _model


def transcribe(audio) -> str:
    processor, model, torch = recognizer()
    inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        logits = model(**inputs).logits
    return processor.decode(torch.argmax(logits, dim=-1)[0])


def main() -> None:
    if len(sys.argv) != 4 or sys.argv[1] != "--score":
        print("usage: ts2d_asr.py --score in.json out.json")
        sys.exit(2)
    items = json.load(open(sys.argv[2], encoding="utf-8"))
    res = []
    for it in items:
        audio = load(it["path"])
        heard = transcribe(audio)
        r = {"path": it["path"], "heard": heard, "cer": cer(it["text"], heard), "f0": median_f0(audio)}
        res.append(r)
        print(f"  {it['path']}: CER {r['cer']}, F0 {r['f0']} Гц — «{heard}»")
    json.dump(res, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
