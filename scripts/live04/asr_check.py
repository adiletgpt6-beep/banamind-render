# Сверка неуверенных мест расшифровки: для отрезка записи сравниваются
# варианты текста по CTC-потере модели Meta MMS (kir). Меньше — вероятнее.
# Плюс топ-3 символа по кадрам — что модель «слышит» на самом деле.
#
#   python scripts/live04/asr_check.py in.wav checks.json
#   checks.json: [{"id", "from", "to", "candidates": [текст, …]}, …]
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from asr import SR, load  # noqa: E402


def main():
    import torch
    from transformers import AutoProcessor, Wav2Vec2ForCTC

    audio = load(sys.argv[1])
    checks = json.load(open(sys.argv[2], encoding="utf-8"))
    model_id = "facebook/mms-1b-all"
    proc = AutoProcessor.from_pretrained(model_id, target_lang="kir")
    model = Wav2Vec2ForCTC.from_pretrained(model_id, target_lang="kir", ignore_mismatched_sizes=True)
    model.eval()
    tok = proc.tokenizer
    vocab = {v: k for k, v in tok.get_vocab().items()}
    blank = tok.pad_token_id
    for c in checks:
        seg = audio[int(c["from"] * SR) : int(c["to"] * SR)]
        inputs = proc(seg, sampling_rate=SR, return_tensors="pt")
        with torch.no_grad():
            logits = model(**inputs).logits[0]
        lp = torch.log_softmax(logits, dim=-1)
        print(f"\n=== {c['id']} ({c['from']}–{c['to']} с)")
        res = []
        for text in c["candidates"]:
            ids = tok(text.lower()).input_ids
            unk = [vocab.get(i) for i in ids if i == tok.unk_token_id]
            loss = torch.nn.functional.ctc_loss(
                lp.unsqueeze(1), torch.tensor([ids]), torch.tensor([lp.shape[0]]), torch.tensor([len(ids)]),
                blank=blank, reduction="sum", zero_infinity=True,
            ).item()
            res.append((loss, text, unk))
        for loss, text, unk in sorted(res):
            print(f"  {loss:9.2f}  {text}{'  [UNK]' if unk else ''}")
        # что модель слышит: топ-3 по кадрам (без пустых)
        probs = lp.exp()
        line = []
        prev = None
        for i in range(probs.shape[0]):
            p, k = probs[i].topk(3)
            if int(k[0]) == blank or int(k[0]) == prev:
                prev = int(k[0])
                continue
            prev = int(k[0])
            alts = "/".join(f"{vocab[int(kk)]}{pp:.1f}" for pp, kk in zip(p.tolist(), k.tolist()) if int(kk) != blank and pp > 0.05)
            line.append(alts)
        print("  heard:", " ".join(line))


if __name__ == "__main__":
    main()
