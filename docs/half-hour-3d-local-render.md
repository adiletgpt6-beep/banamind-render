# BalaGoHalfHour: completed native 3D film and review tools

**Current release — version 2:** picture and soundtrack from
`3eaba1d5774039c84db33ac6b174a4f893946141`, all eight parts rendered anew
without reuse in [run 37398284321](https://github.com/adiletzainidinov/balago-video/actions/runs/37398284321),
published as [balago-10-3d-3eaba1d57740](https://github.com/adiletzainidinov/balago-video/releases/tag/balago-10-3d-3eaba1d57740).

- `BalaGo_10_3D.mp4`: 1080×1920, 24,023,838 bytes,
  SHA256 `6f72868014d20ddb8eadd2f1549a7f826a4cad8811462b6e23e52c38b389e1d0`.
- `BalaGo_10_3D_mobile.mp4`: 540×960, 6,375,044 bytes,
  SHA256 `df7ce5b842006a3dd91bd5beb6fcfe04714b8ad42d983bef64efcf581d6330f9`.
- Both independently re-checked after download: H.264 High yuv420p / AAC LC
  48 kHz stereo, exactly 120 s, 3600 frames decoded with `-xerror`, no black
  frames, integrated −18.5/−18.6 LUFS, channel peaks −2.50/−2.42 dBFS.
  All 15 lines correlate > 0.996 with the cached files; speech ends at 112.32 s.
  Full report: [half-hour-3d-validation.json](half-hour-3d-validation.json).
- ASR of the final AAC: «Гүлзат эже» (m03) now recognised by all three models
  (none before); in m06 «уулума» is still heard as «окууга/окуума» by two of
  three under the music. Not a substitute for listening by a Kyrgyz speaker.

The updated video 10, `BalaGoHalfHour` («Жумуштан жарым саатка»), has been
assembled, reviewed and saved as new versions of both existing deliverables.
This is the new native Three.js/Remotion film; the rejected ce50fdaf movie
is not a source for its pictures or continuous soundtrack.

## Version 2 (October 6): faces, shots and two voice retakes

Evaluated against the delivered ce12f08 film with native Remotion stills of
every second (local SwiftShader, `renderScale` 0.5) and an ASR round trip of
all fifteen cached lines through three OpenAI transcription models.

Fixed visible problems:

- Eyes were flattened white ellipsoids with a flat iris disc in front of the
  face; in profile (boss 9–12 s, mother 40 s) they protruded beyond the head.
  They are now eyeballs seated in the skull with a spherical iris cap that
  turns with the gaze, matte highlights, skin lids resting above the iris,
  a full blink by the lid, and a short lash line.
- Adults had the child's head scaled up. Adult heads are smaller (1.10 vs
  1.20 of the rig scale), longer and narrower in the jaw; ears hidden under
  the women's hair. Brows, nose and mouth sit on the computed skin surface.
- Hair was tapered tubes with spiky tips; every character now has one closed
  hair shell with a soft hairline: mother — side part and low bun; teacher —
  bob; colleague — ponytail; men — short combed hair; boy — fuller crown.
- 35.3–37.6 s: the boy's phone shot sat inside his head; 40–41.4 s: the
  meeting glance showed the back of the mother's head; 50–54 s and 57–59 s:
  heads were cut off; 78.4–82 s: the apology showed only the mother's back;
  84.5–86 s: the chair passed through her legs while she stood. All re-shot
  or re-staged (see the commit messages for details).
- Voice: «Гүлзат эже» (m03) was not recognised by any ASR model and m06 was
  misheard by two of three. Four seeds of each were generated only for these
  lines (`.github/half-hour-retake-request.json`,
  `scripts/hh-retake-probe.mjs`); m03-s101-pause and m06-s202 were recognised
  correctly by all three models and adopted with `scripts/hh-adopt-take.mjs`
  (same trimming and loudness as the generator). The mother's voice ID,
  model and settings are unchanged; the other 13 lines are untouched.

ASR agreement is not a native speaker's judgement: Kyrgyz naturalness and
intonation still require listening by a person. An audio-capable model was
also tried as a listener; it refused or gave generic answers and was not used
as evidence.

## Previous release (ce12f08, superseded)

- Picture and continuous WAV source: `13984a289531b21b3a13d68bea13c0f51e313639`,
  [all-eight-parts run 37240358382](https://github.com/adiletzainidinov/balago-video/actions/runs/37240358382).
- Verified assembly: `c9492a22065a74eb700e1c3dbc54f32056cc2868`,
  [successful run 37245588175](https://github.com/adiletzainidinov/balago-video/actions/runs/37245588175),
  job 111562729832. Assembly verifies the source run, all nine provenance records,
  and that render sources have not changed since the picture commit.
- `BalaGo_10_3D.mp4`: 1080×1920, 25,838,932 bytes.
- `BalaGo_10_3D_mobile.mp4`: 540×960, 6,675,440 bytes.
- Both: exactly 120 seconds, 30 fps, 3600 decoded video frames, H.264 yuv420p/AAC.
- Final AAC: full −18.69 LUFS / −2.50 dBTP; mobile −18.70 LUFS / −2.42 dBTP.
- Full speech ends at 112.32 seconds; the last cached file ends at 112.64.
  The CTA occupies 114–120 seconds, including its white-background fade-in.
- Both existing file identities were retained with version 1; version 0 is
  the earlier rejected film. Checksums and complete measurements are in
  [half-hour-3d-validation.json](half-hour-3d-validation.json).

No merge into main was performed. PR #13 remains open with a conflict.
The current work is confined to scenario 10's 3D composition and its tools.

## What changed

The reused eight GLB skeletons animate new rounded procedural 3D bodies,
clothes, shoes, cheeks, layered brown eyes and capped, matte hair.
Hidden original anatomical meshes are not displayed. Joint weights and
finger connections have been corrected; the blouse hem stays within the
waistband and the backpack is rounded.

The opening turn takes the shortest yaw path and the camera follows the
mother's approach. The colleague two-shot uses live head positions. The
teacher close-up uses the +z side of her live head, with a camera-facing
dot product of 0.526–0.587. The mother’s arrival uses an elevated approach
and then a +x,+z portrait; the son's head no longer obscures her face.
The fatigue scene uses a bounded angular glance towards the office clock,
returns to work and then moves the hand to the temple. The phone is shown
on the table and picked up by the mother before completing the request.

The continuous audio, all fifteen cached Kyrgyz lines, subtitles, time cards,
ducked music, sound effects and original logo are included in the native film.
The ending remains advance registration; no completed ride, price, launch date
or unsupported safety claim has been introduced.

## Actual verification and its limits

Lint, TypeScript, all nine half-hour tests and a 120-pose gaze bound passed.
The latter measured a maximum 4.3973436 degrees per frame. Native review run
37238311780 supplied the final stills; run 37239436377 verified the corrected
arrival and fatigue clips. All ten native motion previews were inspected as
chronological frame sequences, including walking, seating and phone pickup.

Both delivered MP4s were fully decoded with FFmpeg's error-on-failure mode,
counted with ffprobe, and checked for even one black frame. All fifteen lines
and their endings were compared against the cached MP3 waveforms in each
actual AAC mix: line correlations exceed 0.996 and tail correlations exceed
0.982, with at most 0.3125 ms alignment shift. Original decoded channel peaks
are 0.750070 and 0.756579 respectively; both pass the clipping guard.

The actual assembled full MP4 was reviewed across all 120 seconds at 2 fps.
Opening, arrival, teacher, fatigue and phone sequences were inspected at 8 fps,
along with exact adjacent frames at all seven picture joins and enlarged form
and CTA frames. These are sampled visual checks and complete technical decode
checks; they are not a claim of real-time playback or perfect aesthetics.

The current runtime cannot accept audio for listening. Kyrgyz pronunciation,
intonation and subjective voice naturalness have **not** been confirmed by
auditory review. No cached voice was regenerated or accelerated in this work.

## Native render and assembly route

Run 37226850703 stalled at frame 240 because `@remotion/media` extracted audio
during a PNG render. The composition now uses supported `Html5Audio` playback
and native FFmpeg mixing. `visualOnly` removes only audio elements for stills
and silent picture parts; the manifest, lip timing, subtitles and time cards
remain active. Continuous audio and motion previews retain audio. The
28-second delay deadline was not increased.

Screen fonts finish loading before ThreeCanvas mounts. Model loading skips
embedded textures of the hidden original meshes. An inner Suspense boundary
and ready-scene draw initialize revealed assets, and one renderer worker avoids
competing cold-load tabs. Review geometry uses `renderScale=0.5`; the full film
uses `renderScale=1` and a native 1080×1920 drawing buffer.

The final workflow renders a new continuous WAV and eight 450-frame picture
parts. All new parts were rendered without `reuse_run`. Assembly can retry
postprocessing from those verified parts only while render sources are unchanged.
It measures the actual encoded AAC true peak, and the mobile audio is encoded
from the continuous WAV rather than recompressing the full MP4's AAC.

`verify-half-hour-audio.py` measures actual original stereo channels for
clipping. It uses an equal-weight 0.5(L+R) average only for reference correlation;
FFmpeg's amplified mono conversion is not mistaken for source clipping.

## Optional local geometry review

Install dependencies with `npm ci` and
`python3 -m pip install -r scripts/cpu/requirements.txt`.
All eight GLB files in `public/models`, the fifteen cached MP3s and manifest
in `public/audio/half-hour`, the original `public/assets/logo.png`,
`public/fonts/Nunito-Variable.ttf`, and
`public/assets/half-hour/bishkek-panorama-v2.png` must be present.
Package.json and package-lock.json must be restored together.

Run from the repository root:

```bash
CPU_TIMES=2,8,11,16,24,32,39,46,57.5,71,74,77,80,97,102,111 CPU_OUT=out/cpu-review node scripts/cpu/export.mjs
CPU_TIMES=2,8,11,16,24,32,39,46,57.5,71,74,77,80,97,102,111 CPU_OUT=out/cpu-review CPU_WIDTH=1080 python3 scripts/cpu/gl-render.py
```

The exporter and GL renderer also accept `CPU_RANGE=0,60` (inclusive frame
indices, 30 fps). The renderer produces a silent `motion.mp4`; its range
must remain inside 0–3419. Set `CPU_VIDEO` to override its filename.
`CPU_TIMES` produces PNGs.

This route exports actual articulated geometry, cameras, textures and poses.
Its local React adapter skips native PMREM and changes lighting. It also omits
the composition's outer time cards, subtitles, audio and CTA, so it is a
geometry review tool, not an alternative copy of the delivered full film.
Temporary bundles, out/** and downloaded archives are not committed.

Optional Blender review requires Python 3.11:

```bash
CPU_TIMES=8,34,74,102 CPU_OUT=out/cpu-review CPU_WIDTH=540 uv run --python 3.11 --with bpy==4.5.3 python scripts/cpu/render.py
```

It rebuilds the scene for each still and is not an efficient 3600-frame renderer.

## Bishkek matte

The generated, softly stylized panorama is used only in the distant window
environment; the main characters remain animated 3D geometry. The current asset
is `public/assets/half-hour/bishkek-panorama-v2.png`. It is an imagined
illustration, not a geographically verified photograph. Ordinary courtyards,
poplars, school signage, the irrigation channel, home dishes and the distant
Ala-Too ridge support the everyday city setting.

## Exact image-generation prompt

Use case: stylized-concept. Asset type: distant environment matte painting for the windows of a real animated 3D film, 16:9 landscape, full bleed. Primary request: a beautiful, convincing Bishkek city panorama facing the Kyrgyz Ala-Too mountains, seen from a modest upper-floor office in a residential neighbourhood. No window frame or interior: only the exterior view. Strong atmosphere of Kyrgyzstan in the urban architecture and vegetation. Warm cream five-to-nine storey apartment buildings with ordinary balconies, green courtyards, straight broad tree-lined streets, slender tall poplar trees, modest white cars, snow-capped Ala-Too ridge far away, blue clear soft sky. Composition: sky occupies upper 45 percent, the continuous distant snow mountain range the next 20 percent, richly detailed city and leafy trees the lower 35 percent. Style: high-quality softly stylized 3D animation environment with rounded, finished architecture and foliage, sophisticated soft global illumination and gentle atmospheric depth, coherent with cute rounded animated family characters. Warm late-morning light, fresh greens, warm pale stone and subtle sky blues. Mountains are geographically believable distant relief, not isolated triangles, giant cones or fantasy towers. No people, no text, no logos, no watermark, no transparent background. Make city buildings and poplar silhouettes clear at smaller video resolution.
