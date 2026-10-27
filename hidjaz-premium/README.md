# hidjaz-premium — реклама 60 с (Remotion)

Отдельный проект в репозитории BalaGo: свои точка входа, шрифты, звуки
и workflow; ролики BalaGo не затрагиваются.

| Что | Где |
| --- | --- |
| Содержание (тексты, фото, реплики, палитра) | `src/content.ts` |
| Сцены 0–5 / 5–15 / 15–35 / 35–50 / 50–60 с | `src/scenes/` |
| Частицы, свет, 3D-карточка товара, кинетические титры и субтитры | `src/components/` |
| Голос ElevenLabs (eleven_v3, ky) | `src/tts.ts`, `tools/voice.mjs` |
| Оригинальная музыка и SFX (синтез кодом) | `tools/music.mjs` → `public/audio/` |
| Проверка содержания и MP4 | `tools/verify-content.mjs`, `tools/verify.mjs` |
| Сборка, Release, R2 | `.github/workflows/hidjaz-premium.yml` |

Состояние: **технический прогон** — нет подтверждённых данных о товаре.
См. `INSTAGRAM_ANALYSIS.md` и `MATERIALS_NEEDED.md`. Финал не публикуется,
пока `CONTENT.confirmed = false` (проверка `tools/verify-content.mjs`).

Локально:

```bash
node hidjaz-premium/tools/music.mjs
npx remotion studio hidjaz-premium/src/index.ts --public-dir=hidjaz-premium/public
npx remotion render hidjaz-premium/src/index.ts HidjazPremiumAd out/hidjaz-premium-final.mp4 \
  --public-dir=hidjaz-premium/public --codec=h264 --audio-codec=aac --crf=16
node hidjaz-premium/tools/verify.mjs out/hidjaz-premium-final.mp4
```
