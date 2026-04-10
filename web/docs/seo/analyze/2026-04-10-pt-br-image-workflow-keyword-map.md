# PT-BR image workflow keyword map from the screenshot set

Date: 2026-04-10

## Summary

From the 19 visible Portuguese keywords in the screenshots, AnyCap can honestly support:

- 9 first-wave articles if we keep the background-removal space as one generalized page
- 11 first-wave articles if we split that background-removal intent into the same three-page cluster already used in English
- 2 stretch articles after we validate stronger proof examples

That means the realistic first answer is:

- **we can publish 9 to 11 PT-BR articles**

This is the better number to work with than the raw keyword count because several screenshot terms collapse into the same repeatable AnyCap workflow, while a few others are poor brand fit or require capability claims the product should not make.

## Capability check

Validated locally on 2026-04-10:

- `anycap status` shows `image.generate`, `image.edit`, and `image.read` enabled
- `anycap status` also shows `video.generate` and `video.read`, but there is no public `video.edit` claim in the current capability surface
- `anycap image generate --help` confirms the current image workflow supports `image-to-image`

This matters because the best PT-BR opportunities here are image-edit and image-read workflows:

- remove or replace something in an image
- inspect or describe an image
- branch a source image into several useful outputs

## Route and rollout reality

The site already supports `pt-br` as a locale, and the current learn cluster already has localized route wrappers for:

- `/learn/how-to-make-image-transparent`
- `/learn/how-to-change-photo-background`
- `/learn/how-to-make-background-white-for-product-photos`

But the default SEO rollout is still English-first, so PT-BR visibility still depends on:

- adding the right route keys to the PT-BR rollout config
- translating or adapting the actual page copy instead of only exposing the locale path

That makes the background-removal cluster the fastest PT-BR win in this set.

## Visible input set

The screenshots show 19 visible keyword rows:

- `como tirar sombra de foto`
- `remover pessoas da foto`
- `como apagar fotos do celular`
- `como apagar pessoa da foto iphone`
- `como excluir fotos do facebook`
- `esvaziar lixeira android`
- `como apagar todas as fotos do google fotos`
- `como remover fundo de foto no iphone`
- `tirar roupa ia`
- `remover emoji de foto`
- `remover legenda de vídeo online grátis`
- `descrever imagem`
- `como saber o tamanho de uma imagem`
- `identificar fonte`
- `como tirar reflexo de luz da foto`
- `como colocar sorriso na foto online grátis`
- `upar imagem sem perder qualidade`
- `clarear foto online`
- `fundo branco`

The hidden `+1 more` and `+2 more` variants were not counted in the totals above.

## Keep, merge, and drop

### Keep now

These are strong AnyCap fits because they map cleanly to image edit or image read workflows and can be demonstrated with real proof assets:

- `remover pessoas da foto`
- `como apagar pessoa da foto iphone`
- `remover emoji de foto`
- `como tirar sombra de foto`
- `como tirar reflexo de luz da foto`
- `clarear foto online`
- `upar imagem sem perder qualidade`
- `descrever imagem`
- `identificar fonte`
- `fundo branco`
- `como remover fundo de foto no iphone`

### Merge into one article where needed

- `remover pessoas da foto` + `como apagar pessoa da foto iphone`
  - one page, with iPhone handled as a section or FAQ, not a separate slug
- `fundo branco` + `como remover fundo de foto no iphone`
  - one generalized background-intent page in the conservative version
  - three pages in the preferred cluster version

### Defer or drop

- `como apagar fotos do celular`
  - device-help intent, not an AnyCap workflow
- `como excluir fotos do facebook`
  - platform-help intent, weak product fit
- `esvaziar lixeira android`
  - OS-help intent, not an agent-capability story
- `como apagar todas as fotos do google fotos`
  - platform-help intent, not a media-capability workflow
- `tirar roupa ia`
  - brand-risk and trust-risk; should not be part of the content plan
- `remover legenda de vídeo online grátis`
  - defer until the public site can honestly claim video editing, not only generation and reading

## First-wave article map

### Conservative first wave: 9 pages

| PT-BR angle | Suggested slug | Source keywords | Proof asset |
| --- | --- | --- | --- |
| Como remover pessoas da foto com IA | `/learn/how-to-remove-people-from-photos` | `remover pessoas da foto`, `como apagar pessoa da foto iphone` | before/after object-removal pair |
| Como remover emoji de foto com IA | `/learn/how-to-remove-emoji-from-photos` | `remover emoji de foto` | before/after emoji-removal pair |
| Como tirar sombra de foto com IA | `/learn/how-to-remove-shadows-from-photos` | `como tirar sombra de foto` | shadow cleanup pair |
| Como tirar reflexo de luz da foto com IA | `/learn/how-to-remove-light-reflection-from-photos` | `como tirar reflexo de luz da foto` | glare/reflection cleanup pair |
| Como clarear foto online com IA | `/learn/how-to-brighten-a-photo-online` | `clarear foto online` | dark-to-bright corrected pair |
| Como aumentar imagem sem perder qualidade com IA | `/learn/how-to-upscale-an-image-without-losing-quality` | `upar imagem sem perder qualidade` | low-res to improved-res comparison |
| Como descrever imagem com um agente de IA | `/learn/how-to-describe-an-image` | `descrever imagem` | source image plus generated description block |
| Como identificar fonte por imagem com IA | `/learn/how-to-identify-font-from-an-image` | `identificar fonte` | source image plus font-shortlist output |
| Como remover ou trocar o fundo da foto com IA | `/learn/how-to-remove-photo-background` | `fundo branco`, `como remover fundo de foto no iphone` | background-removal proof pair |

### Preferred first wave: 11 pages

This is the better version because the site already has an English background-removal cluster, and the Portuguese market should inherit that cluster shape instead of collapsing everything into one generic page.

Keep the eight non-background pages above, then split the background intent into these three pages:

| PT-BR angle | Suggested slug | Why this split is better |
| --- | --- | --- |
| Como remover fundo de imagem com IA | `/learn/how-to-make-image-transparent` | best for transparent-cutout intent |
| Como trocar fundo de foto com IA | `/learn/how-to-change-photo-background` | best for replacement-scene intent |
| Como deixar fundo branco em foto de produto com IA | `/learn/how-to-make-background-white-for-product-photos` | best for white-background and catalog intent |

That turns the first wave into:

- 8 new PT-BR article concepts
- 3 fast PT-BR adaptations from the existing English background cluster

## Stretch pages after proof

These are possible, but should not be in the first launch batch:

- `como saber o tamanho de uma imagem`
  - technically possible, but weak leverage compared with stronger edit and read workflows
- `como colocar sorriso na foto online grátis`
  - possible as an image-edit experiment, but the quality bar and identity-preservation expectation are higher

## E-E-A-T and AI-citation fit

These pages are strong content candidates only if they follow the current AnyCap learn-page pattern:

- answer-first intro in PT-BR
- real proof assets generated through AnyCap
- command examples that show the actual workflow
- QA or inspection section showing the agent verifying the result
- explicit model-choice guidance
- internal links back to image generation, image understanding, install, and model pages

This is what makes the content credible instead of generic AI-SEO filler.

## Recommendation

If the goal is to move fast in PT-BR, the best rollout order is:

1. ship the 3-page background cluster in PT-BR first because the English pages and proof assets already exist
2. add 3 cleanup pages next:
   - remove people
   - remove emoji
   - remove shadows
3. add 3 understanding-and-enhancement pages after that:
   - describe image
   - identify font
   - brighten or upscale image

That gives the team a practical first milestone:

- **phase 1: 3 fast PT-BR pages**
- **phase 2: expand to 9 pages**
- **phase 3: reach the full 11-page first-wave cluster**
