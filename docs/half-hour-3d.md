# «Жумуштан жарым саатка» — 3D

Composition `BalaGoHalfHour`: 120 seconds, 1080×1920, 30 fps. The mother is
torn between work and collecting her son from school; at home the family
fills in a preliminary BalaGo registration. The film does not show a
confirmed booking or promise that the service is already operating.

The character surfaces are authored in `src/half-hour/three/design.ts`.
They share the existing MakeHuman bone rig but replace the anatomical face
and cut-out clothing meshes with soft shapes and continuous fabric. Poses,
gaze, blinking, mouth shapes and prop movement are functions of the current
frame. Cached bind proportions must never be measured from a seated pose.

The setting includes an Ala-Too view, shaded school courtyard, poplars,
irrigation channels, Kyrgyz signs, tea bowls and a textile ornament.
Kyrgyz subtitles follow the actual speech timestamps.

All 15 paid dialogue takes and the manifest are stored in
`public/audio/half-hour`. Six custom Kyrgyz voice IDs are configured in
`src/half-hour/script.ts`. Reuse those takes; do not run the old candidate
probe scripts during ordinary renders. Audio timing, completeness and
levels are checked automatically. Pronunciation and performance still
require human listening.

## Review and render

`npm run lint` and `npm run test:half-hour` validate the project and timing.
The **Half-hour 3D review** workflow produces selected stills on the 3D
branches. `scripts/render-half-hour-polish.mjs` can also render motion clips;
set `HH_STILLS_ONLY=false` and supply comma-separated `HH_REVIEW_FRAMES`.

Run **Half-hour 3D final film** manually on the desired 3D branch to export
the full movie. It renders eight silent 450-frame parts, then joins them
with one continuous audio master. Both full-size and phone-size MP4s are
produced. The assembly checks 3600 frames and exactly 120 seconds, applies
a constant master gain with true-peak headroom, and creates a contact sheet
at half-second intervals. Full-file artifact pieces are byte chunks, not
independently playable clips; concatenate them in numeric order.

This work changes the 3D composition only; 2D work belongs to its separate
branch and conversation.
