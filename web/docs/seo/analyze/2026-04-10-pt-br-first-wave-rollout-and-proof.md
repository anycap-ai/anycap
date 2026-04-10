# PT-BR first-wave rollout and proof brief

Date: 2026-04-10

Related:

- `web/docs/seo/analyze/2026-04-10-pt-br-image-workflow-keyword-map.md`
- `docs/plans/2026-04-09-background-removal-learn-cluster.md`

## Executive summary

The Portuguese screenshot set can support an **11-page first wave** for AnyCap if we keep the site honest about product fit and keep the content workflow-led.

The best launch shape is:

- **3 existing English workflow pages adapted into real PT-BR content**
- **8 new PT-BR article concepts**
- **3 proof-backed asset pairs already generated through AnyCap on 2026-04-10**

The three strongest proof-backed launch candidates are:

1. `fundo branco`
2. `remover pessoas da foto`
3. `clarear foto online`

Implementation status after this brief:

- the 3-page background cluster is now implemented as real locale-aware page copy for `pt-br`
- all three background-cluster routes are included in the PT-BR SEO rollout
- `remover pessoas da foto` is now implemented as a real locale-aware page with published proof images
- `clarear foto online` is now implemented as a real locale-aware page with published proof images
- both new proof-backed routes are included in the PT-BR SEO rollout

## Important rollout constraint

Only enable PT-BR SEO indexing for learn pages once the wrapper points at locale-aware content, not just a translated path.

Current first-wave pages that already meet that bar:

- `/learn/how-to-make-image-transparent`
- `/learn/how-to-change-photo-background`
- `/learn/how-to-make-background-white-for-product-photos`
- `/learn/how-to-remove-people-from-photos`
- `/learn/how-to-brighten-a-photo-online`

So the rollout rule stays the same:

1. create PT-BR body copy or locale-aware content objects
2. validate the PT-BR page quality
3. then add the route keys to `seo-locale-rollout.ts`

## Recommended first-wave order

### P0: first pages to ship

These have the clearest product truth and the strongest proof story.

| Priority | PT-BR title direction | Suggested slug | Source keywords | Notes |
| --- | --- | --- | --- | --- |
| P0-1 | Como deixar fundo branco em foto de produto com IA | `/learn/how-to-make-background-white-for-product-photos` | `fundo branco` | existing page, strongest visible demand, proof ready |
| P0-2 | Como remover pessoas da foto com IA | `/learn/how-to-remove-people-from-photos` | `remover pessoas da foto`, `como apagar pessoa da foto iphone` | new page, strong visual before/after proof |
| P0-3 | Como clarear foto online com IA | `/learn/how-to-brighten-a-photo-online` | `clarear foto online` | new page, proof ready from brighten workflow |
| P0-4 | Como remover fundo de imagem com IA | `/learn/how-to-make-image-transparent` | `como remover fundo de foto no iphone` | existing page, strong cluster anchor |
| P0-5 | Como trocar fundo de foto com IA | `/learn/how-to-change-photo-background` | `fundo branco` adjacent replacement intent | existing page, completes the background cluster |

### P1: second wave after launch

These are good fits, but they are slightly less central than the first five.

| Priority | PT-BR title direction | Suggested slug | Source keywords | Notes |
| --- | --- | --- | --- | --- |
| P1-1 | Como remover emoji de foto com IA | `/learn/how-to-remove-emoji-from-photos` | `remover emoji de foto` | selective removal workflow |
| P1-2 | Como tirar sombra de foto com IA | `/learn/how-to-remove-shadows-from-photos` | `como tirar sombra de foto` | cleanup workflow, likely needs a dedicated proof pair |
| P1-3 | Como tirar reflexo de luz da foto com IA | `/learn/how-to-remove-light-reflection-from-photos` | `como tirar reflexo de luz da foto` | cleanup workflow, good visual demo if proof is strong |
| P1-4 | Como aumentar imagem sem perder qualidade com IA | `/learn/how-to-upscale-an-image-without-losing-quality` | `upar imagem sem perder qualidade` | enhancement workflow |
| P1-5 | Como identificar fonte por imagem com IA | `/learn/how-to-identify-font-from-an-image` | `identificar fonte` | image-read workflow, high visible demand |
| P1-6 | Como descrever imagem com um agente de IA | `/learn/how-to-describe-an-image` | `descrever imagem` | image-read workflow, strong answer-first format |

## Keyword merges and guardrails

Keep these merges:

- `remover pessoas da foto` + `como apagar pessoa da foto iphone`
  - one page, with iPhone as a section, FAQ, or comparison table
- `fundo branco` should not become a thin generic page
  - route it into the existing background-removal cluster

Keep these exclusions:

- `tirar roupa ia`
  - trust and brand risk
- `como apagar fotos do celular`
- `como excluir fotos do facebook`
- `como apagar todas as fotos do google fotos`
- `esvaziar lixeira android`
  - device-help or platform-help, not AnyCap workflow content
- `remover legenda de vídeo online grátis`
  - defer until the site can honestly support a public video-edit claim

## Proof assets generated on 2026-04-10

Working directory:

- `/Users/tyluo/go/src/engineering/anycap/tmp/seo/pt-br-2026-04-10`

### 1. White-background product photo

Files:

- source: `background-white-source.png`
- result: `background-white-result.png`

Intended page:

- `/learn/how-to-make-background-white-for-product-photos`

QA summary from `anycap actions image-read`:

- the busy desk background became a clean white ecommerce background
- the same cream shoe identity was preserved
- knit texture, laces, outsole, and silhouette were preserved
- the output is strong proof, with one minor note that the shoe orientation flipped horizontally

Verdict:

- strong enough to use as launch proof for the PT-BR white-background article

### 2. Remove people from photo

Files:

- source: `remove-people-source.png`
- result: `remove-people-result.png`

Intended page:

- `/learn/how-to-remove-people-from-photos`

QA summary from `anycap actions image-read`:

- the woman in the red jacket was removed successfully
- the remaining man stayed natural in the frame
- the stone railing was reconstructed cleanly
- the ocean overlook and background stayed coherent

Verdict:

- strong enough to use as launch proof for the PT-BR people-removal article

### 3. Brighten photo online

Files:

- source: `remove-shadow-source.png`
- result: `brighten-photo-result.png`

Intended page:

- `/learn/how-to-brighten-a-photo-online`

QA summary from `anycap actions image-read`:

- the portrait was brightened, especially in the midtones
- the harsh facial shadow was significantly softened
- the same subject, pose, and framing were preserved
- the composition remained unchanged

Verdict:

- strong enough to use as launch proof for a `clarear foto online` page
- this is a better first launch angle than a harder `remove shadow perfectly` claim

## What this means for implementation

### Shortest path this week

1. create PT-BR copy for the three existing background-cluster pages
2. create one new PT-BR article for `remover pessoas da foto`
3. create one new PT-BR article for `clarear foto online`
4. only after copy exists, add those route keys to the PT-BR SEO rollout

### Recommended page messaging

Each PT-BR page should say, in product-truth terms:

- the agent handles the reasoning and the workflow
- AnyCap provides the image generation, image editing, and image reading capability layer
- the useful workflow is not one-click export, but source image -> edit -> QA -> reuse

### Reusable proof set

The generated proof assets already cover three distinct workflow types:

- environment replacement for ecommerce
- selective object removal
- quality enhancement and lighting correction

That is enough variety to make the first PT-BR cluster feel real rather than templated.
