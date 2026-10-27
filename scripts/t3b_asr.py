# Технический замер озвучки BalaGoThirdBMeeting2D:
#   • разборчивость кыргызской речи — модель Meta MMS (facebook/mms-1b-all,
#     адаптер "kir"): доля ошибок по буквам (CER) относительно сценария;
#   • основной тон (медиана F0, Гц) — чтобы голоса мамы, папы и дочки
#     различались по высоте.
#   • профиль голоса (возраст, вероятности «женщина / мужчина / ребёнок») —
#     модель audeering/wav2vec2-large-robust-24-ft-age-gender: низкий CER
#     не доказывает подходящий возраст и тембр, поэтому дубль голоса сына
#     с явно взрослым женским профилем отбраковывается.
# Это не проверка на слух: акцент и естественность интонации модели не
# оценивают, но неразборчивые и искажённые слова дают высокий CER, а
# профиль показывает явное несовпадение возраста/пола.
#
#   python scripts/t3b_asr.py --score in.json out.json
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


_profile = None


def profiler():
    global _profile
    if _profile is None:
        import torch
        import torch.nn as nn
        from transformers import Wav2Vec2Processor
        from transformers.models.wav2vec2.modeling_wav2vec2 import Wav2Vec2Model, Wav2Vec2PreTrainedModel

        class Head(nn.Module):
            def __init__(self, config, n):
                super().__init__()
                self.dense = nn.Linear(config.hidden_size, config.hidden_size)
                self.dropout = nn.Dropout(config.final_dropout)
                self.out_proj = nn.Linear(config.hidden_size, n)

            def forward(self, x):
                x = self.dropout(x)
                x = torch.tanh(self.dense(x))
                x = self.dropout(x)
                return self.out_proj(x)

        class AgeGender(Wav2Vec2PreTrainedModel):
            def __init__(self, config):
                super().__init__(config)
                self.config = config
                self.wav2vec2 = Wav2Vec2Model(config)
                self.age = Head(config, 1)
                self.gender = Head(config, 3)
                self.post_init()

            def forward(self, x):
                h = torch.mean(self.wav2vec2(x)[0], dim=1)
                return self.age(h), torch.softmax(self.gender(h), dim=1)

        model_id = "audeering/wav2vec2-large-robust-24-ft-age-gender"
        processor = Wav2Vec2Processor.from_pretrained(model_id)
        model = AgeGender.from_pretrained(model_id)
        model.eval()
        _profile = (processor, model, torch)
    return _profile


def voice_profile(audio) -> dict:
    """Возраст (лет) и вероятности female / male / child по модели audeering."""
    try:
        processor, model, torch = profiler()
        x = processor(audio, sampling_rate=16000).input_values[0]
        with torch.no_grad():
            age, g = model(torch.tensor(x).reshape(1, -1))
        g = g[0].tolist()
        return {"age": round(float(age[0][0]) * 100, 1), "female": round(g[0], 3), "male": round(g[1], 3), "child": round(g[2], 3)}
    except Exception as e:  # модель недоступна — профиль не считается
        print(f"  ⚠ профиль голоса недоступен: {e}")
        return {}


def main() -> None:
    if len(sys.argv) != 4 or sys.argv[1] != "--score":
        print("usage: t3b_asr.py --score in.json out.json")
        sys.exit(2)
    items = json.load(open(sys.argv[2], encoding="utf-8"))
    res = []
    for it in items:
        audio = load(it["path"])
        heard = transcribe(audio)
        r = {"path": it["path"], "heard": heard, "cer": cer(it["text"], heard), "f0": median_f0(audio), "profile": voice_profile(audio)}
        res.append(r)
        print(f"  {it['path']}: CER {r['cer']}, F0 {r['f0']} Гц, профиль {r['profile']} — «{heard}»")
    json.dump(res, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
