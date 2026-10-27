# Слепая оценка проб голосов аудиомоделью OpenAI (роль не сообщается) — дополнительный
# источник замечаний, не замена прослушиванию человеком. Запуск:
#   python3 scripts/t3b-blind-judge.py 3 voice-samples/third-b-meeting-2d/probe/*.mp3
import base64, json, subprocess, sys, os
PROMPT = os.environ.get("P") or ("Listen to this short Kyrgyz-language recording. Do not guess any story context. Answer as compact JSON: "
  '{"age_years": apparent age, "group": "child|teen|young adult|adult|older adult", "gender": "female|male", '
  '"sounds_like_child_8_10": true/false, "naturalness_1_5": n, "accent_issues": "short", "timbre": "3-6 words"}')
model = os.environ.get("M", "gpt-audio-1.5")
n = int(sys.argv[1])
body_path = "/tmp/t3b-judge-body.json"
for f in sys.argv[2:]:
    b64 = base64.b64encode(open(f, "rb").read()).decode()
    for _ in range(n):
        body = {"model": model, "modalities": ["text"], "temperature": 1, "messages": [{"role": "user", "content": [
            {"type": "text", "text": PROMPT}, {"type": "input_audio", "input_audio": {"data": b64, "format": "mp3"}}]}]}
        json.dump(body, open(body_path, "w"))
        out = subprocess.run(["curl", "-sS", "https://api.openai.com/v1/chat/completions", "-H", "Content-Type: application/json", "--data-binary", "@" + body_path], capture_output=True, text=True).stdout
        try:
            j = json.loads(out)
            print(os.path.basename(f), "→", (j["choices"][0]["message"]["content"] if "choices" in j else json.dumps(j)[:300]).replace("\n", " "))
        except Exception:
            print(os.path.basename(f), "→ ERR", out[:300])
