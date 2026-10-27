"""Publish only manually reviewed, checksum-verified new video artifacts."""
import hashlib
import json
import os
import re
import subprocess
import time
from pathlib import Path

def gh(args, required=True):
    r = subprocess.run(["gh", *args], capture_output=True, text=True)
    if required and r.returncode:
        raise RuntimeError(r.stderr)
    return r

request = json.loads(Path(".github/half-hour-release-request.json").read_text())
assert request["review_complete"] is True
commit = request["render_commit"]
assert re.fullmatch(r"[0-9a-f]{40}", commit)
report = json.loads(Path("release-review/validation.json").read_text())
assert {p["commit"] for p in [*report["provenance"], report["audio_provenance"]]} == {commit}
assert report["video"]["streams"][0]["nb_read_frames"] == "3600"
assert report["mobile"]["streams"][0]["nb_read_frames"] == "3600"
assert float(report["final_audio"]["input_tp"]) < -0.8
assert float(report["mobile_audio"]["input_tp"]) < -0.8
assert len(report["dialogue_checks"]["lines"]) == 15
assert report["dialogue_checks"]["last_speech_end_sec"] < 114
assets = Path("release-assets")
files = [assets / "BalaGo_10_3D.mp4", assets / "BalaGo_10_3D_mobile.mp4"]
for p in files:
    assert hashlib.sha256(p.read_bytes()).hexdigest() == report["sha256"][p.name]
tag = "balago-10-3d-" + commit[:12]
repo = os.environ["GITHUB_REPOSITORY"]
api_path = f"repos/{repo}/releases/tags/{tag}"

def get_release():
    # Authenticated release lists include drafts even before their tag is published.
    rows = json.loads(gh(["api", f"repos/{repo}/releases?per_page=100"]).stdout)
    return next((r for r in rows if r["tag_name"] == tag), None)

if get_release() is None:
    notes = Path("release-notes.md")
    notes.write_text(
        "Новая 3D-версия десятого сценария «Жумуштан жарым саатка».\n\n"
        "120 секунд, 30 кадров/с, H.264/AAC; 1080×1920 и 540×960. "
        "Проверены декодирование 3600 кадров, отсутствие чёрных отрезков, "
        "тайминги и наличие всех 15 реплик с окончаниями, громкость и истинный пик. "
        "Протокол с SHA-256 приложен в validation.json.\n\n"
        "Естественность кыргызского произношения не подтверждена слуховой проверкой. "
        "Исходники: " + commit + ".\n", encoding="utf-8")
    gh(["release", "create", tag, "--draft", "--target", commit, "--title",
        "BalaGo — сценарий 10, новая 3D-версия", "--notes-file", str(notes)])
# The release list is eventually consistent: a draft created a moment ago
# may not be listed yet.
release = None
for delay in (0, 2, 4, 8, 16, 30):
    time.sleep(delay)
    release = get_release()
    if release is not None:
        break
assert release is not None
assert release["target_commitish"] == commit
names = {a["name"] for a in release["assets"]}
for p in [*files, Path("release-review/validation.json")]:
    if p.name not in names:
        gh(["release", "upload", tag, str(p)])
verify = Path("release-verify")
verify.mkdir(exist_ok=True)
for p in files:
    gh(["release", "download", tag, "--dir", str(verify), "--pattern", p.name, "--clobber"])
    assert hashlib.sha256((verify / p.name).read_bytes()).hexdigest() == report["sha256"][p.name]
gh(["release", "edit", tag, "--draft=false"])
published = get_release()
assert published is not None
assert published["draft"] is False
links = {a["name"]: a["browser_download_url"] for a in published["assets"] if a["name"].endswith(".mp4")}
assert set(links) == {p.name for p in files}
print("HH_VIDEO_LINKS " + json.dumps({"tag": tag, "release": published["html_url"], "files": links}), flush=True)
